// Validates: T-148

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitSdlcProjectConstraints,
  deriveSdlcEdgeFulfillmentCountsFromAssessments,
  deriveSdlcLineageLedger,
  deriveSdlcSourceInput,
  deriveSdlcWorkspaceIngressReport,
  projectSdlcRequirementClosureRegister,
  projectSdlcRequirementFulfillmentPublicView
} from "../../build/semantic/code/src/index.js";

function sourceInput(relativePath, content) {
  return deriveSdlcSourceInput({
    uri: `fixture://t148/${relativePath}`,
    relativePath,
    content
  });
}

function duplicateLocalIngress() {
  return deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: "fixture://t148",
    projectConstraints: admitSdlcProjectConstraints({
      projectSlug: "t148_collision_safe_requirements",
      activeTenant: "typescript",
      selectedOutputRoot: "build_tenants/typescript",
      ambiguityRiskAppetite: "medium",
      capabilityContracts: ["local_requirement_authority_refs"]
    }),
    sourceInputs: [
      sourceInput(
        "specification/requirements/01-product.md",
        [
          "# Product Requirements",
          "",
          "## R-01: Product behavior",
          "",
          "The product behavior must remain visible as transformation pressure."
        ].join("\n")
      ),
      sourceInput(
        "specification/requirements/02-runtime.md",
        [
          "# Runtime Requirements",
          "",
          "## R-01: Runtime evidence",
          "",
          "Runtime evidence must remain visible as transformation pressure."
        ].join("\n")
      )
    ]
  });
}

function downstreamPressureRef(obligationRef) {
  return [
    "obligation://odd-sdlc",
    encodeURIComponent(obligationRef),
    "downstream_transformation_set"
  ].join("/");
}

test("T-148 duplicate local display IDs retain distinct authority refs through closure and downstream pressure", () => {
  const ingress = duplicateLocalIngress();
  assert.equal(ingress.importedRequirementAuthorities.length, 2);
  assert.deepEqual(
    ingress.importedRequirementAuthorities.map((authority) => authority.requirementId),
    ["R-001", "R-001"]
  );

  const authorityRefs = ingress.importedRequirementAuthorities.map(
    (authority) => authority.requirementAuthorityRef
  );
  assert.equal(new Set(authorityRefs).size, 2);
  assert(
    authorityRefs.every((ref) =>
      /^t148_collision_safe_requirements\.stage_0[12]_[a-z]+\.r_001$/u.test(ref)
    )
  );
  assert(authorityRefs.every((ref) => ref !== "R-001"));
  for (const authority of ingress.importedRequirementAuthorities) {
    assert.equal(authority.requirementDisplayId, "R-001");
    assert(authority.authorityDerivationRefs.includes(authority.sourceUri));
    assert(
      authority.authorityDerivationRefs.some((ref) =>
        ref.startsWith("source-digest://odd-sdlc/")
      )
    );
    assert(
      ingress.lineage.some(
        (entry) =>
          entry.elementId === `requirement:${authority.requirementAuthorityRef}` &&
          entry.requirementDisplayId === "R-001"
      )
    );
    assert(
      ingress.requirementTransformAuthorities.some(
        (transformAuthority) =>
          transformAuthority.requirementAuthorityRef ===
            authority.requirementAuthorityRef &&
          transformAuthority.transformRef.includes(
            encodeURIComponent(authority.requirementAuthorityRef)
          )
      )
    );
  }

  const lineageLedger = deriveSdlcLineageLedger({
    ingressReport: ingress,
    workReports: [],
    proofClaims: []
  });
  const closureRegister = projectSdlcRequirementClosureRegister({
    ingressReport: ingress,
    lineageLedger
  });
  assert.equal(closureRegister.entries.length, 2);
  assert.deepEqual(
    closureRegister.entries.map((entry) => entry.requirementDisplayId),
    ["R-001", "R-001"]
  );
  assert.deepEqual(
    new Set(
      closureRegister.entries.map((entry) => entry.requirementAuthorityRef)
    ),
    new Set(authorityRefs)
  );
  assert.equal(
    new Set(closureRegister.unresolvedRequirementAuthorityRefs).size,
    2
  );

  const publicView = projectSdlcRequirementFulfillmentPublicView({
    closureRegister
  });
  assert.equal(publicView.rows.length, 2);
  assert.equal(new Set(publicView.rows.map((row) => row.obligationRef)).size, 2);
  assert(
    publicView.rows.every(
      (row) =>
        row.requirementDisplayId === "R-001" &&
        row.requirementAuthorityRef !== row.requirementDisplayId &&
        row.obligationRef === `requirement:${row.requirementAuthorityRef}` &&
        row.authorityDerivationRefs.length >= 2
    )
  );

  const downstreamCounts = deriveSdlcEdgeFulfillmentCountsFromAssessments({
    declaredObligationIds: publicView.rows.map((row) => row.obligationRef),
    assessments: publicView.rows.map((row) => ({
      obligationId: row.obligationRef,
      fulfillmentStatus: "partial",
      carryDirection: "downstream_transformation_set",
      evidenceRefs: row.authorityDerivationRefs,
      downstreamGraphFunctionRefs: [
        "graph-function://odd-sdlc/materialize_declared_product_asset"
      ],
      targetBindingRefs: [
        `target-binding://odd-sdlc/${encodeURIComponent(row.requirementAuthorityRef)}`
      ]
    }))
  });

  assert.deepEqual(downstreamCounts.edgeLocalObligationIds, []);
  assert.equal(downstreamCounts.downstreamTransformationSetRefs.length, 2);
  for (const row of publicView.rows) {
    assert(
      downstreamCounts.downstreamPressureRefs.includes(
        downstreamPressureRef(row.obligationRef)
      )
    );
    assert(
      downstreamCounts.downstreamTargetBindingRefs.includes(
        `target-binding://odd-sdlc/${encodeURIComponent(row.requirementAuthorityRef)}`
      )
    );
  }
});
