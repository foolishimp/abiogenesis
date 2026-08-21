import * as v from "valibot";

import { capabilityRefsForContract } from "../shared/capability_contracts.js";

import {
  admitRuntimeContract,
  type ExactOwnerOperationPort,
  jsonPointerSchema,
  nonemptyRefDigestSetSchema,
  nonemptyUniqueArray,
  nonblankSchema,
  ownerAuthorityDigest,
  ownerContractPacket,
  ownerMetadata,
  refDigestSchema,
  refSetSchema,
  refusalSchema,
  TERMINAL_ONLY_ADAPTER_EXIT_MAP,
  typedResidualSetSchema,
  uniqueArray,
} from "../shared/public_function_contracts.js";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";

const CATALOG_AUTHORITY =
  "authority://abiogenesis/product/catalog-operations@5";

export const catalogInputRowKeySchema = v.strictObject({
  descriptorRef: nonblankSchema,
  descriptorDigest: v.pipe(v.string(), v.regex(/^sha256:[0-9a-f]{64}$/)),
  contributionManifestRef: nonblankSchema,
  contributionManifestDigest: v.pipe(
    v.string(),
    v.regex(/^sha256:[0-9a-f]{64}$/),
  ),
  contributionRowRef: nonblankSchema,
  contributionRowDigest: v.pipe(
    v.string(),
    v.regex(/^sha256:[0-9a-f]{64}$/),
  ),
});

const catalogRowCommon = {
  inputRowKey: catalogInputRowKeySchema,
  subject: refDigestSchema,
  readinessBasis: refDigestSchema,
  evidence: nonemptyRefDigestSetSchema,
  provenance: nonemptyRefDigestSetSchema,
} as const;

function catalogDispositionReasonSchema<const TCodes extends readonly [
  string,
  ...string[],
]>(codes: TCodes) {
  return v.strictObject({
    code: v.picklist(codes),
    issuePaths: uniqueArray(jsonPointerSchema),
  });
}

export const catalogAdmissionRowSchema = v.union([
  v.strictObject({
    disposition: v.literal("admitted"),
    ...catalogRowCommon,
  }),
  v.strictObject({
    disposition: v.literal("rejected"),
    ...catalogRowCommon,
    reason: catalogDispositionReasonSchema([
      "publication_identity_mismatch",
      "manifest_row_absent",
      "manifest_or_provenance_mismatch",
    ]),
  }),
  v.strictObject({
    disposition: v.literal("incompatible"),
    ...catalogRowCommon,
    reason: catalogDispositionReasonSchema(["compatibility_mismatch"]),
  }),
  v.strictObject({
    disposition: v.literal("conflicting"),
    ...catalogRowCommon,
    reason: catalogDispositionReasonSchema([
      "canonical_handle_conflict",
      "manifest_row_ambiguous",
    ]),
  }),
  v.strictObject({
    disposition: v.literal("unready"),
    ...catalogRowCommon,
    reason: catalogDispositionReasonSchema([
      "readiness_declaration_mismatch",
      "missing_readiness_prerequisite",
    ]),
  }),
  v.strictObject({
    disposition: v.literal("unresolved"),
    ...catalogRowCommon,
    reason: catalogDispositionReasonSchema(["publication_owner_unresolved"]),
  }),
]);

const CATALOG_CONSERVATION_RELATION =
  "relation://abg/catalog/admission-input-output-conservation@5" as const;

export const catalogAdmissionConservationWitnessSchema = v.strictObject({
  relationRef: v.literal(CATALOG_CONSERVATION_RELATION),
  inputRowKeys: nonemptyUniqueArray(catalogInputRowKeySchema),
  conservationDigest: v.pipe(
    v.string(),
    v.regex(/^sha256:[0-9a-f]{64}$/),
  ),
});

export const catalogAdmissionResultSchema = v.strictObject({
  catalog: refDigestSchema,
  rows: nonemptyUniqueArray(catalogAdmissionRowSchema),
  conservation: catalogAdmissionConservationWitnessSchema,
});

export type CatalogInputRowKey = v.InferOutput<typeof catalogInputRowKeySchema>;
export type CatalogAdmissionRow = v.InferOutput<typeof catalogAdmissionRowSchema>;
export type CatalogAdmissionConservationWitness = v.InferOutput<
  typeof catalogAdmissionConservationWitnessSchema
>;

export function constructCatalogAdmissionConservationWitness(
  inputRowKeys: readonly CatalogInputRowKey[],
): CatalogAdmissionConservationWitness {
  const canonicalKeys = [...inputRowKeys].sort((left, right) => {
    const leftKey = canonicalJson(left as unknown as JsonValue);
    const rightKey = canonicalJson(right as unknown as JsonValue);
    return leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0;
  });
  const body = {
    relationRef: CATALOG_CONSERVATION_RELATION,
    inputRowKeys: canonicalKeys,
  } as const;
  return Object.freeze({
    ...body,
    conservationDigest: sha256Canonical(body as unknown as JsonValue),
  });
}

export type CatalogAdmissionResult = v.InferOutput<
  typeof catalogAdmissionResultSchema
>;

export function admitCatalogAdmissionResult(
  exactInputRowKeys: readonly CatalogInputRowKey[],
  candidate: unknown,
): Readonly<
  | { disposition: "admitted"; value: CatalogAdmissionResult }
  | { disposition: "refused"; issuePaths: readonly string[] }
> {
  const structural = admitRuntimeContract(catalogAdmissionResultSchema, candidate);
  if (structural.disposition === "refused") return structural;
  const value = structural.value as CatalogAdmissionResult;
  const expectedWitness = constructCatalogAdmissionConservationWitness(
    exactInputRowKeys,
  );
  const outputKeys = value.rows.map((row) =>
    canonicalJson(row.inputRowKey as unknown as JsonValue)
  );
  const expectedKeys = expectedWitness.inputRowKeys.map((key) =>
    canonicalJson(key as unknown as JsonValue)
  );
  const issues: string[] = [];
  if (
    canonicalJson(value.conservation as unknown as JsonValue) !==
      canonicalJson(expectedWitness as unknown as JsonValue)
  ) issues.push("/conservation");
  if (
    outputKeys.length !== new Set(outputKeys).size ||
    canonicalJson([...outputKeys].sort()) !==
      canonicalJson([...expectedKeys].sort())
  ) issues.push("/rows");
  return issues.length === 0
    ? Object.freeze({ disposition: "admitted" as const, value })
    : Object.freeze({
      disposition: "refused" as const,
      issuePaths: Object.freeze(issues),
    });
}

const admit = ownerContractPacket(
  { operationId: "abg.operation.catalog.admit", memberKey: "admit" },
  v.strictObject({
    workspaceBinding: refDigestSchema,
    descriptors: nonemptyRefDigestSetSchema,
    contributionManifests: nonemptyRefDigestSetSchema,
    resolvedLock: refDigestSchema,
  }),
  catalogAdmissionResultSchema,
  refusalSchema([
    "malformed_descriptor",
    "malformed_contribution",
    "binding_mismatch",
    "lock_mismatch",
    "conservation_failure",
  ]),
  null,
  {
    abstractModule: "Product.CatalogAdmission",
    exportName: "CATALOG_OPERATION_CONTRACTS",
    memberPath: ["admit"],
    authorityRef: CATALOG_AUTHORITY,
    authorityDigest: ownerAuthorityDigest(CATALOG_AUTHORITY),
  },
  ownerMetadata({
    authorityClass: "pure",
    effectClass: "deterministic_catalog_readiness",
    eventAdmission: "none",
    actorRequirement: "required",
    workspaceBindingRequirement: "exactly_one",
    authoritySlotRequirements: [
      "capability_grants",
      "workspace_binding",
      "product_set",
      "dependency_lock",
      "actor",
    ],
    capabilityRefs: capabilityRefsForContract("abg.operation.catalog.admit"),
    defaults: {},
    closedDomains: {
      rowDisposition: [
        "admitted",
        "rejected",
        "incompatible",
        "conflicting",
        "unready",
        "unresolved",
      ],
    },
    sdkCoordinate: "sdk.catalog.admit",
    cliCoordinate: "catalog admit",
    adapterExitMap: TERMINAL_ONLY_ADAPTER_EXIT_MAP,
  }),
);

const allowlist = ownerContractPacket(
  { operationId: "abg.operation.catalog.view", memberKey: "allowlist" },
  v.strictObject({
    catalog: refDigestSchema,
    allowlist: refSetSchema,
  }),
  v.strictObject({
    view: refDigestSchema,
    effectiveHandles: refSetSchema,
    residuals: typedResidualSetSchema,
  }),
  refusalSchema([
    "unknown",
    "duplicate",
    "ambiguous",
    "unauthorized",
    "inadmissible",
    "not_ready",
  ]),
  null,
  {
    abstractModule: "Product.CatalogProjection",
    exportName: "CATALOG_OPERATION_CONTRACTS",
    memberPath: ["view", "allowlist"],
    authorityRef: CATALOG_AUTHORITY,
    authorityDigest: ownerAuthorityDigest(CATALOG_AUTHORITY),
  },
  ownerMetadata({
    authorityClass: "pure",
    effectClass: "deterministic_catalog_narrowing",
    eventAdmission: "none",
    actorRequirement: "required",
    workspaceBindingRequirement: "exactly_one",
    authoritySlotRequirements: [
      "capability_grants",
      "workspace_binding",
      "product_set",
      "dependency_lock",
      "actor",
    ],
    capabilityRefs: capabilityRefsForContract("abg.operation.catalog.view"),
    defaults: {},
    closedDomains: {},
    sdkCoordinate: "sdk.catalog.view",
    cliCoordinate: "catalog view",
    adapterExitMap: TERMINAL_ONLY_ADAPTER_EXIT_MAP,
  }),
);

const applicationRefusalSchema = refusalSchema([
  "kind_mismatch",
  "view_mismatch",
  "unready",
  "target_mismatch",
  "application_mismatch",
  "callability_mismatch",
  "invalid_validation_receipt",
  "invalid_contributor",
]);

function applyContract<const TKind extends "node_type" | "overlay">(
  applicationKind: TKind,
) {
  return ownerContractPacket(
    {
      operationId: "abg.operation.catalog.apply",
      memberKey: applicationKind,
    } as const,
    v.strictObject({
      applicationKind: v.literal(applicationKind),
      catalogRow: refDigestSchema,
      catalogView: refDigestSchema,
      declaration: refDigestSchema,
      target: applicationKind === "node_type"
        ? refDigestSchema
        : v.null(),
      applicationBasis: refDigestSchema,
      validationReceipt: refDigestSchema,
      contributor: refDigestSchema,
    }),
    v.strictObject({
      applicationKind: v.literal(applicationKind),
      application: refDigestSchema,
      target: applicationKind === "node_type"
        ? refDigestSchema
        : v.null(),
      evidence: nonemptyRefDigestSetSchema,
      provenance: nonemptyRefDigestSetSchema,
    }),
    applicationRefusalSchema,
    null,
    {
      abstractModule: "Product.CatalogApplication",
      exportName: "CATALOG_OPERATION_CONTRACTS",
      memberPath: ["apply", applicationKind],
      authorityRef: CATALOG_AUTHORITY,
      authorityDigest: ownerAuthorityDigest(CATALOG_AUTHORITY),
    },
    ownerMetadata({
      authorityClass: "pure",
      effectClass: "deterministic_catalog_application",
      eventAdmission: "none",
      actorRequirement: "required",
      workspaceBindingRequirement: "exactly_one",
      authoritySlotRequirements: [
        "capability_grants",
        "workspace_binding",
        "product_set",
        "dependency_lock",
        "catalog_scope",
        "actor",
      ],
      capabilityRefs: capabilityRefsForContract("abg.operation.catalog.apply"),
      defaults: {},
      closedDomains: { applicationKind: [applicationKind] },
      sdkCoordinate: "sdk.catalog.apply",
      cliCoordinate: `catalog apply ${applicationKind}`,
      adapterExitMap: TERMINAL_ONLY_ADAPTER_EXIT_MAP,
    }),
  );
}

const nodeType = applyContract("node_type");
const overlay = applyContract("overlay");

export const CATALOG_OPERATION_CONTRACTS = Object.freeze({
  admit,
  view: Object.freeze({ allowlist }),
  apply: Object.freeze({ node_type: nodeType, overlay }),
});

export interface CatalogOperationPort {
  readonly admit: ExactOwnerOperationPort<typeof admit>;
  readonly constructView: ExactOwnerOperationPort<typeof allowlist>;
  readonly apply: ExactOwnerOperationPort<typeof nodeType | typeof overlay>;
}
