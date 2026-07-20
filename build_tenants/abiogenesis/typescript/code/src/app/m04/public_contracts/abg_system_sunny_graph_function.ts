// Publishes the smallest executable ABG SYSTEM GraphFunction over existing
// public-operation schema authority. The graph owns one declared F_D C stage;
// the host implementation is only the exact deterministic identity atom.

import {
  C,
  cInterfaceCarrier,
  cProgramCatalogDeclarationEntry,
  declareCProgram,
  typedInterface,
  typedNode
} from "../../../gtl/m01/algebra/index.js";
import {
  constructEnvRef,
  constructGraph,
  constructGraphFunction,
  constructGraphVector,
  constructNode,
  constructTemplateRef,
  graphFunctionDeclarations,
  graphVectorDeclarations,
  hogHandlerBindingsDeclarationEntry,
  hogProgramRefDeclarationEntry,
  pluginSelectionDeclarationEntry
} from "../../../gtl/m01/contracts/index.js";
import {
  constructModule
} from "../../../gtl/m02/contracts/constructors.js";
import type { Module } from "../../../gtl/m02/contracts/carriers.js";
import {
  abgFnCompositionDeclarationRef,
  constructAbgFnCompositionDeclarations
} from "../../../abg/m03/contracts/fn_composition.js";
import {
  canonicalizeRuntimeSchemaAdmissionMetadataRows,
  RUNTIME_SCHEMA_ADMISSION_METADATA_KEY
} from "../../../abg/m03/contracts/runtime_schema_admission.js";
import type {
  T270CCallHandlerImplementation
} from "../../../abg/m03/runner/one_surface_execution.js";
import {
  constructCCallValueHandler
} from "../../../abg/m03/runner/c_call_handlers.js";
import {
  isPlainRecord
} from "../../../abg/m03/contracts/admission_hygiene.js";
import { admitIJsonValue } from "../../../shared/runtime_identity.js";

export const ABG_SYSTEM_SUNNY_GRAPH_FUNCTION_HANDLE =
  "graph-function://abiogenesis/system/workspace-request-identity/v1" as const;
export const ABG_SYSTEM_SUNNY_GRAPH_FUNCTION_ID =
  "graph-function-id://abiogenesis/system/workspace-request-identity/v1" as const;
export const ABG_SYSTEM_SUNNY_GRAPH_ID =
  "graph://abiogenesis/system/workspace-request-identity/v1" as const;
export const ABG_SYSTEM_SUNNY_GRAPH_VECTOR_ID =
  "graph-vector://abiogenesis/system/workspace-request-identity/v1" as const;
export const ABG_SYSTEM_SUNNY_NODE_ID =
  "node://abiogenesis/system/workspace-create-clean-request" as const;
export const ABG_SYSTEM_SUNNY_INPUT_CONTRACT_ID =
  "abg.contract.operation.workspace.create.clean.request" as const;
export const ABG_SYSTEM_SUNNY_INPUT_CONTRACT_VERSION = "5.0.0" as const;
export const ABG_SYSTEM_SUNNY_INPUT_SCHEMA_REF =
  "abg.schema.operation.workspace.create.clean.request" as const;
export const ABG_SYSTEM_SUNNY_PROGRAM_REF =
  "program://abiogenesis/system/workspace-request-identity/v1" as const;
export const ABG_SYSTEM_SUNNY_OPERATOR_BINDING_REF =
  "binding://abiogenesis/system/workspace-request-identity/v1" as const;
export const ABG_SYSTEM_SUNNY_HANDLER_REF =
  "handler://abiogenesis/system/workspace-request-identity/v1" as const;
export const ABG_SYSTEM_SUNNY_STAGE_ROLE = "identity" as const;
export const ABG_SYSTEM_SUNNY_ARM_ID =
  "arm://abiogenesis/system/workspace-request-identity/v1" as const;

type WorkspaceCreateCleanRequest = Readonly<{
  targetRoot: string;
  createPolicy: "clean";
  scaffoldPolicy: "no_scaffold";
}>;

function decodeWorkspaceCreateCleanRequest(
  raw: unknown
): WorkspaceCreateCleanRequest {
  if (
    typeof raw !== "object" ||
    raw === null ||
    Array.isArray(raw) ||
    Object.keys(raw).length !== 3 ||
    !("targetRoot" in raw) ||
    !("createPolicy" in raw) ||
    !("scaffoldPolicy" in raw) ||
    typeof raw.targetRoot !== "string" ||
    raw.createPolicy !== "clean" ||
    raw.scaffoldPolicy !== "no_scaffold"
  ) {
    throw new TypeError("workspace create clean request is malformed");
  }
  return Object.freeze({
    targetRoot: raw.targetRoot,
    createPolicy: raw.createPolicy,
    scaffoldPolicy: raw.scaffoldPolicy
  });
}

function systemSunnyNode() {
  return constructNode({
    name: "WorkspaceCreateCleanRequest",
    schema: {
      kind: "symbolic",
      ref: ABG_SYSTEM_SUNNY_INPUT_SCHEMA_REF
    },
    typeRef: null,
    markov: ["catalog:admitted", "runtime:admitted"],
    assetSurface: {
      kind: "public_operation_request",
      standardsRefs: [
        "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md"
      ],
      outputContractRefs: [ABG_SYSTEM_SUNNY_INPUT_CONTRACT_ID],
      proofObligationRefs: ["proof://t270/abg-system-fd-sunny"]
    },
    tags: ["abiogenesis", "system", "scenario09", "identity"],
    id: ABG_SYSTEM_SUNNY_NODE_ID
  });
}

function taggedRows(rows: readonly Readonly<Record<string, string>>[]) {
  return Object.freeze({
    kind: "array" as const,
    items: Object.freeze(rows.map((row) => Object.freeze({
      kind: "object" as const,
      entries: Object.freeze(Object.entries(row).map(([key, value]) =>
        Object.freeze({ key, value })
      ))
    })))
  });
}

export function buildAbgSystemSunnyGraphFunctionModule(): Module {
  const node = systemSunnyNode();
  const carrier = cInterfaceCarrier(
    typedInterface(typedNode({
      node,
      decode: decodeWorkspaceCreateCleanRequest
    }))
  );
  const program = declareCProgram({
    programRef: ABG_SYSTEM_SUNNY_PROGRAM_REF,
    term: C.of({
      input: carrier,
      output: carrier,
      stageRole: ABG_SYSTEM_SUNNY_STAGE_ROLE,
      fibre: "F_D",
      armId: ABG_SYSTEM_SUNNY_ARM_ID,
      resultBearing: true
    }),
    proportionalityClass: "P1"
  });
  const composition = constructAbgFnCompositionDeclarations({
    contractRef: `abg.fn_composition://${ABG_SYSTEM_SUNNY_GRAPH_VECTOR_ID}`,
    hookRef: `hook://${ABG_SYSTEM_SUNNY_GRAPH_VECTOR_ID}/composition`,
    hostGraphFunctionRef: ABG_SYSTEM_SUNNY_GRAPH_FUNCTION_ID,
    hostGraphVectorRef: ABG_SYSTEM_SUNNY_GRAPH_VECTOR_ID,
    hostSourceNodeRefs: [ABG_SYSTEM_SUNNY_NODE_ID],
    hostTargetNodeRef: ABG_SYSTEM_SUNNY_NODE_ID,
    hostTargetSchemaRef: ABG_SYSTEM_SUNNY_INPUT_SCHEMA_REF,
    owningDeclarationRef: abgFnCompositionDeclarationRef({
      source: "graph_vector_declarations",
      sourceRef: ABG_SYSTEM_SUNNY_GRAPH_VECTOR_ID
    }),
    regimes: [Object.freeze({
      bindingRef:
        `regime-binding://${ABG_SYSTEM_SUNNY_GRAPH_VECTOR_ID}/transform/0`,
      stageRole: "transform",
      regime: "F_D",
      role: "construct",
      order: 0,
      authority: "evidence",
      inputCarrierRefs: [ABG_SYSTEM_SUNNY_NODE_ID],
      outputCarrierRefs: [ABG_SYSTEM_SUNNY_NODE_ID],
      evidenceRefs: ["evidence://t270/abg-system-fd-sunny"]
    })],
    standardsContextRefs: ["standard://abg/one-surface"],
    policyContextRefs: ["policy://abg/system/fd-sunny"],
    carrierContextRefs: [ABG_SYSTEM_SUNNY_NODE_ID],
    assuranceContextRefs: ["assurance://abg/system/fd-sunny"],
    closureContractRef: "closure://abg/system/fd-sunny"
  });
  const operator = Object.freeze({
    name: "workspace-request-identity",
    regime: "F_D" as const,
    binding: ABG_SYSTEM_SUNNY_OPERATOR_BINDING_REF,
    tags: Object.freeze(["abiogenesis", "system", "scenario09", "identity"])
  });
  const vector = constructGraphVector({
    id: ABG_SYSTEM_SUNNY_GRAPH_VECTOR_ID,
    name: "abiogenesis.system.workspace-request-identity.vector",
    source: [node],
    target: node,
    operators: [operator],
    evaluators: [],
    contexts: [],
    rule: null,
    allowsSubwork: false,
    declarations: graphVectorDeclarations([
      hogProgramRefDeclarationEntry(ABG_SYSTEM_SUNNY_PROGRAM_REF),
      ...composition.entries
    ]),
    tags: ["abiogenesis", "system", "scenario09", "identity"]
  });
  const graph = constructGraph({
    id: ABG_SYSTEM_SUNNY_GRAPH_ID,
    name: ABG_SYSTEM_SUNNY_GRAPH_FUNCTION_HANDLE,
    inputs: [node],
    outputs: [node],
    nodes: [node],
    vectors: [vector],
    contexts: [],
    rules: [],
    effects: [],
    tags: ["abiogenesis", "system", "scenario09", "identity"]
  });
  const graphFunction = constructGraphFunction({
    id: ABG_SYSTEM_SUNNY_GRAPH_FUNCTION_ID,
    name: ABG_SYSTEM_SUNNY_GRAPH_FUNCTION_HANDLE,
    environment: constructEnvRef({
      requires: [node],
      provides: [node],
      carries: [node]
    }),
    inputs: [node],
    outputs: [node],
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: `inline:${ABG_SYSTEM_SUNNY_GRAPH_FUNCTION_HANDLE}`,
      graph,
      version: null
    }),
    effects: [],
    declarations: graphFunctionDeclarations([
      cProgramCatalogDeclarationEntry([program]),
      hogProgramRefDeclarationEntry(ABG_SYSTEM_SUNNY_PROGRAM_REF),
      hogHandlerBindingsDeclarationEntry([Object.freeze({
        programRef: ABG_SYSTEM_SUNNY_PROGRAM_REF,
        stageRole: ABG_SYSTEM_SUNNY_STAGE_ROLE,
        armId: ABG_SYSTEM_SUNNY_ARM_ID,
        regime: "F_D" as const,
        handlerRef: ABG_SYSTEM_SUNNY_HANDLER_REF,
        handlerClass: "capability" as const,
        handlerConfigRef: null
      })]),
      pluginSelectionDeclarationEntry({
        fdEvaluator: "plugin://abg/fd-evaluator"
      })
    ]),
    tags: ["abiogenesis", "system", "scenario09", "identity"]
  });
  const rows = canonicalizeRuntimeSchemaAdmissionMetadataRows([Object.freeze({
    graphFunctionId: graphFunction.id,
    nodeRef: node.id,
    symbolicSchemaRef: node.schema.ref,
    contractId: ABG_SYSTEM_SUNNY_INPUT_CONTRACT_ID,
    contractVersion: ABG_SYSTEM_SUNNY_INPUT_CONTRACT_VERSION
  })]);
  return constructModule({
    name: "abiogenesis-system-sunny-catalog",
    graphs: [graph],
    graphFunctions: [graphFunction],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [Object.freeze({
      id: "job-abiogenesis-system-workspace-request-identity-v1",
      name: "abiogenesis_system_workspace_request_identity",
      contracts: Object.freeze([Object.freeze({
        kind: "graph_function" as const,
        targetId: graphFunction.id
      })]),
      roles: Object.freeze([]),
      tags: Object.freeze(["semantic_work", "abiogenesis", "system"]),
      policyHooks: Object.freeze({ entries: Object.freeze([]) })
    })],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    policyHooks: { entries: [] },
    metadata: {
      entries: [Object.freeze({
        key: RUNTIME_SCHEMA_ADMISSION_METADATA_KEY,
        value: Object.freeze({
          kind: "json_blob" as const,
          value: taggedRows(rows)
        })
      })]
    }
  });
}

export function buildAbgSystemSunnyFdImplementation():
T270CCallHandlerImplementation {
  return Object.freeze({
    kind: "t270_c_call_handler_implementation" as const,
    handlerRef: ABG_SYSTEM_SUNNY_HANDLER_REF,
    handler: constructCCallValueHandler({
      driverRequirement: "sync_compatible",
      execute: (input) => {
        const projection = input.workProjection;
        if (
          !isPlainRecord(projection) ||
          projection["kind"] !== "admitted_invocation_carrier_set" ||
          !Array.isArray(projection["carriers"]) ||
          projection["carriers"].length !== 1
        ) {
          throw new TypeError(
            "ABG SYSTEM workspace-request identity requires one admitted carrier"
          );
        }
        const carrier: unknown = projection["carriers"][0];
        if (
          !isPlainRecord(carrier) ||
          carrier["kind"] !== "admitted_invocation_carrier"
        ) {
          throw new TypeError(
            "ABG SYSTEM workspace-request identity requires one admitted carrier"
          );
        }
        return Object.freeze({
          kind: "c_call_value_handler_interior" as const,
          outcomeStatus: "executed" as const,
          evidenceRefs: Object.freeze([
            `handler-executed:${ABG_SYSTEM_SUNNY_HANDLER_REF}`
          ]),
          payloadRef: null,
          responseContractRef: null,
          failureReason: null,
          targetValueCandidate: admitIJsonValue(carrier["value"])
        });
      }
    })
  });
}
