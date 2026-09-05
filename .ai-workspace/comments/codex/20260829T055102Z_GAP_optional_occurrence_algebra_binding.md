# GAP: ABIogenesis Binding Of Optional Occurrence Algebra

**Author**: codex
**Date**: 2026-08-29T05:51:02Z
**Updated**: 2026-08-29T06:02:09Z
**Status**: Draft commentary; ABIogenesis-owned gap map
**Describes**: current ABIogenesis authority and target interpretation questions

## Exact Subjects

ABIogenesis source basis:

```text
repository = /Users/jim/src/apps/abiogenesis
commit     = 9eb0e92f81fea23a4bf6a2d7b74684d460e5b6be
tree       = 78b0fdd706576b882e6b0af9731bd79896c9fe00
origin     = origin/main at 0 ahead / 0 behind
STDO basis = v2.2.2
```

Occurrence-strategy subject:

```text
repository = /Users/jim/src/apps/specification_methodology
commit     = 6ce043322598611bf37aebb6f5e743d2f2f822c9
path       = .ai-workspace/comments/codex/
             20260829T021500Z_STRATEGY_optional_occurrence_algebra.md
sha256     = 383b1305bbd3b2eb975d6d881164a037bf6a3850c5426bc1051c5d19771c440e
size       = 711 lines / 24,808 bytes
status     = untracked Draft commentary; not accepted a_c authority
```

The ABI worktree had two unrelated pre-existing changes, excluded from this
basis and untouched by this post:

- `.ai-workspace/comments/codex/20260822T034200Z_STRATEGY_living_four_dimensional_product_lifecycle.md`;
- `build_tenants/abiogenesis/python/design/abiogenesis.code-workspace`.

## Purpose And Nonclaims

This post records what ABIogenesis Product authority would have to bind before
claiming a lossless interpretation of the optional occurrence strategy.

It does not:

- amend ABIogenesis Product, requirements, goals, or accepted design;
- import ABIogenesis identities into the independent occurrence strategy;
- select an occurrence profile, implementation, ticket, release, or repricing;
- resolve the current cross-Run authority conflict; or
- claim that the mapping below is accepted or complete.

## Product Frame

`GOAL-035` remains active. Wave 2 / `A5-F01` is current; R2/R3 design work is
selected and implementation remains unselected
(`specification/GOALS.md#Current-Goal`).

The fixed Product path is:

```text
GTL.TypeScript
  -> validation and admitted Program
  -> direct HoG traversal
  -> exact implementation seam
  -> ABG event admission and Event Calculus
  -> replay and typed projections
```

GTL owns Program meaning. HoG traverses admitted GTL. An implementation binding
identifies one declared effect seam. A selected handler performs the interior
effect. Worker identifies the concrete actor. ABG alone admits runtime truth;
replay reconstructs and projects it.

Primary authority:

- `specification/PRODUCT.md#Product-Statement`;
- `specification/INTENT.md#Program-And-Runtime-Boundary`;
- `specification/requirements/mapping/REQ-M-GTL3-PROGRAM-TRAVERSAL.md`;
- `specification/requirements/abg/REQ-R-ABG3-HANDLERS.md`;
- `specification/requirements/abg/REQ-R-ABG3-WORKER.md`.

## Application And Aggregate Classification

These are qualification questions, not selected answers:

| ABI identity | Current authority | Occurrence-binding question |
|---|---|---|
| `WorkScope` / `work_key` | stable graph-application lineage | subject/scope coordinate, not an occurrence |
| `Run` | one engine-owned execution attempt | container unless Product authority classifies it as one traversal application |
| `GraphCall` | one realized GraphFunction execution boundary | primary traversal-application candidate |
| frame lineage | stable recursive lineage | lineage coordinate |
| frame attempt | fresh recursive attempt | occurrence only when it applies the selected traversal/evaluation |
| `C` call | one compute instantiation at one locus | nested traversal-application candidate |
| actor invocation | ABG-owned supervised effect boundary | effect invocation, not the enclosing occurrence |
| `Continuation` | run-local open obligation | not an occurrence unless re-entry independently applies a traversal |

Required authority:

- `REQ-R-ABG3-RUN.md`;
- `REQ-R-ABG3-GRAPHCALL.md`;
- `REQ-R-ABG3-FRAME.md`;
- `REQ-R-ABG3-LINEAGE.md`;
- `REQ-R-ABG3-CONTINUATION.md`;
- `REQ-R-ABG3-CCALL.md`;
- `REQ-R-ABG3-TRANSPORT.md`.

Run, GraphCall, Frame, and Continuation retain distinct projections.
`OccurrenceProjection` cannot replace them
(`REQ-R-ABG3-PROJECTION-001` through `-004`).

## Candidate, Admission, Event, And Event Calculus

Current law:

- ABG admission is the epistemic boundary where candidate material becomes
  runtime fact (`REQ-L-GTL3-COMPUTE-NOTATION-007`). HoG owns direct GTL
  traversal, while ABG owns admitted runtime truth
  (`REQ-L-GTL3-COMPUTE-NOTATION-012`).
- `emit()` is the sole append-only event write path. The canonical envelope
  owns immutable event, aggregate, causation, correlation, actor, result, and
  runtime references (`REQ-R-ABG3-EVENTS-001`, `-003`, and `-010`).
- Admission ordinal governs every latest/current selection, and collisions or
  unorderable candidates fail closed (`REQ-R-ABG3-EVENTS-027`).
- Runtime event kinds carry run/basis scope or declare a named run-independent
  scope. The named run-independent families are workspace-scoped truth
  (`REQ-R-ABG3-EVENTS-025`). Workspace authority remains distinct from mutable
  observation (`REQ-R-ABG3-EVENTS-030`).
- Event kinds declare `initiates`, `terminates`, `clips`, and `declips` where
  fluent truth changes. `HoldsAt` derives from admitted events, initial truth,
  clipping, and derived rules (`REQ-R-ABG3-EVENTS-018` and
  `REQ-R-ABG3-PROJECTION-013`).

ABI-owned gaps before occurrence qualification:

- exact pre-admission event candidate or equivalent unchanged subject;
- distinct admission-judgment identity and basis;
- distinct admitted-event identity;
- candidate relation claims and deterministic admitted relation identities;
- exact support and correction relation mappings without collapsing their
  typed endpoint roles;
- event causation versus correlation-group identity and endpoint roles;
- exact interpretation constraint preventing admission ordinal, timestamp,
  adjacency, or arrival order from constituting material occurrence cause;
- exact occurrence interpretation, if any, for run-independent workspace- and
  publication-scoped events without inventing an occurrence owner;
- occurrence material causation versus event causation;
- exact event frontier and projection basis; and
- exact mapping from ABI Event Calculus declarations to the occurrence profile.

## Workspace And Execution Basis

The interpretation must preserve separately:

```text
WorkspaceAuthorityBasis
WorkspaceBinding
optional input/output WorkspaceBindings
ObservationSnapshot
ExecutionBasis
Product and install
catalog view
Program and GraphFunction membership
contract and invocation authority
implementation binding and materialization
Job, Role, Worker, Run
```

The workspace supplies mutable instance state. It is not Program authority,
traversal state, a controller, or closure truth. Re-observation creates a fresh
`ObservationSnapshot`, not a new workspace binding. A catalog change may
require a new `ExecutionBasis` without rebinding the workspace
(`REQ-R-ABG3-BINDING-003`, `-004`, and `-015` through `-018`).

## Two Retry Domains

| Domain | Preserved | Fresh |
|---|---|---|
| declared in-Run `C.retry` | Run, GraphCall, frame lineage, retry locus | retry-attempt ref, CCall, manifest, cursor/attempt path, current attempt input/state digest, and ActorInvocation when dispatch occurs |
| repair/re-entry | `workKey`, frame lineage | Run, GraphCall, frame attempt, initial locus/cursor, first CCall, regenerated manifest, Continuation when relevant, and ActorInvocation when dispatch occurs |

Only after Product authority classifies application levels may this matrix
determine which re-executed traversals become fresh occurrences. Full retry-
frontier projection remains mandatory; a latest-only summary is insufficient.

Exact accepted design evidence:

- `.ai-workspace/comments/codex/20260804T072110Z_STRATEGY_t287_terminal_quiescence_owner_network_replacement.md#10-Two-retry-domains`;
- `build_tenants/abiogenesis/typescript/design/T287_TERMINAL_QUIESCENCE_OWNER_NETWORK_ACCEPTED_DESIGN.md`;
- `REQ-R-ABG3-TRANSPORT-011` for actor-invocation freshness.

## Effect Ownership

```text
GTL declares topology, compute regime, contracts, and effect locus.
HoG traverses admitted GTL and reaches the declared seam.
The implementation binding identifies the authorized resolution seam.
The selected handler performs only the interior effect.
Worker identifies the concrete actor.
ABG admits invocation, evidence, result, judgment, retry, continuation,
correction, and closure truth.
Replay reconstructs and projects admitted truth.
The workspace is observed and mutated; HoG does not traverse it.
```

Binding, handler, actor, and admission owner are not alternatives.

## Unresolved Cross-Run Authority Conflict

The current authority is inconsistent and this post selects no repair:

- `REQ-R-ABG3-LINEAGE-005` and `REQ-R-ABG3-CONTINUATION-004` require
  cross-Run carry-forward with “explicit causal linkage.”
- Accepted M05 requires any replacement-run relation to use workspace-scoped
  payload linkage rather than forbidden cross-Run event causation and requires
  lawful re-entry before implementation
  (`M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md`, replacement-run section).
- Ratified T287 evidence defines a workspace-scoped re-entry link and excludes
  predecessor-Run events from successor causation references
  (`20260804T072110Z_STRATEGY_t287_terminal_quiescence_owner_network_replacement.md`,
  continuation lifecycle section).

ABI authority must decide whether “causal linkage” means material event cause,
correlation, typed lineage/re-entry, or defective requirement wording.

## Closure Gates

Do not claim a successful interpretation until ABI authority has:

1. accepted or replaced every application classification;
2. bound candidate, admission judgment, admitted event, relation, frontier, and
   Event Calculus identities;
3. bound workspace and execution coordinates without treating observation as
   authority;
4. preserved both retry domains and every conditional actor invocation;
5. preserved separate aggregate projections;
6. preserved the exact owner split; and
7. resolved the cross-Run conflict without coercing correlation, re-entry, and
   material cause into one relation.

## Exact Committed Authority Blobs

All hashes below are Git blob identities at ABI basis commit `9eb0e92...`:

| Surface | Git blob |
|---|---|
| `README.md` | `4dc88b98817f010eca9c105cc413339b2713220e` |
| `specification/GOALS.md` | `ef1e9ca8f66bac4a54d30753fb92b07a422e81d1` |
| `specification/INTENT.md` | `7b95fc6179405051779d816e2418b3ea38181f60` |
| `specification/PRODUCT.md` | `b3b982ab98760a74688fa70059834a8de957b91a` |
| `REQ-M-GTL3-PROGRAM-TRAVERSAL.md` | `6b81fb1aea0c0e5e7a824f1dc3b26d6db4ae6d30` |
| `REQ-L-GTL3-COMPUTE-NOTATION.md` | `cb234f9b26a2809ea06ab7d195849f5a225f141e` |
| `REQ-R-ABG3-INTERPRET.md` | `f97382c1400cca7da1f261b17febb7aad33444e6` |
| `REQ-R-ABG3-BINDING.md` | `b2bf638f83108848fccf919f4c9fc0f38b165f78` |
| `REQ-R-ABG3-RUN.md` | `7fe7c29754d6b9f359d38bcec0c615f24a45995f` |
| `REQ-R-ABG3-GRAPHCALL.md` | `8aff26c48ef8cc11a6b99bbaf685900f6948243f` |
| `REQ-R-ABG3-FRAME.md` | `02d5de0da45bb0a42172dc18c83db019542f721b` |
| `REQ-R-ABG3-LINEAGE.md` | `c61449319da9e4f733cb10dc59afa5a7012b359e` |
| `REQ-R-ABG3-CONTINUATION.md` | `1dca01f5ef779709a48fc1d51883536742d8a46f` |
| `REQ-R-ABG3-CCALL.md` | `78d533c8a3c0b6e8024f666dbc2139c194bade48` |
| `REQ-R-ABG3-EVENTS.md` | `79d2a096e038642501c6be15fd13e5d36f75b2b2` |
| `REQ-R-ABG3-PROJECTION.md` | `45a3a7c348d456f7e9d599a0d0250d63137d54be` |
| `REQ-R-ABG3-CORRECTION.md` | `54e16027d996c142f3ec0a8559e8b33973461be0` |
| `REQ-R-ABG3-RETRY.md` | `90e2ed07e06b779ca399345a99a14e4bf9b18096` |
| `REQ-R-ABG3-HANDLERS.md` | `60589146ff80436f9629739644218361f3b04a95` |
| `REQ-R-ABG3-WORKER.md` | `a720fc8ec31bd703cb131e918cb8222a4c1bdafd` |
| `REQ-R-ABG3-TRANSPORT.md` | `d7dcbb3bfba85165517fb03a07310e4a44ed0b3b` |
| `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md` | `3f2a3e1f1c8e3ffe766eef376236d74bdab593f6` |
| `T287_TERMINAL_QUIESCENCE_OWNER_NETWORK_ACCEPTED_DESIGN.md` | `b92bb1865127fbadef606f0bcfc9cfc2fc9cd5c0` |
| `20260804T072110Z_STRATEGY_t287_terminal_quiescence_owner_network_replacement.md` | `d31978aa0f859ee56f750a0fec88de20574fa019` |

The ratified T287 source content SHA-256 is
`c295a065fb95eba780692310e99de7b9aa967d1f93c8fb23b9815326adabead9`.

## Disposition

This gap remains open. It is evidence for future ABI Product-authority triage,
not work authority. The pure occurrence strategy remains independent, and ABI
remains unchanged until lawful re-entry selects a bounded interpretation or
repair.
