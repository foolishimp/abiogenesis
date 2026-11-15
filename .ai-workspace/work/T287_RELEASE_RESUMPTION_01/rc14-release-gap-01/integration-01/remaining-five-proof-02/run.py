#!/usr/bin/env python3
"""Five selected whole files after input repair; accepted07 owners, fresh clock."""
import datetime,hashlib,importlib.util,json,os,shutil,subprocess,sys,time
from pathlib import Path
sys.dont_write_bytecode=True
HERE=Path(__file__).resolve().parent
REL=Path('build_tenants/abiogenesis/typescript')
def read(path):return json.loads(Path(path).read_text())
def sha(path):
 h=hashlib.sha256()
 with Path(path).open('rb') as f:
  for b in iter(lambda:f.read(8388608),b''):h.update(b)
 return h.hexdigest()
def pinned(row):
 p=Path(row['path']);assert p.is_file() and not p.is_symlink() and p.stat().st_size==row['bytes'] and sha(p)==row['sha256'],row['path']
def write(path,value):
 with Path(path).open('x') as f:json.dump(value,f,indent=2);f.write('\n')
def load(path):
 spec=importlib.util.spec_from_file_location('accepted07_proof',path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
def main():
 assert len(sys.argv)==2,'Root accepted binding required'
 a=read(HERE/'ACTIVATION.json');inputs=read(HERE/'INPUTS.json');plan=read(HERE/'PROOF_PLAN.json')
 binding_path=Path(sys.argv[1]);b=read(binding_path)
 assert b['executionAuthorized'] is True and b['executionGrant'] and b['oldCampaignClockReused'] is False
 assert b['activationId']==a['id'] and b['sourceCommit']==a['sourceCommit']
 assert sha(HERE/'CONTROL_MANIFEST.json')==b['controlManifestSha256']
 manifest=read(HERE/'CONTROL_MANIFEST.json')
 for row in manifest['files']:pinned({**row,'path':str(HERE/row['path'])})
 for row in inputs['retainedControls']:pinned(row)
 for row in inputs['records'].values():pinned(row)
 pinned(inputs['builderPin']);pinned(inputs['node']);pinned(inputs['python'])
 assert Path(inputs['nodeSelection']).resolve()==Path(inputs['node']['path'])
 assert Path(sys.executable).resolve()==Path(inputs['python']['path'])
 source=Path(a['sourceWorktree']);retained_control=Path(a['retainedControlRoot']);old_raw=Path(a['originalRawRoot'])
 raw=Path(a['rawRoot']);subject=Path(a['proofSubject'])
 assert not raw.exists() and not subject.exists(),'Fresh output and subject required; no retry'
 for p in [source,retained_control,old_raw,raw,subject]:assert p.is_absolute() and p.resolve()==p,str(p)
 now=datetime.datetime.now(datetime.timezone.utc);started=time.monotonic()
 end=datetime.datetime.fromisoformat(b['deadlineUtc'].replace('Z','+00:00'))
 allowance=(end-now).total_seconds();assert 15<allowance<=a['limits']['enclosingMs']/1000
 final_deadline=started+allowance;execution_deadline=final_deadline-a['limits']['cleanupReserveMs']/1000
 def live(final=False):
  assert time.monotonic()<(final_deadline if final else execution_deadline) and datetime.datetime.now(datetime.timezone.utc)<end,'Original60min wall/monotonic deadline exhausted'
 raw.mkdir();proof=raw/'proof-01';proof.mkdir();write(raw/'BINDING.json',b)
 write(raw/'CONTROL_START.json',{'startedUtc':now.isoformat(),'deadlineUtc':end.isoformat(),'maximumMs':a['limits']['enclosingMs'],'cleanupReserveMs':a['limits']['cleanupReserveMs'],'oldCampaignClockReused':False})
 base=load(retained_control/'prove.py');owner=base.owner;deps=base.deps
 assert base.SOURCE==source and base.RAW==old_raw
 prior=read(inputs['records']['postimage']['path']);closure=read(inputs['records']['rootClosure']['path'])
 assert prior['head']==a['originalAuthorHead'] and closure['sourceCommit']==a['sourceCommit']
 assert closure['status']=='stopped_first_failure' and closure['unrunOriginalOrdinals']==list(range(11,17))
 assert read(inputs['records']['proofReturn']['path'])['conservation']['sourceUnchangedThroughProof']
 def git(*args):
  live(final=True)
  return subprocess.check_output(['/usr/bin/git','-C',str(source),*args],timeout=max(.1,min(30,final_deadline-time.monotonic())))
 def source_inventory():
  assert git('rev-parse','HEAD').decode().strip()==a['sourceCommit']
  assert git('rev-parse','HEAD^{tree}').decode().strip()==a['sourceTree']
  assert git('diff','--name-only',a['originalAuthorHead'],a['sourceCommit']).decode().splitlines()==base.ACT['nativeWriteScope'],'Commit transition exceeds the closed native07 subject'
  assert git('diff','--name-only','-z')==git('diff','--cached','--name-only','-z')==b''
  others=[x.decode() for x in git('ls-files','--others','--exclude-standard','-z').split(b'\0') if x]
  assert others==['.abiogenesis/workspace-manifest.json'],others
  setup=base.custody.verify(source,old_raw,a['originalAuthorHead'])
  names=[x.decode() for x in git('ls-files','-z').split(b'\0') if x]+others;rows=[]
  for name in sorted(set(names)):
   live(final=True);p=source/name
   if not p.exists():continue
   assert p.is_file() and not p.is_symlink(),name
   rows.append({'path':name,'bytes':p.stat().st_size,'sha256':sha(p),'executable':bool(p.stat().st_mode&0o111)})
  assert rows==prior['rows'] and len(rows)==inputs['sourceRowCount'],'Committed source differs from frozen physical postimage'
  return {'head':a['sourceCommit'],'tree':a['sourceTree'],'originalAuthorHead':a['originalAuthorHead'],'rows':rows,'setup':setup}
 def control_inputs():
  rows=[*inputs['retainedControls'],*inputs['records'].values(),inputs['builderPin'],inputs['node'],inputs['python'],a['authority']]
  rows += [{**r,'path':str(HERE/r['path'])} for r in manifest['files']]
  for row in rows:live(final=True);pinned(row)
  assert sha(binding_path)==sha(raw/'BINDING.json') and sha(HERE/'CONTROL_MANIFEST.json')==b['controlManifestSha256']
  return {'files':len(rows),'allPinsMatched':True,'manifestSha256':b['controlManifestSha256'],'bindingSha256':sha(binding_path)}
 commands=[];failure=None;post=None;mirror=None;initialized=False;conservation=None;secondary=[]
 try:
  controls_before=control_inputs();post=source_inventory();write(proof/'SOURCE_ENTRY.json',post);live()
  dependency=read(retained_control/'DEPENDENCY_INPUTS.json');reuse=read(retained_control/'BUILD_REUSE.json');retained=read(HERE/'RETAINED_INPUTS.json')
  build=base.bound_json(reuse['buildInventory']);source_inputs=base.bound_json(reuse['sourceInputs'])
  assert base.bound_json(reuse['priorBuildReturn'])['exitCode']==0
  assert len(reuse['exceptionPaths'])==17
  for row in source_inputs['rows']:
   if row['path'] not in reuse['exceptionPaths']:assert sha(source/row['path'])==row['sha256'],row['path']
  assert deps.inventory(dependency['path'])['sha256']==dependency['inventorySha256']
  assert sha(source/REL/'package-lock.json')==dependency['lockSha256']
  base.verify_inventory(reuse['buildRoot'],build['rows'])
  for row in reuse['derivedPayloadOutputs']:pinned({'path':row['source'],'bytes':row['bytes'],'sha256':row['sha256']})
  for row in retained['files']:pinned({**row,'path':str(Path(retained['sourceRoot'])/row['path'])})
  assert len(retained['files'])==8 and retained['files'][:7]==read(retained_control/'RETAINED_INPUTS.json')['files']
  selections=plan['files'];assert [x['originalOrdinal'] for x in selections]==list(range(12,17))
  old_selections={x['originalOrdinal']:x for x in read(retained_control/'PROOF_PLAN.json')['files']}
  for selection in selections:
   assert selection==old_selections[selection['originalOrdinal']]
   assert sha(source/selection['path'])==selection['preimageSha256']
  scratch=proof/'scratch'
  for suffix in ['tmp','npm-cache','observations','governance','currentness','c0']:(scratch/suffix).mkdir(parents=True)
  (scratch/'user.npmrc').write_text('');(scratch/'global.npmrc').write_text('')
  evidence=proof/'retained-inputs'
  env={'HOME':'/Users/jim','PATH':'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin','LANG':'en_US.UTF-8','LC_ALL':'en_US.UTF-8','TMPDIR':str(scratch/'tmp'),'NODE_OPTIONS':'','GIT_OPTIONAL_LOCKS':'0','STDO_STORE':'/Users/jim/Library/Application Support/STDO','NPM_CONFIG_OFFLINE':'true','NPM_CONFIG_UPDATE_NOTIFIER':'false','NPM_CONFIG_USERCONFIG':str(scratch/'user.npmrc'),'NPM_CONFIG_GLOBALCONFIG':str(scratch/'global.npmrc'),'NPM_CONFIG_CACHE':str(scratch/'npm-cache'),'ABI5_EVIDENCE_ROOT':str(evidence),'ABG_REGRESSION_PROOF_ROOT':str(scratch/'observations'),'ABG_GOVERNANCE_COVERED_PROOF_ROOT':str(scratch/'governance'),'ABG_U1_EVIDENCE_DIR':str(scratch/'currentness'),'ABG_C0_PROOF_ROOT':str(scratch/'c0'),'ABI5_STEEL03_CLOSURE_PROOF_PATH':str(scratch/'steel-closure.json')}
  def run(name,argv,budget,cwd):
   live();assert shutil.disk_usage(raw).free>a['limits']['reserveBytes']
   try:return owner.run(proof/name,argv,cwd,env,budget/1000,a['limits']['outputBytesPerCommand'],execution_deadline)
   finally:
    receipt=proof/name/'RETURN.json'
    if receipt.is_file():
     result=read(receipt);commands.append({'name':name,**result});print(json.dumps({'phase':'command-return','name':name,'exitCode':result['exitCode'],'elapsedMs':result['elapsedMs']}),flush=True)
  pin=read(inputs['builderPin']['path'])
  layout=base.proof_layout(subject,source,Path(dependency['path']),Path(reuse['priorProofRoot']),Path(pin['installedRoot']),Path(pin['releaseRoot']),raw,proof)
  layout['protectedRoots']+= [str(HERE),str(old_raw),retained['sourceRoot'],str(Path(inputs['records']['previousProofReturn']['path']).parent.parent)]
  write(proof/'TOPOLOGY_LAYOUT.json',layout)
  run('topology',[str(inputs['python']['path']),str(retained_control/'physical-topology.py'),str(proof/'TOPOLOGY_LAYOUT.json')],60000,source)
  topology=read(proof/'topology/stdout.raw');assert topology['ok'] is True and topology['disposition']=='separated'
  live();subject.mkdir()
  for name in ['AGENTS.md','CLAUDE.md','stdo_abiogenesis.json']:shutil.copy2(source/name,subject/name)
  shutil.copytree(source/'specification',subject/'specification')
  tenant=subject/REL;tenant.parent.mkdir(parents=True);shutil.copytree(source/REL,tenant,ignore=shutil.ignore_patterns('node_modules','build','artifacts','qualification-scratch'))
  shutil.copytree(dependency['path'],tenant/'node_modules',symlinks=True);assert deps.inventory(tenant/'node_modules')['sha256']==dependency['inventorySha256']
  shutil.copytree(reuse['buildRoot'],tenant/'build');base.verify_inventory(tenant/'build',build['rows'])
  for row in reuse['derivedPayloadOutputs']:shutil.copy2(row['source'],tenant/row['path']);assert sha(tenant/row['path'])==row['sha256']
  evidence.mkdir()
  for row in retained['files']:
   live();src=Path(retained['sourceRoot'])/row['path'];dst=evidence/row['path'];dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst);assert sha(dst)==row['sha256']
  def mirror_source():
   rows=[];derived={str(REL/r['path']):r for r in reuse['derivedPayloadOutputs']}
   for row in post['rows']:
    name=row['path']
    if not (name.startswith(str(REL)+'/') or name.startswith('specification/') or name in ['AGENTS.md','CLAUDE.md','stdo_abiogenesis.json']):continue
    live(final=True);p=subject/name;assert p.is_file() and not p.is_symlink(),name
    actual={'path':name,'bytes':p.stat().st_size,'sha256':sha(p),'executable':bool(p.stat().st_mode&0o111)}
    expected={**row,**({k:derived[name][k] for k in ['bytes','sha256']} if name in derived else {})}
    assert actual==expected,'Proof subject source changed '+name;rows.append(actual)
   return rows
  mirror=mirror_source();write(proof/'MIRROR_SOURCE_ENTRY.json',{'rows':mirror});initialized=True
  write(proof/'INPUTS_ENTRY.json',{'controls':controls_before,'buildInventorySha256':reuse['buildInventory']['sha256'],'sourceInputsSha256':reuse['sourceInputs']['sha256'],'dependencies':dependency['inventorySha256'],'derived':reuse['derivedPayloadOutputs'],'requiredInputs':retained['files'],'sourceCommit':a['sourceCommit'],'newClock':True})
  for selection in selections:
   name=f"{selection['originalOrdinal']:03d}-"+selection['file'].removesuffix('.test.mjs');directory=proof/name
   try:run(name,[base.NODE,'--experimental-vm-modules','--test','--test-concurrency=1','--test-timeout=1790000','--test-reporter=./scripts/node-test-evidence-reporter.mjs','test_env/tests/'+selection['file']],a['limits']['perTestFileMs'],tenant)
   finally:
    events=[]
    if (directory/'stdout.raw').is_file():
     for line in (directory/'stdout.raw').read_text(errors='replace').splitlines():
      try:value=json.loads(line)
      except (ValueError,TypeError):continue
      if isinstance(value,dict):events.append(value)
    if directory.is_dir():write(directory/'OBSERVED_CASES.json',{'file':selection['file'],'events':events,'completionOrSuccessNotAssumed':True})
    if directory.is_dir() and selection.get('requiredCandidateArtifacts'):
     rows=[]
     for name in selection['requiredCandidateArtifacts']:
      p=scratch/'observations'/name;rows.append({'path':str(p),'present':p.is_file(),'bytes':p.stat().st_size if p.is_file() else None,'sha256':sha(p) if p.is_file() else None})
     write(directory/'CANDIDATE_RECORDS.json',{'records':rows,'missingIsNotSuccess':True})
   checked=base.checked_population(events,selection)
   for name in selection.get('requiredCandidateArtifacts',[]):
    p=scratch/'observations'/name;assert p.is_file() and not p.is_symlink() and p.stat().st_size>0 and isinstance(read(p),dict)
   write(directory/'COUNTS.json',checked)
 except BaseException as error:
  failure={'name':type(error).__name__,'message':str(error)};write(proof/'FIRST_FAILURE.json',failure)
 finally:
  if initialized:
   try:
    conservation=base.final_input_conservation(reuse,build,dependency,retained,tenant,evidence,final_deadline,end)
    secondary.extend(conservation['secondaryErrors'])
   except BaseException as error:
    secondary.append({'stage':'final_input_conservation','name':type(error).__name__,'message':str(error)})
    conservation={'status':'failed','error':secondary[-1]}
   try:
    final_mirror=mirror_source();write(proof/'MIRROR_SOURCE_EXIT.json',{'rows':final_mirror});assert final_mirror==mirror
   except BaseException as error:secondary.append({'stage':'mirror_source','name':type(error).__name__,'message':str(error)})
  else:conservation={'status':'not_initialized','reason':'Complete fixture copies not established; no whole-input conservation claim'}
  try:
   if post is not None:
    final_source=source_inventory();write(proof/'SOURCE_EXIT.json',final_source);assert final_source==post
   final_controls=control_inputs();write(proof/'INPUTS_EXIT.json',final_controls);live(final=True)
  except BaseException as error:secondary.append({'stage':'source_controls','name':type(error).__name__,'message':str(error)})
  if secondary:failure=failure or secondary[0]
  expired=time.monotonic()>=final_deadline or datetime.datetime.now(datetime.timezone.utc)>=end
  if expired:failure=failure or {'name':'TimeoutError','message':'Original60min deadline expired during finalization'}
  if failure is not None and not (proof/'FIRST_FAILURE.json').exists():write(proof/'FIRST_FAILURE.json',failure)
  result={'status':'passed' if failure is None else 'stopped_first_failure','sourceCommit':a['sourceCommit'],'elapsedMs':round((time.monotonic()-started)*1000),'commands':commands,'failure':failure,'conservation':conservation,'secondaryErrors':secondary,'sourceUnchanged':post is not None and not any(x.get('stage')=='source_controls' for x in secondary),'mirrorSourceConserved':initialized and not any(x.get('stage')=='mirror_source' for x in secondary),'deadlineUtc':end.isoformat(),'expired':expired,'freshFilePopulation':5,'originalOrdinals':list(range(12,17)),'previouslyUnrunOriginalOrdinals':list(range(13,17)),'priorAcquisitionFailureOriginalOrdinals':[12],'separatelyRetainedOriginalOrdinals':[11],'retainedFilePopulation':0,'qualified':False,'retry':False,'providerCalls':0,'builds':0}
  write(proof/'RETURN.json',result);print(json.dumps({'phase':'proof-return','status':result['status'],'failure':failure}),flush=True)
 return 0 if failure is None else 1
if __name__=='__main__':sys.exit(main())
