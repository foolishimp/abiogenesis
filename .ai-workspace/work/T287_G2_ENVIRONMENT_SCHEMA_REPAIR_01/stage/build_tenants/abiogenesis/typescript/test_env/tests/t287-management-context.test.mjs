import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, mkdir, writeFile, rename, readFile, chmod, symlink } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import * as product from "../../build/code/src/product/index.js";
import { projectSemanticJobPromptContext, semanticJobMissingBindingRequirementRefs, semanticJobWorkerResultSchema,
  semanticJobUsesDesignResponse, isSemanticJobDesignResponse, isSemanticJobAssetCandidate, materializeSemanticJobDesignResponse } from "../../build/code/src/product/semantic_job.js";
import { ABI5_SEMANTIC_STAGE_PRODUCT_SEMANTICS } from "../../build/code/src/product/builtin_semantics.js";
import * as gtl from "../../build/code/src/gtl/index.js";
import * as relation from "../../build/code/src/gtl/stdo_run_environment.js";
import * as evidence from "../../build/code/src/abg/stdo_environment.js";
import { cLeafTerms } from "../../build/code/src/gtl/c_algebra.js";
import { genericLifecyclePublicationData } from "../support/t287-generic-job-lifecycle.mjs";
import { ordinaryJob } from "../support/t287-generic-job-intake.mjs";
import { setupInstalledRootCatalog } from "../support/root-installed-environment.mjs";
import { prepareGenericJobIntakeProduct, constructGenericIntakeStart } from "../support/t287-generic-job-intake.mjs";
import { nativePublications } from "../support/d2-frame-fixture.mjs";

const hash = product.sha256Canonical, bytes = product.sha256Bytes, zeros = "sha256:" + "0".repeat(64);
const abiArtifact = { productId: product.ABI5_PRODUCT_ID, packageName: product.ABI5_PACKAGE_NAME, packageVersion: product.ABI5_PACKAGE_VERSION,
  artifactDigest: zeros, productContentDigest: zeros, productManifestDigest: zeros };
const abiPublication = gtl.constructSemanticStageModulePublication(abiArtifact);
const base = genericLifecyclePublicationData({ product, gtl, abiPublication });
const declaration = base.semanticJobLifecycle, text = "Build an ordinary application and an independent verifier.";
const job = ordinaryJob(product, gtl, text);
const coordinate = { invocationAdmissionRef: "component:invocation", rootExecutionBasisRef: "component:root", rootInputRef: "component:input",
  rootInputDigest: hash(job), intakeCCallRef: "component:intake", intakeCCallDigest: hash("intake"), intakeExecutionBasisRef: "component:child" };
const empty = () => product.constructSemanticJobEnvelope(job, declaration, coordinate);
const source = (name, input) => ({ cCallRef: "component:" + name, inputDigest: hash(input), actorInvocationRef: "component:" + name,
  promptDigest: hash("prompt:" + name), transportDigest: hash("transport:" + name) });
const candidate = (envelope, stage, requirement = false) => ({ kind: "semantic_job_asset_candidate", schemaVersion: "5.0.0",
  asset: { kind: "semantic_stage_asset_candidate", schemaVersion: "5.0.0", statements: [{ statementRef: stage.declarationRef + "/s", text,
    modality: "supporting", sourceQuotes: [{ memberRef: job.members[0].memberRef, quote: text }], requirementRefs: [], obligationRefs: [],
    predecessorStatementRefs: envelope.assets.flatMap(a => a.candidate.asset.statements.map(s => s.statementRef)) }],
    requirementCandidates: requirement ? [{ candidateRef: "candidate:one", meaning: text, parentRequirementRefs: [], sourceQuotes: [{ memberRef: job.members[0].memberRef, quote: text }] }] : [], worksiteDesign: null, pressure: [] },
  bindings: requirement ? [{ requirement: { kind: "candidate", ref: "candidate:one" }, previousVersionRef: null,
    templateRef: declaration.proofTemplates[0].templateRef, scope: "ordinary source", realizationMeaning: ["application"], proofMeaning: ["independent verifier"],
    unprovedScope: ["semantic acceptance"], closureRule: "nonclosing", requiredContent: [] }] : [], design: null });
function assess(envelope, stage, ordinal) {
  const raw = { kind: "semantic_stage_assessment_candidate", schemaVersion: "5.0.0", criteria: stage.rubric.map(r => ({ criterionRef: r.criterionRef,
    disposition: "satisfied", explanation: "Structural relation witness only", sourceQuotes: [], statementRefs: envelope.assets.at(-1).candidate.asset.statements.map(s => s.statementRef) })), pressure: [] };
  const next = product.deriveSemanticJobAssessment(envelope, stage.declarationRef, raw, source("assessor" + ordinal, envelope)); assert.ok(next); return next;
}
function before(index) {
  let envelope = empty();
  for (const [ordinal, stage] of declaration.stages.slice(0, index).entries()) {
    envelope = product.deriveSemanticJobAsset(envelope, stage.declarationRef, candidate(envelope, stage, ordinal === 2), source("author" + ordinal, envelope)); assert.ok(envelope);
    envelope = assess(envelope, stage, ordinal);
  }
  return envelope;
}

function designResponse(candidate, contract) {
  const raw = structuredClone(candidate), select = (refs, domain) => refs.map(ref => {
    const index = domain.indexOf(ref); assert.ok(index >= 0); return index;
  });
  raw.kind = "semantic_job_design_response";
  for (const s of raw.asset.statements) {
    s.requirementRefs = select(s.requirementRefs, contract.requirementRefs);
    s.obligationRefs = select(s.obligationRefs, contract.obligationRefs);
    s.predecessorStatementRefs = select(s.predecessorStatementRefs, contract.predecessorStatementRefs);
    for (const q of s.sourceQuotes) q.memberRef = select([q.memberRef], contract.sourceMemberRefs)[0];
  }
  for (const p of raw.asset.pressure) p.requirementRefs = select(p.requirementRefs, contract.requirementRefs);
  for (const t of raw.design?.targets ?? []) {
    t.obligationRefs = select(t.obligationRefs, contract.obligationRefs);
    t.bindingVersionRefs = select(t.bindingVersionRefs, contract.design.active.map(b => b.versionRef));
  }
  return raw;
}
function designWitness() {
  const input = before(3), stage = declaration.stages[3], contract = product.projectSemanticJobActorContract(input, stage.declarationRef, "author");
  const canonical = candidate(input, stage), s = canonical.asset.statements[0], cap = job.worksiteScope.executableCapabilities[0];
  s.requirementRefs = [...contract.requirementRefs]; s.obligationRefs = [...contract.obligationRefs];
  s.predecessorStatementRefs.reverse();
  canonical.asset.pressure = [{ pressureRef: "pressure:retained", text: "Keep this authored uncertainty.", requirementRefs: [...contract.requirementRefs], disposition: "unassessed" }];
  canonical.design = { targets: ["implementation", "verifier"].map((role, i) => ({ relativePath: `app/selected-${i}.mjs`, role,
    obligationRefs: [...contract.obligationRefs], bindingVersionRefs: contract.design.active.map(b => b.versionRef), changeInstruction: "Preserve each selected meaning." })),
    dependencyPaths: [], dependencyDisposition: "sufficient", commands: [{ commandId: "command:check", executable: cap.executable,
      args: ["requirementRefs", "0"], relativeCwd: "app", environment: {}, timeoutMs: 100, terminationGraceMs: 100, expectedReports: [] }], outcomePredicates: [] };
  return { input, stage, contract, canonical, raw: designResponse(canonical, contract) };
}
test("Design response expands exact selections without authoring or rewriting semantic payloads", async () => {
  const { default: Ajv } = await import("ajv");
  const { input, stage, contract, canonical, raw } = designWitness();
  const schema = semanticJobWorkerResultSchema("author", stage.bodyCapabilities, contract), validate = new Ajv({ strict: false }).compile(schema);
  assert.equal(validate(raw), true, JSON.stringify(validate.errors)); assert.equal(validate(canonical), false);
  assert.equal(isSemanticJobDesignResponse(raw), true); assert.equal(isSemanticJobAssetCandidate(raw), false);
  assert.equal(ABI5_SEMANTIC_STAGE_PRODUCT_SEMANTICS.validateContractValue("semantic_stage_worker_result", raw), true);
  const expanded = materializeSemanticJobDesignResponse(input, stage.declarationRef, raw);
  assert.deepEqual(expanded, canonical);
  assert.deepEqual(product.evaluateSemanticJobActorCandidate(input, stage.declarationRef, "author", expanded), []);
  assert.equal(product.deriveSemanticJobAsset(input, stage.declarationRef, raw, source("raw", input)), null);
  const authored = product.deriveSemanticJobAsset(input, stage.declarationRef, expanded, source("expanded", input)); assert.ok(authored);
  assert.deepEqual(product.projectSemanticJobActorContext(authored, stage.declarationRef, "assessor").currentCandidate.candidate, canonical);
  const payload = structuredClone(raw);
  payload.design.outcomePredicates = [{ predicateId: "payload:unchanged", predicateKind: "opaque-component-witness",
    declaration: { requirementRefs: [0, "literal"], sourceQuotes: [{ memberRef: 17, quote: "literal" }], bindingVersionRefs: [88] } }];
  const preserved = materializeSemanticJobDesignResponse(input, stage.declarationRef, payload);
  assert.deepEqual(preserved.design.outcomePredicates, payload.design.outcomePredicates);
  assert.deepEqual(preserved.design.commands, canonical.design.commands);
  const pressureOnly = { ...raw, design: null };
  assert.deepEqual(materializeSemanticJobDesignResponse(input, stage.declarationRef, pressureOnly), { ...canonical, design: null });
});
test("Design response refuses malformed or unavailable selections and preserves canonical coverage checks", () => {
  const { input, stage, contract, raw } = designWitness();
  const malformed = [
    r => { r.asset.statements[0].requirementRefs = [contract.requirementRefs.length]; },
    r => { r.asset.statements[0].obligationRefs = [contract.obligationRefs.length]; },
    r => { r.asset.statements[0].predecessorStatementRefs = [contract.predecessorStatementRefs.length]; },
    r => { r.asset.statements[0].sourceQuotes[0].memberRef = contract.sourceMemberRefs.length; },
    r => { r.asset.pressure[0].requirementRefs = [contract.requirementRefs.length]; },
    r => { r.design.targets[0].obligationRefs = [contract.obligationRefs.length]; },
    r => { r.design.targets[0].bindingVersionRefs = [contract.design.active.length]; },
    ...[-1, 0.5, "0", null, Number.MAX_SAFE_INTEGER + 1].map(value => r => { r.asset.statements[0].requirementRefs = [value]; }),
    r => { r.extra = true; }, r => { r.asset.statements[0].extra = true; },
    r => { r.asset.requirementCandidates = [{}]; }, r => { r.bindings = [{}]; },
    r => { r.kind = "semantic_job_asset_candidate"; }, r => { delete r.design; },
  ];
  for (const mutate of malformed) { const changed = structuredClone(raw); mutate(changed);
    assert.equal(materializeSemanticJobDesignResponse(input, stage.declarationRef, changed), null); }
  assert.equal(materializeSemanticJobDesignResponse(input, declaration.stages[2].declarationRef, raw), null);
  assert.equal(semanticJobUsesDesignResponse("assessor", stage.bodyCapabilities), false);
  assert.equal(semanticJobUsesDesignResponse("author", ["worksite_design", "requirement_refinement"]), false);
  assert.equal(semanticJobWorkerResultSchema("author", stage.bodyCapabilities).properties.kind.const, "semantic_job_asset_candidate", "canonical/default schema retained when no Design contract is selected");
  assert.equal(semanticJobWorkerResultSchema("assessor", stage.bodyCapabilities).properties.kind.const, "semantic_stage_assessment_candidate");
  const uncovered = structuredClone(raw); uncovered.design.targets.pop();
  const expanded = materializeSemanticJobDesignResponse(input, stage.declarationRef, uncovered); assert.ok(expanded);
  assert.ok(product.evaluateSemanticJobActorCandidate(input, stage.declarationRef, "author", expanded)
    .some(i => i.rule === "each_active_obligation_has_implementation_and_verifier_target"));
});

test("owner-derived Requirements domains distinguish incoming refs from same-response candidates", () => {
  const envelope = before(2), stage = declaration.stages[2], raw = candidate(envelope, stage, true);
  const contract = product.projectSemanticJobActorContract(envelope, stage.declarationRef, "author");
  assert.deepEqual(contract.requirementRefs, []); assert.deepEqual(contract.obligationRefs, []);
  assert.deepEqual(product.evaluateSemanticJobActorCandidate(envelope, stage.declarationRef, "author", raw), []);
  const bad = structuredClone(raw); bad.asset.statements[0].requirementRefs = ["candidate:one"];
  const issues = product.evaluateSemanticJobActorCandidate(envelope, stage.declarationRef, "author", bad);
  assert.equal(issues[0].path, "asset.statements[0].requirementRefs"); assert.deepEqual(issues[0].expected, []);
  assert.equal(product.deriveSemanticJobAsset(envelope, stage.declarationRef, bad, source("bad", envelope)), null);
  const authored = product.deriveSemanticJobAsset(envelope, stage.declarationRef, raw, source("author", envelope)); assert.ok(authored);
  const assessed = assess(authored, stage, "requirement"); assert.equal(product.projectSemanticJobBindings(assessed).length, 1);
});
test("Design naive variations report exact coverage and version-domain paths", () => {
  const envelope = before(3), stage = declaration.stages[3], active = product.projectSemanticJobBindings(envelope)[0];
  const cap = job.worksiteScope.executableCapabilities[0];
  const design = { targets: ["implementation", "verifier"].map((role, i) => ({ relativePath: `app/file-${i}.mjs`, role,
    obligationRefs: [active.binding.obligationRef], bindingVersionRefs: [active.versionRef], changeInstruction: "realize selected meaning" })), dependencyPaths: [], dependencyDisposition: "sufficient",
    commands: [{ commandId: "command:check", executable: cap.executable, args: [], relativeCwd: "app", environment: {}, timeoutMs: 100, terminationGraceMs: 100, expectedReports: [] }], outcomePredicates: [] };
  assert.equal(product.semanticJobDesignMatches(envelope, design), true);
  const contract = product.projectSemanticJobActorContract(envelope, stage.declarationRef, "author");
  assert.equal(contract.design.active[0].versionRef, active.versionRef);
  for (const [mutate, rule] of [
    [d => d.targets.pop(), "each_active_obligation_has_implementation_and_verifier_target"],
    [d => d.targets[0].bindingVersionRefs.pop(), "exact_selected_active_versions"],
    [d => d.targets[0].relativePath = "../escape", "writable_relative_path"],
    [d => d.commands[0].executable = "/not-granted", "exact_executable_capability"]]) {
    const varied = structuredClone(design); mutate(varied);
    assert.ok(product.semanticJobDesignIssues(envelope, varied).some(i => i.rule === rule)); assert.equal(product.semanticJobDesignMatches(envelope, varied), false);
  }
});
function partialRequirements() {
  const input = before(2), stage = declaration.stages[2], raw = candidate(input, stage, true);
  raw.asset.requirementCandidates.push({ ...raw.asset.requirementCandidates[0], candidateRef: "candidate:unbound" });
  raw.asset.pressure.push({ pressureRef: "pressure:unbound", text: "One discovered requirement still needs an assessed binding.", requirementRefs: [], disposition: "pending" });
  const authored = product.deriveSemanticJobAsset(input, stage.declarationRef, raw, source("partial-requirements", input)); assert.ok(authored);
  const assessed = assess(authored, stage, "partial-requirements");
  assert.equal(product.isSemanticJobEnvelope(assessed), true);
  assert.deepEqual(assessed.assets.at(-1).candidate, raw);
  return assessed;
}
test("partial Requirements and null Design pressure stay valid despite missing construction bindings", () => {
  const input = partialRequirements(), active = product.projectSemanticJobBindings(input);
  const missing = [input.assets.at(-1).groundedTerms[1].requirementRef];
  assert.equal(active.length, 1);
  assert.deepEqual(semanticJobMissingBindingRequirementRefs(input, active), missing);
  const stage = declaration.stages[3], raw = candidate(input, stage);
  raw.asset.pressure.push({ pressureRef: "pressure:design", text: "Required binding is unavailable.", requirementRefs: missing, disposition: "pending" });
  assert.deepEqual(product.evaluateSemanticJobActorCandidate(input, stage.declarationRef, "author", raw), []);
  const authored = product.deriveSemanticJobAsset(input, stage.declarationRef, raw, source("null-design", input)); assert.ok(authored);
  const assessed = assess(authored, stage, "null-design");
  assert.equal(assessed.assets.at(-1).candidate.design, null);
  assert.deepEqual(assessed.assets.at(-1).candidate.asset.pressure, raw.asset.pressure);
  const cap = job.worksiteScope.executableCapabilities[0];
  const design = { targets: ["implementation", "verifier"].map((role, i) => ({ relativePath: `app/file-${i}.mjs`, role,
    obligationRefs: [active[0].binding.obligationRef], bindingVersionRefs: [active[0].versionRef], changeInstruction: "realize selected meaning" })),
    dependencyPaths: [], dependencyDisposition: "unknown", commands: [{ commandId: "command:check", executable: cap.executable,
      args: [], relativeCwd: "app", environment: {}, timeoutMs: 100, terminationGraceMs: 100, expectedReports: [] }], outcomePredicates: [] };
  assert.deepEqual(product.semanticJobDesignIssues(input, design)
    .filter(i => i.rule === "every_grounded_requirement_has_active_binding").map(i => i.expected), missing);
});
test("generic document Design remains mechanical and independent assessment can falsify it", () => {
  const input = before(3), stage = declaration.stages[3], active = product.projectSemanticJobBindings(input)[0];
  const cap = job.worksiteScope.executableCapabilities[0];
  const raw = candidate(input, stage);
  raw.design = { targets: [["app/description.md", "implementation"], ["app/check.mjs", "verifier"]].map(([relativePath, role]) => ({
    relativePath, role, obligationRefs: [active.binding.obligationRef], bindingVersionRefs: [active.versionRef], changeInstruction: "realize selected meaning" })),
    dependencyPaths: [], dependencyDisposition: "sufficient", commands: [{ commandId: "command:check", executable: cap.executable,
      args: ["check.mjs"], relativeCwd: "app", environment: {}, timeoutMs: 100, terminationGraceMs: 100, expectedReports: [] }], outcomePredicates: [] };
  assert.equal(product.semanticJobDesignMatches(input, raw.design), true);
  const authored = product.deriveSemanticJobAsset(input, stage.declarationRef, raw, source("document-design", input)); assert.ok(authored);
  const assessment = { kind: "semantic_stage_assessment_candidate", schemaVersion: "5.0.0", criteria: stage.rubric.map(r => ({ criterionRef: r.criterionRef,
    disposition: "falsified", explanation: "Structurally allowed paths do not establish the document's semantic adequacy.", sourceQuotes: [], statementRefs: [raw.asset.statements[0].statementRef] })), pressure: [] };
  const assessed = product.deriveSemanticJobAssessment(authored, stage.declarationRef, assessment, source("document-assessor", authored)); assert.ok(assessed);
  assert.equal(assessed.assets.at(-1).assessment.disposition, "falsified");
  assert.equal(assessed.applicationCoverage, "non_closing");
});
test("Design preparation refuses missing binding refs before transport while Requirements context stays available", async () => {
  // Component frontier: supply authenticated basis/role facts; execute the
  // actual assembly and actor-preparation owners. No native process is allowed.
  const { SourceTextModule, SyntheticModule } = await import("node:vm");
  const input = partialRequirements(), stage = declaration.stages[3], missing = [input.assets.at(-1).groundedTerms[1].requirementRef];
  const basis = { publication: { semanticJobLifecycle: declaration }, cCall: { implementationRef: "component:author" }, predecessorPrefix: { coordinateDigest: hash("prefix") } };
  let selected = input;
  const owner = { role: "author", stage, events: [], inputRef: "component:input", inputDigest: hash(input),
    execution: { invocationAdmissionRef: "component:invocation", programRef: "component:program", basisRef: "component:basis", basisDigest: hash("basis") },
    call: { cCallRef: "component:call", cCallDigest: hash("call"), graphFunctionRef: "component:graph", programLocusRef: "component:locus", implementationRef: "component:author", inputContractRef: "component:input-contract" } };
  async function component(name, overrides) {
    const path = resolve(import.meta.dirname, "../../build/code/src", name + ".js");
    const module = new SourceTextModule(await readFile(path, "utf8"), { identifier: path });
    await module.link(async specifier => {
      const native = await import(specifier.startsWith("node:") ? specifier : pathToFileURL(resolve(dirname(path), specifier)).href);
      const values = { ...native, ...overrides[specifier] };
      return new SyntheticModule(Object.keys(values), function () { for (const [key, value] of Object.entries(values)) this.setExport(key, value); });
    });
    await module.evaluate(); return module.namespace;
  }
  const assembly = await component("abg/instruction_assembly", {
    "./execution_basis.js": { constructNativeInstructionAssemblyBasis: value => value },
    "./semantic_job.js": { authenticateSemanticJobBasis: () => owner,
      semanticJobInputMatchesBasis: (_, value) => value === selected && product.isSemanticJobEnvelope(value), semanticJobContextCurrent: () => true },
    "./stdo_environment.js": { projectRunEnvironmentRoleEvidence: () => null },
  });
  const expected = { kind: "native_instruction_assembly_refusal", cause: "unavailable_required_content", policy: stage.assembly.ruleRef, role: "author", unresolvedRefs: missing };
  assert.equal(hash(assembly.evaluateNativeInstructionAssembly(basis, input)), hash(expected));
  let nativeCalls = 0;
  const actor = await component("abg/actor_process", {
    "./instruction_assembly.js": assembly,
    "./execution_basis.js": { constructNativeInstructionAssemblyBasis: value => value },
    "./worker_transport.js": { prepareWorkerTransport: () => { nativeCalls++; throw new Error("unexpected native dispatch"); } },
  });
  const prepared = actor.prepareActorProcessInvocation(input, { semanticStageBasis: basis });
  assert.throws(() => prepared.prepareInstructionAssembly(), error => hash(error.cause) === hash(expected));
  assert.equal((await prepared.invokeActorProcess({ predecessorPrefix: basis.predecessorPrefix })).kind, "actor_process_effect_refusal");
  assert.equal(nativeCalls, 0);
  selected = before(2); owner.stage = declaration.stages[2]; owner.inputDigest = hash(selected);
  const requirements = assembly.evaluateNativeInstructionAssembly(basis, selected);
  assert.equal(requirements.kind, "native_instruction_assembly");
  assert.match(requirements.envelope.sections.role.native, /support declared document text as well as executable artifacts/);
  assert.match(requirements.envelope.sections.role.native, /independent semantic assessment must judge semantic adequacy/);
  assert.deepEqual(requirements.envelope.sections.role.actorContract, product.projectSemanticJobActorContract(selected, owner.stage.declarationRef, "author"));
});
test("semantic selection preserves meaning and ignores unrelated transport and superseded bodies", () => {
  const envelope = before(3), stage = declaration.stages[3];
  const projected = product.projectSemanticJobActorContext(envelope, stage.declarationRef, "author");
  assert.equal(projected.predecessors.length, stage.predecessorStageRefs.length); assert.equal(projected.currentCandidate, null);
  assert.equal(Object.hasOwn(projected.predecessors[0], "source"), false);
  const varied = structuredClone(envelope); varied.assets[0].source.promptDigest = hash("unrelated transport");
  varied.assets.push({ ...varied.assets[0], stageRef: "stage:unrelated" });
  assert.deepEqual(product.projectSemanticJobActorContext(varied, stage.declarationRef, "author"), projected);
  const raw = candidate(envelope, stage), authored = product.deriveSemanticJobAsset(envelope, stage.declarationRef, raw, source("design", envelope)); assert.ok(authored);
  const assessor = product.projectSemanticJobActorContract(authored, stage.declarationRef, "assessor");
  assert.deepEqual(assessor.currentCandidate.statementRefs, raw.asset.statements.map(s => s.statementRef));
  assert.equal(product.projectSemanticJobActorContext(authored, stage.declarationRef, "assessor").currentCandidate.assetRef, authored.assets.at(-1).assetRef);
});

// Interpret the two explicit prompt references using only bodies visible to the
// actor. This checks complete semantic conservation, not a byte-size target.
function expandPromptContext(prompt, groundedRequirements) {
  return { ...prompt, predecessors: prompt.predecessors.map(row => {
    if (!row.groundedRequirementRefs) return row;
    const { groundedRequirementRefs, ...body } = row;
    return { ...body, groundedTerms: groundedRequirementRefs.map(ref => {
      const terms = groundedRequirements.filter(t => t.requirementRef === ref);
      assert.equal(terms.length, 1); return terms[0];
    }) };
  }), activeBindings: prompt.activeBindings.map(row => {
    if (!row.policy.proposalSource) return row;
    const { proposalSource, ...policy } = row.policy;
    const asset = prompt.predecessors.find(a => a.assetRef === proposalSource.assetRef);
    assert.equal(asset.assessment.disposition, "satisfied");
    const proposal = asset.candidate.bindings[proposalSource.bindingIndex];
    return { ...row, policy: { ...policy, scope: proposal.scope, realizationMeaning: proposal.realizationMeaning,
      proofMeaning: proposal.proofMeaning, unprovedScope: proposal.unprovedScope, closureRule: proposal.closureRule } };
  }) };
}
test("prompt sharing conserves selected semantics and the complete independent-assessor candidate", () => {
  const input = before(3), stage = declaration.stages[3];
  const current = product.deriveSemanticJobAsset(input, stage.declarationRef, candidate(input, stage), source("design", input)); assert.ok(current);
  for (const [envelope, role] of [[input, "author"], [current, "assessor"]]) {
    const context = product.projectSemanticJobActorContext(envelope, stage.declarationRef, role), original = structuredClone(context);
    const contract = product.projectSemanticJobActorContract(envelope, stage.declarationRef, role);
    const prompt = projectSemanticJobPromptContext(envelope, context);
    assert.ok(prompt.predecessors.some(row => row.groundedRequirementRefs?.length));
    assert.ok(prompt.activeBindings.some(row => row.policy.proposalSource));
    assert.deepEqual(expandPromptContext(prompt, envelope.assets.flatMap(a => a.groundedTerms)), context);
    assert.deepEqual(context, original);
    assert.deepEqual(prompt.currentCandidate, context.currentCandidate);
    assert.deepEqual(prompt.predecessors.map(a => a.candidate), context.predecessors.map(a => a.candidate));
    assert.deepEqual(product.projectSemanticJobActorContract(envelope, stage.declarationRef, role), contract);
  }
});
test("prompt sharing retains full bodies when the visible source is absent, ambiguous or different", () => {
  const envelope = before(3), stage = declaration.stages[3];
  const original = product.projectSemanticJobActorContext(envelope, stage.declarationRef, "author");
  // Projection-boundary variations are deliberately not passed off as admitted
  // envelopes. No reference may hide any changed or non-visible meaning.
  for (const vary of [
    c => { c.predecessors = []; },
    c => { c.predecessors.at(-1).assessment.disposition = "indeterminate"; },
    c => { c.predecessors.at(-1).candidate.bindings[0].requirement.ref = "candidate:foreign"; },
    c => { c.activeBindings[0].policy.proofMeaning = [...c.activeBindings[0].policy.proofMeaning, "Distinct unshared proof duty"]; },
  ]) {
    const context = structuredClone(original); vary(context);
    const prompt = projectSemanticJobPromptContext(envelope, context);
    assert.deepEqual(prompt.activeBindings, context.activeBindings);
    assert.deepEqual(expandPromptContext(prompt, envelope.assets.flatMap(a => a.groundedTerms)), context);
  }
  const duplicate = structuredClone(envelope); duplicate.assets[0].groundedTerms.push(envelope.assets.at(-1).groundedTerms[0]);
  const ambiguous = projectSemanticJobPromptContext(duplicate, original);
  assert.deepEqual(ambiguous.predecessors.at(-1).groundedTerms, original.predecessors.at(-1).groundedTerms);
});

async function genericEnvironment() {
  const root = await mkdtemp(join(process.env.ABI5_CONTEXT_PROOF_ROOT ?? resolve(import.meta.dirname, "../../test_env"), "context-component-"));
  const sourceRoot = join(root, "source"), temporaryRoot = join(root, "temporary"); await mkdir(sourceRoot); await mkdir(temporaryRoot);
  const body = Buffer.from("Generic governance source. No STDO or Python dependency.\n"), member = { path: "policy.txt", type: "file", digest: bytes(body), target: null };
  await writeFile(join(sourceRoot, member.path), body);
  const record = Buffer.from(JSON.stringify({ kind: "run_environment_member_inventory", schemaVersion: "5.0.0", members: [member] }));
  const recordPath = join(root, "record.json"); await writeFile(recordPath, record);
  const contextMember = { memberRef: "member:policy", path: member.path, byteCount: body.length, digest: member.digest };
  const policyText = "Apply the exact declared source within the native role.";
  const program = { ...base.programs[0], policies: { ...base.programs[0].policies, "abg.run_environment": "environment:generic" } };
  const selectorsFor = (graph, role) => { const stage = declaration.stages.find(s => s.graphFunctionRef === graph.name);
    return ["full_source", "declared_predecessor_semantics", "active_binding_semantics", ...(role === "assessor" ? ["current_candidate"] : []),
      ...(stage?.bodyCapabilities.includes("worksite_design") ? ["current_worksite"] : []),
      ...(stage?.bodyCapabilities.includes("application_assessment") ? ["admitted_execution_evidence", ...(role === "assessor" ? ["assessor_evaluation_data"] : [])] : [])]; };
  const roles = base.graphFunctions.filter(g => program.callableMembership.includes(g.name)).flatMap(g => g.template.nodes.flatMap(n => cLeafTerms(n.term))
    .filter(leaf => leaf.fibre === "F_P").map(leaf => ({ graphFunctionRef: g.name, programLocusRef: leaf.programLocusRef,
      role: gtl.nativeContextLeafFamily(g, leaf), frameRefs: ["frame:generic"], policy: { policyRef: "policy:generic", text: policyText, digest: bytes(Buffer.from(policyText)) },
      accessRefs: [], sourceBindings: [{ contextRef: "context:generic", memberRef: contextMember.memberRef, memberDigest: member.digest, startByte: 0, endByte: body.length, spanDigest: member.digest }],
      contextPolicy: { policyRef: "policy:context", selectors: selectorsFor(g, gtl.nativeContextLeafFamily(g, leaf)) } })));
  const environment = gtl.constructRunEnvironmentDeclaration({ kind: "run_environment_declaration", schemaVersion: "5.0.0", declarationRef: "environment:generic",
    dependencies: [{ dependencyRef: "dependency:generic", basisRef: "generic://fixture/", recordRef: "record:generic", recordDigest: bytes(record), recordFormat: "member_inventory@1", inventoryDigest: gtl.stdoInventoryDigest([member]), members: [member] }],
    contexts: [{ contextRef: "context:generic", sourceLocator: "generic://fixture/", inventoryDigest: hash([contextMember]), members: [contextMember] }], corpusAccess: null, accesses: [], roles });
  const publication = { ...base, programs: [program], runEnvironments: [environment] }, authority = { authorityRef: "authority:one", authorityDigest: hash("authority"), actorRef: "actor:one" };
  const coordinates = { dependencies: [{ dependencyRef: "dependency:generic", root: sourceRoot, recordPath }], pythonPath: null, temporaryRoot };
  const resources = product.constructRunEnvironmentResources({ kind: "run_environment_resources", schemaVersion: "5.0.0", ...coordinates,
    permission: { ...authority, programRef: program.programRef, environmentRef: environment.declarationRef, environmentDigest: hash(environment), operations: ["read_context"], ...coordinates } });
  return { root, sourceRoot, body, environment, publication, program, authority, resources, input: { publication, program, authority, graphFunctions: base.graphFunctions, archiveRoot: root, resources } };
}
test("generic environment selects published members despite co-located unselected files", async () => {
  const fixture = await genericEnvironment(), original = await product.observeRunEnvironment(fixture.input);
  assert.equal(original.kind, "run_environment_observed");
  const extra = join(fixture.sourceRoot, "unselected.txt"), missing = join(fixture.sourceRoot, "policy.txt");
  await mkdir(join(fixture.sourceRoot, "external-evidence"));
  await writeFile(extra, "Unselected bytes must not enter the admitted Context.");
  await writeFile(join(fixture.sourceRoot, "external-evidence", "record.json"), "not even JSON");
  await symlink("absent-unselected-target", join(fixture.sourceRoot, "external-link"));
  await chmod(extra, 0);
  try {
    // Neither unreadable extra contents nor an unresolved unselected link is a
    // dependency. The complete observed evidence stays exactly the same.
    assert.deepEqual(await product.observeRunEnvironment(fixture.input), original);
    await rename(missing, missing + ".unselected");
    const absent = await product.observeRunEnvironment(fixture.input);
    assert.equal(absent.kind, "run_environment_refusal"); assert.equal(absent.cause, "access_unavailable");
    await rename(missing + ".unselected", missing);
    await writeFile(missing, "changed declared bytes");
    const changed = await product.observeRunEnvironment(fixture.input);
    assert.equal(changed.kind, "run_environment_refusal"); assert.equal(changed.cause, "identity_mismatch");
    await writeFile(missing, fixture.body);
    assert.deepEqual(await product.observeRunEnvironment(fixture.input), original);
  } finally { await chmod(extra, 0o600); }
});
test("generic exact-byte ingress, crossed Public coordinates, source mismatch and source-unavailable evidence replay", async () => {
  const fixture = await genericEnvironment(); assert.equal(relation.validRunEnvironmentProgram(fixture.publication, fixture.program, base.graphFunctions), true);
  const observed = await product.observeRunEnvironment(fixture.input); assert.equal(observed.kind, "run_environment_observed", JSON.stringify(observed));
  assert.equal(evidence.isRunEnvironmentEvidence(observed.evidence), true); assert.equal(observed.evidence.corpusDocuments, null); assert.deepEqual(observed.evidence.accesses, []);
  await writeFile(join(fixture.sourceRoot, "policy.txt"), "changed source bytes");
  assert.equal((await product.observeRunEnvironment(fixture.input)).cause, "identity_mismatch");
  await writeFile(join(fixture.sourceRoot, "policy.txt"), fixture.body);
  for (const field of ["authorityRef", "authorityDigest", "actorRef", "programRef", "environmentRef", "environmentDigest", "operations", "dependencies", "pythonPath", "temporaryRoot"]) {
    const changed = structuredClone(fixture.resources); changed.permission[field] = field.endsWith("Digest") ? hash("wrong") : field === "operations" ? ["read_context", "validate"] : field === "dependencies" ? [] : "wrong";
    const refusal = await product.observeRunEnvironment({ ...fixture.input, resources: changed }); assert.equal(refusal.kind, "run_environment_refusal", field);
  }
  const wrongDeclaration = structuredClone(fixture.environment); wrongDeclaration.roles[0].sourceBindings[0].spanDigest = hash("wrong span");
  const wrongResources = structuredClone(fixture.resources); wrongResources.permission.environmentDigest = hash(wrongDeclaration);
  const mismatch = await product.observeRunEnvironment({ ...fixture.input, publication: { ...fixture.publication, runEnvironments: [wrongDeclaration] }, resources: wrongResources });
  assert.equal(mismatch.cause, "identity_mismatch");
  const events = [{ kind: "invocation_admitted", payload: { invocationAdmissionRef: "invocation:one", ...fixture.authority, runEnvironment: observed.evidence } }];
  const role = fixture.environment.roles[0], project = () => evidence.projectRunEnvironmentRoleEvidence(events, "invocation:one", fixture.publication, fixture.program.programRef, role.graphFunctionRef, role.programLocusRef, role.role);
  const saved = project(); assert.equal(saved.sourceContent[0].text, fixture.body.toString());
  await rename(fixture.sourceRoot, fixture.sourceRoot + "-unavailable"); assert.deepEqual(project(), saved); assert.equal(evidence.isRunEnvironmentEvidence(observed.evidence), true);
  assert.equal(relation.runEnvironmentForProgram({ ...fixture.publication, stdoRunEnvironments: [] }, fixture.program), false);
  assert.throws(() => gtl.constructStdoRunEnvironmentDeclaration(fixture.environment), /STDO requires/);
  console.log(JSON.stringify({ proof: "generic_environment_exact_bytes", sourceUnavailableReplay: true, nativeRoles: fixture.environment.roles.length, pythonUsed: false }));
});

test("Public-start exact positive and schema-valid crossed input coordinate use the existing preparation owner", { skip: process.env.ABI5_CONTEXT_PUBLIC_PROOF !== "1", timeout: 300000 }, async () => {
  const root = resolve(import.meta.dirname, "../..");
  const environment = await setupInstalledRootCatalog({ after() {} }, root, { candidateBasisSource: "packed_artifact", workspaceProductIndex: 1,
    prepareAdditionalProducts: async basis => [await prepareGenericJobIntakeProduct({ ...basis, declarationFactory: genericLifecyclePublicationData })] });
  const { product: installed, gtl: installedGtl, abg } = environment, publication = environment.additionalPublications[0];
  environment.catalog = installed.admitGraphFunctionCatalog({ workspaceBinding: environment.bindingCandidate, resolvedLock: environment.lock,
    verifiedProducts: environment.verifiedProducts, installedProducts: environment.installCandidates, publications: [...nativePublications(installedGtl, environment.verified), publication] });
  assert.equal(environment.catalog.kind, "graph_function_catalog");
  environment.catalogView = installed.narrowGraphFunctionCatalog(environment.catalog, publication.programs[0].callableMembership);
  const publicApi = await import(pathToFileURL(join(environment.installedRoot, "build/code/src/public/index.js")).href);
  const operations = await import(pathToFileURL(join(environment.installedRoot, "build/code/src/product/run_invocation_operation.js")).href);
  const closed = environment.store.projectReopenAuthorityAndClose();
  const eventResource = { kind: "reopen_abg_event_resource", schemaVersion: "5.0.0", closeHandoff: closed, handoffDigest: installed.sha256Canonical(closed) };
  const { call } = await constructGenericIntakeStart({ environment, publicApi, eventResource, input: ordinaryJob(installed, installedGtl, text), identity: "context-authority" });
  const prepare = invocation => operations.prepareProductRunInvocation({ memberKey: "start", invocation,
    resources: { catalog: call.resources.catalog, catalogView: call.resources.catalogView, applications: call.resources.applications, source: { kind: "none" } },
    admittedInstalls: environment.admittedInstalls, workspaceBinding: environment.workspaceBinding,
    verifyInstallAdmission: install => abg.hasAdmittedProductInstall(environment.artifactTruth, install), transportResourceAssertion: eventResource });
  const positive = await prepare(call.invocation); assert.equal(positive.kind, "prepared_product_run_invocation", JSON.stringify(positive));
  const fields = ["input_contract"];
  for (const field of fields) {
    const invocation = structuredClone(call.invocation);
    invocation.invocationAuthority.slots[field] = { ...call.invocation.invocationAuthority.slots.input_contract, valueRef: "value:crossed" };
    const refused = await prepare(invocation); assert.equal(refused.kind, "product_run_invocation_preparation_refusal", field);
  }
  await writeFile(join(environment.scratch, "context-public-authority-proof.json"), JSON.stringify({ kind: "context_public_authority_proof", positive: positive.kind, crossed: fields, providerCalls: 0 }, null, 2));
  console.log(JSON.stringify({ proof: "public_start_exact_positive_crossed_input", root: environment.scratch, crossed: fields.length, providerCalls: 0 }));
});

test("exact released a_c validation and emitted-map equality are structural access, not frame application", { skip: !process.env.ABI5_CONTEXT_STDO_CONFIGURATION }, async () => {
  const configuration = process.env.ABI5_CONTEXT_STDO_CONFIGURATION;
  const environment = JSON.parse(await readFile(join(configuration, "run-environment.json"), "utf8"));
  const supplied = JSON.parse(await readFile(join(configuration, "run-environment-resources.json"), "utf8"));
  const module = await import(pathToFileURL(process.env.ABI5_CONTEXT_ODD_DECLARATIONS).href);
  const publication = module.constructFullSandboxPackage({ product, gtl, abiArtifact: { ...abiArtifact, manifestDigest: zeros }, runEnvironment: environment }).bundle.consumerPublication;
  const programs = publication.programs.filter(p => p.policies[gtl.RUN_ENVIRONMENT_POLICY] === environment.declarationRef); assert.equal(programs.length, 1);
  const program = programs[0], archiveRoot = await mkdtemp(join(process.env.ABI5_CONTEXT_PROOF_ROOT, "stdo-access-")), temporaryRoot = join(archiveRoot, "temporary"); await mkdir(temporaryRoot);
  const authority = { authorityRef: "authority:structural", authorityDigest: hash("structural"), actorRef: "actor:structural" };
  const coordinates = { dependencies: supplied.dependencies, pythonPath: supplied.pythonPath, temporaryRoot };
  const resources = product.constructRunEnvironmentResources({ kind: "run_environment_resources", schemaVersion: "5.0.0", ...coordinates,
    permission: { ...authority, programRef: program.programRef, environmentRef: environment.declarationRef, environmentDigest: hash(environment), operations: supplied.operations, ...coordinates } });
  const graphs = [...publication.graphFunctions, ...gtl.constructWorksiteConstructionModulePublication(abiArtifact).graphFunctions, ...gtl.constructWorksiteCommandExecutionModulePublication(abiArtifact).graphFunctions];
  const observed = await product.observeRunEnvironment({ publication, program, graphFunctions: graphs, authority, archiveRoot, resources });
  assert.equal(observed.kind, "run_environment_observed", JSON.stringify(observed)); assert.ok(evidence.isRunEnvironmentEvidence(observed.evidence));
  assert.equal(observed.evidence.accesses[0].projection.status, "valid"); assert.ok(observed.evidence.accesses[0].output);
  await writeFile(join(archiveRoot, "run-environment-evidence.json"), JSON.stringify(observed.evidence, null, 2));
  console.log(JSON.stringify({ proof: "actual_released_structural_access", evidenceDigest: observed.evidence.evidenceDigest, archiveRoot, frameApplicationClaim: false }));
});
