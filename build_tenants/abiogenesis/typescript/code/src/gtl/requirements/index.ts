// Implements: REQ-L-GTL3-REQUIREMENTS-ALGEBRA-010
// Implements: REQ-L-GTL3-REQUIREMENTS-ALGEBRA-011
// Implements: REQ-L-GTL3-REQUIREMENTS-ALGEBRA-012

export {
  GTL_REQUIREMENTS_ALGEBRA_DECLARATION_KEY,
  GTL_REQUIREMENT_RELATION_KIND_VALUES,
  constructGtlRequirementDeclaration as declareRequirement,
  constructGtlRequirementRelationDeclaration as declareRequirementRelation,
  constructGtlRequirementsAlgebraDeclarationBundle as declareBundle,
  constructGtlRequirementsLifecycleComposition as declareLifecycleComposition,
  constructGtlTraversalSpanDeclaration as declareTraversalSpan
} from "../m01/contracts/requirements_algebra.js";

export type {
  GtlAuthorityContextFragmentDeclaration,
  GtlDestinationTopologyDeclaration,
  GtlRequirementDeclaration,
  GtlRequirementRelationDeclaration,
  GtlRequirementRelationKind,
  GtlRequirementsAlgebraDeclarationBundle,
  GtlRequirementsLifecycleComposition,
  GtlRequirementTestRelationDeclaration,
  GtlTraversalSpanDeclaration,
  PublishedRequirementRouteRef
} from "../m01/contracts/requirements_algebra.js";
