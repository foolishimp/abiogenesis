# T-287 Native Liveness Conservation

**Status:** Accepted bounded HOW. Source implementation and installed qualification remain separate subjects and grants. Fixed16, GOAL-035/T287 and F12/S04 at5.1 remain unchanged.
**Owner:** Existing native ABG observation, Event Calculus, actor, retry and projection owners.
**Acceptance and exact source basis:** [Writer25 application and attributed reviews](../../../../.ai-workspace/comments/codex/20260911_P3_LIVENESS_PROFILE_IMPLEMENTATION_26/how-application-25/accepted-subjects-and-reviews.md).

This refines the active [T129 design](M03_SYSTEM_PROBE_OBSERVER_LIVENESS_DERIVATION.md)
and its traversal-non-progress consumer for the current 5.0 owners. The exact
[native event-contract compatibility](T287_NATIVE_EVENT_CONTRACT_COMPATIBILITY_DESIGN.md)
profile includes these liveness kinds and effects; compatibility is not implicit.

## 1. Product frame and bounded outcome

Fixed16, GOAL-035/T287 D4 and F10 retain one ABG event history, Event Calculus and
replay-derived runtime truth. F03 requires disposition of the immutable 4.6
behavior; F17/S06 preserves useful work through correction. F12/S04 remains5.1.
This is native runtime conservation, not an observer/tuner feature or new work
selector. Requirements TRANSPORT008/009/014/020/025–030, EVENTS022–024/027–029,
PROJECTION016/017, CONTINUATION009 and RETRY007–009 already select this behavior.

GTL declares topology; native C/HoG owns traversal; Implementation performs its
declared leaf; ABG alone authenticates observations, admits consequences and
projects disposition. A probe is not a retry, stop, result, graph choice or grant.
No new Public member, runtime controller, registry, ledger or alternate actor
engine is introduced. Existing callback boundaries may carry raw observations
and return the native owner's derived decision; a callback cannot author policy.

The [retained 4.6 RC5 basis](../../../../.ai-workspace/comments/codex/20260911_D4_NATIVE_LIVENESS_CONSERVATION_HOW_24/basis.json)
supplies reusable pure carriers, normalization, lease/disposition semantics,
event guards, Event Calculus effects and test discriminators. Its transport/runtime
engine is not imported. The [historical source comparison](../../../../.ai-workspace/comments/codex/20260911_D4_NATIVE_LIVENESS_CONSERVATION_HOW_24/return.md)
is commentary, not current implementation status. Source lineage and completed
T129 do not establish 5.0 conservation.

## 2. Closed declarations and authenticated observations

Retain the six T129 carriers: RuntimeSystemProbeContract, the two mandated probe
events, RuntimeLivenessObserverProjection, RuntimeWatchdogPolicy and
RuntimeInvocationDisposition. They belong to the native current-profile contract.
A finite, immutable native declaration table identifies supported source classes
and owning observation boundaries; it is not a runtime registration API.

Instantiate a probe contract only from the actual admitted Program/execution
basis, CCall/actor binding and native system/asset declaration. The actor's
command, archive/result paths, environment policy and timeout values remain the
already-bound transport plan. Native graph/event/asset probes derive their scope
from their actual admitted owner and declared resource, never from a worker's
claim that a path, process or result belongs to this invocation. The contract
must be reconstructible from those immutable declarations and admitted binding
before its first observation. Observing a source does not declare it retroactively.

The finite source census conserves stream/PTY/structured output, tool/API progress,
process lifecycle, genuine worker heartbeat, native graph/frame/evaluator
progress, event-log/ledger/manifest changes, runtime projection/report/dossier,
archive and result-artifact boundaries. Every ABG-known source that can affect
the supervised invocation has a declared observation boundary and explicit
coverage state. An unavailable probe is unknown coverage, not evidence of silence.
A source absent from the admitted occurrence cannot affect its lease.

Both runtime_activity_probe_observed and runtime_external_interruption_observed
bind the exact basis, GF, Run/work key, GraphCall/frame/vector/edge, actor when
present, worker/backend when present, probe/source contract, system or asset,
evidence refs, causation, correlation and elapsed observation coordinate.
Native owner admission verifies that relation at the current immutable prefix.
Cross-Run historical evidence remains provenance, not a foreign causation ref.

An observation coordinate contains its owner clock-domain/origin ref, monotonic
elapsed milliseconds and underlying observation identity. Order is admitted
ordinal, not array order or wall time. Elapsed values cannot regress within one
clock domain, refer to a future sample, reset on receipt, or migrate between
attempts/processes. Wall-clock time is diagnostic only. A new attempt has its own
bound origin; a process restart or old heartbeat cannot renew a new lease.

Current native actor/asset events remain their owning facts. When used for
liveness, the same owner admits the corresponding generic probe, joining the
actual underlying fact or physical observation. The batch becomes durable before
a lease-dependent effect. An alias of one observation does not become fresh
activity: retain its underlying identity and original elapsed coordinate.
A second distinct observation needs its own authenticated producer; equal values
alone neither deduplicate competing owners nor establish fresh activity.

Native event append is a declared asset boundary, but appending a liveness probe,
clock sample, observer report or its own bookkeeping cannot recursively prove
new activity for the invocation being watched. A supervisor heartbeat proves
that supervisor's declared scope, not worker progress by default. A genuine
declared worker heartbeat/progress signal for the active invocation does renew
its lease. Runtime asset writes attributable to that invocation also renew it.
This applies TRANSPORT027 without a vendor or source-name allowlist that silently
excludes valid activity.

### 2.1 One declared frame occurrence

The existing native frame-opening owner supplies the shared observation occurrence. Reconstruct its context from the unique admitted `frame_opened`, its actual `graph_call_opened` and `ExecutionBasis`, including authenticated parent lineage and frame attempt. Use the existing `RuntimeInvocationScope`: exact basis, Program, GF, Run, GraphCall, frame and frame attempt; `cCallRef`, locus/task/vector/edge and actor/worker/backend fields are null because this occurrence observes the frame, not one CCall or actor. A child frame never substitutes its parent's different GF/basis or clock. Individual producer events retain their actual CCall, vector, edge and actor coordinates and must join to this exact frame through admitted ownership. Frame attempt and child CCall attempt are distinct coordinates, not forced numerically equal.

Declare one existing-source `frame_progress` probe, with `sourceRef` derived from the exact frame identity, `declarationEventRef` equal to its opening event, and the existing graph-call aggregate/probe payload arm. Its policy is null: this observes native progress without creating a frame watchdog, retry budget or kill loop. The contract and origin ref are deterministically reconstructible from the opening fact and scope; no first observation registers a source.

The native opening owner captures the monotonic origin at the actual activation that produces `frame_opened`, before frame work proceeds. Bind the physical clock handle to that exact admitted opening, frame attempt and held store; publish the initial sample at elapsed zero through the normal native transaction. A failed opening cannot leave a reusable clock binding. Later native owners use this same origin, independently of all actor/CCall origins. An acquisition without the original physical clock cannot create a replacement origin from receipt time, `eventTime`, file time or an actor clock. It exposes unavailable fresh elapsed coverage; replay retains only its last admitted as-of sample. Clock state is a physical observation capability, not replay authority.

### 2.2 Actual owner boundaries, not instrumentation-generated progress

For this frame occurrence only, the closed source relation permits these existing owning facts: `frame_opened`; `actor_invocation_closed` or `actor_invocation_failed`; `c_call_evidenced`; `c_call_result_admitted`; `c_call_judged`; `traversal_route_admitted`; `c_call_fibre_selected`; and the exact `frame_closed` terminal fact. Their native owners capture elapsed samples and admit corresponding `runtime_activity_probe_observed` facts. No new runtime event kind, internal-function roster, observer process or Public operation is introduced.

Admit the actor-close/failure frame sample before native carrier-pair verification begins. Admit evidence/result/judgment samples at their actual admission boundaries, route samples before dependent traversal effects, and next-fibre samples before its dispatch. This makes author-close → native verification/admission → evaluator entry, and the corresponding consequence interval, comparable on one actual frame clock. It does not claim CPU attribution or observations inside an uninterrupted synchronous computation.

Every sample identifies its actual producer event, original payload digest and elapsed coordinate; causation includes that producer and frame declaration. Validate full Run/GF/basis/GraphCall/frame ownership, the producer's admitted occurrence/attempt linkage and expected prefix. Do not loosen the actor or CCall source guards globally. Frame samples carry `activity`, not artifact admission or semantic success: result evidence remains with its original result owner. A probe, clock sample, projection/report of that probe or other observer bookkeeping is never an underlying progress producer. Aliases retain the same underlying identity and elapsed value, even across source aliases; replaying an old fact with a newer sample refuses. Foreign scopes, unadmitted facts, future references, regressing clocks and borrowed/restarted origins refuse the observation.

Capture each coordinate at its producer boundary, not after downstream expensive work. Its owner transaction makes the fact/probe durable before the next dependent effect; probe insertion cannot replace the underlying fact in result/route/closure causation or invalidate an owner receipt's exact successor-prefix identity.

## 3. One replay-derived relation and one elapsed basis

Define one native pure relation over:
the authenticated immutable prefix; exact occurrence/probe declarations; bound
watchdog policy; normalized activity and interruption evidence; owning artifact/
report admission or rejection facts; and existing CRetry/continuation budget facts.
The output binds all input identities, declared coverage, per-system state, last
activity/artifact, elapsed as-of coordinate, lease and hard-cap state, and exactly
one RuntimeInvocationDisposition. No filesystem, process, wall clock, mutable
retry singleton or model is read by this relation.

Physical adapters may wake on a timer or observe a file/process. A wakeup is not
a no-progress verdict. The existing owner samples its monotonic clock and asks
this same relation at the latest prefix. A stale wakeup merely rearms to the
derived deadline. For a consequential threshold, the current-profile form of
the existing actor_process_timeout_observed event retains the exact clock
sample, policy/transport-plan refs and evaluated predecessor prefix. Its native
expected-prefix admission rechecks the threshold and scope, then replay derives
the same decision before termination or retry. No timer-only activity event is
invented. Native non-actor probe owners use the same observation coordinate and
relation; no second timer policy is introduced.

The selected current-profile timeout extension is a raw, authenticated threshold
observation. It does not by itself establish command failure, no-output, Run
terminality or retry eligibility. Existing legacy payloads/effects remain exact
under L; current-profile effects must not promote a stale sample to timed-out
truth. No generic caller-supplied nowElapsedMs is authoritative. Pure tests may
supply a candidate sample, explicitly labeled, but live effect decisions require
the corresponding native admitted observation.

Public reads and fresh replay render the relation as of its last admitted sample.
They do not advance time or infer death by Date.now, ps, transcript text, file
mtime, missing process or an observer's own timeout. Coverage/as-of identity makes
that limitation visible. Continued observation belongs to existing native owners,
not a polling controller added to Public or a harness.

The actor threshold adapter supervises its declared actor scope. Native non-actor
work reports actual progress/interruption at its existing owner boundaries, with
actor identity absent where appropriate; it cannot borrow an actor clock or turn
an unobserved CPU interval into a fabricated timeout. A missing fresh elapsed
observation remains explicitly unknown. This design adds no non-actor kill loop:
an outer safety intervention needs its actual declared interruption observation
and existing native stop/recovery owner before any terminal status claim.

## 4. Lease, safety and result precedence

Use the bound startup/inactivity/hard-cap/grace policy and existing retry budget;
do not select new universal numerical limits. Activity resets the active
invocation's common inactivity lease at the actual observation time. An old or
unrelated source cannot renew it; hard safety time does not restart on activity.

Apply these rules in order, preserving the distinct lease-state evidence:

1. Invalid scope, provenance, elapsed ordering or coverage needed for a claimed
   decision refuses that decision. Unknown coverage cannot produce no-progress.
2. A live process reaching a declared hard safety cap may require
   controlled_terminate. The owner admits the actual threshold/interruption
   observation before a dependent signal or public stopped claim. Existing
   owned-process TERM/KILL/grace/confirmation remains the physical mechanism.
   An unreturned external kill is not reconstructed from PID absence.
3. Available result artifact, report or declared progress must be deterministically
   admitted or rejected by its existing exact request/contract owner before
   no-progress, retry or block classification. Pending inspection yields
   inspect_archive; it does not dispatch a replacement model. A valid artifact
   survives a later transport failure and remains available to normal result
   admission. A malformed artifact is explicit rejection, not parser repair.
4. An admitted external interruption ends active invocation truth and initiates
   externally-interrupted/blocked truth. It does not emit run_closed, successful
   result, retry or continuation. After required artifact inspection, block or
   an already-declared continuation/escalation/reprice is derived from existing
   native policy and typed facts. An explicit later witness/reprice, if lawful,
   is separate authority; an observer cannot undo the interruption.
5. Without accepted output, startup/inactivity expiry can classify no_output
   only when the existing non-progress preconditions are met. Admitted stream,
   report or progress is not silently erased to call the attempt silent.
   Progress-without-result and runtime reporting retain their typed distinction.
6. Existing retry exhaustion precedes any new expensive attempt. Remaining
   budget alone is insufficient: exact CRetry frontier, failure class, cursor,
   progress and same-edge eligibility remain required. Zero budget blocks,
   yields, escalates or reprices only as declared; no retry loop is invented.
7. Otherwise continue_waiting. Typed same-edge continuation facts outrank a
   generic terminal retry fallback. Unsupported mixed facts refuse.

An inactivity policy termination and an external absolute safety interruption
keep distinct causes. A physical cap can require containment while artifact
inspection remains pending; containment never grants no-progress classification.
Command exit nonzero inside a valid C2 observation remains an honest command
failure inside that observation, not a transport or liveness failure by fiat.

The complete disposition vocabulary stays T129's eight values:
continue_waiting, controlled_terminate, retry, yield_continuation, block,
inspect_archive, escalate, reprice_policy. These are derived read values, not
new callable actions or automatic scheduling rights.

## 5. Native consumers and Event Calculus

Activity initiates activity-recent and invocation-active in its exact scope and
clips the corresponding inactivity assertion. External safety interruption
terminates active and initiates externally-interrupted/invocation-blocked.
The declared table and actual fold must agree. Probe facts do not initiate
domain progress, artifact acceptance, CCall success, traversal completion or
Run closure. Already-terminal scopes cannot be resurrected by late probes.

Existing actor supervision consumes the one relation for rearming/containment;
the adapter emits raw facts. Existing retry admission consumes that relation
together with its already-owned frontier/budget facts before dispatch. Extract
those budget facts without a cycle: liveness must not call an eligibility
function that recursively calls liveness. Existing HoG retry/continuation paths
execute only the selected native transition; they acquire no timer policy.

Existing run/GraphCall status, replay, gaps and lawful-action projections expose
the same referenced liveness/disposition. Publish one strict current-profile
projection arm through the existing read operations, with full coverage/as-of
and policy/evidence refs. No new Public operation is needed. Ordinary result/
typed terminal/closure owners retain their gates; missing liveness is not a
success or stop fallback.

### 5.1 Lifetime and closure

Actor and CCall probes retain their current lifetimes. Frame progress initiates the existing `runtime_activity_recent(scopeDigest)` and `runtime_invocation_active(scopeDigest)` relations. A child's CCall judgment, actor closure or actor failure is activity within the open frame; it does not end or reset that frame occurrence. The generic probe effect's present “underlying `c_call_judged` means ended” rule becomes occurrence-specific. The normalizer, actual EC fold, declared effect table and projection agree on that distinction.

Only actual closure of this frame terminates its frame observation's active fluent in the normal completion path. Existing admitted interruption/run-stop/failure rules retain their own effects and authority; no observation manufactures such a fact. The frame projection reflects any applicable existing termination/interruption effect without claiming that the frame closed. A closed frame is inactive in the ordinary liveness projection even though its last activity remains historical evidence. No new successful/terminal disposition is added to the eight-value vocabulary. Null frame policy supplies no timeout, retry, or stop inference; absence of samples does not establish progress or death.

At pre-close quiescence, derive the exact terminal route/CCall and closing frame using the existing closure spine. Only the authenticated frame-observation active fluent belonging to that same closing frame, opening, basis and frame attempt may be included in that spine. This is not a global exemption for `runtime_invocation_active`, an actor/CCall probe, a child/sibling/foreign frame, an interrupted/blocked scope, or an unknown fluent. All actor cleanup, live CCalls, child work, held frames, continuations, unconsumed results and ordinary closure-contract gates remain. The observation neither supplies missing quiescence nor terminates itself to force it. Child closure keeps its existing exact child-scope/closure gates; root quiescence cannot exempt an unclosed child frame.

The ordinary expected-prefix closure transaction admits the actual `frame_closed`, which terminates only this exact frame occurrence's active fluent. When the original clock is available, its owner may include one terminal `frame_progress` sample immediately after that producer in the same atomic closure transaction, before GraphCall/Run close. This is the sole post-frame-close observation exception: exact closing fact, exact declaration/scope and native clock, original sample, no intervening unrelated event, no earlier terminal sample. Its EC effect retains historical activity but cannot initiate or restore active truth. Ordinary closure facts keep their own order and cause references, never probe references. A failed transaction exposes neither a terminal probe nor frame closure. After commitment, discard the physical clock; later activity/duplicate terminal samples refuse. With no original clock, actual closure still terminates the occurrence without fabricating terminal elapsed evidence.

## 6. Historical conservation and profile boundary

[Native event-contract compatibility](T287_NATIVE_EVENT_CONTRACT_COMPATIBILITY_DESIGN.md)
selects exact legacy L and a single current P, including the required liveness
census/payload/effect/projection changes. The [accepted amendment](../../../../.ai-workspace/comments/codex/20260911_D4_NATIVE_LIVENESS_CONSERVATION_HOW_24/how22-amendment.md)
retains their exact originating subject. Do not put the
new table under L's digest, create a third profile, mutate old headers/events/
handoffs, or use historical read compatibility as append authority.

Old L events/prefixes and uniform-L replay retain exact bytes and meanings.
Missing old elapsed/probe facts are not backfilled. Historical interruption or
liveness claims remain limited to evidence actually present. Current-P execution
uses the declared probes; uniform-P and mixed replay carry the selected profile
and exact schedule. Crossing profiles still requires the compatibility HOW's genuine native
quiescent boundary and all existing W/install/reprice checks. New probes cannot
be appended to an active L store merely because the new code can read it.

[Interrupted event-resource recovery](T287_INTERRUPTED_EVENT_RESOURCE_RECOVERY_DESIGN.md)'s
physical abandoned-acquisition recovery and run-stopped witness precede
a profile upgrade where necessary. Liveness does not recover a lock, truncate a
tail, mint a close handoff or infer a stop witness. P3's undispatched owner
refusal remains a separate failure arm: no actor/probe evidence is fabricated
for a CCall that never dispatched.

Conserve the 4.6 pure positive and negative relations through current owners.
Explicitly supersede two donor implementation details: positional event-array
ordering with current native admission ordinals; and the narrow worker-stream
lease allowlist with the declared source/scope relation in section2. Preserve
the donor's no-supervisor-self-renewal outcome through correct attribution.
These constraints implement the current requirements; the old code restriction is not WHAT.

### 6.1 Exact profile and historical boundary

The frame occurrence reuses the existing closed probe payload and nullable frame scope. It changes no aggregate/event-kind census, envelope, payload key/variant or `ROOT_CURRENT_EVENT_PROFILE_REF`. Under the actual descriptor constructor and the accepted pilot profile law, its descriptor inputs therefore remain identical and the computed current D4 remains `sha256:3e8f2d4cb80c3c263c44fdadf6c23a46a5c510c3466f1f2cf31fe6016e01cc6a`. The inspected descriptor hashes those inputs, not implementation source or the EC table. That is the reason for retaining the profile identity, not an assumption that all observation changes are identity-neutral.

Occurrence-specific admission/effect handling completes the already-declared frame source; it does not change the result of any previously valid actor/CCall-only history. The corrected native declarations/effects publish through the ordinary successor implementation and contract publication, with new implementation identity and applicable proof; an equal profile digest is not equal code or qualification. Exact descriptor equality and historical projection equality are verified before relying on this choice. A new wire arm, discriminator, descriptor field, profile name or altered old-history meaning lies outside this HOW and returns to the profile HOW owner instead of silently retaining D4 or inventing a migration. L, retained D4 histories, locks, handoffs, original installs and unsupported-predecessor treatment remain untouched. No in-place continuation or upgrade is selected.

## 7. Implementation and qualification

The [accepted source/test plan](../../../../.ai-workspace/comments/codex/20260911_D4_NATIVE_LIVENESS_CONSERVATION_HOW_24/source-test-plan.md)
is finite and not a source grant. Compose this liveness law with native
event-contract compatibility before computing/publishing P; retain all original
immutable inputs and reviewed source ancestry. Do not reopen or
rewrite original D1/D2 failures as proof of conservation.

Source evidence must establish the actual native relation and admission/
consumer positives plus falsifiers, exact legacy replay and new-profile fresh
replay. A separate installed execution must show declared activity prevents
local flat-timeout authority, artifact-before-no-progress and real interruption/
exhaustion behavior. A pure timer simulation alone is not that proof.
No full D4/D1/D2/S06, UAT, integration or release acceptance follows here.
