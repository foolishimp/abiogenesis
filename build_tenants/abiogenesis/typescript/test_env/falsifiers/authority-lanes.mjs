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

function eventCountForInvocation(events, invocationRef) {
  return events.filter(
    (event) => event?.payload?.invocationRef === invocationRef,
  ).length;
}

function invocation(operationId, variant, invocationRef, payload) {
  return {
    kind: "public_invocation",
    schemaVersion: "5.0.0",
    operationId,
    variant,
    invocationRef,
    eventTime: "2026-07-21T00:00:00.000Z",
    correlationId: "correlation://t286/increment-0a-authority",
    payload,
  };
}

function relationDisposition(redObserved) {
  return redObserved ? "confirmed_red" : "preserved_green";
}

async function runAxF02(harness) {
  const scenario = await buildRootCliScenario(harness, "increment-0a-f02");
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
      eventLogPath: scenario.eventLogPath,
    },
    returnAuthority: true,
  });
  const publicP2 = await runInstalledWorker(harness, {
    action: "public_transcript",
    phases: [{ label: "resolve", rows: [scenario.transcript[1]] }],
    durableStart: {
      kind: "reopen",
      authority: publicP1.authority,
    },
    returnAuthority: true,
  });

  const publicResolve = phaseOutcome(publicP2, 0);
  const carrierBytesEqual =
    ownerP1.verifiedCanonicalDigest === ownerP2.inputCanonicalDigest;
  const restartedOwnerRefusal =
    ownerP2.lock?.kind === "environment_refusal" &&
    ownerP2.lock?.code === "lock_mismatch";
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
    },
    processBoundary:
      "P1 serializes the complete installed Product verification carrier; P2 imports the installed Product and Public exports, reopens the exact empty prefix, and resolves after P1 exits",
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
        controlId: "explicit-prefix-reopen",
        passed:
          publicP2.startHistoricalEventCount === 0 &&
          publicP1.authority?.kind === "event_store_reopen_authority",
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
  );
  const controlResult = await runInstalledWorker(harness, {
    action: "public_transcript",
    phases: [{ label: "retained-control", rows: control.transcript.slice(0, 6) }],
    durableStart: { kind: "configure", eventLogPath: control.eventLogPath },
    returnAuthority: true,
  });
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
    );
    const p1 = await runInstalledWorker(harness, {
      action: "public_transcript",
      phases: [{
        label: "originating-prefix",
        rows: scenario.transcript.slice(0, stage.targetIndex),
      }],
      durableStart: { kind: "configure", eventLogPath: scenario.eventLogPath },
      returnAuthority: true,
    });
    const p2 = await runInstalledWorker(harness, {
      action: "public_transcript",
      phases: [{
        label: "reconstructed-stage",
        rows: [scenario.transcript[stage.targetIndex]],
      }],
      durableStart: { kind: "reopen", authority: p1.authority },
      returnAuthority: true,
    });
    const target = phaseOutcome(p2, 0);
    cases.push({
      caseId: stage.caseId,
      p1PrefixSucceeded: p1.phases[0].outcomes.every(
        (outcome) => outcome.disposition === "succeeded",
      ),
      prefixEventCount: p2.startHistoricalEventCount,
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
    (entry) => entry.p1PrefixSucceeded && Number.isInteger(entry.prefixEventCount),
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
    },
    processBoundary:
      "each fixture terminates P1 after one setup prefix, then P2 imports installed exports, verifies and reopens only that exact prefix, and attempts the next stage",
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
        passed: controlsSucceeded,
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
  const prefixA = await buildRootCliScenario(
    harness,
    "increment-0a-f12-prefix-a",
  );
  const prefixB = await buildRootCliScenario(
    harness,
    "increment-0a-f12-prefix-b",
  );
  const setupRowsA = prefixA.transcript.slice(0, 4);
  const setupRowsB = prefixB.transcript.slice(0, 4);
  const callA = structuredClone(prefixA.transcript[4]);
  const callB = structuredClone(prefixB.transcript[4]);
  const returnToA = structuredClone(prefixA.transcript[5]);
  returnToA.invocationRef =
    "invocation://t286/increment-0a-f12-prefix-a/catalog-view-return";

  const prefixBSetup = await runInstalledWorker(harness, {
    action: "public_transcript",
    durableStart: {
      kind: "configure",
      eventLogPath: prefixB.eventLogPath,
    },
    phases: [{ label: "prefix-b-setup", rows: setupRowsB }],
    returnAuthority: true,
  });
  const prefixBSetupSucceeded = prefixBSetup.phases[0].outcomes.every(
    (outcome) => outcome.disposition === "succeeded",
  );
  const freshBPrefix = await runInstalledWorker(harness, {
    action: "f12_clone_prefix",
    authority: prefixBSetup.authority,
    targetPath: join(
      harness.scratch,
      "increment-0a-f12-prefix-clones",
      "fresh-b.events.jsonl",
    ),
  });

  const retained = await runInstalledWorker(harness, {
    action: "f12_retained",
    prefixA: {
      eventLogPath: prefixA.eventLogPath,
      setupRows: setupRowsA,
      freshEventLogPath: join(
        harness.scratch,
        "increment-0a-f12-prefix-clones",
        "fresh-a.events.jsonl",
      ),
    },
    prefixB: prefixBSetup.authority,
    phaseA: { label: "prefix-a", rows: [callA] },
    phaseB: { label: "prefix-b", rows: [callB] },
    phaseAReturn: { label: "prefix-a-return", rows: [returnToA] },
  });
  const prefixASetupSucceeded = retained.setupOutcomes.every(
    (outcome) => outcome.disposition === "succeeded",
  );

  const [prefixAInspection, prefixBInspection] = await Promise.all([
    runInstalledWorker(harness, {
      action: "f12_inspect_prefix",
      authority: retained.freshA.authority,
      installInvocationRef: prefixA.refs.install,
      bindingInvocationRef: prefixA.refs.bind,
    }),
    runInstalledWorker(harness, {
      action: "f12_inspect_prefix",
      authority: freshBPrefix.authority,
      installInvocationRef: prefixB.refs.install,
      bindingInvocationRef: prefixB.refs.bind,
    }),
  ]);

  const [freshAResult, freshBResult] = await Promise.all([
    runInstalledWorker(harness, {
      action: "f12_fresh",
      authority: retained.freshA.authority,
      phase: { label: "fresh-a", rows: [callA] },
    }),
    runInstalledWorker(harness, {
      action: "f12_fresh",
      authority: freshBPrefix.authority,
      phase: { label: "fresh-b", rows: [callB] },
    }),
  ]);

  const retainedA = retained.phases[0];
  const retainedB = retained.phases[1];
  const retainedAReturn = retained.phases[2];
  const freshA = freshAResult.phase;
  const freshB = freshBResult.phase;
  const retainedAOutcome = retainedA.outcomes[0];
  const retainedBOutcome = retainedB.outcomes[0];
  const retainedAReturnOutcome = retainedAReturn.outcomes[0];
  const freshAOutcome = freshA.outcomes[0];
  const freshBOutcome = freshB.outcomes[0];
  const prefixesValid = [prefixAInspection, prefixBInspection].every(
    (inspection) =>
      inspection.authorityVerified === true &&
      inspection.historicalEventCount > 0 &&
      inspection.installAdmissionCount === 1 &&
      inspection.workspaceBindingAdmissionCount === 1,
  );
  const prefixClonesExact =
    retained.prefixA.eventLogDigest === retained.freshA.authority.eventLogDigest &&
    prefixBSetup.authority.eventLogDigest === freshBPrefix.authority.eventLogDigest;
  const prefixHashesValid = [
    retained.prefixA.eventLogDigest,
    retained.freshA.authority.eventLogDigest,
    prefixBSetup.authority.eventLogDigest,
    freshBPrefix.authority.eventLogDigest,
  ].every((digest) => /^sha256:[0-9a-f]{64}$/u.test(digest));
  const independentPrefixes =
    retained.prefixA.eventLogDigest !== prefixBSetup.authority.eventLogDigest;
  const requestCarrierEquality = {
    a: retainedA.requestCarrierDigest === freshA.requestCarrierDigest,
    b: retainedB.requestCarrierDigest === freshB.requestCarrierDigest,
  };
  const requestCarrierDigestsValid = [
    retainedA.requestCarrierDigest,
    retainedB.requestCarrierDigest,
    freshA.requestCarrierDigest,
    freshB.requestCarrierDigest,
  ].every((digest) => /^sha256:[0-9a-f]{64}$/u.test(digest));
  const processBoundariesExact =
    new Set([retained.pid, freshAResult.pid, freshBResult.pid]).size === 3;
  const retainedBinding = {
    aIngress: retainedA.requestedIngressEqual,
    aOutcome: retainedA.projectedExtendsRequested,
    bIngress: retainedB.requestedIngressEqual,
    bOutcome: retainedB.projectedExtendsRequested,
    aReturnIngress: retainedAReturn.requestedIngressEqual,
    aReturnOutcome: retainedAReturn.projectedExtendsRequested,
  };
  const freshBinding = {
    aIngress: freshA.requestedIngressEqual,
    aOutcome: freshA.projectedExtendsRequested,
    bIngress: freshB.requestedIngressEqual,
    bOutcome: freshB.projectedExtendsRequested,
  };
  const redObserved =
    prefixASetupSucceeded &&
    prefixBSetupSucceeded &&
    prefixesValid &&
    prefixClonesExact &&
    prefixHashesValid &&
    independentPrefixes &&
    processBoundariesExact &&
    requestCarrierDigestsValid &&
    requestCarrierEquality.a &&
    requestCarrierEquality.b &&
    retainedAOutcome?.disposition === "succeeded" &&
    retainedBOutcome?.disposition === "refused" &&
    retainedAReturnOutcome?.disposition === "succeeded" &&
    retainedBinding.aIngress &&
    retainedBinding.aOutcome &&
    !retainedBinding.bIngress &&
    !retainedBinding.bOutcome &&
    retainedBinding.aReturnIngress &&
    retainedBinding.aReturnOutcome &&
    freshBinding.aIngress &&
    freshBinding.aOutcome &&
    freshBinding.bIngress &&
    freshBinding.bOutcome &&
    freshAOutcome?.disposition === "refused" &&
    freshBOutcome?.disposition === "refused";

  return {
    relationId: "AX-F12",
    claim:
      "each effectful invocation must select its explicitly supplied durable prefix independently of retained context history",
    ingress:
      "installed Public A and B setup/run transcripts through one retained context and two fresh installed worker processes",
    fixtureSource: {
      authority: "accepted census blob efe88cac AX-F12",
      paths: ["A", "B", "A"],
      requestCarrierReuse:
        "retained and fresh workers receive byte-equal effectful A and B invocation carriers over exact independently reopened prefix copies",
    },
    processBoundary:
      "one installed worker alternates A to B to A through one retained Public context; two other installed workers execute equivalent A and B paths in fresh processes",
    mutation:
      "select prefix B after prefix A in a retained context, then return to A, while fresh processes select each prefix independently",
    oracle:
      "every result and append derives only from the explicitly named prefix and is independent of retained context history",
    expectedBaselineSignature:
      "the retained context selects remembered A when B is explicitly requested, while fresh contexts reopen the exact requested prefixes but lack the process-local setup authority",
    observedSignature:
      `retained_a=${outcomeSignature(retainedAOutcome)};retained_b=${outcomeSignature(retainedBOutcome)};return_a=${outcomeSignature(retainedAReturnOutcome)};fresh_a=${outcomeSignature(freshAOutcome)};fresh_b=${outcomeSignature(freshBOutcome)};retained_b_ingress_matches=${retainedBinding.bIngress};retained_b_outcome_matches=${retainedBinding.bOutcome};fresh_ingress_matches=${freshBinding.aIngress && freshBinding.bIngress};prefixes_valid=${prefixesValid};request_a_equal=${requestCarrierEquality.a};request_b_equal=${requestCarrierEquality.b}`,
    disposition: relationDisposition(redObserved),
    cases: [
      {
        caseId: "retained-a-b-a",
        a: outcomeSignature(retainedAOutcome),
        b: outcomeSignature(retainedBOutcome),
        aReturn: outcomeSignature(retainedAReturnOutcome),
        requestedIngress: retainedBinding,
      },
      {
        caseId: "fresh-a",
        outcome: outcomeSignature(freshAOutcome),
        retainedRequestCarrierEqual: requestCarrierEquality.a,
        requestedIngressEqual: freshBinding.aIngress,
        projectedPrefixExtendsRequested: freshBinding.aOutcome,
      },
      {
        caseId: "fresh-b",
        outcome: outcomeSignature(freshBOutcome),
        retainedRequestCarrierEqual: requestCarrierEquality.b,
        requestedIngressEqual: freshBinding.bIngress,
        projectedPrefixExtendsRequested: freshBinding.bOutcome,
      },
    ],
    maskControls: [
      {
        controlId: "two-exact-prefixes-precomputed-and-reopened",
        passed:
          prefixASetupSucceeded &&
          prefixBSetupSucceeded &&
          prefixesValid &&
          prefixClonesExact &&
          prefixHashesValid &&
          independentPrefixes,
      },
      {
        controlId: "identical-request-carriers",
        passed:
          requestCarrierDigestsValid &&
          requestCarrierEquality.a &&
          requestCarrierEquality.b,
      },
      {
        controlId: "real-retained-and-fresh-process-boundaries",
        passed: processBoundariesExact,
      },
      {
        controlId: "requested-prefix-observed-at-ingress-and-outcome",
        passed:
          retainedBinding.aIngress &&
          retainedBinding.aOutcome &&
          !retainedBinding.bIngress &&
          !retainedBinding.bOutcome &&
          retainedBinding.aReturnIngress &&
          retainedBinding.aReturnOutcome &&
          freshBinding.aIngress &&
          freshBinding.aOutcome &&
          freshBinding.bIngress &&
          freshBinding.bOutcome,
      },
    ],
  };
}

async function runAxF13(harness) {
  const scenario = await buildRootCliScenario(harness, "increment-0a-f13");
  const effect = scenario.transcript[2];
  const semanticRefusal = invocation(
    "abg.operation.product.resolve",
    "verified_product_set",
    "invocation://t286/increment-0a-f13/semantic-refusal",
    { verifiedInvocationRefs: ["invocation://t286/increment-0a-f13/absent"] },
  );
  const pureRead = scenario.transcript[5];
  const p1 = await runInstalledWorker(harness, {
    action: "public_transcript",
    phases: [
      { label: "initial", rows: scenario.transcript },
      { label: "effect-retained-retry", rows: [effect] },
      { label: "semantic-first", rows: [semanticRefusal] },
      { label: "semantic-retained-retry", rows: [semanticRefusal] },
      { label: "pure-read-retained-retry", rows: [pureRead] },
    ],
    fullOutcomes: true,
    returnAuthority: true,
  });
  const p2Effect = await runInstalledWorker(harness, {
    action: "public_transcript",
    phases: [{ label: "effect-restarted-retry", rows: [effect] }],
    durableStart: { kind: "reopen", authority: p1.authority },
    returnAuthority: true,
  });
  const p2Semantic = await runInstalledWorker(harness, {
    action: "public_transcript",
    phases: [{ label: "semantic-restarted-retry", rows: [semanticRefusal] }],
    durableStart: { kind: "reopen", authority: p1.authority },
    returnAuthority: true,
  });
  const restartedRead = await runInstalledWorker(harness, {
    action: "public_transcript",
    phases: [{ label: "pure-read-restarted", rows: [pureRead] }],
    durableStart: { kind: "reopen", authority: p1.authority },
    returnAuthority: true,
  });

  const events = await readEvents(scenario.eventLogPath);
  const retainedEffect = phaseOutcome(p1, 1);
  const firstSemantic = phaseOutcome(p1, 2);
  const retainedSemantic = phaseOutcome(p1, 3);
  const retainedRead = phaseOutcome(p1, 4);
  const restartedEffect = phaseOutcome(p2Effect, 0);
  const restartedSemantic = phaseOutcome(p2Semantic, 0);
  const freshRead = phaseOutcome(restartedRead, 0);
  const effectEventCount = eventCountForInvocation(
    events,
    effect.invocationRef,
  );
  const semanticEventCount = eventCountForInvocation(
    events,
    semanticRefusal.invocationRef,
  );
  const pureReadEventCount = eventCountForInvocation(
    events,
    pureRead.invocationRef,
  );
  const pureReadProjectionDigests = {
    initial: p1.phases[0].outcomeProjectionDigests[5],
    retained: p1.phases[4].outcomeProjectionDigests[0],
    restarted: restartedRead.phases[0].outcomeProjectionDigests[0],
  };
  const pureReadCanonicalEquality =
    pureReadProjectionDigests.initial === pureReadProjectionDigests.retained &&
    pureReadProjectionDigests.initial === pureReadProjectionDigests.restarted;
  const redObserved =
    effectEventCount === 1 &&
    retainedEffect?.result?.code === "duplicate_invocation" &&
    restartedEffect?.code === "missing_prerequisite" &&
    firstSemantic?.result?.code === "missing_prerequisite" &&
    retainedSemantic?.result?.code === "duplicate_invocation" &&
    restartedSemantic?.code === "missing_prerequisite" &&
    semanticEventCount === 0 &&
    retainedRead?.result?.code === "duplicate_invocation" &&
    freshRead?.code === "missing_prerequisite" &&
    pureReadEventCount === 1 &&
    !pureReadCanonicalEquality;

  return {
    relationId: "AX-F13",
    claim:
      "invocation identity is admitted-event truth for effects, is not consumed by pre-admission refusal, and does not govern repeatable pure reads",
    ingress:
      "installed Public product.install, product.resolve, and catalog.view calls over one verified/reopened ABG event prefix",
    fixtureSource: {
      authority: "accepted census blob efe88cac AX-F13",
      effect: "the admitted Product installation in the exact root transcript",
      refusal: "a parse-valid resolution naming one absent verified carrier",
      pureRead: "the deterministic catalog view in the exact root transcript",
    },
    processBoundary:
      "P1 admits one effect, one deterministic catalog-view read, and one non-admitted semantic refusal; fresh installed workers reopen the same prefix and retry each exact ref",
    mutation:
      "retry an admitted effect after restart, retry a parse-valid pre-admission refusal in-process and after restart, and repeat one pure read ref",
    oracle:
      "effect retries have one durable duplicate meaning, refusals before admission do not consume identity, and pure reads repeat identically without events",
    expectedBaselineSignature:
      "effect retry changes from duplicate_invocation to missing_prerequisite after restart, the semantic refusal is consumed only in the retained Set, and the deterministic catalog-view read follows the same volatile Set",
    observedSignature:
      `effect_retained=${outcomeSignature(retainedEffect)};effect_restarted=${outcomeSignature(restartedEffect)};semantic_first=${outcomeSignature(firstSemantic)};semantic_retained=${outcomeSignature(retainedSemantic)};semantic_restarted=${outcomeSignature(restartedSemantic)};pure_read_retained=${outcomeSignature(retainedRead)};pure_read_restarted=${outcomeSignature(freshRead)};pure_read_canonical_equal=${pureReadCanonicalEquality}`,
    disposition: relationDisposition(redObserved),
    cases: [
      {
        caseId: "admitted-effect",
        eventCount: effectEventCount,
        retained: outcomeSignature(retainedEffect),
        restarted: outcomeSignature(restartedEffect),
      },
      {
        caseId: "non-admitted-semantic-refusal",
        eventCount: semanticEventCount,
        first: outcomeSignature(firstSemantic),
        retainedRetry: outcomeSignature(retainedSemantic),
        restartedRetry: outcomeSignature(restartedSemantic),
      },
      {
        caseId: "repeatable-pure-read",
        eventCount: pureReadEventCount,
        initial: outcomeSignature(p1.phases[0].outcomes[5]),
        retainedRetry: outcomeSignature(retainedRead),
        restarted: outcomeSignature(freshRead),
        initialRetainedCanonicalEquality:
          pureReadProjectionDigests.initial ===
          pureReadProjectionDigests.retained,
        initialRestartedCanonicalEquality:
          pureReadProjectionDigests.initial ===
          pureReadProjectionDigests.restarted,
        retainedRestartedCanonicalEquality:
          pureReadProjectionDigests.retained ===
          pureReadProjectionDigests.restarted,
        canonicalEquality: pureReadCanonicalEquality,
      },
    ],
    maskControls: [
      {
        controlId: "effect-admission-event-present",
        passed: effectEventCount === 1,
      },
      {
        controlId: "semantic-refusal-parse-valid-and-eventless",
        passed:
          firstSemantic?.result?.code === "missing_prerequisite" &&
          semanticEventCount === 0,
      },
      {
        controlId: "same-verified-prefix-for-retries",
        passed:
          p2Effect.startHistoricalEventCount === events.length &&
          p2Semantic.startHistoricalEventCount === events.length,
      },
      {
        controlId: "deterministic-view-request-valid-before-retry",
        passed:
          p1.phases[0].outcomes[5]?.disposition === "succeeded" &&
          pureReadEventCount === 1,
      },
      {
        controlId: "pure-read-projections-canonicalized",
        passed: Object.values(pureReadProjectionDigests).every(
          (digest) => /^sha256:[0-9a-f]{64}$/u.test(digest),
        ),
      },
    ],
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
  const f13 = await runAxF13(harness);
  return [f01, f02, f12, f13];
}
