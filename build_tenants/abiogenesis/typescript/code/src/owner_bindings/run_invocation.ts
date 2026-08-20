import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as v from "valibot";

import {
  projectExactPrefixArtifactTruth,
  type ExactPrefixArtifactTruthProjection,
} from "../abg/artifact_truth.js";
import {
  acquireAbgEventResource,
  abandonAbgEventResource,
  closeAbgEventResource,
  type AbgEventResourceAssertion,
  type AbgEventResourceReceipt,
  type AcquiredAbgEventResource,
} from "../abg/definition_event_resource.js";
import {
  hasAdmittedProductInstall,
  projectAdmittedProductInstall,
  projectAdmittedWorkspaceBinding,
  type PublicOperationAdmissionBasis,
} from "../abg/environment_admission.js";
import {
  admitExecutionBasis,
  admitInvocationRefusal,
  hasExactInvocationObservationBasis,
} from "../abg/execution_basis.js";
import {
  admitRuntimeFailure,
} from "../abg/runtime_failure.js";
import {
  type DurablePrefixCoordinate,
  type EventStoreCloseHandoff,
  selectHeldEventStoreDurablePrefix,
  validateDurablePrefixCoordinate,
  validateEventStoreCloseHandoff,
} from "../abg/event_store.js";
import {
  admitExactInvocation,
  rehydrateInvocationSourceResultBasisAtDurablePrefix,
  type InvocationAdmission,
} from "../abg/invocation_admission.js";
import { openTraversalScope } from "../abg/open_call.js";
import {
  projectRunTruthAtDurablePrefix,
  type AbgRunTruthCoordinate,
  type AbgRunTruthProjection,
} from "../abg/project_read_ports.js";
import { projectRuntimeTruthAtDurablePrefix } from "../abg/replay.js";
import { materializeGraph } from "../gtl/materialize.js";
import { canonicalizeAuthoredGtlCarrier } from
  "../gtl/canonicalization.js";
import type {
  GraphFunction,
  ModulePublication,
} from "../gtl/contracts.js";
import { executeGraphTraversalEffect } from "../hog/graph_execute.js";
import { constructAdmittedLeafInvocationPort } from
  "../implementation/leaf_invocation_port.js";
import {
  admitGraphFunctionCatalog,
  narrowGraphFunctionCatalog,
  type CatalogReadinessBasis,
  type DeclarationApplication,
  type GraphFunctionCatalogView,
  type ReadyGraphFunctionCatalog,
} from "../product/catalog.js";
import {
  isProductInstallCandidate,
  isResolvedProductLock,
  isWorkspaceBindingCandidate,
  type ProductInstall,
  type ResolvedProductLock,
  type WorkspaceBinding,
  type WorkspaceBindingCandidate,
} from "../product/environment.js";
import type {
  ProductInstallCandidate,
  VerifiedProductArtifact,
} from "../product/contracts.js";
import {
  ProductRunInvocationPort,
  type PreparedProductRunInvocation,
  type ProductRunInvocationResourceAssertion,
  type ProductRunInvocationSourceAssertion,
  type RunInvocationMemberKey,
} from "../product/run_invocation_operation.js";
import { RUN_OPERATION_CONTRACTS } from
  "../product/run_operation_contracts.js";
import {
  projectInstalledLeafSemantics,
  type ProductInvocationSourceResultBasis,
} from "../product/semantics.js";
import { canonicalJson, type JsonValue } from
  "../shared/canonical_json.js";
import {
  isRecord,
  sameJson,
} from "../shared/definition_binding_mechanics.js";
import { bindExactPrefixTransition } from
  "../shared/static_definition_bindings.js";
import {
  type DefinitionCall,
  type DefinitionExecutionFault,
  type DefinitionReturn,
  type ExactDefinitionCallable,
} from "../shared/effect_definition.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { constructExactOperationInvocationCoordinate } from
  "../shared/operation_definition_coordinate.js";
import {
  absolutePathSchema,
  digestSchema,
  jsonValueSchema,
  nonblankSchema,
  refDigestSchema,
  type OwnerSemanticOutput,
} from "../shared/public_function_contracts.js";
import { validateGraph } from "../validator/graph.js";
import { rawAdmitValue, type RawAdmittedValue } from
  "../validator/raw_admission.js";
import { validatePublication } from "../validator/validation.js";
import { isVerifiedProductArtifact } from "../product/verify_product.js";

type InvokePacket = typeof RUN_OPERATION_CONTRACTS.invoke.invoke;
type StartPacket = typeof RUN_OPERATION_CONTRACTS.invoke.start;
type RunPacket = InvokePacket | StartPacket;

export interface RunInvocationResourceAssertion
  extends ProductRunInvocationResourceAssertion {
  readonly kind: "run_invocation_resource_assertion";
  readonly schemaVersion: "5.0.0";
  readonly eventResource: AbgEventResourceAssertion;
}

export interface RunInvocationResourceReceipt {
  readonly kind: "run_invocation_resource_receipt";
  readonly schemaVersion: "5.0.0";
  readonly eventResource: AbgEventResourceReceipt;
  readonly productExecutionResolution: Readonly<{
    readonly ref: string;
    readonly digest: Sha256Digest;
  }> | null;
  readonly invocationAdmission: Readonly<{
    readonly ref: string;
    readonly digest: Sha256Digest;
  }> | null;
  readonly run: AbgRunTruthCoordinate | null;
  readonly replay: AbgRunTruthCoordinate | null;
}

type RunCallable<TPacket extends RunPacket> = ExactDefinitionCallable<
  TPacket,
  RunInvocationResourceAssertion,
  RunInvocationResourceReceipt
>;

interface AdmittedSetupTruth {
  readonly artifactTruth: ExactPrefixArtifactTruthProjection;
  readonly admittedInstalls: readonly ProductInstall[];
  readonly workspaceBinding: WorkspaceBinding;
}

function fault<TPacket extends RunPacket>(
  call: DefinitionCall<TPacket, RunInvocationResourceAssertion>,
  stage: string,
  code: string,
  message: string,
): DefinitionExecutionFault<TPacket["definitionKey"]> {
  return deepFreeze({
    kind: "definition_execution_fault" as const,
    schemaVersion: "5.0.0" as const,
    definitionKey: call.invocation.definitionKey,
    stage,
    code,
    message,
    evidence: {},
  });
}

function syncStage<TPacket extends RunPacket, A>(
  call: DefinitionCall<TPacket, RunInvocationResourceAssertion>,
  stage: string,
  action: () => A,
): Effect.Effect<A, DefinitionExecutionFault<TPacket["definitionKey"]>> {
  return Effect.try({
    try: action,
    catch: (cause) => fault(
      call,
      stage,
      `${stage}_failure`,
      cause instanceof Error ? cause.message : String(cause),
    ),
  });
}

function asyncStage<TPacket extends RunPacket, A>(
  call: DefinitionCall<TPacket, RunInvocationResourceAssertion>,
  stage: string,
  action: () => Promise<A>,
): Effect.Effect<A, DefinitionExecutionFault<TPacket["definitionKey"]>> {
  return Effect.tryPromise({
    try: action,
    catch: (cause) => fault(
      call,
      stage,
      `${stage}_failure`,
      cause instanceof Error ? cause.message : String(cause),
    ),
  });
}

function exactIJson(value: unknown): boolean {
  try {
    canonicalJson(value as JsonValue);
    return true;
  } catch {
    return false;
  }
}

const REF_ARRAY_SCHEMA = v.array(nonblankSchema);

const EXECUTABLE_LEAF_REQUIREMENT_SCHEMA = v.strictObject({
  kind: v.literal("executable_leaf_requirement"),
  implementationBindingRef: nonblankSchema,
  inputContractRef: nonblankSchema,
  outputContractRef: nonblankSchema,
  evidenceContractRef: nonblankSchema,
  failureContractRef: nonblankSchema,
  refusalContractRef: nonblankSchema,
  judgmentContractRef: nonblankSchema,
});

const INTERACTION_LEAF_REQUIREMENT_SCHEMA = v.strictObject({
  kind: v.literal("interaction_leaf_requirement"),
  interactionKind: nonblankSchema,
  actorCapabilityRef: nonblankSchema,
  requestContractRef: nonblankSchema,
  responseContractRef: nonblankSchema,
  continuationContractRef: nonblankSchema,
});

const C_OF_SCHEMA = v.strictObject({
  kind: v.literal("c_of"),
  inputCarrierRef: nonblankSchema,
  outputCarrierRef: nonblankSchema,
  programLocusRef: nonblankSchema,
  stageRole: nonblankSchema,
  fibre: v.picklist(["F_D", "F_P", "F_H"]),
  armId: nonblankSchema,
  compositionRef: v.nullable(nonblankSchema),
  vectorIndex: v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
  judgmentPredicateRef: nonblankSchema,
  resultBearing: v.boolean(),
  requirement: v.union([
    EXECUTABLE_LEAF_REQUIREMENT_SCHEMA,
    INTERACTION_LEAF_REQUIREMENT_SCHEMA,
  ]),
});

const C_PROGRAM_TERM_SCHEMA: v.GenericSchema = v.lazy(() => v.union([
  C_OF_SCHEMA,
  v.strictObject({
    kind: v.literal("c_identity"),
    inputCarrierRef: nonblankSchema,
    outputCarrierRef: nonblankSchema,
  }),
  v.strictObject({
    kind: v.literal("c_compose"),
    inputCarrierRef: nonblankSchema,
    outputCarrierRef: nonblankSchema,
    terms: v.array(C_PROGRAM_TERM_SCHEMA),
  }),
  v.strictObject({
    kind: v.literal("c_edge"),
    inputCarrierRef: nonblankSchema,
    outputCarrierRef: nonblankSchema,
    transform: C_OF_SCHEMA,
    evaluate: C_OF_SCHEMA,
    consequence: C_OF_SCHEMA,
  }),
  v.strictObject({
    kind: v.literal("c_workflow"),
    inputCarrierRef: nonblankSchema,
    outputCarrierRef: nonblankSchema,
    graphFunctionRef: nonblankSchema,
  }),
  v.strictObject({
    kind: v.literal("c_batch"),
    inputCarrierRef: nonblankSchema,
    outputCarrierRef: nonblankSchema,
    taskInputCarrierRef: nonblankSchema,
    taskOutputCarrierRef: nonblankSchema,
    batchRef: nonblankSchema,
    tasks: v.array(C_PROGRAM_TERM_SCHEMA),
  }),
  v.strictObject({
    kind: v.literal("c_retry"),
    inputCarrierRef: nonblankSchema,
    outputCarrierRef: nonblankSchema,
    budget: v.pipe(v.number(), v.safeInteger(), v.minValue(1)),
    term: C_PROGRAM_TERM_SCHEMA,
  }),
]));

const GRAPH_FUNCTION_APPLICATION_SCHEMA = v.union([
  v.strictObject({
    kind: v.literal("graph_function_application"),
    relationKind: v.literal("compose"),
    applicationRef: nonblankSchema,
    inputContractRef: nonblankSchema,
    outputContractRef: nonblankSchema,
    leftGraphFunctionRef: nonblankSchema,
    rightGraphFunctionRef: nonblankSchema,
  }),
  v.strictObject({
    kind: v.literal("graph_function_application"),
    relationKind: v.literal("substitute"),
    applicationRef: nonblankSchema,
    inputContractRef: nonblankSchema,
    outputContractRef: nonblankSchema,
    outerGraphFunctionRef: nonblankSchema,
    targetVectorRef: nonblankSchema,
    innerGraphFunctionRef: nonblankSchema,
  }),
  v.strictObject({
    kind: v.literal("graph_function_application"),
    relationKind: v.literal("recurse"),
    applicationRef: nonblankSchema,
    inputContractRef: nonblankSchema,
    outputContractRef: nonblankSchema,
    graphFunctionRef: nonblankSchema,
    terminationRuleRef: nonblankSchema,
    terminationEvaluatorRefs: REF_ARRAY_SCHEMA,
    terminationFieldRef: nonblankSchema,
    foldbackRef: nonblankSchema,
    foldback: v.strictObject({
      mode: v.literal("rebind"),
      binding: nonblankSchema,
      requiresParentEvaluation: v.literal(true),
    }),
    bound: v.pipe(v.number(), v.safeInteger(), v.minValue(1)),
  }),
  v.strictObject({
    kind: v.literal("graph_function_application"),
    relationKind: v.literal("fan_out"),
    applicationRef: nonblankSchema,
    inputContractRef: nonblankSchema,
    outputContractRef: nonblankSchema,
    batchRef: nonblankSchema,
    elementGraphFunctionRef: nonblankSchema,
    inputVectorRef: nonblankSchema,
    outputVectorRef: nonblankSchema,
    inputMemberContractRef: nonblankSchema,
    outputMemberContractRef: nonblankSchema,
  }),
  v.strictObject({
    kind: v.literal("graph_function_application"),
    relationKind: v.literal("fan_in"),
    applicationRef: nonblankSchema,
    inputContractRef: nonblankSchema,
    outputContractRef: nonblankSchema,
    reducerGraphFunctionRef: nonblankSchema,
    inputVectorRef: nonblankSchema,
  }),
  v.strictObject({
    kind: v.literal("graph_function_application"),
    relationKind: v.literal("gate"),
    applicationRef: nonblankSchema,
    inputContractRef: nonblankSchema,
    outputContractRef: nonblankSchema,
    targetRef: nonblankSchema,
    ruleRef: nonblankSchema,
    evaluatorRefs: REF_ARRAY_SCHEMA,
  }),
  v.strictObject({
    kind: v.literal("graph_function_application"),
    relationKind: v.literal("re_enter"),
    applicationRef: nonblankSchema,
    inputContractRef: nonblankSchema,
    outputContractRef: nonblankSchema,
    graphFunctionRef: nonblankSchema,
    sourceProgramLocusRef: nonblankSchema,
    targetProgramLocusRef: nonblankSchema,
    maxApplications: v.pipe(v.number(), v.safeInteger(), v.minValue(1)),
  }),
  v.strictObject({
    kind: v.literal("graph_function_application"),
    relationKind: v.literal("promote"),
    applicationRef: nonblankSchema,
    inputContractRef: nonblankSchema,
    outputContractRef: nonblankSchema,
    sourceRef: nonblankSchema,
    targetRef: nonblankSchema,
  }),
  v.strictObject({
    kind: v.literal("graph_function_application"),
    relationKind: v.literal("identity"),
    applicationRef: nonblankSchema,
    inputContractRef: nonblankSchema,
    outputContractRef: nonblankSchema,
    targetRef: nonblankSchema,
  }),
  v.strictObject({
    kind: v.literal("graph_function_application"),
    relationKind: v.literal("same_object"),
    applicationRef: nonblankSchema,
    inputContractRef: nonblankSchema,
    outputContractRef: nonblankSchema,
    leftRef: nonblankSchema,
    rightRef: nonblankSchema,
    witnessRef: nonblankSchema,
  }),
]);

const GRAPH_TEMPLATE_SCHEMA = v.strictObject({
  kind: v.literal("inline_graph"),
  graphRef: nonblankSchema,
  startNodeRef: nonblankSchema,
  terminalNodeRefs: REF_ARRAY_SCHEMA,
  nodes: v.array(v.strictObject({
    nodeRef: nonblankSchema,
    nodeKind: v.literal("c_locus"),
    term: C_PROGRAM_TERM_SCHEMA,
  })),
  edges: v.array(v.strictObject({
    edgeRef: nonblankSchema,
    fromNodeRef: nonblankSchema,
    toNodeRef: nonblankSchema,
  })),
  applications: v.array(GRAPH_FUNCTION_APPLICATION_SCHEMA),
});

const GRAPH_FUNCTION_SCHEMA = v.pipe(
  v.strictObject({
    kind: v.literal("graph_function"),
    name: nonblankSchema,
    version: v.literal("5.0.0"),
    environment: v.strictObject({
      requires: REF_ARRAY_SCHEMA,
      provides: REF_ARRAY_SCHEMA,
      carries: REF_ARRAY_SCHEMA,
    }),
    inputs: REF_ARRAY_SCHEMA,
    outputs: REF_ARRAY_SCHEMA,
    template: GRAPH_TEMPLATE_SCHEMA,
    effects: REF_ARRAY_SCHEMA,
    declarations: v.record(v.string(), nonblankSchema),
    tags: REF_ARRAY_SCHEMA,
  }),
  v.check(
    (value) => sameJson(
      canonicalizeAuthoredGtlCarrier(value as Readonly<GraphFunction>, "graph_function"),
      value,
    ),
    "canonical_graph_function",
  ),
) as unknown as v.GenericSchema<GraphFunction, GraphFunction>;

const CONTRACT_DECLARATION_SCHEMA = v.strictObject({
  contractRef: nonblankSchema,
  contractVersion: v.literal("5.0.0"),
  contractKind: v.picklist([
    "closure",
    "evidence",
    "failure",
    "input",
    "judgment",
    "output",
    "refusal",
    "transition",
  ]),
  valueKind: nonblankSchema,
});

const GTL_PROGRAM_SCHEMA = v.strictObject({
  kind: v.literal("gtl_program"),
  programRef: nonblankSchema,
  version: v.literal("5.0.0"),
  moduleRef: nonblankSchema,
  starts: v.array(v.strictObject({
    startRef: nonblankSchema,
    graphFunctionRef: nonblankSchema,
  })),
  callableMembership: REF_ARRAY_SCHEMA,
  closureContractRef: nonblankSchema,
  policies: v.record(v.string(), nonblankSchema),
  publicAssetTargets: v.optional(v.array(v.strictObject({
    kind: v.literal("program_public_asset_target"),
    handle: nonblankSchema,
    assetRef: nonblankSchema,
    startRef: nonblankSchema,
  }))),
  actionCatalog: v.optional(v.strictObject({
    kind: v.literal("action_catalog"),
    schemaVersion: v.literal("5.0.0"),
    catalogRef: nonblankSchema,
    catalogDigest: digestSchema,
    rows: v.array(v.strictObject({
      kind: v.literal("action_catalog_row"),
      actionRef: nonblankSchema,
      actionKind: nonblankSchema,
      programRef: nonblankSchema,
      graphFunctionRef: nonblankSchema,
      targetProgramLocusRef: nonblankSchema,
      targetObligationRefs: REF_ARRAY_SCHEMA,
      inputAssetRefs: REF_ARRAY_SCHEMA,
      outputAssetRefs: REF_ARRAY_SCHEMA,
      expectedDeltaRef: nonblankSchema,
      progressConditionRef: nonblankSchema,
      stopConditionRef: nonblankSchema,
    })),
  })),
  constructionComposition: v.optional(v.strictObject({
    kind: v.literal("construction_composition"),
    schemaVersion: v.literal("5.0.0"),
    compositionRef: nonblankSchema,
    compositionDigest: digestSchema,
    graphFunctionRef: nonblankSchema,
    authorities: v.tuple([
      v.strictObject({
        kind: v.literal("construction_authority_binding"),
        semanticAuthority: v.picklist([
          "synthesizeModel",
          "evalGap",
          "evaluateNext",
          "evaluateAction",
        ]),
        authorityRef: nonblankSchema,
        initialProgramLocusRef: nonblankSchema,
        refreshProgramLocusRef: v.nullable(nonblankSchema),
      }),
      v.strictObject({
        kind: v.literal("construction_authority_binding"),
        semanticAuthority: v.picklist([
          "synthesizeModel",
          "evalGap",
          "evaluateNext",
          "evaluateAction",
        ]),
        authorityRef: nonblankSchema,
        initialProgramLocusRef: nonblankSchema,
        refreshProgramLocusRef: v.nullable(nonblankSchema),
      }),
      v.strictObject({
        kind: v.literal("construction_authority_binding"),
        semanticAuthority: v.picklist([
          "synthesizeModel",
          "evalGap",
          "evaluateNext",
          "evaluateAction",
        ]),
        authorityRef: nonblankSchema,
        initialProgramLocusRef: nonblankSchema,
        refreshProgramLocusRef: v.nullable(nonblankSchema),
      }),
      v.strictObject({
        kind: v.literal("construction_authority_binding"),
        semanticAuthority: v.picklist([
          "synthesizeModel",
          "evalGap",
          "evaluateNext",
          "evaluateAction",
        ]),
        authorityRef: nonblankSchema,
        initialProgramLocusRef: nonblankSchema,
        refreshProgramLocusRef: v.nullable(nonblankSchema),
      }),
    ]),
    interactionProgramLocusRef: nonblankSchema,
    closurePolicy: v.strictObject({
      kind: v.literal("construction_policy"),
      policyRef: nonblankSchema,
      requireCompleteEvidence: v.boolean(),
      requirePostEvidenceRefresh: v.boolean(),
    }),
  })),
});

const CATALOG_CONTRIBUTION_SCHEMA = v.strictObject({
  handle: nonblankSchema,
  kind: v.picklist(["graph_function", "node_type", "overlay"]),
  declarationOrContractRef: nonblankSchema,
  owningProductId: nonblankSchema,
  programMembershipRefs: REF_ARRAY_SCHEMA,
  readinessPrerequisiteRefs: REF_ARRAY_SCHEMA,
  compatibilityRefs: REF_ARRAY_SCHEMA,
  provenanceRefs: REF_ARRAY_SCHEMA,
});

function exactModulePublication(value: Readonly<ModulePublication>): boolean {
  const publication = rawAdmitValue<ModulePublication>(
    value,
    "module_publication",
    "contract://abiogenesis/gtl/module-publication@5",
  );
  if (
    publication.kind !== "raw_admitted_value" ||
    !sameJson(publication.value, value)
  ) return false;
  const contributions = value.contributions.map((candidate) =>
    rawAdmitValue(
      candidate,
      "catalog_contribution",
      "contract://abiogenesis/gtl/catalog-contribution@5",
    )
  );
  if (contributions.some((candidate) => candidate.kind !== "raw_admitted_value")) {
    return false;
  }
  return validatePublication(
    publication,
    contributions as readonly RawAdmittedValue<
      ModulePublication["contributions"][number]
    >[],
  ).kind === "publication_validation";
}

const MODULE_PUBLICATION_SCHEMA = v.pipe(
  v.strictObject({
    kind: v.literal("module_publication"),
    moduleRef: nonblankSchema,
    moduleVersion: v.literal("5.0.0"),
    owningProductId: nonblankSchema,
    artifactDigest: digestSchema,
    productContentDigest: digestSchema,
    productManifestDigest: digestSchema,
    descriptorRef: nonblankSchema,
    contributionManifestRef: nonblankSchema,
    productSemanticsBinding: v.strictObject({
      kind: v.literal("product_semantics_binding"),
      bindingRef: nonblankSchema,
      packageName: nonblankSchema,
      packageVersion: nonblankSchema,
      modulePath: nonblankSchema,
      namedSymbol: nonblankSchema,
    }),
    contracts: v.array(CONTRACT_DECLARATION_SCHEMA),
    evaluators: v.array(v.strictObject({
      name: nonblankSchema,
      regime: v.picklist(["F_D", "F_P", "F_H"]),
      description: v.string(),
      binding: nonblankSchema,
      consumedFieldRefs: REF_ARRAY_SCHEMA,
      tags: REF_ARRAY_SCHEMA,
    })),
    rules: v.array(v.strictObject({
      name: nonblankSchema,
      kind: nonblankSchema,
      config: v.record(v.string(), jsonValueSchema),
      tags: REF_ARRAY_SCHEMA,
    })),
    implementationBindings: v.array(v.strictObject({
      kind: v.literal("implementation_binding"),
      bindingRef: nonblankSchema,
      implementationRef: nonblankSchema,
      packageName: nonblankSchema,
      packageVersion: nonblankSchema,
      modulePath: nonblankSchema,
      namedSymbol: nonblankSchema,
      computeRegime: v.picklist(["F_D", "F_P"]),
      inputContractRef: nonblankSchema,
      outputContractRef: nonblankSchema,
      failureContractRef: nonblankSchema,
      refusalContractRef: nonblankSchema,
    })),
    closureContracts: v.array(v.union([
      v.strictObject({
        kind: v.literal("closure_contract"),
        closureContractRef: nonblankSchema,
        predicateRef: nonblankSchema,
        evidenceContractRef: nonblankSchema,
        resultContractRef: nonblankSchema,
        refusalContractRef: nonblankSchema,
        refusalValueKind: nonblankSchema,
        judgmentContractRef: nonblankSchema,
        rejectionContractRef: nonblankSchema,
        transitionContractRef: nonblankSchema,
        replayProjectionRef: nonblankSchema,
        terminalKind: v.literal("completed"),
        closureScope: v.literal("run"),
        eventKindRefs: v.tuple([
          v.literal("terminal_reached"),
          v.literal("frame_closed"),
          v.literal("graph_call_closed"),
          v.literal("run_closed"),
        ]),
      }),
      v.strictObject({
        kind: v.literal("closure_contract"),
        closureContractRef: nonblankSchema,
        predicateRef: nonblankSchema,
        evidenceContractRef: nonblankSchema,
        resultContractRef: nonblankSchema,
        refusalContractRef: nonblankSchema,
        refusalValueKind: nonblankSchema,
        judgmentContractRef: nonblankSchema,
        rejectionContractRef: nonblankSchema,
        transitionContractRef: nonblankSchema,
        replayProjectionRef: nonblankSchema,
        terminalKind: v.literal("completed"),
        closureScope: v.literal("graph_call"),
        eventKindRefs: v.tuple([
          v.literal("terminal_reached"),
          v.literal("frame_closed"),
          v.literal("graph_call_closed"),
        ]),
      }),
    ])),
    programs: v.array(GTL_PROGRAM_SCHEMA),
    graphFunctions: v.array(GRAPH_FUNCTION_SCHEMA),
    contributions: v.array(CATALOG_CONTRIBUTION_SCHEMA),
  }),
  v.check(
    (value) => exactModulePublication(value as unknown as ModulePublication),
    "canonical_module_publication",
  ),
) as unknown as v.GenericSchema<ModulePublication, ModulePublication>;

const RESOLVED_PRODUCT_LOCK_SCHEMA = v.custom<ResolvedProductLock>(
  isResolvedProductLock,
  "resolved_product_lock",
);

const VERIFIED_PRODUCT_SCHEMA = v.custom<VerifiedProductArtifact>(
  isVerifiedProductArtifact,
  "verified_product_artifact",
);

const PRODUCT_DECLARED_DEPENDENCY_SCHEMA = v.strictObject({
  kind: v.literal("requires"),
  productId: nonblankSchema,
  packageVersion: nonblankSchema,
  compatibilityRef: nonblankSchema,
  requiredContractRefs: REF_ARRAY_SCHEMA,
  requiredCapabilityRefs: REF_ARRAY_SCHEMA,
});

const PRODUCT_CONTRIBUTION_MANIFEST_SCHEMA = v.strictObject({
  kind: v.literal("product_contribution_manifest"),
  schemaVersion: v.literal("5.0.0"),
  contributionManifestRef: nonblankSchema,
  productId: nonblankSchema,
  productVersion: nonblankSchema,
  descriptorRef: nonblankSchema,
  productContentDigest: digestSchema,
  publicContractCatalogId: nonblankSchema,
  publicContractCatalogDigest: digestSchema,
  publicationBindings: v.array(v.strictObject({
    moduleRef: nonblankSchema,
    publicationDigest: digestSchema,
  })),
  rows: v.array(v.strictObject({
    moduleRef: nonblankSchema,
    handle: nonblankSchema,
    kind: v.picklist(["graph_function", "node_type", "overlay"]),
    declarationOrContractRef: nonblankSchema,
    owningProductId: nonblankSchema,
    programMembershipRefs: REF_ARRAY_SCHEMA,
    compatibilityRefs: REF_ARRAY_SCHEMA,
    provenanceRef: nonblankSchema,
    readinessPrerequisiteRefs: REF_ARRAY_SCHEMA,
  })),
});

const PRODUCT_NATIVE_TYPED_LOCATOR_SCHEMA = v.strictObject({
  packageName: nonblankSchema,
  packageExportPath: nonblankSchema,
  namedSymbol: nonblankSchema,
  declarationPath: nonblankSchema,
  declarationInventory: v.array(v.strictObject({
    packageExportPath: nonblankSchema,
    declarationPath: nonblankSchema,
    declarationDigest: digestSchema,
  })),
});

const PRODUCT_ASSET_LOCATOR_SCHEMA = v.strictObject({
  path: nonblankSchema,
  mediaType: nonblankSchema,
  schemaVersion: nonblankSchema,
  contentDigest: digestSchema,
  definitionRef: v.optional(nonblankSchema),
});

const PRODUCT_PUBLIC_CONTRACT_SCHEMA = v.strictObject({
  contractId: nonblankSchema,
  contractVersion: v.literal("5.0.0"),
  contractDigest: digestSchema,
  contractKind: v.picklist([
    "native_typed_group",
    "schema_asset",
    "serialized_native_contract",
    "vocabulary_asset",
  ]),
  owningProduct: nonblankSchema,
  requirementAuthorityRefs: REF_ARRAY_SCHEMA,
  capabilityIdentities: REF_ARRAY_SCHEMA,
  nativeTypedLocator: v.optional(PRODUCT_NATIVE_TYPED_LOCATOR_SCHEMA),
  assetLocator: v.optional(PRODUCT_ASSET_LOCATOR_SCHEMA),
});

const PRODUCT_INSTALL_CANDIDATE_SCHEMA = v.strictObject({
  kind: v.literal("product_install_candidate"),
  schemaVersion: v.literal("5.0.0"),
  disposition: v.literal("materialized"),
  installId: nonblankSchema,
  installedRoot: absolutePathSchema,
  productId: nonblankSchema,
  packageName: nonblankSchema,
  packageVersion: nonblankSchema,
  artifactDigest: digestSchema,
  productContentDigest: digestSchema,
  manifestDigest: digestSchema,
  descriptorRef: nonblankSchema,
  publisherNamespace: nonblankSchema,
  contributionManifestRef: nonblankSchema,
  contributionManifestDigest: digestSchema,
  contributionManifest: PRODUCT_CONTRIBUTION_MANIFEST_SCHEMA,
  compatibilityRefs: REF_ARRAY_SCHEMA,
  declaredDependencies: v.array(PRODUCT_DECLARED_DEPENDENCY_SCHEMA),
  provenanceRef: nonblankSchema,
  declaredCapabilityRefs: REF_ARRAY_SCHEMA,
  catalogId: nonblankSchema,
  catalogDigest: digestSchema,
  publicContracts: v.array(PRODUCT_PUBLIC_CONTRACT_SCHEMA),
  publicContractRefs: REF_ARRAY_SCHEMA,
  publicCapabilityRefs: REF_ARRAY_SCHEMA,
  resolvedLockId: nonblankSchema,
  resolvedLockDigest: digestSchema,
}) as v.GenericSchema<ProductInstallCandidate, ProductInstallCandidate>;

const GRAPH_FUNCTION_CATALOG_ENTRY_SCHEMA = v.strictObject({
  kind: v.literal("graph_function_catalog_entry"),
  handle: nonblankSchema,
  definitionRef: nonblankSchema,
  definitionDigest: digestSchema,
  definition: GRAPH_FUNCTION_SCHEMA,
  owningProductId: nonblankSchema,
  moduleRef: nonblankSchema,
  publicationDigest: digestSchema,
  programMembershipRefs: v.array(nonblankSchema),
  compatibilityRefs: v.array(nonblankSchema),
  provenanceRefs: v.array(nonblankSchema),
  entryDigest: digestSchema,
});

const DECLARATION_CATALOG_ENTRY_SCHEMA = v.strictObject({
  kind: v.literal("declaration_catalog_entry"),
  handle: nonblankSchema,
  declarationKind: v.union([v.literal("node_type"), v.literal("overlay")]),
  declarationOrContractRef: nonblankSchema,
  owningProductId: nonblankSchema,
  moduleRef: nonblankSchema,
  publicationDigest: digestSchema,
  programMembershipRefs: v.array(nonblankSchema),
  compatibilityRefs: v.array(nonblankSchema),
  provenanceRefs: v.array(nonblankSchema),
  entryDigest: digestSchema,
});

const WORKSPACE_BINDING_CANDIDATE_SCHEMA = v.strictObject({
  kind: v.literal("workspace_binding_candidate"),
  schemaVersion: v.literal("5.0.0"),
  bindingId: nonblankSchema,
  bindingDigest: digestSchema,
  workspaceId: nonblankSchema,
  authorityBasisId: nonblankSchema,
  authorityBasisDigest: digestSchema,
  authorizedActorRef: nonblankSchema,
  productSetId: nonblankSchema,
  productSetDigest: digestSchema,
  lockId: nonblankSchema,
  lockDigest: digestSchema,
  roots: v.strictObject({
    toolchainRoot: absolutePathSchema,
    productRoot: absolutePathSchema,
    eventLogRoot: absolutePathSchema,
    runtimeStateRoot: absolutePathSchema,
    projectionRoot: absolutePathSchema,
    archiveRoot: absolutePathSchema,
  }),
}) as v.GenericSchema<WorkspaceBindingCandidate, WorkspaceBindingCandidate>;

const CATALOG_READINESS_ROW_SCHEMA = v.strictObject({
  handle: nonblankSchema,
  owningProductId: nonblankSchema,
  moduleRef: nonblankSchema,
  disposition: v.picklist([
    "admitted",
    "rejected",
    "incompatible",
    "conflicting",
    "unready",
    "unresolved",
  ]),
  readiness: v.picklist(["ready", "not_ready"]),
  reason: v.nullable(v.string()),
  readinessPrerequisiteRefs: v.array(nonblankSchema),
  rowDigest: digestSchema,
});

function exactReadyGraphFunctionCatalog(
  value: ReadyGraphFunctionCatalog,
): boolean {
  try {
    const basis = value.readinessBasis;
    if (
      !isResolvedProductLock(basis.resolvedLock) ||
      !isWorkspaceBindingCandidate(
        basis.workspaceBinding,
        basis.resolvedLock,
      ) ||
      basis.verifiedProducts.some((candidate) =>
        !isVerifiedProductArtifact(candidate)
      ) ||
      basis.installedProducts.some((candidate) =>
        !isProductInstallCandidate(candidate, basis.resolvedLock)
      )
    ) return false;
    const reconstructed = admitGraphFunctionCatalog(
      basis as CatalogReadinessBasis,
    );
    return reconstructed.kind === "graph_function_catalog" &&
      sameJson(reconstructed, value);
  } catch {
    return false;
  }
}

const READY_GRAPH_FUNCTION_CATALOG_SCHEMA = v.pipe(v.strictObject({
  kind: v.literal("graph_function_catalog"),
  schemaVersion: v.literal("5.0.0"),
  basisDigest: digestSchema,
  publicationDigests: v.array(digestSchema),
  entries: v.array(GRAPH_FUNCTION_CATALOG_ENTRY_SCHEMA),
  byHandle: v.record(v.string(), GRAPH_FUNCTION_CATALOG_ENTRY_SCHEMA),
  declarationEntries: v.array(DECLARATION_CATALOG_ENTRY_SCHEMA),
  declarationsByHandle: v.record(
    v.string(),
    DECLARATION_CATALOG_ENTRY_SCHEMA,
  ),
  readinessBasisDigest: digestSchema,
  workspaceBindingId: nonblankSchema,
  workspaceBindingDigest: digestSchema,
  lockId: nonblankSchema,
  lockDigest: digestSchema,
  productSetId: nonblankSchema,
  productSetDigest: digestSchema,
  readinessBasis: v.strictObject({
    workspaceBinding: WORKSPACE_BINDING_CANDIDATE_SCHEMA,
    resolvedLock: RESOLVED_PRODUCT_LOCK_SCHEMA,
    verifiedProducts: v.array(VERIFIED_PRODUCT_SCHEMA),
    installedProducts: v.array(PRODUCT_INSTALL_CANDIDATE_SCHEMA),
    publications: v.array(MODULE_PUBLICATION_SCHEMA),
  }),
  boundPublications: v.array(MODULE_PUBLICATION_SCHEMA),
  rowDispositions: v.array(CATALOG_READINESS_ROW_SCHEMA),
}), v.check(
  (value) => exactReadyGraphFunctionCatalog(
    value as unknown as ReadyGraphFunctionCatalog,
  ),
  "exact_ready_graph_function_catalog",
)) as unknown as v.GenericSchema<
  ReadyGraphFunctionCatalog,
  ReadyGraphFunctionCatalog
>;

const GRAPH_FUNCTION_CATALOG_VIEW_SCHEMA = v.strictObject({
  kind: v.literal("graph_function_catalog_view"),
  catalogBasisDigest: digestSchema,
  allowlist: v.array(nonblankSchema),
  entries: v.array(GRAPH_FUNCTION_CATALOG_ENTRY_SCHEMA),
  byHandle: v.record(v.string(), GRAPH_FUNCTION_CATALOG_ENTRY_SCHEMA),
  declarationEntries: v.array(DECLARATION_CATALOG_ENTRY_SCHEMA),
  declarationsByHandle: v.record(
    v.string(),
    DECLARATION_CATALOG_ENTRY_SCHEMA,
  ),
  viewDigest: digestSchema,
}) as unknown as v.GenericSchema<
  GraphFunctionCatalogView,
  GraphFunctionCatalogView
>;

const DECLARATION_APPLICATION_SCHEMA = v.strictObject({
  kind: v.literal("declaration_application"),
  catalogBasisDigest: digestSchema,
  viewDigest: digestSchema,
  declaration: DECLARATION_CATALOG_ENTRY_SCHEMA,
  targetRef: nonblankSchema,
  targetDigest: digestSchema,
  appliedValueRef: nonblankSchema,
  appliedValueDigest: digestSchema,
  applicationRef: nonblankSchema,
  applicationDigest: digestSchema,
}) as v.GenericSchema<DeclarationApplication, DeclarationApplication>;

const EVENT_RESOURCE_ASSERTION_SCHEMA = v.union([
  v.strictObject({
    kind: v.literal("new_abg_event_resource"),
    schemaVersion: v.literal("5.0.0"),
    eventLogPath: absolutePathSchema,
    locatorDigest: digestSchema,
  }),
  v.strictObject({
    kind: v.literal("reopen_abg_event_resource"),
    schemaVersion: v.literal("5.0.0"),
    closeHandoff: v.custom<EventStoreCloseHandoff>(
      validateEventStoreCloseHandoff,
      "event_store_close_handoff",
    ),
    handoffDigest: digestSchema,
  }),
]) as v.GenericSchema<
  AbgEventResourceAssertion,
  AbgEventResourceAssertion
>;

const EVENT_RESOURCE_RECEIPT_SCHEMA = v.strictObject({
  kind: v.literal("abg_event_resource_receipt"),
  schemaVersion: v.literal("5.0.0"),
  acquisitionKind: v.union([v.literal("new"), v.literal("reopen")]),
  entryPrefix: v.custom<DurablePrefixCoordinate>(
    validateDurablePrefixCoordinate,
    "durable_prefix_coordinate",
  ),
  closeHandoff: v.custom<EventStoreCloseHandoff>(
    validateEventStoreCloseHandoff,
    "event_store_close_handoff",
  ),
  receiptDigest: digestSchema,
}) as v.GenericSchema<AbgEventResourceReceipt, AbgEventResourceReceipt>;

const RUN_TRUTH_COORDINATE_SCHEMA = v.strictObject({
  ref: nonblankSchema,
  digest: digestSchema,
}) as v.GenericSchema<AbgRunTruthCoordinate, AbgRunTruthCoordinate>;

const RUN_INVOCATION_SOURCE_ASSERTION_SCHEMA = v.union([
  v.strictObject({ kind: v.literal("none") }),
  v.strictObject({
    kind: v.literal("admitted_source_result"),
    basis: v.strictObject({
      kind: v.literal("invocation_source_result_basis"),
      schemaVersion: v.literal("5.0.0"),
      basisRef: nonblankSchema,
      basisDigest: digestSchema,
      publicAuthorityDigest: digestSchema,
      sourceInvocationAdmissionRef: nonblankSchema,
      sourceInvocationRef: nonblankSchema,
      sourceRunId: nonblankSchema,
      sourceGraphCallId: nonblankSchema,
      sourceGraphFunctionRef: nonblankSchema,
      sourceCCallRef: nonblankSchema,
      sourceResultAdmissionEventRef: nonblankSchema,
      sourceResultJudgmentEventRef: nonblankSchema,
      sourceResultRef: nonblankSchema,
      sourceResultDigest: digestSchema,
      sourceResultValueDigest: digestSchema,
      sourceResultContractRef: nonblankSchema,
      sourceResultValue: jsonValueSchema,
      sourceReplayRef: nonblankSchema,
      sourceReplayDigest: digestSchema,
      sourceWorkspaceId: nonblankSchema,
      workspaceBindingId: nonblankSchema,
      workspaceBindingDigest: digestSchema,
    }),
  }),
]) as v.GenericSchema<
  ProductRunInvocationSourceAssertion,
  ProductRunInvocationSourceAssertion
>;

function exactCatalogViewRelation(
  value: RunInvocationResourceAssertion,
): boolean {
  try {
    const view = narrowGraphFunctionCatalog(
      value.catalog,
      value.catalogView.allowlist,
    );
    return view.kind === "graph_function_catalog_view" &&
      sameJson(view, value.catalogView);
  } catch {
    return false;
  }
}

const RUN_INVOCATION_RESOURCE_ASSERTION_SCHEMA = v.pipe(v.strictObject({
  kind: v.literal("run_invocation_resource_assertion"),
  schemaVersion: v.literal("5.0.0"),
  eventResource: EVENT_RESOURCE_ASSERTION_SCHEMA,
  catalog: READY_GRAPH_FUNCTION_CATALOG_SCHEMA,
  catalogView: GRAPH_FUNCTION_CATALOG_VIEW_SCHEMA,
  applications: v.array(DECLARATION_APPLICATION_SCHEMA),
  source: RUN_INVOCATION_SOURCE_ASSERTION_SCHEMA,
}), v.check(
  (value) => exactCatalogViewRelation(
    value as unknown as RunInvocationResourceAssertion,
  ),
  "exact_catalog_view_relation",
)) as unknown as v.GenericSchema<
  RunInvocationResourceAssertion,
  RunInvocationResourceAssertion
>;

const RUN_INVOCATION_RESOURCE_RECEIPT_SCHEMA = v.strictObject({
  kind: v.literal("run_invocation_resource_receipt"),
  schemaVersion: v.literal("5.0.0"),
  eventResource: EVENT_RESOURCE_RECEIPT_SCHEMA,
  productExecutionResolution: v.nullable(refDigestSchema),
  invocationAdmission: v.nullable(refDigestSchema),
  run: v.nullable(RUN_TRUTH_COORDINATE_SCHEMA),
  replay: v.nullable(RUN_TRUTH_COORDINATE_SCHEMA),
}) as v.GenericSchema<
  RunInvocationResourceReceipt,
  RunInvocationResourceReceipt
>;

function projectSetupTruth(
  prefix: DurablePrefixCoordinate,
  catalog: ReadyGraphFunctionCatalog,
): AdmittedSetupTruth | null {
  const artifactTruth = projectExactPrefixArtifactTruth(prefix);
  if (artifactTruth.kind === "exact_prefix_artifact_truth_projection_refusal") {
    return null;
  }
  const admittedInstalls = catalog.readinessBasis.installedProducts.map(
    (candidate) => projectAdmittedProductInstall(artifactTruth, candidate),
  );
  const workspaceBinding = projectAdmittedWorkspaceBinding(
    artifactTruth,
    catalog.readinessBasis.workspaceBinding,
  );
  return admittedInstalls.some((install) => install === null) ||
      workspaceBinding === null
    ? null
    : deepFreeze({
        artifactTruth,
        admittedInstalls: admittedInstalls as readonly ProductInstall[],
        workspaceBinding,
      });
}

function operationBasis<TPacket extends RunPacket>(
  call: DefinitionCall<TPacket, RunInvocationResourceAssertion>,
  binding: WorkspaceBinding,
): PublicOperationAdmissionBasis {
  const invocationCoordinate = constructExactOperationInvocationCoordinate(
    {
      operationId: "abg.operation.run.invoke",
      memberKey: call.invocation.definitionKey.memberKey,
      definitionDigest: call.invocation.definitionDigest,
    },
    call.invocation.invocationRef,
    call.invocation.requestDigest,
  );
  return deepFreeze({
    ...invocationCoordinate,
    operationId: "abg.operation.run.invoke" as const,
    authorityScopeRef: binding.bindingId,
    authorityScopeDigest: binding.bindingDigest,
    correlationId: call.invocation.correlationRef,
    eventTime: call.invocation.eventTime,
    causationEventRefs: [],
  });
}

function resourceReceipt(
  eventResource: AbgEventResourceReceipt,
  prepared: PreparedProductRunInvocation<RunInvocationMemberKey> | null,
  admission: InvocationAdmission | null,
  truth: AbgRunTruthProjection | null,
): RunInvocationResourceReceipt {
  return deepFreeze({
    kind: "run_invocation_resource_receipt" as const,
    schemaVersion: "5.0.0" as const,
    eventResource,
    productExecutionResolution: prepared === null
      ? null
      : {
          ref: prepared.resolution.resolution.resolutionRef,
          digest: prepared.resolution.resolution.resolutionDigest,
        },
    invocationAdmission: admission === null
      ? null
      : {
          ref: admission.invocationAdmissionRef,
          digest: admission.invocationAdmissionDigest,
        },
    run: truth?.run ?? null,
    replay: truth?.replay ?? null,
  });
}

function finish<TPacket extends RunPacket>(
  call: DefinitionCall<TPacket, RunInvocationResourceAssertion>,
  resource: AcquiredAbgEventResource,
  finalPrefix: DurablePrefixCoordinate,
  ownerOutput: OwnerSemanticOutput<TPacket>,
  prepared: PreparedProductRunInvocation<RunInvocationMemberKey> | null,
  admission: InvocationAdmission | null,
  truth: AbgRunTruthProjection | null,
): Effect.Effect<
  DefinitionReturn<TPacket, RunInvocationResourceReceipt>,
  DefinitionExecutionFault<TPacket["definitionKey"]>
> {
  return syncStage(call, "resource_close", () => {
    const eventResource = closeAbgEventResource(resource, finalPrefix);
    return deepFreeze({
      ownerOutput,
      resources: resourceReceipt(eventResource, prepared, admission, truth),
    });
  });
}

function runInvocationOwner<TPacket extends RunPacket>(
  call: DefinitionCall<TPacket, RunInvocationResourceAssertion>,
): ReturnType<RunCallable<TPacket>> {
  return Effect.scoped(Effect.gen(function* () {
    const resource = yield* Effect.acquireRelease(
      Effect.suspend(() => {
        const acquired = acquireAbgEventResource(call.resources.eventResource);
        return acquired.kind === "acquired_abg_event_resource"
          ? Effect.succeed(acquired.resource)
          : Effect.fail(fault(
              call,
              "resource_acquisition",
              acquired.code,
              acquired.message,
            ));
      }),
      (held) => Effect.sync(() => abandonAbgEventResource(held)),
    );
    const entryPrefix = resource.entryPrefix;
    const setup = yield* syncStage(
      call,
      "setup_truth",
      () => projectSetupTruth(entryPrefix, call.resources.catalog),
    );
    if (setup === null) {
      return yield* finish(
        call,
        resource,
        entryPrefix,
        ProductRunInvocationPort.projectOwnerRefusal(
          call.invocation.definitionKey.memberKey,
          { stage: "setup", code: "admitted_setup_absent" },
        ) as OwnerSemanticOutput<TPacket>,
        null,
        null,
        null,
      );
    }
    const source = call.resources.source.kind === "none"
      ? call.resources.source
      : (() => {
          const basis = rehydrateInvocationSourceResultBasisAtDurablePrefix(
            entryPrefix,
            call.resources.source.basis,
          );
          return basis === null
            ? null
            : deepFreeze({
                kind: "admitted_source_result" as const,
                basis,
              });
        })();
    if (source === null) {
      return yield* finish(
        call,
        resource,
        entryPrefix,
        ProductRunInvocationPort.projectOwnerRefusal(
          call.invocation.definitionKey.memberKey,
          { stage: "observation", code: "source_result_absent" },
        ) as OwnerSemanticOutput<TPacket>,
        null,
        null,
        null,
      );
    }
    const productResources = deepFreeze({
      catalog: call.resources.catalog,
      catalogView: call.resources.catalogView,
      applications: call.resources.applications,
      source,
    });
    const preparedResult = yield* asyncStage(
      call,
      "product_prepare",
      () => ProductRunInvocationPort.prepare({
        memberKey: call.invocation.definitionKey.memberKey,
        invocation: call.invocation as never,
        resources: productResources,
        admittedInstalls: setup.admittedInstalls,
        workspaceBinding: setup.workspaceBinding,
        verifyInstallAdmission: (install) =>
          hasAdmittedProductInstall(setup.artifactTruth, install),
        transportResourceAssertion:
          call.resources.eventResource as unknown as JsonValue,
      }),
    );
    if (preparedResult.kind === "product_run_invocation_preparation_refusal") {
      return yield* finish(
        call,
        resource,
        entryPrefix,
        preparedResult.ownerOutput as OwnerSemanticOutput<TPacket>,
        null,
        null,
        null,
      );
    }
    const prepared = preparedResult as PreparedProductRunInvocation<
      RunInvocationMemberKey
    >;
    if (!hasExactInvocationObservationBasis(
      prepared.admittedInput,
      setup.workspaceBinding.bindingId,
      setup.workspaceBinding.bindingDigest,
      prepared.resolution.program,
    )) {
      return yield* finish(
        call,
        resource,
        entryPrefix,
        ProductRunInvocationPort.projectOwnerRefusal(
          call.invocation.definitionKey.memberKey,
          { stage: "observation", code: "observation_basis_mismatch" },
        ) as OwnerSemanticOutput<TPacket>,
        prepared,
        null,
        null,
      );
    }
    const admitted = yield* syncStage(call, "invocation_admission", () =>
      admitExactInvocation(
        resource.store,
        {
          invocation: prepared.candidate,
          publicInvocation: prepared.invocation,
          rawInput: prepared.rawInput,
          programPublication: prepared.resolution.programPublication,
          executionResolution: prepared.resolution.resolution,
          program: prepared.resolution.program,
          graphFunction: prepared.resolution.graphFunction,
          programValidation: prepared.resolution.programValidation,
          workspaceBinding: setup.workspaceBinding,
          artifactTruth: setup.artifactTruth,
          catalogView: productResources.catalogView,
          catalogApplications: productResources.applications,
          policy: prepared.policy,
          capabilityGrants: prepared.grants,
          authority: prepared.authority,
          ...(prepared.sourceResultBasis === null
            ? {}
            : { sourceResultBasis: prepared.sourceResultBasis }),
        },
        operationBasis(call, setup.workspaceBinding),
      )
    );
    if (admitted.kind !== "invocation_admission_receipt") {
      return yield* finish(
        call,
        resource,
        entryPrefix,
        ProductRunInvocationPort.projectOwnerRefusal(
          call.invocation.definitionKey.memberKey,
          {
            stage: "invocation_admission",
            code: admitted.code,
            ...(admitted.kind === "invocation_admission_refusal" &&
                "priorAdmission" in admitted && admitted.priorAdmission !== null
              ? { evidenceRefs: [admitted.priorAdmission.admissionEventRef] }
              : {}),
          },
        ) as OwnerSemanticOutput<TPacket>,
        prepared,
        null,
        null,
      );
    }
    const admission = admitted.admission;
    const graph = yield* syncStage(call, "graph_materialization", () =>
      materializeGraph(prepared.resolution.graphFunction, {
        invocationAdmissionRef: admission.invocationAdmissionRef,
        admittedInputRef: prepared.rawInput.admissionRef,
        admittedInputDigest: prepared.rawInput.subjectDigest,
        admittedInput: prepared.rawInput.value,
      })
    );
    const graphValidation = yield* syncStage(call, "graph_validation", () =>
      validateGraph(
        graph,
        prepared.resolution.programValidation,
        prepared.resolution.graphFunction,
        {
          invocationAdmissionRef: admission.invocationAdmissionRef,
          admittedInputRef: prepared.rawInput.admissionRef,
          admittedInputDigest: prepared.rawInput.subjectDigest,
          admittedInput: prepared.rawInput.value,
        },
      )
    );
    if (graphValidation.kind !== "graph_validation") {
      const diagnosticRefs = graphValidation.diagnostics.map((row) =>
        `diagnostic://abiogenesis/validator/${row.code}@5`
      );
      const refused = yield* syncStage(call, "graph_refusal_admission", () =>
        admitInvocationRefusal(
          resource.store,
          admitted.successorPrefix,
          admission,
          "graph_validation",
          graphValidation.subjectDigest,
          diagnosticRefs,
          {
            eventTime: call.invocation.eventTime,
            correlationId: `${call.invocation.correlationRef}/graph-validation`,
            causationEventRefs: [],
          },
        )
      );
      return yield* finish(
        call,
        resource,
        refused.successorPrefix,
        ProductRunInvocationPort.projectOwnerRefusal(
          call.invocation.definitionKey.memberKey,
          {
            stage: "graph_validation",
            code: "validation_refused",
            evidenceRefs: [refused.admission.admissionEventRef],
          },
        ) as OwnerSemanticOutput<TPacket>,
        prepared,
        admission,
        null,
      );
    }
    const execution = yield* syncStage(call, "execution_basis", () =>
      admitExecutionBasis(
        resource.store,
        admitted.successorPrefix,
        {
          invocationAdmission: admission,
          rawInputValue: prepared.admittedInput,
          program: prepared.resolution.program,
          programValidation: prepared.resolution.programValidation,
          graph,
          graphValidation,
          resolutionSetCandidate:
            prepared.resolution.implementationSetCandidate,
          resolutionSetValidation:
            prepared.resolution.implementationSetValidation,
          closureContract: prepared.resolution.closureContract,
        },
        {
          eventTime: call.invocation.eventTime,
          correlationId: `${call.invocation.correlationRef}/execution-basis`,
          causationEventRefs: [],
        },
      )
    );
    if (execution.kind !== "execution_basis_admission") {
      return yield* finish(
        call,
        resource,
        execution.successorPrefix,
        ProductRunInvocationPort.projectOwnerRefusal(
          call.invocation.definitionKey.memberKey,
          { stage: "execution_basis", code: execution.admission.stage },
        ) as OwnerSemanticOutput<TPacket>,
        prepared,
        admission,
        null,
      );
    }
    const opened = yield* syncStage(call, "open_call", () =>
      openTraversalScope(
        resource.store,
        execution.successorPrefix,
        { kind: "root", executionBasis: execution.executionBasis },
        {
          eventTime: call.invocation.eventTime,
          correlationId: `${call.invocation.correlationRef}/open`,
          causationEventRefs: [],
        },
      )
    );
    if (opened.kind !== "traversal_scope_open_admission") {
      const refused = yield* syncStage(call, "open_refusal_admission", () =>
        admitInvocationRefusal(
          resource.store,
          execution.successorPrefix,
          admission,
          "open_call",
          sha256Canonical(opened as unknown as JsonValue),
          [`diagnostic://abiogenesis/open-call/${opened.code}@5`],
          {
            eventTime: call.invocation.eventTime,
            correlationId: `${call.invocation.correlationRef}/open-refusal`,
            causationEventRefs: [],
          },
        )
      );
      return yield* finish(
        call,
        resource,
        refused.successorPrefix,
        ProductRunInvocationPort.projectOwnerRefusal(
          call.invocation.definitionKey.memberKey,
          {
            stage: "open_call",
            code: opened.code,
            evidenceRefs: [refused.admission.admissionEventRef],
          },
        ) as OwnerSemanticOutput<TPacket>,
        prepared,
        admission,
        null,
      );
    }
    const completePostOpen = Effect.gen(function* () {
      const authorityPrefix = yield* syncStage(call, "runtime_truth", () =>
        projectRuntimeTruthAtDurablePrefix(
          opened.successorPrefix,
          opened.scope.runId,
        ).authorityPrefix
      );
      const leafPort = yield* asyncStage(call, "leaf_port", () =>
        constructAdmittedLeafInvocationPort({
          prefix: authorityPrefix,
          artifactTruth: setup.artifactTruth,
          implementationSet: execution.implementationSet,
          executionResolution: prepared.resolution,
          semanticsProjection: projectInstalledLeafSemantics(
            prepared.resolution.productSemantics,
          ),
        })
      );
      const traversal = yield* executeGraphTraversalEffect({
        store: resource.store,
        predecessorPrefix: opened.successorPrefix,
        executionBasis: execution.executionBasis,
        openedTraversalScope: opened.scope,
        program: prepared.resolution.program,
        graphFunction: prepared.resolution.graphFunction,
        graph,
        graphValidation,
        programValidation: prepared.resolution.programValidation,
        implementationSet: execution.implementationSet,
        interactionSet: execution.interactionSet,
        continuationProductBasis: {
          install: prepared.resolution.programInstall,
          workspaceBinding: setup.workspaceBinding,
          artifactTruth: setup.artifactTruth,
          catalogView: productResources.catalogView,
          programValidation: prepared.resolution.programValidation,
          graphValidation,
        },
        leafPort,
        closureContract: prepared.resolution.closureContract,
        actorRuntimeBinding: {
          workspaceBinding: setup.workspaceBinding,
          artifactTruth: setup.artifactTruth,
        },
        input: prepared.admittedInput,
        inputDigest: prepared.rawInput.subjectDigest,
        eventTime: call.invocation.eventTime,
        correlationId: `${call.invocation.correlationRef}/hog`,
      });
      if (traversal.kind === "graph_traversal_entry_refusal") {
        const ownerOutput = yield* syncStage(
          call,
          "output_contract",
          () => ProductRunInvocationPort.projectOwnerRefusal(
            call.invocation.definitionKey.memberKey,
            {
              stage: "traversal",
              code: traversal.code,
              evidenceRefs: [traversal.diagnosticRef],
            },
          ) as OwnerSemanticOutput<TPacket>,
        );
        return yield* finish(
          call,
          resource,
          opened.successorPrefix,
          ownerOutput,
          prepared,
          admission,
          null,
        );
      }
      const finalPrefix = traversal.successorPrefix;
      const truth = yield* syncStage(call, "run_truth", () =>
        projectRunTruthAtDurablePrefix(finalPrefix, opened.scope.runId)
      );
      const ownerOutput = yield* syncStage(
        call,
        "output_contract",
        () => ProductRunInvocationPort.projectOutcome(
          call.invocation.definitionKey.memberKey,
          truth,
        ) as OwnerSemanticOutput<TPacket>,
      );
      return yield* finish(
        call,
        resource,
        finalPrefix,
        ownerOutput,
        prepared,
        admission,
        truth.kind === "abg_run_truth_projection" ? truth : null,
      );
    }).pipe(Effect.catchAllCause((cause) =>
      (() => {
        const failureOption = Cause.failureOption(cause);
        const executionFault = Option.isSome(failureOption)
          ? failureOption.value
          : null;
        const interrupted = Cause.isInterrupted(cause);
        const stage = executionFault?.stage === "leaf_port"
          ? "implementation_load" as const
          : executionFault?.stage === "output_contract"
          ? "output_contract" as const
          : executionFault !== null || interrupted
          ? "operation_application" as const
          : "hog_traversal" as const;
        const recoverAndFinish = () =>
          syncStage(call, "post_open_runtime_failure", () => {
            const predecessorPrefix = selectHeldEventStoreDurablePrefix(
              resource.store,
            );
            let finalPrefix = predecessorPrefix;
            let truth = projectRunTruthAtDurablePrefix(
              finalPrefix,
              opened.scope.runId,
            );
            if (
              truth.kind !== "abg_run_truth_projection" ||
              truth.runtimeStatus === "active"
            ) {
              const failureReceipt = admitRuntimeFailure({
                store: resource.store,
                predecessorPrefix,
                executionBasis: execution.executionBasis,
                scope: opened.scope,
                stage,
                subject: {
                  definitionKey: call.invocation.definitionKey,
                  stage: executionFault?.stage ??
                    (interrupted ? "interruption" : "hog_traversal"),
                  code: executionFault?.code ??
                    (interrupted ? "interrupted" : "defect"),
                  message: executionFault?.message ?? Cause.pretty(cause),
                },
                diagnosticRef: stage === "implementation_load"
                  ? "diagnostic://abiogenesis/implementation/admitted-leaf-port-construction-failure@5"
                  : stage === "hog_traversal"
                  ? "diagnostic://abiogenesis/hog/traversal-defect@5"
                  : stage === "output_contract"
                  ? "diagnostic://abiogenesis/run/output-contract@5"
                  : interrupted
                  ? "diagnostic://abiogenesis/run/post-open-interruption@5"
                  : "diagnostic://abiogenesis/run/post-open-operation@5",
                basis: {
                  eventTime: call.invocation.eventTime,
                  correlationId:
                    `${call.invocation.correlationRef}/post-open-runtime-failure`,
                  causationEventRefs: [],
                },
              });
              finalPrefix = failureReceipt.successorPrefix;
              truth = projectRunTruthAtDurablePrefix(
                finalPrefix,
                opened.scope.runId,
              );
            }
            return {
              finalPrefix,
              ownerOutput: ProductRunInvocationPort.projectOutcome(
                call.invocation.definitionKey.memberKey,
                truth,
              ) as OwnerSemanticOutput<TPacket>,
              truth: truth.kind === "abg_run_truth_projection" ? truth : null,
            };
          }).pipe(Effect.flatMap((recovered) => finish(
            call,
            resource,
            recovered.finalPrefix,
            recovered.ownerOutput,
            prepared,
            admission,
            recovered.truth,
          )));
        return recoverAndFinish().pipe(
          Effect.catchAllCause(() => recoverAndFinish()),
        );
      })()
    ));
    return yield* completePostOpen;
  }));
}

const invoke = bindExactPrefixTransition(
  RUN_OPERATION_CONTRACTS.invoke.invoke,
  runInvocationOwner<InvokePacket>,
  RUN_INVOCATION_RESOURCE_ASSERTION_SCHEMA,
  RUN_INVOCATION_RESOURCE_RECEIPT_SCHEMA,
);

const start = bindExactPrefixTransition(
  RUN_OPERATION_CONTRACTS.invoke.start,
  runInvocationOwner<StartPacket>,
  RUN_INVOCATION_RESOURCE_ASSERTION_SCHEMA,
  RUN_INVOCATION_RESOURCE_RECEIPT_SCHEMA,
);

export const RUN_DEFINITION_BINDINGS = Object.freeze({
  invoke: Object.freeze({ invoke, start }),
});
