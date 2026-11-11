import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

import * as abg from "../../build/code/src/abg/index.js";
import * as hog from "../../build/code/src/hog/index.js";
import * as product from "../../build/code/src/product/index.js";
import {
  admitRuntimeEvent,
  createNewEmptyAppendSink,
} from "../../build/code/src/abg/event_store.js";
import {
  installOncePerFile,
  installTenantOnce,
  setupInstalledRootExecutionBasis,
} from "../support/root-installed-environment.mjs";
import {
  acquireNewEmptyAppendSinkFixture,
} from "../support/new-empty-append-sink.mjs";

const DIGEST = `sha256:${"1".repeat(64)}`;
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
// The installed cases share one packed, verified and installed Product for this
// file; each opens its own store, workspace and scratch root on it.
const sharedInstall = installOncePerFile(() => installTenantOnce(packageRoot));

// The operation basis is an exact operation invocation coordinate
// (shared/operation_definition_coordinate.ts) plus its authority scope.
function operationBasis(operationId, memberKey, workspace, invocationRef) {
  const invocationPayloadDigest = product.sha256Canonical({});
  const definitionDigest = product.sha256Canonical({
    operationId,
    memberKey,
    schemaVersion: "5.0.0",
  });
  return {
    operationId,
    memberKey,
    definitionDigest,
    authorityScopeRef: workspace.bindingId,
    authorityScopeDigest: workspace.bindingDigest,
    invocationRef,
    invocationPayloadDigest,
    invocationDigest: product.sha256Canonical({
      operationId,
      memberKey,
      definitionDigest,
      invocationRef,
      invocationPayloadDigest,
    }),
    correlationId: "correlation://developer.example/s03-unit",
    eventTime: "2026-07-25T00:00:00.000Z",
    causationEventRefs: [],
  };
}

// A capability grant is bound to an installed Product's capability definition
// graph row and a fixed definition packet (product/invocation.ts), and root
// invocation carries exactly the one direct-invoke grant
// (abg/invocation_admission.ts). Retired: the developer capability
// (capability://developer.example/review@5) granted over a synthetic workspace
// and Program, and three interaction grants at invocation; no installed graph
// projects a developer capability. Both cases are restated over the installed
// root environment.
test("S03 invocation capability basis is exact over the admitted Program, actor and direct grant", async (context) => {
  const environment = await setupInstalledRootExecutionBasis(context, packageRoot, { install: await sharedInstall() });
  const { abg: installedAbg, product: installedProduct, policy, actorRef, capabilityGrant, program,
    programValidation, workspaceBinding, admittedInstalls } = environment;
  const memberKey = program.policies["abg.root_mode"] === "supervised" ? "start" : "invoke";
  const exact = { actorRef, capabilityGrants: [capabilityGrant], memberKey, policy,
    productInstalls: admittedInstalls, program, programValidation, workspaceBinding };
  assert.equal(installedAbg.validateInvocationCapabilityBasis(exact), null);
  assert.throws(
    () => installedProduct.constructCapabilityGrant(policy, "actor://developer.example/substituted",
      "abg.operation.run.invoke", installedProduct.DIRECT_INVOKE_CAPABILITY,
      { admittedInstalls, workspaceBinding, fixedPacket: installedProduct.RUN_OPERATION_CONTRACTS.invoke[memberKey] }),
    /exact workspace, policy, actor, and definition authority/u,
    "the trusted-developer workspace basis selects one actor",
  );
  for (const [label, changed] of [
    ["absent grant", { capabilityGrants: [] }],
    ["surplus grant", { capabilityGrants: [capabilityGrant, capabilityGrant] }],
    ["substituted actor", { actorRef: "actor://developer.example/substituted" }],
  ]) {
    assert.equal(installedAbg.validateInvocationCapabilityBasis({ ...exact, ...changed })?.code,
      "capability_mismatch", label);
  }
  const surplusRegime = ["F_D", "F_P", "F_H"].find((regime) => !policy.allowedComputeRegimes.includes(regime));
  const surplus = installedProduct.constructRootInvocationPolicy(workspaceBinding, program,
    policy.interactionCapabilities, [...policy.allowedComputeRegimes, surplusRegime]);
  assert.equal(installedAbg.validateInvocationCapabilityBasis({ ...exact, policy: surplus })?.code,
    "capability_mismatch", "a Program must reject surplus compute-fibre authority");
});

test("S03 continuation operation authority requires the exact admitted grant and lifecycle state", async (context) => {
  const environment = await setupInstalledRootExecutionBasis(context, packageRoot, { install: await sharedInstall() });
  const { abg: installedAbg, product: installedProduct, policy, actorRef, workspaceBinding, admittedInstalls } = environment;
  const { INTERACTION_OPERATION_CONTRACTS } = await import(pathToFileURL(join(environment.installedRoot,
    "build/code/src/product/interaction_operation_contracts.js")).href);
  const fixedPacket = INTERACTION_OPERATION_CONTRACTS.respond.approve;
  const [capabilityRef] = fixedPacket.metadata.capabilityRefs;
  const responseGrant = installedProduct.constructCapabilityGrant(policy, actorRef,
    "abg.operation.interaction.respond", capabilityRef, { admittedInstalls, workspaceBinding, fixedPacket });
  const rootInvocation = {
    actorRef,
    workspaceBindingId: workspaceBinding.bindingId,
    workspaceBindingDigest: workspaceBinding.bindingDigest,
    capabilityGrants: [responseGrant],
    capabilityGrantRefs: [responseGrant.grantRef],
  };
  const basis = operationBasis(
    "abg.operation.interaction.respond",
    "approve",
    workspaceBinding,
    "invocation://developer.example/s03-unit/respond",
  );
  const exact = {
    rootInvocation,
    continuation: {
      continuationRef: "continuation://developer.example/s03-unit",
      status: "open",
    },
    operation: "abg.operation.interaction.respond",
    variant: "approve",
    actorRef,
    capabilityRef,
    basis,
  };
  assert.equal(
    installedAbg.resolveContinuationPublicOperationGrant(exact)?.grantRef,
    responseGrant.grantRef,
  );
  assert.equal(
    installedAbg.resolveContinuationPublicOperationGrant({
      ...exact,
      actorRef: "actor://developer.example/substituted",
    }),
    null,
  );
  assert.equal(
    installedAbg.resolveContinuationPublicOperationGrant({
      ...exact,
      continuation: {
        ...exact.continuation,
        status: "responded",
      },
    }),
    null,
  );
});

test("S03 HoG accepts one Product-sealed projection and rejects its forged twin", async (context) => {
  const environment = await setupInstalledRootExecutionBasis(
    context,
    packageRoot,
    { install: await sharedInstall() },
  );
  const {
    artifactTruth,
    abg,
    gtl,
    implementationLeafPort,
    implementationSet,
    leafPort,
    semanticsProjection,
    store,
  } = environment;
  assert.equal(leafPort.kind, "admitted_leaf_invocation_port");
  assert.equal(
    leafPort.validateContractValue(
      gtl.LANGUAGE_TEST_IDS.outputContractRef,
      "output",
      {
        kind: "forged_output",
        schemaVersion: "5.0.0",
      },
    ),
    false,
    "the Product-sealed positive control retains exact contract meaning",
  );

  const forgedProjection = {
    ...semanticsProjection,
    validateContractValue: () => true,
    resolveJudgmentRelation: () => ({
      predicateRef: gtl.LANGUAGE_TEST_IDS.judgmentPredicateRef,
      advanceReasonRef: "reason://review/forged-advance",
      rejectionReasonRef: "reason://review/forged-reject",
      evaluate: () => true,
    }),
  };
  assert.equal(
    forgedProjection.validateContractValue(
      "developer_invalid_output",
      {},
    ),
    true,
    "the forged callback is deliberately permissive",
  );
  const eventCount = store.readAll().length;
  await assert.rejects(
    () =>
      implementationLeafPort.constructAdmittedLeafInvocationPort({
        prefix: abg.selectValidatedRuntimeEventPrefix(store.readAll()),
        artifactTruth,
        implementationSet,
        executionResolution: environment.executionResolution,
        semanticsProjection: forgedProjection,
      }),
    /exact owner-selected admitted execution closure/u,
  );
  assert.equal(store.readAll().length, eventCount);
  await assert.rejects(
    () =>
      access(
        join(
          environment.installedRoot,
          "build/code/src/shared/leaf_semantics_projection.js",
        ),
      ),
    /ENOENT/u,
    "the installed package contains no shared semantic-authority mint",
  );
  const installedProductSemantics = await import(
    `${pathToFileURL(
      join(
        environment.installedRoot,
        "build/code/src/product/semantics.js",
      ),
    ).href}?s03-authority-proof`
  );
  assert.equal(
    "mintInstalledLeafSemanticsProjection" in installedProductSemantics,
    false,
    "the Product-owned mint is not exported even from its implementation module",
  );
});

test("S03 Product semantics requires a loaded provider and is absent from HoG's public port", () => {
  assert.equal(typeof product.evaluateInstalledInteractionResponse, "function");
  assert.equal("evaluateInstalledInteractionResponse" in hog, false);
  assert.equal("admitInstalledProductInput" in hog, false);
  assert.equal("bindInstalledLeafInvocationPort" in hog, false);

  const provider = {
    kind: "product_semantics_provider",
    schemaVersion: "5.0.0",
    bindingRef: "product-semantics://developer.example/forged@5",
    packageName: "@developer-example/forged",
    packageVersion: "5.0.0",
    admitInput: (_contractRef, value) => value,
    evaluateInteractionResponse(_basis, response) {
      return response;
    },
    validateContractValue: () => true,
    resolveJudgmentRelation: () => null,
  };
  const response = { kind: "unit_response", schemaVersion: "5.0.0" };
  assert.throws(
    () =>
      product.evaluateInstalledInteractionResponse(
        provider,
        {
          requestContractRef: "contract://unit/request",
          responseContractRef: "contract://unit/response",
          requestValue: {},
          constructionIntent: null,
          nextActionBasis: null,
        },
        response,
      ),
    /exact loaded Product semantics provider/u,
  );
  assert.throws(
    () => product.projectInstalledLeafSemantics(provider),
    /exact loaded Product semantics provider/u,
  );
});

test("S03 Run semantic projection maps only typed R references and preserves opaque event-shaped domain strings", async (context) => {
  const { store } = await acquireNewEmptyAppendSinkFixture(
    context,
    createNewEmptyAppendSink,
    "abi5-semantic-event-atoms-",
  );
  const runR = "run://developer.example/semantic-r";
  const runS = "run://developer.example/semantic-s";
  const runEvent = (runId, label) => ({
    kind: "run_segment_opened",
    eventTime: `2026-08-07T00:00:0${label}.000Z`,
    aggregateType: "run",
    aggregateId: runId,
    parentAggregateId: null,
    causationEventRefs: [],
    correlationId: `correlation://developer.example/${label}`,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: `basis://developer.example/${label}`,
    runId,
    graphFunctionRef: `graph-function://developer.example/${label}`,
    materializationRef: `graph://developer.example/${label}`,
    payload: {
      executionBasisDigest: DIGEST,
      executionBasisRef: `basis://developer.example/${label}`,
      graphDigest: DIGEST,
      graphFunctionRef: `graph-function://developer.example/${label}`,
      graphRef: `graph://developer.example/${label}`,
      invocationAdmissionRef: `invocation-admission://developer.example/${label}`,
      invocationRef: `invocation://developer.example/${label}`,
      programRef: `program://developer.example/${label}`,
      runDigest: DIGEST,
      runId,
      workspaceBindingId: "workspace-binding://developer.example/semantic",
    },
  });
  const rOpened = admitRuntimeEvent(store, runEvent(runR, "1"));
  const sOpened = admitRuntimeEvent(store, runEvent(runS, "2"));
  const cCallRef = "c-call://developer.example/semantic-r";
  const cCallOpened = admitRuntimeEvent(store, {
    kind: "c_call_opened",
    eventTime: "2026-08-07T00:00:03.000Z",
    aggregateType: "c_call",
    aggregateId: cCallRef,
    parentAggregateId: "frame://developer.example/semantic-r",
    causationEventRefs: [rOpened.eventId],
    correlationId: "correlation://developer.example/semantic-r",
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: "basis://developer.example/semantic-r",
    runId: runR,
    graphFunctionRef: "graph-function://developer.example/semantic-r",
    materializationRef: "graph://developer.example/semantic-r",
    graphCallId: "graph-call://developer.example/semantic-r",
    frameId: "frame://developer.example/semantic-r",
    payload: {
      attempt: 1,
      batchRef: null,
      cCallDigest: DIGEST,
      cCallRef,
      callClass: "leaf",
      cursorDigest: DIGEST,
      cursorRef: "cursor://developer.example/semantic-r",
      edgeRef: "edge://developer.example/semantic-r",
      frameId: "frame://developer.example/semantic-r",
      graphCallId: "graph-call://developer.example/semantic-r",
      graphFunctionRef: "graph-function://developer.example/semantic-r",
      programLocusRef: "program-locus://developer.example/semantic-r",
      retryPath: [],
      stageRole: "semantic-control",
      taskOrdinal: null,
      vectorIndex: 0,
    },
  });
  const opaqueValue = {
    kind: "action_evaluation_basis",
    schemaVersion: "5.0.0",
    admissionEventRef: "ordinary-domain-value",
    eventLooking: "event://developer.example/not-admitted",
    exactR: rOpened.eventId,
    exactS: sOpened.eventId,
    literalEventLabel: "r1",
    nested: { payloadDigest: "ordinary-domain-payload-digest" },
  };
  const cCallFibre = admitRuntimeEvent(store, {
    kind: "c_call_fibre_selected",
    eventTime: "2026-08-07T00:00:03.100Z",
    aggregateType: "c_call",
    aggregateId: cCallRef,
    parentAggregateId: "frame://developer.example/semantic-r",
    causationEventRefs: [cCallOpened.eventId],
    correlationId: "correlation://developer.example/semantic-r",
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: "basis://developer.example/semantic-r",
    runId: runR,
    graphFunctionRef: "graph-function://developer.example/semantic-r",
    materializationRef: "graph://developer.example/semantic-r",
    graphCallId: "graph-call://developer.example/semantic-r",
    frameId: "frame://developer.example/semantic-r",
    payload: {
      armId: "arm://developer.example/semantic-r/opaque",
      cCallRef,
      callClass: "leaf",
      regime: "F_D",
    },
  });
  const valueDigest = product.sha256Canonical(opaqueValue);
  const resultBody = {
    cCallRef,
    contractRef: "contract://developer.example/semantic-output",
    evidenceRefs: [],
    resultClass: "success",
    value: opaqueValue,
    valueDigest,
    valueKind: "semantic_control",
  };
  const resultDigest = product.sha256Canonical(resultBody);
  admitRuntimeEvent(store, {
    kind: "c_call_result_admitted",
    eventTime: "2026-08-07T00:00:04.000Z",
    aggregateType: "c_call",
    aggregateId: cCallRef,
    parentAggregateId: "frame://developer.example/semantic-r",
    causationEventRefs: [cCallFibre.eventId],
    correlationId: "correlation://developer.example/semantic-r",
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: "basis://developer.example/semantic-r",
    runId: runR,
    graphFunctionRef: "graph-function://developer.example/semantic-r",
    materializationRef: "graph://developer.example/semantic-r",
    graphCallId: "graph-call://developer.example/semantic-r",
    frameId: "frame://developer.example/semantic-r",
    payload: {
      ...resultBody,
      resultDigest,
      resultRef:
        `result://abiogenesis/${resultDigest.slice("sha256:".length)}`,
    },
  });

  const projection = abg.projectRunSemanticReplayProjection(
    abg.selectValidatedRuntimeEventPrefix(store.readAll()),
    runR,
  );
  const {
    kind: projectionKind,
    schemaVersion: projectionSchemaVersion,
    viewRef,
    viewDigest,
    physicalCoordinates,
    ...semanticBody
  } = projection;
  assert.equal(projectionKind, "run_semantic_relation_view");
  assert.equal(projectionSchemaVersion, "5.0.0");
  assert.equal(
    viewRef,
    `run-semantic-relation://abiogenesis/${viewDigest.slice("sha256:".length)}`,
  );
  assert.equal(product.sha256Canonical(semanticBody), viewDigest);
  assert.equal(physicalCoordinates.events[0].eventRef, "r1");
  assert.deepEqual(projection.eventAtoms.map((atom) => atom.atomRef), [
    "r1",
    "r2",
    "r3",
    "r4",
  ]);
  assert.deepEqual(
    {
      eventTime: projection.eventAtoms[0].eventTime,
      correlationId: projection.eventAtoms[0].correlationId,
      workflowVersion: projection.eventAtoms[0].workflowVersion,
    },
    {
      eventTime: rOpened.eventTime,
      correlationId: rOpened.correlationId,
      workflowVersion: rOpened.workflowVersion,
    },
  );
  assert.deepEqual(projection.relations, [
    {
      sourceAtom: "r2",
      relation: "causationEventRefs[0]",
      targetAtom: "r1",
    },
    {
      sourceAtom: "r3",
      relation: "causationEventRefs[0]",
      targetAtom: "r2",
    },
    {
      sourceAtom: "r4",
      relation: "causationEventRefs[0]",
      targetAtom: "r3",
    },
  ]);
  assert.equal(
    projection.relations.some((edge) => edge.relation.includes("payload.value")),
    false,
    "opaque product JSON cannot become a semantic event-reference relation",
  );
  assert.equal(
    JSON.stringify(projection).match(/"kind":"run_semantic_/gu)?.length,
    2,
    "only the relation view and its non-authoritative physical coordinate bag carry semantic kinds",
  );

  const { store: mutatedStore } = await acquireNewEmptyAppendSinkFixture(
    context,
    createNewEmptyAppendSink,
    "abi5-semantic-payload-mutation-",
  );
  for (const admitted of store.readAll()) {
    // An admitted event's stamped fields include its profile digest.
    const {
      admissionOrdinal,
      eventId,
      payloadDigest,
      eventContractDigest,
      ...candidate
    } = structuredClone(admitted);
    void admissionOrdinal;
    void eventId;
    void payloadDigest;
    void eventContractDigest;
    if (candidate.kind === "c_call_result_admitted") {
      const {
        resultDigest: priorResultDigest,
        resultRef: priorResultRef,
        ...priorResultBody
      } = candidate.payload;
      void priorResultDigest;
      void priorResultRef;
      const value = {
        ...priorResultBody.value,
        literalEventLabel: "q1",
      };
      const valueDigest = product.sha256Canonical(value);
      const resultBody = { ...priorResultBody, value, valueDigest };
      const resultDigest = product.sha256Canonical(resultBody);
      candidate.payload = {
        ...resultBody,
        resultDigest,
        resultRef:
          `result://abiogenesis/${resultDigest.slice("sha256:".length)}`,
      };
    }
    admitRuntimeEvent(mutatedStore, candidate);
  }
  const mutatedProjection = abg.projectRunSemanticReplayProjection(
    abg.selectValidatedRuntimeEventPrefix(mutatedStore.readAll()),
    runR,
  );
  assert.notEqual(
    mutatedProjection.viewDigest,
    projection.viewDigest,
    "one opaque payload byte must change the semantic relation view identity",
  );
  assert.deepEqual(mutatedProjection.relations, projection.relations);
  assert.deepEqual(
    mutatedProjection.eventAtoms.map(({ semanticPayloadDigest, ...atom }) => atom),
    projection.eventAtoms.map(({ semanticPayloadDigest, ...atom }) => atom),
    "opaque payload mutation cannot alter event correspondence or topology",
  );
  assert.notEqual(
    mutatedProjection.eventAtoms.at(-1).semanticPayloadDigest,
    projection.eventAtoms.at(-1).semanticPayloadDigest,
  );

  admitRuntimeEvent(store, {
    kind: "frame_closed",
    eventTime: "2026-08-07T00:00:05.000Z",
    aggregateType: "frame",
    aggregateId: "frame://developer.example/semantic-r",
    parentAggregateId: "graph-call://developer.example/semantic-r",
    causationEventRefs: [],
    correlationId: "correlation://developer.example/semantic-r",
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: "basis://developer.example/semantic-r",
    runId: runR,
    graphFunctionRef: "graph-function://developer.example/semantic-r",
    materializationRef: "graph://developer.example/semantic-r",
    graphCallId: "graph-call://developer.example/semantic-r",
    frameId: "frame://developer.example/semantic-r",
    payload: {
      closureContractRef: "closure-contract://developer.example/semantic-r",
      frameId: "frame://developer.example/semantic-r",
      terminalReachedEventRef: sOpened.eventId,
    },
  });
  assert.throws(
    () =>
      abg.projectRunSemanticReplayProjection(
        abg.selectValidatedRuntimeEventPrefix(store.readAll()),
        runR,
      ),
    /out-of-scope event reference.*terminalReachedEventRef/u,
    "a declared typed reference to S must fail closed",
  );
});
