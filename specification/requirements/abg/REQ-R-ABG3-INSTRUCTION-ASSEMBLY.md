# REQ-R-ABG3-INSTRUCTION-ASSEMBLY — Instruction Assembly And Dispatch Assurance

**Status**: Active
**Category**: Capability
**Date**: 2026-07-01
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md), [REQ-L-GTL3-CONTRACT-LAW-API.md](../gtl/REQ-L-GTL3-CONTRACT-LAW-API.md), [REQ-L-GTL3-NODE.md](../gtl/REQ-L-GTL3-NODE.md), [REQ-L-GTL3-ASSET-SURFACE.md](../gtl/REQ-L-GTL3-ASSET-SURFACE.md), [REQ-L-GTL3-COMPUTE-NOTATION.md](../gtl/REQ-L-GTL3-COMPUTE-NOTATION.md), [REQ-R-ABG3-BINDING.md](REQ-R-ABG3-BINDING.md), [REQ-R-ABG3-TRANSPORT.md](REQ-R-ABG3-TRANSPORT.md), [REQ-R-ABG3-PAYLOAD.md](REQ-R-ABG3-PAYLOAD.md), [REQ-R-ABG3-FN-COMPOSITION.md](REQ-R-ABG3-FN-COMPOSITION.md), [REQ-R-ABG3-INTERPRET.md](REQ-R-ABG3-INTERPRET.md)

---

## Purpose

Define ABG instruction assembly as deterministic dispatch-assurance law over
existing GTL/ABG carriers, so F_P worker instructions are compiled, relevant,
compressed, proportional, replayable, and non-tautological without creating a
product-local prompt shell or duplicate prompt carrier.

## Acceptance Criteria

**REQ-R-ABG3-INSTRUCTION-ASSEMBLY-001**: ABG instruction assembly shall be an ABG runtime capability over admitted GTL/ABG carrier truth. It shall not define a second GTL graph, node, asset-surface, response-contract, authority-slot, proof-obligation, renderer, regime, payload-ledger, registry, or transport authority surface.

**REQ-R-ABG3-INSTRUCTION-ASSEMBLY-002**: An instruction assembly rule shall be narrow. It may bind graph-function refs, graph-vector refs, section rules, relevance rules, compression policy refs, proportionality policy refs, and runtime binding slot classes. It shall not redeclare source node types, target node types, response contracts, proof obligations, authority slots, renderer refs, active regime, or required carrier classes.

**REQ-R-ABG3-INSTRUCTION-ASSEMBLY-003**: The semantic compiler shall derive source and target node-type truth, response-contract truth, proof-obligation truth, authority-slot truth, renderer truth, active-regime truth, and required carrier classes from existing admitted GTL/ABG carriers before runtime dispatch.

**REQ-R-ABG3-INSTRUCTION-ASSEMBLY-004**: The semantic compiler shall be F_D-owned for source trace, type coverage, response-contract derivation, proof/authority/renderer derivation, relevance, compression, proportionality, runtime-slot bindability, non-duplication, and non-tautology. F_P may propose wording, rubric clarity, or policy critique only as admitted evidence for F_D validation.

**REQ-R-ABG3-INSTRUCTION-ASSEMBLY-005**: An F_P dispatch governed by instruction assembly law shall not occur without an admitted compiled prompt plan, an immutable runtime-bound instruction envelope, and a replayable prompt manifest or equivalent projection that preserves the compiled plan ref, bound runtime refs, renderer identity, response contract, and rendered prompt digest.

**REQ-R-ABG3-INSTRUCTION-ASSEMBLY-006**: Relevance and compression shall be deterministic dependency-resolution decisions over the selected graph function, selected vector, node types, asset surfaces, selected composition, payload/evidence ledgers, requirement/residual/continuation truth when present, and declared policy refs. The F_P worker shall not decide which carrier truth is relevant to its own prompt.

**REQ-R-ABG3-INSTRUCTION-ASSEMBLY-007**: Proportionality shall affect dispatch. A P0 deterministic edge that can be discharged through admitted F_D truth shall not render an F_P prompt, emit `fp_dispatch_requested`, or invoke an F_P worker.

**REQ-R-ABG3-INSTRUCTION-ASSEMBLY-008**: Runtime binding shall accept only admitted or replay-derived refs. Unknown, stale, forged, digest-mismatched, unadmitted, or out-of-scope payload/evidence/artifact/runtime refs shall fail closed before weakened F_P dispatch.

**REQ-R-ABG3-INSTRUCTION-ASSEMBLY-009**: Renderer execution shall be ABG-owned or delegated only to a governed authority-denied renderer over an immutable instruction envelope. Product templates, grammar, rubrics, and style policy may be admitted data; they shall not execute final prompt rendering, bind runtime refs, add hidden instructions, omit required sections, select graph functions, admit responses, or close traversal.

**REQ-R-ABG3-INSTRUCTION-ASSEMBLY-010**: Prompt manifests shall be replayable. Replaying admitted declarations, admitted compiled prompt plans, renderer identity, and ABG runtime events shall reproduce the included/omitted carrier decisions and rendered prompt digest or shall emit a typed replay defect.

**REQ-R-ABG3-INSTRUCTION-ASSEMBLY-011**: Non-tautology shall be a dispatch-assurance obligation. A prompt plan or envelope that carries the expected answer, selected classifier, close disposition marker, or equivalent answer-shaped instruction shall be rejected or shall fail differential proof.

**REQ-R-ABG3-INSTRUCTION-ASSEMBLY-012**: Instruction assembly declarations, compiled prompt plans, renderer bindings, and runtime binding policies that affect dispatch shall enter through the canonical ABG startup and registry/admission path used for product GTL declarations, product libraries, graph overlays, node types, graph functions, and policy overlays. They shall not use a parallel file scan, product-local shell, prompt-loader, local registry, or duplicate selection path.

**REQ-R-ABG3-INSTRUCTION-ASSEMBLY-013**: Registry lookup or selection used to choose instruction assembly, renderer, policy, or plan surfaces shall be replay-derived from admitted registry/startup truth. Query-only lookup shall not create dispatch authority, and product advice shall not become selection truth until ABG admits and validates it.

**REQ-R-ABG3-INSTRUCTION-ASSEMBLY-014**: Worker transport success, worker self-report, prompt shape, or parseable response shape shall not become closure truth. ABG shall admit or reject worker responses against the response contract derived from the selected target carrier and asset surface before any assurance, continuation, residual, or closure projection consumes the response.
