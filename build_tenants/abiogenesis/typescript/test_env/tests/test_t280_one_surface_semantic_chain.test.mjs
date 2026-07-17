// Validates: T-280; REQ-R-ABG3-FP-CONSCIOUSNESS-002A..007, 011E.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  admitBoundWorkspaceCatalog,
  admitEvalGapResult,
  admitOneSurfaceConstructionIntent,
  admitSynthesizeModelResult,
  compileOneSurfaceGtlProgramApplication,
  constructConstructionIntentCandidate,
  constructConstructionPriorityScheme,
  constructGtlLibraryEntryDeclaration,
  constructNextActionBasis,
  constructObservationPressureRow,
  constructTargetObligationBinding,
  deriveConstructionPriorityProjection,
  deriveNextActionProjection,
  deriveObservationToActionBindingProjection,
  deriveProgramActionCatalog,
  deriveRegistrySessionView,
  loadGtlTargetCarrierDefaultsBundle,
  oneSurfaceEvalGapInputBasis,
  oneSurfaceEvaluateNextInputBasis,
  oneSurfaceSynthesizeModelInputBasis,
  resolveTargetCarrierContractBinding
} from "../../build/semantic/code/src/index.js";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";
import {
  admitOneSurfaceExecution
} from "../../build/semantic/code/src/abg/m03/runner/one_surface_execution_admission.js";
import {
  assertProgramExecutionAuthoritySet,
  compileProgramExecutionAuthoritySet
} from "../../build/semantic/code/src/abg/m03/contracts/one_surface_execution_authority.js";
import {
  scenario09OneSurfaceProgramFixture
} from "../fixtures/t280_scenario09_one_surface_fixture.mjs";
import {
  projectOneSurfaceReplayAttempt
} from "./support/t280-one-surface-replay-fixtures.mjs";
import {
  ABG_CONSENSUS_GTL_BODY,
  ABG_CONSENSUS_GTL_MODULE,
  CONSENSUS_GRAPH_FUNCTION_REF,
  CONSENSUS_REVIEW_ONE_PROFILE_GRAPH_FUNCTION_REF
} from "../../build/semantic/code/src/abg/m03/contracts/consensus_gtl_body.js";
import {
  deriveConsensusModuleDeclaration
} from "../../build/semantic/code/src/abg/m03/contracts/review_consensus_modules.js";
import {
  ABG_CONSENSUS_INSTRUCTION_DECLARATION,
  ABG_CONSENSUS_INSTRUCTION_DECLARATION_MODULE,
  CONSENSUS_INSTRUCTION_DECLARATION_MODULE_REF
} from "../../build/semantic/code/src/abg/m03/contracts/consensus_instruction_protocol.js";
import {
  admitTenantConformanceManifest,
  tenantConformanceManifestDigest
} from "../../build/semantic/code/src/app/m04/product_intake/tenant_conformance_manifest.js";

const CATALOG_ENTRY_REF =
  "catalog-entry://t280/system/scenario09-normalize";
const CATALOG_MODULE_REF =
  "gtl-module://t280/scenario09-one-surface";

function publicContractRow({ contractId, contractKind, capabilityRefs }) {
  const digest = stableSha256Digest({
    contractId,
    contractKind,
    capabilityRefs
  });
  return Object.freeze({
    contractId,
    contractKind,
    owningProductId: "abiogenesis",
    version: "1.0.0",
    digest,
    authorityRefs: Object.freeze(["REQ-M-GTL3-CAPABILITY"]),
    capabilityRefs: Object.freeze([...capabilityRefs]),
    nativeLocator: null,
    assetLocator: Object.freeze({
      kind: "asset",
      relativePath: `contracts/t270/${contractId.replaceAll(".", "-")}.json`,
      schemaId: contractId,
      schemaVersion: "1.0.0",
      mediaType: "application/json",
      digest
    }),
    operationContract: null
  });
}

function admittedCapabilityManifest(effectRefs) {
  const capabilityId = "capability://t270/canonical-program-effects";
  const rows = Object.freeze([
    publicContractRow({
      contractId: "abg.schema.tenant-conformance-manifest",
      contractKind: "schema_asset",
      capabilityRefs: []
    }),
    publicContractRow({
      contractId: "abg.contract.t270-program-effects",
      contractKind: "capability",
      capabilityRefs: [capabilityId]
    })
  ]);
  const catalogBasis = Object.freeze({
    kind: "abg_public_contract_catalog",
    schemaVersion: 1,
    catalogId: "abg.public-contract-catalog.t270",
    catalogVersion: "1.0.0",
    catalogSchemaPath: "contracts/public-contract-catalog.schema.json",
    catalogSchemaDigest: stableSha256Digest("t270-catalog-schema"),
    profile: "abg-5-ds1",
    rows
  });
  const catalog = Object.freeze({
    ...catalogBasis,
    catalogDigest: stableSha256Digest(catalogBasis)
  });
  const schemaClaim = Object.freeze({
    claimRef: "claim://t270/tenant-manifest-schema",
    contractId: rows[0].contractId,
    contractVersion: rows[0].version,
    contractDigest: rows[0].digest
  });
  const capabilityClaim = Object.freeze({
    claimRef: "claim://t270/program-effects",
    contractId: rows[1].contractId,
    contractVersion: rows[1].version,
    contractDigest: rows[1].digest
  });
  const basis = Object.freeze({
    kind: "abg_tenant_conformance_manifest",
    schemaId: "abg.schema.tenant-conformance-manifest",
    schemaVersion: "1.0.0",
    manifestId: "abg.tenant-conformance.t270-canonical-program",
    manifestVersion: "1.0.0",
    engineId: "abg.engine.t270",
    engineVersion: "5.0.0-dev.0",
    publicContractCatalog: Object.freeze({
      catalogId: catalog.catalogId,
      catalogVersion: catalog.catalogVersion,
      catalogDigest: catalog.catalogDigest
    }),
    publicContractClaims: Object.freeze([schemaClaim, capabilityClaim]),
    capabilityClaims: Object.freeze([Object.freeze({
      capabilityId,
      owningContractClaimRef: capabilityClaim.claimRef,
      supportedDisposition: "supported",
      dependentCapabilityIds: Object.freeze([])
    })]),
    effectBindings: Object.freeze(effectRefs.map((effectRef) => Object.freeze({
      effectRef,
      capabilityId
    }))),
    enforcementClaims: Object.freeze([
      Object.freeze({
        contractClaimRef: schemaClaim.claimRef,
        carrierClassification: "declaration",
        applicableRuleIds: Object.freeze(["REQ-M-GTL3-CAPABILITY-001"]),
        causalPredecessorClaimRefs: Object.freeze([]),
        boundedProofRefs: Object.freeze(["proof://t270/manifest-schema"])
      }),
      Object.freeze({
        contractClaimRef: capabilityClaim.claimRef,
        carrierClassification: "declaration",
        applicableRuleIds: Object.freeze(["REQ-M-GTL3-CAPABILITY-015"]),
        causalPredecessorClaimRefs: Object.freeze([]),
        boundedProofRefs: Object.freeze(["proof://t270/program-effects"])
      })
    ])
  });
  const manifest = Object.freeze({
    ...basis,
    manifestDigest: tenantConformanceManifestDigest({
      ...basis,
      manifestDigest: stableSha256Digest("placeholder")
    })
  });
  return admitTenantConformanceManifest(manifest, catalog);
}

function stageAuthorities(fixture) {
  return Object.freeze(fixture.compiled.map((row) => Object.freeze({
    functionKind: row.member.stageRole,
    stage: row.bundle.computeStageBindings[0],
    plan: row.source.completeProgramPlan,
    resultAuthority: row.authorities[0],
    traversalContracts: row.bundle
  })));
}

function admittedAuthorityResult({
  source,
  program,
  stageIndex,
  inputBasis,
  decodedValue
}) {
  const stage = program.stages[stageIndex];
  const functionKind = stage.functionKind;
  const contract = resolveTargetCarrierContractBinding({
    vector: source.members[stageIndex].finalVector,
    defaults: loadGtlTargetCarrierDefaultsBundle()
  });
  assert.equal(contract.contractRef, stage.resultAuthority.selectedResultContractRef);
  assert.equal(
    contract.configDigest,
    stage.targetCarrierContract.targetCarrierContractDigest
  );
  const replay = projectOneSurfaceReplayAttempt({
    application: program,
    artifactValue: decodedValue,
    contract,
    inputBasis,
    ordinal: stageIndex + 1,
    stage,
    fixtureRef: `t280/scenario09/${functionKind}`
  });
  assert.equal(
    replay.projection.status,
    "admitted",
    replay.projection.diagnostic?.reason
  );
  return replay.projection.result;
}

function admitScenario09Catalog(fixture, options = {}) {
  const callable = options.graphFunction ?? fixture.callableLabFunction.finalHost;
  const module = options.module ?? fixture.aggregateModule;
  const declaration = options.declaration ?? constructGtlLibraryEntryDeclaration({
    declarationRef: "declaration://t280/system/scenario09-normalize",
    entryRef: CATALOG_ENTRY_REF,
    libraryScope: "system",
    entryKind: "graph_function",
    namespace: "abg.t280",
    ownerRef: "owner://abg",
    version: "5.0.0",
    graphFunctionRef: callable.id,
    interfaceRef: "interface://t280/scenario09-normalize",
    sourceContractRef: "schema://t280/LabObservation",
    targetContractRef: "schema://t280/NormalizedObservation",
    contextRefs: ["context://t280/scenario09"],
    authorityRefs: ["authority://t280/scenario09/callable"],
    overlayRefs: [],
    provenanceRefs: ["provenance://t280/scenario09"],
    readinessRefs: ["readiness://t280/scenario09"],
    proofRefs: ["proof://t280/scenario09/callable"],
    policyRefs: ["policy://t280/scenario09"],
    declarationSourceRefs: [CATALOG_MODULE_REF]
  });
  const moduleRef = options.moduleRef ?? CATALOG_MODULE_REF;
  const admission = admitBoundWorkspaceCatalog(
    {
      kind: "bound_catalog_admission_batch",
      workspaceId: "workspace://t280/scenario09",
      bindingId: "binding://t280/scenario09",
      catalogId: "catalog://t280/scenario09",
      resolvedLockRef: "lock://t280/scenario09",
      systemDeclarations: [
        {
          kind: "runtime_library_entry",
          declaration,
          moduleRef,
          module
        },
        ...(options.companionEntries ?? [])
      ],
      orderedProductBatches: [],
      causationEventRefs: ["event://t280/scenario09/catalog-bound"],
      correlationId: "correlation://t280/scenario09/catalog"
    },
    () => {}
  );
  assert.equal(admission.accepted, true, JSON.stringify(admission.rowDispositions));
  assert.notEqual(admission.basis, null);
  const session = deriveRegistrySessionView({
    basis: admission.basis,
    allowedEntryRefs: [declaration.entryRef]
  });
  assert.equal(session.accepted, true, JSON.stringify(session.residuals));
  assert.notEqual(session.view, null);
  assert.equal(session.view.entries.length, 1);
  assert.equal(session.view.entries[0].callable, true);
  assert.equal(session.view.entries[0].graphFunctionRef, callable.id);
  return Object.freeze({
    basis: admission.basis,
    entryRef: declaration.entryRef,
    session: session.view
  });
}

async function semanticChainFixture(options = {}) {
  const targetGraphFunction =
    options.graphFunction ?? null;
  const source = scenario09OneSurfaceProgramFixture({
    allowedGraphFunctionRef: targetGraphFunction?.id
  });
  const compilation = await compileOneSurfaceGtlProgramApplication({
    gtlProgram: source.gtlProgram,
    stageAuthorities: stageAuthorities(source),
    recursePlan: source.recursePlan
  });
  assert.equal(compilation.status, "semantic_not_realized");
  assert.notEqual(compilation.authorityProgram, null);
  const program = compilation.authorityProgram;
  const catalog = admitScenario09Catalog(source, options);
  const episodeId = "episode://t280/scenario09";
  const workspaceBinding = Object.freeze({
    ref: "workspace-binding://t280/scenario09",
    digest: stableSha256Digest({ workspace: "t280-scenario09" })
  });
  const invocationAuthority = Object.freeze({
    ref: "invocation-authority://t280/scenario09",
    digest: stableSha256Digest({ invocation: "t280-scenario09" })
  });

  const actionCatalog = deriveProgramActionCatalog({
    episodeId,
    allowedCatalog: program.stages[2].allowedConsequenceCatalog,
    catalogView: catalog.session
  });
  assert.equal(actionCatalog.kind, "construction_action_catalog_projection");
  assert.equal(actionCatalog.rows.length, 1);
  const action = actionCatalog.rows[0];
  assert.equal(action.actionKind, "invoke_graph_function");
  assert.equal(
    action.graphFunctionRef,
    targetGraphFunction?.id ?? source.callableLabFunction.finalHost.id
  );

  const synthesizeInput = Object.freeze({
    program,
    intentLineageRef: "intent-lineage://t280/scenario09",
    priorModel: null,
    admittedProductTruthRefs: Object.freeze([
      "product-truth://t280/scenario09"
    ])
  });
  const synthesizeBasis = oneSurfaceSynthesizeModelInputBasis(synthesizeInput);
  const synthesizeResult = admittedAuthorityResult({
    source,
    program,
    stageIndex: 0,
    inputBasis: synthesizeBasis,
    decodedValue: Object.freeze({
      desiredAssetRefs: Object.freeze(["asset://t280/scenario09/normalized"]),
      knownAssetRefs: Object.freeze(["asset://t280/scenario09/source"])
    })
  });
  const model = admitSynthesizeModelResult({
    ...synthesizeInput,
    result: synthesizeResult
  });
  assert.equal(model.kind, "product_asset_model");

  const replayCursorRef = "replay://t280/scenario09/0";
  const runtimeProjectionRef = "projection://t280/scenario09/runtime";
  const observationInputRefs = Object.freeze([
    ...action.inputAssetRefs
  ]);
  const pressure = constructObservationPressureRow({
    pressureRef: "pressure://t280/scenario09/normalize",
    pressureKind: "open_obligation",
    sourceRef: "gap://t280/scenario09/normalize",
    targetOutcomeRefs: [action.targetOutcomeRef],
    evidenceRefs: ["evidence://t280/scenario09/gap"],
    severity: 1,
    authorityRefs: ["authority://t280/scenario09/gap"]
  });
  const evalGapInput = Object.freeze({
    program,
    workspaceBinding,
    model,
    replayCursorRef,
    runtimeProjectionRef,
    observationInputRefs
  });
  const evalGapBasis = oneSurfaceEvalGapInputBasis(evalGapInput);
  const evalGapResult = admittedAuthorityResult({
    source,
    program,
    stageIndex: 1,
    inputBasis: evalGapBasis,
    decodedValue: Object.freeze({
      kind: "construction_observation_snapshot",
      episodeId,
      observationId: "observation://t280/scenario09/0",
      basisRef: workspaceBinding.ref,
      currentProjectionRef: runtimeProjectionRef,
      iterationOrdinal: 0,
      basisProjectionRef: replayCursorRef,
      priorIntentId: null,
      causationRef: "causation://t280/scenario09/observe",
      correlationId: "correlation://t280/scenario09",
      observedStateRefs: Object.freeze([
        model.modelRef,
        ...observationInputRefs
      ]),
      runtimeAggregateRefs: Object.freeze([]),
      linkedAssetRefs: observationInputRefs,
      passedInputRefs: Object.freeze([]),
      gapProjectionRefs: Object.freeze([pressure.sourceRef]),
      foldbackRefs: Object.freeze([]),
      retryFrontierRefs: Object.freeze([]),
      reentryFrontierRefs: Object.freeze([]),
      assuranceRefs: Object.freeze([]),
      fhInputRefs: Object.freeze([]),
      priorIntentRefs: Object.freeze([]),
      priorProgressRefs: Object.freeze([]),
      pressureRows: Object.freeze([pressure]),
      repairSurfaceTriageRows: Object.freeze([])
    })
  });
  const observation = admitEvalGapResult({
    ...evalGapInput,
    result: evalGapResult
  });
  assert.equal(observation.kind, "construction_observation_snapshot");
  assert.equal(
    observation.actionCatalogRef,
    program.stages[2].allowedConsequenceCatalog.catalogRef
  );

  const bindingProjection = deriveObservationToActionBindingProjection({
    observation,
    actionCatalog
  });
  assert.equal(bindingProjection.rows.length, 1);
  const selectedBinding = bindingProjection.rows[0];
  const priorityScheme = constructConstructionPriorityScheme({
    schemeRef: "priority-scheme://t280/scenario09",
    sourcePolicyRef: "policy://t280/scenario09",
    rules: []
  });
  const priorityProjection = deriveConstructionPriorityProjection({
    observation,
    actionCatalog,
    bindingProjection,
    priorityScheme
  });
  assert.equal(priorityProjection.rows.length, 1);
  const selectedPriority = priorityProjection.rows[0];
  const targetObligations = Object.freeze([Object.freeze({
    targetOutcomeRef: action.targetOutcomeRef,
    obligationRefs: Object.freeze([
      "obligation://t280/scenario09/normalize"
    ]),
    requiredEvidenceRefs: Object.freeze([
      "evidence://t280/scenario09/normalized"
    ])
  })]);
  const candidate = constructConstructionIntentCandidate({
    candidateId: "candidate://t280/scenario09/normalize",
    episodeId,
    rank: selectedPriority.rankOrdinal,
    valueScore: selectedPriority.finalScore,
    priorityScore: selectedPriority.priorityScore,
    affectAdjustmentRefs: selectedPriority.affectAdjustmentRefs,
    selectedActionRef: action.actionRef,
    selectedBindingRef: selectedBinding.bindingRef,
    selectedOutcomeRef: selectedBinding.targetOutcomeRef,
    targetGraphFunctionRef: action.graphFunctionRef,
    targetVectorRef: action.graphVectorRef,
    targetReentryRef: selectedBinding.targetReentryRef,
    inputAssetRefs: selectedBinding.requiredInputRefs,
    expectedOutputAssetRefs: selectedBinding.providedOutputRefs,
    gapRefs: [pressure.sourceRef],
    obligationRefs: targetObligations[0].obligationRefs,
    lawfulBasisRefs: action.requiredAuthorityRefs,
    expectedDelta: "normalized observation appears",
    progressCondition: "normalization evidence is admitted",
    stopCondition: "normalization obligation closes",
    escalationCondition: "normalization remains blocked",
    rationale: "the sole admitted action is highest priority"
  });
  const nextBasis = constructNextActionBasis({
    basisKind: "initial_selection",
    causalRefs: [
      program.bindingRef,
      program.bindingDigest,
      invocationAuthority.ref,
      invocationAuthority.digest,
      workspaceBinding.ref,
      workspaceBinding.digest
    ]
  });
  const evaluateNextInput = Object.freeze({
    nextBasis,
    application: program,
    invocationAuthority,
    catalogBasis: catalog.basis,
    allowedEntryRefs: Object.freeze([catalog.entryRef]),
    observation,
    priorityScheme,
    targetObligations
  });
  const evaluateNextBasis = oneSurfaceEvaluateNextInputBasis(evaluateNextInput);
  const evaluateNextResult = admittedAuthorityResult({
    source,
    program,
    stageIndex: 2,
    inputBasis: evaluateNextBasis,
    decodedValue: Object.freeze({
      selectedActionRef: action.actionRef,
      intentCandidate: candidate
    })
  });
  const nextAction = deriveNextActionProjection({
    ...evaluateNextInput,
    authorityResult: evaluateNextResult
  });
  assert.equal(nextAction.kind, "next_action_projection");
  assert.equal(nextAction.disposition.variant, "callable_member_action");
  assert.equal(nextAction.selectedBindingRef, selectedBinding.bindingRef);
  assert.equal(nextAction.targetBindings.length, 1);
  assert.equal(
    nextAction.targetBindings[0].sourceBindingRef,
    selectedBinding.bindingRef
  );

  const intentAdmissionInput = Object.freeze({
    program,
    nextAction,
    observation,
    actionCatalog,
    bindingProjection,
    priorityProjection,
    workspaceBinding,
    invocationAuthority
  });
  const intentAdmission = admitOneSurfaceConstructionIntent(intentAdmissionInput);
  assert.equal(intentAdmission.status, "admitted");
  assert.equal(
    intentAdmission.constructionIntentAdmission.admittedIntent
      .selectedGraphFunctionRef,
    targetGraphFunction?.id ?? source.callableLabFunction.finalHost.id
  );
  return Object.freeze({
    action,
    bindingProjection,
    candidate,
    catalog,
    evaluateNextInput,
    evaluateNextResult,
    intentAdmission,
    intentAdmissionInput,
    invocationAuthority,
    nextAction,
    observation,
    priorityScheme,
    program,
    selectedBinding,
    source,
    targetObligations,
    workspaceBinding
  });
}

const chain = semanticChainFixture();
const canonicalConsensusDeclaration = deriveConsensusModuleDeclaration();
const consensusConditionalReadyDeclaration = Object.freeze({
  ...canonicalConsensusDeclaration,
  readinessRefs: Object.freeze(["readiness://t270/focused-consensus"]),
});
const consensusChain = semanticChainFixture({
  companionEntries: Object.freeze([Object.freeze({
    kind: "runtime_library_entry",
    declaration: ABG_CONSENSUS_INSTRUCTION_DECLARATION,
    moduleRef: CONSENSUS_INSTRUCTION_DECLARATION_MODULE_REF,
    module: ABG_CONSENSUS_INSTRUCTION_DECLARATION_MODULE
  })]),
  declaration: consensusConditionalReadyDeclaration,
  graphFunction: ABG_CONSENSUS_GTL_BODY.graphFunctions.consensus,
  module: ABG_CONSENSUS_GTL_MODULE,
  moduleRef: canonicalConsensusDeclaration.declarationSourceRefs[0]
});

function t270AdmissionInput(fixture, options = {}) {
  const admittedIntent =
    fixture.intentAdmission.constructionIntentAdmission.admittedIntent;
  assert.notEqual(admittedIntent, null);
  const executionBinding = fixture.catalog.basis.executionBindings.find(
    (binding) =>
      binding.graphFunctionId === admittedIntent.selectedGraphFunctionRef
  );
  assert.notEqual(executionBinding, undefined);
  const inputAssetRef = admittedIntent.inputAssetRefs[0];
  assert.equal(typeof inputAssetRef, "string");
  const inputValue = options.inputValue ?? Object.freeze({ observation: "raw" });
  const sourceNode = executionBinding.graphFunction.inputs[0];
  assert.notEqual(sourceNode, undefined);
  const inputBinding = Object.freeze({
    assetRef: inputAssetRef,
    assetType: sourceNode.schema.ref,
    uri:
      `data:application/json,${encodeURIComponent(JSON.stringify(inputValue))}`
  });
  const startIntent = Object.freeze({
    scope: Object.freeze({
      kind: "workspace",
      workspaceRoot: "/tmp/t280-scenario09",
      moduleName: executionBinding.moduleName
    }),
    target: Object.freeze({
      kind: "graph_function",
      handle: executionBinding.graphFunctionHandle
    }),
    until: "first_traversal",
    inputBindings: Object.freeze([inputBinding])
  });
  return Object.freeze({
    program: fixture.program,
    nextAction: fixture.nextAction,
    intentAdmission: fixture.intentAdmission,
    catalogBasis: fixture.catalog.basis,
    allowedEntryRefs: Object.freeze([fixture.catalog.entryRef]),
    executionBinding,
    startIntent,
    inputBindings: Object.freeze([inputBinding]),
    inputValue,
    admittedTenantConformanceManifest:
      options.admittedTenantConformanceManifest ??
        admittedCapabilityManifest(Object.freeze([]))
  });
}

function consensusSubjectValue() {
  const digest = stableSha256Digest("t270-consensus-ticket");
  return Object.freeze({
    kind: "consensus_subject",
    subjectContractRef: "contract://ticket",
    subjectRef: "ticket://T-270",
    subjectDigest: digest,
    submittingActorRef: "actor://t270/submitter",
    panelRef: "panel://t270/two-reviewers",
    roundPolicyRef: "policy://t270/bounded-rounds",
    workspaceRef: "workspace://t280/scenario09",
    ticketRef: "ticket://T-270",
    ticketDigest: digest
  });
}

function assertT270Refusal(result, code) {
  assert.equal(result.status, "refused");
  assert.equal(result.effectsPermitted, false);
  assert.equal(result.code, code, result.message);
}

function assertContextsBelongToContainingSubjects(authoritySet) {
  for (const subject of authoritySet.subjects) {
    for (const vector of subject.vectors) {
      for (const locus of vector.loci) {
        const context = locus.compiledExecutionContext;
        if (context === null) continue;
        assert.equal(
          context.selectedProgramBinding.hostGraphFunctionRef,
          subject.graphFunctionRef,
          "each executable child must retain its own T-255 program authority"
        );
      }
    }
  }
}

test("T-280 admits the real Scenario09 AF-11 through AF-14 semantic chain", async () => {
  const value = await chain;
  assert.equal(value.intentAdmission.status, "admitted");
  assert.equal(
    value.intentAdmission.constructionIntentAdmission.admittedIntent
      .selectedBindingRef,
    value.selectedBinding.bindingRef
  );
  assert.deepEqual(
    value.intentAdmission.targetBindingRefs,
    [value.nextAction.targetBindings[0].bindingRef]
  );
});

test("T-270 prepares static AF-15 authority and stops at named zero-effect gaps", async () => {
  const fixture = await chain;
  const input = t270AdmissionInput(fixture);
  const result = admitOneSurfaceExecution(input);
  assertT270Refusal(result, "runtime_failed");
  assert.match(result.message, /semantic_not_realized/u);
  assert(result.residualRefs.includes(
    "gap://abg/t270/admitted-runtime-authority-projection"
  ));
  assert(result.residualRefs.includes(
    "gap://abg/t270/admitted-locus-payload-value-projection"
  ));

  const authoritySet = compileProgramExecutionAuthoritySet({
    basis: input.catalogBasis,
    executionBinding: input.executionBinding,
    admittedTenantConformanceManifest:
      input.admittedTenantConformanceManifest
  });
  assertProgramExecutionAuthoritySet(authoritySet);
  assertContextsBelongToContainingSubjects(authoritySet);
  const staticAdmission = authoritySet.subjects[0].vectors[0].admission;
  assert.equal(staticAdmission.effectsPermitted, false);
  assert(
    authoritySet.subjects[0].vectors[0].loci.every((locus) =>
      !Object.hasOwn(locus, "declaredExecutionRequest") &&
      !Object.hasOwn(locus, "instructionAssembly")
    )
  );

  const outsideView = admitOneSurfaceExecution({
    ...input,
    allowedEntryRefs: Object.freeze(["catalog-entry://t270/outside-view"])
  });
  assert.equal(outsideView.status, "refused");
  assert.equal(outsideView.code, "outside_view");

  const wrongInputs = admitOneSurfaceExecution({
    ...input,
    inputBindings: Object.freeze([
      Object.freeze({
        ...input.inputBindings[0],
        assetRef: "asset://t270/wrong-input"
      })
    ])
  });
  assert.equal(wrongInputs.status, "refused");
  assert.equal(wrongInputs.code, "input_invalid");

});

test("T-270 refuses authority and intent mutations before runtime", async () => {
  const fixture = await chain;
  const input = t270AdmissionInput(fixture);
  const forgedDigest = stableSha256Digest({ forged: "t270" });
  const cases = Object.freeze([
    Object.freeze({
      name: "stale program",
      expectedCode: "program_invalid",
      input: Object.freeze({
        ...input,
        program: Object.freeze({
          ...input.program,
          admittedProgramDigest: forgedDigest
        })
      })
    }),
    Object.freeze({
      name: "stale next action",
      expectedCode: "program_invalid",
      input: Object.freeze({
        ...input,
        nextAction: Object.freeze({
          ...input.nextAction,
          projectionDigest: forgedDigest
        })
      })
    }),
    Object.freeze({
      name: "stale construction intent",
      expectedCode: "program_invalid",
      input: Object.freeze({
        ...input,
        intentAdmission: Object.freeze({
          ...input.intentAdmission,
          admissionDigest: forgedDigest
        })
      })
    }),
    Object.freeze({
      name: "nonmember execution binding",
      expectedCode: "function_nonmember",
      input: Object.freeze({
        ...input,
        executionBinding: Object.freeze({
          ...input.executionBinding,
          graphFunctionDigest: forgedDigest
        })
      })
    }),
    Object.freeze({
      name: "wrong start target",
      expectedCode: "target_invalid",
      input: Object.freeze({
        ...input,
        startIntent: Object.freeze({
          ...input.startIntent,
          target: Object.freeze({
            kind: "graph_function",
            handle: "graph-function://t270/nonmember"
          })
        })
      })
    }),
    Object.freeze({
      name: "unknown until value",
      expectedCode: "until_invalid",
      input: Object.freeze({
        ...input,
        startIntent: Object.freeze({
          ...input.startIntent,
          until: "unbounded"
        })
      })
    })
  ]);
  for (const mutation of cases) {
    const result = admitOneSurfaceExecution(mutation.input);
    assertT270Refusal(result, mutation.expectedCode);
  }
});

test("T-270 compiles unchanged canonical Consensus and stops at the named runtime gaps", async () => {
  assert.equal(canonicalConsensusDeclaration.readinessRefs.length, 0);
  assert.deepEqual(
    {
      ...consensusConditionalReadyDeclaration,
      readinessRefs: canonicalConsensusDeclaration.readinessRefs
    },
    canonicalConsensusDeclaration
  );
  assert.equal(
    stableSha256Digest(deriveConsensusModuleDeclaration()),
    stableSha256Digest(canonicalConsensusDeclaration)
  );
  const fixture = await consensusChain;
  const effectRefs = Object.freeze([
    ...new Set(
      ABG_CONSENSUS_GTL_MODULE.graphFunctions.flatMap(
        (graphFunction) => graphFunction.effects
      )
    )
  ].sort());
  const input = t270AdmissionInput(fixture, {
    admittedTenantConformanceManifest:
      admittedCapabilityManifest(effectRefs),
    inputValue: consensusSubjectValue()
  });
  assert.equal(
    input.executionBinding.graphFunctionId,
    CONSENSUS_GRAPH_FUNCTION_REF
  );

  const capabilityMissing = admitOneSurfaceExecution({
    ...input,
    admittedTenantConformanceManifest: null
  });
  assertT270Refusal(capabilityMissing, "capability_missing");

  const result = admitOneSurfaceExecution(input);
  assertT270Refusal(result, "runtime_failed");
  assert.match(result.message, /semantic_not_realized/u);
  assert(result.residualRefs.includes(
    "gap://abg/t270/admitted-runtime-authority-projection"
  ));
  assert(result.residualRefs.includes(
    "gap://abg/t270/admitted-locus-payload-value-projection"
  ));

  const authoritySet = compileProgramExecutionAuthoritySet({
    basis: input.catalogBasis,
    executionBinding: input.executionBinding,
    admittedTenantConformanceManifest:
      input.admittedTenantConformanceManifest
  });
  assertProgramExecutionAuthoritySet(authoritySet);
  assertContextsBelongToContainingSubjects(authoritySet);
  assert.equal(
    authoritySet.subjects[0].graphFunctionRef,
    CONSENSUS_GRAPH_FUNCTION_REF
  );
  assert(
    authoritySet.subjects.length > 1,
    "canonical Consensus must retain its module-contained workflow children"
  );
  assert(
    authoritySet.subjects.some(
      (subject) =>
        subject.graphFunctionRef ===
          CONSENSUS_REVIEW_ONE_PROFILE_GRAPH_FUNCTION_REF
    ),
    "the executable fan-out child must own its own authority subject"
  );
  const structuralFanOutSubject = authoritySet.subjects.find(
    (subject) =>
      subject.graphFunctionRef ===
        ABG_CONSENSUS_GTL_BODY.graphFunctions.reviewPanel.id
  );
  assert.notEqual(
    structuralFanOutSubject,
    undefined,
    "the structural fan-out wrapper must retain its own T-267 authority"
  );
  assert(
    structuralFanOutSubject.vectors.every(
      (vector) =>
        vector.source.sourceKind === "structural_hof_fan_out" &&
        vector.source.applicationKind === "fan_out" &&
        vector.loci.every(
          (locus) => locus.compiledExecutionContext === null
        )
    ),
    "the structural wrapper must not borrow its executable child's T-256 contexts"
  );
  assert(
    authoritySet.structuralHofRelations.some(
      (relation) =>
        relation.hostGraphFunctionRef ===
          ABG_CONSENSUS_GTL_BODY.graphFunctions.reviewPanel.id &&
        relation.childGraphFunctionRef ===
          CONSENSUS_REVIEW_ONE_PROFILE_GRAPH_FUNCTION_REF
    ),
    "the structural fan-out wrapper must retain its exact relation to the executable child"
  );
  for (const [owner, applicationKind, reachable] of [
    [
      ABG_CONSENSUS_GTL_BODY.graphFunctions.reducePanelFacts.id,
      "fan_in",
      ABG_CONSENSUS_GTL_BODY.graphFunctions.exactPanelFacts.id
    ],
    [
      ABG_CONSENSUS_GTL_BODY.graphFunctions.boundedRounds.id,
      "recurse",
      ABG_CONSENSUS_GTL_BODY.graphFunctions.round.id
    ]
  ]) {
    const applicationOwner = authoritySet.subjects.find(
      (subject) => subject.graphFunctionRef === owner
    );
    assert.notEqual(
      applicationOwner,
      undefined,
      `canonical authority must retain application owner ${owner}`
    );
    assert(
      applicationOwner.vectors.some(
        (vector) => vector.source.applicationKind === applicationKind
      ),
      `${owner} must preserve its ${applicationKind} T-267 authority`
    );
    assert(
      authoritySet.subjects.some(
        (subject) => subject.graphFunctionRef === reachable
      ),
      `canonical authority must retain application child ${reachable}`
    );
  }
  assert(
    authoritySet.subjects.every((subject) =>
      subject.vectors.every((vector) =>
        vector.admission.effectsPermitted === false
      )
    )
  );
  assert(
    authoritySet.subjects.flatMap((subject) => subject.vectors)
      .flatMap((vector) => vector.loci)
      .some((locus) => locus.compiledExecutionContext !== null),
    "canonical Consensus must compile at least one static T-256 locus context"
  );
});

test("T-270 generic execution authority contains no Consensus branch", () => {
  const sources = [
    "../../code/src/abg/m03/contracts/one_surface_execution_authority.ts",
    "../../code/src/abg/m03/runner/one_surface_execution_admission.ts"
  ];
  for (const source of sources) {
    assert.doesNotMatch(
      readFileSync(new URL(source, import.meta.url), "utf8"),
      /Consensus|consensus/u
    );
    assert.doesNotMatch(
      readFileSync(new URL(source, import.meta.url), "utf8"),
      /readiness:\/\/t270/u
    );
  }
});

function assertEvaluateNextRefusal(value, reasonRef) {
  assert.equal(value.kind, "one_surface_typed_refusal");
  assert.equal(value.functionKind, "evaluate_next");
  assert(value.reasonRefs.includes(reasonRef), JSON.stringify(value.reasonRefs));
}

test("T-280 AF-13 refuses changed selector authority and duplicate outcomes", async () => {
  const value = await chain;
  const changedPolicy = constructConstructionPriorityScheme({
    schemeRef: "priority-scheme://t280/scenario09/changed",
    sourcePolicyRef: "policy://t280/scenario09/changed",
    rules: []
  });
  assertEvaluateNextRefusal(
    deriveNextActionProjection({
      ...value.evaluateNextInput,
      authorityResult: value.evaluateNextResult,
      priorityScheme: changedPolicy
    }),
    "evaluate_next_result_outside_admitted_program"
  );
  assertEvaluateNextRefusal(
    deriveNextActionProjection({
      ...value.evaluateNextInput,
      authorityResult: value.evaluateNextResult,
      targetObligations: [Object.freeze({
        ...value.targetObligations[0],
        obligationRefs: Object.freeze([
          "obligation://t280/scenario09/changed"
        ])
      })]
    }),
    "evaluate_next_result_outside_admitted_program"
  );
  assertEvaluateNextRefusal(
    deriveNextActionProjection({
      ...value.evaluateNextInput,
      authorityResult: value.evaluateNextResult,
      invocationAuthority: Object.freeze({
        ref: "invocation-authority://t280/scenario09/changed",
        digest: stableSha256Digest({ invocation: "changed" })
      })
    }),
    "evaluate_next_result_outside_admitted_program"
  );
  assertEvaluateNextRefusal(
    deriveNextActionProjection({
      ...value.evaluateNextInput,
      authorityResult: value.evaluateNextResult,
      nextBasis: constructNextActionBasis({
        basisKind: value.evaluateNextInput.nextBasis.basisKind,
        causalRefs: value.evaluateNextInput.nextBasis.causalRefs.map((ref) => {
          if (ref === value.workspaceBinding.ref) {
            return "workspace-binding://t280/scenario09/changed";
          }
          if (ref === value.workspaceBinding.digest) {
            return stableSha256Digest({ workspace: "changed" });
          }
          return ref;
        })
      })
    }),
    "evaluate_next_result_outside_admitted_program"
  );
  assertEvaluateNextRefusal(
    deriveNextActionProjection({
      ...value.evaluateNextInput,
      authorityResult: value.evaluateNextResult,
      targetObligations: Object.freeze([
        value.targetObligations[0],
        value.targetObligations[0]
      ])
    }),
    "evaluate_next_selector_authority_invalid"
  );
  assertEvaluateNextRefusal(
    deriveNextActionProjection({
      ...value.evaluateNextInput,
      authorityResult: admittedAuthorityResult({
        source: value.source,
        program: value.program,
        stageIndex: 2,
        inputBasis: oneSurfaceEvaluateNextInputBasis({
          ...value.evaluateNextInput,
          targetObligations: Object.freeze([
            ...value.targetObligations,
            Object.freeze({
              targetOutcomeRef: "outcome://t280/scenario09/unbound",
              obligationRefs: Object.freeze([
                "obligation://t280/scenario09/unbound"
              ]),
              requiredEvidenceRefs: Object.freeze([
                "evidence://t280/scenario09/unbound"
              ])
            })
          ])
        }),
        decodedValue: value.evaluateNextResult.decodedValue
      }),
      targetObligations: Object.freeze([
        ...value.targetObligations,
        Object.freeze({
          targetOutcomeRef: "outcome://t280/scenario09/unbound",
          obligationRefs: Object.freeze([
            "obligation://t280/scenario09/unbound"
          ]),
          requiredEvidenceRefs: Object.freeze([
            "evidence://t280/scenario09/unbound"
          ])
        })
      ])
    }),
    "target_obligation_set_mismatch"
  );
  const alteredStages = [...value.program.stages];
  alteredStages[2] = Object.freeze({
    ...alteredStages[2],
    allowedConsequenceCatalog: Object.freeze({
      ...alteredStages[2].allowedConsequenceCatalog,
      rows: Object.freeze(alteredStages[2].allowedConsequenceCatalog.rows.map(
        (row, index) => index === 0
          ? Object.freeze({
              ...row,
              requiredAuthorityRefs: Object.freeze([
                ...row.requiredAuthorityRefs,
                "authority://t280/scenario09/altered-after-admission"
              ])
            })
          : row
      ))
    })
  });
  assertEvaluateNextRefusal(
    deriveNextActionProjection({
      ...value.evaluateNextInput,
      application: Object.freeze({
        ...value.program,
        stages: Object.freeze(alteredStages)
      }),
      authorityResult: value.evaluateNextResult
    }),
    "evaluate_next_result_outside_admitted_program"
  );
});

test("T-280 AF-13 canonicalizes unordered target-obligation sets", async () => {
  const value = await chain;
  const first = Object.freeze({
    ...value.targetObligations[0],
    obligationRefs: Object.freeze([
      "obligation://t280/scenario09/z",
      "obligation://t280/scenario09/a"
    ]),
    requiredEvidenceRefs: Object.freeze([
      "evidence://t280/scenario09/z",
      "evidence://t280/scenario09/a"
    ])
  });
  const second = Object.freeze({
    targetOutcomeRef: "outcome://t280/scenario09/second",
    obligationRefs: Object.freeze(["obligation://t280/scenario09/second"]),
    requiredEvidenceRefs: Object.freeze(["evidence://t280/scenario09/second"])
  });
  const forward = oneSurfaceEvaluateNextInputBasis({
    ...value.evaluateNextInput,
    targetObligations: Object.freeze([first, second])
  });
  const reversed = oneSurfaceEvaluateNextInputBasis({
    ...value.evaluateNextInput,
    targetObligations: Object.freeze([
      second,
      Object.freeze({
        ...first,
        obligationRefs: Object.freeze([...first.obligationRefs].reverse()),
        requiredEvidenceRefs: Object.freeze(
          [...first.requiredEvidenceRefs].reverse()
        )
      })
    ])
  });
  assert.equal(forward.inputDigest, reversed.inputDigest);
});

test("T-280 AF-14 returns typed refusal for changed workspace and source-binding authority", async () => {
  const value = await chain;
  const changedWorkspace = admitOneSurfaceConstructionIntent({
      ...value.intentAdmissionInput,
      workspaceBinding: Object.freeze({
        ref: "workspace-binding://t280/scenario09/changed",
        digest: stableSha256Digest({ workspace: "changed" })
      })
    });
  assert.equal(changedWorkspace.kind, "one_surface_construction_intent_refusal");
  assert.deepEqual(
    changedWorkspace.reasonRefs,
    ["construction_intent_selection_authority_mismatch"]
  );

  const originalTarget = value.nextAction.targetBindings[0];
  const mismatchedTarget = constructTargetObligationBinding({
    snapshotRef: originalTarget.snapshotRef,
    sourceBindingRef: "construction-binding://t280/scenario09/other",
    pressureRef: originalTarget.pressureRef,
    actionRef: originalTarget.actionRef,
    targetOutcomeRef: originalTarget.targetOutcomeRef,
    obligationRefs: originalTarget.obligationRefs,
    requiredEvidenceRefs: originalTarget.requiredEvidenceRefs
  });
  const changedBinding = admitOneSurfaceConstructionIntent({
      ...value.intentAdmissionInput,
      nextAction: Object.freeze({
        ...value.nextAction,
        targetBindings: Object.freeze([mismatchedTarget])
      })
    });
  assert.equal(changedBinding.kind, "one_surface_construction_intent_refusal");
  assert.deepEqual(
    changedBinding.reasonRefs,
    ["construction_intent_authority_invalid:NextActionProjection selected target binding differs"]
  );
});
