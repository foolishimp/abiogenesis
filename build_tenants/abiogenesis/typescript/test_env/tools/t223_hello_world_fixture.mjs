// T-223 publisher fixture generator. The generated package is declarations-only.

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  C,
  abgFnCompositionDeclarationRef,
  canonicalizeIJson,
  cInterfaceCarrier,
  cProgramCatalogDeclarationEntry,
  constructAbgFnCompositionDeclarations,
  constructContractRef,
  constructGraph,
  constructGraphFunction,
  constructExecutionContextProjectionRule,
  constructInstructionProtocolRule,
  constructJob,
  constructModule,
  constructNode,
  constructNodeTypeGraphFunction,
  constructRole,
  constructTemplateRef,
  contributionManifestDigest,
  declareCProgram,
  descriptorDigest,
  digestCanonicalIJson,
  edge,
  emptySerializedAttrs,
  graphFunctionDeclarations,
  graphFunctionForVector,
  graphVectorDeclarations,
  hogProgramRefDeclarationEntry,
  pluginSelectionDeclarationEntry,
  publicContractCatalogDigest,
  serializeModule,
  typedInterface,
  typedNode
} from "../../build/semantic/code/src/index.js";
import {
  RUNTIME_SCHEMA_ADMISSION_METADATA_KEY,
  canonicalizeRuntimeSchemaAdmissionMetadataRows
} from "../../build/semantic/code/src/abg/m03/contracts/runtime_schema_admission.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));

export const T223_FIXTURE_ROOT = path.resolve(
  HERE,
  "../fixtures/t223_hello_world_catalog_product"
);
export const T223_FIXTURE_PRODUCT_ID = "fixture.hello";
export const T223_FIXTURE_VERSION = "0.1.0";
export const T223_FIXTURE_PACKAGE_NAME =
  "@abiogenesis-fixtures/t223-hello-world-catalog";
export const T223_FIXTURE_GRAPH_HANDLE =
  "graph-function://fixture/hello-world";
export const T223_FIXTURE_NODE_HANDLE =
  "node-type://fixture/hello-input";
export const T223_FIXTURE_OVERLAY_HANDLE = "overlay://fixture/default";
export const T223_FIXTURE_INTERFACE_REF =
  "interface://fixture/hello-world/v1";

const ZERO_DIGEST = `sha256:${"0".repeat(64)}`;
const MODULE_PATH = "catalog/hello-world.module.json";
const OVERLAY_PATH = "catalog/default-overlay.json";
const CATALOG_PATH = "contracts/public-contract-catalog.json";
const CATALOG_SCHEMA_PATH =
  "contracts/public-contract-catalog.schema.json";
const INPUT_SCHEMA_PATH = "contracts/hello-input.schema.json";
const OUTPUT_SCHEMA_PATH = "contracts/hello-output.schema.json";
const INTERFACE_PATH = "contracts/hello-world.interface.json";
const OVERLAY_SCHEMA_PATH =
  "contracts/catalog-overlay-declaration.schema.json";
const MANIFEST_PATH = "product-toolchain-manifest.json";

const FIXTURE_CONTRACTS = Object.freeze({
  input: "fixture.contract.hello-input",
  output: "fixture.contract.hello-output",
  overlaySchema: "fixture.contract.catalog-overlay-declaration"
});
const INVOKE_CAPABILITY =
  "abg.capability.catalog.invoke-graph-function@5";
const HELLO_PROGRAM_REF = "program://fixture/hello-world/input-to-output";
const HELLO_INSTRUCTION_CATEGORY_REF =
  "instruction-section://fixture/hello-world/transform";
const HELLO_INSTRUCTION_PROTOCOL_REF =
  "instruction-protocol://fixture/hello-world/transform";
const HELLO_DERIVED_EXECUTION_CONTEXT_SCHEMA_REF =
  "abg.schema.execution-context-projection@5";
const HELLO_INSTRUCTION_CONTENT =
  "Construct the declared Hello World output from the admitted greeting and return only the declared result contract.";

function taggedObject(value) {
  return Object.freeze({
    kind: "object",
    entries: Object.freeze(Object.entries(value).map(([key, item]) =>
      Object.freeze({ key, value: item })
    ))
  });
}

function taggedRows(rows) {
  return Object.freeze({
    kind: "array",
    items: Object.freeze(rows.map(taggedObject))
  });
}

function helloCarrier(node) {
  return cInterfaceCarrier(
    typedInterface(typedNode({ node, decode: (raw) => raw }))
  );
}

function helloProgram(input, output) {
  const inputCarrier = helloCarrier(input);
  const outputCarrier = helloCarrier(output);
  const stage = ({ stageRole, fibre, armId, resultBearing = false }) =>
    C.of({
      input: stageRole === "transform" ? inputCarrier : outputCarrier,
      output: outputCarrier,
      stageRole,
      fibre,
      armId,
      resultBearing,
      ...(stageRole === "transform" && fibre === "F_P"
        ? { instructionCategoryRefs: [HELLO_INSTRUCTION_CATEGORY_REF] }
        : {})
    });
  return declareCProgram({
    programRef: HELLO_PROGRAM_REF,
    term: C.compose(
      C.compose(
        stage({
          stageRole: "transform",
          fibre: "F_P",
          armId: "arm://fixture/hello-world/transform/fp",
          resultBearing: true
        }),
        stage({
          stageRole: "evaluate",
          fibre: "F_D",
          armId: "arm://fixture/hello-world/evaluate/fd"
        })
      ),
      C.compose(
        stage({
          stageRole: "evaluate",
          fibre: "F_P",
          armId: "arm://fixture/hello-world/evaluate/fp"
        }),
        stage({
          stageRole: "consequence",
          fibre: "F_D",
          armId: "arm://fixture/hello-world/consequence/fd"
        })
      )
    ),
    proportionalityClass: "P1"
  });
}

const HELLO_VECTOR_OPERATORS = Object.freeze([
  Object.freeze({
    name: "fixture_hello_probabilistic",
    regime: "F_P",
    binding: "binding://fixture/hello-world/operator/fp",
    tags: Object.freeze(["t223", "hello-world"])
  }),
  Object.freeze({
    name: "fixture_hello_deterministic",
    regime: "F_D",
    binding: "binding://fixture/hello-world/operator/fd",
    tags: Object.freeze(["t223", "hello-world"])
  })
]);

function sha256(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function canonicalBytes(value) {
  return Buffer.from(canonicalizeIJson(value), "utf8");
}

function canonicalSemverArgument(value) {
  if (
    typeof value !== "string" ||
    !/^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/u.test(
      value
    )
  ) {
    throw new TypeError(`--abg-version must be an exact SemVer, received ${JSON.stringify(value)}`);
  }
  return value;
}

function assetSurface(kind, schemaRef) {
  return Object.freeze({
    kind,
    requiredContexts: Object.freeze([]),
    standardsRefs: Object.freeze([
      "specification/requirements/product/REQ-P-CATALOG.md"
    ]),
    outputContractRefs: Object.freeze([schemaRef]),
    constructorRefs: Object.freeze([]),
    constructorInputAssetKinds: Object.freeze([]),
    rendererRefs: Object.freeze([]),
    renderedViewDigestPolicyRef: null,
    sectionKindRefs: Object.freeze([]),
    clauseKindRefs: Object.freeze([]),
    authoritySlots: Object.freeze([]),
    proofObligationRefs: Object.freeze([
      `proof://fixture/hello-world/${kind}`
    ])
  });
}

function helloNode(name, schemaRef, typeRef = null) {
  return constructNode({
    name,
    schema: { kind: "symbolic", ref: schemaRef },
    typeRef,
    markov: ["catalog:ready"],
    assetSurface: assetSurface(name.toLowerCase(), schemaRef),
    tags: ["t223", "hello-world"],
    id: `node://fixture/hello-world/${name.toLowerCase()}`
  });
}

function helloDerivedExecutionContextNode() {
  return constructNode({
    name: "HelloFpExecutionContext",
    schema: {
      kind: "symbolic",
      ref: HELLO_DERIVED_EXECUTION_CONTEXT_SCHEMA_REF
    },
    typeRef: null,
    markov: ["catalog:ready"],
    assetSurface: {
      kind: "abg_execution_context_projection",
      requiredContexts: [],
      standardsRefs: ["REQ-R-ABG3-INSTRUCTION-ASSEMBLY"],
      outputContractRefs: [HELLO_DERIVED_EXECUTION_CONTEXT_SCHEMA_REF],
      constructorRefs: [],
      constructorInputAssetKinds: [],
      rendererRefs: [],
      renderedViewDigestPolicyRef: null,
      sectionKindRefs: [],
      clauseKindRefs: [],
      authoritySlots: [],
      proofObligationRefs: [
        "proof://fixture/hello-world/fp-execution-context"
      ]
    },
    tags: ["t223", "hello-world", "runtime-projection"],
    id: "node://fixture/hello-world/fp-execution-context"
  });
}

function helloInstructionAssetNode() {
  return constructNode({
    name: "HelloTransformInstruction",
    schema: {
      kind: "runtime_ref",
      ref: "schema://fixture/hello-world/instruction/transform"
    },
    typeRef: "type://fixture/hello-world/instruction/transform",
    markov: ["catalog:ready"],
    assetSurface: {
      kind: "fixture_hello_world_transform_instruction",
      requiredContexts: [],
      standardsRefs: ["REQ-R-ABG3-INSTRUCTION-ASSEMBLY"],
      outputContractRefs: [
        "contract://fixture/hello-world/instruction/transform"
      ],
      constructorRefs: [
        "constructor://fixture/hello-world/instruction/transform"
      ],
      constructorInputAssetKinds: ["hello_world_input"],
      rendererRefs: ["renderer://abg/instruction/prompt-manifest"],
      renderedViewDigestPolicyRef:
        "policy://abg/instruction/rendered-view-digest",
      sectionKindRefs: ["section-kind://abg/instruction/context"],
      clauseKindRefs: ["clause-kind://abg/instruction/constraint"],
      authoritySlots: [
        {
          authorityKindRef: "authority://fixture/hello-world/declaration",
          disposition: "bounded_fallback",
          fallbackPreconditionRefs: [
            "precondition://fixture/hello-world/declaration-admitted"
          ]
        }
      ],
      proofObligationRefs: [
        "proof://fixture/hello-world/instruction/transform"
      ]
    },
    tags: ["t223", "hello-world", "instruction-asset"],
    id: "node://fixture/hello-world/instruction/transform"
  });
}

function helloExecutionContextProjectionRule(sourceNodeRef) {
  return constructExecutionContextProjectionRule({
    projectionRef: "execution-context-projection://fixture/hello-world/fp",
    version: "1.0.0",
    sourceNodeRef,
    source: {
      kind: "derived_runtime_projection",
      projectionClass: "fp_execution_context"
    },
    fieldRows: [
      {
        slot: "role_or_worker_selection_ref",
        fieldPath: "fields.role_or_worker_selection_ref",
        valueKind: "ref",
        required: true
      },
      {
        slot: "configuration_digest",
        fieldPath: "fields.configuration_digest",
        valueKind: "digest",
        required: true
      },
      {
        slot: "instruction_protocol_ref",
        fieldPath: "fields.instruction_protocol_ref",
        valueKind: "ref",
        required: true
      },
      {
        slot: "result_contract_ref",
        fieldPath: "fields.result_contract_ref",
        valueKind: "ref",
        required: true
      },
      {
        slot: "capability_requirement_refs",
        fieldPath: "fields.capability_requirement_refs",
        valueKind: "ref_list",
        required: true
      }
    ],
    policyRefs: ["policy://fixture/hello-world/execution-context"]
  });
}

function helloInstructionProtocolRule(instructionAssetNodeRef) {
  return constructInstructionProtocolRule({
    instructionProtocolRef: HELLO_INSTRUCTION_PROTOCOL_REF,
    version: "1.0.0",
    instructionAssetNodeRef,
    allowedStageRoles: ["transform"],
    sections: [
      {
        sectionRef: HELLO_INSTRUCTION_CATEGORY_REF,
        sectionKindRef: "section-kind://abg/instruction/context",
        content: HELLO_INSTRUCTION_CONTENT,
        contentDigest: sha256(Buffer.from(HELLO_INSTRUCTION_CONTENT, "utf8")),
        required: true,
        policyRefs: ["policy://fixture/hello-world/instruction/full-content"]
      }
    ],
    relevancePolicies: [
      {
        policyRef: "relevance://fixture/hello-world/selected-vector-source",
        mode: "selected_vector_source_closure"
      }
    ],
    compressionPolicy: {
      policyRef: "policy://fixture/hello-world/instruction/compression",
      mode: "full_admitted_content"
    },
    proportionalityPolicyRef:
      "policy://fixture/hello-world/instruction/proportionality",
    runtimeBindingSlotClasses: ["source_node"],
    policyRefs: ["policy://fixture/hello-world/instruction"]
  });
}

function compactGraphFunctionIdentity(graphFunction, graphId, graphFunctionId) {
  if (graphFunction.template.kind !== "inline_graph") {
    throw new TypeError("Hello World declarations require an inline graph");
  }
  const graph = constructGraph({
    ...graphFunction.template.graph,
    id: graphId
  });
  return constructGraphFunction({
    ...graphFunction,
    id: graphFunctionId,
    template: constructTemplateRef({
      ...graphFunction.template,
      graph
    })
  });
}

export function buildT223HelloWorldModule(options = {}) {
  const graphFunctionHandle =
    options.shadowSystemGraphFunctionHandle ?? T223_FIXTURE_GRAPH_HANDLE;
  if (
    typeof graphFunctionHandle !== "string" ||
    !graphFunctionHandle.startsWith("graph-function://")
  ) {
    throw new TypeError(
      "shadowSystemGraphFunctionHandle must be a canonical GraphFunction handle"
    );
  }
  const input = helloNode("HelloInput", FIXTURE_CONTRACTS.input);
  const output = helloNode("HelloOutput", FIXTURE_CONTRACTS.output);
  const derivedExecutionContext = helloDerivedExecutionContextNode();
  const instructionAsset = helloInstructionAssetNode();
  const privateDeclarationGraph = constructGraph({
    name: "fixture.hello-world.private-declarations",
    inputs: [],
    outputs: [],
    nodes: [derivedExecutionContext, instructionAsset],
    vectors: [],
    contexts: [],
    rules: [],
    effects: [],
    tags: ["t223", "hello-world", "declaration-only"],
    id: "graph://fixture/hello-world/private-declarations"
  });
  const projectionRule = helloExecutionContextProjectionRule(
    derivedExecutionContext.id
  );
  const protocolRule = helloInstructionProtocolRule(instructionAsset.id);
  const program = helloProgram(input, output);
  const vector = edge([input], output, {
    name: "hello-input-to-output",
    id: "graph-vector://fixture/hello-world/input-to-output",
    operators: HELLO_VECTOR_OPERATORS,
    declarations: graphVectorDeclarations([
      hogProgramRefDeclarationEntry(program.programRef)
    ]),
    tags: ["t223", "hello-world"]
  }).vectors[0];
  if (vector === undefined) {
    throw new TypeError("Hello World edge did not materialize one vector");
  }
  const graphFunction = compactGraphFunctionIdentity(
    graphFunctionForVector(vector, {
      name: graphFunctionHandle,
      declarations: graphFunctionDeclarations([
        cProgramCatalogDeclarationEntry([program]),
        ...constructAbgFnCompositionDeclarations({
          contractRef: "abg.fn_composition://fixture/hello-world",
          hookRef: "hook://fixture/hello-world/composition",
          hostGraphFunctionRef: graphFunctionHandle,
          hostGraphVectorRef: vector.id,
          hostSourceNodeRefs: [input.id],
          hostTargetNodeRef: output.id,
          hostTargetSchemaRef: output.schema.ref,
          owningDeclarationRef: abgFnCompositionDeclarationRef({
            source: "graph_function_declarations",
            sourceRef: graphFunctionHandle
          }),
          regimes: [
            {
              bindingRef:
                "regime-binding://fixture/hello-world/transform/fp",
              stageRole: "transform",
              regime: "F_P",
              role: "construct",
              order: 0,
              authority: "evidence",
              inputCarrierRefs: ["EnginePluginInput"],
              outputCarrierRefs: ["FpDispatchOutcome"],
              evidenceRefs: ["evidence://fixture/hello-world/fp-dispatch"]
            },
            {
              bindingRef:
                "regime-binding://fixture/hello-world/evaluate/fd",
              stageRole: "evaluate",
              regime: "F_D",
              role: "validate",
              order: 1,
              authority: "closure",
              inputCarrierRefs: ["EnginePluginInput"],
              outputCarrierRefs: ["FdEvaluationOutcome"],
              evidenceRefs: ["evidence://fixture/hello-world/fd"]
            },
            {
              bindingRef:
                "regime-binding://fixture/hello-world/evaluate/fp",
              stageRole: "evaluate",
              regime: "F_P",
              role: "validate",
              order: 2,
              authority: "judgment",
              inputCarrierRefs: ["EnginePluginInput"],
              outputCarrierRefs: ["FpEvaluationOutcome"],
              evidenceRefs: ["evidence://fixture/hello-world/fp-evaluate"]
            },
            {
              bindingRef:
                "regime-binding://fixture/hello-world/consequence/fd",
              stageRole: "consequence",
              regime: "F_D",
              role: "observe",
              order: 3,
              authority: "evidence",
              inputCarrierRefs: ["EnginePluginInput"],
              outputCarrierRefs: ["ConsequenceProjectionOutcome"],
              evidenceRefs: ["evidence://fixture/hello-world/consequence"]
            }
          ],
          standardsContextRefs: [
            "specification/requirements/product/REQ-P-CATALOG.md"
          ],
          policyContextRefs: ["policy://fixture/default"],
          carrierContextRefs: [T223_FIXTURE_INTERFACE_REF],
          assuranceContextRefs: ["proof://fixture/hello-world/declared"],
          closureContractRef: "closure://fixture/hello-world/fd-evaluate"
        }).entries,
        pluginSelectionDeclarationEntry({
          fdEvaluator: "plugin://abg/fd-evaluator",
          fpDispatch: "plugin://abg/fp-dispatch-live",
          fpEvaluator: "plugin://abg/fp-evaluator-live"
        })
      ]),
      tags: ["t223", "hello-world"]
    }),
    "graph://fixture/hello-world",
    graphFunctionHandle
  );
  const nodeType = compactGraphFunctionIdentity(constructNodeTypeGraphFunction(
    helloNode(
      "HelloInputType",
      FIXTURE_CONTRACTS.input,
      T223_FIXTURE_NODE_HANDLE
    ),
    { tags: ["t223", "hello-world"] }
  ), "graph://fixture/hello-input-type", T223_FIXTURE_NODE_HANDLE);
  const privateInstructionType = compactGraphFunctionIdentity(
    constructNodeTypeGraphFunction(instructionAsset, {
      tags: ["t223", "hello-world", "private-declaration"]
    }),
    "graph://fixture/hello-world/instruction/transform",
    "node-type://fixture/hello-world/instruction/transform"
  );
  const nodeTypeInput = nodeType.inputs[0];
  if (nodeTypeInput === undefined) {
    throw new TypeError("Hello input NodeType has no admitted input Node");
  }
  const runtimeSchemaRows = canonicalizeRuntimeSchemaAdmissionMetadataRows([
    {
      graphFunctionId: graphFunction.id,
      nodeRef: input.id,
      symbolicSchemaRef: input.schema.ref,
      contractId: FIXTURE_CONTRACTS.input,
      contractVersion: T223_FIXTURE_VERSION
    },
    {
      graphFunctionId: graphFunction.id,
      nodeRef: output.id,
      symbolicSchemaRef: output.schema.ref,
      contractId: FIXTURE_CONTRACTS.output,
      contractVersion: T223_FIXTURE_VERSION
    },
    {
      graphFunctionId: nodeType.id,
      nodeRef: nodeTypeInput.id,
      symbolicSchemaRef: nodeTypeInput.schema.ref,
      contractId: FIXTURE_CONTRACTS.input,
      contractVersion: T223_FIXTURE_VERSION
    }
  ]);
  const role = constructRole({
    name: "fixture_hello_role",
    tags: ["t223", "hello-world"],
    policyHooks: emptySerializedAttrs(),
    id: "role://fixture/hello-world"
  });
  const job = constructJob({
    name: "fixture_hello_job",
    contracts: [
      constructContractRef({
        kind: "graph_function",
        targetId: graphFunction.id
      })
    ],
    roles: [role],
    tags: ["t223", "hello-world"],
    policyHooks: emptySerializedAttrs(),
    id: "job://fixture/hello-world"
  });
  return serializeModule(
    constructModule({
      name: "fixture-hello-world",
      graphs: [privateDeclarationGraph],
      graphFunctions: [graphFunction, nodeType, privateInstructionType],
      refinementBoundaries: [],
      candidateFamilies: [],
      jobs: [job],
      roles: [role],
      operators: [],
      evaluators: [],
      rules: [projectionRule, protocolRule],
      imports: [],
      policyHooks: emptySerializedAttrs(),
      metadata: {
        entries: [{
          key: RUNTIME_SCHEMA_ADMISSION_METADATA_KEY,
          value: { kind: "json_blob", value: taggedRows(runtimeSchemaRows) }
        }]
      }
    })
  );
}

function schemas() {
  const input = {
    $id: "fixture.schema.hello-input",
    $schema: "https://json-schema.org/draft/2020-12/schema",
    additionalProperties: false,
    properties: {
      greeting: { minLength: 1, type: "string" }
    },
    required: ["greeting"],
    type: "object"
  };
  const output = {
    $id: "fixture.schema.hello-output",
    $schema: "https://json-schema.org/draft/2020-12/schema",
    additionalProperties: false,
    properties: {
      message: { minLength: 1, type: "string" }
    },
    required: ["message"],
    type: "object"
  };
  const overlay = {
    $id: "abg.schema.catalog-overlay-declaration",
    $schema: "https://json-schema.org/draft/2020-12/schema",
    additionalProperties: false,
    properties: {
      graphFunctionRefs: {
        items: { minLength: 1, type: "string" },
        minItems: 1,
        type: "array",
        uniqueItems: true
      },
      kind: { const: "catalog_overlay_declaration" },
      overlayRef: { minLength: 1, type: "string" },
      policyRefs: {
        items: { minLength: 1, type: "string" },
        type: "array",
        uniqueItems: true
      },
      provenanceRefs: {
        items: { minLength: 1, type: "string" },
        minItems: 1,
        type: "array",
        uniqueItems: true
      },
      schemaVersion: { const: 1 }
    },
    required: [
      "kind",
      "schemaVersion",
      "overlayRef",
      "graphFunctionRefs",
      "policyRefs",
      "provenanceRefs"
    ],
    type: "object"
  };
  const catalog = {
    $id: "fixture.schema.public-contract-catalog",
    $schema: "https://json-schema.org/draft/2020-12/schema",
    additionalProperties: false,
    properties: {
      catalogDigest: { pattern: "^sha256:[0-9a-f]{64}$", type: "string" },
      catalogId: { minLength: 1, type: "string" },
      catalogSchemaDigest: {
        pattern: "^sha256:[0-9a-f]{64}$",
        type: "string"
      },
      catalogSchemaPath: { minLength: 1, type: "string" },
      catalogVersion: { const: T223_FIXTURE_VERSION },
      kind: { const: "abg_public_contract_catalog" },
      profile: { const: "catalog-product-v1" },
      rows: { minItems: 1, type: "array" },
      schemaVersion: { const: 1 }
    },
    required: [
      "kind",
      "schemaVersion",
      "catalogId",
      "catalogVersion",
      "catalogDigest",
      "catalogSchemaPath",
      "catalogSchemaDigest",
      "profile",
      "rows"
    ],
    type: "object"
  };
  return Object.freeze({ input, output, overlay, catalog });
}

function publicContractRow({ contractId, relativePath, schemaId, bytes }) {
  const digest = sha256(bytes);
  return Object.freeze({
    contractId,
    contractKind: "schema_asset",
    owningProductId: T223_FIXTURE_PRODUCT_ID,
    version: T223_FIXTURE_VERSION,
    digest,
    authorityRefs: ["fixture://t223/hello-world"],
    capabilityRefs: [],
    nativeLocator: null,
    assetLocator: {
      kind: "asset",
      relativePath,
      schemaId,
      schemaVersion: "1.0.0",
      mediaType: "application/schema+json",
      digest
    },
    operationContract: null
  });
}

function productContentDigest(files) {
  const inventory = [...files.entries()]
    .map(([relativePath, bytes]) => [relativePath, sha256(bytes)])
    .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0));
  return digestCanonicalIJson(inventory);
}

async function writeProductFiles(packageRoot, graphFunctionHandle) {
  const declaredSchemas = schemas();
  const module = buildT223HelloWorldModule({
    ...(graphFunctionHandle === T223_FIXTURE_GRAPH_HANDLE
      ? {}
      : { shadowSystemGraphFunctionHandle: graphFunctionHandle })
  });
  const overlay = {
    kind: "catalog_overlay_declaration",
    schemaVersion: 1,
    overlayRef: T223_FIXTURE_OVERLAY_HANDLE,
    graphFunctionRefs: [graphFunctionHandle],
    policyRefs: ["policy://fixture/default"],
    provenanceRefs: ["fixture://t223/hello-world"]
  };
  const packageMetadata = {
    name: T223_FIXTURE_PACKAGE_NAME,
    version: T223_FIXTURE_VERSION,
    private: true,
    description: "T-223 declarations-only Hello World catalog proof fixture",
    files: ["catalog", "contracts", MANIFEST_PATH]
  };
  const inputSchemaBytes = canonicalBytes(declaredSchemas.input);
  const outputSchemaBytes = canonicalBytes(declaredSchemas.output);
  const overlaySchemaBytes = canonicalBytes(declaredSchemas.overlay);
  const catalogSchemaBytes = canonicalBytes(declaredSchemas.catalog);
  const interfaceAsset = {
    kind: "graph_function_interface",
    schemaVersion: 1,
    interfaceRef: T223_FIXTURE_INTERFACE_REF,
    graphFunctionRef: graphFunctionHandle,
    inputSchema: {
      contractRef: FIXTURE_CONTRACTS.input,
      digest: sha256(inputSchemaBytes),
      path: INPUT_SCHEMA_PATH
    },
    outputSchema: {
      contractRef: FIXTURE_CONTRACTS.output,
      digest: sha256(outputSchemaBytes),
      path: OUTPUT_SCHEMA_PATH
    }
  };
  const interfaceBytes = canonicalBytes(interfaceAsset);
  const files = new Map([
    ["package.json", canonicalBytes(packageMetadata)],
    [MODULE_PATH, canonicalBytes(module)],
    [OVERLAY_PATH, canonicalBytes(overlay)],
    [INPUT_SCHEMA_PATH, inputSchemaBytes],
    [OUTPUT_SCHEMA_PATH, outputSchemaBytes],
    [INTERFACE_PATH, interfaceBytes],
    [OVERLAY_SCHEMA_PATH, overlaySchemaBytes],
    [CATALOG_SCHEMA_PATH, catalogSchemaBytes]
  ]);
  const rows = [
    publicContractRow({
      contractId: FIXTURE_CONTRACTS.input,
      relativePath: INPUT_SCHEMA_PATH,
      schemaId: "fixture.schema.hello-input",
      bytes: inputSchemaBytes
    }),
    publicContractRow({
      contractId: FIXTURE_CONTRACTS.output,
      relativePath: OUTPUT_SCHEMA_PATH,
      schemaId: "fixture.schema.hello-output",
      bytes: outputSchemaBytes
    }),
    publicContractRow({
      contractId: FIXTURE_CONTRACTS.overlaySchema,
      relativePath: OVERLAY_SCHEMA_PATH,
      schemaId: "abg.schema.catalog-overlay-declaration",
      bytes: overlaySchemaBytes
    })
  ];
  const catalogWithoutDigest = {
    kind: "abg_public_contract_catalog",
    schemaVersion: 1,
    catalogId: "catalog://fixture/hello-world/0.1.0",
    catalogVersion: T223_FIXTURE_VERSION,
    catalogDigest: ZERO_DIGEST,
    catalogSchemaPath: CATALOG_SCHEMA_PATH,
    catalogSchemaDigest: sha256(catalogSchemaBytes),
    profile: "catalog-product-v1",
    rows
  };
  const catalog = Object.freeze({
    ...catalogWithoutDigest,
    catalogDigest: publicContractCatalogDigest(catalogWithoutDigest)
  });
  files.set(CATALOG_PATH, canonicalBytes(catalog));
  const contentDigest = productContentDigest(files);
  const manifest = {
    kind: "abg_product_toolchain_manifest",
    schemaVersion: 1,
    publisher: "fixture",
    productId: T223_FIXTURE_PRODUCT_ID,
    packageName: T223_FIXTURE_PACKAGE_NAME,
    packageVersion: T223_FIXTURE_VERSION,
    productContentDigest: contentDigest,
    publicContractCatalogPath: CATALOG_PATH,
    publicContractCatalogDigest: catalog.catalogDigest,
    publicContractCatalog: catalog,
    runtimeSystemProfile: null,
    productRelativeLocators: [...files.keys()].sort()
  };
  files.set(MANIFEST_PATH, canonicalBytes(manifest));

  for (const [relativePath, bytes] of files) {
    const target = path.join(packageRoot, relativePath);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, bytes);
  }
  return Object.freeze({
    catalog,
    contentDigest,
    manifest,
    module,
    overlay,
    files
  });
}

function packNpmPackage(packageRoot, artifactRoot) {
  const result = spawnSync(
    "npm",
    [
      "pack",
      packageRoot,
      "--json",
      "--ignore-scripts",
      "--pack-destination",
      artifactRoot
    ],
    {
      encoding: "utf8",
      env: { ...process.env, COPYFILE_DISABLE: "1", LC_ALL: "C" }
    }
  );
  if (result.status !== 0) {
    throw new TypeError(`npm pack failed: ${result.stderr || result.stdout}`);
  }
  const report = JSON.parse(result.stdout);
  const filename = report[0]?.filename;
  if (typeof filename !== "string" || filename.length === 0) {
    throw new TypeError("npm pack did not report one artifact filename");
  }
  return path.join(artifactRoot, filename);
}

function dependency(abgVersion) {
  return Object.freeze({
    productId: "abiogenesis",
    versionConstraint: abgVersion,
    requiredContractRefs: [
      "abg.contract.gtl.m01",
      "abg.contract.gtl.m02"
    ],
    requiredCapabilityRefs: [
      "abg.capability.gtl.admit@5",
      "abg.capability.module.publish@5",
      "abg.capability.catalog.invoke-graph-function@5"
    ]
  });
}

function contributionRow(input, abgVersion, digests) {
  const common = {
    canonicalHandle: input.handle,
    publicKind: input.kind,
    ownerProductId: T223_FIXTURE_PRODUCT_ID,
    ownerVersion: T223_FIXTURE_VERSION,
    declarationRef: input.declarationRef,
    contractRef: input.contractRef,
    interfaceRef: input.kind === "overlay" ? null : input.interfaceRef,
    compatibility: {
      abgVersionRange: abgVersion,
      requiredProductRefs: ["abiogenesis"],
      requiredContractRefs: [
        "abg.contract.gtl.m01",
        "abg.contract.gtl.m02"
      ],
      requiredCapabilityRefs: [
        "abg.capability.gtl.admit@5",
        "abg.capability.module.publish@5",
        "abg.capability.catalog.invoke-graph-function@5"
      ]
    },
    readinessRefs: ["readiness://fixture/hello-world/declared"],
    proofRefs: ["proof://fixture/hello-world/declared"],
    policyRefs: ["policy://fixture/default"],
    capabilityRefs:
      input.kind === "graph_function" ? [INVOKE_CAPABILITY] : [],
    provenanceRefs: ["fixture://t223/hello-world"],
    refinementOfHandle: null,
    overrideOfHandle: null
  };
  if (input.kind === "overlay") {
    return Object.freeze({
      ...common,
      locator: {
        kind: "opaque_overlay_asset",
        assetPath: OVERLAY_PATH,
        schemaId: "abg.schema.catalog-overlay-declaration",
        schemaVersion: "1.0.0",
        schemaDigest: digests.overlaySchema,
        assetDigest: digests.overlay
      }
    });
  }
  return Object.freeze({
    ...common,
    locator: {
      kind: "module_declaration",
      modulePath: MODULE_PATH,
      moduleDigest: digests.module,
      declarationRef: input.declarationRef
    }
  });
}

async function writeSidecars(input) {
  const artifactBytes = await readFile(input.artifactPath);
  const artifactDigest = sha256(artifactBytes);
  const moduleDigest = sha256(await readFile(path.join(input.packageRoot, MODULE_PATH)));
  const overlayDigest = sha256(
    await readFile(path.join(input.packageRoot, OVERLAY_PATH))
  );
  const overlaySchemaDigest = sha256(
    await readFile(path.join(input.packageRoot, OVERLAY_SCHEMA_PATH))
  );
  const contributionWithoutDigests = {
    kind: "catalog_contribution_manifest",
    schemaVersion: 1,
    contributionId: "contribution://fixture/hello-world/0.1.0",
    contributionDigest: ZERO_DIGEST,
    descriptorId: "descriptor://fixture/hello-world/0.1.0",
    descriptorDigest: ZERO_DIGEST,
    productId: T223_FIXTURE_PRODUCT_ID,
    productVersion: T223_FIXTURE_VERSION,
    artifactDigest,
    rows: [
      contributionRow(
        {
          handle: input.graphFunctionHandle,
          kind: "graph_function",
          declarationRef: input.graphFunctionHandle,
          contractRef: FIXTURE_CONTRACTS.input,
          interfaceRef: T223_FIXTURE_INTERFACE_REF
        },
        input.abgVersion,
        {
          module: moduleDigest,
          overlay: overlayDigest,
          overlaySchema: overlaySchemaDigest
        }
      ),
      contributionRow(
        {
          handle: T223_FIXTURE_NODE_HANDLE,
          kind: "node_type",
          declarationRef: T223_FIXTURE_NODE_HANDLE,
          contractRef: FIXTURE_CONTRACTS.input,
          interfaceRef: "interface://fixture/hello-input/v1"
        },
        input.abgVersion,
        {
          module: moduleDigest,
          overlay: overlayDigest,
          overlaySchema: overlaySchemaDigest
        }
      ),
      contributionRow(
        {
          handle: T223_FIXTURE_OVERLAY_HANDLE,
          kind: "overlay",
          declarationRef: T223_FIXTURE_OVERLAY_HANDLE,
          contractRef: FIXTURE_CONTRACTS.overlaySchema,
          interfaceRef: null
        },
        input.abgVersion,
        {
          module: moduleDigest,
          overlay: overlayDigest,
          overlaySchema: overlaySchemaDigest
        }
      )
    ]
  };
  const contributionDigest = contributionManifestDigest(
    contributionWithoutDigests
  );
  const descriptorWithoutDigest = {
    kind: "catalog_product_descriptor",
    schemaVersion: 1,
    descriptorId: "descriptor://fixture/hello-world/0.1.0",
    descriptorDigest: ZERO_DIGEST,
    publisher: "fixture",
    productId: T223_FIXTURE_PRODUCT_ID,
    packageName: T223_FIXTURE_PACKAGE_NAME,
    version: T223_FIXTURE_VERSION,
    distributionArtifactDigest: artifactDigest,
    productContentDigest: input.product.contentDigest,
    contributionManifestId: contributionWithoutDigests.contributionId,
    contributionManifestDigest: contributionDigest,
    dependencies: [dependency(input.abgVersion)],
    abgCompatibility: input.abgVersion,
    contractRefs: Object.values(FIXTURE_CONTRACTS).sort(),
    capabilityRefs: [],
    provenanceRefs: ["fixture://t223/hello-world"]
  };
  const descriptor = Object.freeze({
    ...descriptorWithoutDigest,
    descriptorDigest: descriptorDigest(descriptorWithoutDigest)
  });
  const contribution = Object.freeze({
    ...contributionWithoutDigests,
    contributionDigest,
    descriptorDigest: descriptor.descriptorDigest
  });
  const sidecarRoot = path.join(input.root, "sidecars");
  await mkdir(sidecarRoot, { recursive: true });
  await writeFile(
    path.join(sidecarRoot, "product-descriptor.json"),
    canonicalBytes(descriptor)
  );
  await writeFile(
    path.join(sidecarRoot, "contribution-manifest.json"),
    canonicalBytes(contribution)
  );
  return Object.freeze({ artifactDigest, contribution, descriptor });
}

export async function generateT223HelloWorldFixture(input) {
  const abgVersion = canonicalSemverArgument(input.abgVersion);
  const graphFunctionHandle =
    input.shadowSystemGraphFunctionHandle ?? T223_FIXTURE_GRAPH_HANDLE;
  if (
    typeof graphFunctionHandle !== "string" ||
    !graphFunctionHandle.startsWith("graph-function://")
  ) {
    throw new TypeError(
      "shadowSystemGraphFunctionHandle must be a canonical GraphFunction handle"
    );
  }
  const root = path.resolve(input.root);
  await rm(root, { recursive: true, force: true });
  const packageRoot = path.join(root, "package");
  const artifactRoot = path.join(root, ".artifacts");
  await mkdir(artifactRoot, { recursive: true });
  const product = await writeProductFiles(packageRoot, graphFunctionHandle);
  const artifactPath = packNpmPackage(packageRoot, artifactRoot);
  const sidecars = await writeSidecars({
    abgVersion,
    artifactPath,
    graphFunctionHandle,
    packageRoot,
    product,
    root
  });
  return Object.freeze({
    abgVersion,
    artifactPath,
    packageRoot,
    product,
    root,
    sidecars
  });
}

async function fileTable(root, prefix = "") {
  const rows = [];
  for (const entry of await readdir(path.join(root, prefix), {
    withFileTypes: true
  })) {
    const relativePath = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== ".artifacts") {
        rows.push(...(await fileTable(root, relativePath)));
      }
      continue;
    }
    if (!entry.isFile()) {
      throw new TypeError(`fixture contains a non-file entry: ${relativePath}`);
    }
    rows.push(relativePath);
  }
  return rows.sort();
}

export async function checkT223HelloWorldFixture(input) {
  const temporaryRoot = await mkdtemp(
    path.join(tmpdir(), "abg-t223-hello-fixture-check-")
  );
  try {
    const generated = await generateT223HelloWorldFixture({
      root: path.join(temporaryRoot, "fixture"),
      abgVersion: input.abgVersion
    });
    const expectedFiles = await fileTable(input.root);
    const actualFiles = await fileTable(generated.root);
    if (canonicalizeIJson(expectedFiles) !== canonicalizeIJson(actualFiles)) {
      throw new TypeError(
        `fixture census mismatch: expected ${JSON.stringify(expectedFiles)}, generated ${JSON.stringify(actualFiles)}`
      );
    }
    for (const relativePath of expectedFiles) {
      const expected = await readFile(path.join(input.root, relativePath));
      const actual = await readFile(path.join(generated.root, relativePath));
      if (!expected.equals(actual)) {
        throw new TypeError(`fixture drift: ${relativePath}`);
      }
    }
    return generated;
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

function argumentValue(args, flag) {
  const index = args.indexOf(flag);
  return index === -1 ? null : args[index + 1] ?? null;
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (command !== "generate" && command !== "check" && command !== "pack") {
    throw new TypeError(
      "usage: t223_hello_world_fixture.mjs generate|check|pack --abg-version <version> [--output <path>]"
    );
  }
  const abgVersion = argumentValue(args, "--abg-version");
  if (abgVersion === null) {
    throw new TypeError("--abg-version is required");
  }
  if (command === "generate") {
    const generated = await generateT223HelloWorldFixture({
      root: T223_FIXTURE_ROOT,
      abgVersion
    });
    await rm(path.join(generated.root, ".artifacts"), {
      recursive: true,
      force: true
    });
    return;
  }
  if (command === "check") {
    await checkT223HelloWorldFixture({
      root: T223_FIXTURE_ROOT,
      abgVersion
    });
    return;
  }
  const output = argumentValue(args, "--output");
  if (output === null) {
    throw new TypeError("pack requires --output");
  }
  const temporaryRoot = await mkdtemp(
    path.join(tmpdir(), "abg-t223-hello-fixture-pack-")
  );
  try {
    const generated = await generateT223HelloWorldFixture({
      root: path.join(temporaryRoot, "fixture"),
      abgVersion
    });
    await mkdir(path.resolve(output), { recursive: true });
    await cp(generated.artifactPath, path.join(path.resolve(output), path.basename(generated.artifactPath)));
    await cp(
      path.join(generated.root, "sidecars"),
      path.join(path.resolve(output), "sidecars"),
      { recursive: true }
    );
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
    process.exitCode = 1;
  });
}
