#!/usr/bin/env python3
"""Prepare bounded operator inputs and task projection; never dispatch a Run."""
from pathlib import Path
import hashlib,json,os,shutil,subprocess

work=Path('/Users/jim/src/apps/abiogenesis-rc3-dogfood')
base=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01')
carrier=base/'increment-a-01';tenant='build_tenants/abiogenesis/typescript';prefix='rc3-operator-inputs/increment-a-01'
source_commit='d1e4527dbbc0b9ca1a929122c62ca225184f3341'
subject='t287-native-semantic-revision.test.mjs'
witness='.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE'

def git(*args):return subprocess.check_output(['/usr/bin/git','-C',str(work),*args])
def sha(b):return hashlib.sha256(b).hexdigest()
def source(rel):
 p=work/rel
 if p.is_symlink() or not p.is_file():raise ValueError('missing or redirected selected file: '+rel)
 return p.read_bytes()
def files(*paths):return git('ls-files','-z','--',*paths).decode().strip('\0').split('\0')
assert git('rev-parse','HEAD').decode().strip()==source_commit
assert not git('status','--porcelain=v1','-uno')
assert not (work/prefix).exists() and not (carrier/'workload.json').exists()
roots=[tenant+'/code',tenant+'/scripts',tenant+'/test_env/tests',tenant+'/test_env/support',
 tenant+'/test_env/fixtures',tenant+'/test_env/uat',tenant+'/test_env/falsifiers',tenant+'/test_env/proof',tenant+'/test_env/qualification',
 witness+'/default-library-witness',witness+'/s6-witness-contract.md']
selected=set(files(*roots))
selected.discard(tenant+'/test_env/fixtures/abi5-root-candidate-basis.json')
selected.update(['AGENTS.md','specification/PRODUCT.md','specification/GOALS.md',tenant+'/package.json',tenant+'/package-lock.json',
 tenant+'/tsconfig.json',tenant+'/release-claim.md',tenant+'/design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md',
 tenant+'/design/T287_NATIVE_WORKSPACE_WORK_DESIGN.md'])
required=[tenant+'/test_env/tests/'+subject,witness+'/default-library-witness/selection.json',witness+'/s6-witness-contract.md']
assert all(p in selected for p in required)
source_bytes={p:source(p) for p in sorted(selected)}
source_rows={p:{'sha256':sha(b),'bytes':len(b)} for p,b in source_bytes.items()}
contracts=files(tenant+'/contracts')
assert contracts and all(x.startswith(tenant+'/contracts/') for x in contracts)
contract_bytes={p:source(p) for p in contracts}
# These exact pre-existing RC2 source bytes become protected test seeds. Testing
# copies them inside its disposable snapshot to the writable generated tree.
seeds={prefix+'/contract-seeds/'+p[len(tenant+'/contracts/'):]:b for p,b in contract_bytes.items()}
input_names=('task.md','rubric.json','HOW.md','retained-stdout.txt','retained-stdout-custody.json')
inputs={prefix+'/'+name:(carrier/name).read_bytes() for name in input_names}
method=carrier/'method-3.0.2'
inputs.update({str(p.relative_to(method)):p.read_bytes() for p in method.rglob('*') if p.is_file() and p.name!='CUSTODY.json'})
inputs[prefix+'/method-custody.json']=(method/'CUSTODY.json').read_bytes()
for path in inputs:
 if (work/path).exists() or (work/path).is_symlink():raise ValueError('operator input path already exists: '+path)
assert len(inputs[prefix+'/retained-stdout.txt'])==4616
assert sha(inputs[prefix+'/retained-stdout.txt'])=='bee000fc220e14f318f5b37558dc96d113ef3428ad7d9d0a0043b7aa4a9787b6'
text=inputs[prefix+'/task.md'].decode();rubric=json.loads(inputs[prefix+'/rubric.json'])
assert [r['id'] for r in rubric['criteria']]==['A1','A2','A3','A4','A5']
grant=[tenant+'/code/src/product/default_library.ts',tenant+'/code/src/abg/default_library.ts',
 tenant+'/design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md',tenant+'/test_env/tests/t287-default-library.test.mjs',
 tenant+'/test_env/tests/t287-default-library-fulfillment.test.mjs',tenant+'/package.json',tenant+'/package-lock.json',
 tenant+'/code/src/product/contracts.ts',tenant+'/release-claim.md']
assert all(x in selected for x in grant)
read_first=['AGENTS.md','specification/PRODUCT.md',tenant+'/design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md',
 tenant+'/design/T287_NATIVE_WORKSPACE_WORK_DESIGN.md']+list(inputs)+grant
read_first=list(dict.fromkeys(read_first))
all_paths=sorted(selected|set(seeds)|set(inputs)); data={**source_bytes,**seeds,**inputs}
read_bytes=sum(len(b) for b in data.values());assert len(data)==len(all_paths)
env={'PATH':'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin','NODE_OPTIONS':'--max-old-space-size=8192'}
def command(name,executable,args,ms):return {'commandId':'command://abiogenesis/rc3-dogfood/increment-a-01/'+name,
 'executable':executable,'args':args,'relativeCwd':tenant,'environment':env,'timeoutMs':ms,'terminationGraceMs':5000,'expectedReports':[]}
commands=[command('toolchain','/bin/cp',['-cR','/Users/jim/Library/Application Support/ABIogenesis/toolchains/rc2-dogfood-01/node_modules','node_modules'],60000),
 command('contract-seeds','/bin/cp',['-cR',prefix+'/contract-seeds','contracts'],30000),
 command('build','/opt/homebrew/bin/npm',['run','build'],480000),
 command('package','/opt/homebrew/bin/node',['scripts/refresh-candidate-basis.mjs'],60000),
 command('affected-owner-tests','/opt/homebrew/bin/node',['--experimental-vm-modules','--test','--test-concurrency=1',
  'test_env/tests/t287-default-library.test.mjs','test_env/tests/t287-default-library-fulfillment.test.mjs','test_env/tests/'+subject],480000),
 command('artifact-tests','/opt/homebrew/bin/node',['--experimental-vm-modules','--test','--test-concurrency=1',
  'test_env/tests/r1-packed-artifact.test.mjs','test_env/tests/installed-language-smoke.test.mjs'],480000)]
# The seed copy runs from the snapshot root. Parent-path segments are forbidden
# by the actual C2 owner, even when they would resolve within the snapshot.
commands[1]['relativeCwd']='.'
commands[1]['args']=['-cR',prefix+'/contract-seeds',tenant+'/contracts']
preds=[{'predicateId':'predicate://abiogenesis/rc3-dogfood/increment-a-01/'+c['commandId'].rsplit('/',1)[-1]+'-exit',
 'predicateKind':'process_exit','declaration':{'validationCommandId':c['commandId'],'equals':0}} for c in commands]
for c in commands[-2:]:preds.append({'predicateId':c['commandId'].replace('command://','predicate://')+'-pass',
 'predicateKind':'test_pass_count','declaration':{'validationCommandId':c['commandId'],'greaterThanOrEqual':1}})
outputs=[{'pathKind':'subtree','relativePath':tenant+'/'+p} for p in ['build','contracts','test_env/test_runs','node_modules','artifacts','test_env/evidence']]
outputs += [{'pathKind':'file','relativePath':tenant+'/'+p} for p in ['product-toolchain-manifest.json','test_env/fixtures/abi5-root-candidate-basis.json']]
for p in all_paths:
 for area in outputs:
  if p==area['relativePath'] or area['pathKind']=='subtree' and p.startswith(area['relativePath']+'/'):
   raise ValueError('protected input overlaps testing output '+p)
work_orders={role:{'outcome':'Contribute only as necessary to the complete original RC3 Increment A outcome',
 'instructions':[text],'readFirst':read_first,'writeRoots':[],'checks':[]} for role in ('induction','specification','design','construction','testing','uat')}
work_orders['construction']['outcome']='Implement the selected HOW and bounded RC3 Increment A repair'
work_orders['construction']['writeRoots']=grant
work_orders['testing']['outcome']='Measure the declared complete Increment A build and affected checks'
work_orders['uat']['outcome']=rubric['outcome']
workload={'taskRef':'task://abiogenesis/rc3-dogfood/increment-a-01','task':text,
 'sources':[{'path':p,'digest':'sha256:'+sha(b)} for p,b in inputs.items()],
 'requiredSupportRefs':['support://abiogenesis/rc3-dogfood/increment-a-01/tested-candidate'],
 'authorityRefs':['file:///Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/OPERATOR.md'],
 'readRoots':all_paths,'maxContextFiles':len(all_paths)+32,'maxContextBytes':read_bytes+3000000,'maxPromptBytes':1048576,
 'workOrders':work_orders,'testing':{'selectedPaths':all_paths,'commands':commands,'outcomePredicates':preds,'allowedWriteTerritories':outputs},
 'assessment':{'sources':[prefix+'/task.md',prefix+'/HOW.md'],'candidatePath':tenant+'/release-claim.md','rubricPath':prefix+'/rubric.json'}}
# Commit operator inputs only after all selected source preimages validate.
(work/prefix).mkdir(parents=True,exist_ok=False)
for path,b in {**inputs,**seeds}.items():
 dest=work/path;dest.parent.mkdir(parents=True,exist_ok=True)
 with dest.open('xb') as f:f.write(b)
with (carrier/'workload.json').open('x') as f:json.dump(workload,f,indent=2);f.write('\n')
manifest={'kind':'rc3_increment_a_snapshot_census','sourceCommit':source_commit,'testingFiles':len(all_paths),
 'testingBytes':read_bytes,'sourceRows':source_rows,'contractSeedCount':len(seeds),
 'contractSeedRows':{p:{'source':tenant+'/contracts/'+p.split('/contract-seeds/',1)[1],'sha256':sha(b),'bytes':len(b)} for p,b in seeds.items()},
 'contractSeedBytes':sum(map(len,seeds.values())),'operatorInputs':{p:{'sha256':sha(b),'bytes':len(b)} for p,b in inputs.items()},
 'requiredWitnessFiles':required,'constructionWriteRoots':grant,'testingCommands':len(commands),
 'closureLimit':'Comprehensive selected tracked test/source/fixture closure and 14 exact historical witness files; runtime-created dependencies or a changed task must be reacquired and independently checked.',
 'status':'prepared_model_free_no_dispatch'}
with (carrier/'snapshot-census.json').open('x') as f:json.dump(manifest,f,indent=2);f.write('\n')
print(json.dumps({'files':len(all_paths),'bytes':read_bytes,'contractSeeds':len(seeds),'commands':len(commands),'witness':subject,'status':manifest['status']}))
