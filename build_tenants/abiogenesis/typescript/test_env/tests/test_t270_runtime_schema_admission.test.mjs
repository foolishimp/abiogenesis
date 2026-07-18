// Validates: T-270 generic graph-private schema capability boundary.

import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { relative } from "node:path";
import test from "node:test";

import {
  admitGraphPrivateTargetValue,
  admitRuntimeSchemaAdmissionCapabilityBasis,
  canonicalizeRuntimeSchemaAdmissionMetadataRows,
  constructRuntimeSchemaAdmissionCapabilityBasis,
  constructRuntimeSchemaAdmissionEngineInput,
  RUNTIME_SCHEMA_ADMISSION_METADATA_KEY,
  resolveRuntimeSchemaAdmissionCapabilities
} from "../../build/semantic/code/src/abg/m03/contracts/runtime_schema_admission.js";
import {
  ABG_CONSENSUS_GTL_BODY,
  ABG_CONSENSUS_GTL_MODULE
} from "../../build/semantic/code/src/abg/m03/contracts/consensus_gtl_body.js";
import {
  CONSENSUS_PUBLIC_CONTRACT_FAMILY,
  CONSENSUS_PUBLIC_CONTRACT_SOURCES,
  CONSENSUS_RUNTIME_SCHEMA_SOURCE_FAMILY
} from "../../build/semantic/code/src/abg/m03/contracts/consensus_contract_family.js";
import {
  deriveConsensusRuntimeNativeDefinitionRelations
} from "../../build/semantic/code/src/app/m04/public_contracts/consensus_runtime_native_definitions.js";
import {
  defineNativeContract,
  PHASE_A_NATIVE_CONTRACT_FIXTURE_SOURCES
} from "../../build/semantic/code/src/app/m04/public_contracts/native_contract_phase_a.js";
import {
  admitM04RuntimeSchemaAdmissionMetadataRows,
  bindM04RuntimeSchemaNativeDefinition,
  projectM04RuntimeSchemaAdmission,
  runtimeSchemaAdmissionMetadataRowsFromModule
} from "../../build/semantic/code/src/app/m04/public_contracts/runtime_schema_admission.js";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";
import {
  constructEnvRef,
  constructGraph,
  constructGraphFunction,
  constructNode,
  constructTemplateRef,
  emptySerializedAttrs
} from "../../build/semantic/code/src/gtl/m01/contracts/constructors.js";
import {
  constructModule
} from "../../build/semantic/code/src/gtl/m02/contracts/constructors.js";
import {
  resolveSemanticBuildNativeSchemaSource
} from "../../build/semantic/code/src/shared/validation/canonical_native_schema_projector.js";
import {
  scenario09OneSurfaceProgramFixture
} from "../fixtures/t280_scenario09_one_surface_fixture.mjs";

const DIGEST = stableSha256Digest({ fixture: "t270-runtime-schema" });
const TENANT_ROOT = new URL("../../", import.meta.url);
const fixtureSourceRows = Object.freeze({
  request: PHASE_A_NATIVE_CONTRACT_FIXTURE_SOURCES.workspace_create_clean.request,
  result: PHASE_A_NATIVE_CONTRACT_FIXTURE_SOURCES.workspace_create_clean.result,
  refusal: PHASE_A_NATIVE_CONTRACT_FIXTURE_SOURCES.workspace_create_clean.refusal
});

function taggedObject(value) {
  return Object.freeze({
    kind: "object",
    entries: Object.freeze(Object.entries(value).map(([key, item]) =>
      Object.freeze({ key, value: item })
    ))
  });
}

async function sourceFiles(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const url = new URL(entry.name + (entry.isDirectory() ? "/" : ""), root);
    if (entry.isDirectory()) return sourceFiles(url);
    return entry.isFile() && entry.name.endsWith(".ts") ? [url] : [];
  }));
  return files.flat();
}

function taggedRows(rows) {
  return Object.freeze({
    kind: "array",
    items: Object.freeze(rows.map(taggedObject))
  });
}

function canonicalMetadataRows(rows) {
  return canonicalizeRuntimeSchemaAdmissionMetadataRows(rows);
}

function bindingWithMetadataRows(binding, rows) {
  const replacement = Object.freeze({
    key: RUNTIME_SCHEMA_ADMISSION_METADATA_KEY,
    value: Object.freeze({
      kind: "json_blob",
      value: taggedRows(canonicalMetadataRows(rows))
    })
  });
  const module = Object.freeze({
    ...binding.module,
    metadata: Object.freeze({
      entries: Object.freeze(binding.module.metadata.entries.map((entry) =>
        entry.key === RUNTIME_SCHEMA_ADMISSION_METADATA_KEY
          ? replacement
          : entry
      ))
    })
  });
  return Object.freeze({
    ...binding,
    module,
    moduleDigest: stableSha256Digest(module)
  });
}

async function relatedDefinition(kind, symbolicSchemaRef, source) {
  const contractId = `abg.contract.t270.scenario09.${kind}`;
  const relationSource = Object.freeze({
    ...source,
    symbolicSchemaRef,
    contractId,
    contractVersion: "5.0.0"
  });
  const definition = defineNativeContract({
    identity: {
      contractId,
      contractVersion: "5.0.0",
      schemaId: `abg.schema.t270.scenario09.${kind}`,
      schemaVersion: "5.0.0"
    },
    source: await resolveSemanticBuildNativeSchemaSource(relationSource)
  });
  return Object.freeze({
    source: relationSource,
    definition,
    relation: bindM04RuntimeSchemaNativeDefinition({
      source: relationSource,
      definition
    })
  });
}

function scenario09GraphFunctionWithInternalNode(graphFunction) {
  assert.equal(graphFunction.template.kind, "inline_graph");
  const internalNode = constructNode({
    name: "Scenario09InternalObservation",
    schema: {
      kind: "symbolic",
      ref: "schema://t270/scenario09/internal-observation"
    },
    markov: ["boundary://t270/scenario09-internal"],
    assetSurface: { kind: "t270_internal_observation" },
    tags: ["t270", "scenario09-lab", "internal"]
  });
  const sourceGraph = graphFunction.template.graph;
  const graph = constructGraph({
    name: sourceGraph.name,
    inputs: sourceGraph.inputs,
    outputs: sourceGraph.outputs,
    nodes: [...sourceGraph.nodes, internalNode],
    vectors: sourceGraph.vectors,
    contexts: sourceGraph.contexts,
    rules: sourceGraph.rules,
    effects: sourceGraph.effects,
    tags: sourceGraph.tags
  });
  const extended = constructGraphFunction({
    name: graphFunction.name,
    environment: constructEnvRef({
      requires: graphFunction.environment.requires,
      provides: graphFunction.environment.provides,
      carries: [...graphFunction.environment.carries, internalNode]
    }),
    inputs: graphFunction.inputs,
    outputs: graphFunction.outputs,
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: graphFunction.template.ref,
      graph,
      version: null
    }),
    effects: graphFunction.effects,
    declarations: graphFunction.declarations,
    tags: graphFunction.tags
  });
  return Object.freeze({ graph, graphFunction: extended, internalNode });
}

async function fixture() {
  const scenario = scenario09OneSurfaceProgramFixture();
  const extended = scenario09GraphFunctionWithInternalNode(
    scenario.callableLabFunction.finalHost
  );
  const graphFunction = extended.graphFunction;
  const otherGraphFunction = scenario.members[0].finalHost;
  const relatedDefinitions = Object.freeze(await Promise.all([
    relatedDefinition(
      "observation",
      graphFunction.inputs[0].schema.ref,
      fixtureSourceRows.request
    ),
    relatedDefinition(
      "normalized-observation",
      graphFunction.outputs[0].schema.ref,
      fixtureSourceRows.result
    ),
    relatedDefinition(
      "internal-observation",
      extended.internalNode.schema.ref,
      fixtureSourceRows.request
    ),
    relatedDefinition(
      "other-function-input",
      otherGraphFunction.inputs[0].schema.ref,
      fixtureSourceRows.refusal
    ),
    relatedDefinition(
      "other-function-output",
      otherGraphFunction.outputs[0].schema.ref,
      fixtureSourceRows.result
    )
  ]));
  const sources = Object.freeze(
    relatedDefinitions.map((value) => value.source)
  );
  const definitions = Object.freeze(
    relatedDefinitions.map((value) => value.definition)
  );
  const relations = Object.freeze(
    relatedDefinitions.map((value) => value.relation)
  );
  const rows = canonicalMetadataRows([
    {
      graphFunctionId: graphFunction.id,
      nodeRef: graphFunction.inputs[0].id,
      symbolicSchemaRef: graphFunction.inputs[0].schema.ref,
      contractId: definitions[0].schemaCoordinate.contractId,
      contractVersion: definitions[0].schemaCoordinate.contractVersion
    },
    {
      graphFunctionId: graphFunction.id,
      nodeRef: graphFunction.outputs[0].id,
      symbolicSchemaRef: graphFunction.outputs[0].schema.ref,
      contractId: definitions[1].schemaCoordinate.contractId,
      contractVersion: definitions[1].schemaCoordinate.contractVersion
    },
    {
      graphFunctionId: otherGraphFunction.id,
      nodeRef: otherGraphFunction.inputs[0].id,
      symbolicSchemaRef: otherGraphFunction.inputs[0].schema.ref,
      contractId: definitions[3].schemaCoordinate.contractId,
      contractVersion: definitions[3].schemaCoordinate.contractVersion
    },
    {
      graphFunctionId: otherGraphFunction.id,
      nodeRef: otherGraphFunction.outputs[0].id,
      symbolicSchemaRef: otherGraphFunction.outputs[0].schema.ref,
      contractId: definitions[4].schemaCoordinate.contractId,
      contractVersion: definitions[4].schemaCoordinate.contractVersion
    },
    {
      graphFunctionId: graphFunction.id,
      nodeRef: extended.internalNode.id,
      symbolicSchemaRef: extended.internalNode.schema.ref,
      contractId: definitions[2].schemaCoordinate.contractId,
      contractVersion: definitions[2].schemaCoordinate.contractVersion
    }
  ]);
  const admittedModule = constructModule({
    name: "t270.scenario09.runtime-schema-module",
    graphs: [extended.graph, otherGraphFunction.template.graph],
    graphFunctions: [graphFunction, otherGraphFunction],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    policyHooks: emptySerializedAttrs(),
    metadata: emptySerializedAttrs()
  });
  const module = Object.freeze({
    ...admittedModule,
    metadata: Object.freeze({
      entries: Object.freeze([Object.freeze({
        key: RUNTIME_SCHEMA_ADMISSION_METADATA_KEY,
        value: Object.freeze({
          kind: "json_blob",
          value: taggedRows(rows)
        })
      })])
    })
  });
  const binding = Object.freeze({
    kind: "catalog_execution_binding",
    workspaceId: "workspace:t270-scenario09",
    bindingId: "binding:t270-scenario09",
    catalogId: "catalog:t270-scenario09",
    resolvedLockRef: "lock:t270-scenario09",
    entryRef: "catalog-entry:t270-scenario09-normalize",
    declarationRef: "declaration:t270-scenario09-normalize",
    declarationDigest: DIGEST,
    libraryScope: "system",
    namespace: "abiogenesis",
    ownerRef: "publisher:t270-scenario09",
    version: "5.0.0",
    descriptorRef: null,
    contributionManifestRef: null,
    moduleRef: module.name,
    moduleName: module.name,
    moduleDigest: stableSha256Digest(module),
    graphFunctionHandle: graphFunction.name,
    graphFunctionId: graphFunction.id,
    graphFunctionDigest: stableSha256Digest(graphFunction),
    declarationSourceRefs: Object.freeze(["source:t270-scenario09"]),
    readinessRefs: Object.freeze(["readiness:t270-scenario09"]),
    sourceEventRefs: Object.freeze(["event:t270-scenario09"]),
    module,
    graphFunction
  });
  const projection = projectM04RuntimeSchemaAdmission({
    selectedExecutionBinding: binding,
    nativeDefinitionRelations: relations
  });
  const requirements = Object.freeze(
    rows
      .filter((row) => row.graphFunctionId === graphFunction.id)
      .map((row) => Object.freeze({
        graphFunctionId: row.graphFunctionId,
        nodeRef: row.nodeRef,
        symbolicSchemaRef: row.symbolicSchemaRef
      }))
  );
  const authority = Object.freeze({
    workspaceId: binding.workspaceId,
    bindingId: binding.bindingId,
    catalogId: binding.catalogId,
    resolvedLockRef: binding.resolvedLockRef,
    entryRef: binding.entryRef,
    declarationRef: binding.declarationRef,
    declarationDigest: binding.declarationDigest,
    ownerRef: binding.ownerRef,
    version: binding.version,
    moduleRef: binding.moduleRef,
    moduleDigest: binding.moduleDigest,
    graphFunctionId: binding.graphFunctionId,
    graphFunctionDigest: binding.graphFunctionDigest
  });
  return {
    authority,
    binding,
    definitions,
    internalNode: extended.internalNode,
    projection,
    relations,
    requirements,
    rows,
    sources
  };
}

const SCENARIO_09_FIXTURE = await fixture();

function consensusExecutionBinding() {
  const graphFunction = ABG_CONSENSUS_GTL_BODY.graphFunctions.consensus;
  const module = ABG_CONSENSUS_GTL_MODULE;
  return Object.freeze({
    kind: "catalog_execution_binding",
    workspaceId: "workspace:t270-consensus",
    bindingId: "binding:t270-consensus",
    catalogId: "catalog:t270-consensus",
    resolvedLockRef: "lock:t270-consensus",
    entryRef: "catalog-entry:t270-consensus",
    declarationRef: "declaration:t270-consensus",
    declarationDigest: DIGEST,
    libraryScope: "system",
    namespace: "abiogenesis",
    ownerRef: "publisher:abiogenesis",
    version: "5.0.0",
    descriptorRef: null,
    contributionManifestRef: null,
    moduleRef: module.name,
    moduleName: module.name,
    moduleDigest: stableSha256Digest(module),
    graphFunctionHandle: graphFunction.name,
    graphFunctionId: graphFunction.id,
    graphFunctionDigest: stableSha256Digest(graphFunction),
    declarationSourceRefs: Object.freeze(["source:t270-consensus"]),
    readinessRefs: Object.freeze(["readiness:t270-consensus"]),
    sourceEventRefs: Object.freeze(["event:t270-consensus"]),
    module,
    graphFunction
  });
}

test("T-270 admits the canonical T-252 Module through one neutral metadata order", async () => {
  const binding = consensusExecutionBinding();
  const relations = await deriveConsensusRuntimeNativeDefinitionRelations();
  const definitions = relations.map((relation) => relation.definition);
  const sources = Object.values(CONSENSUS_RUNTIME_SCHEMA_SOURCE_FAMILY);
  const sourceByCoordinate = new Map(sources.map((source) => [
    `${source.contractId}@${source.contractVersion}`,
    source
  ]));
  const rows = runtimeSchemaAdmissionMetadataRowsFromModule(binding.module);
  const projection = projectM04RuntimeSchemaAdmission({
    selectedExecutionBinding: binding,
    nativeDefinitionRelations: relations
  });

  assert.equal(rows.length, 34);
  assert.equal(definitions.length, 15);
  assert.equal(
    sources.filter((source) => source.publication === "existing_public_asset")
      .length,
    3
  );
  assert.equal(
    sources.filter(
      (source) => source.publication === "engine_private_definition"
    ).length,
    12
  );
  const definitionCoordinates = definitions.map((definition) =>
    `${definition.schemaCoordinate.contractId}@${definition.schemaCoordinate.contractVersion}`
  );
  assert.deepEqual(definitionCoordinates, [...definitionCoordinates].sort());
  for (const definition of definitions) {
    const source = sourceByCoordinate.get(
      `${definition.schemaCoordinate.contractId}@${definition.schemaCoordinate.contractVersion}`
    );
    assert.notEqual(source, undefined);
    assert.equal(definition.schema, source.schema);
    assert.deepEqual(definition.schemaCoordinate, {
      contractId: source.contractId,
      contractVersion: source.contractVersion,
      contractDigest: definition.projectionWitness.projectionDigest,
      schemaId: source.contractId,
      schemaVersion: source.contractVersion,
      schemaDigest: definition.projectionWitness.projectionDigest,
      nativeLocator: source.sourceLocator
    });
    assert.deepEqual(
      definition.projectionWitness.sourceLocator,
      source.sourceLocator
    );
    assert.deepEqual(
      definition.projectionWitness.namedCheckSource,
      source.namedChecks
    );
  }
  const publicContractIds = Object.values(CONSENSUS_PUBLIC_CONTRACT_FAMILY)
    .map((definition) => definition.contractId);
  const classifiedPublicContractIds = sources
    .filter((source) => source.publication === "existing_public_asset")
    .map((source) => source.contractId)
    .sort();
  const runtimeJoinContractIds = new Set(
    definitions.map((definition) => definition.schemaCoordinate.contractId)
  );
  const runtimePublicContractIds = publicContractIds
    .filter((contractId) => runtimeJoinContractIds.has(contractId))
    .sort();
  assert.deepEqual(runtimePublicContractIds, classifiedPublicContractIds);
  assert.deepEqual(runtimePublicContractIds, [
    CONSENSUS_PUBLIC_CONTRACT_FAMILY.consensus_subject.contractId,
    CONSENSUS_PUBLIC_CONTRACT_FAMILY.consensus_result.contractId,
    CONSENSUS_PUBLIC_CONTRACT_FAMILY.review_findings.contractId
  ].sort());
  const publicationOnlyContractIds = publicContractIds.filter(
    (contractId) => !runtimeJoinContractIds.has(contractId)
  );
  assert.equal(publicationOnlyContractIds.length, 6);
  assert.deepEqual(publicationOnlyContractIds, [
    CONSENSUS_PUBLIC_CONTRACT_FAMILY.consensus_panel.contractId,
    CONSENSUS_PUBLIC_CONTRACT_FAMILY.consensus_reviewer_profile.contractId,
    CONSENSUS_PUBLIC_CONTRACT_FAMILY.review_rulings.contractId,
    CONSENSUS_PUBLIC_CONTRACT_FAMILY.consensus_round_policy.contractId,
    CONSENSUS_PUBLIC_CONTRACT_FAMILY.consensus_round_outcome.contractId,
    CONSENSUS_PUBLIC_CONTRACT_FAMILY.ticket_consensus_projection.contractId
  ]);
  assert.equal(projection.bases.length, 4);
  assert.equal(projection.engineInput.capabilities.length, 4);

  const selectedRow = rows.find(
    (row) => row.graphFunctionId === binding.graphFunctionId
  );
  const nonSelectedRow = rows.find(
    (row) => row.graphFunctionId !== binding.graphFunctionId
  );
  assert.notEqual(selectedRow, undefined);
  assert.notEqual(nonSelectedRow, undefined);
  for (const omittedRow of [selectedRow, nonSelectedRow]) {
    assert.throws(
      () => projectM04RuntimeSchemaAdmission({
        selectedExecutionBinding: bindingWithMetadataRows(
          binding,
          rows.filter((row) => row !== omittedRow)
        ),
        nativeDefinitionRelations: relations
      }),
      /rows do not exactly cover Module symbolic Node containment/u
    );
  }

  const extraRelation = SCENARIO_09_FIXTURE.relations[0];
  assert.notEqual(extraRelation, undefined);
  const firstRelation = relations[0];
  assert.notEqual(firstRelation, undefined);
  const nonSelectedRelationIndex = relations.findIndex((relation) =>
    relation.symbolicSchemaRef === nonSelectedRow.symbolicSchemaRef &&
    relation.contractId === nonSelectedRow.contractId &&
    relation.contractVersion === nonSelectedRow.contractVersion
  );
  assert.notEqual(nonSelectedRelationIndex, -1);
  const joinCases = [
    {
      kind: "missing",
      nativeDefinitionRelations: relations.slice(0, -1),
      expected: /native definition relation family cardinality differs/u
    },
    {
      kind: "duplicate",
      nativeDefinitionRelations: [...relations.slice(0, -1), firstRelation],
      expected: /native definition relation family cardinality differs/u
    },
    {
      kind: "extra/unused",
      nativeDefinitionRelations: [...relations, extraRelation],
      expected: /native definition relation family cardinality differs/u
    },
    {
      kind: "nonselected substitution",
      nativeDefinitionRelations: relations.map((relation, index) =>
        index === nonSelectedRelationIndex ? extraRelation : relation
      ),
      expected: /native definition relation family cardinality differs/u
    }
  ];
  for (const joinCase of joinCases) {
    assert.throws(
      () => projectM04RuntimeSchemaAdmission({
        selectedExecutionBinding: binding,
        nativeDefinitionRelations: joinCase.nativeDefinitionRelations
      }),
      joinCase.expected,
      joinCase.kind
    );
  }

  const targetRelation = relations[0];
  assert.notEqual(targetRelation, undefined);
  const targetSource = sourceByCoordinate.get(
    `${targetRelation.contractId}@${targetRelation.contractVersion}`
  );
  assert.notEqual(targetSource, undefined);
  const targetCoordinate = targetRelation.definition.schemaCoordinate;
  const exactValueSourceClone = Object.freeze({ ...targetSource });
  assert.throws(
    () => bindM04RuntimeSchemaNativeDefinition({
      source: exactValueSourceClone,
      definition: targetRelation.definition
    }),
    /originating owner source row differs/u
  );
  async function assertRelabeledSourceRefuses(originalSource) {
    const wrongDefinition = defineNativeContract({
      identity: {
        contractId: targetCoordinate.contractId,
        contractVersion: targetCoordinate.contractVersion,
        schemaId: targetCoordinate.schemaId,
        schemaVersion: targetCoordinate.schemaVersion
      },
      source: await resolveSemanticBuildNativeSchemaSource(originalSource)
    });
    const relabeledSource = Object.freeze({
      ...originalSource,
      symbolicSchemaRef: targetSource.symbolicSchemaRef,
      contractId: targetSource.contractId,
      contractVersion: targetSource.contractVersion
    });
    assert.throws(
      () => bindM04RuntimeSchemaNativeDefinition({
        source: relabeledSource,
        definition: wrongDefinition
      }),
      /originating owner source row differs/u
    );
  }
  const anotherRuntimeSource = sources.find(
    (source) => source.schema !== targetSource.schema
  );
  assert.notEqual(anotherRuntimeSource, undefined);
  await assertRelabeledSourceRefuses(anotherRuntimeSource);
  const publicationOnlySources = [
    CONSENSUS_PUBLIC_CONTRACT_SOURCES.consensus_panel,
    CONSENSUS_PUBLIC_CONTRACT_SOURCES.consensus_reviewer_profile,
    CONSENSUS_PUBLIC_CONTRACT_SOURCES.review_rulings,
    CONSENSUS_PUBLIC_CONTRACT_SOURCES.consensus_round_policy,
    CONSENSUS_PUBLIC_CONTRACT_SOURCES.consensus_round_outcome,
    CONSENSUS_PUBLIC_CONTRACT_SOURCES.ticket_consensus_projection
  ];
  for (const publicationOnlySource of publicationOnlySources) {
    await assertRelabeledSourceRefuses(publicationOnlySource);
  }
  assert.throws(
    () => projectM04RuntimeSchemaAdmission({
      selectedExecutionBinding: binding,
      nativeDefinitionRelations: [
        Object.freeze({ ...firstRelation }),
        ...relations.slice(1)
      ]
    }),
    /unresolved or forged native definition relation/u
  );
});

test("T-270 joins a complete multi-function Module then projects the selected non-Consensus Scenario-09 pair", () => {
  const value = SCENARIO_09_FIXTURE;
  assert.equal(value.definitions.length, 5);
  assert.equal(new Set(value.rows.map((row) => row.graphFunctionId)).size, 2);
  assert.equal(value.projection.bases.length, 3);
  assert.equal(value.projection.engineInput.capabilities.length, 3);
  assert.equal(
    value.projection.bases.some(
      (basis) => basis.nodeRef === value.internalNode.id
    ),
    true
  );
  const resolved = resolveRuntimeSchemaAdmissionCapabilities({
    requirements: value.requirements,
    authority: value.authority,
    admittedBases: value.projection.bases,
    engineInput: value.projection.engineInput
  });
  assert.equal(resolved.length, 3);
  assert.deepEqual(
    resolved.map((capability) => capability.basis),
    value.projection.bases
  );
  const requestCapability = resolved.find(
    (capability) =>
      capability.basis.symbolicSchemaRef ===
      value.binding.graphFunction.inputs[0].schema.ref
  );
  assert.notEqual(requestCapability, undefined);
  const admitted = admitGraphPrivateTargetValue({
    capability: requestCapability,
    candidate: {
      targetRoot: "/tmp/t270-scenario09",
      createPolicy: "clean"
    }
  });
  assert.equal(admitted.targetRoot, "/tmp/t270-scenario09");
  assert.equal(admitted.createPolicy, "clean");
  assert.equal(Object.isFrozen(admitted), true);
});

test("T-270 exact-matches the entire requirement, basis, and branded capability family before admission", () => {
  const value = SCENARIO_09_FIXTURE;
  assert.deepEqual(
    resolveRuntimeSchemaAdmissionCapabilities({
      requirements: [],
      authority: value.authority,
      admittedBases: [],
      engineInput: constructRuntimeSchemaAdmissionEngineInput([])
    }),
    []
  );
  assert.throws(
    () => resolveRuntimeSchemaAdmissionCapabilities({
      requirements: value.requirements,
      authority: value.authority,
      admittedBases: value.projection.bases.slice(0, 1),
      engineInput: value.projection.engineInput
    }),
    /family cardinality differs/u
  );
  assert.throws(
    () => resolveRuntimeSchemaAdmissionCapabilities({
      requirements: value.requirements,
      authority: value.authority,
      admittedBases: value.projection.bases,
      engineInput: constructRuntimeSchemaAdmissionEngineInput([
        value.projection.engineInput.capabilities[0],
        value.projection.engineInput.capabilities[0],
        value.projection.engineInput.capabilities[2]
      ])
    }),
    /exact match differs/u
  );
  const forged = Object.freeze({
    ...value.projection.engineInput.capabilities[0]
  });
  assert.throws(
    () => resolveRuntimeSchemaAdmissionCapabilities({
      requirements: value.requirements,
      authority: value.authority,
      admittedBases: value.projection.bases,
      engineInput: Object.freeze({
        kind: "runtime_schema_admission_engine_input",
        capabilities: Object.freeze([
          forged,
          value.projection.engineInput.capabilities[1],
          value.projection.engineInput.capabilities[2]
        ])
      })
    }),
    /unresolved or forged/u
  );
  const { basisDigest, ...unsealedBasis } =
    value.projection.bases[0];
  void basisDigest;
  const mismatched = constructRuntimeSchemaAdmissionCapabilityBasis({
    ...unsealedBasis,
    nodeRef: "node:t270-mismatched"
  });
  assert.throws(
    () => resolveRuntimeSchemaAdmissionCapabilities({
      requirements: value.requirements,
      authority: value.authority,
      admittedBases: [
        mismatched,
        value.projection.bases[1],
        value.projection.bases[2]
      ],
      engineInput: value.projection.engineInput
    }),
    /exact match differs/u
  );
  assert.throws(
    () => resolveRuntimeSchemaAdmissionCapabilities({
      requirements: value.requirements,
      authority: { ...value.authority, catalogId: "catalog:other" },
      admittedBases: value.projection.bases,
      engineInput: value.projection.engineInput
    }),
    /authority differs/u
  );
});

test("T-270 admits an exact selected GraphFunction with no symbolic schema requirements", () => {
  const value = SCENARIO_09_FIXTURE;
  const input = constructNode({
    name: "RuntimeRefInput",
    schema: { kind: "runtime_ref", ref: "runtime://t270/input" },
    markov: ["boundary://t270/runtime-ref"],
    assetSurface: { kind: "t270_runtime_ref_input" },
    tags: ["t270", "runtime-ref"]
  });
  const output = constructNode({
    name: "RuntimeRefOutput",
    schema: { kind: "runtime_ref", ref: "runtime://t270/output" },
    markov: ["boundary://t270/runtime-ref"],
    assetSurface: { kind: "t270_runtime_ref_output" },
    tags: ["t270", "runtime-ref"]
  });
  const graph = constructGraph({
    name: "t270.runtime-ref-only.graph",
    inputs: [input],
    outputs: [output],
    nodes: [input, output],
    vectors: [],
    contexts: [],
    rules: [],
    effects: [],
    tags: ["t270", "runtime-ref"]
  });
  const graphFunction = constructGraphFunction({
    name: "t270.runtime-ref-only",
    environment: constructEnvRef({
      requires: [input],
      provides: [output],
      carries: [input, output]
    }),
    inputs: [input],
    outputs: [output],
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: "template://t270/runtime-ref-only",
      graph,
      version: null
    }),
    effects: [],
    declarations: emptySerializedAttrs(),
    tags: ["t270", "runtime-ref"]
  });
  const module = Object.freeze({
    ...value.binding.module,
    graphs: Object.freeze([...value.binding.module.graphs, graph]),
    graphFunctions: Object.freeze([
      ...value.binding.module.graphFunctions,
      graphFunction
    ])
  });
  const binding = Object.freeze({
    ...value.binding,
    graphFunction,
    graphFunctionHandle: graphFunction.name,
    graphFunctionId: graphFunction.id,
    graphFunctionDigest: stableSha256Digest(graphFunction),
    module,
    moduleDigest: stableSha256Digest(module)
  });
  const projection = projectM04RuntimeSchemaAdmission({
    selectedExecutionBinding: binding,
    nativeDefinitionRelations: value.relations
  });
  assert.deepEqual(projection.bases, []);
  assert.deepEqual(projection.engineInput.capabilities, []);
  assert.deepEqual(
    resolveRuntimeSchemaAdmissionCapabilities({
      requirements: [],
      authority: {
        ...value.authority,
        moduleDigest: binding.moduleDigest,
        graphFunctionId: binding.graphFunctionId,
        graphFunctionDigest: binding.graphFunctionDigest
      },
      admittedBases: projection.bases,
      engineInput: projection.engineInput
    }),
    []
  );

  const runtimeOnlyModule = Object.freeze({
    ...module,
    graphs: Object.freeze([graph]),
    graphFunctions: Object.freeze([graphFunction])
  });
  const runtimeOnlyBinding = bindingWithMetadataRows(
    Object.freeze({
      ...binding,
      module: runtimeOnlyModule,
      moduleDigest: stableSha256Digest(runtimeOnlyModule)
    }),
    []
  );
  const runtimeOnlyProjection = projectM04RuntimeSchemaAdmission({
    selectedExecutionBinding: runtimeOnlyBinding,
    nativeDefinitionRelations: []
  });
  assert.deepEqual(runtimeOnlyProjection.bases, []);
  assert.deepEqual(runtimeOnlyProjection.engineInput.capabilities, []);
});

test("T-270 rejects one contract key assigned across heterogeneous symbolic schemas", () => {
  const value = SCENARIO_09_FIXTURE;
  const sharedRows = value.rows.map((row) => ({
    ...row,
    contractId: value.definitions[0].schemaCoordinate.contractId,
    contractVersion: value.definitions[0].schemaCoordinate.contractVersion
  }));
  const binding = bindingWithMetadataRows(value.binding, sharedRows);
  assert.throws(
    () => projectM04RuntimeSchemaAdmission({
      selectedExecutionBinding: binding,
      nativeDefinitionRelations: [value.relations[0]]
    }),
    /native definition relation family cardinality differs/u
  );
});

test("T-270 contracts repeated rows only over the same bound symbolic schema relation", () => {
  const value = SCENARIO_09_FIXTURE;
  const selected = value.binding.graphFunction;
  assert.equal(selected.template.kind, "inline_graph");
  const repeatedNode = constructNode({
    name: "Scenario09RepeatedObservation",
    schema: selected.inputs[0].schema,
    markov: ["boundary://t270/scenario09-repeated"],
    assetSurface: { kind: "t270_repeated_observation" },
    tags: ["t270", "scenario09-lab", "repeated"]
  });
  const sourceGraph = selected.template.graph;
  const graph = constructGraph({
    name: sourceGraph.name,
    inputs: sourceGraph.inputs,
    outputs: sourceGraph.outputs,
    nodes: [...sourceGraph.nodes, repeatedNode],
    vectors: sourceGraph.vectors,
    contexts: sourceGraph.contexts,
    rules: sourceGraph.rules,
    effects: sourceGraph.effects,
    tags: sourceGraph.tags
  });
  const graphFunction = constructGraphFunction({
    name: selected.name,
    environment: constructEnvRef({
      requires: selected.environment.requires,
      provides: selected.environment.provides,
      carries: [...selected.environment.carries, repeatedNode]
    }),
    inputs: selected.inputs,
    outputs: selected.outputs,
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: selected.template.ref,
      graph,
      version: selected.template.version
    }),
    effects: selected.effects,
    declarations: selected.declarations,
    tags: selected.tags
  });
  const module = Object.freeze({
    ...value.binding.module,
    graphs: Object.freeze(value.binding.module.graphs.map((candidate) =>
      candidate.id === sourceGraph.id ? graph : candidate
    )),
    graphFunctions: Object.freeze(
      value.binding.module.graphFunctions.map((candidate) =>
        candidate.id === selected.id ? graphFunction : candidate
      )
    )
  });
  const sourceRelation = value.relations[0];
  assert.notEqual(sourceRelation, undefined);
  const rows = value.rows.map((row) =>
    row.graphFunctionId === selected.id
      ? { ...row, graphFunctionId: graphFunction.id }
      : row
  );
  rows.push({
    graphFunctionId: graphFunction.id,
    nodeRef: repeatedNode.id,
    symbolicSchemaRef: sourceRelation.symbolicSchemaRef,
    contractId: sourceRelation.contractId,
    contractVersion: sourceRelation.contractVersion
  });
  const binding = bindingWithMetadataRows(Object.freeze({
    ...value.binding,
    graphFunction,
    graphFunctionHandle: graphFunction.name,
    graphFunctionId: graphFunction.id,
    graphFunctionDigest: stableSha256Digest(graphFunction),
    module,
    moduleDigest: stableSha256Digest(module)
  }), rows);
  const projection = projectM04RuntimeSchemaAdmission({
    selectedExecutionBinding: binding,
    nativeDefinitionRelations: value.relations
  });
  const repeatedBases = projection.bases.filter((basis) =>
    basis.symbolicSchemaRef === sourceRelation.symbolicSchemaRef &&
    basis.contractId === sourceRelation.contractId &&
    basis.contractVersion === sourceRelation.contractVersion
  );
  assert.equal(repeatedBases.length, 2);
  assert.equal(value.relations.length, 5);
});

test("T-270 refuses metadata rows outside the exact Module GraphFunction and Node schema topology", () => {
  const value = SCENARIO_09_FIXTURE;
  const cases = [
    {
      row: {
        ...value.rows[0],
        graphFunctionId: "graph-function://t270/foreign"
      },
      expected: /GraphFunction is outside or ambiguous in Module/u
    },
    {
      row: {
        ...value.rows[0],
        nodeRef: "node://t270/foreign"
      },
      expected: /Node is outside GraphFunction containment/u
    },
    {
      row: {
        ...value.rows[0],
        symbolicSchemaRef: "schema://t270/foreign"
      },
      expected: /symbolic schema ref differs from Node/u
    }
  ];
  for (const candidate of cases) {
    const rows = [candidate.row, ...value.rows.slice(1)];
    assert.throws(
      () => projectM04RuntimeSchemaAdmission({
        selectedExecutionBinding: bindingWithMetadataRows(value.binding, rows),
        nativeDefinitionRelations: value.relations
      }),
      candidate.expected
    );
  }
});

test("T-270 refuses one contained Node identity with divergent definitions", () => {
  const value = SCENARIO_09_FIXTURE;
  const selected = value.binding.graphFunction;
  const divergentNode = Object.freeze({
    ...selected.inputs[0],
    schema: Object.freeze({
      kind: "symbolic",
      ref: "schema://t270/divergent-contained-definition"
    })
  });
  const divergentGraphFunction = Object.freeze({
    ...selected,
    environment: Object.freeze({
      ...selected.environment,
      carries: Object.freeze([
        ...selected.environment.carries,
        divergentNode
      ])
    })
  });
  const module = Object.freeze({
    ...value.binding.module,
    graphFunctions: Object.freeze(value.binding.module.graphFunctions.map(
      (graphFunction) => graphFunction.id === selected.id
        ? divergentGraphFunction
        : graphFunction
    ))
  });
  const binding = Object.freeze({
    ...value.binding,
    module,
    moduleDigest: stableSha256Digest(module)
  });
  assert.throws(
    () => projectM04RuntimeSchemaAdmission({
      selectedExecutionBinding: binding,
      nativeDefinitionRelations: value.relations
    }),
    /contained Node identity differs/u
  );
});

test("T-270 refuses malformed flat metadata and non-exact native definition joins", async () => {
  const value = SCENARIO_09_FIXTURE;
  assert.throws(
    () => admitM04RuntimeSchemaAdmissionMetadataRows([{ ...value.rows[0],
      coordinateDigest: DIGEST }]),
    /expected exact/u
  );
  assert.throws(
    () => admitM04RuntimeSchemaAdmissionMetadataRows([
      value.rows[0],
      value.rows[0]
    ]),
    /duplicate row key/u
  );
  assert.throws(
    () => projectM04RuntimeSchemaAdmission({
      selectedExecutionBinding: value.binding,
      nativeDefinitionRelations: [value.relations[0]]
    }),
    /family cardinality differs/u
  );
  const extra = await relatedDefinition(
    "extra",
    "schema://t270/scenario09/extra",
    fixtureSourceRows.request
  );
  assert.throws(
    () => projectM04RuntimeSchemaAdmission({
      selectedExecutionBinding: value.binding,
      nativeDefinitionRelations: [...value.relations, extra.relation]
    }),
    /family cardinality differs/u
  );
  assert.throws(
    () => projectM04RuntimeSchemaAdmission({
      selectedExecutionBinding: value.binding,
      nativeDefinitionRelations: [value.relations[0], value.relations[0]]
    }),
    /family cardinality differs/u
  );
  assert.throws(
    () => projectM04RuntimeSchemaAdmission({
      selectedExecutionBinding: value.binding,
      nativeDefinitionRelations: [
        { ...value.relations[0] },
        value.relations[1],
        value.relations[2]
      ]
    }),
    /unresolved or forged native definition relation/u
  );
  const divergentCarrier = await relatedDefinition(
    "observation",
    "schema://t270/scenario09/observation-alias",
    fixtureSourceRows.request
  );
  assert.throws(
    () => projectM04RuntimeSchemaAdmission({
      selectedExecutionBinding: value.binding,
      nativeDefinitionRelations: [
        value.relations[0],
        divergentCarrier.relation
      ]
    }),
    /contract key has divergent native definition carrier/u
  );
  assert.throws(
    () => admitRuntimeSchemaAdmissionCapabilityBasis({
      ...value.projection.bases[0],
      contractId: "abg.contract.t270.drifted"
    }),
    /basis digest differs/u
  );
});

test("T-270 keeps M04 types and process-local callables outside neutral M03 source and stable carriers", async () => {
  const neutralUrl = new URL(
    "code/src/abg/m03/contracts/runtime_schema_admission.ts",
    TENANT_ROOT
  );
  const neutralSource = await readFile(neutralUrl, "utf8");
  assert.doesNotMatch(
    neutralSource,
    /app\/m04|PublicContractCoordinate|NativeContractDefinition|valibot/u
  );
  const productionSources = await sourceFiles(new URL("code/src/", TENANT_ROOT));
  const constructorCallSites = [];
  for (const url of productionSources) {
    const source = url.href === neutralUrl.href
      ? neutralSource
      : await readFile(url, "utf8");
    const count = [
      ...source.matchAll(/constructRuntimeSchemaAdmissionCapability\s*\(/gu)
    ].length;
    if (count > 0) {
      constructorCallSites.push([
        relative(new URL("code/src/", TENANT_ROOT).pathname, url.pathname),
        count
      ]);
    }
  }
  assert.deepEqual(constructorCallSites, [
    ["abg/m03/contracts/runtime_schema_admission.ts", 1],
    ["app/m04/public_contracts/runtime_schema_admission.ts", 1]
  ]);

  const value = SCENARIO_09_FIXTURE;
  assert.equal(JSON.stringify(value.binding.module).includes("admit"), false);
  assert.equal(JSON.stringify(value.projection.bases).includes("admit"), false);
  assert.throws(
    () => stableSha256Digest(value.projection.engineInput),
    /expected an I-JSON value/u
  );
});
