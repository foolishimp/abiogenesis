#!/usr/bin/env python3
"""Freeze actual Root preflight/call outputs and existing preparation; no ABI imports."""
import hashlib,json,subprocess,sys
from pathlib import Path
P=Path(__file__).resolve().parent;W=Path('/Users/jim/src/apps/abiogenesis-rc4-native-recovery');A=P/'execution'
def pin(q):
 assert q.is_file() and not q.is_symlink(),str(q)
 b=q.read_bytes();return {'path':str(q),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def load(q):return json.loads(q.read_text())
assert len(sys.argv)==2,'usage: freeze-dispatch.py CALL_PREPARATION_BINDING_SHA256_HEX'
bp=pin(P/'CALL_PREPARATION_BINDING.json');assert bp['sha256']==sys.argv[1];b=load(P/'CALL_PREPARATION_BINDING.json')
for r in b['files']:assert pin(Path(r['path']))==r,r['path']
pre=load(P/'model-free-preflight.json');call=load(A/'PREPARED_CALL.json');assert pre['status']==call['status']=='prepared_not_dispatched';assert pre['bindingDigest']==call['bindingDigest']==bp['sha256'];assert pre['providerCalls']==call['providerCalls']==0
assert call['callFileSha256']==pin(A/'prepared-call.json')['sha256'];assert call['inputFileSha256']==pin(A/'input.json')['sha256'];assert call['preflightSha256']==pin(P/'model-free-preflight.json')['sha256']
assert subprocess.check_output(['/usr/bin/git','-C',str(W),'rev-parse','HEAD'],text=True).strip()==b['sourceCommit'];subprocess.run(['/usr/bin/git','-C',str(W),'diff','--quiet'],check=True);subprocess.run(['/usr/bin/git','-C',str(W),'diff','--cached','--quiet'],check=True)
e=b['eventPrefix'];ep=Path(e['path']);st=ep.stat();assert st.st_size==e['bytes'] and st.st_dev==e['device'] and st.st_ino==e['inode'];assert pin(ep)['sha256']==e['sha256'];assert pre['eventPrefix']==call['eventPrefix']==e;assert not(A/'STARTED.json').exists()
profile=load(P/'PROVIDER_PROFILE.json');assert pre['requiredExecutionBudgetMs']==4267250;assert pre['limits']=={'inactivityTimeoutMs':4500000,'absoluteTimeoutMs':5400000};assert profile['maxBudgetUsd'] is None
files=[P/x for x in ['CALL_PREPARATION_BINDING.json','ROOT_ADMISSION.json','model-free-preflight.json','dispatch.mjs','freeze-dispatch.py','setup-state.mjs','operator-preflight.py','claude-provider.sh']]+[A/x for x in ['run.json','input.json','prepared-call.json','PREPARED_CALL.json']]
m={'kind':'rc4_fresh_native_frozen_dispatch','status':'PREPARED_NOT_DISPATCHED','sourceBasis':'none','sourceCommit':b['sourceCommit'],'authority':b['authority'],'callPreparationBinding':bp,'files':[pin(q) for q in files],'eventPrefix':e,'callCanonicalDigest':call['callCanonicalDigest'],'inputCanonicalDigest':call['inputCanonicalDigest'],'contextDigest':pre['contextDigest'],'sourceWritePaths':53,'generatedOutputWriteRoots':2,'scratchWriteRoots':1,'c2SelectedPaths':966,'readRoots':len(load(P/'workload.json')['readRoots']),'focusedFiles':18,'commands':9,'requiredExecutionBudgetMs':4267250,'actualPromptBytes':pre['controlledSelector']['promptBytes'],'profile':pin(P/'PROVIDER_PROFILE.json'),'actualAfterRunResume':b['afterResume'],'ambientEnvironment':pre['ambientEnvironment'],'qualification':False,'release':False,'automaticRetry':False,'limits':['Root-only one-shot dispatch','Native source/model-free evidence distinct from later required installed native interruption witness','Fresh native development; full R1–R5 proof and separate practical witness remain required']}
q=A/'PREPARATION_MANIFEST.json'
with q.open('x') as f:json.dump(m,f,indent=2);f.write('\n')
print(json.dumps(pin(q)))
