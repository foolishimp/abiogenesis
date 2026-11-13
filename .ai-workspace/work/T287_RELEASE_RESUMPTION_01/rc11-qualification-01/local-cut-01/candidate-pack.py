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



import tarfile
controls_path,controls_sha,admission_path,admission_sha=sys.argv[1:]
assert sha(Path(controls_path).read_bytes())==controls_sha;c=json.loads(Path(controls_path).read_text())
assert sha(Path(admission_path).read_bytes())==admission_sha;a=json.loads(Path(admission_path).read_text())
assert a['status']=='ROOT_CONDITIONALLY_ADMITTED_RC11_CANDIDATE_PACK' and a['controlsSha256']==controls_sha
for p in a['files']:checked(p)
for k in ['node','npmCli','builderPin','builderArchive']:checked(c[k])
proofs={k:json.loads(Path(p).read_text()) for k,p in c['proofCommands'].items()}
assert all(x['status']=='PASSED' and x['exitCode']==0 and x['groupAbsent'] for x in proofs.values())
assert json.loads(Path(c['proofFinal']).read_text())['status']=='MECHANICAL_PROOF_COMMANDS_PASSED_PENDING_ROOT_REVIEW'
fr=json.loads(checked(c['sourceInventory']));rows=fr['rows'];source=Path(c['frozenRoot']);work=Path(c['testedWork']);tenant=work/c['tenantRelative']
compiled=json.loads(checked(c['compiledInventory']));dep=json.loads(checked(c['dependencyInventory']));npm=json.loads(checked(c['npmInventory']))
def guards():
 assert same_source(source,rows)==c['sourceDigest']
 current=rows_at(work,rows);assert [{'before':x,'after':z} for x,z in zip(rows,current) if x!=z]==c['retainedWorkDelta']
 got=[]
 for scope in compiled['scopes']:
  root=tenant/scope
  for p in ([root] if root.is_file() else sorted(root.rglob('*'))):
   assert not p.is_symlink()
   if p.is_file():v=pin(p);got.append({'path':p.relative_to(tenant).as_posix(),'bytes':v['bytes'],'sha256':v['sha256']})
 assert sorted(got,key=lambda x:x['path'])==compiled['rows'],'tested compiled tree changed'
 assert shutil.disk_usage(tenant).free>=c['reserveBytes']
guards();verify_tree(dep);verify_tree(npm);verify_tree({**dep,'root':str(tenant/'node_modules')})
output=Path(c['output']);assert not output.exists();output.mkdir();artifacts=output/'artifacts';artifacts.mkdir();tmp=output/'tmp';tmp.mkdir();snap=output/'tested-tree';snap.mkdir()
try:
 for r in compiled['rows']:
  dst=snap/r['path'];dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(tenant/r['path'],dst)
 assert rows_at(snap,compiled['rows'])==compiled['rows']
 save(output/'TESTED_BUILD_SNAPSHOT.json',{'sourceDigest':c['sourceDigest'],'compiledInventory':c['compiledInventory'],'snapshot':str(snap),'rows':len(compiled['rows']),'bytes':sum(r['bytes'] for r in compiled['rows']),'exact':True})
 env=json.loads(checked(c['proofEnvironment']))['environment'];env.update(TMPDIR=str(tmp),NODE_COMPILE_CACHE=str(tmp/'node-compile-cache'),npm_config_cache=str(tmp/'npm-cache'))
 argv=[c['node']['path'],c['npmCli']['path'],'pack','--ignore-scripts','--offline','--json','--pack-destination',str(artifacts)]
 signals=[];timed=False;large=False;start=time.monotonic()
 with (output/'stdout.log').open('xb') as stdout,(output/'stderr.log').open('xb') as stderr:
  child=subprocess.Popen(argv,cwd=tenant,env=env,stdin=subprocess.DEVNULL,stdout=stdout,stderr=stderr,start_new_session=True)
  save(output/'LAUNCH.json',{'argv':argv,'cwd':str(tenant),'pid':child.pid,'pgid':child.pid,'absoluteSeconds':c['absoluteSeconds'],'environment':env,'sourceDigest':c['sourceDigest']})
  while child.poll() is None:
   timed=time.monotonic()-start>=c['absoluteSeconds'];large=(output/'stdout.log').stat().st_size+(output/'stderr.log').stat().st_size>c['maxOutputBytes']
   if timed or large:break
   time.sleep(.1)
  cleanup=not group_absent(child.pid)
  if cleanup:
   for sig,grace in [(signal.SIGTERM,c['signalGraceSeconds']),(signal.SIGKILL,1)]:
    if group_absent(child.pid):break
    try:os.killpg(child.pid,sig);signals.append(sig.name)
    except ProcessLookupError:break
    until=time.monotonic()+grace
    while time.monotonic()<until and not group_absent(child.pid):child.poll();time.sleep(.05)
  try:code=child.wait(timeout=1)
  except subprocess.TimeoutExpired:code=None
 result={'argv':argv,'exitCode':code,'wallSeconds':time.monotonic()-start,'timedOut':timed,'outputBudgetExceeded':large,'signals':signals,'groupAbsent':group_absent(child.pid),'cleanupNeeded':cleanup,'stdout':pin(output/'stdout.log'),'stderr':pin(output/'stderr.log')}
 save(output/'COMMAND_RETURN.json',result)
 assert code==0 and not timed and not large and not cleanup and group_absent(child.pid),'pack command failed/incomplete'
 parsed=json.loads((output/'stdout.log').read_text());assert len(parsed)==1 and parsed[0]['filename']==c['archiveFilename']
 archive=artifacts/c['archiveFilename'];archive_pin=pin(archive);assert parsed[0]['size']==archive_pin['bytes']
 member_rows=[]
 with tarfile.open(archive,'r:gz') as tar:
  members=tar.getmembers();assert len(members)==len({m.name for m in members})
  for m in members:
   assert m.isfile() and m.name.startswith('package/') and not Path(m.name).is_absolute() and '..' not in Path(m.name).parts
   rel=m.name[len('package/'):];safe(rel);data=tar.extractfile(m).read();actual=tenant/rel;assert actual.is_file() and not actual.is_symlink();assert actual.read_bytes()==data,rel
   member_rows.append({'path':rel,'bytes':len(data),'sha256':sha(data),'mode':m.mode})
 member_rows.sort(key=lambda x:x['path']);members_by_path={r['path']:r for r in member_rows}
 for r in compiled['rows']:assert {k:members_by_path[r['path']][k] for k in ['path','bytes','sha256']}==r,'tested build member omitted/changed '+r['path']
 guards();assert rows_at(snap,compiled['rows'])==compiled['rows'];verify_tree(dep);verify_tree(npm)
 save(output/'ARCHIVE_MEMBERS.json',{'archive':archive_pin,'rows':member_rows,'members':len(member_rows),'payloadBytes':sum(r['bytes'] for r in member_rows),'allMembersMatchTestedWork':True,'allCompiledContractManifestMembersPresentAndExact':True})
 save(output/'RETURN.json',{'status':'CANDIDATE_ARCHIVE_MATCHES_EXACT_TESTED_TREE','sourceDigest':c['sourceDigest'],'archive':archive_pin,'members':len(member_rows),'payloadBytes':sum(r['bytes'] for r in member_rows),'compiledInventory':c['compiledInventory'],'testedSnapshot':pin(output/'TESTED_BUILD_SNAPSHOT.json'),'command':pin(output/'COMMAND_RETURN.json'),'memberReceipt':pin(output/'ARCHIVE_MEMBERS.json'),'sourceAndCompiledConserved':True,'standing':'Candidate artifact only; no acceptance, commit, reproduction, install, release, pin or qualification.'})
 print(json.dumps({'archive':archive_pin,'return':pin(output/'RETURN.json'),'members':len(member_rows)}),flush=True)
except Exception as error:
 save(output/'HALT.json',{'error':str(error),'standing':'Preserve allocation and all outputs. No retry, rebuild, source repair or installation.'});raise
