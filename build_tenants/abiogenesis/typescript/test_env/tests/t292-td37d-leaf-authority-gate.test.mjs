// T-292 TD-37d: the worksite leaf-authority gate. Before a worksite leaf
// performs its effect, the leaf port checks that the authority it carries is
// still current, and the selected realizer checks it again nearest its
// effect. This lane states what each site decides for one real C0 file-replace
// call: the valid authority, a small set of altered coordinates, a stale
// prefix, a wrong phase and a changed selected input. No refused probe writes
// the file or appends an event; the valid call writes once.
import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

import { setupInstalledRootExecutionBasis } from "../support/root-installed-environment.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function delegateLeafPort(leafPort, invoke) {
  const delegated = Object.fromEntries(Object.entries(leafPort).map(([key, value]) =>
    [key, typeof value === "function" ? value.bind(leafPort) : value]));
  delegated.invoke = invoke;
  return Object.freeze(delegated);
}

// What a site decided, in the terms it records: the port's closed receipt
// (disposition, result kind, failure class and its diagnostic, decoded, with
// the input digest checked against the call's) or a realizer's candidate kind
// and disposition, or null.
const DATA_JSON = "data:application/json;charset=utf-8,";
function portOutcome(receipt, inputDigest) {
  const candidate = receipt?.candidate;
  const ref = candidate?.diagnosticRef ?? null;
  let diagnostic = ref;
  if (typeof ref === "string" && ref.startsWith(DATA_JSON)) {
    const { inputDigest: recorded, ...rest } = JSON.parse(decodeURIComponent(ref.slice(DATA_JSON.length)));
    assert.equal(recorded, inputDigest, "the diagnostic records the call's input digest");
    diagnostic = rest;
  }
  return {
    kind: receipt?.kind ?? null,
    disposition: candidate?.disposition ?? null,
    result: candidate?.resultCandidate?.kind ?? null,
    failureClass: candidate?.resultCandidate?.failureClass ?? null,
    diagnostic,
  };
}
function realizerOutcome(value) {
  return value === null ? null : { kind: value.kind, disposition: value.disposition };
}

const AT_AUTHORITY = (reason, cause) => ({
  kind: "closed_leaf_owner_receipt",
  disposition: "failure",
  result: "worksite_effect_refusal",
  failureClass: "implementation_exception",
  diagnostic: {
    cause,
    computeRegime: "F_D",
    diagnosticClassRef: "diagnostic://abiogenesis/implementation/implementation-exception@5",
    implementationRef: "implementation://abiogenesis/worksite/file-replace-fd@5",
    reason,
    stage: "authority_verification",
  },
});
const NO_CAUSE = { errorClass: null, errorCode: null, message: null, messageTruncated: false };

test("T-292 TD-37d worksite leaf gate: port and file-replace realizer outcomes for one real C0 call", async (context) => {
  const builtGtl = await import(`${pathToFileURL(join(root, "build/code/src/gtl/index.js")).href}?td37d=${Date.now()}`);
  let targetPath;
  const replacement = Buffer.from("hello from the TD-37d gate lane\n");
  const environment = await setupInstalledRootExecutionBasis(context, root, {
    candidateBasisSource: "packed_artifact",
    rootPublicationKind: "worksite_c0",
    programRef: builtGtl.WORKSITE_C0_IDS.programRef,
    graphFunctionRef: builtGtl.WORKSITE_C0_IDS.graphFunctionRef,
    inputContractRef: builtGtl.WORKSITE_C0_IDS.inputContractRef,
    inputFactory: async ({ product, workspaceAuthority, workspaceBinding, capabilityGrant }) => {
      const relativeRoot = "td37d-proof";
      const relativePath = `${relativeRoot}/message.txt`;
      await mkdir(join(workspaceAuthority.canonicalRoot, relativeRoot), { recursive: true });
      targetPath = join(workspaceAuthority.canonicalRoot, relativePath);
      const subject = product.constructWorksiteSubject({ workspaceAuthorityBasis: workspaceAuthority, workspaceBinding,
        subjectUri: pathToFileURL(targetPath).href, relativePath });
      const territory = product.constructWorksiteTerritory({ workspaceAuthorityBasis: workspaceAuthority, workspaceBinding,
        territoryUri: pathToFileURL(join(workspaceAuthority.canonicalRoot, relativeRoot)).href, relativeRoot });
      const predecessorObservation = await product.observeWorksiteSubject(workspaceAuthority, workspaceBinding, subject);
      assert.equal(predecessorObservation.state, "absent");
      return product.constructWorksiteFileReplaceRequest({ workspaceAuthorityBasis: workspaceAuthority, workspaceBinding,
        capabilityGrant, subject, territory, predecessorObservation, replacementBytes: replacement });
    },
  });
  const { abg, hog, product, store, leafPort, installedRoot, executionBasis, executionBasisAdmission, program, publication,
    programValidation, graphFunction, graph, graphValidation, implementationSet, input, rawInput, closureContract,
    workspaceBinding, artifactTruth } = environment;
  const implementation = await import(pathToFileURL(join(installedRoot, "build/code/src/implementation/index.js")).href);
  const worksiteEffect = await import(pathToFileURL(join(installedRoot, "build/code/src/product/worksite_effect.js")).href);

  const outcomes = {};
  // Each probe runs the port and both realizers on one call and checks that
  // nothing was written and no event was appended.
  async function probe(label, call) {
    const before = store.readAll().length;
    const port = portOutcome(await leafPort.invoke(call), call.inputDigest);
    const replace = realizerOutcome(await implementation.realizeWorksiteFileReplace(
      call.input, call.occurrence, call.resolution, call.inputDigest));
    const parents = realizerOutcome(await implementation.realizeWorksiteFileParents(
      call.input, call.occurrence, call.resolution, call.inputDigest));
    assert.equal(store.readAll().length, before, `${label}: no event is appended`);
    outcomes[label] = { port, replace, parents };
    context.diagnostic(`td37d ${label} ${JSON.stringify(outcomes[label])}`);
    return outcomes[label];
  }
  function reseal(authority, change) {
    const { kind: _k, schemaVersion: _s, authorityRef: _r, authorityDigest: _d, ...body } = structuredClone(authority);
    return implementation.constructLeafExecutionAuthority(change(body));
  }

  const opened = abg.openTraversalScope(store, abg.selectHeldEventStoreDurablePrefix(store), { kind: "root", executionBasis },
    { eventTime: "2026-09-01T00:00:00.000Z", correlationId: "correlation://t292/td37d/open", causationEventRefs: [] });
  assert.equal(opened.kind, "traversal_scope_open_admission", JSON.stringify(opened));
  const retained = {};
  const completion = await hog.executeGraphTraversal({
    store, predecessorPrefix: opened.successorPrefix, executionBasis, openedTraversalScope: opened.scope, program,
    programPublication: publication, programValidation, graphFunction, graph, graphValidation, implementationSet,
    interactionSet: executionBasisAdmission.interactionSet,
    leafPort: delegateLeafPort(leafPort, async (call) => {
      retained.call = call;
      const authority = call.occurrence.executionAuthority;
      // Altered coordinates, while the authority's prefix is current.
      await probe("input digest", { ...call, inputDigest: product.sha256Canonical({ td37d: "other input" }) });
      await probe("occurrence attempt", { ...call, occurrence: { ...call.occurrence, attempt: call.occurrence.attempt + 1 } });
      await probe("occurrence frame", { ...call, occurrence: { ...call.occurrence, frameId: `${call.occurrence.frameId}#td37d` } });
      await probe("call regime", { ...call, occurrence: { ...call.occurrence,
        executionAuthority: reseal(authority, (body) => ({ ...body, cCall: { ...body.cCall, regime: "F_P" } })) } });
      await probe("effect handler", { ...call, occurrence: { ...call.occurrence,
        executionAuthority: reseal(authority, (body) => ({ ...body, effectUri: worksiteEffect.WORKSITE_FILE_PARENTS_EFFECT_URI,
          handlerRef: worksiteEffect.WORKSITE_FILE_PARENTS_HANDLER_REF, handlerDigest: worksiteEffect.WORKSITE_FILE_PARENTS_HANDLER_DIGEST })) } });
      // A call carrier missing one identity member: the port's authorization
      // read throws, alone and with a failing coordinate; the throw is recorded.
      const withoutStageRole = reseal(authority, (body) => { const { stageRole: _r, ...cCall } = body.cCall; return { ...body, cCall }; });
      await probe("call identity member missing", { ...call, occurrence: { ...call.occurrence, executionAuthority: withoutStageRole } });
      await probe("call identity member missing, input digest", { ...call, inputDigest: product.sha256Canonical({ td37d: "other input" }),
        occurrence: { ...call.occurrence, executionAuthority: withoutStageRole } });
      await probe("capability grant scope", { ...call, occurrence: { ...call.occurrence,
        executionAuthority: reseal(authority, (body) => ({ ...body, capabilityGrantRef: `${body.capabilityGrantRef}#td37d` })) } });
      // A changed selected input: the request, its digest and the basis raw
      // input agree with each other but not with the selected occurrence.
      const changedRequest = { ...call.input, replacementBytes: Buffer.from("changed\n").toString("base64"),
        replacementByteLength: 8, replacementDigest: product.sha256Bytes(Buffer.from("changed\n")) };
      const changedDigest = product.sha256Canonical(changedRequest);
      await probe("changed selected input", { ...call, input: changedRequest, inputDigest: changedDigest, occurrence: { ...call.occurrence,
        executionAuthority: reseal(authority, (body) => ({ ...body,
          executionBasis: { ...body.executionBasis, rawInputValue: changedRequest, rawInputDigest: changedDigest } })) } });
      await assert.rejects(readFile(targetPath), { code: "ENOENT" }, "no probe writes the file");
      return leafPort.invoke(call);
    }),
    actorRuntimeBinding: { workspaceBinding, artifactTruth },
    input, inputDigest: rawInput.subjectDigest, closureContract,
    eventTime: "2026-09-01T00:00:00.000Z", correlationId: "correlation://t292/td37d/traverse",
  });
  assert.equal(completion.disposition, "closed", JSON.stringify(completion));
  assert.equal(completion.resultValue.kind, "worksite_file_replace_output");
  assert.deepEqual(await readFile(targetPath), replacement);
  const cCallEvents = store.readAll().filter((event) => event.aggregateId === completion.cCallRef).map((event) => event.kind);
  assert.deepEqual(cCallEvents, ["c_call_opened", "c_call_fibre_selected", "c_call_evidenced", "c_call_result_admitted", "c_call_judged"]);
  context.diagnostic(`td37d valid ${JSON.stringify({ cCallEvents, result: completion.resultValue.kind })}`);

  // After the call completed: the retained authority's prefix is stale, and an
  // authority resealed at the current prefix finds the call past its selected phase.
  const call = retained.call;
  await probe("stale prefix", call);
  await probe("wrong phase", { ...call, occurrence: { ...call.occurrence, executionAuthority: reseal(call.occurrence.executionAuthority,
    (body) => ({ ...body, predecessorPrefix: abg.selectHeldEventStoreDurablePrefix(store) })) } });
  assert.deepEqual(await readFile(targetPath), replacement);

  const refused = { port: AT_AUTHORITY("refused", NO_CAUSE), replace: null, parents: null };
  const thrown = { port: AT_AUTHORITY("thrown", { errorClass: "TypeError", errorCode: null,
    message: "Cannot convert undefined or null to object", messageTruncated: false }), replace: null, parents: null };
  assert.deepEqual(outcomes, {
    "input digest": refused,
    "occurrence attempt": refused,
    "occurrence frame": refused,
    "call regime": refused,
    "effect handler": refused,
    "call identity member missing": thrown,
    "call identity member missing, input digest": thrown,
    "capability grant scope": refused,
    "changed selected input": refused,
    "stale prefix": refused,
    "wrong phase": refused,
  });
});
