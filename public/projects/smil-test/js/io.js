/* Экспорт и импорт ответов в текстовый файл.

   Формат (UTF-8, по строке на вопрос; вопросы без ответа пропускаются):
       # СМИЛ: ответы
       1: Да
       2: Нет
       7: Да > Нет          <- сначала нажато "Да", потом "Нет" (итоговый ответ - последний)
       9: Нет > Не знаю > Да
   Допустимые значения: Да, Нет, Не знаю. Всё после "#" в строке игнорируется.
   Итоговый ответ на вопрос - последний в цепочке. Вся цепочка воспроизводится нажатиями
   в том же порядке, поэтому регистрационный лист (пометки об изменённых ответах) и баллы
   восстанавливаются точно так же, как были. Файл можно править вручную: достаточно "5: Да".

   Автосохранение: те же цепочки нажатий хранятся в localStorage (ключ smil_answers_v1) и
   восстанавливаются при открытии/обновлении страницы. Кнопка «Новый» очищает сохранение. */
(function () {
  var TOTAL = 566;
  var WORD = { D: 'Да', N: 'Нет', Z: 'Не знаю' };
  var CLICK = { D: [1, 0, 0, '_da'], N: [0, 1, 0, '_net'], Z: [0, 0, 1, '_neznay'] };
  var PARSE = { 'да': 'D', 'нет': 'N', 'не знаю': 'Z', 'незнаю': 'Z', 'не_знаю': 'Z' };
  var KEY = 'smil_answers_v1', MSG_KEY = 'smil_import_msg';
  var replaying = false;
  var history = {};                               // номер вопроса -> строка нажатий, например "DNZ"

  // запоминаем каждое нажатие на ответ (divFunction вызывается из разметки по имени)
  var origDivFunction = window.divFunction;
  window.divFunction = function (id, idv, da, net, neznay) {
    var q = parseInt(id, 10);
    history[q] = (history[q] || '') + (da ? 'D' : net ? 'N' : 'Z');
    var r = origDivFunction.apply(this, arguments);
    if (!replaying) save();
    return r;
  };

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(history)); } catch (e) { /* хранилище недоступно */ }
  }
  function load() {
    try {
      var o = JSON.parse(localStorage.getItem(KEY) || 'null'), out = {}, n = 0;
      if (!o || typeof o !== 'object') return null;
      Object.keys(o).forEach(function (k) {
        var q = parseInt(k, 10);
        if (q >= 1 && q <= TOTAL && /^[DNZ]+$/.test(o[k])) { out[q] = o[k]; n++; }
      });
      return n ? out : null;
    } catch (e) { return null; }
  }

  window.newTest = function () {
    if (answeredCount() && !confirm('Все ответы будут удалены. Начать новый тест?')) return;
    try { localStorage.removeItem(KEY); } catch (e) {}
    window.location.replace(window.location.href);
  };

  function answeredCount() {
    return Object.keys(history).length;
  }

  window.exportAnswers = function () {
    var lines = ['# СМИЛ: ответы', '# формат: <номер вопроса>: <ответ>[ > <следующий ответ> ...]  (Да / Нет / Не знаю)'], n = 0;
    for (var i = 1; i <= TOTAL; i++) {
      var seq = history[i];
      if (!seq) continue;
      lines.push(i + ': ' + seq.split('').map(function (c) { return WORD[c]; }).join(' > '));
      n++;
    }
    if (!n) { alert('Нет ответов для экспорта.'); return; }
    var d = new Date(), p = function (x) { return (x < 10 ? '0' : '') + x; };
    var name = 'smil_answers_' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '_' + p(d.getHours()) + p(d.getMinutes()) + '.txt';
    var blob = new Blob(['﻿' + lines.join('\r\n') + '\r\n'], { type: 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };

  // text -> { answers: {номер: 'DN'}, errors: [строки с проблемами] }
  function parse(text) {
    var res = { answers: {}, errors: [], count: 0 };
    text.replace(/^﻿/, '').split(/\r?\n/).forEach(function (raw, idx) {
      var line = raw.replace(/#.*/, '').trim();
      if (!line) return;
      var m = line.match(/^(\d+)\s*[:=]\s*(.+)$/);
      if (!m) { res.errors.push('строка ' + (idx + 1) + ': «' + raw.trim() + '»'); return; }
      var q = parseInt(m[1], 10), seq = '', ok = q >= 1 && q <= TOTAL;
      m[2].split(/\s*[>,;]\s*/).forEach(function (w) {
        var k = PARSE[w.trim().toLowerCase().replace(/\s+/g, ' ')];
        if (k) seq += k; else ok = false;
      });
      if (!ok || !seq) { res.errors.push('строка ' + (idx + 1) + ': «' + raw.trim() + '»'); return; }
      if (!res.answers[q]) res.count++;
      res.answers[q] = seq;
    });
    return res;
  }

  function apply(answers) {
    var qs = Object.keys(answers).map(Number).sort(function (a, b) { return a - b; });
    var calls = [];
    qs.forEach(function (q) {
      answers[q].split('').forEach(function (c) { calls.push([q, c]); });
    });
    var realPlot = $.plot;
    replaying = true;
    $.plot = function () {};                      // не перерисовываем график на каждом нажатии
    try {
      calls.forEach(function (x, i) {
        if (i === calls.length - 1) $.plot = realPlot;   // последний вызов перерисует график
        var c = CLICK[x[1]];
        divFunction(String(x[0]), x[0] + c[3], c[0], c[1], c[2]);
      });
    } finally { $.plot = realPlot; replaying = false; save(); }
  }

  function summary(res) {
    var msg = 'Загружено ответов: ' + res.count + '.';
    if (res.errors.length) msg += '\nПропущены строки с ошибками (' + res.errors.length + '):\n' + res.errors.slice(0, 8).join('\n') + (res.errors.length > 8 ? '\n…' : '');
    return msg;
  }

  function handleText(text) {
    var res = parse(text);
    if (!res.count) { alert('В файле не найдено ни одного ответа.' + (res.errors.length ? '\nПример ошибки: ' + res.errors[0] : '')); return; }
    if (answeredCount() === 0) { apply(res.answers); alert(summary(res)); return; }
    if (!confirm('Текущие ответы будут заменены ответами из файла. Продолжить?')) return;
    // чтобы сбросить прежнее состояние, кладём новые ответы в сохранение и перезагружаем страницу
    try {
      localStorage.setItem(KEY, JSON.stringify(res.answers));
      try { sessionStorage.setItem(MSG_KEY, summary(res)); } catch (e) {}
      window.location.replace(window.location.href);
    } catch (e) { alert('Браузер не позволил сбросить тест автоматически. Нажмите «Новый» и повторите импорт.'); }
  }

  window.importAnswers = function () { document.getElementById('import_file').click(); };

  $(function () {
    document.getElementById('import_file').addEventListener('change', function () {
      var f = this.files && this.files[0], input = this;
      if (!f) return;
      var r = new FileReader();
      r.onload = function () { input.value = ''; handleText(String(r.result)); };
      r.onerror = function () { alert('Не удалось прочитать файл.'); };
      r.readAsText(f, 'utf-8');
    });
    // восстановление сохранённых ответов
    var saved = load();
    if (saved) apply(saved);
    var msg = null;
    try { msg = sessionStorage.getItem(MSG_KEY); sessionStorage.removeItem(MSG_KEY); } catch (e) {}
    if (msg) setTimeout(function () { alert(msg); }, 100);
  });
})();
