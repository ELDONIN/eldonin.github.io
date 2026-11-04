(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  var screenEl = $('screen');
  var overlay = $('overlay');
  var overlayText = $('overlay-text');
  var progress = $('progress');
  var retryBtn = $('retry');
  var statusEl = $('status');
  var btnRestart = $('btn-restart');
  var btnPause = $('btn-pause');
  var btnFull = $('btn-full');

  var emulator = null;
  var startToken = 0;
  var paused = false;

  function showOverlay(text, opts) {
    opts = opts || {};
    overlay.hidden = false;
    overlay.classList.toggle('error', !!opts.error);
    overlayText.textContent = text;
    progress.hidden = !opts.progress;
    retryBtn.hidden = !opts.retry;
  }

  function hideOverlay() { overlay.hidden = true; }

  function setReady(ready) {
    btnRestart.disabled = !ready;
    btnPause.disabled = !ready;
  }

  function destroyEmulator() {
    if (!emulator) return;
    try { emulator.destroy(); } catch (e) { /* ignore */ }
    emulator = null;
    queue.length = 0;
    paused = false;
    btnPause.textContent = 'Пауза';
    setReady(false);
  }

  function fetchBuffer(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error(url + ' (' + r.status + ')');
      return r.arrayBuffer();
    }, function () { throw new Error(url); });
  }

  function checkFile(url) {
    return fetch(url, { method: 'HEAD' }).then(function (r) {
      if (!r.ok) throw new Error(url + ' (' + r.status + ')');
    }, function () { throw new Error(url); });
  }

  function start() {
    destroyEmulator();
    statusEl.textContent = '';

    if (typeof V86 === 'undefined') {
      showOverlay('Не удалось загрузить эмулятор (assets/libv86.js).', { error: true, retry: true });
      return;
    }
    if (typeof WebAssembly === 'undefined') {
      showOverlay('Ваш браузер не поддерживает WebAssembly.', { error: true });
      return;
    }

    showOverlay('Загрузка эмулятора и дискеты…', { progress: true });
    progress.removeAttribute('value');

    var token = ++startToken;

    // Сами скачиваем файлы, чтобы показать понятную ошибку, если что-то недоступно.
    Promise.all([
      fetchBuffer('assets/nasa-spoc.img'),
      fetchBuffer('assets/seabios.bin'),
      fetchBuffer('assets/vgabios.bin'),
      checkFile('assets/v86.wasm')
    ]).then(function (res) {
      if (token === startToken) boot(token, res[0], res[1], res[2]);
    }).catch(function (err) {
      if (token !== startToken) return;
      showOverlay('Не удалось загрузить ' + err.message + '. Проверьте соединение.', { error: true, retry: true });
    });
  }

  function boot(token, floppy, bios, vgabios) {
    try {
      emulator = new V86({
        wasm_path: 'assets/v86.wasm',
        bios: { buffer: bios },
        vga_bios: { buffer: vgabios },
        fda: { buffer: floppy },
        memory_size: 16 * 1024 * 1024,
        vga_memory_size: 8 * 1024 * 1024,
        screen_container: screenEl,
        disable_keyboard: true,
        autostart: true
      });
    } catch (err) {
      showOverlay('Ошибка запуска: ' + err.message, { error: true, retry: true });
      return;
    }

    var em = emulator;
    var watchdog = setTimeout(function () {
      if (em !== emulator || overlay.hidden) return;
      showOverlay('Эмулятор не запустился. Попробуйте ещё раз.', { error: true, retry: true });
    }, 30000);

    em.add_listener('emulator-ready', function () {
      clearTimeout(watchdog);
      if (em !== emulator || token !== startToken) return;
      setReady(true);
      hideOverlay();
      screenEl.focus();
      statusEl.textContent = 'Система запущена. Кликните по экрану, чтобы вводить с клавиатуры.';
    });
  }


  // ---------- Клавиатура ----------
  // SPOC опрашивает клавиатуру по таймеру: слишком короткие или слишком частые нажатия
  // он теряет или дублирует. Поэтому события браузера превращаются в «импульсы»
  // с фиксированной длиной, а все изменения идут через одну очередь.
  var HOLD_MS = 120;       // сколько удерживается обычная клавиша
  var GAP_MS = 60;         // пауза после неё
  var MOD_DOWN_MS = 150;   // пауза после нажатия CODE/Shift/Ctrl, прежде чем идёт основная клавиша
  var MOD_UP_MS = 40;

  // e.code -> скан-коды set 1 (физические клавиши, раскладка US)
  var SCANCODES = (function () {
    var m = {
      Escape: [0x01], Minus: [0x0C], Equal: [0x0D], Backspace: [0x0E], Tab: [0x0F],
      BracketLeft: [0x1A], BracketRight: [0x1B], Enter: [0x1C], Semicolon: [0x27],
      Quote: [0x28], Backquote: [0x29], Backslash: [0x2B], Comma: [0x33], Period: [0x34],
      Slash: [0x35], Space: [0x39], CapsLock: [0x3A],
      ArrowUp: [0xE0, 0x48], ArrowLeft: [0xE0, 0x4B], ArrowRight: [0xE0, 0x4D], ArrowDown: [0xE0, 0x50],
      Home: [0xE0, 0x47], End: [0xE0, 0x4F], PageUp: [0xE0, 0x49], PageDown: [0xE0, 0x51],
      Insert: [0xE0, 0x52], Delete: [0xE0, 0x53], NumpadEnter: [0xE0, 0x1C], NumpadDivide: [0xE0, 0x35],
      NumpadMultiply: [0x37], NumpadSubtract: [0x4A], NumpadAdd: [0x4E], NumpadDecimal: [0x53]
    };
    'Digit1 Digit2 Digit3 Digit4 Digit5 Digit6 Digit7 Digit8 Digit9 Digit0'.split(' ')
      .forEach(function (c, i) { m[c] = [0x02 + i]; });
    [['QWERTYUIOP', 0x10], ['ASDFGHJKL', 0x1E], ['ZXCVBNM', 0x2C]].forEach(function (row) {
      row[0].split('').forEach(function (ch, i) { m['Key' + ch] = [row[1] + i]; });
    });
    for (var f = 1; f <= 10; f++) m['F' + f] = [0x3A + f];
    for (var n = 0; n <= 9; n++) m['Numpad' + n] = [[0x52, 0x4F, 0x50, 0x51, 0x4B, 0x4C, 0x4D, 0x47, 0x48, 0x49][n]];
    return m;
  })();

  var MODIFIERS = {
    ShiftLeft: [0x2A], ShiftRight: [0x36], ControlLeft: [0x1D], ControlRight: [0x1D],
    AltLeft: [0x38], AltRight: [0x38]
  };
  // Клавиши, которые оставляем браузеру (перезагрузка, полноэкранный режим, DevTools)
  var PASS_THROUGH = { F5: 1, F11: 1, F12: 1, Tab: 1 };

  var queue = [];
  var pumping = false;
  var downMods = {};

  function brk(codes) {
    return codes.map(function (c) { return c === 0xE0 ? c : (c | 0x80); });
  }

  function enqueue(bytes, waitMs) {
    queue.push({ bytes: bytes, wait: waitMs });
    if (!pumping) pump();
  }

  function pump() {
    var item = queue.shift();
    if (!item) { pumping = false; return; }
    pumping = true;
    if (emulator && !paused) emulator.keyboard_send_scancodes(item.bytes);
    setTimeout(pump, item.wait);
  }

  function clearKeyboard() {
    queue.length = 0;
    Object.keys(downMods).forEach(function (code) {
      if (emulator) emulator.keyboard_send_scancodes(brk(MODIFIERS[code]));
    });
    downMods = {};
  }

  function inGuestFocus() { return document.activeElement === screenEl && emulator; }

  function onKeyDown(e) {
    if (!inGuestFocus() || e.metaKey || PASS_THROUGH[e.code]) return;
    var mod = MODIFIERS[e.code];
    var codes = SCANCODES[e.code];
    if (!mod && !codes) return;
    e.preventDefault();
    if (e.repeat) return; // автоповтор браузера игнорируем
    if (mod) {
      if (downMods[e.code]) return;
      downMods[e.code] = true;
      enqueue(mod, MOD_DOWN_MS);
    } else {
      enqueue(codes, HOLD_MS);
      enqueue(brk(codes), GAP_MS);
    }
  }

  function onKeyUp(e) {
    if (!inGuestFocus()) return;
    var mod = MODIFIERS[e.code];
    if (mod && downMods[e.code]) {
      delete downMods[e.code];
      enqueue(brk(mod), MOD_UP_MS);
      e.preventDefault();
    } else if (SCANCODES[e.code] && !PASS_THROUGH[e.code]) {
      e.preventDefault();
    }
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  screenEl.addEventListener('blur', clearKeyboard);

  btnRestart.addEventListener('click', function () {
    if (!emulator) return;
    paused = false;
    btnPause.textContent = 'Пауза';
    clearKeyboard();
    emulator.restart();
    screenEl.focus();
  });

  btnPause.addEventListener('click', function () {
    if (!emulator) return;
    if (paused) { emulator.run(); btnPause.textContent = 'Пауза'; }
    else { emulator.stop(); btnPause.textContent = 'Продолжить'; }
    paused = !paused;
  });

  btnFull.addEventListener('click', function () {
    var stage = document.querySelector('.stage');
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (stage.requestFullscreen) {
      stage.requestFullscreen().catch(function () {
        statusEl.textContent = 'Полноэкранный режим недоступен в этом браузере.';
      });
    } else {
      statusEl.textContent = 'Полноэкранный режим недоступен в этом браузере.';
    }
  });

  screenEl.addEventListener('click', function () { screenEl.focus(); });
  retryBtn.addEventListener('click', start);

  start();
})();
