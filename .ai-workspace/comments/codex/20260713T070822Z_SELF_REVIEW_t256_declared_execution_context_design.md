# T-256 Declared Execution Context Design Self-Review

## Verdict

`ready_for_independent_and_fh_review`. The reworked three-view design closes the
known internal design contradictions without admitting implementation. No
T-256 source, test, schema, generated asset, or runtime behavior has changed.

## Authority Basis

- T-256 ticket boundary: `carrier_field_indirection` plus
  `declared_instruction_protocol_join` only.
- accepted T-255 exact published/capability-blocked outcomes and startup fence;
- `REQ-R-ABG3-INSTRUCTION-ASSEMBLY-001..017`;
- `REQ-L-GTL3-CONTRACT-LAW-API-008`, `-010`, and `-012`;
- `REQ-L-GTL3-RULE`, `REQ-L-GTL3-ATTRS`, `REQ-L-GTL3-MODULE`, and
  `REQ-L-GTL3-ASSET-SURFACE`;
- C-algebra/CCALL declared stage law; and
- `DESIGN_MODULE_METHOD.md` section 5E.

## Confirmed Design Corrections

| Prior risk | Corrected design relation |
|---|---|
| code-owned response protocol | admitted `gtl.instruction_protocol` Rule data owns content; Node `AssetSurface` remains prompt-interface authority |
| local product field conventions | admitted `gtl.execution_context_projection` Rule rows map exact source Nodes to generic slots through strict own-property paths |
| registry source refs lost after admission | `declarationSourceRefs` survive registry event, replay projection, execution binding, and canonical identity |
| repeated catalog rows create ambiguous Module truth | one exact `CatalogDeclarationModuleBinding` is compressed per module ref/name/digest with contributing row lineage; conflicts fail |
| capability-blocked outcome lacks normalized program | program resolves only from the exact selected `CatalogExecutionBinding.module` and is checked against T-255 binding identity |
| full program does not identify one request stage | admitted `DeclaredCStageInvocationBasis` binds exact program/index/role/regime/term/category identity without selecting execution order |
| carrier values could match by label or position | every admitted carrier row binds exact source Node, schema, carrier, admission, and digest identity |
| informal request-or-failure return | one `DeclaredExecutionContextJoinOutcome` has request, exact capability-block, or typed-invalid variants |
| request could soften downstream gates | every request preserves the exact T-255/T-267 startup block; T-255/T-268 capability absence produces no request |
| sequence implied T-257 consumed a request | T-256 returns a startup-blocked request; T-257 remains the later raw-response admission owner |

## Proportional Boundary

The design adds no GTL atom, second registry, prompt service, controller,
dispatcher, traversal loop, response admission, event writer, or
Consensus-specific runtime. The companion instruction Module is admitted as a
`node_type` identity GraphFunction and grants no callable execution binding.
The T-252 body remains byte-identical; only its catalog declaration gains the
ordered companion source ref, so the declaration digest is expected to change.

T-259 remains the workflow C sequencing owner. T-267 remains traversal/result
conservation authority. T-268 remains tenant-conformance-manifest publication
authority. The existing instruction compiler retains relevance, compression,
proportionality, non-tautology, rendering, and manifest ownership.

## Verification

- Mermaid design gate: 5/5, covering the registered nine designs and 27
  diagrams;
- exactly one class, sequence, and state view in the T-256 design;
- only standard `pass`, `fail`, and `not_applicable` axiom verdict labels;
- `git diff --check`: passed; and
- implementation files changed: zero.

## Explicit Review Decisions

F_H or an independent reviewer must accept or reprice:

1. the two strict Rule profiles over existing GTL carriers;
2. replay-preserved `declarationSourceRefs` and one canonical non-invoking
   Module binding inside the existing admitted runtime catalog basis;
3. the exact declared stage-invocation basis, with T-259 retaining sequencing;
4. the `node_type` companion Module and catalog-declaration-only T-252 change;
5. the one discriminated public join outcome and exact preservation of T-255
   capability/traversal blocks; and
6. the proof matrix, including non-Consensus and multi-source fixtures.

No implementation is admitted until explicit F_H acceptance is recorded.
