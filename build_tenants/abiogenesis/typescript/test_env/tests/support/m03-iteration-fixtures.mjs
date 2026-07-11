import {
  ABG_FN_COMPOSITION_DECLARATION_KEY,
  admitExecutionBasis,
  admitModule,
  admitNode,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  constructDefaultInstructionAssemblyStartupForBasis,
  compileInstructionAssemblyPlan,
  compose,
  constructGraphFunction,
  constructDerivedDependencyInstructionTruth,
  constructDerivedProofDepthInstructionTruth,
  constructGtlLibraryEntryDeclaration,
  constructInstructionAssemblyRule,
  constructInstructionSectionDecision,
  constructProductRegistryStartupConfig,
  constructRuntimeBindingSlot,
  edge,
  graphFunctionForVector,
  graphFunctionDeclarations,
  INSTRUCTION_ASSEMBLY_KNOWN_ALGEBRAS
} from "../../../build/semantic/code/src/index.js";

function scalarEntry(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({ kind: "scalar", value })
  });
}

function stringListEntry(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({ kind: "string_list", value: Object.freeze([...value]) })
  });
}

function jsonValue(value) {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (Array.isArray(value)) {
    return Object.freeze({
      kind: "array",
      items: Object.freeze(value.map(jsonValue))
    });
  }
  return Object.freeze({
    kind: "object",
    entries: Object.freeze(
      Object.entries(value).map(([key, entryValue]) =>
        Object.freeze({ key, value: jsonValue(entryValue) })
      )
    )
  });
}

function jsonEntry(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({ kind: "json_blob", value: jsonValue(value) })
  });
}

const DEFAULT_INSTRUCTION_RENDERER_REF =
  "renderer://abg/instruction-envelope/default";

function runtimeBindingSlots(prefix = "m03-iteration") {
  return Object.freeze([
    constructRuntimeBindingSlot({
      slotRef: `slot://${prefix}/graph-call`,
      slotClass: "graph_call",
      required: true,
      sourceTruthKind: "replay_event",
      evidenceRefs: [`evidence://${prefix}/slot/graph-call`]
    }),
    constructRuntimeBindingSlot({
      slotRef: `slot://${prefix}/frame`,
      slotClass: "frame",
      required: true,
      sourceTruthKind: "replay_event",
      evidenceRefs: [`evidence://${prefix}/slot/frame`]
    }),
    constructRuntimeBindingSlot({
      slotRef: `slot://${prefix}/vector`,
      slotClass: "vector",
      required: true,
      sourceTruthKind: "projection",
      evidenceRefs: [`evidence://${prefix}/slot/vector`]
    }),
    constructRuntimeBindingSlot({
      slotRef: `slot://${prefix}/event-log`,
      slotClass: "event_log",
      required: true,
      sourceTruthKind: "projection",
      evidenceRefs: [`evidence://${prefix}/slot/event-log`]
    }),
    constructRuntimeBindingSlot({
      slotRef: `slot://${prefix}/worker`,
      slotClass: "worker_invocation",
      required: true,
      sourceTruthKind: "replay_event",
      evidenceRefs: [`evidence://${prefix}/slot/worker`]
    })
  ]);
}

// Fail-closed option surface (DMM R2-F3): a typo'd option must throw, not
// silently no-op a proof. One shared set across the fixture entry points.
const M03_FIXTURE_KNOWN_OPTIONS = new Set([
  "approvalSubjectRef", "authorityRefs", "configRef", "configSourceRefs",
  "consequenceFpBinding", "contextRefs", "correlationId", "declarationRef",
  "declarationSourceRefs", "defaultRegime", "dispatchRef", "frameId",
  "frameLineageId", "graphFunctionDeclarationEntries", "includeComposition",
  "interfaceRef", "namespace",
  "overlayRefs", "ownerRef", "pluginRefs", "policyRefs", "prefix",
  "proofRefs", "provenanceRefs", "readinessRefs", "registryEntryRef",
  "rendererRef", "runId", "sourceContractRef", "stageRoles",
  "targetContractRef", "until", "vectorDeclarationEntriesByIndex",
  "vectorConsumedFieldRefsByIndex", "vectorIndexes", "vectorRegimes", "version",
  "workKey"
]);

function assertKnownM03FixtureOptions(options, label) {
  for (const key of Object.keys(options)) {
    if (!M03_FIXTURE_KNOWN_OPTIONS.has(key)) {
      throw new Error(`${label}: unknown fixture option "${key}"`);
    }
  }
}

export function m03InstructionRegistryEntryRef(options = {}) {
  assertKnownM03FixtureOptions(options, "m03InstructionRegistryEntryRef");
  return options.registryEntryRef ?? "registry-entry://m03-iteration/default";
}

export function m03InstructionGraphFunctionDeclaration(basis, options = {}) {
  assertKnownM03FixtureOptions(options, "m03InstructionGraphFunctionDeclaration");
  const registryEntryRef = m03InstructionRegistryEntryRef(options);
  return constructGtlLibraryEntryDeclaration({
    declarationRef:
      options.declarationRef ?? "gtl-declaration://m03-iteration/default",
    entryRef: registryEntryRef,
    libraryScope: "product",
    entryKind: "graph_function",
    namespace: options.namespace ?? "m03.iteration",
    ownerRef: options.ownerRef ?? "owner://abg/m03-iteration",
    version: options.version ?? "test",
    graphFunctionRef: basis.graphFunction.id,
    interfaceRef: options.interfaceRef ?? "interface://m03-iteration/default",
    sourceContractRef:
      options.sourceContractRef ?? "contract://m03-iteration/source",
    targetContractRef:
      options.targetContractRef ?? "contract://m03-iteration/target",
    contextRefs: options.contextRefs ?? ["context://m03-iteration"],
    authorityRefs: options.authorityRefs ?? ["authority://m03-iteration/abg"],
    overlayRefs: options.overlayRefs ?? ["overlay://m03-iteration/default"],
    provenanceRefs:
      options.provenanceRefs ?? ["provenance://m03-iteration/default"],
    readinessRefs:
      options.readinessRefs ?? ["readiness://m03-iteration/default"],
    proofRefs: options.proofRefs ?? ["proof://m03-iteration/default"],
    policyRefs: options.policyRefs ?? ["policy://m03-iteration/default"],
    declarationSourceRefs:
      options.declarationSourceRefs ?? ["gtl://m03-iteration/default"]
  });
}

export function m03InstructionRegistryStartupForBasis(basis, options = {}) {
  assertKnownM03FixtureOptions(options, "m03InstructionRegistryStartupForBasis");
  return Object.freeze({
    systemDeclarations: Object.freeze([]),
    productStartupConfig: constructProductRegistryStartupConfig({
      configRef: options.configRef ?? "product-registry-startup://m03-iteration",
      productNamespace: options.namespace ?? "m03.iteration",
      ownerRef: options.ownerRef ?? "owner://abg/m03-iteration",
      version: options.version ?? "test",
      enabledLibraryRefs: [
        m03InstructionRegistryEntryRef(options),
        options.declarationRef ?? "gtl-declaration://m03-iteration/default",
        "gtl://m03-iteration/default"
      ],
      overlayRefs: options.overlayRefs ?? ["overlay://m03-iteration/default"],
      pluginRefs: options.pluginRefs ?? ["plugin://m03-iteration/fp-worker"],
      readinessRefs:
        options.readinessRefs ?? ["readiness://m03-iteration/default"],
      proofRefs: options.proofRefs ?? ["proof://m03-iteration/default"],
      policyRefs: options.policyRefs ?? ["policy://m03-iteration/default"],
      configSourceRefs:
        options.configSourceRefs ?? ["config://m03-iteration/default"]
    }),
    productDeclarations: Object.freeze([
      m03InstructionGraphFunctionDeclaration(basis, options)
    ]),
    correlationId:
      options.correlationId ?? "correlation://m03-iteration/instruction-startup"
  });
}

export function m03CompiledInstructionPlanFor(input) {
  const vector = input.basis.graph.vectors[input.vectorIndex];
  if (vector === undefined) {
    throw new Error(`no vector at index ${input.vectorIndex}`);
  }
  const prefix = input.prefix ?? "m03-iteration";
  const planRef =
    input.planRef ??
    `compiled-prompt-plan://${prefix}/vector-${input.vectorIndex}/${input.computeStageRole}`;
  const result = compileInstructionAssemblyPlan({
    planRef,
    computeStageRole: input.computeStageRole,
    rule: constructInstructionAssemblyRule({
      ruleRef: `instruction-rule://${prefix}/vector-${input.vectorIndex}/${input.computeStageRole}`,
      appliesToGraphFunctionRefs: [input.basis.graphFunction.id],
      appliesToVectorRefs: [vector.name],
      sectionRules: [
        {
          sectionRef: `section://${prefix}/vector-${input.vectorIndex}/${input.computeStageRole}`,
          required: true,
          policyRefs: [`policy://${prefix}/current-vector`]
        }
      ],
      relevanceRules: [
        {
          ruleRef: `relevance://${prefix}/vector-${input.vectorIndex}/${input.computeStageRole}`,
          requiredInputRefs: [],
          allowFutureStageRefs: []
        }
      ],
      compressionPolicyRef: `compression://${prefix}/digest`,
      proportionalityPolicyRef: `proportionality://${prefix}/p1-worker`,
      runtimeBindingSlotClasses: [
        "graph_call",
        "frame",
        "vector",
        "event_log",
        "worker_invocation"
      ],
      policyRefs: [`policy://${prefix}`],
      evidenceRefs: [`evidence://${prefix}/rule`]
    }),
    graphFunctionRef: input.basis.graphFunction.id,
    vectorRef: vector.name,
    registryEntryRefs: [m03InstructionRegistryEntryRef(input.options ?? {})],
    sourceNodeRefs: vector.source.map((entry) => entry.id),
    targetNodeRef: vector.target.id,
    derivedTruth: {
      kind: "derived_instruction_carrier_truth",
      sourceTypeRefs: vector.source.map((entry) => entry.schema.ref),
      targetTypeRefs: [vector.target.schema.ref],
      outputContractRefs: [
        `contract://${prefix}/vector-${input.vectorIndex}/${input.computeStageRole}`
      ],
      proofRefs: [
        `proof://${prefix}/vector-${input.vectorIndex}/${input.computeStageRole}`
      ],
      authorityRefs: [`authority://${prefix}/abg`],
      rendererRefs: [DEFAULT_INSTRUCTION_RENDERER_REF],
      activeRegime: "F_P",
      carrierClassRefs: [
        ...vector.source.map((entry) => entry.assetSurface.kind),
        vector.target.assetSurface.kind
      ]
    },
    knownAlgebraRefs: [...INSTRUCTION_ASSEMBLY_KNOWN_ALGEBRAS],
    requiredInputRefs: [],
    availableInputRefs: [],
    sectionDecisions: [
      constructInstructionSectionDecision({
        sectionRef: `section://${prefix}/vector-${input.vectorIndex}/${input.computeStageRole}`,
        disposition: "include",
        dependencyRefs: [vector.name],
        carrierRefs: [
          ...vector.source.map((entry) => entry.id),
          vector.target.id
        ],
        compressionMode: "digest",
        text: `Run ${input.computeStageRole} for ${vector.name} without carrying an answer marker.`,
        digestRef: `sha256:${prefix}-vector-${input.vectorIndex}-${input.computeStageRole}`,
        excerptDigest: null,
        fullContentAdmitted: false,
        stageRef: `stage://${prefix}/${input.computeStageRole}`,
        gapRefs: []
      })
    ],
    bindingSlots: runtimeBindingSlots(prefix),
    proportionalityClass: "P1",
    instructionWorkKind: "target_work",
    dependencyInstructionTruth: constructDerivedDependencyInstructionTruth({
      truthRef: `dependency-instruction-truth://${prefix}/vector-${input.vectorIndex}/${input.computeStageRole}`,
      workKind: "target_work",
      dependencyGraphRef: null,
      dependencyGraphDigest: null,
      targetRefs: [vector.target.id],
      prerequisiteNodeRefs: [],
      prerequisiteEdgeRefs: [],
      dependencyClosed: true,
      typedPrerequisiteGapRefs: [],
      noDependencyPolicyRef: `policy://${prefix}/no-dependency-required`,
      sourceProjectionRefs: [`projection://${prefix}/no-dependency-required`]
    }),
    proofDepthInstructionTruth: constructDerivedProofDepthInstructionTruth({
      truthRef: `proof-depth-instruction-truth://${prefix}/vector-${input.vectorIndex}/${input.computeStageRole}`,
      depthPolicyRef: `proof-depth-policy://${prefix}`,
      depthPolicyDigest: `sha256:${prefix}-proof-depth-policy`,
      targetRefs: [vector.target.id],
      requiredDepthClassRefs: ["depth-class://positive", "depth-class://negative"],
      declaredDepthClassRefs: ["depth-class://positive", "depth-class://negative"],
      declaredDepthObligationRefs: [
        `proof-obligation://${prefix}/positive`,
        `proof-obligation://${prefix}/negative`
      ],
      notApplicableDepthClassRefs: [],
      typedDepthGapRefs: [],
      proofStrengthAdmissionRefs: [`proof-strength-admission://${prefix}`],
      fdStrengthCriterionRefs: [`fd-strength-criterion://${prefix}`],
      adversarialVerificationRefs: [],
      adversarialCounterexampleRefs: [],
      sourceProjectionRefs: [
        `proof-coverage-projection://${prefix}/vector-${input.vectorIndex}/${input.computeStageRole}`
      ],
      depthComplete: true,
      proofStrengthAdmitted: true
    }),
    expectedAnswerMarkers: ["forbidden-answer-marker"],
    fpValidationEvidenceRefs: [`semantic-review-gate://${prefix}`],
    compilerEvidenceRefs: [`evidence://${prefix}/compiler`]
  });
  if (!result.accepted || result.plan === null) {
    throw new Error(JSON.stringify(result.issues));
  }
  return result.plan;
}

export function m03InstructionAssemblyStartupForBasis(basis, options = {}) {
  assertKnownM03FixtureOptions(options, "m03InstructionAssemblyStartupForBasis");
  const stageRoles = options.stageRoles ?? ["transform", "evaluate", "consequence"];
  const vectorIndexes =
    options.vectorIndexes ?? basis.graph.vectors.map((_, index) => index);
  return Object.freeze({
    compiledPromptPlans: Object.freeze(
      vectorIndexes.flatMap((vectorIndex) =>
        stageRoles.map((computeStageRole) =>
          m03CompiledInstructionPlanFor({
            basis,
            vectorIndex,
            computeStageRole,
            prefix: options.prefix
          })
        )
      )
    ),
    rendererRef: options.rendererRef ?? DEFAULT_INSTRUCTION_RENDERER_REF
  });
}

export function m03InstructionAssemblyRequestFields(basis, options = {}) {
  assertKnownM03FixtureOptions(options, "m03InstructionAssemblyRequestFields");
  return constructDefaultInstructionAssemblyStartupForBasis(basis, {
    prefix: options.prefix ?? "m03-iteration",
    namespace: options.namespace ?? "m03.iteration",
    ownerRef: options.ownerRef ?? "owner://abg/m03-iteration",
    version: options.version ?? "test",
    registryEntryRef: m03InstructionRegistryEntryRef(options),
    declarationRef:
      options.declarationRef ?? "gtl-declaration://m03-iteration/default",
    interfaceRef: options.interfaceRef ?? "interface://m03-iteration/default",
    sourceContractRef:
      options.sourceContractRef ?? "contract://m03-iteration/source",
    targetContractRef:
      options.targetContractRef ?? "contract://m03-iteration/target",
    contextRefs: options.contextRefs ?? ["context://m03-iteration"],
    authorityRefs: options.authorityRefs ?? ["authority://m03-iteration/abg"],
    overlayRefs: options.overlayRefs ?? ["overlay://m03-iteration/default"],
    provenanceRefs:
      options.provenanceRefs ?? ["provenance://m03-iteration/default"],
    readinessRefs:
      options.readinessRefs ?? ["readiness://m03-iteration/default"],
    proofRefs: options.proofRefs ?? ["proof://m03-iteration/default"],
    policyRefs: options.policyRefs ?? ["policy://m03-iteration/default"],
    declarationSourceRefs:
      options.declarationSourceRefs ?? ["gtl://m03-iteration/default"],
    pluginRefs: options.pluginRefs ?? ["plugin://m03-iteration/fp-worker"],
    configSourceRefs:
      options.configSourceRefs ?? ["config://m03-iteration/default"],
    stageRoles: options.stageRoles,
    vectorIndexes: options.vectorIndexes
  });
}

function fnCompositionDeclarations(options = {}) {
  const regimeBindings = Object.freeze([
    {
      bindingRef: "regime-binding://m03-iteration/transform/fd",
      stageRole: "transform",
      regime: "F_D",
      role: "construct",
      order: 0,
      authority: "evidence",
      inputCarrierRefs: ["EnginePluginInput"],
      outputCarrierRefs: ["ComposedStageTaskOutcome"],
      evidenceRefs: ["evidence://m03-iteration/fd-transform"]
    },
    {
      bindingRef: "regime-binding://m03-iteration/transform/fp",
      stageRole: "transform",
      regime: "F_P",
      role: "construct",
      order: 1,
      authority: "evidence",
      inputCarrierRefs: ["EnginePluginInput"],
      outputCarrierRefs: ["FpDispatchOutcome"],
      evidenceRefs: ["evidence://m03-iteration/fp-transform"]
    },
    {
      bindingRef: "regime-binding://m03-iteration/evaluate/fd",
      stageRole: "evaluate",
      regime: "F_D",
      role: "validate",
      order: 2,
      authority: "closure",
      inputCarrierRefs: ["EnginePluginInput"],
      outputCarrierRefs: ["FdEvaluationOutcome"],
      evidenceRefs: ["evidence://m03-iteration/fd-evaluate"]
    },
    {
      bindingRef: "regime-binding://m03-iteration/evaluate/fp",
      stageRole: "evaluate",
      regime: "F_P",
      role: "validate",
      order: 3,
      authority: "judgment",
      inputCarrierRefs: ["EnginePluginInput"],
      outputCarrierRefs: ["FpEvaluationOutcome"],
      evidenceRefs: ["evidence://m03-iteration/fp-evaluate"]
    },
    {
      bindingRef: "regime-binding://m03-iteration/consequence/fd",
      stageRole: "consequence",
      regime: "F_D",
      role: "observe",
      order: 4,
      authority: "evidence",
      inputCarrierRefs: ["EnginePluginInput"],
      outputCarrierRefs: ["ConsequenceProjectionOutcome"],
      evidenceRefs: ["evidence://m03-iteration/consequence"]
    },
    // Opt-in (T-190): a consequence/F_P binding so the composed-consequence
    // F_P dispatch arm is drivable; default OFF to keep every existing
    // caller's composition identity unchanged.
    ...(options.consequenceFpBinding === true
      ? [
          {
            bindingRef: "regime-binding://m03-iteration/consequence/fp",
            stageRole: "consequence",
            regime: "F_P",
            role: "observe",
            order: 5,
            authority: "evidence",
            inputCarrierRefs: ["EnginePluginInput"],
            outputCarrierRefs: ["ComposedStageTaskOutcome"],
            evidenceRefs: ["evidence://m03-iteration/fp-consequence"]
          }
        ]
      : []),
    {
      bindingRef: "regime-binding://m03-iteration/human-callout/fh",
      stageRole: "human_callout",
      regime: "F_H",
      role: "escalate",
      order: 5,
      authority: "judgment",
      inputCarrierRefs: ["EnginePluginInput"],
      outputCarrierRefs: ["FhAdmissionOutcome"],
      evidenceRefs: ["evidence://m03-iteration/fh-callout"]
    }
  ]);
  return Object.freeze({
    entries: Object.freeze([
      Object.freeze({
        key: ABG_FN_COMPOSITION_DECLARATION_KEY,
        value: Object.freeze({
          kind: "hook_ref",
          value: Object.freeze({
            ref: "hook://m03-iteration/abg-fn-composition",
            config: Object.freeze({
              entries: Object.freeze([
                scalarEntry(
                  "contract_ref",
                  "abg.fn_composition://m03-iteration/default"
                ),
                stringListEntry("standards_context_refs", [
                  "standard://m03-iteration"
                ]),
                stringListEntry("policy_context_refs", [
                  "policy://m03-iteration"
                ]),
                stringListEntry("carrier_context_refs", [
                  "carrier://m03-iteration"
                ]),
                stringListEntry("assurance_context_refs", [
                  "assurance://m03-iteration"
                ]),
                scalarEntry(
                  "closure_contract_ref",
                  "closure://m03-iteration/fd-evaluate"
                ),
                jsonEntry("regime_bindings", regimeBindings)
              ])
            })
          })
        })
      })
    ])
  });
}

function node(id, name, kind, markov) {
  return admitNode({
    id,
    name,
    schema: { kind: "symbolic", ref: `Vector[${kind}]` },
    markov: [markov],
    assetSurface: {
      kind,
      requiredContexts: ["workspace"],
      standardsRefs: [`${kind}-standard`],
      outputContractRefs: [`${kind}-contract`]
    },
    tags: [kind]
  });
}

function stageGraphFunction(
  name,
  source,
  target,
  edgeName,
  evaluatorId,
  regime,
  includeComposition,
  vectorDeclarationEntries = [],
  vectorConsumedFieldRefs = [],
  compositionOptions = {}
) {
  const vector = edge([source], target, {
    id: `graph-${name}`,
    name: edgeName,
    evaluators: [
      {
        name: evaluatorId,
        regime,
        description: `${edgeName} accepted`,
        binding: `binding://${name}`,
        tags: ["fulfillment"],
        consumedFieldRefs: vectorConsumedFieldRefs
      }
    ],
    declarations: { entries: Object.freeze([...vectorDeclarationEntries]) },
    tags: ["m03_iteration"]
  }).vectors[0];

  return graphFunctionForVector(vector, {
    name,
    declarations: includeComposition ? fnCompositionDeclarations(compositionOptions) : { entries: [] },
    tags: ["m03_iteration"]
  });
}

export function buildThreeStageModule(options = {}) {
  assertKnownM03FixtureOptions(options, "buildThreeStageModule");
  const vectorRegimes = options.vectorRegimes ?? [
    options.defaultRegime ?? "F_P",
    options.defaultRegime ?? "F_P",
    options.defaultRegime ?? "F_P"
  ];
  const inputSet = node("node-m03-input-set", "InputSet", "input_set", "declared");
  const requirements = node(
    "node-m03-requirements",
    "Requirements",
    "requirements",
    "captured"
  );
  const design = node("node-m03-design", "Design", "design", "derived");
  const code = node("node-m03-code", "Code", "code", "implemented");

  const composedExecutive = compose(
    stageGraphFunction(
      "capture_requirements",
      inputSet,
      requirements,
      "input_set→requirements",
      "requirements_ready",
      vectorRegimes[0],
      options.includeComposition !== false,
      options.vectorDeclarationEntriesByIndex?.[0] ?? [],
      options.vectorConsumedFieldRefsByIndex?.[0] ?? [],
      { consequenceFpBinding: options.consequenceFpBinding === true }
    ),
    stageGraphFunction(
      "synthesize_design",
      requirements,
      design,
      "requirements→design",
      "design_ready",
      vectorRegimes[1],
      options.includeComposition !== false,
      options.vectorDeclarationEntriesByIndex?.[1] ?? [],
      options.vectorConsumedFieldRefsByIndex?.[1] ?? [],
      { consequenceFpBinding: options.consequenceFpBinding === true }
    ),
    stageGraphFunction(
      "implement_code",
      design,
      code,
      "design→code",
      "code_ready",
      vectorRegimes[2],
      options.includeComposition !== false,
      options.vectorDeclarationEntriesByIndex?.[2] ?? [],
      options.vectorConsumedFieldRefsByIndex?.[2] ?? [],
      { consequenceFpBinding: options.consequenceFpBinding === true }
    )
  );
  const executive =
    options.graphFunctionDeclarationEntries === undefined
      ? composedExecutive
      : constructGraphFunction({
          ...composedExecutive,
          declarations: graphFunctionDeclarations([
            ...composedExecutive.declarations.entries,
            ...options.graphFunctionDeclarationEntries
          ]),
          id: undefined
        });

  const module = admitModule({
    name: "m03_iteration_module",
    graphs: [],
    graphFunctions: [executive],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [
      {
        id: "job-m03-iteration",
        name: "m03_iteration_job",
        contracts: [{ kind: "graph_function", targetId: executive.id }],
        roles: [],
        tags: ["semantic_work"]
      }
    ],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    metadata: { entries: [] }
  });

  return Object.freeze({ module, executive });
}

export function buildThreeStageBasis(options = {}) {
  assertKnownM03FixtureOptions(options, "buildThreeStageBasis");
  const defaultRegime = options.defaultRegime ?? "F_P";
  const { module, executive } = buildThreeStageModule({
    defaultRegime,
    consequenceFpBinding: options.consequenceFpBinding,
    vectorRegimes: options.vectorRegimes,
    includeComposition: options.includeComposition,
    graphFunctionDeclarationEntries: options.graphFunctionDeclarationEntries,
    vectorDeclarationEntriesByIndex: options.vectorDeclarationEntriesByIndex,
    vectorConsumedFieldRefsByIndex: options.vectorConsumedFieldRefsByIndex
  });
  const dispatchRef =
    Object.hasOwn(options, "dispatchRef")
      ? options.dispatchRef
      : defaultRegime === "F_P"
        ? "dispatch://m03-iteration"
        : null;
  const approvalSubjectRef =
    Object.hasOwn(options, "approvalSubjectRef")
      ? options.approvalSubjectRef
      : defaultRegime === "F_H"
        ? "approval://m03-iteration"
        : null;

  return admitExecutionBasis({
    startIntent: {
      scope: {
        kind: "workspace",
        workspaceRoot: "/workspace/m03-iteration",
        moduleName: module.name
      },
      target: {
        kind: "graph_function",
        handle: executive.name
      },
      until: "converged"
    },
    module,
    runtimeIdentity: admitResolvedRuntimeIdentity({
      workerId: "worker://m03-iteration",
      backendId: "backend://node",
      buildId: "build://typescript",
      resolvedRuntimeRef: "runtime://typescript/node"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://m03-iteration",
      defaultRegime,
      dispatchRef,
      approvalSubjectRef
    }),
    runId: options.runId ?? "run://m03-iteration",
    workKey: options.workKey ?? "wk://m03-iteration",
    frameId: options.frameId ?? null,
    frameLineageId: options.frameLineageId ?? null
  });
}

export function readmitThreeStageBasis(basis) {
  const graphFunction = constructGraphFunction({
    ...basis.graphFunction,
    id: basis.graphFunction.id
  });
  const module = admitModule({
    name: basis.moduleName,
    graphs: [],
    graphFunctions: [graphFunction],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [basis.job],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    policyHooks: basis.modulePolicyHooks,
    metadata: { entries: [] }
  });
  return admitExecutionBasis({
    startIntent: basis.startIntent,
    module,
    runtimeIdentity: basis.runtimeIdentity,
    resolvedPolicy: basis.resolvedPolicy,
    runId: basis.runId,
    workKey: basis.workKey,
    frameId: basis.frameId,
    frameLineageId: basis.frameLineageId
  });
}

export function buildThreeStageStartContext(options = {}) {
  assertKnownM03FixtureOptions(options, "buildThreeStageStartContext");
  const defaultRegime = options.defaultRegime ?? "F_D";
  const { module, executive } = buildThreeStageModule({
    defaultRegime,
    vectorRegimes: options.vectorRegimes,
    includeComposition: options.includeComposition,
    graphFunctionDeclarationEntries: options.graphFunctionDeclarationEntries,
    vectorDeclarationEntriesByIndex: options.vectorDeclarationEntriesByIndex,
    vectorConsumedFieldRefsByIndex: options.vectorConsumedFieldRefsByIndex
  });
  const dispatchRef =
    Object.hasOwn(options, "dispatchRef")
      ? options.dispatchRef
      : defaultRegime === "F_P"
        ? "dispatch://m03-iteration"
        : null;
  const approvalSubjectRef =
    Object.hasOwn(options, "approvalSubjectRef")
      ? options.approvalSubjectRef
      : defaultRegime === "F_H"
        ? "approval://m03-iteration"
        : null;
  const input = Object.freeze({
    scope: {
      kind: "workspace",
      workspaceRoot: "/workspace/m03-iteration",
      moduleName: module.name
    },
    target: {
      kind: "graph_function",
      handle: executive.name
    },
    until: options.until ?? "converged"
  });
  const contextBase = {
    module,
    runtimeIdentity: admitResolvedRuntimeIdentity({
      workerId: "worker://m03-iteration",
      backendId: "backend://node",
      buildId: "build://typescript",
      resolvedRuntimeRef: "runtime://typescript/node"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://m03-iteration",
      defaultRegime,
      dispatchRef,
      approvalSubjectRef
    }),
    runId: options.runId ?? "run://m03-iteration",
    workKey: options.workKey ?? "wk://m03-iteration",
    frameId: options.frameId ?? null,
    frameLineageId: options.frameLineageId ?? null
  };
  const basis = admitExecutionBasis({
    startIntent: input,
    module,
    runtimeIdentity: contextBase.runtimeIdentity,
    resolvedPolicy: contextBase.resolvedPolicy,
    runId: contextBase.runId,
    workKey: contextBase.workKey,
    frameId: contextBase.frameId,
    frameLineageId: contextBase.frameLineageId
  });
  const context = Object.freeze({
    ...contextBase,
    ...m03InstructionAssemblyRequestFields(basis)
  });

  return Object.freeze({ input, context, module, executive, basis });
}

// ONE input-derived fulfilled attached artifact (DMM R2-F2). Sixteen test
// files carry local copies; new and touched files use THIS. Payload-shape
// field additions land here once.
export function fulfilledAttachedArtifactFor(input, overrides = {}) {
  const assessmentIds =
    input.expectedAssessmentIds.length > 0
      ? input.expectedAssessmentIds
      : ["runtime_fulfilled"];
  return {
    edge: input.expectedEdge ?? input.edge,
    actor: overrides.actor ?? "codex",
    fulfillment_assessments: assessmentIds.map((assessmentId) => ({
      id: assessmentId,
      evaluator: assessmentId,
      fulfillment_status: overrides.fulfillmentStatus ?? "fulfilled",
      fulfillment_detail: overrides.fulfillmentDetail ?? "fixture worker result accepted",
      blocking_reasons: overrides.blockingReasons ?? [],
      evidence_refs: overrides.evidenceRefs ?? [`proof://${assessmentId}`]
    })),
    selected_worker_id: input.workerId,
    selected_backend: input.backendId,
    role_id: overrides.roleId ?? "role://fixture/runtime",
    assignment_source: "policy_resolution",
    resolved_runtime_ref: input.resolvedRuntimeRef
  };
}
