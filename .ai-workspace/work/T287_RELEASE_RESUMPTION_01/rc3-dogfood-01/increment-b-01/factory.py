#!/usr/bin/env python3
"""Prepare B's bounded task and snapshot declaration; no lifecycle call."""
from pathlib import Path
import hashlib,json,subprocess

base=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01')
folder=base/'increment-b-01';work=Path('/Users/jim/src/apps/abiogenesis-rc3-dogfood')
tenant='build_tenants/abiogenesis/typescript';binput='rc3-operator-inputs/increment-b-01'
digest=lambda x:hashlib.sha256(x).hexdigest()
read=lambda p:(work/p).read_bytes()
assert not (folder/'workload.json').exists() and not (folder/'snapshot-census.json').exists()
grant=json.loads((folder/'grant.json').read_bytes()); old=json.loads((base/'attempt-002/workload.json').read_bytes())
rubric=json.loads((folder/'rubric.json').read_bytes()); first=json.loads((base/'increment-a-01/rubric.json').read_bytes())
assert rubric['originalIncrementACriteria']==first['criteria'] and rubric['criteria'][:5]==first['criteria']
assert [r['id'] for r in rubric['criteria']]==['A1','A2','A3','A4','A5','B1','B2','B3','B4','B5']
new=grant['newPaths'];existing=grant['existingPaths'];assert len(set(new+existing))==len(new+existing)
for path in new: assert not (work/path).exists() and not (work/path).is_symlink(),path
for path in existing: assert (work/path).is_file(),path
input_files=[str(p.relative_to(work)) for p in (work/binput).rglob('*') if p.is_file()]
assert len(input_files)==19
selected=set(old['readRoots'])|set(input_files)|set(new)|set(existing)
for p in selected:
 if p not in new: assert (work/p).is_file() and not (work/p).is_symlink(),p
rows={p:{'state':'file','sha256':digest(read(p)),'bytes':len(read(p))} for p in sorted(selected) if p not in new}
rows.update({p:{'state':'absent'} for p in new})
read_bytes=sum(r.get('bytes',0) for r in rows.values());selected=sorted(selected)
source_commit=subprocess.check_output(['/usr/bin/git','rev-parse','HEAD'],cwd=work,text=True).strip()
base_a=json.loads((folder/'A_C2_IDENTITY.json').read_bytes())
for row in base_a['rows']: assert rows[row['path']]['sha256']==row['sha256']
task=read(binput+'/task.md').decode();grant_paths=existing+new
inline=[binput+'/'+name for name in ('task.md','HOW.md','rubric.json','grant.json')]
sources=old['sources']+[{'path':p,'digest':'sha256:'+digest(read(p))} for p in inline]
read_first=[p for p in old['workOrders']['construction']['readFirst'] if p in selected and p not in new]
read_first += inline+[binput+'/provider-custody.json',tenant+'/design/T287_STDO_RUN_ENVIRONMENT_PILOT_DESIGN.md']
read_first += [p for p in input_files if '/gc03/' in p]
read_first=list(dict.fromkeys(read_first));assert set(read_first)<=set(selected)
env={'PATH':'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin','NODE_OPTIONS':'--max-old-space-size=8192'}
def command(name,exe,args,ms,cwd=tenant):return {'commandId':'command://abiogenesis/rc3-dogfood/increment-b-01/'+name,
 'executable':exe,'args':args,'relativeCwd':cwd,'environment':env,'timeoutMs':ms,'terminationGraceMs':5000,'expectedReports':[]}
tests=['t287-default-library.test.mjs','t287-default-library-fulfillment.test.mjs','t287-native-semantic-revision.test.mjs',
 't287-native-workspace-work.test.mjs','m5-worker-transport.test.mjs','t287-stdo3-run-environment.test.mjs','t287-governed-context.test.mjs']
measured_paths=sorted(set(grant_paths)|{row['path'] for row in base_a['rows']})
measure_js="const fs=require('node:fs'),crypto=require('node:crypto');for(const p of process.argv.slice(1).sort()){const b=fs.readFileSync(p);console.log(JSON.stringify({path:p,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex')}))}"
commands=[command('fixture-current-measurement','/bin/cat',['rc3-operator-inputs/increment-a-01/retained-stdout.txt'],30000,'.'),
 command('source-correspondence','/opt/homebrew/bin/node',['-e',measure_js,*measured_paths],30000,'.'),
 command('toolchain','/bin/cp',['-cR','/Users/jim/Library/Application Support/ABIogenesis/toolchains/rc2-dogfood-01/node_modules','node_modules'],60000),
 command('contract-seeds','/bin/cp',['-cR','rc3-operator-inputs/increment-a-01/contract-seeds',tenant+'/contracts'],30000,'.'),
 command('build','/opt/homebrew/bin/npm',['run','build'],480000),
 command('package','/opt/homebrew/bin/node',['scripts/refresh-candidate-basis.mjs'],60000),
 command('affected-owner-tests','/opt/homebrew/bin/node',['--experimental-vm-modules','--test','--test-concurrency=1']+['test_env/tests/'+t for t in tests],480000),
 command('artifact-tests','/opt/homebrew/bin/node',['--experimental-vm-modules','--test','--test-concurrency=1',
 'test_env/tests/r1-packed-artifact.test.mjs','test_env/tests/installed-language-smoke.test.mjs'],480000)]
preds=[{'predicateId':c['commandId'].replace('command://','predicate://')+'-exit','predicateKind':'process_exit',
 'declaration':{'validationCommandId':c['commandId'],'equals':0}} for c in commands]
for c in commands[-2:]:preds.append({'predicateId':c['commandId'].replace('command://','predicate://')+'-pass',
 'predicateKind':'test_pass_count','declaration':{'validationCommandId':c['commandId'],'greaterThanOrEqual':1}})
orders={role:{'outcome':'Contribute only to the complete original Increment A and selected Increment B outcomes',
 'instructions':[task],'readFirst':read_first,'writeRoots':[],'checks':[]} for role in ('induction','specification','design','construction','testing','uat')}
orders['construction']['outcome']='Implement selected Increment B and the two bounded A repairs, preserving the full original criteria'
orders['construction']['writeRoots']=grant_paths
orders['testing']['outcome']='Measure selected complete Increment A and B implementation checks'
orders['uat']['outcome']=rubric['outcome']
outputs=old['testing']['allowedWriteTerritories']
for p in selected:
 for area in outputs:
  assert p!=area['relativePath'] and not(area['pathKind']=='subtree' and p.startswith(area['relativePath']+'/')),(p,area)
workload={'taskRef':'task://abiogenesis/rc3-dogfood/increment-b-01','task':task,'sources':sources,
 'requiredSupportRefs':['support://abiogenesis/rc3-dogfood/increment-b-01/tested-candidate'],
 'authorityRefs':old['authorityRefs'],'readRoots':selected,'maxContextFiles':len(selected)+32,'maxContextBytes':read_bytes+3000000,
 'maxPromptBytes':1048576,'workOrders':orders,'testing':{'selectedPaths':selected,'commands':commands,
 'outcomePredicates':preds,'allowedWriteTerritories':outputs},'assessment':{'sources':[binput+'/task.md',binput+'/HOW.md',
 'rc3-operator-inputs/increment-a-01/task.md','rc3-operator-inputs/increment-a-01/HOW.md'],
 'candidatePath':tenant+'/release-claim.md','rubricPath':binput+'/rubric.json'}}
census={'kind':'rc3_increment_b_snapshot_preimages','sourceCommit':source_commit,'priorC2ReceiptSha256':digest((folder/'A_C2_IDENTITY.json').read_bytes()),
 'selectedFiles':len(selected),'presentFiles':len(selected)-len(new),'absentFiles':len(new),'presentBytes':read_bytes,
 'rows':rows,'commandCount':len(commands),'grant':grant_paths,'closure':'Retains the entire A 904-file baseline, B inputs and new-path absent preimages. Post-Construction must recheck every selected source and dynamic closure after the new files exist.'}
for name,value in [('workload.json',workload),('snapshot-census.json',census)]:
 with (folder/name).open('x') as f:json.dump(value,f,indent=2,sort_keys=True);f.write('\n')
print(json.dumps({'sourceCommit':source_commit,'selectedFiles':len(selected),'absentFiles':len(new),'bytes':read_bytes,'commands':len(commands),'criteria':len(rubric['criteria'])}))
