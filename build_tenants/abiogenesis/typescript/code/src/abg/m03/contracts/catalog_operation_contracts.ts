// Private P1 owner contracts for AF-08..AF-10. Runtime catalog behavior,
// event admission, and public projection remain in their existing owners.

import * as v from "valibot";

import {
  nonEmptyTextSchema,
  refSchema,
  refTextSchema,
  semanticVersionSchema,
  sha256DigestSchema,
  uniqueByNativeIdentityArray
} from "../../../shared/validation/native_contract_primitives.js";
import { freezeNativeValue } from "../../../shared/validation/immutable_native_value.js";
import type { NativeNamedCheckRegistry } from "../../../shared/validation/native_named_check_registry.js";
import {
  ownerNativeDefinitionContractSource,
  ownerProjectionRelationSource,
  type OwnerProjectionRelationAction,
  type OwnerProjectionRelationResult
} from "../../../shared/validation/owner_native_operation_contract_source.js";
import { PUBLIC_RUNTIME_CATALOG_KIND_VALUES } from "./runtime_catalog.js";
import { m03OwnerContractSet } from "./m03_owner_contract_set.js";

const MODULE_PATH =
  "code/src/abg/m03/contracts/catalog_operation_contracts.js" as const;
const EXPORT_NAME = "CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES";
const CATALOG_NAMED_CHECKS = freezeNativeValue({
  kind: "family_registry" as const,
  exportName: "CATALOG_OPERATION_NATIVE_CHECK_REGISTRY",
  memberPath: [] as const
});
const CATALOG_ADMIT_SEMANTIC_OWNER_BASIS = freezeNativeValue({
  ref: "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-051A",
  digest:
    "sha256:89cf57e14f74cd4ea433c277f88d89a5972e49b421801878d44b7481801c022f"
} as const);
const CATALOG_VIEW_SEMANTIC_OWNER_BASIS = freezeNativeValue({
  ref: "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-053",
  digest:
    "sha256:89cf57e14f74cd4ea433c277f88d89a5972e49b421801878d44b7481801c022f"
} as const);
const CATALOG_APPLY_SEMANTIC_OWNER_BASIS = freezeNativeValue({
  ref: "specification/requirements/product/REQ-P-CATALOG.md#REQ-P-CATALOG-030",
  digest:
    "sha256:af273d059574c4e8e19a9599005956683372db88ba0d8e57d5c5b14a58ff3c84"
} as const);
const CATALOG_READ_SEMANTIC_OWNER_BASIS = freezeNativeValue({
  ref: "specification/requirements/product/REQ-P-CATALOG.md#REQ-P-CATALOG-019..022",
  digest:
    "sha256:af273d059574c4e8e19a9599005956683372db88ba0d8e57d5c5b14a58ff3c84"
} as const);
const CATALOG_SEMANTIC_OWNER = freezeNativeValue({
  product: "abiogenesis",
  module: "abg.m03",
  family: "catalog"
} as const);

type CatalogReadRefDigest = Readonly<{
  ref: string;
  digest: string;
}>;
type CatalogReadVisibilityBasis =
  | "workspace_catalog"
  | Readonly<{
      kind: "session_view";
      view: CatalogReadRefDigest;
    }>;
type CatalogReadRequest<Selector> = Readonly<{
  source: Readonly<{
    kind: "Catalog";
    sourceRef: string;
    sourceDigest: string;
  }>;
  selector: Selector;
}>;

function sameCatalogReadCoordinate(
  left: CatalogReadRefDigest,
  right: CatalogReadRefDigest
): boolean {
  return left.ref === right.ref && left.digest === right.digest;
}

function sameCatalogReadVisibilityBasis(
  left: CatalogReadVisibilityBasis,
  right: CatalogReadVisibilityBasis
): boolean {
  if (left === "workspace_catalog" || right === "workspace_catalog") {
    return left === right;
  }
  return sameCatalogReadCoordinate(left.view, right.view);
}

function catalogReadRelationResult(
  issuePaths: readonly string[]
): OwnerProjectionRelationResult {
  const [first, ...remaining] = issuePaths;
  return first === undefined
    ? { kind: "projection_related" }
    : {
        kind: "projection_relation_mismatch",
        issuePaths: [first, ...remaining]
      };
}

function catalogReadBaseIssuePaths(
  request: Readonly<{
    source: Readonly<{ sourceRef: string; sourceDigest: string }>;
    selector: Readonly<{ visibilityBasis: CatalogReadVisibilityBasis }>;
  }>,
  projection: Readonly<{
    catalog: CatalogReadRefDigest;
    visibilityBasis: CatalogReadVisibilityBasis;
  }>
): string[] {
  const issuePaths: string[] = [];
  if (
    request.source.sourceRef !== projection.catalog.ref ||
    request.source.sourceDigest !== projection.catalog.digest
  ) {
    issuePaths.push("candidateProjection.catalog");
  }
  if (
    !sameCatalogReadVisibilityBasis(
      request.selector.visibilityBasis,
      projection.visibilityBasis
    )
  ) {
    issuePaths.push("candidateProjection.visibilityBasis");
  }
  return issuePaths;
}

const refListSchema = v.pipe(
  uniqueByNativeIdentityArray(refSchema),
  v.readonly()
);
const nonEmptyRefListSchema = v.pipe(
  uniqueByNativeIdentityArray(refSchema),
  v.minLength(1),
  v.readonly()
);

const refDigestSchema = v.pipe(
  v.strictObject({ ref: refSchema, digest: sha256DigestSchema }),
  v.readonly()
);
const canonicalCatalogHandleSchema = v.pipe(
  refTextSchema,
  v.brand("CanonicalCatalogHandle")
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
const catalogProjectionBasisFields = {
  projection: refDigestSchema,
  catalog: refDigestSchema,
  workspaceBinding: refDigestSchema,
  visibilityBasis: catalogVisibilityBasisSchema
} as const;
const catalogEntryIdentityFields = {
  canonicalHandle: canonicalCatalogHandleSchema,
  entryKind: v.picklist(PUBLIC_RUNTIME_CATALOG_KIND_VALUES),
  owningProduct: refDigestSchema,
  owningProductVersion: semanticVersionSchema
} as const;

const catalogListRowSchema = v.pipe(
  v.strictObject({
    ...catalogEntryIdentityFields,
    readiness: v.picklist(["ready", "not_ready"]),
    readinessBlockers: refListSchema,
    eligibility: v.picklist(["eligible", "ineligible"]),
    callability: v.picklist(["callable", "non_callable"]),
    visibility: v.picklist(["visible", "hidden"]),
    compatibility: v.picklist([
      "compatible",
      "incompatible",
      "unresolved"
    ]),
    provenanceRefs: refListSchema
  }),
  v.readonly()
);

const catalogListProjectionCarrierSchema = v.strictObject({
  kind: v.literal("catalog_list_projection"),
  ...catalogProjectionBasisFields,
  rows: v.pipe(v.array(catalogListRowSchema), v.readonly()),
  provenanceRefs: refListSchema
});

const CATALOG_LIST_RELATION_ACTION = Object.freeze(
  v.check(
    (projection: v.InferOutput<
      typeof catalogListProjectionCarrierSchema
    >) => {
      const handles = projection.rows.map((row) => row.canonicalHandle);
      return (
        new Set(handles).size === handles.length &&
        projection.rows.every(
          (row) =>
            (row.readiness === "ready") ===
              (row.readinessBlockers.length === 0) &&
            (row.readiness !== "ready" ||
              row.compatibility === "compatible") &&
            (row.eligibility !== "eligible" ||
              (row.readiness === "ready" &&
                row.visibility === "visible" &&
                row.compatibility === "compatible")) &&
            (row.callability !== "callable" ||
              (row.entryKind === "graph_function" &&
                row.readiness === "ready" &&
                row.eligibility === "eligible" &&
                row.visibility === "visible" &&
                row.compatibility === "compatible"))
        ) &&
        (projection.visibilityBasis === "workspace_catalog" ||
          projection.rows.every((row) => row.visibility === "visible"))
      );
    },
    "catalog list rows must be unique and mutually coherent"
  )
);

const catalogListProjectionSchema = v.pipe(
  catalogListProjectionCarrierSchema,
  CATALOG_LIST_RELATION_ACTION,
  v.readonly()
);

const catalogDependencyRowSchema = v.pipe(
  v.strictObject({
    ref: refSchema,
    digest: sha256DigestSchema,
    disposition: v.picklist([
      "resolved",
      "unresolved",
      "incompatible"
    ])
  }),
  v.readonly()
);

const catalogDescriptionProjectionCarrierSchema = v.strictObject({
  kind: v.literal("catalog_description_projection"),
  ...catalogProjectionBasisFields,
  ...catalogEntryIdentityFields,
  owningArtifact: refDigestSchema,
  declaration: v.union([
    v.pipe(
      v.strictObject({
        kind: v.literal("contract"),
        contract: refDigestSchema
      }),
      v.readonly()
    ),
    v.pipe(
      v.strictObject({
        kind: v.literal("schema"),
        schema: refDigestSchema
      }),
      v.readonly()
    )
  ]),
  dependencies: v.pipe(
    uniqueByNativeIdentityArray(catalogDependencyRowSchema),
    v.readonly()
  ),
  readinessBlockers: v.tuple([]),
  readiness: v.literal("ready"),
  eligibility: v.picklist(["eligible", "ineligible"]),
  callability: v.picklist(["callable", "non_callable"]),
  visibility: v.literal("visible"),
  compatibility: v.literal("compatible"),
  provenanceRefs: refListSchema
});

const CATALOG_DESCRIPTION_RELATION_ACTION = Object.freeze(
  v.check(
    (projection: v.InferOutput<
      typeof catalogDescriptionProjectionCarrierSchema
    >) =>
      projection.callability !== "callable" ||
      (projection.entryKind === "graph_function" &&
        projection.eligibility === "eligible"),
    "a callable catalog description must be an eligible graph function"
  )
);

const catalogDescriptionProjectionSchema = v.pipe(
  catalogDescriptionProjectionCarrierSchema,
  CATALOG_DESCRIPTION_RELATION_ACTION,
  v.readonly()
);

const catalogAdmitRequestSchema = v.pipe(
  v.strictObject({
    workspaceBindingRef: refSchema,
    workspaceBindingDigest: sha256DigestSchema,
    descriptorRefs: nonEmptyRefListSchema,
    contributionManifestRefs: nonEmptyRefListSchema,
    resolvedLockRef: refSchema,
    resolvedLockDigest: sha256DigestSchema
  }),
  v.readonly()
);

const catalogAdmissionRowFields = {
  kind: v.literal("catalog_row_disposition"),
  entryRef: refSchema,
  declarationRef: refSchema
} as const;

const catalogAdmittedDispositionSchema = v.pipe(
  v.strictObject({
    ...catalogAdmissionRowFields,
    entryKind: v.picklist(PUBLIC_RUNTIME_CATALOG_KIND_VALUES),
    disposition: v.literal("admitted")
  }),
  v.readonly()
);

function catalogNonAdmissionDispositionSchema<
  const Disposition extends
    | "rejected"
    | "incompatible"
    | "conflicting"
    | "unready"
    | "unresolved"
>(disposition: Disposition) {
  return v.pipe(
    v.strictObject({
      ...catalogAdmissionRowFields,
      entryKind: v.picklist([
        ...PUBLIC_RUNTIME_CATALOG_KIND_VALUES,
        "unsupported"
      ]),
      disposition: v.literal(disposition),
      reason: nonEmptyTextSchema,
      residualRefs: refListSchema
    }),
    v.readonly()
  );
}

const catalogAdmissionDispositionSchema = v.union([
  catalogAdmittedDispositionSchema,
  catalogNonAdmissionDispositionSchema("rejected"),
  catalogNonAdmissionDispositionSchema("incompatible"),
  catalogNonAdmissionDispositionSchema("conflicting"),
  catalogNonAdmissionDispositionSchema("unready"),
  catalogNonAdmissionDispositionSchema("unresolved")
]);

const UNIQUE_CATALOG_ENTRY_DISPOSITION_ACTION = Object.freeze(
  v.check(
    (
      rows: v.InferOutput<typeof catalogAdmissionDispositionSchema>[]
    ) => new Set(rows.map((row) => row.entryRef)).size === rows.length,
    "every catalog entry requires exactly one disposition"
  )
);

export const CATALOG_OPERATION_NATIVE_CHECK_REGISTRY = freezeNativeValue({
  familyRef: "contract-family://abg/operation/catalog@5",
  checks: [
    {
      checkId: "unique-entry-disposition",
      action: UNIQUE_CATALOG_ENTRY_DISPOSITION_ACTION,
      relationRef: "REQ-P-POLICY-051A"
    },
    {
      checkId: "catalog-list-relation",
      action: CATALOG_LIST_RELATION_ACTION,
      relationRef: "REQ-P-CATALOG-019..022"
    },
    {
      checkId: "catalog-description-relation",
      action: CATALOG_DESCRIPTION_RELATION_ACTION,
      relationRef: "REQ-P-CATALOG-019..022"
    }
  ]
} satisfies NativeNamedCheckRegistry);

function catalogProjectReadResult<
  const CaseKey extends "catalog_list" | "catalog_describe",
  const S extends v.GenericSchema
>(caseKey: CaseKey, schema: S) {
  return ownerNativeDefinitionContractSource({
    owner: CATALOG_SEMANTIC_OWNER,
    definitionKey: {
      operationId: "abg.operation.project.read",
      memberKind: "project_read_case",
      caseKey
    },
    slot: "result",
    semanticOwnerBasis: CATALOG_READ_SEMANTIC_OWNER_BASIS,
    modulePath: MODULE_PATH,
    exportName: EXPORT_NAME,
    memberPath: ["project_read", caseKey, "result"] as const,
    namedChecks: CATALOG_NAMED_CHECKS,
    schema
  });
}

const catalogAdmitResultSchema = v.pipe(
  v.strictObject({
    catalogRef: refSchema,
    catalogDigest: sha256DigestSchema,
    dispositions: v.pipe(
      v.array(catalogAdmissionDispositionSchema),
      v.minLength(1),
      UNIQUE_CATALOG_ENTRY_DISPOSITION_ACTION,
      v.readonly()
    ),
    evidenceRefs: refListSchema
  }),
  v.readonly()
);

const CATALOG_ADMIT_REFUSAL_CODES = Object.freeze([
  "descriptor_invalid",
  "contribution_invalid",
  "conflict",
  "incompatible",
  "unready",
  "unresolved"
] as const);

const catalogAdmitRefusalSchema = v.pipe(
  v.strictObject({
    code: v.picklist(CATALOG_ADMIT_REFUSAL_CODES),
    message: nonEmptyTextSchema,
    residualRefs: refListSchema
  }),
  v.readonly()
);

const catalogViewRequestSchema = v.pipe(
  v.strictObject({
    allowlist: refListSchema
  }),
  v.readonly()
);

const catalogViewResidualSchema = v.pipe(
  v.strictObject({
    handle: refSchema,
    code: v.picklist([
      "unknown",
      "duplicate",
      "ambiguous",
      "unauthorized",
      "inadmissible",
      "not_ready"
    ])
  }),
  v.readonly()
);

const catalogApplicationCoordinateSchema = v.pipe(
  v.strictObject({
    catalogRowRef: refSchema,
    catalogRowDigest: sha256DigestSchema,
    catalogViewRef: refSchema,
    catalogViewDigest: sha256DigestSchema,
    declarationRef: refSchema,
    declarationDigest: sha256DigestSchema,
    targetRef: refSchema,
    targetDigest: sha256DigestSchema,
    applicationBasisRef: refSchema,
    applicationBasisDigest: sha256DigestSchema
  }),
  v.readonly()
);

export type CatalogApplicationCoordinate = v.InferInput<
  typeof catalogApplicationCoordinateSchema
>;

const catalogViewResultSchema = v.pipe(
  v.strictObject({
    catalogViewRef: refSchema,
    catalogViewDigest: sha256DigestSchema,
    effectiveHandles: refListSchema,
    residuals: v.pipe(v.array(catalogViewResidualSchema), v.readonly()),
    applicationCandidates: v.pipe(
      v.array(catalogApplicationCoordinateSchema),
      v.readonly()
    )
  }),
  v.readonly()
);

const catalogViewRefusalSchema = v.pipe(
  v.strictObject({
    code: v.picklist([
      "unknown",
      "duplicate",
      "ambiguous",
      "unauthorized",
      "inadmissible",
      "not_ready"
    ]),
    message: nonEmptyTextSchema,
    residualRefs: refListSchema
  }),
  v.readonly()
);

const catalogApplyRequestSchema = catalogApplicationCoordinateSchema;

function catalogApplyResultSchema<const Kind extends "node_type" | "overlay">(
  declarationKind: Kind
) {
  return v.pipe(
    v.strictObject({
      applicationRef: refSchema,
      applicationKind: v.literal(declarationKind),
      declarationRef: refSchema,
      targetRef: refSchema,
      targetDigest: sha256DigestSchema,
      evidenceRefs: refListSchema,
      provenanceRefs: refListSchema
    }),
    v.readonly()
  );
}

const CATALOG_APPLY_REFUSAL_CODES = Object.freeze([
  "kind_mismatch",
  "outside_view",
  "not_ready",
  "target_invalid",
  "application_refused",
  "callable_kind_forbidden"
] as const);

const catalogApplyRefusalSchema = v.pipe(
  v.strictObject({
    code: v.picklist(CATALOG_APPLY_REFUSAL_CODES),
    message: nonEmptyTextSchema,
    residualRefs: refListSchema
  }),
  v.readonly()
);

function catalogApplyContractSet<const Kind extends "node_type" | "overlay">(
  declarationKind: Kind
) {
  return m03OwnerContractSet({
    operationId: "abg.operation.catalog.apply",
    variant: declarationKind,
    family: "catalog_application",
    familyKey: "catalog_apply",
    modulePath: MODULE_PATH,
    exportName: EXPORT_NAME,
    namedChecks: CATALOG_NAMED_CHECKS,
    semanticOwnerBasis: CATALOG_APPLY_SEMANTIC_OWNER_BASIS,
    request: catalogApplyRequestSchema,
    result: catalogApplyResultSchema(declarationKind),
    refusal: catalogApplyRefusalSchema
  });
}

export const CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES = freezeNativeValue({
  project_read: {
    catalog_list: {
      result: catalogProjectReadResult(
        "catalog_list",
        catalogListProjectionSchema
      )
    },
    catalog_describe: {
      result: catalogProjectReadResult(
        "catalog_describe",
        catalogDescriptionProjectionSchema
      )
    }
  },
  catalog_admit: {
    admit: m03OwnerContractSet({
      operationId: "abg.operation.catalog.admit",
      variant: "admit",
      family: "catalog_admission",
      familyKey: "catalog_admit",
      modulePath: MODULE_PATH,
      exportName: EXPORT_NAME,
      namedChecks: CATALOG_NAMED_CHECKS,
      semanticOwnerBasis: CATALOG_ADMIT_SEMANTIC_OWNER_BASIS,
      request: catalogAdmitRequestSchema,
      result: catalogAdmitResultSchema,
      refusal: catalogAdmitRefusalSchema
    })
  },
  catalog_view: {
    allowlist: m03OwnerContractSet({
      operationId: "abg.operation.catalog.view",
      variant: "allowlist",
      family: "catalog_view",
      familyKey: "catalog_view",
      modulePath: MODULE_PATH,
      exportName: EXPORT_NAME,
      namedChecks: CATALOG_NAMED_CHECKS,
      semanticOwnerBasis: CATALOG_VIEW_SEMANTIC_OWNER_BASIS,
      request: catalogViewRequestSchema,
      result: catalogViewResultSchema,
      refusal: catalogViewRefusalSchema
    })
  },
  catalog_apply: {
    node_type: catalogApplyContractSet("node_type"),
    overlay: catalogApplyContractSet("overlay")
  }
});

type CatalogListDefinitionKey = Readonly<{
  operationId: "abg.operation.project.read";
  memberKind: "project_read_case";
  caseKey: "catalog_list";
}>;
type CatalogDescribeDefinitionKey = Readonly<{
  operationId: "abg.operation.project.read";
  memberKind: "project_read_case";
  caseKey: "catalog_describe";
}>;
type CatalogListReadRequest = CatalogReadRequest<
  Readonly<{ visibilityBasis: CatalogReadVisibilityBasis }>
>;
type CatalogDescribeReadRequest = CatalogReadRequest<
  Readonly<{
    visibilityBasis: CatalogReadVisibilityBasis;
    canonicalHandle: string;
  }>
>;
type CatalogListProjection = v.InferOutput<
  typeof catalogListProjectionSchema
>;
type CatalogDescriptionProjection = v.InferOutput<
  typeof catalogDescriptionProjectionSchema
>;

const CATALOG_LIST_PROJECT_READ_RELATION: OwnerProjectionRelationAction<
  CatalogListDefinitionKey,
  CatalogListReadRequest,
  CatalogListProjection
> = ({ admittedRequest, candidateProjection }) => {
  return catalogReadRelationResult(
    catalogReadBaseIssuePaths(admittedRequest, candidateProjection)
  );
};

const CATALOG_DESCRIBE_PROJECT_READ_RELATION: OwnerProjectionRelationAction<
  CatalogDescribeDefinitionKey,
  CatalogDescribeReadRequest,
  CatalogDescriptionProjection
> = ({ admittedRequest, candidateProjection }) => {
  const issuePaths = catalogReadBaseIssuePaths(
    admittedRequest,
    candidateProjection
  );
  if (
    admittedRequest.selector.canonicalHandle !==
    candidateProjection.canonicalHandle
  ) {
    issuePaths.push("candidateProjection.canonicalHandle");
  }
  return catalogReadRelationResult(issuePaths);
};

function catalogProjectReadRelationSource<
  const CaseKey extends "catalog_list" | "catalog_describe",
  Request,
  Projection
>(
  caseKey: CaseKey,
  relation: OwnerProjectionRelationAction<
    Readonly<{
      operationId: "abg.operation.project.read";
      memberKind: "project_read_case";
      caseKey: CaseKey;
    }>,
    Request,
    Projection
  >
) {
  const resultSource =
    CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES.project_read[caseKey].result;
  return ownerProjectionRelationSource({
    relationIdentity: `relation://abg/project-read/${caseKey.replaceAll("_", "-")}@5`,
    definitionKey: {
      operationId: "abg.operation.project.read",
      memberKind: "project_read_case",
      caseKey
    },
    semanticOwnerBasis: resultSource.authority.semanticOwnerBasis,
    modulePath: MODULE_PATH,
    exportName: "CATALOG_OPERATION_PROJECT_READ_RELATION_SOURCES",
    memberPath: [caseKey],
    relation
  });
}

export const CATALOG_OPERATION_PROJECT_READ_RELATION_SOURCES =
  freezeNativeValue({
    catalog_list: catalogProjectReadRelationSource(
      "catalog_list",
      CATALOG_LIST_PROJECT_READ_RELATION
    ),
    catalog_describe: catalogProjectReadRelationSource(
      "catalog_describe",
      CATALOG_DESCRIBE_PROJECT_READ_RELATION
    )
  });
