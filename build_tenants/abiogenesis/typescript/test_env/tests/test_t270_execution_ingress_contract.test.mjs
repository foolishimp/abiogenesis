import assert from "node:assert/strict";
import test from "node:test";

import {
  admitRunInvokeExecutionIngress,
  assertAdmittedRunInvokeExecutionIngress,
  T270_RUNTIME_COMPATIBILITY_GAP
} from "../../build/semantic/code/src/abg/m03/contracts/one_surface_execution_ingress.js";
import {
  constructRuntimeSchemaAdmissionCapabilityBasis
} from "../../build/semantic/code/src/abg/m03/contracts/runtime_schema_admission.js";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";

const WORKSPACE_BINDING_REF = "workspace-binding://t270/contract";
const WORKSPACE_BINDING_DIGEST = stableSha256Digest({
  workspace: "t270-contract"
});
const SELECTED_ENTRY_REF = "catalog-entry://t270/contract";
const GRAPH_FUNCTION_REF = "gtl://t270/contract";
const ROOT_SCHEMA = Object.freeze({
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  properties: Object.freeze({
    ticketRef: Object.freeze({ type: "string", minLength: 1 })
  }),
  required: Object.freeze(["ticketRef"])
});
const ROOT_SCHEMA_DIGEST = stableSha256Digest(ROOT_SCHEMA);
const ROOT_VALUE = Object.freeze({ ticketRef: "ticket:T-270" });
const ROOT_VALUE_DIGEST = stableSha256Digest(ROOT_VALUE);

function selectedExecution() {
  return Object.freeze({
    selectedEntryRef: SELECTED_ENTRY_REF,
    graphFunctionRef: GRAPH_FUNCTION_REF,
    graphFunctionDigest: stableSha256Digest({ graphFunction: "t270" }),
    selectedExecutionBindingDigest: stableSha256Digest({
      binding: "t270"
    }),
    nextActionRef: "abg://one-surface/next-action/t270",
    nextActionDigest: stableSha256Digest({ nextAction: "t270" }),
    intentAdmissionRef: "abg://one-surface/intent-admission/t270",
    intentAdmissionDigest: stableSha256Digest({ intentAdmission: "t270" })
  });
}

function schemaCapabilityBasis(overrides = {}) {
  const selected = selectedExecution();
  const digest = (subject) => stableSha256Digest({ subject });
  return constructRuntimeSchemaAdmissionCapabilityBasis({
    kind: "runtime_schema_admission_capability_basis",
    workspaceId: "workspace-t270",
    bindingId: WORKSPACE_BINDING_REF,
    catalogId: "catalog.t270",
    resolvedLockRef: "lock://t270/contract",
    entryRef: SELECTED_ENTRY_REF,
    declarationRef: "declaration://t270/contract",
    declarationDigest: digest("declaration"),
    ownerRef: "fixture.t270",
    version: "5.0.0",
    moduleRef: "module://t270/contract",
    moduleDigest: digest("module"),
    graphFunctionId: GRAPH_FUNCTION_REF,
    graphFunctionDigest: selected.graphFunctionDigest,
    nodeRef: "node://t270/root",
    symbolicSchemaRef: "schema://t270/root",
    nativeSymbol: "T270RootInput",
    contractId: "fixture.contract.t270-root",
    contractVersion: "1.0.0",
    contractDigest: ROOT_SCHEMA_DIGEST,
    schemaId: "fixture.schema.t270-root",
    schemaVersion: "1.0.0",
    schemaDigest: ROOT_SCHEMA_DIGEST,
    nativeLocator: null,
    assetLocator: Object.freeze({
      relativePath: "contracts/schemas/t270-root.schema.json"
    }),
    projectionSourceLocator: Object.freeze({
      sourceRef: "source://t270/contract"
    }),
    sourceModuleDigest: digest("source-module"),
    sourceBasisDigest: digest("source-basis"),
    namedCheckSource: Object.freeze({ checkRef: "check://t270/contract" }),
    projectorRef: "projector://t270/contract",
    projectorVersion: "1.0.0",
    projectorBasisDigest: digest("projector-basis"),
    projectionDigest: digest("projection"),
    namedChecks: Object.freeze({ schema: "exact" }),
    witnessDigest: digest("witness"),
    ...overrides
  });
}

function invocationAuthority() {
  const authorityBasisRef = "invocation-authority://t270/contract";
  const authorityBasisDigest = stableSha256Digest({
    authority: "t270-contract"
  });
  const actorRef = "actor://t270/contract";
  const grantBasis = Object.freeze({
    capabilityId: "abg.capability.catalog.invoke",
    capabilityDefinitionRef: "capability://abg/catalog-invoke",
    capabilityDefinitionDigest: stableSha256Digest({
      capability: "catalog-invoke"
    }),
    actorRef,
    approvalRef: "approval://t270/contract",
    policyRef: "policy://t270/contract",
    scopeRef: WORKSPACE_BINDING_REF,
    scopeDigest: WORKSPACE_BINDING_DIGEST,
    authorityBasisRef,
    authorityBasisDigest
  });
  const grantDigest = stableSha256Digest(grantBasis);
  return Object.freeze({
    authorityBasisRef,
    authorityBasisDigest,
    actor: Object.freeze({
      actorRef,
      attributionRef: "attribution://t270/contract",
      attributionDigest: stableSha256Digest({ attribution: "t270" })
    }),
    capabilityGrants: Object.freeze([
      Object.freeze({
        kind: "capability_grant",
        grantRef: `capability-grant:${grantDigest}`,
        grantDigest,
        ...grantBasis
      })
    ]),
    invocationPolicy: Object.freeze({
      policyRef: "policy://t270/invocation",
      policyDigest: stableSha256Digest({ policy: "t270" }),
      sessionPolicyRef: "policy://t270/session",
      sessionPolicyDigest: stableSha256Digest({ session: "t270" })
    }),
    transportSteering: Object.freeze({
      steeringRef: "steering://t270/contract",
      steeringDigest: stableSha256Digest({ steering: "t270" }),
      provenanceRefs: Object.freeze(["provenance://t270/contract"])
    }),
    compatibilityState: "pending_af15_rejoin",
    compatibilityGapRef: T270_RUNTIME_COMPATIBILITY_GAP
  });
}

function runtimeProfile() {
  const runtimeIdentity = Object.freeze({
    runtimeRef: "runtime://t270/contract",
    runtimeVersion: "5.0.0"
  });
  const resolvedPolicy = Object.freeze({
    policyRef: "policy://t270/runtime",
    policyDigest: stableSha256Digest({ runtimePolicy: "t270" })
  });
  const standardPluginRefs = Object.freeze(["plugin://abg/fd-dispatch"]);
  return Object.freeze({
    profileDigest: stableSha256Digest({
      kind: "abg_runtime_system_profile",
      runtimeIdentity,
      resolvedPolicy,
      standardPluginRefs
    }),
    runtimeIdentity,
    resolvedPolicy,
    standardPluginRefs
  });
}

function invokeRootAdmission() {
  const carrier = Object.freeze({
    kind: "admitted_invocation_carrier",
    sourceNodeRef: "node://t270/root",
    schemaRef: "schema://t270/root",
    carrierRef: "payload://t270/root",
    carrierDigest: ROOT_VALUE_DIGEST,
    admissionRef: "admission://t270/root",
    value: ROOT_VALUE
  });
  const carriers = Object.freeze([carrier]);
  const admittedInputCarriers = Object.freeze({
    kind: "admitted_invocation_carrier_set",
    carriers,
    carrierSetDigest: stableSha256Digest(carriers)
  });
  const schema = Object.freeze({
    kind: "installed_public_schema_authority",
    owningProductId: "fixture.t270",
    owningProductVersion: "5.0.0",
    publicContractCatalogId: "abg.public-contracts.t270",
    contractId: "fixture.contract.t270-root",
    contractDigest: ROOT_SCHEMA_DIGEST,
    publicSchemaId: "fixture.schema.t270-root",
    publicSchemaVersion: "1.0.0",
    assetRelativePath: "contracts/schemas/t270-root.schema.json",
    assetDigest: ROOT_SCHEMA_DIGEST,
    schema: ROOT_SCHEMA
  });
  const schemas = Object.freeze([schema]);
  const installedPublicInputSchemas = Object.freeze({
    kind: "installed_public_schema_authority_set",
    schemas,
    schemaSetDigest: stableSha256Digest(schemas)
  });
  return { admittedInputCarriers, installedPublicInputSchemas };
}

function basis(variant) {
  const root = invokeRootAdmission();
  const inputContract = Object.freeze({
    owningProductId: "fixture.t270",
    owningProductVersion: "5.0.0",
    productManifestDigest: stableSha256Digest({ manifest: "t270" }),
    publicContractCatalogId: "abg.public-contracts.t270",
    publicContractCatalogVersion: "5.0.0",
    publicContractCatalogDigest: stableSha256Digest({ catalog: "t270" }),
    contractId: "fixture.contract.t270-root",
    contractVersion: "1.0.0",
    contractDigest: ROOT_SCHEMA_DIGEST,
    sourceInterface: Object.freeze([
      Object.freeze({
        nodeRef: "node://t270/root",
        schemaRef: "schema://t270/root"
      })
    ]),
    asset: Object.freeze({
      relativePath: "contracts/schemas/t270-root.schema.json",
      mediaType: "application/schema+json",
      schemaId: "fixture.schema.t270-root",
      schemaVersion: "1.0.0",
      digest: ROOT_SCHEMA_DIGEST
    })
  });
  return {
    authorityClass: "subordinate_rejoin_only",
    variant,
    definitionDigest: stableSha256Digest({ definition: variant }),
    invocation: Object.freeze({
      ref: `invocation://t270/${variant}`,
      digest: stableSha256Digest({ invocation: variant }),
      authorityRef: "invocation-authority://t270/contract",
      authorityDigest: stableSha256Digest({ authority: "t270-contract" }),
      witnessDigest: stableSha256Digest({ witness: variant })
    }),
    workspace: Object.freeze({
      bindingRef: WORKSPACE_BINDING_REF,
      bindingDigest: WORKSPACE_BINDING_DIGEST,
      workspaceId: "workspace-t270",
      workspaceRoot: "/tmp/abg-t270-contract"
    }),
    catalog: Object.freeze({
      basisRef: "catalog-basis://t270/contract",
      catalogId: "catalog.t270",
      resolvedLockRef: "lock://t270/contract",
      viewRef: "catalog-view://t270/contract",
      viewDigest: stableSha256Digest({ view: "t270" }),
      allowedEntryRefs: Object.freeze([SELECTED_ENTRY_REF])
    }),
    program: Object.freeze({
      ref: "program://t270/contract",
      digest: stableSha256Digest({ program: "t270" })
    }),
    constraint: variant === "invoke"
      ? Object.freeze({
          kind: "exact_graph_function_constraint",
          inputContract,
          inputPayloadRef: "payload://t270/root",
          inputPayloadDigest: ROOT_VALUE_DIGEST
        })
      : Object.freeze({
          kind: "start_constraints",
          scopeRef: WORKSPACE_BINDING_REF,
          scopeDigest: WORKSPACE_BINDING_DIGEST,
          targetKind: "next",
          targetHandle: null,
          until: "blocked",
          fhMode: "direct",
          rootMode: "supervised"
        }),
    selectedExecution: selectedExecution(),
    admittedInputCarriers: variant === "invoke"
      ? root.admittedInputCarriers
      : null,
    installedPublicInputSchemas: variant === "invoke"
      ? root.installedPublicInputSchemas
      : null,
    invocationAuthority: invocationAuthority(),
    runtimeProfile: runtimeProfile(),
    schemaAdmissionCapabilityBases: Object.freeze([
      schemaCapabilityBasis()
    ]),
    sourceWitnessRefs: Object.freeze(["witness://t270/contract"])
  };
}

function withSourceRows(input, sourceInterface) {
  return {
    ...input,
    constraint: {
      ...input.constraint,
      inputContract: {
        ...input.constraint.inputContract,
        sourceInterface
      }
    }
  };
}

function withCarriers(input, carriers, carrierSetDigest = stableSha256Digest(carriers)) {
  return {
    ...input,
    admittedInputCarriers: {
      ...input.admittedInputCarriers,
      carriers,
      carrierSetDigest
    }
  };
}

function withSchemas(input, schemas, schemaSetDigest = stableSha256Digest(schemas)) {
  return {
    ...input,
    installedPublicInputSchemas: {
      ...input.installedPublicInputSchemas,
      schemas,
      schemaSetDigest
    }
  };
}

test("T-270 final ingress admits common post-AF-14 selection and invoke root authority", () => {
  const ingress = admitRunInvokeExecutionIngress(basis("invoke"));
  assertAdmittedRunInvokeExecutionIngress(ingress);
  assert.equal(ingress.selectedExecution.selectedEntryRef, SELECTED_ENTRY_REF);
  assert.equal(ingress.selectedExecution.graphFunctionRef, GRAPH_FUNCTION_REF);
  assert.equal(ingress.admittedInputCarriers.carriers.length, 1);
  assert.equal(ingress.installedPublicInputSchemas.schemas.length, 1);
  assert.equal(Object.hasOwn(ingress.constraint, "selectedEntryRef"), false);
  assert.equal(Object.hasOwn(ingress.constraint, "graphFunctionRef"), false);
  assert.equal(Object.hasOwn(ingress.constraint, "payloadAdmissionState"), false);
  assert.equal(Object.hasOwn(ingress.constraint, "payloadAdmissionGapRef"), false);
  assert.equal(Object.isFrozen(ingress.admittedInputCarriers.carriers[0].value), true);
  assert.equal(Object.isFrozen(ingress.installedPublicInputSchemas.schemas[0].schema), true);
});

test("T-270 start final ingress retains common selection and carries no root authority", () => {
  const ingress = admitRunInvokeExecutionIngress(basis("start"));
  assertAdmittedRunInvokeExecutionIngress(ingress);
  assert.equal(ingress.selectedExecution.selectedEntryRef, SELECTED_ENTRY_REF);
  assert.equal(ingress.admittedInputCarriers, null);
  assert.equal(ingress.installedPublicInputSchemas, null);
});

test("T-270 final ingress rejects legacy selection truth inside the request constraint", () => {
  const input = basis("invoke");
  assert.throws(
    () => admitRunInvokeExecutionIngress({
      ...input,
      constraint: {
        ...input.constraint,
        selectedEntryRef: SELECTED_ENTRY_REF
      }
    }),
    /exact function constraint is incomplete/u
  );
});

test("T-270 final ingress rejects missing, cross-variant, or mismatched root authority", () => {
  const invoke = basis("invoke");
  assert.throws(
    () => admitRunInvokeExecutionIngress({
      ...invoke,
      admittedInputCarriers: null
    }),
    /root admission is incomplete/u
  );

  const start = basis("start");
  assert.throws(
    () => admitRunInvokeExecutionIngress({
      ...start,
      ...invokeRootAdmission()
    }),
    /start carries public root admission/u
  );

  assert.throws(
    () => admitRunInvokeExecutionIngress({
      ...invoke,
      selectedExecution: {
        ...invoke.selectedExecution,
        selectedEntryRef: "catalog-entry://t270/outside-view"
      }
    }),
    /outside the admitted catalog view/u
  );

  assert.throws(
    () => admitRunInvokeExecutionIngress({
      ...invoke,
      selectedExecution: {
        ...invoke.selectedExecution,
        admit: (value) => value
      }
    }),
    /selected execution basis is incomplete/u
  );
});

test("T-270 invoke root admission rejects zero or multiple source, carrier, and schema rows", () => {
  const input = basis("invoke");
  const source = input.constraint.inputContract.sourceInterface[0];
  const carrier = input.admittedInputCarriers.carriers[0];
  const schema = input.installedPublicInputSchemas.schemas[0];
  const candidates = [
    withSourceRows(input, []),
    withSourceRows(input, [source, { ...source, nodeRef: "node://t270/other" }]),
    withCarriers(input, []),
    withCarriers(input, [
      carrier,
      { ...carrier, sourceNodeRef: "node://t270/other", carrierRef: "payload://t270/other" }
    ]),
    withSchemas(input, []),
    withSchemas(input, [
      schema,
      { ...schema, contractId: "fixture.contract.t270-other" }
    ])
  ];
  for (const candidate of candidates) {
    assert.throws(
      () => admitRunInvokeExecutionIngress(candidate),
      /constraint is incomplete|root admission differs/u
    );
  }
});

test("T-270 invoke root admission rejects representative relation and digest mutations", () => {
  const input = basis("invoke");
  const carrier = input.admittedInputCarriers.carriers[0];
  const schema = input.installedPublicInputSchemas.schemas[0];
  const changedBody = { type: "string" };
  const mutations = [
    withCarriers(input, [{ ...carrier, sourceNodeRef: "node://t270/foreign" }]),
    withCarriers(input, [{ ...carrier, schemaRef: "schema://t270/foreign" }]),
    withCarriers(input, [{ ...carrier, carrierRef: "payload://t270/foreign" }]),
    withSchemas(input, [{ ...schema, schema: changedBody }]),
    withCarriers(
      input,
      input.admittedInputCarriers.carriers,
      stableSha256Digest({ carrierSet: "mutated" })
    )
  ];
  for (const mutation of mutations) {
    assert.throws(
      () => admitRunInvokeExecutionIngress(mutation),
      /root admission differs/u
    );
  }
});

test("T-270 schema capability bases are nonempty, canonical, unique, and authority-conserving", () => {
  const input = basis("invoke");
  const first = input.schemaAdmissionCapabilityBases[0];
  const later = schemaCapabilityBasis({
    nodeRef: "node://t270/z-output",
    symbolicSchemaRef: "schema://t270/z-output",
    nativeSymbol: "T270Output"
  });
  const invalidSets = [
    [],
    [first, first],
    [later, first]
  ];
  for (const schemaAdmissionCapabilityBases of invalidSets) {
    assert.throws(
      () => admitRunInvokeExecutionIngress({
        ...input,
        schemaAdmissionCapabilityBases
      }),
      /execution ingress refs are incomplete/u
    );
  }
  assert.throws(
    () => admitRunInvokeExecutionIngress({
      ...input,
      schemaAdmissionCapabilityBases: [
        schemaCapabilityBasis({ workspaceId: "workspace-foreign" })
      ]
    }),
    /schema capability authority differs/u
  );
});

test("T-270 malformed null carriers fail with deliberate contract errors", () => {
  const input = basis("invoke");
  assert.throws(
    () => admitRunInvokeExecutionIngress(null),
    /execution ingress: expected an object/u
  );
  assert.throws(
    () => admitRunInvokeExecutionIngress({
      ...input,
      schemaAdmissionCapabilityBases: null
    }),
    /schemaAdmissionCapabilityBases: expected an array/u
  );
  assert.throws(
    () => admitRunInvokeExecutionIngress({
      ...input,
      admittedInputCarriers: {
        ...input.admittedInputCarriers,
        carriers: null
      }
    }),
    /admittedInputCarriers.carriers: expected an array/u
  );
});
