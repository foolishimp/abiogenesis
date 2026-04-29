# GTL 3 And ABG 3 Testcase Authority Matrix

This matrix records the current written testcase authority for the live GTL 3
and ABG 3 requirement families.

| Requirement family | Authority surface | Notes |
| --- | --- | --- |
| `REQ-L-GTL3-LANGUAGE`, `REQ-L-GTL3-ATTRS`, `REQ-L-GTL3-CONTEXT`, `REQ-L-GTL3-GRAPH`, `REQ-L-GTL3-NODE`, `REQ-L-GTL3-GRAPHVECTOR`, `REQ-L-GTL3-INTERFACE`, `REQ-L-GTL3-IDENTITY` | `01-language-primitives-and-traversal.md` | proves language identity, immutable declaration carriers, typed loci including `asset_surface`, invariant traversal, and identity law |
| `REQ-L-GTL3-OPERATOR`, `REQ-L-GTL3-EVALUATOR`, `REQ-L-GTL3-RULE`, `REQ-L-GTL3-HOOKS`, `REQ-L-GTL3-SUBWORK` | `02-governed-transition-surfaces.md` | proves governed transition surfaces without introducing a policy semantic language |
| `REQ-L-GTL3-GRAPHFUNCTION`, `REQ-L-GTL3-COMPOSE`, `REQ-L-GTL3-SUBSTITUTE`, `REQ-L-GTL3-RECURSE`, `REQ-L-GTL3-HOF`, `REQ-L-GTL3-LAWS`, `REQ-L-GTL3-SELECTION-BOUNDARY`, `REQ-L-GTL3-SYNTHESIS` | `03-graph-function-algebra.md` | proves graph-function publication, algebra, recursion, and lawful structural choice |
| `REQ-L-GTL3-MODULE`, `REQ-L-GTL3-ROLE`, `REQ-L-GTL3-JOB` | `04-publication-and-semantic-work.md` | proves publication boundaries, semantic work contracts, and role-owned governance inputs |
| `REQ-R-ABG3-EVENTS`, `REQ-R-ABG3-BINDING`, `REQ-R-ABG3-WORKER`, `REQ-R-ABG3-JOB-WORKER`, `REQ-R-ABG3-RUN`, `REQ-R-ABG3-GRAPHCALL`, `REQ-R-ABG3-FRAME`, `REQ-R-ABG3-CONTINUATION` | `05-runtime-aggregates-and-event-truth.md` | proves graph-function-first runtime entry, event-authoritative aggregates, runtime-environment binding truth including carried contexts, nearest-enclosing vector fact ownership, and run-local continuation law |
| `REQ-R-ABG3-PROJECTION`, `REQ-R-ABG3-LINEAGE`, `REQ-R-ABG3-PROVENANCE`, `REQ-R-ABG3-CORRECTION` | `06-replay-lineage-and-correction.md` | proves replay-derived current truth, causal lineage, provenance completeness, and stale-state invalidation under correction or supersession |
| `REQ-R-ABG3-INTERPRET`, `REQ-R-ABG3-CONVERGENCE`, `REQ-R-ABG3-POLICY`, `REQ-R-ABG3-SELECTION-APPLICATION`, `REQ-R-ABG3-LEAFTASK`, `REQ-R-ABG3-TRANSPORT`, `REQ-M-GTL3-MAPPING`, `REQ-M-GTL3-PROVENANCE` | `07-governed-probabilistic-runtime.md` | proves ABG-owned interpretation, configured default bundles, fail-closed fallback law, lawful external selection, local transport-contract override handling, bind-time asset-surface/mapping provenance, bounded subordinate subwork, and post-dispatch runtime ownership |
| `REQ-R-ABG3-SELFHOSTING` | `08-derived-artifact-governance.md` | proves that derived artifacts and qualification surfaces stay under the same event, replay, and drift-detection law as other governed work |
| `REQ-R-ABG3-ASSURANCE` | `10-total-assurance-projection-uat.md` | proves total assurance row projection, closure folding, live Claude actor observation, two-hop register deepening, and downstream-register buildability without moving downstream domain semantics into ABG |
| `REQ-R-ABG3-PAYLOAD` | `11-event-sourced-payload-ledger-uat.md` | proves payload envelope admission, payload/evidence/authority source facts, read-model ledgers, plugin authority limits, GTL payload declarations, and two-hop register deepening from admitted ABG facts |

Deferred family note: `REQ-M-GTL3-CAPABILITY` remains deferred and is tracked in
design/module mapping surfaces rather than live testcase authority for the
canonical ABG 3 line. Product verification authority such as
`REQ-P-SCENARIOS` is traced through the canonical python test surface map
rather than this GTL/ABG family matrix.
