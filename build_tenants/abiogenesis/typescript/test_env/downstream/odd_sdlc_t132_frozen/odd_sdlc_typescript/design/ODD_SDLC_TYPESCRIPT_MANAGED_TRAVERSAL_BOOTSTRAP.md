# Managed Traversal Bootstrap Slice

**Status**: Active
**Ticket**: `T-097`
**Scope**: TypeScript tenant design surface for the first explicit managed
traversal carrier.

## Design Claim

`Fg_conform_project` is the first concrete managed traversal:

```text
ManagedTraversal<UnorderedSourceSet, ConstitutionalBootstrap>
```

It turns admitted unordered project documents into constitutional bootstrap
surfaces:

- `specification/INTENT.md`
- `specification/PRODUCT.md`
- `specification/GOALS.md`
- `specification/requirements/*`
- `.ai-workspace/context/project_bootstrap.md`
- `.ai-workspace/context/project_constraints.yml`
- `build_tenants/TENANT_REGISTRY.md`

## Module Boundary

The bootstrap carrier belongs to the workspace induction module because it
describes project conformance, source admission, and generated topology. It
does not belong to ABG and does not change ABG runtime mechanics.

## Carrier Split

`SdlcManagedTraversalManifest` is the prestep work-order surface. It records:

- graph function
- source type
- target type
- source refs
- expected output topology
- phase contracts

`SdlcManagedTraversalLedger` is the postprocess evaluation surface. It records:

- graph function
- source and target type
- actual output refs
- phase verdicts
- residual gaps

For this slice, the existing `SdlcConformProjectReport` remains the detailed
project-conformance evaluator. The ledger folds that report into the
higher-order managed traversal shape.

## Local Optimization

This slice does not introduce a generic framework before the bootstrap case is
stable. The generic abstraction remains downstream of proof.

## Global Optimization

The same carrier shape can be lifted later across:

```text
requirements -> design
design -> modules
modules -> implementation
implementation -> tests
```

when each edge has a stable source type, target type, manifest contract, and
ledger fold.

For prompt-bearing edges, the postprocess ledger fold already exists as the
assurance ledger family hardened by `T-085`. Those edges must not introduce a
second managed-traversal ledger. Their managed traversal shape is:

```text
prestep: worker handoff manifest
execute: worker result report
postprocess: postflight + assurance_ledgers + assurance_satisfaction
```

The bootstrap `Fg_conform_project` ledger is a deterministic conformance ledger
because that edge has no F_P worker handoff and no worker assurance gate.
