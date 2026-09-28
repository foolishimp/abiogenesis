import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdir,readFile,writeFile,symlink} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {setupInstalledRootCatalog,rawProgramInput} from '../support/root-installed-environment.mjs';
import {prepareRegisteredSelectionProduct,constructInstalledStartCall,constructInstalledRunReadCall,runInstalledCliRequest} from '../support/registered-graph-selection.mjs';
import {ref,contract,select} from '../fixtures/registered-selection-product/index.mjs';
const packageRoot=new URL('../..',import.meta.url).pathname;
const evidence=resolve(packageRoot,'../../../.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/registered-selection-implementation');
const save=async(name,value)=>writeFile(join(evidence,name),JSON.stringify(value,null,2)+'\n');

test('registered selection through installed Public CLI, child foldback and fresh reads',async()=>{
  await mkdir(evidence,{recursive:true});
  let frozenArtifact;
  try { frozenArtifact=JSON.parse(await readFile(join(evidence,'frozen-artifact.json'),'utf8')); } catch {}
  const accounting={wallMs:{}};
  const environment=await setupInstalledRootCatalog({after:()=>{}},packageRoot,{candidateBasisSource:'packed_artifact',workspaceProductIndex:1,setupAccounting:accounting,
    ...(frozenArtifact?{frozenArtifact}:{}),prepareAdditionalProducts:async basis=>[await prepareRegisteredSelectionProduct(basis)]});
  const {product,gtl}=environment;
  if (!frozenArtifact) {
    const installHost=join(evidence,'frozen-host');
    await mkdir(join(installHost,'node_modules/@abiogenesis'),{recursive:true});
    await symlink(environment.installedRoot,join(installHost,'node_modules/@abiogenesis/typescript-tenant'));
    frozenArtifact={artifactPath:environment.artifactPath,installHost,artifactSha256:await product.sha256File(environment.artifactPath)};
    await save('frozen-artifact.json',frozenArtifact);
  }
  await save('setup.json',{scratch:environment.scratch,installedRoots:environment.installedRoots,artifactPaths:environment.artifactPaths,accounting});
  environment.catalogView=product.narrowGraphFunctionCatalog(environment.catalog,['root','A','B'].map(n=>ref('graph-function',n)));
  assert.equal(environment.catalogView.kind,'graph_function_catalog_view');
  const declaration=environment.additionalPublications[0];
  const root=declaration.graphFunctions.find(g=>g.name===ref('graph-function','root'));
  assert.equal(Object.hasOwn(declaration.programs[0],'constructionComposition'),false);
  const catalog=['A','B'].map(name=>{const entry=environment.catalogView.entries.find(e=>e.definitionRef===ref('graph-function',name));return {name,graphFunctionRef:entry.definitionRef,definitionDigest:entry.definitionDigest};});
  const digests=Object.fromEntries(catalog.map(c=>[c.graphFunctionRef,c.definitionDigest]));
  const source={currentNodeRef:ref('node','select'),termPath:gtl.rootCSourcePath(ref('node','select'))};
  const choice=select({choice:'A',catalog,payload:'exact'}).resultCandidate;
  assert.equal(gtl.resolveRegisteredSelection({...root.template,applications:[]},source,contract('choice'),choice,digests),null,'choice-shaped ordinary data must not activate selection');
  const duplicate={...root.template,edges:[...root.template.edges,root.template.edges[0]]};
  assert.throws(()=>gtl.resolveRegisteredSelection(duplicate,source,contract('choice'),choice,digests),/mismatch/);
  assert.throws(()=>gtl.resolveRegisteredSelection(root.template,source,contract('result'),choice,digests),/contract mismatch/);
  const ambiguousPublication = structuredClone(declaration);
  const ambiguousRoot = ambiguousPublication.graphFunctions.find(g => g.name === root.name);
  ambiguousRoot.template.nodes[2].term.graphFunctionRef = ref('graph-function','A');
  const ambiguousRaw = environment.validator.rawAdmitValue(ambiguousPublication, 'module_publication', 'contract://abiogenesis/gtl/module-publication@5');
  const ambiguous = environment.validator.validateProgram(rawProgramInput(environment.validator, ambiguousRaw, ambiguousPublication.programs[0]));
  assert.notEqual(ambiguous.kind, 'program_validation', 'ambiguous declaration must not admit');
  const singular = {...root.template,nodes:root.template.nodes.slice(0,2),edges:root.template.edges.slice(0,1)};
  assert.equal(gtl.resolveRegisteredSelection(singular,source,contract('choice'),choice,digests).graphFunctionRef,ref('graph-function','A'));
  await save('mechanical.json',{undeclaredData:'ordinary',ambiguousTarget:'refused',wrongResultContract:'refused',singular:'preserved',ambiguousDeclaration:ambiguous});
  const load=async path=>import(pathToFileURL(join(environment.installedRoot,`build/code/src/${path}.js`)).href);
  const publicApi=await load('public/index');
  const projectReadContracts=await load('abg/project_read_operation_contracts');
  let handoff=environment.store.projectReopenAuthorityAndClose();
  const cases=[];
  for(const name of ['A','B','nonpermitted','stale','wrong-contract','wrong-input','gap']) {
    const input={kind:'selection_request',choice:name,payload:`payload:${name}`,catalog};
    const resource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)};
    const {call,resolution}=await constructInstalledStartCall({environment,publicApi,eventResource:resource,input,identity:name});
    const execution=await runInstalledCliRequest({scratch:environment.scratch,installedRoot:environment.installedRoot,identity:name,acquisition:{kind:'reopen',closeHandoff:handoff},call,expectedExitCode:null});
    await save(`case-${name}.json`,execution);
    const receipt=execution.output.receipt;
    assert.ok(receipt,JSON.stringify(execution.output));
    assert.equal(receipt.failure,null,JSON.stringify(receipt.failure));
    handoff=receipt.resources.eventResource.closeHandoff;
    const log=await readFile(new URL(handoff.prefix.eventLogRef));
    const slice=log.subarray(resource.closeHandoff.prefix.prefixLength).toString('utf8').trim().split('\n').map(JSON.parse);
    await save(`events-${name}.json`,slice);
    console.log(name,receipt.ownerOutput.value?.disposition,`${execution.wallMs.toFixed(1)}ms`);
    cases.push({name,wallMs:execution.wallMs,ownerOutput:receipt.ownerOutput,eventBytes:Buffer.byteLength(JSON.stringify(slice)),programDigest:resolution.resolution.programDigest});
    await save('cases.json',cases);
    if (['A','B'].includes(name)) {
      assert.equal(receipt.ownerOutput.value.disposition,'completed',JSON.stringify(receipt.ownerOutput));
      assert.deepEqual(slice.filter(e=>e.kind==='graph_call_opened').map(e=>e.graphFunctionRef),[root.name,ref('graph-function',name)],'only selected child opens');
      const route = slice.find(e=>e.kind==='traversal_route_admitted' && e.payload.registeredSelectionApplicationRef);
      assert.equal(route.payload.registeredSelectionApplicationRef,root.template.applications[0].applicationRef);
      assert.deepEqual(route.payload.boundInput.value,{kind:'selection_child_input',payload:input.payload});
      const childBasis = slice.find(e=>e.kind==='basis_admitted' && e.payload.basisClass==='child');
      assert.deepEqual(childBasis.payload.rawInputValue,route.payload.boundInput.value);
      assert.equal(childBasis.payload.rawInputAdmissionRef,route.payload.boundInput.admissionRef);
      assert.equal(childBasis.payload.graphFunctionDigest,digests[ref('graph-function',name)]);
      assert.equal(slice.filter(e=>e.kind==='child_foldback_admitted').length,1);
      assert.equal(slice.filter(e=>e.kind==='run_closed').length,1);
      assert.equal(slice.some(e=>e.kind==='construction_intent_selected'),false);
      assert.deepEqual(receipt.ownerOutput.value.terminalResult.value,{kind:'selection_result',schemaVersion:'5.0.0',child:name,payload:input.payload});
      for(const memberKey of ['run_result','run_replay']) {
        const eventResource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)};
        const {call:readCall}=constructInstalledRunReadCall({environment,publicApi,projectReadContracts,memberKey,selector:memberKey==='run_result'?{kind:'none'}:{kind:'ordinal_page',fromOrdinal:0,limit:1024},source:receipt.resources.run,eventResource,identity:`${name}-${memberKey}`});
        const read=await runInstalledCliRequest({scratch:environment.scratch,installedRoot:environment.installedRoot,identity:`${name}-${memberKey}`,acquisition:{kind:'reopen',closeHandoff:handoff},call:readCall});
        await save(`read-${name}-${memberKey}.json`,read);
        assert.equal(read.output.receipt.ownerOutput.outcomeKind,'result',JSON.stringify(read.output));
        assert.deepEqual(read.output.receipt.resources.eventResource.closeHandoff.prefix,handoff.prefix);
        const projection=read.output.receipt.ownerOutput.value.projection;
        assert.deepEqual(projection.replay,receipt.resources.replay);
        assert.deepEqual(projection.terminalResult,receipt.ownerOutput.value.terminalResult);
        if(memberKey==='run_result') assert.deepEqual(projection.result,receipt.ownerOutput.value.result);
        else assert.equal(projection.status,'closed');
      }
    } else {
      assert.deepEqual(slice.filter(e=>e.kind==='graph_call_opened').map(e=>e.graphFunctionRef),[root.name],'negative choice must not launch child');
      assert.equal(slice.some(e=>e.kind==='child_foldback_admitted'||e.kind==='run_closed'),false);
      assert.equal(receipt.ownerOutput.value.terminalResult,null);
      assert.equal(receipt.ownerOutput.value.disposition,name==='gap'?'blocked':'runtime_failed');
    }
  }
  assert.equal(new Set(cases.map(c=>c.programDigest)).size,1,'all requests use one immutable Program');
  await writeFile(join(evidence,'events.jsonl'),await readFile(new URL(handoff.prefix.eventLogRef)));
  await save('final-handoff.json',handoff);
});
