---
title: "Residential Mortgage / RMBS Trader Key Concepts Cheat Sheet"
subtitle: "Prepared Oct 1, 2026 · Companion to the Trader External Data Reference Guide · Concepts, formulas and Excel versions"
---

**Prepared Oct 1, 2026.** This cheat sheet explains the concepts, formulas and desk vocabulary a whole-loan/RMBS trader uses every day, with a focus on Non-QM, DSCR/investor, RTL (fix-and-flip), prime jumbo, closed-end seconds (CES) and HELOCs, plus the agency market as context. It contains no internal firm data. **Every number in a worked example is illustrative ("Example numbers, not market data")** and was chosen to make the arithmetic easy to follow, not to reflect where any market is trading. For current levels, use the sources in the companion *Trader External Data Reference Guide*.

**How each formula is shown.** Each formula box gives (1) a plain-English line, (2) the math, and (3) an Excel version written with named cells (for example `EffDur`, `MV`, `CPR`) so it can be typed straight into a workbook. Rates and yields are entered in Excel as decimals (5.00% = 0.05); basis-point (bp) inputs are converted with `/10000`. The companion workbook **trader-calcs.xlsx** implements the main formulas with live, color-coded inputs using the same names.

**Contents:** 1. Duration family and DV01 hedging · 2. Convexity · 3. Prepayments · 4. Spreads and yield measures · 5. Whole-loan trading mechanics · 6. Securitization structure · 7. Credit metrics · 8. Rates and macro · 9. Risk and P&L · 10. Building it in Excel · 11. Glossary and "PM asks → concept" table

# 1. Duration family and DV01 hedging

Duration measures how much a bond's price changes when yields change. There are several versions, and the differences matter for mortgages because mortgage cash flows themselves change when rates move (borrowers prepay faster when rates fall).

| Measure | Plain English | Math | Excel (named inputs) |
|-----------|-------------------------|-------------------------------|-------------------------------|
| Macaulay duration | Present-value-weighted average time (in years) until the cash flows arrive. | $D_{\text{mac}}=\dfrac{1}{P}\sum_{t=1}^{n}\dfrac{t}{k}\cdot\dfrac{\text{CF}_t}{(1+y/k)^{t}}$ | Bullet bond: `=DURATION(Settle,Maturity,Cpn,Yld,2,1)`. Cash-flow column: `=SUMPRODUCT(Years,CF/(1+Yld/k)^Period)/SUMPRODUCT(CF/(1+Yld/k)^Period)` |
| Modified duration | Percent price change for a 1.00 (100%) change in yield, assuming cash flows do not change. | $D_{\text{mod}}=\dfrac{D_{\text{mac}}}{1+y/k}$ | `=MDURATION(Settle,Maturity,Cpn,Yld,2,1)` or `=MacDur/(1+Yld/2)` |
| Price change from duration | Approximate dollar price change for a yield move. | $\Delta P\approx -D\cdot P\cdot\Delta y$ | `=-ModDur*Price*DeltaY` (DeltaY as decimal: 1bp = 0.0001) |
| Effective (option-adjusted) duration | Duration measured by re-pricing the bond, with its prepayment model, after shifting rates down and up. Required for mortgages. | $D_{\text{eff}}=\dfrac{P_{\text{dn}}-P_{\text{up}}}{2\,P_0\,\Delta y}$ | `=(P_dn-P_up)/(2*P_0*Bump)` |
| Key rate duration (KRD) | Sensitivity to a shift at one point of the curve (2Y, 5Y, 10Y, 30Y) with other points held fixed. KRDs add up to roughly the effective duration. | $\text{KRD}_j=\dfrac{P_{j,\text{dn}}-P_{j,\text{up}}}{2\,P_0\,\Delta y_j}$, $\sum_j \text{KRD}_j\approx D_{\text{eff}}$ | Same form per tenor; check `=SUM(KRD_2Y:KRD_30Y)` against `EffDur` |
| Spread duration | Price sensitivity to a change in spread (OAS) with the rate curve unchanged. For fixed-rate collateral it is close to effective duration; for floaters it is much larger than rate duration. | $D_{s}=\dfrac{P(s-\Delta s)-P(s+\Delta s)}{2\,P_0\,\Delta s}$ | `=(P_sprd_dn-P_sprd_up)/(2*P_0*SprdBump)` |
| Empirical duration | Duration observed from history: regress daily price returns on yield changes. Often shorter than model duration for mortgages. | $\dfrac{\Delta P}{P}=\alpha+\beta\,\Delta y_{10}$, $D_{\text{emp}}=-\beta$ | `=-SLOPE(PriceReturns,YieldChanges)` (both as decimals) |
| DV01 / PV01 | Dollar change in value for a 1bp change in yield. | $\text{DV01}=D_{\text{eff}}\times \text{MV}\times 0.0001$ | `=EffDur*MV*0.0001`, with `MV=Face*Price/100` (add accrued for full value) |
| Hedge ratio | Number of hedge units needed to offset the position's DV01. | $N=\dfrac{\text{DV01}_{\text{position}}}{\text{DV01}_{\text{hedge}\ \text{unit}}}$ | `=Position_DV01/Hedge_DV01` |
| Futures DV01 | A Treasury future tracks its cheapest-to-deliver (CTD) bond scaled by the conversion factor (CF). | $\text{DV01}_{\text{fut}}\approx\dfrac{\text{DV01}_{\text{CTD}}}{\text{CF}_{\text{CTD}}}$ | `=CTD_DV01/CTD_CF` |
| Swap hedge notional | Notional of a pay-fixed swap that offsets the position DV01. | $\text{Notional}=\dfrac{\text{DV01}_{\text{position}}}{\text{DV01}_{\text{swap}\ \text{per}\ 1\text{mm}}}\times 10^{6}$ | `=Position_DV01/Swap_DV01_per_mm*1000000` |

Table: Duration family formulas. $P_0$ is today's price, $P_{\text{dn}}$ and $P_{\text{up}}$ are prices after yields move down and up by $\Delta y$, $k$ is payments per year.

**Why mortgages need effective duration.** Modified duration assumes the cash flows are fixed. A mortgage investor is short the borrower's option to prepay at par. When rates fall, prepayments speed up and the bond shortens; when rates rise, prepayments slow and the bond lengthens. Only a measure that re-runs the cash flows under each rate shift (effective or option-adjusted duration, computed by a prepayment model and usually an interest-rate path model) captures this. Effective duration is model-dependent, so two dealers can quote different durations for the same pool; always ask which model and which assumptions were used.

**DV01 versus PV01.** Desks use the terms loosely. Strictly, DV01 is the price change for a 1bp move in yield, and PV01 is the present value of a 1bp annual cash-flow stream (common for swaps). For par swaps and small moves they are nearly equal.

> **Worked example: DV01 and hedge ratios** (Example numbers, not market data)
>
> - Position: \$100mm face of a pool at a price of 98-00, effective duration 5.2. Market value = $\text{100,000,000}\times 0.98=\$\text{98,000,000}$ (ignoring accrued interest).
> - Position DV01 = $5.2\times \text{98,000,000}\times 0.0001=\$\text{50,960}$ per bp. A long position loses about \$50,960 for each 1bp rise in yields.
> - Illustrative hedge DV01s (labeled assumptions): 10Y note future \$75 per contract; 5Y note future \$45 per contract; 10Y SOFR swap \$850 per \$1mm notional.
> - All in 10Y futures: $\text{50,960}/75=679.5$, so sell about 680 contracts. Split 50/50 by DV01 between 5s and 10s: $\text{25,480}/75\approx 340$ 10Y contracts and $\text{25,480}/45\approx 566$ 5Y contracts. All in swaps: $\text{50,960}/850\times 10^6\approx \$60$mm notional, paying fixed.
> - Futures DV01 from the CTD (illustrative): CTD DV01 \$62.00 per \$100k face and conversion factor 0.8200 give $62.00/0.8200\approx \$75.61$ per contract. The futures DV01 changes when the CTD changes, so recheck it after large rate moves and around delivery.
> - A split across 5s and 10s should follow the position's key rate durations, not a fixed 50/50. Because the mortgage's duration changes as rates move, the hedge must be rebalanced (see Section 2).

# 2. Convexity

Convexity measures how duration itself changes as yields move. **Positive convexity** (Treasuries, most bullet bonds) means the price rises more when yields fall than it drops when yields rise. **Negative convexity** (most mortgages trading near or above par) means the opposite: price gains are capped as rates fall because borrowers refinance, and losses grow as rates rise because the bond extends.

| Measure | Plain English | Math | Excel (named inputs) |
|-----------|-------------------------|-------------------------------|-------------------------------|
| Price change with convexity | Duration gives the straight-line estimate; convexity adds the curvature term. | $\dfrac{\Delta P}{P}\approx -D\,\Delta y+\frac{1}{2}\,C\,(\Delta y)^2$ | `=-EffDur*DeltaY+0.5*Convexity*DeltaY^2` |
| Effective convexity | Measured by re-pricing after down and up shifts. Negative when the average of the shifted prices is below today's price. | $C_{\text{eff}}=\dfrac{P_{\text{dn}}+P_{\text{up}}-2P_0}{P_0\,(\Delta y)^2}$ | `=(P_dn+P_up-2*P_0)/(P_0*Bump^2)` |
| Option cost ("convexity cost") | The part of the spread that pays for the short prepayment option. | $\text{Option cost}=\text{ZV}\ \text{spread}-\text{OAS}$ | `=ZSpread_bp-OAS_bp` |

Table: Convexity formulas. Convexity units: in this formula $C$ is in years-squared (a Treasury might show about 80). Some systems quote convexity divided by 100 (0.8); check the convention before plugging numbers in.

> **Worked example: asymmetric ±100bp outcomes** (Example numbers, not market data)
>
> Treasury: duration 8.0, convexity +80. Mortgage pool: effective duration 5.2, effective convexity −150, price 98.

| Instrument | Yields −100bp | Yields +100bp | What it shows |
|------------------|------------------|------------------|----------------------------|
| Treasury ($D=8.0$, $C=+80$) | $+8.0\%+0.4\%=+8.4\%$ | $-8.0\%+0.4\%=-7.6\%$ | Gains exceed losses: long convexity |
| Mortgage ($D=5.2$, $C=-150$) | $+5.2\%-0.75\%=+4.45\%$ (98.00 → 102.36) | $-5.2\%-0.75\%=-5.95\%$ (98.00 → 92.17) | Losses exceed gains: short convexity |

Table: Convexity term = $\frac{1}{2}\times C\times(0.01)^2$, i.e., $+0.4\%$ for the Treasury and $-0.75\%$ for the mortgage.

**Contraction and extension risk.** Contraction risk is the risk that falling rates speed up prepayments, returning principal at par just when reinvestment rates are lower; premium-priced bonds lose the most. Extension risk is the risk that rising rates slow prepayments, lengthening the bond just when it is worth less; discount bonds and long-WAL classes suffer most.

**Negative convexity as a short call option.** The borrower can repay at par at any time, which is economically a call option on the mortgage. The investor is short that option and is paid for it through a higher spread. Option value rises with interest-rate volatility, so **higher implied vol (the MOVE index, swaption vol) hurts mortgages** even if rates do not move: the option the investor is short becomes more valuable, and mortgage spreads (nominal and ZV) tend to widen. Lower vol helps.

**Delta hedging and rebalancing cost.** A hedged mortgage position is short gamma. When rates fall, duration shortens and the position becomes over-hedged, so the trader buys back hedges at higher prices. When rates rise, duration extends and the trader sells more hedges at lower prices. Each rebalance locks in a small loss, and the total grows with realized volatility. The option cost (ZV minus OAS) is the expected compensation for this; if realized vol exceeds the vol implied in the price, the hedged position underperforms.

**Spread definitions for option cost.** Strictly, option cost is ZV spread minus OAS, both measured against the same curve. The nominal spread (yield minus interpolated Treasury at the WAL) is sometimes used loosely in place of ZV; that mixes in a curve-shape effect.

**Collateral differences.** DSCR loans with prepayment penalties, Non-QM loans with less refinance access, and deep-discount pools are less negatively convex than agency or prime jumbo collateral at par or above. RTL loans are short (12–24 months), so their rate convexity is small and their main "option" is extension when sales slow.

# 3. Prepayments

A prepayment is any principal paid ahead of schedule: a full payoff (refinance, home sale, cash-out) or a partial payment (curtailment). Prepayment speed drives the timing of cash flows, the WAL, and therefore the yield of anything bought away from par.

| Measure | Plain English | Math | Excel (named inputs) |
|-----------|-------------------------|-------------------------------|-------------------------------|
| SMM (single monthly mortality) | Share of the balance still outstanding after the scheduled payment that prepays this month. B = beginning balance, SP = scheduled principal. | $\text{SMM}_t=\dfrac{\text{Prepay}_t}{B_{t-1}-\text{SP}_t}$ | `=Prepay/(BegBal-SchedPrin)` |
| CPR (conditional prepayment rate) | SMM expressed as an annual rate. | $\text{CPR}=1-(1-\text{SMM})^{12}$ | `=1-(1-SMM)^12` |
| SMM from CPR | Converts an annual speed into a monthly one. | $\text{SMM}=1-(1-\text{CPR})^{1/12}$ | `=1-(1-CPR)^(1/12)` |
| PSA | Standard ramp: 100 PSA is 0.2% CPR in month 1, rising 0.2% a month to 6% at month 30, then flat. | $\text{CPR}_t=\dfrac{\text{PSA}}{100}\times 6\%\times\min\!\left(\dfrac{t}{30},1\right)$ | `=PSA/100*0.06*MIN(Age,30)/30` |
| Prepaid principal | Dollar prepayments in a month. | $\text{Prepay}_t=\text{SMM}_t\,(B_{t-1}-\text{SP}_t)$ | `=SMM*(BegBal-SchedPrin)` |
| CDR and MDR | Annual and monthly default rates; same conversion as CPR and SMM. | $\text{MDR}=1-(1-\text{CDR})^{1/12}$ | `=1-(1-CDR)^(1/12)` |
| WAL (weighted-average life) | Average time, in years, until each dollar of principal is repaid. | $\text{WAL}=\dfrac{\sum_t (t/12)\,\text{Prin}_t}{\sum_t \text{Prin}_t}$ | `=SUMPRODUCT(Month,TotalPrin)/SUM(TotalPrin)/12` |
| Refi incentive | How far the borrower's rate is above today's available rate. | $\text{Incentive}=\text{WAC}-r_{\text{market}}$ (bp) | `=(WAC-MktRate)*10000` |
| Prepay penalty (step-down) | Penalty owed on a payoff, as a percent of the amount prepaid, stepping down each year. | $\text{Pen}=\text{Prepay}\times p_y$, with $p_y=5\%,4\%,3\%,2\%,1\%$ in loan years $y=1,\dots,5$ and $0$ after | `=IF(AgeMo>=60,0,PrepayAmt*INDEX(PenaltySched,INT(AgeMo/12)+1))` with `PenaltySched` = 5%,4%,3%,2%,1% |

Table: Prepayment formulas. Worked conversions (Example numbers, not market data): 12% CPR gives $\text{SMM}=1-0.88^{1/12}=1.06\%$; 1% SMM gives $\text{CPR}=1-0.99^{12}=11.36\%$; 150 PSA in month 10 is $1.5\times 2\%=3\%$ CPR and in month 40 is $1.5\times 6\%=9\%$ CPR; a \$400,000 DSCR loan paid off in year 2 under a 5-4-3-2-1 penalty owes $4\%\times \text{400,000}=\$\text{16,000}$.

| Driver | What it means and why it matters |
|----------------|--------------------------------------------------------------|
| Refi incentive and the S-curve | Prepay speeds plotted against incentive form an S-shape: flat when out of the money, rising steeply once borrowers can save roughly 50–100bp after costs, then flattening as the most responsive borrowers have already refinanced. Larger loans (jumbo) respond at smaller incentives because the dollar savings are bigger. |
| Burnout | After a pool has been in the money for a long time, the borrowers left are the ones who do not refinance, so speeds fall even if incentive stays high. |
| Turnover | Prepayments from home sales (moves, divorce, job changes), largely independent of rates; the baseline speed when out of the money. Low rates locked in by existing borrowers (the "lock-in effect") depress turnover. |
| Seasoning | New loans prepay slowly and ramp up over the first 2–3 years (the logic behind PSA). Measured by WALA (loan age). |
| Media effect | When record-low rates or a large rate drop make headlines, refinance response jumps beyond what incentive alone predicts. |
| Cash-out and curtailments | Borrowers refinance to extract equity even without rate incentive (more common with high HPA). Curtailments are partial prepayments, larger in seasoned pools. |
| Credit cure | Non-QM borrowers whose credit or documentation improves can refinance into cheaper agency or prime loans, so Non-QM speeds can be high even without rate incentive. |
| Prepay penalties (DSCR/investor) | Most DSCR loans carry penalties (e.g., 5-4-3-2-1, 3-2-1, or a fixed 3–5 year percent or months-of-interest structure). Speeds jump when a penalty steps down or expires ("penalty cliff"). Check the pool's penalty mix and remaining terms. |
| Voluntary vs involuntary | Voluntary = borrower-chosen payoffs (CPR). Involuntary = defaults and liquidations (CDR); in agency pools, delinquent-loan buyouts show up as prepayments. In private-label deals, defaults reduce the balance and losses hit the subordinate bonds. |

Table: What drives prepayment speeds.

**Why Non-QM and DSCR are less rate-sensitive.** Non-QM borrowers often have non-standard income documentation, recent credit events, or self-employment income, which narrows their refinance options and raises their costs; DSCR borrowers usually face prepayment penalties and are investors who weigh the property's cash flow, not just the rate. Both behaviors flatten the S-curve. Prime jumbo is the opposite: large, high-FICO loans with easy refinance access, so jumbo prepays are the most rate-sensitive. Closed-end seconds prepay when the borrower refinances or sells, often together with the first lien. HELOCs revolve during the draw period, so "speed" mixes payoffs with new draws. RTL loans are short-term bridge loans that pay off at sale or refinance; the risk to watch is **extension** (loans not paying off by maturity), not refinancing.

# 4. Spreads and yield measures

| Measure | Plain English | Math | Excel (named inputs) |
|-----------|-------------------------|-------------------------------|-------------------------------|
| Nominal spread | Bond yield minus the Treasury yield at the bond's WAL. | $s_{\text{nom}}=y_{\text{bond}}-y_{\text{UST}}(\text{WAL})$ | `=(BondYld-UST_at_WAL)*10000` |
| Linear interpolation | Benchmark yield at a WAL between two curve points. | $y(W)=y_1+(W-T_1)\dfrac{y_2-y_1}{T_2-T_1}$ | `=Yld_lo+(WAL-T_lo)*(Yld_hi-Yld_lo)/(T_hi-T_lo)` |
| G-spread | Spread to the interpolated government (Treasury) curve; for MBS equals the nominal spread at WAL. | $s_G=y_{\text{bond}}-y_{\text{UST}}(T)$ | as above |
| I-spread | Spread to the interpolated swap (SOFR) curve. | $s_I=y_{\text{bond}}-y_{\text{swap}}(T)=s_G-\text{swap spread}$ | `=(BondYld-Swap_at_WAL)*10000` |
| Swap spread | Swap rate minus Treasury yield at the same tenor. | $\text{SS}_T=y_{\text{swap}}(T)-y_{\text{UST}}(T)$ | `=(SwapRate-USTYld)*10000` |
| Z-spread (ZV) | Constant spread added to every point of the spot (zero) curve that discounts the projected cash flows (one prepay assumption) to the market price. | $P=\sum_t \dfrac{\text{CF}_t}{(1+(z_t+s_Z)/12)^{t}}$ | `=SUMPRODUCT(CF,(1+(Zero+ZSpr)/12)^-Month)`; Goal Seek `ZSpr` so the result equals full price |
| OAS | Spread over many simulated rate paths, with cash flows re-projected on each path by a prepayment model, so that the average PV equals price. Removes the option cost. | $P=\dfrac{1}{N}\sum_{i=1}^{N}\sum_t \dfrac{\text{CF}_{t}^{(i)}}{\prod_{u\le t}(1+(r_u^{(i)}+\text{OAS})/12)}$ | Not practical in Excel; take from the vendor model (Yield Book, Bloomberg, Intex with a prepay model) |
| Mortgage-to-10Y gap | Headline spread of the primary mortgage rate over the 10Y Treasury. | $\text{Gap}=r_{\text{mtg}}-y_{10}$ | `=(MtgRate-UST_10Y)*10000` |
| Primary-secondary spread | Mortgage rate minus current-coupon MBS yield (g-fees, servicing, originator margin). | $\text{PS}=r_{\text{mtg}}-y_{\text{CC}}$ | `=(MtgRate-CC_Yld)*10000` |
| Secondary spread | Current-coupon MBS yield minus Treasury benchmark. | $\text{SEC}=y_{\text{CC}}-y_{10}$, with $\text{Gap}=\text{PS}+\text{SEC}$ | `=(CC_Yld-UST_10Y)*10000` |
| Bond-equivalent yield (BEY) | Converts a monthly-compounded mortgage yield to the semiannual basis Treasuries use. | $\text{BEY}=2\left[(1+y_m/12)^{6}-1\right]$ | `=2*((1+MtgYld/12)^6-1)` or `=NOMINAL(EFFECT(MtgYld,12),2)` |
| Mortgage yield from BEY | The reverse conversion. | $y_m=12\left[(1+\text{BEY}/2)^{1/6}-1\right]$ | `=12*((1+BEY/2)^(1/6)-1)` or `=NOMINAL(EFFECT(BEY,2),12)` |
| 32nds to decimal | Prices are quoted in points and 32nds; "+" adds 1/64. | $P=H+\dfrac{n}{32}\ (+\tfrac{1}{64})$ | `=DOLLARDE(98.16,32)` = 98.5 (98-16); `=DOLLARDE(98.16,32)+1/64` for 98-16+; back: `=DOLLARFR(98.5,32)` |
| Tick value | Dollar value of 1/32 of a point. | $\text{Tick}=\text{Face}\times\dfrac{1}{32}\times\dfrac{1}{100}$ | `=Face/32/100` (\$312.50 per \$1mm) |
| Carry (one month, simplified) | Coupon earned minus financing paid, plus the gain or loss when principal is returned at par. | $\text{Carry}\approx \dfrac{c}{12}\cdot 100-r_{\text{repo}}\dfrac{d}{360}P_{\text{full}}+(100-P)\,f_{\text{paid}}$ (points) | `=Cpn/12*100-Repo*Days/360*FullPx+(100-Px)*PctPaid` |

Table: Spread and yield formulas. $f_{\text{paid}}$ = fraction of balance paid down in the month (scheduled plus prepaid).

**Worked numbers** (Example numbers, not market data): mortgage rate 6.40%, current-coupon yield 5.30%, 10Y 4.20% gives a 220bp mortgage-to-10Y gap made of a 110bp primary-secondary spread and a 110bp secondary spread. A 6.00% monthly-compounded mortgage yield equals $2[(1.005)^6-1]=6.08\%$ BEY. A price of 98-16+ is $98+16.5/32=98.515625$.

**Spread to swaps versus Treasuries.** Agency MBS have traditionally been quoted against Treasuries; many non-agency and floating-rate bonds (CRT, some RTL and HELOC classes) price over SOFR swaps or as a spread to SOFR. Because swap spreads move independently, the same bond can tighten versus swaps and widen versus Treasuries on the same day. Always state which curve a spread refers to.

**Primary-secondary and the mortgage-rate gap.** The gap between the mortgage rate and 10s widens when MBS spreads widen (higher vol, weaker demand) or when originators keep wider margins (capacity constraints). Non-QM, DSCR and jumbo borrower rates sit above conforming rates by a product spread that reflects credit, liquidity and the securitization exit.

**Price and yield conventions.** Agency TBA and most non-agency bonds are quoted as a percent of par in 32nds (agency) or decimals (many non-agency bonds and whole loans). Whole-loan bids are quoted as a price per 100 of UPB, plus accrued interest. Non-agency new issues price at a spread over a benchmark (Treasury or swaps) at a stated prepay assumption, and then the coupon is set.

**Agency TBA, dollar rolls and specialness.** A TBA (to-be-announced) trade agrees on issuer program, coupon, term, price and settlement month; specific pools are announced 48 hours before settlement. A **dollar roll** is selling TBA for one month's settlement and buying it back for a later month. The **drop** is the price difference between the front and back month. The roller gives up the month's coupon and paydown and avoids financing. The roll is **special** when the drop is larger than the break-even drop implied by carry; equivalently, when the roll's implied financing rate is below repo. Example (Example numbers, not market data): 6.00% coupon at par, repo 5.00%, 30 days: carry = $0.50-0.4167=0.0833$ points (≈ $2.7/32$). A 4/32 drop is wider than the 2.7/32 break-even, so the roll is special and favors rolling (selling front, buying back) over holding.

# 5. Whole-loan trading mechanics

| Step / term | What it is and what to watch |
|----------------|--------------------------------------------------------------|
| Bid tape | The seller's loan-level file (balance, note rate, FICO, LTV/CLTV, DTI or DSCR, doc type, occupancy, property type, state, prepay penalty, lien, loan age, delinquency history). Bidders price off the tape; tape quality drives later kick-outs. |
| Stratification ("strats") | Summary tables of the tape by bucket (FICO bands, LTV bands, state, doc type, balance, DSCR bands) with weighted averages. Used to compare pools quickly and to spot concentrations. |
| Price talk and bidding | The seller or broker circulates guidance; bidders submit a price per 100 of UPB (often with a price grid by attribute), subject to due diligence. Bids may be "all or none" or allow loan-level carve-outs. |
| Pricing grids and LLPAs | A grid starts from a base price by coupon and adjusts for attributes. LLPAs (loan-level price adjustments) are add-ons or deductions for FICO, LTV, DSCR, loan size, property type, cash-out, IO, and so on. Agency LLPAs are published by Fannie Mae and Freddie Mac; Non-QM grids are investor-specific. |
| Best execution | Compare (a) selling whole loans, (b) securitizing (sell bonds, keep retained pieces), and (c) holding on balance sheet, each net of costs, financing, and risk retention capital. See the formula box below. |
| Servicing released vs retained | Released: the buyer gets the servicing rights and pays a servicing release premium (SRP) in the price. Retained: the seller keeps servicing (and its fee strip), and the buyer receives a net rate. |
| Settlement | Whole loans settle on an agreed date (often weeks after the trade) once diligence, the final tape, custodial file review and the purchase agreement are complete. Price × UPB plus accrued interest, with interest conventions set in the confirm. |
| Due diligence (TPR firms) | Third-party review firms check credit (underwriting to guidelines), compliance (TRID, ATR/QM, state rules) and valuation (appraisal review, desk reviews), plus data integrity against the tape. Rating agencies assign grades A–D; securitizations require TPR on a large share of loans. |
| Kick-outs | Loans dropped from the trade because diligence finds defects, data mismatches, or loans that went delinquent before settlement. Kick-outs change pool composition and can trigger re-pricing. |
| Reps and warrants | The seller's contractual statements about the loans (underwritten to guidelines, no fraud, compliant). Breach remedies are usually repurchase or make-whole. Rep strength and the seller's financial capacity matter as much as the reps themselves. |
| Early payment default (EPD) / early payoff (EPO) | EPD: the borrower misses one of the first few payments (often 1–3), triggering repurchase or a make-whole. EPO: the loan pays off soon after sale, and the seller refunds part of the premium. |
| Pipeline/lock hedging and pull-through | A rate lock is a free option the originator writes to the borrower. Pull-through is the share of locks expected to close (fallout = 1 − pull-through). Hedge the expected closings, adjusting as rates move: when rates fall, more locks close; when rates rise, more fall out. Agency pipelines are hedged with TBA; Non-QM pipelines usually with Treasury futures or swaps, or with forward commitments to aggregators. |
| Forward commitments: mandatory vs best efforts | Mandatory: seller commits to deliver a stated amount at a set price by a date and pays a pair-off fee for any shortfall if the market has moved against it. Best efforts: seller delivers only if the loan closes; no pair-off, but a lower price. |
| Warehouse financing | Short-term repo-style lines that fund loans until sale or securitization. Key terms: advance rate (haircut), rate (usually SOFR plus a margin), eligibility and aging limits, and margin calls when marks fall. |
| Mark-to-market | Positions are marked to fair value (often model-based, Level 2 or 3), using recent trades, bid tapes, securitization execution and dealer color. Marks drive warehouse margin and P&L. |

Table: Whole-loan trading steps and terms.

| Measure | Plain English | Math | Excel (named inputs) |
|-----------|-------------------------|-------------------------------|-------------------------------|
| Purchase proceeds | What the buyer pays: price times UPB plus accrued interest. | $\text{Proceeds}=\text{UPB}\cdot\dfrac{\text{Px}}{100}+\text{UPB}\cdot r_{\text{net}}\cdot\dfrac{d}{360}$ | `=UPB*Px/100+UPB*NetRate*AccrDays/360` (check confirm conventions) |
| Price with LLPAs | Base price plus the sum of attribute adjustments. | $\text{Px}=\text{Px}_{\text{base}}+\sum_i \text{LLPA}_i$ | `=BasePx+SUM(LLPA_Range)` |
| Net rate | Rate the buyer earns when servicing is retained by the seller. | $r_{\text{net}}=r_{\text{note}}-s_{\text{fee}}$ | `=NoteRate-ServFee` |
| Hedge amount for a pipeline | Hedge only the expected closings. | $H=\text{Locks}\times \text{PT}$ | `=LockedPipeline*PullThrough` |
| Pair-off cost (mandatory) | Cost of not delivering when prices have risen since the commitment. | $\text{Cost}=\max(0,P_{\text{mkt}}-P_{\text{commit}})\cdot\dfrac{\text{Shortfall}}{100}$ | `=MAX(0,MktPx-CommitPx)*Shortfall/100` |
| Securitization execution | Bond proceeds plus value of retained pieces, minus deal costs, per 100 of UPB. | $\text{Exec}=\dfrac{\sum_j B_j P_j/100+V_{\text{ret}}-\text{Costs}}{\text{UPB}}\times 100$ | `=(SUMPRODUCT(BondSize,BondPx)/100+RetainedValue-DealCosts)/UPB*100` |
| Warehouse advance and carry | Lender funds a percentage; interest accrues on the advance. | $\text{Adv}=\text{UPB}\cdot\dfrac{\text{Px}}{100}\cdot \text{AR}$; $\text{Int}=\text{Adv}\,(\text{SOFR}+m)\dfrac{d}{360}$ | `=UPB*Px/100*AdvRate`; `=Advance*(SOFR+Margin)*Days/360` |
| Mark-to-market P&L | Change in mark times UPB. | $\Delta \text{MV}=(P_{\text{new}}-P_{\text{old}})\cdot \text{UPB}/100$ | `=(NewMark-OldMark)*UPB/100` |

Table: Whole-loan formulas.

> **Worked example: best execution** (Example numbers, not market data). Pool \$300mm UPB. Securitization: bonds totaling \$276mm sold at an average price of 100.10 (\$276.276mm); retained classes and residual valued at \$22.0mm; deal costs \$1.35mm. Net = $276.276+22.0-1.35=\$296.926$mm, or 98.98 per 100 of UPB. A whole-loan bid of 99.25 beats it by about 27 cents, before considering financing, risk-retention capital and the time to reach the deal's closing date.

# 6. Securitization structure (Non-QM, RTL, CES/HELOC, prime)

| Term | What it is and why it matters |
|----------------|--------------------------------------------------------------|
| Senior/subordinate | Bonds are tranched by priority. Losses are allocated bottom-up (first to the unrated or lowest class); principal generally flows top-down. Typical Non-QM stacks: AAA (A-1), AA (A-2), A (A-3), then M-1 (BBB), B-1 (BB), B-2 (B), B-3/NR and an excess-cash class. |
| Credit enhancement (CE) | Protection a bond has before it takes a loss: subordination below it, overcollateralization (OC), and sometimes excess spread or reserve accounts. |
| OC and excess spread | OC = collateral balance above bond balance. Excess spread = interest collected minus bond interest and fees; depending on the deal, it covers losses, builds OC, or is released to the residual. |
| Sequential vs pro-rata | Sequential: all principal to the most senior class until it is retired. Pro-rata: principal is shared across classes. Many deals pay pro-rata (or a mix) while performance triggers pass and switch to sequential when a trigger fails. Prime jumbo deals use shifting interest, locking subordinate bonds out of prepayments for the first years. Read the presale waterfall for the specific deal. |
| Triggers | Tests that redirect cash to seniors when performance weakens: delinquency triggers (e.g., 60+ DQ above a threshold), cumulative loss triggers, and CE triggers (senior CE below a target). |
| Step-up coupons and calls | Many Non-QM senior classes step up their coupon (commonly by 100bp) if the issuer has not called the deal by a stated date (often around 4 years). The optional call is usually exercisable after a lockout date or once the pool falls below a percentage of its original balance; the clean-up call applies at a small remaining balance (often 10%). Calls are exercised when the issuer can re-securitize more cheaply, which shortens the bonds. |
| Rating classes and loss expectations | Agencies estimate expected loss and stressed losses at each rating level (AAA stress is the most severe house-price and default scenario). Each class's CE must cover the stressed loss for its rating. Compare CE across shelves and deals as a quick credit check. |
| Risk retention | US rules (Regulation RR) require the sponsor to retain 5% of the credit risk: vertical (5% of every class), horizontal (a first-loss piece with fair value of at least 5% of all interests), or an L-shaped combination. Agency deals are exempt, and so are pools of qualified residential mortgages (which equal QM); Non-QM deals are not exempt. Deals marketed to EU/UK investors may also need to satisfy their retention rules. |
| WAC and net WAC caps | Net WAC = pool WAC minus servicing, trustee and other fees. Many bonds pay the lesser of their stated coupon and the net WAC (a WAC cap), so prepayments of high-rate loans can reduce bond interest. |
| Servicer advancing | Servicers may advance missed principal and interest to keep bonds paid. Non-QM deals often use limited advancing (e.g., only up to 90–120 days delinquent) or no P&I advancing, because the loans are harder to liquidate and servicers want to limit liquidity strain. Limited advancing protects seniors from large reimbursement claims but means delinquencies cut interest to bonds sooner. |
| Deal documents | Presale (rating agency report before pricing, with pool strats and CE), term sheet and preliminary offering memorandum (most Non-QM is 144A), new issue report (NIR, after pricing), pooling and servicing agreement (PSA) or trust agreement, the deal model (e.g., Intex CDI), and monthly remittance reports ("remits") with balances, DQs, losses and trigger status. |
| RTL revolving structures | RTL deals often have a revolving period (commonly 18–36 months) in which paydowns buy new eligible loans, subject to concentration limits (e.g., ground-up construction share, single-borrower exposure, LTARV caps), followed by amortization. Credit depends on eligibility criteria and the sponsor, not just the initial pool. |
| CES/HELOC specifics | Second liens take losses first behind the senior lien, so severity is often near 100% on default. HELOC deals must handle future draws (funded by the sponsor or a variable funding note). |

Table: Securitization structure terms.

| Measure | Plain English | Math | Excel (named inputs) |
|-----------|-------------------------|-------------------------------|-------------------------------|
| Credit enhancement of a class | Subordinate classes below it plus OC, as a share of the pool. | $\text{CE}_j=\dfrac{\sum_{i\ \text{below}\ j}B_i+\text{OC}}{\text{Pool}}$ | `=(SUM(SubBelow)+OC)/PoolBal` |
| Overcollateralization | Collateral minus bonds. | $\text{OC}=\text{Pool}-\sum_i B_i$ | `=PoolBal-SUM(BondBal)` |
| Net WAC | Interest available to bonds per dollar of collateral. | $\text{NetWAC}=\text{WAC}-s_{\text{fee}}-t_{\text{fee}}$ | `=WAC-ServFee-TrusteeFee` |
| WAC-capped coupon | Bond coupon limited by net WAC. | $c_j=\min(c_{\text{stated}},\text{NetWAC})$ | `=MIN(StatedCpn,NetWAC)` |
| Excess spread (annualized) | Collateral interest left after paying bonds; $c_{\text{avg}}$ is the weighted-average bond coupon. | $\text{XS}\approx \text{NetWAC}-c_{\text{avg}}\cdot\dfrac{\sum B_i}{\text{Pool}}$ | `=NetWAC-WACoupon*SUM(BondBal)/PoolBal` |
| Trigger test | Pass or fail a delinquency test. | $\text{DQ}_{\text{60plus}}\le \text{Threshold}$ | `=IF(DQ60plus>DQ_Trigger,"FAIL","PASS")` |

Table: Structure formulas. Illustrative stack (Example numbers, not market data): AAA 75%, AA 7%, A 6%, BBB 5%, BB 3%, B 2%, NR 2% gives CE of 25% for AAA, 18% for AA, 12% for A, 7% for BBB, 4% for BB and 2% for B, assuming zero OC.

# 7. Credit metrics

| Measure | Plain English | Math | Excel (named inputs) |
|-----------|-------------------------|-------------------------------|-------------------------------|
| LTV | Loan amount over property value (the lower of appraised value and purchase price for purchases). | $\text{LTV}=\dfrac{\text{Loan}}{\min(\text{Appraisal},\text{Price})}$ | `=Loan/MIN(Appraisal,PurchPx)` |
| CLTV / HCLTV | All liens over value; HCLTV uses the full HELOC line, not just the drawn balance. | $\text{CLTV}=\dfrac{L_1+L_2}{\text{Value}}$ | `=(FirstLien+SecondLien)/Value` |
| Current LTV after HPA | LTV updated for paydown and house-price change. | $\text{LTV}_{\text{cur}}=\dfrac{B_{\text{cur}}}{V_0(1+\text{HPA})}$ | `=CurBal/(OrigValue*(1+HPA))` |
| DTI | Monthly debt payments over gross monthly income (full-doc and bank-statement loans). | $\text{DTI}=\dfrac{\text{Monthly debt}}{\text{Gross monthly income}}$ | `=MonthlyDebt/GrossMoIncome` |
| DSCR | Property rent over the full housing payment (PITIA: principal, interest, taxes, insurance, association dues). Some lenders use NOI over debt service for 5+ unit or commercial-style loans. | $\text{DSCR}=\dfrac{\text{Gross monthly rent}}{\text{PITIA}}$ | `=GrossRent/(PI+Taxes+Ins+HOA)` with `PI=PMT(Rate/12,360,-Loan)` or IO `=Loan*Rate/12` |
| RTL leverage | Loan to cost and loan to after-repair value. | $\text{LTC}=\dfrac{\text{Loan}}{\text{Purchase}+\text{Rehab}}$, $\text{LTARV}=\dfrac{\text{Loan}}{\text{ARV}}$ | `=Loan/(PurchPx+RehabBudget)`; `=Loan/ARV` |
| Roll rate | Share of loans in one delinquency bucket that move to the next bucket a month later. $N_{30\to 60}$ = loans 30 days delinquent last month that are 60 days delinquent now. | $\text{Roll}_{30\to 60}=\dfrac{N_{30\to 60}}{N_{30,\,t-1}}$ | `=Rolled_30_to_60/Prior_30DQ` |
| MDR from CDR | Monthly default rate. | $\text{MDR}=1-(1-\text{CDR})^{1/12}$ | `=1-(1-CDR)^(1/12)` |
| Severity (loss given default) | Loss as a share of defaulted balance, including advances and costs. | $\text{Sev}=\dfrac{\text{UPB}+\text{Adv}+\text{Costs}-\text{Proceeds}}{\text{UPB}}$ | `=(UPB+Advances+LiqCosts-NetProceeds)/UPB` |
| Annual loss rate | Defaults times severity. | $\text{Loss}\approx \text{CDR}\times \text{Sev}$ | `=CDR*Severity` |
| Cumulative loss | Total losses over original balance; not simply years × annual rate because the balance shrinks. | $\text{CumLoss}=\dfrac{\sum_t D_t\,\text{Sev}}{B_0}$ | `=SUM(LossCol)/OrigBal` |

Table: Credit formulas. Examples (Example numbers, not market data): rent \$3,000 over PITIA \$2,500 gives DSCR 1.20; CDR 2% with 30% severity gives about 0.6% annual loss; a 75% LTV loan after a −10% HPA shock is at $75\%/0.90=83.3\%$ current LTV.

| Topic | What to know |
|----------------|--------------------------------------------------------------|
| FICO | Credit score (300–850). Pool weighted-average FICO and the share below thresholds (e.g., <680) are first-pass credit indicators. |
| Doc types | Full doc (W-2s, tax returns), bank statement (12 or 24 months of deposits to estimate self-employed income), P&L (CPA- or borrower-prepared profit and loss), asset depletion/asset utilization (income imputed from liquid assets), DSCR (no personal income; underwritten to the property's rent), plus 1099 and written VOE variants. Alternative documentation typically carries higher expected defaults, offset by lower LTVs and higher rates. |
| DQ buckets | 30, 60, 90+ days delinquent, plus foreclosure, REO and bankruptcy. Under the MBA convention a loan is 30 days delinquent once a payment is missed at month-end; the older OTS convention reports one month later. Check which convention a remit uses. |
| Modification and forbearance | Modifications change loan terms (rate, term, principal deferral). Forbearance pauses payments temporarily. Both affect DQ reporting, cash flow to bonds and, in some deals, trigger calculations. |
| HPA sensitivity | House-price changes drive current LTV, which drives both default frequency and severity. Second liens and high-LTV loans are the most sensitive. RTL value depends on achieving the after-repair value and selling in time. |

Table: Credit concepts.

# 8. Rates and macro concepts

| Concept | Definition and formula |
|----------------|--------------------------------------------------------------|
| Curve slope | 2s10s = $y_{10}-y_{2}$ (bp), Excel `=(UST_10Y-UST_2Y)*10000`. 5s30s = $y_{30}-y_{5}$, Excel `=(UST_30Y-UST_5Y)*10000`. Positive = upward-sloping; negative = inverted. |
| Bear steepener | Yields rise, long end rises more (curve steepens). Often on inflation, supply or term-premium worries. |
| Bull steepener | Yields fall, short end falls more. Typical when the market prices Fed cuts. |
| Bear flattener | Yields rise, short end rises more. Typical when the market prices Fed hikes. |
| Bull flattener | Yields fall, long end falls more. Often a flight to quality or weaker long-run growth and inflation expectations. |
| Term premium | Extra yield investors demand to hold a long bond instead of rolling short bills; estimated by models (e.g., the New York Fed's ACM model), not observed. |
| Real yields and breakevens | Real yield = TIPS yield. Breakeven inflation = $y_{\text{nominal}}-y_{\text{real}}$, Excel `=NomYld-TIPSYld`. |
| Fed funds vs SOFR | The FOMC sets a target range for fed funds (unsecured overnight interbank lending); the effective fed funds rate is published by the New York Fed. SOFR is the secured overnight rate on Treasury repo, also published by the New York Fed, and is the benchmark for swaps, floating-rate loans and most new floating bonds. |
| Swap spreads | Swap rate minus Treasury yield at the same tenor, $\text{SS}=y_{\text{swap}}-y_{\text{UST}}$. They have been negative at long tenors in recent years, reflecting Treasury supply and dealer balance-sheet costs. They matter when hedging with swaps versus futures. |
| Data surprises | CPI and PCE (inflation), nonfarm payrolls (NFP) and the unemployment rate are the biggest scheduled rate movers. Stronger-than-expected data usually push yields up, most at the front end because they change expected Fed policy; weaker data push yields down. The market reacts to the surprise versus consensus, not the level. CPI and NFP are released at 7:30 am CT. |

Table: Rates and macro concepts.

# 9. Risk and P&L

| Measure | Plain English | Math | Excel (named inputs) |
|-----------|-------------------------|-------------------------------|-------------------------------|
| P&L attribution | Break daily or monthly P&L into its sources; the residual should be small. Use the net (position minus hedge) DV01 for the rates piece. | $\Delta \text{PL}=\text{Carry}+\text{PL}_r+\text{PL}_s+\text{PL}_{\text{pp}}+\text{PL}_{\text{cr}}+\epsilon$, where $\text{PL}_r=-\text{DV01}_{\text{net}}\,\Delta r_{\text{bp}}$ and $\text{PL}_s=-\text{SDV01}\,\Delta s_{\text{bp}}$ | `=Carry-NetDV01*dRates_bp-SprdDV01*dSprd_bp+Prepay_PL+Credit_PL` |
| Spread P&L | Loss from spread widening. | $\text{PL}_s=-D_s\cdot \text{MV}\cdot\Delta s$ | `=-SprdDur*MV*dSprd_bp/10000` |
| Parametric VaR | Loss not exceeded with a given confidence, assuming normal moves. | $\text{VaR}=z_{\alpha}\cdot\sigma_{\text{bp}}\cdot \text{DV01}\cdot\sqrt{h}$ | `=NORM.S.INV(0.99)*Sigma_bp*DV01*SQRT(Days)` |
| Hedge effectiveness | How much of the position's value change the hedge explains. | $R^2$ of $\Delta V_{\text{pos}}$ on $\Delta V_{\text{hedge}}$; offset = $-\Delta V_{\text{hedge}}/\Delta V_{\text{pos}}$ | `=RSQ(PosChg,HedgeChg)`; `=-HedgeChg/PosChg` (80–125% is a common accounting band) |
| Scenario P&L with convexity | Rate-shock P&L including curvature. | $\text{PL}=\text{MV}\left(-D\Delta y+\frac{1}{2} C\Delta y^2\right)$ | `=MV*(-EffDur*Shock+0.5*Convexity*Shock^2)` |

Table: Risk formulas. Examples (Example numbers, not market data): DV01 \$50,960, daily rate vol 7bp, 99% one-day VaR ≈ $2.33\times 7\times \text{50,960}\approx\$\text{831,000}$ unhedged. Spread duration 5.0 on \$98mm with +20bp widening loses $5.0\times 98\text{mm}\times 0.0020=\$\text{980,000}$.

| Risk | What to know |
|----------------|--------------------------------------------------------------|
| P&L sources | **Carry** (coupon minus financing, plus paydown effects), **rates** (curve moves net of hedges), **spread** (OAS/ZV changes), **prepay** (speeds faster or slower than priced; hurts premiums when fast, discounts when slow), **credit** (DQs, losses, rating actions), **hedge** P&L and **roll** of hedges. |
| Basis risk | Whole loans and non-agency bonds are hedged with Treasury futures, swaps or TBA, but their spreads move independently of the hedge. A hedge removes rate risk, not spread or credit risk. TBA hedges add mortgage-basis exposure; swap hedges add swap-spread exposure. |
| Liquidity and bid-ask | Whole loans and subordinate bonds trade by auction or bilaterally, with wide bid-ask and slow execution. Marks can lag; exits in stress cost more than the quoted bid-ask suggests. |
| Stress scenarios | Standard set: parallel ±100bp (and ±50bp), steepener/flattener, spreads +25/+50/+100bp, prepay shock (speeds ×0.5 and ×1.5 or ±10 CPR), CDR and severity shocks, HPA −10% to −20%, vol shock. Report P&L, duration change and margin impact. |
| VaR limits | VaR assumes recent history and normal moves; it understates tail risk and does not capture liquidity or jump risk well. Pair it with stress tests. |

Table: Risk concepts.

# 10. Building it in Excel

The companion workbook **trader-calcs.xlsx** follows the recommendations below, with live formulas and named ranges that match the names used in this cheat sheet. Tabs: Inputs_README (color key, list of all named ranges), Duration_DV01_Hedge, Convexity_Bump, Prepay_Conversions, CashFlow_Model (360 months), Spreads and DSCR_LTV. All inputs are illustrative (Example numbers, not market data) and appear in blue font on a light-yellow fill; replace them with your own. Avoid names that look like cell addresses (for example `UST10` or `DV01` are real cells in Excel), which is why the workbook uses `UST_10Y` and `Position_DV01`.

## 10.1 Layout and conventions

| Block | What goes there | Tips |
|----------------|----------------------------------|----------------------------------------------|
| Inputs | Every assumption in one block at the top-left of each tab (face, price, yields, CPR, CDR, severity, fees, bumps). | Blue font on light-yellow fill for inputs; black for formulas; green for links to other tabs. Never type a number inside a formula. |
| Named ranges | Name each input cell (Formulas › Define Name), e.g. `EffDur`, `MV`, `CPR`, `Bump`. | Names make formulas readable (`=EffDur*MV*0.0001`) and survive row inserts. Keep names unique across the workbook. |
| Calculations | Intermediate steps in clearly labeled rows or a cash-flow table. | One formula per column, copied down unchanged. Avoid merged cells in calculation areas. |
| Outputs | Key results boxed at the top (price, yield, WAL, DV01, hedge contracts). | Add check cells (e.g., total principal = original balance) that show "OK" or "CHECK". |
| Notes | Units and conventions next to each input (decimal vs bp, 30/360 vs actual). | State the source and date of every input you replace with real data. |

Table: Recommended workbook layout.

## 10.2 Monthly cash-flow model with CPR, CDR and severity

Inputs (named): `OrigBal`, `WAC` (gross note rate), `ServFee`, `Term` (months), `CF_CPR`, `CF_CDR`, `Severity`, `CF_Yield` (monthly-compounded), `CF_Price`. Row 1 of the table is month 0; months 1–360 follow. The model assumes defaults are liquidated immediately with no servicer advancing and no recovery lag, which is a common simplification; real deal models add lags, advancing and delinquency pipelines.

| Col | Column | Formula (month row, copied down) |
|------|--------------|---------------------------------------------------------------|
| A | Month | 0, 1, 2, … 360 |
| B | Beginning balance | Month 1: `=OrigBal`; later months: `=O(prior row)` |
| C | SMM | `=1-(1-CF_CPR)^(1/12)` (or a vector of CPRs by month) |
| D | MDR | `=1-(1-CF_CDR)^(1/12)` |
| E | Defaults | `=B*D` |
| F | Performing balance | `=B-E` |
| G | Scheduled payment | `=IF(F>0.005,PMT(WAC/12,Term-A+1,-F),0)` (re-amortizes the surviving balance over the remaining term) |
| H | Gross interest | `=F*WAC/12` |
| I | Net interest (to investor) | `=F*(WAC-ServFee)/12` |
| J | Scheduled principal | `=G-H` (equivalently `=PPMT(WAC/12,1,Term-A+1,-F)`) |
| K | Prepayments | `=(F-J)*C` |
| L | Loss | `=E*Severity` |
| M | Recovery | `=E-L` |
| N | Total principal to investor | `=J+K+M` |
| O | Ending balance | `=F-J-K` |
| P | Net cash flow | `=I+N`; month 0 row: `=-CF_Price/100*OrigBal` |
| Q | Discount factor | `=(1+CF_Yield/12)^-A` |
| R | PV | `=P*Q` |

Table: Cash-flow model columns.

**Outputs.** Price from yield: `=SUMPRODUCT(P_month1:P_month360,Q_month1:Q_month360)/OrigBal*100`, or equivalently `=NPV(CF_Yield/12,P_month1:P_month360)/OrigBal*100` (Excel's NPV discounts the first value by one period, which is correct when the range starts at month 1). Yield from price: `=IRR(P_month0:P_month360)*12` gives the monthly-compounded mortgage yield; convert with `=2*((1+Y/12)^6-1)` for BEY. Alternatively, use Goal Seek (Data › What-If Analysis › Goal Seek): set the price-from-yield cell to the target price by changing `CF_Yield`. WAL: `=SUMPRODUCT(A,N)/SUM(N)/12`. Cumulative loss: `=SUM(L)/OrigBal`. Checks: `=SUM(N)+SUM(L)` should equal `OrigBal`.

**Dated cash flows.** When cash flows fall on actual dates (settlement mid-month, irregular first period), use `=XNPV(Rate,Values,Dates)` and `=XIRR(Values,Dates)`. Both use an annual effective rate on an actual/365 basis, so convert: `=XNPV(EFFECT(CF_Yield,12),Values,Dates)`, and `=NOMINAL(XIRR(Values,Dates),12)` for a monthly-compounded yield.

## 10.3 Built-in functions worth knowing

| Function | Use | Example |
|-------------|----------------------------------|----------------------------------------------|
| `PRICE` / `YIELD` | Treasury or bullet-bond price from yield and back | `=PRICE(Settle,Maturity,Cpn,Yld,100,2,1)`; `=YIELD(Settle,Maturity,Cpn,Px,100,2,1)` (basis 1 = actual/actual) |
| `DURATION` / `MDURATION` | Macaulay and modified duration of a bullet bond | `=MDURATION(Settle,Maturity,Cpn,Yld,2,1)` |
| `PMT` / `IPMT` / `PPMT` | Level mortgage payment and its interest/principal split | `=PMT(Rate/12,360,-Loan)`; `=IPMT(Rate/12,Month,360,-Loan)`; `=PPMT(Rate/12,Month,360,-Loan)` |
| `RATE` | Note rate implied by a payment | `=RATE(360,-Payment,Loan)*12` |
| `NPV` / `XNPV` / `IRR` / `XIRR` | Price from yield and yield from price | See 10.2 |
| `EFFECT` / `NOMINAL` | Compounding conversions (monthly ↔ semiannual) | `=NOMINAL(EFFECT(MtgYld,12),2)` = BEY |
| `DOLLARDE` / `DOLLARFR` | 32nds ↔ decimal | `=DOLLARDE(98.16,32)` = 98.50 |
| `SLOPE` / `RSQ` / `NORM.S.INV` | Empirical duration, hedge effectiveness, VaR z-score | `=-SLOPE(Returns,dY)`; `=RSQ(PosChg,HedgeChg)`; `=NORM.S.INV(0.99)` |

Table: Excel built-ins.

## 10.4 Effective duration and convexity by bumping ±25bp

1. Price the bond at the base yield: $P_0$ (cell `P_0`).
2. Shift yields down 25bp and re-price, re-running the cash flows with the prepay speed the model implies at the lower rate: `P_dn`. Repeat up 25bp: `P_up`. For a Treasury the cash flows do not change, so `=PRICE(Settle,Maturity,Cpn,Yld-Bump,100,2,1)` and `=PRICE(…,Yld+Bump,…)` do the job.
3. Effective duration `=(P_dn-P_up)/(2*P_0*Bump)`; effective convexity `=(P_dn+P_up-2*P_0)/(P_0*Bump^2)`, with `Bump = 0.0025`.
4. Example (Example numbers, not market data): $P_0=98.00$, $P_{\text{dn}}=99.25$, $P_{\text{up}}=96.70$ give $D_{\text{eff}}=2.55/(2\times 98\times 0.0025)=5.20$ and $C_{\text{eff}}=(99.25+96.70-196)/(98\times 0.0025^2)=-81.6$.
5. If you bump only the discount yield and keep the same CPR, you get a static (modified-style) duration, not effective duration. To approximate effective duration in the cash-flow model, assign a faster CPR to the down case and a slower CPR to the up case (from a prepay model or an S-curve assumption) and re-run.

## 10.5 DV01 hedge-ratio calculator

Inputs (named): `Face`, `Price`, `EffDur`, `TY_DV01`, `FV_DV01`, `Swap10_DV01_per_mm`, `CTD_DV01`, `CTD_CF`, `Split10` (share of DV01 hedged in 10s).

| Output | Excel formula |
|----------------------|------------------------------------------------------------|
| Market value | `=Face*Price/100` (name it `MV`) |
| Position DV01 | `=EffDur*MV*0.0001` (name it `Position_DV01`) |
| 10Y futures to sell | `=ROUND(Position_DV01*Split10/TY_DV01,0)` (`TY_Contracts`) |
| 5Y futures to sell | `=ROUND(Position_DV01*(1-Split10)/FV_DV01,0)` (`FV_Contracts`) |
| Pay-fixed 10Y swap notional (alternative) | `=Position_DV01/Swap10_DV01_per_mm*1000000` |
| Futures DV01 from CTD | `=CTD_DV01/CTD_CF` |
| Residual DV01 after futures | `=Position_DV01-TY_Contracts*TY_DV01-FV_Contracts*FV_DV01` (should be near zero) |

Table: DV01 hedge-ratio calculator.

## 10.6 Scenario tables (Data Table)

To see price across rate shifts and prepay speeds: place yields across a row (e.g., base yield −100, −50, 0, +50, +100bp, entered as decimals) and CPRs (e.g., 5%–30%) down a column; in the top-left corner cell enter `=PriceFromYield`. Select the block and choose Data › What-If Analysis › Data Table, with row input cell = `CF_Yield` and column input cell = `CF_CPR`. The input cells must be on the same sheet as the table. Data Tables recalculate the whole model for each cell and can slow a workbook; set calculation to "Automatic except for data tables" and press F9 when needed. For quick duration-and-convexity scenarios, a plain formula grid works: `=MV*(-EffDur*Shock+0.5*Convexity*Shock^2)` (the workbook includes one).

## 10.7 Tips

- Color-code inputs and keep them in one place; never hardcode a number inside a formula.
- Keep units explicit: decimals for rates, bp only in labeled cells, and convert with `/10000`.
- Use `XNPV`/`XIRR` when dates matter; remember they assume annual compounding on actual/365.
- Add check totals: principal paid plus losses equals original balance; ending balance reaches zero at maturity; hedge residual DV01 is near zero.
- Wrap end-of-life formulas in `IF` tests to avoid `#NUM!` when the balance hits zero.
- Document the date and source of every input you replace with real data, and save a dated copy before changing assumptions.

# 11. Glossary and "PM asks → concept" table

| Term | Meaning | Term | Meaning |
|---------|--------------------------------|---------|--------------------------------|
| Accrued interest | Interest earned since the last payment date, paid by the buyer at settlement. | Non-QM | Loans outside the QM definition: bank-statement, DSCR, asset-depletion, recent credit events, higher DTI. |
| ARM | Adjustable-rate mortgage; rate resets off an index (now usually SOFR) plus a margin after an initial fixed period. | OAS | Option-adjusted spread. |
| ATR/QM | The CFPB's Ability-to-Repay rule and its Qualified Mortgage safe harbor; Non-QM loans fall outside the QM definition. | Pay-up | Premium over TBA paid for a specified pool with favorable prepay characteristics (low balance, investor, high LTV, certain states). |
| Bid tape | Seller's loan-level data file used for bidding. | PITIA | Principal, interest, taxes, insurance and association dues. |
| CC (current coupon) | The agency MBS coupon that would trade at par, interpolated between TBA coupons; the benchmark for MBS spreads. | Presale | Rating agency report published before a deal prices, with pool strats, CE and analysis. |
| CDR | Constant (conditional) default rate, annualized. | Pull-through | Share of rate locks that close; fallout is the rest. |
| CES | Closed-end second lien: a fixed second mortgage behind an existing first lien. | Remit | Monthly remittance (distribution) report for a securitization. |
| CPR | Conditional prepayment rate, annualized. | REO | Real estate owned: property taken back through foreclosure. |
| CRT | Credit risk transfer bonds (Fannie Mae CAS, Freddie Mac STACR) that pass agency credit risk to investors. | Reps and warrants | Seller representations about the loans, backed by repurchase remedies. |
| CTD | Cheapest-to-deliver bond into a Treasury futures contract. | RTL | Residential transition loan: short-term fix-and-flip, bridge or construction loan to investors. |
| CUSIP | Nine-character security identifier for bonds and pools. | Servicing released / retained | Whether servicing rights transfer to the loan buyer (with an SRP) or stay with the seller. |
| DSCR loan | Investor loan underwritten to property rent over PITIA rather than borrower income. | SMM | Single monthly mortality; monthly prepayment rate. |
| Factor | Current balance divided by original balance; published monthly for each pool or bond. | Specified pool | Agency pool traded by its specific characteristics rather than as generic TBA. |
| G-fee | Guarantee fee charged by Fannie Mae and Freddie Mac, embedded in the borrower's rate. | SRP | Servicing release premium paid for servicing rights. |
| HELOC | Home equity line of credit; revolving second lien with a draw period. | TBA | To-be-announced forward market for agency MBS; pools announced 48 hours before settlement. |
| IO | Interest-only, either a loan feature or a bond that receives only interest. | TPR | Third-party review (due diligence) firms. |
| Jumbo | Loan above the conforming loan limit; prime jumbo is high-FICO, low-LTV, full-doc. | UPB | Unpaid principal balance. |
| LLPA | Loan-level price adjustment for attributes such as FICO, LTV, DSCR or loan size. | WAC | Weighted-average coupon (gross note rate) of a pool. |
| MSR | Mortgage servicing rights: the right to the servicing fee in exchange for servicing the loan; valued as an IO-like asset. | WALA | Weighted-average loan age, in months. |
| Net WAC | Pool WAC minus servicing and other fees. | WAL | Weighted-average life of principal, in years. |
| NIR | New issue report published by a rating agency after a deal prices. | WAM | Weighted-average remaining maturity, in months. |

Table: Desk glossary.

| PM asks | Concept / metric to use | Section |
|-------------------------------|-------------------------------------------------|------|
| "How much do we lose if rates go up 50?" | DV01 × 50 plus the convexity term; scenario P&L | 1, 2, 9 |
| "How many futures do we need to hedge?" | Position DV01 ÷ contract DV01, split by key rate durations | 1 |
| "Why did the hedged book lose money in a big rally?" | Negative convexity and rebalancing cost; prepay model duration shortening | 2 |
| "What happens to our pools if vol spikes?" | Short option: OAS vs ZV, option cost, MOVE/swaption vol | 2, 4 |
| "Are speeds going to pick up?" | Refi incentive (WAC − market rate), S-curve, burnout, penalty roll-offs | 3 |
| "What's the WAL at 15 CPR?" | Cash-flow model WAL at the stated CPR | 3, 10 |
| "Is this bond cheap?" | OAS vs comparable bonds; ZV and nominal spread for context; same curve and prepay assumption | 4 |
| "Where are mortgage rates versus 10s?" | Mortgage-to-10Y gap = primary-secondary + secondary spread | 4 |
| "What's our carry?" | Coupon minus financing plus paydown effect; roll specialness for TBA | 4, 9 |
| "Should we sell loans or securitize?" | Best execution: securitization net proceeds vs whole-loan bid vs hold | 5 |
| "How much of the pipeline should we hedge?" | Locks × pull-through, adjusted as rates move | 5 |
| "How protected is the AAA?" | CE (subordination + OC) vs rating agency stressed loss; triggers | 6 |
| "When could this deal get called?" | Optional call date and pool factor test, step-up date, refinancing economics | 6 |
| "How is the DSCR book performing?" | 60+ DQ, roll rates, CDR, severity, cumulative loss by vintage | 7 |
| "What if home prices fall 10%?" | Current LTV after HPA shock; default and severity stress | 7, 9 |
| "What moved P&L today?" | Attribution: carry, rates, spread, prepay, credit, hedge | 9 |
| "What's our worst case?" | Stress scenarios plus VaR, with liquidity caveats | 9 |

Table: PM questions mapped to concepts.
