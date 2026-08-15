import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import {
  appendFile,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { createHash } from "node:crypto";
import { syncBuiltinESMExports } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  admitNonEmptyRuntimeEventTransactionAtDurablePrefix,
  admitRuntimeEvent,
  admitRuntimeEventBatch,
  admitRuntimeEventTransaction,
  assertHeldEventStoreAtRuntimeEventPrefix,
  createNewEmptyAppendSink,
  projectRuntimeEventFromValidatedHistory,
  readRuntimeEventsAtDurablePrefix,
  reopenEventStore,
  validateDurablePrefixCoordinate,
  validateHistoricalEvents,
} from "../../build/code/src/abg/event_store.js";
import {
  projectExactPrefixArtifactTruth,
} from "../../build/code/src/abg/artifact_truth.js";
import {
  projectEffectfulPublicInvocationTruthAtPrefix,
} from "../../build/code/src/abg/effectful_invocation_truth.js";
import {
  selectValidatedRuntimeEventPrefix,
} from "../../build/code/src/abg/event_prefix.js";
import {
  canonicalJson,
  sha256Canonical,
} from "../../build/code/src/product/index.js";
import {
  acquireNewEmptyAppendSinkFixture,
  cloneEventPrefixFixture,
} from "../support/new-empty-append-sink.mjs";
import {
  publicOperationBasis,
  setupInstalledRootInvocation,
} from "../support/root-installed-environment.mjs";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const entry212ReopenWorker = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../support/t287-entry212-reopen-worker.mjs",
);

function runEntry212ReopenProbe(input) {
  return new Promise((resolveResult, reject) => {
    const child = spawn(process.execPath, [entry212ReopenWorker], {
      env: { ...process.env, NODE_OPTIONS: "" },
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Entry212 reopen probe failed ${code}: ${stderr}`));
        return;
      }
      try {
        resolveResult(JSON.parse(stdout));
      } catch (error) {
        reject(new Error(
          `Entry212 reopen probe returned invalid JSON: ${String(error)}\n${stdout}\n${stderr}`,
        ));
      }
    });
    child.stdin.end(JSON.stringify(input));
  });
}

function redigestPublicBasis(product, basis, overrides) {
  const candidate = { ...basis, ...overrides };
  candidate.invocationDigest = product.sha256Canonical({
    invocationRef: candidate.invocationRef,
    operationId: candidate.operationId,
    payloadDigest: candidate.invocationPayloadDigest,
  });
  return candidate;
}

async function assertPreEffectRefusalConserved({
  acquired,
  apply,
  environment,
  expectedKind,
  label,
}) {
  const { abg, installedRoot } = environment;
  const store = acquired.store;
  const beforeEvents = store.readAll();
  const beforeStoreDigest = store.digest();
  const beforePrefix = abg.selectHeldEventStoreDurablePrefix(store);
  const beforeArtifactTruth = abg.projectExactPrefixArtifactTruth(beforePrefix);
  const eventLogPath = fileURLToPath(beforePrefix.eventLogRef);
  const beforeBytes = await readFile(eventLogPath);
  const beforeStat = await stat(eventLogPath);
  const beforeByteDigest =
    `sha256:${createHash("sha256").update(beforeBytes).digest("hex")}`;

  const result = apply(store, beforePrefix);
  assert.equal(result.disposition, "refused", `${label}: ${JSON.stringify(result)}`);
  assert.equal(result.kind, expectedKind, `${label}: ${JSON.stringify(result)}`);
  assert.equal(result.refusal?.code ?? result.code, "operation_mismatch");
  if (Object.hasOwn(result, "successorPrefix")) {
    assert.deepEqual(result.successorPrefix, beforePrefix);
  }
  assert.deepEqual(store.readAll(), beforeEvents, `${label}: event count/content`);
  assert.equal(store.digest(), beforeStoreDigest, `${label}: in-memory digest`);
  assert.deepEqual(
    abg.selectHeldEventStoreDurablePrefix(store),
    beforePrefix,
    `${label}: held coordinate`,
  );
  const afterBytes = await readFile(eventLogPath);
  const afterStat = await stat(eventLogPath);
  assert.deepEqual(afterBytes, beforeBytes, `${label}: durable bytes`);
  assert.equal(afterStat.size, beforeStat.size, `${label}: durable byte length`);
  assert.equal(
    `sha256:${createHash("sha256").update(afterBytes).digest("hex")}`,
    beforeByteDigest,
    `${label}: durable byte digest`,
  );
  assert.deepEqual(
    abg.projectExactPrefixArtifactTruth(beforePrefix),
    beforeArtifactTruth,
    `${label}: predecessor projection`,
  );

  const handoff = store.projectReopenAuthorityAndClose();
  assert.deepEqual(handoff.prefix, beforePrefix, `${label}: close coordinate`);
  const fresh = await runEntry212ReopenProbe({
    originProcessId: process.pid,
    installedRoot,
    reopenAuthority: handoff.reopenAuthority,
    prefix: handoff.prefix,
  });
  assert.notEqual(fresh.processId, process.pid);
  assert.deepEqual(fresh.events, beforeEvents, `${label}: PID-2 events`);
  assert.equal(fresh.storeDigest, beforeStoreDigest, `${label}: PID-2 digest`);
  assert.deepEqual(fresh.heldPrefix, beforePrefix, `${label}: PID-2 coordinate`);
  assert.deepEqual(
    fresh.artifactTruth,
    beforeArtifactTruth,
    `${label}: PID-2 predecessor projection`,
  );
  assert.equal(fresh.durableByteLength, beforeBytes.byteLength);
  assert.equal(fresh.durableByteDigest, beforeByteDigest);
  return result;
}

function workspaceEvent({
  causationEventRefs = [],
  correlationId,
  eventTime,
  invocationRef,
}) {
  return {
    kind: "public_operation_admitted",
    eventTime,
    aggregateType: "workspace",
    aggregateId: invocationRef,
    parentAggregateId: null,
    causationEventRefs,
    correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "workspace",
    basisId: "basis://abiogenesis/m5/reopen",
    payload: {
      invocationDigest: sha256Canonical({ invocationRef, correlationId }),
      invocationRef,
      operationId: "abg.operation.project.read",
      variant: "status",
    },
  };
}

function forgedArtifactEventCandidate({
  artifact = {},
  causationEventRefs = [],
  definitionDigest,
  invocationDigest,
  invocationPayloadDigest,
  invocationRef,
  operationId,
  resolvedLock,
  scopeDigest,
  scopeRef,
}) {
  const correlationId = `correlation://m5/forged-artifact/${invocationRef}`;
  return {
    kind: "public_operation_artifact_admitted",
    eventTime: "2026-08-06T00:00:00.000Z",
    aggregateType: "workspace",
    aggregateId: scopeRef,
    parentAggregateId: null,
    causationEventRefs,
    correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "workspace",
    basisId: scopeRef,
    payload: {
      artifact,
      artifactDigest: operationId === "abg.operation.workspace.bind"
        ? scopeDigest
        : sha256Canonical(artifact),
      artifactRef: scopeRef,
      authorityScopeDigest: scopeDigest,
      authorityScopeRef: scopeRef,
      causationEventRefs,
      correlationId,
      definitionDigest,
      definitionKey: operationId,
      invocationDigest,
      invocationPayloadDigest,
      invocationRef,
      operationId,
      ownerAdmittedDisposition: "admitted",
      ...(resolvedLock === undefined ? {} : { resolvedLock }),
    },
  };
}

function runtimeEventCandidate(event) {
  const candidate = structuredClone(event);
  delete candidate.admissionOrdinal;
  delete candidate.eventId;
  delete candidate.payloadDigest;
  return candidate;
}

test("M5 new-empty acquisition returns one genuine readable zero prefix", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-new-empty-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const eventLogPath = join(scratch, "events.jsonl");
  const acquired = createNewEmptyAppendSink({
    kind: "new_empty_append_sink_request",
    schemaVersion: "5.0.0",
    eventLogPath,
  });
  assert.equal("store" in acquired, true, JSON.stringify(acquired));
  assert.equal(validateDurablePrefixCoordinate(acquired.prefix), true);
  assert.equal(acquired.prefix.prefixLength, 0);
  assert.deepEqual(readRuntimeEventsAtDurablePrefix(acquired.prefix), []);
  const closed = acquired.store.projectReopenAuthorityAndClose();
  assert.deepEqual(closed.prefix, acquired.prefix);
  assert.equal(closed.reopenAuthority.eventLogPath, eventLogPath);
});

test("M5 EventStore batch factory interruption leaves the exact prefix unchanged", async (context) => {
  const { store } = await acquireNewEmptyAppendSinkFixture(
    context,
    createNewEmptyAppendSink,
    "abi5-atomic-batch-",
  );
  const before = store.readAll();
  assert.throws(
    () => admitRuntimeEventBatch(store, [
      () => workspaceEvent({
        correlationId: "correlation://m5/atomic-batch/first",
        eventTime: "2026-08-06T00:00:00.000Z",
        invocationRef: "invocation://m5/atomic-batch/first",
      }),
      () => {
        throw new Error("injected closure batch interruption");
      },
    ]),
    /injected closure batch interruption/u,
  );
  assert.deepEqual(store.readAll(), before);
});

test("M5 refuses a same-length durable predecessor mutation before expected-prefix admission", async (context) => {
  const { store } = await acquireNewEmptyAppendSinkFixture(
    context,
    createNewEmptyAppendSink,
    "abi5-same-length-prefix-mutation-",
  );
  admitRuntimeEvent(store, workspaceEvent({
    correlationId: "correlation://m5/prefix-mutation/first",
    eventTime: "2026-08-12T00:00:00.000Z",
    invocationRef: "invocation://m5/prefix-mutation/first",
  }));
  const expectedEvents = store.readAll();
  const eventLogPath = store.configuredDurableLogPath();
  assert.notEqual(eventLogPath, null);
  const original = await readFile(eventLogPath);
  const mutated = Buffer.from(original);
  const marker = Buffer.from("prefix-mutation/first", "utf8");
  const markerOffset = mutated.indexOf(marker);
  assert.notEqual(markerOffset, -1);
  mutated[markerOffset + marker.length - 1] = "x".charCodeAt(0);
  assert.equal(mutated.byteLength, original.byteLength);
  await writeFile(eventLogPath, mutated);
  assert.throws(
    () => assertHeldEventStoreAtRuntimeEventPrefix(store, expectedEvents),
    /durable prefix|payload digest|event identity|restamped or inconsistent history/u,
  );
  assert.deepEqual(store.readAll(), expectedEvents);
});

test("M5 preserves a foreign suffix and poisons the append context instead of truncating ambiguous bytes", async (context) => {
  const { store } = await acquireNewEmptyAppendSinkFixture(
    context,
    createNewEmptyAppendSink,
    "abi5-foreign-suffix-collision-",
  );
  const eventLogPath = store.configuredDurableLogPath();
  assert.notEqual(eventLogPath, null);
  const foreignSuffix = Buffer.from('{"foreign":"suffix"}\n', "utf8");
  const originalWriteSync = fs.writeSync;
  let collisionInjected = false;
  fs.writeSync = (...args) => {
    const written = originalWriteSync(...args);
    const body = args[1];
    if (
      !collisionInjected &&
      Buffer.isBuffer(body) &&
      body.includes(Buffer.from('"workflowVersion":"5.0.0"', "utf8"))
    ) {
      collisionInjected = true;
      originalWriteSync(args[0], foreignSuffix, 0, foreignSuffix.byteLength);
      throw new Error("injected foreign durable suffix collision");
    }
    return written;
  };
  syncBuiltinESMExports();
  try {
    assert.throws(
      () => admitRuntimeEvent(store, workspaceEvent({
        correlationId: "correlation://m5/foreign-suffix/collision",
        eventTime: "2026-08-12T00:00:01.000Z",
        invocationRef: "invocation://m5/foreign-suffix/collision",
      })),
      /could not be proven safe to roll back/u,
    );
  } finally {
    fs.writeSync = originalWriteSync;
    syncBuiltinESMExports();
  }
  assert.equal(collisionInjected, true);
  const retained = await readFile(eventLogPath);
  assert.equal(retained.subarray(-foreignSuffix.byteLength).equals(foreignSuffix), true);
  assert.ok(retained.byteLength > foreignSuffix.byteLength);
  assert.equal(store.readAll().length, 0);
  assert.throws(
    () => admitRuntimeEvent(store, workspaceEvent({
      correlationId: "correlation://m5/foreign-suffix/after-poison",
      eventTime: "2026-08-12T00:00:02.000Z",
      invocationRef: "invocation://m5/foreign-suffix/after-poison",
    })),
    /durable event sink is (?:unavailable|not open for append)/u,
  );
});

test("M5 effectful truth rejects a mechanically valid forged Product install for every query", () => {
  const operationId = "abg.operation.product.install";
  const invocationRef = "invocation://m5/forged-install/carrier";
  const invocationPayloadDigest = sha256Canonical({ invocationRef });
  const definitionDigest = sha256Canonical({
    operationId,
    schemaVersion: "5.0.0",
  });
  const scopeRef = "product-install://m5/forged-install/carrier";
  const forged = projectRuntimeEventFromValidatedHistory(
    [],
    forgedArtifactEventCandidate({
      artifact: {},
      definitionDigest,
      invocationDigest: sha256Canonical({
        invocationRef,
        operationId,
        payloadDigest: invocationPayloadDigest,
      }),
      invocationPayloadDigest,
      invocationRef,
      operationId,
      resolvedLock: {},
      scopeDigest: sha256Canonical({ scopeRef }),
      scopeRef,
    }),
  );
  const prefix = selectValidatedRuntimeEventPrefix(Object.freeze([forged]));
  for (const queryRef of [
    invocationRef,
    "invocation://m5/forged-install/unrelated",
  ]) {
    const truth = projectEffectfulPublicInvocationTruthAtPrefix(prefix, queryRef);
    assert.equal(truth.disposition, "invalid_history", JSON.stringify(truth));
    assert.equal(truth.code, "artifact_truth_invalid");
  }
});

test("M5 effectful truth rejects forged artifact operation identity before query selection", () => {
  const operationId = "abg.operation.product.install";
  const invocationRef = "invocation://m5/forged-install/identity";
  const invocationPayloadDigest = sha256Canonical({ forged: "payload" });
  const scopeRef = "product-install://m5/forged-install/identity";
  const forged = projectRuntimeEventFromValidatedHistory(
    [],
    forgedArtifactEventCandidate({
      artifact: {},
      definitionDigest: sha256Canonical({ forged: "definition" }),
      invocationDigest: sha256Canonical({ forged: "invocation" }),
      invocationPayloadDigest,
      invocationRef,
      operationId,
      resolvedLock: {},
      scopeDigest: sha256Canonical({ scopeRef }),
      scopeRef,
    }),
  );
  const prefix = selectValidatedRuntimeEventPrefix(Object.freeze([forged]));
  for (const queryRef of [
    invocationRef,
    "invocation://m5/forged-install/identity/unrelated",
  ]) {
    const truth = projectEffectfulPublicInvocationTruthAtPrefix(prefix, queryRef);
    assert.equal(truth.disposition, "invalid_history", JSON.stringify(truth));
    assert.equal(truth.code, "artifact_truth_invalid");
  }
});

test("M5 exact owner projections preserve valid facts, conflicts, and whole-prefix masking", async (context) => {
  const environment = await setupInstalledRootInvocation(context, packageRoot);
  const events = environment.store.readAll();
  const [
    installEvent,
    bindingEvent,
    publicRunEvent,
    invocationOwnerEvent,
  ] = events;
  assert.equal(
    installEvent?.payload.operationId,
    "abg.operation.product.install",
  );
  assert.equal(
    bindingEvent?.payload.operationId,
    "abg.operation.workspace.bind",
  );
  assert.equal(
    publicRunEvent?.payload.operationId,
    "abg.operation.run.invoke",
  );
  assert.equal(invocationOwnerEvent?.kind, "invocation_admitted");

  const artifactBasisCases = [
    {
      label: "install malformed digest",
      operationId: "abg.operation.product.install",
      startingEvents: [],
      mutate: (basis) => redigestPublicBasis(environment.product, basis, {
        invocationPayloadDigest: "x",
      }),
    },
    {
      label: "install empty identity",
      operationId: "abg.operation.product.install",
      startingEvents: [],
      mutate: (basis) => redigestPublicBasis(environment.product, basis, {
        invocationRef: "",
      }),
    },
    {
      label: "bind malformed digest",
      operationId: "abg.operation.workspace.bind",
      startingEvents: [installEvent],
      mutate: (basis) => redigestPublicBasis(environment.product, basis, {
        invocationPayloadDigest: "x",
      }),
    },
    {
      label: "bind empty identity",
      operationId: "abg.operation.workspace.bind",
      startingEvents: [installEvent],
      mutate: (basis) => ({ ...basis, authorityScopeRef: "" }),
    },
  ];
  for (const basisCase of artifactBasisCases) {
    const acquired = basisCase.startingEvents.length === 0
      ? await acquireNewEmptyAppendSinkFixture(
          context,
          environment.abg.createNewEmptyAppendSink,
          `abi5-entry212-${basisCase.label.replaceAll(" ", "-")}-`,
        )
      : await cloneEventPrefixFixture(
          context,
          environment.abg,
          { admitRuntimeEvent },
          basisCase.startingEvents,
          `abi5-entry212-${basisCase.label.replaceAll(" ", "-")}-`,
        );
    const predecessorPrefix = environment.abg
      .selectHeldEventStoreDurablePrefix(acquired.store);
    const isInstall = basisCase.operationId ===
      "abg.operation.product.install";
    const candidate = isInstall
      ? environment.installCandidate
      : environment.bindingCandidate;
    const base = {
      ...publicOperationBasis(
        environment.product,
        basisCase.operationId,
        isInstall ? candidate.installId : candidate.bindingId,
        isInstall ? candidate.productContentDigest : candidate.bindingDigest,
        `invocation://m5/entry212/${basisCase.label.replaceAll(" ", "-")}`,
        isInstall ? [] : [environment.admittedInstall.admissionEventRef],
      ),
      predecessorPrefix,
    };
    await assertPreEffectRefusalConserved({
      acquired,
      environment,
      expectedKind: "artifact_owner_refusal",
      label: basisCase.label,
      apply: (store) => isInstall
        ? environment.abg.admitProductInstall(
            store,
            candidate,
            basisCase.mutate(base),
            environment.lock,
          )
        : environment.abg.admitWorkspaceBinding(
            store,
            candidate,
            basisCase.mutate(base),
            environment.workspaceAuthority,
          ),
    });
  }

  for (const runCase of [
    {
      label: "run malformed digest",
      mutate: (basis) => redigestPublicBasis(environment.product, basis, {
        invocationPayloadDigest: "x",
      }),
    },
    {
      label: "run empty identity",
      mutate: (basis) => redigestPublicBasis(environment.product, basis, {
        invocationRef: "",
      }),
    },
  ]) {
    const acquired = await cloneEventPrefixFixture(
      context,
      environment.abg,
      { admitRuntimeEvent },
      [installEvent, bindingEvent],
      `abi5-entry212-${runCase.label.replaceAll(" ", "-")}-`,
    );
    const runBasis = publicOperationBasis(
      environment.product,
      "abg.operation.run.invoke",
      environment.workspaceBinding.bindingId,
      environment.workspaceBinding.bindingDigest,
      `invocation://m5/entry212/${runCase.label.replaceAll(" ", "-")}`,
      [environment.workspaceBinding.admissionEventRef],
    );
    await assertPreEffectRefusalConserved({
      acquired,
      environment,
      expectedKind: "abg_admission_refusal",
      label: runCase.label,
      apply: (store) => environment.abg.admitInvocation(
        store,
        {
          invocation: environment.invocation,
          rawRequest: environment.rawRequest,
          rawInput: environment.rawInput,
          modulePublication: environment.publication,
          program: environment.program,
          graphFunction: environment.graphFunction,
          programValidation: environment.programValidation,
          workspaceBinding: environment.workspaceBinding,
          artifactTruth: environment.artifactTruth,
          catalogView: environment.catalogView,
          policy: environment.policy,
          capabilityGrants: [environment.capabilityGrant],
          authority: environment.invocationAuthority,
        },
        runCase.mutate(runBasis),
      ),
    });
  }

  async function projectHistoricalPair(secondEvent) {
    const acquired = await acquireNewEmptyAppendSinkFixture(
      context,
      createNewEmptyAppendSink,
      "abi5-artifact-history-conflict-",
    );
    acquired.store.closeDurableLog();
    const bytes = Buffer.from(
      `${canonicalJson(installEvent)}\n${canonicalJson(secondEvent)}\n`,
      "utf8",
    );
    const eventLogPath = fileURLToPath(acquired.prefix.eventLogRef);
    await writeFile(eventLogPath, bytes);
    const {
      coordinateDigest: _coordinateDigest,
      ...emptyCoordinateBody
    } = acquired.prefix;
    const coordinateBody = {
      ...emptyCoordinateBody,
      prefixLength: bytes.byteLength,
      prefixDigest:
        `sha256:${createHash("sha256").update(bytes).digest("hex")}`,
    };
    const coordinate = {
      ...coordinateBody,
      coordinateDigest: sha256Canonical(coordinateBody),
    };
    return projectExactPrefixArtifactTruth(coordinate);
  }

  const conflictingBindingCandidate = runtimeEventCandidate(bindingEvent);
  conflictingBindingCandidate.payload.invocationRef =
    installEvent.payload.invocationRef;
  conflictingBindingCandidate.payload.invocationDigest = sha256Canonical({
    invocationRef: conflictingBindingCandidate.payload.invocationRef,
    operationId: conflictingBindingCandidate.payload.operationId,
    payloadDigest: conflictingBindingCandidate.payload.invocationPayloadDigest,
  });
  const conflictingBinding = projectRuntimeEventFromValidatedHistory(
    [installEvent],
    conflictingBindingCandidate,
  );
  const conflict = await projectHistoricalPair(
    conflictingBinding,
  );
  assert.equal(
    conflict.kind,
    "exact_prefix_artifact_truth_projection_refusal",
  );
  assert.equal(conflict.code, "artifact_truth_history_conflict");
  assert.equal(conflict.authorityScopeRef, bindingEvent.payload.authorityScopeRef);
  assert.ok(conflict.conflictingFields.includes("operationId"));
  assert.ok(conflict.conflictingFields.includes("authorityScopeRef"));

  const repeatedInstall = projectRuntimeEventFromValidatedHistory(
    [installEvent],
    runtimeEventCandidate(installEvent),
  );
  const duplicate = await projectHistoricalPair(
    repeatedInstall,
  );
  assert.equal(
    duplicate.kind,
    "exact_prefix_artifact_truth_projection_refusal",
  );
  assert.equal(duplicate.code, "duplicate_artifact_admission");
  assert.equal(
    duplicate.authorityScopeRef,
    installEvent.payload.authorityScopeRef,
  );
  assert.deepEqual(duplicate.conflictingFields, []);

  const validPrefix = environment.abg.selectValidatedRuntimeEventPrefix(events);
  const validRunTruth =
    environment.abg.projectEffectfulPublicInvocationTruthAtPrefix(
      validPrefix,
      environment.invocation.publicRequestInvocationRef,
    );
  assert.equal(validRunTruth.disposition, "duplicate", JSON.stringify(validRunTruth));
  assert.equal(
    validRunTruth.priorAdmission.operationId,
    "abg.operation.run.invoke",
  );

  const forgedAuthorityRef = "invocation-authority://m5/forged-run-coordinate";
  const forgedDefinitionRef = "graph-function://m5/forged-run-coordinate";
  const forgedPublicCandidate = runtimeEventCandidate(publicRunEvent);
  forgedPublicCandidate.basisId = forgedAuthorityRef;
  Object.assign(forgedPublicCandidate.payload, {
    authorityRef: forgedAuthorityRef,
    authorityDigest: sha256Canonical({ forgedAuthorityRef }),
    selectedDefinitionRef: forgedDefinitionRef,
    selectedDefinitionDigest: sha256Canonical({ forgedDefinitionRef }),
  });
  const forgedPublicEvent = projectRuntimeEventFromValidatedHistory(
    [installEvent, bindingEvent],
    forgedPublicCandidate,
  );
  const forgedOwnerCandidate = runtimeEventCandidate(invocationOwnerEvent);
  forgedOwnerCandidate.causationEventRefs = [forgedPublicEvent.eventId];
  const forgedOwnerEvent = projectRuntimeEventFromValidatedHistory(
    [installEvent, bindingEvent, forgedPublicEvent],
    forgedOwnerCandidate,
  );
  const forgedRunPrefix =
    environment.abg.selectValidatedRuntimeEventPrefix(Object.freeze([
      installEvent,
      bindingEvent,
      forgedPublicEvent,
      forgedOwnerEvent,
    ]));
  assert.equal(
    environment.abg.rehydrateInvocationAdmissionAtPrefix(
      forgedRunPrefix,
      invocationOwnerEvent.payload.invocationAdmissionRef,
    ),
    null,
  );
  for (const queryRef of [
    environment.invocation.publicRequestInvocationRef,
    "invocation://m5/forged-run-coordinate/unrelated",
  ]) {
    const truth = environment.abg.projectEffectfulPublicInvocationTruthAtPrefix(
      forgedRunPrefix,
      queryRef,
    );
    assert.equal(truth.disposition, "invalid_history", JSON.stringify(truth));
    assert.equal(truth.code, "invocation_pair_invalid");
  }

  const emptyOuterOwnerCandidate = runtimeEventCandidate(invocationOwnerEvent);
  emptyOuterOwnerCandidate.payload.publicRequestInvocationRef = "";
  const {
    invocationAdmissionDigest: _emptyOuterAdmissionDigest,
    invocationAdmissionRef: _emptyOuterAdmissionRef,
    ...emptyOuterAdmissionBody
  } = emptyOuterOwnerCandidate.payload;
  const emptyOuterAdmissionDigest = sha256Canonical(
    emptyOuterAdmissionBody,
  );
  const emptyOuterAdmissionRef =
    `invocation-admission://abiogenesis/${
      emptyOuterAdmissionDigest.slice("sha256:".length)
    }`;
  emptyOuterOwnerCandidate.basisId = emptyOuterAdmissionRef;
  emptyOuterOwnerCandidate.payload.invocationAdmissionDigest =
    emptyOuterAdmissionDigest;
  emptyOuterOwnerCandidate.payload.invocationAdmissionRef =
    emptyOuterAdmissionRef;
  const emptyOuterOwnerEvent = projectRuntimeEventFromValidatedHistory(
    [installEvent, bindingEvent, publicRunEvent],
    emptyOuterOwnerCandidate,
  );
  const emptyOuterPrefix =
    environment.abg.selectValidatedRuntimeEventPrefix(Object.freeze([
      installEvent,
      bindingEvent,
      publicRunEvent,
      emptyOuterOwnerEvent,
    ]));
  assert.equal(
    environment.abg.rehydrateInvocationAdmissionAtPrefix(
      emptyOuterPrefix,
      emptyOuterAdmissionRef,
    ),
    null,
  );
  const emptyOuterTruth =
    environment.abg.projectEffectfulPublicInvocationTruthAtPrefix(
      emptyOuterPrefix,
      "invocation://m5/empty-outer-owner/unrelated",
    );
  assert.equal(
    emptyOuterTruth.disposition,
    "invalid_history",
    JSON.stringify(emptyOuterTruth),
  );
  assert.equal(emptyOuterTruth.code, "invocation_pair_invalid");

  const collisionOwnerCandidate = runtimeEventCandidate(invocationOwnerEvent);
  collisionOwnerCandidate.payload.publicRequestInvocationRef =
    installEvent.payload.invocationRef;
  const {
    invocationAdmissionDigest: _invocationAdmissionDigest,
    invocationAdmissionRef: _invocationAdmissionRef,
    ...collisionAdmissionBody
  } = collisionOwnerCandidate.payload;
  const collisionAdmissionDigest = sha256Canonical(collisionAdmissionBody);
  const collisionAdmissionRef =
    `invocation-admission://abiogenesis/${
      collisionAdmissionDigest.slice("sha256:".length)
    }`;
  collisionOwnerCandidate.basisId = collisionAdmissionRef;
  collisionOwnerCandidate.payload.invocationAdmissionDigest =
    collisionAdmissionDigest;
  collisionOwnerCandidate.payload.invocationAdmissionRef =
    collisionAdmissionRef;
  const collisionOwnerEvent = projectRuntimeEventFromValidatedHistory(
    [installEvent, bindingEvent, publicRunEvent],
    collisionOwnerCandidate,
  );
  const collisionPrefix =
    environment.abg.selectValidatedRuntimeEventPrefix(Object.freeze([
      installEvent,
      bindingEvent,
      publicRunEvent,
      collisionOwnerEvent,
    ]));
  assert.ok(
    environment.abg.rehydrateInvocationAdmissionAtPrefix(
      collisionPrefix,
      collisionAdmissionRef,
    ),
    "the colliding run fact remains one complete owner-issued admission",
  );
  const crossKindCollision =
    environment.abg.projectEffectfulPublicInvocationTruthAtPrefix(
      collisionPrefix,
      "invocation://m5/cross-kind-collision/unrelated",
    );
  assert.equal(
    crossKindCollision.disposition,
    "invalid_history",
    JSON.stringify(crossKindCollision),
  );
  assert.equal(crossKindCollision.code, "duplicate_outer_invocation");
});

function runScopedEvent(kind, aggregateType, aggregateId, payload) {
  return {
    kind,
    eventTime: "2026-07-24T00:00:04.000Z",
    aggregateType,
    aggregateId,
    parentAggregateId: null,
    causationEventRefs: [],
    correlationId: "correlation://m5/reopen/variant",
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: "basis://abiogenesis/m5/reopen",
    runId: "run://m5/reopen/variant",
    graphFunctionRef: "graph-function://m5/reopen/variant",
    materializationRef: "materialization://m5/reopen/variant",
    graphCallId: "graph-call://m5/reopen/variant",
    frameId: "frame://m5/reopen/variant",
    payload,
  };
}

async function durablePrefix(context) {
  const acquired = await acquireNewEmptyAppendSinkFixture(
    context,
    createNewEmptyAppendSink,
    "abi5-reopen-",
  );
  const { store } = acquired;
  const eventLogPath = fileURLToPath(acquired.prefix.eventLogRef);
  const first = admitRuntimeEvent(store, workspaceEvent({
    correlationId: "correlation://m5/reopen/first",
    eventTime: "2026-07-24T00:00:00.000Z",
    invocationRef: "invocation://m5/reopen/first",
  }));
  const bytes = await readFile(eventLogPath);
  const handoff = store.projectReopenAuthorityAndClose();
  return {
    authority: handoff.reopenAuthority,
    bytes,
    eventLogPath,
    first,
    prefix: handoff.prefix,
  };
}

test("M5 reopens one exact durable prefix without restamping and appends at max ordinal plus one", async (context) => {
  const prefix = await durablePrefix(context);
  const serializedAuthority = JSON.parse(JSON.stringify(prefix.authority));
  const reopened = reopenEventStore(serializedAuthority);
  assert.equal(reopened.kind, "reopened_event_store_context", JSON.stringify(reopened));
  assert.equal(reopened.historicalEventCount, 1);
  assert.equal(reopened.maxAdmissionOrdinal, 1);
  assert.equal(reopened.nextAdmissionOrdinal, 2);
  assert.deepEqual(reopened.store.readAll(), [prefix.first]);

  const second = admitRuntimeEvent(reopened.store, workspaceEvent({
    causationEventRefs: [prefix.first.eventId],
    correlationId: "correlation://m5/reopen/second",
    eventTime: "2026-07-24T00:00:01.000Z",
    invocationRef: "invocation://m5/reopen/second",
  }));
  assert.equal(second.admissionOrdinal, 2);
  const finalBytes = await readFile(prefix.eventLogPath);
  assert.equal(
    finalBytes.subarray(0, prefix.bytes.byteLength).equals(prefix.bytes),
    true,
  );
  const rows = finalBytes
    .toString("utf8")
    .split(/\r?\n/u)
    .filter((line) => line.length !== 0)
    .map((line) => JSON.parse(line));
  assert.deepEqual(rows, [prefix.first, second]);
  reopened.store.closeDurableLog();
});

test("M5 rolls back an incomplete atomic F_H hold admission without a replay-visible prefix", async (context) => {
  const prefix = await durablePrefix(context);
  const reopened = reopenEventStore(prefix.authority);
  assert.equal(reopened.kind, "reopened_event_store_context");
  const beforeEvents = reopened.store.readAll();
  const beforeBytes = await readFile(prefix.eventLogPath);

  assert.throws(
    () => admitRuntimeEventTransaction(reopened.store, () => {
      const pending = admitRuntimeEvent(reopened.store, workspaceEvent({
        causationEventRefs: [prefix.first.eventId],
        correlationId: "correlation://m5/reopen/fh-pending",
        eventTime: "2026-07-24T00:00:01.000Z",
        invocationRef: "invocation://m5/reopen/fh-pending",
      }));
      admitRuntimeEvent(reopened.store, workspaceEvent({
        causationEventRefs: [pending.eventId],
        correlationId: "correlation://m5/reopen/fh-hold",
        eventTime: "2026-07-24T00:00:02.000Z",
        invocationRef: "invocation://m5/reopen/fh-hold",
      }));
      throw new TypeError("injected failure before continuation open");
    }),
    /injected failure before continuation open/u,
  );

  assert.deepEqual(reopened.store.readAll(), beforeEvents);
  assert.deepEqual(await readFile(prefix.eventLogPath), beforeBytes);
  const admitted = admitRuntimeEvent(reopened.store, workspaceEvent({
    causationEventRefs: [prefix.first.eventId],
    correlationId: "correlation://m5/reopen/after-rollback",
    eventTime: "2026-07-24T00:00:03.000Z",
    invocationRef: "invocation://m5/reopen/after-rollback",
  }));
  assert.equal(admitted.admissionOrdinal, 2);
  reopened.store.closeDurableLog();
});

test("M5 exact-prefix two-stage transaction rolls back its first stage when second staging fails", async (context) => {
  const prefix = await durablePrefix(context);
  const reopened = reopenEventStore(prefix.authority);
  assert.equal(reopened.kind, "reopened_event_store_context");
  const beforeEvents = reopened.store.readAll();
  const beforeDigest = reopened.store.digest();
  const beforeBytes = await readFile(prefix.eventLogPath);
  let stagedBindingEvent = null;

  assert.throws(
    () => admitNonEmptyRuntimeEventTransactionAtDurablePrefix(
      reopened.store,
      prefix.prefix,
      () => {
        stagedBindingEvent = admitRuntimeEvent(reopened.store, workspaceEvent({
          causationEventRefs: [prefix.first.eventId],
          correlationId: "correlation://m5/reopen/actor-binding-stage",
          eventTime: "2026-07-24T00:00:01.000Z",
          invocationRef: "invocation://m5/reopen/actor-binding-stage",
        }));
        admitRuntimeEvent(reopened.store, {
          ...workspaceEvent({
            causationEventRefs: [stagedBindingEvent.eventId],
            correlationId: "correlation://m5/reopen/actor-start-stage",
            eventTime: "2026-07-24T00:00:02.000Z",
            invocationRef: "invocation://m5/reopen/actor-start-stage",
          }),
          payload: {},
        });
        return Object.freeze({ stagedBindingEvent });
      },
    ),
    /payload/u,
  );

  assert.equal(stagedBindingEvent?.admissionOrdinal, 2);
  assert.deepEqual(reopened.store.readAll(), beforeEvents);
  assert.equal(reopened.store.digest(), beforeDigest);
  assert.deepEqual(await readFile(prefix.eventLogPath), beforeBytes);
  reopened.store.closeDurableLog();
});

test("M5 durable reopen refuses changed prefix bytes without changing replay truth", async (context) => {
  const prefix = await durablePrefix(context);
  await appendFile(prefix.eventLogPath, "{}\n", "utf8");
  const before = await readFile(prefix.eventLogPath);
  const result = reopenEventStore(prefix.authority);
  assert.equal(result.kind, "event_store_reopen_refusal");
  assert.equal(result.code, "durable_log_mismatch");
  assert.deepEqual(await readFile(prefix.eventLogPath), before);
});

test("M5 durable reopen refuses a second active append owner", async (context) => {
  const prefix = await durablePrefix(context);
  const firstOwner = reopenEventStore(prefix.authority);
  assert.equal(firstOwner.kind, "reopened_event_store_context");
  const result = reopenEventStore(prefix.authority);
  assert.equal(result.kind, "event_store_reopen_refusal");
  assert.equal(result.code, "sink_unavailable");
  assert.deepEqual(firstOwner.store.readAll(), [prefix.first]);
  firstOwner.store.closeDurableLog();
});

test("M5 durable reopen refuses a modified authority carrier", async (context) => {
  const prefix = await durablePrefix(context);
  const result = reopenEventStore({
    ...prefix.authority,
    eventLogPath: `${prefix.eventLogPath}.substituted`,
  });
  assert.equal(result.kind, "event_store_reopen_refusal");
  assert.equal(result.code, "basis_mismatch");
});

test("M5 durable reopen does not steal ownership from an abandoned lock", async (context) => {
  const prefix = await durablePrefix(context);
  const identity = await stat(prefix.eventLogPath);
  const lockPath = join(
    tmpdir(),
    "abiogenesis-event-store-locks-v5",
    `${identity.dev}-${identity.ino}.lock`,
  );
  context.after(async () => rm(lockPath, { force: true }));
  await writeFile(
    lockPath,
    `${canonicalJson({
      kind: "abiogenesis_event_store_append_lock",
      schemaVersion: "5.0.0",
      device: identity.dev,
      inode: identity.ino,
      ownerPid: 2_147_483_647,
    })}\n`,
    { encoding: "utf8", flag: "wx" },
  );
  const result = reopenEventStore(prefix.authority);
  assert.equal(result.kind, "event_store_reopen_refusal");
  assert.equal(result.code, "sink_unavailable");
  assert.match(result.message, /explicit operator recovery/u);
});

test("M5 reopened append refuses sink drift before admitting another event", async (context) => {
  const prefix = await durablePrefix(context);
  const reopened = reopenEventStore(prefix.authority);
  assert.equal(reopened.kind, "reopened_event_store_context", JSON.stringify(reopened));
  await appendFile(prefix.eventLogPath, "{}\n", "utf8");
  assert.throws(
    () => admitRuntimeEvent(reopened.store, workspaceEvent({
      causationEventRefs: [prefix.first.eventId],
      correlationId: "correlation://m5/reopen/drift",
      eventTime: "2026-07-24T00:00:02.000Z",
      invocationRef: "invocation://m5/reopen/drift",
    })),
    /identity or append position changed/u,
  );
  assert.equal(reopened.store.readAll().length, 1);
  reopened.store.closeDurableLog();
});

test("M5 event contract refuses blank history and malformed kind/scope/payload variants", async (context) => {
  const prefix = await durablePrefix(context);
  const { store: invalidStore } = await acquireNewEmptyAppendSinkFixture(
    context,
    createNewEmptyAppendSink,
    "abi5-invalid-event-",
  );
  assert.throws(
    () => validateHistoricalEvents(
      Buffer.concat([prefix.bytes, Buffer.from("\n", "utf8")]),
    ),
    /blank record/u,
  );

  const invalidVariant = {
    ...prefix.first,
    aggregateType: "run",
    aggregateId: "run://m5/forged",
    scopeClass: "run",
    runId: undefined,
    payload: { bogus: true },
  };
  delete invalidVariant.runId;
  const invalidVariantBytes = Buffer.from(
    `${canonicalJson(invalidVariant)}\n`,
    "utf8",
  );
  assert.throws(
    () => validateHistoricalEvents(invalidVariantBytes),
    /kind, aggregate type, and scope class/u,
  );

  const invalidPayloadCandidate = workspaceEvent({
    correlationId: "correlation://m5/reopen/invalid-payload",
    eventTime: "2026-07-24T00:00:03.000Z",
    invocationRef: "invocation://m5/reopen/invalid-payload",
  });
  assert.throws(
    () => admitRuntimeEvent(
      invalidStore,
      { ...invalidPayloadCandidate, payload: { bogus: true } },
    ),
    /payload matches no admitted event-contract variant/u,
  );
  assert.throws(
    () => admitRuntimeEvent(
      invalidStore,
      { ...invalidPayloadCandidate, undeclaredEnvelopeField: true },
    ),
    /invalid envelope/u,
  );
  assert.throws(
    () => admitRuntimeEvent(
      invalidStore,
      {
        ...invalidPayloadCandidate,
        payload: {
          ...invalidPayloadCandidate.payload,
          undeclaredPayloadField: true,
        },
      },
    ),
    /payload matches no admitted event-contract variant/u,
  );

  const digest = sha256Canonical({ kind: "m5-event-variant" });
  assert.throws(
    () => admitRuntimeEvent(
      invalidStore,
      runScopedEvent(
        "child_preparation_refused",
        "c_call",
        "c-call://m5/reopen/variant",
        {
          applicationRef: "application://m5/reopen/variant",
          childGraphFunctionRef: "graph-function://m5/reopen/child",
          diagnosticRef: "diagnostic://m5/reopen/variant",
          inputDigest: digest,
          inputRef: "input://m5/reopen/variant",
          message: "refused",
          parentCCallRef: "c-call://m5/reopen/variant",
          parentJudgmentRef: "judgment://m5/reopen/variant",
          refusalDigest: digest,
          refusalRef: "refusal://m5/reopen/variant",
          sourceCursorRef: "cursor://m5/reopen/variant",
          stage: "child_preparation",
        },
      ),
    ),
    /payload matches no admitted event-contract variant/u,
  );
  assert.throws(
    () => admitRuntimeEvent(
      invalidStore,
      runScopedEvent(
        "runtime_failure_observed",
        "run",
        "run://m5/reopen/variant",
        {
          cCallRef: "c-call://m5/reopen/variant",
          code: "closure_refused",
          failureClass: "closure_refused",
          subjectDigest: digest,
        },
      ),
    ),
    /payload matches no admitted event-contract variant/u,
  );
  assert.throws(
    () => admitRuntimeEvent(
      invalidStore,
      runScopedEvent(
        "terminal_reached",
        "frame",
        "frame://m5/reopen/variant",
        {
          cCallRef: "c-call://m5/reopen/variant",
          childFrameId: "frame://m5/reopen/child",
          closureContractDigest: digest,
          closureContractRef: "contract://m5/reopen/closure",
          closureDigest: digest,
          closureRef: "closure://m5/reopen/variant",
          judgmentRef: "judgment://m5/reopen/variant",
          resultRef: "result://m5/reopen/variant",
          routeRef: "route://m5/reopen/variant",
          terminalKind: "completed",
        },
      ),
    ),
    /payload matches no admitted event-contract variant/u,
  );
});
