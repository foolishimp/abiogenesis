# GTL 3 And ABG 3 Testcase Authority Matrix

This matrix records the current written testcase authority for the live GTL 3
and ABG 3 requirement families.

| Requirement family | Authority surface | Notes |
| --- | --- | --- |
| `REQ-L-GTL3-LANGUAGE`, `REQ-L-GTL3-ATTRS`, `REQ-L-GTL3-CONTEXT`, `REQ-L-GTL3-GRAPH`, `REQ-L-GTL3-NODE`, `REQ-L-GTL3-GRAPHVECTOR`, `REQ-L-GTL3-INTERFACE`, `REQ-L-GTL3-IDENTITY` | `01-language-primitives-and-traversal.md` | proves language identity, immutable declaration carriers, typed loci including `asset_surface`, invariant traversal, and identity law |
| `REQ-L-GTL3-OPERATOR`, `REQ-L-GTL3-EVALUATOR`, `REQ-L-GTL3-RULE`, `REQ-L-GTL3-HOOKS`, `REQ-L-GTL3-SUBWORK` | `02-governed-transition-surfaces.md` | proves governed transition surfaces without introducing a policy semantic language |
| `REQ-L-GTL3-GRAPHFUNCTION`, `REQ-L-GTL3-COMPOSE`, `REQ-L-GTL3-SUBSTITUTE`, `REQ-L-GTL3-RECURSE`, `REQ-L-GTL3-HOF`, `REQ-L-GTL3-LAWS`, `REQ-L-GTL3-SELECTION-BOUNDARY`, `REQ-L-GTL3-SYNTHESIS` | `03-graph-function-algebra.md` | proves graph-function publication, algebra, recursion, and lawful structural choice |
| `REQ-L-GTL3-HOF-001`, `REQ-L-GTL3-HOF-009..-012` | `09-research-product-lab-scenario-catalog.md` section 4 | proves a generic `A -> B` transform over distinct explicit input and result vectors, ordinal `C.batch` projection, all-or-block partial failure, and exact complete-vector fan-in |
| `REQ-L-GTL3-MODULE`, `REQ-L-GTL3-ROLE`, `REQ-L-GTL3-JOB` | `04-publication-and-semantic-work.md` | proves publication boundaries, semantic work contracts, and role-owned governance inputs |
| `REQ-R-ABG3-EVENTS`, `REQ-R-ABG3-BINDING`, `REQ-R-ABG3-WORKER`, `REQ-R-ABG3-JOB-WORKER`, `REQ-R-ABG3-RUN`, `REQ-R-ABG3-GRAPHCALL`, `REQ-R-ABG3-FRAME`, `REQ-R-ABG3-CONTINUATION` | `05-runtime-aggregates-and-event-truth.md` | proves graph-function-first runtime entry, event-authoritative aggregates, runtime-environment binding truth including carried contexts, nearest-enclosing vector fact ownership, and run-local continuation law |
| `REQ-R-ABG3-PROJECTION`, `REQ-R-ABG3-LINEAGE`, `REQ-R-ABG3-PROVENANCE`, `REQ-R-ABG3-CORRECTION` | `06-replay-lineage-and-correction.md` | proves replay-derived current truth, causal lineage, provenance completeness, and stale-state invalidation under correction or supersession |
| `REQ-R-ABG3-INTERPRET`, `REQ-R-ABG3-CONVERGENCE`, `REQ-R-ABG3-POLICY`, `REQ-R-ABG3-SELECTION-APPLICATION`, `REQ-R-ABG3-LEAFTASK`, `REQ-R-ABG3-TRANSPORT`, `REQ-M-GTL3-MAPPING`, `REQ-M-GTL3-PROVENANCE` | `07-governed-probabilistic-runtime.md` | supplies focused cases for direct HoG traversal, ABG runtime admission, fail-closed policy, external selection, transport override handling, mapping provenance, bounded subwork, and post-dispatch runtime truth |
| `REQ-R-ABG3-SELFHOSTING` | `08-derived-artifact-governance.md` | proves that derived artifacts and qualification surfaces stay under the same event, replay, and drift-detection law as other governed work |
| `REQ-R-ABG3-ASSURANCE` | `10-total-assurance-projection-uat.md` | proves total assurance row projection, closure folding, live Claude actor observation, two-hop register deepening, and downstream-register buildability without moving downstream domain semantics into ABG |
| `REQ-R-ABG3-PAYLOAD` | `11-event-sourced-payload-ledger-uat.md` | proves payload envelope admission, payload/evidence/authority source facts, read-model ledgers, plugin authority limits, GTL payload declarations, and two-hop register deepening from admitted ABG facts |

`REQ-M-GTL3-CAPABILITY` requires an explicit mapping before qualification; it
is not silently deferred. Product verification authority remains
`PRODUCT.md` plus `REQ-P-SCENARIOS`. This matrix is a subordinate test-case
index and cannot close an installed Product scenario by itself.
