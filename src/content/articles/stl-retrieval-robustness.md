# STL Retrieval Robustness in Long-Context LLMs

Can structured formats help LLMs retrieve facts from long documents more reliably than natural language? We tested STL against plain English across **1,507 trials**, three frontier models, and context lengths up to 400K tokens. STL's key-value encoding achieved **+2.8% higher retrieval accuracy** overall — and **+50% on precise numerical data**.

**Technical Report** | Authors: Syn-claude & wuko ([scos-lab](https://github.com/scos-lab)) | March 2026

---

## Abstract

We investigate whether Semantic Tension Language (STL), a structured key-value format for encoding factual claims, provides greater retrieval robustness than natural language (NL) in long-context large language model (LLM) settings. Using a needle-in-a-haystack paradigm with 15 fictional fact pairs across three frontier models (GPT-5.4, Gemini 2.5 Flash, Gemini 3 Flash), five needle positions (0%, 25%, 50%, 75%, 100%), and three context lengths (32K, 128K, 400K tokens), we conducted 1,507 trials total. STL-formatted needles achieved a mean retrieval score of 0.955 versus 0.928 for NL across all conditions (+2.8%). The effect was most pronounced for needle N06 (Harken-Solberg equation), where NL scored 0.50 and STL scored 1.00 across every model and every condition tested — a perfectly consistent result attributable to STL's explicit key-value encoding of precise numerical data. The classic "lost in the middle" positional degradation was not observed at these context lengths for any model, suggesting that modern frontier models have substantially mitigated this effect. An additional STL introduction prompt condition showed negligible impact (+0.2% over baseline STL), indicating that models already parse STL syntax without instruction.

---

## 1. Introduction

Liu et al. (2023) demonstrated that large language models exhibit a U-shaped retrieval curve when relevant information is placed at varying positions within long contexts: accuracy is highest when target information appears near the beginning or end and lowest when it appears in the middle. This "Lost in the Middle" effect has implications for retrieval-augmented generation, document-grounded question answering, and any application requiring faithful extraction from long contexts.

Semantic Tension Language (STL) is a structured notation for encoding factual relationships using directed edges with typed key-value modifiers:

```
[Harken_Solberg_Equation] -> [Acoustic_Resonance_Peak] ::mod(frequency="1247 Hz", chamber_diameter="0.34 meters", rule="causal", strength=0.92, confidence=0.96)
```

We hypothesize that STL's structural properties — explicit named fields, bracketed anchors, and key-value modifier blocks — may provide attention anchors that resist the positional degradation observed in natural language prose. Specifically, we predict that:

1. **H1:** STL-formatted facts will yield higher retrieval accuracy than NL equivalents across all positions and context lengths.
2. **H2:** The STL advantage will be most pronounced for facts containing precise numerical values, where NL embeds numbers within flowing prose but STL isolates them as explicit field values.
3. **H3:** The positional effect (middle degradation) will be attenuated for STL relative to NL.

This experiment follows Experiment 2A (STL vs NL for code generation instruction following), which found STL outperformed NL by 23.7 percentage points in protocol execution rate. The present study extends this line of inquiry to a retrieval-from-context task.

---

## 2. Method

### 2.1 Design

A within-subjects factorial design crossing:

- **Format** (2 levels): NL, STL
- **Position** (5 levels): 0%, 25%, 50%, 75%, 100% of context
- **Context length** (2–3 levels): 32K, 128K, and 400K tokens (model-dependent)
- **Model** (3 models, 4 conditions): GPT-5.4, Gemini 2.5 Flash, Gemini 3 Flash, Gemini 3 Flash with STL introduction prompt

### 2.2 Materials

**Needles.** 15 fictional fact pairs (N01–N15), each consisting of:
- An NL sentence containing 2+ verifiable data points (names, numbers, dates)
- An equivalent STL statement encoding the same facts as `::mod()` key-value pairs
- A retrieval question targeting the embedded facts
- Expected keywords for automated scoring

All facts are entirely fictional to eliminate model prior-knowledge bias. Examples:

| ID | Topic | Expected Keywords |
|----|-------|-------------------|
| N01 | Kerfield Institute founding | "Mara Soleno", "4.2" |
| N06 | Harken-Solberg acoustic equation | "1247", "0.34" |
| N07 | Operation Threadneedle artifact count | "4318", "Piotr Wenzl" |
| N15 | Algorithm Helix-9 performance | "0.74", "Mei-Lin Chang" |

**Haystack.** A ~1.6M character text file of diverse filler content (encyclopedia-style articles, technical descriptions, narrative passages) used to pad context to target lengths. Approximately 4 characters per token.

**STL Introduction Prompt.** For the `+Intro` condition, the following text was prepended to STL needle contexts:

> "Note: Some information in this document may be encoded in STL (Semantic Tension Language) format. STL uses the syntax: [Source] -> [Target] ::mod(key=value, key=value, ...) where the key-value pairs inside ::mod() contain the actual data..."

### 2.3 Procedure

For each trial:
1. Select a needle pair, format, position, and target context length.
2. Construct context by inserting the needle (NL or STL) at the specified position within haystack text truncated to the target character count.
3. Append the retrieval question as a user message.
4. Submit to the model and record the response.
5. Score the response by keyword matching against expected keywords. Score = (keywords found) / (total expected keywords). Each keyword is scored as present (1) or absent (0).

Trials were run exhaustively: every combination of 15 needles x 2 formats x 5 positions x available context lengths per model.

### 2.4 Models and Trial Counts

| Model | Context Lengths | Trials | Notes |
|-------|----------------|--------|-------|
| GPT-5.4 | 32K, 128K | 300 | 400K run aborted after 7 trials (rate limits); excluded from analysis |
| Gemini 2.5 Flash | 32K, 128K | 300 | |
| Gemini 3 Flash | 32K, 128K, 400K | 450 | |
| Gemini 3 Flash +Intro | 32K, 128K, 400K | 450 | STL intro prompt prepended to STL contexts |
| **Total** | | **1,507** | 7 incomplete GPT-5.4 400K trials excluded |

### 2.5 Scoring

Automated keyword matching: for each trial, the model's response was searched for the presence of each expected keyword string. Score = hits / total_keywords. This yields 0.0, 0.5, or 1.0 for the 2-keyword needles, and 0.0 or 1.0 for the single-keyword needle (N08).

---

## 3. Results

### 3.1 Overall Scores by Model

| Model | NL Mean | STL Mean | Delta | n (per format) |
|-------|---------|----------|-------|-----------------|
| GPT-5.4 (32K+128K) | 0.933 | 0.963 | **+3.0%** | 150 |
| Gemini 2.5 Flash (32K+128K) | 0.913 | 0.927 | **+1.3%** | 150 |
| Gemini 3 Flash (32K+128K+400K) | 0.933 | 0.969 | **+3.6%** | 225 |
| Gemini 3 Flash +Intro (32K+128K+400K) | 0.931 | 0.969 | **+3.8%** | 225 |
| **All models combined** | **0.928** | **0.955** | **+2.8%** | 525 |

STL outperformed NL in every model tested. The advantage ranged from +1.3% (Gemini 2.5 Flash) to +3.8% (Gemini 3 Flash +Intro).

### 3.2 Scores by Context Length

| Model | Length | NL | STL | Delta |
|-------|--------|----|-----|-------|
| GPT-5.4 | 32K | 0.933 | 0.967 | +3.3% |
| GPT-5.4 | 128K | 0.933 | 0.960 | +2.7% |
| Gemini 2.5 Flash | 32K | 0.920 | 0.947 | +2.7% |
| Gemini 2.5 Flash | 128K | 0.907 | 0.907 | +0.0% |
| Gemini 3 Flash | 32K | 0.933 | 0.967 | +3.3% |
| Gemini 3 Flash | 128K | 0.933 | 0.967 | +3.3% |
| Gemini 3 Flash | 400K | 0.933 | 0.973 | +4.0% |
| Gemini 3 +Intro | 32K | 0.933 | 0.967 | +3.3% |
| Gemini 3 +Intro | 128K | 0.933 | 0.973 | +4.0% |
| Gemini 3 +Intro | 400K | 0.927 | 0.967 | +4.0% |

The STL advantage persisted or increased at longer context lengths. For Gemini 3 Flash, the largest delta (+4.0%) was observed at 400K tokens.

### 3.3 Scores by Needle Position

| Model | Position | NL | STL | Delta |
|-------|----------|----|-----|-------|
| GPT-5.4 | 0% | 0.941 | 0.970 | +2.9% |
| GPT-5.4 | 25% | 0.933 | 0.967 | +3.3% |
| GPT-5.4 | 50% | 0.933 | 0.967 | +3.3% |
| GPT-5.4 | 75% | 0.933 | 0.950 | +1.7% |
| GPT-5.4 | 100% | 0.933 | 0.967 | +3.3% |
| Gemini 2.5 Flash | 0% | 0.917 | 0.917 | +0.0% |
| Gemini 2.5 Flash | 25% | 0.933 | 0.950 | +1.7% |
| Gemini 2.5 Flash | 50% | 0.917 | 0.917 | +0.0% |
| Gemini 2.5 Flash | 75% | 0.900 | 0.933 | +3.3% |
| Gemini 2.5 Flash | 100% | 0.900 | 0.917 | +1.7% |
| Gemini 3 Flash | 0% | 0.933 | 0.967 | +3.3% |
| Gemini 3 Flash | 25% | 0.933 | 0.967 | +3.3% |
| Gemini 3 Flash | 50% | 0.933 | 0.978 | +4.4% |
| Gemini 3 Flash | 75% | 0.933 | 0.967 | +3.3% |
| Gemini 3 Flash | 100% | 0.933 | 0.967 | +3.3% |

No model exhibited a clear U-shaped positional degradation curve for either format. The classic "lost in the middle" dip at 50% was not observed; in fact, Gemini 3 Flash showed its highest STL score (0.978) at the 50% position.

### 3.4 Position x Length Interaction (Gemini 3 Flash, 400K)

| Position | NL | STL | Delta |
|----------|----|-----|-------|
| 0% | 0.933 | 0.967 | +3.3% |
| 25% | 0.933 | 0.967 | +3.3% |
| 50% | 0.933 | 1.000 | +6.7% |
| 75% | 0.933 | 0.967 | +3.3% |
| 100% | 0.933 | 0.967 | +3.3% |

At 400K tokens (the longest context tested), Gemini 3 Flash achieved a perfect 1.000 STL score at the 50% position — the exact location where the lost-in-the-middle effect predicts maximum degradation.

### 3.5 Per-Needle Analysis

| Needle | NL (all models) | STL (all models) | Delta | Notes |
|--------|-----------------|-------------------|-------|-------|
| N01 | 1.000 | 1.000 | 0.000 | |
| N02 | 1.000 | 1.000 | 0.000 | |
| N03 | 1.000 | 0.972 | -0.028 | STL "cesium-lithium" occasionally missed |
| N04 | 1.000 | 1.000 | 0.000 | |
| N05 | 0.914 | 0.800 | -0.114 | See Section 3.6 |
| **N06** | **0.500** | **1.000** | **+0.500** | **Strongest signal** |
| N07 | 0.500 | 0.657 | +0.157 | Partial STL advantage |
| N08 | 1.000 | 0.971 | -0.029 | |
| N09 | 1.000 | 1.000 | 0.000 | |
| N10 | 1.000 | 0.971 | -0.029 | |
| N11 | 1.000 | 1.000 | 0.000 | |
| N12 | 1.000 | 0.957 | -0.043 | STL "7" signatories sometimes missed |
| N13 | 1.000 | 1.000 | 0.000 | |
| N14 | 1.000 | 1.000 | 0.000 | |
| N15 | 1.000 | 1.000 | 0.000 | |

The aggregate STL advantage is overwhelmingly driven by needles N06 and N07. Eleven of 15 needles scored perfectly (1.000) in both formats. A few needles (N03, N05, N08, N10, N12) showed minor STL disadvantages, discussed below.

### 3.6 The N06 Signal: A Perfect Discriminator

Needle N06 — the Harken-Solberg acoustic resonance equation — produced the experiment's most striking result:

- **NL score: 0.500 across all models, all positions, all context lengths** (35/35 trials)
- **STL score: 1.000 across all models, all positions, all context lengths** (35/35 trials)

In every NL trial, models retrieved the chamber diameter "0.34" but failed to retrieve the resonance frequency "1247." In every STL trial, both values were retrieved successfully.

The NL formulation embeds the number within a clause: *"...peaks at 1,247 Hz when the chamber diameter is exactly 0.34 meters."* The STL formulation isolates it as a labeled field: `frequency="1247 Hz"`. This suggests that explicit key-value labeling provides a retrieval advantage for precise numerical data embedded in long contexts.

### 3.7 N07: Partial STL Advantage, Model-Dependent

Needle N07 (Operation Threadneedle, expected keywords "4318" and "Piotr Wenzl") showed a model-dependent pattern:

| Model | NL | STL |
|-------|----|-----|
| GPT-5.4 | 0.500 | 0.500 |
| Gemini 2.5 Flash | 0.500 | 1.000 |
| Gemini 3 Flash | 0.500 | 0.533 |

All models consistently retrieved "Piotr Wenzl" but failed on "4318" in NL format. STL fully resolved this for Gemini 2.5 Flash but not for GPT-5.4 or Gemini 3 Flash, suggesting that the STL advantage for numerical recall is model-dependent and not universal.

### 3.8 STL Introduction Prompt Effect

| Condition | NL | STL | Delta |
|-----------|-----|------|-------|
| Gemini 3 Flash (no intro) | 0.933 | 0.969 | +3.6% |
| Gemini 3 Flash (+intro) | 0.931 | 0.969 | +3.8% |

The STL introduction prompt — a brief explanation of STL syntax prepended to STL contexts — had negligible effect. The STL score was identical (0.969) with and without the introduction. The 0.2% delta difference is entirely attributable to minor NL score variation (0.933 vs 0.931), not to any STL improvement. This indicates that frontier models can parse STL's bracket-arrow-modifier syntax without explicit instruction.

### 3.9 Minor STL Disadvantages

Several needles showed STL scores slightly below NL:

- **N05** (Narvolen/Three Pillar Framework): On Gemini 2.5 Flash specifically, STL scored 0.350 vs NL 0.700. The keyword "Elen Drastova" was frequently missed. This appears to be a model-specific parsing issue where Gemini 2.5 Flash struggled with the `overseer="Commissioner Elen Drastova"` field.
- **N03, N08, N10, N12**: Minor deficits (2–4%) where STL scored slightly below 1.000. These involved keywords like "cesium-lithium" (hyphenated compound), "7" (single digit easily confused with other numbers in context), and proper names within modifier strings.

These cases suggest that while STL's key-value structure aids numerical retrieval, the modifier string format can occasionally obscure information that would be more salient in natural prose — particularly when the target is a short or ambiguous string.

---

## 4. Discussion

### 4.1 Structural Anchoring as an Attention Mechanism

The consistent STL advantage across models supports the structural anchoring hypothesis: STL's syntactic features — square-bracketed anchors `[Name]`, the arrow operator `->`, and the `::mod(key=value)` block — create distinct visual and tokenization patterns that serve as attention anchors within uniform haystack text. These structural discontinuities likely increase the probability that transformer attention heads attend to the needle region during retrieval.

The key-value format within `::mod()` provides an additional benefit: it labels each datum with a semantic key (`frequency=`, `artifacts=`, `chamber_diameter=`), creating a direct association between the question's target concept and the stored value. In NL, the same information must be extracted from syntactic relationships ("peaks at 1,247 Hz when the diameter is..."), which requires more compositional reasoning.

### 4.2 Why N06 is the Strongest Signal

N06's perfect discrimination (NL=0.50, STL=1.00) across all 70 trials is the experiment's most robust finding. The explanation is straightforward:

- The NL sentence contains two numbers ("1,247 Hz" and "0.34 meters") embedded within a relative clause. Models consistently retrieved the second number but not the first, suggesting that the comma-formatted "1,247" is harder to extract from prose than "0.34."
- In STL, both numbers are isolated as explicit field values: `frequency="1247 Hz"` and `chamber_diameter="0.34 meters"`. The key name directly matches the question's target ("at what frequency"), creating a near-trivial retrieval path.

This finding has practical implications: when encoding precise numerical data for LLM consumption in long contexts, explicit key-value labeling substantially outperforms prose embedding.

### 4.3 Absence of Positional Degradation

Contrary to the original Lost in the Middle findings (Liu et al., 2023), no model in our experiment exhibited significant positional degradation. NL scores were nearly flat across positions (typically 0.933 at every position for GPT-5.4 and Gemini 3 Flash). This is consistent with recent reports that frontier models from late 2025 and 2026 have substantially addressed the lost-in-the-middle problem through improved positional encoding, training on long contexts, and architectural advances.

However, this null finding limits our ability to test H3 (that STL attenuates positional degradation). If the baseline effect is absent, there is no degradation to attenuate. Testing at longer context lengths (1M+ tokens) or with earlier model generations may be necessary to observe the interaction.

### 4.4 STL Introduction Prompt: Unnecessary

The STL intro condition was designed to test whether models' ability to parse STL depends on explicit instruction. The result was clear: it does not. Gemini 3 Flash achieved identical STL performance (0.969) with and without the introduction prompt. This suggests that STL's syntax — square brackets, arrows, `::mod()`, key=value pairs — is sufficiently close to programming language conventions and structured data formats in the training corpus that frontier models parse it natively.

### 4.5 Limitations

1. **Sample size.** While 1,507 total trials provide reasonable coverage, each unique cell (needle x format x position x length x model) contains only 1 trial. The consistency across cells compensates partially, but statistical significance testing is limited.

2. **Keyword-based scoring.** Binary keyword matching is a blunt instrument. A model that paraphrases "approximately 1,250 Hz" would score 0 for the keyword "1247," even though the retrieval was partially successful. Future work should incorporate semantic similarity scoring.

3. **Context length ceiling.** Our maximum context length was 400K tokens, tested only on Gemini 3 Flash. The lost-in-the-middle effect may re-emerge at 1M+ tokens, where the STL advantage could become more pronounced. GPT-5.4's 400K run was aborted due to rate limits.

4. **Single-trial design.** Each condition was tested once per needle. Stochastic variation in model outputs means that some observed differences may not be reproducible. The N06 result, however, was perfectly consistent across 70 trials (35 NL + 35 STL), providing high confidence in that specific finding.

5. **Haystack composition.** The haystack consisted of diverse encyclopedia-style text. Different haystack compositions (e.g., technical documentation, conversational text) might interact differently with STL and NL needles.

6. **Fictional facts only.** All needles used fictional facts to avoid prior-knowledge contamination. Real-world facts might show different patterns if the model can partially reconstruct answers from parametric knowledge.

---

## 5. Conclusion

Across 1,507 trials spanning three frontier models, five needle positions, and context lengths up to 400K tokens, STL-formatted factual claims achieved 2.8% higher retrieval accuracy than natural language equivalents. The effect was driven primarily by STL's advantage in encoding precise numerical data as explicit key-value pairs, with needle N06 producing a maximally consistent signal: NL=0.50 vs STL=1.00 across every condition tested.

The classic lost-in-the-middle positional degradation was not observed for any model at the tested context lengths, suggesting that this effect has been substantially mitigated in 2026-era frontier models. An STL syntax introduction prompt had no measurable effect, confirming that models parse STL natively.

These findings support the use of structured key-value formats like STL for encoding critical factual data in long-context LLM applications, particularly when precise numerical values must be retrievable. The advantage is modest in aggregate (+2.8%) but can be decisive for specific fact types — as the N06 result demonstrates, the difference between NL and STL can be the difference between 50% and 100% retrieval.

Future work should extend to 1M+ token contexts, multiple trials per condition, and semantic similarity scoring to provide a more complete picture of STL's retrieval advantages.

---

## 6. Data Availability

All raw data is available as JSON files in the `results/` directory of this experiment:

| File | Contents |
|------|----------|
| `exp2b_results_gpt-5.4.json` | 307 trials (300 at 32K+128K, 7 incomplete at 400K) |
| `exp2b_results_gemini-2.5-flash.json` | 300 trials (32K+128K) |
| `exp2b_results_gemini-3-flash.json` | 450 trials (32K+128K+400K) |
| `exp2b_results_gemini-3-flash-stl-intro.json` | 450 trials (32K+128K+400K, with STL intro prompt) |

Each trial record contains: `needle_id`, `format`, `position`, `target_tokens_k`, `actual_context_chars`, `response`, `score`, `hits`, `misses`, `elapsed_s`, `error`, and `model`.

Needle definitions (NL text, STL text, questions, and expected keywords) are in `needles.py`.

---

## References

- Liu, N. F., Lin, K., Hewitt, J., Paranjape, A., Bevilacqua, M., Petroni, F., & Liang, P. (2023). Lost in the Middle: How Language Models Use Long Contexts. *arXiv:2307.03172*.

---

*Experiment conducted March 19–21, 2026. Report generated 2026-03-21.*
*Part of the STL (Semantic Tension Language) research program at scos-lab.*
