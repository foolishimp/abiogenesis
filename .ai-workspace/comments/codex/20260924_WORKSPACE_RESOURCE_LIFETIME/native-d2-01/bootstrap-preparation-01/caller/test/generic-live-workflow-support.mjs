import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  lstat,
  readlink,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";

const execFileAsync = promisify(execFile);
const SCHEMA_VERSION = "5.0.0";

export const GENERIC_LIVE_WORKFLOW_GATE =
  "ODD_GLC_RUN_GENERIC_LIVE_WORKFLOW";
export const GENERIC_INSTALLED_NO_LIVE_GATE =
  "ODD_GLC_RUN_GENERIC_INSTALLED_NO_LIVE";
export const GENERIC_LIVE_WORKFLOW_ARTIFACT =
  "ODD_GLC_ABI5_C1_ARTIFACT";
export const GENERIC_LIVE_WORKFLOW_ARTIFACT_SHA256 =
  "ODD_GLC_ABI5_C1_ARTIFACT_SHA256";
export const GENERIC_LIVE_WORKFLOW_SCENARIOS =
  "ODD_GLC_GENERIC_SCENARIOS";
export const GENERIC_LIVE_WORKFLOW_INACTIVITY_TIMEOUT_MS = 900_000;
export const GENERIC_LIVE_WORKFLOW_ABSOLUTE_TIMEOUT_MS = 3_600_000;

const WORKER_ACTOR_REF =
  "actor://abiogenesis/worksite/construction-worker@5";
const DEFAULT_EVENT_TIME = "2026-09-01T00:00:00.000Z";
const CLAUDE_WORKER_EFFORTS = Object.freeze([
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
]);

function sha256Bytes(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function assertRecord(value, label) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`);
  }
  return value;
}

function assertNonEmptyString(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return value;
}

function assertSafeRelativePath(value, label) {
  assertNonEmptyString(value, label);
  if (
    path.isAbsolute(value) ||
    value.includes("\\") ||
    value.split("/").includes("..")
  ) {
    throw new TypeError(`${label} must be a portable worksite-relative path`);
  }
  return value;
}

function exact(values, predicate, label) {
  const matches = values.filter(predicate);
  if (matches.length !== 1) {
    throw new TypeError(`${label} must select one exact value`);
  }
  return matches[0];
}

function normalizedExpectedDigest(value) {
  if (value === undefined || value === null || value === "") return null;
  assertNonEmptyString(value, "expected ABI artifact digest");
  const normalized = value.startsWith("sha256:") ? value : `sha256:${value}`;
  if (!/^sha256:[a-f0-9]{64}$/u.test(normalized)) {
    throw new TypeError(
      "expected ABI artifact digest must be one lowercase SHA-256 coordinate",
    );
  }
  return normalized;
}

export function genericLiveWorkflowSkip(environment = process.env) {
  const enabled = environment[GENERIC_LIVE_WORKFLOW_GATE] === "1";
  return Object.freeze({
    kind: "generic_live_workflow_skip",
    schemaVersion: "1",
    disposition: enabled ? "enabled" : "skipped",
    gate: GENERIC_LIVE_WORKFLOW_GATE,
    requiredValue: "1",
    liveWorkerInvoked: false,
  });
}

export function selectGenericWorkflowScenarios(
  fixture,
  selector = "basic-cli",
) {
  assertRecord(fixture, "generic workflow fixture");
  if (!Array.isArray(fixture.scenarios) || fixture.scenarios.length === 0) {
    throw new TypeError("generic workflow fixture requires scenarios");
  }
  const requested = selector === "all"
    ? fixture.scenarios.map(({ key }) => key)
    : selector.split(",").map((value) => value.trim()).filter(Boolean);
  if (requested.length === 0 || new Set(requested).size !== requested.length) {
    throw new TypeError("generic workflow scenario selector must be non-empty and unique");
  }
  return Object.freeze(requested.map((key) =>
    exact(
      fixture.scenarios,
      (candidate) => candidate.key === key,
      `generic workflow scenario ${key}`,
    )
  ));
}

export function scenarioTargetPaths(scenario) {
  assertRecord(scenario, "scenario");
  if (!Array.isArray(scenario.territories) || scenario.territories.length === 0) {
    throw new TypeError("scenario requires declared territories");
  }
  const paths = scenario.territories.flatMap((territory) => {
    assertRecord(territory, "scenario territory");
    if (!Array.isArray(territory.paths) || territory.paths.length === 0) {
      throw new TypeError("scenario territory requires target paths");
    }
    return territory.paths.map((targetPath) =>
      assertSafeRelativePath(targetPath, "scenario target path")
    );
  });
  if (new Set(paths).size !== paths.length) {
    throw new TypeError("scenario target paths must be unique");
  }
  return Object.freeze(paths);
}

// A declared join selects the existing ABI aggregate. ABI admits the DAG,
// owns branch traversal, and reduces only authenticated branch results.
export function scenarioHasConstructionFanIn(scenario) {
  return scenario.territories.some((territory) => territory.dependsOn.length > 1);
}

export function constructGenericWorkflowTask({
  product, workspaceAuthorityBasis, workspaceBinding, capabilityGrant,
  scenario, targetInputs,
}) {
  assert.deepEqual(targetInputs.map((target) => target.subject.relativePath),
    scenarioTargetPaths(scenario), "construction inputs must preserve fixture target order");
  const construct = (targets, branch = null) => {
    const basis = { workspaceAuthorityBasis, workspaceBinding, capabilityGrant, targets };
    const provisional = product.constructWorksiteConstructionTask({
      ...basis, prompt: "ACTION\nResolve the exact declared target vector.",
    });
    const prompt = renderGenericWorkflowAction(scenario, provisional.targets, branch);
    return product.constructWorksiteConstructionTask({ ...basis, prompt });
  };
  if (!scenarioHasConstructionFanIn(scenario)) {
    const task = construct(targetInputs);
    return { task, targets: task.targets, prompt: task.prompt };
  }
  let offset = 0;
  const branches = scenario.territories.map((territory) => {
    const targets = targetInputs.slice(offset, offset + territory.paths.length);
    offset += territory.paths.length;
    return {
      branchRef: territory.id,
      dependsOn: [...territory.dependsOn],
      constructionTask: construct(targets, territory),
    };
  });
  const task = product.constructWorksiteBranchConstructionTask({
    workspaceBinding, capabilityGrant, branches,
  });
  return {
    task,
    targets: task.branches.flatMap((branch) => branch.constructionTask.targets),
    prompt: task.branches.map((branch) => ({
      branchRef: branch.branchRef,
      prompt: branch.constructionTask.prompt,
      promptDigest: branch.constructionTask.promptDigest,
    })),
  };
}

function commandText(command) {
  return [command.command, ...command.args].map((value) =>
    /\s/u.test(value) ? JSON.stringify(value) : value
  ).join(" ");
}

/**
 * This is one direct activation projection, not a prompt language. Scenario
 * data fills fixed lifecycle coordinates; solution choices remain with the
 * Worker and the requested action is deliberately last.
 */
export function renderGenericWorkflowAction(scenario, targets, branch = null) {
  assertRecord(scenario, "scenario");
  if (!Array.isArray(targets) || targets.length === 0) {
    throw new TypeError("generic workflow action requires ABI-derived targets");
  }
  const targetLines = targets.map((target, ordinal) => {
    assertRecord(target, `target ${ordinal}`);
    const relativePath = assertSafeRelativePath(
      target.subject?.relativePath,
      `target ${ordinal} relativePath`,
    );
    const state = target.predecessorObservation?.state;
    if (state !== "absent" && state !== "file") {
      throw new TypeError(`target ${ordinal} requires an exact current observation`);
    }
    const current = state === "absent"
      ? "<absent>"
      : `<existing file: ${target.predecessorObservation.fileDigest}; ${target.predecessorObservation.byteLength} bytes>`;
    return [
      `- targetRef: ${target.targetRef}`,
      `  path: ${relativePath}`,
      `  current-state: ${state}`,
      "  current-contents:",
      ...current.split("\n").map((line) => `    ${line}`),
    ].join("\n");
  });
  const validationLines = scenario.validationCommands.map((command) =>
    `- ${command.id}: (cwd ${command.cwd}; timeout ${command.timeoutMs}ms; grace ${command.terminationGraceMs}ms) ${commandText(command)}`
  );
  const outcomeLines = scenario.outcomePredicates.map((predicate) =>
    `- ${predicate.id}: ${JSON.stringify(predicate)}`
  );
  const constructionConstraints = scenario.constructionConstraints ?? [];
  const writeLines = scenario.allowedEvidenceWrites.map((territory) =>
    `- ${territory.pathKind}: ${territory.relativePath}`
  );
  return [
    "ROLE",
    "You are the mutation-capable construction Worker for one isolated worksite.",
    "",
    "SUBJECT",
    `${scenario.subject.id}: ${scenario.subject.text}`,
    "",
    ...(branch === null ? [] : [
      "DECLARED BRANCH",
      `branchRef: ${branch.id}`,
      `dependsOn: ${JSON.stringify(branch.dependsOn)}`,
      "Only the targets below belong to this Worker. The overall action describes the complete subject.",
      "Dependency refs declare readiness; they do not supply predecessor source content.",
      "",
    ]),
    "TARGETS AND CURRENT STATE",
    ...targetLines,
    "",
    "CONSTRAINTS",
    "- Return complete replacement bytes for every target exactly once and in the declared order.",
    "- Change no undeclared path. The target vector is the complete mutation boundary.",
    "- Preserve the requested observable behavior and make the declared validation commands pass.",
    "- Choose the implementation details freely inside those constraints.",
    "- Do not run the declared commands. ABI invokes a separate typed execution Worker after C1 admission.",
    "- Any later command output must remain inside the declared execution-evidence writes.",
    "- Do not create a lifecycle runner, prompt engine, retry loop, reviewer, or executive.",
    ...constructionConstraints.map((constraint) => `- ${constraint}`),
    "",
    "DECLARED VALIDATION",
    ...validationLines,
    "",
    "DECLARED EXECUTION-EVIDENCE WRITES",
    ...writeLines,
    "",
    "DECLARED OUTCOMES",
    ...outcomeLines,
    "",
    "ACTION",
    scenario.action.text,
  ].join("\n");
}

export async function inventoryPackage(root) {
  const rows = [];
  async function visit(relative) {
    const absolute = path.join(root, relative);
    const node = await lstat(absolute);
    if (node.isSymbolicLink()) rows.push([relative, "symlink", await readlink(absolute)]);
    else if (node.isFile()) rows.push([relative, "file", sha256Bytes(await readFile(absolute))]);
    else if (node.isDirectory()) {
      if (relative !== "") rows.push([relative, "directory"]);
      for (const name of (await readdir(absolute)).sort()) await visit(path.join(relative, name));
    } else throw new TypeError(`unsupported installed package node: ${absolute}`);
  }
  await visit("");
  return Object.freeze({ digest: sha256Bytes(Buffer.from(JSON.stringify(rows))), memberCount: rows.length, rows });
}

export async function importInstalledSurface(installedRoot, relativePath, nonce) {
  const target = await realpath(path.join(installedRoot, relativePath));
  const relative = path.relative(await realpath(installedRoot), target);
  if (
    path.isAbsolute(relative) ||
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    relative.split(path.sep).includes("test_env") ||
    relative.split(path.sep).includes("private")
  ) {
    throw new TypeError(`installed surface escaped its package: ${relativePath}`);
  }
  return import(`${pathToFileURL(target).href}?generic-live=${nonce}`);
}

async function installAbiArtifact({
  artifactPath,
  expectedArtifactDigest,
  scratch,
  reuseBootstrap = false,
}) {
  const canonicalArtifactPath = await realpath(artifactPath);
  const artifactDigest = sha256Bytes(await readFile(canonicalArtifactPath));
  const expected = normalizedExpectedDigest(expectedArtifactDigest);
  if (expected !== null && artifactDigest !== expected) {
    throw new TypeError(
      "ABI artifact digest mismatch: expected " + expected + ", got " +
        artifactDigest,
    );
  }
  const bootstrapRoot = path.join(scratch, "abi-bootstrap");
  if (!reuseBootstrap) {
    await mkdir(bootstrapRoot);
    await execFileAsync(
      "tar",
      ["-xzf", canonicalArtifactPath, "-C", bootstrapRoot],
      { maxBuffer: 20 * 1024 * 1024 },
    );
  }
  const bootstrapPackage = path.join(bootstrapRoot, "package");
  const manifest = JSON.parse(await readFile(
    path.join(bootstrapPackage, "product-toolchain-manifest.json"),
    "utf8",
  ));
  return Object.freeze({
    artifactPath: canonicalArtifactPath,
    artifactDigest,
    bootstrapPackage,
    manifest,
  });
}

function publicationBasis(artifact, product) {
  return {
    productId: artifact.manifest.productId,
    artifactDigest: artifact.artifactDigest,
    productContentDigest: artifact.manifest.productContentDigest,
    productManifestDigest: product.sha256Canonical(artifact.manifest),
    packageName: artifact.manifest.packageName,
    packageVersion: artifact.manifest.packageVersion,
  };
}

function keyOf(definition) {
  return `${definition.definitionKey.operationId}#${definition.definitionKey.memberKey}`;
}

function coordinate(product, ref, value = { ref }) {
  return Object.freeze({ ref, digest: product.sha256Canonical(value) });
}

function actorAuthority(product) {
  return Object.freeze({
    actor: coordinate(product, WORKER_ACTOR_REF),
    attribution: coordinate(
      product,
      "attribution://abiogenesis/odd-glc/generic-workflow",
    ),
  });
}

function capabilityAuthority(product, definition) {
  return Object.freeze({
    requiredCapabilityRefs: [...definition.capabilityRefs],
    grants: [coordinate(
      product,
      `capability-grant://abiogenesis/odd-glc/${encodeURIComponent(keyOf(definition))}`,
      { definitionKey: definition.definitionKey },
    )],
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
    capability_grants: capabilityAuthority(product, definition),
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

export function definitionCall({
  publicApi,
  product,
  verified,
  operationId,
  memberKey,
  ordinal,
  request,
  slots = {},
  resources,
}) {
  const schemaVersion = SCHEMA_VERSION;
  const admittedContractCatalog = { productId: verified.productId, productContentDigest: verified.productContentDigest, catalogId: verified.catalogId, catalogVersion: schemaVersion, catalogDigest: verified.catalogDigest };
  const admittedDefinitionContractCoordinates = verified.definitionContractCoordinates;
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
      `public-request://abiogenesis/odd-glc/generic-workflow/${String(ordinal).padStart(2, "0")}-${memberKey}`,
    requestDigest,
    request,
    expectedResultContract: memberContracts.slots.result,
    expectedRefusalContract: memberContracts.slots.refusal,
    expectedNonTerminalContract: memberContracts.slots.nonTerminal,
    correlationRef: "correlation://abiogenesis/odd-glc/generic-workflow",
    eventTime: "2026-08-18T00:00:00.000Z",
    provenanceRefs: ["provenance://abiogenesis/odd-glc/generic-workflow"],
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

function reopenEventResource(product, closeHandoff) {
  return { kind: "reopen_abg_event_resource", schemaVersion: SCHEMA_VERSION,
    closeHandoff, handoffDigest: product.sha256Canonical(closeHandoff) };
}

async function applyDefinitionCall(installedPublic, call, label) {
  const resource = call.resources.eventResource;
  const acquisition = resource === undefined ? { kind: "eventless" }
    : resource.kind === "new_abg_event_resource"
      ? { kind: "new", eventLogPath: resource.eventLogPath }
      : { kind: "reopen", closeHandoff: resource.closeHandoff };
  const outcome = await installedPublic.runInstalledDefinitionCallTransport(acquisition, call);
  if (outcome.kind !== "installed_definition_call_transport_result" ||
    outcome.receipt.exitCode !== 0 || outcome.receipt.ownerOutput.outcomeKind !== "result") {
    throw new Error(`${label} refused: ${JSON.stringify(outcome)}`);
  }
  return outcome.receipt;
}

export function validateRetainedWorksiteSetup(scratch, retainedWorksite, resumeSetupAttempt) {
  assert.equal(resumeSetupAttempt, undefined, "a successor epoch is not an empty setup retry");
  assertRecord(retainedWorksite, "retained worksite selection");
  assert.deepEqual(Object.keys(retainedWorksite).sort(), ["manifest", "openPacket"]);
  const packet = retainedWorksite.openPacket;
  assertRecord(packet, "native retained workspace open packet");
  assert.deepEqual(Object.keys(packet).sort(), ["expectedWorkspaceAuthorityDigest", "expectedWorkspaceAuthorityRef",
    "kind", "memberKey", "schemaVersion", "targetRoot"]);
  assert.equal(packet.kind, "workspace_open_packet");
  assert.equal(packet.schemaVersion, SCHEMA_VERSION);
  assert.equal(packet.memberKey, "open", "retained worksite must never use clean/create");
  assertNonEmptyString(packet.expectedWorkspaceAuthorityRef, "retained workspace authority");
  assert.match(packet.expectedWorkspaceAuthorityDigest, /^sha256:[a-f0-9]{64}$/u);
  assert.equal(normalizedExpectedDigest(packet.expectedWorkspaceAuthorityDigest), packet.expectedWorkspaceAuthorityDigest);
  assert.ok(path.isAbsolute(packet.targetRoot) && path.resolve(packet.targetRoot) === packet.targetRoot);
  assert.ok(path.isAbsolute(scratch) && path.resolve(scratch) === scratch);
  for (const [parent, child] of [[scratch, packet.targetRoot], [packet.targetRoot, scratch]]) {
    const relative = path.relative(parent, child);
    assert.ok(relative.startsWith(`..${path.sep}`) || relative === ".." || path.isAbsolute(relative),
      "successor setup resources and retained physical worksite must not overlap");
  }
  assert.deepEqual(Object.keys(retainedWorksite.manifest).sort(), ["path", "sha256"]);
  assert.equal(retainedWorksite.manifest.path, path.join(packet.targetRoot, ".abiogenesis", "workspace-manifest.json"));
  assert.match(retainedWorksite.manifest.sha256, /^sha256:[a-f0-9]{64}$/u);
  assert.equal(normalizedExpectedDigest(retainedWorksite.manifest.sha256), retainedWorksite.manifest.sha256);
  return packet.targetRoot;
}

export async function prepareInstalledScenario({
  scenario,
  artifactPath,
  expectedArtifactDigest,
  runRoot,
  resumeSetupAttempt,
  retainedWorksite,
}) {
  let scratch = runRoot ?? await mkdtemp(
    path.join(os.tmpdir(), "odd-glc-generic-" + scenario.key + "-"),
  );
  await mkdir(scratch, { recursive: true });
  scratch = await realpath(scratch);
  let retainedWorkspaceRoot;
  if (retainedWorksite !== undefined) {
    retainedWorkspaceRoot = validateRetainedWorksiteSetup(scratch, retainedWorksite, resumeSetupAttempt);
    assert.equal(await realpath(retainedWorkspaceRoot), retainedWorkspaceRoot);
    assert.deepEqual(await readdir(scratch), [], "successor epoch setup requires a new empty resource directory");
    assert.equal(sha256Bytes(await readFile(retainedWorksite.manifest.path)), retainedWorksite.manifest.sha256);
  }
  let setupEvidenceRoot = scratch;
  if (resumeSetupAttempt !== undefined) {
    assert.match(resumeSetupAttempt, /^[a-zA-Z0-9_-]+$/u);
    assertNonEmptyString(runRoot, "setup re-entry requires the retained runRoot");
    const original = JSON.parse(await readFile(path.join(scratch,
      "generic-live-workflow-request.json"), "utf8"));
    assert.equal(original.scenarioKey, scenario.key);
    assert.equal(original.scenarioId, scenario.scenarioId);
    assert.equal(original.abiArtifactPath, artifactPath);
    assert.equal(original.expectedAbiArtifactSha256, normalizedExpectedDigest(expectedArtifactDigest));
    for (const relative of ["worksite", "abi-authority/events", "abi-authority/runtime",
      "abi-authority/projections", "abi-authority/archive"]) {
      assert.deepEqual(await readdir(path.join(scratch, relative)), [],
        `setup re-entry requires untouched ${relative}`);
    }
    await assert.rejects(lstat(path.join(scratch, "abi-consumer")), { code: "ENOENT" });
    setupEvidenceRoot = path.join(scratch, "setup-attempts", resumeSetupAttempt);
    await mkdir(path.dirname(setupEvidenceRoot), { recursive: true });
    await mkdir(setupEvidenceRoot);
  }
  await writeFile(
    path.join(setupEvidenceRoot, "generic-live-workflow-request.json"),
    JSON.stringify({
      kind: "generic_live_workflow_request_record",
      schemaVersion: "2",
      authority: "diagnostic_only",
      scenarioKey: scenario.key,
      scenarioId: scenario.scenarioId,
      abiArtifactPath: artifactPath,
      expectedAbiArtifactSha256:
        normalizedExpectedDigest(expectedArtifactDigest),
      ...(resumeSetupAttempt === undefined ? {} : { resumesSetupAt: "product_verify", retainedRunRoot: scratch }),
      ...(retainedWorksite === undefined ? {} : { retainedWorksite }),
    }, null, 2) + "\n",
    { flag: "wx" },
  );
  const artifact = await installAbiArtifact({
    artifactPath,
    expectedArtifactDigest,
    scratch,
    reuseBootstrap: resumeSetupAttempt !== undefined,
  });
  const bootstrapBefore = await inventoryPackage(artifact.bootstrapPackage);
  const nonce = Date.now();
  let [product, abg, gtl, validator, installedPublic] = await Promise.all([
    importInstalledSurface(
      artifact.bootstrapPackage,
      "build/code/src/product/index.js",
      nonce,
    ),
    importInstalledSurface(
      artifact.bootstrapPackage,
      "build/code/src/abg/index.js",
      nonce,
    ),
    importInstalledSurface(
      artifact.bootstrapPackage,
      "build/code/src/gtl/index.js",
      nonce,
    ),
    importInstalledSurface(
      artifact.bootstrapPackage,
      "build/code/src/validator/index.js",
      nonce,
    ),
    importInstalledSurface(
      artifact.bootstrapPackage,
      "build/code/src/public/index.js",
      nonce,
    ),
  ]);
  const authorityRoot = path.join(scratch, "abi-authority");
  const eventLogRoot = path.join(authorityRoot, "events");
  const eventLogPath = path.join(eventLogRoot, "runtime.events.jsonl");
  const workspaceRoot = retainedWorkspaceRoot ?? path.join(scratch, "worksite");
  const consumerRoot = path.join(scratch, "abi-consumer");
  if (retainedWorksite === undefined) await mkdir(workspaceRoot, { recursive: true });
  const runtimeStateRoot = path.join(authorityRoot, "runtime");
  const projectionRoot = path.join(authorityRoot, "projections");
  const archiveRoot = path.join(authorityRoot, "archive");
  await Promise.all([
    eventLogRoot,
    runtimeStateRoot,
    projectionRoot,
    archiveRoot,
  ].map((root) => mkdir(root, { recursive: true })));

  const basis = publicationBasis(artifact, product);
  const ownerVerification = await product.ProductVerificationPort.verify({
    kind: "product_verification_packet", schemaVersion: SCHEMA_VERSION, memberKey: "verify", targetKind: "packed_artifact",
    request: { artifactPath: artifact.artifactPath, artifactRef: path.basename(artifact.artifactPath),
      expectedArtifactDigest: artifact.artifactDigest, expectedProductContentDigest: basis.productContentDigest,
      expectedManifestDigest: basis.productManifestDigest, expectedProductId: basis.productId,
      expectedPackageName: basis.packageName, expectedPackageVersion: basis.packageVersion },
  });
  if (ownerVerification.kind !== "product_verification_success") throw new Error(`bootstrap verification refused: ${JSON.stringify(ownerVerification)}`);
  const verified = ownerVerification.verifiedArtifact;
  const packedArtifact = { kind: "product_verification_artifact_resource", schemaVersion: SCHEMA_VERSION,
    artifactPath: artifact.artifactPath, artifact: { ref: verified.artifactRef, digest: verified.artifactDigest },
    productContent: { ref: `product-content://abiogenesis/${verified.productContentDigest.slice(7)}`, digest: verified.productContentDigest },
    descriptor: ownerVerification.coordinates.descriptor,
    contributionManifest: { ref: verified.contributionManifestRef, digest: verified.contributionManifestDigest },
    manifestDigest: verified.manifestDigest, productId: verified.productId,
    packageName: verified.packageName, packageVersion: verified.packageVersion };
  let setupOrdinal = 0;
  let setupHandoff = null;
  const call = async (operationId, memberKey, request, resources, supplied = {}) => {
    const definition = definitionFor(installedPublic, operationId, memberKey);
    const packet = exact([
      product.PRODUCT_VERIFICATION_SOURCE_DECLARATIONS.verify,
      product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.resolve,
      product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.bind,
      product.PRODUCT_INSTALL_SOURCE_DECLARATIONS.install,
      product.CATALOG_OPERATION_SOURCE_DECLARATIONS.admit,
      product.CATALOG_OPERATION_SOURCE_DECLARATIONS.view.allowlist,
    ], (candidate) => candidate.definitionKey.operationId === operationId &&
      candidate.definitionKey.memberKey === memberKey, "setup owner packet");
    const slots = authoritySlots(product, definition, supplied);
    const data = { kind: "admission_capability_data", schemaVersion: SCHEMA_VERSION,
      definition: { definitionKey: definition.definitionKey, definitionRef: definition.definitionRef,
        definitionDigest: definition.definitionDigest,
        owner: { ref: packet.owner.authorityRef, digest: packet.owner.authorityDigest } },
      ownerArtifact: { request: ownerVerification.request ?? {
        artifactPath: artifact.artifactPath, artifactRef: path.basename(artifact.artifactPath),
        expectedArtifactDigest: artifact.artifactDigest, expectedProductContentDigest: basis.productContentDigest,
        expectedManifestDigest: basis.productManifestDigest, expectedProductId: basis.productId,
        expectedPackageName: basis.packageName, expectedPackageVersion: basis.packageVersion }, verified },
      request, resourceScope: { resourcesDigest: product.sha256Canonical(resources),
        authoritySlots: product.admissionAuthoritySlots(slots) },
      boundEnvironment: packet.metadata.workspaceBindingRequirement === "forbidden" ? null
        : product.admissionEnvironmentSelection(setupHandoff.prefix, slots.workspace_binding) };
    const authorityValue = { actorRef: WORKER_ACTOR_REF, authorityMode: "trusted_developer" };
    const approvalValue = { decision: "allow", actorRef: WORKER_ACTOR_REF,
      definitionRef: definition.definitionRef, definitionDigest: definition.definitionDigest,
      requestDigest: product.sha256Canonical(request), scopeDigest: product.admissionAuthorityScope(data).digest };
    // The current owner mandate authorizes this bounded trusted-desktop setup.
    const authority = { kind: "resolved_admission_authority", schemaVersion: SCHEMA_VERSION,
      actorRef: WORKER_ACTOR_REF, authorityMode: "trusted_developer",
      authority: { ...coordinate(product, "authority://odd-glc/generic-workflow/developer", authorityValue), value: authorityValue },
      approval: { ...coordinate(product, `approval://odd-glc/generic-workflow/${resumeSetupAttempt ?? "initial"}/${setupOrdinal + 1}`, approvalValue), value: approvalValue } };
    const grants = await Promise.all(definition.capabilityRefs.map((capabilityRef) =>
      product.constructCapabilityGrant(authority, WORKER_ACTOR_REF, operationId, capabilityRef,
        { kind: "admission_capability_grant_construction_basis", fixedPacket: packet, data })));
    return definitionCall({ publicApi: installedPublic, product, verified, operationId, memberKey,
      ordinal: ++setupOrdinal, request,
      resources: { ...resources, admissionAuthority: { basis: data, authority, grants } },
      slots: { ...slots, capability_grants: { requiredCapabilityRefs: [...definition.capabilityRefs],
        grants: grants.map((grant) => ({ ref: grant.grantRef, digest: grant.grantDigest })) } } });
  };
  const applySetup = async (pendingDefinition, label) => {
    const definition = await pendingDefinition;
    const callFileName = `setup-${setupOrdinal}-${definition.invocation.definitionKey.memberKey}-call.json`;
    const callBytes = Buffer.from(`${JSON.stringify(definition, null, 2)}\n`);
    await writeFile(path.join(setupEvidenceRoot, callFileName), callBytes, { flag: "wx" });
    const receipt = await applyDefinitionCall(installedPublic, definition, label);
    if (receipt.resources.eventResource !== undefined) setupHandoff = receipt.resources.eventResource.closeHandoff;
    await writeFile(path.join(setupEvidenceRoot, `setup-${setupOrdinal}-${definition.invocation.definitionKey.memberKey}.json`),
      `${JSON.stringify({ callFile: { path: callFileName, sha256: sha256Bytes(callBytes) }, receipt }, null, 2)}\n`, { flag: "wx" });
    return receipt;
  };
  const verifyCall = await call("abg.operation.product.verify", "verify", {
    targetKind: "packed_artifact", artifact: packedArtifact.artifact, productContent: packedArtifact.productContent,
    descriptor: packedArtifact.descriptor, contributionManifest: packedArtifact.contributionManifest,
    declaredDependencies: verified.declaredDependencies,
    compatibilityInputs: verified.compatibilityRefs.map(compatibilityRef => ({ compatibilityRef, subjectRef: packedArtifact.productContent.ref })),
  }, { kind: "product_verification_resources", schemaVersion: SCHEMA_VERSION, targetKind: "packed_artifact", packedArtifact });
  const verification = await applySetup(verifyCall, "public Product verification");
  const verificationReference = { invocation: { ref: verifyCall.invocation.invocationRef, digest: verifyCall.invocation.invocationDigest },
    outcome: verification.ownerOutput.value.verifiedArtifact };
  const resolvedLock = product.ProductEnvironmentPort.resolve({ kind: "product_resolution_packet", schemaVersion: SCHEMA_VERSION, memberKey: "resolve", verifiedArtifacts: [verified] });
  if (resolvedLock.kind !== "resolved_product_lock") throw new Error(`Product resolution refused: ${JSON.stringify(resolvedLock)}`);
  const lockCoordinate = { ref: resolvedLock.lockId, digest: resolvedLock.lockDigest };
  const resolutionReceipt = await applySetup(call("abg.operation.product.resolve", "resolve", {
    requirements: [{ productId: verified.productId, packageVersion: verified.packageVersion, requiredContractRefs: [], requiredCapabilityRefs: [] }],
    verifiedCandidates: [verificationReference],
  }, { kind: "product_resolution_resource_assertion", schemaVersion: SCHEMA_VERSION,
    verifiedPreimages: [{ verification: verificationReference, verifiedArtifact: verified, verificationOutput: verification.ownerOutput }],
    nativeContractClosure: { selectorDispositions: [], occurrences: [], nativeBindings: [] },
  }, { verification_references: [verificationReference] }), "public Product resolution");
  assert.deepEqual(resolutionReceipt.ownerOutput.value.resolvedLock, lockCoordinate);
  const installCall = await call("abg.operation.product.install", "install", {
    verifiedArtifact: verification.ownerOutput.value.verifiedArtifact, descriptor: packedArtifact.descriptor,
    contributionManifest: packedArtifact.contributionManifest, resolvedLock: lockCoordinate, targetRoot: consumerRoot, installPolicy: "clean",
  }, { kind: "product_install_resource_assertion", schemaVersion: SCHEMA_VERSION,
    eventResource: { kind: "new_abg_event_resource", schemaVersion: SCHEMA_VERSION, eventLogPath,
      locatorDigest: product.sha256Canonical({ kind: "abg_event_log_locator", eventLogPath: path.resolve(eventLogPath) }) },
    packedArtifact, verifiedArtifact: verified, resolvedLock,
  }, { dependency_lock: lockCoordinate, verification_references: [verificationReference], actor: actorAuthority(product) });
  const installation = await applySetup(installCall, "public Product installation");
  let artifactTruth = abg.projectExactPrefixArtifactTruth(setupHandoff.prefix);
  const admittedInstall = abg.projectAdmittedProductInstallByInvocationRef(artifactTruth, installCall.invocation.invocationRef);
  if (admittedInstall === null) throw new Error("install has no admitted owner truth");
  const installedRoot = admittedInstall.install.installedRoot;
  const installedBefore = await inventoryPackage(installedRoot);
  [product, abg, gtl, validator, installedPublic] = await Promise.all([
    "product", "abg", "gtl", "validator", "public",
  ].map(surface => importInstalledSurface(installedRoot, `build/code/src/${surface}/index.js`, nonce)));
  const workspaceCreation = retainedWorksite === undefined
    ? await product.WorkspaceOperationPort.create({ kind: "workspace_create_packet", schemaVersion: SCHEMA_VERSION,
      memberKey: "clean", targetRoot: workspaceRoot, scaffoldPolicy: "none" })
    : await product.WorkspaceOperationPort.open(retainedWorksite.openPacket);
  if (retainedWorksite === undefined
    ? workspaceCreation.kind !== "workspace_create_result"
    : workspaceCreation.kind !== "workspace_open_projection" ||
      !["ready", "unbound"].includes(workspaceCreation.disposition) || workspaceCreation.manifest === null) {
    throw new Error(`workspace selection refused: ${JSON.stringify(workspaceCreation)}`);
  }
  if (retainedWorksite !== undefined) {
    assert.equal(sha256Bytes(await readFile(retainedWorksite.manifest.path)), retainedWorksite.manifest.sha256);
  }
  const authorityManifest = { workspaceId: workspaceCreation.manifest.workspaceRef, canonicalRoot: workspaceCreation.manifest.canonicalRoot,
    authorityMode: "trusted_developer", authorizedActorRef: WORKER_ACTOR_REF };
  const selectedAuthority = product.constructWorkspaceAuthorityBasis({ ...authorityManifest,
    authorityManifestRef: `manifest://odd-glc/generic/${scenario.key}/workspace-authority`, authorityManifestDigest: product.sha256Canonical(authorityManifest) });
  if (selectedAuthority.kind !== "workspace_authority_basis") throw new Error(`workspace authority refused: ${JSON.stringify(selectedAuthority)}`);
  const roots = { toolchainRoot: consumerRoot, productRoot: installedRoot, eventLogRoot, runtimeStateRoot, projectionRoot, archiveRoot };
  const rootFields = [["toolchain", "toolchainRoot"], ["product", "productRoot"], ["event_log", "eventLogRoot"], ["runtime_state", "runtimeStateRoot"], ["projection", "projectionRoot"], ["archive", "archiveRoot"]];
  const bindCall = await call("abg.operation.workspace.bind", "bind", {
    workspaceAuthority: { ref: selectedAuthority.authorityBasisId, digest: selectedAuthority.authorityBasisDigest },
    installedSet: [installation.ownerOutput.value.installedProduct], resolvedLock: lockCoordinate,
    declaredRoots: rootFields.map(([rootKind, field]) => ({ rootKind, path: roots[field] })),
  }, { kind: "product_workspace_binding_resource_assertion", schemaVersion: SCHEMA_VERSION,
    eventResource: reopenEventResource(product, setupHandoff), workspaceAuthority: selectedAuthority,
    workspaceManifest: workspaceCreation.manifest,
    admittedInstalls: [admittedInstall.install], resolvedLock, declaredRoots: roots,
  }, { product_set: [installation.ownerOutput.value.installedProduct], dependency_lock: lockCoordinate, actor: actorAuthority(product) });
  const binding = await applySetup(bindCall, "public WorkspaceBinding");
  const environmentTruth = abg.projectExactPrefixWorkspaceEnvironment(setupHandoff.prefix, binding.ownerOutput.value.binding);
  if (environmentTruth.kind !== "exact_prefix_workspace_environment") throw new Error(`admitted environment refused: ${JSON.stringify(environmentTruth)}`);
  const workspaceAuthorityBasis = environmentTruth.workspaceAuthorityBasis;
  const workspaceBinding = environmentTruth.workspaceBinding;
  artifactTruth = environmentTruth.artifactTruth;
  assert.equal(workspaceAuthorityBasis.canonicalRoot, await realpath(workspaceRoot));
  assert.equal(workspaceBinding.roots.productRoot, installedRoot);
  assert.notEqual(workspaceAuthorityBasis.canonicalRoot, installedRoot);
  // The verified Product manifest selects membership; installed public producers
  // supply the exact publication values, including all declared dependencies.
  const publicationCandidates = Object.entries(gtl)
    .filter(([name, value]) => /^construct.+ModulePublication$/u.test(name) &&
      typeof value === "function")
    .map(([, construct]) => construct(basis));
  const publications = Object.freeze(verified.contributionManifest.publicationBindings
    .map(({ moduleRef, publicationDigest }) => exact(publicationCandidates,
      (publication) => publication.owningProductId === verified.productId &&
        publication.moduleRef === moduleRef &&
        product.modulePublicationSemanticDigest(publication) === publicationDigest,
      `installed publication ${moduleRef}`)));
  const readinessBasis = { workspaceBinding: environmentTruth.workspaceBindingCandidate, resolvedLock, verifiedProducts: [verified],
    installedProducts: [admittedInstall.candidate], publications };
  const catalogSlots = { workspace_binding: binding.ownerOutput.value.binding, product_set: [installation.ownerOutput.value.installedProduct],
    dependency_lock: lockCoordinate, actor: actorAuthority(product) };
  const catalogReceipt = await applySetup(call("abg.operation.catalog.admit", "admit", {
    workspaceBinding: binding.ownerOutput.value.binding, descriptors: [packedArtifact.descriptor],
    contributionManifests: [packedArtifact.contributionManifest], resolvedLock: lockCoordinate,
  }, { kind: "catalog_admission_resource_assertion", schemaVersion: SCHEMA_VERSION,
    eventResource: reopenEventResource(product, setupHandoff), workspaceBinding, resolvedLock,
    verifiedProducts: [verified], admittedInstalls: [admittedInstall.install], publications,
  }, catalogSlots), "public C1/C2 catalog admission");
  const catalog = product.CatalogOperationPort.admit({ kind: "catalog_admit_packet", schemaVersion: SCHEMA_VERSION, memberKey: "admit", readinessBasis });
  assert.equal(catalog.kind, "graph_function_catalog", JSON.stringify(catalog));
  assert.equal(catalogReceipt.ownerOutput.value.catalog.digest, catalog.basisDigest);
  const constructionIds = product.WORKSITE_CONSTRUCTION_IDS;
  const executionIds = product.WORKSITE_COMMAND_EXECUTION_IDS;
  const allowlist = [constructionIds.graphFunctionRef, executionIds.graphFunctionRef].sort();
  const selectedConstructionIds = scenarioHasConstructionFanIn(scenario)
    ? product.WORKSITE_BRANCH_CONSTRUCTION_IDS : constructionIds;
  if (selectedConstructionIds !== constructionIds) {
    const program = exact(publications.flatMap((publication) => publication.programs),
      (candidate) => candidate.programRef === selectedConstructionIds.programRef,
      "installed branch construction Program");
    allowlist.push(...program.callableMembership.filter((ref) => !allowlist.includes(ref)));
    allowlist.sort();
  }
  const viewReceipt = await applySetup(call("abg.operation.catalog.view", "allowlist", {
    catalog: catalogReceipt.ownerOutput.value.catalog, allowlist,
  }, { kind: "catalog_view_resource_assertion", schemaVersion: SCHEMA_VERSION, catalog }, catalogSlots), "public shared C1/C2 CatalogView");
  const catalogView = product.CatalogOperationPort.constructView({ kind: "catalog_view_packet", schemaVersion: SCHEMA_VERSION, memberKey: "allowlist", catalog, allowlist });
  assert.equal(catalogView.kind, "graph_function_catalog_view", JSON.stringify(catalogView));
  assert.deepEqual(viewReceipt.ownerOutput.value.effectiveHandles, catalogView.allowlist);
  const admittedInstalls = Object.freeze([admittedInstall.install]);
  const productRoot = workspaceBinding.roots.productRoot;
  const resolution = await product.ProductExecutionResolutionPort.resolve({
    catalog,
    catalogView,
    admittedInstalls,
    verifyInstallAdmission: (candidate) =>
      abg.hasAdmittedProductInstall(artifactTruth, candidate),
    programRef: selectedConstructionIds.programRef,
    selection: {
      kind: "direct",
      catalogHandle: selectedConstructionIds.graphFunctionRef,
    },
  });
  if (resolution.kind !== "loaded_product_execution_resolution") {
    throw new Error(
      "C1 execution resolution refused: " + JSON.stringify(resolution),
    );
  }
  const applications = Object.freeze([]);
  const declaredRegimes = new Set([
    ...resolution.programValidation.executableLeafRows.map((row) => row.fibre),
    ...resolution.programValidation.interactionLeafRows.map((row) => row.fibre),
  ]);
  const policy = product.constructRootInvocationPolicy(
    workspaceBinding,
    resolution.program,
    resolution.programValidation.interactionLeafRows.map((row) => ({
      requirementKey: row.requirementKey,
      requirementKeyDigest: row.requirementKeyDigest,
      actorCapabilityRef: row.requirement.actorCapabilityRef,
    })),
    ["F_D", "F_P", "F_H"].filter((regime) => declaredRegimes.has(regime)),
    applications,
  );
  const directGrant = product.constructCapabilityGrant(
    policy,
    WORKER_ACTOR_REF,
    "abg.operation.run.invoke",
    product.DIRECT_INVOKE_CAPABILITY,
    {
      admittedInstalls,
      workspaceBinding,
      fixedPacket: product.RUN_OPERATION_CONTRACTS.invoke.invoke,
    },
  );
  const targetInputs = [];
  for (const relativePath of scenarioTargetPaths(scenario)) {
    const absolutePath = path.join(workspaceAuthorityBasis.canonicalRoot, relativePath);
    if (retainedWorksite === undefined) await mkdir(path.dirname(absolutePath), { recursive: true });
    else assert.ok((await lstat(path.dirname(absolutePath))).isDirectory(), "retained target parent must already exist");
    const relativeRoot = path.posix.dirname(relativePath);
    const territoryPath = relativeRoot === "."
      ? workspaceAuthorityBasis.canonicalRoot
      : path.join(workspaceAuthorityBasis.canonicalRoot, relativeRoot);
    const subject = product.constructWorksiteSubject({
      workspaceAuthorityBasis,
      workspaceBinding,
      subjectUri: pathToFileURL(absolutePath).href,
      relativePath,
    });
    const territory = product.constructWorksiteTerritory({
      workspaceAuthorityBasis,
      workspaceBinding,
      territoryUri: pathToFileURL(territoryPath).href,
      relativeRoot,
    });
    const predecessorObservation = await product.observeWorksiteSubject(
      workspaceAuthorityBasis,
      workspaceBinding,
      subject,
    );
    targetInputs.push({ subject, territory, predecessorObservation });
  }
  const { task, targets: constructionTargets, prompt } = constructGenericWorkflowTask({
    product,
    workspaceAuthorityBasis,
    workspaceBinding,
    capabilityGrant: directGrant,
    scenario,
    targetInputs,
  });
  if (!(scenarioHasConstructionFanIn(scenario)
    ? product.isWorksiteBranchConstructionTask(task)
    : product.isWorksiteConstructionTask(task))) {
    throw new Error("C1 task does not satisfy the installed Product contract");
  }
  const install = Object.freeze({
    ...artifact,
    verified,
    lock: resolvedLock,
    installCandidate: admittedInstall.candidate,
    consumerRoot,
    installedRoot,
  });
  if (retainedWorksite !== undefined) {
    assert.equal(sha256Bytes(await readFile(retainedWorksite.manifest.path)), retainedWorksite.manifest.sha256);
  }
  return {
    scenario,
    scratch,
    ownScratch: runRoot === undefined,
    install,
    bootstrapBefore,
    installedBefore,
    product,
    abg,
    gtl,
    validator,
    installedPublic,
    setupHandoff,
    admittedInstalls,
    workspaceBinding,
    workspaceAuthorityBasis,
    artifactTruth,
    publications,
    catalog,
    catalogView,
    resolution,
    policy,
    applications,
    task,
    constructionTargets,
    prompt,
    eventLogPath,
    installInvocationRef: installCall.invocation.invocationRef,
    workspaceBindingInvocationRef: bindCall.invocation.invocationRef,
    worksiteRoot: workspaceAuthorityBasis.canonicalRoot,
  };
}

export async function runDefinition(environment, task, resolution, policy, closeHandoff, sourceRun = null) {
  const { product, installedPublic, workspaceBinding, catalog, catalogView } = environment;
  const eventResource = reopenEventResource(product, closeHandoff);
  const inputContract = { ref: resolution.resolution.inputContract.contractRef, digest: resolution.resolution.inputContractDigest };
  if (product.admitInstalledProductInput(resolution.productSemantics, inputContract.ref, task) === null) {
    throw new TypeError("installed run input admission refused");
  }
  const grants = [task.capabilityGrant];
  const authority = product.constructInvocationAuthority(WORKER_ACTOR_REF, workspaceBinding, catalogView,
    resolution.program.programRef, resolution.selectedCatalogEntry, policy, grants,
    { admittedInstalls: environment.admittedInstalls, workspaceBinding, fixedPacket: product.RUN_OPERATION_CONTRACTS.invoke.invoke });
  assert.equal(authority.kind, "invocation_authority", JSON.stringify(authority));
  const environmentRef = resolution.program.policies[environment.gtl.RUN_ENVIRONMENT_POLICY];
  let runEnvironmentResources;
  if (environmentRef !== undefined) {
    const declaration = exact(resolution.programPublication.runEnvironments ?? [],
      (candidate) => candidate.declarationRef === environmentRef, "installed run environment");
    const inventory = environment.gtl.WORKSITE_COMMAND_EXECUTION_CONTEXT_INVENTORY;
    assert.equal(declaration.corpusAccess, null, "C1/C2 context has no external corpus");
    const dependencies = declaration.dependencies.map((dependency) => {
      assert.equal(dependency.recordFormat, "member_inventory@1");
      assert.equal(dependency.recordDigest, sha256Bytes(Buffer.from(inventory.content)),
        "declared dependency must select the installed C2 context inventory");
      return { dependencyRef: dependency.dependencyRef, root: resolution.programInstall.installedRoot,
        recordPath: path.join(resolution.programInstall.installedRoot, inventory.path) };
    });
    const temporaryRoot = path.join(workspaceBinding.roots.archiveRoot, "run-environment");
    await mkdir(temporaryRoot, { recursive: true });
    const coordinates = { dependencies, temporaryRoot, pythonPath: null };
    runEnvironmentResources = product.constructRunEnvironmentResources({
      kind: "run_environment_resources", schemaVersion: SCHEMA_VERSION, ...coordinates,
      permission: { authorityRef: authority.authorityRef, authorityDigest: authority.authorityDigest,
        actorRef: authority.actorRef, programRef: resolution.program.programRef,
        environmentRef, environmentDigest: product.sha256Canonical(declaration),
        operations: [...new Set(["read_context", ...declaration.accesses.map((access) => access.operation)])].sort(),
        ...coordinates },
    });
  }
  const program = { ref: resolution.resolution.programRef, digest: resolution.resolution.programDigest };
  const view = { ref: `graph-function-catalog-view://abiogenesis/${catalogView.viewDigest.slice(7)}`, digest: catalogView.viewDigest };
  const definition = definitionFor(installedPublic, "abg.operation.run.invoke", "invoke");
  const steeringDigest = product.sha256Canonical(eventResource);
  const source = sourceRun === null ? { kind: "none" } : { kind: "admitted_source_result", basis: sourceRun.sourceBasis };
  return definitionCall({ publicApi: installedPublic, product, verified: environment.install.verified,
    operationId: "abg.operation.run.invoke", memberKey: "invoke", ordinal: sourceRun === null ? 101 : 102,
    request: { program, catalogHandle: resolution.selectedCatalogEntry.handle, inputContract, input: task,
      catalogView: view, allowlist: catalogView.allowlist,
      sourceBasis: sourceRun === null ? { kind: "none" } : { kind: "admitted_source_result",
        projectionAuthority: { ref: sourceRun.call.invocation.invocationRef, digest: sourceRun.call.invocation.invocationDigest },
        sourceResult: { ref: sourceRun.sourceBasis.sourceResultRef, digest: sourceRun.sourceBasis.sourceResultDigest } } },
    slots: {
      workspace_binding: { ref: workspaceBinding.bindingId, digest: workspaceBinding.bindingDigest },
      product_set: environment.admittedInstalls.map(install => ({ ref: install.installId, digest: install.productContentDigest })),
      dependency_lock: { ref: workspaceBinding.lockId, digest: workspaceBinding.lockDigest },
      catalog_scope: { catalog: { ref: `graph-function-catalog://abiogenesis/${catalog.basisDigest.slice(7)}`, digest: catalog.basisDigest }, view, allowlist: catalogView.allowlist },
      execution_program: program,
      graph_function: { graphFunction: { ref: resolution.resolution.graphFunctionRef, digest: resolution.resolution.graphFunctionDigest }, membership: resolution.resolution.programGraphFunctionMembership },
      input_contract: { contract: inputContract, valueRef: task.taskRef, valueDigest: product.sha256Canonical(task), value: task },
      session_policy: { ref: policy.policyRef, digest: policy.policyDigest },
      capability_grants: { requiredCapabilityRefs: [...definition.capabilityRefs], grants: grants.map(grant => ({ ref: grant.grantRef, digest: grant.grantDigest })) },
      actor: { actor: { ref: WORKER_ACTOR_REF, digest: product.sha256Canonical({ actorRef: WORKER_ACTOR_REF }) }, attribution: { ref: authority.authorityRef, digest: authority.authorityDigest } },
      transport_steering: { ref: `transport-steering://abiogenesis/${steeringDigest.slice(7)}`, digest: steeringDigest },
    },
    resources: { kind: "run_invocation_resource_assertion", schemaVersion: SCHEMA_VERSION,
      eventResource, catalog, catalogView, applications: environment.applications, source,
      ...(runEnvironmentResources === undefined ? {} : { runEnvironmentResources }) },
  });
}

export async function applyDeclaredRun(environment, call, label, resultPredicate) {
  await writeFile(path.join(environment.scratch, `${label}-definition-call.json`), `${JSON.stringify(call, null, 2)}\n`, { flag: "wx" });
  const receipt = await applyDefinitionCall(environment.installedPublic, call, label);
  await writeFile(path.join(environment.scratch, `${label}-definition-receipt.json`), `${JSON.stringify(receipt, null, 2)}\n`, { flag: "wx" });
  const value = receipt.ownerOutput.value;
  if (value.disposition !== "completed" || value.result === null || receipt.resources.invocationAdmission === null) {
    throw new Error(`${label} did not complete: ${JSON.stringify(receipt)}`);
  }
  const closeHandoff = receipt.resources.eventResource.closeHandoff;
  const resultReadCall = publicReadDefinition(environment, { receipt, closeHandoff }, "run_result");
  await writeFile(path.join(environment.scratch, `${label}-result-read-call.json`), `${JSON.stringify(resultReadCall, null, 2)}\n`, { flag: "wx" });
  const resultReadReceipt = await applyDefinitionCall(environment.installedPublic, resultReadCall, `${label} result read`);
  await writeFile(path.join(environment.scratch, `${label}-result-read-receipt.json`), `${JSON.stringify(resultReadReceipt, null, 2)}\n`, { flag: "wx" });
  const sourceBasis = sourceResultFromRead(environment.abg, call, receipt, resultReadReceipt);
  if (!resultPredicate(sourceBasis.sourceResultValue)) throw new Error(`${label} result fails its installed Product contract`);
  return Object.freeze({ call, receipt, closeHandoff: resultReadReceipt.resources.eventResource.closeHandoff, sourceBasis,
    resultRead: { call: resultReadCall, receipt: resultReadReceipt },
    result: sourceBasis.sourceResultValue, resultRef: sourceBasis.sourceResultRef,
    runId: value.run.ref, replayRef: sourceBasis.sourceReplayRef, replayDigest: sourceBasis.sourceReplayDigest });
}

export function sourceResultFromRead(abg, call, receipt, resultReadReceipt) {
  const value = receipt.ownerOutput.value;
  const projection = resultReadReceipt.ownerOutput.value.projection;
  assert.equal(projection.kind, "run_result_projection");
  assert.equal(projection.subject.ref, value.run.ref);
  assert.equal(projection.subject.digest, value.run.digest);
  assert.deepEqual(projection.result, value.result);
  const prefix = resultReadReceipt.resources.eventResource.closeHandoff.prefix;
  const validatedPrefix = abg.selectValidatedRuntimeEventPrefix(abg.readRuntimeEventsAtDurablePrefix(prefix));
  const admittedInvocation = abg.rehydrateInvocationAdmissionAtPrefix(
    validatedPrefix, receipt.resources.invocationAdmission.ref);
  assert.equal(admittedInvocation?.publicRequestInvocationRef, call.invocation.invocationRef);
  const sourceBasis = abg.deriveInvocationSourceResultBasisAtPrefix(
    validatedPrefix,
    { publicAuthorityDigest: call.invocation.invocationDigest, runtimeInvocationRef: admittedInvocation.invocationRef,
      invocationAdmissionRef: receipt.resources.invocationAdmission.ref, runId: value.run.ref, resultRef: projection.result.ref });
  if (sourceBasis === null) throw new Error("declared result read lacks its exact admitted source basis");
  // run_result names the outer producer. A C3 consumer must separately select
  // the admitted reducer through graph_call_result before constructing C2.
  assert.equal(sourceBasis.sourceRunId, value.run.ref);
  assert.equal(sourceBasis.sourceResultRef, projection.result.ref);
  assert.equal(sourceBasis.sourceResultDigest, projection.result.digest);
  assert.equal(sourceBasis.sourceReplayRef, projection.replay.ref);
  assert.equal(sourceBasis.sourceReplayDigest, projection.replay.digest);
  return sourceBasis;
}

export function selectUniqueConstructionReducer(events, runId, reducerGraphFunctionRef) {
  const matches = events.filter((event) => event.runId === runId &&
    event.kind === "graph_call_opened" && event.graphFunctionRef === reducerGraphFunctionRef);
  assert.equal(matches.length, 1, "C3 source selection requires one exact admitted reducer");
  return matches[0];
}

/** Selects the C3 reducer using the installed Public read; never rewrites a basis. */
export async function selectConstructionExecutionSource(environment, construction) {
  const { product, abg } = environment;
  if (construction.sourceBasis.sourceGraphFunctionRef === product.WORKSITE_CONSTRUCTION_IDS.graphFunctionRef) {
    return construction;
  }
  assert.equal(construction.sourceBasis.sourceGraphFunctionRef,
    product.WORKSITE_BRANCH_CONSTRUCTION_IDS.graphFunctionRef);
  const prefix = abg.selectValidatedRuntimeEventPrefix(
    abg.readRuntimeEventsAtDurablePrefix(construction.closeHandoff.prefix));
  const reducer = selectUniqueConstructionReducer(prefix.events, construction.runId,
    product.WORKSITE_BRANCH_CONSTRUCTION_IDS.reducerGraphFunctionRef);
  const call = publicReadDefinition(environment, construction, "graph_call_result", {
    sourceKind: "graph_call", sourceRef: reducer.graphCallId, sourceDigest: reducer.payload.graphCallDigest,
  });
  await writeFile(path.join(environment.scratch, "construction-reducer-source-read-call.json"),
    JSON.stringify(call, null, 2) + "\n", { flag: "wx" });
  const receipt = await applyDefinitionCall(environment.installedPublic, call, "construction reducer source read");
  await writeFile(path.join(environment.scratch, "construction-reducer-source-read-receipt.json"),
    JSON.stringify(receipt, null, 2) + "\n", { flag: "wx" });
  assert.deepEqual(receipt.resources.eventResource.closeHandoff, construction.closeHandoff);
  const projection = receipt.ownerOutput.value.projection;
  assert.equal(projection.kind, "graph_call_result_projection");
  assert.deepEqual(projection.subject, { ref: reducer.graphCallId, digest: reducer.payload.graphCallDigest });
  const original = construction.sourceBasis;
  const sourceBasis = abg.deriveInvocationSourceResultBasisAtPrefix(prefix, {
    publicAuthorityDigest: original.publicAuthorityDigest, runtimeInvocationRef: original.sourceInvocationRef,
    invocationAdmissionRef: original.sourceInvocationAdmissionRef, runId: original.sourceRunId,
    resultRef: projection.result.ref,
  });
  assert.ok(sourceBasis, "Public reducer result must have its native admitted source basis");
  assert.equal(sourceBasis.sourceGraphFunctionRef, product.WORKSITE_BRANCH_CONSTRUCTION_IDS.reducerGraphFunctionRef);
  assert.equal(sourceBasis.sourceGraphCallId, reducer.graphCallId);
  assert.equal(sourceBasis.sourceResultDigest, projection.result.digest);
  assert.deepEqual(sourceBasis.sourceResultValue, construction.result);
  assert.deepEqual(abg.rehydrateInvocationSourceResultBasisAtDurablePrefix(construction.closeHandoff.prefix, sourceBasis), sourceBasis);
  return Object.freeze({ ...construction, sourceBasis, resultRef: sourceBasis.sourceResultRef,
    executionSourceRead: { call, receipt }, outerSourceBasis: original });
}

function predicateDeclaration(predicate) {
  const { id: _id, kind: _kind, role: _role, ...declaration } = predicate;
  return declaration;
}

export async function constructCommandExecutionTask(environment, constructionOutcome) {
  const {
    product,
    abg,
    admittedInstalls,
    workspaceBinding,
    catalog,
    catalogView,
    applications,
    scenario,
    constructionTargets,
  } = environment;
  const ids = product.WORKSITE_COMMAND_EXECUTION_IDS;
  const sourceResult = constructionOutcome.result;
  if (
    constructionOutcome.resultRef !== constructionOutcome.sourceBasis.sourceResultRef ||
    !product.isWorksiteConstructionResult(sourceResult)
  ) {
    throw new TypeError("public C1 outcome lacks its exact admitted construction result");
  }
  const resolution = await product.ProductExecutionResolutionPort.resolve({
    catalog,
    catalogView,
    admittedInstalls,
    verifyInstallAdmission: (candidate) =>
      abg.hasAdmittedProductInstall(environment.artifactTruth, candidate),
    programRef: ids.programRef,
    selection: { kind: "direct", catalogHandle: ids.graphFunctionRef },
  });
  if (resolution.kind !== "loaded_product_execution_resolution") {
    throw new Error(`C2 execution resolution refused: ${JSON.stringify(resolution)}`);
  }
  const declaredRegimes = new Set([
    ...resolution.programValidation.executableLeafRows.map((row) => row.fibre),
    ...resolution.programValidation.interactionLeafRows.map((row) => row.fibre),
  ]);
  const policy = product.constructRootInvocationPolicy(
    workspaceBinding,
    resolution.program,
    resolution.programValidation.interactionLeafRows.map((row) => ({
      requirementKey: row.requirementKey,
      requirementKeyDigest: row.requirementKeyDigest,
      actorCapabilityRef: row.requirement.actorCapabilityRef,
    })),
    ["F_D", "F_P", "F_H"].filter((regime) => declaredRegimes.has(regime)),
    applications,
  );
  const capabilityGrant = product.constructCapabilityGrant(
    policy,
    WORKER_ACTOR_REF,
    "abg.operation.run.invoke",
    product.DIRECT_INVOKE_CAPABILITY,
    {
      admittedInstalls,
      workspaceBinding,
      fixedPacket: product.RUN_OPERATION_CONTRACTS.invoke.invoke,
    },
  );
  const executionTask = product.constructWorksiteCommandExecutionTask({
    workspaceAuthorityBasis: environment.workspaceAuthorityBasis,
    workspaceBinding,
    capabilityGrant,
    sourceConstructionResultRef: sourceResult.resultRef,
    sourceConstructionResultDigest: sourceResult.resultDigest,
    sourceConstructionResult: sourceResult,
    commands: scenario.validationCommands.map((command) => ({
      commandId: command.id,
      executable: command.command,
      args: command.args,
      relativeCwd: command.cwd,
      environment: command.env,
      timeoutMs: command.timeoutMs,
      terminationGraceMs: command.terminationGraceMs,
      expectedReports: command.expectedReports,
    })),
    outcomePredicates: scenario.outcomePredicates.map((predicate) => ({
      predicateId: predicate.id,
      predicateKind: predicate.kind,
      declaration: predicateDeclaration(predicate),
    })),
    protectedObservations: sourceResult.members.map((member, ordinal) => ({
      sourceMemberRef: member.inputMemberRef,
      subject: constructionTargets[ordinal].subject,
      observation: member.successorObservation,
    })),
    allowedWriteTerritories: scenario.allowedEvidenceWrites,
  });
  if (!product.isWorksiteCommandExecutionTask(executionTask)) {
    throw new TypeError("C2 task differs from the installed Product contract");
  }
  return Object.freeze({ executionTask, resolution, policy });
}

export async function prepareGenericWorkflowExecution(environment, constructionOutcome) {
  const executionSource = await selectConstructionExecutionSource(environment, constructionOutcome);
  const execution = await constructCommandExecutionTask(environment, executionSource);
  const executionCall = await runDefinition(environment, execution.executionTask, execution.resolution,
    execution.policy, executionSource.closeHandoff, executionSource);
  return Object.freeze({ ...execution, executionSource, executionCall });
}

export function publicReadDefinition(environment, run, memberKey, source = null) {
  const { product, abg, installedPublic, workspaceBinding } = environment;
  const packet = abg.ABG_PROJECT_READ_CONTRACTS[memberKey];
  const grants = packet.metadata.capabilityRefs.map(capabilityRef => product.constructCapabilityGrant(
    environment.workspaceAuthorityBasis, workspaceBinding.authorizedActorRef,
    packet.definitionKey.operationId, capabilityRef,
    { admittedInstalls: environment.admittedInstalls, workspaceBinding, fixedPacket: packet }));
  const prefix = run.closeHandoff.prefix;
  const coordinate = run.receipt.ownerOutput.value.run;
  return definitionCall({ publicApi: installedPublic, product, verified: environment.install.verified,
    operationId: "abg.operation.project.read", memberKey, ordinal: memberKey === "run_result" ? 201 : memberKey === "run_replay" ? 202 : 203,
    request: { caseKey: memberKey, source: source ?? { sourceKind: "run", sourceRef: coordinate.ref, sourceDigest: coordinate.digest },
      projectionBasis: { projectionBasisRef: prefix.eventLogRef, projectionBasisDigest: prefix.coordinateDigest },
      selector: memberKey === "run_replay" ? { kind: "ordinal_page", fromOrdinal: 0, limit: 100000 } : { kind: "none" } },
    slots: { workspace_binding: { ref: workspaceBinding.bindingId, digest: workspaceBinding.bindingDigest },
      product_set: environment.admittedInstalls.map(install => ({ ref: install.installId, digest: install.productContentDigest })),
      dependency_lock: { ref: workspaceBinding.lockId, digest: workspaceBinding.lockDigest },
      capability_grants: { requiredCapabilityRefs: packet.metadata.capabilityRefs, grants: grants.map(grant => ({ ref: grant.grantRef, digest: grant.grantDigest })) } },
    resources: { kind: "abg_project_read_resource_assertion", schemaVersion: SCHEMA_VERSION,
      eventResource: reopenEventResource(product, run.closeHandoff) },
  });
}

export async function runFreshPublicRead(environment, run, variant) {
  const requestPath = path.join(
    environment.scratch,
    `fresh-public-${variant}-request.json`,
  );
  await writeFile(requestPath, JSON.stringify({
    kind: "generic_live_workflow_fresh_public_read_request",
    schemaVersion: "1",
    installedRoot: environment.install.installedRoot,
    invocation: publicReadDefinition(environment, run, variant),
    sourceRun: variant === "run_result" ? { call: run.call, receipt: run.receipt } : null,
  }));
  const supportPath = fileURLToPath(import.meta.url);
  const { stdout, stderr } = await execFileAsync(
    process.execPath,
    [supportPath, "--fresh-public-read", requestPath],
    {
      cwd: environment.scratch,
      env: {},
      maxBuffer: 100 * 1024 * 1024,
    },
  );
  if (stderr !== "") throw new Error(`fresh public ${variant} wrote stderr: ${stderr}`);
  await writeFile(path.join(environment.scratch, `fresh-public-${variant}-response.json`), `${stdout}\n`, { flag: "wx" });
  const value = JSON.parse(stdout);
  if (
    value.kind !== "generic_live_workflow_fresh_public_read_result" ||
    value.variant !== variant ||
    value.closed !== true
  ) {
    throw new Error(`fresh public ${variant} refused: ${stdout}`);
  }
  return value;
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function sameUniqueStringSet(left, right) {
  if (
    !Array.isArray(left) || !Array.isArray(right) ||
    left.some((value) => typeof value !== "string") ||
    right.some((value) => typeof value !== "string")
  ) return false;
  const leftMembers = new Set(left);
  const rightMembers = new Set(right);
  return leftMembers.size === left.length &&
    rightMembers.size === right.length &&
    leftMembers.size === rightMembers.size &&
    left.every((value) => rightMembers.has(value));
}

function admittedPredicateSatisfied(predicate, observedValue) {
  if (
    predicate.kind === "module_set_exact" ||
    predicate.kind === "test_report_set_exact"
  ) {
    return sameUniqueStringSet(observedValue, predicate.equals);
  }
  if (predicate.kind === "test_pass_count") {
    return Number.isSafeInteger(observedValue) &&
      observedValue >= predicate.greaterThanOrEqual;
  }
  if (predicate.kind === "http_response_exact") {
    return observedValue?.request?.hostname === predicate.request.hostname &&
      observedValue?.request?.method === predicate.request.method &&
      observedValue?.request?.path === predicate.request.path &&
      observedValue?.portFile?.state === "observed" &&
      observedValue?.response?.status === predicate.status &&
      observedValue?.response?.body === predicate.body &&
      observedValue?.process?.terminationConfirmed === true;
  }
  return sameJson(observedValue, predicate.equals);
}

export function evaluateGenericScenarioOutcome(scenario, executionObservation) {
  const observation = assertRecord(
    executionObservation,
    "admitted C2 execution observation",
  );
  if (
    observation.kind !== "worksite_command_execution_observation" ||
    !Array.isArray(observation.commandResults) ||
    !Array.isArray(observation.predicateObservations) ||
    observation.predicateObservations.length !== scenario.outcomePredicates.length
  ) {
    throw new TypeError("generic outcome interpretation requires one exact admitted C2 observation");
  }
  const predicates = scenario.outcomePredicates.map((predicate, ordinal) => {
    const admitted = observation.predicateObservations[ordinal];
    if (
      admitted?.kind !== "worksite_predicate_observation" ||
      admitted.ordinal !== ordinal ||
      admitted.predicateId !== predicate.id ||
      admitted.predicateKind !== predicate.kind ||
      !Array.isArray(admitted.evidence) ||
      !Array.isArray(admitted.evidenceRefs)
    ) {
      throw new TypeError(`${predicate.id} differs from its admitted C2 row`);
    }
    return Object.freeze({
      id: predicate.id,
      kind: predicate.kind,
      disposition: admittedPredicateSatisfied(predicate, admitted.observedValue)
        ? "satisfied"
        : "unsatisfied",
      observed: admitted.observedValue,
      evidence: admitted.evidence,
      evidenceRefs: admitted.evidenceRefs,
    });
  });
  return Object.freeze({
    kind: "generic_scenario_validation",
    schemaVersion: "2",
    source: Object.freeze({
      observationRef: observation.observationRef,
      observationDigest: observation.observationDigest,
    }),
    disposition: predicates.every((row) => row.disposition === "satisfied")
      ? "satisfied"
      : "unsatisfied",
    commands: observation.commandResults,
    predicates: Object.freeze(predicates),
  });
}

export function validateClaudeConfiguration(environment) {
  const appendArgs = environment.ABG_TS_CLAUDE_APPEND_ARGS;
  if (appendArgs === undefined) {
    throw new TypeError(
      "live generic workflow requires explicit ABG_TS_CLAUDE_APPEND_ARGS",
    );
  }
  const parsed = JSON.parse(appendArgs);
  if (!Array.isArray(parsed) || parsed.some((value) => typeof value !== "string")) {
    throw new TypeError("ABG_TS_CLAUDE_APPEND_ARGS must be one JSON string array");
  }
  if (parsed.some((value) => /ultra/iu.test(value))) {
    throw new TypeError("Ultra is prohibited for live generic workflow Workers");
  }
  const effortIndexes = parsed.flatMap((value, index) =>
    value === "--effort" ? [index] : []
  );
  const effort = effortIndexes.length === 1
    ? parsed[effortIndexes[0] + 1]
    : undefined;
  if (!CLAUDE_WORKER_EFFORTS.includes(effort)) {
    throw new TypeError(
      "live generic workflow Workers require exactly one supported --effort",
    );
  }
  const inactivityTimeoutRaw = environment.ABG_TS_FP_TIMEOUT_MS;
  const inactivityTimeoutMs = Number(inactivityTimeoutRaw);
  if (inactivityTimeoutMs !== GENERIC_LIVE_WORKFLOW_INACTIVITY_TIMEOUT_MS) {
    throw new TypeError(
      `ABG_TS_FP_TIMEOUT_MS must equal ${GENERIC_LIVE_WORKFLOW_INACTIVITY_TIMEOUT_MS}`,
    );
  }
  const absoluteTimeoutRaw = environment.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS;
  const absoluteTimeoutMs = Number(absoluteTimeoutRaw);
  if (absoluteTimeoutMs !== GENERIC_LIVE_WORKFLOW_ABSOLUTE_TIMEOUT_MS) {
    throw new TypeError(
      `ABG_TS_FP_ABSOLUTE_TIMEOUT_MS must equal ${GENERIC_LIVE_WORKFLOW_ABSOLUTE_TIMEOUT_MS}`,
    );
  }
  return Object.freeze([...parsed]);
}

export async function qualifyGenericWorkflowInstalledNoLive({
  scenario,
  artifactPath,
  expectedArtifactDigest,
  runRoot,
}) {
  if (!path.isAbsolute(assertNonEmptyString(
    artifactPath,
    "ABI C1+C2 artifact path",
  ))) {
    throw new TypeError("ABI C1+C2 artifact path must be absolute");
  }
  const pinnedArtifactDigest = normalizedExpectedDigest(
    assertNonEmptyString(
      expectedArtifactDigest,
      "expected ABI C1+C2 artifact digest",
    ),
  );
  const prepared = await prepareInstalledScenario({
    scenario,
    artifactPath,
    expectedArtifactDigest: pinnedArtifactDigest,
    runRoot,
  });
  if (
    prepared.workspaceBinding.roots.productRoot !==
      prepared.install.installedRoot ||
    prepared.worksiteRoot !== prepared.workspaceAuthorityBasis.canonicalRoot ||
    prepared.worksiteRoot === prepared.install.installedRoot
  ) {
    throw new TypeError(
      "no-live Product root differs from the admitted install root",
    );
  }
  const constructionIds = prepared.product.WORKSITE_CONSTRUCTION_IDS;
  const executionIds = prepared.product.WORKSITE_COMMAND_EXECUTION_IDS;
  const expectedAllowlist = [
    constructionIds.graphFunctionRef,
    executionIds.graphFunctionRef,
  ].sort();
  if (scenarioHasConstructionFanIn(scenario)) {
    expectedAllowlist.push(...prepared.resolution.program.callableMembership
      .filter((ref) => !expectedAllowlist.includes(ref)));
    expectedAllowlist.sort();
  }
  if (
    prepared.product.canonicalJson(prepared.catalogView.allowlist) !==
      prepared.product.canonicalJson(expectedAllowlist)
  ) {
    throw new TypeError("installed setup did not retain one shared C1+C2 catalog view");
  }
  const executionResolution = await prepared.product.ProductExecutionResolutionPort
    .resolve({
      catalog: prepared.catalog,
      catalogView: prepared.catalogView,
      admittedInstalls: prepared.admittedInstalls,
      verifyInstallAdmission: (candidate) =>
        prepared.abg.hasAdmittedProductInstall(
          prepared.artifactTruth,
          candidate,
        ),
      programRef: executionIds.programRef,
      selection: {
        kind: "direct",
        catalogHandle: executionIds.graphFunctionRef,
      },
    });
  if (executionResolution.kind !== "loaded_product_execution_resolution") {
    throw new Error(
      "installed C2 execution resolution refused: " +
        prepared.product.canonicalJson(executionResolution),
    );
  }
  const constructionCall = await runDefinition(prepared, prepared.task, prepared.resolution, prepared.policy, prepared.setupHandoff);
  const admittedInput = prepared.product.admitInstalledProductInput(prepared.resolution.productSemantics,
    prepared.resolution.resolution.inputContract.contractRef, prepared.task);
  const rawInput = prepared.validator.rawAdmitValue(admittedInput, "invocation_input", prepared.resolution.resolution.inputContract.contractRef);
  assert.equal(rawInput.kind, "raw_admitted_value");
  const invocationAuthority = prepared.product.constructInvocationAuthority(WORKER_ACTOR_REF, prepared.workspaceBinding,
    prepared.catalogView, prepared.resolution.program.programRef, prepared.resolution.selectedCatalogEntry,
    prepared.policy, [prepared.task.capabilityGrant], { admittedInstalls: prepared.admittedInstalls,
      workspaceBinding: prepared.workspaceBinding, fixedPacket: prepared.product.RUN_OPERATION_CONTRACTS.invoke.invoke });
  const candidate = prepared.product.constructExactDirectInvocation(constructionCall.invocation,
    prepared.workspaceBinding, prepared.catalogView, prepared.resolution.program, prepared.resolution.selectedCatalogEntry,
    rawInput, prepared.policy, [prepared.task.capabilityGrant], invocationAuthority);
  assert.equal(candidate.kind, "public_invocation_candidate", JSON.stringify(candidate));
  await writeFile(path.join(prepared.scratch, "c1-unexecuted-definition-call.json"), `${JSON.stringify(constructionCall, null, 2)}\n`, { flag: "wx" });
  const bootstrapAfter = await inventoryPackage(prepared.install.bootstrapPackage);
  const installedAfter = await inventoryPackage(prepared.install.installedRoot);
  assert.equal(bootstrapAfter.digest, prepared.bootstrapBefore.digest, "bootstrap package content changed during setup");
  assert.equal(installedAfter.digest, prepared.installedBefore.digest, "admitted owner package content changed during worksite setup");
  return Object.freeze({
    kind: "generic_installed_no_live_proof",
    schemaVersion: "1",
    disposition: "qualified",
    liveWorkerInvoked: false,
    scenarioKey: scenario.key,
    abiArtifact: Object.freeze({
      path: prepared.install.artifactPath,
      sha256: prepared.install.artifactDigest,
      productId: prepared.install.verified.productId,
      packageVersion: prepared.install.verified.packageVersion,
      productContentDigest: prepared.install.verified.productContentDigest,
      productManifestDigest: prepared.install.verified.manifestDigest,
    }),
    setupPrefixDigest: prepared.product.sha256Canonical(
      prepared.setupHandoff.prefix,
    ),
    catalogBasisDigest: prepared.catalog.basisDigest,
    catalogViewDigest: prepared.catalogView.viewDigest,
    catalogAllowlist: prepared.catalogView.allowlist,
    constructionProgramRef: prepared.resolution.program.programRef,
    commandExecutionProgramRef: executionResolution.program.programRef,
    constructionTaskRef: prepared.task.taskRef,
    constructionTask: prepared.task,
    workspaceAuthorityBasis: prepared.workspaceAuthorityBasis,
    workspaceBinding: prepared.workspaceBinding,
    installedRoots: { bootstrap: prepared.install.bootstrapPackage, owner: prepared.install.installedRoot },
    installedContent: { bootstrap: bootstrapAfter, owner: installedAfter },
    constructorCallDigest: constructionCall.invocation.invocationDigest,
    runRoot: prepared.scratch,
    worksiteRoot: prepared.worksiteRoot,
    cleanup: prepared.ownScratch
      ? async () => rm(prepared.scratch, { recursive: true, force: true })
      : async () => {},
  });
}

export async function runGenericLiveWorkflowScenario({
  scenario,
  artifactPath,
  expectedArtifactDigest,
  runRoot,
  resumeSetupAttempt,
  environment = process.env,
}) {
  if (environment[GENERIC_LIVE_WORKFLOW_GATE] !== "1") {
    return genericLiveWorkflowSkip(environment);
  }
  if (!path.isAbsolute(assertNonEmptyString(artifactPath, "ABI C1+C2 artifact path"))) {
    throw new TypeError("ABI C1+C2 artifact path must be absolute");
  }
  const pinnedArtifactDigest = normalizedExpectedDigest(
    assertNonEmptyString(
      expectedArtifactDigest,
      "expected ABI C1+C2 artifact digest",
    ),
  );
  const workerArgs = validateClaudeConfiguration(environment);
  const priorEnvironment = {
    ABG_TS_CLAUDE_COMMAND: process.env.ABG_TS_CLAUDE_COMMAND,
    ABG_TS_CLAUDE_APPEND_ARGS: process.env.ABG_TS_CLAUDE_APPEND_ARGS,
    ABG_TS_FP_TIMEOUT_MS: process.env.ABG_TS_FP_TIMEOUT_MS,
    ABG_TS_FP_ABSOLUTE_TIMEOUT_MS:
      process.env.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS,
  };
  for (const key of [
    "ABG_TS_CLAUDE_COMMAND",
    "ABG_TS_CLAUDE_APPEND_ARGS",
    "ABG_TS_FP_TIMEOUT_MS",
    "ABG_TS_FP_ABSOLUTE_TIMEOUT_MS",
  ]) {
    if (environment[key] === undefined) delete process.env[key];
    else process.env[key] = environment[key];
  }
  let prepared;
  try {
    prepared = await prepareInstalledScenario({
      scenario,
      artifactPath,
      expectedArtifactDigest: pinnedArtifactDigest,
      runRoot,
      resumeSetupAttempt,
    });
    const constructionCall = await runDefinition(prepared, prepared.task, prepared.resolution, prepared.policy, prepared.setupHandoff);
    const constructionOutcome = await applyDeclaredRun(prepared, constructionCall, "c1-construction", prepared.product.isWorksiteConstructionResult);
    const { executionTask, executionSource, executionCall } = await prepareGenericWorkflowExecution(prepared, constructionOutcome);
    const executionOutcome = await applyDeclaredRun(prepared, executionCall, "c2-execution", prepared.product.isWorksiteCommandExecutionObservation);
    assert.deepEqual(executionCall.invocation.request.catalogView, constructionCall.invocation.request.catalogView);
    const freshResult = await runFreshPublicRead(prepared, executionOutcome, "run_result");
    const freshReplay = await runFreshPublicRead(prepared, executionOutcome, "run_replay");
    const resultProjection = freshResult.receipt.ownerOutput.value.projection;
    const replayProjection = freshReplay.receipt.ownerOutput.value.projection;
    assert.equal(resultProjection.kind, "run_result_projection");
    assert.equal(resultProjection.result.ref, executionOutcome.resultRef);
    assert.equal(prepared.product.canonicalJson(freshResult.sourceBasis.sourceResultValue), prepared.product.canonicalJson(executionOutcome.result));
    assert.equal(replayProjection.kind, "run_replay_projection");
    assert.equal(replayProjection.replay.ref, executionOutcome.replayRef);
    assert.equal(replayProjection.replay.digest, executionOutcome.replayDigest);
    const constructionResult = constructionOutcome.result;
    const files = [];
    for (const [ordinal, target] of prepared.constructionTargets.entries()) {
      const member = constructionResult.members[ordinal];
      if (
        member?.successorObservation.subjectRef !== target.subject.subjectRef ||
        member.receipt.beforeObservationRef !==
          target.predecessorObservation.observationRef ||
        member.receipt.afterObservationRef !==
          member.successorObservation.observationRef
      ) {
        throw new Error(`construction result crossed target ${ordinal}`);
      }
      files.push(Object.freeze({
        ordinal,
        relativePath: target.subject.relativePath,
        predecessorObservation: target.predecessorObservation,
        successorObservation: member.successorObservation,
        byteLength: member.successorObservation.byteLength,
        sha256: member.successorObservation.fileDigest,
      }));
    }
    const validation = evaluateGenericScenarioOutcome(
      scenario,
      executionOutcome.result,
    );
    const disposition = validation.disposition === "satisfied"
      ? "awaiting_review"
      : "validation_failed";
    const abiArtifact = Object.freeze({
      path: prepared.install.artifactPath,
      sha256: prepared.install.artifactDigest,
      productId: prepared.install.verified.productId,
      packageVersion: prepared.install.verified.packageVersion,
      productContentDigest: prepared.install.verified.productContentDigest,
      productManifestDigest: prepared.install.verified.manifestDigest,
    });
    const retainedEvidenceBody = Object.freeze({
      kind: "generic_live_workflow_evidence_candidate",
      schemaVersion: "1",
      authority: "diagnostic_only",
      disposition,
      scenarioKey: scenario.key,
      scenarioId: scenario.scenarioId,
      abiArtifact,
      workers: Object.freeze({
        constructionActorRef: WORKER_ACTOR_REF,
        executionActorRef:
          prepared.product.WORKSITE_COMMAND_EXECUTION_IDS.workerActorRef,
        actorRef: WORKER_ACTOR_REF,
        appendArgs: workerArgs,
        prompt: prepared.prompt,
        promptDigest: prepared.task.promptDigest ?? null,
      }),
      taskRef: prepared.task.taskRef,
      constructionTask: prepared.task,
      executionTaskRef: executionTask.taskRef,
      constructionOutcome: Object.freeze({
        resultRef: constructionOutcome.resultRef,
        runId: constructionOutcome.runId,
        replayRef: constructionOutcome.replayRef,
        replayDigest: constructionOutcome.replayDigest,
        definitionCall: constructionOutcome.call,
        receipt: constructionOutcome.receipt,
        resultRead: constructionOutcome.resultRead,
        sourceBasis: constructionOutcome.sourceBasis,
        ...(executionSource.executionSourceRead === undefined ? {} : {
          executionSource: { sourceBasis: executionSource.sourceBasis, resultRead: executionSource.executionSourceRead },
        }),
      }),
      executionOutcome: Object.freeze({
        resultRef: executionOutcome.resultRef,
        runId: executionOutcome.runId,
        replayRef: executionOutcome.replayRef,
        replayDigest: executionOutcome.replayDigest,
        definitionCall: executionOutcome.call,
        receipt: executionOutcome.receipt,
        resultRead: executionOutcome.resultRead,
      }),
      replay: Object.freeze({
        freshResultProcessId: freshResult.processId,
        freshReplayProcessId: freshReplay.processId,
        resultProjection,
        replayProjection,
        resultValue: freshResult.sourceBasis.sourceResultValue,
      }),
      constructionResult,
      executionObservation: executionOutcome.result,
      files: Object.freeze(files),
      validation,
    });
    const retainedEvidencePath = path.join(
      prepared.scratch,
      "generic-live-workflow-evidence-candidate.json",
    );
    const retainedEvidenceBytes = Buffer.from(
      `${JSON.stringify(retainedEvidenceBody, null, 2)}\n`,
      "utf8",
    );
    await writeFile(retainedEvidencePath, retainedEvidenceBytes, { flag: "wx" });
    return Object.freeze({
      kind: "generic_live_workflow_result",
      schemaVersion: "1",
      disposition,
      scenarioKey: scenario.key,
      scenarioId: scenario.scenarioId,
      abiArtifact,
      workers: retainedEvidenceBody.workers,
      worker: Object.freeze({
        actorRef: WORKER_ACTOR_REF,
        appendArgs: workerArgs,
        prompt: prepared.prompt,
        promptDigest: prepared.task.promptDigest ?? null,
      }),
      taskRef: prepared.task.taskRef,
      executionTaskRef: executionTask.taskRef,
      constructionOutcome: retainedEvidenceBody.constructionOutcome,
      executionOutcome: retainedEvidenceBody.executionOutcome,
      replay: retainedEvidenceBody.replay,
      constructionResult,
      executionObservation: executionOutcome.result,
      files: Object.freeze(files),
      validation,
      retainedEvidence: Object.freeze({
        kind: retainedEvidenceBody.kind,
        path: retainedEvidencePath,
        sha256: sha256Bytes(retainedEvidenceBytes),
      }),
      runRoot: prepared.scratch,
      worksiteRoot: prepared.worksiteRoot,
      cleanup: prepared.ownScratch
        ? async () => rm(prepared.scratch, { recursive: true, force: true })
        : async () => {},
    });
  } finally {
    for (const [key, value] of Object.entries(priorEnvironment)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

async function freshPublicReadMain(requestPath) {
  const request = JSON.parse(await readFile(requestPath, "utf8"));
  const memberKey = request.invocation?.invocation?.definitionKey?.memberKey;
  if (request.kind !== "generic_live_workflow_fresh_public_read_request" || request.schemaVersion !== "1" ||
    !path.isAbsolute(request.installedRoot) || !["run_result", "run_replay"].includes(memberKey)) {
    throw new TypeError("invalid fresh public read request");
  }
  const [installedPublic, abg] = await Promise.all(["public", "abg"].map(surface =>
    importInstalledSurface(request.installedRoot, `build/code/src/${surface}/index.js`, Date.now())));
  const receipt = await applyDefinitionCall(installedPublic, request.invocation, `fresh ${memberKey}`);
  const sourceBasis = memberKey === "run_result"
    ? sourceResultFromRead(abg, request.sourceRun.call, request.sourceRun.receipt, receipt)
    : null;
  process.stdout.write(JSON.stringify({ kind: "generic_live_workflow_fresh_public_read_result", schemaVersion: "1",
    processId: process.pid, variant: memberKey, closed: true, receipt, sourceBasis }));
}

if (
  process.argv[2] === "--fresh-public-read" &&
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await freshPublicReadMain(process.argv[3]);
}
