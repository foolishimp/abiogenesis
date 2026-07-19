# REQ-R-ABG3-HANDLERS - Effect Handlers And Execution Binding

**Status**: Candidate - T-283 constitutional transaction; not operative until F_H closure
**Category**: Capability / Constraint
**Date**: 2026-07-20
**Derives from**: [PRODUCT.md](../../PRODUCT.md), [REQ-R-ABG3-CCALL.md](REQ-R-ABG3-CCALL.md), [REQ-R-ABG3-INTERPRET.md](REQ-R-ABG3-INTERPRET.md)

---

## Purpose

Define the effect-handler boundary for compute encountered while HoG traverses
an admitted GTL program. GTL declares the category and implementation binding;
HoG reaches and invokes the declared seam; the handler performs only the
interior effect; ABG owns C-call frames, evidence and result admission, events,
judgment, replay, continuation, and closure truth.

A handler binding is admitted configuration data:

```text
programRef + graphFunctionRef + cLocusRef + regime
  + implementationRef + handlerClass + handlerConfigRef
```

The binding is not a program, selector, traversal plan, event source, or
controller.

## Handler Obligations

**REQ-R-ABG3-HANDLERS-001**: A handler shall realize exactly the admitted C
locus, regime, and implementation binding it receives. It shall not infer a
stage, arm, function, or program from a label, filename, prompt, adapter route,
or ambient state.

**REQ-R-ABG3-HANDLERS-002**: A handler shall return an interior result and
evidence only. It shall not mint C-call spine events, ABG result truth,
judgment, continuation, retry, or closure. Those facts enter only through the
owning ABG admission boundaries.

**REQ-R-ABG3-HANDLERS-003**: Outcome status and evidence references shall
correspond to real effects. External sessions, tool calls, files, and process
results shall reconcile against admitted C-call evidence. Asserted but
unevidenced effects are drift.

**REQ-R-ABG3-HANDLERS-004**: Tool knowledge, including commands, models, paths,
and environment variables, shall enter through declared implementation and
transport configuration. Tool identity embedded as hidden handler strategy is
prohibited.

**REQ-R-ABG3-HANDLERS-005**: Handler inputs shall come from admitted GTL,
catalog, workspace, execution-basis, and implementation-binding truth. Globals,
undeclared environment, filesystem discovery, current working directory,
hidden defaults, and adapter-local configuration are not authority.

**REQ-R-ABG3-HANDLERS-006**: A handler throw, transport failure, timeout, or
malformed interior result shall become a typed blocked or non-admitted outcome
at the ABG boundary. It shall not kill the run, become success, or bypass the
declared retry and continuation law.

**REQ-R-ABG3-HANDLERS-007**: Evidence archives shall key on the exact C-call and
attempt identities. Re-execution, replay, or resume shall not duplicate,
relabel, or orphan evidence.

**REQ-R-ABG3-HANDLERS-008**: A handler shall honor the admitted timeout,
attempt, capability, write-root, and effect envelope. Overrun or unsupported
effect is typed non-success, never an unbounded wait or silent fallback.

## Handler Classes

**REQ-R-ABG3-HANDLERS-009**: ABIogenesis may ship generic pipeline handlers for
declared `F_D`, `F_P`, and external `F_H` seams. Products configure those
handlers through GTL and catalog declarations; a product shall not implement a
standard-path worker loop.

An `F_D` handler is lawful only for a total function over a finite declared
domain or a finite-state process with a total transition function and explicit
typed output for every admitted input. Mechanical envelope facts such as
executed, blocked, identity, digest, path, and write-root may be `F_D`.
Semantic quality, intent satisfaction, acceptance, ranking, diagnosis, or
open-domain judgment remains `F_P` even when implemented deterministically.

**REQ-R-ABG3-HANDLERS-010**: A capability handler may delegate one declared
interior effect to a local or external capability whose exact contract and
compute regime are admitted. The outcall shall preserve input, output,
evidence, actor, and capability identity and shall not become a second
traversal or runtime.

## One Effect-Resolution Seam

**REQ-R-ABG3-HANDLERS-011**: HoG shall resolve an encountered executable GTL C
locus through exactly one implementation-binding seam. Product-local prompt
shells, handler scanners, file loaders, private registries, SDK/CLI routers,
fixtures, and feature services are not lawful effect-resolution seams.

**REQ-R-ABG3-HANDLERS-012**: An admitted but unresolvable implementation
binding, unknown capability, incompatible regime, or missing handler shall
block the C call with a typed reason before any interior effect runs.

**REQ-R-ABG3-HANDLERS-013**: Retry, escalation, branch, and alternative
implementation choice shall derive from admitted GTL structure, policy, ABG
replay facts, and the current execution basis. A handler or adapter shall not
walk a private configuration ladder or choose another program.

**REQ-R-ABG3-HANDLERS-014**: Resume shall continue HoG traversal from the
replay-derived ABG frontier. Closed C calls remain closed. A fresh attempt is
opened only when the admitted retry or resume policy permits it; no caller may
hand-edit frontier or attempt truth.

**REQ-R-ABG3-HANDLERS-015**: Handler configuration shall carry system and
environment bindings only: implementation identity, commands, paths,
environment, timeouts, model or tool binding, and archive roots. Domain
content, workflow shape, prompts, contracts, policies, retry structure, and
closure law belong in GTL or referenced product declarations.

**REQ-R-ABG3-HANDLERS-016**: Standard behavior shall be published as named GTL
programs and GraphFunctions in the installed catalog. A Product may select a
declared standard program through an explicit admitted binding. There is no
baked bootstrap triple, hidden default program, generated HoG program catalog,
or interpreter-local fallback.

## Non-Closure

This family is not satisfied by a handler that mints truth, a second execution
seam, hidden configuration, an unevidenced outcall, a product-local worker
loop, a private program selector, an error that terminates the process, or
evidence that does not reconcile with ABG replay.
