import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";
import { constructFullSandboxPackage, constructOrdinaryJobInput, constructFullHelloInputs, selectOriginalHelloDeclaration, FULL_SANDBOX_IDS, FULL_HELLO_CASES,
  FULL_HELLO_TARGETS, FULL_HELLO_STAGE_MEANINGS, nativeFullSandboxPublications } from "./full-sandbox-declarations.mjs";
import { readFullSandboxCandidate, installedFullSandboxApis, ordinarySandboxInputs, evaluateOrdinaryJobObservation } from "./full-sandbox-support.mjs";
import { D1_WITNESS_IDS, D1_FROZEN_INPUT_SHA256 } from "./d1-lifecycle-declarations.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const candidatePath = process.env.ODD_GLC_ABI5_CANDIDATE_BASIS;
const managementConfigurationPath = process.env.ODD_GLC_MANAGEMENT_CONFIGURATION;
const sourceRoot = process.env.ODD_GLC_ABI5_SOURCE_BUILD_ROOT;
let product, gtl, validator, artifact, inputs;
if (sourceRoot && !candidatePath) {
  [product, gtl, validator] = await Promise.all(["product", "gtl", "validator"].map(name => import(pathToFileURL(join(sourceRoot, "build/code/src", name, "index.js")).href)));
  const zero = "sha256:" + "0".repeat(64);
  artifact = { productId: product.ABI5_PRODUCT_ID, packageName: product.ABI5_PACKAGE_NAME, packageVersion: product.ABI5_PACKAGE_VERSION, artifactDigest: zero, productContentDigest: zero, manifestDigest: zero };
  inputs = await ordinarySandboxInputs(product);
}
if (candidatePath) {
  const candidate = await readFullSandboxCandidate(candidatePath);
  ({ product, gtl, validator } = await installedFullSandboxApis(candidate.installedRoot));
  const checked = await product.ProductVerificationPort.verify({ kind: "product_verification_packet", schemaVersion: "5.0.0",
    memberKey: "verify", targetKind: "packed_artifact", request: { artifactPath: candidate.artifactPath,
      artifactRef: candidate.artifactPath.split("/").at(-1), expectedArtifactDigest: candidate.artifactDigest,
      expectedProductContentDigest: candidate.productContentDigest, expectedManifestDigest: candidate.manifestDigest,
      expectedProductId: candidate.productId, expectedPackageName: candidate.packageName, expectedPackageVersion: candidate.packageVersion } });
  assert.equal(checked.kind, "product_verification_success", JSON.stringify(checked));
  artifact = checked.verifiedArtifact;
  inputs = await ordinarySandboxInputs(product);
}
const native = { skip: candidatePath ? false : "PENDING: exact frozen successor ABI package not selected; current default pin is not used" };
const managedNative = { skip: candidatePath && managementConfigurationPath ? false : "PENDING: exact candidate and frozen management configuration both required" };

function validateDeclaredProgram(publication, freshNative = false) {
  const nativePublications = nativeFullSandboxPublications(gtl, artifact, freshNative), publications = [...nativePublications, publication];
  const program = publication.programs[0], admit = (value, kind, contract) => {
    const row = validator.rawAdmitValue(value, kind, "contract://abiogenesis/gtl/" + contract + "@5");
    assert.equal(row.kind, "raw_admitted_value", JSON.stringify(row)); return row;
  };
  const collected = (field, key) => {
    const values = new Map();
    for (const row of publications.flatMap(publication => publication[field])) {
      if (values.has(row[key])) assert.deepEqual(row, values.get(row[key]), "same declared coordinate has one exact value");
      else values.set(row[key], row);
    }
    return [...values.values()];
  };
  return validator.validateProgram({ declarationBasisDigest: product.sha256Canonical(publications),
    programPublication: admit(publication, "module_publication", "module-publication"), program: admit(program, "gtl_program", "program"),
    graphFunctions: collected("graphFunctions", "name").filter(graph => program.callableMembership.includes(graph.name)).map(row => admit(row, "graph_function", "graph-function")),
    contracts: collected("contracts", "contractRef").map(row => admit(row, "contract_declaration", "contract-declaration")),
    implementationBindings: collected("implementationBindings", "bindingRef").map(row => admit(row, "implementation_binding", "implementation-binding")),
    closureContracts: collected("closureContracts", "closureContractRef").map(row => admit(row, "closure_contract", "closure-contract")),
    evaluators: collected("evaluators", "name"), rules: collected("rules", "name") });
}

test("source fixtures keep the original full Hello obligations and an ordinary different request", async () => {
  const oracle = JSON.parse(await readFile(join(root, "test/fixtures/generic-job/basic-cli.oracle.json"), "utf8"));
  assert.deepEqual(oracle.requiredArtifacts, FULL_HELLO_TARGETS.map(([path]) => path));
  assert.deepEqual(oracle.requiredStageMeanings, FULL_HELLO_STAGE_MEANINGS);
  assert.equal(oracle.cases[0].stdout, "Hello, world!\n");
  assert.equal(oracle.minimumTestPasses, 2);
  assert.equal(oracle.requiredArtifacts.includes("test-execution-result.json"), false);
  const request = await readFile(join(root, "test/fixtures/generic-job/integer-addition.md"), "utf8");
  assert.match(request, /two integer\s+arguments/u);
  assert.doesNotMatch(request, /RequirementSet|DestinationTopologyAsset|replacementText|generated\//u);
  const second = JSON.parse(await readFile(join(root, "test/fixtures/generic-job/integer-addition.oracle.json"), "utf8"));
  assert.equal(second.cases[0].stdout, "5\n");
  assert.equal(second.cases.length, 3);
});

test("native source input retains the complete unchanged original selected bytes", native, async () => {
  const originalBytes = await readFile(join(root, "test/glc-software-build-overlay-live.test.mjs"));
  const selected = selectOriginalHelloDeclaration(originalBytes, product), hello = inputs[0];
  assert.equal(hello.original.provenance.selectedDigest, product.sha256Bytes(selected.bytes));
  assert.equal(hello.members[0].base64, selected.bytes.toString("base64"));
  assert.equal(hello.members[0].sourceLocator.endsWith("#bytes=" + selected.provenance.startByte + "-" + selected.provenance.endByte), true);
  assert.throws(() => selectOriginalHelloDeclaration(Buffer.from("no selected source"), product));
});

const remainingHelloKeys = ["js-tenant-test", "js-sdlc-bootstrap", "rust-cli", "rust-service", "parallel-js"];
const callerApis = { skip: product ? false : "select the existing source build for caller value checks" };
test("remaining full Hello selections preserve original sources, oracles and capability data", callerApis, async () => {
  const bytes = await readFile(join(root, "test/glc-software-build-overlay-live.test.mjs"));
  const selected = await ordinarySandboxInputs(product, remainingHelloKeys);
  assert.deepEqual(selected.map(input => input.key), remainingHelloKeys);
  for (const input of selected) {
    const { startByte, endByte, selectedDigest } = input.original.provenance;
    assert.equal(input.members[0].base64, bytes.subarray(startByte, endByte).toString("base64"));
    assert.equal(selectedDigest, FULL_HELLO_CASES[input.key].sourceDigest);
    assert.deepEqual(input.evaluationData.requiredStageMeanings, FULL_HELLO_STAGE_MEANINGS);
    assert.equal(input.evaluationData.sourceSelection.digest, selectedDigest);
    assert.ok(input.evaluationData.requiredArtifacts.includes("design/test-design.md"));
    const executableCapabilities = [process.execPath, "/unit-only/cargo"].map(executable => ({
      executable, relativeCwdRoots: ["."], environment: {}, maxTimeoutMs: 120000, maxTerminationGraceMs: 1000 }));
    const job = constructOrdinaryJobInput({ product, gtl, input, executable: process.execPath, executableCapabilities });
    assert.equal(product.isSemanticJobInput(job), true);
    assert.deepEqual(job.members, input.members); assert.deepEqual(job.evaluationData, input.evaluationData);
    assert.deepEqual(job.worksiteScope.executableCapabilities, executableCapabilities);
  }
  assert.deepEqual((await ordinarySandboxInputs(product)).map(input => input.key), ["basic-cli", "integer-addition"]);
});

test("remaining full Hello selection rejects unknown, crossed and altered original inputs", callerApis, async () => {
  const bytes = await readFile(join(root, "test/glc-software-build-overlay-live.test.mjs"));
  const oracle = JSON.parse(await readFile(join(root, "test/fixtures/generic-job/js-tenant-test.oracle.json"), "utf8"));
  assert.throws(() => selectOriginalHelloDeclaration(bytes, product, "unknown"), /known original full Hello key/u);
  await assert.rejects(ordinarySandboxInputs(product, ["unknown"]), /known selected ordinary job/u);
  await assert.rejects(ordinarySandboxInputs(product, ["rust-cli", "rust-cli"]), /distinct selected ordinary jobs/u);
  assert.throws(() => constructFullHelloInputs({ product, originalSourceBytes: bytes, oracle, key: "rust-cli" }), /oracle belongs/u);
  const wrongDigest = { ...oracle, sourceSelection: { ...oracle.sourceSelection, digest: "sha256:" + "0".repeat(64) } };
  assert.throws(() => constructFullHelloInputs({ product, originalSourceBytes: bytes, oracle: wrongDigest, key: "js-tenant-test" }), /oracle exact original source/u);
  const selected = selectOriginalHelloDeclaration(bytes, product, "js-tenant-test");
  const altered = Buffer.from(bytes); altered[selected.provenance.startByte] = 9;
  assert.throws(() => selectOriginalHelloDeclaration(altered, product, "js-tenant-test"), /one original/u);
  const changedBody = Buffer.from(bytes); changedBody[selected.provenance.startByte + selected.bytes.indexOf("Hello, world!")] = 74;
  assert.throws(() => selectOriginalHelloDeclaration(changedBody, product, "js-tenant-test"), /unchanged original/u);
});

test("native generic declaration contains full topology and no fixed source declaration or input", native, () => {
  const built = constructFullSandboxPackage({ product, gtl, abiArtifact: artifact });
  const publication = built.bundle.consumerPublication, lifecycle = publication.semanticJobLifecycle;
  assert.equal(publication.owningProductId, FULL_SANDBOX_IDS.productId);
  assert.equal(built.manifest.packageName, "@odd-glc/route-one-typescript");
  assert.equal(nativeFullSandboxPublications(gtl, artifact).length, 9);
  assert.equal(publication.semanticLifecycle, undefined);
  assert.equal(publication.requirementHandoffs, undefined);
  assert.deepEqual(lifecycle.stages.map(row => row.assetSurface.kind),
    ["IntentAsset", "ProductDefinitionAsset", "RequirementSetAsset", "DestinationTopologyAsset", "EvidenceBindingAsset"]);
  assert.ok(lifecycle.stages.every(row => row.assetSurface.proofObligationRefs.length === 0));
  assert.ok(lifecycle.proofTemplates.every(row => row.requiredEvidenceRoles.length === 4));
  const graph = publication.graphFunctions.find(row => row.name === FULL_SANDBOX_IDS.graphFunctionRef);
  assert.deepEqual(graph.inputs, [gtl.SEMANTIC_STAGE_IDS.jobInputContractRef]);
  assert.equal(graph.template.nodes.length, 13); assert.equal(graph.template.edges.length, 12);
  assert.equal(publication.programs.length, 1);
  assert.ok(publication.programs[0].callableMembership.includes(gtl.WORKSITE_FILE_PARENTS_IDS.graphFunctionRef));
  assert.ok(Object.keys(built.files).every(path => !/\.(?:mjs|cjs|js|ts)$/u.test(path)), "installed GLC Product is declaration data only");
  const allBytes = Object.values(built.files).join("\n");
  assert.doesNotMatch(allBytes, /Hello, world|basic-cli|integer-addition|original-basic-cli|source-publication|independent-source-input|scenario-input/u);
  for (const [path] of FULL_HELLO_TARGETS) assert.equal(allBytes.includes(path), false);
  const design = lifecycle.stages.find(row => row.assetSurface.kind === "DestinationTopologyAsset");
  assert.equal(design.assembly.worksiteContentByRole.author, "current_inventory");
  assert.equal(design.assembly.worksiteContentByRole.assessor, "current_inventory");
});

test("two native raw inputs leave Product and Program bytes invariant (structural discriminator only)", native, () => {
  const before = constructFullSandboxPackage({ product, gtl, abiArtifact: artifact });
  const jobs = inputs.map(input => constructOrdinaryJobInput({ product, gtl, input, executable: process.execPath }));
  assert.ok(jobs.every(job => product.isSemanticJobInput(job)));
  assert.notEqual(product.sha256Canonical(jobs[0]), product.sha256Canonical(jobs[1]));
  assert.notDeepEqual(jobs[0].members, jobs[1].members);
  for (const job of jobs) {
    assert.deepEqual(Object.keys(job).sort(), ["kind", "schemaVersion", "lifecycleRef", "sourceRoleRef", "members", "taskData", "evaluationData", "worksiteScope"].sort());
    for (const name of ["targets", "requirements", "design", "envelope", "sourceHandoff"]) {
      assert.throws(() => product.constructSemanticJobInput({ ...job, [name]: [] }), "closed raw job excludes " + name);
    }
  }
  const after = constructFullSandboxPackage({ product, gtl, abiArtifact: artifact });
  assert.deepEqual(after.files, before.files);
  assert.equal(after.productContentDigest, before.productContentDigest);
  assert.deepEqual(after.bundle.consumerPublication.programs, before.bundle.consumerPublication.programs);
  // This test does not establish root/child admission or crossed-job refusal.
  // Those use the native integration owner's installed mechanical discriminator.
});

test("one configured builder carries all twelve native role loci for both ordinary inputs", managedNative, async () => {
  const configuration = JSON.parse(await readFile(managementConfigurationPath, "utf8"));
  const runEnvironment = gtl.constructRunEnvironmentDeclaration(configuration.runEnvironment);
  const before = constructFullSandboxPackage({ product, gtl, abiArtifact: artifact, runEnvironment });
  const publication = before.bundle.consumerPublication, program = publication.programs[0];
  const validation = validateDeclaredProgram(publication);
  assert.equal(validation.kind, "program_validation", JSON.stringify(validation));
  assert.equal(program.policies[gtl.RUN_ENVIRONMENT_POLICY], runEnvironment.declarationRef);
  assert.deepEqual(publication.runEnvironments, [runEnvironment]);
  assert.equal(publication.stdoRunEnvironments, undefined);
  assert.equal(program.policies["abg.stdo_run_environment"], undefined);
  assert.equal(runEnvironment.roles.length, 12);
  for (const stage of publication.semanticJobLifecycle.stages) {
    for (const role of runEnvironment.roles.filter(row => row.graphFunctionRef === stage.graphFunctionRef)) {
      for (const path of stage.assetSurface.standardsRefs) {
        assert.ok(role.sourceBindings.some(binding => runEnvironment.contexts.some(context => context.contextRef === binding.contextRef &&
          context.members.some(member => member.memberRef === binding.memberRef && member.path === path))), "delivered exact local standard " + path);
      }
    }
  }
  const jobs = inputs.map(input => constructOrdinaryJobInput({ product, gtl, input, executable: process.execPath }));
  assert.notEqual(product.sha256Canonical(jobs[0]), product.sha256Canonical(jobs[1]));
  const after = constructFullSandboxPackage({ product, gtl, abiArtifact: artifact, runEnvironment });
  assert.deepEqual(after.files, before.files);
  assert.deepEqual(after.bundle.consumerPublication.programs, publication.programs);
  assert.doesNotMatch(Object.values(before.files).join("\n"), /Hello, world|basic-cli|integer-addition/u);
});

test("native configured-Program relation refuses omitted or crossed F_P roles", managedNative, async () => {
  const configuration = JSON.parse(await readFile(managementConfigurationPath, "utf8"));
  const built = constructFullSandboxPackage({ product, gtl, abiArtifact: artifact, runEnvironment: configuration.runEnvironment });
  for (const change of [environment => environment.roles.pop(), environment => { environment.roles[0].programLocusRef += "/crossed"; }]) {
    const publication = structuredClone(built.bundle.consumerPublication);
    change(publication.runEnvironments[0]);
    const validation = validateDeclaredProgram(publication);
    assert.equal(validation.kind, "static_validation_refusal");
    assert.ok(validation.diagnostics.some(row => row.path === "$.runEnvironments"));
  }
});

test("predecessor fixed-source identities remain unchanged", () => {
  assert.equal(D1_WITNESS_IDS.packageName, "@odd-glc/d1-lifecycle-declaration-witness");
  assert.equal(D1_FROZEN_INPUT_SHA256.source, "13137b2080d9c9c6d8af5f5880f92b46a8cbbd4afc4c66451812e9e92f023871");
});

test("missing successor selection fails before any setup or default-pin fallback", async () => {
  await assert.rejects(readFullSandboxCandidate(), /explicit frozen successor candidate/u);
});

// Classifier unit values only. These are not native admitted evidence, job
// fixtures, application code, or a claim that any subject command has executed.
function commandObservation(args, { stdout = "", stderr = "", exitStatus = 0, ref = "unit-observation" } = {}) {
  return { observationRef: ref, executable: process.execPath, args, relativeCwd: ".", exitStatus,
    timedOut: false, processSignal: null, terminationConfirmed: true,
    stdout: { payload: Buffer.from(stdout).toString("base64") }, stderr: { payload: Buffer.from(stderr).toString("base64") } };
}
async function observationFixture(key, commands) {
  const oracle = JSON.parse(await readFile(join(root, "test/fixtures/generic-job/" + key + ".oracle.json"), "utf8"));
  const paths = oracle.requiredArtifacts ?? ["app/main.mjs", "checks/component.test.mjs", "checks/acceptance.test.mjs"];
  const verifierPaths = oracle.requiredTestFiles ?? paths.slice(1);
  const implementation = key === "basic-cli" ? "generated/hello-world.mjs" : "app/main.mjs";
  const targets = paths.map(relativePath => ({ role: verifierPaths.includes(relativePath) ? "verifier" : relativePath === implementation ? "implementation" : "configuration",
    target: { subject: { relativePath, subjectRef: "unit-subject:" + relativePath } } }));
  return { workspaceRoot: "/unit-only-not-an-actual-workspace",
    input: { evaluationData: oracle, worksiteScope: { executableCapabilities: [{ executable: process.execPath }] } },
    output: { worksite: { targets }, evidence: { executionObservation: { commandResults: commands },
      artifacts: targets.map(row => ({ subjectRef: row.target.subject.subjectRef, observationRef: "unit-artifact:" + row.target.subject.relativePath,
        role: row.role === "verifier" ? "verifier_artifact" : "realization",
        base64: Buffer.from("Unit-only artifact body; independent semantic review is still required.").toString("base64") })) } } };
}
const passingDiscovery = () => commandObservation(["--test"], { stdout: "# pass 2\n# fail 0\n", ref: "unit-node-discovery" });

test("remaining full Hello non-CLI outcomes stay explicitly unobserved pending semantic review", async () => {
  for (const key of remainingHelloKeys) {
    const oracle = JSON.parse(await readFile(join(root, "test/fixtures/generic-job/" + key + ".oracle.json"), "utf8"));
    const fixture = await observationFixture("basic-cli", [
      commandObservation(["generated/hello-world.mjs"], { stdout: "Hello, world!\n" }), passingDiscovery(),
    ]);
    fixture.input.evaluationData.cases = oracle.cases;
    const value = evaluateOrdinaryJobObservation(fixture);
    assert.ok(value.cases.every(row => row.disposition === "unexecuted_probe" && row.reason === "outside_direct_cli_interpretation"));
    assert.deepEqual(value.cases.map(row => row.expected), oracle.cases);
    assert.equal(value.applicationQualification, "unqualified_missing_independent_coverage");
    assert.equal(value.semanticReview.disposition, "required");
  }
});

test("native evidence targets use exact protected artifact observations without a legacy worksite", async () => {
  const fixture = await observationFixture("basic-cli", [
    commandObservation(["generated/hello-world.mjs"], { stdout: "Hello, world!\n" }), passingDiscovery(),
  ]);
  const legacy = evaluateOrdinaryJobObservation(fixture), targets = fixture.output.worksite.targets;
  fixture.output.assets = [{ candidate: { design: { targets: targets.map(row => ({ relativePath: row.target.subject.relativePath, role: row.role })) } } }];
  fixture.output.worksite = null;
  Object.assign(fixture.output.evidence.executionObservation, { kind: "worksite_command_execution_observation",
    task: { sourceNativeWork: { kind: "unit-only-native-source" }, protectedObservations: targets.map(row => ({
      subject: row.target.subject, observation: { observationRef: "unit-artifact:" + row.target.subject.relativePath } })) } });
  assert.deepEqual(evaluateOrdinaryJobObservation(fixture), legacy);
  fixture.output.evidence.artifacts[0].observationRef = "unit:crossed-observation";
  assert.equal(evaluateOrdinaryJobObservation(fixture).artifactCoverage[0].disposition, "not_in_admitted_evidence");
});

test("ordinary discovery and different valid vectors leave hidden Addition probes unqualified, not failed", async () => {
  const value = evaluateOrdinaryJobObservation(await observationFixture("integer-addition", [
    commandObservation(["app/main.mjs", "4", "6"], { stdout: "10\n" }), passingDiscovery(),
  ]));
  assert.equal(value.disposition, "unqualified");
  assert.ok(value.cases.every(row => row.disposition === "unexecuted_probe"));
  assert.deepEqual(value.testCommands[0].args, ["--test"]);
  assert.equal(value.testCommands[0].disposition, "observed_pass");
  assert.equal(value.minimumTestPasses.disposition, "met");
  assert.equal(value.verifierArtifacts.length, 2);
  assert.equal(value.semanticReview.disposition, "required");
});

test("recognized wrong CLI output is observed failure rather than an absent probe", async () => {
  const value = evaluateOrdinaryJobObservation(await observationFixture("integer-addition", [
    commandObservation(["app/main.mjs", "2", "3"], { stdout: "6\n" }), passingDiscovery(),
  ]));
  assert.equal(value.disposition, "observed_fail");
  assert.equal(value.cases[0].disposition, "observed_fail");
  assert.deepEqual(value.cases[0].observations[0].failures, ["stdout_mismatch"]);
  assert.equal(value.cases[1].disposition, "unexecuted_probe");
  assert.equal(value.applicationQualification, "unqualified_observed_failure");
});

test("one passing Addition probe cannot pass unexecuted invalid-input probes", async () => {
  const value = evaluateOrdinaryJobObservation(await observationFixture("integer-addition", [
    commandObservation(["app/main.mjs", "2", "3"], { stdout: "5\n" }), passingDiscovery(),
  ]));
  assert.deepEqual(value.cases.map(row => row.disposition), ["observed_pass", "unexecuted_probe", "unexecuted_probe"]);
  assert.equal(value.applicationQualification, "unqualified_missing_independent_coverage");
});

test("Hello observations plus discovery preserve every original artifact and still require semantic review", async () => {
  const value = evaluateOrdinaryJobObservation(await observationFixture("basic-cli", [
    commandObservation(["generated/hello-world.mjs"], { stdout: "Hello, world!\n" }), passingDiscovery(),
  ]));
  assert.equal(value.disposition, "observed_pass");
  assert.equal(value.applicationQualification, "unqualified_pending_independent_semantic_review");
  assert.equal(value.artifactCoverage.length, 7);
  assert.ok(value.artifactCoverage.every(row => row.disposition === "present_in_admitted_evidence"));
  assert.ok(value.requiredTestFiles.every(row => row.disposition === "present_in_admitted_evidence"));
  assert.ok(value.verifierArtifacts.every(row => Buffer.from(row.base64, "base64").toString("utf8").includes("independent semantic review")));
});

test("Node TAP and spec counts preserve missing, insufficient and failed observations", async () => {
  for (const [stdout, observed, countDisposition, qualification] of [
    ["# pass 2\n# fail 0\n", 2, "met", "unqualified_pending_independent_semantic_review"],
    ["ℹ pass 2\nℹ fail 0\n", 2, "met", "unqualified_pending_independent_semantic_review"],
    ["ℹ fail 0\n", null, "unobserved", "unqualified_missing_independent_coverage"],
    ["ℹ pass 2\n", null, "unobserved", "unqualified_missing_independent_coverage"],
    ["ℹ pass 1\nℹ fail 0\n", 1, "not_met", "unqualified_missing_independent_coverage"],
    ["ℹ pass 2\nℹ fail 1\n", 2, "met", "unqualified_observed_failure"],
  ]) {
    const value = evaluateOrdinaryJobObservation(await observationFixture("basic-cli", [
      commandObservation(["generated/hello-world.mjs"], { stdout: "Hello, world!\n" }),
      commandObservation(["--test"], { stdout }),
    ]));
    assert.deepEqual(value.minimumTestPasses, { required: 2, observed, disposition: countDisposition });
    assert.equal(value.applicationQualification, qualification);
    assert.equal(value.semanticReview.disposition, "required");
    if (qualification === "unqualified_observed_failure") assert.equal(value.testCommands[0].disposition, "observed_fail");
  }
});

test("an actual observed verifier failure is not hidden by a passing CLI probe", async () => {
  const value = evaluateOrdinaryJobObservation(await observationFixture("basic-cli", [
    commandObservation(["generated/hello-world.mjs"], { stdout: "Hello, world!\n" }),
    commandObservation(["--test"], { stdout: "# pass 1\n# fail 1\n", exitStatus: 1 }),
  ]));
  assert.equal(value.cases[0].disposition, "observed_pass");
  assert.equal(value.testCommands[0].disposition, "observed_fail");
  assert.equal(value.disposition, "observed_fail");
});

test("readback source retains both public projections before application interpretation", async () => {
  const source = await readFile(join(root, "test/full-sandbox-support.mjs"), "utf8");
  const readback = source.slice(source.indexOf("export async function freshFullSandboxReadback"));
  const retained = readback.indexOf('await save(record.scratch, "public-readback.json"');
  assert.ok(retained > readback.indexOf('for (const memberKey of ["run_result", "run_replay"])'));
  assert.ok(retained < readback.indexOf("deriveInvocationSourceResultBasisAtPrefix"));
  assert.ok(retained < readback.indexOf("evaluateOrdinaryJobObservation({ output"));
  assert.match(readback, /unqualified_no_completed_result/u);
  assert.match(readback, /native-semantic-replay\.json/u);
  // Source-order regression only; fresh native CLI read/replay remains a live
  // result obligation and is not simulated by this classifier test.
});


// Source composition check; no install, native actor, application or admission claim.
test("fresh native full-input declaration closes contracts and stays independent of both ordinary jobs", { skip: !sourceRoot }, () => {
  const ids = { ...FULL_SANDBOX_IDS, packageVersion: "0.2.0-source-check", productId: "product://odd_glc/source-check",
    descriptorRef: "descriptor://odd_glc/source-check", contributionManifestRef: "contribution-manifest://odd_glc/source-check",
    catalogRef: "catalog://odd_glc/source-check", provenanceRef: "provenance://odd_glc/source-check" };
  const built = constructFullSandboxPackage({ product, gtl, abiArtifact: artifact, freshNative: true, ids });
  const publication = built.bundle.consumerPublication;
  const validation = validateDeclaredProgram(publication, true);
  assert.equal(validation.kind, "program_validation", JSON.stringify(validation.diagnostics));
  assert.equal(validation.disposition, "valid");
  const jobs = inputs.map(input => constructOrdinaryJobInput({ product, gtl, input, executable: process.execPath, lifecycle: publication.semanticJobLifecycle }));
  assert.notEqual(product.sha256Canonical(jobs[0]), product.sha256Canonical(jobs[1]));
  assert.deepEqual(jobs.map(job => job.members), inputs.map(input => input.members));
  assert.deepEqual(jobs.map(job => job.evaluationData), inputs.map(input => input.evaluationData));
  assert.equal(publication.semanticJobLifecycle.stages.length, 5);
  assert.equal(publication.graphFunctions.filter(g => g.declarations["abg.semantic_native_stage"]).length, 10);
  assert.equal(validation.executableLeafRows.filter(row => row.fibre === "F_P").length, 3);
  assert.deepEqual(constructFullSandboxPackage({ product, gtl, abiArtifact: artifact, freshNative: true, ids }).bundle.consumerPublication, publication);
  const text = JSON.stringify(publication);
  for (const input of inputs) for (const member of input.members) assert.equal(text.includes(member.base64), false);
  assert.throws(() => constructFullSandboxPackage({ product, gtl, abiArtifact: artifact, freshNative: true }), /successor identity/);
});

test("fresh native retention permits only the exact constructed graph and ABI adapter owners", { skip: !sourceRoot }, async () => {
  const { constructFreshNativeLifecyclePublication } = await import('../src/native-lifecycle-declarations.mjs');
  const { nativeSemanticRetentionOwnersMatch } = await import(pathToFileURL(join(sourceRoot, 'build/code/src/product/execution_resolution.js')).href);
  const semantic = nativeFullSandboxPublications(gtl, artifact, true).find(p => p.moduleRef === gtl.SEMANTIC_STAGE_IDS.moduleRef);
  const publication = constructFreshNativeLifecyclePublication({ gtl, product, ids: FULL_SANDBOX_IDS, semanticPublication: semantic });
  const graph = publication.graphFunctions.find(g => g.declarations['abg.semantic_native_stage']);
  const graphOwner = { productId: publication.owningProductId, moduleRef: publication.moduleRef, publicationDigest: product.modulePublicationSemanticDigest(publication), installId: 'component:consumer' };
  const abiOwner = { productId: product.ABI5_PRODUCT_ID, moduleRef: gtl.SEMANTIC_STAGE_IDS.moduleRef, publicationDigest: product.modulePublicationSemanticDigest(semantic), installId: 'component:abi' };
  const check = (selectedGraph = graph, target = abiOwner, selectedOwner = graphOwner) => nativeSemanticRetentionOwnersMatch(publication, selectedGraph, selectedOwner, abiOwner, target, abiOwner);
  assert.equal(check(), true);
  assert.equal(check(graph, { ...abiOwner, productId: 'product://foreign' }), false);
  assert.equal(check(graph, { ...abiOwner, installId: 'component:other-install' }), false);
  assert.equal(check(graph, abiOwner, { ...graphOwner, publicationDigest: artifact.artifactDigest }), false);
  const changed = structuredClone(graph); changed.template.nodes.find(n => n.term.kind === 'c_of').term.requirement.implementationBindingRef = 'implementation-binding://foreign';
  assert.equal(check(changed), false);
  assert.equal(check({ ...graph, declarations: {} }), false);
});
