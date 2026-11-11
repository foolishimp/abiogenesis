import assert from "node:assert/strict";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import { genericLifecyclePublicationData } from "../support/t287-generic-job-lifecycle.mjs";
import { ordinaryJob } from "../support/t287-generic-job-intake.mjs";
const root = process.env.ABI5_GENERIC_JOB_BUILD_ROOT ?? resolve(import.meta.dirname, "../..");
const load = name => import(pathToFileURL(join(root, "build/code/src", name + ".js")).href);
const [product, gtl, meaning] = await Promise.all(["product/index", "gtl/index", "product/semantic_job"].map(load));
const hash = product.sha256Canonical, zeros = "sha256:" + "0".repeat(64);
const artifact = { productId: product.ABI5_PRODUCT_ID, packageName: product.ABI5_PACKAGE_NAME, packageVersion: product.ABI5_PACKAGE_VERSION,
  artifactDigest: zeros, productContentDigest: zeros, productManifestDigest: zeros };
const abiPublication = gtl.constructSemanticStageModulePublication(artifact);
const declaration = genericLifecyclePublicationData({ product, gtl, abiPublication }).semanticJobLifecycle;
const text = "Build an application that prints Hello World. Preserve the independent verifier.";
const job = ordinaryJob(product, gtl, text);
const coordinate = { invocationAdmissionRef: "component-only:invocation", rootExecutionBasisRef: "component-only:root",
  rootInputRef: "component-only:input", rootInputDigest: hash(job), intakeCCallRef: "component-only:intake", intakeCCallDigest: hash("intake"),
  intakeExecutionBasisRef: "component-only:child" };
const empty = () => product.constructSemanticJobEnvelope(job, declaration, coordinate);
const source = (name, input) => ({ cCallRef: "component-only:" + name, inputDigest: hash(input), actorInvocationRef: "component-only:" + name,
  promptDigest: hash("prompt:" + name), transportDigest: hash("transport:" + name) });
function candidate(envelope, stage, proposal) {
  const q = { memberRef: job.members[0].memberRef, quote: text };
  return { kind: "semantic_job_asset_candidate", schemaVersion: "5.0.0", asset: { kind: "semantic_stage_asset_candidate", schemaVersion: "5.0.0",
    statements: [{ statementRef: stage.declarationRef + "/s", text, modality: "supporting", sourceQuotes: [q], requirementRefs: [], obligationRefs: [],
      predecessorStatementRefs: envelope.assets.flatMap(a => a.candidate.asset.statements.map(s => s.statementRef)) }],
    requirementCandidates: proposal === undefined ? [] : [{ candidateRef: "candidate://greeting", meaning: text, parentRequirementRefs: [], sourceQuotes: [q] }],
    worksiteDesign: null, pressure: [] }, bindings: proposal === undefined ? [] : [proposal], design: null };
}
function assessment(authored, stage) {
  return { kind: "semantic_stage_assessment_candidate", schemaVersion: "5.0.0", criteria: stage.rubric.map(r => ({ criterionRef: r.criterionRef,
    disposition: "satisfied", explanation: "Mechanical owner test, not semantic acceptance", sourceQuotes: [{ memberRef: job.members[0].memberRef, quote: text }],
    statementRefs: authored.assets.at(-1).candidate.asset.statements.map(s => s.statementRef) })), pressure: [] };
}
function beforeRequirements() {
  let envelope = empty();
  for (const [i, stage] of declaration.stages.slice(0, 2).entries()) {
    const authored = product.deriveSemanticJobAsset(envelope, stage.declarationRef, candidate(envelope, stage), source("author" + i, envelope)); assert.ok(authored);
    envelope = product.deriveSemanticJobAssessment(authored, stage.declarationRef, assessment(authored, stage), source("assessor" + i, authored)); assert.ok(envelope);
  }
  return envelope;
}
const proposal = { requirement: { kind: "candidate", ref: "candidate://greeting" }, previousVersionRef: null,
  templateRef: declaration.proofTemplates[0].templateRef, scope: "Current ordinary source", realizationMeaning: ["Actual application"],
  proofMeaning: ["Actual verifier and observed command"], unprovedScope: ["Semantic acceptance"], closureRule: "Non-closing", requiredContent: ["Actual bytes"] };

test("generic declaration bytes stay fixed while ordinary job identities and source spans differ", () => {
  const second = ordinaryJob(product, gtl, "Build an integer-addition command-line application.");
  assert.notEqual(hash(job), hash(second));
  assert.deepEqual(genericLifecyclePublicationData({ product, gtl, abiPublication }).semanticJobLifecycle, declaration);
  const envelope = empty(); assert.equal(envelope.kind, abiPublication.contracts.find(c => c.contractRef === gtl.SEMANTIC_STAGE_IDS.envelopeContractRef).valueKind);
  assert.equal(product.isSemanticStageEnvelope(envelope), false, "closed job arm does not relax legacy fixed shape");
  assert.equal(meaning.groundSemanticJobQuote(envelope, { memberRef: job.members[0].memberRef, quote: text }).startByte, 0);
  assert.equal(meaning.groundSemanticJobQuote(envelope, { memberRef: job.members[0].memberRef, quote: "invented" }), null);
  assert.equal(product.isSemanticJobEnvelope({ ...envelope, job: second }), false);
});

// Retired (T-292 TD-60): a saved Design-to-plan counterexample uses the assessor result coordinate; input the saved native Design-to-plan scratch root not recorded

test("binding activation follows independent assessment; strict quote/domain/identity refusals remain", () => {
  const input = beforeRequirements(), stage = declaration.stages[2], raw = candidate(input, stage, proposal);
  const authored = product.deriveSemanticJobAsset(input, stage.declarationRef, raw, source("requirements-author", input)); assert.ok(authored);
  assert.equal(authored.bindingVersions.length, 0, "an author proposal is not active binding truth");
  const good = assessment(authored, stage), assessor = source("requirements-assessor", authored);
  const assessed = product.deriveSemanticJobAssessment(authored, stage.declarationRef, good, assessor); assert.ok(assessed);
  const version = assessed.bindingVersions[0]; assert.equal(version.introducingAssetRef, authored.assets.at(-1).assetRef);
  assert.deepEqual(version.assessmentSource, assessor); assert.equal(version.ordinal, 0);
  assert.deepEqual(product.projectSemanticJobBindings(assessed), [version]);
  for (const mutate of [x => x.criteria[0].statementRefs.push(input.assets[0].candidate.asset.statements[0].statementRef),
    x => x.criteria[0].sourceQuotes[0].quote = "invented", x => x.criteria[0].criterionRef = "wrong"]) {
    const changed = structuredClone(good); mutate(changed);
    assert.equal(product.deriveSemanticJobAssessment(authored, stage.declarationRef, changed, assessor), null);
  }
  assert.equal(product.deriveSemanticJobAssessment(authored, stage.declarationRef, good, authored.assets.at(-1).source), null);
  const unknown = structuredClone(good); unknown.criteria[0].disposition = "indeterminate";
  assert.equal(product.deriveSemanticJobAssessment(authored, stage.declarationRef, unknown, assessor).bindingVersions.length, 0);
  assert.deepEqual(product.projectSemanticJobBindings({ ...assessed, bindingVersions: [version, structuredClone(version)] }), [version]);
  const conflict = structuredClone(version); conflict.policy.scope = "changed";
  assert.equal(product.projectSemanticJobBindings({ ...assessed, bindingVersions: [version, conflict] }), null);
});

test("assessed explicit supersession selects one current version and preserves old binding bytes", () => {
  const input = beforeRequirements(), stage = declaration.stages[2];
  const authored = product.deriveSemanticJobAsset(input, stage.declarationRef, candidate(input, stage, proposal), source("old-author", input));
  const assessed = product.deriveSemanticJobAssessment(authored, stage.declarationRef, assessment(authored, stage), source("old-assessor", authored));
  const old = assessed.bindingVersions[0], retained = assessed.assets.at(-1).groundedTerms;
  // Component projection of D2's retained history; no ABG/current-workspace claim.
  const revisedInput = { ...assessed, assets: input.assets };
  const raw = candidate(revisedInput, stage); raw.bindings = [{ ...proposal, requirement: { kind: "existing", ref: old.binding.requirementRef },
    previousVersionRef: old.versionRef, scope: "Refined proof of the same ordinary source" }];
  const revised = product.deriveSemanticJobAsset(revisedInput, stage.declarationRef, raw, source("new-author", revisedInput), retained); assert.ok(revised);
  const final = product.deriveSemanticJobAssessment(revised, stage.declarationRef, assessment(revised, stage), source("new-assessor", revised), retained); assert.ok(final);
  assert.deepEqual(final.bindingVersions[0], old); assert.equal(final.bindingVersions.length, 2);
  assert.deepEqual(product.projectSemanticJobBindings(final), [final.bindingVersions[1]]);
  assert.equal(final.bindingVersions[1].previousVersionRef, old.versionRef);
  assert.equal(final.bindingVersions[1].binding.obligationRef, old.binding.obligationRef);
  const fork = structuredClone(raw); fork.bindings[0].previousVersionRef = "stale";
  const forked = product.deriveSemanticJobAsset(revisedInput, stage.declarationRef, fork, source("fork-author", revisedInput), retained); assert.ok(forked);
  assert.equal(product.deriveSemanticJobAssessment(forked, stage.declarationRef, assessment(forked, stage), source("fork-assessor", forked), retained), null);
});

// Retired (T-292 TD-60): the corrected double satisfies the retained Requirements and response contracts; input the saved native full-outcome scratch root not recorded
