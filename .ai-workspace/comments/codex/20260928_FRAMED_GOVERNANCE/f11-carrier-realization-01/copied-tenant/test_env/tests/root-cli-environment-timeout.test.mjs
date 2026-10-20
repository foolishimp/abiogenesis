import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  runInstalledCli,
  writeCliTransportRequest,
} from "../support/root-cli-environment.mjs";

test("installed CLI timeout preserves operation and termination evidence", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-cli-timeout-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const cliPath = join(scratch, "hanging-cli.mjs");
  await writeFile(
    cliPath,
    [
      "#!/usr/bin/env node",
      'process.stdout.write("partial-installed-stdout");',
      'process.stderr.write("partial-installed-stderr");',
      'process.on("SIGTERM", () => {});',
      "setInterval(() => {}, 1_000);",
      "",
    ].join("\n"),
    { encoding: "utf8", mode: 0o755 },
  );
  const transcriptPath = join(scratch, "transport.jsonl");
  const invocation = {
    kind: "public_invocation",
    schemaVersion: "5.0.0",
    operationId: "abg.operation.run.invoke",
    variant: "direct",
    invocationRef: "invocation://t287/cli-timeout-counterexample",
    eventTime: "2026-09-01T00:00:00.000Z",
    correlationId: "correlation://t287/cli-timeout-counterexample",
    payload: {},
  };
  await writeCliTransportRequest(transcriptPath, {
    acquisition: {
      kind: "new",
      eventLogPath: join(scratch, "events.jsonl"),
    },
    invocation,
  });

  const run = await runInstalledCli(
    { cliHost: scratch, cliPath },
    { transcriptPath, transportExecutor: "cli", transportRuns: [] },
    { timeoutMs: 500 },
  );

  assert.equal(run.exitCode, 1);
  assert.equal(run.transportResult, null);
  assert.equal(run.transportRefusal, null);
  assert.deepEqual(run.operationIdentity, {
    operationId: invocation.operationId,
    variant: invocation.variant,
    invocationRef: invocation.invocationRef,
  });
  assert.deepEqual(run.termination, {
    kind: "installed_transport_process_termination",
    disposition: "timed_out",
    timeoutMs: 500,
    timedOut: true,
    killed: true,
    exitCode: null,
    signal: "SIGKILL",
  });
  assert.equal(run.stdout, "partial-installed-stdout");
  assert.equal(run.stderr, "partial-installed-stderr");
  assert.equal(
    run.processFailure.kind,
    "installed_transport_process_failure",
  );
  assert.deepEqual(run.processFailure.operationIdentity, run.operationIdentity);
  assert.deepEqual(run.processFailure.termination, run.termination);
  assert.equal(run.processFailure.stdout, run.stdout);
  assert.equal(run.processFailure.stderr, run.stderr);
});

test("installed CLI refuses an invalid timeout before child execution", async () => {
  await assert.rejects(
    runInstalledCli(
      { cliHost: "/unused", cliPath: "/unused/abg.cli" },
      {
        transcriptPath: "/unused/transport.jsonl",
        transportExecutor: "cli",
        transportRuns: [],
      },
      { timeoutMs: 0 },
    ),
    /installed transport timeout/u,
  );
});
