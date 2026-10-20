// Pure declaration data/factories. Installed ABG owns validation, assembly,
// traversal, effects, evidence and admission. This module performs no I/O.

export const D1_WITNESS_IDS = Object.freeze({
  packageName: "@odd-glc/d1-lifecycle-declaration-witness",
  packageVersion: "0.0.0-d1.1",
  productId: "product://odd-glc/d1-lifecycle-declaration-witness@0.0.0-d1.1",
  moduleRef: "module://odd-glc/generic-lifecycle-witness@5",
  programRef: "program://odd-glc/generic-lifecycle-witness@5",
  graphFunctionRef: "graph-function://odd-glc/generic-lifecycle-witness@5",
  graphRef: "graph://odd-glc/generic-lifecycle-witness@5",
  startRef: "start://odd-glc/generic-lifecycle-witness@5",
  closureContractRef: "contract://odd-glc/generic-lifecycle-witness/closure@5",
  descriptorRef: "descriptor://odd-glc/generic-lifecycle-witness@5",
  contributionManifestRef: "contribution-manifest://odd-glc/generic-lifecycle-witness@5",
  catalogRef: "catalog://odd-glc/generic-lifecycle-witness@5",
  provenanceRef: "provenance://odd-glc/generic-lifecycle-witness@5",
  sourceDeclarationRef: "declaration://odd-glc/generic-lifecycle/source@5",
  sourceGraphFunctionRef: "graph-function://odd-glc/generic-lifecycle/source@5",
  sourceModuleRef: "module://odd-glc/generic-lifecycle-source-setup@5",
  sourceProgramRef: "program://odd-glc/generic-lifecycle-source-setup@5",
  sourceClosureContractRef: "contract://odd-glc/generic-lifecycle/source/closure@5",
  lifecycleDeclarationRef: "declaration://odd-glc/generic-lifecycle/stages@5",
});

export const D1_FROZEN_INPUT_SHA256 = Object.freeze({
  source: "13137b2080d9c9c6d8af5f5880f92b46a8cbbd4afc4c66451812e9e92f023871",
  declarations: "dd7c04e1cee319f2be7c0bf9d7cf2a72f6a2fe89555847751e1bc7630a214bdd",
  oracle: "eda4749491429b5bd209b67140ab7e3b1357fb44132613709e4a3ffd56049080",
  retainedInput: "f367112206a7877f2d68347717b918e8c2876f72da5e1932e935df47d697c8ba",
});

export const D1_START_SELECTIONS = Object.freeze({
  sourceProgramRef: D1_WITNESS_IDS.sourceProgramRef,
  lifecycleProgramRef: D1_WITNESS_IDS.programRef,
  sourceSetup: { kind: "start", scope: "program", target: "next", until: "converged", rootMode: "direct" },
  lifecycle: { kind: "start", scope: "program", target: "next", until: "converged", rootMode: "direct" },
});

const stageRef = (name) => `stage://odd-glc/generic-lifecycle/${name}@5`;
const stageFunctionRef = (name) => `graph-function://odd-glc/generic-lifecycle/${name}@5`;
const sectionOrder = ["role", "source", "obligations", "predecessors", "worksite", "evidence", "task", "response"];
const exactlyOne = (rows, label) => {
  if (rows.length !== 1) throw new TypeError(`requires one exact ${label}`);
  return rows[0];
};
const commonRubric = [
  ["source-faithfulness", "Assess the result against every original source member and all admitted predecessors. Cite exact source quotations for material findings; identify lost or weakened meaning. A count or summary is insufficient."],
  ["modality-and-conflicts", "Check normative, supporting, speculative and conflicting meanings against their original source. Keep unresolved conflicts and owner rulings visible."],
  ["obligation-conservation", "Check selected and discovered requirements and paired realization/proof obligations remain represented with source and predecessor links. Preserve non-null contract, policy and shape coordinates and expose unassessed coverage."],
  ["bounded-claim", "Assess only this stage's meaning and sufficient evidence. Preserve unimplemented obligations; do not infer application fulfillment or full-source decomposition from stage completion."],
];

export function constructD1SourceDeclarations({ gtl, product, fixture, derived, ids = D1_WITNESS_IDS }) {
  const declaration = gtl.constructRequirementHandoffDeclaration({
    declarationRef: ids.sourceDeclarationRef,
    graphFunctionRef: ids.sourceGraphFunctionRef,
    sourceRoleRef: `role://d1/${fixture.declared_provenance.selection_role}`,
    context: structuredClone(derived.nativeContext),
    terms: structuredClone(derived.nativeRequirementTerms),
    fulfillmentBindings: structuredClone(derived.nativeFulfillmentBindings),
  });
  const input = product.constructRequirementHandoffInput({
    kind: "requirement_handoff_input", schemaVersion: "5.0.0",
    declarationRef: declaration.declarationRef,
    sourceRoleRef: declaration.sourceRoleRef,
    members: fixture.complete_source_inventory.members.map(({ source_ref, base64 }) => ({ memberRef: source_ref, base64 })),
  });
  return { declaration, input, roleContracts: structuredClone(derived.nativeOutputContractDeclarations) };
}

export function constructD1LifecycleDeclaration({ gtl, product, derived, scenario, oracle, ids: consumerIds = D1_WITNESS_IDS }) {
  const ids = gtl.SEMANTIC_STAGE_IDS;
  // Choices belong to these frozen GLC meanings, not to a native stage-name rule.
  const worksitePolicies = new Map([
    ["Intent", { assetRole: "IntentAsset", author: "not_required", assessor: "not_required" }],
    ["Product", { assetRole: "ProductDefinitionAsset", author: "not_required", assessor: "not_required" }],
    ["Requirements", { assetRole: "RequirementSetAsset", author: "not_required", assessor: "not_required" }],
    ["Design", { assetRole: "DestinationTopologyAsset", author: "current_inventory", assessor: "current_inventory" }],
  ]);
  const stageRows = derived.stageMeaning.map((meaning) => {
    const policy = worksitePolicies.get(meaning.stage);
    if (policy === undefined || policy.assetRole !== meaning.assetRole) {
      throw new TypeError(`worksite content policy is not declared for ${meaning.stage}/${meaning.assetRole}`);
    }
    return {
      name: meaning.stage.toLowerCase(), assetRole: meaning.assetRole,
      predecessors: meaning.predecessors.filter((name) => name !== "accepted_full_source_handoff").map((name) => name.toLowerCase()),
      requiredContent: meaning.requiredContent,
      bodyCapabilities: meaning.stage === "Requirements" ? ["requirement_refinement"]
        : meaning.stage === "Design" ? ["worksite_design"] : [],
      worksiteContentByRole: { author: policy.author, assessor: policy.assessor },
    };
  });
  stageRows.push({ name: "evidence", assetRole: "EvidenceBindingAsset",
    predecessors: stageRows.map((row) => row.name), bodyCapabilities: ["application_assessment"],
    // Protected C2 artifact bodies are evidence; old preconstruction bodies are not current.
    worksiteContentByRole: { author: "not_required", assessor: "not_required" },
    requiredContent: [
      "Interpret only admitted construction, verifier-artifact and C2 execution observations for the exact initial and derived retained subject.",
      "Compare observed application behavior with the separately bound evaluation oracle; identify unsupported or absent probes. No tools or invented observations may fill an evidence gap.",
      "Retain distinct realization, verifier artifact, verifier execution and semantic-assessment roles. State bounded supported claims and remaining mandatory obligations; full application coverage stays non-closing.",
    ],
  });
  return gtl.constructSemanticLifecycleDeclaration({
    declarationRef: consumerIds.lifecycleDeclarationRef,
    sourceDeclarationRef: consumerIds.sourceDeclarationRef,
    taskDataDigest: product.sha256Canonical(scenario),
    evaluationDataDigest: product.sha256Canonical(oracle),
    proofPolicies: derived.domainProofPolicies.map(({ unprovedBeyondD1, ...policy }) => ({
      ...structuredClone(policy), unprovedScope: structuredClone(unprovedBeyondD1),
    })),
    proofShapes: structuredClone(derived.domainProofShapes),
    stages: stageRows.map((row) => ({
      declarationRef: stageRef(row.name), graphFunctionRef: stageFunctionRef(row.name),
      authorLocusRef: `locus://odd-glc/generic-lifecycle/${row.name}/author@5`,
      assessorLocusRef: `locus://odd-glc/generic-lifecycle/${row.name}/assessor@5`,
      predecessorStageRefs: row.predecessors.map(stageRef),
      assetSurface: {
        kind: row.assetRole,
        requiredContexts: [derived.nativeContext.contextRef],
        standardsRefs: ["specification/requirements/REQ-GLC-LIFECYCLE-VOCABULARY-ASSETS.md", "specification/requirements/REQ-GLC-ABG-REQUIREMENTS-ALGEBRA-CONSUMPTION.md"],
        outputContractRefs: [ids.workerContractRef], constructorRef: ids.constructorRef,
        rendererRef: ids.rendererRef,
        proofObligationRefs: derived.nativeFulfillmentBindings.map((binding) => binding.obligationRef),
        authoritySlots: [{ authorityKindRef: "authority://odd-glc/owner-scope-ruling", disposition: "normal", fallbackPreconditionRefs: [] }],
      },
      purpose: `Derive and assess ${row.assetRole} from the complete source and admitted predecessors under the selected lifecycle meaning.`,
      requiredContent: structuredClone(row.requiredContent),
      rubric: [
        ...commonRubric,
        ...(row.name === "design" ? [["executable-probe-coverage", derived.designProbeCriterion ?? "Check the derived target and command plan executes all declared application probe requests through the retained supported application, including fresh-process queries and failure observations. A helper supplied with expected partitions is insufficient. Every target and write boundary needs its current native basis."]] : []),
        ...(row.name === "evidence" ? [["application-oracle", "Compare every separately bound evaluation case with actual admitted C2 observations, exact initial/derived subject and verifier artifacts. Explain unsupported, absent, wrong or stale evidence. The complete oracle is evaluation-only; no missing probe can be executed or invented in this assessment."]] : []),
      ].map(([name, instruction]) => ({ criterionRef: `criterion://odd-glc/generic-lifecycle/${row.name}/${name}@5`, instruction })),
      bodyCapabilities: row.bodyCapabilities,
      assembly: { ruleRef: `assembly://odd-glc/generic-lifecycle/${row.name}@5`,
        graphFunctionRef: stageFunctionRef(row.name), sectionOrder: [...sectionOrder],
        contentPolicy: "role_scoped_worksite", worksiteContentByRole: structuredClone(row.worksiteContentByRole),
        proportionalityPolicy: "declared_semantic_assessment",
        maxPromptBytes: 1048576 },
    })),
  });
}

export function constructD1InitialEnvelope({ product, admittedSourceHandoff, lifecycle, scenario, oracle, worksiteBasis }) {
  // The caller supplies the fresh native source-handoff result and observed
  // worksite basis. Native admission authenticates both; this does not create
  // a result, observation, authorization, semantic asset or coverage judgment.
  return product.constructSemanticStageEnvelope({
    sourceHandoff: admittedSourceHandoff,
    lifecycle,
    taskData: structuredClone(scenario),
    evaluationData: structuredClone(oracle),
    worksite: worksiteBasis,
  });
}

export function d1RetainedWorksiteInput({ retainedInput, workspaceAuthorityBasis, workspaceBinding,
  capabilityGrant, currentTargets, commands, outcomePredicates, allowedWriteTerritories }) {
  // Raw bytes and domain roles only. The current native setup supplies targets,
  // O0 and authority; prior archive observation refs never become current here.
  const targets = retainedInput.members.map((member) => ({
    target: exactlyOne(currentTargets.filter((target) => target.subject.relativePath === member.path), `current target ${member.path}`),
    base64: member.base64,
    role: member.path.includes("/src/test/") ? "verifier"
      : member.path.includes("/src/main/") ? "implementation" : "configuration",
  }));
  return { workspaceAuthorityBasis, workspaceBinding, capabilityGrant, targets,
    commands, outcomePredicates, allowedWriteTerritories };
}

// Existing native preparation relation, nested so retain_graph_input keeps its
// exact WorksiteCommandPreparationInput domain. No lifecycle retention adapter.
export function constructD1WorksiteGraph({ gtl, product, c1Publication, c2Publication }) {
  const p = product.WORKSITE_PREPARATION_IDS;
  const c1 = product.WORKSITE_CONSTRUCTION_IDS;
  const c2 = product.WORKSITE_COMMAND_EXECUTION_IDS;
  const graphFunctionRef = "graph-function://odd-glc/generic-lifecycle/worksite@5";
  const closureContractRef = "contract://odd-glc/generic-lifecycle/worksite/closure@5";
  const c1Graph = exactlyOne(c1Publication.graphFunctions.filter((row) => row.name === c1.graphFunctionRef), "C1 graph");
  const c2Graph = exactlyOne(c2Publication.graphFunctions.filter((row) => row.name === c2.graphFunctionRef), "C2 graph");
  const c2Close = exactlyOne(c2Publication.closureContracts.filter((row) => row.closureContractRef === c2.closureContractRef), "C2 closure");
  const closure = gtl.closureContract({ ...structuredClone(c2Close), closureContractRef, predicateRef: p.rootPredicateRef,
    closureScope: "graph_call", eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed"] });
  const nodeRef = (role) => `node://odd-glc/generic-lifecycle/worksite/${role}@5`;
  const pure = (role, bindingRef, predicate) => {
    const binding = exactlyOne(c2Publication.implementationBindings.filter((row) => row.bindingRef === bindingRef), `${role} binding`);
    return { nodeRef: nodeRef(role), nodeKind: "c_locus", term: gtl.C.of({
      input: gtl.cCarrier(binding.inputContractRef), output: gtl.cCarrier(binding.outputContractRef),
      programLocusRef: nodeRef(role), stageRole: role, fibre: "F_D",
      armId: `arm://odd-glc/generic-lifecycle/worksite/${role}@5`, compositionRef: null,
      vectorIndex: 0, judgmentPredicateRef: predicate, resultBearing: false,
      requirement: { kind: "executable_leaf_requirement", implementationBindingRef: binding.bindingRef,
        inputContractRef: binding.inputContractRef, outputContractRef: binding.outputContractRef,
        evidenceContractRef: c2.evidenceContractRef, failureContractRef: binding.failureContractRef,
        refusalContractRef: binding.refusalContractRef, judgmentContractRef: c2.judgmentContractRef },
    }) };
  };
  const call = (role, graph) => ({ nodeRef: nodeRef(role), nodeKind: "c_locus",
    term: gtl.workflow.C(gtl.cGraphFunctionRef({ graphFunctionRef: graph.name,
      input: gtl.cCarrier(graph.inputs[0]), output: gtl.cCarrier(graph.outputs[0]) })) });
  const provided = [c1.taskContractRef, c1.resultContractRef, p.boundInputContractRef, c2.taskContractRef, c2.observationContractRef];
  const graphFunction = {
    kind: "graph_function", name: graphFunctionRef, version: "5.0.0",
    environment: { requires: [p.inputContractRef], provides: provided, carries: [p.inputContractRef, ...provided] },
    inputs: [p.inputContractRef], outputs: [c2.observationContractRef],
    template: { kind: "inline_graph", graphRef: "graph://odd-glc/generic-lifecycle/worksite@5",
      startNodeRef: nodeRef("select"), terminalNodeRefs: [nodeRef("execute")],
      nodes: [pure("select", p.selectBindingRef, p.selectPredicateRef), call("construct", c1Graph),
        pure("prepare", p.prepareBindingRef, p.preparePredicateRef), call("execute", c2Graph)],
      edges: [gtl.graphEdge({ fromNodeRef: nodeRef("select"), toNodeRef: nodeRef("construct") }),
        gtl.graphEdge({ fromNodeRef: nodeRef("construct"), toNodeRef: nodeRef("prepare"), inputBinding: product.worksiteRetentionBinding() }),
        gtl.graphEdge({ fromNodeRef: nodeRef("prepare"), toNodeRef: nodeRef("execute") })], applications: [] },
    effects: [...new Set([...c1Graph.effects, ...c2Graph.effects])],
    declarations: { "abg.compute_regime": "mixed", "abg.closure_contract": closureContractRef,
      "abg.child_closure_contract": closureContractRef, "abg.failure_contract": c2.failureContractRef,
      "abg.evidence_contract": c2.evidenceContractRef, "abg.judgment_contract": c2.judgmentContractRef,
      "abg.judgment_predicate": p.rootPredicateRef, "abg.transition_contract": c2.transitionContractRef },
    tags: ["odd-glc", "generic-lifecycle-witness"],
  };
  return { graphFunction, closure,
    callableMembership: [c1.graphFunctionRef, c1.vectorApplicationGraphFunctionRef,
      c1.fileReplaceGraphFunctionRef, c1.reducerGraphFunctionRef, c2.graphFunctionRef] };
}

export function constructD1ConsumerPublication({ gtl, product, sourceConsumerPublication, semanticPublication,
  c1Publication, c2Publication, lifecycle, ids = D1_WITNESS_IDS }) {
  const native = gtl.SEMANTIC_STAGE_IDS;
  const worksite = constructD1WorksiteGraph({ gtl, product, c1Publication, c2Publication });
  const closures = [];
  const semanticClose = (name, predicateRef, resultContractRef, closureScope = "graph_call") => {
    const closureContractRef = name === "root" ? ids.closureContractRef : `contract://odd-glc/generic-lifecycle/${name}/closure@5`;
    closures.push(gtl.constructSemanticClosureContract({ closureContractRef, predicateRef, resultContractRef, closureScope }));
    return closureContractRef;
  };
  const stages = lifecycle.stages.map((stage) => gtl.constructSemanticStageGraphFunction(stage,
    semanticClose(stage.declarationRef.split("/").at(-1).replace("@5", ""), native.assessorPredicateRef, native.envelopeContractRef)));
  const bridge = gtl.constructSemanticBridgeGraphFunction({
    graphFunctionRef: "graph-function://odd-glc/generic-lifecycle/design-worksite@5",
    nodeRef: "node://odd-glc/generic-lifecycle/design-worksite@5", operation: "design_worksite",
    closureContractRef: semanticClose("design-worksite", native.bridgePredicateRef, product.WORKSITE_PREPARATION_IDS.inputContractRef),
  });
  const evidenceInput = gtl.constructSemanticBridgeGraphFunction({
    graphFunctionRef: "graph-function://odd-glc/generic-lifecycle/evidence-input@5",
    nodeRef: "node://odd-glc/generic-lifecycle/evidence-input@5", operation: "evidence_input",
    closureContractRef: semanticClose("evidence-input", native.evidenceInputPredicateRef, native.envelopeContractRef),
  });
  const terminalOutput = gtl.constructSemanticBridgeGraphFunction({
    graphFunctionRef: "graph-function://odd-glc/generic-lifecycle/envelope-output@5",
    nodeRef: "node://odd-glc/generic-lifecycle/envelope-output@5", operation: "envelope_output",
    closureContractRef: semanticClose("envelope-output", native.terminalPredicateRef, native.outputContractRef),
  });
  const finalStage = exactlyOne(stages.filter((stage) => stage.name === stageFunctionRef("evidence")), "evidence stage");
  const chain = [...stages.filter((stage) => stage !== finalStage), bridge, worksite.graphFunction, evidenceInput, finalStage, terminalOutput];
  const nodes = chain.map((graph, ordinal) => ({
    nodeRef: `node://odd-glc/generic-lifecycle/step-${ordinal}@5`, nodeKind: "c_locus",
    term: gtl.workflow.C(gtl.cGraphFunctionRef({ graphFunctionRef: graph.name,
      input: gtl.cCarrier(graph.inputs[0]), output: gtl.cCarrier(graph.outputs[0]) })),
  }));
  const rootClose = semanticClose("root", native.lifecyclePredicateRef, native.outputContractRef, "run");
  const contracts = [...new Set(chain.flatMap((graph) => [...graph.inputs, ...graph.outputs]))];
  const root = {
    kind: "graph_function", name: ids.graphFunctionRef, version: "5.0.0",
    environment: { requires: [native.envelopeContractRef], provides: contracts, carries: contracts },
    inputs: [native.envelopeContractRef], outputs: [native.outputContractRef],
    template: { kind: "inline_graph", graphRef: ids.graphRef, startNodeRef: nodes[0].nodeRef,
      terminalNodeRefs: [nodes.at(-1).nodeRef], nodes,
      edges: nodes.slice(1).map((node, index) => gtl.graphEdge({ fromNodeRef: nodes[index].nodeRef, toNodeRef: node.nodeRef })), applications: [] },
    effects: [...new Set(chain.flatMap((graph) => graph.effects))],
    declarations: { "abg.compute_regime": "mixed", "abg.closure_contract": rootClose,
      "abg.evidence_contract": native.evidenceContractRef, "abg.judgment_contract": native.judgmentContractRef,
      "abg.judgment_predicate": native.lifecycleStepPredicateRef, "abg.transition_contract": native.transitionContractRef },
    tags: ["odd-glc", "generic-lifecycle-witness", "non-closing-application-coverage"],
  };
  const graphFunctions = [...stages, bridge, worksite.graphFunction, evidenceInput, terminalOutput, root];
  const program = {
    kind: "gtl_program", programRef: ids.programRef, version: "5.0.0", moduleRef: ids.moduleRef,
    starts: [{ startRef: ids.startRef, graphFunctionRef: ids.graphFunctionRef }],
    callableMembership: [...new Set([...graphFunctions.map((graph) => graph.name), ...worksite.callableMembership])],
    closureContractRef: rootClose,
    policies: { "abg.root_mode": "direct", "abg.compute_regime": "mixed", "abg.default_start_ref": ids.startRef },
  };
  const nativeCloseContract = exactlyOne(semanticPublication.contracts.filter((row) => row.contractRef === native.closureContractRef), "native semantic closure declaration");
  const c2CloseContract = exactlyOne(c2Publication.contracts.filter((row) => row.contractRef === product.WORKSITE_COMMAND_EXECUTION_IDS.closureContractRef), "native C2 closure declaration");
  const { requirementHandoffs: _sourceDeclarations, ...packageBasis } = structuredClone(sourceConsumerPublication);
  return gtl.modulePublication({ ...packageBasis, moduleRef: ids.moduleRef,
    productSemanticsBinding: structuredClone(semanticPublication.productSemanticsBinding),
    semanticLifecycle: lifecycle,
    contracts: [...closures.map((closure) => ({ ...nativeCloseContract, contractRef: closure.closureContractRef })),
      { ...c2CloseContract, contractRef: worksite.closure.closureContractRef }],
    closureContracts: [...closures, worksite.closure],
    graphFunctions, programs: [program],
    contributions: graphFunctions.map((graph) => ({
      handle: graph.name, kind: "graph_function", declarationOrContractRef: graph.name,
      owningProductId: ids.productId,
      programMembershipRefs: [ids.programRef],
      readinessPrerequisiteRefs: [ids.programRef],
      compatibilityRefs: ["compatibility://abiogenesis/major/5"],
      provenanceRefs: [sourceConsumerPublication.artifactDigest, sourceConsumerPublication.productManifestDigest],
    })),
  });
}

export function constructD1DeclarationBundle({ gtl, product, abiArtifact, abiPublications, fixture, derived, scenario, oracle, ids = D1_WITNESS_IDS }) {
  const publication = (moduleRef) => exactlyOne(abiPublications.filter((row) => row.moduleRef === moduleRef), `native publication ${moduleRef}`);
  const sourceNative = publication(gtl.REQUIREMENT_HANDOFF_IDS.moduleRef);
  const semanticNative = publication(gtl.SEMANTIC_STAGE_IDS.moduleRef);
  const c1Native = publication(product.WORKSITE_CONSTRUCTION_IDS.moduleRef);
  const c2Native = publication(product.WORKSITE_COMMAND_EXECUTION_IDS.moduleRef);
  const source = constructD1SourceDeclarations({ gtl, product, fixture, derived, ids });
  const lifecycle = constructD1LifecycleDeclaration({ gtl, product, derived, scenario, oracle, ids });
  const placeholder = `sha256:${"0".repeat(64)}`;
  // Package coordinates are supplied only after packing. These placeholders
  // occur in declaration staging, never as admitted artifact or runtime truth.
  const consumerBasis = { productId: ids.productId, packageName: ids.packageName, packageVersion: ids.packageVersion,
    artifactDigest: placeholder, productContentDigest: placeholder, productManifestDigest: placeholder };
  const sourceConsumer = gtl.constructRequirementHandoffConsumerPublication(consumerBasis, sourceNative, source.declaration,
    { moduleRef: ids.sourceModuleRef, programRef: ids.sourceProgramRef,
      startRef: "start://odd-glc/generic-lifecycle/source@5", graphRef: "graph://odd-glc/generic-lifecycle/source@5",
      closureContractRef: ids.sourceClosureContractRef, descriptorRef: ids.descriptorRef,
      contributionManifestRef: ids.contributionManifestRef }, source.roleContracts);
  const consumerPublication = constructD1ConsumerPublication({ gtl, product, sourceConsumerPublication: sourceConsumer,
    semanticPublication: semanticNative, c1Publication: c1Native, c2Publication: c2Native, lifecycle, ids });
  return { ids, source, lifecycle, sourcePublication: sourceConsumer, consumerPublication,
    consumerPublications: [sourceConsumer, consumerPublication],
    nativeArtifact: { productId: abiArtifact.productId, artifactDigest: abiArtifact.artifactDigest,
      productContentDigest: abiArtifact.productContentDigest, manifestDigest: abiArtifact.manifestDigest,
      packageName: abiArtifact.packageName, packageVersion: abiArtifact.packageVersion },
    startSelections: D1_START_SELECTIONS };
}

export function materializeD1Publication({ gtl, identity, publicationData }) {
  return gtl.modulePublication({
    kind: "module_publication", moduleVersion: "5.0.0", ...structuredClone(publicationData),
    artifactDigest: identity.artifactDigest, productContentDigest: identity.productContentDigest,
    productManifestDigest: identity.manifestDigest,
    contributions: publicationData.contributions.map((row) => ({
      ...structuredClone(row), provenanceRefs: [identity.artifactDigest, identity.manifestDigest],
    })),
  });
}

export function constructD1ConsumerPackageFiles({ product, gtl, abiArtifact, sourcePublication, consumerPublication, fixture, derived, scenario, sourceFixtureBytes, derivedDeclarationBytes,
  ids = D1_WITNESS_IDS, frozenInputDigests = D1_FROZEN_INPUT_SHA256 }) {
  const unboundData = (publication) => {
    const { kind: _kind, moduleVersion: _version, artifactDigest: _artifact,
      productContentDigest: _content, productManifestDigest: _manifest, ...data } = structuredClone(publication);
    return data;
  };
  const sourcePublicationData = unboundData(sourcePublication);
  const publicationData = unboundData(consumerPublication);
  const publicationDataMembers = [sourcePublicationData, publicationData];
  const schemaPath = "contracts/public-contract-catalog.schema.json";
  const values = {
    "package.json": { name: ids.packageName, version: ids.packageVersion, type: "module",
      exports: { "./publication": "./build/publication.json", "./source-publication": "./build/source-publication.json" },
      files: ["build", "contracts", "product-toolchain-manifest.json"] },
    "build/publication.json": publicationData,
    "build/source-publication.json": sourcePublicationData,
    "contracts/independent-source-input.json": fixture,
    "contracts/source-role-declarations.json": derived,
    "contracts/scenario-input.json": scenario,
    [schemaPath]: { $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://odd-glc.example/contracts/d1-declaration-witness-catalog@5", type: "object" },
  };
  const files = Object.fromEntries(Object.entries(values).map(([path, value]) => [path, `${product.canonicalJson(value)}\n`]));
  for (const [path, bytes, value, expected] of [
    ["contracts/independent-source-input.json", sourceFixtureBytes, fixture, frozenInputDigests.source],
    ["contracts/source-role-declarations.json", derivedDeclarationBytes, derived, frozenInputDigests.declarations],
  ]) {
    if (product.sha256Bytes(bytes) !== `sha256:${expected}` ||
      product.canonicalJson(JSON.parse(Buffer.from(bytes).toString("utf8"))) !== product.canonicalJson(value)) {
      throw new TypeError(`frozen declaration input differs: ${path}`);
    }
    files[path] = bytes;
  }
  const graph = product.constructCapabilityDefinitionGraph([]);
  const graphBytes = product.capabilityDefinitionGraphAssetBytes(graph);
  const graphCoordinate = product.capabilityDefinitionGraphCoordinate(graph);
  files[product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH] = graphBytes;
  const productRelativeLocators = Object.keys(values).sort();
  const payloadInventory = productRelativeLocators.map((path) => ({ path, sha256: product.sha256Bytes(files[path]) }));
  const productContentDigest = product.payloadInventoryDigest(payloadInventory);
  const catalogBody = { schemaVersion: "5.0.0", catalogId: ids.catalogRef, catalogVersion: "5.0.0",
    catalogSchemaPath: schemaPath, catalogSchemaDigest: product.sha256Bytes(files[schemaPath]), rows: [] };
  const catalog = { ...catalogBody, catalogDigest: product.sha256Canonical(catalogBody) };
  const placeholder = `sha256:${"0".repeat(64)}`;
  const drafts = publicationDataMembers.map((data) => materializeD1Publication({ gtl, publicationData: data,
    identity: { artifactDigest: placeholder, productContentDigest, manifestDigest: placeholder } }));
  const contributionManifest = {
    kind: "product_contribution_manifest", schemaVersion: "5.0.0",
    contributionManifestRef: ids.contributionManifestRef, productId: ids.productId,
    productVersion: ids.packageVersion, descriptorRef: ids.descriptorRef, productContentDigest,
    publicContractCatalogId: catalog.catalogId, publicContractCatalogDigest: catalog.catalogDigest,
    capabilityDefinitionGraph: graphCoordinate,
    publicationBindings: drafts.map((draft) => ({ moduleRef: draft.moduleRef,
      publicationDigest: product.modulePublicationSemanticDigest(draft) })),
    rows: drafts.flatMap((draft) => draft.contributions.map(({ provenanceRefs: _refs, ...row }) => ({
      moduleRef: draft.moduleRef, ...structuredClone(row), provenanceRef: ids.provenanceRef,
    }))),
  };
  const compatibilityRef = "compatibility://abiogenesis/major/5";
  const manifest = {
    kind: "abg_product_toolchain_manifest", schemaVersion: "5.0.0",
    productId: ids.productId, packageName: ids.packageName, packageVersion: ids.packageVersion,
    productContentDigest, productRelativeLocators, descriptorRef: ids.descriptorRef,
    publisherNamespace: "odd-glc", contributionManifestRef: ids.contributionManifestRef,
    contributionManifestDigest: product.sha256Canonical(contributionManifest), contributionManifest,
    compatibilityRefs: [compatibilityRef],
    declaredDependencies: [{ kind: "requires", productId: abiArtifact.productId,
      packageVersion: abiArtifact.packageVersion, compatibilityRef,
      requiredContractRefs: ["abg.contract.gtl.root-declaration", "abg.schema.public-operation-invocation"],
      requiredCapabilityRefs: ["abg.capability.catalog.invoke-graph-function@5", "abg.capability.gtl.declare@5"] }],
    provenanceRef: ids.provenanceRef, declaredCapabilityRefs: [],
    capabilityDefinitionGraph: { ...graphCoordinate, assetLocator: {
      path: product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH, mediaType: "application/json",
      schemaVersion: "5.0.0", contentDigest: product.sha256Bytes(graphBytes),
    } }, publicContractCatalog: catalog,
  };
  files["product-toolchain-manifest.json"] = `${product.canonicalJson(manifest)}\n`;
  return { files, manifest, publicationData, sourcePublicationData, publicationDataMembers, payloadInventory, productContentDigest };
}
