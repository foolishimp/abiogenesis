// Validates: T-200 D1

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const designPath = resolve(
  "design/ODD_SDLC_TYPESCRIPT_DEPTH_TRAVERSAL_FUNCTION.md"
);

test("T-200 D1 design names depth graph function, carriers, owners, and non-closure signals", () => {
  const design = readFileSync(designPath, "utf8");

  assert.match(design, /Fg_decompose_depth_between_nodes/);
  assert.match(design, /sdlc_decomposition_trace_register/);
  assert.match(design, /sdlc_depth_traversal_outcome/);
  assert.match(design, /sdlc_decomposition_trace_closure/);
  assert.match(design, /ABG owns graph calls, graph-vector execution, runtime events, replay/);
  assert.match(design, /odd_sdlc` owns product graph-function publication/);
  assert.match(design, /F_D` may admit, reject, route, validate, digest, and project refs/);
  assert.match(design, /does\s+not construct runtime truth or execute a traversal/);
  assert.match(design, /downstream-deferred finding remains prose/);
  assert.match(design, /command evidence such as `sbt test` exists without requirement-bound source/);
});
