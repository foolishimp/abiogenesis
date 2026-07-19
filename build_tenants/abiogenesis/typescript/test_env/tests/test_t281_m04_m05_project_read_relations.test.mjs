import assert from "node:assert/strict";
import test from "node:test";

import { GAPS_PROJECT_READ_RELATION_SOURCES } from "../../build/semantic/code/src/app/m04/gaps/operation_contracts.js";
import { PRODUCT_INTAKE_PROJECT_READ_RELATION_SOURCES } from "../../build/semantic/code/src/app/m04/product_intake/operation_contracts.js";
import { RESULT_ASSESSMENT_PROJECT_READ_RELATION_SOURCES } from "../../build/semantic/code/src/app/m04/result_assessment/operation_contracts.js";
import { WORKSPACE_PROJECT_READ_RELATION_SOURCES } from "../../build/semantic/code/src/app/m04/workspace/operation_contracts.js";
import { RELEASE_OPERATION_PROJECT_READ_RELATION_SOURCES } from "../../build/semantic/code/src/qualification/m05/exact_candidate_release_operation_contracts.js";

const digest = (character) => `sha256:${character.repeat(64)}`;
const coordinate = (ref, character) => ({ ref, digest: digest(character) });

const RELATIONS = Object.freeze({
  workspace_status: WORKSPACE_PROJECT_READ_RELATION_SOURCES.workspace_status,
  assessment_evidence:
    RESULT_ASSESSMENT_PROJECT_READ_RELATION_SOURCES.assessment_evidence,
  install_evidence:
    PRODUCT_INTAKE_PROJECT_READ_RELATION_SOURCES.install_evidence,
  workspace_gaps: GAPS_PROJECT_READ_RELATION_SOURCES.workspace_gaps,
  run_gaps: GAPS_PROJECT_READ_RELATION_SOURCES.run_gaps,
  release_evidence:
    RELEASE_OPERATION_PROJECT_READ_RELATION_SOURCES.release_evidence
});

function request(caseKey, sourceKind, source, selector = {}) {
  return {
    kind: "project_read_request",
    caseKey,
    source: {
      kind: sourceKind,
      sourceRef: source.ref,
      sourceDigest: source.digest
    },
    projectionBasis: coordinate(`project-read-basis:${caseKey}`, "0"),
    selector
  };
}

function relationInput(source, admittedRequest, candidateProjection) {
  return {
    definitionKey: source.definitionKey,
    admittedRequest,
    candidateProjection
  };
}

function workspaceStatusProjection(binding) {
  return {
    kind: "workspace_status_projection",
    projection: coordinate("projection:workspace-status", "1"),
    workspace: coordinate("workspace:current", "2"),
    workspaceAuthority: coordinate("authority:workspace", "3"),
    binding,
    authorityMode: "imported",
    readiness: "ready",
    boundProductRefs: ["product:abiogenesis"],
    artifactAvailability: [],
    configurations: [coordinate("configuration:primary", "4")],
    catalog: coordinate("catalog:workspace", "5"),
    residualRefs: [],
    provenanceRefs: ["event:workspace-bound"]
  };
}

function evidenceProjection(subjectKind, subject, basis, suffix) {
  return {
    kind: "evidence_projection",
    projection: coordinate(`projection:${suffix}`, "6"),
    subject: { kind: subjectKind, ...subject },
    rows: [
      {
        evidence: coordinate(`evidence:${suffix}`, "7"),
        evidenceContract: coordinate("contract:evidence", "8"),
        admittedValue: { disposition: "verified" },
        subject: { kind: subjectKind, ...subject },
        material: {
          kind: "content",
          content: coordinate(`content:${suffix}`, "9")
        },
        producer: coordinate("producer:abg", "a"),
        basis,
        provenanceRefs: ["event:evidence-admitted"],
        replay: coordinate(`replay:${suffix}`, "b")
      }
    ]
  };
}

function workspaceGapsProjection(subject, gapBasis) {
  return {
    kind: "gap_projection",
    projection: coordinate("projection:workspace-gaps", "c"),
    subject: { kind: "WorkspaceBinding", ...subject },
    replayBasis: gapBasis,
    rows: [
      {
        gap: coordinate("gap:workspace", "d"),
        disposition: "gap",
        implicatedAsset: { kind: "absent" },
        graphFunction: { kind: "absent" },
        reasons: ["required result is absent"],
        requiredCapabilityRefs: [],
        interaction: { kind: "absent" },
        evidenceRefs: ["evidence:gap"],
        replay: coordinate("replay:workspace-gap", "e")
      }
    ]
  };
}

function runGapsProjection(subject, replayBasis) {
  return {
    kind: "gap_projection",
    projection: coordinate("projection:run-gaps", "f"),
    subject: { kind: "Run", ...subject },
    replayBasis,
    rows: [
      {
        gap: coordinate("gap:run", "0"),
        disposition: "gap",
        implicatedAsset: { kind: "absent" },
        graphFunction: { kind: "absent" },
        reasons: ["run remains incomplete"],
        requiredCapabilityRefs: [],
        interaction: { kind: "absent" },
        evidenceRefs: ["evidence:run-gap"],
        replay: coordinate("replay:run-gap", "1")
      }
    ]
  };
}

test("six owner relation sources retain exact immutable identity and locator", () => {
  for (const [caseKey, source] of Object.entries(RELATIONS)) {
    assert.equal(Object.isFrozen(source), true);
    assert.deepEqual(source.definitionKey, {
      operationId: "abg.operation.project.read",
      memberKind: "project_read_case",
      caseKey
    });
    assert.equal(source.sourceLocator.sourceRoot, "semantic_build");
    assert.deepEqual(source.sourceLocator.memberPath, [caseKey, "relation"]);
    assert.equal(
      source.relationIdentity,
      `relation://abg/project-read/${caseKey.replaceAll("_", "-")}@5`
    );
  }
});

test("workspace status relates the admitted binding to the projection binding", () => {
  const source = RELATIONS.workspace_status;
  const binding = coordinate("binding:workspace", "f");
  const admittedRequest = request(
    "workspace_status",
    "WorkspaceBinding",
    binding
  );
  const projection = workspaceStatusProjection(binding);
  assert.deepEqual(
    source.relation(relationInput(source, admittedRequest, projection)),
    { kind: "projection_related" }
  );
  assert.deepEqual(
    source.relation(relationInput(source, admittedRequest, {
      ...projection,
      binding: coordinate("binding:other", "f")
    })),
    {
      kind: "projection_relation_mismatch",
      issuePaths: ["candidateProjection.binding"]
    }
  );
});

test("assessment evidence relates the admitted assessment to its projection subject", () => {
  const source = RELATIONS.assessment_evidence;
  const subject = coordinate("assessment:one", "1");
  const admittedRequest = request(
    "assessment_evidence",
    "ResultAssessment",
    subject
  );
  const projection = evidenceProjection(
    "ResultAssessment",
    subject,
    coordinate("basis:assessment", "2"),
    "assessment"
  );
  assert.deepEqual(
    source.relation(relationInput(source, admittedRequest, projection)),
    { kind: "projection_related" }
  );
  assert.deepEqual(
    source.relation(relationInput(source, admittedRequest, {
      ...projection,
      subject: {
        ...projection.subject,
        digest: digest("3")
      }
    })),
    {
      kind: "projection_relation_mismatch",
      issuePaths: ["candidateProjection.subject"]
    }
  );
});

test("install evidence relates source and install-manifest selector with precise paths", () => {
  const source = RELATIONS.install_evidence;
  const subject = coordinate("installed-product:one", "4");
  const installManifest = coordinate("install-manifest:one", "5");
  const admittedRequest = request(
    "install_evidence",
    "InstalledProduct",
    subject,
    { installManifest }
  );
  const projection = evidenceProjection(
    "InstalledProduct",
    subject,
    installManifest,
    "install"
  );
  assert.deepEqual(
    source.relation(relationInput(source, admittedRequest, projection)),
    { kind: "projection_related" }
  );
  assert.deepEqual(
    source.relation(relationInput(source, admittedRequest, {
      ...projection,
      subject: { ...projection.subject, ref: "installed-product:other" },
      rows: [{ ...projection.rows[0], basis: coordinate("manifest:other", "6") }]
    })),
    {
      kind: "projection_relation_mismatch",
      issuePaths: [
        "candidateProjection.subject",
        "candidateProjection.rows.0.basis"
      ]
    }
  );
});

test("workspace gaps relates source and requested gap basis", () => {
  const source = RELATIONS.workspace_gaps;
  const subject = coordinate("binding:workspace", "7");
  const gapBasis = coordinate("gap-basis:workspace", "8");
  const admittedRequest = request(
    "workspace_gaps",
    "WorkspaceBinding",
    subject,
    { gapBasis }
  );
  const projection = workspaceGapsProjection(subject, gapBasis);
  assert.deepEqual(
    source.relation(relationInput(source, admittedRequest, projection)),
    { kind: "projection_related" }
  );
  assert.deepEqual(
    source.relation(relationInput(source, admittedRequest, {
      ...projection,
      subject: { ...projection.subject, digest: digest("9") },
      replayBasis: coordinate("gap-basis:other", "a")
    })),
    {
      kind: "projection_relation_mismatch",
      issuePaths: [
        "candidateProjection.subject",
        "candidateProjection.replayBasis"
      ]
    }
  );
});

test("run gaps relates only the admitted run to its projection subject", () => {
  const source = RELATIONS.run_gaps;
  const subject = coordinate("run:one", "2");
  const admittedRequest = request("run_gaps", "Run", subject);
  const projection = runGapsProjection(
    subject,
    coordinate("run-replay-basis:one", "3")
  );
  assert.deepEqual(
    source.relation(relationInput(source, admittedRequest, projection)),
    { kind: "projection_related" }
  );
  assert.deepEqual(
    source.relation(relationInput(source, admittedRequest, {
      ...projection,
      subject: { ...projection.subject, digest: digest("4") }
    })),
    {
      kind: "projection_relation_mismatch",
      issuePaths: ["candidateProjection.subject"]
    }
  );
});

test("run gaps keeps the empty selector and invents no replay-basis relation", () => {
  const source = RELATIONS.run_gaps;
  const subject = coordinate("run:two", "5");
  const admittedRequest = request("run_gaps", "Run", subject);
  const projection = runGapsProjection(
    subject,
    coordinate("run-replay-basis:one", "6")
  );
  assert.deepEqual(
    source.relation(relationInput(source, admittedRequest, {
      ...projection,
      replayBasis: coordinate("run-replay-basis:other", "7")
    })),
    { kind: "projection_related" }
  );
});

test("release evidence relates source and release-snapshot selector with precise paths", () => {
  const source = RELATIONS.release_evidence;
  const subject = coordinate("release-cut:one", "b");
  const releaseSnapshotManifest = coordinate("release-snapshot:one", "c");
  const admittedRequest = request(
    "release_evidence",
    "ReleaseCut",
    subject,
    { releaseSnapshotManifest }
  );
  const projection = evidenceProjection(
    "ReleaseCut",
    subject,
    releaseSnapshotManifest,
    "release"
  );
  assert.deepEqual(
    source.relation(relationInput(source, admittedRequest, projection)),
    { kind: "projection_related" }
  );
  assert.deepEqual(
    source.relation(relationInput(source, admittedRequest, {
      ...projection,
      subject: { ...projection.subject, ref: "release-cut:other" },
      rows: [{ ...projection.rows[0], basis: coordinate("snapshot:other", "d") }]
    })),
    {
      kind: "projection_relation_mismatch",
      issuePaths: [
        "candidateProjection.subject",
        "candidateProjection.rows.0.basis"
      ]
    }
  );
});
