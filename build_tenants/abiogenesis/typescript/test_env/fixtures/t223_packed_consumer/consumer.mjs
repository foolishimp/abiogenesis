import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  abiogenesisPublicSdk,
  canonicalizeIJson,
  constructPublicOperationInvocation,
  createNodeBoundWorkspaceContext,
  createNodeProductIntakeContext,
  createNodeWorkspaceBindingContext,
  createNodeWorkspacePathContext,
  digestCanonicalIJson,
  loadNodePublicContractCatalog
} from "@abiogenesis/typescript-tenant/app/m04";

const INVOKE_CAPABILITY =
  "abg.capability.catalog.invoke-graph-function@5";
const GRAPH_HANDLE = "graph-function://fixture/hello-world";
const INTERFACE_REF = "interface://fixture/hello-world/v1";
const DEFAULT_TRANSPORT_STEERING = Object.freeze({
  agent: "generic",
  model: null,
  profile: "local-spawn",
  timeoutMs: 30000
});
const REQUIRED_ACTOR_OPERATIONS = new Set([
  "abg.operation.workspace.create",
  "abg.operation.install.install",
  "abg.operation.catalog.bind",
  "abg.operation.catalog.admit",
  "abg.operation.catalog.invoke"
]);

function assertAccepted(outcome, label) {
  if (outcome?.kind !== "accepted") {
    throw new TypeError(`${label} failed: ${JSON.stringify(outcome)}`);
  }
  return outcome;
}

function artifactFor(product) {
  return {
    format: "npm_package_tgz",
    artifactPath: product.artifactPath,
    expectedArtifactDigest: product.descriptor.distributionArtifactDigest,
    expectedProductContentDigest: product.descriptor.productContentDigest
  };
}

function resolutionRequest(config) {
  return {
    requirements: [
      {
        productId: config.abg.descriptor.productId,
        versionConstraint: config.abg.descriptor.version,
        requiredContractRefs: config.abg.descriptor.contractRefs,
        requiredCapabilityRefs: config.abg.descriptor.capabilityRefs
      },
      {
        productId: config.fixture.descriptor.productId,
        versionConstraint: config.fixture.descriptor.version,
        requiredContractRefs: config.fixture.descriptor.contractRefs,
        requiredCapabilityRefs: config.fixture.descriptor.capabilityRefs
      }
    ],
    candidateDescriptors: [config.abg.descriptor, config.fixture.descriptor]
  };
}

function inputContract(config) {
  const row = config.fixture.publicContractCatalog.rows.find(
    (candidate) => candidate.contractId === "fixture.contract.hello-input"
  );
  if (row?.assetLocator === null || row?.assetLocator === undefined) {
    throw new TypeError("Hello World input contract has no asset locator");
  }
  return row.assetLocator;
}

function invokeRequest(input) {
  const contract = inputContract(input.config);
  return {
    workspaceId: input.workspace.workspaceId,
    bindingId: input.binding.bindingId,
    resolvedLockId: input.lock.lockId,
    catalogId: input.admission.catalogId,
    catalogVersion: input.admission.catalogVersion,
    catalogDigest: input.admission.catalogDigest,
    allowedHandles: null,
    sessionView: input.view,
    graphFunctionHandle: GRAPH_HANDLE,
    interfaceRef: INTERFACE_REF,
    inputId: `input://t223/${input.lane}`,
    inputSchemaId: contract.schemaId,
    inputSchemaVersion: contract.schemaVersion,
    inputSchemaDigest: contract.digest,
    input: { greeting: "world" },
    requiredCapabilityRefs: [INVOKE_CAPABILITY],
    actorRef: `actor://t223/${input.lane}`,
    transportSteering:
      input.config.transportSteering ?? DEFAULT_TRANSPORT_STEERING
  };
}

function eventKindCounts(events) {
  const counts = {};
  for (const event of events) {
    const kind = event?.kind;
    if (typeof kind !== "string") {
      throw new TypeError("public replay contains an event without kind");
    }
    counts[kind] = (counts[kind] ?? 0) + 1;
  }
  return Object.fromEntries(
    Object.entries(counts).sort(([left], [right]) =>
      left < right ? -1 : left > right ? 1 : 0
    )
  );
}

async function callCount(callLogPath) {
  if (typeof callLogPath !== "string" || callLogPath.length === 0) {
    return null;
  }
  try {
    return (await readFile(callLogPath, "utf8"))
      .split("\n")
      .filter((line) => line.length > 0).length;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return 0;
    }
    throw error;
  }
}

function assertCanonicalEqual(actual, expected, label) {
  if (canonicalizeIJson(actual) !== canonicalizeIJson(expected)) {
    throw new TypeError(
      `${label} do not match: actual=${canonicalizeIJson(actual)} expected=${canonicalizeIJson(expected)}`
    );
  }
}

function singleEvent(events, kind) {
  const matches = events.filter((event) => event.kind === kind);
  if (matches.length !== 1) {
    throw new TypeError(
      `expected one ${kind} event, received ${String(matches.length)}`
    );
  }
  return matches[0];
}

function singlePayload(events, payloadClass) {
  const matches = events.filter(
    (event) =>
      event.kind === "payload_observed" &&
      event.payloadClass === payloadClass
  );
  if (matches.length !== 1) {
    throw new TypeError(
      `expected one ${payloadClass} payload, received ${String(matches.length)}`
    );
  }
  return matches[0];
}

function validatedPayload(events, observed) {
  const matches = events.filter(
    (event) =>
      event.kind === "payload_validated" &&
      event.payloadRef === observed.payloadRef &&
      event.contractRef === observed.contractRef
  );
  if (matches.length !== 1) {
    throw new TypeError(
      `payload ${observed.payloadClass} lacks one matching validation`
    );
  }
  return matches[0];
}

function projectionCoherence(invoke, result, replay) {
  assertCanonicalEqual(
    invoke.value,
    result.value,
    "invoke and read-result projections"
  );
  const projection = invoke.value;
  if (
    replay.value.subject.kind !== "graph_call" ||
    replay.value.subject.graphCallId !== projection.graphCallId ||
    projection.result.graphCallId !== projection.graphCallId
  ) {
    throw new TypeError("result and replay GraphCall identities disagree");
  }
  const events = replay.value.events;
  const eventIds = events.map((event) => event.eventId);
  if (
    new Set(eventIds).size !== eventIds.length ||
    canonicalizeIJson(projection.replayRefs) !== canonicalizeIJson(eventIds)
  ) {
    throw new TypeError("result replay refs do not resolve exactly to replay events");
  }
  const eventsById = new Map(events.map((event) => [event.eventId, event]));
  const evidenceEvents = projection.evidenceRefs.map((ref) => {
    const event = eventsById.get(ref);
    if (event === undefined) {
      throw new TypeError(`result evidence ref is absent from replay: ${ref}`);
    }
    return event;
  });
  const evidenceEventKinds = evidenceEvents
    .map((event) => event.kind)
    .sort();
  assertCanonicalEqual(
    evidenceEventKinds,
    [
      "actor_invocation_closed",
      "actor_result_artifact_observed",
      "terminal_reached"
    ],
    "result evidence event kinds"
  );
  const carrierRefs = new Set();
  for (const event of events) {
    for (const key of ["resultRef", "payloadRef", "outputPayloadRef"]) {
      const value = event[key];
      if (typeof value === "string" && value.length > 0) {
        carrierRefs.add(value);
      }
    }
  }
  for (const ref of [projection.resultId, ...projection.result.resultRefs]) {
    if (!carrierRefs.has(ref)) {
      throw new TypeError(`result ref has no returned replay carrier: ${ref}`);
    }
  }
  return {
    invokeEqualsReadResult: true,
    replaySubjectMatchesResult: true,
    replayRefsResolveExactly: true,
    evidenceRefsResolve: true,
    evidenceEventKinds,
    resultRefsResolve: true
  };
}

function workerAndAssuranceSemantics(events, expectPackedFake) {
  const artifact = singleEvent(events, "actor_result_artifact_observed");
  if (
    typeof artifact.artifactContentExcerpt !== "string" ||
    artifact.artifactContentExcerpt.length === 0 ||
    typeof artifact.artifactContentDigest !== "string"
  ) {
    throw new TypeError("worker result artifact has no admitted content");
  }
  const workerResponse = JSON.parse(artifact.artifactContentExcerpt);
  const selectedResultContractRef = workerResponse.result_contract_ref;
  if (
    typeof selectedResultContractRef !== "string" ||
    !/^contract:\/\/catalog-[0-9a-f]{16}\/vector-0\/transform$/u.test(
      selectedResultContractRef
    )
  ) {
    throw new TypeError("worker response lost the compiler-selected result contract");
  }
  const expectedWorkerResponse = {
    result_contract_ref: selectedResultContractRef,
    edge: "hello-input-to-output",
    actor: "t223-packed-fake-agent",
    fulfillment_assessments: [
      {
        id: "instruction_response_admitted",
        evaluator: "instruction_response_admitted",
        fulfillment_status: "fulfilled",
        fulfillment_detail: "packed fake transport admitted",
        blocking_reasons: [],
        evidence_refs: ["evidence://t223/packed-fake-transport"]
      }
    ]
  };
  if (expectPackedFake) {
    assertCanonicalEqual(
      workerResponse,
      expectedWorkerResponse,
      "admitted fake worker response"
    );
  }
  const assessments = Array.isArray(workerResponse.fulfillment_assessments)
    ? workerResponse.fulfillment_assessments
    : [];
  const assessment = expectPackedFake
    ? assessments.find((row) => row?.id === "instruction_response_admitted")
    : assessments.length === 1
      ? assessments[0]
      : undefined;
  if (
    workerResponse.edge !== "hello-input-to-output" ||
    typeof workerResponse.actor !== "string" ||
    workerResponse.actor.length === 0 ||
    typeof assessment?.id !== "string" ||
    assessment.id.length === 0 ||
    typeof assessment.evaluator !== "string" ||
    assessment.evaluator.length === 0 ||
    assessment?.fulfillment_status !== "fulfilled" ||
    !Array.isArray(assessment.blocking_reasons) ||
    assessment.blocking_reasons.length !== 0 ||
    !Array.isArray(assessment.evidence_refs) ||
    assessment.evidence_refs.length === 0 ||
    !assessment.evidence_refs.every(
      (ref) => typeof ref === "string" && ref.length > 0
    )
  ) {
    throw new TypeError("admitted worker response violates the Hello World contract");
  }
  const responseAdmission = singleEvent(
    events,
    "instruction_response_contract_admitted"
  );
  if (
    responseAdmission.resultRef !== artifact.resultRef ||
    responseAdmission.artifactRef !== artifact.artifactRef ||
    responseAdmission.artifactContentDigest !== artifact.artifactContentDigest ||
    !responseAdmission.outputContractRefs.includes(
      workerResponse.result_contract_ref
    )
  ) {
    throw new TypeError("instruction response admission lost worker artifact truth");
  }
  const actorClosed = singleEvent(events, "actor_invocation_closed");
  if (
    actorClosed.closureStatus !== "completed" ||
    actorClosed.closureFailureClass !== null ||
    actorClosed.resultRef !== artifact.artifactRef
  ) {
    throw new TypeError("worker invocation did not close over its admitted artifact");
  }
  const expectedEvidenceRefs = assessment.evidence_refs;
  if (new Set(expectedEvidenceRefs).size !== expectedEvidenceRefs.length) {
    throw new TypeError("worker assessment contains duplicate evidence refs");
  }
  const transformPayloads = events.filter(
    (event) =>
      event.kind === "payload_observed" &&
      event.payloadClass === "evidence" &&
      event.contractRef === "contract://abg/fp-transform-evidence"
  );
  if (transformPayloads.length !== expectedEvidenceRefs.length) {
    throw new TypeError("worker evidence payload count does not match its refs");
  }
  const validatedByEvidenceRef = new Map();
  for (const payload of transformPayloads) {
    const validation = validatedPayload(events, payload);
    if (
      typeof validation.evidenceRef !== "string" ||
      !expectedEvidenceRefs.includes(validation.evidenceRef) ||
      validatedByEvidenceRef.has(validation.evidenceRef)
    ) {
      throw new TypeError("worker evidence validation is not one-to-one");
    }
    validatedByEvidenceRef.set(validation.evidenceRef, payload.payloadRef);
  }
  for (const evidenceRef of expectedEvidenceRefs) {
    const payloadRef = validatedByEvidenceRef.get(evidenceRef);
    const admitted = events.filter(
      (event) =>
        event.kind === "evidence_admitted" &&
        event.evidenceRef === evidenceRef &&
        event.payloadRef === payloadRef
    );
    if (
      typeof payloadRef !== "string" ||
      admitted.length !== 1 ||
      !admitted[0].complete ||
      admitted[0].shallow ||
      admitted[0].contradictsAuthority ||
      admitted[0].deferred
    ) {
      throw new TypeError("worker evidence was not fully admitted one-to-one");
    }
  }
  const target = singlePayload(events, "hellooutput");
  validatedPayload(events, target);
  const actorStarted = singleEvent(events, "actor_invocation_started");
  if (target.producerRef !== actorStarted.workerId) {
    throw new TypeError("target carrier lost M03-bound worker identity");
  }
  const evaluatorPayloads = [
    singlePayload(events, "evaluation_rule_outcome"),
    singlePayload(events, "fp_evaluation_finding")
  ];
  for (const payload of evaluatorPayloads) {
    validatedPayload(events, payload);
    if (payload.producerRef !== "plugin://abg/fp-evaluator-live") {
      throw new TypeError("evaluator payload lost standard plugin identity");
    }
  }
  const closure = singleEvent(events, "closure_input_published");
  const terminal = singleEvent(events, "terminal_reached");
  if (
    closure.closureDecision !== "block" ||
    terminal.terminalKind !== "gap_stop" ||
    terminal.reason !== "runtime_continuation_transition:block:assurance_block"
  ) {
    throw new TypeError("assurance block transition is incomplete");
  }
  return {
    workerResponse: {
      edge: workerResponse.edge,
      actor: workerResponse.actor,
      fulfillment_assessments: workerResponse.fulfillment_assessments
    },
    selectedResultContractPreserved: true,
    responseContractAdmitted: true,
    actorClosedWithArtifact: true,
    transformEvidenceAdmitted: true,
    targetCarrierClass: target.payloadClass,
    targetCarrierProducer: target.producerRef,
    boundWorkerId: actorStarted.workerId,
    evaluatorPayloadClasses: evaluatorPayloads
      .map((payload) => payload.payloadClass)
      .sort(),
    evaluatorPayloadsValidated: true,
    assuranceTransition: {
      closureDecision: closure.closureDecision,
      terminalKind: terminal.terminalKind,
      reason: terminal.reason
    }
  };
}

async function summarize(input) {
  const invoke = assertAccepted(input.invoke, "catalog.invoke");
  const result = assertAccepted(input.result, "result");
  const replay = assertAccepted(input.replay, "replay");
  const events = replay.value.events;
  const kinds = eventKindCounts(events);
  return {
    projectionCoherence: projectionCoherence(invoke, result, replay),
    workerAndAssurance: workerAndAssuranceSemantics(
      events,
      input.transportSteering === undefined ||
        input.transportSteering.agent === "generic"
    ),
    catalogRows: normalizedCatalogRows(input.catalogList),
    helloDescription: normalizedCatalogDescription(input.helloDescription),
    invokeDisposition: invoke.disposition,
    invokeExitClassification: invoke.exitClassification,
    resultDisposition: result.value.disposition,
    resultTerminalReason: result.value.result.terminalReason,
    replaySubjectKind: replay.value.subject.kind,
    replayEventKindCounts: kinds,
    promptManifestCount:
      kinds.instruction_prompt_manifest_projected ?? 0,
    registryReadmissionCount:
      registryEventCount(input.workspaceReplayAfter) -
      registryEventCount(input.workspaceReplayBefore),
    selectedHandleCount: events.filter(
      (event) =>
        event.kind === "graph_function_selected" &&
        event.selectedEntryRef === GRAPH_HANDLE
    ).length,
    transportCallCount: await callCount(input.callLogPath)
  };
}

async function writeSdkEvidence(evidenceRoot, evidence) {
  if (evidenceRoot === undefined || evidenceRoot === null) {
    return;
  }
  if (typeof evidenceRoot !== "string" || evidenceRoot.length === 0) {
    throw new TypeError("evidenceRoot must be a non-empty path when supplied");
  }
  await mkdir(evidenceRoot, { recursive: true });
  for (const [fileName, value] of Object.entries(evidence)) {
    await writeFile(
      path.join(evidenceRoot, fileName),
      canonicalizeIJson(value),
      "utf8"
    );
  }
}

function normalizedCatalogRow(row) {
  return {
    canonicalHandle: row.canonicalHandle,
    runtimeEntryRef: row.runtimeEntryRef,
    kind: row.kind,
    ownerProductId: row.ownerProductId,
    ownerVersion: row.ownerVersion,
    descriptorId: row.descriptorId,
    contributionId: row.contributionId,
    artifactDigest: row.artifactDigest,
    resolvedLockId: row.resolvedLockId,
    compatible: row.compatible,
    ready: row.ready,
    readinessBlockers: row.readinessBlockers,
    eligible: row.eligible,
    callable: row.callable,
    sessionVisible: row.sessionVisible,
    contractRef: row.contractRef,
    schemaRefs: row.schemaRefs
  };
}

function normalizedCatalogRows(outcome) {
  const list = assertAccepted(outcome, "catalog.list");
  return list.value
    .map(normalizedCatalogRow)
    .sort((left, right) =>
      left.canonicalHandle < right.canonicalHandle
        ? -1
        : left.canonicalHandle > right.canonicalHandle
          ? 1
          : 0
    );
}

function normalizedCatalogDescription(outcome) {
  const description = assertAccepted(outcome, "catalog.describe").value;
  return {
    ...normalizedCatalogRow(description),
    declarationRef: description.declarationRef,
    interfaceRef: description.interfaceRef,
    dependencyRefs: description.dependencyRefs,
    policyRefs: description.policyRefs,
    capabilityRefs: description.capabilityRefs,
    proofRefs: description.proofRefs
  };
}

function registryEventCount(replayOutcome) {
  const replay = assertAccepted(replayOutcome, "workspace replay");
  return replay.value.events.filter(
    (event) =>
      typeof event?.kind === "string" &&
      event.kind.startsWith("registry_entry_")
  ).length;
}

function workspaceReplayRequest(workspaceId) {
  return {
    workspaceId,
    subject: { kind: "workspace", workspaceId },
    fromOrdinal: 0,
    limit: 1000
  };
}

function nativeInvoker(publicContractCatalog, lane) {
  let sequence = 0;
  return async (operationId, request, context) => {
    sequence += 1;
    const actorRef = REQUIRED_ACTOR_OPERATIONS.has(operationId)
      ? `actor://t223/${lane}`
      : null;
    const invocation = constructPublicOperationInvocation({
      operationId,
      request,
      publicContractCatalog,
      invocationId: `invocation://t223/${lane}/${sequence}`,
      requestId: `request://t223/${lane}/${sequence}`,
      actorRef,
      adapter: { kind: "native_sdk", ref: "sdk://t223/packed-consumer" },
      provenanceRefs: ["proof://t223/packed-sdk"],
      correlationId: `correlation://t223/${lane}/${sequence}`
    });
    switch (operationId) {
      case "abg.operation.workspace.create":
        return await abiogenesisPublicSdk.workspaceCreate(context, invocation);
      case "abg.operation.workspace.open":
        return await abiogenesisPublicSdk.workspaceOpen(context, invocation);
      case "abg.operation.catalog.resolve":
        return await abiogenesisPublicSdk.catalogResolve(context, invocation);
      case "abg.operation.catalog.verify":
        return await abiogenesisPublicSdk.catalogVerify(context, invocation);
      case "abg.operation.install.install":
        return await abiogenesisPublicSdk.installProduct(context, invocation);
      case "abg.operation.catalog.bind":
        return await abiogenesisPublicSdk.catalogBind(context, invocation);
      case "abg.operation.catalog.admit":
        return await abiogenesisPublicSdk.catalogAdmit(context, invocation);
      case "abg.operation.catalog.list":
        return await abiogenesisPublicSdk.catalogList(context, invocation);
      case "abg.operation.catalog.describe":
        return await abiogenesisPublicSdk.catalogDescribe(context, invocation);
      case "abg.operation.catalog.allow":
        return await abiogenesisPublicSdk.catalogAllow(context, invocation);
      case "abg.operation.catalog.invoke":
        return await abiogenesisPublicSdk.catalogInvoke(context, invocation);
      case "abg.operation.read.result":
        return await abiogenesisPublicSdk.readResult(context, invocation);
      case "abg.operation.read.replay":
        return await abiogenesisPublicSdk.readReplay(context, invocation);
      default:
        throw new TypeError(`unsupported packed SDK operation ${operationId}`);
    }
  };
}

async function runSdk(config) {
  const lane = "sdk";
  const transportSteering =
    config.transportSteering ?? DEFAULT_TRANSPORT_STEERING;
  const publicContractCatalog = await loadNodePublicContractCatalog(
    config.publicContractCatalogPath
  );
  const invoke = nativeInvoker(publicContractCatalog, lane);
  const workspaceContext = createNodeWorkspacePathContext({
    targetRoot: config.workspaceRoot,
    publicContractCatalog
  });
  const workspace = assertAccepted(
    await invoke(
      "abg.operation.workspace.create",
      {
        targetRoot: config.workspaceRoot,
        authorityMode: "clean_no_project_authority"
      },
      workspaceContext
    ),
    "workspace.create"
  ).value;
  assertAccepted(
    await invoke(
      "abg.operation.workspace.open",
      { targetRoot: config.workspaceRoot, expectedWorkspaceSchemaVersion: 1 },
      workspaceContext
    ),
    "workspace.open"
  );
  const productContext = createNodeProductIntakeContext({
    publicContractCatalog,
    temporaryRoot: path.join(config.laneRoot, "temporary")
  });
  const lock = assertAccepted(
    await invoke(
      "abg.operation.catalog.resolve",
      resolutionRequest(config),
      productContext
    ),
    "catalog.resolve"
  ).value;
  const verified = [];
  for (const product of [config.abg, config.fixture]) {
    verified.push(
      assertAccepted(
        await invoke(
          "abg.operation.catalog.verify",
          {
            artifact: artifactFor(product),
            descriptor: product.descriptor,
            contributionManifest: product.contribution,
            resolvedLock: lock
          },
          productContext
        ),
        `catalog.verify ${product.descriptor.productId}`
      ).value
    );
  }
  const installed = [];
  for (const artifact of verified) {
    installed.push(
      assertAccepted(
        await invoke(
          "abg.operation.install.install",
          {
            verifiedArtifact: artifact,
            toolchainRoot: config.toolchainRoot,
            workspaceBindingRef: null
          },
          productContext
        ),
        `install ${artifact.descriptor.productId}`
      ).value
    );
  }
  const bindingContext = await createNodeWorkspaceBindingContext({
    workspaceRoot: config.workspaceRoot,
    publicContractCatalog,
    installedProductRecords: installed
  });
  const binding = assertAccepted(
    await invoke(
      "abg.operation.catalog.bind",
      {
        workspaceId: workspace.workspaceId,
        workspaceManifestDigest: digestCanonicalIJson(workspace),
        resolvedLock: lock,
        installedProductRecords: installed,
        mutableStateRoots: null
      },
      bindingContext
    ),
    "catalog.bind"
  ).value;
  const boundContext = await createNodeBoundWorkspaceContext({
    workspaceRoot: config.workspaceRoot,
    publicContractCatalog
  });
  const admission = assertAccepted(
    await invoke(
      "abg.operation.catalog.admit",
      {
        workspaceId: workspace.workspaceId,
        bindingId: binding.bindingId,
        resolvedLockId: lock.lockId,
        productSetDigest: binding.productSetDigest
      },
      boundContext
    ),
    "catalog.admit"
  ).value;
  const catalogList = await invoke(
    "abg.operation.catalog.list",
    {
      workspaceId: workspace.workspaceId,
      catalogId: admission.catalogId,
      kinds: ["graph_function", "node_type", "overlay"],
      allowedHandles: null,
      sessionView: null
    },
    boundContext
  );
  const helloDescription = await invoke(
    "abg.operation.catalog.describe",
    {
      workspaceId: workspace.workspaceId,
      catalogId: admission.catalogId,
      handle: GRAPH_HANDLE,
      allowedHandles: null,
      sessionView: null
    },
    boundContext
  );
  const view = assertAccepted(
    await invoke(
      "abg.operation.catalog.allow",
      {
        workspaceId: workspace.workspaceId,
        catalogId: admission.catalogId,
        handles: [GRAPH_HANDLE]
      },
      boundContext
    ),
    "catalog.allow"
  ).value;
  const workspaceReplayBefore = await invoke(
    "abg.operation.read.replay",
    workspaceReplayRequest(workspace.workspaceId),
    boundContext
  );
  const invoked = await invoke(
    "abg.operation.catalog.invoke",
    invokeRequest({ config, lane, workspace, binding, lock, admission, view }),
    boundContext
  );
  const graphCallId = assertAccepted(invoked, "catalog.invoke").value.graphCallId;
  const result = await invoke(
    "abg.operation.read.result",
    { workspaceId: workspace.workspaceId, graphCallId },
    boundContext
  );
  const replay = await invoke(
    "abg.operation.read.replay",
    {
      workspaceId: workspace.workspaceId,
      subject: { kind: "graph_call", graphCallId },
      fromOrdinal: 0,
      limit: 1000
    },
    boundContext
  );
  const workspaceReplayAfter = await invoke(
    "abg.operation.read.replay",
    workspaceReplayRequest(workspace.workspaceId),
    boundContext
  );
  const summary = await summarize({
    catalogList,
    helloDescription,
    invoke: invoked,
    result,
    replay,
    workspaceReplayBefore,
    workspaceReplayAfter,
    callLogPath: config.callLogPath,
    transportSteering
  });
  await writeSdkEvidence(config.evidenceRoot, {
    "catalog-invoke-response.json": invoked,
    "read-result-response.json": result,
    "read-replay-response.json": replay,
    "workspace-replay-response.json": workspaceReplayAfter,
    "consumer-summary.json": summary
  });
  return summary;
}

async function writeRequest(config, sequence, request) {
  const requestPath = path.join(
    config.laneRoot,
    `request-${String(sequence).padStart(2, "0")}.json`
  );
  await writeFile(requestPath, canonicalizeIJson(request), "utf8");
  return requestPath;
}

async function runCliOperation(config, state, operation, request) {
  state.sequence += 1;
  const requestPath = await writeRequest(config, state.sequence, request);
  const args = [
    ...operation.words,
    "--request",
    requestPath,
    "--contract-catalog",
    config.publicContractCatalogPath
  ];
  if (operation.workspace) {
    args.push("--workspace-root", config.workspaceRoot);
  }
  if (operation.actor) {
    args.push("--actor", "actor://t223/cli");
  }
  const result = spawnSync(config.cliPath, args, {
    cwd: config.laneRoot,
    encoding: "utf8",
    env: process.env
  });
  const expectedStatus = operation.acceptedNonTerminal ? 3 : 0;
  if (result.status !== expectedStatus) {
    throw new TypeError(
      `${operation.words.join(" ")} exited ${String(result.status)}: ${result.stderr || result.stdout}`
    );
  }
  if (result.stderr.length > 0) {
    throw new TypeError(
      `${operation.words.join(" ")} wrote stderr: ${result.stderr}`
    );
  }
  return JSON.parse(result.stdout);
}

async function runCli(config) {
  const state = { sequence: 0 };
  const operation = async (words, request, options = {}) =>
    await runCliOperation(
      config,
      state,
      {
        words,
        workspace: options.workspace ?? false,
        actor: options.actor ?? false,
        acceptedNonTerminal: options.acceptedNonTerminal ?? false
      },
      request
    );
  const workspace = assertAccepted(
    await operation(
      ["workspace", "create"],
      {
        targetRoot: config.workspaceRoot,
        authorityMode: "clean_no_project_authority"
      },
      { workspace: true, actor: true }
    ),
    "CLI workspace.create"
  ).value;
  assertAccepted(
    await operation(
      ["workspace", "open"],
      { targetRoot: config.workspaceRoot, expectedWorkspaceSchemaVersion: 1 },
      { workspace: true }
    ),
    "CLI workspace.open"
  );
  const lock = assertAccepted(
    await operation(["catalog", "resolve"], resolutionRequest(config)),
    "CLI catalog.resolve"
  ).value;
  const verified = [];
  for (const product of [config.abg, config.fixture]) {
    verified.push(
      assertAccepted(
        await operation(["catalog", "verify"], {
          artifact: artifactFor(product),
          descriptor: product.descriptor,
          contributionManifest: product.contribution,
          resolvedLock: lock
        }),
        `CLI catalog.verify ${product.descriptor.productId}`
      ).value
    );
  }
  const installed = [];
  for (const artifact of verified) {
    installed.push(
      assertAccepted(
        await operation(
          ["install"],
          {
            verifiedArtifact: artifact,
            toolchainRoot: config.toolchainRoot,
            workspaceBindingRef: null
          },
          { actor: true }
        ),
        `CLI install ${artifact.descriptor.productId}`
      ).value
    );
  }
  const binding = assertAccepted(
    await operation(
      ["catalog", "bind"],
      {
        workspaceId: workspace.workspaceId,
        workspaceManifestDigest: digestCanonicalIJson(workspace),
        resolvedLock: lock,
        installedProductRecords: installed,
        mutableStateRoots: null
      },
      { workspace: true, actor: true }
    ),
    "CLI catalog.bind"
  ).value;
  const admission = assertAccepted(
    await operation(
      ["catalog", "admit"],
      {
        workspaceId: workspace.workspaceId,
        bindingId: binding.bindingId,
        resolvedLockId: lock.lockId,
        productSetDigest: binding.productSetDigest
      },
      { workspace: true, actor: true }
    ),
    "CLI catalog.admit"
  ).value;
  const catalogList = await operation(
    ["catalog", "list"],
    {
      workspaceId: workspace.workspaceId,
      catalogId: admission.catalogId,
      kinds: ["graph_function", "node_type", "overlay"],
      allowedHandles: null,
      sessionView: null
    },
    { workspace: true }
  );
  const helloDescription = await operation(
    ["catalog", "describe"],
    {
      workspaceId: workspace.workspaceId,
      catalogId: admission.catalogId,
      handle: GRAPH_HANDLE,
      allowedHandles: null,
      sessionView: null
    },
    { workspace: true }
  );
  const view = assertAccepted(
    await operation(
      ["catalog", "allow"],
      {
        workspaceId: workspace.workspaceId,
        catalogId: admission.catalogId,
        handles: [GRAPH_HANDLE]
      },
      { workspace: true }
    ),
    "CLI catalog.allow"
  ).value;
  const workspaceReplayBefore = await operation(
    ["replay"],
    workspaceReplayRequest(workspace.workspaceId),
    { workspace: true }
  );
  const invoked = await operation(
    ["catalog", "invoke"],
    invokeRequest({
      config,
      lane: "cli",
      workspace,
      binding,
      lock,
      admission,
      view
    }),
    { workspace: true, actor: true, acceptedNonTerminal: true }
  );
  const graphCallId = assertAccepted(invoked, "CLI catalog.invoke").value.graphCallId;
  const result = await operation(
    ["result"],
    { workspaceId: workspace.workspaceId, graphCallId },
    { workspace: true }
  );
  const replay = await operation(
    ["replay"],
    {
      workspaceId: workspace.workspaceId,
      subject: { kind: "graph_call", graphCallId },
      fromOrdinal: 0,
      limit: 1000
    },
    { workspace: true }
  );
  const workspaceReplayAfter = await operation(
    ["replay"],
    workspaceReplayRequest(workspace.workspaceId),
    { workspace: true }
  );
  return await summarize({
    catalogList,
    helloDescription,
    invoke: invoked,
    result,
    replay,
    workspaceReplayBefore,
    workspaceReplayAfter,
    callLogPath: config.callLogPath
  });
}

const [mode, configPath] = process.argv.slice(2);
if ((mode !== "sdk" && mode !== "cli") || configPath === undefined) {
  throw new TypeError("usage: consumer.mjs sdk|cli <config.json>");
}
const config = JSON.parse(await readFile(path.resolve(configPath), "utf8"));
const report = mode === "sdk" ? await runSdk(config) : await runCli(config);
process.stdout.write(`${canonicalizeIJson(report)}\n`);
