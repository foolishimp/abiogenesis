import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  EXACT_OWNER_CONTRACT_KEY_SET_DIGEST,
  OWNER_CONTRACT_KEY_SET_DIGEST,
  OWNER_CONTRACT_MODULE_SOURCES,
  OWNER_CONTRACT_SOURCE_MAP,
  OWNER_CONTRACT_SOURCES,
} from "../../build/code/src/shared/owner_contract_source_set.js";
import {
  admitRuntimeContract,
  ownerAuthorityDigest,
  projectStrictJsonSchema,
} from "../../build/code/src/shared/public_function_contracts.js";
import {
  sha256Bytes,
  sha256Canonical,
} from "../../build/code/src/shared/digests.js";
import {
  admitCatalogAdmissionResult,
  constructCatalogAdmissionConservationWitness,
} from "../../build/code/src/product/catalog_operation_contracts.js";
import {
  admitResolvedNativeContractClosure,
  resolvedNativeContractBindingSchema,
} from "../../build/code/src/product/environment_operation_contracts.js";
import {
  joinExpectedOwnerContractSet,
} from "../../build/code/src/product/verification_operation_contracts.js";
import {
  ReleaseSnapshotPort,
} from "../../build/code/src/product/release_snapshot_operations.js";

const digest = `sha256:${"0".repeat(64)}`;
const rd = (ref = "ref://accepted") => ({ ref, digest });
const evidence = [rd("evidence://accepted")];
const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

const releaseIdentity = Object.freeze({
  identityRef: "release://abiogenesis/5.0.0-rc.1",
  identityDigest: sha256Canonical({ version: "5.0.0-rc.1" }),
  productId: "product://abiogenesis/typescript-tenant@5",
  version: "5.0.0-rc.1",
});
const releaseBasisValue = Object.freeze({ candidate: "wave5-absent" });
const releaseBasis = Object.freeze({
  kind: "release_qualification_basis",
  subjectKind: "pre_rc_candidate",
  basisRef: "qualification-basis://wave5/absent",
  basisDigest: sha256Canonical(releaseBasisValue),
  prospectiveIdentity: releaseIdentity,
  basis: releaseBasisValue,
});
const releaseLawValue = Object.freeze({ law: "qualification://abiogenesis/5" });
const releaseLawBasis = Object.freeze({
  kind: "release_law_basis",
  lawBasisRef: "qualification-law://abiogenesis/5",
  lawBasisDigest: sha256Canonical(releaseLawValue),
  law: releaseLawValue,
});
const releaseVerdictBody = Object.freeze({
  qualificationBasisRef: releaseBasis.basisRef,
  qualificationBasisDigest: releaseBasis.basisDigest,
  lawBasisRef: releaseLawBasis.lawBasisRef,
  lawBasisDigest: releaseLawBasis.lawBasisDigest,
  disposition: "green",
  bypassRefs: [],
});
const releaseVerdict = Object.freeze({
  kind: "release_qualification_verdict",
  verdictRef: "qualification-verdict://wave5/absent",
  verdictDigest: sha256Canonical(releaseVerdictBody),
  ...releaseVerdictBody,
});

function packet(operationId, memberKey) {
  const selected = OWNER_CONTRACT_SOURCE_MAP[operationId]?.[memberKey];
  assert.ok(selected, `missing owner packet ${operationId}/${memberKey}`);
  return selected.packet;
}

const representativeRequests = Object.freeze([
  ["D01", packet("abg.operation.workspace.create", "clean"), {
    targetRoot: "/tmp/abi5-owner-contract-probe",
    createPolicy: "clean",
    scaffoldPolicy: "none",
  }],
  ["D02", packet("abg.operation.project.read", "workspace_status"), {
    caseKey: "workspace_status",
    source: {
      sourceKind: "workspace_binding",
      sourceRef: "workspace://accepted",
      sourceDigest: digest,
    },
    projectionBasis: {
      projectionBasisRef: "projection-basis://accepted",
      projectionBasisDigest: digest,
    },
    selector: { kind: "none" },
  }],
  ["D03", packet("abg.operation.project.read", "run_status"), {
    caseKey: "run_status",
    source: {
      sourceKind: "run",
      sourceRef: "run://accepted",
      sourceDigest: digest,
    },
    projectionBasis: {
      projectionBasisRef: "projection-basis://accepted",
      projectionBasisDigest: digest,
    },
    selector: { kind: "none" },
  }],
  ["D04", packet("abg.operation.product.verify", "verify"), {
    targetKind: "packed_artifact",
    artifact: rd("artifact://accepted"),
    productContent: rd("product-content://accepted"),
    descriptor: rd("descriptor://accepted"),
    contributionManifest: rd("contribution-manifest://accepted"),
    declaredDependencies: [],
    compatibilityInputs: [],
  }],
  ["D05", packet("abg.operation.product.resolve", "resolve"), {
    requirements: [{
      productId: "product://accepted",
      packageVersion: "5.0.0",
      requiredContractRefs: [],
      requiredCapabilityRefs: [],
    }],
    verifiedCandidates: [{
      invocation: rd("invocation://verification"),
      outcome: rd("outcome://verification"),
    }],
  }],
  ["D06", packet("abg.operation.product.install", "install"), {
    verifiedArtifact: rd("verified-artifact://accepted"),
    descriptor: rd("descriptor://accepted"),
    contributionManifest: rd("contribution-manifest://accepted"),
    resolvedLock: rd("resolved-lock://accepted"),
    targetRoot: "/tmp/abi5-installed-product",
    installPolicy: "clean",
  }],
  ["D07", packet("abg.operation.catalog.view", "allowlist"), {
    catalog: rd("catalog://accepted"),
    allowlist: ["graph-function://accepted"],
  }],
  ["D08", packet("abg.operation.run.invoke", "invoke"), {
    program: rd("program://accepted"),
    catalogHandle: "graph-function://accepted",
    inputContract: rd("contract://input"),
    input: { message: "accepted" },
    catalogView: rd("catalog-view://accepted"),
    allowlist: ["graph-function://accepted"],
    sourceBasis: { kind: "none" },
  }],
  ["D09", packet("abg.operation.run.continue", "current_intent"), {
    run: rd("run://accepted"),
    continuation: rd("continuation://accepted"),
    currentIntent: rd("intent://accepted"),
    continuationInput: rd("continuation-input://accepted"),
    expectedBasis: rd("execution-basis://accepted"),
  }],
  ["D10", packet("abg.operation.interaction.respond", "approve"), {
    interaction: rd("interaction://accepted"),
    responseContract: rd("contract://response"),
    responseKind: "approve",
    choice: null,
    value: { approved: true },
    evidence,
    currentBasis: rd("execution-basis://accepted"),
  }],
  ["D11", packet("abg.operation.result.assess", "assess"), {
    expectedResult: rd("result://accepted"),
    assessmentContract: rd("contract://assessment"),
    assessment: {
      kind: "contract_admitted_assessment_value",
      schemaVersion: "5.0.0",
      contract: rd("contract://assessment"),
      valueRef: "assessment-value://accepted",
      valueDigest: digest,
      value: {
        kind: "result_assessment_value",
        schemaVersion: "5.0.0",
        expectedResult: rd("result://accepted"),
        disposition: "admitted",
        closureEligible: true,
        residuals: [],
      },
    },
    evidence,
    currentBasis: rd("execution-basis://accepted"),
  }],
  ["D12", packet("abg.operation.witness.admit", "reprice"), {
    subjectKind: "authority_basis",
    subject: rd("authority-basis://accepted"),
    act: "reprice",
    content: {
      kind: "typed_reason",
      contentContract: rd("contract://reason"),
      value: { reason: "accepted" },
    },
    context: { kind: "basis", basis: rd("authority-basis://accepted") },
    evidence,
    provenance: [rd("provenance://accepted")],
  }],
  ["D13", packet("abg.operation.conformance.evaluate", "gtl_program"), {
    program: rd("program://accepted"),
    conformanceLaw: rd("conformance-law://accepted"),
    inventoryBasis: { kind: "program_only" },
  }],
  ["D14", packet("abg.operation.product.materialize", "configuration"), {
    configurationContract: rd("contract://configuration"),
    binding: rd("workspace-binding://accepted"),
    inputs: { setting: "accepted" },
  }],
  ["D15", packet("abg.operation.release.snapshot", "published_rc"), {
    qualificationBasis: releaseBasis,
    lawBasis: releaseLawBasis,
    verdict: releaseVerdict,
    requestedIdentity: releaseIdentity,
  }],
]);

function containsOpenObjectSchema(value) {
  if (Array.isArray(value)) return value.some(containsOpenObjectSchema);
  if (value === null || typeof value !== "object") return false;
  if (
    value.type === "object" &&
    value.properties === undefined &&
    value.patternProperties === undefined &&
    (value.additionalProperties === undefined || value.additionalProperties === true)
  ) return true;
  return Object.values(value).some(containsOpenObjectSchema);
}

function capabilityRefs(operationId, memberKey) {
  if (operationId === "abg.operation.project.read") {
    if (memberKey === "assessment_evidence") {
      return ["abg.capability.runtime.admit-fp-result@5"];
    }
    if (memberKey === "install_evidence") {
      return ["abg.capability.install.bind-products@5"];
    }
    if ([
      "catalog_list",
      "catalog_describe",
      "workspace_status",
      "workspace_gaps",
      "witness_evidence",
      "release_evidence",
      "ticket_consensus",
    ].includes(memberKey)) {
      return ["abg.capability.operator.public-contract@5"];
    }
    return ["abg.capability.runtime.replay-continuation@5"];
  }
  if ([
    "abg.operation.workspace.create",
    "abg.operation.workspace.open",
    "abg.operation.witness.admit",
  ].includes(operationId)) {
    return ["abg.capability.operator.public-contract@5"];
  }
  if ([
    "abg.operation.product.verify",
    "abg.operation.product.resolve",
    "abg.operation.product.install",
    "abg.operation.workspace.bind",
    "abg.operation.product.materialize",
  ].includes(operationId)) {
    return ["abg.capability.install.bind-products@5"];
  }
  if (operationId === "abg.operation.catalog.admit") {
    return ["abg.capability.catalog.contribute@5"];
  }
  if (operationId === "abg.operation.catalog.view") {
    return ["abg.capability.operator.public-contract@5"];
  }
  if (operationId === "abg.operation.catalog.apply") {
    return [`abg.capability.catalog.apply-${memberKey.replace("_", "-")}@5`];
  }
  if (operationId === "abg.operation.run.invoke") {
    return [
      "abg.capability.catalog.invoke-graph-function@5",
      "abg.capability.runtime.execute-seven-term-c@5",
    ];
  }
  if (operationId === "abg.operation.run.continue") {
    return ["abg.capability.runtime.replay-continuation@5"];
  }
  if (operationId === "abg.operation.interaction.respond") {
    return [
      "abg.capability.operator.public-contract@5",
      "abg.capability.runtime.replay-continuation@5",
    ];
  }
  if (operationId === "abg.operation.result.assess") {
    return ["abg.capability.runtime.admit-fp-result@5"];
  }
  if (operationId === "abg.operation.conformance.evaluate") {
    return ["abg.capability.gtl.typecheck@5"];
  }
  if (operationId === "abg.operation.release.snapshot") {
    return [
      "abg.capability.operator.public-contract@5",
      "abg.capability.qualification.self-conformance@5",
    ];
  }
  assert.fail(`unclassified capability vector ${operationId}/${memberKey}`);
}

function slots(operationId, memberKey) {
  const cap = ["capability_grants"];
  const bound = [
    ...cap,
    "workspace_binding",
    "product_set",
    "dependency_lock",
  ];
  if (operationId === "abg.operation.workspace.create") return [...cap, "actor"];
  if (operationId === "abg.operation.workspace.open") return cap;
  if (operationId === "abg.operation.project.read") {
    if (["install_evidence", "release_evidence"].includes(memberKey)) return cap;
    return memberKey.startsWith("catalog_") ? [...bound, "catalog_scope"] : bound;
  }
  if (operationId === "abg.operation.product.verify") {
    return [...cap, "dependency_lock?targetKind=installed_artifact"];
  }
  if (operationId === "abg.operation.product.resolve") {
    return [...cap, "verification_references"];
  }
  if (operationId === "abg.operation.product.install") {
    return [...cap, "dependency_lock", "verification_references", "actor"];
  }
  if (operationId === "abg.operation.workspace.bind") {
    return [...cap, "product_set", "dependency_lock", "actor"];
  }
  if (["abg.operation.catalog.admit", "abg.operation.catalog.view"].includes(operationId)) {
    return [...bound, "actor"];
  }
  if (operationId === "abg.operation.catalog.apply") {
    return [...bound, "catalog_scope", "actor"];
  }
  if (operationId === "abg.operation.run.invoke") {
    return [
      ...bound,
      "catalog_scope",
      "execution_program",
      memberKey === "invoke" ? "graph_function" : "graph_function?target.kind=graph_function",
      "input_contract",
      "session_policy",
      "actor",
      "transport_steering",
    ];
  }
  if (operationId === "abg.operation.run.continue") {
    return [
      ...bound,
      "catalog_scope",
      "execution_program",
      "graph_function",
      "input_contract",
      "session_policy",
      "actor",
      "transport_steering",
      "execution_basis",
    ];
  }
  if (["abg.operation.interaction.respond", "abg.operation.result.assess"].includes(operationId)) {
    return [...bound, "actor", "execution_basis"];
  }
  if (operationId === "abg.operation.witness.admit") {
    return [
      ...bound,
      "actor",
      ...(["intake", "run-resumed", "run-stopped"].includes(memberKey)
        ? ["execution_basis"]
        : []),
    ];
  }
  if ([
    "abg.operation.conformance.evaluate",
    "abg.operation.product.materialize",
    "abg.operation.release.snapshot",
  ].includes(operationId)) return [...bound, "actor"];
  assert.fail(`unclassified authority vector ${operationId}/${memberKey}`);
}

function renderedSlot(requirement) {
  if (typeof requirement === "string") return requirement;
  const path = requirement.requiredWhen.requestPath.join(".");
  return `${requirement.slot}?${path}=${requirement.requiredWhen.equalsAny.join("|")}`;
}

test("one owner source relation derives the exact frozen 18/56 key set", () => {
  assert.equal(OWNER_CONTRACT_SOURCES.length, 56);
  assert.equal(Object.keys(OWNER_CONTRACT_SOURCE_MAP).length, 18);
  assert.equal(OWNER_CONTRACT_KEY_SET_DIGEST, EXACT_OWNER_CONTRACT_KEY_SET_DIGEST);
  assert.equal(new Set(OWNER_CONTRACT_SOURCES.map(({ memberDigest }) =>
    memberDigest)).size, 56);
  for (const source of OWNER_CONTRACT_SOURCES) {
    assert.match(source.packet.owner.authorityDigest, /^sha256:[0-9a-f]{64}$/);
    assert.match(source.memberDigest, /^sha256:[0-9a-f]{64}$/);
    assert.match(source.nativeSchemaIdentities.request, /^sha256:[0-9a-f]{64}$/);
    assert.match(source.nativeSchemaIdentities.result, /^sha256:[0-9a-f]{64}$/);
    assert.match(source.nativeSchemaIdentities.refusal, /^sha256:[0-9a-f]{64}$/);
  }
});

test("every owner module source is present and content-addressed", () => {
  for (const { sourceModulePath } of OWNER_CONTRACT_MODULE_SOURCES) {
    const bytes = readFileSync(join(root, "code/src", sourceModulePath));
    assert.match(sha256Bytes(bytes), /^sha256:[0-9a-f]{64}$/);
  }
});

test("all 56 packets preserve exact capability and authority-slot vectors", () => {
  for (const { packet: selected } of OWNER_CONTRACT_SOURCES) {
    const { operationId, memberKey } = selected.definitionKey;
    assert.deepEqual(
      selected.metadata.capabilityRefs,
      capabilityRefs(operationId, memberKey),
      `${operationId}/${memberKey} capabilities`,
    );
    assert.deepEqual(
      selected.metadata.authoritySlotRequirements.map(renderedSlot),
      slots(operationId, memberKey),
      `${operationId}/${memberKey} authority slots`,
    );
    assert.equal(
      selected.owner.authorityDigest,
      ownerAuthorityDigest(selected.owner.authorityRef),
      `${operationId}/${memberKey} authority digest`,
    );
  }
});

test("D01-D15 strict native requests admit their accepted representative", () => {
  for (const [family, selected, request] of representativeRequests) {
    assert.deepEqual(
      admitRuntimeContract(selected.requestSchema, request),
      { disposition: "admitted", value: request },
      family,
    );
  }
});

test("D01-D15 reject the superseded wrapper and construction-issue shapes", () => {
  for (const [family, selected, request] of representativeRequests) {
    assert.equal(admitRuntimeContract(selected.requestSchema, {
      kind: "owner_operation_packet",
      schemaVersion: "5.0.0",
      memberKey: selected.definitionKey.memberKey,
      request,
    }).disposition, "refused", `${family} wrapper`);
    assert.equal(admitRuntimeContract(selected.refusalSchema, {
      kind: "owner_operation_refusal",
      schemaVersion: "5.0.0",
      disposition: "construction_issue",
      code: "not_implemented",
      message: "superseded",
    }).disposition, "refused", `${family} construction issue`);
  }
});

test("all 56 result contracts project closed schemas rather than open JSON", () => {
  for (const { packet: selected } of OWNER_CONTRACT_SOURCES) {
    const schema = projectStrictJsonSchema(selected.resultSchema);
    assert.equal(
      containsOpenObjectSchema(schema),
      false,
      `${selected.definitionKey.operationId}/${selected.definitionKey.memberKey}`,
    );
  }
});

function ownerIdentity(source, slot) {
  const contractId = slot === "non_terminal"
    ? source.packet.contractIds.nonTerminal
    : source.packet.contractIds[slot];
  const nativeSchemaIdentity = slot === "non_terminal"
    ? source.nativeSchemaIdentities.nonTerminal
    : source.nativeSchemaIdentities[slot];
  assert.ok(contractId);
  assert.ok(nativeSchemaIdentity);
  return {
    definitionKey: source.packet.definitionKey,
    slot,
    contractId,
    contractVersion: "5.0.0",
    ownerAuthorityRef: source.packet.owner.authorityRef,
    ownerAuthorityDigest: source.packet.owner.authorityDigest,
    nativeSchemaIdentity,
  };
}

function declaredDefinition(source) {
  return {
    definitionKey: source.packet.definitionKey,
    requestContract: ownerIdentity(source, "request"),
    resultContract: ownerIdentity(source, "result"),
    refusalContract: ownerIdentity(source, "refusal"),
    nonTerminalContract: source.packet.nonTerminalSchema === null
      ? null
      : ownerIdentity(source, "non_terminal"),
  };
}

function pfcF08aFixture() {
  const declaredFamily = OWNER_CONTRACT_SOURCES.map(declaredDefinition);
  const byOperation = new Map();
  for (const definition of declaredFamily) {
    const operationId = definition.definitionKey.operationId;
    byOperation.set(operationId, [
      ...(byOperation.get(operationId) ?? []),
      definition,
    ]);
  }
  const assets = [...byOperation.entries()].map(([operationId, definitions]) => {
    const projectedDefinitions = definitions.map((definition, memberIndex) => {
      const prefix = `#/$defs/member_${memberIndex}`;
      return {
        definitionKey: definition.definitionKey,
        requestContract: {
          identity: definition.requestContract,
          definitionRef: `${prefix}_request`,
        },
        resultContract: {
          identity: definition.resultContract,
          definitionRef: `${prefix}_result`,
        },
        refusalContract: {
          identity: definition.refusalContract,
          definitionRef: `${prefix}_refusal`,
        },
        nonTerminalContract: definition.nonTerminalContract === null
          ? null
          : {
            identity: definition.nonTerminalContract,
            definitionRef: `${prefix}_non_terminal`,
          },
      };
    });
    const body = {
      rowKind: "public_operation_contract",
      operationId,
      operationVersion: "5.0.0",
      definitions: projectedDefinitions,
    };
    const rowDigest = sha256Canonical(body);
    const projection = {
      rowKind: body.rowKind,
      rowRef: `public-operation-contract://${rowDigest.slice(7)}`,
      rowDigest,
      operationId,
      operationVersion: body.operationVersion,
      definitions: projectedDefinitions,
    };
    return { payloadDigest: sha256Canonical(projection), projection };
  });
  const coordinate = {
    productId: "product://abiogenesis/typescript-tenant@5",
    productContentDigest: sha256Canonical({ content: "verified" }),
    catalogId: "catalog://abiogenesis/public-contracts@5",
    catalogVersion: "5.0.0",
    catalogDigest: sha256Canonical({ catalog: "verified" }),
  };
  const catalogBasis = {
    coordinate,
    rows: assets.map(({ payloadDigest, projection }) => ({
      contractId: projection.operationId,
      contractVersion: "5.0.0",
      contractDigest: projection.rowDigest,
      owningProduct: coordinate.productId,
      assetLocator: { contentDigest: payloadDigest },
    })),
  };
  return { declaredFamily, assets, catalogBasis };
}

function refreshPfcF08aAsset(fixture, index) {
  const projection = fixture.assets[index].projection;
  const body = {
    rowKind: projection.rowKind,
    operationId: projection.operationId,
    operationVersion: projection.operationVersion,
    definitions: projection.definitions,
  };
  projection.rowDigest = sha256Canonical(body);
  projection.rowRef = `public-operation-contract://${projection.rowDigest.slice(7)}`;
  fixture.assets[index].payloadDigest = sha256Canonical(projection);
  const catalogRow = fixture.catalogBasis.rows.find(
    ({ contractId }) => contractId === projection.operationId,
  );
  catalogRow.contractDigest = projection.rowDigest;
  catalogRow.assetLocator.contentDigest = fixture.assets[index].payloadDigest;
}

test("D04 PFC-F08A constructs one complete nested map from family projections", () => {
  const { declaredFamily, assets, catalogBasis } = pfcF08aFixture();
  const result = joinExpectedOwnerContractSet(
    declaredFamily,
    assets,
    catalogBasis,
  );
  assert.equal("kind" in result, false, JSON.stringify(result));
  assert.equal(result.operations.length, 18);
  assert.equal(
    result.operations.flatMap(({ members }) => members).length,
    56,
  );
  assert.equal(
    admitRuntimeContract(
      packet("abg.operation.product.verify", "verify").resultSchema,
      {
        targetKind: "packed_artifact",
        disposition: "locally_verified",
        verifiedArtifact: rd("verified-artifact://accepted"),
        localNativeEvidence: rd("native-evidence://accepted"),
        pendingExternalSelectors: [],
        definitionContractCoordinates: result,
        residuals: [],
        provenance: evidence,
      },
    ).disposition,
    "admitted",
  );
});

test("D04 PFC-F08A refuses partial, extra and cross-slot projections", () => {
  const fixture = pfcF08aFixture();
  assert.equal(
    joinExpectedOwnerContractSet(
      fixture.declaredFamily,
      fixture.assets.slice(1),
      fixture.catalogBasis,
    ).kind,
    "product_contract_binding_refusal",
  );

  const extra = structuredClone(fixture.assets);
  extra[0].projection.definitions.push({
    ...extra[0].projection.definitions[0],
    definitionKey: {
      operationId: extra[0].projection.operationId,
      memberKey: "extra",
    },
  });
  const extraFixture = {
    ...fixture,
    assets: extra,
    catalogBasis: structuredClone(fixture.catalogBasis),
  };
  refreshPfcF08aAsset(extraFixture, 0);
  assert.equal(
    joinExpectedOwnerContractSet(
      fixture.declaredFamily,
      extraFixture.assets,
      extraFixture.catalogBasis,
    ).kind,
    "product_contract_binding_refusal",
  );

  const crossed = structuredClone(fixture.assets);
  const definition = crossed[0].projection.definitions[0];
  [definition.requestContract, definition.resultContract] =
    [definition.resultContract, definition.requestContract];
  const crossedFixture = {
    ...fixture,
    assets: crossed,
    catalogBasis: structuredClone(fixture.catalogBasis),
  };
  refreshPfcF08aAsset(crossedFixture, 0);
  assert.equal(
    joinExpectedOwnerContractSet(
      fixture.declaredFamily,
      crossedFixture.assets,
      crossedFixture.catalogBasis,
    ).kind,
    "product_contract_binding_refusal",
  );
});

function nativeClosureFixture() {
  const targetBody = {
    targetProductContentDigest: sha256Canonical({ product: "target" }),
    targetPackageName: "@example/target",
    targetPackageExportPath: ".",
    targetExportedSymbol: "TargetContract",
    requiredSymbolSpace: "type",
    boundaryDeclarationWitnesses: [{
      declarationPath: "dist/index.d.ts",
      declarationDigest: sha256Canonical({ declaration: "target" }),
      declarationKind: "interface",
      exportedName: "TargetContract",
    }],
  };
  const checkerTarget = {
    ...targetBody,
    targetIdentityDigest: sha256Canonical(targetBody),
  };
  const witnessBody = {
    selectorRef: sha256Canonical({ selector: "source" }),
    physicalRelationRef: "ts-relation://source",
    declarationPath: "dist/source.d.ts",
    declarationDigest: sha256Canonical({ declaration: "source" }),
    sourceStart: 10,
    sourceEnd: 20,
    origin: {
      kind: "import_declaration",
      clause: "named",
      declarationTypeOnly: true,
      specifierTypeOnly: true,
    },
    selection: {
      kind: "name",
      targetName: "TargetContract",
      exposedName: "TargetContract",
    },
  };
  const witness = {
    witnessDigest: sha256Canonical(witnessBody),
    ...witnessBody,
  };
  const occurrenceBody = {
    sourceProductContentDigest: sha256Canonical({ product: "source" }),
    sourceContractRef: "contract://source/public",
    sourceContractDigest: sha256Canonical({ contract: "source" }),
    sourcePackageExportPath: ".",
    sourceNamedSymbol: "SourceContract",
    sourceWitnesses: [witness],
    semanticSelection: {
      derivation: "named",
      targetExportedSymbol: "TargetContract",
      exposedMemberPath: ["TargetContract"],
      semanticUse: "type_reference",
      requiredSymbolSpace: "type",
    },
    checkerTarget,
  };
  const occurrence = {
    occurrenceRef: sha256Canonical(occurrenceBody),
    ...occurrenceBody,
  };
  const binding = {
    kind: "external_binding",
    sourceOccurrenceRef: occurrence.occurrenceRef,
    directDependencyEdge: {
      kind: "requires",
      productId: "product://target",
      packageVersion: "1.0.0",
      compatibilityRef: "compatibility://target/1",
      requiredContractRefs: ["contract://target/public"],
      requiredCapabilityRefs: [],
    },
    targetProductContentDigest: checkerTarget.targetProductContentDigest,
    targetContractRef: "contract://target/public",
    targetContractDigest: sha256Canonical({ contract: "target" }),
    targetPackageExportPath: checkerTarget.targetPackageExportPath,
    targetNamedSymbol: checkerTarget.targetExportedSymbol,
    checkerTarget,
  };
  return {
    selectorRef: witness.selectorRef,
    value: {
      selectorDispositions: [{
        kind: "semantic_occurrences",
        selectorRef: witness.selectorRef,
        occurrenceRefs: [occurrence.occurrenceRef],
      }],
      occurrences: [occurrence],
      nativeBindings: [binding],
    },
  };
}

test("D05 admits complete semantic occurrence closure and rejects legacy rows", () => {
  const fixture = nativeClosureFixture();
  assert.equal(
    admitResolvedNativeContractClosure([fixture.selectorRef], fixture.value)
      .disposition,
    "admitted",
  );
  assert.equal(admitRuntimeContract(resolvedNativeContractBindingSchema, {
    kind: "external_binding",
    sourceProductContentDigest: digest,
    sourceContractRef: "contract://legacy",
    sourcePackageExportPath: ".",
    sourceDeclarationPath: "legacy.d.ts",
    sourceDeclarationDigest: digest,
    occurrenceRef: "legacy-occurrence",
    moduleSpecifier: "@legacy/module",
    selectorKind: "name",
    selectedName: "Legacy",
    targetProductContentDigest: digest,
    targetContractRef: "contract://target",
    targetPackageExportPath: ".",
    targetNamedSymbol: "Target",
  }).disposition, "refused");
});

test("D05 refuses missing, surplus and forged occurrence bindings", () => {
  const fixture = nativeClosureFixture();
  const missing = structuredClone(fixture.value);
  missing.nativeBindings = [];
  assert.equal(
    admitResolvedNativeContractClosure([fixture.selectorRef], missing).disposition,
    "refused",
  );
  const surplus = structuredClone(fixture.value);
  surplus.nativeBindings.push({
    ...surplus.nativeBindings[0],
    sourceOccurrenceRef: sha256Canonical({ occurrence: "surplus" }),
  });
  assert.equal(
    admitResolvedNativeContractClosure([fixture.selectorRef], surplus).disposition,
    "refused",
  );
  const forged = structuredClone(fixture.value);
  forged.nativeBindings[0].checkerTarget.targetIdentityDigest = digest;
  assert.equal(
    admitResolvedNativeContractClosure([fixture.selectorRef], forged).disposition,
    "refused",
  );
});

function catalogInputRow(suffix) {
  return {
    descriptorRef: `descriptor://${suffix}`,
    descriptorDigest: sha256Canonical({ descriptor: suffix }),
    contributionManifestRef: `contribution-manifest://${suffix}`,
    contributionManifestDigest: sha256Canonical({ manifest: suffix }),
    contributionRowRef: `contribution-row://${suffix}`,
    contributionRowDigest: sha256Canonical({ row: suffix }),
  };
}

function admittedCatalogRow(inputRowKey, suffix) {
  return {
    disposition: "admitted",
    inputRowKey,
    subject: rd(`catalog-subject://${suffix}`),
    readinessBasis: rd(`catalog-basis://${suffix}`),
    evidence: [rd(`evidence://${suffix}`)],
    provenance: [rd(`provenance://${suffix}`)],
  };
}

test("D07 admits disjoint eventless rows only under exact conservation", () => {
  const input = [catalogInputRow("one"), catalogInputRow("two")];
  const result = {
    catalog: rd("catalog://accepted"),
    rows: input.map((row, index) => admittedCatalogRow(row, String(index))),
    conservation: constructCatalogAdmissionConservationWitness(input),
  };
  assert.equal(admitCatalogAdmissionResult(input, result).disposition, "admitted");

  const missing = structuredClone(result);
  missing.rows.pop();
  assert.equal(admitCatalogAdmissionResult(input, missing).disposition, "refused");

  const substituted = structuredClone(result);
  substituted.rows[1].inputRowKey = catalogInputRow("substituted");
  assert.equal(
    admitCatalogAdmissionResult(input, substituted).disposition,
    "refused",
  );
});

test("D07 rejects legacy flat and nullable-reason catalog rows", () => {
  const selected = packet("abg.operation.catalog.admit", "admit");
  const input = [catalogInputRow("one")];
  const base = {
    catalog: rd("catalog://accepted"),
    conservation: constructCatalogAdmissionConservationWitness(input),
  };
  assert.equal(admitRuntimeContract(selected.resultSchema, {
    ...base,
    rows: [{
      handle: "graph-function://legacy",
      owningProductId: "product://legacy",
      moduleRef: "module://legacy",
      disposition: "admitted",
      readiness: "ready",
      reason: null,
      readinessPrerequisiteRefs: [],
      rowDigest: digest,
    }],
  }).disposition, "refused");
  assert.equal(admitRuntimeContract(selected.resultSchema, {
    ...base,
    rows: [{ ...admittedCatalogRow(input[0], "one"), reason: null }],
  }).disposition, "refused");
  assert.equal(admitRuntimeContract(selected.resultSchema, {
    ...base,
    rows: [{
      ...admittedCatalogRow(input[0], "one"),
      disposition: "rejected",
    }],
  }).disposition, "refused");
});

test("D15 owner callable uses accepted refusal algebra without gate_incomplete", async () => {
  const published = await ReleaseSnapshotPort.published_rc({
    request: {
      qualificationBasis: releaseBasis,
      lawBasis: releaseLawBasis,
      verdict: releaseVerdict,
      requestedIdentity: releaseIdentity,
    },
  });
  assert.equal(published.outcomeKind, "refusal");
  assert.equal(published.value.code, "basis_mismatch");
  assert.notEqual(published.value.code, "gate_incomplete");

  const finalBasisValue = { candidate: "wave5-final-tap-absent" };
  const finalBasis = {
    ...releaseBasis,
    subjectKind: "final_tap_candidate",
    basisRef: "qualification-basis://wave5/final-tap-absent",
    basisDigest: sha256Canonical(finalBasisValue),
    basis: finalBasisValue,
  };
  const finalVerdictBody = {
    ...releaseVerdictBody,
    qualificationBasisRef: finalBasis.basisRef,
    qualificationBasisDigest: finalBasis.basisDigest,
  };
  const finalVerdict = {
    ...releaseVerdict,
    verdictRef: "qualification-verdict://wave5/final-tap-absent",
    verdictDigest: sha256Canonical(finalVerdictBody),
    ...finalVerdictBody,
  };
  const releaseEvidence = (ref, value) => ({
    ref,
    digest: sha256Canonical(value),
    value,
  });
  const tapped = await ReleaseSnapshotPort.tapped_release({
    request: {
      finalTapBasis: finalBasis,
      lawBasis: releaseLawBasis,
      verdict: finalVerdict,
      requestedIdentity: releaseIdentity,
      acceptedRc: releaseEvidence("release-cut://accepted-rc", { rc: true }),
      installedRcQualification: releaseEvidence(
        "qualification://installed-rc/absent",
        { installed: false },
      ),
      finalTapDelta: releaseEvidence("final-tap-delta://empty", { paths: [] }),
    },
  });
  assert.equal(tapped.outcomeKind, "refusal");
  assert.equal(tapped.value.code, "installed_rc_authorization_missing");
  assert.notEqual(tapped.value.code, "gate_incomplete");
  assert.equal(
    JSON.stringify(projectStrictJsonSchema(
      packet("abg.operation.release.snapshot", "published_rc").refusalSchema,
    )).includes("gate_incomplete"),
    false,
  );
});
