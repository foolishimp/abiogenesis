import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  publicOperationBasis,
  requireRawAdmission,
  setupInstalledRootCatalog,
} from "../support/root-installed-environment.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("R5 selects and admits the exact validated direct invocation target", async (context) => {
  const environment = await setupInstalledRootCatalog(context, root);
  const {
    product,
    abg,
    gtl,
    validator,
    store,
    verified,
    workspaceBinding,
    publication,
    programValidation,
    catalogView,
  } = environment;
  const program = publication.programs[0];
  const graphFunction = publication.graphFunctions[0];
  const input = gtl.constructHelloWorldInput("World");
  const rawInput = requireRawAdmission(
    validator,
    input,
    "invocation_input",
    gtl.HELLO_WORLD_IDS.inputContractRef,
  );
  const rawRequest = requireRawAdmission(
    validator,
    {
      kind: "public_invocation",
      schemaVersion: "5.0.0",
      operationId: "abg.operation.run.invoke",
      variant: "direct",
      invocationRef: "invocation://t286/r5/run-invoke",
      eventTime: "2026-07-21T00:00:00.000Z",
      correlationId: "correlation://t286/r5/run-invoke",
      payload: {
        programRef: program.programRef,
        graphFunctionRef: graphFunction.name,
      },
    },
    "public_operation_request",
    "contract://abiogenesis/public/run-invoke-request@5",
  );
  const policy = product.constructRootInvocationPolicy();
  const actorRef = "actor://abiogenesis/t286/trusted-developer";
  const capabilityGrant = product.constructCapabilityGrant(actorRef);
  const authority = product.constructInvocationAuthority(
    actorRef,
    workspaceBinding,
    catalogView,
    program.programRef,
    graphFunction.name,
    [capabilityGrant],
  );
  assert.equal(authority.kind, "invocation_authority", JSON.stringify(authority));
  const invocation = product.constructDirectInvocation(
    workspaceBinding,
    catalogView,
    program,
    graphFunction,
    rawRequest,
    rawInput,
    policy,
    [capabilityGrant],
    authority,
  );
  assert.equal(invocation.kind, "public_invocation_candidate", JSON.stringify(invocation));
  const admissionInput = {
    invocation,
    rawRequest,
    rawInput,
    modulePublication: publication,
    program,
    graphFunction,
    programValidation,
    workspaceBinding,
    catalogView,
    policy,
    capabilityGrants: [capabilityGrant],
    authority,
  };
  const invocationAdmission = abg.admitInvocation(
    store,
    admissionInput,
    publicOperationBasis(
      product,
      "abg.operation.run.invoke",
      workspaceBinding.bindingId,
      workspaceBinding.bindingDigest,
      invocation.invocationRef,
      [catalogView.admissionEventRef],
    ),
  );
  assert.equal(invocationAdmission.kind, "invocation_admission", JSON.stringify(invocationAdmission));
  assert.equal(invocationAdmission.disposition, "admitted");
  assert.equal(invocationAdmission.programRef, gtl.HELLO_WORLD_IDS.programRef);
  assert.equal(invocationAdmission.graphFunctionRef, gtl.HELLO_WORLD_IDS.graphFunctionRef);
  assert.equal(invocationAdmission.inputContractRef, gtl.HELLO_WORLD_IDS.inputContractRef);
  assert.equal(invocationAdmission.outputContractRef, gtl.HELLO_WORLD_IDS.outputContractRef);
  assert.equal(Object.isFrozen(invocationAdmission), true);
  assert.equal("graph" in invocationAdmission, false);
  assert.equal("executionBasis" in invocationAdmission, false);
  assert.equal("rootMode" in invocation, false);
  assert.equal("until" in invocation, false);

  const eventCountBeforeNegatives = store.readAll().length;
  const malformedInput = requireRawAdmission(
    validator,
    { kind: "wrong_input", schemaVersion: "5.0.0", subject: "World" },
    "invocation_input",
    gtl.HELLO_WORLD_IDS.inputContractRef,
  );
  const malformedContractRefusal = abg.admitInvocation(
    store,
    { ...admissionInput, rawInput: malformedInput },
    publicOperationBasis(
      product,
      "abg.operation.run.invoke",
      workspaceBinding.bindingId,
      workspaceBinding.bindingDigest,
      invocation.invocationRef,
    ),
  );
  assert.equal(malformedContractRefusal.code, "contract_mismatch");

  const missingGrantRefusal = abg.admitInvocation(
    store,
    { ...admissionInput, capabilityGrants: [] },
    publicOperationBasis(
      product,
      "abg.operation.run.invoke",
      workspaceBinding.bindingId,
      workspaceBinding.bindingDigest,
      invocation.invocationRef,
    ),
  );
  assert.equal(missingGrantRefusal.code, "capability_mismatch");

  const duplicateGrantRefusal = abg.admitInvocation(
    store,
    { ...admissionInput, capabilityGrants: [capabilityGrant, capabilityGrant] },
    publicOperationBasis(
      product,
      "abg.operation.run.invoke",
      workspaceBinding.bindingId,
      workspaceBinding.bindingDigest,
      invocation.invocationRef,
    ),
  );
  assert.equal(duplicateGrantRefusal.code, "capability_mismatch");

  const missingMembershipRefusal = abg.admitInvocation(
    store,
    { ...admissionInput, program: { ...program, callableMembership: [] } },
    publicOperationBasis(
      product,
      "abg.operation.run.invoke",
      workspaceBinding.bindingId,
      workspaceBinding.bindingDigest,
      invocation.invocationRef,
    ),
  );
  assert.equal(missingMembershipRefusal.code, "selection_mismatch");

  const changedViewRefusal = abg.admitInvocation(
    store,
    { ...admissionInput, catalogView: { ...catalogView, selectedRows: [] } },
    publicOperationBasis(
      product,
      "abg.operation.run.invoke",
      workspaceBinding.bindingId,
      workspaceBinding.bindingDigest,
      invocation.invocationRef,
    ),
  );
  assert.equal(changedViewRefusal.code, "catalog_view_not_admitted");

  const changedWorkspaceRefusal = abg.admitInvocation(
    store,
    {
      ...admissionInput,
      workspaceBinding: {
        ...workspaceBinding,
        roots: { ...workspaceBinding.roots, productRoot: "/tmp/not-the-admitted-product" },
      },
    },
    publicOperationBasis(
      product,
      "abg.operation.run.invoke",
      workspaceBinding.bindingId,
      workspaceBinding.bindingDigest,
      invocation.invocationRef,
    ),
  );
  assert.equal(changedWorkspaceRefusal.code, "workspace_not_admitted");

  const forgedInvocationRefusal = abg.admitInvocation(
    store,
    { ...admissionInput, invocation: structuredClone(invocation) },
    publicOperationBasis(
      product,
      "abg.operation.run.invoke",
      workspaceBinding.bindingId,
      workspaceBinding.bindingDigest,
      invocation.invocationRef,
    ),
  );
  assert.equal(forgedInvocationRefusal.code, "invocation_not_constructed");
  assert.equal(store.readAll().length, eventCountBeforeNegatives);

  const events = store.readAll();
  assert.deepEqual(events.slice(-2).map((event) => event.kind), [
    "public_operation_admitted",
    "invocation_admitted",
  ]);
  assert.deepEqual(
    events.map((event) => event.admissionOrdinal),
    Array.from({ length: events.length }, (_, index) => index + 1),
  );
  assert.equal(events.at(-1).causationEventRefs[0], events.at(-2).eventId);

  const evidenceDirectory = join(root, "test_env/evidence");
  await mkdir(evidenceDirectory, { recursive: true });
  await writeFile(
    join(evidenceDirectory, "abi5-root-r5.json"),
    `${JSON.stringify({
      kind: "abi5_root_obligation_evidence",
      schemaVersion: "5.0.0",
      bindingId: "ABI5-ROOT-001",
      obligation: "R5_exact_target_program_selected_and_admitted",
      result: "satisfied",
      sourceImportUsed: false,
      artifactDigest: verified.artifactDigest,
      workspaceBindingId: workspaceBinding.bindingId,
      catalogViewId: catalogView.viewId,
      invocationRef: invocation.invocationRef,
      invocationDigest: invocation.invocationDigest,
      invocationAdmissionRef: invocationAdmission.invocationAdmissionRef,
      invocationAdmissionDigest: invocationAdmission.invocationAdmissionDigest,
      programRef: invocationAdmission.programRef,
      graphFunctionRef: invocationAdmission.graphFunctionRef,
      inputContractRef: invocationAdmission.inputContractRef,
      outputContractRef: invocationAdmission.outputContractRef,
      actorRef: invocationAdmission.actorRef,
      authorityRef: invocationAdmission.authorityRef,
      capabilityGrantRefs: invocationAdmission.capabilityGrantRefs,
      eventStoreDigest: store.digest(),
      eventKinds: events.map((event) => event.kind),
      mutation: {
        malformedInputRefusal: malformedContractRefusal.code,
        missingCapabilityRefusal: missingGrantRefusal.code,
        duplicateCapabilityRefusal: duplicateGrantRefusal.code,
        missingMembershipRefusal: missingMembershipRefusal.code,
        changedCatalogViewRefusal: changedViewRefusal.code,
        changedWorkspaceRefusal: changedWorkspaceRefusal.code,
        forgedInvocationRefusal: forgedInvocationRefusal.code,
        eventCountUnchanged: store.readAll().length === eventCountBeforeNegatives,
      },
      authorityBoundary: {
        graphMaterialized: false,
        executionBasisCreated: false,
        hogEntered: false,
      },
    }, null, 2)}\n`,
    "utf8",
  );
});
