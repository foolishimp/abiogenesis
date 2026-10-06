import pathlib,json,hashlib,shutil,difflib
R=pathlib.Path('/Users/jim/src/apps/abiogenesis');G=R/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE';N=G/'final-native-continuation-04';P=G/'final-native-setup-03';C=G/'final-candidate-construction-02'
def read(p):return json.loads(p.read_text())
def row(p):b=p.read_bytes();return {'path':str(p.relative_to(R)),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def save(n,v):
 with(N/n).open('x')as f:json.dump(v,f,indent=2);f.write('\n')
for d in ['preimages','config','cache']:(N/d).mkdir()
for name in ['user.npmrc','global.npmrc','global.gitconfig','system.gitconfig']:(N/'config'/name).touch(exist_ok=False)
save('selected-core.json',read(P/'selected-core.json'));save('prospective-cases.json',read(P/'prospective-cases.json'))
env=read(P/'runtime-environment.json')
for k,v in list(env.items()):
 if k!='TMPDIR' and str(P) in v:env[k]=v.replace(str(P),str(N))
assert env['TMPDIR']==str(P/'tmp');save('runtime-environment.json',env)
plan=read(P/'resource-plan.json');plan.update({'history':'Original genuine N03 resource; seven successes retained; original TMPDIR/lock preserved','permittedWrites':'New N04 territory; only five declared owner effects may append original N03 event resource and acquire/release original lock','nativeCalls':5,'device':16777230,'inode':464012478,'initialPrefixSHA256':'cb30f7630f276feab31ea3b34a432ef85c19a6ec16d5985d1beb574687cf51d8'});save('resource-plan.json',plan)
save('budgets.json',{'stages':{'conformance':600000,'hello':300000,'read':600000},'operationPlan':['conformance-hello-world','conformance-command-execution','hello-root','hello-root-run_result','hello-root-run_replay'],'nativeCapSumMs':2700000,'terminationGraceMs':1000,'allCommandGraceMs':5000,'driverBudgetMs':2705000,'purePreflightAllowanceMs':120000,'totalCeilingMs':2825000,'retry':'none','source':row(G/'final-native-continuation-controls-04/request.txt')})
donors={n:P/n for n in ['ordinary-caller.mjs','public-support.mjs','observe-process.py','launch-once.py']}
for n,p in donors.items():shutil.copyfile(p,N/'preimages'/n)
for n in ['public-support.mjs','observe-process.py']:shutil.copyfile(donors[n],N/n)
s=donors['ordinary-caller.mjs'].read_text().replace("base='abiogenesis/t287/final-native-setup-03'","base='abiogenesis/t287/final-native-continuation-04'")
s=s.replace("import {writeFileSync} from 'node:fs';","import {writeFileSync} from 'node:fs';\nimport {checkReadCall} from './owner-checks.mjs';")
s=s.replace(' async function authorized(packet,request,resources,supplied={}){',' let authorizationSequence=0;\n async function authorized(packet,request,resources,supplied={}){\n  const constructionIndex=authorizationSequence++;')
lo=s.index(' async function authorized(');hi=s.index(' async function invoke(',lo);part=s[lo:hi].replace('state.calls.length','constructionIndex');s=s[:lo]+part+s[hi:]
s=s.replace('const remaining=driverDeadline-performance.now();','const remaining=driverDeadline.deadline-performance.now();')
s=s.replace("  const stem=join(here,mode+'-'+label),resource=call.resources.eventResource", "  assert.equal(label,budgets.operationPlan[state.calls.length],'exact five-call population/order');\n  const stem=join(here,mode+'-'+label),resource=call.resources.eventResource")
start=s.index(' async function conformance(');end=s.index(' async function start(',start)
s=s[:start]+""" async function prepareConformance(programRef,label,publicationInputs){
  const publication=publicationInputs.modulePublications.find(p=>p.programs.some(p=>p.programRef===programRef)),program=publication.programs.find(p=>p.programRef===programRef),law=coord('law://abiogenesis/validator/gtl-program@5');
  const call=await authorized(r.validator.CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program,{program:coord(programRef,program),conformanceLaw:law,inventoryBasis:{kind:'declared_inventory',inventory:state.catalog.boundPublications.map(p=>coord(p.moduleRef,p)).sort((a,b)=>a.ref.localeCompare(b.ref))}},{kind:'conformance_evaluation_resource_assertion',schemaVersion,packet:{kind:'conformance_evaluate_packet',schemaVersion,memberKey:'gtl_program',publication,program},conformanceLaw:law,declaredInventory:state.catalog.boundPublications,declarationCatalog:{catalog:state.catalog,catalogView:state.catalogView}},boundSlots());
  return {label,program,call};
 }
"""+s[end:]
s=s.replace(' async function start(programRef,graphFunctionHandle,input,label,stage){',' async function prepareStart(programRef,graphFunctionHandle,input,label){').replace('return invoke(label,s.call,stage);','return s;')
needle="   reads[memberKey]=(await invoke(label+'-'+memberKey,call,'read')).receipt;"
replacement="   await checkReadCall({product,abg,call,state,verified,run,closed,grants,write,label:label+'-'+memberKey});\n"+needle
assert needle in s;s=s.replace(needle,replacement).replace('authorized,invoke,conformance,start,freshReads','authorized,invoke,prepareConformance,prepareStart,freshReads')
(N/'ordinary-caller.mjs').write_text(s)
s=donors['launch-once.py'].read_text().replace('6912000','2705000').replace('7032000','2825000').replace('7031000','2824000').replace("N.glob('setup-*-process-start.json')","N.glob('continue-*-process-start.json')")
(N/'launch-once.py').write_text(s)
save('donor-preimages.json',[{'original':row(p),'preserved':row(N/'preimages'/n)} for n,p in donors.items()])
patch=''.join(''.join(difflib.unified_diff((N/'preimages'/n).read_text().splitlines(True),(N/n).read_text().splitlines(True),fromfile=str(p.relative_to(R)),tofile=str((N/n).relative_to(R)))) for n,p in donors.items())
(N/'donor-control-deltas.patch').write_text(patch)
sourceRows=[];S=C/'source-freeze/repo';ranges={'build_tenants/abiogenesis/typescript/code/src/validator/conformance_definition_bindings.ts':[[72,81],[225,445]],'build_tenants/abiogenesis/typescript/code/src/product/admission_authority.ts':[[186,205],[296,343]],'build_tenants/abiogenesis/typescript/code/src/owner_bindings/run_invocation.ts':[[137,143],[1100,1121],[1237,1330],[1929,1941]],'build_tenants/abiogenesis/typescript/code/src/product/run_invocation_operation.ts':[[68,76],[400,635]],'build_tenants/abiogenesis/typescript/code/src/product/stdo_environment.ts':[[218,230]],'build_tenants/abiogenesis/typescript/code/src/abg/project_read_definition_bindings.ts':[[90,113],[575,752],[875,886]],'build_tenants/abiogenesis/typescript/code/src/shared/static_definition_bindings.ts':[[109,145]]}
for path,rs in ranges.items():
 p=S/path;lines=p.read_text().splitlines();sourceRows.append({'logicalRepositoryPath':path,'frozenSource':row(p),'ranges':[{'lines':[a,b],'excerpt':'\n'.join(f'{i+1}: {lines[i]}'for i in range(a-1,min(b,len(lines))))}for a,b in rs]})
save('owner-source-relations.json',sourceRows)
save('construction-attribution.json',{'actualActor':'/root/s03_phase_b','sessionId':'01a0f036-c7b5-7f40-b1d8-e53a1fcf24f4','profile':'Astra/xhigh assigned; not independently stated by session metadata','grant':row(G/'final-native-continuation-controls-04/request.txt'),'inheritedDonors':'donor-preimages.json','changes':['Remove surplus artifactTruth from shared conformance resources','Separate actual authorization construction ordinal from successful native-call count, permitting both real conformance calls to be checked before either runs','Prepare actual start separately for full exported wrapper predicate and existing pure Product owner preparation','Check genuine source/prefix/slots/resource on each fresh read just before invocation','Preserve old actor/resource/TMPDIR; new controls/approval provenance in N04','Exactly5 ordered calls and finite budgets'],'proofScope':'Actual owner construction/precondition checks plus subsequently observed native semantics; no guessed future Run or handoff','immutableInputs':[row(p) for p in [P/'freeze.json',P/'runtime-slots.json',P/'retained-environment.json',P/'final-handoff.json',C/'freeze.json',G/'final-f11-session-correspondence-03/s03_phase_b-session-metadata.json']]})
print('N04 corrected caller and exact5-call controls constructed; no native effect')
