# Review Receipt - T-285 Third Exact Design Candidate

## Verdict

Changes requested against candidate `c70455d19313c686fc60b5b96d8f740b5d4ec786`.
Do not record F_H acceptance or open M4 until the design is repaired, refrozen,
and reviewed again.

## Findings

1. Acceptance would make the Prime governance gate fail because the immutable
   subject remains marked as under repair while the gate requires inline
   accepted status after an external receipt appears.
2. Graph-validation and implementation-resolution refusals after
   InvocationAdmission have no ABG refusal event, so replay cannot construct
   their PublicOutcome.
3. Evidence, result, or judgment rejection can strand an opened CCall before
   the mandatory result-admitted and judged suffix; result admission also omits
   failure and refusal contracts.
4. Prime evidence incorrectly classifies ReplayProjectionFamily as
   authoritative and derives authority and authoring counts from carrier-family
   count rather than independent source inventories.
5. The domain projection omits the eight IACS family identities and the
   required prime, effect-edge, and deferred classifications.
6. ModulePublication requires Programs, GraphFunctions, and
   ImplementationBindings, excluding lawful node-type-only and overlay-only
   publications.

## Verified Baseline

- Candidate, tree, blob, line count, and SHA-256 reproduced.
- Exact and repository Mermaid gates passed.
- Direct Prime inspection and both mutation suites passed mechanically.
- Branch and remote were clean and synchronized.
- No runtime, package, generated, qualification, or release implementation was
  part of the candidate.

The raw-admission staging, explicit traversal scope, successful closure payload
chain, and empty CatalogView repair were accepted as material improvements.
