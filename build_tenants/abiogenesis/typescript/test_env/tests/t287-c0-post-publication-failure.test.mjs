import assert from "node:assert/strict";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";
import test from "node:test";

import { setupInstalledRootExecutionBasis, publicOperationBasis, requirePublicationValidations, rawProgramInput } from "../support/root-installed-environment.mjs";
import { proveFreshProcessRuntimeProjectionEquality } from "../support/fresh-process-runtime-proof.mjs";
import { constructD2FrameDeclarations, nativePublications } from "../support/d2-frame-fixture.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const eventTime = "2026-09-07T04:00:00.000Z";
const proofRoot = process.env.ABG_C0_PROOF_ROOT;
const potentialProof = process.env.ABG_C0_POTENTIAL_PROOF === "1";
const immutableCopy = value => {
  const visit = item => { if (item !== null && typeof item === "object") { for (const child of Object.values(item)) visit(child); Object.freeze(item); } return item; };
  return visit(structuredClone(value));
};

async function inventory(product, directory) {
  const rows = [];
  async function visit(path, relativePath) {
    const status = await fsPromises.lstat(path);
    const identity = `${status.dev}:${status.ino}:${status.nlink}`;
    if (status.isSymbolicLink()) {
      rows.push({ relativePath, kind: "symlink", identity, target: await fsPromises.readlink(path) });
    } else if (status.isDirectory()) {
      rows.push({ relativePath, kind: "directory", identity });
      for (const name of (await fsPromises.readdir(path)).sort()) await visit(join(path, name), relativePath ? `${relativePath}/${name}` : name);
    } else {
      assert.equal(status.isFile(), true);
      rows.push({ relativePath, kind: "file", identity, digest: product.sha256Bytes(await fsPromises.readFile(path)), byteLength: status.size });
    }
  }
  await visit(directory, "");
  return { digest: product.sha256Canonical(rows), pathCount: rows.length };
}

async function physicalPath(product, path) {
  if (path === null) return null;
  try {
    const status = await fsPromises.lstat(path);
    return {
      path, state: status.isFile() ? "file" : status.isDirectory() ? "directory" : "other",
      fileIdentity: `${status.dev}:${status.ino}`, nlink: status.nlink,
      digest: status.isFile() ? product.sha256Bytes(await fsPromises.readFile(path)) : null,
    };
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return { path, state: "absent", fileIdentity: null, nlink: null, digest: null };
  }
}

function delegate(port) {
  return Object.fromEntries(Object.entries(port).map(([key, value]) => [key, typeof value === "function" ? value.bind(port) : value]));
}

function installFaults(env, targetPath, modes, label) {
  const original = Object.fromEntries(["link", "rename", "unlink", "lstat", "open", "readFile", "writeFile", "mkdir", "rm"].map(key => [key, fsPromises[key]]));
  const originalWriteSync = fs.writeSync;
  const state = { published: false, method: null, stagingPath: null, targetReads: 0, stagingUnlinks: 0, injected: [], externalChanges: [], beforeAdmissionPrefix: null };
  const has = mode => modes.includes(mode);
  const injected = mode => state.injected.includes(mode);
  const fault = mode => {
    state.injected.push(mode);
    return Object.assign(new Error(`B04 ${label}: ${mode}`), { code: "EIO" });
  };
  for (const method of ["link", "rename"]) {
    fsPromises[method] = async (source, target) => {
      if (target === targetPath && has("publication_syscall")) throw fault("publication_syscall");
      const result = await original[method](source, target);
      if (target === targetPath) {
        state.published = true;
        state.method = method;
        state.stagingPath = source;
      }
      return result;
    };
  }
  fsPromises.unlink = async path => {
    if (path === state.stagingPath && has("staging_cleanup")) {
      state.stagingUnlinks += 1;
      if (state.stagingUnlinks === 1 || has("persistent_cleanup")) {
        if (has("substituted_staging") && !injected("substituted_staging")) {
          state.injected.push("substituted_staging");
          await original.unlink(path);
          await original.writeFile(path, "external substituted staging\n");
          state.externalChanges.push({ stage: "after_publication", path, action: "substitute_staging" });
        }
        throw fault("staging_cleanup");
      }
    }
    if (path === targetPath && state.published && has("compensation_failure")) throw fault("compensation_failure");
    return original.unlink(path);
  };
  fsPromises.lstat = async (path, ...args) => {
    if (state.published && path === targetPath) {
      if (has("compensation_identity") && !injected("compensation_identity")) throw fault("compensation_identity");
      if ((has("successor_absent") || has("successor_nonfile")) && !injected("successor_kind")) {
        state.injected.push("successor_kind");
        await original.unlink(path);
        if (has("successor_nonfile")) await original.mkdir(path);
        state.externalChanges.push({ stage: "after_publication", path, action: has("successor_nonfile") ? "replace_with_directory" : "remove_target" });
      }
    }
    if (path === state.stagingPath && has("residue_unknown") && state.stagingUnlinks >= 2) throw fault("residue_unknown");
    return original.lstat(path, ...args);
  };
  fsPromises.open = async (path, ...args) => {
    if (state.published && path === targetPath) {
      state.targetReads += 1;
      const ordinal = has("owner_read") || has("owner_mismatch") || has("owner_read_close") ? 2 : 1;
      if (state.targetReads === ordinal) {
        if (has("successor_read_close") || has("owner_read_close") || has("successor_close")) {
          const handle = await original.open(path, ...args);
          return {
            stat: handle.stat.bind(handle),
            readFile: async () => {
              if (!has("successor_close")) throw Object.assign(fault("FIRST_READ_EIO"), { code: "EIO" });
              return handle.readFile();
            },
            close: async () => {
              await handle.close();
              throw Object.assign(fault("LATER_CLOSE_EBADF"), { code: "EBADF" });
            },
          };
        }
        if (has("successor_read") || has("owner_read")) throw fault(has("owner_read") ? "owner_read" : "successor_read");
        if (has("successor_mismatch") || has("owner_mismatch")) {
          state.injected.push(has("owner_mismatch") ? "owner_mismatch" : "successor_mismatch");
          await original.writeFile(path, "external changed bytes after publication\n");
          state.externalChanges.push({ stage: "after_publication", path, action: "change_target_bytes", targetReadOrdinal: ordinal });
        }
      }
    }
    return original.open(path, ...args);
  };
  fsPromises.readFile = async (path, ...args) => {
    if (state.published && typeof path === "string" && path.startsWith(`${env.installedRoot}/`)) {
      if (has("inventory_read") && !injected("inventory_read")) throw fault("inventory_read");
      if (has("inventory_mismatch") && !injected("inventory_mismatch")) {
        state.injected.push("inventory_mismatch");
        return Buffer.concat([await original.readFile(path, ...args), Buffer.from("injected observation mismatch")]);
      }
    }
    return original.readFile(path, ...args);
  };
  fs.writeSync = (...args) => {
    if (state.published && has("append") && Buffer.isBuffer(args[1]) && args[1].includes(Buffer.from('"kind":"c_call_evidenced"'))) throw fault("append");
    return originalWriteSync(...args);
  };
  syncBuiltinESMExports();
  return { state, restore() {
    for (const [key, value] of Object.entries(original)) fsPromises[key] = value;
    fs.writeSync = originalWriteSync;
    syncBuiltinESMExports();
  } };
}

// A second actual binding/invocation/basis uses the same installed owner and
// physical root. It is never a fixture-authored evidence or Result admission.
async function secondBoundObservation(context, env, label) {
  const { product, abg, store } = env;
  const manifest = { workspaceId: env.workspaceAuthority.workspaceId, canonicalRoot: env.workspaceAuthority.canonicalRoot,
    authorityMode: env.workspaceAuthority.authorityMode, authorizedActorRef: env.workspaceAuthority.authorizedActorRef };
  const workspaceAuthority = product.constructWorkspaceAuthorityBasis({ ...manifest,
    authorityManifestRef: `manifest://c0-potential/${label}`, authorityManifestDigest: product.sha256Canonical(manifest) });
  const candidate = product.constructWorkspaceBinding(workspaceAuthority, env.productSet, env.lock, env.workspaceBinding.roots);
  const receipt = abg.admitWorkspaceBinding(store, candidate, { ...publicOperationBasis(product, "abg.operation.workspace.bind",
    candidate.bindingId, candidate.bindingDigest, `invocation://c0-potential/${label}/bind`, env.admittedInstalls.map(row => row.admissionEventRef)),
    predecessorPrefix: abg.selectHeldEventStoreDurablePrefix(store) }, workspaceAuthority);
  assert.equal(receipt.kind, "artifact_owner_result", JSON.stringify(receipt));
  const catalog = product.admitGraphFunctionCatalog({ workspaceBinding: candidate, resolvedLock: env.lock,
    verifiedProducts: env.verifiedProducts, installedProducts: env.catalogInstalledProducts, publications: env.publications });
  assert.equal(catalog.kind, "graph_function_catalog", JSON.stringify(catalog));
  const catalogView = product.narrowGraphFunctionCatalog(catalog, [env.graphFunction.name]);
  assert.equal(catalogView.kind, "graph_function_catalog_view", JSON.stringify(catalogView));
  const environment = { ...env, workspaceAuthority, workspaceBinding: receipt.value, bindingCandidate: candidate, catalog, catalogView,
    artifactTruth: receipt.artifactTruth, durablePrefix: receipt.successorPrefix };
  const next = await setupInstalledRootExecutionBasis(context, root, { existingEnvironment: environment,
    candidateBasisSource: "packed_artifact", rootPublicationKind: "worksite_c0", publicInvocationRef: `invocation://c0-potential/${label}/invoke`,
    programRef: env.program.programRef, graphFunctionRef: env.graphFunction.name, inputContractRef: env.graphFunction.inputs[0],
    inputFactory: async ({ workspaceBinding, capabilityGrant }) => {
      const coordinates = { workspaceAuthorityBasis: workspaceAuthority, workspaceBinding };
      const subject = product.constructWorksiteSubject({ ...coordinates, subjectUri: env.input.subject.subjectUri, relativePath: env.input.subject.relativePath });
      const territory = product.constructWorksiteTerritory({ ...coordinates, territoryUri: env.input.territory.territoryUri, relativeRoot: env.input.territory.relativeRoot });
      const predecessorObservation = await product.observeWorksiteSubject(workspaceAuthority, workspaceBinding, subject);
      assert.equal(predecessorObservation.kind, "worksite_observation", JSON.stringify(predecessorObservation));
      const request = product.constructWorksiteFileReplaceRequest({ ...coordinates, capabilityGrant, subject, territory,
        predecessorObservation, replacementBytes: Buffer.from(env.input.replacementBytes, "base64") });
      assert.equal(request.kind, "worksite_file_replace_request", JSON.stringify(request)); return request;
    },
  });
  assert.notEqual(next.workspaceBinding.bindingId, env.workspaceBinding.bindingId);
  assert.notEqual(next.input.predecessorObservation.observationRef, env.input.predecessorObservation.observationRef);
  assert.notDeepEqual(next.workspaceAuthority, env.workspaceAuthority);
  assert.equal(next.workspaceAuthority.canonicalRoot, env.workspaceAuthority.canonicalRoot);
  return next;
}

// Source/handoff semantics are supplied Product constructor premises. The
// semantic invocation and basis below use the ordinary installed owners and are
// never dispatched; no F_P actor, fabricated Result, or generic event append.
async function retainedInputOrigin(context, primary, alias, label) {
  const { product, gtl, validator } = alias;
  const load = name => import(pathToFileURL(join(alias.installedRoot, "build/code/src/product", name + ".js")).href);
  const requirement = await load("requirement_handoff"), semanticProduct = await load("semantic_stage");
  const manifest = JSON.parse(await fsPromises.readFile(join(alias.installedRoot, "product-toolchain-manifest.json"), "utf8"));
  const abiArtifact = { ...manifest, artifactDigest: await product.sha256File(alias.artifactPath), manifestDigest: product.sha256Canonical(manifest) };
  const fixture = constructD2FrameDeclarations({ product, gtl, abiArtifact,
    abiPublications: nativePublications(gtl, abiArtifact) });
  const zero = `sha256:${"0".repeat(64)}`;
  const coordinate = { publicationDigest: zero, declarationDigest: product.sha256Canonical(fixture.source.declaration),
    executionBasisRef: "fixture://c0-potential/source-basis", executionBasisDigest: zero,
    programRef: "fixture://c0-potential/source-program", programDigest: zero,
    graphFunctionRef: "fixture://c0-potential/source-graph", graphFunctionDigest: zero,
    cCallRef: "fixture://c0-potential/source-call", cCallDigest: zero,
    implementationResolutionRef: "fixture://c0-potential/source-implementation", implementationResolutionDigest: zero,
    predecessorPrefixDigest: zero, predecessorEventCount: 1, inputDigest: product.sha256Canonical(fixture.source.input) };
  const sourceHandoff = requirement.deriveRequirementHandoffCandidate(fixture.source.input, fixture.source.declaration, coordinate);
  assert.ok(sourceHandoff);
  const publication = alias.publications.find(value => value.moduleRef === gtl.SEMANTIC_STAGE_IDS.moduleRef);
  const [{ publicationAdmission, publicationValidation }] = requirePublicationValidations(validator, [publication]);
  const programValidation = validator.validateProgram(rawProgramInput(validator, publicationAdmission,
    publication.programs.find(value => value.programRef === gtl.SEMANTIC_STAGE_IDS.programRef)));
  assert.equal(programValidation.kind, "program_validation", JSON.stringify(programValidation));
  const catalogView = product.narrowGraphFunctionCatalog(alias.catalog, [gtl.SEMANTIC_STAGE_IDS.graphFunctionRef]);
  assert.equal(catalogView.kind, "graph_function_catalog_view", JSON.stringify(catalogView));
  let worksite;
  const held = alias.abg.selectHeldEventStoreDurablePrefix(alias.store);
  const current = alias.abg.projectExactPrefixWorkspaceEnvironment(held, {
    ref: alias.workspaceBinding.bindingId,
    digest: alias.workspaceBinding.bindingDigest,
  });
  assert.equal(current.kind, "exact_prefix_workspace_environment");
  assert.deepEqual(current.workspaceBinding, alias.workspaceBinding);
  const semantic = await setupInstalledRootExecutionBasis(context, root, {
    existingEnvironment: { ...alias, artifactTruth: current.artifactTruth, durablePrefix: held,
      publication, publicationAdmission, publicationValidation, programValidation, catalogView },
    programRef: gtl.SEMANTIC_STAGE_IDS.programRef, graphFunctionRef: gtl.SEMANTIC_STAGE_IDS.graphFunctionRef,
    inputContractRef: gtl.SEMANTIC_STAGE_IDS.envelopeContractRef, publicInvocationRef: `invocation://c0-potential/${label}/semantic-input`,
    inputFactory: async ({ capabilityGrant }) => {
      const { subject, territory, predecessorObservation } = alias.input;
      const task = product.constructWorksiteConstructionTask({ workspaceAuthorityBasis: alias.workspaceAuthority,
        workspaceBinding: alias.workspaceBinding, capabilityGrant, targets: [{ subject, territory, predecessorObservation }],
        prompt: "Pure target constructor for retained input origin; no construction dispatched" });
      worksite = { workspaceAuthorityBasis: alias.workspaceAuthority, workspaceBinding: alias.workspaceBinding, capabilityGrant,
        targets: [{ target: task.targets[0], base64: Buffer.from("original\n").toString("base64"), role: "implementation" }],
        commands: [], outcomePredicates: [], allowedWriteTerritories: [] };
      assert.equal(semanticProduct.isSemanticWorksiteBasis(worksite), true);
      return product.constructSemanticStageEnvelope({ sourceHandoff, lifecycle: fixture.lifecycle,
        taskData: fixture.scenario, evaluationData: fixture.oracle, worksite });
    },
  });
  assert.deepEqual(semantic.input.assets, []); assert.equal(semantic.input.evidence, null);
  const revision = await import(pathToFileURL(join(alias.installedRoot, "build/code/src/abg/worksite_revision.js")).href);
  const origin = { kind: "admitted_input", basisAdmissionEventRef: semantic.executionBasis.admissionEventRef,
    inputAdmissionRef: semantic.executionBasis.rawInputAdmissionRef, inputDigest: semantic.executionBasis.rawInputDigest };
  const row = { designTargetRef: worksite.targets[0].target.targetRef, subject: alias.input.subject,
    observation: alias.input.predecessorObservation, origin };
  assert.equal(revision.worksiteRevisionMeaningMatches(worksite, { ...worksite, workspaceAuthorityBasis: primary.workspaceAuthority }), false);
  return { revision, worksite, row, basis: semantic.executionBasis, sourceHandoff,
    premise: "Product-constructed source handoff/lifecycle supplied as ordinary raw semantic input; actual installed invocation and basis admission; no semantic execution or Result" };
}

function originViews(env, prefixes, retained, expected) {
  const coordinate = env.abg.selectHeldEventStoreDurablePrefix(env.store);
  const variants = [prefixes.projectOwnedRuntimeEventPrefixAtDurablePrefix(coordinate),
    prefixes.selectValidatedRuntimeEventPrefix(immutableCopy(env.store.readAll())),
    prefixes.readOwnedRuntimeEventPrefixAtDurablePrefix(immutableCopy(coordinate), { requireCurrent: true })];
  return variants.map(prefix => {
    const survives = retained.revision.worksiteRevisionOriginSurvives(prefix, retained.row);
    const origins = retained.revision.projectWorksiteRevisionOrigins(prefix, retained.basis, retained.worksite, retained.worksite,
      [retained.basis.invocationAdmissionRef]);
    assert.equal(survives, expected); assert.deepEqual(origins, expected ? [retained.row.origin] : null);
    return { survives, origins };
  });
}

async function potentialViews(env, calculus, prefixes, native, requests, label, afterOrdinal) {
  const { abg, store, product } = env, rows = store.readAll(), coordinate = abg.selectHeldEventStoreDurablePrefix(store);
  const warmPrefix = prefixes.projectOwnedRuntimeEventPrefixAtDurablePrefix(coordinate);
  const fullPrefix = prefixes.selectValidatedRuntimeEventPrefix(immutableCopy(rows));
  const coldPrefix = prefixes.readOwnedRuntimeEventPrefixAtDurablePrefix(immutableCopy(coordinate), { requireCurrent: true });
  const warm = calculus.deriveRuntimeEventCalculusProjection(warmPrefix), full = calculus.deriveRuntimeEventCalculusProjection(fullPrefix),
    cold = calculus.deriveRuntimeEventCalculusProjection(coldPrefix);
  assert.deepEqual(warm, full); assert.deepEqual(cold, warm);
  const facts = requests.map(request => ({ observationRef: request.predecessorObservation.observationRef,
    current: calculus.holdsAt(warm, calculus.constructWorksiteObservationCurrentFluent(request.predecessorObservation.observationRef)),
    invalidated: [warmPrefix, fullPrefix, coldPrefix].map(prefix => native.worksiteCommandSourcesInvalidatedAfter(prefix,
      afterOrdinal, request.workspaceAuthorityBasis.canonicalRoot, [request.subject.relativePath])) }));
  assert.equal(native.worksiteCommandSourcesInvalidatedAfter(warmPrefix, afterOrdinal, env.workspaceAuthority.canonicalRoot, ["untouched-sibling.txt"]), false);
  assert.equal(native.worksiteCommandSourcesInvalidatedAfter(warmPrefix, afterOrdinal, env.workspaceAuthority.canonicalRoot + "-other-root", [env.input.subject.relativePath]), false);
  return { label, coordinate, facts, projectionDigest: product.sha256Canonical(warm), rows: rows.length,
    dependencyPopulation: prefixes.indexedRuntimeEvents(warmPrefix, "worksite-observation-dependency").length };
}

function deepOccurrenceNegatives(admission, product, events, selectedRef) {
  const hash = value => product.sha256Canonical(value), records = [];
  const authenticFibre = events.find(row => row.eventId === selectedRef);
  const authentic = admission.projectWorksiteSelectedOccurrence(authenticFibre,
    events.filter(row => row.admissionOrdinal < authenticFibre.admissionOrdinal));
  assert.ok(authentic, "unchanged authentic occurrence is the positive control");
  for (const name of ["authorization grant", "implementation selection", "alternate output contract", "strict support order", "basis actor"]) {
    let rows = structuredClone(events), fibre = rows.find(row => row.eventId === selectedRef);
    const opened = rows.find(row => row.kind === "c_call_opened" && row.aggregateId === fibre.aggregateId);
    const basis = rows.find(row => row.kind === "basis_admitted" && row.basisId === fibre.basisId);
    const invocation = rows.find(row => row.kind === "invocation_admitted" && row.payload.invocationAdmissionRef === basis.payload.invocationAdmissionRef);
    const implementation = rows.find(row => row.kind === "implementation_admitted" && row.payload.implementationSetRef === basis.payload.implementationSetRef);
    const rewrite = (oldValue, newValue) => {
      const walk = value => typeof value === "string" ? value === oldValue ? newValue : value : Array.isArray(value)
        ? value.map(walk) : value !== null && typeof value === "object" ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, walk(item)])) : value;
      rows = rows.map(walk);
    };
    if (name === "authorization grant") {
      const grant = invocation.payload.capabilityGrants[0];
      const { kind, schemaVersion, grantRef, grantDigest, ...body } = grant;
      body.policyRef = "policy://c0-potential/crossed"; body.policyDigest = hash("crossed-policy");
      const digest = hash(body), crossed = { kind, schemaVersion, grantRef: `capability-grant://abiogenesis/${digest.slice(7)}`, grantDigest: digest, ...body };
      assert.equal(product.isCapabilityGrantValue(crossed), true);
      invocation.payload.capabilityGrants = [crossed]; invocation.payload.capabilityGrantRefs = [crossed.grantRef];
      const { invocationAdmissionRef, invocationAdmissionDigest, ...invocationBody } = invocation.payload;
      const d = hash(invocationBody), ref = `invocation-admission://abiogenesis/${d.slice(7)}`;
      invocation.payload.invocationAdmissionDigest = d; rewrite(invocationAdmissionRef, ref);
    } else if (name === "implementation selection") fibre.payload.implementationRequirementKey += "/crossed";
    else if (name === "alternate output contract") {
      const set = implementation.payload.implementationSet;
      const selected = set.rows.find(row => row.requirementKey === fibre.payload.implementationRequirementKey);
      selected.outputContractRef = "contract://c0-potential/alternate-output@5";
      const { kind, schemaVersion, disposition, leafResolutionCandidateRef, leafResolutionCandidateDigest, ...rowBody } = selected;
      const rd = hash(rowBody);
      selected.leafResolutionCandidateDigest = rd;
      selected.leafResolutionCandidateRef = `leaf-resolution-candidate://abiogenesis/${rd.slice(7)}`;
      const { implementationSetRef, implementationSetDigest, ...setBody } = set;
      const sd = hash(setBody);
      rewrite(implementationSetRef, `implementation-set://abiogenesis/${sd.slice(7)}`);
      rewrite(implementationSetDigest, sd);
      const nextSet = rows.find(row => row.eventId === implementation.eventId).payload.implementationSet;
      rows.find(row => row.eventId === basis.eventId).payload.localImplementationSubsetDigest = hash({
        rootImplementationSetRef: nextSet.implementationSetRef, rootImplementationSetDigest: nextSet.implementationSetDigest,
        executableLeafKeys: nextSet.executableLeafKeys, rows: nextSet.rows,
      });
    }
    else if (name === "strict support order") {
      const ordinal = implementation.admissionOrdinal; implementation.admissionOrdinal = basis.admissionOrdinal;
      basis.admissionOrdinal = ordinal;
    } else basis.payload.actorRef = "actor://c0-potential/crossed";
    // Re-identify every changed admitted basis and CCall before testing the
    // semantic join; no stale checksum is used as the rejection oracle.
    const b = rows.find(row => row.eventId === basis.eventId);
    const { basisRef, basisDigest, ...basisBody } = b.payload;
    const bd = hash(basisBody); b.payload.basisDigest = bd; rewrite(basisRef, `execution-basis://abiogenesis/${bd.slice(7)}`);
    const o = rows.find(row => row.eventId === opened.eventId), f = rows.find(row => row.eventId === selectedRef);
    const oldCall = f.aggregateId;
    const identity = Object.fromEntries(["graphCallId", "frameId", "vectorIndex", "stageRole", "taskOrdinal", "attempt", "programLocusRef", "retryPath"].map(key => [key, o.payload[key]]));
    identity.basisId = o.basisId;
    const cd = hash(identity); o.payload.cCallDigest = cd;
    if (Object.hasOwn(f.payload, "cCallDigest")) f.payload.cCallDigest = cd;
    rewrite(oldCall, `c-call:${cd}`);
    for (const row of rows) row.payloadDigest = hash(row.payload);
    fibre = rows.find(row => row.eventId === selectedRef);
    const prior = rows.filter(row => row.admissionOrdinal < fibre.admissionOrdinal);
    if (name === "alternate output contract") {
      const nextBasis = rows.find(row => row.eventId === basis.eventId);
      const nextOpened = rows.find(row => row.eventId === opened.eventId);
      const nextSet = rows.find(row => row.eventId === implementation.eventId).payload.implementationSet;
      const selected = nextSet.rows.find(row => row.requirementKey === fibre.payload.implementationRequirementKey);
      const structural = product.constructWorksiteEffectAuthorization({ ...authentic,
        executionBasis: { ...authentic.executionBasis, ...nextBasis.payload },
        implementationSet: { ...authentic.implementationSet, ...nextSet },
        cCall: { ...authentic.cCall, ...nextOpened.payload, ...fibre.payload, basisId: nextOpened.basisId,
          outputContractRef: selected.outputContractRef },
      });
      assert.equal(structural.kind, "worksite_effect_authorization", "alternate contract has closed row/set/basis/call digests");
    }
    assert.equal(admission.projectWorksiteSelectedOccurrence(fibre, prior), null, name);
    records.push({ name, fibre, prior, premise: "consistently re-digested controlled semantic crossing; no admitted runtime claim" });
  }
  const originalFibre = events.find(row => row.eventId === selectedRef);
  const originalPrior = events.filter(row => row.admissionOrdinal < originalFibre.admissionOrdinal);
  for (const name of ["duplicate opening", "missing binding", "later-only implementation"]) {
    const prior = structuredClone(originalPrior);
    if (name === "duplicate opening") {
      const opened = prior.find(row => row.kind === "c_call_opened" && row.aggregateId === originalFibre.aggregateId);
      prior.push({ ...opened, eventId: opened.eventId + "/duplicate-fixture" });
    } else if (name === "missing binding") {
      prior.splice(prior.findIndex(row => row.kind === "public_operation_artifact_admitted" && row.payload.operationId === "abg.operation.workspace.bind" &&
        row.payload.artifactRef === events.find(row => row.kind === "basis_admitted" && row.basisId === originalFibre.basisId).payload.workspaceBindingId), 1);
    } else {
      const basis = prior.find(row => row.kind === "basis_admitted" && row.basisId === originalFibre.basisId);
      prior.find(row => row.kind === "implementation_admitted" && row.payload.implementationSetRef === basis.payload.implementationSetRef).admissionOrdinal = originalFibre.admissionOrdinal + 1;
    }
    assert.equal(admission.projectWorksiteSelectedOccurrence(originalFibre, prior), null, name);
    records.push({ name, fibre: originalFibre, prior, premise: "controlled support population/order negative; unchanged payload digests; no admitted runtime claim" });
  }
  return records;
}

async function runCase(context, label, options = {}) {
  const modes = options.modes ?? [];
  if (potentialProof) options = { ...options, replace: true };
  const setupContext = potentialProof ? { after() {} } : context;
  const potentialFacts = [];
  const gtl = await import(pathToFileURL(join(root, "build/code/src/gtl/index.js")).href);
  let targetPath;
  const replacement = Buffer.from(`B04 ${label}\n`);
  const env = await setupInstalledRootExecutionBasis(setupContext, root, {
    candidateBasisSource: "packed_artifact", rootPublicationKind: "worksite_c0",
    ...(potentialProof ? { additionalCorePublicationConstructors: ["constructSemanticStageModulePublication"] } : {}),
    programRef: gtl.WORKSITE_C0_IDS.programRef, graphFunctionRef: gtl.WORKSITE_C0_IDS.graphFunctionRef,
    inputContractRef: gtl.WORKSITE_C0_IDS.inputContractRef,
    inputFactory: async ({ product, workspaceAuthority, workspaceBinding, capabilityGrant }) => {
      const relativeRoot = "c0-b04", relativePath = `${relativeRoot}/target.txt`;
      const directory = join(workspaceAuthority.canonicalRoot, relativeRoot);
      await fsPromises.mkdir(directory);
      targetPath = join(directory, "target.txt");
      if (options.replace) await fsPromises.writeFile(targetPath, "original\n");
      const coordinates = { workspaceAuthorityBasis: workspaceAuthority, workspaceBinding };
      const subject = product.constructWorksiteSubject({ ...coordinates, subjectUri: pathToFileURL(targetPath).href, relativePath });
      assert.equal(subject.kind, "worksite_subject", JSON.stringify(subject));
      const territory = product.constructWorksiteTerritory({ ...coordinates, territoryUri: pathToFileURL(directory).href, relativeRoot });
      assert.equal(territory.kind, "worksite_territory", JSON.stringify(territory));
      const predecessorObservation = await product.observeWorksiteSubject(workspaceAuthority, workspaceBinding, subject);
      assert.equal(predecessorObservation.kind, "worksite_observation", JSON.stringify(predecessorObservation));
      const request = product.constructWorksiteFileReplaceRequest({ ...coordinates, capabilityGrant, subject, territory, predecessorObservation, replacementBytes: replacement });
      assert.equal(request.kind, "worksite_file_replace_request", JSON.stringify(request));
      return request;
    },
  });
  const { abg, store, product, executionBasis, workspaceAuthority, workspaceBinding } = env;
  assert.equal(Object.hasOwn(product, "replaceWorksiteFile"), false, "raw writer must remain internal to the guarded owner");
  const carriers = await import(pathToFileURL(join(env.installedRoot, "build/code/src/product/worksite_effect.js")).href);
  const admission = await import(pathToFileURL(join(env.installedRoot, "build/code/src/abg/c_call_outcome.js")).href);
  const calculus = await import(pathToFileURL(join(env.installedRoot, "build/code/src/abg/event_calculus.js")).href);
  const prefixes = await import(pathToFileURL(join(env.installedRoot, "build/code/src/abg/event_prefix.js")).href);
  const native = await import(pathToFileURL(join(env.installedRoot, "build/code/src/abg/native_worksite_execution.js")).href);
  const alias = potentialProof ? await secondBoundObservation(setupContext, env, label + "-alias") : null;
  const retained = alias === null ? null : await retainedInputOrigin(setupContext, env, alias, label);
  const aliasOpened = alias === null ? null : abg.openTraversalScope(store, abg.selectHeldEventStoreDurablePrefix(store),
    { kind: "root", executionBasis: alias.executionBasis }, { eventTime, correlationId: `correlation://c0-potential/${label}/alias`, causationEventRefs: [] });
  if (aliasOpened !== null) assert.equal(aliasOpened.kind, "traversal_scope_open_admission", JSON.stringify(aliasOpened));
  if (potentialProof) context.after(async () => {
    if (proofRoot) await fsPromises.writeFile(join(proofRoot, `${label}-potential-retained.json`),
      JSON.stringify({ potentialFacts, scratch: env.scratch, aliasBinding: alias.workspaceBinding,
        prefix: potentialFacts.at(-1)?.coordinate ?? null, root: workspaceAuthority.canonicalRoot }) + "\n");
    store.closeDurableLog();
  });
  assert.notEqual(workspaceAuthority.canonicalRoot, workspaceBinding.roots.productRoot);
  assert.equal(workspaceBinding.roots.productRoot, env.admittedInstall.installedRoot);
  const coordinatesBefore = product.canonicalJson({ workspaceAuthority, workspaceBinding, executionBasis });
  const installedBefore = await inventory(product, env.installedRoot);
  if (modes.includes("stale")) await fsPromises.writeFile(targetPath, "external stale O0 bytes\n");
  const targetBefore = await physicalPath(product, targetPath);
  const opened = abg.openTraversalScope(store, abg.selectHeldEventStoreDurablePrefix(store), { kind: "root", executionBasis }, {
    eventTime, correlationId: `correlation://c0-b04/${label}/open`, causationEventRefs: [],
  });
  assert.equal(opened.kind, "traversal_scope_open_admission", JSON.stringify(opened));
  const beforeSelectionRows = potentialProof ? store.readAll() : null;
  const beforeSelectionPrefix = potentialProof ? prefixes.selectValidatedRuntimeEventPrefix(Object.freeze([...beforeSelectionRows])) : null;
  const beforeSelectionProjection = potentialProof ? calculus.deriveRuntimeEventCalculusProjection(beforeSelectionPrefix) : null;
  const beforeSelectionOrdinal = beforeSelectionRows?.at(-1)?.admissionOrdinal ?? 0;
  if (potentialProof) {
    const before = await potentialViews(env, calculus, prefixes, native, [env.input, alias.input], "before selection", beforeSelectionOrdinal);
    assert.deepEqual(before.facts.map(row => row.current), [true, true]);
    potentialFacts.push({ ...before, retainedInput: { row: retained.row, basis: retained.basis, sourceHandoff: retained.sourceHandoff,
      premise: retained.premise, views: originViews(env, prefixes, retained, true) } });
  }
  let ownerOutcome, capturedCall, malformedCopyDigest = null;
  const delegated = delegate(env.leafPort);
  let injection;
  delegated.invoke = async call => {
    capturedCall = call;
    if (potentialProof) {
      const currentPrefix = prefixes.projectOwnedRuntimeEventPrefixAtDurablePrefix(abg.selectHeldEventStoreDurablePrefix(store));
      const fibre = prefixes.runtimeEventAtPrefix(currentPrefix, call.occurrence.executionAuthority.cCall.fibreSelectedEventRef);
      const dependencies = admission.worksiteSelectedOccurrenceDependencies(currentPrefix, fibre);
      assert.ok(admission.projectWorksiteSelectedOccurrence(fibre, dependencies));
      assert.ok(dependencies.every(row => row.admissionOrdinal < fibre.admissionOrdinal));
      const started = performance.now();
      assert.equal(calculus.worksiteSelectedOccurrenceInputCurrent(currentPrefix, call.occurrence.executionAuthority.cCall, env.input), true);
      const firstMs = performance.now() - started, hot = performance.now();
      assert.equal(calculus.worksiteSelectedOccurrenceInputCurrent(currentPrefix, call.occurrence.executionAuthority.cCall, env.input), true);
      const selected = await potentialViews(env, calculus, prefixes, native, [env.input, alias.input], "selected potential before physical owner", beforeSelectionOrdinal);
      assert.deepEqual(selected.facts.map(row => row.current), [false, false]);
      assert.ok(selected.facts.every(row => row.invalidated.every(Boolean)));
      potentialFacts.push({ ...selected, dependencyIds: dependencies.map(row => row.eventId), dependencyExtent: dependencies.length,
        firstHistoricalEligibilityMs: firstMs, repeatedHistoricalEligibilityMs: performance.now() - hot,
        retainedOriginViews: originViews(env, prefixes, retained, false),
        relation: "potential selection, before physical effect; exact dependency authentication contains no EC fold" });
      assert.deepEqual(calculus.deriveRuntimeEventCalculusProjection(beforeSelectionPrefix), beforeSelectionProjection);
    }
    if (options.authorizationControls) {
      const authorization = product.constructWorksiteEffectAuthorization({ workspaceBinding, request: env.input, executionBasis, cCall: call.occurrence.executionAuthority.cCall, implementationSet: env.implementationSet });
      assert.equal(authorization.kind, "worksite_effect_authorization");
      assert.equal(product.isWorksiteFileReplaceInput({ workspaceAuthorityBasis: workspaceAuthority, workspaceBinding, request: env.input, executionBasis, cCall: call.occurrence.executionAuthority.cCall, implementationSet: env.implementationSet, authorization: { ...authorization, authorizationDigest: `sha256:${"0".repeat(64)}` } }), false);
      const changedRequest = product.constructWorksiteFileReplaceRequest({ ...env.input, workspaceBinding, replacementBytes: Buffer.from("changed bytes under unchanged admitted basis") });
      assert.equal(changedRequest.kind, "worksite_file_replace_request");
      const crossed = await env.leafPort.invoke({ ...call, input: changedRequest, inputDigest: product.sha256Canonical(changedRequest) });
      assert.equal(crossed.kind, "closed_leaf_owner_receipt");
      assert.equal(crossed.candidate.disposition, "failure");
      assert.equal(crossed.candidate.resultCandidate.phase, undefined);
      injection.state.changedInputControl = { requestDigest: product.sha256Canonical(changedRequest), originalInputDigest: call.inputDigest, refused: true };
      const protectedRelative = ".ai-workspace/events/forbidden.txt";
      const protectedSubject = product.constructWorksiteSubject({ workspaceAuthorityBasis: workspaceAuthority, workspaceBinding, subjectUri: pathToFileURL(join(workspaceAuthority.canonicalRoot, protectedRelative)).href, relativePath: protectedRelative });
      const protectedOutcome = await product.observeWorksiteSubject(workspaceAuthority, workspaceBinding, protectedSubject);
      assert.equal(protectedOutcome.kind, "worksite_effect_refusal");
      assert.equal(protectedOutcome.code, "binding_mismatch");
      assert.equal(protectedOutcome.phase, undefined);
      injection.state.protectedRootControl = { relativePath: protectedRelative, code: protectedOutcome.code, refused: true };
      assert.deepEqual(await physicalPath(product, targetPath), targetBefore);
    }
    const result = await env.leafPort.invoke(call);
    ownerOutcome = result.candidate?.resultCandidate;
    injection.state.beforeAdmissionPrefix = abg.selectHeldEventStoreDurablePrefix(store);
    if (options.reject === "evidence" || (options.reject === "result" && result.candidate.disposition === "failure")) {
      // Negative-only copy; the untouched real owner return is the physical oracle.
      const malformed = structuredClone(result);
      if (options.reject === "evidence") malformed.candidate.evidenceCandidates[0].inputDigest = `sha256:${"0".repeat(64)}`;
      else malformed.candidate.diagnosticRef = "diagnostic://abiogenesis/c0-b04/crossed-negative-copy";
      malformedCopyDigest = product.sha256Canonical(malformed);
      return Object.freeze(malformed);
    }
    return result;
  };
  if (options.reject === "result") delegated.validateResultEvidenceLineage = () => false;
  injection = installFaults(env, targetPath, modes, label);
  let completion;
  try {
    completion = await env.hog.executeGraphTraversal({
      store, predecessorPrefix: opened.successorPrefix, executionBasis, openedTraversalScope: opened.scope,
      program: env.program, programValidation: env.programValidation, graphFunction: env.graphFunction,
      programPublication: env.executionResolution.programPublication,
      graph: env.graph, graphValidation: env.graphValidation, implementationSet: env.implementationSet,
      interactionSet: env.executionBasisAdmission.interactionSet, leafPort: Object.freeze(delegated),
      actorRuntimeBinding: { workspaceBinding, artifactTruth: env.artifactTruth }, input: env.input,
      inputDigest: env.rawInput.subjectDigest, closureContract: env.closureContract, eventTime,
      correlationId: `correlation://c0-b04/${label}/hog`,
    });
  } finally {
    injection.restore();
  }
  const state = injection.state;
  const events = store.readAll();
  const targetAfter = await physicalPath(product, targetPath);
  const stagingAfter = await physicalPath(product, state.stagingPath);
  const installedAfter = await inventory(product, env.installedRoot);
  assert.deepEqual(installedAfter, installedBefore, "independent inventory must prove zero installed Product delta");
  assert.equal(product.canonicalJson({ workspaceAuthority, workspaceBinding, executionBasis }), coordinatesBefore);
  const failure = ownerOutcome?.phase === "post_publication";
  const unadmitted = modes.includes("append") || options.reject !== undefined;
  const prepublication = modes.includes("stale") || modes.includes("publication_syscall");
  if (proofRoot) {
    await fsPromises.mkdir(proofRoot, { recursive: true });
    await fsPromises.writeFile(join(proofRoot, `${label}-owner.json`), `${JSON.stringify({ ownerOutcome, completion, state, targetBefore, targetAfter, stagingAfter, installedBefore, installedAfter, malformedCopyDigest })}\n`);
  }
  if (modes.length > 0 && !modes.includes("stale")) assert.ok(state.injected.length > 0, label);
  if (prepublication) {
    assert.equal(state.published, false);
    assert.equal(failure, false);
    assert.equal(ownerOutcome.kind, "worksite_effect_refusal");
    assert.deepEqual(targetAfter, targetBefore);
    assert.equal((await fsPromises.readdir(dirname(targetPath))).some(name => name.startsWith(".abiogenesis-")), false);
  } else if (failure) {
    assert.equal(carriers.isWorksitePostPublicationFailure(ownerOutcome), true, JSON.stringify(ownerOutcome));
    assert.equal(/before commit/u.test(ownerOutcome.message), false);
    const physical = ownerOutcome.physicalOutcome;
    if (modes.includes("successor_read_close") || modes.includes("owner_read_close")) {
      assert.equal(ownerOutcome.substrateCode, "EIO");
      assert.match(ownerOutcome.message, /FIRST_READ_EIO.*secondary.*EBADF.*LATER_CLOSE_EBADF/u);
      assert.equal(physical.diagnostics[0].substrateCode, "EIO");
      assert.equal(physical.diagnostics[0].message, ownerOutcome.message);
    }
    if (modes.includes("successor_close")) {
      assert.equal(ownerOutcome.substrateCode, "EBADF");
      assert.match(ownerOutcome.message, /LATER_CLOSE_EBADF/u);
    }
    const fullFailureBasis = admission.projectWorksiteFailureBasis(events, capturedCall.occurrence.cCallRef, ownerOutcome);
    assert.ok(fullFailureBasis);
    const failurePrefix = abg.selectHeldEventStoreDurablePrefix(store);
    const failurePrefixes = [prefixes.selectValidatedRuntimeEventPrefix(immutableCopy(events)),
      prefixes.projectOwnedRuntimeEventPrefixAtDurablePrefix(failurePrefix),
      prefixes.readOwnedRuntimeEventPrefixAtDurablePrefix(immutableCopy(failurePrefix), { requireCurrent: true })];
    for (const prefix of failurePrefixes) assert.deepEqual(
      admission.projectWorksiteFailureBasisAtPrefix(prefix, capturedCall.occurrence.cCallRef, ownerOutcome), fullFailureBasis);
    if (physical.kind === "publication_only") {
      assert.equal(physical.publication.method, state.method);
      assert.equal(physical.publication.writtenDigest, product.sha256Bytes(replacement));
      assert.equal(physical.publication.byteLength, replacement.byteLength);
      assert.equal(physical.publication.stagingPath, state.stagingPath);
      assert.equal("receipt" in physical, false);
      if (physical.stagingResidue.state === "owned_file") assert.equal(stagingAfter.fileIdentity, physical.publication.stagingFileIdentity);
      if (physical.stagingResidue.state === "absent") assert.equal(stagingAfter.state, "absent");
      if (physical.stagingResidue.state === "other_path") assert.notEqual(stagingAfter.fileIdentity, physical.publication.stagingFileIdentity);
      if (modes.includes("staging_cleanup")) {
        assert.equal(physical.diagnostics[0].stage, "staging_cleanup");
        assert.equal(physical.compensation, modes.includes("compensation_failure") ? "failed" : modes.includes("compensation_identity") || modes.includes("substituted_staging") ? "skipped_unverified_identity" : "succeeded");
        assert.equal(targetAfter.state, physical.compensation === "succeeded" ? "absent" : "file");
        assert.equal(physical.stagingCleanup, modes.includes("persistent_cleanup") ? "failed" : modes.includes("substituted_staging") ? "skipped_unverified_identity" : "removed");
        if (modes.includes("residue_unknown")) assert.equal(physical.stagingResidue.state, "unknown");
      }
    } else {
      assert.equal(physical.kind, "owner_completed");
      assert.equal(product.isWorksiteFileReplaceReceipt(physical.completedOwner.receipt), true);
      assert.equal(physical.completedOwner.successorObservation.fileDigest, product.sha256Bytes(replacement));
      assert.equal(stagingAfter.state, "absent");
      const rebuilt = carriers.constructWorksiteFileReplaceReceipt(physical.completedOwner.authorization, env.input.predecessorObservation, physical.completedOwner.successorObservation, env.input.replacementDigest);
      assert.deepEqual(rebuilt, physical.completedOwner.receipt);
    }
  } else if (!prepublication) {
    assert.equal(ownerOutcome.kind, "worksite_file_replace_output", JSON.stringify(ownerOutcome));
    assert.equal(targetAfter.digest, product.sha256Bytes(replacement));
    assert.equal(stagingAfter.state, "absent");
  }
  const callEvents = events.filter(event => event.aggregateId === capturedCall.occurrence.cCallRef);
  if (unadmitted) {
    assert.equal(completion.disposition, "refused", JSON.stringify(completion));
    assert.equal(completion.resultValue.kind, "unadmitted_physical_commit");
    assert.deepEqual(completion.resultValue.refusedExpectedPrefix, state.beforeAdmissionPrefix);
    assert.deepEqual(abg.selectHeldEventStoreDurablePrefix(store), state.beforeAdmissionPrefix);
    assert.equal(callEvents.some(event => ["c_call_evidenced", "c_call_result_admitted"].includes(event.kind)), false);
    if (failure) assert.deepEqual(completion.resultValue.ownerOutcome, ownerOutcome);
    else {
      assert.deepEqual(completion.resultValue.receipt, ownerOutcome.receipt);
      assert.deepEqual(completion.resultValue.successorObservation, ownerOutcome.successorObservation);
    }
  } else {
    assert.deepEqual(completion.resultValue, ownerOutcome, JSON.stringify(completion));
    const result = callEvents.find(event => event.kind === "c_call_result_admitted");
    const evidence = callEvents.find(event => event.kind === "c_call_evidenced");
    assert.equal(result.payload.valueDigest, product.sha256Canonical(ownerOutcome));
    assert.equal(evidence.payload.outputDigest, result.payload.valueDigest);
    assert.equal(evidence.payload.evidenceClass, failure || prepublication ? "deterministic" : "worksite_file_replace");
    if (failure) {
      const prior = events.filter(event => event.admissionOrdinal < result.admissionOrdinal);
      assert.deepEqual(calculus.projectWorksiteTransitionForResult(result, prior), { before: env.input.predecessorObservation.observationRef, after: null, successorObservation: null });
      const mutations = [
        value => { value.physicalOutcome.extra = true; },
        value => { value.physicalOutcome.kind === "publication_only" ? value.physicalOutcome.authorization.cCallRef = "crossed-call" : value.physicalOutcome.completedOwner.receipt.receiptDigest = `sha256:${"0".repeat(64)}`; },
      ];
      for (const mutate of mutations) {
        const negative = structuredClone(ownerOutcome); mutate(negative);
        assert.equal(admission.projectWorksiteFailureBasis(prior, capturedCall.occurrence.cCallRef, negative), null);
      }
      const crossedResult = structuredClone(result); crossedResult.payload.valueDigest = `sha256:${"0".repeat(64)}`;
      assert.equal(calculus.projectWorksiteTransitionForResult(crossedResult, prior), null);
      const crossedEvidence = prior.map(event => structuredClone(event));
      crossedEvidence.find(event => event.eventId === evidence.eventId).payload.inputDigest = `sha256:${"0".repeat(64)}`;
      assert.equal(calculus.projectWorksiteTransitionForResult(result, crossedEvidence), null);
      assert.equal(admission.projectWorksiteFailureBasis(prior, capturedCall.occurrence.cCallRef, { kind: "worksite_effect_refusal", schemaVersion: "5.0.0", phase: "post_publication" }), null);
    }
  }
  if (failure && !unadmitted) {
    const reused = await env.leafPort.invoke(capturedCall);
    assert.equal(reused.candidate.disposition, "failure");
    assert.deepEqual(await physicalPath(product, targetPath), targetAfter);
  }
  if (unadmitted && targetAfter.state === "file" && env.input.predecessorObservation.state === "absent") {
    const reused = await env.leafPort.invoke(capturedCall);
    assert.equal(reused.candidate.disposition, "failure");
    assert.equal(reused.candidate.resultCandidate.phase, undefined);
    assert.deepEqual(await physicalPath(product, targetPath), targetAfter);
  }
  if (potentialProof) {
    const after = await potentialViews(env, calculus, prefixes, native, [env.input, alias.input], "outcome cut", beforeSelectionOrdinal);
    assert.deepEqual(after.facts.map(row => row.current), [false, false]);
    assert.ok(after.facts.every(row => row.invalidated.every(Boolean)));
    potentialFacts.push({ ...after, retainedOriginViews: originViews(env, prefixes, retained, false) });
    if (prepublication) potentialFacts.push({ label: "five deep semantic negatives", coordinate: after.coordinate,
      negatives: deepOccurrenceNegatives(admission, product, store.readAll(), capturedCall.occurrence.executionAuthority.cCall.fibreSelectedEventRef) });
    const aliasReplay = abg.projectRuntimeTruthAtDurablePrefix(abg.selectHeldEventStoreDurablePrefix(store), aliasOpened.scope.runId).replayState;
    assert.deepEqual(aliasReplay.currentWorksiteObservations, []);
    assert.equal(aliasReplay.activeFluents.some(key => key.includes(alias.input.predecessorObservation.observationRef)), false);
    if (failure || unadmitted || prepublication) {
      // The Product really reobserves a new binding value, but its raw basis is
      // not an admitted observation-occurrence proof and must not restore truth.
      const rebound = await secondBoundObservation(setupContext, env, label + "-raw-reentry");
      const replayed = await potentialViews(env, calculus, prefixes, native, [env.input, alias.input, rebound.input], "later raw basis", beforeSelectionOrdinal);
      assert.deepEqual(replayed.facts.map(row => row.current), [false, false, false]);
      potentialFacts.push({ ...replayed, rawBasisRef: rebound.executionBasis.basisRef, rawBinding: rebound.workspaceBinding.bindingId,
        premise: "actual Product read and actual invocation/basis admission; no new admitted observation occurrence" });
    }
    assert.deepEqual(calculus.deriveRuntimeEventCalculusProjection(beforeSelectionPrefix), beforeSelectionProjection);
  }
  const durablePrefix = abg.selectHeldEventStoreDurablePrefix(store);
  const logPath = store.configuredDurableLogPath();
  const fresh = await proveFreshProcessRuntimeProjectionEquality({
    abg, product, installedPackageRoot: env.installedRoot, store,
    requests: [{ rowId: label, owner: "abg", exportName: "projectRuntimeTruthAtDurablePrefix", input: "durable_prefix", args: [opened.scope.runId] },
      ...(aliasOpened === null ? [] : [{ rowId: label + "-alias", owner: "abg", exportName: "projectRuntimeTruthAtDurablePrefix", input: "durable_prefix", args: [aliasOpened.scope.runId] }])],
    ...(potentialProof ? { ownedProcessProof: { evidenceRoot: join(proofRoot, label + "-fresh-children") } } : {}),
  });
  const replay = fresh.retainedRows[0].projection.replayState;
  const expectedCurrent = unadmitted || prepublication || failure ? [] : [ownerOutcome.successorObservation];
  assert.deepEqual(replay.currentWorksiteObservations.map(row => row.observation), expectedCurrent);
  if (!unadmitted) assert.deepEqual(replay.cCalls.find(row => row.cCallRef === capturedCall.occurrence.cCallRef).resultValue, ownerOutcome);
  if (proofRoot) {
    const rawLog = await fsPromises.readFile(logPath);
    assert.equal(product.sha256Bytes(rawLog), fresh.eventLogDigest);
    await fsPromises.writeFile(join(proofRoot, `${label}.events.jsonl.gz`), gzipSync(rawLog));
    const artifactDigest = await product.sha256File(env.artifactPath);
    const artifactName = `candidate-${artifactDigest.slice("sha256:".length)}.tgz`;
    try { await fsPromises.copyFile(env.artifactPath, join(proofRoot, artifactName), fs.constants.COPYFILE_EXCL); }
    catch (error) { if (error.code !== "EEXIST") throw error; }
    await fsPromises.writeFile(join(proofRoot, `${label}.json`), `${JSON.stringify({
      label, modes, replace: options.replace ?? false, negativeMutation: options.reject ?? null,
      artifact: artifactName, artifactDigest, installedRoot: env.installedRoot,
      manifestDigest: product.sha256Canonical(JSON.parse(await fsPromises.readFile(join(env.installedRoot, "product-toolchain-manifest.json"), "utf8"))),
      sourceProductContentDigest: env.verified.productContentDigest, installedBefore, installedAfter,
      authorityBindingBasisDigest: product.sha256Bytes(Buffer.from(coordinatesBefore)),
      ownerOutcome, malformedCopyDigest, completion, targetBefore, targetAfter, stagingAfter, state, potentialFacts,
      durablePrefix, rawLogDigest: fresh.eventLogDigest, eventCount: fresh.historicalEventCount,
      freshProcessIds: fresh.freshProcessIds, runId: opened.scope.runId,
      replayStateDigest: product.sha256Canonical(replay), currentObservations: replay.currentWorksiteObservations,
      reopenClaim: "Two real processes reopened the original path and inode before fixture cleanup. Compressed retained bytes are portable event content, not that reopen authority.",
    })}\n`);
  }
}

const cases = [
  ["B04-06 create", { authorizationControls: true }],
  ["B04-06 replace", { replace: true }],
  ["B04-01 cleanup-compensated", { modes: ["staging_cleanup"] }],
  ["B04-01 compensation-failed", { modes: ["staging_cleanup", "compensation_failure"] }],
  ["B04-01 identity-unavailable", { modes: ["staging_cleanup", "compensation_identity"] }],
  ["B04-01 persistent-staging", { modes: ["staging_cleanup", "persistent_cleanup"] }],
  ["B04-01 substituted-staging", { modes: ["staging_cleanup", "substituted_staging"] }],
  ["B04-01 residue-unknown", { modes: ["staging_cleanup", "residue_unknown"] }],
  ["B04-02 link-successor-read", { modes: ["successor_read"] }],
  ["B04-02 rename-successor-read", { replace: true, modes: ["successor_read"] }],
  ["B04-02 successor-mismatch", { modes: ["successor_mismatch"] }],
  ["B04-02 successor-absent", { modes: ["successor_absent"] }],
  ["B04-02 successor-nonfile", { modes: ["successor_nonfile"] }],
  ["B04-03 inventory-read", { modes: ["inventory_read"] }],
  ["B04-03 inventory-mismatch", { modes: ["inventory_mismatch"] }],
  ["B04-03 primary-cause-preserved", { modes: ["staging_cleanup", "inventory_read"] }],
  ["B04-04 owner-read", { modes: ["owner_read"] }],
  ["B04-04 owner-mismatch", { modes: ["owner_mismatch"] }],
  ["B04-05 append-complete", { modes: ["append"] }],
  ["B04-05 append-publication-only", { modes: ["staging_cleanup", "append"] }],
  ["B04-05 append-retained-receipt", { modes: ["inventory_read", "append"] }],
  ["B04-05 result-rejection-complete", { reject: "result" }],
  ["B04-05 evidence-rejection-publication-only", { modes: ["staging_cleanup"], reject: "evidence" }],
  ["B04-05 result-rejection-retained-receipt", { modes: ["inventory_read"], reject: "result" }],
  ["B04-07 stale-O0", { replace: true, modes: ["stale"] }],
  ["B04-07 failed-link", { modes: ["publication_syscall"] }],
  ["B04-07 failed-rename", { replace: true, modes: ["publication_syscall"] }],
  ["B04-C01 link-read-close", { modes: ["successor_read_close"] }],
  ["B04-C01 rename-read-close", { replace: true, modes: ["successor_read_close"] }],
  ["B04-C01 owner-read-close", { modes: ["owner_read_close"] }],
  ["B04-C01 close-only", { modes: ["successor_close"] }],
];
for (const [name, options] of cases) test(`${name}: installed owner, ABG admission and fresh replay`, context => runCase(context, name.replaceAll(" ", "-"), options));
