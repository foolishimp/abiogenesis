// Private T-281 P1 composition of the exact ABIogenesis 5.0 operation family.

import type * as v from "valibot";

import {
  stableJson,
  stableJsonEquals,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import { freezeNativeValue } from "../../../shared/validation/immutable_native_value.js";
import {
  isResolvedOwnerProjectionRelationCarrier,
  type ResolvedOwnerProjectionRelation
} from "../../../shared/validation/canonical_native_schema_projector.js";
import {
  assertNativeContractDefinitionCarrier,
  type NativeContractDefinition
} from "./native_contract_phase_a.js";
import {
  constructNonProjectReadOwnerContractFamily,
  type NonProjectReadOwnerContractFamily
} from "./non_project_read_owner_contract_family.js";
import {
  P1_CONTRACT_SHAPE_BASIS,
  constructResolvedProjectReadCaseFamily
} from "./project_read_case_family.js";

type NativeSchema = v.GenericSchema;
type Sha256Digest = `sha256:${string}`;
type EffectClass =
  | "workspace_filesystem"
  | "workspace_read_admission"
  | "pure_projection"
  | "deterministic_evaluation"
  | "immutable_install_filesystem"
  | "workspace_binding_persistence"
  | "catalog_event_admission"
  | "deterministic_narrowing"
  | "declaration_application_admission"
  | "abg_traversal"
  | "abg_continuation"
  | "fh_response_admission"
  | "result_assessment_admission"
  | "witnessed_act_admission"
  | "tuning_lifecycle_admission"
  | "conformance_evaluation_admission"
  | "product_filesystem"
  | "immutable_release_publication";

const ONTOLOGY_DIGEST =
  "sha256:bcbacd4a4b4dd3b5b6db2a3ad281c92bf76a7a889da38562d5b6301e85764615" as const;
const RUN_INVOKE_AUTHORITY_DIGEST =
  "sha256:71076f364d06a9725b5482ee0cdc84e64d29a4c18447a5ab4c41e1b62ba7f430" as const;
const RUN_CONTINUE_AUTHORITY_DIGEST =
  "sha256:1b879535201080f5ed7da4bc781bd447fa46c72ad5f500c71e73e0b0ed62b0b2" as const;
const ONTOLOGY_REF =
  "build_tenants/abiogenesis/typescript/design/ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md" as const;

function ontologyMetadata<
  const Fragment extends string,
  const AuthorityClass extends "pure" | "read" | "write" | "attestation",
  const Effect extends EffectClass,
  const EventAdmission extends
    | "none"
    | "owning_semantic_authority"
    | "immutable_artifact_boundary"
>(
  fragment: Fragment,
  authorityClass: AuthorityClass,
  effectClass: Effect,
  eventAdmission: EventAdmission
) {
  const semanticAuthorityRef = `${ONTOLOGY_REF}#${fragment}`;
  return freezeNativeValue({
    semanticAuthorityRef,
    semanticAuthorityDigest: ONTOLOGY_DIGEST,
    authorityClass,
    effectClass,
    eventAdmission
  });
}

function designMetadata<
  const Ref extends string,
  const Digest extends Sha256Digest,
  const Effect extends EffectClass
>(ref: Ref, digest: Digest, effectClass: Effect) {
  return freezeNativeValue({
    semanticAuthorityRef: ref,
    semanticAuthorityDigest: digest,
    authorityClass: "write" as const,
    effectClass,
    eventAdmission: "owning_semantic_authority" as const
  });
}

export const METADATA_BASIS_BY_OPERATION = freezeNativeValue({
  "abg.operation.workspace.create": ontologyMetadata(
    "AF-01", "write", "workspace_filesystem", "immutable_artifact_boundary"
  ),
  "abg.operation.workspace.open": ontologyMetadata(
    "AF-02", "read", "workspace_read_admission", "none"
  ),
  "abg.operation.project.read": ontologyMetadata(
    "AF-03", "read", "pure_projection", "none"
  ),
  "abg.operation.product.verify": ontologyMetadata(
    "AF-04", "attestation", "deterministic_evaluation", "none"
  ),
  "abg.operation.product.resolve": ontologyMetadata(
    "AF-05", "pure", "deterministic_evaluation", "none"
  ),
  "abg.operation.product.install": ontologyMetadata(
    "AF-06", "write", "immutable_install_filesystem", "immutable_artifact_boundary"
  ),
  "abg.operation.workspace.bind": ontologyMetadata(
    "AF-07", "write", "workspace_binding_persistence", "immutable_artifact_boundary"
  ),
  "abg.operation.catalog.admit": ontologyMetadata(
    "AF-08", "write", "catalog_event_admission", "owning_semantic_authority"
  ),
  "abg.operation.catalog.view": ontologyMetadata(
    "AF-09", "pure", "deterministic_narrowing", "none"
  ),
  "abg.operation.catalog.apply": ontologyMetadata(
    "AF-10", "write", "declaration_application_admission", "immutable_artifact_boundary"
  ),
  "abg.operation.run.invoke": designMetadata(
    "build_tenants/abiogenesis/typescript/design/M03_M04_PUBLIC_CATALOG_INVOCATION_AUTHORITY_BEHAVIOR_DESIGN.md",
    RUN_INVOKE_AUTHORITY_DIGEST,
    "abg_traversal"
  ),
  "abg.operation.run.continue": designMetadata(
    "build_tenants/abiogenesis/typescript/design/M03_M04_FH_RUNTIME_CONTINUATION_BEHAVIOR_DESIGN.md",
    RUN_CONTINUE_AUTHORITY_DIGEST,
    "abg_continuation"
  ),
  "abg.operation.interaction.respond": ontologyMetadata(
    "AF-18", "write", "fh_response_admission", "owning_semantic_authority"
  ),
  "abg.operation.result.assess": ontologyMetadata(
    "AF-19", "attestation", "result_assessment_admission", "owning_semantic_authority"
  ),
  "abg.operation.witness.admit": ontologyMetadata(
    "AF-20", "attestation", "witnessed_act_admission", "owning_semantic_authority"
  ),
  "abg.operation.tuning.transition": ontologyMetadata(
    "AF-21", "write", "tuning_lifecycle_admission", "owning_semantic_authority"
  ),
  "abg.operation.conformance.evaluate": ontologyMetadata(
    "AF-22", "attestation", "conformance_evaluation_admission", "none"
  ),
  "abg.operation.product.materialize": ontologyMetadata(
    "AF-23", "write", "product_filesystem", "immutable_artifact_boundary"
  ),
  "abg.operation.release.snapshot": ontologyMetadata(
    "AF-25", "write", "immutable_release_publication", "immutable_artifact_boundary"
  )
} as const);

export type PublicOperationIdentity = keyof typeof METADATA_BASIS_BY_OPERATION;

type AuthorityPresenceRequirement = "forbidden" | "exactly_one";
type ActorRequirement = "forbidden" | "required";
type CatalogScopeRequirement =
  | Readonly<{
      kind: "fixed";
      requirement: AuthorityPresenceRequirement;
    }>
  | Readonly<{
      kind: "by_visibility_basis";
      workspace_catalog: "forbidden";
      session_view: "exactly_one_matching_selector";
    }>;

interface AuthoritySlotRequirements {
  readonly actor: ActorRequirement;
  readonly workspace: AuthorityPresenceRequirement;
  readonly productSet: AuthorityPresenceRequirement;
  readonly dependencyLock: AuthorityPresenceRequirement;
  readonly catalogScope: CatalogScopeRequirement;
  readonly executionProgram: AuthorityPresenceRequirement;
  readonly invocationPolicy: AuthorityPresenceRequirement;
  readonly transportSteering: AuthorityPresenceRequirement;
}

const FIXED_FORBIDDEN_CATALOG_SCOPE = freezeNativeValue({
  kind: "fixed" as const,
  requirement: "forbidden" as const
});
const FIXED_REQUIRED_CATALOG_SCOPE = freezeNativeValue({
  kind: "fixed" as const,
  requirement: "exactly_one" as const
});
const SELECTOR_INDEXED_CATALOG_SCOPE = freezeNativeValue({
  kind: "by_visibility_basis" as const,
  workspace_catalog: "forbidden" as const,
  session_view: "exactly_one_matching_selector" as const
});

function authorityRequirements(input: AuthoritySlotRequirements) {
  return freezeNativeValue(input);
}

const PREBIND_ACTOR_FORBIDDEN = authorityRequirements({
  actor: "forbidden",
  workspace: "forbidden",
  productSet: "forbidden",
  dependencyLock: "forbidden",
  catalogScope: FIXED_FORBIDDEN_CATALOG_SCOPE,
  executionProgram: "forbidden",
  invocationPolicy: "forbidden",
  transportSteering: "forbidden"
});
const PREBIND_ACTOR_REQUIRED = authorityRequirements({
  ...PREBIND_ACTOR_FORBIDDEN,
  actor: "required"
});
const PREBIND_LOCK_ACTOR_FORBIDDEN = authorityRequirements({
  ...PREBIND_ACTOR_FORBIDDEN,
  dependencyLock: "exactly_one"
});
const PREBIND_LOCK_ACTOR_REQUIRED = authorityRequirements({
  ...PREBIND_LOCK_ACTOR_FORBIDDEN,
  actor: "required"
});
const PREBIND_PRODUCT_LOCK_ACTOR_REQUIRED = authorityRequirements({
  ...PREBIND_ACTOR_REQUIRED,
  productSet: "exactly_one",
  dependencyLock: "exactly_one"
});
const BOUND_NONCATALOG_ACTOR_FORBIDDEN = authorityRequirements({
  ...PREBIND_ACTOR_FORBIDDEN,
  workspace: "exactly_one",
  productSet: "exactly_one",
  dependencyLock: "exactly_one"
});
const BOUND_NONCATALOG_ACTOR_REQUIRED = authorityRequirements({
  ...BOUND_NONCATALOG_ACTOR_FORBIDDEN,
  actor: "required"
});
const BOUND_CATALOG_ACTOR_REQUIRED = authorityRequirements({
  ...BOUND_NONCATALOG_ACTOR_REQUIRED,
  catalogScope: FIXED_REQUIRED_CATALOG_SCOPE
});
const EXECUTION_ACTOR_REQUIRED = authorityRequirements({
  ...BOUND_CATALOG_ACTOR_REQUIRED,
  executionProgram: "exactly_one",
  invocationPolicy: "exactly_one",
  transportSteering: "exactly_one"
});
const CATALOG_READ_AUTHORITY = authorityRequirements({
  ...BOUND_NONCATALOG_ACTOR_FORBIDDEN,
  catalogScope: SELECTOR_INDEXED_CATALOG_SCOPE
});

const TERMINAL_ADAPTER_EXIT_MAP = freezeNativeValue({
  acceptedTerminal: 0,
  refused: 1,
  invalidInvocation: 2,
  acceptedNonTerminal: null,
  adapterFailure: 70
} as const);
const NONTERMINAL_ADAPTER_EXIT_MAP = freezeNativeValue({
  acceptedTerminal: 0,
  refused: 1,
  invalidInvocation: 2,
  acceptedNonTerminal: 3,
  adapterFailure: 70
} as const);
const NO_DEFAULTS = freezeNativeValue([] as const);
const START_DEFAULTS = freezeNativeValue([
  { field: "fh_mode", policy: { kind: "literal", value: "direct" } },
  { field: "root_mode", policy: { kind: "literal", value: "supervised" } }
] as const);

interface DefinitionPolicy {
  readonly authoritySlotRequirements: AuthoritySlotRequirements;
  readonly capabilityRefs: readonly [string, ...string[]];
  readonly cliCoordinate: string;
  readonly defaults: readonly Readonly<{
    field: string;
    policy: Readonly<{ kind: "literal"; value: string }>;
  }>[];
}

interface OperationMetadataProjection {
  readonly semanticAuthorityRef: string;
  readonly semanticAuthorityDigest: Sha256Digest;
  readonly authorityClass: "pure" | "read" | "write" | "attestation";
  readonly effectClass: EffectClass;
  readonly eventAdmission:
    | "none"
    | "owning_semantic_authority"
    | "immutable_artifact_boundary";
}

function definitionPolicy<
  const Authority extends AuthoritySlotRequirements,
  const CapabilityRefs extends readonly [string, ...string[]],
  const CliCoordinate extends string,
  const Defaults extends DefinitionPolicy["defaults"]
>(
  input: {
    readonly authoritySlotRequirements: Authority;
    readonly capabilityRefs: CapabilityRefs;
    readonly cliCoordinate: CliCoordinate;
    readonly defaults: Defaults;
  }
) {
  return freezeNativeValue({
    authoritySlotRequirements: input.authoritySlotRequirements,
    capabilityRefs: input.capabilityRefs,
    cliCoordinate: input.cliCoordinate,
    defaults: input.defaults
  });
}

type DefinitionKeysOfFamily<Family> = {
  [Operation in keyof Family]: {
    [Member in keyof Family[Operation]]:
      Family[Operation][Member] extends { readonly definitionKey: infer K }
        ? K
        : never;
  }[keyof Family[Operation]];
}[keyof Family];

type ResolvedProjectReadCaseFamily = Awaited<
  ReturnType<typeof constructResolvedProjectReadCaseFamily>
>;

type DefinitionKeysOfRows<Rows> = {
  [Member in keyof Rows]:
    Rows[Member] extends { readonly definitionKey: infer K } ? K : never;
}[keyof Rows];

type DefinitionKey =
  | DefinitionKeysOfFamily<NonProjectReadOwnerContractFamily>
  | DefinitionKeysOfRows<ResolvedProjectReadCaseFamily>;

interface ContractSlot<K extends DefinitionKey, Slot extends string> {
  readonly kind: "owner_contract_slot_resolved";
  readonly coordinate: {
    readonly definitionKey: K;
    readonly slot: Slot;
  };
  readonly ownerAuthorityRef: string;
  readonly ownerAuthorityDigest: Sha256Digest;
  readonly contractShapeBasisRef: string;
  readonly contractShapeBasisDigest: Sha256Digest;
  readonly contract: NativeContractDefinition<NativeSchema>;
}

interface OwnerContractSlot<K extends DefinitionKey, Slot extends string> {
  readonly kind: "owner_contract_slot_resolved";
  readonly coordinate: {
    readonly definitionKey: K;
    readonly slot: Slot;
  };
  readonly ownerAuthorityRef: string;
  readonly ownerAuthorityDigest: Sha256Digest;
  readonly contract: NativeContractDefinition<NativeSchema>;
}

interface ContractBearingSlot<K extends DefinitionKey, Slot extends string> {
  readonly coordinate: {
    readonly definitionKey: K;
    readonly slot: Slot;
  };
  readonly contract: NativeContractDefinition<NativeSchema>;
}

interface AbsentNonterminal<K extends DefinitionKey> {
  readonly kind: "nonterminal_not_declared";
  readonly coordinate: {
    readonly definitionKey: K;
    readonly slot: "nonterminal";
  };
}

interface ProjectReadResultContract<
  K extends DefinitionKey,
  Request = unknown,
  Projection = unknown
> {
  readonly kind: "project_read_wrapped_result_contract";
  readonly coordinate: {
    readonly definitionKey: K;
    readonly slot: "result";
  };
  readonly wrapperAuthorityRef: string;
  readonly wrapperAuthorityDigest: Sha256Digest;
  readonly projectionOwnerAuthorityRef: string;
  readonly projectionOwnerAuthorityDigest: Sha256Digest;
  readonly projectionContract: NativeContractDefinition<NativeSchema>;
  readonly projectionWitnessDigest: Sha256Digest;
  readonly projectionRelationWitnessDigest: Sha256Digest;
  readonly projectionRelation: ResolvedOwnerProjectionRelation<
    K,
    Request,
    Projection
  >;
  readonly contractShapeBasisRef: string;
  readonly contractShapeBasisDigest: Sha256Digest;
  readonly contract: NativeContractDefinition<NativeSchema>;
}

function bindOwnerSlot<
  const K extends DefinitionKey,
  const Slot extends "request" | "result" | "refusal" | "nonterminal"
>(slot: OwnerContractSlot<K, Slot>): ContractSlot<K, Slot> {
  return freezeNativeValue({
    ...slot,
    contractShapeBasisRef: P1_CONTRACT_SHAPE_BASIS.ref,
    contractShapeBasisDigest: P1_CONTRACT_SHAPE_BASIS.digest
  });
}

function operationSuffix(operationId: PublicOperationIdentity): string {
  return operationId.slice("abg.operation.".length);
}

function schemaCoordinates<
  const K extends DefinitionKey,
  Request extends ContractSlot<K, "request">,
  Result extends ContractBearingSlot<K, "result">,
  Refusal extends ContractSlot<K, "refusal">,
  Nonterminal extends ContractSlot<K, "nonterminal"> | AbsentNonterminal<K>
>(row: {
  readonly request: Request;
  readonly result: Result;
  readonly refusal: Refusal;
  readonly nonterminal: Nonterminal;
}) {
  return freezeNativeValue({
    request: row.request.contract.schemaCoordinate,
    result: row.result.contract.schemaCoordinate,
    refusal: row.refusal.contract.schemaCoordinate,
    nonterminal: row.nonterminal.kind === "nonterminal_not_declared"
      ? null
      : row.nonterminal.contract.schemaCoordinate
  });
}

function visibleContractBindingDigestProjection(
  bindingInput: unknown,
  projectReadResult: boolean
) {
  const binding = objectValue(bindingInput);
  if (binding === null) {
    throw new TypeError("P1 definition digest: invalid contract binding");
  }
  const contract = objectValue(ownDataValue(binding, "contract"));
  const contractCoordinate = contract === null
    ? null
    : objectValue(ownDataValue(contract, "schemaCoordinate"));
  const projectionWitness = contract === null
    ? null
    : objectValue(ownDataValue(contract, "projectionWitness"));
  if (contractCoordinate === null || projectionWitness === null) {
    throw new TypeError("P1 definition digest: invalid contract witness");
  }
  const common = {
    coordinate: ownDataValue(binding, "coordinate"),
    contractShapeBasisRef: ownDataValue(binding, "contractShapeBasisRef"),
    contractShapeBasisDigest: ownDataValue(binding, "contractShapeBasisDigest"),
    contractCoordinate,
    nativeLocator: ownDataValue(contractCoordinate, "nativeLocator"),
    projectionWitnessDigest: ownDataValue(projectionWitness, "witnessDigest")
  };
  if (!projectReadResult) {
    return freezeNativeValue({
      coordinate: common.coordinate,
      ownerAuthorityRef: ownDataValue(binding, "ownerAuthorityRef"),
      ownerAuthorityDigest: ownDataValue(binding, "ownerAuthorityDigest"),
      contractShapeBasisRef: common.contractShapeBasisRef,
      contractShapeBasisDigest: common.contractShapeBasisDigest,
      contractCoordinate: common.contractCoordinate,
      nativeLocator: common.nativeLocator,
      projectionWitnessDigest: common.projectionWitnessDigest
    });
  }
  const projectionContract = objectValue(
    ownDataValue(binding, "projectionContract")
  );
  const projectionContractCoordinate = projectionContract === null
    ? null
    : objectValue(ownDataValue(projectionContract, "schemaCoordinate"));
  const nestedProjectionWitness = projectionContract === null
    ? null
    : objectValue(ownDataValue(projectionContract, "projectionWitness"));
  if (projectionContractCoordinate === null || nestedProjectionWitness === null) {
    throw new TypeError("P1 definition digest: invalid projection contract");
  }
  return freezeNativeValue({
    coordinate: common.coordinate,
    wrapperAuthorityRef: ownDataValue(binding, "wrapperAuthorityRef"),
    wrapperAuthorityDigest: ownDataValue(binding, "wrapperAuthorityDigest"),
    projectionOwnerAuthorityRef:
      ownDataValue(binding, "projectionOwnerAuthorityRef"),
    projectionOwnerAuthorityDigest:
      ownDataValue(binding, "projectionOwnerAuthorityDigest"),
    contractShapeBasisRef: common.contractShapeBasisRef,
    contractShapeBasisDigest: common.contractShapeBasisDigest,
    contractCoordinate: common.contractCoordinate,
    nativeLocator: common.nativeLocator,
    projectionWitnessDigest: common.projectionWitnessDigest,
    projectionContractCoordinate,
    projectionContractWitnessDigest:
      ownDataValue(nestedProjectionWitness, "witnessDigest"),
    projectionRelationWitnessDigest:
      ownDataValue(binding, "projectionRelationWitnessDigest")
  });
}

function definitionDigestProjectionFromVisibleDefinition(
  definition: object
) {
  const definitionKey = ownDataValue(definition, "definitionKey");
  const nonTerminalContract = ownDataValue(
    definition,
    "nonTerminalContract"
  );
  const nonterminalProjection = nonTerminalContract === null
    ? freezeNativeValue({
        kind: "nonterminal_not_declared" as const,
        coordinate: { definitionKey, slot: "nonterminal" as const }
      })
    : visibleContractBindingDigestProjection(nonTerminalContract, false);
  return freezeNativeValue({
    definitionKey,
    version: ownDataValue(definition, "version"),
    request: visibleContractBindingDigestProjection(
      ownDataValue(definition, "requestContract"),
      false
    ),
    result: visibleContractBindingDigestProjection(
      ownDataValue(definition, "resultContract"),
      ownDataValue(
        objectValue(ownDataValue(definition, "resultContract")) ?? {},
        "kind"
      ) === "project_read_wrapped_result_contract"
    ),
    refusal: visibleContractBindingDigestProjection(
      ownDataValue(definition, "refusalContract"),
      false
    ),
    nonterminal: nonterminalProjection,
    metadata: {
      ...metadataProjectionFromDefinition(definition),
      authoritySlotRequirements:
        ownDataValue(definition, "authoritySlotRequirements"),
      capabilityRefs: ownDataValue(definition, "capabilityRefs"),
      workspaceBindingRequirement:
        ownDataValue(definition, "workspaceBindingRequirement"),
      defaults: ownDataValue(definition, "defaults"),
      schemaCoordinates: ownDataValue(definition, "schemaCoordinates"),
      sdkCoordinate: ownDataValue(definition, "sdkCoordinate"),
      cliCoordinate: ownDataValue(definition, "cliCoordinate"),
      adapterExitMap: ownDataValue(definition, "adapterExitMap")
    }
  });
}

function definitionMetadataProjection<
  const OperationId extends PublicOperationIdentity,
  const Policy extends DefinitionPolicy,
  const Coordinates extends ReturnType<typeof schemaCoordinates>
>(
  operationId: OperationId,
  policy: Policy,
  coordinates: Coordinates
): Readonly<OperationMetadataProjection & {
  authoritySlotRequirements: Policy["authoritySlotRequirements"];
  capabilityRefs: Policy["capabilityRefs"];
  workspaceBindingRequirement:
    Policy["authoritySlotRequirements"]["workspace"];
  defaults: Policy["defaults"];
  schemaCoordinates: Coordinates;
  sdkCoordinate: string;
  cliCoordinate: Policy["cliCoordinate"];
}> {
  const metadata = METADATA_BASIS_BY_OPERATION[operationId];
  return freezeNativeValue({
    semanticAuthorityRef: metadata.semanticAuthorityRef,
    semanticAuthorityDigest: metadata.semanticAuthorityDigest,
    authorityClass: metadata.authorityClass,
    effectClass: metadata.effectClass,
    eventAdmission: metadata.eventAdmission,
    authoritySlotRequirements: policy.authoritySlotRequirements,
    capabilityRefs: policy.capabilityRefs,
    workspaceBindingRequirement:
      policy.authoritySlotRequirements.workspace,
    defaults: policy.defaults,
    schemaCoordinates: coordinates,
    sdkCoordinate: `sdk.${operationSuffix(operationId)}`,
    cliCoordinate: policy.cliCoordinate
  });
}

function assembleDefinition<
  const K extends DefinitionKey,
  Request extends ContractSlot<K, "request">,
  Result extends ContractBearingSlot<K, "result">,
  Refusal extends ContractSlot<K, "refusal">,
  Nonterminal extends ContractSlot<K, "nonterminal"> | AbsentNonterminal<K>,
  const AdapterExitMap extends
    | typeof TERMINAL_ADAPTER_EXIT_MAP
    | typeof NONTERMINAL_ADAPTER_EXIT_MAP,
  const Policy extends DefinitionPolicy
>(
  row: {
    readonly definitionKey: K;
    readonly request: Request;
    readonly result: Result;
    readonly refusal: Refusal;
    readonly nonterminal: Nonterminal;
  },
  policy: Policy,
  adapterExitMap: AdapterExitMap
) {
  const coordinates = schemaCoordinates(row);
  const metadata = definitionMetadataProjection(
    row.definitionKey.operationId,
    policy,
    coordinates
  );
  const basis = freezeNativeValue({
    definitionKey: row.definitionKey,
    version: "5.0.0" as const,
    requestContract: row.request,
    resultContract: row.result,
    refusalContract: row.refusal,
    nonTerminalContract:
      row.nonterminal.kind === "nonterminal_not_declared"
        ? null
        : row.nonterminal,
    ...metadata,
    adapterExitMap
  });
  const digestProjection =
    definitionDigestProjectionFromVisibleDefinition(basis);
  const definition = freezeNativeValue({
    ...basis,
    definitionDigest: stableSha256Digest(digestProjection)
  });
  return definition;
}

function defineTerminalVariant<
  const K extends DefinitionKey & { readonly memberKind: "variant" },
  RequestSchema extends NativeSchema,
  ResultSchema extends NativeSchema,
  RefusalSchema extends NativeSchema
  ,
  const Policy extends DefinitionPolicy
>(
  row: {
    readonly definitionKey: K;
    readonly request: OwnerContractSlot<K, "request"> & {
      readonly contract: NativeContractDefinition<RequestSchema>;
    };
    readonly result: OwnerContractSlot<K, "result"> & {
      readonly contract: NativeContractDefinition<ResultSchema>;
    };
    readonly refusal: OwnerContractSlot<K, "refusal"> & {
      readonly contract: NativeContractDefinition<RefusalSchema>;
    };
    readonly nonterminal: AbsentNonterminal<K>;
  },
  policy: Policy
) {
  const request = bindOwnerSlot(row.request);
  const result = bindOwnerSlot(row.result);
  const refusal = bindOwnerSlot(row.refusal);
  return assembleDefinition(
    {
      definitionKey: row.definitionKey,
      request,
      result,
      refusal,
      nonterminal: row.nonterminal
    },
    policy,
    TERMINAL_ADAPTER_EXIT_MAP
  );
}

function defineNonterminalVariant<
  const K extends DefinitionKey & { readonly memberKind: "variant" },
  RequestSchema extends NativeSchema,
  ResultSchema extends NativeSchema,
  RefusalSchema extends NativeSchema,
  NonterminalSchema extends NativeSchema,
  const Policy extends DefinitionPolicy
>(
  row: {
    readonly definitionKey: K;
    readonly request: OwnerContractSlot<K, "request"> & {
      readonly contract: NativeContractDefinition<RequestSchema>;
    };
    readonly result: OwnerContractSlot<K, "result"> & {
      readonly contract: NativeContractDefinition<ResultSchema>;
    };
    readonly refusal: OwnerContractSlot<K, "refusal"> & {
      readonly contract: NativeContractDefinition<RefusalSchema>;
    };
    readonly nonterminal: OwnerContractSlot<K, "nonterminal"> & {
      readonly contract: NativeContractDefinition<NonterminalSchema>;
    };
  },
  policy: Policy
) {
  const request = bindOwnerSlot(row.request);
  const result = bindOwnerSlot(row.result);
  const refusal = bindOwnerSlot(row.refusal);
  const nonterminal = bindOwnerSlot(row.nonterminal);
  return assembleDefinition(
    { definitionKey: row.definitionKey, request, result, refusal, nonterminal },
    policy,
    NONTERMINAL_ADAPTER_EXIT_MAP
  );
}

function defineProjectRead<
  const K extends DefinitionKey & { readonly memberKind: "project_read_case" },
  RequestSchema extends NativeSchema,
  ProjectionSchema extends NativeSchema,
  ResultSchema extends NativeSchema,
  RefusalSchema extends NativeSchema,
  const Policy extends DefinitionPolicy
>(
  row: {
    readonly definitionKey: K;
    readonly request: ContractSlot<K, "request"> & {
      readonly contract: NativeContractDefinition<RequestSchema>;
    };
    readonly result: ProjectReadResultContract<
      K,
      v.InferOutput<RequestSchema>,
      v.InferOutput<ProjectionSchema>
    > & {
      readonly projectionContract: NativeContractDefinition<ProjectionSchema>;
      readonly contract: NativeContractDefinition<ResultSchema>;
    };
    readonly refusal: ContractSlot<K, "refusal"> & {
      readonly contract: NativeContractDefinition<RefusalSchema>;
    };
    readonly nonterminal: AbsentNonterminal<K>;
  },
  policy: Policy
) {
  if (
    row.request.contractShapeBasisRef !== P1_CONTRACT_SHAPE_BASIS.ref ||
    row.request.contractShapeBasisDigest !== P1_CONTRACT_SHAPE_BASIS.digest ||
    row.result.contractShapeBasisRef !== P1_CONTRACT_SHAPE_BASIS.ref ||
    row.result.contractShapeBasisDigest !== P1_CONTRACT_SHAPE_BASIS.digest ||
    row.refusal.contractShapeBasisRef !== P1_CONTRACT_SHAPE_BASIS.ref ||
    row.refusal.contractShapeBasisDigest !== P1_CONTRACT_SHAPE_BASIS.digest
  ) {
    throw new TypeError("P1 definition family: divergent project.read shape basis");
  }
  return assembleDefinition(
    row,
    policy,
    TERMINAL_ADAPTER_EXIT_MAP
  );
}

const CAP_OPERATOR = ["abg.capability.operator.public-contract@5"] as const;
const CAP_INSTALL = ["abg.capability.install.bind-products@5"] as const;
const CAP_CATALOG_CONTRIBUTE = ["abg.capability.catalog.contribute@5"] as const;
const CAP_APPLY_NODE_TYPE = ["abg.capability.catalog.apply-node-type@5"] as const;
const CAP_APPLY_OVERLAY = ["abg.capability.catalog.apply-overlay@5"] as const;
const CAP_INVOKE = [
  "abg.capability.catalog.invoke-graph-function@5",
  "abg.capability.runtime.execute-seven-term-c@5"
] as const;
const CAP_CONTINUE = ["abg.capability.runtime.replay-continuation@5"] as const;
const CAP_RESPOND = [
  "abg.capability.operator.public-contract@5",
  "abg.capability.runtime.replay-continuation@5"
] as const;
const CAP_ASSESS = ["abg.capability.runtime.admit-fp-result@5"] as const;
const CAP_GTL = ["abg.capability.gtl.typecheck@5"] as const;
const CAP_RELEASE = [
  "abg.capability.operator.public-contract@5",
  "abg.capability.qualification.self-conformance@5"
] as const;

/** @internal */
export async function constructPrivatePublicOperationDefinitionFamily() {
  const [nonRead, projectRead] = await Promise.all([
    constructNonProjectReadOwnerContractFamily(),
    constructResolvedProjectReadCaseFamily()
  ]);
  installExpectedMemberKeys(nonRead, projectRead);

  const workspaceCreatePolicy = definitionPolicy({
    authoritySlotRequirements: PREBIND_ACTOR_REQUIRED,
    capabilityRefs: CAP_OPERATOR,
    cliCoordinate: "workspace create --policy <policy>",
    defaults: NO_DEFAULTS
  });
  const workspaceOpenPolicy = definitionPolicy({
    authoritySlotRequirements: PREBIND_ACTOR_FORBIDDEN,
    capabilityRefs: CAP_OPERATOR,
    cliCoordinate: "workspace open",
    defaults: NO_DEFAULTS
  });
  const productVerifyPolicy = definitionPolicy({
    authoritySlotRequirements: PREBIND_LOCK_ACTOR_FORBIDDEN,
    capabilityRefs: CAP_INSTALL,
    cliCoordinate: "product verify",
    defaults: NO_DEFAULTS
  });
  const productResolvePolicy = definitionPolicy({
    authoritySlotRequirements: PREBIND_ACTOR_FORBIDDEN,
    capabilityRefs: CAP_INSTALL,
    cliCoordinate: "product resolve",
    defaults: NO_DEFAULTS
  });
  const productInstallPolicy = definitionPolicy({
    authoritySlotRequirements: PREBIND_LOCK_ACTOR_REQUIRED,
    capabilityRefs: CAP_INSTALL,
    cliCoordinate: "product install",
    defaults: NO_DEFAULTS
  });
  const workspaceBindPolicy = definitionPolicy({
    authoritySlotRequirements: PREBIND_PRODUCT_LOCK_ACTOR_REQUIRED,
    capabilityRefs: CAP_INSTALL,
    cliCoordinate: "workspace bind",
    defaults: NO_DEFAULTS
  });
  const catalogAdmitPolicy = definitionPolicy({
    authoritySlotRequirements: BOUND_NONCATALOG_ACTOR_REQUIRED,
    capabilityRefs: CAP_CATALOG_CONTRIBUTE,
    cliCoordinate: "catalog admit",
    defaults: NO_DEFAULTS
  });
  const catalogViewPolicy = definitionPolicy({
    authoritySlotRequirements: BOUND_NONCATALOG_ACTOR_REQUIRED,
    capabilityRefs: CAP_OPERATOR,
    cliCoordinate: "catalog view",
    defaults: NO_DEFAULTS
  });
  const catalogNodeTypePolicy = definitionPolicy({
    authoritySlotRequirements: BOUND_CATALOG_ACTOR_REQUIRED,
    capabilityRefs: CAP_APPLY_NODE_TYPE,
    cliCoordinate: "catalog apply <kind>",
    defaults: NO_DEFAULTS
  });
  const catalogOverlayPolicy = definitionPolicy({
    authoritySlotRequirements: BOUND_CATALOG_ACTOR_REQUIRED,
    capabilityRefs: CAP_APPLY_OVERLAY,
    cliCoordinate: "catalog apply <kind>",
    defaults: NO_DEFAULTS
  });
  const runInvokePolicy = definitionPolicy({
    authoritySlotRequirements: EXECUTION_ACTOR_REQUIRED,
    capabilityRefs: CAP_INVOKE,
    cliCoordinate: "run <variant>",
    defaults: NO_DEFAULTS
  });
  const runStartPolicy = definitionPolicy({
    authoritySlotRequirements: EXECUTION_ACTOR_REQUIRED,
    capabilityRefs: CAP_INVOKE,
    cliCoordinate: "run <variant>",
    defaults: START_DEFAULTS
  });
  const runContinuePolicy = definitionPolicy({
    authoritySlotRequirements: EXECUTION_ACTOR_REQUIRED,
    capabilityRefs: CAP_CONTINUE,
    cliCoordinate: "run continue --mode <mode>",
    defaults: NO_DEFAULTS
  });
  const interactionRespondPolicy = definitionPolicy({
    authoritySlotRequirements: BOUND_NONCATALOG_ACTOR_REQUIRED,
    capabilityRefs: CAP_RESPOND,
    cliCoordinate: "interaction respond <variant>",
    defaults: NO_DEFAULTS
  });
  const resultAssessPolicy = definitionPolicy({
    authoritySlotRequirements: BOUND_NONCATALOG_ACTOR_REQUIRED,
    capabilityRefs: CAP_ASSESS,
    cliCoordinate: "result assess",
    defaults: NO_DEFAULTS
  });
  const witnessAdmitPolicy = definitionPolicy({
    authoritySlotRequirements: BOUND_NONCATALOG_ACTOR_REQUIRED,
    capabilityRefs: CAP_OPERATOR,
    cliCoordinate: "witness admit <variant>",
    defaults: NO_DEFAULTS
  });
  const tuningTransitionPolicy = definitionPolicy({
    authoritySlotRequirements: BOUND_NONCATALOG_ACTOR_REQUIRED,
    capabilityRefs: CAP_OPERATOR,
    cliCoordinate: "tuning transition <variant>",
    defaults: NO_DEFAULTS
  });
  const conformanceEvaluatePolicy = definitionPolicy({
    authoritySlotRequirements: BOUND_NONCATALOG_ACTOR_REQUIRED,
    capabilityRefs: CAP_GTL,
    cliCoordinate: "conformance evaluate gtl-program",
    defaults: NO_DEFAULTS
  });
  const productMaterializePolicy = definitionPolicy({
    authoritySlotRequirements: BOUND_NONCATALOG_ACTOR_REQUIRED,
    capabilityRefs: CAP_INSTALL,
    cliCoordinate: "product materialize <variant>",
    defaults: NO_DEFAULTS
  });
  const releaseSnapshotPolicy = definitionPolicy({
    authoritySlotRequirements: BOUND_NONCATALOG_ACTOR_REQUIRED,
    capabilityRefs: CAP_RELEASE,
    cliCoordinate: "release snapshot <variant>",
    defaults: NO_DEFAULTS
  });
  const catalogReadPolicy = definitionPolicy({
    authoritySlotRequirements: CATALOG_READ_AUTHORITY,
    capabilityRefs: CAP_OPERATOR,
    cliCoordinate: "project read <projection>",
    defaults: NO_DEFAULTS
  });
  const unboundInstallReadPolicy = definitionPolicy({
    authoritySlotRequirements: PREBIND_ACTOR_FORBIDDEN,
    capabilityRefs: CAP_INSTALL,
    cliCoordinate: "project read <projection>",
    defaults: NO_DEFAULTS
  });
  const unboundReleaseReadPolicy = definitionPolicy({
    authoritySlotRequirements: PREBIND_ACTOR_FORBIDDEN,
    capabilityRefs: CAP_OPERATOR,
    cliCoordinate: "project read <projection>",
    defaults: NO_DEFAULTS
  });
  const operatorReadPolicy = definitionPolicy({
    authoritySlotRequirements: BOUND_NONCATALOG_ACTOR_FORBIDDEN,
    capabilityRefs: CAP_OPERATOR,
    cliCoordinate: "project read <projection>",
    defaults: NO_DEFAULTS
  });
  const continuationReadPolicy = definitionPolicy({
    authoritySlotRequirements: BOUND_NONCATALOG_ACTOR_FORBIDDEN,
    capabilityRefs: CAP_CONTINUE,
    cliCoordinate: "project read <projection>",
    defaults: NO_DEFAULTS
  });
  const assessmentReadPolicy = definitionPolicy({
    authoritySlotRequirements: BOUND_NONCATALOG_ACTOR_FORBIDDEN,
    capabilityRefs: CAP_ASSESS,
    cliCoordinate: "project read <projection>",
    defaults: NO_DEFAULTS
  });

  return freezeNativeValue({
    "abg.operation.workspace.create": {
      clean: defineTerminalVariant(nonRead["abg.operation.workspace.create"].clean, workspaceCreatePolicy),
      imported: defineTerminalVariant(nonRead["abg.operation.workspace.create"].imported, workspaceCreatePolicy)
    },
    "abg.operation.workspace.open": {
      open: defineTerminalVariant(nonRead["abg.operation.workspace.open"].open, workspaceOpenPolicy)
    },
    "abg.operation.project.read": {
      catalog_list: defineProjectRead(projectRead.catalog_list, catalogReadPolicy),
      catalog_describe: defineProjectRead(projectRead.catalog_describe, catalogReadPolicy),
      workspace_status: defineProjectRead(projectRead.workspace_status, operatorReadPolicy),
      run_status: defineProjectRead(projectRead.run_status, continuationReadPolicy),
      graph_call_status: defineProjectRead(projectRead.graph_call_status, continuationReadPolicy),
      run_result: defineProjectRead(projectRead.run_result, continuationReadPolicy),
      graph_call_result: defineProjectRead(projectRead.graph_call_result, continuationReadPolicy),
      run_evidence: defineProjectRead(projectRead.run_evidence, continuationReadPolicy),
      graph_call_evidence: defineProjectRead(projectRead.graph_call_evidence, continuationReadPolicy),
      result_evidence: defineProjectRead(projectRead.result_evidence, continuationReadPolicy),
      assessment_evidence: defineProjectRead(projectRead.assessment_evidence, assessmentReadPolicy),
      witness_evidence: defineProjectRead(projectRead.witness_evidence, operatorReadPolicy),
      install_evidence: defineProjectRead(projectRead.install_evidence, unboundInstallReadPolicy),
      release_evidence: defineProjectRead(projectRead.release_evidence, unboundReleaseReadPolicy),
      workspace_replay: defineProjectRead(projectRead.workspace_replay, continuationReadPolicy),
      run_replay: defineProjectRead(projectRead.run_replay, continuationReadPolicy),
      graph_call_replay: defineProjectRead(projectRead.graph_call_replay, continuationReadPolicy),
      interaction_replay: defineProjectRead(projectRead.interaction_replay, continuationReadPolicy),
      continuation_replay: defineProjectRead(projectRead.continuation_replay, continuationReadPolicy),
      c_call_replay: defineProjectRead(projectRead.c_call_replay, continuationReadPolicy),
      workspace_gaps: defineProjectRead(projectRead.workspace_gaps, operatorReadPolicy),
      run_gaps: defineProjectRead(projectRead.run_gaps, continuationReadPolicy),
      run_lawful_actions: defineProjectRead(projectRead.run_lawful_actions, continuationReadPolicy),
      observer_report: defineProjectRead(projectRead.observer_report, operatorReadPolicy),
      observer_drafts: defineProjectRead(projectRead.observer_drafts, operatorReadPolicy),
      tuning_report: defineProjectRead(projectRead.tuning_report, operatorReadPolicy),
      ticket_consensus: defineProjectRead(projectRead.ticket_consensus, operatorReadPolicy)
    },
    "abg.operation.product.verify": {
      verify: defineTerminalVariant(nonRead["abg.operation.product.verify"].verify, productVerifyPolicy)
    },
    "abg.operation.product.resolve": {
      resolve: defineTerminalVariant(nonRead["abg.operation.product.resolve"].resolve, productResolvePolicy)
    },
    "abg.operation.product.install": {
      install: defineTerminalVariant(nonRead["abg.operation.product.install"].install, productInstallPolicy)
    },
    "abg.operation.workspace.bind": {
      bind: defineTerminalVariant(nonRead["abg.operation.workspace.bind"].bind, workspaceBindPolicy)
    },
    "abg.operation.catalog.admit": {
      admit: defineTerminalVariant(nonRead["abg.operation.catalog.admit"].admit, catalogAdmitPolicy)
    },
    "abg.operation.catalog.view": {
      allowlist: defineTerminalVariant(nonRead["abg.operation.catalog.view"].allowlist, catalogViewPolicy)
    },
    "abg.operation.catalog.apply": {
      node_type: defineTerminalVariant(nonRead["abg.operation.catalog.apply"].node_type, catalogNodeTypePolicy),
      overlay: defineTerminalVariant(nonRead["abg.operation.catalog.apply"].overlay, catalogOverlayPolicy)
    },
    "abg.operation.run.invoke": {
      invoke: defineNonterminalVariant(nonRead["abg.operation.run.invoke"].invoke, runInvokePolicy),
      start: defineNonterminalVariant(nonRead["abg.operation.run.invoke"].start, runStartPolicy)
    },
    "abg.operation.run.continue": {
      current_intent: defineNonterminalVariant(nonRead["abg.operation.run.continue"].current_intent, runContinuePolicy),
      selected_action: defineNonterminalVariant(nonRead["abg.operation.run.continue"].selected_action, runContinuePolicy)
    },
    "abg.operation.interaction.respond": {
      select: defineNonterminalVariant(nonRead["abg.operation.interaction.respond"].select, interactionRespondPolicy),
      approve: defineNonterminalVariant(nonRead["abg.operation.interaction.respond"].approve, interactionRespondPolicy),
      reject: defineNonterminalVariant(nonRead["abg.operation.interaction.respond"].reject, interactionRespondPolicy),
      assess: defineNonterminalVariant(nonRead["abg.operation.interaction.respond"].assess, interactionRespondPolicy),
      answer_escalation: defineNonterminalVariant(nonRead["abg.operation.interaction.respond"].answer_escalation, interactionRespondPolicy)
    },
    "abg.operation.result.assess": {
      assess: defineNonterminalVariant(nonRead["abg.operation.result.assess"].assess, resultAssessPolicy)
    },
    "abg.operation.witness.admit": {
      reprice: defineTerminalVariant(nonRead["abg.operation.witness.admit"].reprice, witnessAdmitPolicy),
      attest: defineTerminalVariant(nonRead["abg.operation.witness.admit"].attest, witnessAdmitPolicy),
      "hygiene-stamp": defineTerminalVariant(nonRead["abg.operation.witness.admit"]["hygiene-stamp"], witnessAdmitPolicy),
      intake: defineTerminalVariant(nonRead["abg.operation.witness.admit"].intake, witnessAdmitPolicy),
      "run-resumed": defineTerminalVariant(nonRead["abg.operation.witness.admit"]["run-resumed"], witnessAdmitPolicy),
      "run-stopped": defineTerminalVariant(nonRead["abg.operation.witness.admit"]["run-stopped"], witnessAdmitPolicy)
    },
    "abg.operation.tuning.transition": {
      propose: defineTerminalVariant(nonRead["abg.operation.tuning.transition"].propose, tuningTransitionPolicy),
      ratify: defineTerminalVariant(nonRead["abg.operation.tuning.transition"].ratify, tuningTransitionPolicy),
      reject: defineTerminalVariant(nonRead["abg.operation.tuning.transition"].reject, tuningTransitionPolicy)
    },
    "abg.operation.conformance.evaluate": {
      gtl_program: defineTerminalVariant(nonRead["abg.operation.conformance.evaluate"].gtl_program, conformanceEvaluatePolicy)
    },
    "abg.operation.product.materialize": {
      context_bootstrap: defineTerminalVariant(nonRead["abg.operation.product.materialize"].context_bootstrap, productMaterializePolicy),
      configuration: defineTerminalVariant(nonRead["abg.operation.product.materialize"].configuration, productMaterializePolicy)
    },
    "abg.operation.release.snapshot": {
      published_rc: defineTerminalVariant(nonRead["abg.operation.release.snapshot"].published_rc, releaseSnapshotPolicy),
      tapped_release: defineTerminalVariant(nonRead["abg.operation.release.snapshot"].tapped_release, releaseSnapshotPolicy)
    }
  } as const);
}

/** @internal */
export type PrivatePublicOperationDefinitionFamily = Awaited<
  ReturnType<typeof constructPrivatePublicOperationDefinitionFamily>
>;

const P1_DESIGN_REF =
  "build_tenants/abiogenesis/typescript/design/M04_PUBLIC_OPERATION_DEFINITION_FAMILY_BEHAVIOR_DESIGN.md";

const DEFINITION_OWN_KEYS = freezeNativeValue([
  "definitionKey",
  "version",
  "requestContract",
  "resultContract",
  "refusalContract",
  "nonTerminalContract",
  "semanticAuthorityRef",
  "semanticAuthorityDigest",
  "authorityClass",
  "effectClass",
  "eventAdmission",
  "authoritySlotRequirements",
  "capabilityRefs",
  "workspaceBindingRequirement",
  "defaults",
  "schemaCoordinates",
  "sdkCoordinate",
  "cliCoordinate",
  "adapterExitMap",
  "definitionDigest"
] as const);
const OWNER_CONTRACT_BINDING_OWN_KEYS = freezeNativeValue([
  "kind",
  "coordinate",
  "ownerAuthorityRef",
  "ownerAuthorityDigest",
  "contractShapeBasisRef",
  "contractShapeBasisDigest",
  "contract"
] as const);
const PROJECT_READ_RESULT_BINDING_OWN_KEYS = freezeNativeValue([
  "kind",
  "coordinate",
  "wrapperAuthorityRef",
  "wrapperAuthorityDigest",
  "projectionOwnerAuthorityRef",
  "projectionOwnerAuthorityDigest",
  "projectionContract",
  "projectionWitnessDigest",
  "projectionRelationWitnessDigest",
  "projectionRelation",
  "contractShapeBasisRef",
  "contractShapeBasisDigest",
  "contract"
] as const);

let expectedMemberKeysByOperation: Readonly<Record<string, readonly string[]>> | null =
  null;

function installExpectedMemberKeys(
  nonRead: NonProjectReadOwnerContractFamily,
  projectRead: Awaited<ReturnType<typeof constructResolvedProjectReadCaseFamily>>
): void {
  const next = freezeNativeValue(Object.fromEntries(
    Object.keys(METADATA_BASIS_BY_OPERATION).map((operationId) => {
      const ownerFamily = operationId === "abg.operation.project.read"
        ? projectRead
        : ownDataValue(nonRead, operationId);
      const ownerFamilyObject = objectValue(ownerFamily);
      if (ownerFamilyObject === null) {
        throw new TypeError(
          `P1 definition family: missing owner family for ${operationId}`
        );
      }
      return [operationId, Object.keys(ownerFamilyObject).sort()] as const;
    })
  ));
  if (
    expectedMemberKeysByOperation !== null &&
    !stableJsonEquals(expectedMemberKeysByOperation, next)
  ) {
    throw new TypeError("P1 definition family: owner member basis changed in process");
  }
  expectedMemberKeysByOperation = next;
}

interface PrivateFamilyGapEntry {
  readonly kind: "definition_family_input_gap";
  readonly fieldPath: string;
  readonly reason: string;
  readonly evidenceRefs: readonly [typeof P1_DESIGN_REF];
}

function objectValue(input: unknown): object | null {
  return typeof input === "object" && input !== null && !Array.isArray(input)
    ? input
    : null;
}

function ownDataValue(input: object, key: string): unknown {
  const descriptor = Object.getOwnPropertyDescriptor(input, key);
  return descriptor !== undefined && "value" in descriptor
    ? descriptor.value
    : undefined;
}

function ownStringKeys(input: object): readonly string[] | null {
  const keys = Reflect.ownKeys(input);
  return keys.every((key): key is string => typeof key === "string")
    ? keys
    : null;
}

function hasExactOwnStringKeys(
  input: object,
  expected: readonly string[]
): boolean {
  const actual = ownStringKeys(input);
  return actual !== null &&
    actual.length === expected.length &&
    expected.every((key) => actual.includes(key));
}

function recursivelyFrozen(
  input: unknown,
  ancestors = new Set<object>()
): boolean {
  if (typeof input !== "object" || input === null || ancestors.has(input)) {
    return true;
  }
  if (!Object.isFrozen(input)) {
    return false;
  }
  ancestors.add(input);
  try {
    return Reflect.ownKeys(input).every((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(input, key);
      return descriptor === undefined || !("value" in descriptor) ||
        recursivelyFrozen(descriptor.value, ancestors);
    });
  } finally {
    ancestors.delete(input);
  }
}

function metadataProjectionFromDefinition(definition: object) {
  return freezeNativeValue({
    semanticAuthorityRef: ownDataValue(definition, "semanticAuthorityRef"),
    semanticAuthorityDigest: ownDataValue(definition, "semanticAuthorityDigest"),
    authorityClass: ownDataValue(definition, "authorityClass"),
    effectClass: ownDataValue(definition, "effectClass"),
    eventAdmission: ownDataValue(definition, "eventAdmission")
  });
}

/** @internal */
export function inspectPrivatePublicOperationDefinitionFamily(
  candidate: unknown
) {
  const gaps = new Map<string, PrivateFamilyGapEntry>();
  const addGap = (fieldPath: string, reason: string): void => {
    const gap = freezeNativeValue({
      kind: "definition_family_input_gap" as const,
      fieldPath,
      reason,
      evidenceRefs: [P1_DESIGN_REF] as const
    });
    gaps.set(stableJson(gap), gap);
  };
  const family = objectValue(candidate);
  if (family === null) {
    addGap("family", "expected_exact_nested_object");
  }

  const expectedOperations = Object.keys(METADATA_BASIS_BY_OPERATION);
  const familyKeys = family === null ? null : ownStringKeys(family);
  if (
    familyKeys === null ||
    familyKeys.length !== expectedOperations.length ||
    !expectedOperations.every((operationId) => familyKeys.includes(operationId))
  ) {
    addGap("family.operations", "expected_exact_19_operation_identities");
  }

  const familyDigestProjection: Record<string, Record<string, string>> = {};
  const definitionKeys: unknown[] = [];
  const jsonSchemas: unknown[] = [];
  const sdkCliCoordinates: unknown[] = [];
  const candidateCatalogMembers: Record<string, unknown[]> = {};
  const schemaCoordinateIdentities = new Set<string>();
  let definitionCount = 0;
  let nonReadCount = 0;
  let projectReadCount = 0;
  let finalSchemaCount = 0;
  let absentNonterminalCount = 0;

  if (family !== null) {
    for (const operationId of expectedOperations) {
      const operation = objectValue(ownDataValue(family, operationId));
      if (operation === null) {
        addGap(operationId, "missing_operation_family");
        continue;
      }
      const rawMemberKeys = ownStringKeys(operation);
      if (rawMemberKeys === null || rawMemberKeys.length === 0) {
        addGap(operationId, "operation_has_no_exact_members");
        continue;
      }
      const expectedMemberKeys = expectedMemberKeysByOperation?.[operationId];
      if (
        expectedMemberKeys === undefined ||
        rawMemberKeys.length !== expectedMemberKeys.length ||
        !expectedMemberKeys.every((member) => rawMemberKeys.includes(member))
      ) {
        addGap(operationId, "operation_member_family_mismatch");
      }
      const memberKeys = [...rawMemberKeys].sort();
      const operationDigestProjection: Record<string, string> = {};
      const operationCatalogMembers: unknown[] = [];
      familyDigestProjection[operationId] = operationDigestProjection;
      candidateCatalogMembers[operationId] = operationCatalogMembers;
      let operationSdkCoordinate: unknown;
      let operationCliCoordinate: unknown;

      for (const member of memberKeys) {
        const path = `${operationId}.${member}`;
        const definition = objectValue(ownDataValue(operation, member));
        if (definition === null) {
          addGap(path, "definition_is_not_an_object");
          continue;
        }
        if (!hasExactOwnStringKeys(definition, DEFINITION_OWN_KEYS)) {
          addGap(path, "definition_has_unexpected_or_missing_fields");
        }
        definitionCount += 1;
        if (operationId === "abg.operation.project.read") {
          projectReadCount += 1;
        } else {
          nonReadCount += 1;
        }

        const definitionKey = objectValue(
          ownDataValue(definition, "definitionKey")
        );
        const expectedKey = operationId === "abg.operation.project.read"
          ? freezeNativeValue({
              operationId,
              memberKind: "project_read_case" as const,
              caseKey: member
            })
          : freezeNativeValue({
              operationId,
              memberKind: "variant" as const,
              variant: member
            });
        if (
          definitionKey === null ||
          !stableJsonEquals(definitionKey, expectedKey)
        ) {
          addGap(`${path}.definitionKey`, "containment_key_mismatch");
        }

        const expectedMetadata = ownDataValue(
          METADATA_BASIS_BY_OPERATION,
          operationId
        );
        if (
          !stableJsonEquals(
            metadataProjectionFromDefinition(definition),
            expectedMetadata
          )
        ) {
          addGap(`${path}.metadata`, "operation_metadata_mismatch");
        }

        const definitionDigest = ownDataValue(definition, "definitionDigest");
        let digestProjection: unknown;
        try {
          digestProjection =
            definitionDigestProjectionFromVisibleDefinition(definition);
        } catch {
          digestProjection = undefined;
        }
        let admittedDefinitionDigest: string | null = null;
        if (
          digestProjection === undefined ||
          typeof definitionDigest !== "string" ||
          definitionDigest !== stableSha256Digest(digestProjection)
        ) {
          addGap(`${path}.definitionDigest`, "unminted_or_divergent_definition");
        } else {
          operationDigestProjection[member] = definitionDigest;
          admittedDefinitionDigest = definitionDigest;
        }

        const coordinates = objectValue(
          ownDataValue(definition, "schemaCoordinates")
        );
        const coordinateKeys = coordinates === null
          ? null
          : ownStringKeys(coordinates);
        if (
          coordinates === null ||
          coordinateKeys === null ||
          coordinateKeys.length !== 4 ||
          !["request", "result", "refusal", "nonterminal"].every(
            (slot) => coordinateKeys.includes(slot)
          )
        ) {
          addGap(`${path}.schemaCoordinates`, "expected_exact_four_slots");
        } else {
          for (const slotRow of [
            { slot: "request", bindingField: "requestContract" },
            { slot: "result", bindingField: "resultContract" },
            { slot: "refusal", bindingField: "refusalContract" },
            { slot: "nonterminal", bindingField: "nonTerminalContract" }
          ] as const) {
            const coordinate = ownDataValue(coordinates, slotRow.slot);
            const binding = ownDataValue(definition, slotRow.bindingField);
            if (slotRow.slot === "nonterminal" && coordinate === null) {
              if (binding !== null) {
                addGap(
                  `${path}.${slotRow.bindingField}`,
                  "absent_nonterminal_has_contract"
                );
              }
              absentNonterminalCount += 1;
              continue;
            }
            const bindingObject = objectValue(binding);
            const contract = bindingObject === null
              ? null
              : objectValue(ownDataValue(bindingObject, "contract"));
            const projectReadResult =
              operationId === "abg.operation.project.read" &&
              slotRow.slot === "result";
            if (
              bindingObject === null ||
              !hasExactOwnStringKeys(
                bindingObject,
                projectReadResult
                  ? PROJECT_READ_RESULT_BINDING_OWN_KEYS
                  : OWNER_CONTRACT_BINDING_OWN_KEYS
              )
            ) {
              addGap(
                `${path}.${slotRow.bindingField}`,
                "contract_binding_has_unexpected_or_missing_fields"
              );
            }
            let authorizedContract = false;
            try {
              assertNativeContractDefinitionCarrier(contract);
              authorizedContract = true;
            } catch {
              addGap(
                `${path}.${slotRow.bindingField}.contract`,
                "unresolved_or_forged_native_contract"
              );
            }
            if (projectReadResult && bindingObject !== null) {
              const projectionContract = ownDataValue(
                bindingObject,
                "projectionContract"
              );
              try {
                assertNativeContractDefinitionCarrier(projectionContract);
              } catch {
                addGap(
                  `${path}.${slotRow.bindingField}.projectionContract`,
                  "unresolved_or_forged_projection_contract"
                );
              }
              const relation = ownDataValue(bindingObject, "projectionRelation");
              const relationWitnessDigest = ownDataValue(
                bindingObject,
                "projectionRelationWitnessDigest"
              );
              const relationObject = objectValue(relation);
              const relationWitness = relationObject === null
                ? null
                : objectValue(ownDataValue(relationObject, "witness"));
              if (
                !isResolvedOwnerProjectionRelationCarrier(relation) ||
                relationWitness === null ||
                !stableJsonEquals(
                  ownDataValue(relationWitness, "definitionKey"),
                  expectedKey
                ) ||
                ownDataValue(relationWitness, "relationWitnessDigest") !==
                  relationWitnessDigest
              ) {
                addGap(
                  `${path}.${slotRow.bindingField}.projectionRelation`,
                  "unresolved_or_forged_projection_relation"
                );
              }
            }
            const contractCoordinate = contract === null
              ? null
              : ownDataValue(contract, "schemaCoordinate");
            const projectedSchema = contract === null
              ? undefined
              : ownDataValue(contract, "projectedSchema");
            if (
              coordinate === null ||
              coordinate === undefined ||
              contract === null ||
              !authorizedContract ||
              projectedSchema === undefined ||
              !stableJsonEquals(coordinate, contractCoordinate)
            ) {
              addGap(
                `${path}.schemaCoordinates.${slotRow.slot}`,
                "missing_or_divergent_private_json_schema"
              );
              continue;
            }
            const coordinateIdentity = stableJson(coordinate);
            if (schemaCoordinateIdentities.has(coordinateIdentity)) {
              addGap(
                `${path}.schemaCoordinates.${slotRow.slot}`,
                "duplicate_final_schema_coordinate"
              );
              continue;
            }
            schemaCoordinateIdentities.add(coordinateIdentity);
            jsonSchemas.push(freezeNativeValue({
              definitionKey,
              slot: slotRow.slot,
              schemaCoordinate: coordinate,
              schema: projectedSchema
            }));
            finalSchemaCount += 1;
          }
        }

        definitionKeys.push(definitionKey);
        const sdkCoordinate = ownDataValue(definition, "sdkCoordinate");
        const cliCoordinate = ownDataValue(definition, "cliCoordinate");
        if (operationSdkCoordinate === undefined) {
          operationSdkCoordinate = sdkCoordinate;
          operationCliCoordinate = cliCoordinate;
        } else if (
          !stableJsonEquals(operationSdkCoordinate, sdkCoordinate) ||
          !stableJsonEquals(operationCliCoordinate, cliCoordinate)
        ) {
          addGap(`${path}.adapterCoordinates`, "operation_coordinate_drift");
        }
        sdkCliCoordinates.push(freezeNativeValue({
          definitionKey,
          sdkCoordinate,
          cliCoordinate
        }));
        operationCatalogMembers.push(freezeNativeValue({
          definitionKey,
          definitionDigest: admittedDefinitionDigest,
          version: ownDataValue(definition, "version"),
          semanticAuthorityRef:
            ownDataValue(definition, "semanticAuthorityRef"),
          semanticAuthorityDigest:
            ownDataValue(definition, "semanticAuthorityDigest"),
          authorityClass: ownDataValue(definition, "authorityClass"),
          effectClass: ownDataValue(definition, "effectClass"),
          eventAdmission: ownDataValue(definition, "eventAdmission"),
          authoritySlotRequirements:
            ownDataValue(definition, "authoritySlotRequirements"),
          capabilityRefs: ownDataValue(definition, "capabilityRefs"),
          workspaceBindingRequirement:
            ownDataValue(definition, "workspaceBindingRequirement"),
          defaults: ownDataValue(definition, "defaults"),
          schemaCoordinates: ownDataValue(definition, "schemaCoordinates"),
          sdkCoordinate,
          cliCoordinate,
          adapterExitMap: ownDataValue(definition, "adapterExitMap")
        }));
      }
    }
  }

  if (
    definitionCount !== 62 ||
    nonReadCount !== 35 ||
    projectReadCount !== 27
  ) {
    addGap(
      "family.definitionCensus",
      `expected_62_definitions_35_variant_27_read_got_${String(definitionCount)}_${String(nonReadCount)}_${String(projectReadCount)}`
    );
  }
  if (
    finalSchemaCount !== 196 ||
    absentNonterminalCount !== 52 ||
    finalSchemaCount + absentNonterminalCount !== 248
  ) {
    addGap(
      "family.slotCensus",
      `expected_196_schemas_52_absent_got_${String(finalSchemaCount)}_${String(absentNonterminalCount)}`
    );
  }
  if (family !== null && !recursivelyFrozen(family)) {
    addGap("family", "family_is_not_recursively_frozen");
  }

  const gapRows = [...gaps.values()];
  const firstGap = gapRows[0];
  if (firstGap !== undefined) {
    return freezeNativeValue({
      kind: "definition_family_gap" as const,
      gaps: [firstGap, ...gapRows.slice(1)] as const
    });
  }

  const frozenDigestProjection = freezeNativeValue(familyDigestProjection);
  const familyDigest = stableSha256Digest(frozenDigestProjection);
  const candidateCatalogRows = freezeNativeValue(
    expectedOperations.map((operationId) => freezeNativeValue({
      operationId,
      version: "5.0.0" as const,
      familyDigest,
      definitions: freezeNativeValue(
        candidateCatalogMembers[operationId] ?? []
      )
    }))
  );
  return freezeNativeValue({
    kind: "exact_family_admitted" as const,
    familyDigest,
    definitionDigestProjection: frozenDigestProjection,
    privateProjections: {
      operationAndVariantUnion: freezeNativeValue(definitionKeys),
      jsonSchemas: freezeNativeValue(jsonSchemas),
      candidateCatalogRows,
      sdkCliCoordinates: freezeNativeValue(sdkCliCoordinates),
      parityInventory: freezeNativeValue({
        operationCount: 19,
        nonProjectReadVariantCount: 35,
        projectReadCaseCount: 27,
        definitionCount: 62,
        finalSchemaCount: 196,
        absentNonterminalCount: 52,
        slotCount: 248
      })
    }
  });
}

/** @internal */
export async function buildPrivatePublicOperationDefinitionFamily() {
  let family: PrivatePublicOperationDefinitionFamily;
  try {
    family = await constructPrivatePublicOperationDefinitionFamily();
  } catch {
    return freezeNativeValue({
      kind: "definition_family_gap" as const,
      gaps: [freezeNativeValue({
        kind: "definition_family_input_gap" as const,
        fieldPath: "family.ownerContracts",
        reason: "owner_contract_resolution_failed",
        evidenceRefs: [P1_DESIGN_REF] as const
      })] as const
    });
  }
  const admission = inspectPrivatePublicOperationDefinitionFamily(family);
  if (admission.kind === "definition_family_gap") {
    return admission;
  }
  return freezeNativeValue({
    ...admission,
    family
  });
}
