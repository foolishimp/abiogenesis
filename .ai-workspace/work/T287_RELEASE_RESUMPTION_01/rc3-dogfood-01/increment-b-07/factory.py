#!/usr/bin/env python3
"""Bind B07 workload to selected source and actual fresh setup; no native call."""
from pathlib import Path
import hashlib,json,subprocess
base=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01');folder=base/'increment-b-07';work=Path('/Users/jim/src/apps/abiogenesis-rc3-dogfood');prefix='rc3-operator-inputs/increment-b-07';sha=lambda b:hashlib.sha256(b).hexdigest()
assert (base/'setup-003/operator-resume-material.json').is_file() and (base/'setup-003/summary.json').is_file(),'actual fresh RC2 setup required'
assert not (folder/'workload.json').exists() and not (folder/'snapshot-census.json').exists()
old=json.loads((base/'increment-b-06/workload.json').read_bytes());custody=json.loads((base/'attempt-008/B06_PARTIAL_CUSTODY.json').read_bytes());binding=json.loads((folder/'B07_SOURCE_BINDINGS.json').read_bytes())
grant=json.loads((base/'increment-b-01/grant.json').read_bytes());paths=grant['existingPaths']+grant['newPaths'];assert len(set(paths))==23
assert subprocess.check_output(['/usr/bin/git','rev-parse','HEAD'],cwd=work,text=True).strip()==custody['baseCommit']==binding['sourceCommit']
status=subprocess.check_output(['/usr/bin/git','status','--porcelain=v1','-z','--untracked-files=all','--','build_tenants/abiogenesis/typescript'],cwd=work).decode().split('\0');assert sorted(s[3:] for s in status if s)==binding['changedPaths']
for row in custody['rows']:
 p=work/row['path'];assert p.is_file() and not p.is_symlink() and sha(p.read_bytes())==row['current']['sha256'],row['path']
for row in [binding['stdo']['resolvedEntrypoint'],binding['stdo']['interpreter'],binding['stdo']['releaseManifest'],*binding['stdo']['toolchainModuleSources'],*binding['declaredGc03RecipeAndSources']]:
 p=Path(row['path']);assert p.is_file() and len(p.read_bytes())==row['bytes'] and sha(p.read_bytes())==row['sha256'],p
names=['task.md','HOW.md','rubric.json','NAMED_INTEGRATION_CHECK.json','B07_SOURCE_BINDINGS.json'];inputs=[prefix+'/'+n for n in names]
for name,path in zip(names,inputs):assert (work/path).read_bytes()==(folder/name).read_bytes(),path
superseded=lambda p:p.startswith('rc3-operator-inputs/increment-b-06/')
selected=sorted((set(p for p in old['readRoots'] if not superseded(p)))|set(inputs));rows={}
for p in selected:
 f=work/p;assert f.is_file() and not f.is_symlink(),p;raw=f.read_bytes();rows[p]={'state':'file','sha256':sha(raw),'bytes':len(raw)}
rubric=json.loads((work/inputs[2]).read_bytes());assert [r['id'] for r in rubric['criteria']]==['B07-1','B07-2','B07-3','B07-4','B07-5']
task=(work/inputs[0]).read_text();read_first=list(dict.fromkeys([p for p in old['workOrders']['construction']['readFirst'] if not superseded(p)]+paths+inputs));assert set(read_first)<=set(selected)
orders={role:{'outcome':'Contribute to the Root-selected bounded B07 mechanical outcome and preserve upstream A/B history','instructions':[task],'readFirst':read_first,'writeRoots':[],'checks':[]} for role in ('induction','specification','design','construction','testing','uat')}
orders['construction']['outcome']='Repair the named owner-chain test and only a demonstrated mechanical defect within the original territory';orders['construction']['writeRoots']=paths
orders['testing']['outcome']='Run the selected nine commands and return complete authentic measurements';orders['uat']['outcome']=rubric['outcome']
commands=json.loads(json.dumps(old['testing']['commands']));predicates=json.loads(json.dumps(old['testing']['outcomePredicates']))
for c in commands:
 c['commandId']=c['commandId'].replace('/increment-b-06/','/increment-b-07/')
 if c['commandId'].endswith('/focused-owner-chain'):assert c['timeoutMs']==180000;c['timeoutMs']=600000
 if c['commandId'].endswith('/affected-owner-tests'):c['environment'].update(binding['stdo']['explicitAffectedTestEnvironment'])
for p in predicates:p['predicateId']=p['predicateId'].replace('/increment-b-06/','/increment-b-07/');p['declaration']['validationCommandId']=p['declaration']['validationCommandId'].replace('/increment-b-06/','/increment-b-07/')
assert len(commands)==9 and sum(c['commandId'].endswith('/focused-owner-chain') for c in commands)==1 and sum(c['commandId'].endswith('/affected-owner-tests') for c in commands)==1
sources=[r for r in old['sources'] if not superseded(r['path'])]+[{'path':p,'digest':'sha256:'+rows[p]['sha256']} for p in inputs]
w={'taskRef':'task://abiogenesis/rc3-dogfood/increment-b-07','task':task,'sources':sources,'requiredSupportRefs':old['requiredSupportRefs'],'authorityRefs':old['authorityRefs'],'readRoots':selected,'maxContextFiles':len(selected)+32,'maxContextBytes':sum(r['bytes'] for r in rows.values())+3000000,'maxPromptBytes':1048576,'workOrders':orders,'testing':{'selectedPaths':selected,'commands':commands,'outcomePredicates':predicates,'allowedWriteTerritories':old['testing']['allowedWriteTerritories']},'assessment':{**old['assessment'],'sources':list(dict.fromkeys([p for p in old['assessment']['sources'] if not superseded(p)]+[p for p in inputs if p!=inputs[2]])),'rubricPath':inputs[2]}}
census={'kind':'rc3_b07_snapshot_preimages','sourceCommit':custody['baseCommit'],'b06SourceCustodySha256':sha((base/'attempt-008/B06_PARTIAL_CUSTODY.json').read_bytes()),'selectedFiles':len(selected),'presentFiles':len(selected),'absentFiles':0,'presentBytes':sum(r['bytes'] for r in rows.values()),'rows':rows,'conditionalOriginalGrant':paths,'limits':['B06 partial source is not accepted whole GC03 outcome','Additional Product paths require actual mechanical counterexample; writeRoots alone cannot enforce that semantic condition','Post-Construction native C2 must authenticate exact sources and dynamic closure']}
for name,value in [('workload.json',w),('snapshot-census.json',census)]:
 with (folder/name).open('x') as f:json.dump(value,f,indent=2,sort_keys=True);f.write('\n')
print(json.dumps({'selected':len(selected),'bytes':census['presentBytes'],'commands':len(commands),'selectedUatCriteria':len(rubric['criteria'])}))
