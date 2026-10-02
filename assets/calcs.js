/* RMBS Desk Hub - calculator library (pure functions, no DOM).
 * Mirrors the formulas in trader-calcs.xlsx (tab/cell noted per function).
 * Units: rates/yields as decimals (5% = 0.05) unless the name ends in _bp.
 * Works in the browser (window.Calcs) and in Node (module.exports) for tests. */
(function (root) {
  'use strict';
  var C = {};
  var NORMSINV_99 = 2.3263478740408408; // NORM.S.INV(0.99)

  /* ---------- generic finance helpers (Excel-compatible) ---------- */
  C.pmt = function (rate, nper, pv) { // Excel PMT(rate,nper,-pv) => positive payment
    if (nper <= 0) return 0;
    if (Math.abs(rate) < 1e-15) return pv / nper;
    return pv * rate / (1 - Math.pow(1 + rate, -nper));
  };
  C.ipmtFirst = function (rate, nper, pv) { return pv * rate; };
  C.irr = function (cfs, guess) { // periodic IRR, Newton with bisection fallback
    var r = guess == null ? 0.005 : guess, i, k;
    function npv(rt) { var s = 0; for (k = 0; k < cfs.length; k++) s += cfs[k] / Math.pow(1 + rt, k); return s; }
    function dnpv(rt) { var s = 0; for (k = 1; k < cfs.length; k++) s -= k * cfs[k] / Math.pow(1 + rt, k + 1); return s; }
    for (i = 0; i < 100; i++) {
      var f = npv(r), d = dnpv(r);
      if (!isFinite(f) || !isFinite(d) || d === 0) break;
      var nr = r - f / d;
      if (Math.abs(nr - r) < 1e-12) return nr;
      r = nr;
    }
    var lo = -0.99, hi = 1, flo = npv(lo);
    for (i = 0; i < 300; i++) {
      var mid = (lo + hi) / 2, fm = npv(mid);
      if ((fm > 0) === (flo > 0)) { lo = mid; flo = fm; } else hi = mid;
      if (hi - lo < 1e-14) break;
    }
    return (lo + hi) / 2;
  };

  /* ---------- Excel PRICE / YIELD / DURATION, basis 1 (act/act) ---------- */
  function ymd(d) { return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()); }
  function days(a, b) { return Math.round((ymd(b) - ymd(a)) / 86400000); }
  function lastDom(y, m) { return new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); }
  function addMonths(d, n, eom) {
    var y = d.getUTCFullYear(), m = d.getUTCMonth() + n;
    y += Math.floor(m / 12); m = ((m % 12) + 12) % 12;
    var dd = eom ? lastDom(y, m) : Math.min(d.getUTCDate(), lastDom(y, m));
    return new Date(Date.UTC(y, m, dd));
  }
  C.toDate = function (s) { if (s instanceof Date) return s; var p = String(s).split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); };
  function coupons(settle, maturity, freq) {
    var step = 12 / freq, eom = maturity.getUTCDate() === lastDom(maturity.getUTCFullYear(), maturity.getUTCMonth());
    var n = 0, ncd = maturity, pcd;
    while (true) { pcd = addMonths(maturity, -step * (n + 1), eom); if (pcd <= settle) break; ncd = pcd; n++; }
    return { pcd: pcd, ncd: ncd, N: n + 1 };
  }
  C.bondPrice = function (settle, maturity, rate, yld, redemption, freq) {
    settle = C.toDate(settle); maturity = C.toDate(maturity); redemption = redemption || 100; freq = freq || 2;
    var c = coupons(settle, maturity, freq), E = days(c.pcd, c.ncd), A = days(c.pcd, settle), DSC = E - A;
    var cpn = 100 * rate / freq, y = yld / freq;
    if (c.N === 1) return (redemption + cpn) / (1 + (DSC / E) * y) - cpn * A / E;
    var p = redemption / Math.pow(1 + y, c.N - 1 + DSC / E);
    for (var k = 1; k <= c.N; k++) p += cpn / Math.pow(1 + y, k - 1 + DSC / E);
    return p - cpn * A / E;
  };
  function isLeap(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
  C.yearFracActAct = function (a, b) { // Excel/LibreOffice YEARFRAC basis 1
    a = C.toDate(a); b = C.toDate(b);
    var y1 = a.getUTCFullYear(), y2 = b.getUTCFullYear(), m1 = a.getUTCMonth(), m2 = b.getUTCMonth(), d1 = a.getUTCDate(), d2 = b.getUTCDate();
    var n = days(a, b);
    var withinYear = y1 === y2 || (y2 === y1 + 1 && (m1 > m2 || (m1 === m2 && d1 >= d2)));
    if (!withinYear) {
      var yrs = y2 - y1 + 1, tot = days(new Date(Date.UTC(y1, 0, 1)), new Date(Date.UTC(y2 + 1, 0, 1)));
      return n / (tot / yrs);
    }
    var diy;
    if (y1 === y2) diy = isLeap(y1) ? 366 : 365;
    else diy = ((isLeap(y1) && (m1 < 1 || (m1 === 1 && d1 <= 29))) || (isLeap(y2) && (m2 > 1 || (m2 === 1 && d2 === 29)))) ? 366 : 365;
    return n / diy;
  };
  // Macaulay duration in years, same algorithm as Excel's Analysis DURATION (and LibreOffice):
  // period offset = YEARFRAC(settle,maturity,1)*freq - COUPNUM.
  C.bondDuration = function (settle, maturity, rate, yld, freq) {
    settle = C.toDate(settle); maturity = C.toDate(maturity); freq = freq || 2;
    var N = coupons(settle, maturity, freq).N, diff = C.yearFracActAct(settle, maturity) * freq - N;
    var cpn = 100 * rate / freq, y = 1 + yld / freq, dur = 0, p = 0, t;
    for (t = 1; t < N; t++) { dur += (t + diff) * cpn / Math.pow(y, t + diff); p += cpn / Math.pow(y, t + diff); }
    dur += (N + diff) * (cpn + 100) / Math.pow(y, N + diff); p += (cpn + 100) / Math.pow(y, N + diff);
    return dur / p / freq;
  };
  C.bondMDuration = function (settle, maturity, rate, yld, freq) { freq = freq || 2; return C.bondDuration(settle, maturity, rate, yld, freq) / (1 + yld / freq); };
  C.bondYield = function (settle, maturity, rate, price, redemption, freq) {
    var lo = -0.05, hi = 1;
    for (var i = 0; i < 200; i++) { var mid = (lo + hi) / 2; if (C.bondPrice(settle, maturity, rate, mid, redemption, freq) > price) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  };

  /* ---------- Duration_DV01_Hedge ---------- */
  C.dv01Hedge = function (p) {
    var MV = p.face * (p.price + (p.accrued || 0)) / 100;            // B20
    var dv01 = p.effDur * MV * 0.0001;                                 // B21
    var ty = Math.round(dv01 * p.split10 / p.tyDv01);                  // B23
    var fv = Math.round(dv01 * (1 - p.split10) / p.fvDv01);            // B24
    return {
      mv: MV, dv01: dv01,
      allIn10s: dv01 / p.tyDv01,                                      // B22
      tyContracts: ty, fvContracts: fv,
      residual: dv01 - ty * p.tyDv01 - fv * p.fvDv01,                  // B25
      swapNotional: dv01 / p.swapDv01PerMM * 1e6,                      // B26
      ctdFutDv01: p.ctdDv01 / p.ctdCF,                                  // B27
      var99: NORMSINV_99 * p.sigmaBp * dv01                             // B28
    };
  };
  /* ---------- price change: -D*dy + 0.5*C*dy^2 (grid rows 49-57) ---------- */
  C.priceChange = function (effDur, convexity, dy) { return -effDur * dy + 0.5 * convexity * dy * dy; };
  C.scenarioGrid = function (p, shocksBp) {
    return shocksBp.map(function (bp) {
      var dy = bp / 10000, pct = C.priceChange(p.effDur, p.convexity, dy);
      return { bp: bp, pct: pct, pnl: p.mv * pct, tPct: C.priceChange(p.tDur, p.tConv, dy), newPx: p.price * (1 + pct) };
    });
  };
  /* ---------- Convexity_Bump ---------- */
  C.bump = function (P0, Pdn, Pup, bump) {
    var D = (Pdn - Pup) / (2 * P0 * bump), Cx = (Pdn + Pup - 2 * P0) / (P0 * bump * bump);
    var dn = -D * (-0.01) + 0.5 * Cx * 1e-4, up = -D * 0.01 + 0.5 * Cx * 1e-4;
    return { effDur: D, convexity: Cx, pctDn100: dn, pctUp100: up, asymmetry: dn + up };
  };
  /* ---------- Prepay_Conversions ---------- */
  C.cprToSmm = function (cpr) { return 1 - Math.pow(1 - cpr, 1 / 12); };
  C.smmToCpr = function (smm) { return 1 - Math.pow(1 - smm, 12); };
  C.psaToCpr = function (psa, age) { return psa / 100 * 0.06 * Math.min(age, 30) / 30; };
  C.cdrToMdr = C.cprToSmm;
  C.penalty = function (amount, ageMo, sched) { return ageMo >= 60 ? 0 : amount * sched[Math.floor(ageMo / 12)]; };
  /* ---------- CashFlow_Model (360 rows, cols A..R) ---------- */
  C.cashFlow = function (p) {
    var smm = C.cprToSmm(p.cpr), mdr = C.cdrToMdr(p.cdr), bal = p.origBal, rows = [];
    var sumPV = 0, sumPrin = 0, sumWt = 0, sumLoss = 0, sumPrepay = 0, cfs = [-p.price / 100 * p.origBal];
    for (var m = 1; m <= p.term; m++) {
      var beg = bal, def = beg * mdr, perf = beg - def;
      var sched = perf > 0.005 ? C.pmt(p.wac / 12, p.term - m + 1, perf) : 0;
      var gInt = perf * p.wac / 12, nInt = perf * (p.wac - p.servFee) / 12, sPrin = sched - gInt;
      var prepay = (perf - sPrin) * smm, loss = def * p.severity, rec = def - loss, tPrin = sPrin + prepay + rec;
      var end = perf - sPrin - prepay, cf = nInt + tPrin, df = Math.pow(1 + p.yield / 12, -m);
      rows.push({ m: m, beg: beg, def: def, perf: perf, sched: sched, gInt: gInt, nInt: nInt, sPrin: sPrin, prepay: prepay, loss: loss, rec: rec, tPrin: tPrin, end: end, cf: cf, df: df, pv: cf * df });
      sumPV += cf * df; sumPrin += tPrin; sumWt += m * tPrin; sumLoss += loss; sumPrepay += prepay; cfs.push(cf); bal = end;
    }
    var y = C.irr(cfs, 0.005) * 12;
    return {
      rows: rows,
      priceFromYield: sumPV / p.origBal * 100,                        // G6
      yieldFromPrice: y,                                               // G8
      yieldBEY: 2 * (Math.pow(1 + y / 12, 6) - 1),                     // G9
      wal: sumWt / sumPrin / 12,                                       // G10
      cumLoss: sumLoss / p.origBal,                                    // G11
      totalPrepay: sumPrepay,                                          // G12
      checkOK: Math.abs(sumPrin + sumLoss - p.origBal) < 1,            // G13
      endBal: bal                                                      // G14
    };
  };
  /* ---------- Spreads ---------- */
  C.gapDecomp = function (mtg, ust10, cc) { return { gap: (mtg - ust10) * 1e4, primSec: (mtg - cc) * 1e4, secondary: (cc - ust10) * 1e4 }; };
  C.mtgToBey = function (y) { return 2 * (Math.pow(1 + y / 12, 6) - 1); };
  C.beyToMtg = function (b) { return 12 * (Math.pow(1 + b / 2, 1 / 6) - 1); };
  C.gSpread = function (p) {
    var ust = p.yLo + (p.wal - p.tLo) * (p.yHi - p.yLo) / (p.tHi - p.tLo), g = (p.bondYld - ust) * 1e4;
    return { ustAtWal: ust, gSpread: g, iSpread: g - p.swapSpreadBp };
  };
  C.dollarDe = function (q, frac) { frac = frac || 32; var i = Math.trunc(q), f = q - i, digits = Math.ceil(Math.log10(frac)); return i + Math.round(f * Math.pow(10, digits) * 1e6) / 1e6 / frac; };
  C.dollarFr = function (d, frac) { frac = frac || 32; var i = Math.trunc(d), digits = Math.ceil(Math.log10(frac)); return i + (d - i) * frac / Math.pow(10, digits); };
  C.rollCarry = function (p) {
    var carry = p.cpn / 12 * 100 - p.repo * p.days / 360 * p.px + (100 - p.px) * p.pctPaid;
    return { carry: carry, breakEven32: carry * 32, special: p.drop32 > carry * 32 };
  };
  /* ---------- DSCR_LTV ---------- */
  C.dscr = function (p) {
    var r = p.noteRate / 12, pi = p.io ? p.loan * r : C.pmt(r, p.amortTerm, p.loan);
    var pitia = pi + p.taxes + p.ins + p.hoa, ip = p.loan * r;
    return { pi: pi, pitia: pitia, dscr: p.rent / pitia, ipmt1: ip, ppmt1: C.pmt(r, p.amortTerm, p.loan) - ip };
  };
  C.ltv = function (p) {
    var v = Math.min(p.appraisal, p.purchase);
    return { ltv: p.loan / v, cltv: (p.loan + p.second) / v, curLtv: p.curBal / (v * (1 + p.hpa)) };
  };
  C.rtl = function (p) { return { ltc: p.loan / (p.purchase + p.rehab), ltarv: p.loan / p.arv }; };

  if (typeof module !== 'undefined' && module.exports) module.exports = C; else root.Calcs = C;
})(this);
