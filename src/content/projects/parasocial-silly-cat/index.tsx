'use client'

/* eslint-disable @typescript-eslint/no-non-null-assertion -- спрайты и аудио-буферы гарантированно загружены */
/* eslint-disable @typescript-eslint/no-unnecessary-condition -- проверки Web API браузера (AudioContext/ImageBitmap) */
/* eslint-disable @next/next/no-img-element -- спрайты-плейсхолдеры подменяются динамически через JS */

import { useEffect, useRef, useState } from 'react'
import styles from './index.module.css'

const BASE = '/projects/parasocial-silly-cat'
const MEOWS = [1, 2, 3, 4].map((n) => `${BASE}/meow_${String(n)}.mp3`)
const CAT_IMG = `${BASE}/silly_cat_meow.webp`
const PAT_IMG = `${BASE}/hand_pat.webp`
const EEK_DANCE_2 = `${BASE}/silly_cat_dance_2.webp`
const EEK_DANCE_1 = `${BASE}/silly_cat_dance_1.webp`
const EEK_SOUND = `${BASE}/the_penis_eek.mp3`

const FALLBACK_MS = 1500
const COOLDOWN_MS = 450
const SQUASH = 0.07
const PREP_LEAD_MS = 200
const SLOW_HINT_MS = 1500
const SPAM_CLICKS = 8
const SPAM_WINDOW_MS = 2000
const EEK_LOCK_MS = 300
const EEK_PATS = 2
const EEK_FALLBACK_MS = 3000
const EEK_HOLD_MS = 4000
const EEK_DANCE_2_LOOPS = 2

interface Asset {
  blob: Blob
  ms: number
  loops: number
}

type Mode = 'loading' | 'idle' | 'petting' | 'eek'
type View = 'idle' | 'hold' | 'anim'

export default function Project() {
  const [mode, setMode] = useState<Mode>('loading')
  const [view, setView] = useState<View>('idle')
  const [ready, setReady] = useState(false)

  const stageRef = useRef<HTMLDivElement>(null)
  const catRef = useRef<HTMLButtonElement>(null)
  const spriteRef = useRef<HTMLDivElement>(null)
  const idleRef = useRef<HTMLCanvasElement>(null)
  const holdRef = useRef<HTMLCanvasElement>(null)
  const patRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<HTMLImageElement>(null)
  const patImgRef = useRef<HTMLImageElement>(null)
  const hintRef = useRef<HTMLParagraphElement>(null)
  const statusRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const stage = stageRef.current!
    const cat = catRef.current!
    const sprite = spriteRef.current!
    const idle = idleRef.current!
    const hold = holdRef.current!
    const pat = patRef.current!
    const hint = hintRef.current!
    const status = statusRef.current!
    let anim = animRef.current!
    let patImg = patImgRef.current!

    // Состояние (мутабельное для логики; синхронизируется с React для CSS)
    let mode: Mode = 'loading'
    let eekReady = false
    let lastMeow = -1
    let lastClick = 0
    let clicks: number[] = []
    let patLockUntil = 0
    let animEpoch = 0
    let patEpoch = 0
    let meowSource: AudioBufferSourceNode | null = null
    let eekSource: AudioBufferSourceNode | null = null

    const timers = {
      cat: new Set<ReturnType<typeof setTimeout>>(),
      pat: new Set<ReturnType<typeof setTimeout>>(),
      eek: new Set<ReturnType<typeof setTimeout>>(),
    }
    function later(group: keyof typeof timers, fn: () => unknown, ms: number): void {
      const id = setTimeout(() => {
        timers[group].delete(id)
        void fn()
      }, Math.max(0, ms))
      timers[group].add(id)
    }
    function clearGroup(group: keyof typeof timers): void {
      timers[group].forEach(clearTimeout)
      timers[group].clear()
    }

    function syncMode(next: Mode): void {
      mode = next
      setMode(next)
    }
    function syncView(next: View): void {
      setView(next)
    }
    function announce(text: string): void {
      status.textContent = text
    }

    const assets = new Map<string, Asset>()
    const sounds = new Map<string, AudioBuffer>()
    const imgUrls = new WeakMap<HTMLImageElement, string>()

    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    const actx = AC ? new AC() : null
    function unlockAudio(): void {
      if (actx && actx.state !== 'running') actx.resume().catch(() => {})
    }

    function fail(src: string): Error {
      return new Error(`Не удалось загрузить ${src}`)
    }

    function tag(v: DataView, o: number): string {
      return String.fromCharCode(
        v.getUint8(o),
        v.getUint8(o + 1),
        v.getUint8(o + 2),
        v.getUint8(o + 3),
      )
    }

    function webpInfo(buf: ArrayBuffer): { ms: number; loops: number } {
      const none = { ms: 0, loops: 0 }
      if (buf.byteLength < 12) return none
      const v = new DataView(buf)
      if (tag(v, 0) !== 'RIFF' || tag(v, 8) !== 'WEBP') return none
      let off = 12
      let total = 0
      let loops = 0
      let hasAnim = false
      while (off + 8 <= buf.byteLength) {
        const name = tag(v, off)
        const size = v.getUint32(off + 4, true)
        if (name === 'ANIM' && off + 14 <= buf.byteLength) {
          hasAnim = true
          loops = v.getUint16(off + 12, true)
        }
        if (name === 'ANMF' && off + 23 <= buf.byteLength) {
          const d = v.getUint8(off + 20) | (v.getUint8(off + 21) << 8) | (v.getUint8(off + 22) << 16)
          total += d <= 10 ? 100 : d
        }
        off += 8 + size + (size & 1)
      }
      return hasAnim ? { ms: total, loops } : none
    }

    async function loadImage(src: string): Promise<void> {
      let buf: ArrayBuffer
      try {
        const res = await fetch(src)
        if (!res.ok) throw new Error('bad status')
        buf = await res.arrayBuffer()
      } catch {
        throw fail(src)
      }
      const info = webpInfo(buf)
      assets.set(src, { blob: new Blob([buf], { type: 'image/webp' }), ms: info.ms, loops: info.loops })
    }

    async function loadSound(src: string): Promise<void> {
      if (!actx) return
      try {
        const res = await fetch(src)
        if (!res.ok) throw new Error('bad status')
        const buf = await res.arrayBuffer()
        const decoded = await actx.decodeAudioData(buf)
        sounds.set(src, decoded)
      } catch {
        throw fail(src)
      }
    }

    async function frameOf(
      blob: Blob,
    ): Promise<{ src: ImageBitmap | HTMLImageElement; w: number; h: number }> {
      try {
        const bmp = await createImageBitmap(blob)
        return { src: bmp, w: bmp.width, h: bmp.height }
      } catch {
        /* пробуем через Image */
      }
      const url = URL.createObjectURL(blob)
      try {
        const img = new Image()
        img.src = url
        await img.decode()
        return { src: img, w: img.naturalWidth, h: img.naturalHeight }
      } finally {
        URL.revokeObjectURL(url)
      }
    }

    function drawTo(
      canvas: HTMLCanvasElement,
      frame: { src: ImageBitmap | HTMLImageElement; w: number; h: number },
    ): void {
      canvas.width = frame.w
      canvas.height = frame.h
      canvas.getContext('2d')?.drawImage(frame.src, 0, 0)
    }

    const durationOf = (src: string): number => assets.get(src)?.ms ?? 0
    const needsRestart = (src: string): boolean => {
      const a = assets.get(src)
      return !!a && a.ms > 0 && a.loops !== 0
    }

    async function makeImg(src: string, className: string | undefined): Promise<HTMLImageElement> {
      const img = new Image()
      img.className = className ?? ''
      img.alt = ''
      img.draggable = false
      img.decoding = 'async'
      const url = URL.createObjectURL(assets.get(src)!.blob)
      imgUrls.set(img, url)
      img.src = url
      try {
        await img.decode()
      } catch {
        /* покажем как есть */
      }
      return img
    }

    function swapAnim(img: HTMLImageElement): void {
      anim.replaceWith(img)
      const oldUrl = imgUrls.get(anim)
      if (oldUrl) URL.revokeObjectURL(oldUrl)
      anim = img
      syncView('anim')
    }

    function swapPat(img: HTMLImageElement): void {
      patImg.replaceWith(img)
      const oldUrl = imgUrls.get(patImg)
      if (oldUrl) URL.revokeObjectURL(oldUrl)
      patImg = img
      pat.classList.add(styles.playing!)
    }

    function scheduleAhead(
      group: keyof typeof timers,
      atMs: number,
      lead: number,
      make: () => Promise<HTMLImageElement>,
      apply: (img: HTMLImageElement) => void,
    ): void {
      let pending: Promise<HTMLImageElement> | null = null
      const prepare = () => pending ?? (pending = make())
      later(group, () => prepare(), atMs - lead)
      later(group, async () => {
        apply(await prepare())
      }, atMs)
    }

    function playBuffer(buffer: AudioBuffer | undefined): AudioBufferSourceNode | null {
      if (!actx || !buffer) return null
      const source = actx.createBufferSource()
      source.buffer = buffer
      source.connect(actx.destination)
      source.start()
      return source
    }
    function stopSource(source: AudioBufferSourceNode | null): void {
      if (!source) return
      try {
        source.stop()
      } catch {
        /* уже остановлен */
      }
    }

    function pickMeow(): AudioBuffer | null {
      const readyIdx = MEOWS.map((_, i) => i).filter((i) => sounds.has(MEOWS[i]!))
      if (!readyIdx.length) return null
      let i: number
      do {
        i = readyIdx[Math.floor(Math.random() * readyIdx.length)]!
      } while (i === lastMeow && readyIdx.length > 1)
      lastMeow = i
      return sounds.get(MEOWS[i]!) ?? null
    }

    function playMeow(): void {
      stopSource(meowSource)
      meowSource = playBuffer(pickMeow() ?? undefined)
    }

    function startPat(ms: number, img: HTMLImageElement): void {
      swapPat(img)
      const opts: KeyframeAnimationOptions = { duration: ms, easing: 'ease-in-out' }
      const drop = stage.offsetHeight * SQUASH
      sprite.animate(
        [
          { transform: 'scaleY(1)' },
          { transform: `scaleY(${String(1 - SQUASH)})` },
          { transform: 'scaleY(1)' },
        ],
        opts,
      )
      pat.animate(
        [
          { transform: 'translateX(-50%) translateY(0)' },
          { transform: `translateX(-50%) translateY(${String(drop)}px)` },
          { transform: 'translateX(-50%) translateY(0)' },
        ],
        opts,
      )
    }

    function fitPats(): number {
      const catMs = durationOf(CAT_IMG)
      const patMs = durationOf(PAT_IMG)
      return catMs && patMs ? Math.max(1, Math.floor(catMs / patMs)) : 1
    }

    function resetPats(): void {
      clearGroup('pat')
      ;[sprite, pat].forEach((el) => {
        el.getAnimations().forEach((a) => {
          a.cancel()
        })
      })
      pat.classList.remove(styles.playing!)
    }

    function backToIdle(): void {
      if (mode !== 'petting') return
      syncView('idle')
      syncMode('idle')
    }

    async function runPats(count: number, withCat: boolean): Promise<void> {
      const pEpoch = ++patEpoch
      const jobs: Promise<HTMLImageElement>[] = [makeImg(PAT_IMG, styles.patImg)]
      let aEpoch = 0
      if (withCat) {
        aEpoch = ++animEpoch
        jobs.push(makeImg(CAT_IMG, styles.anim))
      }
      const [patNew, catNew] = await Promise.all(jobs)
      if (pEpoch !== patEpoch || (withCat && aEpoch !== animEpoch)) return

      resetPats()
      const ms = durationOf(PAT_IMG) || FALLBACK_MS

      if (withCat && catNew) {
        clearGroup('cat')
        syncMode('petting')
        swapAnim(catNew)
        later('cat', backToIdle, durationOf(CAT_IMG) || FALLBACK_MS)
      }

      startPat(ms, patNew!)
      for (let i = 1; i < count; i += 1) {
        scheduleAhead(
          'pat',
          i * ms,
          Math.min(PREP_LEAD_MS, ms / 2),
          () => makeImg(PAT_IMG, styles.patImg),
          (img) => {
            if (pEpoch === patEpoch) startPat(ms, img)
          },
        )
      }
      later(
        'pat',
        () => {
          pat.classList.remove(styles.playing!)
        },
        count * ms,
      )
    }

    function startEek(): void {
      syncMode('eek')
      announce('Кот разошёлся и танцует.')
      resetPats()
      clearGroup('cat')
      clearGroup('eek')
      stopSource(meowSource)
      stopSource(eekSource)
      const epoch = ++animEpoch
      patEpoch += 1
      patLockUntil = performance.now() + EEK_LOCK_MS

      const d2 = durationOf(EEK_DANCE_2) || FALLBACK_MS
      const d1 = durationOf(EEK_DANCE_1) || FALLBACK_MS
      const buffer = sounds.get(EEK_SOUND)
      const audioMs = buffer ? buffer.duration * 1000 : EEK_FALLBACK_MS

      const dance2Total = EEK_HOLD_MS + d2 * EEK_DANCE_2_LOOPS
      const tailMs = Math.max(d1, audioMs - dance2Total)
      const endMs = Math.max(dance2Total + tailMs, audioMs)

      const show = (src: string, atMs: number): void => {
        scheduleAhead(
          'eek',
          atMs,
          PREP_LEAD_MS,
          () => makeImg(src, styles.anim),
          (img) => {
            if (epoch === animEpoch) swapAnim(img)
          },
        )
      }

      syncView('hold')
      eekSource = playBuffer(buffer)

      show(EEK_DANCE_2, EEK_HOLD_MS)
      if (needsRestart(EEK_DANCE_2)) {
        for (let t = EEK_HOLD_MS + d2; t < dance2Total; t += d2) show(EEK_DANCE_2, t)
      }

      show(EEK_DANCE_1, dance2Total)
      if (needsRestart(EEK_DANCE_1)) {
        for (let t = dance2Total + d1; t < endMs; t += d1) show(EEK_DANCE_1, t)
      }

      later('eek', endEek, endMs)
    }

    function endEek(): void {
      if (mode !== 'eek') return
      clearGroup('eek')
      stopSource(eekSource)
      eekSource = null
      animEpoch += 1
      patEpoch += 1
      resetPats()
      syncView('idle')
      syncMode('idle')
      announce('Кот успокоился.')
    }

    function onClick(): void {
      if (mode === 'loading') return
      unlockAudio()

      const now = performance.now()
      clicks = clicks.filter((t) => now - t < SPAM_WINDOW_MS)
      clicks.push(now)
      if (mode !== 'eek' && eekReady && clicks.length >= SPAM_CLICKS) {
        clicks = []
        startEek()
      }

      if (now - lastClick < COOLDOWN_MS) return
      lastClick = now

      if (mode === 'eek') {
        if (now < patLockUntil) return
        void runPats(EEK_PATS, false)
        return
      }
      void runPats(fitPats(), true)
      playMeow()
    }

    function onKeyDown(e: KeyboardEvent): void {
      if (e.repeat) e.preventDefault()
    }

    cat.addEventListener('keydown', onKeyDown)
    cat.addEventListener('click', onClick)

    async function init(): Promise<void> {
      const slowTimer = setTimeout(() => {
        if (mode === 'loading') {
          hint.textContent = 'Загрузка…'
          hint.hidden = false
        }
      }, SLOW_HINT_MS)

      const quiet = (p: Promise<unknown>): Promise<unknown> => {
        p.catch(() => {})
        return p
      }

      const catJob = quiet(loadImage(CAT_IMG))
      const patJob = quiet(loadImage(PAT_IMG))
      const meowJobs = MEOWS.map((src) => quiet(loadSound(src)))

      const dance1Job = quiet(loadImage(EEK_DANCE_1))
      const dance2Job = quiet(
        loadImage(EEK_DANCE_2)
          .then(() => frameOf(assets.get(EEK_DANCE_2)!.blob))
          .then((frame) => {
            drawTo(hold, frame)
          }),
      )
      const eekSoundJob = quiet(loadSound(EEK_SOUND))
      void Promise.allSettled([dance1Job, dance2Job, eekSoundJob]).then((results) => {
        eekReady = results[0]?.status === 'fulfilled' && results[1]?.status === 'fulfilled'
      })

      try {
        await Promise.all([catJob, patJob])
        const frame = await frameOf(assets.get(CAT_IMG)!.blob)
        stage.style.aspectRatio = `${String(frame.w)} / ${String(frame.h)}`
        drawTo(idle, frame)
        await Promise.allSettled(meowJobs)
      } catch {
        clearTimeout(slowTimer)
        hint.textContent =
          'Не удалось подготовить картинку кота. Проверь файлы и запускай через HTTP-сервер.'
        hint.classList.add(styles.hintError!)
        hint.hidden = false
        return
      }

      clearTimeout(slowTimer)
      hint.hidden = true
      syncView('idle')
      syncMode('idle')
      setReady(true)
    }

    void init()

    return () => {
      clearGroup('cat')
      clearGroup('pat')
      clearGroup('eek')
      stopSource(meowSource)
      stopSource(eekSource)
      if (actx) actx.close().catch(() => {})
      cat.removeEventListener('keydown', onKeyDown)
      cat.removeEventListener('click', onClick)
    }
  }, [])

  return (
    <div className={styles.root} data-mode={mode}>
      <div className={styles.stage} ref={stageRef}>
        <button
          className={styles.cat}
          ref={catRef}
          type="button"
          aria-label="Погладить silly cat"
          data-view={view}
          disabled={!ready}
        >
          <div className={styles.sprite} ref={spriteRef}>
            <canvas className={styles.idle} ref={idleRef} />
            <canvas className={styles.hold} ref={holdRef} />
            <img className={styles.anim} ref={animRef} alt="" draggable={false} />
          </div>
        </button>
        <div className={styles.pat} ref={patRef}>
          <img className={styles.patImg} ref={patImgRef} alt="" draggable={false} />
        </div>
      </div>
      <p className={styles.hint} ref={hintRef} hidden />
      <p className={styles.srOnly} ref={statusRef} role="status" aria-live="polite" />
    </div>
  )
}

