import assert from "node:assert/strict";
import { chmod, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { genericIntakePublicationData, intakeIds } from "./t287-generic-job-intake.mjs";

/** Generic installed graph data only. The ordinary job and actor-double bytes
 * below are external proof inputs, never published members or policies. */
export function genericLifecyclePublicationData({ product, gtl, abiPublication }) {
  const base = genericIntakePublicationData({ gtl, abiPublication }), D = gtl.SEMANTIC_STAGE_IDS;
  const P = product.WORKSITE_PREPARATION_IDS, C1 = product.WORKSITE_CONSTRUCTION_IDS, C2 = product.WORKSITE_COMMAND_EXECUTION_IDS;
  const parents = gtl.WORKSITE_FILE_PARENTS_IDS, ref = (kind, label) => `${kind}://generic-job-mechanics.example/${label}@5`;
  const nativeBasis = { productId: abiPublication.owningProductId, artifactDigest: abiPublication.artifactDigest,
    productContentDigest: abiPublication.productContentDigest, productManifestDigest: abiPublication.productManifestDigest,
    packageName: abiPublication.productSemanticsBinding.packageName, packageVersion: abiPublication.productSemanticsBinding.packageVersion };
  const c1 = gtl.constructWorksiteConstructionModulePublication(nativeBasis), c2 = gtl.constructWorksiteCommandExecutionModulePublication(nativeBasis);
  const names = ["intent", "product", "requirements", "design", "evidence"], prototype = base.semanticJobLifecycle.stages[0];
  const lifecycle = gtl.constructSemanticJobLifecycleDeclaration({ ...base.semanticJobLifecycle,
    stages: names.map((name, i) => ({ ...prototype, declarationRef: ref("stage", name), graphFunctionRef: ref("graph-function", name),
      authorLocusRef: ref("locus", name + "-author"), assessorLocusRef: ref("locus", name + "-assessor"), predecessorStageRefs: names.slice(0, i).map(n => ref("stage", n)),
      assetSurface: { ...prototype.assetSurface, kind: "ordinary_job_" + name },
      purpose: `Derive and assess the ${name} carrier from complete ordinary source and native predecessors.`,
      bodyCapabilities: name === "requirements" ? ["requirement_refinement"] : name === "design" ? ["worksite_design"] : name === "evidence" ? ["application_assessment"] : [],
      assembly: { ...prototype.assembly, ruleRef: ref("rule", name), graphFunctionRef: ref("graph-function", name) } })) });
  const closures = [], close = (name, predicateRef, resultContractRef, closureScope = "graph_call") => {
    const value = gtl.constructSemanticClosureContract({ closureContractRef: ref("contract", name + "-close"), predicateRef, resultContractRef, closureScope });
    closures.push(value); return value.closureContractRef;
  };
  const call = graph => gtl.workflow.C(gtl.cGraphFunctionRef({ graphFunctionRef: graph.name,
    input: gtl.cCarrier(graph.inputs[0]), output: gtl.cCarrier(graph.outputs[0]) }));
  const c1Graph = c1.graphFunctions.find(g => g.name === C1.graphFunctionRef), c2Graph = c2.graphFunctions.find(g => g.name === C2.graphFunctionRef);
  const workClose = ref("contract", "worksite-close"), workName = ref("graph-function", "worksite"), node = name => ref("node", "worksite-" + name);
  closures.push(gtl.closureContract({ ...c2.closureContracts.find(c => c.closureContractRef === C2.closureContractRef),
    closureContractRef: workClose, predicateRef: P.rootPredicateRef, closureScope: "graph_call",
    eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed"] }));
  const pure = (name, bindingRef, predicateRef) => {
    const binding = c2.implementationBindings.find(b => b.bindingRef === bindingRef); assert.ok(binding);
    return { nodeRef: node(name), nodeKind: "c_locus", term: gtl.C.of({ input: gtl.cCarrier(binding.inputContractRef), output: gtl.cCarrier(binding.outputContractRef),
      programLocusRef: node(name), stageRole: name, fibre: "F_D", armId: node(name) + "/arm", compositionRef: null, vectorIndex: 0,
      judgmentPredicateRef: predicateRef, resultBearing: false, requirement: { kind: "executable_leaf_requirement", implementationBindingRef: bindingRef,
        inputContractRef: binding.inputContractRef, outputContractRef: binding.outputContractRef, failureContractRef: binding.failureContractRef,
        refusalContractRef: binding.refusalContractRef, evidenceContractRef: C2.evidenceContractRef, judgmentContractRef: C2.judgmentContractRef } }) };
  };
  const provided = [C1.taskContractRef, C1.resultContractRef, P.boundInputContractRef, C2.taskContractRef, C2.observationContractRef];
  const worksite = { kind: "graph_function", name: workName, version: "5.0.0", inputs: [P.inputContractRef], outputs: [C2.observationContractRef],
    environment: { requires: [P.inputContractRef], provides: provided, carries: [P.inputContractRef, ...provided] },
    effects: [...new Set([...c1Graph.effects, ...c2Graph.effects])], tags: ["mechanical-only"],
    declarations: { "abg.compute_regime": "mixed", "abg.closure_contract": workClose, "abg.child_closure_contract": workClose,
      "abg.failure_contract": C2.failureContractRef, "abg.evidence_contract": C2.evidenceContractRef, "abg.judgment_contract": C2.judgmentContractRef,
      "abg.judgment_predicate": P.rootPredicateRef, "abg.transition_contract": C2.transitionContractRef },
    template: { kind: "inline_graph", graphRef: ref("graph", "worksite"), startNodeRef: node("select"), terminalNodeRefs: [node("execute")], applications: [],
      nodes: [pure("select", P.selectBindingRef, P.selectPredicateRef), { nodeRef: node("construct"), nodeKind: "c_locus", term: call(c1Graph) },
        pure("prepare", P.prepareBindingRef, P.preparePredicateRef), { nodeRef: node("execute"), nodeKind: "c_locus", term: call(c2Graph) }],
      edges: [gtl.graphEdge({ fromNodeRef: node("select"), toNodeRef: node("construct") }),
        gtl.graphEdge({ fromNodeRef: node("construct"), toNodeRef: node("prepare"), inputBinding: product.worksiteRetentionBinding() }),
        gtl.graphEdge({ fromNodeRef: node("prepare"), toNodeRef: node("execute") })] } };
  const stages = lifecycle.stages.map(s => gtl.constructSemanticStageGraphFunction(s, close(s.declarationRef, D.assessorPredicateRef, D.envelopeContractRef)));
  const jobGraph = (name, operation, predicateRef, resultContractRef) => gtl.constructSemanticJobGraphFunction({
    graphFunctionRef: name === "intake" ? intakeIds.intakeRef : ref("graph-function", name), nodeRef: ref("node", name), operation,
    lifecycleRef: lifecycle.declarationRef, closureContractRef: close(name, predicateRef, resultContractRef) });
  const semanticBridge = (name, operation, predicateRef, resultContractRef) => gtl.constructSemanticBridgeGraphFunction({
    graphFunctionRef: ref("graph-function", name), nodeRef: ref("node", name), operation, closureContractRef: close(name, predicateRef, resultContractRef) });
  const chain = [jobGraph("intake", "intake", D.jobIntakePredicateRef, D.envelopeContractRef), ...stages.slice(0, 3),
    jobGraph("context", "context", D.jobContextPredicateRef, D.envelopeContractRef), stages[3],
    jobGraph("plan", "worksite_plan", D.jobPlanPredicateRef, parents.inputContractRef), c1.graphFunctions.find(g => g.name === parents.graphFunctionRef),
    jobGraph("bridge", "worksite_bridge", D.jobBridgePredicateRef, P.inputContractRef), worksite,
    semanticBridge("evidence-input", "evidence_input", D.evidenceInputPredicateRef, D.envelopeContractRef), stages[4],
    semanticBridge("terminal", "envelope_output", D.terminalPredicateRef, D.outputContractRef)];
  const rootClose = close("root", D.lifecyclePredicateRef, D.outputContractRef, "run"), carries = [...new Set(chain.flatMap(g => [...g.inputs, ...g.outputs]))];
  const nodes = chain.map((graph, i) => ({ nodeRef: ref("node", "step-" + i), nodeKind: "c_locus", term: call(graph) }));
  const root = { kind: "graph_function", name: intakeIds.graphFunctionRef, version: "5.0.0", inputs: [D.jobInputContractRef], outputs: [D.outputContractRef],
    environment: { requires: [D.jobInputContractRef], provides: carries, carries }, effects: [...new Set(chain.flatMap(g => g.effects))], tags: ["mechanical-only"],
    declarations: { "abg.compute_regime": "mixed", "abg.closure_contract": rootClose, "abg.evidence_contract": D.evidenceContractRef,
      "abg.judgment_contract": D.judgmentContractRef, "abg.judgment_predicate": D.lifecycleStepPredicateRef, "abg.transition_contract": D.transitionContractRef },
    template: { kind: "inline_graph", graphRef: ref("graph", "full"), startNodeRef: nodes[0].nodeRef, terminalNodeRefs: [nodes.at(-1).nodeRef], nodes,
      edges: nodes.slice(1).map((n, i) => gtl.graphEdge({ fromNodeRef: nodes[i].nodeRef, toNodeRef: n.nodeRef })), applications: [] } };
  const graphFunctions = [root, ...chain.filter(g => g.name !== parents.graphFunctionRef)];
  const program = { ...base.programs[0], closureContractRef: rootClose, callableMembership: [...graphFunctions.map(g => g.name), parents.graphFunctionRef,
    C1.graphFunctionRef, C1.vectorApplicationGraphFunctionRef, C1.fileReplaceGraphFunctionRef, C1.reducerGraphFunctionRef, C2.graphFunctionRef] };
  return { ...base, semanticJobLifecycle: lifecycle, programs: [program], graphFunctions, closureContracts: closures,
    contracts: closures.map(c => ({ contractRef: c.closureContractRef, contractKind: "closure", contractVersion: "5.0.0", valueKind: "semantic_stage_closure" })),
    contributions: graphFunctions.map(g => ({ ...base.contributions[0], handle: g.name, declarationOrContractRef: g.name })) };
}

/** Explicit deterministic transport double. It returns candidates only; the
 * real C0/C2 implementations perform every mutation and command observation. */
export async function installGenericJobTransport(scratch, { initialConstruction = "lawful" } = {}) {
  assert.ok(["lawful", "failed_verifier"].includes(initialConstruction));
  const path = join(scratch, "generic-job-transport.mjs");
  const code = `#!/usr/bin/env node
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
let prompt='';process.stdin.setEncoding('utf8');process.stdin.on('data',s=>prompt+=s);
process.stdin.on('end',()=>{
 const emit=x=>console.log(JSON.stringify(x));const schema=JSON.parse(process.argv[process.argv.indexOf('--json-schema')+1]);
 emit({type:'system',subtype:'init',model:'disclosed-generic-job-mechanical-double'});let raw;
 if(schema.properties.kind.const==='worksite_command_execution_worker_result'){
  const input=JSON.parse(prompt.split('\\n\\n')[1]);assert.deepEqual(Object.keys(input),['command']);
  const match=/^'([^']+)' '([^']+)' --task '([^']+)'$/.exec(input.command);assert.ok(match);assert.equal(match[1],process.execPath);
  assert.ok(match[2].endsWith('/build/code/src/implementation/worksite_command_helper.js'));
  emit({type:'assistant',message:{content:[{type:'tool_use',id:'toolu_generic_job',name:'Bash',input}]}});
  const p=spawnSync(match[1],[match[2],'--task',match[3]],{encoding:'utf8',maxBuffer:32*1024*1024});assert.equal(p.status,0,p.stderr);
  raw=JSON.parse(p.stdout);emit({type:'user',message:{content:[{type:'tool_result',tool_use_id:'toolu_generic_job',content:p.stdout}]}});
 }else if(schema.properties.kind.const==='worksite_construction_worker_result'){
  const data=JSON.parse(prompt.split('\\n\\n')[1]),selected=schema.properties.files.items.properties.targetRef;
  const targetRefs=selected.enum??[selected.const];
  const main=${JSON.stringify(initialConstruction)}==='failed_verifier'&&!Object.hasOwn(data,'revisionFeedback')
    ?"export function greeting(){ return 'wrong'; }\\n":data.currentReadOnlyDependencies?.some(row=>row.relativePath==='shared/lib.mjs')
    ?"import { sharedGreeting } from '../shared/lib.mjs';\\nexport function greeting(){ return sharedGreeting; }\\n":"export function greeting(){ return 'Hello World'; }\\n";
  const verifier="import assert from 'node:assert/strict';\\nimport {greeting} from './main.mjs';\\nassert.equal(greeting(),'Hello World');\\nconsole.log('verified Hello World');\\n";
  raw={kind:'worksite_construction_worker_result',schemaVersion:'5.0.0',files:targetRefs.map(targetRef=>{
   const row=data.currentWorksite.find(r=>r.targetRef===targetRef);assert.ok(row);assert.ok(['app/main.mjs','app/check.mjs'].includes(row.relativePath));
   return {kind:'worksite_candidate_file',schemaVersion:'5.0.0',targetRef,replacementText:row.relativePath==='app/main.mjs'?main:verifier};})};
 }else{
  const s={};for(const part of prompt.split(/^## /m).slice(1)){const cut=part.indexOf('\\n');s[part.slice(0,cut)]=JSON.parse(part.slice(cut+1).trim());}
  const q={memberRef:s.source[0].memberRef,quote:s.source[0].text};const active=s.obligations.activeBindings;
  if(schema.properties.kind.const==='semantic_revision_selection'){
   const selected=s.task.targets.filter(t=>t.target.subject.relativePath==='app/main.mjs');assert.equal(selected.length,1);
   raw={kind:'semantic_revision_selection',schemaVersion:'5.0.0',parent:s.task.input.parent,causes:s.task.input.causes,mode:'construction_repair',
    selectedStageRef:null,selectedObligationRefs:active.map(b=>b.binding.obligationRef),selectedTargetRefs:selected.map(t=>t.target.targetRef),reasonRef:'reason://mechanical/observed-verifier-failure'};
  }else if(schema.properties.criteria){const current=s.predecessors.at(-1);
   const failed=s.task.bodyCapabilities.includes('application_assessment')&&s.evidence.observed.executionObservation.commandResults.some(c=>c.exitStatus!==0);
   raw={kind:'semantic_stage_assessment_candidate',schemaVersion:'5.0.0',
   criteria:s.task.rubric.map(c=>({criterionRef:c.criterionRef,disposition:failed?'falsified':'satisfied',explanation:'Disclosed mechanical relation witness only.',sourceQuotes:[q],statementRefs:current.candidate.asset.statements.map(t=>t.statementRef)})),pressure:[]};
  }else{
   const requirements=s.task.bodyCapabilities.includes('requirement_refinement'),design=s.task.bodyCapabilities.includes('worksite_design');
   const obligations=active.map(b=>b.binding.obligationRef),versions=active.map(b=>b.versionRef),cap=s.worksite.scope.executableCapabilities[0];
   raw={kind:'semantic_job_asset_candidate',schemaVersion:'5.0.0',asset:{kind:'semantic_stage_asset_candidate',schemaVersion:'5.0.0',
    statements:[{statementRef:s.task.stageRef+'/mechanical',text:q.quote,modality:'supporting',sourceQuotes:[q],requirementRefs:active.map(b=>b.binding.requirementRef),
     obligationRefs:obligations,predecessorStatementRefs:s.predecessors.flatMap(a=>a.candidate.asset.statements.map(t=>t.statementRef))}],
    requirementCandidates:requirements?[{candidateRef:'candidate://mechanical/greeting',meaning:q.quote,sourceQuotes:[q],parentRequirementRefs:[]}]:[],worksiteDesign:null,pressure:[]},
    bindings:requirements?[{requirement:{kind:'candidate',ref:'candidate://mechanical/greeting'},previousVersionRef:null,templateRef:s.obligations.installedTemplates[0].templateRef,
     scope:'This ordinary job',realizationMeaning:['Actual constructed application'],proofMeaning:['Actual independent verifier execution'],unprovedScope:['Semantic adequacy'],closureRule:'Non-closing application coverage',requiredContent:[]}]:[],
    design:design?{targets:[['app/main.mjs','implementation'],['app/check.mjs','verifier']].map(([relativePath,role])=>({relativePath,role,obligationRefs:obligations,bindingVersionRefs:versions,changeInstruction:'Construct this role from the ordinary source'})),
      dependencyPaths:s.worksite.observation?.entries?.some(row=>row.relativePath==='shared/lib.mjs'&&row.state==='file')?['shared/lib.mjs']:[],dependencyDisposition:'sufficient',commands:[{commandId:'command://mechanical/check',executable:cap.executable,args:['check.mjs'],relativeCwd:'app',environment:{},timeoutMs:5000,terminationGraceMs:1000,expectedReports:[]}],outcomePredicates:[]}:null};
   if(schema.properties.kind.const==='semantic_job_design_response'){
    const c=s.role.actorContract,select=(refs,domain)=>refs.map(ref=>{const index=domain.indexOf(ref);assert.ok(index>=0);return index;});
    raw.kind='semantic_job_design_response';
    for(const statement of raw.asset.statements){
     statement.requirementRefs=select(statement.requirementRefs,c.requirementRefs);
     statement.obligationRefs=select(statement.obligationRefs,c.obligationRefs);
     statement.predecessorStatementRefs=select(statement.predecessorStatementRefs,c.predecessorStatementRefs);
     for(const quote of statement.sourceQuotes)quote.memberRef=select([quote.memberRef],c.sourceMemberRefs)[0];
    }
    for(const pressure of raw.asset.pressure)pressure.requirementRefs=select(pressure.requirementRefs,c.requirementRefs);
    for(const target of raw.design?.targets??[]){target.obligationRefs=select(target.obligationRefs,c.obligationRefs);target.bindingVersionRefs=select(target.bindingVersionRefs,c.design.active.map(b=>b.versionRef));}
   }
  }
 }
 emit({type:'result',subtype:'success',result:JSON.stringify(raw)});
});
`;
  await writeFile(path, code, { flag: "wx" }); await chmod(path, 0o755); return path;
}
