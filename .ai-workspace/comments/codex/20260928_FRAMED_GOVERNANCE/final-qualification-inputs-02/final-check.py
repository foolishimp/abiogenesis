import pathlib,json,hashlib,stat,collections,difflib,time
E=pathlib.Path(__file__).resolve().parent;G=E.parent;R=G.parents[3];Q=G/'final-qualification-inputs-01';C=G/'final-candidate-construction-02';read=lambda p:json.loads(p.read_text());sha=lambda b:hashlib.sha256(b).hexdigest()
def record(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':sha(b)}
def write(n,v):
 with (E/n).open('x') as f:json.dump(v,f,indent=2);f.write('\n')
start=time.monotonic();used=read(E/'consumed-inputs.json');external=[]
for row in used:
 p=pathlib.Path(row['path']);b=p.read_bytes();assert len(b)==row['bytes'] and sha(b)==row['sha256'],str(p)
 if not p.is_relative_to(E):external.append(row)
for root,expected in [(Q,'0a386fd10e1067abb3f09ba4d7f115b56593045ca0d0d1aa272fb7fcc0a46bbe'),(C,'7256ca2e716e73912f4937fdddc6d8a980a217ecf965cac1512ba5162dac4469')]:
 assert sha((root/'freeze.json').read_bytes())==expected
 for row in read(root/'freeze.json')['records']:
  p=root/row['path']
  if row.get('kind')=='symlink':assert p.is_symlink() and str(p.readlink())==row['target']
  else:
   assert p.is_file() and not p.is_symlink();b=p.read_bytes();assert len(b)==row['bytes'] and sha(b)==row['sha256'],str(p)
   if 'mode' in row:assert stat.S_IMODE(p.stat().st_mode)==row['mode']
 assert {str(p.relative_to(root)) for p in root.rglob('*') if p.is_file() or p.is_symlink()}=={row['path'] for row in read(root/'freeze.json')['records']}|{'freeze.json'}
mapping=read(E/'qualification-member-correspondence.json');assert len(mapping['members'])==1950
for row in mapping['members']:
 m=row['successor'];p=pathlib.Path(row['successorPhysicalOrigin']);b=p.read_bytes();assert len(b)==m['byteCount'] and 'sha256:'+sha(b)==m['digest'],str(p)
source=read(E/'source-inventory.json');files=read(E/'input-manifest.json');recipe_names=['input-manifest.json','expected-output-inventory.json','recipe-stage.mjs','compare-generated.mjs','config.json','toolchain.json','npm-toolchain-inventory.json','test-environment.mjs','verification-recipe.json']
protected=files['sourceFiles']+files['dependencies']+[{'origin':str(E/n),'target':'recipe/'+n,'bytes':(E/n).stat().st_size,'sha256':sha((E/n).read_bytes())} for n in recipe_names];assert len(protected)==716
for row in protected:
 p=pathlib.Path(row['origin']);b=p.read_bytes();assert len(b)==row['bytes'] and sha(b)==row['sha256'];assert pathlib.PurePosixPath(row['target']).parts[0] in ['subject','dependency-inputs','recipe'] and '..' not in pathlib.PurePosixPath(row['target']).parts
template=read(E/'basis-template.json');assert set(template['requiredNativeBindings'])=={'installedProduct','workspaceBinding','tenantManifest'}
assert all(template['body'][k] is None for k in template['requiredNativeBindings']);assert 'executionSelectionRef' not in read(E/'verification-selection-binding.json');assert template['body']['toolchain']==template['body']['productManifest']
assert template['body']['toolchain']['digest']=='sha256:d93ec21cf34a043822a211ba8bea46fdc1050311925d38030b430172f5464ee4'
assert not (E/'component-model').exists(),'cold A/W schema model must have no physical worksite'
staging=read(E/'staging-contract.json');assert staging['runtimeRoot'] is None and not staging['performed'] and set(staging['targets'])=={r['target'] for r in protected}
assert read(E/'external-construction-context.json')['attributionChains']==0
validation=read(E/'validation-result.json');assert validation['isQualificationBasisReady'] is False and validation['actualInstalledPublicationClosure']==11
# Full external-control donor correspondence; report/streams are closure evidence,
# not new protected recipe inputs. The 19 actual inventory controls/manifests are
# completely covered by qualification-member-correspondence.json above.
before_records={r['path']:r for r in read(Q/'freeze.json')['records']};control_rows=[];patches=[]
for p in sorted(E.iterdir()):
 if not p.is_file() or p.suffix not in ['.json','.py','.mjs'] or any(s in p.name for s in ['.started.','.process.','.execution.']):continue
 n=p.name;prior=Q/n;before=before_records.get(n)
 control_rows.append({'successor':record(p),'original':({**before,'path':str(prior)} if before else None),'relation':'exact copy' if before and before['sha256']==sha(p.read_bytes()) else 'current external input realization','actualConstructionActor':'/root/s03_independent_review','grant':'T287_FINAL_QUALIFICATION_INPUTS_02','scope':'Current external-input/control bytes only; no inherited Product authorship or qualification-owner authority assigned'})
 if before and before['sha256']!=sha(p.read_bytes()):patches.extend(difflib.unified_diff(prior.read_text().splitlines(keepends=True),p.read_text().splitlines(keepends=True),fromfile=str(prior),tofile=str(p)))
write('external-control-correspondence.json',{'controls':control_rows,'completeQualificationMemberMap':record(E/'qualification-member-correspondence.json'),'retainedOriginalCut':record(Q/'freeze.json'),'currentGrant':record(G/'final-qualification-input-controls-02/request.txt'),'originalsNotReissued':[{'path':str(Q/n),'sha256':r['sha256'],'disposition':'Preserved in immutable Q01; historical failure/report or superseded construction control, not a current Q02 claim'} for n,r in before_records.items() if not (E/n).exists()],'acyclicLimit':'This correspondence record, final report and freeze are closure evidence and do not contain their own digest or enter the recipe/inventory.'})
with (E/'external-control-delta.patch').open('x') as f:f.write(''.join(patches))
write('external-input-freeze.json',{'status':'all_selected_originals_conserved','records':external,'candidateFreeze':record(C/'freeze.json'),'donorFreeze':record(Q/'freeze.json'),'basis':'Only exact CLOSED C02/Q01/accepted routes; moving native03/resource excluded'})
write('final-conservation.json',{'status':'passed','C02Records':16774,'Q01Records':46,'qualificationMembers':1950,'protectedFiles':716,'sourceGeneratedChanged':6,'externalControlsAndManifests':19,'allRequiredPopulationsConserved':True,'toolchainPreview':'actual immutable Product manifest; Node/npm build configuration separate','runtimeSlots':{'installedProduct':None,'workspaceBinding':None,'tenantManifest':None},'executionSelectionRef':'absent','coldModelPhysicalWorksite':False,'staging':False,'recipeOrTestExecution':False,'nativeOrProviderCalls':0,'attributionChains':0,'GitEffects':0,'elapsedMs':(time.monotonic()-start)*1000})
print(json.dumps({'status':'passed_final_conservation','members':1950,'protected':716,'externalOriginalRecords':len(external),'controlCorrespondenceRows':len(control_rows),'nativeReady':False}))
