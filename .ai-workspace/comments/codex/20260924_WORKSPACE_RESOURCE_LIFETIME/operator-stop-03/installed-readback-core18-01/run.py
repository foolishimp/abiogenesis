"""Finite read controller; reuses the retained OS usage observer and existing bounds."""
import datetime,json,os,pathlib,signal,subprocess,sys,time
root=pathlib.Path(__file__).resolve().parent
observer=pathlib.Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/s02-carrier-02/observe-process.py')
command=['node',str(root/'read.mjs')]
observed=['python3',str(observer),str(root/'process-usage.json'),*command]
def write(name,value):
    with (root/name).open('x') as f: f.write(json.dumps(value,indent=2)+'\n')
started=time.monotonic();timed_out=None
with (root/'caller.stdout').open('xb') as out,(root/'caller.stderr').open('xb') as err:
    child=subprocess.Popen(observed,stdout=out,stderr=err,start_new_session=True,env={**os.environ,'NODE_OPTIONS':''})
    write('process.json',{'command':command,'observerCommand':observed,'startedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'processGroupId':child.pid,'readCeilingMs':600000,'outerCeilingMs':1800000,'defaultHeap':True})
    while child.poll() is None:
        if (time.monotonic()-started)*1000>1800000: timed_out='existing_finite_outer'
        try: phase=json.loads((root/'active-operation.json').read_text())
        except (FileNotFoundError,json.JSONDecodeError): phase=None
        if phase and not phase.get('completed') and time.time()*1000>phase['startedAtMs']+phase['limitMs']: timed_out=phase['label']
        if timed_out:
            os.killpg(child.pid,signal.SIGTERM)
            try: child.wait(timeout=1)
            except subprocess.TimeoutExpired: os.killpg(child.pid,signal.SIGKILL);child.wait()
            break
        time.sleep(0.1)
    code=child.wait()
result={'elapsedMs':(time.monotonic()-started)*1000,'returnCode':code,'selectedLimitReached':timed_out,'stdoutBytes':(root/'caller.stdout').stat().st_size,'stderrBytes':(root/'caller.stderr').stat().st_size}
write('process-result.json',result);print(json.dumps(result));sys.exit(code if code>=0 else 128-code)
