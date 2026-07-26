# Scenario — Intent List to Tagged Requirements

**Scenario ID**: SCN-I2R-001  
**Status**: Baseline  
**Category**: Capability Scenario  
**Date**: 2026-03-27  
**Derives from**: [INTENT.md](../../../../specification/INTENT.md), [SPEC_METHOD.md](../../../../.genesis/docs/standards/SPEC_METHOD.md)
**Governs**: fake-lane and live-lane sandbox qualification for a minimal `intent -> requirements` flow

---

## Purpose

Define the smallest real scenario that proves abiogenesis can transform a short intent list into a tagged requirements artifact under an explicit requirements standard.

This scenario is intentionally small:

- one authored source artifact: `intents.md`
- one governing context artifact: `requirements_standard.md`
- one target artifact: `requirements.md`
- one dominant deterministic validation surface
- one optional live-agent generation step

It is meant to be the canonical "single-shot" scenario before more dynamic refinement is introduced.
All later toy-scenario variations should build on this one rather than replace it.

---

## Scenario Statement

Given a list of 5 intents and a requirements-tagging standard, the engine shall produce a requirements artifact whose requirement families and acceptance-criterion identifiers conform to the declared standard and whose content traces back to the source intents.

---

## Concrete Input Shape

### Source Artifact

`intents.md`

Example shape:

1. Users can create and save projects.
2. Users can assign owners to projects.
3. Users can archive projects without deleting history.
4. The system shall record an audit trail for project changes.
5. Archived projects shall be searchable in read-only mode.

### Governing Context

`requirements_standard.md`

The minimal standard for this scenario is:

- every requirement family has a stable `REQ-*` family id
- every family declares header metadata:
  - `Status`
  - `Category`
  - `Date`
  - `Derives from`
- `Category` must be one of:
  - `Capability`
  - `Constraint / Guarantee`
  - `Governance`
  - `Verification`
- every acceptance criterion has a unique key derived from the family id
- every family must trace to one or more source intents
- the `Derives from` field may only reference `intent-001` through `intent-005`
- duplicate requirement ids are forbidden
- duplicate acceptance-criterion ids are forbidden
- requirements must remain implementation-neutral

### Target Artifact

`requirements.md`

Expected output shape:

- one or more requirement families derived from the 5 intents
- each family uses the required metadata header
- each acceptance criterion is tagged according to the declared standard

Minimal example fragment:

```md
# REQ-PROJ-001 — Project Lifecycle

**Status**: Draft
**Category**: Capability
**Date**: 2026-03-27
**Derives from**: intent-001, intent-003, intent-005

## Acceptance Criteria

**REQ-PROJ-001-001**: The system shall allow a user to create a project.
**REQ-PROJ-001-002**: The system shall allow a user to archive a project without deleting its history.
**REQ-PROJ-001-003**: Archived projects shall remain searchable in read-only mode.
```

The exact wording is not the invariant. The tagged structure and traceability are.

---

## Topological Reading

This is the minimal graph shape:

```text
intents -> requirements
```

With one target contract:

- input: `intents`
- output: `requirements`

This scenario does not require structural profiles, candidate families, or recursive refinement to be useful. Those can be layered later without changing the baseline scenario.

---

## GTL Sketch

```python
intent_requirements_graph = Graph(
    name="intent_requirements_graph",
    inputs=(intent_node,),
    outputs=(requirements_node,),
    ...,
)

intent_to_requirements = GraphFunction(
    name="intent_to_requirements",
    inputs=(intent_node,),
    outputs=(requirements_node,),
    template=intent_requirements_graph,
    tags=("intent_to_requirements", "vanilla", "single_shot"),
)

requirements_gate = gate(
    target=intent_to_requirements,
    rule=requirements_rule,
    evaluators=(tag_compliance_fd, semantic_coverage_fp),
)
```

The important point is not the exact constructor syntax. The important point is:

- one explicit contract boundary
- one deterministic compliance evaluator
- one optional semantic evaluator
- no hidden strategy in the interpreter

---

## Evaluator Model

### F_D Deterministic Evaluator

`tag_compliance_fd`

Responsibilities:

- target artifact exists
- every requirement family header begins with `# REQ-`
- mandatory header metadata fields are present
- every acceptance criterion id matches `REQ-...-NNN`
- ids are unique
- every family has at least one `Derives from` reference

This evaluator owns the hard standard.

### F_P Semantic Evaluator

`semantic_coverage_fp`

Responsibilities:

- output requirements materially reflect the 5 source intents
- no obviously invented major requirement family appears without trace to source intents
- phrasing is coherent and usable

This evaluator owns semantic adequacy, not structural compliance.

### F_H Human Evaluator

Optional for the baseline.

Use only if:

- the semantic evaluator returns ambiguous coverage
- the product owner wants manual approval before downstream use

The baseline fake lane should not require `F_H`.

---

## Deterministic Proof Obligations

The scenario is successful only if all of the following hold:

1. `requirements.md` is created.
2. Every requirement family is tagged according to the declared standard.
3. Every acceptance criterion is tagged according to the declared standard.
4. Every requirement family traces to one or more source intents.
5. No duplicate family ids or acceptance-criterion ids exist.
6. The deterministic evaluator can prove compliance without domain-specific hidden logic in the interpreter.
7. The deterministic evaluator rejects implementation leakage and malformed category metadata.

---

## Sandbox Test Shape

### Fake Lane

The fake lane should prove the engine law, not model quality.

Recommended structure:

1. bootstrap workspace
2. write `intents.md`
3. write `requirements_standard.md`
4. publish a module containing the `intent -> requirements` boundary
5. inject a deterministic synthetic `requirements.md`
6. run `gen_gaps`
7. assert deterministic compliance passes
8. assert convergence or expected block state

The fake lane should be fast and fully reproducible.

### Live Lane

The live lane should prove real generation under the same boundary.

Recommended structure:

1. bootstrap workspace
2. write `intents.md`
3. write `requirements_standard.md`
4. publish the same module
5. run `gen_iterate` or `traverse`
6. hand the produced manifest/prompt to the live agent
7. verify the generated `requirements.md` with the deterministic evaluator
8. optionally run semantic judging through `F_P`

The live lane should remain single-shot for this scenario. It does not need recursive refinement to be valuable.

---

## Variation Ladder

This scenario is the baseline and should be extended incrementally:

1. single-shot `intent -> requirements`
2. stronger requirement-standard compliance and richer deterministic checks
3. multiple valid requirement-family decompositions behind explicit selection
4. review-round convergence over the produced requirements artifact
5. refinement from requirements into design under the same tagging discipline

Each later step should preserve this scenario as the simplest still-valid proof.

---

## Why This Scenario Matters

This scenario is the cleanest proof of the constitutional chain:

```text
intent -> requirements
```

It exercises:

- authored GTL module publication
- deterministic evaluator boundaries
- fake versus live transport split
- requirements-standard compliance
- traceability from source intent to produced requirements

It does not yet require:

- candidate-family selection
- refinement synthesis
- multi-round consensus
- harvest topology

That makes it the right baseline scenario for rebuilding confidence in the engine.

---

## Likely Next Increment

Once this scenario is stable, the natural extension is:

```text
intent -> requirements -> design
```

But the baseline should be proven first. If this scenario is not clean, every richer scenario will hide the same defects behind more moving parts.
