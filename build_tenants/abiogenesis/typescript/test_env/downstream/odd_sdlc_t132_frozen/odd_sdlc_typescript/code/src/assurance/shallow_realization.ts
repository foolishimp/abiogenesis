// Implements: REQ-F-ODDSDLC-013
// Implements: REQ-F-ODDSDLC-051
// Implements: REQ-F-ODDSDLC-055

import type { SdlcAssuranceLedger } from "./carriers.js";
import { assuranceLedger, assuranceReason, uniqueSorted } from "./shared.js";

export interface SdlcRealizationTextSurface {
  readonly kind: "sdlc_realization_text_surface";
  readonly role:
    | "source"
    | "test"
    | "build_config"
    | "design"
    | "documentation"
    | "other";
  readonly ref: string;
  readonly content: string;
}

function hasPlaceholder(content: string): boolean {
  return /\b(todo|placeholder|stub|not implemented)\b/i.test(content);
}

function sourceWithoutLineComments(content: string): string {
  return content
    .split(/\r?\n/)
    .map((line) => line.replace(/\/\/.*$/, ""))
    .join("\n");
}

function hasSourceConstantSuccess(content: string): boolean {
  const normalized = sourceWithoutLineComments(content).replace(/\s+/g, " ");
  return (
    /\bdef\s+[A-Za-z_$][\w$]*(?:\s*\[[^\]]*\])?\s*(?:\([^)]*\)\s*)*(?::\s*[^=]+)?=\s*(?:\{\s*)?(?:return\s+)?true\s*;?\s*\}?/.test(
      normalized
    ) ||
    /\bfunction\s+[A-Za-z_$][\w$]*\s*\([^)]*\)\s*\{\s*return\s+true\s*;?\s*\}/.test(
      normalized
    ) ||
    /(?:^|[=(:,]\s*)\([^)]*\)\s*=>\s*(?:\{\s*return\s+true\s*;?\s*\}|true\b)/.test(
      normalized
    ) ||
    /\bassert\s*\(\s*true\s*\)/.test(normalized)
  );
}

function hasTestConstantSuccess(content: string): boolean {
  return /\bassert\s*\(\s*true\s*\)/.test(content);
}

function hasIdentityOnlyTransform(content: string): boolean {
  return (
    /\breturn\s+(input|source|value|x)\s*(?:[;}\n]|$)/.test(content) ||
    /[=]\s*(input|source|value|x)\s*(?:[;}\n]|$)/.test(content)
  );
}

function hasExecutableAssertion(content: string): boolean {
  return /\b(assert|expect|should|test\s*\(|it\s*\()\b/.test(content);
}

export function deriveShallowRealizationAssuranceLedger(input: {
  readonly surfaces: readonly SdlcRealizationTextSurface[];
  readonly synthesisRequired: boolean;
  readonly executableProofRequired: boolean;
}): SdlcAssuranceLedger {
  const reasons = input.surfaces.flatMap((surface) => {
    const surfaceReasons = [];
    if (hasPlaceholder(surface.content)) {
      surfaceReasons.push(
        assuranceReason({
          code: `placeholder_surface:${surface.ref}`,
          message: `${surface.ref} contains placeholder implementation text.`,
          evidenceRefs: [surface.ref],
          lawfulReentryPoint: "same_edge_retry"
        })
      );
    }
    if (
      (surface.role === "source" && hasSourceConstantSuccess(surface.content)) ||
      (surface.role === "test" && hasTestConstantSuccess(surface.content))
    ) {
      surfaceReasons.push(
        assuranceReason({
          code: `constant_success_surface:${surface.ref}`,
          message: `${surface.ref} contains constant success logic.`,
          evidenceRefs: [surface.ref],
          lawfulReentryPoint: "same_edge_retry"
        })
      );
    }
    if (
      input.synthesisRequired &&
      surface.role === "source" &&
      hasIdentityOnlyTransform(surface.content)
    ) {
      surfaceReasons.push(
        assuranceReason({
          code: `identity_only_surface:${surface.ref}`,
          message: `${surface.ref} returns the input for a synthesis edge.`,
          evidenceRefs: [surface.ref],
          lawfulReentryPoint: "same_edge_retry"
        })
      );
    }
    if (
      input.executableProofRequired &&
      surface.role === "test" &&
      !hasExecutableAssertion(surface.content)
    ) {
      surfaceReasons.push(
        assuranceReason({
          code: `trace_only_test_surface:${surface.ref}`,
          message: `${surface.ref} does not contain executable assertion evidence.`,
          evidenceRefs: [surface.ref],
          lawfulReentryPoint: "same_edge_retry"
        })
      );
    }
    return surfaceReasons;
  });

  return assuranceLedger({
    dimension: "shallow_realization",
    verdict: reasons.length > 0 ? "open_gap" : "satisfied",
    reasons: Object.freeze(reasons),
    evidenceRefs: uniqueSorted(input.surfaces.map((surface) => surface.ref)),
    carryForwardObligationRefs: uniqueSorted(
      reasons.map((reason) => `shallow://${reason.code}`)
    )
  });
}
