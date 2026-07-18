// Implements: T-274B1 process-local Consensus runtime schema delivery.

import type * as v from "valibot";

import {
  CONSENSUS_RUNTIME_SCHEMA_SOURCE_FAMILY,
  type ConsensusRuntimeSchemaSource
} from "../../../abg/m03/contracts/consensus_contract_family.js";
import {
  resolveSemanticBuildNativeSchemaSource
} from "../../../shared/validation/canonical_native_schema_projector.js";
import {
  defineNativeContract
} from "./native_contract_phase_a.js";
import {
  bindM04RuntimeSchemaNativeDefinition,
  type M04RuntimeSchemaNativeDefinitionRelation
} from "./runtime_schema_admission.js";

function compareCodePoints(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function contractCoordinate(source: ConsensusRuntimeSchemaSource): string {
  return `${source.contractId}@${source.contractVersion}`;
}

/** @internal */
export async function deriveConsensusRuntimeNativeDefinitionRelations(): Promise<
  readonly M04RuntimeSchemaNativeDefinitionRelation<v.GenericSchema>[]
> {
  const sources: readonly ConsensusRuntimeSchemaSource[] = Object.values(
    CONSENSUS_RUNTIME_SCHEMA_SOURCE_FAMILY
  );
  const publicSourceCount = sources.filter(
    (source) => source.publication === "existing_public_asset"
  ).length;
  const privateSourceCount = sources.filter(
    (source) => source.publication === "engine_private_definition"
  ).length;
  if (
    sources.length !== 15 ||
    publicSourceCount !== 3 ||
    privateSourceCount !== 12
  ) {
    throw new TypeError(
      "Consensus runtime native definitions: expected exact 15/3-public/12-private source family"
    );
  }
  if (
    new Set(sources.map((source) => source.symbolicSchemaRef)).size !==
      sources.length ||
    new Set(sources.map(contractCoordinate)).size !== sources.length
  ) {
    throw new TypeError(
      "Consensus runtime native definitions: duplicate symbolic or contract coordinate"
    );
  }
  const canonicalSources = [...sources].sort((left, right) =>
    compareCodePoints(contractCoordinate(left), contractCoordinate(right))
  );
  const relations: M04RuntimeSchemaNativeDefinitionRelation<v.GenericSchema>[] =
    [];
  for (const source of canonicalSources) {
    const definition = defineNativeContract({
      identity: {
        contractId: source.contractId,
        contractVersion: source.contractVersion,
        schemaId: source.contractId,
        schemaVersion: source.contractVersion
      },
      source: await resolveSemanticBuildNativeSchemaSource<v.GenericSchema>(
        source
      )
    });
    if (
      definition.schemaCoordinate.schemaId !== source.contractId ||
      definition.schemaCoordinate.schemaVersion !== source.contractVersion
    ) {
      throw new TypeError(
        "Consensus runtime native definitions: schema coordinate differs from source convention"
      );
    }
    relations.push(bindM04RuntimeSchemaNativeDefinition({
      source,
      definition
    }));
  }
  return Object.freeze(relations);
}
