// F_D mechanical envelope evaluator.
//
// Strictly mechanical. F_D never reads semantic content. F_D only verifies:
//   - the worker wrote a file at the T-082-allocated materialization path
//   - the artifact's declared schema parses (markdown is non-empty;
//     JSON parses; TypeScript file has at least one export keyword)
//   - the digest in the materialization event matches the on-disk digest
//   - the manifest's allocated outputs include the produced asset ref
//
// Any judgment that depends on what the content MEANS — even a string match —
// belongs in fp_evaluator.mjs. Determinism does NOT make a check F_D.

import { createHash } from "node:crypto";
import { stat } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import path from "node:path";

function sha256(text) {
  return `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
}

function declaredSchemaForEdge(edgeName) {
  if (edgeName === "derive_field_spec") {
    return "markdown";
  }
  if (edgeName === "derive_implementation") {
    return "typescript_module";
  }
  if (edgeName === "derive_validation") {
    return "json";
  }
  return "unknown";
}

function checkSchema(schema, body) {
  if (schema === "markdown") {
    return body.trim().length === 0
      ? { ok: false, detail: "markdown body is empty" }
      : { ok: true, detail: null };
  }
  if (schema === "json") {
    try {
      JSON.parse(body);
    } catch (error) {
      return {
        ok: false,
        detail: `JSON parse failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
    return { ok: true, detail: null };
  }
  if (schema === "typescript_module") {
    if (!/\bexport\b/u.test(body)) {
      return { ok: false, detail: "typescript module has no 'export' keyword" };
    }
    return { ok: true, detail: null };
  }
  return { ok: false, detail: `unknown declared schema ${schema}` };
}

export async function evaluateFdEnvelope(input) {
  const { edgeDef, artifactPath, allocation, manifest, expectedDigest } = input;
  const checks = [];

  // Mechanical: file exists.
  let stats;
  try {
    stats = await stat(artifactPath);
  } catch (error) {
    return {
      ok: false,
      checks: [
        {
          name: "artifact_file_exists",
          ok: false,
          detail: `cannot stat ${artifactPath}: ${
            error instanceof Error ? error.message : String(error)
          }`
        }
      ]
    };
  }
  checks.push({
    name: "artifact_file_exists",
    ok: stats.isFile(),
    detail: stats.isFile() ? null : `not a regular file: ${artifactPath}`
  });

  // Mechanical: file is under the T-082-allocated materialization root.
  const allocationRoot = path.dirname(allocation.materializationUri);
  const underAllocation =
    artifactPath === allocation.materializationUri ||
    path.resolve(artifactPath).startsWith(`${path.resolve(allocationRoot)}${path.sep}`);
  checks.push({
    name: "artifact_under_allocation_root",
    ok: underAllocation,
    detail: underAllocation
      ? null
      : `artifact ${artifactPath} not under ${allocationRoot}`
  });

  // Mechanical: declared schema parses.
  const body = await readFile(artifactPath, "utf8");
  const schema = declaredSchemaForEdge(edgeDef.name);
  const schemaCheck = checkSchema(schema, body);
  checks.push({
    name: "declared_schema_parses",
    ok: schemaCheck.ok,
    detail: schemaCheck.detail
  });

  // Mechanical: digest matches.
  const observedDigest = sha256(body);
  const digestOk = observedDigest === expectedDigest;
  checks.push({
    name: "digest_matches",
    ok: digestOk,
    detail: digestOk
      ? null
      : `expected ${expectedDigest}, observed ${observedDigest}`
  });

  // Mechanical: manifest envelope binds the asset ref.
  const manifestBindsOutput = manifest.allocatedOutputs.some(
    (entry) => entry.assetRef === allocation.assetRef
  );
  checks.push({
    name: "manifest_envelope_intact",
    ok: manifestBindsOutput,
    detail: manifestBindsOutput
      ? null
      : `manifest does not bind asset ${allocation.assetRef}`
  });

  return {
    ok: checks.every((entry) => entry.ok),
    checks
  };
}

export { sha256 };
