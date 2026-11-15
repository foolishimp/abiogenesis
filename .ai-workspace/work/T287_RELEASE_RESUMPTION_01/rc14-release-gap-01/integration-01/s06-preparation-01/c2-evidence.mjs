// @ts-check
// External, read-only custody of an already admitted C2 result. No admission,
// copy-back, substitute worksite output or semantic verdict is constructed here.
import assert from 'node:assert/strict';
import {lstat,readFile,realpath} from 'node:fs/promises';
import {isAbsolute,join,relative,resolve} from 'node:path';

const same=(product,a,b)=>product.canonicalJson(a)===product.canonicalJson(b);
function within(root,path) {
 const r=relative(root,path);assert(r&&!isAbsolute(r)&&r!=='..'&&!r.startsWith('../'),'Evidence leaves its admitted root');
}
async function bytesAt(path,root) {
 assert.equal(resolve(path),path);within(root,path);
 assert.equal(await realpath(path),path,'Evidence alias');
 const st=await lstat(path);assert(st.isFile()&&!st.isSymbolicLink(),'Evidence must be a regular file');
 assert(st.size<=67108864,'Bounded evidence member');return readFile(path);
}
/** @param {typeof import('@abiogenesis/typescript-tenant/product')} product */
export function selectAdmittedExecution(product,result,phase) {
 assert(['d1','d2'].includes(phase));
 let event;
 if(phase==='d1') {
  const evidence=result.value.evidence,observation=evidence?.executionObservation;
  assert(product.isWorksiteExecutionObservation(observation),'D1 needs its actual admitted C2 observation');
  assert(typeof evidence.executionResultRef==='string'&&typeof evidence.executionResultDigest==='string','D1 needs its owner-selected C2 Result coordinate');
  const rows=result.events.filter(e=>e.kind==='c_call_result_admitted'&&e.payload.resultClass==='success'&&
   e.payload.resultRef===evidence.executionResultRef&&e.payload.resultDigest===evidence.executionResultDigest);
  assert.equal(rows.length,1,'D1 owner coordinate names one exact admitted Result');event=rows[0];
  assert(same(product,event.payload.value,observation),'D1 owner-selected Result carries the declared observation');
 } else {
  const testing=result.value.observations.filter(o=>o.purpose==='testing').at(-1);
  assert(testing,'D2 needs its final Testing observation');
  const rows=result.events.filter(e=>e.kind==='c_call_result_admitted'&&e.payload.resultClass==='success'&&
   e.aggregateId===testing.cCallRef&&e.payload.resultRef===testing.resultRef&&e.payload.resultDigest===testing.resultDigest);
  assert.equal(rows.length,1,'D2 final Testing names one exact admitted Result');event=rows[0];
  assert.equal(event.payload.value.provenance?.actorInvocationRef,testing.actorInvocationRef);
 }
 assert(product.isWorksiteExecutionObservation(event.payload.value),'Selected Result is not an exact C2 observation');
 return {event,observation:event.payload.value};
}
/** @param {typeof import('@abiogenesis/typescript-tenant/product')} product */
export async function authenticateExecutionEvidence(product,admission,{workspaceBinding,worksiteRoot,expectedCommand,phase,expectedInput}) {
 const {event,observation:o}=admission,task=o.task,plan=o.provenance.helperPlan;
 assert.equal(event.kind,'c_call_result_admitted');assert.equal(event.payload.resultClass,'success');
 assert(same(product,event.payload.value,o));assert(product.isWorksiteExecutionObservation(o));
 assert.deepEqual(task.workspaceBinding,workspaceBinding);assert.equal(task.workspaceAuthorityBasis.canonicalRoot,worksiteRoot);
 const archive=workspaceBinding.roots.archiveRoot;
 within(archive,plan.artifactPath);within(archive,plan.sandboxRoot);within(archive,plan.taskManifestPath);
 assert.equal(await realpath(plan.sandboxRoot),plan.sandboxRoot);assert((await lstat(plan.sandboxRoot)).isDirectory());
 const taskBytes=await bytesAt(plan.taskManifestPath,archive);
 assert.equal(taskBytes.length,plan.taskManifestByteLength);assert.equal(product.sha256Bytes(taskBytes),plan.taskManifestDigest);
 assert.equal(taskBytes.toString(),product.canonicalJson(task)+'\n');
 const artifactBytes=await bytesAt(o.provenance.helperArtifactPath,archive),artifact=JSON.parse(artifactBytes.toString());
 assert.equal(artifactBytes.length,o.provenance.helperArtifactByteLength);
 assert.equal(artifactBytes.toString(),product.canonicalJson(artifact)+'\n');
 assert(product.isWorksiteExecutionHelperArtifact(task,artifact),'Exact task-bound helper artifact required');
 assert.equal(artifact.disposition,'success');assert.equal(artifact.artifactRef,o.helperArtifactRef);assert.equal(artifact.artifactDigest,o.helperArtifactDigest);
 assert.equal(artifact.snapshotRoot,plan.sandboxRoot);
 for(const key of ['commandResults','predicateObservations','worksiteDelta','productDelta','snapshotRef','snapshotDigest','snapshotMembers'])assert.deepEqual(artifact[key],o[key]);
 const files={};
 for(const row of artifact.snapshotMembers) {
  const bytes=await bytesAt(join(plan.sandboxRoot,row.relativePath),plan.sandboxRoot);
  assert.equal(bytes.length,row.byteLength);assert.equal(product.sha256Bytes(bytes),row.digest,'Retained source snapshot changed');
  files[row.relativePath]={bytes:row.byteLength,sha256:row.digest.slice(7),origin:'snapshot'};
 }
 for(const row of artifact.worksiteDelta) {
  if(row.after?.nodeKind==='file')files[row.relativePath]={bytes:row.after.byteLength,sha256:row.after.digest.slice(7),origin:'helper-observed delta'};
  else if(row.after===null)delete files[row.relativePath];
 }
 for(const command of artifact.commandResults)for(const report of command.reports) {
  assert.equal(report.state,'file','Required report absent');
  const bytes=await bytesAt(join(plan.sandboxRoot,report.relativePath),plan.sandboxRoot);
  assert.equal(bytes.length,report.byteLength);assert.equal(product.sha256Bytes(bytes),report.digest,'Retained report differs from admitted command observation');
  assert.equal(files[report.relativePath]?.sha256,report.digest.slice(7));
 }
 if(expectedCommand!==undefined) {
  assert(['d1','d2'].includes(phase));
  const rows=task.commands.filter(c=>c.commandId===expectedCommand.commandId);assert.equal(rows.length,1,'One selected witness command');
  const command=rows[0];
  for(const key of ['executable','args','relativeCwd','timeoutMs','terminationGraceMs'])assert.deepEqual(command[key],expectedCommand[key],'Witness command '+key);
  const environment=Object.fromEntries(command.environment.map(e=>[e.name,e.value]));
  for(const [key,value] of Object.entries(expectedCommand.environment))assert.equal(environment[key],value,'Declared command environment '+key);
  assert(Object.keys(environment).every(key=>Object.hasOwn(expectedCommand.environment,key)||['HOME','TMPDIR','LANG','LC_ALL','PATH'].includes(key)),'Only declared and owner-captured ambient variables');
  assert.deepEqual(command.expectedReports.map(r=>({reportIdentity:r.reportIdentity,relativePath:r.relativePath})),expectedCommand.expectedReports);
  const execution=artifact.commandResults.find(c=>c.commandId===command.commandId);
  assert(execution&&execution.exitStatus===0&&!execution.timedOut&&execution.terminationConfirmed,'Successful closed actual witness command required');
  const input='source/'+phase+'-input.json';assert(files[input]?.origin==='snapshot','Actual phase input must belong to the protected C2 snapshot');
  assert.deepEqual(JSON.parse((await bytesAt(join(plan.sandboxRoot,input),plan.sandboxRoot)).toString()),expectedInput);
 }
 return {event:{eventId:event.eventId,admissionOrdinal:event.admissionOrdinal,runId:event.runId,cCallRef:event.aggregateId,resultRef:event.payload.resultRef,resultDigest:event.payload.resultDigest},
  observationRef:o.observationRef,observationDigest:o.observationDigest,workspaceBinding,taskRef:task.taskRef,taskDigest:task.taskDigest,
  helperArtifact:{path:plan.artifactPath,ref:artifact.artifactRef,digest:artifact.artifactDigest,bytes:artifactBytes.length,sha256:product.sha256Bytes(artifactBytes)},
  helperPlan:plan,snapshotRef:artifact.snapshotRef,snapshotDigest:artifact.snapshotDigest,sandboxRoot:plan.sandboxRoot,files};
}
/** @param {typeof import('@abiogenesis/typescript-tenant/product')} product */
export async function authenticateObservedFiles(product,evidence,observed) {
 for(const [path,row] of Object.entries({...observed.files,...observed.query.members})) {
  const admitted=evidence.files[path];assert(admitted,'Observed member lacks an admitted snapshot/delta: '+path);
  assert.equal(row.bytes,admitted.bytes);assert.equal(row.sha256,admitted.sha256,'Observed bytes differ from C2 evidence: '+path);
  const bytes=await bytesAt(join(evidence.sandboxRoot,path),evidence.sandboxRoot);
  assert.equal(bytes.length,row.bytes);assert.equal(product.sha256Bytes(bytes),'sha256:'+row.sha256);
 }
}
