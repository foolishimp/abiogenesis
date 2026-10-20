import {
  GATE_HELLO_IDS,
  type HelloWorldInput,
  type HelloWorldOutput,
} from "../gtl/index.js";
import {
  ABI5_PACKAGE_NAME,
  ABI5_PACKAGE_VERSION,
} from "../product/contracts.js";
import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";

function descriptor(
  input: Omit<
    PackagedLeafImplementationDescriptor,
    "descriptorDigest" | "kind" | "schemaVersion"
  >,
): PackagedLeafImplementationDescriptor {
  return deepFreeze({
    kind: "packaged_leaf_implementation_descriptor" as const,
    schemaVersion: "5.0.0" as const,
    descriptorDigest: sha256Canonical(input),
    ...input,
  }) as PackagedLeafImplementationDescriptor;
}

export const HELLO_GATE_EVALUATOR_IMPLEMENTATION_DESCRIPTOR = descriptor({
  implementationRef: GATE_HELLO_IDS.evaluatorImplementationRef,
  packageName: ABI5_PACKAGE_NAME,
  packageVersion: ABI5_PACKAGE_VERSION,
  modulePath: "build/code/src/implementation/hello_gate.js",
  namedSymbol: "evaluateHelloGate",
  computeRegime: "F_D",
  inputContractRef: "contract://abiogenesis/conformance/hello-input@5",
  outputContractRef: GATE_HELLO_IDS.admittedInputContractRef,
  failureContractRef: "contract://abiogenesis/conformance/hello-failure@5",
  refusalContractRef: "contract://abiogenesis/conformance/hello-refusal@5",
});

export const HELLO_GATE_TARGET_IMPLEMENTATION_DESCRIPTOR = descriptor({
  implementationRef: GATE_HELLO_IDS.targetImplementationRef,
  packageName: ABI5_PACKAGE_NAME,
  packageVersion: ABI5_PACKAGE_VERSION,
  modulePath: "build/code/src/implementation/hello_gate.js",
  namedSymbol: "realizeGatedHello",
  computeRegime: "F_D",
  inputContractRef: GATE_HELLO_IDS.admittedInputContractRef,
  outputContractRef: "contract://abiogenesis/conformance/hello-output@5",
  failureContractRef: "contract://abiogenesis/conformance/hello-failure@5",
  refusalContractRef: "contract://abiogenesis/conformance/hello-refusal@5",
});

export function evaluateHelloGate(input: Readonly<HelloWorldInput>) {
  const resultCandidate = deepFreeze({ ...input }) satisfies Readonly<HelloWorldInput>;
  return deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "success" as const,
    evidenceCandidates: [{
      kind: "deterministic_evidence_candidate" as const,
      schemaVersion: "5.0.0" as const,
      implementationRef: GATE_HELLO_IDS.evaluatorImplementationRef,
      inputDigest: sha256Canonical(input),
      outputDigest: sha256Canonical(resultCandidate),
    }] as const,
    resultCandidate,
  });
}

export function realizeGatedHello(input: Readonly<HelloWorldInput>) {
  const resultCandidate = deepFreeze({
    kind: "hello_world_output" as const,
    schemaVersion: "5.0.0" as const,
    message: `Hello ${input.subject}`,
  }) satisfies Readonly<HelloWorldOutput>;
  return deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "success" as const,
    evidenceCandidates: [{
      kind: "deterministic_evidence_candidate" as const,
      schemaVersion: "5.0.0" as const,
      implementationRef: GATE_HELLO_IDS.targetImplementationRef,
      inputDigest: sha256Canonical(input),
      outputDigest: sha256Canonical(resultCandidate),
    }] as const,
    resultCandidate,
  });
}
