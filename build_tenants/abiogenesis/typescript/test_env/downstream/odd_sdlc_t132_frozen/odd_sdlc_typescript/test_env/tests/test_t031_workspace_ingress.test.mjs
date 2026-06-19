// Validates: REQ-F-ODDSDLC-007
// Validates: REQ-F-ODDSDLC-012
// Validates: REQ-F-ODDSDLC-016
// Validates: REQ-F-ODDSDLC-022
// Validates: REQ-F-ODDSDLC-032
// Investigates: T-031
// Investigates: T-045

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitSdlcProjectConstraints,
  admitSdlcSourceInput,
  deriveSdlcSourceInput,
  deriveSdlcWorkspaceIngressReport,
  FG_INGRESS_PROJECT,
  parseProjectSlugFromConstraintText,
  sha256Digest
} from "../../build/semantic/code/src/index.js";

const PORTABLE_INTENT_TEXT = [
  "# Intent",
  "",
  "**Project**: data_mapper",
  "",
  "INT-001: Governed data mapping exists as a typed project."
].join("\n");

const PORTABLE_README_TEXT = [
  "# Data Mapper",
  "",
  "Bootstrap notes without formal authority markers."
].join("\n");

const PORTABLE_CONSTRAINT_TEXT = [
  "name: data_mapper",
  "active_tenant: scala_spark"
].join("\n");

const PORTABLE_REQUIREMENTS_TEXT = [
  "# Requirements",
  "",
  "REQ-LDM-001: The mapper preserves lineage.",
  "REQ-ENG-007: The implementation exposes runnable proof."
].join("\n");

function fixtureSnapshot(relativePath, content) {
  return {
    uri: `fixture://portable-t031/${relativePath}`,
    relativePath,
    content
  };
}

test("T-031 admits source inputs with digest, role, authority markers, and ambiguity", () => {
  const intent = deriveSdlcSourceInput(
    fixtureSnapshot("specification/INTENT.md", PORTABLE_INTENT_TEXT)
  );
  const readme = deriveSdlcSourceInput(fixtureSnapshot("README.md", PORTABLE_README_TEXT));
  const admitted = admitSdlcSourceInput(intent);

  assert.equal(admitted.detectedRole, "intent_surface");
  assert.match(admitted.digest, /^sha256:[a-f0-9]{64}$/);
  assert.equal(
    sha256Digest("abc"),
    "sha256:ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
  );
  assert(admitted.authorityMarkers.includes("INT-001"));
  assert(admitted.authorityMarkers.some((marker) => marker.startsWith("Project:")));
  assert.equal(admitted.ambiguity.kind, "none");
  assert.equal(readme.detectedRole, "project_readme");
  assert.equal(readme.ambiguity.kind, "ambiguous");
  assert.throws(
    () =>
      admitSdlcSourceInput({
        ...intent,
        kind: "not_sdlc_source_input"
      }),
    /kind/
  );
});

test("T-031 project constraints admission fails closed on stale or malformed shapes", () => {
  assert.throws(
    () =>
      admitSdlcProjectConstraints({
        projectSlug: "data_mapper",
        activeTenant: "",
        selectedOutputRoot: "build_tenants/scala_spark",
        ambiguityRiskAppetite: "low",
        capabilityContracts: []
      }),
    /activeTenant/
  );
  assert.throws(
    () =>
      admitSdlcProjectConstraints({
        projectSlug: "data_mapper",
        activeTenant: "scala_spark",
        selectedOutputRoot: ".abiogenesis/build_tenants/scala_spark",
        ambiguityRiskAppetite: "low",
        capabilityContracts: []
      }),
    /selectedOutputRoot/
  );
});

test("T-031 portable fixture derives imported requirement authority and lineage", () => {
  const sourceInputs = [
    deriveSdlcSourceInput(fixtureSnapshot("README.md", PORTABLE_README_TEXT)),
    deriveSdlcSourceInput(
      fixtureSnapshot(".ai-workspace/context/project_constraints.yml", PORTABLE_CONSTRAINT_TEXT)
    ),
    deriveSdlcSourceInput(fixtureSnapshot("specification/INTENT.md", PORTABLE_INTENT_TEXT)),
    deriveSdlcSourceInput(
      fixtureSnapshot("specification/REQUIREMENTS.md", PORTABLE_REQUIREMENTS_TEXT)
    )
  ];
  const constraints = admitSdlcProjectConstraints({
    projectSlug: parseProjectSlugFromConstraintText(PORTABLE_CONSTRAINT_TEXT),
    activeTenant: "scala_spark",
    selectedOutputRoot: "build_tenants/scala_spark",
    ambiguityRiskAppetite: "low",
    capabilityContracts: [
      "spark_session",
      "dataframe_reads",
      "cli_runner_class"
    ]
  });
  const report = deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: "fixture://portable-t031",
    projectConstraints: constraints,
    sourceInputs
  });

  assert.equal(report.kind, "sdlc_workspace_ingress_report");
  assert.equal(report.governingGraphFunction, FG_INGRESS_PROJECT);
  assert.equal(report.ingressSourceSet.kind, "ingress_source_set");
  assert.equal(report.ingressSourceSet.structureGrade, "structured");
  assert.equal(report.projectIngressContract.graphFunctionName, FG_INGRESS_PROJECT);
  assert.equal(
    report.projectIngressContract.topologyPolicyRef,
    "policy://odd_sdlc/spec_method_project_topology"
  );
  assert.equal(report.projectConstraints.activeTenant, "scala_spark");
  assert.equal(report.importedRequirementAuthorities.length, 2);
  assert(report.ambiguityRegister.some((entry) => entry.includes("README.md")));
  assert(report.bootstrapGapSet.includes("bootstrap_ambiguity_present"));
  assert(
    report.importedRequirementAuthorities.some(
      (authority) => authority.requirementId === "REQ-LDM-001"
    )
  );
  assert(
    report.importedRequirementAuthorities.some(
      (authority) => authority.requirementId === "REQ-ENG-007"
    )
  );
  assert(
    report.requirementTransformAuthorities.some(
      (authority) =>
        authority.requirementId === "REQ-LDM-001" &&
        authority.kind === "sdlc_requirement_transform_authority" &&
        authority.status === "current" &&
        authority.requirementAuthorityRef ===
          "data_mapper.requirements.req_ldm_001" &&
        authority.transformRef.includes(
          encodeURIComponent(authority.requirementAuthorityRef)
        )
    )
  );

  const projectLineage = report.lineage.find(
    (entry) => entry.elementId === "project:data_mapper"
  );
  assert(projectLineage);
  assert(
    projectLineage.sourceInputUris.some((uri) =>
      uri.endsWith("specification/INTENT.md")
    )
  );

  const requirementLineage = report.lineage.find(
    (entry) =>
      entry.elementId === "requirement:data_mapper.requirements.req_ldm_001"
  );
  assert(requirementLineage);
  assert(
    requirementLineage.sourceInputUris.some((uri) =>
      uri.endsWith("specification/REQUIREMENTS.md")
    )
  );
});

test("T-144 imports local requirement headings as replay-visible authority", () => {
  const localRequirementText = [
    "# Requirements",
    "",
    "## R-01: Single Build Tenant",
    "",
    "The product has one build tenant under build_tenants/javascript.",
    "",
    "## R-02: Executable Hello World",
    "",
    "The product prints Hello, world! when invoked."
  ].join("\n");
  const sourceInputs = [
    deriveSdlcSourceInput(
      fixtureSnapshot("specification/requirements/01-local.md", localRequirementText)
    )
  ];
  const constraints = admitSdlcProjectConstraints({
    projectSlug: "local_requirements",
    activeTenant: "javascript",
    selectedOutputRoot: "build_tenants/javascript",
    ambiguityRiskAppetite: "medium",
    capabilityContracts: ["local_requirement_lineage"]
  });
  const source = sourceInputs[0];
  assert(source);
  assert.equal(source.detectedRole, "requirement_surface");
  assert.equal(source.ambiguity.kind, "none");
  assert(
    source.authorityMarkers.some((marker) =>
      marker.startsWith("requirement-local://odd-sdlc/R-001/")
    )
  );

  const report = deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: "fixture://portable-t144-local-requirements",
    projectConstraints: constraints,
    sourceInputs
  });

  assert.deepEqual(
    report.importedRequirementAuthorities.map((authority) => authority.requirementId),
    ["R-001", "R-002"]
  );
  assert.deepEqual(report.bootstrapGapSet, []);
  const localTransform = report.requirementTransformAuthorities.find(
    (authority) =>
      authority.requirementId === "R-001" &&
      authority.requirementDisplayId === "R-001"
  );
  assert(localTransform);
  assert.notEqual(localTransform.requirementAuthorityRef, "R-001");
  assert(
    localTransform.transformRef.includes(
      encodeURIComponent(localTransform.requirementAuthorityRef)
    )
  );
  assert(
    report.lineage.some(
      (entry) =>
        entry.requirementDisplayId === "R-002" &&
        entry.elementId === `requirement:${entry.requirementAuthorityRef}`
    )
  );
});
