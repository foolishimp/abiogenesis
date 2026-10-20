import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

/** Re-enter the retained real installed fixture through Product and ABG owners. */
export async function loadSteelConsumerResolutionFixture({ product, abg, proofPath }) {
  const proof = JSON.parse(await readFile(proofPath, "utf8"));
  assert.ok(["installed_positive_passed", "installed_thread_passed", "resolver_fixture_ready"].includes(proof.disposition));
  const binding = proof.environment.workspaceBinding;
  const environment = abg.projectExactPrefixWorkspaceEnvironment(proof.closeHandoff.prefix,
    { ref: binding.bindingId, digest: binding.bindingDigest });
  assert.equal(environment.kind, "exact_prefix_workspace_environment");
  const catalog = product.CatalogOperationPort.admit({ kind: "catalog_admit_packet", schemaVersion: "5.0.0",
    memberKey: "admit", readinessBasis: proof.catalog.readinessBasis });
  assert.equal(catalog.kind, "graph_function_catalog", JSON.stringify(catalog));
  const resolve = async programRef => {
    const catalogView = programRef === proof.program.programRef
      ? product.narrowGraphFunctionCatalog(catalog, proof.catalogView.allowlist)
      : product.narrowGraphFunctionCatalog(catalog, catalog.entries.filter(row =>
        row.programMembershipRefs.includes(programRef)).map(row => row.handle));
    assert.equal(catalogView.kind, "graph_function_catalog_view");
    const loaded = await product.ProductExecutionResolutionPort.resolve({ catalog, catalogView,
      admittedInstalls: environment.productInstalls,
      verifyInstallAdmission: install => abg.hasAdmittedProductInstall(environment.artifactTruth, install),
      programRef, selection: { kind: "start", scope: "program", target: "next", until: "converged", rootMode: "direct" } });
    assert.equal(loaded.kind, "loaded_product_execution_resolution", JSON.stringify(loaded));
    return { catalogView, declarationClosure: loaded.declarationClosure,
      programValidation: loaded.programValidation, descriptors: loaded.packagedImplementations };
  };
  const interactionProgram = proof.consumerPublication.programs.find(program =>
    program.programRef !== proof.program.programRef);
  assert.ok(interactionProgram, "same admitted consumer owns the independent F_H declaration");
  return { primary: await resolve(proof.program.programRef), interaction: await resolve(interactionProgram.programRef) };
}
