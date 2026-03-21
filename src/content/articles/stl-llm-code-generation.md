# STL as Intermediate Representation for LLM Code Generation: A Comparative Experiment

> **Report Type:** Empirical Experiment Report
> **Version:** 1.0
> **Date:** 2026-03-01
> **Authors:** Wuko (experiment design & execution), Syn-claude (plan generation & evaluation)
> **Organization:** SCOS Lab (https://github.com/scos-lab)
> **License:** CC BY 4.0
> **Citation:** SCOS Lab. (2026). *STL as Intermediate Representation for LLM Code Generation: A Comparative Experiment.* https://stl-lang.org/research/llm-code-generation-experiment

---

## Abstract

This report presents a controlled experiment comparing three specification formats — Natural Language (NL), STL (Semantic Tension Language), and STLC (Semantic Tension Language for Code) — as inputs to an LLM code generation agent. The same application (MarkView, a cross-platform Markdown reader) was specified identically across all three formats, then each specification was provided to a separate instance of Google Gemini CLI to generate a complete implementation. The results reveal that **STL produces the highest-quality output** (68% feature completion), outperforming both STLC (53%) and NL (45%). More significantly, STL was the **only format that enabled fully autonomous execution** — the LLM completed the entire implementation without any human intervention. These findings suggest that STL occupies a "sweet spot" of structural formality that enhances LLM execution capability without the overhead penalties of over-specification.

---

## 1. Introduction

### 1.1 Research Question

**Does the format of a software specification affect the quality of code produced by an LLM executing that specification?**

As Large Language Models increasingly serve as code generation agents, the question of how to communicate requirements to these agents becomes critical. Traditional software engineering uses natural language specifications, but LLMs can also process structured formats. This experiment tests whether structured semantic representations (STL/STLC) provide measurable advantages over natural language when used as LLM-facing specifications.

### 1.2 Background

**STL (Semantic Tension Language)** is a knowledge representation format that structures information through directional semantic relations:

```
[Source] -> [Target] ::mod(key=value, ...)
```

STL represents "what exists" — entities, relationships, properties, and constraints — in a structured but human-readable format.

**STLC (Semantic Tension Language for Code)** extends STL with computational semantics, modeling software as executable flows with Entry/Exit nodes, branching, error paths, side effects, and validation chains. STLC represents "how it works" — the computational flows that transform inputs to outputs.

**Natural Language (NL)** represents the baseline — traditional prose-based specification describing features, requirements, and implementation guidance.

### 1.3 Hypothesis

**H1 (Initial):** STLC > STL > NL — More structured specifications produce better code.

**H2 (Alternative):** There exists an optimal level of structural formality. Too little structure (NL) leads to ambiguity; too much structure (STLC) may constrain or distract the LLM from practical implementation details.

---

## 2. Methodology

### 2.1 Experimental Design

**Design Type:** Between-subjects, single-factor experiment with three conditions.

**Independent Variable:** Specification format (NL, STL, STLC).

**Dependent Variables:**
- Feature completion rate (19-item checklist)
- Build success (compilability)
- Execution autonomy (human interventions required)
- Code quality (error handling, structure, type safety)

**Controlled Variables:**
- Same application (MarkView — a Markdown reader for Windows)
- Same feature set (19 features, identically specified across all formats)
- Same technology stack (Tauri 2 + React 19 + TypeScript + Zustand)
- Same LLM executor (Google Gemini CLI, same model version)
- Same execution environment (Windows, same machine)
- Same initial prompt: *"Based on the provided plan, implement the complete MarkView application from scratch — a cross-platform Markdown reader built with Tauri 2 + React 19 + TypeScript, targeting the Windows App Store. Follow the plan exactly, implement all specified features, and produce production-ready code."*
- All three Gemini instances had identical memory state (including STL knowledge)

### 2.2 Application Under Test: MarkView

MarkView is a cross-platform Markdown reader targeting the Microsoft Store, with the following feature requirements:

| # | Feature | Category |
|---|---------|----------|
| 1 | Open file via dialog (Ctrl+O) | Core I/O |
| 2 | Open folder with tree browser (Ctrl+Shift+O) | Core I/O |
| 3 | GFM tables, task lists, strikethrough | Rendering |
| 4 | KaTeX math expression rendering | Rendering |
| 5 | Code block syntax highlighting | Rendering |
| 6 | Table of Contents with scroll spy | Navigation |
| 7 | Drag & drop file opening | Core I/O |
| 8 | In-document search with case toggle | Search |
| 9 | Theme toggle with persistence | Preferences |
| 10 | Font size control with persistence | Preferences |
| 11 | External links open in system browser | Navigation |
| 12 | Local image rendering via asset protocol | Rendering |
| 13 | File watcher with auto-reload + scroll preservation | Core I/O |
| 14 | Print mode (Ctrl+P) | Output |
| 15 | Sidebar toggle with animation | UI |
| 16 | Recent files list with persistence | Preferences |
| 17 | File argument launch (Open with...) | Platform |
| 18 | Dynamic window title | Platform |
| 19 | MSIX build for Microsoft Store | Platform |

This application was chosen for its:
- **Moderate complexity:** ~1,200-1,500 LOC across 17-22 source files
- **Full-stack scope:** Rust backend + TypeScript frontend + CSS styling + configuration
- **Real-world applicability:** A genuine useful application, not a contrived benchmark
- **Measurable features:** Each feature is independently verifiable as PASS/PARTIAL/FAIL

### 2.3 Specification Formats

#### 2.3.1 Natural Language (NL)

Traditional prose-based specification including:
- Background description and tech stack overview
- Project directory structure
- Feature descriptions in paragraph/bullet format
- TypeScript interface definitions (embedded code)
- Keyboard shortcuts table
- Tauri configuration example
- Build commands and validation checklist

**Characteristics:** Describes "what to build" in human-readable narrative. High readability, low structural formality.

#### 2.3.2 STL (Semantic Tension Language)

Structured knowledge representation using anchor-path-modifier syntax:

```stl
[Feature:OpenFile] -> [Action:ShowDialog] ::mod(
  rule="causal",
  confidence=0.99,
  trigger="Ctrl+O",
  intent="Open native file picker filtered to .md/.markdown/.mdx"
)
```

**Characteristics:** Same information as NL but organized into typed semantic relations. Each feature, component, state field, and dependency is an explicit node with typed connections and metadata. Describes "what exists and how things relate."

#### 2.3.3 STLC (Semantic Tension Language for Code)

Compiler interface protocol with computational flow semantics:

```stlc
[Entry_OpenFile] -> [Input_KeyboardShortcut] ::mod(
  trigger="Ctrl+O keydown event",
  preventDefault=true
)

[Input_KeyboardShortcut] -> [Query_InvokeDialog] ::mod(
  query="invoke('open_file_dialog')",
  async=true,
  side_effect="io"
)

[Query_InvokeDialog] -> [Branch_FileSelected] ::mod(
  condition="result is Some(path) or None"
)

[Branch_FileSelected] -> [Exit_Cancelled] ::mod(
  on_cancel="None -> return, no state change"
)
```

**Characteristics:** Models each feature as an executable computational flow with Entry/Exit points, branching, error paths, side effect marking, async annotations, and data type specifications. Describes "how it flows step by step."

Contains 15 frontend computational flows + 6 Rust backend command specifications.

### 2.4 Evaluation Criteria

Each of the 19 features was scored as:
- **PASS (1.0):** Feature fully implemented and functional
- **PARTIAL (0.5):** Core logic present but missing sub-requirements (e.g., persistence, animation, edge cases)
- **FAIL (0.0):** Feature not implemented, broken, or non-functional

Additional qualitative assessments:
- **Build success:** Can the project compile without errors?
- **Execution autonomy:** How many human interventions were required?
- **Error handling:** Poor / Adequate / Good / Excellent
- **Code structure:** Poor / Adequate / Good / Excellent

### 2.5 Evaluation Process

Each implementation was evaluated by an independent AI agent (Claude Opus 4.6) that:
1. Listed the complete directory structure
2. Read every source file (no file skipped)
3. Assessed each of the 19 features against the checklist
4. Evaluated code quality dimensions
5. Identified critical bugs, security issues, and missing functionality

All three evaluations ran in parallel to ensure consistent evaluation standards.

---

## 3. Results

### 3.1 Feature Completion Scores

| # | Feature | NL | STL | STLC |
|---|---------|:--:|:---:|:----:|
| 1 | Open File + render | 0.5 | **1.0** | 0.5 |
| 2 | Open Folder + tree | 0.5 | **1.0** | **1.0** |
| 3 | GFM rendering | **1.0** | **1.0** | 0.5 |
| 4 | KaTeX math | **1.0** | **1.0** | 0.0 |
| 5 | Code syntax highlighting | **1.0** | **1.0** | 0.0 |
| 6 | TOC + scroll spy | 0.5 | **1.0** | 0.5 |
| 7 | Drag & drop | 0.5 | **1.0** | **1.0** |
| 8 | In-document search | 0.5 | 0.0 | 0.5 |
| 9 | Theme persistence | 0.0 | **1.0** | **1.0** |
| 10 | Font size persistence | 0.0 | **1.0** | **1.0** |
| 11 | External links | 0.0 | **1.0** | **1.0** |
| 12 | Local images | 0.5 | 0.5 | 0.5 |
| 13 | File watcher + scroll | 0.5 | 0.5 | 0.5 |
| 14 | Print | **1.0** | 0.5 | **1.0** |
| 15 | Sidebar animation | 0.5 | 0.5 | 0.5 |
| 16 | Recent files persistence | 0.5 | **1.0** | 0.5 |
| 17 | File argument launch | 0.0 | 0.0 | 0.0 |
| 18 | Window title | 0.0 | 0.0 | 0.0 |
| 19 | MSIX build | 0.0 | 0.0 | 0.0 |
| | **Total** | **8.5/19** | **13.0/19** | **10.0/19** |
| | **Percentage** | **44.7%** | **68.4%** | **52.6%** |

### 3.2 Summary Comparison

| Metric | NL | STL | STLC |
|--------|:--:|:---:|:----:|
| **Feature Score** | 8.5/19 (45%) | **13/19 (68%)** | 10/19 (53%) |
| **Full PASS** | 4 | **11** | 6 |
| **PARTIAL** | 9 | 4 | 8 |
| **FAIL** | 6 | 4 | 5 |
| **Compiles** | NO | **YES** | YES |
| **Source Files** | 17 | **21** | 22 |
| **Lines of Code** | 1,203 | **1,483** | 1,198 |
| **Human Interventions** | 1+ | **0** | 1 |
| **Error Handling** | Poor | **Adequate** | Adequate |
| **Code Structure** | Adequate | **Good** | Good |
| **Persistence Impl.** | None | **Full** | Partial |
| **Security (CSP)** | Disabled | Disabled | Disabled |

### 3.3 Execution Autonomy

This metric captures whether the LLM could complete the entire implementation without human intervention — a critical factor for LLM agent reliability in production workflows.

| Event | NL | STL | STLC |
|-------|:--:|:---:|:----:|
| **Completed autonomously** | NO | **YES** | NO |
| **Interruption type** | LLM asked human to make shell selections | None | LLM accidentally deleted plan file with `--force` flag |
| **Human message required** | "所有shell的选择都你自己决定" (Make all shell choices yourself) | None | "刚刚的STLC文件怎么不见了？" (The STLC file disappeared?) |
| **Impact on flow** | LLM paused execution, waited for human guidance | None | Context disruption, plan had to be regenerated |

### 3.4 Critical Failures by Version

**NL Version — Build-Blocking Issues:**
- Missing `build.rs` (required by Tauri 2) — project cannot compile
- Broken regex literal in `WelcomePage.tsx` — TypeScript compilation error
- `tauri-plugin-store` declared in dependencies but never imported/used — all persistence features non-functional
- External link handler code commented out

**STL Version — Functional Gaps:**
- Search feature completely unimplemented (UI shell exists, zero search logic)
- No file argument handling, no dynamic window title, no MSIX config

**STLC Version — Implementation Oversights:**
- `highlight.js` CSS never imported — syntax highlighting visually broken despite correct JS pipeline
- `katex.min.css` never imported — math rendering visually broken despite correct JS pipeline
- Scroll container confusion (`window` vs `<main overflow-y-auto>`) — scroll spy and scroll preservation both fail silently
- Windows path separator bug (`lastIndexOf("/")` fails for backslash paths)

### 3.5 Features All Three Failed

Three features were universally failed across all versions:
- **#17 File argument launch** — None implemented `std::env::args()` or Tauri's file-open event handling
- **#18 Dynamic window title** — None called `setTitle()` or updated `document.title`
- **#19 MSIX build configuration** — None configured AppX/MSIX bundle targets with publisher identity

These represent platform-integration features that require specific API knowledge beyond general web development.

---

## 4. Analysis

### 4.1 The Structural Formality Spectrum

The results map to a clear pattern along the structural formality spectrum:

```
Formality Level:   LOW ◄──────────────────────────────► HIGH
                    │              │                │
Format:             NL            STL              STLC
Score:             45%           68%               53%
Autonomy:         Poor          Perfect           Good
                    │              │                │
                    ▼              ▼                ▼
              Under-specified  "Sweet Spot"   Over-specified
```

**Under-specification (NL):** Insufficient structural guidance causes the LLM to:
- Lack confidence in implementation choices → seeks human confirmation
- Miss implicit requirements → dependencies declared but never used
- Produce syntactically incorrect code → broken regex, missing build files
- Generate the least code (1,203 LOC) with the most failures

**Optimal specification (STL):** Structured enough to convey clear requirements while leaving implementation freedom:
- LLM proceeds with full confidence → zero human interventions
- Clear entity-relationship structure guides feature implementation
- Produces the most code (1,483 LOC) with the most features working
- Correctly implements complex integrations (plugin-store persistence, IntersectionObserver scroll spy)

**Over-specification (STLC):** Detailed computational flows cause the LLM to:
- Focus on computational logic while overlooking non-computational requirements (CSS imports, configuration files)
- Exhibit overconfidence → uses `--force` flags that destroy the plan file
- Correctly implement data flows but miss "obvious" practical details
- Produce less total code (1,198 LOC) despite having the most detailed specification

### 4.2 What STL Gets Right

STL's advantage appears to stem from three properties:

**1. Explicit Entity Relationships**

STL forces every feature, component, and dependency to be an explicit named entity with typed connections. This prevents the "declared but unused" pattern seen in the NL version (where `tauri-plugin-store` was in `package.json` but never imported).

```stl
[Feature:ThemePersistence] -> [Plugin:TauriStore] ::mod(
  rule="causal",
  operation="save/load theme preference"
)
```

The LLM sees `TauriStore` as a required entity connected to `ThemePersistence`, making it harder to "forget" the connection during implementation.

**2. Structured but Not Prescriptive**

STL describes WHAT things are and HOW they relate, but not the step-by-step HOW to implement them. This gives the LLM freedom to choose implementation patterns while ensuring all requirements are captured.

Compare:
- NL: "Theme should persist across restarts" (easy to overlook in a wall of text)
- STL: `[ThemePersistence] -> [TauriStore] ::mod(...)` (explicit relationship, hard to miss)
- STLC: 15 lines specifying Entry → Query → Mutation → Exit flow (detailed but shifts attention to flow mechanics)

**3. Confidence Without Constraint**

The STL format appears to provide enough structure for the LLM to make confident decisions independently (zero human interventions), without constraining implementation choices to the point where practical details are overlooked.

### 4.3 Why STLC Underperformed

STLC's lower-than-expected performance reveals an important insight about LLM cognition:

**Attention Displacement:** STLC's computational flow descriptions (Entry → Input → Validate → Transform → Branch → Error → Output → Exit) occupy significant attention budget. The LLM faithfully implements the specified computational logic but misses practical requirements that fall outside the flow model:

- CSS imports are not "computational operations" → omitted
- Configuration files are not "data flows" → incomplete
- Path separator conventions are not "branching conditions" → incorrect

**The STLC Paradox:** More detail in the specification led to less complete implementation, because the detail was in the wrong dimension (computational flow) rather than the dimension that needed it (practical integration).

### 4.4 The Autonomy Factor

Perhaps the most practically significant finding is the correlation between specification format and execution autonomy:

| Format | Autonomy | Explanation |
|--------|----------|-------------|
| NL | Low — asked human for shell choices | Ambiguity in NL created decision paralysis |
| STL | Perfect — fully autonomous | Clear structure enabled confident decisions |
| STLC | Good — but caused self-inflicted incident | Overconfidence led to destructive `--force` usage |

In production LLM agent workflows, execution autonomy directly translates to:
- Reduced human oversight requirements
- Faster end-to-end completion
- Lower cost per task
- Scalability of LLM agent teams

### 4.5 Implications for LLM-to-LLM Communication

When one LLM generates a plan for another LLM to execute (a common pattern in multi-agent systems), the specification format becomes a **communication protocol** between agents. This experiment suggests:

1. **Natural language is suboptimal** for LLM-to-LLM communication — it introduces the same ambiguity problems as human-to-human communication
2. **STL provides an effective intermediate representation** — structured enough to be unambiguous, flexible enough to not over-constrain
3. **Over-detailed protocols (STLC) can be counterproductive** for autonomous execution — the receiver spends too much attention parsing the protocol rather than solving the problem
4. **The optimal communication format depends on the receiver's capability** — STLC may be valuable for less capable models (like using a senior engineer's STLC to guide a junior developer), while STL is optimal for capable models

---

## 5. Threats to Validity

### 5.1 Internal Validity

- **N=1 per condition:** Each specification format was tested with a single LLM execution. Results may vary across runs due to LLM non-determinism.
- **STLC execution disruption:** The STLC version's plan file was accidentally deleted during execution, requiring human intervention and plan regeneration. This disruption may have negatively impacted the STLC score. Without this incident, STLC may have scored closer to STL.
- **Plan quality:** All three plans were generated by the same author (Syn-claude). A different plan author might produce different quality levels across formats.
- **Evaluation bias:** Evaluations were conducted by Claude Opus 4.6, which may have systematic biases in feature assessment.

### 5.2 External Validity

- **Single LLM executor:** Only Google Gemini CLI was tested. Results may differ with Claude Code, GPT, or other LLM agents.
- **Single application type:** MarkView is a desktop application with a specific tech stack. Results may not generalize to web services, CLI tools, data pipelines, or other application types.
- **Specific complexity level:** The application is moderate complexity (~1,200-1,500 LOC). Results may differ for trivial scripts or large-scale systems.

### 5.3 Construct Validity

- **Feature checklist granularity:** The 19-item checklist may not capture all quality dimensions. Code maintainability, performance, and accessibility were not formally assessed.
- **PASS/PARTIAL/FAIL scoring:** The 1.0/0.5/0.0 scoring is coarse. Two PARTIAL features may have very different levels of completeness.

---

## 6. Related Work

### 6.1 Specification Languages for Code Generation

Prior work on structured specifications for LLM code generation includes:
- **OpenAPI/Swagger** for REST API generation — domain-specific, not general-purpose
- **UML-to-code** generation — long history but poor LLM integration
- **Prompt engineering patterns** (chain-of-thought, few-shot examples) — orthogonal to this work

STL differs from these approaches in being:
- **Domain-agnostic** — applicable to any software domain
- **LLM-native** — designed for LLM consumption from the ground up
- **Semantically rich** — carries provenance, confidence, and relationship metadata
- **Incrementally formal** — NL → STL → STLC represents a spectrum of formality

### 6.2 Multi-Agent Communication Protocols

Research on LLM agent communication has explored:
- **Natural language message passing** (AutoGen, CrewAI) — our NL baseline
- **JSON-based structured messages** — rigid, no semantic metadata
- **Function call schemas** — capability description, not requirement specification

STL offers a **semantic middle ground** — more structured than natural language, more flexible than JSON schemas, and capable of carrying epistemological metadata (confidence, provenance, rules).

---

## 7. Conclusions

### 7.1 Key Findings

1. **STL outperforms both NL and STLC** as a specification format for LLM code generation (68% vs 45% vs 53% feature completion).

2. **STL enables fully autonomous LLM execution** — the only format where the LLM completed the entire implementation without human intervention.

3. **Over-specification can be counterproductive** — STLC's detailed computational flows displaced LLM attention from practical implementation details (CSS imports, configuration), resulting in "structurally correct but practically broken" code.

4. **Specification format affects not just output quality, but execution behavior** — NL causes decision paralysis (asks for human help), STL enables confident autonomous execution, STLC causes overconfidence (destructive `--force` usage).

5. **There exists a "sweet spot" of structural formality** — enough structure to eliminate ambiguity (unlike NL), but not so much that it constrains the executor's problem-solving (unlike STLC).

### 7.2 Practical Recommendations

| Scenario | Recommended Format | Rationale |
|----------|-------------------|-----------|
| Capable LLM executing autonomously | **STL** | Optimal balance of structure and freedom |
| Less capable LLM or human junior developer | **STLC** | Detailed flows compensate for lower capability |
| Quick prototyping, solo developer | **NL** | Lowest overhead, acceptable for simple tasks |
| LLM-to-LLM communication in multi-agent systems | **STL** | Unambiguous, semantically rich, not over-constraining |
| Safety-critical systems | **STLC** | Explicit error paths and validation chains |

### 7.3 Future Work

1. **Larger sample size:** Repeat the experiment N=10 per condition with randomized LLM instances to establish statistical significance.
2. **Cross-model testing:** Test with Claude Code, GPT, and other LLM agents to assess generalizability.
3. **Complexity scaling:** Test across trivial (100 LOC), moderate (1,000 LOC), and complex (10,000+ LOC) applications.
4. **STLC with practical annotations:** Extend STLC to include non-computational requirements (CSS dependencies, configuration, platform conventions) and re-test.
5. **Hybrid format:** Test STL specifications with selective STLC flows for complex features only.
6. **Multi-agent pipeline:** Test a two-stage pipeline where one LLM generates STL from NL requirements, and another LLM generates code from STL.

---

## 8. Data Availability

### 8.1 Artifacts

| Artifact | Location |
|----------|----------|
| NL Plan | `plan_natural_language.md` |
| STL Plan | `plan_stl.md` |
| STLC Plan | `plan_stlc.md` |
| NL Implementation | `PLAN_natural_language/markview/` |
| STL Implementation | `PLAN_STL/markview/` |
| STLC Implementation | `PLAN_STLC/` |

### 8.2 Reproduction Steps

1. Prepare three identical LLM agent instances with STL knowledge in memory
2. Provide each instance with one plan file and the execution prompt
3. Allow each instance to complete autonomously (record any human interventions)
4. Evaluate each implementation against the 19-item feature checklist
5. Compare feature scores, build success, autonomy, and code quality

---

## Appendix A: Detailed LOC Breakdown

### A.1 NL Version (1,203 LOC, 17 files)

| File | LOC | Category |
|------|-----|----------|
| App.tsx | 120 | Layout |
| FolderTree.tsx | 75 | Component |
| MarkdownView.tsx | 47 | Component |
| SearchBar.tsx | 145 | Component |
| Sidebar.tsx | 40 | Component |
| TOC.tsx | 38 | Component |
| Toolbar.tsx | 104 | Component |
| WelcomePage.tsx | 71 | Component |
| useMarkdown.ts | 65 | Hook |
| main.tsx | 11 | Entry |
| appStore.ts | 130 | State |
| globals.css | 50 | Style |
| markdown.css | 100 | Style |
| tauriCommands.ts | 20 | Utils |
| commands.rs | 155 | Rust Backend |
| lib.rs | 26 | Rust Backend |
| main.rs | 6 | Rust Backend |

### A.2 STL Version (1,483 LOC, 21 files)

| File | LOC | Category |
|------|-----|----------|
| App.tsx | 152 | Layout |
| App.css | 116 | Style (template) |
| FolderTree.tsx | 85 | Component |
| MarkdownView.tsx | 88 | Component |
| SearchBar.tsx | 86 | Component |
| Sidebar.tsx | 45 | Component |
| TOC.tsx | 65 | Component |
| Toolbar.tsx | 111 | Component |
| WelcomePage.tsx | 44 | Component |
| useMarkdown.ts | 71 | Hook |
| useTheme.ts | 83 | Hook |
| index.css | 20 | Style |
| main.tsx | 10 | Entry |
| appStore.ts | 87 | State |
| markdown.css | 140 | Style |
| themes.css | 32 | Style |
| tauriCommands.ts | 38 | Utils |
| vite-env.d.ts | 1 | Type Decl |
| commands.rs | 177 | Rust Backend |
| lib.rs | 26 | Rust Backend |
| main.rs | 6 | Rust Backend |

### A.3 STLC Version (1,198 LOC, 22 files)

| File | LOC | Category |
|------|-----|----------|
| App.tsx | 70 | Layout |
| App.css | 1 | Style (empty) |
| FolderTree.tsx | 75 | Component |
| MarkdownView.tsx | 132 | Component |
| SearchBar.tsx | 100 | Component |
| Sidebar.tsx | 42 | Component |
| TOC.tsx | 64 | Component |
| Toolbar.tsx | 94 | Component |
| WelcomePage.tsx | 54 | Component |
| useMarkdown.ts | 22 | Hook |
| useTheme.ts | 43 | Hook |
| main.tsx | 9 | Entry |
| appStore.ts | 112 | State |
| markdown.css | 79 | Style |
| themes.css | 34 | Style |
| fileTypes.ts | 6 | Utils |
| markdown.ts | 53 | Utils |
| tauriCommands.ts | 32 | Utils |
| vite-env.d.ts | 1 | Type Decl |
| commands.rs | 145 | Rust Backend |
| lib.rs | 24 | Rust Backend |
| main.rs | 6 | Rust Backend |

---

## Appendix B: Feature Evaluation Details

### B.1 Features Where STL Uniquely Succeeded

| Feature | STL Implementation | Why NL/STLC Failed |
|---------|-------------------|---------------------|
| **Scroll spy (IntersectionObserver)** | Correct IntersectionObserver on headings, active heading state updates on scroll | NL: not implemented; STLC: attached to `window` instead of scrollable container |
| **Theme persistence** | Correctly uses `@tauri-apps/plugin-store` save/load | NL: plugin declared but never imported; STLC: implemented correctly |
| **Recent files persistence** | Full round-trip: load from store → update in memory → save on change | NL: in-memory only; STLC: loads from store but never saves back |
| **External links** | `shell.open()` correctly imported and called | NL: code was commented out; STLC: implemented correctly |

### B.2 STLC's "Structurally Correct, Practically Broken" Pattern

| Feature | JS Pipeline | CSS/Config | Result |
|---------|:-----------:|:----------:|--------|
| Syntax highlighting | `rehype-highlight` correctly in unified pipeline | `highlight.js` CSS never imported | Code renders monochrome |
| KaTeX math | `remark-math` + `rehype-katex` correctly in pipeline | `katex.min.css` never imported | Math renders as broken HTML |
| Scroll spy | `IntersectionObserver` logic correct | Attached to `window` instead of overflow container | Never fires |

This pattern — correct computational logic paired with missing practical integration — is characteristic of over-specification: the STLC flows describe the JavaScript computation but not the CSS/configuration dependencies that make it visually functional.

---

## Appendix C: Execution Timeline

### C.1 NL Execution

```
Start → npx create-vite (interactive prompt appears)
     → LLM pauses, asks human to make shell selection
     → Human: "所有shell的选择都你自己决定，不要让我选择"
     → LLM resumes with non-interactive commands
     → Implementation proceeds to completion
     → Result: Does not compile (missing build.rs, TS syntax error)
```

### C.2 STL Execution

```
Start → Project scaffolding
     → Component implementation
     → Rust backend implementation
     → CSS and configuration
     → Build and verify
     → End (fully autonomous, zero interruptions)
     → Result: Compiles successfully, dist/ output produced
```

### C.3 STLC Execution

```
Start → npx create-tauri-app --force
     → plan_stlc.md deleted by --force flag
     → Human notices: "刚刚的STLC文件怎么不见了？"
     → LLM explains: --force cleared non-template files
     → LLM restores plan from memory
     → Human interrupts to get plan regenerated externally
     → Implementation resumes and completes
     → Result: Compiles but missing CSS imports, scroll bugs
```

---

*Report generated 2026-03-01 by SCOS Lab. For questions or reproduction assistance, contact the authors via https://github.com/scos-lab.*
