from pathlib import Path
import os,json,subprocess,time,signal,hashlib,datetime
base=Path(__file__).resolve().parent
repo=base.parents[4]
frozen=base.parent/'lifetime/stage/build_tenants/abiogenesis/typescript'
preflight=json.loads((base/'F2-preflight.json').read_text())
node=preflight['nodeExecutable']
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
for row in json.loads((base/'F2-discriminator-inputs.json').read_text()):
    assert sha(base/row['path'])==row['sha256'],row['path']
assert sha(Path(node))==preflight['nodeSha256']
assert sha(Path(preflight['workerModule']))==preflight['workerModuleSha256']
def probe(pid):
    try:os.kill(pid,0);return 'present'
    except ProcessLookupError:return 'absent'
    except PermissionError:return 'unknown'
def load(path):
    return json.loads(path.read_text()) if path.is_file() else None
summary=[]
for mode in ['draining_control','early_stdin_close']:
    root=base/mode;root.mkdir()
    command=[node,str(base/'diagnostic-host.mjs'),mode,str(root),str(frozen)]
    start=time.monotonic();started=datetime.datetime.now(datetime.timezone.utc).isoformat()
    env={key:value for key,value in os.environ.items() if key not in ['NODE_OPTIONS','NODE_COMPILE_CACHE']}
    proc=subprocess.Popen(command,stdout=subprocess.PIPE,stderr=subprocess.PIPE,start_new_session=True,env=env)
    hostDeadline=False
    try:stdout,stderr=proc.communicate(timeout=5)
    except subprocess.TimeoutExpired:
        hostDeadline=True
        try:os.killpg(proc.pid,signal.SIGKILL)
        except ProcessLookupError:pass
        stdout,stderr=proc.communicate(timeout=2)
    (root/'host.stdout').write_bytes(stdout);(root/'host.stderr').write_bytes(stderr)
    events=[json.loads(line) for line in (root/'host-events.jsonl').read_text().splitlines()] if (root/'host-events.jsonl').exists() else []
    identity=load(root/'child-identity.json')
    startedChild=next((row['pid'] for row in events if row['event']=='child-started'),None)
    childPid=identity['pid'] if identity else startedChild
    group=identity['pgid'] if identity else startedChild
    samples=[];cleanupSignals=[];deadline=time.monotonic()+3
    while group is not None:
        state=probe(-group);samples.append({'elapsedSeconds':time.monotonic()-start,'group':state,'directPid':probe(childPid)})
        if state!='present' or time.monotonic()>=deadline:break
        time.sleep(.025)
    if group is not None and samples[-1]['group']=='present':
        os.killpg(group,signal.SIGKILL);cleanupSignals.append('SIGKILL')
        deadline=time.monotonic()+1
        while time.monotonic()<deadline:
            state=probe(-group);samples.append({'elapsedSeconds':time.monotonic()-start,'group':state,'directPid':probe(childPid)})
            if state!='present':break
            time.sleep(.025)
    scopeAbsent=group is not None and samples[-1]['group']=='absent'
    ownerReturn=load(root/'owner-return.json');ownerRejection=load(root/'owner-rejection.json')
    observation={'case':mode,'command':command,'startedAt':started,'elapsedSeconds':time.monotonic()-start,
        'hostPid':proc.pid,'hostExitCode':proc.returncode,'hostDeadlineExpired':hostDeadline,
        'hostStdoutSha256':sha(root/'host.stdout'),'hostStderrSha256':sha(root/'host.stderr'),
        'childIdentity':identity,'childStartedObservation':startedChild,'childStdinClosed':load(root/'child-stdin-closed.json'),
        'childFiniteExit':load(root/'child-finite-exit.json'),'childControlRead':load(root/'child-control-read.json'),
        'hostEvents':events,'ownerReturn':ownerReturn,'ownerRejection':ownerRejection,
        'independentScopeSamples':samples,'independentScopeAbsent':scopeAbsent,'failSafeSignals':cleanupSignals,
        'archiveFiles':sorted(p.name for p in (root/'archive').glob('*'))}
    # Preserve actual effects and owner outcomes before applying the oracle.
    (root/'observation.json').write_text(json.dumps(observation,indent=2)+'\n')
    if mode=='draining_control':
        outcome='control_pass' if proc.returncode==0 and not hostDeadline and scopeAbsent and identity is not None and ownerReturn is not None and ownerReturn.get('terminationConfirmed') is True and observation['childControlRead']['bytes']==8388608 else 'control_failed_stop'
    else:
        epipes=[row for row in events if row['event']=='uncaughtExceptionMonitor' and row.get('code')=='EPIPE']
        outcome='actual_unhandled_EPIPE_no_owner_completion' if epipes and proc.returncode!=0 and ownerReturn is None and ownerRejection is None else 'counterexample_not_observed_in_single_case'
    if not scopeAbsent:outcome='physical_scope_unconfirmed_stop'
    decision={'case':mode,'outcome':outcome,'observationSha256':sha(root/'observation.json'),'scopeAbsent':scopeAbsent,'hostExitCode':proc.returncode,'failSafeSignals':cleanupSignals}
    (root/'decision.json').write_text(json.dumps(decision,indent=2)+'\n');summary.append(decision)
    (base/'F2-summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(decision),flush=True)
    if outcome!='control_pass':break
