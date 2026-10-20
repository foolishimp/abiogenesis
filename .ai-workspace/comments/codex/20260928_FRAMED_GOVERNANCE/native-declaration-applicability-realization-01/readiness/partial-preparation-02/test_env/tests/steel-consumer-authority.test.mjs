import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";

const host = process.env.ABI5_STEEL02_AUTHORITY_INSTALL_HOST;
const callPath = process.env.ABI5_STEEL02_AUTHORITY_CALL_PATH;

test("installed admission producer preserves its native invalid-basis error contract", async t => {
  if (!host || !callPath) {
    t.skip("requires exact installed owner and retained actual create call"); return;
  }
  const packageRoot = join(host, "node_modules/@abiogenesis/typescript-tenant");
  const manifest = JSON.parse(await readFile(join(packageRoot, "package.json"), "utf8"));
  const product = await import(pathToFileURL(join(packageRoot, manifest.exports["./product"].import)));
  const call = JSON.parse(await readFile(callPath, "utf8")).invocation;
  const resource = call.resources.admissionAuthority;
  const packet = product.WORKSPACE_OPERATION_SOURCE_DECLARATIONS.create.clean;
  const construct = (authority, data) => product.constructCapabilityGrant(authority, authority.actorRef,
    packet.definitionKey.operationId, packet.metadata.capabilityRefs[0], {
      kind: "admission_capability_grant_construction_basis", fixedPacket: packet, data,
    });
  const original = await construct(resource.authority, resource.basis);
  assert.deepEqual(original, resource.grants[0], "fresh JSON preimages reproduce the actual installed grant");
  for (const [label, mutate] of [
    ["missing approval", authority => { delete authority.approval; }],
    ["denied approval", authority => { authority.approval.value.decision = "deny"; }],
    ["malformed authority", authority => { authority.unrecognized = true; }],
  ]) {
    const authority = structuredClone(resource.authority); mutate(authority);
    await assert.rejects(construct(authority, resource.basis), error =>
      error instanceof TypeError && error.cause?.name === "ValiError", label);
  }
  const data = structuredClone(resource.basis); data.unrecognized = true;
  await assert.rejects(construct(resource.authority, data), error =>
    error instanceof TypeError && error.cause?.name === "ValiError", "malformed closed data basis");
});
