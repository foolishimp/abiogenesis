#!/usr/bin/env python3
"""Draft only. Build the successor workload after task selection; no dispatch."""
from pathlib import Path
import hashlib,json,subprocess
base=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01')
folder=base/'increment-b-02';work=Path('/Users/jim/src/apps/abiogenesis-rc3-dogfood')
tenant='build_tenants/abiogenesis/typescript';prefix='rc3-operator-inputs/increment-b-02'
sha=lambda b:hashlib.sha256(b).hexdigest();read=lambda p:(work/p).read_bytes()
assert not (folder/'workload.json').exists() and not (folder/'snapshot-census.json').exists()
old=json.loads((base/'increment-b-01/workload.json').read_bytes());custody=json.loads((folder/'PARTIAL_CUSTODY.json').read_bytes())
grant=json.loads((base/'increment-b-01/grant.json').read_bytes());paths=grant['existingPaths']+grant['newPaths']
assert subprocess.check_output(['/usr/bin/git','rev-parse','HEAD'],cwd=work,text=True).strip()==custody['baseCommit']
for row in custody['rows']:
 p=work/row['path'];assert row['current']['state']=='file' and p.is_file() and not p.is_symlink()
 assert sha(p.read_bytes())==row['current']['sha256']
inputs=[prefix+'/task.md',prefix+'/HOW.md'];assert all((work/p).is_file() for p in inputs)
selected=sorted(set(old['readRoots'])|set(inputs));assert all((work/p).is_file() and not (work/p).is_symlink() for p in selected)
rows={p:{'state':'file','sha256':sha(read(p)),'bytes':len(read(p))} for p in selected}
task=read(inputs[0]).decode(); rubric=json.loads(read(old['assessment']['rubricPath']))
assert [r['id'] for r in rubric['criteria']]==['A1','A2','A3','A4','A5','B1','B2','B3','B4','B5']
read_first=list(dict.fromkeys(old['workOrders']['construction']['readFirst']+paths+inputs));assert set(read_first)<=set(selected)
orders={role:{'outcome':'Contribute to the original Increment A and selected Increment B outcomes, preserving historical standing',
 'instructions':[task],'readFirst':read_first,'writeRoots':[],'checks':[]} for role in ('induction','specification','design','construction','testing','uat')}
orders['construction']['outcome']='Finish the admitted B design and the two selected A repairs from the retained unaccepted B01 partial state'
orders['construction']['writeRoots']=paths;orders['testing']['outcome']='Measure the complete selected A and B implementation checks'
orders['uat']['outcome']=rubric['outcome']
commands=json.loads(json.dumps(old['testing']['commands']));predicates=json.loads(json.dumps(old['testing']['outcomePredicates']))
for c in commands:c['commandId']=c['commandId'].replace('/increment-b-01/','/increment-b-02/')
for p in predicates:
 p['predicateId']=p['predicateId'].replace('/increment-b-01/','/increment-b-02/')
 p['declaration']['validationCommandId']=p['declaration']['validationCommandId'].replace('/increment-b-01/','/increment-b-02/')
affected=next(c for c in commands if c['commandId'].endswith('/affected-owner-tests'))
test='test_env/tests/t287-governed-context.test.mjs';assert test in affected['args'];affected['args'].remove(test);affected['timeoutMs']=300000
focused={**affected,'commandId':'command://abiogenesis/rc3-dogfood/increment-b-02/focused-owner-chain',
 'args':['--experimental-vm-modules','--test','--test-concurrency=1',test],'timeoutMs':180000}
commands.insert(commands.index(affected),focused)
for suffix,kind,decl in [('exit','process_exit',{'validationCommandId':focused['commandId'],'equals':0}),
 ('pass','test_pass_count',{'validationCommandId':focused['commandId'],'greaterThanOrEqual':1})]:
 predicates.append({'predicateId':focused['commandId'].replace('command://','predicate://')+'-'+suffix,'predicateKind':kind,'declaration':decl})
sources=old['sources']+[{'path':p,'digest':'sha256:'+sha(read(p))} for p in inputs]
w={'taskRef':'task://abiogenesis/rc3-dogfood/increment-b-02','task':task,'sources':sources,
 'requiredSupportRefs':old['requiredSupportRefs'],'authorityRefs':old['authorityRefs'],'readRoots':selected,
 'maxContextFiles':len(selected)+32,'maxContextBytes':sum(r['bytes'] for r in rows.values())+3000000,'maxPromptBytes':1048576,
 'workOrders':orders,'testing':{'selectedPaths':selected,'commands':commands,'outcomePredicates':predicates,
 'allowedWriteTerritories':old['testing']['allowedWriteTerritories']},'assessment':{**old['assessment'],'sources':old['assessment']['sources']+inputs}}
census={'kind':'rc3_b02_snapshot_preimages','sourceCommit':custody['baseCommit'],'partialCustodySha256':sha((folder/'PARTIAL_CUSTODY.json').read_bytes()),
 'selectedFiles':len(selected),'presentFiles':len(selected),'absentFiles':0,'presentBytes':sum(r['bytes'] for r in rows.values()),'rows':rows,'grant':paths,
 'limits':['All B01 partial source is unaccepted; native outcome remains failed','Post-Construction snapshot and dynamic source closure require actual C2 owner verification']}
for name,value in [('workload.json',w),('snapshot-census.json',census)]:
 with (folder/name).open('x') as f:json.dump(value,f,indent=2,sort_keys=True);f.write('\n')
print(json.dumps({'selected':len(selected),'bytes':census['presentBytes'],'commands':len(commands),'focusedBeforeAffected':commands.index(focused)<commands.index(affected)}))
