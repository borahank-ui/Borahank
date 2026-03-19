---
name: financial-analysis
description: Perform financial analysis using the Claude API. Use when the user wants to analyze financial statements, evaluate investments, assess company performance, or generate financial reports.
---

# Financial Analysis Skill

Perform deep, structured financial analysis powered by Claude Opus 4.6 with adaptive thinking.

**Setup:** If the user asks you to set up this skill (dependencies, API key, etc.), see `README.md` for instructions.

---

## Core Philosophy

**Analysis should CONCLUDE, not just DESCRIBE.**

Financial analysis is not data formatting. It's synthesis that reveals what the numbers mean, what drives performance, and what an investor or manager should do. Every section should answer: *"So what?"*

**The Insight Test**: If you removed all the numbers, would the analysis still communicate actionable meaning? If not, add judgment. Numbers are evidence; analysis is the argument.

**The Decision Test**: Could someone act on this analysis? A good report tells you what to buy, sell, hold, fix, or investigate — not just what happened.

---

## Scope of Analysis

This skill handles:

- **Fundamental analysis** — Income statements, balance sheets, cash flow statements
- **Ratio analysis** — Profitability, liquidity, leverage, efficiency, valuation
- **Trend analysis** — Multi-period performance and trajectory
- **Comparative analysis** — Peer benchmarking, industry averages
- **Valuation** — DCF estimates, comparable multiples, intrinsic value ranges
- **Risk assessment** — Financial health, debt sustainability, red flags
- **Portfolio analysis** — Holdings allocation, diversification, risk/return
- **Earnings analysis** — Beat/miss vs. expectations, guidance interpretation

---

## Workflow (Follow This Order)

### Step 1: Understand What's Being Analyzed

Before running any analysis, clarify:
- **What entity?** Company name, ticker, or portfolio description
- **What time period?** Most recent quarter, annual, multi-year, YTD
- **What data is available?** Financial statements, market data, or just a description
- **What's the question?** Investment decision, internal review, risk check, peer comparison

If financial data is provided as text, a PDF, or a file — extract and structure it before analyzing.

### Step 2: Extract and Structure the Data

When raw financials are provided:
1. Parse all line items into structured form (Revenue, COGS, EBITDA, Net Income, Assets, Liabilities, Cash Flows, etc.)
2. Identify the reporting currency and units (millions, billions)
3. Note the fiscal year end and any non-standard periods
4. Flag any missing or unusual items

### Step 3: Run the Analysis with Claude API

Use the Python analysis script (`references/analyze.py`) to invoke Claude Opus 4.6 with adaptive thinking. The script:
- Sends structured financial data to the Claude API
- Uses adaptive thinking for complex multi-step reasoning
- Streams the response to handle long analytical output
- Returns a structured report with sections

See `references/analyze.py` for the implementation.

### Step 4: Structure the Output

Every financial analysis report must include the sections relevant to the request. See **Output Format** below.

### Step 5: Validate the Analysis

After generating:
1. Verify all ratios and calculations are mathematically consistent
2. Check that conclusions are supported by the numbers cited
3. Ensure recommendations are specific and actionable
4. Confirm any red flags are explained with evidence

---

## Running Analysis via Claude API

Use `references/analyze.py` to run analysis programmatically:

```bash
cd .claude/skills/financial-analysis/references
pip install anthropic
python analyze.py --data "path/to/financials.txt" --type "fundamental" --company "ACME Corp"
```

Or invoke directly from Python:

```python
from references.analyze import run_financial_analysis

result = run_financial_analysis(
    financial_data=your_data_string,
    analysis_type="fundamental",  # fundamental | valuation | portfolio | risk
    company_name="ACME Corp",
    period="FY2024",
)
print(result)
```

---

## Output Format

### Full Fundamental Analysis Report

```
# Financial Analysis: [Company Name]
**Period:** [FY/Q]  **Prepared:** [Date]  **Currency:** [USD/EUR/etc.]

## Executive Summary
2-3 sentences: What is the headline finding? Bullish/bearish/neutral and why.

## Key Metrics Snapshot
| Metric | Value | vs. Prior Period | vs. Industry |
|--------|-------|-----------------|--------------|
| Revenue | $X | +Y% | Above/Below avg |
| EBITDA Margin | X% | ... | ... |
| Net Income | $X | ... | ... |
| EPS | $X | ... | ... |
| P/E Ratio | X | ... | ... |
| Debt/Equity | X | ... | ... |
| Current Ratio | X | ... | ... |
| FCF Yield | X% | ... | ... |

## Profitability Analysis
- Gross margin trend and drivers
- Operating leverage (fixed vs. variable cost structure)
- EBITDA quality (non-cash adjustments, one-time items)
- Net income drivers vs. operating income

## Balance Sheet Health
- Liquidity position (cash, current ratio, quick ratio)
- Debt structure (short-term vs. long-term, covenants, maturities)
- Asset quality (receivables days, inventory turnover)
- Working capital trends

## Cash Flow Analysis
- Operating cash flow vs. reported earnings (cash conversion)
- CapEx requirements and maintenance vs. growth split
- Free cash flow generation and sustainability
- Capital allocation (dividends, buybacks, M&A, debt paydown)

## Valuation
- Current trading multiples (P/E, EV/EBITDA, P/FCF, P/S)
- Historical multiple range
- Peer comparison multiples
- Intrinsic value estimate (DCF range if data permits)
- Upside/downside to intrinsic value

## Risk Factors
- Top 3-5 specific, quantified risks
- For each: probability, magnitude, mitigants

## Verdict & Recommendation
**Rating:** [Strong Buy | Buy | Hold | Sell | Strong Sell]
**Price Target:** $X (if applicable)
**Thesis:** 2-3 sentences on the core investment argument
**Catalysts:** Key events to watch
**What Would Change the View:** What would make you more/less bullish
```

### Quick Ratio Analysis

When only a ratio check is needed:

```
## Ratio Analysis: [Company]

### Profitability
- Gross Margin: X% — [interpretation]
- Operating Margin: X% — [interpretation]
- Net Margin: X% — [interpretation]
- ROE: X% — [interpretation]
- ROA: X% — [interpretation]
- ROIC: X% — [interpretation]

### Liquidity
- Current Ratio: X — [interpretation]
- Quick Ratio: X — [interpretation]
- Cash Ratio: X — [interpretation]

### Leverage
- Debt/Equity: X — [interpretation]
- Interest Coverage: X — [interpretation]
- Net Debt/EBITDA: X — [interpretation]

### Efficiency
- Asset Turnover: X — [interpretation]
- Receivables Days: X — [interpretation]
- Inventory Turnover: X — [interpretation]

### Valuation
- P/E: X — [interpretation]
- EV/EBITDA: X — [interpretation]
- P/FCF: X — [interpretation]
- EV/Revenue: X — [interpretation]

### Summary Assessment
[2-3 sentences synthesizing the ratio picture]
```

---

## Reference Benchmarks

See `references/benchmarks.md` for industry-average ratios across major sectors. Always compare against:
1. The company's own historical range
2. Direct peers (if named)
3. Sector averages from the benchmarks file

---

## Ratio Formulas

See `references/ratio-formulas.md` for all standard financial ratio calculations. When computing ratios manually, use these exact definitions to ensure consistency.

---

## Red Flag Indicators

Always scan for and explicitly call out:

| Red Flag | What It Looks Like |
|----------|-------------------|
| **Earnings quality** | Net income >> Operating cash flow consistently |
| **Receivables stuffing** | Receivables growing faster than revenue |
| **Inventory build** | Inventory growing faster than COGS |
| **Debt spiral** | Net debt growing while EBITDA flat or declining |
| **Goodwill risk** | Goodwill > 30% of total assets |
| **Going concern signals** | Current ratio < 1, negative FCF, maturing debt |
| **Insider selling** | (Note if mentioned in context) |
| **Guidance cuts** | Pattern of lowering forward estimates |
| **Margin compression** | Declining gross margins without explanation |
| **Working capital trap** | Profits but no cash — check cash conversion cycle |

---

## Writing Principles

1. **Lead with the conclusion** — Put the verdict first, evidence second
2. **Quantify everything** — "Margins expanded 230bps to 18.4%" not "margins improved"
3. **Explain causality** — "Revenue grew 12% driven by X segment (+28%) offsetting Y (-5%)"
4. **Compare always** — Every number needs a baseline: prior period, peer, or target
5. **Flag uncertainty** — Note when analysis depends on assumptions or incomplete data
6. **Be decisive** — Avoid hedging to the point of uselessness; make a call

---

## Analysis Types Quick Reference

| Request | Analysis Type | Key Sections |
|---------|--------------|--------------|
| "Analyze this 10-K" | Fundamental | All sections |
| "Is this stock cheap?" | Valuation | Multiples, DCF, Verdict |
| "Check the balance sheet" | Risk / Liquidity | Balance Sheet, Risk Factors |
| "Compare these companies" | Comparative | Key Metrics table, peer deltas |
| "Analyze my portfolio" | Portfolio | Allocation, concentration, risk |
| "What do these earnings mean?" | Earnings | Revenue, margins, guidance, verdict |
| "Compute financial ratios" | Ratio Analysis | Quick Ratio Analysis format |
