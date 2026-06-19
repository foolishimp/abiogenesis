# odd_sdlc TypeScript Recursive Realization Deepening

**Status**: Active
**Date**: 2026-04-26
**Implements**: REQ-F-ODDSDLC-040, REQ-F-ODDSDLC-043
**Investigates**: B-068
**Derives From**: `ODD_SDLC_TYPESCRIPT_HOOK_CONTRACTS.md`, `ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.md`, `ODD_SDLC_TYPESCRIPT_TRAVERSAL_ASSURANCE_INTEGRATION.md`

## Position

Recursive realization deepening is the TypeScript SDLC verification of
ODD-native construction.

The product does not prove solution delivery by file count, trace tags, generic
syntax, or a single successful build. It proves it when a realization edge can
be re-entered through ABG with current artifact state, unresolved reasons,
governed inventory obligations, and execution evidence until closure is
accepted or ABG stops/escalates.

Cumulative realization pressure is mandatory for product-realization edges.
The edge must carry the obligation chain forward as a first-class manifest
surface:

```text
TraversalObligationContext
  = prior edge evidence
  + current artifact state reference
  + requirement closure register
  + design/module authority refs
  + runtime context sidecars
  + deterministic failure summaries
  + fulfillment obligation ledger
```

The worker receives this as authority and returns obligation assessments. The
operator folds those assessments through deterministic assurance ledgers. A
new artifact cannot close an edge if it leaves a prior obligation unassessed,
unfulfilled, or silently dropped.

## Authority Split

ABG owns traversal, continuation, retry repair, runtime events, provenance,
stop law, and closure denial.

GTL owns the graph-function carrier.

odd_sdlc.TS owns the domain inventory, hook contract, evaluator contract,
constructor plugin contract, and proof interpretation.

No SDLC hook selects the next traversal or implements a tenant-local retry loop.
When evaluation denies closure, the hook/proof lane returns evidence to ABG and
ABG decides retry, stop, or escalation.

## Carrier Set

| Carrier | Role |
| --- | --- |
| `SdlcTraversalObligationContext` | manifest-carried reference set for requirement/design/module/prior-edge pressure |
| `SdlcWorkerObligationAssessment` | worker assessment of each declared traversal obligation |
| `EnterpriseCoreCapabilityInventoryEntry` | source/test/evidence obligation for one enterprise-core capability |
| `EnterpriseCoreInventoryState` | current artifact state submitted to deterministic evaluation |
| `EnterpriseCoreInventoryEvaluation` | deterministic shallow-output rejection result |
| `EnterpriseCoreArtifactState` | F_P construction result for one attempt |
| `EnterpriseCoreAttemptHandoffEvidence` | public archive proof of prior state and unresolved reasons consumed by a re-entry |
| `EnterpriseCoreOutcomeIterationArchive` | sandbox archive over success or ABG gap path |

## Obligation Context Law

The handoff for a requirement-bearing realization edge must give the worker the
current obligation chain in two forms:

- stable references and digests for the full chain
- compact summaries for the currently blocking delta

This avoids one giant prompt while still preventing obligation loss. A worker
may choose how to use the referenced surfaces, but the result report must
assess the declared obligations. The evaluator must reject closure when a
declared obligation is missing, blocked, unassessed, or dropped from a prior
retry dossier.

## Inventory Law

The qualification inventory is capability based, not file-count based.

Required capabilities include:

- type resolution
- topological compilation
- morphism execution
- synthesis
- run manifest management
- artifact versioning
- assurance
- accounting
- adjoint compilation
- fidelity verification
- engine composition

Each capability requires a source component, behavioral test target, requirement
reference, and evidence contract. A shallow module shell fails even if it
compiles when any required source component, behavioral test target, governed
build report, or governed test report is missing.

## Evidence Law

`present` is not enough for build or test evidence.

Build closure requires governed build evidence with a `build://` evidence ref.
Test closure requires governed test evidence with a `junit://` or
`test-report://` evidence ref.

Generic syntax tokens, trace comments, and module names do not satisfy
behavioral proof. Behavioral proof is component-targeted and bound to the
required inventory.

## Verification Shape

The B-068 sandbox verifies the current refactor by executing the same
realization edge through ABG retry repair:

```text
derive_enterprise_core_code_surface
  -> attempt 1 shallow output
  -> deterministic inventory rejection
  -> ABG retry repair and continuation reopen
  -> attempt 2 deeper but incomplete output
  -> deterministic inventory rejection
  -> ABG retry repair and continuation reopen
  -> attempt 3 full inventory with governed build/test refs
  -> accepted closure
```

The same lane also verifies the negative path. If the retry budget is exhausted,
the sandbox archives an ABG retry-stop gap instead of an untyped local failure.

## Non-Claim

This design closes the recursive realization capability proof for the TypeScript
refactor lane. It does not claim full operational replacement of Python live
`data_mapper` generation. That remains T-041/RC scope.
