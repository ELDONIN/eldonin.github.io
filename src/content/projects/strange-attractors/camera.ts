/* eslint-disable @typescript-eslint/no-non-null-assertion -- матрицы гарантированно 3×3 */
import type { Attractor } from './definitions'

type Matrix3 = number[][]

interface CameraState {
  enabled: boolean
  matrixOverride: Matrix3 | null
  pointerId: number | null
  dragMode: 'rotate' | 'pan' | null
  dragging: boolean
  startVector: { x: number; y: number; z: number } | null
  startMatrix: Matrix3 | null
  startClientX: number
  startClientY: number
  offsetX: number
  offsetY: number
  startOffsetX: number
  startOffsetY: number
  viewScale: number
}

const MIN_ZOOM = 0.35
const MAX_ZOOM = 10
const ZOOM_SENSITIVITY = 0.0012
const PAN_SENSITIVITY = 1
const ROTATE_SENSITIVITY = 2

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function normalizeVector3(vector: { x: number; y: number; z: number }) {
  const length = Math.hypot(vector.x, vector.y, vector.z) || 1
  return { x: vector.x / length, y: vector.y / length, z: vector.z / length }
}

function crossVector3(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) {
  return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x }
}

function dotVector3(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) {
  return a.x * b.x + a.y * b.y + a.z * b.z
}

function multiplyMatrix3(a: Matrix3, b: Matrix3): Matrix3 {
  return [
    [
      a[0]![0]! * b[0]![0]! + a[0]![1]! * b[1]![0]! + a[0]![2]! * b[2]![0]!,
      a[0]![0]! * b[0]![1]! + a[0]![1]! * b[1]![1]! + a[0]![2]! * b[2]![1]!,
      a[0]![0]! * b[0]![2]! + a[0]![1]! * b[1]![2]! + a[0]![2]! * b[2]![2]!,
    ],
    [
      a[1]![0]! * b[0]![0]! + a[1]![1]! * b[1]![0]! + a[1]![2]! * b[2]![0]!,
      a[1]![0]! * b[0]![1]! + a[1]![1]! * b[1]![1]! + a[1]![2]! * b[2]![1]!,
      a[1]![0]! * b[0]![2]! + a[1]![1]! * b[1]![2]! + a[1]![2]! * b[2]![2]!,
    ],
    [
      a[2]![0]! * b[0]![0]! + a[2]![1]! * b[1]![0]! + a[2]![2]! * b[2]![0]!,
      a[2]![0]! * b[0]![1]! + a[2]![1]! * b[1]![1]! + a[2]![2]! * b[2]![1]!,
      a[2]![0]! * b[0]![2]! + a[2]![1]! * b[1]![2]! + a[2]![2]! * b[2]![2]!,
    ],
  ]
}

function orthonormalizeMatrix3(matrix: Matrix3): Matrix3 {
  const xAxis = normalizeVector3({ x: matrix[0]![0]!, y: matrix[0]![1]!, z: matrix[0]![2]! })
  const ySeed = { x: matrix[1]![0]!, y: matrix[1]![1]!, z: matrix[1]![2]! }
  const zAxis = normalizeVector3(crossVector3(xAxis, ySeed))
  const yAxis = normalizeVector3(crossVector3(zAxis, xAxis))
  return [
    [xAxis.x, xAxis.y, xAxis.z],
    [yAxis.x, yAxis.y, yAxis.z],
    [zAxis.x, zAxis.y, zAxis.z],
  ]
}

function buildAxisAngleMatrix(axis: { x: number; y: number; z: number }, angle: number): Matrix3 {
  const normalizedAxis = normalizeVector3(axis)
  const { x, y, z } = normalizedAxis
  const cosAngle = Math.cos(angle)
  const sinAngle = Math.sin(angle)
  const t = 1 - cosAngle

  return [
    [t * x * x + cosAngle, t * x * y - sinAngle * z, t * x * z + sinAngle * y],
    [t * x * y + sinAngle * z, t * y * y + cosAngle, t * y * z - sinAngle * x],
    [t * x * z - sinAngle * y, t * y * z + sinAngle * x, t * z * z + cosAngle],
  ]
}

function buildArcballRotation(
  fromVector: { x: number; y: number; z: number },
  toVector: { x: number; y: number; z: number },
): Matrix3 {
  const dot = clamp(dotVector3(fromVector, toVector), -1, 1)
  const axis = crossVector3(fromVector, toVector)
  const axisLength = Math.hypot(axis.x, axis.y, axis.z)

  if (axisLength < 1e-6) {
    if (dot > 0.9999) return buildAxisAngleMatrix({ x: 0, y: 1, z: 0 }, 0)
    const fallbackAxis =
      Math.abs(fromVector.x) < 0.9
        ? crossVector3(fromVector, { x: 1, y: 0, z: 0 })
        : crossVector3(fromVector, { x: 0, y: 1, z: 0 })
    return buildAxisAngleMatrix(fallbackAxis, Math.PI)
  }

  return buildAxisAngleMatrix(axis, Math.acos(dot) * ROTATE_SENSITIVITY)
}

function projectPointerToArcball(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
): { x: number; y: number; z: number } {
  const rect = canvas.getBoundingClientRect()
  const radius = Math.min(rect.width, rect.height) * 0.5
  const localX = (clientX - rect.left - rect.width * 0.5) / radius
  const localY = (rect.height * 0.5 - (clientY - rect.top)) / radius
  const lengthSquared = localX * localX + localY * localY

  if (lengthSquared <= 1) {
    return { x: localX, y: localY, z: Math.sqrt(1 - lengthSquared) }
  }

  const normalizedXY = normalizeVector3({ x: localX, y: localY, z: 0 })
  return { x: normalizedXY.x, y: normalizedXY.y, z: 0 }
}

function getCameraMatrix(camera: Attractor['camera']): Matrix3 {
  return camera.matrix.map((row) => row.slice())
}

function getViewPreset(view: Attractor['view']): { offsetX: number; offsetY: number; scale: number } {
  return { offsetX: view.offsetX, offsetY: view.offsetY, scale: view.scale }
}

export interface CameraController {
  state: CameraState
  getActiveCamera(): { matrix: Matrix3 }
  getActiveView(): { offsetX: number; offsetY: number; scale: number }
  setCameraModeEnabled(enabled: boolean): void
  resetCameraModeOffsets(): void
  startCameraDrag(event: PointerEvent): void
  updateCameraDrag(event: PointerEvent): void
  stopCameraDrag(): void
  handleCameraWheel(event: WheelEvent): void
  handleCameraDoubleClick(event: MouseEvent): void
  handleCanvasContextMenu(event: Event): void
  handlePointerLeave(event: PointerEvent): void
  isRotationDragActive(): boolean
}

export function createCameraController(
  canvas: HTMLCanvasElement,
  getCurrentAttractor: () => Attractor,
): CameraController {
  const state: CameraState = {
    enabled: false,
    matrixOverride: null,
    pointerId: null,
    dragMode: null,
    dragging: false,
    startVector: null,
    startMatrix: null,
    startClientX: 0,
    startClientY: 0,
    offsetX: 0,
    offsetY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
    viewScale: 1,
  }

  function syncCursor(): void {
    if (!state.enabled) canvas.style.cursor = 'default'
    else canvas.style.cursor = state.dragging ? 'grabbing' : 'grab'
  }

  function getActiveCamera(): { matrix: Matrix3 } {
    const { camera } = getCurrentAttractor()
    const matrix = state.matrixOverride ?? getCameraMatrix(camera)
    return { matrix }
  }

  function getActiveView(): { offsetX: number; offsetY: number; scale: number } {
    return { offsetX: state.offsetX, offsetY: state.offsetY, scale: state.viewScale }
  }

  function stopCameraDrag(): void {
    if (state.pointerId !== null) {
      try {
        canvas.releasePointerCapture(state.pointerId)
      } catch {
        // Захват уже снят — игнорируем.
      }
    }
    state.pointerId = null
    state.dragMode = null
    state.dragging = false
    state.startVector = null
    state.startMatrix = null
    state.startClientX = 0
    state.startClientY = 0
    syncCursor()
  }

  function resetCameraModeOffsets(): void {
    const { camera, view } = getCurrentAttractor()
    state.matrixOverride = getCameraMatrix(camera)
    const preset = getViewPreset(view)
    state.offsetX = preset.offsetX
    state.offsetY = preset.offsetY
    state.viewScale = clamp(preset.scale, MIN_ZOOM, MAX_ZOOM)
    syncCursor()
  }

  function setCameraModeEnabled(enabled: boolean): void {
    state.enabled = enabled
    if (!enabled) stopCameraDrag()
    syncCursor()
  }

  function startCameraDrag(event: PointerEvent): void {
    if (!state.enabled || state.dragging) return
    event.preventDefault()
    const activeCamera = getActiveCamera()
    const isPanDrag = event.button === 1 || event.button === 2

    state.pointerId = event.pointerId
    state.dragMode = isPanDrag ? 'pan' : 'rotate'
    state.dragging = true
    state.startClientX = event.clientX
    state.startClientY = event.clientY
    state.startOffsetX = state.offsetX
    state.startOffsetY = state.offsetY
    state.startVector = isPanDrag
      ? null
      : projectPointerToArcball(canvas, event.clientX, event.clientY)
    state.startMatrix = isPanDrag ? null : activeCamera.matrix.map((row) => row.slice())
    canvas.setPointerCapture(event.pointerId)
    syncCursor()
  }

  function updateCameraDrag(event: PointerEvent): void {
    if (!state.enabled || !state.dragging || event.pointerId !== state.pointerId) return

    if (state.dragMode === 'pan') {
      state.offsetX = state.startOffsetX + (event.clientX - state.startClientX) * PAN_SENSITIVITY
      state.offsetY = state.startOffsetY + (event.clientY - state.startClientY) * PAN_SENSITIVITY
    } else if (state.startVector && state.startMatrix) {
      const currentVector = projectPointerToArcball(canvas, event.clientX, event.clientY)
      const deltaRotation = buildArcballRotation(state.startVector, currentVector)
      state.matrixOverride = orthonormalizeMatrix3(multiplyMatrix3(deltaRotation, state.startMatrix))
    }

    syncCursor()
  }

  function handleCameraWheel(event: WheelEvent): void {
    if (!state.enabled) return
    event.preventDefault()
    const zoomFactor = Math.exp(-event.deltaY * ZOOM_SENSITIVITY)
    state.viewScale = clamp(state.viewScale * zoomFactor, MIN_ZOOM, MAX_ZOOM)
    syncCursor()
  }

  function handleCameraDoubleClick(event: MouseEvent): void {
    if (!state.enabled || event.button !== 0) return
    event.preventDefault()
    stopCameraDrag()
    resetCameraModeOffsets()
  }

  function handleCanvasContextMenu(event: Event): void {
    if (!state.enabled) return
    event.preventDefault()
  }

  function handlePointerLeave(event: PointerEvent): void {
    if (!state.dragging || event.pointerId !== state.pointerId) return
    stopCameraDrag()
  }

  function isRotationDragActive(): boolean {
    return state.enabled && state.dragging && state.dragMode === 'rotate'
  }

  return {
    state,
    getActiveCamera,
    getActiveView,
    setCameraModeEnabled,
    resetCameraModeOffsets,
    startCameraDrag,
    updateCameraDrag,
    stopCameraDrag,
    handleCameraWheel,
    handleCameraDoubleClick,
    handleCanvasContextMenu,
    handlePointerLeave,
    isRotationDragActive,
  }
}
