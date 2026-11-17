/* Интерфейс: вкладки, прогресс, навигация по вопросам, фильтры доп. шкал, регистрационный лист.
   Подсчёт баллов — в app.js / smil.js, хранение и файлы — в io.js. */
(function () {
  var TOTAL = 566, TAB_KEY = 'smil_tab', ADV_KEY = 'smil_auto_adv';
  var TABS = ['questions', 'results', 'reg'];
  var rows = [], nez = [], ispr = [];
  var activeN = 0, scrollPos = {}, lastPlot = null;

  function $id(id) { return document.getElementById(id); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // ---------- график: запоминаем последний plot, чтобы перерисовать после смены размеров ----------
  var origPlot = $.plot;
  $.plot = function () { var p = origPlot.apply(this, arguments); lastPlot = p; return p; };
  $.plot.version = origPlot.version; $.plot.plugins = origPlot.plugins;
  function redraw() {
    if (!lastPlot) return;
    try { lastPlot.resize(); lastPlot.setupGrid(); lastPlot.draw(); } catch (e) {}
  }

  // ---------- кэш элементов ----------
  function cache() {
    for (var n = 1; n <= TOTAL; n++) {
      rows[n] = $id('vopros_' + n).parentNode;
      nez[n] = $id('nez_' + n);
      ispr[n] = $id('ispr_' + n);
    }
  }
  function answered(n) { return ispr[n].value !== '0'; }
  function nextUnanswered(from) {
    var n;
    for (n = from + 1; n <= TOTAL; n++) if (!answered(n)) return n;
    for (n = 1; n < from; n++) if (!answered(n)) return n;
    return 0;
  }

  // ---------- прогресс и отметки «отвечено» ----------
  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(function () { scheduled = false; updateProgress(); }, 0);
  }
  function updateProgress() {
    var cnt = 0, n, a;
    for (n = 1; n <= TOTAL; n++) {
      a = answered(n);
      if (a) cnt++;
      if (rows[n].classList.contains('ans') !== a) rows[n].classList.toggle('ans', a);
      if (nez[n].classList.contains('noans') === a) nez[n].classList.toggle('noans', !a);
    }
    $id('p_text').textContent = 'Отвечено: ' + cnt + ' из ' + TOTAL + (cnt < TOTAL ? ' · осталось ' + (TOTAL - cnt) : ' ✓');
    $id('p_fill').style.width = (cnt * 100 / TOTAL) + '%';
    document.body.classList.toggle('all_answered', cnt === TOTAL);
  }
  // divFunction вызывается из разметки по имени, поэтому оборачиваем глобальную функцию
  var prevDiv = window.divFunction;
  window.divFunction = function () {
    try { return prevDiv.apply(this, arguments); } finally { schedule(); }
  };

  // ---------- активный вопрос ----------
  function setActive(n) {
    if (activeN && rows[activeN]) rows[activeN].classList.remove('q_active');
    activeN = n || 0;
    if (activeN && rows[activeN]) rows[activeN].classList.add('q_active');
  }
  function scrollToRow(n, smooth) {
    rows[n].scrollIntoView({ block: 'center', behavior: smooth ? 'smooth' : 'auto' });
  }
  function goToQuestion(n) {
    n = Math.max(1, Math.min(TOTAL, parseInt(n, 10) || 0));
    if (!n) return;
    showTab('questions');
    var only = $id('only_unans');
    if (only.checked && answered(n)) { only.checked = false; applyFilter(); }
    setActive(n);
    scrollToRow(n, false);
  }
  function applyFilter() {
    document.body.classList.toggle('only_unans', $id('only_unans').checked);
    updateProgress();
  }

  // ---------- вкладки ----------
  function showTab(name, keepScroll) {
    if (TABS.indexOf(name) < 0) name = 'questions';
    var prev = document.body.getAttribute('data-tab');
    if (prev === name) return;
    if (prev) scrollPos[prev] = window.scrollY;
    document.body.setAttribute('data-tab', name);
    [].forEach.call(document.querySelectorAll('#tabs button'), function (b) {
      b.setAttribute('aria-selected', b.getAttribute('data-tab') === name ? 'true' : 'false');
    });
    if (name === 'results') computeDop();
    lsSet(TAB_KEY, name);
    if (!keepScroll) window.scrollTo(0, scrollPos[name] || 0);
    setTimeout(redraw, 0);
  }

  // ---------- доп. шкалы: поиск, сортировка, фильтр ----------
  var dopRows = null;
  function computeDop() {
    try { dopshkali(); } catch (e) {}
    if (!dopRows) {
      dopRows = [].slice.call(document.querySelectorAll('#d_sk tr')).filter(function (tr) {
        return /_dop_sk$/.test((tr.children[1] || {}).id || '');
      }).map(function (tr, i) { return { tr: tr, i: i, name: tr.children[0].textContent.toLowerCase() }; });
    }
    applyDop();
  }
  function applyDop() {
    if (!dopRows) return;
    var q = $id('dop_q').value.trim().toLowerCase(), sort = $id('dop_sort').value, out = $id('dop_out').checked, shown = 0, outside = 0;
    dopRows.forEach(function (r) {
      r.t = parseFloat(r.tr.children[1].textContent.replace(',', '.'));
      r.raw = parseInt(r.tr.children[2].textContent, 10) || 0;
      r.dev = Math.abs(r.t - 50);
      r.out = r.t < 30 || r.t > 70;
      if (r.out) outside++;
    });
    var list = dopRows.slice().sort(function (a, b) {
      switch (sort) {
        case 'dev': return b.dev - a.dev || a.i - b.i;
        case 't_desc': return b.t - a.t || a.i - b.i;
        case 't_asc': return a.t - b.t || a.i - b.i;
        case 'raw': return b.raw - a.raw || a.i - b.i;
        default: return a.i - b.i;
      }
    });
    var tbody = $id('d_sk').tBodies[0];
    list.forEach(function (r) {
      tbody.appendChild(r.tr);
      var ok = (!q || r.name.indexOf(q) >= 0) && (!out || r.out);
      r.tr.style.display = ok ? '' : 'none';
      if (ok) shown++;
    });
    $id('dop_count').textContent = 'Показано ' + shown + ' из ' + dopRows.length + ' · вне нормы: ' + outside;
  }

  // ---------- старт ----------
  function init() {
    cache();
    // высота верхней панели нужна для липкой боковой панели и отступов прокрутки
    function measure() { document.documentElement.style.setProperty('--tb', $id('topbar').offsetHeight + 'px'); }
    measure();
    var rt; window.addEventListener('resize', function () { measure(); clearTimeout(rt); rt = setTimeout(redraw, 150); });

    $id('tabs').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (b) showTab(b.getAttribute('data-tab'));
    });

    // вопросы: активная строка, автопереход
    var adv = $id('auto_adv'); adv.checked = lsGet(ADV_KEY) !== '0';
    adv.addEventListener('change', function () { lsSet(ADV_KEY, adv.checked ? '1' : '0'); });
    $id('only_unans').addEventListener('change', applyFilter);
    $id('vopr_sk').addEventListener('click', function (e) {
      var el = e.target.closest('.otvet2'), n;
      if (!el) {
        var tr = e.target.closest('tr'), inp = tr && tr.querySelector('input[id^="ispr_"]');
        if (inp) setActive(parseInt(inp.id.slice(5), 10));
        return;
      }
      n = parseInt(el.id, 10); if (!n) return;
      var was = !answered(n);                       // capture: срабатывает до обработчика в разметке
      setTimeout(function () {
        var m = (was && adv.checked) ? nextUnanswered(n) : 0;
        if (m) { setActive(m); if (!$id('only_unans').checked) scrollToRow(m, true); } else setActive(n);
      }, 0);
    }, true);
    document.addEventListener('keydown', function (e) {
      if (document.body.getAttribute('data-tab') !== 'questions' || e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test((e.target || {}).tagName)) return;
      if ($id('modal_form_smil_dop').style.display === 'block') return;
      var k = { '1': 'da', '2': 'net', '3': 'neznay' }[e.key];
      if (k && activeN) { e.preventDefault(); $id(activeN + '_' + k).click(); }
    });
    $id('goto_btn').addEventListener('click', function () { goToQuestion($id('goto_n').value); });
    $id('goto_n').addEventListener('keydown', function (e) { if (e.key === 'Enter') goToQuestion(this.value); });
    function first() { var n = nextUnanswered(0); if (n) goToQuestion(n); }
    $id('first_unans').addEventListener('click', first);
    $id('reg_first').addEventListener('click', first);

    // регистрационный лист: клик по клетке открывает вопрос
    document.querySelector('.reg_wrap').addEventListener('click', function (e) {
      var td = e.target.closest('td[id^="nez_"]');
      if (td) goToQuestion(td.id.slice(4));
    });
    [].forEach.call(document.querySelectorAll('.reg_wrap td[id^="nez_"]'), function (td) { td.title = 'Вопрос ' + td.id.slice(4); });

    // доп. шкалы
    ['dop_q', 'dop_sort', 'dop_out'].forEach(function (id) {
      $id(id).addEventListener(id === 'dop_q' ? 'input' : 'change', applyDop);
    });

    updateProgress();
    setActive(nextUnanswered(0) || 1);
    var t = lsGet(TAB_KEY);
    document.body.removeAttribute('data-tab');       // чтобы showTab отработал полностью
    showTab(TABS.indexOf(t) >= 0 ? t : 'questions', true);
    setTimeout(redraw, 50);
  }
  $(init);
})();
