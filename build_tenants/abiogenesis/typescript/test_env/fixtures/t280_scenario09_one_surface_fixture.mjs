import {
  C,
  cInterfaceCarrier,
  cProgramCatalogDeclarationEntry,
  declareCProgram,
  recurse,
  typedInterface,
  typedNode
} from "../../build/semantic/code/src/gtl/m01/algebra/index.js";
import {
  constructEnvRef,
  constructGraph,
  constructGraphFunction,
  constructGraphVector,
  constructNode,
  constructTemplateRef,
  emptySerializedAttrs
} from "../../build/semantic/code/src/gtl/m01/contracts/constructors.js";
import {
  graphFunctionDeclarations,
  graphVectorDeclarations
} from "../../build/semantic/code/src/gtl/m01/contracts/declaration_law.js";
import {
  hogProgramRefDeclarationEntry,
  pluginSelectionDeclarationEntry
} from "../../build/semantic/code/src/gtl/m01/contracts/execution_declaration_builders.js";
import {
  constructModule,
  constructModuleImport,
  constructRefinementBoundary
} from "../../build/semantic/code/src/gtl/m02/contracts/constructors.js";
import {
  abgFnCompositionDeclarationRef,
  constructAbgFnCompositionDeclarations
} from "../../build/semantic/code/src/abg/m03/contracts/fn_composition.js";
import {
  compileGraphVectorExecutionHandoff
} from "../../build/semantic/code/src/abg/m03/contracts/graph_vector_execution_handoff.js";
import {
  compileGraphFunctionApplication
} from "../../build/semantic/code/src/abg/m03/contracts/graph_function_application_compiler.js";
import {
  admitTypedRecursePolicy,
  compileTypedRecurseBinding,
  compileTypedRecursePlan
} from "../../build/semantic/code/src/abg/m03/contracts/typed_recurse.js";
import {
  loadGtlTargetCarrierDefaultsBundle
} from "../../build/semantic/code/src/gtl/m01/contracts/target_carrier_contract.js";
import {
  admitProgramLocusTraversalStageResultAuthority,
  compileTraversalExecutionContracts,
  projectTraversalContractSourceBasis
} from "../../build/semantic/code/src/abg/m03/contracts/traversal_execution_contract.js";
import {
  ONE_SURFACE_RESULT_CONTRACT_FAMILY
} from "../../build/semantic/code/src/abg/m03/contracts/one_surface_contract_family.js";
import {
  ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_ROWS_DECLARATION_KEY
} from "../../build/semantic/code/src/abg/m03/contracts/allowed_consequence_traversal_catalog.js";

const defaults = loadGtlTargetCarrierDefaultsBundle();

export const SCENARIO09_ONE_SURFACE_AUTHORITY_KINDS = Object.freeze([
  "synthesize_model",
  "eval_gap",
  "evaluate_next",
  "evaluate_action"
]);

function node(name, schemaRef = `schema://t280/${name}`) {
  return constructNode({
    name,
    schema: { kind: "symbolic", ref: schemaRef },
    markov: ["boundary://t280/scenario09-lab"],
    assetSurface: { kind: `t280_${name}` },
    tags: ["t280", "scenario09-lab"]
  });
}

function carrier(nodes) {
  return cInterfaceCarrier(
    typedInterface(
      ...nodes.map((value) => typedNode({ node: value, decode: (raw) => raw }))
    )
  );
}

function compositionDeclarations(input) {
  return constructAbgFnCompositionDeclarations({
    contractRef: `abg.fn_composition://${input.vectorRef}`,
    hookRef: `hook://${input.vectorRef}/composition`,
    hostGraphFunctionRef: input.graphFunctionRef,
    hostGraphVectorRef: input.vectorRef,
    hostSourceNodeRefs: input.source.map((value) => value.id),
    hostTargetNodeRef: input.target.id,
    hostTargetSchemaRef: input.target.schema.ref,
    owningDeclarationRef: abgFnCompositionDeclarationRef({
      source: "graph_vector_declarations",
      sourceRef: input.vectorRef
    }),
    regimes: [Object.freeze({
      bindingRef: `regime-binding://${input.vectorRef}/transform/0`,
      stageRole: "transform",
      regime: input.fibre,
      role: "construct",
      order: 0,
      authority: "evidence",
      inputCarrierRefs: input.source.map((value) => value.id),
      outputCarrierRefs: [input.target.id],
      evidenceRefs: [`evidence://${input.vectorRef}/${input.stageRole}`]
    })],
    standardsContextRefs: ["standard://t280/one-surface"],
    policyContextRefs: ["policy://t280/lab"],
    carrierContextRefs: [
      ...input.source.map((value) => value.id),
      input.target.id
    ],
    assuranceContextRefs: ["assurance://t280/exact-program"],
    closureContractRef: `closure://${input.vectorRef}`
  });
}

function stringArrayJson(values) {
  return Object.freeze({
    kind: "array",
    items: Object.freeze([...values])
  });
}

function allowedTraversalRowsEntry(rows) {
  return Object.freeze({
    key: ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_ROWS_DECLARATION_KEY,
    value: Object.freeze({
      kind: "json_blob",
      value: Object.freeze({
        kind: "array",
        items: Object.freeze(rows.map((row) => Object.freeze({
          kind: "object",
          entries: Object.freeze([
            Object.freeze({ key: "rowRef", value: row.rowRef }),
            Object.freeze({ key: "traversalFamily", value: row.traversalFamily }),
            Object.freeze({
              key: "allowedActionKinds",
              value: stringArrayJson(row.allowedActionKinds)
            }),
            ...(row.allowedGraphFunctionRefs === undefined
              ? []
              : [Object.freeze({
                  key: "allowedGraphFunctionRefs",
                  value: stringArrayJson(row.allowedGraphFunctionRefs)
                })]),
            ...(row.allowedTraversalTargetRefs === undefined
              ? []
              : [Object.freeze({
                  key: "allowedTraversalTargetRefs",
                  value: stringArrayJson(row.allowedTraversalTargetRefs)
                })]),
            Object.freeze({
              key: "requiredAuthorityRefs",
              value: stringArrayJson(row.requiredAuthorityRefs)
            }),
            Object.freeze({
              key: "proportionalityBasisRefs",
              value: stringArrayJson(row.proportionalityBasisRefs)
            })
          ])
        })))
      })
    })
  });
}

function allowedTraversalRows(graphFunctionRef, actionVariant = "callable") {
  const common = (suffix, traversalFamily, allowedActionKinds) => ({
    rowRef: `allowed-row://t280/scenario09/${suffix}`,
    traversalFamily,
    allowedActionKinds: Object.freeze(allowedActionKinds),
    requiredAuthorityRefs: Object.freeze([
      `authority://t280/scenario09/${suffix}`
    ]),
    proportionalityBasisRefs: Object.freeze([
      `proof://t280/scenario09/${suffix}`
    ])
  });
  switch (actionVariant) {
    case "callable":
      return Object.freeze([Object.freeze({
        ...common("callable", "public_start_reentry", ["invoke_graph_function"]),
        allowedGraphFunctionRefs: Object.freeze([graphFunctionRef])
      })]);
    case "internal":
      return Object.freeze([Object.freeze({
        ...common("internal", "graph_span_reentry", [
          "invoke_prior_vector",
          "invoke_later_vector"
        ]),
        allowedTraversalTargetRefs: Object.freeze([
          "published-traversal-target://t280/scenario09/internal"
        ])
      })]);
    case "reentry":
      return Object.freeze([Object.freeze({
        ...common("reentry", "graph_span_reentry", ["reenter_graph_span"]),
        allowedGraphFunctionRefs: Object.freeze([graphFunctionRef]),
        allowedTraversalTargetRefs: Object.freeze([
          "graph-reentry-point://realization/0"
        ])
      })]);
    case "repair":
      return Object.freeze([Object.freeze({
        ...common("repair", "same_edge_retry", ["repair_same_edge"]),
        allowedGraphFunctionRefs: Object.freeze([graphFunctionRef])
      })]);
    case "continue":
      return Object.freeze([Object.freeze({
        ...common("continue", "public_start_reentry", ["continue_graph_call"]),
        allowedGraphFunctionRefs: Object.freeze([graphFunctionRef])
      })]);
    case "fh":
      return Object.freeze([Object.freeze(
        common("fh", "fh_input_required", ["open_fh_gate"])
      )]);
    case "ticket":
      return Object.freeze([Object.freeze(
        common("ticket", "ticket_traversal", ["create_ticket"])
      )]);
    case "reprice":
      return Object.freeze([Object.freeze(
        common("reprice", "escalation_or_reprice", ["propose_reprice"])
      )]);
    case "terminal":
      return Object.freeze([Object.freeze(common("terminal", "gap_stop", [
        "yield_progress",
        "close_episode",
        "block_episode"
      ]))]);
    default:
      throw new TypeError(`unsupported Scenario09 action variant ${JSON.stringify(actionVariant)}`);
  }
}

function buildMember({
  stageRole,
  sourceNode,
  targetNode,
  fibre,
  graphFunctionName = `t280.scenario09.${stageRole}`,
  vectorDeclarationEntries = Object.freeze([])
}) {
  const programRef = `program://t280/scenario09/${stageRole}`;
  const program = declareCProgram({
    programRef,
    term: C.of({
      input: carrier([sourceNode]),
      output: carrier([targetNode]),
      stageRole,
      fibre,
      armId: `arm://t280/${stageRole}`,
      resultBearing: true
    }),
    proportionalityClass: "P1"
  });
  const vectorName = `t280.scenario09.${stageRole}.vector`;
  const makeVector = ({ graphFunctionRef, vectorRef }) => {
    const declarations = compositionDeclarations({
      graphFunctionRef,
      vectorRef,
      source: [sourceNode],
      target: targetNode,
      stageRole,
      fibre
    });
    return constructGraphVector({
      name: vectorName,
      source: [sourceNode],
      target: targetNode,
      operators: [],
      evaluators: [],
      contexts: [],
      rule: null,
      allowsSubwork: false,
      declarations: graphVectorDeclarations([
        hogProgramRefDeclarationEntry(programRef),
        ...declarations.entries,
        ...vectorDeclarationEntries
      ]),
      tags: ["t280", "scenario09-lab"]
    });
  };
  const initialVector = makeVector({
    graphFunctionRef: `graph-function://derived/${graphFunctionName}`,
    vectorRef: `graph-vector://derived/${vectorName}`
  });
  const correctedVector = makeVector({
    graphFunctionRef: `graph-function://derived/${graphFunctionName}`,
    vectorRef: initialVector.id
  });
  const graph = constructGraph({
    name: `t280.scenario09.${stageRole}.graph`,
    inputs: [sourceNode],
    outputs: [targetNode],
    nodes: [sourceNode, targetNode],
    vectors: [correctedVector],
    contexts: [],
    rules: [],
    effects: [],
    tags: ["t280", "scenario09-lab"]
  });
  const host = constructGraphFunction({
    name: graphFunctionName,
    environment: constructEnvRef({
      requires: [sourceNode],
      provides: [targetNode],
      carries: [sourceNode, targetNode]
    }),
    inputs: [sourceNode],
    outputs: [targetNode],
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: `template://t280/scenario09/${stageRole}`,
      graph,
      version: null
    }),
    effects: [],
    declarations: graphFunctionDeclarations([
      cProgramCatalogDeclarationEntry([program]),
      hogProgramRefDeclarationEntry(programRef),
      pluginSelectionDeclarationEntry({ fdEvaluator: "plugin://abg/fd-evaluator" })
    ]),
    tags: ["t280", "scenario09-lab"]
  });
  const finalDeclarations = compositionDeclarations({
    graphFunctionRef: host.id,
    vectorRef: correctedVector.id,
    source: [sourceNode],
    target: targetNode,
    stageRole,
    fibre
  });
  const finalVector = constructGraphVector({
    ...correctedVector,
    declarations: graphVectorDeclarations([
      hogProgramRefDeclarationEntry(programRef),
      ...finalDeclarations.entries,
      ...vectorDeclarationEntries
    ])
  });
  const finalGraph = constructGraph({ ...graph, vectors: [finalVector] });
  const finalHost = constructGraphFunction({
    ...host,
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: `template://t280/scenario09/${stageRole}`,
      graph: finalGraph,
      version: null
    })
  });
  const module = constructModule({
    name: `t280.scenario09.${stageRole}.module`,
    graphs: [finalGraph],
    graphFunctions: [finalHost],
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
  return Object.freeze({ stageRole, finalGraph, finalHost, finalVector, module });
}

function compileOneSurfaceRecursePlan({ input, output }) {
  const vector = constructGraphVector({
    name: "t280.scenario09.foldback.vector",
    source: [input],
    target: output,
    operators: [],
    evaluators: [],
    contexts: [],
    rule: null,
    allowsSubwork: false,
    declarations: graphVectorDeclarations([]),
    tags: ["t280", "scenario09-lab", "foldback"]
  });
  const graph = constructGraph({
    name: "t280.scenario09.foldback.graph",
    inputs: [input],
    outputs: [output],
    nodes: [input, output],
    vectors: [vector],
    contexts: [],
    rules: [],
    effects: [],
    tags: ["t280", "scenario09-lab", "foldback"]
  });
  const operand = constructGraphFunction({
    name: "t280.scenario09.foldback",
    environment: constructEnvRef({
      requires: [input],
      provides: [output],
      carries: [input, output]
    }),
    inputs: [input],
    outputs: [output],
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: "template://t280/scenario09/foldback",
      graph,
      version: null
    }),
    effects: [],
    declarations: graphFunctionDeclarations([]),
    tags: ["t280", "scenario09-lab", "foldback"]
  });
  const wrapper = recurse(operand, Object.freeze({
    name: "t280_scenario09_continue",
    regime: "F_D",
    description: "continue while the declared One Surface episode remains open",
    binding: "binding://t280/scenario09/termination",
    consumedFieldRefs: Object.freeze([
      "field://t280/action-decision/disposition"
    ]),
    tags: Object.freeze(["t280", "termination"])
  }), {
    mode: "rebind",
    binding: "binding://t280/scenario09/decision-to-observation",
    requiresParentEvaluation: true
  });
  const module = constructModule({
    name: "t280.scenario09.one-surface-recurse",
    graphs: [graph],
    graphFunctions: [wrapper, operand],
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
  const application = compileGraphFunctionApplication({
    graphFunction: wrapper,
    graphFunctions: module.graphFunctions
  });
  if (!application.accepted || application.recurseRelation === null) {
    throw new Error(
      `T-280 recurse fixture did not compile: ${JSON.stringify(application.diagnostics)}`
    );
  }
  const binding = compileTypedRecurseBinding({
    module,
    graphFunction: wrapper,
    relation: application.recurseRelation
  });
  const policy = admitTypedRecursePolicy({
    kind: "typed_recurse_policy",
    policyRef: "policy://t280/scenario09/one-surface-recurse",
    policyVersion: "1.0.0",
    sourceInputCarrierRef: binding.inputCarrierRef,
    sourceInputPayloadRef: "payload://t280/scenario09/action-decision",
    budgetSourceFieldRef: "field://t280/scenario09/max-episodes",
    maxApplications: 3,
    evidenceRefs: ["evidence://t280/scenario09/recurse-policy"]
  });
  const plan = compileTypedRecursePlan({
    binding,
    policy,
    selectedCatalogEntryRef:
      "catalog-entry://t280/scenario09/one-surface-recurse"
  });
  return Object.freeze({ module, wrapper, operand, plan });
}

export function scenario09OneSurfaceProgramFixture(options = {}) {
  const observation = node("LabObservation");
  const normalizedObservation = node("NormalizedObservation");
  const model = node(
    "LabModel",
    ONE_SURFACE_RESULT_CONTRACT_FAMILY.synthesize_model.schemaRef
  );
  const gaps = node(
    "LabGapProjection",
    ONE_SURFACE_RESULT_CONTRACT_FAMILY.eval_gap.schemaRef
  );
  const nextAction = node(
    "LabNextAction",
    ONE_SURFACE_RESULT_CONTRACT_FAMILY.evaluate_next.schemaRef
  );
  const decision = node(
    "LabActionDecision",
    ONE_SURFACE_RESULT_CONTRACT_FAMILY.evaluate_action.schemaRef
  );
  const callableLabFunction = buildMember({
    stageRole: "normalize",
    sourceNode: observation,
    targetNode: normalizedObservation,
    fibre: "F_D",
    graphFunctionName: "Scenario09LabFunction"
  });
  const members = Object.freeze([
    buildMember({ stageRole: "synthesize_model", sourceNode: observation, targetNode: model, fibre: "F_D" }),
    buildMember({ stageRole: "eval_gap", sourceNode: model, targetNode: gaps, fibre: "F_D" }),
    buildMember({
      stageRole: "evaluate_next",
      sourceNode: gaps,
      targetNode: nextAction,
      fibre: "F_D",
      vectorDeclarationEntries: Object.freeze([
        allowedTraversalRowsEntry(allowedTraversalRows(
          callableLabFunction.finalHost.id,
          options.actionVariant
        ))
      ])
    }),
    buildMember({ stageRole: "evaluate_action", sourceNode: nextAction, targetNode: decision, fibre: "F_D" })
  ]);
  const recurse = compileOneSurfaceRecursePlan({
    input: decision,
    output: observation
  });
  const refinementBoundary = constructRefinementBoundary({
    name: "t280_scenario09_one_surface_refinement",
    inputs: [observation],
    outputs: [decision],
    hints: emptySerializedAttrs(),
    tags: ["t280", "scenario09-lab", "one-surface-refinement"]
  });
  const moduleName = options.moduleName ??
    "t280.scenario09.one-surface-program-module";
  const aggregateModule = constructModule({
    name: moduleName,
    graphs: [
      ...members.map((member) => member.finalGraph),
      callableLabFunction.finalGraph
    ],
    graphFunctions: [
      ...members.map((member) => member.finalHost),
      callableLabFunction.finalHost
    ],
    refinementBoundaries: options.includeRefinementBoundary === true
      ? [refinementBoundary]
      : [],
    candidateFamilies: [],
    jobs: [...members, callableLabFunction].map((member) => Object.freeze({
      id: `job-t280-scenario09-${member.stageRole}`,
      name: `t280_scenario09_${member.stageRole}`,
      contracts: Object.freeze([Object.freeze({
        kind: "graph_function",
        targetId: member.finalHost.id
      })]),
      roles: Object.freeze([]),
      tags: Object.freeze(["semantic_work", "t280", "scenario09-lab"]),
      policyHooks: emptySerializedAttrs()
    })),
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [constructModuleImport({
      source: recurse.plan.moduleName,
      names: [recurse.plan.wrapperGraphFunctionRef],
      version: "1.0.0"
    })],
    policyHooks: emptySerializedAttrs(),
    metadata: emptySerializedAttrs()
  });
  const compileMember = (member) => {
    const handoff = compileGraphVectorExecutionHandoff({
      graphFunction: member.finalHost,
      graphVector: member.finalVector,
      graphFunctions: aggregateModule.graphFunctions,
      module: aggregateModule,
      targetCarrierDefaults: defaults,
      admittedTenantConformanceManifest: null
    });
    if (handoff.status !== "published_startup_blocked") {
      throw new Error(
        `Scenario09 fixture handoff unexpected: ${handoff.status} ${JSON.stringify(handoff.diagnostics)}`
      );
    }
    const sourceInput = Object.freeze({
      kind: "selected_program_handoff",
      module: aggregateModule,
      executionSubjectGraphFunction: member.finalHost,
      declarationOwnerGraphFunction: member.finalHost,
      graphVector: member.finalVector,
      targetCarrierDefaults: defaults,
      admittedTenantConformanceManifest: null,
      outcome: handoff
    });
    const source = projectTraversalContractSourceBasis(sourceInput);
    const authorities = Object.freeze(source.workStages.map((stage) =>
      admitProgramLocusTraversalStageResultAuthority({ source, programLocusRef: stage.programLocusRef })
    ));
    const bundle = compileTraversalExecutionContracts({ source, resultAuthorities: authorities });
    return Object.freeze({
      member,
      sourceInput,
      source,
      authorities,
      bundle
    });
  };
  const compiled = Object.freeze(members.map(compileMember));
  const callableCompiled = compileMember(callableLabFunction);
  const allCompiled = Object.freeze([...compiled, callableCompiled]);
  const publicStartName = "scenario09-lab";
  const overlayRef = "overlay://t280/scenario09-lab";
  const gtlProgram = Object.freeze({
    subjectRef: options.subjectRef ?? "workspace://t280/scenario09-one-surface",
    abiPackageVersion: "5.0.0-dev.0",
    scopeKind: "submitted_structure",
    modules: [aggregateModule],
    sourceIdentitySurfaces: [],
    targetCarrierContracts: allCompiled.map((row) => row.source.targetCarrierProjection),
    edgeClosureContracts: allCompiled.map((row) => row.source.edgeClosureBinding.conformanceRow),
    overlays: [{
      overlayRef,
      graphFunctionRefs: [
        ...members.map((member) => member.finalHost.name),
        callableLabFunction.finalHost.name
      ],
      graphVectorRefs: [
        ...members.map((member) => member.finalVector.name),
        callableLabFunction.finalVector.name
      ],
      publicStartTargets: [members[0].finalHost.name],
      defaultStartTarget: members[0].finalHost.name
    }],
    publicStartTargets: [{
      name: publicStartName,
      graphFunctionRef: members[0].finalHost.name,
      overlayRefs: [overlayRef],
      defaultForOverlayRefs: [overlayRef]
    }],
    computeCompositions: allCompiled.map((row) => row.bundle.computeComposition),
    computeStageBindings: allCompiled.flatMap((row) => row.bundle.computeStageBindings),
    pluginResultInterfaces: allCompiled.flatMap((row) => row.bundle.pluginResultInterfaces),
    traversalBindConservation: allCompiled.map((row) => row.bundle.traversalBindConservation),
    runtimeBindings: [{
      bindingRef: "runtime-binding://t280/scenario09-one-surface",
      runtimeBindingKind: "abg_public_control_loop",
      moduleRef: aggregateModule.name,
      publicStartRef: publicStartName,
      commandRef: "abiogenesis-ts start",
      pluginContractRefs: [],
      stageBindingRefs: compiled.map((row) => row.bundle.computeStageBindings[0].stageBindingRef),
      consumesPluginsThroughAbg: true,
      forbidsProductLocalIteration: true,
      evidenceRefs: ["test://t280/scenario09-one-surface"]
    }]
  });
  return Object.freeze({
    authorityKinds: SCENARIO09_ONE_SURFACE_AUTHORITY_KINDS,
    aggregateModule,
    callableLabFunction,
    refinementBoundary,
    members,
    compiled,
    callableCompiled,
    allCompiled,
    recurse,
    recursePlan: recurse.plan,
    gtlProgram
  });
}
