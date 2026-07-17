import assert from "node:assert/strict";
import test from "node:test";

import {
  CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES,
  CATALOG_OPERATION_PROJECT_READ_RELATION_SOURCES
} from "../../build/semantic/code/src/abg/m03/contracts/catalog_operation_contracts.js";
import {
  RUNTIME_AUTHORING_OPERATION_NATIVE_CONTRACT_SOURCES,
  RUNTIME_AUTHORING_OPERATION_PROJECT_READ_RELATION_SOURCES
} from "../../build/semantic/code/src/abg/m03/contracts/runtime_authoring_operation_contracts.js";
import {
  RUNTIME_PROJECTION_NATIVE_CONTRACT_SOURCES,
  RUNTIME_PROJECTION_PROJECT_READ_RELATION_SOURCES
} from "../../build/semantic/code/src/abg/m03/contracts/runtime_projection_operation_contracts.js";
import {
  ONE_SURFACE_NATIVE_CONTRACT_SOURCES,
  ONE_SURFACE_PROJECT_READ_RELATION_SOURCES
} from "../../build/semantic/code/src/abg/m03/contracts/one_surface_operation_contracts.js";
import {
  applyResolvedOwnerProjectionRelation,
  resolveSemanticBuildNativeSchemaSource,
  resolveSemanticBuildOwnerProjectionRelation
} from "../../build/semantic/code/src/shared/validation/canonical_native_schema_projector.js";

const DIGEST = `sha256:${"a".repeat(64)}`;
const OTHER_DIGEST = `sha256:${"b".repeat(64)}`;
const coordinate = (ref, digest = DIGEST) => Object.freeze({ ref, digest });

const RUNTIME_CASE_SOURCE_KINDS = Object.freeze({
  run_status: "Run",
  graph_call_status: "GraphCall",
  run_result: "Run",
  graph_call_result: "GraphCall",
  run_evidence: "Run",
  graph_call_evidence: "GraphCall",
  result_evidence: "RuntimeResult",
  workspace_replay: "WorkspaceBinding",
  run_replay: "Run",
  graph_call_replay: "GraphCall",
  interaction_replay: "FhInteraction",
  continuation_replay: "Continuation",
  c_call_replay: "CProgramAtomReceipt"
});

const RESULT_SOURCES = Object.freeze({
  catalog_list:
    CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES.project_read.catalog_list.result,
  catalog_describe:
    CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES.project_read.catalog_describe.result,
  ...Object.fromEntries(
    Object.entries(RUNTIME_PROJECTION_NATIVE_CONTRACT_SOURCES.project_read).map(
      ([caseKey, row]) => [caseKey, row.result]
    )
  ),
  witness_evidence:
    RUNTIME_AUTHORING_OPERATION_NATIVE_CONTRACT_SOURCES.project_read
      .witness_evidence.result,
  run_lawful_actions:
    ONE_SURFACE_NATIVE_CONTRACT_SOURCES.project_read.run_lawful_actions.result
});

const RELATION_SOURCES = Object.freeze({
  ...CATALOG_OPERATION_PROJECT_READ_RELATION_SOURCES,
  ...RUNTIME_PROJECTION_PROJECT_READ_RELATION_SOURCES,
  ...RUNTIME_AUTHORING_OPERATION_PROJECT_READ_RELATION_SOURCES,
  ...ONE_SURFACE_PROJECT_READ_RELATION_SOURCES
});

function sourceFor(caseKey, kind) {
  return Object.freeze({
    kind,
    sourceRef: `urn:abg:test:source:${caseKey}`,
    sourceDigest: DIGEST
  });
}

function selectorFor(caseKey) {
  switch (caseKey) {
    case "catalog_list":
      return { visibilityBasis: "workspace_catalog" };
    case "catalog_describe":
      return {
        visibilityBasis: {
          kind: "session_view",
          view: coordinate("catalog-view:test")
        },
        canonicalHandle: "graph-function:test"
      };
    case "workspace_replay":
      return {
        runtimeEventLog: coordinate("runtime-event-log:test"),
        fromOrdinal: 2,
        limit: 5
      };
    case "run_replay":
    case "graph_call_replay":
    case "interaction_replay":
    case "continuation_replay":
      return { fromOrdinal: 2, limit: 5 };
    case "c_call_replay":
      return {
        fromOrdinal: 2,
        limit: 5,
        cCall: coordinate("c-call:test")
      };
    case "run_lawful_actions":
      return {
        nextActionProjection: coordinate("next-action-projection:test")
      };
    default:
      return {};
  }
}

function sourceKindFor(caseKey) {
  if (caseKey === "catalog_list" || caseKey === "catalog_describe") {
    return "Catalog";
  }
  if (caseKey === "witness_evidence") {
    return "WitnessedAct";
  }
  if (caseKey === "run_lawful_actions") {
    return "Run";
  }
  return RUNTIME_CASE_SOURCE_KINDS[caseKey];
}

function requestFor(caseKey) {
  return Object.freeze({
    kind: "project_read_request",
    caseKey,
    source: sourceFor(caseKey, sourceKindFor(caseKey)),
    projectionBasis: coordinate(`project-read-basis:${caseKey}`),
    selector: selectorFor(caseKey)
  });
}

function projectionFor(caseKey, request = requestFor(caseKey)) {
  const subject = Object.freeze({
    kind: request.source.kind,
    ref: request.source.sourceRef,
    digest: request.source.sourceDigest
  });
  if (caseKey === "catalog_list" || caseKey === "catalog_describe") {
    return Object.freeze({
      catalog: coordinate(request.source.sourceRef, request.source.sourceDigest),
      visibilityBasis: request.selector.visibilityBasis,
      ...(caseKey === "catalog_describe"
        ? { canonicalHandle: request.selector.canonicalHandle }
        : {})
    });
  }
  if (caseKey === "run_lawful_actions") {
    return Object.freeze({
      run: coordinate(request.source.sourceRef, request.source.sourceDigest),
      nextActionProjection: request.selector.nextActionProjection
    });
  }
  if (caseKey.endsWith("_replay")) {
    return Object.freeze({
      subject,
      fromOrdinal: request.selector.fromOrdinal,
      limit: request.selector.limit,
      basis:
        caseKey === "workspace_replay"
          ? request.selector.runtimeEventLog
          : caseKey === "c_call_replay"
            ? request.selector.cCall
            : coordinate(`replay-basis:${caseKey}`)
    });
  }
  return Object.freeze({ subject });
}

async function resolveRelation(caseKey) {
  const resultSource = RESULT_SOURCES[caseKey];
  const relationSource = RELATION_SOURCES[caseKey];
  const projectionSource = await resolveSemanticBuildNativeSchemaSource(
    resultSource
  );
  return resolveSemanticBuildOwnerProjectionRelation({
    source: relationSource,
    projectionSource,
    expectedDefinitionKey: relationSource.definitionKey,
    expectedSemanticOwnerBasis: resultSource.authority.semanticOwnerBasis
  });
}

function applyRelation(caseKey, relation, request, candidateProjection) {
  return applyResolvedOwnerProjectionRelation({
    relation,
    definitionKey: RELATION_SOURCES[caseKey].definitionKey,
    admittedRequest: request,
    candidateProjection
  });
}

test("T-281 M03 project.read relation sources close the exact 17 owner cases", async () => {
  assert.deepEqual(Object.keys(RELATION_SOURCES), Object.keys(RESULT_SOURCES));
  assert.equal(Object.keys(RELATION_SOURCES).length, 17);

  for (const [caseKey, relationSource] of Object.entries(RELATION_SOURCES)) {
    const resultSource = RESULT_SOURCES[caseKey];
    assert.equal(
      relationSource.sourceLocator.modulePath,
      resultSource.sourceLocator.modulePath
    );
    assert.deepEqual(relationSource.sourceLocator.memberPath, [
      caseKey,
      "relation"
    ]);
    assert.deepEqual(
      relationSource.semanticOwnerBasis,
      resultSource.authority.semanticOwnerBasis
    );

    const relation = await resolveRelation(caseKey);
    const request = requestFor(caseKey);
    assert.deepEqual(
      applyRelation(caseKey, relation, request, projectionFor(caseKey, request)),
      { kind: "projection_related" }
    );
  }
});

test("T-281 M03 project.read relations reject a projection for another source", async () => {
  for (const caseKey of Object.keys(RELATION_SOURCES)) {
    const relation = await resolveRelation(caseKey);
    const request = requestFor(caseKey);
    const candidate = projectionFor(caseKey, request);
    const wrongSourceCandidate =
      caseKey === "catalog_list" || caseKey === "catalog_describe"
        ? { ...candidate, catalog: coordinate("catalog:other", OTHER_DIGEST) }
        : caseKey === "run_lawful_actions"
          ? { ...candidate, run: coordinate("run:other", OTHER_DIGEST) }
          : {
              ...candidate,
              subject: {
                ...candidate.subject,
                ref: "subject:other",
                digest: OTHER_DIGEST
              }
            };
    const result = applyRelation(
      caseKey,
      relation,
      request,
      wrongSourceCandidate
    );
    assert.equal(result.kind, "projection_relation_mismatch", caseKey);
    assert.deepEqual(result.issuePaths, [
      caseKey.startsWith("catalog_")
        ? "candidateProjection.catalog"
        : caseKey === "run_lawful_actions"
          ? "candidateProjection.run"
          : "candidateProjection.subject"
    ]);
  }
});

test("T-281 M03 project.read relations reject represented selector drift", async () => {
  const cases = [
    "catalog_list",
    "catalog_describe",
    "workspace_replay",
    "run_replay",
    "graph_call_replay",
    "interaction_replay",
    "continuation_replay",
    "c_call_replay",
    "run_lawful_actions"
  ];
  for (const caseKey of cases) {
    const relation = await resolveRelation(caseKey);
    const request = requestFor(caseKey);
    const candidate = projectionFor(caseKey, request);
    let drifted;
    if (caseKey === "catalog_list") {
      drifted = {
        ...candidate,
        visibilityBasis: {
          kind: "session_view",
          view: coordinate("catalog-view:other", OTHER_DIGEST)
        }
      };
    } else if (caseKey === "catalog_describe") {
      drifted = { ...candidate, canonicalHandle: "graph-function:other" };
    } else if (caseKey === "run_lawful_actions") {
      drifted = {
        ...candidate,
        nextActionProjection: coordinate(
          "next-action-projection:other",
          OTHER_DIGEST
        )
      };
    } else {
      drifted = { ...candidate, fromOrdinal: candidate.fromOrdinal + 1 };
    }
    const result = applyRelation(caseKey, relation, request, drifted);
    assert.equal(result.kind, "projection_relation_mismatch", caseKey);
  }

  for (const caseKey of ["workspace_replay", "c_call_replay"]) {
    const relation = await resolveRelation(caseKey);
    const request = requestFor(caseKey);
    const candidate = projectionFor(caseKey, request);
    const result = applyRelation(caseKey, relation, request, {
      ...candidate,
      basis: coordinate("replay-basis:other", OTHER_DIGEST)
    });
    assert.deepEqual(result, {
      kind: "projection_relation_mismatch",
      issuePaths: ["candidateProjection.basis"]
    });
  }
});
