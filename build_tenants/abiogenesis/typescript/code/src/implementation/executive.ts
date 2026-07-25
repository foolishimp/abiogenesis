import {
  EXECUTIVE_IDS,
  projectExecutiveDeclarationDraft,
  projectExecutiveObserverReport,
  type ExecutiveReplaySnapshot,
  type ExecutiveTuningInput,
} from "../gtl/executive.js";
import {
  ABI5_PACKAGE_NAME,
  ABI5_PACKAGE_VERSION,
} from "../product/contracts.js";
import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";

interface ExecutiveLeafCandidate {
  readonly kind: "leaf_realization_candidate";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "success";
  readonly evidenceCandidates: readonly [{
    readonly kind: "deterministic_evidence_candidate";
    readonly schemaVersion: "5.0.0";
    readonly implementationRef: string;
    readonly inputDigest: `sha256:${string}`;
    readonly outputDigest: `sha256:${string}`;
  }];
  readonly resultCandidate: Readonly<Record<string, JsonValue>>;
}

function descriptor(input: Readonly<{
  readonly implementationRef: string;
  readonly namedSymbol: string;
  readonly inputContractRef: string;
  readonly outputContractRef: string;
}>): PackagedLeafImplementationDescriptor {
  const body = {
    ...input,
    packageName: ABI5_PACKAGE_NAME,
    packageVersion: ABI5_PACKAGE_VERSION,
    modulePath: "build/code/src/implementation/executive.js",
    computeRegime: "F_D" as const,
    failureContractRef: EXECUTIVE_IDS.failureContractRef,
    refusalContractRef: EXECUTIVE_IDS.refusalContractRef,
  };
  return deepFreeze({
    kind: "packaged_leaf_implementation_descriptor" as const,
    schemaVersion: "5.0.0" as const,
    descriptorDigest: sha256Canonical(body),
    ...body,
  }) as PackagedLeafImplementationDescriptor;
}

export const EXECUTIVE_OBSERVER_IMPLEMENTATION_DESCRIPTOR = descriptor({
  implementationRef: EXECUTIVE_IDS.observerImplementationRef,
  namedSymbol: "realizeExecutiveObserver",
  inputContractRef: EXECUTIVE_IDS.replaySnapshotContractRef,
  outputContractRef: EXECUTIVE_IDS.observerReportContractRef,
});

export const EXECUTIVE_TUNER_IMPLEMENTATION_DESCRIPTOR = descriptor({
  implementationRef: EXECUTIVE_IDS.tunerImplementationRef,
  namedSymbol: "realizeExecutiveTuner",
  inputContractRef: EXECUTIVE_IDS.tuningSignalContractRef,
  outputContractRef: EXECUTIVE_IDS.declarationDraftContractRef,
});

function candidate(
  implementationRef: string,
  input: Readonly<Record<string, JsonValue>>,
  output: Readonly<Record<string, JsonValue>>,
): Readonly<ExecutiveLeafCandidate> {
  return deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "success" as const,
    evidenceCandidates: [{
      kind: "deterministic_evidence_candidate" as const,
      schemaVersion: "5.0.0" as const,
      implementationRef,
      inputDigest: sha256Canonical(input),
      outputDigest: sha256Canonical(output),
    }] as const,
    resultCandidate: output,
  });
}

export function realizeExecutiveObserver(
  input: Readonly<ExecutiveReplaySnapshot>,
): Readonly<ExecutiveLeafCandidate> {
  const output = projectExecutiveObserverReport(input);
  return candidate(
    EXECUTIVE_IDS.observerImplementationRef,
    input as unknown as Readonly<Record<string, JsonValue>>,
    output as unknown as Readonly<Record<string, JsonValue>>,
  );
}

export function realizeExecutiveTuner(
  input: Readonly<ExecutiveTuningInput>,
): Readonly<ExecutiveLeafCandidate> {
  const output = projectExecutiveDeclarationDraft(input);
  return candidate(
    EXECUTIVE_IDS.tunerImplementationRef,
    input as unknown as Readonly<Record<string, JsonValue>>,
    output as unknown as Readonly<Record<string, JsonValue>>,
  );
}
