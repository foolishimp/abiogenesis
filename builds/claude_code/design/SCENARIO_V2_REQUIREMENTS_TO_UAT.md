# Scenario — Requirements to UAT

**Scenario ID**: SCN-V2-R2U-001  
**Status**: Baseline  
**Category**: Capability Scenario  
**Date**: 2026-03-27  
**Derives from**: [INTENT.md](/Users/jim/src/apps/abiogenesis/specification/INTENT.md), [SPEC_METHOD.md](/Users/jim/src/apps/abiogenesis/specification/SPEC_METHOD.md)  
**Governs**: fake-lane and live-lane sandbox qualification for a minimal `requirements -> uat_tests` flow

---

## Purpose

Define the second canonical toy scenario after `intent -> requirements`.

This scenario proves that abiogenesis can take a small, tagged requirements artifact and produce executable-style UAT cases under an explicit testing standard.

It is intentionally one step more demanding than the baseline:

- one authored source artifact: `requirements.md`
- one governing context artifact: `testing_standards.md`
- one target artifact: `uat_tests.md`
- one deterministic structural standard for UAT
- one optional live-agent generation step

This scenario should remain simple enough for fast fake-lane proof while being concrete enough to exercise artifact quality and postmortem archives meaningfully.

---

## Scenario Statement

Given a tagged requirements artifact and a testing standard, the engine shall produce a UAT artifact whose cases trace to the requirement families, contain executable numbered steps, declare explicit expected results, and include at least one edge-case scenario.

---

## Concrete Input Shape

### Source Artifact

`requirements.md`

Minimal shape:

- two or more tagged requirement families
- each family carries a stable `REQ-*` key
- the artifact is user-facing rather than implementation-specific

Example family ids used in the baseline:

- `REQ-PROJ-001`
- `REQ-PROJ-002`

### Governing Context

`testing_standards.md`

The minimal standard for this scenario is:

- every UAT case references one or more `REQ-*` family ids from the requirements source
- every UAT case has numbered executable steps
- every UAT case declares an explicit `Expected Result`
- the overall UAT artifact includes at least one edge case
- the output remains user-facing and implementation-neutral

### Target Artifact

`uat_tests.md`

Expected output shape:

- at least two UAT cases
- explicit requirement traceability
- numbered steps
- explicit expected results
- one normal flow and one edge case

Minimal example fragment:

```md
# UAT Test Cases

## UAT-001 — Create and Save a Project
**Requirements**: REQ-PROJ-001
**Scenario**: Normal Flow
1. Open the project workspace.
2. Enter a valid project name and owner.
3. Save the project.
**Expected Result**: The project is created, saved, and visible in the active project list.
```

The exact words are not the invariant. The declared UAT structure and traceability are.

---

## Topological Reading

This is the minimal graph shape:

```text
requirements -> uat_tests
```

With one target contract:

- input: `requirements`
- output: `uat_tests`

Like the intent baseline, this scenario does not require candidate families or recursive refinement to be useful. Those can be layered later as review rounds or alternate test-plan strategies.

---

## Evaluator Model

### F_D Deterministic Evaluator

`uat_standard`

Responsibilities:

- every requirement family id from `requirements.md` appears in the UAT artifact
- at least two UAT cases are present
- numbered steps exist
- each case declares an `Expected Result`
- at least one edge-case scenario exists

This evaluator owns the hard UAT standard.

### F_P Semantic Evaluator

`scenario_quality`

Responsibilities:

- output scenarios are concrete and user-facing
- the artifact contains both normal-flow and edge-case cases
- placeholder language is absent
- implementation leakage is absent

This evaluator owns scenario adequacy, not structural compliance.

### F_H Human Evaluator

Optional for the baseline.

Use only if:

- the semantic evaluator returns ambiguous scenario quality
- a product owner wants approval before the UAT artifact is accepted downstream

---

## Deterministic Proof Obligations

The scenario is successful only if all of the following hold:

1. `uat_tests.md` is created.
2. Every requirement family from `requirements.md` is represented in the UAT artifact.
3. Every UAT case includes numbered steps.
4. Every UAT case includes an expected result.
5. At least one edge-case scenario exists.
6. The deterministic evaluator can prove compliance without hidden interpreter logic.
7. The semantic evaluator can distinguish user-facing UAT from placeholder or implementation-leaking output.

---

## Sandbox Test Shape

### Fake Lane

The fake lane should prove engine law, not model quality.

Recommended structure:

1. install real sandbox
2. write `requirements.md`
3. write `testing_standards.md`
4. publish a module containing the `requirements -> uat_tests` boundary
5. inject a deterministic compliant `uat_tests.md`
6. run the deterministic UAT checker
7. ingest semantic judge result through `assess-result`
8. assert convergence

### Live Lane

The live lane should prove real generation under the same boundary.

Recommended structure:

1. install real sandbox
2. write the same requirements and standards artifacts
3. publish the same module
4. run `gen_iterate`
5. hand the manifest prompt to a real agent
6. run the deterministic UAT checker
7. ingest semantic judge result through `assess-result`
8. assert convergence

The live lane should archive:

- installer result
- manifest
- result
- event log
- raw agent response
- deterministic checker output

---

## Scenario Family Role

This scenario is the canonical second step after `intent -> requirements`.

It is the preferred place to grow:

- review-round convergence over test artifacts
- alternative UAT decomposition candidates
- stronger deterministic testing standards
- later handoff into downstream test execution or UAT approval workflows
