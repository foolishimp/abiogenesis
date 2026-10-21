# E03 command/HTTP final facts and retained failure inspection

Status: proposal for independent assessment only. Frame: `repo://abiogenesis/build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#f-worksite-causality`. Product's fixed families, GTL/HoG traversal and ABG authority remain unchanged. Product 681–704 and HANDLERS-002/003/006/007/008 require attributable occurred effects without synthetic success. L2 §4 preserves distinct physical facts and first failure. C2 HOW 253–255/573–576 already classifies exact attempt archive writes as owner evidence mechanics. This proposal specializes those mechanics; it grants no task permission to write the original archive.

## Deciding relation and sequence

The common lifetime freezes canonical `OwnedProcessFacts`; ordinary `observe` callbacks stop after firstError. Command throws inside its completion try before finally; HTTP detaches in finally, then throws. Both discard attributable final facts. Main consequently never publishes its complete artifact. `exactExchange` requires a successful exact exchange; HoG ccall_lifecycle 541–559 returns on actor refusal before invocation.complete. Retain those gates and make failure inspection independent of them.

```mermaid
sequenceDiagram
  participant L as Existing owned lifetime
  participant A as Command or HTTP adapter
  participant M as Helper main
  participant F as Exact attempt archive
  participant I as Stateless implementation inspector
  L->>A: completion: same frozen OwnedProcessFacts
  A->>M: retain facts reference and raw captures/context
  A->>A: detach/cancel; derive available diagnostics
  A-->>M: throw SAME first Error
  M->>F: create-only process-failure.json, if encodable
  M-->>M: preserve primary throw; no success acknowledgment
  I->>F: read exact derived task/launch/diagnostic siblings
  F-->>I: verified evidence, or absent/invalid/unavailable observation
```

No runtime event, semantic result, replacement process-outcome type, exception wrapper, cleanup loop, scheduler, recovery registry or retry controller is introduced.

## Canonical handoffs and precedence

| Owner → consumer | Canonical source/destination | Selected change |
| --- | --- | --- |
| Lifetime → adapter | `Awaited<typeof lifetime.completion>` / `OwnedProcessFacts` in shared/owned_process_lifetime.ts | Await once and retain the exact frozen object. Do not rebuild it or replace it with terminationConfirmed. Shared owner is unchanged. |
| Adapter → main | Same facts plus held child/capture references and existing `WorksiteExecutionTask` indexed command/predicate types | A main-supplied internal callback assigns retained references outside lifetime.observe, immediately after completion and before fallible finalizer/projection work. No callback I/O. |
| Main → archive | Existing `JsonValue`, canonicalJson, sha256Canonical/sha256Bytes and helper publishCreateOnly | Encode failure evidence only. Do not manufacture a complete command/report/predicate vector or WorksiteExecutionHelperArtifact. |
| Archive → inspector | Exact task/authority-free occurrence → existing launch-plan derivation/manifest checks; admitted I-JSON bytes | Return a bound diagnostic observation and actual file identity. Never hydrate it as OwnedProcessFacts or as ABG truth. |

Before dispatch main retains taskRef/taskDigest, exact CCall/Run/frame/attempt coordinates, launch manifest identity and the derived archive path. Its command closure binds ordinal/commandId; its HTTP closure binds predicate ordinal/id/kind and actual launch/request declaration. Pass the latter through predicateObservation. Retain actual child PID or null, helper PID and launch arguments/cwd. POSIX group coordinates derive only from the declared detached child; never borrow the outer worker/actor PID or mint an inner actor identity.

The callback stores canonical facts and raw Buffer chunks/held HTTP values before detachment, Buffer.concat, stream/digest construction or serialization can fail. Main's callback is assignment only. Remember facts.firstError before finalization, attempt the existing cancellation/detachment, and preserve that exact Error through every later finalizer/observation error. If no earlier error exists, retain the first actual later thrown value, distinguishing a thrown null/undefined from no throw. Do not relabel it as launch failure. A defensive callback failure cannot mask earlier facts.firstError or authorize continuation. Published facts are never rewritten.

Command capture still ends at direct exit; HTTP diagnostic capture still ends at bounded close/disposal. Response/port state stays separate. Preserve raw captures and already observed request/response/port bytes, without a new read or request to enrich diagnostics. Callback-recorded signals are explicitly only observed signal requests: suppression can make that list incomplete. Canonical signalAttempts stays separate; it is not a reconstructed exhaustive sequence or proof of delivery.

After handoff, firstError is rethrown unchanged. Present/unknown scope without firstError follows the existing unresolved-cleanup failure before report reads or later predicates, now with retained facts. Post-completion finalizer/projection failure follows the same retention route. A later main failure can retain the last completed operation's facts while naming its actual later phase/cause, without attributing that cause to the child. Prelaunch/preflight failure must not manufacture process facts; no diagnostic write precedes exact archive admission. Existing no-child launch outcome policy is preserved.

## Exact diagnostic locus and publication

Use the literal sibling `process-failure.json` under the existing derived attemptRoot:

`archiveRoot/worksite-command-execution/<taskDigest hex>/<attemptDigest hex>/process-failure.json`

The task/occurrence/launch-plan owners derive these coordinates; do not parse stderr, scan directories or use ambient cwd. The sibling is outside sandbox and distinct from task.json, launch.json, result.json and the success acknowledgment. After manifest admission, require it absent before operations alongside existing result/sandbox absence, and include it in the canonical archive-boundary checks. No manifest/helper-plan field or caller-selected path is added.

The failure body uses internal format tag `worksite_command_process_failure_diagnostic`, formatVersion 1. This implementation evidence encoding is not a Product result schema. Bind the identities above, failed phase/operation, already completed command/predicate observation references when present, retained physical/capture observations and primary/secondary error descriptions. Derive diagnosticDigest = sha256Canonical(body), diagnosticRef = `worksite-command-process-failure://abiogenesis/<digest hex>`. Encode the body plus these identities with canonical JSON and one newline. Before attempting publication, main retains the attempted ref, full-byte SHA and byte length in memory.

Serialize the canonical facts object itself, preserving all its fields, rather than declaring another physical-facts interface. The one bigint cleanupDeadlineNs becomes a tagged exact base-10 nanosecond string; null remains null. Error values become description records (name/message and available primitive code/errno/syscall/path/address/port/stack), never `{}`; unavailable properties are identified, not guessed. No recursive arbitrary Error.cause graph is required. Raw stream/port/response bytes use the existing base64/length/digest convention. These bytes preserve descriptions and attribution across CLI, not Error object identity or admission authority. Serialization failure preserves the in-process primary value and raw handoff; retention is unavailable.

Reuse private publishCreateOnly unchanged. Its successful return and existing canonical-node/byte verification establish a verified publication of exactly the attempted bytes. Write/link/unlink/post-verification failure preserves the primary throw and marks publication failed or unverified; it never proves no file committed. Do not overwrite/delete a final diagnostic, colliding file or partial residue. Retain existing temporary-file behavior, including residue from an interrupted initial write. Later inspection may verify a retained file after an unacknowledged publication, but may not relabel that later read as an earlier successful writer receipt. Existing identical bytes still collide and do not prove this attempt wrote them.

Main catches only to attempt this evidence retention, then rethrows the same primary value. Secondary diagnostic failures cannot mask it. No result.json, success acknowledgment, report read, later command/predicate/request, protected-after observation or delta inventory follows. Unknown scope is recorded as unknown. Diagnostic archive checks/writes are the selected failure-retention effect; they are not dependent semantic work or physical cleanup. No timeout/budget is extended. Interruption or storage failure can leave retention unavailable; do not claim guaranteed persistence. Stderr is optional description, never a location authority or retention oracle: the fixed path and explicit inspection work without it.

## Failure-side inspection, without successful exchange

Add named internal export `inspectWorksiteCommandExecutionProcessFailure` to existing implementation/worksite_command_execution.ts. Do not add a barrel/Public/SDK/CLI export or change the leaf invocation contract. It accepts the exact `WorksiteExecutionTask` and retained authority-free occurrence coordinates already accepted by constructWorksiteCommandExecutionLaunchPlan. No successful actor exchange, runtime lookup or newly authenticated owner token is required. Do not silently strip/relabel supplied authority or native companions to make them pass.

A failure observer, including the selected installed proof after the actual refused/non-admitted call, invokes this concrete installed module using its retained original task and occurrence. The inspector rederives the plan, checks exact task/launch bytes and distinct single-linked identities with existing private owner checks, then derives and reads only process-failure.json through canonical non-symlink/archive confinement. Require a distinct regular file with nlink 1, canonical I-JSON bytes, exact digest/ref, task/occurrence/attempt/launch joins, and an operation matching the declared command or HTTP predicate. Return the admitted JsonValue evidence with observed byte SHA/length/path/node identity; not LeafRealizationCandidate or WorkerTransportResult.

Report verified-present, absent, invalid or unavailable evidence explicitly. Stale task/launch, foreign attempt, alias/symlink/hardlink, malformed bytes, wrong operation/digest or changed identity refuse binding. Missing/stale/refused evidence proves neither no launch nor scope absence. A valid unknown-scope diagnostic remains unknown. This is a stateless observation of exact-attempt archive evidence, not authenticated ABG history; it neither admits an event nor authorizes retry, continuation, currentness restoration or terminal closure. HoG and complete()/exactExchange stay unchanged. Retrieval is concrete and callable when complete was never reached.

## Proposed territory and finite reproof

Source: helper runCommand/runHttpProbe/predicateObservation/main plus preflight sibling checks; worksite_command_execution.ts's stateless inspector reusing existing path/manifest helpers. No new module is needed. Existing publisher, shared lifetime, frozen worker/actor cut, Product constructors/schemas, c_call/HoG, Public exports and native_work_effect stay read-only. Later selection must amend the owning C2 HOW and L2 §4; this activation grants neither amendment nor implementation. No Product authority gap is identified for this internal evidence mechanism. Automatic runtime consumption/admission or a Public endpoint would require separate authority and is outside the proposal.

Use existing t287-owned-process-lifetime VM exposure and t287-worksite-command-execution support. These are proof selections, not results:

| Finite discriminator | Required observation |
| --- | --- |
| Command/HTTP error in both exit/error orders; absent/present/unknown facts | Same canonical object and first Error reach main; exact context/PID, distinct capture cuts, no outer-group inference. |
| Error followed by detach/cancel/projection/serialization failure | Raw handoff precedes failure; first cause wins; retention limitations explicit. |
| Error/unknown scope with available port/response/report | No report read, new request, later operation, after-observation or success artifact; held values remain diagnostic only. |
| Actual helper failure publication and fresh stateless read without exchange | Exact file joins/digest; retrieval despite no complete(); no Product/ABG promotion. |
| Existing identical/different target; failure before link or after link | No clobber/retry; attempted versus verified commitment; first cause and residue preserved. Label controlled EIO separately; reuse exact E04 publisher evidence only with support correspondence. |
| Missing/invalid/foreign task/attempt; alias/mutation | Explicit absent/refused/unavailable observation, never confirmed cleanup; no scan/write/admission. |
| Existing selected installed command/HTTP sunny-day proof | result.json/compact ack and complete/ABG gates unchanged; failure-side evidence separately labelled. |

Freeze emitted/source correspondence and finite resources before later execution. Actual fixtures must terminate finitely and independently account for PID/group absence; controlled uncertainty creates no unkillable process. Stop on the first genuine failure. No import, test, process, build or package ran here. Whole-path performance and L5 acceptance remain unproved.
