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

def installed_archive_equality():
 checked(b['proofArchive']);record=json.loads(checked(b['archiveMembers']));assert record['archive']==b['proofArchive']
 root=Path(b['bootstrapHost'])/'node_modules/@abiogenesis/typescript-tenant'
 actual=[]
 for p in sorted(root.rglob('*')):
  assert not p.is_symlink(),'unexpected installed package symlink '+str(p)
  if p.is_file():v=pin(p);actual.append({'path':p.relative_to(root).as_posix(),'bytes':v['bytes'],'sha256':v['sha256']})
 expected=[{k:r[k] for k in ['path','bytes','sha256']} for r in record['rows']]
 actual.sort(key=lambda r:r['path'])
 assert actual==expected,'temporary installation differs from exact archive members'
 manifest=json.loads((root/'product-toolchain-manifest.json').read_text());assert manifest['productContentDigest']==b['expectedProductContentDigest']
 return {'archive':b['proofArchive'],'archiveMembers':b['archiveMembers'],'installedPackageRoot':str(root),'regularFiles':len(actual),'payloadBytes':sum(r['bytes'] for r in actual),'allRegularMembersEqual':True,'extraMissingSymlinkMembers':[],'manifest':pin(root/'product-toolchain-manifest.json'),'productContentDigest':manifest['productContentDigest']}

binding_path,binding_sha,admission_path,admission_sha=sys.argv[1:]
assert sha(Path(binding_path).read_bytes())==binding_sha; b=json.loads(Path(binding_path).read_text())
assert sha(Path(admission_path).read_bytes())==admission_sha; admission=json.loads(Path(admission_path).read_text())
c=json.loads((O/'CONTROLS.json').read_text());ready=json.loads((O/'READY.json').read_text())
assert admission['status']=='ROOT_ADMITTED_FOUNDATION_ORACLE_INSTALLED_CONTINUATION' and admission['bindingSha256']==binding_sha
assert admission['controlsSha256']==pin(O/'CONTROLS.json')['sha256'] and admission['readySha256']==pin(O/'READY.json')['sha256']
assert admission['commandIds']==[x['id'] for x in c['commands']]
assert b['status']=='FROZEN_FOUNDATION_ORACLE_INSTALLED_CONTINUATION_SUBJECT' and b['proofRoot']==c['proofRoot']
for p in ready['controls']:checked(p)
for k in ['node','npmCli','builderPin','archive']:checked(c[k])
inv=json.loads(checked(b['sourceInventory']));source=Path(b['frozenSourceRoot']);rows=inv['rows'];assert inv['sourceDigest']==b['sourceDigest'];same_source(source,rows)
dep=json.loads(checked(c['dependencyInventory']));seed=json.loads(checked(c['contractSeedInventory']));npm=json.loads(checked(c['npmInventory']));base=json.loads(checked(c['controlledBaseline']))
dep={**dep,'root':c['dependencyRoot']}
reused=json.loads(checked(b['reusedCompiledInventory']));checked(b['proofArchive']);checked(b['archiveMembers']);checked(b['packReturn']);checked(b['buildInputRelation'])
assert reused['sourceDigest']==b['reusedBuildSourceDigest']
assert compiled_rows(Path(reused['root']))==reused['rows'],'accepted compiled donor changed'
for p in b['retainedInputs']:checked(p)
bootstrap_return=json.loads(checked(b['bootstrapReturn']))
assert bootstrap_return['exitCode']==0 and not bootstrap_return['timedOut'] and not bootstrap_return['outputBudgetExceeded'] and bootstrap_return['groupAbsent'] and not bootstrap_return['cleanupNeeded'] and bootstrap_return['signals']==[]
assert bootstrap_return['failure']=='temporary installation differs from exact archive members'
checked(bootstrap_return['stdout']);checked(bootstrap_return['stderr'])
assert group_absent(bootstrap_return['pgid']),'previous bootstrap process group exists'
assert not (Path(b['retainedProofRoot'])/'w2-05').exists(),'whole-file proof already started'
assert [x['id'] for x in c['commands']]==['w2-05']
for v in [dep,seed,npm]:verify_tree(v)
for p in b['preservationPins']:checked(p)
same_source(Path(b['liveSourceRoot']),rows)
assert shutil.disk_usage(source).free>c['reserveBytes']
assert controlled((source/c['tenantRelative']/'test_env/tests/t287-owned-process-lifetime.test.mjs').read_text())==base['blocks'],'controlled source altered'
stage_record=json.loads(checked(b['retainedStage']))
stage=Path(stage_record['frozenStage']);work=Path(stage_record['work']);tenant=work/c['tenantRelative']
assert stage_record['sourceInventory']==b['sourceInventory'] and stage_record['sourceDigest']==b['sourceDigest'] and stage_record['appliedAbsentSeeds']==[]
assert stage==Path(b['retainedProofRoot'])/'source' and work==Path(b['retainedProofRoot'])/'work'
same_source(stage,rows);same_source(work,rows)
retained_compiled=json.loads(checked(b['retainedCompiledInventory']))
assert retained_compiled['root']==str(tenant) and retained_compiled['sourceDigest']==b['sourceDigest'] and retained_compiled['rows']==reused['rows']
assert compiled_rows(tenant)==reused['rows'],'retained compiled work changed'
verify_tree({**dep,'root':str(tenant/'node_modules')})
metadata=json.loads(checked(b['retainedDependencyMetadata']))
assert metadata['equal'] and dependency_metadata(Path(dep['root']))==metadata['before'] and dependency_metadata(tenant/'node_modules')==metadata['after'],'retained dependency metadata changed'
equality=installed_archive_equality()
pkg=json.loads((tenant/'package.json').read_text());assert pkg['scripts']['build']==c['expectedBuildScript'] and pkg['scripts']['lint']==c['expectedLintScript'] and pkg['scripts']['test:unit']==c['expectedUnitScript'],'selected npm scripts changed'
proof=Path(c['proofRoot']);assert not proof.exists(),'create-once continuation output already exists'
proof.mkdir();tmp=proof/'tmp';tmp.mkdir();began=time.monotonic()
try:
 save(proof/'REUSED_STATE.json',{'predecessorBinding':b['predecessorBinding'],'bootstrapReturn':b['bootstrapReturn'],'retainedStage':b['retainedStage'],'retainedCompiledInventory':b['retainedCompiledInventory'],'archiveInstallEquality':equality,'bootstrapGroupAbsent':True,'wholeFilePreviouslyUnstarted':True,'restageRebuildRepackReinstallPerformed':False})
 for n in ['npm-user.npmrc','npm-global.npmrc']:(proof/n).write_text('')
 previous_env=json.loads(checked(b['retainedEnvironment']))
 env={**previous_env['environment'],'TMPDIR':str(tmp),'NODE_COMPILE_CACHE':str(tmp/'node-compile-cache'),'npm_config_cache':str(tmp/'npm-cache'),'npm_config_userconfig':str(proof/'npm-user.npmrc'),'npm_config_globalconfig':str(proof/'npm-global.npmrc')}
 assert env['NODE_OPTIONS']==env['NODE_PATH']=='' and env['npm_config_offline']=='true'
 assert env['ABI5_WAVE1_FROZEN_ARTIFACT_PATH']==b['proofArchive']['path'] and env['ABI5_WAVE1_FROZEN_INSTALL_HOST']==b['bootstrapHost'] and env['ABI5_WAVE1_FROZEN_ARTIFACT_SHA256']==b['proofArchive']['sha256']
 assert not any(k in env for k in c['unsetOptIns']);save(proof/'ENVIRONMENT.json',{**previous_env,'environment':env,'predecessor':b['retainedEnvironment'],'delta':'Only new continuation TMPDIR, compilation/npm cache and empty npm config paths.'})
 results=[];retainedDelta=[];compiled=reused['rows']
 for command in c['commands']:
  assert time.monotonic()-began<c['campaignMaximumSeconds'],'campaign bound'
  assert shutil.disk_usage(proof).free>c['reserveBytes'],'disk reserve'
  out=proof/command['id'];out.mkdir();evidence=out/'evidence';evidence.mkdir();pre=same_source(source,rows);same_source(stage,rows)
  if compiled is not None:assert compiled_rows(tenant)==compiled,'retained tested build changed'
  for p in b['preservationPins']:checked(p)
  same_source(Path(b['liveSourceRoot']),rows)
  argv=[c['node']['path']]+([c['npmCli']['path']] if command['kind']=='npm' else [])+command['args'];signals=[];timed_out=False;command_timed_out=False;campaign_timed_out=False;too_large=False;start=time.monotonic()
  with (out/'stdout.log').open('xb') as stdout,(out/'stderr.log').open('xb') as stderr:
   commandEnv={**env,'ABI5_TEST_EVIDENCE_DIR':str(evidence)}
   commandCwd=Path(command.get('cwd',str(tenant)));child=subprocess.Popen(argv,cwd=commandCwd,env=commandEnv,stdin=subprocess.DEVNULL,stdout=stdout,stderr=stderr,start_new_session=True)
   save(out/'LAUNCH.json',{'argv':argv,'cwd':str(commandCwd),'pid':child.pid,'pgid':child.pid,'absoluteSeconds':command['timeoutSeconds'],'sourcePreDigest':pre,'evidenceDirectory':str(evidence),'environmentDelta':{'ABI5_TEST_EVIDENCE_DIR':str(evidence)}})
   while child.poll() is None:
    command_timed_out=time.monotonic()-start>=command['timeoutSeconds'];campaign_timed_out=time.monotonic()-began>=c['campaignMaximumSeconds'];timed_out=command_timed_out or campaign_timed_out;too_large=(out/'stdout.log').stat().st_size+(out/'stderr.log').stat().st_size>c['maxOutputBytes']
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
  final_output_bytes=(out/'stdout.log').stat().st_size+(out/'stderr.log').stat().st_size;too_large=too_large or final_output_bytes>c['maxOutputBytes']
  group_gone=group_absent(child.pid);report={'id':command['id'],'argv':argv,'pid':child.pid,'pgid':child.pid,'exitCode':code,'wallSeconds':time.monotonic()-start,'timedOut':timed_out,'limitCause':{'commandDeadline':command_timed_out,'campaignDeadline':campaign_timed_out,'combinedOutput':too_large},'finalCombinedOutputBytes':final_output_bytes,'outputBudgetExceeded':too_large,'signals':signals,'groupAbsent':group_gone,'cleanupNeeded':cleanup_needed,'stdout':pin(out/'stdout.log'),'stderr':pin(out/'stderr.log')}
  error=None
  try:
   report['sourcePostDigest']=same_source(source,rows);same_source(stage,rows)
   current=rows_at(work,rows);delta=[{'before':a,'after':z} for a,z in zip(rows,current) if a!=z];report['generatedWorkSourceDifferences']=delta
   allowed=[c['tenantRelative']+'/contracts/',c['tenantRelative']+'/product-toolchain-manifest.json']
   assert all(any(d['before']['path'].startswith(p) for p in allowed) for d in delta),'work code/test/source changed outside build-derived contracts'
   if command['id']=='build':
    retainedDelta=delta;compiled=compiled_rows(tenant);save(proof/'COMPILED_BUILD_INVENTORY.json',{'root':str(tenant),'sourceDigest':b['sourceDigest'],'scopes':['build','contracts','product-toolchain-manifest.json'],'rows':compiled,'inventoryDigest':sha(json.dumps(compiled,separators=(',',':')).encode()),'actualBuild':str(out/'RETURN.json')})
   elif compiled is None:assert delta==[],'prebuild source changed'
   else:assert delta==retainedDelta and compiled_rows(tenant)==compiled,'retained build/contract/manifest delta changed'
   report['retainedEvidence']=[pin(p) for p in sorted(evidence.iterdir()) if p.is_file()]
   for p in evidence.iterdir():assert p.is_file() and p.suffix=='.json';json.loads(p.read_text())
   for p in b['preservationPins']:checked(p)
   same_source(Path(b['liveSourceRoot']),rows)
   assert code==0 and not timed_out and not too_large and group_gone and not cleanup_needed,'command failed/incomplete or owned group cleanup required'
   if command['kind']=='testfile' or command['id']=='unit':report['tap']=tap((out/'stdout.log').read_text(),command)
   if command['id']=='bootstrap':
    equality=installed_archive_equality();save(out/'ARCHIVE_INSTALL_EQUALITY.json',equality);report['archiveInstallEquality']=pin(out/'ARCHIVE_INSTALL_EQUALITY.json')
   if command['id']=='w2-05':
    lines=re.findall(r'^# W2_05_PROOF (\{.*\})$',(out/'stdout.log').read_text(),re.M);assert len(lines)==1,'missing/duplicate actual W2_05_PROOF'
    actual=json.loads(untap(lines[0]));assert actual['tarballDigest']==actual['artifactDigest']=='sha256:'+b['proofArchive']['sha256']
    assert actual['productContentDigest']==b['expectedProductContentDigest'] and actual['definitionCount']==56
    assert actual['addedKeys']==b['expectedAddedKeys'];assert actual['eventCountBeforeCatalog']==actual['eventCountAfterCatalog']==2
    report['installedOwnerProof']=actual;report['actualCallableCensusStanding']='Reported actual callableCount/remainingKeys; no invented fixed callable quota.'
    report['archiveInstallEqualityAfterTest']=installed_archive_equality()
  except Exception as e:error=str(e)
  report['status']='PASSED' if error is None else 'FAILED_OR_INCOMPLETE';report['failure']=error;save(out/'RETURN.json',report);results.append({'id':command['id'],'status':report['status'],'receipt':pin(out/'RETURN.json')});print(json.dumps(results[-1]),flush=True)
  if error:raise RuntimeError(error)
 verify_tree(dep);verify_tree(npm);verify_tree({**dep,'root':str(tenant/'node_modules')});same_source(source,rows);same_source(stage,rows)
 assert compiled_rows(tenant)==compiled,'final tested build changed'
 assert compiled_rows(Path(reused['root']))==reused['rows'],'retained build donor changed'
 installed_archive_equality()
 for p in b['retainedInputs']:checked(p)
 assert group_absent(bootstrap_return['pgid']),'previous bootstrap group reappeared'
 for p in b['preservationPins']:checked(p)
 same_source(Path(b['liveSourceRoot']),rows)
 save(proof/'FINAL_RETURN.json',{'status':'MECHANICAL_PROOF_COMMANDS_PASSED_PENDING_ROOT_REVIEW','sourceDigest':b['sourceDigest'],'commands':results,'originalFrozenSourceConserved':True,'dependencyAndNpmAuthorityConserved':True,'compiledInventory':b['retainedCompiledInventory'],'retainedWorkDelta':retainedDelta,'standing':'Finite commands/full selected files only; skips recorded, no assurance/qualification/acceptance.'})
except Exception as e:
 save(proof/'HALT.json',{'error':str(e),'standing':'Stopped; preserve actual outputs/process receipts/work. No automatic retry, source repair, broader cleanup or following command.'});raise
