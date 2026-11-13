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
assert sha(Path(binding_path).read_bytes())==binding_sha; b=json.loads(Path(binding_path).read_text())
assert sha(Path(admission_path).read_bytes())==admission_sha; admission=json.loads(Path(admission_path).read_text())
c=json.loads((O/'CONTROLS.json').read_text());ready=json.loads((O/'READY.json').read_text())
assert admission['status']=='ROOT_ADMITTED_RC11_PROOF' and admission['bindingSha256']==binding_sha
assert admission['controlsSha256']==pin(O/'CONTROLS.json')['sha256'] and admission['readySha256']==pin(O/'READY.json')['sha256']
assert admission['commandIds']==[x['id'] for x in c['commands']]
assert b['status']=='FROZEN_C11_PROOF_SUBJECT' and b['proofRoot']==c['proofRoot']
for p in ready['controls']:checked(p)
for k in ['node','npmCli','builderPin','archive']:checked(c[k])
inv=json.loads(checked(b['sourceInventory']));source=Path(b['frozenSourceRoot']);rows=inv['rows'];assert inv['sourceDigest']==b['sourceDigest'];same_source(source,rows)
dep=json.loads(checked(c['dependencyInventory']));seed=json.loads(checked(c['contractSeedInventory']));npm=json.loads(checked(c['npmInventory']));base=json.loads(checked(c['controlledBaseline']))
for v in [dep,seed,npm]:verify_tree(v)
assert controlled((source/c['tenantRelative']/'test_env/tests/t287-owned-process-lifetime.test.mjs').read_text())==base['blocks'],'controlled source altered'
proof=Path(c['proofRoot']);assert not proof.exists(),'create-once proof root already exists'
proof.mkdir();stage=proof/'source';work=proof/'work';tmp=proof/'tmp';stage.mkdir();work.mkdir();tmp.mkdir();began=time.monotonic()
try:
 for row in rows:
  src=source/safe(row['path']);dst=stage/row['path'];dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst)
 same_source(stage,rows);shutil.copytree(stage,work,dirs_exist_ok=True);tenant=work/c['tenantRelative']
 shutil.copytree(dep['root'],tenant/'node_modules',symlinks=True);verify_tree({**dep,'root':str(tenant/'node_modules')})
 applied=[]
 for row in seed['rows']:
  assert row['kind']=='file';dest=tenant/'contracts'/safe(row['path'])
  if not dest.exists():dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(Path(seed['root'])/row['path'],dest);applied.append(row)
 assert rows_at(work,rows)==rows,'seed overwrote original source'
 save(proof/'STAGE.json',{'sourceInventory':b['sourceInventory'],'sourceDigest':b['sourceDigest'],'frozenStage':str(stage),'work':str(work),'dependencyInventory':c['dependencyInventory'],'contractSeedInventory':c['contractSeedInventory'],'appliedAbsentSeeds':applied,'allOriginalSourceBytesEqual':True})
 assert time.monotonic()-began<c['stageMaximumSeconds'],'stage budget'
 pkg=json.loads((tenant/'package.json').read_text());assert pkg['scripts']['build']==c['expectedBuildScript'] and pkg['scripts']['lint']==c['expectedLintScript'] and pkg['scripts']['test:unit']==c['expectedUnitScript'],'selected npm scripts changed'
 for n in ['npm-user.npmrc','npm-global.npmrc']:(proof/n).write_text('')
 env={k:os.environ[k] for k in ['HOME','USER','LOGNAME','SHELL','LANG'] if k in os.environ};env.update(PATH=str(Path(c['node']['path']).parent)+':/usr/bin:/bin:/usr/sbin:/sbin',TMPDIR=str(tmp),NODE_OPTIONS='',NODE_PATH='',NODE_COMPILE_CACHE=str(tmp/'node-compile-cache'),FORCE_COLOR='0',npm_config_offline='true',npm_config_audit='false',npm_config_fund='false',npm_config_update_notifier='false',npm_config_cache=str(tmp/'npm-cache'),npm_config_userconfig=str(proof/'npm-user.npmrc'),npm_config_globalconfig=str(proof/'npm-global.npmrc'))
 assert not any(k in env for k in c['unsetOptIns']);save(proof/'ENVIRONMENT.json',{'environment':env,'unsetOptIns':c['unsetOptIns'],'excludedAmbientNames':sorted(k for k in os.environ if k not in env),'paidProviderSelected':False,'networkPolicy':'Offline npm; only mandatory local loopback HTTP fixtures; no live provider selection.'})
 results=[]
 for command in c['commands']:
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
   allowed=[c['tenantRelative']+'/contracts/',c['tenantRelative']+'/product-toolchain-manifest.json']
   assert all(any(d['before']['path'].startswith(p) for p in allowed) for d in delta),'work code/test/source changed outside build-derived contracts'
   assert code==0 and not timed_out and not too_large and group_gone and not cleanup_needed,'command failed/incomplete or owned group cleanup required'
   if command['kind']=='testfile' or command['id']=='unit':report['tap']=tap((out/'stdout.log').read_text(),command)
  except Exception as e:error=str(e)
  report['status']='PASSED' if error is None else 'FAILED_OR_INCOMPLETE';report['failure']=error;save(out/'RETURN.json',report);results.append({'id':command['id'],'status':report['status'],'receipt':pin(out/'RETURN.json')});print(json.dumps(results[-1]),flush=True)
  if error:raise RuntimeError(error)
 verify_tree(dep);verify_tree(npm);same_source(source,rows);same_source(stage,rows)
 save(proof/'FINAL_RETURN.json',{'status':'MECHANICAL_PROOF_COMMANDS_PASSED_PENDING_ROOT_REVIEW','sourceDigest':b['sourceDigest'],'commands':results,'originalFrozenSourceConserved':True,'dependencyAndNpmAuthorityConserved':True,'standing':'Finite commands/full selected files only; skips recorded, no assurance/qualification/acceptance.'})
except Exception as e:
 save(proof/'HALT.json',{'error':str(e),'standing':'Stopped; preserve actual outputs/process receipts/work. No automatic retry, source repair, broader cleanup or following command.'});raise
