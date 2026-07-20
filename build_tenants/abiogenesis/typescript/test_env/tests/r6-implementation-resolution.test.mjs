import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

import { setupInstalledRootInvocation } from "../support/root-installed-environment.mjs";

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("R6 resolves one exact packaged leaf and all declared contracts", async (context) => {
  const environment = await setupInstalledRootInvocation(context, root);
  const {
    product,
    validator,
    store,
    verified,
    consumerRoot,
    publication,
    programValidation,
    graphFunction,
    catalogView,
  } = environment;
  const node = graphFunction.template.nodes[0];
  const eventCountBeforeResolution = store.readAll().length;
  const resolution = product.resolveImplementation(
    catalogView,
    publication,
    programValidation,
    graphFunction.name,
    node.nodeRef,
  );
  assert.equal(resolution.kind, "implementation_resolution_candidate", JSON.stringify(resolution));
  const descriptor = product.rootPackagedImplementationDescriptor();
  const validation = validator.validateImplementationResolution(
    resolution,
    publication,
    programValidation,
    graphFunction,
    descriptor,
  );
  assert.equal(validation.kind, "implementation_resolution_validation", JSON.stringify(validation));
  assert.equal(resolution.computeRegime, "F_D");
  assert.equal(resolution.implementationBindingRef, node.implementationBindingRef);
  assert.equal(resolution.implementationRef, descriptor.implementationRef);
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
    graphFunction.name,
    "node://abiogenesis/conformance/missing@5",
  );
  assert.equal(absentNode.code, "implementation_absent");

  const changedView = product.resolveImplementation(
    { ...catalogView, selectedRows: [] },
    publication,
    programValidation,
    graphFunction.name,
    node.nodeRef,
  );
  assert.equal(changedView.code, "selection_mismatch");

  const alteredPublication = structuredClone(publication);
  alteredPublication.implementationBindings[0].modulePath = "build/code/src/implementation/other.js";
  const alteredBinding = product.resolveImplementation(
    catalogView,
    alteredPublication,
    programValidation,
    graphFunction.name,
    node.nodeRef,
  );
  assert.equal(alteredBinding.code, "invalid_program_validation");

  const forgedResolution = validator.validateImplementationResolution(
    structuredClone(resolution),
    publication,
    programValidation,
    graphFunction,
    descriptor,
  );
  assert.equal(forgedResolution.kind, "static_validation_refusal");
  assert.equal(forgedResolution.diagnostics[0].code, "raw_subject_mismatch");
  const changedDescriptorValidation = validator.validateImplementationResolution(
    resolution,
    publication,
    programValidation,
    graphFunction,
    { ...descriptor, modulePath: "build/code/src/implementation/other.js" },
  );
  assert.equal(changedDescriptorValidation.kind, "static_validation_refusal");
  assert.equal(changedDescriptorValidation.diagnostics[0].code, "invalid_reference");
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
      graphFunctionRef: resolution.graphFunctionRef,
      graphFunctionDigest: resolution.graphFunctionDigest,
      nodeRef: resolution.nodeRef,
      implementationBindingRef: resolution.implementationBindingRef,
      implementationRef: resolution.implementationRef,
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
        changedCatalogViewRefusal: changedView.code,
        changedBindingRefusal: alteredBinding.code,
        forgedCandidateRefusal: forgedResolution.diagnostics[0].code,
        changedDescriptorRefusal: changedDescriptorValidation.diagnostics[0].code,
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
