import * as gtl from "../support/language-structural-gtl.mjs";
import * as product from "../../build/code/src/product/index.js";
import * as retryModule from "../../build/code/src/abg/retry.js";
import assert from "node:assert/strict";
import test from "node:test";
const FAN_OUT_PROGRAM_REF = "program://t287/test/retry-fan-out@5";
const FAN_OUT_GRAPH_FUNCTION_REF =
  "graph-function://t287/test/retry-fan-out@5";
const FAN_OUT_GRAPH_REF = "graph://t287/test/retry-fan-out@5";
const FAN_OUT_NODE_REF = "node://t287/test/retry-fan-out@5";

function extendContributionMembership(
  contribution,
  programRef,
) {
  return {
    ...structuredClone(contribution),
    programMembershipRefs: [
      ...contribution.programMembershipRefs,
      programRef,
    ],
    readinessPrerequisiteRefs: [
      ...contribution.readinessPrerequisiteRefs,
      programRef,
    ],
  };
}

function publicationWithRootVariant(base, input) {
  const sourceContribution = base.contributions.find((candidate) =>
    candidate.handle === input.sourceGraphFunctionRef);
  assert.ok(sourceContribution);
  const childContributions = input.childRefs.map((childRef) => {
    const contribution = base.contributions.find((candidate) =>
      candidate.handle === childRef);
    assert.ok(contribution);
    return extendContributionMembership(contribution, input.program.programRef);
  });
  return Object.freeze({
    ...base,
    programs: [...base.programs, input.program],
    graphFunctions: [...base.graphFunctions, input.graphFunction],
    contributions: [
      ...base.contributions.filter((candidate) =>
        !input.childRefs.includes(candidate.handle)),
      ...childContributions,
      {
        ...structuredClone(sourceContribution),
        handle: input.graphFunction.name,
        declarationOrContractRef: input.graphFunction.name,
        programMembershipRefs: [input.program.programRef],
        readinessPrerequisiteRefs: [input.program.programRef],
      },
    ],
  });
}

function retryFanOutPublication(gtl, base) {
  const source = base.graphFunctions.find((candidate) =>
    candidate.name === gtl.FAN_OUT_IDS.graphFunctionRef);
  const sourceProgram = base.programs.find((candidate) =>
    candidate.programRef === gtl.FAN_OUT_IDS.programRef);
  assert.ok(source);
  assert.ok(sourceProgram);
  const sourceTerm = source.template.nodes[0].term;
  assert.equal(sourceTerm.kind, "c_compose");
  assert.equal(sourceTerm.terms[0].kind, "c_batch");
  const declaredBatch = sourceTerm.terms[0];
  const declaredTask = declaredBatch.tasks[0];
  const sourceTask = gtl.workflow.C(gtl.cGraphFunctionRef({
    graphFunctionRef: declaredTask.graphFunctionRef,
    input: gtl.cCarrier(declaredTask.inputCarrierRef),
    output: gtl.cCarrier(declaredTask.outputCarrierRef),
  }));
  const batch = gtl.C.batch([sourceTask], declaredBatch.batchRef, {
    input: gtl.cCarrier(declaredBatch.inputCarrierRef),
    output: gtl.cCarrier(declaredBatch.outputCarrierRef),
  });
  const declaredReducer = sourceTerm.terms[1];
  const reducer = gtl.workflow.C(gtl.cGraphFunctionRef({
    graphFunctionRef: declaredReducer.graphFunctionRef,
    input: gtl.cCarrier(declaredReducer.inputCarrierRef),
    output: gtl.cCarrier(declaredReducer.outputCarrierRef),
  }));
  const childRefs = [
    gtl.FAN_OUT_IDS.elementGraphFunctionRef,
    gtl.FAN_OUT_IDS.reducerGraphFunctionRef,
  ];
  const graphFunction = Object.freeze({
    ...structuredClone(source),
    name: FAN_OUT_GRAPH_FUNCTION_REF,
    template: {
      ...structuredClone(source.template),
      graphRef: FAN_OUT_GRAPH_REF,
      startNodeRef: FAN_OUT_NODE_REF,
      terminalNodeRefs: [FAN_OUT_NODE_REF],
      nodes: [{
        nodeRef: FAN_OUT_NODE_REF,
        nodeKind: "c_locus",
        term: gtl.C.compose(
          gtl.C.retry(gtl.C.retry(batch, 2), 2),
          reducer,
        ),
      }],
    },
    tags: [...source.tags, "t287-test-only"],
  });
  const program = Object.freeze({
    ...structuredClone(sourceProgram),
    programRef: FAN_OUT_PROGRAM_REF,
    starts: [{
      startRef: "start://t287/test/retry-fan-out@5",
      graphFunctionRef: FAN_OUT_GRAPH_FUNCTION_REF,
    }],
    callableMembership: [FAN_OUT_GRAPH_FUNCTION_REF, ...childRefs],
  });
  return {
    publication: publicationWithRootVariant(base, {
      sourceGraphFunctionRef: source.name,
      graphFunction,
      program,
      childRefs,
    }),
    programRef: program.programRef,
    graphFunctionRef: graphFunction.name,
    childRefs,
    sourceTask,
    input: gtl.constructMemberVector(["Ada", "Grace", "Margaret"]),
  };
}

test("T-287 TV5 declared retry boundary identity is stable across structural descent and distinct across sibling loci", async () => {
  // A declared test-owned Product value supplies structural premises only.
  const publication = gtl.constructStructuralModulePublication({
    productId: "product://abi5-tests/retry-boundary@5",
    artifactDigest: product.sha256Canonical("retry-boundary component archive"),
    productContentDigest: product.sha256Canonical("retry-boundary component content"),
    productManifestDigest: product.sha256Canonical("retry-boundary component manifest"),
    packageName: "@abi5-tests/structural-fixtures",
    packageVersion: "5.0.0",
  });
  const fixture = retryFanOutPublication(gtl, publication);
  const graphFunction = fixture.publication.graphFunctions.find((candidate) =>
    candidate.name === fixture.graphFunctionRef);
  assert.ok(graphFunction);
  const materializationBasis = {
    invocationAdmissionRef:
      "invocation-admission://t287/tv5/retry-boundary-coordinate",
    admittedInputRef:
      "raw-admission://t287/tv5/retry-boundary-coordinate",
    admittedInputDigest: product.sha256Canonical(fixture.input),
    admittedInput: fixture.input,
  };
  const graph = gtl.materializeGraph(graphFunction, materializationBasis);
  const cursorFor = ({
    declaredGraph,
    nodeRef,
    termPath,
    taskOrdinal,
    retryPath,
  }) => {
    const body = {
      programRef: "program://t287/tv5/retry-boundary-coordinate@5",
      executionBasisRef:
        "execution-basis://t287/tv5/retry-boundary-coordinate",
      traversalScopeRef:
        "traversal-scope://t287/tv5/retry-boundary-coordinate",
      runId: "run://t287/tv5/retry-boundary-coordinate",
      graphCallId: "graph-call://t287/tv5/retry-boundary-coordinate",
      frameId: "frame://t287/tv5/retry-boundary-coordinate",
      graphRef: declaredGraph.materializationRef,
      inputRef: "input://t287/tv5/retry-boundary-coordinate",
      inputDigest: product.sha256Canonical({
        kind: "retry_boundary_coordinate_input",
        schemaVersion: "5.0.0",
      }),
      currentNodeRef: nodeRef,
      position: "at_term",
      termPath,
      taskOrdinal,
      attempt: retryPath.at(-1),
      retryPath,
    };
    const cursorDigest = product.sha256Canonical(body);
    return {
      kind: "traversal_cursor",
      schemaVersion: "5.0.0",
      cursorRef:
        `traversal-cursor://abiogenesis/${
          cursorDigest.slice("sha256:".length)
        }`,
      cursorDigest,
      ...body,
    };
  };
  const nodeRef = graph.template.startNodeRef;
  const nestedAttemptPath = [
    "node", nodeRef, "c", "terms", "0", "term", "term",
  ];
  const nestedAttemptCursor = cursorFor({
    declaredGraph: graph,
    nodeRef,
    termPath: nestedAttemptPath,
    taskOrdinal: null,
    retryPath: [1, 1],
  });
  const nestedDescendantCursor = cursorFor({
    declaredGraph: graph,
    nodeRef,
    termPath: [...nestedAttemptPath, "tasks", "0"],
    taskOrdinal: 0,
    retryPath: [1, 1],
  });
  const nestedAttemptCoordinates =
    retryModule.projectDeclaredRetryAttemptCoordinates(
      graph,
      nestedAttemptCursor,
    );
  const nestedDescendantCoordinates =
    retryModule.projectDeclaredRetryAttemptCoordinates(
      graph,
      nestedDescendantCursor,
    );
  assert.ok(nestedAttemptCoordinates);
  assert.ok(nestedDescendantCoordinates);
  assert.equal(
    nestedDescendantCoordinates.retryBoundaryRef,
    nestedAttemptCoordinates.retryBoundaryRef,
    "one declared retry boundary retains one identity from attempt cursor through its exact C.batch descendant",
  );
  assert.equal(nestedAttemptCoordinates.taskOrdinal, null);
  assert.equal(nestedDescendantCoordinates.taskOrdinal, null);

  const sourceRoot = graphFunction.template.nodes[0]?.term;
  assert.equal(sourceRoot?.kind, "c_compose");
  const sourceBatch = sourceRoot.terms[0]?.term?.term;
  assert.equal(sourceBatch?.kind, "c_batch");
  const sourceTask = fixture.sourceTask;
  assert.ok(sourceTask);
  const siblingRetryTerm = gtl.C.batch([
    gtl.C.retry(gtl.C.batch(
      [sourceTask],
      "batch://t287/tv5/retry-boundary/inner-0",
    ), 2),
    gtl.C.retry(gtl.C.batch(
      [sourceTask],
      "batch://t287/tv5/retry-boundary/inner-1",
    ), 2),
  ], "batch://t287/tv5/retry-boundary/siblings");
  const siblingGraphFunction = Object.freeze({
    ...graphFunction,
    name: "graph-function://t287/tv5/retry-boundary-siblings@5",
    template: {
      ...graphFunction.template,
      graphRef: "graph-template://t287/tv5/retry-boundary-siblings@5",
      nodes: [{
        nodeRef,
        nodeKind: "c_locus",
        term: siblingRetryTerm,
      }],
      applications: [],
    },
  });
  const siblingGraph = gtl.materializeGraph(
    siblingGraphFunction,
    materializationBasis,
  );
  const siblingAttemptPath = (ordinal) => [
    "node", nodeRef, "c", "tasks", String(ordinal), "term",
  ];
  const siblingCoordinates = [0, 1].map((ordinal) => {
    const attemptCursor = cursorFor({
      declaredGraph: siblingGraph,
      nodeRef,
      termPath: siblingAttemptPath(ordinal),
      taskOrdinal: ordinal,
      retryPath: [1],
    });
    const descendantCursor = cursorFor({
      declaredGraph: siblingGraph,
      nodeRef,
      termPath: [...siblingAttemptPath(ordinal), "tasks", "0"],
      taskOrdinal: 0,
      retryPath: [1],
    });
    const attemptCoordinates =
      retryModule.projectDeclaredRetryAttemptCoordinates(
        siblingGraph,
        attemptCursor,
      );
    const descendantCoordinates =
      retryModule.projectDeclaredRetryAttemptCoordinates(
        siblingGraph,
        descendantCursor,
      );
    assert.ok(attemptCoordinates);
    assert.ok(descendantCoordinates);
    assert.equal(attemptCoordinates.taskOrdinal, ordinal);
    assert.equal(descendantCoordinates.taskOrdinal, ordinal);
    assert.equal(
      descendantCoordinates.retryBoundaryRef,
      attemptCoordinates.retryBoundaryRef,
      "a retry declared inside C.batch retains its declaration-context task ordinal through deeper descent",
    );
    return attemptCoordinates;
  });
  assert.notEqual(
    siblingCoordinates[0].retryBoundaryRef,
    siblingCoordinates[1].retryBoundaryRef,
    "distinct declared sibling retry loci retain distinct owner identities",
  );
});
