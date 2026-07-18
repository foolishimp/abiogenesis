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
  CONSENSUS_RUNTIME_SCHEMA_SOURCES
} from "../../build/semantic/code/src/abg/m03/contracts/consensus_contract_family.js";
import {
  defineNativeContract,
  PHASE_A_NATIVE_CONTRACT_FIXTURE_SOURCES
} from "../../build/semantic/code/src/app/m04/public_contracts/native_contract_phase_a.js";
import {
  admitM04RuntimeSchemaAdmissionMetadataRows,
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
const fixtureSources = Object.freeze({
  request: await resolveSemanticBuildNativeSchemaSource(
    PHASE_A_NATIVE_CONTRACT_FIXTURE_SOURCES.workspace_create_clean.request
  ),
  result: await resolveSemanticBuildNativeSchemaSource(
    PHASE_A_NATIVE_CONTRACT_FIXTURE_SOURCES.workspace_create_clean.result
  ),
  refusal: await resolveSemanticBuildNativeSchemaSource(
    PHASE_A_NATIVE_CONTRACT_FIXTURE_SOURCES.workspace_create_clean.refusal
  )
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

function definition(kind, source) {
  return defineNativeContract({
    identity: {
      contractId: `abg.contract.t270.scenario09.${kind}`,
      contractVersion: "5.0.0",
      schemaId: `abg.schema.t270.scenario09.${kind}`,
      schemaVersion: "5.0.0"
    },
    source
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

function fixture() {
  const scenario = scenario09OneSurfaceProgramFixture();
  const extended = scenario09GraphFunctionWithInternalNode(
    scenario.callableLabFunction.finalHost
  );
  const graphFunction = extended.graphFunction;
  const otherGraphFunction = scenario.members[0].finalHost;
  const definitions = Object.freeze([
    definition("observation", fixtureSources.request),
    definition("normalized-observation", fixtureSources.result),
    definition("internal-observation", fixtureSources.request),
    definition("other-function-input", fixtureSources.refusal),
    definition("other-function-output", fixtureSources.result)
  ]);
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
    nativeDefinitions: definitions
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
    requirements,
    rows
  };
}

const SCENARIO_09_FIXTURE = fixture();

async function consensusRuntimeDefinitions() {
  return Object.freeze(await Promise.all(
    CONSENSUS_RUNTIME_SCHEMA_SOURCES.map(async (source) =>
      defineNativeContract({
        identity: {
          contractId: source.contractId,
          contractVersion: source.contractVersion,
          schemaId: source.contractId,
          schemaVersion: source.contractVersion
        },
        source: await resolveSemanticBuildNativeSchemaSource(source)
      })
    )
  ));
}

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
  const definitions = await consensusRuntimeDefinitions();
  const rows = runtimeSchemaAdmissionMetadataRowsFromModule(binding.module);
  const projection = projectM04RuntimeSchemaAdmission({
    selectedExecutionBinding: binding,
    nativeDefinitions: definitions
  });

  assert.equal(rows.length, 34);
  assert.equal(definitions.length, 15);
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
        nativeDefinitions: definitions
      }),
      /rows do not exactly cover Module symbolic Node containment/u
    );
  }
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
    nativeDefinitions: value.definitions
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
    nativeDefinitions: []
  });
  assert.deepEqual(runtimeOnlyProjection.bases, []);
  assert.deepEqual(runtimeOnlyProjection.engineInput.capabilities, []);
});

test("T-270 contracts repeated schema use without duplicating native definition authority", () => {
  const value = SCENARIO_09_FIXTURE;
  const sharedRows = value.rows.map((row) => ({
    ...row,
    contractId: value.definitions[0].schemaCoordinate.contractId,
    contractVersion: value.definitions[0].schemaCoordinate.contractVersion
  }));
  const binding = bindingWithMetadataRows(value.binding, sharedRows);
  const projection = projectM04RuntimeSchemaAdmission({
    selectedExecutionBinding: binding,
    nativeDefinitions: [value.definitions[0]]
  });
  assert.equal(projection.bases.length, 3);
  assert.equal(
    new Set(projection.bases.map((basis) =>
      `${basis.contractId}@${basis.contractVersion}`
    )).size,
    1
  );
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
        nativeDefinitions: value.definitions
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
      nativeDefinitions: value.definitions
    }),
    /contained Node identity differs/u
  );
});

test("T-270 refuses malformed flat metadata and non-exact native definition joins", () => {
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
      nativeDefinitions: [value.definitions[0]]
    }),
    /family cardinality differs/u
  );
  const extraDefinition = definition("extra", fixtureSources.request);
  assert.throws(
    () => projectM04RuntimeSchemaAdmission({
      selectedExecutionBinding: value.binding,
      nativeDefinitions: [...value.definitions, extraDefinition]
    }),
    /family cardinality differs/u
  );
  assert.throws(
    () => projectM04RuntimeSchemaAdmission({
      selectedExecutionBinding: value.binding,
      nativeDefinitions: [value.definitions[0], value.definitions[0]]
    }),
    /family cardinality differs/u
  );
  assert.throws(
    () => projectM04RuntimeSchemaAdmission({
      selectedExecutionBinding: value.binding,
      nativeDefinitions: [
        { ...value.definitions[0] },
        value.definitions[1],
        value.definitions[2]
      ]
    }),
    /unresolved or forged definition carrier/u
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
