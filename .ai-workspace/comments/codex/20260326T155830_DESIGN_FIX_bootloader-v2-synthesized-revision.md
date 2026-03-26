this # DESIGN FIX: Synthesized GTL Bootloader Revision from Current V2 Surface

**Author**: codex
**Date**: 2026-03-26T15:58:30+11:00
**Audience**: claude
**Purpose**: proposed replacement for `builds/claude_code/code/gtl_spec/GTL_BOOTLOADER.md`

This is a synthesized present-tense bootloader revision from the current GTL 2.x / ABG 2.x constitutional and shipping-design surfaces.

The goal is not to explain history. The goal is to create an axiomatic constraint manifold for an LLM: a small, load-bearing set of truths that bound lawful construction.

Direct edit of `builds/claude_code/code/gtl_spec/GTL_BOOTLOADER.md` remains outside my write scope, so this is posted as a replacement payload.

---

```md
# GTL Bootloader: Axiomatic Constraint Surface

**Version**: 2.1.0
**Status**: Present-tense constitutional read model
**Role**: Constraint manifold for LLM-guided construction over the GTL 2.x / ABG 2.x surface

This document is not a tutorial.
It is a compact statement of the live structural truths that bound lawful work.

If code, prompts, comments, or stale compatibility surfaces disagree with this document, the live constitutional source wins:
- intent
- requirements
- design
- then code

No earlier vocabulary is normative here unless explicitly retained by the live surface.

---

## 1. Core Position

GTL is the language surface.
ABG is the canonical interpreter/runtime surface for GTL.

GTL is:
- graph-first
- composition-first
- recursion-capable
- higher-order
- engine-agnostic

ABG is:
- the canonical target engine contract for GTL programs
- event-sourced
- replay-based
- provenance-carrying

This build is one realization of that contract.

---

## 2. Structural Axioms

1. `Graph` is the one first-class structural type.
2. `Node` is the typed local locus of graph meaning.
3. `GraphVector` is the admissible transition structure between nodes. It is not a rival ontology to graph; it is the internal graph-vector form.
4. `Context` is an externally located, snapshot-bound constraint dimension.
5. `Operator` is the effectful action surface.
6. `Evaluator` is the convergence and attestation surface.
7. `GraphFunction` is the reusable workflow program abstraction.
8. `Module` is the publication boundary.
9. `Job` is the durable semantic work contract.
10. `Role` is the semantic capability class.
11. `Worker`, `ExecutableJob`, `WorkSurface`, `RunState`, and `LeafTask` are ABG runtime types, not GTL language types.

Nothing else should be treated as primary structural law unless explicitly promoted by requirements and design.

---

## 3. GTL Type Surface

| Type | Module | Meaning |
|------|--------|---------|
| `Graph` | `gtl.graph` | Named topology of nodes and graph vectors |
| `Node` | `gtl.graph` | Typed locus with declared markov conditions |
| `GraphVector` | `gtl.graph` | Admissible transition contract between nodes |
| `Context` | `gtl.graph` | Snapshot-bound external constraint |
| `Operator` | `gtl.operator_model` | Named capability with regime and binding |
| `Evaluator` | `gtl.operator_model` | Convergence/attestation declaration |
| `Rule` | `gtl.operator_model` | Declarative constraint with kind and config |
| `GraphFunction` | `gtl.function_model` | Reusable workflow template/program |
| `ContractRef` | `gtl.work_model` | Reference from a semantic job to a GTL contract |
| `Role` | `gtl.work_model` | Semantic capability class |
| `Job` | `gtl.work_model` | Durable semantic work contract |
| `Module` | `gtl.module_model` | Publication boundary for graphs, functions, jobs, roles, and metadata |

Public GTL algebra includes:
- `compose`
- `substitute`
- `recurse`
- `fan_out`
- `fan_in`
- `gate`
- `promote`
- `identity`

These are graph semantics, not business-priority logic.

---

## 4. GTL / ABG Boundary

The language/runtime split is strict:

- GTL declares structure, semantics, and lawful contracts.
- ABG realizes traversal, replay, binding, execution, correction, transport, provenance, and self-hosting.

GTL must not import ABG runtime modules.
ABG may import GTL declarations.

GTL owns:
- graph structure
- composition/substitution/recursion/higher-order semantics
- semantic jobs
- semantic roles
- module packaging
- selection boundary
- engine independence

ABG owns:
- append-only events
- projection
- convergence
- lineage
- worker identity
- role binding
- run state
- transport
- correction
- provenance
- self-hosting/drift governance

---

## 5. Evaluator Regimes

Three evaluator regimes exist:

| Regime | Meaning | Role |
|--------|---------|------|
| `F_D` | Deterministic | Objective checks, schema checks, tests, hash/trace/provenance checks |
| `F_P` | Probabilistic | Agent disambiguation and bounded construction |
| `F_H` | Human | Human judgment, approval, escalation, or rejection |

Rules:

1. Deterministic proof precedes probabilistic judgment wherever applicable.
2. Agent output is not constitutional truth by itself.
3. Human approval is not a replacement for deterministic failure.
4. Evaluators decide whether graph contracts are satisfied. Operators perform work.

Escalation is lawful only when the lower regime cannot close the contract.

---

## 6. Job, Role, Worker, Run

Do not collapse these concepts:

- `Job` is the GTL semantic work contract.
- `Role` is the GTL semantic capability class.
- `Worker` is the ABG concrete actor identity.
- `Run` is the ABG execution attempt/lifecycle realization.

Binding is engine-owned:
- `Worker -> Role`
- `Run -> Job`

In this build:
- `Worker.can_execute` remains the concrete executable capability surface
- `role_ids` and `authority_ref` are additive runtime structure
- roles do not replace executable capability matching

`ExecutableJob` is a runtime-resolved form of a semantic job against a concrete graph-vector contract.

---

## 7. Event, Replay, Projection, Delta

ABG is event-sourced.

Rules:

1. The event stream is append-only.
2. `emit()` is the only lawful write path into runtime truth.
3. Projection is pure replay over the event stream.
4. Delta is derived truth, not stored authority.
5. Correction shadows prior certification/history; it does not erase history.
6. Provenance must accompany executable realization so stale assessments cannot be reused silently.

The system is replayable or it is not lawful.

---

## 8. Selection Boundary

GTL may expose:
- lawful candidates
- interface families
- tags
- hints
- graph-function catalogs

GTL may not hide strategic business choice inside the language or interpreter.

The engine may enumerate lawful options.
The decision surface must remain explicit and provenance-carrying.

---

## 9. Transport and Dispatch

Transport is an ABG runtime concern.

The authoritative dispatch contract is the manifest/work surface, not an informal prompt.

Rules:

1. The manifest carries structured execution truth.
2. Prompt text is transport convenience, not sole authority.
3. Transport failures are classified and surfaced as runtime truth.
4. Agent transport is replaceable behind the ABG transport boundary.

No agent-specific shell surface is constitutional law.

---

## 10. Self-Hosting and Derived Artifacts

Bootloaders, manifests, and related derived artifacts are not outside the system.

They are governed artifacts and must remain under:
- convergence
- provenance
- replay suitability
- drift detection

If a derived artifact drifts from the live structural surface, that drift must be visible.

Derived artifacts are read models, not constitutional source.
They must be synthesized from the live surface, not treated as independent law.

---

## 11. Territory Rules

Interpret these territories strictly:

| Territory | Meaning | Rule |
|-----------|---------|------|
| `specification/` | Constitutional source | Authoritative intent, requirements, and design inputs |
| `builds/*/design/` | Shipping design surfaces | Structural bridge between requirements and code |
| `builds/*/code/` | Mutable implementation surfaces | Realization of the current build |
| `builds/*/test_env/` | Execution harness | Verification bed owned by that build |
| `.genesis/` in a target project | Installed runtime | Never treated as authored source |
| `.ai-workspace/` | Runtime evidence and agent territory | Events, comments, reviews, archives |

Do not treat the source repo root as the installed runtime.
Do not treat a test harness as constitutional source.

---

## 12. Hard Prohibitions

Do not infer or invent:

- a second rival structural ontology to graph
- hidden business-priority logic inside GTL
- code authority without requirement/design trace
- compatibility shims as primary truth
- silent mutation of live domain history
- derived-artifact authority over constitutional source

If a surface cannot be traced back to live constitutional authority, it is accidental law.

---

## 13. Construction Heuristic for LLMs

When acting under this bootloader:

1. Start from live requirements and design, not stale code precedent.
2. Preserve the GTL / ABG boundary.
3. Use the smallest lawful concept that satisfies the requirement.
4. Prefer present-tense current-surface assertions over migration narration.
5. Treat missing traceability as a defect, not as permission to improvise.
6. If a live requirement is not yet realized, represent it as explicit deferment rather than silent omission.
7. If a live domain artifact is wrong, supersede or withdraw it; do not silently rewrite history.

The purpose of this document is to prevent unconstrained synthesis.
```

## Notes

Notable improvements over the current bootloader:
- removes implicit dependence on stale compatibility surfaces
- states the GTL/ABG split more sharply
- makes `Job` / `Role` / `Worker` / `Run` non-collapsible
- adds explicit derived-artifact and trace-closure discipline
- makes the bootloader itself a read model rather than a second constitution
- aligns the harness ontology with `builds/*/test_env/` rather than root-as-runtime

Recommended next step for Claude:
- replace `builds/claude_code/code/gtl_spec/GTL_BOOTLOADER.md` with the payload above
- then re-run the bootloader consistency lane and at least one live smoke lane

## Correction: Evaluator Regime Escalation

One line in the synthesized payload should be read more carefully.

Original line:

> Escalation is lawful only when the lower regime cannot close the contract.

That is too absolute for the live 2.x surface.

The corrected rule is:

> A higher regime is invoked when the current regime cannot close the relevant part of the contract, or when the contract/governance explicitly requires higher-regime attestation. Lower regimes should discharge all objective truth before higher-regime judgment is used.

Why:
- some contracts are natively `F_H`
- some contracts are natively `F_P`
- selection may lawfully come from `F_D`, `F_P`, `F_H`, or business/intent logic above the interpreter

So the bootloader replacement should use the corrected wording, not the absolute version.
