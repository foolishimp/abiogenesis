// T-217/S2.3 diff-execution witnesses for the standard live plugin lifecycle.

import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  standardLiveFpDispatchPlugin,
  standardLiveFpEvaluatorPlugin
} from "../../build/semantic/code/src/abg/m03/index.js";

const RESULT_CONTRACT_REF = "contract://t217/diff-witness";

const MANIFEST = Object.freeze({
  renderedPrompt: "return a JSON object",
  manifestRef: "manifest://t217/diff-witness",
  selectedOutputContractRef: RESULT_CONTRACT_REF
});

const VALID_REVIEW_SCRIPT = `console.log(${JSON.stringify(
  JSON.stringify({
    resultContractRef: RESULT_CONTRACT_REF,
    accepted: true,
    closeDisposition: "close",
    assessmentIds: [],
    reasons: []
  })
)})`;

const VALID_DISPATCH_SCRIPT = `console.log(${JSON.stringify(
  JSON.stringify({
    result_contract_ref: RESULT_CONTRACT_REF,
    edge: "source->target",
    actor: "worker://t217/diff-witness",
    fulfillment_assessments: [
      {
        id: "assessment://t217/diff-witness",
        fulfillment_status: "fulfilled",
        evidence_refs: ["evidence://t217/diff-witness"]
      }
    ]
  })
)})`;

function fakeAgentContract(script, argsTemplate = ["-e", script]) {
  return Object.freeze({
    agentKey: "generic",
    command: process.execPath,
    argsTemplate: Object.freeze(argsTemplate),
    sanitizedEnvironmentPolicy: Object.freeze({ prefixes: Object.freeze([]) })
  });
}

function capability(script, options = {}) {
  const root = mkdtempSync(path.join(tmpdir(), "t217-live-plugin-witness-"));
  const {
    argsTemplate = ["-e", script],
    ...capabilityOverrides
  } = options;
  return {
    agentContract: fakeAgentContract(script, argsTemplate),
    archiveRoot: path.join(root, "archive"),
    cwd: root,
    timeoutMs: 30000,
    labelPrefix: "witness",
    ...capabilityOverrides
  };
}

function dispatchInput(
  manifest = MANIFEST,
  cCallRef = "c-call://t217/live-plugin-witness/dispatch"
) {
  return {
    basisId: "basis://t217/live-plugin-witness",
    vectorIndex: 0,
    sourceProjectionRef: "projection://t217/live-plugin-witness",
    instructionPromptManifest: manifest,
    cCallRef
  };
}

function evaluatorInput(
  manifest = MANIFEST,
  cCallRef = "c-call://t217/live-plugin-witness/evaluation"
) {
  return {
    basisId: "basis://t217/live-plugin-witness",
    vectorIndex: 1,
    sourceProjectionRef: "projection://t217/live-plugin-witness",
    instructionPromptManifest: manifest,
    expectedAssessmentIds: [],
    selectedCompositionRef: "composition://t217/live-plugin-witness",
    selectedCompositionDigest: "digest://t217/live-plugin-witness",
    selectedRegimeBindingRef: null,
    cCallRef
  };
}

function canonicalize(value) {
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "string"
  ) {
    return value;
  }
  if (typeof value === "number") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((row) => canonicalize(row));
  }
  const result = {};
  for (const key of Object.keys(value).sort()) {
    if (value[key] !== undefined) {
      result[key] = canonicalize(value[key]);
    }
  }
  return result;
}

function digest(value) {
  const text = `${JSON.stringify(canonicalize(value), null, 2)}\n`;
  return createHash("sha256").update(text).digest("hex");
}

function bundleRootFor(capabilityRow, cCallRef) {
  const bundleId = createHash("sha256").update(cCallRef).digest("hex");
  return path.join(capabilityRow.archiveRoot, "by-c-call", bundleId);
}

function replaceCachedOutcome(capabilityRow, cCallRef, outcome) {
  const completionPath = path.join(
    bundleRootFor(capabilityRow, cCallRef),
    "completion.json"
  );
  const completion = JSON.parse(readFileSync(completionPath, "utf8"));
  const body = {
    kind: completion.kind,
    version: completion.version,
    cCallRef: completion.cCallRef,
    seam: completion.seam,
    pluginRef: completion.pluginRef,
    requestDigest: completion.requestDigest,
    outcomeDigest: digest(outcome),
    artifactDigests: completion.artifactDigests,
    outcome
  };
  writeFileSync(
    completionPath,
    `${JSON.stringify({ ...body, completionDigest: digest(body) }, null, 2)}\n`,
    "utf8"
  );
}

function preparationFailureManifest(message) {
  let promptReads = 0;
  return {
    get renderedPrompt() {
      promptReads += 1;
      if (promptReads === 3) {
        throw new Error(message);
      }
      return "return a JSON object";
    },
    manifestRef: `manifest://t217/${message}`,
    selectedOutputContractRef: RESULT_CONTRACT_REF
  };
}

function outputPathAgent(scriptBody) {
  const script = [
    "const fs=require('node:fs')",
    "const path=require('node:path')",
    scriptBody
  ].join(";");
  return {
    script,
    argsTemplate: ["-e", script, "{output_path}"]
  };
}

test("standard live plugins: non-archive errors refuse with source-only evidence", async () => {
  const thrown = { toString: () => "non-error manifest refusal" };
  const manifest = {
    manifestRef: "manifest://t217/non-error-refusal",
    selectedOutputContractRef: RESULT_CONTRACT_REF,
    get renderedPrompt() {
      throw thrown;
    }
  };
  const plugin = standardLiveFpDispatchPlugin(
    capability("throw new Error('worker must not run')")
  );

  const outcome = await plugin.dispatch(dispatchInput(manifest));

  assert.equal(outcome.status, "blocked");
  assert.match(outcome.reason, /archive refused: non-error manifest refusal/u);
  assert.deepStrictEqual(outcome.evidenceRefs, [
    "projection://t217/live-plugin-witness"
  ]);
});

test("standard live plugins: malformed cached outcomes fail closed at each seam", async () => {
  const dispatchCapability = capability(
    VALID_DISPATCH_SCRIPT
  );
  const dispatchPlugin = standardLiveFpDispatchPlugin(dispatchCapability);
  const dispatchRef = "c-call://t217/live-plugin-witness/cached-dispatch";
  await dispatchPlugin.dispatch(dispatchInput(MANIFEST, dispatchRef));
  replaceCachedOutcome(dispatchCapability, dispatchRef, { status: "evaluated" });

  const dispatchOutcome = await dispatchPlugin.dispatch(
    dispatchInput(MANIFEST, dispatchRef)
  );
  assert.equal(dispatchOutcome.status, "blocked");
  assert.match(dispatchOutcome.reason, /wrong outcome kind/u);

  const evaluatorCapability = capability(
    VALID_REVIEW_SCRIPT
  );
  const evaluatorPlugin = standardLiveFpEvaluatorPlugin(evaluatorCapability);
  const evaluatorRef = "c-call://t217/live-plugin-witness/cached-evaluator";
  const firstEvaluatorOutcome = await evaluatorPlugin.evaluate(
    evaluatorInput(MANIFEST, evaluatorRef)
  );
  const reusedEvaluatorOutcome = await evaluatorPlugin.evaluate(
    evaluatorInput(MANIFEST, evaluatorRef)
  );
  assert.deepStrictEqual(reusedEvaluatorOutcome, firstEvaluatorOutcome);

  replaceCachedOutcome(evaluatorCapability, evaluatorRef, {
    status: "dispatched",
    resultRef: "result://wrong-seam"
  });
  const malformedEvaluatorOutcome = await evaluatorPlugin.evaluate(
    evaluatorInput(MANIFEST, evaluatorRef)
  );
  assert.equal(malformedEvaluatorOutcome.status, "blocked");
  assert.match(malformedEvaluatorOutcome.reason, /wrong outcome kind/u);
});

test("standard live plugins: prelaunch artifact failures block before transport", async () => {
  const cases = [
    {
      name: "dispatch",
      invoke: (plugin, manifest) => plugin.dispatch(dispatchInput(manifest)),
      plugin: standardLiveFpDispatchPlugin(
        capability("throw new Error('dispatch worker must not run')")
      )
    },
    {
      name: "evaluation",
      invoke: (plugin, manifest) => plugin.evaluate(evaluatorInput(manifest)),
      plugin: standardLiveFpEvaluatorPlugin(
        capability("throw new Error('evaluation worker must not run')")
      )
    }
  ];

  for (const row of cases) {
    const outcome = await row.invoke(
      row.plugin,
      preparationFailureManifest(`${row.name}-preparation-failure`)
    );
    assert.equal(outcome.status, "blocked", row.name);
    assert.match(outcome.reason, /archive preparation failed/u, row.name);
    assert.match(outcome.reason, /contract_failure/u, row.name);
  }
});

test("standard live evaluator: null identity and archive conflict refuse before effects", async () => {
  const cap = capability(VALID_REVIEW_SCRIPT);
  const plugin = standardLiveFpEvaluatorPlugin(cap);
  const nullIdentity = await plugin.evaluate(evaluatorInput(MANIFEST, null));
  assert.equal(nullIdentity.status, "blocked");
  assert.match(nullIdentity.reason, /canonical cCallRef/u);

  const cCallRef = "c-call://t217/live-plugin-witness/evaluator-conflict";
  const first = await plugin.evaluate(evaluatorInput(MANIFEST, cCallRef));
  assert.equal(first.status, "evaluated");
  const changedManifest = {
    ...MANIFEST,
    renderedPrompt: "changed effect truth"
  };
  const conflict = await plugin.evaluate(
    evaluatorInput(changedManifest, cCallRef)
  );
  assert.equal(conflict.status, "blocked");
  assert.match(conflict.reason, /archive_identity_conflict/u);
  assert.equal(
    conflict.evidenceRefs.includes(
      "live-plugin-archive-refusal:archive_identity_conflict"
    ),
    true
  );
});

test("standard live plugins: thrown transports remain blocked when completion also fails", async () => {
  const agent = outputPathAgent(
    [
      "fs.mkdirSync(process.argv[1])",
      "fs.writeFileSync(path.join(path.dirname(process.argv[1]),'completion.json'),'occupied')",
      "console.log(JSON.stringify({accepted:true,ok:true}))"
    ].join(";")
  );
  const cases = [
    {
      name: "dispatch",
      plugin: standardLiveFpDispatchPlugin(
        capability(agent.script, { argsTemplate: agent.argsTemplate })
      ),
      invoke: (plugin) =>
        plugin.dispatch(
          dispatchInput(
            MANIFEST,
            "c-call://t217/live-plugin-witness/dispatch-transport-throw"
          )
        )
    },
    {
      name: "evaluation",
      plugin: standardLiveFpEvaluatorPlugin(
        capability(agent.script, { argsTemplate: agent.argsTemplate })
      ),
      invoke: (plugin) =>
        plugin.evaluate(
          evaluatorInput(
            MANIFEST,
            "c-call://t217/live-plugin-witness/evaluator-transport-throw"
          )
        )
    }
  ];

  for (const row of cases) {
    const outcome = await row.invoke(row.plugin);
    assert.equal(outcome.status, "blocked", row.name);
    assert.match(outcome.reason, /transport threw after launch/u, row.name);
    assert.match(outcome.reason, /contract_failure/u, row.name);
  }
});

test("standard live plugins: successful transport plus completion collision fails finalization", async () => {
  const agent = outputPathAgent(
    [
      "fs.writeFileSync(path.join(path.dirname(process.argv[1]),'completion.json'),'occupied')",
      "console.log(JSON.stringify({accepted:true,ok:true}))"
    ].join(";")
  );
  const cases = [
    {
      name: "dispatch",
      plugin: standardLiveFpDispatchPlugin(
        capability(agent.script, {
          argsTemplate: agent.argsTemplate,
          executorProfile: "local-spawn",
          terminalSessionKeyPrefix: "witness-session"
        })
      ),
      invoke: (plugin) =>
        plugin.dispatch(
          dispatchInput(
            MANIFEST,
            "c-call://t217/live-plugin-witness/dispatch-finalization"
          )
        )
    },
    {
      name: "evaluation",
      plugin: standardLiveFpEvaluatorPlugin(
        capability(agent.script, {
          argsTemplate: agent.argsTemplate,
          executorProfile: "local-spawn",
          terminalSessionKeyPrefix: "witness-session"
        })
      ),
      invoke: (plugin) =>
        plugin.evaluate(
          evaluatorInput(
            MANIFEST,
            "c-call://t217/live-plugin-witness/evaluator-finalization"
          )
        )
    }
  ];

  for (const row of cases) {
    const outcome = await row.invoke(row.plugin);
    assert.equal(outcome.status, "blocked", row.name);
    assert.match(outcome.reason, /archive finalization failed after launch/u, row.name);
    assert.match(outcome.reason, /contract_failure/u, row.name);
  }
});
