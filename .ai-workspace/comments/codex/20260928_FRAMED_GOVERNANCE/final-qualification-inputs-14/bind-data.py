"""Close Q07 recipe/body/inventory correspondence before the single owner discriminator."""
from pathlib import Path
import hashlib,json,stat,copy
R=Path('/Users/jim/src/apps/abiogenesis');G=R/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE'
Q=G/'final-qualification-inputs-14';OLD=G/'final-qualification-inputs-04';C=G/'final-candidate-construction-09'
CALL=G/'qualification-command-preparation-01';F=G/'f11-carrier-installed-input-preparation-01'
TR='build_tenants/abiogenesis/typescript/';T=C/'final-stage'/TR
SELECT='selection://abiogenesis/rc1/final-qualification-inputs-07/source-and-material'
assert not (Q/'freeze.json').exists()
def read(p):return json.loads(Path(p).read_bytes())
def canonical(v):return json.dumps(v,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()
def sha(b):return hashlib.sha256(b).hexdigest()
def digest(v):return 'sha256:'+sha(canonical(v))
def pin(p):
 p=Path(p)
 with p.open('rb')as f:h=hashlib.file_digest(f,'sha256').hexdigest()
 return {'path':str(p),'bytes':p.stat().st_size,'sha256':h,'mode':stat.S_IMODE(p.stat().st_mode)}
def put(n,v):
 p=Q/n;body=json.dumps(v,indent=2,ensure_ascii=False)+'\n'
 if p.exists()and p.read_text()==body:return
 p.write_text(body)
def member(ref,path,p,roles):
 a=pin(p);return {'ref':ref,'path':path,'digest':'sha256:'+a['sha256'],'byteCount':a['bytes'],
  'surfaceRoles':roles,'classificationEvidenceRefs':[SELECT]}
def recipe_row(n):
 p=Q/n;a=pin(p);return {'origin':str(p),'target':'recipe/'+n,'bytes':a['bytes'],'sha256':a['sha256'],
  'mode':0o444,'sourceMode':a['mode'],'classification':'declared_recipe','memberRef':'recipe-input://abiogenesis/q07/'+n,
  'sourceAuthor':'/root/q03_input_review external preparation Worker','copyBuildAuthor':'not built'}

manifest=read(Q/'input-manifest.json');source=read(Q/'source-inventory.json');donors=read(Q/'donor-authority-preimages.json')
aliases=read(Q/'f11/member-alias-trace.json');alias_by_ref={r['originalRef']:r['qualifiedMemberRef']for r in aliases['bijection']}
assert len(alias_by_ref)==95 and len(set(alias_by_ref.values()))==95
for collection in ['sourceFiles','authoritySources','lawMembers','toolFiles','fixtureFiles','dependencies']:
 for row in manifest[collection]:row['memberRef']=alias_by_ref.get(row['memberRef'],row['memberRef'])
put('input-manifest.json',manifest)
core=read(C/'final-selected-core.json');law=read(T/'contracts/qualification/law-basis.json');coverage=read(T/'contracts/qualification/coverage.json')
put('candidate-binding.json',{'kind':'current_accepted_C09_preparation_binding','constructionFreeze':pin(C/'final-freeze.json'),
 'sourceFreeze':pin(C/'final-source-freeze-manifest.json'),'acceptance':pin(G/'rc1-setup09-acceptance-01/acceptance.json'),
 **core['basis'],'physicalBootstrapRoot':core['packageRoot'],'actualInstalledRoot':read(Q/'f11/actual-setup-coordinates.json')['currentInstalledRoot'],'artifact':pin(core['artifactPath']),
 'law':pin(T/'contracts/qualification/law-basis.json'),'catalog':pin(T/'contracts/qualification/rule-catalog.json'),
 'coverage':pin(T/'contracts/qualification/coverage.json'),'productManifest':pin(T/'product-toolchain-manifest.json'),
 'publications':pin(C/'final-publication-bindings.json'),'actualInstalledProduct':read(Q/'f11/actual-setup-coordinates.json')['coreInstall'],'actualWorkspaceBinding':read(Q/'f11/actual-setup-coordinates.json')['workspaceBinding'],
 'qualification':None,'physicalReadinessIsInstallAuthority':False})
put('f11-context-selection-plan.json',{'kind':'concrete_current_C09_runtime_bound_authorer','authorer':pin(Q/'f11/current-resources.mjs'),
 'firstCriterion':{'sourceRef':'repo://abiogenesis/stdo_abiogenesis.json','role':'qualification-role://abiogenesis/catalog@5','evidenceRole':'catalog_fidelity'},
 'providedModelSourceRefs':['repo://abiogenesis/stdo_abiogenesis.json','repo://abiogenesis/specification/requirements/product/REQ-P-SELF-CONFORMANCE.md','repo://abiogenesis/specification/requirements/product/REQ-P-QUAL.md'],
 'completeInventorySeparate':True,'fullSourceCorrespondenceResources':'one exact body selector for every inventory member; no binary/tool body copied to model context',
 'sourceAuthRecords':pin(Q/'f11/source-authorship-records.json'),'historicalPartitionPreimage':pin(Q/'f11/historical-partition-preimage.json.gz'),
 'scopeAuthoring':'Preserve current matching historical ordered rule/member partitions; append current source/new-member groups explicitly. All applicability/grouping sufficiency remains unknown.',
 'RuntimeRequiredParameters':['actual admitted A','actual admitted W','current C09 admitted install','Root actor','current catalog','current View','exact declaration proofs'],
 'constructedData':['current basis','whole scope/per-rule partitions','tenant manifest','plan','task','exact context','full source/member/material/provenance','resource manifest/assertion'],
 'unitCoordinates':'explicit unit-only opaque coordinates for published guard/renderer readiness; never ABG truth',
 'runtimeOrder':['complete mixed setup with both Products/publications/installs/catalog and four conformance Programs','wrapper parent -> imported core assessment child -> compact J -> ordinary foldback/parent closure','two fresh result/replay reads','fresh F11 then sole AF22 truthful non-green then cold reads'],
 'rootOnlyFallback':False,'semanticAssessment':False,'unknowns':['all unassessed criteria','independent attribution','grouping sufficiency','actual runtime provenance/J','observed qualification','release/human ruling']})
put('f11-current-pending-bindings.json',{'kind':'actual_runtime_coordinates_pending_concrete_authorer_available','candidate':pin(Q/'candidate-binding.json'),
 'authorer':pin(Q/'f11/current-resources.mjs'),'actualRuntimeBindings':pin(Q/'f11/actual-setup-coordinates.json'),'independentJ':None,'qualification':None,'release':None,
 'missingConstructorOrNormalizer':False,'historicalScopeRelabel':False})
put('f11-donor-correspondence.json',{'kind':'explicit_historical_donor_source_join','freeze':pin(F/'freeze.json'),
 'currentHOW':pin(C/'final-source'/TR/'design/T287_F11_CARRIER_RESOURCE_DESIGN.md'),
 'sixKeyConstructor':pin(G/'rc1-c03-conformance-caller-repair-01/conformance-resources.mjs'),
 'retainedHistoricalOnly':['historical-f11-donor/'+p.name for p in (Q/'historical-f11-donor').iterdir()],
 'adaptedSources':[{'path':'f11/'+p.name,'current':pin(p),'donor':pin(F/p.name)if(F/p.name).exists()else None}for p in sorted((Q/'f11').iterdir())],
 'notExecuted':True,'currentF11BodyBindingPending':False})

names=read(OLD/'recipe-member-names.json')+['raw-config.json','command-environment.mjs','recipe-correspondence.mjs']
assert len(set(names))==len(names)==16
recipe_inputs=[recipe_row(n)for n in names if n!='verification-recipe.json']
sources=manifest['sourceFiles']+manifest['authoritySources']
aux=manifest['lawMembers']+manifest['toolFiles']+manifest['fixtureFiles']+manifest['dependencies']+recipe_inputs
recipe=read(OLD/'verification-recipe.json');normalized=read(CALL/'normalized-configuration.json')
for command in normalized['commands']:
 for entry in command['environment']:
  if entry['name']=='PATH':entry['value']=str(C/'source-freeze/toolchain/bin')+':/usr/bin:/bin:/usr/sbin:/sbin'
recipe.update(sourceInputs=[{'memberRef':v['memberRef'],'relativePath':v['target']}for v in sources],
 auxiliaryInputs=[{'relativePath':v['target'],'digest':'sha256:'+v['sha256'],'byteCount':v['bytes']}for v in aux],
 commandConfigurationDigest=digest(normalized['commands']),predicateConfigurationDigest=digest(normalized['predicates']),
 writeTerritoriesDigest=digest(normalized['allowedWriteTerritories']))
put('verification-recipe.json',recipe);put('recipe-member-names.json',names)
recipe_inputs.append(recipe_row('verification-recipe.json'))
protected=sources+manifest['lawMembers']+manifest['toolFiles']+manifest['fixtureFiles']+manifest['dependencies']+recipe_inputs
assert len({v['target']for v in protected})==len(protected)
put('protected-inputs.json',{'kind':'complete_prospective_protected_input_population','members':protected,
 'counts':{k:len(manifest[k])for k in ['sourceFiles','authoritySources','lawMembers','toolFiles','fixtureFiles','dependencies']},
 'recipeFilesIncludingSelf':len(recipe_inputs),'total':len(protected),'bytes':sum(v['bytes']for v in protected),
 'status':'prepared; no actual admitted original workspace/observations/task/material'})

old_members={v['ref']:v for v in read(OLD/'qualification-inventory.json')['members']}
members=[];origins=[];seen=set()
def add(ref,path,p,roles,**extra):
 original_ref=ref;ref=alias_by_ref.get(ref,ref)
 assert ref not in seen,ref;seen.add(ref)
 members.append(member(ref,path,p,roles));origins.append({**pin(p),'ref':ref,'path':path,'origin':str(p),**extra,
  **({'originalPhysicalMemberRef':original_ref,'aliasDerivation':'f11/member-alias-trace.json'}if ref!=original_ref else {})})
for v in source:
 ref='repo://abiogenesis/'+v['path'];roles=old_members[ref]['surfaceRoles']if ref in old_members else ['proof']
 add(ref,v['path'],Path(v['origin']),roles,sourceRole=v['role'],sourceAuthor=v['sourceAuthor'],copyBuildAuthor=v['copyBuildAuthor'],logicalInputPath=v['path'])
for v in donors:
 add(v['memberRef'],'.qualification-material/construction-preimages/'+v['path'],Path(v['origin']),['qualification'],
  sourceRole=v['role'],sourceAuthor=v['sourceAuthor'],copyBuildAuthor=v['copyBuildAuthor'],logicalInputPath=v['path'])
for v in protected:
 if v['memberRef']in seen:
  m=next(m for m in members if m['ref']==v['memberRef'])
  assert (m['digest'],m['byteCount'])==('sha256:'+v['sha256'],v['bytes']),v['memberRef'];continue
 roles=['constitutional']if v['classification']=='immutable_current_RC2_law'else ['proof']if v['classification'].startswith('retained_')else ['execution_contract']if v['classification']in ['frozen_execution_tool','declared_recipe']else ['manifest']
 add(v['memberRef'],'.qualification-material/'+v['target'],Path(v['origin']),roles,
  sourceRole=v['classification'],sourceAuthor=v.get('sourceAuthor','inherited exact frozen donor/tool/law identity'),copyBuildAuthor=v.get('copyBuildAuthor','Q07 future staging only'))
ordinary=['recipe.mjs','output-checks.mjs','test-selection.json','lint-population.json','release-claims.json',
 'candidate-binding.json','f11-context-selection-plan.json','f11-current-pending-bindings.json','f11-donor-correspondence.json',
 'prepare-data.py','prepare-current-delta.py','run-delta-preflight.py','prepare-setup-binding.py','run-packet-readiness.py','close-cut.py','current-dependency-pin.json','prepare-provenance.py','prepare-bijection.py','consumed-cut-pins.json','reused-input-pins.json','bind-data.py','readiness-driver.mjs','run-readiness.py',
 'material-identity-request.txt','material-identity-triage.md','material-identity-received-worker-correspondence.md','material-identity-continuation.json']
ordinary +=['f11/'+p.name for p in sorted((Q/'f11').iterdir()) if p.is_file()]
for name in ordinary:
 roles=['release_claim']if name=='release-claims.json'else ['proof']if name in ['output-checks.mjs','test-selection.json']else ['execution_contract']
 add('recipe-input://abiogenesis/q07/'+name,'.qualification-material/recipe/'+name,Q/name,roles,
  sourceRole='ordinary_caller_or_context_or_selection_control',sourceAuthor='/root/q03_input_review or explicitly retained pinned donor',copyBuildAuthor='not built')
controls=[Q/'request.txt',Q/'activation.json',Q/'consumed-cut-pins.json',G/'rc1-setup09-acceptance-01/acceptance.json',G/'rc1-c09-construction-acceptance-01/acceptance.json',
 OLD/'freeze.json',CALL/'freeze.json',F/'freeze.json',G/'rc1-c03-conformance-caller-repair-01/freeze.json',
 OLD/'readiness-result.json',OLD/'readiness-copy.json',OLD/'readiness-command.json',
 G/'final-c2-output-consumer-repair-01/freeze.json',G/'final-c2-output-consumer-review-01/freeze.json']
controls +=[C/n for n in ['final-freeze.json','final-source-freeze-manifest.json','final-source-members.json','final-generated-after.json',
 'final-archive-members.json','final-install-population.json','final-publication-bindings.json','final-reader-binding.json',
 'final-attribution.json','final-law-verification.json','toolchain-pins.json','dependency-pins.json','final-schema-seeds.json']]
supplier=read(Q/'current-source-supplier-view.json')
for p in controls:
 if p==C/'final-source-members.json':
  add(supplier['projectionRef'],'.qualification-material/derived/current-source-supplier-view.json',Q/'current-source-supplier-view.json',['qualification','manifest'],sourceRole='derived_current_source_supplier_control_view',sourceAuthor='Original source authors retained in flat tuples; this ordinary view authored by /root/q03_input_review',copyBuildAuthor='projection only, no source authorship transfer',originalSupplier=supplier['sourceSupplier'],classification=supplier['classification'])
  continue
 relative=str(p.relative_to(R));add('repo://abiogenesis/'+relative,relative,p,['qualification','manifest'],sourceRole='immutable_control_or_supplier_manifest',sourceAuthor='explicit original frozen actor',copyBuildAuthor='Q07 read-only')
roots=sorted(set(read(OLD/'qualification-inventory.json')['selectedRoots'])-{'construction-input://abiogenesis/c03/','fixture-input://abiogenesis/q04/','recipe-input://abiogenesis/q04/'})
roots=[alias_by_ref.get(root,root)for root in roots]
roots+=['construction-input://abiogenesis/c09/','fixture-input://abiogenesis/q07/','recipe-input://abiogenesis/q07/']
roots+=[aliases['aliasRoot']]
roots+=['repo://abiogenesis/'+str(p.relative_to(R))for p in controls if p!=C/'final-source-members.json'];roots+=[supplier['projectionRef']];roots=sorted(set(roots))
for root in roots:
 if any(m['ref'].startswith(root)for m in members):continue
 assert root in old_members and root.startswith('repo://abiogenesis/'),root
 prior=old_members[root];p=R/prior['path'];a=pin(p)
 assert ('sha256:'+a['sha256'],a['bytes'])==(prior['digest'],prior['byteCount']),root
 add(root,prior['path'],p,prior['surfaceRoles'],sourceRole='retained_historical_supplier_or_control',
  sourceAuthor='exact Q04 inventory attribution retained',copyBuildAuthor='Q07 read-only',currentCandidateAuthority=False)
members.sort(key=lambda m:m['ref']);assert len({v['path']for v in members})==len(members)
assert all(any(m['ref'].startswith(root)for m in members)for root in roots)
body={'kind':'qualification_subject_inventory','selectedRoots':roots,'coverage':'complete_claim','members':members};h=digest(body)
for r in aliases['bijection']:
 m=next(m for m in members if m['ref']==r['qualifiedMemberRef']);original=r['physicalMember']
 assert {k:v for k,v in m.items()if k!='ref'}=={k:v for k,v in original.items()if k!='ref'},r['originalRef']
 assert not any(m['ref']==r['originalRef']for m in members),r['originalRef']
inventory={**body,'inventoryRef':'qualification-inventory://abiogenesis/'+h[7:],'inventoryDigest':h}
put('qualification-inventory.json',inventory);put('inventory-origin-correspondence.json',origins)
put('population-binding.json',{'kind':'same_C09_Q07_population_bindings','candidate':pin(C/'final-freeze.json'),
 'qualificationInventory':{'ref':inventory['inventoryRef'],'digest':h},'inventoryMembers':len(members),
 'sourcePreimages':len(read(C/'final-source-members.json')),'effectiveSourceAndGenerated':len(source),'generated':len(read(C/'final-generated-after.json')),'generatedCode':sum(v['role']=='generated_output'for v in read(C/'final-generated-after.json')),'derivedAliases':len(donors),
 'changedDerivedAliases':sum(v['changed']for v in donors),'expectedCurrentOutputs':len(read(Q/'expected-output-inventory.json')['paths']),
 'historicalComponentOutputs':len(read(Q/'component-stage-plan.json')['members']),'historicalSixCaseResult':'Q04 only; not rerun on C09',
 'protectedInputs':len(protected),'protectedBytes':sum(v['bytes']for v in protected),'sourceInputs':len(sources),'auxiliaryInputs':len(aux),
 'recipeInputsIncludingSelf':len(recipe_inputs),'commands':len(read(Q/'config.json')['commands']),
 'physicalMemberAliases':95,'physicalCensusDeltaFromAliases':0,'aliasTrace':pin(Q/'f11/member-alias-trace.json'),
 'predicates':len(read(Q/'config.json')['outcomePredicates']),'selectedGroups':len(read(Q/'test-selection.json')['tests']),
 'selectedTitles':read(Q/'test-selection.json')['totalSelectedTitles'],'lintFiles':len(read(Q/'lint-population.json')),
 'currentRecipeDigestsProposedFromPriorActualOwner':{k:recipe[k]for k in ['commandConfigurationDigest','predicateConfigurationDigest','writeTerritoriesDigest']},
 'completeCurrentOwnerDiscriminator':'not yet executed','actualNativeTask':None,'qualificationMaterial':None})
print(json.dumps({'inventoryMembers':len(members),'protectedInputs':len(protected),'protectedBytes':sum(v['bytes']for v in protected),'inventoryDigest':h}))
