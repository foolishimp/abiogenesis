import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join } from "node:path";
import { promisify } from "node:util";
import { exportedImportHref, setupInstalledRootCatalog } from "./root-installed-environment.mjs";
import { prepareLanguageSmokeFixture, constructLanguageTestInput } from "./language-smoke-fixture.mjs";
import { constructInstalledStartCall, constructInstalledRunReadCall } from "./registered-graph-selection.mjs";

const execFileAsync = promisify(execFile);

/** Operator-provided absolute root under which one S01 episode is retained. */
export const EPISODE_CAPTURE_ROOT_VARIABLE = "ABI5_S01_EPISODE_CAPTURE_ROOT";
/** The one episode directory created (exclusively) under that root. */
export const EPISODE_CAPTURE_DIRECTORY = "installed-language-smoke";

// A capture value is the actual returned candidate, made JSON-safe without
// interpretation: shared references are repeated, a true cycle is marked.
function captureValue(value, ancestors = new Set()) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : { $number: String(value) };
  if (typeof value === "bigint") return { $bigint: value.toString() };
  if (typeof value === "undefined") return { $undefined: true };
  if (typeof value === "function") return { $function: value.name || "anonymous" };
  if (typeof value === "symbol") return { $symbol: value.toString() };
  if (ancestors.has(value)) return { $cycle: true };
  if (value instanceof Uint8Array) return { $bytesBase64: Buffer.from(value).toString("base64") };
  ancestors.add(value);
  try {
    if (value instanceof Error) {
      const own = Object.fromEntries(Object.getOwnPropertyNames(value).map((key) => [key, captureValue(value[key], ancestors)]));
      return { $error: value.name, ...own, ...(value.cause === undefined ? {} : { cause: captureValue(value.cause, ancestors) }) };
    }
    if (Array.isArray(value)) return value.map((item) => captureValue(item, ancestors));
    if (value instanceof Map) return { $map: [...value.entries()].map((row) => captureValue(row, ancestors)) };
    if (value instanceof Set) return { $set: [...value.values()].map((item) => captureValue(item, ancestors)) };
    return Object.fromEntries(Object.keys(value).map((key) => [key, captureValue(value[key], ancestors)]));
  } finally {
    ancestors.delete(value);
  }
}

const INERT_CAPTURE = Object.freeze({
  enabled: false,
  record() {},
  raw() {},
  async flush() {},
  async close() { return null; },
});

/**
 * Same-episode custody. `record` and `raw` retain actual candidates in memory
 * at the moment an owner returns them; `flush` writes every pending entry
 * exclusively under `<root>/installed-language-smoke/` and never throws: its
 * first failure is retained as the secondary capture failure that `close`
 * returns after writing `episode-result.json` and `MANIFEST.json`. Without a
 * root the capture is inert and retains nothing.
 */
export function createEpisodeCapture(root = process.env[EPISODE_CAPTURE_ROOT_VARIABLE]) {
  if (root === undefined || root === "") return INERT_CAPTURE;
  const directory = join(root, EPISODE_CAPTURE_DIRECTORY);
  const pending = [];
  const manifest = [];
  let opened = false;
  let failure = null;
  const write = async (file, bytes) => {
    const path = join(directory, file);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, bytes, { flag: "wx" });
    manifest.push({ file, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") });
  };
  const flush = async () => {
    try {
      if (!opened) {
        if (!isAbsolute(root)) throw new TypeError(`${EPISODE_CAPTURE_ROOT_VARIABLE} must be an absolute path: ${root}`);
        await mkdir(root, { recursive: true });
        await mkdir(directory);
        opened = true;
      }
      while (pending.length > 0) {
        const entry = pending.shift();
        const bytes = entry.bytes ?? Buffer.from(`${JSON.stringify(captureValue(entry.value))}\n`, "utf8");
        await write(entry.file, bytes);
      }
    } catch (error) {
      failure ??= error;
    }
  };
  return Object.freeze({
    enabled: true,
    root,
    directory,
    record(name, value) { pending.push({ file: `candidates/${name}.json`, value }); },
    raw(file, content) {
      pending.push({ file, bytes: content === undefined || content === null ? Buffer.alloc(0)
        : Buffer.isBuffer(content) ? content : Buffer.from(String(content), "utf8") });
    },
    flush,
    async close(primaryError) {
      await flush();
      const captureFailure = failure;
      pending.push({ file: "episode-result.json", value: {
        status: primaryError === null ? "assertions_passed" : "failed",
        primaryError: primaryError === null ? null : captureValue(primaryError),
        captureFailureBeforeClose: captureFailure === null ? null : captureValue(captureFailure),
      } });
      await flush();
      if (opened) {
        try { await write("MANIFEST.json", Buffer.from(`${JSON.stringify({ directory, files: manifest })}\n`, "utf8")); }
        catch (error) { failure ??= error; }
      }
      return failure;
    },
  });
}

/** The installed package's declared `abg.cli` bin target. */
export async function installedCliPath(installedRoot) {
  const packageJson = JSON.parse(await readFile(join(installedRoot, "package.json"), "utf8"));
  const bin = typeof packageJson.bin === "string" ? packageJson.bin : packageJson.bin?.["abg.cli"];
  assert.equal(typeof bin, "string", "installed Product declares the abg.cli bin");
  return join(installedRoot, bin);
}

// The installed CLI transport. The actual request bytes, raw stdout/stderr and
// exit are retained before any exit, stream or parse assertion, so a child or
// parse failure stays primary with its actual streams in custody.
async function runCapturedCliRequest({ scratch, cliPath, identity, acquisition, call, expectedExitCode = 0,
  environment = {}, capture }) {
  const requestPath = join(scratch, `st4-${identity}-request.jsonl`);
  const request = `${JSON.stringify({ kind: "abg_cli_transport_request", schemaVersion: "5.0.0", acquisition, invocation: call })}\n`;
  await writeFile(requestPath, request);
  capture.raw(`cli-${identity}-request.jsonl`, request);
  const started = performance.now();
  let stdout;
  let stderr;
  let exit;
  try {
    ({ stdout, stderr } = await execFileAsync(process.execPath, [cliPath, "--jsonl", requestPath],
      { cwd: scratch, env: environment, maxBuffer: 10 * 1024 * 1024 }));
    exit = { code: 0, signal: null };
  } catch (error) {
    ({ stdout, stderr } = error);
    exit = { code: error.code ?? null, signal: error.signal ?? null, killed: error.killed ?? null, message: error.message };
  }
  const wallMs = performance.now() - started;
  capture.raw(`cli-${identity}-stdout.raw`, stdout);
  capture.raw(`cli-${identity}-stderr.raw`, stderr);
  capture.record(`cli-${identity}-exit`, { ...exit, wallMs, cliPath, requestPath, expectedExitCode });
  await capture.flush();
  if (expectedExitCode !== null) assert.equal(exit.code, expectedExitCode, `${identity} CLI exit`);
  assert.equal(stderr, "", `${identity} CLI stderr`);
  const lines = String(stdout ?? "").trim().split(/\r?\n/u);
  assert.equal(lines.length, 1, `${identity} one CLI output`);
  return Object.freeze({ wallMs, cliPath, requestPath, stdout, stderr, exit, output: JSON.parse(lines[0]) });
}

// Retains the actual Public constructor return before a lower support helper
// asserts on it. Sync and async constructors keep their own shape.
function observedPublicApi(publicApi, capture) {
  if (!capture.enabled) return publicApi;
  const observe = (name, value) => {
    if (value instanceof Promise) return value.then((resolved) => { capture.record(name, resolved); return resolved; });
    capture.record(name, value);
    return value;
  };
  return Object.freeze({ ...publicApi,
    constructInstalledStartCall: (...args) => observe("start-construction", publicApi.constructInstalledStartCall(...args)),
    constructInstalledRunReadCall: (...args) =>
      observe(`read-${args[0]?.memberKey}-construction`, publicApi.constructInstalledRunReadCall(...args)),
  });
}

// R7 join input: the exported GTL owner materializes the admitted Program's
// GraphFunction over the ABG-admitted invocation/input coordinates of the one
// root execution basis, and the exported validator validates it. The caller
// compares these identities with the admitted basis; nothing here asserts.
function deriveMaterializedGraph({ gtl, validator, resolution, events }) {
  const bases = events.filter((event) => event.kind === "basis_admitted" && event.payload?.basisClass === "root");
  if (bases.length !== 1 || resolution?.graphFunction === undefined || resolution?.programValidation === undefined) {
    return { basisEvents: bases, graph: null, graphValidation: null };
  }
  const basis = bases[0].payload;
  const coordinates = {
    invocationAdmissionRef: basis.invocationAdmissionRef,
    admittedInputRef: basis.rawInputAdmissionRef,
    admittedInputDigest: basis.rawInputDigest,
    admittedInput: basis.rawInputValue,
  };
  const graph = gtl.materializeGraph(resolution.graphFunction, coordinates);
  const graphValidation = validator.validateGraph(graph, resolution.programValidation, resolution.graphFunction, coordinates);
  return { basisEvents: bases, coordinates, graph, graphValidation };
}

// Current installed DefinitionCall route. Setup uses admitted installation and
// workspace owners; this helper does not claim legacy Public setup coverage.
// `rootWitness: true` selects the bounded S01 route: exported installed owners
// only, the exported GTL/validator R7 derivation, and `capture` custody.
export async function runInstalledLanguageTest(context, packageRoot, options = {}) {
  const rootWitness = options.rootWitness === true;
  const capture = options.capture ?? INERT_CAPTURE;
  const prepareFixture = options.prepareFixture ?? prepareLanguageSmokeFixture;
  const environment = await setupInstalledRootCatalog(context, packageRoot, {
    candidateBasisSource: "packed_artifact", workspaceProductIndex: 1,
    prepareAdditionalProducts: async basis => [await prepareFixture(basis)],
    ...(rootWitness ? { exportedSurfacesOnly: true } : {}),
    ...(capture.enabled ? { episodeSink: capture } : {}),
    ...(options.programRef === undefined ? {} : { programRef: options.programRef }),
    ...(options.catalogHandle === undefined ? {} : { graphFunctionRef: options.catalogHandle }),
    // Canonical ABI publications the selected Program borrows declarations from.
    ...(options.additionalCorePublicationConstructors === undefined ? {}
      : { additionalCorePublicationConstructors: options.additionalCorePublicationConstructors }),
    ...(options.crossPublicationProgram === undefined ? {} : { crossPublicationProgram: options.crossPublicationProgram }),
  });
  if (options.allowlist !== undefined) {
    environment.catalogView = environment.product.narrowGraphFunctionCatalog(environment.catalog, options.allowlist);
    capture.record("setup-allowlist-catalog-view", environment.catalogView);
    assert.equal(environment.catalogView.kind, "graph_function_catalog_view");
  }
  const { product, installedRoot, scratch } = environment;
  const publicHref = await exportedImportHref(installedRoot, "./public");
  const publicApi = await import(publicHref);
  const cliPath = await installedCliPath(installedRoot);
  const publicSurface = Object.freeze({ public: Object.freeze({ subpath: "./public", exported: true, href: publicHref }),
    cli: Object.freeze({ bin: "abg.cli", path: cliPath }) });
  const identity = options.identity ?? "language-smoke";
  const setupHandoff = environment.store.projectReopenAuthorityAndClose();
  capture.record("setup-handoff", { setupHandoff, durablePrefix: environment.durablePrefix, publicSurface,
    ownerSurface: environment.ownerSurface, ownerModules: environment.ownerModules });
  const eventResource = { kind: "reopen_abg_event_resource", schemaVersion: "5.0.0", closeHandoff: setupHandoff,
    handoffDigest: product.sha256Canonical(setupHandoff) };
  const input = options.input ?? constructLanguageTestInput(options.subject ?? "World");
  const api = observedPublicApi(publicApi, capture);
  const { call, resolution } = await constructInstalledStartCall({ environment, publicApi: api, eventResource, input,
    identity, programRef: options.programRef, declaredStartRef: options.declaredStartRef });
  const execution = await runCapturedCliRequest({ scratch, cliPath, identity, capture,
    acquisition: { kind: "reopen", closeHandoff: setupHandoff }, call, expectedExitCode: options.expectedExitCode ?? 0,
    environment: options.workerEnvironment ?? {} });
  assert.equal(execution.output.kind, "installed_definition_call_transport_result", JSON.stringify(execution.output));
  const receipt = execution.output.receipt;
  assert.equal(receipt.kind, "definition_host_receipt");
  const handoff = receipt.resources.eventResource.closeHandoff;
  if (capture.enabled) capture.raw("events.jsonl", await readFile(new URL(handoff.prefix.eventLogRef)));
  const events = environment.abg.readRuntimeEventsAtDurablePrefix(handoff.prefix);
  capture.record("events-at-prefix", { prefix: handoff.prefix, events });
  let materialization = null;
  if (rootWitness) {
    try {
      const [gtl, validator] = await Promise.all([
        exportedImportHref(installedRoot, "./gtl").then((href) => import(href)),
        exportedImportHref(installedRoot, "./validator").then((href) => import(href)),
      ]);
      materialization = deriveMaterializedGraph({ gtl, validator, resolution, events });
    } catch (error) {
      capture.record("materialized-graph-failure", error);
      await capture.flush();
      throw error;
    }
    capture.record("materialized-graph", materialization);
  }
  await capture.flush();
  const reads = [];
  if (options.readback !== false && receipt.resources.run) {
    for (const memberKey of ["run_result", "run_replay"]) {
      const source = receipt.resources.run;
      const { call: readCall } = constructInstalledRunReadCall({ environment, publicApi: api,
        memberKey, selector: memberKey === "run_replay" ? { kind: "ordinal_page", fromOrdinal: 0, limit: 4096 } : { kind: "none" },
        source, eventResource: { ...eventResource, closeHandoff: handoff, handoffDigest: product.sha256Canonical(handoff) },
        identity: `${identity}-${memberKey}` });
      const before = await readFile(new URL(handoff.prefix.eventLogRef));
      const read = await runCapturedCliRequest({ scratch, cliPath, identity: memberKey, capture,
        acquisition: { kind: "reopen", closeHandoff: handoff }, call: readCall });
      const after = await readFile(new URL(handoff.prefix.eventLogRef));
      capture.record(`read-${memberKey}-log-conservation`, { beforeBytes: before.length, afterBytes: after.length,
        beforeSha256: createHash("sha256").update(before).digest("hex"), afterSha256: createHash("sha256").update(after).digest("hex") });
      await capture.flush();
      assert.equal(read.output.receipt.ownerOutput.outcomeKind, "result", memberKey);
      assert.deepEqual(read.output.receipt.resources.eventResource.closeHandoff.prefix, handoff.prefix, memberKey);
      assert.deepEqual(after, before, `${memberKey} appends no bytes`);
      reads.push({ memberKey, call: readCall, execution: read, receipt: read.output.receipt });
    }
  }
  return { environment, call, resolution, execution, receipt, handoff, events, reads, materialization, publicSurface,
    fixtureInstalledRoot: environment.additionalInstallCandidates[0].installedRoot };
}
