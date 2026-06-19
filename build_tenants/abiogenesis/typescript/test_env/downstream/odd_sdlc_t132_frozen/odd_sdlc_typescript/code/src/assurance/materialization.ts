// Implements: REQ-F-ODDSDLC-013
// Implements: REQ-F-ODDSDLC-051
// Implements: REQ-F-ODDSDLC-055

import type {
  SdlcPostflightResult,
  SdlcWorkerHandoffManifest,
  SdlcWorkerResultReport
} from "../operator/index.js";
import type { SdlcAssuranceLedger } from "./carriers.js";
import { assuranceLedger, assuranceReason, verdictFromReasons } from "./shared.js";

const MATERIALIZATION_CONTRACT_VIOLATIONS = Object.freeze([
  "adr_output_filename_invalid",
  "materialized_product_relative_path_mismatch",
  "materialized_product_relative_path_absolute",
  "materialized_product_file_is_output_artifact",
  "materialized_product_file_outside_tenant_root",
  "materialized_design_file_outside_design_root",
  "materialized_product_digest_mismatch",
  "materialized_product_byte_count_mismatch",
  "materialized_product_path_not_file",
  "output_file_manifest_mismatch",
  "output_file_outside_allowed_root",
  "output_digest_mismatch"
] as const);

function isMaterializationContractViolation(reason: string): boolean {
  return MATERIALIZATION_CONTRACT_VIOLATIONS.some(
    (contractReason) => contractReason === reason
  );
}

export function deriveMaterializationAssuranceLedger(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly report: SdlcWorkerResultReport | null;
  readonly postflight: SdlcPostflightResult | null;
}): SdlcAssuranceLedger {
  const contract = input.manifest.productMaterialization;
  if (!contract.required) {
    return assuranceLedger({
      dimension: "materialization",
      verdict: "not_applicable",
      required: false,
      evidenceRefs: [contract.manifestFile]
    });
  }
  if (input.report === null || input.postflight === null) {
    return assuranceLedger({
      dimension: "materialization",
      verdict: "blocked",
      reasons: [
        assuranceReason({
          code: "materialization_report_missing",
          message: "Materialization requires an admitted worker report and postflight result.",
          lawfulReentryPoint: "operator_blocked"
        })
      ],
      evidenceRefs: [input.manifest.reportFile]
    });
  }
  const postflight = input.postflight;

  const blockedReasonCodes = postflight.blockingReasons.filter(
    isMaterializationContractViolation
  );
  const openGapReasonCodes = postflight.blockingReasons.filter(
    (reason) => !isMaterializationContractViolation(reason)
  );
  const reasons = Object.freeze(
    [...blockedReasonCodes, ...openGapReasonCodes].map((code) =>
      assuranceReason({
        code,
        message: `Materialization postflight reported ${code}.`,
        evidenceRefs: postflight.evidenceRefs,
        lawfulReentryPoint: isMaterializationContractViolation(code)
          ? "repair_worker_output"
          : "same_edge_retry"
      })
    )
  );

  return assuranceLedger({
    dimension: "materialization",
    verdict: verdictFromReasons({ blockedReasonCodes, openGapReasonCodes }),
    reasons,
    evidenceRefs: postflight.evidenceRefs,
    carryForwardObligationRefs: reasons.map((reason) => `gap://materialization/${reason.code}`)
  });
}
