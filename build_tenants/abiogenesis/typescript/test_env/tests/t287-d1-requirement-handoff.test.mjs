import { mkdtemp } from "node:fs/promises";
import { basename } from "node:path";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile, readdir, lstat, readlink, rename, copyFile } from "node:fs/promises";
import { dirname, join, resolve, relative, isAbsolute, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import test from "node:test";
import { expectedVerificationIdentity } from "../support/candidate-basis.mjs";
import { importInstalledPackageExport, setupInstalledCliHarness } from "../support/root-cli-environment.mjs";
const execFileAsync = promisify(execFile);
const packageRoot = process.env.ABI5_D1_BUILD_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const schemaVersion = "5.0.0";
const ACTOR = "actor://d1-handoff.example/developer";
let installedHarness, admittedContractCatalog, admittedDefinitionContractCoordinates;
let cliOrdinal = 0;
const observedCalls = [];
function keyOf(definition) {
  return `${definition.definitionKey.operationId}#${definition.definitionKey.memberKey}`;
}

function coordinate(product, ref, value = { ref }) {
  return Object.freeze({ ref, digest: product.sha256Canonical(value) });
}

function actorAuthority(product) {
  return Object.freeze({
    actor: coordinate(product, ACTOR),
    attribution: coordinate(
      product,
      "attribution://abiogenesis/t287/w2-05-worker",
    ),
  });
}

function authoritySlots(product, definition, supplied = {}) {
  return Object.freeze({
    workspace_binding: null,
    product_set: null,
    dependency_lock: null,
    catalog_scope: null,
    execution_program: null,
    graph_function: null,
    input_contract: null,
    session_policy: null,
    capability_grants: { requiredCapabilityRefs: [...definition.capabilityRefs], grants: [] },
    actor: null,
    transport_steering: null,
    verification_references: null,
    execution_basis: null,
    ...supplied,
  });
}

function definitionFor(publicApi, operationId, memberKey) {
  const matches = publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.filter(
    (definition) =>
      definition.definitionKey.operationId === operationId &&
      definition.definitionKey.memberKey === memberKey,
  );
  assert.equal(matches.length, 1, `${operationId}#${memberKey}`);
  return matches[0];
}

function definitionCall({
  publicApi,
  product,
  operationId,
  memberKey,
  ordinal,
  request,
  slots = {},
  resources,
}) {
  const definition = definitionFor(publicApi, operationId, memberKey);
  const requestDigest = product.sha256Canonical(request);
  const admittedSlots = authoritySlots(product, definition, slots);
  const authorityBody = Object.freeze({
    kind: "invocation_authority",
    definitionKey: definition.definitionKey,
    slots: admittedSlots,
  });
  const invocationAuthority = Object.freeze({
    ...authorityBody,
    authorityDigest: product.sha256Canonical(authorityBody),
  });
  assert.ok(admittedContractCatalog, "installed contract catalog admitted");
  assert.ok(
    admittedDefinitionContractCoordinates,
    "installed definition contract coordinates admitted",
  );
  const operationContracts =
    admittedDefinitionContractCoordinates.operations.find((row) =>
      row.operationId === operationId
    );
  const memberContracts = operationContracts?.members.find((row) =>
    row.memberKey === memberKey
  );
  assert.ok(memberContracts, `${operationId}#${memberKey} contract coordinates`);
  const invocationContract = Object.freeze({
    contractCatalog: admittedContractCatalog,
    flatRow: Object.freeze({
      contractId: "abg.schema.public-operation-invocation",
      contractVersion: schemaVersion,
      contractDigest:
        publicApi.PUBLIC_PROJECTION_PAYLOADS.commonSchemaAsset.contentDigest,
    }),
    nestedSelector: Object.freeze({
      selectorKind: "schema_definition",
      definitionKey: null,
      slot: null,
      definitionRef: "#/$defs/PublicInvocation",
    }),
  });
  const invocationBody = Object.freeze({
    kind: "public_invocation",
    schemaVersion,
    invocationContract,
    definitionRef: definition.definitionRef,
    definitionVersion: schemaVersion,
    definitionDigest: definition.definitionDigest,
    definitionKey: definition.definitionKey,
    contractCatalog: admittedContractCatalog,
    invocationAuthority,
    requestContract: memberContracts.slots.request,
    requestRef:
      `public-request://abiogenesis/t287/w2-05/${String(ordinal).padStart(2, "0")}-${memberKey}`,
    requestDigest,
    request,
    expectedResultContract: memberContracts.slots.result,
    expectedRefusalContract: memberContracts.slots.refusal,
    expectedNonTerminalContract: memberContracts.slots.nonTerminal,
    correlationRef: "correlation://abiogenesis/t287/w2-05-owner-chain",
    eventTime: "2026-08-18T00:00:00.000Z",
    provenanceRefs: ["provenance://abiogenesis/t287/w2-05-worker"],
  });
  const invocationDigest = product.sha256Canonical(invocationBody);
  return Object.freeze({
    invocation: Object.freeze({
      ...invocationBody,
      invocationRef:
        `invocation://abiogenesis/${invocationDigest.slice("sha256:".length)}`,
      invocationDigest,
    }),
    resources,
  });
}

function rehashInvocation(product, call) {
  call.invocation.requestDigest = product.sha256Canonical(
    call.invocation.request,
  );
  const {
    authorityDigest: _authorityDigest,
    ...authorityBody
  } = call.invocation.invocationAuthority;
  call.invocation.invocationAuthority.authorityDigest =
    product.sha256Canonical(authorityBody);
  const {
    invocationRef: _invocationRef,
    invocationDigest: _invocationDigest,
    ...invocationBody
  } = call.invocation;
  call.invocation.invocationDigest = product.sha256Canonical(invocationBody);
  call.invocation.invocationRef =
    `invocation://abiogenesis/${call.invocation.invocationDigest.slice("sha256:".length)}`;
  return call;
}

async function cliCall(call, acquisition) {
  const path = join(installedHarness.scratch, `call-${++cliOrdinal}.jsonl`);
  await writeFile(path, `${JSON.stringify({
    kind: "abg_cli_transport_request", schemaVersion, acquisition, invocation: call,
  })}\n`);
  const started = Date.now();
  const pending = execFileAsync(installedHarness.cliPath, ["--jsonl", path], {
    cwd: installedHarness.cliHost, env: { ...process.env, NODE_OPTIONS: "" },
    timeout: call.invocation.definitionKey.memberKey === "start" ? 3_660_000 : 60_000,
    maxBuffer: 128 * 1024 * 1024,
  });
  const pid = pending.child.pid;
  await writeFile(join(installedHarness.scratch, `launch-${cliOrdinal}.json`), JSON.stringify({
    pid, started: new Date(started).toISOString(), definitionKey: call.invocation.definitionKey,
  }, null, 2) + "\n");
  let stdout, stderr;
  try { ({ stdout, stderr } = await pending); }
  catch (error) {
    stdout = error.stdout; stderr = error.stderr;
    await writeFile(join(installedHarness.scratch, `transport-error-${cliOrdinal}.json`),
      JSON.stringify({ name: error.name, message: error.message, code: error.code,
        signal: error.signal, killed: error.killed }, null, 2) + "\n");
  }
  await writeFile(join(installedHarness.scratch, `stdout-${cliOrdinal}.json`), stdout ?? "");
  await writeFile(join(installedHarness.scratch, `stderr-${cliOrdinal}.log`), stderr ?? "");
  const outcome = JSON.parse(stdout);
  await writeFile(join(installedHarness.scratch, `receipt-${cliOrdinal}.json`), `${JSON.stringify(outcome, null, 2)}\n`);
  observedCalls.push({
    pid, durationMs: Date.now() - started,
    definitionKey: call.invocation?.definitionKey ?? null,
    invocationRef: call.invocation?.invocationRef ?? null,
    invocationDigest: call.invocation?.invocationDigest ?? null,
    requestSha256: installedHarness.product.sha256Canonical(call),
    acquisitionKind: acquisition.kind,
    outcomeSha256: installedHarness.product.sha256Canonical(outcome),
    transportKind: outcome.kind,
    exitCode: outcome.receipt?.exitCode ?? null,
    code: outcome.code ?? outcome.receipt?.failure?.fault?.code ?? null,
    ownerOutputKind: outcome.receipt?.ownerOutput?.outcomeKind ?? null,
    disposition: outcome.receipt?.ownerOutput?.value?.disposition ?? null,
    closePrefix: outcome.receipt?.resources?.eventResource?.closeHandoff?.prefix ?? null,
  });
  console.log(JSON.stringify({ phase: "public_call", ordinal: cliOrdinal, pid, durationMs: Date.now() - started, definitionKey: call.invocation.definitionKey, exitCode: outcome.receipt?.exitCode ?? null }));
  return outcome;
}
function acquisitionFor(call) {
  const resource = call.resources.eventResource;
  return resource === undefined ? { kind: "eventless" }
    : resource.kind === "new_abg_event_resource"
    ? { kind: "new", eventLogPath: resource.eventLogPath }
    : { kind: "reopen", closeHandoff: resource.closeHandoff };
}
async function runBinding(_binding, call, label) {
  const outcome = await cliCall(call, acquisitionFor(call));
  assert.equal(outcome.kind, "installed_definition_call_transport_result", `${label}: ${JSON.stringify(outcome)}`);
  const value = outcome.receipt;
  assert.equal(value.exitCode, 0, `${label}: ${JSON.stringify(value)}`);
  assert.equal(value.ownerOutput.outcomeKind, "result", label);
  return value;
}

function reopenEventResource(product, closeHandoff) {
  return { kind: "reopen_abg_event_resource", schemaVersion, closeHandoff,
    handoffDigest: product.sha256Canonical(closeHandoff) };
}
async function inventory(root) {
  const rows = [];
  async function visit(relative) {
    const path = join(root, relative), stat = await lstat(path);
    if (stat.isSymbolicLink()) rows.push([relative, "link", await readlink(path)]);
    else if (stat.isFile()) rows.push([relative, "file", createHash("sha256").update(await readFile(path)).digest("hex")]);
    else if (stat.isDirectory()) for (const name of (await readdir(path)).sort()) await visit(join(relative, name));
  }
  await visit("");
  return { rows, members: rows.length, sha256: createHash("sha256").update(JSON.stringify(rows)).digest("hex") };
}




async function prepareDeclarationProduct({ scratch, product, gtl, abiArtifact, fixed, sourceFixture }) {
  const COMPATIBILITY_REF = "compatibility://abiogenesis/major/5";
  const IDS = { productId: "product://d1-handoff.example/source-declaration@5.0.0",
    moduleRef: "module://d1-handoff.example/source-handoff@5", programRef: "program://d1-handoff.example/source-handoff@5",
    graphFunctionRef: fixed.declaration.graphFunctionRef, graphRef: "graph://d1-handoff.example/source-handoff@5",
    startRef: "start://d1-handoff.example/source-handoff@5", closureContractRef: "contract://d1-handoff.example/source-handoff/closure@5",
    descriptorRef: "descriptor://d1-handoff.example/source-handoff@5", contributionManifestRef: "contribution-manifest://d1-handoff.example/source-handoff@5",
    catalogRef: "catalog://d1-handoff.example/source-handoff@5", provenanceRef: "provenance://d1-handoff.example/source-handoff@5" };
  const artifactBasis = { productId: abiArtifact.productId, artifactDigest: abiArtifact.artifactDigest,
    productContentDigest: abiArtifact.productContentDigest, productManifestDigest: abiArtifact.manifestDigest,
    packageName: abiArtifact.packageName, packageVersion: abiArtifact.packageVersion };
  const nativePublication = gtl.constructRequirementHandoffModulePublication(artifactBasis);
  assert.equal(abiArtifact.contributionManifest.publicationBindings.find(row => row.moduleRef === nativePublication.moduleRef)?.publicationDigest,
    product.modulePublicationSemanticDigest(nativePublication));
  const placeholder = `sha256:${"0".repeat(64)}`;
  const consumer = gtl.constructRequirementHandoffConsumerPublication({ ...artifactBasis, productId: IDS.productId,
    artifactDigest: placeholder, productContentDigest: placeholder, productManifestDigest: placeholder,
    packageName: "@d1-handoff.example/source-declaration", packageVersion: "5.0.0" }, nativePublication, fixed.declaration, IDS);
  const { kind: _kind, moduleVersion: _version, artifactDigest: _artifact, productContentDigest: _content,
    productManifestDigest: _manifest, ...publicationData } = JSON.parse(JSON.stringify(consumer));
  const packageName = "@d1-handoff.example/source-declaration";
  const packageVersion = "5.0.0";
  const catalogSchemaPath = "contracts/public-contract-catalog.schema.json";
  const specificationPath = "contracts/independent-source-input.json";
  await mkdir(scratch, { recursive: true });
  const sourceRoot = await mkdtemp(join(scratch, "single-start-worksite-product-"));
  await mkdir(join(sourceRoot, "build"));
  await mkdir(join(sourceRoot, "contracts/capabilities"), { recursive: true });
  const payload = {
    "package.json": {
      name: packageName,
      version: packageVersion,
      type: "module",
      exports: { "./publication": "./build/publication.json" },
      files: ["build", "contracts", "product-toolchain-manifest.json"],
    },
    "build/publication.json": publicationData,
    [specificationPath]: sourceFixture,
    [catalogSchemaPath]: { $schema: "https://json-schema.org/draft/2020-12/schema", $id: "https://d1-handoff.example/contracts/public-contract-catalog@5", type: "object" },
  };
  for (const [path, value] of Object.entries(payload)) {
    await writeFile(join(sourceRoot, path), `${product.canonicalJson(value)}\n`, "utf8");
  }
  const graph = product.constructCapabilityDefinitionGraph([]);
  const graphBytes = product.capabilityDefinitionGraphAssetBytes(graph);
  const graphCoordinate = product.capabilityDefinitionGraphCoordinate(graph);
  await writeFile(join(sourceRoot, product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH), graphBytes);
  const productRelativeLocators = Object.keys(payload).sort();
  const payloadInventory = await Promise.all(productRelativeLocators.map(async (path) => ({
    path, sha256: await product.sha256File(join(sourceRoot, path)),
  })));
  const productContentDigest = product.payloadInventoryDigest(payloadInventory);
  const catalogBody = {
    schemaVersion: "5.0.0", catalogId: IDS.catalogRef, catalogVersion: "5.0.0",
    catalogSchemaPath, catalogSchemaDigest: await product.sha256File(join(sourceRoot, catalogSchemaPath)), rows: [],
  };
  const catalog = { ...catalogBody, catalogDigest: product.sha256Canonical(catalogBody) };
  const materializePublication = (identity, data, installedGtl) => installedGtl.modulePublication({
    kind: "module_publication", moduleVersion: "5.0.0", ...structuredClone(data),
    artifactDigest: identity.artifactDigest, productContentDigest: identity.productContentDigest,
    productManifestDigest: identity.manifestDigest,
    contributions: data.contributions.map((row) => ({ ...structuredClone(row), provenanceRefs: [identity.artifactDigest, identity.manifestDigest] })),
  });
  // Artifact and manifest coordinates are excluded by the installed semantic
  // publication digest. Placeholders never represent verification or runtime truth.
  const placeholderDigest = `sha256:${"0".repeat(64)}`;
  const draft = materializePublication({ artifactDigest: placeholderDigest, productContentDigest, manifestDigest: placeholderDigest }, publicationData, gtl);
  const contributionManifest = {
    kind: "product_contribution_manifest", schemaVersion: "5.0.0",
    contributionManifestRef: IDS.contributionManifestRef, productId: IDS.productId,
    productVersion: packageVersion, descriptorRef: IDS.descriptorRef, productContentDigest,
    publicContractCatalogId: catalog.catalogId, publicContractCatalogDigest: catalog.catalogDigest,
    capabilityDefinitionGraph: graphCoordinate,
    publicationBindings: [{ moduleRef: IDS.moduleRef, publicationDigest: product.modulePublicationSemanticDigest(draft) }],
    rows: draft.contributions.map(({ provenanceRefs: _provenanceRefs, ...row }) => ({ moduleRef: IDS.moduleRef, ...structuredClone(row), provenanceRef: IDS.provenanceRef })),
  };
  const manifest = Object.freeze({
    kind: "abg_product_toolchain_manifest", schemaVersion: "5.0.0",
    productId: IDS.productId, packageName, packageVersion, productContentDigest, productRelativeLocators,
    descriptorRef: IDS.descriptorRef, publisherNamespace: "d1-handoff.example",
    contributionManifestRef: IDS.contributionManifestRef,
    contributionManifestDigest: product.sha256Canonical(contributionManifest), contributionManifest,
    compatibilityRefs: [COMPATIBILITY_REF],
    declaredDependencies: [{
      kind: "requires", productId: abiArtifact.productId, packageVersion: abiArtifact.packageVersion,
      compatibilityRef: COMPATIBILITY_REF,
      requiredContractRefs: ["abg.contract.gtl.root-declaration", "abg.schema.public-operation-invocation"],
      requiredCapabilityRefs: ["abg.capability.catalog.invoke-graph-function@5", "abg.capability.gtl.declare@5"],
    }],
    provenanceRef: IDS.provenanceRef, declaredCapabilityRefs: [],
    capabilityDefinitionGraph: { ...graphCoordinate, assetLocator: {
      path: product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH, mediaType: "application/json", schemaVersion: "5.0.0", contentDigest: product.sha256Bytes(graphBytes),
    } },
    publicContractCatalog: catalog,
  });
  await writeFile(join(sourceRoot, "product-toolchain-manifest.json"), `${product.canonicalJson(manifest)}\n`, "utf8");
  const artifacts = join(sourceRoot, "artifacts");
  await mkdir(artifacts);
  const { stdout } = await execFileAsync("npm", ["pack", "--ignore-scripts", "--json", "--pack-destination", artifacts], { cwd: sourceRoot, maxBuffer: 10 * 1024 * 1024 });
  const [packed] = JSON.parse(stdout);
  const artifactPath = join(artifacts, packed.filename);
  const basis = Object.freeze({ artifactDigest: await product.sha256File(artifactPath), manifestDigest: product.sha256Canonical(manifest), productContentDigest, productId: IDS.productId, packageName, packageVersion });
  return {
    artifactPath, artifactRef: basename(artifactPath), basis, ids: IDS, sourceRoot,
    manifest, contributionManifest: manifest.contributionManifest, publicationData,
    nativePublication,
    descriptorSource: { descriptorRef: IDS.descriptorRef, manifestPath: join(sourceRoot, "product-toolchain-manifest.json"), manifestDigest: basis.manifestDigest },
    async loadInstalledPublication({ installedRoot, gtl: installedGtl }) {
      const bytes = await readFile(join(installedRoot, "build/publication.json"));
      const expected = payloadInventory.find((row) => row.path === "build/publication.json");
      if (product.sha256Bytes(bytes) !== expected.sha256) throw new TypeError("installed single-start publication differs from packed payload");
      return materializePublication(basis, JSON.parse(bytes.toString("utf8")), installedGtl);
    },
  };
}

function bindIndependentSource(product, gtl, fixture) {
  const members = fixture.complete_source_inventory.members.map(x => ({ memberRef: x.source_ref, path: x.path,
    byteCount: x.byte_count, digest: `sha256:${x.sha256}` }));
  const contextRef = `context://d1/full-source/${fixture.complete_source_inventory.inventory_sha256}`;
  const terms = fixture.selected_source_spans.map(x => ({ requirementRef: `requirement://d1/${x.source_label}`,
    sourceBindings: [{ contextRef, memberRef: x.source_ref, memberDigest: `sha256:${x.source_ref.split(":").at(-1)}`,
      startByte: x.start_byte, endByte: x.end_byte_exclusive, spanDigest: `sha256:${x.sha256}` }] }));
  const declaration = gtl.constructRequirementHandoffDeclaration({ declarationRef: "declaration://d1/source-obligations@1",
    graphFunctionRef: "graph-function://d1-handoff.example/source-handoff@5",
    sourceRoleRef: `role://d1/${fixture.declared_provenance.selection_role}`,
    context: { contextRef, sourceLocator: fixture.declared_provenance.original_source_root,
      inventoryDigest: product.sha256Canonical(members), members }, terms,
    fulfillmentBindings: terms.map(term => ({ obligationRef: `obligation://${term.requirementRef.slice(14)}`,
      requirementRef: term.requirementRef, realizationContractRef: null, proofContractRef: null,
      proofPolicyRef: null, proofShapeRef: null })) });
  const input = product.constructRequirementHandoffInput({ kind: "requirement_handoff_input", schemaVersion,
    declarationRef: declaration.declarationRef, sourceRoleRef: declaration.sourceRoleRef,
    members: fixture.complete_source_inventory.members.map(x => ({ memberRef: x.source_ref, base64: x.base64 })) });
  return { declaration, input };
}
async function proveNegatives({ product, gtl, abg, fixed, fdBasis, output }) {
  const copy = value => JSON.parse(JSON.stringify(value));
  const cases = [];
  function rejects(label, basis, input, candidate = output) {
    assert.equal(abg.requirementHandoffResultMatches(basis, input, candidate), false, label); cases.push(label);
  }
  assert.equal(abg.requirementHandoffResultMatches(fdBasis, fixed.input, output), true);
  const missing = copy(fixed.input); missing.members.pop(); rejects("missing-source", fdBasis, missing);
  const swapped = copy(fixed.input); swapped.members.reverse(); rejects("swapped-source-identities", fdBasis, swapped);
  const wrongRole = { ...fixed.input, sourceRoleRef: "role://d1/wrong-role" }; rejects("wrong-role", fdBasis, wrongRole);
  const changed = copy(fixed.input); changed.members[0].base64 = Buffer.from("changed").toString("base64");
  rejects("changed-source-digest", fdBasis, changed);
  const smaller = copy(output); smaller.coverage.obligations.pop(); rejects("fabricated-smaller-output", fdBasis, fixed.input, smaller);
  const dropped = copy(output); dropped.declaration.terms.pop(); dropped.declaration.fulfillmentBindings.pop();
  dropped.coverage.obligations.splice(-2); rejects("lost-source-linked-obligation", fdBasis, fixed.input, dropped);
  const role = copy(output); role.coverage.obligations[0].role = "proof"; rejects("wrong-output-role", fdBasis, fixed.input, role);
  const twoCopy = copy(fdBasis); twoCopy.publication.requirementHandoffs[0].context.members[0].byteCount = 7;
  twoCopy.publication.requirementHandoffs[0].context.members[0].digest = product.sha256Bytes("changed");
  twoCopy.publication.requirementHandoffs[0].context.inventoryDigest = product.sha256Canonical(twoCopy.publication.requirementHandoffs[0].context.members);
  rejects("two-copy-weakened-publication-and-request", twoCopy, changed);
  // A locally valid smaller source/declaration/output still has no admitted owner basis.
  const jointlyWeakened = copy(fdBasis), jointlyInput = copy(fixed.input);
  const used = new Set(jointlyWeakened.publication.requirementHandoffs[0].terms.flatMap(t => t.sourceBindings.map(b => b.memberRef)));
  const selected = jointlyWeakened.publication.requirementHandoffs[0];
  const omitted = selected.context.members.findIndex(m => !used.has(m.memberRef));
  assert.ok(omitted >= 0);
  selected.context.members.splice(omitted, 1); jointlyInput.members.splice(omitted, 1);
  selected.context.inventoryDigest = product.sha256Canonical(selected.context.members);
  assert.deepEqual(gtl.constructRequirementHandoffDeclaration(selected), selected);
  const jointlyOutput = { ...copy(output), source: jointlyInput, declaration: selected, basis: { ...output.basis,
    publicationDigest: product.sha256Canonical(jointlyWeakened.publication), declarationDigest: product.sha256Canonical(selected),
    inputDigest: product.sha256Canonical(jointlyInput) } };
  assert.ok(jointlyOutput); assert.equal(product.isRequirementHandoffOutput(jointlyOutput), true);
  rejects("locally-valid-two-copy-smaller-source-and-output", jointlyWeakened, jointlyInput, jointlyOutput);
  const changedGraph = copy(fdBasis); changedGraph.graph.template.graphRef += "-changed";
  assert.equal(changedGraph.graph.materializationDigest, fdBasis.graph.materializationDigest);
  rejects("changed-graph-retained-materialization-digest", changedGraph, fixed.input);
  const wrongCall = copy(fdBasis); wrongCall.cCall.cCallRef += "-wrong"; rejects("wrong-native-call", wrongCall, fixed.input);
  const wrongExecution = copy(fdBasis); wrongExecution.executionBasis.actorRef += "-wrong"; rejects("wrong-native-execution", wrongExecution, fixed.input);
  const unknown = { ...fixed.input, expectedInventory: [] }; rejects("caller-owned-expected-inventory", fdBasis, unknown);
  return cases;
}
test("D1 installed fixed-source obligation handoff remains non-closing", async t => {
  const evidenceRoot = process.env.ABI5_D1_EVIDENCE_ROOT;
  const scratch = process.env.ABI5_D1_RUN_ROOT;
  if (!evidenceRoot || !scratch || !process.env.ABI5_WAVE1_FROZEN_ARTIFACT_PATH) {
    t.skip("requires exact frozen artifact, isolated run root and retained evidence path"); return;
  }
  await mkdir(evidenceRoot, { recursive: true });
  const attempt = process.env.ABI5_D1_ATTEMPT ?? "01";
  if (attempt === "01") await assert.rejects(() => lstat(scratch), { code: "ENOENT" });
  else assert.ok((await lstat(join(scratch, "workspace"))).isDirectory());
  const harnessScratch = attempt === "01" ? scratch : join(scratch, `harness-${attempt}`);
  if (attempt !== "01") await assert.rejects(() => lstat(harnessScratch), { code: "ENOENT" });
  const harness = await setupInstalledCliHarness({ after() {} }, packageRoot, {
    candidateBasisSource: "packed_artifact", scratchPath: harnessScratch,
    rootPublicationKinds: ["hello_world"],
  });
  installedHarness = { ...harness, scratch: join(scratch, `attempt-${attempt}`) };
  await mkdir(installedHarness.scratch, { recursive: true });
  const product = harness.product;
  const [publicApi, abg, gtl, validator] = await Promise.all(["public", "abg", "gtl", "validator"].map(
    surface => importInstalledPackageExport(harness, `@abiogenesis/typescript-tenant/${surface}`, `d1-${surface}`)));
  const hash = value => product.sha256Canonical(value);
  const coord = (ref, value) => ({ ref, digest: hash(value) });
  const ownerRequest = { artifactPath: harness.artifactPath, artifactRef: harness.artifactRef,
    ...expectedVerificationIdentity(harness.candidateBasis) };
  const ownerVerification = await product.ProductVerificationPort.verify({ kind: "product_verification_packet",
    schemaVersion, memberKey: "verify", targetKind: "packed_artifact", request: ownerRequest });
  assert.equal(ownerVerification.kind, "product_verification_success", JSON.stringify(ownerVerification));
  const abiArtifact = ownerVerification.verifiedArtifact;
  admittedContractCatalog = { productId: abiArtifact.productId, productContentDigest: abiArtifact.productContentDigest,
    catalogId: abiArtifact.catalogId, catalogVersion: schemaVersion, catalogDigest: abiArtifact.catalogDigest };
  admittedDefinitionContractCoordinates = abiArtifact.definitionContractCoordinates;
  let ordinal = 0, environment = null, closeHandoff = null;
  async function authorized(packet, request, resources, supplied = {}) {
    const definition = definitionFor(publicApi, packet.definitionKey.operationId, packet.definitionKey.memberKey);
    const slots = authoritySlots(product, definition, supplied);
    const basis = { kind: "admission_capability_data", schemaVersion,
      definition: { definitionKey: definition.definitionKey, definitionRef: definition.definitionRef,
        definitionDigest: definition.definitionDigest, owner: { ref: packet.owner.authorityRef, digest: packet.owner.authorityDigest } },
      ownerArtifact: { request: ownerRequest, verified: abiArtifact }, request,
      resourceScope: { resourcesDigest: hash(resources), authoritySlots: product.admissionAuthoritySlots(slots) },
      boundEnvironment: packet.metadata.workspaceBindingRequirement === "forbidden" ? null : product.admissionEnvironmentSelection(closeHandoff.prefix, slots.workspace_binding) };
    const authorityValue = { actorRef: ACTOR, authorityMode: "trusted_developer" };
    const approvalValue = { decision: "allow", actorRef: ACTOR, definitionRef: definition.definitionRef,
      definitionDigest: definition.definitionDigest, requestDigest: hash(request), scopeDigest: product.admissionAuthorityScope(basis).digest };
    // Explicit external trusted-desktop decision. ABI constructs the resulting grants.
    const authority = { kind: "resolved_admission_authority", schemaVersion, actorRef: ACTOR,
      authorityMode: "trusted_developer", authority: { ...coord("authority://d1-handoff.example/developer", authorityValue), value: authorityValue },
      approval: { ...coord(`approval://d1-handoff.example/${ordinal + 1}`, approvalValue), value: approvalValue } };
    const grants = await Promise.all(definition.capabilityRefs.map(capabilityRef => product.constructCapabilityGrant(
      authority, ACTOR, definition.definitionKey.operationId, capabilityRef,
      { kind: "admission_capability_grant_construction_basis", fixedPacket: packet, data: basis })));
    const call = definitionCall({ publicApi, product, ...definition.definitionKey, ordinal: ++ordinal, request,
      slots: { ...slots, capability_grants: { requiredCapabilityRefs: [...definition.capabilityRefs],
        grants: grants.map(row => ({ ref: row.grantRef, digest: row.grantDigest })) } },
      resources: { ...resources, admissionAuthority: { basis, authority, grants } } });
    assert.deepEqual(JSON.parse(JSON.stringify(call)), call, "only data crosses the installed JSON boundary");
    return call;
  }
  const invoke = (call, label) => runBinding(null, call, label);

  let phase = "workspace_create", installedBefore = null, preflight = null;
  const immutableBefore = await inventory(harness.installedPackageRoot);
  try {
    const workspaceRoot = join(scratch, "workspace");
    const workspaceResources = { kind: "workspace_resource_assertion", schemaVersion, targetRoot: workspaceRoot,
      targetRootDigest: hash({ kind: "workspace_target", targetRoot: workspaceRoot }) };
    const created = attempt === "01" ? await invoke(await authorized(product.WORKSPACE_OPERATION_SOURCE_DECLARATIONS.create.clean,
      { targetRoot: workspaceRoot, createPolicy: "clean", scaffoldPolicy: "none" }, workspaceResources,
      { actor: actorAuthority(product) }), "workspace.create")
      : JSON.parse(await readFile(join(scratch, "receipt-1.json"), "utf8")).receipt;
    const workspaceManifest = JSON.parse(await readFile(created.resources.manifest.locator, "utf8"));
    await invoke(await authorized(product.WORKSPACE_OPERATION_SOURCE_DECLARATIONS.open.open,
      { targetRoot: workspaceRoot, expectedAuthority: { ref: workspaceManifest.authorityBasis.authorityRef,
        digest: workspaceManifest.authorityBasis.authorityDigest } }, workspaceResources), "workspace.open");
    const fixtureBytes = await readFile(process.env.ABI5_D1_SOURCE_FIXTURE);
    assert.equal(createHash("sha256").update(fixtureBytes).digest("hex"), "13137b2080d9c9c6d8af5f5880f92b46a8cbbd4afc4c66451812e9e92f023871");
    const sourceFixture = JSON.parse(fixtureBytes);
    const fixed = bindIndependentSource(product, gtl, sourceFixture);
    const fixture = await prepareDeclarationProduct({ scratch, product, gtl, abiArtifact, fixed, sourceFixture });
    const consumerRequest = { artifactPath: fixture.artifactPath, artifactRef: fixture.artifactRef,
      ...expectedVerificationIdentity(fixture.basis) };
    const consumerVerification = await product.ProductVerificationPort.verify({ kind: "product_verification_packet",
      schemaVersion, memberKey: "verify", targetKind: "packed_artifact", request: consumerRequest });
    assert.equal(consumerVerification.kind, "product_verification_success", JSON.stringify(consumerVerification));
    const products = [
      { verification: ownerVerification, request: ownerRequest },
      { verification: consumerVerification, request: consumerRequest },
    ];
    for (const item of products) {
      const verified = item.verification.verifiedArtifact;
      item.packed = { kind: "product_verification_artifact_resource", schemaVersion, artifactPath: item.request.artifactPath,
        artifact: { ref: verified.artifactRef, digest: verified.artifactDigest },
        productContent: { ref: `product-content://abiogenesis/${verified.productContentDigest.slice(7)}`, digest: verified.productContentDigest },
        descriptor: item.verification.coordinates.descriptor,
        contributionManifest: { ref: verified.contributionManifestRef, digest: verified.contributionManifestDigest },
        manifestDigest: verified.manifestDigest, productId: verified.productId, packageName: verified.packageName, packageVersion: verified.packageVersion };
      const request = { targetKind: "packed_artifact", artifact: item.packed.artifact,
        productContent: item.packed.productContent, descriptor: item.packed.descriptor,
        contributionManifest: item.packed.contributionManifest, declaredDependencies: verified.declaredDependencies,
        compatibilityInputs: verified.compatibilityRefs.map(compatibilityRef => ({ compatibilityRef, subjectRef: item.packed.productContent.ref })) };
      const call = await authorized(product.PRODUCT_VERIFICATION_SOURCE_DECLARATIONS.verify, request,
        { kind: "product_verification_resources", schemaVersion, targetKind: "packed_artifact", packedArtifact: item.packed });
      item.receipt = await invoke(call, `verify ${verified.productId}`);
      item.reference = { invocation: { ref: call.invocation.invocationRef, digest: call.invocation.invocationDigest },
        outcome: item.receipt.ownerOutput.value.verifiedArtifact };
    }
    const verifiedProducts = products.map(item => item.verification.verifiedArtifact);
    const resolvedLock = product.ProductEnvironmentPort.resolve({ kind: "product_resolution_packet", schemaVersion,
      memberKey: "resolve", verifiedArtifacts: verifiedProducts });
    assert.equal(resolvedLock.kind, "resolved_product_lock", JSON.stringify(resolvedLock));
    const lock = { ref: resolvedLock.lockId, digest: resolvedLock.lockDigest };
    const references = products.map(item => item.reference);
    const resolveCall = await authorized(product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.resolve,
      { requirements: verifiedProducts.map(item => ({ productId: item.productId, packageVersion: item.packageVersion,
        requiredContractRefs: [], requiredCapabilityRefs: [] })), verifiedCandidates: references },
      { kind: "product_resolution_resource_assertion", schemaVersion,
        verifiedPreimages: products.map(item => ({ verification: item.reference, verifiedArtifact: item.verification.verifiedArtifact,
          verificationOutput: item.receipt.ownerOutput })),
        nativeContractClosure: { selectorDispositions: [], occurrences: [], nativeBindings: [] } },
      { verification_references: references });
    const resolved = await invoke(resolveCall, "product.resolve");
    assert.deepEqual(resolved.ownerOutput.value.resolvedLock, lock);
    const eventLogRoot = join(scratch, `events-${attempt}`);
    await mkdir(eventLogRoot);
    const eventLogPath = join(eventLogRoot, "runtime.events.jsonl");
    closeHandoff = null;
    const installed = [];
    const installTargets = products.map((_, index) => join(scratch, `installed-${attempt}-${index}`));
    for (const [index, item] of products.entries()) {
      const eventResource = closeHandoff ? reopenEventResource(product, closeHandoff) : {
        kind: "new_abg_event_resource", schemaVersion, eventLogPath,
        locatorDigest: hash({ kind: "abg_event_log_locator", eventLogPath: resolve(eventLogPath) }) };
      const call = await authorized(product.PRODUCT_INSTALL_SOURCE_DECLARATIONS.install,
        { verifiedArtifact: item.verification.coordinates.verifiedArtifact, descriptor: item.packed.descriptor,
          contributionManifest: item.packed.contributionManifest, resolvedLock: lock,
          targetRoot: installTargets[index], installPolicy: "clean" },
        { kind: "product_install_resource_assertion", schemaVersion, eventResource,
          packedArtifact: item.packed, verifiedArtifact: item.verification.verifiedArtifact, resolvedLock },
        { dependency_lock: lock, verification_references: [item.reference], actor: actorAuthority(product) });
      const result = await invoke(call, `product.install ${index}`);
      closeHandoff = result.resources.eventResource.closeHandoff;
      const truth = abg.projectExactPrefixArtifactTruth(closeHandoff.prefix);
      const projection = abg.projectAdmittedProductInstallByInvocationRef(truth, call.invocation.invocationRef);
      assert.ok(projection); installed.push(projection);
    }
    const authorityManifest = { workspaceId: workspaceManifest.workspaceRef, canonicalRoot: workspaceManifest.canonicalRoot,
      authorityMode: "trusted_developer", authorizedActorRef: ACTOR };
    const workspaceAuthority = product.constructWorkspaceAuthorityBasis({ ...authorityManifest,
      authorityManifestRef: "manifest://d1-handoff.example/workspace-authority", authorityManifestDigest: hash(authorityManifest) });
    assert.equal(workspaceAuthority.kind, "workspace_authority_basis");
    const declaredRoots = { toolchainRoot: installTargets[0], productRoot: installed[1].install.installedRoot,
      eventLogRoot: dirname(eventLogPath), runtimeStateRoot: join(workspaceRoot, "runtime"),
      projectionRoot: join(workspaceRoot, "projections"), archiveRoot: join(workspaceRoot, "archives") };
    const rootFields = { toolchain: "toolchainRoot", product: "productRoot", event_log: "eventLogRoot",
      runtime_state: "runtimeStateRoot", projection: "projectionRoot", archive: "archiveRoot" };
    const installCoordinates = installed.map(row => product.productInstallCoordinate(row.install));
    const bindCall = await authorized(product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.bind,
      { workspaceAuthority: { ref: workspaceAuthority.authorityBasisId, digest: workspaceAuthority.authorityBasisDigest },
        installedSet: installCoordinates, resolvedLock: lock,
        declaredRoots: Object.entries(rootFields).map(([rootKind, field]) => ({ rootKind, path: declaredRoots[field] })) },
      { kind: "product_workspace_binding_resource_assertion", schemaVersion, eventResource: reopenEventResource(product, closeHandoff),
        workspaceAuthority, workspaceManifest, admittedInstalls: installed.map(row => row.install), resolvedLock, declaredRoots },
      { product_set: installCoordinates, dependency_lock: lock, actor: actorAuthority(product) });
    const bound = await invoke(bindCall, "workspace.bind");
    closeHandoff = bound.resources.eventResource.closeHandoff;
    environment = abg.projectExactPrefixWorkspaceEnvironment(closeHandoff.prefix, bound.ownerOutput.value.binding);
    assert.equal(environment.kind, "exact_prefix_workspace_environment");
    installedBefore = await Promise.all(environment.productInstalls.map(install => inventory(install.installedRoot)));
    const consumerPublication = await fixture.loadInstalledPublication({ installedRoot: installed[1].install.installedRoot, gtl });
    const artifactBasis = { productId: abiArtifact.productId, artifactDigest: abiArtifact.artifactDigest,
      productContentDigest: abiArtifact.productContentDigest, productManifestDigest: abiArtifact.manifestDigest,
      packageName: abiArtifact.packageName, packageVersion: abiArtifact.packageVersion };
    const publications = [gtl.constructHelloWorldModulePublication(artifactBasis), gtl.constructConsensusModulePublication(artifactBasis),
      gtl.constructWorksiteConstructionModulePublication(artifactBasis), gtl.constructWorksiteCommandExecutionModulePublication(artifactBasis),
      fixture.nativePublication, consumerPublication];
    const boundSlots = { workspace_binding: bound.ownerOutput.value.binding, product_set: environment.productInstalls.map(product.productInstallCoordinate),
      dependency_lock: lock, actor: actorAuthority(product) };
    const catalogCall = await authorized(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.admit,
      { workspaceBinding: bound.ownerOutput.value.binding, descriptors: products.map(item => item.packed.descriptor),
        contributionManifests: products.map(item => item.packed.contributionManifest), resolvedLock: lock },
      { kind: "catalog_admission_resource_assertion", schemaVersion, eventResource: reopenEventResource(product, closeHandoff),
        workspaceBinding: environment.workspaceBinding, resolvedLock, verifiedProducts,
        admittedInstalls: environment.productInstalls, publications }, boundSlots);
    // Resolve every catalog/conformance/installed owner relation before Public dispatch.
    const preparedCatalog = product.CatalogOperationPort.admit({ kind: "catalog_admit_packet", schemaVersion, memberKey: "admit",
      readinessBasis: { workspaceBinding: environment.workspaceBindingCandidate, resolvedLock, verifiedProducts,
        installedProducts: installed.map(row => row.candidate), publications } });
    assert.equal(preparedCatalog.kind, "graph_function_catalog", JSON.stringify(preparedCatalog));
    const preparedAllowlist = preparedCatalog.entries.filter(row => row.programMembershipRefs.includes(fixture.ids.programRef)).map(row => row.handle).sort();
    const preparedView = product.narrowGraphFunctionCatalog(preparedCatalog, preparedAllowlist);
    assert.equal(preparedView.kind, "graph_function_catalog_view");
    const preparedClosure = product.resolveProgramDeclarationClosure(preparedCatalog, preparedView, fixture.ids.programRef);
    assert.equal(preparedClosure.kind, "resolved_program_declaration_closure", JSON.stringify(preparedClosure));
    assert.deepEqual(preparedClosure.programPublication, consumerPublication);
    const preparedConformance = validator.validateProgram(product.constructCatalogProgramValidationInput(
      preparedCatalog, preparedView, preparedClosure, consumerPublication.programs[0]));
    assert.equal(preparedConformance.kind, "program_validation", JSON.stringify(preparedConformance));
    const preparedResolution = await product.ProductExecutionResolutionPort.resolve({ catalog: preparedCatalog, catalogView: preparedView,
      admittedInstalls: environment.productInstalls,
      verifyInstallAdmission: install => abg.hasAdmittedProductInstall(environment.artifactTruth, install), programRef: fixture.ids.programRef,
      selection: { kind: "start", scope: "program", target: "next", until: "converged", rootMode: "direct" } });
    assert.equal(preparedResolution.kind, "loaded_product_execution_resolution", JSON.stringify(preparedResolution));
    await writeFile(join(installedHarness.scratch, "declaration-preflight.json"), JSON.stringify({ preparedCatalog,
      preparedView, preparedClosure, preparedConformance, resolution: preparedResolution.resolution }, null, 2)+"\n");
    const catalogReceipt = await invoke(catalogCall, "catalog.admit");
    closeHandoff = catalogReceipt.resources.eventResource.closeHandoff;
    const catalog = product.CatalogOperationPort.admit({ kind: "catalog_admit_packet", schemaVersion, memberKey: "admit",
      readinessBasis: { workspaceBinding: environment.workspaceBindingCandidate, resolvedLock, verifiedProducts,
        installedProducts: installed.map(row => row.candidate), publications } });
    assert.equal(catalog.kind, "graph_function_catalog", JSON.stringify(catalog));

    const allowlist = catalog.entries.filter(row => row.programMembershipRefs.includes(fixture.ids.programRef)).map(row => row.handle).sort();
    const viewReceipt = await invoke(await authorized(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.view.allowlist,
      { catalog: catalogReceipt.ownerOutput.value.catalog, allowlist },
      { kind: "catalog_view_resource_assertion", schemaVersion, catalog }, boundSlots), "catalog.view");
    const catalogView = product.narrowGraphFunctionCatalog(catalog, allowlist);
    assert.equal(catalogView.kind, "graph_function_catalog_view");
    const catalogScope = { catalog: catalogReceipt.ownerOutput.value.catalog, view: viewReceipt.ownerOutput.value.view, allowlist };
    const applications = [], applicationResources = [];
    const program = consumerPublication.programs.find(row => row.programRef === fixture.ids.programRef);
    phase = "conformance";
    const law = coord("law://abiogenesis/validator/gtl-program@5", { ref: "law://abiogenesis/validator/gtl-program@5" });
    const conformance = await invoke(await authorized(validator.CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program,
      { program: coord(program.programRef, program), conformanceLaw: law,
        inventoryBasis: { kind: "declared_inventory", inventory: catalog.boundPublications.map(p => coord(p.moduleRef, p)).sort((a, b) => a.ref.localeCompare(b.ref)) } },
      { kind: "conformance_evaluation_resource_assertion", schemaVersion, packet: { kind: "conformance_evaluate_packet", schemaVersion,
        memberKey: "gtl_program", publication: consumerPublication, program }, conformanceLaw: law,
        declaredInventory: catalog.boundPublications,
        declarationCatalog: { catalog, catalogView } }, boundSlots), "conformance.evaluate");
    assert.equal(conformance.ownerOutput.value.disposition, "passed", JSON.stringify(conformance.ownerOutput));
    phase = "installed_owner_resolution";
    const resolution = await product.ProductExecutionResolutionPort.resolve({ catalog, catalogView,
      admittedInstalls: environment.productInstalls,
      verifyInstallAdmission: install => abg.hasAdmittedProductInstall(environment.artifactTruth, install),
      programRef: fixture.ids.programRef,
      selection: { kind: "start", scope: "program", target: "next", until: "converged", rootMode: "direct" } });
    assert.equal(resolution.kind, "loaded_product_execution_resolution", JSON.stringify(resolution));
    const runPacket = product.RUN_OPERATION_CONTRACTS.invoke.start;
    const binding = environment.workspaceBinding, A = environment.workspaceAuthorityBasis;
    assert.equal(binding.roots.productRoot, installed.at(-1).install.installedRoot);
    assert.equal(binding.roots.toolchainRoot, installTargets[0]);
    assert.notEqual(A.canonicalRoot, binding.roots.productRoot);
    const policy = product.constructRootInvocationPolicy(binding, resolution.program, [], ["F_D"], applications);
    const grantBasis = { admittedInstalls: environment.productInstalls, workspaceBinding: binding, fixedPacket: runPacket };
    const grants = [product.constructCapabilityGrant(policy, ACTOR, "abg.operation.run.invoke", product.DIRECT_INVOKE_CAPABILITY, grantBasis)];
    const authority = product.constructInvocationAuthority(ACTOR, binding, catalogView, program.programRef,
      resolution.selectedCatalogEntry, policy, grants, grantBasis);
    assert.equal(authority.kind, "invocation_authority");
    phase = "input_and_authority_preflight";
    const input = fixed.input;
    const inputContract = { ref: resolution.resolution.inputContract.contractRef, digest: resolution.resolution.inputContractDigest };
    const admittedInput = product.admitInstalledProductInput(resolution.productSemantics, inputContract.ref, input);
    assert.ok(admittedInput, "actual installed semantics admits the complete preparation input");
    const rawInput = validator.rawAdmitValue(admittedInput, "invocation_input", inputContract.ref);
    assert.equal(rawInput.kind, "raw_admitted_value");
    const inputCarrier = { contract: inputContract, valueRef: "value://d1-handoff.example/two-orders/input",
      valueDigest: hash(input), value: input };
    const eventResource = reopenEventResource(product, closeHandoff), steeringDigest = hash(eventResource);
    const runSlots = { workspace_binding: boundSlots.workspace_binding,
      product_set: environment.productInstalls.map(install => ({ ref: install.installId, digest: install.productContentDigest })),
      dependency_lock: lock, catalog_scope: catalogScope,
      execution_program: { ref: program.programRef, digest: resolution.resolution.programDigest },
      input_contract: inputCarrier, session_policy: { ref: policy.policyRef, digest: policy.policyDigest },
      capability_grants: { requiredCapabilityRefs: [...runPacket.metadata.capabilityRefs], grants: grants.map(grant => ({ ref: grant.grantRef, digest: grant.grantDigest })) },
      actor: { actor: { ref: ACTOR, digest: hash({ actorRef: ACTOR }) }, attribution: { ref: authority.authorityRef, digest: authority.authorityDigest } },
      transport_steering: { ref: `transport-steering://abiogenesis/${steeringDigest.slice(7)}`, digest: steeringDigest } };
    const runCall = definitionCall({ publicApi, product, ...runPacket.definitionKey, ordinal: ++ordinal,
      request: { program: runSlots.execution_program, scope: "program", target: { kind: "next" }, until: "converged",
        catalogView: catalogScope.view, allowlist, input: inputCarrier, fhMode: "direct", rootMode: "direct", sourceBasis: { kind: "none" } },
      slots: runSlots, resources: { kind: "run_invocation_resource_assertion", schemaVersion, eventResource,
        catalog, catalogView, applications, applicationResources, source: { kind: "none" } } });
    assert.equal(product.isRunInvocationResourceAssertion(runCall.resources), true,
      "exact run resources satisfy the installed owner structural schema before start");
    const invocation = product.constructExactStartInvocation(runCall.invocation, binding, catalogView, resolution.program,
      resolution.selectedCatalogEntry, rawInput, policy, grants, authority);
    assert.equal(invocation.kind, "public_invocation_candidate", JSON.stringify(invocation));
    preflight = { environment, catalog, catalogView, program, publications, resolution: resolution.resolution,
      fixed, runCall, closeHandoff, installedBefore, immutableBefore };
    await writeFile(join(installedHarness.scratch, "preflight.json"), JSON.stringify(preflight, null, 2) + "\n");
    phase = "native_handoff";
    const ran = await invoke(runCall, "fixed source handoff");
    assert.equal(ran.ownerOutput.value.disposition, "completed", JSON.stringify(ran.ownerOutput));
    closeHandoff = ran.resources.eventResource.closeHandoff;
    phase = "fresh_reads";
    const reads = {};
    for (const memberKey of ["run_result", "run_replay"]) {
      const packet = abg.ABG_PROJECT_READ_CONTRACTS[memberKey];
      const readGrants = packet.metadata.capabilityRefs.map(capabilityRef => product.constructCapabilityGrant(
        A, ACTOR, packet.definitionKey.operationId, capabilityRef,
        { admittedInstalls: environment.productInstalls, workspaceBinding: binding, fixedPacket: packet }));
      reads[memberKey] = await invoke(definitionCall({ publicApi, product, ...packet.definitionKey, ordinal: ++ordinal,
        request: { caseKey: memberKey,
          source: { sourceKind: "run", sourceRef: ran.ownerOutput.value.run.ref, sourceDigest: ran.ownerOutput.value.run.digest },
          projectionBasis: { projectionBasisRef: closeHandoff.prefix.eventLogRef, projectionBasisDigest: closeHandoff.prefix.coordinateDigest },
          selector: memberKey === "run_replay" ? { kind: "ordinal_page", fromOrdinal: 0, limit: 10000 } : { kind: "none" } },
        slots: { workspace_binding: boundSlots.workspace_binding, product_set: runSlots.product_set, dependency_lock: lock,
          capability_grants: { requiredCapabilityRefs: [...packet.metadata.capabilityRefs], grants: readGrants.map(row => ({ ref: row.grantRef, digest: row.grantDigest })) } },
        resources: { kind: "abg_project_read_resource_assertion", schemaVersion, eventResource: reopenEventResource(product, closeHandoff) } }), `fresh ${memberKey}`);
      assert.deepEqual(reads[memberKey].resources.eventResource.closeHandoff.prefix, closeHandoff.prefix);
    }
    assert.deepEqual(reads.run_result.ownerOutput.value.projection.result, ran.ownerOutput.value.result);
    const prefix = abg.selectValidatedRuntimeEventPrefix(abg.readRuntimeEventsAtDurablePrefix(closeHandoff.prefix));
    const admission = abg.rehydrateInvocationAdmissionAtPrefix(prefix, ran.resources.invocationAdmission.ref);
    const resultBasis = abg.deriveInvocationSourceResultBasisAtPrefix(prefix, { publicAuthorityDigest: runCall.invocation.invocationDigest,
      runtimeInvocationRef: admission.invocationRef, invocationAdmissionRef: ran.resources.invocationAdmission.ref,
      runId: ran.ownerOutput.value.run.ref, resultRef: ran.ownerOutput.value.result.ref });
    assert.ok(resultBasis);
    assert.equal(resultBasis.sourceResultValue.kind, "requirement_handoff_output");
    const output = resultBasis.sourceResultValue;
    assert.equal(output.coverage.disposition, "non_closing");
    assert.deepEqual(output.source, fixed.input);
    assert.deepEqual(output.declaration, fixed.declaration);
    assert.equal(output.coverage.obligations.length, 10);
    assert.equal(output.source.members.length, 5);
    const events = abg.readRuntimeEventsAtDurablePrefix(closeHandoff.prefix);
    const opened = events.find(e => e.kind === "c_call_opened" && e.aggregateId === output.basis.cCallRef);
    const fibre = events.find(e => e.kind === "c_call_fibre_selected" && e.aggregateId === opened.aggregateId);
    const basisEvent = events.find(e => e.kind === "basis_admitted" && e.basisId === opened.basisId);
    assert.ok(opened && fibre && basisEvent);
    const logLines = (await readFile(fileURLToPath(closeHandoff.prefix.eventLogRef), "utf8")).split("\n");
    const fibreLine = logLines.findIndex(line => line && JSON.parse(line).eventId === fibre.eventId);
    assert.ok(fibreLine >= 0);
    const bytes = Buffer.from(logLines.slice(0, fibreLine + 1).join("\n") + "\n");
    const { coordinateDigest: _coordinate, ...prefixBody } = closeHandoff.prefix;
    const preBody = { ...prefixBody, prefixLength: bytes.length, prefixDigest: product.sha256Bytes(bytes) };
    const pre = { ...preBody, coordinateDigest: product.sha256Canonical(preBody) };
    assert.ok(abg.validateDurablePrefixCoordinate(pre));
    const execution = abg.rehydrateExecutionBasisAtPrefix(prefix, opened.basisId);
    const graph = gtl.materializeGraph(resolution.graphFunction, { invocationAdmissionRef: execution.invocationAdmissionRef,
      admittedInputRef: execution.rawInputAdmissionRef, admittedInputDigest: execution.rawInputDigest, admittedInput: execution.rawInputValue });
    assert.equal(graph.materializationDigest, execution.graphDigest);
    // Read-only owner guard evidence uses the installed native projection; it is not an added Public export.
    const cCallProjection = await import(pathToFileURL(join(harness.installedPackageRoot, "build/code/src/abg/c_call.js")).href);
    const fdBasis = { publication: consumerPublication, graph, graphFunction: resolution.graphFunction,
      executionBasis: execution, cCall: cCallProjection.projectOpenedCCallCarrierAtPrefix(prefix, graph, opened.aggregateId), predecessorPrefix: pre };
    assert.ok(abg.authenticateRequirementHandoffBasis(fdBasis));
    const negativeProof = await proveNegatives({ product, gtl, abg, fixed, fdBasis, output });
    const installedAfter = await Promise.all(environment.productInstalls.map(install => inventory(install.installedRoot)));
    assert.deepEqual(installedAfter, installedBefore);
    assert.deepEqual(await inventory(harness.installedPackageRoot), immutableBefore);
    const proof = { disposition: "awaiting_independent_review", fixtureSha256: "13137b2080d9c9c6d8af5f5880f92b46a8cbbd4afc4c66451812e9e92f023871",
      artifactSha256: await product.sha256File(harness.artifactPath), preflight, runReceipt: ran, reads, resultBasis,
      closeHandoff, fdBasis, negativeProof, observedCalls, installedAfter };
    await writeFile(join(installedHarness.scratch, "proof.json"), JSON.stringify(proof, null, 2) + "\n", { flag: "wx" });
    console.log(JSON.stringify({ disposition: proof.disposition, run: ran.ownerOutput.value.run,
      sourceMembers: 5, sourceBytes: 135805, obligations: 10, coverage: output.coverage.disposition, negativeProof }));
  } catch (error) {
    const failure = { phase, name: error.name, message: error.message, stack: error.stack, observedCalls, preflight };
    await writeFile(join(scratch, `first-cause-${Date.now()}.json`), JSON.stringify(failure, null, 2) + "\n", { flag: "wx" });
    throw error;
  }
});

test("D1 declarations preserve full independent bytes and refuse invalid source pairing", async () => {
  if (!process.env.ABI5_WAVE1_FROZEN_INSTALL_HOST || !process.env.ABI5_D1_SOURCE_FIXTURE) return;
  const harness = { cliHost: process.env.ABI5_WAVE1_FROZEN_INSTALL_HOST };
  const [product, gtl] = await Promise.all(["product", "gtl"].map(surface =>
    importInstalledPackageExport(harness, `@abiogenesis/typescript-tenant/${surface}`, `d1-declaration-${surface}`)));
  const bytes = await readFile(process.env.ABI5_D1_SOURCE_FIXTURE);
  assert.equal(createHash("sha256").update(bytes).digest("hex"), "13137b2080d9c9c6d8af5f5880f92b46a8cbbd4afc4c66451812e9e92f023871");
  const fixed = bindIndependentSource(product, gtl, JSON.parse(bytes));
  const copy = value => JSON.parse(JSON.stringify(value));
  const cases = [];
  function bad(label, change) {
    const value = copy(fixed.declaration); change(value);
    assert.throws(() => gtl.constructRequirementHandoffDeclaration(value), TypeError, label); cases.push(label);
  }
  bad("omitted-paired-binding", value => value.fulfillmentBindings.pop());
  bad("duplicate-requirement", value => value.terms.push(copy(value.terms[0])));
  bad("crossed-binding-role-relation", value => value.fulfillmentBindings[0].requirementRef = value.terms[1].requirementRef);
  bad("duplicate-source-member", value => value.context.members.push(copy(value.context.members[0])));
  bad("unknown-declaration-field", value => value.closureEligible = true);
  bad("unknown-term-field", value => value.terms[0].fulfilled = true);
  bad("dangling-source-ref", value => value.terms[0].sourceBindings[0].memberRef += "wrong");
  bad("wrong-member-digest", value => value.terms[0].sourceBindings[0].memberDigest = `sha256:${"0".repeat(64)}`);
  bad("outside-source-span", value => value.terms[0].sourceBindings[0].endByte = 999999);
  bad("empty-source-span", value => value.terms[0].sourceBindings[0].endByte = value.terms[0].sourceBindings[0].startByte);
  assert.throws(() => product.constructRequirementHandoffInput({ ...fixed.input, sourceRoleRef: "" }), TypeError);
  const input = copy(fixed.input); input.members[0].base64 += "\n";
  assert.throws(() => product.constructRequirementHandoffInput(input), TypeError);
  assert.equal(fixed.input.members.reduce((sum, row) => sum + Buffer.from(row.base64, "base64").length, 0), 135805);
  for (const term of fixed.declaration.terms) for (const span of term.sourceBindings) {
    const source = fixed.input.members.find(row => row.memberRef === span.memberRef);
    assert.equal(product.sha256Bytes(Buffer.from(source.base64, "base64").subarray(span.startByte, span.endByte)), span.spanDigest);
  }
  console.log(JSON.stringify({ check: "independent-source-declarations", rejected: cases, sourceMembers: 5, byteCount: 135805 }));
});


test("D1 retained catalog continuation reaches admitted handoff and replay", async () => {
  if (!process.env.ABI5_D1_CONTINUE) return;
  const scratch = process.env.ABI5_D1_RUN_ROOT;
  const epoch = join(scratch, process.env.ABI5_D1_RETAINED_EPOCH ?? "attempt-03");
  const readCall = async ordinal => JSON.parse(await readFile(join(epoch, `call-${ordinal}.jsonl`), "utf8")).invocation;
  const boundCall = await readCall(7);
  const boundReceipt = JSON.parse(await readFile(join(epoch, "receipt-7.json"), "utf8")).receipt;
  assert.equal(boundReceipt.exitCode, 0);
  let closeHandoff = boundReceipt.resources.eventResource.closeHandoff;
  const installCalls = await Promise.all([5,6].map(readCall));
  const harness = { cliHost: process.env.ABI5_WAVE1_FROZEN_INSTALL_HOST,
    installedPackageRoot: join(process.env.ABI5_WAVE1_FROZEN_INSTALL_HOST, "node_modules/@abiogenesis/typescript-tenant"),
    artifactPath: process.env.ABI5_WAVE1_FROZEN_ARTIFACT_PATH };
  installedHarness = { ...harness, cliPath: join(harness.cliHost, "node_modules/.bin/abg.cli"), scratch: join(epoch, `catalog-continuation-${process.env.ABI5_D1_CONTINUATION_ATTEMPT ?? "01"}`) };
  await mkdir(installedHarness.scratch);
  const [product, publicApi, abg, gtl, validator] = await Promise.all(["product", "public", "abg", "gtl", "validator"].map(
    surface => importInstalledPackageExport(harness, `@abiogenesis/typescript-tenant/${surface}`, `d1-continue-${surface}`)));
  installedHarness.product = product;
  const hash = value => product.sha256Canonical(value), coord = (ref, value) => ({ ref, digest: hash(value) });
  const manifest = JSON.parse(await readFile(join(harness.installedPackageRoot, "product-toolchain-manifest.json"), "utf8"));
  const ownerRequest = { artifactPath: harness.artifactPath, artifactRef: basename(harness.artifactPath),
    ...expectedVerificationIdentity({ artifactDigest: await product.sha256File(harness.artifactPath), productContentDigest: manifest.productContentDigest,
      manifestDigest: hash(manifest), productId: manifest.productId, packageName: manifest.packageName, packageVersion: manifest.packageVersion }) };
  const ownerVerification = await product.ProductVerificationPort.verify({ kind: "product_verification_packet", schemaVersion,
    memberKey: "verify", targetKind: "packed_artifact", request: ownerRequest });
  assert.equal(ownerVerification.kind, "product_verification_success");
  const abiArtifact = ownerVerification.verifiedArtifact;
  admittedContractCatalog = { productId: abiArtifact.productId, productContentDigest: abiArtifact.productContentDigest,
    catalogId: abiArtifact.catalogId, catalogVersion: schemaVersion, catalogDigest: abiArtifact.catalogDigest };
  admittedDefinitionContractCoordinates = abiArtifact.definitionContractCoordinates;
  const boundSlots = { workspace_binding: boundReceipt.ownerOutput.value.binding,
    product_set: boundCall.invocation.invocationAuthority.slots.product_set,
    dependency_lock: boundCall.invocation.request.resolvedLock, actor: actorAuthority(product) };
  const bound = { ownerOutput: { value: { binding: boundSlots.workspace_binding } } };
  const environment = abg.projectExactPrefixWorkspaceEnvironment(closeHandoff.prefix, boundSlots.workspace_binding);
  assert.equal(environment.kind, "exact_prefix_workspace_environment");
  const installed = await Promise.all([5, 6].map(async ordinal => abg.projectAdmittedProductInstallByInvocationRef(
    environment.artifactTruth, (await readCall(ordinal)).invocation.invocationRef)));
  assert.ok(installed.every(Boolean));
  const installTargets = installed.map(row => row.install.consumerRoot);
  const resolvedLock = boundCall.resources.resolvedLock, lock = boundCall.invocation.request.resolvedLock;
  const artifactBasis = { productId: abiArtifact.productId, artifactDigest: abiArtifact.artifactDigest,
    productContentDigest: abiArtifact.productContentDigest, productManifestDigest: abiArtifact.manifestDigest,
    packageName: abiArtifact.packageName, packageVersion: abiArtifact.packageVersion };
  const consumerIdentity = installed[1].install;
  const consumerData = JSON.parse(await readFile(join(consumerIdentity.installedRoot, "build/publication.json"), "utf8"));
  const consumerPublication = gtl.modulePublication({ kind: "module_publication", moduleVersion: "5.0.0", ...consumerData,
    artifactDigest: consumerIdentity.artifactDigest, productContentDigest: consumerIdentity.productContentDigest,
    productManifestDigest: consumerIdentity.manifestDigest, contributions: consumerData.contributions.map(row =>
      ({ ...row, provenanceRefs: [consumerIdentity.artifactDigest, consumerIdentity.manifestDigest] })) });
  const publications = [gtl.constructHelloWorldModulePublication(artifactBasis), gtl.constructConsensusModulePublication(artifactBasis),
    gtl.constructWorksiteConstructionModulePublication(artifactBasis), gtl.constructWorksiteCommandExecutionModulePublication(artifactBasis),
    gtl.constructRequirementHandoffModulePublication(artifactBasis), consumerPublication];
  const fixed = bindIndependentSource(product, gtl, JSON.parse(await readFile(process.env.ABI5_D1_SOURCE_FIXTURE, "utf8")));
  assert.deepEqual(consumerPublication.requirementHandoffs, [fixed.declaration]);
  const fixture = { ids: { programRef: consumerPublication.programs[0].programRef } };
  const verifiedProducts = installCalls.map(c => c.resources.verifiedArtifact);
  const installedBefore = await Promise.all(environment.productInstalls.map(install => inventory(install.installedRoot)));
  const immutableBefore = await inventory(harness.installedPackageRoot);
  let ordinal = 100;
  async function authorized(packet, request, resources, supplied = {}) {
    const definition = definitionFor(publicApi, packet.definitionKey.operationId, packet.definitionKey.memberKey);
    const slots = authoritySlots(product, definition, supplied);
    const basis = { kind: "admission_capability_data", schemaVersion,
      definition: { definitionKey: definition.definitionKey, definitionRef: definition.definitionRef,
        definitionDigest: definition.definitionDigest, owner: { ref: packet.owner.authorityRef, digest: packet.owner.authorityDigest } },
      ownerArtifact: { request: ownerRequest, verified: abiArtifact }, request,
      resourceScope: { resourcesDigest: hash(resources), authoritySlots: product.admissionAuthoritySlots(slots) },
      boundEnvironment: packet.metadata.workspaceBindingRequirement === "forbidden" ? null : product.admissionEnvironmentSelection(closeHandoff.prefix, slots.workspace_binding) };
    const authorityValue = { actorRef: ACTOR, authorityMode: "trusted_developer" };
    const approvalValue = { decision: "allow", actorRef: ACTOR, definitionRef: definition.definitionRef,
      definitionDigest: definition.definitionDigest, requestDigest: hash(request), scopeDigest: product.admissionAuthorityScope(basis).digest };
    // Explicit external trusted-desktop decision. ABI constructs the resulting grants.
    const authority = { kind: "resolved_admission_authority", schemaVersion, actorRef: ACTOR,
      authorityMode: "trusted_developer", authority: { ...coord("authority://d1-handoff.example/developer", authorityValue), value: authorityValue },
      approval: { ...coord(`approval://d1-handoff.example/${ordinal + 1}`, approvalValue), value: approvalValue } };
    const grants = await Promise.all(definition.capabilityRefs.map(capabilityRef => product.constructCapabilityGrant(
      authority, ACTOR, definition.definitionKey.operationId, capabilityRef,
      { kind: "admission_capability_grant_construction_basis", fixedPacket: packet, data: basis })));
    const call = definitionCall({ publicApi, product, ...definition.definitionKey, ordinal: ++ordinal, request,
      slots: { ...slots, capability_grants: { requiredCapabilityRefs: [...definition.capabilityRefs],
        grants: grants.map(row => ({ ref: row.grantRef, digest: row.grantDigest })) } },
      resources: { ...resources, admissionAuthority: { basis, authority, grants } } });
    assert.deepEqual(JSON.parse(JSON.stringify(call)), call, "only data crosses the installed JSON boundary");
    return call;
  }
  const invoke = (call, label) => runBinding(null, call, label);


  let phase = "retained_catalog", preflight = null;
  try {
    const catalog = product.CatalogOperationPort.admit({ kind: "catalog_admit_packet", schemaVersion, memberKey: "admit",
      readinessBasis: { workspaceBinding: environment.workspaceBindingCandidate, resolvedLock, verifiedProducts,
        installedProducts: installed.map(row => row.candidate), publications } });
    assert.equal(catalog.kind, "graph_function_catalog", JSON.stringify(catalog));
    const allowlist = catalog.entries.filter(row => row.programMembershipRefs.includes(fixture.ids.programRef)).map(row => row.handle).sort();
    const catalogView = product.narrowGraphFunctionCatalog(catalog, allowlist);
    assert.equal(catalogView.kind, "graph_function_catalog_view");
    const closure = product.resolveProgramDeclarationClosure(catalog, catalogView, fixture.ids.programRef);
    assert.equal(closure.kind, "resolved_program_declaration_closure", JSON.stringify(closure));
    assert.deepEqual(closure.programPublication, consumerPublication);
    const validation = validator.validateProgram(product.constructCatalogProgramValidationInput(catalog, catalogView, closure, consumerPublication.programs[0]));
    assert.equal(validation.kind, "program_validation", JSON.stringify(validation));
    const resolved = await product.ProductExecutionResolutionPort.resolve({ catalog, catalogView,
      admittedInstalls: environment.productInstalls,
      verifyInstallAdmission: install => abg.hasAdmittedProductInstall(environment.artifactTruth, install),
      programRef: fixture.ids.programRef,
      selection: { kind: "start", scope: "program", target: "next", until: "converged", rootMode: "direct" } });
    assert.equal(resolved.kind, "loaded_product_execution_resolution", JSON.stringify(resolved));
    assert.deepEqual(catalog.readinessBasis.workspaceBinding, environment.workspaceBindingCandidate);
    assert.deepEqual(catalog.readinessBasis.resolvedLock, environment.resolvedProductLock);
    assert.equal(catalog.readinessBasis.installedProducts.length, installed.length);
    assert.ok(catalog.readinessBasis.installedProducts.every(c => installed.some(i => hash(i.candidate) === hash(c))));
    await writeFile(join(installedHarness.scratch, "declaration-preflight.json"), JSON.stringify({ catalog, catalogView,
      closure, validation, resolution: resolved.resolution }, null, 2)+"\n");
    if (process.env.ABI5_D1_PREFLIGHT_ONLY === "1") { console.log("retained native catalog/declaration/validation/resolution preflight passed; zero Public calls"); return; }
    const catalogReceipt = await invoke(await authorized(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.admit,
      { workspaceBinding: boundSlots.workspace_binding, descriptors: installCalls.map(c => c.resources.packedArtifact.descriptor),
        contributionManifests: installCalls.map(c => c.resources.packedArtifact.contributionManifest), resolvedLock: lock },
      { kind: "catalog_admission_resource_assertion", schemaVersion, eventResource: reopenEventResource(product, closeHandoff),
        workspaceBinding: environment.workspaceBinding, resolvedLock, verifiedProducts,
        admittedInstalls: environment.productInstalls, publications }, boundSlots), "retained catalog.admit");
    closeHandoff = catalogReceipt.resources.eventResource.closeHandoff;
    const viewReceipt = await invoke(await authorized(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.view.allowlist,
      { catalog: catalogReceipt.ownerOutput.value.catalog, allowlist },
      { kind: "catalog_view_resource_assertion", schemaVersion, catalog }, boundSlots), "catalog.view");
    const catalogScope = { catalog: catalogReceipt.ownerOutput.value.catalog, view: viewReceipt.ownerOutput.value.view, allowlist };
    const applications = [], applicationResources = [];
    const program = consumerPublication.programs.find(row => row.programRef === fixture.ids.programRef);
    phase = "conformance";
    const law = coord("law://abiogenesis/validator/gtl-program@5", { ref: "law://abiogenesis/validator/gtl-program@5" });
    const conformance = await invoke(await authorized(validator.CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program,
      { program: coord(program.programRef, program), conformanceLaw: law,
        inventoryBasis: { kind: "declared_inventory", inventory: catalog.boundPublications.map(p => coord(p.moduleRef, p)).sort((a, b) => a.ref.localeCompare(b.ref)) } },
      { kind: "conformance_evaluation_resource_assertion", schemaVersion, packet: { kind: "conformance_evaluate_packet", schemaVersion,
        memberKey: "gtl_program", publication: consumerPublication, program }, conformanceLaw: law,
        declaredInventory: catalog.boundPublications,
        declarationCatalog: { catalog, catalogView } }, boundSlots), "conformance.evaluate");
    assert.equal(conformance.ownerOutput.value.disposition, "passed", JSON.stringify(conformance.ownerOutput));
    phase = "installed_owner_resolution";
    const resolution = await product.ProductExecutionResolutionPort.resolve({ catalog, catalogView,
      admittedInstalls: environment.productInstalls,
      verifyInstallAdmission: install => abg.hasAdmittedProductInstall(environment.artifactTruth, install),
      programRef: fixture.ids.programRef,
      selection: { kind: "start", scope: "program", target: "next", until: "converged", rootMode: "direct" } });
    assert.equal(resolution.kind, "loaded_product_execution_resolution", JSON.stringify(resolution));
    const runPacket = product.RUN_OPERATION_CONTRACTS.invoke.start;
    const binding = environment.workspaceBinding, A = environment.workspaceAuthorityBasis;
    assert.equal(binding.roots.productRoot, installed.at(-1).install.installedRoot);
    assert.equal(binding.roots.toolchainRoot, environment.workspaceBinding.roots.toolchainRoot);
    assert.notEqual(A.canonicalRoot, binding.roots.productRoot);
    const policy = product.constructRootInvocationPolicy(binding, resolution.program, [], ["F_D"], applications);
    const grantBasis = { admittedInstalls: environment.productInstalls, workspaceBinding: binding, fixedPacket: runPacket };
    const grants = [product.constructCapabilityGrant(policy, ACTOR, "abg.operation.run.invoke", product.DIRECT_INVOKE_CAPABILITY, grantBasis)];
    const authority = product.constructInvocationAuthority(ACTOR, binding, catalogView, program.programRef,
      resolution.selectedCatalogEntry, policy, grants, grantBasis);
    assert.equal(authority.kind, "invocation_authority");
    phase = "input_and_authority_preflight";
    const input = fixed.input;
    const inputContract = { ref: resolution.resolution.inputContract.contractRef, digest: resolution.resolution.inputContractDigest };
    const admittedInput = product.admitInstalledProductInput(resolution.productSemantics, inputContract.ref, input);
    assert.ok(admittedInput, "actual installed semantics admits the complete preparation input");
    const rawInput = validator.rawAdmitValue(admittedInput, "invocation_input", inputContract.ref);
    assert.equal(rawInput.kind, "raw_admitted_value");
    const inputCarrier = { contract: inputContract, valueRef: "value://d1-handoff.example/two-orders/input",
      valueDigest: hash(input), value: input };
    const eventResource = reopenEventResource(product, closeHandoff), steeringDigest = hash(eventResource);
    const runSlots = { workspace_binding: boundSlots.workspace_binding,
      product_set: environment.productInstalls.map(install => ({ ref: install.installId, digest: install.productContentDigest })),
      dependency_lock: lock, catalog_scope: catalogScope,
      execution_program: { ref: program.programRef, digest: resolution.resolution.programDigest },
      input_contract: inputCarrier, session_policy: { ref: policy.policyRef, digest: policy.policyDigest },
      capability_grants: { requiredCapabilityRefs: [...runPacket.metadata.capabilityRefs], grants: grants.map(grant => ({ ref: grant.grantRef, digest: grant.grantDigest })) },
      actor: { actor: { ref: ACTOR, digest: hash({ actorRef: ACTOR }) }, attribution: { ref: authority.authorityRef, digest: authority.authorityDigest } },
      transport_steering: { ref: `transport-steering://abiogenesis/${steeringDigest.slice(7)}`, digest: steeringDigest } };
    const runCall = definitionCall({ publicApi, product, ...runPacket.definitionKey, ordinal: ++ordinal,
      request: { program: runSlots.execution_program, scope: "program", target: { kind: "next" }, until: "converged",
        catalogView: catalogScope.view, allowlist, input: inputCarrier, fhMode: "direct", rootMode: "direct", sourceBasis: { kind: "none" } },
      slots: runSlots, resources: { kind: "run_invocation_resource_assertion", schemaVersion, eventResource,
        catalog, catalogView, applications, applicationResources, source: { kind: "none" } } });
    assert.equal(product.isRunInvocationResourceAssertion(runCall.resources), true,
      "exact run resources satisfy the installed owner structural schema before start");
    const invocation = product.constructExactStartInvocation(runCall.invocation, binding, catalogView, resolution.program,
      resolution.selectedCatalogEntry, rawInput, policy, grants, authority);
    assert.equal(invocation.kind, "public_invocation_candidate", JSON.stringify(invocation));
    preflight = { environment, catalog, catalogView, program, publications, resolution: resolution.resolution,
      fixed, runCall, closeHandoff, installedBefore, immutableBefore };
    await writeFile(join(installedHarness.scratch, "preflight.json"), JSON.stringify(preflight, null, 2) + "\n");
    phase = "native_handoff";
    const ran = await invoke(runCall, "fixed source handoff");
    assert.equal(ran.ownerOutput.value.disposition, "completed", JSON.stringify(ran.ownerOutput));
    closeHandoff = ran.resources.eventResource.closeHandoff;
    phase = "fresh_reads";
    const reads = {};
    for (const memberKey of ["run_result", "run_replay"]) {
      const packet = abg.ABG_PROJECT_READ_CONTRACTS[memberKey];
      const readGrants = packet.metadata.capabilityRefs.map(capabilityRef => product.constructCapabilityGrant(
        A, ACTOR, packet.definitionKey.operationId, capabilityRef,
        { admittedInstalls: environment.productInstalls, workspaceBinding: binding, fixedPacket: packet }));
      reads[memberKey] = await invoke(definitionCall({ publicApi, product, ...packet.definitionKey, ordinal: ++ordinal,
        request: { caseKey: memberKey,
          source: { sourceKind: "run", sourceRef: ran.ownerOutput.value.run.ref, sourceDigest: ran.ownerOutput.value.run.digest },
          projectionBasis: { projectionBasisRef: closeHandoff.prefix.eventLogRef, projectionBasisDigest: closeHandoff.prefix.coordinateDigest },
          selector: memberKey === "run_replay" ? { kind: "ordinal_page", fromOrdinal: 0, limit: 10000 } : { kind: "none" } },
        slots: { workspace_binding: boundSlots.workspace_binding, product_set: runSlots.product_set, dependency_lock: lock,
          capability_grants: { requiredCapabilityRefs: [...packet.metadata.capabilityRefs], grants: readGrants.map(row => ({ ref: row.grantRef, digest: row.grantDigest })) } },
        resources: { kind: "abg_project_read_resource_assertion", schemaVersion, eventResource: reopenEventResource(product, closeHandoff) } }), `fresh ${memberKey}`);
      assert.deepEqual(reads[memberKey].resources.eventResource.closeHandoff.prefix, closeHandoff.prefix);
    }
    assert.deepEqual(reads.run_result.ownerOutput.value.projection.result, ran.ownerOutput.value.result);
    const prefix = abg.selectValidatedRuntimeEventPrefix(abg.readRuntimeEventsAtDurablePrefix(closeHandoff.prefix));
    const admission = abg.rehydrateInvocationAdmissionAtPrefix(prefix, ran.resources.invocationAdmission.ref);
    const resultBasis = abg.deriveInvocationSourceResultBasisAtPrefix(prefix, { publicAuthorityDigest: runCall.invocation.invocationDigest,
      runtimeInvocationRef: admission.invocationRef, invocationAdmissionRef: ran.resources.invocationAdmission.ref,
      runId: ran.ownerOutput.value.run.ref, resultRef: ran.ownerOutput.value.result.ref });
    assert.ok(resultBasis);
    assert.equal(resultBasis.sourceResultValue.kind, "requirement_handoff_output");
    const output = resultBasis.sourceResultValue;
    assert.equal(output.coverage.disposition, "non_closing");
    assert.deepEqual(output.source, fixed.input);
    assert.deepEqual(output.declaration, fixed.declaration);
    assert.equal(output.coverage.obligations.length, 10);
    assert.equal(output.source.members.length, 5);
    const events = abg.readRuntimeEventsAtDurablePrefix(closeHandoff.prefix);
    const opened = events.find(e => e.kind === "c_call_opened" && e.aggregateId === output.basis.cCallRef);
    const fibre = events.find(e => e.kind === "c_call_fibre_selected" && e.aggregateId === opened.aggregateId);
    const basisEvent = events.find(e => e.kind === "basis_admitted" && e.basisId === opened.basisId);
    assert.ok(opened && fibre && basisEvent);
    const logLines = (await readFile(fileURLToPath(closeHandoff.prefix.eventLogRef), "utf8")).split("\n");
    const fibreLine = logLines.findIndex(line => line && JSON.parse(line).eventId === fibre.eventId);
    assert.ok(fibreLine >= 0);
    const bytes = Buffer.from(logLines.slice(0, fibreLine + 1).join("\n") + "\n");
    const { coordinateDigest: _coordinate, ...prefixBody } = closeHandoff.prefix;
    const preBody = { ...prefixBody, prefixLength: bytes.length, prefixDigest: product.sha256Bytes(bytes) };
    const pre = { ...preBody, coordinateDigest: product.sha256Canonical(preBody) };
    assert.ok(abg.validateDurablePrefixCoordinate(pre));
    const execution = abg.rehydrateExecutionBasisAtPrefix(prefix, opened.basisId);
    const graph = gtl.materializeGraph(resolution.graphFunction, { invocationAdmissionRef: execution.invocationAdmissionRef,
      admittedInputRef: execution.rawInputAdmissionRef, admittedInputDigest: execution.rawInputDigest, admittedInput: execution.rawInputValue });
    assert.equal(graph.materializationDigest, execution.graphDigest);
    // Read-only owner guard evidence uses the installed native projection; it is not an added Public export.
    const cCallProjection = await import(pathToFileURL(join(harness.installedPackageRoot, "build/code/src/abg/c_call.js")).href);
    const fdBasis = { publication: consumerPublication, graph, graphFunction: resolution.graphFunction,
      executionBasis: execution, cCall: cCallProjection.projectOpenedCCallCarrierAtPrefix(prefix, graph, opened.aggregateId), predecessorPrefix: pre };
    assert.ok(abg.authenticateRequirementHandoffBasis(fdBasis));
    const negativeProof = await proveNegatives({ product, gtl, abg, fixed, fdBasis, output });
    const installedAfter = await Promise.all(environment.productInstalls.map(install => inventory(install.installedRoot)));
    assert.deepEqual(installedAfter, installedBefore);
    assert.deepEqual(await inventory(harness.installedPackageRoot), immutableBefore);
    const proof = { disposition: "awaiting_independent_review", fixtureSha256: "13137b2080d9c9c6d8af5f5880f92b46a8cbbd4afc4c66451812e9e92f023871",
      artifactSha256: await product.sha256File(harness.artifactPath), preflight, runReceipt: ran, reads, resultBasis,
      closeHandoff, fdBasis, negativeProof, observedCalls, installedAfter };
    await writeFile(join(installedHarness.scratch, "proof.json"), JSON.stringify(proof, null, 2) + "\n", { flag: "wx" });
    console.log(JSON.stringify({ disposition: proof.disposition, run: ran.ownerOutput.value.run,
      sourceMembers: 5, sourceBytes: 135805, obligations: 10, coverage: output.coverage.disposition, negativeProof }));
  } catch (error) {
    const failure = { phase, name: error.name, message: error.message, stack: error.stack, observedCalls, preflight };
    await writeFile(join(scratch, `first-cause-${Date.now()}.json`), JSON.stringify(failure, null, 2) + "\n", { flag: "wx" });
    throw error;
  }
});

test("D1 ordinary installed wrong-role invocation cannot close the transfer", async t => {
  if (!process.env.ABI5_D1_POSITIVE_PROOF) { t.skip("requires the retained completed installed transfer"); return; }
  const proof = JSON.parse(await readFile(process.env.ABI5_D1_POSITIVE_PROOF, "utf8"));
  const harness = { cliHost: process.env.ABI5_WAVE1_FROZEN_INSTALL_HOST,
    installedPackageRoot: join(process.env.ABI5_WAVE1_FROZEN_INSTALL_HOST, "node_modules/@abiogenesis/typescript-tenant") };
  const [product, publicApi, abg] = await Promise.all(["product", "public", "abg"].map(surface =>
    importInstalledPackageExport(harness, `@abiogenesis/typescript-tenant/${surface}`, `d1-role-negative-${surface}`)));
  installedHarness = { ...harness, product, cliPath: join(harness.cliHost, "node_modules/.bin/abg.cli"), scratch: process.env.ABI5_D1_NEGATIVE_ROOT };
  await mkdir(installedHarness.scratch);
  const hash = value => product.sha256Canonical(value), env = proof.preflight.environment;
  const call = structuredClone(proof.preflight.runCall);
  const wrong = { ...call.invocation.request.input.value, sourceRoleRef: "role://d1/wrong-role" };
  assert.equal(product.isRequirementHandoffInput(wrong), true, "negative is valid raw input shape");
  const carrier = { ...call.invocation.request.input, value: wrong, valueDigest: hash(wrong), valueRef: "value://d1-handoff.example/wrong-role/input" };
  call.invocation.requestRef = "request://d1-handoff.example/wrong-role-fixed-publication";
  call.invocation.request.input = carrier;
  call.invocation.invocationAuthority.slots.input_contract = carrier;
  call.resources.eventResource = reopenEventResource(product, proof.closeHandoff);
  const steering = hash(call.resources.eventResource);
  call.invocation.invocationAuthority.slots.transport_steering = { ref: `transport-steering://abiogenesis/${steering.slice(7)}`, digest: steering };
  rehashInvocation(product, call);
  const before = proof.closeHandoff.prefix;
  const response = await cliCall(call, acquisitionFor(call));
  await writeFile(join(installedHarness.scratch, "wrong-role-response.json"), JSON.stringify(response, null, 2)+"\n");
  assert.equal(response.kind, "installed_definition_call_transport_result");
  const receipt = response.receipt;
  assert.equal(receipt.exitCode, 0, JSON.stringify(receipt));
  assert.equal(receipt.ownerOutput.outcomeKind, "result");
  assert.notEqual(receipt.ownerOutput.value.disposition, "completed");
  assert.equal(receipt.ownerOutput.value.result, null);
  const after = receipt.resources.eventResource.closeHandoff;
  assert.notDeepEqual(after.prefix, before);
  const events = abg.readRuntimeEventsAtDurablePrefix(after.prefix);
  const run = receipt.ownerOutput.value.run;
  assert.ok(run);
  assert.equal(events.some(e => e.kind === "c_call_result_admitted" && e.runId === run.ref && e.payload.resultClass === "success"), false,
    "wrong-role native call cannot admit a transfer result");
  const originalReadOrdinal = proof.observedCalls.findIndex(row => row.definitionKey?.memberKey === "run_replay") + 1;
  assert.ok(originalReadOrdinal > 0);
  const readCall = JSON.parse(await readFile(join(dirname(process.env.ABI5_D1_POSITIVE_PROOF), `call-${originalReadOrdinal}.jsonl`), "utf8")).invocation;
  readCall.invocation.requestRef = "request://d1-handoff.example/wrong-role-replay";
  readCall.invocation.request.source = { sourceKind: "run", sourceRef: run.ref, sourceDigest: run.digest };
  readCall.invocation.request.projectionBasis = { projectionBasisRef: after.prefix.eventLogRef, projectionBasisDigest: after.prefix.coordinateDigest };
  readCall.resources.eventResource = reopenEventResource(product, after);
  rehashInvocation(product, readCall);
  const replay = await runBinding(null, readCall, "wrong-role fresh replay");
  assert.deepEqual(replay.resources.eventResource.closeHandoff.prefix, after.prefix);
  const installedAfter = await Promise.all(env.productInstalls.map(install => inventory(install.installedRoot)));
  assert.deepEqual(installedAfter, proof.installedAfter);
  await writeFile(join(installedHarness.scratch, "proof.json"), JSON.stringify({ disposition: "awaiting_independent_review",
    boundary: "ordinary Public wrong-role refusal; read-only guard attacks are separately scoped",
    positiveProof: process.env.ABI5_D1_POSITIVE_PROOF, receipt, replay, before, closeHandoff: after,
    admittedTransferResult: false, installedAfter, observedCalls }, null, 2)+"\n");
});

test("D1 retained prefix guard reconstructs the graph and rejects fabricated transfer bases", async t => {
  if (!process.env.ABI5_D1_RETAINED_NATIVE_BASIS || !process.env.ABI5_D1_BUILD_ROOT) { t.skip("requires exact retained native predecessor and candidate build"); return; }
  const build = process.env.ABI5_D1_BUILD_ROOT;
  const [product, gtl, abg] = await Promise.all(["product", "gtl", "abg"].map(surface =>
    import(pathToFileURL(join(build, "build/code/src", surface, "index.js")).href)));
  const record = JSON.parse(await readFile(process.env.ABI5_D1_RETAINED_NATIVE_BASIS, "utf8"));
  const fdBasis = record.basis, log = fileURLToPath(fdBasis.predecessorPrefix.eventLogRef);
  const before = product.sha256Bytes(await readFile(log));
  const fixed = bindIndependentSource(product, gtl, JSON.parse(await readFile(process.env.ABI5_D1_SOURCE_FIXTURE, "utf8")));
  assert.deepEqual(fdBasis.publication.requirementHandoffs, [fixed.declaration]);
  const authenticated = abg.authenticateRequirementHandoffBasis(fdBasis);
  assert.ok(authenticated, "candidate uses the owning materialization digest and exact regenerated graph");
  const output = abg.projectRequirementHandoffCandidate(fdBasis, fixed.input);
  assert.ok(output); assert.equal(product.isRequirementHandoffOutput(output), true);
  assert.equal(output.source.members.length, 5); assert.equal(output.coverage.obligations.length, 10);
  assert.equal(output.coverage.disposition, "non_closing");
  const negativeProof = await proveNegatives({ product, gtl, abg, fixed, fdBasis, output });
  assert.equal(product.sha256Bytes(await readFile(log)), before);
  await writeFile(process.env.ABI5_D1_RETAINED_NATIVE_PROOF, JSON.stringify({
    scope: "candidate read-only relation check against retained failed-Run prefix; no new runtime admission",
    authenticated, output, negativeProof, eventBytesUnchanged: before }, null, 2)+"\n");
  console.log(JSON.stringify({ scope: "retained-prefix candidate guard", sourceMembers: 5, obligations: 10,
    coverage: "non_closing", negativeProof, eventBytesUnchanged: before }));
});
