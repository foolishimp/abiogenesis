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

function runEpisode(events, outcome) {
  const selected = events.filter((event) =>
    event.runId === outcome.runId ||
    event.parentAggregateId === outcome.runtimeInvocationRef ||
    event.payload?.invocationRef === outcome.runtimeInvocationRef);
  const kinds = selected.map((event) => event.kind);
  const resultEvent = selected.find((event) => event.kind === "c_call_result_admitted");
  const judgmentEvent = selected.find((event) => event.kind === "c_call_judged");
  const failures = [];
  const { kind, schemaVersion, outcomeDigest, ...outcomeBody } = outcome;
  if (
    kind !== "public_outcome" ||
    schemaVersion !== "5.0.0" ||
    outcomeDigest !== sha256Canonical(outcomeBody)
  ) {
    failures.push(`run ${outcome.runId} public outcome identity is invalid`);
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
    !equalJson(resultEvent?.payload?.value, outcome.result)
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
  return failures;
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
    verifyOutcome?.result?.productId === candidateBasis.productId;

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
    typeof outcomes[1]?.result?.installId === "string";
  obligationResults.R3 = obligationResults.R2 &&
    outcomes[2]?.result?.kind === "workspace_binding" &&
    typeof outcomes[2]?.result?.bindingId === "string";
  obligationResults.R4 = obligationResults.R3 &&
    outcomes[3]?.result?.kind === "admitted_catalog" &&
    outcomes[4]?.result?.kind === "catalog_view" &&
    Array.isArray(outcomes[4]?.result?.allowlist) &&
    outcomes[4].result.allowlist.includes(
      "graph-function://abiogenesis/conformance/hello-world@5",
    );

  try {
    eventBytes = await readFile(eventLogPath);
    const lines = eventBytes.toString("utf8").split(/\r?\n/u).filter(Boolean);
    events = lines.map((line) => JSON.parse(line));
    failures.push(...verifyEvents(events));
  } catch {
    failures.push("durable ABG event log is absent or malformed");
  }

  const runRequests = transcript.slice(SETUP_OPERATIONS.length);
  const runOutcomes = outcomes.slice(SETUP_OPERATIONS.length);
  const exactTargets = runRequests.length >= 1 && runRequests.every((request) =>
    request.payload?.programRef === "program://abiogenesis/conformance/hello-world@5" &&
    request.payload?.graphFunctionRef === "graph-function://abiogenesis/conformance/hello-world@5");
  const invocationEvents = events.filter((event) => event.kind === "invocation_admitted");
  obligationResults.R5 = obligationResults.R4 && exactTargets &&
    invocationEvents.length === runOutcomes.length;

  const implementationEvents = events.filter((event) => event.kind === "implementation_admitted");
  obligationResults.R6 = obligationResults.R5 &&
    implementationEvents.length === runOutcomes.length &&
    implementationEvents.every((event) =>
      event.payload?.implementationBindingRef ===
        "implementation-binding://abiogenesis/conformance/hello-world-fd@5" &&
      typeof event.payload?.implementationBindingDigest === "string" &&
      typeof event.payload?.implementationDescriptorDigest === "string");

  const basisEvents = events.filter((event) => event.kind === "basis_admitted");
  obligationResults.R7 = obligationResults.R6 &&
    basisEvents.length === runOutcomes.length &&
    basisEvents.every((event) =>
      event.payload?.graphFunctionRef === "graph-function://abiogenesis/conformance/hello-world@5" &&
      typeof event.payload?.graphRef === "string");

  const openKinds = ["run_segment_opened", "graph_call_opened", "frame_opened"];
  obligationResults.R8 = obligationResults.R7 && runOutcomes.length >= 1 &&
    openKinds.every((kind) => events.filter((event) => event.kind === kind).length === runOutcomes.length);

  const episodeFailures = runOutcomes.flatMap((outcome) => runEpisode(events, outcome));
  failures.push(...episodeFailures);
  obligationResults.R9 = obligationResults.R8 && episodeFailures.length === 0;

  const outputContract = "contract://abiogenesis/conformance/hello-output@5";
  const prefixChecks = eventBytes !== null && runOutcomes.every((outcome) => {
    if (
      !Number.isInteger(outcome.eventLogByteLength) ||
      outcome.eventLogByteLength <= 0 ||
      outcome.eventLogByteLength > eventBytes.byteLength
    ) return false;
    return sha256Bytes(eventBytes.subarray(0, outcome.eventLogByteLength)) === outcome.eventLogDigest;
  });
  obligationResults.R10 = obligationResults.R9 &&
    runOutcomes.length >= 1 &&
    runOutcomes.every((outcome) =>
      outcome.replayAgreement === true &&
      outcome.outputContractRef === outputContract &&
      outcome.admittedResultContractRef === outputContract &&
      outcome.result?.kind === "hello_world_output" &&
      typeof outcome.result?.message === "string" &&
      typeof outcome.replayDigest === "string") &&
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
