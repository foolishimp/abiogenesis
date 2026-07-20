// Private T-281 owner inputs for the closed project.read relation. Result
// contracts remain with their semantic owners and public projection is P2 work.

import * as v from "valibot";

import {
  stableJsonEquals,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import { freezeNativeValue } from "../../../shared/validation/immutable_native_value.js";
import {
  POSITIVE_INTEGER_ACTION,
  refSchema,
  refTextSchema,
  SAFE_INTEGER_ACTION,
  safePositiveIntegerSchema,
  sha256DigestSchema,
  uniqueByNativeIdentityArray
} from "../../../shared/validation/native_contract_primitives.js";
import { ownerNativeDefinitionContractSource } from "../../../shared/validation/owner_native_operation_contract_source.js";

const MODULE_PATH =
  "code/src/app/m04/public_contracts/project_read_operation_contracts.js" as const;
const EXPORT_NAME = "PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES";
const CHECK_REGISTRY_EXPORT_NAME =
  "PROJECT_READ_OPERATION_NATIVE_CHECK_REGISTRY";
const PROJECT_READ_SEMANTIC_OWNER = freezeNativeValue({
  product: "abiogenesis",
  module: "app.m04",
  family: "project_read_contract_family"
} as const);
const PROJECT_READ_SEMANTIC_OWNER_BASIS = freezeNativeValue({
  ref: "specification/requirements/abg/REQ-R-ABG3-PROJECTION.md#REQ-R-ABG3-PROJECTION-023",
  digest:
    "sha256:ea67216190dc59dd14eac9797ab544ee79d9798673a82925d2d8bcddb2a2dfb5"
} as const);

const PROJECT_READ_GENERAL_REFUSAL_REASONS = Object.freeze([
  "unknown_source",
  "source_kind_mismatch",
  "source_digest_mismatch",
  "projection_basis_mismatch",
  "projection_unsupported",
  "not_found",
  "not_ready"
] as const);

const refDigestSchema = v.pipe(
  v.strictObject({
    ref: refSchema,
    digest: sha256DigestSchema
  }),
  v.readonly()
);
const refListSchema = v.pipe(
  uniqueByNativeIdentityArray(refSchema),
  v.readonly()
);
const nonEmptyRefListSchema = v.pipe(
  uniqueByNativeIdentityArray(refSchema),
  v.minLength(1),
  v.readonly()
);
const safeNonNegativeIntegerSchema = v.pipe(
  v.number(),
  POSITIVE_INTEGER_ACTION,
  SAFE_INTEGER_ACTION,
  v.minValue(0)
);
const canonicalCatalogHandleSchema = v.pipe(
  refTextSchema,
  v.brand("CanonicalCatalogHandle")
);

type ProjectReadDefinitionKey<CaseKey extends string = string> = Readonly<{
  operationId: "abg.operation.project.read";
  memberKind: "project_read_case";
  caseKey: CaseKey;
}>;

type ProjectReadSource = Readonly<{
  kind: string;
  sourceRef: string;
  sourceDigest: string;
}>;

export interface ProjectReadProjectionBasis<CaseKey extends string = string> {
  readonly kind: "project_read_projection_basis";
  readonly definitionKey: ProjectReadDefinitionKey<CaseKey>;
  readonly source: ProjectReadSource;
  readonly selector: unknown;
}

export interface ProjectReadProjectionBasisCoordinate {
  readonly ref: string;
  readonly digest: `sha256:${string}`;
}

function hasExactOwnKeys(input: object, expected: readonly string[]): boolean {
  const actual = Reflect.ownKeys(input);
  return (
    actual.length === expected.length &&
    expected.every((key) => actual.includes(key))
  );
}

/** @internal */
export function deriveProjectReadProjectionBasis<
  const CaseKey extends string
>(
  input: ProjectReadProjectionBasis<CaseKey>
): ProjectReadProjectionBasisCoordinate {
  if (
    !hasExactOwnKeys(input, ["kind", "definitionKey", "source", "selector"]) ||
    input.kind !== "project_read_projection_basis" ||
    !hasExactOwnKeys(input.definitionKey, [
      "operationId",
      "memberKind",
      "caseKey"
    ]) ||
    input.definitionKey.operationId !== "abg.operation.project.read" ||
    input.definitionKey.memberKind !== "project_read_case" ||
    input.definitionKey.caseKey.length === 0 ||
    !hasExactOwnKeys(input.source, ["kind", "sourceRef", "sourceDigest"]) ||
    input.source.kind.length === 0 ||
    input.source.sourceRef.length === 0 ||
    !/^sha256:[0-9a-f]{64}$/u.test(input.source.sourceDigest)
  ) {
    throw new TypeError("project.read projection basis: malformed authority input");
  }
  const digest = stableSha256Digest(input);
  return freezeNativeValue({
    ref: `project-read-basis:${digest}`,
    digest
  });
}

function projectReadDefinitionKey(caseKey: string): ProjectReadDefinitionKey {
  return freezeNativeValue({
    operationId: "abg.operation.project.read",
    memberKind: "project_read_case",
    caseKey
  });
}

function projectionBasisMatchesRequest(input: unknown): boolean {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return false;
  }
  const caseKey: unknown = Reflect.get(input, "caseKey");
  const sourceInput: unknown = Reflect.get(input, "source");
  const projectionBasis: unknown = Reflect.get(input, "projectionBasis");
  if (
    typeof caseKey !== "string" ||
    typeof sourceInput !== "object" ||
    sourceInput === null ||
    Array.isArray(sourceInput)
  ) {
    return false;
  }
  const kind: unknown = Reflect.get(sourceInput, "kind");
  const sourceRef: unknown = Reflect.get(sourceInput, "sourceRef");
  const sourceDigest: unknown = Reflect.get(sourceInput, "sourceDigest");
  if (
    typeof kind !== "string" ||
    typeof sourceRef !== "string" ||
    typeof sourceDigest !== "string"
  ) {
    return false;
  }
  try {
    return stableJsonEquals(
      projectionBasis,
      deriveProjectReadProjectionBasis({
        kind: "project_read_projection_basis",
        definitionKey: projectReadDefinitionKey(caseKey),
        source: { kind, sourceRef, sourceDigest },
        selector: Reflect.get(input, "selector")
      })
    );
  } catch {
    return false;
  }
}

const PROJECT_READ_PROJECTION_BASIS_CHECKS: {
  checkId: string;
  action: object;
  relationRef: "REQ-R-ABG3-PROJECTION-023";
}[] = [];

const emptySelectorSchema = v.pipe(
  v.strictObject({}),
  v.readonly(),
  v.brand("ProjectReadEmptySelector")
);
const catalogVisibilityBasisSchema = v.union([
  v.literal("workspace_catalog"),
  v.pipe(
    v.strictObject({
      kind: v.literal("session_view"),
      view: refDigestSchema
    }),
    v.readonly()
  )
]);
const catalogListSelectorSchema = v.pipe(
  v.strictObject({
    visibilityBasis: catalogVisibilityBasisSchema
  }),
  v.readonly()
);
const catalogDescribeSelectorSchema = v.pipe(
  v.strictObject({
    visibilityBasis: catalogVisibilityBasisSchema,
    canonicalHandle: canonicalCatalogHandleSchema
  }),
  v.readonly()
);
const installEvidenceSelectorSchema = v.pipe(
  v.strictObject({ installManifest: refDigestSchema }),
  v.readonly()
);
const releaseEvidenceSelectorSchema = v.pipe(
  v.strictObject({ releaseSnapshotManifest: refDigestSchema }),
  v.readonly()
);
const replayWindowFields = {
  fromOrdinal: safeNonNegativeIntegerSchema,
  limit: safePositiveIntegerSchema
} as const;
const replaySelectorSchema = v.pipe(
  v.strictObject(replayWindowFields),
  v.readonly()
);
const workspaceReplaySelectorSchema = v.pipe(
  v.strictObject({
    runtimeEventLog: refDigestSchema,
    ...replayWindowFields
  }),
  v.readonly()
);
const cCallReplaySelectorSchema = v.pipe(
  v.strictObject({
    ...replayWindowFields,
    cCall: refDigestSchema
  }),
  v.readonly()
);
const workspaceGapsSelectorSchema = v.pipe(
  v.strictObject({ gapBasis: refDigestSchema }),
  v.readonly()
);
const lawfulActionsSelectorSchema = v.pipe(
  v.strictObject({ nextActionProjection: refDigestSchema }),
  v.readonly()
);
const observerReportSelectorSchema = v.pipe(
  v.strictObject({
    observationBasis: refDigestSchema,
    sourceProjectionRefs: nonEmptyRefListSchema
  }),
  v.readonly()
);
const observerDraftsSelectorSchema = v.pipe(
  v.strictObject({ observerObservables: refDigestSchema }),
  v.readonly()
);
const tuningReportSelectorSchema = v.pipe(
  v.strictObject({ tuningTelemetryBasis: refDigestSchema }),
  v.readonly()
);
const ticketConsensusSelectorSchema = v.pipe(
  v.strictObject({
    ticket: refDigestSchema,
    outputAuthority: refDigestSchema,
    replayBasis: refDigestSchema
  }),
  v.readonly()
);

type NativeSchema = v.GenericSchema;

function projectReadContractSet<
  const CaseKey extends string,
  const SourceKind extends string,
  const SelectorSchema extends NativeSchema,
  const ExtraRefusalReasons extends readonly string[]
>(input: {
  readonly caseKey: CaseKey;
  readonly sourceKind: SourceKind;
  readonly selectorSchema: SelectorSchema;
  readonly extraRefusalReasons: ExtraRefusalReasons;
}) {
  const sourceSchema = v.pipe(
    v.strictObject({
      kind: v.literal(input.sourceKind),
      sourceRef: refSchema,
      sourceDigest: sha256DigestSchema
    }),
    v.readonly()
  );
  const requestBaseSchema = v.strictObject({
    kind: v.literal("project_read_request"),
    caseKey: v.literal(input.caseKey),
    source: sourceSchema,
    projectionBasis: refDigestSchema,
    selector: input.selectorSchema
  });
  const projectionBasisAction = Object.freeze(v.check(
    (request: v.InferOutput<typeof requestBaseSchema>) =>
      projectionBasisMatchesRequest(request),
    "project.read projection basis must match its exact definition, source, and selector"
  ));
  PROJECT_READ_PROJECTION_BASIS_CHECKS.push({
    checkId: `projection-basis-authority-${input.caseKey}`,
    action: projectionBasisAction,
    relationRef: "REQ-R-ABG3-PROJECTION-023"
  });
  const requestSchema = v.pipe(
    requestBaseSchema,
    projectionBasisAction,
    v.readonly()
  );
  const refusalSchema = v.pipe(
    v.strictObject({
      kind: v.literal("project_read_refusal"),
      caseKey: v.literal(input.caseKey),
      source: sourceSchema,
      projectionBasis: refDigestSchema,
      code: v.picklist([
        ...PROJECT_READ_GENERAL_REFUSAL_REASONS,
        ...input.extraRefusalReasons
      ]),
      residualRefs: nonEmptyRefListSchema,
      evidenceRefs: refListSchema,
      provenanceRefs: refListSchema
    }),
    v.readonly()
  );
  const definitionKey = {
    operationId: "abg.operation.project.read",
    memberKind: "project_read_case",
    caseKey: input.caseKey
  } as const;

  return freezeNativeValue({
    request: ownerNativeDefinitionContractSource({
      owner: PROJECT_READ_SEMANTIC_OWNER,
      definitionKey,
      slot: "request",
      semanticOwnerBasis: PROJECT_READ_SEMANTIC_OWNER_BASIS,
      modulePath: MODULE_PATH,
      exportName: EXPORT_NAME,
      memberPath: [input.caseKey, "request"],
      namedChecks: {
        kind: "family_registry",
        exportName: CHECK_REGISTRY_EXPORT_NAME,
        memberPath: []
      },
      schema: requestSchema
    }),
    refusal: ownerNativeDefinitionContractSource({
      owner: PROJECT_READ_SEMANTIC_OWNER,
      definitionKey,
      slot: "refusal",
      semanticOwnerBasis: PROJECT_READ_SEMANTIC_OWNER_BASIS,
      modulePath: MODULE_PATH,
      exportName: EXPORT_NAME,
      memberPath: [input.caseKey, "refusal"],
      namedChecks: { kind: "none" },
      schema: refusalSchema
    })
  });
}

const replayRefusalReasons = Object.freeze([
  "cursor_invalid",
  "range_invalid"
] as const);
const catalogListRefusalReasons = Object.freeze([
  "incompatible",
  "unbound",
  "inadmissible"
] as const);
const catalogDescribeRefusalReasons = Object.freeze([
  "unknown_handle",
  "ambiguous_handle",
  "hidden_by_view",
  "incompatible",
  "unbound",
  "inadmissible"
] as const);
const noExtraRefusalReasons = Object.freeze([] as const);

export const PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES =
  freezeNativeValue({
    catalog_list: projectReadContractSet({
      caseKey: "catalog_list",
      sourceKind: "Catalog",
      selectorSchema: catalogListSelectorSchema,
      extraRefusalReasons: catalogListRefusalReasons
    }),
    catalog_describe: projectReadContractSet({
      caseKey: "catalog_describe",
      sourceKind: "Catalog",
      selectorSchema: catalogDescribeSelectorSchema,
      extraRefusalReasons: catalogDescribeRefusalReasons
    }),
    workspace_status: projectReadContractSet({
      caseKey: "workspace_status",
      sourceKind: "WorkspaceBinding",
      selectorSchema: emptySelectorSchema,
      extraRefusalReasons: noExtraRefusalReasons
    }),
    run_status: projectReadContractSet({
      caseKey: "run_status",
      sourceKind: "Run",
      selectorSchema: emptySelectorSchema,
      extraRefusalReasons: noExtraRefusalReasons
    }),
    graph_call_status: projectReadContractSet({
      caseKey: "graph_call_status",
      sourceKind: "GraphCall",
      selectorSchema: emptySelectorSchema,
      extraRefusalReasons: noExtraRefusalReasons
    }),
    run_result: projectReadContractSet({
      caseKey: "run_result",
      sourceKind: "Run",
      selectorSchema: emptySelectorSchema,
      extraRefusalReasons: noExtraRefusalReasons
    }),
    graph_call_result: projectReadContractSet({
      caseKey: "graph_call_result",
      sourceKind: "GraphCall",
      selectorSchema: emptySelectorSchema,
      extraRefusalReasons: noExtraRefusalReasons
    }),
    run_evidence: projectReadContractSet({
      caseKey: "run_evidence",
      sourceKind: "Run",
      selectorSchema: emptySelectorSchema,
      extraRefusalReasons: noExtraRefusalReasons
    }),
    graph_call_evidence: projectReadContractSet({
      caseKey: "graph_call_evidence",
      sourceKind: "GraphCall",
      selectorSchema: emptySelectorSchema,
      extraRefusalReasons: noExtraRefusalReasons
    }),
    result_evidence: projectReadContractSet({
      caseKey: "result_evidence",
      sourceKind: "RuntimeResult",
      selectorSchema: emptySelectorSchema,
      extraRefusalReasons: noExtraRefusalReasons
    }),
    assessment_evidence: projectReadContractSet({
      caseKey: "assessment_evidence",
      sourceKind: "ResultAssessment",
      selectorSchema: emptySelectorSchema,
      extraRefusalReasons: noExtraRefusalReasons
    }),
    witness_evidence: projectReadContractSet({
      caseKey: "witness_evidence",
      sourceKind: "WitnessedAct",
      selectorSchema: emptySelectorSchema,
      extraRefusalReasons: noExtraRefusalReasons
    }),
    install_evidence: projectReadContractSet({
      caseKey: "install_evidence",
      sourceKind: "InstalledProduct",
      selectorSchema: installEvidenceSelectorSchema,
      extraRefusalReasons: noExtraRefusalReasons
    }),
    release_evidence: projectReadContractSet({
      caseKey: "release_evidence",
      sourceKind: "ReleaseCut",
      selectorSchema: releaseEvidenceSelectorSchema,
      extraRefusalReasons: noExtraRefusalReasons
    }),
    workspace_replay: projectReadContractSet({
      caseKey: "workspace_replay",
      sourceKind: "WorkspaceBinding",
      selectorSchema: workspaceReplaySelectorSchema,
      extraRefusalReasons: replayRefusalReasons
    }),
    run_replay: projectReadContractSet({
      caseKey: "run_replay",
      sourceKind: "Run",
      selectorSchema: replaySelectorSchema,
      extraRefusalReasons: replayRefusalReasons
    }),
    graph_call_replay: projectReadContractSet({
      caseKey: "graph_call_replay",
      sourceKind: "GraphCall",
      selectorSchema: replaySelectorSchema,
      extraRefusalReasons: replayRefusalReasons
    }),
    interaction_replay: projectReadContractSet({
      caseKey: "interaction_replay",
      sourceKind: "FhInteraction",
      selectorSchema: replaySelectorSchema,
      extraRefusalReasons: replayRefusalReasons
    }),
    continuation_replay: projectReadContractSet({
      caseKey: "continuation_replay",
      sourceKind: "Continuation",
      selectorSchema: replaySelectorSchema,
      extraRefusalReasons: replayRefusalReasons
    }),
    c_call_replay: projectReadContractSet({
      caseKey: "c_call_replay",
      sourceKind: "CProgramAtomReceipt",
      selectorSchema: cCallReplaySelectorSchema,
      extraRefusalReasons: replayRefusalReasons
    }),
    workspace_gaps: projectReadContractSet({
      caseKey: "workspace_gaps",
      sourceKind: "WorkspaceBinding",
      selectorSchema: workspaceGapsSelectorSchema,
      extraRefusalReasons: noExtraRefusalReasons
    }),
    run_gaps: projectReadContractSet({
      caseKey: "run_gaps",
      sourceKind: "Run",
      selectorSchema: emptySelectorSchema,
      extraRefusalReasons: noExtraRefusalReasons
    }),
    run_lawful_actions: projectReadContractSet({
      caseKey: "run_lawful_actions",
      sourceKind: "Run",
      selectorSchema: lawfulActionsSelectorSchema,
      extraRefusalReasons: noExtraRefusalReasons
    }),
    observer_report: projectReadContractSet({
      caseKey: "observer_report",
      sourceKind: "WorkspaceBinding",
      selectorSchema: observerReportSelectorSchema,
      extraRefusalReasons: noExtraRefusalReasons
    }),
    observer_drafts: projectReadContractSet({
      caseKey: "observer_drafts",
      sourceKind: "WorkspaceBinding",
      selectorSchema: observerDraftsSelectorSchema,
      extraRefusalReasons: noExtraRefusalReasons
    }),
    tuning_report: projectReadContractSet({
      caseKey: "tuning_report",
      sourceKind: "WorkspaceBinding",
      selectorSchema: tuningReportSelectorSchema,
      extraRefusalReasons: noExtraRefusalReasons
    }),
    ticket_consensus: projectReadContractSet({
      caseKey: "ticket_consensus",
      sourceKind: "ConsensusResult",
      selectorSchema: ticketConsensusSelectorSchema,
      extraRefusalReasons: noExtraRefusalReasons
    })
  });

/** @internal */
export const PROJECT_READ_OPERATION_NATIVE_CHECK_REGISTRY = freezeNativeValue({
  familyRef: "contract-family://abg/operation/project-read@5",
  checks: PROJECT_READ_PROJECTION_BASIS_CHECKS
});

export type ProjectReadCase =
  keyof typeof PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES;
export type ProjectReadRequest<CaseKey extends ProjectReadCase> = v.InferOutput<
  (typeof PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES)[CaseKey]["request"]["schema"]
>;
export type ProjectReadRefusal<CaseKey extends ProjectReadCase> = v.InferOutput<
  (typeof PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES)[CaseKey]["refusal"]["schema"]
>;
