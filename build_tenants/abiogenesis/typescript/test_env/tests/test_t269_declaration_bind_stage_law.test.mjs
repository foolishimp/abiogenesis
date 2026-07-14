import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import {
  C,
  admitCProgramSyntax,
  cCarrier,
  declareCProgram,
  serializeCProgramCanonical
} from "../../build/semantic/code/src/gtl/m01/algebra/c_algebra.js";
import { typecheckGtlProgram } from "../../build/semantic/code/src/abg/m03/contracts/index.js";
import { stableSha256Digest } from "../../build/semantic/code/src/shared/runtime_identity.js";

const request = cCarrier("carrier://t269/request");
const result = cCarrier("carrier://t269/result");

function constructProgram(armId) {
  return declareCProgram({
    programRef: "gtl://t269/native-constructor",
    term: C.of({
      input: request,
      output: result,
      stageRole: "derive_result",
      fibre: "F_D",
      armId,
      resultBearing: true
    }),
    proportionalityClass: "P1"
  });
}

test("T-269: native constructor round-trips through canonical raw admission with one digest", () => {
  const constructed = constructProgram("arm://t269/derive-result");
  const canonical = serializeCProgramCanonical(constructed);
  const constructedDigest = stableSha256Digest(JSON.parse(canonical));
  const admission = admitCProgramSyntax(canonical);

  assert.equal(admission.accepted, true, JSON.stringify(admission.diagnostics));
  const readmittedCanonical = serializeCProgramCanonical(admission.program);
  assert.equal(readmittedCanonical, canonical);
  assert.equal(
    stableSha256Digest(JSON.parse(readmittedCanonical)),
    constructedDigest
  );
});

test("T-269 negative: ambient authoring input cannot supply one canonical witness", () => {
  const first = serializeCProgramCanonical(
    constructProgram("arm://t269/ambient/first")
  );
  const second = serializeCProgramCanonical(
    constructProgram("arm://t269/ambient/second")
  );
  assert.notEqual(
    stableSha256Digest(JSON.parse(first)),
    stableSha256Digest(JSON.parse(second))
  );

  const report = typecheckGtlProgram({
    declarationSourceRows: [
      {
        sourceRef: "decl://t269/ambient-constructor",
        sourceKind: "module_export",
        canonicalDigest: ""
      }
    ]
  });
  assert.equal(
    report.issues.some(
      (issue) =>
        issue.ruleRef ===
        "abg://gtl-program/declaration/module-export-round-trip"
    ),
    true
  );
});

test("T-269: open-program law forbids a fixed three-stage replacement", async () => {
  const requirement = await readFile(
    new URL(
      "../../../../../specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md",
      import.meta.url
    ),
    "utf8"
  );
  const fn015 =
    requirement.match(/\*\*REQ-R-ABG3-FN-COMP-015\*\*:[^\n]+/u)?.[0] ?? "";
  const fn021 =
    requirement.match(/\*\*REQ-R-ABG3-FN-COMP-021\*\*:[^\n]+/u)?.[0] ?? "";

  assert.match(fn015, /exact ordered stages of the admitted C program/u);
  assert.match(fn015, /shall not synthesize a missing category/u);
  assert.match(fn021, /every authored C stage/u);
  assert.match(fn021, /does not require all three categories/u);
  assert.match(fn021, /bind stages to satisfy authored-stage cardinality/u);
});
