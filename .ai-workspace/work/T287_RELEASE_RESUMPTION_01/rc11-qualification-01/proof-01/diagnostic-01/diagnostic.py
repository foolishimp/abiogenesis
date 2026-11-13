from pathlib import Path
import os,sys,json,hashlib,shutil,subprocess,time,signal,re
O=Path(__file__).resolve().parent

def sha(b): return hashlib.sha256(b).hexdigest()
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':sha(b)}
def checked(r):
 assert pin(r['path'])=={k:r[k] for k in ['path','bytes','sha256']},r['path'];return Path(r['path']).read_bytes()
def save(p,x):
 with Path(p).open('x') as f:json.dump(x,f,indent=2);f.write('\n')
def safe(p):
 assert p and not Path(p).is_absolute() and '..' not in Path(p).parts and '\0' not in p;return p
def rows_at(root,rows):
 got=[]
 for row in rows:
  p=root/safe(row['path']);assert p.is_file() and not p.is_symlink(),str(p);b=p.read_bytes();got.append({'path':row['path'],'bytes':len(b),'sha256':sha(b)})
 return got
def same_source(root,rows):
 got=rows_at(root,rows);assert got==rows,'frozen source changed '+str(root);return sha(json.dumps(got,separators=(',',':'),ensure_ascii=False).encode())
def verify_tree(inv):
 root=Path(inv['root']);seen=[]
 for d,dirs,files in os.walk(root,followlinks=False):
  for name in list(dirs):
   p=Path(d)/name
   if p.is_symlink():seen.append(p.relative_to(root).as_posix());dirs.remove(name)
  seen.extend((Path(d)/n).relative_to(root).as_posix() for n in files)
 assert sorted(seen)==sorted(r['path'] for r in inv['rows']),'tree paths differ '+str(root)
 for r in inv['rows']:
  p=root/safe(r['path'])
  if r['kind']=='symlink':
   assert p.is_symlink() and os.readlink(p)==r['target'];assert p.resolve().is_relative_to(root.resolve()),str(p)
  else:assert not p.is_symlink() and pin(p)['bytes']==r['bytes'] and pin(p)['sha256']==r['sha256'],str(p)
def group_absent(pid):
 try:os.killpg(pid,0);return False
 except ProcessLookupError:return True

def controlled(text):
 return [{'name':re.match(r"test\(['\"]([^'\"]+)",s).group(1),'bytes':len(s.encode()),'sha256':sha(s.encode())} for s in re.findall(r"(?ms)^test\(['\"]controlled[^\n]*.*?^\}\);",text)]

def tap(text,command):
 counts={k:int(v) for k,v in re.findall(r'^# (tests|pass|fail|cancelled|skipped|todo) (\d+)\s*$',text,re.M)}
 assert 'TAP version 13' in text and re.search(r'^1\.\.\d+\s*$',text,re.M),'incomplete TAP framing'
 assert all(k in counts for k in ['tests','pass','fail','cancelled','skipped','todo']),'incomplete TAP counts'
 assert counts['tests']>0 and counts['fail']==counts['cancelled']==counts['todo']==0,'test failure/cancellation/todo'
 if 'expectedTests' in command:assert counts['tests']==command['expectedTests'] and counts['skipped']==command['expectedSkipped'] and counts['pass']==command['expectedTests']-command['expectedSkipped'],'selected case population differs'
 skips=[l for l in text.splitlines() if re.search(r'#\s*(SKIP|TODO)\b',l,re.I)]
 diagnostics=[]
 for line in text.splitlines():
  m=re.match(r'^\s*#\s*(\{.*\})\s*$',line)
  if m:
   try:diagnostics.append(json.loads(m.group(1)))
   except ValueError:pass
 result={'counts':counts,'skips':skips,'diagnostics':diagnostics,'complete':True}
 if command['id']=='owned-lifetime':
  http=[r for r in diagnostics if r.get('owner')=='http' and 'mode' in r];capture=[r for r in diagnostics if 'capturedBytes' in r and r.get('owner') in ['worker','command','http']]
  assert len(http)==5 and len({r['mode'] for r in http})==5,'missing five HTTP diagnostics'
  assert len(capture)==3 and {r['owner'] for r in capture}=={'worker','command','http'},'missing three capture diagnostics'
  assert re.search(r'^ok \d+ - '+re.escape(base['handback']['name'])+r'\s*$',text,re.M),'controlled handback case incomplete'
  result['controlledPopulation']={**base['handback'],'standing':'Exact unchanged loop source and wholecase pass; no periteration instrumentation claim.'}
 return result


binding_path,binding_sha,admission_path,admission_sha=sys.argv[1:]
assert sha(Path(binding_path).read_bytes())==binding_sha;b=json.loads(Path(binding_path).read_text())
assert sha(Path(admission_path).read_bytes())==admission_sha;a=json.loads(Path(admission_path).read_text())
assert a['status']=='ROOT_ADMITTED_RC11_PROOF_CONTINUATION' and a['bindingSha256']==binding_sha
for p in a['files']:checked(p)
assert b['status']=='RETAINED_BUILD_CONTINUATION_READY'
c=json.loads(checked(b['originalControls']));commands=json.loads(checked(b['commands']));assert a['commandIds']==[x['id'] for x in commands]
transform=json.loads(checked(b['diagnosticTransform']));checked(transform['original']);checked(transform['derivative']);checked(transform['diff'])
for link,target in transform['readonlyLinks'].items():assert Path(link).is_symlink() and os.readlink(link)==target
expectedPattern='^(?:'+'|'.join(re.escape(n) for n in b['selectedCaseNames'])+')$'
assert commands==[{'id':'three-case-diagnostic','kind':'testfile','args':['--experimental-vm-modules','--test','--test-concurrency=1','--test-reporter=tap','--test-name-pattern='+expectedPattern,transform['derivative']['path']],'timeoutSeconds':300}]
checked(b['closedFailureTriage'])
checked(b['acceptedNativeProof']);checked(b['acceptedPhysicalProof']);checked(b['priorContinuationReturn']);ready=json.loads(checked(b['originalReady']))
for p in ready['controls']:checked(p)
for k in ['node','npmCli','builderPin','archive']:checked(c[k])
for k in ['originalRunner','originalFailure','originalLint','buildReceipt','environment']:checked(b[k])
inv=json.loads(checked(b['sourceInventory']));source=Path(b['frozenSourceRoot']);rows=inv['rows'];assert inv['sourceDigest']==b['sourceDigest']
original=Path(b['proofRoot']);stage=original/'source';work=original/'work';tenant=work/c['tenantRelative']
pkg=json.loads((tenant/'package.json').read_text());assert pkg['scripts']['test:unit']==c['expectedUnitScript'];assert 'pretest:unit' not in pkg['scripts'] and 'posttest:unit' not in pkg['scripts']
dep=json.loads(checked(c['dependencyInventory']));npm=json.loads(checked(c['npmInventory']));base=json.loads(checked(c['controlledBaseline']));compiled=json.loads(checked(b['compiledInventory']))
def check_compiled():
 observed=[]
 for scope in compiled['scopes']:
  root=tenant/scope;paths=[root] if root.is_file() else sorted(root.rglob('*'))
  for p in paths:
   assert not p.is_symlink(),str(p)
   if p.is_file():
    r=pin(p);observed.append({'path':p.relative_to(tenant).as_posix(),'bytes':r['bytes'],'sha256':r['sha256']})
 observed.sort(key=lambda r:r['path']);assert observed==compiled['rows'],'retained compiled/contracts/manifest bytes changed'
 return compiled['inventoryDigest']
for root in [source,stage]:assert same_source(root,rows)==b['sourceDigest']
current=rows_at(work,rows);assert [{'before':x,'after':z} for x,z in zip(rows,current) if x!=z]==b['retainedWorkDelta']
assert controlled((tenant/'test_env/tests/t287-owned-process-lifetime.test.mjs').read_text())==base['blocks']
for tree in [dep,npm,{**dep,'root':str(tenant/'node_modules')}]:verify_tree(tree)
check_compiled();env=json.loads(checked(b['environment']))['environment'];assert not any(k in env for k in c['unsetOptIns'])
proof=Path(b['continuationOutput']);assert proof.parent==Path(b['diagnosticRecords']).parent and not proof.exists();proof.mkdir()
save(proof/'STARTED.json',{'bindingSha256':binding_sha,'admissionSha256':admission_sha,'sourceDigest':b['sourceDigest'],'compiledInventory':b['compiledInventory'],'buildReceipt':b['buildReceipt'],'restaged':False,'rebuilt':False})
try:
 results=[]
 for command in commands:
  out=proof/command['id'];out.mkdir();pre=same_source(source,rows);same_source(stage,rows)
  argv=[c['node']['path']]+([c['npmCli']['path']] if command['kind']=='npm' else [])+command['args'];signals=[];timed_out=False;too_large=False;start=time.monotonic()
  with (out/'stdout.log').open('xb') as stdout,(out/'stderr.log').open('xb') as stderr:
   child=subprocess.Popen(argv,cwd=tenant,env=env,stdin=subprocess.DEVNULL,stdout=stdout,stderr=stderr,start_new_session=True)
   save(out/'LAUNCH.json',{'argv':argv,'cwd':str(tenant),'pid':child.pid,'pgid':child.pid,'absoluteSeconds':command['timeoutSeconds'],'sourcePreDigest':pre})
   while child.poll() is None:
    timed_out=time.monotonic()-start>=command['timeoutSeconds'];too_large=(out/'stdout.log').stat().st_size+(out/'stderr.log').stat().st_size>c['maxOutputBytes']
    if timed_out or too_large:break
    time.sleep(.1)
   cleanup_needed=not group_absent(child.pid)
   if cleanup_needed:
    for sig,grace in [(signal.SIGTERM,c['signalGraceSeconds']),(signal.SIGKILL,1)]:
     if group_absent(child.pid):break
     try:os.killpg(child.pid,sig);signals.append({'signal':sig.name,'atSeconds':time.monotonic()-start,'pgid':child.pid})
     except ProcessLookupError:break
     until=time.monotonic()+grace
     while time.monotonic()<until and not group_absent(child.pid):child.poll();time.sleep(.05)
   try:code=child.wait(timeout=1)
   except subprocess.TimeoutExpired:code=None
  group_gone=group_absent(child.pid);report={'id':command['id'],'argv':argv,'pid':child.pid,'pgid':child.pid,'exitCode':code,'wallSeconds':time.monotonic()-start,'timedOut':timed_out,'outputBudgetExceeded':too_large,'signals':signals,'groupAbsent':group_gone,'cleanupNeeded':cleanup_needed,'stdout':pin(out/'stdout.log'),'stderr':pin(out/'stderr.log')}
  error=None
  try:
   report['sourcePostDigest']=same_source(source,rows);same_source(stage,rows)
   current=rows_at(work,rows);delta=[{'before':a,'after':z} for a,z in zip(rows,current) if a!=z];report['generatedWorkSourceDifferences']=delta
   assert delta==b['retainedWorkDelta'],'retained source/build deltas changed'
   report['compiledInventoryDigest']=check_compiled()
   records=[]
   for label in ['progress-worker','unadmitted-progress-worker','post-timeout-output']:
    file=Path(b['diagnosticRecords'])/label/'record.json';record=json.loads(file.read_text());assert record['captureComplete'] and record['label']==label
    for name in ['stdout','stderr','transport']:assert name in record['artifacts']
    for art in record['artifacts'].values():checked({k:art[k] for k in ['path','bytes','sha256']})
    records.append(pin(file))
   report['diagnosticRecords']=records

   assert code==0 and not timed_out and not too_large and group_gone and not cleanup_needed,'command failed/incomplete or owned group cleanup required'
   if command['kind']=='testfile' or command['id']=='unit':report['tap']=tap((out/'stdout.log').read_text(),command)
  except Exception as e:error=str(e)
  report['status']='PASSED' if error is None else 'FAILED_OR_INCOMPLETE';report['failure']=error;save(out/'RETURN.json',report);results.append({'id':command['id'],'status':report['status'],'receipt':pin(out/'RETURN.json')});print(json.dumps(results[-1]),flush=True)
  if error:raise RuntimeError(error)
 verify_tree(dep);verify_tree(npm);verify_tree({**dep,'root':str(tenant/'node_modules')});same_source(source,rows);same_source(stage,rows);check_compiled()
 save(proof/'FINAL_RETURN.json',{'status':'MECHANICAL_PROOF_COMMANDS_PASSED_PENDING_ROOT_REVIEW','sourceDigest':b['sourceDigest'],'commands':results,'priorBuildReceipt':b['buildReceipt'],'compiledInventory':b['compiledInventory'],'originalFrozenSourceConserved':True,'dependencyAndNpmAuthorityConserved':True,'standing':'Finite commands/full selected files only; skips recorded, no assurance/qualification/acceptance.'})
except Exception as e:
 save(proof/'HALT.json',{'error':str(e),'standing':'Stopped; preserve actual outputs/process receipts/work. No automatic retry, source repair, broader cleanup or following command.'});raise
