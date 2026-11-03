import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { runInstalledLanguageTest } from "../support/installed-language-test.mjs";
import { prepareLanguageStructuralFixture } from "../support/language-structural-fixture.mjs";
import { GRAPH_EDGE_IDS, STRUCTURAL_IDS, constructStructuralInput } from "../fixtures/language-structural/program.mjs";
const packageRoot = fileURLToPath(new URL("../..", import.meta.url));

test("M5 installed HoG traverses an independently declared composed GraphFunction", async context => {
  const proof = await runInstalledLanguageTest(context, packageRoot, {
    prepareFixture: prepareLanguageStructuralFixture,
    programRef: GRAPH_EDGE_IDS.programRef,
    catalogHandle: GRAPH_EDGE_IDS.graphFunctionRef,
    allowlist: [GRAPH_EDGE_IDS.graphFunctionRef],
    // Direct control selects the Product-declared default start (target next);
    // a caller-selected start is supervised-only (gtl/public_start).
    input: constructStructuralInput("  Qualification  "),
    identity: "structural-graph-edge",
  });
  assert.equal(proof.receipt.exitCode, 0);
  assert.equal(proof.receipt.ownerOutput.outcomeKind, "result");
  const { events, reads, environment, resolution } = proof;
  const owner = environment.additionalProducts[0].basis.productId;
  assert.equal(resolution.resolution.programOwner.productId, owner);
  assert.equal(resolution.declarationClosure.semanticsOwner.productId, owner);
  assert.equal(resolution.implementationSetCandidate.rows.every(row => row.implementationOwnerProductId === owner), true);
  assert.notEqual(owner, environment.verified.productId);
  const calls = events.filter(event => event.kind === "c_call_opened");
  const results = events.filter(event => event.kind === "c_call_result_admitted");
  const fibres = events.filter(event => event.kind === "c_call_fibre_selected");
  const routes = events.filter(event => event.kind === "traversal_route_admitted");
  assert.equal(calls.length, 2);
  assert.equal(fibres.length, 2);
  assert.equal(results.length, 2);
  assert.deepEqual(results[0].payload.value, { kind: "normalized_data", schemaVersion: "5.0.0", subject: "Qualification" });
  assert.equal(results[1].payload.contractRef, STRUCTURAL_IDS.outputContractRef);
  assert.deepEqual(results[1].payload.value, { kind: "data_output", schemaVersion: "5.0.0", message: "Qualification" });
  assert.equal(new Set(fibres.map(event => event.payload.compositionRef)).size, 1);
  assert.deepEqual(routes.map(event => event.payload.routeKind), ["advance", "terminal"]);
  assert.notEqual(routes[0].payload.targetCursorRef, null);
  assert.equal(routes[1].payload.targetCursorRef, null);
  assert.equal(events.filter(event => event.kind === "run_closed").length, 1);
  assert.deepEqual(reads.map(read => read.memberKey), ["run_result", "run_replay"]);
  assert.equal(reads.every(read => read.receipt.exitCode === 0), true);
  assert.equal(JSON.stringify(events).includes("CompiledCProgramPlan"), false);
  assert.equal(JSON.stringify(events).includes("compiled_execution"), false);
});

// RC5 retained route: the structural atomic child admits S; the parent c_workflow
// conserves it as its own Result; the retained E/S/T edge feeds a deterministic
// consumer. The canonical binding is data from the supplied bootstrap Product
// owner; the retained contract stays declared only by its ABI owner module.
const RC5_IDS = Object.freeze({ programRef: "program://abi5-tests/structural/rc5-retained@5",
  graphFunctionRef: "graph-function://abi5-tests/structural/rc5-retained@5" });
function rc5RetainedRouteSource(product) {
  const binding = product.graphInputRetentionBinding(STRUCTURAL_IDS.inputContractRef, STRUCTURAL_IDS.outputContractRef);
  assert.equal(binding.targetContractRef, product.RETAINED_GRAPH_INPUT_CONTRACT.contractRef);
  const once = (text, anchor, next) => {
    assert.equal(text.split(anchor).length, 2, `fixture anchor ${anchor}`);
    return text.replace(anchor, () => next);
  };
  const edits = {
    "program.mjs": [
      ["export const STRUCTURAL_FIXTURE_OWNER = ", `const RC5_RETAINED_BINDING = Object.freeze(${JSON.stringify(binding)});\nexport const STRUCTURAL_FIXTURE_OWNER = `],
      ["export const WORKFLOW_IDS = ids('workflow');", "export const WORKFLOW_IDS = ids('workflow');\nexport const RC5_RETAINED_IDS = Object.freeze({ ...ids('rc5-retained'), consumerNodeRef: ref('node','rc5-retained/consume') });"],
      ["export const contractKinds = Object.freeze({", "export const contractKinds = Object.freeze({\n  [RC5_RETAINED_BINDING.targetContractRef]:'retained_graph_input',"],
      ["export const LEAF_SPECS = Object.freeze({", "export const LEAF_SPECS = Object.freeze({\n  rc5Consumer:{ids:ids('rc5-retained/consume'),input:RC5_RETAINED_BINDING.targetContractRef,output:STRUCTURAL_IDS.outputContractRef,kind:'data_output'},"],
      ["{cases=['atomic','compose','graph-edge','substitute','workflow','gate','recursion','fan-out','worker','retry','worker-deterministic','worker-compose']}={}", "{cases=['rc5-retained-route']}={}"],
      // The ABI worksite module owns T; the fixture only references it.
      ["const contract = (contractRef,contractKind,valueKind) => {if(", "const contract = (contractRef,contractKind,valueKind) => {if(contractRef===RC5_RETAINED_BINDING.targetContractRef)return;if("],
      ["  // One handle can belong to multiple finite test Programs, exactly as ordinary GTL.", `  if(cases.includes('rc5-retained-route')){
    const E=STRUCTURAL_IDS.inputContractRef,S=STRUCTURAL_IDS.outputContractRef,G=RC5_RETAINED_IDS,C=LEAF_SPECS.rc5Consumer.ids;
    const source=gtl.workflow.C(gtl.cGraphFunctionRef({graphFunctionRef:STRUCTURAL_IDS.graphFunctionRef,input:gtl.cCarrier(E),output:gtl.cCarrier(S)}));
    const parent=graph(G,source,E,S,{terminal:C});
    parent.template={...parent.template,terminalNodeRefs:[G.consumerNodeRef],
      nodes:[...parent.template.nodes,{nodeRef:G.consumerNodeRef,nodeKind:'c_locus',term:of('rc5Consumer','result',true,G.consumerNodeRef)}],
      edges:[gtl.graphEdge({fromNodeRef:G.nodeRef,toNodeRef:G.consumerNodeRef,inputBinding:RC5_RETAINED_BINDING})]};
    graphFunctions.push(parent);addProgram(G,[G.graphFunctionRef,STRUCTURAL_IDS.graphFunctionRef],{terminal:C});
  }
  // One handle can belong to multiple finite test Programs, exactly as ordinary GTL.`],
    ],
    "leaf.mjs": [
      ["import {canonicalJson as canonical,sha256Canonical as hash} from '@abiogenesis/typescript-tenant/product';",
        "import {canonicalJson as canonical,sha256Canonical as hash,isRetainedGraphInput} from '@abiogenesis/typescript-tenant/product';"],
      ["export const atomic=input=>", "export const rc5Consumer=input=>candidate('rc5Consumer',input,value('data_output',{message:input.source.message}));\nexport const atomic=input=>"],
      ["function valid(kind,v){", "function valid(kind,v){\n if(kind==='retained_graph_input')return isRetainedGraphInput(v)&&valid('data_input',v.entry)&&valid('data_output',v.source);"],
      ["const relation=(input,output)=>{", "const relation=(input,output)=>{\n if(input?.kind==='retained_graph_input')return isRetainedGraphInput(input)&&output?.kind==='data_output'&&input.source.message===input.entry.subject.trim()&&output.message===input.source.message;"],
    ],
  };
  return (name, text) => (edits[name] ?? []).reduce((current, [anchor, next]) => once(current, anchor, next), text);
}

test("RC5 retained route carries an installed c_workflow source as a physical reference to its admitted Result", async context => {
  const subject = Array.from({ length: 200 }, (_, index) => `retained source member ${index}`).join(" | ");
  const input = constructStructuralInput(subject);
  const proof = await runInstalledLanguageTest(context, packageRoot, {
    prepareFixture: basis => prepareLanguageStructuralFixture({ ...basis, sourceTransform: rc5RetainedRouteSource(basis.product) }),
    programRef: RC5_IDS.programRef,
    catalogHandle: RC5_IDS.graphFunctionRef,
    allowlist: [RC5_IDS.graphFunctionRef],
    input,
    identity: "rc5-retained-route",
  });
  assert.equal(proof.receipt.exitCode, 0);
  assert.equal(proof.receipt.ownerOutput.outcomeKind, "result");
  const { events, reads, handoff, environment } = proof;
  const S = { kind: "data_output", schemaVersion: "5.0.0", message: subject };
  const retained = events.filter(event => event.kind === "traversal_route_admitted" &&
    event.payload.boundInput?.value?.kind === "retained_graph_input");
  assert.equal(retained.length, 1);
  const [used] = retained;
  const consumed = events.filter(event => event.kind === "c_call_result_admitted" && event.aggregateId === used.payload.cCallRef &&
    event.runId === used.runId && event.basisId === used.basisId && event.graphCallId === used.graphCallId && event.frameId === used.frameId);
  assert.equal(consumed.length, 1);
  const [parentResult] = consumed;
  // Admitted truth: the restored retained source is the parent's admitted S.
  assert.deepEqual(parentResult.payload.value, S);
  assert.deepEqual(used.payload.boundInput.value, { kind: "retained_graph_input", schemaVersion: "5.0.0", entry: input, source: S });
  assert.equal(used.causationEventRefs.includes(parentResult.eventId), true);
  // Storage observations from the actual installed run's physical rows.
  const rows = (await readFile(new URL(handoff.prefix.eventLogRef))).toString("utf8").trimEnd().split("\n").map(line => JSON.parse(line));
  const physical = event => rows.filter(row => (row.kind === "abg_admitted_body_reference_record" ? row.event : row).eventId === event.eventId);
  const [resultRow] = physical(parentResult), [routeRow] = physical(used);
  assert.equal(resultRow.kind, "abg_admitted_body_reference_record");
  assert.equal(resultRow.codecVersion, 1, "the parent source Result is itself physically referenced");
  const childResult = events.find(event => event.eventId === resultRow.bodyReference.sourceEventRef);
  assert.equal(childResult.kind, "c_call_result_admitted");
  assert.notEqual(childResult.graphCallId, parentResult.graphCallId, "the inline body belongs to the child graph call");
  assert.equal(routeRow.kind, "abg_admitted_body_reference_record");
  assert.equal(routeRow.codecVersion, 3, "the retained route names its consumed Result");
  assert.deepEqual(routeRow.bodyReference, { sourceEventRef: parentResult.eventId, sourcePayloadDigest: parentResult.payloadDigest,
    sourceSlot: "c_call_result_value", bodyDigest: environment.product.sha256Canonical(S) });
  assert.equal(Object.hasOwn(routeRow.event.payload.boundInput.value, "source"), false);
  const terminal = events.filter(event => event.kind === "c_call_result_admitted").at(-1);
  assert.deepEqual(terminal.payload.value, S, "the deterministic consumer checked E/S and returned S");
  assert.equal(events.filter(event => event.kind === "run_closed").length, 1);
  // Both fresh installed reads decode the v3 row in separate processes.
  assert.deepEqual(reads.map(read => read.memberKey), ["run_result", "run_replay"]);
  assert.equal(reads.every(read => read.receipt.exitCode === 0 && read.receipt.ownerOutput.outcomeKind === "result"), true);
});
