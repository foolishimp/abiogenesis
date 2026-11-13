"""Read-only evidence reconciliation; writes only this preparation directory."""
import hashlib, json, pathlib, re
from datetime import datetime, timezone

R = pathlib.Path('/Users/jim/src/apps/abiogenesis')
B = R / '.ai-workspace/work/T287_RELEASE_RESUMPTION_01'
P = B / 'rc8-reference-preservation-01'
C = B / 'rc8-local-cut-01'
O = pathlib.Path(__file__).resolve().parent
T = 'build_tenants/abiogenesis/typescript/'
FRAME = 'repo://abiogenesis/build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md'
now = datetime.now(timezone.utc).isoformat()

def load(p): return json.loads(pathlib.Path(p).read_text())
def pin(p):
    p=pathlib.Path(p); b=p.read_bytes()
    return dict(path=str(p),bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
def save(name,obj):
    (O/name).write_text(json.dumps(obj,indent=2)+'\n')
def walk(o):
    if isinstance(o,dict):
        if all(k in o for k in ['path','bytes','sha256']) and isinstance(o['path'],str) and o['path'].startswith('/'):
            yield {k:o[k] for k in ['path','bytes','sha256']}
        for v in o.values(): yield from walk(v)
    elif isinstance(o,list):
        for v in o: yield from walk(v)

old=load(C/'CUT8_BUILD_BINDINGS_FINAL_SOURCE_004.prepared.json')
inv=load(C/'CUT8_FINAL_SOURCE_INVENTORY_003.json')
rows={x['relativePath']:x for x in inv['files']}
broad=load(B/'rc8-close-proof-01/OPERATOR_RETURN_025.json')
reviews=['gc03-method-fixture-001','native-assessment-011-plan','sas-timeout-002','owned-lifetime-010','recursive-timeout-014','selected-action-profile-019','w2-05-owner-chain-021','worksite-branch-timeout-022','worksite-command-timeout-023']
accepted=['author-03/ROOT_SOURCE_ACCEPTANCE.json','author-08/ROOT_SOURCE_ACCEPTANCE.json','author-09/ROOT_SOURCE_ACCEPTANCE.json','author-10/ROOT_SOURCE_ACCEPTANCE.json','author-11/ROOT_SOURCE_ACCEPTANCE.json','registered-selection-whole-001/ROOT_PROOF_ACCEPTANCE.json','rp2-correction-whole-001/ROOT_PROOF_ACCEPTANCE.json','st2a-e-second-case-001/ROOT_PROOF_ACCEPTANCE.json','c2-configured-positive-001/ROOT_PROOF_ACCEPTANCE.json']
seed_paths=[C/'CUT8_FINAL_BINDING_PREPARATION_RETURN_004.json',C/'CUT8_BUILD_BINDINGS_FINAL_SOURCE_004.prepared.json',C/'PREPARATION_MANIFEST_CORRECTED_002.json',C/'OWNER_AND_TOOL_PINS.json',C/'prepared-claims-002/PREPARATION.json',B/'rc8-close-proof-01/OPERATOR_RETURN_025.json',B/'rc8-reference-measurement-01/ROOT_MEASUREMENT_ACCEPTANCE_004.json']+[P/x for x in accepted]+[P/'reviews'/x/'REVIEW.json' for x in reviews]
seed_paths += [P/'author-08/OPERATOR_RETURN_PROOF_CLOSURE_001.json',P/'consolidation-whole-001/coordinates-001/RESULT.json']
# Reacquire direct acceptance/result/review/control support. This does not repeat
# Root's complete broad-ledger transitive inventory audit or execute any proof.
expected={}
for p in seed_paths:
    for q in walk(load(p)): expected[(q['path'],q['bytes'],q['sha256'])]=q
    q=pin(p); expected[(q['path'],q['bytes'],q['sha256'])]=q
for p in list(seed_paths):
    for q in walk(load(p)):
        if pathlib.Path(q['path']).name in ['RESULT.json','REVIEW.json']:
            for x in walk(load(q['path'])): expected[(x['path'],x['bytes'],x['sha256'])]=x
for tool in load(C/'OWNER_AND_TOOL_PINS.json')['tools']:
    assert str(pathlib.Path(tool['configuredPath']).resolve())==tool['realPath']
    q={k:tool[k] for k in ['bytes','sha256']}; q['path']=tool['realPath']
    expected[(q['path'],q['bytes'],q['sha256'])]=q
checks=[]
for q in sorted(expected.values(),key=lambda q:(q['path'],q['sha256'])):
    # GOALS/T287 are concurrently owned by the delivery-record Writer; historical
    # document pins are preserved but not compared to a moving current document.
    if q['path'] in [str(R/'specification/GOALS.md'),str(R/'.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md')]:
        checks.append(dict(expected=q,status='HISTORICAL_MUTABLE_DOCUMENT_PIN_NOT_CURRENT_FINAL_REFERENCE')); continue
    try:
        a=pin(q['path']); checks.append(dict(expected=q,status='MATCH' if a==q else 'MISMATCH',**({} if a==q else {'actual':a})))
    except OSError as e: checks.append(dict(expected=q,status='UNAVAILABLE',error=str(e)))

def evidence(rel): return pin(P/rel)
def pop(file,kind,acceptance=None,result=None,residual=None,claim='',**kw):
    row=rows[T+'test_env/tests/'+file+'.test.mjs']
    src={'path':row['sourceSnapshot'],'bytes':row['bytes'],'sha256':row['sha256']}
    assert pin(src['path'])==src
    v=dict(file='test_env/tests/'+file+'.test.mjs',standing=kind,retainedA11Test=src,claim=claim,broadLedgerRestamped=False)
    if acceptance: v['acceptance']=evidence(acceptance)
    if result: v['result']=evidence(result)
    if residual: v['residual']=residual
    v.update(kw); return v

populations=[
 pop('t287-installed-product-coordinate','ACCEPTED_SEPARATE_WHOLE','author-08/ROOT_SOURCE_ACCEPTANCE.json','consolidation-whole-001/coordinates-001/RESULT.json',claim='11/11; A8 exact source relation retained.'),
 pop('t287-native-worksite-execution','ACCEPTED_SEPARATE_WHOLE','author-09/ROOT_SOURCE_ACCEPTANCE.json','author-09/proof-evidence/lane-01/RESULT.json',claim='4 actual passes and 3 historical optional skips; no native C2 integration claim.'),
 pop('t287-registered-graph-selection','ACCEPTED_SEPARATE_WHOLE','registered-selection-whole-001/ROOT_PROOF_ACCEPTANCE.json','registered-selection-whole-001/actual-001/RESULT.json',claim='1 pass; seven scenarios and four cold reads, exact A10 correspondence.'),
 pop('t287-rp2-correction-carriers','ACCEPTED_SEPARATE_WHOLE','rp2-correction-whole-001/ROOT_PROOF_ACCEPTANCE.json','rp2-correction-whole-001/actual-001/RESULT.json',claim='1 pass; two modes and two cold replays. No human-response/resume claim.'),
 pop('t287-required-operation-bindings','ACCEPTED_CASEWISE','author-11/ROOT_SOURCE_ACCEPTANCE.json','author-11/proof-evidence/lane-01/RESULT.json',claim='Nine unchanged actual016 passes plus one final A11 focused pass; no new whole-file execution or complete Effect/store success claim.'),
 pop('t287-st2a-e-exact-prefix-workspace-environment','ACCEPTED_CASEWISE','st2a-e-second-case-001/ROOT_PROOF_ACCEPTANCE.json','st2a-e-second-case-001/actual-001/RESULT.json',claim='Original020 first case plus final A11 second case; two intended case assertions. Original timeout retained, no new whole file.'),
]
residual_specs=[
 ('t287-governed-context','RC8-GC03-METHOD-304','rc8-gc03-method-304',reviews[0],'009','Current 3.0.4 configured GC03 blocked/unaccepted; 14 partial passes, current custody/basis incompatibility.'),
 ('t287-native-assessment-evidence','RC8-NATIVE-ASSESSMENT-PROFILE','rc8-native-assessment-profile',reviews[1],'011','Four golden component cases unexecuted; unsupported historical profile premises, no current Product defect established.'),
 ('t287-single-address-space-consolidation','RC8-SAS-WHOLE-PROOF','rc8-sas-whole-proof',reviews[2],None,'Six partial whole-attempt passes; case7 timeout, cases8/9 and full aggregate open. Separately accepted cases10/11 do not close whole proof.'),
 ('t287-owned-process-lifetime','RC8-PHYSICAL-LIFETIME-013','rc8-physical-lifetime-013',reviews[3],'013','A10 actual16pass/2fail; response/HTTP readiness failures and unexecuted later HTTP modes; no18/18 or physical HTTP assurance.'),
 ('t287-recursive-registered-selection','RC8-RECURSIVE-REGISTERED-SELECTION-PROOF','rc8-recursive-registered-selection-proof',reviews[4],'014','Three partial passes, 600s SIGTERM; current full recursion/resume and bounded Runtime latency unproved.'),
 ('t287-selected-action-authority','RC8-SELECTED-ACTION-PROFILE','rc8-selected-action-profile',reviews[5],'019','Zero bodies/passes/skips; exact historical6c8a prefix unsupported by current owner. Current selector discriminators unproved.'),
 ('t287-w2-05-install-catalog-owner-chain','RC8-W2-05-TOKEN-ORACLE','rc8-w2-05-token-oracle',reviews[6],'021','One failed case/zero passes; new-on-RC8 lexical proof incompatibility. Reached dynamic assertions preserved, two export checks/final diagnostic unexecuted.'),
 ('t287-worksite-branch-construction','RC8-C3-COMPOSITION-PROOF-BUDGET','rc8-c3-composition-proof-budget',reviews[7],'022','0pass/0fail/2cancelled; both240s inner deadlines; no current positive/partial completion or fresh replay credit; escaped-descendant absence unproved.'),
 ('t287-worksite-command-execution','RC8-C2-INSTALLED-NEGATIVE-PROOF-BUDGET','rc8-c2-installed-negative-proof-budget',reviews[8],'023','Five installed negative variants remain OPEN; six original component passes and a separately accepted configured positive do not close them.'),
]
ticket=R/'.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md'
ticket_text=ticket.read_text()
capsules=[]
for file,id,anchor,review,execution,claim in residual_specs:
    start=ticket_text.index('<a id="'+anchor+'"></a>')
    end=ticket_text.find('\n<a id=',start+1)
    if end<0: end=ticket_text.index('\n[Execution001]',start)
    section=ticket_text[start:end]
    capsules.append(dict(id=id,status='OPEN',sourceUri=str(ticket)+'#'+anchor,sectionBytes=len(section.encode()),sectionSha256=hashlib.sha256(section.encode()).hexdigest(),review=evidence('reviews/'+review+'/REVIEW.json'),source='Existing Root-owned T287 capsule; not a new disposition. Full-document final pin pending delivery-record Writer.'))
    v=pop(file,'OPEN_RESIDUAL',residual=id,claim=claim,review=evidence('reviews/'+review+'/REVIEW.json'),ticketAnchor=str(ticket)+'#'+anchor)
    if execution: v['originalReturn']=pin(B/f'rc8-close-proof-01/OPERATOR_RETURN_{execution}.json')
    else: v['originalReturn']=evidence('consolidation-whole-001/OPERATOR_RETURN_REENTRY_003.json')
    if id=='RC8-C2-INSTALLED-NEGATIVE-PROOF-BUDGET':
        v['separateAcceptedPositive']={'acceptance':evidence('c2-configured-positive-001/ROOT_PROOF_ACCEPTANCE.json'),'result':evidence('c2-configured-positive-001/actual-001/RESULT.json'),'passed':1,'skipped':0,'excluded':11,'wholeFile':False,'scope':'One configured installed large-log observation/replay case;21 owner-local refusal checks do not close five installed-negative variants; no universal escaped-descendant absence claim.'}
    populations.append(v)
populations.append(pop('witness-reprice-definition-binding','A12_DEPENDENCY_PENDING',claim='Only two ROOT_CURRENT_EVENT_PROFILE_REF uses selected to become ROOT_WINDOW_EVENT_PROFILE_REF. Future source/proof/review/Root acceptance absent here; no new credit.',finalA12Source=None,finalA12Proof=None,finalA12Review=None,finalA12Acceptance=None))
assert len(populations)==16
assert {p['file'] for p in populations}==set(broad['retainedLedger']['deferredFiles'])

save('EVIDENCE_CHECKS.json',dict(kind='bounded_preparation_pin_reacquisition',at=now,scope='Direct named controls, accepted judgments, nine reviews and their direct result/review support; original Root complete broad audit reused, not repeated.',checks=checks,totals={s:sum(x['status']==s for x in checks) for s in sorted({x['status'] for x in checks})},rootPriorAudit={'source':'Root instruction in current activation','creditedCurrentTests':192,'uniqueEvidencePins':1096,'mismatches':0,'independentlyRepeatedHere':False}))
save('BROAD_POPULATION_MAP.json',dict(status='PREPARED_A12_AND_FINAL_ROOT_CONJUNCTION_PENDING',at=now,frame=FRAME,scope='fixed15/GOAL035/T287/REF01;STDO3.0.4;empty composition',retainedA11SourceDigest=old['source']['sourceDigest'],retainedA11SourceInventory=old['source']['inventory'],archive=old['source']['nativeTestedArchive'],broadReturn=pin(B/'rc8-close-proof-01/OPERATOR_RETURN_025.json'),broadLedger=broad['retainedLedger'],broadCustody=broad['custody'],separatePopulations=populations,residualCapsules=capsules,summary={'inventoriedFiles':208,'broadCreditedFiles':192,'broadActualPasses':986,'broadHistoricalSkips':227,'separateWholeProofs':4,'acceptedCasewisePopulations':2,'openResidualPopulations':9,'pendingA12CasewisePopulation':1,'wholeBroadGreen':False},finalRootConjunction=None,finalDeliveryRecord=None,executionEnabled=False))

save('INTAKE_AND_BASIS.json',dict(status='BOUND_PREPARATION_WRITER_ONLY',at=now,actor='/root/rc8_cut_preparation',consumer='/root',skill='/Users/jim/Library/Application Support/STDO/releases/v3.0.4/plugins/spec/skills/stdo-work/SKILL.md',receive='/Users/jim/Library/Application Support/STDO/releases/v3.0.4/plugins/spec/references/COORDINATED_HANDOFF.md#receive',basis={'uri':'stdo://releases/v3.0.4/','manifestSha256':'102817a3f4bea4dca1d6fa0fc634b94404dd2ba82ba6d8c38b273402dda9f95b','managerCommand':'stdo status --definition stdo_abiogenesis.json --verify','installed':True,'valid':True,'failures':[],'composition':[]},definition=pin(R/'stdo_abiogenesis.json'),agents=pin(R/'AGENTS.md'),frame=pin(R/'build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md'),scope='fixed15/GOAL035/T287/REF01',admission={'source':'Exact Root instruction to this separate Writer in current session, continuing user authority; existing ROOT_AUTHORITY envelope referenced below.','effectClause':'new preparation/evidence/claim drafts ONLY beneath rc8-local-cut-01/preparation-resumption-001/ (new dir) and compact PREPARATION_RETURN there','predecessor':pin(C/'CUT8_FINAL_BINDING_PREPARATION_RETURN_004.json'),'authorityEnvelope':pin(C/'prepared-claims-002/ROOT_AUTHORITY.md')},host={'filesystem':'Unrestricted tools exposed; no technical read-isolation claim.','acquisition':'Named control/evidence and material declared owner routes only; no independent-review role.','noSubagents':True},effects={'writeTerritory':str(O),'source':0,'tests':0,'build':0,'sdk':0,'provider':0,'install':0,'git':0,'cleanup':0,'executionEnabled':False},requiredFinalDependencies={'A12':None,'deliveryRecord':None,'RootBroadConjunction':None}))

print(json.dumps({'output':str(O),'pinChecks':len(checks),'statuses':{s:sum(x['status']==s for x in checks) for s in sorted({x['status'] for x in checks})},'populations':len(populations),'capsules':len(capsules)},indent=2))

# Final delivery-record pins supplied by the separate Writer after its freeze.
delivery_expected=[
 {'path':str(R/'specification/GOALS.md'),'bytes':138970,'sha256':'aa8409b95df79c1bdb9c0958ee2591e64654a82521382501cca13418bfb2a8e1'},
 {'path':str(ticket),'bytes':780667,'sha256':'a9de28c9a43e2e7e69acf4b588287c1eee57cd777c633fd394c6553e130e183a'},
 {'path':str(B/'rc8-resumption-20261108/RESUMPTION.json'),'bytes':21402,'sha256':'728d6f4965d4daa912f5a05b28df85f59066fc8cc232d47fe729c78c2ce593a1'},
 {'path':str(B/'rc8-resumption-20261108/WRITER_RETURN.json'),'bytes':2900,'sha256':'02384b50d9f14396c6fa34bdcc658e9a725622384d83dea25f0b0c3208987497'},
]
for q in delivery_expected: assert pin(q['path'])==q, q['path']
delivery=dict(status='FINAL_WRITER_PINS_REACQUIRED',pins=delivery_expected,authority='Delivery-record Writer return; no new execution or acceptance. All nine capsule bytes preserved.')
for name in ['BROAD_POPULATION_MAP.json','INTAKE_AND_BASIS.json']:
    d=load(O/name)
    if name.startswith('BROAD'): d['finalDeliveryRecord']=delivery
    else: d['requiredFinalDependencies']['deliveryRecord']=delivery
    save(name,d)

claim=(C/'prepared-claims-002/BOUNDED_CANDIDATE_CLAIM.md').read_text()
claim=claim.replace('The frozen subject is sourceDigest', 'The accepted A11 predecessor is sourceDigest')
claim=claim.replace('The final [source/artifact evidence map](SOURCE_ARTIFACT_EVIDENCE_MAP.json) must bind actual checkpoint, reproduction, review, broad conjunction and install standing; those future receipts and final coverage totals are pending here.',
'''A12 is a separate pending test-only successor; its source/proof/review and Root acceptance are not supplied by this draft. The final [source/artifact evidence map](SOURCE_ARTIFACT_EVIDENCE_MAP.json) is created before installation and binds the actual checkpoint, reproduction, packaging review and Root broad conjunction. Actual installation and subsequent smoke standing must be read from the later [final installation verification]('''+str(C/'actual-001/FINAL_INSTALL_VERIFICATION.json')+'''); that receipt does not exist at preparation and is not claimed here. No future pin is supplied.''')
claim=claim.replace('whose actual status must come from the map.', 'whose actual status must come from the later final installation verification receipt.')
claim=claim.replace("Final broad status/counts must come from Root's final conjunction through the map.",
'''[Broad025]('''+str(B/'rc8-close-proof-01/OPERATOR_RETURN_025.json')+''') closes the bounded remainder with 192 broad-ledger files, 986 actual passes and 227 historical skips; no scheduled files remain unvisited. Its 16 separately handled file populations are four accepted whole proofs, these two accepted case-wise proofs, nine OPEN residual populations and the pending A12 witness-reprice case-wise successor. Separate accepted proofs retain their identities and do not restamp the A6 ledger. Root's final source/broad conjunction remains required before a cut.''')
claim=claim.replace('The [seven OPEN residuals](RESIDUALS.md)', 'The [nine OPEN residuals](RESIDUALS.md)')
claim=claim.replace('No whole-broad green or full5.0/release qualification is asserted.',
'''The [separately accepted configured C2 positive]('''+str(P/'c2-configured-positive-001/ROOT_PROOF_ACCEPTANCE.json')+''') proves one installed large-log observation/replay case, with one pass, zero skips and eleven excluded cases; six prior component passes retain their original023 identities. This does not close the five installed-negative variants, create whole-C2 credit, or prove universal escaped-descendant absence. No whole-broad green or full5.0/release qualification is asserted.''')
(O/'BOUNDED_CANDIDATE_CLAIM.md').write_text(claim)

res=(C/'prepared-claims-002/RESIDUALS.md').read_text().replace('seven retained OPEN','nine retained OPEN')
res=res.replace('The final [source/artifact evidence map](SOURCE_ARTIFACT_EVIDENCE_MAP.json) must bind their adopted pins and final broad conjunction.',
'The final Root broad conjunction, referenced by the [source/artifact evidence map](SOURCE_ARTIFACT_EVIDENCE_MAP.json), must preserve their adopted evidence and exact exclusions.')
new_res='''- **RC8-C3-COMPOSITION-PROOF-BUDGET.** [Review926dd059]({review}) and [broad022]({run}) retain 0pass/0fail/2cancelled: both 240s inner proof deadlines expired, exit1 after484.520s; the outer600s deadline did not fire. Current positive and partial C3 completion/fresh replay remain unproved. First-case cleanup retained no frontier beyond pack/install; second-case nested C1/C0 file-replace progress is nonterminal evidence. Roots were removed by after-hooks; escaped-descendant absence remains unproved. Unchanged test/helpers/owners and no established semantic failure support only the unqualified REF-01 exclusion. Before dependent C3/whole/broad/release claims, separately select effective inner allocation, preserve both original cases/all assertions, prove actual terminals and fresh replay/equality with complete reporters and physical-close/lineage-absence observations. The proposed600s inner/1500s outer bounds are neither authorized here nor proven sufficient. Timeout, missing physical evidence or weakened assertions retains OPEN; semantic/authority/effect failures require Product triage.

- **RC8-C2-INSTALLED-NEGATIVE-PROOF-BUDGET.** [Review0bb7370d]({c2review}) and [broad023]({c2run}) retain five installed-negative variants: actual180s timeout for `command_cleanup_unresolved`, and no outcomes for `http_probe_failed`, `http_cleanup_unresolved`, `command_spawn_enoexec`, `http_spawn_enoexec` after Root's scoped stop. Six component passes remain partial; the original command has no final aggregate/whole-file credit. Known group absence was observed, but final resource receipt and escaped-detached-descendant absence were not established. The later [configured positive acceptance]({c2accept}) is separately accepted (one pass/zero skips/eleven excluded, exact fresh replay and known-owner close); its21 local refusal checks do not qualify these five installed variants. Before exceptional-current-outcome/whole-C2/broad/release claims, separately select the exact five-negative population with truthful inner/outer bounds, unchanged semantic/currentness/helper-artifact/physical oracles, actual outcomes/replay and owned close/absence. Missing terminal, lost first error, wrong artifact join or unresolved ownership prevents closure. No negative reproof, source/timer repair, retry or Product180s SLA is selected.

'''.format(review=P/'reviews/worksite-branch-timeout-022/REVIEW.json',run=B/'rc8-close-proof-01/OPERATOR_RETURN_022.json',c2review=P/'reviews/worksite-command-timeout-023/REVIEW.json',c2run=B/'rc8-close-proof-01/OPERATOR_RETURN_023.json',c2accept=P/'c2-configured-positive-001/ROOT_PROOF_ACCEPTANCE.json')
res=res.replace('Root Executive and the owning',new_res+'Root Executive and the owning')
res=res.replace('Final broad status/counts remain pending in the map.', 'Broad025 retains192 whole-ledger files/986passes/227historical skips and16 separate populations. A12 remains a pending case-wise dependency, not a tenth residual. Final Root source/broad conjunction remains pending.')
(O/'RESIDUALS.md').write_text(res)

authority='''**PREPARED DRAFT — local unqualified RC8 authority envelope; execution disabled.**

The user's continuing instruction “ok move to rc7 build rc8” supplies upstream authority under Root Executive, fixed fifteen-family [Project Reference-Frame Basis]({frame}), GOAL035/T-287/REF-01, exact STDO3.0.4 manifest102817a3 and empty composition. This separate Writer has only preparation/claim/evidence effects in `preparation-resumption-001`.

The accepted predecessor remains [A11]({a11}), sourceDigest95d3d1d0430f50649e35183cb0d361393f0cd821ce3e5b80e0a3dc0c67b20c04,1339rows/26selected paths. A12's selected two-reference unshipped witness-test correction is pending; this draft does not freeze its future source or invent proof/review/acceptance pins. [Current delivery records]({delivery}) preserve the completed broad025 remainder and all nine OPEN capsules.

A later separate Root binding may admit the exact final selected local source checkpoint, preserving unrelated dirty source, untracked histories and immutable releases/worktrees. It must conjoin accepted A12 source/proof, the192-file broad ledger and16 separate populations, all [nine residual limits](RESIDUALS.md), current delivery records and final source/archive correspondence. The existing corrected002 driver then checkpoints only selected paths and reproduces a clean source archive through existing generator/package owners. The archive must remain byte-equal to tested `sha256:a178e960a04d29175e5488e58b9975bab1f0026828e5a85e40c7f4f9752796b9`, compiled manifest`sha256:f74390de60cc59dd3770bc85ab8d2461296c5258a259c223cd2deeab03458102`, with exact member correspondence and no identity bridge.

The later exact packaging review and separate install binding precede fresh local immutable custody, Product verification/resolved-lock/install owners and the narrower actual-installed export/empty-resource read/close smoke. Corrected outer custody ceilings remain20minutes for installation and15minutes for installed-owner smoke; these are ceilings, not observed performance. Full lifecycle/performance remains scoped to the accepted exact-archive installed scratch proof. The [preinstall source/artifact map](SOURCE_ARTIFACT_EVIDENCE_MAP.json) binds completed preinstall evidence; actual later installation/smoke status belongs to [FINAL_INSTALL_VERIFICATION.json]({verification}). Both are future execution outputs, not current receipts.

This preparation has `broadClose:null` and `executionEnabled:false`; it cannot admit itself. No push, tag, merge, publication, global selector change, stable/released/qualified claim, history deletion, immutable-release modification or automatic retry is included. Existing continuing authority and later concrete Root bindings control; no additional user-approval round is created.
'''.format(frame=R/'build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md',a11=P/'author-11/ROOT_SOURCE_ACCEPTANCE.json',delivery=B/'rc8-resumption-20261108/WRITER_RETURN.json',verification=C/'actual-001/FINAL_INSTALL_VERIFICATION.json')
(O/'ROOT_AUTHORITY.md').write_text(authority)

prepared={k:old[k] for k in ['preparationManifest','metadata','paths','boundsMs','maxOutputBytes','nodeHeapMiB']}
prepared.update(status='PREPARED_RC8_RESUMPTION_A12_PENDING_NO_EXECUTION',activation=None,source=None,acceptedA11Predecessor=old['source'],acceptance={'source':None,'focusedAndReview':None,'broadClose':None,'referenceAfter':old['acceptance']['referenceAfter']},deliveryRecord=delivery,populationMap=pin(O/'BROAD_POPULATION_MAP.json'),pendingA12={'source':None,'proof':None,'review':None,'acceptance':None},limits=['Explicitly unqualified local REF-01 candidate only; nine OPEN residuals, twelve cold-read residuals, S7 and broader5.0/human gates retained.','Root final source/broad conjunction and exact A12 source inventory remain pending. No whole-broad green.','Use only unchanged run-local-cut.corrected-002.mjs and PREPARATION_MANIFEST_CORRECTED_002.json; preserve20minute/15minute bounds.','Exact accepted final source checkpoint and clean byte-equal archive reproduction, then independent exact packaging review and separate install admission.','No push/tag/publication/global selector/qualified claim/cleanup/retry.'],executionEnabled=False)
save('CUT8_BUILD_BINDINGS.prepared.json',prepared)

control=dict(status='EXISTING_CORRECTED002_PATH_RECONCILED_NO_EXECUTION',at=now,driver=pin(C/'run-local-cut.corrected-002.mjs'),preparationManifest=old['preparationManifest'],ownerPins=pin(C/'OWNER_AND_TOOL_PINS.json'),boundsMs=old['boundsMs'],phases=[
 {'phase':'final preparation','requires':['Root-accepted actual A12 source/proof/review/native-close/readback conjunction','Final source inventory in files[{relativePath,sourceSnapshot,bytes,sha256}] form; actual changed/new paths and modes','Root final broad/source acceptance preserving all16 population standings and nine residuals','Fresh separate execution activation/binding with exact controls and current delivery pins'], 'currentStatus':'PENDING_A12_AND_ROOT_CONJUNCTION'},
 {'phase':'build','command':f'/opt/homebrew/bin/node {C}/run-local-cut.corrected-002.mjs build <ROOT_FINAL_BUILD_BINDINGS.json> <EXACT_BINDING_SHA256>','expectedOutputs':['SOURCE_PREPARED.json','SOURCE_CHECKPOINT.json','REPRODUCTION_INPUTS_VERIFIED.json','candidate/RESULT.json','reproduction/RESULT.json','EXACT_TESTED_ARTIFACT.json','INSTALL_INPUTS_PENDING.json','BUILD_RESULT.json'],'evidencePath':str(C/'actual-001'),'realization':'Check every source snapshot and live C8 row; require base HEAD/tree/branch and empty index; preserve main/RC7 heads/index; git-add exact changed paths; checkpoint; git archive exact tenant/spec/definition/agent inputs; clean compile/generate/npm pack; assert archive bytes/hash, manifest and every payload member equal tested archive. No source overlay replacement.'},
 {'phase':'packaging review','requires':['Exact completed sourceCommit/sourceTree and byte-equal reproduction/artifact receipts','Independent verdict:satisfied naming exact commit/tree','Final reviewed claim/residual/authority document pins'], 'currentStatus':'AFTER_BUILD'},
 {'phase':'install','command':f'/opt/homebrew/bin/node {C}/run-local-cut.corrected-002.mjs install <ROOT_FINAL_INSTALL_BINDINGS.json> <EXACT_BINDING_SHA256>','expectedControlFields':['activation','preparationManifest','buildBindings','sourceCheckpoint','candidate','reproduction','exactTestedArtifact','independentPackagingReview','installInputs','boundedClaim','residuals','rootAuthority','claim','limits','published:false','qualified:false','selectorChanged:false'],'expectedOutputs':['install-001/SOURCE_ARTIFACT_EVIDENCE_MAP.json','install-001/INPUT_MANIFEST.json','releaseRoot/verification.json','releaseRoot/resolved-lock.json','releaseRoot/installation.json','releaseRoot/payload-correspondence.json','releaseRoot/LOCAL_CUT_RECORD.json','releaseRoot/SHA256SUMS','install-001/INSTALLED_OWNER_SMOKE.json','FINAL_INSTALL_VERIFICATION.json'],'realization':'Exact prior build/commit/tree/candidate/reproduction/member correspondence and independent review checked before allocation; existing Product verify/resolved-lock/install and all-member payload equality; actual installed exports/verification/empty-resource read/close; final receipt after smoke. No global selector/provider/native workflow.'}],materialReconciliation=[
 'Old source004 binding descriptions still say25paths/five residuals/broad018; prepared-claims002 saysseven residuals. Historical files preserved; successor drafts use nine capsules and broad025192/986/227 plus16 separate populations.',
 'Corrected001 templates retained by corrected002 manifest still show older budgets and control prose. Use the existing source004 concrete budgets20m/15m and corrected002 driver/manifest; do not instantiate stale template values blindly.',
 'Driver writes source/artifact map before install and final verification after smoke. Successor claim text now names these distinct evidence stages; no driver modification needed.'
],realPreparationGaps=['A12 exact final source/proof/review and Root acceptance unavailable; final source inventory/changed paths cannot yet be frozen.','Root final broad/source conjunction unavailable; acceptance.broadClose remains null and execution disabled.'],ownerPathOrBudgetDefectFound=False,executionEnabled=False)
save('CONTROL_RECONCILIATION.json',control)

# Validate the current draft links; the two declared execution outputs are
# deliberately future routes, not fabricated evidence.
future={'SOURCE_ARTIFACT_EVIDENCE_MAP.json',str(C/'actual-001/FINAL_INSTALL_VERIFICATION.json')}
linkchecks=[]
for name in ['BOUNDED_CANDIDATE_CLAIM.md','RESIDUALS.md','ROOT_AUTHORITY.md']:
    for target in re.findall(r'\]\(([^)]+)\)',(O/name).read_text()):
        clean=target.split('#')[0]; q=pathlib.Path(clean)
        if not q.is_absolute(): q=O/q
        linkchecks.append(dict(document=name,target=target,exists=q.is_file(),futureRoute=clean in future))
assert all(x['exists'] or x['futureRoute'] for x in linkchecks)
assert not any(x['status'] in ['MISMATCH','UNAVAILABLE'] for x in checks)
save('DRAFT_VALIDATION.json',dict(at=now,links=linkchecks,allExistingLinksResolve=True,onlyExpectedFutureRoutesMissing=True,executionEnabled=False,deliveryPinsReverified=delivery_expected,separatePopulationCount=16,openCapsuleCount=9,originalsEdited=False))
docs=['INTAKE_AND_BASIS.json','EVIDENCE_CHECKS.json','BROAD_POPULATION_MAP.json','BOUNDED_CANDIDATE_CLAIM.md','RESIDUALS.md','ROOT_AUTHORITY.md','CUT8_BUILD_BINDINGS.prepared.json','CONTROL_RECONCILIATION.json','DRAFT_VALIDATION.json','prepare.py']
save('PREPARATION_RETURN.json',dict(status='PREPARATION_COMPLETE_FINAL_A12_AND_ROOT_CONJUNCTION_PENDING_NO_EXECUTION',at=now,actor='/root/rc8_cut_preparation',consumer='/root',result='satisfied',predicate='Bounded preparation/evidence/claim reconciliation only; execution and final candidate acceptance withheld.',basis='STDO3.0.4/102817a3;fixed15/GOAL035/T287/REF01;empty composition',documents=[pin(O/x) for x in docs],verified={'namedPinsMatched':sum(x['status']=='MATCH' for x in checks),'historicalMutableTicketPinKeptHistorical':1,'finalDeliveryPinsMatched':4,'broadPopulations':16,'openResiduals':9,'materialPinMismatches':0,'rootPriorBroadAuditReused':'192 credited/current tests;1096 unique evidence pins;zero mismatch;not rerun'},readiness='Existing corrected002 checkpoint/reproduction/exact-archive/review/install/smoke path is usable after final bindings.20m install/15m installed-owner ceilings retained. Drafts correct stale count/status prose and distinguish preinstall map from later install verification.',mandatoryDependencies=['Actual A12 frozen source/proof/review/native-close/readback conjunction and Root acceptance','Fresh final source inventory/changed-new path list and source-to-tested-archive relation','Root final broad/source conjunction preserving16 separate populations/nine residuals','Separate Root build admission; then exact completed packaging review and separate install admission'],deliveryRecord=delivery,finalA12=None,finalRootBroadConjunction=None,broadClose=None,executionEnabled=False,effects={'sourceEdits':0,'tests':0,'sdk':0,'providers':0,'builds':0,'repack':0,'installs':0,'git':0,'cleanup':0,'writesOnly':str(O)},returnBoundary='Stop; no further activation or execution.'))
print(json.dumps({'preparationReturn':pin(O/'PREPARATION_RETURN.json'),'drafts':len(docs),'deliveryPinsMatched':4,'executionEnabled':False},indent=2))
