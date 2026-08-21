import * as v from "valibot";

import { capabilityRefsForContract } from "../shared/capability_contracts.js";

import {
  type ExactOwnerOperationPort,
  nonblankSchema,
  nonemptyRefDigestSetSchema,
  ownerAuthorityDigest,
  ownerContractPacket,
  ownerMetadata,
  refDigestSchema,
  refDigestSetSchema,
  refusalSchema,
  TERMINAL_ONLY_ADAPTER_EXIT_MAP,
  typedResidualSetSchema,
  uniqueArray,
  type RuntimeContractSchema,
} from "../shared/public_function_contracts.js";

type ProductReadCase =
  | "catalog_list"
  | "catalog_describe"
  | "workspace_status"
  | "install_evidence"
  | "release_evidence"
  | "ticket_consensus";

const noSelectorSchema = v.strictObject({ kind: v.literal("none") });

const catalogListProjectionSchema = v.strictObject({
  kind: v.literal("catalog_list_projection"),
  catalog: refDigestSchema,
  visibility: v.picklist(["workspace_catalog", "session_view"]),
  view: v.nullable(refDigestSchema),
  rows: uniqueArray(v.strictObject({
    handle: nonblankSchema,
    contributionKind: v.picklist(["graph_function", "node_type", "overlay"]),
    entry: refDigestSchema,
    readiness: v.nullable(refDigestSchema),
  })),
});

const catalogDescriptionProjectionSchema = v.strictObject({
  kind: v.literal("catalog_description_projection"),
  catalog: refDigestSchema,
  visibility: v.picklist(["workspace_catalog", "session_view"]),
  view: v.nullable(refDigestSchema),
  handle: nonblankSchema,
  contributionKind: v.picklist(["graph_function", "node_type", "overlay"]),
  entry: refDigestSchema,
  readiness: v.nullable(refDigestSchema),
});

const workspaceStatusProjectionSchema = v.strictObject({
  kind: v.literal("workspace_status_projection"),
  workspace: refDigestSchema,
  workspaceAuthority: refDigestSchema,
  binding: refDigestSchema,
  productSet: refDigestSchema,
  resolvedLock: refDigestSchema,
  boundProducts: refDigestSetSchema,
  declaredRoots: refDigestSetSchema,
  configurations: refDigestSetSchema,
  catalog: v.nullable(refDigestSchema),
  readiness: v.literal("ready"),
  residuals: typedResidualSetSchema,
  admissionEvent: refDigestSchema,
});

const installEvidenceProjectionSchema = v.strictObject({
  kind: v.literal("install_evidence_projection"),
  subject: refDigestSchema,
  product: refDigestSchema,
  artifact: refDigestSchema,
  productContent: refDigestSchema,
  manifest: refDigestSchema,
  producer: v.literal("ProductInstallPort.install"),
  basis: refDigestSetSchema,
  provenance: refDigestSetSchema,
});

const releaseEvidenceProjectionSchema = v.strictObject({
  kind: v.literal("release_evidence_projection"),
  releaseCut: refDigestSchema,
  snapshotManifest: refDigestSchema,
  artifacts: refDigestSetSchema,
  qualification: refDigestSchema,
  provenance: refDigestSetSchema,
});

const ticketConsensusProjectionSchema = v.strictObject({
  kind: v.literal("ticket_consensus_projection"),
  ticket: refDigestSchema,
  consensus: refDigestSchema,
  outputAuthority: refDigestSchema,
  replayBasis: refDigestSchema,
  evidence: nonemptyRefDigestSetSchema,
});

function productReadRefusal(catalog: boolean) {
  const common = [
    "unknown_source",
    "source_kind_mismatch",
    "source_digest_mismatch",
    "projection_basis_mismatch",
    "projection_unsupported",
    "not_found",
    "not_ready",
  ] as const;
  return catalog
    ? refusalSchema([
      ...common,
      "unknown_handle",
      "ambiguous_handle",
      "hidden_by_view",
      "incompatible",
      "unbound",
      "inadmissible",
    ])
    : refusalSchema([...common]);
}

function productReadContract<
  const TCase extends ProductReadCase,
  const TSourceKind extends string,
  const TSelector extends v.GenericSchema,
  const TProjection extends v.GenericSchema,
>(input: Readonly<{
  caseKey: TCase;
  sourceKind: TSourceKind;
  selector: TSelector;
  projection: TProjection;
  abstractModule: string;
  bindingRequired: boolean;
  catalogRefusals?: boolean;
}>) {
  const authorityRef =
    `authority://abiogenesis/project-read/${input.caseKey}@5`;
  return ownerContractPacket(
    {
      operationId: "abg.operation.project.read",
      memberKey: input.caseKey,
    } as const,
    v.strictObject({
      caseKey: v.literal(input.caseKey),
      source: v.strictObject({
        sourceKind: v.literal(input.sourceKind),
        sourceRef: nonblankSchema,
        sourceDigest: refDigestSchema.entries.digest,
      }),
      projectionBasis: v.strictObject({
        projectionBasisRef: nonblankSchema,
        projectionBasisDigest: refDigestSchema.entries.digest,
      }),
      selector: input.selector,
    }),
    v.strictObject({
      caseKey: v.literal(input.caseKey),
      source: refDigestSchema,
      projectionBasis: refDigestSchema,
      projection: input.projection,
    }),
    productReadRefusal(input.catalogRefusals === true),
    null,
    {
      abstractModule: input.abstractModule,
      exportName: "PRODUCT_PROJECT_READ_CONTRACTS",
      memberPath: [input.caseKey],
      authorityRef,
      authorityDigest: ownerAuthorityDigest(authorityRef),
    },
    ownerMetadata({
      authorityClass: "read",
      effectClass: "pure_projection",
      eventAdmission: "none",
      actorRequirement: "forbidden",
      workspaceBindingRequirement: input.bindingRequired
        ? "exactly_one"
        : "forbidden",
      authoritySlotRequirements: input.bindingRequired
        ? [
          "capability_grants",
          "workspace_binding",
          "product_set",
          "dependency_lock",
          ...(input.catalogRefusals ? ["catalog_scope" as const] : []),
        ]
        : ["capability_grants"],
      capabilityRefs: capabilityRefsForContract("abg.operation.project.read"),
      defaults: {},
      closedDomains: {
        caseKey: [input.caseKey],
        sourceKind: [input.sourceKind],
      },
      sdkCoordinate: `sdk.project.read.${input.caseKey}`,
      cliCoordinate: `project read ${input.caseKey}`,
      adapterExitMap: TERMINAL_ONLY_ADAPTER_EXIT_MAP,
    }),
  );
}

const catalogList = productReadContract({
  caseKey: "catalog_list",
  sourceKind: "catalog",
  selector: v.strictObject({
    kind: v.literal("catalog_list"),
    visibility: v.union([
      v.strictObject({ kind: v.literal("workspace_catalog") }),
      v.strictObject({ kind: v.literal("session_view"), view: refDigestSchema }),
    ]),
  }),
  projection: catalogListProjectionSchema,
  abstractModule: "Product.CatalogProjection",
  bindingRequired: true,
  catalogRefusals: true,
});

const catalogDescribe = productReadContract({
  caseKey: "catalog_describe",
  sourceKind: "catalog",
  selector: v.strictObject({
    kind: v.literal("catalog_describe"),
    handle: nonblankSchema,
    visibilityBasis: refDigestSchema,
  }),
  projection: catalogDescriptionProjectionSchema,
  abstractModule: "Product.CatalogProjection",
  bindingRequired: true,
  catalogRefusals: true,
});

const workspaceStatus = productReadContract({
  caseKey: "workspace_status",
  sourceKind: "workspace_binding",
  selector: noSelectorSchema,
  projection: workspaceStatusProjectionSchema,
  abstractModule: "Product.WorkspaceProjection",
  bindingRequired: true,
});

const installEvidence = productReadContract({
  caseKey: "install_evidence",
  sourceKind: "installed_product",
  selector: v.strictObject({
    kind: v.literal("install_manifest"),
    manifest: refDigestSchema,
  }),
  projection: installEvidenceProjectionSchema,
  abstractModule: "Product.InstallProjection",
  bindingRequired: false,
});

const releaseEvidence = productReadContract({
  caseKey: "release_evidence",
  sourceKind: "release_cut",
  selector: v.strictObject({
    kind: v.literal("release_snapshot_manifest"),
    manifest: refDigestSchema,
  }),
  projection: releaseEvidenceProjectionSchema,
  abstractModule: "Product.ReleaseProjection",
  bindingRequired: false,
});

const ticketConsensus = productReadContract({
  caseKey: "ticket_consensus",
  sourceKind: "consensus_result",
  selector: v.strictObject({
    kind: v.literal("ticket_consensus"),
    ticket: refDigestSchema,
    outputAuthority: refDigestSchema,
    replayBasis: refDigestSchema,
  }),
  projection: ticketConsensusProjectionSchema,
  abstractModule: "Product.ConsensusProjection",
  bindingRequired: true,
});

export const PRODUCT_PROJECT_READ_CONTRACTS = Object.freeze({
  catalog_list: catalogList,
  catalog_describe: catalogDescribe,
  workspace_status: workspaceStatus,
  install_evidence: installEvidence,
  release_evidence: releaseEvidence,
  ticket_consensus: ticketConsensus,
});

export interface CatalogProjectionPort {
  readonly list: ExactOwnerOperationPort<typeof catalogList>;
  readonly describe: ExactOwnerOperationPort<typeof catalogDescribe>;
}

export interface WorkspaceProjectionPort {
  readonly status: ExactOwnerOperationPort<typeof workspaceStatus>;
}

export interface InstallProjectionPort {
  readonly evidence: ExactOwnerOperationPort<typeof installEvidence>;
}

export interface ReleaseProjectionPort {
  readonly evidence: ExactOwnerOperationPort<typeof releaseEvidence>;
}

export interface ConsensusProjectionPort {
  readonly ticketConsensus: ExactOwnerOperationPort<typeof ticketConsensus>;
}
