from pathlib import Path
import json,hashlib,datetime,os,subprocess
R=Path('/Users/jim/src/apps/abiogenesis');F=Path('/private/tmp/abg-rc11-foundation-20261110-01');O=R/'.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-foundation-correction-01/operator';T=Path('build_tenants/abiogenesis/typescript');P=O.parents[1]/'rc11-qualification-01'
target=F/T/'design/T287_EFFECT_FUNCTIONAL_REFACTOR_PLAN.md'
env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'}
def git(root,*args):return subprocess.check_output(['git','-C',str(root),*args],env=env)
def pin(p):
 b=Path(p).read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def create(p,b):
 p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('xb') as f:f.write(b)
def record(n,x):
 p=O/n;create(p,(json.dumps(x,indent=2)+'\n').encode());return pin(p)
assert not target.exists()
assessment=O.parent/'functional-plan/ASSESSMENT.md';evidence=O.parent/'functional-plan/EVIDENCE.json'
assert pin(assessment)['sha256']=='063d703efcc9519db1cf47a37115f3ff8b531f1263db7bfcd9c8d05abb0c8540'
assert pin(evidence)['sha256']=='2c0547da61d5108ff4e3b2b2379b95e05261ff71ddf5b5ef95e997c32ac688a7'
freeze=json.loads((O/'AUTHORITY_COMPONENT_FREEZE.json').read_text())
for r in freeze['rows']:
 p=pin(F/r['path']);assert p['bytes']==r['bytes'] and p['sha256']==r['sha256']
indices=[]
for root in [R,F,Path('/private/tmp/abg-rc11-qualification-20261109')]:
 p=Path(git(root,'rev-parse','--git-path','index').decode().strip());p=p if p.is_absolute() else root/p;indices.append(pin(p))
ticket=Path('.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md')
tracking=[(root,p,(root/p).read_bytes()) for root in [R,F] for p in [Path('specification/GOALS.md'),ticket]]
oldRepair=pin(O/'REPAIR_PLAN.md');create(O/'history/REPAIR_PLAN.foundation-basis-01.md',(O/'REPAIR_PLAN.md').read_bytes())
before={str(root/p):pin(root/p) for root,p,b in tracking}
record('ROOT_FOUNDATION_PLAN_01.json',{'id':'FOUNDATION-PLAN-01','status':'ROOT_ADMITTED_PLAN_WRITER_ONLY','recordedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'ownerRequest':'Concrete plan to solve the root causes of the bugs and identify future refactor work.','decision':'Root adopts functional-plan phased direction with historical uncertainty. Authority closure; test observer and m5 proof repair; shared pure physical state/Effect lifetime and command; HTTP; worker capture/archive last; future GC03 child/socket reuse. No source implementation or native runtime in this turn.','inputs':[pin(assessment),pin(evidence),pin(O/'AUTHORITY_COMPONENT_FREEZE.json'),pin(O/'AMENDMENT_FREEZE.json')],'writeTerritory':[str(target),str(O/'REPAIR_PLAN.md'),str(O)]+list(before),'preserveFiveAuthorityFiles':True,'previousRepairPlan':oldRepair,'trackingBefore':before,'indicesBefore':indices,'held':['implementation','native setup/provider','test/build/generation','commit/merge/push','release/install/pin changes']})

plan='''# T-287 Effect Functional repair and refactor plan

Status: **ordered plan; implementation unstarted**. Root FOUNDATION-PLAN-01 adopts the direction below under STDO3.0.4 and the project reference frame. The subject is accepted RC11 `e2ba05da` plus the separately frozen foundation amendment on `codex/rc11-foundation-correction`. Independent authority review and Root conjunction precede implementation. This plan selects no native Run, production rewrite, dependency upgrade, release or qualification result.

## Basis and responsibility

[Product](../../../../specification/PRODUCT.md), [realization constitution §9](ABI5_REALIZATION_CONSTITUTION.md#9-lawful-technology-stack) and its §16.15 correction retain the fixed fifteen outcomes and serialized Public contracts. GTL declares topology, HoG directly traverses it, and ABG owns admission, policy, ordering, events, currentness and replay. Exact **Effect `3.22.1`** supplies mechanics under those contracts. Its APIs and immutable data carriers do not become semantic authorities.

The [functional assessment](../../../../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-foundation-correction-01/functional-plan/ASSESSMENT.md) (`063d703e…`) and [source/API evidence](../../../../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-foundation-correction-01/functional-plan/EVIDENCE.json) (`2c0547da…`) ground this plan. It supersedes the implementation approach in the [original diagnosis plan](../../../../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-qualification-01/root-cause-01/operator/ROOT_CAUSE_AND_PLAN.md); that document, all failed runs and the [conjoined diagnosis](../../../../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-qualification-01/root-cause-01/review/ASSESSMENT.md) remain unchanged.

The proved defects belong to test Proof: `observePublication` credits results after stop/cutoff, may start another probe, and can hang on an unresolved read; physical fixtures assume startup/emission prerequisites; the progress oracle counts callbacks rather than complete content; a post-exit negative can pass without a late write attempt; assertions and cleanup erase causal evidence. A 600ms fixture delay reproduced the six historical failure predicates without changing owner clocks. This proves a sufficient mechanism, not the cause of those erased historical executions. Neither a production transport regression nor the old Effect restriction causing specific failed author runs is established. Production refactors below require their own design and deletion case.

## Ordered work

| Phase | Bounded change and dependency | Required exit evidence |
|---|---|---|
| **0. Authority closure** | Conjoin the five-document review, generated authority mirrors and current instructions at one exact freeze. Preserve source and historical evidence. | Conflicting mechanism exclusions are reconciled; semantic ownership remains. Generated definitions carry no positive qualification verdict. |
| **1A. Observer bug repair** | Replace only the test observer in `t287-owned-process-lifetime.test.mjs`, its two call sites and a small test support module if useful. Use one scoped Effect observer, explicit stop/completion, interruptible observation waits and immutable terminal snapshot. Delete the displaced `stopped/wake/done` Promise/timer protocol. | Deterministic late/stop/deadline/hang counterexamples pass, no next probe or late mutation, bounded handback and no owned observer fiber/timer residue. Preserve actual owner result/error. |
| **1B. m5 Proof repair** | Repair `m5-worker-transport.test.mjs` premises and oracles, not presumed production defects. Retain actual actor/capture/cleanup facts before assertions. Use ordered complete bytes/records, controlled lease/ack/cutoff law and finite nonvacuous physical startup/emission fixtures. | Focused counterexamples, complete affected m5 and lifetime files, then the original nine-file unit invocation all pass on the same successor freeze. No repeated-until-green run, clock rebase, extra acknowledgement or erased prior red evidence. |
| **2. Lifetime plus command** | After phase1, freeze the existing `owned_process_lifetime.ts` contract. Factor its small immutable physical state and pure transition; realize actions/listener/heartbeat/lease lifetime with scoped Effect resources. Consume it through `worksite_command_helper.ts::runCommand` as the first production end-to-end thread. | Exact launch-to-result/refusal and dependent-work gating conserve physical facts, deadlines, capture and error ordering. Delete named displaced mutation/timer/listener/finalization coordination; no second supervisor behind an Effect wrapper. |
| **3. HTTP resources** | Reuse the proved lifetime contract in `runHttpProbe` and `oneHttpRequest`. Scope port reads, polling, request/response listeners and heartbeat; replace manual settlement coordination with terminal arbitration and finite disposal. | No read/request after stop or late terminal mutation. Preserve create-only port identity/confinement, response bound, null/refusal/error meanings and current normal-response launch-duration behavior unless separately repriced. |
| **4. Worker capture/archive** | Last, separate immutable capture/window reduction from physical archive writes, stream capture and observers in `worker_transport.ts`. Consolidate only mechanics whose exact shared contract and deletion benefit are demonstrated. | Preserve raw versus semantic output, capture timestamps, windows, actual observer returns, first error, rollback restoration, fsync-before-reference, native threshold admission and final window before finalization. Exact affected owner/event/replay traces remain equal. |

Phases1A/1B may have separate design preparation; integrate and prove one source freeze sequentially. Later shared lifetime/caller source changes and physical proofs are sequential. Each phase returns its exact changed paths, deleted mechanics, actual receipts and unresolved claims to Root before the next activation. No universal framework, registry, event bus or new runtime authority follows from this plan.

## Phase1 causal proof and retained effects

First test observer stop during await, cutoff10/resolve11, exact boundary10, a never-resolving read, read error, completion before cutoff, and late resolution after return. Check eligibility before every probe and after each wait. Return one sealed snapshot independently of an unresolved external read; no late callback may mutate it or start another probe. Record immediate owner-settle time before copying artifacts. Retain result/error, fixture body/handler/timer readiness, write attempt/completion, exit intention, stdout/stderr and cleanup/absence facts before assertions and scratch removal.

For m5, deterministic checks preserve original owner clock policy: true acknowledgements renew inactivity, false acknowledgements do not, absolute deadlines never renew, and cutoff excludes later semantic bytes. Identical ordered content must yield the same oracle under split/coalesced capture. Physical setup uses prospective finite envelopes with clocks still anchored at spawn, and separately demonstrates actual premises. Spawn notification is not fixture body readiness. The positive progress workload must outlast the initial lease and exercise renewal; merely enlarging a lease beyond the whole workload is invalid. A late-data test must actually exercise an emission attempt and capture-closed outcome, not kill the producer before its timer and infer emission from a test name. Declare finite caps, retained scratch/output and scoped cleanup before each execution; no adaptive retry or blanket timeout inflation.

## Exact mechanics that must survive refactoring

Retain `createMonotonicDeadline`'s bigint nanoseconds, positive-fraction ceiling, huge finite deadlines chunked at the host maximum, stale-arm rejection and absolute non-renewal. Use one explicit monotonic domain and original start/cutoff. Effect's scheduler treats sleeps above `2^31-1`ms as infinite, while `Clock.currentTimeMillis` uses `Date.now`; neither silently replaces the current arithmetic/epoch. A narrow clock/wait adapter may supply Effect suspension and cancellation while preserving those laws. TestClock requires an explicitly aligned service and does not control Node I/O or child processes.

`acquireRelease` acquisition/release are uninterruptible; `raceFirst` waits for loser termination. Finalizers must perform the finite owner cleanup protocol, not await arbitrary unresolved I/O. Do not hide live cleanup with `disconnect`. Interruption or an AbortSignal is not proof of OS cancellation, direct-child exit or group absence. Preserve error guards through natural close and distinguish absent, present and unknown physical outcomes. Keep the singular production `runEffectProgram` membrane.

A bounded Effect Queue suspends an Effect producer; it does not automatically backpressure a Node EventEmitter callback. Unbounded fibers per chunk, unbounded `asyncPush`, and dropping/sliding finite streams are unsuitable substitutes for lossless capture. Any later stream conversion must bind pull or pause/resume to a finite byte/chunk budget, keep capture time distinct from dequeue time, define overflow/refusal, and dispose pending offers/takes and input listeners. Retain the current synchronous durability path until equivalent ordering and actual memory/latency evidence justify changing it.

Before each production phase, bind observable traces and failure algebra, then reprove controlled permutations and finite physical witnesses: launch failure, callback/stdio/disposal faults, first-error preservation, TERM-to-KILL strengthening, present/absent/unknown group, close without exit, direct-child Windows scope, escaped descendants, fractional/huge deadlines and immutable final snapshots. Phase4 additionally requires archive fsync/rollback/corruption and current-profile ABG admission/replay proof. Runtime contradictions return to owning Design; no blind repeat or broader run first. Expected benefit is reduced duplicated coordination and proof burden; speed or memory gains require matched measurement.

## Future candidate backlog and retained implementations

After phase2, assess `pinnedGc03HostReader` for reuse of a direct-child lifetime contract: its current child is **not detached**, so negative-PID process-group signalling cannot be transplanted. Preserve adapter/executable digest verification, permits/currentness, owner rederivation, callback/native-page agreement and exact owned absence. Separately assess the GC03 endpoint/client as one socket-resource relation: inert reservation, activation, FIFO requests, exact bytes/digests, partial/oversize input, close during pending lookup and no post-close protocol writes. Snapshot stop does not establish lookup cancellation; socket inactivity timeout must not silently become absolute timeout.

Retain already-scoped `run_invocation` ownership and the thin npm/git adapters unless a counterexample or exact shared cancellation/diagnostic contract demonstrates deletion benefit. Preserve invocation identity, computational release versus semantic closure, expected-prefix handoffs and admitted truth. Promise syntax alone is not a refactor reason. No new package, library upgrade, blanket Promise conversion or autonomous publication retry is selected.

Both `RC11-LIFETIME-OBS-LATE-001` and `RC11-M5-TRANSPORT-PROOF-001` remain open until their exact successor proof and Root disposition; diagnostic green does not replace qualification. Local RC11 remains installed, unqualified and unpublished; RC10 remains pinned builder. Native-workflow, full5.0, S7, other capsules and human obligations remain open. Packaging's declared metadata-dependent reproduction and guards are retained; this plan does not reopen packaging or claim file-bytes-only reproducibility.
'''
assert len(plan.split())<2200
create(target,plan.encode())
repair='''# Current repair and refactor plan

Root FOUNDATION-PLAN-01 adopts the [checked-in-ready phased plan](/private/tmp/abg-rc11-foundation-20261110-01/build_tenants/abiogenesis/typescript/design/T287_EFFECT_FUNCTIONAL_REFACTOR_PLAN.md), grounded in the [functional assessment](../functional-plan/ASSESSMENT.md) and [exact evidence](../functional-plan/EVIDENCE.json). It separates established test Proof defects from candidate production refactors: authority closure; observer and m5 repair; shared pure lifetime state/Effect mechanics and command; HTTP resources; worker capture/archive last; later GC03 child/socket reuse.

This supersedes the previous [foundation repair-plan projection](history/REPAIR_PLAN.foundation-basis-01.md) and implementation approach in the [original root-cause plan](../../rc11-qualification-01/root-cause-01/operator/ROOT_CAUSE_AND_PLAN.md), both preserved verbatim. The five authoritative correction files remain frozen pending independent review. Core Effect is pinned at3.22.1; semantic ownership, monotonic deadline arithmetic, physical absence, raw/semantic capture and durability laws remain.

No source implementation, native runtime, test, build, checkpoint or release is activated by this plan. Root conjoins review and the plan, then separately selects the next bounded effect. Historical failure causation remains indeterminate; both qualification debts and other open obligations remain. RC11 stays local/unqualified/unpublished and RC10 remains the operational builder.
'''
(O/'REPAIR_PLAN.md').write_text(repair)
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
for root,p,b in tracking:
 rel='../build_tenants/' if p.name=='GOALS.md' else '../../../build_tenants/'
 link=rel+'abiogenesis/typescript/design/T287_EFFECT_FUNCTIONAL_REFACTOR_PLAN.md'
 # Main holds the current tracking projection; the planned source lives in the isolated successor.
 if root==R:link=str(target)
 prefix=f'''Current plan, {now}: **RC11_EFFECT_FUNCTIONAL_PLAN_RECORDED_IMPLEMENTATION_HELD**. Root FOUNDATION-PLAN-01 adopts the [ordered repair/refactor plan]({link}): authority closure; proved observer and m5 test defects; shared pure physical state and Effect lifetime through command; HTTP resources; worker capture/archive last; future GC03 child/socket reuse. Core Effect remains `3.22.1`; application semantic ownership, exact deadline/capture/durability and physical-absence laws remain. The five authority documents are frozen for independent review. This plan activates no implementation, runtime, new tests or checkpoint. Historical causation remains unproved, both qualification debts and other backlog remain open; RC11 is local/unqualified/unpublished and RC10 remains pinned builder. All prior bodies are preserved verbatim.\n\n'''.encode()
 (root/p).write_bytes(prefix+b);assert (root/p).read_bytes()[len(prefix):]==b
for r in freeze['rows']:
 p=pin(F/r['path']);assert p['bytes']==r['bytes'] and p['sha256']==r['sha256']
for p in indices:assert pin(Path(p['path']))==p
for r in json.loads(evidence.read_text())['evidence']:
 if r.get('matches_accepted_C11'):
  p=pin(Path(r['path']));assert p['bytes']==r['bytes'] and p['sha256']==r['sha256']
assert pin(P/'root-cause-01/operator/ROOT_CAUSE_AND_PLAN.md')['sha256']=='d9a9b7343dd5c66ce7c6eef11bfe18ec921d8b570a450fcc8514619e6d76e88c'
receipt=record('PLAN_RETURN.json',{'status':'FUNCTIONAL_PLAN_RECORDED_IMPLEMENTATION_HELD','rootAdmission':pin(O/'ROOT_FOUNDATION_PLAN_01.json'),'plan':pin(target),'words':len(plan.split()),'repairPlan':pin(O/'REPAIR_PLAN.md'),'priorRepairPlanPreserved':pin(O/'history/REPAIR_PLAN.foundation-basis-01.md'),'fiveAuthorityDocumentsUnchanged':pin(O/'AUTHORITY_COMPONENT_FREEZE.json'),'productionAndTestEvidencePinsUnchanged':True,'tracking':[{'before':before[str(root/p)],'after':pin(root/p),'priorBodyPreserved':True} for root,p,b in tracking],'indicesUnchanged':indices,'originalDiagnosisPlanPreserved':True,'sourceHead':git(F,'rev-parse','HEAD').decode().strip(),'mainHead':git(R,'rev-parse','HEAD').decode().strip(),'nextOwner':'Root conjoins independent authority review and this plan, then separately authorizes bounded local checkpoint or implementation. No implementation/runtime/test/build/release effect in this activation.'})
print(json.dumps({'receipt':receipt,'plan':pin(target),'repairPlan':pin(O/'REPAIR_PLAN.md'),'words':len(plan.split())},indent=2))
