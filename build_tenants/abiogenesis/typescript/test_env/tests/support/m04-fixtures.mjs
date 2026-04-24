import { edge, graphFunctionForVector } from "../../../build/semantic/code/src/gtl/m01/algebra/core.js";
import { admitNode } from "../../../build/semantic/code/src/gtl/m01/admission/carriers.js";
import { admitModule } from "../../../build/semantic/code/src/gtl/m02/admission/carriers.js";
import {
  admitExecutionBasis,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity
} from "../../../build/semantic/code/src/abg/m03/index.js";
import {
  deriveAdvancementTransition,
  dispatchRequestsForTransition
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

const PUBLIC_RUNTIME_PROFILE = constructProofFixtureProfile({
  kind: "m04_public_runtime_profile",
  publishedWork: {
    moduleName: "abiogenesis.public_runtime",
    graphFunctionName: "public_profile",
    jobName: "public_profile_job"
  },
  runtimeContext: {
    workerId: "worker://typescript-public-start",
    backendId: "backend://node",
    resolvedPolicyBundleRef: "policy://public-fd"
  }
});

function designNode(overrides = {}) {
  return {
    ...constructFixtureNodePayload({
      id: "node-m04-shared-design",
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

export function fpDispatchRequest(overrides = {}) {
  const profile = publishedProfile({
    id: "graph-function-m04-result-profile",
    name: "result_profile",
    graphId: "graph-m04-result-profile",
    graphName: "design→code:result-profile"
  });
  const module = admitRuntimeModule({
    graphFunctions: [profile],
    jobs: [
      jobPayload({
        id: "job-m04-result-profile",
        name: "result_profile_job",
        graphFunctionId: profile.id
      })
    ]
  });
  const basis = {
    startIntent: {
      scope: {
        kind: "workspace",
        workspaceRoot: "/workspace/demo",
        moduleName: PUBLIC_RUNTIME_PROFILE.publishedWork.moduleName
      },
      target: {
        kind: "graph_function",
        handle: "result_profile"
      },
      until: "converged"
    },
    module,
    runtimeIdentity: runtimeIdentity(),
    resolvedPolicy: admitResolvedPolicyIdentity(
      Object.freeze({
        ...constructResolvedPolicyIdentityPayload({
          profile: PUBLIC_RUNTIME_PROFILE,
          defaultRegime: "F_P",
          dispatchRef: "dispatch://codex"
        })
      })
    ),
    runId: "run://m04-result"
  };
  const transition = deriveAdvancementTransition(admitExecutionBasis(basis));
  return {
    ...dispatchRequestsForTransition(transition)[0],
    ...overrides
  };
}

export function resultArtifactPayload(dispatchRequest, overrides = {}) {
  const assessmentIds = dispatchRequest.expectedAssessmentIds.length > 0
    ? dispatchRequest.expectedAssessmentIds
    : ["code_complete"];
  return {
    edge: dispatchRequest.expectedEdge ?? "design→code",
    actor: "codex",
    fulfillment_assessments: assessmentIds.map((assessmentId) => ({
      id: assessmentId,
      evaluator: assessmentId,
      fulfillment_status: "fulfilled",
      fulfillment_detail: "fp result accepted",
      blocking_reasons: [],
      evidence_refs: ["proof://runtime"]
    })),
    selected_worker_id: dispatchRequest.workerId,
    selected_backend: dispatchRequest.backendId,
    role_id: "role://runtime",
    assignment_source: "policy_resolution",
    resolved_runtime_ref: "runtime://typescript/node",
    ...overrides
  };
}

export function resultAssessmentPayload(dispatchRequest, overrides = {}) {
  const manifest_provenance = {
    spec_hash: "spec://typescript-dev",
    manifest_id: "manifest://m04-result-profile",
    workflow_version: "wf://typescript-dev",
    run_id: "run://m04-result",
    work_key: "wk://m04-result",
    authority_ref: "authority://runtime",
    selected_worker_id: dispatchRequest.workerId,
    selected_backend: dispatchRequest.backendId,
    role_id: "role://runtime",
    assignment_source: "policy_resolution",
    resolved_runtime_ref: "runtime://typescript/node"
  };
  const published_ledger_ref = {
    ref: "ledger://m04-result-profile"
  };

  return {
    kind: "fp_assessed",
    dispatch_request: dispatchRequest,
    result_artifact: resultArtifactPayload(dispatchRequest),
    manifest_provenance:
      overrides.manifest_provenance ?? manifest_provenance,
    published_ledger_ref:
      overrides.published_ledger_ref ?? published_ledger_ref,
    ...overrides
  };
}

function codeNode(overrides = {}) {
  return {
    ...constructFixtureNodePayload({
      id: "node-m04-shared-code",
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
      id: "role-reviewer-m04-shared",
      scope: "public_runtime"
    }),
    ...overrides
  };
}

export function publishedProfile({ id, name, graphId, graphName }) {
  const design = admitNode(designNode());
  const code = admitNode(codeNode());
  return graphFunctionForVector(
    edge([design], code, {
      id: graphId,
      name: graphName,
      declarations: { entries: [] }
    }).vectors[0],
    {
      id,
      name,
      declarations: { entries: [] }
    }
  );
}

export function modulePayload({ moduleName, graphFunctions, jobs }) {
  return constructFixtureModulePayload({
    profile: constructProofFixtureProfile({
      ...PUBLIC_RUNTIME_PROFILE,
      publishedWork: {
        ...PUBLIC_RUNTIME_PROFILE.publishedWork,
        moduleName
      }
    }),
    graphFunctions,
    jobs,
    rolePayload: reviewerRolePayload()
  });
}

export function jobPayload({ id, name, graphFunctionId }) {
  return constructFixtureJobPayload({
    id,
    name,
    graphFunctionId,
    rolePayload: reviewerRolePayload()
  });
}

export function admitRuntimeModule({
  moduleName = PUBLIC_RUNTIME_PROFILE.publishedWork.moduleName,
  graphFunctions,
  jobs
}) {
  return admitModule(
    modulePayload({
      moduleName,
      graphFunctions,
      jobs
    })
  );
}

export function emptyModule() {
  return admitRuntimeModule({
    graphFunctions: [],
    jobs: []
  });
}

export function runtimeIdentity() {
  return admitResolvedRuntimeIdentity(
    constructRuntimeIdentityPayload({
      profile: PUBLIC_RUNTIME_PROFILE,
      resolvedRuntimeRef: "runtime://typescript/node"
    })
  );
}

export function resolvedPolicyIdentity(overrides = {}) {
  return admitResolvedPolicyIdentity(
    Object.freeze({
      ...constructResolvedPolicyIdentityPayload({
        profile: PUBLIC_RUNTIME_PROFILE,
        defaultRegime: "F_D"
      }),
      ...overrides
    })
  );
}

export function requestPayload(handle, overrides = {}) {
  return {
    scope: {
      kind: "workspace",
      workspaceRoot: "/workspace/demo",
      moduleName: PUBLIC_RUNTIME_PROFILE.publishedWork.moduleName
    },
    target: {
      kind: "graph_function",
      handle
    },
    until: "converged",
    ...overrides
  };
}

export function publicStartContext({
  handle = "public_profile",
  policyOverrides = {},
  runId = "run://m04-live",
  workKey = "wk://m04-live"
} = {}) {
  const profile = publishedProfile({
    id: `graph-function-${handle}`,
    name: handle,
    graphId: `graph-${handle}`,
    graphName: `design→code:${handle}`
  });
  const module = admitRuntimeModule({
    graphFunctions: [profile],
    jobs: [
      jobPayload({
        id: `job-${handle}`,
        name: `${handle}_job`,
        graphFunctionId: profile.id
      })
    ]
  });

  return {
    profile,
    module,
    context: {
      module,
      runtimeIdentity: runtimeIdentity(),
      resolvedPolicy: resolvedPolicyIdentity(policyOverrides),
      runId,
      workKey
    }
  };
}

export function controlLoopPayload(handle, overrides = {}, startOverrides = {}) {
  return {
    start_request: requestPayload(handle, startOverrides),
    ...overrides
  };
}

export function liveStatusPayload(overrides = {}) {
  return {
    start_request: null,
    start_outcome: null,
    control_request: null,
    control_outcome: null,
    result_assessment_request: null,
    result_assessment_outcome: null,
    ...overrides
  };
}

export function approvedEventPayload(overrides = {}) {
  return {
    kind: "approved",
    approval_kind: "fh_review",
    edge: "design→code",
    actor: "human",
    workflow_version: "wf://typescript-dev",
    run_id: null,
    work_key: null,
    ...overrides
  };
}

export function revokedEventPayload(overrides = {}) {
  return {
    kind: "revoked",
    approval_kind: "fh_approval",
    edge: "design→code",
    actor: "human",
    reason: "operator revoked approval",
    workflow_version: "wf://typescript-dev",
    run_id: null,
    work_key: null,
    ...overrides
  };
}

export function resetEventPayload(overrides = {}) {
  return {
    kind: "reset",
    scope: "workspace",
    actor: "human",
    reason: "operator reset workspace",
    workflow_version: "wf://typescript-dev",
    run_id: null,
    work_key: null,
    edge: null,
    ...overrides
  };
}
