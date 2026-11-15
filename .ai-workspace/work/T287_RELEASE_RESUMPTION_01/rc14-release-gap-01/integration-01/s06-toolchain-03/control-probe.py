#!/usr/bin/env python3
"""Exactly one syntax child and one small Unix control child; no Java/SBT."""
import ast,datetime,hashlib,importlib.util,json,os,stat,sys,time
from pathlib import Path
sys.dont_write_bytecode=True
HERE=Path(__file__).resolve().parent
ACT=json.loads((HERE/'ACTIVATION.json').read_text())
RAW=Path(ACT['rawRoot']);WORK=Path(ACT['workRoot'])
spec=importlib.util.spec_from_file_location('finite_control_owner',HERE/'process-owner.py');owner=importlib.util.module_from_spec(spec);spec.loader.exec_module(owner)
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def main():
 proof=RAW/'control-probe-01';assert not proof.exists(),'one control probe only';proof.mkdir()
 start=datetime.datetime.now(datetime.timezone.utc);clock=time.monotonic();end=clock+60;cutoff=end-10
 owner.write(proof/'CONTROL_START.json',{'startedUtc':start.isoformat(),'deadlineUtc':(start+datetime.timedelta(seconds=60)).isoformat(),'monotonicStart':clock,'monotonicDeadline':end,'executionStopMonotonic':cutoff,'oneSyntaxAndOneIpcOnly':True})
 entries=[{'path':p.name,'bytes':p.stat().st_size,'sha256':sha(p)} for p in sorted(HERE.iterdir()) if p.is_file()]
 owner.write(proof/'CONTROL_PREIMAGE.json',{'sourceBase':ACT['sourceHeadBeforeControls'],'controls':entries})
 failure=None;closed=False
 try:
  assert not WORK.exists();WORK.mkdir();(WORK/'tmp').mkdir();(WORK/'ipc').mkdir();(WORK/'ipc'/'.sbt').mkdir()
  tree=ast.parse((HERE/'preflight.py').read_text());node=next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='sandbox_profile')
  scope={'json':json};exec(compile(ast.Module(body=[node],type_ignores=[]),'<exact sandbox profile producer>','exec'),scope)
  streams=[proof/name/stream for name in ['001-syntax','002-unix-ipc'] for stream in ['stdout.raw','stderr.raw']]
  profile=proof/'offline.sb';profile.write_text(scope['sandbox_profile'](WORK,streams))
  env={'HOME':str(WORK),'TMPDIR':str(WORK/'tmp'),'XDG_RUNTIME_DIR':str(WORK/'ipc'),'PATH':'/usr/bin:/bin','LANG':'en_US.UTF-8','LC_ALL':'C'}
  for name,argv,seconds in [('001-syntax',['/usr/bin/sandbox-exec','-f',str(profile),'/usr/bin/true'],5),('002-unix-ipc',['/usr/bin/sandbox-exec','-f',str(profile),'/usr/bin/python3','-B',str(HERE/'unix-ipc-probe.py'),str(WORK)],10)]:
   print(json.dumps({'starting':name}),flush=True)
   receipt=owner.run(proof/name,argv,WORK,env,seconds,1048576,cutoff)
   print(json.dumps({'closed':name,'exitCode':receipt['exitCode'],'elapsedMs':receipt['elapsedMs']}),flush=True)
 except BaseException as error:
  failure={'name':type(error).__name__,'message':str(error)};owner.write(proof/'FIRST_FAILURE.json',failure)
 finally:
  try:
   for p in [WORK/'ipc'/'.sbt'/'control.sock',WORK/'tmp'/'refused.sock']:
    if p.exists():
     assert stat.S_ISSOCK(p.lstat().st_mode),'unexpected non-socket retained';p.unlink()
   for p in [WORK/'ipc'/'.sbt',WORK/'ipc',WORK/'tmp',WORK]:
    if p.exists():p.rmdir()
   closed=not WORK.exists()
  except BaseException as error:failure=failure or {'name':type(error).__name__,'message':'cleanup: '+str(error)}
  conserved=all((HERE/x['path']).stat().st_size==x['bytes'] and sha(HERE/x['path'])==x['sha256'] for x in entries)
  commands=[]
  for name in ['001-syntax','002-unix-ipc']:
   p=proof/name/'RETURN.json'
   if p.exists():commands.append({'name':name,'receipt':json.loads(p.read_text())})
  completed=datetime.datetime.now(datetime.timezone.utc);within=time.monotonic()<end and completed<start+datetime.timedelta(seconds=60)
  good=failure is None and closed and conserved and within and len(commands)==2
  result={'disposition':'control_probes_satisfied' if good else 'stopped_unresolved','failure':failure,'commands':commands,'withinDeadline':within,'ownedWorkRootRemoved':closed,'controlsConserved':conserved,'completedUtc':completed.isoformat(),'javaOrSbtLaunched':False,'applicationOrProductExecuted':False,'scope':'Only exact owned Unix exchange/path and IP-denial controls; no universal network proof'}
  owner.write(proof/'RETURN.json',result);print(json.dumps({k:result[k] for k in ['disposition','failure','withinDeadline','ownedWorkRootRemoved','controlsConserved']}),flush=True)
 return 0 if good else 1
if __name__=='__main__':raise SystemExit(main())
