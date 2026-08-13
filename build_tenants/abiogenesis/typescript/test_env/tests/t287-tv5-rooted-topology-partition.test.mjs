import assert from "node:assert/strict";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";

const root = resolve(import.meta.dirname, "../..");
const partitionApi = await import(pathToFileURL(join(
  root,
  "build/code/src/shared/rooted_topology_partition.js",
)).href);

const BASIS_DIGEST = `sha256:${"a".repeat(64)}`;

function segment(segmentRef, parentRef) {
  return { segmentRef, parentRef };
}

function witness(segments, overrides = {}) {
  return {
    kind: "canonical_rooted_topology_witness",
    schemaVersion: "5.0.0",
    topologyRef: "graph://t287/tv5/topology@5",
    basisRef: "graph-materialization://t287/tv5/topology",
    basisDigest: BASIS_DIGEST,
    rootRef: "graph-materialization://t287/tv5/topology",
    segments,
    ...overrides,
  };
}

const outerRef = "c-retry-topology-segment://t287/tv5/outer";
const innerRef = "c-retry-topology-segment://t287/tv5/inner";
const siblingRef = "c-retry-topology-segment://t287/tv5/sibling";
const rootPath = () => witness([]);
const outerPath = () => witness([
  segment(outerRef, "graph-materialization://t287/tv5/topology"),
]);
const nestedPath = () => witness([
  segment(outerRef, "graph-materialization://t287/tv5/topology"),
  segment(innerRef, outerRef),
]);

function derive(source, target) {
  return partitionApi.deriveCanonicalRootedTopologyPartition(source, target);
}

test("T-287 TV5 canonical rooted-topology partition is deterministic, detached, and frozen", () => {
  const mutableSource = nestedPath();
  const first = derive(mutableSource, structuredClone(mutableSource));
  const second = derive(nestedPath(), nestedPath());
  assert.equal(first.kind, "canonical_rooted_topology_partition");
  assert.deepEqual(first, second);
  assert.deepEqual(first.preserved, [outerRef, innerRef]);
  assert.deepEqual(first.exited, []);
  assert.deepEqual(first.entered, []);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.preserved), true);
  assert.equal(Object.isFrozen(first.exited), true);
  assert.equal(Object.isFrozen(first.entered), true);

  mutableSource.segments[0].segmentRef = "c-retry-topology-segment://forged";
  mutableSource.segments.push(segment(siblingRef, outerRef));
  assert.deepEqual(first.preserved, [outerRef, innerRef],
    "the partition is detached from later witness mutation");
});

test("T-287 TV5 canonical rooted-topology partition covers ancestor, descendant, lateral, and nested paths", () => {
  const ancestor = derive(nestedPath(), outerPath());
  assert.deepEqual(ancestor.preserved, [outerRef]);
  assert.deepEqual(ancestor.exited, [innerRef]);
  assert.deepEqual(ancestor.entered, []);

  const descendant = derive(outerPath(), nestedPath());
  assert.deepEqual(descendant.preserved, [outerRef]);
  assert.deepEqual(descendant.exited, []);
  assert.deepEqual(descendant.entered, [innerRef]);

  const lateral = derive(nestedPath(), witness([
    segment(outerRef, "graph-materialization://t287/tv5/topology"),
    segment(siblingRef, outerRef),
  ]));
  assert.deepEqual(lateral.preserved, [outerRef]);
  assert.deepEqual(lateral.exited, [innerRef]);
  assert.deepEqual(lateral.entered, [siblingRef]);

  const direct = derive(nestedPath(), rootPath());
  assert.deepEqual(direct.preserved, []);
  assert.deepEqual(direct.exited, [innerRef, outerRef]);
  assert.deepEqual(direct.entered, []);
});

test("T-287 TV5 canonical rooted-topology partition returns its closed refusal family without partial output", () => {
  const cases = [
    [
      "invalid_witness",
      { ...nestedPath(), extra: true },
      rootPath(),
    ],
    [
      "invalid_witness",
      { ...nestedPath(), topologyRef: "" },
      rootPath(),
    ],
    [
      "invalid_witness",
      { ...nestedPath(), basisDigest: "sha256:invalid" },
      rootPath(),
    ],
    [
      "invalid_witness",
      witness([{ segmentRef: outerRef, parentRef: rootPath().rootRef, extra: 1 }]),
      rootPath(),
    ],
    [
      "adjacency_mismatch",
      witness([segment(outerRef, "graph-materialization://wrong-root")]),
      rootPath(),
    ],
    [
      "adjacency_mismatch",
      witness([
        segment(outerRef, rootPath().rootRef),
        segment(outerRef, outerRef),
      ]),
      rootPath(),
    ],
    [
      "adjacency_mismatch",
      witness([segment(rootPath().rootRef, rootPath().rootRef)]),
      rootPath(),
    ],
    [
      "topology_mismatch",
      rootPath(),
      witness([], { topologyRef: "graph://t287/tv5/other@5" }),
    ],
    [
      "basis_mismatch",
      rootPath(),
      witness([], { basisRef: "graph-materialization://t287/tv5/other" }),
    ],
    [
      "basis_mismatch",
      rootPath(),
      witness([], { basisDigest: `sha256:${"b".repeat(64)}` }),
    ],
    [
      "root_mismatch",
      rootPath(),
      witness([], { rootRef: "graph-materialization://t287/tv5/other-root" }),
    ],
  ];
  for (const [expectedCode, source, target] of cases) {
    const result = derive(source, target);
    assert.equal(result.kind,
      "canonical_rooted_topology_partition_refusal");
    assert.equal(result.code, expectedCode);
    assert.equal(result.disposition, "refused");
    assert.equal(Object.isFrozen(result), true);
    assert.equal(Object.hasOwn(result, "preserved"), false);
    assert.equal(Object.hasOwn(result, "exited"), false);
    assert.equal(Object.hasOwn(result, "entered"), false);
  }

  const targetInvalidWinsBeforeCrossWitnessComparison = derive(
    rootPath(),
    { ...witness([], { topologyRef: "graph://different" }), extra: true },
  );
  assert.equal(targetInvalidWinsBeforeCrossWitnessComparison.code,
    "invalid_witness");
  const sourceAdjacencyWinsBeforeTargetValidation = derive(
    witness([segment(outerRef, "graph-materialization://wrong-root")]),
    { ...rootPath(), extra: true },
  );
  assert.equal(sourceAdjacencyWinsBeforeTargetValidation.code,
    "adjacency_mismatch");

  const reusedRef = "c-retry-topology-segment://t287/tv5/reused";
  const insertedRef = "c-retry-topology-segment://t287/tv5/inserted";
  const crossWitnessTwoParentRefusal = derive(
    witness([
      segment(outerRef, rootPath().rootRef),
      segment(reusedRef, outerRef),
    ]),
    witness([
      segment(outerRef, rootPath().rootRef),
      segment(insertedRef, outerRef),
      segment(reusedRef, insertedRef),
    ]),
  );
  assert.equal(crossWitnessTwoParentRefusal.kind,
    "canonical_rooted_topology_partition_refusal");
  assert.equal(crossWitnessTwoParentRefusal.code, "adjacency_mismatch");
  assert.equal(crossWitnessTwoParentRefusal.disposition, "refused");
  assert.equal(Object.isFrozen(crossWitnessTwoParentRefusal), true);
  assert.equal(Object.hasOwn(crossWitnessTwoParentRefusal, "preserved"), false);
  assert.equal(Object.hasOwn(crossWitnessTwoParentRefusal, "exited"), false);
  assert.equal(Object.hasOwn(crossWitnessTwoParentRefusal, "entered"), false);
});
