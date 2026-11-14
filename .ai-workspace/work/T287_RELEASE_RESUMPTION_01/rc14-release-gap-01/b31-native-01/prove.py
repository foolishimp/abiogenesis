import datetime, hashlib, json, os, pathlib, re, shutil, signal, subprocess, sys, time

CONTROL=pathlib.Path(__file__).resolve().parent
SOURCE=pathlib.Path('/private/tmp/abg-rc14-b31-20261115-01')
TENANT=SOURCE/'build_tenants/abiogenesis/typescript'
RAW=pathlib.Path('/Users/jim/Library/Application Support/ABIogenesis/development-runs/rc14-b31-20261115-01')
PIN=json.loads(pathlib.Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc13-operational-pin-01/BUILDER_PIN.json').read_text())
ACT=json.loads((CONTROL/'ACTIVATION.json').read_text())
DEADLINE=datetime.datetime.fromisoformat(json.loads((RAW/'CONTROL_START.json').read_text())['deadlineUtc'])
FILES=ACT['nativeWriteScope'][:5]

def save(path,value):
    with path.open('x') as out: json.dump(value,out,indent=2);out.write('\n')
def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def group_exists(pid):
    try:os.killpg(pid,0);return True
    except ProcessLookupError:return False
def cleanup(pid):
    sent=[]
    for sig in (signal.SIGTERM,signal.SIGKILL):
        try:os.killpg(pid,sig);sent.append(sig.name)
        except ProcessLookupError:break
        until=time.monotonic()+5
        while group_exists(pid) and time.monotonic()<until:time.sleep(.05)
    return {'signals':sent,'testProcessGroupAbsent':not group_exists(pid),
            'scope':'Observed owned test process group; no global process-absence assertion'}

host=json.loads((RAW/'HOST_RETURN.json').read_text()); final=json.loads((RAW/'runtime/FINAL.json').read_text())
assert host['exitCode']==0 and host['stopReason'] is None
assert final['launched'] and final['actualResourceClose'] and final['failure'] is None and final['readbackFailure'] is None
native=json.loads((RAW/'runtime/NATIVE_RETURN.json').read_text())
terminal=native['ownerOutput']['value'].get('terminalResult')
assert terminal and terminal['valueKind']=='native_workspace_work_observation' and terminal['value']['kind']=='native_workspace_work_observation','native success observation required before proof'
assert subprocess.run(['git','rev-parse','HEAD'],cwd=SOURCE,capture_output=True,text=True,check=True).stdout.strip()=='27e6412853f1d8afb1a2e960def6eb055f8ede50'
pre=json.loads((RAW/'SOURCE_PREIMAGE.json').read_text());changed=[]
for row in pre['rows']:
    p=SOURCE/row['path'];assert p.is_file(),row['path']
    if digest(p)!=row['sha256']:changed.append(row['path'])
assert changed and set(changed)<=set(FILES),changed
save(RAW/'PRE_PROOF_CONSERVATION.json',{'changedTracked':changed,'unchangedTracked':len(pre['rows'])-len(changed),'allowed':FILES})

mirror=RAW/'proof/subject';assert not mirror.exists()
shutil.copytree(PIN['installedRoot'],mirror,symlinks=True)
for name in ['support','fixtures']:
    shutil.copytree(TENANT/'test_env'/name,mirror/'test_env'/name,dirs_exist_ok=True,symlinks=True)
shutil.copytree(TENANT/'scripts',mirror/'scripts',dirs_exist_ok=True,symlinks=True)
(mirror/'test_env/tests').mkdir(parents=True,exist_ok=True)
fixtures=[]
for relative in FILES:
    src=SOURCE/relative;dst=mirror/'test_env/tests'/src.name;shutil.copyfile(src,dst)
    fixtures.append({'path':relative,'sha256':digest(src),'copySha256':digest(dst),'bytes':src.stat().st_size})
save(RAW/'PROOF_SUBJECT.json',{'sourceHead':'27e6412853f1d8afb1a2e960def6eb055f8ede50','sourceChanges':fixtures,
    'compiledOwner':PIN['installedRoot'],'ownerArchiveSha256':PIN['archive']['sha256'],'mirror':str(mirror),
    'meaning':'Authored test fixtures with unchanged pinned RC13 build/package/manifest; source production remains unchanged. Genuine installed cases use existing frozen-artifact mode.'})

env={k:v for k,v in os.environ.items() if k in ['HOME','PATH','LANG','LC_ALL']}
env.update({'HOME':'/Users/jim','PATH':'/Users/jim/.local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin',
 'TMPDIR':str(RAW/'proof/tmp'),'TMPPREFIX':str(RAW/'proof/tmp/zsh'),'NODE_OPTIONS':'--max-old-space-size=8192','GIT_OPTIONAL_LOCKS':'0',
 'NPM_CONFIG_OFFLINE':'true','NPM_CONFIG_UPDATE_NOTIFIER':'false','NPM_CONFIG_CACHE':str(RAW/'host-scratch/npm-cache'),
 'NPM_CONFIG_USERCONFIG':str(RAW/'host-scratch/npm-user.npmrc'),'NPM_CONFIG_GLOBALCONFIG':str(RAW/'host-scratch/npm-global.npmrc'),
 'ABI5_WAVE1_FROZEN_ARTIFACT_PATH':PIN['archive']['path'],'ABI5_WAVE1_FROZEN_INSTALL_HOST':str(pathlib.Path(PIN['installedRoot']).parents[2]),
 'ABI5_WAVE1_FROZEN_ARTIFACT_SHA256':PIN['archive']['sha256'],'ABI5_CANDIDATE_BASIS_SOURCE':'packed_artifact'})
(RAW/'proof/tmp').mkdir()
name='F04 same native contract proof is reused while raw and changed bases still check'
steps=[('01-f04-proof-reuse',pathlib.Path(FILES[0]).name,'^'+name+'$',60000),
       ('02-f04-remaining',pathlib.Path(FILES[0]).name,'^(?!'+name+'$)',300000)]
steps += [(f'{i:02d}-'+pathlib.Path(f).stem,pathlib.Path(f).name,None,300000) for i,f in enumerate(FILES[1:],3)]
results=[]
for label,file,pattern,cap in steps:
    remaining=(DEADLINE-datetime.datetime.now(datetime.timezone.utc)).total_seconds()
    assert remaining>15,'original host-control deadline has insufficient remaining time'
    timeout=min(cap/1000,remaining-10);folder=RAW/'proof'/label;folder.mkdir()
    cmd=['/opt/homebrew/bin/node','--experimental-vm-modules','--test','--test-concurrency=1','--test-reporter=tap']
    if pattern is not None:cmd+=['--test-name-pattern',pattern]
    cmd+=['test_env/tests/'+file]
    save(folder/'request.json',{'command':cmd,'cwd':str(mirror),'timeoutMs':int(timeout*1000),'sharedDeadlineUtc':DEADLINE.isoformat(),'environmentKeys':sorted(env)})
    started=time.monotonic();reason=None
    with (folder/'stdout.raw').open('xb') as out,(folder/'stderr.raw').open('xb') as err:
        child=subprocess.Popen(cmd,cwd=mirror,env=env,stdin=subprocess.DEVNULL,stdout=out,stderr=err,start_new_session=True)
        while child.poll() is None:
            if time.monotonic()-started>=timeout:reason='timeout';break
            if out.tell()+err.tell()>ACT['limits']['outputBytesPerCommand']:reason='output_limit';break
            time.sleep(.1)
        cleaned=cleanup(child.pid) if reason or group_exists(child.pid) else {'signals':[],'testProcessGroupAbsent':True}
        try:code=child.wait(timeout=5)
        except subprocess.TimeoutExpired:code=None
    output=(folder/'stdout.raw').read_bytes();text=output.decode('utf8',errors='replace')
    counts={k:int(v) for k,v in re.findall(r'^# (tests|suites|pass|fail|cancelled|skipped|todo) (\d+)$',text,re.M)}
    if code==0 and (counts.get('pass',0)<1 or counts.get('fail',0)!=0 or counts.get('cancelled',0)!=0):
        reason=reason or 'no_complete_executed_pass_population'
    cases=[{'status':m.group(1),'name':m.group(2),'directive':m.group(3)} for m in
           re.finditer(r'^\s*(ok|not ok) \d+ - (.*?)(?: # (.*))?$',text,re.M)]
    filtered=[x for x in cases if x['directive'] and 'test name does not match pattern' in x['directive']]
    declared=[x for x in cases if x['directive'] and x['directive'].startswith('SKIP') and x not in filtered]
    result={'label':label,'exitCode':code,'stopReason':reason,'wallMs':round((time.monotonic()-started)*1000),'counts':counts,'cleanup':cleaned,
            'testNamePattern':pattern,'selectedCases':[x for x in cases if x not in filtered],'nameFilterExclusions':filtered,'declaredSkips':declared,
            'stdout':{'bytes':len(output),'sha256':digest(folder/'stdout.raw')},'stderr':{'bytes':(folder/'stderr.raw').stat().st_size,'sha256':digest(folder/'stderr.raw')}}
    save(folder/'result.json',result);results.append(result)
    print(json.dumps({k:v for k,v in result.items() if k not in ['selectedCases','nameFilterExclusions','declaredSkips']}),flush=True)
    if code!=0 or reason or not cleaned['testProcessGroupAbsent']:
        save(RAW/'PROOF_RETURN.json',{'status':'FIRST_FAILURE_STOP','results':results,'unperformed':[s[0] for s in steps[len(results):]]})
        sys.exit(1)
save(RAW/'PROOF_RETURN.json',{'status':'BOUNDED_PROOF_COMPLETE','results':results,'unperformed':[]})
