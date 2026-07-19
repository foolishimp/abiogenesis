// Implements: REQ-P-QUAL
// Implements: REQ-P-SCENARIOS

import {
  admitDispatchRequest,
  admitResultArtifact
} from "../../../abg/m03/transport/index.js";
import {
  parseNonEmptyString,
  parseOptionalField,
  parsePlainObject
} from "../../../shared/validation/primitives.js";
import {
  constructAssessmentManifestProvenance,
  constructPublicResultAssessmentRequest,
  constructPublishedLedgerRef,
  deriveFulfillmentAssessmentRefs
} from "./constructors.js";
import type { PublicResultAssessmentRequest } from "./carriers.js";

function parseNullableString(input: unknown, label: string): string | null {
  if (input === undefined || input === null) {
    return null;
  }
  return parseNonEmptyString(input, label);
}

function parseSha256Digest(
  input: unknown,
  label: string
): `sha256:${string}` {
  const digest = parseNonEmptyString(input, label);
  if (!isSha256Digest(digest)) {
    throw new TypeError(`${label}: expected sha256:<64-hex> digest`);
  }
  return digest;
}

function isSha256Digest(value: string): value is `sha256:${string}` {
  return /^sha256:[0-9a-f]{64}$/u.test(value);
}

function parseAssessmentKind(
  input: unknown,
  label: string
): PublicResultAssessmentRequest["kind"] {
  const kind = parseNonEmptyString(input, label);
  if (kind === "fp_assessed") {
    return kind;
  }
  throw new TypeError(
    `${label}: expected "fp_assessed", got ${JSON.stringify(kind)}`
  );
}

export function admitPublicResultAssessmentRequest(
  input: unknown,
  label = "PublicResultAssessmentRequest"
): PublicResultAssessmentRequest {
  const requestObject = parsePlainObject(input, label);
  parseAssessmentKind(requestObject["kind"], `${label}.kind`);
  const dispatchRequest = admitDispatchRequest(
    requestObject["dispatch_request"],
    `${label}.dispatch_request`
  );
  const artifact = admitResultArtifact(
    dispatchRequest,
    requestObject["result_artifact"],
    `${label}.result_artifact`
  );
  const assessmentContract = parsePlainObject(
    requestObject["assessment_contract"],
    `${label}.assessment_contract`
  );
  const manifestProvenance = parsePlainObject(
    requestObject["manifest_provenance"],
    `${label}.manifest_provenance`
  );
  const publishedLedgerRef = parsePlainObject(
    requestObject["published_ledger_ref"],
    `${label}.published_ledger_ref`
  );

  return constructPublicResultAssessmentRequest({
    dispatchRequest,
    artifact,
    assessmentContract: {
      ref: parseNonEmptyString(
        assessmentContract["ref"],
        `${label}.assessment_contract.ref`
      ),
      digest: parseSha256Digest(
        assessmentContract["digest"],
        `${label}.assessment_contract.digest`
      )
    },
    manifestProvenance: constructAssessmentManifestProvenance({
      specHash: parseNonEmptyString(
        manifestProvenance["spec_hash"],
        `${label}.manifest_provenance.spec_hash`
      ),
      manifestId: parseNonEmptyString(
        manifestProvenance["manifest_id"],
        `${label}.manifest_provenance.manifest_id`
      ),
      workflowVersion: parseNonEmptyString(
        manifestProvenance["workflow_version"],
        `${label}.manifest_provenance.workflow_version`
      ),
      runId: parseNullableString(
        parseOptionalField(manifestProvenance, "run_id"),
        `${label}.manifest_provenance.run_id`
      ),
      workKey: parseNullableString(
        parseOptionalField(manifestProvenance, "work_key"),
        `${label}.manifest_provenance.work_key`
      ),
      authorityRef: parseNullableString(
        parseOptionalField(manifestProvenance, "authority_ref"),
        `${label}.manifest_provenance.authority_ref`
      ),
      selectedWorkerId: parseNullableString(
        parseOptionalField(manifestProvenance, "selected_worker_id"),
        `${label}.manifest_provenance.selected_worker_id`
      ),
      selectedBackend: parseNullableString(
        parseOptionalField(manifestProvenance, "selected_backend"),
        `${label}.manifest_provenance.selected_backend`
      ),
      roleId: parseNullableString(
        parseOptionalField(manifestProvenance, "role_id"),
        `${label}.manifest_provenance.role_id`
      ),
      assignmentSource: parseNullableString(
        parseOptionalField(manifestProvenance, "assignment_source"),
        `${label}.manifest_provenance.assignment_source`
      ),
      resolvedRuntimeRef: parseNullableString(
        parseOptionalField(manifestProvenance, "resolved_runtime_ref"),
        `${label}.manifest_provenance.resolved_runtime_ref`
      )
    }),
    publishedLedgerRef: constructPublishedLedgerRef(
      parseNonEmptyString(
        publishedLedgerRef["ref"],
        `${label}.published_ledger_ref.ref`
      )
    ),
    fulfillmentRefs: deriveFulfillmentAssessmentRefs(artifact)
  });
}
