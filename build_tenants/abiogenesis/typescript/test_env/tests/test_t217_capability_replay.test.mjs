// Validates: REQ-R-ABG3-PLUGIN-SEAMS-005
// Validates: REQ-R-ABG3-WITNESS-010

import test from "node:test";
import assert from "node:assert/strict";

import {
  assertRuntimeEvent,
  publicCallableStartAsync
} from "../../build/semantic/code/src/index.js";
import {
  constructLiveCapabilityBinding,
  projectLiveCapability
} from "../../build/semantic/code/src/app/m04/index.js";
import * as m04PublicApi from "../../build/semantic/code/src/app/m04/index.js";
import {
  resolveLiveCapabilityBinding,
  resolveLiveCapabilityProvenance,
  runAbiogenesisCli
} from "../../build/semantic/code/src/cli/command.js";
import {
  buildThreeStageStartContext
} from "./support/m03-iteration-fixtures.mjs";

const LIVE_ENV_KEYS = Object.freeze([
  "ABG_TS_LIVE_AGENT",
  "ABG_TS_LIVE_TIMEOUT_MS",
  "ABG_TS_AGENT_EXECUTOR_PROFILE",
  "CODEX_LIVE_FP",
  "ABG_TS_CODEX_MODEL",
  "ABG_TS_CODEX_SANDBOX"
]);

function withoutLiveEnvironment(action) {
  const prior = new Map(LIVE_ENV_KEYS.map((key) => [key, process.env[key]]));
  const restore = () => {
    for (const [key, value] of prior) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  };
  for (const key of LIVE_ENV_KEYS) {
    delete process.env[key];
  }
  try {
    const outcome = action();
    if (outcome instanceof Promise) {
      return outcome.finally(restore);
    }
    restore();
    return outcome;
  } catch (error) {
    restore();
    throw error;
  }
}

function liveCommand(overrides = {}) {
  return {
    liveAgent: undefined,
    liveTimeoutMs: undefined,
    executorProfile: undefined,
    ...overrides
  };
}

function mutableCapabilityRow(overrides = {}) {
  return {
    agentContract: {
      agentKey: "codex",
      command: "codex",
      argsTemplate: ["exec", "--model", "model-a", "{prompt}"],
      sanitizedEnvironmentPolicy: { prefixes: ["CLAUDE_CODE_"] }
    },
    archiveRoot: "/workspace/t217-capability/.ai-workspace/live-fp",
    cwd: "/workspace/t217-capability",
    timeoutMs: 240000,
    executorProfile: "local-spawn",
    terminalSessionKeyPrefix: "abg-live",
    labelPrefix: "t217",
    ...overrides
  };
}

function constructBindingFromRows(dispatch, evaluator, overrides = {}) {
  return constructLiveCapabilityBinding({
    workspaceRoot: "/workspace/t217-capability",
    agentKey: "codex",
    agentKeySource: "flag",
    executorProfile: "local-spawn",
    executorProfileSource: "default",
    timeoutMs: 240000,
    timeoutMsSource: "default",
    pluginCapabilities: {
      liveFpDispatch: dispatch,
      liveFpEvaluator: evaluator
    },
    ...overrides
  });
}

test("R5-8: every live argument is admitted before the no-agent decision", () => {
  withoutLiveEnvironment(() => {
    assert.throws(
      () => resolveLiveCapabilityProvenance(liveCommand({ liveTimeoutMs: "0" })),
      /POSITIVE integer/u
    );
    assert.throws(
      () => resolveLiveCapabilityProvenance(liveCommand({ executorProfile: "bogus" })),
      /executor profile must be/u
    );
    assert.throws(
      () => resolveLiveCapabilityProvenance(liveCommand({ liveTimeoutMs: "1000" })),
      /live timeout requires/u
    );
    assert.throws(
      () => resolveLiveCapabilityProvenance(liveCommand({ executorProfile: "local-spawn" })),
      /live executor profile requires/u
    );
  });
});

test("R5-8: orphan live flags fail through the parsed CLI before workspace loading", async () => {
  await withoutLiveEnvironment(async () => {
    const stdout = [];
    const stderr = [];
    const exit = await runAbiogenesisCli(
      [
        "start",
        "--workspace", "/workspace/does-not-exist",
        "--scope", "workspace",
        "--target", "graph_function:missing",
        "--until", "first_traversal",
        "--live-timeout-ms", "1000"
      ],
      {
        cwd: () => "/",
        stdout: (text) => stdout.push(text),
        stderr: (text) => stderr.push(text)
      }
    );
    assert.equal(exit, 1);
    const payload = JSON.parse(stdout.join(""));
    assert.match(payload.reason, /live timeout requires/u);
    assert.doesNotMatch(payload.reason, /binding|workspace/u);
    assert.notEqual(stderr.length, 0);
  });
});

test("R5-6: one frozen digest-backed binding owns catalog, replay, and output truth", () => {
  withoutLiveEnvironment(() => {
    const binding = resolveLiveCapabilityBinding(
      "/workspace/t217-capability",
      liveCommand({ liveAgent: "claude" })
    );
    assert.notEqual(binding, undefined);
    assert.equal(Object.isFrozen(binding), true);
    assert.equal(Object.isFrozen(binding.projection), true);
    assert.equal(Object.isFrozen(binding.pluginCapabilities), true);
    assert.strictEqual(projectLiveCapability(binding), binding.projection);
    assert.deepStrictEqual(binding.projection.availableLivePluginRefs, [
      "plugin://abg/fp-dispatch-live",
      "plugin://abg/fp-evaluator-live"
    ]);
    assert.equal(binding.projection.agentKey, "claude");
    assert.equal(binding.projection.agentKeySource, "flag");
    assert.equal(binding.projection.executorProfile, "local-spawn");
    assert.equal(binding.projection.executorProfileSource, "default");
    assert.equal(binding.projection.timeoutMs, 240000);
    assert.equal(binding.projection.timeoutMsSource, "default");
    assert.match(
      binding.projection.executionContractDigest,
      /^sha256:[0-9a-f]{64}$/u
    );
    assert.match(binding.projection.capabilityDigest, /^sha256:[0-9a-f]{64}$/u);
    assert.equal(
      binding.projection.capabilityRef,
      `capability:live:${binding.projection.capabilityDigest}`
    );
    assert.notStrictEqual(
      binding.pluginCapabilities.liveFpDispatch,
      binding.pluginCapabilities.liveFpEvaluator
    );
    assert.deepStrictEqual(
      binding.pluginCapabilities.liveFpDispatch,
      binding.pluginCapabilities.liveFpEvaluator
    );
    for (const row of [
      binding.pluginCapabilities.liveFpDispatch,
      binding.pluginCapabilities.liveFpEvaluator
    ]) {
      assert.equal(Object.isFrozen(row), true);
      assert.equal(Object.isFrozen(row.agentContract), true);
      assert.equal(Object.isFrozen(row.agentContract.argsTemplate), true);
      assert.equal(
        Object.isFrozen(row.agentContract.sanitizedEnvironmentPolicy),
        true
      );
      assert.equal(
        Object.isFrozen(row.agentContract.sanitizedEnvironmentPolicy.prefixes),
        true
      );
    }
  });
});

test("R5-6: executable rows are snapshotted and caller facts cannot contradict them", () => {
  const dispatch = mutableCapabilityRow();
  const evaluator = mutableCapabilityRow();
  const binding = constructBindingFromRows(dispatch, evaluator);
  const originalExecutionDigest = binding.projection.executionContractDigest;
  dispatch.agentContract.argsTemplate[2] = "mutated-model";
  dispatch.agentContract.sanitizedEnvironmentPolicy.prefixes.push("MUTATED_");
  dispatch.timeoutMs = 1;
  evaluator.cwd = "/workspace/hijacked";
  assert.equal(
    binding.pluginCapabilities.liveFpDispatch.agentContract.argsTemplate[2],
    "model-a"
  );
  assert.deepStrictEqual(
    binding.pluginCapabilities.liveFpDispatch.agentContract
      .sanitizedEnvironmentPolicy.prefixes,
    ["CLAUDE_CODE_"]
  );
  assert.equal(binding.pluginCapabilities.liveFpDispatch.timeoutMs, 240000);
  assert.equal(
    binding.pluginCapabilities.liveFpEvaluator.cwd,
    "/workspace/t217-capability"
  );
  assert.equal(binding.projection.executionContractDigest, originalExecutionDigest);

  assert.throws(
    () =>
      constructBindingFromRows(mutableCapabilityRow(), mutableCapabilityRow(), {
        agentKey: "claude"
      }),
    /caller agentKey does not match/u
  );
  assert.throws(
    () =>
      constructBindingFromRows(
        mutableCapabilityRow(),
        mutableCapabilityRow({ timeoutMs: 120000 })
      ),
    /execution-equivalent/u
  );
  assert.throws(
    () =>
      constructBindingFromRows(mutableCapabilityRow(), mutableCapabilityRow(), {
        timeoutMs: 120000
      }),
    /caller timeoutMs does not match/u
  );
});

test("R5-6: malformed executable capability facts fail closed", () => {
  const malformedCases = [
    {
      label: "agent key",
      mutate: (row) => {
        row.agentContract.agentKey = "not-an-agent";
      },
      expected: /must name a known live agent/u
    },
    {
      label: "command",
      mutate: (row) => {
        row.agentContract.command = "";
      },
      expected: /agentContract\.command must be a non-empty string/u
    },
    {
      label: "argument template",
      mutate: (row) => {
        row.agentContract.argsTemplate = ["exec", 7];
      },
      expected: /agentContract\.argsTemplate must be an array of strings/u
    },
    {
      label: "environment prefixes",
      mutate: (row) => {
        row.agentContract.sanitizedEnvironmentPolicy.prefixes = ["SAFE_", null];
      },
      expected: /sanitizedEnvironmentPolicy\.prefixes must be an array of strings/u
    },
    {
      label: "working directory",
      mutate: (row) => {
        row.cwd = "";
      },
      expected: /\.cwd must be a non-empty string/u
    },
    {
      label: "archive root",
      mutate: (row) => {
        row.archiveRoot = "";
      },
      expected: /\.archiveRoot must be a non-empty string/u
    },
    {
      label: "timeout",
      mutate: (row) => {
        row.timeoutMs = 0;
      },
      expected: /timeoutMs must be a positive safe integer/u
    },
    {
      label: "executor profile",
      mutate: (row) => {
        row.executorProfile = "detached";
      },
      expected: /executorProfile must be local-spawn or pty-terminal/u
    },
    {
      label: "terminal session prefix",
      mutate: (row) => {
        row.terminalSessionKeyPrefix = "";
      },
      expected: /terminalSessionKeyPrefix must be a non-empty string/u
    },
    {
      label: "label prefix",
      mutate: (row) => {
        row.labelPrefix = "";
      },
      expected: /labelPrefix must be a non-empty string/u
    }
  ];

  for (const { label, mutate, expected } of malformedCases) {
    const dispatch = mutableCapabilityRow();
    mutate(dispatch);
    assert.throws(
      () => constructBindingFromRows(dispatch, mutableCapabilityRow()),
      expected,
      label
    );
  }
});

test("R5-6: binding-level capability contradictions fail closed", () => {
  assert.throws(
    () => constructBindingFromRows(undefined, mutableCapabilityRow()),
    /requires both standard live F_P capability rows/u
  );
  assert.throws(
    () => constructBindingFromRows(mutableCapabilityRow(), undefined),
    /requires both standard live F_P capability rows/u
  );
  assert.throws(
    () =>
      constructBindingFromRows(mutableCapabilityRow(), mutableCapabilityRow(), {
        workspaceRoot: "/workspace/other"
      }),
    /workspaceRoot must equal the executable capability cwd/u
  );
  assert.throws(
    () =>
      constructBindingFromRows(mutableCapabilityRow(), mutableCapabilityRow(), {
        executorProfile: "pty-terminal"
      }),
    /caller executorProfile does not match/u
  );

  for (const sourceField of [
    "agentKeySource",
    "executorProfileSource",
    "timeoutMsSource"
  ]) {
    assert.throws(
      () =>
        constructBindingFromRows(mutableCapabilityRow(), mutableCapabilityRow(), {
          [sourceField]: "implicit"
        }),
      /must be flag, env, or default/u,
      sourceField
    );
  }
});

test("R5-6: closed enums, executor default, and absent optional facts are admitted", () => {
  for (const agentKey of ["claude", "codex", "gemini", "generic"]) {
    const dispatch = mutableCapabilityRow();
    const evaluator = mutableCapabilityRow();
    dispatch.agentContract.agentKey = agentKey;
    evaluator.agentContract.agentKey = agentKey;
    const binding = constructBindingFromRows(dispatch, evaluator, { agentKey });
    assert.equal(binding.projection.agentKey, agentKey);
  }

  for (const source of ["flag", "env", "default"]) {
    const binding = constructBindingFromRows(
      mutableCapabilityRow(),
      mutableCapabilityRow(),
      {
        agentKeySource: source,
        executorProfileSource: source,
        timeoutMsSource: source
      }
    );
    assert.equal(binding.projection.agentKeySource, source);
    assert.equal(binding.projection.executorProfileSource, source);
    assert.equal(binding.projection.timeoutMsSource, source);
  }

  const dispatch = mutableCapabilityRow();
  const evaluator = mutableCapabilityRow();
  for (const row of [dispatch, evaluator]) {
    delete row.executorProfile;
    delete row.terminalSessionKeyPrefix;
    delete row.labelPrefix;
  }
  const defaulted = constructBindingFromRows(dispatch, evaluator);
  assert.equal(defaulted.projection.executorProfile, "local-spawn");
  assert.equal(
    defaulted.pluginCapabilities.liveFpDispatch.terminalSessionKeyPrefix,
    undefined
  );
  assert.equal(defaulted.pluginCapabilities.liveFpDispatch.labelPrefix, undefined);

  const ptyDispatch = mutableCapabilityRow({ executorProfile: "pty-terminal" });
  const ptyEvaluator = mutableCapabilityRow({ executorProfile: "pty-terminal" });
  const pty = constructBindingFromRows(ptyDispatch, ptyEvaluator, {
    executorProfile: "pty-terminal"
  });
  assert.equal(pty.projection.executorProfile, "pty-terminal");
  assert.equal(projectLiveCapability(null), null);
  assert.equal(projectLiveCapability(undefined), null);
});

test("R5-6: codex model and sandbox are execution identity", () => {
  withoutLiveEnvironment(() => {
    process.env.ABG_TS_CODEX_MODEL = "model-a";
    process.env.ABG_TS_CODEX_SANDBOX = "workspace-write";
    const first = resolveLiveCapabilityBinding(
      "/workspace/t217-capability",
      liveCommand({ liveAgent: "codex" })
    );
    process.env.ABG_TS_CODEX_MODEL = "model-b";
    const second = resolveLiveCapabilityBinding(
      "/workspace/t217-capability",
      liveCommand({ liveAgent: "codex" })
    );
    process.env.ABG_TS_CODEX_SANDBOX = "danger-full-access";
    const third = resolveLiveCapabilityBinding(
      "/workspace/t217-capability",
      liveCommand({ liveAgent: "codex" })
    );
    assert.notEqual(
      first.projection.executionContractDigest,
      second.projection.executionContractDigest
    );
    assert.notEqual(first.projection.capabilityDigest, second.projection.capabilityDigest);
    assert.notEqual(
      second.projection.executionContractDigest,
      third.projection.executionContractDigest
    );
    assert.notEqual(second.projection.capabilityDigest, third.projection.capabilityDigest);
  });
});

test("R5-6: request-level canonical start helpers are internal", () => {
  assert.equal("startFromRequest" in m04PublicApi, false);
  assert.equal("startFromRequestAsync" in m04PublicApi, false);
});

test("R5-6: published publicStart records live capability before engine entry", () => {
  withoutLiveEnvironment(() => {
    const fixture = buildThreeStageStartContext({
      defaultRegime: "F_D",
      dispatchRef: null
    });
    const liveCapability = resolveLiveCapabilityBinding(
      fixture.input.scope.workspaceRoot,
      liveCommand({ liveAgent: "generic" })
    );
    const events = [];
    const outcome = m04PublicApi.publicStart(
      fixture.input,
      { ...fixture.context, liveCapability },
      (event) => events.push(event)
    );

    assert.equal(outcome.kind, "converged");
    assert.equal(events[0].kind, "lever_resolution_admitted");
    assert.equal(
      events[0].liveCapabilityDigest,
      liveCapability.projection.capabilityDigest
    );
    assert.equal(
      events.filter((event) => event.kind === "lever_resolution_admitted").length,
      1
    );
    const basisIndex = events.findIndex((event) => event.kind === "basis_admitted");
    assert.notEqual(basisIndex, -1);
    assert.ok(basisIndex > 0);
  });
});

test("R5-6: published publicStartAsync records live capability before engine entry", async () => {
  await withoutLiveEnvironment(async () => {
    const fixture = buildThreeStageStartContext({
      defaultRegime: "F_D",
      dispatchRef: null
    });
    const liveCapability = resolveLiveCapabilityBinding(
      fixture.input.scope.workspaceRoot,
      liveCommand({ liveAgent: "generic" })
    );
    const events = [];
    const outcome = await m04PublicApi.publicStartAsync(
      fixture.input,
      { ...fixture.context, liveCapability },
      (event) => events.push(event)
    );

    assert.equal(outcome.kind, "converged");
    assert.equal(events[0].kind, "lever_resolution_admitted");
    assert.equal(
      events[0].liveCapabilityDigest,
      liveCapability.projection.capabilityDigest
    );
    assert.equal(
      events.filter((event) => event.kind === "lever_resolution_admitted").length,
      1
    );
    const basisIndex = events.findIndex((event) => event.kind === "basis_admitted");
    assert.notEqual(basisIndex, -1);
    assert.ok(basisIndex > 0);
  });
});

test("R5-6: capability event precedes a later typed plugin-selection block", async () => {
  await withoutLiveEnvironment(async () => {
    const fixture = buildThreeStageStartContext({
      defaultRegime: "F_P",
      dispatchRef: "dispatch://t217-capability"
    });
    const executive = fixture.context.module.graphFunctions[0];
    const badExecutive = Object.freeze({
      ...executive,
      declarations: Object.freeze({
        entries: Object.freeze([
          ...executive.declarations.entries,
          Object.freeze({
            key: "abg.plugin_selection",
            value: Object.freeze({
              kind: "json_blob",
              value: {
                kind: "object",
                entries: [
                  { key: "fpDispatch", value: "plugin://abg/not-in-catalog" }
                ]
              }
            })
          })
        ])
      })
    });
    const liveCapability = resolveLiveCapabilityBinding(
      fixture.input.scope.workspaceRoot,
      liveCommand({
        liveAgent: "generic",
        liveTimeoutMs: "1000",
        executorProfile: "local-spawn"
      })
    );
    const events = [];
    const outcome = await publicCallableStartAsync(
      fixture.input,
      {
        ...fixture.context,
        module: Object.freeze({
          ...fixture.context.module,
          graphFunctions: Object.freeze([badExecutive])
        }),
        liveCapability
      },
      (event) => events.push(event)
    );
    assert.equal(events[0].kind, "lever_resolution_admitted");
    assert.equal(events[0].liveCapabilityRef, liveCapability.projection.capabilityRef);
    assert.equal(events[0].liveCapabilityDigest, liveCapability.projection.capabilityDigest);
    assert.equal(
      events[0].executionContractDigest,
      liveCapability.projection.executionContractDigest
    );
    assert.equal(events[0].liveAgentKey, "generic");
    assert.equal(events[0].liveAgentKeySource, "flag");
    assert.equal(events[0].liveExecutorProfile, "local-spawn");
    assert.equal(events[0].liveExecutorProfileSource, "flag");
    assert.equal(events[0].liveTimeoutMs, 1000);
    assert.equal(events[0].liveTimeoutMsSource, "flag");
    assert.deepStrictEqual(
      events[0].availableLivePluginRefs,
      liveCapability.projection.availableLivePluginRefs
    );
    assert.equal(outcome.controlOutcome.kind, "blocked");
    assert.match(
      outcome.controlOutcome.stopDetail.gateReason,
      /plugin_selection_unresolvable/u,
      "the public stop projection must retain the canonical terminal reason"
    );
    const selectionFailure = events.find(
      (event) =>
        event.kind === "runtime_failure_observed" &&
        event.surface === "plugin_selection"
    );
    assert.ok(selectionFailure, "selection failure must be replay truth");
    assert.match(selectionFailure.message, /plugin_selection_unresolvable/u);
    assert.ok(events.indexOf(events[0]) < events.indexOf(selectionFailure));

    assert.throws(
      () => assertRuntimeEvent({ ...events[0], liveCapabilityDigest: null }),
      /all absent or all present|all present/u
    );
    assert.throws(
      () => assertRuntimeEvent({ ...events[0], liveTimeoutMs: 1001 }),
      /liveCapabilityDigest does not match/u
    );
    assert.throws(
      () =>
        assertRuntimeEvent({
          ...events[0],
          executionContractDigest: `sha256:${"0".repeat(64)}`
        }),
      /liveCapabilityDigest does not match/u
    );
  });
});
