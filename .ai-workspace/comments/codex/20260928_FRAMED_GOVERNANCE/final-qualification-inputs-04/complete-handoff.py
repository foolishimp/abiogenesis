"""Writes only bounded unbound preparation bindings; never calls Product owners."""
import hashlib
import json
import pathlib

REPO=pathlib.Path('/Users/jim/src/apps/abiogenesis')
G=REPO/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE'
Q=G/'final-qualification-inputs-04'
C=G/'final-candidate-construction-03'
OLD=G/'final-qualification-inputs-02'
T=C/'final-stage/build_tenants/abiogenesis/typescript'
assert not (Q/'freeze.json').exists()
def read(p): return json.loads(pathlib.Path(p).read_bytes())
def pin(p):
    p=pathlib.Path(p);raw=p.read_bytes()
    return {'path':str(p),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
def put(n,value):
    assert (Q/n).parent==Q
    (Q/n).write_text(json.dumps(value,indent=2)+'\n')

inventory=read(Q/'qualification-inventory.json')
recipe=read(Q/'verification-recipe.json')
protected=read(Q/'protected-inputs.json')
manifest=read(Q/'input-manifest.json')
population=read(Q/'population-binding.json')
config=read(Q/'config.json')
law=read(T/'contracts/qualification/law-basis.json')
catalog=read(T/'contracts/qualification/rule-catalog.json')
coverage=read(T/'contracts/qualification/coverage.json')
product_manifest=read(T/'product-toolchain-manifest.json')
c03=read(C/'final-freeze.json')
inventory_coord={'ref':inventory['inventoryRef'],'digest':inventory['inventoryDigest']}
recipe_bytes=(Q/'verification-recipe.json').read_bytes()
recipe_member=next(m for m in inventory['members']if m['ref']=='recipe-input://abiogenesis/q04/verification-recipe.json')
law_coord={'ref':law['lawBasisRef'],'digest':law['lawBasisDigest']}
raw_sizes={name:pin(Q/name)for name in ['source-inventory.json','qualification-inventory.json','input-manifest.json',
    'protected-inputs.json','verification-recipe.json','expected-output-inventory.json','test-selection.json',
    'npm-toolchain-inventory.json','donor-authority-preimages.json','component-stage-plan.json','component-stage.mjs','readiness-copy.json','readiness-result.json']}

product_frame={
 'authority':[pin(C/'final-source/specification/PRODUCT.md'),pin(C/'final-source/specification/requirements/product/REQ-P-QUAL.md'),
              pin(C/'final-source/specification/requirements/product/REQ-P-SELF-CONFORMANCE.md')],
 'outcome':'prepare an exact current observed QUAL056 recipe and input cut for accepted C03, preserving actual-source conservation and current RC2 generated-output agreement',
 'unchangedProduct':'the fifteen 5.0 families; F11 whole independent conformance feeds sole AF22, F15 distinguishes pre_rc_candidate and installed_rc, F16 publication and actual human owner acceptance remain separate',
 'authoritySplit':'Specification owns WHAT; accepted source/HOW and GTL publications own realization; HoG traverses, owners effect, ABG admits, replay projects. This input Worker owns only future recipe/input bytes.',
 'prohibitions':['no private controller, runtime or event writer','no structural/mechanical check interpreted as semantic adequacy',
                 'no Product/Run/CCall/Result/J/admission or green qualification manufactured','no fixture or pre-RC evidence relabeled as installed-RC qualification']}
put('product-frame.json',product_frame)

put('authority-correspondence.json',{
 'kind':'unexecuted_authority_stage_binding_plan','currentDefinition':pin(C/'final-source/stdo_abiogenesis.json'),
 'currentLaw':law_coord,'catalog':{'ref':catalog['catalogRef'],'digest':law['catalog']['digest'],'sources':len(catalog['sources']),'rules':len(catalog['rules'])},
 'coverage':{'ref':coverage['catalogRef'],'digest':coverage['catalogDigest'],'claims':len(coverage['claims']),
             'behaviors':sum(len(c['behaviors'])for c in coverage['claims'])},
 'authorityInputs':pin(T/'contracts/qualification/authority-inputs.json'),
 'currentAuthoritySourceMembers':manifest['authoritySources'],'currentImmutableMethodMembers':manifest['lawMembers'],
 'allDonorInputs':pin(Q/'donor-authority-preimages.json'),
 'distinction':'all96 immutable C03 selected authority preimages are conserved and separately inventoried; current canonical authority coordinates use actual C03 stage bytes, including the12 changed derived RC2 bodies',
 'stageCommand':next(c for c in config['commands']if c['commandId'].endswith('/stage-current-authorities')),
 'order':['compile current accepted code','explicit stage from protected current87 authority sources and immutable current53 RC2 members','ordinary Product generation','exact927 expected-output comparison'],
 'defaultLibrary':'selected RC1 default-library substrate remains the exact unchanged C03 body; governing qualification law is current RC2',
 'historicalFixtures':'87 source bodies,9 selected law bodies/manifest,5 exact reproduction bodies and1 original carrier input are explicit unchanged component fixtures. They supply no current law, native Result or green qualification.',
 'status':'prepared_not_executed'})


component=read(Q/'component-stage-plan.json');readiness=read(Q/'readiness-result.json');copied=read(Q/'readiness-copy.json')
authority=read(Q/'authority-correspondence.json')
authority['isolatedHistoricalComponent']={'stagePlan':pin(Q/'component-stage-plan.json'),'stageCommand':next(c for c in config['commands']if c['commandId'].endswith('/stage-historical-component')),'derivationAfter':'ordinary current C03 generation; current RC2 qualification outputs remain unchanged','existingFixtureInputs':102,'additionalFixtureBodyAssets':0,'stagedOutputs':len(component['members']),'roles':component['counts'],'readiness':pin(Q/'readiness-result.json'),'qualificationCredit':False}
put('authority-correspondence.json',authority)

owner_sources=['code/src/product/worksite_command_execution.ts','code/src/implementation/worksite_command_helper.ts',
               'code/src/implementation/worksite_command_execution.ts','code/src/gtl/worksite_command_execution.ts',
               'code/src/validator/qualification.ts','code/src/validator/qualification_contracts.ts',
               'code/src/gtl/self_conformance.ts','code/src/validator/qualification_resources.ts',
               'code/src/abg/qualification_proof.ts']
owner_pins=[]
for relative in owner_sources:
 p=C/'final-source/build_tenants/abiogenesis/typescript'/relative
 assert p.is_file(), 'actual finite owner source required: '+relative
 owner_pins.append(pin(p))
put('output-consumer-binding-plan.json',{
 'kind':'future_actual_snapshot_output_consumer_plan','status':'prepared_not_executed',
 'acceptedReader':{'repair':pin(G/'final-c2-output-consumer-repair-01/freeze.json'),
                   'review':pin(G/'final-c2-output-consumer-review-01/freeze.json'),
                   'body':pin(G/'final-c2-output-consumer-repair-01/output-checks.mjs')},
 'currentReader':pin(Q/'output-checks.mjs'),'currentSourceOwners':owner_pins,
 'mechanicalAdaptation':'preserves actual owner task/attempt/artifact/snapshot checks; replaces old fixed716/13/14/30/925 assertions with complete exact declared protected/task/recipe/selection/expected populations',
 'requiredBeforeRead':['actual typed terminal producer binds actual Run and value digest',
   'installed isObservedWorksiteCommandExecutionObservation accepts the actual observation and observation.task equals actual task',
   'installed helper-plan predicate binds exact current task and attempt; actual helperArtifactPath equals retained plan.artifactPath',
   'archive root is actual task.workspaceBinding.roots.archiveRoot; canonical nonalias regular helper file is read from that root',
   'installed helper-artifact predicate accepts actual task-bound bytes; ref,digest,length,disposition and every observation population agree',
   'helper.snapshotRoot equals plan.sandboxRoot and is canonical directory distinct from original task.workspaceAuthorityBasis.canonicalRoot'],
 'oneOutputReaderFor':['all observed command-report bodies','verification/reports/generated-comparison.json','every one of927 verification build/contracts/manifest output bodies'],
 'protectedInputConservation':{
   'descriptor':pin(Q/'protected-inputs.json'),'files':len(protected['members']),
   'root':'actual original workspaceAuthorityBasis.canonicalRoot, separately from helper snapshotRoot',
   'required':'fresh original-body reads match every declared digest/byteCount before and after execution; task protected observations and helper protectedBefore/After reproduce the exact same complete set; original A/W metadata retained'},
 'freshResultReplay':'actual fresh installed Public run_result and run_replay must agree on producer, typed terminal result, result, replay and closed status; fresh reads are not invented here',
 'noFallback':'No report, comparison or generated-output read is redirected to the original worksite when the actual snapshot cannot be authenticated.',
 'pending':{'actualTask':None,'attempt':None,'helperPlan':None,'helperArtifact':None,'archiveRoot':None,'snapshotRoot':None,
            'actualObservation':None,'freshPublicResult':None,'freshPublicReplay':None}})


snapshot=read(Q/'output-consumer-binding-plan.json')
snapshot['isolatedComponentOutputConservation']={'stagePlan':pin(Q/'component-stage-plan.json'),'protectedPlanPath':'recipe/component-stage-plan.json','stagingReportPath':'verification/reports/component-staging.json','componentRoot':'verification/.components/retained-carrier','outputs':len(component['members']),'required':'the authenticated helper snapshot reader checks the protected plan body, staging report and every exact component output body; no original-root fallback','currentProductOutputsRemain':927}
put('output-consumer-binding-plan.json',snapshot)

put('qualification-binding-plan.json',{
 'kind':'unbound_current_candidate_qualification_bindings','status':'preparation_only; not a contract value or an admission',
 'candidate':{'constructionFreeze':pin(C/'final-freeze.json'),'sourceFreeze':pin(C/'final-source-freeze-manifest.json'),
   'productId':'product://abiogenesis/typescript-tenant@5.0.0-rc.1','artifact':pin(c03['package']['artifactPath']),
   'artifactDigest':c03['package']['artifactDigest'],'contentDigest':'sha256:216194ac4393489ddb7553caccd243a24a5d75399cb9400e9e01faeb2321e379',
   'productManifestCanonicalDigest':'sha256:cb7b8045e769fa6c019e599e5aef932827d915ce9de11a91cfcb5946a9eb153d',
   'acceptedPhysicalInstallRoot':c03['package']['packageRoot'],'actualInstalledProductCoordinate':'pending admitted setup; physical path does not supply this identity'},
 'sourceInventory':inventory_coord,'lawBasis':law_coord,'coverage':{'ref':coverage['catalogRef'],'digest':coverage['catalogDigest']},
 'recipeSelection':{'recipeMember':recipe_member,'recipePath':'recipe/verification-recipe.json',
   'recipeBytes':pin(Q/'verification-recipe.json'),'contentBase64':'pending future actual selection serialization from these exact bytes',
   'executionSelectionRef':None,'originalResult':None,'producerCCall':None,'executionBasis':None,'invocationAdmission':None,
   'declarationBasis':None,'eventPrefix':None,'sourceObservedInput':None},
 'tenantConformanceManifest':{'coordinate':None,'body':None,'status':'no packaged current tenant-conformance-manifest file; pending exact owned construction under separate Runtime grant, no owner called here',
   'actualSourceProductManifest':pin(T/'product-toolchain-manifest.json'),
   'capabilityDefinitionGraph':product_manifest['capabilityDefinitionGraph'],
   'publicContractCatalog':product_manifest['publicContractCatalog'],
   'modulePublications':pin(C/'final-publication-bindings.json')},
 'nativeBindings':{'workspaceAuthorityBasis':None,'workspaceBinding':None,'capabilityGrant':None,'observedFiles':None,
   'task':None,'helperAttempt':None,'verificationMaterial':None,'independentAssessmentTask':None,'independentJudgment':None,
   'preRcQualificationBasis':None,'installedRcQualificationBasis':None,'soleAF22Verdict':None},
 'futureOrder':['Root selects genuine admitted setup at exact accepted install and sufficient current frames',
   'genuine workspace.create.clean supplies actual existing A/W; caller uses stageIntoExistingWorkspace rather than mkdir on the existing root',
   'all input bytes and absent targets are checked before any write; .abio and original actual A/W are retained',
   'installed owner observes every exact protected file and constructs the current observed task; actual normalized config must match this proposed recipe or stop',
   'declared C2 GraphFunction and existing helper execute only the selected commands in the actual snapshot',
   'bind actual snapshot outputs, exact original input conservation and actual fresh Result/replay',
   'native original-producer authentication reconstructs material; no caller-created report supplies that material',
   'separately attributed current-scope assessment/J supplies semantic source fidelity, applicability and sufficiency to complete F11',
   'sole AF22 consumes that complete exact-subject F11 result; installed_rc reruns all its applicable gates separately from pre_rc_candidate',
   'AF25 output-only publication and original Product-owner human ruling/tapped release occur only under later actual lawful authority'],
 'simultaneousWorkerBoundary':'Q04 is a new unbound prospective input identity. A new actual Task must bind the actually supplied inventory and resource scope; no closed mechanical Task is relabeled or enlarged. Root conjoins only exact matching immutable subject/law/resource/source boundaries.',
 'unknownApplicability':'Roles and declared selection are input hypotheses. Admitted independent assessment determines rule/domain applicability and adequacy; no file-extension or title classification waives a rule.'})

put('first-f11-responsibility.json',{
 'kind':'unbound_first_real_F11_responsibility_input_source','status':'pending Root selection and genuine native setup; not a self_conformance_input',
 'responsibility':'evaluate complete current subject source fidelity, every selected current-law applicability/domain and sufficiency of actual observed execution; preserve every missing or unreadable dependency as non-green',
 'publicCarrier':{'F11':'graph-function://abiogenesis/qualification/self-conformance@5',
   'assessment':'graph-function://abiogenesis/qualification/assess@5','soleVerdict':'graph-function://abiogenesis/qualification/exact-candidate@5'},
 'inputSource':{'candidateAcceptance':pin(G/'rc1-c03-acceptance-01/acceptance.json'),'candidateBindings':pin(Q/'qualification-binding-plan.json'),
   'sourceInventory':inventory_coord,'completeInventoryBody':pin(Q/'qualification-inventory.json'),
   'inventoryOrigins':pin(Q/'inventory-origin-correspondence.json'),'currentLaw':law_coord,
   'currentLawBody':pin(T/'contracts/qualification/law-basis.json'),'currentCatalogBody':pin(T/'contracts/qualification/rule-catalog.json'),
   'currentCoverageBody':pin(T/'contracts/qualification/coverage.json'),'recipe':recipe_member,
   'completeProtectedInputs':pin(Q/'protected-inputs.json'),'explicitTestOracles':pin(Q/'test-selection.json'),
   'expectedOutputs':pin(Q/'expected-output-inventory.json'),'snapshotOutputPlan':pin(Q/'output-consumer-binding-plan.json'),
   'tenantConformanceManifest':'pending separately authorized owner construction from actual current Product/capability/catalog/publication sources; no packaged file exists',
   'sourceAndCopyAuthorship':'C03 source index and Q04 source inventory preserve sourceAuthor separately from copyBuildAuthor; Q04 owns new input preparation and isolated component readiness only'},
 'observedMaterial':{'status':'not provided; no executionSelection/Result/CCall/current prefix or authenticated QUAL056 material exists in this preparation',
   'coordinate':None,'actualResult':None,'admissionEventRef':None,'producer':None,'originalInputSource':None,'sourceCurrentness':None,
   'requiredActualWitnesses':['complete18 command/19 predicate populations','strict332-file lint','all8 test groups with46 exact selected leaves and no skip/todo/zero-test green',
       'complete927 generated-output equality','complete3277 original-input conservation','actual task/attempt/artifact/snapshot identity','fresh Result/replay']},
 'semanticAssessment':{'status':'unknown/unexecuted','scopeCoordinate':None,'ruleDomains':None,'resourceAssertionCoordinate':None,
   'assessmentTask':None,'actorAttribution':None,'judgment':None,'nativeAdmission':None,
   'necessaryIndependentJudgments':['source fidelity including source-vs-donor-vs-generated role separation','current governing law and whole-inventory rule applicability',
       'sufficiency of shared actual execution for all16 coverage claims and66 behaviors','each missing capability/scenario/negative is typed failed or blocked'],
   'transport':'no all-member-body model campaign is prepared or invoked; closed resource assertions must be constructed/borrowed only from exact genuinely invoking proof under separately selected authority'},
 'seededNegativesRequired':['missing authority','broken traceability','unowned public contract','design/code drift','malformed proof claim','ticket/closure mismatch','release-identity mismatch'],
 'unknownNativeSlots':['admitted actual workspace/install identities','original observed producer and CCall/Result','currentness and execution/source prefixes',
   'complete scope/domain/resource coordinates','independent actual actor/source attribution and J','F11 typed result','sole AF22 installed_rc verdict'],
 'rawMaterialSizes':raw_sizes,
 'compactRouting':'This responsibility source names immutable complete populations, recipe and missing material rather than embedding all251384737 protected-body bytes. No representation-only size reduction is asserted as native speed/memory or semantic proof.'})

put('attribution.json',{
 'activation':'T287_FINAL_QUALIFICATION_INPUTS_04','actor':'/root/rc1_c03_install_review','role':'input preparation and isolated component readiness Worker',
 'roleTransition':pin(Q/'activation.json'),'grant':pin(Q/'request.txt'),
 'sourceAuthorship':'accepted C03 final-source-members1106 rows; original constitutional/carrier/HOW authors retained',
 'copyBuildAuthorship':'/root/rc1_successor_builder selected, copied, compiled, generated, packed and installed C03; that does not confer source authorship',
 'inputAuthorship':'current Worker authored only new Q04 recipe/input/inventory/correspondence/binding/handoff data and the confined existing six-case readiness copy/receipts',
 'originalProofAuthorship':'Q02 oracles, accepted source/law component fixtures and accepted C2 snapshot consumer retain their original exact subjects/owners',
 'metadataErratum':{'immutableOriginal':pin(C/'final-attribution.json'),'acceptedAdditiveRecord':pin(G/'rc1-c03-acceptance-01/acceptance.json'),
   'correction':'the C03 six-label Root Writer attribution refers to SELECTION_03; actual declared Root source authority activation is CONTROLS_03. Source actors unchanged; candidate bytes immutable.',
   'handling':'additive disclosure only; no frozen candidate/predecessor repair'},
 'futureObservedExecutionAuthorship':None,'futureIndependentAssessmentAuthorship':None,'futureHumanOwnerRuling':None,
 'noQualificationAuthorshipAssigned':True})

groups={k:len(manifest[k])for k in ['sourceFiles','authoritySources','lawMembers','toolFiles','fixtureFiles','dependencies']}
group_bytes={k:sum(r['bytes']for r in manifest[k])for k in groups}
residuals=[
 {'gate':'genuine observed QUAL056 C2','status':'not executed; restricted network/native/provider path blocked, not waived','requires':'actual current admitted setup, selected producer/CCall/Result and helper snapshot; all commands/predicates/reports and original input conservation'},
 {'gate':'current whole installed F11 and independent J','status':'pending; separate installed mechanical discriminator is not qualification','requires':'complete current law/inventory/domain/source/resource proof, actual independent applicability/source-fidelity/sufficiency judgment and fresh semantic consumer agreement'},
 {'gate':'sole AF22','status':'no green verdict','requires':'complete admitted same-subject F11 and every applicable installed_rc gate; pre_rc_candidate evidence cannot substitute'},
 {'gate':'seeded negative matrix','status':'seven mandatory seeds unexecuted here','requires':'stable expected diagnostics and non-green dispositions under current exact subject/law'},
 {'gate':'selected installed scenario/conservation joins','status':'not established by preparation or original component test titles','requires':'same exact candidate R1-R10/ABG5-S01, operator/failure loopS02, native assessment/consequenceS03, complete selected lifecycleF17/S06, S07 and retained traversal/coverage obligations as applicable; no current artifact relabel of historical Hello/lifecycle evidence'},
 {'gate':'release','status':'unqualified/unpublished/unaccepted','requires':'output-only AF25 exact RC publication, applicable installed-RC rerun and actual original Product-owner acceptance/tapped_release; no third qualification subject'},
 {'gate':'prospective filter/report execution','status':'future observed recipe unexecuted; six existing isolated carrier cases passed once in readiness','requires':'all46 selected report leaves and no skip/todo/zero selection. If actual Node/report filtering does not reproduce the exact selected set, result stays non-green and Root selects bounded re-entry.'},
 {'gate':'old whole-F11 carrier fixture seventh case','status':'explicitly not selected','requires':'current whole C03 installed discriminator and qualification; old RC1 embedded basis cannot be crossed with current RC2 tenant law'},
 {'gate':'native performance/accounting','status':'unknown','requires':'actual whole-path memory/time, source acquisition, basis/Result/consumer/fresh-read accounting; current byte totals and old fixture timing do not prove native performance'}]
put('cost-and-residuals.json',{
 'status':'preparation_ready_subject; one isolated existing six-case component command passed; no observed QUAL056/runtime/semantic result','inputFiles':len(protected['members']),
 'inputBodyBytes':protected['bytes'],'inputGroupFiles':groups,'inputGroupBytes':group_bytes,
 'recipeFilesIncludingSelf':protected['counts']['recipeFilesIncludingSelf'],
 'qualifiedInventoryMembers':len(inventory['members']),'canonicalCurrentCandidatePaths':1936,'conservedDonorAliases':96,
 'additionalControlSupplierMembers':20,'expectedOutputBytes':sum(r['bytes']for r in read(Q/'expected-output-inventory.json')['paths']),
 'rawPreparationMaterial':raw_sizes,'futureBudgetProposal':config['supervisionProposal'],
 'newDependenciesOrTools':0,'newInstallationCopies':0,'isolatedComponentReadinessCopies':1,'actualQualificationCommands':0,'actualNativeCalls':0,
 'genuineQualificationOrSemanticAssessment':False,'residuals':residuals})


cost=read(Q/'cost-and-residuals.json')
cost['actualComponentReadiness']={'command':pin(Q/'readiness-command.json'),'receipt':pin(Q/'readiness-result.json'),'copy':pin(Q/'readiness-copy.json'),'commands':1,'selectedCases':6,'skipped':0,'todo':0,'exit':0,'elapsedSeconds':readiness['elapsedSeconds'],'copyElapsedSeconds':copied['copyElapsedSeconds'],'copiedFiles':copied['copiedFiles'],'copiedBytes':copied['copiedBytes'],'OSManagedChildrenMaxRSSBytes':readiness['directManagedChildrenMaxRSS'],'RSSLimit':'OS RUSAGE_CHILDREN on this Darwin process; no native qualification, whole-runtime, attribution or speed/memory adequacy claim','outerManagedDeadlineMs':600000,'heap':'unchanged default; NODE_OPTIONS absent','processesStopped':True}
cost['isolatedComponentOutputs']={'files':len(component['members']),'bytes':sum(r['bytes']for r in component['members']),'roles':component['counts'],'newFixtureInputBodies':0}
cost['additionalControlSupplierMembers']=20
put('cost-and-residuals.json',cost)

text=f"""Product Frame: fixed fifteen-family ABIogenesis 5.0, GOAL035/T287, current STDO2.5.1RC2. F11 whole independent conformance, sole AF22, distinct F15 subjects and actual F16 human acceptance remain required. T287_FINAL_QUALIFICATION_INPUTS_04 owns new external recipe/input preparation and one isolated existing six-case component readiness, not observed qualification.

CLOSED preparation_ready. C03 candidate freeze a4095d2a472f234d32bf063c5433b59003c536d66455ebed011ef7f7472f8d8a and its source/law/output/archive/install remain unchanged. Q03's immutable NO_GO preparation is preserved and repaired only in this new Q04 subject.

The isolated historical component has {len(component['members'])} staged outputs: {component['counts']}. Both unchanged test import and actual readQualificationCatalog URL resolve within the isolated tenant. Current C03 compiled implementation is paired there with the exact old e9aa4d0a catalog, old source and role bindings. The current qualification tenant retains bd58d739/currentRC2 law and all927 outputs. All historical bodies reuse existing102 fixtures; no additional fixture-body assets or new dependency resolution were needed.

ONE actual bounded existing six-case readiness command passed, exit0, six selected original cases, zero skip/todo, unchanged positive/negative assertions and actual cold consumer checks. Elapsed {readiness['elapsedSeconds']} s; OS managed-children maximum RSS {readiness['directManagedChildrenMaxRSS']} B is scoped cost observation only. Outer deadline600000ms and default heap remained unchanged. No retry, owner/store append, native actor/provider or semantic qualification occurred.

Complete prospective inventory {inventory['inventoryRef']} / {inventory['inventoryDigest']}, {len(inventory['members'])} members. Canonical current candidate stays1936,96 immutable donor aliases remain distinct from the12 changed derived authority bodies. Twenty control/supplier records include the preserved Q03 freeze and received NO_GO. Two additional recipe assets own the isolated component derivation; staged copies are outputs, not extra current Product members.

The unexecuted observed recipe has18commands/19predicates,8groups/46selectedtitles,332lintfiles,927currentexpectedoutputs and835isolatedcomponentoutputs. All30original Q02 oracles and6carrier/6law/4context titles are retained. The historical seventh whole-F11 case remains explicitly unselected; current whole installed F11 remains separately required. Protected inputs: {len(protected['members'])} / {protected['bytes']} B, with13recipe files including self,2313 frozen Node/npm regular files,15 recorded links and16 existing locked archives. Original-source conservation is separate from actual helper snapshot output consumption.

Every command-report body, comparison JSON, all927currentoutputs and all835componentoutputs must be read from the authenticated actual task/attempt/helper artifact snapshot. Actual fresh Public Result/replay remains required. No output fallback to original A/W is supplied. Native A/W, grants, Task, CCall, Result, currentness/prefix, original execution material, scope/resource, tenant manifest, independent J, F11, AF22 and human ruling remain explicit null/unknown slots. Preparation supplies no actual admitted result or green verdict.

Mechanical correspondence passed31checks; syntax-only and final conservation checks are recorded separately. All3275 prior Q03 protected origins and original immutable cuts remain unchanged. Writes occurred only under new Q04. Full observedQUAL056, whole-current independentF11/J, seven seeded negatives, scenario/conservation joins, AF22, publication and actual human release acceptance remain residuals. Restricted networking is not waived. All known processes and writes stop at the exact freeze. Return to Root only; no Reviewer activation.
"""
(Q/'return.md').write_text(text)
print(json.dumps({'handoff':'prepared','inventory':inventory_coord,'members':len(inventory['members']),
                  'rawSizes':{name:r['bytes']for name,r in raw_sizes.items()},'unknownNativeAndAssessmentSlotsExplicit':True}))
