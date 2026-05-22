import { edge, graphFunctionForVector } from "../../../build/semantic/code/src/gtl/m01/algebra/core.js";
import { admitNode } from "../../../build/semantic/code/src/gtl/m01/admission/carriers.js";
import { admitModule } from "../../../build/semantic/code/src/gtl/m02/admission/carriers.js";
import {
  ABG_FN_COMPOSITION_DECLARATION_KEY,
  admitExecutionBasis,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  admitStartIntent
} from "../../../build/semantic/code/src/abg/m03/index.js";
import {
  constructFixtureJobPayload,
  constructFixtureModulePayload,
  constructFixtureNodePayload,
  constructProofFixtureProfile,
  constructResolvedPolicyIdentityPayload,
  constructReviewerRolePayload,
  constructRuntimeIdentityPayload
} from "../../../build/semantic/code/src/shared/abg_library/index.js";

const FP_PROFILE = constructProofFixtureProfile({
  kind: "m03_transport_profile",
  publishedWork: {
    moduleName: "abiogenesis.runtime_library",
    graphFunctionName: "fp_profile",
    jobName: "fp_profile_job"
  },
  runtimeContext: {
    workerId: "worker://typescript-steel-thread",
    backendId: "backend://node",
    resolvedPolicyBundleRef: "policy://fp-default"
  }
});

function scalarEntry(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({ kind: "scalar", value })
  });
}

function stringListEntry(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({ kind: "string_list", value: Object.freeze([...value]) })
  });
}

function jsonValue(value) {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (Array.isArray(value)) {
    return Object.freeze({
      kind: "array",
      items: Object.freeze(value.map(jsonValue))
    });
  }
  return Object.freeze({
    kind: "object",
    entries: Object.freeze(
      Object.entries(value).map(([key, entryValue]) =>
        Object.freeze({ key, value: jsonValue(entryValue) })
      )
    )
  });
}

function jsonEntry(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({ kind: "json_blob", value: jsonValue(value) })
  });
}

function fnCompositionDeclarations() {
  return Object.freeze({
    entries: Object.freeze([
      Object.freeze({
        key: ABG_FN_COMPOSITION_DECLARATION_KEY,
        value: Object.freeze({
          kind: "hook_ref",
          value: Object.freeze({
            ref: "hook://m03-fp/abg-fn-composition",
            config: Object.freeze({
              entries: Object.freeze([
                scalarEntry("contract_ref", "abg.fn_composition://m03-fp/default"),
                stringListEntry("standards_context_refs", ["standard://m03-fp"]),
                stringListEntry("policy_context_refs", ["policy://m03-fp"]),
                stringListEntry("carrier_context_refs", ["carrier://m03-fp"]),
                stringListEntry("assurance_context_refs", ["assurance://m03-fp"]),
                scalarEntry("closure_contract_ref", "closure://m03-fp/fd-evaluate"),
                jsonEntry("regime_bindings", [
                  {
                    bindingRef: "regime-binding://m03-fp/transform/fp",
                    stageRole: "transform",
                    regime: "F_P",
                    role: "construct",
                    order: 0,
                    authority: "evidence",
                    inputCarrierRefs: ["EnginePluginInput"],
                    outputCarrierRefs: ["FpDispatchOutcome"],
                    evidenceRefs: ["evidence://m03-fp/fp-transform"]
                  },
                  {
                    bindingRef: "regime-binding://m03-fp/evaluate/fd",
                    stageRole: "evaluate",
                    regime: "F_D",
                    role: "validate",
                    order: 1,
                    authority: "closure",
                    inputCarrierRefs: ["EnginePluginInput"],
                    outputCarrierRefs: ["FdEvaluationOutcome"],
                    evidenceRefs: ["evidence://m03-fp/fd-evaluate"]
                  },
                  {
                    bindingRef: "regime-binding://m03-fp/evaluate/fp",
                    stageRole: "evaluate",
                    regime: "F_P",
                    role: "validate",
                    order: 2,
                    authority: "judgment",
                    inputCarrierRefs: ["EnginePluginInput"],
                    outputCarrierRefs: ["FpEdgeAssuranceEvalFinding"],
                    evidenceRefs: ["evidence://m03-fp/fp-evaluate"]
                  },
                  {
                    bindingRef: "regime-binding://m03-fp/consequence/fd",
                    stageRole: "consequence",
                    regime: "F_D",
                    role: "observe",
                    order: 3,
                    authority: "evidence",
                    inputCarrierRefs: ["EnginePluginInput"],
                    outputCarrierRefs: ["ConsequenceProjectionOutcome"],
                    evidenceRefs: ["evidence://m03-fp/consequence"]
                  },
                  {
                    bindingRef: "regime-binding://m03-fp/human-callout/fh",
                    stageRole: "human_callout",
                    regime: "F_H",
                    role: "escalate",
                    order: 4,
                    authority: "judgment",
                    inputCarrierRefs: ["EnginePluginInput"],
                    outputCarrierRefs: ["FhAdmissionOutcome"],
                    evidenceRefs: ["evidence://m03-fp/fh-callout"]
                  }
                ])
              ])
            })
          })
        })
      })
    ])
  });
}

function designNode(overrides = {}) {
  return {
    ...constructFixtureNodePayload({
      id: "node-m03-design",
      name: "Design",
      assetKind: "design",
      schemaRef: "Vector[design]",
      standardsRefs: ["design-standard"],
      outputContractRefs: ["design-contract"],
      tags: ["input"]
    }),
    ...overrides
  };
}

function codeNode(overrides = {}) {
  return {
    ...constructFixtureNodePayload({
      id: "node-m03-code",
      name: "Code",
      assetKind: "code",
      schemaRef: "Vector[code]",
      standardsRefs: ["code-standard"],
      outputContractRefs: ["code-contract"],
      tags: ["output"],
      markov: ["implemented"]
    }),
    ...overrides
  };
}

function reviewerRolePayload(overrides = {}) {
  return {
    ...constructReviewerRolePayload({
      id: "role-reviewer-m03",
      scope: "runtime_review"
    }),
    ...overrides
  };
}

function publishedProfile({
  id = "graph-function-fp-profile",
  name = "fp_profile",
  graphId = "graph-m03-fp",
  graphName = "design→code:fp",
  declarations = fnCompositionDeclarations(),
  design = admitNode(designNode()),
  code = admitNode(codeNode())
} = {}) {
  return graphFunctionForVector(
    edge([design], code, {
      id: graphId,
      name: graphName,
      evaluators: [
        {
          name: "code_complete",
          regime: "F_P",
          description: "code satisfies the declared contract",
          binding: "binding://fp/code_complete",
          tags: ["fulfillment"]
        }
      ],
      declarations
    }).vectors[0],
    {
      id,
      name,
      declarations
    }
  );
}

function modulePayload({ moduleName, graphFunctions, jobs, roles = [reviewerRolePayload()] }) {
  return constructFixtureModulePayload({
    profile: constructProofFixtureProfile({
      ...FP_PROFILE,
      publishedWork: {
        ...FP_PROFILE.publishedWork,
        moduleName
      }
    }),
    graphFunctions,
    jobs,
    rolePayload: roles[0]
  });
}

function jobPayload({ id, name, graphFunctionId, roles = [reviewerRolePayload()] }) {
  return constructFixtureJobPayload({
    id,
    name,
    graphFunctionId,
    rolePayload: roles[0]
  });
}

export function buildFpBasis({
  moduleName = FP_PROFILE.publishedWork.moduleName,
  dispatchRef = "dispatch://codex"
} = {}) {
  const profile = publishedProfile();
  const module = admitModule(
    modulePayload({
      moduleName,
      graphFunctions: [profile],
      jobs: [
        jobPayload({
          id: "job-fp-profile",
          name: "fp_profile_job",
          graphFunctionId: profile.id
        })
      ]
    })
  );

  const basis = admitExecutionBasis({
    startIntent: admitStartIntent({
      scope: {
        kind: "workspace",
        workspaceRoot: "/workspace/demo",
        moduleName
      },
      target: {
        kind: "graph_function",
        handle: profile.name
      },
      until: "converged"
    }),
    module,
    runtimeIdentity: admitResolvedRuntimeIdentity(
      constructRuntimeIdentityPayload({
        profile: FP_PROFILE,
        resolvedRuntimeRef: "runtime://typescript/node"
      })
    ),
    resolvedPolicy: admitResolvedPolicyIdentity(
      constructResolvedPolicyIdentityPayload({
        profile: FP_PROFILE,
        defaultRegime: "F_P",
        dispatchRef
      })
    ),
    runId: "run://fp"
  });

  return { basis, module, profile };
}
