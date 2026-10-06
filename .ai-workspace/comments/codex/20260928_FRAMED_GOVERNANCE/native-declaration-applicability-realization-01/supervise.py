from pathlib import Path
import os,json,time,subprocess,signal,resource,datetime,sys
report=Path(__file__).resolve().parent
label,limit,*command=sys.argv[1:]
limit=float(limit)
assert label and (report/'copied-tenant').is_dir()
result=report/'commands'/f'{label}.json'
assert not result.exists()
started=datetime.datetime.now(datetime.timezone.utc).isoformat();t0=time.monotonic()
env=os.environ.copy()
for key in ['NODE_OPTIONS','NODE_PATH','NODE_EXTRA_CA_CERTS','V8_OPTIONS']:
    env.pop(key,None)
node=Path(command[0]);assert node.name=='node'
env.update({'PATH':str(node.parent)+':/usr/bin:/bin','TMPDIR':str(report/'task-tmp'),'TMP':str(report/'task-tmp'),'TEMP':str(report/'task-tmp'),'ABI5_DECLARATION_BASELINE_MODULE':str(report.parent/'final-candidate-construction-03/final-install/node_modules/@abiogenesis/typescript-tenant/build/code/src/product/declaration_exports.js'),'ABI5_DECLARATION_PROOF_ROOT':str(report/'proof')})
record={'label':label,'command':command,'cwd':str(report/'copied-tenant'),'deadlineSeconds':limit,'startedAt':started,'environmentOverrides':{k:env[k] for k in ['PATH','TMPDIR','TMP','TEMP','ABI5_DECLARATION_BASELINE_MODULE','ABI5_DECLARATION_PROOF_ROOT']},'defaultHeapUnchanged':True,'removedNodeOverrides':['NODE_OPTIONS','NODE_PATH','NODE_EXTRA_CA_CERTS','V8_OPTIONS'],'outputs':{'stdout':str(report/'commands'/f'{label}.stdout.txt'),'stderr':str(report/'commands'/f'{label}.stderr.txt')}}
with open(record['outputs']['stdout'],'wb') as out,open(record['outputs']['stderr'],'wb') as err:
    proc=subprocess.Popen(command,cwd=record['cwd'],env=env,stdout=out,stderr=err,start_new_session=True)
    record['pid']=proc.pid;record['processGroup']=proc.pid
    (report/'commands'/f'{label}.running.json').write_text(json.dumps(record,indent=2)+'\n')
    timed_out=False
    while proc.poll() is None:
        if time.monotonic()-t0>limit:
            timed_out=True;os.killpg(proc.pid,signal.SIGTERM)
            try:proc.wait(timeout=3)
            except subprocess.TimeoutExpired:os.killpg(proc.pid,signal.SIGKILL)
            break
        time.sleep(.1)
    rc=proc.wait()
usage=resource.getrusage(resource.RUSAGE_CHILDREN)
record.update({'finishedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsedSeconds':time.monotonic()-t0,'exitCode':rc,'timedOut':timed_out,'reaped':True,'childUserCPUSeconds':usage.ru_utime,'childSystemCPUSeconds':usage.ru_stime,'childMaxResidentSetSizePlatformBytes':usage.ru_maxrss,'passed':rc==0 and not timed_out})
result.write_text(json.dumps(record,indent=2)+'\n')
print(json.dumps({k:record[k] for k in ['label','elapsedSeconds','exitCode','timedOut','reaped','passed']}))
sys.exit(0 if record['passed'] else 1)
