#!/usr/bin/env python3
"""One serial affected-file proof on retained exact compiled payload; no build/retry."""
import datetime,hashlib,importlib.util,json,os,shutil,subprocess,sys,time
from pathlib import Path
sys.dont_write_bytecode=True
HERE=Path('/private/tmp/abg-rc14-regression-repair-20261115-06/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc14-release-gap-01/regression-repair-06')
ACT=json.loads((HERE/'ACTIVATION.json').read_text())
SOURCE=Path(ACT['sourceWorktree']);RAW=Path(ACT['rawRoot']);REL=Path('build_tenants/abiogenesis/typescript')
NODE='/opt/homebrew/bin/node'

def module(name,filename):
 spec=importlib.util.spec_from_file_location(name,HERE/filename); m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
owner=module('finite_process','process-owner.py');deps=module('dependencies','dependency-inputs.py');custody=module('setup_custody','setup-custody.py')
write=owner.write

def digest(path):
 h=hashlib.sha256()
 with Path(path).open('rb') as f:
  for chunk in iter(lambda:f.read(8388608),b''):h.update(chunk)
 return h.hexdigest()

def bound_json(row):
 assert digest(row['path'])==row['sha256'],row['path'];return json.loads(Path(row['path']).read_text())

def require_author_completion(native,final):
 assert final['nativeCompleted'] is True,'outer host success is not author completion'
 completion=json.loads((RAW/'runtime/AUTHOR_COMPLETION.json').read_text())
 assert completion['status']=='completed' and completion['actualResourceClose'] and completion['freshResult'] and completion['freshClosedReplay']
 expected={'NATIVE_RETURN.json','FRESH_READBACKS.json','calls/run_result.outcome.json','calls/run_replay.outcome.json'}
 assert len(completion['evidence'])==len(expected) and {r['path'] for r in completion['evidence']}==expected
 for r in completion['evidence']:
  p=RAW/'runtime'/r['path'];assert p.stat().st_size==r['bytes'] and digest(p)==r['sha256'],r['path']
 value=native['ownerOutput']['value'];terminal=value['terminalResult']
 assert native['ownerOutput']['outcomeKind']=='result' and value['disposition']=='completed'
 assert terminal['kind']=='abg_typed_terminal_result' and terminal['valueKind']=='native_workspace_work_observation'
 assert terminal['value']['kind']=='native_workspace_work_observation' and terminal['value']['inputDigest']==completion['taskDigest']
 assert value['run']==native['run']==completion['run'] and value['result']==terminal['result']==completion['result']
 assert terminal['valueDigest']==completion['terminalValueDigest']
 prepared=json.loads((RAW/'runtime/PREPARED.json').read_text());assert prepared['taskDigest']==completion['taskDigest']
 rows=json.loads((RAW/'runtime/FRESH_READBACKS.json').read_text());assert [r['memberKey'] for r in rows]==['run_result','run_replay']
 for r in rows:
  assert r['outcomeKind']=='result' and r['source']==native['run']
  read=json.loads((RAW/'runtime/calls'/f"{r['memberKey']}.outcome.json").read_text())['receipt']['ownerOutput']
  assert read['outcomeKind']=='result' and read['value']['source']==native['run']
  projection=read['value']['projection'];assert projection['subject']==native['run']
  for k in ['result','contract','producer','value','valueDigest']:
   assert projection['terminalResult'][k]==terminal[k],(r['memberKey'],k)
  if r['memberKey']=='run_result':assert projection['result']==terminal['result']
  else:assert projection['status']=='closed' and r['status']=='closed'

def source_inventory(head):
 git=lambda *a:subprocess.check_output(['/usr/bin/git','-C',str(SOURCE),*a])
 assert git('rev-parse','HEAD').decode().strip()==head
 assert git('diff','--cached','--name-only','-z')==b'','native must not stage'
 tracked=[x.decode() for x in git('ls-files','-z').split(b'\0') if x]
 others=[x.decode() for x in git('ls-files','--others','--exclude-standard','-z').split(b'\0') if x]
 changed=sorted(set([x.decode() for x in git('diff','--name-only','HEAD','-z').split(b'\0') if x]+others))
 setup=custody.verify(SOURCE,RAW,head);assert setup['path'] in changed
 native=[p for p in changed if p!=setup['path']]
 assert native and all(p in ACT['nativeWriteScope'] for p in native),native
 rows=[]
 for relative in sorted(set(tracked+others)):
  p=SOURCE/relative
  if not p.exists():continue
  assert p.is_file() and not p.is_symlink(),relative
  rows.append({'path':relative,'bytes':p.stat().st_size,'sha256':digest(p),'executable':bool(p.stat().st_mode&0o111)})
 bypath={r['path']:r for r in rows};pre=json.loads((RAW/'SOURCE_PREIMAGE.json').read_text());assert pre['head']==head
 for row in pre['rows']:
  actual=bypath.get(row['path']);assert actual is not None,'source deletion '+row['path']
  assert actual['executable']==(row['mode']=='100755'),row['path']
  if row['path'] not in native:assert actual['sha256']==row['sha256'],row['path']
 for p in ACT['nativeWriteScope']:assert p in bypath and bypath[p]['bytes']>0,p
 return {'head':head,'changedPaths':changed,'nativeChangedPaths':native,'setupOwnedChanges':[setup],'rows':rows}

def verify_inventory(root,rows):
 root=Path(root);actual=[]
 for p in sorted(root.rglob('*')):
  assert not p.is_symlink(),str(p)
  if p.is_file():actual.append({'path':str(p.relative_to(root)),'bytes':p.stat().st_size,'sha256':digest(p)})
 assert actual==rows,'complete inventory mismatch '+str(root)

def checked_population(events,selection):
 summaries=[x for x in events if x.get('type')=='summary' and x.get('file') is None]
 cases=[x for x in events if x.get('type')=='case' and not x.get('suite')]
 top=[x['name'] for x in cases if x.get('nesting')==0]
 assert len(summaries)==1 and summaries[0]['success'] is True and any(x.get('type')=='end' for x in events),summaries
 assert len(top)>=selection['minimumTopLevelCases'] and all(x in top for x in selection['preservedTitles']),('population conservation',selection['file'],top)
 assert cases and all(x['passed'] and not x.get('todo') for x in cases)
 skips={x['name']:x['skip'] for x in cases if x.get('skip')};expected=selection['optionalSkipReasonIncludes']
 assert set(skips)==set(expected) and all(expected[n] in str(v) for n,v in skips.items()),('required positive skipped or unexpected historical skip',skips)
 return {'file':selection['file'],'summary':summaries[0],'cases':cases,'requiredPositiveCasesExecuted':True}

def retained_proof_relation(postimage,reuse,retained,plan):
 relation=json.loads((HERE/'RETAINED_PROOF.json').read_text())
 prior=bound_json(relation['sourcePostimage']);returned=bound_json(relation['proofReturn']);late=bound_json(relation['postFailureConservation'])
 inputs=bound_json(relation['reuseInputs']);runner=relation['originalProofRunner']
 assert digest(runner['path'])==runner['sha256']
 assert late['originalControls']['runnerSha256']==runner['sha256']
 assert late['status']=='matched' and late['failure'] is None and len(late['checks'])==22 and all(x['matched'] for x in late['checks'])
 assert late['proofReturn']['sha256']==relation['proofReturn']['sha256']
 assert returned['status']=='stopped_first_failure' and returned['sourceHead']==relation['sourceCommitAtRun']
 assert returned['conservation']['sourceUnchangedThroughProof'] and returned['conservation']['setupCustodyReverified']
 assert returned['finalDeadlineCheck']['expired'] is False
 assert inputs['buildInventorySha256']==reuse['buildInventory']['sha256'] and inputs['sourceInputsSha256']==reuse['sourceInputs']['sha256']
 assert inputs['derivedPayloadOutputs']==reuse['derivedPayloadOutputs'] and inputs['requiredInputs']==retained['files']
 excluded=relation['excludedChangedPath'];assert ACT['nativeWriteScope']==[excluded]
 tenant=lambda rows:{x['path']:(x['bytes'],x['sha256'],x['executable']) for x in rows if x['path'].startswith(str(REL)+'/') and x['path']!=excluded}
 assert tenant(prior['rows'])==tenant(postimage['rows']),'retained proof causal source/support/input drift'
 package=json.loads((SOURCE/REL/'package.json').read_text());assert package['files']==['build/**','contracts/**','product-toolchain-manifest.json']
 assert len(relation['rows'])==len(plan['retainedFiles'])==2
 observations=[]
 for row,selection in zip(relation['rows'],plan['retainedFiles']):
  assert row['file']==selection['file'] and row['originalOrdinal']==selection['originalOrdinal']
  records={}
  for name,record in row['records'].items():
   path=Path(record['path']);assert path.is_file() and not path.is_symlink() and path.stat().st_size==record['bytes'] and digest(path)==record['sha256'],name
   if name.endswith('.json'):records[name]=json.loads(path.read_text())
  receipt=records['RETURN.json'];assert receipt['exitCode']==0 and receipt['stopReason'] is None and receipt['cleanup']['processGroupAbsent']
  for stream in ['stdout.raw','stderr.raw']:assert receipt[stream]['sha256']==row['records'][stream]['sha256'] and receipt[stream]['bytes']==row['records'][stream]['bytes']
  events=[json.loads(line) for line in Path(row['records']['stdout.raw']['path']).read_text().splitlines()]
  assert records['OBSERVED_CASES.json']['events']==events
  checked=checked_population(events,selection);assert records['COUNTS.json']==checked
  assert records['START.json']['argv']==[NODE,'--experimental-vm-modules','--test','--test-concurrency=1','--test-timeout=1790000','--test-reporter=./scripts/node-test-evidence-reporter.mjs','test_env/tests/'+selection['file']]
  assert next(x for x in events if x['type']=='begin')['nodeVersion']=='v24.7.0'
  observations.append({'file':selection['file'],'sourceSha256':selection['preimageSha256'],'originalReturnSha256':row['records']['RETURN.json']['sha256'],'cases':len(checked['cases']),'disposition':'retained_original_pass_not_reexecuted'})
 assert sum(x['cases'] for x in observations)==13
 return {'sourceOutsideChangedTestMatched':True,'compiledAndDependencyInputs':'verified by enclosing existing input owners','lateConservationSha256':relation['postFailureConservation']['sha256'],'files':observations,'originalCampaignPassed':False,'qualified':False}

def proof_layout(subject,source,dependency_root,prior_proof_root,installed_root,release_root,raw,proof):
 # Every actual destination is a strict child: authority files, specification,
 # and the whole build_tenants subtree (tenant source/build/dependencies).
 return {'worksite':str(subject),'writePaths':[str(subject/p) for p in ['AGENTS.md','CLAUDE.md','stdo_abiogenesis.json','specification','build_tenants']],
         'protectedRoots':[str(source),str(dependency_root),str(prior_proof_root),str(installed_root),str(release_root),str(raw/'runtime')],
         'archiveRoot':str(proof)}

def require_proof_reentry(launchpath,launch,authoritypath):
 successor=Path(__file__).resolve().parent
 authoritypath=Path(authoritypath)
 assert authoritypath.is_file() and not authoritypath.is_symlink(),'exact Root proof authority required'
 authority=json.loads(authoritypath.read_text())
 assert authority['id']=='RC14-NATIVE06-PROOF-REENTRY-01' and authority['executionAuthorized'] is True
 manifestpath=successor/'CONTROL_MANIFEST.json'
 assert digest(manifestpath)==authority['controlManifestSha256']
 manifest=json.loads(manifestpath.read_text())
 for row in manifest['files']:
  p=successor/row['path'];assert p.is_file() and not p.is_symlink() and p.stat().st_size==row['bytes'] and digest(p)==row['sha256'],row['path']
 auditpath=successor/'AUTHOR_AUDIT.json';audit=json.loads(auditpath.read_text())
 assert authority['auditSha256']==digest(auditpath)
 assert audit['disposition']=='scope_and_commands_observed_with_disclosed_method_residual'
 assert [r['id'] for r in audit['deviations']]==['native06-coordinated-handoff-reference-not-acquired', 'native06-product-basis-reference-not-acquired', 'native06-activation-reference-not-acquired']
 assert all(r['cured'] is False and r['methodComplianceClaim'] is False for r in audit['deviations'])
 observed=audit['originalObservation'];observedpath=Path(observed['path'])
 assert observedpath.is_file() and not observedpath.is_symlink() and observedpath.stat().st_size==observed['bytes'] and digest(observedpath)==observed['sha256']
 assert authority['originalObservationSha256']==observed['sha256']
 observation=json.loads(observedpath.read_text())
 assert observation['sourceHead']==audit['sourceHead'] and observation['sourceDiffSha256']==audit['sourceDiffSha256'] and observation['launchSha256']==audit['launchSha256']
 assert observation['sourceFreeze']['sourcePostimage']['sha256']==audit['sourcePostimageSha256'] and observation['sourceFreeze']['nativeRows']==audit['changedRows']
 assert observation['methodReferencesOmitted']==[r['omittedReference'] for r in audit['deviations']]
 assert observation['fullMethodComplianceClaimed'] is False and audit['proofAuthorized'] is False
 assert all(observation[k] is True for k in ['sourceScopeSatisfied','commandAllowlistSatisfied','methodContentBeforeEditSatisfied','taskReadFirstContentBeforeEditSatisfied'])
 assert audit['inspectionError']==observation['inspectionError'],'retain the read-only inspection error separately'
 assert authority['acceptedHistoricalMethodResidualIds']==[r['id'] for r in audit['deviations']]
 assert authority['residualsRemainDisclosed'] is True and authority['authorMethodComplianceClaim'] is False
 assert authority['methodDisposition']=='preserve_actual_deviation_and_admit_exact_snapshot_for_bounded_proof'
 assert authority['sourceHead']==audit['sourceHead']==launch['sourceHead']
 assert authority['sourceDiffSha256']==audit['sourceDiffSha256']
 assert authority['sourcePostimageSha256']==audit['sourcePostimageSha256']
 assert authority['launchSha256']==audit['launchSha256']==digest(launchpath)
 assert digest(HERE/'CONTROL_MANIFEST.json')==audit['originalControlsManifestSha256']
 assert digest(HERE/'prove.py')==audit['originalRunnerSha256']
 review=authority['sourceReview'];assert review['disposition']=='accepted_for_bounded_proof'
 reviewpath=Path(review['path']);assert reviewpath.is_file() and not reviewpath.is_symlink() and digest(reviewpath)==review['sha256']
 assert review['sourceDiffSha256']==audit['sourceDiffSha256'],'independent source review must bind this postimage'
 for row in audit['evidence']:
  p=Path(row['path']);assert p.is_file() and not p.is_symlink() and p.stat().st_size==row['bytes'] and digest(p)==row['sha256'],row['path']
 for row in audit['changedRows']:
  p=SOURCE/row['path'];assert p.is_file() and not p.is_symlink() and p.stat().st_size==row['bytes'] and digest(p)==row['sha256'],row['path']
 control=json.loads((RAW/'CONTROL_START.json').read_text())
 assert authority['originalHostDeadlineUtc']==audit['originalHostDeadlineUtc']==control['deadlineUtc']
 assert authority['proofRoot']==str(RAW/'proof-01') and authority['proofSubject']==json.loads((HERE/'LAYOUT.json').read_text())['proofSubject']
 assert authority['retry'] is False and authority['qualified'] is False
 return audit,{'authority':{'path':str(authoritypath),'sha256':digest(authoritypath)},'controlManifestSha256':digest(manifestpath),'auditSha256':digest(auditpath),'sourceReview':review,'historicalMethodResiduals':audit['deviations'],'originalHostDeadlineUtc':control['deadlineUtc'],'retry':False,'qualified':False}

def main():
 assert len(sys.argv)==3,'original launch and separately accepted Root proof authority required'
 launchpath=Path(sys.argv[1]);launch=json.loads(launchpath.read_text());head=launch['sourceHead']
 assert launch['activationId']==ACT['id'] and launch['dispatchAuthorized'] is True
 for row in launch['controls']:assert digest(HERE/row['path'])==row['sha256'],row['path']
 host=json.loads((RAW/'HOST_RETURN.json').read_text());final=json.loads((RAW/'runtime/FINAL.json').read_text());native=json.loads((RAW/'runtime/NATIVE_RETURN.json').read_text())
 assert host['exitCode']==0 and host['stopReason'] is None and host['cleanup']['hostProcessGroupAbsent']
 assert final['launched'] and final['actualResourceClose'] and final['failure'] is None and final['readbackFailure'] is None
 require_author_completion(native,final)
 audit,reentry=require_proof_reentry(launchpath,launch,sys.argv[2])
 proof=RAW/'proof-01';proof.mkdir()
 write(proof/'PROOF_REENTRY.json',reentry)
 start=time.monotonic();now=datetime.datetime.now(datetime.timezone.utc)
 control=json.loads((RAW/'CONTROL_START.json').read_text());assert control['sourceHead']==head and control['oldCampaignClockReused'] is False
 enclosing=datetime.datetime.fromisoformat(control['deadlineUtc']);requested=now+datetime.timedelta(milliseconds=ACT['limits']['proofCampaignMs']);end=min(enclosing,requested)
 stop=end-datetime.timedelta(milliseconds=ACT['limits']['cleanupReserveMs']);deadline=start+(stop-now).total_seconds()
 commands=[];postimage=None;failure=None;conservation=None;retained_relation=None
 try:
  write(proof/'START.json',{'sourceHead':head,'startedUtc':now.isoformat(),'originalHostDeadlineUtc':enclosing.isoformat(),'requestedProofDeadlineUtc':requested.isoformat(),'deadlineUtc':end.isoformat(),'executionStopDeadlineUtc':stop.isoformat(),'cleanupReserveMs':ACT['limits']['cleanupReserveMs'],'noRetry':True,'qualified':False})
  assert time.monotonic()<deadline,'no remaining enclosing proof time'
  postimage=source_inventory(head);write(proof/'SOURCE_POSTIMAGE.json',postimage)
  assert audit['sourceDiffSha256']==hashlib.sha256(subprocess.check_output(['/usr/bin/git','-C',str(SOURCE),'diff','--binary','HEAD','--',*ACT['nativeWriteScope']])).hexdigest()
  dependency=json.loads((HERE/'DEPENDENCY_INPUTS.json').read_text());assert deps.inventory(dependency['path'])['sha256']==dependency['inventorySha256'];assert digest(SOURCE/REL/'package-lock.json')==dependency['lockSha256']
  reuse=json.loads((HERE/'BUILD_REUSE.json').read_text());build=bound_json(reuse['buildInventory']);source_inputs=bound_json(reuse['sourceInputs']);bound_json(reuse['priorSourcePostimage'])
  assert bound_json(reuse['priorBuildReturn'])['exitCode']==0
  bound_json(reuse['priorCampaignReturn'])
  assert reuse['exceptionPaths']==ACT['buildReuseExceptionPaths'] and len(reuse['exceptionPaths'])==17
  assert set(ACT['nativeWriteScope'])<=set(reuse['exceptionPaths'])
  for row in source_inputs['rows']:
   if row['path'] not in reuse['exceptionPaths']:assert digest(SOURCE/row['path'])==row['sha256'],row['path']
  preimage={r['path']:r for r in json.loads((RAW/'SOURCE_PREIMAGE.json').read_text())['rows']}
  for row in json.loads((HERE/'PRIOR_PARTIAL_SOURCE.json').read_text())['rows']:
   assert preimage[row['path']]['sha256']==row['sha256'],'accepted prior input '+row['path']
   if row['path'] not in ACT['nativeWriteScope']:assert digest(SOURCE/row['path'])==row['sha256'],'immutable prior source '+row['path']
  verify_inventory(reuse['buildRoot'],build['rows'])
  for row in reuse['derivedPayloadOutputs']:assert Path(row['source']).stat().st_size==row['bytes'] and digest(row['source'])==row['sha256']
  subject=Path(json.loads((HERE/'LAYOUT.json').read_text())['proofSubject']);assert not subject.exists(),'fresh proof subject only'
  pin=bound_json(ACT['builderPin'])
  layout=proof_layout(subject,SOURCE,Path(dependency['path']),Path(reuse['priorProofRoot']),Path(pin['installedRoot']),Path(pin['releaseRoot']),RAW,proof)
  write(proof/'TOPOLOGY_LAYOUT.json',layout)
  topology=json.loads(subprocess.check_output(['/usr/bin/python3',str(HERE/'physical-topology.py'),'-'],input=json.dumps(layout).encode(),timeout=60))
  write(proof/'TOPOLOGY.json',topology);assert topology['ok'] is True and topology['disposition']=='separated'
  subject.mkdir()
  for name in ['AGENTS.md','CLAUDE.md','stdo_abiogenesis.json']:shutil.copy2(SOURCE/name,subject/name)
  shutil.copytree(SOURCE/'specification',subject/'specification')
  tenant=subject/REL;tenant.parent.mkdir(parents=True);shutil.copytree(SOURCE/REL,tenant,ignore=shutil.ignore_patterns('node_modules','build','artifacts','qualification-scratch'))
  shutil.copytree(dependency['path'],tenant/'node_modules',symlinks=True);assert deps.inventory(tenant/'node_modules')['sha256']==dependency['inventorySha256']
  shutil.copytree(reuse['buildRoot'],tenant/'build');verify_inventory(tenant/'build',build['rows'])
  for row in reuse['derivedPayloadOutputs']:shutil.copy2(row['source'],tenant/row['path']);assert digest(tenant/row['path'])==row['sha256']
  retained=json.loads((HERE/'RETAINED_INPUTS.json').read_text());evidence=proof/'retained-inputs';evidence.mkdir()
  plan=json.loads((HERE/'PROOF_PLAN.json').read_text())
  retained_relation=retained_proof_relation(postimage,reuse,retained,plan);write(proof/'RETAINED_PROOF_RELATION.json',retained_relation)
  for row in retained['files']:
   src=Path(retained['sourceRoot'])/row['path'];dst=evidence/row['path'];assert src.stat().st_size==row['bytes'] and digest(src)==row['sha256'].removeprefix('sha256:')
   dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst);assert digest(dst)==digest(src)
  write(proof/'REUSE_AND_INPUTS_VERIFIED.json',{'buildInventorySha256':reuse['buildInventory']['sha256'],'sourceInputsSha256':reuse['sourceInputs']['sha256'],'derivedPayloadOutputs':reuse['derivedPayloadOutputs'],'requiredInputs':retained['files'],'priorProofUnchanged':True,'scope':'same exact compiled Product/native/dependencies with fresh selected test/falsifier source; no rebuild/requalification'})
  scratch=proof/'scratch'
  for suffix in ['tmp','npm-cache','observations','governance','currentness','c0']:(scratch/suffix).mkdir(parents=True)
  (scratch/'user.npmrc').write_text('');(scratch/'global.npmrc').write_text('')
  env={'HOME':'/Users/jim','PATH':'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin','LANG':'en_US.UTF-8','LC_ALL':'en_US.UTF-8','TMPDIR':str(scratch/'tmp'),'NODE_OPTIONS':'','GIT_OPTIONAL_LOCKS':'0','STDO_STORE':'/Users/jim/Library/Application Support/STDO','NPM_CONFIG_OFFLINE':'true','NPM_CONFIG_UPDATE_NOTIFIER':'false','NPM_CONFIG_USERCONFIG':str(scratch/'user.npmrc'),'NPM_CONFIG_GLOBALCONFIG':str(scratch/'global.npmrc'),'NPM_CONFIG_CACHE':str(scratch/'npm-cache'),'ABI5_EVIDENCE_ROOT':str(evidence),'ABG_REGRESSION_PROOF_ROOT':str(scratch/'observations'),'ABG_GOVERNANCE_COVERED_PROOF_ROOT':str(scratch/'governance'),'ABG_U1_EVIDENCE_DIR':str(scratch/'currentness'),'ABG_C0_PROOF_ROOT':str(scratch/'c0'),'ABI5_STEEL03_CLOSURE_PROOF_PATH':str(scratch/'steel-closure.json')}
  def run(name,argv,budget):
   assert shutil.disk_usage(RAW).free>ACT['limits']['reserveBytes']
   try:return owner.run(proof/name,argv,tenant,env,budget/1000,ACT['limits']['outputBytesPerCommand'],deadline)
   finally:
    receipt=proof/name/'RETURN.json'
    if receipt.is_file():
     result=json.loads(receipt.read_text());commands.append({'name':name,**result});print(json.dumps({'phase':'proof-command-return','name':name,'exitCode':result['exitCode'],'elapsedMs':result['elapsedMs']}),flush=True)
  for i,relative in enumerate(postimage['nativeChangedPaths'],1):run(f'syntax-{i:02d}',[NODE,'--check',str(subject/relative)],ACT['limits']['perStaticMs'])
  plan=json.loads((HERE/'PROOF_PLAN.json').read_text())
  assert len(plan['files'])==14 and [x['originalOrdinal'] for x in plan['files']]==list(range(3,17))
  for selection in plan['files']:
   i=selection['originalOrdinal'];name=f'{i:03d}-'+selection['file'].removesuffix('.test.mjs');directory=proof/name
   try:run(name,[NODE,'--experimental-vm-modules','--test','--test-concurrency=1','--test-timeout=1790000','--test-reporter=./scripts/node-test-evidence-reporter.mjs','test_env/tests/'+selection['file']],ACT['limits']['perTestFileMs'])
   finally:
    events=[]
    if (directory/'stdout.raw').is_file():
     for line in (directory/'stdout.raw').read_text(errors='replace').splitlines():
      try:value=json.loads(line)
      except (ValueError,TypeError):continue
      if isinstance(value,dict):events.append(value)
    if directory.is_dir():write(directory/'OBSERVED_CASES.json',{'file':selection['file'],'events':events,'completionOrSuccessNotAssumed':True})
    if directory.is_dir() and selection.get('requiredCandidateArtifacts'):
     captured=[]
     for relative in selection['requiredCandidateArtifacts']:
      candidate=scratch/'observations'/relative
      captured.append({'path':str(candidate),'present':candidate.is_file(),'bytes':candidate.stat().st_size if candidate.is_file() else None,'sha256':digest(candidate) if candidate.is_file() else None})
     write(directory/'CANDIDATE_RECORDS.json',{'records':captured,'missingIsNotSuccess':True})
   checked=checked_population(events,selection)
   for relative in selection.get('requiredCandidateArtifacts',[]):
    candidate=scratch/'observations'/relative
    assert candidate.is_file() and not candidate.is_symlink() and candidate.stat().st_size>0,'full preassert candidate missing '+relative
    assert isinstance(json.loads(candidate.read_text()),dict),'candidate must retain a complete structured record '+relative
   write(directory/'COUNTS.json',checked)
  verify_inventory(reuse['buildRoot'],build['rows']);verify_inventory(tenant/'build',build['rows'])
  for row in reuse['derivedPayloadOutputs']:assert digest(row['source'])==row['sha256'] and digest(tenant/row['path'])==row['sha256']
  assert deps.inventory(dependency['path'])['sha256']==dependency['inventorySha256']
  assert deps.inventory(tenant/'node_modules')['sha256']==dependency['inventorySha256']
  for row in retained['files']:
   assert digest(Path(retained['sourceRoot'])/row['path'])==row['sha256'].removeprefix('sha256:') and digest(evidence/row['path'])==row['sha256'].removeprefix('sha256:')
 except BaseException as error:
  failure={'name':type(error).__name__,'message':str(error)};write(proof/'FIRST_FAILURE.json',failure)
 finally:
  try:
   if postimage is not None:assert source_inventory(head)==postimage
   conservation={'sourceUnchangedThroughProof':postimage is not None,'setupCustodyReverified':postimage is not None}
  except BaseException as error:
   conservation={'sourceUnchangedThroughProof':False,'error':str(error)};failure=failure or {'name':type(error).__name__,'message':str(error)}
  completed=time.monotonic();completed_utc=datetime.datetime.now(datetime.timezone.utc)
  expired=completed>=start+(end-now).total_seconds() or completed_utc>=end
  if expired:
   failure=failure or {'name':'TimeoutError','message':'Original minimum host/proof deadline expired during finalization'}
   if not (proof/'FIRST_FAILURE.json').exists():write(proof/'FIRST_FAILURE.json',failure)
  result={'status':'passed' if failure is None else 'stopped_first_failure','sourceHead':head,'elapsedMs':round((time.monotonic()-start)*1000),'commands':commands,'failure':failure,'conservation':conservation,'originalHostDeadlineUtc':enclosing.isoformat(),'proofDeadlineUtc':end.isoformat(),'qualified':False,'retry':False,'retainedProofRelation':retained_relation,'freshFilePopulation':14,'retainedFilePopulation':2}
  result['finalDeadlineCheck']={'completedUtc':completed_utc.isoformat(),'expired':expired,'wallAndMonotonic':True}
  write(proof/'RETURN.json',result);print(json.dumps({'phase':'proof-return','status':result['status'],'commands':len(commands),'failure':failure}),flush=True)
 return 0 if failure is None else 1
if __name__=='__main__':sys.exit(main())
