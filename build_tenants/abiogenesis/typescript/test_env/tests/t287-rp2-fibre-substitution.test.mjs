import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile,chmod} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {setupInstalledRootCatalog,rawProgramInput} from '../support/root-installed-environment.mjs';
import {prepareRegisteredSelectionProduct,constructInstalledStartCall,constructInstalledRunReadCall,runInstalledCliRequest} from '../support/registered-graph-selection.mjs';
import {declarations,ref} from '../fixtures/registered-selection-product/index.mjs';
const root=resolve(import.meta.dirname,'../..'),evidence=resolve(process.env.ABI5_RP2_FIBRE_EVIDENCE_ROOT??join(root,'test_env/test_runs/rp2/fibre-substitution'));
const save=async(name,value)=>writeFile(join(evidence,name),JSON.stringify(value,null,2)+'\n');
const spineKinds=['c_call_opened','c_call_fibre_selected','c_call_result_admitted','c_call_evidenced','c_call_judged','child_foldback_admitted','run_closed'];
const topology=declaration=>declaration.graphFunctions.map(g=>({name:g.name,inputs:g.inputs,outputs:g.outputs,graphRef:g.template.graphRef,start:g.template.startNodeRef,terminals:g.template.terminalNodeRefs,edges:g.template.edges,
  nodes:g.template.nodes.map(n=>({nodeRef:n.nodeRef,nodeKind:n.nodeKind,term:{...n.term,fibre:undefined}}))}));
test('RP-2 F_P to equivalent F_D substitution conserves graph and C-call spine through installed execution',async()=>{
  await mkdir(evidence,{recursive:true});
  const observations=[];
  for(const fibre of ['F_D','F_P']){
    const e=await setupInstalledRootCatalog({after:()=>{}},root,{candidateBasisSource:'packed_artifact',workspaceProductIndex:1,
      prepareAdditionalProducts:async basis=>[await prepareRegisteredSelectionProduct({...basis,declarationFactory:gtl=>{
        const d=structuredClone(declarations(gtl));
        if(fibre==='F_P'){
          d.implementationBindings.find(b=>b.implementationRef===ref('implementation','A')).computeRegime='F_P';
          const g=d.graphFunctions.find(g=>g.name===ref('graph-function','A'));g.template.nodes[0].term.fibre='F_P';g.declarations['abg.compute_regime']='F_P';
          d.programs[0].policies['abg.compute_regime']='mixed';
        }
        return d;
      },fixtureFiles:fibre==='F_D'?undefined:[{path:'build/index.js',source:new URL('../qualification/fixtures/rp2-probabilistic-product.mjs',import.meta.url)},
        {path:'build/base.js',source:new URL('../fixtures/registered-selection-product/index.mjs',import.meta.url)}]})]});
    const {product}=e,publicApi=await import(pathToFileURL(join(e.installedRoot,'build/code/src/public/index.js')).href),projectReadContracts=await import(pathToFileURL(join(e.installedRoot,'build/code/src/abg/project_read_operation_contracts.js')).href);
    e.catalogView=product.narrowGraphFunctionCatalog(e.catalog,['root','A','B'].map(n=>ref('graph-function',n)));
    const declaration=e.additionalPublications[0],rootGraph=declaration.graphFunctions.find(g=>g.name===ref('graph-function','root'));
    const catalog=['A','B'].map(name=>{const row=e.catalogView.entries.find(x=>x.definitionRef===ref('graph-function',name));return {name,graphFunctionRef:row.definitionRef,definitionDigest:row.definitionDigest};});
    let handoff=e.store.projectReopenAuthorityAndClose();
    const resource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)};
    const {call}=await constructInstalledStartCall({environment:e,publicApi,eventResource:resource,input:{kind:'selection_request',choice:'A',payload:'same admitted payload',catalog},identity:'rp2-'+fibre});
    const worker=join(e.scratch,'rp2-worker');
    await writeFile(worker,`#!/usr/bin/env node\nlet prompt='';process.stdin.setEncoding('utf8');process.stdin.on('data',b=>prompt+=b);process.stdin.on('end',()=>{const schema=JSON.parse(process.argv[process.argv.indexOf('--json-schema')+1]);const result=Object.fromEntries(Object.entries(schema.properties).map(([k,v])=>[k,v.const]));console.log(JSON.stringify({type:'system',subtype:'init',model:'rp2-controlled-boundary'}));console.log(JSON.stringify({type:'result',subtype:'success',is_error:false,result:JSON.stringify(result),structured_output:result}));});\n`);await chmod(worker,0o755);
    const execution=await runInstalledCliRequest({scratch:e.scratch,installedRoot:e.installedRoot,identity:'rp2-'+fibre,acquisition:{kind:'reopen',closeHandoff:handoff},call,expectedExitCode:null,
      environment:{PATH:process.env.PATH,ABG_TS_CLAUDE_COMMAND:worker}});
    await save(fibre+'-receipt.json',execution);const receipt=execution.output.receipt;assert.equal(receipt.failure,null,JSON.stringify(receipt));
    const before=handoff.prefix.prefixLength;handoff=receipt.resources.eventResource.closeHandoff;
    const bytes=await readFile(new URL(handoff.prefix.eventLogRef)),events=bytes.subarray(before).toString().trim().split('\n').map(JSON.parse);await save(fibre+'-events.json',events);
    assert.equal(receipt.ownerOutput.value.disposition,'completed',JSON.stringify(receipt.ownerOutput));
    const {call:readCall}=constructInstalledRunReadCall({environment:e,publicApi,projectReadContracts,memberKey:'run_replay',source:receipt.resources.run,selector:{kind:'ordinal_page',fromOrdinal:0,limit:1024},eventResource:{...resource,closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)},identity:fibre+'-replay'});
    const replay=await runInstalledCliRequest({scratch:e.scratch,installedRoot:e.installedRoot,identity:fibre+'-replay',acquisition:{kind:'reopen',closeHandoff:handoff},call:readCall,expectedExitCode:null});await save(fibre+'-replay.json',replay);assert.equal(replay.output.receipt.failure,null,JSON.stringify(replay));
    assert.equal(replay.output.receipt.resources.eventResource.closeHandoff.prefix.prefixDigest,handoff.prefix.prefixDigest);
    assert.equal(replay.output.receipt.ownerOutput.outcomeKind,'result');
    assert.equal(replay.output.receipt.ownerOutput.value.projection.status,'closed');
    assert.equal(events.filter(e=>e.kind==='c_call_judged'&&e.payload.judgment==='advance').length,3);
    assert.equal(events.filter(e=>e.kind==='c_call_fibre_selected'&&e.payload.implementationRef===ref('implementation','A'))[0].payload.regime,fibre);
    assert.equal(events.filter(e=>e.kind==='actor_invocation_closed'&&e.payload.disposition==='success').length,fibre==='F_P'?1:0);
    const loci=new Map(events.filter(e=>e.kind==='c_call_opened').map(e=>[e.payload.cCallRef,e.payload.programLocusRef]));
    const invalid=structuredClone(declaration),binding=invalid.implementationBindings.find(b=>b.implementationRef===ref('implementation','A'));binding.outputContractRef=ref('contract','choice');
    const raw=e.validator.rawAdmitValue(invalid,'module_publication','contract://abiogenesis/gtl/module-publication@5');
    const validation=e.validator.validateProgram(rawProgramInput(e.validator,raw,invalid.programs[0]));assert.notEqual(validation.kind,'program_validation','substitution with a different output boundary refuses');
    observations.push({fibre,topology:topology(declaration),spine:events.filter(e=>spineKinds.includes(e.kind)).map(e=>({kind:e.kind,graphFunctionRef:e.graphFunctionRef,programLocusRef:loci.get(e.payload.cCallRef)??null})),
      result:receipt.ownerOutput.value.terminalResult.value,rootGraph:rootGraph.name,fibreSelected:events.filter(e=>e.kind==='c_call_fibre_selected').map(e=>({regime:e.payload.regime,implementationRef:e.payload.implementationRef})),negative:validation});
  }
  assert.deepEqual(observations[0].topology,observations[1].topology);
  assert.deepEqual(observations[0].spine,observations[1].spine);
  assert.deepEqual(observations[0].result,observations[1].result);
  await save('result.json',{status:'passed',observations,proof:'installed mechanical differential through controlled local F_P transport; no probabilistic adequacy or human-response claim'});
});
