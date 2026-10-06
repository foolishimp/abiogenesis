from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import os
import stat
import time

root=Path(__file__).resolve().parent
started=time.monotonic()
def read(name):
    return json.loads((root/name).read_text())
def write(name,value):
    with (root/name).open('x') as f:
        json.dump(value,f,indent=2);f.write('\n')
def digest(path):
    h=hashlib.sha256()
    with Path(path).open('rb') as f:
        for body in iter(lambda:f.read(1024*1024),b''):h.update(body)
    return h.hexdigest()
def inventory(directory):
    records,dirs=[],[]
    for current,names,files in os.walk(directory,followlinks=False):
        names.sort();files.sort()
        for name in list(names)+files:
            p=Path(current)/name;s=p.lstat();r={'path':str(p.relative_to(directory)),'mode':oct(stat.S_IMODE(s.st_mode))}
            if stat.S_ISLNK(s.st_mode):
                r.update(kind='symlink',target=os.readlink(p));records.append(r)
                if name in names:names.remove(name)
            elif stat.S_ISDIR(s.st_mode):r.update(kind='directory');dirs.append(r)
            elif stat.S_ISREG(s.st_mode):r.update(kind='file',bytes=s.st_size,sha256=digest(p));records.append(r)
            else:r.update(kind='nonregular',physicalType=stat.S_IFMT(s.st_mode));records.append(r)
    return sorted(records,key=lambda r:r['path']),sorted(dirs,key=lambda r:r['path'])

a=read('runtime-activation.json');failure=read('first-failure.json');sup=read('setup-supervisor-close.json');start=read('setup-supervisor-start.json')
assert failure['status']=='FIRST_FAILURE_STOPPED'
assert sup['wait4ReapedMain'] and sup['processGroupAfterWait']=='absent'
assert all(g['afterTERM']=='absent' for g in sup['knownCLIProcessGroups'])
handoff=failure['latestHandoff'].get('closeHandoff') if failure.get('latestHandoff') else None
calls=failure['latestHandoff'].get('calls',[]) if failure.get('latestHandoff') else []
observed=[]
for call in calls:
    stem='setup-'+call['label'];row=dict(call)
    for suffix,key in [('-stdout.json','transport'),('-timing.json','timing'),('-native-process.json','nativeProcess')]:
        p=root/(stem+suffix)
        if p.exists():
            try:row[key]=json.loads(p.read_text())
            except json.JSONDecodeError:row[key]={'completeJson':False,'bytes':p.stat().st_size,'sha256':digest(p)}
    observed.append(row)
conserved=[]
for p in read('preimages.json')['pins']:
    actual=Path(p['path']);row=dict(p,actualBytes=actual.stat().st_size,actualSha256=digest(actual));row['unchanged']=row['bytes']==row['actualBytes'] and row['sha256']==row['actualSha256'];conserved.append(row)
old=[]
for p in read('preimages.json')['oldEventPhysical']:
    actual=Path(p['path']);s=actual.stat();row=dict(p,unchangedBytesIdentityMtime=s.st_size==p['bytes'] and digest(actual)==p['sha256'] and s.st_dev==p['device'] and s.st_ino==p['inode'] and s.st_mtime_ns==p['mtimeNs']);old.append(row)
write('conservation.json',{'exactFinitePins':conserved,'actualOldEventConservation':old,'allUnchanged':all(p['unchanged'] for p in conserved) and all(p['unchangedBytesIdentityMtime'] for p in old),'sourceWrapperGitNetworkProviderEffects':0})
write('accounting.json',{'status':'CLOSED','supervisor':sup,'start':start,'actualOrdinaryPublicCallsRecorded':len(calls),'calls':observed,'HOME':start['HOME'],'heap':'unchanged/default','managedOuterGroupBeforeImports':start['groupEstablishedBeforeImports'],'unknowns':{'npmInternalChildPids':'not individually enumerated','ambientProcessPopulation':'not enumerated'},'additionalRuntimeCallsAfterFailure':0,'providerTaskRunHelperQualificationNetworkGitEffects':0})
handoff_digest='sha256:'+hashlib.sha256(json.dumps(handoff,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()).hexdigest() if handoff else None
write('closed-event-resource-handoff.json',{'status':'CLOSED_FIRST_FAILURE_PARTIAL_SETUP','closeHandoff':handoff,'handoffDigest':handoff_digest,'physical':failure.get('physical'),'latestLawfulBoundary':'saved actual last Public closeHandoff only; no runtime reconstruction','setupComplete':False,'F11TaskRun':'STOPPED'})
write('closure.json',{'status':'CLOSED','operation':a['operation'],'actor':a['actor'],'workResult':'stopped_at_first_actual_failure','firstDiscrepancy':failure,'recordedCalls':len(calls),'resourceHandoff':'closed-event-resource-handoff.json','resourceHandoffDigest':handoff_digest,'allDownstreamSetupAndWholePath':'not completed; separate Root triangulation required','retryRepairAdditionalRuntimeCalls':0,'writesAfterFreeze':'STOPPED','knownProcessClosure':sup,'reportElapsedMsBeforeFreeze':(time.monotonic()-started)*1000})
with (root/'return.md').open('x') as f:
    f.write('CLOSED — '+a['operation']+' stopped at its first actual failure.\n\n'+json.dumps(failure['error'],indent=2)+'\n\nThe exact last receipts, native processes, costs, known group closure and partial authentic resource handoff are retained. No retry, repair or additional Runtime call occurred. Complete setup and the downstream whole carrier remain unproved. Worker is CLOSED; writes stop after freeze.\n')
records,dirs=inventory(root)
write('freeze.json',{'status':'CLOSED','operation':a['operation'],'role':a['role'],'actor':a['actor'],'frozenAt':datetime.now(timezone.utc).isoformat(),'workResult':'stopped_at_first_actual_failure','return':'return.md','closure':'closure.json','resourceHandoff':'closed-event-resource-handoff.json','resourceHandoffDigest':handoff_digest,'recordCount':len(records),'recordBytes':sum(r.get('bytes',0) for r in records),'symlinks':sum(r['kind']=='symlink' for r in records),'directoryCount':len(dirs),'records':records,'directories':dirs,'excludedSelf':'freeze.json only; all other actual territory file/link/directory populations included'})
print(json.dumps({'status':'CLOSED','freeze':str(root/'freeze.json'),'bytes':(root/'freeze.json').stat().st_size,'sha256':digest(root/'freeze.json'),'recordedCalls':len(calls),'failure':failure['error']}))
