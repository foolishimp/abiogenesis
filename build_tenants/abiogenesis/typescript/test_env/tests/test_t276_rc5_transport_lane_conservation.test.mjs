// Validates: T-276 RC5 successor-baseline conservation through the production
// standard live plugin boundary and the real runAgentTransport subprocess path.

import test from "node:test";
import assert from "node:assert/strict";
import {
  chmodSync,
  mkdtempSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  standardLiveFpDispatchPlugin,
  standardLiveFpEvaluatorPlugin
} from "../../build/semantic/code/src/abg/m03/index.js";

const RESULT_CONTRACT_REF = "contract://t276/rc5-lane-result";
const MANIFEST = Object.freeze({
  renderedPrompt: "return the declared typed result",
  manifestRef: "manifest://t276/rc5-lane",
  selectedOutputContractRef: RESULT_CONTRACT_REF
});

function fakeClaudeCapability(events, label) {
  const root = mkdtempSync(path.join(tmpdir(), `t276-${label}-`));
  const argvPath = path.join(root, "argv.json");
  const command = path.join(root, "fake-claude.cjs");
  writeFileSync(
    command,
    [
      "#!/usr/bin/env node",
      `require("node:fs").writeFileSync(${JSON.stringify(argvPath)}, JSON.stringify(process.argv.slice(2)));`,
      `for (const event of ${JSON.stringify(events)}) console.log(JSON.stringify(event));`
    ].join("\n"),
    "utf8"
  );
  chmodSync(command, 0o755);
  return {
    argvPath,
    capability: {
      agentContract: Object.freeze({
        agentKey: "claude",
        command,
        argsTemplate: Object.freeze([]),
        sanitizedEnvironmentPolicy: Object.freeze({
          prefixes: Object.freeze([])
        })
      }),
      archiveRoot: path.join(root, "archive"),
      cwd: root,
      timeoutMs: 30000,
      labelPrefix: label
    }
  };
}

function dispatchInput() {
  const cCallRef = "c-call://t276/rc5-lane/dispatch";
  return {
    basisId: "basis://t276/rc5-lane",
    vectorIndex: 0,
    sourceProjectionRef: "projection://t276/rc5-lane",
    instructionPromptManifest: MANIFEST,
    cCallRef,
    actorInvocationRef: {
      actorInvocationId: "actor-invocation://t276/rc5-lane",
      attemptIndex: 0,
      dispatchRef: "dispatch://t276/rc5-lane",
      resultRef: "result://t276/rc5-lane"
    }
  };
}

function evaluatorInput() {
  return {
    basisId: "basis://t276/rc5-lane",
    vectorIndex: 1,
    sourceProjectionRef: "projection://t276/rc5-lane",
    instructionPromptManifest: MANIFEST,
    expectedAssessmentIds: [],
    selectedCompositionRef: "composition://t276/rc5-lane",
    selectedCompositionDigest: "digest://t276/rc5-lane",
    selectedRegimeBindingRef: null,
    cCallRef: "c-call://t276/rc5-lane/evaluator"
  };
}

test("RC5 lane posture crosses the production dispatch and evaluator seams", async () => {
  const artifact = {
    result_contract_ref: RESULT_CONTRACT_REF,
    edge: "source->target",
    actor: "worker://t276/rc5-lane",
    fulfillment_assessments: [
      {
        id: "assessment://t276/rc5-lane",
        evaluator: "assessment://t276/rc5-lane",
        fulfillment_status: "fulfilled",
        fulfillment_detail: "worker-executes lane observed",
        blocking_reasons: [],
        evidence_refs: ["evidence://t276/rc5-lane"]
      }
    ],
    target_value: { message: "lane target" }
  };
  const dispatchFixture = fakeClaudeCapability(
    [
      {
        type: "assistant",
        message: {
          content: [
            {
              type: "tool_use",
              id: "toolu_dispatch_lane",
              name: "Bash",
              input: { command: "node --test" }
            }
          ]
        }
      },
      {
        type: "result",
        subtype: "success",
        result: JSON.stringify(artifact)
      }
    ],
    "dispatch-lane"
  );
  const dispatchOutcome = await standardLiveFpDispatchPlugin(
    dispatchFixture.capability
  ).dispatch(dispatchInput());
  assert.equal(dispatchOutcome.status, "dispatched");
  const dispatchArgs = JSON.parse(readFileSync(dispatchFixture.argvPath, "utf8"));
  assert.ok(!dispatchArgs.includes("--safe-mode"));
  assert.ok(!dispatchArgs.includes("--tools"));

  const evaluatorFixture = fakeClaudeCapability(
    [
      {
        type: "assistant",
        message: {
          content: [
            {
              type: "tool_use",
              id: "toolu_evaluator_lane",
              name: "Bash",
              input: { command: "echo must-not-run" }
            }
          ]
        }
      },
      {
        type: "result",
        subtype: "success",
        result: JSON.stringify({
          resultContractRef: RESULT_CONTRACT_REF,
          accepted: true,
          closeDisposition: "close",
          assessmentIds: [],
          reasons: []
        })
      }
    ],
    "evaluator-lane"
  );
  const evaluatorOutcome = await standardLiveFpEvaluatorPlugin(
    evaluatorFixture.capability
  ).evaluate(evaluatorInput());
  assert.equal(evaluatorOutcome.status, "blocked");
  assert.match(evaluatorOutcome.reason, /failureClass=contract_failure/u);
  const evaluatorArgs = JSON.parse(
    readFileSync(evaluatorFixture.argvPath, "utf8")
  );
  assert.ok(evaluatorArgs.includes("--safe-mode"));
  const toolsIndex = evaluatorArgs.indexOf("--tools");
  assert.notEqual(toolsIndex, -1);
  assert.equal(evaluatorArgs[toolsIndex + 1], "");
});
