// Implements: T-161, T-197

import type {
  SdlcFdRunAnalysisProfile,
  SdlcFdRunAnalysisProfileCapability,
  SdlcFdRunAnalysisProfileSpec,
  SdlcFdRunAnalysisThresholds
} from "./types.js";

const DEFAULT_THRESHOLDS: SdlcFdRunAnalysisThresholds = Object.freeze({
  heartbeatAgeStallMs: 300_000,
  noOutputGapStallMs: 240_000,
  archiveGrowthZeroToleranceMs: 300_000,
  promptContextBytesHigh: 1_000_000,
  handoffGrowthHighBytes: 1_000_000,
  eventSnapshotBytesHigh: 5_000_000,
  unattributedTimeHighRatio: 0.6,
  requirementFanoutSuspiciousRatio: 8,
  productLineageFanoutSuspiciousRatio: 8
});

const TRIVIAL_PRODUCT_THRESHOLDS: SdlcFdRunAnalysisThresholds = Object.freeze({
  heartbeatAgeStallMs: 120_000,
  noOutputGapStallMs: 90_000,
  archiveGrowthZeroToleranceMs: 120_000,
  promptContextBytesHigh: 250_000,
  handoffGrowthHighBytes: 150_000,
  eventSnapshotBytesHigh: 300_000,
  unattributedTimeHighRatio: 0.5,
  requirementFanoutSuspiciousRatio: 3,
  productLineageFanoutSuspiciousRatio: 2
});

function profileToken(profile: SdlcFdRunAnalysisProfile): string {
  const normalized = profile.trim().toLowerCase().replace(/[^a-z0-9._-]+/gu, "_");
  return normalized.length > 0 ? normalized : "generic";
}

function capabilityValue(
  capabilityContracts: readonly SdlcFdRunAnalysisProfileCapability[],
  name: string
): string | null {
  return capabilityContracts.find((contract) => contract.name === name)?.value ?? null;
}

function truthyCapability(
  capabilityContracts: readonly SdlcFdRunAnalysisProfileCapability[],
  name: string
): boolean {
  const normalized = capabilityValue(capabilityContracts, name)?.trim().toLowerCase() ?? "";
  return (
    normalized === "1" ||
    normalized === "true" ||
    normalized === "yes" ||
    normalized === "on"
  );
}

function nonNegativeIntegerCapability(
  capabilityContracts: readonly SdlcFdRunAnalysisProfileCapability[],
  name: string
): number {
  const value = capabilityValue(capabilityContracts, name);
  if (value === null) {
    return 0;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

export function resolveSdlcFdRunAnalysisProfile(input:
  | SdlcFdRunAnalysisProfile
  | {
    readonly profile: SdlcFdRunAnalysisProfile;
    readonly capabilityContracts?: readonly SdlcFdRunAnalysisProfileCapability[];
  }
): SdlcFdRunAnalysisProfileSpec {
  const profile = typeof input === "string" ? input : input.profile;
  const capabilityContracts = Object.freeze(
    [...(typeof input === "string" ? [] : input.capabilityContracts ?? [])]
  );
  const token = profileToken(profile);
  const trivialProduct = truthyCapability(capabilityContracts, "trivial_product");
  const enforceCanonicalLineage =
    trivialProduct || truthyCapability(capabilityContracts, "canonical_product_lineage");
  const thresholds = trivialProduct ? TRIVIAL_PRODUCT_THRESHOLDS : DEFAULT_THRESHOLDS;
  const thresholdToken = trivialProduct ? "trivial_product" : "generic";
  return Object.freeze({
    policy: Object.freeze({
      profile,
      profilePolicyRef: `policy://odd-sdlc/analysis/profile/${token}/v1`,
      thresholdPolicyRef: `policy://odd-sdlc/analysis/threshold/${thresholdToken}/v1`,
      policyStatus: "informational" as const
    }),
    capabilityContracts,
    thresholds,
    expectedRetryFloor: nonNegativeIntegerCapability(
      capabilityContracts,
      "expected_retry_floor"
    ),
    enforceCanonicalLineage,
    forbidRawDisplayIdRequirementTagsInProductFiles: trivialProduct
  });
}
