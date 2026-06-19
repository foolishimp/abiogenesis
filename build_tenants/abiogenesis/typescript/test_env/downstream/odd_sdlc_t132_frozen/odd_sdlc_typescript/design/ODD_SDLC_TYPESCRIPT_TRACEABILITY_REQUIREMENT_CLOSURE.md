# ODD SDLC TypeScript Traceability And Requirement Closure

## Scope

This design closes T-035 for the TypeScript tenant.

Python traceability and requirement-closure modules are discovery evidence. They
do not define the TypeScript topology.

## Source Truth

Requirement closure derives from admitted truth only:

- `SdlcWorkspaceIngressReport`
- imported requirement authority
- `SdlcWorkReport`
- `SdlcGeneratedAssetAuthority`
- generated-asset contract attestation
- explicit `SdlcRequirementProofClaim`

Filesystem scans, trace-token presence, comments, or file names do not close a
requirement.

## Carrier Chain

```text
admitted source input
  -> imported requirement authority
  -> ABG-selected graph-function work report
  -> generated asset authority
  -> requirement proof claim
  -> lineage ledger
  -> requirement closure register
  -> repair frontier
```

## Closure Law

Traceability and fulfillment are separate.

- `trace_tag` proves a trace relation only.
- `planned_test` and `design_carry` preserve lawful future pressure.
- `behavioral_test` and `runtime_result` can close fulfillment only when the
  generated asset contract is satisfied.

Unfulfilled requirements remain in the closure register and repair frontier.

## Projection Rule

The lineage ledger, closure register, and repair frontier are read-only
projections. They emit no runtime events and do not choose traversal.

