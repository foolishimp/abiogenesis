import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import { buildRoot, loadWorksiteOwner, worksiteFixture } from "../support/t287-generic-job-worksite.mjs";
import { acquireNewEmptyAppendSinkFixture } from "../support/new-empty-append-sink.mjs";

const product = await loadWorksiteOwner();
async function fixture(context) {
  const value = await worksiteFixture(product);
  context.after(() => fs.rm(value.scratch, { recursive: true, force: true }));
  return value;
}
const readBasis = env => ({ workspaceAuthorityBasis: env.workspaceAuthorityBasis, workspaceBinding: env.workspaceBinding });
const directoryIdentity = async path => { const stat = await fs.lstat(path); return `${stat.dev}:${stat.ino}`; };

test("generic worksite context retains complete bounded actual bytes, membership and identities without setup effects", async context => {
  const env = await fixture(context);
  const empty = await product.observeWorksiteContext({ ...readBasis(env), readRoots: ["."], maxFiles: 10, maxBytes: 100 });
  assert.equal(product.isWorksiteContextObservation(empty), true);
  assert.deepEqual(empty.entries.map(entry => [entry.relativePath, entry.state]), [[".", "directory"]]);
  assert.deepEqual(await fs.readdir(env.canonicalRoot), []);
  const absent = await product.observeWorksiteContext({ ...readBasis(env), readRoots: ["future/deep"], maxFiles: 10, maxBytes: 100 });
  assert.equal(product.isWorksiteContextObservation(absent), true);
  assert.deepEqual(absent.entries, [{ relativePath: "future/deep", state: "absent" }]);
  assert.deepEqual(await fs.readdir(env.canonicalRoot), []);
  await fs.mkdir(join(env.canonicalRoot, "existing"));
  await fs.writeFile(join(env.canonicalRoot, "existing", "README.txt"), "actual context\n");
  const input = { ...readBasis(env), readRoots: ["."], maxFiles: 10, maxBytes: 100 };
  const observed = await product.observeWorksiteContext(input);
  assert.equal(product.isWorksiteContextObservation(observed), true, JSON.stringify(observed));
  assert.equal(Object.isFrozen(observed.entries[0].members), true);
  assert.equal(Buffer.from(observed.entries[2].bytes, "base64").toString(), "actual context\n");
  assert.deepEqual(observed.entries[1].members, ["README.txt"]);
  const saved = JSON.parse(JSON.stringify(observed));
  await fs.writeFile(join(env.canonicalRoot, "existing", "README.txt"), "changed later\n");
  assert.equal(product.isWorksiteContextObservation(saved), true, "saved validation performs no live reads");
  assert.notEqual((await product.observeWorksiteContext(input)).observationDigest, observed.observationDigest);
  const forged = structuredClone(saved);
  forged.entries[2].bytes = Buffer.from("forged").toString("base64");
  assert.equal(product.isWorksiteContextObservation(forged), false);
  assert.equal((await product.observeWorksiteContext({ ...input, maxFiles: 2 })).kind, "worksite_effect_refusal");
  assert.equal((await product.observeWorksiteContext({ ...input, maxBytes: 2 })).kind, "worksite_effect_refusal");
});

test("nested assessed parents preserve existing directories then permit unchanged strict file replacement", async context => {
  const env = await fixture(context);
  await fs.mkdir(join(env.canonicalRoot, "src"));
  await fs.writeFile(join(env.canonicalRoot, "unrelated.txt"), "preserve unrelated work\n");
  await fs.mkdir(env.workspaceBinding.roots.productRoot);
  await fs.writeFile(join(env.workspaceBinding.roots.productRoot, "immutable.txt"), "preserve Product bytes\n");
  const identity = await directoryIdentity(join(env.canonicalRoot, "src"));
  const request = await env.request(["src/nested/main.js", "src/nested/test.js"]);
  assert.equal(product.isWorksiteFileParentsRequest(request), true, JSON.stringify(request));
  assert.deepEqual(request.ancestorObservations.map(row => row.relativePath), [".", "src", "src/nested"]);
  assert.deepEqual(await fs.readdir(join(env.canonicalRoot, "src")), [], "observation does not mkdir");
  const missingSubject = product.constructWorksiteSubject({ ...readBasis(env), relativePath: "src/nested/main.js",
    subjectUri: pathToFileURL(join(env.canonicalRoot, "src/nested/main.js")).href });
  assert.equal((await product.observeWorksiteSubject(env.workspaceAuthorityBasis, env.workspaceBinding, missingSubject)).code, "target_parent_missing", "old file O0 still refuses absent ancestors");
  const result = await env.create(request);
  assert.equal(product.isWorksiteFileParentsSuccess(result), true, JSON.stringify(result));
  assert.deepEqual(result.receipt.outcomes.map(row => row.disposition), ["existing", "existing", "created"]);
  assert.equal(await directoryIdentity(join(env.canonicalRoot, "src")), identity);
  assert.deepEqual(await fs.readdir(join(env.canonicalRoot, "src", "nested")), []);
  const subject = product.constructWorksiteSubject({ ...readBasis(env), relativePath: "src/nested/main.js",
    subjectUri: pathToFileURL(join(env.canonicalRoot, "src/nested/main.js")).href });
  const observation = await product.observeWorksiteSubject(env.workspaceAuthorityBasis, env.workspaceBinding, subject);
  assert.equal(observation.state, "absent");
  const replacement = product.constructWorksiteFileReplaceRequest({ ...readBasis(env), capabilityGrant: env.capabilityGrant, subject,
    territory: env.territory, predecessorObservation: observation, replacementBytes: Buffer.from("constructed file\n") });
  const authorization = product.constructWorksiteEffectAuthorization({ ...env, request: replacement });
  const replaced = await product.replaceWorksiteFile({ ...env, request: replacement, authorization });
  assert.equal(replaced.disposition, "committed", JSON.stringify(replaced));
  assert.equal(await fs.readFile(join(env.canonicalRoot, "src/nested/main.js"), "utf8"), "constructed file\n");
  const oldAuthorization = { ...result.authorization, effectUri: product.WORKSITE_FILE_REPLACE_EFFECT_URI };
  assert.equal(product.isWorksiteFileParentsAuthorization(oldAuthorization), false);
  assert.equal(product.isWorksiteEffectAuthorization(result.authorization), false);
  assert.equal(await fs.readFile(join(env.canonicalRoot, "unrelated.txt"), "utf8"), "preserve unrelated work\n");
  assert.equal(await fs.readFile(join(env.workspaceBinding.roots.productRoot, "immutable.txt"), "utf8"), "preserve Product bytes\n");
});

test("file parents refuse no mkdir authority, stale observations, traversal and protected territories before effects", async context => {
  const env = await fixture(context);
  assert.equal((await env.request(["src/nested/main.js"], { parentWriteRoots: [] })).kind, "worksite_effect_refusal");
  assert.equal((await env.request(["src/nested/main.js"], { parentWriteRoots: ["src/nested"] })).kind, "worksite_effect_refusal", "file or narrower grant cannot widen parent permission");
  assert.equal((await env.request(["../escape/file"])).kind, "worksite_effect_refusal");
  assert.equal((await env.request(["src", "src/file"])).kind, "worksite_effect_refusal", "one assessed file cannot also be another file's directory");
  const request = await env.request();
  await fs.mkdir(join(env.canonicalRoot, "src"));
  const stale = await env.create(request);
  assert.equal(stale.code, "stale_observation");
  assert.equal(product.isWorksiteFileParentsFailure(stale), true);
  assert.deepEqual(await fs.readdir(join(env.canonicalRoot, "src")), []);
  const protectedRequest = await env.request(["src/protected/file"]);
  const refused = await env.create(protectedRequest, { protectedInstallRoots: [join(env.canonicalRoot, "src/protected")] });
  assert.equal(refused.kind, "worksite_effect_refusal");
  assert.deepEqual(await fs.readdir(join(env.canonicalRoot, "src")), []);
});

test("context and parent observation reject symlinks, aliases, collisions and protected roots", async context => {
  const env = await fixture(context);
  await fs.mkdir(join(env.canonicalRoot, "real"));
  await fs.symlink("real", join(env.canonicalRoot, "alias"));
  assert.equal((await env.request(["alias/nested/file"])).code, "symlink_forbidden");
  assert.equal((await product.observeWorksiteContext({ ...readBasis(env), readRoots: ["alias"], maxFiles: 20, maxBytes: 100 })).code, "symlink_forbidden");
  await fs.writeFile(join(env.canonicalRoot, "collision"), "file");
  assert.equal((await env.request(["collision/nested/file"])).code, "target_parent_missing");
  await fs.link(join(env.canonicalRoot, "collision"), join(env.canonicalRoot, "hardlink"));
  assert.equal((await product.observeWorksiteContext({ ...readBasis(env), readRoots: ["hardlink"], maxFiles: 20, maxBytes: 100 })).code, "aliased_subject");
  assert.equal((await product.observeWorksiteContext({ ...readBasis(env), readRoots: ["real"], maxFiles: 20, maxBytes: 100,
    protectedInstallRoots: [join(env.canonicalRoot, "real")] })).kind, "worksite_effect_refusal");
});

test("later mkdir failure retains earlier real creations and first failure without rollback", async context => {
  const env = await fixture(context);
  const request = await env.request();
  const original = fs.mkdir;
  fs.mkdir = async (path, ...args) => {
    if (path === join(env.canonicalRoot, "src/nested")) throw Object.assign(new Error("later mkdir fault"), { code: "EIO" });
    return original(path, ...args);
  };
  syncBuiltinESMExports();
  let result;
  try { result = await env.create(request); } finally { fs.mkdir = original; syncBuiltinESMExports(); }
  assert.equal(product.isWorksiteFileParentsFailure(result), true, JSON.stringify(result));
  assert.equal(result.substrateCode, "EIO");
  assert.deepEqual(result.physicalOutcome.outcomes.map(row => [row.relativePath, row.disposition, row.identityState]), [[".", "existing", "known"], ["src", "created", "known"]]);
  assert.equal(await directoryIdentity(join(env.canonicalRoot, "src")), result.physicalOutcome.outcomes[1].fileIdentity);
  assert.deepEqual(await fs.readdir(join(env.canonicalRoot, "src")), []);
  assert.equal("receipt" in result, false);
});

test("identity verification failure after mkdir preserves known creation with UNKNOWN identity", async context => {
  const env = await fixture(context);
  const request = await env.request();
  const original = { mkdir: fs.mkdir, lstat: fs.lstat };
  let created = false;
  fs.mkdir = async (...args) => { const result = await original.mkdir(...args); created = true; return result; };
  fs.lstat = async (path, ...args) => {
    if (created && path === join(env.canonicalRoot, "src")) throw Object.assign(new Error("post-mkdir observation fault"), { code: "EIO" });
    return original.lstat(path, ...args);
  };
  syncBuiltinESMExports();
  let result;
  try { result = await env.create(request); } finally { Object.assign(fs, original); syncBuiltinESMExports(); }
  assert.equal(product.isWorksiteFileParentsFailure(result), true, JSON.stringify(result));
  assert.deepEqual(result.physicalOutcome.outcomes[1], { relativePath: "src", disposition: "created", identityState: "unknown", fileIdentity: null });
  assert.equal((await fs.lstat(join(env.canonicalRoot, "src"))).isDirectory(), true);
  const later = product.worksiteRefusal("filesystem_refused", "later wrapper diagnostic", null, "EBADF");
  const retained = product.worksiteFileParentsFailure(request, result.physicalOutcome.authorization, result.physicalOutcome.outcomes,
    product.worksiteRefusal(result.code, result.message, null, result.substrateCode), [later]);
  assert.equal(product.isWorksiteFileParentsFailure(retained), true);
  assert.equal(retained.substrateCode, "EIO");
  assert.equal(retained.physicalOutcome.diagnostics[0].substrateCode, "EBADF");
});

test("unexpected EEXIST is a conflict, not a claimed creation", async context => {
  const env = await fixture(context);
  const request = await env.request();
  const original = fs.mkdir;
  fs.mkdir = async (path, ...args) => {
    if (path === join(env.canonicalRoot, "src")) { await original(path); throw Object.assign(new Error("external EEXIST"), { code: "EEXIST" }); }
    return original(path, ...args);
  };
  syncBuiltinESMExports();
  let result;
  try { result = await env.create(request); } finally { fs.mkdir = original; syncBuiltinESMExports(); }
  assert.equal(result.code, "stale_observation");
  assert.equal(result.physicalOutcome.outcomes.some(row => row.disposition === "created"), false);
  assert.deepEqual(await fs.readdir(join(env.canonicalRoot, "src")), []);
});

test("additive C0 declaration retains old file effect and exact new parent judgment", async context => {
  const env = await fixture(context);
  const gtl = await import(pathToFileURL(join(buildRoot, "gtl/worksite_c0.js")).href);
  const digest = product.sha256Canonical({ fixture: "publication" });
  const artifact = { productId: "product://generic-worksite/test", artifactDigest: digest, productContentDigest: digest, productManifestDigest: digest,
    packageName: "@abiogenesis/typescript-tenant", packageVersion: "5.0.0-dev.286" };
  const old = gtl.constructWorksiteC0PublicationParts(artifact, gtl.WORKSITE_C0_IDS.moduleRef);
  assert.deepEqual(old.graphFunctions[0].effects, [product.WORKSITE_FILE_REPLACE_EFFECT_URI]);
  assert.equal(old.implementationBindings[0].namedSymbol, "realizeWorksiteFileReplace");
  const added = gtl.constructWorksiteFileParentsPublicationParts(artifact, gtl.WORKSITE_C0_IDS.moduleRef);
  assert.deepEqual(added.graphFunctions[0].effects, [product.WORKSITE_FILE_PARENTS_EFFECT_URI]);
  assert.equal(added.implementationBindings[0].namedSymbol, "realizeWorksiteFileParents");
  const request = await env.request();
  const result = await env.create(request);
  const relation = gtl.resolveWorksiteC0JudgmentRelation(gtl.WORKSITE_FILE_PARENTS_IDS.judgmentPredicateRef);
  assert.equal(relation.evaluate(request, result), true);
  assert.equal(relation.evaluate({ ...request, jobRef: "job://different" }, result), false);
});

test("unadmitted parents envelope retains completed or partial physical facts and cannot claim durable admission", async context => {
  const env = await fixture(context);
  const implementation = await import(pathToFileURL(join(buildRoot, "implementation/worksite_file_replace.js")).href);
  const eventStore = await import(pathToFileURL(join(buildRoot, "abg/event_store.js")).href);
  const sink = await acquireNewEmptyAppendSinkFixture(context, eventStore.createNewEmptyAppendSink, "abi5-parent-unadmitted-");
  const request = await env.request();
  const result = await env.create(request);
  const retained = implementation.unadmittedPhysicalCommit(env.cCall.cCallRef, result, sink.prefix);
  assert.equal(retained.kind, "unadmitted_physical_commit");
  assert.deepEqual(retained.ownerOutcome, result);
  assert.deepEqual(retained.refusedExpectedPrefix, sink.prefix);
  assert.equal(sink.prefix.prefixLength, 0);
  assert.equal(implementation.unadmittedPhysicalCommit("c-call:wrong", result, sink.prefix), null);
  const partial = product.worksiteFileParentsFailure(request, result.authorization, result.receipt.outcomes,
    product.worksiteRefusal("filesystem_refused", "post-owner bridge failure", null, "EIO"));
  assert.equal(implementation.unadmittedPhysicalCommit(env.cCall.cCallRef, partial, sink.prefix).ownerOutcome.substrateCode, "EIO");
  const refusedGuard = await implementation.realizeWorksiteFileParents(request, { executionAuthority: null }, {}, product.sha256Canonical(request));
  assert.equal(refusedGuard, null, "physical owner coordinates alone do not authorize the native leaf");
});
