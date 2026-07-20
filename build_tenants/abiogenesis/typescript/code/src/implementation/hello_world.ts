import { HELLO_WORLD_IDS } from "../gtl/hello_world.js";
import {
  ABI5_PACKAGE_NAME,
  ABI5_PACKAGE_VERSION,
} from "../product/contracts.js";
import { sha256Canonical } from "../product/digests.js";
import { deepFreeze } from "../product/immutable.js";
import type {
  HelloWorldLeafRealizationCandidate,
} from "./contracts.js";
import type { HelloWorldInput } from "../gtl/contracts.js";
import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";

const descriptorBody = {
  implementationRef: HELLO_WORLD_IDS.implementationRef,
  packageName: ABI5_PACKAGE_NAME,
  packageVersion: ABI5_PACKAGE_VERSION,
  modulePath: "build/code/src/implementation/hello_world.js",
  namedSymbol: "realizeHelloWorld",
  computeRegime: "F_D" as const,
  inputContractRef: HELLO_WORLD_IDS.inputContractRef,
  outputContractRef: HELLO_WORLD_IDS.outputContractRef,
  failureContractRef: HELLO_WORLD_IDS.failureContractRef,
  refusalContractRef: HELLO_WORLD_IDS.refusalContractRef,
};

export const HELLO_WORLD_IMPLEMENTATION_DESCRIPTOR = deepFreeze({
  kind: "packaged_leaf_implementation_descriptor" as const,
  schemaVersion: "5.0.0" as const,
  descriptorDigest: sha256Canonical(descriptorBody),
  ...descriptorBody,
}) as PackagedLeafImplementationDescriptor;

export function realizeHelloWorld(
  input: Readonly<HelloWorldInput>,
): Readonly<HelloWorldLeafRealizationCandidate> {
  const resultCandidate = deepFreeze({
    kind: "hello_world_output" as const,
    schemaVersion: "5.0.0" as const,
    message: `Hello ${input.subject}`,
  });
  return deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "success" as const,
    evidenceCandidates: [{
      kind: "deterministic_evidence_candidate" as const,
      schemaVersion: "5.0.0" as const,
      implementationRef: HELLO_WORLD_IDS.implementationRef,
      inputDigest: sha256Canonical(input),
      outputDigest: sha256Canonical(resultCandidate),
    }] as const,
    resultCandidate,
  });
}
