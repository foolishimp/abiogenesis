// Derived caller coordinates only. Actual Public/ABG owners authenticate history.
import assert from 'node:assert/strict';
import {readFile,lstat,realpath} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const here=dirname(fileURLToPath(import.meta.url));
export const sourcePins=JSON.parse(await readFile(join(here,'INPUT_PINS.json'),'utf8'));
export const closedSource=JSON.parse(await readFile(join(here,'CLOSED_SOURCE.json'),'utf8'));
export async function pinnedBytes(row) {
 const st=await lstat(row.path);assert(st.isFile()&&!st.isSymbolicLink());assert.equal(await realpath(row.path),row.path);
 const bytes=await readFile(row.path);assert.equal(bytes.length,row.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),row.sha256);return bytes;
}
export async function pinnedJson(row){return JSON.parse((await pinnedBytes(row)).toString('utf8'));}
const oldManifest=await readFile(join(sourcePins.originalControls,'CONTROL_MANIFEST.json'));
assert.equal(createHash('sha256').update(oldManifest).digest('hex'),sourcePins.originalManifestSha256);
const oldDeclaration=JSON.parse(oldManifest).controls.find(row=>row.path==='declarations.mjs');assert(oldDeclaration);
await pinnedBytes({...oldDeclaration,path:join(sourcePins.originalControls,oldDeclaration.path),bytes:(await lstat(join(sourcePins.originalControls,oldDeclaration.path))).size});
export const original=await import(pathToFileURL(join(sourcePins.originalControls,'declarations.mjs')).href);
export async function contextInputs(){return {standards:await Promise.all(sourcePins.standards.map(async r=>({...r,bytes:await pinnedBytes(r)}))),review:{...sourcePins.rootReview,bytes:await pinnedBytes(sourcePins.rootReview)}};}

// These are precisely the three bases selected by the existing native-intake
// owner for this pre-construction refusal. They are rehydrated from the held
// genuine event resource; the carrier does not create a new basis or event.
export async function admitBindingCover(caller) {
 const {abg,product}=caller.runtime,hash=product.sha256Canonical;
 const before=(await pinnedJson(closedSource.identity)).workspaceBinding;
 const environment=caller.refresh(),after=environment.workspaceBinding;
 assert.equal(environment.workspaceAuthorityBasis.authorityBasisId,(await pinnedJson(closedSource.identity)).workspaceAuthority.authorityBasisId);
 const events=abg.readRuntimeEventsAtDurablePrefix(caller.prefix());
 const prefix=abg.selectValidatedRuntimeEventPrefix(events);
 const bases=closedSource.historicalBasisRefs.map(ref=>abg.rehydrateExecutionBasisAtPrefix(prefix,ref));
 assert(bases.every(Boolean));assert.equal(new Set(bases.map(b=>b.basisRef)).size,bases.length);
 for(const basis of bases) {
  assert.equal(basis.workspaceBindingId,before.ref);assert.equal(basis.workspaceBindingDigest,before.digest);
  if(before.ref===after.bindingId&&before.digest===after.bindingDigest)continue;
  const subject={ref:basis.basisRef,digest:basis.basisDigest},content=abg.WITNESS_CONTENT_CONTRACTS.reprice;
  const request={subjectKind:'authority_basis',subject,act:'reprice',content:{kind:'typed_payload',contentContract:{ref:content.ref,digest:content.digest},value:{declarationRef:before.ref,beforeDigest:before.digest,afterDigest:after.bindingDigest,changeClass:'realization_refactor',owningTicketRef:'ticket://abiogenesis/T287/S06-adverse-revision',reason:'Same workspace authority and actor; new installed consumer declares the existing adverse revision Programs and exact role context. Source WHAT and candidate remain unchanged.'}},context:{kind:'basis',basis:subject},evidence:[before,{ref:after.bindingId,digest:after.bindingDigest}],provenance:[subject]};
  await caller.record('binding-cover/'+basis.basisDigest.slice(7)+'.input.json',request);
  await caller.invoke('binding-cover-'+basis.basisDigest.slice(7),await caller.authorize(abg.WITNESS_OPERATION_CONTRACTS.admit.reprice,request,{kind:'witness_reprice_resource_assertion',schemaVersion:'5.0.0',eventResource:caller.state.selection},caller.boundSlots()));
 }
 await caller.record('binding-cover.json',{before,after:{ref:after.bindingId,digest:after.bindingDigest},bases:bases.map(b=>({ref:b.basisRef,digest:b.basisDigest})),claim:'Actual Public witness occurrences only; native intake independently authenticates the complete historical cover'});
 return {kind:'native_semantic_revision_intake',schemaVersion:'5.0.0',sourceRun:closedSource.sourceRun,sourcePrefix:closedSource.sourcePrefix};
}

export function authenticateRequest(product,value) {
 assert(product.isSemanticRevisionRequest(value),'Actual admitted native revision request');
 assert.deepEqual(value.nativeWorksite?.source,{kind:'native_semantic_revision_intake',schemaVersion:'5.0.0',sourceRun:closedSource.sourceRun,sourcePrefix:closedSource.sourcePrefix});
 assert.equal(value.nativeWorksite.construction,null,'This source stopped before construction');
 assert.equal(value.parent.resultAdmissionEventRef,closedSource.parent.eventId);
 assert.equal(value.causes.length,1);assert.equal(value.causes[0].resultAdmissionEventRef,closedSource.cause.eventId);
 assert(value.nativeWorksite.acquisition,'Actual admitted intake coordinate required');return value;
}
export function currentProjection(product,result,request) {
 const whole=result.value;assert(product.isSemanticJobRevisionEnvelope(whole),'Whole authentic revision envelope required');
 assert.deepEqual(whole.revisionBasis.request,request,'Exact admitted request retained');
 assert(product.isSemanticJobEnvelope(whole.current));
 assert.equal(whole.current.assets.length,whole.current.declaration.stages.length);
 assert(whole.current.assets.every(asset=>asset.assessment?.disposition==='satisfied'));
 return {...result,revisionEnvelope:whole,value:whole.current};
}
