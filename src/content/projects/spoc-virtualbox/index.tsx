'use client'

/* eslint-disable @typescript-eslint/no-non-null-assertion -- скан-коды и модификаторы заданы статически */
/* eslint-disable @typescript-eslint/no-dynamic-delete -- downMods — словарь нажатых модификаторов */
/* eslint-disable @typescript-eslint/no-unnecessary-condition -- проверки Web API (fullscreen) */
/* eslint-disable @next/next/no-img-element -- фото SPOC — статический ассет проекта */

import { useEffect, useRef, useState } from 'react'
import styles from './index.module.css'

const BASE = '/projects/spoc-virtualbox'

interface V86Emulator {
  destroy(): Promise<void>
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
      const em = emulator
      emulator = null
      try {
        // libv86 destroy() — async: отказ (например, WASM ещё не загружен) гасим,
        // иначе он всплывает как unhandled rejection.
        void em.destroy().catch(() => {
          /* ignore */
        })
      } catch {
        /* ignore */
      }
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
      <header className={styles.head}>
        <h2 className={styles.headTitle}>NASA SPOC Emulator</h2>
        <p className={styles.headDesc}>
          Бортовой компьютер SPOC космического челнока на ноутбуке GRiD Compass: загрузочная
          дискета работает прямо в вашем браузере.
        </p>
      </header>

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

      <article className={styles.doc}>
        <section>
          <h2>1. Управление</h2>
          <p>
            Эмулятор работает с физической клавиатурой: сначала кликните по экрану, чтобы он получил
            фокус.
          </p>
          <ul>
            <li>
              Клавиша <b>CODE</b> в SPOC — это <kbd>Alt</kbd> (на Mac — <kbd>Option</kbd>). Её нужно
              удерживать, пока нажимается вторая клавиша.
            </li>
            <li>
              <kbd>Alt</kbd>+<kbd>Enter</kbd> (CODE-RETURN) — подтвердить форму целиком и перейти дальше.
            </li>
            <li>
              <kbd>Enter</kbd> (RETURN) — перейти к следующему полю формы.
            </li>
            <li>
              <kbd>Alt</kbd>+<kbd>Backspace</kbd> — стереть значение поля целиком; обычный{' '}
              <kbd>Backspace</kbd> стирает по одному символу.
            </li>
            <li>
              <kbd>Alt</kbd>+<kbd>Esc</kbd> — отменить ввод и вернуться назад.
            </li>
            <li>
              <kbd>Alt</kbd>+<kbd>?</kbd> — справка по текущему экрану.
            </li>
            <li>Стрелки — выбор пункта в меню.</li>
            <li>
              Кнопки под экраном: «Перезапуск» загружает дискету заново, «Пауза» замораживает эмуляцию,
              «На весь экран» растягивает экран (выход — <kbd>Esc</kbd>).
            </li>
            <li>На телефоне и планшете нужна подключённая клавиатура: экранной клавиатуры нет.</li>
          </ul>
        </section>

        <section>
          <h2>2. Что нужно вводить при запуске</h2>
          <p className={styles.note}>
            <b>
              Если везде просто нажимать <kbd>Alt</kbd>+<kbd>Enter</kbd>, вы получите данные миссии STS-31
            </b>{' '}
            — старт шаттла «Дискавери» с телескопом «Хаббл» 24 апреля 1990 года в 12:33:51 GMT
            (космический центр Кеннеди, площадка LC-39B). Время старта и часы эмулятора настроены под
            эту миссию. Вектор состояния — штатный условный вектор программы, а не реальный вектор STS-31.
          </p>
          <p>
            После загрузки SPOC последовательно показывает три формы. Значения по умолчанию уже корректны,
            достаточно нажимать <kbd>Alt</kbd>+<kbd>Enter</kbd> на каждом экране. Правило программы 1980-х:
            годы только <b>до 2000-го</b>, время запуска &lt; время вектора состояния &lt; текущее время, и
            между вектором и текущим временем не больше двух суток.
          </p>
          <h3>Форма 1. Launch Time Update — время старта миссии (GMT)</h3>
          <p>
            Год (1983–1999), день года, часы, минуты, секунды по Гринвичу. По умолчанию: 1990 год, день 114,
            12:33:51 (это 24 апреля, старт STS-31).
          </p>
          <h3>Форма 2. GMT Update — текущее время</h3>
          <p>
            День года, часы, минуты и год «сейчас». Часы эмулятора заранее выставлены на 24 апреля 1990 года,
            около 14:15 GMT, потому что программа не принимает 2020-е годы.
          </p>
          <h3>Форма 3. State Vector Update — вектор состояния</h3>
          <p>Положение и скорость корабля на орбите в системе координат M50 плюс момент времени:</p>
          <ul>
            <li>
              <b>Day / Hour / Minute / Second (GMT)</b> — время привязки вектора (по умолчанию запуск + 1 ч
              13 мин 35 с);
            </li>
            <li>
              <b>X, Y, Z Position (KFt)</b> — координаты в тысячах футов;
            </li>
            <li>
              <b>X, Y, Z Velocity (KFt/Sec)</b> — скорость в тысячах футов в секунду.
            </li>
          </ul>
          <p>
            После <kbd>Alt</kbd>+<kbd>Enter</kbd> появится контрольная проверка: <code>Inclination = 28.522</code>,{' '}
            <code>HA=200; HP=189</code>. Если значения разумны, подтвердите ещё раз — откроется главное меню.
          </p>
          <h3>Путь «просто вперёд»</h3>
          <ol>
            <li>Launch Time Update — <kbd>Alt</kbd>+<kbd>Enter</kbd>.</li>
            <li>GMT Update — <kbd>Alt</kbd>+<kbd>Enter</kbd>.</li>
            <li>
              State Vector Update — <kbd>Alt</kbd>+<kbd>Enter</kbd>, затем ещё раз после контрольной проверки.
            </li>
            <li>Главное меню: <b>Display World Map</b> — <kbd>Alt</kbd>+<kbd>Enter</kbd>.</li>
            <li>
              Менеджер станций: <b>Invoke Default Communication Sites</b> — <kbd>Alt</kbd>+<kbd>Enter</kbd>.
              Через несколько секунд появится карта мира.
            </li>
            <li>
              На карте <kbd>Alt</kbd>+<kbd>?</kbd> открывает список функций, <kbd>Alt</kbd>+<kbd>Esc</kbd>{' '}
              возвращает в главное меню.
            </li>
          </ol>
          <h3>Если хотите ввести значения вручную</h3>
          <p>Оригинальное демо из Flight Procedures Handbook:</p>
          <table>
            <thead>
              <tr>
                <th>Форма</th>
                <th>Поля по порядку</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Launch Time Update</td>
                <td>Year 1988 · Day 300 · Hour 0 · Minute 0 · Second 0</td>
              </tr>
              <tr>
                <td>GMT Update</td>
                <td>Day 300 · Hour 0 · Minute 0 · Year 1988</td>
              </tr>
              <tr>
                <td>State Vector — время</td>
                <td>Day 300 · Hour 0 · Minute 0 · Second 0</td>
              </tr>
              <tr>
                <td>State Vector — позиция</td>
                <td>X −4065.5451 · Y 19478.6516 · Z −9134.2843</td>
              </tr>
              <tr>
                <td>State Vector — скорость</td>
                <td>X −23.4998543 · Y −7.6119311 · Z −5.7686384</td>
              </tr>
            </tbody>
          </table>
          <p>
            После формы GMT появится <code>CAUTION: Vector is in the future</code> — это нормально, нажмите{' '}
            <kbd>Alt</kbd>+<kbd>Enter</kbd>.
          </p>
        </section>

        <section>
          <h2>3. Роль SPOC в истории</h2>
          <figure className={styles.figure}>
            <img
              src={`${BASE}/spoc-onboard.jpg`}
              alt="Член экипажа челнока с блокнотом в руках рядом с ноутбуком GRiD, на экране которого видна карта мира с трассой орбиты"
              loading="lazy"
            />
            <figcaption className={styles.figcaption}>
              SPOC на борту: на янтарном экране ноутбука — карта мира с границей дня и ночи и трассой орбиты.
            </figcaption>
          </figure>
          <p>
            SPOC (Shuttle Portable Onboard Computer) — один из первых портативных компьютеров в космосе.
            С первого полёта (STS-1) независимые расчёты на борту делал калькулятор HP-41. В 1983 году NASA
            выбрало ноутбук GRiD Compass 1101, и на STS-9 он впервые полетел как проверка идеи. SPOC оказался
            так полезен для «ситуационной осведомлённости» экипажа, что летал на каждой следующей миссии, а
            начиная с 41-G на борту было уже два комплекта.
          </p>
          <ul>
            <li>
              <b>Что он делал.</b> Показывал карту мира, текущее положение корабля, границу дня и ночи, текущую
              и две будущие трассы, времена входа в зону связи и выхода из неё (AOS/LOS) для наземных станций
              и спутников TDRS, восход и закат на орбите.
            </li>
            <li>
              <b>Зачем это нужно.</b> Экономил время Центра управления полётом: не нужно было передавать
              таблицы голосом или телетайпом.
            </li>
            <li>
              <b>Железо.</b> Ноутбуки дорабатывали для полёта: вместо модема — вентилятор, защита батареи
              часов и экран против излучения. Электролюминесцентный дисплей светился жёлто-янтарным — отсюда
              цвет экрана.
            </li>
            <li>
              <b>Статус.</b> «Некритичное, но обязательное» оборудование: отказ не угрожал миссии, но без него
              работать было сложнее.
            </li>
          </ul>
          <p>
            Образ на этой странице — публичная редакция SPOC, которую NASA распространяла через Spacelink для
            обычных IBM PC. Она запускается в эмуляторе x86, а не на полётном ноутбуке GRiD.
          </p>
        </section>

        <section>
          <h2>4. Ссылки</h2>
          <ul>
            <li>
              <a href="https://www.youtube.com/watch?v=quHlMiwTQZs" target="_blank" rel="noopener noreferrer">
                Видео-демонстрация на YouTube
              </a>
            </li>
            <li>
              <a href="https://github.com/robertely/SPOC-VirtualBox" target="_blank" rel="noopener noreferrer">
                Проект SPOC-VirtualBox на GitHub
              </a>
            </li>
            <li>
              <a href="https://youtu.be/OoZAdkxdjb8" target="_blank" rel="noopener noreferrer">
                Обзор ноутбуков GRiD на YouTube
              </a>
            </li>
          </ul>
        </section>
      </article>
    </div>
  )
}

