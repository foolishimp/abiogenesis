import type { BoundedRecursionState } from "../gtl/contracts.js";
import {
  RECURSION_HELLO_IDS,
  isBoundedRecursionState,
} from "../gtl/recursion.js";
import {
  ABI5_PACKAGE_NAME,
  ABI5_PACKAGE_VERSION,
} from "../product/contracts.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";

function descriptor(
  implementationRef: string,
  namedSymbol: string,
  inputContractRef: string,
): PackagedLeafImplementationDescriptor {
  const body = {
    implementationRef,
    packageName: ABI5_PACKAGE_NAME,
    packageVersion: ABI5_PACKAGE_VERSION,
    modulePath: "build/code/src/implementation/recursion.js",
    namedSymbol,
    computeRegime: "F_D" as const,
    inputContractRef,
    outputContractRef: RECURSION_HELLO_IDS.outputContractRef,
    failureContractRef: RECURSION_HELLO_IDS.failureContractRef,
    refusalContractRef: RECURSION_HELLO_IDS.refusalContractRef,
  };
  return deepFreeze({
    kind: "packaged_leaf_implementation_descriptor" as const,
    schemaVersion: "5.0.0" as const,
    descriptorDigest: sha256Canonical(body),
    ...body,
  }) as PackagedLeafImplementationDescriptor;
}

export const RECURSION_EVALUATOR_IMPLEMENTATION_DESCRIPTOR = descriptor(
  RECURSION_HELLO_IDS.evaluatorImplementationRef,
  "evaluateBoundedRecursion",
  RECURSION_HELLO_IDS.inputContractRef,
);

export const RECURSION_STEP_IMPLEMENTATION_DESCRIPTOR = descriptor(
  RECURSION_HELLO_IDS.childImplementationRef,
  "stepBoundedRecursion",
  RECURSION_HELLO_IDS.inputContractRef,
);

function success(
  implementationRef: string,
  input: Readonly<BoundedRecursionState>,
  resultCandidate: Readonly<BoundedRecursionState>,
) {
  return deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "success" as const,
    evidenceCandidates: [{
      kind: "deterministic_evidence_candidate" as const,
      schemaVersion: "5.0.0" as const,
      implementationRef,
      inputDigest: sha256Canonical(input),
      outputDigest: sha256Canonical(resultCandidate),
    }],
    resultCandidate,
  });
}

export function evaluateBoundedRecursion(
  input: Readonly<BoundedRecursionState>,
) {
  if (!isBoundedRecursionState(input)) {
    throw new TypeError("bounded recursion evaluator requires its exact state");
  }
  const resultCandidate = deepFreeze({
    ...input,
    blockedChildRemaining: input.blockedChildRemaining,
    terminal: input.remaining === 0,
    trace: [...input.trace],
  });
  return success(
    RECURSION_HELLO_IDS.evaluatorImplementationRef,
    input,
    resultCandidate,
  );
}

export function stepBoundedRecursion(
  input: Readonly<BoundedRecursionState>,
) {
  if (!isBoundedRecursionState(input) || input.remaining < 1) {
    throw new TypeError("bounded recursion step requires remaining work");
  }
  const remaining = input.remaining - 1;
  const resultCandidate = deepFreeze({
    kind: "bounded_recursion_state" as const,
    schemaVersion: "5.0.0" as const,
    blockedChildRemaining: input.blockedChildRemaining,
    remaining,
    terminal: false,
    trace: [...input.trace, remaining],
  });
  return success(
    RECURSION_HELLO_IDS.childImplementationRef,
    input,
    resultCandidate,
  );
}
