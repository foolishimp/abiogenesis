// F_P worker for the mini data-mapper redux sandbox.
//
// Two modes:
//   - live (CODEX_LIVE_FP=1): dispatch the per-edge prompt to the selected
//     agent CLI using the sanitized-environment transport contract from the
//     shared abg_library, and capture the worker's text response as the
//     artifact body. The default live agent is Codex, pinned by the shared
//     transport contract to gpt-5.3-codex.
//   - fixture: deterministic content per edge so the harness lints/builds clean
//     and so the F_P semantic evaluator has something to judge.
//
// This module is the *worker*. It is the constructor that produces the
// artifact. It does NOT decide whether the artifact fulfills any obligation —
// that judgment is F_P's, but it lives in fp_evaluator.mjs.

import path from "node:path";

import {
  contractForKnownAgent,
  runAgentTransport
} from "../../../build/semantic/code/src/shared/abg_library/index.js";

import {
  EXPECTED_TRANSFORM_CASES,
  FIELD_OBLIGATIONS,
  PROBLEM_STATEMENT
} from "./module.mjs";

const TRANSPORT_TIMEOUT_MS_DEFAULT = 120000;
const DEFAULT_LIVE_AGENT = "codex";
const SUPPORTED_LIVE_AGENTS = Object.freeze(["codex", "claude", "gemini"]);

function liveEnabled() {
  return (
    process.env["CODEX_LIVE_FP"] === "1" ||
    process.env["ABG_TS_T101_LIVE"] === "1"
  );
}

function transportTimeoutMs() {
  const raw = process.env["ABG_TS_LIVE_TIMEOUT_MS"];
  const parsed = Number.parseInt(raw ?? `${TRANSPORT_TIMEOUT_MS_DEFAULT}`, 10);
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : TRANSPORT_TIMEOUT_MS_DEFAULT;
}

function selectedExecutorProfile() {
  const raw = process.env["ABG_TS_AGENT_EXECUTOR_PROFILE"];
  if (raw === undefined || raw.trim().length === 0) {
    return undefined;
  }
  const normalized = raw.trim();
  if (normalized === "local-spawn" || normalized === "pty-terminal") {
    return normalized;
  }
  throw new Error(
    `unsupported ABG_TS_AGENT_EXECUTOR_PROFILE=${raw}; expected local-spawn or pty-terminal`
  );
}

function selectedLiveAgent() {
  const raw = process.env["ABG_TS_LIVE_AGENT"] ?? DEFAULT_LIVE_AGENT;
  const normalized = raw.trim().toLowerCase();
  if (SUPPORTED_LIVE_AGENTS.includes(normalized)) {
    return normalized;
  }
  throw new Error(
    `unsupported ABG_TS_LIVE_AGENT=${raw}; expected one of ${SUPPORTED_LIVE_AGENTS.join(", ")}`
  );
}

async function runLiveAgent(prompt, invocationLogPath) {
  const agentKey = selectedLiveAgent();
  const contract = contractForKnownAgent(agentKey);
  const archiveRoot = path.dirname(invocationLogPath);
  const outputPath = `${invocationLogPath}.output.txt`;
  const executorProfile = selectedExecutorProfile();
  const transport = await runAgentTransport({
    contract,
    prompt,
    cwd: archiveRoot,
    archiveRoot,
    label: path.basename(invocationLogPath),
    timeoutMs: transportTimeoutMs(),
    executorProfile,
    terminalSessionKey:
      executorProfile === "pty-terminal"
        ? `mini-dm-${path.basename(invocationLogPath)}-${Date.now()}`
        : undefined,
    outputPath,
    promptPath: `${invocationLogPath}.prompt.txt`,
    stdoutPath: `${invocationLogPath}.stdout.log`,
    stderrPath: `${invocationLogPath}.stderr.log`,
    transportPath: `${invocationLogPath}.transport.json`,
    traceRoot: `${invocationLogPath}.trace`
  });
  if (transport.status !== 0) {
    throw new Error(
      `${agentKey} transport failed: status=${transport.status} signal=${String(
        transport.signal
      )} timedOut=${String(transport.timedOut)} apiRetryCount=${
        transport.apiRetryCount
      } failureClass=${String(transport.failureClass)} trace=${String(
        transport.traceRoot
      )}`
    );
  }
  return transport.text;
}

function fixtureFieldSpec() {
  const sections = FIELD_OBLIGATIONS.map((obligation) => {
    if (obligation.id === "REQ-FIELD-DISPLAY-NAME") {
      return [
        `## ${obligation.id}: display_name`,
        "",
        "Source fields: first_name, last_name.",
        "",
        "Transformation rule: trim whitespace from each name part, then concatenate",
        'first_name and last_name with a single space between them ("First Last").',
        "",
        "Edge case: leading or trailing whitespace in either name part must be removed",
        "before concatenation; double spaces collapse to one.",
        ""
      ].join("\n");
    }
    if (obligation.id === "REQ-FIELD-EMAIL-DOMAIN") {
      return [
        `## ${obligation.id}: email_domain`,
        "",
        "Source fields: email.",
        "",
        "Transformation rule: split the email on the @ separator and take the part",
        "after the @. If there is no @ in the email value, output null for email_domain.",
        "",
        "Edge case: an email value with no @ character must produce email_domain = null,",
        "not an empty string.",
        ""
      ].join("\n");
    }
    return [
      `## ${obligation.id}: age`,
      "",
      "Source fields: birth_year.",
      "",
      "Transformation rule: compute age = 2026 - birth_year.",
      "",
      "Edge case: if birth_year is greater than 2026 the record is invalid and age",
      "must be reported as null rather than a negative number.",
      ""
    ].join("\n");
  });
  return [
    "# Field Specification",
    "",
    "Derived from the raw problem statement. One section per output field obligation.",
    "",
    ...sections
  ].join("\n");
}

function fixtureImplementation() {
  return [
    "// Mini data-mapper redux fixture implementation.",
    "//",
    "// Produced by the F_P fixture worker. The F_P semantic evaluator at edge 2",
    "// inspects this file structurally and at edge 3 actually executes mapRecord.",
    "",
    "export interface InputRecord {",
    "  readonly first_name: string;",
    "  readonly last_name: string;",
    "  readonly email: string;",
    "  readonly birth_year: number;",
    "}",
    "",
    "export interface OutputRecord {",
    "  readonly display_name: string;",
    "  readonly email_domain: string | null;",
    "  readonly age: number | null;",
    "}",
    "",
    "export function mapRecord(record: InputRecord): OutputRecord {",
    "  const first = record.first_name.trim();",
    "  const last = record.last_name.trim();",
    "  const display_name = `${first} ${last}`.replace(/\\s+/g, \" \").trim();",
    "  const at = record.email.indexOf(\"@\");",
    "  const email_domain = at >= 0 ? record.email.slice(at + 1) : null;",
    "  const age = record.birth_year > 2026 ? null : 2026 - record.birth_year;",
    "  return { display_name, email_domain, age };",
    "}",
    ""
  ].join("\n");
}

function fixtureValidationResults() {
  // Edge 3 worker produces a JSON results envelope. The F_P evaluator
  // re-executes the implementation independently against the canonical cases
  // — the worker's self-report is evidence, not authority.
  return `${JSON.stringify(
    {
      kind: "validation_results",
      cases: EXPECTED_TRANSFORM_CASES.map((testCase) => ({
        label: testCase.label,
        input: testCase.input,
        expected: testCase.expected,
        worker_self_reported_pass: true
      }))
    },
    null,
    2
  )}\n`;
}

function fieldSpecPrompt() {
  return [
    "You are the live F_P worker for the mini data-mapper redux sandbox, edge 1.",
    "",
    "Problem statement:",
    PROBLEM_STATEMENT,
    "",
    "Produce a markdown field specification with exactly three sections, one per",
    "output field, in this order:",
    "  ## REQ-FIELD-DISPLAY-NAME: display_name",
    "  ## REQ-FIELD-EMAIL-DOMAIN: email_domain",
    "  ## REQ-FIELD-AGE: age",
    "",
    "Each section must contain:",
    "  - a 'Source fields:' line listing the input fields that feed this output",
    "  - a 'Transformation rule:' paragraph describing the actual transformation",
    "    (not a placeholder)",
    "  - an 'Edge case:' paragraph naming at least one explicit edge case",
    "",
    "Return only the markdown. No surrounding prose, no code fences."
  ].join("\n");
}

function implementationPrompt(fieldSpecBody) {
  return [
    "You are the live F_P worker for the mini data-mapper redux sandbox, edge 2.",
    "",
    "Field specification:",
    fieldSpecBody,
    "",
    "Produce a TypeScript module that exports `mapRecord(record: InputRecord):",
    "OutputRecord` implementing all three field rules. The file must compile under",
    "tsc --noEmit (strict mode). Use only standard ES features — no external imports.",
    "",
    "InputRecord shape: { first_name: string; last_name: string; email: string;",
    "birth_year: number }",
    "OutputRecord shape: { display_name: string; email_domain: string | null;",
    "age: number | null }",
    "",
    "Return only the TypeScript source. No surrounding prose, no markdown fences."
  ].join("\n");
}

function validationPrompt(implementationBody) {
  return [
    "You are the live F_P worker for the mini data-mapper redux sandbox, edge 3.",
    "",
    "Implementation under test:",
    implementationBody,
    "",
    "Produce a JSON document of shape:",
    "{",
    '  "kind": "validation_results",',
    '  "cases": [',
    '    { "label": ..., "input": {...}, "expected": {...},',
    '      "worker_self_reported_pass": true|false } ...',
    "  ]",
    "}",
    "",
    "Cover at least one happy-path case, one whitespace-trim case, and one",
    "missing-@ case. Return only the JSON."
  ].join("\n");
}

function stripCodeFences(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```[a-zA-Z]*\s*\n([\s\S]*?)\n```\s*$/u);
  if (fenced !== null) {
    return fenced[1];
  }
  return trimmed;
}

export async function runFpWorkerForEdge(input) {
  const { edgeName, priorArtifactBody, invocationLogPath } = input;
  if (!liveEnabled()) {
    if (edgeName === "derive_field_spec") {
      return { mode: "fixture", body: fixtureFieldSpec() };
    }
    if (edgeName === "derive_implementation") {
      return { mode: "fixture", body: fixtureImplementation() };
    }
    if (edgeName === "derive_validation") {
      return { mode: "fixture", body: fixtureValidationResults() };
    }
    throw new Error(`unknown edge ${edgeName}`);
  }
  let prompt;
  if (edgeName === "derive_field_spec") {
    prompt = fieldSpecPrompt();
  } else if (edgeName === "derive_implementation") {
    prompt = implementationPrompt(priorArtifactBody ?? "");
  } else if (edgeName === "derive_validation") {
    prompt = validationPrompt(priorArtifactBody ?? "");
  } else {
    throw new Error(`unknown edge ${edgeName}`);
  }
  const text = await runLiveAgent(prompt, invocationLogPath);
  return { mode: "live", body: stripCodeFences(text) };
}
