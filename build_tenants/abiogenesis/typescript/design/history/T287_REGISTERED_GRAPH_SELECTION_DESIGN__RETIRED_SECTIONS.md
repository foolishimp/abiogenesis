Cut from `build_tenants/abiogenesis/typescript/design/T287_REGISTERED_GRAPH_SELECTION_DESIGN.md` at commit `b13bdd5c2`, lines 37-37, 180-180, verbatim.

| `code/src/validator/validation.ts:1140` | Existing gate applications bind evaluators to one workflow target; they do not route alternative callees. |

| `gtl/contracts.ts`, `gtl/graph_applications.ts`, `gtl/declaration_references.ts`, applicable canonical/raw schema owner and `validator/validation.ts` | Add the application and exact source/evaluator/policy/edge/interface checks. ConstructionComposition, Gate and C terms retain meaning. |

---

Cut from `build_tenants/abiogenesis/typescript/design/T287_REGISTERED_GRAPH_SELECTION_DESIGN.md` at commit `c22430c34`, lines 160-174, verbatim.

## Purpose and actual F_P context

Selected definitions declare nonempty
`declarations["abg.functional_purpose"]` and
`declarations["abg.conditions_for_use"]`; their containing exact definitions
link that text to published input/result/effect contracts. Reuse catalogue lookup
and definition digests. Check presence without interpreting prose as a predicate.
Missing suitable capability or required support produces a gap.

Existing instruction assembly supplies the native selector's declared Executive
frame, task, exact permitted purposes/contracts, observations, policy/criteria,
evidence, response schema and access envelope. Assembly cannot choose an answer
or invent a frame. Retain actual prompt/manifest, input and raw response. S2's
finite F_D rule proves mechanics; S3 separately proves real F_P context usability
and admission. No future library or prompt implementation is designed here.
