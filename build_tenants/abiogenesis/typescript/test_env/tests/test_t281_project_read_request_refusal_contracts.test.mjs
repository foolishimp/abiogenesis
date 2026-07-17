import assert from "node:assert/strict";
import test from "node:test";

import * as v from "valibot";

import { PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES } from "../../build/semantic/code/src/app/m04/public_contracts/project_read_operation_contracts.js";
import { projectCanonicalNativeJsonSchema } from "../../build/semantic/code/src/shared/validation/canonical_native_schema_projector.js";

const PROJECT_READ_CASES = Object.freeze([
  "catalog_list",
  "catalog_describe",
  "workspace_status",
  "run_status",
  "graph_call_status",
  "run_result",
  "graph_call_result",
  "run_evidence",
  "graph_call_evidence",
  "result_evidence",
  "assessment_evidence",
  "witness_evidence",
  "install_evidence",
  "release_evidence",
  "workspace_replay",
  "run_replay",
  "graph_call_replay",
  "interaction_replay",
  "continuation_replay",
  "c_call_replay",
  "workspace_gaps",
  "run_gaps",
  "run_lawful_actions",
  "observer_report",
  "observer_drafts",
  "tuning_report",
  "ticket_consensus"
]);

const SOURCE_KIND_BY_CASE = Object.freeze({
  catalog_list: "Catalog",
  catalog_describe: "Catalog",
  workspace_status: "WorkspaceBinding",
  run_status: "Run",
  graph_call_status: "GraphCall",
  run_result: "Run",
  graph_call_result: "GraphCall",
  run_evidence: "Run",
  graph_call_evidence: "GraphCall",
  result_evidence: "RuntimeResult",
  assessment_evidence: "ResultAssessment",
  witness_evidence: "WitnessedAct",
  install_evidence: "InstalledProduct",
  release_evidence: "ReleaseCut",
  workspace_replay: "WorkspaceBinding",
  run_replay: "Run",
  graph_call_replay: "GraphCall",
  interaction_replay: "FhInteraction",
  continuation_replay: "Continuation",
  c_call_replay: "CProgramAtomReceipt",
  workspace_gaps: "WorkspaceBinding",
  run_gaps: "Run",
  run_lawful_actions: "Run",
  observer_report: "WorkspaceBinding",
  observer_drafts: "WorkspaceBinding",
  tuning_report: "WorkspaceBinding",
  ticket_consensus: "ConsensusResult"
});

const digest = (character = "a") => `sha256:${character.repeat(64)}`;
const refDigest = (name, character = "b") => ({
  ref: `urn:abg:test:${name}`,
  digest: digest(character)
});

function selectorFor(caseKey) {
  switch (caseKey) {
    case "catalog_list":
      return { visibilityBasis: "workspace_catalog" };
    case "catalog_describe":
      return {
        visibilityBasis: {
          kind: "session_view",
          view: refDigest("catalog-view")
        },
        canonicalHandle: "graph-function://abg/test"
      };
    case "install_evidence":
      return { installManifest: refDigest("install-manifest") };
    case "release_evidence":
      return {
        releaseSnapshotManifest: refDigest("release-snapshot-manifest")
      };
    case "workspace_replay":
      return {
        runtimeEventLog: refDigest("runtime-event-log"),
        fromOrdinal: 0,
        limit: 25
      };
    case "run_replay":
    case "graph_call_replay":
    case "interaction_replay":
    case "continuation_replay":
      return { fromOrdinal: 0, limit: 25 };
    case "c_call_replay":
      return {
        fromOrdinal: 0,
        limit: 25,
        cCall: refDigest("c-call")
      };
    case "workspace_gaps":
      return { gapBasis: refDigest("gap-basis") };
    case "run_lawful_actions":
      return { nextActionProjection: refDigest("next-action-projection") };
    case "observer_report":
      return {
        observationBasis: refDigest("observer-observables"),
        sourceProjectionRefs: ["urn:abg:test:source-projection"]
      };
    case "observer_drafts":
      return { observerObservables: refDigest("observer-observables") };
    case "tuning_report":
      return { tuningTelemetryBasis: refDigest("tuning-telemetry-basis") };
    case "ticket_consensus":
      return {
        ticket: refDigest("ticket"),
        outputAuthority: refDigest("consensus-output-authority"),
        replayBasis: refDigest("consensus-replay-basis")
      };
    default:
      return {};
  }
}

function requestFor(caseKey) {
  return {
    kind: "project_read_request",
    caseKey,
    source: {
      kind: SOURCE_KIND_BY_CASE[caseKey],
      sourceRef: `urn:abg:test:source:${caseKey}`,
      sourceDigest: digest("c")
    },
    projectionBasis: refDigest(`projection-basis:${caseKey}`, "d"),
    selector: selectorFor(caseKey)
  };
}

function refusalFor(caseKey, code = "not_ready") {
  const request = requestFor(caseKey);
  return {
    kind: "project_read_refusal",
    caseKey,
    source: request.source,
    projectionBasis: request.projectionBasis,
    code,
    residualRefs: [`urn:abg:test:residual:${caseKey}`],
    evidenceRefs: [],
    provenanceRefs: []
  };
}

function accepts(schema, value) {
  return v.safeParse(schema, value).success;
}

test("T-281 project.read owner inputs form one exact 27-case, 54-slot family", () => {
  assert.deepEqual(
    Object.keys(PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES),
    PROJECT_READ_CASES
  );

  const contractIds = new Set();
  for (const caseKey of PROJECT_READ_CASES) {
    const contractSet = PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES[caseKey];
    assert.deepEqual(Object.keys(contractSet), ["request", "refusal"]);
    for (const slot of ["request", "refusal"]) {
      const source = contractSet[slot];
      assert.deepEqual(source.authority.subject, {
        operationId: "abg.operation.project.read",
        memberKind: "project_read_case",
        caseKey,
        slot
      });
      assert.deepEqual(source.sourceLocator.memberPath, [
        caseKey,
        slot,
        "schema"
      ]);
      assert.equal(
        source.sourceLocator.modulePath,
        "code/src/app/m04/public_contracts/project_read_operation_contracts.js"
      );
      assert.equal(
        source.sourceLocator.exportName,
        "PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES"
      );
      assert.equal(
        source.identity.contractId,
        `abg.contract.operation.project.read.${caseKey}.${slot}`
      );
      assert.equal(
        source.identity.schemaId,
        `abg.schema.operation.project.read.${caseKey}.${slot}`
      );
      assert.equal(source.authority.owner.family, "project_read_contract_family");
      assert.equal(
        source.authority.semanticOwnerBasis.digest,
        "sha256:ea67216190dc59dd14eac9797ab544ee79d9798673a82925d2d8bcddb2a2dfb5"
      );
      assert.equal(Object.isFrozen(source), true);
      contractIds.add(source.identity.contractId);
    }
  }
  assert.equal(contractIds.size, 54);
});

test("T-281 all 54 owner inputs project through shared canonical actions", () => {
  let projectedCount = 0;
  for (const contractSet of Object.values(
    PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES
  )) {
    for (const source of Object.values(contractSet)) {
      const projected = projectCanonicalNativeJsonSchema(source.schema);
      assert.equal(
        projected.$schema,
        "https://json-schema.org/draft/2020-12/schema"
      );
      projectedCount += 1;
    }
  }
  assert.equal(projectedCount, 54);
});

test("T-281 admits one strict request and case-indexed refusal for every case", () => {
  for (const caseKey of PROJECT_READ_CASES) {
    const contractSet = PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES[caseKey];
    assert.equal(
      accepts(contractSet.request.schema, requestFor(caseKey)),
      true,
      `${caseKey} request`
    );
    assert.equal(
      accepts(contractSet.refusal.schema, refusalFor(caseKey)),
      true,
      `${caseKey} refusal`
    );

    assert.equal(
      accepts(contractSet.request.schema, {
        ...requestFor(caseKey),
        secondOperationKey: "forbidden"
      }),
      false,
      `${caseKey} request must be strict`
    );
    assert.equal(
      accepts(contractSet.refusal.schema, {
        ...refusalFor(caseKey),
        message: "no local refusal shell"
      }),
      false,
      `${caseKey} refusal must be strict`
    );
  }
});

test("T-281 request schemas preserve source, selector, and replay grammar", () => {
  const runStatus =
    PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.run_status.request.schema;
  assert.equal(
    accepts(runStatus, {
      ...requestFor("run_status"),
      source: { ...requestFor("run_status").source, kind: "GraphCall" }
    }),
    false
  );
  assert.equal(
    accepts(runStatus, {
      ...requestFor("run_status"),
      caseKey: "run_result"
    }),
    false
  );
  assert.equal(
    accepts(runStatus, {
      ...requestFor("run_status"),
      selector: { fromOrdinal: 0, limit: 1 }
    }),
    false
  );

  const runReplay =
    PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.run_replay.request.schema;
  assert.equal(
    accepts(runReplay, {
      ...requestFor("run_replay"),
      selector: { fromOrdinal: -1, limit: 1 }
    }),
    false
  );
  assert.equal(
    accepts(runReplay, {
      ...requestFor("run_replay"),
      selector: { fromOrdinal: 0, limit: 0 }
    }),
    false
  );
  assert.equal(
    accepts(runReplay, {
      ...requestFor("run_replay"),
      selector: { range: { fromOrdinal: 0, limit: 1 } }
    }),
    false
  );

  const catalogDescribe =
    PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.catalog_describe.request
      .schema;
  assert.equal(
    accepts(catalogDescribe, {
      ...requestFor("catalog_describe"),
      selector: { visibilityBasis: "workspace_catalog" }
    }),
    false
  );

  const observerReport =
    PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.observer_report.request
      .schema;
  const observerRequest = requestFor("observer_report");
  assert.equal(
    accepts(observerReport, {
      ...observerRequest,
      selector: {
        ...observerRequest.selector,
        sourceProjectionRefs: []
      }
    }),
    false
  );
  assert.equal(
    accepts(observerReport, {
      ...observerRequest,
      selector: {
        ...observerRequest.selector,
        sourceProjectionRefs: ["urn:duplicate", "urn:duplicate"]
      }
    }),
    false
  );
});

test("T-281 refusal vocabularies are case-indexed and identity lists are strict", () => {
  const catalogList =
    PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.catalog_list.refusal.schema;
  const catalogDescribe =
    PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.catalog_describe.refusal
      .schema;
  const runReplay =
    PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.run_replay.refusal.schema;
  const runStatus =
    PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.run_status.refusal.schema;

  assert.equal(accepts(catalogList, refusalFor("catalog_list", "unbound")), true);
  assert.equal(
    accepts(catalogList, refusalFor("catalog_list", "unknown_handle")),
    false
  );
  assert.equal(
    accepts(
      catalogDescribe,
      refusalFor("catalog_describe", "unknown_handle")
    ),
    true
  );
  assert.equal(
    accepts(catalogDescribe, refusalFor("catalog_describe", "hidden_by_view")),
    true
  );
  assert.equal(
    accepts(runReplay, refusalFor("run_replay", "cursor_invalid")),
    true
  );
  assert.equal(
    accepts(runStatus, refusalFor("run_status", "cursor_invalid")),
    false
  );
  assert.equal(
    accepts(runStatus, { ...refusalFor("run_status"), residualRefs: [] }),
    false
  );
  assert.equal(
    accepts(runStatus, {
      ...refusalFor("run_status"),
      residualRefs: ["urn:duplicate", "urn:duplicate"]
    }),
    false
  );
  assert.equal(
    accepts(runStatus, {
      ...refusalFor("run_status"),
      projectionBasis: {
        ...refusalFor("run_status").projectionBasis,
        digest: "sha256:not-a-digest"
      }
    }),
    false
  );
});
