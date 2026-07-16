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

const DESIGN_DIGEST =
  "sha256:d0525534d9ea5ce274860c793fd27bab48d92635874f28444d07d622c08b8281";
const ONTOLOGY_DIGEST =
  "sha256:039c19d3b6639ebc0357b40d8f12a6e8340e55ba0f8ef2f41c1e8cab914f53f1";

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

async function resolvePrivateSource(source) {
  const locator = source.sourceLocator;
  const sourceRoot = new URL("../../build/semantic/", import.meta.url);
  const sourceModule = await import(new URL(locator.modulePath, sourceRoot).href);
  return locator.memberPath.reduce(
    (value, member) => Reflect.get(value, member),
    Reflect.get(sourceModule, locator.exportName)
  );
}

test("T-281 Slice 1 exposes exact frozen owner sources and honest gaps", () => {
  assert.equal(resolvedSources.length, 26);
  assert.equal(gaps.length, 5);

  const definitionKeys = new Set(
    [...resolvedSources, ...gaps].map((row) => {
      const subject = row.kind === "semantic_not_realized"
        ? row.definitionKey
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
    assert.equal(source.authority.lawBasis.digest, DESIGN_DIGEST);
    assert.equal(source.sourceLocator.kind, "private_source_module");
    assert.equal(source.sourceLocator.sourceRoot, "semantic_build");
    assert.equal(source.sourceLocator.memberPath.at(-1), "schema");
    assertDeepFrozen(source);
  }
  for (const gap of gaps) {
    assert.equal(gap.kind, "semantic_not_realized");
    assert.equal(gap.ownerAuthorityDigest, DESIGN_DIGEST);
    assert.ok(gap.evidenceRefs.length > 0);
    assertDeepFrozen(gap);
  }
});

test("T-281 Slice 1 private locators terminate at exact schema objects", async () => {
  for (const source of resolvedSources) {
    assert.equal(await resolvePrivateSource(source), source.schema);
  }
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

test("T-281 Slice 1 is based on the unchanged accepted design and Ontology", async () => {
  const design = await readFile(
    new URL("../../design/M04_PUBLIC_OPERATION_DEFINITION_FAMILY_BEHAVIOR_DESIGN.md", import.meta.url)
  );
  const ontology = await readFile(
    new URL("../../design/ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md", import.meta.url)
  );
  assert.equal(sha256(design), DESIGN_DIGEST);
  assert.equal(sha256(ontology), ONTOLOGY_DIGEST);
});
