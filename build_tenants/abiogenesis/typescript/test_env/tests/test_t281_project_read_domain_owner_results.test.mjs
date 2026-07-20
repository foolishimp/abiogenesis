import assert from "node:assert/strict";
import test from "node:test";

import * as v from "valibot";

import { CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES } from "../../build/semantic/code/src/abg/m03/contracts/catalog_operation_contracts.js";
import { GAPS_PROJECT_READ_NATIVE_CONTRACT_SOURCES } from "../../build/semantic/code/src/app/m04/gaps/operation_contracts.js";
import { PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES } from "../../build/semantic/code/src/app/m04/product_intake/operation_contracts.js";
import { RESULT_ASSESSMENT_NATIVE_CONTRACT_SOURCES } from "../../build/semantic/code/src/app/m04/result_assessment/operation_contracts.js";
import { WORKSPACE_NATIVE_CONTRACT_SOURCES } from "../../build/semantic/code/src/app/m04/workspace/operation_contracts.js";
import { RELEASE_OPERATION_NATIVE_CONTRACT_SOURCES } from "../../build/semantic/code/src/qualification/m05/exact_candidate_release_operation_contracts.js";
import {
  deriveCanonicalNativeSchemaProjection,
  resolveSemanticBuildNativeSchemaSource
} from "../../build/semantic/code/src/shared/validation/canonical_native_schema_projector.js";

const digest = (character) => `sha256:${character.repeat(64)}`;
const coordinate = (ref, character) => ({ ref, digest: digest(character) });

const SOURCES = Object.freeze({
  catalog_list:
    CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES.project_read.catalog_list.result,
  catalog_describe:
    CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES.project_read.catalog_describe.result,
  workspace_status:
    WORKSPACE_NATIVE_CONTRACT_SOURCES.project_read.workspace_status.result,
  assessment_evidence:
    RESULT_ASSESSMENT_NATIVE_CONTRACT_SOURCES.project_read.assessment_evidence
      .result,
  install_evidence:
    PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES.project_read.install_evidence.result,
  release_evidence:
    RELEASE_OPERATION_NATIVE_CONTRACT_SOURCES.project_read.release_evidence
      .result,
  workspace_gaps:
    GAPS_PROJECT_READ_NATIVE_CONTRACT_SOURCES.project_read.workspace_gaps.result,
  run_gaps:
    GAPS_PROJECT_READ_NATIVE_CONTRACT_SOURCES.project_read.run_gaps.result
});
const EXPECTED_OWNER_BASIS = Object.freeze({
  catalog_list: [
    "specification/requirements/product/REQ-P-CATALOG.md#REQ-P-CATALOG-019..022",
    "sha256:af273d059574c4e8e19a9599005956683372db88ba0d8e57d5c5b14a58ff3c84"
  ],
  catalog_describe: [
    "specification/requirements/product/REQ-P-CATALOG.md#REQ-P-CATALOG-019..022",
    "sha256:af273d059574c4e8e19a9599005956683372db88ba0d8e57d5c5b14a58ff3c84"
  ],
  workspace_status: [
    "specification/requirements/abg/REQ-R-ABG3-PROJECTION.md#REQ-R-ABG3-PROJECTION-023",
    "sha256:ea67216190dc59dd14eac9797ab544ee79d9798673a82925d2d8bcddb2a2dfb5"
  ],
  assessment_evidence: [
    "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-055",
    "sha256:89cf57e14f74cd4ea433c277f88d89a5972e49b421801878d44b7481801c022f"
  ],
  install_evidence: [
    "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-055",
    "sha256:89cf57e14f74cd4ea433c277f88d89a5972e49b421801878d44b7481801c022f"
  ],
  release_evidence: [
    "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-055",
    "sha256:89cf57e14f74cd4ea433c277f88d89a5972e49b421801878d44b7481801c022f"
  ],
  workspace_gaps: [
    "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-029",
    "sha256:89cf57e14f74cd4ea433c277f88d89a5972e49b421801878d44b7481801c022f"
  ],
  run_gaps: [
    "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-029",
    "sha256:89cf57e14f74cd4ea433c277f88d89a5972e49b421801878d44b7481801c022f"
  ]
});

function accepts(schema, input) {
  return v.safeParse(schema, input).success;
}

function catalogListProjection() {
  return {
    kind: "catalog_list_projection",
    projection: coordinate("projection:catalog-list", "1"),
    catalog: coordinate("catalog:workspace", "2"),
    workspaceBinding: coordinate("binding:workspace", "3"),
    visibilityBasis: "workspace_catalog",
    rows: [
      {
        canonicalHandle: "graph-function:consensus",
        entryKind: "graph_function",
        owningProduct: coordinate("product:abiogenesis", "4"),
        owningProductVersion: "5.0.0",
        readiness: "ready",
        readinessBlockers: [],
        eligibility: "eligible",
        callability: "callable",
        visibility: "visible",
        compatibility: "compatible",
        provenanceRefs: ["event:catalog-admitted"]
      }
    ],
    provenanceRefs: ["event:catalog-projected"]
  };
}

function catalogDescriptionProjection() {
  return {
    kind: "catalog_description_projection",
    projection: coordinate("projection:catalog-description", "5"),
    catalog: coordinate("catalog:workspace", "2"),
    workspaceBinding: coordinate("binding:workspace", "3"),
    visibilityBasis: "workspace_catalog",
    canonicalHandle: "graph-function:consensus",
    entryKind: "graph_function",
    owningProduct: coordinate("product:abiogenesis", "4"),
    owningProductVersion: "5.0.0",
    owningArtifact: coordinate("artifact:abiogenesis", "6"),
    declaration: {
      kind: "contract",
      contract: coordinate("contract:consensus", "7")
    },
    dependencies: [
      {
        ...coordinate("product:odd-glc", "8"),
        disposition: "resolved"
      }
    ],
    readinessBlockers: [],
    readiness: "ready",
    eligibility: "eligible",
    callability: "callable",
    visibility: "visible",
    compatibility: "compatible",
    provenanceRefs: ["event:catalog-admitted"]
  };
}

function workspaceStatusProjection() {
  return {
    kind: "workspace_status_projection",
    projection: coordinate("projection:workspace-status", "9"),
    workspace: coordinate("workspace:current", "a"),
    workspaceAuthority: coordinate("authority:workspace", "b"),
    binding: coordinate("binding:workspace", "3"),
    authorityMode: "imported",
    readiness: "ready",
    boundProductRefs: ["product:abiogenesis"],
    artifactAvailability: [],
    configurations: [coordinate("configuration:primary", "c")],
    catalog: coordinate("catalog:workspace", "2"),
    residualRefs: [],
    provenanceRefs: ["event:workspace-bound"]
  };
}

function evidenceProjection(subjectKind, suffix) {
  const subject = coordinate(`subject:${suffix}`, "d");
  return {
    kind: "evidence_projection",
    projection: coordinate(`projection:${suffix}-evidence`, "e"),
    subject: { kind: subjectKind, ...subject },
    rows: [
      {
        evidence: coordinate(`evidence:${suffix}`, "f"),
        evidenceContract: coordinate("contract:evidence", "0"),
        admittedValue: { disposition: "verified" },
        subject: { kind: subjectKind, ...subject },
        material: {
          kind: "content",
          content: coordinate(`content:${suffix}`, "1")
        },
        producer: coordinate("producer:abg", "2"),
        basis: coordinate(`basis:${suffix}`, "3"),
        provenanceRefs: ["event:evidence-admitted"],
        replay: coordinate(`replay:${suffix}`, "4")
      }
    ]
  };
}

function gapProjection(subjectKind, suffix) {
  return {
    kind: "gap_projection",
    projection: coordinate(`projection:${suffix}-gaps`, "5"),
    subject: {
      kind: subjectKind,
      ...coordinate(`subject:${suffix}`, "6")
    },
    replayBasis: coordinate(`replay-basis:${suffix}`, "7"),
    rows: [
      {
        gap: coordinate(`gap:${suffix}`, "8"),
        disposition: "gap",
        implicatedAsset: { kind: "absent" },
        graphFunction: { kind: "absent" },
        reasons: ["required result is absent"],
        requiredCapabilityRefs: [],
        interaction: { kind: "absent" },
        evidenceRefs: ["evidence:gap"],
        replay: coordinate(`replay:${suffix}`, "9")
      }
    ]
  };
}

test("eight domain-owner result sources retain exact project.read identity and locator", () => {
  for (const [caseKey, source] of Object.entries(SOURCES)) {
    assert.deepEqual(source.authority.subject, {
      operationId: "abg.operation.project.read",
      memberKind: "project_read_case",
      caseKey,
      slot: "result"
    });
    assert.deepEqual(source.sourceLocator.memberPath.slice(-4), [
      "project_read",
      caseKey,
      "result",
      "schema"
    ]);
    assert.deepEqual(source.authority.semanticOwnerBasis, {
      ref: EXPECTED_OWNER_BASIS[caseKey][0],
      digest: EXPECTED_OWNER_BASIS[caseKey][1]
    });
    assert.equal(source.namedChecks.kind, "family_registry");
  }
});

test("all eight sources resolve with their same-module relation registries", async () => {
  for (const source of Object.values(SOURCES)) {
    const resolved = await resolveSemanticBuildNativeSchemaSource(source);
    const projection = deriveCanonicalNativeSchemaProjection({
      source: resolved,
      schemaRef: source.identity.schemaId,
      schemaVersion: source.identity.schemaVersion
    });
    assert.deepEqual(
      projection.witness.namedCheckSource,
      source.namedChecks
    );
    assert.equal(projection.witness.namedChecks.length > 0, true);
  }
});

test("catalog list and description admit their exact positive projections", () => {
  assert.equal(
    accepts(SOURCES.catalog_list.schema, catalogListProjection()),
    true
  );
  assert.equal(
    accepts(SOURCES.catalog_describe.schema, catalogDescriptionProjection()),
    true
  );
});

test("catalog relation rejects duplicate canonical handles", () => {
  const projection = catalogListProjection();
  assert.equal(
    accepts(SOURCES.catalog_list.schema, {
      ...projection,
      rows: [projection.rows[0], projection.rows[0]]
    }),
    false
  );
});

test("workspace status admits ready truth and rejects residual contradiction", () => {
  const projection = workspaceStatusProjection();
  assert.equal(accepts(SOURCES.workspace_status.schema, projection), true);
  assert.equal(
    accepts(SOURCES.workspace_status.schema, {
      ...projection,
      residualRefs: ["residual:contradiction"]
    }),
    false
  );
});

test("three owner-local Evidence applications preserve the closed family", () => {
  const fixtures = [
    [SOURCES.assessment_evidence, "ResultAssessment", "assessment"],
    [SOURCES.install_evidence, "InstalledProduct", "install"],
    [SOURCES.release_evidence, "ReleaseCut", "release"]
  ];
  for (const [source, subjectKind, suffix] of fixtures) {
    assert.equal(
      accepts(source.schema, evidenceProjection(subjectKind, suffix)),
      true
    );
  }
});

test("Evidence relation rejects a row for another subject", () => {
  const projection = evidenceProjection("ResultAssessment", "assessment");
  assert.equal(
    accepts(SOURCES.assessment_evidence.schema, {
      ...projection,
      rows: [
        {
          ...projection.rows[0],
          subject: {
            ...projection.rows[0].subject,
            ref: "subject:other-assessment"
          }
        }
      ]
    }),
    false
  );
});

test("workspace and run Gap applications admit their exact positive projections", () => {
  assert.equal(
    accepts(
      SOURCES.workspace_gaps.schema,
      gapProjection("WorkspaceBinding", "workspace")
    ),
    true
  );
  assert.equal(
    accepts(SOURCES.run_gaps.schema, gapProjection("Run", "run")),
    true
  );
  assert.equal(
    accepts(SOURCES.run_gaps.schema, {
      ...gapProjection("Run", "run"),
      rows: []
    }),
    true
  );
});

test("Gap relation rejects pending-human truth without an interaction", () => {
  const projection = gapProjection("Run", "run");
  assert.equal(
    accepts(SOURCES.run_gaps.schema, {
      ...projection,
      rows: [
        {
          ...projection.rows[0],
          disposition: "pending_human_interaction"
        }
      ]
    }),
    false
  );
});
