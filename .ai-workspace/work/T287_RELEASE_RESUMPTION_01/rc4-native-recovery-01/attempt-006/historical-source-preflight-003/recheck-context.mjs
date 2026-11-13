// Prepared Writer artifact. Root alone may execute after exact packet review.
// Pure-owner recheck after exact empty-directory cleanup; no Public read, Run or C2 execution.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFile,writeFile,mkdir,lstat,realpath,readdir} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {tmpdir} from 'node:os';
const dir=fileURLToPath(new URL('.',import.meta.url));
const [manifestHash]=process.argv.slice(2);
assert(process.argv.length===3&&/^[a-f0-9]{64}$/u.test(manifestHash),'usage: node recheck-context.mjs MANIFEST_SHA256');
for(const key of Object.keys(process.env))if(/CLAUDE|ANTHROPIC|OPENAI|AZURE_OPENAI|PROVIDER/iu.test(key))delete process.env[key];
delete process.env.NPM_CONFIG_CACHE;
const sha=b=>createHash('sha256').update(b).digest('hex');
const readJson=async p=>JSON.parse(await readFile(p,'utf8'));
async function pin(path){const a=await lstat(path);assert(a.isFile()&&!a.isSymbolicLink(),path);const h=createHash('sha256');let bytes=0;for await(const b of createReadStream(path)){h.update(b);bytes+=b.length;}const z=await lstat(path);assert.equal(a.dev,z.dev);assert.equal(a.ino,z.ino);assert.equal(a.size,bytes);assert.equal(a.mtimeMs,z.mtimeMs);assert.equal(a.ctimeMs,z.ctimeMs);return{path,bytes,sha256:h.digest('hex')};}
async function verify(r){assert.deepEqual(await pin(r.path),r,r.path);}
async function absent(path){try{await lstat(path);return false;}catch(e){if(e.code==='ENOENT')return true;throw e;}}
async function record(name,value){const path=join(dir,name);await mkdir(dirname(path),{recursive:true});await writeFile(path,JSON.stringify(value,null,2)+'\n',{flag:'wx',mode:0o600});}
const manifestBytes=await readFile(join(dir,'MANIFEST.json'));assert.equal(sha(manifestBytes),manifestHash);
const m=JSON.parse(manifestBytes);assert.equal(m.status,'PREPARED_FOR_ROOT_REVIEW_NO_EXECUTION');for(const r of m.files)await verify(r);
const s=await readJson(m.selection.path),prior=s.guard;
const resume=await readJson(s.currentResume.path),historicalRaw=await readJson(s.historicalSource.path),governanceSource=await readJson(s.governanceSource.path);
assert.equal(await realpath(process.execPath),prior.node.path);
process.env.TMPDIR=prior.runtimeTmp.path;assert.equal(tmpdir(),prior.runtimeTmp.path);
assert.equal(await realpath(prior.runtimeTmp.path),prior.runtimeTmp.path);
const tmp=await lstat(prior.runtimeTmp.path);assert(tmp.isDirectory()&&!tmp.isSymbolicLink());assert.equal(tmp.dev,prior.runtimeTmp.device);assert.equal(tmp.ino,prior.runtimeTmp.inode);assert.equal(tmp.uid,prior.runtimeTmp.uid);
const within=(a,b)=>a===b||a.startsWith(b+'/');assert(![prior.worksite,...prior.protectedRoots,...prior.nativeWritableRoots].some(r=>within(prior.runtimeTmp.path,r)||within(r,prior.runtimeTmp.path)));
assert.equal(execFileSync('/usr/bin/git',['-C',prior.worksite,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),prior.sourceCommit);
assert.equal(execFileSync('/usr/bin/git',['-C',prior.worksite,'rev-parse','HEAD^{tree}'],{encoding:'utf8'}).trim(),prior.sourceTree);
assert.equal(execFileSync('/usr/bin/git',['-C',prior.worksite,'status','--short','--untracked-files=no'],{encoding:'utf8'}),'');
async function preservation(){const log=await lstat(prior.currentLog.path);assert.equal(log.dev,prior.currentLog.device);assert.equal(log.ino,prior.currentLog.inode);await verify({path:prior.currentLog.path,bytes:prior.currentLog.bytes,sha256:prior.currentLog.sha256});await verify(prior.builderArtifact);await verify(prior.installedInventory);const inventory=await readJson(prior.installedInventory.path);assert.equal(inventory.members,5321);assert.equal(await realpath(prior.installedRoot),prior.installedRoot);for(const r of inventory.inventory)await verify({path:join(prior.installedRoot,r.path),bytes:r.bytes,sha256:r.digest.slice(7)});for(const r of prior.otherInstalledFiles)await verify(r);for(const r of m.files)await verify(r);return{eventLogUnchanged:true,installedUnchanged:true,pinnedInputsUnchanged:true,providerCalls:0,RunAdmissions:0};}
function quiescence(){for(const pid of prior.knownStoppedPids){try{process.kill(pid,0);throw Error('Previous actor is live: '+pid);}catch(e){if(e.code!=='ESRCH')throw e;}}const rows=execFileSync('/bin/ps',['-axo','pid=,command='],{encoding:'utf8'}).split('\n');assert.equal(rows.filter(r=>r.includes(prior.worksite)||r.includes(join(prior.installedRoot,'build/code/src/public/cli.js'))).length,0,'Worksite/installed CLI process present');}
const leaf=await lstat(s.existingLeafTmp.path);assert(leaf.isDirectory()&&!leaf.isSymbolicLink());assert.equal(leaf.dev,s.existingLeafTmp.device);assert.equal(leaf.ino,s.existingLeafTmp.inode);assert.deepEqual(await readdir(s.existingLeafTmp.path),[]);assert.equal(await realpath(s.existingLeafTmp.path),s.existingLeafTmp.path);
for(const row of s.removedDirectories)assert(await absent(row.path),'Operator-created directory reappeared');
assert.equal(resume.installedRoot,prior.installedRoot);assert.equal(resume.state.closeHandoff.prefix.prefixLength,prior.currentLog.bytes);assert.equal(resume.state.closeHandoff.prefix.prefixDigest,'sha256:'+prior.currentLog.sha256);
assert(await absent(join(dir,'STARTED.json')),'One-shot acquisition already attempted');
await preservation();quiescence();assert(await absent(prior.runtimeTmp.lockPath),'Ordinary runtime lock is present');
await record('STARTED.json',{at:new Date().toISOString(),operator:'Root',pid:process.pid,manifestSha256:manifestHash,sourceCommit:prior.sourceCommit,providerCalls:0,RunAdmissions:0});
let failure=null;
try{
 const {installedModules}=await import(pathToFileURL(prior.operatorClosure[0].path).href);
 const {product}=await installedModules(prior.installedRoot),owner=name=>import(pathToFileURL(join(prior.installedRoot,'build/code/src',name+'.js')).href);
 const worksiteEffectOwner=await owner('product/worksite_effect');
 const prefixOwner=await owner('abg/event_prefix'),eventStore=await owner('abg/event_store'),readOwner=await owner('abg/project_read_ports'),executionOwner=await owner('abg/invocation_execution_truth'),assemblyOwner=await owner('abg/execution_basis'),terminalOwner=await owner('abg/terminal_result_contracts'),admitOwner=await owner('shared/admit/index'),declarationOwner=await owner('product/declaration_closure');
 const checked=admitOwner.admitContract(terminalOwner.ABG_HISTORICAL_GRAPH_CALL_SOURCE_RESOURCE_SCHEMA,historicalRaw);assert.equal(checked.kind,'ok');const immutable=admitOwner.admitJson(checked.value);assert.equal(immutable.kind,'ok');const historicalSource=immutable.value,current=resume.state.closeHandoff.prefix;
 const projected=readOwner.projectHistoricalGraphCallSourceAtDurablePrefix(current,historicalSource);assert(projected!==null,'Retained historical source no longer projects');assert.equal(projected.terminalResult.result.ref,s.nativeResultRef);const sourceAfter=projected.terminalResult.value.after;assert.equal(sourceAfter.observationDigest,s.sourceAfterDigest);
 const {catalog,catalogView}=historicalSource.declarationProof;
 const cut=eventStore.durableRuntimeEventPrefixThroughEvent(current,s.failedOccurrence.fibreEventRef),historical=prefixOwner.readOwnedRuntimeEventPrefixAtDurablePrefix(cut);
 const execution=executionOwner.projectExactExecutionBasisAtPrefix(historical,s.failedOccurrence.executionBasisRef);assert(execution!==null);
 const invocation=executionOwner.projectExactInvocationAdmissionAtPrefix(historical,execution.invocationAdmissionRef);assert(invocation!==null);assert.equal(invocation.catalogBasisDigest,catalog.basisDigest);assert.equal(invocation.catalogViewDigest,catalogView.viewDigest);
 const closure=declarationOwner.resolveExecutionDeclarationClosure(catalog,catalogView,invocation.programRef,invocation.graphFunctionRef);assert.equal(closure.kind,'resolved_execution_declaration_closure');
 const declarations=closure.publications.flatMap(p=>p.graphFunctions),graphs=declarations.filter(g=>g.name===execution.graphFunctionRef&&product.sha256Canonical(g)===execution.graphFunctionDigest);assert.equal(graphs.length,1);
 const graphFunction=graphs[0],materializer=await owner('gtl/materialize'),cursorOwner=await owner('abg/traversal_cursor'),callOwner=await owner('abg/c_call');
 const graph=materializer.materializeGraph(graphFunction,{invocationAdmissionRef:execution.invocationAdmissionRef,admittedInputRef:execution.rawInputAdmissionRef,admittedInputDigest:execution.rawInputDigest,admittedInput:execution.rawInputValue});
 const opened=callOwner.projectOpenedCCallCarrierAtPrefix(historical,graph,s.failedOccurrence.cCallRef);assert(opened!==null);assert.equal(opened.openedEventRef,s.failedOccurrence.openedEventRef);
 const origin=cursorOwner.projectOpenedCCallTraversalInputAtPrefix(historical,graph,s.failedOccurrence.cCallRef);assert(origin!==null);assert.deepEqual(origin.execution,execution);assert.equal(callOwner.projectCCallCarrierPhaseAtPrefix(historical,opened)?.phase,'selected_no_evidence');
 const basis=assemblyOwner.constructNativeInstructionAssemblyBasis({publication:closure.programPublication,graph,graphFunction,declarationGraphFunctions:declarations,executionBasis:execution,cCall:opened,cursor:origin.cursor,predecessorPrefix:cut});assert(basis!==null);
 const input=origin.input.value;assert(product.isGovernanceWorkState(input));assert.equal(input.synthesis.judgment.subjectEvidenceRef,s.nativeResultRef);assert.deepEqual(input.original,governanceSource.sourceResultValue.original);
 const ambientNames=['HOME','TMPDIR','LANG','LC_ALL','PATH'];for(const key of ambientNames)delete process.env[key];for(const row of s.actualAmbient){assert(ambientNames.includes(row.name)&&typeof row.value==='string'&&!row.value.includes('\0'));process.env[row.name]=row.value;}assert.equal(process.env.TMPDIR,prior.runtimeTmp.path);assert.equal(process.env.NPM_CONFIG_CACHE,undefined);
 const ambientOwner=await owner('abg/actor_process'),ambient=ambientOwner.selectedWorksiteCommandAmbientEnvironment();assert.deepEqual(ambient,s.actualAmbient);
 const environmentOwner=await owner('abg/environment_admission'),environment=environmentOwner.projectExactPrefixWorkspaceEnvironment(current,resume.state.binding);assert.equal(environment.kind,'exact_prefix_workspace_environment');
 const fresh=await product.observeWorksiteContext({workspaceAuthorityBasis:environment.workspaceAuthorityBasis,workspaceBinding:environment.workspaceBinding,protectedInstallRoots:environment.productInstalls.map(i=>i.installedRoot),readRoots:input.original.readRoots,maxFiles:input.original.maxContextFiles,maxBytes:input.original.maxContextBytes});
 await record('fresh-context.json',fresh);assert.equal(fresh.kind,'worksite_context_observation');const identityRestored=worksiteEffectOwner.sameWorksiteContextIdentity(sourceAfter,fresh);
 await record('context-identity.json',{identityRestored,sourceAfterDigest:sourceAfter.observationDigest,freshDigest:fresh.observationDigest,sourceEntries:sourceAfter.entries.length,freshEntries:fresh.entries.length,currentPrefix:current,historicalDiagnosticPrefix:cut,ambient,providerCalls:0,RunAdmissions:0});assert(identityRestored,'Fresh owner observation does not establish restored context identity; stop');
 const governanceOwner=await owner('abg/default_library'),reacquisitionOwner=await owner('abg/native_work_reacquisition'),refusals=[];let reacquisitionEntered=false;
 const refusal=(stage,relation,selectors={},error)=>refusals.push({stage,relation,selectors,error:error===undefined?null:{name:error.name??null,message:error.message??String(error)}});
 // Normal owner branch choice is authoritative. No omitted-resource control or forced reacquisition.
 const task=await governanceOwner.projectGovernanceTestingTask(basis,input,(context,report)=>{reacquisitionEntered=true;assert(worksiteEffectOwner.sameWorksiteContextIdentity(fresh,context),'Context changed during normal owner projection');return reacquisitionOwner.prepareGovernanceNativeWorkReacquisition(basis,input,context,historicalSource,report,ambient);},refusal,ambient);
 await record('testing-task-diagnostic.json',{task,refusals,reacquisitionEntered,classification:'counterfactual existing occurrence after authorized operator cleanup; no admitted Result or native Testing'});
 if(task!==null){assert(product.isNativeWorksiteCommandExecutionTask(task));assert.equal(task.commands.length,input.original.testing.commands.length);}
 await record('PREFLIGHT_RESULT.json',{status:task===null?'NEXT_TYPED_REFUSAL_RETAINED':'OWNER_C2_TASK_AVAILABLE_COUNTERFACTUALLY',identityRestored,reacquisitionEntered,taskKind:task?.kind??null,firstRefusal:refusals[0]??null,currentPrefix:current,historicalDiagnosticPrefix:cut,prospectiveLeafEnvironment:s.prospectiveLeafEnvironment,providerCalls:0,RunAdmissions:0,C2Commands:0,paidRetrySelected:false,nativeTesting:false,R2Closure:false,qualification:false});assert(task!==null||refusals.length!==0,'No task or precise owner refusal');
}catch(error){failure=error;await record('FAULT.json',{at:new Date().toISOString(),name:error.name,message:error.message,observation:error.observation??null,providerCalls:0,RunAdmissions:0,meaning:'Retain failure and stop. No workspace adjustment, fabricated progress or retry.'});}
finally{try{await record('PRESERVATION.json',{...await preservation(),lockAbsent:await absent(prior.runtimeTmp.lockPath)});}catch(error){await record('PRESERVATION_FAILURE.json',{name:error.name,message:error.message});failure??=error;}}
if(failure)throw failure;
console.log(JSON.stringify({directory:dir,status:'pure_owner_context_recheck_retained',providerCalls:0,RunAdmissions:0,C2Commands:0}));
