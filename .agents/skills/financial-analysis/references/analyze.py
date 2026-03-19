#!/usr/bin/env python3
"""
Financial Analysis Script — Claude API Integration

Uses Claude Opus 4.6 with adaptive thinking and streaming to perform
deep financial analysis on provided data.

Usage:
    python analyze.py --data financials.txt --type fundamental --company "ACME Corp"
    echo "Revenue: $5B..." | python analyze.py --type ratios --company "ACME Corp"
"""

import argparse
import os
import sys
import anthropic

SYSTEM_PROMPT = """You are an elite financial analyst with expertise in fundamental analysis,
valuation, and financial statement interpretation. You provide rigorous, quantitative analysis
that leads with conclusions and supports them with evidence.

Your analysis:
- Always leads with the key finding or verdict
- Quantifies everything with specific numbers and percentages
- Explains causality, not just correlation
- Compares every metric against a baseline (prior period, peer, or industry average)
- Flags red flags explicitly with evidence
- Makes decisive, actionable recommendations

Follow the output format specified in the user prompt exactly."""

ANALYSIS_PROMPTS = {
    "fundamental": """Perform a comprehensive fundamental financial analysis of {company} for {period}.

Financial data provided:
{data}

Structure your analysis as follows:

# Financial Analysis: {company}
**Period:** {period}

## Executive Summary
(2-3 sentences with the headline finding and overall assessment)

## Key Metrics Snapshot
(Table of key metrics with YoY change and industry comparison where possible)

## Profitability Analysis
(Gross margin, operating margin, net margin trends and drivers)

## Balance Sheet Health
(Liquidity, debt structure, asset quality)

## Cash Flow Analysis
(Operating cash flow, FCF, capital allocation)

## Valuation
(Current multiples, historical range, intrinsic value estimate if data permits)

## Risk Factors
(Top 3-5 specific, quantified risks)

## Verdict & Recommendation
(Clear rating, price target if applicable, thesis, and what would change the view)

Be specific and quantitative. Lead every section with the conclusion, then support it with numbers.""",

    "ratios": """Compute and interpret all standard financial ratios for {company} for {period}.

Financial data provided:
{data}

Structure your output as:

## Ratio Analysis: {company}

### Profitability Ratios
(Gross Margin, Operating Margin, Net Margin, ROE, ROA, ROIC — value + interpretation)

### Liquidity Ratios
(Current Ratio, Quick Ratio, Cash Ratio — value + interpretation)

### Leverage Ratios
(Debt/Equity, Interest Coverage, Net Debt/EBITDA — value + interpretation)

### Efficiency Ratios
(Asset Turnover, Receivables Days, Inventory Turnover — value + interpretation)

### Valuation Ratios
(P/E, EV/EBITDA, P/FCF, EV/Revenue — value + interpretation)

### Summary Assessment
(2-3 sentences synthesizing the ratio picture — what story do the ratios tell together?)

For each ratio, provide: formula used, calculated value, and a 1-sentence interpretation vs. typical benchmarks.""",

    "valuation": """Perform a detailed valuation analysis of {company} for {period}.

Financial data provided:
{data}

Structure your output as:

## Valuation Analysis: {company}

### Current Trading Multiples
(All relevant multiples with current values)

### Historical Multiple Range
(52-week or multi-year range if data available)

### Peer Comparison
(How multiples compare to industry peers / sector averages)

### Intrinsic Value Estimate
(DCF range, Gordon Growth Model, or asset-based valuation — whichever is appropriate given the data)

### Upside / Downside Scenarios
(Bull, base, bear case with assumptions)

### Verdict
(Overvalued / Fairly valued / Undervalued — and by how much)""",

    "risk": """Perform a financial risk assessment and red flag screening for {company} for {period}.

Financial data provided:
{data}

Structure your output as:

## Risk Assessment: {company}

### Red Flag Screening
(Check each: earnings quality, receivables trends, inventory trends, debt trajectory,
goodwill exposure, going concern signals, margin compression, working capital trap)

### Debt & Liquidity Analysis
(Debt structure, maturities, covenants, coverage ratios, liquidity runway)

### Top 5 Risk Factors
(Specific, quantified risks with probability and magnitude estimates)

### Financial Health Score
(Overall assessment: Strong / Adequate / Concerning / Critical)

### Monitoring Triggers
(Specific metrics or events that would indicate deteriorating financial health)""",

    "portfolio": """Analyze the portfolio composition and risk profile for {period}.

Portfolio data provided:
{data}

Structure your output as:

## Portfolio Analysis

### Allocation Summary
(By asset class, sector, geography, market cap — % breakdown)

### Concentration Risk
(Top holdings %, Herfindahl index or equivalent concentration measure)

### Risk Metrics
(Estimated portfolio beta, volatility characteristics, correlation considerations)

### Diversification Assessment
(Is the portfolio appropriately diversified? What's missing or over-represented?)

### Top Holdings Analysis
(Brief assessment of the 3-5 largest positions)

### Recommendations
(Specific rebalancing suggestions or positions to review)""",

    "earnings": """Analyze the earnings report for {company} for {period}.

Earnings data provided:
{data}

Structure your output as:

## Earnings Analysis: {company} — {period}

### Headline Results
(Revenue, EPS vs. estimates — beat/miss magnitude)

### Revenue Quality
(Mix, organic vs. inorganic, segment breakdown, geographic breakdown)

### Margin Analysis
(Gross, operating, net margins vs. prior quarter, prior year, and guidance)

### Guidance Assessment
(Full-year / next quarter guidance vs. consensus — raised/lowered/maintained)

### Key Takeaways
(3 most important things from this earnings report)

### Verdict
(What does this report mean for the investment thesis? Positive / Neutral / Negative catalyst)""",
}


def run_financial_analysis(
    financial_data: str,
    analysis_type: str = "fundamental",
    company_name: str = "Company",
    period: str = "Most Recent Period",
) -> str:
    """
    Run financial analysis using Claude Opus 4.6 with adaptive thinking.

    Args:
        financial_data: Raw financial data as text
        analysis_type: Type of analysis (fundamental, ratios, valuation, risk, portfolio, earnings)
        company_name: Name of company or portfolio
        period: Reporting period (e.g., "FY2024", "Q3 2024")

    Returns:
        Complete analysis as a string
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError(
            "ANTHROPIC_API_KEY environment variable not set. "
            "Export it: export ANTHROPIC_API_KEY='your-key'"
        )

    client = anthropic.Anthropic(api_key=api_key)

    prompt_template = ANALYSIS_PROMPTS.get(analysis_type, ANALYSIS_PROMPTS["fundamental"])
    user_prompt = prompt_template.format(
        company=company_name,
        period=period,
        data=financial_data,
    )

    print(f"Analyzing {company_name} ({analysis_type}) for {period}...\n", file=sys.stderr)
    print("-" * 60, file=sys.stderr)

    result_parts = []

    # Use streaming + adaptive thinking for comprehensive analysis
    with client.messages.stream(
        model="claude-opus-4-6",
        max_tokens=8000,
        thinking={"type": "adaptive"},
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
    ) as stream:
        for event in stream:
            if event.type == "content_block_delta":
                if hasattr(event.delta, "type"):
                    if event.delta.type == "text_delta":
                        text = event.delta.text
                        result_parts.append(text)
                        print(text, end="", flush=True)

    print("\n" + "-" * 60, file=sys.stderr)

    final_message = stream.get_final_message()
    usage = final_message.usage
    print(
        f"\nTokens used — Input: {usage.input_tokens}, Output: {usage.output_tokens}",
        file=sys.stderr,
    )

    return "".join(result_parts)


def main():
    parser = argparse.ArgumentParser(
        description="Financial analysis using Claude Opus 4.6",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python analyze.py --data financials.txt --type fundamental --company "Apple Inc" --period "FY2024"
  python analyze.py --data earnings.txt --type earnings --company "Microsoft" --period "Q2 FY2025"
  echo "Revenue: $5B, Net Income: $500M" | python analyze.py --type ratios --company "ACME"

Analysis types:
  fundamental  Full analysis of financial statements (default)
  ratios       Compute and interpret financial ratios
  valuation    Focus on valuation multiples and intrinsic value
  risk         Balance sheet health and red flag screening
  portfolio    Portfolio-level analysis of holdings
  earnings     Quarterly earnings interpretation
        """,
    )
    parser.add_argument(
        "--data",
        help="Path to file containing financial data (default: read from stdin)",
    )
    parser.add_argument(
        "--type",
        default="fundamental",
        choices=["fundamental", "ratios", "valuation", "risk", "portfolio", "earnings"],
        help="Type of analysis to perform (default: fundamental)",
    )
    parser.add_argument(
        "--company",
        default="Company",
        help="Company name or portfolio label (default: Company)",
    )
    parser.add_argument(
        "--period",
        default="Most Recent Period",
        help="Reporting period, e.g. 'FY2024' or 'Q3 2024' (default: Most Recent Period)",
    )
    parser.add_argument(
        "--output",
        help="Output file path (default: print to stdout)",
    )

    args = parser.parse_args()

    # Load financial data
    if args.data:
        try:
            with open(args.data, "r", encoding="utf-8") as f:
                financial_data = f.read()
        except FileNotFoundError:
            print(f"Error: File not found: {args.data}", file=sys.stderr)
            sys.exit(1)
    elif not sys.stdin.isatty():
        financial_data = sys.stdin.read()
    else:
        print("Error: Provide financial data via --data <file> or stdin", file=sys.stderr)
        parser.print_help()
        sys.exit(1)

    if not financial_data.strip():
        print("Error: No financial data provided", file=sys.stderr)
        sys.exit(1)

    try:
        result = run_financial_analysis(
            financial_data=financial_data,
            analysis_type=args.type,
            company_name=args.company,
            period=args.period,
        )

        if args.output:
            with open(args.output, "w", encoding="utf-8") as f:
                f.write(result)
            print(f"\nReport saved to: {args.output}", file=sys.stderr)

    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    except anthropic.AuthenticationError:
        print("Error: Invalid API key. Check your ANTHROPIC_API_KEY.", file=sys.stderr)
        sys.exit(1)
    except anthropic.APIConnectionError:
        print("Error: Could not connect to Anthropic API. Check your internet connection.", file=sys.stderr)
        sys.exit(1)
    except anthropic.RateLimitError:
        print("Error: Rate limit exceeded. Wait a moment and try again.", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
