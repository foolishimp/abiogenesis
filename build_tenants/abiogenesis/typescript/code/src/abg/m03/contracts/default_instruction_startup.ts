// Implements: T-189
// Implements: REQ-R-ABG3-INSTRUCTION-ASSEMBLY

import {
  constructGtlLibraryEntryDeclaration,
  constructProductRegistryStartupConfig
} from "../../../gtl/m02/contracts/runtime_registry.js";
import type { ExecutionBasis } from "./carriers.js";
import {
  compileInstructionAssemblyPlan,
  constructDerivedDependencyInstructionTruth,
  constructDerivedProofDepthInstructionTruth,
  constructInstructionAssemblyRule,
  constructInstructionSectionDecision,
  constructRuntimeBindingSlot,
  INSTRUCTION_ASSEMBLY_KNOWN_ALGEBRAS,
  type InstructionAssemblyComputeStageRole
} from "./instruction_assembly.js";

const DEFAULT_INSTRUCTION_RENDERER_REF =
  "renderer://abg/instruction-envelope/default";

export interface DefaultInstructionStartupOptions {
  readonly prefix?: string;
  readonly namespace?: string;
  readonly ownerRef?: string;
  readonly version?: string;
  readonly registryEntryRef?: string;
  readonly declarationRef?: string;
  readonly interfaceRef?: string;
  readonly sourceContractRef?: string;
  readonly targetContractRef?: string;
  readonly contextRefs?: readonly string[];
  readonly authorityRefs?: readonly string[];
  readonly overlayRefs?: readonly string[];
  readonly provenanceRefs?: readonly string[];
  readonly readinessRefs?: readonly string[];
  readonly proofRefs?: readonly string[];
  readonly policyRefs?: readonly string[];
  readonly declarationSourceRefs?: readonly string[];
  readonly pluginRefs?: readonly string[];
  readonly configSourceRefs?: readonly string[];
  readonly stageRoles?: readonly InstructionAssemblyComputeStageRole[];
  readonly vectorIndexes?: readonly number[];
  readonly rendererRef?: string;
}

function runtimeBindingSlots(prefix: string) {
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

function registryEntryRef(options: DefaultInstructionStartupOptions): string {
  return options.registryEntryRef ?? "registry-entry://abg/default-instruction";
}

function declarationRef(options: DefaultInstructionStartupOptions): string {
  return options.declarationRef ?? "gtl-declaration://abg/default-instruction";
}

function prefixFor(options: DefaultInstructionStartupOptions): string {
  return options.prefix ?? "abg-default-instruction";
}

function compiledInstructionPlanFor(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly computeStageRole: InstructionAssemblyComputeStageRole;
  readonly options: DefaultInstructionStartupOptions;
}) {
  const vector = input.basis.graph.vectors[input.vectorIndex];
  if (vector === undefined) {
    throw new Error(`no vector at index ${input.vectorIndex}`);
  }
  const prefix = prefixFor(input.options);
  const planRef =
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
    registryEntryRefs: [registryEntryRef(input.options)],
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
      rendererRefs: [input.options.rendererRef ?? DEFAULT_INSTRUCTION_RENDERER_REF],
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

export function constructDefaultInstructionAssemblyStartupForBasis(
  basis: ExecutionBasis,
  options: DefaultInstructionStartupOptions = {}
) {
  const stageRoles = options.stageRoles ?? [
    "transform",
    "evaluate",
    "consequence"
  ];
  const vectorIndexes =
    options.vectorIndexes ?? basis.graph.vectors.map((_, index) => index);
  const prefix = prefixFor(options);
  const declaration = constructGtlLibraryEntryDeclaration({
    declarationRef: declarationRef(options),
    entryRef: registryEntryRef(options),
    libraryScope: "product",
    entryKind: "graph_function",
    namespace: options.namespace ?? prefix,
    ownerRef: options.ownerRef ?? `owner://${prefix}`,
    version: options.version ?? "default",
    graphFunctionRef: basis.graphFunction.id,
    interfaceRef: options.interfaceRef ?? `interface://${prefix}/default`,
    sourceContractRef:
      options.sourceContractRef ?? `contract://${prefix}/source`,
    targetContractRef:
      options.targetContractRef ?? `contract://${prefix}/target`,
    contextRefs: options.contextRefs ?? [`context://${prefix}`],
    authorityRefs: options.authorityRefs ?? [`authority://${prefix}/abg`],
    overlayRefs: options.overlayRefs ?? [`overlay://${prefix}/default`],
    provenanceRefs:
      options.provenanceRefs ?? [`provenance://${prefix}/default`],
    readinessRefs: options.readinessRefs ?? [`readiness://${prefix}/default`],
    proofRefs: options.proofRefs ?? [`proof://${prefix}/default`],
    policyRefs: options.policyRefs ?? [`policy://${prefix}/default`],
    declarationSourceRefs:
      options.declarationSourceRefs ?? [`gtl://${prefix}/default`]
  });

  return Object.freeze({
    runtimeRegistryStartup: Object.freeze({
      systemDeclarations: Object.freeze([]),
      productStartupConfig: constructProductRegistryStartupConfig({
        configRef: `product-registry-startup://${prefix}`,
        productNamespace: options.namespace ?? prefix,
        ownerRef: options.ownerRef ?? `owner://${prefix}`,
        version: options.version ?? "default",
        enabledLibraryRefs: [
          registryEntryRef(options),
          declarationRef(options),
          `gtl://${prefix}/default`
        ],
        overlayRefs: options.overlayRefs ?? [`overlay://${prefix}/default`],
        pluginRefs: options.pluginRefs ?? [`plugin://${prefix}/fp-worker`],
        readinessRefs:
          options.readinessRefs ?? [`readiness://${prefix}/default`],
        proofRefs: options.proofRefs ?? [`proof://${prefix}/default`],
        policyRefs: options.policyRefs ?? [`policy://${prefix}/default`],
        configSourceRefs:
          options.configSourceRefs ?? [`config://${prefix}/default`]
      }),
      productDeclarations: Object.freeze([declaration]),
      correlationId: `correlation://${prefix}/instruction-startup`
    }),
    instructionAssemblyStartup: Object.freeze({
      compiledPromptPlans: Object.freeze(
        vectorIndexes.flatMap((vectorIndex) =>
          stageRoles.map((computeStageRole) =>
            compiledInstructionPlanFor({
              basis,
              vectorIndex,
              computeStageRole,
              options
            })
          )
        )
      ),
      rendererRef: options.rendererRef ?? DEFAULT_INSTRUCTION_RENDERER_REF
    })
  });
}
