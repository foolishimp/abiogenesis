import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

import * as v from "valibot";

import {
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
  WORKSPACE_NATIVE_CONTRACT_SOURCES
} from "../../build/semantic/code/src/app/m04/workspace/operation_contracts.js";
import {
  deriveCanonicalNativeSchemaProjection
} from "../../build/semantic/code/src/shared/validation/canonical_native_schema_projector.js";

const CONTRACT_SHAPE_DIGEST =
  "sha256:9ab76163499e0831a3ff87f3dc1b5adba02c19d690b6a953651888f6fe9915b7";
const ONTOLOGY_DIGEST =
  "sha256:039c19d3b6639ebc0357b40d8f12a6e8340e55ba0f8ef2f41c1e8cab914f53f1";
const OPAQUE_RESOLVER_INTEGRATION = Object.freeze({
  status: "pending_projector_repair_integration",
  constraint: "consume_shared_opaque_resolver_without_local_copy"
});

const D = "sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

const resolvedSources = [
  ...Object.values(WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_create.clean),
  ...Object.values(WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_create.imported),
  ...Object.values(WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_open.open),
  ...Object.values(PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES.product_verify.verify),
  ...Object.values(PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES.product_resolve.resolve),
  PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES.product_install.install.result,
  PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES.product_install.install.refusal,
  ...Object.values(TOOLCHAIN_BINDING_NATIVE_CONTRACT_SOURCES.workspace_bind.bind),
  ...Object.values(RESULT_ASSESSMENT_NATIVE_CONTRACT_SOURCES.result_assess.assess),
  INSTALL_BOOTSTRAP_NATIVE_CONTRACT_SOURCES.product_materialize.context_bootstrap.refusal,
  INSTALL_BOOTSTRAP_NATIVE_CONTRACT_SOURCES.product_materialize.configuration.refusal
];

const gaps = [
  PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES.product_install.install.request,
  INSTALL_BOOTSTRAP_NATIVE_CONTRACT_SOURCES.product_materialize.context_bootstrap.request,
  INSTALL_BOOTSTRAP_NATIVE_CONTRACT_SOURCES.product_materialize.context_bootstrap.result,
  INSTALL_BOOTSTRAP_NATIVE_CONTRACT_SOURCES.product_materialize.configuration.request,
  INSTALL_BOOTSTRAP_NATIVE_CONTRACT_SOURCES.product_materialize.configuration.result
];

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
  assert.equal(resolvedSources.length, 26);
  assert.equal(gaps.length, 5);

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
    assert.equal(
      source.authority.contractShapeBasis.digest,
      CONTRACT_SHAPE_DIGEST
    );
    assert.equal(
      source.authority.contractShapeBasis.status,
      "candidate_integration_pin_pending_final_rebind"
    );
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

test("T-281 Slice 1 locators await the shared opaque resolver port", () => {
  for (const source of resolvedSources) {
    assert.equal(source.sourceLocator.memberPath.at(-1), "schema");
  }
  assert.deepEqual(OPAQUE_RESOLVER_INTEGRATION, {
    status: "pending_projector_repair_integration",
    constraint: "consume_shared_opaque_resolver_without_local_copy"
  });
});

test("T-281 Slice 1 resolved sources are canonically projectable", () => {
  for (const source of resolvedSources) {
    const projection = deriveCanonicalNativeSchemaProjection({
      schema: source.schema,
      schemaRef: source.identity.schemaId,
      schemaVersion: source.identity.schemaVersion,
      sourceLocator: source.sourceLocator,
      ...(source.authority.owner.family === "product_intake"
        ? { namedCheckRegistry: PRODUCT_INTAKE_NATIVE_CHECK_REGISTRY }
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
  assert.throws(() => v.parse(open.result.schema, {
    workspaceRef: "workspace:one",
    workspaceAuthorityBasisRef: "basis:one",
    workspaceAuthorityBasisDigest: D,
    readiness: "unknown",
    manifestRef: "manifest:one",
    manifestDigest: D,
    residualRefs: []
  }));
});

test("T-281 Slice 1 product intake rejects malformed and duplicate truth", () => {
  const verify = PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES.product_verify.verify;
  assert.throws(() => v.parse(verify.request.schema, {
    artifactRef: "artifact:one",
    artifactDigest: "sha256:bad",
    descriptorRef: "descriptor:one",
    descriptorDigest: D,
    contributionManifestRef: "contribution:one",
    contributionManifestDigest: D,
    resolvedLockRef: "lock:one",
    resolvedLockDigest: D,
    expectedContractRefs: []
  }));

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
  assert.throws(() => v.parse(resolve.request.schema, {
    requirements: [],
    candidates: []
  }));

  assert.equal(
    PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES.product_install.install.request.kind,
    "semantic_not_realized"
  );
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

test("T-281 Slice 1 materialization preserves exact unresolved slots", () => {
  const materialize =
    INSTALL_BOOTSTRAP_NATIVE_CONTRACT_SOURCES.product_materialize;
  for (const variant of ["context_bootstrap", "configuration"]) {
    assert.equal(materialize[variant].request.kind, "semantic_not_realized");
    assert.equal(materialize[variant].result.kind, "semantic_not_realized");
    assert.equal(materialize[variant].refusal.kind,
      "owner_native_operation_contract_source");
  }
  assert.throws(() => v.parse(materialize.context_bootstrap.refusal.schema, {
    code: "mutable_default_forbidden",
    message: "wrong variant",
    residualRefs: []
  }));
});

test("T-281 Slice 1 preserves Ontology and flags candidate-shape rebind", async () => {
  const design = await readFile(
    new URL("../../design/M04_PUBLIC_OPERATION_DEFINITION_FAMILY_BEHAVIOR_DESIGN.md", import.meta.url)
  );
  const ontology = await readFile(
    new URL("../../design/ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md", import.meta.url)
  );
  assert.notEqual(sha256(design), CONTRACT_SHAPE_DIGEST);
  assert.equal(sha256(ontology), ONTOLOGY_DIGEST);
});
