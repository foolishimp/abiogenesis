import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  runAgentActorWorkerCallout
} from "../../build/semantic/code/src/shared/traced_process/index.js";
import {
  createClaudeStreamJsonState,
  finalOutputFromClaudeStreamJsonState,
  flushClaudeStreamJson,
  observeClaudeStreamJsonChunk
} from "../../build/semantic/code/src/shared/traced_process/claude_stream_json.js";
import {
  runAgentTransport
} from "../../build/semantic/code/src/shared/abg_library/index.js";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.resolve(TEST_DIR, "..");
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "t109_agent_callout_traced_substrate"
);

function timestampId() {
  return new Date().toISOString().replace(/[-:.]/gu, "").replace("Z", "Z");
}

async function runRoot(label) {
  const root = path.join(TEST_RUNS_ROOT, `${timestampId()}-${label}`);
  await mkdir(root, { recursive: true });
  return root;
}

function nodePrintJsonLinesScript(events) {
  return [
    "const events = ",
    JSON.stringify(events),
    ";",
    "for (const event of events) console.log(JSON.stringify(event));"
  ].join("");
}

test("T-109 parser fixture: Claude stream-json accumulator is pure parser state", () => {
  const state = createClaudeStreamJsonState();
  const events = [
    {
      type: "system",
      subtype: "api_retry",
      attempt: 1,
      max_retries: 10,
      error_status: null,
      error: "unknown"
    },
    {
      type: "assistant",
      message: {
        content: [
          {
            type: "tool_use",
            id: "toolu_fixture",
            name: "Read",
            input: { file_path: "README.md" }
          }
        ]
      }
    },
    {
      type: "result",
      subtype: "success",
      result: "parser fixture final"
    }
  ];
  const transcript = `${events.map((event) => JSON.stringify(event)).join("\n")}\n`;
  const midpoint = Math.floor(transcript.length / 2);
  const observations = [
    ...observeClaudeStreamJsonChunk(state, transcript.slice(0, midpoint)),
    ...observeClaudeStreamJsonChunk(state, transcript.slice(midpoint)),
    ...flushClaudeStreamJson(state)
  ];

  assert.equal(state.structuredEventCount, 3);
  assert.equal(state.structuredParseFailureCount, 0);
  assert.equal(state.apiRetryEvents.length, 1);
  assert.equal(state.toolCallEvents.length, 1);
  assert.equal(finalOutputFromClaudeStreamJsonState(state), "parser fixture final");
  assert.deepStrictEqual(
    observations.map((observation) => observation.kind),
    [
      "structured_event_observed",
      "api_retry_observed",
      "structured_event_observed",
      "tool_call_observed",
      "structured_event_observed"
    ]
  );
});

test("T-109 parser fixture: terminal control noise between JSONL events is ignored", () => {
  const state = createClaudeStreamJsonState();
  const observations = [
    ...observeClaudeStreamJsonChunk(
      state,
      `${JSON.stringify({ type: "system", subtype: "init" })}\n`
    ),
    ...observeClaudeStreamJsonChunk(
      state,
      "\u001b[?1006l\u001b[?25h\r\n"
    ),
    ...observeClaudeStreamJsonChunk(
      state,
      `${JSON.stringify({ type: "result", subtype: "success", result: "ansi-safe" })}\n`
    ),
    ...flushClaudeStreamJson(state)
  ];

  assert.equal(state.structuredEventCount, 2);
  assert.equal(state.structuredParseFailureCount, 0);
  assert.equal(finalOutputFromClaudeStreamJsonState(state), "ansi-safe");
  assert.deepStrictEqual(
    observations.map((observation) => observation.kind),
    ["structured_event_observed", "structured_event_observed"]
  );
});

test("T-109 parser fixture: Claude stream-json retry and tool-call observations are preserved", async () => {
  const archiveRoot = await runRoot("stream-json");
  const events = [
    {
      type: "system",
      subtype: "init",
      session_id: "fixture-session"
    },
    {
      type: "system",
      subtype: "api_retry",
      attempt: 1,
      max_retries: 10,
      retry_delay_ms: 25,
      error_status: null,
      error: "unknown",
      session_id: "fixture-session"
    },
    {
      type: "assistant",
      message: {
        content: [
          {
            type: "tool_use",
            id: "toolu_fixture",
            name: "Read",
            input: { file_path: "README.md" }
          }
        ]
      }
    },
    {
      type: "result",
      subtype: "success",
      result: "fixture final output"
    }
  ];
  const result = await runAgentActorWorkerCallout({
    agentCalloutKind: "agent_worker",
    workerRef: "worker://fixture-claude",
    command: process.execPath,
    args: ["-e", nodePrintJsonLinesScript(events)],
    cwd: archiveRoot,
    env: {},
    archiveRoot,
    label: "fixture-claude-stream",
    parser: "claude-stream-json",
    timeoutMs: 30000
  });

  assert.equal(result.status, 0);
  assert.equal(result.outcome.kind, "exited");
  assert.equal(result.finalOutput, "fixture final output");
  assert.equal(result.structuredEventCount, 4);
  assert.equal(result.apiRetryEvents.length, 1);
  assert.equal(result.toolCallEvents.length, 1);

  const traceEvents = await readFile(result.paths.events, "utf8");
  assert.match(traceEvents, /api_retry_observed/u);
  assert.match(traceEvents, /tool_call_observed/u);
});

test("T-109 progress fixture: recurring external progress times out after an unchanged checkpoint", async () => {
  const archiveRoot = await runRoot("recurring-progress-timeout");
  const progressPath = path.join(archiveRoot, "progress.txt");
  let lastProgress = "";
  const result = await runAgentActorWorkerCallout({
    agentCalloutKind: "agent_worker",
    workerRef: "worker://fixture-progress",
    command: process.execPath,
    args: [
      "-e",
      [
        "const fs = require('node:fs');",
        `fs.writeFileSync(${JSON.stringify(progressPath)}, 'checkpoint-1');`,
        "setTimeout(() => {}, 5000);"
      ].join("")
    ],
    cwd: archiveRoot,
    env: {},
    archiveRoot,
    label: "fixture-recurring-progress-timeout",
    parser: "generic-text",
    timeoutMs: 10000,
    externalProgressTimeoutMs: 1500,
    externalProgressMode: "recurring",
    externalProgressTimeoutReason: "fixture_progress_stalled",
    externalProgressCheck: () => {
      if (!existsSync(progressPath)) {
        return false;
      }
      const current = readFileSync(progressPath, "utf8");
      if (current === lastProgress) {
        return false;
      }
      lastProgress = current;
      return true;
    }
  });

  assert.equal(result.outcome.kind, "external_progress_timeout");
  assert.equal(result.outcome.reason, "fixture_progress_stalled");

  const traceEvents = await readFile(result.paths.events, "utf8");
  assert.match(traceEvents, /external_progress_observed/u);
  assert.match(traceEvents, /external_progress_timeout/u);
});

test("T-109 failure fixture: pre-init nonzero agent exit is a transport failure", async () => {
  const archiveRoot = await runRoot("pre-init-failure");
  const result = await runAgentTransport({
    contract: {
      agentKey: "codex",
      command: process.execPath,
      argsTemplate: ["-e", "process.exit(7)"],
      sanitizedEnvironmentPolicy: { prefixes: [] }
    },
    prompt: "unused prompt",
    cwd: archiveRoot,
    archiveRoot,
    label: "pre-init-agent-failure",
    timeoutMs: 30000
  });

  assert.equal(result.status, 7);
  assert.equal(result.outcome.kind, "exited");
  assert.equal(result.structuredEventCount, 0);
  assert.equal(result.failureClass, "transport_failure");

  const traceResult = JSON.parse(await readFile(result.traceResultPath, "utf8"));
  assert.equal(traceResult.status, 7);
  assert.equal(traceResult.structuredEventCount, 0);
});

test("T-109 failure fixture: generic nonzero output remains a contract failure", async () => {
  const archiveRoot = await runRoot("generic-contract-failure");
  const result = await runAgentTransport({
    contract: {
      agentKey: "codex",
      command: process.execPath,
      argsTemplate: [
        "-e",
        "process.stderr.write('contract failed\\n'); process.exit(7);"
      ],
      sanitizedEnvironmentPolicy: { prefixes: [] }
    },
    prompt: "unused prompt",
    cwd: archiveRoot,
    archiveRoot,
    label: "generic-contract-failure",
    timeoutMs: 30000
  });

  assert.equal(result.status, 7);
  assert.equal(result.outcome.kind, "exited");
  assert.equal(result.failureClass, "contract_failure");
});

test("T-109 actor fixture: supervised actor-style subprocess uses the universal call-out interface", async () => {
  const archiveRoot = await runRoot("actor-callout");
  const result = await runAgentActorWorkerCallout({
    agentCalloutKind: "agent_actor",
    actorRef: "actor-invocation://t097/migrated-fixture",
    workerRef: "worker://fixture-actor",
    command: process.execPath,
    args: [
      "-e",
      [
        "const payload = {",
        "artifact_kind: 'supervised_process_actor_fixture',",
        "artifact_ref: 'fixture://t097/universal-callout',",
        "agent: 'fixture',",
        "result: 'observed'",
        "};",
        "console.log(JSON.stringify(payload));"
      ].join("")
    ],
    cwd: archiveRoot,
    env: {},
    archiveRoot,
    label: "actor-callout-fixture",
    parser: "generic-text",
    timeoutMs: 30000
  });

  assert.equal(result.status, 0);
  assert.equal(result.finalOutput.trim().length > 0, true);
  assert.deepStrictEqual(JSON.parse(result.finalOutput), {
    artifact_kind: "supervised_process_actor_fixture",
    artifact_ref: "fixture://t097/universal-callout",
    agent: "fixture",
    result: "observed"
  });

  const traceEvents = await readFile(result.paths.events, "utf8");
  assert.match(traceEvents, /process_started/u);
  assert.match(traceEvents, /stdout_chunk/u);
  assert.match(traceEvents, /process_exited/u);
});
