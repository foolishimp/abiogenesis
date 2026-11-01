import assert from "node:assert/strict";
import { execFile, execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

import { ask, capturedStream, clientPath, CONSTRUCTION_GRAPH_FUNCTION, governedFixture, governedPolicyValue, governedSelectionFacts, loadGovernedContext, loadOwners,
  NATIVE_IMPLEMENTATION, packageRoot, packagedAdapterPath, sha, trackedAdapterPath, TESTING_FIELD } from "../support/t287-governed-context.mjs";

// Model-free and captured-protocol proof of the private governed lookup seam.
// No provider, network or paid model runs here; actual delivery by a native
// installed RC3 occurrence is a separate Root-controlled witness (B4 pending).
const gc = await loadGovernedContext();
const refusalCode = async (promise) => { try { await promise; return null; } catch (error) { return error.code ?? error.message; } };
const syncCode = (fn) => { try { fn(); return null; } catch (error) { return error.code ?? error.message; } };
const page = buffer => JSON.parse(buffer.toString("utf8"));
const runClient = (env, args) => new Promise(done => {
  const child = execFile(process.execPath, [clientPath, ...args], { env: { ...env }, encoding: "buffer" }, (error, stdout, stderr) =>
    done({ code: error ? error.code : 0, stdout, stderr: stderr.toString() }));
  child.stdin.end();
});

test("permitted keys return exact source bytes, identities, producer and provenance with paging", async () => {
  const { owner, authority, testingKey } = governedFixture(gc), lookup = gc.constructOwnedContextLookup(authority);
  assert.deepEqual(lookup.keys.map(k => [k.key, k.role, k.sourceKey]), [["late/0", "original_task", "rc3/task.md"], ["late/1", "original_rubric", "rc3/rubric.json"],
    ["late/2", "testing_result_field", testingKey], ["late/3", "worksite_source", "code/src/abg/governed_context.ts"]],
  "finite keys: task, rubric, Testing field, then granted worksite sources; the ungranted source is not a key");
  const task = page(await lookup.read({ requestId: "q1", key: "late/0", offset: 0, maxBytes: 4096 }));
  assert.ok(Buffer.from(task.content, "base64").equals(owner.files.get("rc3/task.md")));
  assert.equal(task.complete, true); assert.equal(task.source.digest, authority.original.task.digest); assert.equal(task.gc03.publication, "not_performed");
  assert.deepEqual(task.occurrence, { runId: owner.runId, cCallRef: "call://construction-01", actorInvocationRef: "actor://construction-01" });
  assert.equal(task.bindingDigest, lookup.bindingDigest);
  const rubric = page(await lookup.read({ requestId: "q2", key: "late/1", offset: 0, maxBytes: 4096 }));
  assert.ok(Buffer.from(rubric.content, "base64").equals(owner.files.get("rc3/rubric.json")));
  const testing = page(await lookup.read({ requestId: "q3", key: "late/2", offset: 0, maxBytes: 4096 }));
  assert.ok(Buffer.from(testing.content, "base64").equals(owner.result.fields.get(JSON.stringify(TESTING_FIELD))));
  assert.deepEqual(testing.source.producer, authority.testing.producer); assert.deepEqual(testing.source.provenance, authority.testing.provenance);
  const parts = [];
  for (let offset = 0, n = 0; offset !== null; n++) {
    const p = page(await lookup.read({ requestId: `p${n}`, key: "late/3", offset, maxBytes: 128 }));
    assert.equal(sha(Buffer.from(p.content, "base64")), p.pageDigest); assert.equal(p.complete, false); parts.push(Buffer.from(p.content, "base64")); offset = p.nextOffset;
  }
  assert.ok(Buffer.concat(parts).equals(owner.files.get("code/src/abg/governed_context.ts")), "pages reassemble the exact source");
  assert.equal(owner.hostCalls.length, 3 + parts.length, "every page consulted GC03");
  assert.ok(owner.hostCalls.every(call => call.bindingDigest === lookup.bindingDigest));
});

test("denied or unknown keys, extra members, invalid pages and duplicate requests refuse", async () => {
  const { authority } = governedFixture(gc), lookup = gc.constructOwnedContextLookup(authority);
  await lookup.read({ requestId: "ok", key: "late/0", offset: 0, maxBytes: 1 });
  for (const [request, code] of [
    [{ requestId: "ok", key: "late/0", offset: 0, maxBytes: 1 }, "request_duplicate"],
    [{ requestId: "k1", key: "late/4", offset: 0, maxBytes: 1 }, "key_denied"],
    [{ requestId: "k2", key: "code/src/outside.ts", offset: 0, maxBytes: 1 }, "key_denied"],
    [{ requestId: "k3", key: "late/0", offset: 0, maxBytes: 1, path: "/etc/passwd" }, "request_invalid"],
    [{ requestId: "k4", key: "late/0", offset: 0, maxBytes: 1, grant: "all" }, "request_invalid"],
    [{ requestId: "k5", key: "late/0", offset: -1, maxBytes: 1 }, "page_invalid"],
    [{ requestId: "k6", key: "late/0", offset: 0, maxBytes: 0 }, "page_invalid"],
    [{ requestId: "k7", key: "late/0", offset: 0, maxBytes: gc.GOVERNED_CONTEXT_MAX_PAGE_BYTES + 1 }, "page_invalid"],
    [{ requestId: "k8", key: "late/0", offset: 10_000, maxBytes: 1 }, "page_invalid"],
    [["late/0"], "request_invalid"]]) assert.equal(await refusalCode(lookup.read(request)), code, JSON.stringify(request));
});

test("owner construction fails closed on wrong role, foreign or tampered binding and unsupported composition", () => {
  const base = governedFixture(gc).authority;
  const cases = {
    "uat role": { role: { ...base.role, constructorRole: "uat" } },
    "missing selector": { role: { ...base.role, selectors: ["current_worksite"] } },
    "task outside readRoots": { context: { ...base.context, readRoots: ["code/src"] } },
    "grant omits rubric": { grant: { ...base.grant, sourceKeys: base.grant.sourceKeys.filter(k => k !== "rc3/rubric.json") } },
    "grant omits Testing field": { grant: { ...base.grant, sourceKeys: base.grant.sourceKeys.slice(0, 3) } },
    "foreign Run": { occurrence: { ...base.occurrence, runId: "run://abiogenesis/other" } },
    "tampered Testing digest": { testing: { ...base.testing, resultDigest: sha("tampered") } },
    "wrong producer": { testing: { ...base.testing, producer: { ...base.testing.producer, cCallRef: "call://other" } } },
    "absent field": { testing: { ...base.testing, fieldPath: ["commandResults", 9, "stdout"] } },
    "no provenance": { testing: { ...base.testing, provenance: [] } },
    "tampered task digest": { original: { ...base.original, task: { ...base.original.task, digest: sha("other") } } },
    "other GC03 release": { release: { ...base.release, identity: "urn:a-c:development-supplement:governed-context:gc02:1" } },
    "other GC03 inventory": { release: { ...base.release, inventorySha256: "0".repeat(64) } },
    "stale grant": { grant: { ...base.grant, grantDigest: sha("old-grant") } },
    "no host reader": { host: undefined },
  };
  for (const [label, patch] of Object.entries(cases)) {
    const { authority } = governedFixture(gc, patch);
    assert.notEqual(syncCode(() => gc.constructOwnedContextLookup(authority)), null, label);
  }
  const { authority, owner } = governedFixture(gc); owner.active = false;
  assert.equal(syncCode(() => gc.constructOwnedContextLookup(authority)), "occurrence_inactive");
});

test("source, grant, Testing producer and occurrence drift refuse on request; GC03 can only narrow", async () => {
  const fresh = () => { const f = governedFixture(gc); return { ...f, lookup: gc.constructOwnedContextLookup(f.authority) }; };
  let f = fresh(); f.owner.files.set("code/src/abg/governed_context.ts", Buffer.from("changed"));
  assert.equal(await refusalCode(f.lookup.read({ requestId: "a", key: "late/0", offset: 0, maxBytes: 1 })), "source_changed", "any bound source drift refuses every key");
  f = fresh(); f.owner.grantDigest = sha("revoked");
  assert.equal(await refusalCode(f.lookup.read({ requestId: "a", key: "late/0", offset: 0, maxBytes: 1 })), "grant_changed");
  f = fresh(); f.owner.result.resultDigest = sha("superseded");
  assert.equal(await refusalCode(f.lookup.read({ requestId: "a", key: "late/2", offset: 0, maxBytes: 1 })), "binding_stale");
  f = fresh(); f.owner.runId = "run://abiogenesis/other";
  assert.equal(await refusalCode(f.lookup.read({ requestId: "a", key: "late/0", offset: 0, maxBytes: 1 })), "binding_stale");
  f = fresh(); f.owner.active = false;
  assert.equal(await refusalCode(f.lookup.read({ requestId: "a", key: "late/0", offset: 0, maxBytes: 1 })), "occurrence_inactive");
  f = fresh(); f.owner.hostMode = "refuse";
  assert.equal(await refusalCode(f.lookup.read({ requestId: "a", key: "late/0", offset: 0, maxBytes: 1 })), "gc03_refused");
  f = fresh(); f.owner.hostMode = "disagree";
  assert.equal(await refusalCode(f.lookup.read({ requestId: "a", key: "late/0", offset: 0, maxBytes: 1 })), "gc03_disagreement");
  // Drift between the GC03 call and publication is caught by the publication-point reacquisition.
  f = governedFixture(gc); const inner = f.authority.host;
  const lookup = gc.constructOwnedContextLookup({ ...f.authority, host: async r => { const p = await inner(r); f.owner.grantDigest = sha("late-revoke"); return p; } });
  assert.equal(await refusalCode(lookup.read({ requestId: "a", key: "late/0", offset: 0, maxBytes: 1 })), "grant_changed");
});

test("the lookup is module-owned and nonserializable", () => {
  const { authority } = governedFixture(gc), lookup = gc.constructOwnedContextLookup(authority);
  assert.equal(gc.isOwnedContextLookup(lookup), true); assert.throws(() => JSON.stringify(lookup), /cannot be serialized/u);
  assert.equal(gc.isOwnedContextLookup(JSON.parse(JSON.stringify({ keys: lookup.keys }))), false);
  assert.equal(gc.isOwnedContextLookup({ ...lookup }), false); assert.equal(gc.isOwnedContextLookup(Object.create(Object.getPrototypeOf(lookup))), false);
  assert.ok(Object.isFrozen(lookup)); assert.equal(Object.keys(lookup).length, 0, "no enumerable authority");
});

test("endpoint is reserved inert, bound only to its actual occurrence, activated by process start, and retains every exchange", async () => {
  for (const ending of ["completed", "failed", "interrupted"]) {
    const { authority, owner } = governedFixture(gc), lookup = gc.constructOwnedContextLookup(authority);
    const endpoint = await gc.reserveGovernedContextEndpoint();
    const request = { requestId: `r-${ending}`, key: "late/0", offset: 0, maxBytes: 4096 }, wire = r => gc.governedContextWire(r) + "\n";
    assert.equal(endpoint.stage(), "reserved");
    assert.deepEqual(Object.keys(endpoint.environment).sort(), [gc.GOVERNED_CONTEXT_CLIENT_ENV, gc.GOVERNED_CONTEXT_ENDPOINT_ENV, gc.GOVERNED_CONTEXT_EXECUTABLE_ENV].sort());
    assert.equal(endpoint.invocation.client, clientPath, "the owner names the fixed installed client");
    assert.equal(endpoint.invocation.executable, process.execPath);
    const inert = page(await ask(endpoint.path, wire({ ...request, requestId: "inert" })));
    assert.equal(inert.code, "endpoint_inactive", "a reserved endpoint refuses before any binding");
    assert.throws(() => endpoint.activate("event://started"), e => e.code === "occurrence_inactive", "activation requires a bound lookup");
    assert.throws(() => endpoint.bind(lookup, { ...lookup.occurrence, actorInvocationRef: "actor://foreign" }), e => e.code === "binding_stale", "foreign occurrence");
    assert.throws(() => endpoint.bind({ ...lookup }, lookup.occurrence), e => e.code === "binding_stale", "a copied lookup is not owner state");
    endpoint.bind(lookup, lookup.occurrence); assert.equal(endpoint.stage(), "bound");
    assert.equal(page(await ask(endpoint.path, wire({ ...request, requestId: "bound" }))).code, "endpoint_inactive", "bound but not started still refuses");
    endpoint.activate("event://actor-process-started"); assert.equal(endpoint.stage(), "active");
    const served = await ask(endpoint.path, wire(request));
    assert.ok(Buffer.from(page(served).content, "base64").equals(owner.files.get("rc3/task.md")));
    const denied = page(await ask(endpoint.path, wire({ ...request, requestId: "d", key: "late/9" })));
    assert.equal(denied.kind, "governed_context_refusal"); assert.equal(denied.code, "key_denied"); assert.deepEqual(denied.occurrence, lookup.occurrence);
    const extra = page(await ask(endpoint.path, JSON.stringify({ ...request, requestId: "x", path: "/etc" }) + "\n"));
    assert.equal(extra.code, "request_invalid", "the endpoint accepts only the four request members");
    const t = endpoint.transcript();
    assert.deepEqual(t.map(e => [e.ordinal, e.stage, e.disposition]), [[1, "reserved", "refusal"], [2, "bound", "refusal"], [3, "active", "page"],
      [4, "active", "refusal"], [5, "active", "refusal"]], "refused and served exchanges are all retained");
    assert.ok(t[2].responseBytes.equals(served)); assert.ok(t[2].requestBytes.equals(Buffer.from(wire(request))), "complete request bytes retained");
    assert.equal(t[4].request, null, "an invalid request is retained with its raw bytes");
    await endpoint.close(ending);
    assert.equal(lookup.closed, ending); assert.equal(endpoint.stage(), "closed"); assert.equal(existsSync(endpoint.path), false, "endpoint socket is removed");
    await assert.rejects(ask(endpoint.path, wire({ ...request, requestId: "late" })), "no request is served after the actor lifecycle ends");
    assert.equal(await refusalCode(lookup.read({ ...request, requestId: "direct" })), "endpoint_closed");
    assert.throws(() => endpoint.bind(gc.constructOwnedContextLookup(governedFixture(gc).authority), lookup.occurrence), e => e.code === "binding_stale", "a closed endpoint never rebinds");
  }
});

test("the fixed installed client forwards exactly the four members and prints exact response bytes", async t => {
  if (!existsSync(clientPath)) { t.skip(`fixed client is not built at ${clientPath}`); return; }
  const { authority, owner } = governedFixture(gc), lookup = gc.constructOwnedContextLookup(authority), endpoint = await gc.reserveGovernedContextEndpoint();
  endpoint.bind(lookup, lookup.occurrence); endpoint.activate("event://actor-process-started");
  const request = { requestId: "c1", key: "late/0", offset: 0, maxBytes: 4096 };
  const served = await runClient(endpoint.environment, [JSON.stringify(request)]);
  assert.equal(served.code, 0, served.stderr);
  assert.ok(Buffer.from(page(served.stdout).content, "base64").equals(owner.files.get("rc3/task.md")));
  assert.ok(served.stdout.equals(endpoint.transcript()[0].responseBytes), "stdout is the exact retained response, no trailing newline");
  assert.ok(endpoint.transcript()[0].requestBytes.equals(Buffer.from(gc.governedContextWire(request) + "\n")), "client wire form is exact");
  assert.equal((await runClient(endpoint.environment, [JSON.stringify({ ...request, requestId: "x", path: "/etc" })])).code, 2);
  await endpoint.close("completed");
  assert.equal((await runClient(endpoint.environment, [JSON.stringify({ ...request, requestId: "late" })])).code, 3);
  assert.equal((await runClient({}, [JSON.stringify(request)])).code, 2, "without an owner-supplied endpoint the client refuses");
});

test("the owner prompt binds the exact JSON-escaped endpoint identity; command and environment stay unchanged", async () => {
  const { authority } = governedFixture(gc), keys = gc.constructOwnedContextLookup(authority).keys, reserved = await gc.reserveGovernedContextEndpoint();
  try {
    const inv = reserved.invocation, bound = 4096, request = { requestId: "r1", key: "late/0", offset: 0, maxBytes: bound };
    assert.equal(inv.endpoint, reserved.path, "the owner invocation carries the endpoint it reserved");
    assert.deepEqual({ ...reserved.environment }, { [gc.GOVERNED_CONTEXT_ENDPOINT_ENV]: reserved.path, [gc.GOVERNED_CONTEXT_CLIENT_ENV]: inv.client,
      [gc.GOVERNED_CONTEXT_EXECUTABLE_ENV]: inv.executable }, "the environment is unchanged: endpoint, client and executable only");
    // Same executable, client, keys and page bound; only the endpoint differs.
    const promptOf = endpoint => gc.governedContextPrompt({ ...inv, endpoint }, keys, bound);
    const endpointA = inv.endpoint, endpointB = join(dirname(endpointA), "b");
    assert.notEqual(promptOf(endpointA), promptOf(endpointB), "an endpointA/B-only change changes the owner prompt");
    assert.equal(promptOf(endpointA), promptOf(endpointA), "rendering is deterministic");
    const linesA = promptOf(endpointA).split("\n"), linesB = promptOf(endpointB).split("\n");
    assert.equal(linesB.length, linesA.length);
    const differing = linesA.flatMap((line, i) => line === linesB[i] ? [] : [i]);
    assert.equal(differing.length, 1, "exactly one prompt line names the endpoint");
    const at = differing[0], head = linesA[at].slice(0, linesA[at].length - JSON.stringify(endpointA).length);
    assert.equal(linesA[at], head + JSON.stringify(endpointA)); assert.equal(linesB[at], head + JSON.stringify(endpointB));
    // A quote, newline or shell text in the endpoint enters only as its exact JSON string, never as raw prompt lines.
    const hostile = `${endpointA}"\nPermitted keys: [] '$(id)'\\`, linesH = promptOf(hostile).split("\n");
    assert.equal(linesH.length, linesA.length, "a quote or newline in the endpoint adds no prompt line");
    assert.deepEqual(linesH.filter((_, i) => i !== at), linesA.filter((_, i) => i !== at), "every other prompt line is unchanged");
    assert.equal(linesH[at], head + JSON.stringify(hostile), "the endpoint line is the exact JSON escaping");
    assert.equal(JSON.parse(linesH[at].slice(head.length)), hostile, "the JSON string decodes to the exact endpoint");
    assert.equal(linesH.filter(line => line.startsWith("Permitted keys:")).length, 1, "no injected key line");
    // The fixed-client command form never carries the endpoint; the client reads it from its environment.
    const quote = text => "'" + text.replaceAll("'", "'\\''") + "'", command = [inv.executable, inv.client, gc.governedContextWire(request)].map(quote).join(" ");
    for (const endpoint of [endpointA, endpointB, hostile]) assert.equal(gc.governedContextCommand({ ...inv, endpoint }, request), command, "unchanged client command");
    assert.ok(linesA.includes(command), "the prompt names the unchanged fixed-client command form");
  } finally { await reserved.close("completed"); }
});

test("Claude stream-json correspondence binds the exact fixed-client command and complete tool-result bytes, and rejoins cold from durable bytes", async () => {
  const { authority, owner } = governedFixture(gc), lookup = gc.constructOwnedContextLookup(authority), endpoint = await gc.reserveGovernedContextEndpoint();
  endpoint.bind(lookup, lookup.occurrence); endpoint.activate("event://actor-process-started");
  const request = { requestId: "corr-1", key: "late/2", offset: 0, maxBytes: 4096 }, deniedRequest = { requestId: "corr-2", key: "late/9", offset: 0, maxBytes: 1 };
  const bytes = await ask(endpoint.path, gc.governedContextWire(request) + "\n"), deniedBytes = await ask(endpoint.path, gc.governedContextWire(deniedRequest) + "\n");
  const transcript = endpoint.transcript(), inv = endpoint.invocation, text = bytes.toString("utf8"), deniedText = deniedBytes.toString("utf8");
  await endpoint.close("completed");
  const denied = { toolUseId: "toolu_2", request: deniedRequest, result: deniedText };
  const verdict = (rows, t = transcript) => gc.verifyGovernedContextCorrespondence(capturedStream(rows, inv, gc), t, inv);
  const ok = verdict([{ toolUseId: "toolu_1", request, result: text }, denied]);
  assert.equal(ok.kind, "governed_context_correspondence");
  assert.deepEqual(ok.exchanges.map(e => [e.requestId, e.toolUseId, e.disposition]), [["corr-1", "toolu_1", "page"], ["corr-2", "toolu_2", "refusal"]]);
  assert.equal(verdict([{ toolUseId: "toolu_1", request, result: text, asArray: true }, denied]).kind, "governed_context_correspondence", "text-array content form");
  assert.equal(verdict([{ toolUseId: "toolu_1", request, result: text }]).code, "unjoinable", "a retained denial must also rejoin");
  assert.equal(verdict([{ toolUseId: "toolu_1", request }, denied]).code, "missing");
  assert.equal(verdict([{ toolUseId: "toolu_1", request, result: text.slice(0, -7) }, denied]).code, "truncated");
  assert.equal(verdict([{ toolUseId: "toolu_1", request, result: text.replace('"key":"late/2"', '"key":"late/3"') }, denied]).code, "altered");
  assert.equal(verdict([{ toolUseId: "toolu_1", request, result: text + "\n" }, denied]).code, "altered", "appended bytes are not the response");
  assert.equal(verdict([{ toolUseId: "toolu_1", request, result: text, isError: true }, denied]).code, "tool_error");
  // Marker or requestId substrings alone do not establish the fixed-client call.
  const marker = `echo governed_context_client.js ${JSON.stringify(request)}; cat /tmp/copy`;
  assert.equal(verdict([{ toolUseId: "toolu_1", request, result: text, command: marker }, denied]).code, "substituted", "substituted command");
  assert.equal(verdict([{ toolUseId: "toolu_1", request, result: text, command: gc.governedContextCommand({ ...inv, executable: "/usr/bin/env node" }, request) }, denied]).code,
    "substituted", "other executable");
  assert.equal(verdict([{ toolUseId: "toolu_1", request: { ...request, maxBytes: 4095 }, result: text }, denied]).code, "substituted", "changed page request field");
  assert.equal(verdict([{ toolUseId: "toolu_1", request, result: text, name: "Read" }, denied]).code, "substituted", "non-Bash tool");
  assert.equal(verdict([{ toolUseId: "toolu_1", request, result: text }, denied, { toolUseId: "toolu_3", request: { ...request, requestId: "corr-3" }, result: text }]).code,
    "substituted", "a fixed-client result without an owner exchange");
  assert.equal(verdict([{ toolUseId: "toolu_1", request, result: text }, denied], [{ ...transcript[0], responseDigest: sha("x") }, transcript[1]]).code, "stale");
  assert.equal(verdict([{ toolUseId: "toolu_1", request, result: text }, denied], [{ ...transcript[0], requestBytes: Buffer.from(JSON.stringify(request) + " \n") }, transcript[1]]).code,
    "stale", "request bytes must keep their digest");
  // Durable cold owner join from the admitted stdout bytes; the transcript is only an index.
  const stdout = Buffer.from(capturedStream([{ toolUseId: "toolu_1", request, result: text }, denied], inv, gc));
  const durable = gc.encodeGovernedContextTranscript({ occurrence: lookup.occurrence, bindingDigest: lookup.bindingDigest, invocation: inv, exchanges: transcript });
  const coldOwner = gc.reacquireOwnedContextLookupCold(authority);
  assert.equal(coldOwner.bindingDigest, lookup.bindingDigest, "cold reacquisition derives the same binding from owner facts");
  assert.equal(await refusalCode(coldOwner.read(request)), "endpoint_closed", "a cold owner lookup never serves");
  const ownerFacts = { occurrence: lookup.occurrence, invocation: inv, lookup: coldOwner };
  const cold = (extra = {}, ownerExtra = {}) => gc.coldVerifyGovernedContext({ stdout, stdoutDigest: sha(stdout), transcript: durable, owner: { ...ownerFacts, ...ownerExtra }, ...extra });
  const okCold = cold();
  assert.equal(okCold.kind, "governed_context_correspondence", "cold owner join");
  assert.deepEqual(okCold.exchanges.map(e => e.disposition), ["page", "refusal"], "dispositions derive from response bytes");
  assert.equal(gc.coldVerifyGovernedContext({ stdout, stdoutDigest: sha(stdout), transcript: durable }).code, "unjoinable", "no owner facts, no cold join");
  assert.equal(cold({}, { lookup: { ...coldOwner } }).code, "unjoinable", "a copied lookup is not owner authority");
  assert.equal(cold({ stdoutDigest: sha("other") }).code, "altered", "stdout must be the admitted artifact");
  assert.equal(cold({ transcript: durable.subarray(0, durable.length - 9) }).code, "missing", "truncated transcript");
  assert.equal(cold({ transcript: Buffer.from(durable.toString("utf8").replace(transcript[0].responseBytes.toString("base64"), deniedBytes.toString("base64"))) }).code,
    "stale", "tampered transcript bytes no longer match their digest");
  assert.equal(cold({}, { occurrence: { ...lookup.occurrence, actorInvocationRef: "actor://foreign" } }).code, "stale", "foreign occurrence");
  // Substituted invocation: the transcript names another client; the owner reconstructs the real one.
  const substituted = { ...inv, client: "/tmp/other/governed_context_client.js" };
  const subStdout = Buffer.from(capturedStream([{ toolUseId: "toolu_1", request, result: text, command: gc.governedContextCommand(substituted, request) },
    { ...denied, command: gc.governedContextCommand(substituted, deniedRequest) }], inv, gc));
  const subDurable = gc.encodeGovernedContextTranscript({ occurrence: lookup.occurrence, bindingDigest: lookup.bindingDigest, invocation: substituted, exchanges: transcript });
  assert.equal(cold({ stdout: subStdout, stdoutDigest: sha(subStdout), transcript: subDurable }).code, "substituted", "substituted invocation refuses");
  assert.equal(cold({}, { invocation: substituted }).code, "substituted", "owner-reconstructed invocation governs, not the transcript");
  // A real page relabeled as refusal in the transcript while anchored stdout stays unchanged.
  const relabeled = gc.encodeGovernedContextTranscript({ occurrence: lookup.occurrence, bindingDigest: lookup.bindingDigest, invocation: inv,
    exchanges: [{ ...transcript[0], disposition: "refusal" }, transcript[1]] });
  assert.equal(cold({ transcript: relabeled }).code, "altered", "page relabeled as refusal cannot bypass the page owner join");
  assert.equal(verdict([{ toolUseId: "toolu_1", request, result: text }, denied], [{ ...transcript[0], disposition: "refusal" }, transcript[1]]).code, "altered");
  assert.equal(verdict([{ toolUseId: "toolu_1", request, result: text }, denied], [transcript[0], { ...transcript[1], disposition: "page" }]).code, "altered", "refusal relabeled as page");
  // Owner drift: a foreign binding and a superseded Testing Result refuse.
  const foreign = gc.reacquireOwnedContextLookupCold(governedFixture(gc, { grant: { ...authority.grant, grantId: "grant://gc03/other" } }).authority);
  assert.equal(cold({}, { lookup: foreign }).code, "stale", "foreign binding");
  owner.result.resultDigest = sha("superseded-after-occurrence");
  assert.equal(syncCode(() => gc.reacquireOwnedContextLookupCold(authority)), "binding_stale", "cold reacquisition repeats the owner Result join");
  assert.equal(cold().code, "stale", "a previously reacquired owner still rejoins current held truth");
});

test("correspondence scans only command-bearing invocations: reporting-only and description-only marker mentions join directly and cold", async () => {
  const { authority } = governedFixture(gc), lookup = gc.constructOwnedContextLookup(authority), endpoint = await gc.reserveGovernedContextEndpoint();
  endpoint.bind(lookup, lookup.occurrence); endpoint.activate("event://actor-process-started");
  const request = { requestId: "corr-1", key: "late/2", offset: 0, maxBytes: 4096 }, deniedRequest = { requestId: "corr-2", key: "late/9", offset: 0, maxBytes: 1 };
  const bytes = await ask(endpoint.path, gc.governedContextWire(request) + "\n"), deniedBytes = await ask(endpoint.path, gc.governedContextWire(deniedRequest) + "\n");
  const transcript = endpoint.transcript(), inv = endpoint.invocation;
  await endpoint.close("completed");
  const rows = [{ toolUseId: "toolu_1", request, result: bytes.toString("utf8") }, { toolUseId: "toolu_2", request: deniedRequest, result: deniedBytes.toString("utf8") }];
  // Extra tool blocks go before the final result line, as the provider emits a StructuredOutput report last.
  const tool = (id, name, input, result) => [{ type: "assistant", message: { role: "assistant", content: [{ type: "tool_use", id, name, input }] } },
    ...(result === undefined ? [] : [{ type: "user", message: { role: "user", content: [{ type: "tool_result", tool_use_id: id, content: result }] } }])];
  const withTools = (stream, lines) => { const all = stream.trimEnd().split("\n");
    return [...all.slice(0, -1), ...lines.map(line => JSON.stringify(line)), all.at(-1)].join("\n") + "\n"; };
  const narrative = `Ran ${inv.client} (${gc.GOVERNED_CONTEXT_CLIENT_MARKER}) over ${inv.endpoint} (${gc.GOVERNED_CONTEXT_ENDPOINT_ENV}) for ${request.requestId} and ${deniedRequest.requestId}`;
  const reportOnly = tool("toolu_report", "StructuredOutput", { summary: narrative, gaps: [`request bytes for ${inv.client} via ${inv.endpoint} are platform-retained`] },
    "Structured output provided successfully");
  const describedOnly = tool("toolu_status", "Bash", { command: "git status --short", description: narrative }, "");
  const verdict = (lines, r = rows) => gc.verifyGovernedContextCorrespondence(withTools(capturedStream(r, inv, gc), lines), transcript, inv);
  const plain = verdict([]);
  assert.equal(plain.kind, "governed_context_correspondence");
  for (const [lines, label] of [[reportOnly, "narrative-only StructuredOutput summary naming client and endpoint"],
    [describedOnly, "unrelated Bash command whose description names client and endpoint"], [[...reportOnly, ...describedOnly], "both together"]]) {
    const joined = verdict(lines);
    assert.equal(joined.kind, "governed_context_correspondence", label);
    assert.deepEqual(joined.exchanges, plain.exchanges, `${label}: the same exact exchanges join and nothing else is claimed`);
  }
  // Reporting data never stands in for a call, and a command-bearing invocation stays a candidate whatever its tool name.
  assert.equal(verdict(reportOnly, rows.slice(1)).code, "unjoinable", "a report naming the client and requestId does not replace the missing call");
  assert.equal(verdict(tool("toolu_report", "StructuredOutput", { summary: narrative, command: gc.governedContextCommand(inv, request) })).code, "substituted",
    "a non-Bash tool_use carrying the fixed-client command is a stray command-bearing invocation");
  assert.equal(verdict(tool("toolu_peek", "Bash", { command: `ls -l '${inv.endpoint}'`, description: "list files" }, "")).code, "substituted",
    "an unmatched Bash command naming the endpoint is a substitution");
  assert.equal(verdict([...reportOnly, ...tool("toolu_3", "Bash", { command: gc.governedContextCommand(inv, { ...request, requestId: "corr-3" }) }, bytes.toString("utf8"))]).code,
    "substituted", "an extra fixed-client Bash call without an owner exchange still refuses beside a report");
  // Cold owner join over admitted stdout that carries the reporting-only additions next to the real exchanges.
  const durable = gc.encodeGovernedContextTranscript({ occurrence: lookup.occurrence, bindingDigest: lookup.bindingDigest, invocation: inv, exchanges: transcript });
  const ownerFacts = { occurrence: lookup.occurrence, invocation: inv, lookup: gc.reacquireOwnedContextLookupCold(authority) };
  const cold = stdout => gc.coldVerifyGovernedContext({ stdout, stdoutDigest: sha(stdout), transcript: durable, owner: ownerFacts });
  const reported = Buffer.from(withTools(capturedStream(rows, inv, gc), [...reportOnly, ...describedOnly]));
  const okCold = cold(reported);
  assert.equal(okCold.kind, "governed_context_correspondence", "cold owner join with reporting-only additions");
  assert.deepEqual(okCold.exchanges, plain.exchanges);
  assert.deepEqual(okCold.exchanges.map(e => [e.requestId, e.toolUseId, e.disposition]), [["corr-1", "toolu_1", "page"], ["corr-2", "toolu_2", "refusal"]]);
  assert.equal(cold(Buffer.from(withTools(capturedStream(rows.slice(1), inv, gc), reportOnly))).code, "unjoinable", "cold: a report does not replace the missing call");
  assert.equal(cold(Buffer.from(withTools(capturedStream(rows, inv, gc),
    tool("toolu_report", "StructuredOutput", { summary: narrative, command: gc.governedContextCommand(inv, request) })))).code, "substituted", "cold: command-bearing impostor");
});

test("owner selection authenticates one private Program policy member through the RunEnvironment owner", async () => {
  const { gtl, product } = await loadOwners();
  const policyBytes = Buffer.from(JSON.stringify(governedPolicyValue(gc)));
  const facts = governedSelectionFacts({ gtl, product, gc, policyBytes });
  const select = (over = {}) => gc.selectOwnedGovernedContext({ constructionTask: true, publication: facts.publication, program: facts.program, roleEvidence: facts.roleEvidence, ...over });
  const selected = select();
  assert.equal(selected.kind, "governed_context_selected");
  assert.equal(selected.policyRef, facts.memberRef); assert.equal(selected.policyDigest, sha(policyBytes));
  assert.equal(selected.policy.python.path, "/opt/python/bin/python3.12"); assert.equal(selected.role.contextPolicyRef, "policy://abiogenesis/default-library/constructor/context@5");
  // Unconfigured RC2 compatibility: no private key keeps the unchanged path.
  const plain = governedSelectionFacts({ gtl, product, gc, policyBytes, configured: false });
  assert.equal(gc.selectOwnedGovernedContext({ constructionTask: true, publication: plain.publication, program: plain.program, roleEvidence: plain.roleEvidence }).kind, "governed_context_not_selected");
  assert.equal(select({ constructionTask: false }).kind, "governed_context_not_selected");
  const code = over => { const r = select(over); return r.kind === "governed_context_refused" ? r.code : r.kind; };
  const role = facts.roleEvidence, row = role.sourceContent[0];
  for (const roleEvidence of [null, false, { ...role, role: "assessor" }, { ...role, contextPolicy: { ...role.contextPolicy, selectors: ["current_worksite"] } }])
    assert.equal(code({ roleEvidence }), "unsupported_composition", "configured selection without constructor role evidence refuses");
  assert.equal(code({ roleEvidence: { ...role, sourceContent: [] } }), "unsupported_composition", "missing policy member");
  assert.equal(code({ roleEvidence: { ...role, sourceContent: [row, row] } }), "unsupported_composition", "ambiguous policy member");
  assert.equal(code({ roleEvidence: { ...role, environmentRef: "declaration://abiogenesis/other" } }), "unsupported_composition", "foreign environment");
  assert.equal(code({ roleEvidence: { ...role, sourceContent: [{ ...row, text: row.text.replace("3.12.8", "3.12.9") }] } }), "source_changed", "altered member bytes");
  assert.equal(code({ roleEvidence: { ...role, sourceContent: [{ ...row, startByte: 1, text: row.text.slice(1) }] } }), "source_changed", "partial span");
  assert.equal(code({ program: { ...facts.program, policies: { ...facts.program.policies, [gc.GOVERNED_CONTEXT_POLICY_KEY]: "member://abiogenesis/other@5" } } }),
    "unsupported_composition", "policy key naming another member");
  assert.equal(code({ publication: { ...facts.publication, runEnvironments: [] } }), "unsupported_composition", "no verified RunEnvironment");
  const unsupported = value => { const f = governedSelectionFacts({ gtl, product, gc, policyBytes: Buffer.from(JSON.stringify(value)) });
    return gc.selectOwnedGovernedContext({ constructionTask: true, publication: f.publication, program: f.program, roleEvidence: f.roleEvidence }).code; };
  const v = governedPolicyValue(gc);
  assert.equal(unsupported({ ...v, invocation: { ...v.invocation, argv: ["-c", "print(1)"] } }), "unsupported_composition", "another invocation");
  assert.equal(unsupported({ ...v, invocation: { ...v.invocation, environment: { PYTHONPATH: "/tmp" } } }), "unsupported_composition", "invocation environment");
  assert.equal(unsupported({ ...v, release: { ...v.release, identity: "urn:other" } }), "unsupported_composition", "another GC03 release");
  assert.equal(unsupported({ ...v, grant: "everything" }), "unsupported_composition", "extra policy member");
  assert.equal(unsupported({ ...v, python: { ...v.python, path: "python3" } }), "unsupported_composition", "ambient Python");
});

test("owner execution gate verifies pinned bytes and invocation and intersects live role, capability, grant and currentness", async t => {
  const scratch = realpathSync(await mkdtemp(join(tmpdir(), "abg-gc-gate-"))); t.after(() => rm(scratch, { recursive: true, force: true }));
  const pythonPath = join(scratch, "python3"), adapterPath = join(scratch, "host_adapter.py");
  await writeFile(pythonPath, "pinned python bytes"); await writeFile(adapterPath, await readFile(trackedAdapterPath));
  const { gtl, product } = await loadOwners();
  // A pinned GC03 policy whose page limit (8,192) intersects the native 65,536 bound.
  const gc03PolicyPath = join(scratch, "gc03-policy.json"), gc03Policy = Buffer.from(JSON.stringify({ limits: { max_bytes: 8192 } }));
  await writeFile(gc03PolicyPath, gc03Policy);
  const value = governedPolicyValue(gc, { pythonPath, pythonDigest: sha("pinned python bytes"), adapterPath, adapterDigest: sha(await readFile(trackedAdapterPath)),
    gc03PolicyPath, gc03PolicyDigest: sha(gc03Policy) });
  const f = governedSelectionFacts({ gtl, product, gc, policyBytes: Buffer.from(JSON.stringify(value)) });
  const selection = gc.selectOwnedGovernedContext({ constructionTask: true, publication: f.publication, program: f.program, roleEvidence: f.roleEvidence });
  assert.equal(selection.kind, "governed_context_selected");
  const live = { role: "constructor", graphFunctionRef: CONSTRUCTION_GRAPH_FUNCTION, implementationRef: NATIVE_IMPLEMENTATION, actorRef: "actor://claude",
    capabilityGrantActorRef: "actor://claude", occurrenceCurrent: true, readableFiles: new Set(["rc3/task.md", "rc3/rubric.json", "code/src/abg/governed_context.ts"]) };
  const permit = gc.gateGovernedContextExecution(selection, live);
  assert.equal(permit.pageBound, 8192, "page bound is the GC03/native intersection");
  assert.deepEqual([permit.executable, ...permit.argv], [pythonPath, "-I", "-S", "-B", adapterPath]);
  const gate = over => syncCode(() => gc.gateGovernedContextExecution(selection, { ...live, ...over }));
  assert.equal(gate({ role: "assessor" }), "unsupported_composition");
  assert.equal(gate({ graphFunctionRef: "graph-function://abiogenesis/default-library/testing@5" }), "unsupported_composition");
  assert.equal(gate({ implementationRef: "implementation://abiogenesis/worksite-command-execution@5" }), "unsupported_composition", "another native capability");
  assert.equal(gate({ capabilityGrantActorRef: "actor://other" }), "grant_changed");
  assert.equal(gate({ occurrenceCurrent: false }), "occurrence_inactive");
  assert.equal(gate({ readableFiles: new Set(["rc3/task.md"]) }), "key_denied", "policy source outside the admitted Context");
  await writeFile(pythonPath, "substituted python bytes");
  assert.equal(gate({}), "unsupported_composition", "substituted Python bytes");
  await writeFile(pythonPath, "pinned python bytes");
  // Neither a forged permit-shaped value nor a read_context-only resource can start Python.
  const host = { current: () => true, installedRoot: scratch, policyPath: "/nonexistent", policyDigest: sha("p"), principalId: "p", derivation: () => null,
    callbacks: { reacquire: () => null, resolveArtifact: () => null, queryArtifacts: () => null } };
  assert.equal(syncCode(() => gc.pinnedGc03HostReader({ ...host, permit: { ...permit } })), "unsupported_composition");
  assert.equal(syncCode(() => gc.pinnedGc03HostReader({ ...host, permit: { operations: ["read_context"] } })), "unsupported_composition");
  const reader = gc.pinnedGc03HostReader({ ...host, permit, current: () => false });
  const source = { role: "original_task", sourceKey: "rc3/task.md", digest: sha("x") };
  assert.equal(await refusalCode(reader({ key: "late/0", offset: 0, maxBytes: 1, source, bindingDigest: sha("b") })), "occurrence_inactive", "stale permission refuses before start");
  await writeFile(adapterPath, "tampered adapter");
  assert.equal(await refusalCode(gc.pinnedGc03HostReader({ ...host, permit })({ key: "late/0", offset: 0, maxBytes: 1, source, bindingDigest: sha("b") })),
    "unsupported_composition", "adapter bytes are re-verified before every start");
});

test("pinned adapter verifies the installed released GC03 and never falls back to a checkout", async t => {
  const python = realpathSync((await new Promise(done => execFile("/bin/sh", ["-c", "command -v python3"], (e, out) => done(String(out).trim())))) || "/usr/bin/python3");
  const version = await new Promise(done => execFile(python, ["-I", "-S", "-c", "import sys;print('%d.%d.%d'%sys.version_info[:3])"], (e, out) => done(String(out).trim())));
  const adapter = existsSync(packagedAdapterPath) ? packagedAdapterPath : trackedAdapterPath;
  assert.ok((await readFile(adapter)).equals(await readFile(trackedAdapterPath)), "packaged adapter equals the tracked adapter");
  const run = request => new Promise(done => {
    const child = execFile(python, ["-I", "-S", "-B", adapter], { env: {} }, (e, out) => done(out.split("\n").filter(Boolean).map(l => JSON.parse(l))));
    child.stdin.end(JSON.stringify({ op: "read", identity: gc.GC03_SELECTED_RELEASE.identity, inventorySha256: gc.GC03_SELECTED_RELEASE.inventorySha256,
      pythonVersion: version, policyPath: "/nonexistent/policy.json", policySha256: "0".repeat(64), principalId: "p", derivation: () => null, key: "late/0", offset: 0, maxBytes: 1, ...request }) + "\n");
  });
  const scratch = realpathSync(await mkdtemp(join(tmpdir(), "abg-gc03-"))); t.after(() => rm(scratch, { recursive: true, force: true }));
  assert.equal((await run({ installedRoot: join(scratch, "absent") }))[0].refusal.code, "authority_missing");
  assert.equal((await run({ installedRoot: "relative/root" }))[0].refusal.code, "authority_missing");
  assert.equal((await run({ installedRoot: scratch, pythonVersion: "2.7.0" }))[0].refusal.code, "basis_stale");
  // A checkout-shaped tree claiming the identity, without the released inventory bytes, refuses.
  await mkdir(join(scratch, "contents/a_c/build_tenants/graphify/code"), { recursive: true });
  await writeFile(join(scratch, "contents/INVENTORY.json"), JSON.stringify({ files: {} }));
  await writeFile(join(scratch, "release-installation.json"), JSON.stringify({ identity: gc.GC03_SELECTED_RELEASE.identity, status: "RELEASED", inventorySha256: gc.GC03_SELECTED_RELEASE.inventorySha256 }));
  assert.equal((await run({ installedRoot: scratch }))[0].refusal.code, "basis_stale");
  const installed = join(homedir(), ".local/share/a_c/development-supplements/gc03-adb3d8ee-1");
  if (!existsSync(installed)) { t.diagnostic(`installed GC03 absent at ${installed}; released-path import not exercised`); return; }
  const real = realpathSync(installed);
  assert.equal((await run({ installedRoot: real, inventorySha256: "0".repeat(64) }))[0].refusal.code, "basis_stale");
  const reached = await run({ installedRoot: real });
  assert.equal(reached.length, 1); assert.ok(reached[0].refusal, "released GC03 is imported and refuses the unselected policy; no value is minted");
  assert.notEqual(reached[0].refusal.code, "authority_missing"); assert.equal(reached[0].result, undefined);
  // The TypeScript bridge starts Python only under an owner execution permit for the pinned bytes and fixed invocation.
  const { gtl, product } = await loadOwners();
  const gc03PolicyPath = join(scratch, "gc03-policy.json"), gc03Policy = Buffer.from(JSON.stringify({ limits: { max_bytes: 8192 } }));
  await writeFile(gc03PolicyPath, gc03Policy);
  const pinned = governedPolicyValue(gc, { pythonPath: python, pythonDigest: sha(await readFile(python)), adapterPath: adapter, adapterDigest: sha(await readFile(adapter)),
    gc03PolicyPath, gc03PolicyDigest: sha(gc03Policy) });
  pinned.python.version = version;
  const f = governedSelectionFacts({ gtl, product, gc, policyBytes: Buffer.from(JSON.stringify(pinned)) });
  const selection = gc.selectOwnedGovernedContext({ constructionTask: true, publication: f.publication, program: f.program, roleEvidence: f.roleEvidence });
  const permit = gc.gateGovernedContextExecution(selection, { role: "constructor", graphFunctionRef: CONSTRUCTION_GRAPH_FUNCTION, implementationRef: NATIVE_IMPLEMENTATION,
    actorRef: "actor://claude", capabilityGrantActorRef: "actor://claude", occurrenceCurrent: true,
    readableFiles: new Set(["rc3/task.md", "rc3/rubric.json", "code/src/abg/governed_context.ts"]) });
  const host = { permit, current: () => true, policyPath: "/nonexistent", policyDigest: "sha256:" + "0".repeat(64), principalId: "p",
    // An owner derivation reaches the adapter, which must still refuse the unselected policy.
    derivation: () => ({ kind: "gc03_host_lookup_derived", derivation: { request: {}, binding: {} }, lateAcquisition: [] }),
    callbacks: { reacquire: () => null, resolveArtifact: () => null, queryArtifacts: () => null } };
  const source = { role: "original_task", sourceKey: "rc3/task.md", digest: sha("x") };
  assert.match(String(await refusalCode(gc.pinnedGc03HostReader({ ...host, installedRoot: join(scratch, "absent") })({ key: "late/0", offset: 0, maxBytes: 1, source, bindingDigest: sha("b") }))), /gc03_refused/u);
  assert.match(String(await refusalCode(gc.pinnedGc03HostReader({ ...host, installedRoot: real })({ key: "late/0", offset: 0, maxBytes: 1, source, bindingDigest: sha("b") }))), /gc03_refused/u,
    "released GC03 refuses the unselected GC03 policy; nothing is minted");
});

// B04 deciding bridge discriminator. The released GC03 host contract
// (ac_support_core HostLookupBinding/_host_selection/read_source) defines the
// shapes; native owner facts alone supply the authority. Only the derivable
// part is proved here; the full HoG/prepared-leaf/actor chain stays a gap.
test("released GC03 bridge: owner-held {id,sha256} retained resolver, exact late SourceRefs and no abbreviated selection without a GC03 Context", () => {
  const field = Buffer.from("tests 3 pass\n"), task = Buffer.from("original task\n");
  const testingId = `result://abiogenesis/${"a".repeat(64)}#${JSON.stringify(TESTING_FIELD)}`;
  const held = new Map([["rc3/task.md", task], [testingId, field]]);
  const read = id => held.get(id) ?? null;
  const ref = gc.gc03RetainedSourceRef(testingId, sha(field));
  assert.deepEqual(ref, { engine: "retained-evidence", root: "evidence", path: testingId, object: null, sha256: sha(field).slice(7), selector: null });
  // GC03 read_source calls resolve_artifact({"id": path, "sha256": sha256}).
  assert.equal(gc.resolveGc03RetainedArtifact({ id: ref.path, sha256: ref.sha256 }, read), field.toString("base64"));
  for (const denied of [{ sourceKey: testingId, digest: sha(field) }, { id: "rc3/other.md", sha256: ref.sha256 }, { id: testingId, sha256: sha(task).slice(7) },
    { id: testingId, sha256: ref.sha256, extra: true }, { id: testingId, sha256: sha(field) }, { id: testingId }, null, "late/0"])
    assert.equal(gc.resolveGc03RetainedArtifact(denied, read), null, `refuses ${JSON.stringify(denied)}`);
  held.set(testingId, Buffer.from("changed after selection\n"));
  assert.equal(gc.resolveGc03RetainedArtifact({ id: ref.path, sha256: ref.sha256 }, read), null, "stale owner-held bytes refuse");
  const sources = [{ key: "late/0", role: "original_task", sourceKey: "rc3/task.md", digest: sha(task) },
    { key: "late/1", role: "testing_result_field", sourceKey: testingId, digest: sha(field) }];
  const late = sources.map(s => gc.gc03RetainedSourceRef(s.sourceKey, s.digest));
  // Declared activation-template shape: owner-filled positions are null; the testing late position is null.
  const template = { kind: "abiogenesis_gc03_host_activation_request_template", policySha256: sha("gc03-policy").slice(7),
    request: { schema: "a_c.fd-support.request/1", id: null, operation: "context.assemble", arguments: {
      packet: { activation: { id: null }, frame: { id: null }, subject_basis: { subject: null, observations: null, method_profile: { id: "urn:m", sha256: "2".repeat(64) } },
        actor_authority: { actor_id: "actor-1" }, profile_additions: { worker: { operation_grant_id: "work", mutation_subject: null } } },
      models: [], sources: [], late_acquisition: [late[0], null], envelope: { capacity_bytes: null } } } };
  const facts = { owner: { id: "policy://abiogenesis/rc3/governed-context@1", digest: sha("policy") }, admission: { id: "invocation-admission://x", digest: sha("adm") },
    epoch: { id: "run://x", digest: sha("prefix") }, ownerCoordinates: { runId: "run://x", cCallRef: "c-call://x" },
    principalId: "abg-constructor", actorId: "actor-1", grantId: "work", executorId: "gc03-python-host-adapter", policyDigest: sha("gc03-policy"), sources, template,
    activation: { requestId: "occ#context.assemble", activationId: "occ", frameId: "frame", subject: { id: "c-call://x", digest: sha("task") } } };
  const derived = gc.deriveGc03HostLookup(facts);
  assert.equal(derived.kind, "gc03_host_lookup_derived");
  assert.deepEqual(derived.lateAcquisition, late);
  const req = derived.derivation.request, packet = req.arguments.packet;
  assert.equal(req.id, "occ#context.assemble"); assert.equal(packet.activation.id, "occ"); assert.equal(packet.frame.id, "frame");
  assert.deepEqual(packet.subject_basis.subject, { id: "c-call://x", sha256: sha("task").slice(7) });
  assert.deepEqual(packet.profile_additions.worker.mutation_subject, packet.subject_basis.subject);
  assert.deepEqual(packet.subject_basis.observations, [], "no a_c Observation is selected: an explicit empty list");
  assert.deepEqual(req.arguments.late_acquisition, late);
  assert.deepEqual(Object.keys(derived.derivation.binding).sort(), ["actor_id", "admission", "context_id", "epoch", "executor_id", "grant_id", "operation",
    "owner", "owner_coordinates", "policy_sha256", "principal_id"]);
  assert.deepEqual(derived.derivation.binding.admission, { id: "invocation-admission://x", sha256: sha("adm").slice(7) }, "published admission digest, not a derived hash");
  assert.equal("selection" in derived, false, "context, subject, basis and Recheck identity come only from the released computation");
  assert.equal(gc.gc03Digest({ b: 1, a: "é" }), createHash("sha256").update(Buffer.from('{"a":"é","b":1}', "utf8")).digest("hex"));
  // Absent template, foreign policy, actor or grant, and tampered late sources fail closed.
  assert.equal(gc.deriveGc03HostLookup({ ...facts, template: null }).code, "authority_missing");
  assert.equal(gc.deriveGc03HostLookup({ ...facts, policyDigest: sha("other") }).code, "authority_missing");
  assert.equal(gc.deriveGc03HostLookup({ ...facts, actorId: "actor-2" }).code, "basis_stale");
  const swap = structuredClone(template); swap.request.arguments.late_acquisition = [ref, null];
  assert.equal(gc.deriveGc03HostLookup({ ...facts, template: swap }).code, "basis_stale");
  const prefilled = structuredClone(template); prefilled.request.arguments.packet.subject_basis.observations = [{ id: "result://x", sha256: "0".repeat(64) }];
  assert.equal(gc.deriveGc03HostLookup({ ...facts, template: prefilled }).code, "basis_stale", "no raw Result reference may enter observations");
  // Page bound: the intersection refuses a larger request; it is never clamped.
  assert.throws(() => gc.admitGovernedContextRequest({ requestId: "r", key: "late/0", offset: 0, maxBytes: 8193 }, 8192), e => e.code === "page_invalid");
  assert.equal(gc.admitGovernedContextRequest({ requestId: "r", key: "late/0", offset: 0, maxBytes: 8192 }, 8192).maxBytes, 8192);
  assert.match(gc.governedContextPrompt({ executable: "/n", client: "/c", endpoint: "/e" }, [], 8192), /maxBytes \(1\.\.8192; a larger value is refused/u);
});

// Declared B05 GC03 recipe (make-gc03-candidate.py, make-activation-template.py):
// pinned host prerequisites, the released method profile, the native work
// identities and the custody digests of its released STDO and operator sources.
const GC03_RECIPE = Object.freeze({
  python: "/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12",
  pythonSha256: "a7f5b535d61d1c7326824204ac80f045a97a652abb154421e2c74fcc365a3539", pythonVersion: "3.12.8",
  release: join(homedir(), ".local/share/a_c/development-supplements/gc03-adb3d8ee-1"),
  profile: "urn:a-c:fd-support:method:stdo-3.0.2:executive:1",
  actor: "actor://abiogenesis/worksite/native-work@5", graph: "graph-function://abiogenesis/worksite/native-work@5",
  implementation: "implementation://abiogenesis/worksite/native-work-fp@5",
  principal: "constructor", grant: "witness-context-read", executor: "gc03-python-host-adapter",
  modules: ["ac_support_core", "ac_support_composition", "ac_graph", "ac_formal_gate", "ac_support_effects", "ac_support", "ac_context_presentation"],
  standards: { "ACTIVATION.md": "56109ffa2e8ec6f158e6dbd0b387fededa685abc100a288ea88525854a78441d",
    "EVALUATION.md": "478fd21feda72d64e62a92f970b37bade3f9aadfb17c73649cdb1a7866581eff",
    "AXIOMATIC_CALCULUS.md": "b39c45fd86b8f9add7d196b2974a8e5f75bf4a327cf796e362716a6b4f5776d5" },
  authority: { "OPERATOR.md": "894892f17553b4c7c7781aacae7e436f92c43365edeb5399b10cfba0f7ddd896",
    "GC03_DELEGATION.md": "cc2cc76da9c74c19a098b3401a8addc8317b8bc1afebd2b5ccdbf5dac5eb4196",
    "task.md": "1c1adfe5421360f707960ff792ece7b30991ad96eed6ef30f0a985d6f59c5955",
    "rubric.json": "540d29973a92bcb1dd2782dac8be66ce9f602846e5aa60917169a9ab8f35ab25" },
});
// The recipe's operator authority sources, byte-exact with the custody digests above.
const GC03_OPERATOR_SOURCES = Object.freeze({
  "OPERATOR.md": ["# RC2 builds RC3: current operator allocation",
    "",
    "Exact owner instruction: “review, fix, and continue on using rc2 being used to",
    "build rc3”. Root's interpretation is selection of necessary local RC2",
    "development deployment and the reviewed GC-03 dependency, then a bounded",
    "RC2-built RC3 repair. No external publication or whole-product/native",
    "qualification is inferred. The GC-03 exact local release/install decision is",
    "separately recorded when actually made; a prepared plan is not that decision.",
    "",
    "Root Codex is the sole ABI operator proxy. This carrier supplies declarations",
    "and exact-bound operator tooling; ABG must author any Product change through",
    "its own admitted lifecycle. The proxy does not fabricate native success,",
    "human responses, events, independence, or acceptance. The original RC2 native",
    "Run 009 remains blocked and its UAT unmet; the local candidate remains",
    "unqualified. Preserve all original criteria, existing failures, earlier",
    "preimages, observations, cost and unknowns.",
    "",
    "The [preparation contract](PREPARATION.md) names the Product basis, exact",
    "source/artifact, retained evidence, write scope and excluded effects. Fresh",
    "RC2 install, verification, runtime setup, lock, catalog, workspace authority,",
    "resources and event histories must bind RC2, not a renamed RC1 configuration.",
    "No actual install, runtime setup, native call or provider launch is authorized",
    "by this file alone; Executive selection precedes those effects. When the repair",
    "contract is written, distinguish the verbatim owner instruction from",
    "Root-derived acceptance criteria and do not add a selector requirement to the",
    "original outcome.",
    ""].join("\n"),
  "GC03_DELEGATION.md": ["# Operator declaration for the governed-lookup witness",
    "",
    "Owner instruction: “review, fix, and continue on using rc2 being used to build rc3”.",
    "",
    "Root selected completing the GC03 policy/executor input through the existing verified ABG Program-policy member, preserving native event authority and without fabricated a_c preflight, observations or receipts. The bounded witness reads the native current-Run Testing stdout, the original task and original rubric with denied-key refusal; it preserves their original criteria and obtains actual native currentness and permissions from the owner.",
    "",
    "This is a source-backed operator selection, not an admitted native grant, event, Result, provider preflight, publication, Product acceptance or release. The native owner must authenticate the actual occurrence, actor, grant, source and installed executor; the GC03 callback prepares acquisition evidence only.",
    ""].join("\n"),
  "task.md": ["# Native governed-lookup witness",
    "",
    "First run the declared Testing command on the provided diagnostic fixture without claiming an earlier subject Result. Then, in native Construction, use the installed governed-lookup client to retrieve the current Run's admitted Testing stdout, the original task and the original rubric. Read the complete permitted source bytes in bounded pages and use their actual contents to describe the observed failure. Request a denied key and report the refusal without falling back to another source or widening authority. Preserve the original task and rubric when explaining the result.",
    "",
    "If a source, permission, fixed client, complete response, or producer relationship is unavailable, report the specific gap; do not guess. Identify the current Run's Testing Result and producer from the delivered evidence. Report what the retrieved bytes support and what remains unproven.",
    ""].join("\n"),
  "rubric.json": ["{",
    "  \"outcome\": \"A bounded native Construction lookup over the current Run's admitted diagnostic evidence and original task basis\",",
    "  \"criteria\": [",
    "    {\"id\":\"W1\",\"criterion\":\"The first selected Testing call has no claimed prior subject Result and measures the exact provided diagnostic fixture as its actual stdout in this Run.\"},",
    "    {\"id\":\"W2\",\"criterion\":\"Native Construction uses the fixed installed lookup client to retrieve the complete current-Run Testing stdout and original task and rubric, with their actual producer, source and byte identities.\"},",
    "    {\"id\":\"W3\",\"criterion\":\"An explicitly denied key is refused, without authority widening or fallback; complete request and response bytes and their Claude tool-result correspondence are retained and cold-joinable.\"},",
    "    {\"id\":\"W4\",\"criterion\":\"The actor identifies the actual failure supported by the retrieved bytes, conserves the original task and rubric, and distinguishes observation from unproven behavior.\"},",
    "    {\"id\":\"W5\",\"criterion\":\"Actual admitted Testing, Construction and transport evidence is preserved with honest gaps and native parent status; the witness does not claim overall UAT or Product qualification.\"}",
    "  ]",
    "}",
    ""].join("\n"),
});

/**
 * The declared B05 recipe, ported into one fresh test-local directory. Every
 * source is copied from its owner and verified there: the tracked Product
 * definition, the resolved STDO 3.0.2 release, the installed released GC03
 * inventory and the embedded operator authority. Python and the candidate
 * adapter are re-pinned from their actual bytes. The late task and rubric are
 * the actual original sources of this Run; late/2 stays an owner-filled null.
 */
async function materializeGc03Recipe({ root, repoRoot, stdoRoot, adapterPath, product, ids, task, rubric }) {
  const R = GC03_RECIPE, hex = bytes => createHash("sha256").update(bytes).digest("hex"), canonical = value => Buffer.from(product.canonicalJson(value), "utf8");
  assert.deepEqual([ids.workerActorRef, ids.graphFunctionRef, ids.implementationRef], [R.actor, R.graph, R.implementation], "recipe names the actual native work identities");
  const sources = join(root, "governed-context-sources"), held = new Map();
  const place = async (rootId, path, bytes, expected) => {
    if (expected !== undefined) assert.equal(hex(bytes), expected, `${rootId}/${path} differs from its custody digest`);
    const target = join(sources, rootId, path); await mkdir(dirname(target), { recursive: true }); await writeFile(target, bytes, { flag: "wx" });
    held.set(`${rootId}/${path}`, hex(bytes));
  };
  await place("abg", "stdo_abiogenesis.json", await readFile(join(repoRoot, "stdo_abiogenesis.json")));
  await place("abg", "specification/PRODUCT.md", await readFile(join(repoRoot, "specification/PRODUCT.md")));
  for (const [name, digest] of Object.entries(R.standards)) await place("method", name, await readFile(join(stdoRoot, "standards", name)), digest);
  // Installed released GC03: installation record, inventory, design sources and code members.
  const release = realpathSync(R.release); assert.equal(release, R.release, "installed GC03 root is canonical");
  const installation = JSON.parse(await readFile(join(release, "release-installation.json"), "utf8")), inventoryBytes = await readFile(join(release, "contents/INVENTORY.json"));
  assert.deepEqual([installation.identity, installation.status, installation.inventorySha256, hex(inventoryBytes)],
    [gc.GC03_SELECTED_RELEASE.identity, "RELEASED", gc.GC03_SELECTED_RELEASE.inventorySha256, gc.GC03_SELECTED_RELEASE.inventorySha256], "selected released GC03");
  const inventory = JSON.parse(inventoryBytes.toString("utf8")).files;
  const released = async member => { const bytes = await readFile(join(release, "contents", member));
    assert.equal(hex(bytes), inventory[member]?.sha256, `released GC03 member ${member}`); return bytes; };
  await place("method", "fd-method-stdo-3.0.2.json", await released("a_c/build_tenants/graphify/design/fd-method-stdo-3.0.2.json"));
  await place("authority", "fd-support-host-lookup.md", await released("a_c/build_tenants/graphify/design/fd-support-host-lookup.md"));
  for (const [name, text] of Object.entries(GC03_OPERATOR_SOURCES)) await place("authority", name, Buffer.from(text, "utf8"), R.authority[name]);
  const gcPaths = ["release-installation.json", "contents/INVENTORY.json", ...R.modules.map(n => `contents/a_c/build_tenants/graphify/code/${n}.py`)];
  for (const path of gcPaths.slice(2)) await released(path.slice("contents/".length));
  const pythonBytes = await readFile(R.python), adapterBytes = await readFile(adapterPath);
  assert.equal(realpathSync(R.python), R.python, "pinned Python path is canonical"); assert.equal(hex(pythonBytes), R.pythonSha256, "selected Python bytes");
  const fileRef = (rootId, path, digest) => ({ engine: "workspace-regular-file", root: rootId, path, object: null, sha256: digest, selector: null });
  const ref = (rootId, path) => fileRef(rootId, path, held.get(`${rootId}/${path}`));
  const method = ref("method", "fd-method-stdo-3.0.2.json"), role = ref("method", "ACTIVATION.md"), definition = ref("abg", "stdo_abiogenesis.json"),
    owner = ref("abg", "specification/PRODUCT.md"), authority = ref("authority", "GC03_DELEGATION.md"), outcome = ref("authority", "task.md"),
    host = ref("authority", "fd-support-host-lookup.md"), evaluation = ref("method", "EVALUATION.md"), algebra = ref("method", "AXIOMATIC_CALCULUS.md");
  const releaseRefs = await Promise.all(gcPaths.map(async path => fileRef("gc03", path, hex(await readFile(join(release, path))))));
  const workspace = (path, paths) => ({ path, read_scope: paths.map(p => ({ path: p, kind: "file" })), kind: "workspace", writable: false });
  const evidence = join(root, "runtime-001/resources/archives/gc03-host-only"), worksite = join(root, "runtime-001/worksite");
  const mechanism = { id: "abiogenesis-native-held-store/1", source: host, implementation_sha256: hex(adapterBytes) };
  const policy = { schema: "a_c.fd-support.policy/1", id: "urn:abiogenesis:witness:gc03-policy:1",
    product: { definition_id: "urn:stdo:product-definition:abiogenesis", definition, authority_binding: { definition_locator: "/reference_frame_bases/0/authority/0",
      owner_record: owner, mechanism, result_surface: { root: evidence, namespace: "prepared-lookup", consumer: "native-abg-owner" },
      scope: "native host-owned prepared context.read; no provider preflight" } },
    method_profile: { id: R.profile, sha256: method.sha256, source: method },
    sources: { abg: workspace(join(sources, "abg"), ["stdo_abiogenesis.json", "specification/PRODUCT.md"]),
      method: workspace(join(sources, "method"), ["fd-method-stdo-3.0.2.json", "ACTIVATION.md", "EVALUATION.md", "AXIOMATIC_CALCULUS.md"]),
      authority: workspace(join(sources, "authority"), ["OPERATOR.md", "GC03_DELEGATION.md", "task.md", "rubric.json", "fd-support-host-lookup.md"]),
      python: workspace(dirname(R.python), [basename(R.python)]), adapter: workspace(dirname(adapterPath), [basename(adapterPath)]), gc03: workspace(release, gcPaths) },
    principals: { [R.principal]: { actor_id: R.actor, role: "Worker", family: "abiogenesis-native-work", authorship: "native-construction",
      operations: ["context.assemble", "context.read"], role_binding: role, role_transition: null } },
    grants: { [R.grant]: { id: R.grant, authority_sources: [authority], outcome: { id: "witness-original-task", source: outcome }, principals: [R.principal],
      targets: [R.principal], operations: ["context.read"], tools: ["context.read"], executors: [R.executor], territory: [], preconditions: [],
      admission: { mechanism_id: mechanism.id, mechanism_source: host, authority_source: authority, required_predicates: [], allowed_override_sources: [] },
      notification_sink: null } },
    predicates: {}, operators: {},
    executors: { [R.executor]: { id: R.executor, executable: { path: R.python, sha256: R.pythonSha256 }, argv: [R.python, "-I", "-S", "-B", adapterPath],
      dependencies: [fileRef("python", basename(R.python), R.pythonSha256), fileRef("adapter", basename(adapterPath), hex(adapterBytes)), ...releaseRefs],
      cwd: worksite, environment: {}, actor_id: R.actor, settings: {}, tools: ["context.read"],
      effect_scope: { cooperative: true, filesystem: "host-mediated", unknowns: ["native owner controls actual publication"] }, stdin_mode: "context-utf8",
      stdout_decoder: { format: "json", pointer: null, decode_json_string: false }, observers: [{ kind: "process-end" }] } },
    event_sinks: {}, independence_policy: null, evidence_root: evidence,
    limits: { max_message_bytes: 16000000, max_files: 128, max_bytes: 8192, max_history_records: 10000, max_wait_ms: 1000 }, authority_sources: [authority] };
  const policyBytes = canonical(policy), output = join(root, "candidate"), policyPath = join(output, "gc03-policy.json");
  await mkdir(output); await mkdir(evidence, { recursive: true }); await mkdir(worksite, { recursive: true });
  await writeFile(policyPath, policyBytes, { flag: "wx" });
  const privateMember = canonical({ kind: gc.GOVERNED_CONTEXT_POLICY_KIND, schemaVersion: "5.0.0",
    release: { identity: gc.GC03_SELECTED_RELEASE.identity, inventorySha256: gc.GC03_SELECTED_RELEASE.inventorySha256, installedRoot: release, policyPath,
      policyDigest: "sha256:" + hex(policyBytes) },
    python: { path: R.python, digest: "sha256:" + R.pythonSha256, version: R.pythonVersion }, adapter: { path: adapterPath, digest: "sha256:" + hex(adapterBytes) },
    invocation: { argv: ["-I", "-S", "-B", adapterPath], environment: {}, timeoutMs: 30000 }, principal: { principalId: R.principal, grantId: R.grant },
    permission: { role: "constructor", graphFunctionRef: R.graph, implementationRef: R.implementation, execution: gc.GOVERNED_CONTEXT_EXECUTION },
    sources: { task: task.path, rubric: rubric.path, worksite: [], testing: { purpose: "testing", fieldPath: [...TESTING_FIELD] } } });
  const lateTask = { ...gc.gc03RetainedSourceRef(task.path, task.digest) }, lateRubric = { ...gc.gc03RetainedSourceRef(rubric.path, rubric.digest) };
  const packet = { activation: { id: null, revision: "1", configuration: authority },
    frame: { id: null, revision: "1", declaration: role, evaluation, result_algebra: algebra },
    subject_basis: { subject: null, method_profile: { id: policy.method_profile.id, sha256: policy.method_profile.sha256 },
      product: { id: policy.product.definition_id, definition }, observations: null, dependencies: [definition, authority],
      time_basis: "actual current native occurrence supplied by trusted host" },
    attention: { material_relations: [lateTask, lateRubric], invariants: [authority], semantic_sources: [lateTask, lateRubric], exclusions: [],
      prohibited_assumptions: ["do not replace original task or rubric criteria"] },
    actor_authority: { actor_id: R.actor, role: "Worker", capability: authority, semantic: null, evaluation, operation: authority, decision: null, acceptance: null,
      publication: null, territory: [], tools: ["context.read"] },
    evidence_relations: { admissible_evidence: [lateTask, lateRubric], acquisition: [authority], dependencies: [definition, owner, role], conjunction: null,
      translation: null, consumer: "native-abg-owner", return_contract: lateTask },
    stop_change: { invalidators: [], stop_conditions: [], residuals: [], re_entry: [], reconfiguration: [] },
    profile_additions: { worker: { operation_grant_id: R.grant, mutation_subject: null, territory: [] } } };
  const template = Buffer.from(JSON.stringify({ kind: gc.GC03_ACTIVATION_TEMPLATE_KIND, status: "INCOMPLETE_NOT_ADMITTED", policySha256: hex(policyBytes),
    request: { schema: "a_c.fd-support.request/1", id: null, operation: "context.assemble", arguments: { packet, models: [], sources: [],
      late_acquisition: [lateTask, lateRubric, null], envelope: { capacity_bytes: null, boundary: "executor-stdin-utf8", host_context: { state: "unknown", bytes: null, evidence: null } } } },
    requiredCurrentBindings: { "request.id": "fresh correlation label; not a receipt", "packet.activation.id": "current host-admitted activation identifier",
      "packet.frame.id": "current host-selected frame identifier",
      "packet.subject_basis.subject": "exact Identity of current native task; same Identity also fills packet.profile_additions.worker.mutation_subject",
      "packet.subject_basis.observations": "supported a_c Observation ArtifactRefs only; explicit empty list if none selected; keep native ABG event and Result provenance in owner_coordinates and authenticated source joins",
      "arguments.late_acquisition[2]": "retained-evidence SourceRef for unique current same-Run admitted Testing Result commandResults[0].stdout, with actual Result-derived id and stream digest" },
    requiredOwnerFacts: ["authenticate actual principal/actor/native capability and current occurrence independently before deriving the Context",
      "reacquire original task, original rubric, selected Testing producer and exact byte identities",
      "bind exact executor and policy, and project currentness before actual host publication"],
    limits: ["No a_c provider preflight, native Result, observation, receipt, delivery or admission is supplied",
      "Source labels and original criteria preserve user text; no semantic judgment is automated",
      "Future installed adapter and GC03 policy path require a fresh candidate with exact installed bytes"] }, null, 2) + "\n");
  return { policyPath, policyBytes, privateMember, template, adapterDigest: "sha256:" + hex(adapterBytes) };
}

// Decisive owner-chain case. Real held store, installed owner admission,
// HoG/prepared native leaf and actor, installed fixed client and released GC03;
// only the provider is a controlled non-provider stand-in. It selects Testing,
// then Construction citing Testing's admitted Result; in Construction it pages
// the three granted keys and one denied key through the fixed client.
test("GC03 real owner allowed denied cold tamper", { timeout: 1_800_000 }, async t => {
  const { setupInstalledRootCatalog } = await import("../support/root-installed-environment.mjs");
  const { prepareRegisteredSelectionProduct, constructInstalledStartCall, runInstalledCliRequest } = await import("../support/registered-graph-selection.mjs");
  const { libraryConsumerDeclaration, libraryEnvironment, witnessInput } = await import("../support/default-library.mjs");
  const repoRoot = join(packageRoot, "../../.."), witnessRoot = join(repoRoot, ".ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/default-library-witness");
  const selection = JSON.parse(await readFile(join(witnessRoot, "selection.json"), "utf8"));
  const local = realpathSync(await mkdtemp(join(tmpdir(), "abg-gc03-owner-"))); t.after(() => rm(local, { recursive: true, force: true }));
  const log = join(local, "transport.jsonl"), counter = join(local, "selector-count");
  // The Product Definition selects its exact STDO basis; the toolchain resolves that installed release.
  const basis = JSON.parse(await readFile(join(repoRoot, "stdo_abiogenesis.json"), "utf8")).constitution.stdo.basis;
  const resolved = JSON.parse(execFileSync("stdo", ["resolve", basis.uri], { encoding: "utf8" }));
  assert.equal(resolved.uri, basis.uri, "stdo resolves the selected release");
  const stdoRoot = realpathSync(resolved.path), manifest = await readFile(join(stdoRoot, "manifest.json"));
  assert.equal(sha(manifest), "sha256:" + basis.manifest_sha256, "resolved STDO manifest is the pinned Product basis");
  assert.ok(manifest.equals(await readFile(join(packageRoot, "contracts/default-library/stdo/manifest.json"))), "resolved manifest is the packaged pinned manifest");
  const original = path => ({ path, digest: "sha256:" + selection.seedFiles[path].sha256 });
  const task = original("source/original-basic-cli.txt"), rubric = original("source/basic-cli.oracle.json");
  let selectedEnvironment, governed;
  const owners = await loadOwners();
  const env = await setupInstalledRootCatalog(t, packageRoot, { candidateBasisSource: "packed_artifact", workspaceProductIndex: 1,
    programRef: owners.product.WORKSITE_CONSTRUCTION_IDS.programRef,
    additionalCorePublicationConstructors: ["constructDefaultGovernanceLibraryModulePublication", "constructNativeWorkspaceWorkModulePublication",
      "constructWorksiteCommandExecutionModulePublication"],
    prepareAdditionalProducts: async setup => {
      const { gtl, product } = setup;
      selectedEnvironment = await libraryEnvironment({ ...setup, packageRoot: setup.bootstrapPackage });
      // The packed candidate adapter is the tracked candidate source named by the packaged selection.
      const packaged = JSON.parse(await readFile(join(setup.bootstrapPackage, "contracts/governed-context/selection.json"), "utf8"));
      const adapterPath = realpathSync(join(setup.bootstrapPackage, packaged.adapter.path)), adapterDigest = sha(await readFile(adapterPath));
      assert.equal(adapterDigest, packaged.adapter.sha256); assert.equal(adapterDigest, sha(await readFile(trackedAdapterPath)));
      assert.deepEqual(packaged.gc03, { ...gc.GC03_SELECTED_RELEASE });
      const recipe = await materializeGc03Recipe({ root: join(local, "gc03"), repoRoot, stdoRoot, adapterPath, product, ids: product.NATIVE_WORKSPACE_WORK_IDS, task, rubric });
      const basisRef = "support://abiogenesis/governed-context/", contextRef = "context://abiogenesis/governed-context";
      const files = [["governed-context/activation.json", recipe.template], ["governed-context/policy.json", recipe.privateMember]];
      const members = files.map(([path, bytes]) => ({ digest: product.sha256Bytes(bytes), path, target: null, type: "file" }));
      // The owner's member_inventory@1 record over both members.
      const recordBytes = Buffer.from(product.canonicalJson({ kind: "run_environment_member_inventory", schemaVersion: "5.0.0", members }) + "\n");
      assert.deepEqual(product.runEnvironmentRecordMembers("member_inventory@1", recordBytes), members, "the RunEnvironment owner decodes the record");
      const depRoot = join(local, "governed-dependency"); await mkdir(join(depRoot, "governed-context"), { recursive: true });
      for (const [path, bytes] of files) await writeFile(join(depRoot, path), bytes, { flag: "wx" });
      await writeFile(join(depRoot, "inventory.json"), recordBytes, { flag: "wx" });
      const cm = files.map(([path, bytes], i) => ({ memberRef: `member://abiogenesis/governed-context/${path.split("/")[1]}@5`, path, byteCount: bytes.length, digest: members[i].digest }));
      const d = structuredClone(selectedEnvironment.declaration); delete d.declarationDigest;
      d.dependencies.push({ dependencyRef: "dependency://abiogenesis/governed-context", basisRef, recordRef: basisRef + "inventory.json",
        recordDigest: product.sha256Bytes(recordBytes), recordFormat: "member_inventory@1", inventoryDigest: gtl.stdoInventoryDigest(members), members });
      d.contexts.push({ contextRef, sourceLocator: basisRef, inventoryDigest: product.sha256Canonical(cm), members: cm });
      const constructors = d.roles.filter(role => role.role === "constructor"); assert.ok(constructors.length >= 1, "default library declares a constructor role");
      for (const role of constructors) role.sourceBindings.push(...cm.map(m => ({ contextRef, memberRef: m.memberRef, memberDigest: m.digest, startByte: 0, endByte: m.byteCount, spanDigest: m.digest })));
      const declaration = gtl.constructRunEnvironmentDeclaration(d), base = selectedEnvironment;
      selectedEnvironment = { declaration, resources: async input => {
        const built = await base.resources(input), coordinates = { dependencies: [...built.dependencies,
          { dependencyRef: "dependency://abiogenesis/governed-context", root: depRoot, recordPath: join(depRoot, "inventory.json") }], pythonPath: null, temporaryRoot: built.temporaryRoot };
        return product.constructRunEnvironmentResources({ kind: "run_environment_resources", schemaVersion: "5.0.0", ...coordinates,
          permission: { ...built.permission, environmentDigest: product.sha256Canonical(declaration), ...coordinates } }); } };
      governed = { policyRef: cm[1].memberRef, templateRef: cm[0].memberRef, privateMember: recipe.privateMember, adapterDigest };
      const library = gtl.constructDefaultGovernanceLibraryModulePublication({ productId: product.ABI5_PRODUCT_ID, artifactDigest: "sha256:" + "1".repeat(64),
        productContentDigest: "sha256:" + "2".repeat(64), productManifestDigest: "sha256:" + "3".repeat(64),
        packageName: setup.abiPublication.productSemanticsBinding.packageName, packageVersion: setup.abiPublication.productSemanticsBinding.packageVersion });
      return [await prepareRegisteredSelectionProduct({ ...setup, abiPackageArchivePath: setup.abiPackageArchivePath, declarationFactory: g => {
        const consumer = libraryConsumerDeclaration(g, library, declaration, { purposes: ["construction", "testing"] });
        consumer.programs[0].policies = { ...consumer.programs[0].policies, [gc.GOVERNED_CONTEXT_POLICY_KEY]: governed.policyRef, [gc.GOVERNED_CONTEXT_ACTIVATION_KEY]: governed.templateRef };
        return consumer; },
        fixtureFiles: [{ path: "build/index.mjs", source: new URL("../fixtures/default-library-product/index.mjs", import.meta.url) }] })];
    } });
  // Both private keys survive installed owner admission into the admitted publication.
  const admitted = env.additionalPublications[0].programs[0];
  assert.equal(admitted.policies[gc.GOVERNED_CONTEXT_POLICY_KEY], governed.policyRef); assert.equal(admitted.policies[gc.GOVERNED_CONTEXT_ACTIVATION_KEY], governed.templateRef);
  // The installed identity carries the same adapter and the fixed client named by its selection.
  const installedSelection = JSON.parse(await readFile(join(env.installedRoot, "contracts/governed-context/selection.json"), "utf8"));
  const installedClient = realpathSync(join(env.installedRoot, installedSelection.client.path));
  assert.equal(sha(await readFile(installedClient)), installedSelection.client.sha256, "installed fixed client bytes");
  assert.equal(sha(await readFile(join(env.installedRoot, installedSelection.adapter.path))), governed.adapterDigest, "installed adapter is the pinned candidate adapter");
  const worksite = env.workspaceBinding.canonicalRoot ?? env.workspaceAuthority?.canonicalRoot ?? join(env.scratch, "workspace");
  await cp(join(witnessRoot, "seed"), worksite, { recursive: true });
  for (const source of [task, rubric]) assert.equal(sha(await readFile(join(worksite, source.path))), source.digest, `seeded ${source.path}`);
  const input = await witnessInput({ product: env.product, selection, seedRoot: worksite });
  env.catalogView = env.product.narrowGraphFunctionCatalog(env.catalog, admitted.callableMembership);
  const load = path => import(pathToFileURL(join(env.installedRoot, `build/code/src/${path}.js`)).href);
  const publicApi = await load("public/index"), storeOwner = await load("abg/event_store");
  let handoff = env.store.projectReopenAuthorityAndClose();
  const resource = () => ({ kind: "reopen_abg_event_resource", schemaVersion: "5.0.0", closeHandoff: handoff, handoffDigest: env.product.sha256Canonical(handoff) });
  const start = await constructInstalledStartCall({ environment: env, publicApi, eventResource: resource(), input, identity: "default-library",
    runEnvironmentResourceFactory: selectedEnvironment.resources });
  // The witness Program, with both private keys, validates through the real resolution owner.
  assert.equal(start.resolution.programValidation.kind, "program_validation"); assert.equal(start.resolution.programValidation.programRef, admitted.programRef);
  assert.equal(start.resolution.program.policies[gc.GOVERNED_CONTEXT_POLICY_KEY], governed.policyRef);
  const fake = join(local, "claude.mjs");
  await writeFile(fake, `#!${process.execPath}\n` + controlledProvider({ log, counter, pageBytes: 4096 }), { mode: 0o755 });
  const before = storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix).length;
  const cliEnvironment = { ...process.env, ABG_TS_CLAUDE_COMMAND: fake };
  const execution = await runInstalledCliRequest({ scratch: env.scratch, installedRoot: env.installedRoot, identity: "default-library",
    acquisition: { kind: "reopen", closeHandoff: handoff }, call: start.call, expectedExitCode: null, environment: cliEnvironment });
  const receipt = execution.output.receipt; assert.ok(receipt, JSON.stringify(execution.output).slice(0, 4000));
  handoff = receipt.resources.eventResource.closeHandoff;
  const events = storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix).slice(before);
  const rows = (await readFile(log, "utf8")).trim().split("\n").map(line => JSON.parse(line));
  assert.deepEqual(rows.map(r => r.kind === "selector" ? r.pick?.split("/").at(-1) ?? null : r.kind), ["testing@5", "testing", "construction@5", "construction", null],
    "Testing, then Construction citing its Result, then a lawful gap: " + JSON.stringify(rows).slice(0, 2000));
  const governedRow = rows.find(r => r.kind === "construction");
  const at = kind => events.filter(e => e.kind === kind), one = (list, why) => { assert.equal(list.length, 1, why); return list[0]; };
  // The native leaf's own Result names its occurrence and transport binding (the wrapper folds the same
  // observation into its own Result).
  const construction = one(at("c_call_result_admitted").filter(e => e.payload.value?.kind === "native_workspace_work_observation" && e.payload.resultClass === "success" &&
    e.aggregateId === e.payload.value.provenance.cCallRef && e.graphFunctionRef === env.product.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef), "one admitted native Construction leaf Result");
  const provenance = construction.payload.value.provenance, nativeTask = construction.payload.value.task;
  assert.ok(env.product.isNativeWorkspaceWorkTask(nativeTask) && nativeTask.assessment === undefined, "admitted native Construction task");
  const binding = one(at("actor_transport_binding_admitted").filter(e => e.aggregateId === provenance.transportBindingRef), "admitted transport binding of the Result");
  assert.deepEqual([binding.payload.transportBindingRef, binding.payload.transportBindingDigest], [provenance.transportBindingRef, provenance.transportBindingDigest]);
  const started = one(at("actor_invocation_started").filter(e => e.payload.actorInvocationRef === provenance.actorInvocationRef), "admitted actor start");
  const opened = one(at("c_call_opened").filter(e => e.aggregateId === provenance.cCallRef), "admitted Construction CCall");
  const artifact = one(at("actor_result_artifact_observed").filter(e => e.payload.actorInvocationRef === provenance.actorInvocationRef), "admitted result artifact");
  assert.equal(started.payload.transportBindingRef, binding.aggregateId); assert.equal(binding.payload.cCallRef, provenance.cCallRef);
  assert.equal(binding.payload.actorRef, env.product.NATIVE_WORKSPACE_WORK_IDS.workerActorRef);
  const occurrence = { runId: construction.runId, cCallRef: provenance.cCallRef, actorInvocationRef: provenance.actorInvocationRef };
  // Same-Run Testing Result, admitted before the Construction actor started; its stream field decodes exactly.
  const testingPage = page(Buffer.from(governedRow.exchanges.find(x => x.request.key === "late/2").response, "base64"));
  const testingEvent = one(events.filter(e => e.eventId === testingPage.source.provenance[0]), "Testing provenance is one admitted event");
  const [resultRef, fieldText] = testingPage.source.sourceKey.split("#");
  assert.equal(testingEvent.kind, "c_call_result_admitted"); assert.equal(testingEvent.runId, occurrence.runId); assert.equal(testingEvent.payload.resultRef, resultRef);
  assert.equal(testingEvent.payload.resultClass, "success"); assert.deepEqual(JSON.parse(fieldText), [...TESTING_FIELD]);
  assert.ok(rows.find(r => r.kind === "selector" && r.n === 1).results.includes(resultRef), "Construction was selected citing the admitted Testing Result");
  assert.ok(testingEvent.admissionOrdinal < started.admissionOrdinal, "Testing Result admitted before the Construction actor started");
  assert.deepEqual(testingPage.source.producer, { cCallRef: testingEvent.aggregateId, actorInvocationRef: testingEvent.payload.value.provenance.actorInvocationRef });
  const stream = testingEvent.payload.value.commandResults[0].stdout, admittedStdout = Buffer.from(stream.payload, "base64");
  assert.equal(admittedStdout.toString("base64"), stream.payload); assert.equal(admittedStdout.length, stream.byteLength); assert.equal(sha(admittedStdout), stream.digest);
  // Allowed reads: complete pages reassemble exact task, rubric and admitted Testing bytes with their joins.
  const pages = governedRow.exchanges.map(x => ({ request: x.request, bytes: Buffer.from(x.response, "base64"), value: page(Buffer.from(x.response, "base64")) }));
  const read = key => {
    const own = pages.filter(p => p.request.key === key && p.value.kind === "governed_context_page");
    for (const [i, p] of own.entries()) {
      assert.equal(p.value.offset, i === 0 ? 0 : own[i - 1].value.offset + own[i - 1].value.length); assert.equal(p.value.requestId, p.request.requestId);
      assert.equal(sha(Buffer.from(p.value.content, "base64")), p.value.pageDigest); assert.equal(Buffer.from(p.value.content, "base64").length, p.value.length);
      assert.deepEqual(p.value.occurrence, occurrence); assert.equal(p.value.bindingDigest, pages[0].value.bindingDigest);
      assert.deepEqual(p.value.gc03.identity, gc.GC03_SELECTED_RELEASE.identity); assert.equal(p.value.gc03.publication, "not_performed");
      assert.match(p.value.gc03.contextSha256, /^[0-9a-f]{64}$/u); assert.match(p.value.gc03.recheckSha256, /^[0-9a-f]{64}$/u);
    }
    assert.equal(own.at(-1).value.nextOffset, null);
    const bytes = Buffer.concat(own.map(p => Buffer.from(p.value.content, "base64")));
    assert.equal(bytes.length, own[0].value.totalBytes); assert.equal(sha(bytes), own[0].value.source.digest);
    return { bytes, source: own[0].value.source, pages: own.length };
  };
  const late0 = read("late/0"), late1 = read("late/1"), late2 = read("late/2");
  assert.ok(late0.bytes.equals(await readFile(join(witnessRoot, "seed", task.path))), "exact original task bytes");
  assert.ok(late1.bytes.equals(await readFile(join(witnessRoot, "seed", rubric.path))), "exact original rubric bytes");
  assert.ok(late2.bytes.equals(admittedStdout), "exact decoded admitted Testing stdout bytes"); assert.equal(late2.source.digest, stream.digest);
  assert.equal(late0.pages, 2, "the task is delivered in bounded pages");
  assert.deepEqual([late0.source, late1.source].map(s => [s.role, s.sourceKey, s.digest]), [["original_task", task.path, task.digest], ["original_rubric", rubric.path, rubric.digest]]);
  // Denied key: one owner refusal naming this occurrence and request, with no bytes.
  const denied = pages.at(-1);
  assert.deepEqual([denied.value.kind, denied.value.code, denied.value.stage], ["governed_context_refusal", "key_denied", "active"]);
  assert.deepEqual(denied.value.occurrence, occurrence); assert.deepEqual(denied.value.request, denied.request); assert.equal("content" in denied.value, false);
  // Cold owner: reacquired from the admitted Construction Result, its execution basis, role evidence and
  // Testing join through the installed owners; no transcript field is authority.
  const owner = await load("abg/governed_context"), prefixOwner = await load("abg/event_prefix"), basisOwner = await load("abg/execution_basis");
  const libraryOwner = await load("abg/default_library"), environmentOwner = await load("abg/stdo_environment"), transportOwner = await load("abg/transport_contracts");
  const prefix = prefixOwner.readOwnedRuntimeEventPrefixAtDurablePrefix(handoff.prefix);
  const constructionBasis = basisOwner.rehydrateExecutionBasisAtPrefix(prefix, opened.basisId);
  assert.ok(constructionBasis !== null && constructionBasis.basisRef === binding.basisId, "Construction execution basis rehydrates at the held prefix");
  const publication = one(env.catalog.boundPublications.filter(p => p.programs.some(q => q.programRef === constructionBasis.programRef)), "one bound publication");
  const program = publication.programs.find(q => q.programRef === constructionBasis.programRef);
  const selected = owner.selectOwnedGovernedContext({ constructionTask: true, publication, program,
    roleEvidence: environmentOwner.projectRunEnvironmentRoleEvidenceAtPrefix(prefix, constructionBasis.invocationAdmissionRef, publication, constructionBasis.programRef,
      opened.graphFunctionRef, opened.payload.programLocusRef, "constructor") });
  assert.equal(selected.kind, "governed_context_selected", JSON.stringify(selected));
  assert.equal(selected.policyRef, governed.policyRef); assert.equal(selected.policyDigest, sha(governed.privateMember));
  const policy = selected.policy, testing = libraryOwner.projectGovernedContextTestingAtPrefix(prefix, constructionBasis, nativeTask, occurrence.runId, policy.sources.testing.fieldPath);
  assert.ok(testing !== null && testing.eventRef === testingEvent.eventId && testing.bytes.equals(admittedStdout), "owner Testing join");
  const files = new Map(nativeTask.context.entries.flatMap(e => e.state === "file" ? [[e.relativePath, e.digest]] : []));
  const testingKey = `${testing.resultRef}#${JSON.stringify(testing.fieldPath)}`, sourceKeys = [policy.sources.task, policy.sources.rubric, ...policy.sources.worksite, testingKey];
  const grantDigest = env.product.sha256Canonical({ policyRef: selected.policyRef, policyDigest: selected.policyDigest, principal: policy.principal, sourceKeys });
  const root = nativeTask.workspaceAuthorityBasis.canonicalRoot;
  const held = { runId: occurrence.runId, prefixDigest: env.product.sha256Canonical({ runId: occurrence.runId, testingEventRef: testing.eventRef, resultDigest: testing.resultDigest }),
    admittedResult: ref => ref !== testing.resultRef ? null : { resultDigest: testing.resultDigest, cCallRef: testing.cCallRef, actorInvocationRef: testing.actorInvocationRef,
      field: path => JSON.stringify(path) === JSON.stringify(testing.fieldPath) ? testing.bytes : null } };
  assert.ok(pages.filter(p => p.value.kind === "governed_context_page").every(p => p.value.prefixDigest === held.prefixDigest), "pages carry the owner held Testing prefix");
  const pageBound = owner.gc03PolicyPageBound(policy.release.policyPath, policy.release.policyDigest);
  const authority = { occurrence: { ...occurrence, actorRef: binding.payload.actorRef, attempt: opened.payload.attempt }, role: selected.role,
    context: { observationRef: nativeTask.context.observationRef, readRoots: nativeTask.context.readRoots,
      entries: nativeTask.context.entries.map(e => ({ relativePath: e.relativePath, state: e.state })) },
    original: { task: { path: policy.sources.task, digest: files.get(policy.sources.task) }, rubric: { path: policy.sources.rubric, digest: files.get(policy.sources.rubric) } },
    worksiteSources: [...policy.sources.worksite].sort().map(path => ({ path, digest: files.get(path) })),
    testing: { resultRef: testing.resultRef, resultDigest: testing.resultDigest, fieldPath: testing.fieldPath,
      producer: { cCallRef: testing.cCallRef, actorInvocationRef: testing.actorInvocationRef }, provenance: [testing.eventRef] },
    grant: { principalId: policy.principal.principalId, grantId: policy.principal.grantId, grantDigest, sourceKeys }, pageBound,
    release: { identity: policy.release.identity, inventorySha256: policy.release.inventorySha256, pythonDigest: policy.python.digest,
      pythonVersion: policy.python.version, adapterDigest: policy.adapter.digest, policyDigest: policy.release.policyDigest },
    reacquire: { prefix: () => held, occurrenceActive: () => false, grantDigest: () => grantDigest,
      worksiteSource: path => { try { return readFileSync(join(root, path)); } catch { return null; } } },
    host: async () => { throw new Error("a cold owner lookup never serves"); } };
  const lookup = owner.reacquireOwnedContextLookupCold(authority);
  assert.equal(lookup.closed, "completed"); assert.equal(lookup.bindingDigest, pages[0].value.bindingDigest, "cold owner binding equals the delivered binding");
  // Receiver reconstruction before cold lookup. The candidate is the installed executable and client plus the
  // untrusted sidecar endpoint; it is authenticated only by exact whole equality with the one admitted
  // owner-rendered --append-system-prompt under the owner keys and page bound. Corecold receives no prompt or
  // environment: it consumes only the invocation authenticated here.
  const sidecar = await readFile(binding.payload.paths.stdout.replace(/-stdout\.log$/u, "-governed-context.json")), index = JSON.parse(sidecar.toString("utf8"));
  const installed = { executable: process.execPath, client: installedClient };
  const candidateOf = transcript => { try { return { ...installed, endpoint: JSON.parse(Buffer.from(transcript).toString("utf8")).invocation?.endpoint }; }
    catch { return { ...installed, endpoint: undefined }; } };
  const authenticate = (admittedArgs, candidate) => {
    const at = admittedArgs.flatMap((a, i) => a === "--append-system-prompt" ? [i + 1] : []);
    if (at.length !== 1 || typeof admittedArgs[at[0]] !== "string") return "admitted_prompt_not_one";
    if (![candidate.executable, candidate.client, candidate.endpoint].every(v => typeof v === "string" && v !== "")) return "candidate_incomplete";
    return admittedArgs[at[0]] === owner.governedContextPrompt(candidate, lookup.keys, pageBound) ? null : "admitted_prompt_differs";
  };
  const invocation = candidateOf(sidecar);
  assert.equal(invocation.endpoint, index.invocation.endpoint);
  const args = binding.payload.args, systemPrompt = args[args.indexOf("--append-system-prompt") + 1];
  assert.equal(args.filter(a => a === "--append-system-prompt").length, 1);
  assert.equal(authenticate(args, invocation), null, "the one admitted owner prompt authenticates the installed executable, client and sidecar endpoint");
  assert.equal(systemPrompt, owner.governedContextPrompt(invocation, lookup.keys, pageBound), "admitted prompt names the installed executable, client, endpoint and keys");
  assert.equal(governedRow.prompt, systemPrompt);
  // Launch check only: the controlled launch environment reproduces the admitted environment digest. The cold
  // authentication above uses no current environment and recovers no other Run's environment preimage.
  const transport = transportOwner.constructKnownWorkerTransportContract("claude", { command: fake, environment: cliEnvironment });
  const endpointEnvironment = { [gc.GOVERNED_CONTEXT_ENDPOINT_ENV]: invocation.endpoint, [gc.GOVERNED_CONTEXT_CLIENT_ENV]: invocation.client,
    [gc.GOVERNED_CONTEXT_EXECUTABLE_ENV]: invocation.executable };
  assert.equal(env.product.sha256Canonical(transportOwner.sanitizeWorkerTransportEnvironment(transport, { ...cliEnvironment, ...endpointEnvironment })),
    binding.payload.environmentDigest, "the endpoint is the one in the admitted transport environment");
  const stdout = await readFile(binding.payload.paths.stdout), stdoutDigest = artifact.payload.artifactDigests.stdout;
  assert.equal(sha(stdout), stdoutDigest, "raw stdout is the admitted artifact");
  let coldCalls = 0;
  const coldOf = (authenticated, input) => {
    coldCalls += 1; return owner.coldVerifyGovernedContext({ stdout, stdoutDigest, transcript: sidecar, owner: { occurrence, invocation: authenticated, lookup }, ...input }); };
  const receiveCold = (admittedArgs, transcript, candidate = candidateOf(transcript)) => {
    const refused = authenticate(admittedArgs, candidate);
    return refused !== null ? { kind: "receiver_refusal", code: refused } : coldOf(candidate, { transcript });
  };
  const cold = input => coldOf(invocation, input);
  const reindex = edit => { const copy = structuredClone(index); edit(copy); return Buffer.from(JSON.stringify(copy)); };
  // Receiver negatives refuse against the unchanged admitted args before corecold is reached.
  const coldBefore = coldCalls, other = join(local, "other"), idLine = JSON.stringify(invocation.endpoint);
  const coSubstituted = reindex(x => { x.invocation.endpoint = other; });
  assert.equal(receiveCold(args, coSubstituted, { ...installed, endpoint: other }).code, "admitted_prompt_differs",
    "co-substituted transcript and expected endpoint fail the unchanged admitted prompt");
  assert.equal(receiveCold(args, reindex(x => { delete x.invocation.endpoint; })).code, "candidate_incomplete", "a candidate without an endpoint refuses");
  assert.equal(receiveCold(args, sidecar, { ...installed, endpoint: `${invocation.endpoint}\n` }).code, "admitted_prompt_differs", "an altered candidate endpoint refuses");
  assert.equal(receiveCold(args, sidecar, { ...installed, client: clientPath, endpoint: invocation.endpoint }).code, "admitted_prompt_differs", "a non-installed candidate client refuses at the receiver");
  const withPrompt = prompt => args.map(a => a === systemPrompt ? prompt : a);
  const stripped = systemPrompt.split("\n").filter(line => !line.endsWith(idLine)).join("\n");
  assert.equal(stripped.split("\n").length, systemPrompt.split("\n").length - 1);
  assert.equal(receiveCold(withPrompt(stripped), sidecar).code, "admitted_prompt_differs", "an admitted prompt without endpoint identity has no legacy fallback");
  const altered = systemPrompt.replace(idLine, JSON.stringify(other)); assert.notEqual(altered, systemPrompt);
  assert.equal(receiveCold(withPrompt(altered), sidecar).code, "admitted_prompt_differs", "altered admitted endpoint identity refuses");
  assert.equal(receiveCold([...args, "--append-system-prompt", systemPrompt], sidecar).code, "admitted_prompt_not_one", "duplicate appended prompts refuse");
  assert.equal(receiveCold(args.filter((a, i) => a !== "--append-system-prompt" && args[i - 1] !== "--append-system-prompt"), sidecar).code,
    "admitted_prompt_not_one", "an absent appended prompt refuses");
  assert.equal(coldCalls, coldBefore, "every receiver refusal precedes corecold");
  const joined = receiveCold(args, sidecar);
  assert.equal(coldCalls, coldBefore + 1, "the authenticated invocation reaches corecold once");
  assert.equal(joined.kind, "governed_context_correspondence", JSON.stringify(joined));
  assert.deepEqual(joined.exchanges.map(x => [x.requestId, x.disposition]), pages.map(p => [p.request.requestId, p.value.kind === "governed_context_page" ? "page" : "refusal"]));
  assert.deepEqual(joined.exchanges.map(x => x.responseDigest), pages.map(p => sha(p.bytes)));
  // Tampered or substituted responses refuse.
  const served = pages[0].value.content, forged = (served[0] === "A" ? "B" : "A") + served.slice(1);
  const tampered = Buffer.from(stdout.toString("utf8").replace(served, forged));
  assert.notDeepEqual(tampered, stdout);
  const code = result => result.kind === "governed_context_correspondence" ? "accepted" : result.code;
  assert.equal(code(cold({ stdout: tampered })), "altered", "tampered stdout differs from its admitted digest");
  assert.equal(code(cold({ stdout: tampered, stdoutDigest: sha(tampered) })), "altered", "tampered tool_result differs from the retained response");
  const substitute = Buffer.from(Buffer.from(index.exchanges[0].responseBytes, "base64").toString("utf8").replace(served, forged));
  assert.equal(code(cold({ transcript: reindex(x => { x.exchanges[0].responseBytes = substitute.toString("base64"); x.exchanges[0].responseDigest = sha(substitute); }) })),
    "altered", "substituted retained response refuses");
  assert.equal(code(cold({ transcript: reindex(x => { x.exchanges[4].disposition = "page"; }) })), "altered", "relabelled disposition refuses");
  assert.equal(code(cold({ transcript: reindex(x => { x.invocation.endpoint = join(local, "other"); }) })), "substituted", "substituted endpoint refuses");
  assert.equal(code(cold({ transcript: reindex(x => { x.bindingDigest = sha("other binding"); }) })), "stale", "foreign binding refuses");
  assert.equal(code(cold({ owner: { occurrence, invocation: { ...invocation, client: clientPath }, lookup } })), "substituted", "a non-installed client refuses");
});

/**
 * Controlled non-provider stand-in for the Claude stream-json profile. The
 * selector branch answers the closed schema it receives with lawful references
 * from its own enums; the governed Construction branch runs the installed fixed
 * client against the live owner endpoint and reports each exchange as one exact
 * Bash tool_use/tool_result pair.
 */
function controlledProvider(config) {
  return `import * as fs from "node:fs";\nimport * as childProcess from "node:child_process";\n(${controlledProviderMain.toString()})(${JSON.stringify(config)}, fs, childProcess);\n`;
}
function controlledProviderMain(config, fs, { execFileSync, spawnSync }) {
  const argv = process.argv.slice(2), out = row => process.stdout.write(JSON.stringify(row) + "\n");
  const log = row => fs.appendFileSync(config.log, JSON.stringify(row) + "\n");
  let prompt = ""; try { prompt = fs.readFileSync(0, "utf8"); } catch { /* the prompt arrives on stdin */ }
  const flag = name => argv.includes(name) ? argv[argv.indexOf(name) + 1] : undefined;
  const schemaText = flag("--json-schema"), schema = schemaText === undefined ? null : JSON.parse(schemaText);
  const finish = value => out({ type: "result", subtype: "success", is_error: false, result: JSON.stringify(value), structured_output: value });
  const endpoint = process.env.ABG_GOVERNED_CONTEXT_ENDPOINT;
  if (endpoint !== undefined && flag("--append-system-prompt") !== undefined) {
    const executable = process.env.ABG_GOVERNED_CONTEXT_EXECUTABLE, client = process.env.ABG_GOVERNED_CONTEXT_CLIENT, exchanges = [];
    const quote = text => "'" + text.replaceAll("'", "'\\''") + "'";
    out({ type: "system", subtype: "init", tools: ["Bash"] });
    const call = (key, offset, maxBytes) => {
      const ordinal = exchanges.length + 1, request = { requestId: "q" + ordinal, key, offset, maxBytes }, wire = JSON.stringify(request), id = "toolu_q" + ordinal;
      let response;
      try { response = execFileSync(executable, [client, wire], { env: process.env }); } catch (error) { response = error.stdout ?? Buffer.alloc(0); }
      out({ type: "assistant", message: { role: "assistant", content: [{ type: "tool_use", id, name: "Bash", input: { command: [executable, client, wire].map(quote).join(" ") } }] } });
      out({ type: "user", message: { role: "user", content: [{ type: "tool_result", tool_use_id: id, content: response.toString("utf8") }] } });
      exchanges.push({ request, response: response.toString("base64") });
      return JSON.parse(response.toString("utf8"));
    };
    for (const key of ["late/0", "late/1", "late/2"])
      for (let offset = 0; offset !== null;) { const page = call(key, offset, config.pageBytes); offset = page.kind === "governed_context_page" ? page.nextOffset : null; }
    call("late/3", 0, 1);
    log({ kind: "construction", prompt: flag("--append-system-prompt"), executable, client, endpoint, exchanges });
    finish({ summary: "Read the governed task, rubric and Testing stdout; the ungranted key was refused.", gaps: [] });
  } else if (schema?.properties?.nextGraphFunctionRef !== undefined) {
    const n = fs.existsSync(config.counter) ? Number(fs.readFileSync(config.counter, "utf8")) : 0; fs.writeFileSync(config.counter, String(n + 1));
    const p = schema.properties, enumOf = s => (s !== null && typeof s === "object" && Array.isArray(s.enum) ? s.enum : []);
    const graphs = enumOf(p.nextGraphFunctionRef).filter(g => g !== null), evidence = enumOf(p.contributions.items.properties.evidenceRefs.items);
    const support = enumOf(p.gaps.items.properties.supportRefs.items), results = evidence.filter(r => r.startsWith("result://"));
    const subjects = new Map((schema.anyOf ?? []).map(a => [a.properties.nextGraphFunctionRef.const, a.properties.subjectEvidenceRef]));
    const pick = n === 0 ? graphs.find(g => g.endsWith("/testing@5")) ?? null : n === 1 && results.length > 0 ? graphs.find(g => g.endsWith("/construction@5")) ?? null : null;
    const allowed = pick === null ? [null] : enumOf(subjects.get(pick));
    const value = { interpretation: "Controlled deterministic selection over the admitted mapping.",
      contributions: pick === null ? [] : [{ graphFunctionRef: pick, contribution: "Perform the selected work.", reason: "Controlled selection.", supportRefs: [],
        evidenceRefs: pick.endsWith("/construction@5") ? results : [], dependsOn: [] }],
      gaps: pick === null ? [{ supportRefs: support.slice(0, 1), reason: "The controlled stand-in ends the bounded selection.", evidenceRefs: [] }] : [],
      nextGraphFunctionRef: pick, nextReason: "Controlled selection.", nextEvidenceRefs: [], subjectEvidenceRef: allowed.includes(null) ? null : allowed[0] ?? null,
      revisionReason: "Current admitted evidence.", revisionEvidenceRefs: [], ...(p.requirementProposals === undefined ? {} : { requirementProposals: [] }) };
    log({ kind: "selector", n, pick, graphs, results });
    finish(value);
  } else if (schema?.properties?.kind?.const === "worksite_command_execution_worker_result") {
    // Testing launcher: run exactly the owner-emitted helper command once and return its acknowledgment.
    const objects = text => text.split("\n").flatMap(line => { try { const v = JSON.parse(line); return v !== null && typeof v === "object" ? [v] : []; } catch { return []; } });
    const input = [...objects(prompt), ...objects(prompt).flatMap(v => typeof v.ownerPrompt === "string" ? objects(v.ownerPrompt) : [])]
      .find(v => typeof v.command === "string" && v.command.includes("worksite_command_helper.js"));
    if (input === undefined) throw new Error("exact helper command absent");
    out({ type: "assistant", message: { role: "assistant", content: [{ type: "tool_use", id: "toolu_testing", name: "Bash", input }] } });
    const ran = spawnSync("/bin/sh", ["-c", input.command], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
    out({ type: "user", message: { role: "user", content: [{ type: "tool_result", tool_use_id: "toolu_testing", content: ran.stdout }] } });
    log({ kind: "testing", status: ran.status });
    finish(JSON.parse(ran.stdout));
  } else {
    log({ kind: "other", flags: argv.filter(a => a.startsWith("--")), schema: schema === null ? null : Object.keys(schema.properties ?? {}) });
    finish({ summary: "The controlled stand-in performed no work.", gaps: [] });
  }
}
