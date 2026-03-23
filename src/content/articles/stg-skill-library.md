# STG as Skill Library: Unifying Declarative and Procedural Knowledge in a Single Graph

**Wuko** · **Syn-claude**

Published: March 23, 2026 | Version 1.0

---

> **License:** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> **Organization:** [SCOS Lab](https://github.com/scos-lab)
> **Keywords:** `knowledge-graph` · `procedural-memory` · `skill-management` · `AI-agents` · `STL` · `STG`

---

## Abstract

AI agents can use tools, but they cannot *remember how they used them*. Current approaches to agent skill management — wikis, hardcoded tool definitions, and RAG-based retrieval — lack memory dynamics: they don't strengthen with use, decay with neglect, or support temporal replay. We present the **Semantic Tension Graph (STG) Skill Library**, an architecture that stores procedural knowledge (scripts, configurations, operational lessons) alongside declarative knowledge (facts, relations) in a single graph using Semantic Tension Language (STL) modifiers. Through propagation-based retrieval, a query like "how do I update the model catalog" activates an entire skill subgraph — returning executable paths, authentication requirements, and historical lessons in one recall. We demonstrate the approach with two real-world skills deployed in production, and show how existing STG mechanisms (Hebbian learning, temporal replay, telemetry) produce emergent properties when applied to procedural knowledge.

---

## 1. The Problem: Three Broken Approaches to Agent Skills

Every AI agent framework faces the same question: **how does the agent know what it can do, and how to do it?**

Current solutions fall into three categories, each with fundamental limitations:

### 1.1 The Wiki/Runbook Approach

Operations teams maintain runbooks — step-by-step guides for deployments, incident response, data migrations. These documents are:

- **Static.** A runbook written six months ago doesn't reflect today's infrastructure.
- **Unsearchable by intent.** You must know *which* runbook to look for. There's no "what should I do when X happens?" query.
- **Disconnected from execution.** The runbook describes steps; the agent must separately map those steps to tools.

### 1.2 The Hardcoded Tool Definition

Frameworks like LangChain, CrewAI, and OpenAI's function calling define tools as code:

```python
@tool
def update_catalog():
    """Fetches latest models from OpenRouter API."""
    ...
```

This gives the agent *capability* but not *memory*:

- **No learning.** The 50th time the agent calls a tool, it knows nothing more than the first time.
- **No context.** Tool definitions don't encode "last time we did this, the OAuth token had expired" or "this requires the scos-lab PAT, not the wukoayos one."
- **No decay.** Deprecated tools remain in the registry until manually removed.

### 1.3 The RAG Approach

Retrieval-Augmented Generation indexes documentation and retrieves relevant chunks at query time. But:

- **Chunks lack structure.** A paragraph about deployment is a bag of words, not a connected knowledge graph.
- **No reinforcement.** Retrieved-but-useful chunks are not strengthened; retrieved-but-irrelevant chunks are not weakened.
- **No temporal awareness.** "How did we deploy last Tuesday?" requires structured event memory, not keyword matching.

---

## 2. The Insight: STL Modifiers as Universal Skill Containers

Semantic Tension Language (STL) represents knowledge as directed edges with typed modifiers:

```stl
[Source] → [Target] ::mod(key=value, key=value, ...)
```

The key insight is that STL modifiers are **semantically unconstrained** — they can encode any metadata the edge needs. This means the same syntax that represents factual knowledge:

```stl
[Koide_Formula] → [Lepton_Mass_Ratios] ::mod(
  rule="causal",
  confidence=0.98,
  description="Predicts tau mass to 0.1σ"
)
```

...can equally represent procedural knowledge:

```stl
[Update_Model_Catalog] → [Model_Catalog_JSON] ::mod(
  rule="empirical",
  confidence=0.98,
  path="scripts/update_model_catalog.sh",
  lesson="Data source is OpenRouter API, 349+ models, no API key needed",
  description="Full pipeline: OpenRouter API → generate.py → catalog → GitHub push"
)
```

No schema change. No new data structure. No additional engine code. The same graph, the same propagation algorithm, the same Hebbian learning — applied to a different *kind* of knowledge.

---

## 3. Architecture: The STG Skill Library Pattern

### 3.1 Skill Representation

A skill in STG is a subgraph rooted at a `Skill:` namespace node, with outgoing edges pointing to components of the operation:

```
Skill_Library ────────→ Update_Model_Catalog (the skill)
                              │
                              ├──→ OpenRouter_API (data source)
                              │    cause="curl https://openrouter.ai/api/v1/models"
                              │    effect="349+ models JSON"
                              │
                              ├──→ Model_Catalog_JSON (output artifact)
                              │    path="scripts/update_model_catalog.sh"
                              │    lesson="push needs scos-lab PAT"
                              │
                              └──→ Repo_scoslab_skc_cli (storage)
                                   description="github.com/scos-lab/skc-cli/catalog/"
                                   lesson="gh defaults to wukoayos, scos-lab needs GH_TOKEN"
```

Each edge carries **self-contained operational knowledge** through its modifiers:

| Modifier | Role | Example |
|----------|------|---------|
| `path` | Executable script or workflow | `scripts/update_model_catalog.sh` |
| `lesson` | Operational experience / gotchas | `"OAuth token expires after 7 days"` |
| `cause` | Input / trigger | `"curl https://openrouter.ai/api/v1/models"` |
| `effect` | Expected output | `"349+ models JSON with pricing"` |
| `description` | Full procedure summary | `"OpenRouter → generate.py → catalog → push"` |
| `confidence` | Reliability of this procedure | `0.98` (well-tested) vs `0.6` (experimental) |

### 3.2 Recall-to-Action via Propagation

When a user or agent queries "how do I update the model catalog?", STG's activation propagation fires:

```
propagate("update model catalog") → 5 nodes activated:

  SKC_CLI_Model_Command  (A=0.437)
  Repo_scoslab_skc_cli   (A=0.347)
  Model_Catalog_JSON     (A=0.266)
  Update_Model_Catalog   (A=0.202)
  OpenRouter_API         (A=0.176)
```

The activated subgraph contains everything needed to execute the task:
- **What** to do (description)
- **How** to do it (path to script)
- **Where** to store the result (repo location)
- **What to watch out for** (lessons from past executions)
- **What triggers it** (cause) and **what it produces** (effect)

This is **recall-to-action**: a single propagation query returns not just information, but an actionable procedure.

### 3.3 The Skill: Namespace Convention

Skills are organized under the `Skill:` namespace in STG:

```stl
[Skill:Update_Model_Catalog] → [Model_Catalog_JSON] ::mod(...)
[Skill:Publish_STL_Parser]   → [PyPI_stl_parser] ::mod(...)
[Skill:Deploy_Website]       → [Vercel_Production] ::mod(...)
```

This enables targeted queries: `query Skill:` returns all registered skills. Combined with `propagate`, this makes the skill library both browsable and semantically searchable.

---

## 4. Emergent Properties: What Happens When Memory Dynamics Meet Skills

STG was not designed as a skill library. Its mechanisms — Hebbian learning, salience decay, temporal replay, telemetry — were designed for declarative knowledge. But when procedural knowledge enters the same graph, these mechanisms produce emergent behaviors:

### 4.1 Hebbian Learning → Skill Reinforcement

Every `propagate` that activates a skill edge triggers Hebbian learning:

```
Hebbian: +4 strengthen, -0 weaken
```

Skills that are recalled frequently get stronger edges (higher salience). Skills that are never recalled naturally fade. **The graph learns which operations matter.**

This is fundamentally different from a wiki, where all procedures have equal prominence regardless of use, or a tool registry, where all tools are equally available.

### 4.2 Salience Decay → Skill Deprecation

STG separates **confidence** (truth value — does this procedure work?) from **salience** (retrieval weight — how easily is this recalled?).

A deprecated procedure retains its confidence (it *did* work) but its salience decays over time. When a new procedure replaces it, the new one naturally rises in salience through use while the old one fades — without anyone manually removing it.

### 4.3 Temporal Replay → Procedure Archaeology

Every edge in STG has a `created_at` timestamp. The temporal subsystem supports:

```bash
temporal range 2026-03-20 2026-03-23   # What skills were created/modified?
temporal around Update_Model_Catalog 24 # What happened around this skill?
temporal replay Update_Model_Catalog    # Walk the sequence of changes
```

This enables a form of **operational archaeology**: "When did we last update the catalog? What changed? What was the previous approach?" — questions that wikis and tool registries cannot answer.

### 4.4 Telemetry → Skill Analytics

STG's telemetry system captures real propagation data:

```bash
telemetry frequency   # Which skills are most recalled?
telemetry learning    # Which skill edges are being reinforced?
telemetry report      # Comprehensive usage analysis
```

This produces **skill analytics**: which operations are frequently needed, which are neglected, which have unstable confidence — enabling data-driven decisions about operational investment.

---

## 5. Production Examples

### 5.1 Skill: Update Model Catalog

**Context:** SKC CLI needs to discover the latest LLM models across providers (Claude, Gemini, OpenAI, Ollama). Model lists go stale as providers release new models.

**Skill subgraph:**

```stl
[Skill:Update_Model_Catalog] → [Model_Catalog_JSON] ::mod(
  rule="empirical",
  confidence=0.98,
  path="scripts/update_model_catalog.sh",
  description="OpenRouter API → generate.py → model_catalog.json → GitHub push → local sync",
  lesson="Data source: OpenRouter API (349+ models, no API key). Push needs GH_TOKEN=github_scoslab_pat"
)

[Skill:Update_Model_Catalog] → [OpenRouter_API] ::mod(
  rule="causal",
  confidence=0.99,
  cause="curl https://openrouter.ai/api/v1/models",
  effect="349+ models JSON with pricing, context_length, provider info",
  description="Public API, no auth required"
)

[Skill:Update_Model_Catalog] → [Repo_scoslab_skc_cli] ::mod(
  rule="empirical",
  confidence=0.98,
  description="Remote storage: github.com/scos-lab/skc-cli/catalog/model_catalog.json",
  lesson="gh defaults to wukoayos account, scos-lab operations require GH_TOKEN prefix"
)
```

**Recall test:**

```
propagate("update model catalog") → 5 nodes, 4.2ms
  SKC_CLI_Model_Command  (A=0.437)
  Repo_scoslab_skc_cli   (A=0.347)
  Model_Catalog_JSON     (A=0.266)
  Update_Model_Catalog   (A=0.202)
  OpenRouter_API         (A=0.176)
```

### 5.2 Skill: Publish STL Parser to PyPI

**Context:** The `stl-parser` Python package needs periodic releases to PyPI. The process involves version bumping, tagging, and automated CI/CD.

**Skill subgraph:**

```stl
[Skill:Publish_STL_Parser] → [PyPI_stl_parser] ::mod(
  rule="empirical",
  confidence=0.99,
  path="STL-TOOLS/.github/workflows/publish.yml",
  description="Auto-publish: bump pyproject.toml version → commit → git tag vX.Y.Z → push → GitHub Actions test+build+publish",
  lesson="Trusted Publisher configured (owner=scos-lab, repo=STL-TOOLS, workflow=publish.yml, env=pypi). Tag must start with v and match pyproject.toml version"
)

[Skill:Publish_STL_Parser] → [Repo_scoslab_STL_TOOLS] ::mod(
  rule="empirical",
  confidence=0.98,
  description="Source at github.com/scos-lab/STL-TOOLS",
  lesson="CI ruff command needs 'ruff check' not 'ruff' — known issue"
)
```

**Recall test:**

```
propagate("publish stl parser pypi") → 7 nodes, 11.8ms
  STL_Parser_Hyphen_Support  (A=0.691)
  Skill_Library              (A=0.395)
  PyPI_stl_parser            (A=0.341)
  Update_Model_Catalog       (A=0.227)
  Repo_scoslab_STL_TOOLS     (A=0.189)
  Publish_STL_Parser         (A=0.185)
  Procedural_Memory          (A=0.156)
```

Note how the propagation also activated `Update_Model_Catalog` — because both skills share the `Skill_Library` hub node. **Related skills surface together**, enabling cross-pollination of operational knowledge.

---

## 6. Comparison with Existing Approaches

| Capability | Wiki / Runbook | LLM Tool Registry | RAG | **STG Skill Library** |
|------------|:-:|:-:|:-:|:-:|
| Semantic search | ✗ | ✗ | ✓ | ✓ |
| Executable references | ✗ | ✓ | ✗ | ✓ |
| Learning from use | ✗ | ✗ | ✗ | ✓ (Hebbian) |
| Natural deprecation | ✗ | ✗ | ✗ | ✓ (salience decay) |
| Temporal replay | ✗ | ✗ | ✗ | ✓ |
| Operational lessons | Scattered | Not stored | Lost in chunks | ✓ (lesson modifier) |
| Related skill discovery | Manual links | No | Keyword overlap | ✓ (propagation) |
| Usage analytics | Page views only | Call count only | Query logs | ✓ (telemetry) |
| Unified with factual knowledge | ✗ | ✗ | ✗ | ✓ (same graph) |

The key differentiator is **unification**: STG stores procedural and declarative knowledge in the same graph, with the same query mechanism, the same learning dynamics, and the same temporal structure. A factual edge about Koide's formula and a procedural edge about PyPI publishing coexist, and a sufficiently broad propagation can activate both — enabling the agent to connect theoretical knowledge with practical operations.

---

## 7. Implications

### 7.1 For AI Agent Architecture

The STG Skill Library suggests that agent memory should not be split into "knowledge base" and "tool registry." These are the same thing viewed from different angles: a knowledge edge says "X is related to Y because Z"; a skill edge says "to achieve X, do Y because Z." Unifying them in one graph allows the agent to reason about its own capabilities using the same mechanisms it uses to reason about the world.

### 7.2 For Operational Knowledge Management

Every organization has operational procedures trapped in wikis, Slack threads, and tribal knowledge. The STG Skill Library pattern offers a way to capture these procedures as structured, searchable, self-reinforcing knowledge — where frequently used procedures rise in prominence and obsolete ones naturally fade, without manual curation.

### 7.3 For STL as a Language

The fact that STL modifiers can express procedural knowledge without language changes validates the design principle of **semantic openness**: modifiers are typed key-value pairs with no fixed schema, allowing the same syntax to serve uses not anticipated at design time. `path=`, `lesson=`, `cause=`, `effect=` are not special-cased in the language — they are ordinary modifiers that acquire procedural semantics through convention.

---

## 8. Conclusion

We presented the STG Skill Library, an approach to procedural knowledge management that emerges naturally from the existing STG architecture. By encoding skills as STL edges with `path`, `lesson`, `cause`, and `effect` modifiers, and organizing them under the `Skill:` namespace, we achieve recall-to-action — the ability to recall not just what something is, but how to do it — through the same propagation mechanism used for declarative knowledge.

The approach requires no new engine code, no schema changes, and no additional infrastructure. It works because STL was designed with semantic openness, and because STG's memory dynamics (Hebbian learning, salience decay, temporal structure) are domain-agnostic — they apply equally to facts and to procedures.

The STG Skill Library reframes knowledge graphs from "what do I know?" to "what do I know *and* what can I do?" — unifying declarative and procedural memory in a single, living graph.

---

## Further Reading

- [Semantic Tension Language: Core Specification](/articles/stl-paper) — The STL language design
- [STL as Context Compression for LLMs](/articles/context-compression) — Using STL for efficient LLM context
- [STL-Guided Code Generation](/articles/stl-llm-code-generation) — Empirical experiment on STL + LLMs

---

## Open Source

- **STL Specification:** [github.com/scos-lab/semantic-tension-language](https://github.com/scos-lab/semantic-tension-language)
- **STL Parser (PyPI):** [pypi.org/project/stl-parser](https://pypi.org/project/stl-parser/) — v1.8.1
- **SKC CLI:** [github.com/scos-lab/skc-cli](https://github.com/scos-lab/skc-cli)
- **Website:** [stl-lang.org](https://stl-lang.org)
