import assert from "node:assert/strict";
import test from "node:test";

import {
  assertOneSurfaceAuthorityProgramBinding,
  bindOneSurfaceAuthorityProgramToAppliedProgram,
  compileOneSurfaceGtlProgramApplication,
  constructOneSurfaceAppliedProgramAdmission
} from "../../build/semantic/code/src/abg/m03/contracts/one_surface_program_compiler.js";
import {
  admitBoundWorkspaceCatalog
} from "../../build/semantic/code/src/abg/m03/contracts/runtime_catalog.js";
import {
  compileSelectedCatalogDirectProgram
} from "../../build/semantic/code/src/abg/m03/runner/one_surface_execution.js";
import {
  buildAbgSystemOneSurfaceProgram
} from "../../build/semantic/code/src/app/m04/public_contracts/abg_system_one_surface_program.js";
import {
  ABG_SYSTEM_SUNNY_GRAPH_FUNCTION_HANDLE,
  ABG_SYSTEM_SUNNY_INPUT_SCHEMA_REF,
  buildAbgSystemSunnyGraphFunctionModule
} from "../../build/semantic/code/src/app/m04/public_contracts/abg_system_sunny_graph_function.js";
import {
  constructGtlLibraryEntryDeclaration
} from "../../build/semantic/code/src/gtl/m02/index.js";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";
import {
  admittedTenantManifestFixture
} from "../fixtures/admitted_tenant_manifest.mjs";
import {
  scenario09OneSurfaceProgramFixture
} from "../fixtures/t280_scenario09_one_surface_fixture.mjs";

const ENTRY_REF = "catalog-entry://t270/applied-program/sunny";
const MODULE_REF = "gtl-module://t270/applied-program/sunny";

async function appliedAdmissionFixture(base, seed = "sunny") {
  const module = buildAbgSystemSunnyGraphFunctionModule();
  const graphFunction = module.graphFunctions[0];
  assert.notEqual(graphFunction, undefined);
  const declaration = constructGtlLibraryEntryDeclaration({
    declarationRef: `declaration://t270/applied-program/${seed}`,
    entryRef: ENTRY_REF,
    libraryScope: "system",
    entryKind: "graph_function",
    namespace: "t270.applied-program",
    ownerRef: "owner://t270/applied-program",
    version: "5.0.0",
    graphFunctionRef: graphFunction.id,
    interfaceRef: ABG_SYSTEM_SUNNY_INPUT_SCHEMA_REF,
    sourceContractRef: ABG_SYSTEM_SUNNY_INPUT_SCHEMA_REF,
    targetContractRef: ABG_SYSTEM_SUNNY_INPUT_SCHEMA_REF,
    authorityRefs: ["authority://t270/applied-program"],
    overlayRefs: [],
    provenanceRefs: ["provenance://t270/applied-program"],
    readinessRefs: ["readiness://t270/applied-program"],
    proofRefs: ["proof://t270/applied-program"],
    policyRefs: ["policy://t270/applied-program"],
    declarationSourceRefs: [MODULE_REF]
  });
  const admitted = admitBoundWorkspaceCatalog({
    kind: "bound_catalog_admission_batch",
    workspaceId: `workspace://t270/applied-program/${seed}`,
    bindingId: `binding://t270/applied-program/${seed}`,
    catalogId: `catalog://t270/applied-program/${seed}`,
    resolvedLockRef: `lock://t270/applied-program/${seed}`,
    systemDeclarations: [Object.freeze({
      kind: "runtime_library_entry",
      declaration,
      moduleRef: MODULE_REF,
      module
    })],
    orderedProductBatches: [],
    causationEventRefs: [`event://t270/applied-program/${seed}/catalog`],
    correlationId: `correlation://t270/applied-program/${seed}`
  }, () => {});
  assert.equal(admitted.accepted, true, JSON.stringify(admitted));
  assert.notEqual(admitted.basis, null);
  const binding = admitted.basis.executionBindings.find(
    (row) => row.entryRef === ENTRY_REF
  );
  assert.notEqual(binding, undefined);
  const manifest = admittedTenantManifestFixture({
    fixtureId: `t270-applied-program-${seed}`,
    capabilityContractId: "abg.contract.t270-applied-program",
    capabilityId: "capability://t270/applied-program",
    effectRef: "effect://t270/applied-program"
  });
  const runtimeIdentity = Object.freeze({
    workerId: "worker://t270/applied-program",
    backendId: "backend://t270/applied-program",
    buildId: "build://t270/applied-program",
    resolvedRuntimeRef: "runtime://t270/applied-program"
  });
  const resolvedPolicy = Object.freeze({
    resolvedPolicyBundleRef: "policy-bundle://t270/applied-program",
    defaultRegime: "F_D",
    dispatchRef: null,
    approvalSubjectRef: null
  });
  const standardPluginRefs = Object.freeze([]);
  const compiledExecution = compileSelectedCatalogDirectProgram({
    invocationAuthority: Object.freeze({
      capabilityGrants: Object.freeze([]),
      transportSteering: Object.freeze({
        steeringRef: "steering://t270/applied-program",
        steeringDigest: stableSha256Digest("t270-applied-steering"),
        provenanceRefs: Object.freeze([])
      })
    }),
    runtimeProfile: Object.freeze({
      profileDigest: stableSha256Digest({
        kind: "abg_runtime_system_profile",
        runtimeIdentity,
        resolvedPolicy,
        standardPluginRefs
      }),
      runtimeIdentity,
      resolvedPolicy,
      standardPluginRefs
    }),
    catalogBasis: admitted.basis,
    selectedExecutionBinding: binding,
    admittedTenantConformanceManifest: manifest
  });
  const compositionBasis = Object.freeze({
    kind: "one_surface_applied_gtl_program_composition_basis",
    baseProgram: Object.freeze({
      ref: base.admittedProgramRef,
      digest: base.admittedProgramDigest
    }),
    catalogBasis: Object.freeze({
      ref: admitted.basis.basisRef,
      digest: stableSha256Digest(admitted.basis)
    }),
    catalogRow: Object.freeze({
      ref: binding.entryRef,
      digest: stableSha256Digest(binding)
    }),
    catalogView: Object.freeze({
      ref: `catalog-view://t270/applied-program/${seed}`,
      digest: stableSha256Digest({ seed, view: [binding.entryRef] })
    }),
    declaration: Object.freeze({
      ref: binding.declarationRef,
      digest: binding.declarationDigest
    }),
    programMembers: Object.freeze([Object.freeze({
      entryRef: binding.entryRef,
      graphFunctionRef: binding.graphFunctionId,
      graphFunctionDigest: binding.graphFunctionDigest,
      moduleRef: binding.moduleRef,
      moduleDigest: binding.moduleDigest
    })])
  });
  const targetProgramDigest = stableSha256Digest(compositionBasis);
  const targetProgram = Object.freeze({
    ref:
      "gtl-program://abg/catalog-application/" +
      targetProgramDigest.slice("sha256:".length),
    digest: targetProgramDigest
  });
  const applicationRef =
    "declaration-application://t270/overlay/" +
    stableSha256Digest({ seed, targetProgram }).slice("sha256:".length);
  const applicationArtifact = Object.freeze({
    kind: "catalog_overlay_declaration_application",
    schemaVersion: 1,
    applicationRef,
    programBasis: compositionBasis,
    target: targetProgram
  });
  const admissionInput = Object.freeze({
    baseAuthorityProgram: base,
    applicationRef,
    applicationArtifact,
    compositionBasis,
    targetProgram,
    selectedExecution: Object.freeze({
      entryRef: binding.entryRef,
      executionBindingDigest: stableSha256Digest(binding)
    }),
    compiled: compiledExecution.compiled
  });
  return Object.freeze({
    admission: constructOneSurfaceAppliedProgramAdmission(admissionInput),
    admissionInput,
    binding,
    compiledExecution
  });
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

test("T-270 rebinds one sealed control authority to one exact applied program", async () => {
  const base = (await buildAbgSystemOneSurfaceProgram()).authorityProgram;
  const applicationCoordinate = coordinate(base);
  const applied = bindOneSurfaceAuthorityProgramToAppliedProgram({
    baseAuthorityProgram: base,
    applicationCoordinate
  });

  assert.doesNotThrow(() => assertOneSurfaceAuthorityProgramBinding(applied));
  assert.equal(applied.admittedProgramRef, applicationCoordinate.targetProgramRef);
  assert.equal(
    applied.admittedProgramDigest,
    applicationCoordinate.targetProgramDigest
  );
  assert.notEqual(applied.bindingRef, base.bindingRef);
  assert.notEqual(applied.bindingDigest, base.bindingDigest);
  assert.equal(base.appliedProgramApplication, null);
  assert.deepEqual(applied.appliedProgramApplication, {
    kind: "one_surface_applied_program_application_provenance",
    applicationRef: applicationCoordinate.applicationRef,
    applicationArtifactDigest:
      applicationCoordinate.applicationArtifactDigest
  });
  assert.strictEqual(applied.recursePlan, base.recursePlan);
  assert.deepEqual(applied.refinementApplications, []);
  assert.deepEqual(
    applied.stages.map((stage) => stage.functionKind),
    ["synthesize_model", "eval_gap", "evaluate_next", "evaluate_action"]
  );
  applied.stages.forEach((stage, index) => {
    assert.equal(stage.admittedProgramRef, applicationCoordinate.targetProgramRef);
    assert.equal(
      stage.admittedProgramDigest,
      applicationCoordinate.targetProgramDigest
    );
    assert.notEqual(stage.programMembershipDigest, base.stages[index].programMembershipDigest);
    assert.strictEqual(stage.plan, base.stages[index].plan);
    assert.strictEqual(stage.traversalContracts, base.stages[index].traversalContracts);
  });
  assert.equal(
    applied.af14Admission.evaluateNextAuthorityRef,
    applied.stages[2].authorityRef
  );
  assert.equal(
    applied.af15Slot.af14AdmissionRelationRef,
    applied.af14Admission.relationRef
  );

  const repeated = bindOneSurfaceAuthorityProgramToAppliedProgram({
    baseAuthorityProgram: base,
    applicationCoordinate
  });
  assert.deepEqual(repeated, applied);
  assert.throws(
    () => bindOneSurfaceAuthorityProgramToAppliedProgram({
      baseAuthorityProgram: applied,
      applicationCoordinate: coordinate(applied, "second-application")
    }),
    /already derived from one AF-10 application/u
  );
});

test("T-270 applied-program coordinate mutations fail before rebinding", async () => {
  const base = (await buildAbgSystemOneSurfaceProgram()).authorityProgram;
  const canonical = coordinate(base);
  const otherDigest = stableSha256Digest("t270-other-coordinate");
  const cases = [
    {
      label: "base ref",
      value: { ...canonical, baseProgramRef: "program://t270/not-base" },
      expected: /base coordinate differs/u
    },
    {
      label: "base digest",
      value: { ...canonical, baseProgramDigest: otherDigest },
      expected: /base coordinate differs/u
    },
    {
      label: "target digest grammar",
      value: { ...canonical, targetProgramDigest: "sha256:not-a-digest" },
      expected: /targetProgramDigest must be a sha256 digest/u
    },
    {
      label: "target ref",
      value: { ...canonical, targetProgramRef: "gtl-program://t270/other" },
      expected: /target program ref and digest differ/u
    },
    {
      label: "target identity",
      value: {
        ...canonical,
        targetProgramRef: base.admittedProgramRef,
        targetProgramDigest: base.admittedProgramDigest
      },
      expected: /target must be distinct/u
    },
    {
      label: "application ref",
      value: { ...canonical, applicationRef: "" },
      expected: /applicationRef must be non-empty/u
    },
    {
      label: "application artifact digest grammar",
      value: { ...canonical, applicationArtifactDigest: "not-a-digest" },
      expected: /applicationArtifactDigest must be a sha256 digest/u
    },
    {
      label: "application identity collision",
      value: {
        ...canonical,
        applicationRef: canonical.targetProgramRef
      },
      expected: /application ref is not a program identity/u
    },
    {
      label: "extra authority",
      value: { ...canonical, hiddenSelectorRef: "selector://not-admitted" },
      expected: /coordinate shape differs/u
    }
  ];
  for (const mutation of cases) {
    assert.throws(
      () => bindOneSurfaceAuthorityProgramToAppliedProgram({
        baseAuthorityProgram: base,
        applicationCoordinate: mutation.value
      }),
      mutation.expected,
      mutation.label
    );
  }
  assert.throws(
    () => bindOneSurfaceAuthorityProgramToAppliedProgram({
      baseAuthorityProgram: Object.freeze({
        ...base,
        bindingDigest: otherDigest
      }),
      applicationCoordinate: canonical
    }),
    /authority program seal differs/u
  );
  const applied = bindOneSurfaceAuthorityProgramToAppliedProgram({
    baseAuthorityProgram: base,
    applicationCoordinate: canonical
  });
  assert.throws(
    () => assertOneSurfaceAuthorityProgramBinding(Object.freeze({
      ...applied,
      appliedProgramApplication: Object.freeze({
        ...applied.appliedProgramApplication,
        applicationArtifactDigest: otherDigest
      })
    })),
    /authority program seal differs/u
  );
});

test("T-270 refuses to relabel published refinement applications", async () => {
  const fixture = scenario09OneSurfaceProgramFixture({
    includeRefinementBoundary: true
  });
  const compilation = await compileOneSurfaceGtlProgramApplication({
    gtlProgram: fixture.gtlProgram,
    stageAuthorities: stageAuthorities(fixture),
    recursePlan: fixture.recursePlan
  });
  assert.notEqual(compilation.authorityProgram, null);
  assert.equal(compilation.authorityProgram.refinementApplications.length, 1);
  assert.throws(
    () => bindOneSurfaceAuthorityProgramToAppliedProgram({
      baseAuthorityProgram: compilation.authorityProgram,
      applicationCoordinate: coordinate(compilation.authorityProgram)
    }),
    /published refinement applications cannot be rebound/u
  );
});
