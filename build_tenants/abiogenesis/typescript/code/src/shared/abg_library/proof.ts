import type { ProofFixtureProfile } from "./carriers.js";

interface FixtureNodeInput {
  readonly id: string;
  readonly name: string;
  readonly assetKind: string;
  readonly schemaRef: string;
  readonly standardsRefs: readonly string[];
  readonly outputContractRefs: readonly string[];
  readonly tags: readonly string[];
  readonly requiredContexts?: readonly string[];
  readonly markov?: readonly string[];
}

interface ReviewerRoleInput {
  readonly id: string;
  readonly scope: string;
  readonly name?: string;
  readonly tags?: readonly string[];
}

interface GraphFunctionLike {
  readonly id: string;
  readonly template: {
    readonly graph: unknown;
  };
}

interface JobPayload {
  readonly id: string;
  readonly name: string;
  readonly contracts: readonly {
    readonly kind: string;
    readonly targetId: string;
  }[];
  readonly roles: readonly unknown[];
  readonly tags: readonly string[];
}

function freezeStringArray(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

export function constructProofFixtureProfile(
  input: ProofFixtureProfile
): ProofFixtureProfile {
  return Object.freeze({
    kind: input.kind,
    publishedWork: Object.freeze({
      moduleName: input.publishedWork.moduleName,
      graphFunctionName: input.publishedWork.graphFunctionName,
      jobName: input.publishedWork.jobName
    }),
    runtimeContext: Object.freeze({
      workerId: input.runtimeContext.workerId,
      backendId: input.runtimeContext.backendId,
      resolvedPolicyBundleRef: input.runtimeContext.resolvedPolicyBundleRef
    })
  });
}

export function constructFixtureNodePayload(input: FixtureNodeInput) {
  return Object.freeze({
    id: input.id,
    name: input.name,
    schema: Object.freeze({
      kind: "symbolic",
      ref: input.schemaRef
    }),
    markov: freezeStringArray(input.markov ?? ["derived"]),
    assetSurface: Object.freeze({
      kind: input.assetKind,
      requiredContexts: freezeStringArray(
        input.requiredContexts ?? ["workspace"]
      ),
      standardsRefs: freezeStringArray(input.standardsRefs),
      outputContractRefs: freezeStringArray(input.outputContractRefs)
    }),
    tags: freezeStringArray(input.tags)
  });
}

export function constructReviewerRolePayload(input: ReviewerRoleInput) {
  return Object.freeze({
    id: input.id,
    name: input.name ?? "reviewer",
    tags: freezeStringArray(input.tags ?? ["approval"]),
    policyHooks: Object.freeze({
      entries: Object.freeze([
        Object.freeze({
          key: "authority",
          value: Object.freeze({
            kind: "hook_ref",
            value: Object.freeze({
              ref: "hook://authority/reviewer",
              config: Object.freeze({
                entries: Object.freeze([
                  Object.freeze({
                    key: "scope",
                    value: Object.freeze({
                      kind: "scalar",
                      value: input.scope
                    })
                  })
                ])
              })
            })
          })
        })
      ])
    })
  });
}

export function constructFixtureJobPayload(input: {
  readonly id: string;
  readonly graphFunctionId: string;
  readonly rolePayload: unknown;
  readonly name?: string;
  readonly tags?: readonly string[];
}): JobPayload {
  return Object.freeze({
    id: input.id,
    name: input.name ?? input.id,
    contracts: Object.freeze([
      Object.freeze({
        kind: "graph_function",
        targetId: input.graphFunctionId
      })
    ]),
    roles: Object.freeze([input.rolePayload]),
    tags: freezeStringArray(input.tags ?? ["semantic_work"])
  });
}

export function constructFixtureModulePayload(input: {
  readonly profile: ProofFixtureProfile;
  readonly graphFunctions: readonly GraphFunctionLike[];
  readonly jobs: readonly JobPayload[];
  readonly rolePayload: unknown;
}) {
  return Object.freeze({
    name: input.profile.publishedWork.moduleName,
    graphs: Object.freeze(
      input.graphFunctions.map((graphFunction) => graphFunction.template.graph)
    ),
    graphFunctions: Object.freeze([...input.graphFunctions]),
    refinementBoundaries: Object.freeze([]),
    candidateFamilies: Object.freeze([]),
    jobs: Object.freeze([...input.jobs]),
    roles: Object.freeze([input.rolePayload]),
    operators: Object.freeze([]),
    evaluators: Object.freeze([]),
    rules: Object.freeze([]),
    imports: Object.freeze([]),
    metadata: Object.freeze({
      entries: Object.freeze([])
    })
  });
}

export function constructRuntimeIdentityPayload(input: {
  readonly profile: ProofFixtureProfile;
  readonly resolvedRuntimeRef: string;
  readonly buildId?: string;
}) {
  return Object.freeze({
    workerId: input.profile.runtimeContext.workerId,
    backendId: input.profile.runtimeContext.backendId,
    buildId: input.buildId ?? "build://typescript-dev",
    resolvedRuntimeRef: input.resolvedRuntimeRef
  });
}

export function constructResolvedPolicyIdentityPayload(input: {
  readonly profile: ProofFixtureProfile;
  readonly defaultRegime: "F_D" | "F_P" | "F_H";
  readonly dispatchRef?: string;
  readonly approvalSubjectRef?: string;
}) {
  return Object.freeze({
    resolvedPolicyBundleRef: input.profile.runtimeContext.resolvedPolicyBundleRef,
    defaultRegime: input.defaultRegime,
    ...(input.dispatchRef === undefined
      ? {}
      : Object.freeze({
          dispatchRef: input.dispatchRef
        })),
    ...(input.approvalSubjectRef === undefined
      ? {}
      : Object.freeze({
          approvalSubjectRef: input.approvalSubjectRef
        }))
  });
}
