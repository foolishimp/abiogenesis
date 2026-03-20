# genesis — Intent

**Intent ID**: INT-001
**Date**: 2026-03-15
**Status**: Approved

---

## The Problem

AI-augmented software development lacks a clean, formal engine. The existing genesis engine (ai_sdlc_method v3.1.0) evolved organically — it works, but it is not GTL-first, it carries accumulated legacy, and it cannot be re-derived from first principles. There is no reference implementation that demonstrates the full AI SDLC asset graph from intent through to code+tests using the GTL type system as the constitutional language.

---

## What We Want

A clean, GTL-first implementation of Genesis V1.0 — an AI SDLC engine that:

1. Defines the SDLC as a typed asset graph (6 assets, 5 edges) in a GTL Package
2. Implements the convergence engine: `iterate()` drives candidates toward stability via three evaluator types (F_D deterministic, F_P agent, F_H human)
3. Grounds convergence projection in Event Calculus: five prime operators (`found`, `approved`, `assessed`, `revoked`, `intent_raised`), two fluents (`operative`, `certified`), three convergence models
4. Provides commands (`gen-start`, `gen-iterate`, `gen-gaps`) as named compositions over the engine
5. Enforces traceability from REQ keys through code to tests via tag enforcement
6. Binds convergence events to workflow provenance (version, spec_hash) to prevent stale assessment reuse
7. Is built by the current genesis engine using itself as bootstrap compiler (the GCC/C analogy)
8. Reaches a self-hosting gate: abiogenesis can build itself

The spec is `gtl_spec/packages/abiogenesis.py` — the GTL Package IS the requirement registry. `specification/` provides human-readable requirement descriptions and acceptance criteria for each REQ key registered in the Package.

---

## Business Value

- **Proof of concept for GTL**: demonstrates that a complex system (the genesis engine itself) can be formally specified as a GTL Package and then built from that spec
- **Bootstrap independence**: once self-hosting, abiogenesis no longer depends on ai_sdlc_method for its own development
- **Reference implementation**: every future genesis build (Codex, Gemini, Bedrock, Java, Temporal) derives from this clean topology
- **GCC analogy materialised**: GTL = C, ai_sdlc_method = GCC 1.0, abiogenesis = GCC 1.1 — the language bootstraps its own compiler

---

## Success Criteria

- [x] Spec loadable: `python gtl_spec/packages/abiogenesis.py` describes the Package correctly
- [x] Engine runs `gen-start` on a fresh project and produces intent → requirements output
- [x] Engine traverses all 5 edges for a test feature vector, producing code + passing tests
- [x] All engine modules have unit + integration tests; 277+ tests passing
- [x] Sandbox E2E: fresh sandbox run creates working code+tests
- [x] Self-hosting gate: abiogenesis uses genesis to build its next iteration
- [ ] Specification is authoritative: deleting `builds/claude_code/code/` and regenerating from `specification/` + `builds/claude_code/design/adrs/` produces an equivalent compiler

---
