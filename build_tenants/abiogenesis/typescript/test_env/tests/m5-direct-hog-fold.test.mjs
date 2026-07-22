import assert from "node:assert/strict";
import test from "node:test";

import * as gtl from "../../build/code/src/gtl/index.js";
import * as hog from "../../build/code/src/hog/index.js";

function executableRequirement(ref, inputContractRef, outputContractRef) {
  return {
    kind: "executable_leaf_requirement",
    implementationBindingRef: ref,
    inputContractRef,
    outputContractRef,
    evidenceContractRef: "contract://m5/evidence",
    failureContractRef: "contract://m5/failure",
    refusalContractRef: "contract://m5/refusal",
    judgmentContractRef: "contract://m5/judgment",
  };
}

function leaf({ input, output, role, locus, resultBearing = true }) {
  return gtl.C.of({
    input,
    output,
    programLocusRef: locus,
    stageRole: role,
    fibre: "F_D",
    armId: `arm://${role}`,
    compositionRef: null,
    vectorIndex: 0,
    judgmentPredicateRef: `predicate://${role}`,
    resultBearing,
    requirement: executableRequirement(`binding://${role}`, input.ref, output.ref),
  });
}

function template(term) {
  return {
    kind: "inline_graph",
    graphRef: "graph://m5/direct-fold",
    startNodeRef: "node://m5/root",
    terminalNodeRefs: ["node://m5/root"],
    nodes: [{
      nodeRef: "node://m5/root",
      nodeKind: "c_locus",
      term,
    }],
    edges: [],
    applications: [],
  };
}

test("M5 HoG derives one direct structural step for every C constructor", () => {
  const request = gtl.cCarrier("contract://m5/request");
  const candidate = gtl.cCarrier("contract://m5/candidate");
  const assessment = gtl.cCarrier("contract://m5/assessment");
  const result = gtl.cCarrier("contract://m5/result");
  const transform = leaf({
    input: request,
    output: candidate,
    role: "transform",
    locus: "locus://m5/transform",
    resultBearing: false,
  });
  const evaluate = leaf({
    input: candidate,
    output: assessment,
    role: "evaluate",
    locus: "locus://m5/evaluate",
    resultBearing: false,
  });
  const consequence = leaf({
    input: assessment,
    output: result,
    role: "consequence",
    locus: "locus://m5/consequence",
  });
  const workflowRef = gtl.cGraphFunctionRef({
    graphFunctionRef: "graph-function://m5/child",
    input: request,
    output: result,
  });
  const coordinate = hog.rootCTraversalCoordinate("node://m5/root");
  const terms = [
    transform,
    gtl.C.id(request),
    gtl.C.compose(transform, evaluate),
    gtl.C.edge({ transform, evaluate, consequence }),
    gtl.workflow.C(workflowRef),
    gtl.C.batch([consequence, consequence], "batch://m5/result"),
    gtl.C.retry(consequence, 2),
  ];

  const steps = terms.map((term) => hog.deriveDirectCStep(term, coordinate));
  assert.deepEqual(
    steps.map((step) => [step.termKind, step.stepKind]),
    [
      ["c_of", "open_leaf"],
      ["c_identity", "pass_identity"],
      ["c_compose", "enter_term"],
      ["c_edge", "enter_term"],
      ["c_workflow", "enter_child"],
      ["c_batch", "start_task"],
      ["c_retry", "retry"],
    ],
  );
  assert.equal(steps[0].leafKind, "executable");
  assert.deepEqual(steps[2].target.termPath, [
    "node", "node://m5/root", "c", "terms", "0",
  ]);
  assert.deepEqual(steps[3].target.termPath, [
    "node", "node://m5/root", "c", "transform",
  ]);
  assert.equal(steps[4].graphFunctionRef, "graph-function://m5/child");
  assert.equal(steps[5].taskCount, 2);
  assert.equal(steps[5].target.taskOrdinal, 0);
  assert.deepEqual(steps[5].target.termPath, [
    "node", "node://m5/root", "c", "tasks", "0",
  ]);
  assert.equal(steps[6].budget, 2);
  assert.equal(steps[6].target.attempt, 1);
  assert.deepEqual(steps[6].target.retryPath, [1]);
  assert.deepEqual(steps[6].target.termPath, [
    "node", "node://m5/root", "c", "term",
  ]);
  for (const step of steps) {
    assert.equal(Object.isFrozen(step), true);
    assert.equal("plan" in step, false);
    assert.equal("schedule" in step, false);
    assert.equal("steps" in step, false);
  }
});

test("M5 HoG re-reads the original GTL term at each source path", () => {
  const request = gtl.cCarrier("contract://m5/path-request");
  const candidate = gtl.cCarrier("contract://m5/path-candidate");
  const result = gtl.cCarrier("contract://m5/path-result");
  const first = leaf({
    input: request,
    output: candidate,
    role: "first",
    locus: "locus://m5/path-first",
  });
  const second = leaf({
    input: candidate,
    output: result,
    role: "second",
    locus: "locus://m5/path-second",
  });
  const graph = template(gtl.C.compose(first, second));
  const root = hog.rootCTraversalCoordinate(graph.startNodeRef);
  const enter = hog.deriveDirectCStepFromGraph(graph, root);
  assert.equal(enter.kind, "direct_c_traversal_step");
  assert.equal(enter.stepKind, "enter_term");

  const opened = hog.deriveDirectCStepFromGraph(graph, enter.target);
  assert.equal(opened.kind, "direct_c_traversal_step");
  assert.equal(opened.stepKind, "open_leaf");
  assert.equal(opened.programLocusRef, first.programLocusRef);
  assert.deepEqual(opened.source.termPath, enter.target.termPath);

  const forgedPath = {
    ...enter.target,
    termPath: [...enter.target.termPath.slice(0, -1), "9"],
  };
  const refused = hog.deriveDirectCStepFromGraph(graph, forgedPath);
  assert.equal(refused.kind, "direct_c_traversal_refusal");
  assert.equal(refused.code, "term_path_missing");
});

test("M5 HoG keeps F_H as a non-executable interaction leaf", () => {
  const request = gtl.cCarrier("contract://m5/human-request");
  const response = gtl.cCarrier("contract://m5/human-response");
  const interaction = gtl.C.of({
    input: request,
    output: response,
    programLocusRef: "locus://m5/human",
    stageRole: "human_assurance",
    fibre: "F_H",
    armId: "arm://human-assurance",
    compositionRef: null,
    vectorIndex: 0,
    judgmentPredicateRef: "predicate://human-assurance",
    resultBearing: true,
    requirement: {
      kind: "interaction_leaf_requirement",
      interactionKind: "human_assurance",
      actorCapabilityRef: "capability://m5/human-assurance",
      requestContractRef: request.ref,
      responseContractRef: response.ref,
      continuationContractRef: "contract://m5/continuation",
    },
  });
  const step = hog.deriveDirectCStep(
    interaction,
    hog.rootCTraversalCoordinate("node://m5/human"),
  );
  assert.equal(step.stepKind, "open_leaf");
  assert.equal(step.leafKind, "interaction");
  assert.equal(step.fibre, "F_H");
  assert.equal("implementationBindingRef" in step, false);
});
