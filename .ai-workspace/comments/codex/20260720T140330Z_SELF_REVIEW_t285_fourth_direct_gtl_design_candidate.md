# Self-Review - T-285 Fourth Direct-GTL Design Candidate

## Subject

- candidate commit: `10667b234696ff2bd10d12065279e310a3445156`
- design blob: `595caef2a1c5ff19277d02d52f41f8d5e11b881e`
- design SHA-256: `9faeb41ddac839edc9cd2ccb83ae11b05bb54d32168fc35e74a1a9cfb97e92f0`
- subject: `build_tenants/abiogenesis/typescript/design/M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md`

The candidate commit changes only the design subject. The supporting Prime
acceptance-lifecycle gate and focused test are isolated in parent commit
`794bcac469a6fa70832390c74da5ed51ef53a652`.

## Review-Finding Disposition

| Finding | Repair | Self-review result |
|---|---|---|
| immutable acceptance would make Prime red | The design carries a truthful immutable-candidate marker. The Prime gate accepts that marker only when an external exact-subject receipt exists; without a receipt it remains pending. A focused test proves both authority states. | repaired without embedding acceptance authority in candidate bytes |
| post-invocation refusals lacked replay truth | `admitInvocationRefusal` and `invocation_refused` now close every Graph-validation, implementation-resolution, implementation-validation, or basis-admission refusal after InvocationAdmission. Lifecycle and Event Calculus project the outcome from replay. | repaired |
| opened CCalls could be stranded | `CCallAdmissionRejection` plus `completeRejectedCCall` appends the missing mandatory spine suffix. Result admission validates output, failure, and refusal contracts; judgment rejection uses the declared rejection relation. | repaired; no bare post-open exit remains |
| Prime evidence conflated carrier and authority | ReplayProjectionFamily remains Prime but is removed from authoritative carriers. Independent inventories measure semantic authority `15 -> 4` and maintained authoring sources `18 -> 7`. | repaired; counts no longer derive from IACS size |
| domain view did not project Prime | The class diagram names all eight IACS families and marks prime, authoritative, downstream, subordinate, effect-edge, and deferred roles. | repaired |
| catalog publication cardinality excluded non-callables | ModulePublication now owns one or more typed CatalogContribution rows but zero or more Programs, GraphFunctions, and ImplementationBindings. PublicationValidation admits node-type-only and overlay-only modules without a ProgramValidation fiction. | repaired |

## Cross-Boundary Review

- Product, Intent, requirements, root identity, and donor dispositions are
  unchanged.
- GTL still owns topology and contracts; validator judgments do not lower.
- HoG still traverses; ABG still owns admitted runtime truth.
- The refusal repairs add no second event writer, result ledger, controller, or
  execution path.
- CatalogContribution and CCallAdmissionRejection remain subordinate payloads;
  neither becomes a public operation or peer runtime module.
- The first implementation handoff remains exact `ABI5-ROOT-001`; Consensus,
  F_P, F_H, full traversal, qualification, and release remain deferred to their
  accepted gates.

## Residual Risk And Review Request

The design is constructable on the selected TypeScript substrate, but none of
its runtime claims is realized yet. Independent review should attempt to
falsify:

1. whether every post-InvocationAdmission refusal is now replay-constructible;
2. whether every opened CCall has exactly one lawful mandatory spine under all
   contract-rejection stages;
3. whether the four semantic-authority and seven authoring-source target counts
   match the named inventories rather than carrier count;
4. whether the domain diagram faithfully projects all eight Prime families;
5. whether callable and non-callable catalog publications are both
   constructible; and
6. whether the immutable-candidate gate remains green before and after an exact
   F_H receipt without hiding that receipt.

No F_H acceptance is inferred from this self-review. M4 remains blocked.
