# Financial Ratio Formulas

Standard definitions for all financial ratios used in this skill. Use these exact formulas for consistency.

---

## Profitability Ratios

| Ratio | Formula | Notes |
|-------|---------|-------|
| **Gross Margin** | (Revenue − COGS) / Revenue | COGS = Cost of Goods Sold / Cost of Revenue |
| **Operating Margin** | Operating Income / Revenue | Operating Income = EBIT |
| **EBITDA Margin** | EBITDA / Revenue | EBITDA = EBIT + D&A |
| **Net Profit Margin** | Net Income / Revenue | After-tax |
| **Return on Equity (ROE)** | Net Income / Average Shareholders' Equity | Use average of beginning + ending equity |
| **Return on Assets (ROA)** | Net Income / Average Total Assets | |
| **Return on Invested Capital (ROIC)** | NOPAT / Average Invested Capital | NOPAT = EBIT × (1 − Tax Rate); Invested Capital = Total Equity + Total Debt − Cash |
| **Return on Capital Employed (ROCE)** | EBIT / Capital Employed | Capital Employed = Total Assets − Current Liabilities |
| **Asset Turnover** | Revenue / Average Total Assets | Measures efficiency of asset use |

---

## Liquidity Ratios

| Ratio | Formula | Healthy Range |
|-------|---------|---------------|
| **Current Ratio** | Current Assets / Current Liabilities | 1.5–3.0× |
| **Quick Ratio** | (Cash + Short-term Investments + Receivables) / Current Liabilities | ≥ 1.0× |
| **Cash Ratio** | Cash + Cash Equivalents / Current Liabilities | Depends on sector |
| **Operating Cash Flow Ratio** | Operating Cash Flow / Current Liabilities | > 1.0× preferred |

---

## Leverage / Solvency Ratios

| Ratio | Formula | Notes |
|-------|---------|-------|
| **Debt-to-Equity (D/E)** | Total Debt / Total Shareholders' Equity | Total Debt = Short-term + Long-term debt |
| **Debt-to-Assets** | Total Debt / Total Assets | |
| **Net Debt** | Total Debt − Cash & Equivalents | Can be negative (net cash) |
| **Net Debt / EBITDA** | Net Debt / EBITDA | < 2× comfortable; > 4× high risk |
| **Interest Coverage** | EBIT / Interest Expense | > 3× comfortable; < 1.5× dangerous |
| **Debt Service Coverage (DSCR)** | Net Operating Income / Total Debt Service | > 1.25× typically required |
| **Equity Multiplier** | Total Assets / Total Equity | Higher = more leverage |

---

## Efficiency Ratios

| Ratio | Formula | Notes |
|-------|---------|-------|
| **Receivables Days (DSO)** | (Accounts Receivable / Revenue) × 365 | Days Sales Outstanding |
| **Payables Days (DPO)** | (Accounts Payable / COGS) × 365 | Days Payable Outstanding |
| **Inventory Days (DIO)** | (Inventory / COGS) × 365 | Days Inventory Outstanding |
| **Cash Conversion Cycle** | DSO + DIO − DPO | Lower is better |
| **Inventory Turnover** | COGS / Average Inventory | |
| **Receivables Turnover** | Revenue / Average Accounts Receivable | |
| **Fixed Asset Turnover** | Revenue / Average Net Fixed Assets (PP&E) | |

---

## Valuation Ratios

| Ratio | Formula | Notes |
|-------|---------|-------|
| **P/E Ratio** | Market Price per Share / EPS | Use trailing 12-month EPS for TTM; forward EPS for forward P/E |
| **EV/EBITDA** | Enterprise Value / EBITDA | EV = Market Cap + Net Debt + Minority Interest + Preferred |
| **EV/EBIT** | Enterprise Value / EBIT | Better for capex-heavy businesses |
| **EV/Revenue** | Enterprise Value / Revenue | Useful for unprofitable companies |
| **Price-to-Book (P/B)** | Market Price per Share / Book Value per Share | |
| **Price-to-Sales (P/S)** | Market Cap / Revenue | |
| **Price-to-FCF** | Market Cap / Free Cash Flow | FCF = Operating CF − CapEx |
| **EV/FCF** | Enterprise Value / Free Cash Flow | |
| **PEG Ratio** | P/E / EPS Growth Rate (%) | < 1.0 often considered undervalued |
| **Dividend Yield** | Annual Dividends per Share / Market Price | |
| **Earnings Yield** | EPS / Market Price | Inverse of P/E |
| **FCF Yield** | FCF per Share / Market Price | |

---

## Enterprise Value Calculation

```
Enterprise Value (EV) =
    Market Capitalization
  + Total Debt (short-term + long-term)
  + Preferred Stock
  + Minority Interest
  − Cash & Cash Equivalents
  − Short-term Investments
```

---

## Free Cash Flow Definitions

| Type | Formula |
|------|---------|
| **Levered FCF** | Operating Cash Flow − CapEx |
| **Unlevered FCF (FCFF)** | EBIT × (1 − Tax Rate) + D&A − ΔWorking Capital − CapEx |
| **Equity FCF (FCFE)** | Net Income + D&A − ΔWorking Capital − CapEx + Net Borrowing |

---

## Dupont Analysis (ROE Decomposition)

```
ROE = Net Margin × Asset Turnover × Equity Multiplier

    = (Net Income / Revenue) × (Revenue / Assets) × (Assets / Equity)
```

Use 3-factor DuPont to understand what's driving ROE changes over time.

---

## Growth Metrics

| Metric | Formula |
|--------|---------|
| **Revenue Growth** | (Current Revenue / Prior Revenue) − 1 |
| **EPS Growth** | (Current EPS / Prior EPS) − 1 |
| **CAGR** | (Ending Value / Beginning Value)^(1/n) − 1 |
| **Organic Growth** | Total Growth − Acquisition Contribution − Currency Effect |

---

## Notes on Usage

- Always use **average** values (beginning + ending ÷ 2) for balance sheet items in ratio denominators when computing turnover/return ratios
- For TTM (trailing twelve months) calculations, use: Last Annual + Most Recent Two Quarters − Same Two Quarters Prior Year
- When financial statements use different fiscal year ends, note the mismatch in your analysis
- EBITDA adjustments: Use reported EBITDA unless management adjustments are clearly explained; flag "adjusted" vs. "reported" distinctions
