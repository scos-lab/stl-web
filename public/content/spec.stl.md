# STL Specification

[Meta:Spec] -> [SEO] ::mod(
  title="STL Specification — Core Spec, Supplement, Protocol",
  description="Official STL specification documents: Core Specification v1.0, Supplement, and Operational Protocol for LLMs.",
  keywords="STL specification, STL core spec, STL supplement, operational protocol"
)

# --- Hero ---

[Page:Spec] -> [Hero:Spec] ::mod(
  title="Specification",
  subtitle="The formal definition of Semantic Tension Language. Everything you need to implement STL correctly."
)

# --- Core Spec ---

[Page:Spec] -> [Content:CoreSpec] ::mod(
  title="STL Core Specification v1.0",
  description="The foundational specification defining STL syntax, semantics, anchor types, path expressions, and the modifier system. This is the primary reference for all STL implementations.",
  href="https://github.com/scos-lab/semantic-tension-language",
  confidence=1.0,
  order=1
)

# --- Supplement ---

[Page:Spec] -> [Content:Supplement] ::mod(
  title="STL Supplement",
  description="Extended specification covering advanced features: modifier layering, namespace conventions, tension networks, serialization formats (JSON, JSON-LD, RDF/Turtle).",
  href="https://github.com/scos-lab/semantic-tension-language",
  confidence=1.0,
  order=2
)

# --- Operational Protocol ---

[Page:Spec] -> [Content:Protocol] ::mod(
  title="STL Operational Protocol v1.0",
  description="Compiler-facing protocol for LLMs. Defines how language models should generate valid STL: anchor naming conventions, confidence calibration, mandatory fields by context, anti-patterns, and validation checklists.",
  href="https://github.com/scos-lab/semantic-tension-language",
  confidence=1.0,
  order=3
)

# --- Quick Reference ---

[Page:Spec] -> [Content:QuickRef] ::mod(
  title="Quick Reference",
  description="Minimal valid statement: [Source] -> [Target]. Recommended: add ::mod(confidence=, source=, time=). Complete: add rule=, strength=, author=, timestamp=, domain=.",
  order=4
)

[Page:Spec] -> [CodeExample:Minimal] ::mod(
  title="Minimal Valid Statement",
  language="stl",
  code="[Source] -> [Target]"
)

[Page:Spec] -> [CodeExample:Recommended] ::mod(
  title="Recommended (Factual)",
  language="stl",
  code="[Source] -> [Target] ::mod(\n  confidence=0.85,\n  source=\"reference\",\n  time=\"2026-02-17\"\n)"
)

[Page:Spec] -> [CodeExample:Complete] ::mod(
  title="Complete (All Dimensions)",
  language="stl",
  code="[Source] -> [Target] ::mod(\n  rule=\"causal\",\n  confidence=0.90,\n  strength=0.85,\n  time=\"2026-02-17T14:00:00Z\",\n  source=\"doi:10.1234/ref\",\n  author=\"AuthorName\"\n)"
)
