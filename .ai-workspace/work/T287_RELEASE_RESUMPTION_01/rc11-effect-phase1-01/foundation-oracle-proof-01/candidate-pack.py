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

import tarfile
controls_path,controls_sha,admission_path,admission_sha=sys.argv[1:]
assert sha(Path(controls_path).read_bytes())==controls_sha;c=json.loads(Path(controls_path).read_text())
assert sha(Path(admission_path).read_bytes())==admission_sha;a=json.loads(Path(admission_path).read_text())
assert a['status']=='ROOT_ADMITTED_FOUNDATION_ORACLE_PROOF_PACK' and a['controlsSha256']==controls_sha
for p in a['files']:checked(p)
for k in ['node','npmCli','builderPin','builderArchive','rootPhase1Acceptance','buildInputRelation','subjectInventory']:checked(c[k])
assert c['status']=='PREPARED_FOUNDATION_ORACLE_PROOF_PACK_HELD'
subject=json.loads(checked(c['subjectInventory']));assert subject['sourceDigest']==c['subjectSourceDigest']
assert json.loads(checked(c['buildInputRelation']))['rebuildOrRegenerationRequiredForSelectedDelta'] is False
fr=json.loads(checked(c['sourceInventory']));rows=fr['rows'];source=Path(c['frozenRoot']);work=Path(c['testedWork']);tenant=work/c['tenantRelative']
compiled=json.loads(checked(c['compiledInventory']));dep=json.loads(checked(c['dependencyInventory']));npm=json.loads(checked(c['npmInventory']))
def guards():
 assert same_source(Path(c['subjectFrozenRoot']),subject['rows'])==c['subjectSourceDigest']
 assert same_source(Path(c['subjectSourceRoot']),subject['rows'])==c['subjectSourceDigest']
 for p in c['preservationPins']:checked(p)
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
 large=large or (output/'stdout.log').stat().st_size+(output/'stderr.log').stat().st_size>c['maxOutputBytes']
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
 save(output/'RETURN.json',{'status':'CANDIDATE_ARCHIVE_MATCHES_EXACT_TESTED_TREE','sourceDigest':c['sourceDigest'],'archive':archive_pin,'members':len(member_rows),'payloadBytes':sum(r['bytes'] for r in member_rows),'compiledInventory':c['compiledInventory'],'testedSnapshot':pin(output/'TESTED_BUILD_SNAPSHOT.json'),'command':pin(output/'COMMAND_RETURN.json'),'memberReceipt':pin(output/'ARCHIVE_MEMBERS.json'),'sourceAndCompiledConserved':True,'subjectSourceDigest':c['subjectSourceDigest'],'buildInputRelation':c['buildInputRelation'],'standing':'Current proof artifact only; selected oracle full installed proof remains pending. No release/install/publication or whole qualification.'})
 print(json.dumps({'archive':archive_pin,'return':pin(output/'RETURN.json'),'members':len(member_rows)}),flush=True)
except Exception as error:
 save(output/'HALT.json',{'error':str(error),'standing':'Preserve allocation and all outputs. No retry, rebuild, source repair or installation.'});raise
