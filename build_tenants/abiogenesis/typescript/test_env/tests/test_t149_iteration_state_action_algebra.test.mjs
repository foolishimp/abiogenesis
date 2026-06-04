// Validates: T-149
// Validates: REQ-R-ABG3-ITERATION

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  constructEnginePluginContract,
  constructFpDispatchOutcome,
  runEngineIterate
} from "../../build/semantic/code/src/index.js";
import {
  constructAssuranceAuthoritySnapshot,
  constructAssuranceEvidenceRow,
  constructFrameOpenedEvent,
  constructGraphCallOpenedEvent,
  constructVectorTraversalPlannedEvent,
  deriveAssuranceClosureDecision,
  deriveAssuranceProjection,
  deriveAssuranceScopeRef,
  deriveIterationOutcomeProjection,
  deriveRuntimeAggregateProjection
} from "../../build/semantic/code/src/abg/m03/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

function sourceFile(relativePath) {
  return readFileSync(join(process.cwd(), relativePath), "utf8");
}

function functionBody(source, functionName) {
  const start = source.indexOf(`function ${functionName}`);
  assert.notEqual(start, -1, `${functionName} must exist`);
  let parenDepth = 0;
  let openBrace = -1;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (char === "(") {
      parenDepth += 1;
    } else if (char === ")") {
      parenDepth -= 1;
    } else if (char === "{" && parenDepth === 0) {
      openBrace = index;
      break;
    }
  }
  assert.notEqual(openBrace, -1, `${functionName} must have a body`);
  let depth = 0;
  for (let index = openBrace; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(openBrace + 1, index);
      }
    }
  }
  assert.fail(`${functionName} body must close`);
}

function assertFoldMaterializer(relativePath, functionName) {
  const body = functionBody(sourceFile(relativePath), functionName);
  const foldIndex = body.search(
    /deriveIterationOutcome(?:FromRows|Projection)\s*\(/u
  );
  assert.notEqual(
    foldIndex,
    -1,
    `${functionName} must consume the iteration outcome fold`
  );
  const preFold = body.slice(0, foldIndex);
  assert.doesNotMatch(
    preFold,
    /\b(?:action|decision|disposition)\s*=\s*["'](?:retry_same_edge|blocked|reprice_runtime_policy|yield_same_edge_continuation|close|retry|block|qualified_defer|reprice)["']/u,
    `${functionName} must not assign a legacy outcome before the fold`
  );
}

function assertCallsFoldBackedHelper(relativePath, functionName, helperName) {
  assert.match(
    functionBody(sourceFile(relativePath), functionName),
    new RegExp(`\\b${helperName}\\s*\\(`, "u"),
    `${functionName} must call ${helperName}`
  );
  assertFoldMaterializer(relativePath, helperName);
}

function runtimeFixture({ vectorIndex = 1 } = {}) {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t149"
  });
  const events = [
    constructGraphCallOpenedEvent(basis),
    constructFrameOpenedEvent(basis),
    constructVectorTraversalPlannedEvent({ basis, vectorIndex })
  ];
  const projection = deriveRuntimeAggregateProjection(basis, events);
  return { basis, vectorIndex, projection };
}

function derive(runtime, extra) {
  return deriveIterationOutcomeProjection({
    basis: runtime.basis,
    runtimeProjection: runtime.projection,
    vectorIndex: runtime.vectorIndex,
    ...extra
  });
}

function satisfaction(row) {
  return Object.freeze({
    authorityRef: row.authorityRef,
    status: row.status,
    reason: row.reason ?? null,
    lifecycle: row.lifecycle ?? "active",
    evidenceRefs: row.evidenceRefs ?? [`evidence://${row.authorityRef}`],
    reEntryPoint: row.reEntryPoint ?? null
  });
}

function assuranceBase() {
  const basis = buildThreeStageBasis();
  const projection = deriveRuntimeAggregateProjection(basis, []);
  const scope = deriveAssuranceScopeRef({
    basis,
    projection,
    vectorIndex: 0
  });
  return { basis, projection, scope };
}

function authoritySnapshot(scope, authorityRefs) {
  return constructAssuranceAuthoritySnapshot({
    scope,
    authorityRefs,
    inputRefs: ["input://t149/current"],
    authorityDigest: "authority-digest:t149",
    inputDigest: "input-digest:t149",
    providerRefs: ["provider://t149"],
    policyRefs: ["policy://t149"]
  });
}

function assuranceEvidence(scope, input) {
  return constructAssuranceEvidenceRow({
    scope,
    evidenceRef: input.evidenceRef,
    authorityRef: input.authorityRef,
    authorityDigest: input.authorityDigest ?? "authority-digest:t149",
    inputDigest: input.inputDigest ?? "input-digest:t149",
    eventRefs: [`event://${input.evidenceRef}`],
    providerRefs: ["provider://t149"],
    policyRefs: ["policy://t149"],
    boundToScope: input.boundToScope,
    complete: true,
    lifecycle: input.lifecycle
  });
}

function fpDispatchContract(ref) {
  return constructEnginePluginContract({
    ref,
    pluginKind: "fp_dispatch",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FpDispatchOutcome"
  });
}

function attachedArtifact(input, options = {}) {
  const assessmentIds =
    input.expectedAssessmentIds.length > 0
      ? input.expectedAssessmentIds
      : ["runtime_fulfilled"];
  return {
    edge: options.edge ?? input.expectedEdge ?? input.edge,
    actor: "codex",
    fulfillment_assessments: assessmentIds.map((assessmentId) => ({
      id: assessmentId,
      evaluator: assessmentId,
      fulfillment_status: "fulfilled",
      fulfillment_detail: "attached worker result accepted",
      blocking_reasons: [],
      evidence_refs: [`proof://${assessmentId}`]
    })),
    selected_worker_id: "worker://t149",
    selected_backend: "backend://node",
    role_id: "role://runtime",
    assignment_source: "policy_resolution",
    resolved_runtime_ref: "runtime://typescript/node"
  };
}

test("T-149 mixed rows block before converged", () => {
  const runtime = runtimeFixture();
  const projection = derive(runtime, {
    satisfactionRows: [
      satisfaction({ authorityRef: "authority://ok", status: "satisfied" }),
      satisfaction({
        authorityRef: "authority://missing",
        status: "unsatisfied",
        reason: "missing_authority"
      })
    ]
  });

  assert.deepEqual(projection.outcome, {
    kind: "terminate",
    disposition: "blocked",
    reason: "missing_authority",
    reEntryPoint: "requirements"
  });
});

test("T-149 evaluator proof redispatch outranks product evidence redispatch", () => {
  const runtime = runtimeFixture();
  const projection = derive(runtime, {
    satisfactionRows: [
      satisfaction({
        authorityRef: "authority://partial",
        status: "unsatisfied",
        reason: "partial_evidence"
      })
    ],
    runtimeRows: [
      {
        boundary: "evaluator",
        status: "failed",
        reason: "evaluator_failure",
        retryable: true,
        evidenceRefs: ["evidence://evaluator-failure"]
      }
    ]
  });

  assert.equal(projection.outcome.kind, "redispatch");
  assert.equal(projection.outcome.target.reEntryPoint, "proof");
  assert.equal(projection.outcome.target.targetVectorIndex, runtime.vectorIndex);
});

test("T-149 preserved rebased evidence remains satisfying current closure", () => {
  const runtime = runtimeFixture();
  const projection = derive(runtime, {
    satisfactionRows: [
      satisfaction({
        authorityRef: "authority://attempt-1-a",
        status: "satisfied",
        lifecycle: "preserved_rebased",
        evidenceRefs: ["evidence://attempt-1-a"]
      }),
      satisfaction({
        authorityRef: "authority://attempt-2-b",
        status: "satisfied",
        lifecycle: "active",
        evidenceRefs: ["evidence://attempt-2-b"]
      })
    ]
  });

  assert.deepEqual(projection.outcome, {
    kind: "terminate",
    disposition: "converged",
    reason: null,
    reEntryPoint: null
  });
});

test("T-149 superseded evidence is replay-visible but cannot block", () => {
  const runtime = runtimeFixture();
  const projection = derive(runtime, {
    satisfactionRows: [
      satisfaction({
        authorityRef: "authority://old",
        status: "unsatisfied",
        reason: "missing_evidence",
        lifecycle: "superseded",
        evidenceRefs: ["evidence://old"]
      }),
      satisfaction({
        authorityRef: "authority://current",
        status: "satisfied",
        lifecycle: "active",
        evidenceRefs: ["evidence://current"]
      })
    ]
  });

  assert.equal(projection.satisfactionRows.length, 2);
  assert.deepEqual(projection.outcome, {
    kind: "terminate",
    disposition: "converged",
    reason: null,
    reEntryPoint: null
  });
});

test("T-149 terminal fallback cannot outrank current satisfied rows", () => {
  const runtime = runtimeFixture();
  const satisfied = derive(runtime, {
    satisfactionRows: [
      satisfaction({ authorityRef: "authority://current", status: "satisfied" })
    ],
    terminalFallbackRefs: ["terminal-retry://prior-attempt"]
  });

  assert.deepEqual(satisfied.outcome, {
    kind: "terminate",
    disposition: "converged",
    reason: null,
    reEntryPoint: null
  });

  const fallbackOnly = derive(runtime, {
    terminalFallbackRefs: ["terminal-retry://current"]
  });

  assert.equal(fallbackOnly.outcome.kind, "redispatch");
  assert.equal(fallbackOnly.outcome.reason, "terminal_retry_fallback");
  assert.equal(fallbackOnly.outcome.target.reEntryPoint, "realization");
  assert.equal(fallbackOnly.outcome.target.targetVectorIndex, runtime.vectorIndex);
});

test("T-149 edgeCanClose cannot bypass unsatisfied current rows", () => {
  const runtime = runtimeFixture();
  const projection = derive(runtime, {
    edgeCanClose: true,
    satisfactionRows: [
      satisfaction({
        authorityRef: "authority://uncaught-runtime",
        status: "unsatisfied",
        reason: "runtime_failure",
        evidenceRefs: ["evidence://uncaught-runtime"]
      })
    ]
  });

  assert.notEqual(projection.outcome.kind, "redispatch");
  assert.deepEqual(projection.outcome, {
    kind: "terminate",
    disposition: "blocked",
    reason: "unsupported_state",
    reEntryPoint: null
  });
});

test("T-149 orphan binding guard terminates blocked with diagnostics", () => {
  const runtime = runtimeFixture();
  const projection = derive(runtime, {
    satisfactionRows: [
      satisfaction({ authorityRef: "authority://ok", status: "satisfied" })
    ],
    bindingGuardRows: [
      {
        status: "orphan",
        authorityRef: "authority://old",
        evidenceRef: "evidence://old",
        failedCondition: "evidence_has_no_current_scope_authority_binding",
        eventRefs: ["event://old"]
      }
    ]
  });

  assert.equal(projection.outcome.kind, "terminate");
  assert.equal(projection.outcome.disposition, "blocked");
  assert.equal(projection.outcome.reason, "orphan_current_binding");
  assert.equal(projection.bindingGuardRows[0].evidenceRef, "evidence://old");
});

test("T-149 stale authority evidence is not orphan evidence", () => {
  const base = assuranceBase();
  const projection = deriveAssuranceProjection({
    basis: base.basis,
    runtimeProjection: base.projection,
    authoritySnapshot: authoritySnapshot(base.scope, ["authority://current"]),
    evidenceRows: [
      assuranceEvidence(base.scope, {
        evidenceRef: "evidence://prior-attempt",
        authorityRef: "authority://superseded",
        authorityDigest: "authority-digest:t149:prior",
        lifecycle: "superseded",
        boundToScope: true
      })
    ]
  });
  const statuses = new Set(projection.ambiguityRows.map((row) => row.status));
  const decision = deriveAssuranceClosureDecision(projection);

  assert.equal(statuses.has("orphan_evidence"), false);
  assert.equal(statuses.has("missing"), true);
  assert.equal(decision.decision, "retry");
});

test("T-149 unbound evidence remains true orphan evidence", () => {
  const base = assuranceBase();
  const projection = deriveAssuranceProjection({
    basis: base.basis,
    runtimeProjection: base.projection,
    authoritySnapshot: authoritySnapshot(base.scope, ["authority://current"]),
    evidenceRows: [
      assuranceEvidence(base.scope, {
        evidenceRef: "evidence://orphan",
        authorityRef: "authority://superseded",
        boundToScope: false
      })
    ]
  });
  const statuses = new Set(projection.ambiguityRows.map((row) => row.status));
  const decision = deriveAssuranceClosureDecision(projection);

  assert.equal(statuses.has("orphan_evidence"), true);
  assert.equal(decision.decision, "block");
});

test("T-149 suspend rows map only below higher priority rows", () => {
  const runtime = runtimeFixture();
  for (const [status, reason] of [
    ["progressing", "progressing"],
    ["awaiting_observer", "awaiting_observer"],
    ["handoff", "handoff"]
  ]) {
    const projection = derive(runtime, {
      runtimeRows: [
        {
          boundary: "liveness",
          status,
          reason: null,
          retryable: false
        }
      ]
    });
    assert.deepEqual(projection.outcome, { kind: "suspend", reason });
  }

  const blocked = derive(runtime, {
    runtimeRows: [
      {
        boundary: "liveness",
        status: "progressing",
        reason: null,
        retryable: false
      }
    ],
    bindingGuardRows: [
      {
        status: "orphan",
        authorityRef: "authority://old",
        evidenceRef: "evidence://old",
        failedCondition: "evidence_has_no_current_scope_authority_binding"
      }
    ]
  });
  assert.equal(blocked.outcome.kind, "terminate");
  assert.equal(blocked.outcome.disposition, "blocked");
});

test("T-149 runner path uses fold-backed attached F_P blocked-artifact stop", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t149-attached-worker"
  });
  const events = [];
  let dispatchCount = 0;
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://test/t149-attached-worker"),
    dispatch: (input) => {
      dispatchCount += 1;
      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t149-attached/${dispatchCount}`,
        attachedResultArtifact: attachedArtifact(input, {
          edge: "wrong_source→wrong_target"
        }),
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });

  const result = runEngineIterate({
    basis,
    eventSink: (event) => {
      events.push(event);
    },
    plugins: { fpDispatch },
    maxAttachedFpAttempts: 1
  });

  assert.equal(dispatchCount, 2);
  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  assert.equal(
    events.some((event) => event.kind === "retry_repair_planned"),
    true
  );
  assert.equal(
    events.some((event) => event.kind === "retry_attempt_stopped"),
    true
  );
  assert.equal(
    events.filter((event) => event.kind === "terminal_reached").length,
    1
  );
});

test("T-149 structural guard: migrated transition surfaces use the one fold", () => {
  assert.equal(
    existsSync("code/src/abg/m03/contracts/iteration.ts"),
    false,
    "iteration.ts must not remain as a compatibility transition surface"
  );

  for (const path of [
    "code/src/abg/m03/contracts/index.ts",
    "code/src/abg/m03/contracts/constructors.ts",
    "code/src/abg/m03/contracts/graph_span_reentry.ts",
    "code/src/abg/m03/contracts/traversal_structure_probe.ts",
    "code/src/abg/m03/runner/engine_runner.ts"
  ]) {
    assert.doesNotMatch(
      sourceFile(path),
      /from\s+["'][^"']*iteration\.js["']/u,
      `${path} must not import the removed iteration.ts surface`
    );
  }

  assert.match(
    sourceFile("code/src/abg/m03/contracts/assurance.ts"),
    /deriveIterationOutcomeFromRows/u,
    "assurance closure must materialize from the iteration fold"
  );
  assert.match(
    sourceFile("code/src/abg/m03/contracts/traversal_non_progress.ts"),
    /deriveIterationOutcomeFromRows/u,
    "traversal non-progress must materialize from the iteration fold"
  );
  assert.match(
    sourceFile("code/src/abg/m03/contracts/runtime_liveness.ts"),
    /deriveIterationOutcomeFromRows/u,
    "runtime liveness must materialize from the iteration fold"
  );
  assert.match(
    sourceFile("code/src/abg/m03/contracts/graph_span_reentry.ts"),
    /deriveIterationOutcomeFromRows/u,
    "graph re-entry transition must materialize from the iteration fold"
  );
  assert.match(
    sourceFile("code/src/abg/m03/contracts/continuation_transition.ts"),
    /deriveIterationOutcomeProjection/u,
    "continuation transition must materialize from the iteration projection"
  );
  assert.match(
    sourceFile("code/src/abg/m03/runner/engine_runner.ts"),
    /deriveIterationOutcomeFromRows/u,
    "F_D authority terminalization must materialize from the iteration fold"
  );
  for (const [path, functionName] of [
    ["code/src/abg/m03/contracts/assurance.ts", "deriveAssuranceClosureDecision"],
    [
      "code/src/abg/m03/contracts/traversal_non_progress.ts",
      "deriveTraversalContinuationActionProjection"
    ],
    [
      "code/src/abg/m03/contracts/continuation_transition.ts",
      "deriveRuntimeContinuationTransitionProjection"
    ],
    [
      "code/src/abg/m03/contracts/graph_span_reentry.ts",
      "deriveAdvancementTransitionWithReentry"
    ],
    ["code/src/abg/m03/runner/engine_runner.ts", "fdAuthorityTerminalTransition"]
  ]) {
    assertFoldMaterializer(path, functionName);
  }
  assertCallsFoldBackedHelper(
    "code/src/abg/m03/runner/attached_fp_worker.ts",
    "deriveAttachedFpResultDecision",
    "assertBlockedResultFoldAgreement"
  );
  assertFoldMaterializer(
    "code/src/abg/m03/runner/engine_runner.ts",
    "boundedAttemptExitTransition"
  );

  const genericSurfaces = [
    "code/src/abg/m03/contracts/iteration_state_action.ts",
    "code/src/abg/m03/contracts/assurance.ts",
    "code/src/abg/m03/contracts/continuation_transition.ts",
    "code/src/abg/m03/contracts/graph_span_reentry.ts",
    "code/src/abg/m03/contracts/traversal_non_progress.ts",
    "code/src/abg/m03/contracts/runtime_liveness.ts",
    "code/src/abg/m03/runner/attached_fp_worker.ts"
  ].map(sourceFile).join("\n");
  assert.doesNotMatch(
    genericSurfaces,
    /odd_sdlc|data_mapper|SBT|JVM|Scala|hello_world|JavaScript/u,
    "iteration outcome surfaces must not import product or stack vocabulary"
  );
});
