// Validates: T-191 (GTL typed prompt assets and constructor provenance)
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { admitAssetSurface } from "@abiogenesis/typescript-tenant";
import {
  SDLC_METHOD_AUTHORITY_COMPRESSION_REFS,
  SDLC_PROMPT_AUTHORITY_POLICY_ROWS,
  SDLC_PROMPT_BOUNDED_FALLBACK_AUTHORITY_KIND_REFS,
  SDLC_PROMPT_NORMAL_AUTHORITY_KIND_REFS,
  constructSdlcPromptInvocationProjection,
  sdlcPromptAuthorityCompressionFallbackPreconditionRef,
  sdlcPromptSectionFromLines
} from "../../build/semantic/code/src/index.js";
import {
  designDepthFpEvaluatorPromptProjection,
  reviewGradeEdgeFulfillmentPromptProjection
} from "../../build/semantic/code/src/operator/plugins/evaluate/prompts.js";

const promptAssetSource = readFileSync(
  fileURLToPath(new URL("../../code/src/operator/prompt_assets.ts", import.meta.url)),
  "utf8"
);
const operatorIndexSource = readFileSync(
  fileURLToPath(new URL("../../code/src/operator/index.ts", import.meta.url)),
  "utf8"
);
const installedOperatorSource = readFileSync(
  fileURLToPath(new URL("../../code/src/operator/installed_operator.ts", import.meta.url)),
  "utf8"
);
const launchContractSource = readFileSync(
  fileURLToPath(
    new URL(
      "../../code/src/operator/plugins/transform/launch_contract.ts",
      import.meta.url
    )
  ),
  "utf8"
);
const evaluatorPromptSource = readFileSync(
  fileURLToPath(
    new URL(
      "../../code/src/operator/plugins/evaluate/prompts.ts",
      import.meta.url
    )
  ),
  "utf8"
);
const artifactCatalogSource = readFileSync(
  fileURLToPath(
    new URL(
      "../../code/src/contracts/operator_run_artifact_catalog.ts",
      import.meta.url
    )
  ),
  "utf8"
);
const requirementsSource = readFileSync(
  fileURLToPath(
    new URL(
      "../../../../specification/requirements/18-typed-construction-algebra.md",
      import.meta.url
    )
  ),
  "utf8"
);
const SPEC_METHOD_PROMPT_OPENING_LINE =
  "Use the smallest governing authority packet that can decide this prompt, then produce the contracted artifact without extra planning or global SDLC reconstruction.";
const packageJson = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("../../package.json", import.meta.url)),
    "utf8"
  )
);

function sha256Text(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function minimalManifest(targetAssetType = "component_code_surface") {
  return {
    graphFunctionName: "derive_component_code_surface",
    edgeName: "derive_component_code_surface",
    targetAssetType,
    outputFile: "build_tenants/rust_hello_service/src/main.rs"
  };
}

function basicPromptSection(textLines, overrides = {}) {
  return sdlcPromptSectionFromLines({
    role: "prompt_body",
    title: "test prompt body",
    textLines,
    intent: "Render a typed test prompt section.",
    expectedOutcome: "Prompt projection is digest-bound and admitted.",
    failureModeAddressed: "untyped prompt body",
    appliesWhen: "T-191 focused test construction",
    ...overrides
  });
}

test("T-191 consumes the released ABI 4 GTL prompt surface", () => {
  assert.match(
    packageJson.dependencies["@abiogenesis/typescript-tenant"],
    /4\.1\.0-rc\.1/u
  );
  assert.match(promptAssetSource, /constructAssetSurface/u);
  assert.match(promptAssetSource, /constructNode/u);
  assert.match(promptAssetSource, /admitAssetSurface/u);
});

test("T-191 requirement home projects GTL AssetSurface law", () => {
  assert.match(requirementsSource, /REQ-F-ODDSDLC-087 - prompt assets project GTL typed asset surfaces/u);
  assert.match(requirementsSource, /GTL\s+Node-borne AssetSurface/u);
  assert.match(requirementsSource, /authority-compression policy and prompt-family construction/u);
  assert.match(requirementsSource, /shall not prescribe a semantic extraction recipe/u);
  assert.doesNotMatch(requirementsSource, /typed register projections/u);
});

test("T-191 SDLC overlay owns family authority policy without an SDLC register", () => {
  assert.deepEqual(
    SDLC_PROMPT_AUTHORITY_POLICY_ROWS.map((row) => row.promptFamily).toSorted(),
    ["evaluate_design_depth", "evaluate_review_grade", "transform"]
  );
  for (const row of SDLC_PROMPT_AUTHORITY_POLICY_ROWS) {
    assert.equal(row.kind, "sdlc_prompt_authority_policy_row");
    assert(row.normalAuthorityKinds.includes("product_definition"));
    assert(row.normalAuthorityKinds.includes("method_compression"));
    assert(row.boundedFallbackAuthorityKinds.includes("bootstrap_provenance"));
    assert(row.boundedFallbackAuthorityKinds.includes("intent_fallback"));
    assert(row.forbiddenRoutineAuthorityKinds.includes("sibling_workspace_history"));
  }
  assert.doesNotMatch(promptAssetSource, /SDLC_PROMPT_ASSET_TYPED_REGISTER/u);
  assert.doesNotMatch(promptAssetSource, /admitSdlcPromptInvocationAsset/u);
  assert.doesNotMatch(operatorIndexSource, /SDLC_PROMPT_ASSET_TYPED_REGISTER/u);
  assert.doesNotMatch(operatorIndexSource, /admitSdlcPromptInvocationAsset/u);
});

test("T-191 method compression refs are installed workspace refs, not source paths", () => {
  assert(SDLC_METHOD_AUTHORITY_COMPRESSION_REFS.length >= 5);
  for (const ref of SDLC_METHOD_AUTHORITY_COMPRESSION_REFS) {
    assert.match(
      ref,
      /^workspace:\/\/\.abiogenesis\/docs\/standards\/authority_compressions\/.+\.md$/u
    );
    assert.doesNotMatch(ref, /\/Users\/jim\/src\/apps\/specification_methodology/u);
  }
  assert.doesNotMatch(promptAssetSource, /\/Users\/jim\/src\/apps\/specification_methodology/u);
}
);

test("T-191 prompt projection renders a GTL Node/AssetSurface sidecar", () => {
  const projection = constructSdlcPromptInvocationProjection({
    promptFamily: "transform",
    stage: "transform.C",
    recipient: "transformer",
    targetAssetType: "component_code_surface",
    workCategory: "derive_component_code_surface",
    edgePolicyRef: "assurance-contract://odd-sdlc/test",
    constructorRef: "prompt-constructor://odd-sdlc/transform/v1",
    authorityPacketRefs: ["worker_construction_brief.json"],
    obligationRefs: ["requirement:req_t191_001"],
    toolEffectPolicyRefs: ["tool-policy://odd-sdlc/transform/edge-permission-class"],
    outputCarrierRefs: ["src/main.rs"],
    proofObligationRefs: ["REQ-F-ODDSDLC-087"],
    promptSections: [
      basicPromptSection([
        "odd_sdlc F_P.transform launch contract.",
        "",
        "Purpose:",
        "- Build only the contracted product artifact."
      ])
    ]
  });

  assert.match(projection.promptText, /Typed prompt asset:/u);
  assert.match(projection.promptText, /GTL Node\/AssetSurface/u);
  assert.equal(projection.promptText.startsWith(SPEC_METHOD_PROMPT_OPENING_LINE), true);
  assert.doesNotMatch(
    projection.promptText,
    /Make a plan|rank the work|contextual closure priority|global SDLC reconstruction before artifact output/u
  );
  assert.match(projection.promptText, /odd_sdlc F_P\.transform launch contract\./u);
  assert.equal(projection.invocationAsset.renderedPromptDigest, sha256Text(projection.promptText));
  assert.equal(projection.invocationAsset.gtlNode.assetSurface.kind, "gtl.asset_surface/odd_sdlc.prompt/transform/v1");
  assert.equal(
    admitAssetSurface(projection.invocationAsset.gtlNode.assetSurface).kind,
    projection.invocationAsset.gtlNode.assetSurface.kind
  );
  assert(
    projection.invocationAsset.gtlNode.assetSurface.authoritySlots.some(
      (slot) =>
        slot.authorityKindRef === "bootstrap_provenance" &&
        slot.disposition === "bounded_fallback" &&
        slot.fallbackPreconditionRefs.length === 1
    )
  );
  assert(
    projection.invocationAsset.gtlNode.assetSurface.authoritySlots.some(
      (slot) =>
        slot.authorityKindRef === "sibling_workspace_history" &&
        slot.disposition === "forbidden_routine"
    )
  );
});

test("T-191 production constructor rejects forbidden routine authority", () => {
  assert.throws(
    () => constructSdlcPromptInvocationProjection({
      promptFamily: "evaluate_review_grade",
      stage: "evaluate.C",
      recipient: "evaluator",
      targetAssetType: "component_code_surface",
      constructorRef: "prompt-constructor://odd-sdlc/evaluate_review_grade/v1",
      authorityPacketRefs: ["worker_construction_brief.json"],
      obligationRefs: ["requirement:req_t191_002"],
      toolEffectPolicyRefs: ["tool-policy://odd-sdlc/evaluate/read-write-only"],
      outputCarrierRefs: ["review_grade_edge_fulfillment_assessment.json"],
      proofObligationRefs: ["REQ-F-ODDSDLC-087"],
      promptSections: [
        basicPromptSection(
          ["odd_sdlc evaluate.C/F_P review-grade edge fulfillment rule."],
          {
            authorityKindRefs: ["sibling_workspace_history"]
          }
        )
      ]
    }),
    /forbidden routine prompt authority/u
  );
});

test("T-191 production constructor rejects bounded fallback authority in routine clauses", () => {
  assert.throws(
    () => constructSdlcPromptInvocationProjection({
      promptFamily: "evaluate_review_grade",
      stage: "evaluate.C",
      recipient: "evaluator",
      targetAssetType: "component_code_surface",
      constructorRef: "prompt-constructor://odd-sdlc/evaluate_review_grade/v1",
      authorityPacketRefs: ["worker_construction_brief.json"],
      obligationRefs: ["requirement:req_t191_003"],
      toolEffectPolicyRefs: ["tool-policy://odd-sdlc/evaluate/read-write-only"],
      outputCarrierRefs: ["review_grade_edge_fulfillment_assessment.json"],
      proofObligationRefs: ["REQ-F-ODDSDLC-087"],
      promptSections: [
        basicPromptSection(
          [
            "Routine review body:",
            "- Do not routine-read raw bootstrap."
          ],
          {
            authorityKindRefs: [
              ...SDLC_PROMPT_NORMAL_AUTHORITY_KIND_REFS,
              ...SDLC_PROMPT_BOUNDED_FALLBACK_AUTHORITY_KIND_REFS
            ],
            fallbackPreconditionRefs: [
              sdlcPromptAuthorityCompressionFallbackPreconditionRef(
                "evaluate_review_grade"
              )
            ]
          }
        )
      ]
    }),
    /bounded fallback prompt authority is not routine authority/u
  );
});

test("T-191 evaluator prompt projections carry GTL prompt assets", () => {
  const designProjection = designDepthFpEvaluatorPromptProjection({
    manifest: minimalManifest("implementation_design_surface"),
    manifestPath: "handoff_manifest.json",
    governanceRef: "config://test",
    governancePath: "config/work-category-governance/design_build.md",
    constructionBriefPath: "worker_construction_brief.json",
    invocationPackagePath: "worker_invocation_package.json",
    workerReportPath: "worker_result_report.json",
    workerReportSummaryLines: ["status=passed"],
    contentRegisterPath: "design_depth_fp_evaluator_content_register.json",
    registerProjectionPath: "design_depth_fp_evaluator_register.json",
    subworkstreamManifestPath: "evaluate_compute_subworkstream_manifest.json",
    selectedCompositionRef: "composition://t191/selected",
    selectedCompositionDigest: "sha256:t191",
    selectedCompositionSelectionRef: "selection://t191",
    selectedRegimeBindingRef: null,
    tenantToolEnvironment: null
  });
  const reviewProjection = reviewGradeEdgeFulfillmentPromptProjection({
    manifest: minimalManifest("component_code_surface"),
    governanceRef: "config://test",
    governancePath: "config/work-category-governance/coding_build.md",
    constructionBriefPath: "worker_construction_brief.json",
    invocationPackagePath: "worker_invocation_package.json",
    workerReportPath: "worker_result_report.json",
    assessmentPath: "review_grade_edge_fulfillment_assessment.json",
    subworkstreamManifestPath: "evaluate_compute_subworkstream_manifest.json",
    tenantToolEnvironment: null
  });

  assert.equal(designProjection.invocationAsset.promptFamily, "evaluate_design_depth");
  assert.equal(reviewProjection.invocationAsset.promptFamily, "evaluate_review_grade");
  assert.match(designProjection.promptText, /Typed prompt asset:/u);
  assert.match(reviewProjection.promptText, /Typed prompt asset:/u);
  assert.equal(designProjection.promptText.startsWith(SPEC_METHOD_PROMPT_OPENING_LINE), true);
  assert.equal(reviewProjection.promptText.startsWith(SPEC_METHOD_PROMPT_OPENING_LINE), true);
  assert.match(designProjection.promptText, /componentTopologyRows\[\] with kind "sdlc_component_topology_row"/u);
  assert.match(designProjection.promptText, /componentRealizationRows\[\] with kind "sdlc_component_realization_row"/u);
  assert.doesNotMatch(designProjection.promptText, /\/Users\/jim\/src\/apps\/specification_methodology/u);
  assert.doesNotMatch(reviewProjection.promptText, /\/Users\/jim\/src\/apps\/specification_methodology/u);

  for (const projection of [designProjection, reviewProjection]) {
    const authoritySets = new Set(
      projection.invocationAsset.promptSections.flatMap((section) =>
        section.clauses.map((clause) => clause.authorityKindRefs.join("|"))
      )
    );
    const clauses = projection.invocationAsset.promptSections.flatMap(
      (section) => section.clauses
    );
    assert(
      authoritySets.size > 1,
      "production evaluator prompt clauses must not all carry one authority set"
    );
    assert(
      clauses.some((clause) =>
        clause.authorityKindRefs.includes("bootstrap_provenance")
      ),
      "authority compression clause carries bounded fallback authority"
    );
    assert(
      clauses.some(
        (clause) => !clause.authorityKindRefs.includes("bootstrap_provenance")
      ),
      "routine clauses do not carry bounded fallback authority"
    );
    assert.match(
      projection.invocationAsset.gtlNode.assetSurface.kind,
      /^gtl\.asset_surface\/odd_sdlc\.prompt\//u
    );
  }
});

test("T-191 runtime prompt writers archive prompt asset sidecars", () => {
  assert.match(launchContractSource, /promptForHandoffProjection/u);
  assert.match(launchContractSource, /worker_prompt_asset\.json/u);
  assert.match(installedOperatorSource, /designDepthFpEvaluatorPromptProjection/u);
  assert.match(installedOperatorSource, /design_depth_fp_evaluator_prompt_asset\.json/u);
  assert.match(installedOperatorSource, /reviewGradeEdgeFulfillmentPromptProjection/u);
  assert.match(installedOperatorSource, /review_grade_edge_fulfillment_prompt_asset\.json/u);
  assert.match(artifactCatalogSource, /operator-run-artifact:\/\/worker-prompt-asset/u);
  assert.match(artifactCatalogSource, /operator-run-artifact:\/\/design-depth-fp-evaluator-prompt-asset/u);
  assert.match(artifactCatalogSource, /operator-run-artifact:\/\/review-grade-edge-fulfillment-prompt-asset/u);
});

test("T-191 prompt construction stays on the F_D carrier side", () => {
  assert.match(promptAssetSource, /F_D constructs authority packets, refs, section provenance/u);
  assert.doesNotMatch(promptAssetSource, /sectionAssetsForRenderedPrompt/u);
  assert.doesNotMatch(promptAssetSource, /indexOf\(/u);
  assert.doesNotMatch(promptAssetSource, /parse ADR tables/u);
  assert.doesNotMatch(promptAssetSource, /derive semantic register rows/u);
  assert.doesNotMatch(promptAssetSource, /decide product behavior/u);
  assert.doesNotMatch(evaluatorPromptSource, /bodyText\.indexOf/u);
  assert.doesNotMatch(evaluatorPromptSource, /declaredEvaluatePromptSections\(\{[^}]*bodyText/us);
  assert.match(evaluatorPromptSource, /lineGroups/u);
});
