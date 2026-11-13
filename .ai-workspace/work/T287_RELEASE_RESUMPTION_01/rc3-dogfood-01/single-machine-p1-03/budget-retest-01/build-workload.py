import pathlib,json,hashlib,sys
Q=pathlib.Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/single-machine-p1-03/budget-retest-01');P=Q.parent
raw=(Q/'QUALIFICATION_SELECTION.json').read_bytes();assert len(sys.argv)==2 and hashlib.sha256(raw).hexdigest()==sys.argv[1];s=json.loads(raw);assert s['status']=='ROOT_SELECTED_CLOSED_UNCHANGED_CANDIDATE';assert s['finalSourceCheckpoint'] and s['previousRunClosure'] and s['priorConstructionAdmission']
def checked(r):
 b=pathlib.Path(r['path']).read_bytes();assert len(b)==r['bytes'] and hashlib.sha256(b).hexdigest()==r['sha256'];return b
checked(s['finalSourceCheckpoint']);checked(s['previousRunClosure']);checked(s['priorConstructionAdmission']);old=json.loads((P/'workload-v2.json').read_text());t=old['testing'];focus=next(c for c in t['commands'] if c['commandId'].endswith('/focused-owner-chain'));assert focus['timeoutMs']==600000;focus['timeoutMs']=1200000
inputs=s['assessmentInputs'];assert len(inputs)==7 and len({r['role'] for r in inputs})==7;by={r['role']:r for r in inputs};task=checked(by['task']).decode();old['taskRef']='task://abiogenesis/single-machine-p1-03/budget-retest-current-candidate';old['task']=task;old['sources']=old['sources'][:3]+[{'path':r['target'],'digest':'sha256:'+r['sha256']} for r in inputs]
for r in inputs:checked(r);assert pathlib.Path(s['worksiteRoot'],r['target']).read_bytes()==pathlib.Path(r['path']).read_bytes()
old['readRoots']=sorted(set(t['selectedPaths']+[r['target'] for r in inputs]));assert len(t['selectedPaths'])==963;old['requiredSupportRefs']=['support://abiogenesis/p3-budget-retest/current-candidate'];old['assessment']['rubricPath']=by['rubric']['target'];old['assessment']['sources']=[r['target'] for r in inputs if r['role']!='rubric'];old['authorityRefs']=[pathlib.Path(s['rootAuthority']['path']).as_uri()];old['workOrders']={k:v for k,v in old['workOrders'].items() if k in ['testing','uat']}
for order in old['workOrders'].values():order.update(instructions=[task],writeRoots=[],readFirst=[r['target'] for r in inputs],checks=[])
assert len(t['commands'])==9 and all(not o['writeRoots'] for o in old['workOrders'].values());out=Q/'workload.json'
with out.open('x') as f:json.dump(old,f,indent=2,sort_keys=True);f.write('\n')
print(json.dumps({'workloadSha256':hashlib.sha256(out.read_bytes()).hexdigest(),'readRoots':len(old['readRoots']),'commands':9,'focusedTimeoutMs':1200000,'canonicalWrites':0,'state':'not admitted'}))
