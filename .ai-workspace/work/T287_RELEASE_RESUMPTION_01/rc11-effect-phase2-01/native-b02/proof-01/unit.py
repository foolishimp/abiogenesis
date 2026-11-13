from pathlib import Path
import os,sys,json,hashlib,subprocess,time,signal,re,traceback,shutil

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
  else:
   assert not p.is_symlink() and pin(p)['bytes']==r['bytes'] and pin(p)['sha256']==r['sha256'],str(p)
   if 'executable' in r:assert bool(p.stat().st_mode & 0o111)==r['executable'],str(p)

def group_absent(pid):
 try:os.killpg(pid,0);return False
 except ProcessLookupError:return True

def untap(text):
 decoded=re.sub(r'\\([\\#])',r'\1',text)
 assert decoded.replace('\\','\\\\').replace('#','\\#')==text,'TAP escaping roundtrip'
 return decoded

def compiled_rows(tenant):
 result=[]
 for scope in ['build','contracts','product-toolchain-manifest.json']:
  root=tenant/scope
  for p in ([root] if root.is_file() else sorted(root.rglob('*'))):
   assert not p.is_symlink(),str(p)
   if p.is_file():
    q=pin(p);result.append({'path':p.relative_to(tenant).as_posix(),'bytes':q['bytes'],'sha256':q['sha256']})
 return sorted(result,key=lambda r:r['path'])

def dependency_metadata(root):
 result=[]
 for d,dirs,files in os.walk(root,followlinks=False):
  p=Path(d);st=p.stat();result.append({'path':p.relative_to(root).as_posix(),'mtimeNs':st.st_mtime_ns,'mode':st.st_mode & 0o7777})
  dirs[:]=[name for name in dirs if not (p/name).is_symlink()]
 p=root/'.package-lock.json'
 if p.exists():
  st=p.stat();result.append({'path':'.package-lock.json','mtimeNs':st.st_mtime_ns,'mode':st.st_mode & 0o7777})
 return sorted(result,key=lambda r:r['path'])

def close_group(pid,grace):
 signals=[]
 for sig,wait in [(signal.SIGTERM,grace),(signal.SIGKILL,1)]:
  if group_absent(pid):break
  try:os.killpg(pid,sig);signals.append(sig.name)
  except ProcessLookupError:break
  until=time.monotonic()+wait
  while time.monotonic()<until and not group_absent(pid):time.sleep(.05)
 return {'pgid':pid,'signals':signals,'groupAbsent':group_absent(pid)}

def tap(text,command):
 counts={k:int(v) for k,v in re.findall(r'^# (tests|pass|fail|cancelled|skipped|todo) (\d+)\s*$',text,re.M)}
 assert 'TAP version 13' in text and re.search(r'^1\.\.\d+\s*$',text,re.M),'incomplete TAP framing'
 assert all(k in counts for k in ['tests','pass','fail','cancelled','skipped','todo']),'incomplete TAP counts'
 assert counts['tests']==command['expectedTests'] and counts['pass']==command['expectedTests']-command['expectedSkipped'] and counts['skipped']==command['expectedSkipped'],'selected case population differs'
 assert counts['fail']==counts['cancelled']==counts['todo']==0,'test failure/cancellation/todo'
 names=[untap(v) for v in re.findall(r'^# Subtest: (.*)$',text,re.M)]
 assert sorted(names)==sorted(command['expectedNames']),'literal named population differs'
 skips=[l for l in text.splitlines() if re.search(r'#\s*SKIP\b',l,re.I)]
 skipped_names=[untap(m.group(1)) for line in skips if (m:=re.match(r'^ok \d+ - (.*?) # SKIP(?: |$)',line))]
 assert sorted(skipped_names)==sorted(command.get('expectedSkippedNames',[])),'explicit skipped population differs'
 diagnostics=[]
 for line in text.splitlines():
  m=re.match(r'^\s*#\s*((?:evidence )?\{.*\})\s*$',line)
  if m:
   raw=m.group(1);decoded=untap(raw);value=json.loads(decoded.removeprefix('evidence '))
   diagnostics.append({'rawLine':line,'decoded':value})
 result={'counts':counts,'names':names,'skips':skips,'diagnostics':diagnostics,'complete':True}
 return result

# These three functions are the revised control relation and are used by the actual continuation.
def validated_digest_join(tagged, raw):
 if not isinstance(tagged,str) or re.fullmatch(r'sha256:[0-9a-f]{64}',tagged) is None:raise ValueError('invalid typed Sha256Digest')
 if not isinstance(raw,str) or re.fullmatch(r'[0-9a-f]{64}',raw) is None:raise ValueError('invalid raw SHA-256 pin')
 if tagged!='sha256:'+raw:raise ValueError('typed/raw digest payload mismatch')
 return {'typed':tagged,'raw':raw,'payloadEqual':True}

class ProofStepFailure(Exception):pass

def run_required_step(step_id, action, results, sink):
 try:
  details=action();row={'id':step_id,'status':'PASSED','failurePresent':False,'failure':None,'details':details}
 except Exception as error:
  row={'id':step_id,'status':'FAILED_OR_INCOMPLETE','failurePresent':True,'failure':{'class':type(error).__module__+'.'+type(error).__qualname__,'message':str(error),'repr':repr(error),'traceback':traceback.format_exc()},'details':None}
  results.append(row);sink(row)
  raise ProofStepFailure(step_id+' failed; see retained failure record') from error
 results.append(row);sink(row);return row

def require_complete_success(results, required_ids):
 if [r.get('id') for r in results]!=required_ids:raise ProofStepFailure('required result population incomplete/duplicate/out of order')
 if any(r.get('status')!='PASSED' or r.get('failurePresent') is not False or r.get('failure') is not None for r in results):raise ProofStepFailure('required result is not an explicit success')
 return True

def retained_guards():
 for p in b['preservationPins']+b['retainedPins']:checked(p)
 evidence=json.loads(checked(b['predecessorEvidence']))
 for p in evidence['rows']+evidence['controlRows']:checked(p)
 for root,head in b['heads'].items():
  actual=subprocess.check_output(['git','-C',root,'rev-parse','HEAD'],env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'},text=True).strip();assert actual==head,'HEAD changed '+root
 inv=json.loads(checked(b['sourceInventory']));rows=inv['rows'];assert inv['sourceDigest']==b['sourceDigest']
 for root in [b['frozenSourceRoot'],b['liveSourceRoot'],b['retainedStageRoot']]:assert same_source(Path(root),rows)==b['sourceDigest']
 compiled=json.loads(checked(b['compiledInventory']));assert compiled_rows(tenant)==compiled['rows'],'retained build differs'
 current=rows_at(Path(b['retainedWorkRoot']),rows);assert [{'before':a,'after':z} for a,z in zip(rows,current) if a!=z]==compiled['retainedWorkDelta'],'retained generated delta differs'
 dep=json.loads(checked(c['dependencyInventory']));dep={**dep,'root':c['dependencyRoot']};npm=json.loads(checked(c['npmInventory']))
 verify_tree(dep);verify_tree(npm);verify_tree({**dep,'root':str(tenant/'node_modules')})
 md=json.loads(checked(c['dependencyMetadata']))['rows'];assert dependency_metadata(Path(dep['root']))==dependency_metadata(tenant/'node_modules')==md,'dependency metadata differs'
 checked(b['archive']);record=json.loads(checked(b['archiveMembers']));assert record['archive']==b['archive']
 root=Path(b['bootstrapRoot']);actual=[]
 for p in root.rglob('*'):
  assert not p.is_symlink(),'installed symlink'
  if p.is_file():r=pin(p);actual.append({'path':p.relative_to(root).as_posix(),'bytes':r['bytes'],'sha256':r['sha256']})
 actual.sort(key=lambda r:r['path']);assert actual==[{k:r[k] for k in ['path','bytes','sha256']} for r in record['rows']],'bootstrap/archive mismatch'
 assert (root/'product-toolchain-manifest.json').read_bytes()==(tenant/'product-toolchain-manifest.json').read_bytes()
 summary=json.loads(checked(b['c2Summary']));digest_relation=validated_digest_join(summary['artifactSha256'],b['archive']['sha256'])
 assert summary['installedProductUnchanged'] is True
 for r in b['previousProcessGroups']:assert group_absent(r['pgid']),'prior owned group is present; no cleanup authorized here'
 pkg=json.loads((tenant/'package.json').read_text());assert pkg['scripts']['test:unit']==c['expectedUnitScript'];assert 'pretest:unit' not in pkg['scripts'] and 'posttest:unit' not in pkg['scripts']
 assert c['command']['args'][c['command']['args'].index('--test-reporter=tap')+1:]==c['unitFiles'],'unit population/flags changed'
 return {'sourceRows':len(rows),'compiledRows':len(compiled['rows']),'archiveMembers':len(actual),'typedRawJoin':digest_relation,'sourceBuildDependencyArchiveInstallProtectionExact':True}

def active(value):
 p=proof/'ACTIVE.json';t=proof/'ACTIVE.next';t.write_text(json.dumps(value));os.replace(t,p)

def execute_unit():
 global child
 out=proof/'unit';out.mkdir();evidence=out/'evidence';evidence.mkdir();tmp=proof/'tmp';tmp.mkdir()
 env=json.loads(checked(b['retainedEnvironment']))['environment'];env={**env,'TMPDIR':str(tmp),'NODE_COMPILE_CACHE':str(tmp/'node-compile-cache'),'npm_config_cache':str(tmp/'npm-cache'),'ABI5_TEST_EVIDENCE_DIR':str(evidence)}
 assert env['NODE_OPTIONS']==env['NODE_PATH']=='' and env['npm_config_offline']=='true';assert not any(k in env for k in c['unsetOptIns'])
 save(proof/'ENVIRONMENT.json',{'environment':env,'predecessor':b['retainedEnvironment'],'delta':'Only new unit TMPDIR, Node/npm caches and evidence directory; no optional test activation.'})
 cap=min(c['command']['timeoutSeconds'],deadline-time.monotonic()-c['cleanupReserveSeconds']);assert cap>0,'campaign reserve reached'
 argv=[c['node']['path'],'--max-old-space-size=8192']+c['command']['args'];start=time.monotonic();reason=None;signals=[]
 with (out/'stdout.log').open('xb') as so,(out/'stderr.log').open('xb') as se:
  child=subprocess.Popen(argv,cwd=tenant,env=env,stdin=subprocess.DEVNULL,stdout=so,stderr=se,start_new_session=True)
  active({'phase':'unit','pgid':child.pid,'deadlineMonotonic':start+cap});save(out/'LAUNCH.json',{'argv':argv,'cwd':str(tenant),'pid':child.pid,'pgid':child.pid,'capSeconds':1800,'effectiveCapSeconds':cap,'environment':env})
  while child.poll() is None:
   if time.monotonic()-start>=cap:reason='command/campaign deadline';break
   if (out/'stdout.log').stat().st_size+(out/'stderr.log').stat().st_size>c['maxOutputBytes']:reason='output budget';break
   time.sleep(.1)
  cleanup=not group_absent(child.pid)
  if cleanup:signals=close_group(child.pid,2)['signals']
  try:code=child.wait(timeout=1)
  except subprocess.TimeoutExpired:code=None
 total=(out/'stdout.log').stat().st_size+(out/'stderr.log').stat().st_size
 if total>c['maxOutputBytes']:reason=reason or 'output budget'
 report={'argv':argv,'pid':child.pid,'pgid':child.pid,'exitCode':code,'wallSeconds':time.monotonic()-start,'limitCause':reason,'combinedOutputBytes':total,'cleanupNeeded':cleanup,'signals':signals,'groupAbsent':group_absent(child.pid),'stdout':pin(out/'stdout.log'),'stderr':pin(out/'stderr.log')}
 save(out/'COMMAND_RETURN.json',report);child=None;active({'phase':'unit-postguards'})
 assert code==0 and reason is None and not cleanup and report['groupAbsent'],'unit command failed/incomplete or cleanup needed'
 parsed=tap((out/'stdout.log').read_text(),c['command']);names=parsed['names'];assert [n for n in names if n in c['m5ExpectedNames']]==c['m5ExpectedNames'],'M5 literal population'
 assert not set(c['m5ExpectedNames']).intersection(c['command']['expectedSkippedNames'])
 evidence_values=[];evidence_pins=[]
 for p in sorted(evidence.rglob('*')):
  assert not p.is_symlink(),'evidence symlink'
  if p.is_file():assert p.suffix=='.json';evidence_values.append(json.loads(p.read_text()));evidence_pins.append(pin(p))
 ids=sorted(r['caseId'] for r in evidence_values if r.get('evidence')=='m5-worker-transport');assert ids==sorted(c['m5EvidenceCaseIds']),'M5 evidence ID census'
 guards=retained_guards();save(proof/'POSTGUARDS.json',guards)
 return {'command':pin(out/'COMMAND_RETURN.json'),'tap':parsed,'evidence':evidence_pins,'m5Subset':{'passed':39,'skipped':0,'names':c['m5ExpectedNames'],'evidenceCaseIds':ids},'postguards':pin(proof/'POSTGUARDS.json')}

def main():
 global b,c,proof,tenant,deadline,child
 began=time.monotonic() # includes every initial read-only revalidation, not just the eventual command.
 binding_path,binding_sha,admission_path,admission_sha=sys.argv[1:5]
 assert sha(Path(binding_path).read_bytes())==binding_sha;b=json.loads(Path(binding_path).read_text());c=json.loads(checked(b['controls']))
 assert sha(Path(admission_path).read_bytes())==admission_sha;a=json.loads(Path(admission_path).read_text())
 assert a['status']=='ROOT_ADMITTED_PHASE2_B_UNIT_CONTINUATION' and a['bindingSha256']==binding_sha
 O=Path(__file__).resolve().parent;assert a['readySha256']==pin(O/'READY.json')['sha256'] and a['commandIds']==['unit']
 for p in json.loads((O/'READY.json').read_text())['controlPins']:checked(p)
 assert a['retrospectiveDisposition']['sourceDigest']==b['sourceDigest'];checked(a['retrospectiveDisposition']['receipt'])
 for k in ['python','node','npmCli']:checked(c[k])
 assert Path(sys.executable).resolve()==Path(c['python']['path']);proof=Path(c['proofRoot']);tenant=Path(b['retainedTenant']);child=None
 if len(sys.argv)==5:
  deadline=began+c['campaignMaximumSeconds'];assert not proof.exists(),'fresh continuation root exists';proof.mkdir()
  save(proof/'CAMPAIGN_START.json',{'beganMonotonic':began,'deadlineMonotonic':deadline,'globalSeconds':2400,'cleanupReserveSeconds':15,'firstEffect':'create continuation output; no source staging'})
  with (proof/'driver.stdout.log').open('xb') as so,(proof/'driver.stderr.log').open('xb') as se:
   worker=subprocess.Popen([c['python']['path'],__file__,*sys.argv[1:5],'--worker',str(deadline)],stdin=subprocess.DEVNULL,stdout=so,stderr=se,start_new_session=True)
   save(proof/'DRIVER_LAUNCH.json',{'pid':worker.pid,'pgid':worker.pid});reason=None;closures=[]
   while worker.poll() is None:
    if time.monotonic()>=deadline-10:reason='global deadline cleanup reserve';break
    if (proof/'driver.stdout.log').stat().st_size+(proof/'driver.stderr.log').stat().st_size>c['maxOutputBytes']:reason='driver output budget';break
    time.sleep(.1)
   if reason is not None:
    try:os.killpg(worker.pid,signal.SIGSTOP)
    except ProcessLookupError:pass
    state=json.loads((proof/'ACTIVE.json').read_text()) if (proof/'ACTIVE.json').exists() else {}
    if state.get('pgid'):closures.append(close_group(state['pgid'],2))
    try:os.killpg(worker.pid,signal.SIGCONT)
    except ProcessLookupError:pass
    closures.append(close_group(worker.pid,2))
   try:code=worker.wait(timeout=1)
   except subprocess.TimeoutExpired:code=None
  final=proof/'FINAL_RETURN.json';final_record=json.loads(final.read_text()) if final.exists() else None
  complete=False
  if final_record is not None:
   try:complete=require_complete_success(final_record['results'],['unit'])
   except Exception:complete=False
  ok=code==0 and reason is None and group_absent(worker.pid) and complete and time.monotonic()<=deadline
  if (proof/'driver.stdout.log').stat().st_size+(proof/'driver.stderr.log').stat().st_size>c['maxOutputBytes']:ok=False;reason='driver final output budget'
  save(proof/'CAMPAIGN_RETURN.json',{'status':'PASSED_PENDING_ROOT' if ok else 'FAILED_OR_INCOMPLETE','exitCode':code,'reason':reason,'elapsedSeconds':time.monotonic()-began,'globalDeadlineHonored':time.monotonic()<=deadline,'groupAbsent':group_absent(worker.pid),'closures':closures,'final':pin(final) if final.exists() else None,'stdout':pin(proof/'driver.stdout.log'),'stderr':pin(proof/'driver.stderr.log')});print(json.dumps(pin(proof/'CAMPAIGN_RETURN.json')),flush=True);return 0 if ok else 1
 assert sys.argv[5]=='--worker';deadline=float(sys.argv[6]);results=[]
 try:
  active({'phase':'retained-input-revalidation'});assert shutil.disk_usage(proof).free>c['reserveBytes'],'disk reserve';pre=retained_guards();save(proof/'PREFLIGHT.json',pre)
  run_required_step('unit',execute_unit,results,lambda row:save(proof/'UNIT_RETURN.json',row))
  require_complete_success(results,['unit']) # no success label from missing, failed or diagnostic-only records.
  assert time.monotonic()<deadline-5,'final closure reserve'
  save(proof/'FINAL_RETURN.json',{'status':'SELECTED_UNIT_PASSED_PENDING_ROOT','sourceDigest':b['sourceDigest'],'results':results,'standing':'One complete original unit; six skips retained. No prior failure rewritten or qualification claim.'});active({'phase':'closed'});return 0
 except BaseException as error:
  closure=close_group(child.pid,2) if child is not None else None
  save(proof/'HALT.json',{'failurePresent':True,'class':type(error).__module__+'.'+type(error).__qualname__,'message':str(error),'repr':repr(error),'traceback':traceback.format_exc(),'results':results,'activeChildClosure':closure,'retry':False});raise

if __name__=='__main__':sys.exit(main())
