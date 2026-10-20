import assert from 'node:assert/strict';
import fs from 'node:fs';
import {syncBuiltinESMExports} from 'node:module';
import {join} from 'node:path';
import {setupInstalledRootExecutionBasis} from './root-installed-environment.mjs';
import {prepareRegisteredSelectionProduct} from './registered-graph-selection.mjs';
import {declarations,ref,contract,actionCatalog,hash} from '../fixtures/t287-selected-action-product/index.mjs';
const proof=process.env.ABI5_SELECTED_ACTION_EVIDENCE_ROOT;
assert.ok(proof);
const save=(name,value)=>fs.writeFileSync(join(proof,name),JSON.stringify(value,null,2)+'\n');
const root=new URL('../..',import.meta.url).pathname,started=performance.now(),accounting={wallMs:{}};
let e;
try {
 e=await setupInstalledRootExecutionBasis({after:()=>{}},root,{candidateBasisSource:'packed_artifact',workspaceProductIndex:1,programRef:ref('program','root'),graphFunctionRef:ref('graph-function','root'),inputContractRef:contract('request'),setupAccounting:accounting,
 prepareAdditionalProducts:async basis=>[await prepareRegisteredSelectionProduct({...basis,declarationFactory:declarations,fixtureFiles:[{path:'build/index.js',source:new URL('../fixtures/t287-selected-action-product/index.mjs',import.meta.url)}]})],
 inputFactory:({workspaceBinding})=>({kind:'fixture_request',schemaVersion:'5.0.0',workspaceBinding:{workspaceBindingId:workspaceBinding.bindingId,workspaceBindingDigest:workspaceBinding.bindingDigest},actionCatalog,phase:0,task:{kind:'fixture_task',schemaVersion:'5.0.0',payload:'first action'}})});
 const selectedKeys=['scratch','installedRoot','installedRoots','artifactPaths','verified','workspaceAuthority','workspaceBinding','admittedInstalls','catalog','catalogView','policy','actorRef','invocationAuthority','invocationAdmission','input','executionBasis','publication'];
 save('environment.json',Object.fromEntries(selectedKeys.map(k=>[k,e[k]])));
 save('setup.json',{setupMs:performance.now()-started,accounting,archiveDigests:await Promise.all(e.artifactPaths.map(p=>e.product.sha256File(p))),artifactPaths:e.artifactPaths,installedRoot:e.installedRoot});
 const eventLogPath=join(e.scratch,'runtime/events.jsonl'),identity=fs.statSync(eventLogPath);
 save('initial-origin.json',{initialOrigin:{newResourceRequest:{kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath},device:identity.dev,inode:identity.ino},ownerPid:process.pid});
 const {abg}=e,opened=abg.openTraversalScope(e.store,e.durablePrefix,{kind:'root',executionBasis:e.executionBasis},{eventTime:'2026-09-30T00:00:00.000Z',correlationId:'correlation://selected-action/initial',causationEventRefs:[]});
 assert.equal(opened.kind,'traversal_scope_open_admission',JSON.stringify(opened));save('opened.json',opened);
 const runStarted=performance.now(),nativeFsync=fs.fsyncSync;
 fs.fsyncSync=function(fd){nativeFsync(fd);const bytes=fs.readFileSync(eventLogPath);if(bytes.length===0||bytes.at(-1)!==10)return;const events=bytes.toString().trim().split('\n').map(JSON.parse);const selections=events.filter(v=>v.kind==='construction_intent_selected');if(selections.length===2){
  fs.writeFileSync(join(proof,'interrupted-prefix.jsonl'),bytes);
  save('interruption.json',{hook:'test-only node:fs fsyncSync wrapper after native fsync; no runtime bytes patched',processId:process.pid,signal:'SIGKILL',eventCount:events.length,selectionCount:selections.length,selectedEvent:selections.at(-1),initialTraversalMs:performance.now()-runStarted});
  process.kill(process.pid,'SIGKILL');
 }};syncBuiltinESMExports();
 const completion=await e.hog.executeGraphTraversal({store:e.store,predecessorPrefix:opened.successorPrefix,executionBasis:e.executionBasis,openedTraversalScope:opened.scope,program:e.program,programPublication:e.publication,graphFunction:e.graphFunction,graph:e.graph,graphValidation:e.graphValidation,programValidation:e.programValidation,implementationSet:e.implementationSet,interactionSet:e.executionBasisAdmission.interactionSet,leafPort:e.leafPort,closureContract:e.closureContract,actorRuntimeBinding:{workspaceBinding:e.workspaceBinding,artifactTruth:e.artifactTruth},input:e.input,inputDigest:e.rawInput.subjectDigest,eventTime:'2026-09-30T00:00:00.000Z',correlationId:'correlation://selected-action/initial'});
 fs.fsyncSync=nativeFsync;syncBuiltinESMExports();save('unexpected-completion.json',completion);save('unexpected-events.json',e.store.readAll());save('unexpected-handoff.json',e.store.projectReopenAuthorityAndClose());throw new Error('Selected second action boundary was not reached');
} catch(error){save('host-failure.json',{message:error.message,stack:error.stack,scratch:e?.scratch??null});throw error;}
