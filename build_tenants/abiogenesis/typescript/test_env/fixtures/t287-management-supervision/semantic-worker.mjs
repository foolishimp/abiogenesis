#!/usr/bin/env node
// Disclosed mechanical first-stage author/assessor. No model or tools.
const mode = process.env.T287_SUPERVISION_MODE;
let prompt = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", chunk => { prompt += chunk; });
process.stdin.on("end", () => {
  if (mode === "hard_cap") { setInterval(() => {}, 1000); return; }
  const emit = value => console.log(JSON.stringify(value));
  emit({ type: "system", subtype: "init", model: "disclosed-supervision-double" });
  const schema = JSON.parse(process.argv[process.argv.indexOf("--json-schema") + 1]);
  const sections = {};
  for (const part of prompt.split(/^## /m).slice(1)) {
    const cut = part.indexOf("\n"); sections[part.slice(0, cut)] = JSON.parse(part.slice(cut + 1).trim());
  }
  const quote = { memberRef: sections.source[0].memberRef, quote: sections.source[0].text };
  const active = sections.obligations.activeBindings;
  const raw = schema.properties.criteria ? {
    kind: "semantic_stage_assessment_candidate", schemaVersion: "5.0.0",
    criteria: sections.task.rubric.map(criterion => ({ criterionRef: criterion.criterionRef,
      disposition: "falsified", explanation: "Disclosed block discriminator, not semantic qualification.",
      sourceQuotes: [quote], statementRefs: sections.predecessors.at(-1).candidate.asset.statements.map(row => row.statementRef) })), pressure: [],
  } : {
    kind: "semantic_job_asset_candidate", schemaVersion: "5.0.0",
    asset: { kind: "semantic_stage_asset_candidate", schemaVersion: "5.0.0",
      statements: [{ statementRef: sections.task.stageRef + "/mechanical", text: quote.quote, modality: "supporting",
        sourceQuotes: [quote], requirementRefs: active.map(row => row.binding.requirementRef),
        obligationRefs: active.map(row => row.binding.obligationRef), predecessorStatementRefs: [] }],
      requirementCandidates: [], worksiteDesign: null, pressure: [] }, bindings: [], design: null,
  };
  // Deliberately exceeds the test lease, with no claim about unobserved work.
  setTimeout(() => emit({ type: "result", subtype: "success", result: JSON.stringify(raw) }), 350);
});
