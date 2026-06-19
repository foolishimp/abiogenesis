// Validates: T-155

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitSdlcConstructorResult,
  admitSdlcProjectConstraints,
  admitSdlcRequirementProofClaim,
  deriveSdlcLineageLedger,
  deriveSdlcSourceInput,
  deriveSdlcWorkspaceIngressReport,
  hookContractByEdgeName,
  minimalSdlcHookInvocationForContract,
  projectSdlcRequirementClosureRegister,
  runSdlcHookTurn
} from "../../build/semantic/code/src/index.js";

function sourceInput(relativePath, content) {
  return deriveSdlcSourceInput({
    uri: `fixture://t155/${relativePath}`,
    relativePath,
    content
  });
}

function constraints(projectSlug = "t155") {
  return admitSdlcProjectConstraints({
    projectSlug,
    activeTenant: "typescript",
    selectedOutputRoot: "build_tenants/typescript",
    ambiguityRiskAppetite: "medium",
    capabilityContracts: ["structural_requirement_authority_refs"]
  });
}

function ingress(sourceInputs, projectSlug = "t155") {
  return deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: "fixture://t155",
    projectConstraints: constraints(projectSlug),
    sourceInputs
  });
}

function codeWorkReport(assetId = "asset://t155/code") {
  const contract = hookContractByEdgeName("derive_code_surface");
  const invocation = minimalSdlcHookInvocationForContract({
    contract,
    targetAssetId: assetId,
    fpWorkerContractRef: "worker://t155/fp"
  });
  const constructorResult = admitSdlcConstructorResult({
    operationType: "generate",
    outputIdentity: {
      assetId,
      uri: "file:///workspace/src/t155.ts",
      declaredType: "code_surface",
      digest: "sha256:t155-code",
      byteCount: 512
    },
    evidenceRefs: [
      {
        ref: "file:///workspace/src/t155.ts",
        evidenceType: "materialized_asset",
        digest: "sha256:t155-code-evidence"
      }
    ],
    generatedAssetContract: {
      contractName: "generated-asset-contract",
      targetAssetId: assetId,
      satisfied: true,
      materialized: true,
      diagnostics: [],
      foreignRealizationCandidates: []
    },
    ambiguityCandidates: []
  });
  const turn = runSdlcHookTurn({ contract, invocation, constructorResult });
  assert.equal(turn.postflight?.status, "passed");
  assert(turn.workReport);
  return turn.workReport;
}

test("T-155 requirement authority refs are structural project-stage-requirement keys", () => {
  const report = ingress(
    [
      sourceInput(
        "specification/requirements/01-product.md",
        ["# Product", "", "## R-01: Product behavior"].join("\n")
      ),
      sourceInput(
        "specification/requirements/02-runtime.md",
        ["# Runtime", "", "## R-01: Runtime evidence"].join("\n")
      ),
      sourceInput(
        "specification/REQUIREMENTS.md",
        ["# Requirements", "", "REQ-API-001: API behavior is visible."].join("\n")
      )
    ],
    "catalog_app"
  );

  assert.deepEqual(
    report.importedRequirementAuthorities.map(
      (authority) => authority.requirementAuthorityRef
    ).sort(),
    [
      "catalog_app.requirements.req_api_001",
      "catalog_app.stage_01_product.r_001",
      "catalog_app.stage_02_runtime.r_001"
    ]
  );
  assert(
    report.importedRequirementAuthorities.every((authority) =>
      authority.authorityDerivationRefs.includes(
        `requirement-authority-scope://odd-sdlc/${encodeURIComponent(authority.requirementAuthorityRef)}`
      )
    )
  );
});

test("T-155 duplicate requirement keys inside one stage fail at ingress", () => {
  assert.throws(
    () =>
      ingress([
        sourceInput(
          "specification/requirements/01-product.md",
          [
            "# Product",
            "",
            "## R-01: Product behavior",
            "",
            "## R-01: Product behavior duplicate"
          ].join("\n")
        )
      ]),
    /duplicate requirementAuthorityRef/
  );
});

test("T-155 proof claims require authority refs and preserve unresolved diagnostics", () => {
  const report = ingress([
    sourceInput(
      "specification/REQUIREMENTS.md",
      ["# Requirements", "", "REQ-ONE-001: One requirement exists."].join("\n")
    )
  ]);

  assert.throws(
    () =>
      admitSdlcRequirementProofClaim({
        kind: "sdlc_requirement_proof_claim",
        requirementId: "REQ-ONE-001",
        assetId: "asset://t155/code",
        proofKind: "behavioral_test",
        authorityVerb: "validates",
        evidenceRefs: ["test://t155/missing-authority"]
      }),
    /requirementAuthorityRef/
  );

  const unresolvedAuthorityRef = "t155.requirements.req_missing_001";
  const claim = admitSdlcRequirementProofClaim({
    kind: "sdlc_requirement_proof_claim",
    requirementId: "REQ-MISSING-001",
    requirementAuthorityRef: unresolvedAuthorityRef,
    assetId: "asset://t155/code",
    proofKind: "behavioral_test",
    authorityVerb: "validates",
    evidenceRefs: ["test://t155/unresolved-authority"]
  });
  const ledger = deriveSdlcLineageLedger({
    ingressReport: report,
    workReports: [codeWorkReport()],
    proofClaims: [claim]
  });
  assert.deepEqual(
    ledger.entries[0]?.proofClaimDiagnostics.map((diagnostic) => diagnostic.code),
    ["unresolved_requirement_authority_ref"]
  );

  const closure = projectSdlcRequirementClosureRegister({
    ingressReport: report,
    lineageLedger: ledger
  });
  const unresolved = closure.entries.find(
    (entry) => entry.requirementAuthorityRef === unresolvedAuthorityRef
  );
  assert(unresolved);
  assert.equal(unresolved.fulfillmentStatus, "missing");
  assert(unresolved.openReasons.includes("proof_claim_requirement_authority_unresolved"));
  assert(closure.unresolvedRequirementAuthorityRefs.includes(unresolvedAuthorityRef));
});
