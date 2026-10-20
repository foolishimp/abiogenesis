import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { expectedVerificationIdentity } from "../support/candidate-basis.mjs";
import { buildRootCliScenario } from "../support/root-cli-environment.mjs";

const WORKER_PATH = new URL("./installed-worker.mjs", import.meta.url);

function runInstalledWorker(harness, request) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ["--experimental-import-meta-resolve", WORKER_PATH.pathname],
      {
        cwd: harness.cliHost,
        env: { ...process.env, NODE_OPTIONS: "" },
        stdio: ["pipe", "pipe", "pipe"],
      },
    );
    const stdout = [];
    const stderr = [];
    child.stdout.on("data", (chunk) => stdout.push(chunk));
    child.stderr.on("data", (chunk) => stderr.push(chunk));
    child.once("error", reject);
    child.once("close", (exitCode) => {
      const output = Buffer.concat(stdout).toString("utf8").trim();
      let envelope;
      try {
        envelope = JSON.parse(output);
      } catch (error) {
        reject(new Error(
          `installed worker emitted invalid JSON (exit ${exitCode}): ${output}\n${Buffer.concat(stderr).toString("utf8")}`,
          { cause: error },
        ));
        return;
      }
      if (exitCode !== 0 || envelope.ok !== true) {
        reject(new Error(
          `installed worker refused (${exitCode}): ${envelope.error?.name ?? "Error"}: ${envelope.error?.message ?? "unknown"}`,
        ));
        return;
      }
      resolve(envelope.result);
    });
    child.stdin.end(JSON.stringify({
      ...request,
      cliHost: harness.cliHost,
    }));
  });
}

function outcomeSignature(outcome) {
  return `${outcome?.disposition ?? "absent"}:${outcome?.code ?? outcome?.result?.code ?? "none"}`;
}

function phaseOutcome(result, phaseIndex, outcomeIndex = 0) {
  return result.phases[phaseIndex]?.outcomes[outcomeIndex] ?? null;
}

async function readEvents(path) {
  try {
    const source = (await readFile(path, "utf8")).trim();
    return source.length === 0
      ? []
      : source.split(/\r?\n/u).map((line) => JSON.parse(line));
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

async function isAbsent(path) {
  try {
    await readFile(path);
    return false;
  } catch (error) {
    if (error?.code === "ENOENT") return true;
    throw error;
  }
}

function isExactCloseHandoffForPath(handoff, eventLogPath) {
  return (
    handoff?.prefix?.kind === "durable_prefix_coordinate" &&
    handoff?.reopenAuthority?.kind === "event_store_reopen_authority" &&
    handoff.reopenAuthority.eventLogPath === eventLogPath &&
    handoff.prefix.prefixDigest === handoff.reopenAuthority.eventLogDigest &&
    handoff.prefix.prefixLength ===
      handoff.reopenAuthority.durableByteLength &&
    handoff.prefix.storeIdentity.device === handoff.reopenAuthority.device &&
    handoff.prefix.storeIdentity.inode === handoff.reopenAuthority.inode &&
    handoff.prefix.storeIdentity.eventContractDigest ===
      handoff.reopenAuthority.eventContractDigest
  );
}

function relationDisposition(redObserved) {
  return redObserved ? "confirmed_red" : "preserved_green";
}

async function runAxF02(harness) {
  const scenario = await buildRootCliScenario(
    harness,
    "increment-0a-f02",
    (payload) => payload,
    { catalogApplications: [] },
  );
  const splitPublicEventLogPath = join(
    scenario.eventLogRoot,
    "abi5-root-ax-f02-split.events.jsonl",
  );
  const splitPublicSinkAbsent = await isAbsent(splitPublicEventLogPath);
  if (!splitPublicSinkAbsent) {
    throw new TypeError("AX-F02 split Public sink must be absent before P1");
  }
  const expectedIdentity = expectedVerificationIdentity(harness.candidateBasis);
  const ownerP1 = await runInstalledWorker(harness, {
    action: "owner_verify_and_resolve",
    artifactPath: harness.artifactPath,
    artifactRef: harness.artifactRef,
    expectedIdentity,
  });
  const ownerP2 = await runInstalledWorker(harness, {
    action: "owner_resolve",
    verified: JSON.parse(JSON.stringify(ownerP1.verified)),
  });
  const publicP1 = await runInstalledWorker(harness, {
    action: "public_transcript",
    phases: [{ label: "verify", rows: [scenario.transcript[0]] }],
    durableStart: {
      kind: "configure",
      eventLogPath: splitPublicEventLogPath,
    },
    returnHandoff: true,
  });
  const publicP1Events = await readEvents(splitPublicEventLogPath);
  const publicP2 = await runInstalledWorker(harness, {
    action: "public_transcript",
    phases: [{ label: "resolve", rows: [scenario.transcript[1]] }],
    durableStart: {
      kind: "reopen",
      handoff: publicP1.handoff,
    },
    returnHandoff: true,
  });
  const publicP2Events = await readEvents(splitPublicEventLogPath);

  const publicResolve = phaseOutcome(publicP2, 0);
  const carrierBytesEqual =
    ownerP1.verifiedCanonicalDigest === ownerP2.inputCanonicalDigest;
  const restartedOwnerRefusal =
    ownerP2.lock?.kind === "environment_refusal" &&
    ownerP2.lock?.code === "lock_mismatch";
  const distinctSplitPublicSink =
    splitPublicEventLogPath !== scenario.eventLogPath;
  const exactPublicPrefixReopen =
    publicP1.pid !== publicP2.pid &&
    publicP1.startHistoricalEventCount === 0 &&
    publicP1.endEventCount === publicP1Events.length &&
    publicP1Events.length > 0 &&
    isExactCloseHandoffForPath(
      publicP1.handoff,
      splitPublicEventLogPath,
    ) &&
    publicP2.startHistoricalEventCount === publicP1Events.length &&
    publicP2.endEventCount === publicP1Events.length &&
    JSON.stringify(publicP2Events) === JSON.stringify(publicP1Events) &&
    JSON.stringify(publicP2.handoff.prefix) ===
      JSON.stringify(publicP1.handoff.prefix);
  const redObserved =
    ownerP1.verified?.disposition === "verified" &&
    ownerP1.lock?.kind === "resolved_product_lock" &&
    carrierBytesEqual &&
    restartedOwnerRefusal &&
    publicResolve?.disposition === "refused" &&
    publicResolve?.code === "missing_prerequisite";

  return {
    relationId: "AX-F02",
    claim:
      "complete verification and resolution truth must survive canonical serialization and process restart without a prior Public invocation object",
    ingress:
      "installed @abiogenesis/typescript-tenant/product verifyProduct and constructResolvedProductLock, paired with installed Public product.verify then product.resolve over an explicitly reopened ABG prefix",
    fixtureSource: {
      authority: "accepted census blob efe88cac AX-F02",
      artifact: "the exact packed installed ABIogenesis TypeScript Product",
      operations: ["product.verify/artifact", "product.resolve/verified_product_set"],
      splitPublicProbe:
        "one distinct sibling event log proven absent before P1 acquisition",
    },
    processBoundary:
      "owner P1 serializes the complete installed Product verification carrier; Public P1 acquires a distinct absent sibling sink and closes its exact verification handoff; fresh Public P2 reopens only that handoff and resolves after P1 exits",
    mutation:
      "JSON round-trip the complete verification carrier and restart before Product resolution",
    oracle:
      "owner resolution reproduces the exact verified identity and lock ref/digest/value, while the Public path must not require a prior invocation object",
    expectedBaselineSignature:
      "the restarted lower resolver returns lock_mismatch for the JSON-equal carrier and fresh Public resolution refuses missing_prerequisite because verification authority is process-local",
    observedSignature:
      `carrier_bytes=${carrierBytesEqual ? "equal" : "different"};owner_restart=${ownerP2.lock?.disposition ?? "unknown"}:${ownerP2.lock?.code ?? "none"};public_resolve=${outcomeSignature(publicResolve)}`,
    disposition: relationDisposition(redObserved),
    cases: [
      {
        caseId: "complete-owner-carrier",
        verified: ownerP1.verified?.disposition === "verified",
        retainedLock: ownerP1.lock?.kind === "resolved_product_lock",
        restartedLock: ownerP2.lock?.kind === "resolved_product_lock",
        restartedRefusalCode: ownerP2.lock?.code ?? null,
        canonicalCarrierEquality: carrierBytesEqual,
      },
      {
        caseId: "public-verification-reference",
        p1: outcomeSignature(phaseOutcome(publicP1, 0)),
        p2: outcomeSignature(publicResolve),
        p1EventCount: publicP1Events.length,
        p2StartHistoricalEventCount: publicP2.startHistoricalEventCount,
      },
    ],
    maskControls: [
      {
        controlId: "installed-owner-ingress",
        passed:
          ownerP1.verified?.disposition === "verified" &&
          ownerP1.lock?.kind === "resolved_product_lock" &&
          restartedOwnerRefusal,
      },
      {
        controlId: "canonical-bytes-before-resolve",
        passed:
          ownerP1.verifiedCanonicalDigest === ownerP2.inputCanonicalDigest,
      },
      {
        controlId: "distinct-absent-public-probe-sink",
        passed:
          splitPublicSinkAbsent &&
          distinctSplitPublicSink,
      },
      {
        controlId: "explicit-prefix-reopen",
        passed: exactPublicPrefixReopen,
      },
      {
        controlId: "parse-valid-public-request",
        passed: publicResolve?.code !== "invalid_request",
      },
    ],
  };
}

async function runAxF01(harness) {
  const control = await buildRootCliScenario(
    harness,
    "increment-0a-f01-control",
    (payload) => payload,
    { catalogApplications: [] },
  );
  const controlEventLogPath = join(
    control.eventLogRoot,
    "abi5-root-ax-f01-control.events.jsonl",
  );
  const controlSinkAbsent = await isAbsent(controlEventLogPath);
  const controlSinkDistinct = controlEventLogPath !== control.eventLogPath;
  if (!controlSinkAbsent || !controlSinkDistinct) {
    throw new TypeError(
      "AX-F01 control requires one distinct absent Public sink",
    );
  }
  const controlResult = await runInstalledWorker(harness, {
    action: "public_transcript",
    phases: [{ label: "retained-control", rows: control.transcript.slice(0, 6) }],
    durableStart: { kind: "configure", eventLogPath: controlEventLogPath },
    returnHandoff: true,
  });
  const controlEvents = await readEvents(controlEventLogPath);
  const controlPrefixExact =
    controlResult.startHistoricalEventCount === 0 &&
    controlResult.endEventCount === controlEvents.length &&
    controlEvents.length > 0 &&
    isExactCloseHandoffForPath(
      controlResult.handoff,
      controlEventLogPath,
    );
  const stageDefinitions = [
    { caseId: "resolved-to-install", targetIndex: 2 },
    { caseId: "install-to-workspace", targetIndex: 3 },
    { caseId: "workspace-to-catalog", targetIndex: 4 },
    { caseId: "catalog-to-view", targetIndex: 5 },
  ];
  const cases = [];
  for (const stage of stageDefinitions) {
    const scenario = await buildRootCliScenario(
      harness,
      `increment-0a-f01-${stage.caseId}`,
      (payload) => payload,
      { catalogApplications: [] },
    );
    const splitEventLogPath = join(
      scenario.eventLogRoot,
      "abi5-root-ax-f01-split.events.jsonl",
    );
    const splitSinkAbsent = await isAbsent(splitEventLogPath);
    const splitSinkDistinct = splitEventLogPath !== scenario.eventLogPath;
    if (!splitSinkAbsent || !splitSinkDistinct) {
      throw new TypeError(
        `AX-F01 ${stage.caseId} requires one distinct absent Public sink`,
      );
    }
    const p1 = await runInstalledWorker(harness, {
      action: "public_transcript",
      phases: [{
        label: "originating-prefix",
        rows: scenario.transcript.slice(0, stage.targetIndex),
      }],
      durableStart: { kind: "configure", eventLogPath: splitEventLogPath },
      returnHandoff: true,
    });
    const p1Events = await readEvents(splitEventLogPath);
    const p2 = await runInstalledWorker(harness, {
      action: "public_transcript",
      phases: [{
        label: "reconstructed-stage",
        rows: [scenario.transcript[stage.targetIndex]],
      }],
      durableStart: { kind: "reopen", handoff: p1.handoff },
      returnHandoff: true,
    });
    const p2Events = await readEvents(splitEventLogPath);
    const target = phaseOutcome(p2, 0);
    const exactPrefixReopen =
      p1.pid !== p2.pid &&
      p1.startHistoricalEventCount === 0 &&
      p1.endEventCount === p1Events.length &&
      p1Events.length > 0 &&
      isExactCloseHandoffForPath(p1.handoff, splitEventLogPath) &&
      p2.startHistoricalEventCount === p1Events.length &&
      p2.endEventCount === p1Events.length &&
      JSON.stringify(p2Events) === JSON.stringify(p1Events) &&
      JSON.stringify(p2.handoff.prefix) ===
        JSON.stringify(p1.handoff.prefix);
    cases.push({
      caseId: stage.caseId,
      p1PrefixSucceeded: p1.phases[0].outcomes.every(
        (outcome) => outcome.disposition === "succeeded",
      ),
      prefixEventCount: p2.startHistoricalEventCount,
      sinkAbsentBeforeP1: splitSinkAbsent,
      sinkDistinctFromScenarioLog: splitSinkDistinct,
      exactPrefixReopen,
      p2: outcomeSignature(target),
      control: outcomeSignature(
        controlResult.phases[0].outcomes[stage.targetIndex],
      ),
      parseValid: target?.code !== "invalid_request",
    });
  }

  const controlsSucceeded = controlResult.phases[0].outcomes.every(
    (outcome) => outcome.disposition === "succeeded",
  );
  const allSplitPrefixesValid = cases.every(
    (entry) =>
      entry.p1PrefixSucceeded &&
      Number.isInteger(entry.prefixEventCount) &&
      entry.sinkAbsentBeforeP1 &&
      entry.sinkDistinctFromScenarioLog &&
      entry.exactPrefixReopen,
  );
  const allRestartedStagesRefused = cases.every(
    (entry) => entry.p2 === "refused:missing_prerequisite",
  );
  const redObserved =
    controlsSucceeded && allSplitPrefixesValid && allRestartedStagesRefused;

  return {
    relationId: "AX-F01",
    claim:
      "install, workspace, runtime catalog, and deterministic catalog-view truth must reconstruct from complete carriers and one explicit ABG prefix rather than process-local setup maps",
    ingress:
      "installed Public setup operations with an installed ABG event-store prefix configured in P1 and verified/reopened in P2",
    fixtureSource: {
      authority: "accepted census blob efe88cac AX-F01",
      product: "the exact packed installed ABIogenesis TypeScript Product",
      stages: stageDefinitions.map((stage) => stage.caseId),
      splitPublicProbes:
        "the retained control and four split cases each use a distinct sibling event log proven absent before P1",
    },
    processBoundary:
      "the populated scenario logs supply transcript inputs only; each probe acquires a distinct absent sibling sink, terminates P1 after one exact setup handoff, then fresh P2 reopens only that handoff and attempts the next stage",
    mutation:
      "restart between resolution/install, install/workspace, workspace/catalog, and catalog/view",
    oracle:
      "complete setup artifacts rehydrate from the exact admitted prefix and deterministic view reconstruction appends no event",
    expectedBaselineSignature:
      "every P2 stage refuses missing_prerequisite because legacy Public requires prior invocation state held only in RootOperationState",
    observedSignature: cases
      .map((entry) => `${entry.caseId}=${entry.p2}`)
      .join(";"),
    disposition: relationDisposition(redObserved),
    cases,
    maskControls: [
      {
        controlId: "retained-process-stage-validity",
        passed:
          controlsSucceeded &&
          controlSinkAbsent &&
          controlSinkDistinct &&
          controlPrefixExact,
      },
      {
        controlId: "one-exact-prefix-per-fixture",
        passed: allSplitPrefixesValid,
      },
      {
        controlId: "parse-valid-next-stage",
        passed: cases.every((entry) => entry.parseValid),
      },
      {
        controlId: "owner-carrier-lower-boundary",
        passed: true,
        evidenceRelationId: "AX-F02",
      },
    ],
  };
}

export async function runAxF12(harness) {
  const scenarioA = await buildRootCliScenario(
    harness,
    "increment-0a-f12-prefix-a",
    (payload) => payload,
    { catalogApplications: [] },
  );
  const scenarioB = await buildRootCliScenario(
    harness,
    "increment-0a-f12-prefix-b",
    (payload) => payload,
    { catalogApplications: [] },
  );
  const runA = scenarioA.executionTranscript.at(-1);
  const runB = scenarioB.executionTranscript.at(-1);
  if (
    runA?.operationId !== "abg.operation.run.invoke" ||
    runB?.operationId !== "abg.operation.run.invoke"
  ) {
    throw new TypeError(
      "AX-F12 requires the exact terminal run.invoke row from both scenarios",
    );
  }
  const handoffA = runA.payload.runtimePrefixAuthority;
  const handoffB = runB.payload.runtimePrefixAuthority;
  const [beforeBytesA, beforeBytesB, beforeEventsA, beforeEventsB] =
    await Promise.all([
      readFile(scenarioA.eventLogPath),
      readFile(scenarioB.eventLogPath),
      readEvents(scenarioA.eventLogPath),
      readEvents(scenarioB.eventLogPath),
    ]);
  const sameJson = (left, right) =>
    JSON.stringify(left) === JSON.stringify(right);
  const expectedCarrierDigests = {
    a: harness.product.sha256Canonical([runA]),
    b: harness.product.sha256Canonical([runB]),
  };
  const initialMasks = [
    {
      controlId: "exact-run-rows",
      passed:
        runA === scenarioA.transcript.at(-1) &&
        runB === scenarioB.transcript.at(-1),
    },
    {
      controlId: "valid-independent-full-handoffs",
      passed:
        isExactCloseHandoffForPath(handoffA, scenarioA.eventLogPath) &&
        isExactCloseHandoffForPath(handoffB, scenarioB.eventLogPath) &&
        runA.payload.eventLogPath === scenarioA.eventLogPath &&
        runB.payload.eventLogPath === scenarioB.eventLogPath &&
        scenarioA.eventLogPath !== scenarioB.eventLogPath &&
        handoffA.prefix.coordinateDigest !==
          handoffB.prefix.coordinateDigest &&
        handoffA.reopenAuthority.authorityDigest !==
          handoffB.reopenAuthority.authorityDigest,
    },
    {
      controlId: "captured-setup-prefixes-before-runtime-effects",
      passed:
        beforeEventsA.length > 0 &&
        beforeEventsB.length > 0 &&
        beforeBytesA.byteLength === handoffA.prefix.prefixLength &&
        beforeBytesB.byteLength === handoffB.prefix.prefixLength,
    },
  ];
  const failedInitialMask = initialMasks.find((control) => !control.passed);
  if (failedInitialMask !== undefined) {
    throw new TypeError(
      `AX-F12 prerequisite mask failed: ${failedInitialMask.controlId}`,
    );
  }

  const retainedInputs = [
    {
      label: "request-a-on-context-b",
      requestedPrefix: "A",
      boundContext: "B",
      rows: [runA],
      handoff: handoffB,
    },
    {
      label: "request-b-on-context-a",
      requestedPrefix: "B",
      boundContext: "A",
      rows: [runB],
      handoff: handoffA,
    },
    {
      label: "request-a-return-on-context-b",
      requestedPrefix: "A",
      boundContext: "B",
      rows: [runA],
      handoff: handoffB,
    },
  ];
  const retained = await runInstalledWorker(harness, {
    action: "f12_context_sequence",
    episodes: retainedInputs.map(({ label, rows, handoff }) => ({
      label,
      rows,
      handoff,
    })),
  });
  const [afterRetainedBytesA, afterRetainedBytesB] = await Promise.all([
    readFile(scenarioA.eventLogPath),
    readFile(scenarioB.eventLogPath),
  ]);
  const [afterRetainedEventsA, afterRetainedEventsB] = await Promise.all([
    readEvents(scenarioA.eventLogPath),
    readEvents(scenarioB.eventLogPath),
  ]);

  const retainedCases = retainedInputs.map((input, index) => {
    const episode = retained.episodes[index];
    const boundHandoff = input.handoff;
    const requestedHandoff = input.rows[0].payload.runtimePrefixAuthority;
    const boundEventCount = input.boundContext === "A"
      ? beforeEventsA.length
      : beforeEventsB.length;
    const expectedDigest = input.requestedPrefix === "A"
      ? expectedCarrierDigests.a
      : expectedCarrierDigests.b;
    const exactRequestedHandoff = input.requestedPrefix === "A"
      ? handoffA
      : handoffB;
    return {
      caseId: input.label,
      requestedPrefix: input.requestedPrefix,
      boundContext: input.boundContext,
      outcome: outcomeSignature(episode?.outcomes[0]),
      startEventCount: episode?.startHistoricalEventCount ?? null,
      endEventCount: episode?.endEventCount ?? null,
      eventDelta:
        (episode?.endEventCount ?? 0) -
        (episode?.startHistoricalEventCount ?? 0),
      requestCarrierDigest: episode?.requestCarrierDigest ?? null,
      requestCarrierExact:
        episode?.requestCarrierDigest === expectedDigest,
      requestedHandoffExact:
        sameJson(requestedHandoff, exactRequestedHandoff),
      requestedPrefixDiffersFromBound:
        requestedHandoff.prefix.coordinateDigest !==
          boundHandoff.prefix.coordinateDigest,
      reopenedBoundPrefixExact:
        sameJson(episode?.ingressPrefix, boundHandoff.prefix),
      returnedBoundHandoffExact:
        sameJson(episode?.successorHandoff, boundHandoff),
      refusedBeforeAppend:
        outcomeSignature(episode?.outcomes[0]) ===
          "refused:missing_prerequisite" &&
        episode?.startHistoricalEventCount === boundEventCount &&
        episode?.endEventCount === boundEventCount,
    };
  });
  const retainedPrefixesUnchanged =
    beforeBytesA.equals(afterRetainedBytesA) &&
    beforeBytesB.equals(afterRetainedBytesB) &&
    sameJson(beforeEventsA, afterRetainedEventsA) &&
    sameJson(beforeEventsB, afterRetainedEventsB);
  if (
    retained.episodes.length !== 3 ||
    !retainedCases.every((entry) =>
      entry.requestCarrierExact &&
      entry.requestedHandoffExact &&
      entry.requestedPrefixDiffersFromBound &&
      entry.reopenedBoundPrefixExact &&
      entry.returnedBoundHandoffExact &&
      entry.refusedBeforeAppend
    ) ||
    !retainedPrefixesUnchanged
  ) {
    throw new TypeError(
      `AX-F12 opposite-context refusal mask failed: ${JSON.stringify({
        retainedCases,
        retainedPrefixesUnchanged,
      })}`,
    );
  }

  const [freshA, freshB] = await Promise.all([
    runInstalledWorker(harness, {
      action: "public_transcript",
      durableStart: { kind: "reopen", handoff: handoffA },
      phases: [{ label: "fresh-a-matching-context", rows: [runA] }],
      returnHandoff: true,
    }),
    runInstalledWorker(harness, {
      action: "public_transcript",
      durableStart: { kind: "reopen", handoff: handoffB },
      phases: [{ label: "fresh-b-matching-context", rows: [runB] }],
      returnHandoff: true,
    }),
  ]);
  const [afterFreshBytesA, afterFreshBytesB] = await Promise.all([
    readFile(scenarioA.eventLogPath),
    readFile(scenarioB.eventLogPath),
  ]);
  const [afterFreshEventsA, afterFreshEventsB] = await Promise.all([
    readEvents(scenarioA.eventLogPath),
    readEvents(scenarioB.eventLogPath),
  ]);
  const freshCases = [
    {
      caseId: "fresh-a-matching-context",
      pid: freshA.pid,
      outcome: outcomeSignature(phaseOutcome(freshA, 0)),
      requestCarrierDigest: freshA.phases[0].requestCarrierDigest,
      requestCarrierExact:
        freshA.phases[0].requestCarrierDigest === expectedCarrierDigests.a &&
        freshA.phases[0].requestCarrierDigest ===
          retained.episodes[0].requestCarrierDigest &&
        freshA.phases[0].requestCarrierDigest ===
          retained.episodes[2].requestCarrierDigest,
      startEventCount: freshA.startHistoricalEventCount,
      endEventCount: freshA.endEventCount,
      eventDelta:
        freshA.endEventCount - freshA.startHistoricalEventCount,
      byteDelta: afterFreshBytesA.byteLength - beforeBytesA.byteLength,
      successorHandoffValid:
        isExactCloseHandoffForPath(freshA.handoff, scenarioA.eventLogPath) &&
        freshA.handoff.prefix.prefixLength === afterFreshBytesA.byteLength,
    },
    {
      caseId: "fresh-b-matching-context",
      pid: freshB.pid,
      outcome: outcomeSignature(phaseOutcome(freshB, 0)),
      requestCarrierDigest: freshB.phases[0].requestCarrierDigest,
      requestCarrierExact:
        freshB.phases[0].requestCarrierDigest === expectedCarrierDigests.b &&
        freshB.phases[0].requestCarrierDigest ===
          retained.episodes[1].requestCarrierDigest,
      startEventCount: freshB.startHistoricalEventCount,
      endEventCount: freshB.endEventCount,
      eventDelta:
        freshB.endEventCount - freshB.startHistoricalEventCount,
      byteDelta: afterFreshBytesB.byteLength - beforeBytesB.byteLength,
      successorHandoffValid:
        isExactCloseHandoffForPath(freshB.handoff, scenarioB.eventLogPath) &&
        freshB.handoff.prefix.prefixLength === afterFreshBytesB.byteLength,
    },
  ];
  const processBoundariesExact =
    new Set([retained.pid, freshA.pid, freshB.pid]).size === 3;
  const freshExecutionsExact =
    freshCases.every((entry) =>
      entry.outcome === "succeeded:none" &&
      entry.requestCarrierExact &&
      entry.startEventCount > 0 &&
      entry.endEventCount > entry.startEventCount &&
      entry.eventDelta > 0 &&
      entry.byteDelta > 0 &&
      entry.successorHandoffValid
    ) &&
    freshA.startHistoricalEventCount === beforeEventsA.length &&
    freshB.startHistoricalEventCount === beforeEventsB.length &&
    freshA.endEventCount === afterFreshEventsA.length &&
    freshB.endEventCount === afterFreshEventsB.length;
  const maskControls = [
    ...initialMasks,
    {
      controlId: "one-retained-process-opposite-context-refusals",
      passed:
        retainedCases.every((entry) => entry.refusedBeforeAppend) &&
        retainedPrefixesUnchanged,
    },
    {
      controlId: "full-bound-handoffs-returned-unchanged",
      passed: retainedCases.every((entry) =>
        entry.reopenedBoundPrefixExact &&
        entry.returnedBoundHandoffExact
      ),
    },
    {
      controlId: "byte-identical-request-carriers",
      passed:
        retainedCases.every((entry) => entry.requestCarrierExact) &&
        freshCases.every((entry) => entry.requestCarrierExact),
    },
    {
      controlId: "three-exact-process-boundaries",
      passed: processBoundariesExact,
    },
    {
      controlId: "matching-fresh-contexts-produce-effects",
      passed: freshExecutionsExact,
    },
  ];
  const failedMask = maskControls.find((control) => !control.passed);
  if (failedMask !== undefined) {
    throw new TypeError(
      `AX-F12 mask failed: ${failedMask.controlId}; ${JSON.stringify({
        retainedPid: retained.pid,
        retainedCases,
        freshCases,
      })}`,
    );
  }

  return {
    relationId: "AX-F12",
    claim:
      "run.invoke runtimePrefixAuthority must be one full EventStoreCloseHandoff whose prefix exactly matches the separately reopened Public context before effects",
    ingress:
      "the exact terminal installed Public run.invoke carrier from each of two independently prepared scenario prefixes",
    fixtureSource: {
      authority: "accepted census blob efe88cac AX-F12",
      requestedPrefixOrder: ["A", "B", "A"],
      oppositeBoundContextOrder: ["B", "A", "B"],
      requestRows:
        "executionTranscript.at(-1) from each independently built installed scenario, asserted as abg.operation.run.invoke",
      initialPrefixes: {
        a: {
          eventLogPath: scenarioA.eventLogPath,
          eventCount: beforeEventsA.length,
          byteLength: beforeBytesA.byteLength,
          coordinateDigest: handoffA.prefix.coordinateDigest,
          authorityDigest: handoffA.reopenAuthority.authorityDigest,
        },
        b: {
          eventLogPath: scenarioB.eventLogPath,
          eventCount: beforeEventsB.length,
          byteLength: beforeBytesB.byteLength,
          coordinateDigest: handoffB.prefix.coordinateDigest,
          authorityDigest: handoffB.reopenAuthority.authorityDigest,
        },
      },
    },
    processBoundary:
      "one installed worker opens and closes three distinct opposite-bound Public contexts; only after all eventless refusals, two separate fresh workers reopen the original matching A and B handoffs",
    mutation:
      "present the exact A, B, A request carriers to contexts explicitly reopened from B, A, B full handoffs",
    oracle:
      "each opposite-bound request refuses missing_prerequisite with identical handoff, prefix, bytes, and event count; the same carrier succeeds with effects only in a fresh matching context",
    expectedBaselineSignature:
      "context-handoff mismatch is checked before effects and no ambient process state selects or retargets a prefix",
    observedSignature:
      `retained=${retainedCases.map((entry) => entry.outcome).join(",")};retained_event_deltas=${retainedCases.map((entry) => entry.eventDelta).join(",")};prefix_bytes_unchanged=${retainedPrefixesUnchanged};fresh_a=${freshCases[0].outcome};fresh_a_event_delta=${freshCases[0].eventDelta};fresh_a_byte_delta=${freshCases[0].byteDelta};fresh_b=${freshCases[1].outcome};fresh_b_event_delta=${freshCases[1].eventDelta};fresh_b_byte_delta=${freshCases[1].byteDelta};pids=${retained.pid},${freshA.pid},${freshB.pid}`,
    disposition: "preserved_green",
    cases: [
      {
        caseId: "retained-a-b-a-on-opposite-contexts",
        pid: retained.pid,
        prefixBytesUnchanged: retainedPrefixesUnchanged,
        episodes: retainedCases,
      },
      ...freshCases,
    ],
    maskControls,
  };
}

export async function runAuthorityLanes({ harness, packageRoot }) {
  if (
    typeof packageRoot !== "string" ||
    packageRoot.length === 0 ||
    harness?.sourcePackageRoot !== packageRoot
  ) {
    throw new TypeError(
      "authority lanes require the exact installed-harness source package root",
    );
  }
  const f02 = await runAxF02(harness);
  const f01 = await runAxF01(harness);
  const f12 = await runAxF12(harness);
  return [f01, f02, f12];
}
