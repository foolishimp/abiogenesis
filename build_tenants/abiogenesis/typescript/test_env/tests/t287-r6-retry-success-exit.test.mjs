import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { chmod, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

import { cloneEventPrefixFixture } from "../support/new-empty-append-sink.mjs";
import {
  publicOperationBasis,
  rawProgramInput,
  requireRawAdmission,
  setupInstalledRootCatalog,
} from "../support/root-installed-environment.mjs";

const root = resolve(import.meta.dirname, "../..");
const tv5SuccessReconstructionWorker = resolve(
  import.meta.dirname,
  "../support/t287-tv5-success-reconstruction-worker.mjs",
);
const entry212ReopenWorker = resolve(
  import.meta.dirname,
  "../support/t287-entry212-reopen-worker.mjs",
);

function runEntry212ReopenProbe(input) {
  return new Promise((resolveResult, reject) => {
    const child = spawn(process.execPath, [entry212ReopenWorker], {
      env: { ...process.env, NODE_OPTIONS: "" },
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Entry212 reopen probe failed ${code}: ${stderr}`));
        return;
      }
      try {
        resolveResult(JSON.parse(stdout));
      } catch (error) {
        reject(new Error(
          `Entry212 reopen probe returned invalid JSON: ${String(error)}\n${stdout}\n${stderr}`,
        ));
      }
    });
    child.stdin.end(JSON.stringify(input));
  });
}

function runTv5SuccessReconstructionWorker(input) {
  return new Promise((resolveResult, reject) => {
    const child = spawn(process.execPath, [tv5SuccessReconstructionWorker], {
      env: { ...process.env, NODE_OPTIONS: "" },
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(
          `TV5 success reconstruction worker failed ${code}: ${stderr}`,
        ));
        return;
      }
      try {
        resolveResult(JSON.parse(stdout));
      } catch (error) {
        reject(new Error(
          `TV5 success reconstruction worker returned invalid JSON: ${String(error)}\n${stdout}\n${stderr}`,
        ));
      }
    });
    child.stdin.end(JSON.stringify(input));
  });
}

function runFreshFpRetryReplayProbe(input) {
  const script = [
    "import { join } from 'node:path';",
    "import { pathToFileURL } from 'node:url';",
    "let input = '';",
    "process.stdin.setEncoding('utf8');",
    "process.stdin.on('data', (chunk) => { input += chunk; });",
    "process.stdin.on('end', async () => {",
    "  const request = JSON.parse(input);",
    "  const abg = await import(pathToFileURL(join(request.installedRoot, 'build/code/src/abg/index.js')).href);",
    "  const reopened = abg.reopenEventStore(request.reopenAuthority, request.prefix);",
    "  if (reopened.kind !== 'reopened_event_store_context') throw new TypeError(JSON.stringify(reopened));",
    "  const events = reopened.store.readAll();",
    "  const authorityPrefix = abg.selectValidatedRuntimeEventPrefix(events);",
    "  const runPrefix = abg.selectValidatedRuntimeEventPrefix(events, { runId: request.runId });",
    "  const replay = abg.replayValidatedRuntimeEventPrefix(runPrefix, authorityPrefix);",
    "  const result = {",
    "    processId: process.pid,",
    "    eventLogDigest: abg.selectHeldEventStoreDurablePrefix(reopened.store).prefixDigest,",
    "    authorityEventCount: authorityPrefix.events.length,",
    "    runEventRefs: runPrefix.events.map((event) => event.eventId),",
    "    replayDigest: replay.replayDigest,",
    "    routeEventRefs: replay.routes.map((route) => route.admissionEventRef),",
    "  };",
    "  reopened.store.closeDurableLog();",
    "  process.stdout.write(JSON.stringify(result));",
    "});",
  ].join("\n");
  return new Promise((resolveResult, reject) => {
    const child = spawn(
      process.execPath,
      ["--input-type=module", "--eval", script],
      {
        env: { ...process.env, NODE_OPTIONS: "" },
        stdio: ["pipe", "pipe", "pipe"],
      },
    );
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`F_P retry replay probe failed ${code}: ${stderr}`));
        return;
      }
      try {
        resolveResult(JSON.parse(stdout));
      } catch (error) {
        reject(new Error(
          `F_P retry replay probe returned invalid JSON: ${String(error)}\n${stdout}\n${stderr}`,
        ));
      }
    });
    child.stdin.end(JSON.stringify(input));
  });
}
const PROGRAM_REF = "program://t287/test/retry-workflow@5";
const GRAPH_FUNCTION_REF = "graph-function://t287/test/retry-workflow@5";
const GRAPH_REF = "graph://t287/test/retry-workflow@5";
const NODE_REF = "node://t287/test/retry-workflow@5";
const RECURSION_PROGRAM_REF =
  "program://t287/test/retry-deferred-application@5";
const RECURSION_GRAPH_FUNCTION_REF =
  "graph-function://t287/test/retry-deferred-application@5";
const RECURSION_GRAPH_REF =
  "graph://t287/test/retry-deferred-application@5";
const RECURSION_NODE_REF =
  "node://t287/test/retry-deferred-application@5";
const FAN_OUT_PROGRAM_REF = "program://t287/test/retry-fan-out@5";
const FAN_OUT_GRAPH_FUNCTION_REF =
  "graph-function://t287/test/retry-fan-out@5";
const FAN_OUT_GRAPH_REF = "graph://t287/test/retry-fan-out@5";
const FAN_OUT_NODE_REF = "node://t287/test/retry-fan-out@5";
const IDENTITY_PROGRAM_REF = "program://t287/test/retry-identity@5";
const IDENTITY_GRAPH_FUNCTION_REF =
  "graph-function://t287/test/retry-identity@5";
const IDENTITY_GRAPH_REF = "graph://t287/test/retry-identity@5";
const IDENTITY_NODE_REF = "node://t287/test/retry-identity@5";
const FH_PROGRAM_REF = "program://t287/test/retry-fh@5";
const FH_GRAPH_FUNCTION_REF = "graph-function://t287/test/retry-fh@5";
const FH_GRAPH_REF = "graph://t287/test/retry-fh@5";
const FH_NODE_REF = "node://t287/test/retry-fh@5";
const FH_INPUT_CONTRACT_REF =
  "contract://t287/test/consensus-resolution-input@5";
const FH_ROOT_CLOSURE_CONTRACT_REF =
  "closure://t287/test/retry-fh-root@5";

async function installFailOnceFpRetryWorker(scratch, gtl) {
  const counterPath = join(scratch, "t287-tv5-fp-retry.count");
  const command = join(scratch, "t287-tv5-fp-retry-worker.cjs");
  await writeFile(
    command,
    [
      "#!/usr/bin/env node",
      "const { existsSync, readFileSync, writeFileSync } = require('node:fs');",
      "let prompt = '';",
      "process.stdin.setEncoding('utf8');",
      "process.stdin.on('data', (chunk) => { prompt += chunk; });",
      "process.stdin.on('end', () => {",
      "  const counterPath = process.env.ABG_T287_FP_RETRY_COUNTER;",
      "  const prior = existsSync(counterPath) ? Number(readFileSync(counterPath, 'utf8')) : 0;",
      "  const attempt = prior + 1;",
      "  writeFileSync(counterPath, String(attempt));",
      "  const subjectLine = prompt.split(/\\r?\\n/).find((line) => line.startsWith('Subject: '));",
      "  const subject = subjectLine === undefined ? 'Unknown' : JSON.parse(subjectLine.slice('Subject: '.length));",
      "  const result = {",
      "    kind: 'fp_hello_output',",
      "    schemaVersion: '5.0.0',",
      `    resultContractRef: ${JSON.stringify(gtl.FP_HELLO_IDS.outputContractRef)},`,
      `    actorRef: ${JSON.stringify(gtl.FP_HELLO_IDS.workerActorRef)},`,
      "    message: `Hello ${subject}` ,",
      "  };",
      "  console.log(JSON.stringify({ type: 'system', subtype: 'init' }));",
      "  console.log(JSON.stringify({ type: 'assistant', message: { content: [{ type: 'text', text: `attempt ${attempt}` }] } }));",
      "  console.log(JSON.stringify({ type: 'result', subtype: 'success', result: attempt === 1 ? '{not-json' : JSON.stringify(result) }));",
      "  if (attempt === 1) process.exitCode = 17;",
      "});",
      "",
    ].join("\n"),
    "utf8",
  );
  await chmod(command, 0o755);
  return { command, counterPath };
}

function extendContributionMembership(
  contribution,
  programRef,
) {
  return {
    ...structuredClone(contribution),
    programMembershipRefs: [
      ...contribution.programMembershipRefs,
      programRef,
    ],
    readinessPrerequisiteRefs: [
      ...contribution.readinessPrerequisiteRefs,
      programRef,
    ],
  };
}

function publicationWithRootVariant(base, input) {
  const sourceContribution = base.contributions.find((candidate) =>
    candidate.handle === input.sourceGraphFunctionRef);
  assert.ok(sourceContribution);
  const childContributions = input.childRefs.map((childRef) => {
    const contribution = base.contributions.find((candidate) =>
      candidate.handle === childRef);
    assert.ok(contribution);
    return extendContributionMembership(contribution, input.program.programRef);
  });
  return Object.freeze({
    ...base,
    programs: [...base.programs, input.program],
    graphFunctions: [...base.graphFunctions, input.graphFunction],
    contributions: [
      ...base.contributions.filter((candidate) =>
        !input.childRefs.includes(candidate.handle)),
      ...childContributions,
      {
        ...structuredClone(sourceContribution),
        handle: input.graphFunction.name,
        declarationOrContractRef: input.graphFunction.name,
        programMembershipRefs: [input.program.programRef],
        readinessPrerequisiteRefs: [input.program.programRef],
      },
    ],
  });
}

function retryWorkflowPublication(gtl, base) {
  const workflow = base.graphFunctions.find((candidate) =>
    candidate.name ===
      "graph-function://abiogenesis/conformance/hello-workflow@5");
  const childRef = workflow.template.nodes[0].term.graphFunctionRef;
  const sourceProgram = base.programs.find((candidate) =>
    candidate.programRef ===
      "program://abiogenesis/conformance/hello-workflow@5");
  assert.ok(workflow);
  assert.ok(sourceProgram);
  const workflowTerm = gtl.workflow.C(gtl.cGraphFunctionRef({
    graphFunctionRef: childRef,
    input: gtl.cCarrier(workflow.inputs[0]),
    output: gtl.cCarrier(workflow.outputs[0]),
  }));
  const graphFunction = Object.freeze({
    ...structuredClone(workflow),
    name: GRAPH_FUNCTION_REF,
    template: {
      ...structuredClone(workflow.template),
      graphRef: GRAPH_REF,
      startNodeRef: NODE_REF,
      terminalNodeRefs: [NODE_REF],
      nodes: [{
        nodeRef: NODE_REF,
        nodeKind: "c_locus",
        term: gtl.C.retry(workflowTerm, 2),
      }],
    },
    tags: [...workflow.tags, "t287-test-only"],
  });
  const program = Object.freeze({
    ...structuredClone(sourceProgram),
    programRef: PROGRAM_REF,
    starts: [{
      startRef: "start://t287/test/retry-workflow@5",
      graphFunctionRef: GRAPH_FUNCTION_REF,
    }],
    callableMembership: [GRAPH_FUNCTION_REF, childRef],
  });
  const sourceContribution = base.contributions.find((candidate) =>
    candidate.handle === workflow.name);
  const childContribution = base.contributions.find((candidate) =>
    candidate.handle === childRef);
  assert.ok(sourceContribution);
  assert.ok(childContribution);
  return {
    publication: Object.freeze({
    ...base,
    programs: [...base.programs, program],
    graphFunctions: [...base.graphFunctions, graphFunction],
    contributions: [
      ...base.contributions.filter((candidate) =>
        candidate.handle !== childRef),
      {
        ...structuredClone(childContribution),
        programMembershipRefs: [
          ...childContribution.programMembershipRefs,
          PROGRAM_REF,
        ],
        readinessPrerequisiteRefs: [
          ...childContribution.readinessPrerequisiteRefs,
          PROGRAM_REF,
        ],
      },
      {
        ...structuredClone(sourceContribution),
        handle: GRAPH_FUNCTION_REF,
        declarationOrContractRef: GRAPH_FUNCTION_REF,
        programMembershipRefs: [PROGRAM_REF],
        readinessPrerequisiteRefs: [PROGRAM_REF],
      },
    ],
    }),
    programRef: PROGRAM_REF,
    graphFunctionRef: GRAPH_FUNCTION_REF,
    childRef,
    input: gtl.constructHelloWorldInput("World"),
  };
}

function retryDeferredApplicationPublication(gtl, base) {
  const source = base.graphFunctions.find((candidate) =>
    candidate.name ===
      "graph-function://abiogenesis/conformance/bounded-recursion@5");
  const sourceProgram = base.programs.find((candidate) =>
    candidate.programRef ===
      "program://abiogenesis/conformance/bounded-recursion@5");
  assert.ok(source);
  assert.ok(sourceProgram);
  const sourceTerm = source.template.nodes[0].term;
  const sourceApplication = source.template.applications[0];
  const childRef = sourceApplication.graphFunctionRef;
  const application = gtl.recurseApplication({
    inputContractRef: sourceApplication.inputContractRef,
    outputContractRef: sourceApplication.outputContractRef,
    graphFunctionRef: sourceApplication.graphFunctionRef,
    terminationRuleRef: sourceApplication.terminationRuleRef,
    terminationEvaluatorRefs: sourceApplication.terminationEvaluatorRefs,
    terminationFieldRef: sourceApplication.terminationFieldRef,
    foldback: sourceApplication.foldback,
    bound: sourceApplication.bound,
  });
  const leaf = gtl.C.of({
    input: gtl.cCarrier(sourceTerm.inputCarrierRef),
    output: gtl.cCarrier(sourceTerm.outputCarrierRef),
    programLocusRef: sourceTerm.programLocusRef,
    stageRole: sourceTerm.stageRole,
    fibre: sourceTerm.fibre,
    armId: sourceTerm.armId,
    compositionRef: application.applicationRef,
    vectorIndex: sourceTerm.vectorIndex,
    judgmentPredicateRef: sourceTerm.judgmentPredicateRef,
    resultBearing: sourceTerm.resultBearing,
    requirement: structuredClone(sourceTerm.requirement),
  });
  const graphFunction = Object.freeze({
    ...structuredClone(source),
    name: RECURSION_GRAPH_FUNCTION_REF,
    template: {
      ...structuredClone(source.template),
      graphRef: RECURSION_GRAPH_REF,
      startNodeRef: RECURSION_NODE_REF,
      terminalNodeRefs: [RECURSION_NODE_REF],
      nodes: [{
        nodeRef: RECURSION_NODE_REF,
        nodeKind: "c_locus",
        term: gtl.C.retry(leaf, 2),
      }],
      applications: [application],
    },
    tags: [...source.tags, "t287-test-only"],
  });
  const program = Object.freeze({
    ...structuredClone(sourceProgram),
    programRef: RECURSION_PROGRAM_REF,
    starts: [{
      startRef: "start://t287/test/retry-deferred-application@5",
      graphFunctionRef: RECURSION_GRAPH_FUNCTION_REF,
    }],
    callableMembership: [RECURSION_GRAPH_FUNCTION_REF, childRef],
  });
  const sourceContribution = base.contributions.find((candidate) =>
    candidate.handle === source.name);
  const childContribution = base.contributions.find((candidate) =>
    candidate.handle === childRef);
  assert.ok(sourceContribution);
  assert.ok(childContribution);
  const publication = Object.freeze({
    ...base,
    programs: [...base.programs, program],
    graphFunctions: [...base.graphFunctions, graphFunction],
    contributions: [
      ...base.contributions.filter((candidate) =>
        candidate.handle !== childRef),
      {
        ...structuredClone(childContribution),
        programMembershipRefs: [
          ...childContribution.programMembershipRefs,
          RECURSION_PROGRAM_REF,
        ],
        readinessPrerequisiteRefs: [
          ...childContribution.readinessPrerequisiteRefs,
          RECURSION_PROGRAM_REF,
        ],
      },
      {
        ...structuredClone(sourceContribution),
        handle: RECURSION_GRAPH_FUNCTION_REF,
        declarationOrContractRef: RECURSION_GRAPH_FUNCTION_REF,
        programMembershipRefs: [RECURSION_PROGRAM_REF],
        readinessPrerequisiteRefs: [RECURSION_PROGRAM_REF],
      },
    ],
  });
  return {
    publication,
    programRef: RECURSION_PROGRAM_REF,
    graphFunctionRef: RECURSION_GRAPH_FUNCTION_REF,
    childRef,
    input: {
      kind: "bounded_recursion_state",
      schemaVersion: "5.0.0",
      blockedChildRemaining: null,
      remaining: 0,
      terminal: true,
      trace: [],
    },
  };
}

function flatRecursiveLeafPublication(gtl, base) {
  const ids = gtl.RECURSION_HELLO_IDS;
  assert.ok(base.programs.some((candidate) =>
    candidate.programRef === ids.programRef));
  assert.ok(base.graphFunctions.some((candidate) =>
    candidate.name === ids.graphFunctionRef));
  return {
    publication: base,
    programRef: ids.programRef,
    graphFunctionRef: ids.graphFunctionRef,
    childRef: ids.childGraphFunctionRef,
    input: gtl.constructBoundedRecursionState(3),
  };
}

function retryFanOutPublication(gtl, base) {
  const source = base.graphFunctions.find((candidate) =>
    candidate.name === gtl.FAN_OUT_HELLO_IDS.graphFunctionRef);
  const sourceProgram = base.programs.find((candidate) =>
    candidate.programRef === gtl.FAN_OUT_HELLO_IDS.programRef);
  assert.ok(source);
  assert.ok(sourceProgram);
  const sourceTerm = source.template.nodes[0].term;
  assert.equal(sourceTerm.kind, "c_compose");
  assert.equal(sourceTerm.terms[0].kind, "c_batch");
  const childRefs = [
    gtl.FAN_OUT_HELLO_IDS.elementGraphFunctionRef,
    gtl.FAN_OUT_HELLO_IDS.reducerGraphFunctionRef,
  ];
  const graphFunction = Object.freeze({
    ...structuredClone(source),
    name: FAN_OUT_GRAPH_FUNCTION_REF,
    template: {
      ...structuredClone(source.template),
      graphRef: FAN_OUT_GRAPH_REF,
      startNodeRef: FAN_OUT_NODE_REF,
      terminalNodeRefs: [FAN_OUT_NODE_REF],
      nodes: [{
        nodeRef: FAN_OUT_NODE_REF,
        nodeKind: "c_locus",
        term: gtl.C.compose(
          gtl.C.retry(gtl.C.retry(sourceTerm.terms[0], 2), 2),
          sourceTerm.terms[1],
        ),
      }],
    },
    tags: [...source.tags, "t287-test-only"],
  });
  const program = Object.freeze({
    ...structuredClone(sourceProgram),
    programRef: FAN_OUT_PROGRAM_REF,
    starts: [{
      startRef: "start://t287/test/retry-fan-out@5",
      graphFunctionRef: FAN_OUT_GRAPH_FUNCTION_REF,
    }],
    callableMembership: [FAN_OUT_GRAPH_FUNCTION_REF, ...childRefs],
  });
  return {
    publication: publicationWithRootVariant(base, {
      sourceGraphFunctionRef: source.name,
      graphFunction,
      program,
      childRefs,
    }),
    programRef: program.programRef,
    graphFunctionRef: graphFunction.name,
    childRefs,
    input: gtl.constructFanOutHelloInput(["Ada", "Grace", "Margaret"]),
  };
}

function retryIdentityPublication(gtl, base) {
  const source = base.graphFunctions.find((candidate) =>
    candidate.name === gtl.HELLO_WORLD_IDS.graphFunctionRef);
  const sourceProgram = base.programs.find((candidate) =>
    candidate.programRef === gtl.HELLO_WORLD_IDS.programRef);
  assert.ok(source);
  assert.ok(sourceProgram);
  const next = source.template.nodes[0].term;
  const graphFunction = Object.freeze({
    ...structuredClone(source),
    name: IDENTITY_GRAPH_FUNCTION_REF,
    template: {
      ...structuredClone(source.template),
      graphRef: IDENTITY_GRAPH_REF,
      startNodeRef: IDENTITY_NODE_REF,
      terminalNodeRefs: [IDENTITY_NODE_REF],
      nodes: [{
        nodeRef: IDENTITY_NODE_REF,
        nodeKind: "c_locus",
        term: gtl.C.compose(
          gtl.C.retry(
            gtl.C.retry(
              gtl.C.id(gtl.cCarrier(source.inputs[0])),
              2,
            ),
            2,
          ),
          next,
        ),
      }],
    },
    tags: [...source.tags, "t287-test-only"],
  });
  const program = Object.freeze({
    ...structuredClone(sourceProgram),
    programRef: IDENTITY_PROGRAM_REF,
    starts: [{
      startRef: "start://t287/test/retry-identity@5",
      graphFunctionRef: IDENTITY_GRAPH_FUNCTION_REF,
    }],
    callableMembership: [IDENTITY_GRAPH_FUNCTION_REF],
  });
  return {
    publication: publicationWithRootVariant(base, {
      sourceGraphFunctionRef: source.name,
      graphFunction,
      program,
      childRefs: [],
    }),
    programRef: program.programRef,
    graphFunctionRef: graphFunction.name,
    childRefs: [],
    input: gtl.constructHelloWorldInput("Identity"),
  };
}

function unresolvedConsensusResolution(product) {
  const subjectDigest = product.sha256Canonical({
    subject: "T-287 retry F_H completion",
  });
  const terminalOutcome = {
    kind: "consensus_round_outcome",
    schemaVersion: "5.0.0",
    roundRef: "consensus-round://t287/retry-fh/1",
    outcome: "escalate_fh",
    findingSetRefs: ["review-findings://t287/retry-fh/1"],
    rulingRefs: [],
    evidenceRefs: ["evidence://t287/retry-fh/1"],
  };
  const result = {
    kind: "consensus_result_candidate",
    schemaVersion: "5.0.0",
    subjectRef: "ticket://abiogenesis/T-287",
    subjectDigest,
    panelRef: "panel://t287/retry-fh",
    policyRef: "policy://t287/retry-fh@1",
    roundRefs: [terminalOutcome.roundRef],
    findingSetRefs: [...terminalOutcome.findingSetRefs],
    submitterResponseRefs: ["submitter-response://t287/retry-fh/1"],
    rulings: [],
    classification: "unresolved_disagreement",
    dissentProfileRefs: ["reviewer-profile://t287/retry-fh/dissent"],
    terminalOutcome,
    evidenceRefs: [...terminalOutcome.evidenceRefs],
    lineageRefs: [terminalOutcome.roundRef],
    contractFailureRef: null,
  };
  const body = {
    kind: "consensus_resolution",
    resolutionKind: "round_decision",
    schemaVersion: "5.0.0",
    outcome: terminalOutcome,
    result,
    resolutionTerminal: false,
  };
  const decisionDigest = product.sha256Canonical(body);
  return {
    ...body,
    decisionRef:
      `consensus-round-decision://abg/${
        decisionDigest.slice("sha256:".length)
      }`,
    decisionDigest,
  };
}

function retryFhPublication(
  gtl,
  _base,
  environment,
  shape = "nested_fh",
) {
  const base = gtl.constructConsensusModulePublication({
    productId: environment.verified.productId,
    artifactDigest: environment.verified.artifactDigest,
    productContentDigest: environment.verified.productContentDigest,
    productManifestDigest: environment.verified.manifestDigest,
    packageName: environment.verified.packageName,
    packageVersion: environment.verified.packageVersion,
  });
  const source = base.graphFunctions.find((candidate) =>
    candidate.name === gtl.CONSENSUS_IDS.escalationGraphFunctionRef);
  const sourceProgram = base.programs.find((candidate) =>
    candidate.callableMembership.includes(source?.name));
  const sourceInputContract = base.contracts.find((candidate) =>
    candidate.contractRef === gtl.CONSENSUS_IDS.resolutionContractRef);
  const sourceClosureContract = base.closureContracts.find((candidate) =>
    candidate.closureContractRef ===
      gtl.CONSENSUS_IDS.finalizationClosureContractRef);
  assert.ok(source);
  assert.ok(sourceProgram);
  assert.ok(sourceInputContract);
  assert.ok(sourceClosureContract);
  const sourceTerm = source.template.nodes[0].term;
  assert.equal(sourceTerm.kind, "c_compose");
  const sourceFh = sourceTerm.terms[0];
  const sourceFinalizer = sourceTerm.terms[1];
  assert.equal(sourceFh.kind, "c_of");
  assert.equal(sourceFinalizer.kind, "c_workflow");
  const fhOutputContractRef = sourceFh.outputCarrierRef;
  const rootOutputContractRef = source.outputs[0];
  const fh = gtl.C.of({
    input: gtl.cCarrier(FH_INPUT_CONTRACT_REF),
    output: gtl.cCarrier(fhOutputContractRef),
    programLocusRef: FH_NODE_REF,
    stageRole: sourceFh.stageRole,
    fibre: "F_H",
    armId: sourceFh.armId,
    compositionRef: sourceFh.compositionRef,
    vectorIndex: sourceFh.vectorIndex,
    judgmentPredicateRef: sourceFh.judgmentPredicateRef,
    resultBearing: sourceFh.resultBearing,
    requirement: {
      ...structuredClone(sourceFh.requirement),
      requestContractRef: FH_INPUT_CONTRACT_REF,
      responseContractRef: fhOutputContractRef,
    },
  });
  const finalizer = gtl.workflow.C(gtl.cGraphFunctionRef({
    graphFunctionRef: sourceFinalizer.graphFunctionRef,
    input: gtl.cCarrier(sourceFinalizer.inputCarrierRef),
    output: gtl.cCarrier(sourceFinalizer.outputCarrierRef),
  }));
  const childRefs = [gtl.CONSENSUS_IDS.escalationFinalizerGraphFunctionRef];
  const startRef = "start://t287/test/retry-fh@5";
  const retryWrappedFh = shape === "triple_nested_fh"
    ? gtl.C.retry(gtl.C.retry(gtl.C.retry(fh, 2), 2), 2)
    : gtl.C.retry(gtl.C.retry(fh, 2), 2);
  const graphFunction = Object.freeze({
    ...structuredClone(source),
    name: FH_GRAPH_FUNCTION_REF,
    environment: {
      ...structuredClone(source.environment),
      requires: source.environment.requires.map((contractRef) =>
        contractRef === source.inputs[0]
          ? FH_INPUT_CONTRACT_REF
          : contractRef),
    },
    inputs: [FH_INPUT_CONTRACT_REF],
    outputs: [rootOutputContractRef],
    template: {
      ...structuredClone(source.template),
      graphRef: FH_GRAPH_REF,
      startNodeRef: FH_NODE_REF,
      terminalNodeRefs: [FH_NODE_REF],
      nodes: [{
        nodeRef: FH_NODE_REF,
        nodeKind: "c_locus",
        term: shape === "fh_then_retry"
          ? gtl.C.compose(
              fh,
              gtl.C.retry(finalizer, 2),
            )
          : gtl.C.compose(
              retryWrappedFh,
              finalizer,
            ),
      }],
    },
    effects: structuredClone(source.effects),
    declarations: {
      ...structuredClone(source.declarations),
      "abg.closure_contract": FH_ROOT_CLOSURE_CONTRACT_REF,
    },
    tags: [...source.tags, "t287-test-only"],
  });
  const {
    actionCatalog: sourceActionCatalog,
    constructionComposition: _sourceConstructionComposition,
    publicAssetTargets: sourcePublicAssetTargets,
    ...sourceProgramBody
  } = structuredClone(sourceProgram);
  assert.ok(sourceActionCatalog);
  assert.ok(sourcePublicAssetTargets);
  const {
    catalogDigest: _sourceCatalogDigest,
    catalogRef: _sourceCatalogRef,
    ...sourceActionCatalogBody
  } = sourceActionCatalog;
  const actionCatalogBody = {
    ...sourceActionCatalogBody,
    rows: sourceActionCatalog.rows.map((row) => ({
      ...row,
      programRef: FH_PROGRAM_REF,
      graphFunctionRef: FH_GRAPH_FUNCTION_REF,
      targetProgramLocusRef: FH_GRAPH_FUNCTION_REF,
    })),
  };
  const actionCatalogDigest = environment.product.sha256Canonical(
    actionCatalogBody,
  );
  const program = Object.freeze({
    ...sourceProgramBody,
    programRef: FH_PROGRAM_REF,
    starts: [{
      startRef,
      graphFunctionRef: FH_GRAPH_FUNCTION_REF,
    }],
    callableMembership: [FH_GRAPH_FUNCTION_REF, ...childRefs],
    closureContractRef: FH_ROOT_CLOSURE_CONTRACT_REF,
    actionCatalog: {
      ...actionCatalogBody,
      catalogRef:
        `action-catalog://product/${
          actionCatalogDigest.slice("sha256:".length)
        }`,
      catalogDigest: actionCatalogDigest,
    },
    publicAssetTargets: sourcePublicAssetTargets.map((target) => ({
      ...target,
      handle: FH_GRAPH_FUNCTION_REF,
      assetRef: FH_GRAPH_FUNCTION_REF,
      startRef,
    })),
    policies: {
      "abg.root_mode": "direct",
      "abg.compute_regime": "mixed",
    },
  });
  const publication = gtl.canonicalizeAuthoredGtlCarrier(
    publicationWithRootVariant({
      ...base,
      closureContracts: [
        ...base.closureContracts,
        {
          ...structuredClone(sourceClosureContract),
          closureContractRef: FH_ROOT_CLOSURE_CONTRACT_REF,
          closureScope: "run",
          resultContractRef: rootOutputContractRef,
          eventKindRefs: [
            "terminal_reached",
            "frame_closed",
            "graph_call_closed",
            "run_closed",
          ],
        },
      ],
      contracts: [
        ...base.contracts,
        {
          ...structuredClone(sourceInputContract),
          contractRef: FH_INPUT_CONTRACT_REF,
          contractKind: "input",
        },
      ],
    }, {
      sourceGraphFunctionRef: source.name,
      graphFunction,
      program,
      childRefs,
    }),
    "module_publication",
  );
  return {
    publication,
    programRef: program.programRef,
    graphFunctionRef: graphFunction.name,
    childRefs,
    input: unresolvedConsensusResolution(environment.product),
    interaction: {
      capabilityRef: gtl.CONSENSUS_IDS.actorCapabilityRef,
    },
  };
}

function retryFpHelloPublication(gtl, base) {
  return {
    publication: base,
    programRef: gtl.FP_RETRY_HELLO_IDS.programRef,
    graphFunctionRef: gtl.FP_RETRY_HELLO_IDS.graphFunctionRef,
    childRefs: [],
    input: gtl.constructFpHelloInstruction(
      "T-287 retry gap",
      "Produce one concise greeting for the declared subject.",
      "closed_prompt_proof",
    ),
  };
}

function fhThenRetryPublication(gtl, base, environment) {
  return retryFhPublication(gtl, base, environment, "fh_then_retry");
}

function tripleNestedRetryFhPublication(gtl, base, environment) {
  return retryFhPublication(gtl, base, environment, "triple_nested_fh");
}

function deferredFhThenRetryPublication(gtl, base, environment) {
  return {
    ...fhThenRetryPublication(gtl, base, environment),
    deferResumeTraversal: true,
  };
}

async function executeTestGraph(context, constructFixture, options = {}) {
  const environment = await setupInstalledRootCatalog(context, root);
  const {
    abg,
    admittedInstall,
    artifactTruth,
    gtl,
    hogInstalledProduct,
    product,
    store: initialStore,
    validator,
    workspaceBinding,
  } = environment;
  let store = initialStore;
  const fixture = constructFixture(gtl, environment.publication, environment);
  await options.prepareStore?.({ environment, fixture });
  const authoredPublication = fixture.publication;
  const authoredProgram = authoredPublication.programs.find((candidate) =>
    candidate.programRef === fixture.programRef);
  const authoredGraphFunction = authoredPublication.graphFunctions.find(
    (candidate) => candidate.name === fixture.graphFunctionRef,
  );
  assert.ok(authoredProgram);
  assert.ok(authoredGraphFunction);
  const publicationAdmission = requireRawAdmission(
    validator,
    authoredPublication,
    "module_publication",
    "contract://abiogenesis/gtl/module-publication@5",
  );
  const contributionAdmissions = authoredPublication.contributions.map((value) =>
    requireRawAdmission(
      validator,
      value,
      "catalog_contribution",
      "contract://abiogenesis/gtl/catalog-contribution@5",
    ));
  const publicationValidation = validator.validatePublication(
    publicationAdmission,
    contributionAdmissions,
  );
  assert.equal(publicationValidation.kind, "publication_validation",
    JSON.stringify(publicationValidation));
  const programInput = rawProgramInput(
    validator,
    publicationAdmission,
    authoredProgram,
  );
  const programValidation = validator.validateProgram(programInput);
  assert.equal(programValidation.kind, "program_validation",
    JSON.stringify(programValidation));
  const publication = publicationAdmission.value;
  const program = programInput.program.value;
  const graphFunction = programInput.graphFunctions.find((candidate) =>
    candidate.value.name === fixture.graphFunctionRef)?.value;
  assert.ok(graphFunction);
  const catalog = product.buildGraphFunctionCatalog([publication]);
  assert.equal(catalog.kind, "graph_function_catalog", JSON.stringify(catalog));
  const catalogView = product.narrowGraphFunctionCatalog(
    catalog,
    [
      fixture.graphFunctionRef,
      ...(fixture.childRefs ?? [fixture.childRef]).filter(Boolean),
    ],
  );
  assert.equal(catalogView.kind, "graph_function_catalog_view",
    JSON.stringify(catalogView));
  const input = fixture.input;
  const rawInput = requireRawAdmission(
    validator,
    input,
    "invocation_input",
    graphFunction.inputs[0],
  );
  const requestValue = {
    kind: "public_invocation",
    schemaVersion: "5.0.0",
    operationId: "abg.operation.run.invoke",
    variant: "direct",
    invocationRef: "invocation://t287/r6/retry-workflow",
    eventTime: "2026-08-07T00:00:00.000Z",
    correlationId: "correlation://t287/r6/retry-workflow",
    payload: {
      programRef: program.programRef,
      catalogHandle: graphFunction.name,
    },
  };
  const rawRequest = requireRawAdmission(
    validator,
    requestValue,
    "public_operation_request",
    "contract://abiogenesis/public/run-invoke-request@5",
  );
  const policy = product.constructRootInvocationPolicy(
    workspaceBinding,
    program,
    fixture.interaction === undefined
      ? []
      : programValidation.interactionLeafRows.map((row) => ({
          requirementKey: row.requirementKey,
          requirementKeyDigest: row.requirementKeyDigest,
          actorCapabilityRef: row.requirement.actorCapabilityRef,
        })),
    ["F_D", "F_P", "F_H"].filter((regime) =>
      [
        ...programValidation.executableLeafRows,
        ...programValidation.interactionLeafRows,
      ].some((row) => row.fibre === regime)),
  );
  const actorRef = workspaceBinding.authorizedActorRef;
  const grants = [
    product.constructCapabilityGrant(policy, actorRef),
    ...(fixture.interaction === undefined
      ? []
      : [
          product.constructCapabilityGrant(
            policy,
            actorRef,
            "abg.operation.interaction.respond",
            fixture.interaction.capabilityRef,
          ),
          product.constructCapabilityGrant(
            policy,
            actorRef,
            "abg.operation.run.continue",
            fixture.interaction.capabilityRef,
          ),
        ]),
  ];
  const selectedRow = product.lookupGraphFunction(
    catalogView,
    graphFunction.name,
  );
  assert.ok(selectedRow);
  const authority = product.constructInvocationAuthority(
    actorRef,
    workspaceBinding,
    catalogView,
    program.programRef,
    selectedRow,
    policy,
    grants,
  );
  assert.equal(authority.kind, "invocation_authority", JSON.stringify(authority));
  const invocation = product.constructDirectInvocation(
    workspaceBinding,
    catalogView,
    program,
    selectedRow,
    rawRequest,
    rawInput,
    policy,
    grants,
    authority,
  );
  assert.equal(invocation.kind, "public_invocation_candidate",
    JSON.stringify(invocation));
  const invocationAdmission = abg.admitInvocation(store, {
    invocation,
    rawRequest,
    rawInput,
    modulePublication: publication,
    program,
    graphFunction,
    programValidation,
    artifactTruth,
    workspaceBinding,
    catalogView,
    policy,
    capabilityGrants: grants,
    authority,
  }, publicOperationBasis(
    product,
    "abg.operation.run.invoke",
    workspaceBinding.bindingId,
    workspaceBinding.bindingDigest,
    invocation.publicRequestInvocationRef,
    [workspaceBinding.admissionEventRef],
  ));
  assert.equal(invocationAdmission.kind, "invocation_admission",
    JSON.stringify(invocationAdmission));
  await options.afterInvocationAdmitted?.({
    abg,
    artifactTruth,
    authority,
    catalogView,
    environment,
    fixture,
    graphFunction,
    grants,
    input,
    invocation,
    invocationAdmission,
    policy,
    product,
    program,
    programValidation,
    publication,
    rawInput,
    requestValue,
    selectedRow,
    store,
    validator,
    workspaceBinding,
  });
  const graph = gtl.materializeGraph(graphFunction, {
    invocationAdmissionRef: invocationAdmission.invocationAdmissionRef,
    admittedInputRef: rawInput.admissionRef,
    admittedInputDigest: rawInput.subjectDigest,
    admittedInput: input,
  });
  const graphValidation = validator.validateGraph(
    graph,
    programValidation,
    graphFunction,
    {
      invocationAdmissionRef: invocationAdmission.invocationAdmissionRef,
      admittedInputRef: rawInput.admissionRef,
      admittedInputDigest: rawInput.subjectDigest,
      admittedInput: input,
    },
  );
  assert.equal(graphValidation.kind, "graph_validation",
    JSON.stringify(graphValidation));
  const implementationModules = await Promise.all(
    [...new Set(publication.implementationBindings.map((binding) =>
      binding.modulePath))].map((modulePath, index) =>
      import(`${pathToFileURL(join(
        environment.installedRoot,
        modulePath,
      )).href}?t287-r6=${Date.now()}-${index}`)),
  );
  const packagedImplementations = implementationModules.flatMap((module) =>
    Object.values(module).filter(product.isPackagedLeafImplementationDescriptor));
  const resolutionSetCandidate = product.resolveImplementationSet(
    catalogView,
    publication,
    programValidation,
    packagedImplementations,
  );
  assert.equal(resolutionSetCandidate.kind,
    "implementation_resolution_set_candidate",
  JSON.stringify(resolutionSetCandidate));
  const resolutionSetValidation =
    validator.validateImplementationResolutionSet(
      resolutionSetCandidate,
      catalogView,
      publication,
      programValidation,
      packagedImplementations,
    );
  assert.equal(resolutionSetValidation.kind,
    "implementation_resolution_set_validation",
  JSON.stringify(resolutionSetValidation));
  const closureContract = publication.closureContracts.find((candidate) =>
    candidate.closureContractRef === program.closureContractRef);
  assert.ok(closureContract);
  const execution = abg.admitExecutionBasis(store, {
    invocationAdmission,
    rawInputValue: input,
    program,
    programValidation,
    graph,
    graphValidation,
    resolutionSetCandidate,
    resolutionSetValidation,
    closureContract,
  }, {
    eventTime: requestValue.eventTime,
    correlationId: requestValue.correlationId,
    causationEventRefs: [],
  });
  assert.equal(execution.kind, "execution_basis_admission",
    JSON.stringify(execution));
  const opened = abg.openCall(store, execution.executionBasis, {
    eventTime: requestValue.eventTime,
    correlationId: `${requestValue.correlationId}/open`,
    causationEventRefs: [],
  });
  assert.equal(opened.kind, "open_call_admission", JSON.stringify(opened));
  const semantics = await product.loadInstalledProductSemantics({
    install: admittedInstall,
    publication,
    verifyInstallAdmission: (install) =>
      abg.hasAdmittedProductInstall(artifactTruth, install),
  });
  const leafPort = await hogInstalledProduct.bindInstalledLeafInvocationPort({
    prefix: abg.selectValidatedRuntimeEventPrefix(store.readAll()),
    artifactTruth,
    install: admittedInstall,
    implementationSet: execution.implementationSet,
    publication,
    semanticsProjection: product.projectInstalledLeafSemantics(semantics),
  });
  const childModule = await import(pathToFileURL(join(
    environment.installedRoot,
    "build/code/src/public/child_traversal_port.js",
  )).href);
  const graphExecute = await import(pathToFileURL(join(
    environment.installedRoot,
    "build/code/src/hog/graph_execute.js",
  )).href);
  const childTraversalPreparationPort =
    childModule.bindChildTraversalPreparationPort({
      store,
      publication,
      program,
      programValidation,
      rootImplementationSet: execution.implementationSet,
      rootInteractionSet: execution.interactionSet,
    });
  let traversalExecutionInput = {
    store,
    executionBasis: execution.executionBasis,
    openedTraversalScope: opened.scope,
    program,
    graphFunction,
    graph,
    graphValidation,
    implementationSet: execution.implementationSet,
    interactionSet: execution.interactionSet,
    continuationProductBasis: {
      artifactTruth,
      install: admittedInstall,
      workspaceBinding,
      catalogView,
      programValidation,
      graphValidation,
    },
    leafPort,
    childTraversalPreparationPort,
    closureContract,
    actorRuntimeBinding: { workspaceBinding, artifactTruth },
    input,
    inputDigest: rawInput.subjectDigest,
    eventTime: requestValue.eventTime,
    correlationId: `${requestValue.correlationId}/hog`,
  };
  let completion = await graphExecute.executeGraphTraversal(
    traversalExecutionInput,
  );
  if (fixture.interaction !== undefined) {
    const completedInteraction = await completeFhInteraction({
      ...environment,
      context,
      actorRef,
      catalogView,
      closureContract,
      completion,
      execution,
      fixture,
      graph,
      graphExecute,
      graphFunction,
      invocationAdmission,
      leafPort,
      policy,
      program,
      programValidation,
      requestValue,
      traversalExecutionInput,
    });
    completion = completedInteraction.completion;
    store = completedInteraction.store;
    traversalExecutionInput = {
      ...traversalExecutionInput,
      store,
      childTraversalPreparationPort:
        completedInteraction.childTraversalPreparationPort,
    };
  }
  return {
    completion,
    context,
    events: store.readAll(),
    environment,
    execution,
    fixture,
    graph,
    graphFunction,
    invocationAdmission,
    opened,
    program,
    traversalExecutionInput,
  };
}

function admitUnrelatedInvocationBeforeTargetRun(runtime) {
  const {
    abg,
    authority,
    catalogView,
    graphFunction,
    grants,
    invocationAdmission: targetInvocationAdmission,
    policy,
    product,
    program,
    programValidation,
    publication,
    rawInput,
    requestValue,
    selectedRow,
    store,
    validator,
    workspaceBinding,
  } = runtime;
  const unrelatedRequestValue = {
    ...requestValue,
    invocationRef: "invocation://t287/r6/retry-workflow/unrelated-gap-owner",
    correlationId:
      "correlation://t287/r6/retry-workflow/unrelated-gap-owner",
  };
  const unrelatedRawRequest = requireRawAdmission(
    validator,
    unrelatedRequestValue,
    "public_operation_request",
    "contract://abiogenesis/public/run-invoke-request@5",
  );
  const unrelatedInvocation = product.constructDirectInvocation(
    workspaceBinding,
    catalogView,
    program,
    selectedRow,
    unrelatedRawRequest,
    rawInput,
    policy,
    grants,
    authority,
  );
  assert.equal(
    unrelatedInvocation.kind,
    "public_invocation_candidate",
    JSON.stringify(unrelatedInvocation),
  );
  const currentArtifactTruth = abg.projectExactPrefixArtifactTruth(
    abg.selectHeldEventStoreDurablePrefix(store),
  );
  assert.equal(
    currentArtifactTruth.kind,
    "exact_prefix_artifact_truth_projection",
    JSON.stringify(currentArtifactTruth),
  );
  const unrelatedInvocationAdmission = abg.admitInvocation(store, {
    invocation: unrelatedInvocation,
    rawRequest: unrelatedRawRequest,
    rawInput,
    modulePublication: publication,
    program,
    graphFunction,
    programValidation,
    artifactTruth: currentArtifactTruth,
    workspaceBinding,
    catalogView,
    policy,
    capabilityGrants: grants,
    authority,
  }, publicOperationBasis(
    product,
    "abg.operation.run.invoke",
    workspaceBinding.bindingId,
    workspaceBinding.bindingDigest,
    unrelatedInvocation.publicRequestInvocationRef,
    [workspaceBinding.admissionEventRef],
  ));
  assert.equal(
    unrelatedInvocationAdmission.kind,
    "invocation_admission",
    JSON.stringify(unrelatedInvocationAdmission),
  );
  assert.notEqual(
    unrelatedInvocationAdmission.invocationAdmissionRef,
    targetInvocationAdmission.invocationAdmissionRef,
  );
  assert.notEqual(
    unrelatedInvocationAdmission.publicOperationEventRef,
    targetInvocationAdmission.publicOperationEventRef,
  );
  assert.notEqual(
    unrelatedInvocationAdmission.admissionEventRef,
    targetInvocationAdmission.admissionEventRef,
  );
  return unrelatedInvocationAdmission;
}

function forgedPreparedOperationCarriers(
  prepared,
  forgedActorRef,
  suffix,
) {
  const event = structuredClone(prepared.event);
  assert.ok(event.payload !== null && !Array.isArray(event.payload));
  assert.ok(Array.isArray(event.payload.capabilityGrantRefs));
  return [
    {
      label: "actor",
      prepared: {
        ...prepared,
        operation: {
          ...prepared.operation,
          actorRef: forgedActorRef,
        },
      },
    },
    {
      label: "extra grant",
      prepared: {
        ...prepared,
        event: {
          ...event,
          payload: {
            ...event.payload,
            capabilityGrantRefs: [
              ...event.payload.capabilityGrantRefs,
              `capability-grant://abiogenesis/t287/${suffix}/forged`,
            ],
          },
        },
      },
    },
    {
      label: "event body",
      prepared: {
        ...prepared,
        event: {
          ...event,
          correlationId: `${event.correlationId}/forged-${suffix}`,
        },
      },
    },
  ];
}

async function completeFhInteraction(runtime) {
  const {
    abg,
    actorRef,
    admittedInstall,
    artifactTruth,
    catalogView,
    closureContract,
    completion: held,
    context,
    execution,
    fixture,
    graph,
    graphExecute,
    graphFunction,
    hog,
    hogExecute,
    installedRoot,
    invocationAdmission,
    product,
    program,
    programValidation,
    requestValue,
    store: heldStore,
    traversalExecutionInput,
    workspaceBinding,
  } = runtime;
  let store = heldStore;
  assert.equal(held.disposition, "held", JSON.stringify(held));
  assert.ok(held.continuationRef);
  assert.ok(held.heldInteraction);
  const heldEvents = store.readAll();
  const heldFibreIndex = heldEvents.findIndex((event) =>
    event.kind === "c_call_fibre_selected" &&
    event.aggregateId === held.heldInteraction.cCall.cCallRef);
  assert.ok(heldFibreIndex >= 0);
  const { projectOpenedCCallCarrierAtPrefix } = await import(pathToFileURL(join(
    installedRoot,
    "build/code/src/abg/c_call.js",
  )).href);
  const eventStoreModule = await import(pathToFileURL(join(
    installedRoot,
    "build/code/src/abg/event_store.js",
  )).href);
  const projectedOpenedInteraction = projectOpenedCCallCarrierAtPrefix(
    abg.selectValidatedRuntimeEventPrefix(
      Object.freeze(heldEvents.slice(0, heldFibreIndex + 1)),
    ),
    graph,
    held.heldInteraction.cCall.cCallRef,
    held.heldInteraction.cursor,
  );
  assert.deepEqual(
    projectedOpenedInteraction,
    held.heldInteraction.cCall,
    "fresh history reconstructs the exact held F_H CCall before pending result or judgment",
  );
  let prefix = abg.selectValidatedRuntimeEventPrefix(store.readAll());
  let continuation = abg.replayValidatedRuntimeEventPrefix(prefix)
    .continuations.find((row) =>
    row.continuationRef === held.continuationRef);
  assert.equal(continuation?.status, "open");
  const respondOperationBasis = publicOperationBasis(
    product,
    "abg.operation.interaction.respond",
    workspaceBinding.bindingId,
    workspaceBinding.bindingDigest,
    "invocation://t287/r6/retry-fh/respond",
  );
  const malformedRespondOperationBasis = {
    ...respondOperationBasis,
    invocationPayloadDigest: "x",
    invocationDigest: product.sha256Canonical({
      invocationRef: respondOperationBasis.invocationRef,
      operationId: respondOperationBasis.operationId,
      payloadDigest: "x",
    }),
  };
  const assertBasisRefusalWithoutMutation = async (
    acquired,
    apply,
    expected,
    message,
  ) => {
    const refusalStore = acquired.store;
    const beforeEvents = refusalStore.readAll();
    const beforeStoreDigest = refusalStore.digest();
    const beforePrefix = abg.selectHeldEventStoreDurablePrefix(refusalStore);
    const beforeArtifactTruth = abg.projectExactPrefixArtifactTruth(
      beforePrefix,
    );
    const eventLogUrl = new URL(beforePrefix.eventLogRef);
    const beforeBytes = readFileSync(eventLogUrl);
    const beforeByteDigest =
      `sha256:${createHash("sha256").update(beforeBytes).digest("hex")}`;
    if (expected === null) {
      assert.equal(apply(), null, message);
    } else {
      assert.throws(apply, expected, message);
    }
    assert.deepEqual(
      refusalStore.readAll(),
      beforeEvents,
      `${message}: event count/content`,
    );
    assert.equal(
      refusalStore.digest(),
      beforeStoreDigest,
      `${message}: store digest`,
    );
    assert.deepEqual(
      abg.selectHeldEventStoreDurablePrefix(refusalStore),
      beforePrefix,
      `${message}: held coordinate`,
    );
    const afterBytes = readFileSync(eventLogUrl);
    assert.deepEqual(afterBytes, beforeBytes, `${message}: durable bytes`);
    assert.equal(afterBytes.byteLength, beforeBytes.byteLength);
    assert.equal(
      `sha256:${createHash("sha256").update(afterBytes).digest("hex")}`,
      beforeByteDigest,
    );
    assert.deepEqual(
      abg.projectExactPrefixArtifactTruth(beforePrefix),
      beforeArtifactTruth,
      `${message}: predecessor projection`,
    );
    const refusalHandoff = refusalStore.projectReopenAuthorityAndClose();
    assert.deepEqual(refusalHandoff.prefix, beforePrefix);
    const fresh = await runEntry212ReopenProbe({
      originProcessId: process.pid,
      installedRoot,
      reopenAuthority: refusalHandoff.reopenAuthority,
      prefix: refusalHandoff.prefix,
    });
    assert.notEqual(fresh.processId, process.pid);
    assert.deepEqual(fresh.events, beforeEvents, `${message}: PID-2 events`);
    assert.equal(fresh.storeDigest, beforeStoreDigest, `${message}: PID-2 digest`);
    assert.deepEqual(fresh.heldPrefix, beforePrefix, `${message}: PID-2 coordinate`);
    assert.deepEqual(
      fresh.artifactTruth,
      beforeArtifactTruth,
      `${message}: PID-2 predecessor projection`,
    );
    assert.equal(fresh.durableByteLength, beforeBytes.byteLength);
    assert.equal(fresh.durableByteDigest, beforeByteDigest);
  };
  const validRespondGrant = abg.resolveContinuationPublicOperationGrant({
    rootInvocation: invocationAdmission,
    continuation,
    operation: "abg.operation.interaction.respond",
    variant: "answer_escalation",
    actorRef,
    capabilityRef: fixture.interaction.capabilityRef,
    basis: respondOperationBasis,
  });
  assert.ok(validRespondGrant, "the unchanged respond basis reaches one exact grant");
  const respondBasisRefusalStore = await cloneEventPrefixFixture(
    context,
    abg,
    eventStoreModule,
    store.readAll(),
    "abi5-entry212-respond-basis-refusal-",
  );
  await assertBasisRefusalWithoutMutation(
    respondBasisRefusalStore,
    () => abg.resolveContinuationPublicOperationGrant({
      rootInvocation: invocationAdmission,
      continuation,
      operation: "abg.operation.interaction.respond",
      variant: "answer_escalation",
      actorRef,
      capabilityRef: fixture.interaction.capabilityRef,
      basis: malformedRespondOperationBasis,
    }),
    null,
    "respond owner rejects a malformed shared Public basis",
  );
  const respondPlan = abg.prepareContinuationPublicOperation(
    prefix,
    invocationAdmission,
    "abg.operation.interaction.respond",
    continuation,
    "answer_escalation",
    actorRef,
    fixture.interaction.capabilityRef,
    respondOperationBasis,
  );
  const semanticBasis = abg.projectFhInteractionSemanticBasisAtPrefix(
    prefix,
    continuation,
  );
  assert.ok(semanticBasis);
  const responseBody = {
    kind: "consensus_escalation_decision",
    schemaVersion: "5.0.0",
    roundDecision: fixture.input,
    decision: "accept_with_dissent",
    humanActorRef: actorRef,
    rationaleRef: "rationale://t287/retry-fh/accepted",
  };
  const decisionDigest = product.sha256Canonical(responseBody);
  const responseCandidate = {
    ...responseBody,
    decisionRef:
      `consensus-escalation-decision://abg/${
        decisionDigest.slice("sha256:".length)
      }`,
    decisionDigest,
  };
  const semantics = await product.loadInstalledProductSemantics({
    install: admittedInstall,
    publication: fixture.publication,
    verifyInstallAdmission: (install) =>
      abg.hasAdmittedProductInstall(artifactTruth, install),
  });
  const response = product.evaluateInstalledInteractionResponse(
    semantics,
    { ...semanticBasis, actingActorRef: actorRef },
    responseCandidate,
  );
  assert.ok(response, "installed Product accepts the exact F_H decision");
  const responseBasis = {
    eventTime: respondOperationBasis.eventTime,
    correlationId: respondOperationBasis.correlationId,
    causationEventRefs: [],
  };
  const preparedResponse = abg.prepareFhInteractionResponse(
    respondPlan,
    continuation,
    continuation.responseContractRef,
    response,
    responseBasis,
  );
  assert.equal(preparedResponse.response.kind, "fh_interaction_response_admission");
  const handoff = store.projectReopenAuthorityAndClose();
  const reopened = abg.reopenEventStore(
    handoff.reopenAuthority,
    handoff.prefix,
  );
  assert.equal(reopened.kind, "reopened_event_store_context", JSON.stringify(reopened));
  store = reopened.store;
  const resumedChildModule = await import(pathToFileURL(join(
    installedRoot,
    "build/code/src/public/child_traversal_port.js",
  )).href);
  const resumedChildTraversalPreparationPort =
    resumedChildModule.bindChildTraversalPreparationPort({
      store,
      publication: fixture.publication,
      program,
      programValidation,
      rootImplementationSet: execution.implementationSet,
      rootInteractionSet: execution.interactionSet,
    });
  const assertOwnerRefusalWithoutMutation = (apply, pattern, message) => {
    const eventLogUrl = new URL(handoff.prefix.eventLogRef);
    const beforeBytes = readFileSync(eventLogUrl);
    const beforeCount = store.readAll().length;
    assert.throws(apply, pattern, message);
    assert.equal(store.readAll().length, beforeCount);
    assert.deepEqual(readFileSync(eventLogUrl), beforeBytes);
  };
  for (const forged of forgedPreparedOperationCarriers(
    respondPlan,
    `${actorRef}/forged`,
    "response",
  )) {
    assertOwnerRefusalWithoutMutation(
      () => abg.prepareFhInteractionResponse(
        forged.prepared,
        continuation,
        continuation.responseContractRef,
        response,
        responseBasis,
      ),
      /exact prefix-projected operation and open continuation/u,
      `F_H response preparation rejects a forged ${forged.label} carrier`,
    );
  }
  const forgedResponseContractRef =
    `${continuation.responseContractRef}/forged`;
  const forgedResponseCausationBases = [
    {
      causationEventRefs: [continuation.openedEventRef],
    },
    {
      causationEventRefs: [
        respondPlan.operation.admissionEventRef,
        continuation.openedEventRef,
      ],
    },
    {
      causationEventRefs: [
        "runtime-event://abiogenesis/t287/forged-response-cause",
      ],
    },
  ];
  for (const forgedBasis of forgedResponseCausationBases) {
    const basis = {
      ...responseBasis,
      causationEventRefs: forgedBasis.causationEventRefs,
    };
    assertOwnerRefusalWithoutMutation(
      () => abg.prepareFhInteractionResponse(
        respondPlan,
        continuation,
        continuation.responseContractRef,
        response,
        basis,
      ),
      /exact prefix-projected operation and open continuation/u,
    );
    assertOwnerRefusalWithoutMutation(
      () => abg.commitFhInteractionResponseAtExpectedPrefix(
        store,
        handoff.prefix,
        invocationAdmission,
        continuation,
        "answer_escalation",
        actorRef,
        fixture.interaction.capabilityRef,
        respondOperationBasis,
        continuation.responseContractRef,
        response,
        basis,
      ),
      /exact prefix-projected operation and open continuation/u,
    );
  }
  const forgedContinuationIdentity = {
    continuationKind: continuation.continuationKind,
    runId: continuation.runId,
    graphCallId: continuation.graphCallId,
    frameId: continuation.frameId,
    cCallRef: continuation.cCallRef,
    heldCursorRef: continuation.heldCursorRef,
    heldCursorDigest: continuation.heldCursorDigest,
    requestRef: continuation.requestRef,
    requestDigest: continuation.requestDigest,
    actorCapabilityRef: continuation.actorCapabilityRef,
    responseContractRef: forgedResponseContractRef,
    executionBasisRef: execution.executionBasis.basisRef,
    constructionIntentRef: continuation.constructionIntentRef,
  };
  const forgedContinuationDigest = product.sha256Canonical(
    forgedContinuationIdentity,
  );
  const forgedOpenContinuation = {
    ...structuredClone(continuation),
    continuationRef:
      `continuation://abiogenesis/${
        forgedContinuationDigest.slice("sha256:".length)
      }`,
    continuationDigest: forgedContinuationDigest,
    responseContractRef: forgedResponseContractRef,
  };
  assertOwnerRefusalWithoutMutation(
    () => abg.commitFhInteractionResponseAtExpectedPrefix(
      store,
      handoff.prefix,
      invocationAdmission,
      forgedOpenContinuation,
      "answer_escalation",
      actorRef,
      fixture.interaction.capabilityRef,
      respondOperationBasis,
      forgedResponseContractRef,
      response,
      responseBasis,
    ),
    /exact current durable continuation lifecycle/u,
  );
  assertOwnerRefusalWithoutMutation(
    () => abg.commitFhInteractionResponseAtExpectedPrefix(
      store,
      handoff.prefix,
      invocationAdmission,
      continuation,
      "forged_response_variant",
      actorRef,
      fixture.interaction.capabilityRef,
      respondOperationBasis,
      continuation.responseContractRef,
      response,
      responseBasis,
    ),
    /exact admitted run authority/u,
  );
  const committedResponse = abg.commitFhInteractionResponseAtExpectedPrefix(
    store,
    handoff.prefix,
    invocationAdmission,
    continuation,
    "answer_escalation",
    actorRef,
    fixture.interaction.capabilityRef,
    respondOperationBasis,
    continuation.responseContractRef,
    response,
    responseBasis,
  );
  const responded = committedResponse.response;
  prefix = abg.selectValidatedRuntimeEventPrefix(store.readAll());
  continuation = abg.replayValidatedRuntimeEventPrefix(prefix)
    .continuations.find((row) =>
    row.continuationRef === held.continuationRef);
  assert.equal(continuation?.status, "responded");
  const continueOperationBasis = publicOperationBasis(
    product,
    "abg.operation.run.continue",
    workspaceBinding.bindingId,
    workspaceBinding.bindingDigest,
    "invocation://t287/r6/retry-fh/continue",
  );
  const emptyContinueOperationBasis = {
    ...continueOperationBasis,
    invocationRef: "",
    invocationDigest: product.sha256Canonical({
      invocationRef: "",
      operationId: continueOperationBasis.operationId,
      payloadDigest: continueOperationBasis.invocationPayloadDigest,
    }),
  };
  const validContinueGrant = abg.resolveContinuationPublicOperationGrant({
    rootInvocation: invocationAdmission,
    continuation,
    operation: "abg.operation.run.continue",
    variant: "current_intent",
    actorRef,
    capabilityRef: fixture.interaction.capabilityRef,
    basis: continueOperationBasis,
  });
  assert.ok(validContinueGrant, "the unchanged continue basis reaches one exact grant");
  const continueBasisRefusalStore = await cloneEventPrefixFixture(
    context,
    abg,
    eventStoreModule,
    store.readAll(),
    "abi5-entry212-continue-basis-refusal-",
  );
  await assertBasisRefusalWithoutMutation(
    continueBasisRefusalStore,
    () => abg.resolveContinuationPublicOperationGrant({
      rootInvocation: invocationAdmission,
      continuation,
      operation: "abg.operation.run.continue",
      variant: "current_intent",
      actorRef,
      capabilityRef: fixture.interaction.capabilityRef,
      basis: emptyContinueOperationBasis,
    }),
    null,
    "continue owner rejects an empty shared Public basis identity",
  );
  const continuePlan = abg.prepareContinuationPublicOperation(
    prefix,
    invocationAdmission,
    "abg.operation.run.continue",
    continuation,
    "current_intent",
    actorRef,
    fixture.interaction.capabilityRef,
    continueOperationBasis,
  );
  const continueOperation = continuePlan.operation;
  const rehydrated = abg.rehydrateFhContinuationAtPrefix(
    continuePlan.projectedPrefix,
    continuation,
    {
      install: admittedInstall,
      workspaceBinding,
      catalogView,
      program,
      graph,
      closureContract,
    },
    continueOperation,
  );
  assert.ok(rehydrated, "exact responded continuation rehydrates");
  const heldCursor = hog.rehydrateHeldInteractionCursor(
    continuePlan.projectedPrefix,
    rehydrated.heldInteraction.cursor,
  );
  assert.ok(heldCursor, "exact held interaction cursor rehydrates");
  const successorInputContractRef =
    hog.deriveInteractionSuccessorInputCarrierRef(graph, heldCursor);
  const successorInputValueKind = successorInputContractRef === null
    ? null
    : traversalExecutionInput.leafPort.contractValueKindByRef(
        successorInputContractRef,
      );
  const successorInput = abg.deriveFhResumeSuccessorInputAtPrefix(
    continuePlan.projectedPrefix,
    continuation,
    continueOperation,
    execution.executionBasis,
    closureContract,
    {
      inputContractRef: successorInputContractRef,
      inputValueKind: successorInputValueKind,
    },
  );
  const successorCursor = hog.deriveInteractionResumeCursor(
    heldCursor,
    {
      inputRef: successorInput.inputRef,
      inputDigest: successorInput.inputDigest,
    },
  );
  assert.equal(successorCursor.kind, "traversal_cursor",
    JSON.stringify(successorCursor));
  const resumeBasis = {
    eventTime: continueOperationBasis.eventTime,
    correlationId: continueOperationBasis.correlationId,
    causationEventRefs: [],
  };
  const preparedResume = abg.prepareFhInteractionResume(
    continuePlan,
    continuation,
    execution.executionBasis,
    closureContract,
    successorInput,
    successorCursor,
    committedResponse.successorPrefix.prefixDigest,
    resumeBasis,
  );
  assert.equal(preparedResume.resume.kind, "fh_interaction_resume_admission");
  for (const forged of forgedPreparedOperationCarriers(
    continuePlan,
    `${actorRef}/forged`,
    "resume",
  )) {
    assertOwnerRefusalWithoutMutation(
      () => abg.prepareFhInteractionResume(
        forged.prepared,
        continuation,
        execution.executionBasis,
        closureContract,
        successorInput,
        successorCursor,
        committedResponse.successorPrefix.prefixDigest,
        resumeBasis,
      ),
      /exact prefix-projected operation, responded continuation, and successor cursor/u,
      `F_H resume preparation rejects a forged ${forged.label} carrier`,
    );
  }
  const zeroPrefixBody = {
    kind: "durable_prefix_coordinate",
    schemaVersion: "5.0.0",
    eventLogRef: committedResponse.successorPrefix.eventLogRef,
    prefixLength: 0,
    prefixDigest:
      "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    storeIdentity: committedResponse.successorPrefix.storeIdentity,
  };
  const forgedZeroPrefix = {
    ...zeroPrefixBody,
    coordinateDigest: product.sha256Canonical(zeroPrefixBody),
  };
  assert.equal(abg.validateDurablePrefixCoordinate(forgedZeroPrefix), true);
  const forgedResumeCausationBases = [
    {
      causationEventRefs: [continuation.respondedEventRef],
    },
    {
      causationEventRefs: [
        continuePlan.operation.admissionEventRef,
        continuation.respondedEventRef,
      ],
    },
    {
      causationEventRefs: [
        "runtime-event://abiogenesis/t287/forged-resume-cause",
      ],
    },
  ];
  for (const forgedBasis of forgedResumeCausationBases) {
    const basis = {
      ...resumeBasis,
      causationEventRefs: forgedBasis.causationEventRefs,
    };
    assertOwnerRefusalWithoutMutation(
      () => abg.prepareFhInteractionResume(
        continuePlan,
        continuation,
        execution.executionBasis,
        closureContract,
        successorInput,
        successorCursor,
        committedResponse.successorPrefix.prefixDigest,
        basis,
      ),
      /exact prefix-projected operation, responded continuation, and successor cursor/u,
    );
    assertOwnerRefusalWithoutMutation(
      () => abg.commitFhInteractionResumeAtExpectedPrefix(
        store,
        committedResponse.successorPrefix,
        invocationAdmission,
        continuation,
        "current_intent",
        actorRef,
        fixture.interaction.capabilityRef,
        continueOperationBasis,
        execution.executionBasis,
        closureContract,
        successorInput,
        successorCursor,
        basis,
      ),
      /exact prefix-projected operation, responded continuation, and successor cursor/u,
    );
  }
  assertOwnerRefusalWithoutMutation(
    () => abg.commitFhInteractionResumeAtExpectedPrefix(
      store,
      forgedZeroPrefix,
      invocationAdmission,
      continuation,
      "current_intent",
      actorRef,
      fixture.interaction.capabilityRef,
      continueOperationBasis,
      execution.executionBasis,
      closureContract,
      successorInput,
      successorCursor,
      resumeBasis,
    ),
    /held store differs from the selected durable prefix/u,
  );
  const forgedResponseValue = {
    ...structuredClone(continuation.responseValue),
    forged: true,
  };
  const forgedResponseDigest = product.sha256Canonical(forgedResponseValue);
  const forgedRespondedContinuation = {
    ...structuredClone(continuation),
    responseRef:
      `interaction-response://abiogenesis/${
        forgedResponseDigest.slice("sha256:".length)
      }`,
    responseDigest: forgedResponseDigest,
    responseValue: forgedResponseValue,
  };
  assertOwnerRefusalWithoutMutation(
    () => abg.commitFhInteractionResumeAtExpectedPrefix(
      store,
      committedResponse.successorPrefix,
      invocationAdmission,
      forgedRespondedContinuation,
      "current_intent",
      actorRef,
      fixture.interaction.capabilityRef,
      continueOperationBasis,
      execution.executionBasis,
      closureContract,
      successorInput,
      successorCursor,
      resumeBasis,
    ),
    /exact current durable continuation lifecycle/u,
  );
  assertOwnerRefusalWithoutMutation(
    () => abg.commitFhInteractionResumeAtExpectedPrefix(
      store,
      committedResponse.successorPrefix,
      invocationAdmission,
      continuation,
      "forged_resume_variant",
      actorRef,
      fixture.interaction.capabilityRef,
      continueOperationBasis,
      execution.executionBasis,
      closureContract,
      successorInput,
      successorCursor,
      resumeBasis,
    ),
    /exact admitted run authority/u,
  );
  const {
    kind: _cursorKind,
    schemaVersion: _cursorSchemaVersion,
    cursorRef: _cursorRef,
    cursorDigest: _cursorDigest,
    ...successorCursorBody
  } = structuredClone(successorCursor);
  const forgedCursorBody = {
    ...successorCursorBody,
    attempt: successorCursorBody.attempt + 1,
  };
  const forgedCursorDigest = product.sha256Canonical(forgedCursorBody);
  const forgedCursor = {
    kind: "traversal_cursor",
    schemaVersion: "5.0.0",
    cursorRef:
      `traversal-cursor://abiogenesis/${
        forgedCursorDigest.slice("sha256:".length)
      }`,
    cursorDigest: forgedCursorDigest,
    ...forgedCursorBody,
  };
  assertOwnerRefusalWithoutMutation(
    () => abg.commitFhInteractionResumeAtExpectedPrefix(
      store,
      committedResponse.successorPrefix,
      invocationAdmission,
      continuation,
      "current_intent",
      actorRef,
      fixture.interaction.capabilityRef,
      continueOperationBasis,
      execution.executionBasis,
      closureContract,
      successorInput,
      forgedCursor,
      resumeBasis,
    ),
    /exact prefix-projected operation, responded continuation, and successor cursor/u,
  );
  const committedResume = abg.commitFhInteractionResumeAtExpectedPrefix(
    store,
    committedResponse.successorPrefix,
    invocationAdmission,
    continuation,
    "current_intent",
    actorRef,
    fixture.interaction.capabilityRef,
    continueOperationBasis,
    execution.executionBasis,
    closureContract,
    successorInput,
    successorCursor,
    resumeBasis,
  );
  const resume = committedResume.resume;
  const resolvedContinuation = abg.replay(store, {
    runId: successorCursor.runId,
  }).continuations.find((row) =>
    row.continuationRef === resume.continuationRef);
  assert.equal(resolvedContinuation?.status, "resolved",
    JSON.stringify(resolvedContinuation));
  assert.equal(resolvedContinuation.cCallRef,
    rehydrated.heldInteraction.cCall.cCallRef);
  assert.equal(resolvedContinuation.responseRef, resume.responseRef);
  assert.equal(resolvedContinuation.responseDigest, resume.responseDigest);
  assert.equal(resolvedContinuation.successorCursorRef,
    successorCursor.cursorRef);
  assert.equal(resolvedContinuation.successorCursorDigest,
    successorCursor.cursorDigest);
  const freshlyReconstructedHeldInteraction = {
    cCall: structuredClone(rehydrated.heldInteraction.cCall),
    result: structuredClone(rehydrated.heldInteraction.result),
    judgment: structuredClone(rehydrated.heldInteraction.judgment),
    cursor: heldCursor,
  };
  const resumeCompletionInput = {
    store,
    executionBasis: execution.executionBasis,
    openedTraversalScope: traversalExecutionInput.openedTraversalScope,
    program,
    graphFunction,
    graph,
    interactionSet: execution.interactionSet,
    heldInteraction: freshlyReconstructedHeldInteraction,
    successorCursor,
    resume,
    closureContract,
    clock: {
      eventTime: requestValue.eventTime,
      correlationId: `${requestValue.correlationId}/hog/resume`,
    },
  };
  assertOwnerRefusalWithoutMutation(
    () => hogExecute.completeInteractionResume({
      ...resumeCompletionInput,
      heldInteraction: {
        ...resumeCompletionInput.heldInteraction,
        cCall: {
          ...resumeCompletionInput.heldInteraction.cCall,
          transitionContractRef:
            `${resumeCompletionInput.heldInteraction.cCall.transitionContractRef}/forged`,
        },
      },
    }),
    /fh_outcome_mismatch/u,
    "F_H resume owner rejects a forged nonidentity C-call field",
  );
  const pairedForgedCCall = {
    ...resumeCompletionInput.heldInteraction.cCall,
    transitionContractRef:
      `${resumeCompletionInput.heldInteraction.cCall.transitionContractRef}/paired-forged`,
  };
  assertOwnerRefusalWithoutMutation(
    () => hogExecute.completeInteractionResume({
      ...resumeCompletionInput,
      heldInteraction: {
        ...resumeCompletionInput.heldInteraction,
        cCall: pairedForgedCCall,
      },
      heldOutcome: {
        cCall: pairedForgedCCall,
        result: resumeCompletionInput.heldInteraction.result,
        judgment: resumeCompletionInput.heldInteraction.judgment,
      },
    }),
    /fh_outcome_mismatch/u,
    "F_H resume admission rejects paired forged legacy carriers",
  );
  let resumed = hogExecute.completeInteractionResume(resumeCompletionInput);
  if (
    resumed.disposition === "advanced" &&
    fixture.deferResumeTraversal !== true
  ) {
    assert.ok(resumed.nextCursor);
    assert.ok(resumed.resultValue);
    const resumedInputDigest = product.sha256Canonical(resumed.resultValue);
    resumed = await graphExecute.executeGraphTraversal({
      ...traversalExecutionInput,
      store,
      childTraversalPreparationPort: resumedChildTraversalPreparationPort,
      resume: {
        cursor: resumed.nextCursor,
        input: resumed.resultValue,
        inputDigest: resumedInputDigest,
      },
    });
  }
  assert.equal(responded.responseRef, resume.responseRef);
  return {
    completion: resumed,
    store,
    childTraversalPreparationPort: resumedChildTraversalPreparationPort,
  };
}

function assertAtomicSuccessfulRetryExit(execution) {
  assert.equal(execution.completion.disposition, "closed",
    JSON.stringify(execution.completion));
  const completed = execution.events.filter((event) =>
    event.kind === "retry_progress_recorded" &&
    event.payload.progressClass === "completed");
  assert.ok(completed.length > 0, "retry-depth exit records completion truth");
  const route = execution.events.find((event) =>
    event.kind === "traversal_route_admitted" &&
    completed.every((progress) =>
      event.payload.consumedAvailabilityRefs.includes(progress.payload.progressRef)
    ));
  assert.ok(route, "one accepted route consumes the complete retry-success suffix");
  const finalProgressIndex = execution.events.findIndex((event) =>
    event.eventId === completed.at(-1).eventId);
  const routeIndex = execution.events.findIndex((event) =>
    event.eventId === route.eventId);
  assert.equal(routeIndex, finalProgressIndex + 1,
    "completion progress and its route are one contiguous admitted suffix");
  assert.deepEqual(route.causationEventRefs.slice(0, completed.length),
    completed.toReversed().map((progress) => progress.eventId));
}

function assertNestedSuccessfulRetryExit(
  execution,
  completionClass,
  expectedDepth = 2,
) {
  assertAtomicSuccessfulRetryExit(execution);
  const completed = execution.events.filter((event) =>
    event.kind === "retry_progress_recorded" &&
    event.payload.progressClass === "completed" &&
    event.payload.completionClass === completionClass);
  assert.equal(completed.length, expectedDepth,
    "one completed row is admitted for every exited retry boundary");
  assert.deepEqual(
    completed.map((event) => event.payload.completedRetryDepth),
    Array.from({ length: expectedDepth }, (_, index) => expectedDepth - index),
    "completed depth is exact inner-to-outer",
  );
  assert.deepEqual(
    completed.map((event) => event.payload.predecessorProgressRef),
    [
      null,
      ...completed.slice(0, -1).map((event) => event.payload.progressRef),
    ],
    "each outer completion is chained to the immediately preceding inner row",
  );
  const progressRefs = completed.map((event) => event.payload.progressRef);
  const progressEventRefs = completed.map((event) => event.eventId);
  const route = execution.events.find((event) =>
    event.kind === "traversal_route_admitted" &&
    progressRefs.every((ref) =>
      event.payload.consumedAvailabilityRefs.includes(ref)));
  assert.ok(route);
  assert.deepEqual(
    route.payload.consumedAvailabilityRefs.slice(-expectedDepth),
    progressRefs,
    "route consumes the exact complete progress chain",
  );
  const routeIndex = execution.events.findIndex((event) =>
    event.eventId === route.eventId);
  const finalProgressIndex = execution.events.findIndex((event) =>
    event.eventId === completed.at(-1).eventId);
  assert.equal(routeIndex, finalProgressIndex + 1,
    "route is admitted immediately after the final staged progress row");
  assert.deepEqual(
    route.causationEventRefs.filter((eventRef) =>
      progressEventRefs.includes(eventRef)),
    progressEventRefs.toReversed(),
    "route causation names the exact completion chain outer-to-inner",
  );
  for (const [index, progress] of completed.entries()) {
    assert.equal(progress.causationEventRefs.length, 2);
    assert.equal(
      progress.causationEventRefs[1],
      index === 0
        ? progress.payload.completionWitnessEventRef
        : completed[index - 1].eventId,
    );
  }
  return { completed, route };
}

function assertSuccessfulFhExitFrontiers(execution, completed, route) {
  assert.equal(
    new Set(completed.map((event) =>
      event.payload.completionWitnessEventRef)).size,
    1,
    "all exited retry owners share one exact F_H completion witness",
  );
  const resume = execution.events.find((event) =>
    event.eventId === completed[0].payload.completionWitnessEventRef);
  assert.equal(resume?.kind, "fh_interaction_resume_admitted");
  const opened = execution.events.find((event) =>
    event.kind === "fh_interaction_opened" &&
    event.aggregateId === resume.aggregateId);
  assert.ok(opened);
  const heldCursor = opened.payload.heldCursor;
  const successorBody = {
    programRef: heldCursor.programRef,
    executionBasisRef: heldCursor.executionBasisRef,
    traversalScopeRef: heldCursor.traversalScopeRef,
    runId: heldCursor.runId,
    graphCallId: heldCursor.graphCallId,
    frameId: heldCursor.frameId,
    graphRef: heldCursor.graphRef,
    inputRef: resume.payload.successorInputRef,
    inputDigest: resume.payload.successorInputDigest,
    currentNodeRef: heldCursor.currentNodeRef,
    position: heldCursor.position,
    termPath: heldCursor.termPath,
    taskOrdinal: heldCursor.taskOrdinal,
    attempt: heldCursor.attempt,
    retryPath: heldCursor.retryPath,
  };
  const successorDigest = execution.environment.product.sha256Canonical(
    successorBody,
  );
  const successorCursor = Object.freeze({
    kind: "traversal_cursor",
    schemaVersion: "5.0.0",
    cursorRef:
      `traversal-cursor://abiogenesis/${
        successorDigest.slice("sha256:".length)
      }`,
    cursorDigest: successorDigest,
    ...successorBody,
  });
  const prefix = execution.environment.abg
    .selectValidatedRuntimeEventPrefix(execution.events);
  assert.equal(
    execution.environment.abg.isInteractionResumeCursorSuccessorAtPrefix(
      prefix,
      heldCursor,
      {
        inputRef: resume.payload.successorInputRef,
        inputDigest: resume.payload.successorInputDigest,
      },
      successorCursor,
    ),
    true,
  );
  assert.equal(
    execution.environment.abg.hasAdmittedTraversalCursorAtPrefix(
      prefix,
      successorCursor,
    ),
    true,
  );
  const frontiers = completed.map((progressEvent) => {
    const frontier = execution.environment.abg.projectDeclaredCRetryFrontier(
      prefix,
      execution.graph,
      successorCursor,
      execution.graphFunction,
      progressEvent.payload.completedRetryDepth,
    );
    assert.equal(frontier?.state, "progress_consumed");
    assert.equal(
      frontier.consumed.progress.progressRef,
      progressEvent.payload.progressRef,
    );
    assert.equal(frontier.consumed.progressEventRef, progressEvent.eventId);
    assert.equal(
      frontier.consumed.consumption.kind,
      "progress_consumed_by_exit",
    );
    assert.equal(
      frontier.consumed.consumption.route.admissionEventRef,
      route.eventId,
    );
    return frontier;
  });
  assert.equal(frontiers.length, completed.length);
  return { frontiers, opened, resume, successorCursor };
}

function eventCandidate(event, overrides = {}) {
  const {
    eventId: _eventId,
    admissionOrdinal: _admissionOrdinal,
    payloadDigest: _payloadDigest,
    ...candidate
  } = event;
  return { ...candidate, ...overrides };
}

async function forgeEventAt(execution, targetEventRef, overrides) {
  const eventStoreApi = await import(pathToFileURL(join(
    execution.environment.installedRoot,
    "build/code/src/abg/event_store.js",
  )).href);
  const targetIndex = execution.events.findIndex(
    (event) => event.eventId === targetEventRef,
  );
  assert.notEqual(targetIndex, -1, `target event ${targetEventRef} was absent`);
  const { store: forgedStore } = await cloneEventPrefixFixture(
    execution.context,
    execution.environment.abg,
    eventStoreApi,
    execution.events.slice(0, targetIndex),
    "abi5-t287-forged-event-",
  );
  const target = execution.events[targetIndex];
  const admitted = eventStoreApi.admitRuntimeEvent(
    forgedStore,
    eventCandidate(target, overrides),
  );
  return { forgedStore, admitted };
}

async function forgeValidatedPrefixAt(execution, targetEventRef, overrides) {
  const eventStoreApi = await import(pathToFileURL(join(
    execution.environment.installedRoot,
    "build/code/src/abg/event_store.js",
  )).href);
  const staged = [];
  for (const event of execution.events) {
    const admitted = eventStoreApi.projectRuntimeEventFromValidatedHistory(
      Object.freeze([...staged]),
      eventCandidate(
        event,
        event.eventId === targetEventRef ? overrides : {},
      ),
    );
    staged.push(admitted);
    if (event.eventId === targetEventRef) {
      return {
        admitted,
        prefix: execution.environment.abg.selectValidatedRuntimeEventPrefix(
          Object.freeze([...staged]),
        ),
      };
    }
    assert.equal(admitted.eventId, event.eventId);
  }
  assert.fail(`target event ${targetEventRef} was absent`);
}

function durableEvents(path) {
  const value = readFileSync(path, "utf8").trim();
  return value.length === 0
    ? []
    : value.split(/\r?\n/u).map((line) => JSON.parse(line));
}

function exactFanOutCompletionEvent(execution) {
  const rows = execution.events.filter((event) =>
    event.kind === "fan_out_completion_admitted" &&
    event.payload.completionKind === "complete_vector");
  assert.equal(rows.length, 1, "one exact complete-vector carrier is admitted");
  return rows[0];
}

function exactFanOutProjectionAuthority(execution, completionEvent) {
  const application = execution.graph.template.applications.find((candidate) =>
    candidate.relationKind === "fan_out" &&
    candidate.applicationRef === completionEvent.payload.applicationRef);
  assert.ok(application);
  return {
    graph: execution.graph,
    application,
    basisId: completionEvent.basisId,
    runId: completionEvent.runId,
    graphCallId: completionEvent.graphCallId,
    frameId: completionEvent.frameId,
  };
}

async function exactFanOutProjector(execution) {
  return import(pathToFileURL(join(
    execution.environment.installedRoot,
    "build/code/src/abg/fan_out_projection.js",
  )).href);
}

async function eventStoreApi(execution) {
  return import(pathToFileURL(join(
    execution.environment.installedRoot,
    "build/code/src/abg/event_store.js",
  )).href);
}

async function retryApi(execution) {
  return import(pathToFileURL(join(
    execution.environment.installedRoot,
    "build/code/src/abg/retry.js",
  )).href);
}

function exactDeclaredRetryOwner(
  execution,
  prefix,
  cursor,
  progressEvent,
) {
  return execution.environment.abg.projectDeclaredCRetryFrontier(
    prefix,
    execution.graph,
    cursor,
    execution.graphFunction,
    progressEvent.payload.completedRetryDepth,
  );
}

async function traversalRouteApi(execution) {
  return import(pathToFileURL(join(
    execution.environment.installedRoot,
    "build/code/src/abg/traversal_route.js",
  )).href);
}

function fanOutFinalSourceCursor(
  execution,
  completionEvent,
  events = execution.events,
) {
  const finalRow = completionEvent.payload.taskRows.at(-1);
  assert.ok(finalRow);
  const opened = events.find((event) =>
    event.kind === "c_call_opened" &&
    event.aggregateId === finalRow.cCallRef);
  assert.ok(opened);
  const body = {
    programRef: execution.execution.executionBasis.programRef,
    executionBasisRef: execution.execution.executionBasis.basisRef,
    traversalScopeRef: execution.opened.scope.scopeRef,
    runId: opened.runId,
    graphCallId: opened.graphCallId,
    frameId: opened.frameId,
    graphRef: execution.graph.materializationRef,
    inputRef: finalRow.inputMemberRef,
    inputDigest: finalRow.inputMemberDigest,
    currentNodeRef: FAN_OUT_NODE_REF,
    position: "at_term",
    termPath: [
      "node",
      FAN_OUT_NODE_REF,
      "c",
      "terms",
      "0",
      "term",
      "term",
      "tasks",
      String(finalRow.ordinal),
    ],
    taskOrdinal: finalRow.ordinal,
    attempt: opened.payload.attempt,
    retryPath: opened.payload.retryPath,
  };
  const cursorDigest = execution.environment.product.sha256Canonical(body);
  const cursor = {
    kind: "traversal_cursor",
    schemaVersion: "5.0.0",
    cursorRef:
      `traversal-cursor://abiogenesis/${cursorDigest.slice("sha256:".length)}`,
    cursorDigest,
    ...body,
  };
  assert.equal(cursor.cursorRef, opened.payload.cursorRef);
  assert.equal(cursor.cursorDigest, opened.payload.cursorDigest);
  return { cursor, opened, finalRow };
}

function fanOutContinuationCursor(execution, sourceCursor, completion) {
  const continuation = execution.environment.gtl.deriveCContinuationTarget(
    execution.graph,
    {
      nodeRef: sourceCursor.currentNodeRef,
      termPath: sourceCursor.termPath,
      taskOrdinal: sourceCursor.taskOrdinal,
      attempt: sourceCursor.attempt,
      retryPath: sourceCursor.retryPath,
      inputRef: sourceCursor.inputRef,
      inputDigest: sourceCursor.inputDigest,
    },
    {
      inputRef: completion.outputVectorRef,
      inputDigest: completion.outputVectorDigest,
    },
  );
  assert.equal(continuation.kind, "c_continuation_target",
    JSON.stringify(continuation));
  assert.equal(continuation.disposition, "advance");
  const body = {
    programRef: sourceCursor.programRef,
    executionBasisRef: sourceCursor.executionBasisRef,
    traversalScopeRef: sourceCursor.traversalScopeRef,
    runId: sourceCursor.runId,
    graphCallId: sourceCursor.graphCallId,
    frameId: sourceCursor.frameId,
    graphRef: sourceCursor.graphRef,
    inputRef: continuation.inputRef,
    inputDigest: continuation.inputDigest,
    currentNodeRef: continuation.nodeRef,
    position: "at_term",
    termPath: continuation.termPath,
    taskOrdinal: continuation.taskOrdinal,
    attempt: continuation.attempt,
    retryPath: continuation.retryPath,
  };
  const cursorDigest = execution.environment.product.sha256Canonical(body);
  return {
    kind: "traversal_cursor",
    schemaVersion: "5.0.0",
    cursorRef:
      `traversal-cursor://abiogenesis/${cursorDigest.slice("sha256:".length)}`,
    cursorDigest,
    ...body,
  };
}

function retryAttemptCursorForOpenedCCall(execution, opened) {
  const attempt = execution.events.find((event) =>
    event.kind === "retry_attempt_opened" &&
    event.runId === opened.runId &&
    event.graphCallId === opened.graphCallId &&
    event.frameId === opened.frameId &&
    event.payload.attempt === opened.payload.attempt &&
    execution.environment.product.sha256Canonical(event.payload.retryPath) ===
      execution.environment.product.sha256Canonical(opened.payload.retryPath));
  assert.ok(attempt);
  const cursor = retryAttemptCursorForEvent(execution, attempt);
  assert.equal(cursor.cursorRef, opened.payload.cursorRef);
  assert.equal(cursor.cursorDigest, opened.payload.cursorDigest);
  return cursor;
}

function retryAttemptCursorForEvent(execution, attempt) {
  const entered = execution.events.find((event) =>
    event.kind === "traversal_cursor_entered" &&
    event.runId === attempt.runId &&
    event.graphCallId === attempt.graphCallId &&
    event.frameId === attempt.frameId);
  assert.ok(entered);
  const body = {
    programRef: entered.payload.programRef,
    executionBasisRef: entered.payload.executionBasisRef,
    traversalScopeRef: entered.payload.traversalScopeRef,
    runId: attempt.runId,
    graphCallId: attempt.graphCallId,
    frameId: attempt.frameId,
    graphRef: entered.payload.materializationRef,
    inputRef: attempt.payload.inputRef,
    inputDigest: attempt.payload.inputDigest,
    currentNodeRef: attempt.payload.wrappedTermPath[1],
    position: "at_term",
    termPath: attempt.payload.wrappedTermPath,
    taskOrdinal: attempt.payload.taskOrdinal,
    attempt: attempt.payload.attempt,
    retryPath: attempt.payload.retryPath,
  };
  const cursorDigest = execution.environment.product.sha256Canonical(body);
  const cursor = {
    kind: "traversal_cursor",
    schemaVersion: "5.0.0",
    cursorRef:
      `traversal-cursor://abiogenesis/${cursorDigest.slice("sha256:".length)}`,
    cursorDigest,
    ...body,
  };
  return cursor;
}

function workflowCCallValue(execution, opened, fibre, sourceCursor) {
  const basis = execution.execution.executionBasis;
  const declaredTerm = execution.environment.gtl.resolveCProgramTermAtSourcePath(
    execution.graph.template,
    sourceCursor.currentNodeRef,
    sourceCursor.termPath,
  );
  assert.equal(declaredTerm.kind, "c_workflow");
  return {
    kind: "c_call",
    schemaVersion: "5.0.0",
    cCallRef: opened.payload.cCallRef,
    cCallDigest: opened.payload.cCallDigest,
    callClass: "workflow",
    basisId: basis.basisRef,
    runId: opened.runId,
    graphFunctionRef: basis.graphFunctionRef,
    graphCallId: opened.graphCallId,
    frameId: opened.frameId,
    edgeRef: basis.entryRef,
    vectorIndex: opened.payload.vectorIndex,
    stageRole: "workflow",
    batchRef: opened.payload.batchRef,
    taskOrdinal: opened.payload.taskOrdinal,
    attempt: opened.payload.attempt,
    programLocusRef: opened.payload.programLocusRef,
    retryPath: opened.payload.retryPath,
    regime: "F_D",
    armId: "arm://abiogenesis/workflow.C@5",
    compositionRef: null,
    implementationSetRef: basis.rootImplementationSetRef,
    implementationRequirementKey: null,
    implementationBindingRef: null,
    implementationRef: null,
    interactionSetRef: basis.rootInteractionSetRef,
    interactionRequirementKey: null,
    interactionKind: null,
    actorCapabilityRef: null,
    responseContractRef: null,
    continuationContractRef: null,
    childGraphFunctionRef: opened.payload.childGraphFunctionRef,
    inputContractRef: declaredTerm.inputCarrierRef,
    outputContractRef: declaredTerm.outputCarrierRef,
    failureContractRef: opened.payload.failureContractRef,
    refusalContractRef: basis.refusalContractRef,
    refusalValueKind: basis.refusalValueKind,
    evidenceContractRef: basis.evidenceContractRef,
    judgmentContractRef: basis.judgmentContractRef,
    rejectionContractRef: basis.rejectionContractRef,
    transitionContractRef: basis.transitionContractRef,
    closureContractRef: basis.closureContractRef,
    closureContractDigest: basis.closureContractDigest,
    judgmentPredicateRef:
      execution.graphFunction.declarations["abg.judgment_predicate"],
    terminalPredicateRef: basis.terminalPredicateRef,
    replayProjectionRef: basis.replayProjectionRef,
    terminalKind: basis.terminalKind,
    openedEventRef: opened.eventId,
    fibreSelectedEventRef: fibre.eventId,
  };
}

function leafCCallValue(execution, opened, fibre) {
  const basis = execution.execution.executionBasis;
  const locus = execution.environment.gtl.resolveCProgramLocus(
    execution.graph.template,
    opened.payload.programLocusRef,
  );
  assert.equal(locus.kind, "c_program_locus", JSON.stringify(locus));
  assert.equal(locus.leaf.kind, "c_of");
  const leaf = locus.leaf;
  assert.equal(leaf.requirement.kind, "executable_leaf_requirement");
  return {
    kind: "c_call",
    schemaVersion: "5.0.0",
    cCallRef: opened.payload.cCallRef,
    cCallDigest: opened.payload.cCallDigest,
    callClass: "leaf",
    basisId: basis.basisRef,
    runId: opened.runId,
    graphFunctionRef: execution.graph.graphFunctionRef,
    graphCallId: opened.graphCallId,
    frameId: opened.frameId,
    edgeRef: basis.entryRef,
    vectorIndex: leaf.vectorIndex,
    stageRole: leaf.stageRole,
    batchRef: opened.payload.batchRef,
    taskOrdinal: opened.payload.taskOrdinal,
    attempt: opened.payload.attempt,
    programLocusRef: leaf.programLocusRef,
    retryPath: opened.payload.retryPath,
    regime: leaf.fibre,
    armId: leaf.armId,
    compositionRef: leaf.compositionRef,
    implementationSetRef: fibre.payload.implementationSetRef,
    implementationRequirementKey:
      fibre.payload.implementationRequirementKey,
    implementationBindingRef: fibre.payload.implementationBindingRef,
    implementationRef: fibre.payload.implementationRef,
    interactionSetRef: basis.interactionSetRef,
    interactionRequirementKey: null,
    interactionKind: null,
    actorCapabilityRef: null,
    responseContractRef: null,
    continuationContractRef: null,
    childGraphFunctionRef: null,
    inputContractRef: leaf.requirement.inputContractRef,
    outputContractRef: leaf.requirement.outputContractRef,
    failureContractRef: leaf.requirement.failureContractRef,
    refusalContractRef: leaf.requirement.refusalContractRef,
    refusalValueKind: basis.refusalValueKind,
    evidenceContractRef: leaf.requirement.evidenceContractRef,
    judgmentContractRef: leaf.requirement.judgmentContractRef,
    rejectionContractRef: leaf.requirement.refusalContractRef,
    transitionContractRef: basis.transitionContractRef,
    closureContractRef: basis.closureContractRef,
    closureContractDigest: basis.closureContractDigest,
    judgmentPredicateRef: leaf.judgmentPredicateRef,
    terminalPredicateRef: basis.terminalPredicateRef,
    replayProjectionRef: basis.replayProjectionRef,
    terminalKind: basis.terminalKind,
    openedEventRef: opened.eventId,
    fibreSelectedEventRef: fibre.eventId,
  };
}

async function admittedFinalFanOutOutcome(
  execution,
  store,
  completionEvent,
) {
  const api = await eventStoreApi(execution);
  const { cursor: sourceCursor, opened, finalRow } =
    fanOutFinalSourceCursor(execution, completionEvent, store.readAll());
  const fibre = store.readAll().find((event) =>
    event.kind === "c_call_fibre_selected" &&
    event.aggregateId === opened.aggregateId);
  assert.ok(fibre);
  const { store: carrierStore } = await cloneEventPrefixFixture(
    execution.context,
    execution.environment.abg,
    api,
    store.readAll().slice(0, fibre.admissionOrdinal),
    "abi5-t287-fan-out-carrier-",
  );
  const cCall = execution.environment.abg.rehydrateWorkflowCCall(
    carrierStore,
    execution.execution.executionBasis,
    execution.execution.implementationSet,
    execution.opened.scope,
    execution.graphFunction,
    execution.graph,
    sourceCursor,
    workflowCCallValue(execution, opened, fibre, sourceCursor),
  );
  assert.ok(cCall, "the exact workflow CCall carrier rehydrates from its open fibre");
  const { projectOpenedCCallCarrierAtPrefix } = await import(pathToFileURL(join(
    execution.environment.installedRoot,
    "build/code/src/abg/c_call.js",
  )).href);
  const projectedOpenedWorkflow = projectOpenedCCallCarrierAtPrefix(
    execution.environment.abg.selectValidatedRuntimeEventPrefix(
      carrierStore.readAll(),
    ),
    execution.graph,
    opened.aggregateId,
    sourceCursor,
    execution.graphFunction,
  );
  assert.deepEqual(
    projectedOpenedWorkflow,
    cCall,
    "fresh history reconstructs the exact opened workflow CCall before result or judgment",
  );
  const resultEvent = store.readAll().find((event) =>
    event.kind === "c_call_result_admitted" &&
    event.payload.resultRef === finalRow.resultRef);
  const judgmentEvent = store.readAll().find((event) =>
    event.kind === "c_call_judged" &&
    event.payload.judgmentRef === finalRow.judgmentRef);
  assert.ok(resultEvent);
  assert.ok(judgmentEvent);
  const result = {
    ...resultEvent.payload,
    kind: "admitted_c_call_result",
    schemaVersion: "5.0.0",
    disposition: "admitted",
    admissionEventRef: resultEvent.eventId,
  };
  const judgment = {
    ...judgmentEvent.payload,
    kind: "admitted_c_call_judgment",
    schemaVersion: "5.0.0",
    disposition: "admitted",
    admissionEventRef: judgmentEvent.eventId,
  };
  return { cCall, result, judgment, sourceCursor };
}

function replaceMappedJson(value, eventRefMap, valueRefMap) {
  if (typeof value === "string") {
    return eventRefMap.get(value) ?? valueRefMap.get(value) ?? value;
  }
  if (Array.isArray(value)) {
    return value.map((member) =>
      replaceMappedJson(member, eventRefMap, valueRefMap));
  }
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(Object.entries(value).map(([key, member]) => [
      key,
      replaceMappedJson(member, eventRefMap, valueRefMap),
    ]));
  }
  return value;
}

function rehashMappedPayload(
  execution,
  originalPayload,
  payload,
  valueRefMap,
  refKey,
  digestKey,
  refPrefix,
) {
  const body = structuredClone(payload);
  delete body[refKey];
  delete body[digestKey];
  const digest = execution.environment.product.sha256Canonical(body);
  const ref = `${refPrefix}${digest.slice("sha256:".length)}`;
  valueRefMap.set(originalPayload[refKey], ref);
  valueRefMap.set(originalPayload[digestKey], digest);
  return { [refKey]: ref, [digestKey]: digest, ...body };
}

function rehashFanOutCompletionPayload(
  execution,
  originalPayload,
  mappedPayload,
  valueRefMap,
) {
  const taskRows = mappedPayload.taskRows.map((row) => {
    const outputMemberDigest = execution.environment.product.sha256Canonical({
      applicationInputMemberRef: row.inputMemberRef,
      ordinal: row.ordinal,
      resultRef: row.resultRef,
      resultDigest: row.resultDigest,
      value: row.value,
    });
    return {
      ...row,
      outputMemberRef:
        `fan-out-output-member://abiogenesis/${
          outputMemberDigest.slice("sha256:".length)
        }`,
      outputMemberDigest,
    };
  });
  const outputVector = {
    kind: "gtl_fan_out_vector",
    schemaVersion: "5.0.0",
    applicationRef: mappedPayload.applicationRef,
    members: taskRows.map((row) => ({
      ordinal: row.ordinal,
      inputMemberRef: row.inputMemberRef,
      outputMemberRef: row.outputMemberRef,
      value: row.value,
    })),
  };
  const outputVectorDigest = execution.environment.product.sha256Canonical(
    outputVector,
  );
  const body = {
    ...mappedPayload,
    taskRows,
    outputVectorRef:
      `graph-vector-value://abiogenesis/${
        outputVectorDigest.slice("sha256:".length)
      }`,
    outputVectorDigest,
    outputVector,
  };
  delete body.completionRef;
  delete body.completionDigest;
  const completionDigest = execution.environment.product.sha256Canonical(body);
  const completionRef =
    `fan-out-completion://abiogenesis/${
      completionDigest.slice("sha256:".length)
    }`;
  valueRefMap.set(originalPayload.completionRef, completionRef);
  valueRefMap.set(originalPayload.completionDigest, completionDigest);
  return { completionRef, completionDigest, ...body };
}

async function forgeAlienFanOutProgramLocus(execution, completionEvent) {
  const api = await eventStoreApi(execution);
  const firstRow = completionEvent.payload.taskRows[0];
  const targetOpened = execution.events.find((event) =>
    event.kind === "c_call_opened" &&
    event.aggregateId === firstRow.cCallRef);
  assert.ok(targetOpened);
  const alienProgramLocusRef =
    `workflow-locus://abiogenesis/${"f".repeat(64)}`;
  assert.notEqual(alienProgramLocusRef,
    targetOpened.payload.programLocusRef);
  const acquired = await cloneEventPrefixFixture(
    execution.context,
    execution.environment.abg,
    api,
    execution.events.slice(0, targetOpened.admissionOrdinal - 1),
    "abi5-t287-alien-fan-out-locus-",
  );
  const forgedStore = acquired.store;
  const durablePath = fileURLToPath(acquired.prefix.eventLogRef);
  const eventRefMap = new Map();
  const valueRefMap = new Map();
  let forgedCompletionEvent;
  for (const original of execution.events.slice(
    targetOpened.admissionOrdinal - 1,
    completionEvent.admissionOrdinal,
  )) {
    let payload = replaceMappedJson(
      original.payload,
      eventRefMap,
      valueRefMap,
    );
    if (original.eventId === targetOpened.eventId) {
      payload.programLocusRef = alienProgramLocusRef;
      const cCallIdentity = {
        basisId: payload.basisId,
        graphCallId: payload.graphCallId,
        frameId: payload.frameId,
        vectorIndex: payload.vectorIndex,
        stageRole: payload.stageRole,
        taskOrdinal: payload.taskOrdinal,
        attempt: payload.attempt,
        programLocusRef: payload.programLocusRef,
        retryPath: payload.retryPath,
        childGraphFunctionRef: payload.childGraphFunctionRef,
        failureContractRef: payload.failureContractRef,
      };
      const cCallDigest = execution.environment.product.sha256Canonical(
        cCallIdentity,
      );
      const cCallRef = `c-call:${cCallDigest}`;
      valueRefMap.set(original.payload.cCallRef, cCallRef);
      valueRefMap.set(original.payload.cCallDigest, cCallDigest);
      payload.cCallRef = cCallRef;
      payload.cCallDigest = cCallDigest;
    } else if (original.kind === "child_foldback_admitted") {
      payload = rehashMappedPayload(
        execution,
        original.payload,
        payload,
        valueRefMap,
        "foldbackRef",
        "foldbackDigest",
        "child-foldback://abiogenesis/",
      );
    } else if (original.kind === "c_call_evidenced") {
      payload = rehashMappedPayload(
        execution,
        original.payload,
        payload,
        valueRefMap,
        "evidenceRef",
        "evidenceDigest",
        "evidence://abiogenesis/",
      );
    } else if (original.kind === "c_call_result_admitted") {
      payload = rehashMappedPayload(
        execution,
        original.payload,
        payload,
        valueRefMap,
        "resultRef",
        "resultDigest",
        "result://abiogenesis/",
      );
    } else if (original.kind === "c_call_judged") {
      payload = rehashMappedPayload(
        execution,
        original.payload,
        payload,
        valueRefMap,
        "judgmentRef",
        "judgmentDigest",
        "judgment://abiogenesis/",
      );
    } else if (original.kind === "traversal_route_admitted") {
      payload = rehashMappedPayload(
        execution,
        original.payload,
        payload,
        valueRefMap,
        "routeRef",
        "routeDigest",
        "traversal-route://abiogenesis/",
      );
    } else if (original.kind === "fan_out_completion_admitted") {
      payload = rehashFanOutCompletionPayload(
        execution,
        original.payload,
        payload,
        valueRefMap,
      );
    }
    const admitted = api.admitRuntimeEvent(forgedStore, eventCandidate(
      original,
      {
        aggregateId:
          valueRefMap.get(original.aggregateId) ?? original.aggregateId,
        parentAggregateId:
          valueRefMap.get(original.parentAggregateId) ??
          original.parentAggregateId,
        causationEventRefs: original.causationEventRefs.map((eventRef) =>
          eventRefMap.get(eventRef) ?? eventRef),
        payload,
      },
    ));
    eventRefMap.set(original.eventId, admitted.eventId);
    if (original.eventId === completionEvent.eventId) {
      forgedCompletionEvent = admitted;
    }
  }
  assert.ok(forgedCompletionEvent);
  return {
    alienProgramLocusRef,
    durablePath,
    forgedCompletionEvent,
    forgedStore,
  };
}

test("T-287 TV5 declared retry boundary identity is stable across structural descent and distinct across sibling loci", async (context) => {
  const environment = await setupInstalledRootCatalog(context, root);
  const { gtl, product } = environment;
  const fixture = retryFanOutPublication(gtl, environment.publication);
  const graphFunction = fixture.publication.graphFunctions.find((candidate) =>
    candidate.name === fixture.graphFunctionRef);
  assert.ok(graphFunction);
  const materializationBasis = {
    invocationAdmissionRef:
      "invocation-admission://t287/tv5/retry-boundary-coordinate",
    admittedInputRef:
      "raw-admission://t287/tv5/retry-boundary-coordinate",
    admittedInputDigest: product.sha256Canonical(fixture.input),
    admittedInput: fixture.input,
  };
  const graph = gtl.materializeGraph(graphFunction, materializationBasis);
  const retryModule = await import(`${pathToFileURL(join(
    environment.installedRoot,
    "build/code/src/abg/retry.js",
  )).href}?retry-boundary-coordinate=${Date.now()}`);
  const cursorFor = ({
    declaredGraph,
    nodeRef,
    termPath,
    taskOrdinal,
    retryPath,
  }) => {
    const body = {
      programRef: "program://t287/tv5/retry-boundary-coordinate@5",
      executionBasisRef:
        "execution-basis://t287/tv5/retry-boundary-coordinate",
      traversalScopeRef:
        "traversal-scope://t287/tv5/retry-boundary-coordinate",
      runId: "run://t287/tv5/retry-boundary-coordinate",
      graphCallId: "graph-call://t287/tv5/retry-boundary-coordinate",
      frameId: "frame://t287/tv5/retry-boundary-coordinate",
      graphRef: declaredGraph.materializationRef,
      inputRef: "input://t287/tv5/retry-boundary-coordinate",
      inputDigest: product.sha256Canonical({
        kind: "retry_boundary_coordinate_input",
        schemaVersion: "5.0.0",
      }),
      currentNodeRef: nodeRef,
      position: "at_term",
      termPath,
      taskOrdinal,
      attempt: retryPath.at(-1),
      retryPath,
    };
    const cursorDigest = product.sha256Canonical(body);
    return {
      kind: "traversal_cursor",
      schemaVersion: "5.0.0",
      cursorRef:
        `traversal-cursor://abiogenesis/${
          cursorDigest.slice("sha256:".length)
        }`,
      cursorDigest,
      ...body,
    };
  };
  const nodeRef = graph.template.startNodeRef;
  const nestedAttemptPath = [
    "node", nodeRef, "c", "terms", "0", "term", "term",
  ];
  const nestedAttemptCursor = cursorFor({
    declaredGraph: graph,
    nodeRef,
    termPath: nestedAttemptPath,
    taskOrdinal: null,
    retryPath: [1, 1],
  });
  const nestedDescendantCursor = cursorFor({
    declaredGraph: graph,
    nodeRef,
    termPath: [...nestedAttemptPath, "tasks", "0"],
    taskOrdinal: 0,
    retryPath: [1, 1],
  });
  const nestedAttemptCoordinates =
    retryModule.projectDeclaredRetryAttemptCoordinates(
      graph,
      nestedAttemptCursor,
    );
  const nestedDescendantCoordinates =
    retryModule.projectDeclaredRetryAttemptCoordinates(
      graph,
      nestedDescendantCursor,
    );
  assert.ok(nestedAttemptCoordinates);
  assert.ok(nestedDescendantCoordinates);
  assert.equal(
    nestedDescendantCoordinates.retryBoundaryRef,
    nestedAttemptCoordinates.retryBoundaryRef,
    "one declared retry boundary retains one identity from attempt cursor through its exact C.batch descendant",
  );
  assert.equal(nestedAttemptCoordinates.taskOrdinal, null);
  assert.equal(nestedDescendantCoordinates.taskOrdinal, null);

  const sourceRoot = graphFunction.template.nodes[0]?.term;
  assert.equal(sourceRoot?.kind, "c_compose");
  const sourceBatch = sourceRoot.terms[0]?.term?.term;
  assert.equal(sourceBatch?.kind, "c_batch");
  const sourceTask = sourceBatch.tasks[0];
  assert.ok(sourceTask);
  const siblingRetryTerm = gtl.C.batch([
    gtl.C.retry(gtl.C.batch(
      [sourceTask],
      "batch://t287/tv5/retry-boundary/inner-0",
    ), 2),
    gtl.C.retry(gtl.C.batch(
      [sourceTask],
      "batch://t287/tv5/retry-boundary/inner-1",
    ), 2),
  ], "batch://t287/tv5/retry-boundary/siblings");
  const siblingGraphFunction = Object.freeze({
    ...graphFunction,
    name: "graph-function://t287/tv5/retry-boundary-siblings@5",
    template: {
      ...graphFunction.template,
      graphRef: "graph-template://t287/tv5/retry-boundary-siblings@5",
      nodes: [{
        nodeRef,
        nodeKind: "c_locus",
        term: siblingRetryTerm,
      }],
      applications: [],
    },
  });
  const siblingGraph = gtl.materializeGraph(
    siblingGraphFunction,
    materializationBasis,
  );
  const siblingAttemptPath = (ordinal) => [
    "node", nodeRef, "c", "tasks", String(ordinal), "term",
  ];
  const siblingCoordinates = [0, 1].map((ordinal) => {
    const attemptCursor = cursorFor({
      declaredGraph: siblingGraph,
      nodeRef,
      termPath: siblingAttemptPath(ordinal),
      taskOrdinal: ordinal,
      retryPath: [1],
    });
    const descendantCursor = cursorFor({
      declaredGraph: siblingGraph,
      nodeRef,
      termPath: [...siblingAttemptPath(ordinal), "tasks", "0"],
      taskOrdinal: 0,
      retryPath: [1],
    });
    const attemptCoordinates =
      retryModule.projectDeclaredRetryAttemptCoordinates(
        siblingGraph,
        attemptCursor,
      );
    const descendantCoordinates =
      retryModule.projectDeclaredRetryAttemptCoordinates(
        siblingGraph,
        descendantCursor,
      );
    assert.ok(attemptCoordinates);
    assert.ok(descendantCoordinates);
    assert.equal(attemptCoordinates.taskOrdinal, ordinal);
    assert.equal(descendantCoordinates.taskOrdinal, ordinal);
    assert.equal(
      descendantCoordinates.retryBoundaryRef,
      attemptCoordinates.retryBoundaryRef,
      "a retry declared inside C.batch retains its declaration-context task ordinal through deeper descent",
    );
    return attemptCoordinates;
  });
  assert.notEqual(
    siblingCoordinates[0].retryBoundaryRef,
    siblingCoordinates[1].retryBoundaryRef,
    "distinct declared sibling retry loci retain distinct owner identities",
  );
});

test("T-287 R6 retry-wrapped workflow success exits retry depth atomically", async (context) => {
  const execution = await executeTestGraph(
    context,
    retryWorkflowPublication,
  );
  const opened = execution.events.find((event) =>
    event.kind === "c_call_opened" && event.payload.callClass === "workflow");
  const fibre = execution.events.find((event) =>
    event.kind === "c_call_fibre_selected" &&
    event.aggregateId === opened?.aggregateId);
  assert.ok(opened);
  assert.ok(fibre);
  const sourceCursor = retryAttemptCursorForOpenedCCall(execution, opened);
  const { projectOpenedCCallCarrierAtPrefix } = await import(pathToFileURL(join(
    execution.environment.installedRoot,
    "build/code/src/abg/c_call.js",
  )).href);
  const openedPrefix = execution.environment.abg.selectValidatedRuntimeEventPrefix(
    Object.freeze(execution.events.slice(0, fibre.admissionOrdinal)),
  );
  assert.deepEqual(
    projectOpenedCCallCarrierAtPrefix(
      openedPrefix,
      execution.graph,
      opened.aggregateId,
      sourceCursor,
      execution.graphFunction,
    ),
    workflowCCallValue(execution, opened, fibre, sourceCursor),
    "fresh history reconstructs the exact workflow CCall before result or judgment",
  );
  const eventStoreProjectorApi = await eventStoreApi(execution);
  const eventRefMap = new Map();
  const valueRefMap = new Map();
  const restampedEvents = [];
  const forgedPredicateRef =
    "predicate://abiogenesis/falsifier/alien-workflow-judgment@5";
  assert.notEqual(
    forgedPredicateRef,
    execution.graphFunction.declarations["abg.judgment_predicate"],
  );
  let restampedOpened = null;
  let restampedFibre = null;
  for (const original of execution.events.slice(0, fibre.admissionOrdinal)) {
    const mappedPayload = replaceMappedJson(
      original.payload,
      eventRefMap,
      valueRefMap,
    );
    const payload = original.eventId === opened.eventId
      ? { ...mappedPayload, judgmentPredicateRef: forgedPredicateRef }
      : mappedPayload;
    const admitted = eventStoreProjectorApi.projectRuntimeEventFromValidatedHistory(
      Object.freeze([...restampedEvents]),
      eventCandidate(original, {
        causationEventRefs: original.causationEventRefs.map((eventRef) =>
          eventRefMap.get(eventRef) ?? eventRef),
        payload,
      }),
    );
    restampedEvents.push(admitted);
    eventRefMap.set(original.eventId, admitted.eventId);
    if (original.eventId === opened.eventId) restampedOpened = admitted;
    if (original.eventId === fibre.eventId) restampedFibre = admitted;
  }
  assert.ok(restampedOpened);
  assert.ok(restampedFibre);
  assert.deepEqual(restampedOpened.payload, {
    ...opened.payload,
    judgmentPredicateRef: forgedPredicateRef,
  }, "the reconstructed open changes only the workflow judgment predicate");
  assert.notEqual(restampedOpened.payloadDigest, opened.payloadDigest);
  assert.notEqual(restampedOpened.eventId, opened.eventId);
  assert.deepEqual(restampedFibre.payload, fibre.payload);
  assert.notEqual(restampedFibre.eventId, fibre.eventId);
  assert.deepEqual(
    restampedFibre.causationEventRefs,
    [restampedOpened.eventId],
    "the dependent fibre is restamped against the reconstructed open",
  );
  const restampedPrefix =
    execution.environment.abg.selectValidatedRuntimeEventPrefix(
      Object.freeze([...restampedEvents]),
    );
  assert.equal(
    projectOpenedCCallCarrierAtPrefix(
      restampedPrefix,
      execution.graph,
      opened.aggregateId,
      sourceCursor,
      execution.graphFunction,
    ),
    null,
    "a schema-valid reconstructed history fails when its workflow event predicate differs from the exact admitted GTL GraphFunction meaning",
  );
  assertAtomicSuccessfulRetryExit(execution);
});

test("T-287 R6 owner-admitted flat recursion attempt two reconstructs its leaf CCall", async (context) => {
  const execution = await executeTestGraph(
    context,
    flatRecursiveLeafPublication,
  );
  const opened = execution.events.find((event) =>
    event.kind === "c_call_opened" &&
    event.graphFunctionRef === execution.fixture.graphFunctionRef &&
    event.payload.callClass === "leaf" &&
    event.payload.attempt === 2 &&
    event.payload.retryPath.length === 0);
  const fibre = execution.events.find((event) =>
    event.kind === "c_call_fibre_selected" &&
    event.aggregateId === opened?.aggregateId);
  assert.ok(opened);
  assert.ok(fibre);
  const route = execution.events.find((event) =>
    event.kind === "traversal_route_admitted" &&
    event.payload.routeKind === "advance" &&
    event.payload.targetCursorRef === opened.payload.cursorRef &&
    event.payload.targetCursorDigest === opened.payload.cursorDigest);
  assert.ok(route);
  const foldback = execution.events.find((event) =>
    event.kind === "child_foldback_admitted" &&
    route.payload.consumedAvailabilityRefs.includes(
      event.payload.foldbackRef,
    ));
  assert.ok(foldback);
  assert.equal(opened.causationEventRefs[0], route.eventId);
  const openedPrefix = execution.environment.abg.selectValidatedRuntimeEventPrefix(
    Object.freeze(execution.events.slice(0, fibre.admissionOrdinal)),
  );
  const { projectOpenedCCallCarrierAtPrefix } = await import(pathToFileURL(join(
    execution.environment.installedRoot,
    "build/code/src/abg/c_call.js",
  )).href);
  assert.deepEqual(
    projectOpenedCCallCarrierAtPrefix(
      openedPrefix,
      execution.graph,
      opened.aggregateId,
    ),
    leafCCallValue(execution, opened, fibre),
    "fresh history reconstructs the recursion owner's admitted attempt-two leaf CCall",
  );
});

test("T-287 R6 retry-wrapped deferred application success exits retry depth atomically", async (context) => {
  const execution = await executeTestGraph(
    context,
    retryDeferredApplicationPublication,
  );
  assertAtomicSuccessfulRetryExit(execution);
});

test("T-287 R6 nested retry fan-out complete vector exits both depths with its exact final outcome", async (context) => {
  const execution = await executeTestGraph(context, retryFanOutPublication);
  const fanOutIds = execution.environment.gtl.FAN_OUT_HELLO_IDS;
  const leafPort = execution.traversalExecutionInput.leafPort;
  assert.equal(leafPort.validateContractValueByRef(
    fanOutIds.inputVectorRef,
    execution.fixture.input,
  ), true, "the install-bound Product validator admits the exact vector input");
  assert.equal(leafPort.validateContractValueByRef(
    fanOutIds.inputMemberContractRef,
    execution.fixture.input.members[0].value,
  ), true, "the install-bound Product validator admits the exact member input");
  const malformedVector = structuredClone(execution.fixture.input);
  malformedVector.members[1].ordinal = 0;
  assert.equal(leafPort.validateContractValueByRef(
    fanOutIds.inputVectorRef,
    malformedVector,
  ), false, "the vector validator refuses duplicate ordinal structure");
  const malformedMember = {
    ...structuredClone(execution.fixture.input.members[0].value),
    undeclared: true,
  };
  assert.equal(leafPort.validateContractValueByRef(
    fanOutIds.inputMemberContractRef,
    malformedMember,
  ), false, "the member validator refuses undeclared shape");
  const { completed } = assertNestedSuccessfulRetryExit(
    execution,
    "fan_out_success",
  );
  const witness = execution.events.find((event) =>
    event.eventId === completed[0].payload.completionWitnessEventRef);
  assert.equal(witness?.kind, "fan_out_completion_admitted");
  assert.equal(witness.payload.completionKind, "complete_vector");
  const finalRow = witness.payload.taskRows.at(-1);
  assert.deepEqual(
    completed.map((event) => [
      event.payload.cCallRef,
      event.payload.resultRef,
      event.payload.judgmentRef,
    ]),
    completed.map(() => [
      finalRow.cCallRef,
      finalRow.resultRef,
      finalRow.judgmentRef,
    ]),
    "every exited depth retains the exact final fan-out CCall outcome",
  );
  const { cursor: finalTaskCursor } = fanOutFinalSourceCursor(
    execution,
    witness,
  );
  const reducerCursor = fanOutContinuationCursor(
    execution,
    finalTaskCursor,
    witness.payload,
  );
  assert.equal(reducerCursor.attempt, 1);
  assert.deepEqual(reducerCursor.retryPath, []);
  const reducerOpened = execution.events.find((event) =>
    event.kind === "c_call_opened" &&
    event.payload.callClass === "workflow" &&
    event.payload.cursorRef === reducerCursor.cursorRef &&
    event.payload.cursorDigest === reducerCursor.cursorDigest);
  const reducerFibre = execution.events.find((event) =>
    event.kind === "c_call_fibre_selected" &&
    event.aggregateId === reducerOpened?.aggregateId);
  assert.ok(reducerOpened);
  assert.ok(reducerFibre);
  const reducerPrefix = execution.environment.abg
    .selectValidatedRuntimeEventPrefix(Object.freeze(
      execution.events.slice(0, reducerFibre.admissionOrdinal),
    ));
  assert.equal(
    execution.environment.abg.hasAdmittedTraversalCursorAtPrefix(
      reducerPrefix,
      reducerCursor,
    ),
    true,
  );
  const { projectOpenedCCallCarrierAtPrefix } = await import(pathToFileURL(join(
    execution.environment.installedRoot,
    "build/code/src/abg/c_call.js",
  )).href);
  assert.deepEqual(
    projectOpenedCCallCarrierAtPrefix(
      reducerPrefix,
      execution.graph,
      reducerOpened.aggregateId,
      reducerCursor,
      execution.graphFunction,
    ),
    workflowCCallValue(
      execution,
      reducerOpened,
      reducerFibre,
      reducerCursor,
    ),
    "fresh history reconstructs the existing flat reducer workflow CCall",
  );
});

test("T-287 R6 successful nested fan-out reopens with byte-identical history and projections", async (context) => {
  let durablePath;
  const execution = await executeTestGraph(
    context,
    retryFanOutPublication,
    {
      prepareStore({ environment }) {
        durablePath = fileURLToPath(environment.durablePrefix.eventLogRef);
      },
    },
  );
  const { route } = assertNestedSuccessfulRetryExit(
    execution,
    "fan_out_success",
  );
  const completionEvent = exactFanOutCompletionEvent(execution);
  const { cursor: sourceCursor } = fanOutFinalSourceCursor(
    execution,
    completionEvent,
  );
  const authority = exactFanOutProjectionAuthority(execution, completionEvent);
  const projector = await exactFanOutProjector(execution);
  const beforeEvents = execution.environment.store.readAll();
  const beforePrefix = execution.environment.abg
    .selectValidatedRuntimeEventPrefix(beforeEvents);
  const beforeCompletion = projector.projectExactFanOutCompletion(
    beforePrefix,
    {
      mode: "graph_bound",
      admissionEventRef: completionEvent.eventId,
      authority,
    },
  );
  assert.equal(beforeCompletion?.completionRef,
    completionEvent.payload.completionRef);
  const progressEvents = execution.events.filter((event) =>
    event.kind === "retry_progress_recorded" &&
    event.payload.progressClass === "completed" &&
    event.payload.completionClass === "fan_out_success");
  const beforeOwners = progressEvents.map((event) => {
    const owner = exactDeclaredRetryOwner(
      execution,
      beforePrefix,
      sourceCursor,
      event,
    );
    assert.equal(owner?.state, "progress_consumed");
    assert.equal(owner.consumed.progressEventRef, event.eventId);
    assert.equal(owner.consumed.progress.progressRef,
      event.payload.progressRef);
    assert.equal(owner.consumed.consumption.kind,
      "progress_consumed_by_exit");
    assert.equal(owner.consumed.consumption.route.admissionEventRef,
      route.eventId);
    return owner;
  });
  const beforeProgress = beforeOwners.map((owner) => owner.consumed.progress);
  const exactBytes = readFileSync(durablePath, "utf8");
  const handoff = execution.environment.store
    .projectReopenAuthorityAndClose();
  const reopened = execution.environment.abg.reopenEventStore(
    handoff.reopenAuthority,
  );
  assert.equal(reopened.kind, "reopened_event_store_context",
    JSON.stringify(reopened));
  assert.equal(readFileSync(durablePath, "utf8"), exactBytes,
    "close and reopen do not rewrite one history byte");
  assert.deepEqual(reopened.store.readAll(), beforeEvents,
    "durable reopen reconstructs the exact event prefix");
  const reopenedPrefix = execution.environment.abg
    .selectValidatedRuntimeEventPrefix(reopened.store.readAll());
  const reopenedCompletion = projector.projectExactFanOutCompletion(
    reopenedPrefix,
    {
      mode: "graph_bound",
      admissionEventRef: completionEvent.eventId,
      authority,
    },
  );
  assert.deepEqual(reopenedCompletion, beforeCompletion,
    "graph-bound completion projection is identical after reopen");
  const reopenedOwners = progressEvents.map((event) =>
    exactDeclaredRetryOwner(
      execution,
      reopenedPrefix,
      sourceCursor,
      event,
    ));
  assert.deepEqual(
    reopenedOwners,
    beforeOwners,
    "declared retry owner frontiers are identical after reopen",
  );
  assert.deepEqual(
    reopenedOwners.map((owner) => owner.consumed.progress),
    beforeProgress,
    "matching historical retry rows are identical after reopen",
  );
  reopened.store.closeDurableLog();
});

test("T-287 R6 stale fan-out carrier is refused by the effectful retry owner with zero durable suffix", async (context) => {
  const execution = await executeTestGraph(context, retryFanOutPublication);
  assertNestedSuccessfulRetryExit(execution, "fan_out_success");
  const completionEvent = exactFanOutCompletionEvent(execution);
  const projector = await exactFanOutProjector(execution);
  const fullPrefix = execution.environment.abg
    .selectValidatedRuntimeEventPrefix(execution.events);
  const laterCompletion = projector.projectExactFanOutCompletion(fullPrefix, {
    mode: "graph_bound",
    admissionEventRef: completionEvent.eventId,
    authority: exactFanOutProjectionAuthority(execution, completionEvent),
  });
  assert.equal(laterCompletion?.kind, "fan_out_completion_admission");
  const api = await eventStoreApi(execution);
  const staleEvents = execution.events.slice(
    0,
    completionEvent.admissionOrdinal - 1,
  );
  const staleAcquisition = await cloneEventPrefixFixture(
    execution.context,
    execution.environment.abg,
    api,
    staleEvents,
    "abi5-t287-stale-fan-out-carrier-",
  );
  const staleStore = staleAcquisition.store;
  const durablePath = fileURLToPath(staleAcquisition.prefix.eventLogRef);
  const stalePrefix = execution.environment.abg
    .selectValidatedRuntimeEventPrefix(staleStore.readAll());
  assert.equal(projector.projectExactFanOutCompletion(stalePrefix, {
    mode: "graph_bound",
    admissionEventRef: laterCompletion.admissionEventRef,
    authority: exactFanOutProjectionAuthority(execution, completionEvent),
  }), null, "Prefix A cannot project the later Prefix B completion carrier");
  const outcome = await admittedFinalFanOutOutcome(
    execution,
    staleStore,
    completionEvent,
  );
  const targetCursor = fanOutContinuationCursor(
    execution,
    outcome.sourceCursor,
    laterCompletion,
  );
  const beforeEvents = staleStore.readAll();
  const beforeDigest = staleStore.digest();
  const beforeBytes = readFileSync(durablePath, "utf8");
  const retry = await retryApi(execution);
  const transaction = api.admitRuntimeEventTransactionAtExpectedPrefix(
    staleStore,
    beforeDigest,
    () => retry.admitCompletedRetryProgress(
      staleStore,
      execution.graph,
      execution.graphFunction,
      outcome.sourceCursor,
      targetCursor,
      {
        completionClass: "fan_out_success",
        cCall: outcome.cCall,
        result: outcome.result,
        judgment: outcome.judgment,
        completion: laterCompletion,
      },
      {
        eventTime: "2026-08-07T00:00:01.000Z",
        correlationId: "correlation://t287/r6/stale-fan-out-carrier",
        causationEventRefs: [],
      },
    ),
  );
  const refusal = transaction.value;
  assert.equal(transaction.successorPrefix, null,
    "retry refusal commits no durable successor prefix");
  assert.equal(refusal.kind, "retry_admission_refusal",
    JSON.stringify(refusal));
  assert.equal(refusal.code, "attempt_mismatch");
  assert.deepEqual(staleStore.readAll(), beforeEvents,
    "the effectful retry owner appends no in-memory suffix");
  assert.equal(staleStore.digest(), beforeDigest);
  assert.equal(readFileSync(durablePath, "utf8"), beforeBytes,
    "the effectful retry owner appends no durable bytes");
  staleStore.closeDurableLog();
});

test("T-287 R6 fully rehashed non-final fan-out provenance forgery cannot project progress or route", async (context) => {
  const execution = await executeTestGraph(context, retryFanOutPublication);
  assertNestedSuccessfulRetryExit(execution, "fan_out_success");
  const { abg, product } = execution.environment;
  const eventStoreApi = await import(pathToFileURL(join(
    execution.environment.installedRoot,
    "build/code/src/abg/event_store.js",
  )).href);
  const projector = await exactFanOutProjector(execution);
  const completionEvent = exactFanOutCompletionEvent(execution);
  const authority = exactFanOutProjectionAuthority(execution, completionEvent);
  const { store: forgedStore } = await cloneEventPrefixFixture(
    execution.context,
    execution.environment.abg,
    eventStoreApi,
    execution.events.slice(0, completionEvent.admissionOrdinal - 1),
    "abi5-t287-rehashed-fan-out-provenance-",
  );

  const completionBody = structuredClone(completionEvent.payload);
  delete completionBody.completionRef;
  delete completionBody.completionDigest;
  assert.ok(completionBody.taskRows.length > 1);
  assert.notEqual(
    completionBody.taskRows[0].foldbackEventRef,
    completionBody.taskRows[1].foldbackEventRef,
  );
  completionBody.taskRows[0].foldbackEventRef =
    completionBody.taskRows[1].foldbackEventRef;
  const forgedCompletionDigest = product.sha256Canonical(completionBody);
  const forgedCompletion = eventStoreApi.admitRuntimeEvent(forgedStore, eventCandidate(
    completionEvent,
    {
      payload: {
        completionRef:
          `fan-out-completion://abiogenesis/${
            forgedCompletionDigest.slice("sha256:".length)
          }`,
        completionDigest: forgedCompletionDigest,
        ...completionBody,
      },
    },
  ));

  const originalProgresses = execution.events.filter((event) =>
    event.kind === "retry_progress_recorded" &&
    event.payload.progressClass === "completed" &&
    event.payload.completionClass === "fan_out_success");
  assert.equal(originalProgresses.length, 2);
  const eventRefMap = new Map([
    [completionEvent.eventId, forgedCompletion.eventId],
  ]);
  const progressRefMap = new Map();
  const forgedProgresses = [];
  for (const original of originalProgresses) {
    const body = structuredClone(original.payload);
    delete body.progressRef;
    delete body.progressDigest;
    body.completionWitnessEventRef = forgedCompletion.eventId;
    if (body.predecessorProgressRef !== null) {
      body.predecessorProgressRef = progressRefMap.get(
        body.predecessorProgressRef,
      );
      assert.ok(body.predecessorProgressRef);
    }
    const progressDigest = product.sha256Canonical(body);
    const progressRef =
      `retry-progress://abiogenesis/${progressDigest.slice("sha256:".length)}`;
    const admitted = eventStoreApi.admitRuntimeEvent(forgedStore, eventCandidate(
      original,
      {
        causationEventRefs: original.causationEventRefs.map((eventRef) =>
          eventRefMap.get(eventRef) ?? eventRef),
        payload: { progressRef, progressDigest, ...body },
      },
    ));
    eventRefMap.set(original.eventId, admitted.eventId);
    progressRefMap.set(original.payload.progressRef, progressRef);
    forgedProgresses.push(admitted);
  }
  const originalRoute = execution.events.find((event) =>
    event.kind === "traversal_route_admitted" &&
    originalProgresses.every((progress) =>
      event.payload.consumedAvailabilityRefs.includes(
        progress.payload.progressRef,
      )));
  assert.ok(originalRoute);
  const routeBody = structuredClone(originalRoute.payload);
  delete routeBody.routeRef;
  delete routeBody.routeDigest;
  routeBody.consumedAvailabilityRefs = routeBody.consumedAvailabilityRefs.map(
    (ref) => progressRefMap.get(ref) ?? ref,
  );
  const routeDigest = product.sha256Canonical(routeBody);
  const routeRef =
    `traversal-route://abiogenesis/${routeDigest.slice("sha256:".length)}`;
  const forgedRoute = eventStoreApi.admitRuntimeEvent(forgedStore, eventCandidate(
    originalRoute,
    {
      causationEventRefs: originalRoute.causationEventRefs.map((eventRef) =>
        eventRefMap.get(eventRef) ?? eventRef),
      payload: { routeRef, routeDigest, ...routeBody },
    },
  ));
  const forgedPrefix = abg.selectValidatedRuntimeEventPrefix(
    forgedStore.readAll(),
  );
  assert.equal(projector.projectExactFanOutCompletion(forgedPrefix, {
    mode: "graph_bound",
    admissionEventRef: forgedCompletion.eventId,
    authority,
  }), null, "the rehashed carrier cannot replace exact row provenance");
  const { cursor: forgedSourceCursor } = fanOutFinalSourceCursor(
    execution,
    completionEvent,
  );
  for (const progress of forgedProgresses) {
    assert.equal(
      exactDeclaredRetryOwner(
        execution,
        forgedPrefix,
        forgedSourceCursor,
        progress,
      ),
      null,
      "forged completion truth cannot enter the declared retry owner",
    );
  }
  assert.throws(
    () => abg.projectAdmittedRecursionRoute(forgedStore, {
      runId: forgedRoute.runId,
      routeRef,
    }),
    /invalid fan-out completion truth/u,
    "a route over the forged completion and progress chain cannot project",
  );
});

test("T-287 R6 fully rehashed alien fan-out program locus is refused by graph-bound retry and route owners", async (context) => {
  const execution = await executeTestGraph(context, retryFanOutPublication);
  assertNestedSuccessfulRetryExit(execution, "fan_out_success");
  const completionEvent = exactFanOutCompletionEvent(execution);
  const authority = exactFanOutProjectionAuthority(execution, completionEvent);
  const projector = await exactFanOutProjector(execution);
  const forged = await forgeAlienFanOutProgramLocus(
    execution,
    completionEvent,
  );
  const forgedPrefix = execution.environment.abg
    .selectValidatedRuntimeEventPrefix(forged.forgedStore.readAll());
  const eventCanonical = projector.projectExactFanOutCompletion(
    forgedPrefix,
    {
      mode: "event_canonical",
      admissionEventRef: forged.forgedCompletionEvent.eventId,
    },
  );
  assert.equal(eventCanonical?.kind, "fan_out_completion_admission",
    "the fully rehashed event carrier is internally canonical");
  assert.equal(projector.projectExactFanOutCompletion(forgedPrefix, {
    mode: "graph_bound",
    admissionEventRef: forged.forgedCompletionEvent.eventId,
    authority,
  }), null,
  "the alien workflow locus cannot join the materialized GTL Program");

  const outcome = await admittedFinalFanOutOutcome(
    execution,
    forged.forgedStore,
    forged.forgedCompletionEvent,
  );
  const targetCursor = fanOutContinuationCursor(
    execution,
    outcome.sourceCursor,
    eventCanonical,
  );
  const api = await eventStoreApi(execution);
  const retry = await retryApi(execution);
  const beforeRetryEvents = forged.forgedStore.readAll();
  const beforeRetryDigest = forged.forgedStore.digest();
  const beforeRetryBytes = readFileSync(forged.durablePath, "utf8");
  const retryTransaction =
    api.admitRuntimeEventTransactionAtExpectedPrefix(
      forged.forgedStore,
      beforeRetryDigest,
      () => retry.admitCompletedRetryProgress(
        forged.forgedStore,
        execution.graph,
        execution.graphFunction,
        outcome.sourceCursor,
        targetCursor,
        {
          completionClass: "fan_out_success",
          cCall: outcome.cCall,
          result: outcome.result,
          judgment: outcome.judgment,
          completion: eventCanonical,
        },
        {
          eventTime: "2026-08-07T00:00:02.000Z",
          correlationId: "correlation://t287/r6/alien-locus/retry",
          causationEventRefs: [],
        },
      ),
  );
  const retryRefusal = retryTransaction.value;
  assert.equal(retryTransaction.successorPrefix, null,
    "retry refusal commits no durable successor prefix");
  assert.equal(retryRefusal.kind, "retry_admission_refusal",
    JSON.stringify(retryRefusal));
  assert.equal(retryRefusal.code, "attempt_mismatch");
  assert.deepEqual(forged.forgedStore.readAll(), beforeRetryEvents);
  assert.equal(forged.forgedStore.digest(), beforeRetryDigest);
  assert.equal(readFileSync(forged.durablePath, "utf8"), beforeRetryBytes,
    "retry refusal appends no durable suffix");

  const replayState = execution.environment.abg.replay(
    forged.forgedStore,
    { runId: outcome.sourceCursor.runId },
  );
  const application = authority.application;
  const routeBody = {
    routeKind: "advance",
    declarationRef: execution.graph.materializationRef,
    declarationDigest: execution.graph.materializationDigest,
    sourceCursorRef: outcome.sourceCursor.cursorRef,
    sourceCursorDigest: outcome.sourceCursor.cursorDigest,
    targetCursorRef: targetCursor.cursorRef,
    targetCursorDigest: targetCursor.cursorDigest,
    cCallRef: outcome.cCall.cCallRef,
    judgmentRef: outcome.judgment.judgmentRef,
    consumedAvailabilityRefs: [
      outcome.judgment.judgmentRef,
      application.applicationRef,
    ],
    contractRef: outcome.cCall.transitionContractRef,
    replayStateDigest: replayState.replayDigest,
  };
  const candidateDigest = execution.environment.product.sha256Canonical(
    routeBody,
  );
  const routeCandidate = {
    kind: "traversal_route_candidate",
    schemaVersion: "5.0.0",
    candidateRef:
      `route-candidate://abiogenesis/${
        candidateDigest.slice("sha256:".length)
      }`,
    candidateDigest,
    ...routeBody,
  };
  const route = await traversalRouteApi(execution);
  const beforeRouteEvents = forged.forgedStore.readAll();
  const beforeRouteDigest = forged.forgedStore.digest();
  const beforeRouteBytes = readFileSync(forged.durablePath, "utf8");
  const routeRefusal = route.admitRoute(
    forged.forgedStore,
    execution.execution.executionBasis,
    execution.graph,
    outcome.sourceCursor,
    targetCursor,
    replayState,
    routeCandidate,
    {
      eventTime: "2026-08-07T00:00:03.000Z",
      correlationId: "correlation://t287/r6/alien-locus/route",
      causationEventRefs: [],
    },
    {
      graphFunction: execution.graphFunction,
      cCall: outcome.cCall,
      result: outcome.result,
      judgment: outcome.judgment,
      application,
      completion: eventCanonical,
    },
  );
  assert.equal(routeRefusal.kind, "traversal_route_admission_refusal",
    JSON.stringify(routeRefusal));
  assert.equal(routeRefusal.code, "judgment_mismatch");
  assert.deepEqual(forged.forgedStore.readAll(), beforeRouteEvents);
  assert.equal(forged.forgedStore.digest(), beforeRouteDigest);
  assert.equal(readFileSync(forged.durablePath, "utf8"), beforeRouteBytes,
    "route refusal appends no durable suffix");
  forged.forgedStore.closeDurableLog();
});

test("T-287 R6 nested retry F_H resume exits both depths through one exact continuation provenance chain", async (context) => {
  const execution = await executeTestGraph(context, retryFhPublication);
  const { completed } = assertNestedSuccessfulRetryExit(
    execution,
    "fh_resume_success",
  );
  const resume = execution.events.find((event) =>
    event.eventId === completed[0].payload.completionWitnessEventRef);
  assert.equal(resume?.kind, "fh_interaction_resume_admitted");
  const opened = execution.events.find((event) =>
    event.kind === "fh_interaction_opened" &&
    event.aggregateId === resume.aggregateId);
  const responded = execution.events.find((event) =>
    event.kind === "fh_interaction_responded" &&
    event.aggregateId === resume.aggregateId);
  assert.ok(opened);
  assert.ok(responded);
  const respondOperation = execution.events.find((event) =>
    event.eventId === responded.payload.publicOperationEventRef);
  const continueOperation = execution.events.find((event) =>
    event.eventId === resume.payload.publicOperationEventRef);
  assert.equal(respondOperation?.payload.operationId,
    "abg.operation.interaction.respond");
  assert.equal(continueOperation?.payload.operationId,
    "abg.operation.run.continue");
  assert.equal(opened.payload.constructionIntentRef ?? null, null);
  const composed = execution.graph.template.nodes[0].term;
  assert.equal(composed.kind, "c_compose");
  const targetTerm = composed.terms[1];
  const targetContracts = execution.fixture.publication.contracts.filter(
    (contract) => contract.contractRef === targetTerm.inputCarrierRef,
  );
  assert.equal(targetContracts.length, 1);
  assert.equal(resume.payload.successorInputContractRef,
    targetTerm.inputCarrierRef);
  assert.equal(resume.payload.successorInputValueKind,
    targetContracts[0].valueKind);
  assert.equal(resume.payload.successorInputContractRef,
    opened.payload.responseContractRef);
  assert.deepEqual(resume.payload.successorInputValue,
    responded.payload.responseValue);
  const projectedContinuation = execution.completion.replayState.continuations
    .find((candidate) => candidate.continuationRef === opened.aggregateId);
  assert.equal(projectedContinuation?.respondedPublicOperationEventRef,
    respondOperation.eventId);
  assert.equal(projectedContinuation?.resumedPublicOperationEventRef,
    continueOperation.eventId);
  const retryAttempts = execution.events.filter((event) =>
    event.kind === "retry_attempt_opened");
  assert.ok(retryAttempts.length > 0);
  for (const attempt of retryAttempts) {
    assert.equal(Object.hasOwn(attempt.payload, "inputValueKind"), false);
    assert.equal(Object.hasOwn(attempt.payload, "inputSourceEventRef"), false);
    assert.equal(attempt.causationEventRefs.length, 1);
    const route = execution.events.find((event) =>
      event.eventId === attempt.causationEventRefs[0]);
    assert.equal(route?.kind, "traversal_route_admitted");
    assert.equal(route?.payload.routeKind, "retry");
  }
  assert.deepEqual(
    [opened, responded, resume].map((event) => [
      event.parentAggregateId,
      event.runId,
      event.graphCallId,
      event.frameId,
      event.payload.continuationRef,
    ]),
    [opened, responded, resume].map(() => [
      opened.frameId,
      opened.runId,
      opened.graphCallId,
      opened.frameId,
      opened.aggregateId,
    ]),
    "opened, responded, and resumed rows share one exact frame envelope",
  );
  assert.equal(opened.basisId, opened.payload.executionBasisRef);
  assert.equal(responded.basisId, opened.aggregateId);
  assert.equal(resume.basisId, opened.aggregateId);
  assert.deepEqual(responded.causationEventRefs, [
    opened.eventId,
    respondOperation.eventId,
  ]);
  assert.deepEqual(resume.causationEventRefs, [
    responded.eventId,
    continueOperation.eventId,
  ]);
  const unrelatedCause = execution.events.find((event) =>
    event.eventId === opened.causationEventRefs[0]);
  assert.ok(unrelatedCause);
  const responseCausationForgeries = [
    {
      causationEventRefs: [respondOperation.eventId, opened.eventId],
      eventContractRefusal: false,
    },
    {
      causationEventRefs: [opened.eventId, unrelatedCause.eventId],
      eventContractRefusal: false,
    },
    {
      causationEventRefs: [
        opened.eventId,
        respondOperation.eventId,
        respondOperation.eventId,
      ],
      eventContractRefusal: true,
    },
    {
      causationEventRefs: [
        opened.eventId,
        respondOperation.eventId,
        unrelatedCause.eventId,
      ],
      eventContractRefusal: false,
    },
  ];
  for (const forgery of responseCausationForgeries) {
    if (forgery.eventContractRefusal) {
      await assert.rejects(
        () => forgeValidatedPrefixAt(execution, responded.eventId, {
          causationEventRefs: forgery.causationEventRefs,
        }),
        /causation refs must be unique/u,
      );
      continue;
    }
    const forgedResponse = await forgeValidatedPrefixAt(
      execution,
      responded.eventId,
      { causationEventRefs: forgery.causationEventRefs },
    );
    assert.throws(
      () => execution.environment.abg.replayValidatedRuntimeEventPrefix(
        forgedResponse.prefix,
      ),
      /invalid response truth/u,
      "F_H response projection rejects reordered, substituted, duplicate, and extra causation",
    );
  }
  const resumeCausationForgeries = [
    {
      causationEventRefs: [continueOperation.eventId, responded.eventId],
      eventContractRefusal: false,
    },
    {
      causationEventRefs: [responded.eventId, unrelatedCause.eventId],
      eventContractRefusal: false,
    },
    {
      causationEventRefs: [
        responded.eventId,
        continueOperation.eventId,
        continueOperation.eventId,
      ],
      eventContractRefusal: true,
    },
    {
      causationEventRefs: [
        responded.eventId,
        continueOperation.eventId,
        unrelatedCause.eventId,
      ],
      eventContractRefusal: false,
    },
  ];
  for (const forgery of resumeCausationForgeries) {
    if (forgery.eventContractRefusal) {
      await assert.rejects(
        () => forgeValidatedPrefixAt(execution, resume.eventId, {
          causationEventRefs: forgery.causationEventRefs,
        }),
        /causation refs must be unique/u,
      );
      continue;
    }
    const forgedResume = await forgeValidatedPrefixAt(
      execution,
      resume.eventId,
      { causationEventRefs: forgery.causationEventRefs },
    );
    assert.throws(
      () => execution.environment.abg.replayValidatedRuntimeEventPrefix(
        forgedResume.prefix,
      ),
      /invalid resume truth/u,
      "F_H resume projection rejects reordered, substituted, duplicate, and extra causation",
    );
  }
  const restampSuccessorCursor = (cursor, overrides) => {
    const {
      kind: _kind,
      schemaVersion: _schemaVersion,
      cursorRef: _cursorRef,
      cursorDigest: _cursorDigest,
      ...body
    } = structuredClone(cursor);
    const restampedBody = { ...body, ...overrides };
    const cursorDigest = execution.environment.product.sha256Canonical(
      restampedBody,
    );
    return {
      kind: "traversal_cursor",
      schemaVersion: "5.0.0",
      cursorRef:
        `traversal-cursor://abiogenesis/${
          cursorDigest.slice("sha256:".length)
        }`,
      cursorDigest,
      ...restampedBody,
    };
  };
  const restampedInputValue = {
    ...structuredClone(resume.payload.successorInputValue),
    entry212Restamp: true,
  };
  const restampedInputDigest = execution.environment.product.sha256Canonical(
    restampedInputValue,
  );
  const restampedInputRef =
    `interaction-response://abiogenesis/${
      restampedInputDigest.slice("sha256:".length)
    }`;
  const restampedInputCursor = restampSuccessorCursor(
    resume.payload.successorCursor,
    {
      inputRef: restampedInputRef,
      inputDigest: restampedInputDigest,
    },
  );
  const restampedCursor = restampSuccessorCursor(
    resume.payload.successorCursor,
    { attempt: resume.payload.successorCursor.attempt + 1 },
  );
  const exactOwnerRelationForgeries = [
    {
      label: "derived successor input",
      payload: {
        ...structuredClone(resume.payload),
        successorInputRef: restampedInputRef,
        successorInputDigest: restampedInputDigest,
        successorInputValue: restampedInputValue,
        successorCursor: restampedInputCursor,
        successorCursorRef: restampedInputCursor.cursorRef,
        successorCursorDigest: restampedInputCursor.cursorDigest,
      },
    },
    {
      label: "held-to-successor cursor",
      payload: {
        ...structuredClone(resume.payload),
        successorCursor: restampedCursor,
        successorCursorRef: restampedCursor.cursorRef,
        successorCursorDigest: restampedCursor.cursorDigest,
      },
    },
    {
      label: "durable predecessor prefix basis",
      payload: {
        ...structuredClone(resume.payload),
        durablePrefixDigest: execution.environment.product.sha256Canonical({
          forged: "entry212-predecessor-prefix",
        }),
      },
    },
  ];
  for (const forgery of exactOwnerRelationForgeries) {
    const forgedResume = await forgeValidatedPrefixAt(
      execution,
      resume.eventId,
      { payload: forgery.payload },
    );
    for (const queryRef of [
      continueOperation.payload.invocationRef,
      `invocation://t287/r6/entry212/${
        forgery.label.replaceAll(" ", "-")
      }/unrelated`,
    ]) {
      const truth = execution.environment.abg
        .projectEffectfulPublicInvocationTruthAtPrefix(
          forgedResume.prefix,
          queryRef,
        );
      assert.equal(
        truth.disposition,
        "invalid_history",
        `${forgery.label}: ${JSON.stringify(truth)}`,
      );
      assert.equal(truth.code, "invocation_pair_invalid");
    }
    assert.throws(
      () => execution.environment.abg.replayValidatedRuntimeEventPrefix(
        forgedResume.prefix,
      ),
      /invalid resume truth/u,
      `fresh owner replay rejects the restamped ${forgery.label}`,
    );
  }
  const identity = {
    continuationKind: "fh_interaction",
    runId: opened.runId,
    graphCallId: opened.graphCallId,
    frameId: opened.frameId,
    cCallRef: opened.payload.cCallRef,
    heldCursorRef: opened.payload.heldCursorRef,
    heldCursorDigest: opened.payload.heldCursorDigest,
    requestRef: opened.payload.requestRef,
    requestDigest: opened.payload.requestDigest,
    actorCapabilityRef: opened.payload.actorCapabilityRef,
    responseContractRef: opened.payload.responseContractRef,
    executionBasisRef: opened.payload.executionBasisRef,
    constructionIntentRef: opened.payload.constructionIntentRef ?? null,
  };
  const continuationDigest = execution.environment.product.sha256Canonical(
    identity,
  );
  assert.equal(opened.payload.continuationDigest, continuationDigest);
  assert.equal(
    opened.aggregateId,
    `continuation://abiogenesis/${continuationDigest.slice("sha256:".length)}`,
  );

  const forged = await forgeValidatedPrefixAt(execution, resume.eventId, {
    parentAggregateId: "frame://t287/forged-cross-scope",
  });
  assert.throws(
    () => execution.environment.abg.replayValidatedRuntimeEventPrefix(
      forged.prefix,
    ),
    /invalid resume truth/u,
    "contract-valid cross-frame resume truth is rejected by the owner projector",
  );
});

test("T-287 R6 installed depth-3 F_H success exits and reconstructs every retry owner in exact causal order", async (context) => {
  const execution = await executeTestGraph(
    context,
    tripleNestedRetryFhPublication,
  );
  const { completed, route } = assertNestedSuccessfulRetryExit(
    execution,
    "fh_resume_success",
    3,
  );
  const { frontiers } = assertSuccessfulFhExitFrontiers(
    execution,
    completed,
    route,
  );
  assert.equal(frontiers.length, 3);
});

test("T-287 TV5 successful nested F_H completion reconstructs both retry owners and route in PID-2", async (context) => {
  let unrelatedInvocationAdmission = null;
  const execution = await executeTestGraph(
    context,
    retryFhPublication,
    {
      afterInvocationAdmitted(runtime) {
        unrelatedInvocationAdmission =
          admitUnrelatedInvocationBeforeTargetRun(runtime);
      },
    },
  );
  assert.ok(unrelatedInvocationAdmission);
  const { completed, route } = assertNestedSuccessfulRetryExit(
    execution,
    "fh_resume_success",
  );
  const resume = execution.events.find((event) =>
    event.eventId === completed[0].payload.completionWitnessEventRef);
  assert.equal(resume?.kind, "fh_interaction_resume_admitted");
  const opened = execution.events.find((event) =>
    event.kind === "fh_interaction_opened" &&
    event.aggregateId === resume.aggregateId);
  assert.ok(opened);

  const heldCursor = opened.payload.heldCursor;
  const successorBody = {
    programRef: heldCursor.programRef,
    executionBasisRef: heldCursor.executionBasisRef,
    traversalScopeRef: heldCursor.traversalScopeRef,
    runId: heldCursor.runId,
    graphCallId: heldCursor.graphCallId,
    frameId: heldCursor.frameId,
    graphRef: heldCursor.graphRef,
    inputRef: resume.payload.successorInputRef,
    inputDigest: resume.payload.successorInputDigest,
    currentNodeRef: heldCursor.currentNodeRef,
    position: heldCursor.position,
    termPath: heldCursor.termPath,
    taskOrdinal: heldCursor.taskOrdinal,
    attempt: heldCursor.attempt,
    retryPath: heldCursor.retryPath,
  };
  const successorDigest = execution.environment.product.sha256Canonical(
    successorBody,
  );
  const successorCursor = Object.freeze({
    kind: "traversal_cursor",
    schemaVersion: "5.0.0",
    cursorRef:
      `traversal-cursor://abiogenesis/${successorDigest.slice("sha256:".length)}`,
    cursorDigest: successorDigest,
    ...successorBody,
  });
  const sourceAuthorityPrefix = execution.environment.abg
    .selectValidatedRuntimeEventPrefix(execution.events);
  const sourcePrefix = execution.environment.abg
    .selectValidatedRuntimeEventPrefix(execution.events, {
      runId: resume.runId,
    });
  const scopedRunHasGlobalOrdinalGap = sourcePrefix.events.some(
    (event, index) => event.admissionOrdinal !== index + 1,
  );
  const authorityEventRefs = new Set(sourceAuthorityPrefix.events.map(
    (event) => event.eventId,
  ));
  const runEventRefs = new Set(sourcePrefix.events.map((event) =>
    event.eventId
  ));
  for (const eventRef of [
    execution.invocationAdmission.publicOperationEventRef,
    execution.invocationAdmission.admissionEventRef,
  ]) {
    assert.equal(
      runEventRefs.has(eventRef),
      true,
      "the target Run causally retains its own Public and invocation owners",
    );
  }
  const unrelatedInvocationEventRefs = [
    unrelatedInvocationAdmission.publicOperationEventRef,
    unrelatedInvocationAdmission.admissionEventRef,
  ];
  for (const eventRef of unrelatedInvocationEventRefs) {
    assert.equal(authorityEventRefs.has(eventRef), true);
    assert.equal(
      runEventRefs.has(eventRef),
      false,
      "the target Run excludes the unrelated admitted invocation owner pair",
    );
  }
  const unrelatedOrdinals = sourceAuthorityPrefix.events
    .filter((event) => unrelatedInvocationEventRefs.includes(event.eventId))
    .map((event) => event.admissionOrdinal);
  assert.equal(unrelatedOrdinals.length, 2);
  const lastUnrelatedOrdinal = Math.max(...unrelatedOrdinals);
  const postUnrelatedRunIndex = sourcePrefix.events.findIndex((event) =>
    event.admissionOrdinal > lastUnrelatedOrdinal
  );
  const postUnrelatedRunEvent = sourcePrefix.events[postUnrelatedRunIndex];
  const preGapRunEvent = sourcePrefix.events[postUnrelatedRunIndex - 1];
  assert.ok(
    postUnrelatedRunEvent,
    "the target Run resumes after the unrelated invocation owner pair",
  );
  assert.ok(preGapRunEvent);
  assert.ok(
    postUnrelatedRunEvent.admissionOrdinal > lastUnrelatedOrdinal,
    "the post-gap target Run event retains its higher global ordinal",
  );
  assert.ok(
    postUnrelatedRunEvent.admissionOrdinal - preGapRunEvent.admissionOrdinal >
      1,
    "the excluded unrelated owner pair creates an actual scoped-Run ordinal gap",
  );
  const globalOrdinalGap = {
    precedingRunEventRef: preGapRunEvent.eventId,
    precedingRunOrdinal: preGapRunEvent.admissionOrdinal,
    excludedEventRefs: unrelatedInvocationEventRefs,
    excludedOrdinals: unrelatedOrdinals,
    followingRunEventRef: postUnrelatedRunEvent.eventId,
    followingRunOrdinal: postUnrelatedRunEvent.admissionOrdinal,
  };
  assert.equal(
    scopedRunHasGlobalOrdinalGap,
    true,
    "the real F_H retry Run view retains global ordinals from its full authority prefix",
  );
  assert.equal(
    execution.environment.abg.isTraversalCursorCandidate(successorCursor),
    true,
  );
  assert.equal(
    execution.environment.abg.isInteractionResumeCursorSuccessorAtPrefix(
      sourcePrefix,
      heldCursor,
      {
        inputRef: resume.payload.successorInputRef,
        inputDigest: resume.payload.successorInputDigest,
      },
      successorCursor,
    ),
    true,
  );
  assert.equal(
    execution.environment.abg.hasAdmittedTraversalCursorAtPrefix(
      sourcePrefix,
      successorCursor,
    ),
    true,
  );
  assert.notEqual(successorCursor.cursorRef, heldCursor.cursorRef);
  assert.notEqual(successorCursor.inputRef, heldCursor.inputRef);
  assert.notEqual(successorCursor.inputDigest, heldCursor.inputDigest);

  const sourceRouteApi = await import(pathToFileURL(join(
    execution.environment.installedRoot,
    "build/code/src/abg/traversal_route.js",
  )).href);
  const sourceHistoricalRoute =
    sourceRouteApi.projectHistoricalTraversalRouteAtPrefix(
      sourcePrefix,
      route.eventId,
      sourceAuthorityPrefix,
    );
  assert.ok(sourceHistoricalRoute);
  const sourceReplay = execution.environment.abg
    .replayValidatedRuntimeEventPrefix(sourcePrefix, sourceAuthorityPrefix);
  const sourceReplayRoutes = sourceReplay.routes.filter((candidate) =>
    candidate.admissionEventRef === route.eventId);
  assert.equal(sourceReplayRoutes.length, 1);
  const sourceFrontiers = completed.map((progressEvent) => {
    const frontier = execution.environment.abg.projectDeclaredCRetryFrontier(
      sourcePrefix,
      execution.graph,
      successorCursor,
      execution.graphFunction,
      progressEvent.payload.completedRetryDepth,
      sourceAuthorityPrefix,
    );
    assert.equal(frontier?.state, "progress_consumed");
    assert.equal(
      frontier.consumed.progress.progressRef,
      progressEvent.payload.progressRef,
    );
    assert.equal(
      frontier.consumed.progressEventRef,
      progressEvent.eventId,
    );
    assert.equal(
      frontier.consumed.consumption.route.admissionEventRef,
      route.eventId,
    );
    return {
      depth: progressEvent.payload.completedRetryDepth,
      state: frontier.state,
      progressRef: frontier.consumed.progress.progressRef,
      progressDigest: frontier.consumed.progress.progressDigest,
      progressEventRef: frontier.consumed.progressEventRef,
      routeRef: frontier.consumed.consumption.route.routeRef,
      routeDigest: frontier.consumed.consumption.route.routeDigest,
      routeEventRef: frontier.consumed.consumption.route.admissionEventRef,
    };
  });
  const routeSummary = (projectedRoute) => ({
    routeRef: projectedRoute.routeRef,
    routeDigest: projectedRoute.routeDigest,
    routeKind: projectedRoute.routeKind,
    sourceCursorRef: projectedRoute.sourceCursorRef,
    sourceCursorDigest: projectedRoute.sourceCursorDigest,
    targetCursorRef: projectedRoute.targetCursorRef,
    targetCursorDigest: projectedRoute.targetCursorDigest,
    consumedAvailabilityRefs: projectedRoute.consumedAvailabilityRefs,
    admissionEventRef: projectedRoute.admissionEventRef,
  });
  const sourceOracle = {
    kind: "t287_tv5_success_reconstruction_observation",
    eventLogDigest: execution.environment.abg.selectHeldEventStoreDurablePrefix(
      execution.traversalExecutionInput.store,
    ).prefixDigest,
    historicalEventCount: execution.events.length,
    scopedRunHasGlobalOrdinalGap,
    targetInvocationRetained: true,
    unrelatedInvocationExcluded: true,
    globalOrdinalGap,
    replayDigest: sourceReplay.replayDigest,
    heldCursor: {
      cursorRef: heldCursor.cursorRef,
      cursorDigest: heldCursor.cursorDigest,
      inputRef: heldCursor.inputRef,
      inputDigest: heldCursor.inputDigest,
    },
    successorCursor: {
      cursorRef: successorCursor.cursorRef,
      cursorDigest: successorCursor.cursorDigest,
      inputRef: successorCursor.inputRef,
      inputDigest: successorCursor.inputDigest,
      currentNodeRef: successorCursor.currentNodeRef,
      termPath: successorCursor.termPath,
      retryPath: successorCursor.retryPath,
    },
    progresses: completed.map((event) => ({
      depth: event.payload.completedRetryDepth,
      eventRef: event.eventId,
      progressRef: event.payload.progressRef,
      progressDigest: event.payload.progressDigest,
      predecessorProgressRef: event.payload.predecessorProgressRef,
      sourceCursorRef: event.payload.sourceCursorRef,
      sourceCursorDigest: event.payload.sourceCursorDigest,
      targetCursorRef: event.payload.targetCursorRef,
      targetCursorDigest: event.payload.targetCursorDigest,
    })),
    frontiers: sourceFrontiers,
    historicalRoute: routeSummary(sourceHistoricalRoute),
    replayRoute: routeSummary(sourceReplayRoutes[0]),
  };

  const handoff = execution.traversalExecutionInput.store
    .projectReopenAuthorityAndClose();
  const proof = await runTv5SuccessReconstructionWorker({
    originProcessId: process.pid,
    installedRoot: execution.environment.installedRoot,
    reopenAuthority: handoff.reopenAuthority,
    prefix: handoff.prefix,
    graph: execution.graph,
    graphFunction: execution.graphFunction,
    runId: resume.runId,
    executionBasisRef: opened.payload.executionBasisRef,
    completionWitnessEventRef: resume.eventId,
    targetInvocationEventRefs: [
      execution.invocationAdmission.publicOperationEventRef,
      execution.invocationAdmission.admissionEventRef,
    ],
    unrelatedInvocationEventRefs,
    routeEventRef: route.eventId,
  });

  const { processId: freshProcessId, ...freshObservation } = proof;
  assert.notEqual(freshProcessId, process.pid);
  assert.equal(
    freshObservation.eventLogDigest,
    handoff.reopenAuthority.eventLogDigest,
  );
  assert.deepEqual(freshObservation, sourceOracle);
});

test("T-287 TV5 published F_P retry crosses the real gap and reconstructs D17 resume plus fresh-process replay", async (context) => {
  let unrelatedInvocationAdmission = null;
  let worker = null;
  const priorCommand = process.env.ABG_TS_CLAUDE_COMMAND;
  const priorCounter = process.env.ABG_T287_FP_RETRY_COUNTER;
  context.after(() => {
    if (priorCommand === undefined) delete process.env.ABG_TS_CLAUDE_COMMAND;
    else process.env.ABG_TS_CLAUDE_COMMAND = priorCommand;
    if (priorCounter === undefined) {
      delete process.env.ABG_T287_FP_RETRY_COUNTER;
    } else {
      process.env.ABG_T287_FP_RETRY_COUNTER = priorCounter;
    }
  });
  const execution = await executeTestGraph(
    context,
    retryFpHelloPublication,
    {
      async prepareStore({ environment }) {
        worker = await installFailOnceFpRetryWorker(
          environment.scratch,
          environment.gtl,
        );
        process.env.ABG_TS_CLAUDE_COMMAND = worker.command;
        process.env.ABG_T287_FP_RETRY_COUNTER = worker.counterPath;
      },
      afterInvocationAdmitted(runtime) {
        unrelatedInvocationAdmission =
          admitUnrelatedInvocationBeforeTargetRun(runtime);
      },
    },
  );
  assert.ok(worker);
  assert.ok(unrelatedInvocationAdmission);
  assert.equal(await readFile(worker.counterPath, "utf8"), "2");
  assert.equal(execution.completion.disposition, "closed");
  assert.equal(execution.completion.resultValue?.kind, "fp_hello_output");
  assert.equal(execution.completion.resultValue?.message, "Hello T-287 retry gap");

  const attempts = execution.events.filter((event) =>
    event.kind === "retry_attempt_opened");
  const calls = execution.events.filter((event) =>
    event.kind === "c_call_opened");
  const evidences = execution.events.filter((event) =>
    event.kind === "c_call_evidenced");
  const judgments = execution.events.filter((event) =>
    event.kind === "c_call_judged");
  const progresses = execution.events.filter((event) =>
    event.kind === "retry_progress_recorded");
  const routes = execution.events.filter((event) =>
    event.kind === "traversal_route_admitted");
  assert.deepEqual(attempts.map((event) => event.payload.retryPath), [
    [1],
    [1, 1],
    [1, 2],
  ]);
  assert.deepEqual(calls.map((event) => event.payload.attempt), [1, 2]);
  assert.deepEqual(judgments.map((event) => event.payload.judgment), [
    "retry",
    "advance",
  ]);
  assert.deepEqual(progresses.map((event) => event.payload.progressClass), [
    "retry",
    "completed",
    "completed",
  ]);
  const failureProgress = progresses[0];
  const firstEvidence = evidences.find((event) =>
    event.aggregateId === calls[0].aggregateId);
  const secondEvidence = evidences.find((event) =>
    event.aggregateId === calls[1].aggregateId);
  assert.ok(firstEvidence);
  assert.ok(secondEvidence);
  assert.equal(firstEvidence.payload.transportDisposition, "failure");
  assert.equal(
    firstEvidence.payload.transportFailureClass,
    "transport_failure",
  );
  assert.equal(secondEvidence.payload.transportDisposition, "success");
  assert.equal(secondEvidence.payload.transportFailureClass, null);
  assert.equal(failureProgress.payload.failureClass, "transport_failure");
  assert.equal(failureProgress.payload.progressClass, "retry");
  assert.deepEqual(failureProgress.payload.completedAttempts, [1]);
  assert.equal(failureProgress.payload.remainingBudget, 1);
  const retryRoute = routes.find((event) =>
    event.payload.routeKind === "retry" &&
    event.payload.consumedAvailabilityRefs.includes(
      failureProgress.payload.progressRef,
    ));
  assert.ok(retryRoute);
  const secondAttempt = attempts.find((event) =>
    execution.environment.product.sha256Canonical(event.payload.retryPath) ===
      execution.environment.product.sha256Canonical([1, 2]));
  assert.ok(secondAttempt);
  assert.deepEqual(secondAttempt.causationEventRefs, [retryRoute.eventId]);
  assert.equal(execution.events.at(-1).kind, "run_closed");

  const authorityPrefix = execution.environment.abg
    .selectValidatedRuntimeEventPrefix(execution.events);
  const runPrefix = execution.environment.abg
    .selectValidatedRuntimeEventPrefix(execution.events, {
      runId: calls[0].runId,
    });
  const authorityEventRefs = new Set(authorityPrefix.events.map((event) =>
    event.eventId));
  const runEventRefs = new Set(runPrefix.events.map((event) => event.eventId));
  for (const eventRef of [
    execution.invocationAdmission.publicOperationEventRef,
    execution.invocationAdmission.admissionEventRef,
  ]) {
    assert.equal(runEventRefs.has(eventRef), true);
  }
  const unrelatedEventRefs = [
    unrelatedInvocationAdmission.publicOperationEventRef,
    unrelatedInvocationAdmission.admissionEventRef,
  ];
  for (const eventRef of unrelatedEventRefs) {
    assert.equal(authorityEventRefs.has(eventRef), true);
    assert.equal(runEventRefs.has(eventRef), false);
  }
  const unrelatedOrdinals = authorityPrefix.events
    .filter((event) => unrelatedEventRefs.includes(event.eventId))
    .map((event) => event.admissionOrdinal);
  assert.equal(unrelatedOrdinals.length, 2);
  const lastUnrelatedOrdinal = Math.max(...unrelatedOrdinals);
  const followingIndex = runPrefix.events.findIndex((event) =>
    event.admissionOrdinal > lastUnrelatedOrdinal);
  const precedingRunEvent = runPrefix.events[followingIndex - 1];
  const followingRunEvent = runPrefix.events[followingIndex];
  assert.ok(precedingRunEvent);
  assert.ok(followingRunEvent);
  assert.deepEqual(
    authorityPrefix.events
      .filter((event) =>
        event.admissionOrdinal > precedingRunEvent.admissionOrdinal &&
        event.admissionOrdinal < followingRunEvent.admissionOrdinal)
      .map((event) => event.eventId),
    unrelatedEventRefs,
    "the exact global-ordinal gap contains only the unrelated Public and invocation owners",
  );
  assert.deepEqual(
    authorityPrefix.events
      .filter((event) =>
        event.admissionOrdinal > precedingRunEvent.admissionOrdinal &&
        event.admissionOrdinal < followingRunEvent.admissionOrdinal)
      .map((event) => event.admissionOrdinal),
    unrelatedOrdinals,
  );
  assert.ok(
    followingRunEvent.admissionOrdinal - precedingRunEvent.admissionOrdinal > 1,
  );

  const sourceCursor = retryAttemptCursorForOpenedCCall(execution, calls[0]);
  const failureProgressIndex = execution.events.findIndex((event) =>
    event.eventId === failureProgress.eventId);
  const eventStore = await eventStoreApi(execution);
  const predecessor = await cloneEventPrefixFixture(
    context,
    execution.environment.abg,
    eventStore,
    execution.events.slice(0, failureProgressIndex + 1),
    "abi5-t287-tv5-fp-d17-",
  );
  const predecessorPrefix = execution.environment.abg
    .selectHeldEventStoreDurablePrefix(predecessor.store);
  const selector = {
    kind: "retry_frontier_selector",
    schemaVersion: "5.0.0",
    runId: failureProgress.runId,
    graphCallId: failureProgress.graphCallId,
    frameId: failureProgress.frameId,
    retryBoundaryRef: failureProgress.payload.retryBoundaryRef,
    retryProgressRef: failureProgress.payload.progressRef,
  };
  const projectedRetry = execution.environment.abg.projectExecutableRetryInput({
    prefix: predecessorPrefix,
    selector,
    program: execution.program,
    graphFunction: execution.graphFunction,
    graph: execution.graph,
  });
  assert.equal(
    projectedRetry.kind,
    "executable_retry_input",
    JSON.stringify(projectedRetry),
  );
  assert.equal(projectedRetry.nextAttempt, 2);
  assert.deepEqual(projectedRetry.nextRetryPath, [1, 2]);
  assert.equal(projectedRetry.progressEventRef, failureProgress.eventId);
  assert.equal(projectedRetry.progress.progressRef, failureProgress.payload.progressRef);
  assert.equal(projectedRetry.progress.failureClass, "transport_failure");
  const graphExecute = await import(pathToFileURL(join(
    execution.environment.installedRoot,
    "build/code/src/hog/graph_execute.js",
  )).href);
  const projectedResume = graphExecute.resumeProjectedRetry({
    store: predecessor.store,
    predecessorPrefix,
    retry: projectedRetry,
    runtime: {
      executionBasis: execution.execution.executionBasis,
      openedTraversalScope: execution.opened.scope,
      program: execution.program,
      graphFunction: execution.graphFunction,
      graph: execution.graph,
      graphValidation: execution.traversalExecutionInput.graphValidation,
      eventTime: execution.traversalExecutionInput.eventTime,
      correlationId:
        `${execution.traversalExecutionInput.correlationId}/retry/${
          projectedRetry.nextAttempt
        }`,
    },
  });
  assert.equal(
    projectedResume.kind,
    "projected_retry_resume",
    JSON.stringify(projectedResume),
  );
  assert.equal(projectedResume.disposition, "resumed");
  assert.equal(projectedResume.nextAttempt, 2);
  assert.equal(projectedResume.routeAdmissionEventRef, retryRoute.eventId);
  assert.equal(
    projectedResume.retryAttemptAdmissionEventRef,
    secondAttempt.eventId,
  );
  assert.equal(projectedResume.nextCursor.cursorRef, calls[1].payload.cursorRef);
  assert.equal(projectedResume.nextCursor.cursorDigest, calls[1].payload.cursorDigest);
  assert.deepEqual(projectedResume.nextCursor.retryPath, [1, 2]);

  const sourceReplay = execution.environment.abg
    .replayValidatedRuntimeEventPrefix(runPrefix, authorityPrefix);
  const sourceDurable = execution.environment.abg
    .selectHeldEventStoreDurablePrefix(execution.traversalExecutionInput.store);
  const sourceObservation = {
    eventLogDigest: sourceDurable.prefixDigest,
    authorityEventCount: authorityPrefix.events.length,
    runEventRefs: runPrefix.events.map((event) => event.eventId),
    replayDigest: sourceReplay.replayDigest,
    routeEventRefs: sourceReplay.routes.map((route) => route.admissionEventRef),
  };
  const handoff = execution.traversalExecutionInput.store
    .projectReopenAuthorityAndClose();
  const freshProof = await runFreshFpRetryReplayProbe({
    installedRoot: execution.environment.installedRoot,
    reopenAuthority: handoff.reopenAuthority,
    prefix: handoff.prefix,
    runId: calls[0].runId,
  });
  const { processId: freshProcessId, ...freshObservation } = freshProof;
  assert.notEqual(freshProcessId, process.pid);
  assert.equal(freshObservation.eventLogDigest, handoff.reopenAuthority.eventLogDigest);
  assert.deepEqual(freshObservation, sourceObservation);
});

test("T-287 R6 F_H continuation failure rolls back the complete pending hold suffix in memory and durable reopen", async (context) => {
  let control;
  await assert.rejects(
    () => executeTestGraph(
      context,
      retryFhPublication,
      {
        prepareStore({ environment }) {
          const path = fileURLToPath(environment.durablePrefix.eventLogRef);
          const nativeReadAll = environment.store.readAll.bind(environment.store);
          control = {
            environment,
            injected: false,
            path,
            stagedEventRefs: [],
            stagedKinds: [],
            bytesAtInjection: null,
            nativeReadAll,
          };
          Object.defineProperty(environment.store, "readAll", {
            configurable: true,
            value() {
              const events = nativeReadAll();
              const heldRoute = events.find((event) =>
                event.kind === "traversal_route_admitted" &&
                event.payload.routeKind === "hold");
              if (!control.injected && heldRoute !== undefined) {
                const durableAtInjection = durableEvents(path);
                const durableEventRefs = new Set(
                  durableAtInjection.map((event) => event.eventId),
                );
                const staged = events.filter((event) =>
                  !durableEventRefs.has(event.eventId));
                control.injected = true;
                control.stagedEventRefs = staged.map((event) => event.eventId);
                control.stagedKinds = staged.map((event) => event.kind);
                control.bytesAtInjection = readFileSync(path, "utf8");
                throw new TypeError(
                  "injected failure before F_H continuation open",
                );
              }
              return events;
            },
          });
        },
      },
    ),
    /injected failure before F_H continuation open/u,
  );
  assert.equal(control.injected, true);
  assert.deepEqual(control.stagedKinds, [
    "c_call_evidenced",
    "c_call_result_admitted",
    "c_call_judged",
    "traversal_route_admitted",
  ], "pending CCall truth and its hold route share one staged suffix");
  const inMemory = control.nativeReadAll();
  assert.equal(inMemory.some((event) =>
    control.stagedEventRefs.includes(event.eventId)), false,
  "the failed outer transaction leaves no staged suffix in memory");
  assert.equal(readFileSync(control.path, "utf8"), control.bytesAtInjection,
    "the failed outer transaction appends no partial durable suffix");

  const handoff = control.environment.store.projectReopenAuthorityAndClose();
  const reopened = control.environment.abg.reopenEventStore(
    handoff.reopenAuthority,
    handoff.prefix,
  );
  assert.equal(reopened.kind, "reopened_event_store_context",
    JSON.stringify(reopened));
  assert.equal(reopened.store.readAll().some((event) =>
    control.stagedEventRefs.includes(event.eventId)), false,
  "durable reopen contains none of the rolled-back pending hold suffix");
  reopened.store.closeDurableLog();
});

test("T-287 F10 F_H successor enters retry through its exact route and durable input", async (context) => {
  const execution = await executeTestGraph(context, fhThenRetryPublication);
  assert.equal(execution.completion.disposition, "closed",
    JSON.stringify(execution.completion));
  const resume = execution.events.find((event) =>
    event.kind === "fh_interaction_resume_admitted");
  assert.ok(resume);
  const attempts = execution.events.filter((event) =>
    event.kind === "retry_attempt_opened" &&
    event.payload.inputRef === resume.payload.successorInputRef &&
    event.payload.inputDigest === resume.payload.successorInputDigest &&
    event.payload.inputContractRef ===
      resume.payload.successorInputContractRef);
  assert.equal(attempts.length, 1,
    "carrier-preserving F_H descent admits one retry origin");
  const attempt = attempts[0];
  assert.equal(attempt.payload.inputRef, resume.payload.successorInputRef);
  assert.equal(attempt.payload.inputDigest,
    resume.payload.successorInputDigest);
  assert.equal(attempt.payload.inputContractRef,
    resume.payload.successorInputContractRef);
  assert.deepEqual(attempt.payload.inputValue,
    resume.payload.successorInputValue);
  assert.equal(Object.hasOwn(attempt.payload, "inputValueKind"), false);
  assert.equal(Object.hasOwn(attempt.payload, "inputSourceEventRef"), false);
  assert.equal(attempt.causationEventRefs.length, 1);
  assert.notEqual(attempt.causationEventRefs[0], resume.eventId);
  const projected = execution.environment.abg.projectRetryAttempt(
    execution.environment.abg.selectValidatedRuntimeEventPrefix(
      execution.events,
    ),
    execution.graph,
    attempt.eventId,
  );
  assert.equal(projected?.inputRef, resume.payload.successorInputRef);
  assert.equal(projected?.inputDigest, resume.payload.successorInputDigest);
  assert.deepEqual(projected?.inputValue,
    resume.payload.successorInputValue);
  const currentRouteEventRef = attempt.causationEventRefs[0];
  const opened = execution.events.find((event) =>
    event.kind === "fh_interaction_opened");
  assert.ok(opened);
  const attemptCausationForgeries = [
    {
      causationEventRefs: [resume.eventId, currentRouteEventRef],
      eventContractRefusal: false,
    },
    {
      causationEventRefs: [currentRouteEventRef, opened.eventId],
      eventContractRefusal: false,
    },
    {
      causationEventRefs: [
        currentRouteEventRef,
        resume.eventId,
        resume.eventId,
      ],
      eventContractRefusal: true,
    },
    {
      causationEventRefs: [
        currentRouteEventRef,
        resume.eventId,
        opened.eventId,
      ],
      eventContractRefusal: false,
    },
  ];
  for (const forgery of attemptCausationForgeries) {
    if (forgery.eventContractRefusal) {
      await assert.rejects(
        () => forgeValidatedPrefixAt(
          execution,
          attempt.eventId,
          { causationEventRefs: forgery.causationEventRefs },
        ),
        /causation refs must be unique/u,
        "the root event contract rejects duplicate retry-attempt causes",
      );
      continue;
    }
    const forgedAttempt = await forgeValidatedPrefixAt(
      execution,
      attempt.eventId,
      {
        causationEventRefs: forgery.causationEventRefs,
      },
    );
    assert.equal(
      execution.environment.abg.projectRetryAttempt(
        forgedAttempt.prefix,
        execution.graph,
        forgedAttempt.admitted.eventId,
      ),
      null,
      "retry attempt projection rejects every substituted, duplicate, or extra route cause",
    );
  }
});

test("T-287 F10 batch-transformed F_H successor refuses before retry route or attempt", async (context) => {
  const execution = await executeTestGraph(
    context,
    deferredFhThenRetryPublication,
  );
  assert.equal(execution.completion.disposition, "advanced");
  assert.ok(execution.completion.nextCursor);
  const { abg, hog, product } = execution.environment;
  const resume = execution.events.find((event) =>
    event.kind === "fh_interaction_resume_admitted");
  assert.ok(resume);
  const step = hog.traverseFromCursor({
    program: execution.program,
    graph: execution.graph,
    graphValidation: execution.traversalExecutionInput.graphValidation,
    executionBasis: execution.execution.executionBasis,
    openedTraversalScope: execution.opened.scope,
  }, execution.completion.nextCursor);
  assert.equal(step.kind, "traversal_step");
  assert.equal(step.directStep.stepKind, "retry");
  const transformedValue = {
    ...structuredClone(resume.payload.successorInputValue),
    batchMaterializationOrdinal: 0,
  };
  assert.notEqual(product.sha256Canonical(transformedValue),
    resume.payload.successorInputDigest);
  const store = execution.traversalExecutionInput.store;
  const beforeEvents = store.readAll();
  const beforeDigest = store.digest();
  const retryRouteCount = beforeEvents.filter((event) =>
    event.kind === "traversal_route_admitted" &&
    event.payload.routeKind === "retry").length;
  const attemptCount = beforeEvents.filter((event) =>
    event.kind === "retry_attempt_opened").length;
  const refusal = hog.advanceStructuralTraversal({
    store,
    program: execution.program,
    graph: execution.graph,
    graphValidation: execution.traversalExecutionInput.graphValidation,
    executionBasis: execution.execution.executionBasis,
    openedTraversalScope: execution.opened.scope,
    initial: step,
    inputValue: transformedValue,
    inputAuthority: execution.traversalExecutionInput.leafPort,
    clock: {
      eventTime: "2026-08-07T00:00:00.000Z",
      correlationId: "correlation://t287/f10/fh-batch-transform",
    },
  });
  assert.equal(refusal.kind, "retry_admission_refusal",
    JSON.stringify(refusal));
  assert.equal(refusal.code, "basis_mismatch");
  assert.deepEqual(store.readAll(), beforeEvents);
  assert.equal(store.digest(), beforeDigest);
  assert.equal(store.readAll().filter((event) =>
    event.kind === "traversal_route_admitted" &&
    event.payload.routeKind === "retry").length, retryRouteCount);
  assert.equal(store.readAll().filter((event) =>
    event.kind === "retry_attempt_opened").length, attemptCount);
  assert.equal(abg.projectRetryAttempt(
    abg.selectValidatedRuntimeEventPrefix(store.readAll()),
    execution.graph,
    resume.eventId,
  ), null);
});

test("T-287 F10 successor-carrier derivation refuses a same-coordinate non-F_H leaf without effects", async (context) => {
  const execution = await executeTestGraph(context, retryIdentityPublication);
  const { hog } = execution.environment;
  const directInput = {
    program: execution.program,
    graph: execution.graph,
    graphValidation: execution.traversalExecutionInput.graphValidation,
    executionBasis: execution.execution.executionBasis,
    openedTraversalScope: execution.opened.scope,
  };
  const rootStep = hog.traverse(directInput);
  assert.equal(rootStep.kind, "traversal_step");
  assert.ok(rootStep.targetCursor);
  const outerRetryStep = hog.deriveTraversalStep(
    execution.graph,
    rootStep.targetCursor,
  );
  assert.equal(outerRetryStep.kind, "traversal_step");
  assert.ok(outerRetryStep.targetCursor);
  const innerRetryStep = hog.deriveTraversalStep(
    execution.graph,
    outerRetryStep.targetCursor,
  );
  assert.equal(innerRetryStep.kind, "traversal_step");
  assert.ok(innerRetryStep.targetCursor);
  const identityStep = hog.deriveTraversalStep(
    execution.graph,
    innerRetryStep.targetCursor,
  );
  assert.equal(identityStep.kind, "traversal_step");
  assert.ok(identityStep.targetCursor);
  const source = hog.resolveCProgramTermAtPath(
    execution.graph.template,
    {
      nodeRef: identityStep.targetCursor.currentNodeRef,
      termPath: identityStep.targetCursor.termPath,
      taskOrdinal: identityStep.targetCursor.taskOrdinal,
      attempt: identityStep.targetCursor.attempt,
      retryPath: identityStep.targetCursor.retryPath,
    },
  );
  assert.equal(source.kind, "c_of");
  assert.equal(source.fibre, "F_D");
  const store = execution.traversalExecutionInput.store;
  const beforeEvents = store.readAll();
  const beforeDigest = store.digest();
  assert.throws(
    () => hog.deriveInteractionSuccessorInputCarrierRef(
      execution.graph,
      identityStep.targetCursor,
    ),
    /exact held c_of F_H interaction term/u,
  );
  assert.deepEqual(store.readAll(), beforeEvents);
  assert.equal(store.digest(), beforeDigest);
});

test("T-287 R6 nested structural identity exits both retry depths without fabricating CCall truth", async (context) => {
  const execution = await executeTestGraph(context, retryIdentityPublication);
  const { completed } = assertNestedSuccessfulRetryExit(
    execution,
    "structural_identity_success",
  );
  for (const progress of completed) {
    assert.deepEqual(
      Object.keys(progress.payload).filter((key) =>
        ["cCallRef", "resultRef", "judgmentRef"].includes(key)),
      [],
      "structural progress carries no fabricated CCall outcome",
    );
  }
  const witness = execution.events.find((event) =>
    event.eventId === completed[0].payload.completionWitnessEventRef);
  assert.ok(witness);
  assert.deepEqual(
    [
      witness.runId,
      witness.graphCallId,
      witness.frameId,
      witness.materializationRef,
    ],
    [
      completed[0].runId,
      completed[0].graphCallId,
      completed[0].frameId,
      completed[0].materializationRef,
    ],
  );

  const forged = await forgeEventAt(execution, completed[0].eventId, {
    materializationRef: "graph-materialization://t287/forged-cross-scope",
  });
  const forgedPrefix = execution.environment.abg
    .selectValidatedRuntimeEventPrefix(forged.forgedStore.readAll());
  const completionAttempt = execution.events.find((event) =>
    event.kind === "retry_attempt_opened" &&
    event.eventId === completed[0].causationEventRefs[0]);
  assert.ok(completionAttempt);
  const completionCursor = retryAttemptCursorForEvent(
    execution,
    completionAttempt,
  );
  assert.equal(
    exactDeclaredRetryOwner(
      execution,
      forgedPrefix,
      completionCursor,
      forged.admitted,
    ),
    null,
    "a cursor witness from another materialization cannot enter the declared retry owner",
  );
});

test("T-287 R6 post-staging route refusal rolls back both nested progress rows in memory and durable reopen", async (context) => {
  let control;
  const execution = await executeTestGraph(
    context,
    retryFanOutPublication,
    {
      prepareStore({ environment }) {
        const path = fileURLToPath(environment.durablePrefix.eventLogRef);
        const nativeReadAll = environment.store.readAll.bind(environment.store);
        control = {
          environment,
          injected: false,
          path,
          stagedEventRefs: [],
          stagedProgressRefs: [],
          durableProgressAtInjection: [],
          nativeReadAll,
        };
        Object.defineProperty(environment.store, "readAll", {
          configurable: true,
          value() {
            const events = nativeReadAll();
            const staged = events.filter((event) =>
              event.kind === "retry_progress_recorded" &&
              event.payload.progressClass === "completed" &&
              event.payload.completionClass === "fan_out_success");
            if (!control.injected && staged.length >= 2) {
              control.injected = true;
              control.stagedEventRefs = staged.map((event) => event.eventId);
              control.stagedProgressRefs = staged.map((event) =>
                event.payload.progressRef);
              control.durableProgressAtInjection = durableEvents(path).filter(
                (event) => event.kind === "retry_progress_recorded" &&
                  event.payload.progressClass === "completed",
              );
              return Object.freeze(events.filter((event) =>
                !control.stagedEventRefs.includes(event.eventId)));
            }
            return events;
          },
        });
      },
    },
  );
  assert.equal(control.injected, true,
    "the falsifier intervenes only after both progress rows are staged");
  assert.equal(control.stagedProgressRefs.length, 2);
  assert.deepEqual(control.durableProgressAtInjection, [],
    "uncommitted transaction rows never reach the durable log");
  assert.equal(execution.completion.disposition, "failed");
  const inMemory = control.nativeReadAll();
  assert.equal(inMemory.some((event) =>
    control.stagedEventRefs.includes(event.eventId)), false);
  assert.equal(inMemory.some((event) =>
    event.kind === "traversal_route_admitted" &&
    control.stagedProgressRefs.some((ref) =>
      event.payload.consumedAvailabilityRefs.includes(ref))), false);

  const handoff = control.environment.store.projectReopenAuthorityAndClose();
  const reopened = control.environment.abg.reopenEventStore(
    handoff.reopenAuthority,
  );
  assert.equal(reopened.kind, "reopened_event_store_context",
    JSON.stringify(reopened));
  const durable = reopened.store.readAll();
  assert.equal(durable.some((event) =>
    control.stagedEventRefs.includes(event.eventId)), false);
  assert.equal(durable.some((event) =>
    event.kind === "traversal_route_admitted" &&
    control.stagedProgressRefs.some((ref) =>
      event.payload.consumedAvailabilityRefs.includes(ref))), false);
  reopened.store.closeDurableLog();
});
