import { ABG_PROJECT_READ_CONTRACTS } from "../abg/project_read_operation_contracts.js";
import { WITNESS_OPERATION_CONTRACTS } from "../abg/witness_operation_contracts.js";
import { CATALOG_OPERATION_CONTRACTS } from "../product/catalog_operation_contracts.js";
import { PRODUCT_ENVIRONMENT_CONTRACTS } from "../product/environment_operation_contracts.js";
import { PRODUCT_INSTALL_CONTRACTS } from "../product/install_operation_contracts.js";
import {
  INTERACTION_OPERATION_CONTRACTS,
  RESULT_OPERATION_CONTRACTS,
} from "../product/interaction_operation_contracts.js";
import {
  MATERIALIZATION_OPERATION_CONTRACTS,
} from "../product/materialization_operation_contracts.js";
import { RELEASE_OPERATION_CONTRACTS } from "../product/release_snapshot_operations.js";
import { PRODUCT_PROJECT_READ_CONTRACTS } from "../product/project_read_operation_contracts.js";
import { RUN_OPERATION_CONTRACTS } from "../product/run_operation_contracts.js";
import { PRODUCT_VERIFICATION_CONTRACTS } from "../product/verification_operation_contracts.js";
import { WORKSPACE_OPERATION_CONTRACTS } from "../product/workspace_operation_contracts.js";
import { CONFORMANCE_OPERATION_CONTRACTS } from "../validator/conformance_operation_contracts.js";
import { compareUnicodeCodeUnits, type JsonValue } from "./canonical_json.js";
import { sha256Bytes, sha256Canonical, type Sha256Digest } from "./digests.js";
import {
  type OwnerContractPacket,
  projectStrictJsonSchema,
} from "./public_function_contracts.js";

export const EXACT_OWNER_CONTRACT_KEY_SET_DIGEST =
  "sha256:61077d017dbbe0bd071f312066d27bc6535a732aa9da00cd543a70506ec24a4f" as const;

export interface OwnerContractModuleSource {
  readonly sourceModulePath: string;
  readonly contractRoot: Readonly<Record<string, unknown>>;
}

// This is the one build-time source relation. It names owner modules, not
// operation keys. The exact 56-key set is derived from the packets themselves.
export const OWNER_CONTRACT_MODULE_SOURCES = Object.freeze([
  Object.freeze({
    sourceModulePath: "product/workspace_operation_contracts.ts",
    contractRoot: WORKSPACE_OPERATION_CONTRACTS,
  }),
  Object.freeze({
    sourceModulePath: "product/project_read_operation_contracts.ts",
    contractRoot: PRODUCT_PROJECT_READ_CONTRACTS,
  }),
  Object.freeze({
    sourceModulePath: "abg/project_read_operation_contracts.ts",
    contractRoot: ABG_PROJECT_READ_CONTRACTS,
  }),
  Object.freeze({
    sourceModulePath: "product/verification_operation_contracts.ts",
    contractRoot: PRODUCT_VERIFICATION_CONTRACTS,
  }),
  Object.freeze({
    sourceModulePath: "product/environment_operation_contracts.ts",
    contractRoot: PRODUCT_ENVIRONMENT_CONTRACTS,
  }),
  Object.freeze({
    sourceModulePath: "product/install_operation_contracts.ts",
    contractRoot: PRODUCT_INSTALL_CONTRACTS,
  }),
  Object.freeze({
    sourceModulePath: "product/catalog_operation_contracts.ts",
    contractRoot: CATALOG_OPERATION_CONTRACTS,
  }),
  Object.freeze({
    sourceModulePath: "product/run_operation_contracts.ts",
    contractRoot: RUN_OPERATION_CONTRACTS,
  }),
  Object.freeze({
    sourceModulePath: "product/interaction_operation_contracts.ts",
    contractRoot: INTERACTION_OPERATION_CONTRACTS,
  }),
  Object.freeze({
    sourceModulePath: "product/interaction_operation_contracts.ts",
    contractRoot: RESULT_OPERATION_CONTRACTS,
  }),
  Object.freeze({
    sourceModulePath: "abg/witness_operation_contracts.ts",
    contractRoot: WITNESS_OPERATION_CONTRACTS,
  }),
  Object.freeze({
    sourceModulePath: "validator/conformance_operation_contracts.ts",
    contractRoot: CONFORMANCE_OPERATION_CONTRACTS,
  }),
  Object.freeze({
    sourceModulePath: "product/materialization_operation_contracts.ts",
    contractRoot: MATERIALIZATION_OPERATION_CONTRACTS,
  }),
  Object.freeze({
    sourceModulePath: "product/release_snapshot_operations.ts",
    contractRoot: RELEASE_OPERATION_CONTRACTS,
  }),
] as const satisfies readonly OwnerContractModuleSource[]);

export interface ResolvedOwnerContractSource {
  readonly sourceModulePath: string;
  readonly packet: OwnerContractPacket;
  readonly memberDigest: Sha256Digest;
  readonly nativeSchemaIdentities: Readonly<{
    request: Sha256Digest;
    result: Sha256Digest;
    refusal: Sha256Digest;
    nonTerminal: Sha256Digest | null;
  }>;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOwnerContractPacket(value: unknown): value is OwnerContractPacket {
  return isRecord(value) &&
    isRecord(value.definitionKey) &&
    typeof value.definitionKey.operationId === "string" &&
    typeof value.definitionKey.memberKey === "string" &&
    "requestSchema" in value &&
    "resultSchema" in value &&
    "refusalSchema" in value &&
    "nonTerminalSchema" in value &&
    isRecord(value.owner) &&
    isRecord(value.metadata);
}

function collectPackets(value: unknown): readonly OwnerContractPacket[] {
  if (isOwnerContractPacket(value)) return Object.freeze([value]);
  if (!isRecord(value)) return Object.freeze([]);
  return Object.freeze(Object.values(value).flatMap(collectPackets));
}

function schemaIdentity(
  packet: OwnerContractPacket,
  slot: "request" | "result" | "refusal" | "nonTerminal",
): Sha256Digest | null {
  const schema = slot === "request"
    ? packet.requestSchema
    : slot === "result"
    ? packet.resultSchema
    : slot === "refusal"
    ? packet.refusalSchema
    : packet.nonTerminalSchema;
  if (schema === null) return null;
  return sha256Canonical({
    schemaVersion: "5.0.0",
    ownerMember: packet.owner,
    slot: slot === "nonTerminal" ? "non_terminal" : slot,
    schema: projectStrictJsonSchema(schema),
  } as unknown as JsonValue);
}

function resolveSource(
  sourceModulePath: string,
  packet: OwnerContractPacket,
): ResolvedOwnerContractSource {
  const nativeSchemaIdentities = Object.freeze({
    request: schemaIdentity(packet, "request")!,
    result: schemaIdentity(packet, "result")!,
    refusal: schemaIdentity(packet, "refusal")!,
    nonTerminal: schemaIdentity(packet, "nonTerminal"),
  });
  return Object.freeze({
    sourceModulePath,
    packet,
    nativeSchemaIdentities,
    memberDigest: sha256Canonical({
      definitionKey: packet.definitionKey,
      owner: packet.owner,
      contractIds: packet.contractIds,
      metadata: packet.metadata,
      nativeSchemaIdentities,
    } as unknown as JsonValue),
  });
}

export const OWNER_CONTRACT_SOURCES = Object.freeze(
  OWNER_CONTRACT_MODULE_SOURCES.flatMap(({ sourceModulePath, contractRoot }) =>
    collectPackets(contractRoot).map((packet) =>
      resolveSource(sourceModulePath, packet)
    )
  ).sort((left, right) => {
    const operation = compareUnicodeCodeUnits(
      left.packet.definitionKey.operationId,
      right.packet.definitionKey.operationId,
    );
    return operation !== 0
      ? operation
      : compareUnicodeCodeUnits(
        left.packet.definitionKey.memberKey,
        right.packet.definitionKey.memberKey,
      );
  }),
);

function compositeKey(packet: OwnerContractPacket): string {
  return `${packet.definitionKey.operationId}#${packet.definitionKey.memberKey}`;
}

export const OWNER_CONTRACT_KEY_SET_DIGEST = sha256Bytes(
  `${OWNER_CONTRACT_SOURCES.map(({ packet }) => compositeKey(packet)).join("\n")}\n`,
);

const operationCount = new Set(
  OWNER_CONTRACT_SOURCES.map(({ packet }) => packet.definitionKey.operationId),
).size;
const distinctKeys = new Set(
  OWNER_CONTRACT_SOURCES.map(({ packet }) => compositeKey(packet)),
);

if (
  operationCount !== 18 ||
  OWNER_CONTRACT_SOURCES.length !== 56 ||
  distinctKeys.size !== 56 ||
  OWNER_CONTRACT_KEY_SET_DIGEST !== EXACT_OWNER_CONTRACT_KEY_SET_DIGEST
) {
  throw new TypeError(
    `owner contract source set mismatch: ${operationCount}/` +
      `${OWNER_CONTRACT_SOURCES.length}/${distinctKeys.size}/` +
      OWNER_CONTRACT_KEY_SET_DIGEST,
  );
}

export const OWNER_CONTRACT_SOURCE_MAP = Object.freeze(
  Object.fromEntries(
    [...new Set(OWNER_CONTRACT_SOURCES.map(({ packet }) =>
      packet.definitionKey.operationId))].map((operationId) => [
      operationId,
      Object.freeze(Object.fromEntries(
        OWNER_CONTRACT_SOURCES.filter(({ packet }) =>
          packet.definitionKey.operationId === operationId
        ).map((source) => [packetMemberKey(source), source]),
      )),
    ]),
  ),
);

function packetMemberKey(source: ResolvedOwnerContractSource): string {
  return source.packet.definitionKey.memberKey;
}
