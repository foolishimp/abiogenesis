// Validates: T-131
// Validates: T-130
// Validates: REQ-L-GTL3-GRAPHVECTOR
// Validates: REQ-L-GTL3-HOOKS
// Validates: REQ-L-GTL3-EVALUATOR
// Validates: REQ-R-ABG3-ASSURANCE
// Validates: REQ-R-ABG3-PAYLOAD

import test from "node:test";
import assert from "node:assert/strict";

import {
  EDGE_ASSURANCE_CONTRACT_DECLARATION_KEY,
  EDGE_ASSURANCE_FH_ABSENTIA_ACTION_REFS,
  admitFpEdgeAssuranceEvalFinding,
  assertFpEdgeAssuranceEvalFindingMatchesHookAction,
  constructEdgeAssuranceContract,
  constructEnginePluginContract,
  constructEnginePluginInput,
  constructFpEdgeAssuranceEvalFinding,
  constructHookActionRecord,
  constructHookFindingAdmission,
  constructAssuranceAuthoritySnapshot,
  constructAssuranceEvidenceRow,
  deriveAssuranceClosureDecision,
  deriveAssuranceProjection,
  deriveAssuranceScopeRef,
  deriveEdgeAssuranceEvaluationProjection,
  deriveEdgeAssuranceEvaluationReadModel,
  deriveRuntimeAggregateProjection,
  resolveEdgeAssuranceContract,
  tryResolveEdgeAssuranceContract
} from "../../build/semantic/code/src/abg/m03/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

function attrs(entries = []) {
  return Object.freeze({ entries: Object.freeze(entries) });
}

function scalarEntry(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "scalar",
      value
    })
  });
}

function stringListEntry(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "string_list",
      value: Object.freeze(value)
    })
  });
}

function hookEntry(key, hookRef, label) {
  return hookEntryWithConfig(key, hookRef, edgeContractAttrs(label));
}

function hookEntryWithConfig(key, hookRef, config) {
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "hook_ref",
      value: Object.freeze({
        ref: hookRef,
        config
      })
    })
  });
}

function edgeContractAttrs(label) {
  return attrs([
    scalarEntry("target_outcome_ref", `outcome://t131/${label}`),
    stringListEntry("authority_surface_refs", [`authority://t131/${label}`]),
    stringListEntry("target_obligation_binding_refs", [
      `obligation://t131/${label}`
    ]),
    scalarEntry("transform_fp_contract_ref", `contract://t131/${label}/transform`),
    scalarEntry("eval_fp_contract_ref", `contract://t131/${label}/eval`),
    scalarEntry(
      "eval_prompt_input_contract_ref",
      `contract://t131/${label}/eval-input`
    ),
    scalarEntry(
      "eval_expected_output_contract_ref",
      `contract://t131/${label}/eval-output`
    ),
    scalarEntry(
      "admissible_evidence_policy_ref",
      `policy://t131/${label}/evidence`
    ),
    stringListEntry("admitted_evidence_kind_refs", [
      `evidence-kind://t131/${label}`
    ]),
    scalarEntry("gain_report_schema_ref", `schema://t131/${label}/gain`),
    scalarEntry("metric_function_ref", `metric://t131/${label}`),
    scalarEntry("close_decision_schema_ref", `schema://t131/${label}/close`),
    scalarEntry(
      "residual_pressure_schema_ref",
      `schema://t131/${label}/residual`
    ),
    scalarEntry(
      "continuation_schema_ref",
      `schema://t131/${label}/continuation`
    ),
    scalarEntry("composition_law_ref", `composition://t131/${label}`),
    stringListEntry("cheap_structural_check_refs", [
      `fd://t131/${label}/schema`
    ]),
    stringListEntry("policy_refs", [`policy://t131/${label}/edge`])
  ]);
}

function edgeHook(label) {
  return hookEntry(
    EDGE_ASSURANCE_CONTRACT_DECLARATION_KEY,
    `hook://t131/${label}`,
    label
  );
}

function reversedAttrs(input) {
  return attrs([...input.entries].reverse());
}

function scalarAssuranceAttr() {
  return scalarEntry(EDGE_ASSURANCE_CONTRACT_DECLARATION_KEY, "not-a-hook-ref");
}

function basisParts() {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const vector = basis.graph.vectors[0];
  assert.ok(vector);
  return {
    basis,
    vector,
    graphFunction: basis.graphFunction,
    job: basis.job,
    module: Object.freeze({
      name: "module://t131",
      policyHooks: attrs()
    })
  };
}

function defaultContract(label = "default") {
  return constructEdgeAssuranceContract({
    hookRef: `hook://t131/${label}`,
    targetOutcomeRef: `outcome://t131/${label}`,
    authoritySurfaceRefs: [`authority://t131/${label}`],
    targetObligationBindingRefs: [`obligation://t131/${label}`],
    transformFpContractRef: `contract://t131/${label}/transform`,
    evalFpContractRef: `contract://t131/${label}/eval`,
    evalPromptInputContractRef: `contract://t131/${label}/eval-input`,
    evalExpectedOutputContractRef: `contract://t131/${label}/eval-output`,
    admissibleEvidencePolicyRef: `policy://t131/${label}/evidence`,
    admittedEvidenceKindRefs: [`evidence-kind://t131/${label}`],
    gainReportSchemaRef: `schema://t131/${label}/gain`,
    metricFunctionRef: `metric://t131/${label}`,
    closeDecisionSchemaRef: `schema://t131/${label}/close`,
    residualPressureSchemaRef: `schema://t131/${label}/residual`,
    continuationSchemaRef: `schema://t131/${label}/continuation`,
    compositionLawRef: `composition://t131/${label}`,
    cheapStructuralCheckRefs: [`fd://t131/${label}/schema`],
    policyRefs: [`policy://t131/${label}/edge`]
  });
}

function role(label) {
  return Object.freeze({
    id: `role://t131/${label}`,
    name: label,
    tags: Object.freeze([]),
    policyHooks: attrs([edgeHook(label)])
  });
}

function resolveWith(overrides = {}) {
  const parts = basisParts();
  return resolveEdgeAssuranceContract({
    vector: Object.freeze({
      ...parts.vector,
      declarations: overrides.vectorDeclarations ?? attrs()
    }),
    graphFunction: Object.freeze({
      ...parts.graphFunction,
      declarations: overrides.graphFunctionDeclarations ?? attrs()
    }),
    job:
      overrides.job === null
        ? null
        : Object.freeze({
            ...parts.job,
            policyHooks: overrides.jobPolicyHooks ?? attrs()
          }),
    roles: overrides.roles ?? Object.freeze([]),
    module:
      overrides.module === null
        ? null
        : Object.freeze({
            ...parts.module,
            policyHooks: overrides.modulePolicyHooks ?? attrs()
          }),
    defaults: overrides.defaults
  });
}

function basisWithVectorDeclarations(declarations) {
  const { basis } = basisParts();
  const vectors = basis.graph.vectors.map((vector, index) =>
    index === 0
      ? Object.freeze({
          ...vector,
          declarations
        })
      : vector
  );
  return Object.freeze({
    ...basis,
    graph: Object.freeze({
      ...basis.graph,
      vectors: Object.freeze(vectors)
    })
  });
}

function basisWithModulePolicyHooks(policyHooks) {
  const { basis } = basisParts();
  return Object.freeze({
    ...basis,
    modulePolicyHooks: policyHooks
  });
}

function fpDispatchContract() {
  return constructEnginePluginContract({
    ref: "plugin://t131/fp-dispatch",
    pluginKind: "fp_dispatch",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FpDispatchOutcome"
  });
}

function selectedEdgeAssurance() {
  const selection = resolveWith({
    vectorDeclarations: attrs([edgeHook("vector")])
  });
  assert.equal(selection.kind, "edge_assurance_contract_selection");
  return selection;
}

function hookActionForSelection(selection, findingRef = "finding://t131/eval/1") {
  return constructHookActionRecord({
    hookActionRef: "hook-action://t131/eval/1",
    hookClass: "eval",
    hookContractRef: selection.contract.evalFpContractRef,
    pluginRef: "plugin://t131/eval",
    inputBasisRefs: [selection.selectionRef],
    policyRefs: selection.contract.policyRefs,
    configRefs: [selection.contract.configDigest],
    returnedFindingRefs: [findingRef],
    admissionRefs: ["admission://t131/eval/1"],
    outputSurfaceRef: "assurance://t131/edge"
  });
}

function edgeEvalFinding(input) {
  return admitFpEdgeAssuranceEvalFinding({
    kind: "fp_edge_assurance_eval_finding",
    findingRef: input.findingRef ?? "finding://t131/eval/1",
    hookActionRef: input.hookActionRef,
    edgeAssuranceSelectionRef: input.selection.selectionRef,
    evalFpContractRef: input.selection.contract.evalFpContractRef,
    gainReportRef: "gain://t131/eval/1",
    metricRefs: ["metric://t131/vector"],
    closeDisposition: input.closeDisposition ?? "retry",
    residualPressureRefs: input.residualPressureRefs ?? ["residual://t131/edge"],
    continuationRefs: input.continuationRefs ?? ["continuation://t131/edge"],
    evidenceRefs: input.evidenceRefs ?? ["evidence://t131/edge"],
    authorityRefs: input.authorityRefs ?? ["authority://t131/vector"],
    compositionContributionRef: "composition://t131/vector"
  });
}

function admittedFinding(input) {
  return constructHookFindingAdmission({
    admissionRef: "admission://t131/eval/1",
    hookActionRef: input.hookAction.hookActionRef,
    findingRef: input.finding.findingRef,
    status: input.status ?? "admitted",
    owningSurfaceRef: "assurance://t131/edge",
    evidenceRefs: input.finding.evidenceRefs,
    predecessorRefs: [input.hookAction.hookActionRef]
  });
}

function assuranceForFinding(input = {}) {
  const basis = basisWithVectorDeclarations(attrs([edgeHook("vector")]));
  const runtimeProjection = deriveRuntimeAggregateProjection(basis, []);
  const scope = deriveAssuranceScopeRef({
    basis,
    projection: runtimeProjection,
    vectorIndex: 0
  });
  const authoritySnapshot = constructAssuranceAuthoritySnapshot({
    scope,
    authorityRefs: ["authority://t131/vector"],
    deferredAuthorityRefs: input.deferred
      ? ["authority://t131/vector"]
      : undefined,
    inputRefs: ["input://t131/current"],
    authorityDigest: "authority-digest://t131/current",
    inputDigest: "input-digest://t131/current",
    providerRefs: ["provider://t131/authority"],
    policyRefs: ["policy://t131/vector/edge"]
  });
  const evidenceRows = [
    constructAssuranceEvidenceRow({
      scope,
      evidenceRef: "evidence://t131/edge",
      authorityRef: "authority://t131/vector",
      authorityDigest: authoritySnapshot.authorityDigest,
      inputDigest: authoritySnapshot.inputDigest,
      eventRefs: ["event://t131/evidence"],
      providerRefs: ["provider://t131/evidence"],
      policyRefs: ["policy://t131/vector/edge"],
      complete: input.complete ?? true,
      shallow: input.shallow ?? false
    })
  ];
  const projection = deriveAssuranceProjection({
    basis,
    runtimeProjection,
    authoritySnapshot,
    evidenceRows
  });
  return {
    basis,
    runtimeProjection,
    projection,
    decision: deriveAssuranceClosureDecision(projection)
  };
}

test("T-131 edge assurance contract resolution preserves declaration precedence", () => {
  const selection = resolveWith({
    vectorDeclarations: attrs([edgeHook("vector")]),
    graphFunctionDeclarations: attrs([edgeHook("graph-function")]),
    jobPolicyHooks: attrs([edgeHook("job")]),
    roles: [role("role")],
    modulePolicyHooks: attrs([edgeHook("module")]),
    defaults: {
      sourceRef: "abg-defaults://t131",
      contract: defaultContract("default"),
      defaultKey: "edgeAssuranceContract"
    }
  });

  assert.equal(selection.kind, "edge_assurance_contract_selection");
  assert.equal(selection.source, "graph_vector_declarations");
  assert.equal(selection.contract.hookRef, "hook://t131/vector");
  assert.equal(
    selection.contract.evalFpContractRef,
    "contract://t131/vector/eval"
  );
});

test("T-131 lower precedence surfaces only supply defaults when narrower declarations are absent", () => {
  const cases = [
    {
      label: "graph-function",
      expectedSource: "graph_function_declarations",
      input: {
        graphFunctionDeclarations: attrs([edgeHook("graph-function")])
      }
    },
    {
      label: "job",
      expectedSource: "job_policy_hooks",
      input: {
        jobPolicyHooks: attrs([edgeHook("job")])
      }
    },
    {
      label: "role",
      expectedSource: "role_policy_hooks",
      input: {
        roles: [role("role")]
      }
    },
    {
      label: "module",
      expectedSource: "module_policy_hooks",
      input: {
        modulePolicyHooks: attrs([edgeHook("module")])
      }
    },
    {
      label: "default",
      expectedSource: "abg_defaults",
      input: {
        defaults: {
          sourceRef: "abg-defaults://t131",
          contract: defaultContract("default"),
          defaultKey: "edgeAssuranceContract"
        }
      }
    }
  ];

  for (const entry of cases) {
    const selection = resolveWith(entry.input);
    assert.equal(selection.kind, "edge_assurance_contract_selection");
    assert.equal(selection.source, entry.expectedSource);
    assert.equal(selection.contract.hookRef, `hook://t131/${entry.label}`);
  }
});

test("T-131 absence resolves to F_H by absentia, not automated closure", () => {
  const parts = basisParts();

  assert.equal(
    tryResolveEdgeAssuranceContract({
      vector: parts.vector,
      graphFunction: parts.graphFunction,
      job: parts.job,
      roles: [],
      module: parts.module
    }),
    null
  );

  const resolution = resolveWith();
  assert.equal(resolution.kind, "edge_assurance_absentia_resolution");
  assert.equal(resolution.disposition, "fh_required");
  assert.equal(resolution.reason, "edge_assurance_contract_absent");
  assert.deepEqual(
    resolution.requiredHumanActionRefs,
    EDGE_ASSURANCE_FH_ABSENTIA_ACTION_REFS
  );
});

test("T-131 negative: malformed or ambiguous declarations fail closed", () => {
  assert.throws(
    () =>
      resolveWith({
        vectorDeclarations: attrs([scalarAssuranceAttr()])
      }),
    /hook_ref/i
  );

  assert.throws(
    () =>
      resolveWith({
        vectorDeclarations: attrs([
          hookEntry(
            EDGE_ASSURANCE_CONTRACT_DECLARATION_KEY,
            "hook://t131/missing",
            "missing"
          )
        ].map((entry) =>
          Object.freeze({
            ...entry,
            value: Object.freeze({
              ...entry.value,
              value: Object.freeze({
                ...entry.value.value,
                config: attrs([scalarEntry("target_outcome_ref", "outcome://x")])
              })
            })
          })
        ))
      }),
    /required/i
  );

  assert.throws(
    () =>
      resolveWith({
        roles: [role("role-a"), role("role-b")]
      }),
    /multiple role edge assurance defaults/i
  );

  assert.throws(
    () =>
      resolveWith({
        vectorDeclarations: attrs([edgeHook("vector"), edgeHook("duplicate")])
      }),
    /duplicate gtl attr/i
  );
});

test("T-131 contract identity is stable across reordered config attrs", () => {
  const originalConfig = edgeContractAttrs("stable");
  const reversedConfig = reversedAttrs(originalConfig);
  const original = resolveWith({
    vectorDeclarations: attrs([
      hookEntryWithConfig(
        EDGE_ASSURANCE_CONTRACT_DECLARATION_KEY,
        "hook://t131/stable",
        originalConfig
      )
    ])
  });
  const reordered = resolveWith({
    vectorDeclarations: attrs([
      hookEntryWithConfig(
        EDGE_ASSURANCE_CONTRACT_DECLARATION_KEY,
        "hook://t131/stable",
        reversedConfig
      )
    ])
  });

  assert.equal(original.kind, "edge_assurance_contract_selection");
  assert.equal(reordered.kind, "edge_assurance_contract_selection");
  assert.equal(original.selectionRef, reordered.selectionRef);
  assert.equal(original.contract.configDigest, reordered.contract.configDigest);
});

test("T-131 F_P eval findings are admitted findings tied to hook action and selected contract", () => {
  const selection = selectedEdgeAssurance();
  const hookAction = hookActionForSelection(selection);
  const finding = edgeEvalFinding({
    selection,
    hookActionRef: hookAction.hookActionRef,
    closeDisposition: "retry"
  });
  const admission = admittedFinding({ hookAction, finding });

  assertFpEdgeAssuranceEvalFindingMatchesHookAction({
    hookAction,
    selection,
    finding,
    admission
  });
  assert.equal(finding.closeDisposition, "retry");
  assert.deepEqual(finding.metricRefs, ["metric://t131/vector"]);
});

test("T-131 admitted F_P eval finding projects gain, close fold, residual, and next action", () => {
  const selection = selectedEdgeAssurance();
  const hookAction = hookActionForSelection(selection);
  const finding = edgeEvalFinding({
    selection,
    hookActionRef: hookAction.hookActionRef,
    closeDisposition: "close"
  });
  const admission = admittedFinding({ hookAction, finding });
  const assurance = assuranceForFinding();
  assert.equal(assurance.decision.decision, "close");

  const edgeProjection = deriveEdgeAssuranceEvaluationProjection({
    selection,
    hookAction,
    admission,
    finding,
    assuranceProjection: assurance.projection,
    closureDecision: assurance.decision
  });
  const readModel = deriveEdgeAssuranceEvaluationReadModel({
    projection: edgeProjection
  });

  assert.equal(edgeProjection.kind, "edge_assurance_evaluation_projection");
  assert.equal(edgeProjection.proposedCloseDisposition, "close");
  assert.equal(edgeProjection.assuranceClosureDecision, "close");
  assert.deepEqual(edgeProjection.metricRefs, ["metric://t131/vector"]);
  assert.deepEqual(edgeProjection.residualPressureRefs, ["residual://t131/edge"]);
  assert.deepEqual(edgeProjection.nextActionBasisRefs, [
    "composition://t131/vector"
  ]);
  assert.equal(readModel.gainReportRef, "gain://t131/eval/1");
  assert.equal(readModel.assuranceClosureDecision, "close");
});

test("T-131 F_P proposed close cannot override an assurance retry fold", () => {
  const selection = selectedEdgeAssurance();
  const hookAction = hookActionForSelection(selection);
  const finding = edgeEvalFinding({
    selection,
    hookActionRef: hookAction.hookActionRef,
    closeDisposition: "close"
  });
  const admission = admittedFinding({ hookAction, finding });
  const assurance = assuranceForFinding({ shallow: true });
  assert.equal(assurance.decision.decision, "retry");

  const edgeProjection = deriveEdgeAssuranceEvaluationProjection({
    selection,
    hookAction,
    admission,
    finding,
    assuranceProjection: assurance.projection,
    closureDecision: assurance.decision
  });

  assert.equal(edgeProjection.proposedCloseDisposition, "close");
  assert.equal(edgeProjection.assuranceClosureDecision, "retry");
  assert.deepEqual(edgeProjection.nextActionBasisRefs, [
    "continuation://t131/edge",
    "residual://t131/edge",
    "authority://t131/vector"
  ]);
});

test("T-131 qualified defer preserves continuation, residual, and composition basis", () => {
  const selection = selectedEdgeAssurance();
  const hookAction = hookActionForSelection(selection);
  const finding = edgeEvalFinding({
    selection,
    hookActionRef: hookAction.hookActionRef,
    closeDisposition: "qualified_defer"
  });
  const admission = admittedFinding({ hookAction, finding });
  const assurance = assuranceForFinding({ deferred: true });
  assert.equal(assurance.decision.decision, "qualified_defer");

  const edgeProjection = deriveEdgeAssuranceEvaluationProjection({
    selection,
    hookAction,
    admission,
    finding,
    assuranceProjection: assurance.projection,
    closureDecision: assurance.decision
  });

  assert.equal(edgeProjection.proposedCloseDisposition, "qualified_defer");
  assert.equal(edgeProjection.assuranceClosureDecision, "qualified_defer");
  assert.deepEqual(edgeProjection.nextActionBasisRefs, [
    "continuation://t131/edge",
    "residual://t131/edge",
    "composition://t131/vector"
  ]);
});

test("T-131 rejected or unadmitted eval findings cannot feed edge projection", () => {
  const selection = selectedEdgeAssurance();
  const hookAction = hookActionForSelection(selection);
  const finding = edgeEvalFinding({
    selection,
    hookActionRef: hookAction.hookActionRef,
    closeDisposition: "close"
  });
  const rejectedAdmission = admittedFinding({
    hookAction,
    finding,
    status: "rejected"
  });
  const assurance = assuranceForFinding();

  assert.throws(
    () =>
      deriveEdgeAssuranceEvaluationProjection({
        selection,
        hookAction,
        admission: rejectedAdmission,
        finding,
        assuranceProjection: assurance.projection,
        closureDecision: assurance.decision
      }),
    /requires an admitted hook finding/i
  );

  const unadmittedEvidenceFinding = edgeEvalFinding({
    selection,
    hookActionRef: hookAction.hookActionRef,
    evidenceRefs: ["evidence://t131/unadmitted"]
  });
  const unadmittedEvidenceAdmission = admittedFinding({
    hookAction,
    finding: unadmittedEvidenceFinding
  });

  assert.throws(
    () =>
      deriveEdgeAssuranceEvaluationProjection({
        selection,
        hookAction,
        admission: unadmittedEvidenceAdmission,
        finding: unadmittedEvidenceFinding,
        assuranceProjection: assurance.projection,
        closureDecision: assurance.decision
      }),
    /unadmitted ref/i
  );
});

test("T-131 eval admission refs must be recorded by the hook action", () => {
  const selection = selectedEdgeAssurance();
  const hookAction = hookActionForSelection(selection);
  const finding = edgeEvalFinding({
    selection,
    hookActionRef: hookAction.hookActionRef
  });
  const admission = constructHookFindingAdmission({
    admissionRef: "admission://t131/eval/not-recorded",
    hookActionRef: hookAction.hookActionRef,
    findingRef: finding.findingRef,
    status: "admitted",
    owningSurfaceRef: "assurance://t131/edge",
    evidenceRefs: finding.evidenceRefs,
    predecessorRefs: [hookAction.hookActionRef]
  });

  assert.throws(
    () =>
      assertFpEdgeAssuranceEvalFindingMatchesHookAction({
        hookAction,
        selection,
        finding,
        admission
      }),
    /admissionref is not recorded/i
  );
});

test("T-131 EnginePluginInput carries the resolved edge assurance disposition", () => {
  const basis = basisWithVectorDeclarations(attrs([edgeHook("vector")]));
  const projection = deriveRuntimeAggregateProjection(basis, []);
  const input = constructEnginePluginInput({
    contract: fpDispatchContract(),
    basis,
    projection,
    vectorIndex: 0,
    edge: basis.graph.vectors[0].name,
    regime: "F_P",
    actorInvocationRef: {
      actorInvocationId: "actor-invocation://t131",
      attemptIndex: 1,
      dispatchRef: "dispatch://t131",
      resultRef: "result://t131"
    }
  });

  assert.equal(
    input.edgeAssuranceResolution.kind,
    "edge_assurance_contract_selection"
  );
  assert.equal(
    input.edgeAssuranceResolution.contract.hookRef,
    "hook://t131/vector"
  );
  assert.equal(
    input.edgeAssuranceResolution.contract.gainReportSchemaRef,
    "schema://t131/vector/gain"
  );
});

test("T-131 EnginePluginInput sees module policy hooks and visible defaults", () => {
  const moduleBasis = basisWithModulePolicyHooks(attrs([edgeHook("module")]));
  const moduleProjection = deriveRuntimeAggregateProjection(moduleBasis, []);
  const moduleInput = constructEnginePluginInput({
    contract: fpDispatchContract(),
    basis: moduleBasis,
    projection: moduleProjection,
    vectorIndex: 0,
    edge: moduleBasis.graph.vectors[0].name,
    regime: "F_P",
    actorInvocationRef: {
      actorInvocationId: "actor-invocation://t131/module",
      attemptIndex: 1,
      dispatchRef: "dispatch://t131/module",
      resultRef: "result://t131/module"
    }
  });

  assert.equal(
    moduleInput.edgeAssuranceResolution.kind,
    "edge_assurance_contract_selection"
  );
  assert.equal(moduleInput.edgeAssuranceResolution.source, "module_policy_hooks");
  assert.equal(
    moduleInput.edgeAssuranceResolution.contract.hookRef,
    "hook://t131/module"
  );

  const { basis } = basisParts();
  const defaultProjection = deriveRuntimeAggregateProjection(basis, []);
  const defaultInput = constructEnginePluginInput({
    contract: fpDispatchContract(),
    basis,
    projection: defaultProjection,
    vectorIndex: 0,
    edge: basis.graph.vectors[0].name,
    regime: "F_P",
    edgeAssuranceDefaults: {
      sourceRef: "abg-defaults://t131/plugin-input",
      contract: defaultContract("default"),
      defaultKey: "edgeAssuranceContract"
    },
    actorInvocationRef: {
      actorInvocationId: "actor-invocation://t131/default",
      attemptIndex: 1,
      dispatchRef: "dispatch://t131/default",
      resultRef: "result://t131/default"
    }
  });

  assert.equal(
    defaultInput.edgeAssuranceResolution.kind,
    "edge_assurance_contract_selection"
  );
  assert.equal(defaultInput.edgeAssuranceResolution.source, "abg_defaults");
  assert.equal(
    defaultInput.edgeAssuranceResolution.contract.hookRef,
    "hook://t131/default"
  );
});

test("T-131 negative: F_P eval findings cannot smuggle closure or use a transform hook action", () => {
  const selection = resolveWith({
    vectorDeclarations: attrs([edgeHook("vector")])
  });
  assert.equal(selection.kind, "edge_assurance_contract_selection");

  assert.throws(
    () =>
      admitFpEdgeAssuranceEvalFinding({
        kind: "fp_edge_assurance_eval_finding",
        findingRef: "finding://t131/eval/bad",
        hookActionRef: "hook-action://t131/eval/bad",
        edgeAssuranceSelectionRef: selection.selectionRef,
        evalFpContractRef: selection.contract.evalFpContractRef,
        gainReportRef: "gain://t131/eval/bad",
        metricRefs: ["metric://t131/vector"],
        closeDisposition: "close",
        evidenceRefs: ["evidence://t131/edge"],
        authorityRefs: ["authority://t131/vector"],
        compositionContributionRef: "composition://t131/vector",
        closureDecision: "close"
      }),
    /cannot own engine authority/i
  );
  assert.throws(
    () =>
      constructFpEdgeAssuranceEvalFinding({
        findingRef: "finding://t131/eval/bad-disposition",
        hookActionRef: "hook-action://t131/eval/bad-disposition",
        edgeAssuranceSelectionRef: selection.selectionRef,
        evalFpContractRef: selection.contract.evalFpContractRef,
        gainReportRef: "gain://t131/eval/bad-disposition",
        metricRefs: ["metric://t131/vector"],
        closeDisposition: "done",
        evidenceRefs: ["evidence://t131/edge"],
        authorityRefs: ["authority://t131/vector"],
        compositionContributionRef: "composition://t131/vector"
      }),
    /expected edge assurance close disposition/i
  );
  assert.throws(
    () =>
      constructFpEdgeAssuranceEvalFinding({
        findingRef: "finding://t131/eval/bad-fh-disposition",
        hookActionRef: "hook-action://t131/eval/bad-fh-disposition",
        edgeAssuranceSelectionRef: selection.selectionRef,
        evalFpContractRef: selection.contract.evalFpContractRef,
        gainReportRef: "gain://t131/eval/bad-fh-disposition",
        metricRefs: ["metric://t131/vector"],
        closeDisposition: "fh_required",
        evidenceRefs: ["evidence://t131/edge"],
        authorityRefs: ["authority://t131/vector"],
        compositionContributionRef: "composition://t131/vector"
      }),
    /expected edge assurance close disposition/i
  );
  const humanEscalationFinding = constructFpEdgeAssuranceEvalFinding({
    findingRef: "finding://t131/eval/human-assurance-required",
    hookActionRef: "hook-action://t131/eval/human-assurance-required",
    edgeAssuranceSelectionRef: selection.selectionRef,
    evalFpContractRef: selection.contract.evalFpContractRef,
    gainReportRef: "gain://t131/eval/human-assurance-required",
    metricRefs: ["metric://t131/vector"],
    closeDisposition: "human_assurance_required",
    evidenceRefs: ["evidence://t131/edge"],
    authorityRefs: ["authority://t131/vector"],
    compositionContributionRef: "composition://t131/vector"
  });
  assert.equal(
    humanEscalationFinding.closeDisposition,
    "human_assurance_required"
  );

  const transformHookAction = constructHookActionRecord({
    hookActionRef: "hook-action://t131/transform/1",
    hookClass: "transform",
    hookContractRef: selection.contract.transformFpContractRef,
    pluginRef: "plugin://t131/transform",
    inputBasisRefs: [selection.selectionRef],
    returnedFindingRefs: ["finding://t131/eval/1"],
    outputSurfaceRef: "assurance://t131/edge"
  });
  const finding = admitFpEdgeAssuranceEvalFinding({
    kind: "fp_edge_assurance_eval_finding",
    findingRef: "finding://t131/eval/1",
    hookActionRef: transformHookAction.hookActionRef,
    edgeAssuranceSelectionRef: selection.selectionRef,
    evalFpContractRef: selection.contract.evalFpContractRef,
    gainReportRef: "gain://t131/eval/1",
    metricRefs: ["metric://t131/vector"],
    closeDisposition: "retry",
    evidenceRefs: ["evidence://t131/edge"],
    authorityRefs: ["authority://t131/vector"],
    compositionContributionRef: "composition://t131/vector"
  });

  assert.throws(
    () =>
      assertFpEdgeAssuranceEvalFindingMatchesHookAction({
        hookAction: transformHookAction,
        selection,
        finding
      }),
    /requires an eval hookactionrecord/i
  );
});
