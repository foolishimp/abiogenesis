import {
  constructDeliveryDirectoryRef,
  constructDeliveryFileRef,
  constructDeliveryPlan,
  deliveryVerificationPassed,
  materializeDeliveryPlan,
  verifyDeliveryPlan
} from "../../shared/abg_delivery_library/index.js";
import type {
  DeliveryDirectoryRef,
  DeliveryFileRef
} from "../../shared/abg_delivery_library/index.js";
import {
  constructRunArchiveFinalizationGapRef,
  constructRunArchiveFinalizationOutcome,
  constructRunArchiveFinalizationRejectedOutcome,
  constructRunArchiveFinalizedOutcome,
  constructRunArchiveMaterializedFileRef
} from "./archive_finalization_constructors.js";
import type {
  RunArchiveFinalizationGapRef,
  RunArchiveFinalizationOutcome,
  RunArchiveFinalizationRequest,
  RunArchiveFinalizationWriter,
  RunArchiveMaterializedFileKind,
  RunArchiveMaterializedFileRef
} from "./archive_finalization_carriers.js";

function joinPath(root: string, relativePath: string): string {
  if (relativePath.length === 0) {
    return root;
  }
  if (root.endsWith("/")) {
    return `${root}${relativePath}`;
  }
  return `${root}/${relativePath}`;
}

function parentDirectories(relativePath: string): readonly string[] {
  const segments = relativePath.split("/").filter((entry) => entry.length > 0);
  const directories: string[] = [];
  for (let index = 1; index < segments.length; index += 1) {
    directories.push(segments.slice(0, index).join("/"));
  }
  return directories;
}

function stableJson(payload: unknown): string {
  return `${JSON.stringify(payload, null, 2)}\n`;
}

function runMetaContent(request: RunArchiveFinalizationRequest): string {
  return stableJson({
    usecase_id: request.metadata.usecaseId,
    test_name: request.metadata.testName,
    timestamp: request.metadata.timestamp,
    test_passed: request.metadata.testPassed,
    source_commit: request.metadata.sourceCommit,
    runtime_ref: request.metadata.runtimeRef,
    notes: request.metadata.notes.map((entry) => ({
      label: entry.label,
      timestamp: entry.timestamp,
      detail: entry.detail
    }))
  });
}

function summaryContent(request: RunArchiveFinalizationRequest): string {
  return stableJson({
    usecase_id: request.metadata.usecaseId,
    test_name: request.metadata.testName,
    workspace: request.summary.workspacePath,
    total_events: request.summary.totalEvents,
    event_types: request.summary.eventTypes,
    manifest_files: request.summary.manifestFiles,
    result_files: request.summary.resultFiles,
    converged: request.summary.converged,
    total_delta: request.summary.totalDelta,
    ...(request.summary.assurance === undefined
      ? {}
      : {
          assurance: {
            status: request.summary.assurance.status,
            reason: request.summary.assurance.reason,
            projection_refs: request.summary.assurance.projectionRefs,
            closure_decisions: request.summary.assurance.closureDecisions,
            blocking_statuses: request.summary.assurance.blockingStatuses
          }
        })
  });
}

function generatedArchiveFiles(
  request: RunArchiveFinalizationRequest
): readonly {
  relativePath: string;
  content: string;
  kind: RunArchiveMaterializedFileKind;
}[] {
  return Object.freeze([
    {
      relativePath: "run.json",
      content: runMetaContent(request),
      kind: "run_meta"
    },
    {
      relativePath: "summary.json",
      content: summaryContent(request),
      kind: "summary"
    },
    {
      relativePath: "stdout.log",
      content: request.stdoutLog,
      kind: "stdout"
    },
    {
      relativePath: "stderr.log",
      content: request.stderrLog,
      kind: "stderr"
    }
  ]);
}

async function loadSourceFiles(
  request: RunArchiveFinalizationRequest,
  writer: RunArchiveFinalizationWriter
): Promise<{
  readonly files: readonly {
    relativePath: string;
    content: string;
    kind: RunArchiveMaterializedFileKind;
  }[];
  readonly gaps: readonly RunArchiveFinalizationGapRef[];
}> {
  const files: {
    relativePath: string;
    content: string;
    kind: RunArchiveMaterializedFileKind;
  }[] = [];
  const gaps: RunArchiveFinalizationGapRef[] = [];

  for (const source of request.sourceFiles) {
    const content = await writer.readTextFile(source.sourcePath);
    if (content === null) {
      gaps.push(
        constructRunArchiveFinalizationGapRef(
          "missing_source_file",
          source.sourcePath
        )
      );
      continue;
    }
    files.push({
      relativePath: source.archiveRelativePath,
      content,
      kind: source.kind
    });
  }

  return {
    files: Object.freeze(files),
    gaps: Object.freeze(gaps)
  };
}

function archiveDirectories(
  filePaths: readonly string[]
): readonly DeliveryDirectoryRef[] {
  const seen = new Set<string>();
  for (const filePath of filePaths) {
    for (const directory of parentDirectories(filePath)) {
      seen.add(directory);
    }
  }
  return Object.freeze(
    [...seen]
      .sort()
      .map((relativePath) =>
        constructDeliveryDirectoryRef({
          kind: "archive_directory",
          relativePath
        })
      )
  );
}

function archiveFilePlan(
  generatedFiles: readonly {
    relativePath: string;
    content: string;
    kind: RunArchiveMaterializedFileKind;
  }[],
  sourceFiles: readonly {
    relativePath: string;
    content: string;
    kind: RunArchiveMaterializedFileKind;
  }[]
): readonly DeliveryFileRef[] {
  const refs: DeliveryFileRef[] = [];
  for (const file of [...generatedFiles, ...sourceFiles]) {
    refs.push(
      constructDeliveryFileRef({
        kind: file.kind,
        relativePath: file.relativePath,
        content: file.content
      })
    );
  }
  return Object.freeze(refs);
}

async function materializedFileRefs(
  archiveRoot: string,
  files: readonly {
    relativePath: string;
    kind: RunArchiveMaterializedFileKind;
  }[],
  writer: RunArchiveFinalizationWriter
): Promise<readonly RunArchiveMaterializedFileRef[]> {
  const refs: RunArchiveMaterializedFileRef[] = [];
  for (const file of files) {
    const path = joinPath(archiveRoot, file.relativePath);
    refs.push(
      constructRunArchiveMaterializedFileRef({
        path,
        kind: file.kind,
        exists: await writer.isFile(path)
      })
    );
  }
  return Object.freeze(refs);
}

export async function finalizeRunArchive(
  request: RunArchiveFinalizationRequest,
  writer: RunArchiveFinalizationWriter
): Promise<RunArchiveFinalizationOutcome> {
  const generatedFiles = generatedArchiveFiles(request);
  const sourceResult = await loadSourceFiles(request, writer);

  if (sourceResult.gaps.length > 0) {
    return constructRunArchiveFinalizationOutcome(
      constructRunArchiveFinalizationRejectedOutcome({
        scenarioName: request.scenarioName,
        archiveRoot: request.archiveRoot,
        reason: "archive source files are incomplete",
        gaps: sourceResult.gaps
      })
    );
  }

  const planFiles = archiveFilePlan(generatedFiles, sourceResult.files);
  const plan = constructDeliveryPlan({
    directories: archiveDirectories(
      planFiles.map((entry) => entry.relativePath)
    ),
    files: planFiles
  });

  await materializeDeliveryPlan(request.archiveRoot, plan, writer);
  const verification = await verifyDeliveryPlan(request.archiveRoot, plan, writer);

  if (!deliveryVerificationPassed(verification)) {
    const gaps = verification.items
      .filter((entry) => !entry.verified)
      .map((entry) =>
        constructRunArchiveFinalizationGapRef(
          "materialization_verification_failed",
          entry.relativePath
        )
      );
    return constructRunArchiveFinalizationOutcome(
      constructRunArchiveFinalizationRejectedOutcome({
        scenarioName: request.scenarioName,
        archiveRoot: request.archiveRoot,
        reason: "archive materialization verification failed",
        gaps
      })
    );
  }

  const files = await materializedFileRefs(
    request.archiveRoot,
    [...generatedFiles, ...sourceResult.files],
    writer
  );

  return constructRunArchiveFinalizationOutcome(
    constructRunArchiveFinalizedOutcome({
      scenarioName: request.scenarioName,
      archiveRoot: request.archiveRoot,
      plan,
      verification,
      files
    })
  );
}
