import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

const tenant = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const product = await import(pathToFileURL(process.env.ABI5_C2_PRODUCT_MODULE ??
  join(tenant, "build/code/src/product/worksite_command_execution.js")));
const { canonicalJson } = await import(pathToFileURL(
  join(tenant, "build/code/src/shared/canonical_json.js")));
const { sha256Bytes } = await import(pathToFileURL(
  join(tenant, "build/code/src/shared/digests.js")));
const { ABI5_WORKSITE_COMMAND_EXECUTION_PRODUCT_SEMANTICS: c2Semantics } = await import(pathToFileURL(
  join(tenant, "build/code/src/product/builtin_semantics.js")));
const { WORKSITE_CONSTRUCTION_IDS: c1 } = await import(pathToFileURL(
  join(tenant, "build/code/src/product/worksite_construction.js")));
const fixturePath = process.env.ABI5_C2_CARRIER_FIXTURE_PATH;
const fixture = fixturePath === undefined ? null : JSON.parse(readFileSync(fixturePath, "utf8"));
const observation = fixture?.observation ?? fixture;
const task = observation?.task;
const plan = observation?.provenance.helperPlan;
const selectedFixture = { skip: fixture === null
  ? "C2 qualification requires explicit ABI5_C2_CARRIER_FIXTURE_PATH"
  : false };

function invocationBasis(sourceChanges = {}, invocationChanges = {}) {
  const workspaceBinding = task.workspaceBinding;
  return {
    input: task,
    workspaceBindingId: workspaceBinding.bindingId,
    workspaceBindingDigest: workspaceBinding.bindingDigest,
    workspaceId: workspaceBinding.workspaceId,
    sourceResultBasis: {
      sourceGraphFunctionRef: c1.graphFunctionRef,
      sourceResultContractRef: c1.resultContractRef,
      sourceResultValue: task.sourceConstructionResult,
      sourceResultValueDigest: sha256Bytes(Buffer.from(canonicalJson(task.sourceConstructionResult))),
      sourceWorkspaceId: workspaceBinding.workspaceId,
      workspaceBindingId: workspaceBinding.bindingId,
      workspaceBindingDigest: workspaceBinding.bindingDigest,
      ...sourceChanges,
    },
    ...invocationChanges,
  };
}

test("C2 Product source predicate accepts the C1 root and rejects reducer or other producer", selectedFixture, () => {
  assert.equal(product.isWorksiteCommandExecutionTask(task), true);
  assert.equal(c2Semantics.validateInvocationBasis(invocationBasis()), true);
  for (const sourceGraphFunctionRef of [c1.reducerGraphFunctionRef, "graph-function://other/producer@5"]) {
    assert.equal(c2Semantics.validateInvocationBasis(invocationBasis({ sourceGraphFunctionRef })), false);
  }
});

test("C2 Product source predicate preserves exact source and target workspace joins", selectedFixture, () => {
  for (const changed of [
    { sourceWorkspaceId: "workspace://other" },
    { workspaceBindingId: "workspace-binding://other" },
    { workspaceBindingDigest: `sha256:${"0".repeat(64)}` },
  ]) assert.equal(c2Semantics.validateInvocationBasis(invocationBasis(changed)), false);
  for (const changed of [
    { workspaceId: "workspace://other" },
    { workspaceBindingId: "workspace-binding://other" },
    { workspaceBindingDigest: `sha256:${"0".repeat(64)}` },
  ]) assert.equal(c2Semantics.validateInvocationBasis(invocationBasis({}, changed)), false);
});

function atExecutable(executable, action) {
  const descriptor = Object.getOwnPropertyDescriptor(process, "execPath");
  try {
    Object.defineProperty(process, "execPath", { ...descriptor, value: executable });
    return action();
  } finally {
    Object.defineProperty(process, "execPath", descriptor);
  }
}

function withCommand(command) {
  const bytes = Buffer.from(canonicalJson({ command }));
  return { ...plan, toolCommand: command, toolInputDigest: sha256Bytes(bytes), toolInputByteLength: bytes.byteLength };
}

test("C2 prompt emits the exact planned semantic Bash input", selectedFixture, () => {
  const prompt = product.renderWorksiteCommandExecutionPrompt(task, plan);
  const inputText = prompt.split("\n\n")[1];
  assert.deepEqual(JSON.parse(inputText), { command: plan.toolCommand });
  const bytes = Buffer.from(inputText, "utf8");
  assert.equal(sha256Bytes(bytes), plan.toolInputDigest);
  assert.equal(bytes.byteLength, plan.toolInputByteLength);
  assert.match(prompt, /Do not add timeout, run_in_background, or any other operational input field/u);
  assert.equal(prompt.includes(plan.artifactPath), false);
  assert.equal(prompt.includes(plan.sandboxRoot), false);
});

test("C2 recorded task, plan and observation remain valid at A, B and restored A", selectedFixture, () => {
  const bytes = canonicalJson({ task, plan, observation });
  for (const executable of [process.execPath, "/virtual/second-node/bin/node", process.execPath]) {
    atExecutable(executable, () => {
      assert.equal(product.isWorksiteCommandExecutionTask(task), true);
      assert.equal(product.isWorksiteCommandExecutionHelperPlan(task, plan), true);
      assert.equal(product.isWorksiteCommandExecutionObservation(observation), true);
      assert.equal(canonicalJson({ task, plan, observation }), bytes);
    });
  }
});

test("C2 captures quoted executable paths without consulting later availability", selectedFixture, () => {
  for (const executable of ["/virtual/Node tools/node", "/virtual/Node's tools/node", "/virtual/$(printf ignored)/node"]) {
    const captured = atExecutable(executable, () =>
      product.worksiteCommandExecutionHelperPlan(task, plan.attemptRef));
    assert.equal(Object.keys(captured).length, 12);
    assert.equal(product.isWorksiteCommandExecutionHelperPlan(task, captured), true);
    assert.equal(captured.toolCommand.includes("--task"), true);
  }
  for (const executable of ["", "node", "/virtual/node\0suffix"]) {
    atExecutable(executable, () => assert.throws(() =>
      product.worksiteCommandExecutionHelperPlan(task, plan.attemptRef)));
  }
});

test("C2 rejects executable, command, path and input-identity tampering", selectedFixture, () => {
  const suffix = plan.toolCommand.slice(plan.toolCommand.indexOf(" "));
  const commands = [
    `node${suffix}`, `'node'${suffix}`, `''${suffix}`,
    `"/virtual/node"${suffix}`, `'/virtual/node\0suffix'${suffix}`,
    `${plan.toolCommand}; printf injected`, `${plan.toolCommand} --extra`,
    plan.toolCommand.replace("launch.json", "task.json"),
  ];
  for (const command of commands) {
    assert.equal(product.isWorksiteCommandExecutionHelperPlan(task, withCommand(command)), false, command);
  }
  for (const malformed of [
    { ...plan, helperModulePath: `${plan.helperModulePath}.other` },
    { ...plan, taskManifestPath: `${plan.taskManifestPath}.other` },
    { ...plan, attemptRef: `${plan.attemptRef}/other` },
    { ...plan, toolInputByteLength: plan.toolInputByteLength + 1 },
    { ...plan, toolInputDigest: sha256Bytes(Buffer.from("changed")) },
    { ...plan, executable: process.execPath },
  ]) {
    assert.equal(product.isWorksiteCommandExecutionHelperPlan(task, malformed), false);
  }
  const alteredObservation = structuredClone(observation);
  alteredObservation.provenance.helperToolInvocation.inputByteLength += 1;
  assert.equal(product.isWorksiteCommandExecutionObservation(alteredObservation), false);
});
