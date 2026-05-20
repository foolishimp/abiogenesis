// Validates: T-141
// Validates: REQ-R-ABG3-SAGA-FRONTIER
// Validates: REQ-R-ABG3-TRANSPORT

import test from "node:test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  constructBranchExecutionPolicy,
  constructBranchRef,
  constructDependencyFrontierDeclaration,
  deriveBranchFanInProjectionFromEvents,
  deriveBranchIdempotencyKey,
  runEventedNativeSagaFrontier
} from "../../build/semantic/code/src/index.js";
import {
  contractForKnownAgent,
  runAgentTransport
} from "../../build/semantic/code/src/shared/abg_library/index.js";
import { buildThreeStageBasis } from "../tests/support/m03-iteration-fixtures.mjs";

const LIVE_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.dirname(LIVE_DIR);
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "t141_saga_frontier_live"
);

function liveEnabled() {
  return process.env["ABG_TS_T141_LIVE"] === "1" ||
    process.env["CODEX_LIVE_FP"] === "1";
}

function timestampId() {
  return new Date().toISOString().replace(/[-:.]/gu, "").replace("Z", "Z") +
    `_pid${process.pid}`;
}

function transportTimeoutMs() {
  const parsed = Number.parseInt(
    process.env["ABG_TS_LIVE_TIMEOUT_MS"] ?? "180000",
    10
  );
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 180000;
}

function requirePtyExecutorProfile() {
  const raw = process.env["ABG_TS_AGENT_EXECUTOR_PROFILE"] ?? "pty-terminal";
  const normalized = raw.trim();
  assert.equal(
    normalized,
    "pty-terminal",
    "T-141 live lane must exercise the PTY executor profile"
  );
  return normalized;
}

function liveAgentKey() {
  const agentKey = process.env["ABG_TS_LIVE_AGENT"] ?? "claude";
  assert.equal(
    agentKey,
    "claude",
    "T-141 live lane currently exercises the Claude PTY transport contract"
  );
  return agentKey;
}

async function runRoot() {
  const root = path.join(TEST_RUNS_ROOT, timestampId());
  await mkdir(root, { recursive: true });
  return root;
}

function branch(branchKey, input = {}) {
  return constructBranchRef({
    graphCallId: "graph-call://t141/live/1",
    frameId: "frame://t141/live/root",
    vectorIndex: 0,
    branchKey,
    fanInScopeRef: "fan-in://t141/live/root",
    ...input
  });
}

function declaration(branchRef, input = {}) {
  const observedStateRefs = input.observedStateRefs ?? ["observed://t141/live/current"];
  const writeTerritoryRefs =
    input.writeTerritoryRefs ?? [`write://t141/live/${branchRef.branchKey}`];
  const outputAllocationRefs =
    input.outputAllocationRefs ?? [`output://t141/live/${branchRef.branchKey}`];
  const key = deriveBranchIdempotencyKey({
    commandKind: "admit_branch_result",
    branchRef,
    observedStateRefs,
    writeTerritoryRefs,
    outputAllocationRefs
  });
  return constructDependencyFrontierDeclaration({
    branchRef,
    parentBranchRefs: input.parentBranchRefs ?? [],
    observedStateRefs,
    readRefs: input.readRefs ?? ["read://t141/live/shared"],
    writeTerritoryRefs,
    outputAllocationRefs,
    idempotencyKey: key,
    declaredPriority: input.declaredPriority ?? 0,
    criticalPathCost: input.criticalPathCost ?? 0
  });
}

function counters() {
  return {
    active: 0,
    maxActive: 0,
    started: [],
    completed: []
  };
}

function neverRunTask(branchRef, runCounters) {
  return Object.freeze({
    kind: "native_branch_task",
    branchRef: branchRef.branchRef,
    run: async () => {
      runCounters.started.push(branchRef.branchRef);
      throw new Error(`live branch task must not start: ${branchRef.branchKey}`);
    }
  });
}

function liveClaudeBranchTask(input) {
  const token = `ABG_T141_LIVE_${input.branchRef.branchKey.toUpperCase().replace(/[^A-Z0-9]+/gu, "_")}_${timestampId()}`;
  return Object.freeze({
    kind: "native_branch_task",
    branchRef: input.branchRef.branchRef,
    run: async () => {
      input.counters.active += 1;
      input.counters.maxActive = Math.max(
        input.counters.maxActive,
        input.counters.active
      );
      input.counters.started.push(input.branchRef.branchRef);
      let result;
      try {
        result = await runAgentTransport({
          contract: input.contract,
          workerRef: "worker.claude",
          prompt: [
            "You are executing one ABG T-141 saga-frontier branch.",
            `Branch ref: ${input.branchRef.branchRef}`,
            `Branch key: ${input.branchRef.branchKey}`,
            `Return exactly this token and nothing else: ${token}`
          ].join("\n"),
          cwd: input.root,
          archiveRoot: input.root,
          label: input.label,
          executorProfile: input.executorProfile,
          terminalSessionKey:
            `${input.label}-${process.pid}-${Date.now()}`.replace(/[^A-Za-z0-9_.-]/gu, "-"),
          timeoutMs: transportTimeoutMs(),
          traceRoot: path.join(input.root, `${input.label}.trace`)
        });
      } finally {
        input.counters.active -= 1;
      }
      input.counters.completed.push(input.branchRef.branchRef);
      assert.equal(result.executorProfile, "pty-terminal");
      assert.equal(result.workerRef, "worker.claude");
      assert.equal(result.agentKey, "claude");
      assert.equal(result.outcome.kind, "exited");
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.failureClass, null, result.stderr);
      assert.match(result.finalOutput, new RegExp(token, "u"));
      return Object.freeze({
        kind: "native_branch_task_result",
        branchRef: input.branchRef.branchRef,
        payloadDigest: `sha256:t141:live:${token}`,
        evidenceRefs: [
          pathToFileURL(result.outputPath).href,
          ...(result.traceResultPath === null
            ? []
            : [pathToFileURL(result.traceResultPath).href])
        ]
      });
    }
  });
}

function localBranchTask(input) {
  return Object.freeze({
    kind: "native_branch_task",
    branchRef: input.branchRef.branchRef,
    run: async () => {
      input.counters.active += 1;
      input.counters.maxActive = Math.max(
        input.counters.maxActive,
        input.counters.active
      );
      input.counters.started.push(input.branchRef.branchRef);
      await new Promise((resolve) => setTimeout(resolve, input.delayMs ?? 1));
      input.counters.active -= 1;
      input.counters.completed.push(input.branchRef.branchRef);
      return Object.freeze({
        kind: "native_branch_task_result",
        branchRef: input.branchRef.branchRef,
        payloadDigest: `sha256:t141:live:${input.branchRef.branchKey}`,
        evidenceRefs: input.evidenceRefs ?? [
          `evidence://t141/live/${input.branchRef.branchKey}`
        ]
      });
    }
  });
}

function liveClaudeReviewBranchTask(input) {
  const safeReviewerKey = input.reviewerRef.replace(/[^A-Za-z0-9]+/gu, "_");
  const token = `ABG_T141_T167_REVIEW_${safeReviewerKey}_${timestampId()}`;
  return Object.freeze({
    kind: "native_branch_task",
    branchRef: input.branchRef.branchRef,
    run: async () => {
      input.counters.active += 1;
      input.counters.maxActive = Math.max(
        input.counters.maxActive,
        input.counters.active
      );
      input.counters.started.push(input.branchRef.branchRef);
      let result;
      try {
        result = await runAgentTransport({
          contract: input.contract,
          workerRef: "worker.claude",
          prompt: [
            "You are executing one ABG T-141 live branch shaped after odd_sdlc T-167.",
            "The branch is a configured reviewer assessment over a ticket surface.",
            `Ticket surface ref: ${input.subjectRef}`,
            `Reviewer profile ref: ${input.reviewerRef}`,
            `Reviewer profile digest: ${input.profileDigest}`,
            `Return exactly this line and nothing else: ${token} reviewer=${input.reviewerRef} ruling=${input.ruling}`
          ].join("\n"),
          cwd: input.root,
          archiveRoot: input.root,
          label: input.label,
          executorProfile: input.executorProfile,
          terminalSessionKey:
            `${input.label}-${process.pid}-${Date.now()}`.replace(/[^A-Za-z0-9_.-]/gu, "-"),
          timeoutMs: transportTimeoutMs(),
          traceRoot: path.join(input.root, `${input.label}.trace`)
        });
      } finally {
        input.counters.active -= 1;
      }
      input.counters.completed.push(input.branchRef.branchRef);
      assert.equal(result.executorProfile, "pty-terminal");
      assert.equal(result.workerRef, "worker.claude");
      assert.equal(result.agentKey, "claude");
      assert.equal(result.outcome.kind, "exited");
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.failureClass, null, result.stderr);
      assert.equal(result.finalOutput.includes(token), true);
      assert.equal(result.finalOutput.includes(input.reviewerRef), true);
      assert.equal(result.finalOutput.includes(input.ruling), true);
      return Object.freeze({
        kind: "native_branch_task_result",
        branchRef: input.branchRef.branchRef,
        payloadDigest: `sha256:t141:t167:${safeReviewerKey}:${token}`,
        evidenceRefs: [
          `reviewer-profile-ref:${input.reviewerRef}`,
          `reviewer-profile-digest:${input.profileDigest}`,
          pathToFileURL(result.outputPath).href,
          ...(result.traceResultPath === null
            ? []
            : [pathToFileURL(result.traceResultPath).href])
        ]
      });
    }
  });
}

function liveContext() {
  const executorProfile = requirePtyExecutorProfile();
  const contract = contractForKnownAgent(liveAgentKey());
  return { contract, executorProfile };
}

test("T-141 live sunnyday: evented saga frontier runs disjoint live F_P branches concurrently", async (t) => {
  if (!liveEnabled()) {
    t.skip("set ABG_TS_T141_LIVE=1 or CODEX_LIVE_FP=1 to run T-141 live saga frontier proof");
    return;
  }
  const basis = buildThreeStageBasis();
  const root = await runRoot();
  const { contract, executorProfile } = liveContext();
  const alpha = branch("sunny-alpha");
  const beta = branch("sunny-beta");
  const runCounters = counters();
  const emitted = [];
  const result = await runEventedNativeSagaFrontier({
    basis,
    frontierRef: "frontier://t141/live/sunnyday",
    declarations: [
      declaration(alpha, { declaredPriority: 20 }),
      declaration(beta, { declaredPriority: 10 })
    ],
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://t141/live/sunnyday",
      maxConcurrency: 2,
      resolvedSystemPolicyRefs: [
        "abg-default://saga-frontier/live/max-concurrency/two"
      ]
    }),
    tasks: [
      liveClaudeBranchTask({
        branchRef: alpha,
        root,
        contract,
        executorProfile,
        counters: runCounters,
        label: "t141.live.sunny-alpha"
      }),
      liveClaudeBranchTask({
        branchRef: beta,
        root,
        contract,
        executorProfile,
        counters: runCounters,
        label: "t141.live.sunny-beta"
      })
    ],
    eventSink: (event) => {
      emitted.push(event);
    },
    correlationId: "correlation://t141/live/sunnyday",
    leaseStartMs: 100,
    releaseStartMs: 10_000
  });
  const fanIn = deriveBranchFanInProjectionFromEvents({
    fanInRef: alpha.fanInScopeRef,
    events: result.replayEvents,
    declaredOrderBranchRefs: [alpha.branchRef, beta.branchRef]
  });

  assert.equal(runCounters.maxActive, 2);
  assert.equal(result.batchCount, 1);
  assert.deepEqual(result.batches[0].selection.selectedBranchRefs, [
    alpha.branchRef,
    beta.branchRef
  ]);
  assert.deepEqual(
    result.batches[0].emittedEvents.map((event) => event.kind),
    [
      "branch_lease_acquired",
      "branch_lease_acquired",
      "branch_payload_admitted",
      "branch_payload_admitted",
      "branch_lease_released",
      "branch_lease_released",
      "branch_fan_in_projected"
    ]
  );
  assert.deepEqual(result.emittedEvents, emitted);
  assert.deepEqual(fanIn.orderedBranchRefs, [alpha.branchRef, beta.branchRef]);
  assert.equal(fanIn.payloadDigests.length, 2);
  assert.ok(fanIn.evidenceRefs.length >= 2);
});

test("T-141/T-167 live scenario: configured reviewer fan-out reduces into ticket routing", async (t) => {
  if (!liveEnabled()) {
    t.skip("set ABG_TS_T141_LIVE=1 or CODEX_LIVE_FP=1 to run T-141 live saga frontier proof");
    return;
  }
  const basis = buildThreeStageBasis();
  const root = await runRoot();
  const { contract, executorProfile } = liveContext();
  const subjectRef =
    "ticket://odd-sdlc/T-167-define-review-graph-function-for-multi-reviewer-ticket-generation";
  const reviewerFanInRef = "fan-in://t141/live/t167/reviewer-findings";
  const reducerFanInRef = "fan-in://t141/live/t167/reduction";
  const routingFanInRef = "fan-in://t141/live/t167/ticket-routing";
  const codexReviewer = branch("t167-reviewer-codex-live", {
    fanInScopeRef: reviewerFanInRef
  });
  const claudeReviewer = branch("t167-reviewer-claude-live", {
    fanInScopeRef: reviewerFanInRef
  });
  const reducer = branch("t167-reduce-review-live", {
    fanInScopeRef: reducerFanInRef
  });
  const router = branch("t167-route-ticket-live", {
    fanInScopeRef: routingFanInRef
  });
  const runCounters = counters();
  const result = await runEventedNativeSagaFrontier({
    basis,
    frontierRef: "frontier://t141/live/t167-review-ticket-routing",
    declarations: [
      declaration(codexReviewer, {
        declaredPriority: 40,
        readRefs: [subjectRef],
        outputAllocationRefs: [
          "output://t141/live/t167/reviewer-findings/codex"
        ]
      }),
      declaration(claudeReviewer, {
        declaredPriority: 30,
        readRefs: [subjectRef],
        outputAllocationRefs: [
          "output://t141/live/t167/reviewer-findings/claude"
        ]
      }),
      declaration(reducer, {
        declaredPriority: 20,
        parentBranchRefs: [
          codexReviewer.branchRef,
          claudeReviewer.branchRef
        ],
        readRefs: [
          "output://t141/live/t167/reviewer-findings/codex",
          "output://t141/live/t167/reviewer-findings/claude"
        ],
        outputAllocationRefs: ["output://t141/live/t167/decision-rows"]
      }),
      declaration(router, {
        declaredPriority: 10,
        parentBranchRefs: [reducer.branchRef],
        readRefs: ["output://t141/live/t167/decision-rows"],
        outputAllocationRefs: ["output://t141/live/t167/draft-tickets"]
      })
    ],
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://t141/live/t167-review-ticket-routing",
      maxConcurrency: 2,
      resolvedSystemPolicyRefs: [
        "abg-default://saga-frontier/live/max-concurrency/two"
      ]
    }),
    tasks: [
      liveClaudeReviewBranchTask({
        branchRef: codexReviewer,
        root,
        contract,
        executorProfile,
        counters: runCounters,
        label: "t141.live.t167-reviewer-codex",
        subjectRef,
        reviewerRef: "reviewer://odd-sdlc/codex",
        profileDigest: "sha256:t167-reviewer-codex-profile",
        ruling: "split_ticket"
      }),
      liveClaudeReviewBranchTask({
        branchRef: claudeReviewer,
        root,
        contract,
        executorProfile,
        counters: runCounters,
        label: "t141.live.t167-reviewer-claude",
        subjectRef,
        reviewerRef: "reviewer://odd-sdlc/claude",
        profileDigest: "sha256:t167-reviewer-claude-profile",
        ruling: "deferred"
      }),
      localBranchTask({
        branchRef: reducer,
        counters: runCounters,
        evidenceRefs: ["evidence://t141/live/t167/decision-rows"]
      }),
      localBranchTask({
        branchRef: router,
        counters: runCounters,
        evidenceRefs: ["evidence://t141/live/t167/draft-ticket"]
      })
    ],
    eventSink: () => {},
    correlationId: "correlation://t141/live/t167-review-ticket-routing"
  });
  const reviewerFanIn = deriveBranchFanInProjectionFromEvents({
    fanInRef: reviewerFanInRef,
    events: result.replayEvents,
    declaredOrderBranchRefs: [
      codexReviewer.branchRef,
      claudeReviewer.branchRef
    ]
  });

  assert.equal(runCounters.maxActive, 2);
  assert.equal(result.batchCount, 3);
  assert.deepEqual(result.batches[0].selection.selectedBranchRefs, [
    codexReviewer.branchRef,
    claudeReviewer.branchRef
  ]);
  assert.deepEqual(result.batches[1].selection.selectedBranchRefs, [
    reducer.branchRef
  ]);
  assert.deepEqual(result.batches[2].selection.selectedBranchRefs, [
    router.branchRef
  ]);
  assert.deepEqual(reviewerFanIn.orderedBranchRefs, [
    codexReviewer.branchRef,
    claudeReviewer.branchRef
  ]);
  assert.equal(
    reviewerFanIn.evidenceRefs.includes("reviewer-profile-ref:reviewer://odd-sdlc/codex"),
    true
  );
  assert.equal(
    reviewerFanIn.evidenceRefs.includes("reviewer-profile-ref:reviewer://odd-sdlc/claude"),
    true
  );
  assert.deepEqual(result.failedBranchRefs, []);
});

test("T-141 live negative: event-store failure before lease admission starts no live branch worker", async (t) => {
  if (!liveEnabled()) {
    t.skip("set ABG_TS_T141_LIVE=1 or CODEX_LIVE_FP=1 to run T-141 live saga frontier proof");
    return;
  }
  requirePtyExecutorProfile();
  const basis = buildThreeStageBasis();
  const alpha = branch("event-store-negative-alpha");
  const runCounters = counters();
  await assert.rejects(
    async () =>
      runEventedNativeSagaFrontier({
        basis,
        frontierRef: "frontier://t141/live/event-store-negative",
        declarations: [declaration(alpha)],
        policy: constructBranchExecutionPolicy({
          policyRef: "policy://t141/live/event-store-negative",
          maxConcurrency: 1
        }),
        tasks: [neverRunTask(alpha, runCounters)],
        eventSink: () => {
          throw new Error("live event append unavailable");
        },
        correlationId: "correlation://t141/live/event-store-negative"
      }),
    /live event append unavailable/u
  );

  assert.deepEqual(runCounters.started, []);
});

test("T-141 live negative: stale and underdeclared rows do not dispatch live-capable branch tasks", async (t) => {
  if (!liveEnabled()) {
    t.skip("set ABG_TS_T141_LIVE=1 or CODEX_LIVE_FP=1 to run T-141 live saga frontier proof");
    return;
  }
  requirePtyExecutorProfile();
  const basis = buildThreeStageBasis();
  const stale = branch("stale-negative");
  const underdeclared = branch("underdeclared-negative");
  const staleCounters = counters();
  const underdeclaredCounters = counters();
  const staleResult = await runEventedNativeSagaFrontier({
    basis,
    frontierRef: "frontier://t141/live/stale-negative",
    declarations: [
      declaration(stale, {
        observedStateRefs: ["observed://t141/live/stale"]
      })
    ],
    staleObservedStateRefs: ["observed://t141/live/stale"],
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://t141/live/stale-negative",
      maxConcurrency: 2
    }),
    tasks: [neverRunTask(stale, staleCounters)],
    eventSink: () => {},
    correlationId: "correlation://t141/live/stale-negative"
  });
  const underdeclaredResult = await runEventedNativeSagaFrontier({
    basis,
    frontierRef: "frontier://t141/live/underdeclared-negative",
    declarations: [constructDependencyFrontierDeclaration({ branchRef: underdeclared })],
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://t141/live/underdeclared-negative",
      maxConcurrency: 2
    }),
    tasks: [neverRunTask(underdeclared, underdeclaredCounters)],
    eventSink: () => {},
    correlationId: "correlation://t141/live/underdeclared-negative"
  });

  assert.equal(staleResult.batchCount, 0);
  assert.deepEqual(staleResult.emittedEvents, []);
  assert.deepEqual(staleCounters.started, []);
  assert.equal(underdeclaredResult.batchCount, 0);
  assert.deepEqual(underdeclaredResult.emittedEvents, []);
  assert.deepEqual(underdeclaredCounters.started, []);
});

test("T-141 live sunnyday: shared output allocation serializes live F_P branches under parallel capacity", async (t) => {
  if (!liveEnabled()) {
    t.skip("set ABG_TS_T141_LIVE=1 or CODEX_LIVE_FP=1 to run T-141 live saga frontier proof");
    return;
  }
  const basis = buildThreeStageBasis();
  const root = await runRoot();
  const { contract, executorProfile } = liveContext();
  const alpha = branch("shared-output-alpha");
  const beta = branch("shared-output-beta");
  const sharedOutput = "output://t141/live/shared-output";
  const runCounters = counters();
  const result = await runEventedNativeSagaFrontier({
    basis,
    frontierRef: "frontier://t141/live/shared-output",
    declarations: [
      declaration(alpha, {
        declaredPriority: 20,
        writeTerritoryRefs: [],
        outputAllocationRefs: [sharedOutput]
      }),
      declaration(beta, {
        declaredPriority: 10,
        writeTerritoryRefs: [],
        outputAllocationRefs: [sharedOutput]
      })
    ],
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://t141/live/shared-output",
      maxConcurrency: 2,
      resolvedSystemPolicyRefs: [
        "abg-default://saga-frontier/live/max-concurrency/two"
      ]
    }),
    tasks: [
      liveClaudeBranchTask({
        branchRef: alpha,
        root,
        contract,
        executorProfile,
        counters: runCounters,
        label: "t141.live.shared-output-alpha"
      }),
      liveClaudeBranchTask({
        branchRef: beta,
        root,
        contract,
        executorProfile,
        counters: runCounters,
        label: "t141.live.shared-output-beta"
      })
    ],
    eventSink: () => {},
    correlationId: "correlation://t141/live/shared-output"
  });

  assert.equal(runCounters.maxActive, 1);
  assert.equal(result.batchCount, 2);
  assert.deepEqual(result.batches[0].selection.selectedBranchRefs, [alpha.branchRef]);
  assert.deepEqual(result.batches[1].selection.selectedBranchRefs, [beta.branchRef]);
});
