# Scenario — GSDLC Lite: Requirements to Design to Code

**Scenario ID**: SCN-GSDLCLITE-001  
**Status**: Baseline  
**Category**: Capability Scenario  
**Date**: 2026-03-27  
**Derives from**: [INTENT.md](../../../../specification/INTENT.md), [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md)
**Governs**: fake-lane and live-lane sandbox qualification for a minimal `requirements -> design -> code` build chain

---

## Purpose

Define the smallest multi-step GSDLC-style scenario that proves abiogenesis can move through three core build stages:

- requirements
- design
- code

This scenario is intentionally narrow:

- one authored requirements source
- one generated design artifact
- one generated code artifact
- one deterministic standard at each edge
- one optional live-agent generation step at each edge

It is the first canonical chained scenario after the single-edge baselines.

---

## Scenario Statement

Given a tagged requirements artifact, the engine shall produce a design artifact that traces to those requirements, and then produce a code artifact that implements the designed service surface.

---

## Topological Reading

The scenario is a two-edge chain:

```text
requirements -> design -> code
```

With one overall build flow:

- source: `requirements`
- intermediate: `design`
- target: `code`

The scenario is intentionally sequential. The design artifact must exist and pass its gate before the code artifact is attempted.

### Zoom Variant

The `requirements -> design` edge may also be expressed as an explicit zoom selection:

- direct design profile
- zoomed design profile

The zoomed profile preserves the same outer contract but expands the inner structure to:

```text
requirements -> decomposition -> dependency_chain -> sequencing -> design
```

This variant should be represented through an explicit `CandidateFamily` and `SelectionDecision`, not hidden interpreter strategy.

---

## Edge 1 — Requirements to Design

### Source Artifact

`requirements.md`

Baseline shape:

- tagged `REQ-*` families
- project lifecycle and archived-project behavior

### Target Artifact

`design.md`

Baseline design contract:

- `## Components`
- `## Interfaces`
- `## Decomposition`
- `## Dependency Chain`
- `## Sequencing`
- `## Traceability`
- at least two components
- interfaces for:
  - `create_project`
  - `archive_project`
  - `search_projects`
- explicit dependency chain:
  - `ProjectService -> ProjectStore`
- at least three ordered decomposition/sequencing steps
- explicit traceability to every requirement family

### Evaluators

#### F_D

`design_standard`

Responsibilities:

- design artifact exists
- required sections exist
- all requirement family ids are represented
- required interfaces are declared
- dependency chain is declared
- sequencing is explicitly ordered

#### F_P

`design_quality`

Responsibilities:

- design is coherent
- components and interfaces are distinct
- decomposition is meaningful rather than flat restatement
- dependency chain and sequencing are intelligible
- design does not collapse into code syntax
- placeholder language is absent

---

## Edge 2 — Design to Code

### Source Artifact

`design.md`

This is the generated output from edge 1, consumed as live workspace context.

### Target Artifact

`project_service.py`

Baseline code contract:

- defines `ProjectService`
- implements:
  - `create_project`
  - `archive_project`
  - `search_projects`
- no placeholder markers
- no `pass` stubs

### Evaluators

#### F_D

`code_standard`

Responsibilities:

- code artifact exists
- required symbols are implemented
- placeholder or stub markers are absent

#### F_P

`code_quality`

Responsibilities:

- code reflects the designed service surface
- code is non-placeholder and minimally coherent
- code can serve as a real starting implementation

---

## Deterministic Proof Obligations

The scenario succeeds only if all of the following hold:

1. `design.md` is created.
2. `design.md` passes the design standard.
3. `design.md` contains explicit decomposition, dependency chain, and sequencing.
4. `project_service.py` is created only after design convergence.
5. `project_service.py` passes the code standard.
6. Both edges converge under explicit event and result ingestion.
7. The code step consumes the live zoomed-in design artifact as context rather than a static placeholder.

---

## Sandbox Test Shape

### Fake Lane

The fake lane should prove engine law over both edges.

Recommended structure:

1. install real sandbox
2. publish a module with both edges
3. run `gen_iterate` and get `requirements -> design`
4. inject a compliant `design.md`
5. run deterministic design check
6. ingest design quality result
7. run `gen_iterate` again and get `design -> code`
8. inject a compliant `project_service.py`
9. run deterministic code check
10. ingest code quality result
11. assert full convergence

### Live Lane

The live lane should prove the same chain through real agent generation.

Recommended structure:

1. install real sandbox
2. publish the same module
3. run edge 1 and hand manifest prompt to the live agent
4. run deterministic design check
5. ingest design quality result
6. run edge 2 and hand manifest prompt to the live agent
7. run deterministic code check
8. ingest code quality result
9. assert full convergence

The live lane should archive both prompts, results, and checker outputs.

---

## Scenario Family Role

This is the canonical first chained GSDLC-lite scenario.

It is the preferred place to grow:

- review-round convergence on design before code
- correction/reset and replay on design review
- bounded subwork inside the code edge
- role-gated worker progression across the chain
- alternate design candidates with explicit selection
- alternate code candidates with explicit selection
- downstream layering into tests, UAT, or packaging

The governing qualification layering for this scenario now lives in:

- [GSDLC_LITE_QUALIFICATION_LADDER.md](https://github.com/foolishimp/abiogenesis/blob/main/build_tenants/abiogenesis/python/design/GSDLC_LITE_QUALIFICATION_LADDER.md)
