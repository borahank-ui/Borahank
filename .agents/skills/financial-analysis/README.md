# Financial Analysis Skill

A Claude Code skill that performs deep financial analysis — fundamental, valuation, ratio, and portfolio — using the Claude API with adaptive thinking.

## What It Does

- **Fundamental analysis** — Parses income statements, balance sheets, and cash flows into structured insights
- **Ratio analysis** — Computes and interprets 20+ standard financial ratios with benchmarking
- **Valuation** — DCF estimates, comparable multiples, and intrinsic value ranges
- **Risk assessment** — Flags red flags, debt sustainability issues, and going-concern signals
- **Comparative analysis** — Peer benchmarking against industry averages
- **Earnings analysis** — Beat/miss interpretation, margin trends, guidance assessment

## Installation

Clone or download this skill, then copy it into your project's `.claude/skills/` directory:

```bash
cp -r financial-analysis .claude/skills/financial-analysis
```

## Setup

### 1. Install Dependencies

```bash
cd .claude/skills/financial-analysis/references
pip install anthropic
```

### 2. Set Your API Key

```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

Or add it to your shell profile (`.bashrc`, `.zshrc`, etc.).

### 3. Verify Setup

```bash
python .claude/skills/financial-analysis/references/analyze.py --help
```

## Usage

### Via Claude Code (Natural Language)

Simply describe what you want analyzed:

> "Analyze the financial health of Apple using their latest 10-K. Focus on profitability and cash flow."

> "Compute key financial ratios for this company: [paste financials]"

> "Is Microsoft undervalued at its current P/E? Compare to the sector."

> "Check my portfolio for concentration risk: [paste holdings]"

### Via Python Script

```bash
# Analyze a file with financial data
python references/analyze.py \
  --data financials.txt \
  --type fundamental \
  --company "ACME Corp" \
  --period "FY2024"

# Quick ratio analysis from stdin
echo "Revenue: $5B, Net Income: $500M, Total Assets: $10B..." | \
  python references/analyze.py --type ratios --company "ACME Corp"
```

### Via Python API

```python
from pathlib import Path
import sys
sys.path.insert(0, str(Path(".claude/skills/financial-analysis/references")))

from analyze import run_financial_analysis

result = run_financial_analysis(
    financial_data=open("financials.txt").read(),
    analysis_type="fundamental",
    company_name="ACME Corp",
    period="FY2024",
)
print(result)
```

## Analysis Types

| Type | Use For |
|------|---------|
| `fundamental` | Full analysis of financial statements |
| `ratios` | Compute and interpret financial ratios only |
| `valuation` | Focus on valuation multiples and intrinsic value |
| `risk` | Balance sheet health and red flag screening |
| `portfolio` | Portfolio-level analysis of holdings |
| `earnings` | Quarterly earnings interpretation |

## File Structure

```
financial-analysis/
  SKILL.md                     # Analysis methodology + workflow (Claude reads this)
  README.md                    # This file — setup instructions
  references/
    analyze.py                 # Claude API integration script
    ratio-formulas.md          # Standard ratio calculation definitions
    benchmarks.md              # Industry-average ratio benchmarks by sector
```

## Customization

- **Sector benchmarks**: Edit `references/benchmarks.md` to add or update industry averages for your specific market
- **Report format**: Modify the output structure in `SKILL.md` to match your organization's reporting template
- **Model**: The script defaults to `claude-opus-4-6`. Edit `analyze.py` to change the model

## Requirements

- Python 3.8+
- `anthropic` Python package (`pip install anthropic`)
- `ANTHROPIC_API_KEY` environment variable
