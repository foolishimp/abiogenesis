// Reference: T-031
// Lane: optional local reference comparison, not semantic closure.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  admitSdlcProjectConstraints,
  deriveSdlcSourceInput,
  deriveSdlcWorkspaceIngressReport,
  parseProjectSlugFromConstraintText
} from "../../build/semantic/code/src/index.js";
import { canonicalDataMapperFixtureRoot } from "../fixtures/data_mapper_fixture.mjs";

const fixtureRoot = canonicalDataMapperFixtureRoot();

function fixtureSnapshot(relativePath) {
  return {
    uri: `file://${fixtureRoot}/${relativePath}`,
    relativePath,
    content: readFileSync(`${fixtureRoot}/${relativePath}`, "utf8")
  };
}

test("T-031 data_mapper reference fixture derives requirement authority and lineage", () => {
  const constraintText = readFileSync(
    `${fixtureRoot}/.ai-workspace/context/project_constraints.yml`,
    "utf8"
  );
  const sourceInputs = [
    deriveSdlcSourceInput(fixtureSnapshot("README.md")),
    deriveSdlcSourceInput(fixtureSnapshot(".ai-workspace/context/project_constraints.yml")),
    deriveSdlcSourceInput(fixtureSnapshot("specification/INTENT.md")),
    deriveSdlcSourceInput(fixtureSnapshot("specification/REQUIREMENTS.md")),
    deriveSdlcSourceInput(fixtureSnapshot("specification/mapper_requirements.md")),
    deriveSdlcSourceInput(
      fixtureSnapshot("specification/appendices/APPENDIX_A_FROBENIUS_ALGEBRAS.md")
    )
  ];
  const constraints = admitSdlcProjectConstraints({
    projectSlug: parseProjectSlugFromConstraintText(constraintText),
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
    workspaceRootUri: `file://${fixtureRoot}`,
    projectConstraints: constraints,
    sourceInputs
  });

  assert.equal(report.kind, "sdlc_workspace_ingress_report");
  assert.equal(report.projectConstraints.activeTenant, "scala_spark");
  assert(report.importedRequirementAuthorities.length > 50);
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

  const projectLineage = report.lineage.find(
    (entry) => entry.elementId === `project:${report.projectConstraints.projectSlug}`
  );
  assert(projectLineage);
  assert(
    projectLineage.sourceInputUris.some((uri) =>
      uri.endsWith("specification/INTENT.md")
    )
  );

  const requirementLineage = report.lineage.find(
    (entry) => entry.elementId === "requirement:data_mapper.requirements.req_ldm_001"
  );
  assert(requirementLineage);
  assert(
    requirementLineage.sourceInputUris.some((uri) =>
      uri.endsWith("specification/REQUIREMENTS.md")
    )
  );
});
