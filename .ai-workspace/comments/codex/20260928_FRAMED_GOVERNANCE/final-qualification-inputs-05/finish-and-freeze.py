"""Q05 final pure readbacks, syntax checks, derivative plans and one CLOSED freeze."""
from pathlib import Path
import ast,base64,datetime,hashlib,json,os,resource,stat,subprocess,time
R=Path('/Users/jim/src/apps/abiogenesis');G=R/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE'
Q=Path(__file__).resolve().parent;C=G/'final-candidate-construction-04';OLD=G/'final-qualification-inputs-04'
TR='build_tenants/abiogenesis/typescript/';T=C/'final-stage'/TR
assert Q==G/'final-qualification-inputs-05'and not (Q/'freeze.json').exists()
def read(p):return json.loads(Path(p).read_bytes())
def sha(p):
 with Path(p).open('rb')as f:return hashlib.file_digest(f,'sha256').hexdigest()
def pin(p):
 p=Path(p);return {'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p),'mode':stat.S_IMODE(p.stat().st_mode)}
def put(n,v):
 with(Q/n).open('x')as f:json.dump(v,f,indent=2,ensure_ascii=False);f.write('\n')
def same(a,b):assert a==b,(a,b)
checks=[]
def check(label):checks.append(label)
inventory=read(Q/'qualification-inventory.json');origins=read(Q/'inventory-origin-correspondence.json')
origin_map={v['ref']:v for v in origins};same(len(origin_map),len(origins));same(len(origins),len(inventory['members']))
for m in inventory['members']:
 o=origin_map[m['ref']];p=Path(o['origin']);a=pin(p)
 same((a['sha256'],a['bytes'],a['mode']),(o['sha256'],o['bytes'],o['mode']))
 same((m['path'],m['digest'],m['byteCount']),(o['path'],'sha256:'+a['sha256'],a['bytes']))
check('every final qualification member joins its actual original body/bytes/mode and explicit origin role')
same(len(inventory['members']),4604)
for root in inventory['selectedRoots']:assert any(m['ref'].startswith(root)for m in inventory['members'])
check('all selected roots are represented; exact18 inherited controls retained as historical only')
manifest=read(Q/'input-manifest.json');protected=read(Q/'protected-inputs.json')
for v in protected['members']:
 a=pin(v['origin']);same((a['sha256'],a['bytes'],a['mode']),(v['sha256'],v['bytes'],v.get('sourceMode',v['mode'])))
 a=pin(Q/'mechanical-worksite'/v['target']);same((a['sha256'],a['bytes'],a['mode']),(v['sha256'],v['bytes'],v['mode']))
check('all3281 actual protected originals and mechanical copies are conserved after readiness')
for v in manifest['dependencies']:
 body=Path(v['origin']).read_bytes();same('sha512-'+base64.b64encode(hashlib.sha512(body).digest()).decode(),v['integrity'])
same(len(manifest['dependencies']),16);check('all16 inherited archive SHA512 SRI values match actual bodies')
links=read(Q/'toolchain-links.json')
for v in links:same(Path(v['origin']).is_symlink(),True);same(Path(v['origin']).readlink().as_posix(),v['target'])
same(len(links),15);check('all15 inherited recorded tool links remain exact and separate from regular observations')
for v in read(Q/'source-inventory.json')+read(Q/'donor-authority-preimages.json'):
 a=pin(v['origin']);same((a['sha256'],a['bytes'],a['mode']),(v['sha256'],v['bytes'],v['mode']))
check('all1936 current effective source/generated bodies and96 construction preimages remain distinct and conserved')
for v in read(Q/'expected-output-inventory.json')['paths']:
 a=pin(T/v['path']);same((a['sha256'],a['bytes']),(v['sha256'],v['bytes']))
check('all927 expected outputs derive from exact C04 stage including unchanged default library standard')
old_plan=read(OLD/'component-stage-plan.json');plan=read(Q/'component-stage-plan.json')
same(len(plan['members']),835)
same([(v['destination'],v['bytes'],v['sha256'])for v in plan['members']],[(v['destination'],v['bytes'],v['sha256'])for v in old_plan['members']])
for v in plan['members']:
 a=pin(OLD/'readiness/copied-tenant'/v['destination']);same((a['sha256'],a['bytes']),(v['sha256'],v['bytes']))
check('all835 historical component bodies exactly retain Q04 preimages; no C04 six-case run claimed')
for n in ['readiness-result.json','readiness-copy.json','readiness-command.json']:
 same(sha(Q/'historical-q04'/n),sha(OLD/n))
check('all three original six-case historical readiness receipts retained without relabel or rerun')
same(sha(C/'final-freeze.json'),'2e3d89145eb35f7280625175144cd79c34440a14b398a68b953b6fe1453a8df5')
same(sha(OLD/'freeze.json'),'2296636418d8851ed2ce61932fb9be64eccecc41e445e61c1052e10745cbad97')
check('exact C04 and Q04 immutable cuts remain unchanged')
put('final-origin-and-population-checks.json',{'kind':'actual_final_read_only_population_correspondence','passed':True,
 'checks':checks,'inventoryMembers':len(inventory['members']),'protectedInputs':protected['total'],
 'historicalComponentReadinessRepeated':False,'actualQualificationCommandsExecuted':0,'outsideTerritoryMutations':0})

# Only current external adapter syntax and final pure relation readback; no Runtime owner.
node=G/'final-candidate-construction-03/source-freeze/toolchain/bin/node'
same(sha(node),'fe1c0128a4c0163b034ec06b8b290494830ccb49922b5ce9ca4edf497a083e5f')
environment={'PATH':str(node.parent)+':/usr/bin:/bin:/usr/sbin:/sbin','HOME':str(Q/'home'),'TMPDIR':str(Q/'tmp'),'LANG':'C','LC_ALL':'C'}
syntax_names=['f11/scope-authoring.mjs','f11/current-resources.mjs','f11/ordinary-caller.mjs','f11/flow-driver.mjs','f11/proof-oracles.mjs','f11/setup-driver.mjs','f11/public-outcomes.mjs']
commands=[{'purpose':'pure final complete inventory/task/recipe readback','args':[str(Q/'final-readback.mjs')]}]
commands +=[{'purpose':'syntax only; no module execution','args':['--check',str(Q/n)]}for n in syntax_names]
receipts=[]
for i,c in enumerate(commands):
 begin=time.monotonic();out=Q/f'final-readback-{i:02d}.stdout';err=Q/f'final-readback-{i:02d}.stderr'
 with out.open('xb')as so,err.open('xb')as se:
  result=subprocess.run([str(node),*c['args']],cwd=Q,env=environment,stdin=subprocess.DEVNULL,stdout=so,stderr=se,timeout=30000)
 receipt={**c,'ordinal':i,'executable':str(node),'cwd':str(Q),'exitStatus':result.returncode,'elapsedMs':1000*(time.monotonic()-begin),'timeoutMs':30000,'stdout':pin(out),'stderr':pin(err)}
 receipts.append(receipt)
 if result.returncode!=0:
  put('final-readback-command-receipts.json',{'receipts':receipts,'qualificationCommandsExecuted':0});raise SystemExit(2)
for p in list(Q.glob('*.py'))+[Q/'f11/observe-process.py']:ast.parse(p.read_bytes(),str(p))
usage=resource.getrusage(resource.RUSAGE_CHILDREN)
put('final-readback-command-receipts.json',{'kind':'final_pure_readback_and_syntax_receipts','environment':environment,
 'NODE_OPTIONS':None,'heapOverride':None,'receipts':receipts,'qualificationCommandsExecuted':0,
 'moduleExecutionCommands':1,'syntaxOnlyCommands':len(syntax_names),'ownerConstructorCalls':0,'actualNewFileObservations':0,
 'childrenMaxRSSBytesMacOS':usage.ru_maxrss,'childrenUserSeconds':usage.ru_utime,'childrenSystemSeconds':usage.ru_stime})
final_join=read(Q/'final-current-recipe-correspondence.json');same(final_join['inventory']['digest'],inventory['inventoryDigest'])
readiness=read(Q/'readiness-result.json');same(readiness['workResult'],'GO_MECHANICAL_ONLY');same(readiness['taskDigest'],final_join['task']['digest'])
check('complete actual C04 Task retained; final4604-member inventory and actual recipe bodies match it without constructor/observation repetition')

candidate=read(Q/'candidate-binding.json');law=read(T/'contracts/qualification/law-basis.json');catalog=read(T/'contracts/qualification/rule-catalog.json');coverage=read(T/'contracts/qualification/coverage.json')
coord={'ref':inventory['inventoryRef'],'digest':inventory['inventoryDigest']}
authority={'ref':law['lawBasisRef'],'digest':law['lawBasisDigest']}
put('authority-correspondence.json',{'kind':'same_C04_exact_authority_source_output_binding','candidate':candidate,
 'lawBasis':authority,'catalog':{'ref':catalog['catalogRef'],'digest':law['catalog']['digest'],'sources':len(catalog['sources']),'rules':len(catalog['rules'])},
 'coverage':{'ref':coverage['catalogRef'],'digest':coverage['catalogDigest'],'claims':len(coverage['claims']),'behaviors':sum(len(c['behaviors'])for c in coverage['claims'])},
 'selectedSourcePreimages':1106,'effectiveCanonicalSourceAndGenerated':1936,'generated':926,'derivedAuthorityAliases':96,'changedDerivedBodies':12,
 'sourceAuthorship':'exact C04 source1106 rows retained; original source authors distinct from copy/build author and Q05 preparer',
 'protectedSourceAuthority':pin(Q/'input-manifest.json'),'defaultLibrary':'exact unchanged declared RC1 substrate, separate from governing RC2',
 'historicalComponent':{'bodies':835,'currentCatalogSHA256':plan['currentCatalogSHA256'],'historicalCatalogSHA256':plan['historicalCatalogSHA256'],
  'oneExplicitHistoricalCompiledPreimage':True,'sixCaseReceipt':pin(Q/'historical-q04/readiness-result.json'),'currentC04Execution':False},
 'currentCandidateDispatch':False,'C05':'Root selected successor separately; no C05 data or identity bound here'})
put('output-consumer-binding-plan.json',{'kind':'future_actual_three_population_snapshot_plan','reader':pin(Q/'output-checks.mjs'),
 'currentOutputs':{'descriptor':pin(Q/'expected-output-inventory.json'),'count':927,'origin':'exact C04 stage'},
 'historicalComponentOutputs':{'descriptor':pin(Q/'component-stage-plan.json'),'count':835,'origin':'exact historical Q04 bodies; one C03 compiled fixture preimage'},
 'protectedInputs':{'descriptor':pin(Q/'protected-inputs.json'),'count':3281,'root':'actual original admitted A/W; separate from actual helper snapshot root'},
 'requiredRelations':['actual installed task/observation/attempt/helper-plan/helper-artifact/archive/snapshotRoot guards before output read',
  'all command/report bodies and current927 plus historical835 output bodies read only from actual authenticated helper snapshot',
  'every original protected body/mode conserved separately before/after; actual helper protectedBefore/After and task population exact',
  'actual fresh Public Result/replay and typed producer agree; no original-root fallback'],
 'actualTask':None,'actualAttempt':None,'actualHelperArtifact':None,'actualSnapshotRoot':None,'actualObservation':None,
 'freshResult':None,'freshReplay':None,'mechanicalUnitTask':pin(Q/'complete-observed-task.json'),'mechanicalUnitIsRuntime':False})
put('qualification-binding-plan.json',{'kind':'exact_C04_Q05_preparation_binding','status':'mechanical preparation only; actual Runtime bindings unknown',
 'candidate':candidate,'sourceInventory':coord,'lawBasis':authority,'coverage':{'ref':coverage['catalogRef'],'digest':coverage['catalogDigest']},
 'currentRecipe':pin(Q/'verification-recipe.json'),'currentConfiguration':pin(Q/'config.json'),'completeCurrentCorrespondence':pin(Q/'final-current-recipe-correspondence.json'),
 'mechanicalUnitTask':pin(Q/'complete-observed-task.json'),'mechanicalUnitCoordinates':pin(Q/'unit-coordinates.json'),
 'actualAdmittedA':None,'actualAdmittedW':None,'actualGrant':None,'actualTask':None,'actualProducer':None,'actualResult':None,
 'actualVerificationMaterial':None,'actualScope':None,'actualResourceAssertion':None,'actualSourceAuthentication':None,'actualAssessmentTask':None,
 'actualJ':None,'actualF11':None,'soleAF22':None,'humanOwnerAcceptance':None,'C05Binding':None,
 'successor':'C05 source/artifact/install/law/catalog/recipe/body/inventory/currentness joins require a new separately selected data binding; do not relabel this C04 subject',
 'resourceConstruction':pin(Q/'f11/current-resources.mjs'),'scopeAuthoring':pin(Q/'f11/scope-authoring.mjs'),
 'scopeOwner':'external authorer constructs exact assertion bytes only; actual installed owner validates complete current scope/material/correspondence',
 'tenantManifest':None,'actualActorAttribution':None,'independence':None})
put('first-f11-responsibility.json',{'kind':'bounded_future_same_subject_F11_responsibility','status':'unexecuted; C04 preparation only',
 'candidate':pin(Q/'candidate-binding.json'),'inventory':coord,'currentLaw':authority,'recipe':pin(Q/'verification-recipe.json'),
 'contextPlan':pin(Q/'f11-context-selection-plan.json'),'resourceConstructor':pin(Q/'f11/current-resources.mjs'),
 'parentChildFlow':pin(Q/'f11/flow-driver.mjs'),'proofOracles':pin(Q/'f11/proof-oracles.mjs'),'publicOutcomeReader':pin(Q/'f11/public-outcomes.mjs'),
 'requiredWholePath':'unchanged actual selected wrapper parent -> current core assessment child -> admitted compact J -> ordinary foldback/parent closure -> two actual fresh reads -> fresh F11 -> soleAF22',
 'rootOnlyFallback':False,'observedMaterial':None,'sourceAuthenticity':None,'actualContextOrDomains':None,'independentApplicability':None,
 'wholeCoverage':'16claims/66behaviors remain required with current-law applicability; selected46 test titles and mechanical carrier transport cannot supply missing semantic coverage',
 'controlledRawFixture':'all criteria remain indeterminate/unknown, wholeF11 and soleAF22 non-green, no green qualification manufactured',
 'publicOutcomes':['result exit0','typed refusal/not_ready exit1','nonterminal exit3','host failure exit70','transport refusal exit2'],
 'wholeQualification':False,'currentSourceChanges':'C04 exact4 changes only; later C05 work excluded'})
put('cost-and-residuals.json',{'kind':'actual_Q05_preparation_cost_and_sufficiency_limits','currentCandidate':'C04','inventory':coord,
 'protectedInputs':3281,'protectedBodyBytes':protected['bytes'],'qualificationInventoryMembers':4604,
 'versionAndOneConstructorDriver':read(Q/'command-receipts.json'),'finalPureReadbackAndSyntax':read(Q/'final-readback-command-receipts.json'),
 'totalNodeProcesses':2+len(receipts),'qualificationCommandsExecuted':0,'historicalTestsExecuted':0,'source38plus11TestsExecuted':0,
 'actualNativeRuntimeProviderCalls':0,'ProductMutation':False,'defaultHeap':True,'actualNativePerformance':'unknown; mechanical copied-file/readback RSS does not prove F11 performance',
 'initialCompleteOwnerTaskReadiness':pin(Q/'readiness-result.json'),'finalCompleteInventoryCorrespondence':pin(Q/'final-current-recipe-correspondence.json'),
 'historicalQ04SixCaseReadiness':pin(Q/'historical-q04/readiness-result.json'),
 'nearestNegatives':{'taskConfigBodyTool':11,'externalAuthorer':2,'allRefused':True,'newNativeQualificationCases':0},
 'residuals':['actual A/W/install/grant/Task/producer admission/currentness prefix','actual original source-authenticated verification material and helper snapshot',
  'actual current complete scope/domains/resource/tenant manifest/context/actor/source attribution and independence',
  'actual wrapper child/J/ordinary foldback/parent closure and fresh cold Result/replay','whole16claim66behavior F11 and soleAF22 non-green mechanical result then independent complete qualification',
  'seven mandatory seeded negative matrix and every required installed scenario/conservation join',
  'distinct pre_rc_candidate/installed_rc gates, output-only release publication and actual human owner acceptance',
  'Root-selected C05 successor exact data rebinding is required before any current-candidate continuation'],
 'stop':'all writes/processes stop at one freeze; Root alone conjoins and selects subsequent actors'})
put('worker-result.json',{'status':'CLOSED','workResult':'GO_PREPARATION_C04_ONLY','activation':'T287_FINAL_QUALIFICATION_INPUTS_05',
 'role':'Worker','actor':'/root/q03_input_review','candidateFreeze':candidate['constructionFreeze'],'inventory':coord,
 'inventoryMembers':4604,'protectedInputs':3281,'protectedBytes':protected['bytes'],'task':final_join['task'],
 'currentRecipeBodyInventoryConfigurationCorrespondence':True,'taskConfigurationGuardPassed':True,'nearestNegativesRefused':13,
 'externalScopeAuthorer':'exact historical fixture normalization preserves complete domains; actual current owned validation unknown',
 'RuntimeAdmission':False,'qualificationMaterial':None,'semanticAssessment':None,'C05Binding':None,
 'finalJoin':pin(Q/'final-current-recipe-correspondence.json'),'costAndResiduals':pin(Q/'cost-and-residuals.json'),
 'stop':'one exact CLOSED subject; Root alone selects independent assurance or separately bound successor preparation; no Worker Reviewer loop'})
with(Q/'return.md').open('x')as f:f.write(f'''Product Frame: fixed15 ABIogenesis5.0, GOAL035/T287, exact STDO2.5.1RC2. F01/F05/F13 source-blind verified Product/Native/publication, F11 complete independent qualification, soleAF22, distinct F15 subjects and F16 actual human acceptance remain required. GTL declares, HoG traverses, existing owners effect, ABG alone admits, replay projects. This Worker owns only external mechanical preparation.

CLOSED GO_PREPARATION_C04_ONLY. Exact accepted C04 freeze {candidate['constructionFreeze']['sha256']}. Final inventory {inventory['inventoryRef']} / {inventory['inventoryDigest']},4604 members. Source1106 preimages,1936 effective source/generated members,926 generated entries and96 conserved authority preimages remain distinct;12 derived aliases differ. All927 expected outputs derive from C04, including the unchanged default-library standard. Original C04/C03/Q04 and caller cuts remain immutable.

The actual complete C04 published owner constructed18commands/19predicates over3281 observed files,{protected['bytes']} B. Actual recipe self/body, source/auxiliary/protected member and producer-canonical configuration digests match the exact final inventory. The initial driver receipt is preserved; final readback retains the same actual Task while binding18 inherited historical control bodies and the corrected reusable projector. No constructor or file observation was repeated. Task {final_join['task']['digest']}. All11 command/configuration/body/tool negatives refused.

All835 historical Q04 component bodies are conserved. One C03 declaration_exports.js is an explicit historical fixture preimage. Q04's one passed six-case readiness and its original receipts remain historical; no C04 six-case execution is claimed. The original18/19 recipe meanings,8groups/46titles and332 lint files remain unchanged; zero qualification commands or historical/source38+11 tests ran.

Reusable future caller preparation supplies the complete Public outcome sum, exact six-key conformance resources without artifactTruth, actual selected wrapper-parent/assessment-child/J/foldback/parent-closure/freshF11/soleAF22 flow, three-population authenticated snapshot reader, and an external resource-HOW section2 scope/reference-set authorer using published constructQualificationIdentity. The authorer conserved every ordered relation of the exact historical fixture:187 rule domains,42 global groups,517 reference sets; two nearest authoring negatives refused. It creates assertion data, no semantic owner or runtime truth. No current scope/material/J is inferred from that fixture.

Actual admitted A/W/install/grant/Task/producer/material/source-authentication/context/domains/tenant-manifest/resource/actor-independence/J/F11/AF22 remain unknown. The mechanical unit's opaque admission-shaped coordinates are explicitly unit-only. Unprovided coverage stays unknown; controlled carrier criteria stay indeterminate and future wholeF11/AF22 must remain non-green. C05 successor data is not bound, dispatched, reviewed, or relabeled here. Root separately selects exact successor rebinding.

One complete constructor driver plus pinned tool version, one final pure correspondence readback and seven syntax-only checks:10 Node processes, no provider/network/Git/Runtime effects, default heap. Constructor driver10.44s; OS managed-child maximum RSS1,243,250,688B is mechanical cost only. Current native whole-path performance is unknown. All actual origin/body/mode,16 archive SHA512 SRI,15 tool-link, source/derived/component and final-cut readbacks passed. All effects stop at this exact freeze and return to Root.
''')

# Freeze every actual new body/mode and directory; no file is written afterward.
records=[];directories=[]
for p in sorted(Q.rglob('*')):
 if p.is_symlink():raise AssertionError('unexpected Q05 report alias '+str(p))
 if p.is_dir():directories.append({'path':str(p.relative_to(Q)),'mode':stat.S_IMODE(p.stat().st_mode)})
 elif p.is_file():a=pin(p);a['path']=str(p.relative_to(Q));records.append(a)
 else:raise AssertionError('unexpected Q05 object '+str(p))
freeze={'status':'CLOSED','workResult':'GO_PREPARATION_C04_ONLY','activation':'T287_FINAL_QUALIFICATION_INPUTS_05',
 'role':'Worker','actor':'/root/q03_input_review','frozenAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'candidateFreezeSHA256':candidate['constructionFreeze']['sha256'],'inventory':coord,'recordCount':len(records),
 'recordBytes':sum(v['bytes']for v in records),'directoryCount':len(directories),'records':records,'directories':directories,
 'mechanicalTask':final_join['task'],'qualificationCommandsExecuted':0,'RuntimeAdmission':False,'C05Binding':None,
 'stop':'no writes or processes after this CLOSED freeze; Root alone conjoins and selects next action'}
put('freeze.json',freeze);os.chmod(Q/'freeze.json',0o444)
print(json.dumps({'freeze':pin(Q/'freeze.json'),'records':len(records),'recordBytes':freeze['recordBytes'],
 'directories':len(directories),'inventoryMembers':len(inventory['members']),'protectedInputs':protected['total'],'workResult':freeze['workResult']}))
