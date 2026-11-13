#!/usr/bin/env python3
"""Freeze exact already-prepared new call; reuse established installed custody, no calls/effects."""
import hashlib,json,pathlib,sys
B=pathlib.Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01');P=B/'single-machine-p1-02';A=P/'attempt-001'
def pin(p):
 p=pathlib.Path(p);assert p.is_file() and not p.is_symlink(),str(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def load(p):return json.loads(pathlib.Path(p).read_text())
assert len(sys.argv)==2,'usage: freeze-dispatch.py PREFLIGHT_BINDING_SHA256_HEX'
b=pin(P/'PREFLIGHT_BINDING.json');assert b['sha256']==sys.argv[1];pre=load(b['path']);s=load(P/'ROOT_REUSE_SELECTION.json');assert s['status']=='ROOT_SELECTED_REUSE_AND_SOURCE';assert not (A/'STARTED.json').exists()
for row in pre['files']:assert pin(row['path'])==row,row['path']
e=pre['eventPrefix'];st=pathlib.Path(e['path']).stat();assert st.st_size==e['bytes'] and st.st_dev==e['device'] and st.st_ino==e['inode'];assert pin(e['path'])['sha256']==e['sha256']
files={pathlib.Path(r['path']) for r in pre['files']};files.update(P/n for n in ['PREFLIGHT_BINDING.json','ACTIVATE_P1.json','model-free-preflight.json']);files.update(A/n for n in ['run.json','input.json','prepared-call.json','PREPARED_CALL.json'])
a=load(P/'ACTIVATE_P1.json');p=load(A/'PREPARED_CALL.json');assert a['status']=='ROOT_SELECTED_PREPARATION' and p['status']=='prepared_not_admitted' and a['sourceBasis']=='none';assert a['workloadSha256']==p['workloadSha256']==s['workloadSha256']
inherited=load(pre['inheritedInstalledCustody']['path']);installed=[r for r in inherited['files'] if r['path'].startswith(s['runtimeRoot']+'/sandbox/installed/')];assert len(installed)==pre['inheritedInstalledFileCount']
for r in installed:assert pin(r['path'])==r,r['path']
local=[str(B/'operator-client'/n) for n in ['public-setup.mjs','runner.mjs','consumer.mjs','scenarios.mjs']]+[str(P/'reuse-state.mjs')]
result={'kind':'single_machine_p1_frozen_dispatch','status':'PREPARED_NOT_DISPATCHED','sourceBasis':'none','sourceCommit':s['sourceCommit'],'files':[pin(q) for q in sorted(files,key=str)],'sourceReadRoots':s['readRootCount'],'c2SelectedPaths':963,'constructionWritePaths':53,'commands':9,'eventPrefix':e,'offlineDependency':pre['offlineDependency'],'inheritedInstalledCustody':pre['inheritedInstalledCustody'],'inheritedInstalledFileCount':len(installed),'executableLocalClosure':{'modules':local,'method':'same four existing operator modules plus builtin-only reuse-state join; all selected bytes checked before installed import'},'limits':['New distinct Run only, not recovery or relabeled previous result.','No provider call/admission yet; currentness remains owned by installed runtime.','No whole Product qualification or release.']}
q=A/'PREPARATION_MANIFEST.json'
with q.open('x') as f:json.dump(result,f,indent=2,sort_keys=True);f.write('\n')
print(json.dumps(pin(q)))
