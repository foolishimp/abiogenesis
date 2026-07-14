// Validates: T-251 reproducible registered-design proof gate

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  discoverRegisteredDesigns,
  runDesignMermaidGate
} from "../gates/design_mermaid_gate.mjs";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.resolve(TEST_DIR, "..");
const TENANT_ROOT = path.resolve(TEST_ENV_ROOT, "..");
const DESIGN_ROOT = path.join(TENANT_ROOT, "design");
const GATE_PATH = path.join(TEST_ENV_ROOT, "gates", "design_mermaid_gate.mjs");
const REGISTER_PATH = path.join(
  DESIGN_ROOT,
  "A5_COMPLETED_CODE_DESIGN_STAGE_REGISTER.md"
);
const MALFORMED_FIXTURE_PATH = path.join(
  TEST_ENV_ROOT,
  "fixtures",
  "design_mermaid",
  "malformed_three_view.md"
);

function runGate(args = []) {
  const result = spawnSync(process.execPath, [GATE_PATH, ...args], {
    cwd: TENANT_ROOT,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024
  });
  assert.notEqual(result.stdout.trim(), "", result.stderr);
  return {
    ...result,
    summary: JSON.parse(result.stdout)
  };
}

function threeViewSource(order = [
  "classDiagram",
  "sequenceDiagram",
  "stateDiagram-v2"
]) {
  const bodies = {
    classDiagram: "classDiagram\n  class Fixture",
    sequenceDiagram: "sequenceDiagram\n  participant A\n  A->>A: fixture",
    "stateDiagram-v2": "stateDiagram-v2\n  [*] --> Fixture"
  };
  return `${order.map((viewType) =>
    `\`\`\`mermaid\n${bodies[viewType]}\n\`\`\``
  ).join("\n\n")}\n`;
}

test("T-251 derives and renders the registered three-view design inventory", async () => {
  const registered = await discoverRegisteredDesigns();
  const result = runGate();
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.summary, {
    status: "passed",
    failureClass: null,
    failurePath: null,
    rendererVersion: "11.3.0",
    fileCount: registered.length,
    diagramCount: registered.length * 3,
    sourceSetDigest: result.summary.sourceSetDigest
  });
  assert.match(result.summary.sourceSetDigest, /^sha256:[a-f0-9]{64}$/u);
});

test("T-273 rejects a register that omits a completed DS design carrier", async (t) => {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), "abg-t273-register-"));
  t.after(async () => {
    await rm(fixtureRoot, { recursive: true, force: true });
  });
  const registerSource = await readFile(REGISTER_PATH, "utf8");
  const omittedSource = registerSource
    .split(/\r?\n/u)
    .filter((line) =>
      !line.includes("M01_M03_CONSENSUS_GTL_FREE_CONSTRUCTION_BEHAVIOR_DESIGN.md")
    )
    .join("\n");
  assert.notEqual(omittedSource, registerSource);
  const fixturePath = path.join(fixtureRoot, "register.md");
  await writeFile(fixturePath, omittedSource, "utf8");
  await assert.rejects(
    discoverRegisteredDesigns({ registerPath: fixturePath }),
    (error) =>
      error.failureClass === "design_register_incomplete" &&
      error.message.includes(
        "M01_M03_CONSENSUS_GTL_FREE_CONSTRUCTION_BEHAVIOR_DESIGN.md"
      )
  );
});

test("T-273 requires an active accepted design in the registered inventory", async (t) => {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), "abg-t273-active-design-"));
  t.after(async () => {
    await rm(fixtureRoot, { recursive: true, force: true });
  });
  const activeRoot = path.join(fixtureRoot, "active");
  const completedRoot = path.join(fixtureRoot, "completed");
  await mkdir(activeRoot, { recursive: true });
  await mkdir(completedRoot, { recursive: true });
  await writeFile(
    path.join(activeRoot, "T-900-active-design.md"),
    `# Active design\n\n- id: T-900\n- status: active\n- delivery_phase: DS-3\n- design_ref: build_tenants/abiogenesis/typescript/design/MISSING_ACTIVE_ACCEPTED_DESIGN.md\n- design_decision_ref: .ai-workspace/comments/codex/accepted.md\n\n## Boundary\n`,
    "utf8"
  );

  await assert.rejects(
    discoverRegisteredDesigns({
      registerPath: REGISTER_PATH,
      ticketRoots: [activeRoot, completedRoot]
    }),
    (error) =>
      error.failureClass === "design_register_incomplete" &&
      error.message.includes("MISSING_ACTIVE_ACCEPTED_DESIGN.md")
  );
});

test("T-251 rejects missing, extra, and reordered Mermaid views before rendering", async (t) => {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), "abg-t251-structure-"));
  t.after(async () => {
    await rm(fixtureRoot, { recursive: true, force: true });
  });
  const cases = [
    {
      name: "missing",
      source: threeViewSource(["classDiagram", "sequenceDiagram"])
    },
    {
      name: "extra",
      source: threeViewSource([
        "classDiagram",
        "sequenceDiagram",
        "stateDiagram-v2",
        "stateDiagram-v2"
      ])
    },
    {
      name: "reordered",
      source: threeViewSource([
        "sequenceDiagram",
        "classDiagram",
        "stateDiagram-v2"
      ])
    }
  ];
  for (const fixtureCase of cases) {
    const fixturePath = path.join(fixtureRoot, `${fixtureCase.name}.md`);
    await writeFile(fixturePath, fixtureCase.source, "utf8");
    const result = runGate(["--file", fixturePath]);
    assert.notEqual(result.status, 0);
    assert.equal(result.summary.status, "failed");
    assert.equal(result.summary.failureClass, "design_three_view_invalid");
  }
});

test("T-251 rejects a missing file named by the registered stage census", async (t) => {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), "abg-t251-register-"));
  t.after(async () => {
    await rm(fixtureRoot, { recursive: true, force: true });
  });
  const registerSource = await readFile(REGISTER_PATH, "utf8");
  const mutatedSource = registerSource.replace(
    "./M03_CONSENSUS_REJECTED_AS_BUILT_BEHAVIOR_DESIGN.md",
    "./MISSING_T251_BEHAVIOR_DESIGN.md"
  );
  assert.notEqual(mutatedSource, registerSource);
  const fixturePath = path.join(fixtureRoot, "register.md");
  await writeFile(fixturePath, mutatedSource, "utf8");
  await assert.rejects(
    discoverRegisteredDesigns({ registerPath: fixturePath }),
    (error) => error.failureClass === "design_register_invalid" &&
      error.failurePath === "MISSING_T251_BEHAVIOR_DESIGN.md"
  );
});

test("T-251 classifies malformed Mermaid through the real local renderer", () => {
  const result = runGate(["--file", MALFORMED_FIXTURE_PATH]);
  assert.notEqual(result.status, 0);
  assert.equal(result.summary.status, "failed");
  assert.equal(result.summary.failureClass, "design_mermaid_render_failed");
  assert.equal(
    result.summary.failurePath,
    "../test_env/fixtures/design_mermaid/malformed_three_view.md"
  );
  assert.equal(result.summary.fileCount, 1);
  assert.equal(result.summary.diagramCount, 0);
  assert.match(result.summary.sourceSetDigest, /^sha256:[a-f0-9]{64}$/u);
});

test("T-251 reports no admitted renderer version when local admission fails", async (t) => {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), "abg-t251-renderer-"));
  t.after(async () => {
    await rm(fixtureRoot, { recursive: true, force: true });
  });
  const fixturePath = path.join(fixtureRoot, "valid.md");
  await writeFile(fixturePath, threeViewSource(), "utf8");

  const unavailable = await runDesignMermaidGate({
    filePath: fixturePath,
    rendererPath: path.join(fixtureRoot, "missing-mmdc")
  });
  assert.equal(unavailable.status, "failed");
  assert.equal(unavailable.failureClass, "design_renderer_unavailable");
  assert.equal(unavailable.rendererVersion, null);

  const mismatchRendererPath = path.join(fixtureRoot, "wrong-mmdc");
  await writeFile(
    mismatchRendererPath,
    "#!/bin/sh\nprintf '99.0.0\\n'\n",
    "utf8"
  );
  await chmod(mismatchRendererPath, 0o755);
  const mismatch = await runDesignMermaidGate({
    filePath: fixturePath,
    rendererPath: mismatchRendererPath
  });
  assert.equal(mismatch.status, "failed");
  assert.equal(mismatch.failureClass, "design_renderer_version_mismatch");
  assert.equal(mismatch.rendererVersion, null);
  assert.equal(mismatch.diagnosticDetail, "actual renderer version: 99.0.0");
});
