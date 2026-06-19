import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync
} from "node:fs";import path, {
  dirname,
  isAbsolute,
  join,
  resolve
} from "node:path";import {
  fileURLToPath,
  pathToFileURL
} from "node:url";import {
  admitFpTransformResultForRequest,
  constructFpTransformResult,
  type FpTransformResult
} from "@abiogenesis/typescript-tenant";import {
  FG_CONFORM_PROJECT_AUTHORITY,
  FG_DERIVE_LITE_COMPONENT_CODE_SURFACE
} from "../../../graph/index.js";import {
  writeSdlcSystemArtifact
} from "../../system_artifacts.js";import {
  admitComponentDepthRegisterFromArtifact
} from "../../component_depth_register.js";import {
  parseArray,
  parseClosedRecord,
  parseBoolean,
  parseEnumValue,
  parseNonEmptyString,
  parseStringList
} from "../../../shared/validation.js";import {
  uniqueSorted
} from "../../../shared/collections.js";import {
  sha256Text
} from "../../../shared/digest.js";import {
  admitExactContractEnum
} from "../../../shared/fd_admission.js";import {
  sdlcEdgeOutputPolicyForTargetAssetType
} from "../../edge_output_policy.js";import {
  observeProductMaterializationDeltaWithDiagnostics as observeProductMaterializationDeltaWithDiagnosticsFromModule,
  type ProductMaterializationObservationDelta,
  type ProductMaterializationObservationDeps,
  type SdlcObservedProductFileSnapshot,
  type SdlcProductMaterializationSnapshot
} from "../../product_materialization/observation.js";import {
  priorHandoffManifestMatchesCurrent as priorHandoffManifestMatchesCurrentFromModule,
  productMaterializationReplayArchives as productMaterializationReplayArchivesFromModule,
  readProductMaterializationReplayManifest as readProductMaterializationReplayManifestFromModule,
  replayArchivePostflightStatus as replayArchivePostflightStatusFromModule,
  resolveProductMaterializationReplay as resolveProductMaterializationReplayFromModule,
  workerResultReportWithReplayedProductMaterialization as workerResultReportWithReplayedProductMaterializationFromModule,
  type ProductMaterializationReplayDeps
} from "../../product_materialization/replay.js";import {
  existingEvidencePaths
} from "../consequence/repair_reentry.js";import {
  admitComputeSubworkstreamManifest,
  defaultComputeSubworkstreamManifest
} from "../../compute_subworkstreams.js";import {
  SDLC_BLOCKING_REASON_CODES,
  type SdlcBlockingReasonCode
} from "../../../shared/blocking_reason.js";import {
  deriveSdlcConformProjectProfileFromWorkspace
} from "../../../workspace/index.js";import {
  isPlaceholderRequirementMarker
} from "../../../workspace/source_input.js";import {
  SDLC_REVIEW_GRADE_FAILURE_CLASSES
} from "../../carriers.js";import type {
  SdlcMaterializedProductFile,
  SdlcMaterializedProductFileRole,
  SdlcPostflightGapDossier,
  SdlcTraversalObligation,
  SdlcProductMaterializationAuthorityTarget,
  SdlcWorkerHandoffManifest,
  SdlcWorkerExecutionEvidence,
  SdlcWorkerExecutionShardEvidence,
  SdlcWorkerObligationAssessment,
  SdlcWorkerResultMaterializationDiagnostic,
  SdlcWorkerResultReport
} from "../../carriers.js";import {
  declaredBuildConfigRoleForObservedFile,
  declaredProductAuthorityRoleForObservedFile,
  effectiveProductMaterializationRequiredRoles,
  isTenantDeclaredToolByproductRelativePath,
  isTenantLocalSdlcSurfaceRelativePath,
  isTenantStackAuthoritySpecRelativePath,
  productAuthorityTargetCoversRelativePath,
  reconcileSdlcProductMaterializationAuthority,
  tenantRelativeOutputArtifactPath
} from "../../product_materialization/authority.js";import {
  MATERIALIZED_PRODUCT_FILE_ROLES
} from "../../product_materialization/surface_paths.js";

const REPORT_FIELDS = Object.freeze([
  "kind",
  "projectionRole",
  "authoritativeStageResultRef",
  "graphFunctionName",
  "edgeName",
  "targetAssetType",
  "outputFile",
  "digest",
  "summary",
  "unresolvedReasons",
  "materializedFiles",
  "materializationDiagnostics",
  "executionEvidence",
  "executionEvidenceErrors",
  "obligationAssessments",
  "subworkstreamManifest",
  "fpTransformRequestRef",
  "fpTransformResultRef",
  "fpTransformStatusSnapshot",
  "fpEvaluateResultRef"
] as const);

const WORKER_OBLIGATION_FULFILLMENT_STATUSES = Object.freeze([
  "fulfilled",
  "partial",
  "blocked",
  "unassessed"
] as const);


const REQUIREMENT_MARKER_EXPRESSION =
  /\b(?:RF-[A-Z0-9]+(?:-[A-Z0-9]+)*|REQ-[A-Z0-9]+(?:-[A-Z0-9]+)*)\b(?!-)/g;


const MAX_INVOCATION_PACKAGE_REQUIREMENT_TRACE_IDS = 80;



function targetAdmitsTestExecutionEvidence(targetAssetType: string): boolean {
  return sdlcEdgeOutputPolicyForTargetAssetType(targetAssetType)
    .admitsTestExecutionEvidence;
}



function manifestAdmitsTestExecutionEvidence(
  manifest: SdlcWorkerHandoffManifest
): boolean {
  return targetAdmitsTestExecutionEvidence(manifest.targetAssetType);
}



function targetIgnoresExecutionByproducts(targetAssetType: string): boolean {
  return (
    targetAssetType === "component_code_surface" ||
    targetAssetType === "component_test_surface" ||
    targetAssetType === "uat_test_source_surface" ||
    targetAdmitsTestExecutionEvidence(targetAssetType)
  );
}



function coverageRefAliases(ref: string): readonly string[] {
  const aliases = new Set<string>([ref]);
  try {
    const parsed = new URL(ref);
    if (parsed.protocol === "file:") {
      aliases.add(fileURLToPath(parsed));
    }
    parsed.hash = "";
    parsed.search = "";
    aliases.add(parsed.href);
    if (parsed.protocol === "file:") {
      aliases.add(fileURLToPath(parsed));
    }
    return Object.freeze([...aliases]);
  } catch {
    const bareRef = ref.replace(/[?#].*$/u, "");
    if (bareRef.length > 0 && bareRef !== ref) {
      aliases.add(bareRef);
    }
    if (isAbsolute(bareRef)) {
      aliases.add(pathToFileURL(bareRef).href);
    }
    return Object.freeze([...aliases]);
  }
}



function normalizeRequirementId(requirementId: string): string {
  const parts = requirementId.toUpperCase().split("-");
  const head = parts[0] === "RF" ? "REQ" : parts[0];
  const tail = parts.slice(1).map((part) =>
    /^\d+$/.test(part) && part.length < 3 ? part.padStart(3, "0") : part
  );
  return [head, ...tail].join("-");
}



function decodedScopeRef(input: string): string {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}



function textIfFile(filePath: string): string | null {
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    return null;
  }
  return readFileSync(filePath, "utf8");
}



function requirementTraceObligationIdsForPrompt(
  manifest: SdlcWorkerHandoffManifest
): readonly string[] {
  const ids = new Set<string>();
  const latestDossier =
    manifest.retryContext.priorGapDossiers[manifest.retryContext.priorGapDossiers.length - 1];
  if (latestDossier !== undefined) {
    for (const id of currentEvaluatedGapRequirementIds(manifest, latestDossier)) {
      ids.add(id);
    }
  }
  for (const obligation of canonicalRequirementTraceObligationsForPrompt(manifest)) {
    ids.add(obligation.obligationId);
  }
  return Object.freeze([...ids].slice(0, MAX_INVOCATION_PACKAGE_REQUIREMENT_TRACE_IDS));
}



function currentEvaluatedGapAssessmentRequirementIds(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly dossier: SdlcPostflightGapDossier;
}): readonly string[] {
  const evidencePaths = existingEvidencePaths({
    workspaceRoot: input.manifest.workspaceRoot,
    refs: uniqueSorted([
      ...input.dossier.evidenceRefs,
      ...input.dossier.reasons.flatMap((reason) => reason.blockingReason.evidenceRefs)
    ])
  }).filter((filePath) => path.basename(filePath) === "review_grade_edge_fulfillment_assessment.json");
  const ids = new Set<string>();
  for (const filePath of evidencePaths) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(readFileSync(filePath, "utf8"));
    } catch {
      continue;
    }
    const record = objectRecord(parsed);
    if (
      record === null ||
      record["kind"] !== "sdlc_review_grade_edge_fulfillment_assessment" ||
      !Array.isArray(record["findings"])
    ) {
      continue;
    }
    for (const candidateFinding of record["findings"]) {
      const finding = objectRecord(candidateFinding);
      if (
        finding === null ||
        typeof finding["obligationId"] !== "string" ||
        !finding["obligationId"].startsWith("requirement:") ||
        (finding["fulfillmentStatus"] !== "blocked" &&
          finding["fulfillmentStatus"] !== "unassessed")
      ) {
        continue;
      }
      ids.add(finding["obligationId"]);
    }
  }
  return uniqueSorted([...ids]);
}



function currentEvaluatedGapRequirementIds(
  manifest: SdlcWorkerHandoffManifest,
  dossier: SdlcPostflightGapDossier
): readonly string[] {
  const activeRequirementObligationIds = new Set(
    manifest.traversalObligationContext.obligations
      .filter((obligation) => obligation.obligationKind === "requirement")
      .map((obligation) => obligation.obligationId)
  );
  const assessmentIds = currentEvaluatedGapAssessmentRequirementIds({
    manifest,
    dossier
  }).filter((obligationId) =>
    currentEvaluatedGapRequirementIdIsAdmissible({
      activeRequirementObligationIds,
      obligationId
    })
  );
  if (assessmentIds.length > 0) {
    return assessmentIds;
  }
  const ids = new Set<string>();
  const candidateTexts = uniqueSorted(
    dossier.reasons
      .flatMap((reason) => [
        reason.reason,
        reason.blockingReason.message,
        reason.blockingReason.detail ?? ""
      ])
      .map((candidate) => decodedScopeRef(candidate))
  );
  for (const obligation of manifest.traversalObligationContext.obligations) {
    if (obligation.obligationKind !== "requirement") {
      continue;
    }
    const authorityRef = requirementIdForObligation(obligation.obligationId);
    const displayId = displayIdForRequirementObligation(obligation);
    const variants = uniqueSorted([
      obligation.obligationId,
      ...(authorityRef === null ? [] : [authorityRef]),
      ...(displayId === null ? [] : [displayId])
    ]).filter((variant) => variant.length > 0);
    if (
      variants.some((variant) =>
        candidateTexts.some((candidate) => candidate.includes(variant))
      )
    ) {
      ids.add(obligation.obligationId);
    }
  }
  const fallbackPattern =
    /(?:requirement:)?[A-Za-z][A-Za-z0-9_-]*(?:\.[A-Za-z0-9_-]+){2,}/gu;
  for (const candidate of candidateTexts) {
    for (const match of candidate.matchAll(fallbackPattern)) {
      const raw = match[0];
      const obligationId = raw.startsWith("requirement:")
        ? raw
        : `requirement:${raw}`;
      if (
        currentEvaluatedGapRequirementIdIsAdmissible({
          activeRequirementObligationIds,
          obligationId
        })
      ) {
        ids.add(obligationId);
      }
    }
  }
  return uniqueSorted([...ids]);
}



function currentEvaluatedGapRequirementIdIsAdmissible(input: {
  readonly activeRequirementObligationIds: ReadonlySet<string>;
  readonly obligationId: string;
}): boolean {
  if (input.activeRequirementObligationIds.has(input.obligationId)) {
    return true;
  }
  if (!input.obligationId.startsWith("requirement:")) {
    return false;
  }
  const raw = input.obligationId.slice("requirement:".length).toLowerCase();
  if (
    raw.includes("/") ||
    raw.includes("://") ||
    raw.includes(".json") ||
    raw.includes(".jsonl") ||
    raw.endsWith(".trace") ||
    raw.includes(".trace.")
  ) {
    return false;
  }
  return raw.includes("requirement") || /(?:^|[._-])req[._-]/u.test(raw);
}



function parseNonNegativeInteger(input: unknown, label: string): number {
  if (typeof input !== "number" || !Number.isInteger(input) || input < 0) {
    throw new TypeError(`${label}: expected non-negative integer`);
  }
  return input;
}



function parseOptionalNonEmptyString(input: unknown, label: string): string | null {
  if (input === undefined || input === null) {
    return null;
  }
  return parseNonEmptyString(input, label);
}



function parseOptionalFpTransformStatus(
  input: unknown,
  label: string
): FpTransformResult["status"] | null {
  if (input === undefined || input === null) {
    return null;
  }
  return parseEnumValue(input, label, [
    "returned",
    "blocked",
    "runtime_failed",
    "contract_failed"
  ] as const);
}



function expectedFpEvaluateResultRef(
  manifest: SdlcWorkerHandoffManifest
): string {
  return pathToFileURL(manifest.fpEvaluateResultFile).href;
}



function admitWorkerReportProjectionRole(
  input: unknown
): SdlcWorkerResultReport["projectionRole"] {
  const role = parseNonEmptyString(
    input,
    "SdlcWorkerResultReport.projectionRole"
  );
  if (role !== "typed_fp_stage_projection") {
    throw new TypeError(
      "SdlcWorkerResultReport.projectionRole: expected typed_fp_stage_projection"
    );
  }
  return role;
}



function admitAuthoritativeStageResultRef(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly ref: unknown;
}): string {
  const ref = parseNonEmptyString(
    input.ref,
    "SdlcWorkerResultReport.authoritativeStageResultRef"
  );
  const expected = expectedFpEvaluateResultRef(input.manifest);
  if (ref !== expected) {
    throw new TypeError(
      "SdlcWorkerResultReport.authoritativeStageResultRef: expected same-archive fp_evaluate_result.json"
    );
  }
  return ref;
}



function expectedArchivedFpEvaluateResultRef(reportFile: string): string {
  return pathToFileURL(join(dirname(reportFile), "fp_evaluate_result.json")).href;
}



function readArchivedWorkerResultReportRecord(input: {
  readonly filePath: string;
  readonly label: string;
}): Record<string, unknown> {
  const record = parseClosedRecord(
    JSON.parse(readFileSync(input.filePath, "utf8")),
    input.label,
    REPORT_FIELDS
  );
  const kind = parseNonEmptyString(record["kind"], `${input.label}.kind`);
  if (kind !== "odd_sdlc.worker_result_report") {
    throw new TypeError(`${input.label}.kind: unexpected report kind`);
  }
  const projectionRole = parseNonEmptyString(
    record["projectionRole"],
    `${input.label}.projectionRole`
  );
  if (projectionRole !== "typed_fp_stage_projection") {
    throw new TypeError(
      `${input.label}.projectionRole: expected typed_fp_stage_projection`
    );
  }
  const authoritativeStageResultRef = parseNonEmptyString(
    record["authoritativeStageResultRef"],
    `${input.label}.authoritativeStageResultRef`
  );
  if (authoritativeStageResultRef !== expectedArchivedFpEvaluateResultRef(input.filePath)) {
    throw new TypeError(
      `${input.label}.authoritativeStageResultRef: expected same-archive fp_evaluate_result.json`
    );
  }
  return record;
}



function admitWorkerResultMaterializationDiagnostic(
  input: unknown,
  label: string
): SdlcWorkerResultMaterializationDiagnostic {
  const record = parseClosedRecord(input, label, [
    "kind",
    "code",
    "detail",
    "evidenceRefs"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_worker_result_materialization_diagnostic") {
    throw new TypeError(`${label}.kind: unexpected materialization diagnostic kind`);
  }
  return Object.freeze({
    kind: "sdlc_worker_result_materialization_diagnostic" as const,
    code: parseEnumValue(
      record["code"],
      `${label}.code`,
      SDLC_BLOCKING_REASON_CODES
    ),
    detail: parseNonEmptyString(record["detail"], `${label}.detail`),
    evidenceRefs: parseStringList(record["evidenceRefs"], `${label}.evidenceRefs`)
  });
}



function admitMaterializedProductFile(
  input: unknown,
  label: string
): SdlcMaterializedProductFile {
  const record = parseClosedRecord(input, label, [
    "kind",
    "role",
    "relativePath",
    "absolutePath",
    "digest",
    "byteCount",
    "materializationSource",
    "sourceManifestRef",
    "sourceHandoffManifestRef",
    "sourceAttemptRef",
    "overwritesMaterializationRef",
    "rolePolicyRef",
    "requirementTraceObligationIds"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_materialized_product_file") {
    throw new TypeError(`${label}.kind: unexpected materialized file kind`);
  }
  const materializationSource =
    record["materializationSource"] === undefined
      ? "current_attempt"
      : parseEnumValue(
          record["materializationSource"],
          `${label}.materializationSource`,
          ["current_attempt", "replay"] as const
        );
  const sourceManifestRef =
    record["sourceManifestRef"] === undefined
      ? undefined
      : parseNonEmptyString(record["sourceManifestRef"], `${label}.sourceManifestRef`);
  const sourceHandoffManifestRef =
    record["sourceHandoffManifestRef"] === undefined
      ? undefined
      : parseNonEmptyString(
          record["sourceHandoffManifestRef"],
          `${label}.sourceHandoffManifestRef`
        );
  const sourceAttemptRef =
    record["sourceAttemptRef"] === undefined
      ? undefined
      : parseNonEmptyString(record["sourceAttemptRef"], `${label}.sourceAttemptRef`);
  const overwritesMaterializationRef =
    record["overwritesMaterializationRef"] === undefined
      ? undefined
      : parseNonEmptyString(
          record["overwritesMaterializationRef"],
          `${label}.overwritesMaterializationRef`
        );
  if (
    materializationSource === "replay" &&
    overwritesMaterializationRef !== undefined
  ) {
    throw new TypeError(
      `${label}.overwritesMaterializationRef: replayed files cannot overwrite predecessor materialization`
    );
  }
  const base = {
    kind: "sdlc_materialized_product_file",
    role: parseEnumValue(
      record["role"],
      `${label}.role`,
      MATERIALIZED_PRODUCT_FILE_ROLES
    ),
    relativePath: parseNonEmptyString(record["relativePath"], `${label}.relativePath`),
    absolutePath: resolve(
      parseNonEmptyString(record["absolutePath"], `${label}.absolutePath`)
    ),
    digest: parseNonEmptyString(record["digest"], `${label}.digest`),
    byteCount: parseNonNegativeInteger(record["byteCount"], `${label}.byteCount`),
    ...(record["rolePolicyRef"] === undefined
      ? {}
      : {
          rolePolicyRef: parseNonEmptyString(
            record["rolePolicyRef"],
            `${label}.rolePolicyRef`
          )
        }),
    ...(record["requirementTraceObligationIds"] === undefined
      ? {}
      : {
          requirementTraceObligationIds: parseStringList(
            record["requirementTraceObligationIds"],
            `${label}.requirementTraceObligationIds`
          )
        })
  } satisfies Pick<
    SdlcMaterializedProductFile,
    | "kind"
    | "role"
    | "relativePath"
    | "absolutePath"
    | "digest"
    | "byteCount"
  > & {
    readonly rolePolicyRef?: string;
    readonly requirementTraceObligationIds?: readonly string[];
  };
  if (materializationSource === "replay") {
    if (
      sourceManifestRef === undefined ||
      sourceHandoffManifestRef === undefined ||
      sourceAttemptRef === undefined
    ) {
      throw new TypeError(`${label}: replayed materialized files require source lineage refs`);
    }
    return Object.freeze({
      ...base,
      materializationSource,
      sourceManifestRef,
      sourceHandoffManifestRef,
      sourceAttemptRef
    });
  }
  return Object.freeze({
    ...base,
    materializationSource,
    ...(sourceManifestRef === undefined ? {} : { sourceManifestRef }),
    ...(sourceHandoffManifestRef === undefined ? {} : { sourceHandoffManifestRef }),
    ...(sourceAttemptRef === undefined ? {} : { sourceAttemptRef }),
    ...(overwritesMaterializationRef === undefined
      ? {}
      : { overwritesMaterializationRef })
  });
}



function admitReplayManifestMaterializedProductFile(
  input: unknown,
  label: string
): SdlcMaterializedProductFile {
  const record = parseOpenRecord(input, label);
  if (
    record["materializationSource"] === "replay" &&
    record["overwritesMaterializationRef"] !== undefined
  ) {
    const projected: Record<string, unknown> = { ...record };
    delete projected["overwritesMaterializationRef"];
    return admitMaterializedProductFile(projected, label);
  }
  return admitMaterializedProductFile(input, label);
}



function parseNullableNonNegativeInteger(input: unknown, label: string): number | null {
  if (input === null) {
    return null;
  }
  return parseNonNegativeInteger(input, label);
}



function parseOptionalArray<T>(
  input: unknown,
  label: string,
  parseItem: (item: unknown, itemLabel: string) => T
): readonly T[] {
  if (input === undefined) {
    return Object.freeze([]);
  }
  return parseArray(input, label, parseItem);
}



function executionEvidenceStatus(input: unknown, label: string) {
  return admitExactContractEnum({
    value: input,
    label,
    values: ["succeeded", "failed", "pending"] as const
  });
}



function admitWorkerExecutionShardEvidence(
  input: unknown,
  label: string
): SdlcWorkerExecutionShardEvidence {
  const record = parseClosedRecord(input, label, [
    "kind",
    "shardId",
    "moduleName",
    "lane",
    "command",
    "status",
    "reportRefs",
    "testsObserved",
    "passedCount",
    "failedCount"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_worker_execution_shard_evidence") {
    throw new TypeError(`${label}.kind: unexpected execution shard evidence kind`);
  }
  return Object.freeze({
    kind: "sdlc_worker_execution_shard_evidence" as const,
    shardId: parseNonEmptyString(record["shardId"], `${label}.shardId`),
    moduleName: parseNonEmptyString(record["moduleName"], `${label}.moduleName`),
    lane: parseEnumValue(record["lane"], `${label}.lane`, ["test"]),
    command: parseNonEmptyString(record["command"], `${label}.command`),
    status: executionEvidenceStatus(record["status"], `${label}.status`),
    reportRefs: parseStringList(record["reportRefs"], `${label}.reportRefs`),
    testsObserved: parseNullableNonNegativeInteger(
      record["testsObserved"],
      `${label}.testsObserved`
    ),
    passedCount: parseNullableNonNegativeInteger(
      record["passedCount"],
      `${label}.passedCount`
    ),
    failedCount: parseNullableNonNegativeInteger(
      record["failedCount"],
      `${label}.failedCount`
    )
  });
}



function admitWorkerExecutionEvidence(
  input: unknown,
  label: string
): SdlcWorkerExecutionEvidence {
  const record = parseClosedRecord(input, label, [
    "kind",
    "lane",
    "command",
    "status",
    "reportRefs",
    "testsObserved",
    "passedCount",
    "failedCount",
    "shardEvidence"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_worker_execution_evidence") {
    throw new TypeError(`${label}.kind: unexpected execution evidence kind`);
  }
  return Object.freeze({
    kind: "sdlc_worker_execution_evidence" as const,
    lane: parseEnumValue(record["lane"], `${label}.lane`, ["build", "test"]),
    command: parseNonEmptyString(record["command"], `${label}.command`),
    status: executionEvidenceStatus(record["status"], `${label}.status`),
    reportRefs: parseStringList(record["reportRefs"], `${label}.reportRefs`),
    testsObserved: parseNullableNonNegativeInteger(
      record["testsObserved"],
      `${label}.testsObserved`
    ),
    passedCount: parseNullableNonNegativeInteger(
      record["passedCount"],
      `${label}.passedCount`
    ),
    failedCount: parseNullableNonNegativeInteger(
      record["failedCount"],
      `${label}.failedCount`
    ),
    shardEvidence: parseOptionalArray(
      record["shardEvidence"],
      `${label}.shardEvidence`,
      admitWorkerExecutionShardEvidence
    )
  });
}



function admitOptionalWorkerExecutionEvidence(
  input: unknown,
  label: string
): SdlcWorkerExecutionEvidence | null {
  if (input === undefined || input === null) {
    return null;
  }
  return admitWorkerExecutionEvidence(input, label);
}



function admitWorkerObligationAssessment(
  input: unknown,
  label: string
): SdlcWorkerObligationAssessment {
  const record = parseClosedRecord(input, label, [
    "kind",
    "obligationId",
    "fulfillmentStatus",
    "evidenceRefs",
    "blockingReasons",
    "reviewGrade",
    "reviewFailureClass",
    "requiredAction",
    "semanticEvidenceRefs",
    "acceptedAuthorityRefs"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_worker_obligation_assessment") {
    throw new TypeError(`${label}.kind: unexpected obligation assessment kind`);
  }
  const reviewFailureClass =
    record["reviewFailureClass"] === undefined ||
    record["reviewFailureClass"] === null
      ? null
      : parseEnumValue(
          record["reviewFailureClass"],
          `${label}.reviewFailureClass`,
          SDLC_REVIEW_GRADE_FAILURE_CLASSES
        );
  const reviewGrade =
    record["reviewGrade"] === undefined
      ? undefined
      : parseBoolean(record["reviewGrade"], `${label}.reviewGrade`);
  const requiredAction = parseOptionalNonEmptyString(
    record["requiredAction"],
    `${label}.requiredAction`
  );
  const semanticEvidenceRefs =
    record["semanticEvidenceRefs"] === undefined
      ? undefined
      : parseStringList(record["semanticEvidenceRefs"], `${label}.semanticEvidenceRefs`);
  const acceptedAuthorityRefs =
    record["acceptedAuthorityRefs"] === undefined
      ? undefined
      : parseStringList(record["acceptedAuthorityRefs"], `${label}.acceptedAuthorityRefs`);
  return Object.freeze({
    kind: "sdlc_worker_obligation_assessment" as const,
    obligationId: parseNonEmptyString(record["obligationId"], `${label}.obligationId`),
    fulfillmentStatus: parseEnumValue(
      record["fulfillmentStatus"],
      `${label}.fulfillmentStatus`,
      WORKER_OBLIGATION_FULFILLMENT_STATUSES
    ),
    evidenceRefs: parseStringList(record["evidenceRefs"], `${label}.evidenceRefs`),
    blockingReasons: parseStringList(
      record["blockingReasons"],
      `${label}.blockingReasons`
    ),
    ...(reviewGrade === undefined ? {} : { reviewGrade }),
    ...(record["reviewFailureClass"] === undefined
      ? {}
      : { reviewFailureClass }),
    ...(record["requiredAction"] === undefined ? {} : { requiredAction }),
    ...(semanticEvidenceRefs === undefined ? {} : { semanticEvidenceRefs }),
    ...(acceptedAuthorityRefs === undefined ? {} : { acceptedAuthorityRefs })
  });
}



function admitWorkerObligationAssessments(
  input: unknown,
  label: string
): readonly SdlcWorkerObligationAssessment[] {
  if (input === undefined) {
    return Object.freeze([]);
  }
  return parseArray(input, label, admitWorkerObligationAssessment);
}



export function admitWorkerResultReport(
  input: unknown,
  manifest: SdlcWorkerHandoffManifest
): SdlcWorkerResultReport {
  const record = parseClosedRecord(input, "SdlcWorkerResultReport", REPORT_FIELDS);
  const kind = parseNonEmptyString(record["kind"], "SdlcWorkerResultReport.kind");
  if (kind !== "odd_sdlc.worker_result_report") {
    throw new TypeError("SdlcWorkerResultReport.kind: unexpected report kind");
  }
  const graphFunctionName = parseNonEmptyString(
    record["graphFunctionName"],
    "SdlcWorkerResultReport.graphFunctionName"
  );
  const edgeName = parseNonEmptyString(
    record["edgeName"],
    "SdlcWorkerResultReport.edgeName"
  );
  const targetAssetType = parseNonEmptyString(
    record["targetAssetType"],
    "SdlcWorkerResultReport.targetAssetType"
  );
  const outputFile = parseNonEmptyString(
    record["outputFile"],
    "SdlcWorkerResultReport.outputFile"
  );
  const digest = parseNonEmptyString(
    record["digest"],
    "SdlcWorkerResultReport.digest"
  );
  if (graphFunctionName !== manifest.graphFunctionName) {
    throw new TypeError("SdlcWorkerResultReport.graphFunctionName: manifest mismatch");
  }
  if (edgeName !== manifest.edgeName) {
    throw new TypeError("SdlcWorkerResultReport.edgeName: manifest mismatch");
  }
  if (targetAssetType !== manifest.targetAssetType) {
    throw new TypeError("SdlcWorkerResultReport.targetAssetType: manifest mismatch");
  }
  const executionEvidence = admitOptionalWorkerExecutionEvidence(
    record["executionEvidence"],
    "SdlcWorkerResultReport.executionEvidence"
  );
  if (
    !manifestAdmitsTestExecutionEvidence(manifest) &&
    executionEvidence !== null
  ) {
    throw new TypeError(
      "SdlcWorkerResultReport.executionEvidence: target asset type does not admit execution evidence"
    );
  }
  return Object.freeze({
    kind: "odd_sdlc.worker_result_report",
    projectionRole: admitWorkerReportProjectionRole(record["projectionRole"]),
    authoritativeStageResultRef: admitAuthoritativeStageResultRef({
      manifest,
      ref: record["authoritativeStageResultRef"]
    }),
    graphFunctionName,
    edgeName,
    targetAssetType,
    outputFile: resolve(outputFile),
    digest,
    summary: parseNonEmptyString(record["summary"], "SdlcWorkerResultReport.summary"),
    unresolvedReasons: parseStringList(
      record["unresolvedReasons"],
      "SdlcWorkerResultReport.unresolvedReasons"
    ),
    materializedFiles: parseArray(
      record["materializedFiles"],
      "SdlcWorkerResultReport.materializedFiles",
      admitMaterializedProductFile
    ),
    materializationDiagnostics: parseArray(
      record["materializationDiagnostics"] ?? [],
      "SdlcWorkerResultReport.materializationDiagnostics",
      admitWorkerResultMaterializationDiagnostic
    ),
    executionEvidence,
    executionEvidenceErrors: parseStringList(
      record["executionEvidenceErrors"] ?? [],
      "SdlcWorkerResultReport.executionEvidenceErrors"
    ),
    obligationAssessments: admitWorkerObligationAssessments(
      record["obligationAssessments"],
      "SdlcWorkerResultReport.obligationAssessments"
    ),
    subworkstreamManifest: admitComputeSubworkstreamManifest({
      value: record["subworkstreamManifest"],
      manifest,
      stageRef: "transform.C",
      source: "parent_transform_report",
      parentResultRef: pathToFileURL(manifest.reportFile).href
    }),
    fpTransformRequestRef: parseOptionalNonEmptyString(
      record["fpTransformRequestRef"],
      "SdlcWorkerResultReport.fpTransformRequestRef"
    ),
    fpTransformResultRef: parseOptionalNonEmptyString(
      record["fpTransformResultRef"],
      "SdlcWorkerResultReport.fpTransformResultRef"
    ),
    fpTransformStatusSnapshot: parseOptionalFpTransformStatus(
      record["fpTransformStatusSnapshot"],
      "SdlcWorkerResultReport.fpTransformStatusSnapshot"
    ),
    fpEvaluateResultRef: parseOptionalNonEmptyString(
      record["fpEvaluateResultRef"],
      "SdlcWorkerResultReport.fpEvaluateResultRef"
    )
  });
}



function normalizedRelativePath(relativePath: string): string {
  return relativePath.split(path.sep).join("/");
}



function targetContractForMaterializedFile(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly relativePath: string;
}): SdlcProductMaterializationAuthorityTarget | null {
  const normalized = input.relativePath.split(path.sep).join("/");
  const authority = reconcileSdlcProductMaterializationAuthority(input.manifest);
  return (
    authority.declaredProductTargetContracts.find((candidate) =>
      productAuthorityTargetCoversRelativePath({
        manifest: input.manifest,
        target: candidate,
        normalizedRelativePath: normalized
      })
    ) ?? null
  );
}



function materializedFileLineageRef(input: {
  readonly manifestRef: string;
  readonly relativePath: string;
  readonly digest: string;
}): string {
  return [
    "materialized-product-file://odd-sdlc",
    encodeURIComponent(input.manifestRef),
    encodeURIComponent(input.relativePath),
    encodeURIComponent(input.digest)
  ].join("/");
}



function handoffManifestRefForArchiveRoot(archiveRoot: string): string {
  return pathToFileURL(join(archiveRoot, "handoff_manifest.json")).href;
}



function attemptRefForArchiveRoot(archiveRoot: string): string {
  return pathToFileURL(archiveRoot).href;
}



function rolePolicyRefForMaterializedRole(
  role: SdlcMaterializedProductFileRole
): string {
  if (role === "source") {
    return "target-role-policy://odd-sdlc/product-source-tree";
  }
  if (role === "test") {
    return "target-role-policy://odd-sdlc/product-test-tree";
  }
  if (role === "build_config") {
    return "target-role-policy://odd-sdlc/reported-build-config";
  }
  if (role === "design") {
    return "target-role-policy://odd-sdlc/product-design-surface";
  }
  if (role === "documentation") {
    return "target-role-policy://odd-sdlc/product-documentation";
  }
  return "target-role-policy://odd-sdlc/reported-other";
}



function fileWithMaterializationProvenance(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly file: SdlcMaterializedProductFile;
  readonly materializationSource: "current_attempt" | "replay";
  readonly sourceManifestRef: string;
  readonly sourceHandoffManifestRef: string;
  readonly sourceAttemptRef: string;
  readonly overwritesMaterializationRef?: string | null | undefined;
}): SdlcMaterializedProductFile {
  const targetContract = targetContractForMaterializedFile({
    manifest: input.manifest,
    relativePath: input.file.relativePath
  });
  const buildConfigRole = declaredBuildConfigRoleForObservedFile({
    manifest: input.manifest,
    normalizedRelativePath: normalizedRelativePath(input.file.relativePath)
  });
  const authorityRole = targetContract?.requiredRole ?? buildConfigRole ?? null;
  const effectiveRole =
    input.file.role === "other" && authorityRole !== null
      ? authorityRole
      : input.file.role;
  const rolePolicyRef =
    input.materializationSource === "replay"
      ? effectiveRole === input.file.role
        ? input.file.rolePolicyRef
        : targetContract?.policyRef ?? rolePolicyRefForMaterializedRole(effectiveRole)
      : input.file.rolePolicyRef ??
        targetContract?.policyRef ??
        rolePolicyRefForMaterializedRole(effectiveRole);
  return Object.freeze({
    kind: input.file.kind,
    role: effectiveRole,
    relativePath: input.file.relativePath,
    absolutePath: input.file.absolutePath,
    digest: input.file.digest,
    byteCount: input.file.byteCount,
    ...(input.file.requirementTraceObligationIds === undefined
      ? {}
      : { requirementTraceObligationIds: input.file.requirementTraceObligationIds }),
    materializationSource: input.materializationSource,
    sourceManifestRef: input.sourceManifestRef,
    sourceHandoffManifestRef: input.sourceHandoffManifestRef,
    sourceAttemptRef: input.sourceAttemptRef,
    ...(input.overwritesMaterializationRef === null ||
    input.overwritesMaterializationRef === undefined
      ? {}
      : { overwritesMaterializationRef: input.overwritesMaterializationRef }),
    ...(rolePolicyRef === undefined ? {} : { rolePolicyRef })
  });
}



function currentAttemptMaterializedFile(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly file: SdlcMaterializedProductFile;
  readonly overwritesMaterializationRef?: string | null | undefined;
}): SdlcMaterializedProductFile {
  return fileWithMaterializationProvenance({
    manifest: input.manifest,
    file: input.file,
    materializationSource: "current_attempt",
    sourceManifestRef: pathToFileURL(
      input.manifest.productMaterialization.manifestFile
    ).href,
    sourceHandoffManifestRef: handoffManifestRefForArchiveRoot(input.manifest.archiveRoot),
    sourceAttemptRef: attemptRefForArchiveRoot(input.manifest.archiveRoot),
    overwritesMaterializationRef: input.overwritesMaterializationRef
  });
}



function replayMaterializedFile(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly file: SdlcMaterializedProductFile;
  readonly sourceManifestRef: string;
  readonly sourceHandoffManifestRef: string;
  readonly sourceAttemptRef: string;
}): SdlcMaterializedProductFile {
  return fileWithMaterializationProvenance({
    manifest: input.manifest,
    file: input.file,
    materializationSource: "replay",
    sourceManifestRef: input.sourceManifestRef,
    sourceHandoffManifestRef: input.sourceHandoffManifestRef,
    sourceAttemptRef: input.sourceAttemptRef
  });
}



function currentAttemptMaterializedFileFromReplayPath(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly observedFile: SdlcObservedProductFileSnapshot;
  readonly replayedFile: SdlcMaterializedProductFile;
  readonly sourceManifestRef: string;
}): SdlcMaterializedProductFile {
  return currentAttemptMaterializedFile({
    manifest: input.manifest,
    file: Object.freeze({
      ...input.replayedFile,
      relativePath: input.observedFile.relativePath,
      absolutePath: input.observedFile.absolutePath,
      digest: input.observedFile.digest,
      byteCount: input.observedFile.byteCount
    }),
    overwritesMaterializationRef: materializedFileLineageRef({
      manifestRef: input.sourceManifestRef,
      relativePath: input.replayedFile.relativePath,
      digest: input.replayedFile.digest
    })
  });
}



function productMaterializationObservationDeps(): ProductMaterializationObservationDeps {
  return {
    targetIgnoresExecutionByproducts,
    targetAdmitsTestExecutionEvidence,
    isTenantLocalSdlcSurfaceRelativePath,
    isTenantStackAuthoritySpecRelativePath,
    isTenantDeclaredToolByproductRelativePath,
    declaredBuildConfigRoleForObservedFile,
    declaredProductAuthorityRoleForObservedFile,
    effectiveProductMaterializationRequiredRoles,
    tenantRelativeOutputArtifactPath,
    textIfFile,
    uniqueSorted,
    productMaterializationReplayArchives: productMaterializationReplayArchivesFromModule,
    replayArchivePostflightStatus: replayArchivePostflightStatusFromModule,
    priorHandoffManifestMatchesCurrent: priorHandoffManifestMatchesCurrentFromModule,
    readProductMaterializationReplayManifest: (input) =>
      readProductMaterializationReplayManifestFromModule(
        input,
        productMaterializationReplayDeps()
      ),
    admitReplayManifestMaterializedProductFile,
    replayMaterializedFile,
    currentAttemptMaterializedFileFromReplayPath,
    handoffManifestRefForArchiveRoot,
    attemptRefForArchiveRoot
  };
}



function observeProductMaterializationDeltaWithDiagnostics(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly before: SdlcProductMaterializationSnapshot;
}): ProductMaterializationObservationDelta {
  return observeProductMaterializationDeltaWithDiagnosticsFromModule(
    input,
    productMaterializationObservationDeps()
  );
}



function objectRecord(input: unknown): Record<string, unknown> | null {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return null;
  }
  return Object.fromEntries(Object.entries(input));
}



function normalizeExecutionEvidenceCandidate(input: unknown): unknown {
  const record = objectRecord(input);
  if (record === null) {
    return input;
  }
  if (record["kind"] === "sdlc_worker_execution_evidence") {
    return input;
  }
  if (record["executionEvidence"] !== undefined) {
    return record["executionEvidence"];
  }
  if (record["execution_evidence"] !== undefined) {
    return record["execution_evidence"];
  }
  return input;
}



function executionEvidenceCandidateWithArtifactRef(input: {
  readonly candidate: unknown;
  readonly artifactRef: string;
}): unknown {
  const normalized = normalizeExecutionEvidenceCandidate(input.candidate);
  const record = objectRecord(normalized);
  if (record === null || record["kind"] !== "sdlc_worker_execution_evidence") {
    return normalized;
  }
  const reportRefs = Array.isArray(record["reportRefs"])
    ? record["reportRefs"].filter((ref): ref is string => typeof ref === "string")
    : [];
  const rawShardEvidence: unknown = record["shardEvidence"];
  const shardEvidence = Array.isArray(rawShardEvidence)
    ? rawShardEvidence.map((shard: unknown) => {
        const shardRecord = objectRecord(shard);
        if (shardRecord === null) {
          return shard;
        }
        const shardReportRefs = Array.isArray(shardRecord["reportRefs"])
          ? shardRecord["reportRefs"].filter(
              (ref): ref is string => typeof ref === "string"
            )
          : [];
        return Object.freeze({
          kind: shardRecord["kind"],
          shardId: shardRecord["shardId"],
          moduleName: shardRecord["moduleName"],
          lane: shardRecord["lane"],
          command: shardRecord["command"],
          status: shardRecord["status"],
          reportRefs: Object.freeze(
            shardReportRefs.includes(input.artifactRef)
              ? shardReportRefs
              : [...shardReportRefs, input.artifactRef]
          ),
          testsObserved: shardRecord["testsObserved"],
          passedCount: shardRecord["passedCount"],
          failedCount: shardRecord["failedCount"]
        });
      })
    : undefined;
  return Object.freeze({
    kind: record["kind"],
    lane: record["lane"],
    command: record["command"],
    status: record["status"],
    reportRefs: Object.freeze(
      reportRefs.includes(input.artifactRef)
        ? reportRefs
        : [...reportRefs, input.artifactRef]
    ),
    testsObserved: record["testsObserved"],
    passedCount: record["passedCount"],
    failedCount: record["failedCount"],
    ...(shardEvidence === undefined
      ? {}
      : { shardEvidence: Object.freeze(shardEvidence) })
  });
}



interface ParsedJsonCandidate {
  readonly ok: boolean;
  readonly value: unknown;
}



function parseJsonCandidate(input: string): ParsedJsonCandidate {
  try {
    const parsed: unknown = JSON.parse(input);
    return Object.freeze({ ok: true, value: parsed });
  } catch {
    return Object.freeze({ ok: false, value: null });
  }
}



function executionEvidenceCandidatesFromTransformArtifact(input: {
  readonly content: string;
}): readonly unknown[] {
  const candidates: unknown[] = [];
  const wholeJson = parseJsonCandidate(input.content);
  if (wholeJson.ok) {
    candidates.push(wholeJson.value);
  }
  const fencedBlockExpression =
    /^```([^\r\n`]*)\r?\n([\s\S]*?)^```[^\S\r\n]*$/gmu;
  for (const match of input.content.matchAll(fencedBlockExpression)) {
    const infoString = match[1]?.trim() ?? "";
    const infoParts = infoString.split(/\s+/u).filter((part) => part.length > 0);
    const language = infoParts[0] ?? "";
    if (
      infoString !== "" &&
      language !== "json" &&
      language !== "execution_evidence" &&
      language !== "executionEvidence"
    ) {
      continue;
    }
    const block = match[2]?.trim() ?? "";
    const parsed = parseJsonCandidate(block);
    if (parsed.ok) {
      candidates.push(parsed.value);
    }
  }
  return Object.freeze(candidates);
}



function executionEvidenceCandidatePresentInTransformArtifact(content: string): boolean {
  return executionEvidenceCandidatesFromTransformArtifact({ content }).some(
    (candidate) => {
      const normalized = normalizeExecutionEvidenceCandidate(candidate);
      const normalizedRecord = objectRecord(normalized);
      return (
        normalizedRecord !== null &&
        normalizedRecord["kind"] === "sdlc_worker_execution_evidence"
      );
    }
  );
}



function extractExecutionEvidenceFromTransformArtifact(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly content: string;
}): {
  readonly executionEvidence: SdlcWorkerExecutionEvidence | null;
  readonly errors: readonly string[];
} {
  if (!manifestAdmitsTestExecutionEvidence(input.manifest)) {
    return Object.freeze({
      executionEvidence: null,
      errors: executionEvidenceCandidatePresentInTransformArtifact(input.content)
        ? Object.freeze([
            "transform artifact carries sdlc_worker_execution_evidence on a non-execution edge"
          ])
        : Object.freeze([])
    });
  }
  const artifactRef = pathToFileURL(input.manifest.outputFile).href;
  const candidates = executionEvidenceCandidatesFromTransformArtifact({
    content: input.content
  });
  const evidenceErrors: string[] = [];
  for (const candidate of candidates) {
    const normalized = normalizeExecutionEvidenceCandidate(candidate);
    const normalizedRecord = objectRecord(normalized);
    if (
      normalizedRecord === null ||
      normalizedRecord["kind"] !== "sdlc_worker_execution_evidence"
    ) {
      continue;
    }
    try {
      return Object.freeze({
        executionEvidence: admitWorkerExecutionEvidence(
          executionEvidenceCandidateWithArtifactRef({
            candidate: normalized,
            artifactRef
          }),
          "transformArtifact.executionEvidence"
        ),
        errors: Object.freeze([])
      });
    } catch (error) {
      evidenceErrors.push(error instanceof Error ? error.message : String(error));
    }
  }
  return Object.freeze({
    executionEvidence: null,
    errors: Object.freeze(evidenceErrors)
  });
}



function latestExecutionResultReportRefs(
  manifest: SdlcWorkerHandoffManifest
): readonly string[] {
  const operatorRunsRoot = join(
    manifest.workspaceRoot,
    deriveSdlcConformProjectProfileFromWorkspace(manifest.workspaceRoot)
      .runtimeLayout.operatorRunRoot
  );
  if (!existsSync(operatorRunsRoot) || !statSync(operatorRunsRoot).isDirectory()) {
    return Object.freeze([]);
  }
  const reports: { readonly filePath: string; readonly mtimeMs: number }[] = [];
  for (const runId of readdirSync(operatorRunsRoot)) {
    const filePath = join(operatorRunsRoot, runId, "worker_result_report.json");
    if (
      resolve(filePath) === resolve(manifest.reportFile) ||
      !existsSync(filePath) ||
      !statSync(filePath).isFile()
    ) {
      continue;
    }
    try {
      const record = readArchivedWorkerResultReportRecord({
        filePath,
        label: "LatestExecutionResultReport"
      });
      if (record["targetAssetType"] === "test_execution_result_surface") {
        reports.push(Object.freeze({ filePath, mtimeMs: statSync(filePath).mtimeMs }));
      }
    } catch {
      continue;
    }
  }
  return Object.freeze(
    reports
      .sort((left, right) => right.mtimeMs - left.mtimeMs)
      .map((report) => pathToFileURL(report.filePath).href)
  );
}



function requirementIdForObligation(obligationId: string): string | null {
  if (!obligationId.startsWith("requirement:")) {
    return null;
  }
  const rawRef = obligationId.slice("requirement:".length);
  return /^(?:REQ|RF|R)-/iu.test(rawRef) ? normalizeRequirementId(rawRef) : rawRef;
}



function displayIdForRequirementObligation(
  obligation: SdlcTraversalObligation
): string | null {
  const concreteMatch = /^Fulfill ([^:]+):/u.exec(obligation.summary);
  if (concreteMatch?.[1] !== undefined) {
    return normalizeRequirementId(concreteMatch[1]);
  }
  const referenceMatch = /^Fulfill live requirement ([^.]+)\./u.exec(
    obligation.summary
  );
  if (referenceMatch?.[1] !== undefined) {
    return normalizeRequirementId(referenceMatch[1]);
  }
  return null;
}



function requirementLineageAuthorityRank(obligation: SdlcTraversalObligation): number {
  const refs = obligation.payload.sourceRefs;
  if (
    refs.some(
      (ref) =>
        ref.includes("/specification/requirements/") &&
        !ref.endsWith("/specification/requirements/README.md") &&
        !ref.endsWith("/specification/requirements/00-imported-sources.md")
    )
  ) {
    return 0;
  }
  if (
    refs.some(
      (ref) =>
        ref.endsWith("/specification/REQUIREMENTS.md")
    )
  ) {
    return 1;
  }
  if (
    refs.some((ref) =>
      ref.endsWith("/specification/requirements/00-imported-sources.md")
    )
  ) {
    return 2;
  }
  if (refs.some((ref) => ref.endsWith("/README.md"))) {
    return 4;
  }
  return 3;
}



function canonicalRequirementTraceObligationsForPrompt(
  manifest: SdlcWorkerHandoffManifest
): readonly SdlcTraversalObligation[] {
  const byDisplayId = new Map<string, SdlcTraversalObligation>();
  for (const obligation of manifest.traversalObligationContext.obligations) {
    if (obligation.obligationKind !== "requirement") {
      continue;
    }
    const displayId =
      displayIdForRequirementObligation(obligation) ?? obligation.obligationId;
    const existing = byDisplayId.get(displayId);
    if (
      existing === undefined ||
      requirementLineageAuthorityRank(obligation) <
        requirementLineageAuthorityRank(existing) ||
      (requirementLineageAuthorityRank(obligation) ===
        requirementLineageAuthorityRank(existing) &&
        obligation.obligationId.localeCompare(existing.obligationId) < 0)
    ) {
      byDisplayId.set(displayId, obligation);
    }
  }
  return Object.freeze([...byDisplayId.values()]);
}



function canonicalRequirementLineageMap(
  manifest: SdlcWorkerHandoffManifest
): ReadonlyMap<string, string> {
  const canonicalByDisplayId = new Map<string, string>();
  for (const obligation of canonicalRequirementTraceObligationsForPrompt(manifest)) {
    const displayId =
      displayIdForRequirementObligation(obligation) ?? obligation.obligationId;
    canonicalByDisplayId.set(displayId, obligation.obligationId);
  }
  const byObligationId = new Map<string, string>();
  for (const obligation of manifest.traversalObligationContext.obligations) {
    if (obligation.obligationKind !== "requirement") {
      continue;
    }
    const displayId =
      displayIdForRequirementObligation(obligation) ?? obligation.obligationId;
    const canonicalId = canonicalByDisplayId.get(displayId);
    if (canonicalId !== undefined) {
      byObligationId.set(obligation.obligationId, canonicalId);
    }
  }
  return byObligationId;
}



function equivalentRequirementLineageIdsByCanonical(
  manifest: SdlcWorkerHandoffManifest
): ReadonlyMap<string, readonly string[]> {
  const canonicalByObligationId = canonicalRequirementLineageMap(manifest);
  const byCanonical = new Map<string, Set<string>>();
  for (const [obligationId, canonicalId] of canonicalByObligationId.entries()) {
    const existing = byCanonical.get(canonicalId) ?? new Set<string>();
    existing.add(obligationId);
    byCanonical.set(canonicalId, existing);
  }
  return new Map(
    [...byCanonical.entries()].map(([canonicalId, equivalentIds]) => [
      canonicalId,
      uniqueSorted([...equivalentIds])
    ])
  );
}



function observedRequirementIds(input: {
  readonly outputFile: string;
  readonly materializedFiles: readonly SdlcMaterializedProductFile[];
}): ReadonlySet<string> {
  const ids = new Set<string>();
  const candidatePaths = [
    input.outputFile,
    ...input.materializedFiles.map((file) => file.absolutePath)
  ];
  for (const filePath of candidatePaths) {
    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      continue;
    }
    const content = readFileSync(filePath, "utf8");
    for (const marker of content.match(REQUIREMENT_MARKER_EXPRESSION) ?? []) {
      if (isPlaceholderRequirementMarker(marker)) {
        continue;
      }
      ids.add(normalizeRequirementId(marker));
    }
  }
  return ids;
}



function observedRequirementEvidenceContents(input: {
  readonly outputFile: string;
  readonly materializedFiles: readonly SdlcMaterializedProductFile[];
}): readonly { readonly ref: string; readonly content: string }[] {
  const candidatePaths = uniqueSorted([
    input.outputFile,
    ...input.materializedFiles.map((file) => file.absolutePath)
  ]);
  return Object.freeze(
    candidatePaths.flatMap((filePath) => {
      if (!existsSync(filePath) || !statSync(filePath).isFile()) {
        return [];
      }
      return [
        Object.freeze({
          ref: pathToFileURL(filePath).href,
          content: readFileSync(filePath, "utf8")
        })
      ];
    })
  );
}



function evidenceRefsCarryingRequirement(input: {
  readonly evidenceContents: readonly {
    readonly ref: string;
    readonly content: string;
  }[];
  readonly obligationId: string;
  readonly displayId: string | null;
  readonly equivalentObligationIds?: readonly string[] | undefined;
}): readonly string[] {
  const equivalentObligationIds = input.equivalentObligationIds ?? [];
  return uniqueSorted(
    input.evidenceContents.flatMap((entry) =>
      [
        input.obligationId,
        ...equivalentObligationIds.filter((id) => id !== input.obligationId)
      ].some((obligationId) =>
        contentCarriesRequirementObligation({
          content: entry.content,
          obligationId,
          displayId: input.displayId
        })
      )
        ? [entry.ref]
        : []
    )
  );
}



function requirementDisplayIdByObligationId(
  manifest: SdlcWorkerHandoffManifest
): ReadonlyMap<string, string> {
  const byObligationId = new Map<string, string>();
  for (const obligation of manifest.traversalObligationContext.obligations) {
    if (obligation.obligationKind !== "requirement") {
      continue;
    }
    const displayId = displayIdForRequirementObligation(obligation);
    if (displayId !== null) {
      byObligationId.set(obligation.obligationId, displayId);
    }
  }
  return byObligationId;
}



function contentCarriesRequirementObligation(input: {
  readonly content: string;
  readonly obligationId: string;
  readonly displayId: string | null;
}): boolean {
  if (input.content.includes(input.obligationId)) {
    return true;
  }
  if (input.obligationId.startsWith("requirement:")) {
    const authorityRef = input.obligationId.slice("requirement:".length);
    if (authorityRef.length > 0 && input.content.includes(authorityRef)) {
      return true;
    }
  }
  if (input.displayId === null) {
    return false;
  }
  const normalizedDisplayId = normalizeRequirementId(input.displayId);
  return (input.content.match(REQUIREMENT_MARKER_EXPRESSION) ?? []).some((marker) => {
    if (isPlaceholderRequirementMarker(marker)) {
      return false;
    }
    return normalizeRequirementId(marker) === normalizedDisplayId;
  });
}



function materializedFileRequirementLineage(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly report: SdlcWorkerResultReport;
}): ReadonlyMap<string, readonly string[]> {
  if (!productMaterializationRequirementLineageRequired(input.manifest)) {
    return new Map();
  }
  const lineageByPath = new Map<string, Set<string>>();
  const canonicalByObligationId = canonicalRequirementLineageMap(input.manifest);
  const requirementDisplayIds = requirementDisplayIdByObligationId(input.manifest);
  const equivalentRequirementIdsByCanonical =
    equivalentRequirementLineageIdsByCanonical(input.manifest);
  const fileRefByPath = new Map(
    input.report.materializedFiles.map((file) => [
      resolve(file.absolutePath),
      pathToFileURL(resolve(file.absolutePath)).href
    ])
  );
  for (const file of input.report.materializedFiles) {
    if (file.requirementTraceObligationIds !== undefined) {
      const existing = lineageByPath.get(resolve(file.absolutePath)) ?? new Set<string>();
      for (const requirementId of file.requirementTraceObligationIds) {
        existing.add(canonicalByObligationId.get(requirementId) ?? requirementId);
      }
      lineageByPath.set(resolve(file.absolutePath), existing);
    }
  }
  for (const assessment of input.report.obligationAssessments) {
    if (
      !assessment.obligationId.startsWith("requirement:") ||
      assessment.fulfillmentStatus !== "fulfilled"
    ) {
      continue;
    }
    const evidenceRefs = new Set(
      assessment.evidenceRefs.flatMap((ref) => coverageRefAliases(ref))
    );
    for (const [absolutePath, fileRef] of fileRefByPath.entries()) {
      const fileAliases = [
        ...coverageRefAliases(fileRef),
        ...coverageRefAliases(absolutePath)
      ];
      if (!fileAliases.some((alias) => evidenceRefs.has(alias))) {
        continue;
      }
      const content =
        existsSync(absolutePath) && statSync(absolutePath).isFile()
          ? readFileSync(absolutePath, "utf8")
          : "";
      const canonicalRequirementId =
        canonicalByObligationId.get(assessment.obligationId) ??
        assessment.obligationId;
      const equivalentIds =
        equivalentRequirementIdsByCanonical.get(canonicalRequirementId) ??
        Object.freeze([assessment.obligationId, canonicalRequirementId]);
      if (
        !equivalentIds.some((obligationId) =>
          contentCarriesRequirementObligation({
            content,
            obligationId,
            displayId:
              requirementDisplayIds.get(obligationId) ??
              requirementDisplayIds.get(assessment.obligationId) ??
              requirementDisplayIds.get(canonicalRequirementId) ??
              null
          })
        )
      ) {
        continue;
      }
      const existing = lineageByPath.get(absolutePath) ?? new Set<string>();
      existing.add(canonicalRequirementId);
      lineageByPath.set(absolutePath, existing);
    }
  }
  return new Map(
    [...lineageByPath.entries()].map(([absolutePath, ids]) => [
      absolutePath,
      uniqueSorted([...ids])
    ])
  );
}



function requirementObligationBelongsToDownstreamSurface(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly obligation: SdlcTraversalObligation;
  readonly canonicalByObligationId: ReadonlyMap<string, string>;
  readonly liteComponentCodeScopeRequirementIds: ReadonlySet<string> | null;
}): boolean {
  if (
    input.manifest.targetAssetType !== "component_code_surface" ||
    input.obligation.obligationKind !== "requirement"
  ) {
    return false;
  }
  if (input.liteComponentCodeScopeRequirementIds !== null) {
    const canonicalRequirementId =
      input.canonicalByObligationId.get(input.obligation.obligationId) ??
      input.obligation.obligationId;
    if (!input.liteComponentCodeScopeRequirementIds.has(canonicalRequirementId)) {
      return true;
    }
  }
  const requirementText = [
    input.obligation.summary,
    ...input.obligation.payload.sourceSnippets
  ]
    .join("\n")
    .toLowerCase();
  if (/\b(?:test|uat|acceptance|execution\s+proof|smoke\s+proof)\b/u.test(requirementText)) {
    return true;
  }
  return input.obligation.payload.sourceRefs.some((ref) => {
    const lower = ref.toLowerCase();
    return (
      lower.includes("adr-003-test-design-surface.md") ||
      lower.includes("/component_test_surface.md") ||
      lower.includes("/uat_test_source_surface.md") ||
      lower.includes("/component_test_") ||
      lower.includes("test-design-surface")
    );
  });
}


function liteComponentCodeScopeRequirementIds(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly canonicalByObligationId: ReadonlyMap<string, string>;
}): ReadonlySet<string> | null {
  if (
    input.manifest.edgeName !== FG_DERIVE_LITE_COMPONENT_CODE_SURFACE ||
    input.manifest.targetAssetType !== "component_code_surface"
  ) {
    return null;
  }
  const admission = admitComponentDepthRegisterFromArtifact({
    targetAssetType: input.manifest.targetAssetType,
    outputFile: input.manifest.outputFile
  });
  if (admission.status !== "admitted" || admission.register === null) {
    return null;
  }
  const ids = new Set<string>();
  for (const row of [
    ...admission.register.componentTopologyRows,
    ...admission.register.componentRealizationRows
  ]) {
    for (const requirementId of row.requirementIds) {
      ids.add(input.canonicalByObligationId.get(requirementId) ?? requirementId);
    }
  }
  return ids.size === 0 ? null : ids;
}



function productMaterializationRequirementLineageRequired(
  manifest: SdlcWorkerHandoffManifest
): boolean {
  return (
    manifest.productMaterialization.required &&
    requirementTraceObligationIdsForPrompt(manifest).length > 0 &&
    (manifest.targetAssetType === "component_code_surface" ||
      manifest.targetAssetType === "component_test_surface" ||
      manifest.targetAssetType === "uat_test_source_surface" ||
      manifest.targetAssetType === "code_surface")
  );
}



function workerReportWithMaterializedRequirementLineage(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly report: SdlcWorkerResultReport;
}): SdlcWorkerResultReport {
  const lineageByPath = materializedFileRequirementLineage(input);
  if (lineageByPath.size === 0) {
    return input.report;
  }
  return Object.freeze({
    ...input.report,
    materializedFiles: Object.freeze(
      input.report.materializedFiles.map((file) => {
        const requirementTraceObligationIds = lineageByPath.get(
          resolve(file.absolutePath)
        );
        if (
          requirementTraceObligationIds === undefined ||
          requirementTraceObligationIds.length === 0
        ) {
          return file;
        }
        return Object.freeze({
          ...file,
          requirementTraceObligationIds
        });
      })
    )
  });
}



function postTransformObligationAssessments(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly materializedFiles: readonly SdlcMaterializedProductFile[];
}): readonly SdlcWorkerObligationAssessment[] {
  const outputRef = pathToFileURL(input.manifest.outputFile).href;
  const materializedRefs = input.materializedFiles.map((file) =>
    pathToFileURL(file.absolutePath).href
  );
  const baseEvidenceRefs = Object.freeze([outputRef, ...materializedRefs]);
  const observedRequirements = observedRequirementIds({
    outputFile: input.manifest.outputFile,
    materializedFiles: input.materializedFiles
  });
  const observedRequirementContents = observedRequirementEvidenceContents({
    outputFile: input.manifest.outputFile,
    materializedFiles: input.materializedFiles
  });
  const canonicalByObligationId = canonicalRequirementLineageMap(input.manifest);
  const equivalentIdsByCanonical =
    equivalentRequirementLineageIdsByCanonical(input.manifest);
  const liteScopeRequirementIds = liteComponentCodeScopeRequirementIds({
    manifest: input.manifest,
    canonicalByObligationId
  });
  const assessments = input.manifest.traversalObligationContext.obligations.map((obligation) => {
      const requirementId = requirementIdForObligation(obligation.obligationId);
    if (requirementId !== null) {
        const displayId = displayIdForRequirementObligation(obligation);
        const canonicalRequirementId =
          canonicalByObligationId.get(obligation.obligationId) ??
          obligation.obligationId;
        const evidenceRefs = evidenceRefsCarryingRequirement({
          evidenceContents: observedRequirementContents,
          obligationId: obligation.obligationId,
          displayId,
          equivalentObligationIds:
            equivalentIdsByCanonical.get(canonicalRequirementId) ??
            Object.freeze([canonicalRequirementId])
        });
        const observed = evidenceRefs.length > 0;
        const recordsRequirementSurfaceOnly =
          input.manifest.targetAssetType === "requirement_surface";
        const carriesAuthorityRequirementForward =
          input.manifest.graphFunctionName === FG_CONFORM_PROJECT_AUTHORITY &&
          !input.manifest.productMaterialization.required &&
          !recordsRequirementSurfaceOnly;
        const carriesNonMaterializedRequirementForward =
          !input.manifest.productMaterialization.required &&
          !recordsRequirementSurfaceOnly;
        const carriesDownstreamSurfaceRequirement =
          !observed &&
          requirementObligationBelongsToDownstreamSurface({
            manifest: input.manifest,
            obligation,
            canonicalByObligationId,
            liteComponentCodeScopeRequirementIds: liteScopeRequirementIds
          });
        const fulfillmentStatus =
          observed && recordsRequirementSurfaceOnly
            ? "partial"
            : observed
              ? "fulfilled"
              : carriesDownstreamSurfaceRequirement
                ? "partial"
              : carriesAuthorityRequirementForward ||
                  carriesNonMaterializedRequirementForward
                ? "partial"
                : "blocked";
        return Object.freeze({
          kind: "sdlc_worker_obligation_assessment" as const,
          obligationId: obligation.obligationId,
          fulfillmentStatus,
          evidenceRefs: observed ? evidenceRefs : obligation.evidenceRefs,
          blockingReasons:
            fulfillmentStatus === "fulfilled"
              ? Object.freeze([])
              : Object.freeze([
                  carriesAuthorityRequirementForward
                    ? `requirement_carried_for_downstream_closure:${requirementId}`
                    : carriesNonMaterializedRequirementForward
                    ? `requirement_carried_for_downstream_closure:${requirementId}`
                    : carriesDownstreamSurfaceRequirement
                    ? `requirement_carried_for_downstream_closure:${requirementId}`
                    : observed
                    ? `requirement_recorded_for_future_closure:${requirementId}`
                    : `requirement_trace_not_observed:${requirementId}`
                ])
        });
      }
      if (obligation.obligationKind === "source_asset") {
        const fulfilled = existsSync(input.manifest.outputFile);
        const sourceAssetType = obligation.obligationId.slice("source_asset:".length);
        const derivedEvidenceRefs =
          input.manifest.targetAssetType === "test_run_archive_surface" &&
          sourceAssetType === "test_execution_result_surface"
            ? latestExecutionResultReportRefs(input.manifest)
            : Object.freeze([]);
        const evidenceRefs = fulfilled
          ? uniqueSorted([
              ...baseEvidenceRefs,
              ...obligation.evidenceRefs,
              ...derivedEvidenceRefs
            ])
          : obligation.evidenceRefs;
        return Object.freeze({
          kind: "sdlc_worker_obligation_assessment" as const,
          obligationId: obligation.obligationId,
          fulfillmentStatus: fulfilled ? "fulfilled" : "blocked",
          evidenceRefs,
          blockingReasons: fulfilled
            ? Object.freeze([])
            : Object.freeze(["post_transform_output_missing"])
        });
      }
      if (obligation.obligationKind === "target_asset") {
        const fulfilled =
          existsSync(input.manifest.outputFile) &&
          (!input.manifest.productMaterialization.required ||
            input.materializedFiles.length > 0);
        return Object.freeze({
          kind: "sdlc_worker_obligation_assessment" as const,
          obligationId: obligation.obligationId,
          fulfillmentStatus: fulfilled ? "fulfilled" : "blocked",
          evidenceRefs: baseEvidenceRefs,
          blockingReasons: fulfilled
            ? Object.freeze([])
            : Object.freeze(["target_transform_output_not_observed"])
        });
      }
      return Object.freeze({
        kind: "sdlc_worker_obligation_assessment" as const,
        obligationId: obligation.obligationId,
        fulfillmentStatus: existsSync(input.manifest.outputFile)
          ? "fulfilled"
          : "blocked",
        evidenceRefs:
          baseEvidenceRefs.length > 0
            ? baseEvidenceRefs
            : obligation.evidenceRefs,
        blockingReasons: existsSync(input.manifest.outputFile)
          ? Object.freeze([])
          : Object.freeze(["post_transform_output_missing"])
      });
    });
  if (input.manifest.graphFunctionName === FG_CONFORM_PROJECT_AUTHORITY) {
    const existingRequirementIds = new Set<string>();
    for (const obligation of input.manifest.traversalObligationContext.obligations) {
      const requirementId = requirementIdForObligation(obligation.obligationId);
      if (requirementId !== null) {
        existingRequirementIds.add(requirementId);
      }
      const displayId =
        obligation.obligationKind === "requirement"
          ? displayIdForRequirementObligation(obligation)
          : null;
      if (displayId !== null) {
        existingRequirementIds.add(displayId);
      }
    }
    for (const requirementId of [...observedRequirements].sort()) {
      if (existingRequirementIds.has(requirementId)) {
        continue;
      }
      const evidenceRefs = evidenceRefsCarryingRequirement({
        evidenceContents: observedRequirementContents,
        obligationId: `requirement:${requirementId}`,
        displayId: requirementId
      });
      assessments.push(
        Object.freeze({
          kind: "sdlc_worker_obligation_assessment" as const,
          obligationId: `requirement:${requirementId}`,
          fulfillmentStatus: "fulfilled" as const,
          evidenceRefs: evidenceRefs.length > 0 ? evidenceRefs : [outputRef],
          blockingReasons: Object.freeze([])
        })
      );
    }
  }
  return Object.freeze(assessments);
}



export function buildPostTransformWorkerResultReport(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly before: SdlcProductMaterializationSnapshot;
}): SdlcWorkerResultReport {
  const materializationObservation =
    observeProductMaterializationDeltaWithDiagnostics(input);
  const materializedFiles = materializationObservation.materializedFiles;
  if (!existsSync(input.manifest.outputFile)) {
    throw new TypeError("post-transform output artifact missing");
  }
  const content = readFileSync(input.manifest.outputFile, "utf8");
  const extractedExecutionEvidence = extractExecutionEvidenceFromTransformArtifact({
    manifest: input.manifest,
    content
  });
  const report = Object.freeze({
    kind: "odd_sdlc.worker_result_report" as const,
    projectionRole: "typed_fp_stage_projection" as const,
    authoritativeStageResultRef: expectedFpEvaluateResultRef(input.manifest),
    graphFunctionName: input.manifest.graphFunctionName,
    edgeName: input.manifest.edgeName,
    targetAssetType: input.manifest.targetAssetType,
    outputFile: resolve(input.manifest.outputFile),
    digest: sha256Text(content),
    summary: "framework-generated post-transform report from observed artifacts",
    unresolvedReasons: Object.freeze([]),
    materializedFiles,
    materializationDiagnostics: materializationObservation.diagnostics,
    executionEvidence: extractedExecutionEvidence.executionEvidence,
    executionEvidenceErrors: extractedExecutionEvidence.errors,
    obligationAssessments: postTransformObligationAssessments({
      manifest: input.manifest,
      materializedFiles
    }),
    subworkstreamManifest: computeSubworkstreamManifestForTransformReport({
      manifest: input.manifest,
      source: "parent_transform_report"
    }),
    fpTransformRequestRef: input.manifest.fpTransformRequest?.requestRef ?? null,
    fpTransformResultRef:
      input.manifest.fpTransformRequest === null
        ? null
        : pathToFileURL(input.manifest.fpTransformResultFile).href,
    fpTransformStatusSnapshot:
      input.manifest.fpTransformRequest === null ? null : "returned",
    fpEvaluateResultRef: expectedFpEvaluateResultRef(input.manifest)
  });
  return workerReportWithMaterializedRequirementLineage({
    manifest: input.manifest,
    report
  });
}



function reportEvidenceRefs(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly report: SdlcWorkerResultReport;
}): readonly string[] {
  const report = workerResultReportWithReplayedProductMaterialization(input);
  return uniqueSorted([
    pathToFileURL(report.outputFile).href,
    pathToFileURL(input.manifest.reportFile).href,
    pathToFileURL(input.manifest.subworkstreamManifestFile).href,
    pathToFileURL(input.manifest.productMaterialization.manifestFile).href,
    ...report.materializedFiles.map((file) =>
      pathToFileURL(file.absolutePath).href
    ),
    ...(report.executionEvidence?.reportRefs ?? []),
    ...(report.executionEvidence?.shardEvidence.flatMap(
      (shard) => shard.reportRefs
    ) ?? [])
  ]);
}



function reportOutputArtifactIsAdmitted(report: SdlcWorkerResultReport): boolean {
  const outputFile = resolve(report.outputFile);
  if (!existsSync(outputFile) || !statSync(outputFile).isFile()) {
    return false;
  }
  return sha256Text(readFileSync(outputFile, "utf8")) === report.digest;
}



function transformStatusForReport(
  report: SdlcWorkerResultReport
): FpTransformResult["status"] {
  return reportOutputArtifactIsAdmitted(report) ? "returned" : "blocked";
}



function transformReasonForReport(report: SdlcWorkerResultReport): string | null {
  return reportOutputArtifactIsAdmitted(report)
    ? null
    : "transform output artifact missing or digest mismatch";
}



function computeSubworkstreamManifestForTransformReport(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly source?: "parent_transform_report" | "system_default" | undefined;
}): SdlcWorkerResultReport["subworkstreamManifest"] {
  const parentResultRef = pathToFileURL(input.manifest.reportFile).href;
  if (!existsSync(input.manifest.subworkstreamManifestFile)) {
    return defaultComputeSubworkstreamManifest({
      manifest: input.manifest,
      stageRef: "transform.C",
      source: input.source ?? "system_default",
      parentResultRef
    });
  }
  return admitComputeSubworkstreamManifest({
    value: JSON.parse(readFileSync(input.manifest.subworkstreamManifestFile, "utf8")),
    manifest: input.manifest,
    stageRef: "transform.C",
    source: input.source ?? "parent_transform_report",
    parentResultRef
  });
}



function isOpenRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}



function parseOpenRecord(input: unknown, label: string): Record<string, unknown> {
  if (!isOpenRecord(input)) {
    throw new TypeError(`${label}: expected object`);
  }
  return input;
}



function materializationReplayIsNeeded(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly report: SdlcWorkerResultReport;
}): boolean {
  const contract = input.manifest.productMaterialization;
  if (!contract.required) {
    return false;
  }
  const productFiles = input.report.materializedFiles.filter(
    (file) => resolve(file.absolutePath) !== resolve(input.manifest.outputFile)
  );
  const requiredRoleMissing = contract.requiredRoles.some(
    (requiredRole) => !productFiles.some((file) => file.role === requiredRole)
  );
  const authority = reconcileSdlcProductMaterializationAuthority(input.manifest);
  if (authority.declaredProductTargetContracts.length > 0) {
    return (
      requiredRoleMissing ||
      authority.declaredProductTargetContracts.some(
        (target) =>
          !productFiles.some((file) =>
            materializedProductFileSatisfiesDeclaredTarget({
              manifest: input.manifest,
              file,
              target
            })
        )
      )
    );
  }
  return productFiles.length === 0 || requiredRoleMissing;
}



function materializedProductFileSatisfiesDeclaredTarget(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly file: SdlcMaterializedProductFile;
  readonly target: SdlcProductMaterializationAuthorityTarget;
}): boolean {
  return (
    input.file.role === input.target.requiredRole &&
    productAuthorityTargetCoversRelativePath({
      manifest: input.manifest,
      target: input.target,
      normalizedRelativePath: input.file.relativePath.split(path.sep).join("/")
    })
  );
}



function productMaterializationReplayDeps(): ProductMaterializationReplayDeps {
  return {
    uniqueSorted,
    workerReportWithMaterializedRequirementLineage,
    materializationReplayIsNeeded,
    currentAttemptMaterializedFile,
    replayMaterializedFile,
    admitReplayManifestMaterializedProductFile,
    isTenantDeclaredToolByproductRelativePath,
    materializedFileLineageRef
  };
}



export function resolveProductMaterializationReplay(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly report: SdlcWorkerResultReport;
}): {
  readonly report: SdlcWorkerResultReport;
  readonly diagnostics: readonly {
    readonly code: SdlcBlockingReasonCode;
    readonly detail: string;
    readonly evidenceRefs: readonly string[];
  }[];
  readonly replay: {
    readonly currentAttemptMaterializedFileCount: number;
    readonly replayedMaterializedFileCount: number;
    readonly effectiveMaterializedFileCount: number;
    readonly lineageRefs: readonly string[];
  } | null;
} {
  return resolveProductMaterializationReplayFromModule(
    input,
    productMaterializationReplayDeps()
  );
}



export function workerResultReportWithReplayedProductMaterialization(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly report: SdlcWorkerResultReport;
}): SdlcWorkerResultReport {
  return workerResultReportWithReplayedProductMaterializationFromModule(
    input,
    productMaterializationReplayDeps()
  );
}



export function workerResultReportWithFpStageRefs(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly report: SdlcWorkerResultReport;
}): SdlcWorkerResultReport {
  return Object.freeze({
    ...input.report,
    projectionRole: "typed_fp_stage_projection" as const,
    authoritativeStageResultRef: expectedFpEvaluateResultRef(input.manifest),
    fpTransformRequestRef:
      input.report.fpTransformRequestRef ??
      input.manifest.fpTransformRequest?.requestRef ??
      null,
    fpTransformResultRef:
      input.report.fpTransformResultRef ??
      (input.manifest.fpTransformRequest === null
        ? null
        : pathToFileURL(input.manifest.fpTransformResultFile).href),
    fpTransformStatusSnapshot:
      input.report.fpTransformStatusSnapshot ??
      (input.manifest.fpTransformRequest === null
        ? null
        : transformStatusForReport(input.report)),
    fpEvaluateResultRef:
      input.report.fpEvaluateResultRef ??
      expectedFpEvaluateResultRef(input.manifest)
  });
}



function evidenceCandidatesForReport(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly report: SdlcWorkerResultReport;
}): NonNullable<Parameters<typeof constructFpTransformResult>[0]["evidenceCandidates"]> {
  const assessments = input.report.obligationAssessments;
  const outputArtifactAdmitted = reportOutputArtifactIsAdmitted(input.report);
  const fulfilledCount = assessments.filter(
    (assessment) => assessment.fulfillmentStatus === "fulfilled"
  ).length;
  const blockedCount = assessments.filter(
    (assessment) => assessment.fulfillmentStatus === "blocked"
  ).length;
  const unassessedCount = assessments.filter(
    (assessment) => assessment.fulfillmentStatus === "unassessed"
  ).length;
  const assessmentEvidenceRefs = reportEvidenceRefs(input);
  const carriedRequirementAssessments = assessments.filter(
    (assessment) =>
      assessment.obligationId.startsWith("requirement:") &&
      (assessment.fulfillmentStatus === "fulfilled" ||
        assessment.fulfillmentStatus === "partial")
  );
  const candidates = [
    {
      candidateRef: `target_asset:${input.manifest.targetAssetType}`,
      authorityRef: `asset-type://${input.manifest.targetAssetType}`,
      evidenceRefs: assessmentEvidenceRefs,
      payloadClass: "sdlc_transform_output",
      contractRef: "contract://odd_sdlc/fp-transform-output",
      complete: outputArtifactAdmitted,
      shallow: !outputArtifactAdmitted,
      contradictsAuthority: false,
      deferred: false
    },
    {
      candidateRef: `obligation_assessment_set:${input.manifest.edgeName}`,
      authorityRef: `traversal-intent-package:${input.manifest.traversalIntentPackage.packageDigest}`,
      evidenceRefs: assessmentEvidenceRefs,
      payloadClass: "sdlc_obligation_assessment_set",
      contractRef: "contract://odd_sdlc/fp-transform-obligation-assessment-set",
      complete: assessments.length > 0 && fulfilledCount === assessments.length,
      shallow: blockedCount > 0 || unassessedCount > 0,
      contradictsAuthority: blockedCount > 0,
      deferred: unassessedCount > 0
    }
  ];
  if (
    input.manifest.graphFunctionName === FG_CONFORM_PROJECT_AUTHORITY &&
    carriedRequirementAssessments.length > 0
  ) {
    candidates.push({
      candidateRef: "carried_asset:requirement_surface",
      authorityRef: "asset-type://requirement_surface",
      evidenceRefs: assessmentEvidenceRefs,
      payloadClass: "sdlc_transform_carried_asset",
      contractRef: "contract://odd_sdlc/fp-transform-carried-requirement-surface",
      complete: outputArtifactAdmitted,
      shallow: !outputArtifactAdmitted,
      contradictsAuthority: false,
      deferred: false
    });
  }
  return Object.freeze(candidates);
}



export function constructWorkerFpTransformResult(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly report: SdlcWorkerResultReport;
}): FpTransformResult | null {
  const request = input.manifest.fpTransformRequest;
  if (request === null) {
    return null;
  }
  return admitFpTransformResultForRequest(
    request,
    constructFpTransformResult({
      request,
      artifactRef: pathToFileURL(input.report.outputFile).href,
      status: transformStatusForReport(input.report),
      reason: transformReasonForReport(input.report),
      evidenceCandidates: evidenceCandidatesForReport(input)
    })
  );
}



export function writeWorkerFpTransformResult(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly report: SdlcWorkerResultReport;
}): FpTransformResult | null {
  const result = constructWorkerFpTransformResult(input);
  if (result === null) {
    return null;
  }
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "fp_transform_result.json",
    payload: result
  });
  return result;
}



export function readWorkerResultReport(
  manifest: SdlcWorkerHandoffManifest
): SdlcWorkerResultReport {
  const payload: unknown = JSON.parse(readFileSync(manifest.reportFile, "utf8"));
  return admitWorkerResultReport(payload, manifest);
}
