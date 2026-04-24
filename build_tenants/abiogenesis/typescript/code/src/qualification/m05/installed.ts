import {
  constructInstalledSandboxQualificationOutcome,
  constructInstalledSandboxStepRef,
  constructPassedInstalledSandboxQualificationOutcome,
  constructRejectedInstalledSandboxQualificationOutcome,
  constructRunArchiveGapRef,
  constructRunArchiveQualificationOutcome,
  constructPassedRunArchiveQualificationOutcome,
  constructRejectedRunArchiveQualificationOutcome
} from "./installed_constructors.js";
import type {
  InstalledSandboxQualificationOutcome,
  InstalledSandboxQualificationRequest,
  RunArchiveFileKind,
  RunArchiveGapRef,
  RunArchiveQualificationOutcome,
  RunArchiveQualificationRequest
} from "./installed_carriers.js";

const REQUIRED_BOOTSTRAP_EXPORTS: readonly string[] = Object.freeze([
  "deliverBootloader",
  "installBootstrap",
  "projectLiveStatus",
  "publicStart",
  "resultAssessment"
]);

const REQUIRED_ARCHIVE_KINDS: readonly RunArchiveFileKind[] = Object.freeze([
  "run_meta",
  "summary",
  "stdout",
  "stderr",
  "events",
  "manifest",
  "result",
  "workspace_artifact"
]);

function hasRequiredExports(values: readonly string[]): boolean {
  return REQUIRED_BOOTSTRAP_EXPORTS.every((entry) => values.includes(entry));
}

export function qualifyInstalledSandbox(
  request: InstalledSandboxQualificationRequest
): InstalledSandboxQualificationOutcome {
  const deliveryRootValid =
    request.installOutcome.kind === "installed" &&
    request.runtimeRoot.rootPath.length > 0 &&
    request.installOutcome.verification.packageManifest &&
    request.installOutcome.verification.installManifest &&
    request.installOutcome.verification.bootstrapEntry &&
    request.installOutcome.verification.runtimeDirectory &&
    request.installOutcome.verification.workspaceEvents;
  const bootloaderValid =
    request.bootloaderOutcome.kind === "installed" &&
    request.bootloaderOutcome.verification.bootloaderDocument &&
    request.bootloaderOutcome.verification.instructionTargets.every(
      (entry) => entry.verified
    );
  const packageBindingValid = request.runtimeRoot.packageBinding;
  const bootstrapImportValid =
    request.runtimeRoot.bootstrapImportPassed &&
    hasRequiredExports(request.runtimeRoot.exportedSurface);
  const liveLaneValid =
    request.lane === "install" ? true : request.runtimeRoot.liveScenarioPassed;

  const trace = Object.freeze([
    constructInstalledSandboxStepRef(
      "delivery_root",
      deliveryRootValid,
      deliveryRootValid
        ? "installed delivery root is complete"
        : "installed delivery root is incomplete"
    ),
    constructInstalledSandboxStepRef(
      "bootloader",
      bootloaderValid,
      bootloaderValid
        ? "bootloader document and instruction targets are present"
        : "bootloader delivery is incomplete"
    ),
    constructInstalledSandboxStepRef(
      "package_binding",
      packageBindingValid,
      packageBindingValid
        ? "installed package binding is present"
        : "installed package binding is missing"
    ),
    constructInstalledSandboxStepRef(
      "bootstrap_import",
      bootstrapImportValid,
      bootstrapImportValid
        ? "bootstrap import exposed the required operator surface"
        : "bootstrap import failed or exported an incomplete operator surface"
    ),
    constructInstalledSandboxStepRef(
      "live_lane",
      liveLaneValid,
      liveLaneValid
        ? request.lane === "install"
          ? "install lane does not require a live scenario run"
          : "installed live-lane scenario passed"
        : "installed live-lane scenario failed"
    )
  ]);

  const firstFailed = trace.find((step) => !step.valid);
  if (firstFailed !== undefined) {
    return constructInstalledSandboxQualificationOutcome(
      constructRejectedInstalledSandboxQualificationOutcome({
        lane: request.lane,
        reason: firstFailed.detail,
        trace
      })
    );
  }

  return constructInstalledSandboxQualificationOutcome(
    constructPassedInstalledSandboxQualificationOutcome({
      lane: request.lane,
      trace
    })
  );
}

export function qualifyRunArchive(
  request: RunArchiveQualificationRequest
): RunArchiveQualificationOutcome {
  const gaps: RunArchiveGapRef[] = [];

  if (!request.immutablePath) {
    gaps.push(
      constructRunArchiveGapRef(
        "unstable_archive_path",
        request.archiveRoot
      )
    );
  }

  for (const file of request.files) {
    if (!file.exists) {
      gaps.push(
        constructRunArchiveGapRef("missing_archive_file", file.path)
      );
    }
  }

  for (const kind of REQUIRED_ARCHIVE_KINDS) {
    if (!request.files.some((file) => file.kind === kind)) {
      gaps.push(constructRunArchiveGapRef("missing_archive_kind", kind));
    }
  }

  if (gaps.length > 0) {
    return constructRunArchiveQualificationOutcome(
      constructRejectedRunArchiveQualificationOutcome({
        scenarioName: request.scenarioName,
        reason: "installed run archive is incomplete",
        gaps
      })
    );
  }

  return constructRunArchiveQualificationOutcome(
    constructPassedRunArchiveQualificationOutcome({
      scenarioName: request.scenarioName,
      fileKinds: REQUIRED_ARCHIVE_KINDS
    })
  );
}
