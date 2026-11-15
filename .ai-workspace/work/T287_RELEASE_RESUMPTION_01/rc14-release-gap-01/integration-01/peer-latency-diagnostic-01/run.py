#!/usr/bin/env python3
"""Held, one-pass serial seven-file diagnostic; unchanged tests and child/case bounds."""
import datetime,hashlib,importlib.util,json,os,shutil,subprocess,sys,time
from pathlib import Path
sys.dont_write_bytecode=True
HERE=Path(__file__).resolve().parent
ACT=json.loads((HERE/'ACTIVATION.json').read_text())
SOURCE=Path(ACT['sourceWorktree']);RAW=Path(ACT['rawRoot']);REL=Path('build_tenants/abiogenesis/typescript')
NODE='/opt/homebrew/bin/node'
def module(name,filename):
 spec=importlib.util.spec_from_file_location(name,HERE/filename);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
owner=module('finite_owner','process-owner.py');deps=module('dependency_inventory','dependency-inputs.py')
write=owner.write
def digest(path):
 h=hashlib.sha256()
 with Path(path).open('rb') as f:
  for chunk in iter(lambda:f.read(8388608),b''):h.update(chunk)
 return h.hexdigest()
def pin(path):
 p=Path(path);return {'path':str(p),'bytes':p.stat().st_size,'sha256':digest(p)}
def bound(row):
 assert digest(row['path'])==row['sha256'],row['path'];return json.loads(Path(row['path']).read_text())
def tree(root):
 rows=[]
 for p in sorted(Path(root).rglob('*')):
  assert not p.is_symlink(),str(p)
  if p.is_file():rows.append({'path':str(p.relative_to(root)),'bytes':p.stat().st_size,'sha256':digest(p)})
 return rows
def git(*args):return subprocess.check_output(['/usr/bin/git','-C',str(SOURCE),*args])
def source_rows():
 paths=[p.decode() for p in git('ls-tree','-rz','--name-only','HEAD','--',str(REL)).split(b'\0') if p]
 return [{'path':p,'bytes':(SOURCE/p).stat().st_size,'sha256':digest(SOURCE/p)} for p in paths]
def diagnostic_custody(trace):
 # Read only. A missing observation does not claim descendant absence.
 pids=set();errors=[]
 for p in trace.glob('process-*/*-spawn.json'):
  x=json.loads(p.read_text());
  if isinstance(x.get('pid'),int):pids.add(x['pid'])
 for p in trace.glob('process-*/PROCESS_END.json'):
  errors.extend(json.loads(p.read_text()).get('observerFailures',[]))
 alive=[]
 if pids:
  r=subprocess.run(['/bin/ps','-p',','.join(map(str,sorted(pids))),'-o','pid=,ppid=,pgid=,stat=,lstart=,comm='],capture_output=True,text=True,timeout=5)
  assert r.returncode in [0,1],r.stderr
  for line in r.stdout.splitlines():
   if line.strip():alive.append({'pid':int(line.split()[0]),'observation':line.strip(),'identityLimit':'No PID-reuse inference; any live observation stops independent continuation.'})
 return {'knownChildPids':sorted(pids),'livePidObservations':alive,'observerFailures':errors,
  'scope':'Known subscriber-observed children only, plus maintained owner process-group closure; no universal detached-descendant proof.'}
def main():
 assert len(sys.argv)==2,'Root accepted launch packet is required; preparation never executes this runner'
 launchpath=Path(sys.argv[1]);launch=json.loads(launchpath.read_text())
 assert launch['activationId']==ACT['id'] and launch['dispatchAuthorized'] is True
 assert launch['sourceHead']==git('rev-parse','HEAD').decode().strip()
 assert git('status','--porcelain=v1')==b'','clean frozen branch required'
 for row in launch['controls']:assert digest(HERE/row['path'])==row['sha256'],row['path']
 assert launch['controlManifestSha256']==digest(HERE/'CONTROL_MANIFEST.json')
 assert launch['nodeSha256']==digest(Path(NODE).resolve())
 proof=RAW/'diagnostic-01';proof.mkdir()
 started=datetime.datetime.now(datetime.timezone.utc);clock=time.monotonic()
 end=datetime.datetime.fromisoformat(launch['deadlineUtc'])
 assert 0<(end-started).total_seconds()<=ACT['limits']['enclosingMs']/1000
 stop=end-datetime.timedelta(milliseconds=ACT['limits']['cleanupReserveMs'])
 deadline=clock+(stop-started).total_seconds();rows=[];failure=None;original=None;subject=None
 write(proof/'CONTROL_START.json',{'sourceHead':launch['sourceHead'],'launch':pin(launchpath),'startedUtc':started.isoformat(),
  'deadlineUtc':end.isoformat(),'executionStopUtc':stop.isoformat(),'oldClockReused':False,'qualified':False})
 try:
  source_binding=json.loads((HERE/'SOURCE_BINDING.json').read_text())
  original=source_rows();expected=bound(source_binding['tenantInventory'])
  assert original==expected['rows'],'source/test/helper/fixture bytes changed'
  authority=bound(source_binding['authorityInventory'])['rows']
  for row in authority:assert digest(SOURCE/row['path'])==row['sha256'],row['path']
  write(proof/'SOURCE_PREIMAGE.json',{'sourceHead':launch['sourceHead'],'rows':original})
  reuse=json.loads((HERE/'BUILD_REUSE.json').read_text());build=bound(reuse['buildInventory']);inputs=bound(reuse['sourceInputs'])
  bound(reuse['priorSourcePostimage']);assert bound(reuse['priorBuildReturn'])['exitCode']==0;bound(reuse['priorCampaignReturn'])
  assert tree(reuse['buildRoot'])==build['rows']
  for row in inputs['rows']:assert digest(SOURCE/row['path'])==row['sha256'],row['path']
  dependency=json.loads((HERE/'DEPENDENCY_INPUTS.json').read_text())
  assert deps.inventory(dependency['path'])['sha256']==dependency['inventorySha256']
  assert digest(SOURCE/REL/'package-lock.json')==dependency['lockSha256']
  subject=proof/'subject';protected=[str(SOURCE),dependency['path'],reuse['priorProofRoot']]
  observed=json.loads(subprocess.check_output(['/usr/bin/python3',str(HERE/'physical-topology.py'),'-'],
   input=json.dumps({'worksite':str(subject),'writePaths':[str(subject)],'protectedRoots':protected,'archiveRoot':str(proof)}).encode(),timeout=60))
  write(proof/'TOPOLOGY.json',observed);assert observed['ok'] is True and observed['disposition']=='separated'
  subject.mkdir();tenant=subject/REL;tenant.mkdir(parents=True)
  for row in original:
   destination=subject/row['path'];destination.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(SOURCE/row['path'],destination)
  for name in ['AGENTS.md','CLAUDE.md','stdo_abiogenesis.json']:shutil.copy2(SOURCE/name,subject/name)
  shutil.copytree(SOURCE/'specification',subject/'specification')
  shutil.copytree(reuse['buildRoot'],tenant/'build');assert tree(tenant/'build')==build['rows']
  shutil.copytree(dependency['path'],tenant/'node_modules',symlinks=True);assert deps.inventory(tenant/'node_modules')['sha256']==dependency['inventorySha256']
  for row in reuse['derivedPayloadOutputs']:
   assert digest(row['source'])==row['sha256'];shutil.copy2(row['source'],tenant/row['path']);assert digest(tenant/row['path'])==row['sha256']
  retained=json.loads((HERE/'RETAINED_INPUTS.json').read_text());evidence=proof/'retained-inputs';evidence.mkdir()
  for row in retained['files']:
   src=Path(retained['sourceRoot'])/row['path'];dst=evidence/row['path'];assert src.stat().st_size==row['bytes'] and digest(src)==row['sha256']
   dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst);assert digest(dst)==row['sha256']
  scratch=proof/'scratch';scratch.mkdir();(scratch/'tmp').mkdir();(scratch/'user.npmrc').write_text('');(scratch/'global.npmrc').write_text('')
  env={'HOME':'/Users/jim','PATH':'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin','LANG':'en_US.UTF-8','LC_ALL':'en_US.UTF-8',
   'TMPDIR':str(scratch/'tmp'),'NODE_OPTIONS':'','GIT_OPTIONAL_LOCKS':'0','STDO_STORE':'/Users/jim/Library/Application Support/STDO',
   'NPM_CONFIG_OFFLINE':'true','NPM_CONFIG_UPDATE_NOTIFIER':'false','NPM_CONFIG_USERCONFIG':str(scratch/'user.npmrc'),
   'NPM_CONFIG_GLOBALCONFIG':str(scratch/'global.npmrc'),'NPM_CONFIG_CACHE':str(scratch/'npm-cache'),'ABI5_EVIDENCE_ROOT':str(evidence)}
  write(proof/'ENVIRONMENT.json',env)
  plan=json.loads((HERE/'POPULATION.json').read_text())
  for i,selection in enumerate(plan['files'],1):
   assert time.monotonic()<deadline and shutil.disk_usage(RAW).free>ACT['limits']['reserveBytes']
   directory=proof/(str(i).zfill(3)+'-'+selection['file'].removesuffix('.test.mjs'))
   # The maintained owner creates the command directory. The subscriber's sink
   # is a separate already-created sibling so no setup mutates test resources.
   trace=proof/(str(i).zfill(3)+'-children');trace.mkdir()
   childenv={**env,'ABG_PEER_DIAGNOSTIC_ROOT':str(trace)}
   argv=[NODE,'--import',(HERE/'child-observer.mjs').as_uri(),'--experimental-vm-modules','--test','--test-concurrency=1',
    '--test-reporter=./scripts/node-test-evidence-reporter.mjs','test_env/tests/'+selection['file']]
   command_error=None
   try:owner.run(directory,argv,tenant,childenv,ACT['limits']['perFileMs']/1000,ACT['limits']['outputBytesPerFile'],deadline)
   except AssertionError as error:command_error=str(error)
   # Raw captures and receipts precede interpretation, including every red.
   assert (directory/'RETURN.json').is_file(),'process owner failed without a complete command receipt'
   receipt=json.loads((directory/'RETURN.json').read_text())
   observed=[]
   for line in (directory/'stdout.raw').read_text(errors='replace').splitlines():
    try:value=json.loads(line)
    except (ValueError,TypeError):continue
    if isinstance(value,dict):observed.append(value)
   write(directory/'OBSERVED_EVENTS.json',{'file':selection['file'],'events':observed,'semanticAcceptance':False})
   custody=diagnostic_custody(trace)
   write(directory/'CHILD_CUSTODY.json',custody)
   captures=tree(trace);write(directory/'DIAGNOSTIC_CAPTURES.json',{'root':str(trace),'files':captures})
   assert any(x['path'].endswith('/PROCESS.json') for x in captures),'subscriber was not acquired'
   row={'file':selection['file'],'process':receipt,'commandAssertion':command_error,'custody':custody,
    'summaries':[x for x in observed if x.get('type')=='summary'],'eventFramingComplete':any(x.get('type')=='end' for x in observed)}
   rows.append(row);write(directory/'DIAGNOSTIC_RETURN.json',row)
   if (receipt['exitCode']!=0 or receipt['stopReason'] is not None) and not (proof/'FIRST_FAILURE.json').exists():write(proof/'FIRST_FAILURE.json',row)
   print(json.dumps({'file':selection['file'],'exitCode':receipt['exitCode'],'elapsedMs':receipt['elapsedMs'],'diagnosticContinuesAfterClosedRed':True}),flush=True)
   assert receipt['cleanup']['processGroupAbsent'] and not custody['livePidObservations'],'resource closure remains unresolved'
   assert not custody['observerFailures'],'diagnostic observer failed; no claimed equivalence'
   assert receipt['stopReason'] in [None,'deadline'],'output/resource failure is not an expected case red'
  assert tree(reuse['buildRoot'])==build['rows'] and tree(tenant/'build')==build['rows']
  assert deps.inventory(dependency['path'])['sha256']==dependency['inventorySha256']
  for row in retained['files']:assert digest(Path(retained['sourceRoot'])/row['path'])==row['sha256'] and digest(evidence/row['path'])==row['sha256']
  for row in authority:assert digest(SOURCE/row['path'])==row['sha256'],row['path']
 except BaseException as error:
  failure={'name':type(error).__name__,'message':str(error)}
  if not (proof/'FIRST_FAILURE.json').exists():write(proof/'FIRST_FAILURE.json',failure)
 finally:
  try:conserved=original is not None and source_rows()==original
  except BaseException as error:
   conserved=False;failure=failure or {'name':type(error).__name__,'message':str(error)}
  write(proof/'RETURN.json',{'disposition':'diagnostic_population_completed' if failure is None and len(rows)==7 and conserved else 'stopped_incomplete',
   'sourceHead':launch['sourceHead'],'sourceConserved':conserved,'rows':rows,'failure':failure,'completedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),
   'deadlineUtc':end.isoformat(),'withinDeadline':datetime.datetime.now(datetime.timezone.utc)<end,
   'qualification':False,'claims':'Diagnostic observations under unchanged source and child/case budgets; no automatic red-to-green conversion or peer evidence union.'})
 return 0 if failure is None and len(rows)==7 and conserved else 1
if __name__=='__main__':raise SystemExit(main())
