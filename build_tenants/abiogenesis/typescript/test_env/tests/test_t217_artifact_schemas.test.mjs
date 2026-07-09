// T-217 Phase 1 S6 (T-213) — the artifact-schema dialect units: the
// declared schema admits at compile, and enforcement is closed-key,
// typed, row-aware, and hostile-object safe. The compile/render/runner
// flow differentials live in test_t183 (they reuse its plan builders).
import test from "node:test";
import assert from "node:assert/strict";

import {
  admitArtifactAgainstSchema,
  admitArtifactSchemas,
  renderArtifactSchemasText
} from "../../build/semantic/code/src/abg/m03/contracts/index.js";

const DEPTH_SCHEMA = Object.freeze({
  schemaRef: "schema://t213/depth-proof-map",
  artifactKey: "depthProofMap",
  fields: { accepted: "boolean" },
  rows: {
    key: "rows",
    fields: {
      requirementId: "non_empty_string",
      depthClassRef: "non_empty_string",
      testIdentityRefs: "string_array"
    }
  }
});

test("T-217 S6 n1: schema declaration admission — closed rule vocabulary, unique artifact keys, typed rows spec", () => {
  const good = admitArtifactSchemas([DEPTH_SCHEMA]);
  assert.equal(good.accepted, true);
  assert.equal(good.schemas.length, 1);

  const dup = admitArtifactSchemas([DEPTH_SCHEMA, DEPTH_SCHEMA]);
  assert.equal(dup.accepted, false);
  assert.equal(
    dup.issues.some((issue) => issue.issueKind === "artifact_key_duplicate"),
    true
  );
  const badRule = admitArtifactSchemas([
    { ...DEPTH_SCHEMA, fields: { accepted: "vibes" } }
  ]);
  assert.equal(badRule.accepted, false);
  assert.equal(
    badRule.issues.some((issue) => issue.issueKind === "field_rule_unknown"),
    true
  );
  const badRows = admitArtifactSchemas([
    { ...DEPTH_SCHEMA, rows: { key: "", fields: {} } }
  ]);
  assert.equal(badRows.accepted, false);
  assert.equal(
    badRows.issues.some((issue) => issue.issueKind === "rows_spec_invalid"),
    true
  );

  // codex P1: the declaration obeys its own closed-key law — the exact
  // probe: a typo'd "rowz" must be a defect, never an empty schema
  const typo = admitArtifactSchemas([
    {
      schemaRef: "schema://t213/typo",
      artifactKey: "depthProofMap",
      rowz: { key: "rows", fields: { requirementId: "non_empty_string" } }
    }
  ]);
  assert.equal(typo.accepted, false);
  assert.equal(typo.schemas.length, 0, "an open declaration admits nothing");
  assert.equal(
    typo.issues.some(
      (issue) =>
        issue.issueKind === "unknown_key" && issue.at.endsWith(".rowz")
    ),
    true
  );
  const rowsTypo = admitArtifactSchemas([
    {
      ...DEPTH_SCHEMA,
      rows: { key: "rows", fields: { requirementId: "non_empty_string" }, extra: 1 }
    }
  ]);
  assert.equal(rowsTypo.accepted, false);
  assert.equal(
    rowsTypo.issues.some(
      (issue) =>
        issue.issueKind === "unknown_key" && issue.at.includes(".rows.extra")
    ),
    true
  );
});

test("T-217 S6 n2: enforcement — closed keys, typed fields, row law, hostile objects fail typed", () => {
  const schema = admitArtifactSchemas([DEPTH_SCHEMA]).schemas[0];
  const exact = admitArtifactAgainstSchema(
    {
      accepted: true,
      rows: [
        {
          requirementId: "REQ-A",
          depthClassRef: "depth-class://positive",
          testIdentityRefs: ["test://a"]
        }
      ]
    },
    schema
  );
  assert.equal(exact.accepted, true);

  const violations = admitArtifactAgainstSchema(
    {
      accepted: "yes",
      smuggled: 1,
      rows: [
        { requirementId: "", depthClassRef: "d", testIdentityRefs: [1] },
        "not-a-row"
      ]
    },
    schema
  );
  assert.equal(violations.accepted, false);
  const kinds = violations.issues.map((issue) => issue.issueKind);
  assert.ok(kinds.includes("field_invalid"), "accepted must be boolean");
  assert.ok(kinds.includes("unknown_key"), "closed keys");
  assert.ok(kinds.includes("row_field_invalid"));
  assert.ok(kinds.includes("row_not_object"));

  const missing = admitArtifactAgainstSchema({ rows: [] }, schema);
  assert.equal(missing.accepted, false);
  assert.ok(
    missing.issues.some((issue) => issue.issueKind === "missing_field")
  );
  const notArray = admitArtifactAgainstSchema(
    { accepted: true, rows: "nope" },
    schema
  );
  assert.ok(
    notArray.issues.some((issue) => issue.issueKind === "rows_not_array")
  );
  // D5 hostility: a throwing getter never escapes as a host exception
  const hostile = {};
  Object.defineProperty(hostile, "accepted", {
    enumerable: true,
    get() {
      throw new Error("hostile getter");
    }
  });
  const hostileAdmission = admitArtifactAgainstSchema(hostile, schema);
  assert.equal(hostileAdmission.accepted, false);
  assert.equal(hostileAdmission.issues[0].issueKind, "not_object");
});

test("T-217 S6 n3: the rendered shape authority is explicit and closed", () => {
  const text = renderArtifactSchemasText(
    admitArtifactSchemas([DEPTH_SCHEMA]).schemas
  );
  assert.match(text, /depthProofMap \(schema schema:\/\/t213\/depth-proof-map\)/u);
  assert.match(text, /closed keys/u);
  assert.match(text, /requirementId: non_empty_string/u);
  assert.equal(renderArtifactSchemasText([]), null);
});
