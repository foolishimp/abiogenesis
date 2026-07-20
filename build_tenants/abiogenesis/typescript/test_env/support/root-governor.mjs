import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

export const ABI5_ROOT_BINDING = "ABI5-ROOT-001";
export const ABI5_ROOT_GOVERNOR = "abg5.root.s01.hello_world@5";

const OBLIGATIONS = Object.freeze([
  "R1",
  "R2",
  "R3",
  "R4",
  "R5",
  "R6",
  "R7",
  "R8",
  "R9",
  "R10",
]);

const SETUP_OPERATIONS = Object.freeze([
  "abg.operation.product.verify",
  "abg.operation.product.install",
  "abg.operation.workspace.bind",
  "abg.operation.catalog.admit",
  "abg.operation.catalog.view",
]);

const RUN_EVENT_KINDS = Object.freeze([
  "public_operation_admitted",
  "invocation_admitted",
  "implementation_admitted",
  "basis_admitted",
  "run_segment_opened",
  "graph_call_opened",
  "frame_opened",
  "c_call_opened",
  "c_call_fibre_selected",
  "c_call_evidenced",
  "c_call_result_admitted",
  "c_call_judged",
  "fd_advance_ready",
  "terminal_reached",
  "frame_closed",
  "graph_call_closed",
  "run_closed",
]);

const SETUP_EVENT_ROWS = Object.freeze([
  ["public_operation_artifact_admitted", "abg.operation.product.install", 1],
  ["public_operation_artifact_admitted", "abg.operation.workspace.bind", 2],
  ["public_operation_artifact_admitted", "abg.operation.catalog.admit", 3],
  ["registry_entry_admitted", "abg.operation.catalog.admit", null],
  ["public_operation_artifact_admitted", "abg.operation.catalog.view", 4],
]);

function canonicalJson(value) {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("non-finite number");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (typeof value !== "object") throw new TypeError("non-JSON value");
  return `{${Object.keys(value).sort().map((key) =>
    `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

function sha256Bytes(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function sha256Canonical(value) {
  return sha256Bytes(Buffer.from(canonicalJson(value), "utf8"));
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function equalJson(left, right) {
  try {
    return canonicalJson(left) === canonicalJson(right);
  } catch {
    return false;
  }
}

function validOutcomeIdentity(outcome) {
  if (!isRecord(outcome)) return false;
  const { kind, schemaVersion, outcomeDigest, ...body } = outcome;
  return kind === "public_outcome" &&
    schemaVersion === "5.0.0" &&
    outcomeDigest === sha256Canonical(body);
}

function verifyEvents(events) {
  const failures = [];
  const byId = new Map();
  for (const [index, event] of events.entries()) {
    if (!isRecord(event) || event.admissionOrdinal !== index + 1) {
      failures.push("event admission ordinals are not total and gap-free");
      continue;
    }
    const { eventId, admissionOrdinal, payloadDigest, ...candidate } = event;
    if (payloadDigest !== sha256Canonical(event.payload)) {
      failures.push(`event ${index + 1} payload digest differs from its payload`);
    }
    const expectedId = `event://abiogenesis/${sha256Canonical({
      ...candidate,
      payloadDigest,
      admissionOrdinal,
    }).slice("sha256:".length)}`;
    if (eventId !== expectedId || byId.has(eventId)) {
      failures.push(`event ${index + 1} identity is invalid or duplicated`);
    }
    for (const causeRef of event.causationEventRefs ?? []) {
      const cause = byId.get(causeRef);
      if (cause === undefined) {
        failures.push(`event ${index + 1} has a non-prior causation reference`);
      } else if (
        event.runId !== undefined &&
        cause.runId !== undefined &&
        cause.runId !== event.runId
      ) {
        failures.push(`event ${index + 1} crosses a run causation boundary`);
      }
    }
    byId.set(eventId, event);
  }
  return failures;
}

function runEpisode(events, outcome, request) {
  const selected = events.filter((event) =>
    event.runId === outcome.runId ||
    event.parentAggregateId === outcome.runtimeInvocationRef ||
    event.payload?.invocationRef === outcome.runtimeInvocationRef);
  const kinds = selected.map((event) => event.kind);
  const resultEvent = selected.find((event) => event.kind === "c_call_result_admitted");
  const judgmentEvent = selected.find((event) => event.kind === "c_call_judged");
  const publicEvent = selected.find((event) => event.kind === "public_operation_admitted");
  const invocationEvent = selected.find((event) => event.kind === "invocation_admitted");
  const runEvent = selected.find((event) => event.kind === "run_segment_opened");
  const graphCallEvent = selected.find((event) => event.kind === "graph_call_opened");
  const frameEvent = selected.find((event) => event.kind === "frame_opened");
  const cCallEvent = selected.find((event) => event.kind === "c_call_opened");
  const failures = [];
  const input = request?.payload?.input;
  if (
    !isRecord(input) ||
    input.kind !== "hello_world_input" ||
    input.schemaVersion !== "5.0.0" ||
    typeof input.subject !== "string" ||
    input.subject.length === 0
  ) {
    failures.push(`run ${outcome.runId} lacks the exact declared Hello World input`);
  }
  if (
    publicEvent?.parentAggregateId !== outcome.runtimeInvocationRef ||
    publicEvent?.payload?.invocationRef !== outcome.runtimeInvocationRef ||
    invocationEvent?.parentAggregateId !== outcome.runtimeInvocationRef ||
    invocationEvent?.payload?.invocationRef !== outcome.runtimeInvocationRef ||
    invocationEvent?.payload?.publicRequestInvocationRef !== request?.invocationRef ||
    invocationEvent?.payload?.publicRequestDigest !== sha256Canonical(request) ||
    invocationEvent?.payload?.rawInputDigest !== sha256Canonical(input)
  ) {
    failures.push(`run ${outcome.runId} does not preserve its admitted invocation identity`);
  }
  if (
    typeof request?.correlationId !== "string" ||
    selected.some((event) =>
      event.correlationId !== request.correlationId &&
      !event.correlationId?.startsWith(`${request.correlationId}/`))
  ) {
    failures.push(`run ${outcome.runId} does not preserve its caller correlation scope`);
  }
  if (
    publicEvent?.payload?.programRef !== request?.payload?.programRef ||
    publicEvent?.payload?.graphFunctionRef !== request?.payload?.graphFunctionRef ||
    runEvent?.aggregateId !== outcome.runId ||
    runEvent?.payload?.runId !== outcome.runId ||
    graphCallEvent?.aggregateId !== outcome.graphCallId ||
    graphCallEvent?.payload?.graphCallId !== outcome.graphCallId ||
    frameEvent?.aggregateId !== outcome.frameId ||
    frameEvent?.payload?.frameId !== outcome.frameId ||
    cCallEvent?.aggregateId !== outcome.cCallRef ||
    cCallEvent?.payload?.cCallRef !== outcome.cCallRef
  ) {
    failures.push(`run ${outcome.runId} scope identities differ from its public outcome`);
  }
  if (!equalJson(kinds, RUN_EVENT_KINDS)) {
    failures.push(`run ${outcome.runId} event order differs from the exact admitted spine`);
  }
  for (const kind of RUN_EVENT_KINDS) {
    if (kinds.filter((value) => value === kind).length !== 1) {
      failures.push(`run ${outcome.runId} does not contain exactly one ${kind}`);
    }
  }
  if (kinds.includes("runtime_failure_observed") || kinds.includes("invocation_refused")) {
    failures.push(`run ${outcome.runId} contains a refusal or runtime failure`);
  }
  if (
    resultEvent?.aggregateId !== outcome.cCallRef ||
    resultEvent?.payload?.resultRef !== outcome.resultRef ||
    resultEvent?.payload?.contractRef !== outcome.admittedResultContractRef ||
    !equalJson(resultEvent?.payload?.value, outcome.result) ||
    outcome.result?.message !== `Hello ${input?.subject ?? ""}`
  ) {
    failures.push(`run ${outcome.runId} result projection differs from admitted CCall truth`);
  }
  if (
    judgmentEvent?.payload?.judgmentRef !== outcome.judgmentRef ||
    judgmentEvent?.payload?.judgment !== "advance"
  ) {
    failures.push(`run ${outcome.runId} judgment projection differs from admitted truth`);
  }
  const closeKinds = selected.slice(-4).map((event) => event.kind);
  if (!equalJson(closeKinds, ["terminal_reached", "frame_closed", "graph_call_closed", "run_closed"])) {
    failures.push(`run ${outcome.runId} lacks the exact terminal closure suffix`);
  }
  return { failures, eventIds: selected.map((event) => event.eventId) };
}

export async function evaluateAbi5Root({
  candidateBasis,
  artifactPath,
  transcript,
  outcomes,
  eventLogPath,
}) {
  const failures = [];
  const obligationResults = Object.fromEntries(OBLIGATIONS.map((id) => [id, false]));
  let artifactBytes = null;
  let eventBytes = null;
  let events = [];

  try {
    artifactBytes = await readFile(artifactPath);
  } catch {
    failures.push("R1 artifact bytes are not readable");
  }
  const verifyRequest = transcript[0];
  const verifyOutcome = outcomes[0];
  const outcomeIdentitiesValid = outcomes.every(validOutcomeIdentity);
  if (!outcomeIdentitiesValid) {
    failures.push("one or more public outcome identities are invalid");
  }
  obligationResults.R1 = artifactBytes !== null &&
    sha256Bytes(artifactBytes) === candidateBasis.artifactDigest &&
    verifyRequest?.operationId === SETUP_OPERATIONS[0] &&
    verifyRequest?.payload?.expectedArtifactDigest === candidateBasis.artifactDigest &&
    verifyRequest?.payload?.expectedProductContentDigest === candidateBasis.productContentDigest &&
    verifyRequest?.payload?.expectedManifestDigest === candidateBasis.manifestDigest &&
    verifyRequest?.payload?.expectedProductId === candidateBasis.productId &&
    verifyRequest?.payload?.expectedPackageName === candidateBasis.packageName &&
    verifyRequest?.payload?.expectedPackageVersion === candidateBasis.packageVersion &&
    verifyOutcome?.disposition === "succeeded" &&
    verifyOutcome?.result?.artifactDigest === candidateBasis.artifactDigest &&
    verifyOutcome?.result?.productContentDigest === candidateBasis.productContentDigest &&
    verifyOutcome?.result?.manifestDigest === candidateBasis.manifestDigest &&
    verifyOutcome?.result?.productId === candidateBasis.productId &&
    outcomeIdentitiesValid;

  const operationIds = outcomes.map((outcome) => outcome.operationId);
  const requestOperationIds = transcript.map((request) => request.operationId);
  const expectedOperations = [
    ...SETUP_OPERATIONS,
    ...Array(Math.max(0, outcomes.length - SETUP_OPERATIONS.length)).fill("abg.operation.run.invoke"),
  ];
  if (!equalJson(operationIds, expectedOperations) || !equalJson(requestOperationIds, expectedOperations)) {
    failures.push("public operation order differs from the bound installed path");
  }
  if (outcomes.some((outcome, index) => outcome.invocationRef !== transcript[index]?.invocationRef)) {
    failures.push("one or more public outcomes differ from the caller invocation identity");
  }
  if (outcomes.some((outcome) => outcome.disposition !== "succeeded")) {
    failures.push("one or more installed public operations did not succeed");
  }
  obligationResults.R2 = obligationResults.R1 &&
    outcomes[1]?.result?.kind === "product_install" &&
    outcomes[1]?.result?.productId === candidateBasis.productId &&
    typeof outcomes[1]?.result?.installId === "string";
  obligationResults.R3 = obligationResults.R2 &&
    outcomes[2]?.result?.kind === "workspace_binding" &&
    typeof outcomes[2]?.result?.bindingId === "string" &&
    outcomes[2]?.result?.bindingId ===
      `workspace-binding://abiogenesis/${outcomes[2]?.result?.bindingDigest?.slice("sha256:".length)}`;
  obligationResults.R4 = obligationResults.R3 &&
    outcomes[3]?.result?.kind === "admitted_catalog" &&
    outcomes[3]?.result?.admittedRows === 1 &&
    outcomes[3]?.result?.catalogId ===
      `catalog://abiogenesis/${outcomes[3]?.result?.catalogDigest?.slice("sha256:".length)}` &&
    outcomes[4]?.result?.kind === "catalog_view" &&
    outcomes[4]?.result?.viewId ===
      `catalog-view://abiogenesis/${outcomes[4]?.result?.viewDigest?.slice("sha256:".length)}` &&
    equalJson(outcomes[4]?.result?.allowlist, [
      "graph-function://abiogenesis/conformance/hello-world@5",
    ]);

  try {
    eventBytes = await readFile(eventLogPath);
    const lines = eventBytes.toString("utf8").split(/\r?\n/u).filter(Boolean);
    events = lines.map((line) => JSON.parse(line));
    failures.push(...verifyEvents(events));
  } catch {
    failures.push("durable ABG event log is absent or malformed");
  }

  const setupEvents = events.slice(0, SETUP_EVENT_ROWS.length);
  const installEvent = setupEvents[0];
  const workspaceEvent = setupEvents[1];
  const catalogArtifactEvent = setupEvents[2];
  const catalogRegistryEvent = setupEvents[3];
  const catalogViewEvent = setupEvents[4];
  const installOutcome = outcomes[1];
  const workspaceOutcome = outcomes[2];
  const catalogOutcome = outcomes[3];
  const catalogViewOutcome = outcomes[4];
  const catalogCandidateRef = typeof catalogOutcome?.result?.catalogDigest === "string"
    ? `catalog-candidate://abiogenesis/${catalogOutcome.result.catalogDigest.slice("sha256:".length)}`
    : null;
  const catalogViewCandidateRef = typeof catalogViewOutcome?.result?.viewDigest === "string"
    ? `catalog-view-candidate://abiogenesis/${catalogViewOutcome.result.viewDigest.slice("sha256:".length)}`
    : null;
  const setupEventsValid = setupEvents.length === SETUP_EVENT_ROWS.length &&
    SETUP_EVENT_ROWS.every(([kind, operationId, requestIndex], index) =>
      setupEvents[index]?.kind === kind &&
      setupEvents[index]?.payload?.operationId === operationId &&
      (requestIndex === null || (
        setupEvents[index]?.payload?.invocationPayloadDigest ===
          sha256Canonical(transcript[requestIndex]?.payload) &&
        setupEvents[index]?.payload?.invocationDigest ===
          sha256Canonical({
            invocationRef: transcript[requestIndex]?.invocationRef,
            operationId,
            payloadDigest: sha256Canonical(transcript[requestIndex]?.payload),
          })
      ))) &&
    installEvent?.eventId === installOutcome?.result?.admissionEventRef &&
    installEvent?.aggregateId === installOutcome?.result?.installId &&
    installEvent?.basisId === installOutcome?.result?.installId &&
    installEvent?.payload?.artifactRef === installOutcome?.result?.installId &&
    installEvent?.payload?.invocationRef === transcript[1]?.invocationRef &&
    equalJson(installEvent?.causationEventRefs, []) &&
    workspaceEvent?.eventId === workspaceOutcome?.result?.admissionEventRef &&
    workspaceEvent?.aggregateId === workspaceOutcome?.result?.bindingId &&
    workspaceEvent?.basisId === workspaceOutcome?.result?.bindingId &&
    workspaceEvent?.payload?.artifactRef === workspaceOutcome?.result?.bindingId &&
    workspaceEvent?.payload?.invocationRef === transcript[2]?.invocationRef &&
    equalJson(workspaceEvent?.causationEventRefs, [installEvent?.eventId]) &&
    catalogArtifactEvent?.eventId === catalogOutcome?.result?.admissionEventRef &&
    catalogArtifactEvent?.aggregateId === workspaceOutcome?.result?.bindingId &&
    catalogArtifactEvent?.basisId === workspaceOutcome?.result?.bindingId &&
    catalogArtifactEvent?.payload?.authorityScopeRef === workspaceOutcome?.result?.bindingId &&
    catalogArtifactEvent?.payload?.artifactRef === catalogCandidateRef &&
    catalogArtifactEvent?.payload?.invocationRef === transcript[3]?.invocationRef &&
    equalJson(catalogArtifactEvent?.causationEventRefs, [workspaceEvent?.eventId]) &&
    catalogRegistryEvent?.parentAggregateId === catalogOutcome?.result?.catalogId &&
    catalogRegistryEvent?.basisId === catalogCandidateRef &&
    catalogRegistryEvent?.payload?.candidateId === catalogCandidateRef &&
    catalogRegistryEvent?.payload?.catalogId === catalogOutcome?.result?.catalogId &&
    catalogRegistryEvent?.payload?.handle ===
      "graph-function://abiogenesis/conformance/hello-world@5" &&
    equalJson(catalogRegistryEvent?.causationEventRefs, [catalogArtifactEvent?.eventId]) &&
    catalogViewEvent?.eventId === catalogViewOutcome?.result?.admissionEventRef &&
    catalogViewEvent?.aggregateId === catalogOutcome?.result?.catalogId &&
    catalogViewEvent?.basisId === catalogOutcome?.result?.catalogId &&
    catalogViewEvent?.payload?.authorityScopeRef === catalogOutcome?.result?.catalogId &&
    catalogViewEvent?.payload?.artifactRef === catalogViewCandidateRef &&
    catalogViewEvent?.payload?.invocationRef === transcript[4]?.invocationRef &&
    equalJson(catalogViewEvent?.causationEventRefs, [catalogArtifactEvent?.eventId]);
  if (!setupEventsValid) {
    failures.push("installed setup events differ from the exact admitted path");
  }
  obligationResults.R2 = obligationResults.R2 && setupEventsValid;
  obligationResults.R3 = obligationResults.R3 && setupEventsValid;
  obligationResults.R4 = obligationResults.R4 && setupEventsValid;

  const runRequests = transcript.slice(SETUP_OPERATIONS.length);
  const runOutcomes = outcomes.slice(SETUP_OPERATIONS.length);
  const uniqueRunIdentities =
    new Set(runRequests.map((request) => request.invocationRef)).size === runRequests.length &&
    new Set(runOutcomes.map((outcome) => outcome.runtimeInvocationRef)).size === runOutcomes.length &&
    new Set(runOutcomes.map((outcome) => outcome.runId)).size === runOutcomes.length;
  if (!uniqueRunIdentities) {
    failures.push("run request, runtime invocation, or Run identities are duplicated");
  }
  const exactTargets = runRequests.length >= 1 && runRequests.every((request) =>
    request.payload?.programRef === "program://abiogenesis/conformance/hello-world@5" &&
    request.payload?.graphFunctionRef === "graph-function://abiogenesis/conformance/hello-world@5");
  const invocationEvents = events.filter((event) => event.kind === "invocation_admitted");
  obligationResults.R5 = obligationResults.R4 && exactTargets && uniqueRunIdentities &&
    invocationEvents.length === runOutcomes.length;

  const implementationEvents = events.filter((event) => event.kind === "implementation_admitted");
  obligationResults.R6 = obligationResults.R5 &&
    implementationEvents.length === runOutcomes.length &&
    new Set(implementationEvents.map((event) => event.payload?.implementationBindingDigest)).size === 1 &&
    new Set(implementationEvents.map((event) => event.payload?.implementationDescriptorDigest)).size === 1 &&
    implementationEvents.every((event) =>
      event.payload?.implementationBindingRef ===
        "implementation-binding://abiogenesis/conformance/hello-world-fd@5" &&
      event.payload?.implementationRef ===
        "implementation://abiogenesis/conformance/hello-world-fd@5" &&
      event.payload?.computeRegime === "F_D" &&
      event.payload?.packageName === candidateBasis.packageName &&
      event.payload?.packageVersion === candidateBasis.packageVersion &&
      event.payload?.inputContractRef ===
        "contract://abiogenesis/conformance/hello-input@5" &&
      event.payload?.outputContractRef ===
        "contract://abiogenesis/conformance/hello-output@5" &&
      typeof event.payload?.implementationBindingDigest === "string" &&
      typeof event.payload?.implementationDescriptorDigest === "string");

  const basisEvents = events.filter((event) => event.kind === "basis_admitted");
  obligationResults.R7 = obligationResults.R6 &&
    basisEvents.length === runOutcomes.length &&
    basisEvents.every((event, index) =>
      event.parentAggregateId === runOutcomes[index]?.runtimeInvocationRef &&
      event.payload?.invocationRef === runOutcomes[index]?.runtimeInvocationRef &&
      event.payload?.rawInputDigest === sha256Canonical(runRequests[index]?.payload?.input) &&
      event.payload?.workspaceBindingId === outcomes[2]?.result?.bindingId &&
      event.payload?.workspaceBindingDigest === outcomes[2]?.result?.bindingDigest &&
      event.payload?.catalogViewId === outcomes[4]?.result?.viewId &&
      event.payload?.catalogViewDigest === outcomes[4]?.result?.viewDigest &&
      event.payload?.programRef === "program://abiogenesis/conformance/hello-world@5" &&
      event.payload?.graphFunctionRef === "graph-function://abiogenesis/conformance/hello-world@5" &&
      event.payload?.graphRef ===
        `graph-materialization://abiogenesis/${event.payload?.graphDigest?.slice("sha256:".length)}` &&
      event.payload?.basisRef ===
        `execution-basis://abiogenesis/${event.payload?.basisDigest?.slice("sha256:".length)}`);

  const openKinds = ["run_segment_opened", "graph_call_opened", "frame_opened"];
  obligationResults.R8 = obligationResults.R7 && runOutcomes.length >= 1 &&
    openKinds.every((kind) => events.filter((event) => event.kind === kind).length === runOutcomes.length);

  const episodeResults = runOutcomes.map((outcome, index) =>
    runEpisode(events, outcome, runRequests[index]));
  const episodeFailures = episodeResults.flatMap((result) => result.failures);
  failures.push(...episodeFailures);
  const accountedEventIds = new Set([
    ...setupEvents.map((event) => event.eventId),
    ...episodeResults.flatMap((result) => result.eventIds),
  ]);
  const eventAccountingValid =
    events.length === SETUP_EVENT_ROWS.length + (runOutcomes.length * RUN_EVENT_KINDS.length) &&
    accountedEventIds.size === events.length &&
    events.every((event) => accountedEventIds.has(event.eventId));
  if (!eventAccountingValid) {
    failures.push("durable ledger contains a missing, duplicated, or unaccounted event");
  }
  obligationResults.R9 = obligationResults.R8 &&
    episodeFailures.length === 0 &&
    eventAccountingValid;

  const outputContract = "contract://abiogenesis/conformance/hello-output@5";
  const prefixChecks = eventBytes !== null && runOutcomes.every((outcome, index) => {
    const expectedEventCount = SETUP_EVENT_ROWS.length +
      ((index + 1) * RUN_EVENT_KINDS.length);
    const expectedPrefix = Buffer.from(
      `${events.slice(0, expectedEventCount).map(canonicalJson).join("\n")}\n`,
      "utf8",
    );
    if (
      !Number.isInteger(outcome.eventLogByteLength) ||
      outcome.eventLogByteLength <= 0 ||
      outcome.eventLogByteLength > eventBytes.byteLength ||
      outcome.eventLogByteLength !== expectedPrefix.byteLength ||
      outcome.durableEventCount !== expectedEventCount
    ) return false;
    const prefix = eventBytes.subarray(0, outcome.eventLogByteLength);
    const prefixLines = prefix.toString("utf8").split(/\r?\n/u).filter(Boolean);
    return prefix.at(-1) === 0x0a &&
      prefixLines.length === outcome.durableEventCount &&
      prefix.equals(expectedPrefix) &&
      sha256Bytes(prefix) === outcome.eventLogDigest;
  });
  const finalPrefixCoversLog = eventBytes !== null &&
    runOutcomes.at(-1)?.eventLogByteLength === eventBytes.byteLength;
  if (!finalPrefixCoversLog) {
    failures.push("final durable prefix does not cover the exact event log bytes");
  }
  obligationResults.R10 = obligationResults.R9 &&
    runOutcomes.length >= 1 &&
    runOutcomes.every((outcome) =>
      outcome.replayAgreement === true &&
      outcome.outputContractRef === outputContract &&
      outcome.admittedResultContractRef === outputContract &&
      outcome.result?.kind === "hello_world_output" &&
      typeof outcome.result?.message === "string" &&
      typeof outcome.replayDigest === "string") &&
    runOutcomes.at(-1)?.durableEventCount === events.length &&
    finalPrefixCoversLog &&
    prefixChecks;

  for (const id of OBLIGATIONS) {
    if (!obligationResults[id]) failures.push(`${id} is not satisfied`);
  }
  const firstFrontier = OBLIGATIONS.find((id) => !obligationResults[id]) ?? null;
  const body = {
    bindingId: ABI5_ROOT_BINDING,
    governorId: ABI5_ROOT_GOVERNOR,
    candidateBasis,
    obligationResults,
    firstFrontier,
    eventLogDigest: eventBytes === null ? null : sha256Bytes(eventBytes),
    eventCount: events.length,
    runIds: runOutcomes.map((outcome) => outcome.runId),
    failures: [...new Set(failures)],
  };
  const governorDigest = sha256Canonical(body);
  return Object.freeze({
    kind: "abi5_root_governor_result",
    schemaVersion: "5.0.0",
    disposition: firstFrontier === null && failures.length === 0
      ? "root_satisfied"
      : "root_red",
    governorDigest,
    ...body,
  });
}
