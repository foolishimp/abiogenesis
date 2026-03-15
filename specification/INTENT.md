# genesis — Intent

**Intent ID**: INT-001
**Date**: 2026-03-15
**Priority**: High
**Status**: Approved

---

## The Problem

AI-augmented software development lacks a clean, formal engine. The existing genesis engine (ai_sdlc_method v3.1.0) evolved organically — it works, but it is not GTL-first, it carries accumulated legacy, and it cannot be re-derived from first principles. There is no reference implementation that demonstrates the full AI SDLC asset graph from intent through to code+tests using the GTL type system as the constitutional language.

---

## What We Want

A clean, GTL-first implementation of Genesis V1.0 — an AI SDLC engine that:

1. Implements the 6 core functions (`iterate`, `project`, `emit`, `bind_fd`, `delta`, `schedule`) derived from the GTL formal system
2. Provides 3 commands (`gen-start`, `gen-iterate`, `gen-gaps`) as named compositions over those functions
3. Runs the asset graph `intent → requirements → feature_decomp → design → code ↔ unit_tests` for any project
4. Is built by the current genesis engine using itself as bootstrap compiler (the GCC/C analogy)
5. Reaches a self-hosting gate: abiogenesis can build itself

The spec is `spec/packages/genesis_core.py` — the GTL Package IS the requirements. No separate requirements document.

---

## Business Value

- **Proof of concept for GTL**: demonstrates that a complex system (the genesis engine itself) can be formally specified as a GTL Package and then built from that spec
- **Bootstrap independence**: once self-hosting, abiogenesis no longer depends on ai_sdlc_method for its own development
- **Reference implementation**: every future genesis build (Codex, Gemini, Bedrock, Java, Temporal) derives from this clean topology
- **GCC analogy materialised**: GTL = C, ai_sdlc_method = GCC 1.0, abiogenesis = GCC 1.1 — the language bootstraps its own compiler

---

## Success Criteria

- [x] Spec loadable: `python spec/packages/genesis_core.py` describes the Package correctly
- [ ] Engine runs `gen-start` on a fresh project and produces intent → requirements output
- [ ] Engine traverses all 5 edges for a test feature vector, producing code + passing tests
- [ ] All 6 core functions have unit tests, coverage ≥ 80%
- [ ] Sandbox E2E: fresh sandbox run creates working code+tests
- [ ] Self-hosting gate: abiogenesis uses genesis to build its next iteration

---
