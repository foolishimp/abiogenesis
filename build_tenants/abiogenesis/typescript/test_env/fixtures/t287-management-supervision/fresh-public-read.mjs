import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { constructInstalledPublicDefinitionCall } from "../../support/installed-public-definition-call.mjs";
const exec = promisify(execFile);

// Same installed read-call helper used by generic-job readback, selecting status
// and replay: a blocked Run has no terminal result for run_result to return.
export async function readSupervisionThroughFreshPublic({ scratch, installedRoot, artifactPath, call, outcome, mode }) {
  const load = name => import(pathToFileURL(join(installedRoot, "build/code/src", name + ".js")).href);
  const [product, abg, installedPublic] = await Promise.all(["product/index", "abg/index", "public/index"].map(load));
  const closed = outcome.resources.eventResource.closeHandoff;
  const originalSlots = call.invocation.invocationAuthority.slots;
  const environment = abg.projectExactPrefixWorkspaceEnvironment(closed.prefix, originalSlots.workspace_binding);
  assert.equal(environment.kind, "exact_prefix_workspace_environment");
  const abi = environment.productInstalls.find(install => install.productId === product.ABI5_PRODUCT_ID);
  const verified = await product.verifyProduct({ artifactPath, artifactRef: basename(artifactPath), expectedProductId: abi.productId,
    expectedPackageName: abi.packageName, expectedPackageVersion: abi.packageVersion, expectedArtifactDigest: abi.artifactDigest,
    expectedProductContentDigest: abi.productContentDigest, expectedManifestDigest: abi.manifestDigest });
  assert.equal(verified.disposition, "verified");
  const outputRoot = join(scratch, mode + "-fresh-reads"); await mkdir(outputRoot);
  const reads = {};
  for (const memberKey of ["run_status", "run_replay"]) {
    const packet = abg.ABG_PROJECT_READ_CONTRACTS[memberKey];
    const grants = packet.metadata.capabilityRefs.map(capabilityRef => product.constructCapabilityGrant(environment.workspaceAuthorityBasis,
      environment.workspaceBinding.authorizedActorRef, packet.definitionKey.operationId, capabilityRef,
      { admittedInstalls: environment.productInstalls, workspaceBinding: environment.workspaceBinding, fixedPacket: packet }));
    const slots = Object.fromEntries(Object.keys(originalSlots).map(key => [key, null]));
    Object.assign(slots, { workspace_binding: originalSlots.workspace_binding, product_set: originalSlots.product_set,
      dependency_lock: originalSlots.dependency_lock,
      capability_grants: { requiredCapabilityRefs: [...packet.metadata.capabilityRefs], grants: grants.map(grant => ({ ref: grant.grantRef, digest: grant.grantDigest })) } });
    const readCall = constructInstalledPublicDefinitionCall({ product, installedPublic, definitionContractCoordinates: verified.definitionContractCoordinates,
      contractCatalog: call.invocation.contractCatalog, ...packet.definitionKey,
      request: { caseKey: memberKey, source: { sourceKind: "run", sourceRef: outcome.ownerOutput.value.run.ref, sourceDigest: outcome.ownerOutput.value.run.digest },
        projectionBasis: { projectionBasisRef: closed.prefix.eventLogRef, projectionBasisDigest: closed.prefix.coordinateDigest },
        selector: memberKey === "run_replay" ? { kind: "ordinal_page", fromOrdinal: 0, limit: 10000 } : { kind: "none" } }, slots,
      resources: { kind: "abg_project_read_resource_assertion", schemaVersion: "5.0.0", eventResource: {
        kind: "reopen_abg_event_resource", schemaVersion: "5.0.0", closeHandoff: closed, handoffDigest: product.sha256Canonical(closed) } },
      requestRef: `public-request://management-supervision/${mode}/${memberKey}`,
      correlationRef: "correlation://management-supervision/fresh-read", eventTime: "2026-09-19T08:06:00.000Z", provenanceRefs: ["proof://management-supervision/fresh-public"] });
    const file = join(outputRoot, memberKey + ".jsonl");
    await writeFile(file, JSON.stringify({ kind: "abg_cli_transport_request", schemaVersion: "5.0.0",
      acquisition: { kind: "reopen", closeHandoff: closed }, invocation: readCall }) + "\n", { flag: "wx" });
    const output = await exec(process.execPath, [join(installedRoot, "build/code/src/public/cli.js"), "--jsonl", file],
      { cwd: outputRoot, env: { ...process.env, NODE_OPTIONS: "" }, timeout: 180000, maxBuffer: 128 * 1024 * 1024 });
    await writeFile(join(outputRoot, memberKey + "-stdout.json"), output.stdout, { flag: "wx" });
    await writeFile(join(outputRoot, memberKey + "-stderr.log"), output.stderr, { flag: "wx" });
    const transport = JSON.parse(output.stdout);
    assert.equal(transport.receipt.exitCode, 0, JSON.stringify(transport));
    assert.deepEqual(transport.receipt.resources.eventResource.closeHandoff.prefix, closed.prefix);
    reads[memberKey] = transport.receipt.ownerOutput.value.projection;
  }
  return reads;
}
