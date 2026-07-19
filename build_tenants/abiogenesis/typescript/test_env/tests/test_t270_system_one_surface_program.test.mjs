import assert from "node:assert/strict";
import test from "node:test";

import {
  compileOneSurfaceGtlProgramApplication
} from "../../build/semantic/code/src/abg/m03/contracts/one_surface_program_compiler.js";
import {
  constructOneSurfaceAuthorityInputBasis,
  constructOneSurfaceProgramMemberProjection,
  deriveProgramActionCatalog
} from "../../build/semantic/code/src/abg/m03/contracts/one_surface_authority.js";
import {
  constructAdmittedInvocationCarrier
} from "../../build/semantic/code/src/abg/m03/contracts/declared_execution_context.js";
import {
  admitBoundWorkspaceCatalog,
  deriveRegistrySessionView
} from "../../build/semantic/code/src/abg/m03/contracts/runtime_catalog.js";
import {
  createOneSurfaceRuntimeEmitter,
  executeOneSurfaceAuthorityStage
} from "../../build/semantic/code/src/abg/m03/runner/one_surface_program_runtime.js";
import {
  interpretCompleteCProgram
} from "../../build/semantic/code/src/abg/m03/runner/complete_c_program_runtime.js";
import {
  ABG_SYSTEM_ONE_SURFACE_CATALOG_HANDLE,
  ABG_SYSTEM_ONE_SURFACE_GRAPH_FUNCTION_HANDLE,
  ABG_SYSTEM_ONE_SURFACE_MODULE_PATH,
  assertInstalledAbgSystemOneSurfaceAuthority,
  buildAbgSystemOneSurfaceProgram,
  executeInstalledAbgSystemOneSurfaceSelection,
  projectInstalledAbgSystemOneSurfaceAuthority
} from "../../build/semantic/code/src/app/m04/public_contracts/abg_system_one_surface_program.js";
import {
  ABG_SYSTEM_SUNNY_GRAPH_FUNCTION_ID,
  ABG_SYSTEM_SUNNY_GRAPH_FUNCTION_HANDLE,
  ABG_SYSTEM_SUNNY_INPUT_SCHEMA_REF,
  buildAbgSystemSunnyGraphFunctionModule
} from "../../build/semantic/code/src/app/m04/public_contracts/abg_system_sunny_graph_function.js";
import {
  constructConstructionPriorityScheme
} from "../../build/semantic/code/src/abg/m03/contracts/construction_priority.js";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";
import {
  constructGtlLibraryEntryDeclaration
} from "../../build/semantic/code/src/gtl/m02/contracts/runtime_registry.js";

const MODULE_REF =
  `contribution://abiogenesis/5.0.0#${ABG_SYSTEM_ONE_SURFACE_MODULE_PATH}`;
const SUNNY_ENTRY_REF =
  "catalog-entry://abiogenesis/system/workspace-request-identity/v1";
const SUNNY_MODULE_REF =
  "contribution://abiogenesis/5.0.0#contracts/catalog/abiogenesis-system-sunny-catalog.module.json";

async function admittedCatalog() {
  const program = await buildAbgSystemOneSurfaceProgram();
  const sunnyModule = buildAbgSystemSunnyGraphFunctionModule();
  const declaration = constructGtlLibraryEntryDeclaration({
    declarationRef: ABG_SYSTEM_ONE_SURFACE_GRAPH_FUNCTION_HANDLE,
    entryRef: ABG_SYSTEM_ONE_SURFACE_CATALOG_HANDLE,
    libraryScope: "system",
    entryKind: "graph_function",
    namespace: "abiogenesis",
    ownerRef: "abiogenesis",
    version: "5.0.0",
    graphFunctionRef: ABG_SYSTEM_ONE_SURFACE_GRAPH_FUNCTION_HANDLE,
    interfaceRef: "abg.schema.one-surface.observation-input",
    sourceContractRef: "abg.schema.one-surface.observation-input",
    targetContractRef: "abg.schema.one-surface.action-decision",
    authorityRefs: ["authority://abiogenesis/system/one-surface"],
    overlayRefs: [],
    provenanceRefs: ["provenance://abiogenesis/system/one-surface"],
    readinessRefs: ["readiness://abiogenesis/system/one-surface"],
    proofRefs: ["proof://abiogenesis/system/one-surface"],
    policyRefs: ["policy://abiogenesis/system/one-surface"],
    declarationSourceRefs: [MODULE_REF]
  });
  const admission = admitBoundWorkspaceCatalog({
    kind: "bound_catalog_admission_batch",
    workspaceId: "workspace://t270/system-one-surface",
    bindingId: "binding://t270/system-one-surface",
    catalogId: "catalog://t270/system-one-surface",
    resolvedLockRef: "lock://t270/system-one-surface",
    systemDeclarations: [
      Object.freeze({
        kind: "runtime_library_entry",
        declaration,
        moduleRef: MODULE_REF,
        module: program.module
      }),
      Object.freeze({
        kind: "runtime_library_entry",
        declaration: constructGtlLibraryEntryDeclaration({
          declarationRef: ABG_SYSTEM_SUNNY_GRAPH_FUNCTION_HANDLE,
          entryRef: SUNNY_ENTRY_REF,
          libraryScope: "system",
          entryKind: "graph_function",
          namespace: "abiogenesis",
          ownerRef: "abiogenesis",
          version: "5.0.0",
          graphFunctionRef: ABG_SYSTEM_SUNNY_GRAPH_FUNCTION_ID,
          interfaceRef: ABG_SYSTEM_SUNNY_INPUT_SCHEMA_REF,
          sourceContractRef: ABG_SYSTEM_SUNNY_INPUT_SCHEMA_REF,
          targetContractRef: ABG_SYSTEM_SUNNY_INPUT_SCHEMA_REF,
          authorityRefs: ["authority://abiogenesis/system/sunny"],
          overlayRefs: [],
          provenanceRefs: ["provenance://abiogenesis/system/sunny"],
          readinessRefs: ["readiness://abiogenesis/system/sunny"],
          proofRefs: ["proof://abiogenesis/system/sunny"],
          policyRefs: ["policy://abiogenesis/system/sunny"],
          declarationSourceRefs: [SUNNY_MODULE_REF]
        }),
        moduleRef: SUNNY_MODULE_REF,
        module: sunnyModule
      })
    ],
    orderedProductBatches: [],
    causationEventRefs: ["event://t270/system-one-surface/catalog"],
    correlationId: "correlation://t270/system-one-surface"
  }, () => {});
  assert.equal(admission.accepted, true, JSON.stringify(admission));
  assert.notEqual(admission.basis, null);
  return Object.freeze({ admission, program });
}

test("T-270 SYSTEM One Surface program owns four distinct ordered authorities", async () => {
  const { program } = await admittedCatalog();
  assert.deepEqual(
    program.authorityProgram.stages.map((stage) => stage.functionKind),
    ["synthesize_model", "eval_gap", "evaluate_next", "evaluate_action"]
  );
  assert.equal(
    new Set(program.authorityProgram.stages.map(
      (stage) => stage.stage.stageBindingRef
    )).size,
    4
  );
  assert.equal(
    new Set(program.authorityProgram.stages.map(
      (stage) => stage.resultAuthority.programLocusRef
    )).size,
    4
  );
  const allowed = program.authorityProgram.stages[2]
    .allowedConsequenceCatalog.rows;
  assert.equal(allowed.length, 1);
  assert.deepEqual(
    allowed[0].allowedGraphFunctionRefs,
    []
  );
  assert.equal(
    allowed[0].requiredAuthorityRefs.some((ref) => ref.includes("sunny")),
    false
  );
  assert.equal(program.recursePlan.maxApplications, 1);
});

test("T-270 One Surface stage order cannot be permuted or shortened", async () => {
  const { program } = await admittedCatalog();
  const binding = program.gtlProgram.runtimeBindings[0];
  assert.notEqual(binding, undefined);
  for (const stageBindingRefs of [
    [...binding.stageBindingRefs].reverse(),
    binding.stageBindingRefs.slice(0, -1)
  ]) {
    const compilation = await compileOneSurfaceGtlProgramApplication({
      gtlProgram: Object.freeze({
        ...program.gtlProgram,
        runtimeBindings: Object.freeze([Object.freeze({
          ...binding,
          stageBindingRefs: Object.freeze(stageBindingRefs)
        })])
      }),
      stageAuthorities: program.stageAuthorities,
      recursePlan: program.recursePlan
    });
    assert.equal(compilation.authorityProgram, null);
    assert.notEqual(compilation.diagnostics.length, 0);
  }
});

test("T-270 installed catalog, not the SDK constructor, seals program authority", async () => {
  const { admission } = await admittedCatalog();
  const installed = await projectInstalledAbgSystemOneSurfaceAuthority({
    catalogBasis: admission.basis
  });
  assertInstalledAbgSystemOneSurfaceAuthority(installed);
  assert.equal(
    installed.authorityProgram.admittedProgramRef,
    "program://abiogenesis/system/one-surface/control/v1"
  );
  assert.throws(
    () => assertInstalledAbgSystemOneSurfaceAuthority(Object.freeze({
      ...installed,
      installedAuthorityDigest: installed.moduleDigest
    })),
    /seal differs/u
  );
});

test("T-270 AF-13 intersects applied-program membership with the exact view", async () => {
  const { admission, program } = await admittedCatalog();
  const installed = await projectInstalledAbgSystemOneSurfaceAuthority({
    catalogBasis: admission.basis
  });
  const sunnyBinding = admission.basis.executionBindings.find(
    (binding) => binding.entryRef === SUNNY_ENTRY_REF
  );
  const controlBinding = admission.basis.executionBindings.find(
    (binding) => binding.entryRef === ABG_SYSTEM_ONE_SURFACE_CATALOG_HANDLE
  );
  assert.notEqual(sunnyBinding, undefined);
  assert.notEqual(controlBinding, undefined);
  const sunnyView = deriveRegistrySessionView({
    basis: admission.basis,
    allowedEntryRefs: [SUNNY_ENTRY_REF]
  });
  const controlView = deriveRegistrySessionView({
    basis: admission.basis,
    allowedEntryRefs: [ABG_SYSTEM_ONE_SURFACE_CATALOG_HANDLE]
  });
  assert.equal(sunnyView.accepted, true);
  assert.equal(controlView.accepted, true);
  const projection = (binding) => constructOneSurfaceProgramMemberProjection({
    admittedProgramRef: installed.authorityProgram.admittedProgramRef,
    admittedProgramDigest: installed.authorityProgram.admittedProgramDigest,
    graphFunctions: [Object.freeze({
      graphFunctionRef: binding.graphFunctionId,
      graphFunctionDigest: binding.graphFunctionDigest
    })]
  });
  const catalogFor = (programMembers, catalogView) =>
    deriveProgramActionCatalog({
      episodeId: "episode://t270/program-member-intersection",
      allowedCatalog:
        program.authorityProgram.stages[2].allowedConsequenceCatalog,
      catalogView,
      programMembers
    });

  const admitted = catalogFor(projection(sunnyBinding), sunnyView.view);
  assert.equal(admitted.kind, "construction_action_catalog_projection");
  assert.deepEqual(
    admitted.rows.map((row) => row.graphFunctionRef),
    [sunnyBinding.graphFunctionId]
  );
  const visibleButUnapplied = catalogFor(
    projection(controlBinding),
    sunnyView.view
  );
  assert.equal(
    visibleButUnapplied.kind,
    "construction_action_catalog_projection"
  );
  assert.deepEqual(visibleButUnapplied.rows, []);
  const appliedButHidden = catalogFor(
    projection(sunnyBinding),
    controlView.view
  );
  assert.equal(appliedButHidden.kind, "construction_action_catalog_projection");
  assert.deepEqual(appliedButHidden.rows, []);
});

test("T-270 installed One Surface authority owns sunny pre-invoke selection", async () => {
  const { admission, program } = await admittedCatalog();
  assert.deepEqual(program.module.imports, []);
  assert.equal(program.module.graphs.length, 2);
  assert.equal(program.module.graphFunctions.length, 3);
  const installed = await projectInstalledAbgSystemOneSurfaceAuthority({
    catalogBasis: admission.basis
  });
  const sunnyBinding = admission.basis.executionBindings.find(
    (binding) => binding.entryRef === SUNNY_ENTRY_REF
  );
  assert.notEqual(sunnyBinding, undefined);
  const programMembers = constructOneSurfaceProgramMemberProjection({
    admittedProgramRef: installed.authorityProgram.admittedProgramRef,
    admittedProgramDigest: installed.authorityProgram.admittedProgramDigest,
    graphFunctions: Object.freeze([Object.freeze({
      graphFunctionRef: sunnyBinding.graphFunctionId,
      graphFunctionDigest: sunnyBinding.graphFunctionDigest
    })])
  });
  const workspaceBinding = Object.freeze({
    ref: "workspace-binding://t270/system-one-surface/sunny",
    digest: stableSha256Digest({ workspace: "t270-system-one-surface-sunny" })
  });
  const invocationAuthority = Object.freeze({
    ref: "invocation-authority://t270/system-one-surface/sunny",
    digest: stableSha256Digest({ invocation: "t270-system-one-surface-sunny" })
  });
  const emitted = [];
  const result = await executeInstalledAbgSystemOneSurfaceSelection({
    authority: installed,
    catalogBasis: admission.basis,
    selection: Object.freeze({
      episodeId: "episode://t270/system-one-surface/sunny",
      intentLineageRef: "intent-lineage://t270/system-one-surface/sunny",
      admittedProductTruthRefs: Object.freeze([
        "product-truth://t270/system-one-surface/sunny"
      ]),
      workspaceBinding,
      invocationAuthority,
      programMembers,
      replayCursorRef: "replay://t270/system-one-surface/sunny/0",
      runtimeProjectionRef:
        "projection://t270/system-one-surface/sunny/runtime",
      allowedEntryRefs: Object.freeze([SUNNY_ENTRY_REF]),
      priorityScheme: constructConstructionPriorityScheme({
        schemeRef: "priority-scheme://t270/system-one-surface/sunny",
        sourcePolicyRef: "policy://t270/system-one-surface/sunny",
        rules: []
      }),
      targetObligationRefs: Object.freeze([
        "obligation://t270/system-one-surface/sunny"
      ]),
      targetEvidenceAuthorityRefs: Object.freeze([
        "proof://t270/abg-system-fd-sunny"
      ]),
      gapEvidenceRefs: Object.freeze([
        "evidence://t270/system-one-surface/sunny/gap"
      ]),
      gapAuthorityRefs: Object.freeze([
        "authority://t270/system-one-surface/sunny/gap"
      ]),
      causationRef: "event://t270/system-one-surface/sunny/request",
      correlationId: "correlation://t270/system-one-surface/sunny",
      inputPayloadRef: "payload://t270/system-one-surface/sunny/request",
      inputLineageRef: "lineage://t270/system-one-surface/sunny/request",
      runtimeScope: Object.freeze({
        basisId: "basis://t270/system-one-surface/sunny/run",
        graphCallId: "graph-call://t270/system-one-surface/sunny/run",
        frameId: "frame://t270/system-one-surface/sunny/run"
      })
    }),
    emitterContext: createOneSurfaceRuntimeEmitter([]),
    eventSink: (event) => emitted.push(event)
  });
  assert.equal(result.kind, "one_surface_sunny_selection_result");
  assert.equal(result.nextAction.disposition.variant, "callable_member_action");
  assert.equal(
    result.nextAction.disposition.targetRef,
    "graph-function-id://abiogenesis/system/workspace-request-identity/v1"
  );
  assert.equal(result.intentAdmission.status, "admitted");
  assert.equal(
    result.intentAdmission.constructionIntentAdmission.admittedIntent
      .selectedGraphFunctionRef,
    result.nextAction.disposition.targetRef
  );
  assert.deepEqual(emitted, result.runtimeEvents);
  assert.equal(
    result.runtimeEvents.filter(
      (event) => event.kind === "construction_observation_snapshot_materialized"
    ).length,
    1
  );
  assert.equal(
    result.runtimeEvents.filter((event) => event.kind === "c_call_judged").length,
    3
  );
});

test("T-270 executes one declared authority leaf through the complete-C spine", async () => {
  const { admission, program } = await admittedCatalog();
  const stage = program.authorityProgram.stages[0];
  const inputBasis = constructOneSurfaceAuthorityInputBasis({
    functionKind: "synthesize_model",
    inputRefs: [
      program.authorityProgram.bindingRef,
      program.authorityProgram.bindingDigest,
      "intent-lineage://t270/system-one-surface"
    ],
    inputValue: Object.freeze({
      intentLineageRef: "intent-lineage://t270/system-one-surface"
    })
  });
  const emitted = [];
  const result = await executeOneSurfaceAuthorityStage({
    application: program.authorityProgram,
    functionKind: "synthesize_model",
    inputBasis,
    implementations: [Object.freeze({
      kind: "one_surface_fd_stage_implementation",
      functionKind: "synthesize_model",
      stageAuthorityRef: stage.authorityRef,
      implementationRef:
        "implementation://abiogenesis/system/one-surface/synthesize-model/v1",
      invoke: () => Object.freeze({
        desiredAssetRefs: Object.freeze([
          "asset://abiogenesis/system/sunny/output"
        ]),
        knownAssetRefs: Object.freeze([
          "asset://abiogenesis/system/sunny/input"
        ])
      })
    })],
    catalogBasis: admission.basis,
    selectedCatalogEntryRef: ABG_SYSTEM_ONE_SURFACE_CATALOG_HANDLE,
    inputPayloadRef: "payload://t270/system-one-surface/observation",
    inputLineageRef: "lineage://t270/system-one-surface/observation",
    runtimeScope: Object.freeze({
      basisId: "basis://t270/system-one-surface/run-1",
      graphCallId: "graph-call://t270/system-one-surface/run-1",
      frameId: "frame://t270/system-one-surface/run-1"
    }),
    emitterContext: createOneSurfaceRuntimeEmitter([]),
    eventSink: (event) => emitted.push(event)
  });
  assert.equal(result.authorityResult.functionKind, "synthesize_model");
  assert.deepEqual(
    result.authorityResult.decodedValue.desiredAssetRefs,
    ["asset://abiogenesis/system/sunny/output"]
  );
  assert.deepEqual(result.runtimeEvents.map((event) => event.kind), [
    "c_call_opened",
    "c_call_fibre_selected",
    "authority_snapshot_admitted",
    "payload_observed",
    "payload_validated",
    "evidence_admitted",
    "evidence_admitted",
    "evidence_admitted",
    "c_call_evidenced",
    "c_call_result_admitted",
    "c_call_judged"
  ]);
  assert.deepEqual(emitted, result.runtimeEvents);
});

test("T-270 complete-C fails closed on a non-evidence event in an atom submission", async () => {
  const { admission, program } = await admittedCatalog();
  const stage = program.authorityProgram.stages[0];
  const outcome = await interpretCompleteCProgram({
      kind: "c_program_interpreter_invocation",
      plan: stage.plan,
      catalogBasis: admission.basis,
      selectedCatalogEntryRef: ABG_SYSTEM_ONE_SURFACE_CATALOG_HANDLE,
      parentBasisId: "basis://t270/non-evidence",
      parentGraphCallId: "graph-call://t270/non-evidence",
      parentFrameId: "frame://t270/non-evidence",
      vectorIndex: 0,
      inputPayloadRef: "payload://t270/non-evidence/input",
      inputLineageRef: "lineage://t270/non-evidence/input",
      replayReceipts: [],
      invokeAdmittedAtom: async (request) => Object.freeze({
        kind: "c_program_atom_invocation_submission",
        result: Object.freeze({
          kind: "c_program_atom_result",
          planRef: request.planRef,
          nodeRef: request.nodeRef,
          cursorRef: request.cursorRef,
          status: "completed",
          outputCarrierRef: request.outputCarrierRef,
          outputPayloadRef: "payload://t270/non-evidence/output",
          responseContractRef: request.outputCarrierRef,
          outputLineageRef: "lineage://t270/non-evidence/output",
          reasonRef: null,
          failureClass: null,
          evidenceRefs: ["evidence://t270/non-evidence"],
          cCallRef: request.cCallRef,
          sourceEventRefs: ["event://t270/non-evidence"]
        }),
        admittedTargetCarrier: constructAdmittedInvocationCarrier({
          sourceNodeRef: request.nodeRef,
          schemaRef: stage.nativeResultSchema.schemaRef,
          carrierRef: "payload://t270/non-evidence/output",
          admissionRef: "lineage://t270/non-evidence/output",
          value: Object.freeze({ invalid: true })
        }),
        interiorEvents: [],
        evidenceEvents: [Object.freeze({
          kind: "basis_admitted",
          basisId: "basis://t270/non-evidence",
          graphFunctionId: stage.plan.executionGraphFunctionRef,
          jobId: "job://t270/non-evidence",
          resolvedRuntimeRef: "runtime://t270/non-evidence",
          resolvedPolicyBundleRef: "policy://t270/non-evidence",
          runId: "run://t270/non-evidence",
          workKey: "work://t270/non-evidence",
          startAdmissionWitnessDigest:
            "sha256:0000000000000000000000000000000000000000000000000000000000000000"
        })],
        closeBasis: Object.freeze({
          kind: "c_program_atom_close_basis",
          evidenceClass: "invalid_adapter_event",
          evidenceRefs: ["evidence://t270/non-evidence"],
          resultContractRef:
            stage.resultAuthority.selectedResultContractRef
        })
      })
    });
  assert.equal(outcome.status, "runtime_failed");
  assert.equal(outcome.failureClass, "contract_failure");
  assert.equal(
    outcome.runtimeEvents.some((event) => event.kind === "basis_admitted"),
    false
  );
});
