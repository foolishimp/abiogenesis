# REQ-M-GTL3-PROGRAM-TRAVERSAL — GTL Program And ABG Traversal Mapping

**Status**: Active
**Category**: Capability
**Date**: 2026-07-03
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [PRODUCT.md](../../PRODUCT.md), [INTENT.md](../../INTENT.md), [REQ-L-GTL3-GRAPHFUNCTION.md](../gtl/REQ-L-GTL3-GRAPHFUNCTION.md), [REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md](../gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md), [REQ-R-ABG3-INTERPRET.md](../abg/REQ-R-ABG3-INTERPRET.md), [REQ-R-ABG3-GRAPHCALL.md](../abg/REQ-R-ABG3-GRAPHCALL.md), [REQ-R-ABG3-INSTRUCTION-ASSEMBLY.md](../abg/REQ-R-ABG3-INSTRUCTION-ASSEMBLY.md)

---

## Purpose

Define the mapping between GTL program declarations, reusable graph-function
libraries, workspace instance state, and ABG traversal truth. This requirement
prevents downstream products from replacing admitted GTL/ABG traversal with
product-local slot maps, shells, direct vector calls, or duplicate state
surfaces.

## Acceptance Criteria

**REQ-M-GTL3-PROGRAM-TRAVERSAL-001**: GTL and ABG shall distinguish library functions, programs, program instances, mutable workspace surfaces, and runtime traversal. `GraphFunction` is the reusable workflow library function or callable work contract. A graph overlay or GTL program composition is the program. A workspace is the mutable instance surface. ABG traversal is the runtime bind over admitted program and workspace truth.

**REQ-M-GTL3-PROGRAM-TRAVERSAL-002**: A graph overlay or GTL program composition shall own program-level instance typing, roles, security, composition, starts, policy refs, proof obligations, plugin/result contracts, allowed function bindings, and overlay/program metadata. It shall not emit runtime events, select traversal, admit evidence, fold assurance, or close work.

**REQ-M-GTL3-PROGRAM-TRAVERSAL-003**: A workspace shall provide bootstrap config, files, data, observed state, generated artifacts, run archives, and other mutable instance surfaces. A workspace shall not become program authority, graph-function selection truth, traversal state, closure truth, or a product-local controller.

**REQ-M-GTL3-PROGRAM-TRAVERSAL-004**: ABG startup shall consume admitted GTL program declarations, graph-function library entries, overlay/program declarations, startup config, and workspace binding truth before runtime selection, graph-call opening, vector traversal, instruction assembly, effect dispatch, admission, fold, residual, continuation, re-entry, block, or terminal projection.

**REQ-M-GTL3-PROGRAM-TRAVERSAL-005**: ABG traversal shall preserve a state model at least as precise as selected program, selected graph-function binding, selected graph call, selected graph/vector basis, frame/span lineage, workspace binding, carried carrier refs, instruction envelope, effect invocation, admission, assurance, continuation, and replay projection.

**REQ-M-GTL3-PROGRAM-TRAVERSAL-006**: Execution shall be an effect inside traversal. Actor, tool, process, F_D, F_P, and F_H effects shall not be described as the traversal monad itself and shall not own traversal bind.

**REQ-M-GTL3-PROGRAM-TRAVERSAL-007**: A graph function shall not be treated as the whole product program when an admitted overlay or GTL program composition declares the program. The graph function remains reusable, bindable, composable, substitutable, refinable, and callable through GTL/ABG law.

**REQ-M-GTL3-PROGRAM-TRAVERSAL-008**: Slot maps, lifecycle maps, catalogs, dashboards, parity matrices, and local role maps shall be derived indexes unless they are explicitly ratified GTL declarations or ABG replay projections. A derived index shall not select traversal, replace graph overlay/program truth, replace graph-function identity, or become runtime state.

**REQ-M-GTL3-PROGRAM-TRAVERSAL-009**: A public start or product startup path shall enter through the canonical ABG startup and registry/admission path. It shall not scan a workspace, call a graph vector, invoke a plugin, or select a graph function through a product-local shell before ABG emits or projects the required runtime truth.

**REQ-M-GTL3-PROGRAM-TRAVERSAL-010**: Downstream products may publish specialized graph functions and overlays through product libraries, but those libraries shall be consumed by ABG as admitted GTL declarations and registry/startup truth. Product specialization shall not create a parallel system library, registry, prompt shell, traversal loop, or closure ledger.

**REQ-M-GTL3-PROGRAM-TRAVERSAL-011**: Design and realization surfaces that implement this mapping shall include a domain/state model naming each owner and source truth row for program declaration, workspace binding, startup admission, registry projection, selection, graph call, traversal basis, frame/span lineage, carried carriers, instruction assembly, effect invocation, admission, assurance, continuation, and replay.

**REQ-M-GTL3-PROGRAM-TRAVERSAL-012**: Tests or proof harnesses shall not claim traversal parity when they call individual vectors, plugins, workers, or product scripts directly. A traversal proof shall start through admitted program/workspace startup or a documented ABG resume boundary and shall read replay truth for each traversal-affecting result.

**REQ-M-GTL3-PROGRAM-TRAVERSAL-013**: Semantic compiler and GTL program
conformance checks shall reject public starts that bypass an admitted graph
overlay or GTL program composition and bind directly to a graph function as the
whole traversal program.

**REQ-M-GTL3-PROGRAM-TRAVERSAL-014**: Semantic compiler and GTL program
conformance checks shall reject runtime bindings that use context bootstrap,
workspace shell commands, direct vector/plugin/worker calls, or product-local
routers as traversal runtime. Context bootstrap may establish local reference
truth and cold-agent context, but it is not ABG traversal.

**REQ-M-GTL3-PROGRAM-TRAVERSAL-015**: Semantic compiler and GTL program
conformance checks shall validate installed ABG/GTL context compression against
the selected product version and shall flag stale abstraction text that treats
graph functions as whole programs or workspaces as traversal authority.

**REQ-M-GTL3-PROGRAM-TRAVERSAL-016**: Semantic compiler and GTL program
conformance checks shall report or reject drift; they shall not write
instruction files, mutate workspace binding truth, install products, or replace
the installer as the owner of context materialization.
