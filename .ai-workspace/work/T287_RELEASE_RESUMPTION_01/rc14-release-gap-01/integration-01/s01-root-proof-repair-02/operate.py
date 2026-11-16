import datetime, hashlib, json, os, pathlib, signal, stat, subprocess, sys, time

CONTROL = pathlib.Path(__file__).resolve().parent
ACT = json.loads((CONTROL / 'ACTIVATION.json').read_text())
RAW = pathlib.Path(ACT['rawRoot'])
SOURCE = pathlib.Path(ACT['sourceWorktree'])
CLEANUP_RESERVE = ACT['limits']['cleanupReserveMs'] / 1000
MAX_BYTES = ACT['limits']['outputBytesPerCommand']

def write(name, value):
    with (RAW / name).open('x') as stream:
        json.dump(value, stream, indent=2); stream.write('\n')

def launch_bytes(path):
    path = pathlib.Path(path)
    before = path.lstat()
    assert stat.S_ISREG(before.st_mode) and not path.is_symlink(), 'launch must be a regular non-symlink file'
    data = path.read_bytes()
    after = path.lstat()
    assert (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns) == (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns), 'launch changed while read'
    return data

def stage_launch(input_path, raw, activation_id):
    input_path = pathlib.Path(input_path)
    data = launch_bytes(input_path)
    launch = json.loads(data)
    assert launch['activationId'] == activation_id and launch['dispatchAuthorized'] is True
    staged = pathlib.Path(raw) / 'LAUNCH.json'
    with staged.open('xb') as stream:
        stream.write(data)
    assert launch_bytes(staged) == data == launch_bytes(input_path), 'approved/staged launch bytes differ'
    receipt = {'inputPath': str(input_path.resolve()), 'stagedPath': str(staged), 'bytes': len(data),
               'sha256': hashlib.sha256(data).hexdigest(), 'exclusiveCopy': True, 'entryEquality': True}
    return staged, launch, receipt

def verify_launch_entry(input_path, staged, control_start):
    data = launch_bytes(input_path)
    assert data == launch_bytes(staged), 'approved/staged launch bytes differ at entry'
    assert hashlib.sha256(data).hexdigest() == control_start['launchSha256'], 'CONTROL_START launch digest differs'
    launch = json.loads(data)
    assert launch['sourceHead'] == control_start['sourceHead'], 'CONTROL_START source differs'

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
LIMIT=ACT['limits']['hostControlDeadlineMs']/1000
original_deadline=start_utc+datetime.timedelta(seconds=LIMIT)
assert LIMIT>CLEANUP_RESERVE
EXECUTION_LIMIT=LIMIT-CLEANUP_RESERVE
env={k:v for k,v in os.environ.items() if k in ['HOME','PATH','LANG','LC_ALL','CLAUDE_CODE_OAUTH_TOKEN']}
env.update({'HOME':'/Users/jim','PATH':'/Users/jim/.local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin',
            'TMPDIR':str(RAW/'host-scratch/tmp'),'NODE_OPTIONS':'--max-old-space-size=8192','GIT_OPTIONAL_LOCKS':'0'})
assert len(sys.argv)==2, 'one explicit Root launch-packet path required'
input_launch_path=pathlib.Path(sys.argv[1]).absolute()
launch_path,launch,staging=stage_launch(input_launch_path,RAW,ACT['id'])
write('LAUNCH_STAGING.json',staging)
command=['/opt/homebrew/bin/node',str(CONTROL/'HOST.mjs'),str(launch_path)]
write('CONTROL_START.json',{'command':command,'source':str(SOURCE),'sourceHead':launch['sourceHead'],'launchSha256':staging['sha256'],'launchInputPath':staging['inputPath'],'stagedLaunchPath':str(launch_path),'startedUtc':start_utc.isoformat(),
    'deadlineUtc':original_deadline.isoformat(),'hostControlDeadlineMs':int(LIMIT*1000),
    'executionStopDeadlineUtc':(original_deadline-datetime.timedelta(seconds=CLEANUP_RESERVE)).isoformat(),'cleanupReserveMs':int(CLEANUP_RESERVE*1000),
    'providerCallsAtMost':1,'proofRetry':False,'oldCampaignClockReused':False})
verify_launch_entry(input_launch_path,launch_path,json.loads((RAW/'CONTROL_START.json').read_text()))
with (RAW/'host.stdout.raw').open('xb') as out, (RAW/'host.stderr.raw').open('xb') as err:
    child=subprocess.Popen(command,cwd=SOURCE,env=env,stdin=subprocess.DEVNULL,stdout=out,stderr=err,start_new_session=True)
    write('HOST_PID.json',{'pid':child.pid,'processGroup':child.pid})
    reason=None; offset=0
    while child.poll() is None:
        elapsed=time.monotonic()-started
        if elapsed>=EXECUTION_LIMIT: reason='original_host_deadline_cleanup_reserve'; break
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
final_bytes=sum(result[name]['bytes'] for name in ['host.stdout.raw','host.stderr.raw'])
result['finalCapture']={'bytes':final_bytes,'limit':MAX_BYTES,'withinLimit':final_bytes<=MAX_BYTES}
if final_bytes>MAX_BYTES: reason=reason or 'host_output_limit_at_exit'
if time.monotonic()-started>=LIMIT: reason=reason or 'original_host_deadline_at_exit'
result['stopReason']=reason
write('HOST_RETURN.json',result);print(json.dumps(result),flush=True)
sys.exit(0 if code==0 and reason is None and cleanup['hostProcessGroupAbsent'] else 1)
