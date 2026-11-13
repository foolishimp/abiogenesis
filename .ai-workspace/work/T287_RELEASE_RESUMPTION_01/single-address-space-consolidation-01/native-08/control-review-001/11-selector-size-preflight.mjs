// Operator predictive measurement through the installed projection/render owners.
// Historical observations retain their actual identities; none is a future Result.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {join,dirname} from 'node:path';
import {createHash} from 'node:crypto';

export async function measureSelectorCapacity({input,observation,installedRoot,campaign,product}) {
  const sha=b=>createHash('sha256').update(b).digest('hex');
  const read=async p=>JSON.parse(await readFile(p,'utf8'));
  const pin=async p=>{const b=await readFile(p);return {path:p,bytes:b.length,sha256:sha(b)};};
  const ownerPath=join(installedRoot,'build/code/src/product/default_library.js');
  const owner=await import(pathToFileURL(ownerPath));
  const rendererPath=join(installedRoot,'build/code/src/abg/instruction_assembly.js');
  const renderer=await readFile(rendererPath,'utf8');
  assert(renderer.includes('return order.map(name => `## ${name}\\n${canonicalJson(sections[name])}`).join("\\n\\n");'),'Installed section rendering changed');
  const assembliesPath=join(campaign,'native-07/selector-capacity-triage/actual-selector-assemblies.json');
  const assemblyBytes=await readFile(assembliesPath);
  assert.equal(sha(assemblyBytes),'af4f61ac1767fa98e718be097d9fa7a7354eea0603f8ad4f79b2aa257898684f');
  const actual=JSON.parse(assemblyBytes).out,last=actual.at(-1);
  const order=['role','choices','task','binding','evidence','response'];
  const render=s=>order.map(n=>'## '+n+'\n'+product.canonicalJson(s[n])).join('\n\n');
  const size=v=>Buffer.byteLength(product.canonicalJson(v));
  for(const row of actual){
    const bytes=await readFile(row.paths.prompt);
    assert.equal(bytes.length,row.assembly.manifest.promptByteCount);
    assert.equal('sha256:'+sha(bytes),row.assembly.manifest.promptBytesDigest);
    assert.equal(render(row.assembly.sections),bytes.toString('utf8'));
  }
  for(const key of ['role','choices','evidence'])assert.equal(product.canonicalJson(actual[0].assembly.sections[key]),product.canonicalJson(last.assembly.sections[key]));
  const oldTaskPath=join(campaign,'native-07/ACTUAL_POST_C2_SELECTOR_TASK.json');
  const oldTaskBytes=await readFile(oldTaskPath);
  assert.equal(sha(oldTaskBytes),'a9f2f0c0b8dcbdc4de224b675930e9f4c88ec9da15919cb26eb8cc091f3e8bb7');
  const oldTask=JSON.parse(oldTaskBytes),reserveBytes=131072;
  const rows=[];
  const measure=(phase,state,{allowanceBytes=0,standing}={})=>{
    const diagnostic={kind:'framed_synthesis_task',schemaVersion:'5.0.0',state,context:observation};
    const sections={...last.assembly.sections,
      task:owner.projectFramedSynthesisPromptTask(diagnostic),
      response:owner.framedSynthesisResponseSchema(diagnostic,last.assembly.targetBindings)};
    const rendered=render(sections),baseBytes=Buffer.byteLength(rendered),promptBytes=baseBytes+allowanceBytes;
    rows.push({phase,standing,baseEnvelopeBytes:baseBytes,allowanceBytes,promptBytes,
      taskProjectionBytes:size(sections.task),sectionBytes:Object.fromEntries(order.map(k=>[k,size(sections[k])])),
      maxPromptBytes:input.original.maxPromptBytes,headroomBytes:input.original.maxPromptBytes-promptBytes,
      reserveBytes,fitsWithReserve:promptBytes+reserveBytes<input.original.maxPromptBytes});
  };
  measure('initial_selector',input,{standing:'Exact final initial state/context with verified current STDO3.0.4 role/choice/evidence and installed response-schema owner. Historical binding shape remains a labelled byte premise, not a future basis.'});
  const afterConstruction={...oldTask.state,original:input.original,
    observations:oldTask.state.observations.filter(o=>o.purpose==='construction')};
  measure('post_construction_selector',afterConstruction,{allowanceBytes:4096,
    standing:'Exact historical native07 construction observation/prior judgment with final current sources/context. 4KiB allowance covers future handoff/file-metadata growth; no future Result or handoff invented.'});
  const afterC2={...oldTask.state,original:input.original};
  measure('post_C2_selector',afterC2,{allowanceBytes:4096,
    standing:'Actual complete native07 construction/C2 observations and prior judgment retained as historical baseline; final current source/command/file extents. 4KiB future metadata allowance, plus separate reserve.'});
  const historicalUatPath=join(dirname(campaign),'rc5-performance-01/f4-03-r1/CLOSED_CONJUNCTION_OBSERVATION.json');
  const historicalUatBytes=await readFile(historicalUatPath);
  assert.equal(sha(historicalUatBytes),'9f7e56cdce252a5bc7fb245d50289c7a0f4b1d9e9ae2899549a9f30c720c8522');
  const historicalUat=JSON.parse(historicalUatBytes).uatObservation;
  assert.equal(historicalUat.purpose,'uat');
  assert.equal(historicalUat.value.disposition,'satisfied');
  const afterUat={...afterC2,observations:[...afterC2.observations,historicalUat]};
  measure('post_UAT_selector_historical_satisfied',afterUat,{allowanceBytes:4096,
    standing:'Unchanged actual historical satisfied UAT observation from the bounded RC5 cut, used only as a size/domain baseline alongside current controls. It is not current-scope UAT evidence.'});
  measure('post_UAT_selector_adverse_or_indeterminate_allowance',afterUat,{allowanceBytes:36864,
    standing:'Same unchanged historical UAT envelope plus 32KiB explicit adverse/indeterminate diagnostic/domain allowance and 4KiB metadata allowance. No assessment body is altered under an actual Result ref. Larger future free text is unmeasured.'});

  // Native06 produced a real assessor task but refused preparation. Its task
  // identity stays historical in this rendering diagnostic; current streams
  // are taken whole from the actual native07 work-state observation.
  const assessorPath=join(campaign,'native-06/ACTUAL_UAT_TASK.json');
  const assessorBytes=await readFile(assessorPath);
  assert.equal(sha(assessorBytes),'f8d585d107f847decc652cef2f93a230c1f0b863e5e4d763c3d22bd77aba9455');
  const assessor=JSON.parse(assessorBytes);
  const testing=oldTask.state.observations.find(o=>o.purpose==='testing');assert(testing);
  for(const command of testing.value.commandResults)for(const stream of [command.stdout,command.stderr]){
    assert.equal(stream.encoding,'utf8');const b=Buffer.from(stream.text,'utf8');
    assert.equal(b.length,stream.byteLength);assert.equal('sha256:'+sha(b),stream.digest);
  }
  const index=assessor.instructions.findIndex(s=>s.startsWith('This independent assessment consumes its full authenticated producer,'));
  assert(index>=0);const prefix=assessor.instructions[index].slice(0,assessor.instructions[index].indexOf('{'));
  const producer={resultRef:testing.resultRef,resultDigest:testing.resultDigest,cCallRef:testing.cCallRef,
    actorInvocationRef:testing.actorInvocationRef,
    commandResults:testing.value.commandResults.map(r=>Object.fromEntries(['commandId','ordinal','observationRef','observationDigest','exitStatus','stdout','stderr'].map(k=>[k,r[k]]))),
    predicateObservations:testing.value.predicateObservations};
  assessor.instructions[index]=prefix+JSON.stringify(producer);
  assessor.instructions[1]=input.original.workOrders.uat.instructions.join('\n');
  assessor.instructions[2]='Conserved original task: '+input.original.task;
  assessor.instructions[6]='Governing full-original assessment outcome: '+input.original.task;
  assessor.outcome=input.original.workOrders.uat.outcome;
  assessor.context={...assessor.context,readRoots:input.original.readRoots,entries:observation.entries};
  assessor.readFirst=[...new Set([...input.original.workOrders.uat.readFirst,...input.original.assessment.sources,
    input.original.assessment.candidatePath,input.original.assessment.rubricPath])];
  assessor.assessment.sources=input.original.assessment.sources.map(path=>{
    const entry=observation.entries.find(e=>e.relativePath===path);assert.equal(entry?.state,'file',path);
    return {path,digest:entry.digest};
  });
  assessor.checks=input.original.workOrders.uat.checks;assessor.writeRoots=[];
  const rolePath=join(campaign,'native-06/uat-capacity-triage-001/actual-role-content.json');
  const roles=await read(rolePath),role=roles.roles.find(r=>r.role==='assessor').content;
  const nativeOwnerPath=join(installedRoot,'build/code/src/product/native_workspace_work.js');
  const {renderNativeWorkspaceWorkOrder}=await import(pathToFileURL(nativeOwnerPath));
  const assessorRendered='Declared role context:\n'+product.canonicalJson(role)+'\n\n'+renderNativeWorkspaceWorkOrder(assessor);
  const assessorBaseBytes=Buffer.byteLength(assessorRendered),assessorAllowance=4096;
  rows.push({phase:'UAT_assessor',standing:'Installed native-work renderer; actual closed STDO3.0.4 assessor role and full actual native07 C2 streams/predicates; final assessment source/read scopes and task text. Native06 parent/candidate/advisory identities remain historical diagnostic labels. 4KiB formatting/metadata allowance; no actual future assessor task claimed.',
    baseEnvelopeBytes:assessorBaseBytes,allowanceBytes:assessorAllowance,promptBytes:assessorBaseBytes+assessorAllowance,
    maxPromptBytes:input.original.maxPromptBytes,headroomBytes:input.original.maxPromptBytes-assessorBaseBytes-assessorAllowance,
    reserveBytes,fitsWithReserve:assessorBaseBytes+assessorAllowance+reserveBytes<input.original.maxPromptBytes});
  const initial=rows[0];
  return {kind:'predictive_current_role_multi_stage_capacity',
    installedRenderer:await pin(rendererPath),taskProjectionOwner:await pin(ownerPath),nativeWorkRenderer:await pin(nativeOwnerPath),
    actualCurrentSelectorAssemblies:await pin(assembliesPath),actualHistoricalPostC2Task:await pin(oldTaskPath),
    historicalUatObservation:await pin(historicalUatPath),historicalAssessorTask:await pin(assessorPath),actualAssessorRole:await pin(rolePath),
    currentContextDigest:observation.observationDigest,currentInputDigest:product.sha256Canonical(input),sourceCount:input.original.sources.length,
    taskProjectionBytes:initial.taskProjectionBytes,promptBytes:initial.promptBytes,promptBound:input.original.maxPromptBytes,reserveBytes,
    fitsWithReserve:rows.every(r=>r.fitsWithReserve),phases:rows,providerCalls:0,RunAdmissions:0,
    limits:['All rows are predictive accounting; existing actual runtime assembly/refusal remains authoritative.',
      'Actual historical observations retain their identities and bodies. Cross-subject diagnostic combinations establish no semantic adequacy, currentness or future Result.',
      'Future candidate/handoff metadata and free text are bounded only by stated allowances/reserve, not by a universal proof; arbitrary unbounded output remains unknown.',
      'Selector source extents must still preserve every decision-bearing premise; exact full read inputs and assessment sources retain their separate roles.']};
}
