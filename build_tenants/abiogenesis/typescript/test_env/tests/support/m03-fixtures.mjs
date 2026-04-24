import { edge, graphFunctionForVector } from "../../../build/semantic/code/src/gtl/m01/algebra/core.js";
import { admitNode } from "../../../build/semantic/code/src/gtl/m01/admission/carriers.js";
import { admitModule } from "../../../build/semantic/code/src/gtl/m02/admission/carriers.js";
import {
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
  declarations = { entries: [] },
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
