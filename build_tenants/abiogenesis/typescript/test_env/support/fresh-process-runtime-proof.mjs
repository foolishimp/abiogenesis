import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const worker = resolve(
  here,
  "../falsifiers/runtime-retained-projections-worker.mjs",
);

function observeRetained(abg, product, store, requests) {
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

function runFreshWorker(input) {
  return new Promise((resolveResult, reject) => {
    const child = spawn(process.execPath, [worker], {
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
        reject(new Error(
          `fresh-process runtime projection worker failed ${code}: ${stderr}`,
        ));
        return;
      }
      try {
        resolveResult(JSON.parse(stdout));
      } catch (error) {
        reject(new Error(
          `fresh-process runtime projection worker returned invalid JSON: ${String(error)}\n${stdout}\n${stderr}`,
        ));
      }
    });
    child.stdin.end(JSON.stringify(input));
  });
}

export async function proveFreshProcessRuntimeProjectionEquality({
  abg,
  product,
  installedPackageRoot,
  requests,
  store,
}) {
  const retainedRows = observeRetained(abg, product, store, requests);
  const reopenAuthority = store.projectReopenAuthorityAndClose();
  const input = { installedPackageRoot, reopenAuthority, requests };
  const first = await runFreshWorker(input);
  const second = await runFreshWorker(input);

  assert.notEqual(first.processId, process.pid);
  assert.notEqual(second.processId, process.pid);
  assert.notEqual(first.processId, second.processId);
  assert.equal(first.eventLogDigest, reopenAuthority.eventLogDigest);
  assert.equal(second.eventLogDigest, reopenAuthority.eventLogDigest);
  assert.deepEqual(first.rows, retainedRows);
  assert.deepEqual(second.rows, retainedRows);

  return Object.freeze({
    kind: "fresh_process_runtime_projection_proof",
    eventLogDigest: reopenAuthority.eventLogDigest,
    historicalEventCount: first.historicalEventCount,
    retainedRows,
    freshProcessIds: Object.freeze([first.processId, second.processId]),
  });
}
