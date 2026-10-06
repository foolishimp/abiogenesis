from pathlib import Path
import json,hashlib,shutil,difflib
N=Path(__file__).resolve().parent;G=N.parent;D=G/'final-observed-c2-01'
def save(name,value):
 p=N/name;p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x') as f:json.dump(value,f,indent=2);f.write('\n')
files=['driver.mjs','ordinary-caller.mjs','public-support.mjs','owner-checks.mjs','observe-process.py','launch-once.py','selected-core.json','prospective-cases.json','runtime-environment.json','budgets.json','resource-plan.json']
pre=[]
for name in files:
 p=D/name;b=p.read_bytes();q=N/'preimages'/name;q.parent.mkdir(parents=True,exist_ok=True);q.write_bytes(b);pre.append({'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'preimage':str(q.relative_to(N))})
for name in ['public-support.mjs','owner-checks.mjs','observe-process.py','launch-once.py','selected-core.json','prospective-cases.json']:shutil.copyfile(D/name,N/name)
s=(D/'driver.mjs').read_text()
def replace(a,b):
 global s
 assert s.count(a)==1,(a[:120],s.count(a));s=s.replace(a,b)
replace("import {makeOutputChecks} from './output-checks.mjs';","import {makeOutputChecks} from '../final-c2-output-consumer-repair-01/output-checks.mjs';import {checkExistingInputs,assertRetainedEnvironment} from './current-inputs.mjs';")
replace("const P=join(here,'../final-native-continuation-04'),Q=", "// FUTURE EXECUTION ONLY: this preparation grant does not authorize importing or running this driver.\nconst P=join(here,'../final-native-continuation-04'),D=join(here,'../final-observed-c2-01'),Q=")
s=s.replace('staged','reusedInputs')
replace("initial=await read(join(P,'final-handoff.json')),originalBytes=await fs.readFile(join(P,'failure-native-prefix.jsonl'))", "initial=await read(join(D,'final-handoff.json')),originalBytes=await fs.readFile(join(D,'failure-native-prefix.jsonl'))")
replace('assert.deepEqual(state.environment,retained.projection);','assertRetainedEnvironment(state.environment,retained,slots,initial.prefix);')
replace('assert.equal(physical.bytes,2582298);', 'assert.equal(physical.bytes,5577377);assert.equal(originalBytes.length,5577377);assert.equal(originalBytes.toString().trim().split("\\n").length,84);assert.equal(sha(originalBytes),physical.sha256);')
replace('90a608b3aa811c922e305a3c930d044e23d619cb1261f6cb7a0ecde748eb6cbc','e2bb5df3f58b91a49f7324a487e9e79b93d05b03c368c339c82a6edc9d359ec0')
replace('sha256:3d0b235018f49513c83fec8df1b50d1bc071750992f921ab3b748e6a70e85e3e','sha256:81cefea619af712a416d8680efa40fc2bed1f3248460022e4e625eef0ed46c0c')
replace('const bodies=[];','')
a=s.index(' for(const f of files){const target=resolve(root,f.target)');b=s.index(' const configBinding=',a)
s=s[:a]+" const existing=await checkExistingInputs(root,files,staging.targets);assert.equal(existing.count,716);reusedInputs=existing.count;await write('all716-current-input-checks.json',existing);mark('all716 existing canonical regular inputs and origins exact; zero staging writes');\n"+s[b:]
a=s.index("const archiveRoot=state.environment.workspaceBinding.roots.archiveRoot,");b=s.index('const productRoot=',a)
s=s[:a]+"const archiveRoot=state.environment.workspaceBinding.roots.archiveRoot,temporaryRoot=join(archiveRoot,'observed-c2-02-context');assert.equal(temporaryRoot,(await read(join(here,'resource-plan.json'))).futureContextRoot);await absent(temporaryRoot);const archiveStatus=await fs.lstat(archiveRoot);assert.ok(archiveStatus.isDirectory()&&!archiveStatus.isSymbolicLink());assert.equal(await fs.realpath(archiveRoot),archiveRoot);await write('context-resource-creation-intent.json',{archiveRoot,archiveAbsent:false,temporaryRoot,temporaryAbsent:true,operation:'exclusive new context directory; current invocation authority; read_context only',authority,authorization:'Requires separate future native grant covering this exact path; current preparation grant does not authorize execution'});await fs.mkdir(temporaryRoot);assert.equal(await fs.realpath(temporaryRoot),temporaryRoot);"+s[b:]
replace('before staging','before task construction')
a=s.index("const inputFactory=async({grants})=>{");b=s.index("phase='observed-task-construction';",a)
s=s[:a]+"const inputFactory=async({grants})=>{phase='current-input-recheck';assert.equal(environmentObservation?.kind,'run_environment_observed');assert.equal(grants.length,1);await write('actual-direct-grant.json',{grants,workspaceAuthorityBasis:state.environment.workspaceAuthorityBasis,workspaceBinding:state.environment.workspaceBinding});const current=await checkExistingInputs(root,files,staging.targets);assert.equal(current.count,716);await write('all716-before-task-checks.json',current);mark('existing716 rechecked under actual current grant before unchanged task constructor');"+s[b:]
replace('currentEnvironmentObservedBeforeStaging:true','currentEnvironmentObservedBeforeTask:true,stagingWrites:0')
replace('expected,workspaceRoot:root,write,mark','expected,write,mark')
replace("phase='final-conservation';for(const f of files)","phase='final-conservation';const finalInputs=await checkExistingInputs(root,files,staging.targets);assert.equal(finalInputs.count,716);await write('all716-final-input-checks.json',finalInputs);for(const f of files)")
# Drop now-unused path operators; retain dirname only if used (none).
s=s.replace("import {join,resolve,relative,isAbsolute,dirname} from 'node:path';","import {join} from 'node:path';")
(N/'driver.mjs').write_text(s)
s=(D/'ordinary-caller.mjs').read_text().replace("base='abiogenesis/t287/final-observed-c2-01'","base='abiogenesis/t287/final-c2-current-resource-caller-02'")
(N/'ordinary-caller.mjs').write_text(s)
overlay=json.loads((D/'runtime-environment.json').read_text());overlay={k:(v.replace(str(D),str(N)) if isinstance(v,str) else v) for k,v in overlay.items()};save('runtime-environment.json',overlay)
for name in ['user.npmrc','global.npmrc','global.gitconfig','system.gitconfig']:
 p=D/'config'/name;q=N/'config'/name;q.parent.mkdir(exist_ok=True);shutil.copyfile(p,q);pre.append({'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'unchangedCopy':str(q.relative_to(N))})
budgets=json.loads((D/'budgets.json').read_text());budgets['donorExecutionGrant']=budgets.pop('grant');budgets['status']='PROPOSED future execution budgets; no native authorization in this cut';budgets['currentConstructionGrant']=json.loads((N/'worker-activation.json').read_text())['grant'];save('budgets.json',budgets)
plan=json.loads((D/'resource-plan.json').read_text());plan.pop('permittedWrites');plan['history']='Same N03 A/W/install/catalog; all setup/S01 and failed C2 preserved; latest C2 84-event prefix';plan['initialPrefixSHA256']='e2bb5df3f58b91a49f7324a487e9e79b93d05b03c368c339c82a6edc9d359ec0';plan['initialBytes']=5577377;plan['initialEvents']=84;plan['currentGrantEffects']='Only construction/check/report writes under '+str(N);plan['futureContextRoot']=str(G/'final-native-setup-03/resources/archives/observed-c2-02-context');plan['futureExecutionEffects']=['Requires new Root native grant before any driver import/execution','Read existing716 files at original workspace; zero restaging or selected-input writes','Create-only exact futureContextRoot for current authority-bound renderer read_context; archiveRoot already exists','One ordinary Public start on current original resource; native append, archive/runtime/projection, transport/provider and original TMPDIR/lock effects through existing owners','Existing helper plans select new attempt archive and sandboxRoot; verification writes stay under that helper snapshot, not original workspace','Two fresh Public result/replay CLI reads with current handoffs; zero append','Caller reports/cache/config paths only under this caller directory; no donor writes'];plan['providerCondition']='DNS unresolved. Root must select actual provider readiness/current preflight and effect grant; no network probe or retry in preparation.';save('resource-plan.json',plan)
save('donor-preimages.json',pre)
changed=[]
for name in files:
 a=(D/name).read_text();b=(N/name).read_text();patch=''.join(difflib.unified_diff(a.splitlines(True),b.splitlines(True),fromfile=str((D/name).relative_to(G)),tofile=str((N/name).relative_to(G))))
 if patch:(N/(name+'.patch')).write_text(patch);changed.append(name)
save('changed-paths.json',{'modifiedDonorCopies':changed,'identicalDonorCopies':[x for x in files if x not in changed],'newHelper':'current-inputs.mjs','acceptedReader':'../final-c2-output-consumer-repair-01/output-checks.mjs','acceptedReaderChanged':False})
print(json.dumps({'constructed':files,'changed':changed}))
