from pathlib import Path
import os,sys,json,hashlib,subprocess,time,signal,re,shutil
O=Path(__file__).resolve().parent

def pin(p):
 p=Path(p);raw=p.read_bytes();return {'path':str(p),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
def checked(x):
 assert pin(x['path'])==x,x['path'];return Path(x['path']).read_bytes()
def save(p,x):
 with Path(p).open('x') as h:json.dump(x,h,indent=2);h.write('\n')
def group_absent(pid):
 try:os.killpg(pid,0);return False
 except ProcessLookupError:return True

def untap(text):
 decoded=re.sub(r'\\([\\#])',r'\1',text)
 assert decoded.replace('\\','\\\\').replace('#','\\#')==text,'TAP escaping roundtrip'
 return decoded

def tap(text,c):
 counts={k:int(v) for k,v in re.findall(r'^# (tests|pass|fail|cancelled|skipped|todo) (\d+)\s*$',text,re.M)}
 assert 'TAP version 13' in text and re.search(r'^1\.\.\d+\s*$',text,re.M),'incomplete TAP framing'
 assert set(counts)=={'tests','pass','fail','cancelled','skipped','todo'},'incomplete counts'
 names=[untap(v) for v in re.findall(r'^# Subtest: (.*)$',text,re.M)]
 assert names==c['expectedNames'] and counts['tests']==len(names),'literal case population differs'
 assert counts['cancelled']==counts['skipped']==counts['todo']==0,'incomplete/skipped cases'
 if c['id']=='baseline-signal':
  assert counts['fail'] in [0,1] and counts['pass']==1-counts['fail'],'baseline comparison framing'
  if counts['fail']:assert 'ERR_ASSERTION' in text and c['expectedFailureMessage'] in text,'unexpected baseline failure'
 else:assert counts['fail']==0 and counts['pass']==counts['tests'],'test failure'
 diagnostics=[]
 for line in text.splitlines():
  m=re.match(r'^\s*#\s*((?:evidence )?\{.*\})\s*$',line)
  if m:
   raw=m.group(1);decoded=untap(raw);diagnostics.append({'rawLine':line,'decoded':json.loads(decoded.removeprefix('evidence '))})
 result={'counts':counts,'names':names,'diagnostics':diagnostics,'complete':True}
 if c['id']=='owned-lifetime':
  values=[r['decoded'] for r in diagnostics]
  http=[r for r in values if r.get('owner')=='http' and 'mode' in r and 'evidence' not in r]
  capture=[r for r in values if 'capturedBytes' in r and r.get('owner') in ['worker','command','http']]
  assert len(http)==5 and len({r['mode'] for r in http})==5,'missing five HTTP diagnostics'
  assert len(capture)==3 and {r['owner'] for r in capture}=={'worker','command','http'},'missing three capture diagnostics'
  assert b['handback']['name'] in names
  result['controlledPopulation']={**b['handback'],'standing':'Exact unchanged loop plus whole-case pass; no per-iteration instrumentation claim.'}
 return result

def rows_at(root,rows):
 for row in rows:
  p=pin(Path(root)/row['path']);assert(p['bytes'],p['sha256'])==(row['bytes'],row['sha256']),p['path']

binding_path,binding_sha,admission_path,admission_sha=sys.argv[1:]
assert pin(binding_path)['sha256']==binding_sha;b=json.loads(Path(binding_path).read_text())
assert pin(admission_path)['sha256']==admission_sha;a=json.loads(Path(admission_path).read_text())
assert a['status']=='ROOT_ADMITTED_PHASE2_A_R2_PROOF' and a['bindingSha256']==binding_sha
assert a['readySha256']==pin(O/'READY.json')['sha256'] and a['commandIds']==['r1-probe','r2-immediate','baseline-signal','owned-lifetime']
checked(b['driver']);checked(b['controls']);checked(b['node']);commands=json.loads(checked(b['controls']))['commands'];root=Path(b['proofRoot'])
assert not root.exists() and not (O/'RETURN.json').exists(),'one allocation only'

def guards(staged=False):
 for p in b['protectionPins']+b['relationPins']+b['fixtureBindings']:checked(p)
 inv=json.loads(checked(b['sourceInventory']))
 for r in [b['sourceRoot'],b['frozenRoot']]:rows_at(r,inv['rows'])
 for p in [b['compiledInventory'],b['baselineCompiledInventory']]:
  ci=json.loads(checked(p));rows_at(ci['root'],ci['rows'])
 deps=json.loads(checked(b['dependencyInventory']))
 for row in deps['rows']:
  p=Path(b['dependencyRoot'])/row['path']
  if row['kind']=='symlink':assert p.is_symlink() and os.readlink(p)==row['target']
  else:
   assert not p.is_symlink();v=pin(p);assert(v['bytes'],v['sha256'])==(row['bytes'],row['sha256'])
 for r,h in b['heads'].items():assert subprocess.check_output(['/usr/bin/git','-C',r,'rev-parse','HEAD'],env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'},text=True).strip()==h
 if staged:
  for x in b['stageFiles']:
   v=pin(root/'test-tenant'/x['relativePath']);assert(v['bytes'],v['sha256'])==(x['source']['bytes'],x['source']['sha256'])
  assert (root/'test-tenant/node_modules').is_symlink() and (root/'test-tenant/node_modules').resolve()==Path(b['dependencyRoot']).resolve()
 assert shutil.disk_usage(O).free>b['reserveBytes'],'free-space reserve'
 return {'passed':True,'sourceDigest':inv['sourceDigest'],'sourceRows':len(inv['rows']),'compiledRows':582,'baselineCompiledRows':996,'stagedInputsVerified':staged}

began=time.monotonic();pre=guards();root.mkdir(mode=0o700);receipts=[];halt=None
for x in b['stageFiles']:
 data=checked(x['source']);dest=root/'test-tenant'/x['relativePath'];dest.parent.mkdir(parents=True,exist_ok=True)
 with dest.open('xb') as h:h.write(data)
os.symlink(b['dependencyRoot'],root/'test-tenant/node_modules')
try:
 for c in commands:
  assert time.monotonic()-began<b['campaignSeconds'],'campaign deadline before command'
  pre=guards(True);outdir=root/c['id'];outdir.mkdir();(outdir/'tmp').mkdir();(outdir/'evidence').mkdir()
  env=c['environment'];out=outdir/'stdout.log';err=outdir/'stderr.log';signals=[];cause=None;start=time.monotonic()
  with out.open('xb') as stdout,err.open('xb') as stderr:
   child=subprocess.Popen(c['argv'],cwd=c['cwd'],env=env,stdin=subprocess.DEVNULL,stdout=stdout,stderr=stderr,start_new_session=True)
   save(O/(c['id']+'.LAUNCH.json'),{'argv':c['argv'],'pid':child.pid,'pgid':child.pid,'capSeconds':c['capSeconds'],'preflight':pre,'environment':env})
   while child.poll() is None:
    if time.monotonic()-start>=c['capSeconds']:cause='command_deadline';break
    if time.monotonic()-began>=b['campaignSeconds']:cause='campaign_deadline';break
    if out.stat().st_size+err.stat().st_size>c['outputBytes']:cause='combined_output';break
    time.sleep(.05)
   cleanup_needed=not group_absent(child.pid)
   if cleanup_needed:
    for sig,grace in [(signal.SIGTERM,1),(signal.SIGKILL,1)]:
     if group_absent(child.pid):break
     try:os.killpg(child.pid,sig);signals.append({'signal':sig.name,'pgid':child.pid,'atSeconds':time.monotonic()-start})
     except ProcessLookupError:break
     end=time.monotonic()+grace
     while time.monotonic()<end and not group_absent(child.pid):child.poll();time.sleep(.05)
   try:code=child.wait(timeout=1)
   except subprocess.TimeoutExpired:code=None
  if time.monotonic()-start>=c['capSeconds']:cause=cause or 'command_deadline'
  if time.monotonic()-began>=b['campaignSeconds']:cause=cause or 'campaign_deadline'
  if out.stat().st_size+err.stat().st_size>c['outputBytes']:cause='combined_output'
  absent=group_absent(child.pid);report={'id':c['id'],'argv':c['argv'],'pid':child.pid,'pgid':child.pid,'exitCode':code,'wallSeconds':time.monotonic()-start,'limitCause':cause,'cleanupNeeded':cleanup_needed,'signals':signals,'groupAbsent':absent,'stdout':pin(out),'stderr':pin(err),'evidence':[pin(x) for x in sorted((outdir/'evidence').rglob('*')) if x.is_file()]};error=None
  try:
   report['postguards']=guards(True)
   assert cause is None and not cleanup_needed and absent,'runner limit/cleanup'
   if c['kind']=='probe':
    obs=Path(c['observation']);report['observation']=pin(obs);v=json.loads(obs.read_text())
    assert code==0 and v['callError'] is None and v['completionSettled'] and v['settledWithinBound'],'probe failure'
    if c['id']=='r2-immediate':assert v['cleanupError'] is None
   else:
    report['tap']=tap(out.read_text(),c)
    expected=1 if c['id']=='baseline-signal' and report['tap']['counts']['fail']==1 else 0
    assert code==expected,'unexpected exit'
  except Exception as e:error=str(e)
  report['status']='BASELINE_COMPARISON_RETAINED' if not error and c['id']=='baseline-signal' else 'PASSED' if not error else 'FAILED';report['failure']=error
  save(O/(c['id']+'.RETURN.json'),report);receipts.append(pin(O/(c['id']+'.RETURN.json')));print(json.dumps({'id':c['id'],'status':report['status'],'exitCode':code,'receipt':receipts[-1]}),flush=True)
  if error:raise RuntimeError(error)
except Exception as e:halt=str(e)
save(O/'RETURN.json',{'status':'SELECTED_A_PROOF_RETAINED' if halt is None else 'HALTED','admission':pin(admission_path),'receipts':receipts,'campaignSeconds':time.monotonic()-began,'halt':halt,'standing':'Four selected commands only; baseline comparison separately classified. No installed/full Phase2 acceptance; Root conjoins actual evidence.'})
if halt:raise SystemExit(1)
