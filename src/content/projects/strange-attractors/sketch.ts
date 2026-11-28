/* eslint-disable @typescript-eslint/no-non-null-assertion -- матрицы гарантированно 3×3 */
import type { HostControls, HostSize, Sketch } from '@/shared/ui/CanvasHost/CanvasHost'
import { createCameraController } from './camera'
import { attractors, type Attractor, type Particle } from './definitions'

const PARTICLE_COUNT = 1400
const SUBSTEPS = 4
const BASE_SCALE = 15.5
const TRAIL_FADE = 0.4
const FRAME_TIME_MS = 1000 / 60
const MAX_FRAME_DELTA_MS = 100
const MAX_SIMULATION_STEPS_PER_FRAME = 12

function readToken(name: string): string {
  if (typeof document === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

interface Vec3 {
  x: number
  y: number
  z: number
}

interface Layout {
  center: Vec3
  offsetX: number
  offsetY: number
}

export function createSketch(
  canvas: HTMLCanvasElement,
  _host: HostControls,
  onNameChange: (name: string) => void,
): Sketch {
  const context = canvas.getContext('2d')
  if (context === null) throw new Error('2d context unavailable')
  const ctx = context

  let backgroundColor = readToken('--surface-deep')
  let particleColor = readToken('--fg')

  let width = 0
  let height = 0
  let centerX = 0
  let centerY = 0
  let scale = 0
  let attractorOffsetX = 0
  let attractorOffsetY = 0
  let currentAttractorIndex = 0
  let simulationAccumulatorMs = 0

  const layoutCache = new Map<Attractor, Layout>()
  const particles: Particle[] = []
  const camera = createCameraController(canvas, () => getCurrentAttractor())

  function getCurrentAttractor(): Attractor {
    return attractors[currentAttractorIndex]!
  }

  function seedParticles(): void {
    particles.length = 0
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      particles.push(getCurrentAttractor().createParticle())
    }
  }

  function stepAttractor(point: Particle): void {
    const attractor = getCurrentAttractor()
    const dt = attractor.dt
    attractor.beforeStep?.(point)
    const k1 = attractor.derivative(point.x, point.y, point.z, point)
    const k2 = attractor.derivative(
      point.x + (k1.dx * dt) / 2,
      point.y + (k1.dy * dt) / 2,
      point.z + (k1.dz * dt) / 2,
      point,
    )
    const k3 = attractor.derivative(
      point.x + (k2.dx * dt) / 2,
      point.y + (k2.dy * dt) / 2,
      point.z + (k2.dz * dt) / 2,
      point,
    )
    const k4 = attractor.derivative(
      point.x + k3.dx * dt,
      point.y + k3.dy * dt,
      point.z + k3.dz * dt,
      point,
    )
    point.x += (dt * (k1.dx + 2 * k2.dx + 2 * k3.dx + k4.dx)) / 6
    point.y += (dt * (k1.dy + 2 * k2.dy + 2 * k3.dy + k4.dy)) / 6
    point.z += (dt * (k1.dz + 2 * k2.dz + 2 * k3.dz + k4.dz)) / 6
    attractor.afterStep?.(point)
  }

  function isParticleValid(point: Particle): boolean {
    const { escapeRadius } = getCurrentAttractor()
    return (
      Number.isFinite(point.x) &&
      Number.isFinite(point.y) &&
      Number.isFinite(point.z) &&
      Math.abs(point.x) < escapeRadius &&
      Math.abs(point.y) < escapeRadius &&
      Math.abs(point.z) < escapeRadius
    )
  }

  function resetParticle(particle: Particle): void {
    const fresh = getCurrentAttractor().createParticle()
    particle.x = fresh.x
    particle.y = fresh.y
    particle.z = fresh.z
    particle.alpha = fresh.alpha
    particle.size = fresh.size
    particle.delayedZ = fresh.delayedZ
    particle.zHistory = fresh.zHistory ? fresh.zHistory.slice() : undefined
    particle.zHistoryIndex = fresh.zHistoryIndex ?? 0
  }

  function updateSimulation(): void {
    for (const particle of particles) {
      for (let step = 0; step < SUBSTEPS; step += 1) stepAttractor(particle)
      if (!isParticleValid(particle)) resetParticle(particle)
    }
  }

  function project(point: Vec3, cameraMatrix: number[][], center: Vec3) {
    const px = point.x - center.x
    const py = point.y - center.y
    const pz = point.z - center.z
    const x1 = px * cameraMatrix[0]![0]! + py * cameraMatrix[0]![1]! + pz * cameraMatrix[0]![2]!
    const y1 = px * cameraMatrix[1]![0]! + py * cameraMatrix[1]![1]! + pz * cameraMatrix[1]![2]!
    const z2 = px * cameraMatrix[2]![0]! + py * cameraMatrix[2]![1]! + pz * cameraMatrix[2]![2]!
    const depth = Math.max(0.18, 210 / (210 + z2 * 2.2))
    return {
      x: centerX + x1 * scale * depth * 0.4,
      y: centerY + y1 * scale * depth * 0.4,
      depth,
    }
  }

  function getAttractorLayout(attractor: Attractor): Layout {
    const cached = layoutCache.get(attractor)
    if (cached) return cached

    const refs = attractor.referencePoints
    const min = { x: Infinity, y: Infinity, z: Infinity }
    const max = { x: -Infinity, y: -Infinity, z: -Infinity }
    for (const p of refs) {
      min.x = Math.min(min.x, p.x)
      max.x = Math.max(max.x, p.x)
      min.y = Math.min(min.y, p.y)
      max.y = Math.max(max.y, p.y)
      min.z = Math.min(min.z, p.z)
      max.z = Math.max(max.z, p.z)
    }
    const center = { x: (min.x + max.x) / 2, y: (min.y + max.y) / 2, z: (min.z + max.z) / 2 }

    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    for (const p of refs) {
      const projected = project(p, attractor.camera.matrix, center)
      minX = Math.min(minX, projected.x)
      maxX = Math.max(maxX, projected.x)
      minY = Math.min(minY, projected.y)
      maxY = Math.max(maxY, projected.y)
    }

    const layout: Layout = {
      center,
      offsetX: centerX - (minX + maxX) / 2,
      offsetY: centerY - (minY + maxY) / 2,
    }
    layoutCache.set(attractor, layout)
    return layout
  }

  function clearCanvas(): void {
    ctx.globalAlpha = 1
    if (backgroundColor) ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)
  }

  function renderFrame(
    cameraMatrix: number[][],
    viewScale: number,
    offsetX: number,
    offsetY: number,
  ): void {
    const layout = getAttractorLayout(getCurrentAttractor())
    attractorOffsetX = layout.offsetX * viewScale
    attractorOffsetY = layout.offsetY * viewScale

    ctx.globalAlpha = TRAIL_FADE
    if (backgroundColor) ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)
    ctx.globalAlpha = 1

    const projected: { x: number; y: number; depth: number; alpha: number; size: number }[] = []
    for (const particle of particles) {
      const point = project(particle, cameraMatrix, layout.center)
      projected.push({
        x: centerX + (point.x - centerX) * viewScale,
        y: centerY + (point.y - centerY) * viewScale,
        depth: point.depth,
        alpha: particle.alpha,
        size: particle.size,
      })
    }
    projected.sort((a, b) => a.depth - b.depth)

    if (particleColor) ctx.fillStyle = particleColor
    for (const point of projected) {
      const radius = point.size * point.depth
      const x = point.x + attractorOffsetX + offsetX
      const y = point.y + attractorOffsetY + offsetY

      ctx.globalAlpha = 0.05 * point.alpha * point.depth
      ctx.beginPath()
      ctx.arc(x, y, radius * 2.5, 0, Math.PI * 2)
      ctx.fill()

      ctx.globalAlpha = 0.9 * point.alpha
      ctx.beginPath()
      ctx.arc(x, y, Math.max(0.45, radius), 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  function switchAttractor(direction: number): void {
    currentAttractorIndex =
      (currentAttractorIndex + direction + attractors.length) % attractors.length
    simulationAccumulatorMs = 0
    camera.resetCameraModeOffsets()
    seedParticles()
    onNameChange(getCurrentAttractor().name)
    clearCanvas()
  }

  function handleKeydown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase()
    if (key === 'c' || key === 'с') {
      camera.setCameraModeEnabled(!camera.state.enabled)
    } else if (event.key === 'ArrowLeft' || key === 'a' || key === 'ф') {
      switchAttractor(-1)
    } else if (event.key === 'ArrowRight' || key === 'd' || key === 'в') {
      switchAttractor(1)
    }
  }

  const onContextMenu = (event: Event): void => {
    camera.handleCanvasContextMenu(event)
  }
  const onPointerDown = (event: PointerEvent): void => {
    camera.startCameraDrag(event)
  }
  const onPointerMove = (event: PointerEvent): void => {
    camera.updateCameraDrag(event)
  }
  const onPointerUp = (): void => {
    camera.stopCameraDrag()
  }
  const onPointerCancel = (): void => {
    camera.stopCameraDrag()
  }
  const onWheel = (event: WheelEvent): void => {
    camera.handleCameraWheel(event)
  }
  const onDoubleClick = (event: MouseEvent): void => {
    camera.handleCameraDoubleClick(event)
  }
  const onPointerLeave = (event: PointerEvent): void => {
    camera.handlePointerLeave(event)
  }

  canvas.addEventListener('contextmenu', onContextMenu)
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerup', onPointerUp)
  canvas.addEventListener('pointercancel', onPointerCancel)
  canvas.addEventListener('wheel', onWheel, { passive: false })
  canvas.addEventListener('dblclick', onDoubleClick)
  canvas.addEventListener('pointerleave', onPointerLeave)
  window.addEventListener('keydown', handleKeydown)

  seedParticles()
  onNameChange(getCurrentAttractor().name)

  const themeObserver = new MutationObserver(() => {
    const nextBackground = readToken('--surface-deep')
    const nextParticles = readToken('--fg')
    if (nextBackground) backgroundColor = nextBackground
    if (nextParticles) particleColor = nextParticles
    if (width === 0 || height === 0) return

    // Шлейфы были в цвете прежней темы — начинаем с чистого холста.
    clearCanvas()
    const activeCamera = camera.getActiveCamera()
    const activeView = camera.getActiveView()
    renderFrame(activeCamera.matrix, activeView.scale, activeView.offsetX, activeView.offsetY)
  })
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })

  return {
    resize(size: HostSize) {
      width = size.width
      height = size.height
      centerX = width / 2
      centerY = height / 2 - height * 0.04
      scale = Math.min(width, height) / BASE_SCALE
      ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0)
      layoutCache.clear()
      clearCanvas()
    },
    frame(_time: number, delta: number) {
      const frameDeltaMs = Math.min(delta, MAX_FRAME_DELTA_MS)

      if (!camera.isRotationDragActive()) {
        simulationAccumulatorMs += frameDeltaMs
        let simulationSteps = 0
        while (
          simulationAccumulatorMs >= FRAME_TIME_MS &&
          simulationSteps < MAX_SIMULATION_STEPS_PER_FRAME
        ) {
          updateSimulation()
          simulationAccumulatorMs -= FRAME_TIME_MS
          simulationSteps += 1
        }
        if (simulationSteps === MAX_SIMULATION_STEPS_PER_FRAME) simulationAccumulatorMs = 0
      }

      const activeCamera = camera.getActiveCamera()
      const activeView = camera.getActiveView()
      renderFrame(activeCamera.matrix, activeView.scale, activeView.offsetX, activeView.offsetY)
    },
    dispose() {
      canvas.removeEventListener('contextmenu', onContextMenu)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerCancel)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('dblclick', onDoubleClick)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('keydown', handleKeydown)
      themeObserver.disconnect()
    },
  }
}
