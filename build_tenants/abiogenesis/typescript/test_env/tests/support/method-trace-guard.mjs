import { readFile } from "node:fs/promises";
import path from "node:path";

const SPECIFIC_REQ_REF = /\bREQ-[A-Z]-[A-Z0-9]+-[A-Z0-9]+-\d{3}\b/u;
const BROAD_REQ_REF = /\bREQ-[A-Z]-[A-Z0-9]+-[A-Z0-9]+(?!-\d{3})\b/u;
const COMPLETED_STATUS = /^status:\s*completed\s*$/mu;
const UNCHECKED_CHECKLIST_ITEM = /^-\s+\[\s\]\s+/mu;
const DESIGN_REVIEW_SECTION = /^## Design Module Review\s*$/mu;
const DESIGN_REVIEW_OUTCOME = /^outcome:\s*(accepted|rejected|deferred)\s*$/mu;
const STRUCTURAL_CARRIER_DIAGRAM = /_STRUCTURAL_CARRIER_DIAGRAM\.md$/u;
const CLASS_DIAGRAM = /\bclassDiagram\b/u;
const METHOD_STEREOTYPE =
  /<<(prime|subordinate|effect-edge|deferred|authoritative|downstream)>>/u;
const VISIBILITY_MEMBER = /^\s*[+-][A-Za-z][A-Za-z0-9_]*/mu;

const TEMPORAL_EC_METHOD_GUARD_FILE_PATHS = Object.freeze([
  "code/src/abg/m03/contracts/event_calculus.ts",
  "code/src/abg/m03/contracts/temporal_algebra.ts",
  "design/ABG_EVENT_CALCULUS_IACS.md",
  "design/ABG_EVENT_CALCULUS_STRUCTURAL_CARRIER_DIAGRAM.md",
  "design/GTL_TIME_ALGEBRA_IACS.md",
  "design/GTL_TIME_ALGEBRA_STRUCTURAL_CARRIER_DIAGRAM.md",
  "test_env/tests/test_t120_event_calculus_runtime_law.test.mjs",
  "test_env/tests/test_t122_temporal_deadline_policy.test.mjs",
  "test_env/tests/test_t123_method_trace_guard.test.mjs",
  "test_env/tests/support/method-trace-guard.mjs"
]);

const TEMPORAL_EC_METHOD_GUARD_TICKET_FILENAMES = Object.freeze([
  "T-119-design-gtl-time-algebra-and-schedule-domain-module.md",
  "T-120-declare-abg-event-calculus-runtime-law-before-temporal-algebra.md",
  "T-122-deepen-gtl-temporal-algebra-for-deadline-recurrence-and-schedule-policy-proof.md",
  "T-123-add-abg-method-trace-and-design-module-closure-guard.md"
]);

function pathLooksMethodGoverned(filePath) {
  return (
    filePath.startsWith("code/") ||
    filePath.startsWith("test_env/") ||
    filePath.startsWith("design/") ||
    filePath.includes("/code/") ||
    filePath.includes("/test_env/") ||
    filePath.includes("/design/")
  );
}

function fileTraceFindings(files) {
  const findings = [];
  for (const file of files) {
    const content = file.content;
    if (!pathLooksMethodGoverned(file.path)) {
      continue;
    }
    const hasBroadRequirement = BROAD_REQ_REF.test(content);
    const hasSpecificRequirement = SPECIFIC_REQ_REF.test(content);
    if (hasBroadRequirement && !hasSpecificRequirement) {
      findings.push(
        Object.freeze({
          kind: "broad_requirement_trace",
          path: file.path
        })
      );
    }
  }
  return Object.freeze(findings);
}

function structuralDiagramFindings(files) {
  const findings = [];
  for (const file of files) {
    if (!STRUCTURAL_CARRIER_DIAGRAM.test(file.path)) {
      continue;
    }
    if (
      !CLASS_DIAGRAM.test(file.content) ||
      !METHOD_STEREOTYPE.test(file.content) ||
      !VISIBILITY_MEMBER.test(file.content)
    ) {
      findings.push(
        Object.freeze({
          kind: "invalid_structural_carrier_diagram",
          path: file.path
        })
      );
    }
  }
  return Object.freeze(findings);
}

function ticketClosureFindings(tickets) {
  const findings = [];
  for (const ticket of tickets) {
    if (
      COMPLETED_STATUS.test(ticket.content) &&
      UNCHECKED_CHECKLIST_ITEM.test(ticket.content)
    ) {
      findings.push(
        Object.freeze({
          kind: "completed_ticket_with_open_checklist",
          path: ticket.path
        })
      );
    }
  }
  return Object.freeze(findings);
}

function ticketDesignReviewFindings(tickets) {
  const findings = [];
  for (const ticket of tickets) {
    const governedByDesign =
      /^change_class:\s*design_reframe\s*$/mu.test(ticket.content) ||
      /^re_entry_point:\s*design\s*$/mu.test(ticket.content) ||
      ticket.content.includes("DESIGN_MODULE_METHOD.md");
    if (!governedByDesign) {
      continue;
    }
    if (
      !DESIGN_REVIEW_SECTION.test(ticket.content) ||
      !DESIGN_REVIEW_OUTCOME.test(ticket.content)
    ) {
      findings.push(
        Object.freeze({
          kind: "missing_design_module_review",
          path: ticket.path
        })
      );
    }
  }
  return Object.freeze(findings);
}

export function methodGuardFindings(input) {
  return Object.freeze([
    ...fileTraceFindings(input.files ?? []),
    ...structuralDiagramFindings(input.files ?? []),
    ...ticketClosureFindings(input.tickets ?? []),
    ...ticketDesignReviewFindings(input.tickets ?? [])
  ]);
}

function repoRootForPackageRoot(packageRoot) {
  return path.resolve(packageRoot, "../../..");
}

async function readRelativeFile(root, relativePath) {
  const absolutePath = path.resolve(root, relativePath);
  const content = await readFile(absolutePath, "utf8");
  return Object.freeze({
    path: relativePath,
    content
  });
}

async function readTicket(repoRoot, filename) {
  const candidatePaths = [
    `.ai-workspace/tickets/active/${filename}`,
    `.ai-workspace/tickets/completed/${filename}`,
    `.ai-workspace/tickets/backlog/${filename}`
  ];
  for (const candidatePath of candidatePaths) {
    try {
      return await readRelativeFile(repoRoot, candidatePath);
    } catch (error) {
      if (error?.code !== "ENOENT") {
        throw error;
      }
    }
  }
  throw new Error(`Unable to locate ticket ${filename}`);
}

export async function readTemporalEcRepoMethodGuardInput(input = {}) {
  const packageRoot = input.packageRoot ?? process.cwd();
  const repoRoot = repoRootForPackageRoot(packageRoot);
  const files = await Promise.all(
    TEMPORAL_EC_METHOD_GUARD_FILE_PATHS.map((filePath) =>
      readRelativeFile(packageRoot, filePath)
    )
  );
  const tickets = await Promise.all(
    TEMPORAL_EC_METHOD_GUARD_TICKET_FILENAMES.map((filename) =>
      readTicket(repoRoot, filename)
    )
  );
  return Object.freeze({
    files: Object.freeze(files),
    tickets: Object.freeze(tickets)
  });
}
