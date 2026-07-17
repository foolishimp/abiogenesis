import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

import * as v from "valibot";

import {
  INSTALL_BOOTSTRAP_NATIVE_CHECK_REGISTRY,
  INSTALL_BOOTSTRAP_NATIVE_CONTRACT_SOURCES
} from "../../build/semantic/code/src/app/m04/install_bootstrap/operation_contracts.js";
import {
  PRODUCT_INTAKE_NATIVE_CHECK_REGISTRY,
  PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES
} from "../../build/semantic/code/src/app/m04/product_intake/operation_contracts.js";
import {
  RESULT_ASSESSMENT_SEMANTIC_TRACE,
  RESULT_ASSESSMENT_NATIVE_CONTRACT_SOURCES
} from "../../build/semantic/code/src/app/m04/result_assessment/operation_contracts.js";
import {
  TOOLCHAIN_BINDING_NATIVE_CONTRACT_SOURCES
} from "../../build/semantic/code/src/app/m04/toolchain_binding/operation_contracts.js";
import {
  WORKSPACE_NATIVE_CHECK_REGISTRY,
  WORKSPACE_NATIVE_CONTRACT_SOURCES
} from "../../build/semantic/code/src/app/m04/workspace/operation_contracts.js";
import {
  deriveCanonicalNativeSchemaProjection,
  resolveSemanticBuildNativeSchemaSource
} from "../../build/semantic/code/src/shared/validation/canonical_native_schema_projector.js";

const ONTOLOGY_DIGEST =
  "sha256:bcbacd4a4b4dd3b5b6db2a3ad281c92bf76a7a889da38562d5b6301e85764615";
const D = "sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

const resolvedSources = [
  ...Object.values(WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_create.clean),
  ...Object.values(WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_create.imported),
  ...Object.values(WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_open.open),
  ...Object.values(PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES.product_verify.verify),
  ...Object.values(PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES.product_resolve.resolve),
  ...Object.values(PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES.product_install.install),
  ...Object.values(TOOLCHAIN_BINDING_NATIVE_CONTRACT_SOURCES.workspace_bind.bind),
  ...Object.values(RESULT_ASSESSMENT_NATIVE_CONTRACT_SOURCES.result_assess.assess),
  ...Object.values(
    INSTALL_BOOTSTRAP_NATIVE_CONTRACT_SOURCES.product_materialize.context_bootstrap
  ),
  ...Object.values(
    INSTALL_BOOTSTRAP_NATIVE_CONTRACT_SOURCES.product_materialize.configuration
  )
];

const gaps = [];

const EXPECTED_SEMANTIC_OWNER_REFS = Object.freeze({
  "abg.operation.workspace.create":
    "specification/requirements/product/REQ-P-INSTALL.md#REQ-P-INSTALL-059",
  "abg.operation.workspace.open":
    "specification/requirements/product/REQ-P-INSTALL.md#REQ-P-INSTALL-060",
  "abg.operation.product.verify":
    "specification/requirements/product/REQ-P-INSTALL.md#REQ-P-INSTALL-043..045",
  "abg.operation.product.resolve":
    "specification/requirements/product/REQ-P-CATALOG.md#REQ-P-CATALOG-010..013",
  "abg.operation.product.install":
    "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-057",
  "abg.operation.workspace.bind":
    "specification/requirements/product/REQ-P-INSTALL.md#REQ-P-INSTALL-049..055",
  "abg.operation.result.assess":
    "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-034"
});

function expectedSemanticOwnerRef(operationId, variant) {
  if (operationId === "abg.operation.product.materialize") {
    return variant === "context_bootstrap"
      ? "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-056"
      : "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-058";
  }
  return EXPECTED_SEMANTIC_OWNER_REFS[operationId];
}

function sha256(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function assertDeepFrozen(value, visited = new WeakSet()) {
  if (typeof value !== "object" || value === null || visited.has(value)) {
    return;
  }
  visited.add(value);
  assert.equal(Object.isFrozen(value), true);
  for (const member of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, member);
    if (descriptor && "value" in descriptor) {
      assertDeepFrozen(descriptor.value, visited);
    }
  }
}

test("T-281 Slice 1 exposes exact frozen owner sources and honest gaps", () => {
  assert.equal(resolvedSources.length, 31);
  assert.equal(gaps.length, 0);

  const definitionKeys = new Set(
    [...resolvedSources, ...gaps].map((row) => {
      const subject = row.kind === "semantic_not_realized"
        ? row.coordinate.definitionKey
        : row.authority.subject;
      return `${subject.operationId}(${subject.variant})`;
    })
  );
  assert.deepEqual([...definitionKeys].sort(), [
    "abg.operation.product.install(install)",
    "abg.operation.product.materialize(configuration)",
    "abg.operation.product.materialize(context_bootstrap)",
    "abg.operation.product.resolve(resolve)",
    "abg.operation.product.verify(verify)",
    "abg.operation.result.assess(assess)",
    "abg.operation.workspace.bind(bind)",
    "abg.operation.workspace.create(clean)",
    "abg.operation.workspace.create(imported)",
    "abg.operation.workspace.open(open)"
  ]);

  for (const source of resolvedSources) {
    assert.equal(source.kind, "owner_native_operation_contract_source");
    assert.equal("contractShapeBasis" in source.authority, false);
    assert.notEqual(
      source.authority.semanticOwnerBasis.ref,
      "design://abg/m04/public-operation-definition-family"
    );
    assert.equal(
      source.authority.semanticOwnerBasis.ref,
      expectedSemanticOwnerRef(
        source.authority.subject.operationId,
        source.authority.subject.variant
      )
    );
    assert.equal(source.sourceLocator.kind, "private_source_module");
    assert.equal(source.sourceLocator.sourceRoot, "semantic_build");
    assert.equal(source.sourceLocator.memberPath.at(-1), "schema");
    assertDeepFrozen(source);
  }
  for (const gap of gaps) {
    assert.equal(gap.kind, "semantic_not_realized");
    assert.notEqual(
      gap.ownerAuthorityRef,
      "design://abg/m04/public-operation-definition-family");
    assert.equal(
      gap.ownerAuthorityRef,
      expectedSemanticOwnerRef(
        gap.coordinate.definitionKey.operationId,
        gap.coordinate.definitionKey.variant
      )
    );
    assert.equal(
      gap.coordinate.slot === "request" || gap.coordinate.slot === "result",
      true
    );
    assert.equal(gap.ownerTicket, null);
    assert.ok(gap.evidenceRefs.length > 0);
    assertDeepFrozen(gap);
  }
});

test("T-281 Slice 1 locators are eligible for shared opaque resolution", () => {
  for (const source of resolvedSources) {
    assert.equal(source.sourceLocator.memberPath.at(-1), "schema");
  }
});

test("T-281 Slice 1 resolved sources are canonically projectable", async () => {
  for (const source of resolvedSources) {
    const resolvedSource = await resolveSemanticBuildNativeSchemaSource(source);
    const projection = deriveCanonicalNativeSchemaProjection({
      source: resolvedSource,
      schemaRef: source.identity.schemaId,
      schemaVersion: source.identity.schemaVersion,
      ...(source.authority.owner.family === "product_intake"
      ? { namedCheckRegistry: PRODUCT_INTAKE_NATIVE_CHECK_REGISTRY }
      : source.authority.owner.family === "workspace"
        ? { namedCheckRegistry: WORKSPACE_NATIVE_CHECK_REGISTRY }
        : source.authority.owner.family === "install_bootstrap"
          ? { namedCheckRegistry: INSTALL_BOOTSTRAP_NATIVE_CHECK_REGISTRY }
        : {})
    });
    assert.deepEqual(projection.witness.sourceLocator, source.sourceLocator);
    assert.match(projection.witness.projectionDigest, /^sha256:[0-9a-f]{64}$/u);
  }
});

test("T-281 Slice 1 traces result assessment to AF-19 and policy law", () => {
  assert.equal(
    RESULT_ASSESSMENT_SEMANTIC_TRACE.semanticOwnerBasis.ref,
    "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-034"
  );
  assert.equal(
    RESULT_ASSESSMENT_SEMANTIC_TRACE.ontologyFunction.ref.endsWith("#AF-19"),
    true
  );
  assert.equal(
    RESULT_ASSESSMENT_SEMANTIC_TRACE.ontologyFunction.digest,
    ONTOLOGY_DIGEST
  );
  assert.equal(
    RESULT_ASSESSMENT_SEMANTIC_TRACE.legacyCarrierEquivalence,
    "not_claimed"
  );
  assertDeepFrozen(RESULT_ASSESSMENT_SEMANTIC_TRACE);
});

test("T-281 Slice 1 workspace contracts are strict and variant exact", () => {
  const clean = WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_create.clean;
  assert.deepEqual(v.parse(clean.request.schema, {
    targetRoot: "/tmp/abg-workspace",
    createPolicy: "clean"
  }).createPolicy, "clean");
  assert.throws(() => v.parse(clean.request.schema, {
    targetRoot: "/tmp/abg-workspace",
    createPolicy: "clean",
    importAuthorityRef: "authority:unexpected"
  }));
  assert.deepEqual(v.parse(clean.result.schema, {
    workspaceRef: "workspace:one",
    creationManifestRef: "manifest:one",
    provenanceRefs: ["evidence:one"]
  }).provenanceRefs, ["evidence:one"]);

  const imported = WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_create.imported;
  assert.throws(() => v.parse(imported.request.schema, {
    targetRoot: "/tmp/abg-workspace",
    createPolicy: "clean",
    importAuthorityRef: "authority:import"
  }));
  assert.equal(v.parse(imported.request.schema, {
    targetRoot: "/tmp/abg-workspace",
    createPolicy: "clean",
    importAuthorityRef: "authority:import",
    importAuthorityDigest: D
  }).importAuthorityDigest, D);

  const open = WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_open.open;
  const openReadyBase = {
    workspaceRef: "workspace:one",
    workspaceAuthorityBasisRef: "basis:one",
    workspaceAuthorityBasisDigest: D,
    authorityMode: "clean_no_project_authority",
    configurationRefs: ["configuration:one"],
    configurationDigests: [D]
  };
  assert.equal(v.parse(open.result.schema, {
    ...openReadyBase,
    readiness: "ready",
    selectedBindingRef: "binding:one",
    selectedBindingDigest: D,
    residualRefs: []
  }).selectedBindingRef, "binding:one");
  assert.equal(v.parse(open.result.schema, {
    ...openReadyBase,
    readiness: "unbound",
    selectedBindingRef: null,
    selectedBindingDigest: null,
    residualRefs: []
  }).selectedBindingRef, null);
  for (const readiness of ["stale", "malformed", "incompatible"]) {
    assert.equal(v.parse(open.result.schema, {
      ...openReadyBase,
      readiness,
      observedBindingRef: null,
      observedBindingDigest: null,
      residualRefs: [`residual:${readiness}`]
    }).readiness, readiness);
  }
  assert.throws(() => v.parse(open.result.schema, {
    ...openReadyBase,
    readiness: "ready",
    selectedBindingRef: "binding:one",
    selectedBindingDigest: null,
    residualRefs: []
  }));
  assert.throws(() => v.parse(open.result.schema, {
    ...openReadyBase,
    readiness: "stale",
    observedBindingRef: "binding:one",
    observedBindingDigest: null,
    residualRefs: ["residual:stale"]
  }));
  assert.throws(() => v.parse(open.result.schema, {
    ...openReadyBase,
    readiness: "stale",
    observedBindingRef: null,
    observedBindingDigest: null,
    residualRefs: []
  }));
  assert.throws(() => v.parse(open.result.schema, {
    ...openReadyBase,
    configurationDigests: [],
    readiness: "unbound",
    selectedBindingRef: null,
    selectedBindingDigest: null,
    residualRefs: []
  }), /matching cardinality/u);
  for (const code of [
    "invalid_target",
    "workspace_missing",
    "authority_basis_mismatch"
  ]) {
    assert.equal(v.parse(open.refusal.schema, {
      code,
      message: `${code} workspace`,
      residualRefs: []
    }).code, code);
  }
  assert.throws(() => v.parse(open.refusal.schema, {
    code: "stale",
    message: "stale belongs to the typed readiness projection",
    residualRefs: []
  }));
});

test("T-281 Slice 1 product intake rejects malformed and duplicate truth", () => {
  const verify = PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES.product_verify.verify;
  assert.throws(() => v.parse(verify.request.schema, {
    artifactRef: "artifact:one",
    artifactDigest: "sha256:bad",
    productContentDigest: D,
    descriptorRef: "descriptor:one",
    descriptorDigest: D,
    contributionManifestRef: "contribution:one",
    contributionManifestDigest: D,
    resolvedLockRef: "lock:one",
    resolvedLockDigest: D,
    expectedContractRefs: []
  }));
  const verifyResultBase = {
    verifiedArtifactRef: "artifact:verified",
    verifiedArtifactDigest: D,
    productContentDigest: D,
    descriptorRef: "descriptor:one",
    descriptorDigest: D,
    contributionManifestRef: "contribution:one",
    contributionManifestDigest: D,
    resolvedLockRef: "lock:one",
    resolvedLockDigest: D,
    checkedContractRefs: [],
    residualRefs: [],
    provenanceRefs: ["evidence:verification"]
  };
  for (const verificationDisposition of ["verified", "installed_unbound"]) {
    assert.equal(v.parse(verify.result.schema, {
      ...verifyResultBase,
      verificationDisposition
    }).verificationDisposition, verificationDisposition);
  }

  const resolve = PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES.product_resolve.resolve;
  const requirement = {
    productId: "abiogenesis",
    versionConstraint: "^5.0.0",
    requiredContractRefs: [],
    requiredCapabilityRefs: []
  };
  assert.throws(() => v.parse(resolve.request.schema, {
    requirements: [requirement, requirement],
    candidates: [{
      productId: "abiogenesis",
      version: "5.0.0",
      contractRefs: [],
      capabilityRefs: []
    }]
  }));
  const firstCoordinate = {
    productId: "abiogenesis",
    version: "5.0.0-rc.1",
    contractRefs: [],
    capabilityRefs: []
  };
  assert.equal(v.parse(resolve.request.schema, {
    requirements: [requirement],
    candidates: [
      firstCoordinate,
      { ...firstCoordinate, version: "5.0.0-rc.2" }
    ]
  }).candidates.length, 2);
  assert.throws(() => v.parse(resolve.request.schema, {
    requirements: [requirement],
    candidates: [firstCoordinate, firstCoordinate]
  }));
  assert.equal(v.parse(resolve.request.schema, {
    requirements: [requirement],
    candidates: [
      firstCoordinate,
      { ...firstCoordinate, contractRefs: ["contract:conflicting"] }
    ]
  }).candidates.length, 2);
  assert.throws(() => v.parse(resolve.request.schema, {
    requirements: [],
    candidates: []
  }));

  const resolveResultBase = {
    resolvedLockRef: "lock:one",
    resolvedLockDigest: D,
    selectedDependencyGraph: [],
    residualRefs: [],
    provenanceRefs: []
  };
  assert.throws(() => v.parse(resolve.result.schema, {
    ...resolveResultBase,
    selectedProducts: [
      {
        productIdentity: "abiogenesis",
        selectedCoordinate: firstCoordinate,
        satisfiedRequirementRefs: ["requirement:abg"]
      },
      {
        productIdentity: "abiogenesis",
        selectedCoordinate: { ...firstCoordinate, version: "5.0.0-rc.2" },
        satisfiedRequirementRefs: ["requirement:abg"]
      }
    ]
  }), /duplicate selected product identity/u);
  assert.equal(v.parse(resolve.result.schema, {
    ...resolveResultBase,
    selectedProducts: [
      {
        productIdentity: "abiogenesis",
        selectedCoordinate: firstCoordinate,
        satisfiedRequirementRefs: ["requirement:abg"]
      },
      {
        productIdentity: "odd_glc",
        selectedCoordinate: {
          ...firstCoordinate,
          productId: "odd_glc",
          version: "1.0.0"
        },
        satisfiedRequirementRefs: ["requirement:glc"]
      }
    ]
  }).selectedProducts.length, 2);
  assert.throws(() => v.parse(resolve.result.schema, {
    ...resolveResultBase,
    selectedProducts: [{
      productIdentity: "odd_glc",
      selectedCoordinate: firstCoordinate,
      satisfiedRequirementRefs: ["requirement:glc"]
    }]
  }), /must match its product identity/u);

  for (const code of [
    "artifact_invalid",
    "content_mismatch",
    "identity_mismatch",
    "descriptor_mismatch",
    "contribution_mismatch",
    "lock_mismatch",
    "unresolved_dependency",
    "incompatible_dependency",
    "unsupported_contract",
    "installed_state_missing",
    "installed_state_stale"
  ]) {
    assert.equal(v.parse(verify.refusal.schema, {
      code,
      message: `${code} verification refusal`,
      residualRefs: []
    }).code, code);
  }
  assert.throws(() => v.parse(verify.refusal.schema, {
    code: "digest_mismatch",
    message: "collapsed content mismatch",
    residualRefs: []
  }));

  const install = PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES.product_install.install;
  const installRequest = {
    verifiedArtifactRef: "artifact:verified",
    verifiedArtifactDigest: D,
    productContentDigest: D,
    productDescriptorRef: "descriptor:one",
    productDescriptorDigest: D,
    contributionManifestRef: "contribution:one",
    contributionManifestDigest: D,
    resolvedLockRef: "lock:one",
    resolvedLockDigest: D,
    targetRoot: "/tmp/abg-products/abiogenesis/5.0.0",
    installPolicy: "immutable_idempotent"
  };
  assert.equal(
    v.parse(install.request.schema, installRequest).installPolicy,
    "immutable_idempotent"
  );
  assert.throws(() => v.parse(install.request.schema, {
    ...installRequest,
    targetRoot: "relative/products"
  }));
  assert.throws(() => v.parse(install.request.schema, {
    ...installRequest,
    installPolicy: "overwrite"
  }));
  assert.throws(() => v.parse(install.request.schema, {
    ...installRequest,
    workspaceBindingRef: "binding:not-install-authority"
  }));
  const installResult = {
    installedProductRef: "installed:one",
    installedProductDigest: D,
    installManifestRef: "manifest:install",
    installManifestDigest: D,
    installerManifestRef: "manifest:installer",
    installerManifestDigest: D,
    verificationDisposition: "verified",
    materializationDisposition: "materialized",
    selectedDependencyGraph: [],
    provenanceRefs: ["evidence:one"]
  };
  assert.equal(
    v.parse(install.result.schema, installResult).materializationDisposition,
    "materialized"
  );
  assert.equal(v.parse(install.result.schema, {
    ...installResult,
    materializationDisposition: "idempotent"
  }).materializationDisposition, "idempotent");
  assert.throws(() => v.parse(install.result.schema, {
    ...installResult,
    verificationDisposition: "failed"
  }));
  for (const code of [
    "verification_failed",
    "invalid_target",
    "identity_conflict",
    "content_conflict",
    "descriptor_conflict",
    "contribution_conflict",
    "lock_conflict",
    "unsupported_contract",
    "filesystem_failure"
  ]) {
    assert.equal(v.parse(install.refusal.schema, {
      code,
      message: `${code} install refusal`,
      residualRefs: []
    }).code, code);
  }
});

test("T-281 Slice 1 binding and assessment enforce closed typed domains", () => {
  const binding = TOOLCHAIN_BINDING_NATIVE_CONTRACT_SOURCES.workspace_bind.bind;
  const bindingRequest = {
    workspaceAuthorityRef: "workspace-authority:one",
    workspaceAuthorityDigest: D,
    installedSet: [{ ref: "installed:abg", digest: D }],
    resolvedLockRef: "lock:one",
    resolvedLockDigest: D,
    declaredRoots: ["/tmp/abg-events", "/tmp/abg-runtime"]
  };
  assert.equal(v.parse(binding.request.schema, bindingRequest).declaredRoots.length, 2);
  assert.throws(() => v.parse(binding.request.schema, {
    ...bindingRequest,
    declaredRoots: ["/tmp/abg-events", "/tmp/abg-events"]
  }));
  assert.throws(() => v.parse(binding.request.schema, {
    ...bindingRequest,
    declaredRoots: ["relative/root"]
  }));

  const assessment =
    RESULT_ASSESSMENT_NATIVE_CONTRACT_SOURCES.result_assess.assess;
  assert.equal(v.parse(assessment.request.schema, {
    runtimeResultRef: "result:one",
    runtimeResultDigest: D,
    assessmentContractRef: "contract:assessment",
    assessmentContractDigest: D,
    assessment: { accepted: true },
    evidenceRefs: ["evidence:one"]
  }).runtimeResultRef, "result:one");
  assert.throws(() => v.parse(assessment.result.schema, {
    assessmentRef: "assessment:one",
    admittedDisposition: "retry",
    residualRefs: [],
    evidenceRefs: []
  }));
  assert.equal(v.parse(assessment.nonterminal.schema, {
    disposition: "retry",
    residualRefs: ["residual:one"],
    evidenceRefs: []
  }).disposition, "retry");
});

test("T-281 Slice 1 materialization contracts are strict and variant exact", () => {
  const materialize =
    INSTALL_BOOTSTRAP_NATIVE_CONTRACT_SOURCES.product_materialize;
  for (const variant of ["context_bootstrap", "configuration"]) {
    assert.equal(materialize[variant].request.kind,
      "owner_native_operation_contract_source");
    assert.equal(materialize[variant].result.kind,
      "owner_native_operation_contract_source");
    assert.equal(materialize[variant].refusal.kind,
      "owner_native_operation_contract_source");
  }

  const contextRequest = {
    targetWorkspaceRef: "workspace:one",
    targetWorkspaceDigest: D,
    selectedBindingRef: "binding:one",
    selectedBindingDigest: D,
    declaredContextInputs: {
      contractRef: "contract:context-inputs",
      contractDigest: D,
      value: {
        initializeAiWorkspace: true,
        instructionSurfaces: ["AGENTS.md", "CLAUDE.md"]
      }
    }
  };
  assert.equal(v.parse(
    materialize.context_bootstrap.request.schema,
    contextRequest
  ).selectedBindingRef, "binding:one");
  assert.throws(() => v.parse(
    materialize.context_bootstrap.request.schema,
    {
      ...contextRequest,
      declaredContextInputs: {
        ...contextRequest.declaredContextInputs,
        value: 1n
      }
    }
  ));
  assert.throws(() => v.parse(
    materialize.context_bootstrap.request.schema,
    { ...contextRequest, packageSourceRoot: "/tmp/mutable-source" }
  ));

  const contextResult = {
    affectedWorkspaceRef: "workspace:one",
    affectedWorkspaceDigest: D,
    bootstrapAssetRef: "asset:context-bootstrap",
    bootstrapAssetDigest: D,
    materializationManifestRef: "manifest:context-bootstrap",
    materializationManifestDigest: D,
    rows: [{
      surfaceRef: "surface:agents",
      surfaceDigest: D,
      disposition: "preserved",
      evidenceRefs: ["evidence:agents"]
    }],
    residualRefs: [],
    provenanceRefs: ["evidence:context-bootstrap"]
  };
  assert.equal(v.parse(
    materialize.context_bootstrap.result.schema,
    contextResult
  ).rows[0].disposition, "preserved");
  assert.throws(() => v.parse(
    materialize.context_bootstrap.result.schema,
    { ...contextResult, rows: [] }
  ));
  assert.throws(() => v.parse(
    materialize.context_bootstrap.result.schema,
    {
      ...contextResult,
      rows: [{ ...contextResult.rows[0], disposition: "overwritten" }]
    }
  ));
  assert.throws(() => v.parse(
    materialize.context_bootstrap.result.schema,
    {
      ...contextResult,
      rows: [
        contextResult.rows[0],
        { ...contextResult.rows[0], disposition: "refused" }
      ]
    }
  ));

  const configurationRequest = {
    configurationContractRef: "contract:configuration",
    configurationContractDigest: D,
    selectedBindingRef: "binding:one",
    selectedBindingDigest: D,
    declaredInputs: {
      contractRef: "contract:configuration-inputs",
      contractDigest: D,
      value: { profile: "local" }
    }
  };
  assert.equal(v.parse(
    materialize.configuration.request.schema,
    configurationRequest
  ).configurationContractRef, "contract:configuration");
  assert.throws(() => v.parse(
    materialize.configuration.request.schema,
    { ...configurationRequest, mutableSourceDefault: true }
  ));
  assert.throws(() => v.parse(
    materialize.configuration.request.schema,
    {
      ...configurationRequest,
      declaredInputs: {
        ...configurationRequest.declaredInputs,
        contractDigest: "sha256:bad"
      }
    }
  ));

  const configurationResult = {
    affectedWorkspaceRef: "workspace:one",
    affectedWorkspaceDigest: D,
    configurationSubjectRef: "configuration:one",
    configurationSubjectDigest: D,
    configurationContentRef: "content:configuration-one",
    configurationContentDigest: D,
    materializationManifestRef: "manifest:configuration-one",
    materializationManifestDigest: D,
    validationDisposition: "validated",
    residualRefs: [],
    provenanceRefs: ["evidence:configuration"]
  };
  assert.equal(v.parse(
    materialize.configuration.result.schema,
    configurationResult
  ).validationDisposition, "validated");
  assert.throws(() => v.parse(
    materialize.configuration.result.schema,
    { ...configurationResult, validationDisposition: "unchecked" }
  ));
  assert.throws(() => v.parse(
    materialize.configuration.result.schema,
    { ...configurationResult, configurationContentDigest: "sha256:bad" }
  ));

  assert.throws(() => v.parse(materialize.context_bootstrap.refusal.schema, {
    code: "mutable_default_forbidden",
    message: "wrong variant",
    residualRefs: []
  }));
});

test("T-281 Slice 1 preserves the current Ontology basis", async () => {
  const ontology = await readFile(
    new URL("../../design/ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md", import.meta.url)
  );
  assert.equal(sha256(ontology), ONTOLOGY_DIGEST);
});
