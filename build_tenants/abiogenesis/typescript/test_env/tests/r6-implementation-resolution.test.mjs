import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

import { setupInstalledRootResolution } from "../support/root-installed-environment.mjs";

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("R6 resolves one exact packaged leaf and all declared contracts", async (context) => {
  const environment = await setupInstalledRootResolution(context, root);
  const {
    product,
    validator,
    store,
    verified,
    consumerRoot,
    publication,
    programValidation,
    graphFunction,
    graphValidation,
    catalogView,
    implementationDescriptor,
    resolutionCandidate: resolution,
    resolutionValidation: validation,
  } = environment;
  const node = graphFunction.template.nodes[0];
  const eventCountBeforeResolution = store.readAll().length;
  assert.equal(resolution.kind, "implementation_resolution_candidate", JSON.stringify(resolution));
  const binding = publication.implementationBindings.find(
    (candidate) =>
      candidate.bindingRef === node.term.requirement.implementationBindingRef,
  );
  assert.notEqual(binding, undefined);
  assert.equal(validation.kind, "implementation_resolution_validation", JSON.stringify(validation));
  assert.equal(resolution.computeRegime, "F_D");
  assert.equal(
    resolution.implementationBindingRef,
    node.term.requirement.implementationBindingRef,
  );
  assert.equal(resolution.implementationRef, binding.implementationRef);
  assert.equal(resolution.packageName, verified.packageName);
  assert.equal(resolution.packageVersion, verified.packageVersion);
  assert.equal(resolution.inputContractRef, graphFunction.inputs[0]);
  assert.equal(resolution.outputContractRef, graphFunction.outputs[0]);
  assert.equal(Object.isFrozen(resolution), true);
  assert.equal(Object.isFrozen(validation), true);
  assert.equal("realize" in resolution, false);
  assert.equal("callable" in resolution, false);
  assert.equal(store.readAll().length, eventCountBeforeResolution);

  const packageProbe = await execFileAsync(
    "node",
    [
      "--input-type=module",
      "--eval",
      `
        import * as root from "@abiogenesis/typescript-tenant";
        import * as product from "@abiogenesis/typescript-tenant/product";
        let implementationExportRefused = false;
        try {
          await import("@abiogenesis/typescript-tenant/implementation");
        } catch (error) {
          implementationExportRefused = error?.code === "ERR_PACKAGE_PATH_NOT_EXPORTED";
        }
        process.stdout.write(JSON.stringify({
          rootRealizerType: typeof root.realizeHelloWorld,
          productRealizerType: typeof product.realizeHelloWorld,
          implementationExportRefused
        }));
      `,
    ],
    { cwd: consumerRoot, maxBuffer: 10 * 1024 * 1024 },
  );
  assert.deepEqual(JSON.parse(packageProbe.stdout), {
    rootRealizerType: "undefined",
    productRealizerType: "undefined",
    implementationExportRefused: true,
  });

  const absentNode = product.resolveImplementation(
    catalogView,
    publication,
    programValidation,
    graphValidation,
    graphFunction.id,
    "node://abiogenesis/conformance/missing@5",
    [implementationDescriptor],
  );
  assert.equal(absentNode.code, "implementation_absent");

  const absentPackageImplementation = product.resolveImplementation(
    catalogView,
    publication,
    programValidation,
    graphValidation,
    graphFunction.id,
    node.nodeRef,
    [],
  );
  assert.equal(absentPackageImplementation.code, "implementation_absent");

  const changedView = product.resolveImplementation(
    { ...catalogView, entries: [] },
    publication,
    programValidation,
    graphValidation,
    graphFunction.id,
    node.nodeRef,
    [implementationDescriptor],
  );
  assert.equal(changedView.code, "selection_mismatch");

  const alteredPublication = structuredClone(publication);
  alteredPublication.implementationBindings.find(
    (candidate) => candidate.bindingRef === binding.bindingRef,
  ).modulePath = "build/code/src/implementation/other.js";
  const alteredBinding = product.resolveImplementation(
    catalogView,
    alteredPublication,
    programValidation,
    graphValidation,
    graphFunction.id,
    node.nodeRef,
    [implementationDescriptor],
  );
  assert.equal(alteredBinding.code, "invalid_program_validation");

  const forgedResolution = validator.validateImplementationResolution(
    structuredClone(resolution),
    publication,
    programValidation,
    graphValidation,
    graphFunction,
    implementationDescriptor,
  );
  assert.equal(forgedResolution.kind, "static_validation_refusal");
  assert.equal(forgedResolution.diagnostics[0].code, "raw_subject_mismatch");
  const changedBindingPublication = structuredClone(publication);
  changedBindingPublication.implementationBindings.find(
    (candidate) => candidate.bindingRef === binding.bindingRef,
  ).modulePath =
    "build/code/src/implementation/other.js";
  const changedBindingValidation = validator.validateImplementationResolution(
    resolution,
    changedBindingPublication,
    programValidation,
    graphValidation,
    graphFunction,
    implementationDescriptor,
  );
  assert.equal(changedBindingValidation.kind, "static_validation_refusal");
  assert.equal(changedBindingValidation.diagnostics[0].code, "invalid_reference");
  assert.equal(store.readAll().length, eventCountBeforeResolution);

  const evidenceDirectory = join(root, "test_env/evidence");
  await mkdir(evidenceDirectory, { recursive: true });
  await writeFile(
    join(evidenceDirectory, "abi5-root-r6.json"),
    `${JSON.stringify({
      kind: "abi5_root_obligation_evidence",
      schemaVersion: "5.0.0",
      bindingId: "ABI5-ROOT-001",
      obligation: "R6_exact_graph_function_and_contracts_resolved",
      result: "satisfied",
      sourceImportUsed: false,
      artifactDigest: verified.artifactDigest,
      catalogViewId: catalogView.viewId,
      programValidationRef: programValidation.validationRef,
      graphValidationRef: graphValidation.validationRef,
      graphValidationDigest: graphValidation.validationDigest,
      graphFunctionRef: resolution.graphFunctionRef,
      graphFunctionDigest: resolution.graphFunctionDigest,
      nodeRef: resolution.nodeRef,
      implementationBindingRef: resolution.implementationBindingRef,
      implementationRef: resolution.implementationRef,
      implementationBindingDigest: resolution.implementationBindingDigest,
      implementationDescriptorDigest: resolution.implementationDescriptorDigest,
      packageName: resolution.packageName,
      packageVersion: resolution.packageVersion,
      modulePath: resolution.modulePath,
      namedSymbol: resolution.namedSymbol,
      contracts: {
        input: resolution.inputContractRef,
        output: resolution.outputContractRef,
        failure: resolution.failureContractRef,
        refusal: resolution.refusalContractRef,
      },
      resolutionValidationRef: validation.validationRef,
      resolutionValidationDigest: validation.validationDigest,
      eventStoreDigest: store.digest(),
      eventCountUnchanged: store.readAll().length === eventCountBeforeResolution,
      mutation: {
        missingNodeRefusal: absentNode.code,
        missingPackagedImplementationRefusal: absentPackageImplementation.code,
        changedCatalogViewRefusal: changedView.code,
        changedBindingRefusal: alteredBinding.code,
        forgedCandidateRefusal: forgedResolution.diagnostics[0].code,
        changedBindingValidationRefusal: changedBindingValidation.diagnostics[0].code,
      },
      authorityBoundary: {
        implementationPubliclyCallable: false,
        implementationPackageExportRefused: true,
        implementationExecuted: false,
        runtimeTruthEmitted: false,
      },
    }, null, 2)}\n`,
    "utf8",
  );
});
