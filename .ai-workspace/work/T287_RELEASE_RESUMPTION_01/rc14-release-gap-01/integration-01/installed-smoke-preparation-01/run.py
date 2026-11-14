#!/usr/bin/env python3
"""Future one-shot execution only after Root binds and authorizes exact inputs."""
import datetime as dt, hashlib, json, os, pathlib, re, signal, subprocess, sys, tarfile, time

CONTROL = pathlib.Path(__file__).resolve().parent
def sha(path): return hashlib.sha256(pathlib.Path(path).read_bytes()).hexdigest()
def need(value, message):
    if not value: raise RuntimeError(message)
def positive(value): return isinstance(value, int) and not isinstance(value, bool) and value > 0
def expired(_signum, _frame): raise TimeoutError('Original enclosing host deadline expired')
def canonical(path):
    p = pathlib.Path(path); need(p.is_absolute() and str(p.resolve()) == str(p), 'Noncanonical input path: '+str(p)); return p
def main():
    need(len(sys.argv)==2, 'Usage: run.py ROOT_ACCEPTED_BINDING.json')
    binding_path=canonical(sys.argv[1]); b=json.loads(binding_path.read_text())
    need(b.get('executionAuthorized') is True and isinstance(b.get('executionGrant'),str) and b['executionGrant'], 'Execution not separately authorized')
    need(sha(CONTROL/'CONTROL_MANIFEST.json')==b['controlManifestSha256'], 'Control manifest changed')
    manifest=json.loads((CONTROL/'CONTROL_MANIFEST.json').read_text())
    for row in manifest['controls']: need(sha(CONTROL/row['path'])==row['sha256'],'Control changed: '+row['path'])
    source=canonical(b['controlSourceRoot']); candidate=b['candidate']; config=b['configuration']
    actual=subprocess.check_output(['git','-C',str(source),'rev-parse','HEAD'],text=True).strip()
    need(actual==b['controlSourceCommit'],'Control checkout HEAD changed')
    for row in manifest['inputs']: need(sha(source/row['path'])==row['sha256'],'Maintained helper/fixture changed: '+row['path'])
    need(subprocess.run(['git','-C',str(source),'diff','--quiet',manifest['preparationSource'],'--','build_tenants/abiogenesis/typescript']).returncode==0,'Tenant input differs from preparation subject')
    for key in ['cleanupGraceMs','smokeTimeoutMs','maxCaptureBytes']: need(positive(b[key]),'Finite '+key+' required')
    for key in ['recursionBound','processTimeoutMs','maxProcessOutputBytes']: need(positive(config[key]),'Finite '+key+' required')
    provider=config['provider']; need(provider['enabled'] is True and provider['agent']=='claude','Explicit supported provider selection required')
    for key in ['inactivityTimeoutMs','absoluteTimeoutMs','maxTurns']: need(positive(provider[key]),'Finite provider '+key+' required')
    need(isinstance(provider['model'],str) and provider['model'],'Model required')
    need(sha(canonical(provider['command']))==provider['executableSha256'],'Provider executable changed')
    node=str(canonical(config['nodePath'])); need(os.access(node,os.X_OK),'Node not executable')
    need(isinstance(b['setupEnvironment'],dict) and all(isinstance(k,str) and isinstance(v,str) for k,v in b['setupEnvironment'].items()),'Explicit setup environment required')
    deadline=dt.datetime.fromisoformat(b['deadlineUtc'].replace('Z','+00:00')).timestamp()
    need(time.time()<deadline,'Prospective deadline expired')
    signal.signal(signal.SIGALRM,expired); signal.setitimer(signal.ITIMER_REAL,deadline-time.time())
    topology=canonical(b['topologyAcceptance']['path']); need(sha(topology)==b['topologyAcceptance']['sha256'],'Topology acceptance changed')
    need(candidate['sourceCommit'] and candidate['packageVersion'],'Final candidate identity unresolved')
    archive=canonical(candidate['archivePath']); package=canonical(candidate['bootstrapPackageRoot'])
    need('sha256:'+sha(archive)==candidate['archiveSha256'],'Final archive changed')
    need(sha(package/'product-toolchain-manifest.json')==candidate['manifestSha256'],'Bootstrap manifest changed')
    need(json.loads((package/'package.json').read_text())['version']==candidate['packageVersion'],'Bootstrap version changed')
    # The supplied install is an exact copy of the selected archive, not a convenient earlier runtime.
    with tarfile.open(archive,'r:gz') as tar:
        expected={}
        for member in tar.getmembers():
            name=member.name.removeprefix('package/').rstrip('/')
            if member.isdir(): continue
            need(member.name.startswith('package/') and name and not pathlib.PurePosixPath(name).is_absolute() and '..' not in pathlib.PurePosixPath(name).parts,'Archive path refused')
            need(member.isfile() and name not in expected,'Unsupported or duplicate archive member: '+name)
            expected[name]=hashlib.sha256(tar.extractfile(member).read()).hexdigest()
        actual={}
        for parent,dirs,files in os.walk(package,followlinks=False):
            for name in dirs+files: need(not (pathlib.Path(parent)/name).is_symlink(),'Bootstrap symlink refused')
            for name in files:
                p=pathlib.Path(parent)/name; actual[p.relative_to(package).as_posix()]=sha(p)
        need(actual==expected,'Archive/bootstrap member sets or bytes differ')
    root=canonical(b['rawRoot']); need(not root.exists(),'Raw root already exists; no retry')
    root.mkdir(parents=True); (root/'BINDING.json').write_bytes(binding_path.read_bytes())
    env=dict(b['setupEnvironment']); env['TMPDIR']=str(root/'tmp'); pathlib.Path(env['TMPDIR']).mkdir()
    env.update({'ABI5_WAVE1_FROZEN_ARTIFACT_PATH':str(archive),'ABI5_WAVE1_FROZEN_ARTIFACT_SHA256':candidate['archiveSha256'],
        'ABI5_WAVE1_FROZEN_INSTALL_HOST':str(package.parents[2]),'ABI5_CANDIDATE_BASIS_SOURCE':'packed_artifact'})
    def run(label,args,limit):
        out=root/(label+'.stdout'); err=root/(label+'.stderr'); started=time.time(); cause=None
        (root/(label+'.request.json')).write_text(json.dumps({'args':args,'cwd':str(source),
            'environmentKeys':sorted(env),'deadlineUtc':b['deadlineUtc'],'phaseTimeoutMs':limit,
            'startedUtc':dt.datetime.fromtimestamp(started,dt.timezone.utc).isoformat()},indent=2)+'\n')
        with out.open('xb') as stdout,err.open('xb') as stderr:
            p=subprocess.Popen(args,cwd=source,env=env,stdout=stdout,stderr=stderr,start_new_session=True)
            try:
                while p.poll() is None:
                    if time.time()>=min(deadline,started+limit/1000): cause='deadline'
                    if out.stat().st_size+err.stat().st_size>b['maxCaptureBytes']: cause='capture_limit'
                    if cause: break
                    time.sleep(.2)
            except TimeoutError: cause='enclosing_host_deadline'
            if cause:
                try: os.killpg(p.pid,signal.SIGTERM)
                except ProcessLookupError: pass
                try: p.wait(timeout=b['cleanupGraceMs']/1000)
                except subprocess.TimeoutExpired:
                    try: os.killpg(p.pid,signal.SIGKILL)
                    except ProcessLookupError: pass
                    try: p.wait(timeout=b['cleanupGraceMs']/1000)
                    except subprocess.TimeoutExpired: pass
        receipt={'args':args,'exitCode':p.poll(),'cause':cause,'startedUtc':dt.datetime.fromtimestamp(started,dt.timezone.utc).isoformat(),
            'elapsedMs':round((time.time()-started)*1000),'stdoutSha256':sha(out),'stderrSha256':sha(err),
            'hostClosed':p.poll() is not None,'descendantAbsence':'not established by host process close'}
        (root/(label+'.json')).write_text(json.dumps(receipt,indent=2)+'\n')
        need(cause is None and p.poll()==0,'First failure: '+label)
        return out.read_text()
    try:
        test=source/'build_tenants/abiogenesis/typescript/test_env/tests/installed-language-smoke.test.mjs'
        tap=run('001-installed-language',[node,'--test','--test-reporter=tap','--test-concurrency=1',str(test)],b['smokeTimeoutMs'])
        for key,value in [('tests',1),('pass',1),('fail',0),('cancelled',0),('skipped',0),('todo',0)]:
            need(re.search(r'^# '+key+r' '+str(value)+r'$',tap,re.M),'Unexpected deterministic case population: '+key)
        need('Hello World is an external minimal GTL program through installed Public execution and fresh reads' in tap,'Wrong deterministic case')
        run('002-basic-cli',[node,str(CONTROL/'basic-cli.mjs'),str(root/'BINDING.json')],max(1,int((deadline-time.time())*1000)))
        (root/'RETURN.json').write_text(json.dumps({'status':'passed','qualified':False,'deadlineUtc':b['deadlineUtc']})+'\n')
    except Exception as error:
        (root/'FIRST_FAILURE.json').write_text(json.dumps({'reason':str(error),'retry':False,'qualified':False})+'\n'); raise
    finally: signal.setitimer(signal.ITIMER_REAL,0)
if __name__=='__main__': main()
