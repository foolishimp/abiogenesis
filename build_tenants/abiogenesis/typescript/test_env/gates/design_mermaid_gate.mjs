import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import {
  access,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GATE_DIR = path.dirname(fileURLToPath(import.meta.url));
const TENANT_ROOT = path.resolve(GATE_DIR, "../..");
const DESIGN_ROOT = path.join(TENANT_ROOT, "design");
const REGISTER_PATH = path.join(
  DESIGN_ROOT,
  "A5_COMPLETED_CODE_DESIGN_STAGE_REGISTER.md"
);
const RENDERER_PATH = path.join(TENANT_ROOT, "node_modules", ".bin", "mmdc");
const CONFIG_PATH = path.join(GATE_DIR, "mermaid.config.json");
const EXPECTED_RENDERER_VERSION = "11.3.0";
const EXPECTED_REGISTERED_FILE_COUNT = 12;
const EXPECTED_VIEW_TYPES = Object.freeze([
  "classDiagram",
  "sequenceDiagram",
  "stateDiagram-v2"
]);

class DesignGateFailure extends Error {
  constructor(failureClass, failurePath, message, detail = null) {
    super(message);
    this.name = "DesignGateFailure";
    this.failureClass = failureClass;
    this.failurePath = failurePath;
    this.detail = detail;
  }
}

function toPosix(relativePath) {
  return relativePath.split(path.sep).join("/");
}

function designPathLabel(filePath) {
  return toPosix(path.relative(DESIGN_ROOT, filePath));
}

function fail(failureClass, failurePath, message, detail = null) {
  throw new DesignGateFailure(failureClass, failurePath, message, detail);
}

async function readText(filePath, failureClass, failurePath) {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    fail(failureClass, failurePath, `unable to read ${failurePath}`, error.message);
  }
}

export async function discoverRegisteredDesigns({
  registerPath = REGISTER_PATH
} = {}) {
  const registerLabel = designPathLabel(registerPath);
  const source = await readText(
    registerPath,
    "design_register_invalid",
    registerLabel
  );
  const sectionHeading = /^## Registered Stages\s*$/mu.exec(source);
  if (sectionHeading === null) {
    fail(
      "design_register_invalid",
      registerLabel,
      "Registered Stages section is missing"
    );
  }
  const sectionTail = source.slice(sectionHeading.index + sectionHeading[0].length);
  const nextHeadingIndex = sectionTail.search(/^##\s/mu);
  const section = nextHeadingIndex === -1
    ? sectionTail
    : sectionTail.slice(0, nextHeadingIndex);

  const links = [...section.matchAll(
    /\[[^\]]+\]\((\.\/[^)]+\.md)\)/gu
  )].map((match) => match[1]);
  if (links.length !== EXPECTED_REGISTERED_FILE_COUNT) {
    fail(
      "design_register_invalid",
      registerLabel,
      `expected ${EXPECTED_REGISTERED_FILE_COUNT} registered design links, found ${links.length}`
    );
  }
  if (new Set(links).size !== links.length) {
    fail(
      "design_register_invalid",
      registerLabel,
      "registered design links must be unique"
    );
  }

  const designPaths = [];
  for (const link of links) {
    const filePath = path.resolve(DESIGN_ROOT, link);
    const relativePath = path.relative(DESIGN_ROOT, filePath);
    if (
      relativePath === "" ||
      relativePath.startsWith(`..${path.sep}`) ||
      path.isAbsolute(relativePath)
    ) {
      fail(
        "design_register_invalid",
        registerLabel,
        `registered design link is not local: ${link}`
      );
    }
    try {
      if (!(await stat(filePath)).isFile()) {
        fail(
          "design_register_invalid",
          designPathLabel(filePath),
          "registered design is not a file"
        );
      }
    } catch (error) {
      if (error instanceof DesignGateFailure) {
        throw error;
      }
      fail(
        "design_register_invalid",
        designPathLabel(filePath),
        "registered design file is missing",
        error.message
      );
    }
    designPaths.push(filePath);
  }
  return designPaths;
}

function extractMermaidViews(source) {
  return [...source.matchAll(
    /^```mermaid[^\S\r\n]*\r?\n([\s\S]*?)^```[^\S\r\n]*$/gmu
  )].map((match) => match[1]);
}

async function admitDesign(filePath) {
  const label = designPathLabel(filePath);
  let sourceBytes;
  try {
    sourceBytes = await readFile(filePath);
  } catch (error) {
    fail(
      "design_three_view_invalid",
      label,
      `unable to read ${label}`,
      error.message
    );
  }
  const source = sourceBytes.toString("utf8");
  const views = extractMermaidViews(source);
  const viewTypes = views.map((view) =>
    view.split(/\r?\n/u).find((line) => line.trim().length > 0)?.trim() ?? ""
  );
  if (
    viewTypes.length !== EXPECTED_VIEW_TYPES.length ||
    !viewTypes.every((viewType, index) => viewType === EXPECTED_VIEW_TYPES[index])
  ) {
    fail(
      "design_three_view_invalid",
      label,
      `expected ordered views ${EXPECTED_VIEW_TYPES.join(", ")}; found ${viewTypes.join(", ") || "none"}`
    );
  }
  return { filePath, label, source, sourceBytes };
}

function sourceSetDigest(designs) {
  const hash = createHash("sha256");
  for (const design of designs) {
    hash.update(design.label, "utf8");
    hash.update(Uint8Array.of(0));
    hash.update(design.sourceBytes);
    hash.update(Uint8Array.of(0));
  }
  return `sha256:${hash.digest("hex")}`;
}

function spawnCapture(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: TENANT_ROOT,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      resolve({ status: null, stdout, stderr, error });
    });
    child.on("close", (status) => {
      resolve({ status, stdout, stderr, error: null });
    });
  });
}

async function admitRenderer(rendererPath) {
  try {
    await access(rendererPath);
  } catch (error) {
    fail(
      "design_renderer_unavailable",
      "node_modules/.bin/mmdc",
      "local Mermaid renderer is unavailable",
      error.message
    );
  }
  const result = await spawnCapture(rendererPath, ["--version"]);
  if (result.error !== null || result.status !== 0) {
    fail(
      "design_renderer_unavailable",
      "node_modules/.bin/mmdc",
      "local Mermaid renderer did not report its version",
      result.error?.message ?? result.stderr.trim()
    );
  }
  const actualVersion = result.stdout.trim();
  if (actualVersion !== EXPECTED_RENDERER_VERSION) {
    fail(
      "design_renderer_version_mismatch",
      "node_modules/.bin/mmdc",
      `expected Mermaid renderer ${EXPECTED_RENDERER_VERSION}, found ${actualVersion}`,
      `actual renderer version: ${actualVersion}`
    );
  }
  return actualVersion;
}

async function renderDesigns(designs, rendererPath) {
  let temporaryRoot = null;
  let completedDiagramCount = 0;
  let retainedFailure = null;
  try {
    temporaryRoot = await mkdtemp(path.join(tmpdir(), "abg-design-mermaid-"));
    for (const [index, design] of designs.entries()) {
      const outputStem = `design-${String(index + 1).padStart(2, "0")}`;
      const outputPath = path.join(temporaryRoot, `${outputStem}.svg`);
      const result = await spawnCapture(rendererPath, [
        "--input",
        design.filePath,
        "--output",
        outputPath,
        "--configFile",
        CONFIG_PATH,
        "--quiet"
      ]);
      if (result.error !== null || result.status !== 0) {
        retainedFailure = new DesignGateFailure(
          "design_mermaid_render_failed",
          design.label,
          "Mermaid renderer rejected the design",
          result.error?.message ?? result.stderr.trim()
        );
        break;
      }

      const outputNames = (await readdir(temporaryRoot))
        .filter((name) => name.startsWith(`${outputStem}-`) && name.endsWith(".svg"))
        .sort();
      if (outputNames.length !== EXPECTED_VIEW_TYPES.length) {
        retainedFailure = new DesignGateFailure(
          "design_render_output_invalid",
          design.label,
          `expected three SVG outputs, found ${outputNames.length}`
        );
        break;
      }
      for (const outputName of outputNames) {
        const outputStat = await stat(path.join(temporaryRoot, outputName));
        if (!outputStat.isFile() || outputStat.size === 0) {
          retainedFailure = new DesignGateFailure(
            "design_render_output_invalid",
            design.label,
            `rendered SVG is empty or not a file: ${outputName}`
          );
          break;
        }
      }
      if (retainedFailure !== null) {
        break;
      }
      completedDiagramCount += outputNames.length;
    }
  } catch (error) {
    retainedFailure = error instanceof DesignGateFailure
      ? error
      : new DesignGateFailure(
        "design_mermaid_render_failed",
        null,
        "Mermaid render proof failed",
        error.message
      );
  } finally {
    if (temporaryRoot !== null) {
      try {
        await rm(temporaryRoot, { recursive: true, force: true });
      } catch (error) {
        retainedFailure = new DesignGateFailure(
          "design_cleanup_failed",
          null,
          "temporary Mermaid output cleanup failed",
          error.message
        );
      }
    }
  }
  if (retainedFailure !== null) {
    retainedFailure.completedDiagramCount = completedDiagramCount;
    throw retainedFailure;
  }
  return completedDiagramCount;
}

function failureSummary(error, partial) {
  const failure = error instanceof DesignGateFailure
    ? error
    : new DesignGateFailure(
      "design_mermaid_render_failed",
      null,
      "unexpected design proof failure",
      error.message
    );
  return {
    status: "failed",
    failureClass: failure.failureClass,
    failurePath: failure.failurePath,
    rendererVersion: partial.rendererVersion,
    fileCount: partial.fileCount,
    diagramCount: failure.completedDiagramCount ?? partial.diagramCount,
    sourceSetDigest: partial.sourceSetDigest,
    diagnosticDetail: failure.detail
  };
}

export async function runDesignMermaidGate({
  filePath = null,
  rendererPath = RENDERER_PATH
} = {}) {
  const partial = {
    rendererVersion: null,
    fileCount: 0,
    diagramCount: 0,
    sourceSetDigest: null
  };
  try {
    const designPaths = filePath === null
      ? await discoverRegisteredDesigns()
      : [path.resolve(filePath)];
    const designs = [];
    for (const designPath of designPaths) {
      designs.push(await admitDesign(designPath));
    }
    partial.fileCount = designs.length;
    partial.sourceSetDigest = sourceSetDigest(designs);
    partial.rendererVersion = await admitRenderer(rendererPath);
    partial.diagramCount = await renderDesigns(designs, rendererPath);
    return {
      status: "passed",
      failureClass: null,
      failurePath: null,
      rendererVersion: partial.rendererVersion,
      fileCount: partial.fileCount,
      diagramCount: partial.diagramCount,
      sourceSetDigest: partial.sourceSetDigest,
      diagnosticDetail: null
    };
  } catch (error) {
    return failureSummary(error, partial);
  }
}

function parseCliArgs(args) {
  if (args.length === 0) {
    return { filePath: null };
  }
  if (args.length === 2 && args[0] === "--file") {
    return { filePath: path.resolve(process.cwd(), args[1]) };
  }
  fail(
    "design_register_invalid",
    null,
    "usage: design_mermaid_gate.mjs [--file <path>]"
  );
}

async function main() {
  let summary;
  try {
    summary = await runDesignMermaidGate(parseCliArgs(process.argv.slice(2)));
  } catch (error) {
    summary = failureSummary(error, {
      rendererVersion: null,
      fileCount: 0,
      diagramCount: 0,
      sourceSetDigest: null
    });
  }
  const { diagnosticDetail, ...stableSummary } = summary;
  process.stdout.write(`${JSON.stringify(stableSummary)}\n`);
  if (diagnosticDetail !== null && diagnosticDetail !== "") {
    process.stderr.write(`${diagnosticDetail}\n`);
  }
  if (summary.status !== "passed") {
    process.exitCode = 1;
  }
}

if (
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await main();
}
