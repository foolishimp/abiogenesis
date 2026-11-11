# M03 Instruction Assembly Derivation

**Ticket**: T-183
**Status**: Active design
**Date**: 2026-07-01
**Change class**: requirement_reprice -> design_reframe

Retired sections: [history/M03_INSTRUCTION_ASSEMBLY_DERIVATION__RETIRED_SECTIONS.md](history/M03_INSTRUCTION_ASSEMBLY_DERIVATION__RETIRED_SECTIONS.md).

## Source Authority

- `specification/PRODUCT.md`
- `specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md`
- `specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md`
- `specification/requirements/gtl/REQ-L-GTL3-NODE.md`
- `specification/requirements/gtl/REQ-L-GTL3-ASSET-SURFACE.md`
- `specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md`
- `specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md`
- `specification/requirements/gtl/REQ-L-GTL3-COMPUTE-NOTATION.md`
- `specification/requirements/abg/REQ-R-ABG3-BINDING.md`
- `specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md`
- `specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md`
- `specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md`
- `specification/requirements/abg/REQ-R-ABG3-INTERPRET.md`
- `specification/requirements/abg/REQ-R-ABG3-INSTRUCTION-ASSEMBLY.md`
- `.ai-workspace/tickets/completed/T-183-design-and-realize-abg-instruction-assembly-semantic-compiler.md`
- `build_tenants/abiogenesis/typescript/design/history/M03_INSTRUCTION_ASSEMBLY_FIRST_SLICE_IACS.md`
- `build_tenants/abiogenesis/typescript/design/history/M03_INSTRUCTION_ASSEMBLY_STRUCTURAL_CARRIER_DIAGRAM.md`

## Current native binding and material lifetime

The existing native-basis owner may consume the Event Store's distinct private
owned-prefix selection instead of retaining a complete decoded Event array.
It authenticates the same execution, graph, CCall, cursor, input, implementation,
environment and predecessor coordinate through their defining owners. Native
assembly, declared-role projection, actor admission and liveness consume that
actual relation and explicitly selected bodies. It is a disposable realization
of the current cut, never a partial Public prefix or a new source of authority.
Copied/plain historical bases keep their ordinary durable authentication path.

One prepared attempt passes its actual bound material to dispatch and response
admission; neither consumer reconstructs a second assembly merely to cross the
internal boundary. Within that attempt the complete logical assembly remains
inspectable, with unchanged prompt bytes, canonical/carrier schemas,
plan/envelope/manifest digests, task scope, source qualification and native
binder. Removing a prospective carrier, such as the binding `rawInputValue` or
the native Result task, changes the envelope identity of new attempts; retained
historical values keep their bytes and digests and are interpreted by their
original owners. Any shared physical
body representation is owned by the existing Event Store codec and must recover
those same plain logical values, including old admitted records. Its typed
native-definition slot shares only the present fixed publication and
GraphFunction/declaration fields of `envelope.nativeBasis`; per-call graph,
cursor, input and plan remain complete and distinct. The envelope's
`executionBasis` is the basis coordinate without `rawInputValue`; the admitted
basis owns that input, and authentication rehydrates the complete basis at the
bound predecessor prefix ([library design §10.8](ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md#108-retained-owner-carriage-for-prospective-native-work-rc7)).
Retained bindings that carry the complete basis keep their original bytes and
authenticate by complete equality. Physical version 2
restores the exact bundle before logical admission/readback, while raw and
version 1 histories remain readable. A location or
digest alone cannot replace required content. No Proxy/getter body, alternate
renderer, live-cache authority or new quota is introduced.

The native-work envelope binds its admitted task through `inputRef` and
`inputDigest` and carries no second whole task. Its plan keeps the context
ref/digest, read roots and write roots. The framed-synthesis selector reads each
declared source body through the held-prefix reader for its own Run and grant;
an unavailable member refuses the assembly. Semantic evidence and worksite views
require inline births and refuse an admitted member.

The worksite assembly owner (`abg/instruction_assembly.ts`) is the pre-P1
Context value-use boundary for the native work input. A pre-P1 worksite context
derived its observation digest over its inline bytes, so it fails the current
context validator. After the owner authenticates the admitted input of a
native-work occurrence, a `native_workspace_work_task` presenting a
`worksite_context_observation` that fails that validator refuses
`unsupported_selection`. The refusal names the constructor or assessor role and
the presented context ref. It occurs before role evidence, prompt rendering and
actor transport; actor preparation fails and the actor invocation refuses
without a transport. A fresh current-format task over the same files assembles
unchanged. The boundary selects only this carrier and this existing cause. It
adds no schema version, decoder, failure class or history migration. It does
not make generic history reads reject every embedded pre-P1 value. Pre-P1 logs
remain readable with their pinned earlier builder.
