#!/usr/bin/env python3
"""Bind completed model-free preparation to the existing call constructor; no Public/provider execution."""
import hashlib,json,pathlib,sys
P=pathlib.Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/single-machine-p1-03/budget-retest-01')
def pin(p):
 p=pathlib.Path(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def load(p):return json.loads(pathlib.Path(p).read_text())
assert len(sys.argv)==2 and pin(P/'PREFLIGHT_BINDING.json')['sha256']==sys.argv[1];b=load(P/'PREFLIGHT_BINDING.json');s=load(P/'ROOT_CALL_SELECTION.json');pre=load(P/'model-free-preflight.json');assert s['status']=='ROOT_SELECTED_FRESH_TESTING_UAT_CALL';assert b['status']=='ROOT_SELECTED_MODEL_FREE_PREFLIGHT' and pre['status']=='prepared_not_dispatched';assert pre['workloadSha256']==s['workloadSha256'];assert pre['priorEvent']['sha256']==s['eventPrefix']['sha256']
for r in b['files']:assert pin(r['path'])==r,r['path']
result={'kind':'single_machine_p1_actual_call_preparation','status':'ROOT_SELECTED_PREPARATION','sourceBasis':'none','sourceCommit':s['sourceCommit'],'operatorClosure':b['files'],'preflightBindingSha256':pin(P/'PREFLIGHT_BINDING.json')['sha256'],'preflightSha256':pin(P/'model-free-preflight.json')['sha256'],'setupResumeSha256':s['setupResume']['sha256'],'workloadSha256':s['workloadSha256'],'initialEventLog':{'bytes':s['eventPrefix']['bytes'],'sha256':s['eventPrefix']['sha256'],'coordinateDigest':s['eventPrefix']['coordinateDigest']},'authority':'Current Root selection of the new distinct P1-02 Work, exact source and final handoff; no previous Result imported','limits':['Call construction only; actual dispatch remains Root after final manifest review.','Predictive controlled-selector preflight is not an admitted Result.']}
q=P/'ACTIVATE_P1.json'
with q.open('x') as f:json.dump(result,f,indent=2,sort_keys=True);f.write('\n')
print(json.dumps(pin(q)))
