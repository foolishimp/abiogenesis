#!/usr/bin/env python3
"""Retarget the existing nine-command workload under exact admitted RC4 inputs."""
import hashlib,json,subprocess
from pathlib import Path
P=Path(__file__).resolve().parent;W=Path('/Users/jim/src/apps/abiogenesis-rc4-native-recovery');B=P.parent/'rc3-dogfood-01';stem='build_tenants/abiogenesis/typescript/'
def sha(b):return hashlib.sha256(b).hexdigest()
def pin(q):
 b=q.read_bytes();return {'path':str(q),'bytes':len(b),'sha256':sha(b)}
def create(name,value):
 with (P/name).open('x') as f:json.dump(value,f,indent=2);f.write('\n')
assert sha((P/'ROOT_NATIVE_ADMISSION.json').read_bytes())=='d0d6aa77bcbe33deee08dcff41c2c40730c7a363d8a2f0c11ecab794e1926f69'
assert sha((P/'runtime-001/summary.json').read_bytes())=='03f89e01445e223259c9b4cd190bbe9b9e785d7acbf284007a277ee68c1e23ff'
assert sha((P/'runtime-001/operator-resume-material.json').read_bytes())=='be4907b15be34c60e9821bf7105396e6b45a31d018959534a5aec86282819d21'
g=json.loads((P/'NATIVE_GRANT.json').read_text());a=json.loads((P/'RESOURCE_AMENDMENT_01.json').read_text());assert g['RootAdmission']['sha256']=='d0d6aa77bcbe33deee08dcff41c2c40730c7a363d8a2f0c11ecab794e1926f69'
assert subprocess.check_output(['/usr/bin/git','-C',str(W),'rev-parse','HEAD'],text=True).strip()==g['sourceCommit'];subprocess.run(['/usr/bin/git','-C',str(W),'diff','--quiet'],check=True)
for r in g['Construction']['preimages']:assert pin(W/r['path'])['sha256']==r['sha256'],r['path']
prior=B/'single-machine-p1-03/workload-v2.json';w=json.loads(prior.read_text());write=g['Construction']['writePaths'];assert len(write)==51
selected=sorted(set(w['testing']['selectedPaths'])|set(write));assert len(selected)==966
material=json.loads((P/'INPUT_MATERIALIZATION.json').read_text());inputs=[r for r in material['rows'] if r['role'].startswith('current admitted')]
resource={'source':str(P/'RESOURCE_AMENDMENT_01.json'),'target':'rc4-operator-inputs/native-recovery-01/RESOURCE_AMENDMENT_01.json',**{k:v for k,v in pin(P/'RESOURCE_AMENDMENT_01.json').items() if k!='path'}};inputs.append(resource)
for r in inputs:assert pin(W/r['target'])['sha256']==r['sha256']
required=json.loads((P/'REQUIRED_INPUTS.v2.json').read_text());sourceReads=[str(Path(r['path']).relative_to(W)) for r in required['sources'] if r['path'].startswith(str(W)+'/')]
byname={Path(r['target']).name:r for r in inputs};task=(P/'task.v2.DRAFT.md').read_text();taskTarget=byname['task.v2.DRAFT.md']['target'];rubricTarget=byname['rubric.v2.DRAFT.json']['target'];readFirst=[byname[n]['target'] for n in ['ROOT_NATIVE_ADMISSION.json','ROOT_SELECTION.md','CURRENT_T287_SELECTION.v2.md','task.v2.DRAFT.md','NATIVE_GRANT.json','DESIGN_AND_ACTIVATION.v2.md','rubric.v2.DRAFT.json','RESOURCE_AMENDMENT_01.json']]
w['taskRef']='task://abiogenesis/rc4-native-recovery-01/registered-selection-pending-testing';w['task']=task
w['sources']=w['sources'][:3]+[{'path':r['target'],'digest':'sha256:'+r['sha256']} for r in inputs]+[{'path':x,'digest':'sha256:'+pin(W/x)['sha256']} for x in sourceReads if x not in {r['path'] for r in w['sources'][:3]}]
w['readRoots']=sorted(set(selected+[r['target'] for r in inputs]+sourceReads));w['authorityRefs']=[(P/'ROOT_NATIVE_ADMISSION.json').as_uri(),(P/'ROOT_SELECTION.md').as_uri()];w['requiredSupportRefs']=['support://abiogenesis/rc4-native-recovery-01/registered-selection-pending-testing']
w['assessment']['rubricPath']=rubricTarget;w['assessment']['sources']=[r['target'] for r in inputs if r['target']!=rubricTarget]+sourceReads
outcome='Actual registered-selection/recursive pending native Testing recovery through the admitted existing run.continue contract-domain/HOW correction; bounded native source/model-free proof only.'
resourceText='Current Root resource amendment supersedes draft timing only: focused45min; global actor idle75min/absolute90min, outer3h, xhigh240turns/no dollar cap. Ceilings are not duration targets. Root later installed interruption proof remains required.'
for role,order in w['workOrders'].items():order.update({'instructions':[task,resourceText],'outcome':outcome,'checks':[],'readFirst':readFirst+sourceReads,'writeRoots':write if role=='construction' else []})
t=w['testing'];t['selectedPaths']=selected;t['commands'][1]['args']=t['commands'][1]['args'][:2]+sorted(write)
originalFocused=list(t['commands'][6]['args'][3:]);add=['t287-exact-construction-intent.test.mjs','t287-recursive-registered-selection.test.mjs','t287-public-groups.test.mjs','m5-fresh-process-reconstruction.test.mjs','t287-native-work-currentness-consumers.test.mjs','t287-native-work-unknown-effect.test.mjs','t287-continuation-causation.test.mjs'];focused=originalFocused+['test_env/tests/'+x for x in add if 'test_env/tests/'+x not in originalFocused]
assert len(focused)==18;t['commands'][6]['args']=t['commands'][6]['args'][:3]+focused;t['commands'][6]['timeoutMs']=a['focusedTimeoutMs']
assert len(t['commands'])==9 and len(w['readRoots'])<=w['maxContextFiles'];assert set(stem+x for x in focused)<=set(selected)
budget=sum(c['timeoutMs']+2*c['terminationGraceMs']+min(c['terminationGraceMs'],250) for c in t['commands'])+5000;assert budget==a['requiredExecutionBudgetMs']==4267250
size=sum((W/x).stat().st_size for x in w['readRoots']);assert size<=w['maxContextBytes'],(size,w['maxContextBytes'])
create('workload.json',w)
create('FOCUSED_TEST_SELECTION.json',{'originalFocused':originalFocused,'addedSelfContained':add,'actualFocused':focused,'excludedWithoutPassCredit':a['testExclusions']+[{'path':x,'reason':'Historical/phase-bound fixture required; not part of automatic selection. Existing source preserved and no pass credit; affected semantic obligations still require self-contained current-owner proof.'} for x in ['test_env/tests/t287-native-work-reacquisition-normalization.test.mjs','test_env/tests/t287-governance-covered-source-use.test.mjs','test_env/tests/t287-retained-installed-consumer.test.mjs']],'allNineCommandPurposesAndPredicatesRetained':True,'focusedTimeoutMs':a['focusedTimeoutMs']})
create('WORKLOAD_BINDING.json',{'status':'PREPARED_NOT_ADMITTED_AS_NATIVE_RUN','sourceCommit':g['sourceCommit'],'priorWorkload':pin(prior),'admittedGrant':pin(P/'NATIVE_GRANT.json'),'resourceAmendment':pin(P/'RESOURCE_AMENDMENT_01.json'),'workload':pin(P/'workload.json'),'readRoots':len(w['readRoots']),'selectedPaths':len(selected),'writePaths':len(write),'focusedFiles':len(focused),'commands':9,'requiredExecutionBudgetMs':budget,'currentInputBytes':size,'maxContextBytes':w['maxContextBytes'],'sourceBinding':'Exact Git HEAD + tracked-clean guard, explicit51 preimages and authenticated no-clobber input receipts; no fresh961 census','setupSummary':pin(P/'runtime-001/summary.json'),'setupResume':pin(P/'runtime-001/operator-resume-material.json')})
print(json.dumps({'workload':pin(P/'workload.json'),'readRoots':len(w['readRoots']),'selected':len(selected),'focused':len(focused),'inputBytes':size,'budget':budget}))
