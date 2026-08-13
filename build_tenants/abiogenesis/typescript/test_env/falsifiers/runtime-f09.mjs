import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { copyFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";

import { prepareAxF09RetryProduct } from "./runtime-f09-product.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const execFileAsync = promisify(execFile);

function passedControl(controlId, observed) {
  return { controlId, observed, passed: true };
}

function caseRecord(caseId, expected, observed, passed) {
  assert.equal(passed, true, `${caseId}: ${JSON.stringify(observed)}`);
  return { caseId, expected, observed, passed };
}

function runJsonWorker(workerPath, cwd, input) {
  return new Promise((resolve, reject) => {
    const child = execFile(
      process.execPath,
      [workerPath],
      {
        cwd,
        env: { ...process.env, NODE_OPTIONS: "" },
        encoding: "utf8",
        maxBuffer: 40 * 1024 * 1024,
        timeout: 120_000,
      },
      (error, stdout, stderr) => {
        if (error !== null) {
          reject(
            new Error(
              `AX-F09 worker failed (${String(error.code)}): ${stderr}\n${stdout}`,
            ),
          );
          return;
        }
        try {
          resolve(JSON.parse(stdout));
        } catch (parseError) {
          reject(
            new Error(
              `AX-F09 worker returned invalid JSON: ${String(parseError)}\n${stdout}\n${stderr}`,
            ),
          );
        }
      },
    );
    child.stdin.end(JSON.stringify(input));
  });
}

export async function runAxF09Aba({ harness, packageRoot }) {
  const workerPath = join(harness.cliHost, "runtime-f09-worker.mjs");
  const fixture = await prepareAxF09RetryProduct(
    packageRoot,
    harness.scratch,
    { retryBudget: 4 },
  );
  await execFileAsync(
    "npm",
    [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--offline",
      fixture.artifactPath,
    ],
    { cwd: harness.cliHost, maxBuffer: 20 * 1024 * 1024 },
  );
  await copyFile(join(here, "runtime-f09-worker.mjs"), workerPath);
  let produced;
  try {
    produced = await runJsonWorker(workerPath, harness.cliHost, {
      action: "produce_aba",
      packageRoot,
      supportPath: join(
        packageRoot,
        "test_env/support/root-installed-environment.mjs",
      ),
      fixtureArtifactPath: fixture.artifactPath,
      fixtureArtifactRef: fixture.artifactRef,
      fixtureBasis: fixture.basis,
      retryBudget: 4,
    });
    assert.equal(produced.action, "produce_aba");
    const fixtureOwner = await import(pathToFileURL(join(
      harness.cliHost,
      "node_modules/@abiogenesis-fixtures/developer-mini-product/build/index.js",
    )).href);
    const ids = fixtureOwner.AX_F09_RETRY_IDS;
    assert.notEqual(ids, undefined);
    const programs = fixture.publication.programs.filter(
      (candidate) => candidate.programRef === ids.programRef,
    );
    assert.equal(programs.length, 1);
    const [program] = programs;
    const starts = program.starts.filter((candidate) =>
      candidate.startRef === ids.startRef &&
      candidate.graphFunctionRef === ids.graphFunctionRef);
    assert.equal(starts.length, 1);
    const parentGraphFunctions = fixture.publication.graphFunctions.filter(
      (candidate) => candidate.name === ids.graphFunctionRef,
    );
    assert.equal(parentGraphFunctions.length, 1);
    const [parentGraphFunction] = parentGraphFunctions;
    const parentNodes = parentGraphFunction.template.nodes.filter(
      (candidate) => candidate.nodeRef === ids.nodeRef,
    );
    assert.equal(parentNodes.length, 1);
    const [parentNode] = parentNodes;
    assert.equal(parentNode.term.kind, "c_compose");
    const workflows = parentNode.term.terms.filter((term) =>
      term.kind === "c_workflow" &&
      term.graphFunctionRef === ids.childGraphFunctionRef);
    assert.equal(workflows.length, 1);
    const [workflow] = workflows;
    const childGraphFunctions = fixture.publication.graphFunctions.filter(
      (candidate) => candidate.name === ids.childGraphFunctionRef,
    );
    assert.equal(childGraphFunctions.length, 1);
    const [childGraphFunction] = childGraphFunctions;
    assert.equal(workflow.graphFunctionRef, childGraphFunction.name);
    const childNodes = childGraphFunction.template.nodes.filter(
      (candidate) => candidate.nodeRef === ids.childNodeRef,
    );
    assert.equal(childNodes.length, 1);
    const [childNode] = childNodes;
    assert.equal(childNode.term.kind, "c_compose");
    const childFhTerms = childNode.term.terms.filter((term) =>
      term.kind === "c_of" &&
      term.fibre === "F_H" &&
      term.programLocusRef === ids.childLocusRef);
    assert.equal(childFhTerms.length, 1);
    const [childFhTerm] = childFhTerms;
    assert.deepEqual(produced.audit.attemptOrdinals, [1, 2, 3, 4]);
    assert.deepEqual(produced.audit.failureProgressOrdinals, [1, 2, 3]);
    assert.deepEqual(produced.audit.failureClasses, [
      "contract_failure",
      "contract_failure",
      "contract_failure",
    ]);
    assert.equal(produced.audit.failureSignals[0],
      produced.audit.failureSignals[2]);
    assert.notEqual(produced.audit.failureSignals[0],
      produced.audit.failureSignals[1]);
    assert.equal(produced.audit.workerCount, 4);
    assert.equal(produced.audit.stoppedProgressCount, 0);
    assert.equal(produced.audit.attemptFourDispatchReached, true);
    assert.equal(produced.audit.attemptFourResultClass, "success");
    assert.equal(produced.audit.attemptFourJudgment, "advance");
    assert.equal(produced.audit.attemptFourCompletedProgressCount, 1);
    assert.equal(
      produced.audit.attemptFourCompletedProgressClass,
      "judged_success",
    );
    assert.equal(produced.audit.attemptFourCompletedRetryDepth, 1);
    assert.equal(
      produced.audit.attemptFourCompletedProgressCoordinatesExact,
      true,
    );
    assert.equal(produced.audit.attemptFourAdvanceRouteCount, 1);
    assert.equal(produced.audit.attemptFourRouteKind, "advance");
    assert.equal(produced.audit.attemptFourRouteCoordinatesExact, true);
    assert.equal(produced.audit.attemptFourRouteToAuthoredWorkflow, true);
    assert.equal(produced.audit.attemptFourConsumedRefsExact, true);
    assert.equal(produced.audit.attemptFourTerminalRouteCount, 0);
    assert.equal(produced.audit.rootClosureCount, 0);
    assert.equal(
      produced.audit.childFhGraphFunctionRef,
      childGraphFunction.name,
    );
    assert.equal(
      produced.audit.childFhProgramLocusRef,
      childFhTerm.programLocusRef,
    );
    assert.equal(produced.audit.childFhCCallCount, 1);
    assert.equal(produced.audit.childFhHoldRouteCount, 1);
    assert.equal(produced.audit.childFhRouteKind, "hold");
    assert.equal(produced.audit.childFhHoldCoordinatesExact, true);
    assert.equal(produced.audit.childFhContinuationCount, 1);
    assert.equal(produced.audit.disposition, "held");
    assert.equal(produced.audit.parentSuspensionCount, 1);
    assert.equal(
      produced.audit.parentSuspensionKind,
      "held_workflow_suspension",
    );
    assert.equal(
      produced.audit.parentGraphFunctionRef,
      parentGraphFunction.name,
    );
    assert.equal(
      produced.audit.childGraphFunctionRef,
      childGraphFunction.name,
    );
    assert.equal(produced.audit.parentChildInputDigestExact, true);
    assert.equal(
      produced.audit.parentChildExecutionBasisLineageExact,
      true,
    );
    assert.equal(
      produced.audit.parentChildTraversalScopeLineageExact,
      true,
    );
    assert.equal(produced.audit.parentWorkflowRouteTargetExact, true);
    assert.equal(produced.audit.parentWorkflowRouteCount, 0);
    assert.equal(produced.audit.heldReplayStatus, "held");
    assert.equal(produced.audit.heldReplayExact, true);
    return produced.audit;
  } finally {
    if (typeof produced?.cleanupRoot === "string") {
      await rm(produced.cleanupRoot, { force: true, recursive: true });
    }
  }
}

export async function runAxF09({ harness, packageRoot }) {
  const workerPath = join(harness.cliHost, "runtime-f09-worker.mjs");
  const fixture = await prepareAxF09RetryProduct(packageRoot, harness.scratch);
  await execFileAsync(
    "npm",
    [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--offline",
      fixture.artifactPath,
    ],
    { cwd: harness.cliHost, maxBuffer: 20 * 1024 * 1024 },
  );
  await copyFile(join(here, "runtime-f09-worker.mjs"), workerPath);

  let producer;
  try {
    producer = await runJsonWorker(workerPath, harness.cliHost, {
      action: "produce_frontier",
      packageRoot,
      supportPath: join(
        packageRoot,
        "test_env/support/root-installed-environment.mjs",
      ),
      fixtureArtifactPath: fixture.artifactPath,
      fixtureArtifactRef: fixture.artifactRef,
      fixtureBasis: fixture.basis,
    });
    assert.equal(producer.action, "produce_frontier");

    const consumer = await runJsonWorker(workerPath, harness.cliHost, {
      action: "inspect_frontier",
      handoff: producer.handoff,
    });
    assert.equal(consumer.action, "inspect_frontier");

    const processesAreDistinct = producer.pid !== consumer.pid;
    const restartedProjectionAudit = {
      d17Disposition: consumer.audit.d17Disposition,
      d17ProjectionRef: consumer.audit.d17ProjectionRef,
      d17ProjectionDigest: consumer.audit.d17ProjectionDigest,
      d17FrontierRowIdentities: consumer.audit.d17FrontierRowIdentities,
      scopedRetryFluentCanonical: consumer.audit.scopedRetryFluentCanonical,
    };
    const retainedAndRestartedInspectionEqual =
      JSON.stringify(producer.retainedAudit) ===
        JSON.stringify(restartedProjectionAudit);
    const producerAuthentic =
      producer.audit.retryBudget === 3 &&
      JSON.stringify(producer.audit.attemptOrdinals) === "[1,2]" &&
      JSON.stringify(producer.audit.progressOrdinals) === "[1,2]" &&
      JSON.stringify(producer.audit.failureClasses) ===
        '["no_output","contract_failure"]' &&
      JSON.stringify(producer.audit.retryPaths) === "[[1],[2]]" &&
      JSON.stringify(producer.audit.completedAttemptCoverage) ===
        "[[1],[1,2]]" &&
      producer.audit.failureSignalsDistinct === true &&
      producer.audit.cCallIdentityCount === 2 &&
      producer.audit.completeCCallHistories === true &&
      producer.audit.retryRouteCount === 2 &&
      producer.audit.secondProgressIsSoleHeldRetryFluent === true &&
      producer.audit.effectCount === 2 &&
      producer.audit.workerCount === 2 &&
      producer.audit.secondProgressIsDurableTail === true &&
      producer.audit.attemptThreeAbsent === true &&
      producer.audit.attemptThreeRouteAbsent === true &&
      producer.audit.attemptThreeCCallAbsent === true &&
      producer.audit.attemptThreeEffectAbsent === true &&
      producer.audit.graphEntryAndRetryInputDistinct === true &&
      producer.audit.initialEntryMismatchExactDiagnosticAndZeroAppend ===
        true &&
      producer.audit.projectedResumeControls
          .forgedGraphValidationRefusedPurely === true &&
      producer.audit.projectedResumeControls
          .malformedEventTimeRefusedPurely === true &&
      producer.audit.projectedResumeControls
          .stalePrefixRefusedWithoutMutation === true &&
      producer.audit.projectedResumeControls
          .routeFailureRolledBack === true &&
      producer.audit.projectedResumeControls
          .attemptFailureRolledBackRoute === true &&
      producer.audit.projectedResumeControls
          .cyclicCarrierMappedToExactDiagnostic === true &&
      producer.audit.projectedResumeControls
          .projectedXorRejectsRawIngress === true &&
      producer.audit.projectedResumeControls
          .unrelatedRunTailSubstitutionRefused === true &&
      producer.audit.attemptInputCoverage.everyAttemptInputPreimageExact ===
        true;
    const handoffIsClosed =
      producer.audit.exactHandoffKeys === true &&
      producer.audit.handoffContainsInputValue === false &&
      producer.audit.retainedAuditContainsInputValue === false;
    const completeDurablePrefixWasExamined =
      producer.audit.durableRowsEqualClosedStore === true &&
      producer.audit.completeDurablePrefixScanned === true &&
      producer.audit.durablePrefixContainsNonce === true &&
      producer.audit.durablePrefixContainsCanonicalInputPreimage === true;
    const consumerReconstructedDependencies =
      consumer.audit.exactInputKeys === true &&
      consumer.audit.selectedFrontierCount === 1 &&
      consumer.audit.selectedFrontierRefsAndDigestVerified === true &&
      JSON.stringify(consumer.audit.attemptOrdinals) === "[1,2]" &&
      JSON.stringify(consumer.audit.progressOrdinals) === "[1,2]" &&
      JSON.stringify(consumer.audit.failureClasses) ===
        '["no_output","contract_failure"]' &&
      consumer.audit.dependenciesMatchBasis === true &&
      consumer.audit.payloadInventoryVerified === true &&
      consumer.audit.semanticPublicationVerified === true &&
      consumer.audit.installedDeclarationsImmutable === true &&
      consumer.audit.materializedGraphImmutable === true &&
      consumer.audit.exportedDeclarationsMatchPublication === true &&
      consumer.audit.installedContractsVerified === true &&
      consumer.audit.implementationDependencyVerified === true &&
      consumer.audit.executionDependenciesVerified === true &&
      consumer.audit.installedDeclarationExportPresent === true &&
      consumer.audit.retryBudget === 3 &&
      consumer.audit.attemptInputCoverage.everyAttemptInputPreimageExact ===
        true &&
      consumer.audit.attemptRouteCursorBinding
          .sourceCursorBoundThroughCitedRetryRoute === true;
    const lawfulDurableRetrySources =
      producer.audit.attemptInputCoverage.everyAttemptInputPreimageExact ===
        true &&
      producer.audit.attemptRouteCursorBinding
          .sourceCursorBoundThroughCitedRetryRoute === true &&
      producer.audit.attemptRouteCursorBinding
          .duplicateCursorPayloadAbsent === true &&
      producer.audit.compactRetryProgress.compactProgressCoverageLawful ===
        true &&
      producer.audit.compactRetryProgress.storedFullFrontierCarrierPresent ===
        false &&
      consumer.audit.attemptInputCoverage.everyAttemptInputPreimageExact ===
        true &&
      consumer.audit.attemptRouteCursorBinding
          .sourceCursorBoundThroughCitedRetryRoute === true &&
      consumer.audit.attemptRouteCursorBinding
          .duplicateCursorPayloadAbsent === true &&
      consumer.audit.compactRetryProgress.compactProgressCoverageLawful ===
        true &&
      consumer.audit.compactRetryProgress.storedFullFrontierCarrierPresent ===
        false &&
      consumer.audit.completeDurablePrefixContainsCanonicalInputPreimage ===
        true &&
      completeDurablePrefixWasExamined;
    const installedD17D18Suffix =
      consumer.audit.targetSuffixCoordinatesExact === true &&
      consumer.audit.targetSuffixDependenciesReady === true &&
      consumer.audit.targetSuffixDisposition ===
        "installed_suffix_available" &&
      consumer.audit.projectorExportPresent === true &&
      consumer.audit.retryAttemptFrontierTypeExportPresent === true &&
      consumer.audit.executableRetryInputTypeExportPresent === true &&
      consumer.audit.fullFrontierAssertionExportPresent === true &&
      consumer.audit.resumeExportPresent === true &&
      consumer.audit.d17Disposition === "projected" &&
      consumer.audit.d17FrontierRowIdentities.length === 2 &&
      consumer.audit.scopedRetryFluentCanonical.length === 2 &&
      consumer.audit.d18Disposition === "resumed" &&
      consumer.audit.d18AtomicTailBound === true &&
      Object.values(consumer.audit.projectedBranchControls)
        .every((value) => value === true) &&
      JSON.stringify(consumer.audit.finalAttemptOrdinals) === "[1,2,3]" &&
      consumer.audit.finalEffectCount === 3 &&
      consumer.audit.finalWorkerCount === 3 &&
      consumer.audit.finalCompletionDisposition === "held" &&
      consumer.audit.finalRuntimeStatus === "held" &&
      consumer.audit.finalHeldRuntimeStatus === "held" &&
      consumer.audit.graphEntryAndRetryInputDistinct === true &&
      consumer.audit.parentGraphInputReconstructedFromBasis === true &&
      consumer.audit.parentRetryInputRemainsTransformed === true &&
      consumer.audit.childBasisInputComesFromRetryLocus === true;

    assert.equal(processesAreDistinct, true);
    assert.equal(
      retainedAndRestartedInspectionEqual,
      true,
      JSON.stringify({ retained: producer.retainedAudit, restarted: consumer.audit }),
    );
    assert.equal(producerAuthentic, true, JSON.stringify(producer.audit));
    assert.equal(handoffIsClosed, true, JSON.stringify(producer.audit));
    assert.equal(
      completeDurablePrefixWasExamined,
      true,
      JSON.stringify(producer.audit),
    );
    assert.equal(
      consumerReconstructedDependencies,
      true,
      JSON.stringify(consumer.audit),
    );
    assert.equal(lawfulDurableRetrySources, true,
      JSON.stringify({ producer: producer.audit, consumer: consumer.audit }));
    assert.equal(installedD17D18Suffix, true,
      JSON.stringify(consumer.audit));

    const observed = {
      processesAreDistinct,
      retainedAndRestartedInspectionEqual,
      producer: {
        retryBudget: producer.audit.retryBudget,
        attemptOrdinals: producer.audit.attemptOrdinals,
        progressOrdinals: producer.audit.progressOrdinals,
        failureClasses: producer.audit.failureClasses,
        retryPaths: producer.audit.retryPaths,
        completedAttemptCoverage:
          producer.audit.completedAttemptCoverage,
        failureSignalsDistinct: producer.audit.failureSignalsDistinct,
        cCallIdentityCount: producer.audit.cCallIdentityCount,
        completeCCallHistories:
          producer.audit.completeCCallHistories,
        retryRouteCount: producer.audit.retryRouteCount,
        secondProgressIsSoleHeldRetryFluent:
          producer.audit.secondProgressIsSoleHeldRetryFluent,
        effectCount: producer.audit.effectCount,
        workerCount: producer.audit.workerCount,
        secondProgressIsDurableTail:
          producer.audit.secondProgressIsDurableTail,
        attemptThreeAbsent: producer.audit.attemptThreeAbsent,
        attemptThreeRouteAbsent:
          producer.audit.attemptThreeRouteAbsent,
        attemptThreeCCallAbsent:
          producer.audit.attemptThreeCCallAbsent,
        attemptThreeEffectAbsent:
          producer.audit.attemptThreeEffectAbsent,
        attemptInputCoverage:
          producer.audit.attemptInputCoverage,
        attemptRouteCursorBinding:
          producer.audit.attemptRouteCursorBinding,
        compactRetryProgress:
          producer.audit.compactRetryProgress,
        projectedResumeControls:
          producer.audit.projectedResumeControls,
        exactHandoffKeys: producer.audit.exactHandoffKeys,
        handoffContainsInputValue: producer.audit.handoffContainsInputValue,
        retainedAuditContainsInputValue:
          producer.audit.retainedAuditContainsInputValue,
        durableRowsEqualClosedStore:
          producer.audit.durableRowsEqualClosedStore,
        completeDurablePrefixScanned:
          producer.audit.completeDurablePrefixScanned,
        durablePrefixContainsNonce:
          producer.audit.durablePrefixContainsNonce,
        durablePrefixContainsCanonicalInputPreimage:
          producer.audit.durablePrefixContainsCanonicalInputPreimage,
        graphEntryInputDigest: producer.audit.graphEntryInputDigest,
        transformedRetryInputDigest:
          producer.audit.transformedRetryInputDigest,
        graphEntryAndRetryInputDistinct:
          producer.audit.graphEntryAndRetryInputDistinct,
        initialEntryMismatchExactDiagnosticAndZeroAppend:
          producer.audit.initialEntryMismatchExactDiagnosticAndZeroAppend,
      },
      consumer: {
        exactInputKeys: consumer.audit.exactInputKeys,
        completeDurablePrefixEventCount:
          consumer.audit.completeDurablePrefixEventCount,
        selectedFrontierCount: consumer.audit.selectedFrontierCount,
        selectedFrontierRefsAndDigestVerified:
          consumer.audit.selectedFrontierRefsAndDigestVerified,
        attemptOrdinals: consumer.audit.attemptOrdinals,
        progressOrdinals: consumer.audit.progressOrdinals,
        failureClasses: consumer.audit.failureClasses,
        dependenciesMatchBasis: consumer.audit.dependenciesMatchBasis,
        payloadInventoryVerified:
          consumer.audit.payloadInventoryVerified,
        semanticPublicationVerified:
          consumer.audit.semanticPublicationVerified,
        installedDeclarationsImmutable:
          consumer.audit.installedDeclarationsImmutable,
        materializedGraphImmutable:
          consumer.audit.materializedGraphImmutable,
        exportedDeclarationsMatchPublication:
          consumer.audit.exportedDeclarationsMatchPublication,
        installedContractsVerified:
          consumer.audit.installedContractsVerified,
        implementationDependencyVerified:
          consumer.audit.implementationDependencyVerified,
        executionDependenciesVerified:
          consumer.audit.executionDependenciesVerified,
        installedDeclarationExportPresent:
          consumer.audit.installedDeclarationExportPresent,
        retryBudget: consumer.audit.retryBudget,
        attemptInputCoverage:
          consumer.audit.attemptInputCoverage,
        attemptRouteCursorBinding:
          consumer.audit.attemptRouteCursorBinding,
        compactRetryProgress:
          consumer.audit.compactRetryProgress,
        targetSuffixCoordinatesExact:
          consumer.audit.targetSuffixCoordinatesExact,
        targetSuffixDisposition:
          consumer.audit.targetSuffixDisposition,
        targetSuffixDependenciesReady:
          consumer.audit.targetSuffixDependenciesReady,
        projectorExportPresent: consumer.audit.projectorExportPresent,
        retryAttemptFrontierTypeExportPresent:
          consumer.audit.retryAttemptFrontierTypeExportPresent,
        executableRetryInputTypeExportPresent:
          consumer.audit.executableRetryInputTypeExportPresent,
        fullFrontierAssertionExportPresent:
          consumer.audit.fullFrontierAssertionExportPresent,
        resumeExportPresent: consumer.audit.resumeExportPresent,
        completeDurablePrefixContainsCanonicalInputPreimage:
          consumer.audit.completeDurablePrefixContainsCanonicalInputPreimage,
        d17Disposition: consumer.audit.d17Disposition,
        d17ProjectionRef: consumer.audit.d17ProjectionRef,
        d17ProjectionDigest: consumer.audit.d17ProjectionDigest,
        d17FrontierRowIdentities:
          consumer.audit.d17FrontierRowIdentities,
        scopedRetryFluentCanonical:
          consumer.audit.scopedRetryFluentCanonical,
        d18Disposition: consumer.audit.d18Disposition,
        d18AtomicTailBound: consumer.audit.d18AtomicTailBound,
        projectedBranchControls:
          consumer.audit.projectedBranchControls,
        finalAttemptOrdinals: consumer.audit.finalAttemptOrdinals,
        finalProgressOrdinals: consumer.audit.finalProgressOrdinals,
        finalEffectCount: consumer.audit.finalEffectCount,
        finalWorkerCount: consumer.audit.finalWorkerCount,
        finalCompletionDisposition:
          consumer.audit.finalCompletionDisposition,
        finalRuntimeStatus: consumer.audit.finalRuntimeStatus,
        finalHeldRuntimeStatus: consumer.audit.finalHeldRuntimeStatus,
        graphEntryInputDigest: consumer.audit.graphEntryInputDigest,
        projectedRetryInputDigest:
          consumer.audit.projectedRetryInputDigest,
        graphEntryAndRetryInputDistinct:
          consumer.audit.graphEntryAndRetryInputDistinct,
        parentGraphInputReconstructedFromBasis:
          consumer.audit.parentGraphInputReconstructedFromBasis,
        parentRetryInputRemainsTransformed:
          consumer.audit.parentRetryInputRemainsTransformed,
        childBasisInputComesFromRetryLocus:
          consumer.audit.childBasisInputComesFromRetryLocus,
        finalReplayDigest: consumer.audit.finalReplayDigest,
        finalEventCalculusCanonical:
          consumer.audit.finalEventCalculusCanonical,
      },
    };

    return {
      relationId: "AX-F09",
      disposition: "preserved_green",
      claim:
        "the admitted graph-entry value survives a real transform and two authentic retry failures, then a fresh process reconstructs D17/D18, executes attempt three at the transformed retry locus, and reaches a downstream hold whose parent graph input comes only from the rehydrated ExecutionBasis",
      ingress:
        "installed ./abg::projectExecutableRetryInput then ./hog::resumeProjectedRetry, followed by the exact projected executor branch",
      fixtureSource:
        "authored packed and installed test Product composing an F_D input transform, budget-three F_P retry, and downstream child F_H hold, with nonce graph-entry input, no-output attempt one, malformed-result attempt two, and unopened attempt three",
      processBoundary:
        "P1 durably admits two authentic failed attempts, projects the exact prefix, closes and exits; only the closed coordinate, selector, and expected D17 identity cross to fresh P2",
      mutation: {
        kind: "executor_exit_at_two_failure_retry_frontier",
        declaredRetryBudget: 3,
        priorAttemptOrdinals: [1, 2],
        priorFailureClasses: ["no_output", "contract_failure"],
        handoffFields: [
          "prefix",
          "reopenAuthority",
          "selector.runId",
          "selector.graphCallId",
          "selector.frameId",
          "selector.retryBoundaryRef",
          "selector.retryProgressRef",
          "expectedExecutableRetryInputRef",
          "expectedExecutableRetryInputDigest",
        ],
      },
      oracle: {
        targetDisposition: "projected_then_resumed",
        authenticProgressBeforeExit: true,
        noAttemptThreeBeforeExit: true,
        p2CanVerifyExactFrontierAndInstalledDependencies: true,
        p2CanRecoverCompleteFrontierAndExecutableInput: true,
        completeDurablePrefixContainsVerifiedExecutablePreimage: true,
        installedProjectorAndResumeExportsPresent: true,
        installedTargetSuffix: [
          "@abiogenesis/typescript-tenant/abg::projectExecutableRetryInput",
          "@abiogenesis/typescript-tenant/hog::resumeProjectedRetry",
        ],
        retainedAndRestartedUseExactInstalledD17D18Suffix: true,
        retainedAndRestartedProjectionCanonicalEquality: true,
        retainedAndRestartedCanonicalEqualitySubjects: [
          "complete ExecutableRetryInput",
          "complete two-row RetryAttemptFrontier",
          "retry route ref and digest",
          "next cursor ref and digest",
          "fresh attempt ref and digest",
          "attempt-three effect input",
          "final completion",
          "run-scoped Event Calculus projection",
          "run-scoped replay projection",
        ],
        executableRetryInputFields: [
          "kind",
          "schemaVersion",
          "disposition",
          "projectionRef",
          "projectionDigest",
          "durablePrefixDigest",
          "lastAdmissionOrdinal",
          "selector",
          "executionBasisRef",
          "executionBasisDigest",
          "traversalScopeRef",
          "traversalScopeDigest",
          "programRef",
          "programDigest",
          "graphFunctionRef",
          "graphFunctionDigest",
          "graphRef",
          "graphDigest",
          "retryFrontier",
          "selectedFrontierRowRef",
          "progressEventRef",
          "progress",
          "sourceAttemptEventRef",
          "sourceAttempt",
          "sourceCursor",
          "cCall",
          "inputContractRef",
          "inputRef",
          "inputDigest",
          "inputValue",
          "nextAttempt",
          "nextRetryPath",
        ],
        retryFrontier: {
          attemptCoverage: [1, 2],
          reasonClasses: ["contract_failure", "no_output"],
          ownerSurfaces: ["abg_c_call", "abg_retry"],
          sourceEventKinds: [
            "c_call_evidenced",
            "c_call_fibre_selected",
            "c_call_judged",
            "c_call_opened",
            "c_call_result_admitted",
            "retry_attempt_opened",
            "retry_progress_recorded",
          ],
          exactRowIdentityAndSourceSlots: true,
        },
        resumedSuffix: {
          nextAttempt: 3,
          nextRetryPath: [3],
          routeCursorAttemptAndEffectCanonicalEquality: true,
          consumedCurrentProgressCount: 1,
          finalAttemptOrdinals: [1, 2, 3],
          finalProgressOrdinals: [1, 2],
          finalLeafEffectCount: 3,
          downstreamCompletion: "held",
          parentGraphInputSource: "rehydrated_execution_basis_raw_value",
          parentRetryInputSource: "transformed_retry_locus",
          childBasisInputSource: "transformed_retry_locus",
        },
      },
      expectedBaselineSignature: {
        disposition: "preserved_green",
        retryAttemptPayloadPreimages: "present_and_exact_for_attempts_1_2",
        retryAttemptSourceCursorBinding: "exact_cited_retry_route",
        duplicateSourceCursorPayload: "absent",
        compactRetryProgress: "lawful_numeric_coverage",
        storedFullFrontierCarrier: "absent_by_design",
        installedD17ProjectorExport: "present",
        installedD17FrontierTypeExport: "present",
        installedD17ExecutableInputTypeExport: "present",
        installedD17FrontierAssertionExport: "present",
        installedD18ResumeExport: "present",
        installedTargetSuffixDisposition: "installed_suffix_available",
        retainedAndRestartedInspectionEqual: true,
      },
      observedSignature: observed,
      maskControls: [
        passedControl("two_authentic_owner_admitted_failures", {
          producerAuthentic,
        }),
        passedControl("strict_handoff_excludes_executable_carriers", {
          handoffIsClosed,
        }),
        passedControl("complete_durable_prefix_was_examined", {
          completeDurablePrefixWasExamined,
        }),
        passedControl("fresh_process_reconstructs_immutable_dependencies", {
          consumerReconstructedDependencies,
        }),
        passedControl("fresh_processes_are_distinct", {
          processesAreDistinct,
        }),
        passedControl("retained_and_restarted_baseline_inspection_equal", {
          retainedAndRestartedInspectionEqual,
        }),
      ],
      cases: [
        caseRecord(
          "authentic_two_failure_frontier",
          {
            attempts: [1, 2],
            progress: [1, 2],
            failures: ["no_output", "contract_failure"],
            retryPaths: [[1], [2]],
            completedAttemptCoverage: [[1], [1, 2]],
            distinctFailureSignals: true,
            distinctCCalls: 2,
            completeCCallHistories: true,
            retryRoutes: 2,
            soleHeldProgress: 2,
            effects: 2,
            attemptThree: "absent",
          },
          {
            attempts: producer.audit.attemptOrdinals,
            progress: producer.audit.progressOrdinals,
            failures: producer.audit.failureClasses,
            retryPaths: producer.audit.retryPaths,
            completedAttemptCoverage:
              producer.audit.completedAttemptCoverage,
            distinctFailureSignals:
              producer.audit.failureSignalsDistinct,
            distinctCCalls: producer.audit.cCallIdentityCount,
            completeCCallHistories:
              producer.audit.completeCCallHistories,
            retryRoutes: producer.audit.retryRouteCount,
            soleHeldProgress:
              producer.audit.secondProgressIsSoleHeldRetryFluent ? 2 : null,
            effects: producer.audit.effectCount,
            attemptThree:
              producer.audit.attemptThreeAbsent &&
                producer.audit.attemptThreeRouteAbsent &&
                producer.audit.attemptThreeCCallAbsent &&
                producer.audit.attemptThreeEffectAbsent
              ? "absent"
              : "present",
          },
          producerAuthentic,
        ),
        caseRecord(
          "strict_restart_handoff",
          { exactCoordinateOnly: true, executableCarrierPresent: false },
          {
            exactCoordinateOnly: producer.audit.exactHandoffKeys,
            executableCarrierPresent:
              producer.audit.handoffContainsInputValue ||
              producer.audit.retainedAuditContainsInputValue,
          },
          handoffIsClosed,
        ),
        caseRecord(
          "fresh_process_frontier_selection",
          {
            selectedRows: 1,
            selectedRefsAndDigestVerified: true,
            dependencyEquality: true,
            payloadInventoryVerified: true,
            semanticPublicationVerified: true,
            installedDeclarationsImmutable: true,
            materializedGraphImmutable: true,
            installedContractsVerified: true,
            implementationDependencyVerified: true,
            executionDependenciesVerified: true,
            installedDeclarationExport: true,
            attempts: [1, 2],
          },
          {
            selectedRows: consumer.audit.selectedFrontierCount,
            selectedRefsAndDigestVerified:
              consumer.audit.selectedFrontierRefsAndDigestVerified,
            dependencyEquality: consumer.audit.dependenciesMatchBasis,
            payloadInventoryVerified:
              consumer.audit.payloadInventoryVerified,
            semanticPublicationVerified:
              consumer.audit.semanticPublicationVerified,
            installedDeclarationsImmutable:
              consumer.audit.installedDeclarationsImmutable,
            materializedGraphImmutable:
              consumer.audit.materializedGraphImmutable,
            installedContractsVerified:
              consumer.audit.installedContractsVerified,
            implementationDependencyVerified:
              consumer.audit.implementationDependencyVerified,
            executionDependenciesVerified:
              consumer.audit.executionDependenciesVerified,
            installedDeclarationExport:
              consumer.audit.installedDeclarationExportPresent,
            attempts: consumer.audit.attemptOrdinals,
          },
          consumerReconstructedDependencies,
        ),
        caseRecord(
          "retained_process_control_matches_restart_inspection",
          { canonicalInspectionEqual: true },
          { canonicalInspectionEqual: retainedAndRestartedInspectionEqual },
          retainedAndRestartedInspectionEqual,
        ),
        caseRecord(
          "lawful_compact_durable_retry_sources",
          {
            attemptOrdinalsExact: true,
            everyAttemptHasRecordInputValue: true,
            everyCanonicalInputDigestExact: true,
            everyInputRefRelationExact: true,
            everyInputContractRelationExact: true,
            everyAttemptDigestCoversInputValue: true,
            attemptInputPreimagesExact: true,
            everyAttemptHasExactCitedRetryRoute: true,
            everyAttemptHasExactRouteCausedCCall: true,
            everyRouteCausedCCallMatchesTargetCursor: true,
            sourceCursorBoundThroughCitedRetryRoute: true,
            duplicateSourceCursorPayloadAbsent: true,
            compactProgressCoverageLawful: true,
            storedFullFrontierCarrierPresent: false,
            completeDurablePrefixScanned: true,
            noncePreimagePresentAnywhereInPrefix: true,
            canonicalInputPreimagePresentAnywhereInPrefix: true,
          },
          {
            attemptOrdinalsExact:
              consumer.audit.attemptInputCoverage.attemptOrdinalsExact,
            everyAttemptHasRecordInputValue:
              consumer.audit.attemptInputCoverage
                .everyAttemptHasRecordInputValue,
            everyCanonicalInputDigestExact:
              consumer.audit.attemptInputCoverage
                .everyCanonicalInputDigestExact,
            everyInputRefRelationExact:
              consumer.audit.attemptInputCoverage
                .everyInputRefRelationExact,
            everyInputContractRelationExact:
              consumer.audit.attemptInputCoverage
                .everyInputContractRelationExact,
            everyAttemptDigestCoversInputValue:
              consumer.audit.attemptInputCoverage
                .everyAttemptDigestCoversInputValue,
            attemptInputPreimagesExact:
              consumer.audit.attemptInputCoverage
                .everyAttemptInputPreimageExact,
            everyAttemptHasExactCitedRetryRoute:
              consumer.audit.attemptRouteCursorBinding
                .everyAttemptHasExactCitedRetryRoute,
            everyAttemptHasExactRouteCausedCCall:
              consumer.audit.attemptRouteCursorBinding
                .everyAttemptHasExactRouteCausedCCall,
            everyRouteCausedCCallMatchesTargetCursor:
              consumer.audit.attemptRouteCursorBinding
                .everyRouteCausedCCallMatchesTargetCursor,
            sourceCursorBoundThroughCitedRetryRoute:
              consumer.audit.attemptRouteCursorBinding
                .sourceCursorBoundThroughCitedRetryRoute,
            duplicateSourceCursorPayloadAbsent:
              consumer.audit.attemptRouteCursorBinding
                .duplicateCursorPayloadAbsent,
            compactProgressCoverageLawful:
              consumer.audit.compactRetryProgress
                .compactProgressCoverageLawful,
            storedFullFrontierCarrierPresent:
              consumer.audit.compactRetryProgress
                .storedFullFrontierCarrierPresent,
            completeDurablePrefixScanned:
              producer.audit.completeDurablePrefixScanned,
            noncePreimagePresentAnywhereInPrefix:
              producer.audit.durablePrefixContainsNonce,
            canonicalInputPreimagePresentAnywhereInPrefix:
              consumer.audit.completeDurablePrefixContainsCanonicalInputPreimage,
          },
          lawfulDurableRetrySources,
        ),
        caseRecord(
          "installed_d17_d18_suffix",
          {
            targetSuffixCoordinatesExact: true,
            targetSuffixDependenciesReady: true,
            targetSuffixDisposition: "installed_suffix_available",
            projectorExportPresent: true,
            retryAttemptFrontierTypeExportPresent: true,
            executableRetryInputTypeExportPresent: true,
            fullFrontierAssertionExportPresent: true,
            resumeExportPresent: true,
            d18Disposition: "resumed",
            projectedBranchControlsEventless: true,
            finalAttemptOrdinals: [1, 2, 3],
            finalProgressOrdinals: [1, 2],
            finalEffectCount: 3,
            finalCompletionDisposition: "held",
            finalRuntimeStatus: "held",
            finalHeldRuntimeStatus: "held",
            graphEntryAndRetryInputDistinct: true,
            parentGraphInputReconstructedFromBasis: true,
            parentRetryInputRemainsTransformed: true,
            childBasisInputComesFromRetryLocus: true,
          },
          {
            targetSuffixCoordinatesExact:
              consumer.audit.targetSuffixCoordinatesExact,
            targetSuffixDependenciesReady:
              consumer.audit.targetSuffixDependenciesReady,
            targetSuffixDisposition:
              consumer.audit.targetSuffixDisposition,
            projectorExportPresent: consumer.audit.projectorExportPresent,
            retryAttemptFrontierTypeExportPresent:
              consumer.audit.retryAttemptFrontierTypeExportPresent,
            executableRetryInputTypeExportPresent:
              consumer.audit.executableRetryInputTypeExportPresent,
            fullFrontierAssertionExportPresent:
              consumer.audit.fullFrontierAssertionExportPresent,
            resumeExportPresent: consumer.audit.resumeExportPresent,
            d18Disposition: consumer.audit.d18Disposition,
            projectedBranchControlsEventless:
              Object.values(consumer.audit.projectedBranchControls)
                .every((value) => value === true),
            finalAttemptOrdinals: consumer.audit.finalAttemptOrdinals,
            finalProgressOrdinals: consumer.audit.finalProgressOrdinals,
            finalEffectCount: consumer.audit.finalEffectCount,
            finalCompletionDisposition:
              consumer.audit.finalCompletionDisposition,
            finalRuntimeStatus: consumer.audit.finalRuntimeStatus,
            finalHeldRuntimeStatus: consumer.audit.finalHeldRuntimeStatus,
            graphEntryAndRetryInputDistinct:
              consumer.audit.graphEntryAndRetryInputDistinct,
            parentGraphInputReconstructedFromBasis:
              consumer.audit.parentGraphInputReconstructedFromBasis,
            parentRetryInputRemainsTransformed:
              consumer.audit.parentRetryInputRemainsTransformed,
            childBasisInputComesFromRetryLocus:
              consumer.audit.childBasisInputComesFromRetryLocus,
          },
          installedD17D18Suffix,
        ),
      ],
    };
  } finally {
    if (typeof producer?.cleanupRoot === "string") {
      await rm(producer.cleanupRoot, { force: true, recursive: true });
    }
  }
}
