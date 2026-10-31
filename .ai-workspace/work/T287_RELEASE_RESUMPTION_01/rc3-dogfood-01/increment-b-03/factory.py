#!/usr/bin/env python3
"""Build B03 workload after B02's final owner handoff. No dispatch."""
from pathlib import Path
import hashlib,json,subprocess
base=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01')
folder=base/'increment-b-03';work=Path('/Users/jim/src/apps/abiogenesis-rc3-dogfood')
prefix='rc3-operator-inputs/increment-b-03';sha=lambda b:hashlib.sha256(b).hexdigest();read=lambda p:(work/p).read_bytes()
assert (base/'attempt-004/after-run-resume.json').is_file() and (base/'attempt-004/execution.json').is_file(),'B02 native handoff required'
assert not (folder/'workload.json').exists() and not (folder/'snapshot-census.json').exists()
old=json.loads((base/'increment-b-02/workload.json').read_bytes());custody=json.loads((folder/'B02_SOURCE_CUSTODY.json').read_bytes())
grant=json.loads((base/'increment-b-01/grant.json').read_bytes());paths=grant['existingPaths']+grant['newPaths']
assert subprocess.check_output(['/usr/bin/git','rev-parse','HEAD'],cwd=work,text=True).strip()==custody['baseCommit']
for row in custody['rows']:
 p=work/row['path'];assert row['current']['state']=='file' and p.is_file() and not p.is_symlink()
 assert sha(p.read_bytes())==row['current']['sha256'],row['path']
names=['task.md','HOW.md','DECISION.md','B02_DISPOSITION.md','B02_STRUCTURED_RETURN.json'];inputs=[prefix+'/'+x for x in names]
assert all((work/p).is_file() for p in inputs)
for name,path in zip(names,inputs):assert read(path)==(folder/name).read_bytes(),path
selected=sorted(set(old['readRoots'])|set(inputs));assert all((work/p).is_file() and not (work/p).is_symlink() for p in selected)
rows={p:{'state':'file','sha256':sha(read(p)),'bytes':len(read(p))} for p in selected}
task=read(inputs[0]).decode();rubric=json.loads(read(old['assessment']['rubricPath']))
assert [r['id'] for r in rubric['criteria']]==['A1','A2','A3','A4','A5','B1','B2','B3','B4','B5']
read_first=list(dict.fromkeys(old['workOrders']['construction']['readFirst']+paths+inputs));assert set(read_first)<=set(selected)
orders={role:{'outcome':'Contribute to the original Increment A and selected Increment B outcomes, preserving historical standing',
 'instructions':[task],'readFirst':read_first,'writeRoots':[],'checks':[]} for role in ('induction','specification','design','construction','testing','uat')}
orders['construction']['outcome']='Complete real configured owner selection, execution gating, prompt binding and authenticated cold proof'
orders['construction']['writeRoots']=paths;orders['testing']['outcome']='Measure the complete selected A and B implementation checks'
orders['uat']['outcome']=rubric['outcome']
commands=json.loads(json.dumps(old['testing']['commands']));predicates=json.loads(json.dumps(old['testing']['outcomePredicates']))
for c in commands:c['commandId']=c['commandId'].replace('/increment-b-02/','/increment-b-03/')
for p in predicates:
 p['predicateId']=p['predicateId'].replace('/increment-b-02/','/increment-b-03/')
 p['declaration']['validationCommandId']=p['declaration']['validationCommandId'].replace('/increment-b-02/','/increment-b-03/')
assert next(i for i,c in enumerate(commands) if c['commandId'].endswith('/focused-owner-chain')) < next(i for i,c in enumerate(commands) if c['commandId'].endswith('/affected-owner-tests'))
sources=old['sources']+[{'path':p,'digest':'sha256:'+sha(read(p))} for p in inputs]
w={'taskRef':'task://abiogenesis/rc3-dogfood/increment-b-03','task':task,'sources':sources,
 'requiredSupportRefs':old['requiredSupportRefs'],'authorityRefs':old['authorityRefs'],'readRoots':selected,
 'maxContextFiles':len(selected)+32,'maxContextBytes':sum(r['bytes'] for r in rows.values())+3000000,'maxPromptBytes':1048576,
 'workOrders':orders,'testing':{'selectedPaths':selected,'commands':commands,'outcomePredicates':predicates,
 'allowedWriteTerritories':old['testing']['allowedWriteTerritories']},'assessment':{**old['assessment'],'sources':list(dict.fromkeys(old['assessment']['sources']+inputs[:-1]))}}
census={'kind':'rc3_b03_snapshot_preimages','sourceCommit':custody['baseCommit'],'b02SourceCustodySha256':sha((folder/'B02_SOURCE_CUSTODY.json').read_bytes()),
 'selectedFiles':len(selected),'presentFiles':len(selected),'absentFiles':0,'presentBytes':sum(r['bytes'] for r in rows.values()),'rows':rows,'grant':paths,
 'limits':['B02 Construction was admitted partial, not accepted B outcome','Final post-Construction C2 must authenticate exact sources and dynamic closure']}
for name,value in [('workload.json',w),('snapshot-census.json',census)]:
 with (folder/name).open('x') as f:json.dump(value,f,indent=2,sort_keys=True);f.write('\n')
print(json.dumps({'selected':len(selected),'bytes':census['presentBytes'],'commands':len(commands),'criteria':len(rubric['criteria'])}))
