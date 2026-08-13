import type { JsonValue } from "./canonical_json.js";
import type { Sha256Digest } from "./digests.js";

export interface PublicDefinitionKeyLike {
  readonly operationId: string;
  readonly memberKey: string;
}

export interface ReferenceDigest<T = unknown> {
  readonly ref: string;
  readonly digest: Sha256Digest;
}

export type NonEmptyReferenceDigestSet<T = unknown> = readonly [
  ReferenceDigest<T>,
  ...ReferenceDigest<T>[],
];

export interface PublicContractCatalogCoordinate {
  readonly productId: string;
  readonly productContentDigest: Sha256Digest;
  readonly catalogId: string;
  readonly catalogVersion: "5.0.0";
  readonly catalogDigest: Sha256Digest;
}

export type PublicContractSlot =
  | "request"
  | "result"
  | "refusal"
  | "non_terminal";

export type PublicContractNestedSelector<
  K extends PublicDefinitionKeyLike = PublicDefinitionKeyLike,
> =
  | Readonly<{
    selectorKind: "flat_contract";
    definitionKey: null;
    slot: null;
    definitionRef: null;
  }>
  | Readonly<{
    selectorKind: "operation_definition_slot";
    definitionKey: K;
    slot: PublicContractSlot;
    definitionRef: string;
  }>
  | Readonly<{
    selectorKind: "schema_definition";
    definitionKey: null;
    slot: null;
    definitionRef: string;
  }>;

export interface PublicContractCoordinate<
  K extends PublicDefinitionKeyLike = PublicDefinitionKeyLike,
> {
  readonly contractCatalog: PublicContractCatalogCoordinate;
  readonly flatRow: Readonly<{
    contractId: string;
    contractVersion: "5.0.0";
    contractDigest: Sha256Digest;
  }>;
  readonly nestedSelector: PublicContractNestedSelector<K>;
}

export interface DefinitionContractCoordinateSet<
  K extends PublicDefinitionKeyLike = PublicDefinitionKeyLike,
> {
  readonly request: PublicContractCoordinate<K>;
  readonly result: PublicContractCoordinate<K>;
  readonly refusal: PublicContractCoordinate<K>;
  readonly nonTerminal: PublicContractCoordinate<K> | null;
}

export interface ContractBoundValue {
  readonly contract: ReferenceDigest<"PublicContract">;
  readonly valueRef: string;
  readonly valueDigest: Sha256Digest;
  readonly value: JsonValue;
}

export interface SuccessfulPackedVerificationReference {
  readonly invocation: ReferenceDigest<"PackedArtifactVerificationInvocation">;
  readonly outcome: ReferenceDigest<"PackedArtifactVerificationOutcome">;
}

export type InvocationAuthoritySlotName =
  | "workspace_binding"
  | "product_set"
  | "dependency_lock"
  | "catalog_scope"
  | "execution_program"
  | "graph_function"
  | "input_contract"
  | "session_policy"
  | "capability_grants"
  | "actor"
  | "transport_steering"
  | "verification_references"
  | "execution_basis";

export type CatalogScopeAuthority =
  | ReferenceDigest<"AdmittedCatalog">
  | Readonly<{
    catalog: ReferenceDigest<"AdmittedCatalog">;
    view: ReferenceDigest<"CatalogView">;
    allowlist: readonly string[];
  }>;

export interface GraphFunctionAuthority {
  readonly graphFunction: ReferenceDigest<"GraphFunction">;
  readonly membership: ReferenceDigest<"ProgramGraphFunctionMembership">;
}

export interface CapabilityGrantAuthority {
  readonly requiredCapabilityRefs: readonly string[];
  readonly grants: readonly [
    ReferenceDigest<"CapabilityGrant">,
    ...ReferenceDigest<"CapabilityGrant">[],
  ];
}

export interface ActorAuthority {
  readonly actor: ReferenceDigest<"Actor">;
  readonly attribution: ReferenceDigest<"ActorAttribution">;
}

export interface InvocationAuthorityValueBySlot {
  readonly workspace_binding: ReferenceDigest<"WorkspaceBinding">;
  readonly product_set: NonEmptyReferenceDigestSet<"InstalledProduct">;
  readonly dependency_lock: ReferenceDigest<"ResolvedProductLock">;
  readonly catalog_scope: CatalogScopeAuthority;
  readonly execution_program: ReferenceDigest<"GtlProgram">;
  readonly graph_function: GraphFunctionAuthority;
  readonly input_contract: ContractBoundValue;
  readonly session_policy: ReferenceDigest<"InvocationPolicy">;
  readonly capability_grants: CapabilityGrantAuthority;
  readonly actor: ActorAuthority;
  readonly transport_steering: ReferenceDigest<"TransportSteering">;
  readonly verification_references: readonly [
    SuccessfulPackedVerificationReference,
    ...SuccessfulPackedVerificationReference[],
  ];
  readonly execution_basis: ReferenceDigest<"ExecutionBasis">;
}

type AdditionalRequiredAuthoritySlot<
  K extends PublicDefinitionKeyLike,
  R,
> = K["operationId"] extends "abg.operation.workspace.create"
  ? "actor"
  : K["operationId"] extends "abg.operation.product.verify"
    ? R extends Readonly<{ targetKind: "installed_artifact" }>
      ? "dependency_lock"
      : never
    : K["operationId"] extends "abg.operation.product.resolve"
      ? "verification_references"
      : K["operationId"] extends "abg.operation.product.install"
        ? "dependency_lock" | "verification_references" | "actor"
        : K["operationId"] extends "abg.operation.workspace.bind"
          ? "product_set" | "dependency_lock" | "actor"
          : K["operationId"] extends "abg.operation.project.read"
            ? K["memberKey"] extends "install_evidence" | "release_evidence"
              ? never
              : K["memberKey"] extends "catalog_list" | "catalog_describe"
                ? "workspace_binding" | "product_set" | "dependency_lock" |
                  "catalog_scope"
                : "workspace_binding" | "product_set" | "dependency_lock"
            : K["operationId"] extends
              "abg.operation.catalog.admit" | "abg.operation.catalog.view"
              ? "workspace_binding" | "product_set" | "dependency_lock" |
                "actor"
              : K["operationId"] extends "abg.operation.catalog.apply"
                ? "workspace_binding" | "product_set" | "dependency_lock" |
                  "catalog_scope" | "actor"
                : K["operationId"] extends "abg.operation.run.invoke"
                  ? "workspace_binding" | "product_set" | "dependency_lock" |
                    "catalog_scope" | "execution_program" | "input_contract" |
                    "session_policy" | "actor" | "transport_steering" |
                    (K["memberKey"] extends "invoke" ? "graph_function"
                      : R extends Readonly<{
                          target: Readonly<{ kind: "graph_function" }>;
                        }> ? "graph_function"
                      : never)
                  : K["operationId"] extends "abg.operation.run.continue"
                    ? "workspace_binding" | "product_set" |
                      "dependency_lock" | "catalog_scope" |
                      "execution_program" | "graph_function" |
                      "input_contract" | "session_policy" | "actor" |
                      "transport_steering" | "execution_basis"
                    : K["operationId"] extends
                      "abg.operation.interaction.respond" |
                        "abg.operation.result.assess"
                      ? "workspace_binding" | "product_set" |
                        "dependency_lock" | "actor" | "execution_basis"
                      : K["operationId"] extends "abg.operation.witness.admit"
                        ? "workspace_binding" | "product_set" |
                          "dependency_lock" | "actor" |
                          (R extends Readonly<{
                              context: Readonly<{
                                kind: "run" | "segment";
                              }>;
                            }> ? "execution_basis"
                            : never)
                        : K["operationId"] extends
                          "abg.operation.conformance.evaluate" |
                            "abg.operation.product.materialize" |
                            "abg.operation.release.snapshot"
                          ? "workspace_binding" | "product_set" |
                            "dependency_lock" | "actor"
                          : never;

export type AuthorityFieldOf<
  K extends PublicDefinitionKeyLike,
  R,
  S extends InvocationAuthoritySlotName,
> = S extends "capability_grants" | AdditionalRequiredAuthoritySlot<K, R>
  ? InvocationAuthorityValueBySlot[S]
  : null;

export type InvocationAuthoritySlotsOf<
  K extends PublicDefinitionKeyLike,
  R,
> = Readonly<{
  [S in InvocationAuthoritySlotName]: AuthorityFieldOf<K, R, S>;
}>;

export interface InvocationAuthorityOf<
  K extends PublicDefinitionKeyLike,
  R,
> {
  readonly kind: "invocation_authority";
  readonly definitionKey: K;
  readonly authorityDigest: Sha256Digest;
  readonly slots: InvocationAuthoritySlotsOf<K, R>;
}

export type InvocationAuthorityCandidateSlots = Readonly<{
  [S in InvocationAuthoritySlotName]: S extends "capability_grants"
    ? InvocationAuthorityValueBySlot[S]
    : InvocationAuthorityValueBySlot[S] | null;
}>;

export interface InvocationAuthorityCandidate {
  readonly kind: "invocation_authority";
  readonly definitionKey: PublicDefinitionKeyLike;
  readonly authorityDigest: Sha256Digest;
  readonly slots: InvocationAuthorityCandidateSlots;
}

export interface UnselectedPublicInvocationRequestCandidate {
  readonly request: Readonly<Record<string, JsonValue>>;
  readonly invocationAuthority: InvocationAuthorityCandidate;
  readonly provenanceRefs: readonly string[];
}

export interface PublicInvocationRequestCandidate<
  K extends PublicDefinitionKeyLike,
  R extends Readonly<Record<string, JsonValue>>,
> {
  readonly request: R;
  readonly invocationAuthority: InvocationAuthorityOf<K, R>;
  readonly provenanceRefs: readonly string[];
}

export interface AdmittedPublicInvocation<
  K extends PublicDefinitionKeyLike,
  R extends Readonly<Record<string, JsonValue>>,
> {
  readonly kind: "public_invocation";
  readonly schemaVersion: "5.0.0";
  readonly invocationContract: PublicContractCoordinate;
  readonly invocationRef: string;
  readonly invocationDigest: Sha256Digest;
  readonly definitionRef: string;
  readonly definitionVersion: "5.0.0";
  readonly definitionDigest: Sha256Digest;
  readonly definitionKey: K;
  readonly contractCatalog: PublicContractCatalogCoordinate;
  readonly invocationAuthority: InvocationAuthorityOf<K, R>;
  readonly requestContract: PublicContractCoordinate<K>;
  readonly requestRef: string;
  readonly requestDigest: Sha256Digest;
  readonly request: R;
  readonly expectedResultContract: PublicContractCoordinate<K>;
  readonly expectedRefusalContract: PublicContractCoordinate<K>;
  readonly expectedNonTerminalContract: PublicContractCoordinate<K> | null;
  readonly correlationRef: string;
  readonly eventTime: string;
  readonly provenanceRefs: readonly string[];
}

export type BoundPublicOwnerPort<
  K extends PublicDefinitionKeyLike,
  R extends Readonly<Record<string, JsonValue>>,
  O = unknown,
> = (invocation: AdmittedPublicInvocation<K, R>) => O | Promise<O>;
