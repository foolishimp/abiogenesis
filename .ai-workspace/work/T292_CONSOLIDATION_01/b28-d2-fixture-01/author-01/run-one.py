import datetime,hashlib,json,os,pathlib,re,signal,subprocess,sys,time
scratch=pathlib.Path(__file__).parent
subject=json.loads((scratch/'subject.json').read_text())
root=pathlib.Path(subject['worktree']); tenant=root/'build_tenants/abiogenesis/typescript'
original=json.loads((root/'.ai-workspace/work/T292_CONSOLIDATION_01/b28-d2-fixture-01/01-request.json').read_text())
selected={'d2-binding-transition.test.mjs':'01-d2-binding-transition','t287-native-semantic-revision.test.mjs':'02-t287-native-semantic-revision'}
name=sys.argv[1]; output=scratch/selected[name]; output.mkdir()
for row in subject['testSource']+subject['buildPins']:
    assert hashlib.sha256(pathlib.Path(row['path']).read_bytes()).hexdigest()==row['sha256'],row['path']
env=original['environment'].copy();env.update({'TMPDIR':str(scratch/'tmp'),'npm_config_cache':str(scratch/'tmp/npm-cache'),'npm_config_userconfig':str(scratch/'tmp/npm-user.npmrc'),'npm_config_globalconfig':str(scratch/'tmp/npm-global.npmrc')})
argv=original['argv'][:-1]+['test_env/tests/'+name]
started=datetime.datetime.now(datetime.timezone.utc).isoformat(); clock=time.monotonic(); timeout_ms=600000
request={'argv':argv,'cwd':str(tenant),'started':started,'selectedTimeoutMs':timeout_ms,'environment':env,'subject':subject,'standing':'mechanical component proof only; no qualification'}
(output/'request.json').write_text(json.dumps(request,indent=2)+'\n')
timed_out=False
with (output/'stdout.raw').open('wb') as stdout,(output/'stderr.raw').open('wb') as stderr:
    process=subprocess.Popen(argv,cwd=tenant,env=env,stdout=stdout,stderr=stderr,start_new_session=True)
    try:
        code=process.wait(timeout=max(0,timeout_ms/1000-(time.monotonic()-clock)))
    except subprocess.TimeoutExpired:
        timed_out=True;os.killpg(process.pid,signal.SIGKILL);code=process.wait(timeout=10)
elapsed=time.monotonic()-clock
raw=(output/'stdout.raw').read_bytes();tap={}
for key,value in re.findall(rb'^# (tests|suites|pass|fail|cancelled|skipped|todo|duration_ms) ([0-9.]+)$',raw,re.M):
    tap[key.decode()]=float(value) if b'.' in value else int(value)
artifacts=[]
for path in [output/'stdout.raw',output/'stderr.raw',output/'request.json']:
    data=path.read_bytes();artifacts.append({'path':str(path),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
receipt={'started':started,'finished':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsedSeconds':elapsed,'pid':process.pid,'exitCode':code,'timedOut':timed_out,'tap':tap,'artifacts':artifacts}
(output/'process.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt,indent=2))
sys.exit(0 if code==0 and not timed_out else 1)
