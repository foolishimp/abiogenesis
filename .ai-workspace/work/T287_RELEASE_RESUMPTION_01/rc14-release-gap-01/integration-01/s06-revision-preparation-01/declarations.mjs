// External declaration adaptation. GTL owns every admitted carrier and leaf class.
import assert from 'node:assert/strict';

export const revisionPrograms = Object.freeze({
  intake: 'program://odd-glc/native-semantic-revision/intake@5',
  expected: 'program://odd-glc/native-semantic-revision/from-intent@5',
});

/** Source bytes are supplied by the pinned context inventory, never new job fields. */
export function revisionDeclarations({gtl,product,nativeDeclarations,original,corePublications,environment,context}) {
  const [before,d2]=original.publications;
  assert.equal(before.semanticJobLifecycle,original.lifecycle);
  const selected=before.programs.filter(p=>Object.values(revisionPrograms).includes(p.programRef));
  assert.equal(selected.length,2);
  const all=[...before.graphFunctions,...corePublications.flatMap(p=>p.graphFunctions)];
  const exactGraph=ref=>{const rows=all.filter(g=>g.name===ref);assert.equal(rows.length,1,ref);return rows[0];};
  const additional=context.dependencies;
  const declarations=selected.map(program=>{
    const leaves=program.callableMembership.flatMap(ref=>{
      const graph=exactGraph(ref);
      return graph.template.nodes.flatMap(node=>gtl.cLeafTerms(node.term).filter(leaf=>leaf.fibre==='F_P')
        .map(leaf=>({graph,leaf,role:gtl.nativeContextLeafFamily(graph,leaf)})));
    });
    const rows=leaves.map(({graph,leaf,role})=>{
      assert(['author','assessor','constructor','command_executor'].includes(role),'undeclared native family');
      const existing=environment.declaration.roles.filter(r=>r.graphFunctionRef===graph.name&&r.programLocusRef===leaf.programLocusRef&&r.role===role);
      if(role==='constructor'||role==='command_executor') {assert.equal(existing.length,1);return existing[0];}
      const posture=role==='author'?'constructor':'assessor';
      const template=environment.declaration.roles.find(r=>r.role===posture);assert(template);
      const stageRef=graph.declarations['abg.semantic_revision_stage'];
      const stage=before.semanticJobLifecycle.stages.find(s=>s.declarationRef===stageRef);
      const isSelection=graph.declarations['abg.semantic_revision_selection']!==undefined;
      assert(stage||isSelection,'only actual declared revision stage/selection roles');
      const review=isSelection||stage===before.semanticJobLifecycle.stages[0];
      const text=role==='author'
        ? 'Derive the declared affected semantic asset from complete source and admitted counterevidence. Preserve source modalities, original job rulings and genuine uncertainty. Root review is identified counterevidence, not a forced verdict. Return the canonical candidate JSON without tools or file writes.'
        : 'Independently evaluate the actual declared selection or current candidate using complete source and admitted evidence. Root review is identified counterevidence to assess, not a forced verdict. Preserve actual adverse history, source modalities and genuine gaps. Return the canonical JSON without tools or file writes.';
      const selectors=isSelection?['full_source','active_binding_semantics']:
        ['full_source','declared_predecessor_semantics','active_binding_semantics',
          ...(role==='assessor'?['current_candidate']:[]),
          ...(stage.bodyCapabilities.includes('worksite_design')?['current_worksite']:[]),
          ...(stage.bodyCapabilities.includes('application_assessment')?['admitted_execution_evidence',...(role==='assessor'?['assessor_evaluation_data']:[])]:[])];
      return {...template,graphFunctionRef:graph.name,programLocusRef:leaf.programLocusRef,role,
        frameRefs:[...new Set([...template.frameRefs,...context.standardFrames,...(review?[context.reviewFrame]:[])])].sort(),
        policy:{policyRef:graph.name+'/'+role+'/s06-revision-context@5',text,digest:product.sha256Bytes(Buffer.from(text))},
        sourceBindings:[...template.sourceBindings,...context.standardBindings,...(review?[context.reviewBinding]:[])],
        contextPolicy:{policyRef:graph.name+'/'+role+'/s06-selection@5',selectors}};
    });
    const roles=nativeDeclarations.constructNativeRevisionEnvironmentRoles({publication:before,roles:rows});
    return gtl.constructRunEnvironmentDeclaration({...environment.declaration,
      declarationRef:'environment://s06-witness/adverse-revision/'+(program.programRef===revisionPrograms.intake?'intake':'from-intent')+'@5',
      dependencies:[...environment.declaration.dependencies,...additional],
      contexts:[...environment.declaration.contexts,...context.contexts],roles});
  });
  const after=gtl.modulePublication({...before,
    runEnvironments:[...before.runEnvironments,...declarations],
    programs:before.programs.map(program=>{
      const index=selected.findIndex(p=>p.programRef===program.programRef);
      return index<0?program:{...program,policies:{...program.policies,[gtl.RUN_ENVIRONMENT_POLICY]:declarations[index].declarationRef}};
    })});
  // Existing lifecycle, graph bodies, all unselected Programs and D2 remain unchanged.
  assert.deepEqual(after.semanticJobLifecycle,before.semanticJobLifecycle);
  assert.deepEqual(after.graphFunctions,before.graphFunctions);
  assert.deepEqual(after.programs.filter(p=>!Object.values(revisionPrograms).includes(p.programRef)),before.programs.filter(p=>!Object.values(revisionPrograms).includes(p.programRef)));
  return {...original,publications:[after,d2],revisionPrograms,declarations};
}

export function contextDeclarations({gtl,product,standards,review}) {
  const build=(name,rows)=>{
    const basisRef='source://s06-adverse-revision/'+name+'@5/';
    const members=rows.map(r=>({path:r.relativePath,type:'file',digest:product.sha256Bytes(r.bytes),target:null})).sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0);
    const record=Buffer.from(product.canonicalJson({kind:'run_environment_member_inventory',schemaVersion:'5.0.0',members})+'\n');
    assert.deepEqual(product.runEnvironmentRecordMembers('member_inventory@1',record),members);
    const dependencyRef='dependency://s06-adverse-revision/'+name+'@5',contextRef='context://s06-adverse-revision/'+name+'@5';
    const contextMembers=rows.map(r=>({memberRef:basisRef+r.relativePath,path:r.relativePath,byteCount:r.bytes.length,digest:product.sha256Bytes(r.bytes)}));
    return {name,record,dependency:{dependencyRef,basisRef,recordRef:basisRef+'inventory.json',recordDigest:product.sha256Bytes(record),recordFormat:'member_inventory@1',inventoryDigest:gtl.stdoInventoryDigest(members),members},
      context:{contextRef,sourceLocator:basisRef,inventoryDigest:product.sha256Canonical(contextMembers),members:contextMembers},
      bindings:contextMembers.map(m=>({contextRef,memberRef:m.memberRef,memberDigest:m.digest,startByte:0,endByte:m.byteCount,spanDigest:m.digest})),frames:contextMembers.map(m=>m.memberRef)};
  };
  const a=build('lifecycle-standards',standards),r=build('root-review',[review]);
  return {dependencies:[a.dependency,r.dependency],contexts:[a.context,r.context],standardBindings:a.bindings,standardFrames:a.frames,
    reviewBinding:r.bindings[0],reviewFrame:r.frames[0],records:[a,r]};
}
