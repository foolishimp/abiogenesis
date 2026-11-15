#!/Users/jim/.pyenv/versions/3.11.5/bin/python3.11
"""Immutable consumer Tool, not a Product runtime or application verifier.

The C2 command is this executable plus the native-authored relative witness.
All subprocesses inherit C2's process group. Only C2 claims its physical close.
"""
import datetime, hashlib, importlib.util, json, os, pathlib, re, secrets, shutil, signal, stat, subprocess, sys, time
sys.dont_write_bytecode = True
C = pathlib.Path(__file__).resolve().parent

def sha(path):
    h = hashlib.sha256()
    with pathlib.Path(path).open('rb') as stream:
        for chunk in iter(lambda: stream.read(1048576), b''): h.update(chunk)
    return h.hexdigest()

def save(path, value):
    with pathlib.Path(path).open('x') as out: json.dump(value, out, indent=2); out.write('\n')

def load():
    return json.loads((C / 'TOOLCHAIN.json').read_text())

def exact(row):
    p = pathlib.Path(row['path'])
    assert p.is_file() and not p.is_symlink() and sha(p) == row['sha256'], str(p)
    if 'bytes' in row: assert p.stat().st_size == row['bytes'], str(p)

def verify_inputs():
    """Called by the enclosing Operator before/after; no Product imports."""
    t = load(); facts = {}
    for name in ['freezeReturn','launcher','repositoryConfig','bootConfig','java','node','python','resolution','selectedClosure','classpathIndex']:
        exact(t[name]); facts[name] = t[name]['sha256']
    assert json.loads(pathlib.Path(t['resolution']['path']).read_text())['disposition'] == 'offline_resolution_completed'
    for item in t['inventories']:
        assert sha(item['inventory']) == item['sha256']
        expected = json.loads(pathlib.Path(item['inventory']).read_text())['rows']
        assert len(expected) == len({r['path'] for r in expected})
        root = pathlib.Path(item['path']); actual = []
        for folder, dirs, files in os.walk(root, followlinks=False):
            for name in sorted(dirs + files):
                p = pathlib.Path(folder) / name; s = p.lstat(); rel = p.relative_to(root).as_posix()
                if p.is_symlink(): actual.append({'path':rel,'kind':'symlink','target':os.readlink(p)})
                elif p.is_file(): actual.append({'path':rel,'kind':'file','mode':stat.S_IMODE(s.st_mode),'bytes':s.st_size,'sha256':sha(p)})
                else: assert p.is_dir(), str(p)
        assert sorted(actual,key=lambda r:r['path']) == sorted(expected,key=lambda r:r['path']), item['kind']
        facts[item['kind']] = {'inventorySha256':item['sha256'],'rows':len(actual)}
    return facts

def java_options(t, state):
    f = pathlib.Path(t['frozenRoot'])
    return ['-Xmx2g','-Duser.home='+str(state/'home'),'-Djava.io.tmpdir='+str(state/'tmp'),'-Djava.awt.headless=true',
        '-Dsbt.boot.directory='+str(state/'boot'),'-Dsbt.global.base='+str(state/'global'),'-Dsbt.ivy.home='+str(state/'ivy'),
        '-Dsbt.coursier.home='+str(state/'coursier'),'-Dcoursier.cache='+str(state/'coursier'),
        '-Dsbt.boot.properties='+(f/'sbt.boot.properties').as_uri(),'-Dsbt.repository.config='+str(f/'repositories'),
        '-Dsbt.override.build.repos=true','-Dsbt.server.autostart=false','-Dsbt.client=false','-Dsbt.io.virtual=false',
        '-Dsbt.supershell=false','-Dsbt.color=false','-Dsbt.log.noformat=true','-Dsbt.ci=true','-Dsbt.version=1.11.7']

def child_environment(t, state, phase):
    f = pathlib.Path(t['frozenRoot'])
    # This is a complete child environment, never a merge with process.env.
    return {'HOME':str(state/'home'),'JAVA_HOME':str(f/'jdk'),'PATH':str(f/'jdk/bin')+':/usr/bin:/bin',
        'TMPDIR':str(state/'tmp'),'XDG_RUNTIME_DIR':str(state/'ipc'),'LANG':'en_US.UTF-8','LC_ALL':'C',
        'COURSIER_CACHE':str(state/'coursier'),'COURSIER_REPOSITORIES':(f/'maven2').as_uri()+'/',
        'SBT_NATIVE_CLIENT':'false','SBT_SERVER_AUTOSTART':'false','SPARK_LOCAL_IP':'127.0.0.1',
        'JAVA_TOOL_OPTIONS':'-Duser.home='+str(state/'home')+' -Djava.io.tmpdir='+str(state/'tmp')+' -Dspark.local.dir='+str(state/'tmp'),
        'S06_TOOL_STATE':str(state),'S06_TOOL_PHASE':phase,'S06_TOOLCHAIN_SHA256':sha(C/'TOOLCHAIN.json'),
        'S06_SBT_TOOL':str(C/'tool-launcher.py'),'S06_FROZEN_JAVA':t['java']['path'],
        'PYTHONDONTWRITEBYTECODE':'1'}

def profile(t, state, cwd, phase, query=False):
    # Additional consumer Tool restriction. C2 owns task-path authority.
    lines=['(version 1)','(allow default)','(deny network*)','(deny file-write*)',
        '(allow file-write* (literal "/dev/null"))']
    for name in ['home','boot','global','ivy','coursier','tmp','ipc']:
        lines.append('(allow file-write* (subpath '+json.dumps(str(state/name))+'))')
    if not query:
        build=['target','project/target','project/project/target',*[f'cdme-{n}/target' for n in ['core','compiler','executor','adjoint','accounting','assurance','fidelity','engine']]]
        for p in [cwd/'evidence'/phase,*[cwd/'application/scala_spark'/p for p in build]]:
            lines.append('(allow file-write* (subpath '+json.dumps(str(p))+'))')
        lines += ['(allow network-bind network-inbound network-outbound (subpath '+json.dumps(str(state/'ipc'/'.sbt'))+'))',
            '(allow network-bind network-inbound (local tcp "localhost:*"))',
            '(allow network-outbound (remote tcp "localhost:*"))']
    return '\n'.join(lines)+'\n'

def topology(t, state, receipts, cwd):
    spec = importlib.util.spec_from_file_location('s06_exact_topology',C/'physical-topology.py')
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    value=m.observe({'worksite':str(state),'writePaths':[str(state/n) for n in ['home','boot','global','ivy','coursier','tmp','ipc']],
        'protectedRoots':[str(cwd),str(C),t['frozenRoot']],'archiveRoot':str(receipts)})
    save(receipts/'topology.json',value)
    assert value['ok'] is True and value['disposition']=='separated','Tool topology is not established'

def close_tool_state(archive, deadline):
    """Operator cleanup only, after the enclosing real command has closed.

    Copy observations first. Unknown/live groups or unaccounted states retain
    their directories; this function cannot certify an application result.
    """
    t=load(); state=pathlib.Path(t['stateRoot']); receipts=pathlib.Path(t['receiptRoot'])
    def budget(): assert datetime.datetime.now(datetime.timezone.utc)<deadline,'Original cleanup deadline expired'
    def remove_owned(p):
        budget()
        if p.is_symlink() or p.is_file():p.unlink();return
        for child in p.iterdir():remove_owned(child)
        p.rmdir()
    result={'observationsOnly':True,'retained':[],'removedStates':[],'groups':[]}
    if not receipts.exists() and not state.exists():return result
    assert receipts.resolve()==receipts and state.resolve()==state
    archive=pathlib.Path(archive);archive.mkdir()
    names=sorted(p.name for p in (receipts/'attempts').iterdir());assert len(names)<=64,'Unbounded Tool invocation population'
    for name in names:
        budget();assert re.fullmatch(r'd[12]-[0-9a-f]{8}',name)
        folder=receipts/'attempts'/name;assert folder.resolve()==folder
        shutil.copytree(folder,archive/name,symlinks=True)
        creation=json.loads((folder/'creation.json').read_text());expected=state/'attempts'/name
        assert creation['state']==str(expected)
        try:os.killpg(creation['processGroup'],0);absent=False
        except ProcessLookupError:absent=True
        result['groups'].append({'name':name,'processGroup':creation['processGroup'],'absent':absent})
        if not absent:result['retained'].append(str(expected));continue
        if expected.exists():remove_owned(expected);result['removedStates'].append(str(expected))
    extra=sorted(p.name for p in (state/'attempts').iterdir() if p.name not in names)
    assert not extra,'Unaccounted Tool state retained: '+repr(extra)
    save(archive/'CLEANUP.json',result)
    assert not result['retained'],'Actual Tool command group still present; transient state retained'
    remove_owned(state);remove_owned(receipts)
    return result

def same_group_child(argv, cwd, env, folder, budget_ms, max_bytes):
    started=time.monotonic(); child=None; code=None; failure=None
    def interrupted(signum, frame): raise InterruptedError('C2/Operator signal '+str(signum))
    old={s:signal.signal(s,interrupted) for s in [signal.SIGTERM,signal.SIGINT]}
    try:
        with (folder/'stdout.raw').open('xb') as out,(folder/'stderr.raw').open('xb') as err:
            try:
                child=subprocess.Popen(argv,cwd=cwd,env=env,stdin=subprocess.DEVNULL,stdout=out,stderr=err,start_new_session=False)
                save(folder/'child.json',{'pid':child.pid,'processGroup':os.getpgid(child.pid),'launcherProcessGroup':os.getpgrp(),'newSession':False})
                assert os.getpgid(child.pid)==os.getpgrp(),'Child escaped enclosing lifetime'
                while child.poll() is None:
                    assert time.monotonic()-started < budget_ms/1000,'Tool finite child budget exhausted'
                    assert out.tell()+err.tell() <= max_bytes,'Tool capture ceiling exceeded'
                    time.sleep(.05)
                code=child.wait()
            except BaseException as e:
                failure=type(e).__name__+': '+str(e)
            finally:
                if child is not None and child.poll() is None:
                    child.terminate()
                    try: child.wait(timeout=5)
                    except subprocess.TimeoutExpired: child.kill(); child.wait(timeout=5)
                if child is not None: code=child.returncode
        streams={n:{'bytes':(folder/n).stat().st_size,'sha256':sha(folder/n)} for n in ['stdout.raw','stderr.raw']}
        if sum(r['bytes'] for r in streams.values())>max_bytes: failure=failure or 'Tool capture ceiling exceeded'
        result={'exitCode':code,'failure':failure,'childReaped':child is not None and child.poll() is not None,
            'processGroup':os.getpgrp(),'groupClosureOwner':'existing enclosing C2/Operator command owner; no Tool group-absence claim',
            'elapsedMs':round((time.monotonic()-started)*1000),'streams':streams}
        save(folder/'child-close.json',result)
        # Preserve first complete failure captures before any successful-return assertion.
        for name,destination in [('stdout.raw',sys.stdout.buffer),('stderr.raw',sys.stderr.buffer)]:
            with (folder/name).open('rb') as stream: shutil.copyfileobj(stream,destination)
            destination.flush()
        assert failure is None and code==0,'Actual Tool child failed; captures retained'
        return result
    finally:
        for s,handler in old.items():signal.signal(s,handler)

def main():
    t=load(); args=sys.argv[1:]
    assert sys.platform=='darwin' and os.uname().machine=='arm64','Selected Darwin arm64 Tool only'
    assert os.environ.get('S06_TOOLCHAIN_SHA256')==sha(C/'TOOLCHAIN.json'),'Exact declared Tool input identity required'
    manifest=json.loads((C/'CONTROL_MANIFEST.json').read_text())
    for name in ['tool-launcher.py','TOOLCHAIN.json','physical-topology.py']:
        row=next(r for r in manifest['controls'] if r['path']==name)
        assert sha(C/name)==row['sha256'],name
    for name in ['java','node','python','launcher','repositoryConfig','bootConfig']:exact(t[name])
    if args and args[0]=='--sbt':
        state=pathlib.Path(os.environ['S06_TOOL_STATE'])
        assert state.parent==pathlib.Path(t['stateRoot'])/'attempts' and re.fullmatch(r'd[12]-[0-9a-f]{8}',state.name) and state.resolve()==state
        assert (state/'lease.json').is_file(),'Actual outer Tool lease required'
        argv=[t['java']['path'],*java_options(t,state),'-jar',t['launcher']['path'],*args[1:]]
        print(json.dumps({'s06ToolSubcommand':'sbt','argv':argv,'sameProcessGroup':os.getpgrp(),'inputSha256':sha(C/'TOOLCHAIN.json')}),file=sys.stderr,flush=True)
        os.execve(argv[0],argv,child_environment(t,state,os.environ['S06_TOOL_PHASE']))
    query=bool(args and args[0]=='--query')
    if query:
        assert len(args)==7 and args[1] in ['d1','d2']; phase=args[1]
        argv=[t['java']['path'],'-cp',args[2],'com.cdme.engine.CdmeEngineRunner','query',*args[3:]]
    else:
        assert len(args)==7 and args[0]=='application/witness.mjs' and args[1]=='--phase' and args[2] in ['d1','d2']
        phase=args[2];assert args[3:]==['--input',f'source/{phase}-input.json','--run-root',f'evidence/{phase}/run']
        argv=[t['node']['path'],*args]
    cwd=pathlib.Path.cwd();assert cwd.resolve()==cwd
    state_base=pathlib.Path(t['stateRoot'])/'attempts';receipt_base=pathlib.Path(t['receiptRoot'])/'attempts'
    assert state_base.is_dir() and receipt_base.is_dir() and state_base.resolve()==state_base and receipt_base.resolve()==receipt_base
    key=phase+'-'+secrets.token_hex(4);state=state_base/key;receipts=receipt_base/key
    state.mkdir();receipts.mkdir();save(receipts/'creation.json',{'state':str(state),'pid':os.getpid(),'processGroup':os.getpgrp(),'cwd':str(cwd),'phase':phase});failure=None;closed=None
    try:
        for n in ['home','global','ivy','coursier','tmp','ipc']:(state/n).mkdir()
        for p in [state/'tmp',state/'ipc']:
            assert len(str(p).encode())+t['maxSocketSuffixBytesIncludingNul']<104,'SBT Unix socket pathname exceeds native limit'
        topology(t,state,receipts,cwd)
        if not query:shutil.copytree(pathlib.Path(t['frozenRoot'])/'boot',state/'boot')
        else:(state/'boot').mkdir()
        env=child_environment(t,state,phase)
        if query:argv=[t['java']['path'],'-Duser.home='+str(state/'home'),'-Djava.io.tmpdir='+str(state/'tmp'),*argv[1:]]
        policy=receipts/'tool.sb';policy.write_text(profile(t,state,cwd,phase,query))
        lease={'tool':str(C/'tool-launcher.py'),'toolSha256':sha(C/'tool-launcher.py'),'inputSha256':sha(C/'TOOLCHAIN.json'),
            'kind':'query' if query else 'witness','phase':phase,'cwd':str(cwd),'suppliedArgs':args,'state':str(state),
            'argv':['/usr/bin/sandbox-exec','-f',str(policy),*argv],'environment':env,'policySha256':sha(policy),'processGroup':os.getpgrp(),
            'observationOnly':True,'applicationVerdict':False}
        save(state/'lease.json',lease);save(receipts/'launch.json',lease)
        closed=same_group_child(lease['argv'],cwd,env,receipts,t['queryMs'] if query else t['maxCommandMs'],t['maxCaptureBytes'])
    except BaseException as error:
        failure=type(error).__name__+': '+str(error);save(receipts/'FIRST_FAILURE.json',{'reason':failure,'retry':False})
    finally:
        save(receipts/'RETURN.json',{'disposition':'child_completed' if failure is None else 'stopped_unresolved','failure':failure,
            'state':str(state),'phase':phase,'kind':'query' if query else 'witness','cwd':str(cwd),'suppliedArgs':args,
            'inputSha256':sha(C/'TOOLCHAIN.json'),'toolSha256':sha(C/'tool-launcher.py'),'child':closed,
            'cleanupOwner':'Enclosing Operator after actual C2/command group absence; caches are transient Tool state, never application evidence'})
    if failure:print(failure,file=sys.stderr)
    return 1 if failure else 0

if __name__=='__main__':raise SystemExit(main())
