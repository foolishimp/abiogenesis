// Implements: T-175

export const SDLC_TENANT_STACK_AUTHORITY_DEFECT_REASON_PREFIXES = Object.freeze([
  "tenant_stack_spec_parse_failed:",
  "tenant_stack_invalid_target:"
] as const);

export const SDLC_TENANT_STACK_AUTHORITY_DEFECT_REASON_CODES = Object.freeze([
  "tenant_stack_spec_not_object",
  "tenant_stack_execution_environment_missing"
] as const);

export const SDLC_TENANT_STACK_AUTHORITY_UNDEFINED_REASON =
  "tenant_stack_authority_undefined" as const;

export type SdlcTenantStackAuthorityStatus =
  | "not_required"
  | "missing"
  | "invalid"
  | "sufficient";

export interface SdlcTenantStackAuthorityStatusInput {
  readonly required: boolean;
  readonly sourceRefs: readonly string[];
  readonly reasonRefs: readonly string[];
}

export interface SdlcTenantStackAuthorityStatusDecision {
  readonly kind: "sdlc_tenant_stack_authority_status_decision";
  readonly status: SdlcTenantStackAuthorityStatus;
  readonly invalidReasonRefs: readonly string[];
  readonly sourceRefs: readonly string[];
}

export function isSdlcTenantStackAuthorityDefectReason(
  reasonRef: string
): boolean {
  return (
    SDLC_TENANT_STACK_AUTHORITY_DEFECT_REASON_CODES.some(
      (code) => code === reasonRef
    ) ||
    SDLC_TENANT_STACK_AUTHORITY_DEFECT_REASON_PREFIXES.some((prefix) =>
      reasonRef.startsWith(prefix)
    )
  );
}

export function sdlcTenantStackAuthorityInvalidReasonRefs(
  reasonRefs: readonly string[]
): readonly string[] {
  return Object.freeze(
    reasonRefs.filter(isSdlcTenantStackAuthorityDefectReason).sort()
  );
}

export function decideSdlcTenantStackAuthorityStatus(
  input: SdlcTenantStackAuthorityStatusInput
): SdlcTenantStackAuthorityStatusDecision {
  const invalidReasonRefs = sdlcTenantStackAuthorityInvalidReasonRefs(
    input.reasonRefs
  );
  const missing =
    input.required &&
    (input.sourceRefs.length === 0 ||
      input.reasonRefs.includes(SDLC_TENANT_STACK_AUTHORITY_UNDEFINED_REASON));
  return Object.freeze({
    kind: "sdlc_tenant_stack_authority_status_decision" as const,
    status:
      input.required === false
        ? "not_required"
        : invalidReasonRefs.length > 0
          ? "invalid"
          : missing
            ? "missing"
            : "sufficient",
    invalidReasonRefs,
    sourceRefs: Object.freeze([...input.sourceRefs].sort())
  });
}

export function renderSdlcTenantStackInvalidDetail(
  reasonRefs: readonly string[]
): string {
  return sdlcTenantStackAuthorityInvalidReasonRefs(reasonRefs).join(", ");
}
