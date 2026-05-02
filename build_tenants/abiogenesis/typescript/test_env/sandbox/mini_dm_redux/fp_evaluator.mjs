// F_P semantic evaluator for the mini data-mapper redux sandbox.
//
// CRITICAL ARCHITECTURAL NOTE
// ---------------------------
// Everything in this module is F_P. F_P owns the semantic judgment of
// "did A.req_i -> B.result_i" for each obligation i. Deterministic
// implementation does NOT make a check F_D. Reading content, parsing it,
// counting structure, executing the produced code — all F_P.
//
// F_D is a separate, mechanical envelope check (see fd_envelope.mjs):
// file exists at the T-082-allocated path, declared schema parses,
// digest matches, write-root respected. F_D never reads semantic content.
//
// Per-edge depth profile:
//   edge 1 (field_spec):    structural section parsing per obligation
//   edge 2 (implementation): AST-style structural pattern recognition
//                            per obligation, plus a real tsc --noEmit invocation
//                            for REQ-IMPL-COMPILES
//   edge 3 (validation):     EMPIRICAL — actually load the implementation
//                            artifact from edge 2 and execute it against
//                            canonical cases. Compare numeric/string outputs
//                            field by field. Ungameable by lexical match.

import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  EXPECTED_TRANSFORM_CASES,
  FIELD_OBLIGATIONS
} from "./module.mjs";

const TSC_TIMEOUT_MS = 60000;

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const TENANT_TS_ROOT = path.resolve(SCRIPT_DIR, "..", "..", "..");
const LOCAL_TSC_BIN = path.join(TENANT_TS_ROOT, "node_modules", ".bin", "tsc");

function fulfilled(detail, evidenceRefs) {
  return {
    status: "fulfilled",
    findingClass: "fulfilled",
    detail,
    evidenceRefs: Object.freeze([...evidenceRefs])
  };
}

function semanticGap(detail, evidenceRefs) {
  return {
    status: "blocked",
    findingClass: "semantic_fulfillment_gap",
    detail,
    evidenceRefs: Object.freeze([...evidenceRefs])
  };
}

function traceabilityGap(detail, evidenceRefs) {
  return {
    status: "partial",
    findingClass: "traceability_reference_gap",
    detail,
    evidenceRefs: Object.freeze([...evidenceRefs])
  };
}

// ============================================================
// Edge 1 — derive_field_spec: structural section parsing
// ============================================================

function extractSectionByObligationId(markdown, obligationId) {
  const lines = markdown.split(/\r?\n/u);
  const headerIdx = lines.findIndex(
    (line) => line.trim().startsWith("## ") && line.includes(obligationId)
  );
  if (headerIdx < 0) {
    return null;
  }
  const followingIdx = lines.findIndex(
    (line, idx) => idx > headerIdx && line.trim().startsWith("## ")
  );
  const endIdx = followingIdx < 0 ? lines.length : followingIdx;
  return lines.slice(headerIdx, endIdx).join("\n");
}

function evaluateFieldSpecObligation(obligationId, markdown, artifactRef) {
  const obligation = FIELD_OBLIGATIONS.find((entry) => entry.id === obligationId);
  if (obligation === undefined) {
    return semanticGap(`unknown obligation ${obligationId}`, []);
  }
  const section = extractSectionByObligationId(markdown, obligationId);
  const evidenceBase = `${artifactRef}#${obligationId}`;
  if (section === null) {
    return traceabilityGap(
      `no markdown section for ${obligationId} found`,
      [evidenceBase]
    );
  }
  const sourceFieldsLine = section
    .split(/\r?\n/u)
    .find((line) => /source\s*fields?/iu.test(line));
  const transformationLine = section
    .split(/\r?\n/u)
    .find((line) => /transformation\s*rule/iu.test(line));
  const edgeCaseLine = section
    .split(/\r?\n/u)
    .find((line) => /edge\s*case/iu.test(line));
  if (sourceFieldsLine === undefined) {
    return semanticGap(
      `${obligationId}: section is missing 'Source fields:' label`,
      [evidenceBase]
    );
  }
  const missingSources = obligation.sourceFields.filter(
    (field) => !sourceFieldsLine.includes(field)
  );
  if (missingSources.length > 0) {
    return semanticGap(
      `${obligationId}: source fields line does not name ${missingSources.join(", ")}`,
      [evidenceBase]
    );
  }
  if (transformationLine === undefined) {
    return semanticGap(
      `${obligationId}: section is missing 'Transformation rule:' content`,
      [evidenceBase]
    );
  }
  // The transformation paragraph must be substantive — refuse a placeholder.
  const transformParagraph = section.slice(section.indexOf(transformationLine));
  const transformBody = transformParagraph.split(/\r?\n\r?\n/u)[0] ?? "";
  if (transformBody.trim().length < 40) {
    return semanticGap(
      `${obligationId}: transformation rule paragraph is too short to be substantive`,
      [evidenceBase]
    );
  }
  if (/\bTODO\b|\bplaceholder\b/iu.test(transformBody)) {
    return semanticGap(
      `${obligationId}: transformation rule contains placeholder marker`,
      [evidenceBase]
    );
  }
  if (edgeCaseLine === undefined) {
    return semanticGap(
      `${obligationId}: section is missing 'Edge case:' content`,
      [evidenceBase]
    );
  }
  return fulfilled(
    `${obligationId}: spec section names sources, has substantive rule, names an edge case`,
    [evidenceBase]
  );
}

// ============================================================
// Edge 2 — derive_implementation: structural pattern + tsc --noEmit
// ============================================================

function impliesConcatenation(source) {
  // Concatenation can be expressed as `${first} ${last}`, first + " " + last,
  // [first, last].join(" "), or similar. Look for any of those involving
  // both first_name and last_name references.
  const refersFirst = /\bfirst_name\b/u.test(source);
  const refersLast = /\blast_name\b/u.test(source);
  if (!(refersFirst && refersLast)) {
    return false;
  }
  const firstNameRef = String.raw`\b(?:first_name|firstName|first)\b`;
  const lastNameRef = String.raw`\b(?:last_name|lastName|last)\b`;
  const templateConcat = /\$\{[^}]*first[^}]*\}\s*\$\{[^}]*last[^}]*\}/u.test(
    source
  );
  const templateBoth =
    /\$\{[^}]*first[^}]*\}[^`]*\$\{[^}]*last[^}]*\}/u.test(source);
  const plusConcat = new RegExp(
    `${firstNameRef}[^;]*\\+[^;]*${lastNameRef}|${lastNameRef}[^;]*\\+[^;]*${firstNameRef}`,
    "u"
  ).test(source);
  const joinConcat = /\.join\s*\(\s*['"`]\s['"`]\s*\)/u.test(source);
  return templateConcat || templateBoth || plusConcat || joinConcat;
}

function impliesAtSplit(source) {
  const refersEmail = /\bemail\b/u.test(source);
  if (!refersEmail) {
    return false;
  }
  if (/\.split\s*\(\s*['"`]@['"`]/u.test(source)) {
    return true;
  }
  if (/\b(?:indexOf|lastIndexOf)\s*\(\s*['"`]@['"`]\s*\)/u.test(source)) {
    return true;
  }
  if (/\.slice\s*\([^)]*@[^)]*\)/u.test(source)) {
    return true;
  }
  if (/\/.*@.*\//u.test(source)) {
    return true;
  }
  return false;
}

function impliesYearSubtraction(source) {
  if (!/\bbirth_year\b/u.test(source)) {
    return false;
  }
  if (/2026\s*-\s*[^;]*birth_year/u.test(source)) {
    return true;
  }
  if (/-\s*birth_year/u.test(source) && /\b20\d{2}\b/u.test(source)) {
    return true;
  }
  if (/Date\s*\(\s*\)/u.test(source) && /-\s*birth_year/u.test(source)) {
    return true;
  }
  return false;
}

async function runTscNoEmit(implementationPath, invocationLogPath) {
  const cwd = path.dirname(implementationPath);
  const tsconfigPath = path.join(cwd, "tsconfig.eval.json");
  const tsconfig = {
    compilerOptions: {
      target: "ES2022",
      module: "ES2022",
      moduleResolution: "bundler",
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      esModuleInterop: true
    },
    include: [path.basename(implementationPath)]
  };
  await mkdir(cwd, { recursive: true });
  await writeFile(tsconfigPath, `${JSON.stringify(tsconfig, null, 2)}\n`, "utf8");
  const run = spawnSync(LOCAL_TSC_BIN, ["-p", tsconfigPath], {
    cwd,
    encoding: "utf8",
    timeout: TSC_TIMEOUT_MS,
    maxBuffer: 1024 * 1024 * 8
  });
  await writeFile(
    `${invocationLogPath}.tsc.stdout.log`,
    run.stdout ?? "",
    "utf8"
  );
  await writeFile(
    `${invocationLogPath}.tsc.stderr.log`,
    run.stderr ?? "",
    "utf8"
  );
  return {
    status: run.status,
    stdout: run.stdout ?? "",
    stderr: run.stderr ?? "",
    error: run.error === undefined ? null : String(run.error)
  };
}

function evaluateImplementationStructural(obligationId, source, artifactRef) {
  const evidence = [`${artifactRef}#${obligationId}`];
  if (obligationId === "REQ-FIELD-DISPLAY-NAME") {
    if (impliesConcatenation(source)) {
      return fulfilled(
        "implementation references both first_name and last_name and combines them",
        evidence
      );
    }
    return semanticGap(
      "implementation does not show a concatenation of first_name and last_name",
      evidence
    );
  }
  if (obligationId === "REQ-FIELD-EMAIL-DOMAIN") {
    if (impliesAtSplit(source)) {
      return fulfilled(
        "implementation splits/locates @ in the email field",
        evidence
      );
    }
    return semanticGap(
      "implementation does not show an @ split or regex against email",
      evidence
    );
  }
  if (obligationId === "REQ-FIELD-AGE") {
    if (impliesYearSubtraction(source)) {
      return fulfilled(
        "implementation subtracts birth_year from a year value",
        evidence
      );
    }
    return semanticGap(
      "implementation does not show a year-minus-birth_year subtraction",
      evidence
    );
  }
  return semanticGap(`unknown obligation ${obligationId}`, evidence);
}

// ============================================================
// Edge 3 — derive_validation: EMPIRICAL execution of the implementation
// ============================================================

async function loadImplementationModule(implementationPath, invocationLogPath) {
  // The implementation under test is TypeScript. To execute it, transpile to
  // a sibling .mjs via tsc emit. This is part of the F_P semantic evaluator
  // — running the produced code IS the deepest semantic check.
  const cwd = path.dirname(implementationPath);
  const outDir = path.join(cwd, "_eval_out");
  await mkdir(outDir, { recursive: true });
  const tsconfigPath = path.join(cwd, "tsconfig.exec.json");
  const tsconfig = {
    compilerOptions: {
      target: "ES2022",
      module: "ES2022",
      moduleResolution: "bundler",
      strict: false,
      noEmit: false,
      outDir: "./_eval_out",
      skipLibCheck: true,
      esModuleInterop: true
    },
    include: [path.basename(implementationPath)]
  };
  await writeFile(tsconfigPath, `${JSON.stringify(tsconfig, null, 2)}\n`, "utf8");
  const run = spawnSync(LOCAL_TSC_BIN, ["-p", tsconfigPath], {
    cwd,
    encoding: "utf8",
    timeout: TSC_TIMEOUT_MS,
    maxBuffer: 1024 * 1024 * 8
  });
  await writeFile(
    `${invocationLogPath}.tsc-exec.stdout.log`,
    run.stdout ?? "",
    "utf8"
  );
  await writeFile(
    `${invocationLogPath}.tsc-exec.stderr.log`,
    run.stderr ?? "",
    "utf8"
  );
  if (run.status !== 0) {
    return {
      ok: false,
      reason: `tsc emit failed with status ${run.status}: ${run.stderr ?? run.stdout ?? ""}`
    };
  }
  const baseName = path.basename(implementationPath, ".ts");
  const emittedPath = path.join(outDir, `${baseName}.js`);
  // package.json type=module would force .mjs resolution; rename for safety.
  const mjsPath = path.join(outDir, `${baseName}.mjs`);
  await writeFile(mjsPath, await readFile(emittedPath, "utf8"), "utf8");
  let module;
  try {
    module = await import(pathToFileURL(mjsPath).href);
  } catch (error) {
    return {
      ok: false,
      reason: `import failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
  if (typeof module.mapRecord !== "function") {
    return { ok: false, reason: "module does not export mapRecord function" };
  }
  return { ok: true, mapRecord: module.mapRecord };
}

function evaluateFieldByExecution(obligationId, mapRecord) {
  const obligation = FIELD_OBLIGATIONS.find((entry) => entry.id === obligationId);
  if (obligation === undefined) {
    return { passed: false, detail: `unknown obligation ${obligationId}`, runs: [] };
  }
  const runs = [];
  for (const testCase of EXPECTED_TRANSFORM_CASES) {
    let observed;
    let executionError = null;
    try {
      observed = mapRecord(testCase.input);
    } catch (error) {
      executionError = error instanceof Error ? error.message : String(error);
      observed = null;
    }
    const observedField =
      observed === null || observed === undefined
        ? undefined
        : observed[obligation.outputField];
    const expectedField = testCase.expected[obligation.outputField];
    const matches = observedField === expectedField;
    runs.push({
      label: testCase.label,
      input: testCase.input,
      expectedField,
      observedField: observedField === undefined ? null : observedField,
      matches,
      executionError
    });
  }
  const passed = runs.every((run) => run.matches && run.executionError === null);
  return { passed, detail: null, runs };
}

// ============================================================
// Public entry — evaluate one edge's full obligation roster
// ============================================================

export async function evaluateEdgeArtifact(input) {
  const {
    edgeDef,
    artifactPath,
    artifactRef,
    priorImplementationPath,
    invocationLogPath,
    runtimeContext
  } = input;
  const body = await readFile(artifactPath, "utf8");
  const assessments = [];

  if (edgeDef.name === "derive_field_spec") {
    for (const obligationId of edgeDef.obligationIds) {
      assessments.push({
        obligationId,
        ...evaluateFieldSpecObligation(obligationId, body, artifactRef)
      });
    }
    return { assessments, runtimeContext: { ...runtimeContext } };
  }

  if (edgeDef.name === "derive_implementation") {
    for (const obligationId of edgeDef.obligationIds) {
      if (obligationId === "REQ-IMPL-COMPILES") {
        const tsc = await runTscNoEmit(artifactPath, invocationLogPath);
        if (tsc.status === 0) {
          assessments.push({
            obligationId,
            ...fulfilled(
              "tsc --noEmit reported no type errors against the implementation",
              [`${artifactRef}#tsc-noemit`]
            )
          });
        } else {
          assessments.push({
            obligationId,
            ...semanticGap(
              `tsc --noEmit reported errors (status=${tsc.status}); see invocation log`,
              [`${artifactRef}#tsc-noemit`]
            )
          });
        }
        continue;
      }
      assessments.push({
        obligationId,
        ...evaluateImplementationStructural(obligationId, body, artifactRef)
      });
    }
    return { assessments, runtimeContext: { ...runtimeContext } };
  }

  if (edgeDef.name === "derive_validation") {
    if (priorImplementationPath === undefined || priorImplementationPath === null) {
      for (const obligationId of edgeDef.obligationIds) {
        assessments.push({
          obligationId,
          ...semanticGap(
            "validation evaluator has no prior implementation path to execute",
            [`${artifactRef}#missing-impl`]
          )
        });
      }
      return { assessments, runtimeContext: { ...runtimeContext } };
    }
    const loaded = await loadImplementationModule(
      priorImplementationPath,
      invocationLogPath
    );
    if (!loaded.ok) {
      for (const obligationId of edgeDef.obligationIds) {
        assessments.push({
          obligationId,
          ...semanticGap(
            `cannot execute implementation: ${loaded.reason}`,
            [`${artifactRef}#exec-load-failure`]
          )
        });
      }
      return { assessments, runtimeContext: { ...runtimeContext } };
    }
    const executionByObligation = {};
    for (const obligationId of edgeDef.obligationIds) {
      const result = evaluateFieldByExecution(obligationId, loaded.mapRecord);
      executionByObligation[obligationId] = result;
      if (result.passed) {
        assessments.push({
          obligationId,
          ...fulfilled(
            "implementation produced expected outputs for all canonical cases when executed",
            [
              `${artifactRef}#${obligationId}`,
              `execution://t101-mini-dm-redux/${edgeDef.name}/${obligationId}`
            ]
          )
        });
      } else {
        const failingCases = result.runs.filter((run) => !run.matches).length;
        assessments.push({
          obligationId,
          ...semanticGap(
            `${failingCases}/${result.runs.length} execution case(s) failed expected match`,
            [`${artifactRef}#${obligationId}`]
          )
        });
      }
    }
    return {
      assessments,
      runtimeContext: { ...runtimeContext, executionByObligation }
    };
  }

  throw new Error(`unknown edge ${edgeDef.name}`);
}
