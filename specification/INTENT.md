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

The spec is `builds/claude_code/code/gtl_spec/packages/abiogenesis.py` — the GTL Package IS the requirement registry. `specification/` provides human-readable requirement descriptions and acceptance criteria for each REQ key registered in the Package.

---

## Business Value

- **Proof of concept for GTL**: demonstrates that a complex system (the genesis engine itself) can be formally specified as a GTL Package and then built from that spec
- **Bootstrap independence**: once self-hosting, abiogenesis no longer depends on ai_sdlc_method for its own development
- **Reference implementation**: every future genesis build (Codex, Gemini, Bedrock, Java, Temporal) derives from this clean topology
- **GCC analogy materialised**: GTL = C, ai_sdlc_method = GCC 1.0, abiogenesis = GCC 1.1 — the language bootstraps its own compiler

---

## Success Criteria

1. Spec loadable: `python builds/claude_code/code/gtl_spec/packages/abiogenesis.py` describes the Package correctly
2. Engine runs `gen-start` on a fresh project and produces intent → requirements output
3. Engine traverses all 5 edges for a test feature vector, producing code + passing tests
4. All engine modules have unit + integration tests; test suite green
5. Sandbox E2E: fresh sandbox run creates working code+tests
6. Self-hosting gate: abiogenesis uses genesis to build its next iteration
7. Specification is authoritative: deleting `builds/claude_code/code/` and regenerating from `specification/` + `builds/claude_code/design/adrs/` produces an equivalent compiler

---

## INT-002 — Bootloader Documents as Graph Assets

**Date**: 2026-03-21
**Status**: Draft

### Problem

Bootloader documents (GTL_BOOTLOADER.md in abiogenesis, SDLC_BOOTLOADER.md in genesis_sdlc) are hand-maintained markdown that reference graph types, asset names, edge chains, and evaluator semantics from the codebase — but no F_D evaluator checks them for consistency. When the graph changes, the bootloader drifts silently. This just happened: SDLC_BOOTLOADER.md referenced phantom assets (`basis_projections`, `design_recommendations`, `cicd`, `telemetry`) that never existed in `sdlc_graph.py`. The drift was caught by a human reading diffs, not by the system.

This is structurally identical to untested code: it works until it doesn't, and you find out too late. The bootloader is installed into every dependent project's CLAUDE.md — stale content means every LLM session operates against wrong constraints.

### Value Proposition

Make bootloader documents proper graph assets with F_D evaluators that check consistency against source-of-truth code:

- **GTL_BOOTLOADER.md** checked against `gtl/core.py` type names (Asset, Edge, Evaluator, F_D/F_P/F_H, etc.)
- **SDLC_BOOTLOADER.md** checked against `sdlc_graph.py` asset names, edge names, and zoom profiles

The bootloader becomes a convergence-tracked artifact: if the graph changes and the bootloader doesn't update, delta > 0 and the system tells you.

### Scope

**In abiogenesis (this project):**
- New asset: `bootloader_doc` (BOOTDOC-{SEQ}), lineage=[design]
- New edge: `design→bootloader_doc` with:
  - F_D evaluator `gtl_type_consistency`: parse type names from `gtl/core.py`, check they appear correctly in GTL_BOOTLOADER.md
  - F_P evaluator `synthesize_bootloader`: agent renders specification content into bootloader markdown
- New context: `specification_dir` pointing to the specification/ directory
- Modified join: the bootloader must be consistent before any downstream gate that installs it (the `code↔unit_tests` edge context already references the bootloader — but now the bootloader itself is convergence-tracked)

**Pattern for genesis_sdlc (downstream — not this project):**
- Same structure: `design→bootloader_doc` with F_D checking against `sdlc_graph.py`
- Join at `integration_tests`: sandbox install requires consistent bootloader since `genesis_sdlc.install` copies the bootloader into the target's CLAUDE.md

### Out of Scope

- Auto-generating bootloader content from code (F_P synthesizes, human approves)
- Changing the GTL_BOOTLOADER.md or SDLC_BOOTLOADER.md content in this intent (content is already correct post v0.5.0 fix)
- Modifying the install chain (bootloaders are still installed via marker-bounded blocks in CLAUDE.md)

### Success Criteria

1. `gen-gaps` reports `bootloader_doc` as an asset with delta > 0 when GTL_BOOTLOADER.md references a type name not in `gtl/core.py`
2. Changing a type name in `gtl/core.py` without updating the bootloader causes the F_D evaluator to fail
3. After the bootloader is updated and F_P assesses it, delta returns to 0
4. The pattern is replicable: genesis_sdlc can add the same asset type for SDLC_BOOTLOADER.md

---
