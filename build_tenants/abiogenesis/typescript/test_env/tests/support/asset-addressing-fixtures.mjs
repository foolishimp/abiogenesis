import {
  admitRuntimeModule,
  jobPayload,
  publishedProfile,
  requestPayload,
  resolvedPolicyIdentity,
  runtimeIdentity
} from "./m04-fixtures.mjs";

export function publicAssetAddressingPayload(handle = "code_surface", overrides = {}) {
  return {
    target: {
      kind: "asset",
      handle
    },
    ...overrides
  };
}

export function operatorAssetContractPayload(overrides = {}) {
  return {
    command: ["node", "operator-asset-query.mjs"],
    ...overrides
  };
}

export function operatorAssetRegistryPayload(entries) {
  return {
    assets: entries
  };
}

export function registryRunnerFromPayload(payload) {
  return async () => payload;
}

export function assetAddressingStartContext() {
  const reviewProfile = publishedProfile({
    id: "graph-function-m04-asset-review",
    name: "review_flow",
    graphId: "graph-m04-asset-review",
    graphName: "design→review:m04-asset"
  });
  const codeProfile = publishedProfile({
    id: "graph-function-m04-asset-code",
    name: "code_flow",
    graphId: "graph-m04-asset-code",
    graphName: "design→code:m04-asset"
  });
  const module = admitRuntimeModule({
    graphFunctions: [reviewProfile, codeProfile],
    jobs: [
      jobPayload({
        id: "job-m04-asset-review",
        name: "review_flow_job",
        graphFunctionId: reviewProfile.id
      }),
      jobPayload({
        id: "job-m04-asset-code",
        name: "code_flow_job",
        graphFunctionId: codeProfile.id
      })
    ]
  });

  return {
    reviewProfile,
    codeProfile,
    module,
    publicStartInput(handle = codeProfile.name) {
      return requestPayload(handle);
    },
    publicStartContext: {
      module,
      runtimeIdentity: runtimeIdentity(),
      resolvedPolicy: resolvedPolicyIdentity({
        resolvedPolicyBundleRef: "policy://public-fd",
        defaultRegime: "F_D"
      }),
      runId: "run://m04-asset-addressing",
      workKey: "wk://m04-asset-addressing"
    }
  };
}
