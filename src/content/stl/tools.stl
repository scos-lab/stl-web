# STL Tools Ecosystem

[Meta:Tools] -> [SEO] ::mod(
  title="STL Tools — Parser, CLI, MCP, Schemas",
  description="Complete tooling ecosystem for Semantic Tension Language: stl_parser (Python), CLI utilities, MCP server tools, and 6 domain validation schemas.",
  keywords="stl_parser, STL CLI, MCP tools, STL schema, validation"
)

# --- Hero ---

[Page:Tools] -> [Hero:Tools] ::mod(
  title="Tools & Ecosystem",
  subtitle="Everything you need to parse, validate, analyze, and build with STL."
)

# --- stl_parser ---

[Tool:STL_Parser] -> [Description] ::mod(
  name="stl_parser",
  description="The official Python parser for STL. Parse, validate, serialize, query, diff, and stream STL documents. Production-grade with comprehensive test coverage.",
  version="1.7.0",
  language="Python 3.9+",
  tests="530 tests",
  loc="3,100 LOC",
  modules="14 modules",
  install="pip install stl-parser",
  href="https://github.com/scos-lab/STL-TOOLS",
  confidence=1.0,
  timestamp="2026-02-17",
  order=1
)

[Tool:STL_Parser] -> [Feature:Parse] ::mod(capability="Parse STL text and files into structured results", api="parse(text), parse_file(path)")
[Tool:STL_Parser] -> [Feature:Validate] ::mod(capability="Syntax and semantic validation", api="validate_parse_result(result)")
[Tool:STL_Parser] -> [Feature:Serialize] ::mod(capability="Convert to JSON, RDF (Turtle/XML/N-Triples/JSON-LD)", api="to_json(), to_rdf()")
[Tool:STL_Parser] -> [Feature:Query] ::mod(capability="Django-style filtering and RFC 6901 pointer addressing", api="find(), find_all(), stl_pointer()")
[Tool:STL_Parser] -> [Feature:Build] ::mod(capability="Programmatic STL construction with type safety", api="stl(src, tgt).mod(key=val).build()")
[Tool:STL_Parser] -> [Feature:Diff] ::mod(capability="Semantic diff and patch with round-trip guarantee", api="stl_diff(a, b), stl_patch(doc, diff)")
[Tool:STL_Parser] -> [Feature:Stream] ::mod(capability="Stream large files with filtering", api="stream_parse(source, where=)")
[Tool:STL_Parser] -> [Feature:Emit] ::mod(capability="Thread-safe event logging to .stl files", api="STLEmitter(path, namespace)")
[Tool:STL_Parser] -> [Feature:LLM] ::mod(capability="Three-stage LLM output cleaning pipeline", api="validate_llm_output(raw_text)")
[Tool:STL_Parser] -> [Feature:Decay] ::mod(capability="Confidence decay over time (half-life model)", api="effective_confidence(stmt), decay_report()")
[Tool:STL_Parser] -> [Feature:Schema] ::mod(capability="Domain constraint validation against .stl.schema files", api="load_schema(), validate_against_schema()")
[Tool:STL_Parser] -> [Feature:Graph] ::mod(capability="Build NetworkX directed graphs for path and centrality analysis", api="STLGraph(result)")

# --- CLI ---

[Tool:CLI] -> [Description] ::mod(
  name="STL CLI",
  description="Command-line interface for STL operations. Validate, convert, analyze, build, query, diff, and clean STL files from the terminal.",
  install="pip install stl-parser (includes CLI)",
  href="https://github.com/scos-lab/STL-TOOLS",
  confidence=1.0,
  order=2
)

[Tool:CLI] -> [Command:validate] ::mod(usage="stl validate input.stl", description="Syntax and semantic validation")
[Tool:CLI] -> [Command:convert] ::mod(usage="stl convert input.stl --to json", description="Convert to JSON, Turtle, JSON-LD")
[Tool:CLI] -> [Command:analyze] ::mod(usage="stl analyze input.stl", description="Graph analysis report")
[Tool:CLI] -> [Command:build] ::mod(usage="stl build \"[A]\" \"[B]\" --mod \"confidence=0.9\"", description="Build statements from CLI")
[Tool:CLI] -> [Command:query] ::mod(usage="stl query input.stl --where \"confidence__gt=0.8\"", description="Filter statements")
[Tool:CLI] -> [Command:diff] ::mod(usage="stl diff a.stl b.stl", description="Semantic diff")
[Tool:CLI] -> [Command:clean] ::mod(usage="stl clean llm_output.txt", description="Clean LLM output")

# --- MCP Tools ---

[Tool:MCP] -> [Description] ::mod(
  name="MCP Server Tools",
  description="STL tools exposed as MCP (Model Context Protocol) server tools. Enables AI agents to validate, parse, and analyze STL directly.",
  confidence=1.0,
  order=3
)

[Tool:MCP] -> [MCPTool:validate_stl] ::mod(description="Validate STL text syntax and semantics")
[Tool:MCP] -> [MCPTool:parse_stl] ::mod(description="Parse STL text into structured JSON")
[Tool:MCP] -> [MCPTool:analyze_stl] ::mod(description="Graph statistics: nodes, edges, centrality, cycles")
[Tool:MCP] -> [MCPTool:validate_stl_file] ::mod(description="Validate STL file by path")

# --- Schema Ecosystem ---

[Tool:Schemas] -> [Description] ::mod(
  name="Domain Schemas",
  description="Six domain-specific validation schemas for constraining STL to specific fields. Each schema defines required anchors, modifiers, and value ranges.",
  confidence=1.0,
  order=4
)

[Tool:Schemas] -> [Schema:TCM] ::mod(domain="Traditional Chinese Medicine", file="tcm.stl.schema")
[Tool:Schemas] -> [Schema:Scientific] ::mod(domain="Scientific Research", file="scientific.stl.schema")
[Tool:Schemas] -> [Schema:Causal] ::mod(domain="Causal Reasoning", file="causal.stl.schema")
[Tool:Schemas] -> [Schema:Historical] ::mod(domain="Historical Events", file="historical.stl.schema")
[Tool:Schemas] -> [Schema:Medical] ::mod(domain="Medical/Clinical", file="medical.stl.schema")
[Tool:Schemas] -> [Schema:Legal] ::mod(domain="Legal Documents", file="legal.stl.schema")
