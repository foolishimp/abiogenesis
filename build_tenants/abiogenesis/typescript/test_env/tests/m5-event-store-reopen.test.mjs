import assert from "node:assert/strict";
import {
  appendFile,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  AbgEventStore,
  admitRuntimeEvent,
  admitRuntimeEventTransaction,
  reopenEventStore,
  validateHistoricalEvents,
} from "../../build/code/src/abg/event_store.js";
import {
  canonicalJson,
  sha256Canonical,
} from "../../build/code/src/product/index.js";

function workspaceEvent({
  causationEventRefs = [],
  correlationId,
  eventTime,
  invocationRef,
}) {
  return {
    kind: "public_operation_artifact_admitted",
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
      artifactRef: invocationRef,
      artifactDigest: sha256Canonical({ invocationRef }),
      authorityScopeRef: "authority://abiogenesis/m5/reopen",
      authorityScopeDigest: sha256Canonical({
        authorityScopeRef: "authority://abiogenesis/m5/reopen",
      }),
      causationEventRefs,
      correlationId,
      definitionDigest: sha256Canonical({
        operationId: "abg.operation.project.read",
      }),
      definitionKey: "abg.operation.project.read",
      invocationDigest: sha256Canonical({ invocationRef, correlationId }),
      invocationPayloadDigest: sha256Canonical({ invocationRef }),
      invocationRef,
      operationId: "abg.operation.project.read",
      ownerAdmittedDisposition: "admitted",
    },
  };
}

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
  const scratch = await mkdtemp(join(tmpdir(), "abi5-reopen-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const eventLogPath = join(scratch, "events.jsonl");
  const store = new AbgEventStore();
  const first = admitRuntimeEvent(store, workspaceEvent({
    correlationId: "correlation://m5/reopen/first",
    eventTime: "2026-07-24T00:00:00.000Z",
    invocationRef: "invocation://m5/reopen/first",
  }));
  store.configureDurableLog(eventLogPath);
  const bytes = await readFile(eventLogPath);
  const authority = store.projectReopenAuthorityAndClose();
  return { authority, bytes, eventLogPath, first };
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
      new AbgEventStore(),
      { ...invalidPayloadCandidate, payload: { bogus: true } },
    ),
    /payload matches no admitted event-contract variant/u,
  );
  assert.throws(
    () => admitRuntimeEvent(
      new AbgEventStore(),
      { ...invalidPayloadCandidate, undeclaredEnvelopeField: true },
    ),
    /invalid envelope/u,
  );
  assert.throws(
    () => admitRuntimeEvent(
      new AbgEventStore(),
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
      new AbgEventStore(),
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
      new AbgEventStore(),
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
      new AbgEventStore(),
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
