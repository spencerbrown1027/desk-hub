/* RMBS Desk Hub - front-end (vanilla JS, no dependencies). */
(function () {
  'use strict';
  var D = window.HUB_DATA || JSON.parse(document.getElementById('hub-data').textContent);
  var C = window.Calcs, EX = window.CalcExamples;

  /* ================= helpers ================= */
  function h(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'text') e.textContent = v;
      else if (k === 'style') e.style.cssText = v;
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    add(e, kids);
    return e;
  }
  function add(e, kids) {
    if (kids == null) return e;
    if (!Array.isArray(kids)) kids = [kids];
    kids.forEach(function (k) {
      if (k == null || k === false) return;
      if (Array.isArray(k)) add(e, k);
      else e.appendChild(typeof k === 'object' ? k : document.createTextNode(String(k)));
    });
    return e;
  }
  function svgEl(tag, attrs) { var e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { toast('Could not save (storage blocked)'); } }
  };
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function pd(s) { var p = s.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); }
  function iso(d) { return d.toISOString().slice(0, 10); }
  function fmtDate(s, withYear) { var d = pd(s); return DOW[d.getUTCDay()] + ' ' + MON[d.getUTCMonth()] + ' ' + d.getUTCDate() + (withYear === false ? '' : ', ' + d.getUTCFullYear()); }
  function shortDate(s) { var d = pd(s); return MON[d.getUTCMonth()] + ' ' + d.getUTCDate(); }
  function ctNow() {
    var parts = {}; new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
      .formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    return { date: parts.year + '-' + parts.month + '-' + parts.day, hm: (parts.hour === '24' ? '00' : parts.hour) + ':' + parts.minute };
  }
  function nf(x, dp) { return x == null || !isFinite(x) ? '—' : Number(x).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp }); }
  function money(x, dp) { if (x == null || !isFinite(x)) return '—'; return (x < 0 ? '−$' : '$') + nf(Math.abs(x), dp == null ? 0 : dp); }
  function pct(x, dp) { return x == null || !isFinite(x) ? '—' : nf(x * 100, dp == null ? 2 : dp) + '%'; }
  function dirClass(s) { s = s || ''; return /▲/.test(s) ? 'up' : /▼/.test(s) ? 'dn' : 'flat'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function toast(msg) { var t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('show'); }, 2200); }
  function toCSV(rows, cols) {
    var q = function (v) { v = v == null ? '' : String(v); return /[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    return [cols.map(function (c) { return q(c[1]); }).join(',')].concat(rows.map(function (r) {
      return cols.map(function (c) { return q(typeof c[0] === 'function' ? c[0](r) : r[c[0]]); }).join(',');
    })).join('\r\n');
  }
  function download(name, content, mime) {
    var b = content instanceof Blob ? content : new Blob([content], { type: mime || 'text/csv;charset=utf-8' });
    var a = h('a', { href: URL.createObjectURL(b), download: name }); document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function terms(q) { return (q || '').toLowerCase().split(/\s+/).filter(Boolean); }
  function matchAll(text, ts) { text = (text || '').toLowerCase(); return ts.every(function (t) { return text.indexOf(t) >= 0; }); }
  function reEsc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function table(cols, rows, opts) {
    opts = opts || {};
    return h('div', { class: 'tbl-wrap' }, h('table', { class: opts.cls || '' }, [
      h('thead', null, h('tr', null, cols.map(function (c) { return h('th', { class: c.num ? 'num' : null }, c.label); }))),
      h('tbody', null, rows.length ? rows.map(function (r) {
        return h('tr', null, cols.map(function (c) { var v = c.get(r); return h('td', { class: (c.num ? 'num ' : '') + (c.cls ? c.cls(r) : '') }, v); }));
      }) : h('tr', null, h('td', { colspan: cols.length, class: 'empty' }, opts.empty || 'Nothing to show')))
    ]));
  }

  /* ================= data prep ================= */
  var briefs = D.briefs.slice().sort(function (a, b) { return b.date.localeCompare(a.date) || ((a.variant ? 1 : 0) - (b.variant ? 1 : 0)); });
  var latest = briefs[0];
  var pulseBrief = briefs.filter(function (b) { return b.pulse; })[0];
  var L = latest ? latest.levels : {};
  var rates = D.rates;

  /* ================= LIVE TREASURIES (Tradeweb OTC via CNBC public quote feed) ================= */
  // Separate from brief history: polled in the browser while the tab is open. If the live call is
  // blocked (offline, CORS, rate limit) we show the snapshot taken at the last hub build instead.
  var LIVE = (function () {
    var SYMS = ['US1Y', 'US2Y', 'US5Y', 'US10Y', 'US30Y'];
    var URL = 'https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol?symbols=' + encodeURIComponent(SYMS.join('|')) +
      '&requestMethod=itv&noform=1&partnerId=2&fund=1&exthrs=1&output=json&events=1';
    var EVERY = 120000; // auto-refresh interval while visible (ms)
    var snap = D.liveUst || null;
    var state = { quotes: snap ? snap.quotes : null, mode: snap ? 'snapshot' : 'none', fetchedAt: snap ? new Date(snap.fetched_at) : null, error: '', busy: false };
    var subs = [], timer = null, auto = store.get('deskhub.liveAuto', true);
    function num(s) { var v = parseFloat(String(s == null ? '' : s).replace(/[%,]/g, '')); return isFinite(v) ? v : null; }
    function parse(j) {
      var arr = (j && j.FormattedQuoteResult && j.FormattedQuoteResult.FormattedQuote) || [], out = {};
      arr.forEach(function (q) {
        var y = num(q.last); if (SYMS.indexOf(q.symbol) < 0 || y == null || y <= 0 || y > 25) return;
        out[q.symbol] = { yield: y, change: num(q.change), prev_close: num(q.previous_day_closing), open: num(q.open), high: num(q.high), low: num(q.low),
          time: q.last_time || null, time_label: q.last_timedate || '', exchange: q.exchange || '', status: q.curmktstatus || '', name: q.name || q.symbol };
      });
      return out;
    }
    function emit() { subs.forEach(function (f) { try { f(state); } catch (e) { console.error(e); } }); }
    function refresh(manual) {
      if (state.busy) return; state.busy = true; emit();
      var ctl = window.AbortController ? new AbortController() : null, to = setTimeout(function () { if (ctl) ctl.abort(); }, 12000);
      fetch(URL + '&_=' + Date.now(), { cache: 'no-store', credentials: 'omit', signal: ctl ? ctl.signal : undefined })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (j) {
          var q = parse(j); if (!q.US10Y || !q.US2Y) throw new Error('no 2Y/10Y in response');
          state.quotes = q; state.mode = 'live'; state.fetchedAt = new Date(); state.error = '';
          if (manual) toast('Treasuries refreshed');
        })
        .catch(function (e) {
          state.error = (e && e.name === 'AbortError') ? 'timed out' : (e && e.message) || 'blocked';
          if (state.mode !== 'live') { state.mode = snap ? 'snapshot' : 'none'; }
          if (manual) toast('Live quote fetch failed (' + state.error + ')');
        })
        .then(function () { clearTimeout(to); state.busy = false; emit(); });
    }
    function schedule() {
      clearInterval(timer); timer = null;
      if (auto) timer = setInterval(function () { if (!document.hidden) refresh(false); }, EVERY);
    }
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && auto && state.fetchedAt && Date.now() - state.fetchedAt.getTime() > EVERY) refresh(false);
    });
    var started = false;
    return {
      state: state, every: EVERY, snap: snap,
      subscribe: function (f) { subs.push(f); f(state); if (!started) { started = true; refresh(false); schedule(); } },
      refresh: refresh,
      auto: function (v) { if (v === undefined) return auto; auto = !!v; store.set('deskhub.liveAuto', auto); schedule(); if (auto) refresh(false); }
    };
  })();
  function ctTime(d, withDate) {
    if (!d || isNaN(d)) return '—';
    var o = { timeZone: 'America/Chicago', hour: 'numeric', minute: '2-digit' };
    var t = d.toLocaleTimeString('en-US', o), ds = d.toLocaleDateString('en-US', { timeZone: 'America/Chicago', month: 'short', day: 'numeric' });
    var today = new Date().toLocaleDateString('en-US', { timeZone: 'America/Chicago', month: 'short', day: 'numeric' });
    return (withDate || ds !== today ? ds + ', ' : '') + t + ' CT';
  }
  function liveCard(opts) {
    opts = opts || {};
    var body = h('div', { class: 'live-body' }), status = h('div', { class: 'live-status fine' });
    var btn = h('button', { class: 'btn sm', onclick: function () { LIVE.refresh(true); } }, '↻ Refresh');
    var cb = h('input', { type: 'checkbox', onchange: function () { LIVE.auto(this.checked); } }); cb.checked = LIVE.auto();
    var badge = h('span', { class: 'badge' }, '');
    var card = h('div', { class: 'card live' }, [
      h('div', { class: 'live-head' }, [h('h2', null, ['Live Treasuries', badge, h('span', { class: 'badge gray' }, 'Tradeweb OTC via CNBC')]),
        h('div', { class: 'live-ctl' }, [h('label', { class: 'fine live-auto' }, [cb, ' auto-refresh every ' + Math.round(LIVE.every / 60000) + ' min']), btn])]),
      body, status,
      h('p', { class: 'fine' }, 'Live strip only — separate from the brief history' + (opts.home ? ' and KPI cards above' : ' charts below') + ', which stay the once-a-day AM prints from each brief. ' +
        'Yields are on-the-run OTC quotes (Tradeweb, as published on CNBC; may lag a few seconds), not official Treasury CMT closes. Spreads = simple differences, in bp. Chg = vs prior close. ' +
        'Brief AM column = level printed in the ' + (latest ? shortDate(latest.date) : 'latest') + ' brief.')
    ]);
    var bpf = function (v, dp, sign) { return v == null || !isFinite(v) ? '—' : (sign && v > 0 ? '+' : v < 0 ? '−' : '') + nf(Math.abs(v), dp == null ? 1 : dp); };
    var cls = function (v) { return v == null ? 'flat' : v > 0.00001 ? 'up' : v < -0.00001 ? 'dn' : 'flat'; };
    function render(s) {
      body.innerHTML = ''; btn.disabled = s.busy ? true : null; btn.textContent = s.busy ? '↻ Refreshing…' : '↻ Refresh';
      badge.className = 'badge ' + (s.mode === 'live' ? 'green' : s.mode === 'snapshot' ? 'gold' : 'gray');
      badge.textContent = s.mode === 'live' ? 'LIVE · browser fetch' : s.mode === 'snapshot' ? 'as of last hub update' : 'unavailable';
      var Q = s.quotes;
      if (!Q) { body.appendChild(h('p', { class: 'empty' }, 'No live quotes yet' + (s.error ? ' (' + s.error + ')' : '') + '. Use the CNBC links in Quick links.')); }
      else {
        var tenors = [['US1Y', '1Y'], ['US2Y', '2Y', 'ust2'], ['US5Y', '5Y'], ['US10Y', '10Y', 'ust10'], ['US30Y', '30Y']];
        body.appendChild(h('div', { class: 'live-grid' }, tenors.filter(function (t) { return Q[t[0]]; }).map(function (t) {
          var q = Q[t[0]], chg = q.change != null ? q.change * 100 : null, br = t[2] && L[t[2]] != null ? (q.yield - L[t[2]]) * 100 : null;
          return h('div', { class: 'live-cell', title: (q.name || t[0]) + ' · ' + (q.exchange || '') + ' · last trade ' + ctTime(q.time ? new Date(q.time) : null, true) + (q.time_label ? ' (' + q.time_label + ')' : '') }, [
            h('div', { class: 'lb' }, t[1]), h('div', { class: 'v' }, nf(q.yield, 3) + '%'),
            h('div', { class: 's ' + cls(chg) }, bpf(chg, 1, true) + ' bp'),
            t[2] ? h('div', { class: 'br ' + cls(br) }, 'vs brief AM ' + nf(L[t[2]], 2) + '%: ' + bpf(br, 1, true) + ' bp') : null]);
        })));
        var sp = function (a, b) { return Q[a] && Q[b] ? (Q[b].yield - Q[a].yield) * 100 : null; };
        var spc = function (a, b) { return Q[a] && Q[b] && Q[a].change != null && Q[b].change != null ? (Q[b].change - Q[a].change) * 100 : null; };
        var spreads = [['2s10s', 'US2Y', 'US10Y', 10, 2], ['5s30s', 'US5Y', 'US30Y'], ['10s30s', 'US10Y', 'US30Y'], ['2s5s', 'US2Y', 'US5Y']];
        body.appendChild(h('div', { class: 'live-spreads' }, spreads.filter(function (x) { return Q[x[1]] && Q[x[2]]; }).map(function (x) {
          var v = sp(x[1], x[2]), c = spc(x[1], x[2]), br = x[0] === '2s10s' && L.ust10 != null && L.ust2 != null ? (L.ust10 - L.ust2) * 100 : null;
          return h('div', { class: 'live-sp' }, [h('b', null, x[0]), h('span', { class: 'n' }, bpf(v, 1, true) + ' bp'),
            h('span', { class: 's ' + (c == null ? 'flat' : c > 0 ? 'steep' : c < 0 ? 'flatn' : 'flat') }, (c == null ? '' : bpf(c, 1, true) + ' bp d/d')),
            br != null ? h('span', { class: 'fine' }, ' · brief AM ' + bpf(br, 0, true)) : null]);
        })));
        var t10 = Q.US10Y && Q.US10Y.time ? new Date(Q.US10Y.time) : null;
        var stale = t10 && Date.now() - t10.getTime() > 30 * 60000;
        status.innerHTML = '';
        add(status, [
          h('b', null, 'Quote time (10Y last trade): ' + ctTime(t10, true)),
          Q.US10Y && Q.US10Y.time_label ? ' (' + Q.US10Y.time_label + ' per CNBC)' : '',
          stale ? h('span', { class: 'badge gray' }, 'no trade in 30+ min — market closed/quiet') : null,
          ' · ' + (s.mode === 'live' ? 'Fetched live ' + ctTime(s.fetchedAt) + (LIVE.auto() ? ' · next auto-refresh in ~' + Math.round(LIVE.every / 60000) + ' min' : '') :
            'Snapshot from last hub update ' + (LIVE.snap ? LIVE.snap.fetched_at_ct : '') + (s.error ? ' — live browser fetch failed (' + s.error + '); refreshes on next publish' : '')),
          ' · ', h('a', { href: 'https://www.cnbc.com/quotes/US10Y', target: '_blank', rel: 'noopener' }, 'CNBC US10Y ↗'),
          ' ', h('a', { href: 'https://www.cnbc.com/quotes/US2Y', target: '_blank', rel: 'noopener' }, 'US2Y ↗')
        ]);
        return;
      }
      status.textContent = '';
    }
    LIVE.subscribe(render);
    return card;
  }

  /* ================= shell / router ================= */
  var SECTIONS = [
    ['home', 'Today', '⌂'], ['briefs', 'Briefs archive', '✉'], ['links', 'Market data links', '↗'], ['rates', 'Rates history', '∿'],
    ['guides', 'Guides', '▤'], ['calcs', 'Calculators', '∑'], ['calendar', 'Calendar', '▦'], ['deals', 'Deal tracker', '☰'],
    ['notes', 'PM question log', '✎'], ['glossary', 'Glossary', 'Aa']
  ];
  var RENDER = {}, rendered = {}, containers = {};
  var nav = document.getElementById('sidenav'), main = document.getElementById('main');
  SECTIONS.forEach(function (s) {
    nav.appendChild(h('a', { href: '#' + s[0], 'data-id': s[0] }, [h('span', { class: 'ico', 'aria-hidden': 'true' }, s[2]), s[1]]));
    containers[s[0]] = main.appendChild(h('section', { id: 'sec-' + s[0], hidden: true }));
  });
  nav.appendChild(h('div', { class: 'foot' }, [
    'Public sources only. No internal firm data. Market numbers come from dated desk briefs (except the Live Treasuries strip: public Tradeweb quotes via CNBC); calculator defaults are example numbers.',
    h('br'), 'Built ' + D.meta.built_at + ' · ' + D.meta.brief_count + ' brief files'
  ]));
  document.getElementById('topMeta').innerHTML = latest ? 'Latest brief <b>' + esc(fmtDate(latest.date)) + '</b> · built ' + esc(D.meta.built_at) : '';
  function route() {
    var hash = (location.hash || '#home').slice(1).split('/'), id = hash[0];
    if (!containers[id]) id = 'home';
    SECTIONS.forEach(function (s) { containers[s[0]].hidden = s[0] !== id; });
    [].forEach.call(nav.querySelectorAll('a'), function (a) { a.classList.toggle('active', a.getAttribute('data-id') === id); });
    if (!rendered[id]) { rendered[id] = true; try { RENDER[id](containers[id], hash.slice(1)); } catch (e) { console.error(e); containers[id].appendChild(h('div', { class: 'card empty' }, 'Error rendering section: ' + e.message)); } }
    else if (RENDER[id].onShow) RENDER[id].onShow(hash.slice(1));
    document.body.classList.remove('nav-open');
    document.getElementById('menuBtn').setAttribute('aria-expanded', 'false');
    var title = SECTIONS.filter(function (s) { return s[0] === id; })[0][1];
    document.title = title + ' · RMBS Desk Hub';
  }
  window.addEventListener('hashchange', function () { route(); main.scrollTop = 0; window.scrollTo(0, 0); });
  document.getElementById('menuBtn').addEventListener('click', function () {
    var open = document.body.classList.toggle('nav-open'); this.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.getElementById('scrim').addEventListener('click', function () { document.body.classList.remove('nav-open'); });
  document.getElementById('themeBtn').addEventListener('click', function () {
    var t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = t; store.set('deskhub.theme', t); try { localStorage.setItem('deskhub.theme', t); } catch (e) { }
  });
  function head(title, sub, right) {
    return h('div', { class: 'section-head' }, [h('div', null, [h('h1', { class: 'page' }, title), sub ? h('p', { class: 'sub', html: sub }) : null]), right || null]);
  }

  /* ================= calendar engine ================= */
  function isBiz(d) { var w = d.getUTCDay(); return w > 0 && w < 6; }
  function nthBizDay(y, m, n) { var c = 0; for (var day = 1; day <= 31; day++) { var d = new Date(Date.UTC(y, m, day)); if (d.getUTCMonth() !== m) break; if (isBiz(d) && ++c === n) return day; } return null; }
  function eventsOn(ds) {
    var d = pd(ds), w = d.getUTCDay(), y = d.getUTCFullYear(), m = d.getUTCMonth(), day = d.getUTCDate(), out = [];
    if (!isBiz(d)) return out;
    D.calendar.weekly.forEach(function (e) { if (e.dow === w) out.push({ time: e.time, what: e.what, source: e.source, key: e.key }); });
    D.calendar.monthly.forEach(function (e) {
      if (!e.rule) return; var hit = false, r = e.rule;
      if (r.indexOf('bday:') === 0) hit = nthBizDay(y, m, +r.slice(5)) === day;
      else if (r === 'firstfri') hit = w === 5 && day <= 7;
      else if (r === 'lasttue') hit = w === 2 && day + 7 > new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
      else if (r.indexOf('day:') === 0) { var t = +r.slice(4), td = new Date(Date.UTC(y, m, t)); while (!isBiz(td)) td = new Date(td.getTime() + 864e5); hit = iso(td) === ds; }
      if (hit) out.push({ time: e.time, what: e.what + (r === 'firstfri' ? ' (usual first-Friday rule — confirm on BLS)' : ''), source: e.source, key: e.key });
    });
    D.calendar.fomc.forEach(function (f) {
      if (f.decision === ds) out.push({ time: '1:00 pm', what: 'FOMC decision (' + f.dates + ')' + (f.sep ? ' + SEP/dots' : '') + '; presser 1:30 pm', source: 'Federal Reserve', key: true });
      var prev = iso(new Date(pd(f.decision).getTime() - 864e5)); if (prev === ds) out.push({ time: '—', what: 'FOMC day 1 (' + f.dates + ')', source: 'Federal Reserve' });
    });
    var order = function (t) { var mm = /(\d+):(\d+)\s*(am|pm)/.exec(t || ''); if (!mm) return /evening/.test(t) ? 2000 : /daily/.test(t) ? 1500 : 0; var hh = +mm[1] % 12 + (mm[3] === 'pm' ? 12 : 0); return hh * 100 + +mm[2]; };
    return out.sort(function (a, b) { return order(a.time) - order(b.time); });
  }
  function upcoming(n, fromDate) {
    var res = [], d = pd(fromDate || ctNow().date);
    for (var i = 0; i < 40 && res.length < n; i++) {
      var ds = iso(new Date(d.getTime() + i * 864e5));
      eventsOn(ds).forEach(function (e) { if (!/MND daily index/.test(e.what)) res.push(Object.assign({ date: ds }, e)); });
    }
    return res.slice(0, n);
  }

  /* ================= HOME ================= */
  function sparkline(key) {
    var pts = rates.map(function (r) { return r[key]; }), vals = pts.filter(function (v) { return v != null; });
    if (vals.length < 2) return null;
    var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals), W = 120, H = 26, s = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'none', 'aria-hidden': 'true' });
    var d = '', started = false;
    pts.forEach(function (v, i) { if (v == null) return; var x = i / (pts.length - 1) * W, y = H - 3 - (mx === mn ? 0.5 : (v - mn) / (mx - mn)) * (H - 6); d += (started ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); started = true; });
    s.appendChild(svgEl('path', { d: d, fill: 'none', stroke: 'currentColor', 'stroke-width': '1.6', opacity: '.55', 'vector-effect': 'non-scaling-stroke' }));
    return s;
  }
  RENDER.home = function (el) {
    if (!latest) { el.appendChild(h('div', { class: 'card empty' }, 'No briefs ingested yet. Run build.sh.')); return; }
    var hd = latest.header;
    el.appendChild(head('Today — ' + fmtDate(latest.date),
      'Key levels parsed from the latest desk brief (<b>' + esc(latest.file) + '</b>). ' + esc(hd.subtitle || '') +
      (pulseBrief && pulseBrief.pulse.asof ? ' · Pulse ' + esc(pulseBrief.pulse.asof) : ''),
      h('div', { class: 'chips' }, [h('a', { class: 'btn', href: '#briefs/' + latest.id }, 'Open full brief'), h('a', { class: 'btn ghost', href: '#rates' }, 'Rates history')])));
    var fedPct = (L.fed_sub || '').match(/~?\d+(?:[–-]\d+)?%/);
    var cards = [
      { lb: '10Y UST', v: L.ust10 != null ? nf(L.ust10, 2) + '%' : '—', s: L.ust10_card_sub, key: 'ust10', src: 'Live OTC AM per brief' },
      { lb: '2Y UST', v: L.ust2 != null ? nf(L.ust2, 2) + '%' : '—', s: L.ust2_card_sub, key: 'ust2', src: 'Live OTC AM per brief' },
      { lb: 'MND 30Y', v: L.mnd30 != null ? nf(L.mnd30, 2) + '%' : '—', s: L.mnd_note, key: 'mnd30', src: 'MND daily index (prior close)' },
      { lb: 'PMMS 30Y', v: L.pmms30 != null ? nf(L.pmms30, 2) + '%' : '—', s: (latest.kpis.filter(function (k) { return /pmms/i.test(k.label); })[0] || {}).sub || L.pmms_week, key: 'pmms30', src: 'Freddie Mac weekly survey' },
      { lb: 'Primary–10Y gap', v: L.gap_bp != null ? '~' + L.gap_bp + ' bp' : '—', s: L.gap_note, src: 'As stated in brief' },
      { lb: 'Fed odds', v: fedPct ? fedPct[0] : (L.fed_value || '—'), s: (fedPct ? (L.fed_sub || '').replace(fedPct[0], '').trim() + ' · ' : '') + 'Funds ' + (L.fed_value || '—'), src: 'CME FedWatch per brief' }
    ];
    el.appendChild(h('div', { class: 'kpis' }, cards.map(function (c) {
      return h('div', { class: 'kpi' }, [h('div', { class: 'lb' }, c.lb), h('div', { class: 'v' }, c.v), h('div', { class: 's ' + dirClass(c.s) }, c.s || ''),
        c.key ? h('div', { class: 'flat', title: 'Trend across ' + rates.length + ' daily briefs' }, sparkline(c.key)) : null,
        h('div', { class: 'src' }, 'Brief ' + shortDate(latest.date) + ' · ' + c.src)]);
    })));
    el.appendChild(liveCard({ home: true }));
    if (hd.headline) {
      var lead = hd.lead ? h('div', { class: 'l clamp' }, hd.lead) : null;
      el.appendChild(h('div', { class: 'banner' }, [h('div', { class: 'h' }, hd.headline), lead,
        lead ? h('button', { class: 'more', onclick: function () { var c = lead.classList.toggle('clamp'); this.textContent = c ? 'Show full lead ▾' : 'Show less ▴'; } }, 'Show full lead ▾') : null]));
    }
    if (pulseBrief) {
      var P = pulseBrief.pulse;
      el.appendChild(h('div', { class: 'card' }, [
        h('h2', null, ['PM Daily Pulse', h('span', { class: 'badge' }, P.asof || ''), pulseBrief.date !== latest.date ? h('span', { class: 'badge gold' }, 'from ' + fmtDate(pulseBrief.date)) : null,
          pulseBrief.variant ? h('span', { class: 'badge gray' }, pulseBrief.file) : null]),
        table([
          { label: 'PM question', get: function (r) { return r.q; } },
          { label: "Today's answer", get: function (r) { return r.a; }, cls: function (r) { return r.missing ? 'miss' : ''; } },
          { label: 'Change / signal', get: function (r) { return r.signal; }, cls: function (r) { return 'sig ' + (/DEFENSIVE|HIGH|Upside/i.test(r.signal) ? 'up' : dirClass(r.signal)); } },
          { label: 'Source', get: function (r) { return r.links.length ? r.links.map(function (l) { return h('div', null, h('a', { href: l.href, target: '_blank', rel: 'noopener' }, l.text)); }) : r.source; }, cls: function () { return 'srcs'; } }
        ], P.rows, { cls: 'pulse' })
      ]));
    }
    var grid = el.appendChild(h('div', { class: 'grid g2' }));
    if (latest.curve) {
      var cv = latest.curve;
      grid.appendChild(h('div', { class: 'card' }, [h('h2', null, [cv.title || 'Treasury curve', h('span', { class: 'badge' }, 'brief ' + shortDate(latest.date))]),
        h('p', { class: 'fine' }, cv.note),
        table(cv.columns.map(function (c, i) { return { label: c, num: i > 0, get: function (r) { return r[i] || ''; }, cls: function (r) { return i > 1 ? dirClass(r[i]) : ''; } }; }), cv.rows),
        cv.after ? h('p', { class: 'fine' }, cv.after) : null]));
    }
    grid.appendChild(h('div', { class: 'card' }, [h('h2', null, 'Trader takeaways'),
      latest.takeaways.length ? h('ul', null, latest.takeaways.map(function (t) { return h('li', null, t); })) : h('p', { class: 'empty' }, 'No takeaways block in this brief.'),
      h('h3', null, 'Up next (CT)'),
      h('div', null, upcoming(7).map(function (e) { return h('div', { class: 'ev' + (e.key ? ' key' : '') }, [h('b', null, fmtDate(e.date, false) + ' · ' + e.time), ' — ' + e.what]); })),
      h('p', { class: 'fine' }, h('a', { href: '#calendar' }, 'Full calendar & checklist →'))]));
    var quick = [['CNBC 10Y', 'https://www.cnbc.com/quotes/US10Y'], ['CNBC 2Y', 'https://www.cnbc.com/quotes/US2Y'], ['Treasury par curve', 'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve'],
      ['MND index', 'https://www.mortgagenewsdaily.com/mortgage-rates/mnd'], ['Freddie PMMS', 'https://www.freddiemac.com/pmms'], ['CME FedWatch', 'https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html'],
      ['KBRA RMBS', 'https://www.kbra.com/sectors/rmbs/transactions'], ['HousingWire', 'https://www.housingwire.com/'], ['FRED DGS10', 'https://fred.stlouisfed.org/series/DGS10']];
    el.appendChild(h('div', { class: 'card' }, [h('h2', null, 'Quick links'), h('div', { class: 'chips' }, quick.map(function (q) { return h('a', { class: 'chip', href: q[1], target: '_blank', rel: 'noopener' }, q[0] + ' ↗'); })
      .concat([h('a', { class: 'chip', href: '#calcs' }, '∑ Calculators'), h('a', { class: 'chip', href: '#guides/asks' }, '? PM asks table'), h('a', { class: 'chip', href: '#notes' }, '✎ Log a PM question'), h('a', { class: 'chip', href: '#deals' }, '☰ Deal tracker')]))]));
    el.appendChild(h('p', { class: 'fine' }, 'KPI cards, curve table and takeaways are copied from the dated brief file; nothing there is fetched live or estimated. Only the Live Treasuries strip is fetched live (public Tradeweb quotes via CNBC). ' + (latest.sources ? latest.sources.slice(0, 400) + (latest.sources.length > 400 ? '…' : '') : '')));
  };

  /* ================= BRIEFS ================= */
  RENDER.briefs = function (el, sub) {
    el.appendChild(head('Briefs archive', D.meta.brief_count + ' daily desk briefs (' + (D.meta.dates.length ? shortDate(D.meta.dates[0]) + ' – ' + fmtDate(D.meta.dates[D.meta.dates.length - 1]) : '') + ') plus ' + D.digests.length + ' digests/scans. Rendered sandboxed (no scripts).'));
    var tabs = el.appendChild(h('div', { class: 'tabs', role: 'tablist' }));
    var bodyB = el.appendChild(h('div')), bodyD = el.appendChild(h('div', { hidden: true }));
    var tb = tabs.appendChild(h('button', { class: 'on', onclick: function () { tb.classList.add('on'); td.classList.remove('on'); bodyB.hidden = false; bodyD.hidden = true; } }, 'Daily briefs (' + briefs.length + ')'));
    var td = tabs.appendChild(h('button', { onclick: function () { td.classList.add('on'); tb.classList.remove('on'); bodyB.hidden = true; bodyD.hidden = false; } }, 'Digests & scans (' + D.digests.length + ')'));
    var q = h('input', { type: 'search', placeholder: 'Search briefs (e.g. "NQM11", "PMMS", "FedWatch")…', 'aria-label': 'Search briefs' });
    var count = h('span', { class: 'fine' });
    bodyB.appendChild(h('div', { class: 'toolbar' }, [h('div', { class: 'grow' }, q), count]));
    var wrap = bodyB.appendChild(h('div', { class: 'briefs' }));
    var listCard = wrap.appendChild(h('div', { class: 'card', style: 'padding:0' })), list = listCard.appendChild(h('ul', { class: 'blist' }));
    var viewer = wrap.appendChild(h('div', { class: 'viewer card' }));
    var current = null;
    function highlighted(html, ts) {
      if (!ts.length) return html;
      var re = new RegExp('(' + ts.map(reEsc).join('|') + ')', 'gi');
      var bodyAt = html.indexOf('<body>');
      return html.slice(0, bodyAt) + html.slice(bodyAt).replace(/>([^<]+)</g, function (m, txt) { return '>' + txt.replace(re, '<mark style="background:#ffe58a">$1</mark>') + '<'; });
    }
    function show(b) {
      current = b; viewer.innerHTML = '';
      [].forEach.call(list.children, function (li) { li.classList.toggle('on', li.dataset.id === b.id); });
      var idx = briefs.indexOf(b);
      viewer.appendChild(h('div', { class: 'toolbar' }, [
        h('b', null, fmtDate(b.date)), b.variant ? h('span', { class: 'badge gold' }, b.variant) : null, h('span', { class: 'fine' }, b.file),
        h('span', { class: 'grow' }),
        h('button', { class: 'btn ghost sm', disabled: idx >= briefs.length - 1 ? true : null, onclick: function () { location.hash = 'briefs/' + briefs[idx + 1].id; } }, '← Older'),
        h('button', { class: 'btn ghost sm', disabled: idx <= 0 ? true : null, onclick: function () { location.hash = 'briefs/' + briefs[idx - 1].id; } }, 'Newer →'),
        h('button', { class: 'btn sm', onclick: function () { var u = URL.createObjectURL(new Blob([b.html], { type: 'text/html' })); window.open(u, '_blank'); setTimeout(function () { URL.revokeObjectURL(u); }, 60000); } }, 'Open in new tab'),
        h('button', { class: 'btn ghost sm', onclick: function () { download(b.file, b.html, 'text/html'); } }, 'Download')
      ]));
      var fr = h('iframe', { title: 'Desk brief ' + b.date, sandbox: 'allow-popups allow-popups-to-escape-sandbox', loading: 'lazy' });
      fr.srcdoc = highlighted(b.html, terms(q.value));
      viewer.appendChild(fr);
    }
    function renderList() {
      var ts = terms(q.value); list.innerHTML = ''; var n = 0;
      briefs.forEach(function (b) {
        if (ts.length && !matchAll(b.text, ts)) return; n++;
        var hits = ts.length ? (b.text.toLowerCase().split(ts[0]).length - 1) : 0;
        list.appendChild(h('li', { 'data-id': b.id, class: current === b ? 'on' : '', onclick: function () { location.hash = 'briefs/' + b.id; } }, [
          h('div', { class: 'd' }, [fmtDate(b.date) + ' ', b.variant ? h('span', { class: 'badge gold' }, b.variant) : null, hits ? h('span', { class: 'badge' }, hits + ' hit' + (hits > 1 ? 's' : '')) : null]),
          h('div', { class: 't' }, b.header.headline || b.header.subtitle || b.file)]));
      });
      count.textContent = n + ' of ' + briefs.length + ' briefs';
      if (!n) list.appendChild(h('li', { class: 'empty' }, 'No briefs match.'));
    }
    q.addEventListener('input', function () { renderList(); if (current) show(current); });
    renderList();
    function pick(s) { var b = s && s[0] ? briefs.filter(function (x) { return x.id === s[0] || x.date === s[0]; })[0] : null; show(b || current || briefs[0]); }
    RENDER.briefs.onShow = pick; pick(sub);
    // digests
    var dq = h('input', { type: 'search', placeholder: 'Search digests…' });
    bodyD.appendChild(h('div', { class: 'toolbar' }, h('div', { class: 'grow' }, dq)));
    var dl = bodyD.appendChild(h('div'));
    function renderDigests() {
      var ts = terms(dq.value); dl.innerHTML = '';
      D.digests.slice().sort(function (a, b) { return b.date.localeCompare(a.date); }).forEach(function (d) {
        if (ts.length && !matchAll(d.html.replace(/<[^>]+>/g, ' '), ts)) return;
        var det = h('details', { class: 'card' }, [h('summary', null, [h('b', null, fmtDate(d.date) + ' — '), d.title + ' ', h('span', { class: 'badge gray' }, d.file)]), h('div', { class: 'doc digest', html: d.html })]);
        dl.appendChild(det);
      });
      if (!dl.children.length) dl.appendChild(h('div', { class: 'card empty' }, 'No digests match.'));
    }
    dq.addEventListener('input', renderDigests); renderDigests();
  };

  /* ================= LINKS ================= */
  RENDER.links = function (el) {
    el.appendChild(head('Market data quick links', 'Live public sources, grouped. "Updates" times are Central Time, from the data guide (§2.1, §3.1, §8.4, §9, §12). Links open in a new tab.'));
    var q = h('input', { type: 'search', placeholder: 'Filter links (e.g. "FRED", "jumbo", "Thursday")…' });
    el.appendChild(h('div', { class: 'toolbar' }, h('div', { class: 'grow' }, q)));
    var grid = el.appendChild(h('div', { class: 'grid g2 links' }));
    function render() {
      var ts = terms(q.value); grid.innerHTML = '';
      D.links.forEach(function (g) {
        var items = g.items.filter(function (i) { return !ts.length || matchAll([g.group, i.name, i.updates, i.note, i.url].join(' '), ts); });
        if (!items.length) return;
        grid.appendChild(h('div', { class: 'card' }, [h('h2', null, [g.group, h('span', { class: 'badge gray' }, items.length)]),
          items.map(function (i) {
            return h('div', { class: 'item' }, [h('div', null, [h('a', { class: 'nm', href: i.url, target: '_blank', rel: 'noopener' }, i.name + ' ↗'), i.note ? h('div', { class: 'nt' }, i.note) : null]), h('div', { class: 'up' }, i.updates)]);
          })]));
      });
      if (!grid.children.length) grid.appendChild(h('div', { class: 'card empty' }, 'No links match.'));
    }
    q.addEventListener('input', render); render();
  };

  /* ================= RATES CHART ================= */
  function lineChart(rows, series, opts) {
    opts = opts || {};
    var W = 920, H = opts.h || 340, m = { l: 48, r: 16, t: 14, b: 36 }, iw = W - m.l - m.r, ih = H - m.t - m.b;
    var wrap = h('div', { class: 'chart-wrap' }), tip = h('div', { class: 'chart-tip' }), legend = h('div', { class: 'legend' });
    var on = {}; series.forEach(function (s) { on[s.key] = s.on !== false; });
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': opts.label || 'chart' });
    wrap.appendChild(svg); wrap.appendChild(tip);
    series.forEach(function (s) {
      legend.appendChild(h('button', { class: 'chip' + (on[s.key] ? ' on' : ''), onclick: function () { on[s.key] = !on[s.key]; this.classList.toggle('on', on[s.key]); draw(); } }, [h('span', { class: 'sw', style: 'background:' + s.color }), s.label]));
    });
    var n = rows.length, x = function (i) { return m.l + (n === 1 ? iw / 2 : i / (n - 1) * iw); }, y;
    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var vals = []; series.forEach(function (s) { if (on[s.key]) rows.forEach(function (r) { var v = s.get(r); if (v != null) vals.push(v); }); });
      if (!vals.length) vals = [0, 1];
      var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals), pad = (mx - mn) * 0.12 || 0.1; mn -= pad; mx += pad;
      var span = mx - mn, step = [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 25, 50, 100].filter(function (s) { return span / s <= 8; })[0] || 100;
      y = function (v) { return m.t + ih - (v - mn) / (mx - mn) * ih; };
      var g = svgEl('g', { class: 'axis' }); svg.appendChild(g);
      for (var t = Math.ceil(mn / step) * step; t <= mx; t += step) {
        g.appendChild(svgEl('line', { x1: m.l, x2: W - m.r, y1: y(t), y2: y(t), class: 'gridl', 'stroke-dasharray': '3 3' }));
        var tx = svgEl('text', { x: m.l - 6, y: y(t) + 4, 'text-anchor': 'end' }); tx.textContent = opts.fmt ? opts.fmt(t) : t.toFixed(step < 0.1 ? 2 : step < 1 ? 2 : 0); g.appendChild(tx);
      }
      var every = Math.max(1, Math.ceil(n / 10));
      rows.forEach(function (r, i) { if (i % every && i !== n - 1) return; var tx = svgEl('text', { x: x(i), y: H - 12, 'text-anchor': 'middle' }); tx.textContent = shortDate(r.date); g.appendChild(tx); });
      series.forEach(function (s) {
        if (!on[s.key]) return; var d = '', pen = false;
        rows.forEach(function (r, i) { var v = s.get(r); if (v == null) { pen = false; return; } d += (pen ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1); pen = true; });
        svg.appendChild(svgEl('path', { d: d, fill: 'none', stroke: s.color, 'stroke-width': 2.4, 'stroke-linejoin': 'round', 'stroke-dasharray': s.dash || '' }));
        rows.forEach(function (r, i) { var v = s.get(r); if (v != null) svg.appendChild(svgEl('circle', { cx: x(i), cy: y(v), r: 3.2, fill: s.color })); });
      });
      cursor = svgEl('line', { y1: m.t, y2: m.t + ih, stroke: 'currentColor', opacity: 0, 'stroke-dasharray': '2 3' }); svg.appendChild(cursor);
      var ov = svgEl('rect', { x: m.l, y: m.t, width: iw, height: ih, fill: 'transparent' }); svg.appendChild(ov);
      ov.addEventListener('mousemove', move); ov.addEventListener('touchstart', move, { passive: true }); ov.addEventListener('touchmove', move, { passive: true });
      ov.addEventListener('mouseleave', function () { tip.style.display = 'none'; cursor.setAttribute('opacity', 0); });
    }
    var cursor;
    function move(ev) {
      var pt = ev.touches ? ev.touches[0] : ev, rect = svg.getBoundingClientRect(), sx = (pt.clientX - rect.left) / rect.width * W;
      var i = Math.max(0, Math.min(n - 1, Math.round((sx - m.l) / iw * (n - 1)))), r = rows[i];
      cursor.setAttribute('x1', x(i)); cursor.setAttribute('x2', x(i)); cursor.setAttribute('opacity', 0.5);
      tip.innerHTML = '<b>' + esc(fmtDate(r.date)) + '</b>' + series.filter(function (s) { return on[s.key]; }).map(function (s) {
        var v = s.get(r); return '<div><span class="sw" style="background:' + s.color + '"></span>' + esc(s.label) + ': <b>' + (v == null ? '—' : (opts.fmt ? opts.fmt(v) : nf(v, 2) + '%')) + '</b>' + (s.note && s.note(r) ? ' <span class="fine">(' + esc(s.note(r)) + ')</span>' : '') + '</div>';
      }).join('') + '<div class="fine">source: ' + esc(r.file || '') + '</div>';
      tip.style.display = 'block';
      var px = x(i) / W * rect.width, tw = tip.offsetWidth;
      tip.style.left = Math.max(0, Math.min(rect.width - tw, px + 12 > rect.width - tw ? px - tw - 12 : px + 12)) + 'px'; tip.style.top = '10px';
    }
    draw();
    return h('div', null, [legend, wrap]);
  }
  RENDER.rates = function (el) {
    el.appendChild(head('Rates history', 'From daily briefs only — one point per brief date (' + rates.length + ' points, ' + (rates.length ? fmtDate(rates[0].date) + ' – ' + fmtDate(rates[rates.length - 1].date) : '') + '). 10Y/2Y = AM yield shown in each brief; MND 30 = prior-day close cited; PMMS = latest weekly survey cited.'));
    el.appendChild(liveCard());
    el.appendChild(h('div', { class: 'card' }, [h('h2', null, ['10Y · 2Y · MND 30 · PMMS 30 (%)', h('span', { class: 'badge gold' }, 'from daily briefs')]),
      lineChart(rates, [
        { key: 'ust10', label: '10Y', color: '#2f6fb3', get: function (r) { return r.ust10; } },
        { key: 'ust2', label: '2Y', color: '#8a63d2', get: function (r) { return r.ust2; } },
        { key: 'mnd30', label: 'MND 30Y', color: '#d9822b', get: function (r) { return r.mnd30; }, note: function (r) { return r.mnd_note; } },
        { key: 'pmms30', label: 'PMMS 30Y', color: '#1f9e6e', dash: '6 4', get: function (r) { return r.pmms30; }, note: function (r) { return r.pmms_week; } }
      ], { label: 'Rates from daily briefs' }),
      h('p', { class: 'fine' }, 'Missing points (e.g. MND on Sep 15) mean the brief did not state that number; nothing is interpolated. Brief AM levels are live OTC prints, not official CMT closes.')]));
    var bp = function (v) { return Math.round(v) + ' bp'; };
    el.appendChild(h('div', { class: 'card' }, [h('h2', null, ['Spreads (derived, bp)', h('span', { class: 'badge gray' }, 'computed from the brief values above')]),
      lineChart(rates, [
        { key: 'gap', label: 'MND 30 − 10Y', color: '#d9822b', get: function (r) { return r.mnd30 != null && r.ust10 != null ? (r.mnd30 - r.ust10) * 100 : null; } },
        { key: 'pg', label: 'PMMS 30 − 10Y', color: '#1f9e6e', dash: '6 4', get: function (r) { return r.pmms30 != null && r.ust10 != null ? (r.pmms30 - r.ust10) * 100 : null; } },
        { key: 'curve', label: '2s10s', color: '#8a63d2', get: function (r) { return r.ust10 != null && r.ust2 != null ? (r.ust10 - r.ust2) * 100 : null; } }
      ], { h: 260, fmt: bp, label: 'Derived spreads' }),
      h('p', { class: 'fine' }, 'Derived = simple differences of numbers printed in each brief (MND is the prior close vs the AM 10Y, as the briefs do). These may differ slightly from the gap stated in a brief.')]));
    var cols = [['date', 'Date'], ['ust10', '10Y %'], ['ust2', '2Y %'], ['mnd30', 'MND 30 %'], ['mnd_note', 'MND obs'], ['pmms30', 'PMMS 30 %'], ['pmms_week', 'PMMS week'], [function (r) { return r.mnd30 != null && r.ust10 != null ? Math.round((r.mnd30 - r.ust10) * 100) : ''; }, 'MND-10Y bp (derived)'], ['file', 'Source file']];
    el.appendChild(h('div', { class: 'card' }, [h('h2', null, ['Dataset', h('button', { class: 'btn sm', onclick: function () { download('rates-from-briefs.csv', toCSV(rates, cols)); } }, 'Export CSV')]),
      table([
        { label: 'Date', get: function (r) { return fmtDate(r.date); } },
        { label: '10Y', num: true, get: function (r) { return r.ust10 != null ? nf(r.ust10, 2) + '%' : '—'; } },
        { label: '2Y', num: true, get: function (r) { return r.ust2 != null ? nf(r.ust2, 2) + '%' : '—'; } },
        { label: 'MND 30', num: true, get: function (r) { return r.mnd30 != null ? nf(r.mnd30, 2) + '%' : '—'; } },
        { label: 'MND obs', get: function (r) { return r.mnd_note || ''; } },
        { label: 'PMMS 30', num: true, get: function (r) { return r.pmms30 != null ? nf(r.pmms30, 2) + '%' : '—'; } },
        { label: 'PMMS week', get: function (r) { return r.pmms_week || ''; } },
        { label: 'MND−10Y', num: true, get: function (r) { return r.mnd30 != null && r.ust10 != null ? Math.round((r.mnd30 - r.ust10) * 100) + ' bp' : '—'; } },
        { label: 'Source', get: function (r) { return h('a', { href: '#briefs/' + r.date }, r.file); } }
      ], rates.slice().reverse())]));
  };

  /* ================= GUIDES ================= */
  function b64ToBlob(b64, mime) { var bin = atob(b64.trim()), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new Blob([u], { type: mime }); }
  function fileButton(f) {
    var size = f.size > 1048576 ? (f.size / 1048576).toFixed(1) + ' MB' : Math.round(f.size / 1024) + ' KB';
    return h('a', { class: 'chip', href: f.embed ? '#' : 'files/' + f.name, download: f.name, onclick: function (e) {
      if (!f.embed) return; e.preventDefault(); var tag = document.getElementById(f.id);
      if (!tag) { toast('File not embedded'); return; } download(f.name, b64ToBlob(tag.textContent, f.mime));
    } }, '⬇ ' + f.label + ' · ' + size);
  }
  function unmark(root) { [].slice.call(root.querySelectorAll('mark.hl')).forEach(function (m) { var p = m.parentNode; p.replaceChild(document.createTextNode(m.textContent), m); p.normalize(); }); }
  function markText(root, q) {
    unmark(root); if (!q || q.length < 2) return [];
    var re = new RegExp(reEsc(q), 'gi'), walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) { for (var p = n.parentNode; p && p !== root; p = p.parentNode) { if (p.nodeName.toLowerCase() === 'math') return NodeFilter.FILTER_REJECT; } return re.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; }
    }), nodes = [], marks = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) {
      if (marks.length > 800) return;
      var frag = document.createDocumentFragment(), s = n.nodeValue, last = 0; re.lastIndex = 0; var mm;
      while ((mm = re.exec(s))) { frag.appendChild(document.createTextNode(s.slice(last, mm.index))); var mk = h('mark', { class: 'hl' }, mm[0]); marks.push(mk); frag.appendChild(mk); last = mm.index + mm[0].length; }
      frag.appendChild(document.createTextNode(s.slice(last))); n.parentNode.replaceChild(frag, n);
    });
    return marks;
  }
  function docView(doc) {
    var wrap = h('div'), content = h('div', { class: 'card doc', html: doc.html });
    var q = h('input', { type: 'search', placeholder: 'Search this document…', style: 'max-width:340px' }), info = h('span', { class: 'fine' }), marks = [], cur = -1;
    function go(d) { if (!marks.length) return; if (cur >= 0) marks[cur].classList.remove('cur'); cur = (cur + d + marks.length) % marks.length; marks[cur].classList.add('cur'); marks[cur].scrollIntoView({ block: 'center' }); info.textContent = (cur + 1) + ' / ' + marks.length; }
    var tmr; q.addEventListener('input', function () { clearTimeout(tmr); tmr = setTimeout(function () { marks = markText(content, q.value.trim()); cur = -1; info.textContent = q.value.trim().length > 1 ? (marks.length ? marks.length + ' matches' : 'no matches') : ''; if (marks.length) go(1); }, 180); });
    q.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); go(e.shiftKey ? -1 : 1); } });
    wrap.appendChild(h('div', { class: 'doc-head' }, [q, h('button', { class: 'btn ghost sm', onclick: function () { go(-1); } }, '↑'), h('button', { class: 'btn ghost sm', onclick: function () { go(1); } }, '↓'), info]));
    var toc = h('details', { class: 'toc card', open: window.innerWidth > 900 ? true : null }, [h('summary', null, 'Contents')].concat(doc.toc.map(function (t) {
      return h('a', { href: '#', class: 'd' + t.depth, onclick: function (e) { e.preventDefault(); var tg = document.getElementById(t.id); if (tg) tg.scrollIntoView({ behavior: 'smooth' }); } }, t.text);
    })));
    wrap.appendChild(h('div', { class: 'guide' }, [toc, h('div', { style: 'min-width:0' }, [h('div', { class: 'fine', style: 'margin-bottom:6px' }, doc.subtitle || ''), content])]));
    return wrap;
  }
  RENDER.guides = function (el, sub) {
    el.appendChild(head('Guides', 'Trader External Data Reference Guide and Key Concepts Cheat Sheet, rendered from Markdown (math pre-rendered as MathML). Search within each document; downloads below.',
      h('div', { class: 'chips' }, D.files.filter(function (f) { return /pdf|xlsx/.test(f.name); }).map(fileButton))));
    var tabs = el.appendChild(h('div', { class: 'tabs' })), panes = {}, btns = {};
    var defs = [['data', 'Data guide'], ['cheat', 'Concepts cheat sheet'], ['asks', 'PM asks (' + D.pmAsks.length + ')'], ['files', 'Downloads']];
    function sel(id) { defs.forEach(function (d) { panes[d[0]].hidden = d[0] !== id; btns[d[0]].classList.toggle('on', d[0] === id); }); if (!panes[id].firstChild) build[id](panes[id]); }
    defs.forEach(function (d) { btns[d[0]] = tabs.appendChild(h('button', { onclick: function () { history.replaceState(null, '', '#guides/' + d[0]); sel(d[0]); } }, d[1])); panes[d[0]] = el.appendChild(h('div', { hidden: true })); });
    var build = {
      data: function (p) { p.appendChild(docView(D.guides.data)); },
      cheat: function (p) { p.appendChild(docView(D.guides.cheat)); },
      asks: function (p) {
        var q = h('input', { type: 'search', placeholder: 'Type the PM question (e.g. "jumbo", "speeds", "hedge", "DSCR")…' }), out = h('div'), cnt = h('span', { class: 'fine' });
        p.appendChild(h('div', { class: 'card' }, [h('h2', null, '"PM asks X → go to Y" quick-answer table'), h('p', { class: 'fine' }, 'Combined from the data guide §1.2 (where to get the number) and the cheat sheet §11 (which concept to use). Methodology only — no market levels.'),
          h('div', { class: 'toolbar' }, [h('div', { class: 'grow' }, q), cnt]), out]));
        function r() {
          var ts = terms(q.value), rows = D.pmAsks.filter(function (a) { return !ts.length || matchAll([a.q, a.first, a.metric, a.backup].join(' '), ts); });
          cnt.textContent = rows.length + ' of ' + D.pmAsks.length; out.innerHTML = '';
          out.appendChild(table([
            { label: 'PM asks', get: function (a) { return h('b', null, a.q); } }, { label: 'Go to first / concept', get: function (a) { return a.first; } },
            { label: 'Metric to quote / section', get: function (a) { return a.metric; } }, { label: 'Backup / paid upgrade', get: function (a) { return a.backup; } },
            { label: 'From', get: function (a) { return h('span', { class: 'badge gray' }, a.src); } }], rows, { empty: 'No match — try fewer words.' }));
        }
        q.addEventListener('input', r); r();
      },
      files: function (p) {
        p.appendChild(h('div', { class: 'card' }, [h('h2', null, 'Download the source documents'), h('div', { class: 'chips' }, D.files.map(fileButton)),
          h('p', { class: 'fine' }, D.files.every(function (f) { return f.embed; }) ? 'All files are embedded in this page, so downloads work offline.' : 'Files not embedded are served from the files/ folder next to this page.')]));
      }
    };
    RENDER.guides.onShow = function (s) { if (s && s[0] && panes[s[0]]) sel(s[0]); };
    sel(sub && panes[sub[0]] ? sub[0] : 'data');
  };

  /* ================= CALCULATORS ================= */
  var refTab = function (t) { return 'trader-calcs.xlsx › ' + t; };
  var CALCS = [
    { id: 'dv01', title: 'DV01 & hedge ratio', tab: 'Duration_DV01_Hedge', ex: EX.dv01,
      inputs: [['face', 'Face amount', '$'], ['price', 'Price', 'pts'], ['accrued', 'Accrued', 'pts'], ['effDur', 'Effective duration', 'yrs'], ['tyDv01', '10Y future DV01', '$/bp'], ['fvDv01', '5Y future DV01', '$/bp'],
        ['swapDv01PerMM', '10Y swap DV01 per $1mm', '$/bp'], ['ctdDv01', 'CTD DV01 per $100k', '$/bp'], ['ctdCF', 'CTD conversion factor', ''], ['split10', 'Share of DV01 in 10s', '%', 'pct'], ['sigmaBp', 'Daily rate vol (VaR)', 'bp']],
      out: function (v) { var r = C.dv01Hedge(v); return [['Market value', money(r.mv), 'B20'], ['Position DV01', money(r.dv01) + ' / bp', 'B21', 1], ['10Y futures if all in 10s', nf(r.allIn10s, 1), 'B22'], ['10Y futures to sell (split)', nf(r.tyContracts, 0), 'B23', 1], ['5Y futures to sell (split)', nf(r.fvContracts, 0), 'B24', 1], ['Residual DV01', money(r.residual) + ' / bp', 'B25'], ['Pay-fixed 10Y swap notional', money(r.swapNotional), 'B26'], ['Futures DV01 implied by CTD', money(r.ctdFutDv01, 2), 'B27'], ['1-day 99% VaR (unhedged)', money(r.var99), 'B28']]; } },
    { id: 'pxchg', title: 'Price change: duration + convexity', tab: 'Duration_DV01_Hedge (grid)', ex: { face: EX.dv01.face, price: EX.dv01.price, effDur: EX.dv01.effDur, convexity: EX.dv01.convexity, shock: 100, tDur: 8, tConv: 80 },
      inputs: [['face', 'Face amount', '$'], ['price', 'Price', 'pts'], ['effDur', 'Effective duration', 'yrs'], ['convexity', 'Effective convexity', 'yrs²'], ['shock', 'Yield shock', 'bp'], ['tDur', 'Treasury duration (compare)', 'yrs'], ['tConv', 'Treasury convexity (compare)', 'yrs²']],
      out: function (v) { var mv = v.face * v.price / 100, dy = v.shock / 1e4, p = C.priceChange(v.effDur, v.convexity, dy); return [['Market value', money(mv)], ['Duration term', pct(-v.effDur * dy, 3)], ['Convexity term', pct(0.5 * v.convexity * dy * dy, 3)], ['% price change', pct(p, 3), 'C-col', 1], ['$ P&L', money(mv * p), 'D-col', 1], ['New price', nf(v.price * (1 + p), 4), 'F-col'], ['Treasury % change', pct(C.priceChange(v.tDur, v.tConv, dy), 3), 'E-col']]; },
      extra: function (v) { var mv = v.face * v.price / 100, g = C.scenarioGrid({ effDur: v.effDur, convexity: v.convexity, mv: mv, price: v.price, tDur: v.tDur, tConv: v.tConv }, [-100, -75, -50, -25, 0, 25, 50, 75, 100]);
        return [h('h3', null, 'Scenario grid (rows 49–57)'), table([{ label: 'Shock', num: true, get: function (r) { return r.bp + ' bp'; } }, { label: 'Mortgage %', num: true, get: function (r) { return pct(r.pct, 3); }, cls: function (r) { return r.pct < 0 ? 'up' : r.pct > 0 ? 'dn' : ''; } }, { label: 'Mortgage $ P&L', num: true, get: function (r) { return money(r.pnl); } }, { label: 'Treasury %', num: true, get: function (r) { return pct(r.tPct, 2); } }, { label: 'Mortgage px', num: true, get: function (r) { return nf(r.newPx, 3); } }], g)]; } },
    { id: 'bump', title: 'Effective duration & convexity (±bump)', tab: 'Convexity_Bump', ex: EX.bump,
      inputs: [['P0', 'Base price P₀', 'pts'], ['Pdn', 'Price, yields down (P_dn)', 'pts'], ['Pup', 'Price, yields up (P_up)', 'pts'], ['bump', 'Bump', 'bp', 'bp']],
      out: function (v) { var r = C.bump(v.P0, v.Pdn, v.Pup, v.bump); return [['Effective duration', nf(r.effDur, 4), 'B18', 1], ['Effective convexity', nf(r.convexity, 2), 'B19', 1], ['Est. % chg, −100bp', pct(r.pctDn100, 3), 'B20'], ['Est. % chg, +100bp', pct(r.pctUp100, 3), 'B21'], ['Asymmetry', pct(r.asymmetry, 3), 'B22']]; } },
    { id: 'tsy', title: 'Treasury bullet: PRICE / DURATION', tab: 'Duration_DV01_Hedge (Treasury example)', ex: EX.tsy,
      inputs: [['settle', 'Settlement', '', 'date'], ['maturity', 'Maturity', '', 'date'], ['cpn', 'Coupon', '%', 'pct'], ['yld', 'Yield (s.a.)', '%', 'pct'], ['dy', 'Yield change', 'bp', 'bp']],
      out: function (v) { var p = C.bondPrice(v.settle, v.maturity, v.cpn, v.yld), md = C.bondMDuration(v.settle, v.maturity, v.cpn, v.yld); return [['Price  =PRICE()', nf(p, 6), 'B36', 1], ['Macaulay  =DURATION()', nf(C.bondDuration(v.settle, v.maturity, v.cpn, v.yld), 6), 'B37'], ['Modified  =MDURATION()', nf(md, 6), 'B38', 1], ['DV01 per 100 face', nf(md * p * 1e-4, 5)], ['Est. price change', nf(-md * p * v.dy, 6), 'B40'], ['Actual price change', nf(C.bondPrice(v.settle, v.maturity, v.cpn, v.yld + v.dy) - p, 6), 'B41'], ['Yield back  =YIELD()', pct(C.bondYield(v.settle, v.maturity, v.cpn, p), 4), 'B42']]; } },
    { id: 'prepay', title: 'SMM / CPR / PSA / CDR converter', tab: 'Prepay_Conversions', ex: EX.prepay,
      inputs: [['cpr', 'CPR', '%', 'pct'], ['smm', 'SMM', '%', 'pct'], ['psa', 'PSA speed', '% PSA'], ['age', 'Loan age', 'months'], ['cdr', 'CDR', '%', 'pct'], ['amount', 'Amount prepaid (penalty)', '$'], ['ageMo', 'Age at payoff (penalty)', 'months']],
      out: function (v) { var c = C.psaToCpr(v.psa, v.age); return [['SMM from CPR', pct(C.cprToSmm(v.cpr), 4), 'B13', 1], ['CPR from SMM', pct(C.smmToCpr(v.smm), 3), 'B14', 1], ['CPR at PSA & age', pct(c, 3), 'B15', 1], ['SMM at that PSA', pct(C.cprToSmm(c), 4), 'B16'], ['MDR from CDR', pct(C.cdrToMdr(v.cdr), 4), 'B17'], ['5-4-3-2-1 penalty', money(C.penalty(v.amount, v.ageMo, EX.prepay.sched)), 'B23']]; } },
    { id: 'cf', title: 'Cash-flow model: CPR / CDR / severity → price, yield, WAL', tab: 'CashFlow_Model', wide: true, ex: EX.cf,
      inputs: [['origBal', 'Original balance', '$'], ['wac', 'Gross WAC', '%', 'pct'], ['servFee', 'Servicing fee', '%', 'pct'], ['term', 'Term', 'months'], ['cpr', 'CPR', '%', 'pct'], ['cdr', 'CDR', '%', 'pct'], ['severity', 'Loss severity', '%', 'pct'], ['yield', 'Yield for pricing (mo. comp.)', '%', 'pct'], ['price', 'Price for yield calc', 'pts']],
      out: function (v) { var r = C.cashFlow(v); this._r = r; return [['Price from yield', nf(r.priceFromYield, 4), 'G6', 1], ['Yield from price (mtg)', pct(r.yieldFromPrice, 4), 'G8', 1], ['Yield from price (BEY)', pct(r.yieldBEY, 4), 'G9'], ['WAL (years)', nf(r.wal, 3), 'G10', 1], ['Cumulative loss', pct(r.cumLoss, 3), 'G11'], ['Total prepayments', money(r.totalPrepay), 'G12'], ['Check: principal + losses', r.checkOK ? 'OK' : 'CHECK', 'G13'], ['Ending balance m' + v.term, money(r.endBal, 2), 'G14']]; },
      extra: function (v, self) {
        var r = self._r || C.cashFlow(v), rows = r.rows, cum = 0, cumL = 0, series = rows.map(function (x) { cum += x.prepay; cumL += x.loss; return { date: null, m: x.m, bal: x.end / v.origBal * 100, cp: cum / v.origBal * 100, cl: cumL / v.origBal * 100 }; });
        var W = 900, H = 220, ml = 40, mb = 26, iw = W - ml - 10, ih = H - 10 - mb, svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Balance runoff' });
        var X = function (i) { return ml + i / (series.length - 1) * iw; }, Y = function (p) { return 10 + ih - p / 100 * ih; };
        [0, 25, 50, 75, 100].forEach(function (t) { svg.appendChild(svgEl('line', { x1: ml, x2: W - 10, y1: Y(t), y2: Y(t), class: 'gridl', 'stroke-dasharray': '3 3' })); var tx = svgEl('text', { x: ml - 5, y: Y(t) + 4, 'text-anchor': 'end', class: 'axis', fill: 'currentColor', 'font-size': 11, opacity: .7 }); tx.textContent = t + '%'; svg.appendChild(tx); });
        for (var yr = 0; yr <= v.term / 12; yr += 5) { var tx = svgEl('text', { x: X(Math.min(series.length - 1, yr * 12)), y: H - 6, 'text-anchor': 'middle', fill: 'currentColor', 'font-size': 11, opacity: .7 }); tx.textContent = 'yr ' + yr; svg.appendChild(tx); }
        [['bal', '#2f6fb3', 'Balance (% orig)'], ['cp', '#1f9e6e', 'Cum. prepay'], ['cl', '#b42318', 'Cum. loss']].forEach(function (s) { svg.appendChild(svgEl('path', { d: series.map(function (p, i) { return (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(p[s[0]]).toFixed(1); }).join(''), fill: 'none', stroke: s[1], 'stroke-width': 2 })); });
        var cols = [['m', 'Month'], ['beg', 'Beg balance'], ['def', 'Defaults'], ['sched', 'Sched payment'], ['gInt', 'Gross interest'], ['nInt', 'Net interest'], ['sPrin', 'Sched principal'], ['prepay', 'Prepayments'], ['loss', 'Loss'], ['rec', 'Recovery'], ['tPrin', 'Total principal'], ['end', 'End balance'], ['cf', 'Net cash flow'], ['df', 'Disc factor'], ['pv', 'PV']];
        return [h('h3', null, 'Balance runoff'), h('div', { class: 'legend' }, [['#2f6fb3', 'Balance (% of orig.)'], ['#1f9e6e', 'Cumulative prepayments'], ['#b42318', 'Cumulative losses']].map(function (l) { return h('span', { class: 'fine' }, [h('span', { class: 'sw', style: 'background:' + l[0] }), l[1]]); })), h('div', { class: 'chart-wrap' }, svg),
          h('h3', null, ['First 12 months ', h('button', { class: 'btn sm', onclick: function () { download('cashflow-' + v.term + 'mo.csv', toCSV(rows, cols)); } }, 'Download all ' + rows.length + ' months (CSV)')]),
          table(cols.slice(0, 13).map(function (c) { return { label: c[1], num: true, get: function (x) { return c[0] === 'm' ? x.m : nf(x[c[0]], 0); } }; }), rows.slice(0, 12))];
      } },
    { id: 'amort', title: 'Mortgage payment & amortization', tab: 'DSCR_LTV (PMT/IPMT/PPMT)', ex: { loan: EX.dscr.loan, rate: EX.dscr.noteRate, term: EX.dscr.amortTerm, k: 60 },
      inputs: [['loan', 'Loan amount', '$'], ['rate', 'Note rate', '%', 'pct'], ['term', 'Amortization term', 'months'], ['k', 'Balance after', 'months']],
      out: function (v) { var r = v.rate / 12, P = C.pmt(r, v.term, v.loan), k = Math.min(v.k, v.term), g = Math.pow(1 + r, k), bal = r ? v.loan * g - P * (g - 1) / r : v.loan - P * k; return [['Monthly P&I  =PMT()', money(P, 2), 'B14', 1], ['Interest month 1  =IPMT()', money(v.loan * r, 2), 'B17'], ['Principal month 1  =PPMT()', money(P - v.loan * r, 2), 'B18'], ['Balance after ' + k + ' mo', money(bal, 2), null, 1], ['Principal repaid by then', pct(1 - bal / v.loan, 2)], ['Total interest over term', money(P * v.term - v.loan, 0)]]; } },
    { id: 'gap', title: 'Primary–10Y gap decomposition', tab: 'Spreads', ex: EX.gap,
      inputs: [['mtg', 'Primary mortgage rate', '%', 'pct'], ['ust10', '10Y Treasury', '%', 'pct'], ['cc', 'Current-coupon MBS yield', '%', 'pct']],
      tools: L.mnd30 && L.ust10 ? [{ label: 'Load brief levels (' + shortDate(latest.date) + ')', fn: function (v) { v.mtg = L.mnd30 / 100; v.ust10 = L.ust10 / 100; toast('Loaded MND 30 ' + L.mnd30 + '% and 10Y ' + L.ust10 + '% from brief ' + latest.date + '. CC yield is not in the briefs - still an example input.'); } }] : null,
      out: function (v) { var r = C.gapDecomp(v.mtg, v.ust10, v.cc); return [['Mortgage − 10Y gap', nf(r.gap, 1) + ' bp', 'B9', 1], ['Primary − secondary', nf(r.primSec, 1) + ' bp', 'B10'], ['Secondary (CC − 10Y)', nf(r.secondary, 1) + ' bp', 'B11']]; } },
    { id: 'bey', title: 'BEY ↔ mortgage yield', tab: 'Spreads', ex: { mtgYld: EX.bey.mtgYld, bey: C.mtgToBey(EX.bey.mtgYld) },
      inputs: [['mtgYld', 'Mortgage yield (monthly comp.)', '%', 'pct'], ['bey', 'BEY (semiannual) → convert back', '%', 'pct']],
      out: function (v) { return [['BEY  =2*((1+y/12)^6−1)', pct(C.mtgToBey(v.mtgYld), 4), 'B15', 1], ['Pickup vs mortgage yield', nf((C.mtgToBey(v.mtgYld) - v.mtgYld) * 1e4, 2) + ' bp'], ['Mortgage yield from BEY', pct(C.beyToMtg(v.bey), 4), 'B17', 1]]; } },
    { id: 'gs', title: 'G / I-spread, option cost & 32nds', tab: 'Spreads', ex: EX.gs,
      inputs: [['bondYld', 'Bond yield', '%', 'pct'], ['wal', 'Bond WAL', 'yrs'], ['tLo', 'Lower tenor', 'yrs'], ['tHi', 'Upper tenor', 'yrs'], ['yLo', 'UST at lower tenor', '%', 'pct'], ['yHi', 'UST at upper tenor', '%', 'pct'], ['swapSpreadBp', 'Swap spread at WAL', 'bp'], ['z', 'Z-spread', 'bp'], ['oas', 'OAS', 'bp'], ['quote32', 'Quote (98.16 = 98-16)', 'handle.32'], ['tickFace', 'Face for tick value', '$']],
      out: function (v) { var r = C.gSpread(v), dp = C.dollarDe(v.quote32, 32); return [['UST at WAL', pct(r.ustAtWal, 3), 'B27'], ['G-spread', nf(r.gSpread, 1) + ' bp', 'B28', 1], ['I-spread', nf(r.iSpread, 1) + ' bp', 'B29'], ['Option cost (Z − OAS)', nf(v.z - v.oas, 1) + ' bp', 'B34', 1], ['Decimal price', nf(dp, 6), 'B38'], ['With "+" (1/64)', nf(dp + 1 / 64, 6), 'B39'], ['1/32 tick value', money(v.tickFace / 3200, 2), 'B42']]; } },
    { id: 'roll', title: 'Dollar roll carry (simplified)', tab: 'Spreads', ex: EX.roll,
      inputs: [['cpn', 'Coupon', '%', 'pct'], ['repo', 'Repo rate', '%', 'pct'], ['days', 'Days in roll period', 'days'], ['px', 'Price', 'pts'], ['pctPaid', 'Paydown in month', '%', 'pct'], ['drop32', 'Quoted drop', '32nds']],
      out: function (v) { var r = C.rollCarry(v); return [['Carry', nf(r.carry, 4) + ' pts', 'B51', 1], ['Break-even drop', nf(r.breakEven32, 2) + '/32', 'B52', 1], ['Verdict', r.special ? 'SPECIAL – favors rolling' : 'Not special – favors holding', 'B53']]; } },
    { id: 'dscr', title: 'DSCR loan', tab: 'DSCR_LTV', ex: EX.dscr,
      inputs: [['loan', 'Loan amount', '$'], ['noteRate', 'Note rate', '%', 'pct'], ['amortTerm', 'Amortization term', 'months'], ['io', 'Payment type', '', 'select', [[0, 'Amortizing'], [1, 'Interest-only']]], ['rent', 'Gross monthly rent', '$'], ['taxes', 'Monthly taxes', '$'], ['ins', 'Monthly insurance', '$'], ['hoa', 'Monthly HOA', '$']],
      out: function (v) { var r = C.dscr(v); return [['Monthly P&I', money(r.pi, 2), 'B14'], ['PITIA', money(r.pitia, 2), 'B15'], ['DSCR = rent / PITIA', nf(r.dscr, 3) + 'x', 'B16', 1], ['Interest month 1', money(r.ipmt1, 2), 'B17'], ['Principal month 1', money(r.ppmt1, 2), 'B18']]; } },
    { id: 'ltv', title: 'LTV / CLTV / HPA shock / DTI', tab: 'DSCR_LTV', ex: EX.ltv,
      inputs: [['loan', 'Loan amount', '$'], ['appraisal', 'Appraised value', '$'], ['purchase', 'Purchase price', '$'], ['second', 'Second lien / HELOC line', '$'], ['curBal', 'Current 1st-lien balance', '$'], ['hpa', 'HPA shock', '%', 'pct'], ['debt', 'Monthly debt payments', '$'], ['income', 'Gross monthly income', '$']],
      out: function (v) { var r = C.ltv(v); return [['LTV', pct(r.ltv, 2), 'B27', 1], ['CLTV', pct(r.cltv, 2), 'B28', 1], ['Current LTV after HPA', pct(r.curLtv, 2), 'B29', 1], ['DTI', pct(v.debt / v.income, 2), 'B34']]; } },
    { id: 'rtl', title: 'RTL leverage & credit loss quick math', tab: 'DSCR_LTV', ex: EX.rtl,
      inputs: [['loan', 'RTL loan (incl. holdback)', '$'], ['purchase', 'Purchase price', '$'], ['rehab', 'Rehab budget', '$'], ['arv', 'After-repair value (ARV)', '$'], ['cdr', 'CDR', '%', 'pct'], ['sev', 'Severity', '%', 'pct']],
      out: function (v) { var r = C.rtl(v); return [['Loan-to-cost', pct(r.ltc, 2), 'B41', 1], ['Loan-to-ARV', pct(r.ltarv, 2), 'B42', 1], ['Approx. annual loss = CDR × sev', pct(v.cdr * v.sev, 2), 'B47']]; } }
  ];
  function calcCard(cfg) {
    var saved = store.get('deskhub.calc.' + cfg.id, null), v = Object.assign({}, cfg.ex, saved || {});
    var card = h('div', { class: 'card calc' + (cfg.wide ? ' wide' : ''), id: 'calc-' + cfg.id }), badge = h('span', { class: 'badge gold ex' });
    var fields = h('div', { class: 'fields' }), outs = h('div', { class: 'outs' }), extra = h('div'), inputsEls = {};
    function isEx() { return Object.keys(cfg.ex).every(function (k) { return String(v[k]) === String(cfg.ex[k]); }); }
    function shown(k, type) { var x = v[k]; if (type === 'pct') return +(x * 100).toPrecision(10); if (type === 'bp') return +(x * 1e4).toPrecision(10); return x; }
    cfg.inputs.forEach(function (inp) {
      var k = inp[0], type = inp[3], el;
      if (type === 'select') { el = h('select', null, inp[4].map(function (o) { return h('option', { value: o[0] }, o[1]); })); el.value = v[k]; }
      else el = h('input', { type: type === 'date' ? 'date' : 'number', step: 'any', value: shown(k, type), inputmode: 'decimal' });
      el.addEventListener('input', function () {
        var raw = el.value; if (type === 'date') { if (raw) v[k] = raw; }
        else { var n = parseFloat(raw); if (!isFinite(n)) return; v[k] = type === 'pct' ? n / 100 : type === 'bp' ? n / 1e4 : n; }
        store.set('deskhub.calc.' + cfg.id, v); compute();
      });
      inputsEls[k] = el;
      fields.appendChild(h('div', null, [h('label', null, [inp[1] + ' ', h('span', { class: 'u' }, inp[2] ? '(' + inp[2] + ')' : '')]), el]));
    });
    function syncInputs() { cfg.inputs.forEach(function (inp) { inputsEls[inp[0]].value = shown(inp[0], inp[3]); }); }
    function compute() {
      var res; try { res = cfg.out.call(cfg, v); } catch (e) { console.error(e); res = [['Error', e.message]]; }
      outs.innerHTML = '';
      res.forEach(function (o) { outs.appendChild(h('div', { class: 'o' + (o[3] ? ' key' : '') }, [h('div', { class: 'k' }, o[0]), h('div', { class: 'val' }, o[1]), o[2] ? h('div', { class: 'ref' }, cfg.tab.split(' ')[0] + '!' + o[2]) : null])); });
      if (cfg.extra) { extra.innerHTML = ''; add(extra, cfg.extra(v, cfg)); }
      var ex = isEx(); badge.textContent = ex ? 'Example numbers · ' + refTab(cfg.tab) : 'Custom inputs (not saved to workbook)'; badge.className = 'badge ex ' + (ex ? 'gold' : 'gray');
    }
    card.appendChild(h('h2', null, [cfg.title, h('span', { class: 'actions' }, (cfg.tools || []).map(function (t) { return h('button', { class: 'btn sm', onclick: function () { t.fn(v); store.set('deskhub.calc.' + cfg.id, v); syncInputs(); compute(); } }, t.label); })
      .concat([h('button', { class: 'btn ghost sm', title: 'Reset to workbook example', onclick: function () { v = Object.assign({}, cfg.ex); store.set('deskhub.calc.' + cfg.id, null); syncInputs(); compute(); } }, 'Reset')]))]));
    card.appendChild(h('div', { style: 'margin:-4px 0 10px' }, badge));
    card.appendChild(fields); card.appendChild(outs); card.appendChild(extra);
    compute();
    return card;
  }
  RENDER.calcs = function (el) {
    el.appendChild(head('Calculators', 'Live JavaScript versions of the trader-calcs.xlsx tabs. Defaults are the workbook\'s illustrative inputs — <b>Example numbers, not market data</b>. Edits persist in this browser; "Reset" restores the example.',
      h('div', null, [h('div', { class: 'chips calc-chips' }, CALCS.map(function (c) { return h('a', { class: 'chip', href: '#', onclick: function (e) { e.preventDefault(); document.getElementById('calc-' + c.id).scrollIntoView({ behavior: 'smooth' }); } }, c.title.split(':')[0].split('(')[0]); })),
        h('select', { class: 'jump', 'aria-label': 'Jump to calculator', onchange: function () { if (this.value) document.getElementById('calc-' + this.value).scrollIntoView({ behavior: 'smooth' }); this.value = ''; } }, [h('option', { value: '' }, 'Jump to calculator…')].concat(CALCS.map(function (c) { return h('option', { value: c.id }, c.title); })))])));
    if (D.verify) {
      var det = h('details', null, [h('summary', null, 'Show all ' + D.verify.total + ' checks'), table([{ label: 'Check', get: function (r) { return r.label; } }, { label: 'Cell', get: function (r) { return h('code', null, r.ref); } }, { label: 'Workbook', num: true, get: function (r) { return typeof r.xlsx === 'number' ? String(+r.xlsx.toPrecision(10)) : String(r.xlsx); } }, { label: 'JS', num: true, get: function (r) { return typeof r.js === 'number' ? String(+r.js.toPrecision(10)) : String(r.js); } }, { label: '', get: function (r) { return h('span', { class: 'badge ' + (r.ok ? 'green' : 'red') }, r.ok ? 'match' : 'MISMATCH'); } }], D.verify.results)]);
      el.appendChild(h('div', { class: 'card' }, [h('h2', null, ['Verified against the workbook', h('span', { class: 'badge ' + (D.verify.passed === D.verify.total ? 'green' : 'red') }, D.verify.passed + ' / ' + D.verify.total + ' match')]),
        h('p', { class: 'fine' }, 'tests/verify_calcs.mjs compares every output against trader-calcs.xlsx recalculated headlessly (LibreOffice), e.g. $100mm face, duration 5.2, price 98 → DV01 $50,960. Last run ' + new Date(D.verify.when).toLocaleString('en-US', { timeZone: 'America/Chicago', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) + ' CT.'), det]));
    }
    el.appendChild(h('div', { class: 'calcs' }, CALCS.map(calcCard)));
  };

  /* ================= CALENDAR ================= */
  RENDER.calendar = function (el) {
    var now = ctNow();
    el.appendChild(head('Calendar (Central Time)', 'Recurring release schedule from the data guide §12 and §8.4. Dates are generated from rules — always confirm on the agency calendar (holidays and shutdowns shift schedules). Today (CT): <b>' + esc(fmtDate(now.date)) + ' ' + now.hm + '</b>'));
    var g = el.appendChild(h('div', { class: 'grid g2' }));
    g.appendChild(h('div', { class: 'card' }, [h('h2', null, 'Next up'), h('div', null, upcoming(14).map(function (e) { return h('div', { class: 'ev' + (e.key ? ' key' : '') }, [h('b', null, fmtDate(e.date, false) + ' · ' + e.time), ' — ' + e.what + ' ', h('span', { class: 'fine' }, '(' + e.source + ')')]); }))]));
    // checklist
    var key = 'deskhub.check.' + now.date, st = store.get(key, {}), ck = h('div', { class: 'card check' });
    ck.appendChild(h('h2', null, ['Daily checklist', h('span', { class: 'badge' }, fmtDate(now.date, false)), h('button', { class: 'btn ghost sm', onclick: function () { st = {}; store.set(key, st); [].forEach.call(ck.querySelectorAll('input'), function (i) { i.checked = false; i.parentNode.querySelector('span').classList.remove('done'); }); } }, 'Reset')]));
    Object.keys(D.checklist).forEach(function (grp) {
      ck.appendChild(h('h3', null, grp));
      ck.appendChild(h('ul', null, D.checklist[grp].map(function (item, i) {
        var id = grp + '|' + i, cb = h('input', { type: 'checkbox' }), sp = h('span', { class: st[id] ? 'done' : '' }, item); cb.checked = !!st[id];
        cb.addEventListener('change', function () { st[id] = cb.checked; sp.classList.toggle('done', cb.checked); store.set(key, st); });
        return h('li', null, h('label', null, [cb, sp]));
      })));
    });
    ck.appendChild(h('p', { class: 'fine' }, 'Ticks are saved per day in this browser.'));
    g.appendChild(ck);
    // this week
    var d = pd(now.date), mon = new Date(d.getTime() - ((d.getUTCDay() + 6) % 7) * 864e5);
    if (d.getUTCDay() === 6 || d.getUTCDay() === 0) mon = new Date(mon.getTime() + 7 * 864e5);
    var week = h('div', { class: 'week' });
    for (var i = 0; i < 5; i++) {
      var ds = iso(new Date(mon.getTime() + i * 864e5));
      week.appendChild(h('div', { class: 'day' + (ds === now.date ? ' today' : '') }, [h('h4', null, fmtDate(ds, false))].concat(eventsOn(ds).map(function (e) { return h('div', { class: 'ev' + (e.key ? ' key' : '') }, [h('b', null, e.time), ' ' + e.what]); }))));
    }
    el.appendChild(h('div', { class: 'card' }, [h('h2', null, 'This week'), week]));
    var g2 = el.appendChild(h('div', { class: 'grid g2' }));
    g2.appendChild(h('div', { class: 'card' }, [h('h2', null, 'Daily routine (§12.1)'), table([{ label: 'Time (CT)', get: function (r) { return h('b', null, r.time); } }, { label: 'What to check', get: function (r) { return r.what; } }, { label: 'Source', get: function (r) { return r.source; } }], D.calendar.daily)]));
    g2.appendChild(h('div', { class: 'card' }, [h('h2', null, 'Weekly (§12.2)'), table([{ label: 'Day', get: function (r) { return r.dow ? DOW[r.dow] : 'Daily'; } }, { label: 'Time (CT)', get: function (r) { return h('b', null, r.time); } }, { label: 'Item', get: function (r) { return r.what; } }, { label: 'Source', get: function (r) { return r.source; } }], D.calendar.weekly)]));
    g2.appendChild(h('div', { class: 'card' }, [h('h2', null, 'Monthly & quarterly (§12.3, §8.4)'), table([{ label: 'When', get: function (r) { return h('b', null, r.when); } }, { label: 'Time (CT)', get: function (r) { return r.time; } }, { label: 'Item', get: function (r) { return r.what; } }, { label: 'Source', get: function (r) { return r.source; } }], D.calendar.monthly)]));
    g2.appendChild(h('div', { class: 'card' }, [h('h2', null, 'FOMC'), table([{ label: 'Meeting', get: function (r) { return h('b', null, r.dates); } }, { label: 'Decision (CT)', get: function (r) { return fmtDate(r.decision) + ' 1:00 pm'; } }, { label: 'SEP / dots', get: function (r) { return r.sep ? 'Yes' : '—'; } }], D.calendar.fomc), h('p', { class: 'fine' }, D.calendar.fomc_source)]));
  };

  /* ================= DEALS ================= */
  RENDER.deals = function (el) {
    var KEY = 'deskhub.deals.v1', seed = D.deals.map(function (d, i) { return Object.assign({ id: 'seed-' + i }, d); });
    var deals = store.get(KEY, null);
    if (!deals) deals = seed.slice(); else { var names = {}; deals.forEach(function (d) { names[(d.name || '').toUpperCase()] = 1; }); seed.forEach(function (s) { if (!names[s.name.toUpperCase()]) deals.push(s); }); }
    var save = function () { store.set(KEY, deals); };
    var COLS = [['name', 'Deal'], ['sector', 'Sector'], ['size', 'Size'], ['status', 'Status'], ['date', 'Date'], ['source', 'Source'], ['notes', 'Notes']];
    var sortKey = 'date', sortDir = -1;
    el.appendChild(head('Deal tracker', 'Non-QM / DSCR / RTL / jumbo deals named in the desk briefs plus a few web-verified public releases (origin column). <b>Click any cell to edit</b> — changes save in this browser. Public information only; no desk pricing.'));
    var q = h('input', { type: 'search', placeholder: 'Filter deals…' }), cnt = h('span', { class: 'fine' });
    el.appendChild(h('div', { class: 'toolbar' }, [h('div', { class: 'grow' }, q), cnt,
      h('button', { class: 'btn', onclick: function () { deals.unshift({ id: 'u-' + Date.now(), name: 'NEW DEAL', sector: '', size: '', status: '', date: ctNow().date, source: '', notes: '', url: '', origin: 'manual' }); save(); render(); toast('Row added – click cells to edit'); } }, '+ Add deal'),
      h('button', { class: 'btn ghost', onclick: function () { download('deal-tracker-' + ctNow().date + '.csv', toCSV(deals, COLS.concat([['url', 'Link'], ['origin', 'Origin']]))); } }, 'Export CSV'),
      h('button', { class: 'btn ghost', onclick: function () { if (confirm('Discard your edits and reset the tracker to the seed list from the briefs?')) { deals = seed.slice(); save(); render(); } } }, 'Reset to seed')]));
    var box = el.appendChild(h('div', { class: 'card', style: 'padding:8px' }));
    function render() {
      var ts = terms(q.value), rows = deals.filter(function (d) { return !ts.length || matchAll(COLS.map(function (c) { return d[c[0]]; }).join(' ') + ' ' + (d.origin || ''), ts); });
      rows.sort(function (a, b) { return String(a[sortKey] || '').localeCompare(String(b[sortKey] || '')) * sortDir; });
      cnt.textContent = rows.length + ' of ' + deals.length + ' deals';
      box.innerHTML = '';
      var thead = h('tr', null, COLS.map(function (c) { return h('th', { style: 'cursor:pointer', title: 'Sort', onclick: function () { if (sortKey === c[0]) sortDir = -sortDir; else { sortKey = c[0]; sortDir = c[0] === 'date' ? -1 : 1; } render(); } }, c[1] + (sortKey === c[0] ? (sortDir < 0 ? ' ▼' : ' ▲') : '')); }).concat([h('th', null, 'Link'), h('th', null, 'Origin'), h('th', null, '')]));
      var tbody = h('tbody', null, rows.map(function (d) {
        return h('tr', null, COLS.map(function (c) {
          var td = h('td', { contenteditable: 'true', spellcheck: 'false', style: c[0] === 'name' ? 'font-weight:700;white-space:nowrap' : c[0] === 'notes' || c[0] === 'status' ? 'min-width:200px' : '' }, d[c[0]] || '');
          td.addEventListener('blur', function () { var nv = td.textContent.trim(); if (nv !== (d[c[0]] || '')) { d[c[0]] = nv; save(); toast('Saved'); } });
          td.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); td.blur(); } });
          return td;
        }).concat([
          h('td', { style: 'white-space:nowrap' }, [d.url ? h('a', { href: d.url, target: '_blank', rel: 'noopener' }, 'open ↗') : h('span', { class: 'fine' }, '—'), ' ', h('button', { class: 'btn ghost sm', title: 'Edit link', onclick: function () { var u = prompt('Public source URL', d.url || ''); if (u !== null) { d.url = u.trim(); save(); render(); } } }, '✎')]),
          h('td', null, h('span', { class: 'badge ' + (/web/.test(d.origin) ? 'green' : /manual/.test(d.origin) ? 'gold' : 'gray') }, d.origin || '')),
          h('td', null, h('button', { class: 'btn ghost sm', title: 'Delete', onclick: function () { if (confirm('Delete ' + d.name + '?')) { deals.splice(deals.indexOf(d), 1); save(); render(); } } }, '✕'))
        ]));
      }));
      box.appendChild(h('div', { class: 'tbl-wrap' }, h('table', null, [h('thead', null, thead), tbody])));
      if (!rows.length) box.appendChild(h('p', { class: 'empty' }, 'No deals match.'));
    }
    q.addEventListener('input', render); render();
    el.appendChild(h('p', { class: 'fine' }, 'Origin: "brief" = taken from the desk brief text; "web-verified Oct 2" = public rating-agency/press release found by search on Oct 2, 2026; "brief-auto" = new shelf name auto-detected by build.sh in a newly ingested brief; "manual" = added by you. Sizes are as published (collateral/notes), not desk estimates.'));
  };

  /* ================= NOTES ================= */
  RENDER.notes = function (el) {
    var KEY = 'deskhub.notes.v1', notes = store.get(KEY, []), editing = null;
    var save = function () { store.set(KEY, notes); };
    el.appendChild(head('PM question log', 'A private notebook in this browser (localStorage). Log each PM question, your answer, the source and when it was observed. Export to CSV for email or the desk drive.'));
    var f = {
      date: h('input', { type: 'date', value: ctNow().date }), asker: h('input', { type: 'text', placeholder: 'PM / requester' }),
      status: h('select', null, [h('option', { value: 'open' }, 'Open'), h('option', { value: 'answered' }, 'Answered'), h('option', { value: 'follow-up' }, 'Follow-up')]),
      tags: h('input', { type: 'text', placeholder: 'tags (e.g. NQM, rates)' }), q: h('textarea', { rows: 2, placeholder: 'Question (e.g. "Where are Non-QM AAA spreads vs last month?")' }),
      a: h('textarea', { rows: 3, placeholder: 'Answer — number, date observed, survey/index/transaction' }), source: h('input', { type: 'text', placeholder: 'Source (e.g. KBRA presale, Freddie PMMS 10/1)' }), link: h('input', { type: 'text', placeholder: 'https://…' })
    };
    var saveBtn = h('button', { class: 'btn', onclick: function () {
      if (!f.q.value.trim()) { toast('Enter a question first'); f.q.focus(); return; }
      var rec = { id: editing ? editing.id : 'n-' + Date.now(), date: f.date.value, asker: f.asker.value.trim(), status: f.status.value, tags: f.tags.value.trim(), q: f.q.value.trim(), a: f.a.value.trim(), source: f.source.value.trim(), link: f.link.value.trim(), updated: new Date().toISOString() };
      if (editing) notes[notes.indexOf(editing)] = rec; else notes.unshift(rec);
      save(); clear(); render(); toast('Saved');
    } }, 'Save entry');
    function clear() { editing = null; saveBtn.textContent = 'Save entry'; ['asker', 'tags', 'q', 'a', 'source', 'link'].forEach(function (k) { f[k].value = ''; }); f.status.value = 'open'; f.date.value = ctNow().date; }
    var lab = function (t, e, cls) { return h('div', { class: cls || '' }, [h('label', { class: 'fine' }, t), e]); };
    el.appendChild(h('div', { class: 'card' }, [h('h2', null, 'New entry'), h('div', { class: 'form' }, [lab('Date', f.date), lab('Asked by', f.asker), lab('Status', f.status), lab('Tags', f.tags),
      lab('Question', f.q, 'span4'), lab('Answer', f.a, 'span4'), lab('Source', f.source, 'span2'), lab('Link', f.link, 'span2')]),
      h('div', { class: 'toolbar', style: 'margin:10px 0 0' }, [saveBtn, h('button', { class: 'btn ghost', onclick: clear }, 'Clear')])]));
    var q = h('input', { type: 'search', placeholder: 'Search log…' }), stf = h('select', { style: 'max-width:150px' }, [h('option', { value: '' }, 'All statuses'), h('option', { value: 'open' }, 'Open'), h('option', { value: 'answered' }, 'Answered'), h('option', { value: 'follow-up' }, 'Follow-up')]);
    var imp = h('input', { type: 'file', accept: '.json,application/json', hidden: true });
    imp.addEventListener('change', function () { var file = imp.files[0]; if (!file) return; file.text().then(function (t) { try { var arr = JSON.parse(t); if (!Array.isArray(arr)) throw new Error('not a list'); var ids = {}; notes.forEach(function (n) { ids[n.id] = 1; }); arr.forEach(function (n) { if (!ids[n.id]) notes.push(n); }); save(); render(); toast('Imported ' + arr.length + ' entries'); } catch (e) { toast('Import failed: ' + e.message); } }); imp.value = ''; });
    var COLS = [['date', 'Date'], ['asker', 'Asked by'], ['status', 'Status'], ['tags', 'Tags'], ['q', 'Question'], ['a', 'Answer'], ['source', 'Source'], ['link', 'Link']];
    el.appendChild(h('div', { class: 'toolbar' }, [h('div', { class: 'grow' }, q), stf,
      h('button', { class: 'btn ghost', onclick: function () { download('pm-question-log-' + ctNow().date + '.csv', toCSV(notes, COLS)); } }, 'Export CSV'),
      h('button', { class: 'btn ghost', onclick: function () { download('pm-question-log-' + ctNow().date + '.json', JSON.stringify(notes, null, 1), 'application/json'); } }, 'Backup JSON'),
      h('button', { class: 'btn ghost', onclick: function () { imp.click(); } }, 'Restore JSON'), imp]));
    var list = el.appendChild(h('div'));
    function render() {
      var ts = terms(q.value), rows = notes.filter(function (n) { return (!stf.value || n.status === stf.value) && (!ts.length || matchAll([n.q, n.a, n.source, n.tags, n.asker].join(' '), ts)); });
      list.innerHTML = '';
      if (!rows.length) { list.appendChild(h('div', { class: 'card empty' }, notes.length ? 'No entries match.' : 'No entries yet. Tip: check the "PM asks" table in Guides for where to find each answer.')); return; }
      rows.forEach(function (n) {
        list.appendChild(h('div', { class: 'note' }, [
          h('div', { class: 'toolbar', style: 'margin:0' }, [h('span', { class: 'q grow' }, n.q), h('span', { class: 'badge ' + (n.status === 'answered' ? 'green' : n.status === 'open' ? 'red' : 'gold') }, n.status),
            h('button', { class: 'btn ghost sm', onclick: function () { editing = n; Object.keys(f).forEach(function (k) { f[k].value = n[k] || ''; }); saveBtn.textContent = 'Update entry'; window.scrollTo({ top: 0, behavior: 'smooth' }); } }, 'Edit'),
            h('button', { class: 'btn ghost sm', onclick: function () { if (confirm('Delete this entry?')) { notes.splice(notes.indexOf(n), 1); save(); render(); } } }, '✕')]),
          h('div', { class: 'meta' }, [n.date ? fmtDate(n.date) : '', n.asker ? ' · ' + n.asker : '', n.tags ? ' · ' + n.tags : '']),
          n.a ? h('div', { class: 'a' }, n.a) : null,
          n.source || n.link ? h('div', { class: 'meta' }, ['Source: ' + (n.source || ''), n.link ? [' ', h('a', { href: n.link, target: '_blank', rel: 'noopener' }, 'link ↗')] : null]) : null
        ]));
      });
    }
    q.addEventListener('input', render); stf.addEventListener('change', render); render();
  };

  /* ================= GLOSSARY ================= */
  RENDER.glossary = function (el) {
    el.appendChild(head('Glossary', D.glossary.length + ' entries from the Key Concepts Cheat Sheet: desk glossary terms plus every formula (plain English, math, Excel version).'));
    var q = h('input', { type: 'search', placeholder: 'Search terms, meanings, formulas (e.g. "WAL", "convexity", "DSCR")…' }), kind = '', cnt = h('span', { class: 'fine' });
    var chips = h('div', { class: 'chips' }, ['All', 'Glossary', 'Formula'].map(function (k) { return h('button', { class: 'chip' + (k === 'All' ? ' on' : ''), onclick: function () { kind = k === 'All' ? '' : k; [].forEach.call(chips.children, function (c) { c.classList.toggle('on', c === this); }, this); render(); } }, k); }));
    el.appendChild(h('div', { class: 'toolbar' }, [h('div', { class: 'grow' }, q), chips, cnt]));
    var grid = el.appendChild(h('div', { class: 'gl' }));
    function render() {
      var ts = terms(q.value), rows = D.glossary.filter(function (g) { return (!kind || g.kind === kind) && (!ts.length || matchAll([g.term, g.meaning, g.excel, g.section].join(' '), ts)); });
      cnt.textContent = rows.length + ' shown'; grid.innerHTML = '';
      rows.forEach(function (g) {
        grid.appendChild(h('div', { class: 'g' }, [h('div', { class: 't' }, [g.term + ' ', h('span', { class: 'badge ' + (g.kind === 'Formula' ? '' : 'gray') }, g.kind)]), h('div', { class: 'm' }, g.meaning),
          g.mathHtml ? h('div', { class: 'm', html: g.mathHtml }) : null, g.excel ? h('div', { class: 'x' }, g.excel) : null, g.section ? h('div', { class: 'fine' }, g.section) : null]));
      });
      if (!rows.length) grid.appendChild(h('div', { class: 'empty' }, 'No entries match.'));
    }
    q.addEventListener('input', render); render();
  };

  route();
})();
