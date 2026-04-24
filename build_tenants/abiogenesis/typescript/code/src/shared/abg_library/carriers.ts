export interface DispatchAssessmentExpectation {
  readonly id: string;
}

export interface DispatchExpectation {
  readonly expectedEdge: string | null;
  readonly assessments: readonly DispatchAssessmentExpectation[];
}

export interface SanitizedEnvironmentPolicy {
  readonly prefixes: readonly string[];
}

export interface AgentTransportContract {
  readonly agentKey: string;
  readonly command: string;
  readonly argsTemplate: readonly string[];
  readonly sanitizedEnvironmentPolicy: SanitizedEnvironmentPolicy;
}

export interface PublishedWorkFixture {
  readonly moduleName: string;
  readonly graphFunctionName: string;
  readonly jobName: string;
}

export interface RuntimeFixtureContext {
  readonly workerId: string;
  readonly backendId: string;
  readonly resolvedPolicyBundleRef: string;
}

export interface ProofFixtureProfile {
  readonly kind: string;
  readonly publishedWork: PublishedWorkFixture;
  readonly runtimeContext: RuntimeFixtureContext;
}
