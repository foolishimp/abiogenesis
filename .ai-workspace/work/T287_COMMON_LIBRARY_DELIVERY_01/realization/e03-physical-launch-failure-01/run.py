from pathlib import Path
import json, hashlib, os, subprocess, time, signal, datetime, shutil, sys, traceback
D=Path(__file__).resolve().parent
def load(p):return json.loads(p.read_text())
def pin(p):
 data=p.read_bytes();return {'path':str(p),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
def probe(pid):
 try:os.kill(pid,0);return {'state':'present'}
 except ProcessLookupError:return {'state':'absent','errno':'ESRCH'}
 except OSError as e:return {'state':'unknown','errno':e.errno,'message':str(e)}
config=load(D/'config.json');evidence=Path(config['evidenceRoot']);scratch=Path(config['scratchRoot'])
try:
 for row in load(D/'execution-freeze.json')['files']:
  actual=pin(D/row['path']);assert actual['sha256']==row['sha256'] and actual['bytes']==row['bytes'],row['path']
 assert pin(Path(config['nodeExecutable']))['sha256']==config['nodeSha256']
 for root in [scratch,evidence]:
  assert not root.exists() and not root.is_symlink(),str(root)
  root.mkdir(mode=0o700);assert root.resolve()==root
 for name in ['worker-cwd','command-cwd','direct-cwd']:(scratch/name).mkdir(mode=0o700)
 assert not Path(config['absentExecutable']).exists()
 argv=[config['nodeExecutable'],'--experimental-vm-modules',str(D/'host.mjs')]
 environment={key:value for key,value in os.environ.items() if key not in ['NODE_OPTIONS','NODE_COMPILE_CACHE']}
 started=datetime.datetime.now(datetime.timezone.utc).isoformat();begin=time.monotonic();deadline=False;watchdogSignals=[]
 with (evidence/'host.stdout').open('xb') as stdout,(evidence/'host.stderr').open('xb') as stderr:
  host=subprocess.Popen(argv,cwd=D,env=environment,stdout=stdout,stderr=stderr,start_new_session=True)
  (D/'host-start.json').write_text(json.dumps({'argv':argv,'cwd':str(D),'hostPid':host.pid,'hostProcessGroup':host.pid,'startedUtc':started,'watchdogSeconds':config['hostWatchdogSeconds'],'environmentPolicy':'Inherited local host environment except NODE_OPTIONS and NODE_COMPILE_CACHE; all attempted executable environments are explicitly empty.'},indent=2)+'\n')
  try:host.wait(timeout=config['hostWatchdogSeconds'])
  except subprocess.TimeoutExpired:
   deadline=True
   try:os.killpg(host.pid,signal.SIGKILL);watchdogSignals.append({'targetGroup':host.pid,'signal':'SIGKILL'})
   except ProcessLookupError:watchdogSignals.append({'targetGroup':host.pid,'signal':'SIGKILL','result':'ESRCH'})
   host.wait(timeout=2)
 elapsed=time.monotonic()-begin
 hostAbsence={'directPid':probe(host.pid),'processGroup':probe(-host.pid)}
 events=[json.loads(line) for line in (evidence/'events.jsonl').read_text().splitlines()] if (evidence/'events.jsonl').is_file() else []
 ownerResult=load(evidence/'host-result.json') if (evidence/'host-result.json').is_file() else None
 firstFailure=load(evidence/'first-failure.json') if (evidence/'first-failure.json').is_file() else None
 actualFiles=[pin(p) for p in sorted(evidence.rglob('*')) if p.is_file()]
 observation={'activation':config['activation'],'argv':argv,'hostPid':host.pid,'hostExitCode':host.returncode,'hostWatchdogExpired':deadline,
  'elapsedSeconds':elapsed,'hostAbsence':hostAbsence,'watchdogSignals':watchdogSignals,'ownerResult':ownerResult,'firstFailure':firstFailure,
  'events':events,'physicalEvidenceFiles':actualFiles,'physicalEvidenceBytes':sum(row['bytes'] for row in actualFiles),
  'scratchDirectories':[str(p) for p in sorted(scratch.rglob('*')) if p.is_dir()],
  'scratchFiles':[str(p) for p in sorted(scratch.rglob('*')) if p.is_file()],
  'absentExecutableStillAbsent':not Path(config['absentExecutable']).exists(),'rootsRetained':[str(scratch),str(evidence)],
  'claim':'Actual failed-spawn owner observations; no actual executable fixture child, installed/native-provider/ABG proof or universal event-order claim.'}
 (D/'observation.json').write_text(json.dumps(observation,indent=2)+'\n')
 retained=D/'retained';retained.mkdir()
 for p in sorted(evidence.iterdir()):
  if p.is_file():shutil.copyfile(p,retained/p.name)
 passed=(host.returncode==0 and not deadline and not watchdogSignals and ownerResult is not None and ownerResult['status']=='bounded_failed_spawn_population_passed'
  and hostAbsence['directPid']['state']=='absent' and hostAbsence['processGroup']['state']=='absent' and observation['absentExecutableStillAbsent']
  and not observation['scratchFiles'] and not [row for row in events if row['event']=='uncaughtExceptionMonitor'])
 decision={'activation':config['activation'],'status':'passed' if passed else 'failed_stop','observation':pin(D/'observation.json'),
  'hostExitCode':host.returncode,'hostAbsence':hostAbsence,'completedCases':[] if ownerResult is None else ownerResult['completed'],
  'noRetry':True,'rootsRetained':observation['rootsRetained']}
 (D/'decision.json').write_text(json.dumps(decision,indent=2)+'\n');print(json.dumps(decision));sys.exit(0 if passed else 1)
except BaseException as error:
 if isinstance(error,SystemExit):raise
 failure={'phase':'parent_harness','type':type(error).__name__,'message':str(error),'traceback':traceback.format_exc(),'rootsRetained':[str(scratch),str(evidence)]}
 (D/'parent-first-failure.json').write_text(json.dumps(failure,indent=2)+'\n');print(json.dumps(failure));sys.exit(1)
