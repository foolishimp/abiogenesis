#!/usr/bin/env python3
import pathlib,json,hashlib,signal,time,subprocess,datetime
signal.alarm(120);began=time.monotonic()
O=pathlib.Path(__file__).resolve().parent;G=O.parent;R=G.parents[3];Q=G/'final-qualification-inputs-02';Q1=G/'final-qualification-inputs-01';C=G/'final-candidate-construction-02'
sha=lambda b:hashlib.sha256(b).hexdigest()
def read(p):return json.loads(p.read_text())
def save(name,v):
 with (O/name).open('x') as f:json.dump(v,f,indent=2);f.write('\n')
def rec(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':sha(b)}
def short(v,depth=0):
 if isinstance(v,list):return {'count':len(v),'sample':short(v[0],depth+1) if v else None}
 if isinstance(v,dict):return {k:short(x,depth+1) for k,x in v.items()} if depth<2 else {'keys':list(v)}
 return v
results=[]
def check(name,fn):
 try:detail=fn();results.append({'name':name,'status':'pass','detail':detail})
 except Exception as e:results.append({'name':name,'status':'not_established','error':repr(e)})

save('review-harness-error.json',{'group':2,'status':'Reviewer_inspection_formatting_failure_not_candidate_counterexample','error':'TypeError: list indices must be integers or slices, not dict','cause':'Formatting helper assumed source-inventory.json was an object and iterated actual list records as keys. The resulting diagnostic was excessive. The process stopped before later planned owner reads or checks.','originalOutputLocation':'Original exec_command tool result in this review conversation, chunk_id 80b4b9; original_token_count 233564; exit_code 1. It is retained there; no later pass replaces that output.','projectCopy':'This bounded error record is an excerpt/description, not a complete copy of the original tool output.','candidateEffects':0,'sourceFinding':False})

def donor():
 rows=[]
 for n in ['recipe.mjs','recipe-stage.mjs','compare-generated.mjs','test-environment.mjs','test-selection.json','config.json','release-claims.json','budgets.json']:
  a=(Q1/n).read_bytes();b=(Q/n).read_bytes();assert a==b;rows.append({'path':n,'sha256':sha(b),'bytes':len(b)})
 return rows
check('independent_conserved_command_selection_controls',donor)

def inventories():
 a=read(Q1/'source-inventory.json');b=read(Q/'source-inventory.json');assert isinstance(a,list) and isinstance(b,list)
 am={x['path']:x for x in a};bm={x['path']:x for x in b};assert len(am)==len(bm)==1931 and am.keys()==bm.keys()
 frozen=read(C/'freeze.json');fm={r['path']:r for r in frozen['records']};changed=[];roles={}
 for p,x in bm.items():
  y=am[p];assert x['role']==y['role'];roles[x['role']]=roles.get(x['role'],0)+1
  origin=pathlib.Path(x['origin']);relative=str(origin.relative_to(C));r=fm[relative];assert r['bytes']==x['bytes'] and r['sha256']==x['sha256']
  if x['sha256']!=y['sha256']:
   body=origin.read_bytes();assert len(body)==x['bytes'] and sha(body)==x['sha256'];before=pathlib.Path(y['origin']).read_bytes();assert len(before)==y['bytes'] and sha(before)==y['sha256'];changed.append({'path':p,'before':y,'after':x})
 assert len(changed)==6 and roles=={'selected_source':1103,'generated_output':828}
 old=read(Q1/'qualification-inventory.json')['members'];new=read(Q/'qualification-inventory.json')['members'];assert len(old)==len(new)==1950
 def norm(s):return s.replace('final-qualification-inputs-01/','final-qualification-inputs-02/').replace('final-candidate-construction-01/','final-candidate-construction-02/')
 om={norm(x['path']):x for x in old};nm={x['path']:x for x in new};assert om.keys()==nm.keys()
 external=[]
 for p,x in nm.items():
  y=om[p]
  for k in set(x)|set(y):
   if k in ['ref','path','digest','byteCount']:continue
   assert x[k]==y[k],(p,k)
  assert norm(y['ref'])==x['ref']
  if p in bm:
   assert x['digest']=='sha256:'+bm[p]['sha256'] and x['byteCount']==bm[p]['bytes']
  else:external.append({'original':y,'successor':x,'bodyChanged':x['digest']!=y['digest'],'pathRebound':x['path']!=y['path']})
 assert len(external)==19 and sum(x['bodyChanged'] for x in external)==10 and all(x['pathRebound'] for x in external)
 return {'sourceGeneratedMembers':1931,'roles':roles,'qualificationMembers':1950,'sourceGeneratedChanged':changed,'externalMembers':external,'externalChangedBodies':10,'externalUnchangedBodies':9,'rolesAndMemberAuthorityFieldsConserved':True,'allSourceOriginsBoundToExactC02Freeze':True}
check('independent_complete_inventory_delta',inventories)

def expected_outputs():
 src=read(Q/'source-inventory.json');v=read(Q/'expected-output-inventory.json')
 if isinstance(v,list):rows=v
 else:
  choices=[x for x in v.values() if isinstance(x,list) and len(x)==925];assert len(choices)==1,(list(v),[(k,len(x)) for k,x in v.items() if isinstance(x,list)]);rows=choices[0]
 assert len(rows)==925
 t='build_tenants/abiogenesis/typescript/'
 selected=[x for x in src if x['role']=='generated_output' or (x['role']=='selected_source' and x['path'].startswith(t+'contracts/'))]
 assert len(selected)==925
 exp={x['path'].removeprefix(t):x for x in rows};actual={x['path'].removeprefix(t):x for x in selected};assert exp.keys()==actual.keys()
 for p,r in exp.items():
  x=actual[p];dg=r.get('sha256',r.get('digest','').removeprefix('sha256:'));assert dg==x['sha256'];size=r.get('bytes',r.get('byteCount'));assert size==x['bytes']
 return {'expected':925,'generated':828,'preservedContractInputs':97,'completeExactPathSizeDigestEquality':True}
check('independent_complete_expected_output_inventory',expected_outputs)

def guards():
 p=C/'source-freeze/repo/build_tenants/abiogenesis/typescript/code/src/validator/self_conformance.ts';s=p.read_text();lines=s.splitlines();selected=lines[122:134]
 assert 'basis.productContentDigest !== owner.productContentDigest' in s and 'basis.productManifest.digest !== owner.manifestDigest' in s and 'basis.toolchain.digest !== owner.manifestDigest' in s
 template=read(Q/'basis-template.json');body=template['body'];assert body['toolchain']==body['productManifest'];assert body['toolchain']['digest']=='sha256:d93ec21cf34a043822a211ba8bea46fdc1050311925d38030b430172f5464ee4'
 assert body['installedProduct'] is None and body['workspaceBinding'] is None and body['tenantManifest'] is None
 return {'source':rec(p),'lines123to134':selected,'previewEquality':True,'genuineNativeSlotsNull':True}
check('independent_native_owner_toolchain_guard',guards)

def staging():
 contract=read(Q/'staging-contract.json');recipe=(Q/'recipe.mjs').read_text();assert contract['runtimeRoot'] is None and contract['performed'] is False and contract['ownerMetadataWrites']==[]
 assert 'fs.mkdir(root)' in recipe and 'selectedFiles' in recipe
 targets=[x if isinstance(x,str) else x['target'] for x in contract['targets']];assert len(targets)==716 and len(set(targets))==716
 assert all(not pathlib.PurePosixPath(x).is_absolute() and '..' not in pathlib.PurePosixPath(x).parts and not x.startswith('.abiogenesis') and not x.startswith('verification/') for x in targets)
 return {'rootSource':contract['rootSource'],'requiredOrder':contract['requiredOrder'],'retainedHelper':contract['retainedHelper'],'counterexample':contract['counterexample'],'targetCount':716,'ownerMetadataTargets':0,'performed':False}
check('existing_root_staging_contract',staging)

# Read the actual unchanged controls and changed binding producer. Never execute
# these scripts, staging helpers, verification recipes or future task builders.
texts={}
for n in ['recipe.mjs','recipe-stage.mjs','compare-generated.mjs','test-environment.mjs','prepare-subject-binding.mjs','validate-inputs.mjs']:
 s=(Q/n).read_text();texts[n]=s
save('inspected-source-controls.json',{'files':[{'source':rec(Q/n),'text':s} for n,s in texts.items()]})
for n in ['recipe.mjs','recipe-stage.mjs','compare-generated.mjs','test-environment.mjs']:
 print('\nSOURCE',n);print(texts[n])
print('\nBINDING PRODUCER SELECTED LINES');print('\n'.join(f'{i+1}:{s}' for i,s in enumerate(texts['prepare-subject-binding.mjs'].splitlines()) if any(t in s for t in ['import ','construct','publication','canonical','manifest','selectedFiles','stageSelectedInputs','staging','toolchain','basis','authority','process.env'])))
print('\nVALIDATOR SELECTED LINES');print('\n'.join(f'{i+1}:{s}' for i,s in enumerate(texts['validate-inputs.mjs'].splitlines()) if any(t in s for t in ['import ','assert','recipe','inventory','configuration','selectedFiles','ready'])))
for n in ['verification-recipe.json','configuration-binding.json','input-manifest.json','input-joins.json','staging-contract.json','expected-output-inventory.json']:
 v=read(Q/n);print('\nSTRUCTURE',n,json.dumps(short(v))[:2600])

proc=subprocess.run(['node',str(O/'owner-checks.mjs')],capture_output=True,text=True,timeout=75)
(O/'owner-checks.stdout').write_text(proc.stdout);(O/'owner-checks.stderr').write_text(proc.stderr)
print('\nPURE OWNER CHECK PROCESS',proc.returncode);print(proc.stdout[:13000]);print(proc.stderr[:1500])
save('owner-check-process.json',{'exitCode':proc.returncode,'timeoutSeconds':75,'nativeEffects':0,'sourceEffects':0})
print('\nINDEPENDENT DATA CHECKS',json.dumps([{**r,'detail':({k:v for k,v in r['detail'].items() if k not in ['sourceGeneratedChanged','externalMembers']} if isinstance(r.get('detail'),dict) else r.get('detail'))} for r in results],indent=2))
save('independent-correspondence-checks.json',{'checks':results,'qualifyingExecutionPerformed':False})
save('review-group-3.json',{'group':3,'timeoutSeconds':120,'elapsedSeconds':time.monotonic()-began,'ownerCheckExitCode':proc.returncode,'scope':'One independent delta/owner/staging read-check group; no recipe/native/testsuite execution.','priorGroup2HarnessFailureConserved':True})
# Hash all current report-territory records once for the later write-only report
# and freeze construction. This is the last process group in this activation.
rows=[]
for p in sorted(O.rglob('*')):
 if p.is_file():
  b=p.read_bytes();rows.append({'path':str(p.relative_to(O)),'bytes':len(b),'sha256':sha(b)})
save('pre-report-records.json',{'records':rows,'lastReadCheckGroupComplete':True})
print('\nREPORT RECORDS',json.dumps(rows))
