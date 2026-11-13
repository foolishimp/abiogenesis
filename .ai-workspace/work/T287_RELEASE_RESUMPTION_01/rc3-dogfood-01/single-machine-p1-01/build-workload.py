#!/usr/bin/env python3
"""Build a draft finite P1 workload from unchanged B11 workload and selected inputs; no Product or native call."""
import hashlib,json,pathlib
B=pathlib.Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01');P=B/'single-machine-p1-01';W=pathlib.Path('/Users/jim/src/apps/abiogenesis-single-machine-p1')
def sha(b):return hashlib.sha256(b).hexdigest()
def pinned(p,h):
 v=p.read_bytes()
 if sha(v)!=h:raise ValueError('changed input '+str(p))
 return v
old=json.loads(pinned(B/'increment-b-11/workload.json','7688dffbc5ec799d2ca9725e89e02694da9ae8ca69aafcd601c74cb65fce2b97'))
g=json.loads(pinned(P/'NATIVE_GRANT.json','64ea969d4521c67344ff3ff3b05f0ad353c057631662e119988af40bd32a66bf'))
inputs={'task-v2.md':'2c86ace65612714db47a11ca59493d3c7e5a620720c95c846aad43a3d702d300','HOW.md':'f3e9810fcfe968df47a29306b4f02a213156f4ceea64da2e41c12b586d77b873','rubric.json':'5137555d3e58ae207b8bef9b8c16d33758f63ee421ae2e2392942dc8d001a3d2','COUNTEREXAMPLE.json':'a589c5aa8b934c5a09912bf5d4fd0d3ee1403de08b249eddd9cee6abb58c4004','NATIVE_GRANT.json':'64ea969d4521c67344ff3ff3b05f0ad353c057631662e119988af40bd32a66bf'}
for n,h in inputs.items():pinned(P/n,h)
pre=g['Construction']['preimages'];write=g['Construction']['writePaths'];assert len(pre)==len(write)==46 and len(set(write))==46 and {r['path'] for r in pre}==set(write)
for r in pre:
 v=(W/r['path']).read_bytes();assert len(v)==r['bytes'] and sha(v)==r['sha256'],r['path']
base=old['testing']['selectedPaths'];add=sorted(set(write)-set(base));assert len(base)==961 and add==['build_tenants/abiogenesis/typescript/design/M03_INSTRUCTION_ASSEMBLY_DERIVATION.md','build_tenants/abiogenesis/typescript/design/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md']
selected=sorted(set(base+add));assert len(selected)==963 and set(write)<=set(selected)
for q in selected:assert (W/q).is_file(),q
prefix='rc3-operator-inputs/single-machine-p1-01/';target={n:prefix+n for n in inputs};task=(P/'task-v2.md').read_text()
for r in old['sources'][:3]:assert sha((W/r['path']).read_bytes())==r['digest'].removeprefix('sha256:'),r['path']
old['taskRef']='task://abiogenesis/single-machine-p1-01/compact-native-context';old['task']=task
old['sources']=old['sources'][:3]+[{'path':target[n],'digest':'sha256:'+h} for n,h in inputs.items()]
old['readRoots']=sorted(set(selected+list(target.values())));old['authorityRefs']=[(P/'WORKSPACE_AUTHORITY.md').as_uri()];old['requiredSupportRefs']=['support://abiogenesis/single-machine-p1-01/compact-native-context']
old['assessment']={'candidatePath':'build_tenants/abiogenesis/typescript/release-claim.md','rubricPath':target['rubric.json'],'sources':[target['task-v2.md'],target['HOW.md'],target['NATIVE_GRANT.json'],target['COUNTEREXAMPLE.json']]}
readfirst=list(target.values())+['build_tenants/abiogenesis/typescript/code/src/product/worksite_operations.ts','build_tenants/abiogenesis/typescript/code/src/product/native_workspace_work.ts','build_tenants/abiogenesis/typescript/code/src/abg/event_store.ts','build_tenants/abiogenesis/typescript/code/src/abg/traversal_route.ts']
outcome='Compact owner-authenticated native context and retained handoffs under the unchanged ABI Product and STDO basis.'
for name,order in old['workOrders'].items():order.update({'checks':[],'outcome':outcome,'readFirst':readfirst,'writeRoots':write if name=='construction' else [],'instructions':[task]})
t=old['testing'];t['selectedPaths']=selected;assert len(t['commands'])==9
correspond=t['commands'][1];assert correspond['commandId'].endswith('/source-correspondence');correspond['args']=['-e',"const fs=require('node:fs'),crypto=require('node:crypto'),prefix='build_tenants/abiogenesis/typescript/';console.log(JSON.stringify({prefix}));for(const p of process.argv.slice(1).sort()){if(!p.startsWith(prefix))throw Error('path outside exact prefix');const b=fs.readFileSync(p);console.log(JSON.stringify({p:p.slice(prefix.length),b:b.length,h:crypto.createHash('sha256').update(b).digest('hex')}))}"]+sorted(write)
focused=t['commands'][6];assert focused['commandId'].endswith('/focused-owner-chain');stem='build_tenants/abiogenesis/typescript/'
files=g['Testing']['focusedFiles'];assert len(files)==8 and set(files)<=set(selected) and all(x.startswith(stem) for x in files)
focused['args']=['--experimental-vm-modules','--test','--test-concurrency=1']+[x[len(stem):] for x in files]
assert len(old['readRoots'])<=old['maxContextFiles'] and all(len(o['writeRoots'])==0 for k,o in old['workOrders'].items() if k!='construction')
output=P/'workload-v2.json'
with output.open('x') as f:json.dump(old,f,indent=2,sort_keys=True);f.write('\n')
print(json.dumps({'status':'draft_not_native_admitted','workload':str(output),'sha256':sha(output.read_bytes()),'selectedPaths':len(selected),'readRoots':len(old['readRoots']),'writeRoots':len(write),'focusedFiles':len(files),'commands':len(t['commands'])}))
