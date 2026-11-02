import { admitJson } from "../shared/admit/index.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { Sha256Digest } from "../shared/digests.js";
import type {
  CompleteDefinitionContractCoordinateMap,
} from "../shared/public_function_contracts.js";
import type {
  IntrinsicPublicFunctionDefinition,
  IntrinsicPublicFunctionFamily,
  IntrinsicPublicOperationContractProjection,
} from "./binding/public_function_family.js";
import type { PublicProjectionPayloads } from "./binding/public_function_projections.js";
import type {
  AdmittedPublicInvocation,
  InvocationAuthoritySlotName,
  InvocationAuthoritySlotsOf,
  PublicContractCatalogCoordinate,
  PublicContractCoordinate,
  PublicContractSlot,
  PublicDefinitionKeyLike,
} from "../shared/public_invocation.js";
import type {
  OwnerCallableDefinitionMember,
  OwnerDefinitionRequestOf,
} from "./binding/owner_contract_source_set.js";

/** Explicit installed inputs for pure construction; no input is admitted here. */
export interface InstalledPublicDefinitionCallEnvironment {
  readonly product: Readonly<{
    canonicalJson: (value: JsonValue) => string;
    sha256Canonical: (value: JsonValue) => Sha256Digest;
  }>;
  readonly installedPublic: Readonly<{
    PUBLIC_FUNCTION_DEFINITION_FAMILY: IntrinsicPublicFunctionFamily;
    PUBLIC_OPERATION_CONTRACT_PROJECTIONS:
      readonly IntrinsicPublicOperationContractProjection[];
    PUBLIC_PROJECTION_PAYLOADS: PublicProjectionPayloads;
  }>;
  readonly definitionContractCoordinates:
    CompleteDefinitionContractCoordinateMap | null;
  readonly contractCatalog: PublicContractCatalogCoordinate;
  readonly requestRef: string;
  readonly correlationRef: string;
  readonly eventTime: string;
  readonly provenanceRefs: readonly string[];
}

type RequiredAuthoritySlotNames<K extends PublicDefinitionKeyLike, R> = {
  readonly [S in InvocationAuthoritySlotName]:
    [InvocationAuthoritySlotsOf<K, R>[S]] extends [null] ? never : S;
}[InvocationAuthoritySlotName];

type SameSlotNames<A, B> = [A] extends [B] ? [B] extends [A] ? true : false
  : false;

type RequestPropertyVariant<R, P extends keyof R> = R[P] extends infer V
  ? V extends unknown ? { readonly [Q in keyof R]: Q extends P ? V : R[Q] }
  : never
  : never;

// A request property is split only when one of its variants changes the
// required authority-slot set; other unions stay whole.
type SlotRelevantRequestKeys<K extends PublicDefinitionKeyLike, R> = {
  readonly [P in keyof R]-?: RequestPropertyVariant<R, P> extends infer V
    ? V extends unknown
      ? SameSlotNames<
        RequiredAuthoritySlotNames<K, V>,
        RequiredAuthoritySlotNames<K, R>
      > extends true ? never
      : P
    : never
    : never;
}[keyof R];

type LastOfUnion<U> =
  (U extends unknown ? (value: () => U) => void : never) extends
    (value: infer I) => void ? I extends () => infer L ? L : never
    : never;

type SplitRequestAt<R, P> = [P] extends [never] ? R
  : LastOfUnion<P> extends infer L extends keyof R
    ? RequestPropertyVariant<R, L> extends infer V
      ? V extends unknown ? SplitRequestAt<V, Exclude<P, L>> : never
    : never
  : never;

/** Concrete request variants distribute before the conditional slot law. */
type SlotRequestVariants<K extends PublicDefinitionKeyLike, R> = R extends
  unknown ? SplitRequestAt<R, SlotRelevantRequestKeys<K, R>>
  : never;

type InstalledPublicDefinitionCallSelectionOf<
  M extends OwnerCallableDefinitionMember,
  R,
> = {
  readonly operationId: M["definitionKey"]["operationId"];
  readonly memberKey: M["definitionKey"]["memberKey"];
  readonly request: R;
  readonly slots: InvocationAuthoritySlotsOf<M["definitionKey"], R>;
  readonly resources: M["binding"]["resources"];
};

/** One callable member, one owner request variant, its exact authority slots
 * and its installed callable resource assertion. */
export type InstalledPublicDefinitionCallSelection<
  M extends OwnerCallableDefinitionMember = OwnerCallableDefinitionMember,
> = M extends unknown
  ? SlotRequestVariants<M["definitionKey"], OwnerDefinitionRequestOf<M>> extends
    infer R ? R extends unknown ? InstalledPublicDefinitionCallSelectionOf<M, R>
    : never
  : never
  : never;

export type InstalledPublicDefinitionCallInput<
  S extends InstalledPublicDefinitionCallSelection =
    InstalledPublicDefinitionCallSelection,
> = InstalledPublicDefinitionCallEnvironment & S;

/** The constructed envelope keeps the selected key, request and resources. */
export type InstalledPublicDefinitionCall<
  S extends InstalledPublicDefinitionCallSelection =
    InstalledPublicDefinitionCallSelection,
> = Readonly<{
  invocation: AdmittedPublicInvocation<
    Readonly<{ operationId: S["operationId"]; memberKey: S["memberKey"] }>,
    S["request"] & Readonly<Record<string, JsonValue>>
  >;
  resources: S["resources"];
}>;

type ConstructionProduct = InstalledPublicDefinitionCallEnvironment["product"];

function exact<T>(
  values: readonly T[],
  predicate: (value: T) => boolean,
  label: string,
): T {
  const matches = values.filter(predicate);
  if (matches.length !== 1) {
    throw new TypeError(`${label} must select one exact installed value`);
  }
  return matches[0]!;
}

/** Both sides are admitted through `admitJson` before the installed codec
 * compares them; a refusal, or a throw (a cycle), is inequality. */
function sameJson(product: ConstructionProduct, left: unknown, right: unknown): boolean {
  try {
    const admittedLeft = admitJson(left);
    const admittedRight = admitJson(right);
    return admittedLeft.kind === "ok" && admittedRight.kind === "ok" &&
      product.canonicalJson(admittedLeft.value) ===
        product.canonicalJson(admittedRight.value);
  } catch {
    return false;
  }
}

function requireSlot({
  product,
  coordinate,
  contractCatalog,
  definition,
  slot,
  definitionRef,
}: {
  readonly product: ConstructionProduct;
  readonly coordinate: PublicContractCoordinate | null;
  readonly contractCatalog: PublicContractCatalogCoordinate;
  readonly definition: IntrinsicPublicFunctionDefinition;
  readonly slot: PublicContractSlot;
  readonly definitionRef: string;
}): PublicContractCoordinate {
  if (
    coordinate === null ||
    !sameJson(product, coordinate.contractCatalog, contractCatalog) ||
    coordinate.flatRow.contractId !== definition.definitionKey.operationId ||
    coordinate.flatRow.contractVersion !== "5.0.0" ||
    coordinate.nestedSelector.selectorKind !== "operation_definition_slot" ||
    !sameJson(
      product,
      coordinate.nestedSelector.definitionKey,
      definition.definitionKey,
    ) ||
    coordinate.nestedSelector.slot !== slot ||
    coordinate.nestedSelector.definitionRef !== definitionRef
  ) {
    throw new TypeError(
      `${definition.definitionKey.operationId}#${definition.definitionKey.memberKey} ${slot} lacks its exact owner-issued coordinate`,
    );
  }
  return coordinate;
}

/**
 * Construct the exact installed Public invocation envelope and resource assertion.
 * Coordinates must come from Product verification. This function selects and
 * hashes declared values only; the installed transport and owners still admit
 * the invocation, authority, request and resources before any execution.
 */
export function constructInstalledPublicDefinitionCall<
  S extends InstalledPublicDefinitionCallSelection,
>({
  product,
  installedPublic,
  definitionContractCoordinates,
  contractCatalog,
  operationId,
  memberKey,
  request,
  slots,
  resources,
  requestRef,
  correlationRef,
  eventTime,
  provenanceRefs,
}: InstalledPublicDefinitionCallInput<S>): InstalledPublicDefinitionCall<S> {
  if (definitionContractCoordinates === null) {
    throw new TypeError(
      "installed Public DefinitionCall requires verified definition coordinates",
    );
  }
  const definition = exact(
    installedPublic.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions,
    (candidate) =>
      candidate.definitionKey.operationId === operationId &&
      candidate.definitionKey.memberKey === memberKey,
    "installed Public definition",
  );
  const operation = exact(
    definitionContractCoordinates.operations,
    (candidate) => candidate.operationId === operationId,
    "verified operation coordinates",
  );
  const member = exact(
    operation.members,
    (candidate) => candidate.memberKey === memberKey,
    "verified member coordinates",
  );
  const installedOperation = exact(
    installedPublic.PUBLIC_OPERATION_CONTRACT_PROJECTIONS,
    (candidate) => candidate.operationId === operationId,
    "installed operation projection",
  );
  const installedMember = exact(
    installedOperation.definitions,
    (candidate) => candidate.definitionKey.memberKey === memberKey,
    "installed member projection",
  );
  const requestCoordinate = requireSlot({
    product,
    coordinate: member.slots.request,
    contractCatalog,
    definition,
    slot: "request",
    definitionRef: installedMember.requestContract.definitionRef,
  });
  const resultCoordinate = requireSlot({
    product,
    coordinate: member.slots.result,
    contractCatalog,
    definition,
    slot: "result",
    definitionRef: installedMember.resultContract.definitionRef,
  });
  const refusalCoordinate = requireSlot({
    product,
    coordinate: member.slots.refusal,
    contractCatalog,
    definition,
    slot: "refusal",
    definitionRef: installedMember.refusalContract.definitionRef,
  });
  const nonTerminalCoordinate = installedMember.nonTerminalContract === null
    ? member.slots.nonTerminal === null
      ? null
      : (() => {
          throw new TypeError("installed terminal definition has an extra coordinate");
        })()
    : requireSlot({
        product,
        coordinate: member.slots.nonTerminal,
        contractCatalog,
        definition,
        slot: "non_terminal",
        definitionRef: installedMember.nonTerminalContract.definitionRef,
      });
  const invocationAuthorityBody = Object.freeze({
    kind: "invocation_authority" as const,
    definitionKey: definition.definitionKey,
    slots,
  });
  const invocationAuthority = Object.freeze({
    ...invocationAuthorityBody,
    authorityDigest: product.sha256Canonical(invocationAuthorityBody as unknown as JsonValue),
  });
  const requestDigest = product.sha256Canonical(request);
  const invocationBody = Object.freeze({
    kind: "public_invocation" as const,
    schemaVersion: "5.0.0" as const,
    invocationContract: Object.freeze({
      contractCatalog,
      flatRow: Object.freeze({
        contractId: "abg.schema.public-operation-invocation",
        contractVersion: "5.0.0" as const,
        contractDigest:
          installedPublic.PUBLIC_PROJECTION_PAYLOADS.commonSchemaAsset
            .contentDigest,
      }),
      nestedSelector: Object.freeze({
        selectorKind: "schema_definition" as const,
        definitionKey: null,
        slot: null,
        definitionRef: "#/$defs/PublicInvocation",
      }),
    }),
    definitionRef: definition.definitionRef,
    definitionVersion: "5.0.0" as const,
    definitionDigest: definition.definitionDigest,
    definitionKey: definition.definitionKey,
    contractCatalog,
    invocationAuthority,
    requestContract: requestCoordinate,
    requestRef,
    requestDigest,
    request,
    expectedResultContract: resultCoordinate,
    expectedRefusalContract: refusalCoordinate,
    expectedNonTerminalContract: nonTerminalCoordinate,
    correlationRef,
    eventTime,
    provenanceRefs: Object.freeze([...provenanceRefs]),
  });
  const invocationDigest = product.sha256Canonical(invocationBody as unknown as JsonValue);
  // The exact installed selection above is the selected key; request, slots
  // and resources keep their supplied identity.
  return Object.freeze({
    invocation: Object.freeze({
      ...invocationBody,
      invocationRef:
        `invocation://abiogenesis/${invocationDigest.slice("sha256:".length)}`,
      invocationDigest,
    }),
    resources,
  }) as unknown as InstalledPublicDefinitionCall<S>;
}
