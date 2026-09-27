import {isDeepStrictEqual as same} from 'node:util';
import {ids, stages, constructionStages, evaluationStages, assessmentStages, preservedConstructionStages, bindingFor, contract, inputContract, evaluatorInputContract, nativeConstructionInputContract, constructionStateContract, evaluationStateContract, assessmentInputContract, assessmentStateContract, preservedConstructionInputContract, VERSION, PACKAGE_NAME, PACKAGE_VERSION, roles, dependencyKind} from './program-construction-contracts.mjs';
import {rawContract as assessmentResultContract} from './native-continuation-contracts.mjs';
export const need = (condition, message) => { if (!condition) throw new TypeError(message); };
const text = x => typeof x === 'string' && x.trim().length > 0;
const unique = xs => Array.isArray(xs) && xs.every(text) && new Set(xs).size === xs.length;
export const coordinate = x => x && text(x.ref) && /^sha256:[a-f0-9]{64}$/.test(x.digest);
export const freeze = x => { if(x && typeof x==='object' && !Object.isFrozen(x)){Object.values(x).forEach(freeze);Object.freeze(x);}return x; };

/** Interpretation is supplied with its source basis; this function proves no prose meaning. */
export function checkModel(model) {
  need(model && text(model.taskRef) && coordinate(model.interpretation) && unique(model.bindingRefs) &&
    model.bindingRefs.length > 0 && Array.isArray(model.sourceRefs) && model.sourceRefs.length > 0 &&
    model.sourceRefs.every(coordinate) && Array.isArray(model.duties), 'source-linked interpreted model required');
  const refs=model.duties.map(d=>d.ref);
  need(unique(refs), 'unique duty references required');
  for(const d of model.duties) {
    need(text(d.obligationRef) && model.bindingRefs.includes(d.bindingRef) && roles.includes(d.role) &&
      unique(d.requires) && d.requires.every(r=>refs.includes(r)) && unique(d.scopeRefs) && d.scopeRefs.length>0 &&
      ['true','false','unknown'].includes(d.applicability?.value) && unique(d.applicability.basisRefs) &&
      d.applicability.basisRefs.length>0 && Array.isArray(d.dependencies) &&
      d.dependencies.every(r=>dependencyKind(r)) &&
      (d.dependentPaths===undefined || (d.role==='provenance' && unique(d.dependentPaths) && d.dependentPaths.length>0)),
      'invalid duty relation: '+d.ref);
    need(unique(d.dependencies.map(r=>r.path)), 'ambiguous dependency path: '+d.ref);
    need(d.independentOf===undefined||d.role==='assess'&&unique(d.independentOf)&&d.independentOf.every(ref=>refs.includes(ref)&&ref!==d.ref),
      'explicit assessment independence duties required: '+d.ref);
    for(const dependency of d.dependencies.filter(r=>dependencyKind(r)==='producer_output')) {
      const producers=model.duties.filter(p=>p.ref===dependency.producerDutyRef);
      need(producers.length===1,'exact producer duty required: '+dependency.producerDutyRef);
      need(d.requires.includes(dependency.producerDutyRef),'producer must be a declared prerequisite: '+d.ref);
      need(producers[0].dependentPaths?.filter(path=>path===dependency.path).length===1,
        'exact declared producer output path required: '+dependency.path);
    }
  }
  const active=new Set(),done=new Set();
  const visit=ref=>{need(!active.has(ref),'cyclic prerequisites');if(done.has(ref))return;active.add(ref);
    model.duties.find(d=>d.ref===ref).requires.forEach(visit);active.delete(ref);done.add(ref);};
  refs.forEach(visit);return model;
}

/** Cold structural projection only. Actual provenance is authenticated at first J. */
export function projectNativeSource(product, terminalValue,{includeAssessment=false}={}) {
  const current=terminalValue?.kind==='semantic_revision_envelope'?terminalValue.current:terminalValue;
  need(product.isSemanticJobEnvelope(current),'supported native semantic-job source required');
  const evidence=current.evidence;
  need(evidence && product.isNativeWorkspaceWorkObservation(evidence.constructionResult) &&
    product.isNativeWorksiteCommandExecutionObservation(evidence.executionObservation), 'native work and execution support required');
  need(same(evidence.executionObservation.task.sourceNativeWork,evidence.constructionResult), 'execution must consume that actual native producer');
  return {taskRef:current.basis.jobRef, taskDigest:current.basis.jobDigest,
    sourceRefs:current.sourceContext.members.map(m=>({ref:m.memberRef,digest:m.digest})),
    bindingRefs:current.bindingVersions.map(b=>b.versionRef),
    obligationBindings:current.bindingVersions.map(b=>({bindingRef:b.versionRef,obligationRef:b.binding.obligationRef})),
    construction:{ref:evidence.constructionResultRef,digest:evidence.constructionResultDigest},
    execution:{ref:evidence.executionResultRef,digest:evidence.executionResultDigest},
    observation:evidence.executionObservation,
    ...(includeAssessment?{assessmentBasis:{evaluationData:current.job.evaluationData}}:{})};
}

function currentDependencies(dependencies, context) {
  const rows=dependencies.filter(d=>dependencyKind(d)==='observed').map(d=>{
    const entries=context?.entries?.filter(e=>e.relativePath===d.path);
    if(entries?.length!==1)return {...d,state:'unknown',reason:entries?.length?'ambiguous_current_dependency':'current_dependency_unavailable'};
    const entry=entries[0];
    if(entry.state==='absent')return {...d,state:'stale',reason:'current_dependency_absent'};
    if(entry.state!=='file'||!/^sha256:[a-f0-9]{64}$/.test(entry.digest))
      return {...d,state:'unknown',reason:'current_dependency_unavailable'};
    return {...d,state:entry.digest===d.digest?'present':'stale',reason:entry.digest===d.digest?'observed_dependency_current':'current_dependency_changed'};
  });
  return {rows,state:rows.some(r=>r.state==='stale')?'stale':rows.some(r=>r.state==='unknown')?'unknown':'present'};
}

function supportFor(duty, basis, facts) {
  const observation=basis.executionObservation;
  const work=observation?.task?.sourceNativeWork ?? basis.nativeWork;
  if(duty.role==='construct'&&!facts.work)return {state:'missing',reason:'artifact_support_absent'};
  if(duty.role==='execute'&&!facts.execution)return {state:'missing',reason:'execution_support_absent'};
  if(['evaluate','assess'].includes(duty.role)&&!facts.execution)
    return {state:'missing',reason:'execution_support_absent'};
  const current=currentDependencies(duty.dependencies,basis.currentContext);
  if(current.state!=='present')return {state:current.state,reason:'current_dependency_'+current.state,dependencyStates:current.rows};
  if(duty.dependencies.some(d=>dependencyKind(d)==='producer_output'))
    return {state:'missing',reason:'requires_producer_output'};
  // dependentPaths declares prospective derivation. The old native turn cannot
  // establish a newly declared input/output edge, even when its bytes match.
  if(duty.dependentPaths)return {state:'missing',reason:'prospective_input_relation_not_established'};
  if(duty.role==='construct') return facts.work && duty.dependencies.every(d=>
    work.after.entries.some(e=>e.relativePath===d.path&&e.state==='file'&&e.digest===d.digest))
    ? coordinate(basis.construction)?{state:'supported',refs:[basis.construction]}:{state:'unknown',reason:'construction_coordinate_unavailable'}
    : {state:'missing',reason:'artifact_support_absent'};
  if(duty.role==='execute') return facts.execution &&
    duty.dependencies.every(d=>observation.snapshotMembers.some(m=>m.relativePath===d.path&&m.digest===d.digest))
    ? coordinate(basis.execution)?{state:'supported',refs:[basis.execution]}:{state:'unknown',reason:'execution_coordinate_unavailable'}
    : {state:'missing',reason:'execution_support_absent'};
  if(duty.role==='provenance') return facts.work && duty.dependencies.every(d=>
    work.task.readFirst.includes(d.path)&&work.before.entries.some(e=>e.relativePath===d.path&&e.state==='file'&&e.digest===d.digest))
    ? coordinate(basis.construction)?{state:'supported',refs:[basis.construction]}:{state:'unknown',reason:'construction_coordinate_unavailable'}
    : {state:'missing',reason:'historical_input_relation_absent'};
  // Supplied evaluation/assessment relations are cold projections. They cannot
  // authorize a retained-source entry unless that source's owner authenticates them.
  const candidates=(basis.evaluations??[]).filter(e=>e.dutyRef===duty.ref&&coordinate(e.result)&&
    same(e.sourceRefs,basis.sourceRefs)&&same(e.execution,basis.execution)&&
    duty.scopeRefs.every(ref=>e.scopeRefs?.includes(ref))&&e.verdict==='satisfied'&&
    (duty.role!=='assess'||(text(work?.provenance?.actorInvocationRef)&&text(work?.provenance?.cCallRef)&&
      text(e.producer?.actorInvocationRef)&&text(e.producer?.cCallRef)&&
      e.producer.actorInvocationRef!==work.provenance.actorInvocationRef&&e.producer.cCallRef!==work.provenance.cCallRef)));
  return candidates.length===1 ? {state:'supported',refs:[candidates[0].result]} : {state:'missing',reason:'required_evaluation_not_established'};
}

/** A finite, non-authoritative reduction. Never returns admitted completion. */
export function selectLifecycleWork({product,model,basis,selectedDutyRefs}) {
  checkModel(model);need(unique(selectedDutyRefs)&&selectedDutyRefs.length>0&&selectedDutyRefs.every(r=>model.duties.some(d=>d.ref===r)), 'explicit bounded duty selection required');
  const activeRoles=new Set(model.duties.filter(d=>d.applicability.value==='true').map(d=>d.role));
  // These two structural facts share one immutable basis across the duty population.
  const facts={work:['construct','provenance'].some(role=>activeRoles.has(role))&&
    product.isNativeWorkspaceWorkObservation(basis.executionObservation?.task?.sourceNativeWork??basis.nativeWork),
    execution:['execute','evaluate','assess'].some(role=>activeRoles.has(role))&&product.isNativeWorksiteCommandExecutionObservation(basis.executionObservation)};
  const rows=new Map(), ordered=[];
  const visit=ref=>{if(rows.has(ref))return;const d=model.duties.find(d=>d.ref===ref);d.requires.forEach(visit);
    let state=d.applicability.value==='false'?{state:'excluded',reason:'declared_inapplicability',basisRefs:d.applicability.basisRefs}:
      d.applicability.value==='unknown'?{state:'unknown',reason:'applicability_unknown'}:supportFor(d,basis,facts);
    if(d.applicability.value==='true') {
      const prerequisites=d.requires.map(r=>rows.get(r));
      if(prerequisites.some(r=>r.state==='stale'))state={...state,state:'stale',reason:'prerequisite_stale'};
      else if(prerequisites.some(r=>r.state==='unknown') && state.state!=='stale')state={...state,state:'unknown',reason:'prerequisite_unknown'};
      else if(d.dependencies.some(dep=>dependencyKind(dep)==='producer_output'&&rows.get(dep.producerDutyRef).state==='excluded'))
        state={...state,state:'unknown',reason:'producer_excluded'};
      else if(prerequisites.some(r=>r.state==='missing')&&['supported','missing'].includes(state.state))
        state={state:'missing',reason:'requires_selected_predecessor_work'};
    }
    if(state.state!=='supported')delete state.refs;
    const evaluations=['evaluate','assess'].includes(d.role)?{evaluations:(basis.evaluations??[]).filter(e=>e.dutyRef===ref)}:{};
    rows.set(ref,structuredClone({dutyRef:ref,role:d.role,obligationRef:d.obligationRef,bindingRef:d.bindingRef,
      scopeRefs:d.scopeRefs,requires:d.requires,dependencies:d.dependencies,applicability:d.applicability,
      ...(d.dependentPaths?{dependentPaths:d.dependentPaths}:{}),...evaluations,...state}));ordered.push(ref);};
  // Inspect governing predicates for the complete population, not only selected work.
  model.duties.forEach(d=>visit(d.ref));
  const selected=new Set();const include=ref=>{if(selected.has(ref))return;selected.add(ref);
    if(rows.get(ref).state!=='excluded')model.duties.find(d=>d.ref===ref).requires.forEach(include);};selectedDutyRefs.forEach(include);
  const work=ordered.filter(ref=>selected.has(ref)&&rows.get(ref).state==='missing').map(ref=>rows.get(ref));
  const gaps=ordered.filter(ref=>selected.has(ref)&&['unknown','stale'].includes(rows.get(ref).state)).map(ref=>rows.get(ref));
  const carried=model.duties.filter(d=>!selected.has(d.ref)&&!['supported','excluded'].includes(rows.get(d.ref).state)).map(d=>d.ref);
  return freeze({kind:'lifecycle_construction_selection',basisDisposition:'proposal_requires_owner_authentication',
    taskRef:model.taskRef,sourceRefs:structuredClone(model.sourceRefs),interpretation:structuredClone(model.interpretation),
    selectedDutyRefs:[...selected],work,gaps,carriedDutyRefs:carried,carriedDuties:carried.map(ref=>rows.get(ref)),
    carriedBindingRefs:model.bindingRefs.filter(ref=>!model.duties.some(d=>selected.has(d.ref)&&d.bindingRef===ref)||
      model.duties.some(d=>carried.includes(d.ref)&&d.bindingRef===ref)),
    support:[...rows.values()].filter(r=>r.state==='supported'),excluded:[...rows.values()].filter(r=>r.state==='excluded'),
    disposition:gaps.length?'gap':work.length?'candidate':'report_refs',originalTaskCompletion:'not_claimed'});
}

/** The group order becomes ordinary child occurrences at author time. */
export function checkConstructionGroups(model,selection,groups) {
  need(Array.isArray(groups)&&groups.length>0&&unique(groups.map(g=>g.ref)),'explicit unique construction groups required');
  const refs=groups.flatMap(g=>g.dutyRefs??[]),workRefs=selection.work.map(w=>w.dutyRef);
  need(unique(refs)&&same([...refs].sort(),[...workRefs].sort()),'each selected work duty requires exactly one producer group');
  for(const [index,group] of groups.entries()) {
    need(same(Object.keys(group).sort(),['ref','dutyRefs','fitJudgment','outcome','instructions','readFirst','writeRoots','checks'].sort())&&
      unique(group.dutyRefs)&&group.dutyRefs.length>0&&coordinate(group.fitJudgment)&&text(group.outcome)&&
      Array.isArray(group.instructions)&&group.instructions.every(text)&&unique(group.readFirst)&&unique(group.writeRoots)&&group.writeRoots.length>0&&
      Array.isArray(group.checks)&&group.checks.length===0,'exact bounded native construction parameters required');
    for(const ref of group.dutyRefs) {
      const duty=model.duties.find(d=>d.ref===ref);
      need(duty?.role==='provenance'&&duty.dependentPaths?.length>0,'prospective provenance duty required');
      for(const prerequisite of duty.requires.filter(r=>refs.includes(r)))
        need(groups.findIndex(g=>g.dutyRefs.includes(prerequisite))<index,'construction groups must be dependency ready across child boundaries');
      need(duty.dependencies.every(d=>group.readFirst.includes(d.path)),'each declared predecessor must be read first');
      need(duty.dependentPaths.every(path=>group.writeRoots.some(root=>root==='.'||path===root||path.startsWith(root+'/'))),
        'every dependent must be within the selected write roots');
    }
  }
  return groups;
}

/** Exact published routes are source construction material, never a runtime plan. */
export function constructLifecycleProgram({gtl,product,model,basis,selectedDutyRefs,routes,artifact,runEnvironment,constructionGroups,preservedConstruction=false}) {
  const selection=selectLifecycleWork({product,model,basis,selectedDutyRefs});
  if(selection.gaps.length)return {kind:'gap',selection,gaps:selection.gaps};
  if(selection.disposition==='report_refs')return {kind:'report_refs',selection,support:selection.support};
  const needed=[...new Set(selection.work.map(r=>r.role))];
  const eligible=routes.filter(route=>same(route.roles,needed)&&coordinate(route.fitJudgment)&&
    unique(route.obligationRefs)&&selection.work.every(w=>route.obligationRefs.includes(model.duties.find(d=>d.ref===w.dutyRef).obligationRef)));
  if(eligible.length!==1)return {kind:'gap',selection,gaps:[{cause:eligible.length?'ambiguous_compatible_composition':'compatible_published_composition_absent',requiredRoles:needed}]};
  const assessed=needed.length===3&&['provenance','evaluate','assess'].every(role=>needed.includes(role))&&constructionGroups!==undefined;
  const combined=(needed.length===2&&needed.includes('provenance')&&needed.includes('evaluate')||assessed)&&constructionGroups!==undefined;
  const native=(same(needed,['provenance'])||combined)&&constructionGroups!==undefined;
  need(!preservedConstruction||assessed,'preserved construction requires an explicit evaluation and assessment suffix');
  if(!same(needed,['evaluate'])&&!native)return {kind:'gap',selection,gaps:[{cause:'executable_evidence_regime_not_supported',requiredRoles:needed}]};
  if(native)checkConstructionGroups(model,{work:selection.work.filter(w=>w.role==='provenance')},constructionGroups);
  const route=eligible[0];
  if(preservedConstruction)need(same(route.graphFunctionRefs,[ids.preservedAuthenticateGraphFunctionRef,product.NATIVE_WORK_REACQUISITION_IDS.graphFunctionRef,
    ids.prepareConstructedEvaluationGraphFunctionRef,ids.evaluationChildGraphFunctionRef,ids.prepareAssessmentInputGraphFunctionRef,ids.assessmentChildGraphFunctionRef])&&
    same(route.retainEntryAfter,[1,3]),'exact preserved construction authentication, acquisition, evaluation and assessment route required');
  else if(native)need(same(route.graphFunctionRefs,[ids.nativeAuthenticateGraphFunctionRef,product.NATIVE_WORK_REACQUISITION_IDS.graphFunctionRef,
    ids.prepareConstructionGraphFunctionRef,...constructionGroups.map(()=>ids.constructionChildGraphFunctionRef),
    ...(combined?[ids.prepareConstructedEvaluationGraphFunctionRef,ids.evaluationChildGraphFunctionRef]:[]),
    ...(assessed?[ids.prepareAssessmentInputGraphFunctionRef,ids.assessmentChildGraphFunctionRef]:[])])&&
    same(route.retainEntryAfter,assessed?[1,2+constructionGroups.length,4+constructionGroups.length]:combined?[1,2+constructionGroups.length]:[1]),
    'exact declared construction child occurrences and acquisition join required');
  need(route.publications.length>0 && route.graphFunctionRefs.length>0 && unique(route.permittedEffects), 'explicit published route/effect contract required');
  const publications=route.publications;
  const graphs=route.graphFunctionRefs.map(ref=>{const rows=publications.flatMap(p=>p.graphFunctions).filter(g=>g.name===ref);
    need(rows.length===1,'exact callable required: '+ref);return rows[0];});
  const effects=[...new Set(graphs.flatMap(g=>g.effects))].sort();
  if(effects.some(e=>!route.permittedEffects.includes(e)))return {kind:'gap',selection,gaps:[{cause:'effect_not_permitted',effects}]};
  const input=graphs[0].inputs[0], output=graphs.at(-1).outputs[0];
  need(graphs.every(g=>g.inputs.length===1&&g.outputs.length===1),'one exact interface per selected callable required');
  const retentions=route.retainEntryAfter??[];
  for(let i=1;i<graphs.length;i++)need(retentions.includes(i-1)
    ? graphs[i].inputs[0]===product.RETAINED_GRAPH_INPUT_CONTRACT.contractRef
    : graphs[i-1].outputs[0]===graphs[i].inputs[0], 'incompatible actual input/output binding');
  const interfaceRefs=[...new Set(graphs.flatMap(g=>[...g.inputs,...g.outputs]))].sort();
  const interfaces=interfaceRefs.map(ref=>{const matches=publications.flatMap(p=>p.contracts).filter(c=>c.contractRef===ref);
    need(matches.length===1,'one exact published interface required: '+ref);return {ref,digest:product.sha256Canonical(matches[0])};});
  const identity={graphFunctions:graphs.map(g=>({ref:g.name,digest:product.sha256Canonical(g)})),retentions,
    interfaces,effects,input,output,runEnvironment:runEnvironment??null};
  const suffix=product.sha256Canonical(identity).slice(7), programRef=`program://odd-glc/construction/${suffix}@5`;
  const rootRef=`graph-function://odd-glc/construction/${suffix}@5`;
  const nodes=graphs.map((g,i)=>({nodeRef:`node://odd-glc/construction/${suffix}/${i}@5`,nodeKind:'c_locus',
    term:gtl.workflow.C(gtl.cGraphFunctionRef({graphFunctionRef:g.name,input:gtl.cCarrier(g.inputs[0]),output:gtl.cCarrier(g.outputs[0])}))}));
  const declarations={'abg.compute_regime':'mixed','abg.closure_contract':ids.closureContractRef,
    ...(preservedConstruction?{'abg.failure_contract':ids.failureContractRef}:{}),
    'abg.evidence_contract':ids.evidenceContractRef,'abg.judgment_contract':ids.judgmentContractRef,
    'abg.judgment_predicate':native?ids.nativeStepPredicateRef:ids.stepPredicateRef,'abg.transition_contract':ids.transitionContractRef};
  const root={kind:'graph_function',name:rootRef,version:VERSION,inputs:[input],outputs:[output],
    environment:{requires:[input],provides:[...new Set(graphs.flatMap(g=>g.outputs))],carries:[input]},effects,tags:['lifecycle-construction'],declarations,
    template:{kind:'inline_graph',graphRef:`graph://odd-glc/construction/${suffix}@5`,startNodeRef:nodes[0].nodeRef,
      terminalNodeRefs:[nodes.at(-1).nodeRef],nodes,edges:nodes.slice(1).map((n,i)=>gtl.graphEdge({fromNodeRef:nodes[i].nodeRef,toNodeRef:n.nodeRef,
        ...(retentions.includes(i)?{inputBinding:product.graphInputRetentionBinding(input,graphs[i].outputs[0])}:{})})),applications:[]}};
  const evaluationChild=combined?graphs.find(g=>g.name===ids.evaluationChildGraphFunctionRef):null;
  const evaluationGraph=combined?publications.flatMap(p=>p.graphFunctions).find(g=>g.name===evaluationChild.template.nodes[0].term.graphFunctionRef):undefined;
  const own=constructProgramConstructionLibrary({gtl,product,artifact,includeNativeConstruction:native,evaluationGraph,includeAssessment:assessed,includePreservedConstruction:preservedConstruction});
  need(!combined||same(own.graphFunctions.find(g=>g.name===ids.evaluationChildGraphFunctionRef),evaluationChild),'exact supplied evaluator child required');
  const closure={kind:'closure_contract',closureContractRef:ids.closureContractRef,predicateRef:assessed?ids.assessedConstructionPredicateRef:combined?ids.constructedEvaluationPredicateRef:native?ids.nativeCompletionPredicateRef:ids.completionPredicateRef,
    evidenceContractRef:ids.evidenceContractRef,resultContractRef:output,refusalContractRef:ids.refusalContractRef,
    refusalValueKind:'lifecycle_construction_refusal',judgmentContractRef:ids.judgmentContractRef,rejectionContractRef:ids.failureContractRef,
    transitionContractRef:ids.transitionContractRef,replayProjectionRef:'projection://odd-glc/construction@5',terminalKind:'completed',closureScope:'run',
    eventKindRefs:['terminal_reached','frame_closed','graph_call_closed','run_closed']};
  const startRef=`start://odd-glc/construction/${suffix}@5`;
  const publication=gtl.modulePublication({...own,programs:[{kind:'gtl_program',programRef,version:VERSION,moduleRef:ids.moduleRef,
    starts:[{startRef,graphFunctionRef:rootRef}],callableMembership:[...new Set([rootRef,...graphs.map(g=>g.name),...(native&&!preservedConstruction?
      [ids.prepareNativeTaskGraphFunctionRef,product.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef,ids.joinNativeOutputGraphFunctionRef]:[]),
      ...(combined?[evaluationGraph.name,ids.joinEvaluationGraphFunctionRef]:[]),
      ...(assessed?[ids.prepareAssessmentTaskGraphFunctionRef,product.NATIVE_WORKSPACE_WORK_IDS.assessmentGraphFunctionRef,ids.joinAssessmentGraphFunctionRef]:[])])],closureContractRef:ids.closureContractRef,
    policies:{'abg.root_mode':'direct','abg.compute_regime':'mixed','abg.default_start_ref':startRef,...(runEnvironment?{'abg.run_environment':runEnvironment.declarationRef}:{})}}],
    runEnvironments:runEnvironment?[gtl.constructRunEnvironmentDeclaration(structuredClone(runEnvironment))]:[],
    graphFunctions:[...own.graphFunctions,root],closureContracts:[...own.closureContracts,closure],
    contributions:[...own.contributions.map(c=>({...c,programMembershipRefs:[programRef],readinessPrerequisiteRefs:[programRef]})),{handle:rootRef,kind:'graph_function',declarationOrContractRef:rootRef,owningProductId:ids.productId,
      programMembershipRefs:[programRef],readinessPrerequisiteRefs:[programRef],compatibilityRefs:['compatibility://abiogenesis/major/5'],provenanceRefs:[...new Set([artifact.artifactDigest,artifact.manifestDigest])]}]});
  return freeze({kind:'candidate',publication,selection,start:{programRef,startRef,graphFunctionRef:rootRef},
    correspondence:selection.work.map(w=>({dutyRef:w.dutyRef,producerRefs:route.graphFunctionRefs,fitJudgment:route.fitJudgment,
      ...(native&&w.role==='provenance'?{groupRef:constructionGroups.find(g=>g.dutyRefs.includes(w.dutyRef)).ref,
        ...(preservedConstruction?{evidenceSource:'authenticated_preserved_construction'}:
          {producerNodeRef:nodes[3+constructionGroups.findIndex(g=>g.dutyRefs.includes(w.dutyRef))].nodeRef})}:
        combined?{producerNodeRef:nodes[w.role==='assess'?nodes.length-1:preservedConstruction?3:4+constructionGroups.length].nodeRef,
          ...(w.role==='evaluate'?{evaluator:{ref:evaluationGraph.name,digest:product.sha256Canonical(evaluationGraph)}}:{})}: {})}))});
}

export function constructProgramConstructionLibrary({gtl,product,artifact,includeNativeConstruction=false,evaluationGraph,includeAssessment=false,includePreservedConstruction=false}) {
  need(!evaluationGraph||includeNativeConstruction&&same(evaluationGraph.inputs,[ids.evaluatorInputContractRef])&&evaluationGraph.outputs.length===1&&
    evaluationGraph.outputs[0]!==product.RETAINED_GRAPH_INPUT_CONTRACT.contractRef,'one ordinary supplied evaluator interface required');
  need(!includeAssessment||evaluationGraph,'assessment requires the actual evaluator child');
  need(!includePreservedConstruction||includeAssessment,'preserved construction requires evaluation and assessment');
  const libraryStages=includeNativeConstruction?[...(includePreservedConstruction?[]:constructionStages),...(evaluationGraph?evaluationStages:[]),...(includeAssessment?assessmentStages:[]),
    ...(includePreservedConstruction?preservedConstructionStages:[])]:stages;
  const base=[inputContract,evaluatorInputContract,...(includeNativeConstruction?[nativeConstructionInputContract,constructionStateContract,
    contract(ids.constructionChildClosureRef,'closure','lifecycle_construction_child_closure')]:[]),
    ...(evaluationGraph?[evaluationStateContract,contract(ids.evaluationChildClosureRef,'closure','lifecycle_evaluation_child_closure')]:[]),
    ...(includeAssessment?[assessmentInputContract,assessmentStateContract,assessmentResultContract,
      contract(ids.assessmentChildClosureRef,'closure','lifecycle_assessment_child_closure')]:[]),
    ...(includePreservedConstruction?[preservedConstructionInputContract]:[]),
    contract(ids.evidenceContractRef,'evidence','deterministic_evidence_candidate'),contract(ids.failureContractRef,'failure','lifecycle_construction_failure'),
    contract(ids.refusalContractRef,'refusal','lifecycle_construction_refusal'),contract(ids.judgmentContractRef,'judgment','lifecycle_construction_judgment'),
    contract(ids.transitionContractRef,'transition','lifecycle_construction_transition'),contract(ids.closureContractRef,'closure','lifecycle_construction_closure')];
  const closures=libraryStages.map(s=>({kind:'closure_contract',closureContractRef:s.closureRef,predicateRef:s.predicateRef,evidenceContractRef:ids.evidenceContractRef,
    resultContractRef:s.output,refusalContractRef:ids.refusalContractRef,refusalValueKind:'lifecycle_construction_refusal',judgmentContractRef:ids.judgmentContractRef,
    rejectionContractRef:ids.failureContractRef,transitionContractRef:ids.transitionContractRef,replayProjectionRef:'projection://odd-glc/construction@5',
    terminalKind:'completed',closureScope:'graph_call',eventKindRefs:['terminal_reached','frame_closed','graph_call_closed']}));
  const graphFunctions=libraryStages.map(s=>({kind:'graph_function',name:s.graphFunctionRef,version:VERSION,inputs:[s.input],outputs:[s.output],
    environment:{requires:[s.input],provides:[s.output],carries:[]},effects:[],tags:['lifecycle-construction','pure-adapter'],
    declarations:{'abg.compute_regime':'F_D','abg.closure_contract':s.closureRef,'abg.child_closure_contract':s.closureRef,
      'abg.evidence_contract':ids.evidenceContractRef,'abg.judgment_contract':ids.judgmentContractRef,'abg.judgment_predicate':s.predicateRef,'abg.transition_contract':ids.transitionContractRef},
    template:{kind:'inline_graph',graphRef:s.graphFunctionRef.replace('graph-function:','graph:'),startNodeRef:s.nodeRef,terminalNodeRefs:[s.nodeRef],edges:[],applications:[],nodes:[{nodeRef:s.nodeRef,nodeKind:'c_locus',
      term:gtl.C.of({input:gtl.cCarrier(s.input),output:gtl.cCarrier(s.output),programLocusRef:s.nodeRef,stageRole:s.name,fibre:'F_D',armId:s.nodeRef+'/arm',compositionRef:null,vectorIndex:0,
        judgmentPredicateRef:s.predicateRef,resultBearing:true,requirement:{kind:'executable_leaf_requirement',implementationBindingRef:s.bindingRef,
          inputContractRef:s.input,outputContractRef:s.output,evidenceContractRef:ids.evidenceContractRef,failureContractRef:ids.failureContractRef,
          refusalContractRef:ids.refusalContractRef,judgmentContractRef:ids.judgmentContractRef}})}]}}));
  if(includeNativeConstruction&&!includePreservedConstruction) {
    const n=product.NATIVE_WORKSPACE_WORK_IDS,state=ids.constructionStateContractRef;
    const calls=[[ids.prepareNativeTaskGraphFunctionRef,state,n.taskContractRef],[n.graphFunctionRef,n.taskContractRef,n.observationContractRef],
      [ids.joinNativeOutputGraphFunctionRef,product.RETAINED_GRAPH_INPUT_CONTRACT.contractRef,state]];
    const nodes=calls.map(([graphFunctionRef,input,output],index)=>({nodeRef:ids.constructionChildGraphFunctionRef.replace('graph-function:','node:')+'/'+index,nodeKind:'c_locus',
      term:gtl.workflow.C(gtl.cGraphFunctionRef({graphFunctionRef,input:gtl.cCarrier(input),output:gtl.cCarrier(output)}))}));
    graphFunctions.push({kind:'graph_function',name:ids.constructionChildGraphFunctionRef,version:VERSION,inputs:[state],outputs:[state],
      environment:{requires:[state],provides:[n.taskContractRef,n.observationContractRef,state],carries:[state]},effects:[n.effectUri],tags:['lifecycle-construction','native-work'],
      declarations:{'abg.compute_regime':'mixed','abg.closure_contract':ids.constructionChildClosureRef,'abg.child_closure_contract':ids.constructionChildClosureRef,
        'abg.failure_contract':ids.failureContractRef,
        'abg.evidence_contract':ids.evidenceContractRef,'abg.judgment_contract':ids.judgmentContractRef,'abg.judgment_predicate':ids.nativeStepPredicateRef,'abg.transition_contract':ids.transitionContractRef},
      template:{kind:'inline_graph',graphRef:ids.constructionChildGraphFunctionRef.replace('graph-function:','graph:'),startNodeRef:nodes[0].nodeRef,
        terminalNodeRefs:[nodes.at(-1).nodeRef],nodes,applications:[],edges:[gtl.graphEdge({fromNodeRef:nodes[0].nodeRef,toNodeRef:nodes[1].nodeRef}),
          gtl.graphEdge({fromNodeRef:nodes[1].nodeRef,toNodeRef:nodes[2].nodeRef,inputBinding:product.graphInputRetentionBinding(state,n.observationContractRef)})]}});
    closures.push({...closures[0],closureContractRef:ids.constructionChildClosureRef,predicateRef:ids.constructionChildPredicateRef,resultContractRef:state});
  }
  if(evaluationGraph) {
    const input=ids.evaluatorInputContractRef,output=ids.evaluationStateContractRef,source=evaluationGraph.outputs[0];
    const calls=[[evaluationGraph.name,input,source],[ids.joinEvaluationGraphFunctionRef,product.RETAINED_GRAPH_INPUT_CONTRACT.contractRef,output]];
    const nodes=calls.map(([graphFunctionRef,i,o],index)=>({nodeRef:ids.evaluationChildGraphFunctionRef.replace('graph-function:','node:')+'/'+index,nodeKind:'c_locus',
      term:gtl.workflow.C(gtl.cGraphFunctionRef({graphFunctionRef,input:gtl.cCarrier(i),output:gtl.cCarrier(o)}))}));
    graphFunctions.push({kind:'graph_function',name:ids.evaluationChildGraphFunctionRef,version:VERSION,inputs:[input],outputs:[output],
      environment:{requires:[input],provides:[source,output],carries:[input]},effects:evaluationGraph.effects,tags:['lifecycle-construction','evaluation'],
      declarations:{'abg.compute_regime':'mixed','abg.closure_contract':ids.evaluationChildClosureRef,'abg.child_closure_contract':ids.evaluationChildClosureRef,
        'abg.failure_contract':ids.failureContractRef,
        'abg.evidence_contract':ids.evidenceContractRef,'abg.judgment_contract':ids.judgmentContractRef,'abg.judgment_predicate':ids.nativeStepPredicateRef,'abg.transition_contract':ids.transitionContractRef},
      template:{kind:'inline_graph',graphRef:ids.evaluationChildGraphFunctionRef.replace('graph-function:','graph:'),startNodeRef:nodes[0].nodeRef,
        terminalNodeRefs:[nodes[1].nodeRef],nodes,applications:[],edges:[gtl.graphEdge({fromNodeRef:nodes[0].nodeRef,toNodeRef:nodes[1].nodeRef,
          inputBinding:product.graphInputRetentionBinding(input,source)})]}});
    closures.push({...closures[0],closureContractRef:ids.evaluationChildClosureRef,predicateRef:ids.evaluationChildPredicateRef,resultContractRef:output});
  }
  if(includeAssessment) {
    const n=product.NATIVE_WORKSPACE_WORK_IDS,input=ids.assessmentInputContractRef,output=ids.assessmentStateContractRef;
    const calls=[[ids.prepareAssessmentTaskGraphFunctionRef,input,n.taskContractRef],[n.assessmentGraphFunctionRef,n.taskContractRef,n.observationContractRef],
      [ids.joinAssessmentGraphFunctionRef,product.RETAINED_GRAPH_INPUT_CONTRACT.contractRef,output]];
    const nodes=calls.map(([graphFunctionRef,i,o],index)=>({nodeRef:ids.assessmentChildGraphFunctionRef.replace('graph-function:','node:')+'/'+index,nodeKind:'c_locus',
      term:gtl.workflow.C(gtl.cGraphFunctionRef({graphFunctionRef,input:gtl.cCarrier(i),output:gtl.cCarrier(o)}))}));
    graphFunctions.push({kind:'graph_function',name:ids.assessmentChildGraphFunctionRef,version:VERSION,inputs:[input],outputs:[output],
      environment:{requires:[input],provides:[n.taskContractRef,n.observationContractRef,output],carries:[input]},effects:[n.effectUri],tags:['lifecycle-construction','independent-assessment'],
      declarations:{'abg.compute_regime':'mixed','abg.closure_contract':ids.assessmentChildClosureRef,'abg.child_closure_contract':ids.assessmentChildClosureRef,
        'abg.failure_contract':ids.failureContractRef,
        'abg.evidence_contract':ids.evidenceContractRef,'abg.judgment_contract':ids.judgmentContractRef,'abg.judgment_predicate':ids.nativeStepPredicateRef,'abg.transition_contract':ids.transitionContractRef},
      template:{kind:'inline_graph',graphRef:ids.assessmentChildGraphFunctionRef.replace('graph-function:','graph:'),startNodeRef:nodes[0].nodeRef,
        terminalNodeRefs:[nodes[2].nodeRef],nodes,applications:[],edges:[gtl.graphEdge({fromNodeRef:nodes[0].nodeRef,toNodeRef:nodes[1].nodeRef}),
          gtl.graphEdge({fromNodeRef:nodes[1].nodeRef,toNodeRef:nodes[2].nodeRef,inputBinding:product.graphInputRetentionBinding(input,n.observationContractRef)})]}});
    closures.push({...closures[0],closureContractRef:ids.assessmentChildClosureRef,predicateRef:ids.assessmentChildPredicateRef,resultContractRef:output});
  }
  return gtl.modulePublication({kind:'module_publication',moduleRef:ids.moduleRef,moduleVersion:VERSION,owningProductId:ids.productId,
    artifactDigest:artifact.artifactDigest,productContentDigest:artifact.productContentDigest,productManifestDigest:artifact.manifestDigest,
    descriptorRef:ids.descriptorRef,contributionManifestRef:ids.contributionManifestRef,
    productSemanticsBinding:{kind:'product_semantics_binding',bindingRef:ids.semanticsBindingRef,packageName:PACKAGE_NAME,packageVersion:PACKAGE_VERSION,
      modulePath:'build/program-construction-runtime.mjs',namedSymbol:'PROGRAM_CONSTRUCTION_SEMANTICS'},
    contracts:[...base,...libraryStages.map(s=>contract(s.closureRef,'closure','lifecycle_construction_child_closure'))],
    implementationBindings:libraryStages.map(bindingFor),closureContracts:closures,graphFunctions,programs:[],rules:[],evaluators:[],
    contributions:graphFunctions.map(g=>({handle:g.name,kind:'graph_function',declarationOrContractRef:g.name,owningProductId:ids.productId,
      programMembershipRefs:[],readinessPrerequisiteRefs:[],compatibilityRefs:['compatibility://abiogenesis/major/5'],provenanceRefs:[...new Set([artifact.artifactDigest,artifact.manifestDigest])]}))});
}
