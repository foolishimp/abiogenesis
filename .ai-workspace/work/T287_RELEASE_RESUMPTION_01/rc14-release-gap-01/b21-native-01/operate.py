import datetime, hashlib, json, os, pathlib, signal, subprocess, sys, time

CONTROL = pathlib.Path(__file__).resolve().parent
RAW = pathlib.Path('/Users/jim/Library/Application Support/ABIogenesis/development-runs/rc14-b21-20261115-01')
SOURCE = pathlib.Path('/private/tmp/abg-rc14-b21-20261115-01')
ACT = json.loads((CONTROL / 'ACTIVATION.json').read_text())
LIMIT = ACT['limits']['hostControlDeadlineMs'] / 1000
MAX_BYTES = ACT['limits']['outputBytesPerCommand']

def write(name, value):
    with (RAW / name).open('x') as stream:
        json.dump(value, stream, indent=2); stream.write('\n')

def group_exists(pid):
    try: os.killpg(pid, 0); return True
    except ProcessLookupError: return False

def stop_group(pid):
    signals=[]
    for sig in (signal.SIGTERM, signal.SIGKILL):
        try: os.killpg(pid, sig); signals.append(sig.name)
        except ProcessLookupError: break
        until=time.monotonic()+5
        while group_exists(pid) and time.monotonic()<until: time.sleep(.05)
    return {'signals':signals,'hostProcessGroupAbsent':not group_exists(pid)}

started=time.monotonic(); start_utc=datetime.datetime.now(datetime.timezone.utc)
env={k:v for k,v in os.environ.items() if k in ['HOME','PATH','LANG','LC_ALL','CLAUDE_CODE_OAUTH_TOKEN']}
env.update({'HOME':'/Users/jim','PATH':'/Users/jim/.local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin',
            'TMPDIR':str(RAW/'host-scratch/tmp'),'NODE_OPTIONS':'--max-old-space-size=8192','GIT_OPTIONAL_LOCKS':'0'})
assert len(sys.argv)==2, 'one explicit Root launch-packet path required'
launch_path=pathlib.Path(sys.argv[1]).resolve()
launch=json.loads(launch_path.read_text())
assert launch['activationId']==ACT['id'] and launch['dispatchAuthorized'] is True
command=['/opt/homebrew/bin/node',str(CONTROL/'HOST.mjs'),str(launch_path)]
write('CONTROL_START.json',{'command':command,'source':str(SOURCE),'sourceHead':launch['sourceHead'],'launchSha256':hashlib.sha256(launch_path.read_bytes()).hexdigest(),'startedUtc':start_utc.isoformat(),
    'deadlineUtc':(start_utc+datetime.timedelta(seconds=LIMIT)).isoformat(),'hostControlDeadlineMs':int(LIMIT*1000),
    'providerCallsAtMost':1,'proofRetry':False,'oldCampaignClockReused':False})
with (RAW/'host.stdout.raw').open('xb') as out, (RAW/'host.stderr.raw').open('xb') as err:
    child=subprocess.Popen(command,cwd=SOURCE,env=env,stdin=subprocess.DEVNULL,stdout=out,stderr=err,start_new_session=True)
    write('HOST_PID.json',{'pid':child.pid,'processGroup':child.pid})
    reason=None; offset=0
    while child.poll() is None:
        elapsed=time.monotonic()-started
        if elapsed>=LIMIT: reason='host_deadline'; break
        if out.tell()+err.tell()>MAX_BYTES: reason='host_output_limit'; break
        # Small phase records only; full original bytes remain in raw files.
        with (RAW/'host.stdout.raw').open('rb') as reader:
            reader.seek(offset); data=reader.read(); offset=reader.tell()
        if data: print(data.decode('utf8',errors='replace'),end='',flush=True)
        time.sleep(1)
    cleanup=stop_group(child.pid) if reason or group_exists(child.pid) else {'signals':[],'hostProcessGroupAbsent':True}
    try: code=child.wait(timeout=5)
    except subprocess.TimeoutExpired: code=None
    with (RAW/'host.stdout.raw').open('rb') as reader:
        reader.seek(offset); tail=reader.read()
    if tail: print(tail.decode('utf8',errors='replace'),end='',flush=True)
result={'exitCode':code,'stopReason':reason,'elapsedMs':round((time.monotonic()-started)*1000),'cleanup':cleanup,
        'cleanupScope':'Host process group only; installed actor owner retains its own descendant/process facts. No global process absence claim.'}
for name in ['host.stdout.raw','host.stderr.raw']:
    data=(RAW/name).read_bytes();result[name]={'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
write('HOST_RETURN.json',result);print(json.dumps(result),flush=True)
sys.exit(0 if code==0 and reason is None and cleanup['hostProcessGroupAbsent'] else 1)
