import assert from "node:assert/strict";
import { mkdir, readFile, writeFile, lstat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { worksiteFixture } from "../support/t287-generic-job-worksite.mjs";
import { genericLifecyclePublicationData, installGenericJobTransport } from "../support/t287-generic-job-lifecycle.mjs";
import { ordinaryJob } from "../support/t287-generic-job-intake.mjs";

const root = process.env.ABI5_GENERIC_JOB_BUILD_ROOT ?? resolve(import.meta.dirname, "../..");
const load = name => import(pathToFileURL(join(root, "build/code/src", name + ".js")).href);
const [product, gtl, effects, operations, command, preparation, jobs, prefixes, origins, provenance] = await Promise.all([
  "product/index", "gtl/index", "product/worksite_effect", "product/worksite_operations", "product/worksite_command_execution",
  "product/worksite_preparation", "abg/semantic_job", "abg/event_prefix", "abg/worksite_revision", "abg/worksite_input_provenance"].map(load));
const owner = { ...product, ...effects, ...operations }, hash = product.sha256Canonical;

// Retired (T-292 TD-60): completed native Evidence keeps its initial Design/context read origin; input the completed native Evidence scratch root not recorded

test("initial read-only context stays outside C1 and inside C2; cold origin claims refuse", async () => {
  // Cold component proof: actual observations/replacements, no fabricated ABG
  // admission. The integrated native test owns positive source authentication.
  const env = await worksiteFixture(owner), operating = { workspaceAuthorityBasis: env.workspaceAuthorityBasis,
    workspaceBinding: env.workspaceBinding, capabilityGrant: env.capabilityGrant };
  await mkdir(join(env.canonicalRoot, "shared")); await mkdir(join(env.canonicalRoot, "app"));
  const library = "export const greeting = 'Hello World';\n", libraryPath = join(env.canonicalRoot, "shared/lib.mjs");
  await writeFile(libraryPath, library, { flag: "wx" });
  const originalStat = await lstat(libraryPath);
  const initial = ordinaryJob(product, gtl, "Build an app and independent verifier using the existing shared library without changing it.");
  const input = product.constructSemanticJobInput({ ...initial, worksiteScope: { ...initial.worksiteScope, readRoots: ["app", "shared"] } });
  const zero = "sha256:" + "0".repeat(64), publication = gtl.constructSemanticStageModulePublication({ productId: product.ABI5_PRODUCT_ID,
    packageName: product.ABI5_PACKAGE_NAME, packageVersion: product.ABI5_PACKAGE_VERSION, artifactDigest: zero, productContentDigest: zero, productManifestDigest: zero });
  const declaration = genericLifecyclePublicationData({ product, gtl, abiPublication: publication }).semanticJobLifecycle;
  let envelope = product.constructSemanticJobEnvelope(input, declaration, { invocationAdmissionRef: "component:invocation",
    rootExecutionBasisRef: "component:root", rootInputRef: "component:input", rootInputDigest: hash(input),
    intakeCCallRef: "component:intake", intakeCCallDigest: hash("intake"), intakeExecutionBasisRef: "component:intake-basis" });
  const source = (name, value) => ({ cCallRef: name, inputDigest: hash(value), actorInvocationRef: name,
    promptDigest: hash(name), transportDigest: hash(name + ":transport") });
  const quote = { memberRef: input.members[0].memberRef, quote: Buffer.from(input.members[0].base64, "base64").toString() };
  for (const [index, stage] of declaration.stages.slice(0, 4).entries()) {
    if (index === 3) envelope = { ...envelope, context: await operations.observeWorksiteContext({ ...operating,
      readRoots: input.worksiteScope.readRoots, maxFiles: declaration.bounds.maxContextFiles, maxBytes: declaration.bounds.maxContextBytes }) };
    const active = product.projectSemanticJobBindings(envelope);
    const candidate = { kind: "semantic_job_asset_candidate", schemaVersion: "5.0.0", asset: { kind: "semantic_stage_asset_candidate", schemaVersion: "5.0.0",
      statements: [{ statementRef: stage.declarationRef + "/statement", text: quote.quote, modality: "supporting", sourceQuotes: [quote],
        requirementRefs: [], obligationRefs: [], predecessorStatementRefs: envelope.assets.flatMap(a => a.candidate.asset.statements.map(s => s.statementRef)) }],
      requirementCandidates: index === 2 ? [{ candidateRef: "component:requirement", meaning: quote.quote, sourceQuotes: [quote], parentRequirementRefs: [] }] : [],
      worksiteDesign: null, pressure: [] }, bindings: index === 2 ? [{ requirement: { kind: "candidate", ref: "component:requirement" }, previousVersionRef: null,
        templateRef: declaration.proofTemplates[0].templateRef, scope: "Component read/write discriminator", realizationMeaning: ["App uses existing library"],
        proofMeaning: ["Independent verifier"], unprovedScope: ["No native or semantic acceptance"], closureRule: "Non-closing", requiredContent: [] }] : [],
      design: index === 3 ? { targets: [["app/main.mjs", "implementation"], ["app/check.mjs", "verifier"]].map(([relativePath, role]) => ({ relativePath, role,
        obligationRefs: active.map(b => b.binding.obligationRef), bindingVersionRefs: active.map(b => b.versionRef), changeInstruction: "Implement the declared role" })),
        dependencyPaths: ["shared/lib.mjs"], dependencyDisposition: "sufficient", commands: [{ commandId: "component:check", executable: process.execPath,
          args: ["check.mjs"], relativeCwd: "app", environment: {}, timeoutMs: 5000, terminationGraceMs: 1000, expectedReports: [] }], outcomePredicates: [] } : null };
    const authored = product.deriveSemanticJobAsset(envelope, stage.declarationRef, candidate, source("component:author:" + index, envelope)); assert.ok(authored);
    const assessment = { kind: "semantic_stage_assessment_candidate", schemaVersion: "5.0.0", criteria: stage.rubric.map(r => ({ criterionRef: r.criterionRef,
      disposition: "satisfied", explanation: "Mechanical carrier fixture, no semantic acceptance", sourceQuotes: [quote],
      statementRefs: authored.assets.at(-1).candidate.asset.statements.map(s => s.statementRef) })), pressure: [] };
    envelope = product.deriveSemanticJobAssessment(authored, stage.declarationRef, assessment, source("component:assessor:" + index, authored)); assert.ok(envelope);
  }
  const design = envelope.assets.at(-1).candidate.design;
  const territory = product.constructWorksiteTerritory({ ...operating, relativeRoot: "app", territoryUri: pathToFileURL(join(env.canonicalRoot, "app")).href });
  const targets = [];
  for (const target of design.targets) {
    const subject = product.constructWorksiteSubject({ ...operating, relativePath: target.relativePath, subjectUri: pathToFileURL(join(env.canonicalRoot, target.relativePath)).href });
    const predecessorObservation = await operations.observeWorksiteSubject(env.workspaceAuthorityBasis, env.workspaceBinding, subject);
    const task = product.constructWorksiteConstructionTask({ ...operating, prompt: "Cold target observation", targets: [{ subject, territory, predecessorObservation }] });
    targets.push({ target: task.targets[0], base64: "", role: target.role });
  }
  const worksite = { ...operating, targets, commands: design.commands, outcomePredicates: design.outcomePredicates,
    allowedWriteTerritories: [{ pathKind: "subtree", relativePath: "proof" }] };
  const entry = product.deriveSemanticJobPreparation(envelope, worksite); assert.ok(entry);
  assert.deepEqual(entry.constructionTask.targets.map(t => t.subject.relativePath), ["app/main.mjs", "app/check.mjs"]);
  assert.equal(entry.readDependencyBasis.members[0].subject.relativePath, "shared/lib.mjs");
  assert.match(entry.constructionTask.prompt, /currentReadOnlyDependencies/);
  assert.deepEqual(jobs.semanticJobSavedWorksite(envelope, entry), worksite);
  const transport = await installGenericJobTransport(env.scratch), response = spawnSync(process.execPath,
    [transport, "--json-schema", JSON.stringify(product.worksiteConstructionWorkerResultSchema(entry.constructionTask))],
    { input: entry.constructionTask.prompt, encoding: "utf8", maxBuffer: 1048576 });
  assert.equal(response.status, 0, response.stderr);
  const doubleCandidate = JSON.parse(JSON.parse(response.stdout.trim().split("\n").at(-1)).result);
  assert.ok(product.constructWorksiteConstructionWorkerResult(entry.constructionTask, doubleCandidate));
  assert.match(doubleCandidate.files[0].replacementText, /\.\.\/shared\/lib\.mjs/);
  const outputs = [];
  for (const [ordinal, target] of entry.constructionTask.targets.entries()) {
    const replacementBytes = Buffer.from(ordinal === 0 ? "import { greeting } from '../shared/lib.mjs';\nexport const answer = () => greeting;\n"
      : "import assert from 'node:assert/strict';\nimport { answer } from './main.mjs';\nassert.equal(answer(), 'Hello World');\n");
    const request = product.constructWorksiteFileReplaceRequest({ ...operating, ...target, predecessorObservation: target.predecessorObservation, replacementBytes });
    const authorization = effects.constructWorksiteEffectAuthorization({ ...env, request });
    const result = await operations.replaceWorksiteFile({ ...env, request, authorization }); assert.equal(result.disposition, "committed");
    outputs.push({ ordinal, inputMemberRef: target.targetRef, outputMemberRef: "component:output:" + ordinal,
      value: { kind: "worksite_file_replace_output", schemaVersion: "5.0.0", authorization, receipt: result.receipt, successorObservation: result.successorObservation } });
  }
  const construction = product.reduceWorksiteFileReplaceResults({ kind: "gtl_fan_out_vector", schemaVersion: "5.0.0",
    applicationRef: product.WORKSITE_CONSTRUCTION_IDS.fanOutApplicationRef, members: outputs });
  const task = preparation.prepareWorksiteCommandTask({ kind: "worksite_command_preparation_bound_input", schemaVersion: "5.0.0", entry, source: construction });
  assert.equal(command.isWorksiteCommandExecutionTask(task), true);
  assert.equal(task.sourceConstructionResult.members.length, 2);
  assert.deepEqual(task.protectedObservations.map(r => r.subject.relativePath), ["app/main.mjs", "app/check.mjs", "shared/lib.mjs"]);
  assert.equal((await import(pathToFileURL(join(env.canonicalRoot, "app/main.mjs")).href)).answer(), "Hello World");
  assert.equal(await readFile(libraryPath, "utf8"), library); const afterStat = await lstat(libraryPath);
  assert.equal(afterStat.ino, originalStat.ino); assert.equal(afterStat.dev, originalStat.dev);
  const emptyPrefix = prefixes.selectValidatedRuntimeEventPrefix(Object.freeze([]));
  assert.equal(jobs.semanticJobReadDependenciesAtPrefix(emptyPrefix, entry.readDependencyBasis), null);
  assert.equal(origins.worksiteExecutionSourcesCurrent(emptyPrefix, task), false);
  assert.equal(provenance.readDependencyPreparationHasNativeBridgeSourceAtPrefix(emptyPrefix, {
    parentBasis: env.executionBasis, parentCCallRef: env.cCall.cCallRef, entry }), false);
  const crossed = structuredClone(entry); crossed.readDependencyBasis.jobRef += "/other";
  assert.equal(preparation.isWorksitePreparationInput(crossed), false);
  const rehashed = command.constructWorksiteReadDependencyBasis({ ...entry.readDependencyBasis, jobRef: "component:other-job" });
  assert.equal(jobs.semanticJobReadDependenciesAtPrefix(emptyPrefix, rehashed), null);
  assert.equal(jobs.semanticJobSavedWorksite(envelope, { ...entry, readDependencyBasis: rehashed }), null);
  const revision = await load("product/worksite_revision");
  const retainedOrigin = { kind: "admitted_initial_job_bridge", resultAdmissionEventRef: "component:not-admitted", judgmentEventRef: "component:not-judged" };
  assert.equal(revision.isWorksiteRevisionObservationOrigin(retainedOrigin), true, "closed shape is not admission");
  assert.equal(origins.worksiteRevisionOriginSurvives(emptyPrefix, { designTargetRef: entry.readDependencyBasis.members[0].sourceMemberRef,
    subject: entry.readDependencyBasis.members[0].subject, observation: entry.readDependencyBasis.members[0].observation, origin: retainedOrigin }), false);
  const changed = structuredClone(task); changed.protectedObservations.pop(); assert.equal(command.isWorksiteCommandExecutionTask(changed), false);
  console.log(JSON.stringify({ scope: "cold physical and contract proof, not native admission", scratch: env.scratch, paidCalls: 0 }));
});
