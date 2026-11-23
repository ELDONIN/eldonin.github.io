'use client'

/* eslint-disable @typescript-eslint/no-non-null-assertion -- скан-коды и модификаторы заданы статически */
/* eslint-disable @typescript-eslint/no-dynamic-delete -- downMods — словарь нажатых модификаторов */
/* eslint-disable @typescript-eslint/no-unnecessary-condition -- проверки Web API (fullscreen) */

import { useEffect, useRef, useState } from 'react'
import styles from './index.module.css'

const BASE = '/projects/spoc-virtualbox'

interface V86Emulator {
  destroy(): void
  run(): void
  stop(): void
  add_listener(name: string, cb: () => void): void
  keyboard_send_scancodes(codes: number[]): void
  v86: { cpu: { devices: { rtc: { rtc_time: number; last_update: number } } } }
}

type V86Constructor = new (options: Record<string, unknown>) => V86Emulator

const SCANCODES: Record<string, number[]> = (() => {
  const m: Record<string, number[]> = {
    Escape: [0x01],
    Minus: [0x0c],
    Equal: [0x0d],
    Backspace: [0x0e],
    Tab: [0x0f],
    BracketLeft: [0x1a],
    BracketRight: [0x1b],
    Enter: [0x1c],
    Semicolon: [0x27],
    Quote: [0x28],
    Backquote: [0x29],
    Backslash: [0x2b],
    Comma: [0x33],
    Period: [0x34],
    Slash: [0x35],
    Space: [0x39],
    CapsLock: [0x3a],
    ArrowUp: [0xe0, 0x48],
    ArrowLeft: [0xe0, 0x4b],
    ArrowRight: [0xe0, 0x4d],
    ArrowDown: [0xe0, 0x50],
    Home: [0xe0, 0x47],
    End: [0xe0, 0x4f],
    PageUp: [0xe0, 0x49],
    PageDown: [0xe0, 0x51],
    Insert: [0xe0, 0x52],
    Delete: [0xe0, 0x53],
    NumpadEnter: [0xe0, 0x1c],
    NumpadDivide: [0xe0, 0x35],
    NumpadMultiply: [0x37],
    NumpadSubtract: [0x4a],
    NumpadAdd: [0x4e],
    NumpadDecimal: [0x53],
  }
  'Digit1 Digit2 Digit3 Digit4 Digit5 Digit6 Digit7 Digit8 Digit9 Digit0'.split(' ').forEach(
    (c, i) => {
      m[c] = [0x02 + i]
    },
  )
  ;[
    ['QWERTYUIOP', 0x10],
    ['ASDFGHJKL', 0x1e],
    ['ZXCVBNM', 0x2c],
  ].forEach(([row, base]) => {
    ;(row as string).split('').forEach((ch, i) => {
      m['Key' + ch] = [(base as number) + i]
    })
  })
  for (let f = 1; f <= 10; f += 1) m[`F${String(f)}`] = [0x3a + f]
  for (let n = 0; n <= 9; n += 1) {
    m[`Numpad${String(n)}`] = [[0x52, 0x4f, 0x50, 0x51, 0x4b, 0x4c, 0x4d, 0x47, 0x48, 0x49][n] as number]
  }
  return m
})()

const MODIFIERS: Record<string, number[]> = {
  ShiftLeft: [0x2a],
  ShiftRight: [0x36],
  ControlLeft: [0x1d],
  ControlRight: [0x1d],
  AltLeft: [0x38],
  AltRight: [0x38],
}

const PASS_THROUGH: Record<string, true> = { F5: true, F11: true, F12: true, Tab: true }

const HOLD_MS = 120
const GAP_MS = 60
const MOD_DOWN_MS = 150
const MOD_UP_MS = 40
const SPLASH_HOLD_MS = 3000
const MESSAGE_HOLD_MS = 1000
const BOOT_LIMIT_MS = 25000

function loadV86Script(): Promise<V86Constructor | undefined> {
  return new Promise((resolve) => {
    const w = window as unknown as { V86?: V86Constructor }
    if (w.V86) {
      resolve(w.V86)
      return
    }
    const script = document.createElement('script')
    script.src = `${BASE}/libv86.js`
    script.onload = () => {
      resolve(w.V86)
    }
    script.onerror = () => {
      resolve(undefined)
    }
    document.head.append(script)
  })
}

export default function Project() {
  const screenRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const overlayTextRef = useRef<HTMLParagraphElement>(null)
  const progressRef = useRef<HTMLProgressElement>(null)
  const retryRef = useRef<HTMLButtonElement>(null)
  const statusRef = useRef<HTMLParagraphElement>(null)
  const btnRestartRef = useRef<HTMLButtonElement>(null)
  const btnPauseRef = useRef<HTMLButtonElement>(null)
  const btnFullRef = useRef<HTMLButtonElement>(null)
  const stageRef = useRef<HTMLElement>(null)

  const [overlayError, setOverlayError] = useState(false)

  useEffect(() => {
    const screenEl = screenRef.current!
    const overlay = overlayRef.current!
    const overlayText = overlayTextRef.current!
    const progress = progressRef.current!
    const retryBtn = retryRef.current!
    const statusEl = statusRef.current!
    const btnRestart = btnRestartRef.current!
    const btnPause = btnPauseRef.current!
    const btnFull = btnFullRef.current!
    const stage = stageRef.current!

    let emulator: V86Emulator | null = null
    let startToken = 0
    let paused = false
    let holding = false
    const queue: { bytes: number[]; wait: number }[] = []
    let pumping = false
    const downMods: Record<string, boolean> = {}

    function showOverlay(
      text: string,
      opts?: { error?: boolean; progress?: boolean; retry?: boolean },
    ): void {
      overlay.hidden = false
      setOverlayError(!!opts?.error)
      overlayText.textContent = text
      progress.hidden = !opts?.progress
      retryBtn.hidden = !opts?.retry
    }
    function hideOverlay(): void {
      overlay.hidden = true
    }
    function setReady(ready: boolean): void {
      btnRestart.disabled = !ready
      btnPause.disabled = !ready
    }
    function destroyEmulator(): void {
      if (!emulator) return
      try {
        emulator.destroy()
      } catch {
        /* ignore */
      }
      emulator = null
      queue.length = 0
      paused = false
      holding = false
      btnPause.textContent = 'Пауза'
      setReady(false)
    }

    async function fetchBuffer(url: string): Promise<ArrayBuffer> {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`${url} (${String(res.status)})`)
      return res.arrayBuffer()
    }
    async function checkFile(url: string): Promise<void> {
      const res = await fetch(url, { method: 'HEAD' })
      if (!res.ok) throw new Error(`${url} (${String(res.status)})`)
    }

    async function start(): Promise<void> {
      destroyEmulator()
      statusEl.textContent = ''
      const V86 = await loadV86Script()
      if (!V86) {
        showOverlay('Не удалось загрузить эмулятор (libv86.js).', { error: true, retry: true })
        return
      }
      if (typeof WebAssembly === 'undefined') {
        showOverlay('Ваш браузер не поддерживает WebAssembly.', { error: true })
        return
      }
      showOverlay('Загрузка эмулятора и дискеты…', { progress: true })
      progress.removeAttribute('value')

      const token = ++startToken
      try {
        const [floppy, bios, vgabios] = await Promise.all([
          fetchBuffer(`${BASE}/nasa-spoc.img`),
          fetchBuffer(`${BASE}/seabios.bin`),
          fetchBuffer(`${BASE}/vgabios.bin`),
        ])
        await checkFile(`${BASE}/v86.wasm`)
        if (token === startToken) boot(token, floppy, bios, vgabios, V86)
      } catch (err) {
        if (token !== startToken) return
        const msg = err instanceof Error ? err.message : String(err)
        showOverlay(`Не удалось загрузить ${msg}. Проверьте соединение.`, {
          error: true,
          retry: true,
        })
      }
    }

    function boot(
      token: number,
      floppy: ArrayBuffer,
      bios: ArrayBuffer,
      vgabios: ArrayBuffer,
      V86: V86Constructor,
    ): void {
      try {
        emulator = new V86({
          wasm_path: `${BASE}/v86.wasm`,
          bios: { buffer: bios },
          vga_bios: { buffer: vgabios },
          fda: { buffer: floppy },
          memory_size: 16 * 1024 * 1024,
          vga_memory_size: 8 * 1024 * 1024,
          screen_container: screenEl,
          disable_keyboard: true,
          autostart: false,
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        showOverlay(`Ошибка запуска: ${msg}`, { error: true, retry: true })
        return
      }

      const em = emulator
      const watchdog = setTimeout(() => {
        if (em !== emulator || overlay.hidden) return
        showOverlay('Эмулятор не запустился. Попробуйте ещё раз.', { error: true, retry: true })
      }, 30000)

      em.add_listener('emulator-ready', () => {
        clearTimeout(watchdog)
        if (em !== emulator || token !== startToken) return
        presetClock(em)
        hideOverlay()
        statusEl.textContent = 'Загрузка SPOC…'
        em.run()
        paceBoot(em, token)
      })
    }

    function presetClock(em: V86Emulator): void {
      try {
        const rtc = em.v86.cpu.devices.rtc
        rtc.rtc_time = Date.UTC(1990, 3, 24, 14, 15, 0)
        rtc.last_update = Date.now()
      } catch {
        /* без этого форму GMT придётся заполнить вручную */
      }
    }

    function paceBoot(em: V86Emulator, token: number): void {
      const startedAt = Date.now()
      const cv = screenEl.querySelector('canvas')
      if (!cv) {
        setReady(true)
        statusEl.textContent = 'Кликните по экрану, чтобы вводить с клавиатуры.'
        return
      }
      const canvas = cv
      let splashDone = false
      let inMessage = false
      let timer: ReturnType<typeof setInterval> | null = null

      try {
        canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
      } catch {
        /* ignore */
      }

      function lit(): number {
        const ctx = canvas.getContext('2d')
        if (!ctx) return 0
        const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data
        let n = 0
        for (let i = 0; i < d.length; i += 16) if (d[i]! > 0) n += 1
        return n
      }

      function finish(): void {
        if (timer) clearInterval(timer)
        if (em !== emulator || token !== startToken) return
        holding = false
        setReady(true)
        statusEl.textContent = 'Кликните по экрану, чтобы вводить с клавиатуры.'
        screenEl.focus()
      }

      function hold(ms: number): void {
        holding = true
        queue.length = 0
        em.stop()
        setTimeout(() => {
          if (em !== emulator || token !== startToken) return
          holding = false
          em.run()
        }, ms)
      }

      timer = setInterval(() => {
        if (em !== emulator || token !== startToken) {
          if (timer) clearInterval(timer)
          return
        }
        if (holding) return
        if (Date.now() - startedAt > BOOT_LIMIT_MS) {
          finish()
          return
        }
        if (!splashDone && Date.now() - startedAt > 8000) {
          finish()
          return
        }
        if (canvas.width !== 640) return
        let n: number
        try {
          n = lit()
        } catch {
          finish()
          return
        }
        if (splashDone && n > 8500) {
          finish()
          return
        }
        if (!splashDone && n > 4000) {
          splashDone = true
          hold(SPLASH_HOLD_MS)
          return
        }
        const isMessage = splashDone && n > 1500 && n < 3000
        if (isMessage && !inMessage) {
          inMessage = true
          hold(MESSAGE_HOLD_MS)
          return
        }
        if (!isMessage) inMessage = false
      }, 10)
    }

    function brk(codes: number[]): number[] {
      return codes.map((c) => (c === 0xe0 ? c : c | 0x80))
    }
    function enqueue(bytes: number[], waitMs: number): void {
      queue.push({ bytes, wait: waitMs })
      if (!pumping) pump()
    }
    function pump(): void {
      const item = queue.shift()
      if (!item) {
        pumping = false
        return
      }
      pumping = true
      if (emulator && !paused && !holding) emulator.keyboard_send_scancodes(item.bytes)
      setTimeout(pump, item.wait)
    }
    function clearKeyboard(): void {
      queue.length = 0
      Object.keys(downMods).forEach((code) => {
        if (emulator) emulator.keyboard_send_scancodes(brk(MODIFIERS[code]!))
      })
      for (const k of Object.keys(downMods)) delete downMods[k]
    }
    function inGuestFocus(): boolean {
      return document.activeElement === screenEl && !!emulator
    }

    function onKeyDown(e: KeyboardEvent): void {
      if (!inGuestFocus() || e.metaKey || PASS_THROUGH[e.code]) return
      const mod = MODIFIERS[e.code]
      const codes = SCANCODES[e.code]
      if (!mod && !codes) return
      e.preventDefault()
      if (e.repeat) return
      if (mod) {
        if (downMods[e.code]) return
        downMods[e.code] = true
        enqueue(mod, MOD_DOWN_MS)
      } else {
        enqueue(codes!, HOLD_MS)
        enqueue(brk(codes!), GAP_MS)
      }
    }
    function onKeyUp(e: KeyboardEvent): void {
      if (!inGuestFocus()) return
      const mod = MODIFIERS[e.code]
      if (mod && downMods[e.code]) {
        delete downMods[e.code]
        enqueue(brk(mod), MOD_UP_MS)
        e.preventDefault()
      } else if (SCANCODES[e.code] && !PASS_THROUGH[e.code]) {
        e.preventDefault()
      }
    }

    const onScreenClick = (): void => {
      screenEl.focus()
    }
    const onRestart = (): void => {
      clearKeyboard()
      void start()
    }
    const onPause = (): void => {
      if (!emulator) return
      if (paused) {
        emulator.run()
        btnPause.textContent = 'Пауза'
      } else {
        emulator.stop()
        btnPause.textContent = 'Продолжить'
      }
      paused = !paused
      screenEl.focus()
    }
    const onFull = (): void => {
      if (document.fullscreenElement) {
        void document.exitFullscreen()
      } else if (stage.requestFullscreen) {
        stage
          .requestFullscreen()
          .then(() => {
            screenEl.focus()
          })
          .catch(() => {
            statusEl.textContent = 'Полноэкранный режим недоступен в этом браузере.'
          })
      } else {
        statusEl.textContent = 'Полноэкранный режим недоступен в этом браузере.'
      }
    }
    const onRetry = (): void => {
      void start()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    screenEl.addEventListener('blur', clearKeyboard)
    screenEl.addEventListener('click', onScreenClick)
    btnRestart.addEventListener('click', onRestart)
    btnPause.addEventListener('click', onPause)
    btnFull.addEventListener('click', onFull)
    retryBtn.addEventListener('click', onRetry)

    void start()

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      screenEl.removeEventListener('blur', clearKeyboard)
      screenEl.removeEventListener('click', onScreenClick)
      btnRestart.removeEventListener('click', onRestart)
      btnPause.removeEventListener('click', onPause)
      btnFull.removeEventListener('click', onFull)
      retryBtn.removeEventListener('click', onRetry)
      destroyEmulator()
    }
  }, [])

  return (
    <div className={styles.app}>
      <section className={styles.stage} ref={stageRef} aria-label="Экран эмулятора">
        <div className={styles.screen} ref={screenRef} tabIndex={0}>
          <div className={styles.text} />
          <canvas />
        </div>
        <div
          className={
            overlayError ? `${styles.overlay ?? ''} ${styles.overlayError ?? ''}` : styles.overlay
          }
          ref={overlayRef}
          role="status"
          aria-live="polite"
        >
          <p ref={overlayTextRef}>Загрузка эмулятора…</p>
          <progress ref={progressRef} max={100} />
          <button ref={retryRef} type="button" hidden>
            Повторить
          </button>
        </div>
      </section>

      <section className={styles.controls} aria-label="Управление эмулятором">
        <button ref={btnRestartRef} type="button" disabled>
          Перезапуск
        </button>
        <button ref={btnPauseRef} type="button" disabled>
          Пауза
        </button>
        <button ref={btnFullRef} type="button">
          На весь экран
        </button>
      </section>
      <p className={styles.status} ref={statusRef} role="status" />
      <p className={styles.hint}>
        Эмулятор работает с физической клавиатурой: кликните по экрану, чтобы он получил фокус.
        Клавиша CODE — это Alt (на Mac — Option). Alt+Enter подтверждает форму целиком; если везде
        просто нажимать Alt+Enter, получатся данные миссии STS-31.
      </p>
    </div>
  )
}

