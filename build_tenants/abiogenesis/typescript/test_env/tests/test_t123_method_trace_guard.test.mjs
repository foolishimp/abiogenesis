// Validates: T-123

import test from "node:test";
import assert from "node:assert/strict";

import {
  methodGuardFindings,
  readTemporalEcRepoMethodGuardInput
} from "./support/method-trace-guard.mjs";

test("T-123 guard flags broad requirement-family traces when specific IDs are absent", () => {
  const findings = methodGuardFindings({
    files: [
      {
        path: "code/src/abg/m03/contracts/example.ts",
        content: "// Implements: REQ-R-ABG3-EVENTS\n"
      },
      {
        path: "code/src/abg/m03/contracts/specific.ts",
        content: "// Implements: REQ-R-ABG3-EVENTS-018\n"
      }
    ]
  });

  assert.deepEqual(findings, [
    {
      kind: "broad_requirement_trace",
      path: "code/src/abg/m03/contracts/example.ts"
    }
  ]);
});

test("T-123 guard flags completed tickets with unchecked closure checklist items", () => {
  const findings = methodGuardFindings({
    tickets: [
      {
        path: ".ai-workspace/tickets/completed/T-bad.md",
        content: [
          "---",
          "status: completed",
          "---",
          "",
          "## Closure Checklist",
          "",
          "- [x] done",
          "- [ ] still open",
          ""
        ].join("\n")
      }
    ]
  });

  assert.deepEqual(findings, [
    {
      kind: "completed_ticket_with_open_checklist",
      path: ".ai-workspace/tickets/completed/T-bad.md"
    }
  ]);
});

test("T-123 guard flags design-governed tickets without design-module review outcome", () => {
  const findings = methodGuardFindings({
    tickets: [
      {
        path: ".ai-workspace/tickets/completed/T-design-missing.md",
        content: [
          "---",
          "status: completed",
          "change_class: design_reframe",
          "---",
          "",
          "## Closure Evidence",
          "",
          "closed",
          ""
        ].join("\n")
      },
      {
        path: ".ai-workspace/tickets/completed/T-design-reviewed.md",
        content: [
          "---",
          "status: completed",
          "change_class: design_reframe",
          "---",
          "",
          "## Design Module Review",
          "",
          "outcome: accepted",
          ""
        ].join("\n")
      }
    ]
  });

  assert.deepEqual(findings, [
    {
      kind: "missing_design_module_review",
      path: ".ai-workspace/tickets/completed/T-design-missing.md"
    }
  ]);
});

test("T-123 guard flags structural carrier diagrams without method class shape", () => {
  const findings = methodGuardFindings({
    files: [
      {
        path: "design/EXAMPLE_STRUCTURAL_CARRIER_DIAGRAM.md",
        content: [
          "# Example",
          "",
          "```mermaid",
          "flowchart TD",
          "  A --> B",
          "```",
          ""
        ].join("\n")
      }
    ]
  });

  assert.deepEqual(findings, [
    {
      kind: "invalid_structural_carrier_diagram",
      path: "design/EXAMPLE_STRUCTURAL_CARRIER_DIAGRAM.md"
    }
  ]);
});

test("T-123 guard allows specific traces and reviewed closed tickets", () => {
  const findings = methodGuardFindings({
    files: [
      {
        path: "test_env/tests/example.test.mjs",
        content: "// Validates: REQ-R-ABG3-PROJECTION-013\n"
      }
    ],
    tickets: [
      {
        path: ".ai-workspace/tickets/completed/T-good.md",
        content: [
          "---",
          "status: completed",
          "change_class: design_reframe",
          "---",
          "",
          "## Closure Checklist",
          "",
          "- [x] done",
          "",
          "## Design Module Review",
          "",
          "outcome: accepted",
          ""
        ].join("\n")
      }
    ]
  });

  assert.deepEqual(findings, []);
});

test("T-123 guard scans current EC and temporal repo artifacts", async () => {
  const input = await readTemporalEcRepoMethodGuardInput();
  assert.deepEqual(methodGuardFindings(input), []);
});
