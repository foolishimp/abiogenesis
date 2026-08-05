import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  buildRootCliScenario,
  runInstalledCli,
  setupInstalledCliHarness,
} from "../support/root-cli-environment.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT_CONTRACT_REF =
  "contract://abiogenesis/conformance/fp-hello-output@5";
const REFUSAL_CONTRACT_REF =
  "contract://abiogenesis/conformance/fp-hello-refusal@5";
const FP_PROGRAM_REF = "program://abiogenesis/conformance/fp-hello@5";
const FP_GRAPH_FUNCTION_REF =
  "graph-function://abiogenesis/conformance/fp-hello@5";
const FP_RETRY_PROGRAM_REF =
  "program://abiogenesis/conformance/fp-retry-hello@5";
const FP_RETRY_GRAPH_FUNCTION_REF =
  "graph-function://abiogenesis/conformance/fp-retry-hello@5";
const FD_FP_PROGRAM_REF = "program://abiogenesis/conformance/fd-fp-hello@5";
const COMPOSE_PROGRAM_REF =
  "program://abiogenesis/conformance/hello-compose@5";
const COMPOSE_GRAPH_FUNCTION_REF =
  "graph-function://abiogenesis/conformance/hello-compose@5";
const WORKFLOW_PROGRAM_REF =
  "program://abiogenesis/conformance/hello-workflow@5";
const WORKFLOW_GRAPH_FUNCTION_REF =
  "graph-function://abiogenesis/conformance/hello-workflow@5";
const WORKFLOW_CHILD_REF =
  "graph-function://abiogenesis/conformance/hello-world@5";
const GATE_PROGRAM_REF =
  "program://abiogenesis/conformance/hello-gate@5";
const GATE_GRAPH_FUNCTION_REF =
  "graph-function://abiogenesis/conformance/hello-gate@5";
const GATE_TARGET_REF =
  "graph-function://abiogenesis/conformance/hello-gate-target@5";
const RECURSION_PROGRAM_REF =
  "program://abiogenesis/conformance/bounded-recursion@5";
const RECURSION_GRAPH_FUNCTION_REF =
  "graph-function://abiogenesis/conformance/bounded-recursion@5";
const RECURSION_CHILD_REF =
  "graph-function://abiogenesis/conformance/bounded-recursion-step@5";
const FAN_OUT_PROGRAM_REF =
  "program://abiogenesis/conformance/fan-out-hello@5";
const FAN_OUT_GRAPH_FUNCTION_REF =
  "graph-function://abiogenesis/conformance/fan-out-hello@5";
const FAN_OUT_ELEMENT_REF =
  "graph-function://abiogenesis/conformance/fan-out-hello-element@5";
const FAN_IN_REDUCER_REF =
  "graph-function://abiogenesis/conformance/fan-out-hello-reducer@5";
const ACTOR_REF = "actor://abiogenesis/conformance/claude-worker@5";
const WORKER_BINDING_REF =
  "worker-binding://abiogenesis/conformance/claude-worker@5";
const INSTALLED_WITNESS_TIMEOUT_MS = 180_000;

function fpInput(subject) {
  return {
    kind: "fp_hello_instruction",
    schemaVersion: "5.0.0",
    materializationPlanRef: "prompt-plan://abiogenesis/conformance/fp-hello@5",
    rendererRef: "renderer://abiogenesis/conformance/fp-hello@5",
    instructionContractRef:
      "contract://abiogenesis/conformance/fp-hello-instruction@5",
    resultContractRef: OUTPUT_CONTRACT_REF,
    workerActorRef: ACTOR_REF,
    workerBindingRef: WORKER_BINDING_REF,
    transportLane: "closed_prompt_proof",
    subject,
    instruction: "Produce one concise greeting for the declared subject.",
  };
}

function fanOutInput(subjects, blockedOrdinal = null) {
  return {
    kind: "fan_out_hello_vector_input",
    schemaVersion: "5.0.0",
    members: subjects.map((subject, ordinal) => ({
      ordinal,
      memberRef:
        `fan-out-member://abiogenesis/conservation/${ordinal}/${encodeURIComponent(subject)}`,
      value: {
        kind: "fan_out_hello_member_input",
        schemaVersion: "5.0.0",
        block: ordinal === blockedOrdinal,
        subject,
      },
    })),
  };
}

async function installWorkerFixture(harness) {
  const bin = join(harness.scratch, "conservation-bin");
  await mkdir(bin, { recursive: true });
  const command = join(bin, "claude");
  await writeFile(command, [
    "#!/usr/bin/env node",
    "const { existsSync, readFileSync, writeFileSync } = require('node:fs');",
    "let prompt = '';",
    "process.stdin.setEncoding('utf8');",
    "process.stdin.on('data', (chunk) => { prompt += chunk; });",
    "process.stdin.on('end', () => {",
    "  const line = prompt.split(/\\r?\\n/).find((value) => value.startsWith('Subject: '));",
    "  const subject = line === undefined ? 'Unknown' : JSON.parse(line.slice('Subject: '.length));",
    "  const counterPath = process.env.ABG_MATRIX_RETRY_COUNTER;",
    "  const prior = counterPath && existsSync(counterPath) ? Number(readFileSync(counterPath, 'utf8')) : 0;",
    "  const attempt = prior + 1;",
    "  if (counterPath) writeFileSync(counterPath, String(attempt));",
    "  const result = { kind: 'fp_hello_output', schemaVersion: '5.0.0',",
    `    resultContractRef: '${OUTPUT_CONTRACT_REF}', actorRef: '${ACTOR_REF}',`,
    "    message: process.env.ABG_MATRIX_CONTRADICTORY === '1' ? `Goodbye ${subject}` : `Hello ${subject}` };",
    "  const malformed = process.env.ABG_MATRIX_MALFORMED === '1' || process.env.ABG_MATRIX_ALWAYS_MALFORMED === '1' || (counterPath && attempt === 1);",
    "  console.log(JSON.stringify({ type: 'system', subtype: 'init' }));",
    "  console.log(JSON.stringify({ type: 'result', subtype: 'success',",
    "    result: malformed ? '{not-json' : JSON.stringify(result) }));",
    "});",
    "",
  ].join("\n"), "utf8");
  await chmod(command, 0o755);
  return command;
}

async function readEvents(path) {
  try {
    const text = await readFile(path, "utf8");
    return text.trim().length === 0
      ? []
      : text.trim().split(/\r?\n/u).map((line) => JSON.parse(line));
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

async function runScenario(harness, label, options = {}, environment = {}) {
  const scenario = await buildRootCliScenario(
    harness,
    label,
    (payload) => payload,
    options,
  );
  const run = await runInstalledCli(harness, scenario, { environment });
  return { scenario, run, events: await readEvents(scenario.eventLogPath) };
}

function assertSuccessfulInstalled(evidence) {
  assert.equal(evidence.run.exitCode, 0, evidence.run.stdout);
  assert.equal(evidence.run.outcomes.length, 7, evidence.run.stdout);
  assert.equal(
    evidence.run.outcomes.every((outcome) => outcome.disposition === "succeeded"),
    true,
  );
  assert.equal(evidence.run.outcomes[6].replayAgreement, true);
  assert.equal(evidence.events.at(-1)?.kind, "run_closed");
}

function assertNoCompiledCarrier(events) {
  const serialized = JSON.stringify(events);
  assert.equal(serialized.includes("CompiledCProgramPlan"), false);
  assert.equal(serialized.includes("compiled_execution"), false);
  assert.equal(serialized.includes("publicControlLoop"), false);
}

function assertCrossWireRefuses(evidence) {
  assert.equal(evidence.run.exitCode, 2, evidence.run.stdout);
  assert.equal(evidence.run.outcomes[6].disposition, "refused");
  assert.equal(evidence.run.outcomes[6].runId, null);
  assert.deepEqual(
    evidence.events.map((event) => event.kind),
    ["public_operation_artifact_admitted", "public_operation_artifact_admitted"],
  );
}

function assertMalformedFpBlocks(evidence) {
  assert.equal(evidence.run.exitCode, 2, evidence.run.stdout);
  assert.equal(evidence.run.outcomes[6].disposition, "blocked");
  assert.equal(
    evidence.run.outcomes[6].admittedResultContractRef,
    REFUSAL_CONTRACT_REF,
  );
  assert.equal(evidence.events.at(-1)?.kind, "run_stopped");
  assert.equal(evidence.events.at(-1)?.payload.disposition, "blocked");
  assert.equal(
    evidence.events.some((event) => event.kind === "run_closed"),
    false,
  );
  assert.equal(
    evidence.events.some((event) =>
      event.kind === "c_call_result_admitted" &&
      event.payload.contractRef === OUTPUT_CONTRACT_REF),
    false,
  );
}

function proven(axis, behavior, proof, verify) {
  return {
    axis,
    behavior,
    status: "proven",
    witness46:
      `PENDING immutable RC5 witness reconciliation for ${behavior}`,
    ...proof,
    verify,
  };
}

const matrix = [
  proven("compute_fibre", "F_D", {
    gtlExpression: "C.of leaf with fibre F_D",
    hogPath: "direct C-call through the admitted deterministic leaf port",
    abgEvidence: "F_D fibre, deterministic evidence, result, judgment, terminal route",
    publicOutcome: "installed CLI result agrees with replay",
    invalidMutation: "cross-wired equivalent GraphFunction refuses before Run admission",
  }, ({ fd, crossWire }) => {
    assertSuccessfulInstalled(fd);
    assert.equal(fd.events.find((event) =>
      event.kind === "c_call_fibre_selected")?.payload.regime, "F_D");
    assert.equal(fd.events.some((event) =>
      event.kind === "actor_invocation_started"), false);
    assertCrossWireRefuses(crossWire);
  }),
  proven("compute_fibre", "F_P", {
    gtlExpression: "C.of leaf with fibre F_P and one admitted worker binding",
    hogPath: "direct C-call through one-shot probabilistic effect port",
    abgEvidence: "transport, actor, process, artifact, probabilistic evidence, result, judgment",
    publicOutcome: "installed CLI admits exact attributed worker result and replay",
    invalidMutation: "malformed worker output becomes a blocked refusal before success admission",
  }, ({ fp, malformedFp }) => {
    assertSuccessfulInstalled(fp);
    assert.equal(fp.events.find((event) =>
      event.kind === "c_call_fibre_selected")?.payload.regime, "F_P");
    assert.equal(fp.events.some((event) =>
      event.kind === "actor_invocation_started"), true);
    assert.equal(fp.events.some((event) =>
      event.kind === "c_call_evidenced" &&
      event.payload.evidenceClass === "probabilistic_transport"), true);
    assertMalformedFpBlocks(malformedFp);
  }),
  proven("compute_fibre", "F_H", {
    gtlExpression: "terminal C.of F_H locus in an independently published GTL Program",
    hogPath: "hold at the exact term cursor, then owner-rehydrate and resume after response admission",
    abgEvidence: "pending C-call, continuation open/respond/resume, same-run closure and replay",
    publicOutcome: "project.read, interaction.respond, and run.continue return one typed result",
    invalidMutation: "malformed response and wrong actor refuse before continuation response admission",
  }, ({ externalMixed }) => {
    assert.equal(
      externalMixed.status,
      0,
      `${externalMixed.stdout}\n${externalMixed.stderr}`,
    );
    assert.match(
      externalMixed.stdout,
      /M5 reopens and completes an external mixed F_D\/F_P\/F_H program/u,
    );
  }),
  proven("compute_fibre", "mixed", {
    gtlExpression: "one independent GTL C.compose containing F_D, F_P, and terminal F_H loci",
    hogPath: "one direct HoG fold crosses all three fibres without a product-specific controller",
    abgEvidence: "exactly three fibre selections and three complete C-call spines in one Run",
    publicOutcome: "installed extension path holds, responds, continues, closes, and agrees with replay",
    invalidMutation: "malformed F_H response and wrong actor cannot advance the held run",
  }, ({ externalMixed }) => {
    assert.equal(
      externalMixed.status,
      0,
      `${externalMixed.stdout}\n${externalMixed.stderr}`,
    );
  }),

  proven("structural_form", "atomic_call", {
    gtlExpression: "one C.of leaf",
    hogPath: "one cursor and one admitted leaf invocation",
    abgEvidence: "one complete C-call spine in one Frame",
    publicOutcome: "one installed direct result with replay agreement",
    invalidMutation: "unowned GraphFunction substitution refuses before Run admission",
  }, ({ fd, crossWire }) => {
    assertSuccessfulInstalled(fd);
    assert.equal(fd.events.filter((event) => event.kind === "c_call_opened").length, 1);
    assert.equal(fd.events.filter((event) => event.kind === "c_call_judged").length, 1);
    assertCrossWireRefuses(crossWire);
  }),
  proven("structural_form", "flat_composition", {
    gtlExpression: "canonical identity-eliding C.compose",
    hogPath: "ordered C-term cursors without an anonymous child Frame",
    abgEvidence: "six ordered C-call spines under one GraphCall and Frame",
    publicOutcome: "composed installed result agrees with replay",
    invalidMutation: "nested/identity malformed terms refuse in the C-algebra mutation suite",
  }, ({ compose }) => {
    assertSuccessfulInstalled(compose);
    assert.equal(compose.events.filter((event) => event.kind === "graph_call_opened").length, 1);
    assert.equal(compose.events.filter((event) => event.kind === "frame_opened").length, 1);
    assert.equal(compose.events.filter((event) => event.kind === "c_call_opened").length, 6);
  }),
  proven("structural_form", "edge_program", {
    gtlExpression: "C.edge transform/evaluate/consequence inside C.retry",
    hogPath: "declared transform, evaluate, and consequence cursors",
    abgEvidence: "three role-bearing C-call spines and admitted routes",
    publicOutcome: "edge consequence supplies the installed terminal result",
    invalidMutation: "invalid role and contract joins refuse in the C-algebra mutation suite",
  }, ({ compose }) => {
    assertSuccessfulInstalled(compose);
    const roles = compose.events
      .filter((event) => event.kind === "c_call_opened")
      .map((event) => event.payload.stageRole);
    assert.deepEqual(roles.slice(-3), ["transform", "evaluate", "consequence"]);
  }),
  proven("structural_form", "adaptive_declared_selection", {
    gtlExpression: "GateApplication bound to one F_D evaluator and one named admitted target",
    hogPath: "evaluator judgment either advances into the named child or blocks before child entry",
    abgEvidence: "evaluator result, judgment, caused route, and selected child GraphCall are replay truth",
    publicOutcome: "installed CLI succeeds only on the admitted gate advance path",
    invalidMutation: "detached evaluator relation fails validation and a blocked judgment cannot enter the target",
  }, ({ gate, gateBlocked }) => {
    assertSuccessfulInstalled(gate);
    const evaluator = gate.events.find(
      (event) =>
        event.kind === "c_call_opened" &&
        event.payload.stageRole === "evaluate",
    );
    assert.notEqual(evaluator, undefined);
    const evaluatorFibre = gate.events.find(
      (event) =>
        event.kind === "c_call_fibre_selected" &&
        event.aggregateId === evaluator.aggregateId,
    );
    assert.notEqual(evaluatorFibre, undefined);
    assert.match(
      evaluatorFibre.payload.compositionRef,
      /^graph-function-application:\/\/abiogenesis\/[a-f0-9]{64}$/u,
    );
    const judgment = gate.events.find(
      (event) =>
        event.kind === "c_call_judged" &&
        event.aggregateId === evaluator.aggregateId,
    );
    const route = gate.events.find(
      (event) =>
        event.kind === "traversal_route_admitted" &&
        event.payload.cCallRef === evaluator.aggregateId,
    );
    assert.equal(judgment.payload.judgment, "advance");
    assert.equal(route.payload.routeKind, "advance");
    assert.equal(route.causationEventRefs.includes(judgment.eventId), true);
    assert.equal(
      gate.events.some(
        (event) =>
          event.kind === "graph_call_opened" &&
          event.graphFunctionRef === GATE_TARGET_REF,
      ),
      true,
    );
    assert.equal(gateBlocked.run.exitCode, 2, gateBlocked.run.stdout);
    assert.equal(gateBlocked.run.outcomes[6].disposition, "blocked");
    assert.equal(
      gateBlocked.events.some(
        (event) =>
          event.kind === "graph_call_opened" &&
          event.graphFunctionRef === GATE_TARGET_REF,
      ),
      false,
    );
  }),
  proven("structural_form", "batch", {
    gtlExpression: "C.batch with two ordered C.of tasks",
    hogPath: "two task cursors retaining batch identity and task ordinal",
    abgEvidence: "two independently evidenced and judged C-call spines",
    publicOutcome: "batch completion preserves ordered cardinality before continuation",
    invalidMutation: "duplicate or malformed task identities refuse in the C-algebra mutation suite",
  }, ({ compose }) => {
    assertSuccessfulInstalled(compose);
    const tasks = compose.events
      .filter((event) => event.kind === "c_call_opened")
      .filter((event) => event.payload.batchRef !== null)
      .map((event) => ({
        batchRef: event.payload.batchRef,
        taskOrdinal: event.payload.taskOrdinal,
      }));
    assert.deepEqual(tasks, [
      { batchRef: "batch://abiogenesis/conformance/hello-compose/checks@5", taskOrdinal: 0 },
      { batchRef: "batch://abiogenesis/conformance/hello-compose/checks@5", taskOrdinal: 1 },
    ]);
  }),
  proven("structural_form", "transparent_child_traversal", {
    gtlExpression: "workflow.C targeting one published child GraphFunction",
    hogPath: "transparent parent C-call, child GraphCall/Frame, then parent foldback",
    abgEvidence: "child lineage, sub_traversal evidence, and child_foldback_admitted",
    publicOutcome: "child result closes through the parent installed invocation",
    invalidMutation: "CatalogView omitting the child refuses before the Run opens",
  }, ({ workflow, omittedChild }) => {
    assertSuccessfulInstalled(workflow);
    assert.equal(workflow.events.filter((event) =>
      event.kind === "graph_call_opened").length, 2);
    assert.equal(workflow.events.filter((event) =>
      event.kind === "child_foldback_admitted").length, 1);
    assert.equal(omittedChild.run.exitCode, 2, omittedChild.run.stdout);
    assert.equal(omittedChild.events.some((event) =>
      event.kind === "run_segment_opened"), false);
  }),
  proven("structural_form", "graph_recursion", {
    gtlExpression: "recurse application with a Boolean termination evaluator, identity foldback, and bound four",
    hogPath: "three child GraphCalls re-enter one parent locus through increasing attempts",
    abgEvidence: "three admitted child foldbacks and application routes precede one terminal parent route",
    publicOutcome: "installed CLI returns the terminal folded state with replay agreement",
    invalidMutation: "a non-terminal fourth attempt blocks without opening another child GraphCall",
  }, ({ recursion, recursionBound }) => {
    assertSuccessfulInstalled(recursion);
    assert.deepEqual(
      recursion.events
        .filter((event) =>
          event.kind === "c_call_opened" &&
          event.graphFunctionRef === RECURSION_GRAPH_FUNCTION_REF)
        .map((event) => event.payload.attempt),
      [1, 2, 3, 4],
    );
    assert.equal(recursion.events.filter((event) =>
      event.kind === "child_foldback_admitted" &&
      event.payload.applicationRef !== undefined).length, 3);
    assert.equal(recursionBound.run.exitCode, 2, recursionBound.run.stdout);
    assert.equal(recursionBound.run.outcomes[6].disposition, "blocked");
    assert.equal(recursionBound.events.filter((event) =>
      event.kind === "graph_call_opened" &&
      event.graphFunctionRef === RECURSION_CHILD_REF).length, 3);
    assert.equal(recursionBound.events.at(-1)?.kind, "run_stopped");
  }),
  proven("structural_form", "retry", {
    gtlExpression: "C.retry over one F_P C.of call with budget two",
    hogPath: "same declared term is re-entered with attempt two and a fresh cursor",
    abgEvidence: "two retry attempts and C-calls separated by admitted retry progress",
    publicOutcome: "second admitted result closes one installed invocation",
    invalidMutation: "semantic contradiction blocks without retry progress",
  }, ({ retry, retryContradiction, retryExhausted }) => {
    assertSuccessfulInstalled(retry);
    assert.deepEqual(
      retry.events
        .filter((event) => event.kind === "retry_attempt_opened")
        .map((event) => event.payload.attempt),
      [1, 2],
    );
    assert.equal(retry.events.filter((event) =>
      event.kind === "retry_progress_recorded").length, 1);
    assert.equal(retryContradiction.run.exitCode, 2, retryContradiction.run.stdout);
    assert.equal(retryContradiction.events.some((event) =>
      event.kind === "retry_progress_recorded"), false);
    assert.equal(retryExhausted.run.exitCode, 2, retryExhausted.run.stdout);
    assert.equal(retryExhausted.events.filter((event) =>
      event.kind === "actor_invocation_started").length, 2);
  }),

  proven("consequence_route", "same_edge_retry", {
    gtlExpression: "declared C.retry route over the current wrapped term",
    hogPath: "retry_same_edge targets the same program locus with incremented retry path",
    abgEvidence: "retry judgment and progress causally admit the retry route",
    publicOutcome: "installed replay retains both attempts and the successful successor",
    invalidMutation: "semantic rejection cannot mint retry progress or a second call",
  }, ({ retry, retryContradiction, retryExhausted }) => {
    assertSuccessfulInstalled(retry);
    const routes = retry.events.filter((event) =>
      event.kind === "traversal_route_admitted" &&
      event.payload.routeKind === "retry");
    assert.equal(routes.length, 2);
    assert.equal(routes[0].payload.cCallRef, null);
    assert.notEqual(routes[1].payload.cCallRef, null);
    assert.equal(retryContradiction.events.filter((event) =>
      event.kind === "c_call_opened").length, 1);
    assert.equal(retryExhausted.events.filter((event) =>
      event.kind === "traversal_route_admitted" &&
      event.payload.routeKind === "retry").length, 2);
  }),
  proven("consequence_route", "depth_traversal", {
    gtlExpression: "workflow.C child GraphFunction declaration",
    hogPath: "enter child GraphCall/Frame and return to parent cursor",
    abgEvidence: "parent-child basis lineage and child foldback event",
    publicOutcome: "one public invocation projects the folded child result",
    invalidMutation: "missing child membership refuses before runtime effects",
  }, ({ workflow, omittedChild }) => {
    assertSuccessfulInstalled(workflow);
    assert.equal(workflow.events.some((event) =>
      event.kind === "child_foldback_admitted"), true);
    assert.equal(omittedChild.events.some((event) =>
      event.kind === "run_segment_opened" ||
      event.kind === "c_call_opened" ||
      event.kind === "child_foldback_admitted"), false);
  }),
  proven("consequence_route", "graph_span_reentry", {
    gtlExpression: "Product-owned bounded re_enter application from one selector locus to one earlier locus",
    hogPath: "Product projection selects the target; HoG derives and applies the exact re-entry cursor",
    abgEvidence: "judged selector C-call causes one bounded re_enter route carrying the exact Product projection",
    publicOutcome: "independently packed Product revisits the selected span once and closes with replay agreement",
    invalidMutation: "forward target refuses at validation and a second application fails before another route is admitted",
  }, ({ externalSpanReentry }) => {
    assert.equal(
      externalSpanReentry.status,
      0,
      `${externalSpanReentry.stdout}\n${externalSpanReentry.stderr}`,
    );
  }),
  proven("consequence_route", "public_start_reentry", {
    gtlExpression: "published start re-entering the same Product-owned One Surface Program after an admitted gap_stop",
    hogPath: "fresh successor Run traverses the unchanged Program after exact single-use source-gap admission",
    abgEvidence: "second invocation_admitted binds the consumed source gap before the successor Run opens",
    publicOutcome: "fresh-context public read and start re-entry converge through the ordinary installed Product path",
    invalidMutation: "missing, stale, wrong-workspace, wrong-Program, wrong-gap, non-gap, reduced-ProductSet, and consumed authorities refuse",
  }, ({ externalGapReentry }) => {
    assert.equal(
      externalGapReentry.status,
      0,
      `${externalGapReentry.stdout}\n${externalGapReentry.stderr}`,
    );
    assert.match(
      externalGapReentry.stdout,
      /M5 exposes a durable gap and re-enters it through the same external Product/u,
    );
  }),
  proven("consequence_route", "ticket_traversal", {
    gtlExpression: "developer-owned ticket Program and GraphFunction with one declared C.of work leaf",
    hogPath: "installed direct traversal enters only the ticket Program's admitted callable",
    abgEvidence: "ticket C-call evidence, result, judgment, terminal route, and closure remain one replayed Run",
    publicOutcome: "installed CLI returns the Product-owned typed ticket result",
    invalidMutation: "the same ticket GraphFunction under another Program refuses before Run admission",
  }, ({ externalTicket }) => {
    assert.equal(
      externalTicket.status,
      0,
      `${externalTicket.stdout}\n${externalTicket.stderr}`,
    );
    assert.match(
      externalTicket.stdout,
      /M5 invokes external ticket work only through its owning Program and GraphFunction/u,
    );
  }),
  proven("consequence_route", "fh_input_required", {
    gtlExpression: "Product-selected F_H C.of action under the admitted One Surface composition",
    hogPath: "exact cursor yields at the human-input locus and resumes only after owner rehydration",
    abgEvidence: "atomic pending judgment, hold route, continuation, attributed response, and resume truth",
    publicOutcome: "fresh-context status, response, and continuation expose one typed held-then-completed traversal",
    invalidMutation: "wrong actor, malformed response, missing authority, and substituted intent cannot advance the hold",
  }, ({ externalGapReentry }) => {
    assert.equal(
      externalGapReentry.status,
      0,
      `${externalGapReentry.stdout}\n${externalGapReentry.stderr}`,
    );
  }),
  proven("consequence_route", "escalation_or_reprice", {
    gtlExpression: "Product-observed correction pressure followed by one typed F_H correction response",
    hogPath: "the resumed One Surface traversal evaluates evidence, refreshes, and stops on the Product's exact correction",
    abgEvidence: "construction delta, correction route, and run stop retain reprice or escalation truth without closure",
    publicOutcome: "fresh-context status and replay return the exact reprice or escalate disposition",
    invalidMutation: "a correction carried by the ordinary approval variant refuses without changing the event log",
  }, ({ externalCorrections }) => {
    assert.equal(
      externalCorrections.status,
      0,
      `${externalCorrections.stdout}\n${externalCorrections.stderr}`,
    );
  }),
  proven("consequence_route", "gap_stop", {
    gtlExpression: "Product-owned evaluateNext emits a no-action gap_stop projection",
    hogPath: "admitted no-action judgment stops before target traversal, F_H interaction, or closure",
    abgEvidence: "gap_stop traversal route and run_stopped preserve the exact Product gap basis",
    publicOutcome: "project.read(gaps) returns the durable unresolved frontier without appending truth",
    invalidMutation: "unsupported no-action meaning and substituted gap authorities refuse without retry or closure",
  }, ({ externalGapReentry }) => {
    assert.equal(
      externalGapReentry.status,
      0,
      `${externalGapReentry.stdout}\n${externalGapReentry.stderr}`,
    );
  }),
  proven("consequence_route", "non_admit", {
    gtlExpression: "Program/GraphFunction membership admission",
    hogPath: "no HoG entry when declaration or basis admission fails",
    abgEvidence: "no Run or event stream is minted",
    publicOutcome: "typed refused outcome with null Run identity",
    invalidMutation: "cross-wire an equivalent but unowned GraphFunction",
  }, ({ crossWire }) => assertCrossWireRefuses(crossWire)),

  proven("runtime_disposition", "advance_vector", {
    gtlExpression: "next declared C-term cursor",
    hogPath: "apply admitted advance route to the current cursor",
    abgEvidence: "traversal_route_admitted with a non-null target cursor",
    publicOutcome: "installed traversal advances and later closes with replay agreement",
    invalidMutation: "no undeclared target cursor is accepted",
  }, ({ compose }) => {
    assertSuccessfulInstalled(compose);
    assert.equal(compose.events.some((event) =>
      event.kind === "traversal_route_admitted" &&
      event.payload.routeKind === "advance" &&
      event.payload.targetCursorRef !== null), true);
  }),
  proven("runtime_disposition", "close", {
    gtlExpression: "declared terminal C-call",
    hogPath: "terminal route after admitted result and judgment",
    abgEvidence: "terminal_reached followed by run_closed",
    publicOutcome: "succeeded result with replay agreement",
    invalidMutation: "malformed F_P output cannot mint terminal or closure",
  }, ({ fd, malformedFp }) => {
    assertSuccessfulInstalled(fd);
    assert.equal(fd.events.some((event) => event.kind === "terminal_reached"), true);
    assertMalformedFpBlocks(malformedFp);
  }),
  proven("runtime_disposition", "retry_same_edge", {
    gtlExpression: "bounded C.retry with retained input basis",
    hogPath: "failed structural output advances to one fresh same-edge attempt",
    abgEvidence: "retry judgment, progress, route, and new attempt are append-only truth",
    publicOutcome: "one installed result closes after the retry chain",
    invalidMutation: "non-retryable semantic disagreement remains blocked",
  }, ({ retry, retryContradiction, retryExhausted }) => {
    assertSuccessfulInstalled(retry);
    const calls = retry.events.filter((event) => event.kind === "c_call_opened");
    assert.equal(calls.length, 2);
    assert.notEqual(calls[0].aggregateId, calls[1].aggregateId);
    assert.deepEqual(
      retry.events
        .filter((event) => event.kind === "c_call_judged")
        .map((event) => event.payload.judgment),
      ["retry", "advance"],
    );
    assert.equal(retryContradiction.events.at(-1)?.kind, "run_stopped");
    assert.deepEqual(
      retryExhausted.events
        .filter((event) => event.kind === "c_call_judged")
        .map((event) => event.payload.judgment),
      ["retry", "blocked"],
    );
  }),
  proven("runtime_disposition", "repair", {
    gtlExpression: "post-evidence evaluateNext emits one typed repair no-action projection",
    hogPath: "HoG applies the admitted gap-stop route without terminal traversal",
    abgEvidence: "runtime archive inspection, construction delta, repair route, and run_stopped remain causal",
    publicOutcome: "run.continue and fresh project.read return repair with replay agreement",
    invalidMutation: "an approve-variant correction response refuses before durable response admission",
  }, ({ externalCorrections }) => {
    assert.equal(
      externalCorrections.status,
      0,
      `${externalCorrections.stdout}\n${externalCorrections.stderr}`,
    );
  }),
  proven("runtime_disposition", "re_enter", {
    gtlExpression: "public start under one exact Product-owned single-use gap re-entry basis",
    hogPath: "successor Run enters the unchanged One Surface Program after source-gap consumption",
    abgEvidence: "invocation_admitted records exact prior Run, route, stop, projection, and gap lineage",
    publicOutcome: "the installed successor Run holds and then converges without rebasing Product authority",
    invalidMutation: "a rebased second consumption of the same source gap refuses before another Run opens",
  }, ({ externalGapReentry }) => {
    assert.equal(
      externalGapReentry.status,
      0,
      `${externalGapReentry.stdout}\n${externalGapReentry.stderr}`,
    );
  }),
  proven("runtime_disposition", "yield_continuation", {
    gtlExpression: "declared F_H interaction locus under the selected Product action",
    hogPath: "traversal yields at the exact cursor and later resumes from durable owner-rehydrated state",
    abgEvidence: "continuation open, response, and resume events preserve one append-only Run lineage",
    publicOutcome: "held public outcome supplies durable read/respond/continue authority across fresh contexts",
    invalidMutation: "stale or substituted continuation authority refuses without consuming the hold",
  }, ({ externalGapReentry }) => {
    assert.equal(
      externalGapReentry.status,
      0,
      `${externalGapReentry.stdout}\n${externalGapReentry.stderr}`,
    );
  }),
  proven("runtime_disposition", "inspect_runtime_archive", {
    gtlExpression: "post-evidence evaluateNext emits one typed runtime-archive inspection projection",
    hogPath: "HoG stops after the Product evaluator consumes the admitted runtime evidence basis",
    abgEvidence: "the inspected archive projection binds four real causal event references before run_stopped",
    publicOutcome: "fresh status exposes the same inspection identity and exact stopped disposition",
    invalidMutation: "variant mismatch cannot create an archive-inspection response or route",
  }, ({ externalCorrections }) => {
    assert.equal(
      externalCorrections.status,
      0,
      `${externalCorrections.stdout}\n${externalCorrections.stderr}`,
    );
  }),
  proven("runtime_disposition", "reprice", {
    gtlExpression: "Product-observed authority state plus typed human response yields a reprice projection",
    hogPath: "the same One Surface refresh reaches reprice without target traversal or closure",
    abgEvidence: "continue_candidate decision, construction delta, reprice route, and run_stopped are replayed",
    publicOutcome: "run.continue and fresh status expose reprice as non-close Product truth",
    invalidMutation: "a correction response under approve is refused before it can authorize repricing",
  }, ({ externalCorrections }) => {
    assert.equal(
      externalCorrections.status,
      0,
      `${externalCorrections.stdout}\n${externalCorrections.stderr}`,
    );
  }),
  proven("runtime_disposition", "human_assurance_required", {
    gtlExpression: "Product-owned approval action selects one typed F_H assurance contract",
    hogPath: "HoG stops at the declared F_H locus until the exact actor and capability respond",
    abgEvidence: "pending judgment and assurance continuation precede attributed response admission",
    publicOutcome: "public status exposes fh_input_required before the same Run may continue",
    invalidMutation: "wrong actor, capability, intent, or response contract cannot satisfy assurance",
  }, ({ externalGapReentry }) => {
    assert.equal(
      externalGapReentry.status,
      0,
      `${externalGapReentry.stdout}\n${externalGapReentry.stderr}`,
    );
  }),
  proven("runtime_disposition", "escalate", {
    gtlExpression: "Product-observed escalation pressure plus typed F_H response yields an escalate projection",
    hogPath: "HoG applies the admitted nonterminal escalation route after post-evidence refresh",
    abgEvidence: "continue_candidate decision, archive inspection, escalation route, and stop remain append-only",
    publicOutcome: "fresh status and replay expose escalation without manufacturing closure",
    invalidMutation: "ordinary approval cannot be relabelled as the escalation response variant",
  }, ({ externalCorrections }) => {
    assert.equal(
      externalCorrections.status,
      0,
      `${externalCorrections.stdout}\n${externalCorrections.stderr}`,
    );
  }),
  proven("runtime_disposition", "gap_stop", {
    gtlExpression: "typed Product no-action result with gap_stop disposition",
    hogPath: "current traversal stops without selecting a target, retrying, or closing",
    abgEvidence: "admitted gap route and run_stopped retain the exact no-action projection",
    publicOutcome: "typed gap_stop and replay-derived gap remain readable from a fresh context",
    invalidMutation: "a non-gap source or relabelled reprice stop cannot authorize ordinary re-entry",
  }, ({ externalGapReentry }) => {
    assert.equal(
      externalGapReentry.status,
      0,
      `${externalGapReentry.stdout}\n${externalGapReentry.stderr}`,
    );
  }),
  proven("runtime_disposition", "block", {
    gtlExpression: "failure/refusal contract after rejected F_P result",
    hogPath: "blocked route after refusal result and judgment",
    abgEvidence: "blocked judgment, blocked route, and run_stopped",
    publicOutcome: "typed blocked outcome with no closure",
    invalidMutation: "malformed output cannot be projected as success",
  }, ({ malformedFp }) => assertMalformedFpBlocks(malformedFp)),
  proven("runtime_disposition", "non_admit", {
    gtlExpression: "failed Program/GraphFunction invocation admission",
    hogPath: "HoG is not entered",
    abgEvidence: "no Run/event authority is created",
    publicOutcome: "typed refusal with null Run identity",
    invalidMutation: "equivalent contracts do not authorize cross-wired identity",
  }, ({ crossWire }) => assertCrossWireRefuses(crossWire)),

  proven("public_control", "advance_next", {
    gtlExpression: "Product-declared default Program start selected by target=next",
    hogPath: "one admitted start enters one bounded direct GraphFunction traversal",
    abgEvidence: "invocation admission binds next, converged, and the resolved start identity",
    publicOutcome: "installed CLI returns the Product-owned default traversal result with replay agreement",
    invalidMutation: "next without a Product-declared default refuses before Run admission",
  }, ({ externalPublicTargets }) => {
    assert.equal(
      externalPublicTargets.status,
      0,
      `${externalPublicTargets.stdout}\n${externalPublicTargets.stderr}`,
    );
  }),
  proven("public_control", "graph_function_target", {
    gtlExpression: "published GraphFunction named by one direct invocation",
    hogPath: "admitted root GraphFunction enters direct HoG traversal",
    abgEvidence: "GraphCall and Frame identities retain the selected GraphFunction",
    publicOutcome: "CLI invocation returns the selected GraphFunction result",
    invalidMutation: "GraphFunction outside Program membership refuses before Run admission",
  }, ({ fd, crossWire }) => {
    assertSuccessfulInstalled(fd);
    assert.equal(fd.scenario.transcript[6].payload.graphFunctionRef,
      "graph-function://abiogenesis/conformance/hello-world@5");
    assertCrossWireRefuses(crossWire);
  }),
  proven("public_control", "asset_target", {
    gtlExpression: "Product-published asset handle maps to one declared Program start",
    hogPath: "HoG traverses the owning GraphFunction; the asset never becomes callable",
    abgEvidence: "invocation admission binds the requested asset handle and resolved start identity",
    publicOutcome: "installed CLI resolves asset:greeting through the Product publication and agrees with replay",
    invalidMutation: "missing or multiply owned asset handles refuse before Run admission",
  }, ({ externalPublicTargets }) => {
    assert.equal(
      externalPublicTargets.status,
      0,
      `${externalPublicTargets.stdout}\n${externalPublicTargets.stderr}`,
    );
  }),
  proven("public_control", "bounded_until", {
    gtlExpression: "published start with until=converged and Product-owned no-action stop",
    hogPath: "the same public start either stops at admitted gap pressure or reaches governed convergence",
    abgEvidence: "gap_stop/run_stopped and terminal/run_closed remain distinct replayed outcomes",
    publicOutcome: "installed public control returns typed gap_stop before later single-use re-entry converges",
    invalidMutation: "a stopped gap cannot be projected as closure or reused after its transition is consumed",
  }, ({ externalGapReentry }) => {
    assert.equal(
      externalGapReentry.status,
      0,
      `${externalGapReentry.stdout}\n${externalGapReentry.stderr}`,
    );
  }),
  proven("public_control", "fh_control", {
    gtlExpression: "Product-declared F_H action selected inside a public start traversal",
    hogPath: "public control delegates traversal to HoG and waits at the exact declared interaction cursor",
    abgEvidence: "actor, capability, response, continuation, and resumed traversal are admitted runtime truth",
    publicOutcome: "project.read, interaction.respond, and run.continue control one durable held Run",
    invalidMutation: "unattributed or substituted human control cannot resume or close the traversal",
  }, ({ externalGapReentry }) => {
    assert.equal(
      externalGapReentry.status,
      0,
      `${externalGapReentry.stdout}\n${externalGapReentry.stderr}`,
    );
  }),
  proven("public_control", "root_control", {
    gtlExpression: "direct root Program and GraphFunction selection",
    hogPath: "one public call enters one admitted HoG root",
    abgEvidence: "one Run, root GraphCall, Frame, and replay lineage",
    publicOutcome: "direct CLI invocation returns replay-agreeing terminal output",
    invalidMutation: "unowned root GraphFunction refuses without a public controller fallback",
  }, ({ fd, crossWire }) => {
    assertSuccessfulInstalled(fd);
    assert.equal(fd.scenario.transcript[6].variant, "direct");
    assertNoCompiledCarrier(fd.events);
    assertCrossWireRefuses(crossWire);
  }),
];

test("M5 projects fixed 40-row implementation coverage without claiming RC5 reconciliation", async (context) => {
  const counts = Object.fromEntries(
    [...new Set(matrix.map((row) => row.axis))]
      .map((axis) => [axis, matrix.filter((row) => row.axis === axis).length]),
  );
  assert.deepEqual(counts, {
    compute_fibre: 4,
    structural_form: 8,
    consequence_route: 9,
    runtime_disposition: 13,
    public_control: 6,
  });
  assert.equal(matrix.length, 40);
  assert.equal(new Set(matrix.map((row) => `${row.axis}/${row.behavior}`)).size, 40);
  assert.equal(matrix.filter((row) => row.status === "proven").length, 40);
  assert.equal(
    matrix.filter((row) => row.status === "provisional").length,
    0,
  );
  assert.equal(matrix.filter((row) => row.status === "open").length, 0);
  for (const row of matrix) {
    for (const field of [
      "witness46",
      "gtlExpression",
      "hogPath",
      "abgEvidence",
      "publicOutcome",
      "invalidMutation",
    ]) {
      assert.equal(typeof row[field], "string", `${row.axis}/${row.behavior} ${field}`);
      assert.notEqual(row[field].length, 0, `${row.axis}/${row.behavior} ${field}`);
    }
  }

  const harness = await setupInstalledCliHarness(context, root);
  const command = await installWorkerFixture(harness);
  const fd = await runScenario(harness, "matrix-fd");
  const compose = await runScenario(harness, "matrix-compose", {
    programRef: COMPOSE_PROGRAM_REF,
    graphFunctionRef: COMPOSE_GRAPH_FUNCTION_REF,
    subject: "  World  ",
  });
  const workflow = await runScenario(harness, "matrix-workflow", {
    programRef: WORKFLOW_PROGRAM_REF,
    graphFunctionRef: WORKFLOW_GRAPH_FUNCTION_REF,
    allowlist: [WORKFLOW_GRAPH_FUNCTION_REF, WORKFLOW_CHILD_REF],
  });
  const omittedChild = await runScenario(harness, "matrix-workflow-omitted", {
    programRef: WORKFLOW_PROGRAM_REF,
    graphFunctionRef: WORKFLOW_GRAPH_FUNCTION_REF,
    allowlist: [WORKFLOW_GRAPH_FUNCTION_REF],
  });
  const gate = await runScenario(harness, "matrix-gate", {
    programRef: GATE_PROGRAM_REF,
    graphFunctionRef: GATE_GRAPH_FUNCTION_REF,
    allowlist: [GATE_GRAPH_FUNCTION_REF, GATE_TARGET_REF],
  });
  const gateBlocked = await runScenario(harness, "matrix-gate-blocked", {
    programRef: GATE_PROGRAM_REF,
    graphFunctionRef: GATE_GRAPH_FUNCTION_REF,
    allowlist: [GATE_GRAPH_FUNCTION_REF, GATE_TARGET_REF],
    subject: "Blocked",
  });
  const recursion = await runScenario(harness, "matrix-recursion", {
    programRef: RECURSION_PROGRAM_REF,
    graphFunctionRef: RECURSION_GRAPH_FUNCTION_REF,
    allowlist: [RECURSION_GRAPH_FUNCTION_REF, RECURSION_CHILD_REF],
    input: {
      kind: "bounded_recursion_state",
      schemaVersion: "5.0.0",
      blockedChildRemaining: null,
      remaining: 3,
      terminal: false,
      trace: [],
    },
  });
  const recursionBound = await runScenario(
    harness,
    "matrix-recursion-bound",
    {
      programRef: RECURSION_PROGRAM_REF,
      graphFunctionRef: RECURSION_GRAPH_FUNCTION_REF,
      allowlist: [RECURSION_GRAPH_FUNCTION_REF, RECURSION_CHILD_REF],
      input: {
        kind: "bounded_recursion_state",
        schemaVersion: "5.0.0",
        blockedChildRemaining: null,
        remaining: 5,
        terminal: false,
        trace: [],
      },
    },
  );
  const fanOut = await runScenario(harness, "matrix-fan-out", {
    programRef: FAN_OUT_PROGRAM_REF,
    graphFunctionRef: FAN_OUT_GRAPH_FUNCTION_REF,
    allowlist: [
      FAN_OUT_GRAPH_FUNCTION_REF,
      FAN_OUT_ELEMENT_REF,
      FAN_IN_REDUCER_REF,
    ],
    input: fanOutInput(["Alpha", "Beta", "Gamma"]),
  });
  const fanOutPartial = await runScenario(
    harness,
    "matrix-fan-out-partial",
    {
      programRef: FAN_OUT_PROGRAM_REF,
      graphFunctionRef: FAN_OUT_GRAPH_FUNCTION_REF,
      allowlist: [
        FAN_OUT_GRAPH_FUNCTION_REF,
        FAN_OUT_ELEMENT_REF,
        FAN_IN_REDUCER_REF,
      ],
      input: fanOutInput(["Alpha", "Beta", "Gamma"], 1),
    },
  );
  const fp = await runScenario(harness, "matrix-fp", {
    programRef: FP_PROGRAM_REF,
    graphFunctionRef: FP_GRAPH_FUNCTION_REF,
    input: fpInput("World"),
  }, { ABG_TS_CLAUDE_COMMAND: command });
  const malformedFp = await runScenario(harness, "matrix-fp-malformed", {
    programRef: FP_PROGRAM_REF,
    graphFunctionRef: FP_GRAPH_FUNCTION_REF,
    input: fpInput("World"),
  }, {
    ABG_TS_CLAUDE_COMMAND: command,
    ABG_MATRIX_MALFORMED: "1",
  });
  const retryCounterPath = join(harness.scratch, "matrix-retry.count");
  const retry = await runScenario(harness, "matrix-retry", {
    programRef: FP_RETRY_PROGRAM_REF,
    graphFunctionRef: FP_RETRY_GRAPH_FUNCTION_REF,
    input: fpInput("World"),
  }, {
    ABG_TS_CLAUDE_COMMAND: command,
    ABG_MATRIX_RETRY_COUNTER: retryCounterPath,
  });
  const retryContradiction = await runScenario(
    harness,
    "matrix-retry-contradiction",
    {
      programRef: FP_RETRY_PROGRAM_REF,
      graphFunctionRef: FP_RETRY_GRAPH_FUNCTION_REF,
      input: fpInput("World"),
    },
    {
      ABG_TS_CLAUDE_COMMAND: command,
      ABG_MATRIX_CONTRADICTORY: "1",
    },
  );
  const retryExhausted = await runScenario(
    harness,
    "matrix-retry-exhausted",
    {
      programRef: FP_RETRY_PROGRAM_REF,
      graphFunctionRef: FP_RETRY_GRAPH_FUNCTION_REF,
      input: fpInput("World"),
    },
    {
      ABG_TS_CLAUDE_COMMAND: command,
      ABG_MATRIX_RETRY_COUNTER: join(harness.scratch, "matrix-retry-exhausted.count"),
      ABG_MATRIX_ALWAYS_MALFORMED: "1",
    },
  );
  const crossWire = await runScenario(harness, "matrix-cross-wire", {
    programRef: FD_FP_PROGRAM_REF,
    graphFunctionRef: FP_GRAPH_FUNCTION_REF,
    allowlist: [FP_GRAPH_FUNCTION_REF],
    input: fpInput("World"),
  });
  const externalMixed = spawnSync(
    process.execPath,
    [
      "--test",
      "--test-concurrency=1",
      "--test-name-pattern=^M5 reopens and completes an external mixed F_D/F_P/F_H program",
      "test_env/tests/m5-installed-external-product.test.mjs",
    ],
    {
      cwd: root,
      encoding: "utf8",
      env: Object.fromEntries(
        Object.entries(process.env).filter(
          ([key]) => key !== "NODE_TEST_CONTEXT",
        ),
      ),
      maxBuffer: 10 * 1024 * 1024,
      timeout: INSTALLED_WITNESS_TIMEOUT_MS,
    },
  );
  const externalTicket = spawnSync(
    process.execPath,
    [
      "--test",
      "--test-concurrency=1",
      "--test-name-pattern=^M5 invokes external ticket work only through its owning Program and GraphFunction$",
      "test_env/tests/m5-installed-external-product.test.mjs",
    ],
    {
      cwd: root,
      encoding: "utf8",
      env: Object.fromEntries(
        Object.entries(process.env).filter(
          ([key]) => key !== "NODE_TEST_CONTEXT",
        ),
      ),
      maxBuffer: 10 * 1024 * 1024,
      timeout: INSTALLED_WITNESS_TIMEOUT_MS,
    },
  );
  const externalGapReentry = spawnSync(
    process.execPath,
    [
      "--test",
      "--test-concurrency=1",
      "--test-name-pattern=^M5 exposes a durable gap and re-enters it through the same external Product$",
      "test_env/tests/m5-installed-external-product.test.mjs",
    ],
    {
      cwd: root,
      encoding: "utf8",
      env: Object.fromEntries(
        Object.entries(process.env).filter(
          ([key]) => key !== "NODE_TEST_CONTEXT",
        ),
      ),
      maxBuffer: 10 * 1024 * 1024,
      timeout: INSTALLED_WITNESS_TIMEOUT_MS,
    },
  );
  const externalSpanReentry = spawnSync(
    process.execPath,
    [
      "--test",
      "--test-concurrency=1",
      "--test-name-pattern=^M5 applies one Product-declared graph-span re-entry through the installed path$",
      "test_env/tests/m5-installed-external-product.test.mjs",
    ],
    {
      cwd: root,
      encoding: "utf8",
      env: Object.fromEntries(
        Object.entries(process.env).filter(
          ([key]) => key !== "NODE_TEST_CONTEXT",
        ),
      ),
      maxBuffer: 10 * 1024 * 1024,
      timeout: INSTALLED_WITNESS_TIMEOUT_MS,
    },
  );
  const externalPublicTargets = spawnSync(
    process.execPath,
    [
      "--test",
      "--test-concurrency=1",
      "--test-name-pattern=^M5 starts Product-declared next and asset targets without a Public controller$",
      "test_env/tests/m5-installed-external-product.test.mjs",
    ],
    {
      cwd: root,
      encoding: "utf8",
      env: Object.fromEntries(
        Object.entries(process.env).filter(
          ([key]) => key !== "NODE_TEST_CONTEXT",
        ),
      ),
      maxBuffer: 10 * 1024 * 1024,
      timeout: INSTALLED_WITNESS_TIMEOUT_MS,
    },
  );
  const externalCorrections = spawnSync(
    process.execPath,
    [
      "--test",
      "--test-concurrency=1",
      "--test-name-pattern=^M5 preserves governed correction dispositions through the external Product$",
      "test_env/tests/m5-installed-external-product.test.mjs",
    ],
    {
      cwd: root,
      encoding: "utf8",
      env: Object.fromEntries(
        Object.entries(process.env).filter(
          ([key]) => key !== "NODE_TEST_CONTEXT",
        ),
      ),
      maxBuffer: 10 * 1024 * 1024,
      timeout: INSTALLED_WITNESS_TIMEOUT_MS,
    },
  );
  const evidence = {
    fd,
    compose,
    workflow,
    omittedChild,
    gate,
    gateBlocked,
    recursion,
    recursionBound,
    fanOut,
    fanOutPartial,
    fp,
    malformedFp,
    retry,
    retryContradiction,
    retryExhausted,
    crossWire,
    externalMixed,
    externalTicket,
    externalGapReentry,
    externalSpanReentry,
    externalPublicTargets,
    externalCorrections,
  };

  for (const row of matrix) {
    const name = `${row.axis}/${row.behavior}`;
    if (row.status === "open") {
      await context.test(name, { todo: row.gap }, () => {});
    } else {
      await context.test(name, () => row.verify(evidence));
    }
  }
});
