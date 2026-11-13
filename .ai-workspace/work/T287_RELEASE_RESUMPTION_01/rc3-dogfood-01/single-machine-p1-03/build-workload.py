#!/usr/bin/env python3
"""Build P1-02 finite workload only after exact source/grant and assessment-input selection."""
import hashlib,json,pathlib,sys
B=pathlib.Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01');P=B/'single-machine-p1-03';O=B/'single-machine-p1-01';W=pathlib.Path('/Users/jim/src/apps/abiogenesis-single-machine-p1')
def sha(b):return hashlib.sha256(b).hexdigest()
def checked(r):
 b=pathlib.Path(r['path']).read_bytes();assert len(b)==r['bytes'] and sha(b)==r['sha256'],r['path'];return b
assert len(sys.argv)==2,'usage: build-workload.py ROOT_REUSE_SELECTION_SHA256_HEX'
sraw=(P/'ROOT_REUSE_SELECTION.json').read_bytes();assert sha(sraw)==sys.argv[1];s=json.loads(sraw);assert s['status']=='ROOT_SELECTED_REUSE_AND_SOURCE' and s['rootAuthority'] and s['sourceCommit'];checked(s['rootAuthority'])
g=json.loads(checked(s['grant']));write=g['Construction']['writePaths'];assert len(set(write))==len(write)==10
for r in g['Construction']['preimages']:assert sha((W/r['path']).read_bytes())==r['sha256']
oldraw=(O/'workload-v2.json').read_bytes();assert sha(oldraw)=='e5d8dedeca4d4549cb57e356bb40cd64a62bc252663a8bf85db21d3a41180ee0';w=json.loads(oldraw);selected=w['testing']['selectedPaths'];assert len(selected)==963 and set(write)<=set(selected)
inputs=s['assessmentInputs'];assert len(inputs)>=5 and len({r['role'] for r in inputs})==len(inputs);byrole={r['role']:r for r in inputs};assert {'task','how','rubric','grant','counterexample'}<=set(byrole)
for r in inputs:
 checked(r);assert r['target'].startswith('rc3-operator-inputs/single-machine-p1-03/');assert (W/r['target']).read_bytes()==pathlib.Path(r['path']).read_bytes(),'Root must materialize exact inputs first'
task=checked(byrole['task']).decode();w['taskRef']='task://abiogenesis/single-machine-p1-03/complete-compact-native-context';w['task']=task;w['sources']=w['sources'][:3]+[{'path':r['target'],'digest':'sha256:'+r['sha256']} for r in inputs];w['readRoots']=sorted(set(selected+[r['target'] for r in inputs]));w['authorityRefs']=[pathlib.Path(s['rootAuthority']['path']).as_uri()];w['requiredSupportRefs']=['support://abiogenesis/single-machine-p1-03/compact-native-context'];w['assessment']['rubricPath']=byrole['rubric']['target'];w['assessment']['sources']=[r['target'] for r in inputs if r['role']!='rubric']
for role,order in w['workOrders'].items():order.update({'instructions':[task],'checks':[],'readFirst':[r['target'] for r in inputs],'writeRoots':write if role=='construction' else []})
t=w['testing'];t['commands'][1]['args']=t['commands'][1]['args'][:2]+sorted(write)
focused=g['Testing']['focusedFiles'];assert set(focused)<=set(selected);stem='build_tenants/abiogenesis/typescript/';t['commands'][6]['args']=['--experimental-vm-modules','--test','--test-concurrency=1']+[p.removeprefix(stem) for p in focused]
assert len(t['commands'])==9 and len(w['readRoots'])<=w['maxContextFiles']
q=P/'workload-v2.json'
with q.open('x') as f:json.dump(w,f,indent=2,sort_keys=True);f.write('\n')
print(json.dumps({'path':str(q),'sha256':sha(q.read_bytes()),'readRoots':len(w['readRoots']),'selectedPaths':len(selected),'writePaths':len(write),'focusedFiles':len(focused),'commands':9}))
