# REVIEW: ABG 5 common computational library: does the design consolidate?

**Author**: Claude, Reviewer. Comment Writer for this one file only.

**Date**: 2026-10-21T08:58:26Z

**Addresses**:
- the accepted [library design](../../../build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md), SHA-256 `cb8dae9f7e684f9b6be730b74125294524ecd7e4d1f035fc03734d7ff1d1160b`;
- the accepted [L2 execution contract](../../work/T287_COMMON_LIBRARY_DELIVERY_01/L2-execution-contract.md), SHA-256 `65f4007521634d808a3fd94bc87707ae4183ddb00ec4ec0da49e37381ee403c1`;
- the uncommitted L3 source on `main` over HEAD `67c333799`, as read between 08:20Z and 08:58Z.

**Status**: Commentary only. It is not an acceptance, a grant or a design.

This post is not committed. Codex's P1 is running against freezes bound to HEAD plus the uncommitted bytes, and its checkpoint writer owns Git in this tree.

**Question asked**: does the design consolidate? The owner asked for a judgement of the design itself, not of conformance totals.

Code paths below are relative to `build_tenants/abiogenesis/typescript/code/src/`. K01–K12 and D01–D11 are the design's own labels: K for a capability, D for a ledger row.

## Answer

No. The design is mostly a catalog of existing modules.

The library has no surface of its own: its twelve capabilities are, in the design's words, "review coordinates", not callable exports. The ledger (design §6) does three things:
- it contracts three small duplicates (D02–D04: five private functions and two filter expressions);
- it defers the one large recurrence, process cleanup (D10);
- it gives every other recurrence a "consume", "retain" or "compose" disposition. In this delivery, none of those changes any code.

L2 then took on process cleanup (E03), and that is a genuine consolidation. But it stops at the physical facts and leaves the verdict "the process is gone" to each caller. The current lifecycle blocker sits in that gap.

Codex's repair proposal, E03-L5-01, was recorded at 09:00Z, after this review's trace. It closes the worker and actor part of the gap; §1 sets out what it leaves.

The other failure that caused churn, the C2 source-prefix bug, sits in a canonical-equality copy that the design never inventoried. Both churn sources are unconsolidated variants, not merges gone wrong.

## 1. The lifecycle blocker sits in the gap E03 left

This section bears on the repair in progress.

`createOwnedProcessLifetime` returns one fact set, `OwnedProcessFacts`. It holds:
- the direct exit;
- whether the owned scope is absent (`absent | present | unknown`);
- whether close was observed;
- drain expiry;
- the first error.

The L2 contract keeps each owner's own reading of those facts: "worker and command `terminationConfirmed` are not collapsed into one shared Boolean". There are now four readings:

| Caller | Rule for "terminated" |
|---|---|
| worker `runProcess` (`abg/worker_transport.ts:455`) | scope absent and direct exit seen |
| command (`implementation/worksite_command_helper.ts:769`) | scope absent |
| HTTP probe (`implementation/worksite_command_helper.ts:1136`) | scope absent |
| actor owner (`abg/actor_process.ts:997–1262`) | a callback-maintained flag. It is set true on direct exit or spawn failure and false on an unconfirmed notice. On normal return it is overwritten with the worker rule, or'd with "not started and negative status". |

The following trace is my own reading of the source, made before Codex's proposal appeared. It is one path that matches the reported blocker.

1. On direct exit, the actor owner's `onProcessExited` sets `processTerminalConfirmed = true` (`abg/actor_process.ts:1254`). Direct exit is not group absence; the lifetime keeps the two apart.
2. On the normal return path that flag is overwritten from the transport result (`abg/actor_process.ts:1262`). The exception path reaches the catch at line 1369 without that overwrite.
3. Once the lifetime records a first error, `observe()` returns early (`shared/owned_process_lifetime.ts:216`). `finishScope` delivers `onUnconfirmed` only through `observe` (line 224). So the actor owner's unconfirmed handler (`abg/actor_process.ts:1257`) never runs. That handler would clear the flag and append `actor_process_termination_unconfirmed`.
4. `runProcess` throws `facts.firstError` (`abg/worker_transport.ts:451`), and the scope facts are dropped with it.

Suppose an error occurs after direct exit but before the group is confirmed gone. For example, the append that records the SIGTERM request fails, or a stream errors. The invocation then ends with `actor_invocation_failed` / `transport_exception` written as its terminal event (`abg/actor_process.ts:1386–1397`). No `actor_process_termination_unconfirmed` is written, whatever the group's state.

The projection then keeps no cleanup obligation for the process:
- the unconfirmed event is what initiates `actor_cleanup_pending` for an invocation (`abg/event_calculus.ts:875`);
- `actor_invocation_failed` terminates both cleanup fluents for its process (`abg/event_calculus.ts:1964–1987`).

Now put the error before the exit. `observe()` also suppresses the exit callback, so the flag stays false, and the catch writes no actor terminal at all. The same final facts give two different histories depending only on callback order.

The consolidation is also the repair:

- One function derives the termination verdict from `OwnedProcessFacts`, per platform scope, and every caller uses it. The actor owner's callback-maintained flag goes.
- The lifetime hands its facts back on the error path too: it returns the facts with the error instead of throwing the error alone.
- The verdict does not depend on an observer callback being delivered after a first error.
- Nine interfaces each redeclare `terminationConfirmed` and its neighbouring fields; they should embed one termination-evidence type instead. The nine are `ProcessObservation`, `WorkerTransportResult`, `WorkerTransportFailureObservation`, `ActorProcessObservation`, `ProbabilisticTransportEvidenceCandidate`, `AdmittedCCallEvidenceDetails`, `ReplayActorProcessState`, `ProbabilisticWorkerObservation` and `WorksiteCommandResult`. The bootstrap's rule applies: "Consume one canonical definition per framework contract from the exact library; do not redeclare its shape or meaning."

Patching the actor owner's flag alone closes this path and leaves the four readings in place.

**Codex's proposal.** [E03-L5-01](../../work/T287_COMMON_LIBRARY_DELIVERY_01/realization/e03-final-facts-repair-01/HOW-proposal.md) reaches the same diagnosis. For the worker and the actor it does what the first three bullets ask:
- the final facts are delivered once, outside `observe`, even after a first error;
- only final scope absence plus a direct exit can produce `actor_process_exited`;
- the early flag and the negative-status fallback are retired.

It also deletes a duplicate fresh-worker runner in test support.

It leaves three things:
- **Command and HTTP keep their own reading.** The shared lifetime and the command helper are read-only in its territory, so those two callers still read "scope absent" alone. The difference shows on a launch failure with no child. The command result says `terminationConfirmed: true` with status 127. For the same fact, the worker says false, and under the proposal the actor records a separate spawn-failed terminal.
- **The carriers stay.** The proposal says "`WorkerTransportResult`, `ActorProcessObservation` … remain unchanged", so the nine carriers keep their own copies of the termination fields.
- **One meaning still has four implementations.** The process lifecycle is projected separately in `actor_process.ts`, `replay.ts`, `runtime_liveness.ts` and `event_calculus.ts`. The proposal edits all four so that they "must agree on the existing confirmed-event meaning". Needing four edits to change one meaning shows the meaning is implemented four times. The design (K08) says Event Calculus owns that meaning and that other projections compose its facts.

## 2. What the design consolidates

Read plainly, the §6 ledger says:

- **D02–D04 contract.** They remove the `sameJson`/`sameCoordinate` copies in the environment and verification bindings, and two private exact-key checks now call `hasExactKeys`. Two exact-one filters now call `resolveExactMatch`.
- **D10, process cleanup, is deferred** behind E03.
- **D01, D05–D09 and D11** are "consume", "retain distinct" or "compose". In this delivery they change no code.
- **The §8 table of fifteen families** lists which K-numbers each family touches; for two families the entry is "K01–K12 as traversed". It shows no feature composed from the library.

Some of the named capabilities are genuine consolidations: the three static binders, the canonical writer, the rooted partition and the event-body codec. They predate this design, which names them.

The library has no surface. The design says "Existing modules remain its implementation locations", and K01–K12 "are review coordinates". So nothing changes how the next feature is written, and nothing detects when new code ignores the library.

The new unknown-effect module from this same delivery shows it. U1 is L2's correction of how an unknown native effect withdraws current worksite observations. Its file `abg/native_work_effect.ts:62` hand-writes its own exact-one `one()` and inline scope comparisons. It does not use `resolveExactMatch` (K04).

## 3. Credit

- **E03 is a genuine consolidation.** Three hand-written signal, probe, escalation and drain loops became one module. That module has explicit phases, keeps the first error, and uses one deadline mechanic.
  - It removed a real defect. Before the change, the HTTP probe returned `terminationConfirmed: true` unconditionally (`implementation/worksite_command_helper.ts:1206` at `67c333799`).
  - The chunked monotonic deadline fixes Node's clamping of timer delays above 2^31−1 ms to 1 ms, which could fire a grace period or a KILL early.
- **U1 merged two authentications.** The near-identical native-task authentications became `projectNativeWorkUnknownEffectTask`, and three causes now share one selection of retired observations.
- **D02–D04 are correct and safe.**
- **The design refuses merges where the meanings differ, and those refusals are right:**
  - direct exit versus group absence;
  - a POSIX process group versus a Windows child;
  - digest equality versus authentication.

## 4. Recurring relations the design did not consolidate

For each case below I give:
- the relation;
- what the design says about it;
- what one function would own.

Each case uses a capability the design already admits, so none needs a registry, runtime or framework.

### 4.1 Canonical equality, and the C2 bug

**Relation:** two JSON values have the same canonical bytes.

**Design:** two canonical-value equalities are named and kept apart. They are `sameJson`, which returns false on an encoding error, and `hog/operator_support.ts::sameCanonical`, which compares digests. D02 merged one copy of `sameJson`.

**Source:** eleven more file-private copies remain, named `sameCanonical`, `sameCanonicalValue` or `sameCanonicalRetryValue`. They are in:
- `public_function_family`;
- `verify_product`;
- `public_contract_publication`;
- `worksite_operations`;
- `worksite_construction`;
- `worksite_branch_construction`;
- `execution_basis`;
- `open_call`;
- `c_call`;
- `retry`;
- `parent_rehydration`.

Ten take `unknown` and one takes `object`; all eleven cast to `JsonValue`. Eight throw on an encoding error and three return false. Neither the design nor the modules say why.

The C2 bug lives in one of these copies:
- `abg/execution_basis.ts:529` compared the durable event array with the result of `runtimeEventBodiesAtPrefix(...)`, which is a `RuntimeEventBodyView`.
- Through the cast, `canonicalJson` takes its object branch and writes the view's only own field, giving `{"length":N}` (`abg/runtime_history.ts:593`). That can never equal an array.
- The repair added `.materialize()` at that one call site.

I wrote a lexical search for each unmaterialized view binding. It looks up to 150 lines past the binding for an equality, digest or cast that takes the bound name. It does not follow a view passed through another function. Run on the `67c333799` source, it finds the original C2 site. Run on the current tree, it finds no second instance. So I found no second live instance, but the type hole is still open, because every copy accepts `unknown` or `object`.

**What one function would own:** one `sameJson(left: JsonValue, right: JsonValue)` in the canonical module (K02), with its failure channel chosen once. Once the `unknown` parameters are gone, passing a view should be a compile error. I have not compiled it, so treat that as a check to run.

### 4.2 Reading an admitted fact from history

**Relation:** find the admitted event that carries fact X for ref R at prefix P, decide its multiplicity, check its payload and content-addressed ref, and return a typed value. This is the central computation of an event-sourced runtime. Many of the exported `project…AtPrefix` and `rehydrate…AtPrefix` functions perform it, and so do local ones. Some exported functions are thin wrappers or prefix accessors, so I have not counted them.

**Design:** K08 covers access: prefix selection, index buckets and body views. The relation itself is left to each owner (D07 "consume").

**Samples read:**
- `projectExactExecutionBasisAtPrefix`;
- `projectExactInvocationAdmissionAtPrefix`;
- `rehydrateAdmittedImplementationSetAtPrefix`;
- `projectAdmittedRoute`;
- `projectRunIdentityAtPrefix`;
- `projectRetainedWorksiteInputAtPrefix`;
- `projectAdmittedCCallResultFromPhase`;
- U1's task join.

**Shared by the samples:**
- an index select;
- a kind and ref filter;
- a multiplicity decision;
- a digest check and a `scheme://abiogenesis/<digest>` self-check;
- a freeze;
- an `as unknown as T` cast of the payload.

**Different per fact:**
- the payload projection;
- joins to other facts;
- causation predicates;
- side registries such as `executionBases.add`.

Each reader decides multiplicity for itself. Most require exactly one. The route reader takes the first match for `construction_intent_selected` and `run_stopped` (`abg/traversal_route.ts:771`, `777`). That relies on an admission invariant the reader does not check. K04's own result contract has no first-match case.

Thirteen modules define a local `one()`, each with its own contract; the new U1 module is one of them. `resolveExactMatch` has five callers. Three modules define their own `sameScope`.

**What one function would own:** one reader over a declared fact contract. The contract gives the event kind, the index key, the ref field, the payload schema and the digest rule. The reader returns K04's `absent | one | many` result, with the payload checked against the schema. Owners keep their projections and joins. The reader only reads facts that are already admitted. It admits nothing, so no authority moves.

**Disclosure:** on 2026-09-20 I recommended for T-288 that "the owner proves the fact once and hands its result down" ([post](20260920T032443Z_REVIEW_cross_code_compression_t288_d05_candidates.md)). So this finding is partly a check on whether my own earlier recommendation was taken up. At the reader level, it was not.

### 4.3 Canonical record digest with streamed members

**Relation:** the canonical digest of a record where some members are written lazily, such as prefix values, replay guards or selected rows.

**Design:** D01 says "Canonical collected text and streaming digest already share one writer."

**Source:** three hand-rolled object writers re-implement the canonical framing (sorted keys, separators and key encoding) so they can splice in lazy members:
- `pendingInteractionBodyDigest` (`abg/c_call.ts:7309`);
- `completedRetryProgressPlanDigest` (`abg/retry.ts:6600`);
- `digestReplayBody` and `writeReplayBody` (`abg/replay.ts:2297`).

**What one function would own:** `writeCanonicalJson` (K02) accepts a writer per key for streamed members, and the three writers become calls to it.

### 4.4 The library's own core

**Relation:** a shallow record-shape check and an exact key-set check.

**Design:** E01 keeps the NUL-joined comparators as a distinct domain until each caller's domain is established. These comparators sort the keys, join them with NUL, and compare the joined strings.

**Source,** in `shared/admission_predicates.ts`:
- **Five NUL-joined key comparators** (lines 13, 43, 52, 63, 74) are one algorithm.
  - Three of the bodies are identical.
  - The two "Unicode" variants sort with `compareUnicodeCodeUnits`, which compares strings with `<`. JavaScript's default string sort also orders by UTF-16 code units. So the name marks a difference that does not exist.
- **`hasExactKeys` and `hasExactJsonKeys`** are identical.
- **Five record guards** run the same test with different type refinements: `isRecord`, `isJsonRecord`, `isJsonRecordShape`, `isOptionalJsonRecord` and `isMutableRecord`. Twenty-five more local `record` guards sit in other modules.
- **A misleading alias.** A caller imports `hasNulJoinedFields as exactKeys` (`implementation/worksite_command_helper.ts:3`). The design itself calls this kind of alias misleading.

**What one function would own:** one exact key-set check and one generic record guard. To keep the NUL-joined form, a caller would need a correct answer that depends on the collision. The design shows no such caller.

## 5. The working rule

The design's method merges two variants only after their equivalence is proved: E01–E04 block extraction until then. Keeping a variant needs no proof at all.

That rule prevents false merges, and the refusals credited in §3 show it doing so. Applied to everything, though, it keeps accidental variation. This delivery's defects came from accidental variation: four termination readings and eleven private equality copies.

For the owner's goal, one solution per equivalent computational problem, the burden should be reversed. A variant stays only when someone states an input on which the merged function would give the wrong answer.

The design layer shows the same pattern. The library document retires nothing. The April library derivations stay as "design lineage", and K01–K12 add a third classification on top of the constitution's eight operator classes and the binding's ontology.

## 6. What a consolidation design would decide

Listed in order of consequence:

1. One termination verdict over `OwnedProcessFacts`, returned with the facts on every path, and one embedded termination-evidence carrier (§1). E03-L5-01 does the first half for the worker and the actor.
2. One typed canonical equality on `JsonValue`. Delete the eleven copies (§4.1).
3. One admitted-fact reader over declared fact contracts, returning K04's result (§4.2).
4. One canonical record writer with streamed members (§4.3).
5. One exact key-set check and one record guard (§4.4).
6. A source check that fails when a module defines a local copy of any of these. This is a test over the source tree, not a registry. It stops new code from quietly starting a new variant, as U1 did.

The design (§1) quotes Product's 5.0 compression boundary. Under it, identity, authority, currentness, replay and fresh-process defects are 5.0 work, and further pure-helper contraction may wait for 5.1.
- Items 1 and 2 close defect classes in the 5.0 group.
- Items 3–5 are contraction that Product allows in 5.1; new code should use them from the start.

## Limits

- **Read-only review.** Nothing was built, compiled, tested or run in the abiogenesis tree. The one script I ran was a lexical search, kept in my own scratch directory.
- **The termination trace comes from the source**, not from a run. It was made before E03-L5-01 appeared. I read that proposal afterwards; its implementation does not exist yet.
- **The reader shape rests on the eight samples named in §4.2.** The counts in §4 come from lexical searches of a tree that is changing under Codex's repair. The four traced files were unchanged at 09:03Z.
- **Not assessed:** the P5 timeout, P1 and the proof lanes.
- **Interest:** I am Claude reviewing Codex's design, and §4.2 partly checks my own earlier recommendation.
