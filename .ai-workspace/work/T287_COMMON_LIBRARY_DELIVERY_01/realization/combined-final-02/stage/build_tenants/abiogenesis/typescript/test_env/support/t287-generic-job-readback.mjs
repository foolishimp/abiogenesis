import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { constructInstalledPublicDefinitionCall } from "./installed-public-definition-call.mjs";
const exec = promisify(execFile);

/** Existing installed CLI read operations in fresh processes. The retained
 * durable log is acquired read-only; no RuntimeEvent or replay is authored. */
export async function readGenericJobThroughFreshPublic({ scratch, installedRoot, artifactPath, call, outcome }) {
  const load = name => import(pathToFileURL(join(installedRoot, "build/code/src", name + ".js")).href);
  const [product, abg, installedPublic] = await Promise.all(["product/index", "abg/index", "public/index"].map(load));
  const closed = outcome.resources.eventResource.closeHandoff, bindingCoordinate = call.invocation.invocationAuthority.slots.workspace_binding;
  const environment = abg.projectExactPrefixWorkspaceEnvironment(closed.prefix, bindingCoordinate);
  assert.equal(environment.kind, "exact_prefix_workspace_environment");
  const abi = environment.productInstalls.find(i => i.productId === product.ABI5_PRODUCT_ID); assert.ok(abi);
  const verified = await product.verifyProduct({ artifactPath, artifactRef: basename(artifactPath), expectedProductId: abi.productId,
    expectedPackageName: abi.packageName, expectedPackageVersion: abi.packageVersion, expectedArtifactDigest: abi.artifactDigest,
    expectedProductContentDigest: abi.productContentDigest, expectedManifestDigest: abi.manifestDigest });
  assert.equal(verified.disposition, "verified");
  const outputRoot = await mkdtemp(join(tmpdir(), "generic-job-public-readback-"));
  const originalSlots = call.invocation.invocationAuthority.slots, reads = {};
  for (const memberKey of ["run_result", "run_replay"]) {
    const packet = abg.ABG_PROJECT_READ_CONTRACTS[memberKey], definition = installedPublic.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(d =>
      d.definitionKey.operationId === packet.definitionKey.operationId && d.definitionKey.memberKey === memberKey);
    assert.ok(definition);
    const grants = packet.metadata.capabilityRefs.map(capabilityRef => product.constructCapabilityGrant(environment.workspaceAuthorityBasis,
      environment.workspaceBinding.authorizedActorRef, packet.definitionKey.operationId, capabilityRef,
      { admittedInstalls: environment.productInstalls, workspaceBinding: environment.workspaceBinding, fixedPacket: packet }));
    const slots = Object.fromEntries(Object.keys(originalSlots).map(key => [key, null]));
    Object.assign(slots, { workspace_binding: bindingCoordinate, product_set: originalSlots.product_set, dependency_lock: originalSlots.dependency_lock,
      capability_grants: { requiredCapabilityRefs: [...packet.metadata.capabilityRefs], grants: grants.map(g => ({ ref: g.grantRef, digest: g.grantDigest })) } });
    const readCall = constructInstalledPublicDefinitionCall({ product, installedPublic, definitionContractCoordinates: verified.definitionContractCoordinates,
      contractCatalog: call.invocation.contractCatalog, ...packet.definitionKey,
      request: { caseKey: memberKey, source: { sourceKind: "run", sourceRef: outcome.ownerOutput.value.run.ref, sourceDigest: outcome.ownerOutput.value.run.digest },
        projectionBasis: { projectionBasisRef: closed.prefix.eventLogRef, projectionBasisDigest: closed.prefix.coordinateDigest },
        selector: memberKey === "run_replay" ? { kind: "ordinal_page", fromOrdinal: 0, limit: 10000 } : { kind: "none" } },
      slots, resources: { kind: "abg_project_read_resource_assertion", schemaVersion: "5.0.0", eventResource: {
        kind: "reopen_abg_event_resource", schemaVersion: "5.0.0", closeHandoff: closed, handoffDigest: product.sha256Canonical(closed) } },
      requestRef: `public-request://generic-job-mechanics.example/read/${memberKey}`,
      correlationRef: "correlation://generic-job-mechanics.example/fresh-read", eventTime: "2026-09-18T00:00:00.000Z", provenanceRefs: ["proof://generic-job-mechanics/fresh-public"] });
    const path = join(outputRoot, memberKey + ".jsonl");
    await writeFile(path, JSON.stringify({ kind: "abg_cli_transport_request", schemaVersion: "5.0.0",
      acquisition: { kind: "reopen", closeHandoff: closed }, invocation: readCall }) + "\n", { flag: "wx" });
    const output = await exec(process.execPath, [join(installedRoot, "build/code/src/public/cli.js"), "--jsonl", path],
      { cwd: outputRoot, env: { ...process.env, NODE_OPTIONS: "" }, timeout: 180000, maxBuffer: 128 * 1024 * 1024 });
    await writeFile(join(outputRoot, memberKey + "-stdout.json"), output.stdout, { flag: "wx" });
    await writeFile(join(outputRoot, memberKey + "-stderr.log"), output.stderr, { flag: "wx" });
    const transport = JSON.parse(output.stdout);
    assert.equal(transport.kind, "installed_definition_call_transport_result", JSON.stringify(transport));
    assert.equal(transport.receipt.exitCode, 0, JSON.stringify(transport));
    assert.deepEqual(transport.receipt.resources.eventResource.closeHandoff.prefix, closed.prefix);
    reads[memberKey] = transport.receipt;
  }
  assert.deepEqual(reads.run_result.ownerOutput.value.projection.result, outcome.ownerOutput.value.result);
  const replay = abg.projectRunSemanticReplayProjection(abg.selectValidatedRuntimeEventPrefix(abg.readRuntimeEventsAtDurablePrefix(closed.prefix)), outcome.ownerOutput.value.run.ref);
  assert.deepEqual(reads.run_replay.ownerOutput.value.projection.replay,
    { ref: replay.physicalCoordinates.scopedReplayRef, digest: replay.physicalCoordinates.scopedReplayDigest });
  const result = { kind: "generic_job_fresh_public_readback", scratch, outputRoot, prefix: closed.prefix, reads };
  await writeFile(join(outputRoot, "proof.json"), JSON.stringify(result, null, 2) + "\n", { flag: "wx" });
  return result;
}
