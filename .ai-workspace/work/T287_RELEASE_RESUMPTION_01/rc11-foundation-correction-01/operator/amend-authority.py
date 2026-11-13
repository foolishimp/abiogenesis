from pathlib import Path
import hashlib, json, subprocess, os, datetime

R=Path('/Users/jim/src/apps/abiogenesis')
F=Path('/private/tmp/abg-rc11-foundation-20261110-01')
O=R/'.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-foundation-correction-01/operator'
T=Path('build_tenants/abiogenesis/typescript')
ticket=Path('.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md')
paths=[Path('specification/PRODUCT.md'),T/'design/ABI5_REALIZATION_CONSTITUTION.md',Path('AGENTS.md'),Path('CLAUDE.md'),Path('specification/requirements/abg/REQ-R-ABG3-SAGA-FRONTIER.md')]
env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'}
def git(root,*args): return subprocess.check_output(['git','-C',str(root),*args],env=env)
def pin(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def create(p,b):
 p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('xb') as f:f.write(b)
def record(p,x):create(p,(json.dumps(x,indent=2)+'\n').encode())
def replace(s,a,b):
 assert s.count(a)==1,(a[:120],s.count(a))
 return s.replace(a,b)
assert git(F,'rev-parse','HEAD').decode().strip()=='e2ba05da572f4a7e68d0629ecc83b9153a15e7c4'
assert git(F,'diff','--name-only')==b''
assert git(F,'diff','--cached','--name-only')==b''
pre={str(p):pin(F/p) for p in paths}
for p in paths:create(O/'preimages'/p,(F/p).read_bytes())
tracking=[]
for root in [R,F]:
 for p in [Path('specification/GOALS.md'),ticket]:
  if (root/p).exists(): b=(root/p).read_bytes(); origin='existing bytes'
  else:
   assert root==F and p==ticket
   b=git(F,'show','HEAD:'+str(p));origin='exact base Git blob, sparse path absent'
  create(O/'preimages'/('main' if root==R else 'successor')/p,b)
  tracking.append((root,p,b,origin))
indices=[]
for root in [R,F,Path('/private/tmp/abg-rc11-qualification-20261109')]:
 p=Path(git(root,'rev-parse','--git-path','index').decode().strip())
 if not p.is_absolute():p=root/p
 indices.append(pin(p))
record(O/'ROOT_FOUNDATION_BASIS_01.json',{
 'id':'FOUNDATION-BASIS-01','status':'ROOT_ADMITTED_AUTHORITY_AMENDMENT','recordedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'priorActivation':pin(O/'ACTIVATION.json'),'sourcePreimages':pre,'indicesBefore':indices,
 'ownerInstruction':['Effect API prohibition was misunderstanding','ABG is the application sitting on the best possible implementation of the design','yes do this, this may have been the root blocker of many refactor attempts that were silently killed or hamstrung'],
 'decision':'Product realization-profile reconciliation then design_reframe. Product text/realization constraint changes; fixed fifteen outcomes, behavioral requirements and serialized Public contracts remain unchanged. Core Effect3.22.1 mechanisms may realize authorized contracts without semantic authority. No per-API/helper approval gate, automatic concurrency/retry, upgrade or production transport rewrite.',
 'writes':[str(F/p) for p in paths]+[str(root/p) for root,p,_,_ in tracking]+[str(O)],
 'generationGrant':'Existing successor-local tsc/build and generate-qualification-rule-catalog.mjs --stage-authorities with exact successor and STDO3.0.4; normal deterministic manifest reconciliation. Generated authority definitions only, no positive qualification evidence. Actual output delta must be recorded.',
 'held':['production and test source edits','native setup/provider dispatch','commit/merge/push','release/install/operational pin change'],
 'historyConfidence':'Active D2 mechanism exclusion is established; no attribution of specific later native author failures to that exclusion.',
 'staticEnforcement':'Root/source assurance found no static Effect API blacklist. No Map/WeakMap oracle changes selected.'})

p=paths[0];s=(F/p).read_text()
s=replace(s,'5. exact-pinned Effect `3.22.1` supplies only the internal typed composition,\n   suspension, failure/Cause, stateless-capability, and physical-resource-scope\n   calculus for that fold and installed owner bindings;',
'5. exact-pinned Effect `3.22.1` supplies the internal implementation foundation\n   for that fold and installed owner bindings, including typed composition,\n   failure/Cause, resource lifetime, concurrency, streams, queues, clocks,\n   schedules and references where they realize the authorized owner contracts;')
s=replace(s,'The product can be compressed to this path:',
'''ABIogenesis is the application and retains semantic ownership. Its realization
selects the best lawful foundation by correctness, maintainability, performance
and total lifecycle cost. Core Effect `3.22.1` capabilities, including fibers,
streams, queues, clocks, schedules, references and STM, may implement declared
contracts and carry immutable application data. Capability names and data
carriage confer no authority to choose GTL topology, admit events, establish
currentness, define replay truth or introduce hidden policy. Owner-declared
sequence, admission, idempotence and resource laws remain binding. This profile
selects neither new application concurrency/retry behavior nor a library upgrade.
Physical interruption is not proof of process absence; observed clock time is
not admitted event time. The canonical production host runner remains singular.

The product can be compressed to this path:''')
(F/p).write_text(s)

p=paths[1];s=(F/p).read_text()
s=replace(s,'| exact-pinned Effect `3.22.1` | selected common execution-composition foundation for the complete installed definition family and the one HoG execution shell: typed sequential bind, stack-safe suspension, typed failure/Cause separation, stateless Context/Layer provision, and physical resource scoping | Product/GTL/HoG/ABG meaning; topology or selection; semantic retry, workflow, Saga, lifecycle, event admission, transaction/currentness, replay, schema, catalog, clock, scheduling, concurrency, or state authority |',
'| exact-pinned Effect `3.22.1` | common implementation foundation for the installed definition family and one HoG execution shell: typed composition, failure/Cause, resource scope, fibers, streams, queues, clocks, schedules, references and STM as needed by declared owner contracts | independent Product/GTL/HoG/ABG meaning; rival topology or selection; hidden retry, workflow, lifecycle or scheduling policy; event admission, semantic transaction/currentness, replay, schema or catalog authority |')
start=s.index('Effect subpath imports are required in production')
end=s.index('\nA lawful technology used outside its registered role is a design defect.',start)
s=s[:start]+'''Effect subpath imports are required in production so the used capability
surface remains explicit; the former list was not a complete lawful API set.
Core Effect `3.22.1` fibers, streams, queues, clocks, schedules, references,
STM, scopes and composition operators may implement an authorized contract.
No API name, helper or use of immutable application data requires a separate
approval gate. Section 10.1 compares actual foundations and semantic boundaries;
it does not repeat foundation selection for each ordinary library operation.
`@effect/platform` remains unselected under Section 10.1.3. Valibot remains the
singular schema owner; no second schema authority or dependency upgrade is selected.

ABG is the application, not a substitute implementation library. Product and
its exact owners select meaning, policy, topology, sequence, admission,
idempotence, resource duties and physical absence criteria. Effect implements
those contracts. Context/Layer may provide exact capabilities and immutable
inputs; local Ref/Queue/Stream/STM state may manage computation but cannot
establish runtime truth, currentness or replay authority. ABG expected-prefix
transactions retain semantic atomicity, and owner-declared Saga relations retain
recovery meaning. Library retries, scheduling or concurrency cannot invent an
application policy or bypass admitted order. No new such behavior is selected.

The canonical production host runner remains the sole production execution
membrane. Interrupting a fiber or closing a Scope is not evidence that a child
process or process group is absent. Clock observations are distinct from
admitted event time; elapsed-time reasoning must use one declared monotonic
domain. Cleanup and handback bounds require evidence for the actual waits and
finalizers, not an assumption that interruption cancels underlying I/O.

Section 16.15 supersedes the former mechanism exclusions, including the blanket
ban on Effect retry, Schedule, Clock, Fiber, Queue, Ref, FiberRef, Stream and STM,
and the exclusion of immutable semantic data from library carriers. The semantic
authority prohibitions above remain operative.
''' + s[end:]
old='| common execution composition | exact-pinned Effect `3.22.1`, through subpath imports | singular installed definition and HoG-shell substrate for typed sequential composition, stack-safe suspension, stateless dependencies, typed failure/Cause separation, and physical resource scoping | GTL topology, owner semantics, retry/workflow/Saga policy, ABG events/lifecycle/transactions/currentness/persistence, clocks/schedulers/concurrency/state, replay meaning, schema, another traversal, or an executable factorization plan | selected for the complete internal definition family and HoG execution shell. Direct-scalar and installed E29 prototypes remain conservation evidence and must be reconciled or deleted under active W2-05. Event Calculus/replay remain pure folds. |'
new='| common execution composition | exact-pinned Effect `3.22.1`, through subpath imports | singular installed definition and HoG-shell foundation, including resource, concurrency, stream, queue, clock, schedule and state mechanics under Section 9 | independent GTL topology, owner policy, ABG admission/currentness/lifecycle or replay truth; another traversal, schema authority or executable factorization plan | selected foundation; ordinary library capability use realizes existing owner contracts without a per-API gate. Event Calculus/replay remain pure folds. Historical prototypes confer no parallel production authority. |'
s=replace(s,old,new)
s=replace(s,'The selection is the lowest-total-cost lawful construction.',
'''The selection is the lowest-total-cost lawful construction, considering
correctness, maintainability and performance as well as integration and proof.
Within an already selected foundation, ordinary implementation choices proceed
under the admitted contract; this ledger is not a per-API or per-helper gate.''')
s=replace(s,'It covers the generic gap while the closed exclusions keep topology, owner meaning, retry/workflow/Saga, events, lifecycle, currentness, and replay outside Effect.',
'It covers the generic gap while application ownership keeps topology, policy, admission, lifecycle, currentness and replay meaning with their exact owners; Section 9 permits core library mechanisms to implement those contracts.')
s=replace(s,'Sequential composition is selected; Effect clocks, schedulers, concurrency, retry, Ref/Fiber/Queue/Stream/STM state are excluded. ABG effect order and replay remain unchanged. Expected failures stay typed, defects remain Cause, and Scope closes physical resources where an owner uses it.',
'Owner-declared sequencing remains selected. Core clocks, scheduling, concurrency, retry and Ref/Fiber/Queue/Stream/STM mechanics are available under Section 9 without selecting new application behavior. ABG effect order and replay remain unchanged. Expected failures stay typed, defects remain Cause, and Scope implements declared cleanup without proving physical absence by itself.')
s=replace(s,'Falsifiers: semantic state in Context; Effect-owned retry/currentness/concurrency; nested/internal runner; changed ABG effects/replay; second schema; package failure; or exact conservation failure.',
'Falsifiers: library state or policy promoted to semantic authority; bypassed owner admission/order/currentness; a rival production runner; changed ABG effects/replay; second schema authority; package failure; or exact conservation failure.')
s=replace(s,'Event Calculus and replay remain ordinary\ndeterministic functions and do not become Effect state, Stream, Ref, Schedule,\nor service-managed truth. The shell carries current immutable values through\nits typed success values; it does not store them in Context.',
'''Event Calculus and replay remain ordinary deterministic functions. Effect
carriers may transport their immutable inputs or derived results, but neither
Context, Ref, Stream, Schedule nor any service state becomes runtime truth or
selects the current prefix. Typed owner values retain their exact authority.''')
s=replace(s,'and any Effect-owned retry, fork, race, clock, queue, reference,\nor scheduler. The complete public family and all HoG structural forms share the\none calculus and one outer runner.',
'''and any library-selected retry, ordering, topology or runtime truth. Core
Effect fork, race, clock, queue, reference and scheduling mechanisms may realize
the owner's declared relation under Section 9. The complete public family and
all HoG structural forms share one calculus and one production outer runner.''')
s=replace(s,'- Program, input, prefix, event time, actor, Run, catalog, cursor, retry,\n  currentness, or other semantic value stored in Effect Context, Layer, Ref,\n  FiberRef, Queue, Stream, or STM; or',
'''- Effect Context, Layer, Ref, FiberRef, Queue, Stream or STM state promoted to
  authority over Program, input, prefix, event time, actor, Run, catalog, cursor,
  retry or currentness; carrying immutable owner values is lawful; or''')
s=replace(s,'binding, prototype-deletion, and migration-stage instructions. Its selection of\nEffect `3.22.1` and its authority prohibitions remain operative through 5.6.2C.',
'''binding, prototype-deletion, and migration-stage instructions. Section 16.15
also supersedes this record's API/mechanism exclusions and "Scope only" profile.
The original record below is retained as history. Effect `3.22.1` selection and
semantic authority boundaries remain operative through Sections 9 and 5.6.2C.''')
s=replace(s,'### 16.4 T-287 C1F Resource-State Binding Correction Record\n',
'''### 16.4 T-287 C1F Resource-State Binding Correction Record

**HISTORICAL RECORD.** Section 16.7 supersedes its implementation relation;
Section 16.15 supersedes any derivative API-only or immutable-carrier exclusion.
The original semantic ownership, admission and durability evidence is retained.
''')
s+='''

### 16.15 T-287 Application Ownership And Foundation Correction

The owner's explicit correction is that ABIogenesis is the application sitting
on the best implementation of its design. Root FOUNDATION-BASIS-01 reconciles
the Product realization profile and reframes this HOW under the exact STDO basis
selected by `stdo_abiogenesis.json`. Product text and its realization constraint
change; the fixed fifteen outcomes, behavioral requirements and serialized Public
contract do not. `REQ-R-ABG3-SAGA-FRONTIER-008/-009` clarify implementation versus
semantic ownership without relaxing their frontier/policy laws.

Sections 9, 10, 10.1.1, 10.1.4 and 10.7 now distinguish foundation mechanisms
from semantic authority. This supersedes the prior D2 API blacklist, restricted
"physical Scope only" interpretation and prohibition on carrying immutable
semantic values in core Effect structures, including derivative readings of
Sections 5.6.2C, 5.6.3 and 16.2-16.7. Their original historical decision records
remain evidence; they do not reimpose those mechanism exclusions. Existing
stateless binding contracts, structural admission and the singular production
host runner remain; no runtime callback policy or hidden selection is admitted.

Correctness, maintainability, performance and total lifecycle cost select the
best lawful foundation. Core Effect `3.22.1` is available without a per-API or
per-helper approval gate. No dependency upgrade, automatic concurrency/retry,
new semantic authority or wholesale production transport rewrite is selected.
The next separately admitted increment is a test-owned observer pilot, followed
by targeted causal proof and affected populations; current code is not changed
by this amendment. Fiber interruption and Scope finalization require separate
physical-absence evidence. Monotonic observation and admitted event time remain
distinct. A race that waits for loser termination or an unbounded finalizer
cannot establish bounded handback merely by naming a deadline.

The active D2 exclusion is evidenced. It is not established as the cause of any
specific later failed native author run. The original diagnosis and red runs
remain preserved; current repair planning links and supersedes the earlier plan
without rewriting it. Qualification debts and delivery standing are unchanged.
'''
(F/p).write_text(s)

note='''
ABIogenesis is the application; implementation foundations do not become
semantic owners. Select the best lawful foundation by correctness,
maintainability, performance and total lifecycle cost. Under Product and
realization constitution Section 9, core Effect `3.22.1` fibers, streams,
queues, clocks, schedules, references, STM and scopes may realize declared
contracts and carry immutable application values. No capability-name blacklist
or per-API/helper approval gate applies. Preserve owner policy, admission,
sequence, idempotence, currentness and replay law, the canonical production
runner and physical-absence proof. Library interruption is not process absence;
observed clock time is not admitted event time. This selects no automatic
concurrency/retry behavior, dependency upgrade or second semantic runtime.
'''
p=paths[2];s=(F/p).read_text();s=replace(s,'process-local runtime authority is prohibited.\n','process-local runtime authority is prohibited.\n'+note);(F/p).write_text(s)
p=paths[3];s=(F/p).read_text();s=replace(s,'writer, compatibility Product, or required process-local runtime authority.\n','writer, compatibility Product, or required process-local runtime authority.\n'+note);(F/p).write_text(s)
p=paths[4];s=(F/p).read_text()
s=replace(s,'the semantic runtime model shall not require a new orchestration framework.','the semantic runtime model shall not require a new orchestration framework. Selected foundational library mechanisms may implement these native asynchronous effects; ABG is the application and the declared semantic owners retain topology, policy and admission authority. A library capability or immutable data carrier does not itself create another orchestration authority.')
s=replace(s,'an ABG-owned queue or scheduler shall not govern branch parallelism.','an ABG-owned queue or scheduler shall not govern branch parallelism. This prohibits a rival semantic queue/scheduling authority, not a queue, clock, schedule, fiber or reference used as an implementation mechanism for the policy and admitted frontier already selected above. No hidden policy or new concurrency/retry behavior follows from choosing that mechanism.')
(F/p).write_text(s)

now=datetime.datetime.now(datetime.timezone.utc).isoformat()
for root,p,b,origin in tracking:
 rel='../.ai-workspace/work/' if p.name=='GOALS.md' else '../../work/'
 link=rel+'T287_RELEASE_RESUMPTION_01/rc11-foundation-correction-01/operator/REPAIR_PLAN.md'
 text=f'''Current selection, {now}: **RC11_FOUNDATION_PROFILE_CORRECTION_IN_PROGRESS**. The owner clarifies that ABG is the application on the best implementation foundation. Root FOUNDATION-BASIS-01 admits Product realization-profile reconciliation and coherent design/bootstrap clarification on isolated `codex/rc11-foundation-correction`, based on accepted RC11 `e2ba05da`. Core Effect `3.22.1` mechanisms may realize declared contracts without acquiring semantic authority; fixed fifteen outcomes, behavioral requirements and serialized Public contracts remain unchanged. [Current repair plan]({link}) links the preserved diagnosis and selects a prospective test-owned observer pilot; production/test source dispatch is held until Root consumes the amendment. No wholesale transport rewrite, dependency upgrade or automatic concurrency/retry is selected. RC11 stays locally installed, unqualified and unpublished; RC10 pin `05a9280f` remains builder. Both qualification debts, red runs, other backlog and native-workflow/full5.0/S7 obligations remain open. Prior bodies are preserved verbatim.\n\n'''.encode()
 target=root/p;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(text+b)
 assert target.read_bytes()[len(text):]==b
for x in indices:assert pin(Path(x['path']))==x
record(O/'AUTHORITY_EDIT_RECEIPT.json',{'status':'EDITED_PENDING_GENERATION_AND_FREEZE','before':pre,'after':{str(p):pin(F/p) for p in paths},'tracking':[{'path':str(root/p),'originalOrigin':origin,'beforeBytes':len(b),'beforeSha256':hashlib.sha256(b).hexdigest(),'after':pin(root/p),'priorBodyPreserved':True} for root,p,b,origin in tracking],'indicesConserved':indices})
print('Authority edits and four tracking prefixes written; all indices conserved.')
