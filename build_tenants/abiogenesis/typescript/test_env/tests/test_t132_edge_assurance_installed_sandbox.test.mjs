// Validates: T-132
// Validates: T-130
// Validates: T-131
// Validates: REQ-L-GTL3-GRAPHVECTOR
// Validates: REQ-L-GTL3-HOOKS
// Validates: REQ-L-GTL3-EVALUATOR
// Validates: REQ-R-ABG3-ASSURANCE
// Validates: REQ-R-ABG3-PAYLOAD
// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS

import test from "node:test";
import assert from "node:assert/strict";

import {
  installPackedTenantPackage,
  provisionInstalledRoot,
  runInstalledNodeScript
} from "./support/m05-installed-fixtures.mjs";
import { installedT132EdgeAssuranceThreeChainSource } from "./support/t132-edge-assurance-fixtures.mjs";

test("T-132 installed deterministic sandbox: ABG installer carries a three-edge edge-assurance chain through runner and replay", async () => {
  const { targetRoot } = await provisionInstalledRoot();
  await installPackedTenantPackage(targetRoot);

  const run = await runInstalledNodeScript(
    targetRoot,
    installedT132EdgeAssuranceThreeChainSource({ mode: "deterministic" })
  );

  assert.equal(run.status, 0, run.stderr);
  const payload = JSON.parse(run.stdout);

  assert.equal(payload.mode, "deterministic");
  assert.equal(payload.installedPackageSurface, true);
  assert.equal(
    payload.target,
    "graph_function:synthesize_requirements_from_source;formalize_requirements_as_logic;encode_design_in_disambiguated_syntax"
  );
  assert.equal(payload.stageCount, 3);
  assert.deepStrictEqual(payload.materializedVectorNames, [
    "source_information->synthesized_requirements",
    "synthesized_requirements->formal_logical_requirements",
    "formal_logical_requirements->disambiguated_design_syntax"
  ]);
  assert.deepStrictEqual(payload.semanticChain.map((row) => row.transform), [
    "synthesize relevant information into requirements",
    "transform requirements into formal logical syntax",
    "encode design into disambiguated syntax"
  ]);
  assert.deepStrictEqual(payload.pluginResolutionKinds, [
    "edge_assurance_contract_selection",
    "edge_assurance_contract_selection",
    "edge_assurance_contract_selection"
  ]);
  assert.deepStrictEqual(payload.pluginResolutionSources, [
    "graph_vector_declarations",
    "graph_vector_declarations",
    "graph_vector_declarations"
  ]);
  assert.deepStrictEqual(payload.closureDecisions, ["close", "close", "close"]);
  assert.deepStrictEqual(payload.nextActionVariantDecisions, {
    retry: "retry",
    qualifiedDefer: "qualified_defer"
  });
  assert.deepStrictEqual(payload.nextActionVariantBasisRefs.retry, [
    "continuation://t132/source_to_requirements",
    "residual://t132/source_to_requirements",
    "authority://t132/source-information"
  ]);
  assert.deepStrictEqual(payload.nextActionVariantBasisRefs.qualifiedDefer, [
    "continuation://t132/requirements_to_logic",
    "residual://t132/requirements_to_logic",
    "composition://t132/requirements-to-logic"
  ]);
  assert.deepStrictEqual(payload.reconstructed, [true, true, true]);
  assert.deepStrictEqual(payload.compound.contributions, [
    "composition://t132/source-to-requirements",
    "composition://t132/requirements-to-logic",
    "composition://t132/logic-to-design-encoding"
  ]);
  assert.equal(payload.compound.close, true);
  assert.equal(payload.prematureCompoundCloseRejected, true);
  assert.equal(payload.missingIntermediateRejected, true);
  assert.deepStrictEqual(payload.finalClosedVectorIndexes, [0, 1, 2]);
  assert.equal(payload.readModels.length, 3);
  assert.ok(
    payload.readModels.every(
      (readModel) => readModel.assuranceClosureDecision === "close"
    )
  );
  assert.ok(
    payload.ledgerPayloadRefsByStage.every(
      (refs) =>
        refs.includes("payload://t132/source_to_requirements/evidence/eval") ||
        refs.includes("payload://t132/requirements_to_logic/evidence/eval") ||
        refs.includes("payload://t132/logic_to_design_encoding/evidence/eval")
    )
  );
  assert.deepStrictEqual(payload.designSyntaxFacts, [
    {
      edge: "formal_logical_requirements->disambiguated_design_syntax",
      kind: "gtl_disambiguated_design_syntax",
      schemaVersion: "t132.design_syntax.v1",
      syntaxRef: "syntax://t132/disambiguated-design",
      fdValidationRef:
        "fd://t132/logic_to_design_encoding/design-syntax-schema",
      schemaRef: "schema://t132/logic_to_design_encoding/design-syntax-v1",
      graphVectorRef: "graph-t132-logic_to_design_encoding",
      unresolvedRefCount: 0,
      commitmentCount: 1,
      closeFunctionRef: "close://t132/design-syntax/fd-schema-and-fp-assurance"
    }
  ]);
  assert.deepStrictEqual(payload.negativeChecks, [
    "returned finding without recorded hook action fails closed",
    "unrecorded admission fails closed",
    "rejected finding cannot feed projection",
    "unadmitted evidence cannot feed projection",
    "side-door closure authority fields fail closed",
    "lineage drift between selection and finding fails closed",
    "premature compound close rejected",
    "missing intermediate edge contribution rejected"
  ]);
  assert.ok(payload.eventKinds.includes("fp_dispatch_requested"));
  assert.ok(payload.eventKinds.includes("payload_observed"));
  assert.ok(payload.eventKinds.includes("evidence_admitted"));
});
