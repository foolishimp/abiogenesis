import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const here=import.meta.dirname,tenant=resolve(here,'../../../../../build_tenants/abiogenesis/typescript');
const product=await import(pathToFileURL(join(tenant,'build/code/src/product/index.js')).href);
const revision=await import(pathToFileURL(join(tenant,'build/code/src/product/semantic_revision.js')).href);
const {NATIVE_WORKSPACE_WORK_IDS}=await import(pathToFileURL(join(tenant,'build/code/src/product/native_workspace_work_identity.js')).href);
const source=await readFile(resolve(here,'../evidence-context-01/native42-selected-events.json'));
assert.equal(createHash('sha256').update(source).digest('hex'),'733701942d27d7767167db5a2d527e64f887661ff533bb024999375acfea35ba');
const events=JSON.parse(source).events,at=ordinal=>events.find(e=>e.admissionOrdinal===ordinal);
const parent=at(109418).payload.value,evidence=parent.current.evidence;
assert.equal(product.sha256Canonical(parent),at(109418).payload.valueDigest);
const disposition=JSON.parse(await readFile(resolve(here,'../native42/suffix-disposition.json')));
const coordinate=(result,judgment)=>({cCallRef:result.aggregateId,resultRef:result.payload.resultRef,resultDigest:result.payload.resultDigest,
 resultAdmissionEventRef:result.eventId,judgmentEventRef:judgment.eventId});
const construction={cCallRef:evidence.constructionResult.provenance.cCallRef,resultRef:evidence.constructionResultRef,resultDigest:evidence.constructionResultDigest,
 resultAdmissionEventRef:'component:construction-admission-premise',judgmentEventRef:'component:construction-judgment-premise'};
const stage=parent.current.declaration.stages[parent.current.assets.length];
const selection={kind:'semantic_revision_selection',schemaVersion:'5.0.0',parent:coordinate(at(109418),at(109422)),causes:[coordinate(at(109462),at(109464))],
 mode:'stage_revision',selectedStageRef:stage.declarationRef,selectedObligationRefs:[],selectedTargetRefs:[],reasonRef:'component:operational-failure-premise',nativePhase:'postconstruction'};
const request={kind:'semantic_revision_request',schemaVersion:'5.0.0',parent:selection.parent,causes:selection.causes,
 selection:{cCallRef:'component:selection',resultRef:'component:selection-result',resultDigest:product.sha256Canonical(selection),
  resultAdmissionEventRef:'component:selection-admission-premise',judgmentEventRef:'component:selection-judgment-premise'},
 selectionChoice:{mode:selection.mode,selectedStageRef:selection.selectedStageRef,entryRole:'author'},currentWorksite:null,
 nativeWorksite:{kind:'native_semantic_revision_worksite',workspaceAuthorityBasis:evidence.constructionResult.task.workspaceAuthorityBasis,
  workspaceBinding:evidence.constructionResult.task.workspaceBinding,capabilityGrant:evidence.constructionResult.task.capabilityGrant,
  context:parent.current.context,commandExecutionLimits:parent.revisionBasis.request.nativeWorksite.commandExecutionLimits,construction,
  source:{kind:'native_semantic_revision_intake',schemaVersion:'5.0.0',sourceRun:disposition.run,sourcePrefix:disposition.prefix}}};
const suffix=(await readFile(join(here,'native42-events-109400-109464.jsonl'),'utf8')).trim().split('\n').map(line=>{const row=JSON.parse(line);return row.event??row;});
const retainedAt=ordinal=>suffix.find(e=>e.admissionOrdinal===ordinal);
const leafState=(opened,fibre,result,judgment)=>({cCall:{...opened.payload,implementationRef:fibre.payload.implementationRef,regime:fibre.payload.regime},
 result:{...result.payload,admissionEventRef:result.eventId},judgment:{...judgment.payload,admissionEventRef:judgment.eventId}});
const selectionInput={kind:'semantic_revision_selection_input',schemaVersion:'5.0.0',parent:request.parent,causes:request.causes,currentWorksite:null,nativeWorksite:request.nativeWorksite};
const observed=retainedAt(109460).payload.ownerObservation;
const operationalFailure={role:'author',stageRef:stage.declarationRef,evidenceRef:retainedAt(109460).payload.evidenceRef,evidenceAdmissionEventRef:retainedAt(109460).eventId,
 ownerObservation:observed,refusal:JSON.parse(JSON.parse(decodeURIComponent(observed.diagnosticRef.split(',').slice(1).join(','))).message)};
const fixture={claim:'Exact native42 payload shape for component selector context; source/current-W/intake/selection admission are premises, not a runnable request',
 input:selectionInput,subject:{request:selectionInput,envelope:parent.current,parent:leafState(retainedAt(109411),retainedAt(109412),at(109418),at(109422)),
 causes:[leafState(retainedAt(109457),retainedAt(109458),at(109462),at(109464))],nativeWorksite:request.nativeWorksite,operationalFailure,
 construction:{cCall:{cCallRef:construction.cCallRef,implementationRef:NATIVE_WORKSPACE_WORK_IDS.implementationRef,regime:'F_P'},
  result:{resultClass:'success',resultRef:construction.resultRef,resultDigest:construction.resultDigest,valueKind:evidence.constructionResult.kind,
   contractRef:NATIVE_WORKSPACE_WORK_IDS.observationContractRef,valueDigest:product.sha256Canonical(evidence.constructionResult),value:evidence.constructionResult,
   admissionEventRef:construction.resultAdmissionEventRef},judgment:{judgment:'advance',admissionEventRef:construction.judgmentEventRef}},
 counterevidenceAssets:[],currentWorksite:null,priorWorksite:null,origins:[]}};
await writeFile(join(here,'native42-selector-component-fixture.json'),JSON.stringify(fixture)+'\n');
if(process.argv.includes('--fixture-only')){console.log('Wrote native42-selector-component-fixture.json; no Product derivation or admission claimed.');process.exit(0);}
const successor=revision.deriveSemanticJobRevision(parent,request,selection,null,null,[],undefined,stage,'author');
assert(successor);
for(const field of ['job','basis','assets','bindingVersions','evidence'])assert.deepEqual(successor.current[field],parent.current[field]);
const obligations=product.projectSemanticJobBindings(successor.current);
assert.equal(obligations.length,15);assert.deepEqual(obligations,product.projectSemanticJobBindings(parent.current));
assert.equal(successor.current.assets.length,4);assert(!successor.current.assets.some(a=>a.stageRef===stage.declarationRef));
assert.equal(successor.current.evidence.artifacts.length,14);
assert.equal(successor.current.evidence.executionObservation.commandResults.length,9);
assert(successor.current.evidence.executionObservation.commandResults.every(row=>row.exitStatus===0&&!row.timedOut&&row.processSignal===null));
assert.equal(successor.current.evidence.executionObservation.predicateObservations.length,13);
assert.equal(successor.revisionBasis.parentRevisionRef,parent.revisionBasis.basisRef);
assert.equal(revision.deriveSemanticJobRevision(parent,request,selection,null),null);
assert.equal(revision.deriveSemanticJobRevision(parent,{...request,nativeWorksite:{...request.nativeWorksite,
 construction:{...construction,resultDigest:product.sha256Canonical('crossed-construction')}}},selection,null,null,[],undefined,stage),null);
assert.throws(()=>revision.constructNativeRevisionConstructionTask(successor),/native revision construction basis required/);
const result={claim:'Pure Product conservation of exact retained native42 producer; operational and omitted admission coordinates are explicit component premises',
 inputValueDigest:product.sha256Canonical(parent),successorDigest:product.sha256Canonical(successor),
 conserved:{stages:4,obligations:15,artifacts:14,commands:9,predicates:13,evidenceDigest:product.sha256Canonical(evidence),
 constructionResultRef:evidence.constructionResultRef,executionResultRef:evidence.executionResultRef},
 effectPermission:'Evidence-only; construction constructor refuses',acceptance:'No Evidence candidate or assessment manufactured',
 nonclaims:['No runtime acquisition or fresh-workspace currentness','No binding cover admission','No admitted request','No provider, native effect, replay, package or installed qualification']};
await writeFile(join(here,'retained-product-proof.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
