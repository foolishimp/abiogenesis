# Self-Review - T-278 Public Control-Plane Ontology

**Date**: 2026-07-15

**Verdict**: candidate is ready for F_H review; not accepted
**Scope**: T-278 intake, candidate Ontology, and local pre-code template only

## Review Basis

The review applied upstream `DESIGN_MODULE_METHOD.md` section 4B to the current
ABIogenesis GOALS, INTENT, PRODUCT, public-policy requirements, public-contract
requirements, and the exact 36-function roster.

No PRODUCT, requirement, runtime, generated contract, schema, test, or active
T-270/T-272 realization file was changed by T-278.

## Findings And Repairs

1. **Lifecycle evidence was initially incomplete.** The first candidate matrix
   omitted the mandatory identity and authority-owner columns. It now records
   identity, authority owner, create/admit, read/project, transition, and
   retirement/exclusion for every identity-bearing entity family.
2. **The first contraction was too aggressive.** Workspace opening was grouped
   into generic projection even though it admits a raw target and establishes
   readiness identity. It is now independent `AF-02 openWorkspace`.
3. **Assessment and witnessing were incorrectly grouped.** Result assessment
   influences F_P result, retry, and closure truth; witnessing records an
   attributed external act. They are now separate `AF-14` and `AF-15` atoms
   while remaining free to consume shared subordinate event-admission code.
4. **Start target selection was under-modeled.** `run.start` cannot be merely an
   invocation mode because product `scope + target + until` must resolve to one
   exact GraphFunction before ABG entry. `AF-10 resolveStartTarget` is now an
   explicit deterministic internal atom composed before `AF-11`.
5. **Installed-product relation was imprecise.** A resolved lock selects exact
   product coordinates, not artifact bytes. `ProductCoordinate` is now a
   subordinate value family realized by supplied product artifacts.
6. **Evidence and conformance publication were missing from the entity model.**
   `EvidenceRecord`, `CapabilityDefinition`, and
   `TenantConformanceManifest` now have explicit identity, authority, lifecycle,
   and projection relationships.
7. **Projection fidelity was implicit.** Every downstream projection class now
   declares accepted loss/omission and a failure condition. No projection may
   omit identity basis, authority, effect class, or typed refusal when those
   participate in its boundary.
8. **The hard-break decision was left open despite prior F_H direction.** The
   candidate now records one-truth hard break as decided. No compatibility
   facade is proposed for operation identities not derived by the accepted
   Ontology.

## Exact Censuses

| Census | Expected | Observed | Verdict |
|---|---:|---:|---|
| discovered behavior derivations | 36 | 36 | pass |
| parameterized semantic atoms | 19 | 19 | pass |
| higher-order product compositions | 6 | 6 | pass |
| candidate public operation identities | 18 | 18 | pass |
| Mermaid Ontology diagrams | 2 | 2 rendered | pass |

The 18-row public projection is not inferred from the 19 operations currently
implemented in the dirty tree. Its members and grouping differ. The result is
derived from entity lifecycle, authority, effects, and composition.

## Verification

- `git diff --check`: pass for all T-278 surfaces;
- Pandoc GFM parse: pass for ticket, Ontology, and local template;
- Mermaid CLI `11.3.0`: 2/2 candidate Ontology diagrams rendered;
- exact source-basis digest recomputation: 6/6 match;
- discovered-function census: 36/36 exactly once;
- atomic-function census: `AF-01` through `AF-19`, 19/19;
- candidate operation census: 18/18; and
- runtime/code diff scope: no T-278 runtime or generated-contract edits.

## Non-Closure

The following are intentionally not claimed:

- independent/adversarial review;
- F_H Ontology acceptance;
- constitutional PRODUCT or requirement propagation;
- acceptance of the 18 public identities;
- three-view/IACS reconciliation of existing M02/M03/M04 designs;
- realization migration; or
- DS-5 completion.

## Recommendation

F_H should review and accept or reject the linked claims as one product-design
decision:

1. the entity/lifecycle/authority Ontology;
2. the 19 atoms and six higher-order compositions; and
3. the 18-operation public projection.

If accepted, the next lawful move is constitutional propagation and ticket/
design reconciliation. It is not code implementation.
