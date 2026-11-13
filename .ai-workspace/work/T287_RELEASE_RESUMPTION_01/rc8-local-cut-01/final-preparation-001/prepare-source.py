"""A12 mechanical source preparation only; no proof/build/runtime/Git writes."""
import copy, hashlib, json, os, pathlib, stat, subprocess, tarfile
from datetime import datetime, timezone

R=pathlib.Path('/Users/jim/src/apps/abiogenesis')
B=R/'.ai-workspace/work/T287_RELEASE_RESUMPTION_01'
P=B/'rc8-reference-preservation-01'
C=B/'rc8-local-cut-01'
PRE=C/'preparation-resumption-001'
O=pathlib.Path(__file__).resolve().parent
W=pathlib.Path('/Users/jim/src/apps/abiogenesis-rc8-reference-preservation')
T='build_tenants/abiogenesis/typescript/'
TARGET=T+'test_env/tests/witness-reprice-definition-binding.test.mjs'
AT=datetime.now(timezone.utc).isoformat()
def load(p):return json.loads(pathlib.Path(p).read_text())
def pin(p):
    p=pathlib.Path(p);b=p.read_bytes()
    return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def check(q):
    assert pin(q['path'])=={k:q[k] for k in ['path','bytes','sha256']},q['path']
    return q
def save(name,d):(O/name).write_text(json.dumps(d,indent=2)+'\n')
def git(*args):
    return subprocess.check_output(['/usr/bin/git','--no-optional-locks','-C',str(W),*args],env=dict(os.environ,GIT_OPTIONAL_LOCKS='0')).decode()
indexpath=pathlib.Path(git('rev-parse','--git-path','index').strip())
if not indexpath.is_absolute(): indexpath=W/indexpath
indexbefore=pin(indexpath)
old=load(C/'CUT8_BUILD_BINDINGS_FINAL_SOURCE_004.prepared.json')
oldinv=load(C/'CUT8_FINAL_SOURCE_INVENTORY_003.json')
check(old['source']['inventory']); check(old['source']['subject'])
prior_return=check({'path':str(PRE/'PREPARATION_RETURN.json'),'bytes':5967,'sha256':'64de1ae759b7ae6fd76c24c3e72e9f59c664682c8a13ddcc2a24f2bbf68d3002'})
for q in load(PRE/'PREPARATION_RETURN.json')['documents']:check(q)
for q in load(PRE/'PREPARATION_RETURN.json')['deliveryRecord']['pins']:check(q)
freeze_pin=check({'path':str(P/'author-12/proof-evidence/source-freeze.json'),'bytes':295551,'sha256':'bf762d202c262042bd6dc015518c8147ee44848af1cbe98e412761e71468ebe6'})
result_pin=check({'path':str(P/'author-12/proof-evidence/lane-01/RESULT.json'),'bytes':968,'sha256':'2384db138493cd491661f684b8898b94e7881561c788d2e14042cc1581aed39c'})
freeze=load(freeze_pin['path']);result=load(result_pin['path'])
ready_pin=pin(P/'author-12/proof-evidence/READY.json');ready=load(ready_pin['path'])
assert freeze['sourceDigest']=='60f8e595cfcf1b11f01dd0d46c9030d5042fc3edb076d20993c583e0b6b98e32'
assert freeze['sourceDigest']==ready['sourceDigest']==result['sourceDigest']
assert freeze['changedPaths']==[TARGET] and len(freeze['rows'])==1339
assert freeze['baseSourceFreeze']==old['source']['subject']
assert freeze['baseSourceDigest']==old['source']['sourceDigest']
assert ready['buildInvocations']==freeze['buildInvocations']==result['buildInvocations']==0
assert ready['work']=='/private/tmp/abg-r8-a12-001/p/w'
assert result['status']=='PASSED' and result['counts']['passed']==1 and result['counts']['failed']==result['counts']['skipped']==0 and result['wholeFile'] is False
check(result['events']);check(ready['currentCandidateFixture'])
previous={r['relativePath']:r for r in oldinv['files']}
finalrows={r['path']:r for r in freeze['rows']}
assert set(previous)==set(finalrows)
changed=[p for p in sorted(finalrows) if (finalrows[p]['bytes'],finalrows[p]['sha256'])!=(previous[p]['bytes'],previous[p]['sha256'])]
assert changed==[TARGET]
overlay=freeze['overlay'][0];check(overlay)
before=pathlib.Path(previous[TARGET]['sourceSnapshot']).read_bytes()
after=pathlib.Path(overlay['path']).read_bytes()
assert before.count(b'ROOT_CURRENT_EVENT_PROFILE_REF')==2
assert after==before.replace(b'ROOT_CURRENT_EVENT_PROFILE_REF',b'ROOT_WINDOW_EVENT_PROFILE_REF')
files=[]
for name,row in sorted(finalrows.items()):
    snapshot=overlay['path'] if name==TARGET else previous[name]['sourceSnapshot']
    exact={'path':snapshot,'bytes':row['bytes'],'sha256':row['sha256']};check(exact)
    live=pin(W/name);assert (live['bytes'],live['sha256'])==(row['bytes'],row['sha256']),name
    files.append({'relativePath':name,'sourceSnapshot':snapshot,'bytes':row['bytes'],'sha256':row['sha256']})
base=old['source']['baseCommit']
assert git('rev-parse','HEAD').strip()==base
assert git('rev-parse','HEAD^{tree}').strip()==old['source']['baseTree']
assert git('branch','--show-current').strip()==old['paths']['branch']
assert git('diff','--cached','--name-only','-z')==''
tracked=sorted(x for x in git('diff','--no-ext-diff','--name-only','-z',base).split('\0') if x)
selected=sorted(set(old['source']['expectedChangedPaths']+changed))
tree=git('ls-tree','-r','-z',base,'--',*selected)
tracked_base={x.split('\t',1)[1]:x.split('\t',1)[0].split(' ')[0] for x in tree.split('\0') if x}
new=sorted(set(selected)-set(tracked_base))
assert new==sorted(old['source']['expectedNewPaths'])
assert tracked==sorted(set(selected)-set(new)),{'observed':tracked,'selected':selected}
assert set(selected)<=set(finalrows)
assert git('ls-files','-z','--',*new)==''
modes={p:('100755' if (W/p).stat().st_mode&stat.S_IXUSR else '100644') for p in selected}
assert all(modes[p]==tracked_base[p] for p in tracked_base)
assert all(modes[p]==old['source']['fileModes'][p] for p in old['source']['fileModes'])

prior_ready_pin=old['proofBindings']['finalSourceToMeasuredProductCorrespondence']['retainedCompiledStageReceipt'];check(prior_ready_pin)
prior_ready=load(prior_ready_pin['path'])
pr={x['path']:x for x in prior_ready['derivedStageFiles']};dr={x['path']:x for x in ready['derivedStageFiles']}
assert set(pr)==set(dr)
derived_changes=[p for p in sorted(pr) if pr[p]!=dr[p]]
assert derived_changes==[TARGET]
for name,row in dr.items():
    q=pathlib.Path(ready['work'])/name
    assert row['kind']=='file',row
    check({'path':str(q),'bytes':row['bytes'],'sha256':row['sha256']})
    assert bool(q.stat().st_mode&stat.S_IXUSR)==row['executable'],name
archive=check(freeze['productArchive']);assert archive==old['source']['nativeTestedArchive']==ready['productArchive']
manifest=check(old['source']['testedManifest']); original_relation=check(old['source']['nativeTestedArchiveSourceRelation'])
stage04freeze=check(oldinv['sourceChain'][-1]); original=load(stage04freeze['path'])
original_rows={x['path']:x for x in original['rows']}
cumulative=sorted(name for name in finalrows if name not in original_rows or finalrows[name]!=original_rows[name])
assert cumulative==sorted(oldinv['composition']['cumulativeUnshippedChangedPaths']+[TARGET])
with tarfile.open(archive['path'],'r:gz') as tf:members=[m.name for m in tf.getmembers()]
assert all(p.startswith(T+'test_env/') for p in cumulative)
assert all('package/'+p.removeprefix(T) not in members for p in cumulative)
assert pin(indexpath)==indexbefore

inventory={'status':'PREPARED_OBSERVED_A12_SOURCE_INVENTORY_ACCEPTANCE_PENDING_NO_EXECUTION','at':AT,'sourceDigest':freeze['sourceDigest'],'sourceSubject':freeze_pin,'sourceAcceptance':None,'sourceChain':[freeze_pin]+oldinv['sourceChain'],'composition':{'baseRows':len(original_rows),'finalRows':len(files),'unchangedBaseRows':len(finalrows)-len(cumulative),'cumulativeUnshippedChangedPaths':cumulative,'predecessorInventory':old['source']['inventory'],'unchangedPredecessorRows':len(files)-1,'changedPredecessorRows':changed,'custody':'Reuse exact predecessor immutable snapshots plus one actual A12 overlay; no copied tree or moving C8 custody. Every snapshot and current C8 row rehashed.'},'files':files}
save('SOURCE_INVENTORY.json',inventory)
selected_record={'status':'OBSERVED_A12_SELECTED_SOURCE_DELTA_NO_GIT_EFFECT','at':AT,'baseCommit':base,'baseTree':old['source']['baseTree'],'sourceDigest':freeze['sourceDigest'],'expectedChangedPaths':selected,'expectedNewPaths':new,'fileModes':modes,'deletedPaths':[],'counts':{'selected':len(selected),'trackedModified':len(tracked),'new':len(new)},'derivation':'Actual A12 freeze row delta and current read-only Git base comparison, confirmed exact tracked/new membership and actual modes. No anticipated count used.','indexBefore':indexbefore,'indexAfter':pin(indexpath),'stagedPaths':[],'gitOptionalLocks':False,'originalTwoSubstitutionsVerified':True,'sourceSnapshotsAndLiveC8RowsVerified':len(files)}
save('SELECTED_SOURCE_DELTA.json',selected_record)
relation={'kind':'observed_a12_unshipped_test_overlay_to_retained_exact_archive','status':'MECHANICAL_CORRESPONDENCE_SATISFIED_ACCEPTANCE_AND_CLEAN_REPRODUCTION_PENDING','at':AT,'sourceDigest':freeze['sourceDigest'],'sourceFreeze':freeze_pin,'inventory':pin(O/'SOURCE_INVENTORY.json'),'sourceAcceptance':None,'originalProductSourceAcceptance':old['source']['originalProductSourceAcceptance'],'originalProductSourceRelation':original_relation,'testedManifest':manifest,'productArchive':archive,'retainedAcceptedPredecessor':old['source']['finalTestOnlySourceAcceptance'],'previousSourceDigest':old['source']['sourceDigest'],'changedFromA11':changed,'exactEdit':'Exactly two ROOT_CURRENT_EVENT_PROFILE_REF uses replaced with ROOT_WINDOW_EVENT_PROFILE_REF; all remaining file bytes unchanged.','sourceRows':len(files),'unchangedA11Rows':len(files)-1,'cumulativeChangesFromOriginalProductSource':cumulative,'unchangedOriginalProductRows':len(finalrows)-len(cumulative),'allCumulativeChangedPathsUnshipped':True,'archiveMemberCount':len(members),'archiveRehashed':True,'derivedStage':{'ready':ready_pin,'path':ready['work'],'rows':len(dr),'changedRelativeToA11':derived_changes,'allRowsAndExecutableModesRehashed':True,'buildInvocations':0,'dependencyDigest':freeze['dependencyDigest'],'dependencyStanding':'Exact retained digest from A12 freeze; no dependency installation or recomputation selected.'},'focusedProof':result_pin,'focusedReporter':result['events'],'proofStanding':{'passed':1,'skipped':0,'wholeFile':False,'casewiseRootAcceptance':None},'requiredFuture':{'sourceReview':None,'actualSdkCloseReadbackConjunction':None,'RootSourceAcceptance':None,'RootBroadConjunction':None,'cleanCheckpointReproduction':None},'limits':['This records mechanical bytes and retained provenance; it does not accept A12 source or establish a new executable artifact.','Actual clean checkpoint reproduction must match tested archive/manifest exactly under the existing corrected002 driver.','All accepted prior proof limits, nine OPEN residuals, twelve cold-read residuals, S7 and broader5.0/human gates remain.'],'executionEnabled':False}
save('SOURCE_ARTIFACT_RELATION.prepared.json',relation)
binding=copy.deepcopy(old)
binding['status']='PREPARED_LOCAL_RC8_A12_SOURCE_REVIEW_CLOSE_ACCEPTANCE_PENDING_NO_EXECUTION'
binding['activation']=None
binding['source'].update(subject=freeze_pin,inventory=pin(O/'SOURCE_INVENTORY.json'),sourceDigest=freeze['sourceDigest'],fileModes=modes,expectedChangedPaths=selected,expectedNewPaths=new,deletedPaths=[],cumulativeSourceCoverageDisposition=None,finalTestOnlySourceAcceptance=None,nativeTestedArchiveSourceRelation=pin(O/'SOURCE_ARTIFACT_RELATION.prepared.json'))
binding['source']['acceptedA11Predecessor']=old['source']['finalTestOnlySourceAcceptance']
binding['acceptance'].update(source=None,focusedAndReview=None,broadClose=None)
binding['proofBindings']={'retainedAcceptedPredecessorBinding':pin(C/'CUT8_BUILD_BINDINGS_FINAL_SOURCE_004.prepared.json'),'retainedPopulationMap':pin(PRE/'BROAD_POPULATION_MAP.json'),'observedA12SourceArtifactRelation':pin(O/'SOURCE_ARTIFACT_RELATION.prepared.json'),'observedA12Ready':ready_pin,'observedA12FocusedResult':result_pin,'observedA12FocusedReporter':result['events'],'finalA12SourceReview':None,'finalA12SdkCloseReadbacks':None,'finalA12SourceAcceptance':None,'finalRootBroadConjunction':None,'timingSufficiency':old['proofBindings']['timingSufficiency'],'operatorBudgetSelection':old['proofBindings']['operatorBudgetSelection']}
binding['limits']=load(PRE/'CUT8_BUILD_BINDINGS.prepared.json')['limits']
binding['limits'][1]='Observed A12 source60f8e595/1339rows; actual27 selected paths(24tracked/3new). Source review/SDKclose-readback/Root acceptance and final broad conjunction remain pending; no whole-broad green.'
binding['executionStanding']='Actual A12 source and focused1pass/0skip are pinned; source/whole/casewise acceptance absent. No checkpoint/build/install. Corrected00220m install/15m installedOwner ceilings unchanged.'
binding['predecessorPreparedBinding']=pin(PRE/'CUT8_BUILD_BINDINGS.prepared.json')
binding['deliveryRecord']=load(PRE/'PREPARATION_RETURN.json')['deliveryRecord']
binding['executionEnabled']=False
save('CUT8_BUILD_BINDINGS.prepared.json',binding)

population=load(PRE/'BROAD_POPULATION_MAP.json')
population['status']='PREPARED_OBSERVED_A12_FOCUSED_PASS_ACCEPTANCE_AND_FINAL_CONJUNCTION_PENDING'
population['at']=AT;population['observedA12SourceDigest']=freeze['sourceDigest'];population['observedA12Inventory']=pin(O/'SOURCE_INVENTORY.json')
for row in population['separatePopulations']:
    if row['file']=='test_env/tests/witness-reprice-definition-binding.test.mjs':
        row.update(standing='A12_FOCUSED_PASS_ACCEPTANCE_PENDING',claim='Actual A12 selected focused case passed1/0skip. Source review, SDK close/readback and Root source/casewise acceptance pending; no whole-file credit.',finalA12Source=freeze_pin,finalA12Proof=result_pin,observedA12Test=overlay,finalA12Review=None,finalA12Acceptance=None)
population['predecessorPopulationMap']=pin(PRE/'BROAD_POPULATION_MAP.json')
save('BROAD_POPULATION_MAP.prepared.json',population)

claim=(PRE/'BOUNDED_CANDIDATE_CLAIM.md').read_text()
claim=claim.replace('A12 is a separate pending test-only successor; its source/proof/review and Root acceptance are not supplied by this draft.',f'Observed A12 sourceDigest `{freeze["sourceDigest"]}` has 1,339 rows and 27 actually selected paths (24 tracked modifications, three new files). Its [freeze]({freeze_pin["path"]}) records only the two witness-reprice profile-reference substitutions; the [focused case]({result_pin["path"]}) passed one case with zero skips and no whole-file credit. The source review, actual SDK close/readbacks and Root acceptance remain pending. This draft records those observations without promoting them to accepted final source.')
claim=claim.replace('the pending A12 witness-reprice case-wise successor','the A12 witness-reprice successor awaiting case-wise Root acceptance')
(O/'BOUNDED_CANDIDATE_CLAIM.md').write_text(claim)
res=(PRE/'RESIDUALS.md').read_text().replace('A12 remains a pending case-wise dependency, not a tenth residual.','A12 has one observed focused pass and remains a pending case-wise acceptance dependency, not a tenth residual.')
(O/'RESIDUALS.md').write_text(res)
auth=(PRE/'ROOT_AUTHORITY.md').read_text().replace("A12's selected two-reference unshipped witness-test correction is pending; this draft does not freeze its future source or invent proof/review/acceptance pins.",f'A12 now has observed frozen sourceDigest `{freeze["sourceDigest"]}`, 1,339 rows and 27 actually selected paths (24 tracked modifications, three new files), plus one focused pass with zero skips. Source review, actual SDK close/readbacks and Root acceptance remain pending; no future acceptance pin is supplied.')
(O/'ROOT_AUTHORITY.md').write_text(auth)
command={'status':'CONCRETE_EXISTING_DRIVER_ROUTE_FINAL_BINDINGS_PENDING','driver':check(load(PRE/'CONTROL_RECONCILIATION.json')['driver']),'preparationManifest':check(old['preparationManifest']),'preparedBindings':pin(O/'CUT8_BUILD_BINDINGS.prepared.json'),'finalBindingFieldsToFill':['status=ROOT_SELECTED_LOCAL_RC8_BUILD_ONLY','activation:exact separate Root build admission','source.cumulativeSourceCoverageDisposition:actual Root A12 source acceptance','source.finalTestOnlySourceAcceptance:actual Root A12 source acceptance','acceptance.source:actual Root A12 source acceptance','acceptance.focusedAndReview:actual Root accepted A12 conjunction','acceptance.broadClose:actual Root final broad/source conjunction','proofBindings final A12 review/SDKclose-readback/source acceptance/Root broad conjunction','executionEnabled:true only under separate actual Root execution admission'], 'commandArgv':['/opt/homebrew/bin/node',str(C/'run-local-cut.corrected-002.mjs'),'build',str(O/'CUT8_BUILD_BINDINGS.final.json'),'<SHA256_OF_ACTUAL_FINAL_BINDING>'],'executeNow':False,'boundsMs':old['boundsMs'],'expectedOutputRoot':old['paths']['output'],'expectedBuildOutputs':load(PRE/'CONTROL_RECONCILIATION.json')['phases'][1]['expectedOutputs'],'afterBuild':'Independent satisfied review of exact checkpoint/tree/reproduction/artifact, then separate Root install admission through unchanged corrected002 install phase.','priorControls':pin(PRE/'CONTROL_RECONCILIATION.json'),'deliveryPinsRemainFrozen':binding['deliveryRecord']}
save('BUILD_COMMAND.prepared.json',command)
for q in binding['deliveryRecord']['pins']:check(q)
assert pin(indexpath)==indexbefore
docs=['SOURCE_INVENTORY.json','SELECTED_SOURCE_DELTA.json','SOURCE_ARTIFACT_RELATION.prepared.json','CUT8_BUILD_BINDINGS.prepared.json','BROAD_POPULATION_MAP.prepared.json','BOUNDED_CANDIDATE_CLAIM.md','RESIDUALS.md','ROOT_AUTHORITY.md','BUILD_COMMAND.prepared.json','prepare-source.py']
save('PREPARATION_RETURN.json',{'status':'A12_SOURCE_PREPARATION_COMPLETE_ACCEPTANCE_AND_EXECUTION_WITHHELD','at':AT,'actor':'/root/rc8_cut_preparation','consumer':'/root','result':'satisfied','predicate':'Observed A12 source inventory, selected source membership/modes, retained archive correspondence and disabled successor drafts only.','activation':'Root successor preparation instruction; write only new final-preparation-001; no C8/Git/source/test/build/runtime effects.','basis':'STDO3.0.4/102817a3;fixed15/GOAL035/T287/REF01;empty composition','predecessor':prior_return,'sourceDigest':freeze['sourceDigest'],'verification':{'frozenSourceRows':len(files),'immutableSnapshotRowsMatched':len(files),'liveC8RowsMatched':len(files),'changedRowsFromA11':changed,'selectedPaths':len(selected),'trackedModifiedPaths':len(tracked),'newPaths':len(new),'derivedStageRowsMatched':len(dr),'derivedStageChangesFromA11':derived_changes,'originalArchiveUnchanged':archive,'manifestUnchanged':manifest,'cumulativeUnshippedChanges':len(cumulative),'twoSubstitutionsOnly':True,'focusedPassed':1,'focusedSkipped':0,'wholeFileCredit':False,'indexUnchanged':True,'deliveryPinsUnchanged':True,'mismatches':[]},'documents':[pin(O/x) for x in docs],'remainingMandatoryDependencies':['Actual independent A12 source review','Actual A12 SDK close/fresh readback conjunction','Root A12 source/casewise acceptance','Root final source/broad conjunction','Separate exact Root build admission; later exact packaging review and separate install admission'],'sourceAcceptance':None,'broadClose':None,'executionEnabled':False,'effects':{'writesOnly':str(O),'source':0,'git':0,'tests':0,'builds':0,'repack':0,'install':0,'sdk':0,'providers':0,'cleanup':0},'returnBoundary':'Stop; preserve this frozen preparation until a separate successor activation.'})
print(json.dumps({'return':pin(O/'PREPARATION_RETURN.json'),'sourceInventory':pin(O/'SOURCE_INVENTORY.json'),'sourceDigest':freeze['sourceDigest'],'selected':selected_record['counts'],'rowsMatched':len(files),'derivedRowsMatched':len(dr),'changedFromA11':changed,'mismatches':[],'executionEnabled':False},indent=2))
