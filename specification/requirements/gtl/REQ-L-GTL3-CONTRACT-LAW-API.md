# REQ-L-GTL3-CONTRACT-LAW-API - Contract-Law Reload Surface

**Status**: T-283 constitutional candidate
**Category**: Capability / Constraint
**Date**: 2026-07-20
**Derives from**: [INTENT.md](../../INTENT.md), [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Provide one fast reload surface for GTL contract law and its exact boundary with
the GTL validator, HoG, ABG, implementation seams, and downstream products.
This file indexes detailed requirement families; it does not replace them or
the complete Product definition.

The governing chain is:

```text
GTL.TypeScript declaration
  -> native type checking and raw admission
  -> non-lowering GTL validation
  -> module and catalog admission
  -> direct HoG traversal
  -> declared F_D | F_P | F_H implementation seam
  -> ABG admission, events, replay, continuation, and closure
```

## Indexed Requirement Families

The reload surface covers:

- language and identity: `REQ-L-GTL3-LANGUAGE`, `ATTRS`, `CONTEXT`,
  `IDENTITY`, and `LAWS`;
- program structure: `GRAPH`, `NODE`, `GRAPHVECTOR`, `INTERFACE`,
  `GRAPHFUNCTION`, `MODULE`, `JOB`, and `ROLE`;
- graph algebra: `COMPOSE`, `SUBSTITUTE`, `RECURSE`, `HOF`, and
  `C-ALGEBRA`;
- declaration boundaries: `OPERATOR`, `EVALUATOR`, `RULE`, `HOOKS`,
  `COMPUTE-NOTATION`, `ASSET-SURFACE`, `SELECTION-BOUNDARY`,
  `SYNTHESIS`, and `SUBWORK`;
- traversal mapping: `REQ-M-GTL3-PROGRAM-TRAVERSAL`;
- runtime truth: `REQ-R-ABG3-INTERPRET`, `FN-COMPOSITION`, `BINDING`,
  `RUN`, `GRAPHCALL`, `FRAME`, `CONTINUATION`, `EVENTS`,
  `PAYLOAD`, `ASSURANCE`, `PROJECTION`, `PROVENANCE`, and
  `LINEAGE`.

## Acceptance Criteria

**REQ-L-GTL3-CONTRACT-LAW-API-001**: GTL shall be the constitutional typed
contract-law API for graph-native programs. Authoring validity, diagnostics,
repair affordances, declarations-as-data, and conformance corpus truth shall be
inspectable and traceable.

**REQ-L-GTL3-CONTRACT-LAW-API-002**: Core graph algebra shall remain
`edge`, `compose`, `substitute`, `recurse`, `fan_out`, `fan_in`,
`gate`, `promote`, `identity`, and `same_object`. Host spellings may
vary only when carrier identity and law are preserved.

**REQ-L-GTL3-CONTRACT-LAW-API-003**: A GTL program shall own topology, starts,
GraphFunction membership, compute composition, policy, effects, results, and
proof obligations. A program is not a runtime plan or callable function.

**REQ-L-GTL3-CONTRACT-LAW-API-004**: GraphFunction shall be the sole public
named callable work contract. It shall publish a typed outer interface and
replayable GTL template that materializes a graph. An implementation binding
shall not replace that constructive body.

**REQ-L-GTL3-CONTRACT-LAW-API-005**: The seven C constructors and selected
`F_D`, `F_P`, and `F_H` composition shall be typed, inspectable GTL
declaration truth. Compute regimes shall not exchange authority.

**REQ-L-GTL3-CONTRACT-LAW-API-006**: Recursive GraphFunctions shall declare
the callable relation, termination, foldback, lineage, and bounds. HoG shall
traverse the declared relation; ABG shall admit child and parent runtime truth.
No hidden recursive controller is permitted.

**REQ-L-GTL3-CONTRACT-LAW-API-007**: Plugin, worker, handler, tool, and native
function bindings shall identify only declared implementation seams, input and
output contracts, compute means, capability requirements, and authority
denials. They shall not own topology, traversal, events, continuation, or
closure.

**REQ-L-GTL3-CONTRACT-LAW-API-008**: Prompt construction and other typed assets
shall be declared through GTL asset contracts with constructor, renderer,
digest, authority slot, output contract, proof, node, and evidence relations.
Rendered text is not authority.

**REQ-L-GTL3-CONTRACT-LAW-API-009**: One deterministic GTL validator shall
apply native-equivalent law to serialized programs and shall report typed
validity, invalidity, or unresolved semantics. It may produce canonical
serialization and subordinate indexes but shall not produce an executable
program or runtime truth.

**REQ-L-GTL3-CONTRACT-LAW-API-010**: HoG shall traverse the original admitted
GTL program and materialized GraphFunction graphs directly. A generated HoG
program, CompiledCProgramPlan, compiled execution declaration, ladder, or
runtime-program catalog shall fail as executable authority.

**REQ-L-GTL3-CONTRACT-LAW-API-011**: ABG shall own admission, graph-call and
frame identity, effects and result truth, events, replay, evidence, correction,
continuation, and closure around HoG traversal. ABG shall not redefine GTL
program meaning.

**REQ-L-GTL3-CONTRACT-LAW-API-012**: Downstream products shall not create
second contract-law, validator, executor, event, replay, continuation, or
closure surfaces in parsers, prompt prose, adapters, plugins, fixtures, or
generated read models.

**REQ-L-GTL3-CONTRACT-LAW-API-013**: Every concrete authoring or serialized
carrier accepted by a build tenant shall trace to a GTL declaration, GTL
validator rule, or ABG runtime-admission contract.

**REQ-L-GTL3-CONTRACT-LAW-API-014**: External tool surfaces may realize
declared implementation seams. Tool metadata, transport configuration, and
tool output shall not become GTL or ABG authority by presence.

**REQ-L-GTL3-CONTRACT-LAW-API-015**: `PRODUCT.md`,
`requirements/gtl/README.md`, and installed context projections shall
identify this file as the fast reload surface and shall bind enough identity to
detect stale versions.

**REQ-L-GTL3-CONTRACT-LAW-API-016**: The GTL validator shall project declared
entry, internal vector, start-to-entry, program-membership, implementation-seam,
output-admission, consequence, and catalog-bind relations without executing
them. Missing, ambiguous, illegal, or incomplete relations shall remain typed
non-conformance.

**REQ-L-GTL3-CONTRACT-LAW-API-017**: Validation shall expose the declared
conservation basis for every traversal bind, including intent lineage, target
carriers, materialization authority, carried obligations, residual pressure,
allowed dispositions, admission strength, and obligation delta. Missing
conservation law blocks traversal admission.

**REQ-L-GTL3-CONTRACT-LAW-API-018**: Requirement, traversal-span, context,
destination-topology, test-relation, and evidence-policy declarations shall use
existing GTL publication and attachment law. They feed ABG admission and replay
but shall not emit events, write ledgers, select traversal, or close work.

## Capability Router

| Question | Declaration owner | Validation | Execution and truth |
|---|---|---|---|
| program topology and starts | GTL program | GTL validator | HoG traverses; ABG admits |
| named callable work | GraphFunction template and contracts | GTL validator | HoG traverses materialized graph |
| local transition | GraphVector | GTL validator | HoG advances locus; ABG records |
| compute interior | C plus F_D/F_P/F_H declaration | GTL validator | implementation performs; ABG admits |
| recursion and refinement | GTL GraphFunction relation | GTL validator | HoG child frame; ABG foldback truth |
| runtime effects and results | declared implementation seam | admission contract | implementation acts; ABG admits |
| continuation and closure | GTL policy and result contracts | validator plus admission | ABG replay-derived state |
| downstream domain meaning | downstream Product and Module | common contract law | common HoG and ABG path |

## Non-Substitution Rule

Types, lints, validator reports, package manifests, operation counts, catalog
rows, event co-presence, and generated documentation are necessary evidence
where applicable. None substitutes for the installed causal path or for the
complete Product scenarios.
