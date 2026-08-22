import {
  canonicalJson,
  type JsonValue,
} from "../shared/canonical_json.js";
import {
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import {
  exactDefinitionCallMatches,
} from "../shared/definition_binding_mechanics.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  OWNER_CONTRACT_SOURCES,
} from "../shared/owner_contract_source_set.js";
import {
  admitRuntimeContract,
  type OwnerContractSourceDeclaration,
  type OwnerSemanticOutput,
} from "../shared/public_function_contracts.js";
import {
  PUBLIC_FUNCTION_DEFINITION_FAMILY,
} from "../shared/public_function_family.js";
import {
  PUBLIC_PROJECTION_PAYLOADS,
  S06_COMMON_PUBLIC_CONTRACT_IDS,
} from "../shared/public_function_projections.js";
import type {
  AdmittedPublicInvocation,
  PublicContractCoordinate,
  PublicDefinitionKeyLike,
} from "../shared/public_invocation.js";

export type OutcomeProjectionFailureClass =
  | "malformed_owner_output"
  | "cross_definition"
  | "wrong_contract"
  | "digest_mismatch"
  | "unexpected_nonterminal"
  | "relation_mismatch";

export interface OutcomeProjectionRefusal {
  readonly failureClass: OutcomeProjectionFailureClass;
  readonly issuePaths: readonly string[];
  readonly candidateDigest: Sha256Digest;
  readonly evidenceRefs: readonly string[];
}

interface IndexedPublicOutcomeCommon<K extends PublicDefinitionKeyLike> {
  readonly kind: "public_outcome";
  readonly schemaVersion: "5.0.0";
  readonly outcomeContract: PublicContractCoordinate;
  readonly outcomeRef: string;
  readonly outcomeDigest: Sha256Digest;
  readonly invocationRef: string;
  readonly invocationDigest: Sha256Digest;
  readonly definitionKey: K;
  readonly definitionVersion: "5.0.0";
  readonly definitionDigest: Sha256Digest;
  readonly contractCatalog: AdmittedPublicInvocation<K, Readonly<Record<string, JsonValue>>>["contractCatalog"];
  readonly correlationRef: string;
  readonly provenanceRefs: readonly string[];
}

export type IndexedPublicOutcome<
  K extends PublicDefinitionKeyLike = PublicDefinitionKeyLike,
> =
  | (IndexedPublicOutcomeCommon<K> & Readonly<{
    readonly outcomeKind: "result" | "refusal" | "nonterminal";
    readonly payloadContract: PublicContractCoordinate<K>;
    readonly payloadRef: string;
    readonly payloadDigest: Sha256Digest;
    readonly value: JsonValue;
  }>)
  | (IndexedPublicOutcomeCommon<K> & Readonly<{
    readonly outcomeKind: "projection_refusal";
    readonly payloadContract: PublicContractCoordinate;
    readonly payloadRef: string;
    readonly payloadDigest: Sha256Digest;
    readonly value: OutcomeProjectionRefusal;
  }>);

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sameJson(left: unknown, right: unknown): boolean {
  try {
    return canonicalJson(left as JsonValue) === canonicalJson(right as JsonValue);
  } catch {
    return false;
  }
}

function contentRef(prefix: "public-payload" | "public-outcome", digest: Sha256Digest): string {
  return `${prefix}://abiogenesis/${digest.slice("sha256:".length)}`;
}

function candidateDigest(candidate: unknown): Sha256Digest {
  try {
    return sha256Canonical(candidate as JsonValue);
  } catch {
    return sha256Canonical({ kind: "noncanonical_owner_output" });
  }
}

function commonOutcomeContract<K extends PublicDefinitionKeyLike>(
  invocation: AdmittedPublicInvocation<
    K,
    Readonly<Record<string, JsonValue>>
  >,
  definitionRef: "#/$defs/PublicOutcome" | "#/$defs/OutcomeProjectionRefusal",
): PublicContractCoordinate {
  return deepFreeze({
    contractCatalog: invocation.contractCatalog,
    flatRow: {
      contractId: S06_COMMON_PUBLIC_CONTRACT_IDS[2],
      contractVersion: "5.0.0" as const,
      contractDigest: PUBLIC_PROJECTION_PAYLOADS.commonSchemaAsset.contentDigest,
    },
    nestedSelector: {
      selectorKind: "schema_definition" as const,
      definitionKey: null,
      slot: null,
      definitionRef,
    },
  });
}

function finalize<K extends PublicDefinitionKeyLike>(
  invocation: AdmittedPublicInvocation<K, Readonly<Record<string, JsonValue>>>,
  outcomeKind: IndexedPublicOutcome<K>["outcomeKind"],
  payloadContract: PublicContractCoordinate,
  value: JsonValue | OutcomeProjectionRefusal,
): IndexedPublicOutcome<K> {
  const payloadDigest = sha256Canonical(value as JsonValue);
  const payloadRef = contentRef("public-payload", payloadDigest);
  const body = deepFreeze({
    kind: "public_outcome" as const,
    schemaVersion: "5.0.0" as const,
    outcomeContract: commonOutcomeContract(
      invocation,
      "#/$defs/PublicOutcome",
    ),
    invocationRef: invocation.invocationRef,
    invocationDigest: invocation.invocationDigest,
    definitionKey: invocation.definitionKey,
    definitionVersion: invocation.definitionVersion,
    definitionDigest: invocation.definitionDigest,
    contractCatalog: invocation.contractCatalog,
    correlationRef: invocation.correlationRef,
    provenanceRefs: Object.freeze([...invocation.provenanceRefs]),
    outcomeKind,
    payloadContract,
    payloadRef,
    payloadDigest,
    value,
  });
  const outcomeDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    ...body,
    outcomeRef: contentRef("public-outcome", outcomeDigest),
    outcomeDigest,
  }) as IndexedPublicOutcome<K>;
}

function projectionRefusal<K extends PublicDefinitionKeyLike>(
  invocation: AdmittedPublicInvocation<K, Readonly<Record<string, JsonValue>>>,
  candidate: unknown,
  failureClass: OutcomeProjectionFailureClass,
  issuePaths: readonly string[],
): IndexedPublicOutcome<K> {
  const value = deepFreeze({
    failureClass,
    issuePaths: Object.freeze([...new Set(issuePaths)].sort()),
    candidateDigest: candidateDigest(candidate),
    evidenceRefs: Object.freeze([]),
  }) satisfies OutcomeProjectionRefusal;
  return finalize(
    invocation,
    "projection_refusal",
    commonOutcomeContract(
      invocation,
      "#/$defs/OutcomeProjectionRefusal",
    ),
    value,
  );
}

export function projectPublicOutcome<
  TPacket extends OwnerContractSourceDeclaration,
>(
  admittedInvocation: AdmittedPublicInvocation<
    TPacket["definitionKey"],
    Readonly<Record<string, JsonValue>>
  >,
  ownerOutput: OwnerSemanticOutput<TPacket>,
): IndexedPublicOutcome<TPacket["definitionKey"]> {
  const sources = OWNER_CONTRACT_SOURCES.filter(({ packet }) =>
    sameJson(packet.definitionKey, admittedInvocation.definitionKey)
  );
  const definitions = PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.filter(
    (definition) => sameJson(definition.definitionKey, admittedInvocation.definitionKey),
  );
  if (
    sources.length !== 1 ||
    definitions.length !== 1 ||
    !exactDefinitionCallMatches(
      { invocation: admittedInvocation },
      sources[0]!.declaration,
    ) ||
    admittedInvocation.definitionRef !== definitions[0]!.definitionRef ||
    admittedInvocation.definitionDigest !== definitions[0]!.definitionDigest
  ) {
    return projectionRefusal(
      admittedInvocation,
      ownerOutput,
      "cross_definition",
      ["/definitionKey"],
    );
  }
  if (
    !isRecord(ownerOutput) ||
    Object.keys(ownerOutput).sort().join("|") !== "outcomeKind|value" ||
    (
      ownerOutput.outcomeKind !== "result" &&
      ownerOutput.outcomeKind !== "refusal" &&
      ownerOutput.outcomeKind !== "nonterminal"
    )
  ) {
    return projectionRefusal(
      admittedInvocation,
      ownerOutput,
      "malformed_owner_output",
      ["/"],
    );
  }
  const source = sources[0]!.declaration;
  const selected = ownerOutput.outcomeKind === "result"
    ? {
      schema: source.resultSchema,
      contract: admittedInvocation.expectedResultContract,
    }
    : ownerOutput.outcomeKind === "refusal"
    ? {
      schema: source.refusalSchema,
      contract: admittedInvocation.expectedRefusalContract,
    }
    : source.nonTerminalSchema === null ||
        admittedInvocation.expectedNonTerminalContract === null
    ? null
    : {
      schema: source.nonTerminalSchema,
      contract: admittedInvocation.expectedNonTerminalContract,
    };
  if (selected === null) {
    return projectionRefusal(
      admittedInvocation,
      ownerOutput,
      "unexpected_nonterminal",
      ["/outcomeKind"],
    );
  }
  const admitted = admitRuntimeContract(selected.schema, ownerOutput.value);
  if (admitted.disposition === "refused") {
    return projectionRefusal(
      admittedInvocation,
      ownerOutput,
      "malformed_owner_output",
      admitted.issuePaths.map((path) => `/value${path}`),
    );
  }
  return finalize(
    admittedInvocation,
    ownerOutput.outcomeKind,
    selected.contract,
    admitted.value as JsonValue,
  );
}
