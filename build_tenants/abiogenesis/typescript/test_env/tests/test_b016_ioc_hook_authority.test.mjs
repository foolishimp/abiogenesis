// Validates: REQ-R-ABG3-INTERPRET
// Validates: REQ-R-ABG3-RUN
// Validates: B-016

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const tenantRoot = resolve(__dirname, "../..");

function sourceText(path) {
  return readFileSync(resolve(tenantRoot, path), "utf8");
}

test("B-016 publicStart authority: compatibility entry delegates to startFromRequest", () => {
  const publicStartSource = sourceText("code/src/app/m04/public_start.ts");

  assert.match(
    publicStartSource,
    /import \{[^}]*\bstartFromRequest\b[^}]*\} from "\.\/start\.js";/s
  );
  assert.match(publicStartSource, /return startFromRequest\(request, context, eventSink, plugins\);/);
});

test("B-016 publicStart authority: compatibility entry does not own lower M03 runtime law", () => {
  const publicStartSource = sourceText("code/src/app/m04/public_start.ts");
  const forbiddenRuntimeLaw = [
    "admitExecutionBasis",
    "deriveAdvancementTransition",
    "deriveIterationAdvanceDecision",
    "runtimeEventsForIterationDecision",
    "runtimeEventsForTransition",
    "constructVectorEvaluatedEvent",
    "constructVectorClosedEvent",
    "emit("
  ];

  for (const forbidden of forbiddenRuntimeLaw) {
    assert.equal(
      publicStartSource.includes(forbidden),
      false,
      `public_start.ts must not contain ${forbidden}`
    );
  }
});
