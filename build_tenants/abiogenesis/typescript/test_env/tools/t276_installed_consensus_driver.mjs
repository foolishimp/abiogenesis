// Source-blind installed Consensus qualification driver for T-276.

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  lstat,
  mkdir,
  readFile,
  realpath,
  stat,
  writeFile
} from "node:fs/promises";
import path from "node:path";

import Ajv from "ajv";
import Ajv2020 from "ajv/dist/2020.js";

const SCHEMA_SLOTS = Object.freeze([
  "request",
  "result",
  "refusal",
  "nonterminal"
]);
const DELIVERY_OPERATION_ORDER = Object.freeze([
  "abg.operation.workspace.create",
  "abg.operation.workspace.bind",
  "abg.operation.project.read",
  "abg.operation.catalog.view",
  "abg.operation.catalog.apply",
  "abg.operation.run.invoke",
  "abg.operation.result.assess"
]);
const SHA256_DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/u;
const CANONICAL_ORACLE_DIGEST =
  "sha256:811227e7419d8d3c348bc6f50ab171696a55133f9c7f8a076513307908363ec1";
const CANONICAL_REQUIREMENT_SOURCE_DIGEST =
  "sha256:eed6bfd474d8e572a82d25a7e227f5e1e447f0f78f75933a32fdaf3ed7c43764";

function sha256(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function canonicalizeIJson(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalizeIJson).join(",")}]`;
  }
  return `{${Object.keys(value).sort(compareText).map(
    (key) => `${JSON.stringify(key)}:${canonicalizeIJson(value[key])}`
  ).join(",")}}`;
}

function digestCanonicalIJson(value) {
  return sha256(Buffer.from(canonicalizeIJson(value), "utf8"));
}

function liveCapabilityCoordinate(input) {
  const steering = input.steering;
  if (
    steering?.agent !== "generic" ||
    steering.model !== null ||
    steering.profile !== "local-spawn" ||
    !Number.isSafeInteger(steering.timeoutMs) ||
    steering.timeoutMs <= 0
  ) {
    throw new TypeError(
      "the installed T-276 F_P proof requires one admitted generic local-spawn steering body"
    );
  }
  const agentContract = Object.freeze({
    agentKey: "generic",
    command: "fp-transport",
    argsTemplate: Object.freeze(["{prompt}"]),
    sanitizedEnvironmentPolicy: Object.freeze({
      prefixes: Object.freeze([])
    })
  });
  const executionContractDigest = digestCanonicalIJson({
    agentContract,
    cwd: input.workspaceRoot,
    archiveRoot: input.archiveRoot,
    executorProfile: steering.profile,
    timeoutMs: steering.timeoutMs,
    terminalSessionKeyPrefix: null,
    labelPrefix: null
  });
  const capabilityDigest = digestCanonicalIJson({
    kind: "abg_live_plugin_capability",
    workspaceRoot: input.workspaceRoot,
    executionContractDigest,
    agentKey: steering.agent,
    agentKeySource: "flag",
    executorProfile: steering.profile,
    executorProfileSource: "flag",
    timeoutMs: steering.timeoutMs,
    timeoutMsSource: "flag",
    availableLivePluginRefs: Object.freeze([
      "plugin://abg/fp-dispatch-live",
      "plugin://abg/fp-evaluator-live"
    ])
  });
  return Object.freeze({
    capabilityRef: `capability:live:${capabilityDigest}`,
    capabilityDigest,
    executionContractDigest
  });
}

function projectReadProjectionBasis(caseKey, source, selector) {
  const basis = Object.freeze({
    kind: "project_read_projection_basis",
    definitionKey: Object.freeze({
      operationId: "abg.operation.project.read",
      memberKind: "project_read_case",
      caseKey
    }),
    source,
    selector
  });
  const digest = digestCanonicalIJson(basis);
  return Object.freeze({
    ref: `project-read-basis:${digest}`,
    digest
  });
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function insideRoot(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === "" || (
    relative !== ".." &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative)
  );
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function gap(coordinate, reason, delta = null) {
  return Object.freeze({
    kind: "frontier_gap",
    phase: "p2_packed_operation_family",
    coordinate: Object.freeze(coordinate),
    reason,
    familyDelta: delta === null ? null : Object.freeze(delta),
    targetOperationInvocationCount: 0
  });
}

function admitQualificationOracle(value) {
  const target = value?.targetFamily;
  if (
    !isObject(value) ||
    value.kind !== "t276_public_operation_family_qualification_oracle" ||
    value.schemaVersion !== 1 ||
    value.ordering !== "REQ-P-PUBLIC-CONTRACTS-008-table-order" ||
    !isObject(value.basis) ||
    value.basis.targetRequirementRef !==
      "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md#REQ-P-PUBLIC-CONTRACTS-008" ||
    value.basis.targetRequirementSourceDigest !==
      CANONICAL_REQUIREMENT_SOURCE_DIGEST ||
    value.basis.steelThreadDesignDigest !==
      "1cca67612f32171edcaf597c0ec98f1208481d577f5496e097b5f6ff07e7d636" ||
    !isObject(target) ||
    target.operationRowCount !== 19 ||
    target.definitionMemberCount !== 62 ||
    target.schemaCoordinateCount !== 196 ||
    target.absentNonterminalCount !== 52 ||
    target.catalogProfile !== "abg-5-release" ||
    target.operationAssetKind !==
      "abg_public_operation_definition_family" ||
    target.operationAssetSchemaVersion !== 1 ||
    target.operationContractVersion !== "5.0.0" ||
    target.operationContractMetaSchemaId !==
      "abg.schema.public-operation-contract" ||
    target.operationContractMetaSchemaVersion !== "1.0.0" ||
    target.operationContractMetaSchemaPath !==
      "contracts/schemas/public-operation-contract.schema.json" ||
    !Array.isArray(value.targetOperationIds) ||
    value.targetOperationIds.length !== 19 ||
    value.targetOperationIds.some(
      (identity) =>
        typeof identity !== "string" ||
        !identity.startsWith("abg.operation.")
    ) ||
    new Set(value.targetOperationIds).size !== value.targetOperationIds.length
  ) {
    throw new TypeError("invalid T-276 operation-family qualification oracle");
  }
  return Object.freeze({
    ...value,
    basis: Object.freeze({ ...value.basis }),
    targetFamily: Object.freeze({ ...target }),
    targetOperationIds: Object.freeze([...value.targetOperationIds])
  });
}

function catalogDigestBasis(catalog) {
  const { catalogDigest, ...basis } = catalog;
  void catalogDigest;
  return basis;
}

async function installedAssetBytes(packageRoot, relativePath) {
  if (
    typeof relativePath !== "string" ||
    relativePath.length === 0 ||
    path.isAbsolute(relativePath)
  ) {
    return null;
  }
  try {
    const resolvedRoot = await realpath(packageRoot);
    const resolvedAsset = await realpath(path.join(packageRoot, relativePath));
    if (!insideRoot(resolvedRoot, resolvedAsset)) {
      return null;
    }
    return await readFile(resolvedAsset);
  } catch (error) {
    if (error?.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function verifyManifestCatalog(packageRoot, packageManifest, catalog) {
  const manifestBytes = await installedAssetBytes(
    packageRoot,
    "product-toolchain-manifest.json"
  );
  const catalogSchemaBytes = await installedAssetBytes(
    packageRoot,
    catalog.catalogSchemaPath
  );
  if (manifestBytes === null || catalogSchemaBytes === null) {
    return false;
  }
  const manifest = JSON.parse(manifestBytes);
  return (
    manifest.packageName === packageManifest.name &&
    manifest.packageVersion === packageManifest.version &&
    manifest.publicContractCatalogPath ===
      "contracts/public-contract-catalog.json" &&
    manifest.publicContractCatalogDigest === catalog.catalogDigest &&
    canonicalizeIJson(manifest.publicContractCatalog) ===
      canonicalizeIJson(catalog) &&
    digestCanonicalIJson(catalogDigestBasis(catalog)) ===
      catalog.catalogDigest &&
    sha256(catalogSchemaBytes) === catalog.catalogSchemaDigest &&
    Array.isArray(manifest.productRelativeLocators) &&
    manifest.productRelativeLocators.includes(
      "contracts/public-contract-catalog.json"
    )
  );
}

function firstDeliveryGap(operationIds) {
  const candidates = new Set(operationIds);
  return DELIVERY_OPERATION_ORDER.find((operationId) =>
    candidates.has(operationId)
  ) ?? operationIds[0];
}

function definitionMember(definition) {
  const key = definition?.definitionKey;
  if (!isObject(key)) {
    return null;
  }
  if (key.memberKind === "variant" && typeof key.variant === "string") {
    return key.variant;
  }
  if (
    key.memberKind === "project_read_case" &&
    typeof key.caseKey === "string"
  ) {
    return key.caseKey;
  }
  return null;
}

function operationSlug(operationId) {
  return typeof operationId === "string" && operationId.startsWith("abg.operation.")
    ? operationId.slice("abg.operation.".length)
    : null;
}

function nonEmptyText(input, label) {
  if (typeof input !== "string" || input.length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return input;
}

function digestText(input, label) {
  if (typeof input !== "string" || !SHA256_DIGEST_PATTERN.test(input)) {
    throw new TypeError(`${label} must be a sha256 digest`);
  }
  return input;
}

function contractIdentity(coordinate, label) {
  if (!isObject(coordinate)) {
    throw new TypeError(`${label} must be an installed schema coordinate`);
  }
  const identity = Object.freeze({
    contractId: nonEmptyText(coordinate.contractId, `${label}.contractId`),
    contractVersion: nonEmptyText(
      coordinate.contractVersion,
      `${label}.contractVersion`
    ),
    contractDigest: digestText(
      coordinate.contractDigest,
      `${label}.contractDigest`
    ),
    schemaId: nonEmptyText(coordinate.schemaId, `${label}.schemaId`),
    schemaVersion: nonEmptyText(
      coordinate.schemaVersion,
      `${label}.schemaVersion`
    ),
    schemaDigest: digestText(
      coordinate.schemaDigest,
      `${label}.schemaDigest`
    )
  });
  if (identity.contractDigest !== identity.schemaDigest) {
    throw new TypeError(`${label} contract and schema digests differ`);
  }
  return identity;
}

function installedPublicContractCoordinate(coordinate, label) {
  const identity = contractIdentity(coordinate, label);
  if (!isObject(coordinate.assetLocator)) {
    throw new TypeError(`${label}.assetLocator must be an installed schema asset`);
  }
  const asset = coordinate.assetLocator;
  const canonicalAsset = Object.freeze({
    kind: "canonical_asset",
    relativePath: nonEmptyText(
      asset.relativePath,
      `${label}.assetLocator.relativePath`
    ),
    mediaType: nonEmptyText(
      asset.mediaType,
      `${label}.assetLocator.mediaType`
    ),
    schemaId: nonEmptyText(
      asset.schemaId,
      `${label}.assetLocator.schemaId`
    ),
    schemaVersion: nonEmptyText(
      asset.schemaVersion,
      `${label}.assetLocator.schemaVersion`
    ),
    digest: digestText(asset.digest, `${label}.assetLocator.digest`)
  });
  if (
    canonicalAsset.schemaId !== identity.schemaId ||
    canonicalAsset.schemaVersion !== identity.schemaVersion ||
    canonicalAsset.digest !== identity.schemaDigest
  ) {
    throw new TypeError(`${label}.assetLocator differs from its contract identity`);
  }
  return Object.freeze({
    ...identity,
    nativeLocator: null,
    assetLocator: canonicalAsset
  });
}

function installedCatalogIdentity(catalog) {
  return Object.freeze({
    kind: "public_contract_catalog_coordinate",
    catalogId: nonEmptyText(catalog.catalogId, "catalog.catalogId"),
    catalogVersion: nonEmptyText(
      catalog.catalogVersion,
      "catalog.catalogVersion"
    ),
    catalogDigest: digestText(catalog.catalogDigest, "catalog.catalogDigest")
  });
}

function operationDefinition(catalog, operationId, member) {
  const rows = catalog.rows.filter((row) => row?.contractId === operationId);
  const definitions = rows[0]?.operationContract?.definitions ?? [];
  const matches = definitions.filter((definition) => {
    const key = definition?.definitionKey;
    if (key?.operationId !== operationId) return false;
    return key.memberKind === "variant"
      ? key.variant === member
      : key.memberKind === "project_read_case" && key.caseKey === member;
  });
  if (rows.length !== 1 || matches.length !== 1) {
    throw new TypeError(
      `installed operation definition is not singular: ${operationId}/${member}`
    );
  }
  return matches[0];
}

function admittedSlot(requirement, value, expectedState, label) {
  if (requirement === "forbidden") {
    if (value !== undefined && value !== null) {
      throw new TypeError(`${label} is forbidden by the installed definition`);
    }
    return Object.freeze({ state: "forbidden" });
  }
  if (!isObject(value) || value.state !== expectedState) {
    throw new TypeError(
      `${label} requires an explicit caller-owned ${expectedState} carrier`
    );
  }
  return Object.freeze({ ...value });
}

function catalogSlot(requirement, value) {
  if (!isObject(requirement) || requirement.kind !== "fixed") {
    throw new TypeError(
      "the source-blind installed thread requires one fixed catalog-scope law"
    );
  }
  return admittedSlot(
    requirement.requirement,
    value,
    "admitted_catalog_scope",
    "callerAuthority.catalogScope"
  );
}

function capabilityGrant(input, authorityBasis) {
  const basis = Object.freeze({
    capabilityId: nonEmptyText(input.capabilityId, "capabilityGrant.capabilityId"),
    capabilityDefinitionRef: nonEmptyText(
      input.capabilityDefinitionRef,
      "capabilityGrant.capabilityDefinitionRef"
    ),
    capabilityDefinitionDigest: digestText(
      input.capabilityDefinitionDigest,
      "capabilityGrant.capabilityDefinitionDigest"
    ),
    actorRef: authorityBasis.actorRef,
    approvalRef: nonEmptyText(input.approvalRef, "capabilityGrant.approvalRef"),
    policyRef: nonEmptyText(input.policyRef, "capabilityGrant.policyRef"),
    scopeRef: nonEmptyText(input.scopeRef, "capabilityGrant.scopeRef"),
    scopeDigest: digestText(input.scopeDigest, "capabilityGrant.scopeDigest"),
    authorityBasisRef: authorityBasis.ref,
    authorityBasisDigest: authorityBasis.digest
  });
  const grantDigest = digestCanonicalIJson(basis);
  return Object.freeze({
    kind: "capability_grant",
    grantRef: `capability-grant:${grantDigest}`,
    grantDigest,
    ...basis
  });
}

function exactCapabilityGrants(definition, callerAuthority) {
  const inputs = callerAuthority.capabilityGrants;
  if (!Array.isArray(inputs)) {
    throw new TypeError(
      "callerAuthority.capabilityGrants must be an explicit array"
    );
  }
  const required = [...definition.capabilityRefs].sort(compareText);
  const selectedInputs = inputs.filter((grant) =>
    required.includes(grant?.capabilityId)
  );
  const supplied = selectedInputs
    .map((grant) => grant?.capabilityId)
    .sort(compareText);
  if (canonicalizeIJson(required) !== canonicalizeIJson(supplied)) {
    throw new TypeError(
      "callerAuthority capability grants differ from the installed definition"
    );
  }
  const basis = {
    ref: nonEmptyText(
      callerAuthority.authorityBasisRef,
      "callerAuthority.authorityBasisRef"
    ),
    digest: digestText(
      callerAuthority.authorityBasisDigest,
      "callerAuthority.authorityBasisDigest"
    ),
    actorRef: nonEmptyText(
      callerAuthority.capabilityGrantActorRef ??
        callerAuthority.actor?.actorRef,
      "callerAuthority.capabilityGrantActorRef"
    )
  };
  const grants = selectedInputs
    .map((input) => capabilityGrant(input, basis))
    .sort((left, right) => compareText(left.grantRef, right.grantRef));
  if (new Set(grants.map((grant) => grant.grantRef)).size !== grants.length) {
    throw new TypeError("callerAuthority capability grants are not unique");
  }
  return Object.freeze(grants);
}

function constructSourceBlindInvocation(input) {
  const definition = input.definition;
  const caller = input.callerAuthority;
  const requirements = definition.authoritySlotRequirements;
  if (!isObject(caller) || !isObject(requirements)) {
    throw new TypeError(
      "installed definition and explicit caller authority are required"
    );
  }
  const definitionKey = definition.definitionKey;
  if (
    !isObject(definitionKey) ||
    typeof definitionKey.operationId !== "string" ||
    !(
      definitionKey.memberKind === "variant" &&
      typeof definitionKey.variant === "string"
    ) && !(
      definitionKey.memberKind === "project_read_case" &&
      typeof definitionKey.caseKey === "string"
    )
  ) {
    throw new TypeError(
      "the installed definition has no admitted public member identity"
    );
  }
  const definitionDigest = digestText(
    definition.definitionDigest,
    "installed definition.definitionDigest"
  );
  const contractCatalog = installedCatalogIdentity(input.catalog);
  const actor = admittedSlot(
    requirements.actor,
    caller.actor,
    "admitted_actor",
    "callerAuthority.actor"
  );
  const slots = Object.freeze({
    actor,
    workspace: admittedSlot(
      requirements.workspace,
      caller.workspace,
      "admitted_workspace",
      "callerAuthority.workspace"
    ),
    productSet: admittedSlot(
      requirements.productSet,
      caller.productSet,
      "admitted_product_set",
      "callerAuthority.productSet"
    ),
    dependencyLock: admittedSlot(
      requirements.dependencyLock,
      caller.dependencyLock,
      "admitted_dependency_lock",
      "callerAuthority.dependencyLock"
    ),
    catalogScope: catalogSlot(
      requirements.catalogScope,
      caller.catalogScope
    ),
    executionProgram: admittedSlot(
      requirements.executionProgram,
      caller.executionProgram,
      "admitted_execution_program",
      "callerAuthority.executionProgram"
    ),
    invocationPolicy: admittedSlot(
      requirements.invocationPolicy,
      caller.invocationPolicy,
      "admitted_invocation_policy",
      "callerAuthority.invocationPolicy"
    ),
    transportSteering: admittedSlot(
      requirements.transportSteering,
      caller.transportSteering,
      "declared_transport_steering",
      "callerAuthority.transportSteering"
    )
  });
  const authorityBasisRef = nonEmptyText(
    caller.authorityBasisRef,
    "callerAuthority.authorityBasisRef"
  );
  const authorityBasisDigest = digestText(
    caller.authorityBasisDigest,
    "callerAuthority.authorityBasisDigest"
  );
  const capabilityGrants = exactCapabilityGrants(definition, caller);
  const authorityBasis = Object.freeze({
    authorityBasisRef,
    authorityBasisDigest,
    definitionDigest,
    contractCatalog,
    capabilityGrants,
    ...slots,
    definitionKey
  });
  const authoritySetDigest = digestCanonicalIJson(authorityBasis);
  const authority = Object.freeze({
    kind: "invocation_authority",
    authoritySetRef: `invocation-authority:${authoritySetDigest}`,
    authoritySetDigest,
    ...authorityBasis
  });
  const requestDigest = digestCanonicalIJson(input.request);
  const invocationBasis = Object.freeze({
    kind: "public_invocation",
    invocationRef:
      `public-invocation:${definitionDigest}:${requestDigest}`,
    definitionKey,
    definitionDigest,
    contractCatalog,
    authority,
    requestContract: contractIdentity(
      definition.schemaCoordinates.request,
      "installed request contract"
    ),
    requestRef: `public-operation-request:${requestDigest}`,
    requestDigest,
    request: Object.freeze({ ...input.request }),
    expectedResultContract: contractIdentity(
      definition.schemaCoordinates.result,
      "installed result contract"
    ),
    expectedRefusalContract: contractIdentity(
      definition.schemaCoordinates.refusal,
      "installed refusal contract"
    ),
    expectedNonTerminalContract:
      definition.schemaCoordinates.nonterminal === null
        ? null
        : contractIdentity(
            definition.schemaCoordinates.nonterminal,
            "installed nonterminal contract"
          ),
    correlationRef: nonEmptyText(
      caller.correlationRef,
      "callerAuthority.correlationRef"
    ),
    provenanceRefs: Object.freeze(
      [...(caller.provenanceRefs ?? [])].map((ref, index) =>
        nonEmptyText(ref, `callerAuthority.provenanceRefs[${index}]`)
      ).sort(compareText)
    )
  });
  return Object.freeze({
    ...invocationBasis,
    invocationDigest: digestCanonicalIJson(invocationBasis)
  });
}

async function validateInstalledRequest(
  packageRoot,
  definition,
  request
) {
  const coordinate = definition.schemaCoordinates.request;
  const bytes = await installedAssetBytes(
    packageRoot,
    coordinate.assetLocator?.relativePath
  );
  if (bytes === null || sha256(bytes) !== coordinate.schemaDigest) {
    throw new TypeError("installed request schema digest differs");
  }
  const schema = JSON.parse(bytes);
  const validate = new Ajv2020({ strict: false }).compile(schema);
  if (!validate(request)) {
    throw new TypeError(
      `public request differs from installed schema: ${JSON.stringify(validate.errors)}`
    );
  }
}

function cliArguments(definition, member) {
  return definition.cliCoordinate.split(/\s+/u).map((token) =>
    /^<[^>]+>$/u.test(token) ? member : token
  );
}

function spawnInstalledCli(input) {
  const adapterArgs = [
    "--invocation",
    input.invocationPath,
    "--contract-catalog",
    path.join(
      input.config.packageRoot,
      "contracts",
      "public-contract-catalog.json"
    )
  ];
  if (input.workspaceRoot !== null) {
    adapterArgs.push("--workspace-root", input.workspaceRoot);
  }
  if (input.ownerRequestPath !== null) {
    adapterArgs.push("--owner-request", input.ownerRequestPath);
  }
  if (
    input.liveSteeringFilePath !== null &&
    input.liveSteeringFilePath !== undefined
  ) {
    adapterArgs.push("--live-steering-file", input.liveSteeringFilePath);
  }
  return spawnSync(
    process.execPath,
    [
      input.config.cliPath,
      ...cliArguments(input.definition, input.member),
      ...adapterArgs
    ],
    {
      cwd: path.resolve(input.config.driverStateRoot),
      env: process.env,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024
    }
  );
}

function operationCallerAuthority(base, input = {}) {
  return Object.freeze({
    authorityBasisRef: base.authorityBasisRef,
    authorityBasisDigest: base.authorityBasisDigest,
    capabilityGrantActorRef:
      nonEmptyText(
        base.capabilityGrantActorRef ?? base.actor?.actorRef,
        "callerAuthority.capabilityGrantActorRef"
      ),
    capabilityGrants:
      input.capabilityGrants === undefined
        ? base.capabilityGrants
        : input.capabilityGrants,
    correlationRef: nonEmptyText(
      input.correlationRef,
      "operation caller correlationRef"
    ),
    provenanceRefs: base.provenanceRefs,
    ...(input.actor === undefined ? {} : { actor: input.actor }),
    ...(input.workspace === undefined ? {} : { workspace: input.workspace }),
    ...(input.productSet === undefined ? {} : { productSet: input.productSet }),
    ...(input.dependencyLock === undefined
      ? {}
      : { dependencyLock: input.dependencyLock }),
    ...(input.catalogScope === undefined
      ? {}
      : { catalogScope: input.catalogScope }),
    ...(input.executionProgram === undefined
      ? {}
      : { executionProgram: input.executionProgram }),
    ...(input.invocationPolicy === undefined
      ? {}
      : { invocationPolicy: input.invocationPolicy }),
    ...(input.transportSteering === undefined
      ? {}
      : { transportSteering: input.transportSteering })
  });
}

async function invokeInstalledOperation(input) {
  const definition = operationDefinition(
    input.catalog,
    input.operationId,
    input.member
  );
  await validateInstalledRequest(
    input.config.packageRoot,
    definition,
    input.request
  );
  const invocation = constructSourceBlindInvocation({
    catalog: input.catalog,
    definition,
    callerAuthority: input.callerAuthority,
    request: input.request
  });
  const invocationPath = path.join(
    input.driverStateRoot,
    `${input.fileStem}.json`
  );
  await writeFile(invocationPath, canonicalizeIJson(invocation), "utf8");
  let ownerRequestPath = null;
  if (input.ownerRequest !== null) {
    ownerRequestPath = path.join(
      input.driverStateRoot,
      `${input.fileStem}-owner-request.json`
    );
    await writeFile(
      ownerRequestPath,
      canonicalizeIJson(input.ownerRequest),
      "utf8"
    );
  }
  const execution = spawnInstalledCli({
    config: input.config,
    definition,
    member: input.member,
    invocationPath,
    ownerRequestPath,
    liveSteeringFilePath: input.liveSteeringFilePath ?? null,
    workspaceRoot: input.workspaceRoot
  });
  if (execution.error !== undefined) throw execution.error;
  const accepted =
    execution.status === definition.adapterExitMap.acceptedTerminal &&
    execution.stderr === "";
  return Object.freeze({
    accepted,
    definition,
    invocation,
    invocationPath,
    ownerRequestPath,
    execution,
    outcome: accepted
      ? parseOneJson(execution.stdout, `${input.operationId} public outcome`)
      : null
  });
}

function defaultMutableStateRoots(workspaceRoot) {
  const observerStateRoot = path.join(workspaceRoot, ".ai-workspace");
  const eventRoot = path.join(observerStateRoot, "events");
  return Object.freeze({
    observedWorkspaceRoot: workspaceRoot,
    observerStateRoot,
    executorStateRoot: observerStateRoot,
    eventRoot,
    eventLogPath: path.join(eventRoot, "events.jsonl"),
    runtimeRoot: path.join(observerStateRoot, "runtime"),
    projectionRoot: path.join(observerStateRoot, "projections"),
    archiveRoot: path.join(observerStateRoot, "archives")
  });
}

function bindingDeclaredRoots(roots) {
  return Object.freeze([...new Set([
    roots.observedWorkspaceRoot,
    roots.observerStateRoot,
    roots.executorStateRoot,
    roots.eventRoot,
    roots.runtimeRoot,
    roots.projectionRoot,
    roots.archiveRoot
  ])]);
}

async function readEventLog(eventLogPath) {
  const text = await readFile(eventLogPath, "utf8");
  return Object.freeze(
    text.trim().split(/\r?\n/u).filter(Boolean).map((line) =>
      Object.freeze(JSON.parse(line))
    )
  );
}

function acceptedOperationResult(execution, operationId) {
  if (
    !execution.accepted ||
    execution.outcome?.outcomeKind !== "result" ||
    execution.outcome.invocationRef !== execution.invocation.invocationRef ||
    execution.outcome.invocationDigest !== execution.invocation.invocationDigest ||
    execution.outcome.definitionDigest !== execution.definition.definitionDigest
  ) {
    return null;
  }
  if (!isObject(execution.outcome.value)) {
    throw new TypeError(`${operationId} accepted without one public result carrier`);
  }
  return execution.outcome.value;
}

function exactArtifactBoundaryPair(input) {
  const added = input.events.slice(input.priorCount);
  const [admission, artifact] = added;
  if (
    added.length !== 2 ||
    admission?.kind !== "public_operation_admitted" ||
    admission.definitionKey?.operationId !== input.operationId ||
    artifact?.kind !== "public_operation_artifact_admitted" ||
    artifact.operationId !== input.operationId ||
    artifact.invocationRef !== admission.invocationRef ||
    artifact.invocationDigest !== admission.invocationDigest ||
    !artifact.causationEventRefs?.includes(admission.eventId) ||
    canonicalizeIJson(input.outcome.evidenceRefs) !==
      canonicalizeIJson([artifact.eventId])
  ) {
    throw new TypeError(
      `${input.operationId} did not emit one exact causal Rule-B pair`
    );
  }
  return Object.freeze({ admission, artifact });
}

function exactCatalogAdmission(input) {
  const added = input.events.slice(input.priorCount);
  const [admission, ...registryEvents] = added;
  const expectedRows = input.contribution.rows;
  const dispositions = input.result.dispositions;
  const exactRelations = expectedRows.map((row) => {
    const matchingEvents = registryEvents.filter(
      (event) =>
        event.entryRef === row.canonicalHandle &&
        event.declarationRef === row.declarationRef
    );
    const matchingDispositions = dispositions.filter(
      (disposition) =>
        disposition.entryRef === row.canonicalHandle &&
        disposition.declarationRef === row.declarationRef
    );
    return Object.freeze({ row, matchingEvents, matchingDispositions });
  });
  if (
    admission?.kind !== "public_operation_admitted" ||
    admission.definitionKey?.operationId !== "abg.operation.catalog.admit" ||
    registryEvents.length !== expectedRows.length ||
    dispositions.length !== expectedRows.length ||
    exactRelations.some(({ row, matchingEvents, matchingDispositions }) => {
      const expectedEventKind = row.publicKind === "overlay"
        ? "catalog_asset_admitted"
        : "registry_entry_admitted";
      const event = matchingEvents[0];
      const disposition = matchingDispositions[0];
      return (
        matchingEvents.length !== 1 ||
        matchingDispositions.length !== 1 ||
        event?.kind !== expectedEventKind ||
        canonicalizeIJson(event?.causationEventRefs) !==
          canonicalizeIJson([admission.eventId]) ||
        disposition?.kind !== "catalog_row_disposition" ||
        disposition?.entryKind !== row.publicKind ||
        disposition?.disposition !== "admitted"
      );
    }) ||
    canonicalizeIJson(input.outcome.evidenceRefs) !==
      canonicalizeIJson(registryEvents.map((event) => event.eventId)) ||
    canonicalizeIJson(input.result.evidenceRefs) !==
      canonicalizeIJson(registryEvents.map((event) => event.eventId))
  ) {
    throw new TypeError(
      "catalog.admit did not admit the exact bound-product contribution: " +
        canonicalizeIJson({
          expectedRows: expectedRows.map((row) => ({
            entryRef: row.canonicalHandle,
            declarationRef: row.declarationRef,
            entryKind: row.publicKind
          })),
          registryEvents: registryEvents.map((event) => ({
            kind: event.kind,
            entryRef: event.entryRef,
            declarationRef: event.declarationRef,
            causationEventRefs: event.causationEventRefs
          })),
          dispositions,
          outcomeEvidenceRefs: input.outcome.evidenceRefs,
          resultEvidenceRefs: input.result.evidenceRefs
        })
    );
  }
  return Object.freeze({ admission, registryEvents: Object.freeze(registryEvents) });
}

function exactPersistedRunTransition(input) {
  const prior = input.events.slice(0, input.priorEvents.length);
  const added = input.events.slice(input.priorEvents.length);
  if (
    canonicalizeIJson(prior) !== canonicalizeIJson(input.priorEvents) ||
    added.length === 0 ||
    new Set(input.events.map((event) => event.eventId)).size !==
      input.events.length ||
    input.events.some(
      (event, index) => event.eventAdmissionOrdinal !== index
    )
  ) {
    throw new TypeError(
      "run.invoke did not append one ordinal-stable persisted event delta"
    );
  }

  const admissions = added.filter(
    (event) =>
      event.kind === "public_operation_admitted" &&
      event.definitionKey?.operationId === "abg.operation.run.invoke" &&
      event.definitionKey?.memberKind === "variant" &&
      event.definitionKey?.variant === "invoke" &&
      event.invocationRef === input.invocation.invocationRef &&
      event.invocationDigest === input.invocation.invocationDigest
  );
  const admission = admissions[0];
  if (
    admissions.length !== 1 ||
    admission === undefined ||
    input.result.runRef !== admission.invocationRef ||
    input.result.runDigest !== admission.invocationDigest ||
    added.some(
      (event) =>
        event.kind === "public_operation_artifact_admitted" &&
        (event.operationId === "abg.operation.run.invoke" ||
          event.invocationRef === admission.invocationRef)
    )
  ) {
    throw new TypeError(
      "run.invoke did not use exactly one runtime-event admission route"
    );
  }

  const rootRows = added.filter(
    (event) =>
      event.kind === "construction_episode_started" &&
      event.causationEventRefs?.includes(admission.eventId)
  );
  const root = rootRows[0];
  const bridgeRows = added.filter(
    (event) =>
      event.kind === "construction_graph_action_invoked" &&
      event.graphCallId === input.result.graphCallRef
  );
  const graphCallRows = added.filter(
    (event) =>
      event.kind === "graph_call_opened" &&
      event.graphCallId === input.result.graphCallRef &&
      event.runId === input.result.runRef
  );
  const graphCall = graphCallRows[0];
  const bridge = bridgeRows[0];
  if (
    rootRows.length !== 1 ||
    root === undefined ||
    bridgeRows.length !== 1 ||
    graphCallRows.length !== 1 ||
    bridge === undefined ||
    graphCall === undefined
  ) {
    throw new TypeError(
      "run.invoke did not bridge construction into one target GraphCall"
    );
  }
  const basisRows = added.filter(
    (event) =>
      event.kind === "basis_admitted" &&
      event.basisId === graphCall.basisId &&
      event.runId === input.result.runRef
  );
  const frameRows = added.filter(
    (event) =>
      event.kind === "frame_opened" &&
      event.basisId === graphCall.basisId &&
      event.graphCallId === graphCall.graphCallId &&
      event.frameId === bridge.frameId
  );
  const frame = frameRows[0];
  const observedRows = added.filter(
    (event) =>
      event.kind === "payload_observed" &&
      event.graphCallId === graphCall.graphCallId &&
      event.frameId === bridge.frameId &&
      event.payloadRef === input.result.resultRef &&
      event.digest === input.result.resultDigest
  );
  const observed = observedRows[0];
  if (
    basisRows.length !== 1 ||
    frameRows.length !== 1 ||
    frame === undefined ||
    observedRows.length !== 1 ||
    observed === undefined
  ) {
    throw new TypeError(
      "run.invoke result differs from its persisted basis/frame/payload chain"
    );
  }
  const plannedRows = added.filter(
    (event) =>
      event.kind === "vector_traversal_planned" &&
      event.basisId === observed.basisId &&
      event.graphCallId === observed.graphCallId &&
      event.frameId === observed.frameId &&
      event.vectorIndex === observed.vectorIndex
  );
  const planned = plannedRows[0];
  const validatedRows = added.filter(
    (event) =>
      event.kind === "payload_validated" &&
      event.basisId === observed.basisId &&
      event.graphCallId === observed.graphCallId &&
      event.frameId === observed.frameId &&
      event.vectorIndex === observed.vectorIndex &&
      event.edge === observed.edge &&
      event.payloadRef === observed.payloadRef &&
      event.digest === observed.digest
  );
  const validated = validatedRows[0];
  const evidenceRows = added.filter(
    (event) =>
      event.kind === "evidence_admitted" &&
      event.basisId === observed.basisId &&
      event.graphCallId === observed.graphCallId &&
      event.frameId === observed.frameId &&
      event.vectorIndex === observed.vectorIndex &&
      event.edge === observed.edge &&
      event.payloadRef === observed.payloadRef &&
      event.complete &&
      !event.shallow &&
      !event.contradictsAuthority &&
      !event.deferred
  );
  const evaluatedRows = added.filter(
    (event) =>
      event.kind === "vector_evaluated" &&
      event.basisId === observed.basisId &&
      event.graphCallId === observed.graphCallId &&
      event.frameId === observed.frameId &&
      event.vectorIndex === observed.vectorIndex &&
      event.edge === planned?.edge &&
      event.status === "accepted"
  );
  const closedRows = added.filter(
    (event) =>
      event.kind === "vector_closed" &&
      event.basisId === observed.basisId &&
      event.graphCallId === observed.graphCallId &&
      event.frameId === observed.frameId &&
      event.vectorIndex === observed.vectorIndex &&
      event.edge === planned?.edge
  );
  if (
    plannedRows.length !== 1 ||
    validatedRows.length !== 1 ||
    evidenceRows.length === 0 ||
    evaluatedRows.length !== 1 ||
    closedRows.length !== 1
  ) {
    throw new TypeError(
      `run.invoke runtime transition is incomplete: ${JSON.stringify({
        planned: plannedRows.length,
        validated: validatedRows.length,
        evidence: evidenceRows.length,
        evaluated: evaluatedRows.length,
        closed: closedRows.length
      })}`
    );
  }
  return Object.freeze({
    admission,
    root,
    bridge,
    graphCall,
    frame,
    planned,
    observed,
    validated,
    evidence: Object.freeze(evidenceRows),
    evaluated: evaluatedRows[0],
    closed: closedRows[0],
    events: Object.freeze(added)
  });
}

async function installedExecutableGraphFunction(input) {
  const durableContribution = JSON.parse(await readFile(
    input.installedRecord.contributionRecordPath,
    "utf8"
  ));
  if (
    durableContribution.contributionId !== input.installedRecord.contributionId ||
    durableContribution.contributionDigest !==
      input.installedRecord.contributionDigest ||
    canonicalizeIJson(durableContribution) !==
      canonicalizeIJson(input.verifiedContribution)
  ) {
    throw new TypeError(
      "installed contribution differs from the verified bound-product authority"
    );
  }

  const executable = [];
  for (const row of durableContribution.rows) {
    if (
      row.publicKind !== "graph_function" ||
      row.canonicalHandle !== input.canonicalHandle
    ) continue;
    const locator = row.locator;
    if (
      !isObject(locator) ||
      locator.kind !== "module_declaration" ||
      typeof locator.modulePath !== "string" ||
      !SHA256_DIGEST_PATTERN.test(locator.moduleDigest ?? "")
    ) {
      throw new TypeError(
        `bound GraphFunction ${row.canonicalHandle} has no installed module locator`
      );
    }
    const moduleBytes = await installedAssetBytes(
      input.installedRecord.packageRoot,
      locator.modulePath
    );
    if (moduleBytes === null || sha256(moduleBytes) !== locator.moduleDigest) {
      throw new TypeError(
        `bound GraphFunction ${row.canonicalHandle} differs from its module digest`
      );
    }
    const module = JSON.parse(moduleBytes);
    const matches = (module.graphFunctions ?? []).filter(
      (graphFunction) => graphFunction?.name === row.declarationRef
    );
    if (matches.length !== 1) {
      throw new TypeError(
        `bound GraphFunction ${row.canonicalHandle} is not singular in its module`
      );
    }
    const graphFunction = matches[0];
    const vectorCount = graphFunction.template?.kind === "inline_graph" &&
      Array.isArray(graphFunction.template.graph?.vectors)
      ? graphFunction.template.graph.vectors.length
      : 0;
    if (vectorCount > 0) {
      executable.push(Object.freeze({
        row: Object.freeze({ ...row }),
        moduleDigest: locator.moduleDigest,
        modulePath: locator.modulePath,
        inputSchemaRef:
          graphFunction.template.graph.inputs[0]?.schema?.ref ?? null,
        vectorCount
      }));
    }
  }
  if (executable.length !== 1) {
    throw new TypeError(
      `expected one executable bound-product GraphFunction for ${input.canonicalHandle}, found ${executable.length}`
    );
  }
  return Object.freeze({
    ...executable[0],
    contribution: Object.freeze(durableContribution)
  });
}

async function installedProductContractCoordinate(input) {
  const catalogBytes = await installedAssetBytes(
    input.installedRecord.packageRoot,
    "contracts/public-contract-catalog.json"
  );
  if (catalogBytes === null) {
    throw new TypeError("installed product has no public contract catalog");
  }
  const catalog = JSON.parse(catalogBytes);
  const rows = (catalog.rows ?? []).filter(
    (row) => row?.contractId === input.contractId
  );
  const row = rows[0];
  if (
    rows.length !== 1 ||
    row?.contractKind !== "schema_asset" ||
    row.nativeLocator !== null ||
    !isObject(row.assetLocator) ||
    row.digest !== row.assetLocator.digest
  ) {
    throw new TypeError(
      `installed contract ${input.contractId} is not one canonical schema asset`
    );
  }
  const schemaBytes = await installedAssetBytes(
    input.installedRecord.packageRoot,
    row.assetLocator.relativePath
  );
  if (schemaBytes === null || sha256(schemaBytes) !== row.digest) {
    throw new TypeError(
      `installed contract ${input.contractId} differs from its published digest`
    );
  }
  return installedPublicContractCoordinate({
    contractId: row.contractId,
    contractVersion: row.version,
    contractDigest: row.digest,
    schemaId: row.assetLocator.schemaId,
    schemaVersion: row.assetLocator.schemaVersion,
    schemaDigest: row.assetLocator.digest,
    assetLocator: row.assetLocator
  }, `installed product contract ${input.contractId}`);
}

function operationFailureGap(input) {
  return Object.freeze({
    kind: "frontier_gap",
    phase: "installed_consensus_driver",
    coordinate: Object.freeze({
      kind: "delivery_step",
      operationId: input.operationId
    }),
    reason: `installed_${input.operationId.slice("abg.operation.".length).replaceAll(".", "_")}_did_not_accept`,
    familyDelta: input.family.familyDelta,
    familyProof: input.family.familyProof,
    targetOperationInvocationCount: input.invocationCount,
    cliFailure: Object.freeze({
      exitCode: input.execution.execution.status,
      signal: input.execution.execution.signal,
      stdout: input.execution.execution.stdout,
      stderr: input.execution.execution.stderr
    }),
    ...input.evidence
  });
}

function parseOneJson(text, label) {
  const lines = text.trim().split(/\r?\n/u).filter(Boolean);
  if (lines.length !== 1) {
    throw new TypeError(`${label} must contain one JSON value`);
  }
  return JSON.parse(lines[0]);
}

function frozenFamilyDelta(input) {
  return Object.freeze({
    missingTargetOperationIds: Object.freeze([...input.missingTargetOperationIds]),
    duplicateTargetOperationIds: Object.freeze([...input.duplicateTargetOperationIds]),
    incompleteTargetOperationIds: Object.freeze([...input.incompleteTargetOperationIds]),
    retiredOperationIds: Object.freeze([...input.retiredOperationIds])
  });
}

function frozenFamilyProof(input) {
  return Object.freeze({
    operationRowCount: input.operationRowCount,
    definitionMemberCount: input.definitionMemberCount,
    schemaCoordinateCount: input.schemaCoordinateCount,
    schemaAssetCount: input.schemaAssetCount,
    absentNonterminalCount: input.absentNonterminalCount,
    familyDigests: Object.freeze([...input.familyDigests]),
    recomputedFamilyDigest: input.recomputedFamilyDigest,
    operationContractMetaSchemaDigest:
      input.operationContractMetaSchemaDigest,
    operationContractMetaSchemaValidatedAssetCount:
      input.operationContractMetaSchemaValidatedAssetCount,
    legacyOperationIds: Object.freeze([...input.legacyOperationIds])
  });
}

function gapWithProof(coordinate, reason, familyDelta, familyProof) {
  return Object.freeze({
    ...gap(coordinate, reason, familyDelta),
    familyProof
  });
}

async function operationMetaSchema(packageRoot, catalog, manifestLocators, oracle) {
  const target = oracle.targetFamily;
  const rows = catalog.rows.filter(
    (row) => row?.contractId === target.operationContractMetaSchemaId
  );
  const row = rows.length === 1 ? rows[0] : null;
  if (
    row?.contractKind !== "schema_asset" ||
    !isObject(row.assetLocator) ||
    row.assetLocator.relativePath !== target.operationContractMetaSchemaPath ||
    row.assetLocator.schemaId !== target.operationContractMetaSchemaId ||
    row.assetLocator.digest !== row.digest ||
    !manifestLocators.has(target.operationContractMetaSchemaPath)
  ) {
    return null;
  }
  const bytes = await installedAssetBytes(
    packageRoot,
    target.operationContractMetaSchemaPath
  );
  if (bytes === null || sha256(bytes) !== row.digest) {
    return null;
  }
  try {
    const schema = JSON.parse(bytes);
    if (
      schema?.$id !== target.operationContractMetaSchemaId ||
      schema?.$schema !== "http://json-schema.org/draft-07/schema#"
    ) {
      return null;
    }
    return Object.freeze({
      digest: row.digest,
      validate: new Ajv({ strict: false }).compile(schema)
    });
  } catch {
    return null;
  }
}

async function preflightPackedOperationFamily(
  packageRoot,
  catalog,
  manifest,
  oracle
) {
  if (!isObject(catalog) || !Array.isArray(catalog.rows)) {
    return gap(
      { kind: "packed_asset", asset: "public_contract_catalog" },
      "malformed_public_contract_catalog"
    );
  }
  const rows = catalog.rows.filter((row) => row?.contractKind === "operation");
  const byIdentity = new Map();
  for (const row of rows) {
    if (typeof row?.contractId !== "string") {
      continue;
    }
    const matches = byIdentity.get(row.contractId) ?? [];
    matches.push(row);
    byIdentity.set(row.contractId, matches);
  }

  const targetIds = new Set(oracle.targetOperationIds);
  const missingTargetOperationIds = oracle.targetOperationIds.filter(
    (operationId) => !byIdentity.has(operationId)
  );
  const duplicateTargetOperationIds = oracle.targetOperationIds.filter(
    (operationId) => (byIdentity.get(operationId)?.length ?? 0) > 1
  );
  const retiredOperationIds = [...byIdentity.keys()]
    .filter((operationId) => !targetIds.has(operationId))
    .sort(compareText);
  const incomplete = new Set();
  const familyProjection = {};
  const familyDigests = new Set();
  const schemaIdentities = new Set();
  const schemaPaths = new Set();
  let definitionMemberCount = 0;
  let schemaCoordinateCount = 0;
  let absentNonterminalCount = 0;

  for (const operationId of oracle.targetOperationIds) {
    const row = byIdentity.get(operationId)?.[0];
    const metadata = row?.operationContract;
    const slug = operationSlug(operationId);
    if (
      row === undefined ||
      !isObject(metadata) ||
      metadata.kind !== oracle.targetFamily.operationAssetKind ||
      metadata.operationId !== operationId ||
      metadata.operationVersion !== oracle.targetFamily.operationContractVersion ||
      row.version !== oracle.targetFamily.operationContractVersion ||
      !SHA256_DIGEST_PATTERN.test(row.digest) ||
      metadata.operationDigest !== row.digest ||
      !SHA256_DIGEST_PATTERN.test(metadata.familyDigest) ||
      !Array.isArray(metadata.definitions) ||
      !isObject(row.assetLocator) ||
      row.assetLocator.relativePath !== `contracts/operations/${slug}.json` ||
      row.assetLocator.schemaId !==
        oracle.targetFamily.operationContractMetaSchemaId ||
      row.assetLocator.schemaVersion !==
        oracle.targetFamily.operationContractMetaSchemaVersion ||
      row.assetLocator.mediaType !== "application/json" ||
      row.assetLocator.digest !== row.digest
    ) {
      if (row !== undefined) incomplete.add(operationId);
      continue;
    }
    familyDigests.add(metadata.familyDigest);
    const members = {};
    familyProjection[operationId] = members;
    for (const definition of metadata.definitions) {
      definitionMemberCount += 1;
      const member = definitionMember(definition);
      if (
        member === null ||
        definition?.definitionKey?.operationId !== operationId ||
        !SHA256_DIGEST_PATTERN.test(definition?.definitionDigest ?? "") ||
        Object.hasOwn(members, member) ||
        !isObject(definition?.schemaCoordinates)
      ) {
        incomplete.add(operationId);
        continue;
      }
      members[member] = definition.definitionDigest;
      for (const slot of SCHEMA_SLOTS) {
        const coordinate = definition.schemaCoordinates[slot];
        if (coordinate === null && slot === "nonterminal") {
          absentNonterminalCount += 1;
          continue;
        }
        schemaCoordinateCount += 1;
        if (!isObject(coordinate)) {
          incomplete.add(operationId);
          continue;
        }
        const locator = coordinate.assetLocator;
        const identity = `${coordinate.schemaId}@${coordinate.schemaVersion}`;
        const expectedPath =
          `contracts/schemas/operations/${slug}/${member}/${slot}.schema.json`;
        if (
          coordinate.contractVersion !==
            oracle.targetFamily.operationContractVersion ||
          coordinate.schemaVersion !==
            oracle.targetFamily.operationContractVersion ||
          !SHA256_DIGEST_PATTERN.test(coordinate.schemaDigest ?? "") ||
          coordinate.contractDigest !== coordinate.schemaDigest ||
          typeof coordinate.schemaId !== "string" ||
          schemaIdentities.has(identity) ||
          !isObject(locator) ||
          locator.kind !== "asset" ||
          locator.relativePath !== expectedPath ||
          locator.schemaId !== coordinate.schemaId ||
          locator.schemaVersion !==
            oracle.targetFamily.operationContractVersion ||
          locator.mediaType !== "application/schema+json" ||
          locator.digest !== coordinate.schemaDigest ||
          schemaPaths.has(expectedPath)
        ) {
          incomplete.add(operationId);
          continue;
        }
        schemaIdentities.add(identity);
        schemaPaths.add(expectedPath);
      }
    }
  }

  const recomputedFamilyDigest = digestCanonicalIJson(familyProjection);
  const baseProof = {
    operationRowCount: rows.length,
    definitionMemberCount,
    schemaCoordinateCount,
    schemaAssetCount: 0,
    absentNonterminalCount,
    familyDigests: [...familyDigests].sort(compareText),
    recomputedFamilyDigest,
    operationContractMetaSchemaDigest: null,
    operationContractMetaSchemaValidatedAssetCount: 0,
    legacyOperationIds: retiredOperationIds
  };
  const currentDelta = () => frozenFamilyDelta({
    missingTargetOperationIds,
    duplicateTargetOperationIds,
    incompleteTargetOperationIds: oracle.targetOperationIds.filter(
      (operationId) => incomplete.has(operationId)
    ),
    retiredOperationIds
  });

  if (missingTargetOperationIds.length > 0) {
    return gapWithProof(
      {
        kind: "operation_identity",
        operationId: firstDeliveryGap(missingTargetOperationIds)
      },
      "operation_family_mismatch",
      currentDelta(),
      frozenFamilyProof(baseProof)
    );
  }
  if (duplicateTargetOperationIds.length > 0) {
    return gapWithProof(
      {
        kind: "operation_identity",
        operationId: firstDeliveryGap(duplicateTargetOperationIds)
      },
      "operation_family_mismatch",
      currentDelta(),
      frozenFamilyProof(baseProof)
    );
  }
  if (
    retiredOperationIds.length > 0 ||
    rows.length !== oracle.targetFamily.operationRowCount ||
    catalog.profile !== oracle.targetFamily.catalogProfile
  ) {
    return gapWithProof(
      {
        kind: "retired_operation_identity",
        operationId: retiredOperationIds[0] ?? null
      },
      "operation_family_mismatch",
      currentDelta(),
      frozenFamilyProof(baseProof)
    );
  }

  const manifestLocators = new Set(manifest.productRelativeLocators ?? []);
  const metaSchema = await operationMetaSchema(
    packageRoot,
    catalog,
    manifestLocators,
    oracle
  );
  if (metaSchema === null) {
    return gapWithProof(
      {
        kind: "packed_asset",
        asset: "public_operation_contract_meta_schema"
      },
      "operation_family_mismatch",
      currentDelta(),
      frozenFamilyProof(baseProof)
    );
  }
  baseProof.operationContractMetaSchemaDigest = metaSchema.digest;

  const schemaDigestCache = new Map();
  let validatedOperationAssets = 0;
  for (const operationId of oracle.targetOperationIds) {
    const row = byIdentity.get(operationId)?.[0];
    if (row === undefined || !isObject(row.operationContract)) continue;
    const operationBytes = await installedAssetBytes(
      packageRoot,
      row.assetLocator?.relativePath
    );
    let operationAsset;
    try {
      operationAsset = operationBytes === null ? null : JSON.parse(operationBytes);
    } catch {
      operationAsset = null;
    }
    const expectedAsset = {
      kind: oracle.targetFamily.operationAssetKind,
      schemaVersion: oracle.targetFamily.operationAssetSchemaVersion,
      operationId,
      operationVersion: oracle.targetFamily.operationContractVersion,
      familyDigest: row.operationContract.familyDigest,
      definitions: row.operationContract.definitions
    };
    if (
      operationBytes === null ||
      sha256(operationBytes) !== row.digest ||
      !manifestLocators.has(row.assetLocator?.relativePath) ||
      !metaSchema.validate(operationAsset) ||
      canonicalizeIJson(operationAsset) !== canonicalizeIJson(expectedAsset)
    ) {
      incomplete.add(operationId);
      continue;
    }
    validatedOperationAssets += 1;

    for (const definition of row.operationContract.definitions) {
      const member = definitionMember(definition);
      if (member === null || !isObject(definition.schemaCoordinates)) {
        incomplete.add(operationId);
        continue;
      }
      for (const slot of SCHEMA_SLOTS) {
        const coordinate = definition.schemaCoordinates[slot];
        if (coordinate === null) continue;
        const schemaPath = coordinate.assetLocator?.relativePath;
        if (
          typeof schemaPath !== "string" ||
          !manifestLocators.has(schemaPath)
        ) {
          incomplete.add(operationId);
          continue;
        }
        let actual = schemaDigestCache.get(schemaPath);
        if (actual === undefined) {
          const bytes = await installedAssetBytes(packageRoot, schemaPath);
          let schemaId = null;
          try {
            schemaId = bytes === null ? null : JSON.parse(bytes)?.$id ?? null;
          } catch {
            schemaId = null;
          }
          actual = Object.freeze({
            digest: bytes === null ? null : sha256(bytes),
            schemaId
          });
          schemaDigestCache.set(schemaPath, actual);
        }
        if (
          actual.digest !== coordinate.schemaDigest ||
          actual.schemaId !== coordinate.schemaId
        ) {
          incomplete.add(operationId);
        }
      }
    }
  }
  baseProof.schemaAssetCount = [...schemaDigestCache.values()].filter(
    (asset) => asset.digest !== null
  ).length;
  baseProof.operationContractMetaSchemaValidatedAssetCount =
    validatedOperationAssets;

  const exactCounts =
    definitionMemberCount === oracle.targetFamily.definitionMemberCount &&
    schemaCoordinateCount === oracle.targetFamily.schemaCoordinateCount &&
    baseProof.schemaAssetCount === oracle.targetFamily.schemaCoordinateCount &&
    absentNonterminalCount === oracle.targetFamily.absentNonterminalCount &&
    schemaIdentities.size === oracle.targetFamily.schemaCoordinateCount &&
    schemaPaths.size === oracle.targetFamily.schemaCoordinateCount &&
    validatedOperationAssets === oracle.targetFamily.operationRowCount;
  const exactFamilyDigest =
    familyDigests.size === 1 &&
    familyDigests.has(recomputedFamilyDigest);
  const familyProof = frozenFamilyProof(baseProof);
  const familyDelta = currentDelta();
  if (familyDelta.incompleteTargetOperationIds.length > 0) {
    return gapWithProof(
      {
        kind: "operation_contract",
        operationId: firstDeliveryGap(
          familyDelta.incompleteTargetOperationIds
        )
      },
      "operation_family_mismatch",
      familyDelta,
      familyProof
    );
  }
  if (!exactCounts || !exactFamilyDigest) {
    return gapWithProof(
      { kind: "operation_family", family: "abg-5-release" },
      "operation_family_mismatch",
      familyDelta,
      familyProof
    );
  }
  return Object.freeze({
    kind: "accepted_exact_operation_family",
    familyDelta,
    familyProof
  });
}

async function installedFile(packageRoot, candidate, asset) {
  const resolvedRoot = await realpath(packageRoot);
  const resolvedCandidate = await realpath(candidate);
  if (
    !insideRoot(resolvedRoot, resolvedCandidate) ||
    !(await stat(resolvedCandidate)).isFile()
  ) {
    return gap(
      { kind: "packed_asset", asset },
      "installed_asset_outside_candidate"
    );
  }
  return null;
}

async function runInstalledConsensusScenario(config) {
  const packageRoot = path.resolve(config.packageRoot);
  const packageEntry = await lstat(packageRoot);
  if (!packageEntry.isDirectory() || packageEntry.isSymbolicLink()) {
    return gap(
      { kind: "packed_asset", asset: "installed_package_root" },
      "installed_package_is_not_detached_directory"
    );
  }
  const packageJsonPath = path.join(packageRoot, "package.json");
  const catalogPath = path.join(packageRoot, "contracts/public-contract-catalog.json");
  for (const [candidate, asset] of [
    [packageJsonPath, "package_manifest"],
    [catalogPath, "public_contract_catalog"],
    [config.cliPath, "abg_cli"]
  ]) {
    const assetGap = await installedFile(packageRoot, candidate, asset);
    if (assetGap !== null) {
      return assetGap;
    }
  }

  const artifactDigest = sha256(await readFile(path.resolve(config.artifactPath)));
  if (artifactDigest !== config.expectedArtifactDigest) {
    return gap(
      { kind: "packed_asset", asset: "candidate_artifact_digest" },
      "candidate_artifact_digest_mismatch"
    );
  }
  const oracleBytes = await readFile(path.resolve(config.qualificationOraclePath));
  if (sha256(oracleBytes) !== CANONICAL_ORACLE_DIGEST) {
    return gap(
      { kind: "qualification_oracle", asset: "public_operation_family" },
      "qualification_oracle_digest_mismatch"
    );
  }

  const oracle = admitQualificationOracle(JSON.parse(oracleBytes));
  const packageManifest = JSON.parse(await readFile(packageJsonPath, "utf8"));
  const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
  if (!await verifyManifestCatalog(packageRoot, packageManifest, catalog)) {
    return gap(
      { kind: "packed_asset", asset: "manifest_catalog_family" },
      "installed_publication_incoherent"
    );
  }
  const manifest = JSON.parse(await readFile(
    path.join(packageRoot, "product-toolchain-manifest.json"),
    "utf8"
  ));
  const family = await preflightPackedOperationFamily(
    packageRoot,
    catalog,
    manifest,
    oracle
  );
  const evidence = {
    candidate: Object.freeze({
      artifactDigest,
      packageName: packageManifest.name,
      packageVersion: packageManifest.version,
      catalogDigest: catalog.catalogDigest ?? null,
      catalogVersion: catalog.catalogVersion ?? null
    }),
    qualificationOracle: Object.freeze({
      digest: CANONICAL_ORACLE_DIGEST,
      ordering: oracle.ordering,
      targetRequirementSourceDigest:
        oracle.basis.targetRequirementSourceDigest,
      steelThreadDesignDigest: oracle.basis.steelThreadDesignDigest
    }),
    workspace: Object.freeze({
      application: "temporary",
      requestedRoot: path.resolve(config.workspaceRoot),
      workspaceOperationInvoked: false
    })
  };
  if (family.kind !== "accepted_exact_operation_family") {
    return Object.freeze({
      ...family,
      ...evidence
    });
  }

  const definition = operationDefinition(
    catalog,
    "abg.operation.workspace.create",
    "clean"
  );
  const request = Object.freeze({
    targetRoot: path.resolve(config.workspaceRoot),
    createPolicy: "clean",
    scaffoldPolicy: "no_scaffold"
  });
  await validateInstalledRequest(packageRoot, definition, request);
  const driverStateRoot = path.resolve(config.driverStateRoot);
  await mkdir(driverStateRoot, { recursive: true });

  const tamperedDefinitionDigest = digestCanonicalIJson({
    tamperedPublishedDefinitionDigest: definition.definitionDigest
  });
  const tamperedInvocation = constructSourceBlindInvocation({
    catalog,
    definition: Object.freeze({
      ...definition,
      definitionDigest: tamperedDefinitionDigest
    }),
    callerAuthority: config.callerAuthority,
    request
  });
  const tamperedInvocationPath = path.join(
    driverStateRoot,
    "workspace-create-tampered-definition.json"
  );
  await writeFile(
    tamperedInvocationPath,
    canonicalizeIJson(tamperedInvocation),
    "utf8"
  );
  const tamperedOutcome = spawnInstalledCli(
    {
      config: { ...config, driverStateRoot },
      definition,
      member: "clean",
      invocationPath: tamperedInvocationPath,
      ownerRequestPath: null,
      workspaceRoot: path.resolve(config.workspaceRoot)
    }
  );
  if (tamperedOutcome.error !== undefined) {
    throw tamperedOutcome.error;
  }
  const tamperedDiagnostic = parseOneJson(
    tamperedOutcome.stderr,
    "tampered definition diagnostic"
  );
  let workspaceExistedAfterTamper = true;
  try {
    await lstat(path.resolve(config.workspaceRoot));
  } catch (error) {
    if (error?.code === "ENOENT") workspaceExistedAfterTamper = false;
    else throw error;
  }
  if (
    tamperedOutcome.status !== definition.adapterExitMap.invalidInvocation ||
    tamperedOutcome.stdout !== "" ||
    tamperedDiagnostic.kind !== "invalid_invocation" ||
    tamperedDiagnostic.operationId !== "abg.operation.workspace.create" ||
    !/definition digest differs from the published family/u.test(
      tamperedDiagnostic.message ?? ""
    ) ||
    workspaceExistedAfterTamper
  ) {
    throw new TypeError(
      "tampered published definition digest did not refuse before workspace mutation: " +
        canonicalizeIJson({
          status: tamperedOutcome.status,
          signal: tamperedOutcome.signal,
          stdout: tamperedOutcome.stdout,
          diagnostic: tamperedDiagnostic,
          workspaceExistedAfterTamper
        })
    );
  }

  const invocation = constructSourceBlindInvocation({
    catalog,
    definition,
    callerAuthority: config.callerAuthority,
    request
  });
  const invocationPath = path.join(
    driverStateRoot,
    "workspace-create.json"
  );
  await writeFile(invocationPath, canonicalizeIJson(invocation), "utf8");
  const invocationOutcome = spawnInstalledCli(
    {
      config: { ...config, driverStateRoot },
      definition,
      member: "clean",
      invocationPath,
      ownerRequestPath: null,
      workspaceRoot: path.resolve(config.workspaceRoot)
    }
  );
  if (invocationOutcome.error !== undefined) {
    throw invocationOutcome.error;
  }
  if (
    invocationOutcome.status !== definition.adapterExitMap.acceptedTerminal ||
    invocationOutcome.stderr !== ""
  ) {
    return Object.freeze({
      kind: "frontier_gap",
      phase: "installed_consensus_driver",
      coordinate: Object.freeze({
        kind: "delivery_step",
        operationId: "abg.operation.workspace.create"
      }),
      reason: "installed_workspace_create_did_not_accept",
      familyDelta: family.familyDelta,
      familyProof: family.familyProof,
      targetOperationInvocationCount: 0,
      constructorProof: Object.freeze({
        source: "installed_operation_metadata",
        tamperedDefinitionDigestRefused: true,
        tamperedExitCode: tamperedOutcome.status,
        workspaceExistedAfterTamper
      }),
      cliFailure: Object.freeze({
        exitCode: invocationOutcome.status,
        signal: invocationOutcome.signal,
        stdout: invocationOutcome.stdout,
        stderr: invocationOutcome.stderr
      }),
      ...evidence
    });
  }
  const publicOutcome = parseOneJson(
    invocationOutcome.stdout,
    "workspace.create public outcome"
  );
  const workspaceEntry = await lstat(path.resolve(config.workspaceRoot));
  if (
    publicOutcome.outcomeKind !== "result" ||
    publicOutcome.invocationRef !== invocation.invocationRef ||
    publicOutcome.invocationDigest !== invocation.invocationDigest ||
    publicOutcome.definitionDigest !== definition.definitionDigest ||
    !workspaceEntry.isDirectory() ||
    workspaceEntry.isSymbolicLink()
  ) {
    throw new TypeError(
      "workspace.create accepted without the exact invocation and workspace result"
    );
  }
  const workspaceRoot = path.resolve(config.workspaceRoot);
  const mutableStateRoots = defaultMutableStateRoots(workspaceRoot);
  const eventLogPath = mutableStateRoots.eventLogPath;
  let eventLines = await readEventLog(eventLogPath);
  const eventKinds = eventLines.map((event) => event.kind);
  if (
    canonicalizeIJson(eventKinds) !== canonicalizeIJson([
      "public_operation_admitted",
      "public_operation_artifact_admitted"
    ]) ||
    !eventLines.some((event) =>
      publicOutcome.evidenceRefs?.includes(event.eventId)
    )
  ) {
    throw new TypeError(
      "workspace.create result is not backed by its admitted Rule-B event chain"
    );
  }
  const createPair = exactArtifactBoundaryPair({
    events: eventLines,
    priorCount: 0,
    operationId: "abg.operation.workspace.create",
    outcome: publicOutcome
  });

  const threadEvidence = Object.freeze({
    ...evidence,
    workspace: Object.freeze({
      ...evidence.workspace,
      workspaceOperationInvoked: true,
      resultRef: publicOutcome.outcomeRef,
      eventLogPath
    })
  });
  const installedConfig = Object.freeze({
    ...config,
    driverStateRoot,
    packageRoot
  });
  const loadProduct = async (input) => {
    const descriptor = JSON.parse(await readFile(
      path.resolve(input.descriptorPath),
      "utf8"
    ));
    const contribution = JSON.parse(await readFile(
      path.resolve(input.contributionPath),
      "utf8"
    ));
    const candidateArtifact = Object.freeze({
      ...input.artifact,
      artifactPath: path.resolve(input.artifact?.artifactPath ?? "")
    });
    const actualArtifactDigest = sha256(
      await readFile(candidateArtifact.artifactPath)
    );
    if (
      candidateArtifact.format !== "npm_package_tgz" ||
      candidateArtifact.expectedArtifactDigest !== actualArtifactDigest ||
      candidateArtifact.expectedProductContentDigest !==
        descriptor.productContentDigest ||
      descriptor.distributionArtifactDigest !== actualArtifactDigest ||
      descriptor.contributionManifestId !== contribution.contributionId ||
      descriptor.contributionManifestDigest !== contribution.contributionDigest
    ) {
      throw new TypeError(
        `${input.key} artifact, descriptor, and contribution do not share one authority`
      );
    }
    return Object.freeze({
      key: input.key,
      candidateArtifact,
      contribution,
      descriptor
    });
  };
  const products = Object.freeze([
    await loadProduct({
      key: "abiogenesis",
      artifact: config.candidateArtifact,
      contributionPath: config.candidateContributionPath,
      descriptorPath: config.candidateDescriptorPath
    }),
    await loadProduct({
      key: "hello-world",
      artifact: config.helloWorldProduct?.artifact,
      contributionPath: config.helloWorldProduct?.contributionPath,
      descriptorPath: config.helloWorldProduct?.descriptorPath
    })
  ]);
  const primaryProduct = products[0];
  const helloWorldProduct = products[1];
  if (
    primaryProduct === undefined ||
    helloWorldProduct === undefined ||
    primaryProduct.candidateArtifact.artifactPath !==
      path.resolve(config.artifactPath) ||
    primaryProduct.candidateArtifact.expectedArtifactDigest !== artifactDigest
  ) {
    throw new TypeError("the installed product set lost the packed ABG candidate");
  }
  const descriptor = primaryProduct.descriptor;
  const contribution = primaryProduct.contribution;
  const candidateArtifact = primaryProduct.candidateArtifact;

  let successfulInvocationCount = 1;
  const requirements = Object.freeze(products.map((product) => Object.freeze({
    productId: product.descriptor.productId,
    versionConstraint: product.descriptor.version,
    requiredContractRefs: Object.freeze([...product.descriptor.contractRefs]),
    requiredCapabilityRefs: Object.freeze([...product.descriptor.capabilityRefs])
  })));
  const candidateCoordinates = Object.freeze(products.map((product) =>
    Object.freeze({
      productId: product.descriptor.productId,
      version: product.descriptor.version,
      contractRefs: Object.freeze([...product.descriptor.contractRefs]),
      capabilityRefs: Object.freeze([...product.descriptor.capabilityRefs])
    })
  ));
  const resolved = await invokeInstalledOperation({
    config: installedConfig,
    catalog,
    driverStateRoot,
    operationId: "abg.operation.product.resolve",
    member: "resolve",
    fileStem: "product-resolve",
    request: Object.freeze({
      requirements,
      candidates: candidateCoordinates
    }),
    ownerRequest: Object.freeze({
      requirements,
      candidateDescriptors: Object.freeze(
        products.map((product) => product.descriptor)
      )
    }),
    callerAuthority: operationCallerAuthority(config.callerAuthority, {
      correlationRef: "correlation://t276/source-blind-product-resolve"
    }),
    workspaceRoot: null
  });
  const resolveResult = acceptedOperationResult(
    resolved,
    "abg.operation.product.resolve"
  );
  if (resolveResult === null) {
    return operationFailureGap({
      operationId: "abg.operation.product.resolve",
      family,
      invocationCount: successfulInvocationCount,
      execution: resolved,
      evidence: threadEvidence
    });
  }
  successfulInvocationCount += 1;
  eventLines = await readEventLog(eventLogPath);
  if (eventLines.length !== 2 || resolved.outcome.evidenceRefs.length !== 0) {
    throw new TypeError("product.resolve emitted runtime events despite pure admission");
  }

  const resolvedLock = resolveResult.resolvedLock;
  const dependencyLock = Object.freeze({
    state: "admitted_dependency_lock",
    lockRef: resolvedLock.lockId,
    lockDigest: resolvedLock.lockDigest
  });
  const toolchainRoot = path.resolve(config.toolchainRoot);
  const verifiedProducts = [];
  for (const product of products) {
    const verified = await invokeInstalledOperation({
      config: installedConfig,
      catalog,
      driverStateRoot,
      operationId: "abg.operation.product.verify",
      member: "verify",
      fileStem: `product-verify-${product.key}`,
      request: Object.freeze({
        artifactRef: product.candidateArtifact.artifactPath,
        artifactDigest: product.candidateArtifact.expectedArtifactDigest,
        productContentDigest:
          product.candidateArtifact.expectedProductContentDigest,
        descriptorRef: product.descriptor.descriptorId,
        descriptorDigest: product.descriptor.descriptorDigest,
        contributionManifestRef: product.contribution.contributionId,
        contributionManifestDigest: product.contribution.contributionDigest,
        resolvedLockRef: resolvedLock.lockId,
        resolvedLockDigest: resolvedLock.lockDigest,
        expectedContractRefs: Object.freeze([
          ...product.descriptor.contractRefs
        ])
      }),
      ownerRequest: Object.freeze({
        artifact: product.candidateArtifact,
        descriptor: product.descriptor,
        contributionManifest: product.contribution,
        resolvedLock
      }),
      callerAuthority: operationCallerAuthority(config.callerAuthority, {
        correlationRef:
          `correlation://t276/source-blind-product-verify/${product.key}`,
        dependencyLock
      }),
      workspaceRoot: null
    });
    const verifyResult = acceptedOperationResult(
      verified,
      "abg.operation.product.verify"
    );
    if (verifyResult === null) {
      return operationFailureGap({
        operationId: "abg.operation.product.verify",
        family,
        invocationCount: successfulInvocationCount,
        execution: verified,
        evidence: threadEvidence
      });
    }
    successfulInvocationCount += 1;
    eventLines = await readEventLog(eventLogPath);
    if (eventLines.length !== 2 || verified.outcome.evidenceRefs.length !== 0) {
      throw new TypeError(
        "product.verify emitted runtime events despite pure admission"
      );
    }
    verifiedProducts.push(Object.freeze({ product, verifyResult }));
  }

  const installations = [];
  for (const verifiedProduct of verifiedProducts) {
    const product = verifiedProduct.product;
    const verifyResult = verifiedProduct.verifyResult;
    const installTargetRoot = path.join(
      toolchainRoot,
      "products",
      product.descriptor.productId,
      product.descriptor.version
    );
    const priorCount = eventLines.length;
    const installExecution = await invokeInstalledOperation({
      config: installedConfig,
      catalog,
      driverStateRoot,
      operationId: "abg.operation.product.install",
      member: "install",
      fileStem: `product-install-${product.key}`,
      request: Object.freeze({
        verifiedArtifactRef: verifyResult.verifiedArtifactRef,
        verifiedArtifactDigest: verifyResult.verifiedArtifactDigest,
        productContentDigest: verifyResult.productContentDigest,
        productDescriptorRef: verifyResult.descriptorRef,
        productDescriptorDigest: verifyResult.descriptorDigest,
        contributionManifestRef: verifyResult.contributionManifestRef,
        contributionManifestDigest: verifyResult.contributionManifestDigest,
        resolvedLockRef: verifyResult.resolvedLockRef,
        resolvedLockDigest: verifyResult.resolvedLockDigest,
        targetRoot: installTargetRoot,
        installPolicy: "immutable_idempotent"
      }),
      ownerRequest: Object.freeze({
        verifiedArtifact: verifyResult.verifiedArtifact,
        toolchainRoot,
        workspaceBindingRef: null
      }),
      callerAuthority: operationCallerAuthority(config.callerAuthority, {
        correlationRef:
          `correlation://t276/source-blind-product-install/${product.key}`,
        actor: config.callerAuthority.actor,
        dependencyLock
      }),
      workspaceRoot
    });
    const installResult = acceptedOperationResult(
      installExecution,
      "abg.operation.product.install"
    );
    if (installResult === null) {
      return operationFailureGap({
        operationId: "abg.operation.product.install",
        family,
        invocationCount: successfulInvocationCount,
        execution: installExecution,
        evidence: threadEvidence
      });
    }
    successfulInvocationCount += 1;
    eventLines = await readEventLog(eventLogPath);
    const installPair = exactArtifactBoundaryPair({
      events: eventLines,
      priorCount,
      operationId: "abg.operation.product.install",
      outcome: installExecution.outcome
    });
    const verificationRecord = JSON.parse(await readFile(
      installResult.installerManifestRef,
      "utf8"
    ));
    const installedRecord = verificationRecord.installedProductRecord;
    if (
      digestCanonicalIJson(verificationRecord) !==
        installResult.installerManifestDigest ||
      !isObject(installedRecord) ||
      installedRecord.installedProductId !== installResult.installedProductRef ||
      digestCanonicalIJson(installedRecord) !==
        installResult.installedProductDigest ||
      installPair.artifact.artifactRef !== installResult.installedProductRef ||
      installPair.artifact.artifactDigest !==
        installResult.installedProductDigest
    ) {
      throw new TypeError(
        "product.install public result does not identify its exact durable installed record"
      );
    }
    installations.push(Object.freeze({
      product,
      verifyResult,
      installExecution,
      installResult,
      installPair,
      installedRecord
    }));
  }
  const primaryInstallation = installations.find(
    (entry) => entry.product.key === "abiogenesis"
  );
  const helloWorldInstallation = installations.find(
    (entry) => entry.product.key === "hello-world"
  );
  if (primaryInstallation === undefined || helloWorldInstallation === undefined) {
    throw new TypeError("both installed products are required before binding");
  }
  const verifyResult = primaryInstallation.verifyResult;
  const installResult = primaryInstallation.installResult;
  const installPair = primaryInstallation.installPair;
  const installedRecord = primaryInstallation.installedRecord;

  const workspaceManifest = JSON.parse(await readFile(
    publicOutcome.value.creationManifestRef,
    "utf8"
  ));
  const workspaceManifestDigest = digestCanonicalIJson(workspaceManifest);
  const installedSet = Object.freeze(installations.map((entry) =>
    Object.freeze({
      ref: entry.installedRecord.installedProductId,
      digest: digestCanonicalIJson(entry.installedRecord)
    })
  ));
  const installedSetDigest = digestCanonicalIJson(installedSet);
  const bindExecution = await invokeInstalledOperation({
    config: installedConfig,
    catalog,
    driverStateRoot,
    operationId: "abg.operation.workspace.bind",
    member: "bind",
    fileStem: "workspace-bind",
    request: Object.freeze({
      workspaceAuthorityRef: workspaceManifest.workspaceId,
      workspaceAuthorityDigest: workspaceManifestDigest,
      installedSet,
      resolvedLockRef: resolvedLock.lockId,
      resolvedLockDigest: resolvedLock.lockDigest,
      declaredRoots: bindingDeclaredRoots(mutableStateRoots)
    }),
    ownerRequest: Object.freeze({
      workspaceId: workspaceManifest.workspaceId,
      workspaceManifestDigest,
      resolvedLock,
      installedProductRecords: Object.freeze(
        installations.map((entry) => entry.installedRecord)
      ),
      mutableStateRoots
    }),
    callerAuthority: operationCallerAuthority(config.callerAuthority, {
      correlationRef: "correlation://t276/source-blind-workspace-bind",
      actor: config.callerAuthority.actor,
      productSet: Object.freeze({
        state: "admitted_product_set",
        productSetRef: `installed-set:${installedSetDigest}`,
        productSetDigest: installedSetDigest
      }),
      dependencyLock
    }),
    workspaceRoot
  });
  const bindResult = acceptedOperationResult(
    bindExecution,
    "abg.operation.workspace.bind"
  );
  if (bindResult === null) {
    return operationFailureGap({
      operationId: "abg.operation.workspace.bind",
      family,
      invocationCount: successfulInvocationCount,
      execution: bindExecution,
      evidence: threadEvidence
    });
  }
  successfulInvocationCount += 1;
  eventLines = await readEventLog(eventLogPath);
  const bindPair = exactArtifactBoundaryPair({
    events: eventLines,
    priorCount: 2 + installations.length * 2,
    operationId: "abg.operation.workspace.bind",
    outcome: bindExecution.outcome
  });
  if (
    bindPair.artifact.scopeRef !== workspaceManifest.workspaceId ||
    bindPair.artifact.scopeDigest !== workspaceManifestDigest ||
    bindPair.artifact.artifactRef !== bindResult.workspaceBindingRef ||
    bindPair.artifact.artifactDigest !== bindResult.workspaceBindingDigest
  ) {
    throw new TypeError(
      "workspace.bind public result differs from its replay artifact boundary"
    );
  }

  const bindingPath = path.join(
    workspaceRoot,
    ".abiogenesis",
    "toolchain-binding.json"
  );
  const binding = JSON.parse(await readFile(bindingPath, "utf8"));
  if (
    binding.bindingId !== bindResult.workspaceBindingRef ||
    binding.bindingDigest !== bindResult.workspaceBindingDigest ||
    digestCanonicalIJson(
      Object.fromEntries(
        Object.entries(binding).filter(([key]) => key !== "bindingDigest")
      )
    ) !== binding.bindingDigest
  ) {
    throw new TypeError(
      "workspace.bind durable binding differs from its public result"
    );
  }

  const statusSource = Object.freeze({
    kind: "WorkspaceBinding",
    sourceRef: binding.bindingId,
    sourceDigest: binding.bindingDigest
  });
  const statusSelector = Object.freeze({});
  const statusRequest = Object.freeze({
    kind: "project_read_request",
    caseKey: "workspace_status",
    source: statusSource,
    projectionBasis: projectReadProjectionBasis(
      "workspace_status",
      statusSource,
      statusSelector
    ),
    selector: statusSelector
  });
  const boundAuthority = Object.freeze({
    workspace: Object.freeze({
      state: "admitted_workspace",
      bindingRef: binding.bindingId,
      bindingDigest: binding.bindingDigest
    }),
    productSet: Object.freeze({
      state: "admitted_product_set",
      productSetRef: `product-set:${binding.productSetDigest}`,
      productSetDigest: binding.productSetDigest
    }),
    dependencyLock: Object.freeze({
      state: "admitted_dependency_lock",
      lockRef: binding.resolvedLockId,
      lockDigest: binding.resolvedLockDigest
    })
  });
  const statusExecution = await invokeInstalledOperation({
    config: installedConfig,
    catalog,
    driverStateRoot,
    operationId: "abg.operation.project.read",
    member: "workspace_status",
    fileStem: "project-read-workspace-status",
    request: statusRequest,
    ownerRequest: null,
    callerAuthority: operationCallerAuthority(config.callerAuthority, {
      correlationRef: "correlation://t276/source-blind-project-read-status",
      ...boundAuthority
    }),
    workspaceRoot
  });
  const statusResult = acceptedOperationResult(
    statusExecution,
    "abg.operation.project.read"
  );
  const expectedArtifactAvailability = Object.freeze([
    Object.freeze({
      operationId: "abg.operation.workspace.create",
      scope: Object.freeze({
        ref: createPair.artifact.scopeRef,
        digest: createPair.artifact.scopeDigest
      }),
      artifact: Object.freeze({
        ref: createPair.artifact.artifactRef,
        digest: createPair.artifact.artifactDigest
      }),
      boundaryEventRef: createPair.artifact.eventId
    }),
    ...installations.map((entry) => Object.freeze({
      operationId: "abg.operation.product.install",
      scope: Object.freeze({
        ref: entry.installPair.artifact.scopeRef,
        digest: entry.installPair.artifact.scopeDigest
      }),
      artifact: Object.freeze({
        ref: entry.installPair.artifact.artifactRef,
        digest: entry.installPair.artifact.artifactDigest
      }),
      boundaryEventRef: entry.installPair.artifact.eventId
    })),
    Object.freeze({
      operationId: "abg.operation.workspace.bind",
      scope: Object.freeze({
        ref: bindPair.artifact.scopeRef,
        digest: bindPair.artifact.scopeDigest
      }),
      artifact: Object.freeze({
        ref: bindPair.artifact.artifactRef,
        digest: bindPair.artifact.artifactDigest
      }),
      boundaryEventRef: bindPair.artifact.eventId
    })
  ]);
  if (statusResult === null) {
    return operationFailureGap({
      operationId: "abg.operation.project.read",
      family,
      invocationCount: successfulInvocationCount,
      execution: statusExecution,
      evidence: threadEvidence
    });
  }
  successfulInvocationCount += 1;
  eventLines = await readEventLog(eventLogPath);
  if (
    eventLines.length !== 4 + installations.length * 2 ||
    statusExecution.outcome.evidenceRefs.length !== 0 ||
    statusResult.projection?.readiness !== "ready" ||
    statusResult.projection.binding?.ref !== binding.bindingId ||
    statusResult.projection.binding?.digest !== binding.bindingDigest ||
    canonicalizeIJson(statusResult.projection.artifactAvailability) !==
      canonicalizeIJson(expectedArtifactAvailability)
  ) {
    throw new TypeError(
      "project.read(workspace_status) did not expose replay-derived ready binding truth"
    );
  }

  const replayExecution = await invokeInstalledOperation({
    config: installedConfig,
    catalog,
    driverStateRoot,
    operationId: "abg.operation.project.read",
    member: "workspace_status",
    fileStem: "project-read-workspace-status-replay",
    request: statusRequest,
    ownerRequest: null,
    callerAuthority: operationCallerAuthority(config.callerAuthority, {
      correlationRef: "correlation://t276/source-blind-project-read-status",
      ...boundAuthority
    }),
    workspaceRoot
  });
  const replayResult = acceptedOperationResult(
    replayExecution,
    "abg.operation.project.read"
  );
  if (
    replayResult === null ||
    canonicalizeIJson(replayResult) !== canonicalizeIJson(statusResult) ||
    replayExecution.execution.stdout !== statusExecution.execution.stdout ||
    (await readEventLog(eventLogPath)).length !==
      4 + installations.length * 2
  ) {
    throw new TypeError(
      "project.read(workspace_status) is not reproducible from unchanged replay"
    );
  }
  successfulInvocationCount += 1;

  const baseProgramRows = contribution.rows.filter(
    (row) =>
      row.publicKind === "graph_function" &&
      row.contractRef === "abg.schema.gtl-graph-function" &&
      row.canonicalHandle ===
        "catalog-entry://abiogenesis/system/one-surface/v1"
  );
  const baseProgramRow = baseProgramRows[0];
  if (baseProgramRows.length !== 1 || baseProgramRow === undefined) {
    throw new TypeError(
      "installed Abiogenesis contribution must publish one GTL control GraphFunction"
    );
  }
  const baseProgramGraphFunction = await installedExecutableGraphFunction({
    installedRecord,
    verifiedContribution: contribution,
    canonicalHandle: baseProgramRow.canonicalHandle
  });
  const helloWorldExecutableGraphFunction =
    await installedExecutableGraphFunction({
      installedRecord: helloWorldInstallation.installedRecord,
      verifiedContribution: helloWorldProduct.contribution,
      canonicalHandle: nonEmptyText(
        config.helloWorldProduct?.targetGraphFunctionHandle,
        "config.helloWorldProduct.targetGraphFunctionHandle"
      )
    });
  const combinedContribution = Object.freeze({
    rows: Object.freeze(
      products.flatMap((product) => product.contribution.rows)
    )
  });
  const catalogAdmitExecution = await invokeInstalledOperation({
    config: installedConfig,
    catalog,
    driverStateRoot,
    operationId: "abg.operation.catalog.admit",
    member: "admit",
    fileStem: "catalog-admit",
    request: Object.freeze({
      workspaceBindingRef: binding.bindingId,
      workspaceBindingDigest: binding.bindingDigest,
      descriptorRefs: Object.freeze(
        installations.map((entry) => entry.installedRecord.descriptorId)
      ),
      contributionManifestRefs: Object.freeze(
        installations.map((entry) => entry.installedRecord.contributionId)
      ),
      resolvedLockRef: binding.resolvedLockId,
      resolvedLockDigest: binding.resolvedLockDigest
    }),
    ownerRequest: null,
    callerAuthority: operationCallerAuthority(config.callerAuthority, {
      correlationRef: "correlation://t276/source-blind-catalog-admit",
      actor: config.callerAuthority.actor,
      ...boundAuthority
    }),
    workspaceRoot
  });
  const catalogAdmitResult = acceptedOperationResult(
    catalogAdmitExecution,
    "abg.operation.catalog.admit"
  );
  if (catalogAdmitResult === null) {
    return operationFailureGap({
      operationId: "abg.operation.catalog.admit",
      family,
      invocationCount: successfulInvocationCount,
      execution: catalogAdmitExecution,
      evidence: threadEvidence
    });
  }
  successfulInvocationCount += 1;
  eventLines = await readEventLog(eventLogPath);
  const catalogAdmission = exactCatalogAdmission({
    events: eventLines,
    priorCount: 4 + installations.length * 2,
    contribution: combinedContribution,
    outcome: catalogAdmitExecution.outcome,
    result: catalogAdmitResult
  });

  const helloWorldOverlayRows =
    helloWorldExecutableGraphFunction.contribution.rows.filter(
      (row) => row.publicKind === "overlay"
    );
  const helloWorldOverlayRow = helloWorldOverlayRows[0];
  if (
    helloWorldOverlayRows.length !== 1 ||
    helloWorldOverlayRow === undefined
  ) {
    throw new TypeError(
      "installed Hello World contribution must publish one overlay"
    );
  }
  const catalogViewAllowlist = Object.freeze([
    helloWorldOverlayRow.canonicalHandle,
    baseProgramGraphFunction.row.canonicalHandle,
    helloWorldExecutableGraphFunction.row.canonicalHandle
  ].sort(compareText));

  const catalogViewExecution = await invokeInstalledOperation({
    config: installedConfig,
    catalog,
    driverStateRoot,
    operationId: "abg.operation.catalog.view",
    member: "allowlist",
    fileStem: "catalog-view",
    request: Object.freeze({
      allowlist: catalogViewAllowlist
    }),
    ownerRequest: null,
    callerAuthority: operationCallerAuthority(config.callerAuthority, {
      correlationRef: "correlation://t276/source-blind-catalog-view",
      actor: config.callerAuthority.actor,
      ...boundAuthority
    }),
    workspaceRoot
  });
  const catalogViewResult = acceptedOperationResult(
    catalogViewExecution,
    "abg.operation.catalog.view"
  );
  if (catalogViewResult === null) {
    return operationFailureGap({
      operationId: "abg.operation.catalog.view",
      family,
      invocationCount: successfulInvocationCount,
      execution: catalogViewExecution,
      evidence: threadEvidence
    });
  }
  successfulInvocationCount += 1;
  const eventLinesAfterView = await readEventLog(eventLogPath);
  if (
    canonicalizeIJson(eventLinesAfterView) !== canonicalizeIJson(eventLines) ||
    catalogViewExecution.outcome.evidenceRefs.length !== 0 ||
    canonicalizeIJson(catalogViewResult.effectiveHandles) !==
      canonicalizeIJson(catalogViewAllowlist) ||
    catalogViewResult.residuals.length !== 0 ||
    !Array.isArray(catalogViewResult.applicationCandidates) ||
    catalogViewResult.applicationCandidates.length !== 1 ||
    !SHA256_DIGEST_PATTERN.test(catalogViewResult.catalogViewDigest ?? "")
  ) {
    throw new TypeError(
      `catalog.view did not purely expose one exact overlay application candidate: ${JSON.stringify({
        requested: catalogViewAllowlist,
        result: catalogViewResult,
        evidenceRefs: catalogViewExecution.outcome.evidenceRefs,
        eventCountBefore: eventLines.length,
        eventCountAfter: eventLinesAfterView.length
      })}`
    );
  }
  const catalogApplicationCandidate =
    catalogViewResult.applicationCandidates[0];
  if (
    !isObject(catalogApplicationCandidate) ||
    canonicalizeIJson(
      Object.keys(catalogApplicationCandidate).sort(compareText)
    ) !==
      canonicalizeIJson([
        "applicationBasisDigest",
        "applicationBasisRef",
        "catalogRowDigest",
        "catalogRowRef",
        "catalogViewDigest",
        "catalogViewRef",
        "declarationDigest",
        "declarationRef",
        "targetDigest",
        "targetRef"
      ]) ||
    catalogApplicationCandidate.catalogRowRef !==
      helloWorldOverlayRow.canonicalHandle ||
    catalogApplicationCandidate.declarationRef !==
      helloWorldOverlayRow.declarationRef ||
    catalogApplicationCandidate.targetRef !==
      helloWorldExecutableGraphFunction.row.declarationRef ||
    catalogApplicationCandidate.catalogViewRef !==
      catalogViewResult.catalogViewRef ||
    catalogApplicationCandidate.catalogViewDigest !==
      catalogViewResult.catalogViewDigest ||
    ![
      catalogApplicationCandidate.applicationBasisDigest,
      catalogApplicationCandidate.catalogRowDigest,
      catalogApplicationCandidate.catalogViewDigest,
      catalogApplicationCandidate.declarationDigest,
      catalogApplicationCandidate.targetDigest
    ].every((value) => SHA256_DIGEST_PATTERN.test(value ?? ""))
  ) {
    throw new TypeError(
      "catalog.view application candidate differs from installed catalog authority"
    );
  }

  const catalogApplyExecution = await invokeInstalledOperation({
    config: installedConfig,
    catalog,
    driverStateRoot,
    operationId: "abg.operation.catalog.apply",
    member: "overlay",
    fileStem: "catalog-apply",
    request: catalogApplicationCandidate,
    ownerRequest: null,
    callerAuthority: operationCallerAuthority(config.callerAuthority, {
      correlationRef: "correlation://t276/source-blind-catalog-apply",
      actor: config.callerAuthority.actor,
      ...boundAuthority,
      catalogScope: Object.freeze({
        state: "admitted_catalog_scope",
        viewRef: catalogViewResult.catalogViewRef,
        viewDigest: catalogViewResult.catalogViewDigest,
        allowlistRef:
          `allowlist:${digestCanonicalIJson(catalogViewResult.effectiveHandles)}`,
        allowlistDigest:
          digestCanonicalIJson(catalogViewResult.effectiveHandles)
      })
    }),
    workspaceRoot
  });
  const catalogApplyResult = acceptedOperationResult(
    catalogApplyExecution,
    "abg.operation.catalog.apply"
  );
  if (catalogApplyResult === null) {
    return operationFailureGap({
      operationId: "abg.operation.catalog.apply",
      family,
      invocationCount: successfulInvocationCount,
      execution: catalogApplyExecution,
      evidence: threadEvidence
    });
  }
  successfulInvocationCount += 1;
  eventLines = await readEventLog(eventLogPath);
  const catalogApplyPair = exactArtifactBoundaryPair({
    events: eventLines,
    priorCount: eventLinesAfterView.length,
    operationId: "abg.operation.catalog.apply",
    outcome: catalogApplyExecution.outcome
  });
  if (
    catalogApplyResult.applicationKind !== "overlay" ||
    catalogApplyResult.declarationRef !==
      catalogApplicationCandidate.declarationRef ||
    typeof catalogApplyResult.targetRef !== "string" ||
    !SHA256_DIGEST_PATTERN.test(catalogApplyResult.targetDigest ?? "") ||
    !Array.isArray(catalogApplyResult.provenanceRefs) ||
    catalogApplyPair.artifact.scopeRef !== catalogApplyResult.targetRef ||
    catalogApplyPair.artifact.scopeDigest !== catalogApplyResult.targetDigest ||
    catalogApplyPair.artifact.artifactRef !==
      catalogApplyResult.applicationRef ||
    !SHA256_DIGEST_PATTERN.test(catalogApplyPair.artifact.artifactDigest ?? "")
  ) {
    throw new TypeError(
      "catalog.apply result differs from its exact Rule-B program application"
    );
  }
  const appliedExecutionProgram = Object.freeze({
    ref: catalogApplyResult.targetRef,
    digest: catalogApplyResult.targetDigest
  });
  const runAllowlist = Object.freeze([
    ...catalogViewResult.effectiveHandles
  ]);

  const helloWorldInputContract = await installedProductContractCoordinate({
    installedRecord: helloWorldInstallation.installedRecord,
    contractId: helloWorldExecutableGraphFunction.row.contractRef
  });
  if (
    helloWorldExecutableGraphFunction.inputSchemaRef !==
      helloWorldInputContract.contractId ||
    helloWorldExecutableGraphFunction.row.contractRef !==
      helloWorldInputContract.contractId
  ) {
    throw new TypeError(
      "the installed Hello World graph differs from its published input contract"
    );
  }
  const helloWorldInput = Object.freeze({ greeting: "world" });
  const helloWorldInputDigest = digestCanonicalIJson(helloWorldInput);
  const liveSteeringPath = path.resolve(
    nonEmptyText(
      config.helloWorldProduct?.liveSteeringPath,
      "config.helloWorldProduct.liveSteeringPath"
    )
  );
  const liveSteering = JSON.parse(await readFile(liveSteeringPath, "utf8"));
  const liveSteeringDigest = digestCanonicalIJson(liveSteering);
  const liveSteeringRef = `steering:${liveSteeringDigest}`;
  const liveCapability = liveCapabilityCoordinate({
    workspaceRoot,
    archiveRoot: binding.mutableStateRoots.archiveRoot,
    steering: liveSteering
  });
  const fpPolicyBody = Object.freeze({
    kind: "declared_invocation_policy",
    mode: "live_fp_sunny",
    workspaceBindingRef: binding.bindingId,
    executionProgram: appliedExecutionProgram,
    targetGraphFunctionHandle:
      helloWorldExecutableGraphFunction.row.canonicalHandle
  });
  const fpPolicyDigest = digestCanonicalIJson(fpPolicyBody);
  const fpSessionPolicyBody = Object.freeze({
    kind: "declared_session_policy",
    policyDigest: fpPolicyDigest,
    catalogViewRef: catalogViewResult.catalogViewRef,
    catalogViewDigest: catalogViewResult.catalogViewDigest
  });
  const fpSessionPolicyDigest = digestCanonicalIJson(fpSessionPolicyBody);
  await writeFile(
    path.join(driverStateRoot, "run-invoke-fp-policy.json"),
    canonicalizeIJson(fpPolicyBody),
    "utf8"
  );
  await writeFile(
    path.join(driverStateRoot, "run-invoke-fp-session-policy.json"),
    canonicalizeIJson(fpSessionPolicyBody),
    "utf8"
  );
  const eventsBeforeFpRun = eventLines;
  const eventBytesBeforeFpRun = await readFile(eventLogPath);
  const fpRunExecution = await invokeInstalledOperation({
    config: installedConfig,
    catalog,
    driverStateRoot,
    operationId: "abg.operation.run.invoke",
    member: "invoke",
    fileStem: "run-invoke-hello-world-fp",
    request: Object.freeze({
      kind: "run_invoke_request",
      variant: "invoke",
      programRef: appliedExecutionProgram.ref,
      programDigest: appliedExecutionProgram.digest,
      canonicalHandle: helloWorldExecutableGraphFunction.row.canonicalHandle,
      inputContractRef: helloWorldInputContract.contractId,
      inputContractDigest: helloWorldInputContract.schemaDigest,
      input: helloWorldInput,
      catalogViewRef: catalogViewResult.catalogViewRef,
      catalogViewDigest: catalogViewResult.catalogViewDigest,
      allowlist: runAllowlist
    }),
    ownerRequest: null,
    callerAuthority: operationCallerAuthority(config.callerAuthority, {
      correlationRef: "correlation://t276/source-blind-run-invoke-fp",
      actor: config.callerAuthority.actor,
      ...boundAuthority,
      capabilityGrants: Object.freeze(
        config.callerAuthority.capabilityGrants.map((grant) => Object.freeze({
          ...grant,
          scopeRef: binding.bindingId,
          scopeDigest: binding.bindingDigest
        }))
      ),
      catalogScope: Object.freeze({
        state: "admitted_catalog_scope",
        viewRef: catalogViewResult.catalogViewRef,
        viewDigest: catalogViewResult.catalogViewDigest,
        allowlistRef: `allowlist:${digestCanonicalIJson(runAllowlist)}`,
        allowlistDigest: digestCanonicalIJson(runAllowlist)
      }),
      executionProgram: Object.freeze({
        state: "admitted_execution_program",
        selectionState: "selected_graph_function",
        admittedGtlProgramRef: appliedExecutionProgram.ref,
        admittedGtlProgramDigest: appliedExecutionProgram.digest,
        canonicalHandle: helloWorldExecutableGraphFunction.row.canonicalHandle,
        inputContract: helloWorldInputContract,
        inputPayloadRef: `input-payload:${helloWorldInputDigest}`,
        inputPayloadDigest: helloWorldInputDigest
      }),
      invocationPolicy: Object.freeze({
        state: "admitted_invocation_policy",
        policyRef: `policy:${fpPolicyDigest}`,
        policyDigest: fpPolicyDigest,
        sessionPolicyRef: `session-policy:${fpSessionPolicyDigest}`,
        sessionPolicyDigest: fpSessionPolicyDigest
      }),
      transportSteering: Object.freeze({
        state: "declared_transport_steering",
        steeringRef: liveSteeringRef,
        steeringDigest: liveSteeringDigest,
        provenanceRefs: Object.freeze([
          liveSteeringRef,
          liveSteeringDigest,
          liveCapability.capabilityRef,
          liveCapability.capabilityDigest,
          liveCapability.executionContractDigest
        ])
      })
    }),
    liveSteeringFilePath: liveSteeringPath,
    workspaceRoot
  });
  const fpRunResult = acceptedOperationResult(
    fpRunExecution,
    "abg.operation.run.invoke"
  );
  if (fpRunResult === null) {
    return operationFailureGap({
      operationId: "abg.operation.run.invoke",
      family,
      invocationCount: successfulInvocationCount,
      execution: fpRunExecution,
      evidence: threadEvidence
    });
  }
  successfulInvocationCount += 1;
  eventLines = await readEventLog(eventLogPath);
  const eventBytesAfterFpRun = await readFile(eventLogPath);
  if (!eventBytesAfterFpRun.subarray(0, eventBytesBeforeFpRun.length).equals(
    eventBytesBeforeFpRun
  )) {
    throw new TypeError("F_P run.invoke did not append to the installed event log");
  }
  const persistedFpRun = exactPersistedRunTransition({
    priorEvents: eventsBeforeFpRun,
    events: eventLines,
    invocation: fpRunExecution.invocation,
    result: fpRunResult
  });
  const fpArtifactEvents = persistedFpRun.events.filter(
    (event) => event.kind === "actor_result_artifact_observed"
  );
  const fpArtifact = fpArtifactEvents[0];
  const selectedFpResultContractRef = fpArtifact?.artifactPayload?.result_contract_ref;
  const expectedFpArtifactPayload = Object.freeze({
    result_contract_ref: selectedFpResultContractRef,
    edge: "hello-input-to-output",
    actor: "t276-packed-fake-agent",
    fulfillment_assessments: Object.freeze([
      Object.freeze({
        id: "instruction_response_admitted",
        evaluator: "instruction_response_admitted",
        fulfillment_status: "fulfilled",
        fulfillment_detail: "packed fake transport admitted",
        blocking_reasons: Object.freeze([]),
        evidence_refs: Object.freeze([
          "evidence://t276/packed-fake-transport"
        ])
      })
    ])
  });
  const expectedFpTargetValue = Object.freeze({
    message: "hello from the installed T-276 F_P worker"
  });
  if (
    fpArtifactEvents.length !== 1 ||
    fpArtifact === undefined ||
    typeof selectedFpResultContractRef !== "string" ||
    canonicalizeIJson(fpArtifact.artifactPayload) !==
      canonicalizeIJson(expectedFpArtifactPayload) ||
    fpArtifact.artifactContentDigest !==
      digestCanonicalIJson(expectedFpArtifactPayload) ||
    fpArtifact.artifactRef !== fpArtifact.resultRef ||
    fpRunResult.resultRef !== persistedFpRun.observed.payloadRef ||
    fpRunResult.resultDigest !== digestCanonicalIJson(expectedFpTargetValue)
  ) {
    throw new TypeError(
      "the installed F_P run lost its exact T-257 artifact or target value"
    );
  }

  const readFpProjection = async (caseKey, selector, fileStem) => {
    const source = Object.freeze({
      kind: "Run",
      sourceRef: fpRunResult.runRef,
      sourceDigest: fpRunResult.runDigest
    });
    const request = Object.freeze({
      kind: "project_read_request",
      caseKey,
      source,
      projectionBasis: projectReadProjectionBasis(caseKey, source, selector),
      selector
    });
    return await invokeInstalledOperation({
      config: installedConfig,
      catalog,
      driverStateRoot,
      operationId: "abg.operation.project.read",
      member: caseKey,
      fileStem,
      request,
      ownerRequest: null,
      callerAuthority: operationCallerAuthority(config.callerAuthority, {
        correlationRef:
          `correlation://t276/source-blind-project-read-fp/${caseKey}`,
        ...boundAuthority
      }),
      workspaceRoot
    });
  };
  const fpRunStatusExecution = await readFpProjection(
    "run_status",
    Object.freeze({}),
    "project-read-fp-run-status"
  );
  const fpRunStatusRead = acceptedOperationResult(
    fpRunStatusExecution,
    "abg.operation.project.read"
  );
  if (fpRunStatusRead === null) {
    return operationFailureGap({
      operationId: "abg.operation.project.read",
      family,
      invocationCount: successfulInvocationCount,
      execution: fpRunStatusExecution,
      evidence: threadEvidence
    });
  }
  successfulInvocationCount += 1;
  const projectedFpStatus = fpRunStatusRead.projection;
  const terminalFpConstruction = eventLines.find(
    (event) =>
      event.kind === "construction_terminal_disposition_projected" &&
      event.episodeId === persistedFpRun.root.episodeId &&
      event.publicState === "construction_closed"
  );
  if (
    fpRunStatusRead.caseKey !== "run_status" ||
    projectedFpStatus?.kind !== "runtime_status_projection" ||
    projectedFpStatus.subject?.kind !== "Run" ||
    projectedFpStatus.subject.ref !== fpRunResult.runRef ||
    projectedFpStatus.subject.digest !== fpRunResult.runDigest ||
    canonicalizeIJson(projectedFpStatus.substrate?.program) !==
      canonicalizeIJson(appliedExecutionProgram) ||
    projectedFpStatus.substrate?.workspaceBinding?.ref !== binding.bindingId ||
    projectedFpStatus.substrate?.workspaceBinding?.digest !==
      binding.bindingDigest ||
    projectedFpStatus.substrate?.executionBasis?.ref !==
      persistedFpRun.graphCall.basisId ||
    !SHA256_DIGEST_PATTERN.test(
      projectedFpStatus.substrate?.executionBasis?.digest ?? ""
    ) ||
    projectedFpStatus.lifecycle?.kind !== "terminal" ||
    projectedFpStatus.lifecycle.disposition !== "completed" ||
    projectedFpStatus.lifecycle.stop !== null ||
    projectedFpStatus.lifecycle.pendingInteraction !== null ||
    terminalFpConstruction === undefined ||
    projectedFpStatus.lifecycle.terminal?.ref !==
      terminalFpConstruction.eventId ||
    projectedFpStatus.lifecycle.terminal?.digest !==
      digestCanonicalIJson(terminalFpConstruction) ||
    !projectedFpStatus.provenanceRefs?.includes(
      persistedFpRun.events.find((event) => event.kind === "basis_admitted")
        ?.eventId
    ) ||
    !projectedFpStatus.provenanceRefs?.includes(
      terminalFpConstruction.eventId
    ) ||
    !projectedFpStatus.replayRefs?.every(
      (ref) =>
        typeof ref === "string" &&
        ref.startsWith("replay://abg/project.read/run-status/")
    ) ||
    !(await readFile(eventLogPath)).equals(eventBytesAfterFpRun)
  ) {
    throw new TypeError(
      "project.read(run_status) did not expose the installed F_P Event Calculus truth"
    );
  }
  const repeatedFpRunStatusExecution = await readFpProjection(
    "run_status",
    Object.freeze({}),
    "project-read-fp-run-status-repeat"
  );
  const repeatedFpRunStatus = acceptedOperationResult(
    repeatedFpRunStatusExecution,
    "abg.operation.project.read"
  );
  if (
    repeatedFpRunStatus === null ||
    repeatedFpRunStatusExecution.execution.stdout !==
      fpRunStatusExecution.execution.stdout ||
    canonicalizeIJson(repeatedFpRunStatus) !==
      canonicalizeIJson(fpRunStatusRead) ||
    !(await readFile(eventLogPath)).equals(eventBytesAfterFpRun)
  ) {
    throw new TypeError(
      "project.read(run_status) is not reproducible from unchanged F_P replay"
    );
  }
  successfulInvocationCount += 1;

  const fpRunResultReadExecution = await readFpProjection(
    "run_result",
    Object.freeze({}),
    "project-read-fp-run-result"
  );
  const fpRunResultRead = acceptedOperationResult(
    fpRunResultReadExecution,
    "abg.operation.project.read"
  );
  if (fpRunResultRead === null) {
    return operationFailureGap({
      operationId: "abg.operation.project.read",
      family,
      invocationCount: successfulInvocationCount,
      execution: fpRunResultReadExecution,
      evidence: threadEvidence
    });
  }
  successfulInvocationCount += 1;
  const projectedFpResult = fpRunResultRead.projection?.results?.[0];
  if (
    fpRunResultRead.caseKey !== "run_result" ||
    fpRunResultRead.projection?.results?.length !== 1 ||
    projectedFpResult?.result?.ref !== fpRunResult.resultRef ||
    projectedFpResult.result?.digest !== fpRunResult.resultDigest ||
    projectedFpResult.graphCall?.ref !== fpRunResult.graphCallRef ||
    projectedFpResult.declaredContract?.ref !== selectedFpResultContractRef ||
    projectedFpResult.artifact?.kind !== "present" ||
    projectedFpResult.artifact.value?.ref !== fpArtifact.artifactRef ||
    projectedFpResult.artifact.value?.digest !==
      fpArtifact.artifactContentDigest ||
    projectedFpResult.assessment?.kind !== "absent" ||
    !(await readFile(eventLogPath)).equals(eventBytesAfterFpRun)
  ) {
    throw new TypeError(
      "project.read(run_result) did not expose the exact installed F_P result"
    );
  }
  const repeatedFpRunResultReadExecution = await readFpProjection(
    "run_result",
    Object.freeze({}),
    "project-read-fp-run-result-repeat"
  );
  const repeatedFpRunResultRead = acceptedOperationResult(
    repeatedFpRunResultReadExecution,
    "abg.operation.project.read"
  );
  if (
    repeatedFpRunResultRead === null ||
    repeatedFpRunResultReadExecution.execution.stdout !==
      fpRunResultReadExecution.execution.stdout ||
    canonicalizeIJson(repeatedFpRunResultRead) !==
      canonicalizeIJson(fpRunResultRead) ||
    !(await readFile(eventLogPath)).equals(eventBytesAfterFpRun)
  ) {
    throw new TypeError(
      "project.read(run_result) is not reproducible from unchanged F_P replay"
    );
  }
  successfulInvocationCount += 1;

  const fpRunReplayExecution = await readFpProjection(
    "run_replay",
    Object.freeze({ fromOrdinal: 0, limit: 1000 }),
    "project-read-fp-run-replay"
  );
  const fpRunReplay = acceptedOperationResult(
    fpRunReplayExecution,
    "abg.operation.project.read"
  );
  if (fpRunReplay === null) {
    return operationFailureGap({
      operationId: "abg.operation.project.read",
      family,
      invocationCount: successfulInvocationCount,
      execution: fpRunReplayExecution,
      evidence: threadEvidence
    });
  }
  successfulInvocationCount += 1;
  const fpReplayRows = fpRunReplay.projection?.rows ?? [];
  const fpPersistedById = new Map(
    eventLines.map((event) => [event.eventId, event])
  );
  if (
    fpRunReplay.caseKey !== "run_replay" ||
    fpReplayRows.length === 0 ||
    fpReplayRows.some((row) => {
      const persisted = fpPersistedById.get(row.event?.ref);
      return persisted === undefined ||
        row.ordinal !== persisted.eventAdmissionOrdinal ||
        row.event.digest !== digestCanonicalIJson(persisted) ||
        canonicalizeIJson(row.admittedEvent) !== canonicalizeIJson(persisted) ||
        canonicalizeIJson(row.sourceRefs) !==
          canonicalizeIJson([fpRunResult.runRef]);
    }) ||
    !fpReplayRows.some(
      (row) => row.event?.ref === fpArtifact.eventId &&
        canonicalizeIJson(row.admittedEvent?.artifactPayload) ===
          canonicalizeIJson(expectedFpArtifactPayload)
    ) ||
    !(await readFile(eventLogPath)).equals(eventBytesAfterFpRun)
  ) {
    throw new TypeError(
      "project.read(run_replay) did not reproduce the exact installed F_P artifact"
    );
  }
  const repeatedFpRunReplayExecution = await readFpProjection(
    "run_replay",
    Object.freeze({ fromOrdinal: 0, limit: 1000 }),
    "project-read-fp-run-replay-repeat"
  );
  const repeatedFpRunReplay = acceptedOperationResult(
    repeatedFpRunReplayExecution,
    "abg.operation.project.read"
  );
  if (
    repeatedFpRunReplay === null ||
    repeatedFpRunReplayExecution.execution.stdout !==
      fpRunReplayExecution.execution.stdout ||
    canonicalizeIJson(repeatedFpRunReplay) !==
      canonicalizeIJson(fpRunReplay) ||
    !(await readFile(eventLogPath)).equals(eventBytesAfterFpRun)
  ) {
    throw new TypeError(
      "project.read(run_replay) is not reproducible from unchanged F_P replay"
    );
  }
  successfulInvocationCount += 1;

  const assessmentRequest = Object.freeze({
    runtimeResultRef: projectedFpResult.result.ref,
    runtimeResultDigest: projectedFpResult.result.digest,
    assessmentContractRef: projectedFpResult.declaredContract.ref,
    assessmentContractDigest: projectedFpResult.declaredContract.digest,
    assessment: fpArtifact.artifactPayload,
    evidenceRefs: Object.freeze(
      fpArtifact.artifactPayload.fulfillment_assessments.flatMap(
        (assessment) => assessment.evidence_refs
      )
    )
  });
  const eventsBeforeAssessment = eventLines;
  const resultAssessExecution = await invokeInstalledOperation({
    config: installedConfig,
    catalog,
    driverStateRoot,
    operationId: "abg.operation.result.assess",
    member: "assess",
    fileStem: "result-assess-fp",
    request: assessmentRequest,
    ownerRequest: null,
    callerAuthority: operationCallerAuthority(config.callerAuthority, {
      correlationRef: "correlation://t276/source-blind-result-assess-fp",
      actor: config.callerAuthority.actor,
      ...boundAuthority
    }),
    workspaceRoot
  });
  const resultAssessResult = acceptedOperationResult(
    resultAssessExecution,
    "abg.operation.result.assess"
  );
  if (resultAssessResult === null) {
    return operationFailureGap({
      operationId: "abg.operation.result.assess",
      family,
      invocationCount: successfulInvocationCount,
      execution: resultAssessExecution,
      evidence: threadEvidence
    });
  }
  successfulInvocationCount += 1;
  eventLines = await readEventLog(eventLogPath);
  const assessmentDelta = eventLines.slice(eventsBeforeAssessment.length);
  const assessedEvents = assessmentDelta.filter(
    (event) => event.kind === "assessed"
  );
  const assessed = assessedEvents[0];
  if (
    assessmentDelta.filter(
      (event) => event.kind === "public_operation_admitted"
    ).length !== 1 ||
    assessedEvents.length !== 1 ||
    assessed === undefined ||
    assessed.assessmentRef !== resultAssessResult.assessmentRef ||
    assessed.runtimeResultRef !== fpRunResult.resultRef ||
    assessed.runtimeResultDigest !== fpRunResult.resultDigest ||
    assessed.assessmentContractRef !== selectedFpResultContractRef ||
    assessed.obligationId !== "instruction_response_admitted" ||
    resultAssessResult.admittedDisposition !== "assessed" ||
    resultAssessResult.residualRefs.length !== 0
  ) {
    throw new TypeError(
      "public result.assess did not append one exact replay-bound assessment"
    );
  }

  const fpRunResultAfterAssessmentExecution = await readFpProjection(
    "run_result",
    Object.freeze({}),
    "project-read-fp-run-result-assessed"
  );
  const fpRunResultAfterAssessment = acceptedOperationResult(
    fpRunResultAfterAssessmentExecution,
    "abg.operation.project.read"
  );
  if (fpRunResultAfterAssessment === null) {
    return operationFailureGap({
      operationId: "abg.operation.project.read",
      family,
      invocationCount: successfulInvocationCount,
      execution: fpRunResultAfterAssessmentExecution,
      evidence: threadEvidence
    });
  }
  successfulInvocationCount += 1;
  const projectedAssessedFpResult =
    fpRunResultAfterAssessment.projection?.results?.[0];
  if (
    projectedAssessedFpResult?.assessment?.kind !== "present" ||
    projectedAssessedFpResult.assessment.value?.ref !==
      resultAssessResult.assessmentRef ||
    projectedAssessedFpResult.assessment.value?.digest !==
      `sha256:${resultAssessResult.assessmentRef.slice("assessment:".length)}` ||
    projectedAssessedFpResult.artifact?.kind !== "present" ||
    projectedAssessedFpResult.artifact.value?.ref !== fpArtifact.artifactRef ||
    projectedAssessedFpResult.artifact.value?.digest !==
      fpArtifact.artifactContentDigest
  ) {
    throw new TypeError(
      "project.read(run_result) did not expose the admitted F_P assessment"
    );
  }

  const fpRunReplayAfterAssessmentExecution = await readFpProjection(
    "run_replay",
    Object.freeze({ fromOrdinal: 0, limit: 1000 }),
    "project-read-fp-run-replay-assessed"
  );
  const fpRunReplayAfterAssessment = acceptedOperationResult(
    fpRunReplayAfterAssessmentExecution,
    "abg.operation.project.read"
  );
  if (fpRunReplayAfterAssessment === null) {
    return operationFailureGap({
      operationId: "abg.operation.project.read",
      family,
      invocationCount: successfulInvocationCount,
      execution: fpRunReplayAfterAssessmentExecution,
      evidence: threadEvidence
    });
  }
  successfulInvocationCount += 1;
  const fpAssessedReplayRows = fpRunReplayAfterAssessment.projection?.rows ?? [];
  if (
    !fpAssessedReplayRows.some(
      (row) => row.admittedEvent?.eventId === assessed.eventId &&
        row.admittedEvent?.assessmentRef === resultAssessResult.assessmentRef
    ) ||
    !fpAssessedReplayRows.some(
      (row) => row.admittedEvent?.eventId === fpArtifact.eventId &&
        canonicalizeIJson(row.admittedEvent?.artifactPayload) ===
          canonicalizeIJson(expectedFpArtifactPayload)
    )
  ) {
    throw new TypeError(
      "post-assessment run replay lost the assessment or exact F_P artifact"
    );
  }
  const transportCalls = (await readFile(
    path.resolve(config.helloWorldProduct.transportCallLogPath),
    "utf8"
  )).split("\n").filter((line) => line.length > 0).length;
  if (transportCalls !== 2) {
    throw new TypeError(
      `installed F_P run expected two transport calls, received ${transportCalls}`
    );
  }

  return Object.freeze({
    kind: "accepted_installed_steel_thread",
    phase: "installed_consensus_driver",
    coordinate: null,
    reason: null,
    familyDelta: family.familyDelta,
    familyProof: family.familyProof,
    targetOperationInvocationCount: successfulInvocationCount,
    constructorProof: Object.freeze({
      source: "installed_operation_metadata",
      definitionDigest: definition.definitionDigest,
      requestContract: contractIdentity(
        definition.schemaCoordinates.request,
        "installed request contract"
      ),
      invocationDigest: invocation.invocationDigest,
      tamperedDefinitionDigestRefused: true,
      tamperedExitCode: tamperedOutcome.status,
      workspaceExistedAfterTamper
    }),
    ...threadEvidence,
    workspace: Object.freeze({
      ...threadEvidence.workspace,
      workspaceOperationInvoked: true,
      resultRef: publicOutcome.outcomeRef,
      eventLogPath,
      eventKinds: Object.freeze(eventLines.map((event) => event.kind)),
      bindingRef: binding.bindingId,
      bindingDigest: binding.bindingDigest,
      readiness: statusResult.projection.readiness
    }),
    operationTrace: Object.freeze([
      "abg.operation.workspace.create",
      "abg.operation.product.resolve",
      "abg.operation.product.verify",
      "abg.operation.product.verify",
      "abg.operation.product.install",
      "abg.operation.product.install",
      "abg.operation.workspace.bind",
      "abg.operation.project.read",
      "abg.operation.project.read",
      "abg.operation.catalog.admit",
      "abg.operation.catalog.view",
      "abg.operation.catalog.apply",
      "abg.operation.run.invoke",
      "abg.operation.project.read",
      "abg.operation.project.read",
      "abg.operation.project.read",
      "abg.operation.project.read",
      "abg.operation.project.read",
      "abg.operation.project.read",
      "abg.operation.result.assess",
      "abg.operation.project.read",
      "abg.operation.project.read"
    ]),
    eventCalculusProof: Object.freeze({
      immutableArtifactOperations: Object.freeze([
        "abg.operation.workspace.create",
        "abg.operation.product.install",
        "abg.operation.workspace.bind",
        "abg.operation.catalog.apply"
      ]),
      pureOperations: Object.freeze([
        "abg.operation.product.resolve",
        "abg.operation.product.verify",
        "abg.operation.project.read",
        "abg.operation.catalog.view"
      ]),
      eventAdmissionOperations: Object.freeze([
        "abg.operation.catalog.admit"
      ]),
      runtimeTransitionOperations: Object.freeze([
        "abg.operation.run.invoke"
      ]),
      eventCount: eventLines.length,
      artifactReplayEquivalent: true,
      readByteEquivalent: true,
      ruleBArtifactAvailabilityCount: expectedArtifactAvailability.length,
      ruleBArtifactBoundaryCount: expectedArtifactAvailability.length + 1,
      readiness: statusResult.projection.readiness,
      installedRuntimeFluentProjection: Object.freeze({
        caseKey: fpRunStatusRead.caseKey,
        subjectRef: projectedFpStatus.subject.ref,
        programRef: projectedFpStatus.substrate.program.ref,
        workspaceBindingRef:
          projectedFpStatus.substrate.workspaceBinding.ref,
        executionBasisRef: projectedFpStatus.substrate.executionBasis.ref,
        lifecycle: projectedFpStatus.lifecycle.disposition,
        terminalEventRef: projectedFpStatus.lifecycle.terminal.ref,
        replayRef: projectedFpStatus.replayRefs[0],
        byteEquivalent: true,
        readsEventFree: true
      })
    }),
    persistedRuntimeReplayProof: Object.freeze({
      rule: "A",
      runAdmissionEventRef: persistedFpRun.admission.eventId,
      constructionRootEventRef: persistedFpRun.root.eventId,
      constructionBridgeEventRef: persistedFpRun.bridge.eventId,
      graphCallEventRef: persistedFpRun.graphCall.eventId,
      frameEventRef: persistedFpRun.frame.eventId,
      vectorPlannedEventRef: persistedFpRun.planned.eventId,
      payloadObservedEventRef: persistedFpRun.observed.eventId,
      payloadValidatedEventRef: persistedFpRun.validated.eventId,
      evidenceEventRefs: Object.freeze(
        persistedFpRun.evidence.map((event) => event.eventId)
      ),
      vectorEvaluatedEventRef: persistedFpRun.evaluated.eventId,
      vectorClosedEventRef: persistedFpRun.closed.eventId,
      appendedEventCount: persistedFpRun.events.length,
      replayRowCount: fpReplayRows.length,
      appendOnly: true,
      runResultByteEquivalent: true,
      runStatusByteEquivalent: true,
      runReplayByteEquivalent: true,
      readsEventFree: true
    }),
    installedFpProof: Object.freeze({
      graphFunctionHandle:
        helloWorldExecutableGraphFunction.row.canonicalHandle,
      inputContractRef: helloWorldInputContract.contractId,
      targetContractRef: selectedFpResultContractRef,
      targetValueRef: fpRunResult.resultRef,
      targetValueDigest: fpRunResult.resultDigest,
      artifactEventRef: fpArtifact.eventId,
      artifactRef: fpArtifact.artifactRef,
      artifactDigest: fpArtifact.artifactContentDigest,
      artifactPayload: fpArtifact.artifactPayload,
      transportCallCount: transportCalls,
      assessmentRef: resultAssessResult.assessmentRef,
      assessedEventRef: assessed.eventId,
      replayRowCount: fpReplayRows.length,
      assessedReplayRowCount: fpAssessedReplayRows.length,
      exactArtifactReplay: true,
      sourceBlindPublicCliOnly: true
    }),
    carrierChain: Object.freeze({
      workspaceCreate: Object.freeze({
        workspaceRef: publicOutcome.value.workspaceRef,
        manifestRef: publicOutcome.value.creationManifestRef,
        manifestDigest: createPair.artifact.artifactDigest,
        boundaryEventRef: createPair.artifact.eventId
      }),
      productResolve: Object.freeze({
        resolvedLockRef: resolveResult.resolvedLockRef,
        resolvedLockDigest: resolveResult.resolvedLockDigest
      }),
      productVerify: Object.freeze({
        verifiedArtifactRef: verifyResult.verifiedArtifactRef,
        verifiedArtifactDigest: verifyResult.verifiedArtifactDigest
      }),
      productInstall: Object.freeze({
        installedProductRef: installResult.installedProductRef,
        installedProductDigest: installResult.installedProductDigest,
        boundaryEventRef: installPair.artifact.eventId
      }),
      installedProducts: Object.freeze(installations.map((entry) =>
        Object.freeze({
          productId: entry.product.descriptor.productId,
          productVersion: entry.product.descriptor.version,
          installedProductRef: entry.installResult.installedProductRef,
          installedProductDigest: entry.installResult.installedProductDigest,
          boundaryEventRef: entry.installPair.artifact.eventId
        })
      )),
      workspaceBind: Object.freeze({
        workspaceBindingRef: bindResult.workspaceBindingRef,
        workspaceBindingDigest: bindResult.workspaceBindingDigest,
        boundaryEventRef: bindPair.artifact.eventId
      }),
      projectRead: Object.freeze({
        projectionRef: statusResult.projection.projection.ref,
        projectionDigest: statusResult.projection.projection.digest,
        artifactAvailability: Object.freeze(
          statusResult.projection.artifactAvailability.map((row) =>
            Object.freeze({
              ...row,
              scope: Object.freeze({ ...row.scope }),
              artifact: Object.freeze({ ...row.artifact })
            })
          )
        ),
        readiness: statusResult.projection.readiness
      }),
      catalogAdmission: Object.freeze({
        role: "bootstrap",
        catalogRef: catalogAdmitResult.catalogRef,
        catalogDigest: catalogAdmitResult.catalogDigest,
        admissionEventRef: catalogAdmission.admission.eventId,
        admittedEntryRefs: Object.freeze(
          catalogAdmission.registryEvents.map((event) => event.entryRef)
        )
      }),
      catalogView: Object.freeze({
        catalogViewRef: catalogViewResult.catalogViewRef,
        catalogViewDigest: catalogViewResult.catalogViewDigest,
        effectiveHandles: Object.freeze([
          ...catalogViewResult.effectiveHandles
        ]),
        applicationCandidate: Object.freeze({
          ...catalogApplicationCandidate
        }),
        baseModulePath: baseProgramGraphFunction.modulePath,
        baseModuleDigest: baseProgramGraphFunction.moduleDigest,
        baseVectorCount: baseProgramGraphFunction.vectorCount,
        helloWorldModulePath: helloWorldExecutableGraphFunction.modulePath,
        helloWorldModuleDigest: helloWorldExecutableGraphFunction.moduleDigest,
        helloWorldVectorCount: helloWorldExecutableGraphFunction.vectorCount,
        eventFree: true
      }),
      catalogApplication: Object.freeze({
        applicationRef: catalogApplyResult.applicationRef,
        applicationKind: catalogApplyResult.applicationKind,
        declarationRef: catalogApplyResult.declarationRef,
        applicationArtifactDigest:
          catalogApplyPair.artifact.artifactDigest,
        boundaryEventRef: catalogApplyPair.artifact.eventId,
        targetProgram: appliedExecutionProgram,
        provenanceRefs: Object.freeze([
          ...catalogApplyResult.provenanceRefs
        ])
      }),
      runInvoke: Object.freeze({
        disposition: fpRunResult.disposition,
        runRef: fpRunResult.runRef,
        runDigest: fpRunResult.runDigest,
        graphCallRef: fpRunResult.graphCallRef,
        resultRef: fpRunResult.resultRef,
        resultDigest: fpRunResult.resultDigest,
        replayRef: fpRunResult.replayRef,
        evidenceRefs: Object.freeze([...fpRunResult.evidenceRefs])
      }),
      runtimeRead: Object.freeze({
        runStatusProjectionRef: fpRunStatusRead.projection.projection.ref,
        runStatusProjectionDigest: fpRunStatusRead.projection.projection.digest,
        runResultProjectionRef: fpRunResultRead.projection.projection.ref,
        runResultProjectionDigest: fpRunResultRead.projection.projection.digest,
        runReplayProjectionRef: fpRunReplay.projection.projection.ref,
        runReplayProjectionDigest: fpRunReplay.projection.projection.digest,
        assessedRunResultProjectionRef:
          fpRunResultAfterAssessment.projection.projection.ref,
        assessedRunResultProjectionDigest:
          fpRunResultAfterAssessment.projection.projection.digest,
        assessedRunReplayProjectionRef:
          fpRunReplayAfterAssessment.projection.projection.ref,
        assessedRunReplayProjectionDigest:
          fpRunReplayAfterAssessment.projection.projection.digest,
        eventFree: true,
        replayStable: true,
        exactArtifactReplay: true
      }),
      resultAssessment: Object.freeze({
        assessmentRef: resultAssessResult.assessmentRef,
        admittedDisposition: resultAssessResult.admittedDisposition,
        assessedEventRef: assessed.eventId,
        runtimeResultRef: assessed.runtimeResultRef,
        runtimeResultDigest: assessed.runtimeResultDigest
      })
    })
  });
}

async function main() {
  const flag = process.argv.indexOf("--config");
  const configPath = flag < 0 ? undefined : process.argv[flag + 1];
  if (typeof configPath !== "string" || configPath.length === 0) {
    throw new TypeError("expected --config <path>");
  }
  const config = JSON.parse(await readFile(path.resolve(configPath), "utf8"));
  process.stdout.write(`${JSON.stringify(await runInstalledConsensusScenario(config))}\n`);
}

await main();
