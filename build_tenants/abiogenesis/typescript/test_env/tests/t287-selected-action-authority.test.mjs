import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {join} from 'node:path';
import {registerHooks} from 'node:module';
import ts from 'typescript';
const ownerUrl=new URL('../../build/code/src/abg/construction_continuation.js',import.meta.url).href;
const useSource=process.env.ABI5_SELECTED_ACTION_SOURCE_BOUND==='1';
const hook=registerHooks({load(url,context,next){const loaded=next(url,context);if(url!==ownerUrl)return loaded;const source=useSource?ts.transpileModule(fs.readFileSync(new URL('../../code/src/abg/construction_continuation.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText:String(loaded.source);return {...loaded,format:'module',source:source+'\nexport { pendingSelectedOccurrence };\n'};}});
const product=await import('../../build/code/src/product/index.js'),abg=await import('../../build/code/src/abg/index.js'),owner=await import(ownerUrl);
hook.deregister();
// Loaded after the hooked owner so the evidence reader shares its exposed module.
const {loadCurrentOwnerEvidence}=await import('../support/t287-current-owner-evidence.mjs');
const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
// Default cases use the actual readonly RC10 selected-action population
// (fixtures/t287-current-owner/README.md). Its `actual` is an authentic
// occurrence RC10 projectSelectedActionContinuations projected from that
// history: a seed for the pendingSelectedOccurrence discriminators only, not an
// independent oracle for that projector. No environment, recovery or current
// store authority is read. The seed's admitted coordinates are checked against
// the decoded open intent row directly.
let seeded=null;
function seed() {
 if(seeded)return seeded;
 const {fixture,events}=loadCurrentOwnerEvidence('selected-action'),actual=fixture.actual;
 const intent=events.find(e=>e.eventId===actual.intentAdmissionEventRef);
 assert.equal(intent,events.at(-1));assert.equal(intent.kind,'construction_intent_selected');
 assert.equal(actual.openedEventRef,intent.eventId);assert.deepEqual(intent.causationEventRefs,[actual.causedByEventRef]);
 for(const [field,value] of [['runId',actual.runId],['graphCallId',actual.graphCallId],['frameId',actual.frameId],['basisId',actual.executionBasisRef]])assert.equal(intent[field],value,field);
 for(const [field,value] of [['constructionIntentRef',actual.constructionIntentRef],['constructionIntentDigest',actual.constructionIntentDigest],
  ['nextActionProjectionRef',actual.selectedActionRef],['nextActionProjectionDigest',actual.selectedActionDigest],
  ['targetCursorRef',actual.heldCursorRef],['targetCursorDigest',actual.heldCursorDigest]])assert.equal(intent.payload[field],value,field);
 assert.equal(actual.runId,fixture.opened.scope.runId);assert.equal(actual.status,'open');
 const basis={ref:actual.executionBasisRef,digest:actual.executionBasisDigest};assert.deepEqual(basis,fixture.basis);
 return seeded={actual,basis};
}
// Controlled occurrence populations exercise the actual owning selector. The
// seed is real retained evidence; cloned coordinates are unit assumptions,
// not admitted history and not installed qualification.
test('equal historical projection values do not mask the exact open current basis',()=>{
 const {actual,basis}=seed();
 const abandoned={...actual,executionBasisRef:'execution-basis://unit/prior',executionBasisDigest:product.sha256Canonical('prior'),continuationRef:'continuation://unit/prior',status:'abandoned'};
 assert.equal(abandoned.selectedActionDigest,actual.selectedActionDigest);
 assert.deepEqual(owner.pendingSelectedOccurrence([abandoned,actual],basis),actual);
 assert.deepEqual(owner.pendingSelectedOccurrence([actual,abandoned],basis),actual);
});
test('occurrence selection refuses genuine ambiguity and crossed basis',()=>{
 const {actual,basis}=seed();
 const other={...actual,continuationRef:'continuation://unit/ambiguous'};
 assert.equal(owner.pendingSelectedOccurrence([actual,other],basis),null);
 assert.equal(owner.pendingSelectedOccurrence([actual],{...basis,digest:product.sha256Canonical('crossed')}),null);
});
// The physical case is separate from the default snapshot: its recovery
// handoff binds the prefix to the original store's device and inode, so it runs
// only over an explicitly selected subject (a native run regenerates it), read
// lazily inside the case.
test('retained catalog and view authority reject a coherent same-binding alternative',{skip:!process.env.ABI5_SELECTED_ACTION_OWNER_SUBJECT&&'ABI5_SELECTED_ACTION_OWNER_SUBJECT unset; requires an explicitly selected selected-action owner subject whose recovery prefix coordinate names its store on this machine'},async()=>{
 const subject=process.env.ABI5_SELECTED_ACTION_OWNER_SUBJECT;
 const read=n=>JSON.parse(fs.readFileSync(join(subject,n),'utf8')),environment=read('environment.json'),opened=read('opened.json');
 const prefix=abg.selectValidatedRuntimeEventPrefix(freeze(fs.readFileSync(join(subject,'interrupted-prefix.jsonl'),'utf8').trim().split('\n').map(JSON.parse)));
 const actual=owner.projectSelectedActionContinuations(prefix,opened.scope.runId).at(-1);assert.equal(actual.status,'open');
 const basis={ref:actual.executionBasisRef,digest:actual.executionBasisDigest};
 const request={run:{ref:opened.scope.runId,digest:opened.scope.runDigest},continuation:{ref:actual.continuationRef,digest:actual.continuationDigest},selectedAction:{ref:actual.selectedActionRef,digest:actual.selectedActionDigest},basisRelation:{kind:'same_basis'}};
 const resolve=view=>product.ProductExecutionResolutionPort.resolve({catalog:environment.catalog,catalogView:view,admittedInstalls:environment.admittedInstalls,verifyInstallAdmission:i=>abg.hasAdmittedProductInstall(abg.projectExactPrefixArtifactTruth(read('recovery.json').closeHandoff.prefix),i),programRef:environment.executionBasis.programRef,selection:{kind:'admitted',graphFunctionRef:environment.executionBasis.graphFunctionRef}});
 const use=owner.selectPendingActionUse(prefix,request,basis);assert.equal(use.kind,'selected_action_use');
 const exact=await resolve(environment.catalogView);assert.equal(exact.kind,'loaded_product_execution_resolution',JSON.stringify(exact));
 assert.ok(owner.prepareSelectedActionContinuation(prefix,use,exact),'exact actual retained context prepares');
 const handles=environment.catalog.entries.map(e=>e.handle),extra=handles.find(h=>!environment.catalogView.allowlist.includes(h));assert.ok(extra,'same catalog has an unused valid handle');
 const alternate=product.narrowGraphFunctionCatalog(environment.catalog,[...environment.catalogView.allowlist,extra]);assert.equal(alternate.kind,'graph_function_catalog_view');assert.notEqual(alternate.viewDigest,environment.catalogView.viewDigest);
 const changed=await resolve(alternate);assert.equal(changed.kind,'loaded_product_execution_resolution',JSON.stringify(changed));assert.equal(changed.resolution.programDigest,exact.resolution.programDigest);assert.equal(changed.resolution.graphFunctionDigest,exact.resolution.graphFunctionDigest);assert.notEqual(changed.programValidation.validationRef,exact.programValidation.validationRef,'exact catalog/view flows through declaration basis into retained Program-validation authority');
 assert.equal(owner.prepareSelectedActionContinuation(prefix,use,changed),null,'different valid view must not replace the retained current authority');
});
