#!/usr/bin/env python3
"""One serial affected-file proof on retained exact compiled payload; no build/retry."""
import datetime,hashlib,importlib.util,json,os,shutil,subprocess,sys,time
from pathlib import Path
sys.dont_write_bytecode=True
HERE=Path(__file__).resolve().parent
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

def main():
 assert len(sys.argv)==2,'explicit accepted launch packet required'
 launchpath=Path(sys.argv[1]);launch=json.loads(launchpath.read_text());head=launch['sourceHead']
 assert launch['activationId']==ACT['id'] and launch['dispatchAuthorized'] is True
 for row in launch['controls']:assert digest(HERE/row['path'])==row['sha256'],row['path']
 host=json.loads((RAW/'HOST_RETURN.json').read_text());final=json.loads((RAW/'runtime/FINAL.json').read_text());native=json.loads((RAW/'runtime/NATIVE_RETURN.json').read_text())
 assert host['exitCode']==0 and host['stopReason'] is None and host['cleanup']['hostProcessGroupAbsent']
 assert final['launched'] and final['actualResourceClose'] and final['failure'] is None and final['readbackFailure'] is None
 assert native['ownerOutput']['outcomeKind']=='result' and (RAW/'runtime/FRESH_READBACKS.json').is_file()
 audit=json.loads((RAW/'AUTHOR_AUDIT.json').read_text())
 assert audit['disposition']=='scope_and_commands_admitted' and audit['launchSha256']==digest(launchpath)
 assert audit['deviations']==[],'any deviation returns to Root before proof'
 proof=RAW/'proof-01';proof.mkdir()
 start=time.monotonic();now=datetime.datetime.now(datetime.timezone.utc)
 control=json.loads((RAW/'CONTROL_START.json').read_text());assert control['sourceHead']==head and control['oldCampaignClockReused'] is False
 enclosing=datetime.datetime.fromisoformat(control['deadlineUtc']);requested=now+datetime.timedelta(milliseconds=ACT['limits']['proofCampaignMs']);end=min(enclosing,requested)
 stop=end-datetime.timedelta(milliseconds=ACT['limits']['cleanupReserveMs']);deadline=start+(stop-now).total_seconds()
 commands=[];postimage=None;failure=None;conservation=None
 try:
  write(proof/'START.json',{'sourceHead':head,'startedUtc':now.isoformat(),'originalHostDeadlineUtc':enclosing.isoformat(),'requestedProofDeadlineUtc':requested.isoformat(),'deadlineUtc':end.isoformat(),'executionStopDeadlineUtc':stop.isoformat(),'cleanupReserveMs':ACT['limits']['cleanupReserveMs'],'noRetry':True,'qualified':False})
  assert time.monotonic()<deadline,'no remaining enclosing proof time'
  postimage=source_inventory(head);write(proof/'SOURCE_POSTIMAGE.json',postimage)
  assert audit['sourceDiffSha256']==hashlib.sha256(subprocess.check_output(['/usr/bin/git','-C',str(SOURCE),'diff','--binary','HEAD','--',*ACT['nativeWriteScope']])).hexdigest()
  dependency=json.loads((HERE/'DEPENDENCY_INPUTS.json').read_text());assert deps.inventory(dependency['path'])['sha256']==dependency['inventorySha256'];assert digest(SOURCE/REL/'package-lock.json')==dependency['lockSha256']
  reuse=json.loads((HERE/'BUILD_REUSE.json').read_text());build=bound_json(reuse['buildInventory']);source_inputs=bound_json(reuse['sourceInputs']);bound_json(reuse['priorSourcePostimage'])
  assert bound_json(reuse['priorBuildReturn'])['exitCode']==0
  bound_json(reuse['priorCampaignReturn'])
  for row in source_inputs['rows']:
   if row['path'] not in ACT['nativeWriteScope']:assert digest(SOURCE/row['path'])==row['sha256'],row['path']
  verify_inventory(reuse['buildRoot'],build['rows'])
  for row in reuse['derivedPayloadOutputs']:assert Path(row['source']).stat().st_size==row['bytes'] and digest(row['source'])==row['sha256']
  subject=Path(json.loads((HERE/'LAYOUT.json').read_text())['proofSubject']);assert not subject.exists(),'fresh proof subject only'
  pin=bound_json(ACT['builderPin'])
  protected=[str(SOURCE),str(Path(dependency['path'])),reuse['priorProofRoot'],pin['installedRoot'],pin['releaseRoot'],str(RAW/'runtime')]
  topology=json.loads(subprocess.check_output(['/usr/bin/python3',str(HERE/'physical-topology.py'),'-'],input=json.dumps({'worksite':str(subject),'writePaths':[str(subject)],'protectedRoots':protected,'archiveRoot':str(proof)}).encode(),timeout=60))
  write(proof/'TOPOLOGY.json',topology);assert topology['ok'] is True and topology['disposition']=='separated'
  subject.mkdir()
  for name in ['AGENTS.md','CLAUDE.md','stdo_abiogenesis.json']:shutil.copy2(SOURCE/name,subject/name)
  shutil.copytree(SOURCE/'specification',subject/'specification')
  tenant=subject/REL;tenant.parent.mkdir(parents=True);shutil.copytree(SOURCE/REL,tenant,ignore=shutil.ignore_patterns('node_modules','build','artifacts','qualification-scratch'))
  shutil.copytree(dependency['path'],tenant/'node_modules',symlinks=True);assert deps.inventory(tenant/'node_modules')['sha256']==dependency['inventorySha256']
  shutil.copytree(reuse['buildRoot'],tenant/'build');verify_inventory(tenant/'build',build['rows'])
  for row in reuse['derivedPayloadOutputs']:shutil.copy2(row['source'],tenant/row['path']);assert digest(tenant/row['path'])==row['sha256']
  retained=json.loads((HERE/'RETAINED_INPUTS.json').read_text());evidence=proof/'retained-inputs';evidence.mkdir()
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
  for i,selection in enumerate(plan['files'],1):
   name=f'{i:03d}-'+selection['file'].removesuffix('.test.mjs');directory=proof/name
   try:run(name,[NODE,'--experimental-vm-modules','--test','--test-concurrency=1','--test-timeout=1790000','--test-reporter=./scripts/node-test-evidence-reporter.mjs','test_env/tests/'+selection['file']],ACT['limits']['perTestFileMs'])
   finally:
    events=[]
    if (directory/'stdout.raw').is_file():
     for line in (directory/'stdout.raw').read_text(errors='replace').splitlines():
      try:value=json.loads(line)
      except (ValueError,TypeError):continue
      if isinstance(value,dict):events.append(value)
    if directory.is_dir():write(directory/'OBSERVED_CASES.json',{'file':selection['file'],'events':events,'completionOrSuccessNotAssumed':True})
   summaries=[x for x in events if x.get('type')=='summary' and x.get('file') is None];cases=[x for x in events if x.get('type')=='case' and not x.get('suite')];top=[x['name'] for x in cases if x.get('nesting')==0]
   assert len(summaries)==1 and summaries[0]['success'] is True and any(x.get('type')=='end' for x in events),summaries
   assert len(top)>=selection['minimumTopLevelCases'] and all(x in top for x in selection['preservedTitles']),('population conservation',selection['file'],top)
   assert cases and all(x['passed'] and not x.get('todo') for x in cases)
   skips={x['name']:x['skip'] for x in cases if x.get('skip')};expected=selection['optionalSkipReasonIncludes']
   assert set(skips)==set(expected) and all(expected[n] in str(v) for n,v in skips.items()),('required positive skipped or unexpected historical skip',skips)
   write(directory/'COUNTS.json',{'file':selection['file'],'summary':summaries[0],'cases':cases,'requiredPositiveCasesExecuted':True})
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
  result={'status':'passed' if failure is None else 'stopped_first_failure','sourceHead':head,'elapsedMs':round((time.monotonic()-start)*1000),'commands':commands,'failure':failure,'conservation':conservation,'originalHostDeadlineUtc':enclosing.isoformat(),'proofDeadlineUtc':end.isoformat(),'qualified':False,'retry':False}
  write(proof/'RETURN.json',result);print(json.dumps({'phase':'proof-return','status':result['status'],'commands':len(commands),'failure':failure}),flush=True)
 return 0 if failure is None else 1
if __name__=='__main__':sys.exit(main())
