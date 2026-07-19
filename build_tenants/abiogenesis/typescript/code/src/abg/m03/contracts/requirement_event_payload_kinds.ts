// Implements: REQ-R-ABG3-REQUIREMENTS-ALGEBRA
// Dependency-free vocabulary shared by requirement admission and runtime-event
// admission. requirements_algebra remains the public requirements API.

export const REQUIREMENT_EVENT_PAYLOAD_KIND_VALUES = Object.freeze([
  "requirement_term_admitted",
  "requirement_relation_admitted",
  "traversal_span_admitted",
  "authority_context_fragment_admitted",
  "destination_topology_admitted",
  "requirement_test_relation_admitted",
  "requirement_projection_admitted",
  "requirement_evidence_bound",
  "requirement_fold_projected",
  "requirement_residual_projected"
] as const);

export type RequirementEventPayloadKind =
  (typeof REQUIREMENT_EVENT_PAYLOAD_KIND_VALUES)[number];
