import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { copyFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
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
    const retainedAndRestartedInspectionEqual =
      JSON.stringify(producer.retainedAudit) ===
        JSON.stringify(consumer.audit);
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
      producer.audit.preimagesHashToAttemptDigests === true;
    const handoffIsClosed =
      producer.audit.exactHandoffKeys === true &&
      producer.audit.handoffContainsInputValue === false;
    const completeDurablePrefixWasExamined =
      producer.audit.durableRowsEqualClosedStore === true &&
      producer.audit.completeDurablePrefixScanned === true &&
      producer.audit.durablePrefixContainsNonce === false &&
      producer.audit.durablePrefixContainsCanonicalInputPreimage === false;
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
      consumer.audit.retryBudget === 3;
    const missingDurableRetryBasis =
      producer.audit.attemptPayloadHasInputValue === false &&
      producer.audit.attemptPayloadHasSourceCursor === false &&
      consumer.audit.attemptPayloadHasInputValue === false &&
      consumer.audit.attemptPayloadHasSourceCursor === false &&
      consumer.audit.progressCarriesFullFrontier === false &&
      consumer.audit.currentProgressIsNumericCoverageOnly === true &&
      consumer.audit.completeDurablePrefixContainsCanonicalInputPreimage ===
        false &&
      consumer.audit.completeDurablePrefixHasNoExecutablePreimage === true &&
      completeDurablePrefixWasExamined;
    const missingInstalledSuffix =
      consumer.audit.targetSuffixCoordinatesExact === true &&
      consumer.audit.targetSuffixDependenciesReady === true &&
      consumer.audit.targetSuffixDisposition ===
        "installed_suffix_exports_absent" &&
      consumer.audit.projectorExportPresent === false &&
      consumer.audit.resumeExportPresent === false;

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
    assert.equal(missingDurableRetryBasis, true, JSON.stringify(consumer.audit));
    assert.equal(missingInstalledSuffix, true, JSON.stringify(consumer.audit));

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
        preimagesHashToAttemptDigests:
          producer.audit.preimagesHashToAttemptDigests,
        exactHandoffKeys: producer.audit.exactHandoffKeys,
        handoffContainsInputValue: producer.audit.handoffContainsInputValue,
        attemptPayloadHasInputValue:
          producer.audit.attemptPayloadHasInputValue,
        attemptPayloadHasSourceCursor:
          producer.audit.attemptPayloadHasSourceCursor,
        durableRowsEqualClosedStore:
          producer.audit.durableRowsEqualClosedStore,
        completeDurablePrefixScanned:
          producer.audit.completeDurablePrefixScanned,
        durablePrefixContainsNonce:
          producer.audit.durablePrefixContainsNonce,
        durablePrefixContainsCanonicalInputPreimage:
          producer.audit.durablePrefixContainsCanonicalInputPreimage,
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
        attemptPayloadHasInputValue:
          consumer.audit.attemptPayloadHasInputValue,
        attemptPayloadHasSourceCursor:
          consumer.audit.attemptPayloadHasSourceCursor,
        progressCarriesFullFrontier:
          consumer.audit.progressCarriesFullFrontier,
        currentProgressIsNumericCoverageOnly:
          consumer.audit.currentProgressIsNumericCoverageOnly,
        targetSuffixCoordinatesExact:
          consumer.audit.targetSuffixCoordinatesExact,
        targetSuffixDisposition:
          consumer.audit.targetSuffixDisposition,
        targetSuffixDependenciesReady:
          consumer.audit.targetSuffixDependenciesReady,
        projectorExportPresent: consumer.audit.projectorExportPresent,
        resumeExportPresent: consumer.audit.resumeExportPresent,
        completeDurablePrefixContainsCanonicalInputPreimage:
          consumer.audit.completeDurablePrefixContainsCanonicalInputPreimage,
        completeDurablePrefixHasNoExecutablePreimage:
          consumer.audit.completeDurablePrefixHasNoExecutablePreimage,
      },
    };

    return {
      relationId: "AX-F09",
      disposition: "confirmed_red",
      claim:
        "two authentic prior retry failures remain non-resumable after executor exit because the durable ABG prefix lacks the complete executable retry basis and the installed owner suffix is absent",
      ingress:
        "current src/hog/graph_execute.ts::executeGraphTraversal retained retry map; target installed ./abg::projectExecutableRetryInput then ./hog::resumeProjectedRetry",
      fixtureSource:
        "authored packed and installed test Product extending the m5 C.retry and worker relation to budget three, with nonce input, no-output attempt one, malformed-result attempt two, and unopened attempt three",
      processBoundary:
        "P1 durably admits two authentic failed attempts, projects the exact prefix, closes and exits; only prefix plus retry coordinates cross to fresh P2",
      mutation: {
        kind: "executor_exit_at_two_failure_retry_frontier",
        declaredRetryBudget: 3,
        priorAttemptOrdinals: [1, 2],
        priorFailureClasses: ["no_output", "contract_failure"],
        handoffFields: [
          "prefix",
          "retry.runId",
          "retry.graphCallId",
          "retry.frameId",
          "retry.retryBoundaryRef",
          "retry.retryProgressRef",
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
          finalCompletionAndReplayCanonicalEquality: true,
        },
      },
      expectedBaselineSignature: {
        disposition: "confirmed_red",
        retryAttemptPayloadPreimage: "absent",
        retryAttemptPayloadSourceCursor: "absent",
        completeAttemptFrontierCarrier: "absent",
        completeDurablePrefixExecutablePreimage: "absent",
        installedProjectorExport: "absent",
        installedResumeExport: "absent",
        installedTargetSuffixDisposition: "installed_suffix_exports_absent",
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
              producer.audit.handoffContainsInputValue,
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
          "missing_durable_executable_retry_basis",
          {
            attemptPayloadInputPreimagePresent: false,
            sourceCursorPresent: false,
            fullFrontierPresent: false,
            numericCoverageOnly: true,
            completeDurablePrefixScanned: true,
            noncePreimagePresentAnywhereInPrefix: false,
            canonicalInputPreimagePresentAnywhereInPrefix: false,
          },
          {
            attemptPayloadInputPreimagePresent:
              consumer.audit.attemptPayloadHasInputValue,
            sourceCursorPresent:
              consumer.audit.attemptPayloadHasSourceCursor,
            fullFrontierPresent:
              consumer.audit.progressCarriesFullFrontier,
            numericCoverageOnly:
              consumer.audit.currentProgressIsNumericCoverageOnly,
            completeDurablePrefixScanned:
              producer.audit.completeDurablePrefixScanned,
            noncePreimagePresentAnywhereInPrefix:
              producer.audit.durablePrefixContainsNonce,
            canonicalInputPreimagePresentAnywhereInPrefix:
              consumer.audit.completeDurablePrefixContainsCanonicalInputPreimage,
          },
          missingDurableRetryBasis,
        ),
        caseRecord(
          "missing_installed_owner_suffix",
          {
            targetSuffixCoordinatesExact: true,
            targetSuffixDependenciesReady: true,
            targetSuffixDisposition: "installed_suffix_exports_absent",
            projectorExportPresent: false,
            resumeExportPresent: false,
          },
          {
            targetSuffixCoordinatesExact:
              consumer.audit.targetSuffixCoordinatesExact,
            targetSuffixDependenciesReady:
              consumer.audit.targetSuffixDependenciesReady,
            targetSuffixDisposition:
              consumer.audit.targetSuffixDisposition,
            projectorExportPresent: consumer.audit.projectorExportPresent,
            resumeExportPresent: consumer.audit.resumeExportPresent,
          },
          missingInstalledSuffix,
        ),
      ],
    };
  } finally {
    if (typeof producer?.cleanupRoot === "string") {
      await rm(producer.cleanupRoot, { force: true, recursive: true });
    }
  }
}
