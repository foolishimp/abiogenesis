// Implements the private, temp-only T-274A Consensus artifact derivation.

import {
  CONSENSUS_PUBLIC_CONTRACT_SOURCES,
  CONSENSUS_ROUND_OUTCOME_VALUES,
  REVIEW_RULING_KIND_VALUES
} from "../../../abg/m03/contracts/consensus_contract_family.js";
import {
  sha256DigestForBytes,
  stableJson,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import type { NativeSchemaProjectionWitness } from "../../../shared/validation/canonical_native_schema_projector.js";
import { resolveSemanticBuildNativeSchemaSource } from "../../../shared/validation/canonical_native_schema_projector.js";
import {
  canonicalNativeSchemaBytes,
  defineNativeContract,
  type PublicContractCoordinate
} from "./native_contract_phase_a.js";

const CONSENSUS_CONTRACT_VERSION = "5.0.0";
const SCHEMA_ID_PREFIX = "abg.schema.";

/** @internal */
export interface ConsensusPhaseASchemaArtifact {
  readonly kind: "consensus_phase_a_schema_asset";
  readonly contractKind: string;
  readonly contractId: string;
  readonly contractVersion: string;
  readonly nativeType: string;
  readonly relativePath: string;
  readonly mediaType: "application/schema+json";
  readonly bytes: Uint8Array;
  readonly digest: `sha256:${string}`;
  readonly coordinate: PublicContractCoordinate;
  readonly projectionWitness: NativeSchemaProjectionWitness;
}

/** @internal */
export interface ConsensusPhaseAVocabularyArtifact {
  readonly kind: "consensus_phase_a_vocabulary_asset";
  readonly vocabularyId: string;
  readonly vocabularyVersion: string;
  readonly sourceExport: string;
  readonly relativePath: string;
  readonly mediaType: "application/json";
  readonly values: readonly string[];
  readonly bytes: Uint8Array;
  readonly digest: `sha256:${string}`;
}

/** @internal */
export interface ConsensusPhaseAArtifactSet {
  readonly kind: "consensus_phase_a_artifact_set";
  readonly schemaAssets: readonly ConsensusPhaseASchemaArtifact[];
  readonly vocabularyAssets: readonly ConsensusPhaseAVocabularyArtifact[];
  readonly artifactSetDigest: `sha256:${string}`;
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function schemaRelativePath(contractId: string): string {
  if (!contractId.startsWith(SCHEMA_ID_PREFIX)) {
    throw new TypeError(
      `Consensus Phase A: unsupported schema identity ${contractId}`
    );
  }
  const slug = contractId.slice(SCHEMA_ID_PREFIX.length);
  if (!/^[a-z][a-z0-9-]*$/u.test(slug)) {
    throw new TypeError(
      `Consensus Phase A: schema identity has no canonical path ${contractId}`
    );
  }
  return `contracts/schemas/${slug}.schema.json`;
}

async function deriveSchemaArtifact(
  sourceRow: (typeof CONSENSUS_PUBLIC_CONTRACT_SOURCES)[keyof typeof CONSENSUS_PUBLIC_CONTRACT_SOURCES]
): Promise<ConsensusPhaseASchemaArtifact> {
  const source = await resolveSemanticBuildNativeSchemaSource(sourceRow);
  const nativeContract = defineNativeContract({
    identity: {
      contractId: sourceRow.contractId,
      contractVersion: CONSENSUS_CONTRACT_VERSION,
      schemaId: sourceRow.contractId,
      schemaVersion: CONSENSUS_CONTRACT_VERSION
    },
    source
  });
  const bytes = canonicalNativeSchemaBytes(nativeContract.projectedSchema);
  const digest = sha256DigestForBytes(bytes);
  if (digest !== nativeContract.projectionWitness.projectionDigest) {
    throw new TypeError(
      `Consensus Phase A: byte/projection digest mismatch for ${sourceRow.contractId}`
    );
  }
  return Object.freeze({
    kind: "consensus_phase_a_schema_asset" as const,
    contractKind: sourceRow.contractKind,
    contractId: sourceRow.contractId,
    contractVersion: CONSENSUS_CONTRACT_VERSION,
    nativeType: sourceRow.nativeType,
    relativePath: schemaRelativePath(sourceRow.contractId),
    mediaType: "application/schema+json" as const,
    bytes,
    digest,
    coordinate: nativeContract.schemaCoordinate,
    projectionWitness: nativeContract.projectionWitness
  });
}

const CONSENSUS_VOCABULARY_SOURCES = Object.freeze([
  Object.freeze({
    vocabularyId: "abg.vocabulary.review-ruling-kind",
    sourceExport: "REVIEW_RULING_KIND_VALUES",
    relativePath: "contracts/vocabularies/review-ruling-kind.json",
    values: REVIEW_RULING_KIND_VALUES
  }),
  Object.freeze({
    vocabularyId: "abg.vocabulary.consensus-round-outcome",
    sourceExport: "CONSENSUS_ROUND_OUTCOME_VALUES",
    relativePath: "contracts/vocabularies/consensus-round-outcome.json",
    values: CONSENSUS_ROUND_OUTCOME_VALUES
  })
] as const);

function deriveVocabularyArtifact(
  source: (typeof CONSENSUS_VOCABULARY_SOURCES)[number]
): ConsensusPhaseAVocabularyArtifact {
  const value = Object.freeze({
    kind: "abg_closed_vocabulary" as const,
    schemaVersion: 1 as const,
    vocabularyId: source.vocabularyId,
    values: source.values
  });
  const bytes = new TextEncoder().encode(stableJson(value));
  return Object.freeze({
    kind: "consensus_phase_a_vocabulary_asset" as const,
    vocabularyId: source.vocabularyId,
    vocabularyVersion: CONSENSUS_CONTRACT_VERSION,
    sourceExport: source.sourceExport,
    relativePath: source.relativePath,
    mediaType: "application/json" as const,
    values: source.values,
    bytes,
    digest: sha256DigestForBytes(bytes)
  });
}

/** @internal */
export async function deriveConsensusPhaseAArtifactSet(): Promise<ConsensusPhaseAArtifactSet> {
  const schemaAssets = Object.freeze(
    (await Promise.all(
      Object.values(CONSENSUS_PUBLIC_CONTRACT_SOURCES).map(
        deriveSchemaArtifact
      )
    ))
      .sort((left, right) => compareText(left.contractId, right.contractId))
  );
  const vocabularyAssets = Object.freeze(
    CONSENSUS_VOCABULARY_SOURCES
      .map(deriveVocabularyArtifact)
      .sort((left, right) =>
        compareText(left.vocabularyId, right.vocabularyId)
      )
  );
  const artifactSetBasis = Object.freeze({
    kind: "consensus_phase_a_artifact_set" as const,
    schemaAssets: schemaAssets.map((asset) =>
      Object.freeze({
        contractKind: asset.contractKind,
        contractId: asset.contractId,
        contractVersion: asset.contractVersion,
        nativeType: asset.nativeType,
        relativePath: asset.relativePath,
        mediaType: asset.mediaType,
        digest: asset.digest,
        witnessDigest: asset.projectionWitness.witnessDigest
      })
    ),
    vocabularyAssets: vocabularyAssets.map((asset) =>
      Object.freeze({
        vocabularyId: asset.vocabularyId,
        vocabularyVersion: asset.vocabularyVersion,
        sourceExport: asset.sourceExport,
        relativePath: asset.relativePath,
        mediaType: asset.mediaType,
        values: asset.values,
        digest: asset.digest
      })
    )
  });
  return Object.freeze({
    kind: "consensus_phase_a_artifact_set" as const,
    schemaAssets,
    vocabularyAssets,
    artifactSetDigest: stableSha256Digest(artifactSetBasis)
  });
}
