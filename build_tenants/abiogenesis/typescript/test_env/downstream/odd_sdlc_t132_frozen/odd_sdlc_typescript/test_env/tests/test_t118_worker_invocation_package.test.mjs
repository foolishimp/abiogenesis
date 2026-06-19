// Validates: T-118

import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  statSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
  deriveWorkerHandoffManifest,
  hookContractByEdgeName,
  materializeSdlcProjectConformance,
  sha256Text,
  stableOperatorJson,
  writeHandoffFiles
} from "../../build/semantic/code/src/index.js";

function writeConstraints(root) {
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t118_invocation_package",
      "active_tenant: scala_spark",
      "build_tenants:",
      "  scala_spark:",
      "    output_dir: build_tenants/scala_spark",
      "    language: scala",
      "    build_tool: sbt",
      "    module_structure:",
      "      - invocation-core"
    ].join("\n"),
    "utf8"
  );
}

function workspaceWithLargeRequirementSurface() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t118-"));
  mkdirSync(path.join(root, "specification"), { recursive: true });
  writeConstraints(root);
  writeFileSync(
    path.join(root, "specification/INTENT.md"),
    "# Intent\n\nINT-118: prove compact worker package.\n",
    "utf8"
  );
  const longClause = "Preserve compact package law ".repeat(95);
  const requirements = ["# Requirements", ""];
  for (let index = 1; index <= 160; index += 1) {
    const id = String(index).padStart(3, "0");
    requirements.push(
      `REQ-T118-${id}: ${longClause}Requirement ${id} must remain traceable without requiring the worker to read the full forensic manifest first.`
    );
  }
  writeFileSync(
    path.join(root, "specification/REQUIREMENTS.md"),
    requirements.join("\n"),
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: root });
  return root;
}

function manifestForLargeSurface() {
  const contract = hookContractByEdgeName("derive_intent_surface");
  return deriveWorkerHandoffManifest({
    workspaceRoot: workspaceWithLargeRequirementSurface(),
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 0,
    contract,
    runId: "t118-worker-invocation-package"
  });
}

function manifestForWorkspaceSpecSurface(edgeName) {
  const contract = hookContractByEdgeName(edgeName);
  return deriveWorkerHandoffManifest({
    workspaceRoot: workspaceWithLargeRequirementSurface(),
    graphFunctionName: edgeName,
    edgeName: contract.edgeName,
    vectorIndex: 0,
    contract,
    runId: `t118-${edgeName}`
  });
}

function writeDeclaredProductFileTargetSurface(workspaceRoot) {
  writeFileSync(
    path.join(workspaceRoot, "specification/PRODUCT.md"),
    [
      "# Product",
      "",
      "## Expected Product Files",
      "",
      "- build_tenants/scala_spark/build.sbt role=build_config",
      "- build_tenants/scala_spark/src/main/scala/generated/App.scala role=source"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspaceRoot, ".ai-workspace/context/t118_expected_files.json"),
    JSON.stringify(
      {
        expectedFiles: [
          "build_tenants/scala_spark/build.sbt",
          "build_tenants/scala_spark/src/main/scala/generated/App.scala",
          "README.md"
        ]
      },
      null,
      2
    ),
    "utf8"
  );
}

function manifestWithDeclaredProductFileTargets() {
  const workspaceRoot = workspaceWithLargeRequirementSurface();
  writeDeclaredProductFileTargetSurface(workspaceRoot);
  const contract = hookContractByEdgeName("derive_component_code_surface");
  return deriveWorkerHandoffManifest({
    workspaceRoot,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    runId: "t118-declared-product-file-targets"
  });
}

function manifestForImplementationDesignSurface() {
  const workspaceRoot = workspaceWithLargeRequirementSurface();
  const contract = hookContractByEdgeName("derive_implementation_design_surface");
  return deriveWorkerHandoffManifest({
    workspaceRoot,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 0,
    contract,
    runId: "t118-implementation-design-depth"
  });
}

function manifestForImplementationDesignSurfaceWithNestedPredecessors() {
  const workspaceRoot = workspaceWithLargeRequirementSurface();
  mkdirSync(path.join(workspaceRoot, "build_tenants/scala_spark/design/adrs"), {
    recursive: true
  });
  for (let index = 1; index <= 20; index += 1) {
    writeFileSync(
      path.join(
        workspaceRoot,
        `build_tenants/scala_spark/design/00-distractor-${String(index).padStart(2, "0")}.md`
      ),
      `# Distractor ${index}\n\nThis file must not displace targeted predecessors from the compact handoff.\n`,
      "utf8"
    );
  }
  writeFileSync(
    path.join(
      workspaceRoot,
      "build_tenants/scala_spark/design/adrs/ADR-001-design-surface.md"
    ),
    "# Design Surface\n\nThis upstream design surface must not be targeted by implementation_design_surface substring matching.\n",
    "utf8"
  );
  writeFileSync(
    path.join(
      workspaceRoot,
      "build_tenants/scala_spark/design/adrs/ADR-002-implementation-design-surface.md"
    ),
    "# Implementation Design Surface\n\nThe composite implementation design carrier must derive from this admitted predecessor.\n",
    "utf8"
  );
  writeFileSync(
    path.join(workspaceRoot, "build_tenants/scala_spark/design/implementation_stack_profile.md"),
    "# Implementation Stack Profile\n\nUse Scala and sbt for the tenant implementation.\n",
    "utf8"
  );
  const contract = hookContractByEdgeName("derive_implementation_design_surface");
  return deriveWorkerHandoffManifest({
    workspaceRoot,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 0,
    contract,
    runId: "t118-implementation-design-nested-predecessor-hints"
  });
}

function manifestForDeclaredProductMaterialization() {
  const workspaceRoot = workspaceWithLargeRequirementSurface();
  writeDeclaredProductFileTargetSurface(workspaceRoot);
  const contract = hookContractByEdgeName(FG_MATERIALIZE_DECLARED_PRODUCT_ASSET);
  return deriveWorkerHandoffManifest({
    workspaceRoot,
    graphFunctionName: FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
    edgeName: contract.edgeName,
    vectorIndex: 0,
    contract,
    runId: "t118-first-pass-product-materialization"
  });
}

test("T-118 writes a compact worker invocation package while preserving the full manifest by reference", () => {
  const manifest = manifestForLargeSurface();
  const files = writeHandoffFiles(manifest);
  const relativeToWorkspace = (filePath) =>
    path.relative(manifest.workspaceRoot, filePath);
  const fullManifestSize = statSync(files.manifestPath).size;
  const invocationPackageSize = statSync(files.invocationPackagePath).size;
  const workerBriefSize = statSync(files.workerBriefPath).size;
  const invocationPackage = JSON.parse(
    readFileSync(files.invocationPackagePath, "utf8")
  );
  const workerBrief = JSON.parse(readFileSync(files.workerBriefPath, "utf8"));
  const constructionBrief = JSON.parse(
    readFileSync(files.constructionBriefPath, "utf8")
  );
  const escapedWorkspaceRoot = new RegExp(
    manifest.workspaceRoot.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"),
    "u"
  );
  const { packageDigest, ...digestBasis } = invocationPackage;

  assert(fullManifestSize > 256 * 1024);
  assert(invocationPackageSize < 40 * 1024);
  assert(workerBriefSize < 4 * 1024);
  assert.equal(invocationPackage.kind, "sdlc_worker_invocation_package");
  assert.equal(invocationPackage.packageVersion, "ts-invocation-v1");
  assert.equal(invocationPackage.manifestPath, relativeToWorkspace(files.manifestPath));
  assert.equal(
    invocationPackage.manifestRef,
    `workspace://${relativeToWorkspace(files.manifestPath)}`
  );
  assert.equal(path.isAbsolute(invocationPackage.manifestPath), false);
  assert.equal(invocationPackage.traversalIntentPackagePath.endsWith("traversal_intent_package.json"), true);
  assert.equal(
    invocationPackage.workCategoryGovernance.kind,
    "sdlc_work_category_governance_selection"
  );
  assert.equal(
    invocationPackage.workCategoryGovernance.selectionSource,
    "graph_function_catalog"
  );
  assert.equal(
    invocationPackage.workCategoryGovernance.workerPath,
    "node_modules/@odd-sdlc/typescript-tenant/config/work-category-governance/requirements_build.md"
  );
  assert(invocationPackage.transformAxioms.length >= 5);
  assert(invocationPackage.transformAxioms.some((axiom) => axiom.includes("F_P.transform only")));
  assert(invocationPackage.transformAxioms.some((axiom) => axiom.includes("Read boundary:")));
  assert(invocationPackage.outcomeDirectives.length > 0);
  assert(invocationPackage.outcomeDirectives.some((directive) => directive.includes("Outcome:")));
  assert.equal(
    invocationPackage.manifestDigest,
    sha256Text(readFileSync(files.manifestPath, "utf8"))
  );
  assert.equal(packageDigest, sha256Text(stableOperatorJson(digestBasis)));
  assert.equal(
    invocationPackage.outputContract.outputFile,
    relativeToWorkspace(manifest.outputFile)
  );
  assert.equal(
    invocationPackage.outputContract.reportFile,
    relativeToWorkspace(manifest.reportFile)
  );
  assert.deepEqual(invocationPackage.outputContract.declaredProductFileTargets, []);
  assert.deepStrictEqual(
    invocationPackage.allowedWriteRoots,
    manifest.allowedWriteRoots.map(relativeToWorkspace)
  );
  assert.equal(invocationPackage.retryFrontier.kind, "sdlc_worker_invocation_retry_frontier");
  assert(invocationPackage.inlineObligations.length <= 24);
  assert.equal(
    invocationPackage.inlineObligations.filter(
      (obligation) => obligation.obligationKind === "requirement"
    ).length,
    12
  );
  assert.equal(invocationPackage.requirementTraceObligationIds.length, 80);
  assert.equal(invocationPackage.omittedRequirementTraceObligationCount, 80);
  assert(invocationPackage.omittedObligationCount > 100);
  assert.equal(workerBrief.kind, "sdlc_worker_brief");
  assert.equal(constructionBrief.kind, "sdlc_worker_construction_brief");
  assert.deepEqual(
    constructionBrief.workCategoryGovernance,
    invocationPackage.workCategoryGovernance
  );
  assert.deepEqual(
    constructionBrief.obligations.inlineObligations.map(
      (obligation) => obligation.obligationId
    ),
    invocationPackage.inlineObligations
      .filter((obligation) => obligation.obligationKind !== "requirement")
      .slice(0, 4)
      .concat(
        invocationPackage.inlineObligations
          .filter((obligation) => obligation.obligationKind === "requirement")
          .slice(0, 4)
      )
      .map((obligation) => obligation.obligationId)
  );
  assert(
    constructionBrief.obligations.inlineObligations.every(
      (obligation) => obligation.evidenceRefs.length <= 2 &&
        obligation.sourceRefs.length <= 2
    )
  );
  assert.equal(constructionBrief.obligations.inlineRequirementPressureRows.length, 4);
  assert(
    constructionBrief.obligations.inlineRequirementPressureRows.every(
      (obligation) => obligation.kind === "sdlc_worker_invocation_obligation" &&
        obligation.obligationKind === "requirement" &&
        obligation.summary.length > 0
    )
  );
  assert.equal(
    constructionBrief.targetCarrierProjection.kind,
    "sdlc_worker_target_carrier_prompt_projection"
  );
  assert.equal(
    "constructionTemplate" in constructionBrief.targetCarrierProjection,
    false
  );
  assert.equal(
    invocationPackage.targetCarrierProjection.kind,
    "sdlc_worker_target_carrier_prompt_projection"
  );
  assert.equal(
    "constructionTemplate" in invocationPackage.targetCarrierProjection,
    false
  );
  assert.deepEqual(
    constructionBrief.packageDispositions.map((entry) => entry.packageName),
    ["worker_construction_brief.json"]
  );
  assert.doesNotMatch(
    readFileSync(files.constructionBriefPath, "utf8"),
    /worker_invocation_package\.json|traversal_intent_package\.json|handoff_manifest\.json/u
  );
  assert(constructionBrief.currentState.authorityRefs.length > 0);
  assert(constructionBrief.currentState.authorityIndex.length > 0);
  assert(
    constructionBrief.currentState.authorityIndex.some((entry) =>
      entry.ref.endsWith("/specification/INTENT.md")
    )
  );
  assert.equal(
    workerBrief.refs.workerInvocationPackagePath,
    relativeToWorkspace(files.invocationPackagePath)
  );
  assert.equal(workerBrief.refs.handoffManifestPath, relativeToWorkspace(files.manifestPath));
  assert.equal(path.isAbsolute(workerBrief.outputFile), false);
  assert.equal(
    workerBrief.digests.workerInvocationPackageDigest,
    invocationPackage.packageDigest
  );
  assert.deepEqual(workerBrief.requiredSchema, manifest.resultReportSchema);
  assert.doesNotMatch(
    readFileSync(files.invocationPackagePath, "utf8"),
    escapedWorkspaceRoot
  );
  assert.doesNotMatch(readFileSync(files.workerBriefPath, "utf8"), escapedWorkspaceRoot);
  assert.doesNotMatch(
    readFileSync(files.constructionBriefPath, "utf8"),
    /"constructionTemplate"/u
  );
  assert.doesNotMatch(
    readFileSync(files.constructionBriefPath, "utf8"),
    /"rowTemplates"/u
  );
});

test("T-118 construction brief omits escaped runtime basis refs from worker prompt state", () => {
  const manifest = manifestForLargeSurface();
  const gapDossierRef = `file://${path.join(manifest.archiveRoot, "gap_dossier.json")}`;
  const runtimeBasisRef = `manifest:fp_retry:${JSON.stringify({
    basisId: `execution_basis:${JSON.stringify({
      workspaceRoot: manifest.workspaceRoot,
      graphCallId: "graph-call://t118",
      padding: "x".repeat(1024)
    })}`,
    attemptIndex: 1
  })}`;
  const manifestWithPriorRefs = {
    ...manifest,
    traversalObligationContext: {
      ...manifest.traversalObligationContext,
      priorEdgeRefs: [gapDossierRef, runtimeBasisRef]
    }
  };
  const files = writeHandoffFiles(manifestWithPriorRefs);
  const constructionBriefContent = readFileSync(
    files.constructionBriefPath,
    "utf8"
  );
  const constructionBrief = JSON.parse(constructionBriefContent);

  assert.deepEqual(constructionBrief.currentState.priorEdgeRefs, [
    "workspace://.ai-workspace/runtime/odd_sdlc/operator-runs/t118-worker-invocation-package/gap_dossier.json"
  ]);
  assert.equal(constructionBrief.currentState.omittedPriorEdgeRefCount, 1);
  assert.doesNotMatch(constructionBriefContent, /manifest:fp_retry/u);
  assert.doesNotMatch(constructionBriefContent, /execution_basis/u);
  assert(Buffer.byteLength(constructionBriefContent, "utf8") < 24 * 1024);
});

test("T-118 prompt points workers to the construction brief and not forensic packages", () => {
  const manifest = manifestForLargeSurface();
  const files = writeHandoffFiles(manifest);
  const prompt = readFileSync(files.promptPath, "utf8");
  const invocationPackage = JSON.parse(
    readFileSync(files.invocationPackagePath, "utf8")
  );

  assert(Buffer.byteLength(prompt, "utf8") < 8 * 1024);
  assert.doesNotMatch(prompt, new RegExp(manifest.workspaceRoot.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), "u"));
  assert.match(prompt, /Read in order:/u);
  assert.match(prompt, /Primary transform intent:/u);
  assert.match(prompt, /graph function: bootstrap_release_self_test/u);
  assert.match(prompt, /target carrier protocol: evaluator-owned/u);
  assert.doesNotMatch(prompt, /selected target carrier: kind=/u);
  assert.doesNotMatch(prompt, /Target carrier contract:/u);
  assert.doesNotMatch(prompt, /Worker-fillable target carrier fields:/u);
  assert.match(prompt, /This section is the core F_P transform/u);
  assert.match(prompt, /worker_construction_brief\.json/u);
  assert.match(prompt, /construction brief authority refs/u);
  assert.match(prompt, /worker_invocation_package\.json/u);
  assert.match(prompt, /worker_brief\.json/u);
  assert.match(prompt, /forensic manifest only when a package ref requires it/u);
  assert.match(prompt, /Terse axioms:/u);
  assert.match(prompt, /Apply worker_construction_brief\.json as the single prompt source carrier/u);
  assert.match(prompt, /Read boundary: use only workspace-relative paths/u);
  assert.match(prompt, /home memory/u);
  assert.match(prompt, /outside-workspace absolute paths/u);
  assert.match(prompt, /Control boundary: do not run odd-sdlc-ts/u);
  assert.match(prompt, /Do not spawn an odd_sdlc\/ABG worker, start another traversal/u);
  assert.match(prompt, /parent transform turn/u);
  assert.match(
    prompt,
    /framework evaluates the artifact after this process exits/u
  );
  assert.match(
    [...invocationPackage.transformAxioms, ...invocationPackage.outcomeDirectives].join("\n"),
    /Do not spawn an odd_sdlc\/ABG worker, start another traversal/u
  );
  assert.doesNotMatch(
    [...invocationPackage.transformAxioms, ...invocationPackage.outcomeDirectives].join("\n"),
    /worker_invocation_package\.json|traversal_intent_package\.json|handoff_manifest\.json/u
  );
  assert(
    [...invocationPackage.transformAxioms, ...invocationPackage.outcomeDirectives].some(
      (entry) => entry.includes("single prompt-source carrier")
    )
  );
  assert.doesNotMatch(prompt, /This invocation is F_P\.transform only/u);
  assert.match(prompt, /Construction brief fields to apply:/u);
  assert.doesNotMatch(prompt, /Read the full handoff manifest before writing output/u);
  assert.match(prompt, /obligations\.inlineObligations typed pressure rows/u);
  assert.match(prompt, /obligations\.inlineRequirementPressureRows typed requirement work queue/u);
  assert.match(prompt, /obligations\.requirementTraceObligationIds/u);
  assert(
    [...invocationPackage.transformAxioms, ...invocationPackage.outcomeDirectives].some(
      (entry) => entry.includes("audit context")
    )
  );
  assert.doesNotMatch(prompt, /complete transformation set for product files/u);
  assert.doesNotMatch(
    [...invocationPackage.transformAxioms, ...invocationPackage.outcomeDirectives].join("\n"),
    /complete transformation set for product files/u
  );
  assert.doesNotMatch(prompt, /Compact worker invocation package:/u);
  assert.doesNotMatch(prompt, /Legacy compact prompt pressure projection:/u);
  assert.doesNotMatch(prompt, /"kind": "sdlc_worker_invocation_package"/u);
  assert.doesNotMatch(prompt, /sdlc_worker_prompt_pressure_projection/u);
  assert.doesNotMatch(prompt, /workerInvocationPackage\.retryRepairInstructions is non-empty/u);
});

test("T-118 workspace spec prompts derive missing outputs from current authority", () => {
  const manifest = manifestForWorkspaceSpecSurface("derive_uat_testcases_surface");
  const files = writeHandoffFiles(manifest);
  const prompt = readFileSync(files.promptPath, "utf8");
  const invocationPackage = JSON.parse(
    readFileSync(files.invocationPackagePath, "utf8")
  );
  const directiveSurface = [
    ...invocationPackage.transformAxioms,
    ...invocationPackage.outcomeDirectives
  ].join("\n");

  assert.match(
    directiveSurface,
    /Current-workspace authority refs and the selected construction template are sufficient when this output is absent/u
  );
  assert.match(directiveSurface, /without mining prior generated examples/u);
  assert.match(prompt, /Read boundary: use only workspace-relative paths/u);
  assert.match(prompt, /home memory/u);
});

test("T-002 worker package and prompt carry declared product file targets", () => {
  const manifest = manifestWithDeclaredProductFileTargets();
  const files = writeHandoffFiles(manifest);
  const invocationPackage = JSON.parse(
    readFileSync(files.invocationPackagePath, "utf8")
  );
  const prompt = readFileSync(files.promptPath, "utf8");

  assert.deepEqual(
    invocationPackage.outputContract.declaredProductFileTargets,
    [
      "build_tenants/scala_spark/build.sbt",
      "build_tenants/scala_spark/src/main/scala/generated/App.scala"
    ]
  );
  assert.match(
    prompt,
    /Declared product file targets: build_tenants\/scala_spark\/build\.sbt, build_tenants\/scala_spark\/src\/main\/scala\/generated\/App\.scala\./u
  );
  assert.match(
    prompt,
    /Tool-profile contract: this execution-capable SDLC profile may use shell only when the active tool list exposes it/u
  );
  assert.match(
    prompt,
    /Read cap: every Read tool call over JSON, Markdown, report, manifest, or source artifacts must set limit <=80/u
  );
  assert.match(prompt, /worker brief projection: locator only/u);
  assert.match(
    prompt,
    /invocation package projection: only missing fields/u
  );
  assert.match(prompt, /Worker package fields to apply only on demand/u);
  const outcomeDirectives = invocationPackage.outcomeDirectives.join("\n");
  assert.match(
    outcomeDirectives,
    /Declared product file targets are the exact product surface/u
  );
  assert.match(outcomeDirectives, /one exact canonical id per line/u);
  assert.match(outcomeDirectives, /do not rely on the report alone/u);
  assert.match(
    outcomeDirectives,
    /Build\/test byproducts not listed as declared product targets must not be listed as materialized product files/u
  );
  assert.doesNotMatch(outcomeDirectives, /Cargo\.lock, target\//u);
  assert.doesNotMatch(prompt, /README\.md/u);
});

test("T-118 design-depth manifest carries a typed construction template by ref", () => {
  const manifest = manifestForImplementationDesignSurface();
  const files = writeHandoffFiles(manifest);
  const invocationPackage = JSON.parse(
    readFileSync(files.invocationPackagePath, "utf8")
  );
  const prompt = readFileSync(files.promptPath, "utf8");
  const outcomeDirectives = invocationPackage.outcomeDirectives.join("\n");
  const constructionTemplate =
    manifest.targetCarrierProjection.constructionTemplate;
  const payloadTemplate = constructionTemplate.payloadTemplate;
  const topologyTemplate = constructionTemplate.rowTemplates.find((template) =>
    template.templateRef.endsWith("/row/component-topology")
  );
  const attributeTemplate = constructionTemplate.rowTemplates.find((template) =>
    template.templateRef.endsWith("/row/domain-attribute")
  );
  const aggregateTemplate = constructionTemplate.rowTemplates.find((template) =>
    template.templateRef.endsWith("/row/aggregate-domain-model")
  );

  assert.equal(
    constructionTemplate.kind,
    "sdlc_worker_target_carrier_construction_template"
  );
  assert.equal(constructionTemplate.targetAssetType, "implementation_design_surface");
  assert.equal(
    constructionTemplate.carrierKind,
    "sdlc_implementation_design_surface_target_carrier"
  );
  assert.equal(
    constructionTemplate.templateRef,
    manifest.targetCarrierProjection.constructionTemplateRef
  );
  assert.equal(
    "constructionTemplate" in invocationPackage.targetCarrierProjection,
    false
  );
  assert.equal(payloadTemplate.kind, "sdlc_worker_target_carrier_object_template");
  assert.deepEqual(payloadTemplate.requiredFields, [
    "kind",
    "registerVersion",
    "targetAssetType",
    "stackProfileRows",
    "implementationModuleRows",
    "aggregateDomainModelRows",
    "moduleSchemaFragments",
    "moduleStateDiagramFragments",
    "aggregateDomainModel",
    "sunnyDaySequenceRows",
    "aggregateSunnyDaySequence",
    "componentTopologyRows",
    "componentRealizationRows",
    "fileTargetRows",
    "designCompletenessVerdict"
  ]);
  assert.equal(payloadTemplate.example.kind, "sdlc_design_depth_register");
  assert.equal(payloadTemplate.example.registerVersion, "ts-design-depth-v1");
  assert.equal(payloadTemplate.example.targetAssetType, "implementation_design_surface");
  assert(topologyTemplate);
  assert.deepEqual(topologyTemplate.enumDomains.concernRole, [
    "parser",
    "validator",
    "mapper",
    "error_model",
    "io_adapter",
    "reporting",
    "domain_model",
    "other"
  ]);
  assert(attributeTemplate);
  assert.deepEqual(attributeTemplate.enumDomains.cardinality, [
    "one",
    "optional",
    "many"
  ]);
  assert(aggregateTemplate);
  assert.equal(
    aggregateTemplate.example.entities[0].attributes[0].kind,
    "sdlc_domain_attribute"
  );
  assert.deepEqual(
    aggregateTemplate.example.operations[0].requiredAttributeIds,
    [aggregateTemplate.example.entities[0].attributes[0].attributeId]
  );
  assert.match(outcomeDirectives, /evaluate\.C\/F_P design-depth evaluator populates the design-depth register/u);
  assert.match(outcomeDirectives, /Keep the ADR proportional to immediate implementation structure/u);
  assert.match(outcomeDirectives, /A substantive implementation design must preserve decomposition proportionality/u);
  assert.match(outcomeDirectives, /For a single-file or script product/u);
  assert.match(outcomeDirectives, /Component_code_surface realization rows own source and implementation files/u);
  assert.doesNotMatch(outcomeDirectives, /Emit a fenced `json design_depth_register` carrier/u);
  assert.doesNotMatch(outcomeDirectives, /Each `moduleSchemaFragments` item/u);
  assert.doesNotMatch(outcomeDirectives, /\{"kind":"sdlc_module_schema_fragment"/u);
  assert.doesNotMatch(outcomeDirectives, /design_depth_module_schema_fragment/u);
  assert.match(prompt, /target carrier protocol: evaluator-owned/u);
  assert.doesNotMatch(prompt, /Target carrier construction template ref:/u);
  assert.doesNotMatch(prompt, /targetCarrierProjection\.constructionTemplate/u);
});

test("T-118 implementation design handoff carries nested predecessor authority as targeted retrieval hints", () => {
  const manifest = manifestForImplementationDesignSurfaceWithNestedPredecessors();
  const files = writeHandoffFiles(manifest);
  const invocationPackage = JSON.parse(
    readFileSync(files.invocationPackagePath, "utf8")
  );
  const implementationDesignRef =
    "workspace://build_tenants/scala_spark/design/adrs/ADR-002-implementation-design-surface.md";
  const designAuthority = manifest.traversalObligationContext.authorityIndex.find(
    (entry) =>
      entry.ref.endsWith(
        "/build_tenants/scala_spark/design/adrs/ADR-002-implementation-design-surface.md"
      )
  );
  const stackAuthority = manifest.traversalObligationContext.authorityIndex.find(
    (entry) =>
      entry.ref.endsWith(
        "/build_tenants/scala_spark/design/implementation_stack_profile.md"
      )
  );
  const designSurfaceHint = manifest.traversalObligationContext.retrievalHints.find(
    (hint) =>
      hint.ref.endsWith(
        "/build_tenants/scala_spark/design/adrs/ADR-001-design-surface.md"
      )
  );
  const designHint = invocationPackage.retrievalHints.find(
    (hint) => hint.ref === implementationDesignRef
  );

  assert(designAuthority);
  assert(designAuthority.tags.includes("implementation_design_surface"));
  assert(stackAuthority);
  assert(stackAuthority.tags.includes("design"));
  assert(designSurfaceHint);
  assert.equal(designSurfaceHint.reason, "targeted_authority_for_current_traversal");
  assert(designHint);
  assert.equal(designHint.reason, "targeted_authority_for_current_traversal");
  assert(
    !invocationPackage.retrievalHints.some((hint) =>
      hint.ref.endsWith("/build_tenants/scala_spark/design/implementation_stack_profile.md")
    )
  );
  assert(invocationPackage.retrievalHints.length <= 12);
});

test("T-118 composite design-depth prompt does not duplicate carrier-shape evaluation", () => {
  const files = writeHandoffFiles(manifestForImplementationDesignSurface());
  const invocationPackage = JSON.parse(
    readFileSync(files.invocationPackagePath, "utf8")
  );
  const directives = invocationPackage.outcomeDirectives.join("\n");
  const manifest = JSON.parse(readFileSync(files.manifestPath, "utf8"));
  const constructionTemplate =
    manifest.targetCarrierProjection.constructionTemplate;
  const rowTemplateRefs = constructionTemplate.rowTemplates.map(
    (template) => template.templateRef
  );

  assert.equal(constructionTemplate.targetAssetType, "implementation_design_surface");
  const expectedTemplateRefs = [
    `${constructionTemplate.templateRef}/row/domain-attribute`,
    `${constructionTemplate.templateRef}/row/module-schema-fragment`,
    `${constructionTemplate.templateRef}/row/domain-entity`,
    `${constructionTemplate.templateRef}/row/domain-operation`,
    `${constructionTemplate.templateRef}/row/aggregate-domain-model`,
    `${constructionTemplate.templateRef}/row/component-topology`
  ];
  for (const expectedTemplateRef of expectedTemplateRefs) {
    assert(rowTemplateRefs.includes(expectedTemplateRef));
  }
  assert.equal(new Set(rowTemplateRefs).size, rowTemplateRefs.length);
  assert.match(
    directives,
    /evaluate\.C\/F_P design-depth evaluator populates the design-depth register/u
  );
  assert.match(
    directives,
    /Evaluator-owned outputs stay with the framework/u
  );
  assert.doesNotMatch(directives, /targetAssetType:"implementation_design_surface"/u);
  assert.doesNotMatch(
    directives,
    /\{"kind":"sdlc_aggregate_domain_model","modelVersion":"ts-design-depth-v1"/u
  );
  assert.doesNotMatch(directives, /"axis":"entity"/u);
});

test("T-118 component-code transform prompt publishes component concern-role enum", () => {
  const files = writeHandoffFiles(
    manifestForWorkspaceSpecSurface("derive_component_code_surface")
  );
  const invocationPackage = JSON.parse(
    readFileSync(files.invocationPackagePath, "utf8")
  );
  const directives = invocationPackage.outcomeDirectives.join("\n");

  assert.match(
    directives,
    /componentTopologyRows\[\]\.concernRole values are exactly parser, validator, mapper, error_model, io_adapter, reporting, domain_model, other/u
  );
  assert.match(
    directives,
    /use "other" for simple executable entrypoints or glue/u
  );
});

test("T-157 product materialization prompt leaves execution evidence to evaluator surfaces", () => {
  const manifest = manifestForDeclaredProductMaterialization();
  const files = writeHandoffFiles(manifest);
  const invocationPackage = JSON.parse(
    readFileSync(files.invocationPackagePath, "utf8")
  );
  const outcomeDirectives = invocationPackage.outcomeDirectives.join("\n");

  assert.match(
    outcomeDirectives,
    /Outcome: Fg_materialize_declared_product_asset -> component_code_surface/u
  );
  assert.match(
    outcomeDirectives,
    /Declared product file targets are the exact product surface/u
  );
  assert.match(
    outcomeDirectives,
    /Build\/test byproducts not listed as declared product targets must not be listed as materialized product files/u
  );
  assert.doesNotMatch(outcomeDirectives, /Cargo\.lock, target\//u);
  assert.doesNotMatch(outcomeDirectives, /sdlc_worker_execution_evidence/u);
  assert.doesNotMatch(outcomeDirectives, /shardEvidence/u);
  assert.doesNotMatch(outcomeDirectives, /Prior defect:/u);
});
