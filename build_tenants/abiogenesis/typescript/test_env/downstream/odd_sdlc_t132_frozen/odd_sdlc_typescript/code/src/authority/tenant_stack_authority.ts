// Implements: T-175

import {
  decideSdlcTenantStackAuthorityStatus,
  type SdlcTenantStackAuthorityStatusDecision
} from "../contracts/blocking_reason_catalog.js";

export type SdlcTenantStackSection = "implementation" | "testing";

export interface SdlcTenantTechnologyStackBuildConfigTarget {
  readonly kind: "sdlc_tenant_technology_stack_build_config_target";
  readonly path: string;
  readonly stackSection: SdlcTenantStackSection;
  readonly sourceRef: string;
}

export interface SdlcTenantTechnologyStackAuthority {
  readonly kind: "sdlc_tenant_technology_stack_authority";
  readonly authorityRef: "tenant-stack-authority://odd-sdlc/current";
  readonly statusDecision: SdlcTenantStackAuthorityStatusDecision;
  readonly buildConfigTargets: readonly SdlcTenantTechnologyStackBuildConfigTarget[];
  readonly sourceRefs: readonly string[];
  readonly reasonRefs: readonly string[];
}

export function constructSdlcTenantTechnologyStackAuthority(input: {
  readonly required: boolean;
  readonly buildConfigTargets: readonly Omit<
    SdlcTenantTechnologyStackBuildConfigTarget,
    "kind"
  >[];
  readonly sourceRefs: readonly string[];
  readonly reasonRefs: readonly string[];
}): SdlcTenantTechnologyStackAuthority {
  const sourceRefs = Object.freeze([...input.sourceRefs].sort());
  const reasonRefs = Object.freeze([...input.reasonRefs].sort());
  return Object.freeze({
    kind: "sdlc_tenant_technology_stack_authority" as const,
    authorityRef: "tenant-stack-authority://odd-sdlc/current" as const,
    statusDecision: decideSdlcTenantStackAuthorityStatus({
      required: input.required,
      sourceRefs,
      reasonRefs
    }),
    buildConfigTargets: Object.freeze(
      input.buildConfigTargets
        .map((target) =>
          Object.freeze({
            kind: "sdlc_tenant_technology_stack_build_config_target" as const,
            path: target.path,
            stackSection: target.stackSection,
            sourceRef: target.sourceRef
          })
        )
        .sort((left, right) => left.path.localeCompare(right.path))
    ),
    sourceRefs,
    reasonRefs
  });
}
