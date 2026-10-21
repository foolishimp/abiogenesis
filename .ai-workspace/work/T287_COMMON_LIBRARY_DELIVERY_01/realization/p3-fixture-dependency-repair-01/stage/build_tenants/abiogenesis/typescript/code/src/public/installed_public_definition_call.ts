import type { JsonValue } from "../shared/canonical_json.js";
import type { Sha256Digest } from "../shared/digests.js";
import type {
  CompleteDefinitionContractCoordinateMap,
} from "../shared/public_function_contracts.js";
import type {
  IntrinsicPublicFunctionDefinition,
  IntrinsicPublicFunctionFamily,
  IntrinsicPublicOperationContractProjection,
} from "../shared/public_function_family.js";
import type { PublicProjectionPayloads } from "../shared/public_function_projections.js";
import type {
  InvocationAuthorityCandidateSlots,
  PublicContractCatalogCoordinate,
  PublicContractCoordinate,
  PublicContractSlot,
} from "../shared/public_invocation.js";

/** Explicit installed inputs for pure construction; no input is admitted here. */
export interface InstalledPublicDefinitionCallInput<
  TRequest extends Readonly<Record<string, JsonValue>>,
  TResources,
> {
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
  readonly operationId: string;
  readonly memberKey: string;
  readonly request: TRequest;
  readonly slots: InvocationAuthorityCandidateSlots;
  readonly resources: TResources;
  readonly requestRef: string;
  readonly correlationRef: string;
  readonly eventTime: string;
  readonly provenanceRefs: readonly string[];
}

type ConstructionProduct = InstalledPublicDefinitionCallInput<
  Readonly<Record<string, JsonValue>>,
  unknown
>["product"];

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

function sameJson(product: ConstructionProduct, left: unknown, right: unknown): boolean {
  return product.canonicalJson(left as JsonValue) ===
    product.canonicalJson(right as JsonValue);
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
  TRequest extends Readonly<Record<string, JsonValue>>,
  TResources,
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
}: InstalledPublicDefinitionCallInput<TRequest, TResources>) {
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
  return Object.freeze({
    invocation: Object.freeze({
      ...invocationBody,
      invocationRef:
        `invocation://abiogenesis/${invocationDigest.slice("sha256:".length)}`,
      invocationDigest,
    }),
    resources,
  });
}
