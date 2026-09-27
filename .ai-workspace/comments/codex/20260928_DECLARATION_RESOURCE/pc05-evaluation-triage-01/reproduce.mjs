import assert from 'node:assert/strict';
import {readFile,writeFile,stat} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {isDeepStrictEqual as same} from 'node:util';
import {createHash} from 'node:crypto';
const D=import.meta.dirname,B='/Users/jim/src/apps/odd_glc/.ai-workspace/comments/codex/20260928_DECLARATION_RESOURCE';
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const result=await read(join(B,'pc05-04/execution/result.json')),receipt=(await read(join(B,'pc05-04/execution/graphExecution.json'))).receipt;
const activation=await read(join(B,'pc05-04/activation.json')),prefix=receipt.resources.eventResource.closeHandoff.prefix,run=result.run;
assert.equal(prefix.prefixLength,1119877539);assert.deepEqual(prefix,result.closeHandoff.prefix);
const core=activation.coreRoot,pkg=await read(join(core,'package.json'));
const load=n=>import(pathToFileURL(join(core,pkg.exports['./'+n].import)).href);
const runtimePath=join(B,'pc05-02/products/construction/node_modules/@odd-glc/route-one-typescript/build/program-construction-runtime.mjs');
const [product,abg,runtime]=await Promise.all([load('product'),load('abg'),import(pathToFileURL(runtimePath).href)]);
const before=await stat(new URL(prefix.eventLogRef));assert.equal(before.size,prefix.prefixLength);
console.log(JSON.stringify({phase:'one_owner_acquisition_started',prefixLength:prefix.prefixLength,run:run.ref}));
const started=performance.now();
const prefixes=abg.projectRuntimePrefixesAtDurablePrefix(prefix,run.ref),ownerReadMs=performance.now()-started;
const events=prefixes.runtimePrefix.events,leafRef='c-call:sha256:26997b51b5e85cbd090b71f034b9a57e52ec8578700a269e6710c37b878f27c3';
const unique=(rows,label)=>{assert.equal(rows.length,1,label);return rows[0];};
const opened=unique(events.filter(e=>e.kind==='c_call_opened'&&e.aggregateId===leafRef),'exact leaf CCall');
assert.equal(opened.graphFunctionRef,'graph-function://odd-glc/program-construction/prepare-constructed-evaluation@5');
assert.equal(opened.payload.callClass,'leaf');
const fibre=unique(events.filter(e=>e.kind==='c_call_fibre_selected'&&e.aggregateId===leafRef),'exact leaf fibre');
assert.equal(fibre.payload.implementationRef,'implementation://odd-glc/program-construction/prepare-constructed-evaluation@5');
const basis=unique(events.filter(e=>e.kind==='basis_admitted'&&e.basisId===opened.basisId),'exact leaf execution basis');
assert.equal(basis.payload.parentCCallRef,'c-call:sha256:4047d460da76a60885fc0c9582daddbaff2f9458b0b1be32b35a50e49f6f7a92');
const cursor=unique(events.filter(e=>e.kind==='traversal_cursor_entered'&&e.payload.cursorRef===opened.payload.cursorRef),'exact opened leaf cursor');
const input=basis.payload.rawInputValue,inputDigest=product.sha256Canonical(input);
assert.equal(inputDigest,basis.payload.rawInputDigest);assert.equal(inputDigest,cursor.payload.inputDigest);
assert(opened.causationEventRefs.includes(cursor.eventId));
const failure=unique(events.filter(e=>e.kind==='c_call_result_admitted'&&e.aggregateId===leafRef),'exact failed leaf result');
const evidence=events.filter(e=>e.kind==='c_call_evidenced'&&e.aggregateId===leafRef);
assert(evidence.some(e=>e.payload.inputDigest===inputDigest),'failed implementation evidence binds exact input');
console.log(JSON.stringify({phase:'one_owner_acquisition_completed',ownerReadMs,inputDigest,inputBytes:Buffer.byteLength(JSON.stringify(input))}));
const checkStarted=performance.now();let reproduced;
try{const candidate=runtime.prepareConstructedEvaluation(input);reproduced={threw:false,kind:candidate.kind};}
catch(error){reproduced={threw:true,name:error.name,message:error.message,stack:error.stack};}
const reproductionMs=performance.now()-checkStarted;
const entry=input.entry,state=input.source,selection=runtime.selectionFor(entry),request=runtime.reacquisitionRequest(entry);
const nativeRows=state.constructionObservations.map(row=>({groupRef:row.groupRef,dutyRefs:row.dutyRefs,
  observationRef:row.observation.observationRef,observationDigest:row.observation.observationDigest,provenance:row.observation.provenance,
  validNativeObservation:product.isNativeWorkspaceWorkObservation(row.observation),reportGaps:row.observation.report.gaps,
  beforeBinding:row.observation.before.workspaceBindingIdentity,afterBinding:row.observation.after.workspaceBindingIdentity,
  noFileChanges:same(row.observation.before.entries,row.observation.after.entries)}));
const facts={retainedInputValid:product.isRetainedGraphInput(input),entryValid:runtime.isNativeConstructionInput(entry),stateValid:runtime.isConstructionState(state),
  entryBinding:entry.authority.workspaceBinding.bindingId,entryContextBinding:entry.currentContext.workspaceBindingIdentity,
  historicalNativeBinding:entry.origin.observation.task.sourceNativeWork.task.workspaceBinding.bindingId,
  stateContextBinding:state.currentContext.workspaceBindingIdentity,disposition:state.disposition,gaps:state.gaps,
  expectedGroups:entry.constructionGroups.length,observationCount:state.constructionObservations.length,
  acquisitionRefMatches:state.acquisition.requestRef===request.requestRef,acquisitionDigestMatches:state.acquisition.requestDigest===request.requestDigest,
  selection:{disposition:selection.disposition,gaps:selection.gaps},nativeRows};
const after=await stat(new URL(prefix.eventLogRef));assert.equal(after.size,before.size);assert.equal(after.mtimeMs,before.mtimeMs);assert.equal(after.ino,before.ino);
const output={status:'exact_failed_leaf_reproduced_read_only',core,runtimePath,runtimeSha256:createHash('sha256').update(await readFile(runtimePath)).digest('hex'),
  run,prefix,leafRef,parentWrapperRef:basis.payload.parentCCallRef,openedEventRef:opened.eventId,fibreEventRef:fibre.eventId,basisEventRef:basis.eventId,cursorEventRef:cursor.eventId,
  inputDigest,inputBytes:Buffer.byteLength(JSON.stringify(input)),failurePayload:failure.payload,reproduced,facts,timings:{ownerReadMs,reproductionMs},
  journal:{bytes:after.size,mtimeUnchanged:true,inodeUnchanged:true},limits:'One public owner prefix acquisition; no second read/semantic projection, no original exception claim, no effect/provider/Run.'};
await writeFile(join(D,'result.json'),JSON.stringify(output,null,2)+'\n',{flag:'wx'});
// Keep only the exact selected leaf input, never a history copy, so subsequent
// pure diagnosis and preserved-author preparation require no second cold read.
await writeFile(join(D,'retained-input.json'),JSON.stringify(input)+'\n',{flag:'wx'});
console.log(JSON.stringify(output));
