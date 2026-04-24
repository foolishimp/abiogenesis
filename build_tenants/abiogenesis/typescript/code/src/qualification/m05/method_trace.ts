import {
  constructMethodTraceGapRef,
  constructMethodTraceQualificationOutcome,
  constructPassedMethodTraceQualificationOutcome,
  constructRejectedMethodTraceQualificationOutcome
} from "./constructors.js";
import type {
  MethodTraceGapRef,
  MethodTraceQualificationOutcome,
  MethodTraceQualificationRequest,
  QualificationDesignAssetKind,
  QualificationProofLaneKind
} from "./carriers.js";

const REQUIRED_DESIGN_KINDS: readonly QualificationDesignAssetKind[] = Object.freeze([
  "derivation",
  "iacs",
  "structural_carrier_diagram",
  "test_surface_map"
]);

const REQUIRED_PROOF_KINDS: readonly QualificationProofLaneKind[] = Object.freeze([
  "unit",
  "integration",
  "negative"
]);

function uniqueDesignKinds(
  request: MethodTraceQualificationRequest
): readonly QualificationDesignAssetKind[] {
  return Object.freeze(
    REQUIRED_DESIGN_KINDS.filter((kind) =>
      request.designAssets.some((asset) => asset.kind === kind)
    )
  );
}

function uniqueProofKinds(
  request: MethodTraceQualificationRequest
): readonly QualificationProofLaneKind[] {
  return Object.freeze(
    REQUIRED_PROOF_KINDS.filter((kind) =>
      request.proofLanes.some((lane) => lane.kind === kind)
    )
  );
}

export function qualifyMethodTrace(
  request: MethodTraceQualificationRequest
): MethodTraceQualificationOutcome {
  const gaps: MethodTraceGapRef[] = [];

  for (const asset of request.designAssets) {
    if (!asset.exists) {
      gaps.push(constructMethodTraceGapRef("missing_design_asset", asset.path));
    }
    if (!asset.declared) {
      gaps.push(constructMethodTraceGapRef("undeclared_design_asset", asset.path));
    }
  }

  for (const kind of REQUIRED_DESIGN_KINDS) {
    if (!request.designAssets.some((asset) => asset.kind === kind)) {
      gaps.push(constructMethodTraceGapRef("missing_design_kind", kind));
    }
  }

  for (const lane of request.proofLanes) {
    if (!lane.exists) {
      gaps.push(constructMethodTraceGapRef("missing_proof_lane", lane.path));
    }
    if (!lane.declared) {
      gaps.push(constructMethodTraceGapRef("undeclared_proof_lane", lane.path));
    }
    if (lane.validates.length === 0) {
      gaps.push(constructMethodTraceGapRef("missing_validates_tags", lane.path));
    }
  }

  for (const kind of REQUIRED_PROOF_KINDS) {
    if (!request.proofLanes.some((lane) => lane.kind === kind)) {
      gaps.push(constructMethodTraceGapRef("missing_proof_kind", kind));
    }
  }

  for (const asset of request.sourceAssets) {
    if (!asset.exists) {
      gaps.push(constructMethodTraceGapRef("missing_source_asset", asset.path));
    }
    if (!asset.declared) {
      gaps.push(constructMethodTraceGapRef("undeclared_source_asset", asset.path));
    }
  }

  if (gaps.length > 0) {
    return constructMethodTraceQualificationOutcome(
      constructRejectedMethodTraceQualificationOutcome({
        moduleName: request.moduleName,
        reason: "M05 method trace is missing declared authority",
        gaps
      })
    );
  }

  return constructMethodTraceQualificationOutcome(
    constructPassedMethodTraceQualificationOutcome({
      moduleName: request.moduleName,
      designKinds: uniqueDesignKinds(request),
      proofKinds: uniqueProofKinds(request)
    })
  );
}
