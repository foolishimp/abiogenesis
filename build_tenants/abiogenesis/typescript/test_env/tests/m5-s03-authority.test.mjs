import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

import * as abg from "../../build/code/src/abg/index.js";
import * as hog from "../../build/code/src/hog/index.js";
import * as product from "../../build/code/src/product/index.js";
import {
  setupInstalledRootExecutionBasis,
} from "../support/root-installed-environment.mjs";

const DIGEST = `sha256:${"1".repeat(64)}`;
const ACTOR = "actor://developer.example/trusted-developer";
const CAPABILITY = "capability://developer.example/review@5";
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function workspaceBinding() {
  return {
    kind: "workspace_binding",
    schemaVersion: "5.0.0",
    bindingId: "workspace-binding://developer.example/unit",
    bindingDigest: DIGEST,
    authorityBasisId: "workspace-authority://developer.example/unit",
    authorityBasisDigest: DIGEST,
    authorizedActorRef: ACTOR,
    productSetId: "product-set://developer.example/unit",
    productSetDigest: DIGEST,
    lockId: "product-lock://developer.example/unit",
    lockDigest: DIGEST,
    roots: {
      toolchainRoot: "/unit/toolchain",
      productRoot: "/unit/product",
      eventLogRoot: "/unit/events",
      runtimeStateRoot: "/unit/runtime",
      projectionRoot: "/unit/projection",
      archiveRoot: "/unit/archive",
    },
    admissionEventRef: "event://developer.example/workspace-admitted",
  };
}

function program() {
  return {
    kind: "gtl_program",
    schemaVersion: "5.0.0",
    programRef: "program://developer.example/unit@5",
    callableMembership: [],
    graphFunctionMembership: [],
    nodeTypeMembership: [],
    overlayMembership: [],
    policies: {},
    closureContractRef: "closure-contract://developer.example/unit@5",
  };
}

function validation(interactionLeafRows = []) {
  return {
    executableLeafRows: [{ fibre: "F_D" }],
    interactionLeafRows,
  };
}

function operationBasis(operationId, workspace, invocationRef) {
  const invocationPayloadDigest = product.sha256Canonical({});
  return {
    operationId,
    definitionKey: operationId,
    definitionDigest: product.sha256Canonical({
      operationId,
      schemaVersion: "5.0.0",
    }),
    authorityScopeRef: workspace.bindingId,
    authorityScopeDigest: workspace.bindingDigest,
    invocationRef,
    invocationPayloadDigest,
    invocationDigest: product.sha256Canonical({
      invocationRef,
      operationId,
      payloadDigest: invocationPayloadDigest,
    }),
    correlationId: "correlation://developer.example/s03-unit",
    eventTime: "2026-07-25T00:00:00.000Z",
    causationEventRefs: [],
  };
}

test("S03 capability policy is exact over admitted Program interaction requirements", () => {
  const workspace = workspaceBinding();
  const sourceProgram = program();
  const exactPolicy = product.constructRootInvocationPolicy(
    workspace,
    sourceProgram,
    [],
    ["F_D"],
  );
  const directGrant = product.constructCapabilityGrant(exactPolicy, ACTOR);
  assert.throws(
    () =>
      product.constructCapabilityGrant(
        exactPolicy,
        "actor://developer.example/substituted",
      ),
    /exact capability/u,
    "the trusted-developer workspace basis selects one actor",
  );
  assert.equal(
    abg.validateInvocationCapabilityBasis({
      actorRef: ACTOR,
      capabilityGrants: [directGrant],
      policy: exactPolicy,
      program: sourceProgram,
      programValidation: validation(),
      workspaceBinding: workspace,
    }),
    null,
  );
  assert.throws(
    () =>
      product.constructCapabilityGrant(
        exactPolicy,
        ACTOR,
        "abg.operation.interaction.respond",
        CAPABILITY,
      ),
    /exact capability/u,
  );

  const surplusRow = {
    requirementKey: "interaction-leaf://developer.example/surplus",
    requirementKeyDigest: DIGEST,
    actorCapabilityRef: CAPABILITY,
  };
  const interactionPolicy = product.constructRootInvocationPolicy(
    workspace,
    sourceProgram,
    [surplusRow],
    ["F_D"],
  );
  const interactionGrants = [
    product.constructCapabilityGrant(interactionPolicy, ACTOR),
    product.constructCapabilityGrant(
      interactionPolicy,
      ACTOR,
      "abg.operation.interaction.respond",
      CAPABILITY,
    ),
    product.constructCapabilityGrant(
      interactionPolicy,
      ACTOR,
      "abg.operation.run.continue",
      CAPABILITY,
    ),
  ];
  const interactionValidation = validation([
    {
      ...surplusRow,
      requirement: {
        actorCapabilityRef: CAPABILITY,
      },
    },
  ]);
  assert.equal(
    abg.validateInvocationCapabilityBasis({
      actorRef: ACTOR,
      capabilityGrants: interactionGrants,
      policy: interactionPolicy,
      program: sourceProgram,
      programValidation: interactionValidation,
      workspaceBinding: workspace,
    }),
    null,
  );
  assert.equal(
    abg.validateInvocationCapabilityBasis({
      actorRef: ACTOR,
      capabilityGrants: interactionGrants.slice(0, -1),
      policy: interactionPolicy,
      program: sourceProgram,
      programValidation: interactionValidation,
      workspaceBinding: workspace,
    })?.code,
    "capability_mismatch",
  );
  assert.equal(
    abg.validateInvocationCapabilityBasis({
      actorRef: "actor://developer.example/substituted",
      capabilityGrants: interactionGrants,
      policy: interactionPolicy,
      program: sourceProgram,
      programValidation: interactionValidation,
      workspaceBinding: workspace,
    })?.code,
    "capability_mismatch",
  );
  assert.equal(
    abg.validateInvocationCapabilityBasis({
      actorRef: ACTOR,
      capabilityGrants: interactionGrants,
      policy: interactionPolicy,
      program: sourceProgram,
      programValidation: validation(),
      workspaceBinding: workspace,
    })?.code,
    "capability_mismatch",
    "an all-F_D Program must reject surplus F_H authority",
  );
});

test("S03 continuation operation authority requires the exact admitted grant and lifecycle state", () => {
  const workspace = workspaceBinding();
  const sourceProgram = program();
  const interactionRow = {
    requirementKey: "interaction-leaf://developer.example/review",
    requirementKeyDigest: DIGEST,
    actorCapabilityRef: CAPABILITY,
  };
  const policy = product.constructRootInvocationPolicy(
    workspace,
    sourceProgram,
    [interactionRow],
    ["F_D", "F_H"],
  );
  const responseGrant = product.constructCapabilityGrant(
    policy,
    ACTOR,
    "abg.operation.interaction.respond",
    CAPABILITY,
  );
  const rootInvocation = {
    actorRef: ACTOR,
    workspaceBindingId: workspace.bindingId,
    workspaceBindingDigest: workspace.bindingDigest,
    capabilityGrants: [responseGrant],
    capabilityGrantRefs: [responseGrant.grantRef],
  };
  const basis = operationBasis(
    "abg.operation.interaction.respond",
    workspace,
    "invocation://developer.example/s03-unit/respond",
  );
  const exact = {
    rootInvocation,
    continuation: {
      continuationRef: "continuation://developer.example/s03-unit",
      status: "open",
    },
    operation: "abg.operation.interaction.respond",
    variant: "approve",
    actorRef: ACTOR,
    capabilityRef: CAPABILITY,
    basis,
    duplicateInvocation: false,
  };
  assert.equal(
    abg.resolveContinuationPublicOperationGrant(exact)?.grantRef,
    responseGrant.grantRef,
  );
  assert.equal(
    abg.resolveContinuationPublicOperationGrant({
      ...exact,
      actorRef: "actor://developer.example/substituted",
    }),
    null,
  );
  assert.equal(
    abg.resolveContinuationPublicOperationGrant({
      ...exact,
      continuation: {
        ...exact.continuation,
        status: "responded",
      },
    }),
    null,
  );
  assert.equal(
    abg.resolveContinuationPublicOperationGrant({
      ...exact,
      duplicateInvocation: true,
    }),
    null,
  );
});

test("S03 HoG accepts one Product-sealed projection and rejects its forged twin", async (context) => {
  const environment = await setupInstalledRootExecutionBasis(
    context,
    packageRoot,
  );
  const {
    admittedInstall,
    gtl,
    hogInstalledProduct,
    implementationSet,
    leafPort,
    publication,
    semanticsProjection,
    store,
  } = environment;
  assert.equal(leafPort.kind, "admitted_leaf_invocation_port");
  assert.equal(
    leafPort.validateContractValue(
      gtl.HELLO_WORLD_IDS.outputContractRef,
      "output",
      {
        kind: "forged_output",
        schemaVersion: "5.0.0",
      },
    ),
    false,
    "the Product-sealed positive control retains exact contract meaning",
  );

  const forgedProjection = {
    ...semanticsProjection,
    validateContractValue: () => true,
    resolveJudgmentRelation: () => ({
      predicateRef: gtl.HELLO_WORLD_IDS.judgmentPredicateRef,
      advanceReasonRef: "reason://review/forged-advance",
      rejectionReasonRef: "reason://review/forged-reject",
      evaluate: () => true,
    }),
  };
  assert.equal(
    forgedProjection.validateContractValue(
      "developer_invalid_output",
      {},
    ),
    true,
    "the forged callback is deliberately permissive",
  );
  const eventCount = store.readAll().length;
  await assert.rejects(
    () =>
      hogInstalledProduct.bindInstalledLeafInvocationPort({
        store,
        install: admittedInstall,
        implementationSet,
        publication,
        semanticsProjection: forgedProjection,
      }),
    /exact admitted install/u,
  );
  assert.equal(store.readAll().length, eventCount);
  await assert.rejects(
    () =>
      access(
        join(
          environment.installedRoot,
          "build/code/src/shared/leaf_semantics_projection.js",
        ),
      ),
    /ENOENT/u,
    "the installed package contains no shared semantic-authority mint",
  );
  const installedProductSemantics = await import(
    `${pathToFileURL(
      join(
        environment.installedRoot,
        "build/code/src/product/semantics.js",
      ),
    ).href}?s03-authority-proof`
  );
  assert.equal(
    "mintInstalledLeafSemanticsProjection" in installedProductSemantics,
    false,
    "the Product-owned mint is not exported even from its implementation module",
  );
});

test("S03 Product semantics requires a loaded provider and is absent from HoG's public port", () => {
  assert.equal(typeof product.evaluateInstalledInteractionResponse, "function");
  assert.equal("evaluateInstalledInteractionResponse" in hog, false);
  assert.equal("admitInstalledProductInput" in hog, false);
  assert.equal("bindInstalledLeafInvocationPort" in hog, false);

  const provider = {
    kind: "product_semantics_provider",
    schemaVersion: "5.0.0",
    bindingRef: "product-semantics://developer.example/forged@5",
    packageName: "@developer-example/forged",
    packageVersion: "5.0.0",
    admitInput: (_contractRef, value) => value,
    evaluateInteractionResponse(_basis, response) {
      return response;
    },
    validateContractValue: () => true,
    resolveJudgmentRelation: () => null,
  };
  const response = { kind: "unit_response", schemaVersion: "5.0.0" };
  assert.throws(
    () =>
      product.evaluateInstalledInteractionResponse(
        provider,
        {
          requestContractRef: "contract://unit/request",
          responseContractRef: "contract://unit/response",
          requestValue: {},
          constructionIntent: null,
          nextActionBasis: null,
        },
        response,
      ),
    /exact loaded Product semantics provider/u,
  );
  assert.throws(
    () => product.projectInstalledLeafSemantics(provider),
    /exact loaded Product semantics provider/u,
  );
});
