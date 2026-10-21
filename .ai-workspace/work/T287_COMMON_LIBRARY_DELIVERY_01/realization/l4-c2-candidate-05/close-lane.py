from pathlib import Path
import datetime,hashlib,json,subprocess,sys
R=Path(__file__).resolve().parent
name=sys.argv[1];D=R/name
def load(p):return json.loads(p.read_text())
def pin(p):
 b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b),'mode':oct(p.stat().st_mode&0o777)}
def put(p,x):
 with p.open('x') as f:json.dump(x,f,indent=2);f.write('\n')
 return pin(p)
B=load(R/'intake/binding-result.json');c=load(D/'configuration.json')
lane={'p1':'public-preparation','p2':'partial-install','p3':'declared-execution','owner-resolution':'owner-resolution'}[name]
command=load(D/'commands'/f'{name}.result.json')
evidence=Path(c['outputRoot'] if name=='owner-resolution' else c['lanes'][lane]['roots']['evidence'])
actual=evidence/'result.json'
assert command['exitCode']==0 and not command.get('timeout')
result=load(actual);assert result['status']=='satisfied' and result['subjectId']=='candidate'
retain=Path(B['retain']['path']);assert pin(retain)['sha256']==B['retain']['sha256']
argv=[sys.executable,str(retain),str(D),lane]
put(D/'retention-command.json',{'argv':argv,'environment':{'PATH':'/usr/bin:/bin','LANG':'C'},'mechanism':B['retain'],'scope':'Existing finite evidence copier and physical inventory, once after endpoint; original roots retained.'})
done=subprocess.run(argv,env={'PATH':'/usr/bin:/bin','LANG':'C'},capture_output=True)
(D/'retention.stdout').write_bytes(done.stdout);(D/'retention.stderr').write_bytes(done.stderr)
put(D/'retention-result.json',{'exitCode':done.returncode,'stdout':pin(D/'retention.stdout'),'stderr':pin(D/'retention.stderr')})
assert done.returncode==0,done.stderr.decode()
if name=='p1':
 state=load(evidence/'p1-owner-state.json');put(D/'actual-prefix.json',{'closeHandoff':state['closeHandoff'],'source':pin(evidence/'p1-owner-state.json'),'scope':'Actual P1 close prefix, before any P2 effect.'})
elif name=='p2':
 put(D/'actual-prefix.json',{'actualReturnedHandoff':pin(evidence/'actual-returned-handoff.json'),'source':load(evidence/'actual-returned-handoff.json'),'scope':'Use actual returned authority; do not infer no physical effect from refusal.'})
usage=subprocess.run(['/usr/bin/du','-sk',B['runtime'],str(R)],capture_output=True,env={'PATH':'/usr/bin:/bin','LANG':'C'});assert usage.returncode==0
allocated=sum(int(x.split()[0]) for x in usage.stdout.splitlines())*1024
put(D/'retained-storage.json',{'argv':usage.args,'stdout':usage.stdout.decode(),'allocatedBytes':allocated,'limitBytes':4294967296,'scope':'Post-endpoint owned physical parent and record carrier; not peak storage.'});assert allocated<=4294967296
ret=put(D/'return.json',{'status':'satisfied','subjectId':'candidate','lane':name,'actualResult':pin(actual),'portableResult':pin(D/'evidence/result.json'),'candidate':B['freeze'],'archive':B['subject']['archive'],'configuration':pin(D/'configuration.json'),'grant':pin(D/'effect-grant.json'),'command':pin(D/'commands'/f'{name}.result.json'),'physicalResources':pin(D/'physical-resources.json'),'footprints':pin(D/'retained-footprints.json'),'retryCount':0,'nativeProviderCalls':0,'noL5Acceptance':True})
files=[pin(p) for p in sorted(D.rglob('*')) if p.is_file() and p.name!='freeze.json']
freeze=put(D/'freeze.json',{'status':'closed_original_endpoint','lane':name,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'files':files,'return':ret,'physicalRootsRetained':True})
print(json.dumps({'status':'satisfied','lane':name,'actualResult':pin(actual),'freeze':freeze,'return':ret,'retainedAllocatedBytes':allocated,'wallMs':command['wallMs']}))
