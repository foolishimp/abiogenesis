import assert from "node:assert/strict";
import test from "node:test";
import * as Effect from "effect/Effect";

import * as gtl from "../../build/code/src/gtl/index.js";
import * as hog from "../../build/code/src/hog/index.js";
import {
  completeDirectEffectFold,
  directEffectFold,
  evaluateDirectEffectFold,
  returnDirectEffectFold,
} from "../../build/code/src/hog/effect_fold_core.js";

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

test("M5 HoG folds one actual nested C tree with one immutable return stack", async () => {
  const carrier = gtl.cCarrier("contract://m5/core/value");
  const exactLeaf = (stageRole, fibre = "F_D") => gtl.C.of({
    input: carrier,
    output: carrier,
    programLocusRef: `locus://m5/core/${stageRole}`,
    stageRole,
    fibre,
    armId: `arm://m5/core/${stageRole}`,
    compositionRef: null,
    vectorIndex: 0,
    judgmentPredicateRef: `predicate://m5/core/${stageRole}`,
    resultBearing: stageRole === "consequence" || stageRole === "child",
    requirement: fibre === "F_H"
      ? {
          kind: "interaction_leaf_requirement",
          interactionKind: "human_assurance",
          actorCapabilityRef: "capability://m5/core/human-assurance",
          requestContractRef: carrier.ref,
          responseContractRef: carrier.ref,
          continuationContractRef: "contract://m5/core/continuation",
        }
      : executableRequirement(
          `binding://m5/core/${stageRole}`,
          carrier.ref,
          carrier.ref,
        ),
  });
  const childGraphFunctionRef = "graph-function://m5/core/child";
  const childTemplate = {
    ...template(exactLeaf("child")),
    graphRef: "graph://m5/core/child",
    startNodeRef: "node://m5/core/child",
    terminalNodeRefs: ["node://m5/core/child"],
    nodes: [{
      nodeRef: "node://m5/core/child",
      nodeKind: "c_locus",
      term: exactLeaf("child"),
    }],
  };
  const workflowRef = gtl.cGraphFunctionRef({
    graphFunctionRef: childGraphFunctionRef,
    input: carrier,
    output: carrier,
  });
  const rootTerms = [
    gtl.C.edge({
      transform: exactLeaf("transform"),
      evaluate: exactLeaf("evaluate"),
      consequence: exactLeaf("consequence"),
    }),
    gtl.C.batch([
      exactLeaf("batch_member"),
      gtl.C.retry(exactLeaf("retry_member"), 2),
    ], "batch://m5/core"),
    gtl.workflow.C(workflowRef),
    exactLeaf("interaction", "F_H"),
  ];
  const rootTerm = rootTerms.slice(1).reduce(
    (left, right) => gtl.C.compose(left, right),
    rootTerms[0],
  );
  const rootStartNodeRef = "node://m5/core/root-identity";
  const rootBodyNodeRef = "node://m5/core/root-body";
  const rootTemplate = {
    kind: "inline_graph",
    graphRef: "graph://m5/core/root",
    startNodeRef: rootStartNodeRef,
    terminalNodeRefs: [rootBodyNodeRef],
    nodes: [{
      nodeRef: rootStartNodeRef,
      nodeKind: "c_locus",
      term: gtl.C.id(carrier),
    }, {
      nodeRef: rootBodyNodeRef,
      nodeKind: "c_locus",
      term: rootTerm,
    }],
    edges: [gtl.graphEdge({
      fromNodeRef: rootStartNodeRef,
      toNodeRef: rootBodyNodeRef,
    })],
    applications: [],
  };
  const templatesByNode = new Map([
    [rootStartNodeRef, rootTemplate],
    [rootBodyNodeRef, rootTemplate],
    [childTemplate.startNodeRef, childTemplate],
  ]);
  const childTemplates = new Map([[childGraphFunctionRef, childTemplate]]);
  const initialCoordinate = hog.rootCTraversalCoordinate(rootTemplate.startNodeRef);
  const initialStep = hog.deriveDirectCStepFromGraph(
    rootTemplate,
    initialCoordinate,
  );
  assert.equal(initialStep.kind, "direct_c_traversal_step");

  const visitedStates = [];
  const initial = evaluateDirectEffectFold({
    coordinate: initialCoordinate,
    value: Object.freeze([]),
    returns: Object.freeze([]),
    step: initialStep,
  });
  const receipt = await Effect.runPromise(directEffectFold(
    initial,
    (state) => Effect.sync(() => {
      visitedStates.push(state);
      if (state.stateKind === "return") {
        if (state.receipt.done) {
          return completeDirectEffectFold(state.receipt);
        }
        return evaluateDirectEffectFold({
          coordinate: state.receipt.nextStep.source,
          value: state.receipt.observed,
          returns: state.returns,
          step: state.receipt.nextStep,
        });
      }

      const templateAtCoordinate = templatesByNode.get(state.coordinate.nodeRef);
      assert.notEqual(templateAtCoordinate, undefined);
      const relation = "relation" in state.step ? state.step.relation : null;
      const observation = Object.freeze({
        nodeRef: state.coordinate.nodeRef,
        termKind: state.step.termKind,
        stepKind: state.step.stepKind,
        relation,
        leafKind: state.step.stepKind === "open_leaf"
          ? state.step.leafKind
          : null,
      });
      const observed = Object.freeze([...state.value, observation]);
      let returns = state.returns;
      let nextStep;
      if (state.step.stepKind === "enter_child") {
        const child = childTemplates.get(state.step.graphFunctionRef);
        assert.notEqual(child, undefined);
        returns = Object.freeze([...state.returns, Object.freeze({
          parentNodeRef: state.coordinate.nodeRef,
          parentSource: state.step.source,
        })]);
        nextStep = hog.deriveDirectCStepFromGraph(
          child,
          hog.rootCTraversalCoordinate(child.startNodeRef),
        );
      } else if (
        state.step.stepKind === "enter_term" ||
        state.step.stepKind === "start_task" ||
        state.step.stepKind === "retry" ||
        state.step.stepKind === "continue_term"
      ) {
        nextStep = hog.deriveDirectCStepFromGraph(
          templateAtCoordinate,
          state.step.target,
        );
      } else if (state.step.stepKind === "complete_term") {
        const parent = state.returns.at(-1);
        if (parent === undefined) {
          return completeDirectEffectFold(Object.freeze({
            done: true,
            nextStep: null,
            observed,
          }));
        }
        returns = state.returns.slice(0, -1);
        const parentTemplate = templatesByNode.get(parent.parentNodeRef);
        assert.notEqual(parentTemplate, undefined);
        nextStep = hog.deriveDirectCContinuationStepFromGraph(
          parentTemplate,
          parent.parentSource,
        );
      } else {
        nextStep = hog.deriveDirectCContinuationStepFromGraph(
          templateAtCoordinate,
          state.step.source,
        );
      }
      assert.equal(nextStep.kind, "direct_c_traversal_step");
      return returnDirectEffectFold({
        coordinate: state.coordinate,
        value: observed,
        returns,
        receipt: Object.freeze({
          done: false,
          nextStep,
          observed,
        }),
      });
    }),
  ));

  assert.equal(receipt.done, true);
  assert.deepEqual(
    [...new Set(receipt.observed.map(({ termKind }) => termKind))].sort(),
    [
      "c_batch",
      "c_compose",
      "c_edge",
      "c_identity",
      "c_of",
      "c_retry",
      "c_workflow",
    ],
  );
  assert.equal(
    receipt.observed.some(({ leafKind }) => leafKind === "executable"),
    true,
  );
  assert.equal(
    receipt.observed.some(({ leafKind }) => leafKind === "interaction"),
    true,
  );
  assert.equal(
    receipt.observed.some(({ nodeRef }) => nodeRef === childTemplate.startNodeRef),
    true,
  );
  assert.equal(
    receipt.observed.some(({ relation }) => relation === "batch_next"),
    true,
  );
  assert.equal(
    receipt.observed.some(({ relation }) => relation === "edge_next"),
    true,
  );
  assert.equal(
    receipt.observed.some(({ relation }) => relation === "compose_next"),
    true,
  );
  assert.equal(visitedStates.every(Object.isFrozen), true);
  assert.equal(visitedStates.every((state) => Object.isFrozen(state.returns)), true);
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

test("M5 HoG derives post-term continuation from the original GTL tree", () => {
  const request = gtl.cCarrier("contract://m5/continue-request");
  const candidate = gtl.cCarrier("contract://m5/continue-candidate");
  const assessment = gtl.cCarrier("contract://m5/continue-assessment");
  const result = gtl.cCarrier("contract://m5/continue-result");
  const transform = leaf({
    input: request,
    output: candidate,
    role: "transform",
    locus: "locus://m5/continue-transform",
  });
  const evaluate = leaf({
    input: candidate,
    output: assessment,
    role: "evaluate",
    locus: "locus://m5/continue-evaluate",
  });
  const consequence = leaf({
    input: assessment,
    output: result,
    role: "consequence",
    locus: "locus://m5/continue-consequence",
  });

  const composeGraph = template(gtl.C.compose(transform, evaluate, consequence));
  const composeFirst = hog.deriveDirectCContinuationStepFromGraph(composeGraph, {
    ...hog.rootCTraversalCoordinate(composeGraph.startNodeRef),
    termPath: ["node", composeGraph.startNodeRef, "c", "terms", "0"],
  });
  assert.equal(composeFirst.stepKind, "continue_term");
  assert.equal(composeFirst.relation, "compose_next");
  assert.deepEqual(composeFirst.target.termPath, [
    "node", composeGraph.startNodeRef, "c", "terms", "1",
  ]);
  const composeLast = hog.deriveDirectCContinuationStepFromGraph(composeGraph, {
    ...hog.rootCTraversalCoordinate(composeGraph.startNodeRef),
    termPath: ["node", composeGraph.startNodeRef, "c", "terms", "1"],
  });
  assert.equal(composeLast.stepKind, "complete_term");
  assert.equal(composeLast.relation, "root_complete");

  const edgeGraph = template(gtl.C.edge({ transform, evaluate, consequence }));
  const edgeEvaluate = hog.deriveDirectCContinuationStepFromGraph(edgeGraph, {
    ...hog.rootCTraversalCoordinate(edgeGraph.startNodeRef),
    termPath: ["node", edgeGraph.startNodeRef, "c", "evaluate"],
  });
  assert.equal(edgeEvaluate.stepKind, "continue_term");
  assert.equal(edgeEvaluate.relation, "edge_next");
  assert.deepEqual(edgeEvaluate.target.termPath, [
    "node", edgeGraph.startNodeRef, "c", "consequence",
  ]);

  const batchGraph = template(gtl.C.batch([consequence, consequence], "batch://m5/continue"));
  const batchFirst = hog.deriveDirectCContinuationStepFromGraph(batchGraph, {
    ...hog.rootCTraversalCoordinate(batchGraph.startNodeRef),
    termPath: ["node", batchGraph.startNodeRef, "c", "tasks", "0"],
    taskOrdinal: 0,
  });
  assert.equal(batchFirst.stepKind, "continue_term");
  assert.equal(batchFirst.relation, "batch_next");
  assert.equal(batchFirst.target.taskOrdinal, 1);
  assert.deepEqual(batchFirst.target.termPath, [
    "node", batchGraph.startNodeRef, "c", "tasks", "1",
  ]);
  assert.equal(
    gtl.resolveEnclosingCBatchRef(
      batchGraph,
      batchGraph.startNodeRef,
      batchFirst.target.termPath,
    ),
    "batch://m5/continue",
  );
  assert.equal(
    gtl.resolveEnclosingCBatchRef(
      edgeGraph,
      edgeGraph.startNodeRef,
      edgeEvaluate.target.termPath,
    ),
    null,
  );

  const retryGraph = template(gtl.C.retry(consequence, 2));
  const retrySuccess = hog.deriveDirectCContinuationStepFromGraph(retryGraph, {
    ...hog.rootCTraversalCoordinate(retryGraph.startNodeRef),
    termPath: ["node", retryGraph.startNodeRef, "c", "term"],
    retryPath: [1],
  });
  assert.equal(retrySuccess.stepKind, "complete_term");
  assert.equal(retrySuccess.relation, "root_complete");
});

test("M5 GTL graph continuation selects one declared edge and refuses topology substitutes", () => {
  const request = gtl.cCarrier("contract://m5/graph-edge/request");
  const candidate = gtl.cCarrier("contract://m5/graph-edge/candidate");
  const result = gtl.cCarrier("contract://m5/graph-edge/result");
  const edge = gtl.graphEdge({
    fromNodeRef: "node://m5/graph-edge/source",
    toNodeRef: "node://m5/graph-edge/target",
  });
  const graph = {
    kind: "inline_graph",
    graphRef: "graph://m5/graph-edge",
    startNodeRef: edge.fromNodeRef,
    terminalNodeRefs: [edge.toNodeRef],
    nodes: [{
      nodeRef: edge.fromNodeRef,
      nodeKind: "c_locus",
      term: leaf({
        input: request,
        output: candidate,
        role: "graph-edge-source",
        locus: "locus://m5/graph-edge/source",
        resultBearing: false,
      }),
    }, {
      nodeRef: edge.toNodeRef,
      nodeKind: "c_locus",
      term: leaf({
        input: candidate,
        output: result,
        role: "graph-edge-target",
        locus: "locus://m5/graph-edge/target",
      }),
    }],
    edges: [edge],
    applications: [],
  };
  const sourcePath = gtl.rootCSourcePath(edge.fromNodeRef);
  const continuation = gtl.deriveCSourceContinuation(
    graph,
    edge.fromNodeRef,
    sourcePath,
  );

  assert.equal(continuation.kind, "c_source_continuation");
  assert.equal(continuation.relation, "graph_edge");
  assert.deepEqual(continuation.targetPath, gtl.rootCSourcePath(edge.toNodeRef));

  const ambiguous = structuredClone(graph);
  ambiguous.edges.push({ ...edge, edgeRef: `${edge.edgeRef}/rival` });
  assert.equal(
    gtl.deriveCSourceContinuation(ambiguous, edge.fromNodeRef, sourcePath).kind,
    "c_source_path_refusal",
  );

  const terminalWithEdge = structuredClone(graph);
  terminalWithEdge.terminalNodeRefs = [edge.fromNodeRef, edge.toNodeRef];
  assert.equal(
    gtl.deriveCSourceContinuation(terminalWithEdge, edge.fromNodeRef, sourcePath).kind,
    "c_source_path_refusal",
  );

  const disconnected = structuredClone(graph);
  disconnected.edges = [];
  assert.equal(
    gtl.deriveCSourceContinuation(disconnected, edge.fromNodeRef, sourcePath).kind,
    "c_source_path_refusal",
  );
});
