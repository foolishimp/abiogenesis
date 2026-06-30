// Validates: T-180
// Validates: REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL
// Validates: REQ-L-GTL3-NODE
// Validates: REQ-L-GTL3-GRAPHFUNCTION

import test from "node:test";
import assert from "node:assert/strict";

import { emit } from "../../build/semantic/code/src/abg/m03/events/index.js";
import { constructGraphCallOpenedEvent } from "../../build/semantic/code/src/abg/m03/contracts/event_factories.js";
import { assertRuntimeEvent } from "../../build/semantic/code/src/abg/m03/contracts/event_admission.js";
import { runtimeEventsForIterationDecision } from "../../build/semantic/code/src/abg/m03/contracts/iteration_state_action.js";
import {
  assertTraversalCloseNodeTypeSatisfied,
  projectNodeTypeSatisfaction
} from "../../build/semantic/code/src/abg/m03/contracts/node_type_satisfaction.js";
import {
  admitGtlLibraryEntryDeclaration,
  assertGraphFunctionInvocationSelected,
  constructRegistryLookupRequest,
  lookupRuntimeGraphFunctionRegistry,
  projectRuntimeGraphFunctionRegistry,
  selectGraphFunctionFromRegistry
} from "../../build/semantic/code/src/abg/m03/contracts/runtime_graph_function_registry.js";
import { typecheckGtlProgram } from "../../build/semantic/code/src/abg/m03/contracts/gtl_program_conformance.js";
import {
  admitNode,
  compose,
  composeWithTypeWiring,
  composeNodeTypes,
  constructNodeTypeGraphFunction,
  edge,
  GTL_NODE_TYPE_GRAPH_FUNCTION_TAG,
  graphFunctionForVector,
  identity,
  materializeNodeType,
  materializeGraphFunction,
  constructNode,
  nodeContractKey,
  satisfiesNodeType,
  serializeNode
} from "../../build/semantic/code/src/gtl/m01/index.js";
import { constructGtlLibraryEntryDeclaration } from "../../build/semantic/code/src/gtl/m02/index.js";

function assetSurface(overrides = {}) {
  return {
    kind: "review_document",
    requiredContexts: ["context://t180/review"],
    standardsRefs: ["specification/requirements/gtl/REQ-L-GTL3-NODE.md"],
    outputContractRefs: ["contract://t180/review-document"],
    constructorRefs: [],
    constructorInputAssetKinds: [],
    rendererRefs: [],
    renderedViewDigestPolicyRef: null,
    sectionKindRefs: [],
    clauseKindRefs: [],
    authoritySlots: [],
    proofObligationRefs: ["proof://t180/review-document"],
    ...overrides
  };
}

function reviewNode(overrides = {}) {
  return constructNode({
    name: "ReviewDocument",
    schema: {
      kind: "symbolic",
      ref: "schema://t180/ReviewDocument"
    },
    typeRef: "node-type://t180/ReviewDocument",
    markov: ["review:ready"],
    assetSurface: assetSurface(),
    tags: ["t180", "node-type-proof"],
    ...overrides
  });
}

function simpleNode(name, overrides = {}) {
  return constructNode({
    name,
    schema: {
      kind: "symbolic",
      ref: `schema://t180/${name}`
    },
    typeRef: null,
    markov: [],
    assetSurface: assetSurface({
      kind: name.toLowerCase(),
      outputContractRefs: [`contract://t180/${name}`],
      proofObligationRefs: []
    }),
    tags: ["t180", "composition-proof"],
    ...overrides
  });
}

function graphFunctionFromEdge(source, target, name) {
  const graph = edge([source], target, { name });
  const [vector] = graph.vectors;
  assert.notEqual(vector, undefined);
  return graphFunctionForVector(vector, { name: `graph-function://${name}` });
}

function basisForGraphFunction(graphFunction) {
  return {
    id: "basis://t180/node-type-graph-call",
    workspaceRoot: "/tmp/t180",
    moduleName: "t180-node-types",
    graphFunction,
    graph: materializeGraphFunction(graphFunction),
    job: {
      name: "job://t180/node-type",
      contracts: [],
      roles: [],
      tags: [],
      policyHooks: { entries: [] },
      id: "job://t180/node-type"
    },
    modulePolicyHooks: { entries: [] },
    runtimeIdentity: {
      workerId: "worker://t180",
      backendId: "backend://t180",
      buildId: "build://t180",
      resolvedRuntimeRef: "runtime://t180"
    },
    resolvedPolicy: {
      resolvedPolicyBundleRef: "policy-bundle://t180",
      defaultRegime: "F_D",
      dispatchRef: null,
      approvalSubjectRef: null
    },
    startIntent: {
      scope: {
        kind: "workspace",
        workspaceRoot: "/tmp/t180",
        moduleName: "t180-node-types"
      },
      target: {
        kind: "graph_function",
        handle: graphFunction.name
      },
      until: "first_traversal"
    },
    runId: null,
    workKey: null,
    failedLeafTaskIds: [],
    nextVectorIndex: 0
  };
}

function captureEmit(events) {
  const captured = [];
  const emitted = emit(events, (event) => {
    captured.push(event);
  });
  assert.deepEqual(emitted, captured);
  return emitted;
}

function libraryEntry(overrides = {}) {
  return constructGtlLibraryEntryDeclaration({
    declarationRef: "gtl-declaration://t180/node-type/review-document",
    entryRef: "registry-entry://t180/node-type/review-document",
    libraryScope: "product",
    entryKind: "node_type",
    namespace: "odd_glc",
    ownerRef: "owner://odd_glc",
    version: "4.1.0-rc.17",
    graphFunctionRef: "graph-function://odd_glc/node-type/review-document",
    interfaceRef: "interface://t180/node-type/review-document",
    sourceContractRef: "contract://t180/review-document",
    targetContractRef: "contract://t180/review-document",
    contextRefs: ["context://t180/review"],
    authorityRefs: ["authority://gtl/typecheck"],
    overlayRefs: ["overlay://t180/type-library"],
    provenanceRefs: ["provenance://t180/node-type"],
    readinessRefs: ["readiness://t180/ready"],
    proofRefs: ["proof://t180/node-type"],
    policyRefs: ["policy://t180/typecheck-only"],
    declarationSourceRefs: ["gtl://module/t180/odd-glc-node-types"],
    ...overrides
  });
}

function admitEntry(declaration) {
  const admission = admitGtlLibraryEntryDeclaration({
    declaration,
    correlationId: `correlation://${declaration.entryRef}`
  });
  return captureEmit([admission])[0];
}

test("T-180 Node.typeRef is carrier truth preserved by admission, serialization, and contract identity", () => {
  const typed = reviewNode();
  assert.equal(typed.typeRef, "node-type://t180/ReviewDocument");

  const serialized = serializeNode(typed);
  assert.equal(serialized.typeRef, "node-type://t180/ReviewDocument");

  const admitted = admitNode(serialized);
  assert.deepEqual(admitted, typed);

  const typedContract = JSON.parse(nodeContractKey(typed));
  assert.equal(typedContract.typeRef, "node-type://t180/ReviewDocument");

  const untyped = reviewNode({ typeRef: null });
  const untypedContract = JSON.parse(nodeContractKey(untyped));
  assert.equal(Object.hasOwn(untypedContract, "typeRef"), false);
  assert.notEqual(nodeContractKey(typed), nodeContractKey(untyped));

  assert.throws(
    () => reviewNode({ typeRef: "" }),
    /Node\.typeRef: expected null or non-empty ref/u
  );
});

test("T-180 node_type entries admit and project but cannot emit graph_function_selected", () => {
  const event = admitEntry(libraryEntry());
  assert.equal(event.kind, "registry_entry_admitted");
  assert.equal(event.entryKind, "node_type");

  const projection = projectRuntimeGraphFunctionRegistry([event]);
  const lookup = lookupRuntimeGraphFunctionRegistry({
    projection,
    request: constructRegistryLookupRequest({
      lookupRef: "registry-lookup://t180/node-type/review-document",
      entryKinds: ["node_type"],
      candidateIdentityRefs: ["registry-entry://t180/node-type/review-document"],
      interfaceRef: "interface://t180/node-type/review-document",
      sourceContractRef: "contract://t180/review-document",
      targetContractRef: "contract://t180/review-document",
      contextRefs: ["context://t180/review"],
      authorityRefs: ["authority://gtl/typecheck"],
      overlayRefs: ["overlay://t180/type-library"],
      namespaceRefs: ["odd_glc"],
      acceptedVersions: ["4.1.0-rc.17"],
      provenanceRefs: ["provenance://t180/node-type"],
      readinessRefs: ["readiness://t180/ready"],
      proofRefs: ["proof://t180/node-type"],
      policyRefs: ["policy://t180/typecheck-only"]
    })
  });
  assert.deepEqual(lookup.eligibleCandidateRefs, [
    "registry-entry://t180/node-type/review-document"
  ]);

  const selection = selectGraphFunctionFromRegistry({
    projection,
    lookupResult: lookup,
    selectionRef: "selection://t180/node-type/review-document",
    runtimeBasisRef: "runtime-basis://t180/node-type/review-document",
    rationaleRef: "rationale://t180/node-types-are-not-callable",
    abgSelectedCandidateRef: "registry-entry://t180/node-type/review-document",
    correlationId: "correlation://t180/node-type-selection"
  });

  assert.equal(selection.kind, "graph_function_selection_rejected");
  assert.equal(selection.rejectionReason, "selected_candidate_not_graph_function");
});

test("T-180 node-type graph functions materialize and satisfy without a separate type carrier", () => {
  const typeNode = reviewNode();
  const nodeType = constructNodeTypeGraphFunction(typeNode);
  assert.equal(nodeType.name, "node-type://t180/ReviewDocument");
  assert.deepEqual(nodeType.inputs, [typeNode]);
  assert.deepEqual(nodeType.outputs, [typeNode]);
  assert.ok(nodeType.tags.includes(GTL_NODE_TYPE_GRAPH_FUNCTION_TAG));

  const materialized = materializeNodeType({
    typeRef: "node-type://t180/ReviewDocument",
    graphFunctions: [nodeType]
  });
  assert.equal(materialized.satisfied, true);
  assert.equal(materialized.typeNode.name, "ReviewDocument");

  const strengthenedNode = reviewNode({
    markov: ["review:ready", "review:approved"],
    assetSurface: assetSurface({
      requiredContexts: ["context://t180/review", "context://t180/project"],
      proofObligationRefs: [
        "proof://t180/review-document",
        "proof://t180/review-approved"
      ]
    })
  });
  assert.deepEqual(
    satisfiesNodeType({
      node: strengthenedNode,
      typeRef: "node-type://t180/ReviewDocument",
      graphFunctions: [nodeType]
    }),
    {
      kind: "node_type_satisfaction",
      nodeRef: "ReviewDocument",
      typeRef: "node-type://t180/ReviewDocument",
      satisfied: true,
      rejectionReason: null,
      typeNode
    }
  );

  const weakenedMarkov = satisfiesNodeType({
    node: reviewNode({ markov: [] }),
    typeRef: "node-type://t180/ReviewDocument",
    graphFunctions: [nodeType]
  });
  assert.equal(weakenedMarkov.satisfied, false);
  assert.equal(weakenedMarkov.rejectionReason, "markov_weakened");

  const mismatchedRef = satisfiesNodeType({
    node: reviewNode({ typeRef: "node-type://t180/OtherDocument" }),
    typeRef: "node-type://t180/ReviewDocument",
    graphFunctions: [nodeType]
  });
  assert.equal(mismatchedRef.satisfied, false);
  assert.equal(mismatchedRef.rejectionReason, "node_type_ref_mismatch");

  const unknownType = materializeNodeType({
    typeRef: "node-type://t180/Missing",
    graphFunctions: [nodeType]
  });
  assert.equal(unknownType.satisfied, false);
  assert.equal(unknownType.rejectionReason, "unknown_type");

  const unmarkedIdentity = identity([typeNode], {
    name: "node-type://t180/Unmarked"
  });
  const notDeclaredType = materializeNodeType({
    typeRef: "node-type://t180/Unmarked",
    graphFunctions: [unmarkedIdentity]
  });
  assert.equal(notDeclaredType.satisfied, false);
  assert.equal(
    notDeclaredType.rejectionReason,
    "node_type_not_identity_graph_function"
  );
});

test("T-180 composed node types preserve constituent obligations", () => {
  const readyType = constructNodeTypeGraphFunction(reviewNode());
  const approvedType = constructNodeTypeGraphFunction(
    reviewNode({
      typeRef: "node-type://t180/ApprovedReviewDocument",
      markov: ["review:approved"],
      assetSurface: assetSurface({
        proofObligationRefs: ["proof://t180/review-approved"]
      })
    })
  );

  const composed = composeNodeTypes({
    typeRef: "node-type://t180/ReadyApprovedReviewDocument",
    constituentTypeRefs: [
      "node-type://t180/ReviewDocument",
      "node-type://t180/ApprovedReviewDocument"
    ],
    graphFunctions: [readyType, approvedType]
  });
  assert.equal(composed.satisfied, true);
  assert.notEqual(composed.graphFunction, null);

  const composedType = materializeNodeType({
    typeRef: "node-type://t180/ReadyApprovedReviewDocument",
    graphFunctions: [composed.graphFunction]
  });
  assert.equal(composedType.satisfied, true);
  assert.deepEqual(composedType.typeNode.markov, [
    "review:ready",
    "review:approved"
  ]);
  assert.deepEqual(composedType.typeNode.assetSurface.proofObligationRefs, [
    "proof://t180/review-document",
    "proof://t180/review-approved"
  ]);

  const satisfyingNode = reviewNode({
    typeRef: "node-type://t180/ReadyApprovedReviewDocument",
    markov: ["review:ready", "review:approved", "review:archived"],
    assetSurface: assetSurface({
      proofObligationRefs: [
        "proof://t180/review-document",
        "proof://t180/review-approved",
        "proof://t180/review-archived"
      ]
    })
  });
  assert.equal(
    satisfiesNodeType({
      node: satisfyingNode,
      typeRef: "node-type://t180/ReadyApprovedReviewDocument",
      graphFunctions: [composed.graphFunction]
    }).satisfied,
    true
  );
  assert.equal(
    satisfiesNodeType({
      node: satisfyingNode,
      typeRef: "node-type://t180/ReviewDocument",
      graphFunctions: [readyType, composed.graphFunction]
    }).satisfied,
    true
  );

  const weakenedNode = reviewNode({
    typeRef: "node-type://t180/ReadyApprovedReviewDocument",
    markov: ["review:ready"],
    assetSurface: assetSurface({
      proofObligationRefs: ["proof://t180/review-document"]
    })
  });
  const weakened = satisfiesNodeType({
    node: weakenedNode,
    typeRef: "node-type://t180/ReadyApprovedReviewDocument",
    graphFunctions: [composed.graphFunction]
  });
  assert.equal(weakened.satisfied, false);
  assert.equal(weakened.rejectionReason, "markov_weakened");

  const conflictingType = constructNodeTypeGraphFunction(
    reviewNode({
      typeRef: "node-type://t180/ConflictingReviewDocument",
      schema: {
        kind: "symbolic",
        ref: "schema://t180/ConflictingReviewDocument"
      }
    })
  );
  const conflict = composeNodeTypes({
    typeRef: "node-type://t180/ImpossibleReviewDocument",
    constituentTypeRefs: [
      "node-type://t180/ReviewDocument",
      "node-type://t180/ConflictingReviewDocument"
    ],
    graphFunctions: [readyType, conflictingType]
  });
  assert.equal(conflict.satisfied, false);
  assert.equal(conflict.rejectionReason, "schema_conflict");
});

test("T-180 explicit type wiring composes differently named ports without weakening exact compose", () => {
  const readyType = constructNodeTypeGraphFunction(reviewNode());
  const source = simpleNode("SourceDocument");
  const provided = reviewNode({ name: "ReviewedArtifact" });
  const required = reviewNode({ name: "IncomingReview" });
  const target = simpleNode("DeploymentPlan");

  const produceReviewedArtifact = graphFunctionFromEdge(
    source,
    provided,
    "produce-reviewed-artifact"
  );
  const deployFromReview = graphFunctionFromEdge(
    required,
    target,
    "deploy-from-review"
  );

  assert.throws(
    () => compose(produceReviewedArtifact, deployFromReview),
    /required environment bindings are missing/u
  );

  const composed = composeWithTypeWiring(
    produceReviewedArtifact,
    deployFromReview,
    {
      nodeTypeGraphFunctions: [readyType],
      wiring: [
        {
          providedNodeName: "ReviewedArtifact",
          requiredNodeName: "IncomingReview",
          typeRef: "node-type://t180/ReviewDocument"
        }
      ]
    }
  );

  assert.equal(composed.inputs[0].name, "SourceDocument");
  assert.equal(composed.outputs[0].name, "DeploymentPlan");
  const materialized = materializeGraphFunction(composed);
  assert.deepEqual(
    materialized.vectors.map((vector) =>
      vector.source.map((node) => node.name).join("+")
    ),
    ["SourceDocument", "ReviewedArtifact"]
  );

  assert.throws(
    () =>
      composeWithTypeWiring(produceReviewedArtifact, deployFromReview, {
        nodeTypeGraphFunctions: [readyType],
        wiring: [
          {
            providedNodeName: "ReviewedArtifact",
            requiredNodeName: "IncomingReview",
            typeRef: "node-type://t180/Missing"
          }
        ]
      }),
    /does not satisfy "node-type:\/\/t180\/Missing"/u
  );
});

test("T-180 conformance rejects node-type graph functions as public callable work", () => {
  const nodeType = constructNodeTypeGraphFunction(reviewNode());
  const report = typecheckGtlProgram({
    subjectRef: "program://t180/node-type-callability-negative",
    abiPackageVersion: "4.1.0-rc.17",
    expectedCoverage: {
      catalogGraphFunctionCount: 1,
      publishedGraphFunctionCount: 1,
      graphVectorCount: 0,
      targetCarrierContractCount: 0,
      edgeClosureContractCount: 0,
      overlayCount: 0,
      publicStartTargetCount: 1,
      promptAssetCount: 0,
      pluginContractCount: 0,
      sourceIdentitySurfaceCount: 0
    },
    featureCoverageManifest: {
      kind: "gtl_program_feature_coverage_manifest",
      manifestRef: "feature-coverage://t180/node-type-callability-negative",
      t153RequirementRef: "REQ-L-GTL3-CONTRACT-LAW-API",
      rows: []
    },
    catalogGraphFunctionRefs: [nodeType.name],
    graphFunctions: [nodeType],
    publicStartTargets: [
      {
        name: "public-start://t180/node-type",
        graphFunctionRef: nodeType.name,
        overlayRefs: [],
        defaultForOverlayRefs: []
      }
    ],
    jobBindings: [
      {
        jobRef: "job://t180/node-type",
        contractTargetRefs: [nodeType.name],
        roleRefs: [],
        policyHookRefs: [],
        publicCallableGraphFunctionRefs: [nodeType.name]
      }
    ]
  });
  const ruleRefs = report.issues.map((issue) => issue.ruleRef);
  assert.ok(
    ruleRefs.includes("abg://gtl-program/public-start/node-type-not-callable")
  );
  assert.ok(
    ruleRefs.includes("abg://gtl-program/job-binding/node-type-not-callable")
  );
});

test("T-180 graph-call opening rejects node-type graph functions", () => {
  const nodeType = constructNodeTypeGraphFunction(reviewNode());
  const basis = basisForGraphFunction(nodeType);
  assert.throws(
    () =>
      runtimeEventsForIterationDecision({
        kind: "advance_vector",
        basis,
        vectorIndex: 0,
        edge: "ReviewDocument→ReviewDocument",
        regime: "F_D",
        effectiveRegime: {
          kind: "effective_vector_regime",
          basisId: basis.id,
          graphFunctionId: nodeType.id,
          vectorIndex: 0,
          edge: "ReviewDocument→ReviewDocument",
          regime: "F_D",
          source: "basis_default_policy",
          sourceRef: "policy-bundle://t180",
          declarationKey: null,
          declaredVectorRegimes: [],
          diagnosticRefs: []
        }
      }),
    /GraphCall\.open rejects non-callable node-type GraphFunction/u
  );
  assert.throws(
    () => constructGraphCallOpenedEvent(basis),
    /GraphCall\.open rejects non-callable node-type GraphFunction/u
  );
});

test("T-180 invocation assertion rejects caller-supplied node_type selection truth", () => {
  assert.throws(
    () =>
      assertGraphFunctionInvocationSelected({
        events: [
          {
            kind: "graph_function_selected",
            selectionRef: "selection://t180/forged-node-type",
            selectedEntryRef: "registry-entry://t180/node-type/review-document",
            selectedEntryKind: "node_type",
            selectedGraphFunctionRef:
              "graph-function://odd_glc/node-type/review-document",
            lookupResultRef: "registry-lookup-result://t180/forged-node-type",
            eligibilityDecisionRefs: ["eligibility://t180/forged-node-type"],
            adviceRefs: [],
            fhResponseRefs: [],
            rationaleRef: "rationale://t180/forged-node-type",
            runtimeBasisRef: "runtime-basis://t180/forged-node-type",
            causationEventRefs: [],
            correlationId: "correlation://t180/forged-node-type"
          }
        ],
        runtimeBasisRef: "runtime-basis://t180/forged-node-type",
        graphFunctionRef: "graph-function://odd_glc/node-type/review-document"
      }),
    /selectedEntryKind/u
  );
});

test("T-180 ABG projects and admits node-type satisfaction for traversal-close validation", () => {
  const readyType = constructNodeTypeGraphFunction(reviewNode());
  const approvedType = constructNodeTypeGraphFunction(
    reviewNode({
      typeRef: "node-type://t180/ApprovedReviewDocument",
      markov: ["review:approved"],
      assetSurface: assetSurface({
        proofObligationRefs: ["proof://t180/review-approved"]
      })
    })
  );
  const composed = composeNodeTypes({
    typeRef: "node-type://t180/ReadyApprovedReviewDocument",
    constituentTypeRefs: [
      "node-type://t180/ReviewDocument",
      "node-type://t180/ApprovedReviewDocument"
    ],
    graphFunctions: [readyType, approvedType]
  });
  assert.equal(composed.satisfied, true);
  assert.notEqual(composed.graphFunction, null);

  const outputNode = reviewNode({
    typeRef: "node-type://t180/ReadyApprovedReviewDocument",
    markov: ["review:ready", "review:approved"],
    assetSurface: assetSurface({
      proofObligationRefs: [
        "proof://t180/review-document",
        "proof://t180/review-approved"
      ]
    })
  });
  const projected = projectNodeTypeSatisfaction({
    node: outputNode,
    targetTypeRef: "node-type://t180/ReviewDocument",
    nodeTypeGraphFunctions: [readyType, composed.graphFunction],
    sourceEventRefs: ["runtime-event://t180/vector-closed"],
    sourceProjectionRefs: ["projection://t180/output-node"],
    causationEventRefs: ["runtime-event://t180/vector-closed"],
    correlationId: "correlation://t180/node-type-satisfaction"
  });
  assert.equal(projected.kind, "node_type_satisfaction_projected");
  assert.equal(projected.satisfied, true);
  assertRuntimeEvent(projected);

  const emitted = [];
  const canonical = emit(projected, (event) => {
    emitted.push(event);
  });
  assert.equal(canonical.length, 1);
  assert.equal(emitted[0].kind, "node_type_satisfaction_projected");

  const closeProjection = assertTraversalCloseNodeTypeSatisfied({
    node: outputNode,
    targetTypeRef: "node-type://t180/ReviewDocument",
    nodeTypeGraphFunctions: [readyType, composed.graphFunction]
  });
  assert.equal(closeProjection.satisfied, true);

  const weakOutput = reviewNode({
    markov: [],
    assetSurface: assetSurface({
      proofObligationRefs: []
    })
  });
  assert.throws(
    () =>
      assertTraversalCloseNodeTypeSatisfied({
        node: weakOutput,
        targetTypeRef: "node-type://t180/ReviewDocument",
        nodeTypeGraphFunctions: [readyType]
      }),
    /does not satisfy/u
  );
});
