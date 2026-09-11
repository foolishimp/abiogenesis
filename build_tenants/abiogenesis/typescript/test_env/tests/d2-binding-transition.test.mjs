import assert from 'node:assert/strict';
import test from 'node:test';
import {bindingHarness} from '../support/d2-binding-harness.mjs';
import {workflowStepHarness} from '../support/d2-workflow-step-harness.mjs';

test('mechanical exact cover; unchanged initial observation crosses W only with its actual native coordinates',async()=>{
  const h=await bindingHarness(),old=h.stage.worksite,current=h.operating(old,'current'),input={kind:'semantic_revision_selection_input',schemaVersion:'5.0.0',parent:h.parent.coordinate,causes:[h.cause.coordinate]};
  const gate=()=>h.owner.worksiteRevisionEntryBindingDisposition(h.snapshot(),h.graphFunction,input,current.workspaceBinding);
  assert.equal(gate(),'basis_fork_detected');
  const cover=h.cover(old,current,h.parent.basis);
  assert.deepEqual([...h.owner.projectWorksiteRevisionBindingCover(h.snapshot(),old.workspaceBinding,current.workspaceBinding,[h.parent.basis,h.parent.basis])],[cover.eventId]);
  assert.equal(gate(),'covered');
  const origins=h.owner.projectWorksiteRevisionOrigins(h.snapshot(),h.parent.basis,old,current,[h.parent.basis.invocationAdmissionRef]);
  assert.equal(origins.length,22);assert.ok(origins.every(row=>row.kind==='pending_binding_correspondence'&&row.source.kind==='admitted_input'));
  const first=h.revision(h.parent,h.cause,current,'first');
  const origin=h.owner.projectWorksiteRevisionBindingOrigin(h.snapshot(),first.value);
  assert.equal(origin?.kind,'admitted_binding_projection');
  const prepared=await h.semantic(first.value);
  assert.ok(prepared,'shared native preparation with explicit physical-check assumption');
  assert.equal(prepared.constructionTask.targets.length,2);assert.equal(prepared.snapshotTargetRefs.length,22);assert.equal(prepared.dependencyObservations.length,20);
  assert.ok(prepared.dependencyObservations.every(row=>row.origin.kind==='admitted_binding_projection'));
  const row=current.targets[0];
  assert.equal(h.owner.worksiteRevisionOriginSurvives(h.snapshot(),{designTargetRef:old.targets[0].target.targetRef,subject:row.target.subject,observation:row.target.predecessorObservation,origin}),true);
  assert.equal(h.physicalReads,0,'all provenance replay is independent of original files');
});

test('mechanical repeated repair and partially successful C0 preserve S2/V22/R20 and earlier successful origins',async()=>{
  const h=await bindingHarness(),old=h.stage.worksite,w1=h.operating(old,'partial-w1');h.cover(old,w1,h.parent.basis);
  const first=h.revision(h.parent,h.cause,w1,'first');
  const selected=['implementation','verifier'].map(role=>w1.targets.findIndex(row=>row.role===role));
  const changed=h.replace(w1,selected[0],'one-success',{invocation:first.basis.invocationAdmissionRef,sameBytes:false});
  // This later C1 failure has no post-publication C0 residue: the completed
  // member survives, while the untouched second member retains its projection.
  const partial=h.addCall('partial-C1',{assumption:'later C1 failure lookup'}, {input:first.value,worksite:w1,
    invocation:first.basis.invocationAdmissionRef,sourceResultRef:h.parent.coordinate.resultRef,resultClass:'failure',judgment:'block'});
  const second=h.revision(first,partial,changed.next,'second');
  const origin=h.owner.projectWorksiteRevisionBindingOrigin(h.snapshot(),second.value);assert.equal(origin?.kind,'admitted_binding_projection');
  const prepared=await h.semantic(second.value);assert.ok(prepared);
  assert.equal(prepared.constructionTask.targets.length,2);assert.equal(prepared.snapshotTargetRefs.length,22);assert.equal(prepared.dependencyObservations.length,20);
  assert.deepEqual(prepared.constructionTask.targets.map(row=>row.targetRef),changed.next.targets.filter((_,i)=>selected.includes(i)).map(row=>row.target.targetRef));
  assert.deepEqual(second.value.current.assets,first.value.current.assets);
  assert.deepEqual(second.value.revisionBasis.retainedBindings,first.value.revisionBasis.retainedBindings);
  assert.equal(h.physicalReads,0);
});

test('mechanical cover cardinality, malformed inventory, broad writes and foreign branches fail closed',async()=>{
  const h=await bindingHarness(),old=h.stage.worksite,current=h.operating(old,'guards');
  const a=h.cover(old,current,h.parent.basis,{name:'cover-a'}),b=h.cover(old,current,h.parent.basis,{name:'cover-b'});
  assert.deepEqual([...h.owner.projectWorksiteRevisionBindingCover(h.snapshot(),old.workspaceBinding,current.workspaceBinding,[h.parent.basis])],[a.eventId,b.eventId],'all qualifying native occurrences retained');
  const project=value=>h.owner.projectWorksiteRevisionOrigins(h.snapshot(),h.parent.basis,old,value,[h.parent.basis.invocationAdmissionRef]);
  for(const mutate of [v=>v.targets.pop(),v=>{v.targets[1]=v.targets[0];},v=>v.targets.reverse(),v=>{v.targets[0].role='foreign';},v=>v.allowedWriteTerritories.push({relativeRoot:'.'})]){
    const wrong=structuredClone(current);mutate(wrong);assert.equal(project(wrong),null);
  }
  const foreign=h.addCall('foreign',{assumption:'foreign cause'}, {invocation:'invocation://foreign',worksite:old});
  const input={kind:'semantic_revision_selection_input',schemaVersion:'5.0.0',parent:h.parent.coordinate,causes:[foreign.coordinate]};
  assert.equal(h.owner.worksiteRevisionEntryBindingDisposition(h.snapshot(),h.graphFunction,input,current.workspaceBinding),'basis_fork_detected');
  const unauthorized={...current.workspaceBinding,admissionEventRef:'lookup-binding:unadmitted'};
  assert.equal(h.owner.projectWorksiteRevisionBindingCover(h.snapshot(),old.workspaceBinding,unauthorized,[h.parent.basis]),null);
  assert.equal(h.owner.worksiteRevisionPhysicalMatches(current),false,'unavailable physical files are not replay-derived currentness');
  assert.equal(h.physicalReads,1);
});

test('mechanical later revised Design retains its own authenticated historical coordinates across another W',async()=>{
  const h=await bindingHarness(),old=h.stage.worksite,w1=h.operating(old,'design-w1');h.cover(old,w1,h.parent.basis);
  const cut=h.revision(h.parent,h.cause,w1,'design-revision',{mode:'stage_revision'}),asset=h.stage.assets.at(-1),raw=structuredClone(asset.candidate);
  const refs=new Map(old.targets.map((row,i)=>[row.target.targetRef,w1.targets[i].target.targetRef]));
  raw.worksiteDesign.targets=raw.worksiteDesign.targets.map(row=>({...row,targetRef:refs.get(row.targetRef)}));
  raw.worksiteDesign.dependencyTargetRefs=raw.worksiteDesign.dependencyTargetRefs.map(ref=>refs.get(ref));
  const source={cCallRef:'c-call://mechanical/new-design-author',inputDigest:h.hash(cut.value),actorInvocationRef:'actor://mechanical/new-design',
    promptDigest:h.hash('mechanical prompt'),transportDigest:h.hash('mechanical transport')};
  const authored=h.product.deriveRevisionAsset(cut.value,asset.stageRef,raw,source);assert.ok(authored);
  h.addCall('new-design-author',authored,{callRef:source.cCallRef,input:cut.value,worksite:w1,invocation:cut.basis.invocationAdmissionRef,
    implementation:h.R.authorImplementationRef,sourceResultRef:h.parent.coordinate.resultRef});
  const assessed=h.product.deriveRevisionAssessment(authored,asset.stageRef,asset.assessment.candidate,{...source,cCallRef:'c-call://mechanical/new-design-assessor',
    actorInvocationRef:'actor://mechanical/new-design-assessor',inputDigest:h.hash(authored)});assert.ok(assessed);
  const parent=h.addCall('new-design-assessor',assessed,{input:authored,worksite:w1,invocation:cut.basis.invocationAdmissionRef,
    implementation:h.R.assessorImplementationRef,sourceResultRef:h.parent.coordinate.resultRef});
  const cause=h.addCall('later-command',{assumption:'failed command lookup'},{input:assessed,worksite:w1,invocation:cut.basis.invocationAdmissionRef,
    sourceResultRef:h.parent.coordinate.resultRef,resultClass:'failure',judgment:'block'});
  const w2=h.operating(w1,'design-w2');h.cover(w1,w2,parent.basis);
  const next=h.revision(parent,cause,w2,'design-next'),mapping=await h.semantic(next.value,'projectRevisionDesignCoordinates');
  assert.ok(mapping);assert.deepEqual(mapping.historicalWorksite,w1);assert.notDeepEqual(mapping.historicalWorksite,old);
  assert.equal(mapping.snapshotTargetRefs.length,22);assert.equal(mapping.selectedTargetRefs.length,2);
  const prepared=await h.semantic(next.value);assert.ok(prepared);assert.equal(prepared.constructionTask.targets.length,2);assert.equal(prepared.dependencyObservations.length,20);
});

test('mechanical C0 same-byte/new-inode survives binding translation; residue and unexplained identity refuse',async()=>{
  const h=await bindingHarness(),old=h.stage.worksite,changed=h.replace(old,0,'old-success'),current=h.operating(changed.next,'current');
  h.cover(old,current,h.parent.basis);
  const origins=h.owner.projectWorksiteRevisionOrigins(h.snapshot(),h.parent.basis,old,current,[h.parent.basis.invocationAdmissionRef]);
  assert.equal(origins?.length,22);assert.equal(origins[0].source.kind,'admitted_replacement');
  assert.equal(origins[0].source.resultAdmissionEventRef,changed.call.result.eventId);
  assert.notEqual(old.targets[0].target.predecessorObservation.observationRef,current.targets[0].target.predecessorObservation.observationRef);
  assert.equal(old.targets[0].base64,current.targets[0].base64);
  const unexplained=h.reobserve(current,[1],'unexplained');
  assert.equal(h.owner.projectWorksiteRevisionOrigins(h.snapshot(),h.parent.basis,old,unexplained,[h.parent.basis.invocationAdmissionRef]),null);
  const residue=h.replace(changed.next,1,'post-publication-failure',{failed:true});
  const residueCurrent=h.product.projectSemanticWorksiteCoordinates(residue.next,current);
  assert.equal(h.owner.projectWorksiteRevisionOrigins(h.snapshot(),h.parent.basis,old,residueCurrent,[h.parent.basis.invocationAdmissionRef]),null);
});

test('mechanical multiple binding projections retain actual origins and refuse old-W resurrection after new-W C0',async()=>{
  const h=await bindingHarness(),old=h.stage.worksite,w1=h.operating(old,'w1');h.cover(old,w1,h.parent.basis);
  const first=h.revision(h.parent,h.cause,w1,'first'),command=h.addCall('new-command',{assumption:'new closed C2 exit1 lookup'},
    {worksite:w1,invocation:first.basis.invocationAdmissionRef,input:first.value,sourceResultRef:h.parent.coordinate.resultRef});
  const input={kind:'semantic_revision_selection_input',schemaVersion:'5.0.0',parent:first.coordinate,causes:[command.coordinate]};
  assert.equal(h.owner.worksiteRevisionEntryBindingDisposition(h.snapshot(),h.graphFunction,input,w1.workspaceBinding),'covered');
  const w2=h.operating(w1,'w2');
  assert.equal(h.owner.worksiteRevisionEntryBindingDisposition(h.snapshot(),h.graphFunction,input,w2.workspaceBinding),'basis_fork_detected');
  h.cover(w1,w2,first.basis);
  assert.equal(h.owner.worksiteRevisionEntryBindingDisposition(h.snapshot(),h.graphFunction,input,w2.workspaceBinding),'covered');
  const second=h.revision(first,command,w2,'second'),origin=h.owner.projectWorksiteRevisionBindingOrigin(h.snapshot(),second.value);
  assert.equal(origin?.kind,'admitted_binding_projection');
  const retained=w2.targets[0],row={designTargetRef:old.targets[0].target.targetRef,subject:retained.target.subject,observation:retained.target.predecessorObservation,origin};
  assert.equal(h.owner.worksiteRevisionOriginSurvives(h.snapshot(),row),true);
  h.replace(w2,0,'new-write',{invocation:second.basis.invocationAdmissionRef});
  assert.equal(h.owner.worksiteRevisionOriginSurvives(h.snapshot(),row),false);
  const oldOrigin={kind:'admitted_input',basisAdmissionEventRef:h.parent.basis.admissionEventRef,inputAdmissionRef:h.parent.basis.rawInputAdmissionRef,inputDigest:h.parent.basis.rawInputDigest};
  assert.equal(h.owner.worksiteRevisionOriginSurvives(h.snapshot(),{...row,subject:old.targets[0].target.subject,observation:old.targets[0].target.predecessorObservation,origin:oldOrigin}),false);
  assert.equal(h.physicalReads,0);
});

test('mechanical exact cover rejects wrong direction, scope, historical basis and unadmitted or self projection',async()=>{
  for(const [name,mutate]of [
    ['wrong-before',row=>row.payload.beforeDigest='sha256:'+'0'.repeat(64)],
    ['reversed',row=>{const p=row.payload;[p.beforeDigest,p.afterDigest]=[p.afterDigest,p.beforeDigest];}],
    ['foreign-basis',row=>row.payload.subjectRef='basis://foreign'],
    ['wrong-operation-scope',(_row,op)=>op.payload.authorityScopeRef='binding://foreign'],
    ['missing-W-evidence',row=>row.payload.evidence.pop()],
    ['wrong-actor',row=>row.payload.actorRef='actor://foreign'],
  ]){
    const h=await bindingHarness(),old=h.stage.worksite,current=h.operating(old,name);h.cover(old,current,h.parent.basis,{mutate});
    assert.equal(h.owner.projectWorksiteRevisionBindingCover(h.snapshot(),old.workspaceBinding,current.workspaceBinding,[h.parent.basis]),null,name);
  }
  const h=await bindingHarness(),current=h.operating(h.stage.worksite,'projection');h.cover(h.stage.worksite,current,h.parent.basis);
  const first=h.revision(h.parent,h.cause,current,'first'),before=h.snapshot();
  before.events=before.events.filter(e=>e.admissionOrdinal<first.result.admissionOrdinal);
  assert.equal(h.owner.projectWorksiteRevisionBindingOrigin(before,first.value),null,'current call cannot be its own origin');
  first.fibre.payload.callClass='workflow';
  assert.equal(h.owner.projectWorksiteRevisionBindingOrigin(h.snapshot(),first.value),null,'wrapper is not projection producer');
});

test('mechanical distinct projection branches are ambiguity, never equal-value or latest-origin selection',async()=>{
  const h=await bindingHarness(),old=h.stage.worksite,current=h.operating(old,'fork');h.cover(old,current,h.parent.basis);
  const first=h.revision(h.parent,h.cause,current,'branch-a',{invocation:'invocation://mechanical/fork'});
  const cause=h.addCall('fork-command',{assumption:'linked command failure lookup'},{worksite:current,input:first.value,
    invocation:first.basis.invocationAdmissionRef,sourceResultRef:h.parent.coordinate.resultRef,resultClass:'failure',judgment:'block'});
  const input={kind:'semantic_revision_selection_input',schemaVersion:'5.0.0',parent:h.parent.coordinate,causes:[cause.coordinate]};
  assert.equal(h.owner.worksiteRevisionEntryBindingDisposition(h.snapshot(),h.graphFunction,input,current.workspaceBinding),'covered');
  h.revision(h.parent,h.cause,current,'branch-b',{invocation:first.basis.invocationAdmissionRef});
  assert.equal(h.owner.worksiteRevisionEntryBindingDisposition(h.snapshot(),h.graphFunction,input,current.workspaceBinding),'basis_fork_detected');
  assert.equal(h.owner.projectWorksiteRevisionOrigins(h.snapshot(),h.parent.basis,old,current,[h.parent.basis.invocationAdmissionRef,first.basis.invocationAdmissionRef]),null);
  assert.equal(h.owner.projectWorksiteRevisionBindingCover(h.snapshot(),old.workspaceBinding,current.workspaceBinding,
    [{...h.parent.basis,rawInputDigest:h.hash('foreign basis')}]),null);
});

test('mechanical evidence-input gate resolves a real Product new-C2 carrier through its exact earlier projection',async()=>{
  const h=await bindingHarness(),current=h.operating(h.stage.worksite,'evidence-current');h.cover(h.stage.worksite,current,h.parent.basis);
  const first=h.revision(h.parent,h.cause,current,'first'),entry=await h.semantic(first.value);assert.ok(entry);
  const template=await workflowStepHarness(),p=template.product;
  const members=entry.constructionTask.targets.map((target,ordinal)=>{
    const row=current.targets.find(row=>row.target.subject.subjectRef===target.subject.subjectRef),bytes=Buffer.from(row.base64,'base64');
    const successorObservation=p.constructWorksiteObservation({subject:target.subject,state:'file',fileIdentity:`mechanical-C2-successor:${ordinal}`,
      fileDigest:p.sha256Bytes(bytes),byteLength:bytes.length});
    const body={authorizationRef:'mechanical-unadmitted:authorization',authorizationDigest:h.hash('mechanical authorization'),
      beforeObservationRef:target.predecessorObservation.observationRef,beforeObservationDigest:target.predecessorObservation.observationDigest,
      afterObservationRef:successorObservation.observationRef,afterObservationDigest:successorObservation.observationDigest,writtenDigest:successorObservation.fileDigest,committed:true};
    const receiptDigest=h.hash(body),receipt={kind:'worksite_file_replace_receipt',schemaVersion:'5.0.0',...body,
      receiptRef:`worksite-file-replace-receipt://abiogenesis/${receiptDigest.slice(7)}`,receiptDigest};
    assert.ok(p.isWorksiteFileReplaceReceipt(receipt));return {ordinal,inputMemberRef:target.targetRef,outputMemberRef:`mechanical-unadmitted:output-${ordinal}`,receipt,successorObservation};
  });
  const body={sourceApplicationRef:p.WORKSITE_CONSTRUCTION_IDS.fanOutApplicationRef,members},resultDigest=h.hash(body);
  const source={kind:'worksite_construction_result',schemaVersion:'5.0.0',...body,resultDigest,resultRef:`worksite-construction-result://abiogenesis/${resultDigest.slice(7)}`};
  assert.ok(p.isWorksiteConstructionResult(source));
  const task=p.prepareWorksiteCommandTask({kind:'worksite_revision_command_preparation_bound_input',schemaVersion:'5.0.0',entry,source});
  const observation=template.observationFor(task,1).observation,WR=p.WORKSITE_REVISION_IDS;
  assert.ok(p.isWorksiteRevisionCommandExecutionObservation(observation));
  const gate=()=>h.owner.worksiteRevisionEntryBindingDisposition(h.snapshot(),h.graphFunction,observation,current.workspaceBinding);
  assert.equal(gate(),'basis_fork_detected','a constructed carrier is not admitted evidence');
  const observed=h.addCall('new-C2',observation,{input:task,worksite:current,invocation:first.basis.invocationAdmissionRef,sourceResultRef:h.parent.coordinate.resultRef,
    graphRef:WR.graphFunctionRef,implementation:WR.implementationRef,binding:WR.implementationBindingRef,predicate:WR.judgmentPredicateRef,outputContract:WR.observationContractRef});
  assert.equal(gate(),'covered','failed command inside actual successful observation lookup remains eligible');
  const copy=h.addCall('new-C2-fold',observation,{input:task,worksite:current,invocation:first.basis.invocationAdmissionRef,sourceResultRef:h.parent.coordinate.resultRef,
    graphRef:WR.graphFunctionRef,implementation:WR.implementationRef,binding:WR.implementationBindingRef,predicate:WR.judgmentPredicateRef,outputContract:WR.observationContractRef});
  copy.opened.payload.callClass='workflow';copy.fibre.payload.callClass='workflow';assert.equal(gate(),'covered','foldback is not a second producer');
  const selection={kind:'semantic_revision_selection_input',schemaVersion:'5.0.0',parent:first.coordinate,causes:[observed.coordinate]};
  assert.equal(h.owner.worksiteRevisionEntryBindingDisposition(h.snapshot(),h.graphFunction,selection,current.workspaceBinding),'covered');
  observed.fibre.payload.implementationRef='implementation://foreign';assert.equal(gate(),'basis_fork_detected');
});
