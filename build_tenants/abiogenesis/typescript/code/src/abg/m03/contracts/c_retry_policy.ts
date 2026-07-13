// Implements: T-261; REQ-L-GTL3-C-ALGEBRA-008;
// REQ-R-ABG3-CCALL-009. This is a digest-bound projection of the one shared
// retryable-failure allowlist, never a second policy value home.

import {
  RETRYABLE_RUNTIME_FAILURE_CLASS_VALUES,
  type RuntimeFailureClass
} from "./carriers.js";
import {
  stableJsonEquals,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";

export const C_RETRY_POLICY_REF =
  "abg://policy/c-retry/runtime-failure-allowlist/v1" as const;

export interface CRetryPolicyProjection {
  readonly kind: "c_retry_policy_projection";
  readonly policyRef: typeof C_RETRY_POLICY_REF;
  readonly retryableFailureClasses: readonly RuntimeFailureClass[];
  readonly policyDigest: `sha256:${string}`;
}

function policyBasis() {
  return Object.freeze({
    kind: "c_retry_policy_projection" as const,
    policyRef: C_RETRY_POLICY_REF,
    retryableFailureClasses: Object.freeze([
      ...RETRYABLE_RUNTIME_FAILURE_CLASS_VALUES
    ])
  });
}

export function deriveCRetryPolicyProjection(): CRetryPolicyProjection {
  const basis = policyBasis();
  return Object.freeze({
    ...basis,
    policyDigest: stableSha256Digest(basis)
  });
}

export function assertCRetryPolicyProjection(
  projection: CRetryPolicyProjection
): void {
  const expected = deriveCRetryPolicyProjection();
  if (!stableJsonEquals(projection, expected)) {
    throw new TypeError(
      "C.retry policy projection must equal the shared retryable-failure allowlist"
    );
  }
}

export function isRetryableRuntimeFailureClass(
  value: RuntimeFailureClass
): boolean {
  return RETRYABLE_RUNTIME_FAILURE_CLASS_VALUES.some(
    (candidate): boolean => candidate === value
  );
}
