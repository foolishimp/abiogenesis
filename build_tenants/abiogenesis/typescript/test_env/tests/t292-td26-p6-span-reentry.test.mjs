import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {setupInstalledRootCatalog} from '../support/root-installed-environment.mjs';
import {prepareDeveloperMiniProduct} from '../support/developer-mini-product.mjs';
import {constructInstalledStartCall,constructInstalledRunReadCall,runInstalledCliRequest} from '../support/registered-graph-selection.mjs';
const root=new URL('../..',import.meta.url).pathname;

// S03's generic span obligations now belong to the kept F_D mini Program:
// pure cursor derivation plus real installed route, progressed input and replay.
// All runtime evidence below is emitted by the actual installed owners.
test('kept F_D span re-entry preserves cursor, progressed input, six basis fields and cold replay',async t=>{
 const e=await setupInstalledRootCatalog(t,root,{candidateBasisSource:'packed_artifact',workspaceProductIndex:1,
  prepareAdditionalProducts:async({scratch})=>{
   const prepared=await prepareDeveloperMiniProduct(root,scratch);
   prepared.loadInstalledPublication=async({installedRoot,verified})=>{
    const module=await import(pathToFileURL(join(installedRoot,'build/index.js')).href);
    return module.constructDeveloperMiniPublication({productId:verified.productId,artifactDigest:verified.artifactDigest,productContentDigest:verified.productContentDigest,productManifestDigest:verified.manifestDigest,packageName:verified.packageName,packageVersion:verified.packageVersion});
   };return [prepared];
  }});
 const ids=e.additionalProducts[0].ids,publication=e.additionalPublications[0];
 assert.equal(publication.programs.length,5,'greeting, ticket, span, identity and mixed-fibre Programs stay');
 e.catalogView=e.product.narrowGraphFunctionCatalog(e.catalog,[ids.spanGraphFunctionRef]);assert.equal(e.catalogView.kind,'graph_function_catalog_view');
 const load=p=>import(pathToFileURL(join(e.installedRoot,'build/code/src/'+p+'.js')).href);
 const [api,gtl,traversal,cursors,paths,reads]=await Promise.all(['public/index','gtl/index','hog/traversal','abg/traversal_cursor','gtl/source_path','abg/project_read_operation_contracts'].map(load));
 const input={kind:'developer_greeting_input',schemaVersion:'5.0.0',name:'Span'};
 const graphFunction=publication.graphFunctions.find(g=>g.name===ids.spanGraphFunctionRef);
 const graph=gtl.materializeGraph(graphFunction,{invocationAdmissionRef:'invocation-admission://td26p6/pure',admittedInputRef:'input://td26p6/pure',admittedInputDigest:e.product.sha256Canonical(input),admittedInput:input});
 const app=graph.template.applications[0],source=paths.resolveCProgramLocus(graph.template,app.sourceProgramLocusRef),target=paths.resolveCProgramLocus(graph.template,app.targetProgramLocusRef);
 const cursor=cursors.constructTraversalCursorCandidate({programRef:ids.spanProgramRef,executionBasisRef:'execution-basis://td26p6/pure',traversalScopeRef:'scope://td26p6/pure',runId:'run://td26p6/pure',graphCallId:'graph-call://td26p6/pure',frameId:'frame://td26p6/pure',graphRef:graph.materializationRef,inputRef:'input://td26p6/pure',inputDigest:e.product.sha256Canonical(input),currentNodeRef:source.nodeRef,position:'at_term',termPath:source.termPath,taskOrdinal:null,attempt:1,retryPath:[]});
 const derived=traversal.deriveGraphSpanReentryCursor(graph,cursor,app,{inputRef:'input://td26p6/reentry',inputDigest:e.product.sha256Canonical({reentry:true})});
 assert.equal(derived.kind,'traversal_cursor');assert.deepEqual(derived.termPath,target.termPath);assert.equal(derived.attempt,2);
 let handoff=e.store.projectReopenAuthorityAndClose();
 const resource=()=>({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:e.product.sha256Canonical(handoff)});
 const made=await constructInstalledStartCall({environment:e,publicApi:api,eventResource:resource(),identity:'td26p6-span',programRef:ids.spanProgramRef,input});
 const execution=await runInstalledCliRequest({scratch:e.scratch,installedRoot:e.installedRoot,identity:'td26p6-span',acquisition:{kind:'reopen',closeHandoff:handoff},call:made.call,expectedExitCode:null});
 const receipt=execution.output.receipt;assert.ok(receipt,JSON.stringify(execution.output).slice(0,2000));assert.equal(receipt.failure,null,JSON.stringify(receipt.failure));
 assert.equal(receipt.ownerOutput.outcomeKind,'result',JSON.stringify(receipt.ownerOutput));assert.equal(receipt.ownerOutput.value.disposition,'completed',JSON.stringify(receipt.ownerOutput));
 assert.deepEqual(receipt.ownerOutput.value.terminalResult.value,{kind:'developer_greeting_output',schemaVersion:'5.0.0',message:'Welcome Span.'});
 handoff=receipt.resources.eventResource.closeHandoff;
 const rows=e.abg.readRuntimeEventsAtDurablePrefix(handoff.prefix),runRows=rows.filter(r=>r.runId===receipt.resources.run.ref);
 const reentry=runRows.filter(r=>r.kind==='traversal_route_admitted'&&r.payload.routeKind==='re_enter');assert.equal(reentry.length,1);
 const selection=runRows.find(r=>r.kind==='c_call_result_admitted'&&r.payload.value?.kind==='graph_span_selection'&&r.payload.value.disposition==='re_enter');assert.ok(selection);
 assert.deepEqual(selection.payload.value.targetInput,{kind:'developer_span_state',schemaVersion:'5.0.0',name:'Span',targetVisits:1,reentryApplications:1});
 const calls=runRows.filter(r=>r.kind==='c_call_opened');assert.deepEqual(calls.map(r=>r.payload.programLocusRef),[ids.spanInitializeLocusRef,ids.spanTargetLocusRef,ids.spanSelectorLocusRef,ids.spanTargetLocusRef,ids.spanSelectorLocusRef,ids.spanFinalizeLocusRef]);
 const targetCalls=calls.filter(r=>r.payload.programLocusRef===ids.spanTargetLocusRef);assert.equal(targetCalls[1].payload.attempt,2);
 const bases=rows.filter(r=>r.kind==='basis_admitted'&&r.payload.programRef===ids.spanProgramRef);assert.equal(bases.length,1);
 const {basisRef,basisDigest,...body}=bases[0].payload;
 const constants={actionCatalogRef:null,actionCatalogDigest:null,actionCatalogRows:[],constructionCompositionRef:null,constructionCompositionDigest:null,constructionComposition:null};
 for(const [key,value]of Object.entries(constants)){assert.ok(Object.hasOwn(body,key),key);assert.deepEqual(body[key],value,key);}
 assert.equal(e.product.sha256Canonical(body),basisDigest,'all six serialized fields belong to the exact admitted body');
 const boundary=handoff.prefix,cold={};
 for(const memberKey of ['run_result','run_replay']){
  const {call}=constructInstalledRunReadCall({environment:e,publicApi:api,projectReadContracts:reads,memberKey,selector:memberKey==='run_result'?{kind:'none'}:{kind:'ordinal_page',fromOrdinal:0,limit:1024},source:receipt.resources.run,eventResource:resource(),identity:'td26p6-span-'+memberKey});
  const output=await runInstalledCliRequest({scratch:e.scratch,installedRoot:e.installedRoot,identity:'td26p6-span-'+memberKey,acquisition:{kind:'reopen',closeHandoff:handoff},call,expectedExitCode:null});
  const r=output.output.receipt;assert.equal(r.failure,null);assert.equal(r.ownerOutput.outcomeKind,'result',JSON.stringify(r.ownerOutput));
  if(memberKey==='run_replay')assert.equal(r.ownerOutput.value.projection.status,'closed');
  handoff=r.resources.eventResource.closeHandoff;assert.deepEqual(handoff.prefix,boundary);cold[memberKey]=r.ownerOutput;
 }
 const proof={run:receipt.resources.run,basisRef,basisDigest,constants,derived,reentry,selection,calls,terminalResult:receipt.ownerOutput.value.terminalResult,cold,eventRows:rows.length,prefix:boundary};
 if(process.env.ABI5_P6_PROOF_ROOT){await mkdir(process.env.ABI5_P6_PROOF_ROOT,{recursive:true});await writeFile(join(process.env.ABI5_P6_PROOF_ROOT,'installed-span.json'),JSON.stringify(proof,null,2)+'\n');}
 t.diagnostic(JSON.stringify({run:receipt.resources.run,basisRef,basisDigest,spanRoutes:reentry.length,leafCalls:calls.length,eventRows:rows.length,sixConstants:true,coldReplay:'closed'}));
});
