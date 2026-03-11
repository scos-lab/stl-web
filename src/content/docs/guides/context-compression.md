# STL as Context Compression for LLMs

Use STL as a structured compression format for LLM context windows — achieving **3.9× higher token efficiency** than natural language summarization while preserving 100% of critical data.

**Use case:** Long-running LLM sessions, multi-agent memory transfer, persistent knowledge bases.

---

## The Problem

LLMs operate within fixed context windows (128K–200K tokens). When conversations exceed this limit, prior context must be compressed. Current approaches all sacrifice information for space:

| Approach | Mechanism | Limitation |
|----------|-----------|------------|
| **Truncation** | Drop oldest messages | Total information loss |
| **Sliding window** | Keep recent N tokens | Loses early context |
| **RAG** | Retrieve relevant chunks | Requires external index; latency |
| **NL Summarization** | Compress to prose | Lossy; ambiguous; verbose |

The core question: **what format minimizes information loss per token?**

---

## The STL Approach

Instead of summarizing conversations into prose, compress them into STL statements:

```stl
# Instead of: "We discovered that the Q-ball equation transforms into
# a hypergeometric equation when substituting z=tanh²(κr), yielding
# ₂F₁(1/2,-1/2;1/2;z). This was verified numerically with 0.17% accuracy."

[Qball_Equation] -> [Hypergeometric_Equation] ::mod(
  rule="logical",
  confidence=0.95,
  description="z=tanh²(κr) transforms linear Q-ball to ₂F₁(1/2,-1/2;1/2;z)",
  accuracy="0.17%"
)
```

One STL statement replaces two sentences — with **more information** (confidence level, rule type, accuracy metric) in **fewer tokens**.

---

## Measured Results

We benchmarked STL compression against system-generated natural language summarization on a real research session (mathematical physics, ~3 MB raw transcript, 4+ hours of work):

### Size Comparison

| Metric | NL Summary | STL Compression | Improvement |
|--------|:----------:|:---------------:|:-----------:|
| Characters | ~25,000 | 6,511 | **3.8× smaller** |
| Words | ~4,000 | ~344 | **11.6× fewer** |
| Estimated tokens | ~5,500 | ~1,400 | **3.9× fewer** |
| Context window usage (200K) | ~2.75% | ~0.70% | **74% reduction** |

### Information Fidelity

We evaluated both formats against 10 critical data points from the session:

| Data Type | NL Summary | STL |
|-----------|:----------:|:---:|
| Exact numerical values | 8/10 preserved | **10/10 preserved** |
| Source references (arXiv IDs, DOIs) | Present | Present |
| Confidence calibration of hypotheses | **Missing** | Present |
| Parameter values and error bounds | Partially rounded | Exact |
| Dependency relationships between findings | Implicit | **Explicit (edges)** |

**Score: NL Summary 8.5/10 — STL 10/10**

---

## Why STL Compresses Better

### 1. Zero Narrative Overhead

Natural language wastes tokens on syntactic scaffolding:

```
"The user asked about X. I then proceeded to do Y. After analyzing
the results, we discovered that Z was the case, which led us to..."
```

~40 tokens, ~5 tokens of actual information. STL eliminates the glue:

```stl
[X] -> [Z] ::mod(method="Y", confidence=0.95)
```

~15 tokens. Same information.

### 2. Schema-Level Defaults

In prose, every statement must be self-contained:

> "The mass ratio of proton to electron (1836.15) can be approximated by the Ramanujan exponential formula e^{π(√183-√124)}, yielding 1836.07, with a deviation of only 0.0045%. The integers 124 and 183 factorize as 4×31 and 3×61 respectively."

In STL, the structure carries implicit conventions:

```stl
[Mass_Ratio_1836] -> [Ramanujan_Formula] ::mod(
  rule="empirical", confidence=0.92,
  n1=124, n2=183, deviation="0.0045%",
  n1_factors="4·31", n2_factors="3·61"
)
```

Shorter, yet contains **more data** (confidence, rule type) that the prose omits.

### 3. Structural Composability

NL summaries are monolithic blobs. STL statements are independent units:

```python
from stl_parser import parse_file, find_all

# Load compressed session
result = parse_file("session-context.stl")

# Query: what depends on the BF_Bound finding?
downstream = find_all(result, source="BF_Bound")

# Filter: only high-confidence results
strong = find_all(result, confidence__gt=0.9)

# Merge: combine two session files
combined = merge(session_1, session_2)
```

You can filter, merge, query, diff, and validate STL — impossible with prose summaries.

### 4. Lossless Numerical Preservation

NL summarizers routinely:
- Round numbers ("about 0.005%" → loses precision)
- Drop secondary quantities (Z-scores, sample sizes)
- Omit confidence calibrations
- Merge distinct results into vague statements

STL's key-value metadata makes numerical precision **structural**, not optional.

---

## Compression Across Domains

| Domain | NL Tokens | STL Tokens | Ratio | Status |
|--------|:---------:|:----------:|:-----:|--------|
| Research session | ~5,500 | ~1,400 | **3.9×** | Measured |
| Task checklist (29 items) | ~4,000 | ~1,500 | **2.7×** | Verified in production |
| System prompt config | ~4,400 | ~438 | **10.0×** | Verified in production |
| Knowledge graph edges | ~2,000 | ~600 | **3.3×** | Estimated |

Highly structured data (configs, checklists) sees the largest gains. Narrative-heavy content sees smaller but still meaningful improvement.

---

## Implementation Pattern

### Session Memory Cycle

```
Session Start
    ↓
Load: previous-session.stl → restore context
    ↓
Work (conversation, tools, reasoning)
    ↓
Save: current-session.stl → persist knowledge
    ↓
Session End
```

The context window acts as **working memory**; STL files serve as **long-term memory**.

### Writing Compressed Context

Organize statements into semantic groups:

```stl
# === Discoveries ===
[Finding_A] -> [Implication_B] ::mod(
  rule="empirical", confidence=0.95,
  source="experiment_results.csv",
  description="Key finding with full detail"
)

# === Decisions ===
[Decision_X] -> [Outcome_Y] ::mod(
  confidence=0.90, reason="Performance benchmarks showed 3× improvement"
)

# === Pending Tasks ===
[Task_1] -> [Target_State] ::mod(
  status="pending", priority="High",
  blocker="Waiting for API key", next_step="Contact admin"
)

# === Hypotheses ===
[Hypothesis_H] -> [Prediction_P] ::mod(
  confidence=0.65, rule="logical",
  description="If H is true, we should observe P in test results"
)
```

### Loading Compressed Context

```python
from stl_parser import parse_file, find_all

# Restore session context
ctx = parse_file("session-context.stl")

# Get all pending tasks
tasks = find_all(ctx, status="pending")

# Get high-priority hypotheses
hypotheses = find_all(ctx, confidence__lt=0.8, confidence__gt=0.5)

# Rebuild working context from structured memory
for stmt in ctx.statements:
    print(f"  {stmt.source} → {stmt.target}")
    for mod in stmt.modifiers:
        for k, v in mod.fields.items():
            print(f"    {k}: {v}")
```

---

## Incremental Knowledge Accumulation

Because STL statements are composable, knowledge evolves across sessions:

```stl
# Session 1: Initial hypothesis
[Hypothesis_A] -> [Evidence_1] ::mod(confidence=0.60, status="exploring")

# Session 3: Additional evidence
[Hypothesis_A] -> [Evidence_2] ::mod(confidence=0.75, status="strengthening")

# Session 7: Confirmed
[Hypothesis_A] -> [Verified] ::mod(confidence=0.95, source="experiment", status="confirmed")
```

The confidence evolution is tracked structurally. No prose summary maintains this longitudinal precision.

---

## Multi-Agent Knowledge Transfer

When multiple LLM agents collaborate, STL provides a shared format that is:

- **Unambiguous** — no pronoun resolution or interpretation needed
- **Compact** — minimal token overhead per transfer
- **Validatable** — receivers can check structural integrity
- **Mergeable** — combine knowledge from multiple agents without conflicts

```stl
# Agent A's findings
[Agent_A:Analysis] -> [Result_X] ::mod(confidence=0.88, timestamp="2025-01-15T10:00:00Z")

# Agent B's findings (compatible, mergeable)
[Agent_B:Analysis] -> [Result_Y] ::mod(confidence=0.92, timestamp="2025-01-15T10:05:00Z")

# Cross-reference
[Result_X] -> [Result_Y] ::mod(rule="logical", description="X supports Y")
```

---

## Comparison with Alternatives

| Format | Compression | Precision | Composable | Queryable | Human-Readable |
|--------|:-----------:|:---------:|:----------:|:---------:|:--------------:|
| NL Summarization | Medium | Low | No | No | High |
| JSON Snapshot | Low | High | Partial | Yes | Medium |
| XML/RDF | Very Low | High | Yes | Yes | Low |
| Vector Embedding | Very High | None* | No | Approximate | None |
| **STL** | **High** | **High** | **Yes** | **Yes** | **Medium** |

*Vector embeddings lose all explicit content; retrieval is similarity-based only.

STL uniquely combines high compression with high precision and full composability.

---

## Limitations

- **Not for all content** — STL excels at structured knowledge (facts, relations, hypotheses). For emotional context or design rationale requiring prose, use a hybrid approach.
- **Requires STL knowledge** — The compressing agent must understand STL syntax. Include the [STL Syntax reference](../reference/stl-syntax.md) in your system prompt (~2,000 tokens fixed cost).
- **Human readability trade-off** — STL is less immediately readable than prose for non-technical users. For LLM-to-LLM transfer, this trade-off is favorable.

---

## Key Takeaway

Natural language summarization wastes 60–75% of tokens on narrative scaffolding that carries no information. STL eliminates this overhead while adding structure that enables querying, validation, and composition.

**For LLM memory management, structured semantic compression is not an optimization — it's a necessary evolution.**

---

## Further Reading

- [STL Syntax Reference](../reference/stl-syntax.md) — Complete syntax specification
- [LLM Integration Guide](llm-integration.md) — Use STL with ChatGPT, Claude, and other LLMs
- [Knowledge Graph Pipeline](knowledge-graph-pipeline.md) — Build persistent knowledge structures
- [Querying Tutorial](../tutorials/05-querying.md) — Filter and select STL statements
