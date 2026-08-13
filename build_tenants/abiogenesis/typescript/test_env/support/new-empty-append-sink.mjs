import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export async function acquireNewEmptyAppendSinkResource(
  createNewEmptyAppendSink,
  label = "abi5-event-store-",
) {
  const scratch = await mkdtemp(join(tmpdir(), label));
  const eventLogPath = join(scratch, "events.jsonl");
  const acquired = createNewEmptyAppendSink({
    kind: "new_empty_append_sink_request",
    schemaVersion: "5.0.0",
    eventLogPath,
  });
  if (!("store" in acquired)) {
    await rm(scratch, { force: true, recursive: true });
    throw new TypeError(
      `new-empty fixture acquisition refused: ${acquired.code}: ${acquired.message}`,
    );
  }
  const dispose = async () => {
    acquired.store.closeDurableLog();
    await rm(scratch, { force: true, recursive: true });
  };
  return { ...acquired, dispose };
}

export async function acquireNewEmptyAppendSinkFixture(
  context,
  createNewEmptyAppendSink,
  label = "abi5-event-store-",
) {
  const acquired = await acquireNewEmptyAppendSinkResource(
    createNewEmptyAppendSink,
    label,
  );
  context.after(acquired.dispose);
  return acquired;
}

export async function cloneEventPrefixResource(
  abg,
  eventStore,
  events,
  label = "abi5-event-prefix-clone-",
) {
  const acquired = await acquireNewEmptyAppendSinkResource(
    abg.createNewEmptyAppendSink,
    label,
  );
  try {
    let predecessorPrefix = acquired.prefix;
    for (const expected of events) {
      if (expected.kind === "public_operation_artifact_admitted") {
        const payload = expected.payload;
        const basis = {
          operationId: payload.operationId,
          memberKey: payload.memberKey,
          definitionDigest: payload.definitionDigest,
          authorityScopeRef: payload.authorityScopeRef,
          authorityScopeDigest: payload.authorityScopeDigest,
          invocationRef: payload.invocationRef,
          invocationPayloadDigest: payload.invocationPayloadDigest,
          invocationDigest: payload.invocationDigest,
          correlationId: payload.correlationId,
          eventTime: expected.eventTime,
          causationEventRefs: payload.causationEventRefs,
          predecessorPrefix,
        };
        let admitted;
        if (payload.operationId === "abg.operation.product.install") {
          admitted = abg.admitProductInstall(
            acquired.store,
            structuredClone(payload.artifact),
            basis,
            structuredClone(payload.resolvedLock),
          );
        } else if (payload.operationId === "abg.operation.workspace.bind") {
          admitted = abg.admitWorkspaceBinding(
            acquired.store,
            structuredClone(payload.artifact),
            basis,
            structuredClone(payload.workspaceAuthorityBasis),
          );
        } else {
          throw new TypeError(
            `event-prefix owner clone encountered closed operation ${String(payload.operationId)}`,
          );
        }
        if (
          admitted.kind !== "artifact_owner_result" ||
          admitted.admissionEventRef !== expected.eventId
        ) {
          throw new TypeError(
            `event-prefix owner clone diverged: ${JSON.stringify(admitted)}`,
          );
        }
        predecessorPrefix = admitted.successorPrefix;
        continue;
      }
      const candidate = structuredClone(expected);
      delete candidate.eventId;
      delete candidate.admissionOrdinal;
      delete candidate.payloadDigest;
      const admitted = eventStore.admitRuntimeEvent(acquired.store, candidate);
      if (admitted.eventId !== expected.eventId) {
        throw new TypeError(
          `event-prefix runtime clone diverged at ${expected.eventId}`,
        );
      }
    }
    return acquired;
  } catch (error) {
    await acquired.dispose();
    throw error;
  }
}

export async function cloneEventPrefixFixture(
  context,
  abg,
  eventStore,
  events,
  label = "abi5-event-prefix-clone-",
) {
  const acquired = await cloneEventPrefixResource(
    abg,
    eventStore,
    events,
    label,
  );
  context.after(acquired.dispose);
  return acquired;
}
