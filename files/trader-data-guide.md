---
title: "Residential Mortgage / RMBS Trader External Data Reference Guide"
subtitle: "Prepared Sep 30, 2026 · Public/commercial external sources only."
---

**Prepared Sep 30, 2026.** *Public/commercial external sources only.* This guide does not reference, describe, or rely on any internal systems, data, or desk sheets. Every link was checked when the guide was prepared; websites move, so if a deep link breaks, go to the site root listed and navigate from there. No market levels are quoted anywhere in this document on purpose: the point is to tell you where to get the current number, not to give you a number that will be stale by the time you read it.

**Cost key used throughout:** **Free** = open to anyone. **Free w/ reg** = free but requires an account. **Paid** = subscription or license, tagged as **Must-request** (ask the firm for access now), **Nice to have**, or **Skip** (not worth it for a temporary coverage role). All times are **Central Time (CT)** unless marked otherwise; most US releases are scheduled in Eastern Time (ET), which is one hour ahead of CT.

**Contents**

1. How to use this guide (incl. "PM asks X → go to Y" quick-answer table)
2. Rates and the curve (Treasuries, SOFR/swaps, Fed path, volatility and breakevens)
3. Mortgage rates: which source, when (incl. mortgage-to-10Y and primary-secondary spread)
4. Spreads and MBS pricing (agency TBA, non-agency, CRT, broad credit)
5. Deal flow and new issue (incl. shelf names by issuer)
6. Credit performance and surveillance
7. Prepayments
8. Housing and macro fundamentals (incl. economic calendar)
9. Industry news and market color
10. Regulatory and policy
11. Paid access: what to request from the firm (incl. Bloomberg functions)
12. Daily, weekly and monthly calendar (Central Time)
13. Answering PMs (source hierarchy, rules, worked examples)

Appendix A: What is only available paid · Appendix B: Full link index

# 1. How to use this guide

## 1.1 The three-step routine

1. **Translate the vague question into a metric.** "Where are Non-QM spreads?" really means "What spread over the curve did the most recent AAA Non-QM senior tranches price at, and how does that compare with a month ago?" Section 1.2 does this translation for the most common questions.
2. **Go to the highest-quality source that has that metric.** Official data beats index providers, which beat rating agencies, which beat trade press, which beat social media (see Section 13). If the only real source is paid, say so and use the best free proxy while you request access.
3. **Answer with a date-stamp and a source.** Say what the number is, when it was observed, where it came from, and whether it is survey, index, or transaction data. For example: "Per Freddie Mac PMMS released Thursday (applications Thu–Wed), versus the 10-year CMT average over the same window."

## 1.2 Quick-answer table: "PM asks X → go to Y"

| PM asks | Go to first | Specific metric to quote | Backup / paid upgrade |
|-------------------|-------------------|---------------------|-------------------|
| "Where are mortgage rates today?" | MND Daily Index (~3:00 pm CT) | 30Y conforming rate today and day-over-day change | Optimal Blue OBMMI on FRED (OBMMIC30YF, one-day lag); Bloomberg |
| "Where are mortgage rates vs 10s?" | Freddie PMMS + FRED DGS10 | PMMS 30Y minus 10Y CMT averaged over the same Thu–Wed window, in bp; trend vs 4 and 52 weeks | MND index minus same-day 10Y close; Urban Institute chartbook |
| "Where is the primary-secondary spread?" | Urban Institute chartbook (monthly chart) | Mortgage rate minus current-coupon MBS yield | Bloomberg current-coupon ticker (confirm with desk); dealer research |
| "Where are jumbo rates vs conforming?" | FRED: OBMMIJUMBO30YF vs OBMMIC30YF | Jumbo-minus-conforming lock-rate differential (bp) | MND jumbo commentary; Optimal Blue Market Data (paid) |
| "Where are Non-QM spreads?" | Trade press deal stories (ASR, HousingWire), dealer research, broker color | Latest AAA senior spread and coupon on recent Non-QM deals, with deal names and dates | Finsight/CreditFlow, Asset-Backed Alert, Bloomberg NIM (paid) |
| "What did the last Non-QM deal price at?" | Finsight/CreditFlow (free w/ reg for basic views) + rating-agency new-issue reports | Tranche sizes, ratings, CE levels, pricing spreads or coupons, pool WAC/FICO/CLTV | Bloomberg NIM/DES; IFR; Asset-Backed Alert |
| "What did the last CRT deal price at?" | Fannie Mae CAS Pricing page; Freddie Mac STACR Pricing page | Tranche spread over 30-day SOFR, size, CE, ratings, per deal | Dealer CRT research; Bloomberg |
| "Where are Non-QM / DSCR note rates to borrowers?" | Latest presale reports (KBRA, Fitch, Morningstar DBRS) | Pool weighted-average coupon (WAC), split by DSCR vs full-doc/bank statement | dv01 and Fitch-dv01 benchmarks (paid); Optimal Blue non-QM data (paid) |
| "How's DSCR / investor credit performing?" | Rating-agency surveillance and research pieces; KBRA/Fitch Non-QM research | 60+ DQ, 90+ DQ, CDR and loss by vintage, DSCR vs non-DSCR split | dv01, Intex, KBRA Premium RMBS indices (paid) |
| "How's Non-QM credit performing overall?" | Fitch / KBRA / Morningstar DBRS research; Asset Securitization Report | Serious delinquency trend by vintage; roll rates if available | dv01 (paid, best), Intex, Cotality PLS data |
| "How's prime jumbo credit?" | Rating-agency surveillance; Fitch-dv01 prime jumbo benchmark (paid) | 60+ DQ and CPR for recent jumbo shelves (SEMT, JPMMT, etc.) | dv01, Intex |
| "How's agency credit / overall mortgage credit?" | ICE First Look (monthly); MBA NDS (quarterly) | National DQ rate, serious DQ, foreclosure starts; by product (FHA/VA/conv) | NY Fed Household Debt & Credit (quarterly); Fed DRSFRMACBS on FRED |
| "What's the prepay outlook?" | ICE First Look (SMM); MBA Refi Index (weekly); Fannie/Freddie monthly prepay disclosures | Last month SMM/CPR, refi application trend, share of borrowers in the money | eMBS, Recursion, dealer prepay reports (paid/broker) |
| "What were speeds this month?" | Fannie Mae Data Dynamics / Freddie Mac MBS disclosures (4th business day) | 1-month CPR by coupon/vintage | eMBS, Recursion, Bloomberg; dealer CPR-day notes |
| "Where are RTL / fix-and-flip deals clearing?" | Rating-agency new-issue reports for rated RTL (e.g., LHOME, TRK); trade press | Deal size, advance rates, CE, coupon; note most RTL is unrated/private | Broker color; Finsight/CreditFlow |
| "What's going on in HELOC / closed-end seconds?" | Rating-agency presales for CES/HELOC shelves (RCKT CES, FIGRE, BRAVO CES) | Pool CLTV, FICO, WAC; senior spread from deal stories | dv01 CES/HELOC benchmarks; Finsight |
| "How much Non-agency issuance YTD?" | SIFMA MBS statistics; ASR issuance totals | YTD issuance by sector vs prior year | Finsight/CreditFlow, Inside Mortgage Finance (paid) |
| "Where's the 10-year / 2s10s?" | CNBC quote (intraday); Treasury par curve (end-of-day) | 10Y yield and 2s10s slope in bp; change on the day | FRED T10Y2Y (next day); Bloomberg |
| "What is the market pricing for the Fed?" | CME FedWatch | Probability of a cut/hike at the next meeting; implied path | Bloomberg WIRP; Fed dot plot for comparison |
| "What does the Fed think?" | FOMC statement, SEP / dot plot, minutes | Median dot for year-end, statement language changes | Fed speaker calendar; Nick Timiraos (WSJ) |
| "Where are credit spreads broadly (HY/IG)?" | FRED ICE BofA OAS series | BAMLH0A0HYM2 (HY OAS), BAMLC0A0CM (IG OAS), BAMLC0A4CBBB (BBB OAS) | Bloomberg; dealer credit research |
| "How volatile are rates?" | MOVE index (Bloomberg, broker screens); VIX on FRED (VIXCLS) | MOVE level and change; realized 10Y moves | Swaption vol from dealer research |
| "Where are home prices going?" | S&P Cotality Case-Shiller; FHFA HPI; ICE HPI (Mortgage Monitor) | YoY and MoM (SA) HPA, national and top MSAs | Cotality HPI (paid detail); Zillow ZHVI |
| "How are rents? (DSCR angle)" | Zillow ZORI; Apartment List national rent data | YoY rent growth, vacancy index | Census rental vacancy (FRED RRVRUSQ156N) |
| "How's housing activity?" | NAR existing sales; Census new home sales/starts; NAHB HMI | SAAR sales, months' supply, starts/permits, builder sentiment | Redfin / Realtor.com weekly data |
| "What's inventory doing?" | Realtor.com research data; Redfin data center | Active listings YoY, new listings, days on market | FRED ACTLISCOUUS (Realtor.com) |
| "What are the forecasters saying on originations/rates?" | Fannie Mae ESR forecast; MBA forecast | Origination volume, purchase vs refi, rate path | Freddie Mac research; dealer outlooks |
| "Is credit tightening?" | MBA Mortgage Credit Availability Index (monthly); Fed SLOOS (quarterly) | MCAI level/change by segment; net % banks tightening | Trade press on lender guideline changes |
| "Any regulatory changes that matter?" | FHFA news; Fannie/Freddie seller communications; CFPB | Loan limits, LLPAs, credit score policy, QM rule changes | Inside Mortgage Finance (paid); law-firm client alerts |
| "What's the macro calendar this week?" | BLS, BEA, Census, Fed calendars | Date/time (CT) of CPI, payrolls, PCE, GDP, FOMC | Bloomberg ECO; Investing.com calendar |

Table: The most common PM questions and where to go first.

# 2. Rates and the curve

Mortgage pricing is a spread product, so almost every answer starts with the Treasury and swap curve. Know three things cold: where the 10-year is (the benchmark PMs and the press use for mortgage rates), where the 2s10s and 5s/10s slope is (drives hedge ratios and the relative value of shorter-duration product such as RTL and HELOCs), and what the market is pricing for the Fed (drives the front end, SOFR-floating CRT coupons, and warehouse funding costs).

## 2.1 Treasury yields

| Source | What you get | Cost | When it updates | Best used for | Link |
|--------------|--------------------|--------|-----------|--------------|--------------|
| U.S. Treasury Daily Par Yield Curve | Official par yields 1M–30Y (the "CMT" curve); real yield curve on a separate page | Free | Business days; based on indicative bid quotes collected at or near 2:30 pm CT; usually posted late afternoon/evening (time not guaranteed) | The official end-of-day curve for date-stamped answers | [home.treasury.gov – Daily Treasury Par Yield Curve](https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve) |
| Treasury Interest Rate Statistics (methodology) | Explanation of how the par curve is built | Free | Static | Understanding what "CMT" means when a PM asks | [home.treasury.gov – Interest Rate Statistics](https://home.treasury.gov/policy-issues/financing-the-government/interest-rate-statistics) |
| FRED constant-maturity series | DGS1MO, DGS3MO, DGS2, DGS5, DGS10, DGS30; spreads T10Y2Y, T10Y3M | Free | Daily, generally posted the following business day (sourced from Fed H.15) | Charts, history, spreads, Excel downloads, combining with mortgage series | [fred.stlouisfed.org/series/DGS10](https://fred.stlouisfed.org/series/DGS10) |
| Federal Reserve H.15 Selected Interest Rates | Daily Treasury CMT, fed funds, commercial paper | Free | Daily (business days) | Official citation for historical rates | [federalreserve.gov/releases/h15](https://www.federalreserve.gov/releases/h15/) |
| CNBC bond quotes | Real-time-ish Treasury yields, intraday charts | Free | Intraday | Fast "where's the 10-year right now?" check | [cnbc.com/quotes/US10Y](https://www.cnbc.com/quotes/US10Y) |
| WSJ Market Data – Bonds | Treasury yields, benchmark rates table | Free (some content paywalled) | Intraday / end of day | Quick table of the curve | [wsj.com/market-data/bonds](https://www.wsj.com/market-data/bonds) |
| TreasuryDirect upcoming auctions | Auction schedule and results | Free | Ongoing; most coupon auction results post at 12:00 pm CT | Knowing when 10Y/30Y supply hits (can move MBS) | [treasurydirect.gov – Upcoming auctions](https://www.treasurydirect.gov/auctions/upcoming/) |
| Bloomberg Terminal | Live curve, USGG10YR Index etc., BTMM monitor | Paid – Must-request | Real time | Everything live; the professional standard | [bloomberg.com/professional](https://www.bloomberg.com/professional/) |

Table: Treasury yield sources.

## 2.2 SOFR, swaps, and floating-rate benchmarks

SOFR matters for three reasons in this role: CRT (CAS and STACR) coupons float over 30-day average SOFR, many warehouse and repo lines are priced off SOFR or Term SOFR, and swap spreads affect how agency and non-agency paper is hedged and valued.

| Source | What you get | Cost | When it updates | Best used for | Link |
|--------------|--------------------|--------|-----------|--------------|--------------|
| NY Fed SOFR | Official SOFR rate, volume, percentiles | Free | Around 7:00 am CT each business day (can be revised until 1:30 pm CT) | Official overnight SOFR | [newyorkfed.org – SOFR](https://www.newyorkfed.org/markets/reference-rates/sofr) |
| NY Fed SOFR Averages & Index | 30-, 90-, 180-day compounded averages; SOFR Index | Free | Shortly after the SOFR release | CRT coupon math (30-day average SOFR) | [newyorkfed.org – SOFR Averages and Index](https://www.newyorkfed.org/markets/reference-rates/sofr-averages-and-index) |
| FRED SOFR series | SOFR, SOFR30DAYAVG, EFFR, DFEDTARU/DFEDTARL (target range) | Free | Daily | Charting SOFR vs fed funds and target range | [fred.stlouisfed.org/series/SOFR](https://fred.stlouisfed.org/series/SOFR) |
| CME Term SOFR | 1M/3M/6M/12M forward-looking Term SOFR | Free to view (license for commercial use) | Daily | Loan/warehouse benchmarks | [cmegroup.com – Term SOFR](https://www.cmegroup.com/market-data/cme-group-benchmark-administration/term-sofr.html) |
| Chatham Financial market rates | Swap rates, SOFR forward curve, Treasury rates (free display) | Free | Daily | Quick free swap-rate and forward-curve check | [chathamfinancial.com – US market rates](https://www.chathamfinancial.com/technology/us-market-rates) |
| Pensford forward curve | SOFR forward curve and rate-cap context | Free | Daily | Quick forward SOFR path | [pensford.com/forward-curve](https://pensford.com/forward-curve) |
| Bloomberg (SWPM, curve screens) | Live swap curve, swap spreads, forwards | Paid – Must-request | Real time | Precise swap/hedge levels | [bloomberg.com/professional](https://www.bloomberg.com/professional/) |

Table: SOFR and swap-rate sources.

Free swap-rate pages (Chatham, Pensford) are fine for context ("the 5-year swap is roughly X") but should not be used to mark positions. For anything that goes into a price or a hedge ratio, use Bloomberg or dealer runs.

## 2.3 The Fed path

| Source | What you get | Cost | When it updates | Best used for | Link |
|--------------|--------------------|--------|-----------|--------------|--------------|
| CME FedWatch | Market-implied probabilities for each FOMC meeting from fed funds futures | Free | Real time during futures trading | "What's priced for the next meeting?" | [cmegroup.com – FedWatch](https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html) |
| FOMC meeting calendar, statements, minutes | Meeting dates, statements (1:00 pm CT on decision day), minutes (1:00 pm CT, about three weeks after) | Free | Per schedule (8 meetings/year) | Knowing when event risk hits | [federalreserve.gov – FOMC calendars](https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm) |
| Summary of Economic Projections (dot plot) | Median and dispersion of FOMC participants' rate, growth, inflation, unemployment projections | Free | Quarterly (March, June, September, December meetings) | "What does the Fed itself expect?" | [Guide to the SEP](https://www.federalreserve.gov/monetarypolicy/guide-to-the-summary-of-economic-projections.htm); latest: [Sept 16, 2026 SEP](https://www.federalreserve.gov/monetarypolicy/fomcprojtabl20260916.htm) |
| Fed events calendar | Speeches, testimony by Board members | Free | Updated continuously | Knowing which Fed speakers are on today | [federalreserve.gov – Calendar](https://www.federalreserve.gov/newsevents/calendar.htm) |
| Nick Timiraos (WSJ chief economics correspondent) | Widely read reporting on Fed thinking | WSJ Paid (X posts free) | Ad hoc, heaviest around FOMC | Reading the Fed's likely message before meetings | [x.com/NickTimiraos](https://x.com/NickTimiraos); [wsj.com](https://www.wsj.com/) |
| Bloomberg WIRP | World interest rate probabilities (implied policy path) | Paid – Must-request | Real time | Precise implied path | [bloomberg.com/professional](https://www.bloomberg.com/professional/) |

Table: Fed policy sources.

## 2.4 Rate volatility and inflation expectations

| Source | What you get | Cost | When it updates | Best used for | Link |
|--------------|--------------------|--------|-----------|--------------|--------------|
| ICE BofA MOVE Index | Treasury implied volatility index (the rates "VIX") | Paid for full data (quoted on Bloomberg as MOVE Index; often shown on free charting sites) | Daily | Explaining why MBS spreads widened/tightened (MBS are short volatility) | [ice.com – fixed income indices](https://www.ice.com/fixed-income-data-services/index-solutions/fixed-income-indices) |
| Cboe VIX / FRED VIXCLS | Equity implied volatility | Free | Daily (FRED next day) | Risk-sentiment context | [fred.stlouisfed.org/series/VIXCLS](https://fred.stlouisfed.org/series/VIXCLS); [cboe.com – VIX](https://www.cboe.com/tradable-products/vix) |
| FRED breakevens | T5YIE, T10YIE (breakeven inflation), T5YIFR (5y5y forward); DFII10 (10Y TIPS real yield) | Free | Daily (next business day) | "Is the move in 10s real yields or inflation?" | [fred.stlouisfed.org/series/T10YIE](https://fred.stlouisfed.org/series/T10YIE) |
| Treasury real yield curve | Official TIPS par real yields | Free | Business days | Official real-yield citation | [home.treasury.gov – Real Yield Curve](https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_real_yield_curve) |
| Cleveland Fed inflation nowcast | Daily nowcast of CPI/PCE | Free | Daily | Pre-CPI expectations | [clevelandfed.org – Inflation Nowcasting](https://www.clevelandfed.org/indicators-and-data/inflation-nowcasting) |
| Atlanta Fed GDPNow | Running nowcast of current-quarter GDP | Free | Several times a month after major data | Growth context | [atlantafed.org – GDPNow](https://www.atlantafed.org/research-and-data/data/gdpnow) |

Table: Volatility and inflation-expectation sources.

**Why vol matters for mortgages.** Mortgage borrowers hold a prepayment option, so an MBS investor is effectively short an option. When implied volatility (MOVE) rises, the option is worth more, and agency MBS spreads tend to widen; when vol falls, spreads tend to tighten. Many DSCR/investor loans carry prepayment penalties and some Non-QM borrowers have less ability to refinance, so that collateral can be less negatively convex; its spreads still move with overall risk appetite.

# 3. Mortgage rates: which source, when

Different "mortgage rate" numbers measure different things. A PM who sees one number on CNBC and another from Freddie Mac will ask why they differ, so know the construction of each.

| Type | Examples | What it really measures | Strength | Weakness |
|-----------|--------------|--------------------|--------------|--------------|
| Survey / application-based weekly average | Freddie Mac PMMS; MBA contract rate | Average rate on applications over a past window | Long history, official-feeling, press standard | Lags the market by days; weekly only |
| Daily rate-sheet index | Mortgage News Daily (MND) index | Lender rate-sheet pricing for a standard top-tier scenario, adjusted for points | Same-day, tracks MBS moves closely | Not transaction data; one borrower profile |
| Lock-based transaction index | Optimal Blue OBMMI | Average rate on actual locks made through the Optimal Blue pricing engine the prior day | Real transactions, product and FICO/LTV splits | One-day lag; mix effects (borrower profile changes shift the average) |
| Consumer-facing quote aggregators | Bankrate, Zillow | Advertised/quoted rates to consumers | Easy, widely cited in press | Least precise; methodology varies; includes points assumptions |

Table: The four kinds of mortgage-rate data.

## 3.1 Source-by-source

| Source | What you get | Cost | When it updates | Best used for | Link |
|--------------|--------------------|--------|-----------|--------------|--------------|
| MND Daily Mortgage Rate Index | Daily 30Y conforming (plus 15Y, FHA, VA, jumbo) from lender rate sheets | Free | Weekdays around 3:00 pm CT; may update intraday if lenders reprice | "Where are rates today?" and day-over-day moves | [mortgagenewsdaily.com/mortgage-rates/mnd](https://www.mortgagenewsdaily.com/mortgage-rates/mnd); methodology: [About MND's rates](https://www.mortgagenewsdaily.com/mortgage-rates/about) |
| Freddie Mac PMMS | Weekly 30Y and 15Y fixed averages from applications submitted to Freddie Mac's Loan Product Advisor (conventional, conforming, purchase) | Free | Thursdays 11:00 am CT (Wednesday if Thursday is a holiday); covers Thursday–Wednesday applications | The headline number press and PMs quote; long history | [freddiemac.com/pmms](https://www.freddiemac.com/pmms); FRED MORTGAGE30US / MORTGAGE15US |
| MBA Weekly Applications Survey | Purchase and Refi indices, refi share, average contract rates (30Y conforming, jumbo, FHA, 15Y, ARM) and points | Free headline (full data for MBA members/paid) | Wednesdays 6:00 am CT, for the prior week | Refi demand (prepay signal), purchase demand, contract rates incl. jumbo | [mba.org – Weekly Applications Survey](https://www.mba.org/news-and-research/research-and-economics/single-family-research/weekly-applications-survey) |
| Optimal Blue OBMMI | Daily lock-based indices: 30Y conforming, 15Y conforming, jumbo, FHA, VA, USDA, and conforming by LTV/FICO buckets | Free (on Optimal Blue site and FRED) | Nightly with the prior business day's locks; FRED posts the next morning | Transaction-based rates; jumbo vs conforming; credit-tier spreads | [optimalblue.com – OBMMI](https://www2.optimalblue.com/obmmi); [FRED OBMMI release](https://fred.stlouisfed.org/release?rid=473) |
| Optimal Blue Market Data License | Loan-level lock data, including Non-QM product fields | Paid – Nice to have | Daily | Non-QM/DSCR primary-market rate levels and volumes | [optimalblue.com – Market Analytics](https://www2.optimalblue.com/market-analytics/) |
| Bankrate | Consumer-quoted mortgage rates by product | Free | Daily | Consumer-facing context only | [bankrate.com – Mortgage rates](https://www.bankrate.com/mortgages/mortgage-rates/) |
| Zillow mortgage rates | Consumer-quoted rates from its marketplace | Free | Daily/intraday | Consumer-facing context only | [zillow.com – Mortgage rates](https://www.zillow.com/homeloans/mortgage-rates/) |

Table: Mortgage-rate sources.

**FRED series IDs for mortgage rates (all verified):** MORTGAGE30US and MORTGAGE15US (Freddie PMMS, weekly); OBMMIC30YF (30Y conforming), OBMMIC15YF (15Y conforming), OBMMIJUMBO30YF (30Y jumbo), OBMMIFHA30YF (FHA), OBMMIVA30YF (VA), OBMMIUSDA30YF (USDA), and OBMMIC30YFLVLE80FGE740 (30Y conforming, LTV ≤ 80 and FICO > 740) — all Optimal Blue, daily.

## 3.2 Jumbo, Non-QM, DSCR and RTL rates

There is no free, official daily index for Non-QM, DSCR, or RTL borrower rates. Be explicit with PMs about that, then use the following proxies in this order:

1. **Recent securitization presale reports (best free proxy).** Every rated Non-QM, DSCR, CES, HELOC, and RTL deal comes with a presale or new-issue report (KBRA, Fitch, Moody's, S&P, Morningstar DBRS) that states the pool's weighted-average coupon (WAC), FICO, LTV/CLTV, DSCR, documentation type, and prepayment-penalty share. Comparing the WAC across the last several deals from the same shelf gives a defensible read on where borrower note rates are. Remember that pools are aggregated over prior months, so presale WACs lag the current rate sheet by roughly one to three months.
2. **OBMMI jumbo (FRED OBMMIJUMBO30YF)** for prime jumbo; compare with OBMMIC30YF for the jumbo-conforming differential. The MBA Weekly Applications Survey also reports a jumbo contract rate.
3. **Lender public pricing and marketing pages.** Some Non-QM and DSCR wholesale lenders publish "starting at" rates or sample pricing; most full rate sheets sit behind broker logins. Treat any public number as a marketing floor for the best borrower profile, not a market level. Do not cite a single lender's page as "the market."
4. **Trade press:** Scotsman Guide, National Mortgage Professional (NMP), HousingWire, and National Mortgage News regularly cover Non-QM/DSCR product and pricing trends and lender guideline changes. Useful for color, not for levels.
5. **Paid data:** Optimal Blue Market Data License (includes Non-QM fields), dv01 (loan-level Non-QM performance, including note rates), and broker/dealer color.

For **RTL (fix-and-flip/bridge)**, rates are short-term, often floating or fixed for 12–24 months, and set loan by loan by private lenders. Rated RTL deals (for example Kiavi's LHOME and Toorak's TRK shelves) publish pool coupon and leverage metrics in the rating reports; beyond that, rely on broker color and trade press.

## 3.3 Mortgage-to-10Y spread and the primary-secondary spread

**Mortgage-to-10Y spread (the "headline spread").** This is the spread most PMs mean when they say "mortgage rates versus 10s."

- *Weekly, standard method:* Freddie Mac PMMS 30Y rate minus the average of daily 10Y CMT yields (FRED DGS10) over the same Thursday–Wednesday window the survey covers. Express in basis points. Using only the Thursday 10Y close overstates noise.
- *Daily method:* MND 30Y index minus the 10Y yield at the same afternoon time (MND publishes around 3:00 pm CT; use the 10Y around then, or the Treasury end-of-day par yield and note the timing mismatch). Alternatively use OBMMIC30YF minus the prior day's DGS10, because OBMMI reflects the prior day's locks.
- *In FRED:* build a graph with MORTGAGE30US and DGS10, set the frequency to weekly (ending Thursday), and apply the formula a − b. Say in your answer which method you used.
- *How to interpret:* compare against its own 1-year range and pre-2022 history. A wide spread can reflect elevated rate volatility, wide MBS spreads to Treasuries, or high originator margins; you need the next decomposition to know which.

**Primary-secondary spread.** Mortgage rate (primary) minus the yield on the current-coupon agency MBS (secondary). It captures guarantee fees, servicing strip, and originator profit/capacity. The **secondary spread** is the current-coupon MBS yield minus a Treasury benchmark (commonly the 10Y or a 5Y/10Y blend), which captures MBS spread to Treasuries (driven by vol, demand from banks/Fed/money managers, and supply).

- The current-coupon yield is not published free in a clean daily series. It is available on Bloomberg (ask the desk to confirm the current-coupon index ticker) and in dealer research.
- The Urban Institute's monthly *Housing Finance at a Glance* chartbook charts the primary-secondary spread and is the best free citation.
- Decomposition to use in an answer: *Mortgage rate − 10Y = (Mortgage rate − CC MBS yield) + (CC MBS yield − 10Y)*. "Primary-secondary" plus "secondary spread" equals the headline spread.

# 4. Spreads and MBS pricing

Be candid: there is almost no free, reliable source for live MBS prices or non-agency spreads. Agency TBA prices and non-agency secondary levels are dealer-quoted and platform-traded markets. Free sources give you context and history; live levels come from Bloomberg, trading platforms, and dealer runs.

## 4.1 Agency TBA / UMBS prices, current coupon, OAS

| Source | What you get | Cost | When it updates | Best used for | Link |
|--------------|--------------------|--------|-----------|--------------|--------------|
| Bloomberg Terminal | Live TBA prices by coupon (UMBS, GNMA II), current-coupon yield, OAS via YAS, dollar rolls | Paid – Must-request | Real time | Live TBA levels, CC spread, OAS | [bloomberg.com/professional](https://www.bloomberg.com/professional/) |
| Tradeweb | Electronic TBA and specified-pool trading, Treasuries | Paid (institutional platform access) – Must-request if you will execute | Real time | Execution and live dealer quotes for TBA | [tradeweb.com](https://www.tradeweb.com/) |
| MND MBS dashboard | Free MBS/Treasury overview page (MND has noted periods of free-price outages due to data-provider issues) | Free | Intraday when available | Rough directional read | [mortgagenewsdaily.com/mbs](https://www.mortgagenewsdaily.com/mbs) |
| MBS Live (MND's paid service) | Streaming UMBS/GNMA prices, Treasuries, live commentary for lenders | Paid – Nice to have (cheap; aimed at loan officers) | Real time | Low-cost live TBA screen if no Bloomberg | [mbslive.net](https://www.mbslive.net/) |
| FINRA TRACE – TBA and MBS | Disseminated trade prices for TBA, agency pass-throughs, CMOs | Free (agree to user terms) | Real-time dissemination; aggregate stats end of day | Checking actual trade prints and volumes | [finra.org – Fixed Income Data](https://www.finra.org/finra-data/fixed-income) |
| Dealer research (via brokers) | Daily MBS commentary, CC spread, OAS by coupon, relative value | Free to clients (ask coverage) | Daily/weekly | Levels and narrative | Ask your broker-dealer coverage for distribution lists |
| Urban Institute chartbook | Monthly charts of primary-secondary spread, MBS issuance and holders | Free | Monthly | Free historical citation | [urban.org – Housing Finance at a Glance](https://www.urban.org/tags/housing-finance-glance-monthly-chartbook) |

Table: Agency MBS pricing sources.

FRED does not carry a current-coupon MBS yield or TBA price series, so any free "current coupon" number you find on a third-party site should be checked against Bloomberg or dealer research before you cite it.

## 4.2 Non-agency, Non-QM, jumbo, CES/HELOC spreads

| Source | What you get | Cost | When it updates | Best used for | Link |
|--------------|--------------------|--------|-----------|--------------|--------------|
| Dealer securitized-products research | Weekly spread tables for Non-QM AAA/AA/A/BBB, prime jumbo, CES, HELOC, CRT; new-issue recaps | Free to clients | Weekly (often Friday) | The standard answer to "where are spreads?" | Ask broker-dealer coverage |
| Finsight / CreditFlow | New-issue deal database, pricing (tranche spreads/coupons), roadshow materials; RMBS pipeline views | Free w/ reg (basic); Paid for full data – Must-request | Intraday as deals price | "What did the last deal price at?" | [finsight.com](https://finsight.com/); [creditflowresearch.com](https://creditflowresearch.com/) |
| Asset-Backed Alert (Green Street) | Weekly newsletter on ABS/MBS deal pipeline, pricing, market players; issuance databases | Paid – Nice to have | Weekly + alerts | Pipeline and who's issuing what | [greenstreet.com](https://www.greenstreet.com/) (abalert.com redirects here) |
| Asset Securitization Report (Arizent) | Deal stories with coupons/structure, weekly ABS totals and league tables | Free headlines; Paid full access – Nice to have | Daily | Deal-level color, issuance totals | [asreport.americanbanker.com](https://asreport.americanbanker.com/) |
| Bloomberg (NIM, DES, ALLQ, TRACE data) | New-issue monitor, deal descriptions, dealer quotes, cash flows | Paid – Must-request | Real time | Levels, deal terms, runs | [bloomberg.com/professional](https://www.bloomberg.com/professional/) |
| Intex | Deal cash-flow models for virtually all RMBS/CRT; scenario analysis | Paid – Must-request if you will price bonds | Monthly with remits; new deals as modeled | Yield/spread-at-price, loss scenarios | [intex.com](https://www.intex.com/main/) |
| FINRA TRACE – Securitized products | Disseminated trade data for ABS/MBS/CMO (dissemination rules differ by product) | Free (with user terms) | Per dissemination rules | Verifying that trades happened and approximate levels | [finra.org – Fixed Income Data](https://www.finra.org/finra-data/fixed-income) |
| MarketAxess | Electronic trading platform (mainly corporate bonds; some securitized) | Paid (platform) – Skip unless trading there | Real time | Execution | [marketaxess.com](https://www.marketaxess.com/) |

Table: Non-agency spread sources.

**How to answer "where are Non-QM spreads?" without a terminal.** Pull the last three to five priced Non-QM deals from trade press and rating-agency new-issue reports (Section 5), note the AAA senior coupon and, if reported, the spread; then check at least one dealer weekly for the spread table. Say "AAA Non-QM seniors on deals priced in the past two weeks came at approximately X per [source, date]" rather than quoting one print. Note the benchmark: most Non-QM seniors are fixed-rate and quoted as a spread to the interpolated Treasury (or swaps) at the expected weighted-average life.

## 4.3 CRT (CAS and STACR) spreads

| Source | What you get | Cost | When it updates | Best used for | Link |
|--------------|--------------------|--------|-----------|--------------|--------------|
| Fannie Mae CAS Pricing | Every CAS deal: tranche sizes, spreads over SOFR, CE, ratings | Free | As deals price | New-issue CRT spreads, history | [Fannie Mae – CAS Pricing](https://capitalmarkets.fanniemae.com/credit-risk-transfer/single-family-connecticut-avenue-securities/cas-pricing) |
| Fannie Mae CRT home | CAS/CIRT issuance calendar, deal documents, disclosure data | Free (some data free w/ reg) | Ongoing | Calendar and documents | [capitalmarkets.fanniemae.com – CRT](https://capitalmarkets.fanniemae.com/credit-risk-transfer) |
| Freddie Mac STACR Pricing | Every STACR deal: tranche sizes, spreads, CE, ratings | Free | As deals price | New-issue CRT spreads, history | [Freddie Mac – STACR Pricing](https://capitalmarkets.freddiemac.com/crt/securities/pricing) |
| Freddie Mac CRT home | STACR/ACIS calendars, pipeline report, deal docs, tender offers, call notices | Free | Ongoing | Calendar, calls, tenders | [capitalmarkets.freddiemac.com/crt](https://capitalmarkets.freddiemac.com/crt) |
| Dealer CRT research | Secondary spreads by tranche/vintage, relative value | Free to clients | Weekly | Secondary CRT levels | Ask broker-dealer coverage |

Table: CRT spread sources.

## 4.4 Broad credit-spread context (FRED, ICE BofA indices)

When a PM asks whether mortgage credit is "cheap," the first comparison is corporate credit. These FRED series are verified: **BAMLH0A0HYM2** (ICE BofA US High Yield OAS), **BAMLC0A0CM** (ICE BofA US Corporate/IG OAS), **BAMLC0A4CBBB** (ICE BofA BBB OAS), and **BAMLH0A3HYC** (ICE BofA CCC & Lower OAS). They update daily with a one-business-day lag. ICE licensing may limit how much history FRED displays, so download what you need. Link: [fred.stlouisfed.org/series/BAMLH0A0HYM2](https://fred.stlouisfed.org/series/BAMLH0A0HYM2).

# 5. Deal flow and new issue

## 5.1 Where new deals show up (roughly in order of timing)

1. **Dealer calendars and Bloomberg NIM** (paid/client) as deals are announced and marketed.
2. **Rating-agency presale reports** as the deal launches. Most agencies publish a free press release; full presales usually require free registration (KBRA, Fitch, Morningstar DBRS) and some are subscriber-only (Moody's, S&P). Presales are the best free source of collateral and structure detail.
3. **Finsight/CreditFlow** and **Asset-Backed Alert** for pipeline and pricing.
4. **Trade press** (ASR, HousingWire, IFR, Inside Nonconforming Markets) once priced.
5. **SEC EDGAR**: ABS-15G filings (third-party due-diligence reports and repurchase reports) are often filed around the time of issuance even for 144A deals, and public (registered) shelves file prospectuses and 8-Ks.
6. **Issuer press releases** (Business Wire, PR Newswire, GlobeNewswire) and quarterly earnings materials for public issuers (e.g., Annaly, Rithm, Redwood, Angel Oak Mortgage REIT, MFA, Ellington).

| Source | What you get | Cost | When it updates | Best used for | Link |
|--------------|--------------------|--------|-----------|--------------|--------------|
| KBRA | Presales, new-issue reports, surveillance actions and research for Non-QM, prime, CES, HELOC, RTL | Free w/ reg (reports); KBRA Premium analytics Paid | As deals launch/price | Collateral and structure detail, CE levels | [kbra.com – RMBS transactions](https://www.kbra.com/sectors/rmbs/transactions) |
| Fitch Ratings | Presales, new-issue reports, RMBS research and performance commentary | Free w/ reg (many reports); some Paid | As deals launch | Presales; sector research | [fitchratings.com – RMBS](https://www.fitchratings.com/structured-finance/rmbs) |
| Morningstar DBRS | Presales, provisional/final rating press releases, rating reports | Free w/ reg | As deals launch | Presales (very active in Non-QM, RTL, HELOC) | [dbrs.morningstar.com](https://dbrs.morningstar.com/) |
| Moody's Ratings | Pre-sale reports, rating actions | Press releases free; research mostly Paid – Nice to have | As deals launch | Rating actions | [moodys.com](https://www.moodys.com/) |
| S&P Global Ratings | Presales, rating actions, sector research | Press releases free w/ reg; research mostly Paid – Nice to have | As deals launch | Rating actions | [spglobal.com/ratings](https://www.spglobal.com/ratings/en/) |
| Finsight / CreditFlow | New-issue calendar, deal database, pricing, roadshows | Free w/ reg (basic); Paid full | Intraday | Pricing and calendar | [finsight.com](https://finsight.com/) |
| Asset-Backed Alert | Weekly pipeline scoops and issuance stats | Paid – Nice to have | Weekly | Early pipeline intelligence | [greenstreet.com](https://www.greenstreet.com/) |
| Asset Securitization Report | Priced-deal stories, weekly issuance totals, league tables | Free headlines / Paid | Daily | Priced-deal recaps | [asreport.americanbanker.com](https://asreport.americanbanker.com/) |
| Inside Mortgage Finance – Inside Nonconforming Markets | Biweekly newsletter on non-agency: jumbo, Non-QM, seconds, securitization, rankings | Paid – Nice to have | Biweekly | Issuance rankings and market share | [insidemortgagefinance.com – INM](https://www.insidemortgagefinance.com/topics/677-inside-nonconforming-markets) |
| SEC EDGAR full-text search | ABS-15G, prospectuses, 8-Ks, 10-D distribution reports (public deals) | Free | Continuous | Primary documents; due-diligence results | [sec.gov/edgar/search](https://www.sec.gov/edgar/search/) |
| Business Wire / PR Newswire / GlobeNewswire | Rating-agency and issuer press releases | Free | Continuous | Fast deal announcements (KBRA releases run on Business Wire) | [businesswire.com](https://www.businesswire.com/); [prnewswire.com](https://www.prnewswire.com/); [globenewswire.com](https://www.globenewswire.com/) |
| Bloomberg NIM / NI screens | New-issue monitor, deal news | Paid – Must-request | Real time | Live pipeline | [bloomberg.com/professional](https://www.bloomberg.com/professional/) |

Table: New-issue and deal-flow sources.

**EDGAR tip:** in full-text search, type the shelf name in quotes (for example "Verus Securitization Trust") and filter the form type to ABS-15G. The due-diligence reports (often from AMC, Clayton, Consolidated Analytics, Evolve, etc.) summarize loan-level grades and data-integrity findings for the pool.

## 5.2 Shelf names by issuer (verified against 2025–2026 rating-agency or press materials)

| Sector | Shelf / Bloomberg-style ticker | Issuer / sponsor | Notes |
|------------|-----------------|---------------------|----------------------|
| Non-QM | VERUS (Verus Securitization Trust) | Invictus Capital Partners, via Verus Mortgage Capital | One of the largest Non-QM programs |
| Non-QM / prime / CES | OBX (OBX Trust) | Onslow Bay Financial (Annaly) | Multiple series incl. Non-QM and expanded prime |
| Non-QM | AOMT (Angel Oak Mortgage Trust) | Angel Oak | Also HB (home equity) series |
| Non-QM | CROSS (CROSS Mortgage Trust) | Hildene Capital Management, affiliated with CrossCountry Mortgage | Frequent issuer |
| Non-QM | COLT (COLT Mortgage Loan Trust) | Lone Star Residential | Not Ellington; see EFMT below |
| Non-QM | EFMT | Ellington Financial | Ellington's own Non-QM shelf |
| Non-QM | NRMLT (New Residential Mortgage Loan Trust) | Rithm Capital (serviced by Newrez) | Rithm also issues other series |
| Non-QM / RPL | PRPM | Pretium (PRP) | NQM and re-performing (RCF) series |
| Non-QM | GCAT | GCAT depositor entities (Blue River Mortgage sponsored earlier series) | NQM and INV series; confirm current sponsor on the report |
| Non-QM | MFA (MFA 20XX-NQM) | MFA Financial | Ticker is "MFA," not "MFRA" |
| Non-QM / CES / RPL | BRAVO (BRAVO Residential Funding Trust) | PIMCO affiliates (Loan Funding Structure entities) | Includes CES series |
| Prime jumbo | SEMT (Sequoia Mortgage Trust) | Redwood Trust | Also HYB (hybrid ARM) series |
| Prime jumbo | JPMMT (J.P. Morgan Mortgage Trust) | J.P. Morgan | Prime, HYB and other series |
| Agency-eligible / prime | CHASE (e.g., CHASE 20XX-AGY) | JPMorgan Chase | Agency-eligible investor loans |
| Closed-end seconds | RCKT (RCKT Mortgage Trust 20XX-CES) | Rocket Mortgage affiliate | Large CES program |
| HELOC / seconds | FIGRE (FIGRE Trust) | Figure | HE (HELOC), FL and other series |
| RTL (fix-and-flip) | LHOME (LHOME Mortgage Trust) | Kiavi | Revolving RTL structures |
| RTL | TRK (Toorak Mortgage Trust) | Toorak Capital Partners | Rated RRTL series |
| CRT | CAS (Connecticut Avenue Securities) | Fannie Mae | Floats over 30-day average SOFR |
| CRT | STACR (Structured Agency Credit Risk) | Freddie Mac | Floats over 30-day average SOFR; DNA/HQA series |

Table: Common shelves. Shelf naming conventions change; confirm the exact series on the rating-agency report.

Other shelves you will hear about (not individually verified for this guide, confirm on the rating report): Towd Point (TPMT), Starwood (STAR), Deephaven (DRMT), Citigroup (CMLTI), Mill City, and various HELOC/CES programs from bank and non-bank originators.

# 6. Credit performance and surveillance

Separate the question first: is the PM asking about **the whole mortgage market** (agency-dominated, answered by ICE, MBA, NY Fed), **non-agency collateral** (Non-QM, DSCR, jumbo, CES/HELOC, RTL; answered by rating agencies and loan-level data vendors), or **a specific bond** (answered by the trustee remittance report and Intex/Bloomberg)?

## 6.1 Market-wide mortgage credit

| Source | What you get | Cost | When it updates | Best used for | Link |
|--------------|--------------------|--------|-----------|--------------|--------------|
| ICE First Look | National delinquency, serious DQ, foreclosure starts/inventory, prepayment SMM, by product and state | Free | Monthly, typically in the fourth week of the following month | First read on monthly mortgage performance and prepays | [mortgagetech.ice.com – Data reports](https://mortgagetech.ice.com/resources/data-reports) |
| ICE Mortgage Monitor | Deep-dive on performance, equity, home prices (ICE HPI), insurance/escrow, originations | Free | Monthly, typically early in the month | Charts for PM decks; tappable equity (HELOC/CES theme) | [mortgagetech.ice.com – Data reports](https://mortgagetech.ice.com/resources/data-reports) |
| MBA National Delinquency Survey | DQ and foreclosure rates by loan type (conventional, FHA, VA) and state | Free summary; full data Paid | Quarterly, several weeks after quarter-end | Official-style quarterly DQ citation | [mba.org – NDS](https://www.mba.org/news-and-research/research-and-economics/single-family-research/national-delinquency-survey) |
| NY Fed Household Debt and Credit Report | Mortgage and HELOC balances, originations by credit score, transition into delinquency, foreclosures | Free | Quarterly | Consumer-credit health; HELOC balance trends | [newyorkfed.org – HHDC](https://www.newyorkfed.org/microeconomics/hhdc) |
| FRED – Fed delinquency rate | DRSFRMACBS (single-family residential mortgage DQ at commercial banks); DRCLACBS (consumer loans) | Free | Quarterly | Long bank-portfolio history | [fred.stlouisfed.org/series/DRSFRMACBS](https://fred.stlouisfed.org/series/DRSFRMACBS) |
| FHFA National Mortgage Database | Aggregate statistics on outstanding residential mortgages, performance | Free | Quarterly | Official aggregate performance | [fhfa.gov – NMDB statistics](https://www.fhfa.gov/data/dashboard/nmdb-outstanding-residential-mortgage-statistics) |
| Fannie Mae / Freddie Mac loan-level performance data | Loan-level acquisition and performance history for the GSE books (CRT reference pools) | Free w/ reg | Quarterly | CRT credit analysis; building your own curves | [Fannie Mae loan performance data](https://capitalmarkets.fanniemae.com/credit-risk-transfer/fannie-mae-single-family-loan-performance-data); [Freddie Mac SF loan-level dataset](https://www.freddiemac.com/research/datasets/sf-loanlevel-dataset) |
| Fannie Mae Data Dynamics | Web tool for GSE loan performance, CRT deal performance, MBS disclosures | Free w/ reg | Monthly (per data refresh calendar) | CAS deal-level performance checks | [Fannie Mae – Data Dynamics](https://capitalmarkets.fanniemae.com/tools-applications/data-dynamics) |
| Freddie Mac CRT (Clarity) | STACR/ACIS deal and loan-level disclosures | Free w/ reg | Monthly | STACR deal performance | [capitalmarkets.freddiemac.com/crt](https://capitalmarkets.freddiemac.com/crt) |

Table: Market-wide mortgage credit sources.

## 6.2 Non-agency collateral (Non-QM, DSCR, jumbo, CES/HELOC, RTL)

| Source | What you get | Cost | When it updates | Best used for | Link |
|--------------|--------------------|--------|-----------|--------------|--------------|
| KBRA research and surveillance | Non-QM default studies, redemption/call research, surveillance rating actions; KBRA Premium RMBS credit indices (DQ, mods, prepays) | Free w/ reg (research); Premium Paid – Nice to have | Periodic research; monthly indices (Premium) | Non-QM/DSCR performance narratives; call economics | [kbra.com](https://www.kbra.com/); [KBRA Premium – RMBS](https://www.kbra.com/analytics/products/premium/rmbs) |
| Fitch Ratings RMBS research | Sector outlooks, performance commentary, rating actions | Free w/ reg (many) | Periodic | Sector view, rating trends | [fitchratings.com – RMBS](https://www.fitchratings.com/structured-finance/rmbs) |
| Morningstar DBRS | Surveillance actions and performance commentary on Non-QM, RTL, HELOC shelves | Free w/ reg | Periodic | RTL/HELOC surveillance | [dbrs.morningstar.com](https://dbrs.morningstar.com/) |
| Moody's / S&P | Surveillance and sector research | Mostly Paid – Nice to have | Periodic | Ratings-driven context | [moodys.com](https://www.moodys.com/); [spglobal.com/ratings](https://www.spglobal.com/ratings/en/) |
| dv01 | Loan-level performance for Non-QM, prime jumbo, CES, HELOC and other consumer assets; Fitch-dv01 non-agency RMBS benchmarks; tape cracking | Paid – Must-request | Monthly (with servicer/trustee data) | The best standardized view of Non-QM/DSCR performance by shelf, vintage, doc type | [dv01.co](https://www.dv01.co/) |
| Intex | Deal-level collateral performance and waterfall; bond-level projections | Paid – Must-request | Monthly with remits | Bond-level surveillance and triggers | [intex.com](https://www.intex.com/main/) |
| Cotality (formerly CoreLogic) | Private-label securities loan-level data (legacy CoreLogic LoanPerformance), HPI, property data | Paid – Nice to have | Monthly | Non-agency loan-level history; property analytics | [cotality.com](https://www.cotality.com/) |
| ICE McDash (servicing data) | Loan-level servicing performance across agency and non-agency | Paid – Skip for temporary coverage (enterprise license) | Monthly | Market-wide loan-level analysis | [ice.com – mortgage data](https://www.ice.com/fixed-income-data-services/mortgage-data-solutions/mortgage-backed-securities-data) |
| Scotsman Guide / HousingWire / ASR | Articles summarizing agency reports on Non-QM/DSCR performance | Free (ASR partially Paid) | Ongoing | Quick narrative citations | [scotsmanguide.com](https://www.scotsmanguide.com/); [housingwire.com](https://www.housingwire.com/) |

Table: Non-agency performance sources.

**Metrics to have ready for "how is DSCR credit performing?"** 60+ day delinquency (including foreclosure and REO) as a percent of current balance, by vintage and shelf; the trend over the last three to six months; cumulative loss (usually still small for recent vintages, so look at DQ and roll rates); modification and forbearance rates; and, for DSCR specifically, performance split by DSCR bucket (for example below 1.0x versus 1.0x+), property type (1–4 unit, condo, short-term rental), and loan purpose (cash-out refi versus purchase). Rating-agency reports and dv01 are where these splits live.

## 6.3 Bond-specific surveillance: trustee remittance reports

Non-agency RMBS pay monthly on a distribution date set in the deal documents (commonly around the 25th, but check each deal). Before each distribution date the trustee, paying agent, or securities administrator posts a **remittance (distribution) report** with collections, principal and interest by class, delinquencies, losses, modifications, trigger tests, and bond factors.

- **Where:** the investor-reporting portals of the trustee or securities administrator named in the offering document. Common names in RMBS include U.S. Bank, Computershare (which acquired Wells Fargo's corporate trust business), Wilmington Trust, Citibank, Deutsche Bank, and BNY. Portals generally require registration and confirmation that you are an investor in the deal.
- **Public deals:** registered (public) deals also file distribution reports on Form 10-D with the SEC, searchable on EDGAR.
- **CRT:** Fannie Mae (Data Dynamics) and Freddie Mac (Clarity) post monthly deal and loan-level disclosures.
- **Aggregated:** Intex and Bloomberg load remittance data into their models shortly after posting; dv01 standardizes across shelves.

# 7. Prepayments

"What's the prepay outlook?" has two parts: **what speeds just did** (last factor/CPR release) and **what drives the next few months** (refi incentive, turnover/housing activity, seasonality, and day count).

| Source | What you get | Cost | When it updates | Best used for | Link |
|--------------|--------------------|--------|-----------|--------------|--------------|
| Fannie Mae MBS disclosures / Data Dynamics prepayment snapshot | Monthly prepayment data (CPR) by cohort; pool and loan-level disclosure files (PoolTalk) | Free w/ reg | Monthly on business day 4 (factor date) | Agency speeds on "CPR day" | [Fannie Mae – MBS](https://capitalmarkets.fanniemae.com/mortgage-backed-securities); [Data Dynamics](https://capitalmarkets.fanniemae.com/tools-applications/data-dynamics) |
| Fannie Mae daily (intra-month) prepayment report | Cohort-level cumulative full-voluntary prepayments during the month | Free w/ reg (PoolTalk) | Weekly, Wednesdays about 3:30 pm CT | Previewing the next monthly print | [Fannie Mae – MBS](https://capitalmarkets.fanniemae.com/mortgage-backed-securities) |
| Freddie Mac daily prepayment report | Cumulative daily SMM/CPR for select cohorts | Free w/ reg | Updated weekly | Previewing the next monthly print | [Freddie Mac – Daily Prepayment Report](https://capitalmarkets.freddiemac.com/mbs/daily-prepayment-report) |
| Freddie Mac MBS disclosures | Monthly pool/loan-level disclosure data | Free w/ reg | Monthly (factor date) | Agency speeds | [capitalmarkets.freddiemac.com/mbs](https://capitalmarkets.freddiemac.com/mbs) |
| Ginnie Mae disclosure data | Pool/loan-level disclosures for GNMA MBS (FHA/VA speeds, buyouts) | Free | Monthly (after conventional factors) | FHA/VA speeds, buyout activity | [ginniemae.gov](https://www.ginniemae.gov/) |
| ICE First Look | National SMM and prepay trend for all loans | Free | Monthly (fourth week of following month) | Market-wide prepay trend in one number | [mortgagetech.ice.com – Data reports](https://mortgagetech.ice.com/resources/data-reports) |
| MBA Refinance Index (Weekly Applications Survey) | Weekly refi application index and refi share | Free headline | Wednesdays 6:00 am CT | Leading indicator for refi-driven speeds (lead of roughly one to two months to prints) | [mba.org – Weekly Applications Survey](https://www.mba.org/news-and-research/research-and-economics/single-family-research/weekly-applications-survey) |
| ICE eMBS | Pre-calculated agency prepayment data, aggregations, pool/loan-level history | Paid – Nice to have (Must-request if agency pools are a focus) | Monthly + intra-month | Standard agency prepay database | [embs.ice.com](https://embs.ice.com/) |
| Recursion | Loan-level agency analytics (Cohort Analyzer), prepay/DQ/S-curves; blog with occasional free analysis | Paid (analytics); blog Free | Daily data updates for clients | Custom agency cohort analysis | [recursionco.com](https://www.recursionco.com/) |
| Dealer prepay research | CPR-day recaps, prepay projections by coupon/vintage, model updates | Free to clients | Monthly (around factor dates) + weekly | The consensus prepay outlook | Ask broker-dealer coverage |
| Bloomberg | Pool and cohort speeds, prepay projections (e.g., in YAS/deal screens) | Paid – Must-request | Monthly / real time | Bond-specific speeds | [bloomberg.com/professional](https://www.bloomberg.com/professional/) |
| dv01 / Intex / remit reports | Non-agency voluntary prepay (CRR/CPR) by deal | Paid (dv01, Intex); remits free to investors | Monthly | Non-QM/jumbo/CES speeds | [dv01.co](https://www.dv01.co/); [intex.com](https://www.intex.com/main/) |

Table: Prepayment sources.

**Framework for "what's the prepay outlook?"**

1. *Last print:* quote the latest monthly CPR for the relevant cohort (agency from GSE disclosures or dealer CPR-day notes; non-agency from dv01/Intex/remits) and ICE's national SMM.
2. *Refi incentive:* compare the current mortgage rate (MND/OBMMI) with the WAC of the pool or deal. Loans roughly 50 bp or more in the money are the usual reference point for meaningful refi incentive; state the assumption you use.
3. *Leading indicators:* MBA Refi Index trend over the last four weeks, Fannie/Freddie intra-month daily prepay reports.
4. *Turnover:* existing home sales and pending home sales (Section 8); seasonality (spring/summer faster, winter slower); day count in the month.
5. *Non-agency specifics:* prepayment penalties (common in DSCR), borrower refinance ability (Non-QM credit cure can raise speeds), call rights (Non-QM deals are often callable after a few years and redemption economics depend on spread levels; KBRA publishes research on Non-QM redemptions).

# 8. Housing and macro fundamentals

Home prices drive loss severity and CLTV (key for CES/HELOC and RTL exit values); rents drive DSCR coverage; sales volume drives turnover prepayments; and the macro calendar drives rates.

## 8.1 Home prices

| Source | What you get | Cost | When it updates | Best used for | Link |
|--------------|--------------------|--------|-----------|--------------|--------------|
| S&P Cotality Case-Shiller (renamed from S&P CoreLogic Case-Shiller in March 2025) | National, 10-/20-city composites and metro repeat-sales indices, SA and NSA | Free | Last Tuesday of the month, 8:00 am CT; about a two-month lag | The most-quoted HPA number; metro detail | [spglobal.com – S&P Dow Jones Indices](https://www.spglobal.com/spdji/en/); FRED CSUSHPINSA / CSUSHPISA |
| FHFA House Price Index | Purchase-only and all-transactions HPI; national, census division, state, metro | Free | Monthly purchase-only index typically released with Case-Shiller at 8:00 am CT; quarterly detail | Conforming-loan HPA; state/metro | [fhfa.gov – HPI](https://www.fhfa.gov/data/hpi); FRED HPIPONM226S, USSTHPI |
| ICE Home Price Index | Monthly HPA in the Mortgage Monitor | Free (report) / Paid (data) | Monthly | Timelier HPA read | [mortgagetech.ice.com – Data reports](https://mortgagetech.ice.com/resources/data-reports) |
| Cotality HPI and insights | HPI and forecast commentary | Free commentary; data Paid | Monthly | Forecasted HPA context | [cotality.com/insights](https://www.cotality.com/insights) |
| Zillow Research data | ZHVI (home values), ZORI (rents), inventory, forecasts | Free | Monthly | Metro-level values and rents | [zillow.com/research/data](https://www.zillow.com/research/data/) |

Table: Home price sources.

## 8.2 Sales, construction, inventory, rents

| Source | What you get | Cost | When it updates | Best used for | Link |
|--------------|--------------------|--------|-----------|--------------|--------------|
| NAR Existing-Home Sales | SAAR sales, median price, inventory, months' supply | Free headline | Monthly, 9:00 am CT, around the fourth week | Turnover (prepay) and price context | [nar.realtor – Existing-Home Sales](https://www.nar.realtor/research-and-statistics/housing-statistics/existing-home-sales) |
| NAR Pending Home Sales | Contract signings index (leads existing sales) | Free headline | Monthly, 9:00 am CT | Leading indicator for turnover | [nar.realtor – Pending Home Sales](https://www.nar.realtor/research-and-statistics/housing-statistics/pending-home-sales) |
| Census New Residential Sales | New home sales, months' supply, median price | Free | Monthly, 9:00 am CT | Builder activity | [census.gov – New Residential Sales](https://www.census.gov/construction/nrs/index.html) |
| Census New Residential Construction | Housing starts, permits, completions | Free | Monthly, 7:30 am CT | Supply pipeline | [census.gov – New Residential Construction](https://www.census.gov/construction/nrc/index.html) |
| Census economic indicator calendar | Release dates for Census indicators | Free | Annual schedule | Planning | [census.gov – Economic Indicators](https://www.census.gov/economic-indicators/) |
| NAHB/Wells Fargo Housing Market Index | Builder sentiment | Free | Monthly, 9:00 am CT, mid-month | Builder demand read | [nahb.org – HMI](https://www.nahb.org/news-and-economics/housing-economics/indices/housing-market-index) |
| Realtor.com Research data | Active listings, new listings, days on market, price cuts by metro | Free | Weekly and monthly | Inventory questions | [realtor.com/research/data](https://www.realtor.com/research/data/); FRED ACTLISCOUUS, MEDLISPRIUS |
| Redfin Data Center | Sales, inventory, price, supply/demand by metro | Free | Weekly and monthly | Timely metro detail | [redfin.com – Data Center](https://www.redfin.com/news/data-center/) |
| Apartment List national rent data | Rent index and vacancy index | Free | Monthly | DSCR rent-growth context | [apartmentlist.com – National rent data](https://www.apartmentlist.com/research/national-rent-data) |
| Census rental vacancy (FRED) | RRVRUSQ156N rental vacancy rate | Free | Quarterly | Rental-market slack | [fred.stlouisfed.org/series/RRVRUSQ156N](https://fred.stlouisfed.org/series/RRVRUSQ156N) |

Table: Housing activity and rent sources.

## 8.3 Forecasts and credit availability

| Source | What you get | Cost | When it updates | Best used for | Link |
|--------------|--------------------|--------|-----------|--------------|--------------|
| Fannie Mae ESR Economic and Housing forecast | Rates, home sales, HPA, originations (purchase/refi) | Free | Monthly | Consensus-style housing forecast | [fanniemae.com – Forecast](https://www.fanniemae.com/data-and-insights/forecast) |
| MBA Economic and Mortgage Finance Forecasts | Originations, rates, housing starts, macro | Free PDFs (subscription for full archive) | Monthly | Origination volume outlook | [mba.org – Forecasts and Commentary](https://www.mba.org/forecasts-and-commentary) |
| Freddie Mac Research | Outlooks, research notes, PMMS commentary | Free | Periodic | GSE view | [freddiemac.com/research](https://www.freddiemac.com/research) |
| MBA Mortgage Credit Availability Index | Index of credit availability, split conventional/government/jumbo/conforming | Free headline | Monthly | "Is credit loosening or tightening?" | [mba.org – MCAI](https://www.mba.org/news-and-research/research-and-economics/single-family-research/mortgage-credit-availability-index-x241340) |
| Fed Senior Loan Officer Survey (SLOOS) | Bank standards and demand for residential mortgages, HELOCs | Free | Quarterly | Bank credit supply | [federalreserve.gov – SLOOS](https://www.federalreserve.gov/data/sloos.htm) |

Table: Forecasts and credit-availability sources.

## 8.4 Economic calendar (release times in CT)

| Release | Agency | Typical timing (CT) | Why it matters for mortgages | Link |
|----------------|------------|------------------|--------------------|--------------|
| Employment Situation (payrolls, unemployment) | BLS | First Friday of month (usually), 7:30 am | Biggest regular rates mover | [bls.gov – release schedule](https://www.bls.gov/schedule/news_release/current_year.asp) |
| CPI | BLS | Mid-month, 7:30 am | Inflation → Fed path → rates | [bls.gov – release schedule](https://www.bls.gov/schedule/news_release/current_year.asp) |
| PPI | BLS | Mid-month, 7:30 am | Inflation pipeline | [bls.gov – release schedule](https://www.bls.gov/schedule/news_release/current_year.asp) |
| JOLTS | BLS | Early month, 9:00 am | Labor demand | [bls.gov – release schedule](https://www.bls.gov/schedule/news_release/current_year.asp) |
| Initial jobless claims | Dept. of Labor | Thursdays, 7:30 am | Weekly labor read | [dol.gov](https://www.dol.gov/); FRED ICSA |
| GDP; Personal Income & Outlays (PCE inflation) | BEA | Late month, 7:30 am | Fed's preferred inflation gauge | [bea.gov – release schedule](https://www.bea.gov/news/schedule) |
| ISM Manufacturing / Services PMI | ISM | 1st / 3rd business day, 9:00 am | Growth momentum | [ismworld.org](https://www.ismworld.org/) |
| Consumer sentiment (prelim/final) | Univ. of Michigan | Fridays mid/late month, 9:00 am | Inflation expectations | [sca.isr.umich.edu](https://www.sca.isr.umich.edu/) |
| Consumer confidence | Conference Board | Last Tuesday, 9:00 am | Consumer health | [conference-board.org – Consumer Confidence](https://www.conference-board.org/topics/consumer-confidence/) |
| FOMC decision / press conference | Federal Reserve | 1:00 pm / 1:30 pm on decision day | Front-end and curve | [federalreserve.gov – FOMC calendars](https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm) |
| Fed H.8 (bank assets incl. MBS holdings) | Federal Reserve | Fridays, 3:15 pm | Bank demand for MBS | [federalreserve.gov – H.8](https://www.federalreserve.gov/releases/h8/current/default.htm) |
| Treasury coupon auctions | Treasury | Results around 12:00 pm on auction days | Supply; 10Y/30Y auctions move MBS | [treasurydirect.gov – Upcoming auctions](https://www.treasurydirect.gov/auctions/upcoming/) |

Table: Key macro releases. Always confirm dates on the agency's own calendar; holidays and government shutdowns shift schedules.

# 9. Industry news and market color

| Source | What you get | Cost | When it updates | Best used for | Link |
|--------------|--------------------|--------|-----------|--------------|--------------|
| HousingWire | Mortgage industry news, data stories (ICE, MBA, Freddie), lender and capital-markets coverage | Free (some premium) | Daily | Fast industry news | [housingwire.com](https://www.housingwire.com/) |
| National Mortgage News (Arizent) | Mortgage industry and secondary-market news | Free headlines; Paid full | Daily | Secondary-market stories | [nationalmortgagenews.com](https://www.nationalmortgagenews.com/) |
| National Mortgage Professional (NMP) | Originator-focused news, Non-QM product coverage | Free | Daily | Non-QM/DSCR product trends | [nationalmortgageprofessional.com](https://nationalmortgageprofessional.com/) |
| Scotsman Guide | Residential and commercial originator news and data features, Non-QM coverage | Free | Daily/monthly | Non-QM lender landscape | [scotsmanguide.com](https://www.scotsmanguide.com/) |
| Mortgage News Daily | Daily rate index, MBS commentary, market recaps | Free (MBS Live Paid) | Daily | Daily rate/MBS narrative | [mortgagenewsdaily.com](https://www.mortgagenewsdaily.com/) |
| Inside Mortgage Finance | Origination/servicing/MBS rankings; newsletters incl. Inside Nonconforming Markets and Inside MBS & ABS | Paid – Nice to have | Weekly/biweekly | Market-share and volume data | [insidemortgagefinance.com](https://www.insidemortgagefinance.com/) |
| Asset Securitization Report | Securitization deals, issuance totals, league tables | Free headlines / Paid | Daily | Deal recaps | [asreport.americanbanker.com](https://asreport.americanbanker.com/) |
| American Banker | Banking and policy news (bank mortgage appetite, regulation) | Paid (limited free) | Daily | Bank/regulatory angle | [americanbanker.com](https://www.americanbanker.com/) |
| Asset-Backed Alert (Green Street) | Structured-finance pipeline and market intel | Paid – Nice to have | Weekly | Pipeline intel | [greenstreet.com](https://www.greenstreet.com/) |
| Bloomberg News | Markets, Fed, securitization reporting | Paid (terminal or bloomberg.com subscription) | Real time | Breaking market news | [bloomberg.com](https://www.bloomberg.com/) |
| Wall Street Journal | Markets, economy; Nick Timiraos on the Fed | Paid | Daily | Fed and macro narrative | [wsj.com](https://www.wsj.com/) |
| Axios Markets | Short daily markets newsletter | Free | Daily | Quick morning context | [axios.com – Axios Markets](https://www.axios.com/newsletters/axios-markets) |
| The Daily Upside | Business/markets newsletter | Free | Daily | Light morning context | [thedailyupside.com](https://www.thedailyupside.com/) |
| Urban Institute – Housing Finance at a Glance | Monthly chartbook: market size, originations, primary-secondary spread, credit availability, performance, GSE and Ginnie data | Free | Monthly (typically month-end) | Best free chart pack for PM decks | [urban.org – chartbook series](https://www.urban.org/tags/housing-finance-glance-monthly-chartbook) |
| SIFMA Research – statistics | MBS and ABS issuance, trading volume, outstanding | Free | Monthly/quarterly | Issuance and volume citations | [SIFMA – US MBS statistics](https://www.sifma.org/research/statistics/us-mortgage-backed-securities-statistics); [SIFMA – US ABS statistics](https://www.sifma.org/research/statistics/us-asset-backed-securities-statistics) |
| Structured Finance Association | Industry policy positions, conferences (e.g., SFVegas) | Free (membership for some content) | Periodic | Policy and industry events | [structuredfinance.org](https://structuredfinance.org/) |
| Apollo – The Daily Spark (Torsten Slok) | Daily macro chart with commentary | Free | Daily | One-chart macro talking points | [apollo.com – The Daily Spark](https://www.apollo.com/wealth/insights-news/insights/daily-spark) |
| Dealer research (via brokers) | Securitized products weeklies, MBS dailies, prepay and credit research, outlooks | Free to clients | Daily/weekly | Levels, relative value, consensus | Ask each broker-dealer coverage contact to add you to distribution |

Table: News, color and research sources.

**Getting dealer research while covering.** Ask each broker-dealer's securitized-products salesperson to add you to (1) the daily MBS/rates commentary, (2) the weekly securitized-products or non-agency spreads report, (3) CPR-day and prepay research, and (4) new-issue alerts for Non-QM, jumbo, CES/HELOC, RTL and CRT. Also ask for access to their research portal. Firm compliance may require that research access be provisioned through approved channels, so check before signing up.

# 10. Regulatory and policy

| Source | What you get | Cost | When it updates | Best used for | Link |
|--------------|--------------------|--------|-----------|--------------|--------------|
| FHFA | GSE policy, conforming loan limits, HPI, g-fee and capital rules, news releases | Free | Ongoing; loan limits announced annually (late in the year) | Anything touching the GSEs | [fhfa.gov](https://www.fhfa.gov/); [news](https://www.fhfa.gov/news) |
| FHFA conforming loan limits | Baseline and high-cost area limits by county | Free | Annually | Jumbo vs conforming boundary | [fhfa.gov – Conforming Loan Limit](https://www.fhfa.gov/data/conforming-loan-limit) |
| CFPB – ATR/QM | Ability-to-Repay/Qualified Mortgage rule resources | Free | As amended | The line between QM and Non-QM | [consumerfinance.gov – ATR/QM](https://www.consumerfinance.gov/compliance/compliance-resources/mortgage-resources/ability-repay-qualified-mortgage-rule/) |
| Regulation Z §1026.43 | Text of the ATR/QM requirements | Free | As amended | Citing the rule itself | [consumerfinance.gov – 12 CFR 1026.43](https://www.consumerfinance.gov/rules-policy/regulations/1026/43/) |
| HMDA data (CFPB/FFIEC) | Loan-level origination data (annual), incl. non-QM-type characteristics | Free | Annually (plus quarterly for large filers) | Origination market share, lender landscape | [consumerfinance.gov – HMDA](https://www.consumerfinance.gov/data-research/hmda/); [ffiec.cfpb.gov](https://ffiec.cfpb.gov/) |
| Fannie Mae seller communications | Selling Guide announcements, lender letters | Free | Ongoing | LLPA, eligibility and policy changes | [Fannie Mae – Selling Policy Communications](https://singlefamily.fanniemae.com/selling-policy-communications); [Selling Guide](https://selling-guide.fanniemae.com/) |
| Freddie Mac Single-Family Guide | Guide bulletins and seller/servicer updates | Free | Ongoing | Freddie policy changes | [guide.freddiemac.com](https://guide.freddiemac.com/); [sf.freddiemac.com](https://sf.freddiemac.com/) |
| Ginnie Mae | APMs (policy memos), MBS program data | Free | Ongoing | Government-loan policy | [ginniemae.gov](https://www.ginniemae.gov/) |
| Federal Reserve H.15 / H.8 | Selected interest rates; bank balance sheets including MBS | Free | H.15 daily; H.8 weekly (Fridays) | Official rates; bank MBS demand | [H.15](https://www.federalreserve.gov/releases/h15/); [H.8](https://www.federalreserve.gov/releases/h8/current/default.htm) |
| SEC EDGAR | Shelf registrations, Reg AB filings, ABS-15G | Free | Continuous | Securitization disclosure | [sec.gov/edgar/search](https://www.sec.gov/edgar/search/) |

Table: Regulatory and policy sources.

# 11. Paid access: what to request from the firm

## 11.1 Ranked shortlist

Ranked for someone temporarily covering a residential whole-loan/RMBS seat who must answer PM questions credibly. Many of these may already be licensed at the firm; the request may simply be for a seat or login.

| Rank | Product | Tag | One-line justification |
|------|--------------------|--------------|----------------------------------------------|
| 1 | Bloomberg Terminal (with mortgage/securitized functionality) | Must-request | Live Treasuries, swaps, TBA, current coupon, new-issue monitor, deal and bond analytics, dealer runs and news in one place; the reference source PMs expect. |
| 2 | Dealer research portals and distribution lists (via broker coverage) | Must-request (usually free to clients) | The standard source for weekly Non-QM/jumbo/CES/CRT spread tables, CPR-day analysis, and new-issue recaps. |
| 3 | dv01 | Must-request | Standardized loan-level performance across Non-QM, DSCR, prime jumbo, CES and HELOC shelves, plus Fitch-dv01 benchmarks; answers "how's DSCR credit performing?" directly. |
| 4 | Intex | Must-request | Cash-flow models for RMBS and CRT; needed to compute yield/spread at a price and run loss and prepay scenarios on specific bonds. |
| 5 | Finsight / CreditFlow (full access) | Must-request | Fastest structured new-issue calendar and pricing database; answers "what did the last deal price at?" |
| 6 | Tradeweb (if execution is in scope) | Must-request if trading | Live dealer quotes and execution for TBA, specified pools and Treasuries. |
| 7 | Asset-Backed Alert (Green Street) | Nice to have | Weekly pipeline intelligence on who is coming to market and investor demand. |
| 8 | Inside Mortgage Finance (Inside Nonconforming Markets; Inside MBS & ABS) | Nice to have | Non-agency origination and securitization rankings and market-share data. |
| 9 | ICE eMBS | Nice to have (Must-request if agency pools are a focus) | Standard agency prepayment database for cohort and pool speeds. |
| 10 | Optimal Blue Market Data License | Nice to have | Daily lock-level data including Non-QM fields: the only systematic read on Non-QM/DSCR borrower rates and volumes. |
| 11 | KBRA Premium (RMBS) | Nice to have | Monthly RMBS credit indices (DQ, mods, prepays) and deal analytics from a Non-QM-heavy rater. |
| 12 | Asset Securitization Report full access | Nice to have | Paywalled deal stories and deal database. |
| — | Cotality PLS data, ICE McDash, Recursion, Moody's/S&P research subscriptions, MarketAxess, 1010data | Skip for a temporary role | Enterprise-scale data licenses or overlap with the above; use them if the firm already has them. |

Table: Ranked paid-access requests.

## 11.2 Bloomberg functions and tickers useful to a mortgage trader

Functions marked **Confident** are standard, widely documented Bloomberg functions. Items marked **Confirm with desk** are ones commonly referenced for mortgages but that you should verify on the terminal (type the mnemonic and use HELP HELP or the function search if needed).

| Function / ticker | What it does | Status |
|----------------|--------------------------------------------------|------------|
| YAS | Yield and spread analysis for a bond (price ↔ yield/spread, prepay/default assumptions for MBS/ABS) | Confident |
| ALLQ | All dealer quotes for a security | Confident |
| DES | Security description (deal and tranche terms) | Confident |
| CFLO | Projected cash flows for a bond | Confident |
| NIM | New Issue Monitor (live new-issue pipeline, filterable by asset class) | Confident |
| SRCH | Fixed income security search | Confident |
| LEAG | League tables | Confident |
| BTMM | US Treasury and money-market monitor | Confident |
| CRVF | Curve finder (locate curves such as Treasury, swaps, MBS) | Confident |
| SWPM | Swap manager (swap pricing and curve) | Confident |
| WIRP | World interest rate probability (market-implied Fed path) | Confident |
| ECO | Economic calendar with consensus | Confident |
| GP / HP | Price graph / historical prices for any ticker | Confident |
| TOP / N | Top news; news main menu | Confident |
| USGG2YR / USGG10YR / USGG30YR Index | Generic Treasury yields | Confident |
| SOFRRATE Index | SOFR | Confident |
| MOVE Index / VIX Index | Rates and equity implied volatility | Confident |
| MTGE | Mortgage/securitized products menu | Confirm with desk |
| MTGEFNCL Index | Fannie Mae 30-year current-coupon yield | Confirm with desk |
| TRACE-based trade screens for securitized products | Disseminated TRACE prints within Bloomberg | Confirm with desk |
| Cohort prepayment screens | Agency cohort CPR history and projections | Confirm with desk |

Table: Bloomberg functions and tickers.

# 12. Daily, weekly and monthly calendar (Central Time)

## 12.1 Daily routine

| Time (CT) | What to check | Source |
|------------|------------------------------------------------|----------------------------------|
| 6:30–7:30 am | Overnight rates move; today's data calendar and Fed speakers; SOFR (7:00 am) | CNBC/Bloomberg; BLS/BEA/Census calendars; Fed calendar; NY Fed |
| 7:30 am | Data releases (payrolls, CPI, claims, GDP/PCE, starts) and the market reaction | Agency release page; CNBC/Bloomberg |
| 8:00–9:00 am | Morning dealer commentary; new-issue announcements and presales; rating-agency press releases | Dealer emails; KBRA/Fitch/DBRS; Business Wire; Finsight |
| 9:00 am | Housing data (existing/new/pending sales, HMI, Case-Shiller/FHFA at 8:00 on release days) | NAR, Census, NAHB, S&P, FHFA |
| Midday | Curve and MBS check; deal pricing talk; Treasury auction results (~12:00 pm on auction days) | Bloomberg/Tradeweb; dealer color; TreasuryDirect |
| ~3:00 pm | MND daily rate index; mortgage-to-10Y spread update | MND; CNBC or Treasury curve |
| Late afternoon | Treasury par curve (official close); priced-deal recaps; ASR/HousingWire | Treasury; trade press |
| Next morning | FRED updates prior day (DGS series, OBMMI, ICE BofA OAS) | FRED |

Table: Daily routine.

## 12.2 Weekly

| Day | Time (CT) | Item | Source |
|------------|------------|------------------------------------|------------------------|
| Monday | — | Plan the week: data calendar, FOMC blackout/speakers, expected new-issue deals | BLS/BEA/Census; Fed; dealer calendars |
| Wednesday | 6:00 am | MBA Weekly Applications (purchase, refi, contract rates incl. jumbo) | MBA |
| Wednesday | ~3:30 pm | Fannie Mae intra-month (daily) prepayment report update | Fannie Mae PoolTalk |
| Thursday | 7:30 am | Initial jobless claims | DOL |
| Thursday | 11:00 am | Freddie Mac PMMS | Freddie Mac |
| Friday | Varies | Dealer weekly spread tables; Fed H.8 (3:15 pm); ASR deal database refresh | Dealers; Fed; ASR |
| Weekly | Varies | Freddie Mac daily prepayment report update; Realtor.com/Redfin weekly housing data | Freddie Mac; Realtor.com; Redfin |

Table: Weekly calendar.

## 12.3 Monthly and quarterly

| When | Item | Source |
|----------------------|--------------------------------------------|------------------------|
| 1st–3rd business day | ISM Manufacturing / Services | ISM |
| First Friday (usually) | Employment Situation | BLS |
| Business day 4 (evening) | Fannie Mae / Freddie Mac factors and monthly prepayment data ("CPR day") | Fannie Mae, Freddie Mac; dealer notes |
| A few business days later | Ginnie Mae factors/disclosures | Ginnie Mae |
| Early month | ICE Mortgage Monitor; MBA MCAI; Fannie Mae ESR and MBA forecasts (dates vary) | ICE; MBA; Fannie Mae |
| Mid-month | CPI, PPI, housing starts, NAHB HMI | BLS; Census; NAHB |
| Around the 25th | Non-agency RMBS and CRT distribution dates; trustee remittance reports posted beforehand; Intex/dv01 updates follow | Trustee portals; Intex; dv01 |
| Fourth week | ICE First Look; existing and new home sales; Case-Shiller and FHFA HPI (last Tuesday) | ICE; NAR; Census; S&P; FHFA |
| Late month | PCE/personal income; Urban Institute chartbook | BEA; Urban Institute |
| Monthly (per SIFMA schedule) | MBS/ABS issuance statistics | SIFMA |
| Quarterly | MBA National Delinquency Survey; NY Fed Household Debt & Credit; Fed SLOOS; FHFA quarterly HPI; SEP/dot plot (Mar/Jun/Sep/Dec FOMC); public-issuer earnings (Annaly, Rithm, Redwood, etc.) | MBA; NY Fed; Fed; FHFA; company IR sites |
| Annually (late year) | Conforming loan limits for the next year | FHFA |

Table: Monthly and quarterly calendar.

# 13. Answering PMs

## 13.1 Source hierarchy

1. **Official / primary data:** Treasury, Federal Reserve, NY Fed, BLS, BEA, Census, FHFA, the GSEs' own disclosures, SEC filings, trustee remittance reports.
2. **Index and data providers with published methodology:** Freddie Mac PMMS, Optimal Blue OBMMI, MND index, ICE, S&P Cotality Case-Shiller, ICE BofA indices, dv01, Intex, Bloomberg.
3. **Rating agencies:** KBRA, Fitch, Moody's, S&P, Morningstar DBRS presales, surveillance and research.
4. **Dealer research:** high quality but each dealer has a view; cite the dealer and date, and compare two where possible.
5. **Trade press:** ASR, HousingWire, Inside Mortgage Finance, Asset-Backed Alert, Bloomberg/WSJ. Good for what happened, not for precise levels unless they cite a primary source.
6. **Social media and forums:** only as a pointer to a primary source, never as the source itself.

## 13.2 Rules for every answer

- **Date-stamp everything.** "As of the 9/24 PMMS" or "deals priced 9/15–9/26."
- **Name the source and its type.** Survey (PMMS), rate-sheet index (MND), lock data (OBMMI), transaction prints (TRACE), dealer quote, or modeled value (Intex/YAS).
- **Give a comparison.** Level plus change versus last week, last month, and one year ago, or versus its range. A level alone rarely answers the real question.
- **Separate fact from view.** State the data, then clearly label any interpretation ("my read is…").
- **Flag gaps honestly.** If the only precise source is paid (live TBA levels, Non-QM spreads, loan-level DSCR performance), say so, give the best free proxy, and say when you will have the better number.
- **Keep a log.** A simple dated file of questions asked, answers given, and sources makes follow-ups consistent and helps the trader when they return.

## 13.3 Worked examples (methodology only; no numbers are implied)

**Example 1: "Where are mortgage rates versus 10s?"**

1. Pull the latest Freddie Mac PMMS 30Y rate (Thursday, 11:00 am CT) and note the window it covers (Thursday–Wednesday applications).
2. Download DGS10 from FRED and average the daily values over the same window.
3. Spread = PMMS − average 10Y, in bp. Compute the same for four weeks ago and 52 weeks ago.
4. Cross-check with a daily measure: MND index minus the 10Y around 3:00 pm CT, or OBMMIC30YF minus the prior day's DGS10.
5. If asked why the spread is wide or narrow, decompose it with the Urban Institute chartbook's primary-secondary chart plus a dealer current-coupon spread.
6. *Answer template:* "Per PMMS for the week ended [date], the 30Y averaged [x]%, [y] bp over the average 10Y for the same window, versus [a] bp a month ago and [b] bp a year ago. MND's daily index today is [z]%, consistent with / wider than that. Most of the change came from [primary-secondary / secondary spread] per [source]."

**Example 2: "Where are Non-QM spreads?"**

1. List Non-QM deals priced in the last two to three weeks from ASR, HousingWire, Finsight and rating-agency final reports (Section 5.2 shelves).
2. For each, record the AAA (A-1) coupon and spread if reported, tranche WAL, and pool characteristics (WAC, FICO, CLTV, DSCR share, doc type) from the presale.
3. Check at least one dealer weekly spread table for the current AAA/AA/A/BBB Non-QM levels and the week-over-week change.
4. Note the context: rates vol (MOVE), broad credit spreads (FRED HY/IG OAS), and issuance pace (SIFMA/ASR YTD totals).
5. *Answer template:* "AAA Non-QM seniors on [n] deals priced [dates] cleared around [range] per [source(s)], versus [range] a month ago per [dealer, date]. Collateral on recent deals: WAC [x], FICO [y], DSCR share [z]. Tone: [tighter/wider] alongside [HY/IG moves / rates vol]."

**Example 3: "How's DSCR credit performing?"**

1. Start with the latest rating-agency research on Non-QM/DSCR performance (KBRA, Fitch, Morningstar DBRS) and any recent trade-press summaries.
2. If dv01 is available, pull 60+ DQ, roll rates and loss by vintage for DSCR loans versus full-doc/bank-statement loans, and by DSCR bucket and property type.
3. Check macro drivers: rent growth (Zillow ZORI, Apartment List), home prices (Case-Shiller, FHFA, ICE HPI), and rental vacancy.
4. Compare with the broader market (ICE First Look DQ rate) so the PM sees whether DSCR is diverging.
5. *Answer template:* "Per [agency report/dv01, date], DSCR 60+ DQ is [x]% for [vintages], up/down [y] over [period]; weaker pockets are [vintage/DSCR < 1.0x/STR]. Rent growth per [source] is [trend], home prices per [source] are [trend], so severities [should/should not] be a concern."

**Example 4: "What's the prepay outlook?"**

1. Quote the latest monthly speeds (GSE disclosures or dealer CPR-day note for agency; dv01/Intex for non-agency) and ICE First Look's national SMM.
2. Compare the current mortgage rate (MND/OBMMI) with the pool or deal WAC to size the refi incentive.
3. Check the four-week trend in the MBA Refi Index and the Fannie/Freddie intra-month prepay reports.
4. Add turnover drivers (existing and pending home sales, seasonality, day count) and, for non-agency, prepay penalties and call risk.
5. *Answer template:* "Last month's speeds were [x] CPR per [source]. With rates at [y] versus collateral WAC of [z], [share] of the pool is in the money. Refi apps are [trend] per MBA; intra-month data points to [faster/slower]; seasonals turn [positive/negative] into [months]."

**Example 5: "What did the last CRT deal price at?"**

1. Go to the Fannie Mae CAS Pricing page or Freddie Mac STACR Pricing page and take the most recent deal: tranche sizes, spreads over 30-day average SOFR, credit enhancement and ratings.
2. Compare with the prior deal from the same program and series (for example DNA versus HQA for STACR, which differ in LTV profile).
3. Add dealer color on secondary CRT spreads and demand.
4. *Answer template:* "[Deal] priced on [date]: M-1 at SOFR + [x], M-2 at SOFR + [y], B-1 at SOFR + [z], per [Fannie/Freddie pricing page]; that is [tighter/wider] than [prior deal] by [n] bp."

# Appendix A: What is only available paid

To be explicit about what you cannot get for free: live TBA prices and current-coupon spreads (Bloomberg, Tradeweb, dealer runs); non-agency and CRT secondary spreads (dealer runs, Bloomberg); bond cash-flow modeling (Intex, Bloomberg); standardized Non-QM/DSCR/jumbo/CES/HELOC loan-level performance (dv01, Intex, Cotality, KBRA Premium); agency prepayment databases (ICE eMBS, Recursion, Bloomberg); lock-level Non-QM rate data (Optimal Blue Market Data License); full-text trade newsletters (Inside Mortgage Finance, Asset-Backed Alert, ASR); servicing loan-level data (ICE McDash); most Moody's and S&P research. The free alternatives in this guide are good for context and for many PM questions, but they are not substitutes for live levels.

# Appendix B: Full link index

Every hyperlink used in this guide, in full, sorted by domain, for use in printed copies. All were checked on Sep 30, 2026 (see the note on bot-blocked sites below).

- <https://www.americanbanker.com/>
- <https://www.apartmentlist.com/research/national-rent-data>
- <https://www.apollo.com/wealth/insights-news/insights/daily-spark>
- <https://asreport.americanbanker.com/>
- <https://www.atlantafed.org/research-and-data/data/gdpnow>
- <https://www.axios.com/newsletters/axios-markets>
- <https://www.bankrate.com/mortgages/mortgage-rates/>
- <https://www.bea.gov/news/schedule>
- <https://www.bloomberg.com/>
- <https://www.bloomberg.com/professional/>
- <https://www.bls.gov/schedule/news_release/current_year.asp>
- <https://www.businesswire.com/>
- <https://capitalmarkets.fanniemae.com/credit-risk-transfer>
- <https://capitalmarkets.fanniemae.com/credit-risk-transfer/fannie-mae-single-family-loan-performance-data>
- <https://capitalmarkets.fanniemae.com/credit-risk-transfer/single-family-connecticut-avenue-securities/cas-pricing>
- <https://capitalmarkets.fanniemae.com/mortgage-backed-securities>
- <https://capitalmarkets.fanniemae.com/tools-applications/data-dynamics>
- <https://capitalmarkets.freddiemac.com/crt>
- <https://capitalmarkets.freddiemac.com/crt/securities/pricing>
- <https://capitalmarkets.freddiemac.com/mbs>
- <https://capitalmarkets.freddiemac.com/mbs/daily-prepayment-report>
- <https://www.cboe.com/tradable-products/vix>
- <https://www.census.gov/construction/nrc/index.html>
- <https://www.census.gov/construction/nrs/index.html>
- <https://www.census.gov/economic-indicators/>
- <https://www.chathamfinancial.com/technology/us-market-rates>
- <https://www.clevelandfed.org/indicators-and-data/inflation-nowcasting>
- <https://www.cmegroup.com/market-data/cme-group-benchmark-administration/term-sofr.html>
- <https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html>
- <https://www.cnbc.com/quotes/US10Y>
- <https://www.conference-board.org/topics/consumer-confidence/>
- <https://www.consumerfinance.gov/compliance/compliance-resources/mortgage-resources/ability-repay-qualified-mortgage-rule/>
- <https://www.consumerfinance.gov/data-research/hmda/>
- <https://www.consumerfinance.gov/rules-policy/regulations/1026/43/>
- <https://www.cotality.com/>
- <https://www.cotality.com/insights>
- <https://creditflowresearch.com/>
- <https://dbrs.morningstar.com/>
- <https://www.dol.gov/>
- <https://www.dv01.co/>
- <https://embs.ice.com/>
- <https://www.fanniemae.com/data-and-insights/forecast>
- <https://www.federalreserve.gov/data/sloos.htm>
- <https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm>
- <https://www.federalreserve.gov/monetarypolicy/fomcprojtabl20260916.htm>
- <https://www.federalreserve.gov/monetarypolicy/guide-to-the-summary-of-economic-projections.htm>
- <https://www.federalreserve.gov/newsevents/calendar.htm>
- <https://www.federalreserve.gov/releases/h15/>
- <https://www.federalreserve.gov/releases/h8/current/default.htm>
- <https://ffiec.cfpb.gov/>
- <https://www.fhfa.gov/>
- <https://www.fhfa.gov/data/conforming-loan-limit>
- <https://www.fhfa.gov/data/dashboard/nmdb-outstanding-residential-mortgage-statistics>
- <https://www.fhfa.gov/data/hpi>
- <https://www.fhfa.gov/news>
- <https://www.finra.org/finra-data/fixed-income>
- <https://finsight.com/>
- <https://www.fitchratings.com/structured-finance/rmbs>
- <https://fred.stlouisfed.org/release?rid=473>
- <https://fred.stlouisfed.org/series/BAMLH0A0HYM2>
- <https://fred.stlouisfed.org/series/DGS10>
- <https://fred.stlouisfed.org/series/DRSFRMACBS>
- <https://fred.stlouisfed.org/series/RRVRUSQ156N>
- <https://fred.stlouisfed.org/series/SOFR>
- <https://fred.stlouisfed.org/series/T10YIE>
- <https://fred.stlouisfed.org/series/VIXCLS>
- <https://www.freddiemac.com/pmms>
- <https://www.freddiemac.com/research>
- <https://www.freddiemac.com/research/datasets/sf-loanlevel-dataset>
- <https://www.ginniemae.gov/>
- <https://www.globenewswire.com/>
- <https://www.greenstreet.com/>
- <https://guide.freddiemac.com/>
- <https://home.treasury.gov/policy-issues/financing-the-government/interest-rate-statistics>
- <https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_real_yield_curve>
- <https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve>
- <https://www.housingwire.com/>
- <https://www.ice.com/fixed-income-data-services/index-solutions/fixed-income-indices>
- <https://www.ice.com/fixed-income-data-services/mortgage-data-solutions/mortgage-backed-securities-data>
- <https://www.insidemortgagefinance.com/>
- <https://www.insidemortgagefinance.com/topics/677-inside-nonconforming-markets>
- <https://www.intex.com/main/>
- <https://www.ismworld.org/>
- <https://www.kbra.com/>
- <https://www.kbra.com/analytics/products/premium/rmbs>
- <https://www.kbra.com/sectors/rmbs/transactions>
- <https://www.marketaxess.com/>
- <https://www.mba.org/forecasts-and-commentary>
- <https://www.mba.org/news-and-research/research-and-economics/single-family-research/mortgage-credit-availability-index-x241340>
- <https://www.mba.org/news-and-research/research-and-economics/single-family-research/national-delinquency-survey>
- <https://www.mba.org/news-and-research/research-and-economics/single-family-research/weekly-applications-survey>
- <https://www.mbslive.net/>
- <https://www.moodys.com/>
- <https://www.mortgagenewsdaily.com/>
- <https://www.mortgagenewsdaily.com/mbs>
- <https://www.mortgagenewsdaily.com/mortgage-rates/about>
- <https://www.mortgagenewsdaily.com/mortgage-rates/mnd>
- <https://mortgagetech.ice.com/resources/data-reports>
- <https://www.nahb.org/news-and-economics/housing-economics/indices/housing-market-index>
- <https://www.nar.realtor/research-and-statistics/housing-statistics/existing-home-sales>
- <https://www.nar.realtor/research-and-statistics/housing-statistics/pending-home-sales>
- <https://www.nationalmortgagenews.com/>
- <https://nationalmortgageprofessional.com/>
- <https://www.newyorkfed.org/markets/reference-rates/sofr>
- <https://www.newyorkfed.org/markets/reference-rates/sofr-averages-and-index>
- <https://www.newyorkfed.org/microeconomics/hhdc>
- <https://www2.optimalblue.com/market-analytics/>
- <https://www2.optimalblue.com/obmmi>
- <https://pensford.com/forward-curve>
- <https://www.prnewswire.com/>
- <https://www.realtor.com/research/data/>
- <https://www.recursionco.com/>
- <https://www.redfin.com/news/data-center/>
- <https://www.sca.isr.umich.edu/>
- <https://www.scotsmanguide.com/>
- <https://www.sec.gov/edgar/search/>
- <https://selling-guide.fanniemae.com/>
- <https://sf.freddiemac.com/>
- <https://www.sifma.org/research/statistics/us-asset-backed-securities-statistics>
- <https://www.sifma.org/research/statistics/us-mortgage-backed-securities-statistics>
- <https://singlefamily.fanniemae.com/selling-policy-communications>
- <https://www.spglobal.com/ratings/en/>
- <https://www.spglobal.com/spdji/en/>
- <https://structuredfinance.org/>
- <https://www.thedailyupside.com/>
- <https://www.tradeweb.com/>
- <https://www.treasurydirect.gov/auctions/upcoming/>
- <https://www.urban.org/tags/housing-finance-glance-monthly-chartbook>
- <https://www.wsj.com/>
- <https://www.wsj.com/market-data/bonds>
- <https://x.com/NickTimiraos>
- <https://www.zillow.com/homeloans/mortgage-rates/>
- <https://www.zillow.com/research/data/>

*Note: a handful of major sites (Bloomberg, WSJ, S&P Global, SEC, BLS, CME, FINRA, Business Wire, GlobeNewswire, Department of Labor) block automated checks; their links are standard, well-known pages and were confirmed by search or manual fetch where possible.*

*End of guide. Prepared Sep 30, 2026. Public/commercial external sources only.*
