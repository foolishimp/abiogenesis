export function installedT132EdgeAssuranceThreeChainSource({
  mode,
  archiveRoot
} = {}) {
  const liveMode = mode === "live";
  const archiveRootLiteral =
    typeof archiveRoot === "string" && archiveRoot.length > 0
      ? JSON.stringify(archiveRoot)
      : "null";
  return `
    import { createHash } from "node:crypto";
    import { join } from "node:path";

    import {
      EDGE_ASSURANCE_CONTRACT_DECLARATION_KEY,
      admitExecutionBasis,
      admitFpEdgeAssuranceEvalFinding,
      admitModule,
      admitNode,
      admitPublicStartRequest,
      admitResolvedPolicyIdentity,
      admitResolvedRuntimeIdentity,
      assertFpEdgeAssuranceEvalFindingMatchesHookAction,
      constructAuthoritySnapshotAdmittedEvent,
      constructEnginePluginContract,
      constructEnvRef,
      constructEvidenceAdmittedEvent,
      constructFpDispatchOutcome,
      constructGraph,
      constructGraphFunction,
      constructGraphVector,
      constructHookActionRecord,
      constructHookFindingAdmission,
      constructPayloadObservedEvent,
      constructPayloadValidatedEvent,
      constructTemplateRef,
      constructVectorClosedEvent,
      constructVectorEvaluatedEvent,
      contractForKnownAgent,
      deriveAdvancementTransition,
      deriveAssuranceAuthoritySnapshotFromPayloadLedger,
      deriveAssuranceClosureDecision,
      deriveAssuranceEvidenceRowsFromPayloadLedger,
      deriveAssuranceProjection,
      deriveAssuranceScopeRef,
      deriveEdgeAssuranceEvaluationProjection,
      deriveEdgeAssuranceEvaluationReadModel,
      derivePayloadLedgerProjection,
      deriveRuntimeAggregateProjection,
      dispatchRequestsForTransition,
      emit,
      runAgentTransport,
      runEngineIterateAsync
    } from "@abiogenesis/typescript-tenant";

    const LIVE_MODE = ${liveMode ? "true" : "false"};
    const EXTERNAL_ARCHIVE_ROOT = ${archiveRootLiteral};

    const stages = Object.freeze([
      Object.freeze({
        id: "source_to_requirements",
        sourceKind: "source_information",
        targetKind: "synthesized_requirements",
        edgeName: "source_information->synthesized_requirements",
        graphFunctionName: "synthesize_requirements_from_source",
        semanticTransform: "synthesize relevant information into requirements",
        authorityRef: "authority://t132/source-information",
        inputRef: "input://t132/source-information",
        targetOutcomeRef: "outcome://t132/synthesized-requirements",
        compositionContributionRef: "composition://t132/source-to-requirements"
      }),
      Object.freeze({
        id: "requirements_to_logic",
        sourceKind: "synthesized_requirements",
        targetKind: "formal_logical_requirements",
        edgeName: "synthesized_requirements->formal_logical_requirements",
        graphFunctionName: "formalize_requirements_as_logic",
        semanticTransform: "transform requirements into formal logical syntax",
        authorityRef: "authority://t132/synthesized-requirements",
        inputRef: "input://t132/synthesized-requirements",
        targetOutcomeRef: "outcome://t132/formal-logical-requirements",
        compositionContributionRef: "composition://t132/requirements-to-logic"
      }),
      Object.freeze({
        id: "logic_to_design_encoding",
        sourceKind: "formal_logical_requirements",
        targetKind: "disambiguated_design_syntax",
        edgeName: "formal_logical_requirements->disambiguated_design_syntax",
        graphFunctionName: "encode_design_in_disambiguated_syntax",
        semanticTransform: "encode design into disambiguated syntax",
        authorityRef: "authority://t132/formal-logical-requirements",
        inputRef: "input://t132/formal-logical-requirements",
        targetOutcomeRef: "outcome://t132/disambiguated-design-syntax",
        compositionContributionRef: "composition://t132/logic-to-design-encoding"
      })
    ]);

    function invariant(condition, message) {
      if (!condition) {
        throw new Error(message);
      }
    }

    function digestFor(value) {
      return "digest://sha256/" +
        createHash("sha256").update(JSON.stringify(value)).digest("hex");
    }

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

    function hookEntry(stage) {
      return Object.freeze({
        key: EDGE_ASSURANCE_CONTRACT_DECLARATION_KEY,
        value: Object.freeze({
          kind: "hook_ref",
          value: Object.freeze({
            ref: "hook://t132/" + stage.id + "/edge-assurance",
            config: edgeContractAttrs(stage)
          })
        })
      });
    }

    function edgeContractAttrs(stage) {
      return attrs([
        scalarEntry("target_outcome_ref", stage.targetOutcomeRef),
        stringListEntry("authority_surface_refs", [stage.authorityRef]),
        stringListEntry("target_obligation_binding_refs", [
          "obligation://t132/" + stage.id
        ]),
        scalarEntry(
          "transform_fp_contract_ref",
          "contract://t132/" + stage.id + "/transform"
        ),
        scalarEntry(
          "eval_fp_contract_ref",
          "contract://t132/" + stage.id + "/eval"
        ),
        scalarEntry(
          "eval_prompt_input_contract_ref",
          "contract://t132/" + stage.id + "/eval-input"
        ),
        scalarEntry(
          "eval_expected_output_contract_ref",
          "contract://t132/" + stage.id + "/eval-output"
        ),
        scalarEntry(
          "admissible_evidence_policy_ref",
          "policy://t132/" + stage.id + "/evidence"
        ),
        stringListEntry("admitted_evidence_kind_refs", [
          "evidence-kind://t132/" + stage.id
        ]),
        scalarEntry(
          "gain_report_schema_ref",
          "schema://t132/" + stage.id + "/gain"
        ),
        scalarEntry("metric_function_ref", "metric://t132/" + stage.id),
        scalarEntry(
          "close_decision_schema_ref",
          "schema://t132/" + stage.id + "/close"
        ),
        scalarEntry(
          "residual_pressure_schema_ref",
          "schema://t132/" + stage.id + "/residual"
        ),
        scalarEntry(
          "continuation_schema_ref",
          "schema://t132/" + stage.id + "/continuation"
        ),
        scalarEntry(
          "composition_law_ref",
          "composition://t132/" + stage.id + "/law"
        ),
        stringListEntry("cheap_structural_check_refs", [
          "fd://t132/" + stage.id + "/schema"
        ]),
        stringListEntry("policy_refs", [
          "policy://t132/" + stage.id + "/edge-assurance"
        ])
      ]);
    }

    function node(kind, markov) {
      return admitNode({
        id: "node-t132-" + kind,
        name: kind,
        schema: { kind: "symbolic", ref: "Vector[" + kind + "]" },
        markov: [markov],
        assetSurface: {
          kind,
          requiredContexts: ["workspace", "edge_assurance"],
          standardsRefs: ["REQ-R-ABG3-ASSURANCE", "REQ-L-GTL3-HOOKS"],
          outputContractRefs: [kind + "-contract"]
        },
        tags: ["t132", kind]
      });
    }

    const nodesByKind = new Map([
      ["source_information", node("source_information", "observed")],
      ["synthesized_requirements", node("synthesized_requirements", "synthesized")],
      [
        "formal_logical_requirements",
        node("formal_logical_requirements", "formalized")
      ],
      [
        "disambiguated_design_syntax",
        node("disambiguated_design_syntax", "encoded")
      ]
    ]);

    function stageVector(stage) {
      const source = nodesByKind.get(stage.sourceKind);
      const target = nodesByKind.get(stage.targetKind);
      invariant(source !== undefined, "missing source node for " + stage.id);
      invariant(target !== undefined, "missing target node for " + stage.id);
      return constructGraphVector({
        id: "graph-t132-" + stage.id,
        name: stage.edgeName,
        source: [source],
        target,
        operators: [],
        declarations: attrs([hookEntry(stage)]),
        evaluators: [
          {
            name: "assure_" + stage.id,
            regime: "F_P",
            description: stage.semanticTransform,
            binding: "binding://t132/" + stage.id + "/eval",
            tags: ["edge_assurance", "t132"]
          }
        ],
        contexts: [],
        rule: null,
        allowsSubwork: false,
        tags: ["t132", "edge_assurance"]
      });
    }

    const carriedNodes = [
      nodesByKind.get("source_information"),
      nodesByKind.get("synthesized_requirements"),
      nodesByKind.get("formal_logical_requirements"),
      nodesByKind.get("disambiguated_design_syntax")
    ];
    invariant(
      carriedNodes.every((entry) => entry !== undefined),
      "missing carried node"
    );
    const executiveGraph = constructGraph({
      id: "graph-t132-edge-assurance-three-chain",
      name: "t132_edge_assurance_three_chain_graph",
      inputs: [nodesByKind.get("source_information")],
      outputs: [nodesByKind.get("disambiguated_design_syntax")],
      nodes: carriedNodes,
      vectors: stages.map(stageVector),
      contexts: [],
      rules: [],
      effects: ["edge_assurance_eval"],
      tags: ["t132", "edge_assurance", "three_edge_chain"]
    });
    const executive = constructGraphFunction({
      id: "graph-function-t132-edge-assurance-three-chain",
      name: stages.map((stage) => stage.graphFunctionName).join(";"),
      environment: constructEnvRef({
        requires: [nodesByKind.get("source_information")],
        provides: [nodesByKind.get("disambiguated_design_syntax")],
        carries: carriedNodes
      }),
      inputs: [nodesByKind.get("source_information")],
      outputs: [nodesByKind.get("disambiguated_design_syntax")],
      template: constructTemplateRef({
        kind: "inline_graph",
        ref: "template://t132/edge-assurance-three-chain",
        graph: executiveGraph,
        version: null
      }),
      effects: ["edge_assurance_eval"],
      declarations: attrs(),
      tags: ["t132", "edge_assurance", "three_edge_chain"]
    });

    const module = admitModule({
      name: "t132_edge_assurance_three_chain",
      graphs: [executiveGraph],
      graphFunctions: [executive],
      refinementBoundaries: [],
      candidateFamilies: [],
      jobs: [
        {
          id: "job-t132-edge-assurance-three-chain",
          name: "t132_edge_assurance_three_chain_job",
          contracts: [{ kind: "graph_function", targetId: executive.id }],
          roles: [],
          tags: ["semantic_work", "t132", "edge_assurance"]
        }
      ],
      roles: [],
      operators: [],
      evaluators: [],
      rules: [],
      imports: [],
      metadata: attrs()
    });

    const runtimeIdentity = admitResolvedRuntimeIdentity({
      workerId: "worker://t132-installed-runtime",
      backendId: "backend://node",
      buildId: "build://typescript-installed",
      resolvedRuntimeRef: "runtime://typescript-installed/t132"
    });
    const resolvedPolicy = admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://t132-installed-fp",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://t132-installed"
    });
    const startInput = {
      scope: {
        kind: "workspace",
        workspaceRoot: process.cwd(),
        moduleName: module.name
      },
      target: {
        kind: "graph_function",
        handle: executive.name
      },
      until: "converged"
    };
    const startRequest = admitPublicStartRequest(startInput);
    const basis = admitExecutionBasis({
      startIntent: startRequest.startIntent,
      module,
      runtimeIdentity,
      resolvedPolicy,
      runId: "run://t132-edge-assurance-installed-" + (LIVE_MODE ? "live" : "deterministic"),
      workKey: "wk://t132-edge-assurance-installed-" + (LIVE_MODE ? "live" : "deterministic"),
      frameId: null,
      frameLineageId: null
    });

    const fpDispatchContract = constructEnginePluginContract({
      ref: "plugin://t132/edge-assurance/fp-dispatch",
      pluginKind: "fp_dispatch",
      authority: "effect_plugin",
      inputCarrier: "EnginePluginInput",
      outputCarrier: "FpDispatchOutcome"
    });

    function timeoutMs() {
      const parsed = Number.parseInt(
        process.env.ABG_TS_LIVE_TIMEOUT_MS ?? "90000",
        10
      );
      return Number.isFinite(parsed) && parsed > 0 ? parsed : 90000;
    }

    function executorProfileFields() {
      const raw = process.env.ABG_TS_AGENT_EXECUTOR_PROFILE;
      if (raw === undefined || raw.trim().length === 0) {
        return {};
      }
      const normalized = raw.trim();
      if (normalized !== "local-spawn" && normalized !== "pty-terminal") {
        throw new Error("unsupported ABG_TS_AGENT_EXECUTOR_PROFILE=" + raw);
      }
      return { executorProfile: normalized };
    }

    function extractJsonObject(text) {
      const trimmed = text.trim();
      const fencePattern = new RegExp(
        "\\x60\\x60\\x60(?:json)?\\\\s*([\\\\s\\\\S]*?)\\\\s*\\x60\\x60\\x60",
        "iu"
      );
      const fenced = trimmed.match(fencePattern);
      const candidate = fenced === null ? trimmed : fenced[1].trim();
      try {
        return JSON.parse(candidate);
      } catch {
        const first = candidate.indexOf("{");
        const last = candidate.lastIndexOf("}");
        if (first === -1 || last === -1 || last <= first) {
          throw new Error("live worker response did not contain a JSON object");
        }
        return JSON.parse(candidate.slice(first, last + 1));
      }
    }

    function expectedDesignSyntaxPayload(stage) {
      if (stage.id !== "logic_to_design_encoding") {
        return null;
      }
      return Object.freeze({
        kind: "gtl_disambiguated_design_syntax",
        schemaVersion: "t132.design_syntax.v1",
        syntaxRef: "syntax://t132/disambiguated-design",
        targetOutcomeRef: stage.targetOutcomeRef,
        sourceFormalRequirementRefs: [stage.authorityRef],
        graphEncoding: Object.freeze({
          moduleName: module.name,
          graphRef: executiveGraph.id,
          graphFunctionRef: executive.id,
          graphVectorRef: "graph-t132-" + stage.id,
          sourceNodeKind: stage.sourceKind,
          targetNodeKind: stage.targetKind
        }),
        designCommitments: Object.freeze([
          Object.freeze({
            commitmentRef:
              "design-commitment://t132/disambiguated-design/no-hidden-interpretation",
            formalRequirementRef: stage.authorityRef,
            predicateRef:
              "predicate://t132/design/every-formal-requirement-has-explicit-construction-binding",
            constructionRuleRef:
              "rule://t132/design/disambiguated-construction-syntax",
            targetSyntaxRef:
              "syntax://t132/disambiguated-design/explicit-construction-binding"
          })
        ]),
        disambiguation: Object.freeze({
          ambiguityPolicyRef: "policy://t132/design/no-hidden-interpretation",
          unresolvedRefs: Object.freeze([]),
          forbiddenImplicitInterpretation: true
        }),
        closeFunction: Object.freeze({
          ref: "close://t132/design-syntax/fd-schema-and-fp-assurance",
          requiredPredicates: Object.freeze([
            "all_source_formal_requirements_bound",
            "no_unresolved_ambiguity_refs",
            "construction_rule_refs_present"
          ])
        })
      });
    }

    function assertStringArray(value, label) {
      invariant(Array.isArray(value), label + " must be an array");
      for (const entry of value) {
        invariant(
          typeof entry === "string" && entry.length > 0,
          label + " entries must be non-empty strings"
        );
      }
      return Object.freeze([...value]);
    }

    function parseDesignSyntaxPayload(value, stage) {
      invariant(
        value !== null && typeof value === "object" && !Array.isArray(value),
        "design syntax payload must be an object"
      );
      invariant(value.kind === "gtl_disambiguated_design_syntax", "design syntax kind mismatch");
      invariant(value.schemaVersion === "t132.design_syntax.v1", "design syntax schema version mismatch");
      invariant(typeof value.syntaxRef === "string" && value.syntaxRef.length > 0, "design syntax ref missing");
      invariant(value.targetOutcomeRef === stage.targetOutcomeRef, "design syntax target outcome mismatch");
      const sourceFormalRequirementRefs = assertStringArray(
        value.sourceFormalRequirementRefs,
        "sourceFormalRequirementRefs"
      );
      invariant(
        sourceFormalRequirementRefs.includes(stage.authorityRef),
        "design syntax does not bind source formal requirement authority"
      );
      invariant(
        value.graphEncoding !== null && typeof value.graphEncoding === "object",
        "design syntax graph encoding missing"
      );
      invariant(value.graphEncoding.moduleName === module.name, "design syntax module binding mismatch");
      invariant(value.graphEncoding.graphRef === executiveGraph.id, "design syntax graph binding mismatch");
      invariant(value.graphEncoding.graphFunctionRef === executive.id, "design syntax graph-function binding mismatch");
      invariant(value.graphEncoding.graphVectorRef === "graph-t132-" + stage.id, "design syntax vector binding mismatch");
      invariant(value.graphEncoding.sourceNodeKind === stage.sourceKind, "design syntax source node mismatch");
      invariant(value.graphEncoding.targetNodeKind === stage.targetKind, "design syntax target node mismatch");
      invariant(
        Array.isArray(value.designCommitments) &&
          value.designCommitments.length > 0,
        "design syntax requires commitments"
      );
      for (const commitment of value.designCommitments) {
        invariant(commitment !== null && typeof commitment === "object", "design commitment must be an object");
        invariant(typeof commitment.commitmentRef === "string" && commitment.commitmentRef.length > 0, "design commitment ref missing");
        invariant(commitment.formalRequirementRef === stage.authorityRef, "design commitment authority mismatch");
        invariant(typeof commitment.predicateRef === "string" && commitment.predicateRef.length > 0, "design commitment predicate missing");
        invariant(typeof commitment.constructionRuleRef === "string" && commitment.constructionRuleRef.length > 0, "design commitment construction rule missing");
        invariant(typeof commitment.targetSyntaxRef === "string" && commitment.targetSyntaxRef.length > 0, "design commitment target syntax missing");
      }
      invariant(
        value.disambiguation !== null &&
          typeof value.disambiguation === "object",
        "design syntax disambiguation missing"
      );
      invariant(
        typeof value.disambiguation.ambiguityPolicyRef === "string" &&
          value.disambiguation.ambiguityPolicyRef.length > 0,
        "design syntax ambiguity policy ref missing"
      );
      invariant(Array.isArray(value.disambiguation.unresolvedRefs), "design syntax unresolved refs must be an array");
      invariant(value.disambiguation.unresolvedRefs.length === 0, "design syntax has unresolved ambiguity refs");
      invariant(value.disambiguation.forbiddenImplicitInterpretation === true, "design syntax must forbid implicit interpretation");
      invariant(
        value.closeFunction !== null && typeof value.closeFunction === "object",
        "design syntax close function missing"
      );
      invariant(typeof value.closeFunction.ref === "string" && value.closeFunction.ref.length > 0, "design syntax close function ref missing");
      const requiredPredicates = assertStringArray(
        value.closeFunction.requiredPredicates,
        "closeFunction.requiredPredicates"
      );
      return Object.freeze({
        ...value,
        sourceFormalRequirementRefs,
        graphEncoding: Object.freeze({ ...value.graphEncoding }),
        designCommitments: Object.freeze(
          value.designCommitments.map((commitment) => Object.freeze({ ...commitment }))
        ),
        disambiguation: Object.freeze({
          ...value.disambiguation,
          unresolvedRefs: Object.freeze([...value.disambiguation.unresolvedRefs])
        }),
        closeFunction: Object.freeze({
          ...value.closeFunction,
          requiredPredicates: Object.freeze([...requiredPredicates])
        })
      });
    }

    function validateDesignSyntaxArtifact(stage, artifact) {
      const expected = expectedDesignSyntaxPayload(stage);
      if (expected === null) {
        return Object.freeze({ artifact, validation: null });
      }
      const parsed = parseDesignSyntaxPayload(
        artifact.designSyntaxPayload,
        stage
      );
      invariant(parsed.syntaxRef === expected.syntaxRef, "design syntax ref mismatch");
      invariant(
        parsed.disambiguation.ambiguityPolicyRef ===
          expected.disambiguation.ambiguityPolicyRef,
        "design syntax ambiguity policy mismatch"
      );
      invariant(
        parsed.closeFunction.ref === expected.closeFunction.ref,
        "design syntax close function mismatch"
      );
      for (const predicate of expected.closeFunction.requiredPredicates) {
        invariant(
          parsed.closeFunction.requiredPredicates.includes(predicate),
          "design syntax close predicate missing: " + predicate
        );
      }
      const expectedCommitment = expected.designCommitments[0];
      const matchingCommitment = parsed.designCommitments.find(
        (commitment) =>
          commitment.commitmentRef === expectedCommitment.commitmentRef &&
          commitment.formalRequirementRef ===
            expectedCommitment.formalRequirementRef &&
          commitment.predicateRef === expectedCommitment.predicateRef &&
          commitment.constructionRuleRef ===
            expectedCommitment.constructionRuleRef &&
          commitment.targetSyntaxRef === expectedCommitment.targetSyntaxRef
      );
      invariant(
        matchingCommitment !== undefined,
        "design syntax payload does not carry the declared design commitment"
      );
      return Object.freeze({
        artifact: Object.freeze({
          ...artifact,
          designSyntaxPayload: parsed,
          fdDesignSyntaxValidationRef:
            "fd://t132/" + stage.id + "/design-syntax-schema",
          fdDesignSyntaxSchemaRef:
            "schema://t132/" + stage.id + "/design-syntax-v1"
        }),
        validation: Object.freeze({
          kind: "fd_design_syntax_validation",
          status: "passed",
          validationRef: "fd://t132/" + stage.id + "/design-syntax-schema",
          schemaRef: "schema://t132/" + stage.id + "/design-syntax-v1",
          syntaxRef: parsed.syntaxRef,
          graphVectorRef: parsed.graphEncoding.graphVectorRef,
          targetOutcomeRef: parsed.targetOutcomeRef
        })
      });
    }

    function deterministicEvalArtifact(stage) {
      const designSyntaxPayload = expectedDesignSyntaxPayload(stage);
      return Object.freeze({
        evidenceRef: "evidence://t132/deterministic/" + stage.id,
        gainReportRef: "gain://t132/deterministic/" + stage.id,
        closeDisposition: "close",
        compositionContributionRef: stage.compositionContributionRef,
        reason: stage.semanticTransform + " satisfied by deterministic fixture",
        ...(designSyntaxPayload === null ? {} : { designSyntaxPayload }),
        liveTransportStatus: null
      });
    }

    function livePrompt(stage, pluginInput) {
      const selection = pluginInput.edgeAssuranceResolution;
      const designSyntaxPayload = expectedDesignSyntaxPayload(stage);
      const designSyntaxLine =
        designSyntaxPayload === null
          ? null
          : "  \\"designSyntaxPayload\\": " + JSON.stringify(designSyntaxPayload) + ",";
      return [
        "Return only one JSON object. Do not include markdown or commentary.",
        "You are the ABG T-132 live F_P edge assurance evaluator.",
        "Evaluate only the declared edge assurance contract. Do not claim runtime closure authority.",
        "Edge: " + stage.edgeName,
        "Transform: " + stage.semanticTransform,
        "Selection ref: " + selection.selectionRef,
        "Target outcome: " + selection.contract.targetOutcomeRef,
        "Authority ref: " + stage.authorityRef,
        "Return exactly this JSON shape with these stable refs:",
        "{",
        "  \\"evidenceRef\\": \\"evidence://t132/live/" + stage.id + "\\",",
        "  \\"gainReportRef\\": \\"gain://t132/live/" + stage.id + "\\",",
        "  \\"closeDisposition\\": \\"close\\",",
        "  \\"compositionContributionRef\\": \\"" + stage.compositionContributionRef + "\\",",
        ...(designSyntaxLine === null ? [] : [designSyntaxLine]),
        "  \\"reason\\": \\"declared edge assurance contract satisfied without engine authority fields\\"",
        "}"
      ].join("\\n");
    }

    async function liveEvalArtifact(stage, pluginInput) {
      const agentKey = process.env.ABG_TS_LIVE_AGENT ?? "claude";
      invariant(agentKey === "claude", "T-132 live installed proof only permits Claude");
      const archiveRoot = join(
        EXTERNAL_ARCHIVE_ROOT ??
          join(process.cwd(), ".abiogenesis", "t132-edge-assurance-live"),
        stage.id
      );
      const transport = await runAgentTransport({
        contract: contractForKnownAgent("claude"),
        prompt: livePrompt(stage, pluginInput),
        cwd: process.cwd(),
        archiveRoot,
        label: stage.id,
        timeoutMs: timeoutMs(),
        outputPath: join(archiveRoot, stage.id + "-output.txt"),
        ...executorProfileFields()
      });
      invariant(
        transport.status === 0,
        "live transport failed for " + stage.id + ": " + transport.stderr
      );
      const parsed = extractJsonObject(transport.text);
      invariant(
        parsed.evidenceRef === "evidence://t132/live/" + stage.id,
        "live evidence ref mismatch for " + stage.id
      );
      invariant(
        parsed.gainReportRef === "gain://t132/live/" + stage.id,
        "live gain ref mismatch for " + stage.id
      );
      invariant(parsed.closeDisposition === "close", "live close disposition mismatch");
      invariant(
        parsed.compositionContributionRef === stage.compositionContributionRef,
        "live composition contribution mismatch for " + stage.id
      );
      return Object.freeze({
        evidenceRef: parsed.evidenceRef,
        gainReportRef: parsed.gainReportRef,
        closeDisposition: parsed.closeDisposition,
        compositionContributionRef: parsed.compositionContributionRef,
        ...(parsed.designSyntaxPayload === undefined
          ? {}
          : { designSyntaxPayload: parsed.designSyntaxPayload }),
        reason: parsed.reason,
        liveTransportStatus: transport.status,
        liveTransportFailureClass: transport.failureClass,
        liveTransportTraceResultPath: transport.traceResultPath
      });
    }

    async function evalArtifact(stage, pluginInput) {
      const artifact = LIVE_MODE
        ? await liveEvalArtifact(stage, pluginInput)
        : deterministicEvalArtifact(stage);
      return validateDesignSyntaxArtifact(stage, artifact).artifact;
    }

    const dispatchRecords = [];
    const eventKinds = [];
    const emittedEvents = [];
    const eventSink = (event) => {
      eventKinds.push(event.kind);
      emittedEvents.push(event);
    };

    const plugins = {
      fpDispatch: {
        contract: fpDispatchContract,
        dispatch: async (input) => {
          const stage = stages[input.vectorIndex];
          invariant(stage !== undefined, "unexpected vector index " + input.vectorIndex);
          invariant(
            input.edgeAssuranceResolution.kind === "edge_assurance_contract_selection",
            "runner plugin input did not carry selected edge assurance for " + stage.id
          );
          invariant(
            input.edgeAssuranceResolution.source === "graph_vector_declarations",
            "edge assurance selection must come from the graph vector for " + stage.id
          );
          const artifact = await evalArtifact(stage, input);
          dispatchRecords.push({ stage, pluginInput: input, artifact });
          return constructFpDispatchOutcome({
            status: "dispatched",
            resultRef: artifact.evidenceRef,
            evidenceRefs: [input.sourceProjectionRef, artifact.evidenceRef],
            attachedResultArtifact: null
          });
        }
      }
    };

    function hookActionFor(record, suffix = "eval") {
      const selection = record.pluginInput.edgeAssuranceResolution;
      return constructHookActionRecord({
        hookActionRef: "hook-action://t132/" + record.stage.id + "/" + suffix,
        hookClass: "eval",
        hookContractRef: selection.contract.evalFpContractRef,
        pluginRef: fpDispatchContract.ref,
        inputBasisRefs: [
          selection.selectionRef,
          record.pluginInput.sourceProjectionRef,
          record.pluginInput.actorInvocationRef.actorInvocationId
        ],
        policyRefs: selection.contract.policyRefs,
        configRefs: [selection.contract.configDigest],
        returnedFindingRefs: ["finding://t132/" + record.stage.id + "/" + suffix],
        admissionRefs: ["admission://t132/" + record.stage.id + "/" + suffix],
        predecessorRefs: [
          record.pluginInput.sourceProjectionRef,
          record.pluginInput.actorInvocationRef.actorInvocationId
        ],
        outputSurfaceRef: "assurance://t132/" + record.stage.id
      });
    }

    function findingFor(record, hookAction, suffix = "eval") {
      const selection = record.pluginInput.edgeAssuranceResolution;
      return admitFpEdgeAssuranceEvalFinding({
        kind: "fp_edge_assurance_eval_finding",
        findingRef: "finding://t132/" + record.stage.id + "/" + suffix,
        hookActionRef: hookAction.hookActionRef,
        edgeAssuranceSelectionRef: selection.selectionRef,
        evalFpContractRef: selection.contract.evalFpContractRef,
        gainReportRef: record.artifact.gainReportRef,
        metricRefs: ["metric://t132/" + record.stage.id],
        closeDisposition: record.artifact.closeDisposition,
        residualPressureRefs: ["residual://t132/" + record.stage.id],
        continuationRefs: ["continuation://t132/" + record.stage.id],
        evidenceRefs: [record.artifact.evidenceRef],
        authorityRefs: [record.stage.authorityRef],
        compositionContributionRef: record.artifact.compositionContributionRef,
        reason: record.artifact.reason
      });
    }

    function admissionFor(record, hookAction, finding, suffix = "eval") {
      return constructHookFindingAdmission({
        admissionRef: "admission://t132/" + record.stage.id + "/" + suffix,
        hookActionRef: hookAction.hookActionRef,
        findingRef: finding.findingRef,
        status: "admitted",
        owningSurfaceRef: "assurance://t132/" + record.stage.id,
        evidenceRefs: finding.evidenceRefs,
        policyRefs: record.pluginInput.edgeAssuranceResolution.contract.policyRefs,
        predecessorRefs: [hookAction.hookActionRef, record.artifact.evidenceRef]
      });
    }

    function payloadPair({ record, payloadRef, payloadClass, contractRef, value }) {
      const digest = digestFor(value);
      return [
        constructPayloadObservedEvent({
          basis,
          vectorIndex: record.pluginInput.vectorIndex,
          payloadRef,
          payloadClass,
          contractRef,
          digest,
          producerRef: fpDispatchContract.ref,
          sourceEventRef: record.pluginInput.actorInvocationRef.dispatchRef,
          actorInvocationId: record.pluginInput.actorInvocationRef.actorInvocationId,
          authorityRef: record.stage.authorityRef,
          inputDigest: "input-digest://t132/" + record.stage.id,
          policyRefs: record.pluginInput.edgeAssuranceResolution.contract.policyRefs
        }),
        constructPayloadValidatedEvent({
          basis,
          vectorIndex: record.pluginInput.vectorIndex,
          payloadRef,
          contractRef,
          digest,
          validationRef: "validation://t132/" + record.stage.id + "/" + payloadClass,
          policyRefs: record.pluginInput.edgeAssuranceResolution.contract.policyRefs
        })
      ];
    }

    function assuranceRuntimeEventsFor(
      record,
      hookAction,
      finding,
      admission,
      suffix = "eval"
    ) {
      const evidencePayloadRef =
        "payload://t132/" + record.stage.id + "/evidence/" + suffix;
      return [
        constructAuthoritySnapshotAdmittedEvent({
          basis,
          vectorIndex: record.pluginInput.vectorIndex,
          authoritySnapshotRef:
            "authority-snapshot://t132/" + record.stage.id + "/" + suffix,
          authorityRefs: [record.stage.authorityRef],
          inputRefs: [record.stage.inputRef],
          authorityDigest: "authority-digest://t132/" + record.stage.id,
          inputDigest: "input-digest://t132/" + record.stage.id,
          deferredAuthorityRefs: record.artifact.deferredAuthorityRefs ?? [],
          providerRefs: ["provider://t132/authority"],
          policyRefs: record.pluginInput.edgeAssuranceResolution.contract.policyRefs
        }),
        ...payloadPair({
          record,
          payloadRef: hookAction.hookActionRef,
          payloadClass: "hook_action_record",
          contractRef: hookAction.hookContractRef,
          value: hookAction
        }),
        ...payloadPair({
          record,
          payloadRef: finding.findingRef,
          payloadClass: "fp_edge_assurance_eval_finding",
          contractRef: finding.evalFpContractRef,
          value: finding
        }),
        ...payloadPair({
          record,
          payloadRef: admission.admissionRef,
          payloadClass: "hook_finding_admission",
          contractRef: hookAction.hookContractRef,
          value: admission
        }),
        ...payloadPair({
          record,
          payloadRef: evidencePayloadRef,
          payloadClass: "edge_assurance_evidence",
          contractRef:
            record.pluginInput.edgeAssuranceResolution.contract
              .evalExpectedOutputContractRef,
          value: record.artifact
        }),
        constructPayloadValidatedEvent({
          basis,
          vectorIndex: record.pluginInput.vectorIndex,
          payloadRef: evidencePayloadRef,
          contractRef:
            record.pluginInput.edgeAssuranceResolution.contract
              .evalExpectedOutputContractRef,
          digest: digestFor(record.artifact),
          validationRef: "validation://t132/" + record.stage.id + "/evidence-admission",
          evidenceRef: record.artifact.evidenceRef,
          policyRefs: record.pluginInput.edgeAssuranceResolution.contract.policyRefs
        }),
        constructEvidenceAdmittedEvent({
          basis,
          vectorIndex: record.pluginInput.vectorIndex,
          evidenceRef: record.artifact.evidenceRef,
          payloadRef: evidencePayloadRef,
          authorityRef: record.stage.authorityRef,
          authorityDigest: "authority-digest://t132/" + record.stage.id,
          inputDigest: "input-digest://t132/" + record.stage.id,
          providerRefs: ["provider://t132/evidence"],
          policyRefs: record.pluginInput.edgeAssuranceResolution.contract.policyRefs,
          shallow: record.artifact.shallow === true,
          deferred: record.artifact.deferred === true
        })
      ];
    }

    function projectEdgeAssurance(record, runtimeEvents, suffix = "eval") {
      const hookAction = hookActionFor(record, suffix);
      const finding = findingFor(record, hookAction, suffix);
      const admission = admissionFor(record, hookAction, finding, suffix);
      assertFpEdgeAssuranceEvalFindingMatchesHookAction({
        hookAction,
        selection: record.pluginInput.edgeAssuranceResolution,
        finding,
        admission
      });
      const admittedEvents = emit(
        assuranceRuntimeEventsFor(record, hookAction, finding, admission, suffix),
        eventSink
      );
      const nextRuntimeEvents = Object.freeze([...runtimeEvents, ...admittedEvents]);
      const runtimeProjection = deriveRuntimeAggregateProjection(
        basis,
        nextRuntimeEvents
      );
      const assuranceScope = deriveAssuranceScopeRef({
        basis,
        projection: runtimeProjection,
        vectorIndex: record.pluginInput.vectorIndex
      });
      const payloadLedger = derivePayloadLedgerProjection({
        basis,
        runtimeProjection,
        events: nextRuntimeEvents,
        vectorIndex: record.pluginInput.vectorIndex
      });
      const authoritySnapshot =
        deriveAssuranceAuthoritySnapshotFromPayloadLedger({
          assuranceScope,
          ledger: payloadLedger
        });
      const evidenceRows = deriveAssuranceEvidenceRowsFromPayloadLedger({
        assuranceScope,
        ledger: payloadLedger
      });
      const assuranceProjection = deriveAssuranceProjection({
        basis,
        runtimeProjection,
        authoritySnapshot,
        evidenceRows
      });
      const closureDecision = deriveAssuranceClosureDecision(assuranceProjection);
      const edgeProjection = deriveEdgeAssuranceEvaluationProjection({
        selection: record.pluginInput.edgeAssuranceResolution,
        hookAction,
        admission,
        finding,
        assuranceProjection,
        closureDecision
      });
      const readModel = deriveEdgeAssuranceEvaluationReadModel({
        projection: edgeProjection
      });
      return Object.freeze({
        suffix,
        runtimeEvents: nextRuntimeEvents,
        hookAction,
        finding,
        admission,
        payloadLedger,
        assuranceProjection,
        closureDecision,
        edgeProjection,
        readModel
      });
    }

    function variantRecord(record, variant) {
      return Object.freeze({
        ...record,
        artifact: Object.freeze({
          evidenceRef: "evidence://t132/" + variant.suffix + "/" + record.stage.id,
          gainReportRef: "gain://t132/" + variant.suffix + "/" + record.stage.id,
          closeDisposition: variant.closeDisposition,
          compositionContributionRef: record.stage.compositionContributionRef,
          reason: variant.reason,
          shallow: variant.shallow === true,
          deferred: variant.deferred === true,
          deferredAuthorityRefs:
            variant.deferred === true ? [record.stage.authorityRef] : []
        })
      });
    }

    function canCloseCompound(projections) {
      const required = new Set(stages.map((stage) => stage.id));
      const closed = new Set();
      const contributions = [];
      for (const projection of projections) {
        if (projection.assuranceClosureDecision !== "close") {
          continue;
        }
        const stage = stages.find((candidate) =>
          projection.compositionContributionRef ===
            candidate.compositionContributionRef
        );
        if (stage !== undefined) {
          closed.add(stage.id);
        }
        contributions.push(projection.compositionContributionRef);
      }
      return {
        close:
          closed.size === required.size &&
          contributions.length === stages.length,
        contributions
      };
    }

    function expectThrows(label, fn, pattern) {
      try {
        fn();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (pattern.test(message)) {
          return label;
        }
        throw new Error(label + " threw wrong error: " + message);
      }
      throw new Error(label + " did not throw");
    }

    function negativeChecks(edgeFacts) {
      const first = edgeFacts[0];
      const second = edgeFacts[1];
      const checks = [];
      checks.push(
        expectThrows(
          "returned finding without recorded hook action fails closed",
          () =>
            assertFpEdgeAssuranceEvalFindingMatchesHookAction({
              hookAction: constructHookActionRecord({
                ...first.hookAction,
                returnedFindingRefs: []
              }),
              selection: first.record.pluginInput.edgeAssuranceResolution,
              finding: first.finding
            }),
          /findingRef was not returned/i
        )
      );
      checks.push(
        expectThrows(
          "unrecorded admission fails closed",
          () =>
            assertFpEdgeAssuranceEvalFindingMatchesHookAction({
              hookAction: first.hookAction,
              selection: first.record.pluginInput.edgeAssuranceResolution,
              finding: first.finding,
              admission: constructHookFindingAdmission({
                ...first.admission,
                admissionRef: "admission://t132/not-recorded"
              })
            }),
          /admissionRef is not recorded/i
        )
      );
      checks.push(
        expectThrows(
          "rejected finding cannot feed projection",
          () =>
            deriveEdgeAssuranceEvaluationProjection({
              selection: first.record.pluginInput.edgeAssuranceResolution,
              hookAction: first.hookAction,
              admission: constructHookFindingAdmission({
                ...first.admission,
                status: "rejected"
              }),
              finding: first.finding,
              assuranceProjection: first.assuranceProjection,
              closureDecision: first.closureDecision
            }),
          /requires an admitted hook finding/i
        )
      );
      checks.push(
        expectThrows(
          "unadmitted evidence cannot feed projection",
          () =>
            deriveEdgeAssuranceEvaluationProjection({
              selection: first.record.pluginInput.edgeAssuranceResolution,
              hookAction: first.hookAction,
              admission: first.admission,
              finding: admitFpEdgeAssuranceEvalFinding({
                ...first.finding,
                evidenceRefs: ["evidence://t132/unadmitted"]
              }),
              assuranceProjection: first.assuranceProjection,
              closureDecision: first.closureDecision
            }),
          /unadmitted ref/i
        )
      );
      checks.push(
        expectThrows(
          "side-door closure authority fields fail closed",
          () =>
            admitFpEdgeAssuranceEvalFinding({
              ...first.finding,
              closureDecision: "close"
            }),
          /cannot own engine authority/i
        )
      );
      checks.push(
        expectThrows(
          "lineage drift between selection and finding fails closed",
          () =>
            deriveEdgeAssuranceEvaluationProjection({
              selection: second.record.pluginInput.edgeAssuranceResolution,
              hookAction: first.hookAction,
              admission: first.admission,
              finding: first.finding,
              assuranceProjection: first.assuranceProjection,
              closureDecision: first.closureDecision
            }),
          /selectionRef does not match selection/i
        )
      );
      invariant(
        canCloseCompound([first.edgeProjection]).close === false,
        "premature local close was treated as compound close"
      );
      checks.push("premature compound close rejected");
      invariant(
        canCloseCompound([first.edgeProjection, edgeFacts[2].edgeProjection])
          .close === false,
        "missing intermediate contribution was treated as compound close"
      );
      checks.push("missing intermediate edge contribution rejected");
      return checks;
    }

    const materializedVectorNames = executiveGraph.vectors.map(
      (vector) => vector.name
    );
    let runtimeEvents = Object.freeze([]);
    const edgeFacts = [];

    for (let index = 0; index < stages.length; index += 1) {
      const beforeRecordCount = dispatchRecords.length;
      const result = await runEngineIterateAsync({
        basis,
        runtimeEvents,
        eventSink,
        plugins
      });
      const runnerReplayEvents = result.replayEvents;
      runtimeEvents = result.replayEvents;
      invariant(
        dispatchRecords.length === beforeRecordCount + 1,
        "runner did not call fp dispatch for stage " + index
      );
      const record = dispatchRecords[index];
      const transition = deriveAdvancementTransition(basis, runtimeEvents);
      const dispatchRequest = dispatchRequestsForTransition(transition)[0];
      invariant(
        record.pluginInput.edge === stages[index].edgeName,
        "plugin input edge mismatch for stage " + index
      );
      invariant(
        dispatchRequest.expectedEdge === stages[index].edgeName,
        "dispatch request edge mismatch for stage " + index
      );
      const projected = projectEdgeAssurance(record, runtimeEvents);
      runtimeEvents = projected.runtimeEvents;
      const closeEvents = emit(
        [
          constructVectorEvaluatedEvent({
            basis,
            vectorIndex: index,
            status: "accepted"
          }),
          constructVectorClosedEvent({
            basis,
            vectorIndex: index,
            closureKind: "assessed"
          })
        ],
        eventSink
      );
      runtimeEvents = Object.freeze([...runtimeEvents, ...closeEvents]);
      edgeFacts.push({ record, runnerReplayEvents, ...projected });
    }

    const finalProjection = deriveRuntimeAggregateProjection(basis, runtimeEvents);
    const compound = canCloseCompound(
      edgeFacts.map((fact) => fact.edgeProjection)
    );
    const retryVariant = projectEdgeAssurance(
      variantRecord(edgeFacts[0].record, {
        suffix: "retry",
        closeDisposition: "close",
        shallow: true,
        reason: "shallow evidence forces replay-derived retry despite proposed close"
      }),
      edgeFacts[0].runnerReplayEvents,
      "retry"
    );
    const qualifiedDeferVariant = projectEdgeAssurance(
      variantRecord(edgeFacts[1].record, {
        suffix: "qualified-defer",
        closeDisposition: "qualified_defer",
        deferred: true,
        reason: "authority is lawfully deferred by replay-derived policy"
      }),
      edgeFacts[1].runnerReplayEvents,
      "qualified-defer"
    );
    const nextActionVariantReadModels = Object.freeze({
      retry: retryVariant.readModel,
      qualifiedDefer: qualifiedDeferVariant.readModel
    });
    const reconstructed = edgeFacts.map((fact) => {
      const actionByRef = new Map([[fact.hookAction.hookActionRef, fact.hookAction]]);
      const admissionByRef = new Map([[fact.admission.admissionRef, fact.admission]]);
      const findingByRef = new Map([[fact.finding.findingRef, fact.finding]]);
      const hookAction = actionByRef.get(fact.edgeProjection.hookActionRef);
      const admission = admissionByRef.get(fact.edgeProjection.admissionRef);
      const finding = findingByRef.get(fact.edgeProjection.findingRef);
      return (
        hookAction !== undefined &&
        admission !== undefined &&
        finding !== undefined &&
        admission.predecessorRefs.includes(hookAction.hookActionRef) &&
        finding.hookActionRef === hookAction.hookActionRef &&
        fact.readModel.projectionRef === fact.edgeProjection.projectionRef
      );
    });
    const ledgerPayloadRefsByStage = edgeFacts.map((fact) =>
      fact.payloadLedger.observedPayloads.map((event) => event.payloadRef)
    );
    const designSyntaxFacts = edgeFacts
      .filter((fact) => fact.record.artifact.designSyntaxPayload !== undefined)
      .map((fact) => ({
        edge: fact.record.stage.edgeName,
        kind: fact.record.artifact.designSyntaxPayload.kind,
        schemaVersion: fact.record.artifact.designSyntaxPayload.schemaVersion,
        syntaxRef: fact.record.artifact.designSyntaxPayload.syntaxRef,
        fdValidationRef: fact.record.artifact.fdDesignSyntaxValidationRef,
        schemaRef: fact.record.artifact.fdDesignSyntaxSchemaRef,
        graphVectorRef:
          fact.record.artifact.designSyntaxPayload.graphEncoding.graphVectorRef,
        unresolvedRefCount:
          fact.record.artifact.designSyntaxPayload.disambiguation.unresolvedRefs
            .length,
        commitmentCount:
          fact.record.artifact.designSyntaxPayload.designCommitments.length,
        closeFunctionRef:
          fact.record.artifact.designSyntaxPayload.closeFunction.ref
      }));
    const checks = negativeChecks(edgeFacts);

    console.log(JSON.stringify({
      mode: LIVE_MODE ? "live" : "deterministic",
      installedPackageSurface: true,
      exportedSurface: Object.keys(await import("../bootstrap/index.mjs")).sort(),
      target: "graph_function:" + executive.name,
      semanticChain: stages.map((stage) => ({
        edge: stage.edgeName,
        transform: stage.semanticTransform,
        authorityRef: stage.authorityRef,
        targetOutcomeRef: stage.targetOutcomeRef
      })),
      materializedVectorNames,
      stageCount: stages.length,
      finalClosedVectorIndexes: finalProjection.closedVectorIndexes,
      pluginResolutionKinds: edgeFacts.map(
        (fact) => fact.record.pluginInput.edgeAssuranceResolution.kind
      ),
      pluginResolutionSources: edgeFacts.map(
        (fact) => fact.record.pluginInput.edgeAssuranceResolution.source
      ),
      selectedContractOutcomeRefs: edgeFacts.map(
        (fact) =>
          fact.record.pluginInput.edgeAssuranceResolution.contract.targetOutcomeRef
      ),
      hookActionRefs: edgeFacts.map((fact) => fact.hookAction.hookActionRef),
      findingRefs: edgeFacts.map((fact) => fact.finding.findingRef),
      admissionRefs: edgeFacts.map((fact) => fact.admission.admissionRef),
      readModels: edgeFacts.map((fact) => fact.readModel),
      closureDecisions: edgeFacts.map((fact) => fact.closureDecision.decision),
      nextActionVariantDecisions: {
        retry: retryVariant.closureDecision.decision,
        qualifiedDefer: qualifiedDeferVariant.closureDecision.decision
      },
      nextActionVariantBasisRefs: {
        retry: retryVariant.readModel.nextActionBasisRefs,
        qualifiedDefer: qualifiedDeferVariant.readModel.nextActionBasisRefs
      },
      nextActionVariantReadModels,
      projectionRefs: edgeFacts.map((fact) => fact.edgeProjection.projectionRef),
      ledgerPayloadRefsByStage,
      designSyntaxFacts,
      reconstructed,
      compound,
      prematureCompoundCloseRejected:
        canCloseCompound([edgeFacts[0].edgeProjection]).close === false,
      missingIntermediateRejected:
        canCloseCompound([
          edgeFacts[0].edgeProjection,
          edgeFacts[2].edgeProjection
        ]).close === false,
      negativeChecks: checks,
      eventKinds,
      liveArtifacts: edgeFacts.map((fact) => ({
        stageId: fact.record.stage.id,
        transportStatus: fact.record.artifact.liveTransportStatus,
        transportFailureClass: fact.record.artifact.liveTransportFailureClass ?? null,
        traceResultPath: fact.record.artifact.liveTransportTraceResultPath ?? null
      }))
    }));
  `;
}
