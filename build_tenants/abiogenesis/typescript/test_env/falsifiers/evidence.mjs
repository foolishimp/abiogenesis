import assert from "node:assert/strict";
import { createHash } from "node:crypto";

function canonicalize(value) {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(canonicalize);
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalize(value[key])]),
  );
}

export function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

export function sha256(value) {
  const bytes = typeof value === "string" ? value : canonicalJson(value);
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

export function normalizeRelation(record) {
  assert.match(record.relationId, /^AX-(?:F(?:0[1-9]|1[0-4])|PFC-F08)$/u);
  assert.ok(
    record.disposition === "confirmed_red" ||
      record.disposition === "preserved_green" ||
      record.disposition === "repaired_green",
  );
  for (const field of ["claim", "ingress"]) {
    assert.equal(typeof record[field], "string", `${record.relationId}.${field}`);
    assert.ok(record[field].length > 0, `${record.relationId}.${field}`);
  }
  assert.notEqual(record.fixtureSource, undefined, `${record.relationId}.fixtureSource`);
  assert.ok(
    canonicalJson(record.fixtureSource).length > 0,
    `${record.relationId}.fixtureSource`,
  );
  assert.equal(typeof record.processBoundary, "string");
  assert.ok(record.processBoundary.length > 0);
  assert.ok(Array.isArray(record.cases) && record.cases.length > 0);
  assert.ok(Array.isArray(record.maskControls) && record.maskControls.length > 0);
  assert.equal(
    record.maskControls.every((control) => control.passed === true),
    true,
    `${record.relationId} has an unsatisfied masking control`,
  );
  const caseIds = record.cases.map((entry) => entry.caseId);
  assert.equal(new Set(caseIds).size, caseIds.length);
  assert.equal(
    record.cases.every(
      (entry) => !Object.hasOwn(entry, "passed") || entry.passed === true,
    ),
    true,
    `${record.relationId} has a case that does not match its frozen baseline`,
  );
  const normalized = {
    relationId: record.relationId,
    disposition: record.disposition,
    claim: record.claim,
    ingress: record.ingress,
    fixtureSource: record.fixtureSource,
    processBoundary: record.processBoundary,
    mutationDigest: sha256(record.mutation),
    oracleDigest: sha256(record.oracle),
    expectedBaselineSignatureDigest: sha256(
      record.expectedBaselineSignature,
    ),
    observedSignatureDigest: sha256(record.observedSignature),
    mutation: record.mutation,
    oracle: record.oracle,
    expectedBaselineSignature: record.expectedBaselineSignature,
    observedSignature: record.observedSignature,
    cases: record.cases,
    maskControls: record.maskControls,
  };
  return {
    ...normalized,
    relationDigest: sha256(normalized),
  };
}

export const EXPECTED_RELATION_IDS = Object.freeze([
  "AX-F01",
  "AX-F02",
  "AX-F03",
  "AX-F04",
  "AX-F05",
  "AX-F06",
  "AX-F07",
  "AX-F08",
  "AX-F09",
  "AX-F10",
  "AX-F11",
  "AX-F12",
  "AX-F13",
  "AX-F14",
  "AX-PFC-F08",
]);
