from pathlib import Path
import os,sys,json,hashlib,subprocess,time,signal
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
binding_path,binding_sha,admission_path,admission_sha=sys.argv[1:]
assert pin(binding_path)['sha256']==binding_sha
b=json.loads(Path(binding_path).read_text())
assert pin(admission_path)['sha256']==admission_sha
a=json.loads(Path(admission_path).read_text())
assert a['status']=='ROOT_ADMITTED_PHASE2_A_IMMEDIATE_PROBE'
assert a['bindingSha256']==binding_sha and a['readySha256']==pin(O/'READY.json')['sha256']
assert a['commandIds']==['baseline','candidate']
checked(b['script']);checked(b['driver']);checked(b['node'])
def guards():
 for p in b['protectionPins']+b['relationPins']:checked(p)
 for subject in b['subjects'].values():
  for p in subject['modulePins']:checked(p)
 inv=json.loads(checked(b['sourceInventory']))
 for root in [b['sourceRoot'],b['frozenRoot']]:
  for row in inv['rows']:
   p=pin(Path(root)/row['path']);assert (p['bytes'],p['sha256'])==(row['bytes'],row['sha256']),p['path']
 compiled=json.loads(checked(b['compiledInventory']))
 for row in compiled['rows']:
  p=pin(Path(compiled['root'])/row['path']);assert(p['bytes'],p['sha256'])==(row['bytes'],row['sha256']),p['path']
 for root,head in b['heads'].items():
  actual=subprocess.check_output(['/usr/bin/git','-C',root,'rev-parse','HEAD'],env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'},text=True).strip();assert actual==head
 return {'passed':True,'sourceDigest':inv['sourceDigest'],'sourceRows':len(inv['rows']),'compiledRows':len(compiled['rows'])}
assert not (O/'RETURN.json').exists(),'one allocation only'
for mode in ['baseline','candidate']:
 assert not (O/(mode+'.RETURN.json')).exists() and not Path(b['subjects'][mode]['outputRoot']).exists()
pre=guards();began=time.monotonic();receipts=[];halt=None
env={k:os.environ[k] for k in ['HOME','USER','LOGNAME','LANG'] if k in os.environ}
env.update(PATH='/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin',NODE_OPTIONS='',NODE_PATH='',NODE_DISABLE_COMPILE_CACHE='1',GIT_OPTIONAL_LOCKS='0')
try:
 for mode in ['baseline','candidate']:
  assert time.monotonic()-began<b['limits']['campaignSeconds'],'campaign deadline before next command'
  pre=guards();argv=[b['node']['path'],b['script']['path'],str(Path(binding_path).resolve()),binding_sha,mode]
  out=O/(mode+'.stdout.log');err=O/(mode+'.stderr.log');signals=[];cause=None;start=time.monotonic()
  with out.open('xb') as stdout,err.open('xb') as stderr:
   child=subprocess.Popen(argv,cwd=O,env=env,stdin=subprocess.DEVNULL,stdout=stdout,stderr=stderr,start_new_session=True)
   save(O/(mode+'.LAUNCH.json'),{'argv':argv,'pid':child.pid,'pgid':child.pid,'limits':b['limits'],'preflight':pre,'environment':env})
   while child.poll() is None:
    if time.monotonic()-start>=b['limits']['commandSeconds']:cause='command_deadline';break
    if time.monotonic()-began>=b['limits']['campaignSeconds']:cause='campaign_deadline';break
    if out.stat().st_size+err.stat().st_size>b['limits']['outputBytes']:cause='combined_output';break
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
  if time.monotonic()-start>=b['limits']['commandSeconds']:cause=cause or 'command_deadline'
  if time.monotonic()-began>=b['limits']['campaignSeconds']:cause=cause or 'campaign_deadline'
  if out.stat().st_size+err.stat().st_size>b['limits']['outputBytes']:cause='combined_output'
  absent=group_absent(child.pid);obs=Path(b['subjects'][mode]['outputRoot'])/'OBSERVATION.json'
  report={'mode':mode,'argv':argv,'pid':child.pid,'pgid':child.pid,'exitCode':code,'wallSeconds':time.monotonic()-start,'limitCause':cause,'cleanupNeeded':cleanup_needed,'signals':signals,'groupAbsent':absent,'stdout':pin(out),'stderr':pin(err),'observation':pin(obs) if obs.exists() else None}
  error=None
  try:
   report['postguards']=guards()
   assert cause is None and not cleanup_needed and absent and code in [0,1],'runner failure/limit/cleanup'
   assert obs.exists(),'intended observations absent'
   v=json.loads(obs.read_text());assert v['callError'] is None and v['cleanupError'] is None and v['settledWithinBound'] and v['completionSettled'],'fixture did not complete its observation/cleanup'
   assert v['injection']=='first probe exit(0,null) only; no close' and v['beforeAdvance']['atNs']=={'kind':'bigint','value':'0'}
   report['intendedObservationsRetained']=True
  except Exception as e:error=str(e)
  report['status']='CONTROLLED_OBSERVATION_RETAINED' if error is None else 'FIXTURE_OR_RUNNER_FAILURE';report['failure']=error
  save(O/(mode+'.RETURN.json'),report);receipts.append(pin(O/(mode+'.RETURN.json')));print(json.dumps({'mode':mode,'exitCode':code,'status':report['status'],'receipt':receipts[-1]}),flush=True)
  if error:raise RuntimeError(error)
except Exception as e:halt=str(e)
save(O/'RETURN.json',{'status':'TWO_CONTROLLED_RUNS_RETAINED' if halt is None else 'HALTED','admission':pin(admission_path),'receipts':receipts,'campaignSeconds':time.monotonic()-began,'halt':halt,'standing':'Exactly one baseline and one candidate observation attempt. Assertion failure is retained evidence; no retry or source repair. Controlled host only, no OS child/installed proof.'})
if halt:raise SystemExit(1)
