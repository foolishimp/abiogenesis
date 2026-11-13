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
  else:
   assert not p.is_symlink() and pin(p)['bytes']==r['bytes'] and pin(p)['sha256']==r['sha256'],str(p)
   if 'executable' in r:assert bool(p.stat().st_mode & 0o111)==r['executable'],str(p)
def group_absent(pid):
 try:os.killpg(pid,0);return False
 except ProcessLookupError:return True

def controlled(text):
 return [{'name':re.match(r"test\(['\"]([^'\"]+)",s).group(1),'bytes':len(s.encode()),'sha256':sha(s.encode())} for s in re.findall(r"(?ms)^test\(['\"]controlled[^\n]*.*?^\}\);",text)]

def untap(text):
 decoded=re.sub(r'\\([\\#])',r'\1',text)
 assert decoded.replace('\\','\\\\').replace('#','\\#')==text,'TAP escaping roundtrip'
 return decoded

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
 if command['id']=='owned-lifetime':
  values=[r['decoded'] for r in diagnostics]
  http=[r for r in values if r.get('owner')=='http' and 'mode' in r and 'evidence' not in r]
  capture=[r for r in values if 'capturedBytes' in r and r.get('owner') in ['worker','command','http']]
  assert len(http)==5 and len({r['mode'] for r in http})==5,'missing five HTTP diagnostics'
  assert len(capture)==3 and {r['owner'] for r in capture}=={'worker','command','http'},'missing three capture diagnostics'
  assert base['handback']['name'] in names,'controlled handback incomplete'
  result['controlledPopulation']={**base['handback'],'standing':'Unchanged loop source plus actual whole-case pass, no periteration instrumentation claim.'}
 return result

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

# Selected B campaign: inherited recorder/parser/copy2 checks; one absolute owner also covers staging/guards.
import tarfile, traceback

def active(value):
 p=proof/'ACTIVE.json';q=proof/'ACTIVE.next';q.write_text(json.dumps(value));os.replace(q,p)
def alarm(_sig,_frame):raise TimeoutError('active phase/campaign deadline')
def arm(cap):
 remaining=deadline-time.monotonic()-c['cleanupReserveSeconds'];assert remaining>0,'campaign cleanup reserve reached'
 signal.setitimer(signal.ITIMER_REAL,min(cap,remaining))
def close_group(pid,grace):
 signals=[]
 for sig,wait in [(signal.SIGTERM,grace),(signal.SIGKILL,1)]:
  if group_absent(pid):break
  try:os.killpg(pid,sig);signals.append(sig.name)
  except ProcessLookupError:break
  until=time.monotonic()+wait
  while time.monotonic()<until and not group_absent(pid):time.sleep(.05)
 return {'pgid':pid,'signals':signals,'groupAbsent':group_absent(pid)}
def head_guards():
 for root,expected in b['heads'].items():
  got=subprocess.check_output(['git','-C',root,'rev-parse','HEAD'],env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'},text=True).strip();assert got==expected,'HEAD changed '+root

def work_guard():
 same_source(source,rows);same_source(stage,rows);same_source(Path(b['liveSourceRoot']),rows)
 delta=[{'before':a,'after':z} for a,z in zip(rows,rows_at(work,rows)) if a!=z]
 if compiled is None:assert delta==[],'prebuild source changed'
 else:assert delta==retained_delta and compiled_rows(tenant)==compiled,'build/source changed after build'
 for p in b['preservationPins']:checked(p)
 for p in b['inputs']:checked(p)
 head_guards()
 assert dependency_metadata(Path(dep['root']))==dep_metadata,'donor dependency metadata changed'
 assert dependency_metadata(tenant/'node_modules')==dep_metadata,'staged dependency metadata changed'
 return delta

def archive_members(archive):
 result=[]
 with tarfile.open(archive,'r:gz') as tf:
  members=tf.getmembers();assert len(members)==len({m.name for m in members}),'duplicate archive member'
  for m in members:
   assert m.isfile() and m.name.startswith('package/'),'unsafe/nonregular archive member'
   rel=safe(m.name[8:]);data=tf.extractfile(m).read();p=tenant/rel
   assert p.is_file() and not p.is_symlink() and p.read_bytes()==data,rel
   result.append({'path':rel,'bytes':len(data),'sha256':sha(data),'mode':m.mode})
 result.sort(key=lambda r:r['path']);by={r['path']:r for r in result}
 for r in compiled:assert {k:by[r['path']][k] for k in ['path','bytes','sha256']}==r,'compiled member omitted/changed '+r['path']
 return result

def install_equal(member_rows):
 root=proof/'bootstrap-host/node_modules/@abiogenesis/typescript-tenant';actual=[]
 for p in root.rglob('*'):
  assert not p.is_symlink(),'installed symlink'
  if p.is_file():v=pin(p);actual.append({'path':p.relative_to(root).as_posix(),'bytes':v['bytes'],'sha256':v['sha256']})
 actual.sort(key=lambda r:r['path']);expected=[{k:r[k] for k in ['path','bytes','sha256']} for r in member_rows]
 assert actual==expected,'archive/install member mismatch'
 assert (root/'product-toolchain-manifest.json').read_bytes()==(tenant/'product-toolchain-manifest.json').read_bytes()
 return {'root':str(root),'members':len(actual),'payloadBytes':sum(r['bytes'] for r in actual),'manifest':pin(root/'product-toolchain-manifest.json'),'allMembersEqual':True,'canonicalOrder':'relative POSIX path'}

def retain_c2(out):
 root=out/'installed-proof';assert not (root/'failure.json').exists(),'configured C2 retained failure'
 cleanup=json.loads((root/'cleanup.json').read_text());assert cleanup['closeError'] is None and cleanup['originalStoreCloseAttempted'] and not cleanup['setupFailedBeforeStoreHandoff'] and cleanup['replayStoreCloseAttempted'] and cleanup['firstFailure'] is None
 for row in cleanup['processes']:
  assert row['directChildPresence']=='absent' and row['ownedGroupPresence'] in [None,'absent'],row
  try:os.kill(row['pid'],0);raise AssertionError('recorded C2 child still present')
  except ProcessLookupError:pass
  if row['groupId'] is not None:assert group_absent(row['groupId'])
 summary=json.loads((root/'summary.json').read_text());fresh=json.loads((root/'fresh-proof.json').read_text());closed=json.loads((root/'C2-events-and-close.json').read_text())
 assert closed['closeHandoff'] and summary['artifactSha256']==pin(artifact)['sha256'] and summary['installedProductUnchanged'];return {'cleanup':cleanup,'summary':summary,'freshProof':fresh,'retainedPins':[pin(p) for p in sorted(root.rglob('*')) if p.is_file()]}

binding_path,binding_sha,admission_path,admission_sha=sys.argv[1:5]
assert sha(Path(binding_path).read_bytes())==binding_sha;b=json.loads(Path(binding_path).read_text())
assert sha(Path(admission_path).read_bytes())==admission_sha;admission=json.loads(Path(admission_path).read_text())
c=json.loads(checked(b['controls']));ready=json.loads(checked(b['ready'])) if 'ready' in b else json.loads((O/'READY.json').read_text())
assert admission['status']=='ROOT_ADMITTED_PHASE2_B_PROOF' and admission['bindingSha256']==binding_sha
assert admission['readySha256']==pin(O/'READY.json')['sha256'] and admission['controlsSha256']==pin(O/'CONTROLS.json')['sha256']
assert admission['commandIds']==[x['id'] for x in c['commands']]
# Independent source disposition is supplied/pinned by the later Executive admission, never invented by preparation.
assert admission['sourceDisposition']['sourceDigest']==b['sourceDigest'];checked(admission['sourceDisposition']['review'])
assert admission['sourceDisposition']['review']==json.loads(checked(b['rootSourceDisposition']))['reviews'][0]
for p in ready['controlPins']:checked(p)
for p in b['inputs']:checked(p)
head_guards()
assert b['rootSourceDisposition']==pin(O/'ROOT_SOURCE_ACCEPTANCE.json')
for k in ['python','node','npmCli','builderPin','archive']:checked(c[k])
assert Path(sys.executable).resolve()==Path(c['python']['path'])
proof=Path(c['proofRoot']);source=Path(b['frozenSourceRoot']);inv=json.loads(checked(b['sourceInventory']));rows=inv['rows'];assert inv['sourceDigest']==b['sourceDigest'] and len(rows)==1345
dep=json.loads(checked(c['dependencyInventory']));dep={**dep,'root':c['dependencyRoot']};npm=json.loads(checked(c['npmInventory']));seed=json.loads(checked(c['contractSeedInventory']));base=json.loads(checked(c['controlledBaseline']))
# Parent watchdog starts before the first create/copy effect. Worker alarms additionally bound staging and post-command guards.
if len(sys.argv)==5:
 assert not proof.exists(),'create-once campaign already allocated'
 same_source(source,rows);same_source(Path(b['liveSourceRoot']),rows)
 for p in b['preservationPins']:checked(p)
 for v in [dep,npm,seed]:verify_tree(v)
 assert shutil.disk_usage(proof.parent).free>c['reserveBytes']
 source_text=(source/c['tenantRelative']/'test_env/tests/t287-owned-process-lifetime.test.mjs').read_text()
 handback=next(v for v in re.findall(r"(?ms)^test\(['\"]controlled[^\n]*.*?^\}\);",source_text) if v.startswith("test('"+base['handback']['name']))
 assert sha(handback.encode())==base['handbackBlockSha256']
 began=time.monotonic();deadline=began+c['campaignMaximumSeconds'];proof.mkdir()
 save(proof/'CAMPAIGN_START.json',{'beganMonotonic':began,'deadlineMonotonic':deadline,'firstEffect':'create proof root','globalSeconds':c['campaignMaximumSeconds'],'cleanupReserveSeconds':c['cleanupReserveSeconds']})
 with (proof/'driver.stdout.log').open('xb') as so,(proof/'driver.stderr.log').open('xb') as se:
  worker=subprocess.Popen([sys.executable,__file__,*sys.argv[1:5],'--worker',str(deadline)],stdin=subprocess.DEVNULL,stdout=so,stderr=se,start_new_session=True)
  save(proof/'DRIVER_LAUNCH.json',{'pid':worker.pid,'pgid':worker.pid,'argv':[sys.executable,__file__,*sys.argv[1:5],'--worker',str(deadline)]})
  cutoff=deadline-10;stop=None
  while worker.poll() is None:
   if time.monotonic()>=cutoff:stop='campaign deadline cleanup reserve';break
   if (proof/'driver.stdout.log').stat().st_size+(proof/'driver.stderr.log').stat().st_size>c['maxOutputBytes']:stop='driver output budget';break
   time.sleep(.1)
  closures=[]
  if stop:
   # Stop the worker from creating another command, then close its registered command group.
   try:os.killpg(worker.pid,signal.SIGSTOP)
   except ProcessLookupError:pass
   state=json.loads((proof/'ACTIVE.json').read_text()) if (proof/'ACTIVE.json').exists() else {}
   if state.get('pgid'):closures.append(close_group(state['pgid'],2))
   try:os.killpg(worker.pid,signal.SIGCONT)
   except ProcessLookupError:pass
   closures.append(close_group(worker.pid,2))
  try:code=worker.wait(timeout=1)
  except subprocess.TimeoutExpired:code=None
 final_bytes=(proof/'driver.stdout.log').stat().st_size+(proof/'driver.stderr.log').stat().st_size
 ok=code==0 and stop is None and group_absent(worker.pid) and final_bytes<=c['maxOutputBytes'] and time.monotonic()<=deadline
 save(proof/'CAMPAIGN_RETURN.json',{'status':'PASSED_PENDING_ROOT' if ok else 'FAILED_OR_INCOMPLETE','exitCode':code,'reason':stop,'elapsedSeconds':time.monotonic()-began,'globalDeadlineHonored':time.monotonic()<=deadline,'groupAbsent':group_absent(worker.pid),'closures':closures,'stdout':pin(proof/'driver.stdout.log'),'stderr':pin(proof/'driver.stderr.log'),'finalReceipt':pin(proof/'FINAL_RETURN.json') if (proof/'FINAL_RETURN.json').exists() else None})
 print(json.dumps(pin(proof/'CAMPAIGN_RETURN.json')),flush=True);sys.exit(0 if ok else 1)
assert sys.argv[5]=='--worker';deadline=float(sys.argv[6]);signal.signal(signal.SIGALRM,alarm)
stage=proof/'source';work=proof/'work';tenant=work/c['tenantRelative'];tmp=proof/'tmp';compiled=None;retained_delta=None;child=None;results=[];member_rows=None;artifact=None
try:
 arm(c['stageMaximumSeconds']);active({'phase':'stage','capSeconds':c['stageMaximumSeconds']})
 dep_metadata=dependency_metadata(Path(dep['root']));assert dep_metadata==json.loads(checked(c['dependencyMetadata']))['rows']
 stage.mkdir();tmp.mkdir()
 for row in rows:
  dst=stage/safe(row['path']);dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source/row['path'],dst)
 same_source(stage,rows);shutil.copytree(stage,work,copy_function=shutil.copy2)
 shutil.copytree(dep['root'],tenant/'node_modules',symlinks=True,copy_function=shutil.copy2)
 verify_tree({**dep,'root':str(tenant/'node_modules')});assert dependency_metadata(tenant/'node_modules')==dep_metadata
 applied=[]
 for row in seed['rows']:
  dst=tenant/'contracts'/safe(row['path'])
  if not dst.exists():dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(Path(seed['root'])/row['path'],dst);applied.append(row['path'])
 assert applied==c['expectedAbsentSeeds'];same_source(work,rows)
 save(proof/'STAGE.json',{'sourceInventory':b['sourceInventory'],'sourceDigest':b['sourceDigest'],'source':str(stage),'work':str(work),'appliedAbsentSeeds':applied,'dependencyMetadata':c['dependencyMetadata'],'metadataEqual':True})
 pkg=json.loads((tenant/'package.json').read_text());assert all(pkg['scripts'][k]==c[v] for k,v in [('build','expectedBuildScript'),('lint','expectedLintScript'),('test:unit','expectedUnitScript')]);assert 'pretest:unit' not in pkg['scripts'] and 'posttest:unit' not in pkg['scripts']
 for name in ['npm-user.npmrc','npm-global.npmrc']:(proof/name).write_text('')
 env={k:os.environ[k] for k in ['HOME','USER','LOGNAME','SHELL','LANG'] if k in os.environ};env.update(PATH=str(Path(c['node']['path']).parent)+':/usr/bin:/bin:/usr/sbin:/sbin',TMPDIR=str(tmp),NODE_OPTIONS='',NODE_PATH='',NODE_COMPILE_CACHE=str(tmp/'node-compile-cache'),FORCE_COLOR='0',npm_config_offline='true',npm_config_audit='false',npm_config_fund='false',npm_config_update_notifier='false',npm_config_cache=str(tmp/'npm-cache'),npm_config_userconfig=str(proof/'npm-user.npmrc'),npm_config_globalconfig=str(proof/'npm-global.npmrc'))
 save(proof/'ENVIRONMENT.json',{'environment':env,'unsetOptIns':c['unsetOptIns'],'paidProviderSelected':False});signal.setitimer(signal.ITIMER_REAL,0)
 for command in c['commands']:
  arm(deadline-time.monotonic());work_guard();assert shutil.disk_usage(proof).free>c['reserveBytes']
  out=proof/command['id'];out.mkdir();evidence=out/'evidence';evidence.mkdir();cmd_env={**env,'ABI5_TEST_EVIDENCE_DIR':str(evidence)};cwd=tenant
  args=[s.replace('{Q}',str(proof)).replace('{TENANT}',str(tenant)) for s in command['args']]
  if command['id']=='pack':
   (proof/'artifacts').mkdir();save(out/'TESTED_BUILD_BEFORE.json',{'rows':compiled,'sourceDigest':b['sourceDigest']})
  if command['id']=='bootstrap':
   cwd=proof/'bootstrap-host';cwd.mkdir();(cwd/'package.json').write_text('{"name":"phase2-b-proof-bootstrap","version":"0.0.0","private":true}\n');args[-1]=str(artifact)
  if command['id']=='c2-positive':
   install_equal(member_rows);c2tmp=proof/'c2-tmp';c2tmp.mkdir();config={**c['c2ConfigurationTemplate'],'artifactPath':str(artifact),'artifactSha256':pin(artifact)['sha256'],'hostManifestSha256':pin(tenant/'product-toolchain-manifest.json')['sha256']}
   save(out/'PROOF_CONFIG.json',config);cmd_env.update(TMPDIR=str(c2tmp),ABG_T287_C2_PROOF_CONFIG=str(out/'PROOF_CONFIG.json'),ABG_TS_CLAUDE_COMMAND=str(proof/'UNSELECTED_PROVIDER'),ABG_TS_LIVE_CLAUDE_COMMAND=str(proof/'UNSELECTED_PROVIDER'),ABI5_UAT_UNIT_ROOT=str(out/'sandbox-uat-units'))
   test_args=['--max-old-space-size=8192']+args
   save(out/'FILE_HOST_BINDING.json',{'executable':c['node']['path'],'args':test_args,'cwd':str(tenant),'outputRoot':str(out),'scratchRoot':str(c2tmp),'resourceRecord':str(out/'resources.json'),'bounds':{'reserveBytes':c['reserveBytes'],'maxOwnedBytes':4294967296,'pollMs':10000}})
   args=[c['fileHost']['path'],str(out/'FILE_HOST_BINDING.json'),pin(out/'FILE_HOST_BINDING.json')['sha256']]
  argv=[c['node']['path'],'--max-old-space-size=8192']+([c['npmCli']['path']] if command['kind']=='npm' else [])+args
  cap=min(command['timeoutSeconds'],deadline-time.monotonic()-c['cleanupReserveSeconds']);assert cap>0;start=time.monotonic();signals=[];reason=None;limit=command.get('maxOutputBytes',c['maxOutputBytes']);signal.setitimer(signal.ITIMER_REAL,0)
  with (out/'stdout.log').open('xb') as so,(out/'stderr.log').open('xb') as se:
   child=subprocess.Popen(argv,cwd=cwd,env=cmd_env,stdin=subprocess.DEVNULL,stdout=so,stderr=se,start_new_session=True)
   active({'phase':command['id'],'pgid':child.pid,'deadlineMonotonic':start+cap});save(out/'LAUNCH.json',{'argv':argv,'cwd':str(cwd),'pid':child.pid,'pgid':child.pid,'capSeconds':command['timeoutSeconds'],'effectiveCapSeconds':cap,'environment':cmd_env})
   while child.poll() is None:
    if time.monotonic()-start>=cap:reason='command/campaign deadline';break
    if (out/'stdout.log').stat().st_size+(out/'stderr.log').stat().st_size>limit:reason='output budget';break
    time.sleep(.1)
   cleanup=not group_absent(child.pid)
   if cleanup:signals=close_group(child.pid,2)['signals']
   try:code=child.wait(timeout=1)
   except subprocess.TimeoutExpired:code=None
  total=(out/'stdout.log').stat().st_size+(out/'stderr.log').stat().st_size;reason=reason or ('output budget' if total>limit else None)
  report={'id':command['id'],'argv':argv,'pid':child.pid,'pgid':child.pid,'exitCode':code,'wallSeconds':time.monotonic()-start,'limitCause':reason,'cleanupNeeded':cleanup,'signals':signals,'groupAbsent':group_absent(child.pid),'stdout':pin(out/'stdout.log'),'stderr':pin(out/'stderr.log'),'combinedOutputBytes':total}
  active({'phase':command['id']+'-postguards'});child=None;arm(deadline-time.monotonic());error=None
  try:
   assert code==0 and reason is None and not cleanup and report['groupAbsent'],'command failed/incomplete/cleanup required'
   if command['id']=='build':
    retained_delta=[{'before':a,'after':z} for a,z in zip(rows,rows_at(work,rows)) if a!=z]
    assert all(d['before']['path'].startswith(c['tenantRelative']+'/contracts/') or d['before']['path']==c['tenantRelative']+'/product-toolchain-manifest.json' for d in retained_delta)
    compiled=compiled_rows(tenant);origins=json.loads((out/'EFFECT_MODULE_ORIGINS.json').read_text());assert origins['effectVersion']=='3.22.1' and origins['oneOriginPerSpecifier'];report['effectModuleOrigins']=pin(out/'EFFECT_MODULE_ORIGINS.json');save(proof/'COMPILED_BUILD_INVENTORY.json',{'root':str(tenant),'sourceDigest':b['sourceDigest'],'rows':compiled,'retainedWorkDelta':retained_delta,'actualBuild':str(out/'RETURN.json')})
   work_guard()
   report['retainedEvidence']=[pin(p) for p in sorted(evidence.rglob('*')) if p.is_file()]
   for p in evidence.rglob('*'):
    assert not p.is_symlink()
    if p.is_file():assert p.suffix=='.json';json.loads(p.read_text())
   if command['kind']=='testfile':report['tap']=tap((out/'stdout.log').read_text(),command)
   if command['id']=='pack':
    parsed=json.loads((out/'stdout.log').read_text());assert len(parsed)==1 and parsed[0]['filename']==c['archiveFilename'];artifact=proof/'artifacts'/c['archiveFilename'];member_rows=archive_members(artifact);assert parsed[0]['size']==pin(artifact)['bytes'];save(out/'ARCHIVE_MEMBERS.json',{'archive':pin(artifact),'rows':member_rows,'allMatchFreshBuild':True});report['archive']=pin(artifact);report['members']=len(member_rows)
   if command['id']=='bootstrap':save(out/'ARCHIVE_INSTALL_EQUALITY.json',install_equal(member_rows))
   if command['id']=='c2-positive':
    report['configuredEvidence']=retain_c2(out);report['archiveInstallEquality']=install_equal(member_rows)
    rr=json.loads((out/'resources.json').read_text());assert rr['status']=='CHILD_CLOSED' and rr['monitorFailure'] is None;report['resources']=rr
    events=[json.loads(l) for l in (out/'events.jsonl').read_text().splitlines()];summary=[r for r in events if r['type']=='summary' and r.get('file') is None][-1];assert summary['success'] and summary['counts']['passed']==1 and summary['counts']['skipped']==0 and events[-1]['type']=='end';report['structuredReporter']=pin(out/'events.jsonl')
   if command['id']=='unit':
    names=report['tap']['names'];assert [n for n in names if n in c['m5ExpectedNames']]==c['m5ExpectedNames'];assert not set(c['m5ExpectedNames']).intersection(command['expectedSkippedNames'])
    ev=[json.loads(p.read_text()) for p in evidence.glob('*.json')];ids=sorted(x['caseId'] for x in ev if x.get('evidence')=='m5-worker-transport');assert ids==sorted(c['m5EvidenceCaseIds']),'M5 retained evidence ID census';report['m5Subset']={'names':c['m5ExpectedNames'],'passed':39,'skipped':0,'evidenceCaseIds':ids}
  except Exception as e:error=str(e)
  report['status']='PASSED' if error is None else 'FAILED_OR_INCOMPLETE';report['failure']=error;save(out/'RETURN.json',report);results.append({'id':command['id'],'status':report['status'],'receipt':pin(out/'RETURN.json')});print(json.dumps(results[-1]),flush=True)
  if error:raise RuntimeError(error)
 work_guard();verify_tree(dep);verify_tree(npm);verify_tree({**dep,'root':str(tenant/'node_modules')});install_equal(member_rows)
 save(proof/'FINAL_RETURN.json',{'status':'SELECTED_B_PROOF_PASSED_PENDING_ROOT','sourceDigest':b['sourceDigest'],'commands':results,'compiledInventory':pin(proof/'COMPILED_BUILD_INVENTORY.json'),'archive':pin(artifact),'sourceAndProtectedInputsConserved':True,'standing':'Bounded selected proof only; six unit skips and old failures retained. No qualification/release.'});active({'phase':'closed'});signal.setitimer(signal.ITIMER_REAL,0)
except BaseException as e:
 signal.setitimer(signal.ITIMER_REAL,0);closure=close_group(child.pid,2) if child is not None else None
 save(proof/'HALT.json',{'error':str(e),'traceback':traceback.format_exc(),'activeChildClosure':closure,'completed':results,'automaticRetry':False});raise
