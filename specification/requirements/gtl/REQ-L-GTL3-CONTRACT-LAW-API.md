# REQ-L-GTL3-CONTRACT-LAW-API - Contract-Law API And Reload Surface

**Status**: Active
**Category**: Capability / Constraint
**Date**: 2026-06-08
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define GTL as the constitutional contract-law API and graph algebra for
graph-native deterministic integrations.

GTL shall be complete enough as a language to configure every product-visible
graph-program element that ABG admits or interprets. If ABG supports a
product-visible graph asset, compute boundary, prompt construction surface,
plugin boundary, public start, selection boundary, or recursive graph-function
shape, that element must be expressible as GTL language or an ABG-admitted
declaration over GTL language. It shall not be hidden only in product-local
code, prompt prose, wrapper convention, or test-only inventory construction.

This requirement is a reload and index surface. It does not replace the
detailed GTL requirement families. It states the one-truth boundary that lets a
reviewer reload GTL capability quickly, then trace outward to the detailed
language, graph, algebra, contract, hook, asset, module, job, and ABG
interpreter requirements.

## Indexed Requirement Families

This requirement indexes and depends on:

- `REQ-L-GTL3-LANGUAGE`
- `REQ-L-GTL3-ATTRS`
- `REQ-L-GTL3-CONTEXT`
- `REQ-L-GTL3-LAWS`
- `REQ-L-GTL3-GRAPH`
- `REQ-L-GTL3-NODE`
- `REQ-L-GTL3-GRAPHVECTOR`
- `REQ-L-GTL3-INTERFACE`
- `REQ-L-GTL3-OPERATOR`
- `REQ-L-GTL3-EVALUATOR`
- `REQ-L-GTL3-RULE`
- `REQ-L-GTL3-GRAPHFUNCTION`
- `REQ-L-GTL3-COMPOSE`
- `REQ-L-GTL3-SUBSTITUTE`
- `REQ-L-GTL3-RECURSE`
- `REQ-L-GTL3-HOF`
- `REQ-L-GTL3-SELECTION-BOUNDARY`
- `REQ-L-GTL3-SUBWORK`
- `REQ-L-GTL3-SYNTHESIS`
- `REQ-L-GTL3-HOOKS`
- `REQ-L-GTL3-COMPUTE-NOTATION`
- `REQ-L-GTL3-ASSET-SURFACE`
- `REQ-L-GTL3-MODULE`
- `REQ-L-GTL3-JOB`
- `REQ-L-GTL3-ROLE`
- `REQ-L-GTL3-IDENTITY`
- `REQ-R-ABG3-INTERPRET`
- `REQ-R-ABG3-FN-COMPOSITION`
- `REQ-R-ABG3-SELECTION-APPLICATION`
- `REQ-R-ABG3-BINDING`
- `REQ-R-ABG3-RUN`
- `REQ-R-ABG3-GRAPHCALL`
- `REQ-R-ABG3-FRAME`
- `REQ-R-ABG3-ITERATION`
- `REQ-R-ABG3-CONTINUATION`
- `REQ-R-ABG3-RETRY`
- `REQ-R-ABG3-CORRECTION`
- `REQ-R-ABG3-EVENTS`
- `REQ-R-ABG3-PAYLOAD`
- `REQ-R-ABG3-ASSURANCE`
- `REQ-R-ABG3-PROJECTION`
- `REQ-R-ABG3-PROVENANCE`
- `REQ-R-ABG3-LINEAGE`
- `REQ-R-ABG3-POLICY`
- `REQ-R-ABG3-TRANSPORT`
- `REQ-R-ABG3-WORKER`
- `REQ-R-ABG3-JOB-WORKER`
- `REQ-R-ABG3-SAGA-FRONTIER`

## Acceptance Criteria

**REQ-L-GTL3-CONTRACT-LAW-API-001**: GTL shall be the constitutional contract-law API for graph-native workflow programs and deterministic integration boundaries.

**REQ-L-GTL3-CONTRACT-LAW-API-002**: GTL shall expose graph algebra as inspectable program law. Core graph algebra operations include `edge`, `compose`, `substitute`, `recurse`, `fan_out`, `fan_in`, `gate`, `promote`, `identity`, and `same_object`. Implementation APIs may use host-language spellings such as `sameObject` when the carrier identity and law are unchanged.

**REQ-L-GTL3-CONTRACT-LAW-API-003**: GTL contract definitions shall include or index the declarations required for graph-function interface law, graph-vector identity and target law, target-carrier contract law, hook and plugin boundary law, typed prompt or `AssetSurface` law, module publication law, and job or public-start binding law.

**REQ-L-GTL3-CONTRACT-LAW-API-004**: GTL shall expose selection, refinement, synthesis, and publication carriers as first-class language configuration surfaces. `RefinementBoundary`, `CandidateFamily`, candidate selection boundaries, sub-work, synthesis declarations, and single-vector graph-function publication helpers are not hidden orchestration; each shall trace to a GTL carrier, GTL algebra constructor, or ABG admission rule.

**REQ-L-GTL3-CONTRACT-LAW-API-005**: GTL shall make the selected `F_D`, `F_P`, and `F_H` composition law configurable and inspectable through `abg.fn_composition` and GTL compute notation. The reload surface shall include `fn<A, B>.C`, `transform.C`, `evaluate.C`, `consequence.C`, `evaluate.C.F_D.register_rule[*]`, `evaluate.C.F_P.semantic_judgment_rule[*]`, and `F_H` as an external `human_callout` category.

**REQ-L-GTL3-CONTRACT-LAW-API-006**: GTL shall allow recursive graph-function creation by declaring a recursive `GraphFunction` over an existing graph-function interface with explicit termination, foldback, lineage, and bound declarations. Recursive graph functions shall preserve their declared outer interface; ABG shall interpret the declared recursion law and shall not invent a hidden recursive controller.

**REQ-L-GTL3-CONTRACT-LAW-API-007**: GTL shall be complete enough to configure ABG-visible plugin and hook boundaries. Transform, evaluate, consequence, and external human-callout plugin contracts shall preserve selected composition identity, compute means, stage purpose, input carrier refs, output carrier refs, evidence refs, and authority-denial flags through GTL declarations and ABG admission.

**REQ-L-GTL3-CONTRACT-LAW-API-008**: GTL shall be complete enough to configure prompt construction and typed asset surfaces. A downstream inventory row that declares a rendered prompt invocation asset shall be admitted as a typed GTL asset-surface view with the row-local constructor, renderer, digest, authority-slot, output-contract, proof, node, and evidence bindings needed by that row policy. Non-rendered assets shall use a different declared inventory kind.

**REQ-L-GTL3-CONTRACT-LAW-API-009**: ABG shall own program admission and interpretation for GTL programs. A downstream graph program shall be typechecked through an ABG-owned programmatic function before ABG runtime traversal when the downstream product claims GTL/ABG conformance.

**REQ-L-GTL3-CONTRACT-LAW-API-010**: ABG program admission shall fail closed when a supplied GTL program inventory is empty, partial, identity-ambiguous, graph-unreachable, algebra-incomplete, composition-incomplete, prompt-incomplete, hook-incomplete, or lossy relative to the GTL contract declarations it claims to represent.

**REQ-L-GTL3-CONTRACT-LAW-API-011**: Target-carrier rows supplied to an ABG GTL program admission gate shall carry visible contract declaration fields required by runtime admission and replay. A row that only names a vector, target asset type, or local parser summary shall not satisfy GTL target-carrier law.

**REQ-L-GTL3-CONTRACT-LAW-API-012**: Downstream products shall not create second contract-law surfaces in local parsers, prompt prose, plugin wrappers, test-only inventory construction, or generated read models. Product-local domain meaning may interpret admitted GTL/ABG facts, but it shall not redefine GTL language semantics, graph algebra, target-carrier law, hook law, prompt asset law, compute-composition law, recursive graph-function law, or ABG runtime truth.

**REQ-L-GTL3-CONTRACT-LAW-API-013**: Every concrete syntax carrier accepted by an implementation shall trace to either a GTL contract declaration or an ABG admission function.

**REQ-L-GTL3-CONTRACT-LAW-API-014**: External tool surfaces, including MCP endpoints, may be gated by GTL/ABG admission. They shall not become the constitutional source of GTL contract law.

**REQ-L-GTL3-CONTRACT-LAW-API-015**: `PRODUCT.md` and `requirements/gtl/README.md` shall identify this requirement as the fast reload surface for GTL contract-law API review.

## Capability Router

Use this table to reload the language configuration surface without treating
this requirement as a replacement for the detailed families.

| Capability question | GTL language surface | ABG admission or interpretation owner | Primary requirement trace | Proof surface |
| --- | --- | --- | --- | --- |
| Graph structure and interface | `Graph`, `Node`, `GraphVector`, `Context`, `Interface`, `GraphFunction` | ABG graph-function admission and traversal binding | `REQ-L-GTL3-GRAPH`, `REQ-L-GTL3-NODE`, `REQ-L-GTL3-GRAPHVECTOR`, `REQ-L-GTL3-INTERFACE`, `REQ-L-GTL3-GRAPHFUNCTION`, `REQ-R-ABG3-INTERPRET` | GTL core and ABG conformance tests |
| Core graph algebra | `edge`, `compose`, `substitute`, `recurse`, `fan_out`, `fan_in`, `gate`, `promote`, `identity`, `same_object` | ABG interprets admitted graph functions; algebra constructors own GTL shape | `REQ-L-GTL3-COMPOSE`, `REQ-L-GTL3-SUBSTITUTE`, `REQ-L-GTL3-RECURSE`, `REQ-L-GTL3-HOF`, `REQ-L-GTL3-LAWS` | GTL core algebra tests |
| Operator, evaluator, and rule declarations | `Operator`, `Evaluator`, `Rule`, vector/module attachment, regime declarations | ABG resolves executable bindings, evaluator admission, and policy-visible enforcement | `REQ-L-GTL3-OPERATOR`, `REQ-L-GTL3-EVALUATOR`, `REQ-L-GTL3-RULE`, `REQ-L-GTL3-GRAPHVECTOR`, `REQ-R-ABG3-BINDING` | ABG plugin and conformance tests |
| `F_*` compute composition | `abg.fn_composition`, `fn<A, B>.C`, `transform.C`, `evaluate.C`, `consequence.C`, `F_D`, `F_P`, `F_H`, `human_callout` | ABG admits payloads, binds regimes, owns ledgers, assurance, traversal, closure, and replay | `REQ-L-GTL3-HOOKS`, `REQ-L-GTL3-COMPUTE-NOTATION`, `REQ-R-ABG3-FN-COMPOSITION`, `REQ-R-ABG3-PAYLOAD`, `REQ-R-ABG3-ASSURANCE` | T-144/T-146/T-150/T-152 semantic tests |
| Recursive graph functions | `recurse(graph_function, termination, foldback)` over a declared `GraphFunction` with termination, foldback, lineage, and bounds | ABG interprets declared recursion and frame/runtime truth; ABG does not invent foldback | `REQ-L-GTL3-RECURSE`, `REQ-L-GTL3-LAWS`, `REQ-R-ABG3-FRAME`, `REQ-R-ABG3-CONTINUATION`, `REQ-R-ABG3-LINEAGE` | `test_m01_gtl_core_integration.test.mjs` recursion tests |
| Selection, refinement, synthesis, and sub-work | `RefinementBoundary`, `CandidateFamily`, selection boundaries, synthesis declarations, sub-work declarations | ABG may enumerate and admit; strategic selection remains externally supplied or policy-owned | `REQ-L-GTL3-SELECTION-BOUNDARY`, `REQ-L-GTL3-SYNTHESIS`, `REQ-L-GTL3-SUBWORK`, `REQ-R-ABG3-SELECTION-APPLICATION` | GTL carrier and ABG selection tests |
| Prompt construction and typed assets | `AssetSurface`, prompt invocation asset rows, renderers, digest policy, authority slots, output contracts, proof refs | ABG conformance admits rows and rejects lossy prompt or asset inventory | `REQ-L-GTL3-ASSET-SURFACE`, `REQ-L-GTL3-COMPUTE-NOTATION`, `REQ-R-ABG3-PAYLOAD` | T-150/T-152 conformance tests |
| Module, job, role, and public starts | `Module`, `Job`, `Role`, public callable graph-function binding | ABG public start and runtime binding admission | `REQ-L-GTL3-MODULE`, `REQ-L-GTL3-JOB`, `REQ-L-GTL3-ROLE`, `REQ-R-ABG3-BINDING`, `REQ-R-ABG3-RUN` | ABG public-start and downstream conformance tests |
| External tool gates | GTL declarations plus ABG-admitted tool boundary refs | ABG gates tool payloads; external tool metadata is not language truth | `REQ-L-GTL3-HOOKS`, `REQ-L-GTL3-COMPUTE-NOTATION`, `REQ-R-ABG3-TRANSPORT`, `REQ-R-ABG3-PAYLOAD` | Tool-boundary and payload admission tests |

## ABG Runtime Operation Index

GTL `Operator` declarations are language-level work surfaces. ABG runtime
operations are interpreter families. A runtime operation is not a GTL operator,
but any product-visible configuration for that runtime operation shall be
declared through GTL language or an ABG-admitted carrier over GTL language.

| ABG runtime operation family | Configuration source | Runtime truth owner |
| --- | --- | --- |
| public start, run, graph call, and frame opening | `Module`, `Job`, `Role`, `GraphFunction`, public-start rows, binding policy | ABG run, graph-call, frame, binding, and provenance requirements |
| iteration, traversal transition, and selection application | `Graph`, `GraphVector`, evaluator/rule declarations, selected composition, policy hooks | ABG iteration, selection-application, events, projection, and assurance requirements |
| retry, continuation, correction, and replay | declared graph-function/vector contracts, edge assurance, continuation policy, correction policy | ABG retry, continuation, correction, events, projection, lineage, and provenance requirements |
| payload ledgers and prompt/plugin payload admission | `AssetSurface`, compute notation, plugin contracts, hook refs, output contracts | ABG payload, assurance, event, and projection requirements |
| worker and transport binding | `Operator`, `Evaluator`, `Role`, job/public-start binding, policy hooks | ABG worker, job-worker, binding, transport, and provenance requirements |
| saga/frontier and bounded parallelism | graph dependency truth, branch/frontier policy, graph-function declarations | ABG saga-frontier, continuation, projection, lineage, and policy requirements |

## Owner Split

| Owner | Owns | Does not own |
| --- | --- | --- |
| GTL | Declarations, graph algebra, contract law, selected compute composition syntax, recursive graph-function law, hook attachment, typed asset-surface shape, target-carrier contract law, plugin boundary shape, module/job/public-start publication. | Runtime events, worker identity, traversal transition, replay projection, or product-domain meaning. |
| ABG | Admission, interpretation, payload ledgers, assurance fold, event truth, traversal transition, continuation, correction, replay, and programmatic conformance gates over GTL program inventory. | GTL language semantics or downstream domain acceptance meaning. |
| Downstream product | Domain meaning, product read models, acceptance interpretation, domain-specific proof interpretation, and product-owned implementations behind admitted GTL/ABG boundaries. | GTL contract law, graph algebra, target-carrier law, hook law, prompt asset law, compute-composition law, recursive graph-function law, or ABG runtime truth. |

## Reload Checklist

When reviewing GTL/ABG contract capability, load this requirement first, then
trace to the indexed detailed families:

- language atoms and identity: `REQ-L-GTL3-LANGUAGE`, `REQ-L-GTL3-ATTRS`,
  `REQ-L-GTL3-CONTEXT`, and `REQ-L-GTL3-IDENTITY`
- graph program shape and algebra: `REQ-L-GTL3-LAWS`,
  `REQ-L-GTL3-GRAPH`, `REQ-L-GTL3-NODE`, `REQ-L-GTL3-GRAPHVECTOR`,
  `REQ-L-GTL3-INTERFACE`, and `REQ-L-GTL3-GRAPHFUNCTION`
- graph algebra operations: `REQ-L-GTL3-COMPOSE`, `REQ-L-GTL3-SUBSTITUTE`,
  `REQ-L-GTL3-RECURSE`, and `REQ-L-GTL3-HOF`
- recursive graph functions: `REQ-L-GTL3-RECURSE`
- selection, refinement, synthesis, and sub-work carriers:
  `REQ-L-GTL3-SELECTION-BOUNDARY`, `REQ-L-GTL3-SYNTHESIS`, and
  `REQ-L-GTL3-SUBWORK`
- target-carrier and typed asset contracts: `REQ-L-GTL3-GRAPHVECTOR` and
  `REQ-L-GTL3-ASSET-SURFACE`
- operator/evaluator/rule regimes and compute composition:
  `REQ-L-GTL3-OPERATOR`, `REQ-L-GTL3-EVALUATOR`,
  `REQ-L-GTL3-RULE`, `REQ-L-GTL3-COMPUTE-NOTATION`, and
  `REQ-R-ABG3-FN-COMPOSITION`
- hook and plugin boundaries: `REQ-L-GTL3-HOOKS`,
  `REQ-R-ABG3-BINDING`, and `REQ-R-ABG3-PAYLOAD`
- publication and work binding: `REQ-L-GTL3-MODULE`, `REQ-L-GTL3-JOB`, and
  `REQ-L-GTL3-ROLE`
- admission and runtime truth: `REQ-R-ABG3-INTERPRET`,
  `REQ-R-ABG3-PAYLOAD`, `REQ-R-ABG3-SELECTION-APPLICATION`, and
  `REQ-R-ABG3-ASSURANCE`
