from pathlib import Path
import hashlib, json, os, signal, subprocess, sys, time
D=Path(__file__).resolve().parent
cfg=json.loads((D/'execution-configuration.json').read_text())
activation=json.loads((D/'activation.json').read_text())
assert cfg['operation']==activation['operation']=='T287_REUSE_CONSUMER_REPAIR_01'
phase=sys.argv[1]
assert phase in cfg['commands']
def save(name,value):
 with (D/name).open('x') as f: json.dump(value,f,indent=2); f.write('\n')
def digest(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
for pin in cfg['sourcePins']+[cfg['reporter']]:
 assert Path(pin['path']).stat().st_size==pin['bytes'] and digest(pin['path'])==pin['sha256']
if not (D/'overall-start.json').exists(): save('overall-start.json',{'epoch':time.time(),'capSeconds':cfg['overall']})
remaining=cfg['overall']-(time.time()-json.loads((D/'overall-start.json').read_text())['epoch'])
assert remaining>cfg['terminationGrace']
cap=min(cfg['caps'][phase],remaining-cfg['terminationGrace'])
env=dict(os.environ)
for k in ['NODE_OPTIONS','NODE_PATH','V8_OPTIONS']: env.pop(k,None)
for k in list(env):
 if k.lower().startswith('npm_config_'): env.pop(k)
env.update(TMPDIR=str(D/'tmp'),NODE_COMPILE_CACHE=str(D/'tmp/node-compile-cache'),
 ABI5_RETAINED_CONSUMER_CONFIG=str(D/'config.json'),ABI5_RETAINED_CONSUMER_PHASE=phase,
 npm_config_cache=str(D/'npm-cache'),npm_config_offline='true',npm_config_ignore_scripts='true',
 PATH=str(Path(cfg['node']).parent)+':/usr/bin:/bin:/usr/sbin:/sbin')
assert env.get('HOME')==cfg['HOME']
commands=cfg['commands'][phase] if phase=='syntax' else [cfg['commands'][phase]]
phase_start=time.monotonic(); rows=[]
for i,command in enumerate(commands):
 stem=phase if len(commands)==1 else phase+'-'+str(i)
 record={'operation':cfg['operation'],'phase':phase,'command':command,'cwd':cfg['cwd'],
 'capSeconds':cap,'defaultHeap':True,'HOME':env['HOME'],'TMPDIR':env['TMPDIR'],
 'reporterPin':cfg['reporter'],'SourcePins':cfg['sourcePins'],'streamsOpenedBeforeSpawn':True}
 save(stem+'.started.json',record)
 timedout=False; start=time.monotonic()
 with (D/(stem+'.stdout')).open('x') as out,(D/(stem+'.stderr')).open('x') as err:
  child=subprocess.Popen(command,cwd=cfg['cwd'],env=env,stdout=out,stderr=err,start_new_session=True)
  save(stem+'.process-start.json',{'pid':child.pid,'pgid':child.pid,'startedBeforeOwnerImport':True})
  print(json.dumps({'stage':phase,'pid':child.pid,'pgid':child.pid,'budgetSeconds':cap}),flush=True)
  def collect(deadline):
   while True:
    pid,status,usage=os.wait4(child.pid,os.WNOHANG)
    if pid: return status,usage
    if time.monotonic()>=deadline:return None
    time.sleep(.025)
  result=collect(phase_start+cap)
  if result is None:
   timedout=True
   try:os.killpg(child.pid,signal.SIGTERM)
   except ProcessLookupError:pass
   result=collect(time.monotonic()+cfg['terminationGrace'])
   if result is None:
    try:os.killpg(child.pid,signal.SIGKILL)
    except ProcessLookupError:pass
    _,status,usage=os.wait4(child.pid,0);result=(status,usage)
  status,usage=result;code=os.waitstatus_to_exitcode(status);child.returncode=code
 def absent():
  try:os.killpg(child.pid,0);return False
  except ProcessLookupError:return True
 group_absent=absent()
 if not group_absent:
  try:os.killpg(child.pid,signal.SIGTERM)
  except ProcessLookupError:pass
  until=time.monotonic()+cfg['terminationGrace']
  while not absent() and time.monotonic()<until:time.sleep(.025)
  if not absent():
   try:os.killpg(child.pid,signal.SIGKILL)
   except ProcessLookupError:pass
  group_absent=absent()
 record.update(pid=child.pid,pgid=child.pid,exitCode=code,timedOut=timedout,wait4Reaped=True,
 wait4Status=status,groupAbsent=group_absent,elapsedMs=(time.monotonic()-start)*1000,
 userCPUSeconds=usage.ru_utime,systemCPUSeconds=usage.ru_stime,maxRSSPlatformBytes=usage.ru_maxrss,
 stdoutSHA256=digest(D/(stem+'.stdout')),stderrSHA256=digest(D/(stem+'.stderr')))
 save(stem+'.receipt.json',record);rows.append(record)
 if timedout or not group_absent or code!=0:
  save(phase+'.result.json',{'status':'stopped','receipts':rows});print(json.dumps({'stage':phase,'status':'stopped','exitCode':code,'groupAbsent':group_absent}),flush=True);sys.exit(1)
save(phase+'.result.json',{'status':'passed','elapsedMs':(time.monotonic()-phase_start)*1000,'receipts':rows})
print(json.dumps({'stage':phase,'status':'passed','elapsedMs':(time.monotonic()-phase_start)*1000}),flush=True)
