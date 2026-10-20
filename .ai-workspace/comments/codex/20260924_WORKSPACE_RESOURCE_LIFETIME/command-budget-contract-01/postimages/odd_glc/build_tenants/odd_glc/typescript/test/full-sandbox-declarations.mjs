import { constructOddGlcProductPackage } from "../src/product-package.mjs";
// Pure generic package declaration and external ordinary-input preparation.
// Runtime owners, source derivation and every effect remain installed ABI APIs.
import assert from "node:assert/strict";
import { D1_WITNESS_IDS, constructD1WorksiteGraph, materializeD1Publication } from "./d1-lifecycle-declarations.mjs";
import { constructNativeLifecyclePublication, constructNativeLifecycleEnvironmentRoles, constructFreshNativeLifecyclePublication, constructFreshNativeLifecycleEnvironmentRoles } from "../src/native-lifecycle-declarations.mjs";

export const FULL_SANDBOX_IDS = Object.freeze({ ...D1_WITNESS_IDS,
  packageName: "@odd-glc/route-one-typescript", packageVersion: "0.2.0-dev.2",
  productId: "product://odd_glc/route-one-typescript@0.2.0-dev.2",
  descriptorRef: "descriptor://odd_glc/route-one-typescript@0.2.0-dev.2",
  contributionManifestRef: "contribution-manifest://odd_glc/route-one-typescript@0.2.0-dev.2",
  catalogRef: "catalog://odd_glc/public-contracts@0.2.0-dev.2",
  provenanceRef: "provenance://odd_glc/route-one-typescript@0.2.0-dev.2",
});
// Independent evaluation/source interpretation only; never passed to packaging.
export const FULL_HELLO_TARGETS = Object.freeze([
  ["specification/project-conformance.md", "configuration"], ["design/implementation-design.md", "configuration"],
  ["generated/hello-world.mjs", "implementation"], ["design/test-design.md", "configuration"],
  ["test/component/hello-cli.test.mjs", "verifier"], ["test/uat/hello-cli.uat.test.mjs", "verifier"],
  ["test-execution-plan.json", "configuration"],
].map(row => Object.freeze(row)));
export const FULL_HELLO_STAGE_MEANINGS = Object.freeze([
  "conformance_project", "implementation_design", "source", "test_design",
  "component_test_source", "uat_test_source", "test_execution_plan", "test_execution_result",
]);

// Exact original caller inputs, not Program declarations or runtime authority.
export const FULL_HELLO_CASES = Object.freeze(Object.fromEntries([
  ["basic-cli", "CLI-BASIC", "ce602ce2cc0fcefaba288623a675a770d11bc14d224b90045aebbe031330172f"],
  ["js-tenant-test", "JS-TENANT-TEST", "3dcf38f9d4e0ddbbdc2124d3b0deeb2aa87a1b7a2284ef0246a7e2ebfdade7b9"],
  ["js-sdlc-bootstrap", "JS-SDLC-BOOTSTRAP", "c799b9e43d660f3abc3adf0da32baab17a771f1efe20843c4688162b9e62ced4"],
  ["rust-cli", "RUST-CLI", "d6f2ffff4e3ae4889be374367208a575664eb9b094c442d7ca303ebaa9ad6a81"],
  ["rust-service", "RUST-SERVICE", "a50c11d4e4eee0dc1e983c484cd2733bd665409b5c0cadfa545596e43574cb5d"],
  ["parallel-js", "PARALLEL-JS", "d8cc8105e4d16eea10fa8f908656a2c82e5690fc145cfb91e70ed00f84aa6053"],
].map(([key, suffix, digest]) => [key, Object.freeze({ scenarioId: "SCN-GLC-HELLO-WORLD-" + suffix, sourceDigest: "sha256:" + digest })])));

export function selectOriginalHelloDeclaration(sourceBytes, product, key = "basic-cli") {
  assert.ok(Object.hasOwn(FULL_HELLO_CASES, key), "known original full Hello key");
  const text = sourceBytes.toString("utf8"), marker = '  sdlcComplianceScenario({\n    key: "' + key + '",';
  const start = text.indexOf(marker), end = text.indexOf('\n  sdlcComplianceScenario({', start + marker.length);
  assert.ok(start >= 0 && end > start && text.indexOf(marker, start + 1) === -1, "one original " + key + " declaration");
  const selected = Buffer.from(text.slice(start, end));
  assert.equal(product.sha256Bytes(selected), FULL_HELLO_CASES[key].sourceDigest, "unchanged original " + key + " declaration");
  for (const stage of FULL_HELLO_STAGE_MEANINGS) assert.ok(selected.includes('stage: "' + stage + '"'), "original " + stage + " retained");
  return { bytes: selected, provenance: { path: "build_tenants/odd_glc/typescript/test/glc-software-build-overlay-live.test.mjs",
    wholeFileDigest: product.sha256Bytes(sourceBytes), startByte: Buffer.byteLength(text.slice(0, start)),
    endByte: Buffer.byteLength(text.slice(0, end)), selectedDigest: product.sha256Bytes(selected) } };
}

export function nativeFullSandboxPublications(gtl, artifact, freshNative = false) {
  const basis = { ...artifact, productManifestDigest: artifact.manifestDigest };
  return [gtl.constructHelloWorldModulePublication, gtl.constructConsensusModulePublication,
    gtl.constructWorksiteConstructionModulePublication, gtl.constructWorksiteCommandExecutionModulePublication,
    gtl.constructWorksiteCommandForwardModulePublication, gtl.constructRequirementHandoffModulePublication,
    gtl.constructSemanticStageModulePublication, gtl.constructSemanticRevisionModulePublication,
    gtl.constructSelfConformanceModulePublication, ...(freshNative ? [gtl.constructNativeWorkspaceWorkModulePublication] : [])].map(construct => construct(basis));
}

export function constructFullHelloInputs({ product, originalSourceBytes, oracle, key = "basic-cli" }) {
  const original = selectOriginalHelloDeclaration(originalSourceBytes, product, key), scenarioId = FULL_HELLO_CASES[key].scenarioId;
  assert.equal(oracle.scenarioId, scenarioId, "oracle belongs to the selected original case");
  if (oracle.sourceSelection !== undefined) {
    assert.equal(oracle.sourceSelection.key, key, "oracle source key");
    assert.equal(oracle.sourceSelection.digest, original.provenance.selectedDigest, "oracle exact original source");
  }
  return { key, scenarioId, original,
    members: [{ memberRef: "urn:" + original.provenance.selectedDigest, path: "original-" + key + "-declaration.txt",
      sourceLocator: "repo://odd_glc/" + original.provenance.path + "#bytes=" + original.provenance.startByte + "-" + original.provenance.endByte,
      base64: original.bytes.toString("base64") }],
    taskData: { scenarioId, originalSource: original.provenance,
      request: "Implement the complete selected original source. Preserve all source obligations and unresolved meaning. The predecessor vector mechanism is not runtime authority: use the current native lifecycle. Admitted native execution and Evidence replace the old hand-written execution-result representation; do not prewrite claimed execution success." },
    evaluationData: structuredClone(oracle) };
}

export function constructOrdinaryJobInput({ product, gtl, input, executable, executableCapabilities, lifecycle, commandExecutionLimits }) {
  return product.constructSemanticJobInput({ kind: "semantic_job_input", schemaVersion: "5.0.0",
    lifecycleRef: FULL_SANDBOX_IDS.lifecycleDeclarationRef, sourceRoleRef: gtl.SEMANTIC_STAGE_IDS.jobSourceContextRoleRef,
    members: structuredClone(input.members), taskData: { ...structuredClone(input.taskData), ...(lifecycle === undefined ? {} : { nativeLifecycle: {
      assets: lifecycle.stages.map((stage, i) => ({ stageRef: stage.declarationRef, path: `semantic-assets/stage-${i}.json` })),
      rubricPath: "semantic-assets/lifecycle-rubric.json",
      ...(commandExecutionLimits === undefined ? {} : { commandExecutionLimits: structuredClone(commandExecutionLimits) }) } }) }, evaluationData: structuredClone(input.evaluationData),
    worksiteScope: { readRoots: ["."], writeRoots: ["."], parentWriteRoots: ["."], evidenceWriteRoots: ["execution-evidence"],
      executableCapabilities: structuredClone(executableCapabilities ?? [{ executable, relativeCwdRoots: ["."], environment: {}, maxTimeoutMs: 120000, maxTerminationGraceMs: 1000 }]) } });
}

export const FULL_SANDBOX_MANAGEMENT_SOURCE_BASIS = "stdo://releases/v2.5.0-rc.7/";
export const FULL_SANDBOX_MANAGEMENT_SOURCE_MANIFEST = "sha256:1f56029380604b0879fe322047fa8b38060297ba86b54bc8db8450d01ec034ae";
export const FULL_SANDBOX_MANAGEMENT_PATHS = Object.freeze([
  "standards/STDO_REFERENCE_FRAME_BASELINE.md", "standards/SPEC_METHOD.md", "standards/DESIGN_MODULE_METHOD.md",
  "specification/requirements/REQ-GLC-LIFECYCLE-VOCABULARY-ASSETS.md",
  "specification/requirements/REQ-GLC-ABG-REQUIREMENTS-ALGEBRA-CONSUMPTION.md",
]);

// Preparation-time exact selection only. Runtime physical observation and
// prompt assembly remain ABI owners; this is not an applicability interpreter.
export function fullSandboxExactSection(bytes, heading) {
  const text = bytes.toString("utf8"), headings = [...text.matchAll(/^(#{1,6}) (.+)\r?$/gmu)];
  const matches = headings.filter(row => row[2] === heading);
  assert.equal(matches.length, 1, "one complete owning section: " + heading);
  const selected = matches[0], following = headings.find(row => row.index > selected.index && row[1].length <= selected[1].length);
  return { startByte: Buffer.byteLength(text.slice(0, selected.index)),
    endByte: following === undefined ? bytes.length : Buffer.byteLength(text.slice(0, following.index)) };
}

export function fullSandboxManagementSourceSelections({ product, contexts, contextContents, sourceBasisRef }) {
  const bound = path => {
    const matches = contexts.flatMap(context => context.members.filter(member => member.path === path).map(member => ({ context, member })));
    assert.equal(matches.length, 1, "one exact Context member for " + path);
    const { context, member } = matches[0], bytes = Buffer.from(contextContents[member.memberRef] ?? []);
    assert.equal(bytes.length, member.byteCount, "complete source bytes for " + path);
    assert.equal(product.sha256Bytes(bytes), member.digest, "exact source bytes for " + path);
    return { context, member, bytes, text: bytes.toString("utf8") };
  };
  const bind = (source, span) => ({ contextRef: source.context.contextRef, memberRef: source.member.memberRef,
    memberDigest: source.member.digest, ...span, spanDigest: product.sha256Bytes(source.bytes.subarray(span.startByte, span.endByte)) });
  const section = (source, title) => bind(source, fullSandboxExactSection(source.bytes, title));
  const frame = bound(FULL_SANDBOX_MANAGEMENT_PATHS[0]), spec = bound(FULL_SANDBOX_MANAGEMENT_PATHS[1]);
  const design = bound(FULL_SANDBOX_MANAGEMENT_PATHS[2]);
  assert.equal(frame.context.sourceLocator, sourceBasisRef);
  assert.equal(spec.context.sourceLocator, sourceBasisRef);
  assert.equal(design.context.sourceLocator, sourceBasisRef);
  const family = fullSandboxExactSection(frame.bytes, "Derived Generic Specialist Frame Set");
  const familyText = frame.bytes.subarray(family.startByte, family.endByte).toString("utf8");
  const rows = [...familyText.matchAll(/^\| \*\*([^*]+)\*\* \|.*\r?\n/gmu)];
  assert.ok(rows.length > 0, "complete source-owned specialist rows");
  const frameSpan = (start, end) => bind(frame, { startByte: family.startByte + Buffer.byteLength(familyText.slice(0, start)),
    endByte: family.startByte + Buffer.byteLength(familyText.slice(0, end)) });
  const boundaries = [frameSpan(0, rows[0].index), frameSpan(rows.at(-1).index + rows.at(-1)[0].length, familyText.length)];
  const specialist = name => {
    const selected = rows.filter(row => row[1] === name); assert.equal(selected.length, 1, "one specialist row " + name);
    return frameSpan(selected[0].index, selected[0].index + selected[0][0].length);
  };
  const clauses = (source, prefix, ordinals) => ordinals.map(ordinal => {
    const marker = `**${prefix}-${String(ordinal).padStart(3, "0")}**:`, start = source.text.indexOf(marker);
    assert.ok(start >= 0 && source.text.indexOf(marker, start + marker.length) < 0, "one complete generic clause " + marker);
    const next = source.text.indexOf("\n**" + prefix + "-", start + marker.length);
    const heading = source.text.indexOf("\n## ", start + marker.length);
    const end = Math.min(...[next, heading, source.text.length].filter(value => value >= 0));
    return bind(source, { startByte: Buffer.byteLength(source.text.slice(0, start)), endByte: Buffer.byteLength(source.text.slice(0, end)) });
  });
  const local = [
    ...clauses(bound(FULL_SANDBOX_MANAGEMENT_PATHS[3]), "REQ-GLC-LIFECYCLE-VOCABULARY-ASSETS", [1, 2, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24]),
    ...clauses(bound(FULL_SANDBOX_MANAGEMENT_PATHS[4]), "REQ-GLC-ABG-REQUIREMENTS-ALGEBRA-CONSUMPTION", [4, 8, 12, 15, 16, 17, 18, 19, 20, 21]),
  ];
  const productSpans = [section(spec, "Reconstruction Litmus"), specialist("Product")];
  const designSpans = [section(spec, "Design Rule"), section(design, "Decision-Complete Symbolic Design"), specialist("Design")];
  const evidenceSpans = [section(spec, "Proof Target Identity And Adequacy (`STDO-UP-001`)"),
    section(spec, "Semantic, Evidence, And Projection Separation (`STDO-UP-008`)"), specialist("Proof")];
  return { common: [section(spec, "Constitutional Chain"), section(spec, "Probabilistic Work Boundary"), ...boundaries, ...local],
    worker: [section(frame, "Derived Worker Frame")], reviewer: [section(frame, "Derived Reviewer Frame")],
    intent: productSpans, product: productSpans, requirements: [...productSpans, section(spec, "Requirement Categories")],
    design: designSpans, construction: [...designSpans, specialist("Effect")], evidence: evidenceSpans,
    execution: [...evidenceSpans, specialist("Effect")] };
}

/** Author exact cohort/role declaration data through the native constructor.
 * environmentBasis supplies native declaration fields except roles; contents
 * supplies full immutable Context member bytes for exact source-span selection.
 */
export function constructFullSandboxManagementEnvironment({ product, gtl, abiArtifact, environmentBasis, contextContents, freshNative = false, ids = FULL_SANDBOX_IDS }) {
  const nativePublications = nativeFullSandboxPublications(gtl, abiArtifact, freshNative);
  const publication = constructFullSandboxPackage({ product, gtl, abiArtifact, freshNative, ids }).bundle.consumerPublication;
  const sourceDependencies = environmentBasis.dependencies.filter(row => row.dependencyRef === environmentBasis.corpusAccess.sourceDependencyRef);
  assert.equal(sourceDependencies.length, 1, "one explicitly selected source dependency");
  const sourceBasisRef = sourceDependencies[0].basisRef;
  const sourceSelections = fullSandboxManagementSourceSelections({ product, contexts: environmentBasis.contexts, contextContents, sourceBasisRef });
  const roles = (freshNative ? constructFreshNativeLifecycleEnvironmentRoles : constructNativeLifecycleEnvironmentRoles)({ gtl, product, publication, nativePublications, sourceSelections,
    accessRefs: environmentBasis.accesses.map(row => row.accessRef), sourceBasisRef });
  return gtl.constructStdoRunEnvironmentDeclaration({ ...environmentBasis, roles });
}

// Exactly one generic package. This function deliberately has no job argument.
export function constructFullSandboxPackage({ product, gtl, abiArtifact, runEnvironment, freshNative = false, ids = FULL_SANDBOX_IDS }) {
  if (freshNative && (ids.packageVersion === FULL_SANDBOX_IDS.packageVersion || ids.productId === FULL_SANDBOX_IDS.productId)) throw new TypeError("fresh native composition requires an explicitly selected successor identity");
  const publications = nativeFullSandboxPublications(gtl, abiArtifact, freshNative);
  const one = ref => {
    const rows = publications.filter(row => row.moduleRef === ref);
    assert.equal(rows.length, 1, "one native module " + ref); return rows[0];
  };
  const semanticPublication = one(gtl.SEMANTIC_STAGE_IDS.moduleRef);
  const c1Publication = one(product.WORKSITE_CONSTRUCTION_IDS.moduleRef);
  const c2Publication = one(product.WORKSITE_COMMAND_EXECUTION_IDS.moduleRef);
  // Reuse the unchanged fixed-source witness's generic C1/C2 graph helper only.
  // Its source, fixture, lifecycle and package factories are not invoked.
  const worksite = constructD1WorksiteGraph({ gtl, product, c1Publication, c2Publication });
  const consumerPublication = freshNative ? constructFreshNativeLifecyclePublication({ gtl, product, ids, semanticPublication, runEnvironment }) : constructNativeLifecyclePublication({ gtl, product, ids,
    semanticPublication, c1Publication, c2Publication, worksite, runEnvironment });
  return constructOddGlcProductPackage({product,gtl,ids,abiArtifact,consumerPublication});
}
