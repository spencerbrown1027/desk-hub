/* Default calculator inputs = the illustrative examples in trader-calcs.xlsx.
 * "Example numbers, not market data." */
(function (root) {
  var EX = {
    dv01: { face: 100000000, price: 98, accrued: 0, effDur: 5.2, convexity: -150, tyDv01: 75, fvDv01: 45, swapDv01PerMM: 850, ctdDv01: 62, ctdCF: 0.82, split10: 0.5, sigmaBp: 7 },
    grid: { tDur: 8, tConv: 80, shock: 100 },
    tsy: { settle: '2026-10-01', maturity: '2036-08-15', cpn: 0.0425, yld: 0.042, dy: 0.0001 },
    bump: { P0: 98, Pdn: 99.25, Pup: 96.7, bump: 0.0025 },
    prepay: { cpr: 0.12, smm: 0.01, psa: 150, age: 10, cdr: 0.02, amount: 400000, ageMo: 18, sched: [0.05, 0.04, 0.03, 0.02, 0.01] },
    cf: { origBal: 100000000, wac: 0.0725, servFee: 0.0025, term: 360, cpr: 0.15, cdr: 0.01, severity: 0.3, yield: 0.068, price: 101 },
    gap: { mtg: 0.064, ust10: 0.042, cc: 0.053 },
    bey: { mtgYld: 0.06 },
    gs: { bondYld: 0.0575, wal: 6.5, tLo: 5, tHi: 10, yLo: 0.04, yHi: 0.042, swapSpreadBp: -20, z: 160, oas: 95, quote32: 98.16, tickFace: 1000000 },
    roll: { cpn: 0.06, repo: 0.05, days: 30, px: 100, pctPaid: 0.01, drop32: 4 },
    dscr: { loan: 300000, noteRate: 0.0725, amortTerm: 360, io: 0, rent: 3000, taxes: 300, ins: 120, hoa: 0 },
    ltv: { loan: 300000, appraisal: 400000, purchase: 410000, second: 0, curBal: 300000, hpa: -0.1, debt: 4000, income: 12000 },
    rtl: { loan: 270000, purchase: 250000, rehab: 50000, arv: 400000, cdr: 0.02, sev: 0.3 }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = EX; else root.CalcExamples = EX;
})(this);
