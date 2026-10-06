"""Close Q05 recipe/body/inventory correspondence before the single owner discriminator."""
from pathlib import Path
import hashlib,json,stat,copy
R=Path('/Users/jim/src/apps/abiogenesis');G=R/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE'
Q=G/'final-qualification-inputs-05';OLD=G/'final-qualification-inputs-04';C=G/'final-candidate-construction-04'
CALL=G/'qualification-command-preparation-01';F=G/'f11-carrier-installed-input-preparation-01'
TR='build_tenants/abiogenesis/typescript/';T=C/'final-stage'/TR
SELECT='selection://abiogenesis/rc1/final-qualification-inputs-05/source-and-material'
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
 p=Q/n;assert not p.exists(),str(p);p.write_text(json.dumps(v,indent=2,ensure_ascii=False)+'\n')
def member(ref,path,p,roles):
 a=pin(p);return {'ref':ref,'path':path,'digest':'sha256:'+a['sha256'],'byteCount':a['bytes'],
  'surfaceRoles':roles,'classificationEvidenceRefs':[SELECT]}
def recipe_row(n):
 p=Q/n;a=pin(p);return {'origin':str(p),'target':'recipe/'+n,'bytes':a['bytes'],'sha256':a['sha256'],
  'mode':0o444,'sourceMode':a['mode'],'classification':'declared_recipe','memberRef':'recipe-input://abiogenesis/q05/'+n,
  'sourceAuthor':'/root/q03_input_review external preparation Worker','copyBuildAuthor':'not built'}

manifest=read(Q/'input-manifest.json');source=read(Q/'source-inventory.json');donors=read(Q/'donor-authority-preimages.json')
core=read(C/'final-selected-core.json');law=read(T/'contracts/qualification/law-basis.json');coverage=read(T/'contracts/qualification/coverage.json')
put('candidate-binding.json',{'kind':'current_accepted_C04_preparation_binding','constructionFreeze':pin(C/'final-freeze.json'),
 'sourceFreeze':pin(C/'final-source-freeze-manifest.json'),'acceptance':pin(G/'rc1-c04-acceptance-and-installed-setup-controls-01/acceptance.json'),
 **core['basis'],'physicalBootstrapRoot':core['packageRoot'],'artifact':pin(core['artifactPath']),
 'law':pin(T/'contracts/qualification/law-basis.json'),'catalog':pin(T/'contracts/qualification/rule-catalog.json'),
 'coverage':pin(T/'contracts/qualification/coverage.json'),'productManifest':pin(T/'product-toolchain-manifest.json'),
 'publications':pin(C/'final-publication-bindings.json'),'actualInstalledProduct':None,'actualWorkspaceBinding':None,
 'qualification':None,'physicalReadinessIsInstallAuthority':False})
authority_refs=[v['memberRef']for v in manifest['authoritySources']]
method_refs=[v['memberRef']for v in manifest['lawMembers']]
put('f11-context-selection-plan.json',{'kind':'bounded_unbound_role_context_preparation','candidateFreeze':pin(C/'final-freeze.json'),
 'purpose':'same-current-source fidelity, complete current-law applicability and observed-material sufficiency; controlled carrier transport remains non-green',
 'proposedContexts':[
  {'frame':'Product/Requirement','initialAuthorityMemberRefs':authority_refs+method_refs,
   'reason':'Product and exact operative method decide WHAT; source-code and fixture profile cannot select it','actor':None,'applicability':'unknown'},
  {'frame':'Identity/NativeDefinition/Proof','initialMemberRefs':['repo://abiogenesis/'+v['path']for v in source if v['path'].startswith(TR+'design/')or v['path'].endswith(('declaration_exports.ts','qualification.ts','qualification_resources.ts','worksite_command_execution.ts'))],
   'reason':'existing package/publication, source fidelity and task/recipe/source versus snapshot owner relations','actor':None,'applicability':'unknown'},
  {'frame':'EndToEnd/F11/Cost','initialControlRefs':['recipe-input://abiogenesis/q05/'+n for n in ['recipe.mjs','output-checks.mjs','verification-recipe.json','config.json','command-environment.mjs']],
   'reason':'actual producer/material, child/J/foldback/fresh read and complete required behavior joins','actor':None,'applicability':'unknown'}],
 'completeInventoryMustBeBound':True,'roleSelectionIsNotApplicability':True,'unprovidedCoverage':'all unsupplied member bodies, source-authenticity facts, rule/application judgments and actor independence remain unknown; no automatic all-body dispatch',
 'currentMaterial':None,'actualScope':None,'actualDomains':None,'actualActorAttribution':None,'independentJudgment':None,
 'resourceNormalizer':{'publishedByCurrentValidator':False,'selectedExternalHOWAuthorer':pin(Q/'f11/scope-authoring.mjs'),
  'authority':'Root separately selected existing Q05 grant and accepted resource HOW section2; published constructQualificationIdentity only; actual owner correspondence remains a future requirement'},
 'tenantConformanceManifest':{'packagedFile':None,'publishedNamedConstructorFound':False,'actualBody':None,'actualCoordinate':None,
  'source':'current Product manifest/catalog/capability graph/publications and exact published contract remain available'},
 'runtimeOrder':['actual separately admitted setup and exact Root-bound preparation',
  'construct current basis/task/plan/resource/context from actual supplied material and actor/source attribution',
  'wrapper parent -> current imported assessment child -> compact J -> ordinary foldback and parent closure',
  'fresh Public Result/replay -> actual native projected child judgment consumption -> fresh F11 -> sole AF22 non-green'],
 'rootOnlyAssessmentFallback':False,'semanticAssessment':False})
put('f11-current-pending-bindings.json',{'kind':'future_actual_bindings_required','currentCandidate':pin(Q/'candidate-binding.json'),
 'contexts':pin(Q/'f11-context-selection-plan.json'),'recipeRef':'recipe-input://abiogenesis/q05/verification-recipe.json',
 'A':None,'W':None,'installedProduct':None,'capabilityGrant':None,'Task':None,'Result':None,'producerCCall':None,
 'sourceAuthentication':None,'verificationMaterial':None,'scope':None,'domains':None,'tenantManifest':None,
 'resourceAssertion':None,'declarationProofs':None,'parentSelection':None,'actorAttribution':None,'independence':None,
 'J':None,'childFoldback':None,'F11':None,'AF22':None,'humanOwnerRuling':None,
 'selectionRule':'Root must bind actual same C04/Q05 coordinates once; no historical1950/Q04 carrier relabel and no invented material to manufacture acceptance'})
put('f11-donor-correspondence.json',{'kind':'explicit_historical_donor_source_join','freeze':pin(F/'freeze.json'),
 'currentHOW':pin(C/'final-source'/TR/'design/T287_F11_CARRIER_RESOURCE_DESIGN.md'),
 'sixKeyConstructor':pin(G/'rc1-c03-conformance-caller-repair-01/conformance-resources.mjs'),
 'retainedHistoricalOnly':['historical-f11-donor/'+p.name for p in (Q/'historical-f11-donor').iterdir()],
 'adaptedSources':[{'path':'f11/'+p.name,'current':pin(p),'donor':pin(F/p.name)if(F/p.name).exists()else None}for p in sorted((Q/'f11').iterdir())],
 'notExecuted':True,'currentF11BodyBindingPending':True})

names=read(OLD/'recipe-member-names.json')+['raw-config.json','command-environment.mjs','recipe-correspondence.mjs']
assert len(set(names))==len(names)==16
recipe_inputs=[recipe_row(n)for n in names if n!='verification-recipe.json']
sources=manifest['sourceFiles']+manifest['authoritySources']
aux=manifest['lawMembers']+manifest['toolFiles']+manifest['fixtureFiles']+manifest['dependencies']+recipe_inputs
recipe=read(OLD/'verification-recipe.json');normalized=read(CALL/'normalized-configuration.json')
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
 assert ref not in seen,ref;seen.add(ref)
 members.append(member(ref,path,p,roles));origins.append({**pin(p),'ref':ref,'path':path,'origin':str(p),**extra})
for v in source:
 ref='repo://abiogenesis/'+v['path'];roles=old_members[ref]['surfaceRoles']
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
  sourceRole=v['classification'],sourceAuthor=v.get('sourceAuthor','inherited exact frozen donor/tool/law identity'),copyBuildAuthor=v.get('copyBuildAuthor','Q05 future staging only'))
ordinary=['recipe.mjs','output-checks.mjs','test-selection.json','lint-population.json','release-claims.json',
 'candidate-binding.json','f11-context-selection-plan.json','f11-current-pending-bindings.json','f11-donor-correspondence.json',
 'prepare-data.py','adapt-callers.py','bind-data.py','readiness-driver.mjs','run-readiness.py']
ordinary +=['f11/'+p.name for p in sorted((Q/'f11').iterdir())]
for name in ordinary:
 roles=['release_claim']if name=='release-claims.json'else ['proof']if name in ['output-checks.mjs','test-selection.json']else ['execution_contract']
 add('recipe-input://abiogenesis/q05/'+name,'.qualification-material/recipe/'+name,Q/name,roles,
  sourceRole='ordinary_caller_or_context_or_selection_control',sourceAuthor='/root/q03_input_review or explicitly retained pinned donor',copyBuildAuthor='not built')
controls=[Q/'request.txt',Q/'activation.json',Q/'consumed-cut-pins.json',G/'rc1-c04-acceptance-and-installed-setup-controls-01/acceptance.json',
 OLD/'freeze.json',CALL/'freeze.json',F/'freeze.json',G/'rc1-c03-conformance-caller-repair-01/freeze.json',
 OLD/'readiness-result.json',OLD/'readiness-copy.json',OLD/'readiness-command.json',
 G/'final-c2-output-consumer-repair-01/freeze.json',G/'final-c2-output-consumer-review-01/freeze.json']
controls +=[C/n for n in ['final-freeze.json','final-source-freeze-manifest.json','final-source-members.json','final-generated-after.json',
 'final-archive-members.json','final-install-population.json','final-publication-bindings.json','final-reader-binding.json',
 'final-attribution.json','final-law-verification.json','toolchain-pins.json','dependency-pins.json','final-schema-seeds.json']]
for p in controls:
 relative=str(p.relative_to(R));add('repo://abiogenesis/'+relative,relative,p,['qualification','manifest'],sourceRole='immutable_control_or_supplier_manifest',sourceAuthor='explicit original frozen actor',copyBuildAuthor='Q05 read-only')
roots=sorted(set(read(OLD/'qualification-inventory.json')['selectedRoots'])-{'construction-input://abiogenesis/c03/','fixture-input://abiogenesis/q04/','recipe-input://abiogenesis/q04/'})
roots+=['construction-input://abiogenesis/c04/','fixture-input://abiogenesis/q05/','recipe-input://abiogenesis/q05/']
roots+=['repo://abiogenesis/'+str(p.relative_to(R))for p in controls];roots=sorted(set(roots))
for root in roots:
 if any(m['ref'].startswith(root)for m in members):continue
 assert root in old_members and root.startswith('repo://abiogenesis/'),root
 prior=old_members[root];p=R/prior['path'];a=pin(p)
 assert ('sha256:'+a['sha256'],a['bytes'])==(prior['digest'],prior['byteCount']),root
 add(root,prior['path'],p,prior['surfaceRoles'],sourceRole='retained_historical_supplier_or_control',
  sourceAuthor='exact Q04 inventory attribution retained',copyBuildAuthor='Q05 read-only',currentCandidateAuthority=False)
members.sort(key=lambda m:m['ref']);assert len({v['path']for v in members})==len(members)
assert all(any(m['ref'].startswith(root)for m in members)for root in roots)
body={'kind':'qualification_subject_inventory','selectedRoots':roots,'coverage':'complete_claim','members':members};h=digest(body)
inventory={**body,'inventoryRef':'qualification-inventory://abiogenesis/'+h[7:],'inventoryDigest':h}
put('qualification-inventory.json',inventory);put('inventory-origin-correspondence.json',origins)
put('population-binding.json',{'kind':'same_C04_Q05_population_bindings','candidate':pin(C/'final-freeze.json'),
 'qualificationInventory':{'ref':inventory['inventoryRef'],'digest':h},'inventoryMembers':len(members),
 'sourcePreimages':1106,'effectiveSourceAndGenerated':len(source),'generated':926,'generatedCode':830,'derivedAliases':len(donors),
 'changedDerivedAliases':sum(v['changed']for v in donors),'expectedCurrentOutputs':len(read(Q/'expected-output-inventory.json')['paths']),
 'historicalComponentOutputs':len(read(Q/'component-stage-plan.json')['members']),'historicalSixCaseResult':'Q04 only; not rerun on C04',
 'protectedInputs':len(protected),'protectedBytes':sum(v['bytes']for v in protected),'sourceInputs':len(sources),'auxiliaryInputs':len(aux),
 'recipeInputsIncludingSelf':len(recipe_inputs),'commands':len(read(Q/'config.json')['commands']),
 'predicates':len(read(Q/'config.json')['outcomePredicates']),'selectedGroups':len(read(Q/'test-selection.json')['tests']),
 'selectedTitles':read(Q/'test-selection.json')['totalSelectedTitles'],'lintFiles':len(read(Q/'lint-population.json')),
 'currentRecipeDigestsProposedFromPriorActualOwner':{k:recipe[k]for k in ['commandConfigurationDigest','predicateConfigurationDigest','writeTerritoriesDigest']},
 'completeCurrentOwnerDiscriminator':'not yet executed','actualNativeTask':None,'qualificationMaterial':None})
print(json.dumps({'inventoryMembers':len(members),'protectedInputs':len(protected),'protectedBytes':sum(v['bytes']for v in protected),'inventoryDigest':h}))
