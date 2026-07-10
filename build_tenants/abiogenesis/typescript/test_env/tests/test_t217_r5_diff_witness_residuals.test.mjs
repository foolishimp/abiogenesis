// Validates: T-217 S2.3 R5 diff-execution residuals

import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  admitHandlerRegistry,
  assertRuntimeEvent
} from "../../build/semantic/code/src/abg/m03/index.js";
import { executeHandlerAsync } from "../../build/semantic/code/src/abg/m03/runner/c_call_handlers.js";
import {
  buildCCallSpineClose,
  buildCCallSpineCloseOrResume,
  buildCCallSpineOpen,
  buildCCallSpineOpenOrResume,
  projectResumableCCallSpine
} from "../../build/semantic/code/src/abg/m03/runner/c_call_spine.js";
import { runAbiogenesisCli } from "../../build/semantic/code/src/cli/command.js";
import { runAgentTransport } from "../../build/semantic/code/src/shared/abg_library/agent_transport.js";
import { stableSha256Digest } from "../../build/semantic/code/src/shared/runtime_identity.js";

const AVAILABLE_LIVE_PLUGIN_REFS = Object.freeze([
  "plugin://abg/fp-dispatch-live",
  "plugin://abg/fp-evaluator-live"
]);

const C_CALL_OPEN_INPUT = Object.freeze({
  basisId: "basis://t217/diff-witness",
  graphFunctionId: "graph-function://t217/diff-witness",
  graphCallId: "graph-call://t217/diff-witness",
  frameId: "frame://t217/diff-witness",
  edge: "edge://t217/diff-witness",
  vectorIndex: 0,
  stageRole: "transform",
  taskOrdinal: null,
  attempt: 1,
  batchRef: null,
  regime: "F_P",
  armId: "arm://t217/diff-witness",
  programRef: "gtl://abg/hog/bootstrap-triple",
  compositionRef: null
});

test("R5 diff witness: C-call open-resume rejects ambiguous and conflicting replay", () => {
  const spine = buildCCallSpineOpen(C_CALL_OPEN_INPUT);
  const secondOpen = buildCCallSpineOpen({
    ...C_CALL_OPEN_INPUT,
    attempt: 2
  }).opened;

  assert.throws(
    () =>
      projectResumableCCallSpine(
        [spine.opened, secondOpen],
        C_CALL_OPEN_INPUT
      ),
    /resume is ambiguous/u
  );
  assert.throws(
    () =>
      projectResumableCCallSpine(
        [spine.opened, spine.selected, spine.selected],
        C_CALL_OPEN_INPUT
      ),
    /duplicate selected fibres/u
  );
  assert.throws(
    () =>
      projectResumableCCallSpine(
        [
          {
            ...spine.opened,
            cCallRef: `c-call:sha256:${"0".repeat(64)}`
          }
        ],
        C_CALL_OPEN_INPUT
      ),
    /resume identity is invalid/u
  );
  assert.throws(
    () =>
      buildCCallSpineOpenOrResume([spine.opened], {
        ...C_CALL_OPEN_INPUT,
        edge: "edge://t217/conflicting"
      }),
    /does not match the opened effect locus/u
  );
  assert.throws(
    () =>
      buildCCallSpineOpenOrResume(
        [
          spine.opened,
          { ...spine.selected, armId: "arm://t217/conflicting" }
        ],
        C_CALL_OPEN_INPUT
      ),
    /does not match the selected effect fibre/u
  );
});

test("R5 diff witness: C-call close-resume rejects corrupt prefixes", () => {
  const spine = buildCCallSpineOpen(C_CALL_OPEN_INPUT);
  const closeInput = Object.freeze({
    cCallRef: spine.cCallRef,
    basisId: C_CALL_OPEN_INPUT.basisId,
    evidenceClass: "fp_interior",
    evidenceRefs: Object.freeze(["evidence://t217/diff-witness"]),
    outcomeStatus: "dispatched",
    payloadRef: "payload://t217/diff-witness",
    responseContractRef: null,
    judgment: "advance",
    reasonRef: null
  });
  const [evidence, result, judgment] = buildCCallSpineClose(closeInput);

  assert.throws(
    () => buildCCallSpineCloseOrResume([evidence, evidence], closeInput),
    /contains duplicate rows/u
  );
  assert.throws(
    () => buildCCallSpineCloseOrResume([result], closeInput),
    /result before evidence/u
  );
  assert.throws(
    () => buildCCallSpineCloseOrResume([evidence, judgment], closeInput),
    /judgment before result/u
  );
  assert.throws(
    () =>
      buildCCallSpineCloseOrResume(
        [{ ...evidence, evidenceClass: "conflicting" }],
        closeInput
      ),
    /evidence conflicts/u
  );
  assert.throws(
    () =>
      buildCCallSpineCloseOrResume(
        [evidence, { ...result, outcomeStatus: "blocked" }],
        closeInput
      ),
    /result conflicts/u
  );
  assert.throws(
    () =>
      buildCCallSpineCloseOrResume(
        [evidence, result, { ...judgment, judgment: "blocked" }],
        closeInput
      ),
    /judgment conflicts/u
  );
});

function validLeverResolutionEvent() {
  const executionContractDigest = `sha256:${"1".repeat(64)}`;
  const capabilityFacts = {
    kind: "abg_live_plugin_capability",
    workspaceRoot: "/workspace/t217-diff-witness",
    executionContractDigest,
    agentKey: "generic",
    agentKeySource: "flag",
    executorProfile: "local-spawn",
    executorProfileSource: "flag",
    timeoutMs: 1000,
    timeoutMsSource: "flag",
    availableLivePluginRefs: AVAILABLE_LIVE_PLUGIN_REFS
  };
  const liveCapabilityDigest = stableSha256Digest(capabilityFacts);
  return {
    kind: "lever_resolution_admitted",
    workspaceRoot: capabilityFacts.workspaceRoot,
    moduleName: "t217_diff_witness",
    targetHandle: "graph-function-t217-diff-witness",
    until: "first_traversal",
    fhMode: "direct",
    rootMode: "direct",
    resolvedRuntimeRef: "runtime://t217/diff-witness",
    resolvedPolicyBundleRef: "policy://t217/diff-witness",
    runId: null,
    workKey: null,
    resolutionRef: "lever-resolution:t217-diff-witness",
    bundleRef: null,
    bundleDigest: null,
    bundlePath: null,
    untilLeverKey: "abg.m04.until",
    untilSource: "request",
    fhModeLeverKey: "abg.m04.fh_mode",
    fhModeSource: "registry_default",
    runnerRetryMaxAttempts: 3,
    runnerRetryMaxAttemptsLeverKey: "abg.runner.retry.max_attempts",
    runnerRetryMaxAttemptsSource: "registry_default",
    liveCapabilityRef: `capability:live:${liveCapabilityDigest}`,
    liveCapabilityDigest,
    executionContractDigest,
    liveAgentKey: capabilityFacts.agentKey,
    liveAgentKeySource: capabilityFacts.agentKeySource,
    liveExecutorProfile: capabilityFacts.executorProfile,
    liveExecutorProfileSource: capabilityFacts.executorProfileSource,
    liveTimeoutMs: capabilityFacts.timeoutMs,
    liveTimeoutMsSource: capabilityFacts.timeoutMsSource,
    availableLivePluginRefs: AVAILABLE_LIVE_PLUGIN_REFS,
    selectedLeverKeys: Object.freeze([
      "abg.m04.until",
      "abg.m04.fh_mode",
      "abg.runner.retry.max_attempts"
    ]),
    causationEventRefs: Object.freeze([]),
    correlationId: "lever-resolution:t217-diff-witness"
  };
}

test("R5 diff witness: live capability event rejection branches execute", () => {
  const event = validLeverResolutionEvent();
  assert.doesNotThrow(() => assertRuntimeEvent(event));
  const absentCapability = {
    liveCapabilityRef: null,
    liveCapabilityDigest: null,
    executionContractDigest: null,
    liveAgentKey: null,
    liveAgentKeySource: null,
    liveExecutorProfile: null,
    liveExecutorProfileSource: null,
    liveTimeoutMs: null,
    liveTimeoutMsSource: null
  };
  assert.throws(
    () => assertRuntimeEvent({ ...event, ...absentCapability }),
    /live capability fields and available refs must be all absent or all present/u
  );
  assert.throws(
    () => assertRuntimeEvent({ ...event, liveTimeoutMs: 0 }),
    /liveTimeoutMs must be a positive integer/u
  );
  assert.throws(
    () => assertRuntimeEvent({ ...event, executionContractDigest: "not-a-digest" }),
    /executionContractDigest must be a sha256 digest/u
  );
  assert.throws(
    () => assertRuntimeEvent({ ...event, liveCapabilityRef: "capability:live:wrong" }),
    /liveCapabilityRef does not match its capability digest/u
  );
});

function handlerInput(handlerRef) {
  return {
    stage: {
      stageRole: "transform",
      defaultRegime: "F_D",
      armId: "arm://t217/diff-witness",
      resultBearing: true
    },
    binding: {
      programRef: "gtl://t217/diff-witness",
      stageRole: "transform",
      armId: "arm://t217/diff-witness",
      regime: "F_D",
      handlerRef,
      handlerClass: "pipeline",
      handlerConfigRef: null
    },
    declaredConfig: null,
    workProjection: null
  };
}

test("R5 diff witness: handler admission and async invalid-driver blocks execute", async () => {
  const nonCallable = admitHandlerRegistry({
    bindings: [],
    handlers: new Map([["handler://t217/not-callable", {}]])
  });
  assert.equal(nonCallable.accepted, false);
  assert.match(nonCallable.issues.join("; "), /must be callable/u);

  let invoked = 0;
  const invalidDriver = Object.assign(
    () => {
      invoked += 1;
      throw new Error("must not invoke");
    },
    { driverRequirement: "invalid" }
  );
  const blocked = await executeHandlerAsync(
    invalidDriver,
    handlerInput("handler://t217/invalid-driver")
  );
  assert.equal(invoked, 0);
  assert.equal(blocked.outcomeStatus, "blocked");
  assert.deepEqual(blocked.evidenceRefs, [
    "handler-driver-invalid:handler://t217/invalid-driver"
  ]);
  assert.match(blocked.failureReason, /handler_driver_requirement_invalid/u);
});

function transportRequest(archiveRoot, overrides = {}) {
  return {
    contract: {
      agentKey: "generic",
      command: process.execPath,
      argsTemplate: ["-e", "throw new Error('must not execute')"],
      sanitizedEnvironmentPolicy: { prefixes: [] }
    },
    prompt: "unused",
    cwd: archiveRoot,
    archiveRoot,
    label: "t217-diff-witness",
    ...overrides
  };
}

test("R5 diff witness: transport rejects explicit and default path escapes before execution", async () => {
  const explicitRoot = mkdtempSync(path.join(tmpdir(), "t217-transport-explicit-"));
  await assert.rejects(
    runAgentTransport(
      transportRequest(explicitRoot, {
        outputPath: path.join(explicitRoot, "..", "outside.txt")
      })
    ),
    /outputPath must remain beneath archiveRoot/u
  );

  const defaultRoot = mkdtempSync(path.join(tmpdir(), "t217-transport-default-"));
  await assert.rejects(
    runAgentTransport(transportRequest(defaultRoot, { label: "../outside" })),
    /label must keep default paths beneath archiveRoot/u
  );

  const admittedRoot = mkdtempSync(path.join(tmpdir(), "t217-transport-admitted-"));
  const admitted = await runAgentTransport(
    transportRequest(admittedRoot, {
      contract: {
        agentKey: "generic",
        command: process.execPath,
        argsTemplate: ["-e", "console.log('admitted')"],
        sanitizedEnvironmentPolicy: { prefixes: [] }
      },
      outputPath: path.join(admittedRoot, "worker-output.txt")
    })
  );
  assert.equal(admitted.status, 0);
  assert.equal(admitted.text.trim(), "admitted");
});

function cliWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), "t217-cli-capability-"));
  const stateRoot = path.join(root, ".ai-workspace");
  const eventLogPath = path.join(stateRoot, "events", "events.jsonl");
  const bindingPath = path.join(root, ".abiogenesis", "toolchain-binding.json");
  mkdirSync(path.dirname(bindingPath), { recursive: true });
  mkdirSync(path.dirname(eventLogPath), { recursive: true });
  writeFileSync(
    bindingPath,
    `${JSON.stringify({
      kind: "abg_toolchain_workspace_binding",
      schemaVersion: "2",
      targetRoot: root,
      toolchainRoot: path.join(root, ".toolchain"),
      selectionSource: "workspace_binding",
      bindingPath,
      products: [],
      mutableStateRoots: {
        observedWorkspaceRoot: root,
        observerStateRoot: path.join(stateRoot, "observer"),
        executorStateRoot: path.join(stateRoot, "executor"),
        eventRoot: path.join(stateRoot, "events"),
        eventLogPath,
        runtimeRoot: path.join(stateRoot, "runtime"),
        projectionRoot: path.join(stateRoot, "projections"),
        archiveRoot: path.join(stateRoot, "archives")
      }
    }, null, 2)}\n`,
    "utf8"
  );
  const fixtureUrl = new URL(
    "./support/m03-iteration-fixtures.mjs",
    import.meta.url
  ).href;
  writeFileSync(
    path.join(root, ".abiogenesis", "typescript-runtime.mjs"),
    [
      `import { buildThreeStageStartContext } from ${JSON.stringify(fixtureUrl)};`,
      `const { context } = buildThreeStageStartContext({ defaultRegime: "F_D" });`,
      "export const runtimeBinding = {",
      "  module: context.module,",
      "  runtimeIdentity: context.runtimeIdentity,",
      "  resolvedPolicy: context.resolvedPolicy",
      "};",
      ""
    ].join("\n"),
    "utf8"
  );
  return root;
}

test("R5 diff witness: CLI start binds declared live capability into start context", async () => {
  const root = cliWorkspace();
  const stdout = [];
  const stderr = [];
  const exitCode = await runAbiogenesisCli(
    [
      "start",
      "--workspace", root,
      "--scope", "workspace",
      "--target", "next",
      "--until", "first_traversal",
      "--live-agent", "generic",
      "--live-timeout-ms", "1000",
      "--executor-profile", "local-spawn"
    ],
    {
      cwd: () => root,
      stdout: (text) => stdout.push(text),
      stderr: (text) => stderr.push(text)
    }
  );
  assert.notEqual(exitCode, 1, stderr.join(""));
  const output = JSON.parse(stdout.at(-1));
  assert.equal(output.command, "start");
  assert.equal(output.live_capability.agentKey, "generic");
  assert.equal(output.live_capability.timeoutMs, 1000);
  assert.equal(output.live_capability.executorProfile, "local-spawn");
});
