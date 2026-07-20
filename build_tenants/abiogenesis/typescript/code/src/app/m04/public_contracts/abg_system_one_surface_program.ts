// Implements the production ABG SYSTEM One Surface program as pure GTL data.
// The four semantic authorities are ordered by the program runtime binding;
// neither public ingress nor the SDK owns their selection or sequencing.

import {
  C,
  cInterfaceCarrier,
  cProgramCatalogDeclarationEntry,
  declareCProgram,
  recurse,
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
  emptySerializedAttrs,
  graphFunctionDeclarations,
  graphVectorDeclarations,
  hogHandlerBindingsDeclarationEntry,
  hogProgramRefDeclarationEntry,
  pluginSelectionDeclarationEntry
} from "../../../gtl/m01/contracts/index.js";
import {
  constructModule
} from "../../../gtl/m02/contracts/constructors.js";
import {
  abgFnCompositionDeclarationRef,
  constructAbgFnCompositionDeclarations
} from "../../../abg/m03/contracts/fn_composition.js";
import {
  compileGraphVectorExecutionHandoff
} from "../../../abg/m03/contracts/graph_vector_execution_handoff.js";
import {
  compileGraphFunctionApplication
} from "../../../abg/m03/contracts/graph_function_application_compiler.js";
import {
  admitTypedRecursePolicy,
  compileTypedRecurseBinding,
  compileTypedRecursePlan
} from "../../../abg/m03/contracts/typed_recurse.js";
import {
  loadGtlTargetCarrierDefaultsBundle
} from "../../../gtl/m01/contracts/target_carrier_contract.js";
import {
  admitProgramLocusTraversalStageResultAuthority,
  compileTraversalExecutionContracts,
  projectTraversalContractSourceBasis
} from "../../../abg/m03/contracts/traversal_execution_contract.js";
import {
  ONE_SURFACE_RESULT_CONTRACT_FAMILY
} from "../../../abg/m03/contracts/one_surface_contract_family.js";
import {
  ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_ROWS_DECLARATION_KEY
} from "../../../abg/m03/contracts/allowed_consequence_traversal_catalog.js";
import {
  deriveAssuranceClosureDecision
} from "../../../abg/m03/contracts/assurance.js";
import {
  compileOneSurfaceGtlProgramApplication,
  assertOneSurfaceAuthorityProgramBinding,
  type OneSurfaceAuthorityProgramBinding,
  type OneSurfaceStageAuthorityInput
} from "../../../abg/m03/contracts/one_surface_program_compiler.js";
import {
  assertAdmittedRuntimeCatalogBasis,
  type AdmittedRuntimeCatalogBasis,
  type CatalogExecutionBinding
} from "../../../abg/m03/contracts/runtime_catalog.js";
import type { CompiledTypedRecursePlan } from "../../../abg/m03/contracts/typed_recurse.js";
import type { GtlProgramConformanceInput } from "../../../abg/m03/contracts/gtl_program_conformance.js";
import { typecheckGtlProgram } from "../../../abg/m03/contracts/gtl_program_conformance.js";
import type { Module } from "../../../gtl/m02/contracts/carriers.js";
import {
  admitIJsonValue,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import {
  executeOneSurfacePostActionEvaluation,
  executeOneSurfaceSunnySelectionProgram
} from "../../../abg/m03/runner/one_surface_program_runtime.js";

export const ABG_SYSTEM_ONE_SURFACE_GRAPH_FUNCTION_ID =
  "graph-function-id://abiogenesis/system/one-surface/v1" as const;
export const ABG_SYSTEM_ONE_SURFACE_GRAPH_FUNCTION_HANDLE =
  "graph-function://abiogenesis/system/one-surface/v1" as const;
export const T270_AF15_AF16_ASSURANCE_JOIN_GAP =
  "gap://abg/t270/af15-af16-assurance-evidence-join" as const;
export const ABG_SYSTEM_ONE_SURFACE_CATALOG_HANDLE =
  "catalog-entry://abiogenesis/system/one-surface/v1" as const;
export const ABG_SYSTEM_ONE_SURFACE_MODULE_NAME =
  "abiogenesis-system-one-surface" as const;
export const ABG_SYSTEM_ONE_SURFACE_MODULE_PATH =
  "contracts/catalog/abiogenesis-system-one-surface.module.json" as const;

const GRAPH_ID = "graph://abiogenesis/system/one-surface/v1";
const DEFAULTS = loadGtlTargetCarrierDefaultsBundle();

const STAGES = Object.freeze([
  Object.freeze({
    functionKind: "synthesize_model" as const,
    sourceName: "OneSurfaceObservationInput",
    sourceSchemaRef: "abg.schema.one-surface.observation-input",
    targetName: "OneSurfaceProductAssetModel",
    targetSchemaRef: ONE_SURFACE_RESULT_CONTRACT_FAMILY.synthesize_model.schemaRef,
    handlerRef:
      "handler://abiogenesis/system/one-surface/synthesize-model/v1"
  }),
  Object.freeze({
    functionKind: "eval_gap" as const,
    sourceName: "OneSurfaceProductAssetModel",
    sourceSchemaRef: ONE_SURFACE_RESULT_CONTRACT_FAMILY.synthesize_model.schemaRef,
    targetName: "OneSurfaceGapProjection",
    targetSchemaRef: ONE_SURFACE_RESULT_CONTRACT_FAMILY.eval_gap.schemaRef,
    handlerRef: "handler://abiogenesis/system/one-surface/eval-gap/v1"
  }),
  Object.freeze({
    functionKind: "evaluate_next" as const,
    sourceName: "OneSurfaceGapProjection",
    sourceSchemaRef: ONE_SURFACE_RESULT_CONTRACT_FAMILY.eval_gap.schemaRef,
    targetName: "OneSurfaceNextAction",
    targetSchemaRef: ONE_SURFACE_RESULT_CONTRACT_FAMILY.evaluate_next.schemaRef,
    handlerRef:
      "handler://abiogenesis/system/one-surface/evaluate-next/v1"
  }),
  Object.freeze({
    functionKind: "evaluate_action" as const,
    sourceName: "OneSurfaceNextAction",
    sourceSchemaRef: ONE_SURFACE_RESULT_CONTRACT_FAMILY.evaluate_next.schemaRef,
    targetName: "OneSurfaceActionDecision",
    targetSchemaRef: ONE_SURFACE_RESULT_CONTRACT_FAMILY.evaluate_action.schemaRef,
    handlerRef:
      "handler://abiogenesis/system/one-surface/evaluate-action/v1"
  })
]);

function node(name: string, schemaRef: string) {
  return constructNode({
    id: `node://abiogenesis/system/one-surface/${name}`,
    name,
    schema: { kind: "symbolic", ref: schemaRef },
    markov: ["boundary://abiogenesis/system/one-surface"],
    assetSurface: { kind: `one_surface_${name}` },
    tags: ["abiogenesis", "system", "one-surface"]
  });
}

function carrier(value: ReturnType<typeof node>) {
  return cInterfaceCarrier(typedInterface(typedNode({
    node: value,
    decode: (raw: unknown) => admitIJsonValue(raw)
  })));
}

function stringArrayJson(values: readonly string[]) {
  return Object.freeze({ kind: "array" as const, items: Object.freeze([...values]) });
}

function allowedTargetDeclaration() {
  const row = Object.freeze({
    rowRef: "allowed-row://abiogenesis/system/one-surface/program-callable",
    traversalFamily: "public_start_reentry",
    allowedActionKinds: Object.freeze(["invoke_graph_function"]),
    allowedGraphFunctionRefs: Object.freeze([]),
    inputAssetRefs: Object.freeze([
      "asset://abiogenesis/system/one-surface/callable-input"
    ]),
    expectedOutputAssetRefs: Object.freeze([
      "asset://abiogenesis/system/one-surface/callable-output"
    ]),
    requiredAuthorityRefs: Object.freeze([
      "authority://abiogenesis/system/one-surface/program-membership"
    ]),
    proportionalityBasisRefs: Object.freeze([
      "proof://abiogenesis/system/one-surface/program-membership"
    ])
  });
  return Object.freeze({
    key: ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_ROWS_DECLARATION_KEY,
    value: Object.freeze({
      kind: "json_blob" as const,
      value: Object.freeze({
        kind: "array" as const,
        items: Object.freeze([Object.freeze({
          kind: "object" as const,
          entries: Object.freeze([
            Object.freeze({ key: "rowRef", value: row.rowRef }),
            Object.freeze({ key: "traversalFamily", value: row.traversalFamily }),
            Object.freeze({ key: "allowedActionKinds", value: stringArrayJson(row.allowedActionKinds) }),
            Object.freeze({ key: "allowedGraphFunctionRefs", value: stringArrayJson(row.allowedGraphFunctionRefs) }),
            Object.freeze({ key: "inputAssetRefs", value: stringArrayJson(row.inputAssetRefs) }),
            Object.freeze({ key: "expectedOutputAssetRefs", value: stringArrayJson(row.expectedOutputAssetRefs) }),
            Object.freeze({ key: "requiredAuthorityRefs", value: stringArrayJson(row.requiredAuthorityRefs) }),
            Object.freeze({ key: "proportionalityBasisRefs", value: stringArrayJson(row.proportionalityBasisRefs) })
          ])
        })])
      })
    })
  });
}

function compositionDeclarations(input: {
  readonly hostGraphFunctionRef?: string;
  readonly vectorRef: string;
  readonly sourceNodeRef: string;
  readonly targetNodeRef: string;
  readonly targetSchemaRef: string;
}) {
  return constructAbgFnCompositionDeclarations({
    contractRef: `abg.fn_composition://${input.vectorRef}`,
    hookRef: `hook://${input.vectorRef}/composition`,
    hostGraphFunctionRef:
      input.hostGraphFunctionRef ?? ABG_SYSTEM_ONE_SURFACE_GRAPH_FUNCTION_ID,
    hostGraphVectorRef: input.vectorRef,
    hostSourceNodeRefs: [input.sourceNodeRef],
    hostTargetNodeRef: input.targetNodeRef,
    hostTargetSchemaRef: input.targetSchemaRef,
    owningDeclarationRef: abgFnCompositionDeclarationRef({
      source: "graph_vector_declarations",
      sourceRef: input.vectorRef
    }),
    regimes: [Object.freeze({
      bindingRef: `regime-binding://${input.vectorRef}/transform/0`,
      stageRole: "transform",
      regime: "F_D",
      role: "construct",
      order: 0,
      authority: "evidence",
      inputCarrierRefs: [input.sourceNodeRef],
      outputCarrierRefs: [input.targetNodeRef],
      evidenceRefs: [`evidence://${input.vectorRef}`]
    })],
    standardsContextRefs: ["standard://abg/one-surface"],
    policyContextRefs: ["policy://abg/system/one-surface"],
    carrierContextRefs: [input.sourceNodeRef, input.targetNodeRef],
    assuranceContextRefs: ["assurance://abg/system/one-surface"],
    closureContractRef: `closure://${input.vectorRef}`
  });
}

function buildRecurseStructure(input: {
  readonly decision: ReturnType<typeof node>;
  readonly observation: ReturnType<typeof node>;
}) {
  const program = declareCProgram({
    programRef: "program://abiogenesis/system/one-surface/foldback/v1",
    term: C.of({
      input: carrier(input.decision),
      output: carrier(input.observation),
      stageRole: "one_surface_foldback",
      fibre: "F_D",
      armId: "arm://abiogenesis/system/one-surface/foldback/v1",
      resultBearing: true
    }),
    proportionalityClass: "P1"
  });
  const vectorRef =
    "graph-vector://abiogenesis/system/one-surface/foldback/v1";
  const declarations = compositionDeclarations({
    hostGraphFunctionRef:
      "graph-function-id://abiogenesis/system/one-surface/foldback/v1",
    vectorRef,
    sourceNodeRef: input.decision.id,
    targetNodeRef: input.observation.id,
    targetSchemaRef: input.observation.schema.ref
  });
  const vector = constructGraphVector({
    id: vectorRef,
    name: "abiogenesis.system.one-surface.foldback.vector",
    source: [input.decision],
    target: input.observation,
    operators: [],
    evaluators: [],
    contexts: [],
    rule: null,
    allowsSubwork: false,
    declarations: graphVectorDeclarations([
      hogProgramRefDeclarationEntry(program.programRef),
      ...declarations.entries
    ]),
    tags: ["abiogenesis", "system", "one-surface", "foldback"]
  });
  const graph = constructGraph({
    id: "graph://abiogenesis/system/one-surface/foldback/v1",
    name: "abiogenesis.system.one-surface.foldback.graph",
    inputs: [input.decision],
    outputs: [input.observation],
    nodes: [input.decision, input.observation],
    vectors: [vector],
    contexts: [],
    rules: [],
    effects: [],
    tags: ["abiogenesis", "system", "one-surface", "foldback"]
  });
  const operand = constructGraphFunction({
    id: "graph-function-id://abiogenesis/system/one-surface/foldback/v1",
    name: "graph-function://abiogenesis/system/one-surface/foldback/v1",
    environment: constructEnvRef({
      requires: [input.decision],
      provides: [input.observation],
      carries: [input.decision, input.observation]
    }),
    inputs: [input.decision],
    outputs: [input.observation],
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: "inline:graph-function://abiogenesis/system/one-surface/foldback/v1",
      graph,
      version: null
    }),
    effects: [],
    declarations: graphFunctionDeclarations([
      cProgramCatalogDeclarationEntry([program]),
      hogProgramRefDeclarationEntry(program.programRef),
      pluginSelectionDeclarationEntry({ fdEvaluator: "plugin://abg/fd-evaluator" })
    ]),
    tags: ["abiogenesis", "system", "one-surface", "foldback"]
  });
  const wrapper = recurse(operand, Object.freeze({
    name: "abiogenesis_system_one_surface_continue",
    regime: "F_D" as const,
    description: "continue while the admitted One Surface episode remains open",
    binding: "binding://abiogenesis/system/one-surface/termination/v1",
    consumedFieldRefs: Object.freeze(["field://abg/one-surface/action-decision/disposition"]),
    tags: Object.freeze(["abiogenesis", "system", "one-surface", "termination"])
  }), {
    mode: "rebind",
    binding: "binding://abiogenesis/system/one-surface/decision-to-observation/v1",
    requiresParentEvaluation: true
  });
  return Object.freeze({ graph, operand, wrapper, vector, program });
}

export interface AbgSystemOneSurfaceProgram {
  readonly module: Module;
  readonly gtlProgram: GtlProgramConformanceInput;
  readonly stageAuthorities: readonly OneSurfaceStageAuthorityInput[];
  readonly recursePlan: CompiledTypedRecursePlan;
  readonly authorityProgram: OneSurfaceAuthorityProgramBinding;
}

export interface InstalledAbgSystemOneSurfaceAuthority {
  readonly kind: "installed_abg_system_one_surface_authority";
  readonly catalogBasisRef: string;
  readonly catalogEntryRef: typeof ABG_SYSTEM_ONE_SURFACE_CATALOG_HANDLE;
  readonly declarationRef: typeof ABG_SYSTEM_ONE_SURFACE_GRAPH_FUNCTION_HANDLE;
  readonly moduleRef: string;
  readonly moduleDigest: `sha256:${string}`;
  readonly graphFunctionDigest: `sha256:${string}`;
  readonly installedAuthorityDigest: `sha256:${string}`;
  readonly authorityProgram: OneSurfaceAuthorityProgramBinding;
}

const INSTALLED_ONE_SURFACE_AUTHORITY = new WeakSet<object>();

function installedAuthorityBasis(input: {
  readonly catalogBasisRef: string;
  readonly binding: CatalogExecutionBinding;
  readonly authorityProgram: OneSurfaceAuthorityProgramBinding;
}) {
  return Object.freeze({
    catalogBasisRef: input.catalogBasisRef,
    catalogEntryRef: ABG_SYSTEM_ONE_SURFACE_CATALOG_HANDLE,
    declarationRef: ABG_SYSTEM_ONE_SURFACE_GRAPH_FUNCTION_HANDLE,
    moduleRef: input.binding.moduleRef,
    moduleDigest: input.binding.moduleDigest,
    graphFunctionDigest: input.binding.graphFunctionDigest,
    admittedProgramRef: input.authorityProgram.admittedProgramRef,
    admittedProgramDigest: input.authorityProgram.admittedProgramDigest,
    programBindingRef: input.authorityProgram.bindingRef,
    programBindingDigest: input.authorityProgram.bindingDigest
  });
}

export function assertInstalledAbgSystemOneSurfaceAuthority(
  authority: InstalledAbgSystemOneSurfaceAuthority
): void {
  assertOneSurfaceAuthorityProgramBinding(authority.authorityProgram);
  const basis = Object.freeze({
    catalogBasisRef: authority.catalogBasisRef,
    catalogEntryRef: authority.catalogEntryRef,
    declarationRef: authority.declarationRef,
    moduleRef: authority.moduleRef,
    moduleDigest: authority.moduleDigest,
    graphFunctionDigest: authority.graphFunctionDigest,
    admittedProgramRef: authority.authorityProgram.admittedProgramRef,
    admittedProgramDigest: authority.authorityProgram.admittedProgramDigest,
    programBindingRef: authority.authorityProgram.bindingRef,
    programBindingDigest: authority.authorityProgram.bindingDigest
  });
  if (
    authority.kind !== "installed_abg_system_one_surface_authority" ||
    !INSTALLED_ONE_SURFACE_AUTHORITY.has(authority) ||
    authority.catalogEntryRef !== ABG_SYSTEM_ONE_SURFACE_CATALOG_HANDLE ||
    authority.declarationRef !== ABG_SYSTEM_ONE_SURFACE_GRAPH_FUNCTION_HANDLE ||
    authority.installedAuthorityDigest !== stableSha256Digest(basis)
  ) {
    throw new TypeError("installed ABG SYSTEM One Surface authority seal differs");
  }
}

export async function projectInstalledAbgSystemOneSurfaceAuthority(input: {
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
}): Promise<InstalledAbgSystemOneSurfaceAuthority> {
  assertAdmittedRuntimeCatalogBasis(input.catalogBasis);
  const bindings = input.catalogBasis.executionBindings.filter(
    (binding) => binding.entryRef === ABG_SYSTEM_ONE_SURFACE_CATALOG_HANDLE
  );
  const binding = bindings[0];
  if (bindings.length !== 1 || binding === undefined) {
    throw new TypeError(
      "installed ABG SYSTEM One Surface catalog authority is absent or ambiguous"
    );
  }
  const program = await buildAbgSystemOneSurfaceProgram();
  const graphFunction = program.module.graphFunctions.find(
    (candidate) => candidate.id === ABG_SYSTEM_ONE_SURFACE_GRAPH_FUNCTION_ID
  );
  if (
    graphFunction === undefined ||
    binding.libraryScope !== "system" ||
    binding.namespace !== "abiogenesis" ||
    binding.ownerRef !== "abiogenesis" ||
    binding.declarationRef !== ABG_SYSTEM_ONE_SURFACE_GRAPH_FUNCTION_HANDLE ||
    binding.moduleName !== ABG_SYSTEM_ONE_SURFACE_MODULE_NAME ||
    !binding.moduleRef.endsWith(`#${ABG_SYSTEM_ONE_SURFACE_MODULE_PATH}`) ||
    binding.moduleDigest !== stableSha256Digest(program.module) ||
    binding.graphFunctionHandle !== ABG_SYSTEM_ONE_SURFACE_GRAPH_FUNCTION_HANDLE ||
    binding.graphFunctionId !== ABG_SYSTEM_ONE_SURFACE_GRAPH_FUNCTION_ID ||
    binding.graphFunctionDigest !== stableSha256Digest(graphFunction) ||
    stableSha256Digest(binding.module) !== stableSha256Digest(program.module) ||
    stableSha256Digest(binding.graphFunction) !== stableSha256Digest(graphFunction)
  ) {
    throw new TypeError(
      "installed ABG SYSTEM One Surface catalog authority differs from the canonical product program"
    );
  }
  const basis = installedAuthorityBasis({
    catalogBasisRef: input.catalogBasis.basisRef,
    binding,
    authorityProgram: program.authorityProgram
  });
  const authority = Object.freeze({
    kind: "installed_abg_system_one_surface_authority" as const,
    catalogBasisRef: input.catalogBasis.basisRef,
    catalogEntryRef: ABG_SYSTEM_ONE_SURFACE_CATALOG_HANDLE,
    declarationRef: ABG_SYSTEM_ONE_SURFACE_GRAPH_FUNCTION_HANDLE,
    moduleRef: binding.moduleRef,
    moduleDigest: binding.moduleDigest,
    graphFunctionDigest: binding.graphFunctionDigest,
    installedAuthorityDigest: stableSha256Digest(basis),
    authorityProgram: program.authorityProgram
  });
  INSTALLED_ONE_SURFACE_AUTHORITY.add(authority);
  assertInstalledAbgSystemOneSurfaceAuthority(authority);
  return authority;
}

export async function executeInstalledAbgSystemOneSurfaceSelection(
  input: Omit<
    Parameters<typeof executeOneSurfaceSunnySelectionProgram>[0],
    "application" | "selectedCatalogEntryRef"
  > & {
    readonly authority: InstalledAbgSystemOneSurfaceAuthority;
    readonly application?: OneSurfaceAuthorityProgramBinding | undefined;
  }
) {
  assertInstalledAbgSystemOneSurfaceAuthority(input.authority);
  const application = input.application ?? input.authority.authorityProgram;
  assertOneSurfaceAuthorityProgramBinding(application);
  if (input.authority.catalogBasisRef !== input.catalogBasis.basisRef) {
    throw new TypeError(
      "installed ABG SYSTEM One Surface authority differs from the execution catalog basis"
    );
  }
  return executeOneSurfaceSunnySelectionProgram({
    application,
    selection: input.selection,
    catalogBasis: input.catalogBasis,
    selectedCatalogEntryRef: input.authority.catalogEntryRef,
    emitterContext: input.emitterContext,
    eventSink: input.eventSink
  });
}

export async function executeInstalledAbgSystemOneSurfacePostAction(
  input: Omit<
    Parameters<typeof executeOneSurfacePostActionEvaluation>[0],
    "application" | "selectedCatalogEntryRef"
  > & {
    readonly authority: InstalledAbgSystemOneSurfaceAuthority;
    readonly application: OneSurfaceAuthorityProgramBinding;
  }
) {
  assertInstalledAbgSystemOneSurfaceAuthority(input.authority);
  assertOneSurfaceAuthorityProgramBinding(input.application);
  if (input.authority.catalogBasisRef !== input.catalogBasis.basisRef) {
    throw new TypeError(
      "installed ABG SYSTEM One Surface authority differs from the post-action catalog basis"
    );
  }
  if (
    input.evaluationInput.intentAdmission.program.ref !==
      input.application.admittedProgramRef ||
    input.evaluationInput.intentAdmission.program.digest !==
      input.application.admittedProgramDigest
  ) {
    throw new TypeError(
      "installed ABG SYSTEM post-action program differs from admitted intent"
    );
  }
  return executeOneSurfacePostActionEvaluation({
    application: input.application,
    evaluationInput: input.evaluationInput,
    implementation: input.implementation,
    catalogBasis: input.catalogBasis,
    selectedCatalogEntryRef: input.authority.catalogEntryRef,
    inputPayloadRef: input.inputPayloadRef,
    inputLineageRef: input.inputLineageRef,
    runtimeScope: input.runtimeScope,
    constructionContext: input.constructionContext,
    emitterContext: input.emitterContext,
    eventSink: input.eventSink
  });
}

export async function executeInstalledAbgSystemOneSurfaceDeterministicPostAction(
  input: Omit<
    Parameters<typeof executeInstalledAbgSystemOneSurfacePostAction>[0],
    "implementation"
  >
) {
  assertInstalledAbgSystemOneSurfaceAuthority(input.authority);
  assertOneSurfaceAuthorityProgramBinding(input.application);
  const stage = input.application.stages.find(
    (candidate) => candidate.functionKind === "evaluate_action"
  );
  const closurePolicy = input.evaluationInput.assuranceSelection;
  if (
    stage === undefined ||
    closurePolicy.kind !== "target_carrier_contract_binding"
  ) {
    throw new TypeError(
      "deterministic One Surface post-action requires its target-carrier closure policy"
    );
  }
  const assuranceDecision = deriveAssuranceClosureDecision(
    input.evaluationInput.assuranceProjection
  );
  const disposition = (() => {
    switch (assuranceDecision.decision) {
      case "close":
        return "close" as const;
      case "retry":
        return "retry" as const;
      case "reprice":
        return "reprice" as const;
      case "block":
        return "block" as const;
      case "qualified_defer":
        return "yield" as const;
    }
  })();
  return executeInstalledAbgSystemOneSurfacePostAction({
    ...input,
    implementation: Object.freeze({
      kind: "one_surface_fd_stage_implementation" as const,
      functionKind: "evaluate_action" as const,
      stageAuthorityRef: stage.authorityRef,
      implementationRef:
        "implementation://abiogenesis/system/one-surface/evaluate-action/v1",
      invoke: () => Object.freeze({
        closureContractRef: closurePolicy.closurePreconditionRef,
        evidenceRefs: Object.freeze(
          input.evaluationInput.assuranceProjection.evidenceRows
            .map((row) => row.evidenceRef)
            .sort()
        ),
        disposition,
        reasonRefs: Object.freeze([assuranceDecision.reason])
      })
    })
  });
}

let programPromise: Promise<AbgSystemOneSurfaceProgram> | null = null;

export function buildAbgSystemOneSurfaceProgram(): Promise<AbgSystemOneSurfaceProgram> {
  programPromise ??= buildProgram();
  return programPromise;
}

async function buildProgram(): Promise<AbgSystemOneSurfaceProgram> {
  const observation = node(STAGES[0]!.sourceName, STAGES[0]!.sourceSchemaRef);
  const model = node(STAGES[0]!.targetName, STAGES[0]!.targetSchemaRef);
  const gaps = node(STAGES[1]!.targetName, STAGES[1]!.targetSchemaRef);
  const nextAction = node(STAGES[2]!.targetName, STAGES[2]!.targetSchemaRef);
  const decision = node(STAGES[3]!.targetName, STAGES[3]!.targetSchemaRef);
  const chain = [
    Object.freeze({ source: observation, target: model }),
    Object.freeze({ source: model, target: gaps }),
    Object.freeze({ source: gaps, target: nextAction }),
    Object.freeze({ source: nextAction, target: decision })
  ];
  const programs = STAGES.map((stage, index) => declareCProgram({
    programRef: `program://abiogenesis/system/one-surface/${stage.functionKind}/v1`,
    term: C.of({
      input: carrier(chain[index]!.source),
      output: carrier(chain[index]!.target),
      stageRole: stage.functionKind,
      fibre: "F_D",
      armId: `arm://abiogenesis/system/one-surface/${stage.functionKind}/v1`,
      resultBearing: true
    }),
    proportionalityClass: "P1"
  }));
  const handlerBindings = Object.freeze(STAGES.map((stage, index) =>
    Object.freeze({
      programRef: programs[index]!.programRef,
      stageRole: stage.functionKind,
      armId:
        `arm://abiogenesis/system/one-surface/${stage.functionKind}/v1`,
      regime: "F_D" as const,
      handlerRef: stage.handlerRef,
      handlerClass: "capability" as const,
      handlerConfigRef: null
    })
  ));
  const vectors = STAGES.map((stage, index) => {
    const relation = chain[index]!;
    const vectorRef =
      `graph-vector://abiogenesis/system/one-surface/${stage.functionKind}/v1`;
    const declarations = compositionDeclarations({
      vectorRef,
      sourceNodeRef: relation.source.id,
      targetNodeRef: relation.target.id,
      targetSchemaRef: relation.target.schema.ref
    });
    return constructGraphVector({
      id: vectorRef,
      name: `abiogenesis.system.one-surface.${stage.functionKind}.vector`,
      source: [relation.source],
      target: relation.target,
      operators: [Object.freeze({
        name: `abiogenesis.system.one-surface.${stage.functionKind}`,
        regime: "F_D" as const,
        binding:
          `binding://abiogenesis/system/one-surface/${stage.functionKind}/v1`,
        tags: Object.freeze(["abiogenesis", "system", "one-surface"])
      })],
      evaluators: [],
      contexts: [],
      rule: null,
      allowsSubwork: false,
      declarations: graphVectorDeclarations([
        hogProgramRefDeclarationEntry(programs[index]!.programRef),
        ...declarations.entries,
        ...(stage.functionKind === "evaluate_next"
          ? [allowedTargetDeclaration()]
          : [])
      ]),
      tags: ["abiogenesis", "system", "one-surface", stage.functionKind]
    });
  });
  const graph = constructGraph({
    id: GRAPH_ID,
    name: ABG_SYSTEM_ONE_SURFACE_GRAPH_FUNCTION_HANDLE,
    inputs: [observation],
    outputs: [decision],
    nodes: [observation, model, gaps, nextAction, decision],
    vectors,
    contexts: [],
    rules: [],
    effects: [],
    tags: ["abiogenesis", "system", "one-surface"]
  });
  const graphFunction = constructGraphFunction({
    id: ABG_SYSTEM_ONE_SURFACE_GRAPH_FUNCTION_ID,
    name: ABG_SYSTEM_ONE_SURFACE_GRAPH_FUNCTION_HANDLE,
    environment: constructEnvRef({
      requires: [observation],
      provides: [decision],
      carries: [observation, model, gaps, nextAction, decision]
    }),
    inputs: [observation],
    outputs: [decision],
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: `inline:${ABG_SYSTEM_ONE_SURFACE_GRAPH_FUNCTION_HANDLE}`,
      graph,
      version: null
    }),
    effects: [],
    declarations: graphFunctionDeclarations([
      cProgramCatalogDeclarationEntry(programs),
      // GraphFunction-level selection is the public-start default only. Each
      // vector still declares its exact member program for structural routing.
      hogProgramRefDeclarationEntry(programs[0]!.programRef),
      hogHandlerBindingsDeclarationEntry(handlerBindings),
      pluginSelectionDeclarationEntry({ fdEvaluator: "plugin://abg/fd-evaluator" })
    ]),
    tags: ["abiogenesis", "system", "one-surface"]
  });
  const recurse = buildRecurseStructure({ decision, observation });
  const module = constructModule({
    name: ABG_SYSTEM_ONE_SURFACE_MODULE_NAME,
    graphs: [graph, recurse.graph],
    graphFunctions: [graphFunction, recurse.wrapper, recurse.operand],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [Object.freeze({
      id: "job-abiogenesis-system-one-surface-v1",
      name: "abiogenesis_system_one_surface",
      contracts: Object.freeze([Object.freeze({
        kind: "graph_function" as const,
        targetId: graphFunction.id
      })]),
      roles: Object.freeze([]),
      tags: Object.freeze(["semantic_work", "abiogenesis", "system"]),
      policyHooks: emptySerializedAttrs()
    })],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    policyHooks: emptySerializedAttrs(),
    metadata: emptySerializedAttrs()
  });
  const compileVector = (input: {
    readonly graphFunction: typeof graphFunction;
    readonly graphVector: (typeof vectors)[number];
    readonly declarationOwnerGraphFunction?: typeof graphFunction;
  }) => {
    const handoff = compileGraphVectorExecutionHandoff({
      graphFunction: input.graphFunction,
      graphVector: input.graphVector,
      graphFunctions: module.graphFunctions,
      module,
      targetCarrierDefaults: DEFAULTS,
      admittedTenantConformanceManifest: null
    });
    if (handoff.status !== "published_startup_blocked") {
      throw new TypeError(
        `ABG SYSTEM One Surface handoff differs: ${handoff.status}`
      );
    }
    const source = projectTraversalContractSourceBasis(Object.freeze({
      kind: "selected_program_handoff" as const,
      module,
      executionSubjectGraphFunction: input.graphFunction,
      declarationOwnerGraphFunction:
        input.declarationOwnerGraphFunction ?? input.graphFunction,
      graphVector: input.graphVector,
      targetCarrierDefaults: DEFAULTS,
      admittedTenantConformanceManifest: null,
      outcome: handoff
    }));
    const resultAuthorities = Object.freeze(source.workStages.map((stage) =>
      admitProgramLocusTraversalStageResultAuthority({
        source,
        programLocusRef: stage.programLocusRef
      })
    ));
    return Object.freeze({
      source,
      resultAuthorities,
      traversalContracts: compileTraversalExecutionContracts({
        source,
        resultAuthorities
      })
    });
  };
  const recurseApplication = compileGraphFunctionApplication({
    graphFunction: recurse.wrapper,
    graphFunctions: module.graphFunctions
  });
  if (
    !recurseApplication.accepted ||
    recurseApplication.recurseRelation === null
  ) {
    throw new TypeError(
      `ABG SYSTEM One Surface foldback did not compile: ${JSON.stringify(
        recurseApplication.diagnostics
      )}`
    );
  }
  const recurseBinding = compileTypedRecurseBinding({
    module,
    graphFunction: recurse.wrapper,
    relation: recurseApplication.recurseRelation
  });
  const recursePolicy = admitTypedRecursePolicy({
    kind: "typed_recurse_policy",
    policyRef: "policy://abiogenesis/system/one-surface/recurse/v1",
    policyVersion: "1.0.0",
    sourceInputCarrierRef: recurseBinding.inputCarrierRef,
    sourceInputPayloadRef:
      "payload://abiogenesis/system/one-surface/action-decision",
    budgetSourceFieldRef: "field://abg/one-surface/max-episodes",
    maxApplications: 1,
    evidenceRefs: ["evidence://abiogenesis/system/one-surface/recurse"]
  });
  const recursePlan = compileTypedRecursePlan({
    binding: recurseBinding,
    policy: recursePolicy,
    selectedCatalogEntryRef: ABG_SYSTEM_ONE_SURFACE_CATALOG_HANDLE
  });
  const compiled = vectors.map((vector) => compileVector({
    graphFunction,
    graphVector: vector
  }));
  const foldbackCompiled = Object.freeze([
    compileVector({
      graphFunction: recurse.operand,
      graphVector: recurse.vector
    }),
    compileVector({
      graphFunction: recurse.wrapper,
      graphVector: recurse.vector,
      declarationOwnerGraphFunction: recurse.operand
    })
  ]);
  const conformanceRows = Object.freeze([...compiled, ...foldbackCompiled]);
  const stageAuthorities = Object.freeze(compiled.map((row, index) =>
    Object.freeze({
      functionKind: STAGES[index]!.functionKind,
      stage: row.traversalContracts.computeStageBindings[0]!,
      plan: row.source.completeProgramPlan,
      resultAuthority: row.resultAuthorities[0]!,
      traversalContracts: row.traversalContracts
    })
  ));
  const publicStartName = "abiogenesis-system-one-surface";
  const overlayRef = "overlay://abiogenesis/system/one-surface/v1";
  const gtlProgram = Object.freeze({
    subjectRef: "program://abiogenesis/system/one-surface/control/v1",
    abiPackageVersion: "5.0.0",
    scopeKind: "submitted_structure" as const,
    modules: [module],
    sourceIdentitySurfaces: [],
    targetCarrierContracts: conformanceRows.map(
      (row) => row.source.targetCarrierProjection
    ),
    edgeClosureContracts: conformanceRows.map(
      (row) => row.source.edgeClosureBinding.conformanceRow
    ),
    overlays: [Object.freeze({
      overlayRef,
      graphFunctionRefs: [graphFunction.name],
      graphVectorRefs: vectors.map((vector) => vector.name),
      publicStartTargets: [graphFunction.name],
      defaultStartTarget: graphFunction.name
    })],
    publicStartTargets: [Object.freeze({
      name: publicStartName,
      graphFunctionRef: graphFunction.name,
      overlayRefs: [overlayRef],
      defaultForOverlayRefs: [overlayRef]
    })],
    computeCompositions: conformanceRows.map(
      (row) => row.traversalContracts.computeComposition
    ),
    computeStageBindings: conformanceRows.flatMap(
      (row) => row.traversalContracts.computeStageBindings
    ),
    pluginResultInterfaces: conformanceRows.flatMap(
      (row) => row.traversalContracts.pluginResultInterfaces
    ),
    traversalBindConservation: conformanceRows.map(
      (row) => row.traversalContracts.traversalBindConservation
    ),
    runtimeBindings: [Object.freeze({
      bindingRef: "runtime-binding://abiogenesis/system/one-surface/v1",
      runtimeBindingKind: "abg_public_control_loop" as const,
      moduleRef: module.name,
      publicStartRef: publicStartName,
      commandRef: "abiogenesis-ts start",
      pluginContractRefs: [],
      stageBindingRefs: stageAuthorities.map((row) => row.stage.stageBindingRef),
      consumesPluginsThroughAbg: true,
      forbidsProductLocalIteration: true,
      evidenceRefs: ["proof://abiogenesis/system/one-surface/structure"]
    })]
  });
  const compilation = await compileOneSurfaceGtlProgramApplication({
    gtlProgram,
    stageAuthorities,
    recursePlan
  });
  if (compilation.authorityProgram === null) {
    throw new TypeError(
      `ABG SYSTEM One Surface program did not compile: ${JSON.stringify({
        diagnostics: compilation.diagnostics,
        conformance: typecheckGtlProgram(gtlProgram).issues
      })}`
    );
  }
  return Object.freeze({
    module,
    gtlProgram,
    stageAuthorities,
    recursePlan,
    authorityProgram: compilation.authorityProgram
  });
}
