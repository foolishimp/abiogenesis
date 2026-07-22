import {
  COMPOSED_HELLO_IDS,
  type HelloWorldInput,
  type HelloWorldOutput,
  type NormalizedHelloInput,
} from "../gtl/index.js";
import {
  ABI5_PACKAGE_NAME,
  ABI5_PACKAGE_VERSION,
} from "../product/contracts.js";
import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";

function descriptor(
  input: Omit<PackagedLeafImplementationDescriptor, "descriptorDigest" | "kind" | "schemaVersion">,
): PackagedLeafImplementationDescriptor {
  return deepFreeze({
    kind: "packaged_leaf_implementation_descriptor" as const,
    schemaVersion: "5.0.0" as const,
    descriptorDigest: sha256Canonical(input),
    ...input,
  }) as PackagedLeafImplementationDescriptor;
}

export const NORMALIZE_HELLO_IMPLEMENTATION_DESCRIPTOR = descriptor({
  implementationRef: COMPOSED_HELLO_IDS.normalizeImplementationRef,
  packageName: ABI5_PACKAGE_NAME,
  packageVersion: ABI5_PACKAGE_VERSION,
  modulePath: "build/code/src/implementation/hello_compose.js",
  namedSymbol: "normalizeHelloInput",
  computeRegime: "F_D",
  inputContractRef: "contract://abiogenesis/conformance/hello-input@5",
  outputContractRef: COMPOSED_HELLO_IDS.normalizedInputContractRef,
  failureContractRef: "contract://abiogenesis/conformance/hello-failure@5",
  refusalContractRef: "contract://abiogenesis/conformance/hello-refusal@5",
});

export const RENDER_NORMALIZED_HELLO_IMPLEMENTATION_DESCRIPTOR = descriptor({
  implementationRef: COMPOSED_HELLO_IDS.renderImplementationRef,
  packageName: ABI5_PACKAGE_NAME,
  packageVersion: ABI5_PACKAGE_VERSION,
  modulePath: "build/code/src/implementation/hello_compose.js",
  namedSymbol: "renderNormalizedHello",
  computeRegime: "F_D",
  inputContractRef: COMPOSED_HELLO_IDS.normalizedInputContractRef,
  outputContractRef: "contract://abiogenesis/conformance/hello-output@5",
  failureContractRef: "contract://abiogenesis/conformance/hello-failure@5",
  refusalContractRef: "contract://abiogenesis/conformance/hello-refusal@5",
});

export function normalizeHelloInput(input: Readonly<HelloWorldInput>) {
  const resultCandidate = deepFreeze({
    kind: "normalized_hello_input" as const,
    schemaVersion: "5.0.0" as const,
    subject: input.subject.trim(),
  }) satisfies Readonly<NormalizedHelloInput>;
  return deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "success" as const,
    evidenceCandidates: [{
      kind: "deterministic_evidence_candidate" as const,
      schemaVersion: "5.0.0" as const,
      implementationRef: COMPOSED_HELLO_IDS.normalizeImplementationRef,
      inputDigest: sha256Canonical(input),
      outputDigest: sha256Canonical(resultCandidate),
    }] as const,
    resultCandidate,
  });
}

export function renderNormalizedHello(input: Readonly<NormalizedHelloInput>) {
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
      implementationRef: COMPOSED_HELLO_IDS.renderImplementationRef,
      inputDigest: sha256Canonical(input),
      outputDigest: sha256Canonical(resultCandidate),
    }] as const,
    resultCandidate,
  });
}
