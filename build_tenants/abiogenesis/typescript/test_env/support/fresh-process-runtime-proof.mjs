import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, realpath, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const worker = resolve(
  here,
  "../falsifiers/runtime-retained-projections-worker.mjs",
);

function observeRetained(abg, product, store, requests, durablePrefix) {
  return requests.map((request) => {
    if (request.availability === "blocked_migration") {
      return {
        rowId: request.rowId,
        availability: "unavailable",
        disposition: "red",
        reason: request.reason,
      };
    }
    const owner = request.owner === "product" ? product : abg;
    const projector = owner[request.exportName];
    assert.equal(
      typeof projector,
      "function",
      `installed ABG export ${request.exportName} is unavailable`,
    );
    const projection = request.owner === "product"
      ? projector(...(request.args ?? []))
      : request.input === "durable_prefix"
      ? projector(durablePrefix, ...(request.args ?? []))
      : request.input === "validated_run_prefix"
      ? projector(
          abg.selectValidatedRuntimeEventPrefix(
            store.readAll(),
            request.prefixScope,
          ),
          ...(request.args ?? []),
        )
      : projector(store, ...(request.args ?? []));
    return {
      rowId: request.rowId,
      availability: "available",
      disposition: "green",
      projection,
    };
  });
}

function evidenceError(error) {
  if (error === null || error === undefined) return null;
  return { name: error.name, message: error.message, stack: error.stack,
    code: error.code, errno: error.errno, syscall: error.syscall };
}

const evidenceJson = (value) => `${JSON.stringify(value, (_key, item) =>
  typeof item === "bigint" ? item.toString() : item, 2)}\n`;

// Every fresh replay uses the exact installed physical owner. Optional evidence
// retention changes only writes, never process ownership or cleanup.
async function runFreshWorker(input, evidenceRoot, ordinal) {
  const root = evidenceRoot === undefined ? null : join(evidenceRoot, String(ordinal));
  if (root !== null) await mkdir(root);
  const retain = async (name, bytes) => {
    if (root !== null) await writeFile(join(root, name), bytes, { flag: "wx" });
  };
  const stdin = JSON.stringify(input);
  await retain("input.json", stdin);
  const modulePath = join(input.installedPackageRoot,
    "build/code/src/shared/owned_process_lifetime.js");
  const { createOwnedProcessLifetime, createMonotonicDeadline } =
    await import(pathToFileURL(modulePath).href);
  assert.equal(typeof createOwnedProcessLifetime, "function");
  assert.equal(typeof createMonotonicDeadline, "function");
  const detached = process.platform !== "win32";
  const launch = { executable: process.execPath, args: [worker], detached,
    timeoutMs: 30_000, terminationGraceMs: 1_000, modulePath };
  await retain("launch.json", evidenceJson(launch));
  let child;
  try {
    child = spawn(launch.executable, launch.args, {
      env: { ...process.env, NODE_OPTIONS: "" }, detached,
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch (error) {
    try { await retain("launch-failure.json", evidenceJson(evidenceError(error))); }
    catch (retentionError) { console.error("fresh-worker evidence retention failed", retentionError); }
    throw error;
  }
  const stdout = [], stderr = [], signals = [];
  let timedOut = false;
  const timeoutError = new Error("fresh-process runtime projection worker timed out after 30000ms");
  const deadline = createMonotonicDeadline();
  const lifetime = createOwnedProcessLifetime(child, { terminationGraceMs: 1_000 }, {
    onExit: () => deadline.cancel(),
    onSignalRequested: (signal) => signals.push(signal),
  });
  const onStdout = (chunk) => lifetime.observe(() => stdout.push(Buffer.from(chunk)));
  const onStderr = (chunk) => lifetime.observe(() => stderr.push(Buffer.from(chunk)));
  let facts;
  try {
    child.stdout.on("data", onStdout);
    child.stderr.on("data", onStderr);
    deadline.after(30_000, () => { timedOut = true; lifetime.requestTermination(); });
    await retain("process.json", evidenceJson({
      pid: child.pid ?? null, groupId: detached ? child.pid ?? null : null,
      scopeKind: detached ? "posix_process_group" : "windows_direct_child",
    }));
    child.stdin.end(stdin);
  } catch (error) {
    lifetime.fail(error);
  } finally {
    facts = await lifetime.completion;
    deadline.cancel();
    child.stdout.off("data", onStdout);
    child.stderr.off("data", onStderr);
  }
  const out = Buffer.concat(stdout), err = Buffer.concat(stderr);
  let failure = facts.firstError ?? facts.launchFailure ?? (timedOut ? timeoutError : null);
  if (failure === null && facts.scopeAbsence !== "absent")
    failure = new Error("fresh-process runtime projection worker scope remains unconfirmed");
  if (failure === null && (facts.directExit?.status !== 0 || facts.directExit.signal !== null))
    failure = new Error(`fresh-process runtime projection worker failed ${facts.directExit?.status}: ${err.toString("utf8")}`);
  let result;
  if (failure === null) {
    try {
      result = JSON.parse(out.toString("utf8"));
      assert.equal(result.processId, child.pid, "fresh replay self-report must identify its actual owned child");
    }
    catch (error) { failure = error; }
  }
  try {
    await retain("stdout.bin", out);
    await retain("stderr.bin", err);
    await retain("completion.json", evidenceJson({
      pid: child.pid ?? null, groupId: detached ? child.pid ?? null : null,
      timedOut, signalRequestsObserved: signals,
      signalObserverSuppressedAfterFirstError: facts.firstError !== null,
      facts: { ...facts, firstError: evidenceError(facts.firstError),
        launchFailure: evidenceError(facts.launchFailure) },
      failure: evidenceError(failure), result: result ?? null,
      physicalAbsenceIsNotAdmission: true,
    }));
  } catch (error) {
    // Retention failure is a proof failure. Preserve an earlier actual Error.
    if (failure !== null) console.error("fresh-worker evidence retention failed", error);
    failure ??= error;
  }
  if (failure !== null) throw failure;
  return result;
}

export async function proveFreshProcessRuntimeProjectionEquality({
  abg,
  product,
  installedPackageRoot,
  requests,
  store,
  ownedProcessProof,
}) {
  if (ownedProcessProof !== undefined) {
    assert.deepEqual(Object.keys(ownedProcessProof), ["evidenceRoot"]);
    assert.equal(resolve(ownedProcessProof.evidenceRoot), ownedProcessProof.evidenceRoot);
    assert.equal(await realpath(dirname(ownedProcessProof.evidenceRoot)), dirname(ownedProcessProof.evidenceRoot));
    await mkdir(ownedProcessProof.evidenceRoot);
  }
  const closeHandoff = store.projectReopenAuthorityAndClose();
  const retainedRows = observeRetained(
    abg,
    product,
    store,
    requests,
    closeHandoff.prefix,
  );
  const input = {
    installedPackageRoot,
    reopenAuthority: closeHandoff.reopenAuthority,
    prefix: closeHandoff.prefix,
    requests,
  };
  if (ownedProcessProof !== undefined) await writeFile(
    join(ownedProcessProof.evidenceRoot, "retained.json"),
    evidenceJson({ closeHandoff, retainedRows }), { flag: "wx" },
  );
  const first = await runFreshWorker(input, ownedProcessProof?.evidenceRoot, 1);
  const second = await runFreshWorker(input, ownedProcessProof?.evidenceRoot, 2);
  const transportedRetainedRows = JSON.parse(JSON.stringify(retainedRows));

  assert.notEqual(first.processId, process.pid);
  assert.notEqual(second.processId, process.pid);
  assert.notEqual(first.processId, second.processId);
  assert.equal(
    first.eventLogDigest,
    closeHandoff.reopenAuthority.eventLogDigest,
  );
  assert.equal(
    second.eventLogDigest,
    closeHandoff.reopenAuthority.eventLogDigest,
  );
  assert.deepEqual(first.rows, transportedRetainedRows);
  assert.deepEqual(second.rows, transportedRetainedRows);

  return Object.freeze({
    kind: "fresh_process_runtime_projection_proof",
    eventLogDigest: closeHandoff.reopenAuthority.eventLogDigest,
    historicalEventCount: first.historicalEventCount,
    retainedRows,
    freshProcessIds: Object.freeze([first.processId, second.processId]),
  });
}
