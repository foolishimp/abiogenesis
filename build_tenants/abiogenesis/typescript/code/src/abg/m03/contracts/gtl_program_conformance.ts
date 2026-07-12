// Implements: REQ-R-ABG3-INTERPRET
// Implements: REQ-R-ABG3-PAYLOAD
// Supports: REQ-L-GTL3-ASSET-SURFACE

import type {
  AssetSurface,
  Graph,
  GraphFunction,
  GraphVector,
  Node,
  Regime,
  SerializedAttrs
} from "../../../gtl/m01/contracts/carriers.js";
import {
  GTL_NODE_TYPE_GRAPH_FUNCTION_TAG,
  interfaceContract,
  nodeContractKey,
  materializeGraphFunction
} from "../../../gtl/m01/contracts/carriers.js";
import {
  constructGraphFunction,
  constructGraphVector
} from "../../../gtl/m01/contracts/constructors.js";
import {
  C_ALGEBRA_DIAGNOSTIC_ID_VALUES,
  C_ALGEBRA_SYNTAX_VERSION,
  admitCProgramSyntax,
  type CProgramNode,
  type CAlgebraDiagnostic
} from "../../../gtl/m01/algebra/c_algebra.js";
import {
  admitAssetSurface
} from "../../../gtl/m01/admission/carriers.js";
import {
  admitGraphFunctionDeclarations,
  admitGraphVectorDeclarations,
  inspectGtlHostDeclarations,
  type GtlDeclarationHost,
  type GtlDeclarationLawViolation,
  type GtlDeclarationLawViolationKind
} from "../../../gtl/m01/contracts/declaration_law.js";
import {
  graphFunctionApplicationDeclarationFromDeclarations,
  type GraphFunctionApplicationOperatorKind
} from "../../../gtl/m01/contracts/graph_function_application.js";
import type {
  GtlAuthorityContextFragmentDeclaration,
  GtlDestinationTopologyDeclaration,
  GtlRequirementDeclaration,
  GtlRequirementRelationDeclaration,
  GtlRequirementsAlgebraDeclarationBundle,
  GtlRequirementTestRelationDeclaration,
  GtlTraversalSpanDeclaration
} from "../../../gtl/m01/contracts/requirements_algebra.js";
import {
  GTL_REQUIREMENTS_ALGEBRA_DECLARATION_KEY
} from "../../../gtl/m01/contracts/requirements_algebra.js";
import type {
  Module
} from "../../../gtl/m02/contracts/carriers.js";
import type {
  EngineComputeStagePurpose,
  EngineComputeStageRole,
  EnginePluginContract
} from "./plugins.js";
import {
  admitEnginePluginContract,
  ENGINE_COMPUTE_STAGE_PURPOSE_VALUES,
  ENGINE_COMPUTE_STAGE_ROLE_VALUES
} from "./plugins.js";
import { compileCAlgebraToHog } from "./c_algebra_hog_compiler.js";
import { compileExecutionDeclarations } from "./execution_declaration_compiler.js";
import {
  compileHofRelation,
  graphFunctionDeclaresHofApplication,
  type HofRelationDiagnostic
} from "./hof_relation_compiler.js";
import {
  compileGraphFunctionApplication,
  type GraphFunctionApplicationDiagnostic,
  type GraphFunctionApplicationRepairAffordance
} from "./graph_function_application_compiler.js";
import {
  collectRawCProgramCandidates,
  compileGraphVectorCProgramSelection,
  rawCProgramCandidateIdentity,
  rawCProgramCandidatePath,
  type GraphVectorCProgramCompilation,
  type GraphVectorCProgramDiagnostic,
  type GraphVectorCProgramRepairAffordance,
  type RawCProgramCandidate,
  type RawCProgramCandidateCollection
} from "./graph_vector_c_program_compiler.js";
import {
  hogProgramCatalogFromDeclarationAttrs,
  hogProgramFromDeclarationAttrs,
  HOG_PROGRAM_SELECTION_KEY
} from "./hog_program_syntax.js";
import {
  deriveAllowedConsequenceTraversalCatalogFromGtl
} from "./allowed_consequence_traversal_catalog.js";
import type {
  AllowedConsequenceTraversalCatalog,
  AllowedConsequenceTraversalFamily
} from "./allowed_consequence_traversal_catalog.js";
import {
  constructAdmittedPluginResultInterfaceCatalog,
  type AdmittedPluginResultInterfaceCatalog
} from "./plugin_result_interface_contract.js";
import {
  stableJson,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import {
  GRAPH_REENTRY_POINT_VALUES,
  type GraphReentryPoint
} from "./carriers.js";
import {
  REQUIREMENT_EVENT_FORBIDDEN_RUNTIME_FIELDS,
  REQUIREMENT_RELATION_KIND_VALUES,
  REQUIREMENT_STAGE_VALUES
} from "./requirements_algebra.js";

export type GtlProgramConformanceSurfaceKind =
  | "constitutional_surface"
  | "graph_function"
  | "graph"
  | "module"
  | "graph_vector"
  | "program_inventory"
  | "target_carrier_contract"
  | "edge_closure_contract"
  | "overlay"
  | "public_start"
  | "traversal_unit"
  | "prompt_asset"
  | "plugin_contract"
  | "plugin_result_interface"
  | "source_identity"
  | "source_authority_policy"
  | "semantic_review_gate"
  | "same_object"
  | "operator_declaration"
  | "evaluator_declaration"
  | "rule_declaration"
  | "compute_composition"
  | "compute_stage_binding"
  | "hook_boundary"
  | "selection_boundary"
  | "job_binding"
  | "role_binding"
  | "external_tool_gate"
  | "runtime_binding"
  | "runtime_reentry_route"
  | "installed_context"
  | "requirement_declaration"
  | "feature_coverage"
  | "declaration_source"
  | "golden_instance"
  | "underdetermined_scope";

// Implements: REQ-L-GTL3-LAWS-019
// The ratified closed diagnostic vocabulary. Every conformance issue must
// carry one of these stable identities; unknown identities are rejected at
// the constructor boundary. Identities are removed only by supersession.
export const GTL_PROGRAM_DIAGNOSTIC_ID_VALUES = Object.freeze([
  "abg://gtl-program/allowed-consequence-traversal/declaration",
  "abg://gtl-program/compute-composition/digest",
  "abg://gtl-program/compute-composition/notation-ref",
  "abg://gtl-program/compute-composition/regime-bindings",
  "abg://gtl-program/compute-composition/required-stage-row",
  "abg://gtl-program/compute-composition/stage-binding",
  "abg://gtl-program/compute-composition/stage-binding-resolves",
  "abg://gtl-program/compute-composition/unique-ref",
  "abg://gtl-program/compute-stage/composition-digest",
  "abg://gtl-program/compute-stage/composition-resolves",
  "abg://gtl-program/compute-stage/composition-stage-membership",
  "abg://gtl-program/compute-stage/input-carriers",
  "abg://gtl-program/compute-stage/nonparticipation-reason",
  "abg://gtl-program/compute-stage/notation-ref",
  "abg://gtl-program/compute-stage/output-carriers",
  "abg://gtl-program/compute-stage/participating-regime-binding",
  "abg://gtl-program/compute-stage/plugin-contract-resolves",
  "abg://gtl-program/compute-stage/predecessor-resolves",
  "abg://gtl-program/c-algebra/invalid-program",
  "abg://gtl-program/c-algebra/semantic-not-realized",
  "abg://gtl-program/c-algebra/unresolved-graph-function",
  "abg://gtl-program/compute-stage/regime-disposition-required",
  "abg://gtl-program/compute-stage/regime-disposition-unique",
  "abg://gtl-program/compute-stage/unique-ref",
  "abg://gtl-program/coverage/expected-count",
  "abg://gtl-program/coverage/expected-count-admitted",
  "abg://gtl-program/coverage/expected-count-nonzero",
  "abg://gtl-program/coverage/expected-count-required",
  "abg://gtl-program/coverage/expected-coverage-nonempty",
  "abg://gtl-program/coverage/expected-coverage-required",
  "abg://gtl-program/declaration/duplicate-key",
  "abg://gtl-program/declaration/host-compatible",
  "abg://gtl-program/declaration/host-ref-resolves",
  "abg://gtl-program/declaration/reserved-key-registered",
  "abg://gtl-program/declaration/value-kind",
  "abg://gtl-program/edge-closure/no-orphan-row",
  "abg://gtl-program/edge-closure/target-asset-match",
  "abg://gtl-program/edge-closure/unique-vector-row",
  "abg://gtl-program/execution-declaration/invalid",
  "abg://gtl-program/evaluator-declaration/tag-refs",
  "abg://gtl-program/evaluator-declaration/unique-ref",
  "abg://gtl-program/external-tool-gate/admission-ref",
  "abg://gtl-program/external-tool-gate/not-language-truth",
  "abg://gtl-program/external-tool-gate/transport-ref",
  "abg://gtl-program/external-tool-gate/unique-ref",
  "abg://gtl-program/feature-coverage/disposition",
  "abg://gtl-program/feature-coverage/feature-kind",
  "abg://gtl-program/feature-coverage/kind",
  "abg://gtl-program/feature-coverage/manifest-required",
  "abg://gtl-program/feature-coverage/not-used-contradiction",
  "abg://gtl-program/feature-coverage/not-used-reason",
  "abg://gtl-program/feature-coverage/owner-classification",
  "abg://gtl-program/feature-coverage/owner-classification-truth",
  "abg://gtl-program/feature-coverage/present-evidence",
  "abg://gtl-program/feature-coverage/present-without-inventory",
  "abg://gtl-program/feature-coverage/requirement-trace",
  "abg://gtl-program/feature-coverage/row",
  "abg://gtl-program/feature-coverage/t153-feature-required",
  "abg://gtl-program/feature-coverage/t153-requirement",
  "abg://gtl-program/feature-coverage/unique-feature-row",
  "abg://gtl-program/graph-function/catalog-published",
  "abg://gtl-program/graph-function/inputs-equal-environment-requires",
  "abg://gtl-program/graph-function/materializable-template",
  "abg://gtl-program/graph-function/outputs-provided",
  "abg://gtl-program/graph-function/unique-publication",
  "abg://gtl-program/graph-vector/edge-closure-required",
  "abg://gtl-program/graph-vector/source-derivable",
  "abg://gtl-program/graph-vector/source-node-declared",
  "abg://gtl-program/graph-vector/target-carrier-required",
  "abg://gtl-program/graph-vector/target-node-declared",
  "abg://gtl-program/graph-vector/unique-ref",
  "abg://gtl-program/hof/invalid-program",
  "abg://gtl-program/hof/semantic-not-realized",
  "abg://gtl-program/graph-function-application/invalid-program",
  "abg://gtl-program/graph-function-application/semantic-not-realized",
  "abg://gtl-program/graph/input-node-declared",
  "abg://gtl-program/graph/node-reachable-or-bound",
  "abg://gtl-program/graph/output-derivable",
  "abg://gtl-program/graph/output-node-declared",
  "abg://gtl-program/hook-boundary/concern-refs",
  "abg://gtl-program/hook-boundary/plugin-contract-resolves",
  "abg://gtl-program/hook-boundary/plugin-stage-binding-resolves",
  "abg://gtl-program/hook-boundary/unique-host-hook",
  "abg://gtl-program/input/array-field",
  "abg://gtl-program/input/boolean-field",
  "abg://gtl-program/input/composition-source-kind-field",
  "abg://gtl-program/input/compute-composition-row",
  "abg://gtl-program/input/compute-stage-binding-row",
  "abg://gtl-program/input/compute-stage-purpose-field",
  "abg://gtl-program/input/compute-stage-role-field",
  "abg://gtl-program/input/edge-closure-row",
  "abg://gtl-program/input/evaluator-declaration-row",
  "abg://gtl-program/input/external-tool-gate-row",
  "abg://gtl-program/input/graph-function",
  "abg://gtl-program/input/graph-reentry-point-field",
  "abg://gtl-program/input/hook-boundary-row",
  "abg://gtl-program/input/hook-source-kind-field",
  "abg://gtl-program/input/host-kind-field",
  "abg://gtl-program/input/installed-context-row",
  "abg://gtl-program/input/job-binding-row",
  "abg://gtl-program/input/module",
  "abg://gtl-program/input/non-negative-integer-array",
  "abg://gtl-program/input/non-negative-integer-field",
  "abg://gtl-program/input/object",
  "abg://gtl-program/input/operator-declaration-row",
  "abg://gtl-program/input/overlay-row",
  "abg://gtl-program/input/plugin-result-interface-row",
  "abg://gtl-program/input/prompt-asset-digest",
  "abg://gtl-program/input/prompt-asset-node",
  "abg://gtl-program/input/prompt-asset-row",
  "abg://gtl-program/input/prompt-asset-surface",
  "abg://gtl-program/input/public-start-row",
  "abg://gtl-program/input/regime-field",
  "abg://gtl-program/input/repair-surface-disposition-field",
  "abg://gtl-program/input/requirement-context-row",
  "abg://gtl-program/input/requirement-declaration-row",
  "abg://gtl-program/input/requirement-relation-row",
  "abg://gtl-program/input/requirement-span-row",
  "abg://gtl-program/input/requirement-test-relation-row",
  "abg://gtl-program/input/requirement-topology-row",
  "abg://gtl-program/input/requirements-algebra-bundle",
  "abg://gtl-program/input/role-binding-row",
  "abg://gtl-program/input/rule-declaration-row",
  "abg://gtl-program/input/runtime-binding-kind-field",
  "abg://gtl-program/input/runtime-binding-row",
  "abg://gtl-program/input/runtime-reentry-route-row",
  "abg://gtl-program/input/same-object-row",
  "abg://gtl-program/input/selection-boundary-kind-field",
  "abg://gtl-program/input/selection-boundary-row",
  "abg://gtl-program/input/semantic-review-gate-row",
  "abg://gtl-program/input/semantic-review-status",
  "abg://gtl-program/input/source-authority-policy-row",
  "abg://gtl-program/input/source-authority-token-match-mode",
  "abg://gtl-program/input/source-identity-row",
  "abg://gtl-program/input/stage-regime-disposition-field",
  "abg://gtl-program/input/stage-regime-disposition-row",
  "abg://gtl-program/input/string-array",
  "abg://gtl-program/input/string-field",
  "abg://gtl-program/input/target-carrier-row",
  "abg://gtl-program/input/traversal-bind-conservation-row",
  "abg://gtl-program/installed-context/abi-version",
  "abg://gtl-program/installed-context/required-abstraction",
  "abg://gtl-program/installed-context/selected-product-version",
  "abg://gtl-program/installed-context/stale-abstraction",
  "abg://gtl-program/installed-context/toolchain-binding",
  "abg://gtl-program/installed-context/version-line",
  "abg://gtl-program/job-binding/graph-function-resolves",
  "abg://gtl-program/job-binding/job-ref-resolves",
  "abg://gtl-program/job-binding/node-type-not-callable",
  "abg://gtl-program/job-binding/role-ref-resolves",
  "abg://gtl-program/job-binding/unique-ref",
  "abg://gtl-program/module/no-untracked-graph-function",
  "abg://gtl-program/operator-declaration/tag-refs",
  "abg://gtl-program/operator-declaration/unique-ref",
  "abg://gtl-program/overlay/default-start-target-resolves",
  "abg://gtl-program/overlay/graph-function-resolves",
  "abg://gtl-program/overlay/graph-vector-resolves",
  "abg://gtl-program/overlay/public-start-target-resolves",
  "abg://gtl-program/plugin-contract/admission",
  "abg://gtl-program/plugin-contract/no-engine-authority",
  "abg://gtl-program/plugin-contract/runtime-binding-required",
  "abg://gtl-program/plugin-contract/stage-binding-required",
  "abg://gtl-program/plugin-contract/unique-ref",
  "abg://gtl-program/plugin-result-interface/composition-digest",
  "abg://gtl-program/plugin-result-interface/composition-ref",
  "abg://gtl-program/plugin-result-interface/compute-means",
  "abg://gtl-program/plugin-result-interface/no-local-file-selector",
  "abg://gtl-program/plugin-result-interface/output-carrier-covers-stage",
  "abg://gtl-program/plugin-result-interface/output-carrier-stage-member",
  "abg://gtl-program/plugin-result-interface/output-carriers",
  "abg://gtl-program/plugin-result-interface/produced-carriers",
  "abg://gtl-program/plugin-result-interface/required-identity-field",
  "abg://gtl-program/plugin-result-interface/result-carrier-kind",
  "abg://gtl-program/plugin-result-interface/selector-authority",
  "abg://gtl-program/plugin-result-interface/stage-binding-required",
  "abg://gtl-program/plugin-result-interface/stage-binding-resolves",
  "abg://gtl-program/plugin-result-interface/stage-role",
  "abg://gtl-program/plugin-result-interface/unique-produced-carriers",
  "abg://gtl-program/plugin-result-interface/unique-ref",
  "abg://gtl-program/plugin-result-interface/unique-runtime-selector",
  "abg://gtl-program/prompt-asset/asset-surface-admission",
  "abg://gtl-program/prompt-asset/authority-slot",
  "abg://gtl-program/prompt-asset/constructor-ref",
  "abg://gtl-program/prompt-asset/current-abg-fold-ref",
  "abg://gtl-program/prompt-asset/evidence-ref",
  "abg://gtl-program/prompt-asset/gtl-node",
  "abg://gtl-program/prompt-asset/node-preserves-asset-surface",
  "abg://gtl-program/prompt-asset/output-contract",
  "abg://gtl-program/prompt-asset/proof-obligation",
  "abg://gtl-program/prompt-asset/rendered-structure-has-renderer",
  "abg://gtl-program/prompt-asset/rendered-view-digest",
  "abg://gtl-program/prompt-asset/rendered-view-digest-policy",
  "abg://gtl-program/prompt-asset/renderer-ref",
  "abg://gtl-program/public-start/default-overlay-resolves",
  "abg://gtl-program/public-start/default-overlay-start-compatible",
  "abg://gtl-program/public-start/graph-function-resolves",
  "abg://gtl-program/public-start/node-type-not-callable",
  "abg://gtl-program/public-start/overlay-graph-function-compatible",
  "abg://gtl-program/public-start/overlay-required",
  "abg://gtl-program/public-start/overlay-resolves",
  "abg://gtl-program/requirements-algebra/context-applies-to",
  "abg://gtl-program/requirements-algebra/context-applies-to-resolves",
  "abg://gtl-program/requirements-algebra/context-fragment-digest",
  "abg://gtl-program/requirements-algebra/context-promotion-policy-admitted",
  "abg://gtl-program/requirements-algebra/context-ref-resolves",
  "abg://gtl-program/requirements-algebra/declaration-key",
  "abg://gtl-program/requirements-algebra/enum-field",
  "abg://gtl-program/requirements-algebra/evidence-policy-coverage",
  "abg://gtl-program/requirements-algebra/graph-function-ref-resolves",
  "abg://gtl-program/requirements-algebra/graph-vector-ref-resolves",
  "abg://gtl-program/requirements-algebra/kind",
  "abg://gtl-program/requirements-algebra/no-runtime-authority-fields",
  "abg://gtl-program/requirements-algebra/open-payload",
  "abg://gtl-program/requirements-algebra/relation-contradiction",
  "abg://gtl-program/requirements-algebra/relation-cycle",
  "abg://gtl-program/requirements-algebra/relation-ref-resolves",
  "abg://gtl-program/requirements-algebra/relation-requirement-ref-resolves",
  "abg://gtl-program/requirements-algebra/relation-self-reference",
  "abg://gtl-program/requirements-algebra/source-digest",
  "abg://gtl-program/requirements-algebra/span-matches-vector",
  "abg://gtl-program/requirements-algebra/span-range-source-node-ref",
  "abg://gtl-program/requirements-algebra/span-range-target-node-ref",
  "abg://gtl-program/requirements-algebra/span-ref-resolves",
  "abg://gtl-program/requirements-algebra/span-source-node-ref",
  "abg://gtl-program/requirements-algebra/span-target-node-ref",
  "abg://gtl-program/requirements-algebra/span-vector-identity-required",
  "abg://gtl-program/requirements-algebra/test-evidence-policy-ref-resolves",
  "abg://gtl-program/requirements-algebra/test-projection-ref-grammar",
  "abg://gtl-program/requirements-algebra/test-requirement-ref-resolves",
  "abg://gtl-program/requirements-algebra/test-root-coverage",
  "abg://gtl-program/requirements-algebra/topology-applies-to",
  "abg://gtl-program/requirements-algebra/topology-applies-to-resolves",
  "abg://gtl-program/requirements-algebra/topology-constraint-ref-resolves",
  "abg://gtl-program/requirements-algebra/topology-constraints",
  "abg://gtl-program/requirements-algebra/unique-context-fragment-ref",
  "abg://gtl-program/requirements-algebra/unique-destination-topology-ref",
  "abg://gtl-program/requirements-algebra/unique-relation-id",
  "abg://gtl-program/requirements-algebra/unique-requirement-id",
  "abg://gtl-program/requirements-algebra/unique-span-id",
  "abg://gtl-program/requirements-algebra/unique-stable-id",
  "abg://gtl-program/requirements-algebra/unique-test-relation-ref",
  "abg://gtl-program/requirements-algebra/vector-index-resolves",
  "abg://gtl-program/role-binding/capability-refs",
  "abg://gtl-program/role-binding/role-ref-resolves",
  "abg://gtl-program/role-binding/unique-ref",
  "abg://gtl-program/rule-declaration/config-digest",
  "abg://gtl-program/rule-declaration/tag-refs",
  "abg://gtl-program/rule-declaration/unique-ref",
  "abg://gtl-program/runtime-binding/canonical-abg-start",
  "abg://gtl-program/runtime-binding/module-ref-resolves",
  "abg://gtl-program/runtime-binding/no-product-local-command-router",
  "abg://gtl-program/runtime-binding/plugin-contract-resolves",
  "abg://gtl-program/runtime-binding/plugin-stage-binding-resolves",
  "abg://gtl-program/runtime-binding/public-start-ref-resolves",
  "abg://gtl-program/runtime-binding/stage-binding-resolves",
  "abg://gtl-program/runtime-binding/unique-ref",
  "abg://gtl-program/runtime-reentry/absolute-target-identity",
  "abg://gtl-program/runtime-reentry/lawful-basis",
  "abg://gtl-program/runtime-reentry/relative-offset-not-authority",
  "abg://gtl-program/runtime-reentry/selected-action-kind",
  "abg://gtl-program/runtime-reentry/target-vector-index-resolves",
  "abg://gtl-program/runtime-reentry/unique-ref",
  "abg://gtl-program/runtime-reentry/upstream-disposition",
  "abg://gtl-program/same-object/equality-digest",
  "abg://gtl-program/same-object/nontrivial-proof",
  "abg://gtl-program/same-object/unique-proof-ref",
  "abg://gtl-program/selection-boundary/candidate-refs",
  "abg://gtl-program/selection-boundary/host-ref-resolves",
  "abg://gtl-program/selection-boundary/input-contracts",
  "abg://gtl-program/selection-boundary/output-contracts",
  "abg://gtl-program/selection-boundary/unique-ref",
  "abg://gtl-program/semantic-review-gate/abg-producer-provenance",
  "abg://gtl-program/semantic-review-gate/admitted-result-kind",
  "abg://gtl-program/semantic-review-gate/deterministic-report-digest",
  "abg://gtl-program/semantic-review-gate/no-open-findings",
  "abg://gtl-program/semantic-review-gate/source-package-digest",
  "abg://gtl-program/semantic-review-gate/status-passed",
  "abg://gtl-program/semantic-review-gate/subject-ref",
  "abg://gtl-program/semantic-review-gate/t162-fd-finite-surface",
  "abg://gtl-program/semantic-review-gate/t162-worker-control",
  "abg://gtl-program/semantic-review-gate/unique-ref",
  "abg://gtl-program/source-authority-policy/forbidden-token-required",
  "abg://gtl-program/source-authority-policy/source-surface-prefix-resolves",
  "abg://gtl-program/source-authority-policy/source-surface-ref-resolves",
  "abg://gtl-program/source-authority-policy/unique-ref",
  "abg://gtl-program/source-identity/current-abg-version",
  "abg://gtl-program/source-identity/current-abi-package-version",
  "abg://gtl-program/source-identity/current-compact-abg-version",
  "abg://gtl-program/source-identity/stale-stage-label",
  "abg://gtl-program/target-carrier/envelope-ref",
  "abg://gtl-program/target-carrier/family-ref",
  "abg://gtl-program/target-carrier/fixed-protocol-fields",
  "abg://gtl-program/target-carrier/gtl-ref",
  "abg://gtl-program/target-carrier/literal-domain",
  "abg://gtl-program/target-carrier/no-orphan-row",
  "abg://gtl-program/target-carrier/output-surface",
  "abg://gtl-program/target-carrier/required-fields",
  "abg://gtl-program/target-carrier/schema-ref",
  "abg://gtl-program/target-carrier/target-asset-match",
  "abg://gtl-program/target-carrier/template-ref",
  "abg://gtl-program/target-carrier/unique-vector-row",
  "abg://gtl-program/target-carrier/vector-ref-match",
  "abg://gtl-program/target-carrier/worker-protocol-authority",
  "abg://gtl-program/traversal-bind-conservation/graph-function-ref-match",
  "abg://gtl-program/traversal-bind-conservation/graph-ref-match",
  "abg://gtl-program/traversal-bind-conservation/graph-vector-ref-match",
  "abg://gtl-program/traversal-bind-conservation/no-orphan-row",
  "abg://gtl-program/traversal-bind-conservation/unique-conservation-ref",
  "abg://gtl-program/traversal-unit/bind-conservation-admission-strength",
  "abg://gtl-program/traversal-unit/bind-conservation-ambiguous",
  "abg://gtl-program/traversal-unit/bind-conservation-materialization-coverage",
  "abg://gtl-program/traversal-unit/bind-conservation-required",
  "abg://gtl-program/traversal-unit/bind-conservation-stage-coverage",
  "abg://gtl-program/traversal-unit/bind-conservation-target-carrier-coverage",
  "abg://gtl-program/traversal-unit/compute-composition-required",
  "abg://gtl-program/traversal-unit/consequence-result-interface-required",
  "abg://gtl-program/traversal-unit/edge-closure-ambiguous",
  "abg://gtl-program/traversal-unit/edge-closure-required",
  "abg://gtl-program/traversal-unit/obligation-delta-disposition-coverage",
  "abg://gtl-program/traversal-unit/obligation-delta-family",
  "abg://gtl-program/traversal-unit/plugin-result-interface-required",
  "abg://gtl-program/traversal-unit/public-start-entry",
  "abg://gtl-program/traversal-unit/stage-binding-required",
  "abg://gtl-program/traversal-unit/target-carrier-ambiguous",
  "abg://gtl-program/traversal-unit/target-carrier-required",
  "abg://gtl-program/version/exact-package-version",
  "abg://gtl-program/target-carrier/admissionRef",
  "abg://gtl-program/target-carrier/closurePreconditionRef",
  "abg://gtl-program/target-carrier/constructionTemplateRef",
  "abg://gtl-program/target-carrier/edgeAssuranceBindingRef",
  "abg://gtl-program/target-carrier/handoffProjectionRef",
  "abg://gtl-program/target-carrier/materializationPolicyRef",
  "abg://gtl-program/target-carrier/payloadLedgerBindingRef",
  "abg://gtl-program/target-carrier/replayDigestPolicyRef",
  "abg://gtl-program/traversal-unit/bind-conservation-carried-obligation",
  "abg://gtl-program/traversal-unit/bind-conservation-downstream-terminal-pressure",
  "abg://gtl-program/traversal-unit/bind-conservation-intent-lineage",
  "abg://gtl-program/traversal-unit/bind-conservation-materialization-binding",
  "abg://gtl-program/traversal-unit/bind-conservation-residual-pressure",
  "abg://gtl-program/traversal-unit/bind-conservation-staged-authority",
  "abg://gtl-program/traversal-unit/bind-conservation-target-carrier-binding",
  "abg://gtl-program/declaration/module-export-round-trip",
  "abg://gtl-program/input/declaration-source-kind-field",
  "abg://gtl-program/input/declaration-source-row",
  "abg://gtl-program/contract/golden-instance-digest-required",
  "abg://gtl-program/input/golden-instance-row",
  "abg://gtl-program/input/underdetermined-owner-route-field",
  "abg://gtl-program/input/underdetermined-row",
  "abg://gtl-program/constitution/version-basis-unresolved",
  "abg://gtl-program/constitution/version-line-drift",
  "abg://gtl-program/constitution/release-claim-cites-active-ticket",
  "abg://gtl-program/constitution/surface-digest-missing",
  "abg://gtl-program/constitution/seam-parity-drift",
  "abg://gtl-program/input/constitutional-surface-row",
] as const);

export type GtlProgramDiagnosticId =
  (typeof GTL_PROGRAM_DIAGNOSTIC_ID_VALUES)[number];

const GTL_PROGRAM_DIAGNOSTIC_ID_SET: ReadonlySet<string> = new Set(
  GTL_PROGRAM_DIAGNOSTIC_ID_VALUES
);

// Implements: REQ-L-GTL3-LAWS-020
// Admissible repair affordance: typed lawful repair moves for a ratified
// diagnostic. Routing truth only — it does not perform, select, or authorize
// the repair.
export const GTL_PROGRAM_REPAIR_EDIT_CLASS_VALUES = Object.freeze([
  "add_missing_declaration",
  "correct_reference",
  "correct_field_shape",
  "remove_duplicate_declaration",
  "align_digest_or_version",
  "realize_declared_semantics",
  "constitutional_reprice"
] as const);

export type GtlProgramRepairEditClass =
  (typeof GTL_PROGRAM_REPAIR_EDIT_CLASS_VALUES)[number];

export interface GtlProgramAdmissibleRepair {
  readonly kind: "gtl_program_admissible_repair";
  readonly editClass: GtlProgramRepairEditClass;
  readonly repairSurfaceRef: string;
  readonly changeClassRef: string | null;
}

// Implements: REQ-L-GTL3-LAWS-020
// Ratified default repair routing for the top diagnostic set. One table is
// the single truth surface for default repair affordances; callers may
// override per issue, and unmapped diagnostics carry no default repair.
export const GTL_PROGRAM_DEFAULT_ADMISSIBLE_REPAIRS: Readonly<
  Record<string, GtlProgramRepairEditClass>
> = Object.freeze({
  "abg://gtl-program/input/object": "correct_field_shape",
  "abg://gtl-program/input/module": "add_missing_declaration",
  "abg://gtl-program/input/graph-function": "add_missing_declaration",
  "abg://gtl-program/input/string-field": "correct_field_shape",
  "abg://gtl-program/input/string-array": "correct_field_shape",
  "abg://gtl-program/input/array-field": "correct_field_shape",
  "abg://gtl-program/input/non-negative-integer-array": "correct_field_shape",
  "abg://gtl-program/requirements-algebra/open-payload": "correct_field_shape",
  "abg://gtl-program/source-identity/current-abg-version":
    "align_digest_or_version",
  "abg://gtl-program/installed-context/version-line": "align_digest_or_version",
  "abg://gtl-program/prompt-asset/rendered-view-digest":
    "align_digest_or_version",
  "abg://gtl-program/coverage/expected-coverage-required":
    "add_missing_declaration",
  "abg://gtl-program/declaration/duplicate-key":
    "remove_duplicate_declaration",
  "abg://gtl-program/declaration/host-compatible": "correct_reference",
  "abg://gtl-program/declaration/reserved-key-registered":
    "correct_reference",
  "abg://gtl-program/declaration/value-kind": "correct_field_shape",
  "abg://gtl-program/execution-declaration/invalid": "correct_field_shape",
  "abg://gtl-program/public-start/overlay-required": "add_missing_declaration",
  "abg://gtl-program/graph-vector/unique-ref": "remove_duplicate_declaration",
  "abg://gtl-program/runtime-reentry/lawful-basis": "correct_reference",
  "abg://gtl-program/semantic-review-gate/admitted-result-kind":
    "correct_reference",
  "abg://gtl-program/declaration/module-export-round-trip":
    "align_digest_or_version",
  "abg://gtl-program/contract/golden-instance-digest-required":
    "align_digest_or_version",
  "abg://gtl-program/constitution/version-line-drift":
    "align_digest_or_version",
  "abg://gtl-program/constitution/release-claim-cites-active-ticket":
    "constitutional_reprice",
  "abg://gtl-program/constitution/surface-digest-missing":
    "align_digest_or_version",
  "abg://gtl-program/constitution/seam-parity-drift":
    "correct_reference",
  "abg://gtl-program/c-algebra/invalid-program": "correct_field_shape",
  "abg://gtl-program/c-algebra/semantic-not-realized":
    "realize_declared_semantics",
  "abg://gtl-program/c-algebra/unresolved-graph-function":
    "correct_reference",
  "abg://gtl-program/hof/invalid-program": "correct_field_shape",
  "abg://gtl-program/hof/semantic-not-realized":
    "realize_declared_semantics",
  "abg://gtl-program/graph-function-application/invalid-program":
    "correct_field_shape",
  "abg://gtl-program/graph-function-application/semantic-not-realized":
    "realize_declared_semantics"
});

export interface GtlProgramConformanceIssue {
  readonly kind: "gtl_program_conformance_issue";
  readonly severity: "error";
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly surfaceRef: string;
  readonly ruleRef: string;
  readonly message: string;
  readonly evidenceRefs: readonly string[];
  readonly admissibleRepairs: readonly GtlProgramAdmissibleRepair[];
}

export interface GtlProgramTargetCarrierRow {
  readonly edgeRef: string;
  readonly graphVectorRef: string;
  readonly graphFunctionId: string;
  readonly graphId: string;
  readonly graphVectorId: string;
  readonly targetAssetType: string;
  readonly targetCarrierContractRef: string;
  readonly targetCarrierContractDigest: string;
  readonly targetCarrierTemplateRef: string;
  readonly outputSurfaceRef: string;
  readonly outputCarrierFamilyRef: string;
  readonly outputCarrierKind: string;
  readonly envelopeContractRef: string;
  readonly nestedPayloadPath: string;
  readonly requiredFieldRefs: readonly string[];
  readonly optionalFieldRefs: readonly string[];
  readonly fixedProtocolFieldRefs: readonly string[];
  readonly workerFillableFieldRefs: readonly string[];
  readonly literalDomainRefs: readonly string[];
  readonly enumDomainRefs: readonly string[];
  readonly schemaRef: string;
  readonly admissionRef: string;
  readonly payloadLedgerBindingRef: string;
  readonly edgeAssuranceBindingRef: string;
  readonly handoffProjectionRef: string;
  readonly constructionTemplateRef: string;
  readonly replayDigestPolicyRef: string;
  readonly materializationPolicyRef: string;
  readonly closurePreconditionRef: string;
}

export interface GtlProgramEdgeClosureRow {
  readonly edgeRef: string;
  readonly graphFunctionId: string;
  readonly graphId: string;
  readonly graphVectorId: string;
  readonly targetAssetType: string;
}

export interface GtlProgramOverlayRow {
  readonly overlayRef: string;
  readonly graphFunctionRefs: readonly string[];
  readonly graphVectorRefs: readonly string[];
  readonly publicStartTargets: readonly string[];
  readonly defaultStartTarget: string;
}

export interface GtlProgramPublicStartRow {
  readonly name: string;
  readonly graphFunctionRef: string;
  readonly overlayRefs: readonly string[];
  readonly defaultForOverlayRefs: readonly string[];
}

export interface GtlProgramPromptAssetRow {
  readonly surfaceRef: string;
  readonly assetSurface: AssetSurface;
  readonly gtlNode?: Node | undefined;
  readonly renderedViewDigest?: string | null | undefined;
  readonly currentAbgFoldRefs?: readonly string[] | undefined;
  readonly evidenceRefs?: readonly string[] | undefined;
}

export interface GtlProgramSourceIdentityRow {
  readonly surfaceRef: string;
  readonly text: string;
  readonly evidenceRefs?: readonly string[] | undefined;
}

export type GtlProgramSourceAuthorityTokenMatchMode = "any" | "all";

export interface GtlProgramSourceAuthorityPolicyRow {
  readonly policyRef: string;
  readonly sourceSurfaceRefs: readonly string[];
  readonly sourceSurfaceRefPrefixes: readonly string[];
  readonly forbiddenTokens: readonly string[];
  readonly forbiddenMatch: GtlProgramSourceAuthorityTokenMatchMode;
  readonly requiredMitigationTokens: readonly string[];
  readonly message: string;
  readonly evidenceRefs?: readonly string[] | undefined;
}

export type GtlProgramSemanticReviewStatus =
  | "passed"
  | "failed"
  | "blocked";

export const ABG_SEMANTIC_COMPILER_FP_REVIEW_GRAPH_FUNCTION_REF =
  "graph-function://abiogenesis/semantic-compiler-fp-review/v1" as const;
export const ABG_SEMANTIC_COMPILER_FP_REVIEW_GRAPH_FUNCTION_ID =
  "abg.semanticCompiler.fpReview" as const;
export const ABG_SEMANTIC_COMPILER_FP_REVIEW_RUNTIME_REF =
  "runtime://abiogenesis/semantic-compiler-fp-review/v1" as const;
export const ABG_SEMANTIC_COMPILER_FP_REVIEW_ADMISSION_REF =
  "admission://abiogenesis/semantic-compiler-fp-review-result/v1" as const;
export const ABG_SEMANTIC_COMPILER_FP_REVIEW_RESULT_KIND =
  "sdlc_semantic_compiler_fp_review_result" as const;
export const ABG_SEMANTIC_COMPILER_FP_REVIEW_RESULT_VERSION =
  "ts-semantic-compiler-fp-review-result-t162-v1" as const;
export const ABG_SEMANTIC_COMPILER_FP_REVIEW_RUNTIME_KIND =
  "abg_graph_function" as const;
export const ABG_SEMANTIC_COMPILER_FP_REVIEW_WORKER_CONTROL_CONTRACT_REF =
  "contract://abiogenesis/semantic-compiler-fp-worker-control/t162/v1" as const;
export const ABG_SEMANTIC_COMPILER_FP_REVIEW_REQUIRED_ARTIFACT_DELTA_KIND =
  "semantic_review_result_or_residual_pressure" as const;
export const ABG_SEMANTIC_COMPILER_FP_REVIEW_PACKAGE_GRAMMAR_REF =
  "grammar://abiogenesis/semantic-compiler-fp-review-package/t162/v1" as const;
export const ABG_SEMANTIC_COMPILER_FP_REVIEW_RESULT_GRAMMAR_REF =
  "grammar://abiogenesis/semantic-compiler-fp-review-result/t162/v1" as const;
export const ABG_SEMANTIC_COMPILER_FP_REVIEW_PROGRESS_TELEMETRY_GRAMMAR_REF =
  "grammar://abiogenesis/semantic-compiler-fp-review-progress-telemetry/t162/v1" as const;
export const ABG_SEMANTIC_COMPILER_FP_REVIEW_PROGRESS_METRIC_REF =
  "metric://abiogenesis/semantic-compiler-fp-review-artifact-delta/t162/v1" as const;
export const ABG_SEMANTIC_COMPILER_FP_REVIEW_ADMISSION_FSM_REF =
  "fsm://abiogenesis/semantic-compiler-fp-review-admission/t162/v1" as const;
export const ABG_SEMANTIC_COMPILER_FP_REVIEW_OUTPUT_STATE_ENUM_REF =
  "enum://abiogenesis/semantic-compiler-fp-review-output-state/t162/v1" as const;
export const ABG_SEMANTIC_COMPILER_FP_REVIEW_DERIVATION_RULE_REF =
  "derivation://abiogenesis/semantic-compiler-fp-review-fd-boundary/t162/v1" as const;
export const ABG_SEMANTIC_COMPILER_FP_REVIEW_FD_FORBIDDEN_INTERPRETATION =
  "F_D may validate review package/result/gate shape, digest/provenance, admitted status, artifact-delta telemetry, and finite output state only; it must not author semantic rows, choose decomposition, judge ambiguous satisfaction, infer worker plan quality, or treat non-progress as closure." as const;

export interface AbgSemanticCompilerFpReviewPackageIdentity {
  readonly kind: string;
  readonly packageVersion: string;
  readonly subjectRef: string;
  readonly deterministicReportDigest: string;
  readonly workerControlContractRef:
    typeof ABG_SEMANTIC_COMPILER_FP_REVIEW_WORKER_CONTROL_CONTRACT_REF;
  readonly authorityPacketRef: string;
  readonly objectiveRef: string;
  readonly targetArtifactRef: string;
  readonly toolBoundaryRefs: readonly string[];
  readonly requiredArtifactDeltaKind:
    typeof ABG_SEMANTIC_COMPILER_FP_REVIEW_REQUIRED_ARTIFACT_DELTA_KIND;
  readonly stopConditionRef: string;
  readonly fdPackageGrammarRef:
    typeof ABG_SEMANTIC_COMPILER_FP_REVIEW_PACKAGE_GRAMMAR_REF;
  readonly fdResultGrammarRef:
    typeof ABG_SEMANTIC_COMPILER_FP_REVIEW_RESULT_GRAMMAR_REF;
  readonly fdProgressTelemetryGrammarRef:
    typeof ABG_SEMANTIC_COMPILER_FP_REVIEW_PROGRESS_TELEMETRY_GRAMMAR_REF;
  readonly fdProgressMetricRef:
    typeof ABG_SEMANTIC_COMPILER_FP_REVIEW_PROGRESS_METRIC_REF;
  readonly fdAdmissionFsmRef:
    typeof ABG_SEMANTIC_COMPILER_FP_REVIEW_ADMISSION_FSM_REF;
  readonly fdOutputStateEnumRef:
    typeof ABG_SEMANTIC_COMPILER_FP_REVIEW_OUTPUT_STATE_ENUM_REF;
  readonly fdDerivationRuleRef:
    typeof ABG_SEMANTIC_COMPILER_FP_REVIEW_DERIVATION_RULE_REF;
  readonly fdForbiddenInterpretation:
    typeof ABG_SEMANTIC_COMPILER_FP_REVIEW_FD_FORBIDDEN_INTERPRETATION;
}

export interface AbgSemanticCompilerFpReviewPackageInput {
  readonly kind: string;
  readonly packageVersion: string;
  readonly subjectRef: string;
  readonly deterministicReportDigest: string;
  readonly authorityPacketRef: string;
  readonly objectiveRef: string;
  readonly targetArtifactRef: string;
  readonly toolBoundaryRefs: readonly string[];
  readonly stopConditionRef: string;
}

export function constructAbgSemanticCompilerFpReviewPackageIdentity(
  input: AbgSemanticCompilerFpReviewPackageInput
): AbgSemanticCompilerFpReviewPackageIdentity {
  return Object.freeze({
    kind: input.kind,
    packageVersion: input.packageVersion,
    subjectRef: input.subjectRef,
    deterministicReportDigest: input.deterministicReportDigest,
    workerControlContractRef:
      ABG_SEMANTIC_COMPILER_FP_REVIEW_WORKER_CONTROL_CONTRACT_REF,
    authorityPacketRef: input.authorityPacketRef,
    objectiveRef: input.objectiveRef,
    targetArtifactRef: input.targetArtifactRef,
    toolBoundaryRefs: Object.freeze([...input.toolBoundaryRefs]),
    requiredArtifactDeltaKind:
      ABG_SEMANTIC_COMPILER_FP_REVIEW_REQUIRED_ARTIFACT_DELTA_KIND,
    stopConditionRef: input.stopConditionRef,
    fdPackageGrammarRef:
      ABG_SEMANTIC_COMPILER_FP_REVIEW_PACKAGE_GRAMMAR_REF,
    fdResultGrammarRef: ABG_SEMANTIC_COMPILER_FP_REVIEW_RESULT_GRAMMAR_REF,
    fdProgressTelemetryGrammarRef:
      ABG_SEMANTIC_COMPILER_FP_REVIEW_PROGRESS_TELEMETRY_GRAMMAR_REF,
    fdProgressMetricRef:
      ABG_SEMANTIC_COMPILER_FP_REVIEW_PROGRESS_METRIC_REF,
    fdAdmissionFsmRef: ABG_SEMANTIC_COMPILER_FP_REVIEW_ADMISSION_FSM_REF,
    fdOutputStateEnumRef:
      ABG_SEMANTIC_COMPILER_FP_REVIEW_OUTPUT_STATE_ENUM_REF,
    fdDerivationRuleRef:
      ABG_SEMANTIC_COMPILER_FP_REVIEW_DERIVATION_RULE_REF,
    fdForbiddenInterpretation:
      ABG_SEMANTIC_COMPILER_FP_REVIEW_FD_FORBIDDEN_INTERPRETATION
  });
}

export interface AbgSemanticCompilerFpReviewResult {
  readonly kind: typeof ABG_SEMANTIC_COMPILER_FP_REVIEW_RESULT_KIND;
  readonly reviewVersion:
    typeof ABG_SEMANTIC_COMPILER_FP_REVIEW_RESULT_VERSION;
  readonly subjectRef: string;
  readonly deterministicReportDigest: string;
  readonly sourcePackageKind: string;
  readonly sourcePackageVersion: string;
  readonly sourcePackageDigest: string;
  readonly workerControlContractRef:
    typeof ABG_SEMANTIC_COMPILER_FP_REVIEW_WORKER_CONTROL_CONTRACT_REF;
  readonly authorityPacketRef: string;
  readonly objectiveRef: string;
  readonly targetArtifactRef: string;
  readonly toolBoundaryRefs: readonly string[];
  readonly requiredArtifactDeltaKind:
    typeof ABG_SEMANTIC_COMPILER_FP_REVIEW_REQUIRED_ARTIFACT_DELTA_KIND;
  readonly stopConditionRef: string;
  readonly fdPackageGrammarRef:
    typeof ABG_SEMANTIC_COMPILER_FP_REVIEW_PACKAGE_GRAMMAR_REF;
  readonly fdResultGrammarRef:
    typeof ABG_SEMANTIC_COMPILER_FP_REVIEW_RESULT_GRAMMAR_REF;
  readonly fdProgressTelemetryGrammarRef:
    typeof ABG_SEMANTIC_COMPILER_FP_REVIEW_PROGRESS_TELEMETRY_GRAMMAR_REF;
  readonly fdProgressMetricRef:
    typeof ABG_SEMANTIC_COMPILER_FP_REVIEW_PROGRESS_METRIC_REF;
  readonly fdAdmissionFsmRef:
    typeof ABG_SEMANTIC_COMPILER_FP_REVIEW_ADMISSION_FSM_REF;
  readonly fdOutputStateEnumRef:
    typeof ABG_SEMANTIC_COMPILER_FP_REVIEW_OUTPUT_STATE_ENUM_REF;
  readonly fdDerivationRuleRef:
    typeof ABG_SEMANTIC_COMPILER_FP_REVIEW_DERIVATION_RULE_REF;
  readonly fdForbiddenInterpretation:
    typeof ABG_SEMANTIC_COMPILER_FP_REVIEW_FD_FORBIDDEN_INTERPRETATION;
  readonly status: GtlProgramSemanticReviewStatus;
  readonly findingCount: number;
  readonly reviewerProfileRef: string;
  readonly reviewedAt: string;
  readonly producerGraphFunctionRef:
    typeof ABG_SEMANTIC_COMPILER_FP_REVIEW_GRAPH_FUNCTION_REF;
  readonly producerGraphFunctionDigest: string;
  readonly producerRuntimeKind:
    typeof ABG_SEMANTIC_COMPILER_FP_REVIEW_RUNTIME_KIND;
  readonly producerRuntimeRef:
    typeof ABG_SEMANTIC_COMPILER_FP_REVIEW_RUNTIME_REF;
  readonly admissionRef: typeof ABG_SEMANTIC_COMPILER_FP_REVIEW_ADMISSION_REF;
  readonly evidenceRefs: readonly string[];
}

export interface AbgSemanticCompilerFpReviewResultAdmission {
  readonly admitted: boolean;
  readonly passed: boolean;
  readonly reason: string;
  readonly issues: readonly string[];
  readonly result: AbgSemanticCompilerFpReviewResult | null;
}

export interface AbgSemanticCompilerFpReviewRunResult {
  readonly kind: "abg_semantic_compiler_fp_review_run_result";
  readonly graphFunctionRef:
    typeof ABG_SEMANTIC_COMPILER_FP_REVIEW_GRAPH_FUNCTION_REF;
  readonly graphFunctionDigest: string;
  readonly graphId: string;
  readonly vectorId: string;
  readonly vectorIndex: 0;
  readonly edgeRef: string;
  readonly regime: "F_P";
  readonly result: AbgSemanticCompilerFpReviewResult;
  readonly admission: AbgSemanticCompilerFpReviewResultAdmission;
  readonly evidenceRefs: readonly string[];
}

export interface GtlProgramSemanticReviewGateRow {
  readonly gateRef: string;
  readonly subjectRef: string;
  readonly deterministicReportDigest: string;
  readonly reviewResultKind: "sdlc_semantic_compiler_fp_review_result";
  readonly reviewVersion: string;
  readonly sourcePackageDigest: string;
  readonly workerControlContractRef: string;
  readonly authorityPacketRef: string;
  readonly objectiveRef: string;
  readonly targetArtifactRef: string;
  readonly toolBoundaryRefs: readonly string[];
  readonly requiredArtifactDeltaKind: string;
  readonly stopConditionRef: string;
  readonly fdPackageGrammarRef: string;
  readonly fdResultGrammarRef: string;
  readonly fdProgressTelemetryGrammarRef: string;
  readonly fdProgressMetricRef: string;
  readonly fdAdmissionFsmRef: string;
  readonly fdOutputStateEnumRef: string;
  readonly fdDerivationRuleRef: string;
  readonly fdForbiddenInterpretation: string;
  readonly status: GtlProgramSemanticReviewStatus;
  readonly findingCount: number;
  readonly reviewerProfileRef: string;
  readonly reviewedAt: string;
  readonly producerGraphFunctionRef: string;
  readonly producerGraphFunctionDigest: string;
  readonly producerRuntimeKind: string;
  readonly producerRuntimeRef: string;
  readonly admissionRef: string;
  readonly evidenceRefs?: readonly string[] | undefined;
}

export type GtlProgramHostSurfaceKind =
  | "graph_function"
  | "graph_vector"
  | "operator"
  | "evaluator"
  | "rule"
  | "job"
  | "role"
  | "module"
  | "candidate_family"
  | "refinement_boundary"
  | "visible_defaults"
  | "external_tool";

export interface GtlProgramSameObjectRow {
  readonly proofRef: string;
  readonly leftRef: string;
  readonly rightRef: string;
  readonly equalityDigest: string;
  readonly evidenceRefs?: readonly string[] | undefined;
}

export interface GtlProgramOperatorDeclarationRow {
  readonly operatorRef: string;
  readonly name: string;
  readonly regime: Regime;
  readonly binding: string;
  readonly hostKind: GtlProgramHostSurfaceKind;
  readonly hostRef: string;
  readonly tagRefs: readonly string[];
  readonly evidenceRefs?: readonly string[] | undefined;
}

export interface GtlProgramEvaluatorDeclarationRow {
  readonly evaluatorRef: string;
  readonly name: string;
  readonly regime: Regime;
  readonly description: string;
  readonly binding: string;
  readonly consumedFieldRefs: readonly string[];
  readonly hostKind: GtlProgramHostSurfaceKind;
  readonly hostRef: string;
  readonly tagRefs: readonly string[];
  readonly evidenceRefs?: readonly string[] | undefined;
}

export interface GtlProgramRuleDeclarationRow {
  readonly ruleRef: string;
  readonly name: string;
  readonly ruleKind: string;
  readonly configDigest: string;
  readonly hostKind: GtlProgramHostSurfaceKind;
  readonly hostRef: string;
  readonly tagRefs: readonly string[];
  readonly evidenceRefs?: readonly string[] | undefined;
}

export type GtlProgramCompositionDeclarationSourceKind =
  | "graph_vector_declaration"
  | "graph_function_declaration"
  | "operator_declaration"
  | "evaluator_declaration"
  | "rule_declaration"
  | "job_policy_hook"
  | "role_policy_hook"
  | "module_policy_hook"
  | "visible_defaults"
  | "published_template";

export interface GtlProgramComputeCompositionRow {
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly hostKind: GtlProgramHostSurfaceKind;
  readonly hostRef: string;
  readonly declarationSourceKind: GtlProgramCompositionDeclarationSourceKind;
  readonly declarationSourceRef: string;
  readonly notationRefs: readonly string[];
  readonly regimeBindingRefs: readonly string[];
  readonly stageBindingRefs: readonly string[];
  readonly closureContractRef: string;
  readonly evidenceRefs?: readonly string[] | undefined;
}

export type GtlProgramStageRegimeDisposition =
  | "participates"
  | "not_used"
  | "external_callout";

export interface GtlProgramStageRegimeDispositionRow {
  readonly regime: Regime;
  readonly disposition: GtlProgramStageRegimeDisposition;
  readonly selectedRegimeBindingRefs: readonly string[];
  readonly reasonRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface GtlProgramComputeStageBindingRow {
  readonly stageBindingRef: string;
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly stageRole: EngineComputeStageRole;
  readonly stageNotationRef: string;
  readonly stagePurpose: EngineComputeStagePurpose;
  readonly computeMeans: Regime;
  readonly inputCarrierRefs: readonly string[];
  readonly outputCarrierRefs: readonly string[];
  readonly predecessorStageBindingRefs: readonly string[];
  readonly pluginContractRefs: readonly string[];
  readonly hookRefs: readonly string[];
  readonly regimeDispositions: readonly GtlProgramStageRegimeDispositionRow[];
  readonly mayWriteLedgers: false;
  readonly mayEmitRuntimeEvents: false;
  readonly maySelectTraversal: false;
  readonly mayCloseTraversal: false;
  readonly mayOwnIterationLoop: false;
  readonly evidenceRefs?: readonly string[] | undefined;
}

export interface GtlProgramPluginResultInterfaceRow {
  readonly resultInterfaceRef: string;
  readonly stageBindingRef: string;
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly stageRole: EngineComputeStageRole;
  readonly computeMeans: Regime;
  readonly resultEnvelopeContractRef: string;
  readonly resultCarrierKind: string;
  readonly outputCarrierRefs: readonly string[];
  readonly producedCarrierRefs: readonly string[];
  readonly requiredIdentityFieldRefs: readonly string[];
  readonly selectorAuthorityRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly mayWriteLedgers: false;
  readonly mayEmitRuntimeEvents: false;
  readonly maySelectTraversal: false;
  readonly mayCloseTraversal: false;
  readonly mayOwnIterationLoop: false;
}

export type GtlProgramHookDeclarationSourceKind =
  | "graph_vector_declaration"
  | "graph_function_declaration"
  | "job_policy_hook"
  | "role_policy_hook"
  | "module_policy_hook"
  | "candidate_family_policy_hint"
  | "visible_defaults";

export interface GtlProgramHookBoundaryRow {
  readonly hookRef: string;
  readonly hookKey: string;
  readonly hostKind: GtlProgramHostSurfaceKind;
  readonly hostRef: string;
  readonly declarationSourceKind: GtlProgramHookDeclarationSourceKind;
  readonly declarationRef: string;
  readonly precedenceRank: number;
  readonly concernRefs: readonly string[];
  readonly pluginContractRefs: readonly string[];
  readonly evidenceRefs?: readonly string[] | undefined;
}

export type GtlProgramSelectionBoundaryKind =
  | "refinement_boundary"
  | "candidate_family"
  | "subwork"
  | "synthesis";

export interface GtlProgramSelectionBoundaryRow {
  readonly boundaryRef: string;
  readonly boundaryKind: GtlProgramSelectionBoundaryKind;
  readonly hostRef: string;
  readonly inputContractRefs: readonly string[];
  readonly outputContractRefs: readonly string[];
  readonly candidateRefs: readonly string[];
  readonly evidenceRefs?: readonly string[] | undefined;
}

export interface GtlProgramJobBindingRow {
  readonly jobRef: string;
  readonly contractTargetRefs: readonly string[];
  readonly roleRefs: readonly string[];
  readonly policyHookRefs: readonly string[];
  readonly publicCallableGraphFunctionRefs: readonly string[];
  readonly evidenceRefs?: readonly string[] | undefined;
}

export interface GtlProgramRoleBindingRow {
  readonly roleRef: string;
  readonly capabilityRefs: readonly string[];
  readonly policyHookRefs: readonly string[];
  readonly evidenceRefs?: readonly string[] | undefined;
}

export interface GtlProgramExternalToolGateRow {
  readonly toolGateRef: string;
  readonly toolRef: string;
  readonly boundaryRef: string;
  readonly transportRef: string;
  readonly payloadContractRef: string;
  readonly admissionRef: string;
  readonly notLanguageTruthEvidenceRefs: readonly string[];
  readonly evidenceRefs?: readonly string[] | undefined;
}

export type GtlProgramRuntimeBindingKind =
  | "abg_cli_runtime_binding"
  | "abg_public_callable_start"
  | "abg_public_control_loop";

export interface GtlProgramRuntimeBindingRow {
  readonly bindingRef: string;
  readonly runtimeBindingKind: GtlProgramRuntimeBindingKind;
  readonly moduleRef: string;
  readonly publicStartRef: string;
  readonly commandRef: string;
  readonly pluginContractRefs: readonly string[];
  readonly stageBindingRefs: readonly string[];
  readonly consumesPluginsThroughAbg: true;
  readonly forbidsProductLocalIteration: true;
  readonly evidenceRefs?: readonly string[] | undefined;
}

// Implements: REQ-L-GTL3-LAWS-022
// Witnessed declaration-source truth (T-187 witness/judge pattern): startup
// reports HOW each declaration surface was authored; the compiler judges.
export const GTL_PROGRAM_DECLARATION_SOURCE_KIND_VALUES = Object.freeze([
  "canonical_data",
  "module_export"
] as const);

export type GtlProgramDeclarationSourceKind =
  (typeof GTL_PROGRAM_DECLARATION_SOURCE_KIND_VALUES)[number];

export interface GtlProgramDeclarationSourceRow {
  readonly sourceRef: string;
  readonly sourceKind: string;
  readonly canonicalDigest: string;
  // Implements: REQ-L-GTL3-LAWS-025 — factory provenance, reference-joined
  // to runtime lineage only; never traversal authority.
  readonly authorRef: string;
  readonly authorityRef: string;
  readonly evidenceRefs?: readonly string[] | undefined;
}

// Implements: REQ-L-GTL3-LAWS-028 (T-193). Constitutional surfaces become
// the model half of a live gap computation: loaders WITNESS rows (surface
// ref, digest, declared version, cited ticket refs) plus live facts; the
// compiler JUDGES drift as typed diagnostics with repair affordances.
// Drift is delta, not a review catch.
export type SourceProjectRef = `source-project://${string}`;

export type PublishedRcCutRef = `published-rc-cut://${string}`;

export type ReleaseCutRef = `release-cut://${string}`;

export type ProductRef = `product://${string}`;

export type InstalledProductRef = `installed-product://${string}`;

export const CONSTITUTIONAL_VERSION_SUBJECT_KIND_VALUES = Object.freeze([
  "source_project",
  "published_rc_cut",
  "release_cut",
  "product",
  "installed_product"
] as const);

export type ConstitutionalVersionSubject =
  | {
      readonly kind: "source_project";
      readonly subjectRef: SourceProjectRef;
    }
  | {
      readonly kind: "published_rc_cut";
      readonly subjectRef: PublishedRcCutRef;
    }
  | {
      readonly kind: "release_cut";
      readonly subjectRef: ReleaseCutRef;
    }
  | {
      readonly kind: "product";
      readonly subjectRef: ProductRef;
    }
  | {
      readonly kind: "installed_product";
      readonly subjectRef: InstalledProductRef;
    };

interface GtlProgramConstitutionalSurfaceRowBase {
  readonly surfaceRef: string;
  readonly digest: string;
  readonly citedTicketRefs: readonly string[];
}

export type GtlProgramConstitutionalSurfaceRow =
  GtlProgramConstitutionalSurfaceRowBase &
    (
      | {
          readonly versionDisposition: "unversioned";
          readonly declaredVersion: null;
          readonly versionBindingRef: null;
        }
      | {
          readonly versionDisposition: "versioned";
          readonly declaredVersion: string;
          readonly versionBindingRef: string;
        }
    );

export interface GtlProgramConstitutionalSurfaceVersionBinding {
  readonly bindingRef: string;
  readonly surfaceRef: string;
  readonly subject: ConstitutionalVersionSubject;
  readonly authorityRef: string;
}

export interface GtlProgramConstitutionalVersionFact {
  readonly subject: ConstitutionalVersionSubject;
  readonly version: string;
  readonly authorityRef: string;
}

type ConstitutionalVersionBasisReason =
  | "subject_kind_ref_incoherent"
  | "surface_binding_missing"
  | "surface_binding_ambiguous"
  | "version_fact_missing"
  | "version_fact_ambiguous";

const VERSION_BASIS_REPAIR_EDIT_CLASS = Object.freeze({
  subject_kind_ref_incoherent: "correct_reference",
  surface_binding_missing: "add_missing_declaration",
  surface_binding_ambiguous: "remove_duplicate_declaration",
  version_fact_missing: "add_missing_declaration",
  version_fact_ambiguous: "remove_duplicate_declaration"
} as const satisfies Readonly<
  Record<ConstitutionalVersionBasisReason, GtlProgramRepairEditClass>
>);

export interface GtlProgramConstitutionalLiveFacts {
  readonly surfaceVersionBindings:
    readonly GtlProgramConstitutionalSurfaceVersionBinding[];
  readonly versionFacts: readonly GtlProgramConstitutionalVersionFact[];
  readonly activeTicketRefs: readonly string[];
  readonly passthroughKeys: readonly string[];
  readonly seamKeySets: readonly {
    readonly seamRef: string;
    readonly keys: readonly string[];
  }[];
}

// Implements: REQ-L-GTL3-LAWS-023
// ONE RULE HOME: these row shapes and predicates are consumed by BOTH the
// program-level conformance checks here AND the plan-compile validation in
// instruction_assembly (T-191 acceptance 3/4). Reprice the law HERE.
export function goldenInstanceBindingHasDigest(row: {
  readonly instanceSetDigest: string;
}): boolean {
  return row.instanceSetDigest.trim().length > 0;
}

export function goldenInstanceBindingHasMaterial(row: {
  readonly exampleInstanceRefs: readonly string[];
  readonly counterexampleInstanceRefs: readonly string[];
}): boolean {
  return row.exampleInstanceRefs.length > 0 || row.counterexampleInstanceRefs.length > 0;
}

export interface GtlProgramGoldenInstanceBindingRow {
  readonly contractRef: string;
  readonly exampleInstanceRefs: readonly string[];
  readonly counterexampleInstanceRefs: readonly string[];
  readonly instanceSetDigest: string;
}

// Implements: REQ-L-GTL3-LAWS-024
function evidenceRefStrings(value: unknown): readonly string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const rows: readonly unknown[] = value;
  return rows.map((entry) => String(entry));
}

export const GTL_PROGRAM_UNDETERMINED_OWNER_ROUTE_VALUES = Object.freeze([
  "F_P",
  "F_H"
] as const);

export interface GtlProgramUnderdeterminedDeclarationRow {
  readonly scopeRef: string;
  readonly ownerRoute: string;
  readonly latitudeNote: string;
}

export interface GtlProgramInstalledContextRow {
  readonly contextRef: string;
  readonly abiPackageVersion: string;
  readonly selectedProductVersion: string;
  readonly contextText: string;
  readonly toolchainBindingRef: string;
  readonly evidenceRefs?: readonly string[] | undefined;
}

export type GtlProgramRepairSurfaceDisposition =
  | "current_edge_repair"
  | "upstream_reentry"
  | "downstream_deferred"
  | "external_blocked";

export const GTL_PROGRAM_OBLIGATION_DELTA_FAMILY_VALUES = Object.freeze([
  "realized",
  "refined",
  "downstream_deferred",
  "blocked",
  "reentered",
  "repriced",
  "no_close_preserved",
  "terminal_projected"
] as const);

export type GtlProgramObligationDeltaFamily =
  (typeof GTL_PROGRAM_OBLIGATION_DELTA_FAMILY_VALUES)[number];

export const GTL_PROGRAM_BIND_ADMISSION_STRENGTH_COMPATIBILITY_REF =
  "admission-strength://abg/bind-boundary/materialization-stage-compatible" as const;

export interface GtlProgramRuntimeReentryRouteRow {
  readonly routeRef: string;
  readonly repairSurfaceDisposition: GtlProgramRepairSurfaceDisposition;
  readonly selectedActionKind: "reenter_graph_span";
  readonly graphReentryPoint: GraphReentryPoint;
  readonly repairGraphFunctionRef: string;
  readonly repairGraphVectorRef: string;
  readonly repairGraphFunctionId: string;
  readonly repairGraphId: string;
  readonly repairGraphVectorId: string;
  readonly reentryTargetVectorIndex: number;
  readonly repairAssetRef: string;
  readonly targetOutcomeRef: string;
  readonly observationBindingRef: string;
  readonly lawfulBasisRefs: readonly string[];
  readonly evidenceRefs?: readonly string[] | undefined;
}

export interface GtlProgramTraversalBindConservationRow {
  readonly conservationRef: string;
  readonly graphFunctionRef: string;
  readonly graphRef: string;
  readonly graphVectorRef: string;
  readonly graphFunctionId: string;
  readonly graphId: string;
  readonly graphVectorId: string;
  readonly intentLineageRefs: readonly string[];
  readonly targetCarrierBindingRefs: readonly string[];
  readonly materializationBindingRefs: readonly string[];
  readonly carriedObligationRefs: readonly string[];
  readonly residualPressureRefs: readonly string[];
  readonly stagedAuthorityRefs: readonly string[];
  readonly admissionStrengthRefs: readonly string[];
  readonly downstreamTerminalPressureRefs: readonly string[];
  readonly allowedObligationDeltaFamilies:
    readonly GtlProgramObligationDeltaFamily[];
  readonly evidenceRefs?: readonly string[] | undefined;
}

export const GTL_PROGRAM_T153_FEATURE_KINDS = Object.freeze([
  "graph_structure_interface",
  "graph_algebra_edge",
  "graph_algebra_compose",
  "graph_algebra_substitute",
  "graph_algebra_recurse",
  "graph_algebra_fan_out",
  "graph_algebra_fan_in",
  "graph_algebra_gate",
  "graph_algebra_promote",
  "graph_algebra_identity",
  "graph_algebra_same_object",
  "operator_declarations",
  "evaluator_declarations",
  "rule_declarations",
  "f_star_compute_composition",
  "hook_boundaries",
  "target_carrier_contract_law",
  "edge_closure_contract_law",
  "prompt_typed_asset_law",
  "selection_refinement_synthesis_subwork",
  "module_publication",
  "public_start_binding",
  "job_binding",
  "role_binding",
  "external_tool_gates",
  "active_source_identity"
] as const);

export type GtlProgramT153FeatureKind =
  (typeof GTL_PROGRAM_T153_FEATURE_KINDS)[number];

export type GtlProgramFeatureDisposition = "present" | "not_used";

export type GtlProgramFeatureOwnerClassification =
  | "gtl_declared"
  | "abg_admitted"
  | "abg_interpreted"
  | "downstream_product_meaning";

export interface GtlProgramFeatureCoverageRow {
  readonly featureKind: GtlProgramT153FeatureKind;
  readonly disposition: GtlProgramFeatureDisposition;
  readonly ownerClassification: GtlProgramFeatureOwnerClassification;
  readonly requirementRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly reasonRefs: readonly string[];
}

export interface GtlProgramFeatureCoverageManifest {
  readonly kind: "gtl_program_feature_coverage_manifest";
  readonly manifestRef: string;
  readonly t153RequirementRef: "REQ-L-GTL3-CONTRACT-LAW-API";
  readonly rows: readonly GtlProgramFeatureCoverageRow[];
}

export interface GtlProgramCoverageCounts {
  readonly catalogGraphFunctionCount: number;
  readonly publishedGraphFunctionCount: number;
  readonly graphVectorCount: number;
  readonly targetCarrierContractCount: number;
  readonly edgeClosureContractCount: number;
  readonly overlayCount: number;
  readonly publicStartTargetCount: number;
  readonly promptAssetCount: number;
  readonly pluginContractCount: number;
  readonly sourceIdentitySurfaceCount: number;
}

export type GtlProgramExpectedCoverage = GtlProgramCoverageCounts;

export interface GtlProgramConformanceInput {
  readonly subjectRef: string;
  readonly abiPackageVersion: string;
  readonly expectedCoverage: GtlProgramExpectedCoverage;
  readonly featureCoverageManifest: GtlProgramFeatureCoverageManifest;
  readonly catalogGraphFunctionRefs?: readonly string[] | undefined;
  readonly graphFunctions?: readonly GraphFunction[] | undefined;
  readonly modules?: readonly Module[] | undefined;
  readonly targetCarrierContracts?:
    | readonly GtlProgramTargetCarrierRow[]
    | undefined;
  readonly edgeClosureContracts?:
    | readonly GtlProgramEdgeClosureRow[]
    | undefined;
  readonly overlays?: readonly GtlProgramOverlayRow[] | undefined;
  readonly publicStartTargets?: readonly GtlProgramPublicStartRow[] | undefined;
  readonly promptAssets?: readonly GtlProgramPromptAssetRow[] | undefined;
  readonly pluginContracts?: readonly unknown[] | undefined;
  readonly pluginResultInterfaces?:
    | readonly GtlProgramPluginResultInterfaceRow[]
    | undefined;
  readonly sourceIdentitySurfaces?:
    | readonly GtlProgramSourceIdentityRow[]
    | undefined;
  readonly sourceAuthorityPolicies?:
    | readonly GtlProgramSourceAuthorityPolicyRow[]
    | undefined;
  readonly semanticReviewGates?:
    | readonly GtlProgramSemanticReviewGateRow[]
    | undefined;
  readonly sameObjectProofs?: readonly GtlProgramSameObjectRow[] | undefined;
  readonly operatorDeclarations?:
    | readonly GtlProgramOperatorDeclarationRow[]
    | undefined;
  readonly evaluatorDeclarations?:
    | readonly GtlProgramEvaluatorDeclarationRow[]
    | undefined;
  readonly ruleDeclarations?:
    | readonly GtlProgramRuleDeclarationRow[]
    | undefined;
  readonly computeCompositions?:
    | readonly GtlProgramComputeCompositionRow[]
    | undefined;
  readonly computeStageBindings?:
    | readonly GtlProgramComputeStageBindingRow[]
    | undefined;
  readonly hookBoundaries?: readonly GtlProgramHookBoundaryRow[] | undefined;
  readonly selectionBoundaries?:
    | readonly GtlProgramSelectionBoundaryRow[]
    | undefined;
  readonly jobBindings?: readonly GtlProgramJobBindingRow[] | undefined;
  readonly roleBindings?: readonly GtlProgramRoleBindingRow[] | undefined;
  readonly externalToolGates?:
    | readonly GtlProgramExternalToolGateRow[]
    | undefined;
  readonly runtimeBindings?: readonly GtlProgramRuntimeBindingRow[] | undefined;
  readonly runtimeReentryRoutes?:
    | readonly GtlProgramRuntimeReentryRouteRow[]
    | undefined;
  readonly installedContextSurfaces?:
    | readonly GtlProgramInstalledContextRow[]
    | undefined;
  readonly declarationSourceRows?:
    | readonly GtlProgramDeclarationSourceRow[]
    | undefined;
  readonly goldenInstanceBindings?:
    | readonly GtlProgramGoldenInstanceBindingRow[]
    | undefined;
  readonly underdeterminedDeclarations?:
    | readonly GtlProgramUnderdeterminedDeclarationRow[]
    | undefined;
  readonly constitutionalSurfaceRows?:
    | readonly GtlProgramConstitutionalSurfaceRow[]
    | undefined;
  readonly constitutionalLiveFacts?:
    | GtlProgramConstitutionalLiveFacts
    | null
    | undefined;
  readonly traversalBindConservation?:
    | readonly GtlProgramTraversalBindConservationRow[]
    | undefined;
  readonly requirementsAlgebraDeclarations?:
    | readonly GtlRequirementsAlgebraDeclarationBundle[]
    | undefined;
}

export type GtlProgramConformanceCoverage = GtlProgramCoverageCounts;

export interface GtlProgramInventoryDigests {
  readonly constitutionalSurfaceRows: string;
  readonly constitutionalLiveFacts: string;
  readonly declarationSourceRows: string;
  readonly goldenInstanceBindings: string;
  readonly underdeterminedDeclarations: string;
  readonly featureCoverageManifest: string;
  readonly catalogGraphFunctionRefs: string;
  readonly graphFunctions: string;
  readonly modules: string;
  readonly materializedVectors: string;
  readonly targetCarrierContracts: string;
  readonly edgeClosureContracts: string;
  readonly overlays: string;
  readonly publicStartTargets: string;
  readonly promptAssets: string;
  readonly pluginContracts: string;
  readonly pluginResultInterfaces: string;
  readonly sourceIdentitySurfaces: string;
  readonly sourceAuthorityPolicies: string;
  readonly semanticReviewGates: string;
  readonly sameObjectProofs: string;
  readonly operatorDeclarations: string;
  readonly evaluatorDeclarations: string;
  readonly ruleDeclarations: string;
  readonly computeCompositions: string;
  readonly computeStageBindings: string;
  readonly hookBoundaries: string;
  readonly selectionBoundaries: string;
  readonly jobBindings: string;
  readonly roleBindings: string;
  readonly externalToolGates: string;
  readonly runtimeBindings: string;
  readonly installedContextSurfaces: string;
  readonly runtimeReentryRoutes: string;
  readonly traversalBindConservation: string;
  readonly requirementsAlgebraDeclarations: string;
}

export interface GtlProgramTraversalUnitProjectionRow {
  readonly kind: "gtl_program_traversal_unit_projection_row";
  readonly unitRef: string;
  readonly graphFunctionRef: string;
  readonly graphFunctionId: string;
  readonly graphRef: string;
  readonly graphId: string;
  readonly graphVectorRef: string;
  readonly graphVectorId: string;
  readonly sourceAssetTypes: readonly string[];
  readonly targetAssetType: string;
  readonly targetCarrierContractRef: string | null;
  readonly targetCarrierContractRefs: readonly string[];
  readonly materializationPolicyRefs: readonly string[];
  readonly edgeClosureRef: string | null;
  readonly edgeClosureRefs: readonly string[];
  readonly computeCompositionRefs: readonly string[];
  readonly computeStageBindingRefs: readonly string[];
  readonly pluginResultInterfaceRefs: readonly string[];
  readonly consequencePluginResultInterfaceRefs: readonly string[];
  readonly conservationBasisRef: string | null;
  readonly conservationBasisRefs: readonly string[];
  readonly intentLineageRefs: readonly string[];
  readonly targetCarrierBindingRefs: readonly string[];
  readonly materializationBindingRefs: readonly string[];
  readonly carriedObligationRefs: readonly string[];
  readonly residualPressureRefs: readonly string[];
  readonly stagedAuthorityRefs: readonly string[];
  readonly admissionStrengthRefs: readonly string[];
  readonly downstreamTerminalPressureRefs: readonly string[];
  readonly requirementRefs: readonly string[];
  readonly requirementSpanRefs: readonly string[];
  readonly requirementTestRelationRefs: readonly string[];
  readonly requirementEvidencePolicyRefs: readonly string[];
  readonly allowedObligationDeltaFamilies:
    readonly GtlProgramObligationDeltaFamily[];
  readonly allowedConsequenceTraversalCatalogRef: string | null;
  readonly allowedConsequenceTraversalFamilies:
    readonly AllowedConsequenceTraversalFamily[];
  readonly allowedConsequenceTraversalRowRefs: readonly string[];
}

export interface GtlProgramTraversalEntryUnitProjectionRow {
  readonly kind: "gtl_program_traversal_entry_unit_projection_row";
  readonly publicStartRef: string;
  readonly graphFunctionRef: string;
  readonly overlayRefs: readonly string[];
  readonly entryUnitRefs: readonly string[];
}

export interface GtlProgramTraversalUnitProjection {
  readonly kind: "gtl_program_traversal_unit_projection";
  readonly subjectRef: string;
  readonly units: readonly GtlProgramTraversalUnitProjectionRow[];
  readonly entryUnits: readonly GtlProgramTraversalEntryUnitProjectionRow[];
}

export interface GtlProgramRequirementsAlgebraEdgeProjectionRow {
  readonly kind: "gtl_program_requirements_algebra_edge_projection_row";
  readonly unitRef: string;
  readonly graphFunctionRef: string;
  readonly graphFunctionId: string;
  readonly graphVectorRef: string;
  readonly graphVectorId: string;
  readonly vectorIndex: number;
  readonly requirementIds: readonly string[];
  readonly spanRefs: readonly string[];
  readonly contextFragmentRefs: readonly string[];
  readonly destinationTopologyRefs: readonly string[];
  readonly testRelationRefs: readonly string[];
  readonly evidencePolicyRefs: readonly string[];
}

export interface GtlProgramRequirementsAlgebraProjection {
  readonly kind: "gtl_program_requirements_algebra_projection";
  readonly subjectRef: string;
  readonly declarationBundleCount: number;
  readonly requirementIds: readonly string[];
  readonly relationRefs: readonly string[];
  readonly spanRefs: readonly string[];
  readonly contextFragmentRefs: readonly string[];
  readonly destinationTopologyRefs: readonly string[];
  readonly testRelationRefs: readonly string[];
  readonly edgeRows: readonly GtlProgramRequirementsAlgebraEdgeProjectionRow[];
}

export interface GtlProgramConformanceReport {
  readonly kind: "gtl_program_conformance_report";
  readonly reportRef: string;
  readonly subjectRef: string;
  readonly abiPackageVersion: string;
  readonly inventoryDigest: string;
  readonly inventoryDigests: GtlProgramInventoryDigests;
  readonly pluginResultInterfaceCatalog: AdmittedPluginResultInterfaceCatalog;
  readonly requirementsAlgebraProjection: GtlProgramRequirementsAlgebraProjection;
  readonly traversalUnitProjection: GtlProgramTraversalUnitProjection;
  readonly passed: boolean;
  readonly issueCount: number;
  readonly issues: readonly GtlProgramConformanceIssue[];
  readonly coverage: GtlProgramConformanceCoverage;
  readonly featureCoverageManifest: GtlProgramFeatureCoverageManifest;
}

export interface GtlProgramConformanceInputAdmission {
  readonly kind: "gtl_program_conformance_input_admission";
  readonly input: GtlProgramConformanceInput;
  readonly issues: readonly GtlProgramConformanceIssue[];
}

interface GraphVectorProjection {
  readonly graphFunctionId: string;
  readonly graphFunctionRef: string;
  readonly graphId: string;
  readonly graphRef: string;
  readonly graphVectorId: string;
  readonly vectorIndex: number;
  readonly vectorRef: string;
  readonly sourceAssetTypes: readonly string[];
  readonly sourceNodeContracts: readonly string[];
  readonly targetAssetType: string;
  readonly targetSchemaRef: string;
  readonly targetNodeContract: string;
  readonly operatorCount: number;
  readonly evaluatorCount: number;
  readonly hasRule: boolean;
  readonly allowsSubwork: boolean;
  readonly declarationKeyRefs: readonly string[];
}

function freezeStrings(values: readonly string[] | undefined): readonly string[] {
  return Object.freeze([...(values ?? [])]);
}

// Implements: REQ-L-GTL3-LAWS-019
export function assertRatifiedGtlProgramDiagnosticId(ruleRef: string): string {
  const declarationCarried = ruleRef.startsWith(
    "abg://gtl-program/source-authority/"
  );
  if (!declarationCarried && !GTL_PROGRAM_DIAGNOSTIC_ID_SET.has(ruleRef)) {
    throw new TypeError(
      `unratified gtl program diagnostic identity: ${ruleRef}`
    );
  }
  return ruleRef;
}

function issue(input: {
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly surfaceRef: string;
  readonly ruleRef: string;
  readonly message: string;
  readonly evidenceRefs?: readonly string[] | undefined;
  readonly admissibleRepairs?: readonly GtlProgramAdmissibleRepair[] | undefined;
}): GtlProgramConformanceIssue {
  // Implements: REQ-L-GTL3-LAWS-019 — the constructor is the vocabulary
  // boundary: an unknown diagnostic identity is itself a conformance failure.
  // Declaration-carried rule identities (admitted sourceAuthorityPolicy rows
  // supply their own rule identity) are ratified by declaration, not by the
  // built-in vocabulary. Named follow-up: validate them against the admitted
  // declaration set instead of by namespace.
  assertRatifiedGtlProgramDiagnosticId(input.ruleRef);
  const defaultEditClass = GTL_PROGRAM_DEFAULT_ADMISSIBLE_REPAIRS[input.ruleRef];
  const admissibleRepairs =
    input.admissibleRepairs ??
    (defaultEditClass === undefined
      ? []
      : [
          Object.freeze({
            kind: "gtl_program_admissible_repair" as const,
            editClass: defaultEditClass,
            repairSurfaceRef: input.surfaceRef,
            changeClassRef: null
          })
        ]);
  return Object.freeze({
    kind: "gtl_program_conformance_issue",
    severity: "error",
    surfaceKind: input.surfaceKind,
    surfaceRef: input.surfaceRef,
    ruleRef: input.ruleRef,
    message: input.message,
    evidenceRefs: freezeStrings(input.evidenceRefs),
    admissibleRepairs: Object.freeze([...admissibleRepairs])
  });
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "validation failed";
}

const GTL_DECLARATION_LAW_DIAGNOSTIC_IDS: Readonly<
  Record<GtlDeclarationLawViolationKind, GtlProgramDiagnosticId>
> = Object.freeze({
  duplicate_key: "abg://gtl-program/declaration/duplicate-key",
  host_mismatch: "abg://gtl-program/declaration/host-compatible",
  unregistered_reserved_key:
    "abg://gtl-program/declaration/reserved-key-registered",
  value_kind_mismatch: "abg://gtl-program/declaration/value-kind",
  value_constraint_mismatch: "abg://gtl-program/c-algebra/invalid-program"
});

function checkHostDeclarationLaw(input: {
  readonly host: GtlDeclarationHost;
  readonly surfaceKind: "graph_function" | "graph_vector";
  readonly surfaceRef: string;
  readonly attrs: SerializedAttrs;
  readonly issues: GtlProgramConformanceIssue[];
}): readonly GtlDeclarationLawViolation[] {
  try {
    const violations = inspectGtlHostDeclarations({
      host: input.host,
      attrs: input.attrs
    });
    for (const violation of violations) {
      input.issues.push(
        issue({
          surfaceKind: input.surfaceKind,
          surfaceRef: input.surfaceRef,
          ruleRef: GTL_DECLARATION_LAW_DIAGNOSTIC_IDS[violation.kind],
          message: violation.message,
          evidenceRefs: Object.freeze([
            `gtl-declaration://${input.host}/${encodeURIComponent(violation.key)}`
          ])
        })
      );
    }
    return violations;
  } catch (error: unknown) {
    input.issues.push(
      issue({
        surfaceKind: input.surfaceKind,
        surfaceRef: input.surfaceRef,
        ruleRef: "abg://gtl-program/declaration/value-kind",
        message: `${input.host} declaration carrier is malformed: ${errorMessage(error)}`
      })
    );
    return Object.freeze([]);
  }
}

function isPlainRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pushHofRelationDiagnostic(input: {
  readonly graphFunction: GraphFunction;
  readonly row: HofRelationDiagnostic;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const semanticGap = input.row.classification === "semantic_not_realized";
  input.issues.push(
    issue({
      surfaceKind: "graph_function",
      surfaceRef: `${input.graphFunction.name}${input.row.path}`,
      ruleRef: semanticGap
        ? "abg://gtl-program/hof/semantic-not-realized"
        : "abg://gtl-program/hof/invalid-program",
      message:
        `${input.row.diagnosticId}: expected ${input.row.expectedRelation}; ` +
        `actual ${input.row.actualRelation}`,
      evidenceRefs: Object.freeze([
        ...input.row.evidenceRefs,
        `hof-relation-diagnostic:${input.row.diagnosticId}`
      ]),
      admissibleRepairs: Object.freeze([
        Object.freeze({
          kind: "gtl_program_admissible_repair" as const,
          editClass: input.row.repairAffordance,
          repairSurfaceRef: input.graphFunction.name,
          changeClassRef: semanticGap ? "design_reframe" : null
        })
      ])
    })
  );
}

function checkHofRelationDeclarations(input: {
  readonly graphFunction: GraphFunction;
  readonly graphFunctions: readonly GraphFunction[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const compilation = compileHofRelation({
    graphFunction: input.graphFunction,
    graphFunctions: input.graphFunctions
  });
  for (const row of compilation.diagnostics) {
    pushHofRelationDiagnostic({
      graphFunction: input.graphFunction,
      row,
      issues: input.issues
    });
  }
}

function graphFunctionApplicationRepairEditClass(
  affordance: GraphFunctionApplicationRepairAffordance
): GtlProgramRepairEditClass {
  switch (affordance) {
    case "add_missing_declaration":
      return "add_missing_declaration";
    case "remove_duplicate_authority":
      return "remove_duplicate_declaration";
    case "correct_reference":
    case "break_application_cycle":
    case "correct_composition_owner":
      return "correct_reference";
    case "complete_t255_execution_join":
      return "realize_declared_semantics";
    case "correct_field_shape":
    case "correct_result_identity":
    case "correct_result_equation":
      return "correct_field_shape";
  }
}

function pushGraphFunctionApplicationDiagnostic(input: {
  readonly graphFunction: GraphFunction;
  readonly row: GraphFunctionApplicationDiagnostic;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const semanticGap = input.row.classification === "semantic_not_realized";
  input.issues.push(
    issue({
      surfaceKind: "graph_function",
      surfaceRef: `${input.graphFunction.name}${input.row.path}`,
      ruleRef: semanticGap
        ? "abg://gtl-program/graph-function-application/semantic-not-realized"
        : "abg://gtl-program/graph-function-application/invalid-program",
      message:
        `${input.row.diagnosticId}: expected ${input.row.expectedRelation}; ` +
        `actual ${input.row.actualRelation}`,
      evidenceRefs: Object.freeze([
        ...input.row.evidenceRefs,
        `graph-function-application-diagnostic:${input.row.diagnosticId}`
      ]),
      admissibleRepairs: Object.freeze([
        Object.freeze({
          kind: "gtl_program_admissible_repair" as const,
          editClass: graphFunctionApplicationRepairEditClass(
            input.row.repairAffordance
          ),
          repairSurfaceRef: input.graphFunction.name,
          changeClassRef: semanticGap ? "design_reframe" : null
        })
      ])
    })
  );
}

function checkGraphFunctionApplicationDeclarations(input: {
  readonly graphFunction: GraphFunction;
  readonly graphFunctions: readonly GraphFunction[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const compilation = compileGraphFunctionApplication({
    graphFunction: input.graphFunction,
    graphFunctions: input.graphFunctions
  });
  for (const row of compilation.diagnostics) {
    pushGraphFunctionApplicationDiagnostic({
      graphFunction: input.graphFunction,
      row,
      issues: input.issues
    });
  }
}

function pushCAlgebraDiagnostic(input: {
  readonly graphFunction: GraphFunction;
  readonly row: CAlgebraDiagnostic;
  readonly candidate?: RawCProgramCandidate | undefined;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const semanticGap = input.row.classification === "semantic_not_realized";
  const ruleRef = semanticGap
    ? "abg://gtl-program/c-algebra/semantic-not-realized"
    : "abg://gtl-program/c-algebra/invalid-program";
  input.issues.push(
    issue({
      surfaceKind: "graph_function",
      surfaceRef: input.candidate === undefined
        ? `${input.graphFunction.name}${input.row.path}`
        : `${input.graphFunction.name}${rawCProgramCandidatePath(
            input.candidate
          ).slice(1)}${
            input.row.path === "$" ? "" : input.row.path.slice(1)
          }`,
      ruleRef,
      message:
        `${input.row.diagnosticId}: expected ${input.row.expectedRelation}; ` +
        `actual ${input.row.actualRelation}`,
      evidenceRefs: Object.freeze([
        ...input.row.evidenceRefs,
        `c-algebra-diagnostic:${input.row.diagnosticId}`,
        `axiom:${input.row.axiomRef}`,
        `requirement:${input.row.requirementRef}`
      ]),
      admissibleRepairs: Object.freeze(
        [...new Set(input.row.repairAffordances.map(cAlgebraRepairEditClass))].map(
          (editClass) =>
            Object.freeze({
              kind: "gtl_program_admissible_repair" as const,
              editClass,
              repairSurfaceRef: input.graphFunction.name,
              changeClassRef:
                editClass === "realize_declared_semantics"
                  ? "design_reframe"
                  : null
            })
        )
      )
    })
  );
}

function graphVectorRepairEditClass(
  affordance: GraphVectorCProgramRepairAffordance
): GtlProgramRepairEditClass {
  switch (affordance) {
    case "add_missing_declaration":
      return "add_missing_declaration";
    case "correct_reference":
      return "correct_reference";
    case "correct_field_shape":
      return "correct_field_shape";
    case "realize_declared_semantics":
      return "realize_declared_semantics";
  }
}

function pushGraphVectorCProgramDiagnostic(input: {
  readonly graphFunction: GraphFunction;
  readonly row: GraphVectorCProgramDiagnostic;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const semanticGap = input.row.classification === "semantic_not_realized";
  input.issues.push(
    issue({
      surfaceKind: "graph_vector",
      surfaceRef: `${input.graphFunction.name}${input.row.path.slice(1)}`,
      ruleRef: semanticGap
        ? "abg://gtl-program/c-algebra/semantic-not-realized"
        : "abg://gtl-program/c-algebra/invalid-program",
      message:
        `${input.row.diagnosticId}: expected ${input.row.expectedRelation}; ` +
        `actual ${input.row.actualRelation}`,
      evidenceRefs: Object.freeze([
        ...input.row.evidenceRefs,
        `axiom:${input.row.axiomRef}`,
        `graph-vector-c-program-diagnostic:${input.row.diagnosticId}`
      ]),
      admissibleRepairs: Object.freeze([
        Object.freeze({
          kind: "gtl_program_admissible_repair" as const,
          editClass: graphVectorRepairEditClass(input.row.repairAffordance),
          repairSurfaceRef: input.graphFunction.name,
          changeClassRef: semanticGap ? "design_reframe" : null
        })
      ])
    })
  );
}

function cAlgebraRepairEditClass(
  affordance: CAlgebraDiagnostic["repairAffordances"][number]
): GtlProgramRepairEditClass {
  switch (affordance) {
    case "supply_non_empty_ref":
    case "select_declared_regime":
    case "bind_matching_carrier":
    case "bind_canonical_edge_role":
      return "correct_reference";
    case "declare_executable_leaf":
    case "declare_exactly_one_result_stage":
      return "add_missing_declaration";
    case "rename_duplicate_stage_role":
      return "remove_duplicate_declaration";
    case "await_runtime_realization":
      return "realize_declared_semantics";
    case "use_flat_composition":
      return "correct_field_shape";
    case "fix_declaration_shape":
    case "remove_unknown_field":
    case "supply_non_empty_batch":
    case "bind_matching_result_cardinality":
    case "supply_positive_retry_budget":
      return "correct_field_shape";
  }
}

function checkCAlgebraCandidate(input: {
  readonly graphFunction: GraphFunction;
  readonly graphFunctions: readonly GraphFunction[];
  readonly candidate: RawCProgramCandidate;
  readonly issues: GtlProgramConformanceIssue[];
}): boolean {
  const candidate = input.candidate.candidate;
  if (
    !isPlainRecord(candidate) ||
    candidate["syntaxVersion"] !== C_ALGEBRA_SYNTAX_VERSION
  ) {
    return false;
  }
  const admission = admitCProgramSyntax(candidate);
  const unresolvedWorkflowRefs =
    admission.accepted && admission.program !== null
      ? workflowGraphFunctionRefs(admission.program.term).filter(
          (ref) =>
            !input.graphFunctions.some(
              (graphFunction) =>
                graphFunction.id === ref || graphFunction.name === ref
            )
        )
      : Object.freeze([]);
  for (const ref of unresolvedWorkflowRefs) {
    input.issues.push(
      issue({
        surfaceKind: "graph_function",
        surfaceRef: `${input.graphFunction.name}${rawCProgramCandidatePath(
          input.candidate
        ).slice(1)}#${ref}`,
        ruleRef: "abg://gtl-program/c-algebra/unresolved-graph-function",
        message: `workflow.C reference ${JSON.stringify(ref)} does not resolve to a graph function in the admitted compilation root`,
        evidenceRefs: Object.freeze([
          `unresolved-graph-function:${ref}`,
          "requirement:REQ-L-GTL3-C-ALGEBRA-014"
        ])
      })
    );
  }
  const compilation = compileCAlgebraToHog(candidate);
  let invalidProgram = unresolvedWorkflowRefs.length > 0;
  for (const row of compilation.diagnostics) {
    if (
      row.diagnosticId === "gtl-c-unrealized-workflow-lift" &&
      unresolvedWorkflowRefs.length > 0
    ) {
      continue;
    }
    if (row.classification === "invalid_program") {
      invalidProgram = true;
    }
    pushCAlgebraDiagnostic({
      graphFunction: input.graphFunction,
      row,
      candidate: input.candidate,
      issues: input.issues
    });
  }
  return invalidProgram;
}

function checkCAlgebraDeclarations(input: {
  readonly graphFunction: GraphFunction;
  readonly graphFunctions: readonly GraphFunction[];
  readonly rawCandidates: RawCProgramCandidateCollection;
  readonly selectedCandidateModes: ReadonlyMap<string, "compile" | "skip">;
  readonly issues: GtlProgramConformanceIssue[];
}): ReadonlySet<string> {
  const invalidCandidateIdentities = new Set<string>();
  for (const candidate of input.rawCandidates.candidates) {
    if (
      input.selectedCandidateModes.get(rawCProgramCandidateIdentity(candidate)) ===
      "skip"
    ) {
      continue;
    }
    if (checkCAlgebraCandidate({
      graphFunction: input.graphFunction,
      graphFunctions: input.graphFunctions,
      candidate,
      issues: input.issues
    })) {
      invalidCandidateIdentities.add(rawCProgramCandidateIdentity(candidate));
    }
  }
  return invalidCandidateIdentities;
}

function isCAlgebraAdmissionIssue(issueMessage: string): boolean {
  const unwrapped = issueMessage.replace(/^catalog\[\d+\]: /u, "");
  return C_ALGEBRA_DIAGNOSTIC_ID_VALUES.some((diagnosticId) =>
    unwrapped.startsWith(`${diagnosticId} at `)
  );
}

function unreportedExecutionAdmissionIssues(
  graphFunction: GraphFunction
): readonly string[] | null {
  try {
    const single = hogProgramFromDeclarationAttrs(
      graphFunction.declarations,
      graphFunction.name
    );
    if (single !== null && (!single.accepted || single.program === null)) {
      return Object.freeze(
        single.issues.filter((row) => !isCAlgebraAdmissionIssue(row))
      );
    }
    const catalog = hogProgramCatalogFromDeclarationAttrs(
      graphFunction.declarations,
      graphFunction.name
    );
    if (catalog !== null && (!catalog.accepted || catalog.catalog === null)) {
      return Object.freeze(
        catalog.issues.filter((row) => !isCAlgebraAdmissionIssue(row))
      );
    }
  } catch {
    return null;
  }
  return null;
}

function workflowGraphFunctionRefs(term: CProgramNode): readonly string[] {
  switch (term.kind) {
    case "c_of":
    case "c_identity":
      return Object.freeze([]);
    case "c_compose":
      return Object.freeze([
        ...workflowGraphFunctionRefs(term.left),
        ...workflowGraphFunctionRefs(term.right)
      ]);
    case "c_edge":
      return Object.freeze([
        ...workflowGraphFunctionRefs(term.transform),
        ...workflowGraphFunctionRefs(term.evaluate),
        ...workflowGraphFunctionRefs(term.consequence)
      ]);
    case "c_workflow":
      return Object.freeze([term.graphFunctionRef]);
    case "c_batch":
      return Object.freeze(
        term.tasks.flatMap((task) => workflowGraphFunctionRefs(task))
      );
    case "c_retry":
      return workflowGraphFunctionRefs(term.term);
  }
}

function checkCompiledExecutionDeclarations(input: {
  readonly graphFunction: GraphFunction;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  try {
    compileExecutionDeclarations(input.graphFunction);
  } catch (error: unknown) {
    const residualAdmissionIssues = unreportedExecutionAdmissionIssues(
      input.graphFunction
    );
    if (residualAdmissionIssues !== null && residualAdmissionIssues.length === 0) {
      return;
    }
    const message =
      residualAdmissionIssues === null
        ? errorMessage(error)
        : residualAdmissionIssues.join("; ");
    const semanticNotRealized = message.startsWith("semantic_not_realized:");
    input.issues.push(
      issue({
        surfaceKind: "graph_function",
        surfaceRef: `${input.graphFunction.name}#execution-declarations`,
        ruleRef: semanticNotRealized
          ? "abg://gtl-program/c-algebra/semantic-not-realized"
          : "abg://gtl-program/execution-declaration/invalid",
        message,
        evidenceRefs: Object.freeze([
          `graph-function:${input.graphFunction.id}`,
          "requirement:REQ-L-GTL3-C-ALGEBRA"
        ])
      })
    );
  }
}

function uniqueSorted(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)].sort());
}

const GTL_PROGRAM_T153_FEATURE_KIND_SET = new Set<string>(
  GTL_PROGRAM_T153_FEATURE_KINDS
);

const GTL_PROGRAM_FEATURE_DISPOSITION_VALUES = new Set<string>([
  "present",
  "not_used"
]);

const GTL_PROGRAM_FEATURE_OWNER_VALUES = new Set<string>([
  "gtl_declared",
  "abg_admitted",
  "abg_interpreted",
  "downstream_product_meaning"
]);

const GTL_PROGRAM_REGIME_VALUES = new Set<string>(["F_D", "F_P", "F_H"]);

const GTL_PROGRAM_SOURCE_AUTHORITY_TOKEN_MATCH_MODES = new Set<string>([
  "any",
  "all"
]);

const GTL_PROGRAM_SEMANTIC_REVIEW_STATUS_VALUES = new Set<string>([
  "passed",
  "failed",
  "blocked"
]);

const GTL_PROGRAM_STAGE_REGIME_DISPOSITION_VALUES = new Set<string>([
  "participates",
  "not_used",
  "external_callout"
]);

const GTL_PROGRAM_COMPUTE_STAGE_ROLE_SET = new Set<string>(
  ENGINE_COMPUTE_STAGE_ROLE_VALUES
);

const GTL_PROGRAM_COMPUTE_STAGE_PURPOSE_SET = new Set<string>(
  ENGINE_COMPUTE_STAGE_PURPOSE_VALUES
);

const GTL_PROGRAM_RUNTIME_BINDING_KIND_VALUES = new Set<string>([
  "abg_cli_runtime_binding",
  "abg_public_callable_start",
  "abg_public_control_loop"
]);

const GTL_PROGRAM_REPAIR_SURFACE_DISPOSITION_VALUES = new Set<string>([
  "current_edge_repair",
  "upstream_reentry",
  "downstream_deferred",
  "external_blocked"
]);

const GTL_PROGRAM_OBLIGATION_DELTA_FAMILY_SET = new Set<string>(
  GTL_PROGRAM_OBLIGATION_DELTA_FAMILY_VALUES
);

const GTL_PROGRAM_GRAPH_REENTRY_POINT_VALUES = new Set<string>(
  GRAPH_REENTRY_POINT_VALUES
);

const GTL_PROGRAM_HOST_SURFACE_KIND_VALUES =
  new Set<string>([
    "graph_function",
    "graph_vector",
    "operator",
    "evaluator",
    "rule",
    "job",
    "role",
    "module",
    "candidate_family",
    "refinement_boundary",
    "visible_defaults",
    "external_tool"
  ]);

const GTL_PROGRAM_COMPOSITION_DECLARATION_SOURCE_KIND_VALUES =
  new Set<string>([
    "graph_vector_declaration",
    "graph_function_declaration",
    "operator_declaration",
    "evaluator_declaration",
    "rule_declaration",
    "job_policy_hook",
    "role_policy_hook",
    "module_policy_hook",
    "visible_defaults",
    "published_template"
  ]);

const GTL_PROGRAM_HOOK_DECLARATION_SOURCE_KIND_VALUES =
  new Set<string>([
    "graph_vector_declaration",
    "graph_function_declaration",
    "job_policy_hook",
    "role_policy_hook",
    "module_policy_hook",
    "candidate_family_policy_hint",
    "visible_defaults"
  ]);

const GTL_PROGRAM_SELECTION_BOUNDARY_KIND_VALUES =
  new Set<string>([
    "refinement_boundary",
    "candidate_family",
    "subwork",
    "synthesis"
  ]);

function isGtlProgramT153FeatureKind(
  value: unknown
): value is GtlProgramT153FeatureKind {
  return (
    typeof value === "string" &&
    GTL_PROGRAM_T153_FEATURE_KIND_SET.has(value)
  );
}

function isGtlProgramFeatureDisposition(
  value: unknown
): value is GtlProgramFeatureDisposition {
  return (
    typeof value === "string" &&
    GTL_PROGRAM_FEATURE_DISPOSITION_VALUES.has(value)
  );
}

function isGtlProgramFeatureOwnerClassification(
  value: unknown
): value is GtlProgramFeatureOwnerClassification {
  return (
    typeof value === "string" &&
    GTL_PROGRAM_FEATURE_OWNER_VALUES.has(value)
  );
}

function isRegime(value: unknown): value is Regime {
  return typeof value === "string" && GTL_PROGRAM_REGIME_VALUES.has(value);
}

function isGtlProgramStageRegimeDisposition(
  value: unknown
): value is GtlProgramStageRegimeDisposition {
  return (
    typeof value === "string" &&
    GTL_PROGRAM_STAGE_REGIME_DISPOSITION_VALUES.has(value)
  );
}

function isEngineComputeStageRole(value: unknown): value is EngineComputeStageRole {
  return (
    typeof value === "string" &&
    GTL_PROGRAM_COMPUTE_STAGE_ROLE_SET.has(value)
  );
}

function isEngineComputeStagePurpose(
  value: unknown
): value is EngineComputeStagePurpose {
  return (
    typeof value === "string" &&
    GTL_PROGRAM_COMPUTE_STAGE_PURPOSE_SET.has(value)
  );
}

function isGtlProgramRuntimeBindingKind(
  value: unknown
): value is GtlProgramRuntimeBindingKind {
  return (
    typeof value === "string" &&
    GTL_PROGRAM_RUNTIME_BINDING_KIND_VALUES.has(value)
  );
}

function isGtlProgramRepairSurfaceDisposition(
  value: unknown
): value is GtlProgramRepairSurfaceDisposition {
  return (
    typeof value === "string" &&
    GTL_PROGRAM_REPAIR_SURFACE_DISPOSITION_VALUES.has(value)
  );
}

function isGtlProgramObligationDeltaFamily(
  value: unknown
): value is GtlProgramObligationDeltaFamily {
  return (
    typeof value === "string" &&
    GTL_PROGRAM_OBLIGATION_DELTA_FAMILY_SET.has(value)
  );
}

function isGtlProgramSemanticReviewStatus(
  value: unknown
): value is GtlProgramSemanticReviewStatus {
  return (
    typeof value === "string" &&
    GTL_PROGRAM_SEMANTIC_REVIEW_STATUS_VALUES.has(value)
  );
}

function isGtlProgramSourceAuthorityTokenMatchMode(
  value: unknown
): value is GtlProgramSourceAuthorityTokenMatchMode {
  return (
    typeof value === "string" &&
    GTL_PROGRAM_SOURCE_AUTHORITY_TOKEN_MATCH_MODES.has(value)
  );
}

function isGraphReentryPoint(value: unknown): value is GraphReentryPoint {
  return (
    typeof value === "string" &&
    GTL_PROGRAM_GRAPH_REENTRY_POINT_VALUES.has(value)
  );
}

function isGtlProgramHostSurfaceKind(
  value: unknown
): value is GtlProgramHostSurfaceKind {
  return (
    typeof value === "string" &&
    GTL_PROGRAM_HOST_SURFACE_KIND_VALUES.has(value)
  );
}

function isGtlProgramCompositionDeclarationSourceKind(
  value: unknown
): value is GtlProgramCompositionDeclarationSourceKind {
  return (
    typeof value === "string" &&
    GTL_PROGRAM_COMPOSITION_DECLARATION_SOURCE_KIND_VALUES.has(value)
  );
}

function isGtlProgramHookDeclarationSourceKind(
  value: unknown
): value is GtlProgramHookDeclarationSourceKind {
  return (
    typeof value === "string" &&
    GTL_PROGRAM_HOOK_DECLARATION_SOURCE_KIND_VALUES.has(value)
  );
}

function isGtlProgramSelectionBoundaryKind(
  value: unknown
): value is GtlProgramSelectionBoundaryKind {
  return (
    typeof value === "string" &&
    GTL_PROGRAM_SELECTION_BOUNDARY_KIND_VALUES.has(value)
  );
}

const T153_FEATURE_DEFAULT_REQUIREMENT_REFS:
  Readonly<Record<GtlProgramT153FeatureKind, readonly string[]>> =
  Object.freeze({
    graph_structure_interface: Object.freeze([
      "REQ-L-GTL3-GRAPH",
      "REQ-L-GTL3-GRAPHVECTOR",
      "REQ-L-GTL3-GRAPHFUNCTION"
    ]),
    graph_algebra_edge: Object.freeze(["REQ-L-GTL3-LAWS"]),
    graph_algebra_compose: Object.freeze(["REQ-L-GTL3-COMPOSE"]),
    graph_algebra_substitute: Object.freeze(["REQ-L-GTL3-SUBSTITUTE"]),
    graph_algebra_recurse: Object.freeze(["REQ-L-GTL3-RECURSE"]),
    graph_algebra_fan_out: Object.freeze(["REQ-L-GTL3-HOF"]),
    graph_algebra_fan_in: Object.freeze(["REQ-L-GTL3-HOF"]),
    graph_algebra_gate: Object.freeze(["REQ-L-GTL3-HOF"]),
    graph_algebra_promote: Object.freeze(["REQ-L-GTL3-HOF"]),
    graph_algebra_identity: Object.freeze(["REQ-L-GTL3-LAWS"]),
    graph_algebra_same_object: Object.freeze(["REQ-L-GTL3-LAWS"]),
    operator_declarations: Object.freeze(["REQ-L-GTL3-OPERATOR"]),
    evaluator_declarations: Object.freeze(["REQ-L-GTL3-EVALUATOR"]),
    rule_declarations: Object.freeze(["REQ-L-GTL3-RULE"]),
    f_star_compute_composition: Object.freeze([
      "REQ-L-GTL3-COMPUTE-NOTATION",
      "REQ-R-ABG3-FN-COMPOSITION"
    ]),
    hook_boundaries: Object.freeze(["REQ-L-GTL3-HOOKS"]),
    target_carrier_contract_law: Object.freeze([
      "REQ-L-GTL3-GRAPHVECTOR",
      "REQ-L-GTL3-CONTRACT-LAW-API"
    ]),
    edge_closure_contract_law: Object.freeze([
      "REQ-R-ABG3-ASSURANCE",
      "REQ-R-ABG3-INTERPRET"
    ]),
    prompt_typed_asset_law: Object.freeze(["REQ-L-GTL3-ASSET-SURFACE"]),
    selection_refinement_synthesis_subwork: Object.freeze([
      "REQ-L-GTL3-SELECTION-BOUNDARY",
      "REQ-L-GTL3-SYNTHESIS",
      "REQ-L-GTL3-SUBWORK"
    ]),
    module_publication: Object.freeze(["REQ-L-GTL3-MODULE"]),
    public_start_binding: Object.freeze([
      "REQ-L-GTL3-JOB",
      "REQ-R-ABG3-RUN"
    ]),
    job_binding: Object.freeze(["REQ-L-GTL3-JOB"]),
    role_binding: Object.freeze(["REQ-L-GTL3-ROLE"]),
    external_tool_gates: Object.freeze([
      "REQ-L-GTL3-HOOKS",
      "REQ-R-ABG3-TRANSPORT"
    ]),
    active_source_identity: Object.freeze(["REQ-L-GTL3-IDENTITY"])
  });

export const GTL_PROGRAM_T153_FEATURE_OWNER_CLASSIFICATIONS:
  Readonly<Record<GtlProgramT153FeatureKind, GtlProgramFeatureOwnerClassification>> =
  Object.freeze({
    graph_structure_interface: "gtl_declared",
    graph_algebra_edge: "gtl_declared",
    graph_algebra_compose: "gtl_declared",
    graph_algebra_substitute: "gtl_declared",
    graph_algebra_recurse: "gtl_declared",
    graph_algebra_fan_out: "gtl_declared",
    graph_algebra_fan_in: "gtl_declared",
    graph_algebra_gate: "gtl_declared",
    graph_algebra_promote: "gtl_declared",
    graph_algebra_identity: "gtl_declared",
    graph_algebra_same_object: "gtl_declared",
    operator_declarations: "gtl_declared",
    evaluator_declarations: "gtl_declared",
    rule_declarations: "gtl_declared",
    f_star_compute_composition: "gtl_declared",
    hook_boundaries: "gtl_declared",
    target_carrier_contract_law: "gtl_declared",
    edge_closure_contract_law: "abg_admitted",
    prompt_typed_asset_law: "gtl_declared",
    selection_refinement_synthesis_subwork: "gtl_declared",
    module_publication: "gtl_declared",
    public_start_binding: "gtl_declared",
    job_binding: "gtl_declared",
    role_binding: "gtl_declared",
    external_tool_gates: "abg_admitted",
    active_source_identity: "abg_admitted"
  });

function isRecord(input: unknown): input is Readonly<Record<string, unknown>> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function unknownArray(input: unknown): readonly unknown[] | null {
  if (!Array.isArray(input)) {
    return null;
  }
  const values: unknown[] = [];
  for (const value of input) {
    values.push(value);
  }
  return Object.freeze(values);
}

function optionalUnknownArray(
  record: Readonly<Record<string, unknown>>,
  key: string
): readonly unknown[] | null | undefined {
  if (!Object.hasOwn(record, key)) {
    return undefined;
  }
  return unknownArray(record[key]);
}

function stringArrayFromUnknown(input: unknown): readonly string[] | null {
  if (!Array.isArray(input)) {
    return null;
  }
  const values: string[] = [];
  for (const value of input) {
    if (typeof value !== "string") {
      return null;
    }
    values.push(value);
  }
  return Object.freeze(values);
}

function optionalStringArrayField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): readonly string[] {
  if (!Object.hasOwn(input.record, input.key)) {
    return Object.freeze([]);
  }
  const values = stringArrayFromUnknown(input.record[input.key]);
  if (values === null) {
    input.issues.push(
      issue({
        surfaceKind: input.surfaceKind,
        surfaceRef: input.subjectRef,
        ruleRef: "abg://gtl-program/input/string-array",
        message: `${input.label}.${input.key} must be an array of strings`
      })
    );
    return Object.freeze([]);
  }
  return values;
}

function requiredStringArrayField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): readonly string[] {
  if (!Object.hasOwn(input.record, input.key)) {
    input.issues.push(
      issue({
        surfaceKind: input.surfaceKind,
        surfaceRef: input.subjectRef,
        ruleRef: "abg://gtl-program/input/string-array",
        message: `${input.label}.${input.key} is required and must be an array of strings`
      })
    );
    return Object.freeze([]);
  }
  const values = stringArrayFromUnknown(input.record[input.key]);
  if (values === null) {
    input.issues.push(
      issue({
        surfaceKind: input.surfaceKind,
        surfaceRef: input.subjectRef,
        ruleRef: "abg://gtl-program/input/string-array",
        message: `${input.label}.${input.key} must be an array of strings`
      })
    );
    return Object.freeze([]);
  }
  return values;
}

function requiredStringField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): string {
  const value = input.record[input.key];
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/input/string-field",
      message: `${input.label}.${input.key} must be a non-empty string`
    })
  );
  return "";
}

function requiredNonNegativeIntegerField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): number {
  const value = input.record[input.key];
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) {
    return value;
  }
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/input/non-negative-integer-field",
      message: `${input.label}.${input.key} must be a non-negative integer`
    })
  );
  return 0;
}

function requiredNonNegativeIntegerArrayField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): readonly number[] {
  if (!Object.hasOwn(input.record, input.key)) {
    input.issues.push(
      issue({
        surfaceKind: input.surfaceKind,
        surfaceRef: input.subjectRef,
        ruleRef: "abg://gtl-program/input/non-negative-integer-array",
        message: `${input.label}.${input.key} is required and must be an array of non-negative integers`
      })
    );
    return Object.freeze([]);
  }
  const values = unknownArray(input.record[input.key]);
  if (values === null) {
    input.issues.push(
      issue({
        surfaceKind: input.surfaceKind,
        surfaceRef: input.subjectRef,
        ruleRef: "abg://gtl-program/input/non-negative-integer-array",
        message: `${input.label}.${input.key} must be an array of non-negative integers`
      })
    );
    return Object.freeze([]);
  }
  const admitted: number[] = [];
  values.forEach((value, index) => {
    if (typeof value === "number" && Number.isInteger(value) && value >= 0) {
      admitted.push(value);
      return;
    }
    input.issues.push(
      issue({
        surfaceKind: input.surfaceKind,
        surfaceRef: input.subjectRef,
        ruleRef: "abg://gtl-program/input/non-negative-integer-array",
        message: `${input.label}.${input.key}[${index}] must be a non-negative integer`
      })
    );
  });
  return Object.freeze(admitted);
}

function semanticCompilerFpReviewAssetSurface(kind: string): AssetSurface {
  return Object.freeze({
    kind,
    requiredContexts: Object.freeze([
      "context://abiogenesis/semantic-compiler-fp-review"
    ]),
    standardsRefs: Object.freeze([
      "standard://abiogenesis/semantic-compiler-fp-review/v1"
    ]),
    outputContractRefs: Object.freeze([
      "contract://abiogenesis/semantic-compiler-fp-review/v1"
    ]),
    constructorRefs: Object.freeze([]),
    constructorInputAssetKinds: Object.freeze([]),
    rendererRefs: Object.freeze([]),
    renderedViewDigestPolicyRef: null,
    sectionKindRefs: Object.freeze([]),
    clauseKindRefs: Object.freeze([]),
    authoritySlots: Object.freeze([]),
    proofObligationRefs: Object.freeze([
      "proof://abiogenesis/semantic-compiler-fp-review/abg-producer"
    ])
  });
}

function semanticCompilerFpReviewScalarAttr(
  key: string,
  value: string
): SerializedAttrs["entries"][number] {
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "scalar" as const,
      value
    })
  });
}

function semanticCompilerFpReviewStringListAttr(
  key: string,
  value: readonly string[]
): SerializedAttrs["entries"][number] {
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "string_list" as const,
      value: Object.freeze([...value])
    })
  });
}

function semanticCompilerFpReviewT162Declarations(): SerializedAttrs {
  return Object.freeze({
    entries: Object.freeze([
      semanticCompilerFpReviewScalarAttr(
        "t162.worker_control_contract_ref",
        ABG_SEMANTIC_COMPILER_FP_REVIEW_WORKER_CONTROL_CONTRACT_REF
      ),
      semanticCompilerFpReviewScalarAttr(
        "t162.required_artifact_delta_kind",
        ABG_SEMANTIC_COMPILER_FP_REVIEW_REQUIRED_ARTIFACT_DELTA_KIND
      ),
      semanticCompilerFpReviewStringListAttr(
        "t162.fd_finite_surface_refs",
        [
          ABG_SEMANTIC_COMPILER_FP_REVIEW_PACKAGE_GRAMMAR_REF,
          ABG_SEMANTIC_COMPILER_FP_REVIEW_RESULT_GRAMMAR_REF,
          ABG_SEMANTIC_COMPILER_FP_REVIEW_PROGRESS_TELEMETRY_GRAMMAR_REF,
          ABG_SEMANTIC_COMPILER_FP_REVIEW_PROGRESS_METRIC_REF,
          ABG_SEMANTIC_COMPILER_FP_REVIEW_ADMISSION_FSM_REF,
          ABG_SEMANTIC_COMPILER_FP_REVIEW_OUTPUT_STATE_ENUM_REF,
          ABG_SEMANTIC_COMPILER_FP_REVIEW_DERIVATION_RULE_REF
        ]
      ),
      semanticCompilerFpReviewScalarAttr(
        "t162.fd_forbidden_interpretation",
        ABG_SEMANTIC_COMPILER_FP_REVIEW_FD_FORBIDDEN_INTERPRETATION
      )
    ])
  });
}

function semanticCompilerFpReviewScalarDeclaration(
  attrs: SerializedAttrs,
  key: string
): string | null {
  const entry = attrs.entries.find((candidate) => candidate.key === key);
  if (entry?.value.kind !== "scalar" || typeof entry.value.value !== "string") {
    return null;
  }
  return entry.value.value;
}

function semanticCompilerFpReviewStringListDeclaration(
  attrs: SerializedAttrs,
  key: string
): readonly string[] | null {
  const entry = attrs.entries.find((candidate) => candidate.key === key);
  if (entry?.value.kind !== "string_list") {
    return null;
  }
  return entry.value.value;
}

function semanticCompilerFpReviewDeclaresT162Boundary(
  attrs: SerializedAttrs
): boolean {
  const finiteSurfaceRefs = semanticCompilerFpReviewStringListDeclaration(
    attrs,
    "t162.fd_finite_surface_refs"
  );
  return (
    semanticCompilerFpReviewScalarDeclaration(
      attrs,
      "t162.worker_control_contract_ref"
    ) === ABG_SEMANTIC_COMPILER_FP_REVIEW_WORKER_CONTROL_CONTRACT_REF &&
    semanticCompilerFpReviewScalarDeclaration(
      attrs,
      "t162.required_artifact_delta_kind"
    ) === ABG_SEMANTIC_COMPILER_FP_REVIEW_REQUIRED_ARTIFACT_DELTA_KIND &&
    finiteSurfaceRefs !== null &&
    finiteSurfaceRefs.includes(
      ABG_SEMANTIC_COMPILER_FP_REVIEW_PACKAGE_GRAMMAR_REF
    ) &&
    finiteSurfaceRefs.includes(
      ABG_SEMANTIC_COMPILER_FP_REVIEW_RESULT_GRAMMAR_REF
    ) &&
    finiteSurfaceRefs.includes(
      ABG_SEMANTIC_COMPILER_FP_REVIEW_PROGRESS_TELEMETRY_GRAMMAR_REF
    ) &&
    finiteSurfaceRefs.includes(
      ABG_SEMANTIC_COMPILER_FP_REVIEW_PROGRESS_METRIC_REF
    ) &&
    finiteSurfaceRefs.includes(
      ABG_SEMANTIC_COMPILER_FP_REVIEW_ADMISSION_FSM_REF
    ) &&
    finiteSurfaceRefs.includes(
      ABG_SEMANTIC_COMPILER_FP_REVIEW_OUTPUT_STATE_ENUM_REF
    ) &&
    finiteSurfaceRefs.includes(
      ABG_SEMANTIC_COMPILER_FP_REVIEW_DERIVATION_RULE_REF
    ) &&
    semanticCompilerFpReviewScalarDeclaration(
      attrs,
      "t162.fd_forbidden_interpretation"
    ) === ABG_SEMANTIC_COMPILER_FP_REVIEW_FD_FORBIDDEN_INTERPRETATION
  );
}

function semanticCompilerFpReviewNode(input: {
  readonly name: string;
  readonly kind: string;
  readonly id: string;
}): Node {
  return Object.freeze({
    name: input.name,
    schema: Object.freeze({
      kind: "symbolic" as const,
      ref: `schema://abiogenesis/semantic-compiler-fp-review/${input.kind}`
    }),
    typeRef: null,
    markov: Object.freeze([]),
    assetSurface: semanticCompilerFpReviewAssetSurface(input.kind),
    tags: Object.freeze([
      "abiogenesis",
      "semantic-compiler",
      "fp-review"
    ]),
    id: input.id
  });
}

export function constructAbgSemanticCompilerFpReviewGraphFunction(): GraphFunction {
  const sourceNode = semanticCompilerFpReviewNode({
    name: "abgSemanticCompilerPromptReviewPackage",
    kind: "prompt-review-package",
    id: "node:abg.semanticCompiler.promptReviewPackage"
  });
  const resultNode = semanticCompilerFpReviewNode({
    name: "abgSemanticCompilerFpReviewResult",
    kind: "fp-review-result",
    id: "node:abg.semanticCompiler.fpReviewResult"
  });
  const context = Object.freeze({
    name: "abgSemanticCompilerFpReviewContract",
    locator: "contract://abiogenesis/semantic-compiler-fp-review/v1",
    digest: stableSha256Digest({
      graphFunctionRef: ABG_SEMANTIC_COMPILER_FP_REVIEW_GRAPH_FUNCTION_REF,
      resultKind: ABG_SEMANTIC_COMPILER_FP_REVIEW_RESULT_KIND,
      resultVersion: ABG_SEMANTIC_COMPILER_FP_REVIEW_RESULT_VERSION,
      workerControlContractRef:
        ABG_SEMANTIC_COMPILER_FP_REVIEW_WORKER_CONTROL_CONTRACT_REF,
      fdPackageGrammarRef: ABG_SEMANTIC_COMPILER_FP_REVIEW_PACKAGE_GRAMMAR_REF,
      fdResultGrammarRef: ABG_SEMANTIC_COMPILER_FP_REVIEW_RESULT_GRAMMAR_REF,
      fdAdmissionFsmRef: ABG_SEMANTIC_COMPILER_FP_REVIEW_ADMISSION_FSM_REF
    })
  });
  const rule = Object.freeze({
    name: "abgSemanticCompilerFpReviewAdmission",
    kind: "semantic_compiler_fp_review_admission",
    config: semanticCompilerFpReviewT162Declarations(),
    tags: Object.freeze([
      "abiogenesis",
      "admission",
      "semantic-compiler"
    ])
  });
  const vector: GraphVector = constructGraphVector({
    name: "abg.semanticCompiler.fpReview",
    source: Object.freeze([sourceNode]),
    target: resultNode,
    operators: Object.freeze([
      Object.freeze({
        name: "abgSemanticCompilerFpReview",
        regime: "F_P" as const,
        binding:
          "binding://abiogenesis/semantic-compiler-fp-review/producer",
        tags: Object.freeze([
          "abiogenesis",
          "semantic-compiler",
          "fp-review"
        ])
      })
    ]),
    evaluators: Object.freeze([
      Object.freeze({
        name: "abgSemanticCompilerFpReviewAdmission",
        regime: "F_P" as const,
        description:
          "Admits semantic compiler prompt review results produced by the ABG F_P review graph function.",
        binding: ABG_SEMANTIC_COMPILER_FP_REVIEW_ADMISSION_REF,
        consumedFieldRefs: Object.freeze([
          "deterministicReportDigest",
          "sourcePackageDigest",
          "workerControlContractRef",
          "authorityPacketRef",
          "objectiveRef",
          "targetArtifactRef",
          "toolBoundaryRefs",
          "requiredArtifactDeltaKind",
          "stopConditionRef",
          "fdPackageGrammarRef",
          "fdResultGrammarRef",
          "fdProgressTelemetryGrammarRef",
          "fdProgressMetricRef",
          "fdAdmissionFsmRef",
          "fdOutputStateEnumRef",
          "fdDerivationRuleRef",
          "fdForbiddenInterpretation",
          "producerGraphFunctionRef",
          "producerGraphFunctionDigest",
          "producerRuntimeRef",
          "admissionRef",
          "status",
          "findingCount"
        ]),
        tags: Object.freeze([
          "abiogenesis",
          "semantic-compiler",
          "fp-review"
        ])
      })
    ]),
    contexts: Object.freeze([context]),
    rule,
    allowsSubwork: false,
    declarations: admitGraphVectorDeclarations(
      semanticCompilerFpReviewT162Declarations()
    ),
    tags: Object.freeze([
      "abiogenesis",
      "semantic-compiler",
      "fp-review"
    ]),
    id: "vector:abg.semanticCompiler.fpReview"
  });
  const graph: Graph = Object.freeze({
    name: "abg.semanticCompiler.fpReview.graph",
    inputs: Object.freeze([sourceNode]),
    outputs: Object.freeze([resultNode]),
    nodes: Object.freeze([sourceNode, resultNode]),
    vectors: Object.freeze([vector]),
    contexts: Object.freeze([context]),
    rules: Object.freeze([rule]),
    effects: Object.freeze([]),
    tags: Object.freeze([
      "abiogenesis",
      "semantic-compiler",
      "fp-review"
    ]),
    id: "graph:abg.semanticCompiler.fpReview"
  });
  return constructGraphFunction({
    name: ABG_SEMANTIC_COMPILER_FP_REVIEW_GRAPH_FUNCTION_REF,
    environment: Object.freeze({
      requires: Object.freeze([sourceNode]),
      provides: Object.freeze([resultNode]),
      carries: Object.freeze([])
    }),
    inputs: Object.freeze([sourceNode]),
    outputs: Object.freeze([resultNode]),
    template: Object.freeze({
      kind: "inline_graph" as const,
      ref: "template://abiogenesis/semantic-compiler-fp-review/v1",
      graph,
      version: null
    }),
    effects: Object.freeze([]),
    declarations: admitGraphFunctionDeclarations(
      semanticCompilerFpReviewT162Declarations()
    ),
    tags: Object.freeze([
      "abiogenesis",
      "semantic-compiler",
      "fp-review"
    ]),
    id: ABG_SEMANTIC_COMPILER_FP_REVIEW_GRAPH_FUNCTION_ID
  });
}

export function abgSemanticCompilerFpReviewGraphFunctionDigest(): string {
  return stableSha256Digest(
    constructAbgSemanticCompilerFpReviewGraphFunction()
  );
}

export function abgSemanticCompilerFpReviewPackageDigest(
  input: AbgSemanticCompilerFpReviewPackageIdentity
): string {
  return stableSha256Digest({
    kind: input.kind,
    packageVersion: input.packageVersion,
    subjectRef: input.subjectRef,
    deterministicReportDigest: input.deterministicReportDigest,
    workerControlContractRef: input.workerControlContractRef,
    authorityPacketRef: input.authorityPacketRef,
    objectiveRef: input.objectiveRef,
    targetArtifactRef: input.targetArtifactRef,
    toolBoundaryRefs: input.toolBoundaryRefs,
    requiredArtifactDeltaKind: input.requiredArtifactDeltaKind,
    stopConditionRef: input.stopConditionRef,
    fdPackageGrammarRef: input.fdPackageGrammarRef,
    fdResultGrammarRef: input.fdResultGrammarRef,
    fdProgressTelemetryGrammarRef: input.fdProgressTelemetryGrammarRef,
    fdProgressMetricRef: input.fdProgressMetricRef,
    fdAdmissionFsmRef: input.fdAdmissionFsmRef,
    fdOutputStateEnumRef: input.fdOutputStateEnumRef,
    fdDerivationRuleRef: input.fdDerivationRuleRef,
    fdForbiddenInterpretation: input.fdForbiddenInterpretation
  });
}

export function constructAbgSemanticCompilerFpReviewResult(
  input: AbgSemanticCompilerFpReviewPackageIdentity & {
    readonly status?: GtlProgramSemanticReviewStatus | undefined;
    readonly findingCount?: number | undefined;
    readonly deterministicIssueCount?: number | undefined;
    readonly reviewerProfileRef: string;
    readonly reviewedAt: string;
    readonly evidenceRefs?: readonly string[] | undefined;
  }
): AbgSemanticCompilerFpReviewResult {
  const status =
    input.status ??
    ((input.deterministicIssueCount ?? 0) === 0 ? "passed" : "failed");
  const findingCount =
    input.findingCount ??
    (status === "passed" ? 0 : Math.max(input.deterministicIssueCount ?? 1, 1));
  return Object.freeze({
    kind: ABG_SEMANTIC_COMPILER_FP_REVIEW_RESULT_KIND,
    reviewVersion: ABG_SEMANTIC_COMPILER_FP_REVIEW_RESULT_VERSION,
    subjectRef: input.subjectRef,
    deterministicReportDigest: input.deterministicReportDigest,
    sourcePackageKind: input.kind,
    sourcePackageVersion: input.packageVersion,
    sourcePackageDigest: abgSemanticCompilerFpReviewPackageDigest(input),
    workerControlContractRef: input.workerControlContractRef,
    authorityPacketRef: input.authorityPacketRef,
    objectiveRef: input.objectiveRef,
    targetArtifactRef: input.targetArtifactRef,
    toolBoundaryRefs: Object.freeze([...input.toolBoundaryRefs]),
    requiredArtifactDeltaKind: input.requiredArtifactDeltaKind,
    stopConditionRef: input.stopConditionRef,
    fdPackageGrammarRef: input.fdPackageGrammarRef,
    fdResultGrammarRef: input.fdResultGrammarRef,
    fdProgressTelemetryGrammarRef: input.fdProgressTelemetryGrammarRef,
    fdProgressMetricRef: input.fdProgressMetricRef,
    fdAdmissionFsmRef: input.fdAdmissionFsmRef,
    fdOutputStateEnumRef: input.fdOutputStateEnumRef,
    fdDerivationRuleRef: input.fdDerivationRuleRef,
    fdForbiddenInterpretation: input.fdForbiddenInterpretation,
    status,
    findingCount,
    reviewerProfileRef: input.reviewerProfileRef,
    reviewedAt: input.reviewedAt,
    producerGraphFunctionRef:
      ABG_SEMANTIC_COMPILER_FP_REVIEW_GRAPH_FUNCTION_REF,
    producerGraphFunctionDigest:
      abgSemanticCompilerFpReviewGraphFunctionDigest(),
    producerRuntimeKind: ABG_SEMANTIC_COMPILER_FP_REVIEW_RUNTIME_KIND,
    producerRuntimeRef: ABG_SEMANTIC_COMPILER_FP_REVIEW_RUNTIME_REF,
    admissionRef: ABG_SEMANTIC_COMPILER_FP_REVIEW_ADMISSION_REF,
    evidenceRefs: Object.freeze([...(input.evidenceRefs ?? [])])
  });
}

export function runAbgSemanticCompilerFpReviewGraphFunction(
  input: AbgSemanticCompilerFpReviewPackageIdentity & {
    readonly status?: GtlProgramSemanticReviewStatus | undefined;
    readonly findingCount?: number | undefined;
    readonly deterministicIssueCount?: number | undefined;
    readonly reviewerProfileRef: string;
    readonly reviewedAt: string;
    readonly evidenceRefs?: readonly string[] | undefined;
  }
): AbgSemanticCompilerFpReviewRunResult {
  const graphFunction = constructAbgSemanticCompilerFpReviewGraphFunction();
  if (
    !semanticCompilerFpReviewDeclaresT162Boundary(
      graphFunction.declarations
    )
  ) {
    throw new TypeError(
      "ABG semantic compiler F_P review graph function must declare the T-162 worker-control and F_D finite-surface boundary"
    );
  }
  const graph = materializeGraphFunction(graphFunction);
  if (graph.vectors.length !== 1) {
    throw new TypeError(
      "ABG semantic compiler F_P review graph function must have one vector"
    );
  }
  const vector = graph.vectors[0];
  if (vector === undefined) {
    throw new TypeError(
      "ABG semantic compiler F_P review graph function has no vector"
    );
  }
  if (vector.operators.length !== 1 || vector.operators[0]?.regime !== "F_P") {
    throw new TypeError(
      "ABG semantic compiler F_P review graph function must have one F_P operator"
    );
  }
  if (!semanticCompilerFpReviewDeclaresT162Boundary(vector.declarations)) {
    throw new TypeError(
      "ABG semantic compiler F_P review vector must declare the T-162 worker-control and F_D finite-surface boundary"
    );
  }
  if (
    vector.evaluators.length !== 1 ||
    vector.evaluators[0]?.regime !== "F_P" ||
    vector.evaluators[0]?.binding !==
      ABG_SEMANTIC_COMPILER_FP_REVIEW_ADMISSION_REF
  ) {
    throw new TypeError(
      "ABG semantic compiler F_P review graph function must have one F_P admission evaluator"
    );
  }
  const result = constructAbgSemanticCompilerFpReviewResult(input);
  const admission = admitAbgSemanticCompilerFpReviewResult({
    value: result,
    expectedPackage: input
  });
  const admittedResult = admission.result;
  if (!admission.passed || admittedResult === null) {
    throw new TypeError(
      `ABG semantic compiler F_P review graph function failed admission: ${admission.reason}`
    );
  }
  return Object.freeze({
    kind: "abg_semantic_compiler_fp_review_run_result",
    graphFunctionRef: ABG_SEMANTIC_COMPILER_FP_REVIEW_GRAPH_FUNCTION_REF,
    graphFunctionDigest: abgSemanticCompilerFpReviewGraphFunctionDigest(),
    graphId: graph.id,
    vectorId: vector.id,
    vectorIndex: 0,
    edgeRef: vector.name,
    regime: "F_P",
    result: admittedResult,
    admission,
    evidenceRefs: Object.freeze([
      ABG_SEMANTIC_COMPILER_FP_REVIEW_GRAPH_FUNCTION_REF,
      ABG_SEMANTIC_COMPILER_FP_REVIEW_RUNTIME_REF,
      ABG_SEMANTIC_COMPILER_FP_REVIEW_ADMISSION_REF,
      ...admittedResult.evidenceRefs
    ])
  });
}

function requiredAbgReviewString(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly issues: string[];
}): string {
  const value = input.record[input.key];
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  input.issues.push(`${input.key} must be a non-empty string`);
  return "";
}

function requiredAbgReviewNonNegativeInteger(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly issues: string[];
}): number {
  const value = input.record[input.key];
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) {
    return value;
  }
  input.issues.push(`${input.key} must be a non-negative integer`);
  return 0;
}

function requiredAbgReviewStringArray(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly issues: string[];
}): readonly string[] {
  const values = stringArrayFromUnknown(input.record[input.key]);
  if (values !== null) {
    return values;
  }
  input.issues.push(`${input.key} must be an array of strings`);
  return Object.freeze([]);
}

export function admitAbgSemanticCompilerFpReviewResult(input: {
  readonly value: unknown;
  readonly expectedPackage: AbgSemanticCompilerFpReviewPackageIdentity;
}): AbgSemanticCompilerFpReviewResultAdmission {
  const issues: string[] = [];
  if (!isRecord(input.value)) {
    return Object.freeze({
      admitted: false,
      passed: false,
      reason: "review result is not a JSON object",
      issues: Object.freeze(["review result is not a JSON object"]),
      result: null
    });
  }

  const record = input.value;
  const kind = requiredAbgReviewString({ record, key: "kind", issues });
  const reviewVersion = requiredAbgReviewString({
    record,
    key: "reviewVersion",
    issues
  });
  const subjectRef = requiredAbgReviewString({
    record,
    key: "subjectRef",
    issues
  });
  const deterministicReportDigest = requiredAbgReviewString({
    record,
    key: "deterministicReportDigest",
    issues
  });
  const sourcePackageKind = requiredAbgReviewString({
    record,
    key: "sourcePackageKind",
    issues
  });
  const sourcePackageVersion = requiredAbgReviewString({
    record,
    key: "sourcePackageVersion",
    issues
  });
  const sourcePackageDigest = requiredAbgReviewString({
    record,
    key: "sourcePackageDigest",
    issues
  });
  const workerControlContractRef = requiredAbgReviewString({
    record,
    key: "workerControlContractRef",
    issues
  });
  const authorityPacketRef = requiredAbgReviewString({
    record,
    key: "authorityPacketRef",
    issues
  });
  const objectiveRef = requiredAbgReviewString({
    record,
    key: "objectiveRef",
    issues
  });
  const targetArtifactRef = requiredAbgReviewString({
    record,
    key: "targetArtifactRef",
    issues
  });
  const toolBoundaryRefs = requiredAbgReviewStringArray({
    record,
    key: "toolBoundaryRefs",
    issues
  });
  const requiredArtifactDeltaKind = requiredAbgReviewString({
    record,
    key: "requiredArtifactDeltaKind",
    issues
  });
  const stopConditionRef = requiredAbgReviewString({
    record,
    key: "stopConditionRef",
    issues
  });
  const fdPackageGrammarRef = requiredAbgReviewString({
    record,
    key: "fdPackageGrammarRef",
    issues
  });
  const fdResultGrammarRef = requiredAbgReviewString({
    record,
    key: "fdResultGrammarRef",
    issues
  });
  const fdProgressTelemetryGrammarRef = requiredAbgReviewString({
    record,
    key: "fdProgressTelemetryGrammarRef",
    issues
  });
  const fdProgressMetricRef = requiredAbgReviewString({
    record,
    key: "fdProgressMetricRef",
    issues
  });
  const fdAdmissionFsmRef = requiredAbgReviewString({
    record,
    key: "fdAdmissionFsmRef",
    issues
  });
  const fdOutputStateEnumRef = requiredAbgReviewString({
    record,
    key: "fdOutputStateEnumRef",
    issues
  });
  const fdDerivationRuleRef = requiredAbgReviewString({
    record,
    key: "fdDerivationRuleRef",
    issues
  });
  const fdForbiddenInterpretation = requiredAbgReviewString({
    record,
    key: "fdForbiddenInterpretation",
    issues
  });
  const status = requiredAbgReviewString({
    record,
    key: "status",
    issues
  });
  const findingCount = requiredAbgReviewNonNegativeInteger({
    record,
    key: "findingCount",
    issues
  });
  const reviewerProfileRef = requiredAbgReviewString({
    record,
    key: "reviewerProfileRef",
    issues
  });
  const reviewedAt = requiredAbgReviewString({
    record,
    key: "reviewedAt",
    issues
  });
  const producerGraphFunctionRef = requiredAbgReviewString({
    record,
    key: "producerGraphFunctionRef",
    issues
  });
  const producerGraphFunctionDigest = requiredAbgReviewString({
    record,
    key: "producerGraphFunctionDigest",
    issues
  });
  const producerRuntimeKind = requiredAbgReviewString({
    record,
    key: "producerRuntimeKind",
    issues
  });
  const producerRuntimeRef = requiredAbgReviewString({
    record,
    key: "producerRuntimeRef",
    issues
  });
  const admissionRef = requiredAbgReviewString({
    record,
    key: "admissionRef",
    issues
  });
  const evidenceRefs = stringArrayFromUnknown(record["evidenceRefs"]);
  if (evidenceRefs === null) {
    issues.push("evidenceRefs must be an array of strings");
  }

  const expectedPackageDigest =
    abgSemanticCompilerFpReviewPackageDigest(input.expectedPackage);
  const expectedGraphFunctionDigest =
    abgSemanticCompilerFpReviewGraphFunctionDigest();
  if (kind !== ABG_SEMANTIC_COMPILER_FP_REVIEW_RESULT_KIND) {
    issues.push("kind is not an admitted ABG semantic compiler review result");
  }
  if (reviewVersion !== ABG_SEMANTIC_COMPILER_FP_REVIEW_RESULT_VERSION) {
    issues.push("reviewVersion is not admitted");
  }
  if (subjectRef !== input.expectedPackage.subjectRef) {
    issues.push("subjectRef does not match the reviewed package");
  }
  if (
    deterministicReportDigest !==
    input.expectedPackage.deterministicReportDigest
  ) {
    issues.push(
      "deterministicReportDigest does not match the reviewed package"
    );
  }
  if (sourcePackageKind !== input.expectedPackage.kind) {
    issues.push("sourcePackageKind does not match the reviewed package");
  }
  if (sourcePackageVersion !== input.expectedPackage.packageVersion) {
    issues.push("sourcePackageVersion does not match the reviewed package");
  }
  if (sourcePackageDigest !== expectedPackageDigest) {
    issues.push("sourcePackageDigest does not match the reviewed package");
  }
  if (
    workerControlContractRef !==
      ABG_SEMANTIC_COMPILER_FP_REVIEW_WORKER_CONTROL_CONTRACT_REF ||
    workerControlContractRef !== input.expectedPackage.workerControlContractRef
  ) {
    issues.push("workerControlContractRef is not admitted");
  }
  if (authorityPacketRef !== input.expectedPackage.authorityPacketRef) {
    issues.push("authorityPacketRef does not match the reviewed package");
  }
  if (objectiveRef !== input.expectedPackage.objectiveRef) {
    issues.push("objectiveRef does not match the reviewed package");
  }
  if (targetArtifactRef !== input.expectedPackage.targetArtifactRef) {
    issues.push("targetArtifactRef does not match the reviewed package");
  }
  if (stableJson(toolBoundaryRefs) !== stableJson(input.expectedPackage.toolBoundaryRefs)) {
    issues.push("toolBoundaryRefs do not match the reviewed package");
  }
  if (
    requiredArtifactDeltaKind !==
      ABG_SEMANTIC_COMPILER_FP_REVIEW_REQUIRED_ARTIFACT_DELTA_KIND ||
    requiredArtifactDeltaKind !== input.expectedPackage.requiredArtifactDeltaKind
  ) {
    issues.push("requiredArtifactDeltaKind is not admitted");
  }
  if (stopConditionRef !== input.expectedPackage.stopConditionRef) {
    issues.push("stopConditionRef does not match the reviewed package");
  }
  if (
    fdPackageGrammarRef !==
      ABG_SEMANTIC_COMPILER_FP_REVIEW_PACKAGE_GRAMMAR_REF ||
    fdPackageGrammarRef !== input.expectedPackage.fdPackageGrammarRef
  ) {
    issues.push("fdPackageGrammarRef is not admitted");
  }
  if (
    fdResultGrammarRef !== ABG_SEMANTIC_COMPILER_FP_REVIEW_RESULT_GRAMMAR_REF ||
    fdResultGrammarRef !== input.expectedPackage.fdResultGrammarRef
  ) {
    issues.push("fdResultGrammarRef is not admitted");
  }
  if (
    fdProgressTelemetryGrammarRef !==
      ABG_SEMANTIC_COMPILER_FP_REVIEW_PROGRESS_TELEMETRY_GRAMMAR_REF ||
    fdProgressTelemetryGrammarRef !==
      input.expectedPackage.fdProgressTelemetryGrammarRef
  ) {
    issues.push("fdProgressTelemetryGrammarRef is not admitted");
  }
  if (
    fdProgressMetricRef !==
      ABG_SEMANTIC_COMPILER_FP_REVIEW_PROGRESS_METRIC_REF ||
    fdProgressMetricRef !== input.expectedPackage.fdProgressMetricRef
  ) {
    issues.push("fdProgressMetricRef is not admitted");
  }
  if (
    fdAdmissionFsmRef !== ABG_SEMANTIC_COMPILER_FP_REVIEW_ADMISSION_FSM_REF ||
    fdAdmissionFsmRef !== input.expectedPackage.fdAdmissionFsmRef
  ) {
    issues.push("fdAdmissionFsmRef is not admitted");
  }
  if (
    fdOutputStateEnumRef !==
      ABG_SEMANTIC_COMPILER_FP_REVIEW_OUTPUT_STATE_ENUM_REF ||
    fdOutputStateEnumRef !== input.expectedPackage.fdOutputStateEnumRef
  ) {
    issues.push("fdOutputStateEnumRef is not admitted");
  }
  if (
    fdDerivationRuleRef !==
      ABG_SEMANTIC_COMPILER_FP_REVIEW_DERIVATION_RULE_REF ||
    fdDerivationRuleRef !== input.expectedPackage.fdDerivationRuleRef
  ) {
    issues.push("fdDerivationRuleRef is not admitted");
  }
  if (
    fdForbiddenInterpretation !==
      ABG_SEMANTIC_COMPILER_FP_REVIEW_FD_FORBIDDEN_INTERPRETATION ||
    fdForbiddenInterpretation !== input.expectedPackage.fdForbiddenInterpretation
  ) {
    issues.push("fdForbiddenInterpretation is not admitted");
  }
  if (!isGtlProgramSemanticReviewStatus(status)) {
    issues.push("status must be passed, failed, or blocked");
  }
  if (
    producerGraphFunctionRef !==
    ABG_SEMANTIC_COMPILER_FP_REVIEW_GRAPH_FUNCTION_REF
  ) {
    issues.push("producerGraphFunctionRef is not the ABG review graph function");
  }
  if (producerGraphFunctionDigest !== expectedGraphFunctionDigest) {
    issues.push(
      "producerGraphFunctionDigest does not match the ABG review graph function"
    );
  }
  if (producerRuntimeKind !== ABG_SEMANTIC_COMPILER_FP_REVIEW_RUNTIME_KIND) {
    issues.push("producerRuntimeKind is not abg_graph_function");
  }
  if (producerRuntimeRef !== ABG_SEMANTIC_COMPILER_FP_REVIEW_RUNTIME_REF) {
    issues.push("producerRuntimeRef is not the ABG review runtime");
  }
  if (admissionRef !== ABG_SEMANTIC_COMPILER_FP_REVIEW_ADMISSION_REF) {
    issues.push("admissionRef is not the ABG review admission contract");
  }

  if (issues.length > 0) {
    return Object.freeze({
      admitted: false,
      passed: false,
      reason: issues[0] ?? "review result failed admission",
      issues: Object.freeze([...issues]),
      result: null
    });
  }

  const admittedStatus: GtlProgramSemanticReviewStatus =
    status === "passed" || status === "failed" ? status : "blocked";
  const result = Object.freeze({
    kind: ABG_SEMANTIC_COMPILER_FP_REVIEW_RESULT_KIND,
    reviewVersion: ABG_SEMANTIC_COMPILER_FP_REVIEW_RESULT_VERSION,
    subjectRef,
    deterministicReportDigest,
    sourcePackageKind,
    sourcePackageVersion,
    sourcePackageDigest,
    workerControlContractRef:
      ABG_SEMANTIC_COMPILER_FP_REVIEW_WORKER_CONTROL_CONTRACT_REF,
    authorityPacketRef,
    objectiveRef,
    targetArtifactRef,
    toolBoundaryRefs: Object.freeze([...toolBoundaryRefs]),
    requiredArtifactDeltaKind:
      ABG_SEMANTIC_COMPILER_FP_REVIEW_REQUIRED_ARTIFACT_DELTA_KIND,
    stopConditionRef,
    fdPackageGrammarRef: ABG_SEMANTIC_COMPILER_FP_REVIEW_PACKAGE_GRAMMAR_REF,
    fdResultGrammarRef: ABG_SEMANTIC_COMPILER_FP_REVIEW_RESULT_GRAMMAR_REF,
    fdProgressTelemetryGrammarRef:
      ABG_SEMANTIC_COMPILER_FP_REVIEW_PROGRESS_TELEMETRY_GRAMMAR_REF,
    fdProgressMetricRef: ABG_SEMANTIC_COMPILER_FP_REVIEW_PROGRESS_METRIC_REF,
    fdAdmissionFsmRef: ABG_SEMANTIC_COMPILER_FP_REVIEW_ADMISSION_FSM_REF,
    fdOutputStateEnumRef:
      ABG_SEMANTIC_COMPILER_FP_REVIEW_OUTPUT_STATE_ENUM_REF,
    fdDerivationRuleRef:
      ABG_SEMANTIC_COMPILER_FP_REVIEW_DERIVATION_RULE_REF,
    fdForbiddenInterpretation:
      ABG_SEMANTIC_COMPILER_FP_REVIEW_FD_FORBIDDEN_INTERPRETATION,
    status: admittedStatus,
    findingCount,
    reviewerProfileRef,
    reviewedAt,
    producerGraphFunctionRef:
      ABG_SEMANTIC_COMPILER_FP_REVIEW_GRAPH_FUNCTION_REF,
    producerGraphFunctionDigest,
    producerRuntimeKind: ABG_SEMANTIC_COMPILER_FP_REVIEW_RUNTIME_KIND,
    producerRuntimeRef: ABG_SEMANTIC_COMPILER_FP_REVIEW_RUNTIME_REF,
    admissionRef: ABG_SEMANTIC_COMPILER_FP_REVIEW_ADMISSION_REF,
    evidenceRefs: Object.freeze([...(evidenceRefs ?? [])])
  });
  if (result.status !== "passed") {
    return Object.freeze({
      admitted: true,
      passed: false,
      reason: "review result status is not passed",
      issues: Object.freeze([]),
      result
    });
  }
  if (result.findingCount !== 0) {
    return Object.freeze({
      admitted: true,
      passed: false,
      reason: "review result carries open findings",
      issues: Object.freeze([]),
      result
    });
  }
  return Object.freeze({
    admitted: true,
    passed: true,
    reason: "ABG semantic compiler F_P review result admitted and passed",
    issues: Object.freeze([]),
    result
  });
}

function requiredBooleanField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly expected: true;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): true;
function requiredBooleanField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly expected: false;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): false;
function requiredBooleanField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly expected: boolean;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): boolean {
  const value = input.record[input.key];
  if (value === input.expected) {
    return input.expected;
  }
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/input/boolean-field",
      message: `${input.label}.${input.key} must be ${String(input.expected)}`
    })
  );
  return input.expected;
}

function requiredRegimeField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): Regime {
  const value = input.record[input.key];
  if (isRegime(value)) {
    return value;
  }
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/input/regime-field",
      message: `${input.label}.${input.key} must be F_D, F_P, or F_H`
    })
  );
  return "F_D";
}

function requiredStageRegimeDispositionField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): GtlProgramStageRegimeDisposition {
  const value = input.record[input.key];
  if (isGtlProgramStageRegimeDisposition(value)) {
    return value;
  }
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/input/stage-regime-disposition-field",
      message: `${input.label}.${input.key} must be participates, not_used, or external_callout`
    })
  );
  return "not_used";
}

function requiredComputeStageRoleField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): EngineComputeStageRole {
  const value = input.record[input.key];
  if (isEngineComputeStageRole(value)) {
    return value;
  }
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/input/compute-stage-role-field",
      message: `${input.label}.${input.key} must name an ABG compute stage role`
    })
  );
  return "transform";
}

function requiredComputeStagePurposeField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): EngineComputeStagePurpose {
  const value = input.record[input.key];
  if (isEngineComputeStagePurpose(value)) {
    return value;
  }
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/input/compute-stage-purpose-field",
      message: `${input.label}.${input.key} must name an ABG compute stage purpose`
    })
  );
  return "candidate_construction";
}

function requiredRuntimeBindingKindField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): GtlProgramRuntimeBindingKind {
  const value = input.record[input.key];
  if (isGtlProgramRuntimeBindingKind(value)) {
    return value;
  }
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/input/runtime-binding-kind-field",
      message: `${input.label}.${input.key} must name an ABG public runtime binding kind`
    })
  );
  return "abg_cli_runtime_binding";
}

function requiredRepairSurfaceDispositionField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): GtlProgramRepairSurfaceDisposition {
  const value = input.record[input.key];
  if (isGtlProgramRepairSurfaceDisposition(value)) {
    return value;
  }
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/input/repair-surface-disposition-field",
      message: `${input.label}.${input.key} must classify current_edge_repair, upstream_reentry, downstream_deferred, or external_blocked`
    })
  );
  return "external_blocked";
}

function requiredGraphReentryPointField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): GraphReentryPoint {
  const value = input.record[input.key];
  if (isGraphReentryPoint(value)) {
    return value;
  }
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/input/graph-reentry-point-field",
      message: `${input.label}.${input.key} must name an ABG GraphReentryPoint`
    })
  );
  return "realization";
}

function requiredHostSurfaceKindField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): GtlProgramHostSurfaceKind {
  const value = input.record[input.key];
  if (isGtlProgramHostSurfaceKind(value)) {
    return value;
  }
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/input/host-kind-field",
      message: `${input.label}.${input.key} must name a GTL/ABG host surface kind`
    })
  );
  return "module";
}

function requiredCompositionDeclarationSourceKindField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): GtlProgramCompositionDeclarationSourceKind {
  const value = input.record[input.key];
  if (isGtlProgramCompositionDeclarationSourceKind(value)) {
    return value;
  }
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/input/composition-source-kind-field",
      message: `${input.label}.${input.key} must name a composition declaration source kind`
    })
  );
  return "visible_defaults";
}

function requiredHookDeclarationSourceKindField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): GtlProgramHookDeclarationSourceKind {
  const value = input.record[input.key];
  if (isGtlProgramHookDeclarationSourceKind(value)) {
    return value;
  }
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/input/hook-source-kind-field",
      message: `${input.label}.${input.key} must name a hook declaration source kind`
    })
  );
  return "visible_defaults";
}

function requiredSelectionBoundaryKindField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): GtlProgramSelectionBoundaryKind {
  const value = input.record[input.key];
  if (isGtlProgramSelectionBoundaryKind(value)) {
    return value;
  }
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/input/selection-boundary-kind-field",
      message: `${input.label}.${input.key} must name a selection/refinement/synthesis/subwork boundary kind`
    })
  );
  return "refinement_boundary";
}

function checkOptionalArrayField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly subjectRef: string;
  readonly issues: GtlProgramConformanceIssue[];
}): readonly unknown[] {
  const value = optionalUnknownArray(input.record, input.key);
  if (value === undefined) {
    return Object.freeze([]);
  }
  if (value === null) {
    input.issues.push(
      issue({
        surfaceKind: "program_inventory",
        surfaceRef: input.subjectRef,
        ruleRef: "abg://gtl-program/input/array-field",
        message: `${input.key} must be an array when supplied`
      })
    );
    return Object.freeze([]);
  }
  return value;
}

function isGraphFunctionLike(input: unknown): input is GraphFunction {
  return (
    isRecord(input) &&
    typeof input["name"] === "string" &&
    Array.isArray(input["inputs"]) &&
    Array.isArray(input["outputs"]) &&
    isRecord(input["environment"]) &&
    isRecord(input["template"])
  );
}

function plausibleGraphFunction(
  input: unknown,
  subjectRef: string,
  issues: GtlProgramConformanceIssue[],
  label: string
): GraphFunction | null {
  if (!isGraphFunctionLike(input)) {
    issues.push(
      issue({
        surfaceKind: "graph_function",
        surfaceRef: subjectRef,
        ruleRef: "abg://gtl-program/input/graph-function",
        message: `${label} must be a GraphFunction-like object with a name`
      })
    );
    return null;
  }
  return input;
}

function isModuleLike(input: unknown): input is Module {
  return (
    isRecord(input) &&
    typeof input["name"] === "string" &&
    Array.isArray(input["graphs"]) &&
    Array.isArray(input["graphFunctions"]) &&
    Array.isArray(input["refinementBoundaries"]) &&
    Array.isArray(input["candidateFamilies"]) &&
    Array.isArray(input["jobs"]) &&
    Array.isArray(input["roles"]) &&
    Array.isArray(input["operators"]) &&
    Array.isArray(input["evaluators"]) &&
    Array.isArray(input["rules"])
  );
}

function plausibleModule(
  input: unknown,
  subjectRef: string,
  issues: GtlProgramConformanceIssue[],
  label: string
): Module | null {
  if (!isModuleLike(input)) {
    issues.push(
      issue({
        surfaceKind: "module",
        surfaceRef: subjectRef,
        ruleRef: "abg://gtl-program/input/module",
        message: `${label} must be a Module-like object with graphFunctions`
      })
    );
    return null;
  }
  return input;
}

function isAssetSurfaceLike(input: unknown): input is AssetSurface {
  return isRecord(input) && typeof input["kind"] === "string";
}

function isNodeLike(input: unknown): input is Node {
  return (
    isRecord(input) &&
    typeof input["name"] === "string" &&
    isRecord(input["schema"]) &&
    Array.isArray(input["markov"])
  );
}

function admitExpectedCoverage(
  input: unknown,
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): GtlProgramExpectedCoverage {
  const admitted: Record<CoverageKey, number> = {
    catalogGraphFunctionCount: 0,
    publishedGraphFunctionCount: 0,
    graphVectorCount: 0,
    targetCarrierContractCount: 0,
    edgeClosureContractCount: 0,
    overlayCount: 0,
    publicStartTargetCount: 0,
    promptAssetCount: 0,
    pluginContractCount: 0,
    sourceIdentitySurfaceCount: 0
  };
  if (!isRecord(input)) {
    issues.push(
      issue({
        surfaceKind: "program_inventory",
        surfaceRef: subjectRef,
        ruleRef: "abg://gtl-program/coverage/expected-coverage-required",
        message: "GTL program typecheck requires expectedCoverage with every coverage key"
      })
    );
    return Object.freeze(admitted);
  }
  for (const key of COVERAGE_KEYS) {
    if (!Object.hasOwn(input, key)) {
      issues.push(
        issue({
          surfaceKind: "program_inventory",
          surfaceRef: subjectRef,
          ruleRef: "abg://gtl-program/coverage/expected-count-required",
          message: `expectedCoverage.${key} is required`
        })
      );
      continue;
    }
    const value = input[key];
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
      issues.push(
        issue({
          surfaceKind: "program_inventory",
          surfaceRef: subjectRef,
          ruleRef: "abg://gtl-program/coverage/expected-count-admitted",
          message: `expectedCoverage.${key} must be a non-negative integer`
        })
      );
      continue;
    }
    admitted[key] = value;
  }
  return Object.freeze(admitted);
}

function emptyFeatureCoverageManifest(
  manifestRef: string
): GtlProgramFeatureCoverageManifest {
  return Object.freeze({
    kind: "gtl_program_feature_coverage_manifest" as const,
    manifestRef,
    t153RequirementRef: "REQ-L-GTL3-CONTRACT-LAW-API" as const,
    rows: Object.freeze([])
  });
}

function admitFeatureKind(input: {
  readonly value: unknown;
  readonly label: string;
  readonly subjectRef: string;
  readonly issues: GtlProgramConformanceIssue[];
}): GtlProgramT153FeatureKind | null {
  if (isGtlProgramT153FeatureKind(input.value)) {
    return input.value;
  }
  input.issues.push(
    issue({
      surfaceKind: "feature_coverage",
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/feature-coverage/feature-kind",
      message: `${input.label}.featureKind must name a T-153 feature kind`
    })
  );
  return null;
}

function admitFeatureDisposition(input: {
  readonly value: unknown;
  readonly label: string;
  readonly subjectRef: string;
  readonly issues: GtlProgramConformanceIssue[];
}): GtlProgramFeatureDisposition | null {
  if (isGtlProgramFeatureDisposition(input.value)) {
    return input.value;
  }
  input.issues.push(
    issue({
      surfaceKind: "feature_coverage",
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/feature-coverage/disposition",
      message: `${input.label}.disposition must be present or not_used`
    })
  );
  return null;
}

function admitFeatureOwner(input: {
  readonly value: unknown;
  readonly label: string;
  readonly subjectRef: string;
  readonly issues: GtlProgramConformanceIssue[];
}): GtlProgramFeatureOwnerClassification | null {
  if (isGtlProgramFeatureOwnerClassification(input.value)) {
    return input.value;
  }
  input.issues.push(
    issue({
      surfaceKind: "feature_coverage",
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/feature-coverage/owner-classification",
      message: `${input.label}.ownerClassification must classify GTL, ABG, or downstream ownership`
    })
  );
  return null;
}

function admitFeatureCoverageRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramFeatureCoverageRow[] {
  return Object.freeze(
    input.flatMap((entry, index) => {
      const label = `featureCoverageManifest.rows[${index}]`;
      if (!isRecord(entry)) {
        issues.push(
          issue({
            surfaceKind: "feature_coverage",
            surfaceRef: subjectRef,
            ruleRef: "abg://gtl-program/feature-coverage/row",
            message: `${label} must be an object`
          })
        );
        return [];
      }
      const featureKind = admitFeatureKind({
        value: entry["featureKind"],
        label,
        subjectRef,
        issues
      });
      const disposition = admitFeatureDisposition({
        value: entry["disposition"],
        label,
        subjectRef,
        issues
      });
      const ownerClassification = admitFeatureOwner({
        value: entry["ownerClassification"],
        label,
        subjectRef,
        issues
      });
      if (
        featureKind === null ||
        disposition === null ||
        ownerClassification === null
      ) {
        return [];
      }
      const expectedOwner =
        GTL_PROGRAM_T153_FEATURE_OWNER_CLASSIFICATIONS[featureKind];
      if (ownerClassification !== expectedOwner) {
        issues.push(
          issue({
            surfaceKind: "feature_coverage",
            surfaceRef: featureKind,
            ruleRef: "abg://gtl-program/feature-coverage/owner-classification-truth",
            message: `${featureKind} ownerClassification must be ${expectedOwner}, received ${ownerClassification}`
          })
        );
      }
      const requirementRefs = requiredStringArrayField({
        record: entry,
        key: "requirementRefs",
        label,
        subjectRef,
        surfaceKind: "feature_coverage",
        issues
      });
      const evidenceRefs = requiredStringArrayField({
        record: entry,
        key: "evidenceRefs",
        label,
        subjectRef,
        surfaceKind: "feature_coverage",
        issues
      });
      const reasonRefs = optionalStringArrayField({
        record: entry,
        key: "reasonRefs",
        label,
        subjectRef,
        surfaceKind: "feature_coverage",
        issues
      });
      return [
        Object.freeze({
          featureKind,
          disposition,
          ownerClassification,
          requirementRefs,
          evidenceRefs,
          reasonRefs
        })
      ];
    })
  );
}

function admitFeatureCoverageManifest(
  input: unknown,
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): GtlProgramFeatureCoverageManifest {
  if (!isRecord(input)) {
    issues.push(
      issue({
        surfaceKind: "feature_coverage",
        surfaceRef: subjectRef,
        ruleRef: "abg://gtl-program/feature-coverage/manifest-required",
        message: "GTL program typecheck requires featureCoverageManifest for every T-153 capability family"
      })
    );
    return emptyFeatureCoverageManifest("missing");
  }
  if (input["kind"] !== "gtl_program_feature_coverage_manifest") {
    issues.push(
      issue({
        surfaceKind: "feature_coverage",
        surfaceRef: subjectRef,
        ruleRef: "abg://gtl-program/feature-coverage/kind",
        message: "featureCoverageManifest.kind must be gtl_program_feature_coverage_manifest"
      })
    );
  }
  if (input["t153RequirementRef"] !== "REQ-L-GTL3-CONTRACT-LAW-API") {
    issues.push(
      issue({
        surfaceKind: "feature_coverage",
        surfaceRef: subjectRef,
        ruleRef: "abg://gtl-program/feature-coverage/t153-requirement",
        message: "featureCoverageManifest.t153RequirementRef must be REQ-L-GTL3-CONTRACT-LAW-API"
      })
    );
  }
  const manifestRef = requiredStringField({
    record: input,
    key: "manifestRef",
    label: "featureCoverageManifest",
    subjectRef,
    surfaceKind: "feature_coverage",
    issues
  }) || "missing";
  const rowInputs = checkOptionalArrayField({
    record: input,
    key: "rows",
    subjectRef,
    issues
  });
  return Object.freeze({
    kind: "gtl_program_feature_coverage_manifest" as const,
    manifestRef,
    t153RequirementRef: "REQ-L-GTL3-CONTRACT-LAW-API" as const,
    rows: admitFeatureCoverageRows(rowInputs, subjectRef, issues)
  });
}

function admitTargetCarrierRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramTargetCarrierRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `targetCarrierContracts[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "target_carrier_contract",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/target-carrier-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          edgeRef: requiredStringField({
            record: row,
            key: "edgeRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          graphVectorRef: requiredStringField({
            record: row,
            key: "graphVectorRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          graphFunctionId: requiredStringField({
            record: row,
            key: "graphFunctionId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          graphId: requiredStringField({
            record: row,
            key: "graphId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          graphVectorId: requiredStringField({
            record: row,
            key: "graphVectorId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          targetAssetType: requiredStringField({
            record: row,
            key: "targetAssetType",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          targetCarrierContractRef: requiredStringField({
            record: row,
            key: "targetCarrierContractRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          targetCarrierContractDigest: requiredStringField({
            record: row,
            key: "targetCarrierContractDigest",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          targetCarrierTemplateRef: requiredStringField({
            record: row,
            key: "targetCarrierTemplateRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          outputSurfaceRef: requiredStringField({
            record: row,
            key: "outputSurfaceRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          outputCarrierFamilyRef: requiredStringField({
            record: row,
            key: "outputCarrierFamilyRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          outputCarrierKind: requiredStringField({
            record: row,
            key: "outputCarrierKind",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          envelopeContractRef: requiredStringField({
            record: row,
            key: "envelopeContractRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          nestedPayloadPath: requiredStringField({
            record: row,
            key: "nestedPayloadPath",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          requiredFieldRefs: requiredStringArrayField({
            record: row,
            key: "requiredFieldRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          optionalFieldRefs: requiredStringArrayField({
            record: row,
            key: "optionalFieldRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          fixedProtocolFieldRefs: requiredStringArrayField({
            record: row,
            key: "fixedProtocolFieldRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          workerFillableFieldRefs: requiredStringArrayField({
            record: row,
            key: "workerFillableFieldRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          literalDomainRefs: requiredStringArrayField({
            record: row,
            key: "literalDomainRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          enumDomainRefs: requiredStringArrayField({
            record: row,
            key: "enumDomainRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          schemaRef: requiredStringField({
            record: row,
            key: "schemaRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          admissionRef: requiredStringField({
            record: row,
            key: "admissionRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          payloadLedgerBindingRef: requiredStringField({
            record: row,
            key: "payloadLedgerBindingRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          edgeAssuranceBindingRef: requiredStringField({
            record: row,
            key: "edgeAssuranceBindingRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          handoffProjectionRef: requiredStringField({
            record: row,
            key: "handoffProjectionRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          constructionTemplateRef: requiredStringField({
            record: row,
            key: "constructionTemplateRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          replayDigestPolicyRef: requiredStringField({
            record: row,
            key: "replayDigestPolicyRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          materializationPolicyRef: requiredStringField({
            record: row,
            key: "materializationPolicyRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          closurePreconditionRef: requiredStringField({
            record: row,
            key: "closurePreconditionRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          })
        })
      ];
    })
  );
}

function admitEdgeClosureRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramEdgeClosureRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `edgeClosureContracts[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "edge_closure_contract",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/edge-closure-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          edgeRef: requiredStringField({
            record: row,
            key: "edgeRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "edge_closure_contract",
            issues
          }),
          graphFunctionId: requiredStringField({
            record: row,
            key: "graphFunctionId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "edge_closure_contract",
            issues
          }),
          graphId: requiredStringField({
            record: row,
            key: "graphId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "edge_closure_contract",
            issues
          }),
          graphVectorId: requiredStringField({
            record: row,
            key: "graphVectorId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "edge_closure_contract",
            issues
          }),
          targetAssetType: requiredStringField({
            record: row,
            key: "targetAssetType",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "edge_closure_contract",
            issues
          })
        })
      ];
    })
  );
}

function admitOverlayRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramOverlayRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `overlays[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "overlay",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/overlay-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          overlayRef: requiredStringField({
            record: row,
            key: "overlayRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "overlay",
            issues
          }),
          graphFunctionRefs: optionalStringArrayField({
            record: row,
            key: "graphFunctionRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "overlay",
            issues
          }),
          graphVectorRefs: optionalStringArrayField({
            record: row,
            key: "graphVectorRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "overlay",
            issues
          }),
          publicStartTargets: optionalStringArrayField({
            record: row,
            key: "publicStartTargets",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "overlay",
            issues
          }),
          defaultStartTarget: requiredStringField({
            record: row,
            key: "defaultStartTarget",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "overlay",
            issues
          })
        })
      ];
    })
  );
}

function admitPublicStartRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramPublicStartRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `publicStartTargets[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "public_start",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/public-start-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          name: requiredStringField({
            record: row,
            key: "name",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "public_start",
            issues
          }),
          graphFunctionRef: requiredStringField({
            record: row,
            key: "graphFunctionRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "public_start",
            issues
          }),
          overlayRefs: optionalStringArrayField({
            record: row,
            key: "overlayRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "public_start",
            issues
          }),
          defaultForOverlayRefs: optionalStringArrayField({
            record: row,
            key: "defaultForOverlayRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "public_start",
            issues
          })
        })
      ];
    })
  );
}

function admitPromptAssetRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramPromptAssetRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `promptAssets[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "prompt_asset",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/prompt-asset-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      const gtlNode = row["gtlNode"];
      if (gtlNode !== undefined && !isNodeLike(gtlNode)) {
        issues.push(
          issue({
            surfaceKind: "prompt_asset",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/prompt-asset-node",
            message: `${surfaceRef}.gtlNode must be a GTL Node object when supplied`
          })
        );
      }
      const assetSurface = row["assetSurface"];
      if (!isAssetSurfaceLike(assetSurface)) {
        issues.push(
          issue({
            surfaceKind: "prompt_asset",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/prompt-asset-surface",
            message: `${surfaceRef}.assetSurface must be an AssetSurface object`
          })
        );
        return [];
      }
      const renderedViewDigest = row["renderedViewDigest"];
      if (
        renderedViewDigest !== undefined &&
        renderedViewDigest !== null &&
        typeof renderedViewDigest !== "string"
      ) {
        issues.push(
          issue({
            surfaceKind: "prompt_asset",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/prompt-asset-digest",
            message: `${surfaceRef}.renderedViewDigest must be null or a string`
          })
        );
      }
      return [
        Object.freeze({
          surfaceRef: requiredStringField({
            record: row,
            key: "surfaceRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "prompt_asset",
            issues
          }),
          assetSurface,
          ...(isNodeLike(gtlNode) ? { gtlNode } : {}),
          ...(renderedViewDigest === null || typeof renderedViewDigest === "string"
            ? { renderedViewDigest }
            : {}),
          currentAbgFoldRefs: optionalStringArrayField({
            record: row,
            key: "currentAbgFoldRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "prompt_asset",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "prompt_asset",
            issues
          })
        })
      ];
    })
  );
}

function admitSourceIdentityRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramSourceIdentityRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `sourceIdentitySurfaces[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "source_identity",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/source-identity-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          surfaceRef: requiredStringField({
            record: row,
            key: "surfaceRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "source_identity",
            issues
          }),
          text: requiredStringField({
            record: row,
            key: "text",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "source_identity",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "source_identity",
            issues
          })
        })
      ];
    })
  );
}

function requiredSourceAuthorityTokenMatchMode(input: {
  readonly record: Record<string, unknown>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly issues: GtlProgramConformanceIssue[];
}): GtlProgramSourceAuthorityTokenMatchMode {
  const value = requiredStringField({
    record: input.record,
    key: input.key,
    label: input.label,
    subjectRef: input.subjectRef,
    surfaceKind: "source_authority_policy",
    issues: input.issues
  });
  if (isGtlProgramSourceAuthorityTokenMatchMode(value)) {
    return value;
  }
  input.issues.push(
    issue({
      surfaceKind: "source_authority_policy",
      surfaceRef: input.label,
      ruleRef: "abg://gtl-program/input/source-authority-token-match-mode",
      message: `${input.label}.${input.key} must be one of any, all`
    })
  );
  return "all";
}

function admitSourceAuthorityPolicyRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramSourceAuthorityPolicyRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `sourceAuthorityPolicies[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "source_authority_policy",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/source-authority-policy-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          policyRef: requiredStringField({
            record: row,
            key: "policyRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "source_authority_policy",
            issues
          }),
          sourceSurfaceRefs: optionalStringArrayField({
            record: row,
            key: "sourceSurfaceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "source_authority_policy",
            issues
          }),
          sourceSurfaceRefPrefixes: optionalStringArrayField({
            record: row,
            key: "sourceSurfaceRefPrefixes",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "source_authority_policy",
            issues
          }),
          forbiddenTokens: requiredStringArrayField({
            record: row,
            key: "forbiddenTokens",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "source_authority_policy",
            issues
          }),
          forbiddenMatch: requiredSourceAuthorityTokenMatchMode({
            record: row,
            key: "forbiddenMatch",
            label: surfaceRef,
            subjectRef,
            issues
          }),
          requiredMitigationTokens: optionalStringArrayField({
            record: row,
            key: "requiredMitigationTokens",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "source_authority_policy",
            issues
          }),
          message: requiredStringField({
            record: row,
            key: "message",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "source_authority_policy",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "source_authority_policy",
            issues
          })
        })
      ];
    })
  );
}

function requiredSemanticReviewStatusField(input: {
  readonly record: Record<string, unknown>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly issues: GtlProgramConformanceIssue[];
}): GtlProgramSemanticReviewStatus {
  const value = requiredStringField({
    record: input.record,
    key: input.key,
    label: input.label,
    subjectRef: input.subjectRef,
    surfaceKind: "semantic_review_gate",
    issues: input.issues
  });
  if (isGtlProgramSemanticReviewStatus(value)) {
    return value;
  }
  input.issues.push(
    issue({
      surfaceKind: "semantic_review_gate",
      surfaceRef: input.label,
      ruleRef: "abg://gtl-program/input/semantic-review-status",
      message: `${input.label}.${input.key} must be passed, failed, or blocked`
    })
  );
  return "blocked";
}

function admitSemanticReviewGateRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramSemanticReviewGateRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `semanticReviewGates[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "semantic_review_gate",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/semantic-review-gate-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      const reviewResultKind = requiredStringField({
        record: row,
        key: "reviewResultKind",
        label: surfaceRef,
        subjectRef,
        surfaceKind: "semantic_review_gate",
        issues
      });
      if (
        reviewResultKind !== "sdlc_semantic_compiler_fp_review_result"
      ) {
        issues.push(
          issue({
            surfaceKind: "semantic_review_gate",
            surfaceRef,
            ruleRef: "abg://gtl-program/semantic-review-gate/admitted-result-kind",
            message: `${surfaceRef}.reviewResultKind must be sdlc_semantic_compiler_fp_review_result`
          })
        );
      }
      return [
        Object.freeze({
          gateRef: requiredStringField({
            record: row,
            key: "gateRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "semantic_review_gate",
            issues
          }),
          subjectRef: requiredStringField({
            record: row,
            key: "subjectRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "semantic_review_gate",
            issues
          }),
          deterministicReportDigest: requiredStringField({
            record: row,
            key: "deterministicReportDigest",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "semantic_review_gate",
            issues
          }),
          reviewResultKind: "sdlc_semantic_compiler_fp_review_result",
          reviewVersion: requiredStringField({
            record: row,
            key: "reviewVersion",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "semantic_review_gate",
            issues
          }),
          sourcePackageDigest: requiredStringField({
            record: row,
            key: "sourcePackageDigest",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "semantic_review_gate",
            issues
          }),
          workerControlContractRef: requiredStringField({
            record: row,
            key: "workerControlContractRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "semantic_review_gate",
            issues
          }),
          authorityPacketRef: requiredStringField({
            record: row,
            key: "authorityPacketRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "semantic_review_gate",
            issues
          }),
          objectiveRef: requiredStringField({
            record: row,
            key: "objectiveRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "semantic_review_gate",
            issues
          }),
          targetArtifactRef: requiredStringField({
            record: row,
            key: "targetArtifactRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "semantic_review_gate",
            issues
          }),
          toolBoundaryRefs: requiredStringArrayField({
            record: row,
            key: "toolBoundaryRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "semantic_review_gate",
            issues
          }),
          requiredArtifactDeltaKind: requiredStringField({
            record: row,
            key: "requiredArtifactDeltaKind",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "semantic_review_gate",
            issues
          }),
          stopConditionRef: requiredStringField({
            record: row,
            key: "stopConditionRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "semantic_review_gate",
            issues
          }),
          fdPackageGrammarRef: requiredStringField({
            record: row,
            key: "fdPackageGrammarRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "semantic_review_gate",
            issues
          }),
          fdResultGrammarRef: requiredStringField({
            record: row,
            key: "fdResultGrammarRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "semantic_review_gate",
            issues
          }),
          fdProgressTelemetryGrammarRef: requiredStringField({
            record: row,
            key: "fdProgressTelemetryGrammarRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "semantic_review_gate",
            issues
          }),
          fdProgressMetricRef: requiredStringField({
            record: row,
            key: "fdProgressMetricRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "semantic_review_gate",
            issues
          }),
          fdAdmissionFsmRef: requiredStringField({
            record: row,
            key: "fdAdmissionFsmRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "semantic_review_gate",
            issues
          }),
          fdOutputStateEnumRef: requiredStringField({
            record: row,
            key: "fdOutputStateEnumRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "semantic_review_gate",
            issues
          }),
          fdDerivationRuleRef: requiredStringField({
            record: row,
            key: "fdDerivationRuleRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "semantic_review_gate",
            issues
          }),
          fdForbiddenInterpretation: requiredStringField({
            record: row,
            key: "fdForbiddenInterpretation",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "semantic_review_gate",
            issues
          }),
          status: requiredSemanticReviewStatusField({
            record: row,
            key: "status",
            label: surfaceRef,
            subjectRef,
            issues
          }),
          findingCount: requiredNonNegativeIntegerField({
            record: row,
            key: "findingCount",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "semantic_review_gate",
            issues
          }),
          reviewerProfileRef: requiredStringField({
            record: row,
            key: "reviewerProfileRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "semantic_review_gate",
            issues
          }),
          reviewedAt: requiredStringField({
            record: row,
            key: "reviewedAt",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "semantic_review_gate",
            issues
          }),
          producerGraphFunctionRef: requiredStringField({
            record: row,
            key: "producerGraphFunctionRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "semantic_review_gate",
            issues
          }),
          producerGraphFunctionDigest: requiredStringField({
            record: row,
            key: "producerGraphFunctionDigest",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "semantic_review_gate",
            issues
          }),
          producerRuntimeKind: requiredStringField({
            record: row,
            key: "producerRuntimeKind",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "semantic_review_gate",
            issues
          }),
          producerRuntimeRef: requiredStringField({
            record: row,
            key: "producerRuntimeRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "semantic_review_gate",
            issues
          }),
          admissionRef: requiredStringField({
            record: row,
            key: "admissionRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "semantic_review_gate",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "semantic_review_gate",
            issues
          })
        })
      ];
    })
  );
}

function admitSameObjectRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramSameObjectRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `sameObjectProofs[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "same_object",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/same-object-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          proofRef: requiredStringField({
            record: row,
            key: "proofRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "same_object",
            issues
          }),
          leftRef: requiredStringField({
            record: row,
            key: "leftRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "same_object",
            issues
          }),
          rightRef: requiredStringField({
            record: row,
            key: "rightRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "same_object",
            issues
          }),
          equalityDigest: requiredStringField({
            record: row,
            key: "equalityDigest",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "same_object",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "same_object",
            issues
          })
        })
      ];
    })
  );
}

function admitOperatorDeclarationRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramOperatorDeclarationRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `operatorDeclarations[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "operator_declaration",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/operator-declaration-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          operatorRef: requiredStringField({
            record: row,
            key: "operatorRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "operator_declaration",
            issues
          }),
          name: requiredStringField({
            record: row,
            key: "name",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "operator_declaration",
            issues
          }),
          regime: requiredRegimeField({
            record: row,
            key: "regime",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "operator_declaration",
            issues
          }),
          binding: requiredStringField({
            record: row,
            key: "binding",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "operator_declaration",
            issues
          }),
          hostKind: requiredHostSurfaceKindField({
            record: row,
            key: "hostKind",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "operator_declaration",
            issues
          }),
          hostRef: requiredStringField({
            record: row,
            key: "hostRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "operator_declaration",
            issues
          }),
          tagRefs: requiredStringArrayField({
            record: row,
            key: "tagRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "operator_declaration",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "operator_declaration",
            issues
          })
        })
      ];
    })
  );
}

function admitEvaluatorDeclarationRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramEvaluatorDeclarationRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `evaluatorDeclarations[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "evaluator_declaration",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/evaluator-declaration-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          evaluatorRef: requiredStringField({
            record: row,
            key: "evaluatorRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "evaluator_declaration",
            issues
          }),
          name: requiredStringField({
            record: row,
            key: "name",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "evaluator_declaration",
            issues
          }),
          regime: requiredRegimeField({
            record: row,
            key: "regime",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "evaluator_declaration",
            issues
          }),
          description: requiredStringField({
            record: row,
            key: "description",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "evaluator_declaration",
            issues
          }),
          binding: requiredStringField({
            record: row,
            key: "binding",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "evaluator_declaration",
            issues
          }),
          consumedFieldRefs: requiredStringArrayField({
            record: row,
            key: "consumedFieldRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "evaluator_declaration",
            issues
          }),
          hostKind: requiredHostSurfaceKindField({
            record: row,
            key: "hostKind",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "evaluator_declaration",
            issues
          }),
          hostRef: requiredStringField({
            record: row,
            key: "hostRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "evaluator_declaration",
            issues
          }),
          tagRefs: requiredStringArrayField({
            record: row,
            key: "tagRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "evaluator_declaration",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "evaluator_declaration",
            issues
          })
        })
      ];
    })
  );
}

function admitRuleDeclarationRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramRuleDeclarationRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `ruleDeclarations[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "rule_declaration",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/rule-declaration-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          ruleRef: requiredStringField({
            record: row,
            key: "ruleRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "rule_declaration",
            issues
          }),
          name: requiredStringField({
            record: row,
            key: "name",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "rule_declaration",
            issues
          }),
          ruleKind: requiredStringField({
            record: row,
            key: "ruleKind",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "rule_declaration",
            issues
          }),
          configDigest: requiredStringField({
            record: row,
            key: "configDigest",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "rule_declaration",
            issues
          }),
          hostKind: requiredHostSurfaceKindField({
            record: row,
            key: "hostKind",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "rule_declaration",
            issues
          }),
          hostRef: requiredStringField({
            record: row,
            key: "hostRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "rule_declaration",
            issues
          }),
          tagRefs: requiredStringArrayField({
            record: row,
            key: "tagRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "rule_declaration",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "rule_declaration",
            issues
          })
        })
      ];
    })
  );
}

function admitComputeCompositionRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramComputeCompositionRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `computeCompositions[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "compute_composition",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/compute-composition-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          compositionRef: requiredStringField({
            record: row,
            key: "compositionRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_composition",
            issues
          }),
          compositionDigest: requiredStringField({
            record: row,
            key: "compositionDigest",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_composition",
            issues
          }),
          hostKind: requiredHostSurfaceKindField({
            record: row,
            key: "hostKind",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_composition",
            issues
          }),
          hostRef: requiredStringField({
            record: row,
            key: "hostRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_composition",
            issues
          }),
          declarationSourceKind: requiredCompositionDeclarationSourceKindField({
            record: row,
            key: "declarationSourceKind",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_composition",
            issues
          }),
          declarationSourceRef: requiredStringField({
            record: row,
            key: "declarationSourceRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_composition",
            issues
          }),
          notationRefs: requiredStringArrayField({
            record: row,
            key: "notationRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_composition",
            issues
          }),
          regimeBindingRefs: requiredStringArrayField({
            record: row,
            key: "regimeBindingRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_composition",
            issues
          }),
          stageBindingRefs: requiredStringArrayField({
            record: row,
            key: "stageBindingRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_composition",
            issues
          }),
          closureContractRef: requiredStringField({
            record: row,
            key: "closureContractRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_composition",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_composition",
            issues
          })
        })
      ];
    })
  );
}

function admitStageRegimeDispositionRows(
  input: readonly unknown[],
  subjectRef: string,
  parentLabel: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramStageRegimeDispositionRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `${parentLabel}.regimeDispositions[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "compute_stage_binding",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/stage-regime-disposition-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          regime: requiredRegimeField({
            record: row,
            key: "regime",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          disposition: requiredStageRegimeDispositionField({
            record: row,
            key: "disposition",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          selectedRegimeBindingRefs: requiredStringArrayField({
            record: row,
            key: "selectedRegimeBindingRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          reasonRefs: requiredStringArrayField({
            record: row,
            key: "reasonRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          evidenceRefs: requiredStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          })
        })
      ];
    })
  );
}

function admitComputeStageBindingRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramComputeStageBindingRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `computeStageBindings[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "compute_stage_binding",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/compute-stage-binding-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          stageBindingRef: requiredStringField({
            record: row,
            key: "stageBindingRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          compositionRef: requiredStringField({
            record: row,
            key: "compositionRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          compositionDigest: requiredStringField({
            record: row,
            key: "compositionDigest",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          stageRole: requiredComputeStageRoleField({
            record: row,
            key: "stageRole",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          stageNotationRef: requiredStringField({
            record: row,
            key: "stageNotationRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          stagePurpose: requiredComputeStagePurposeField({
            record: row,
            key: "stagePurpose",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          computeMeans: requiredRegimeField({
            record: row,
            key: "computeMeans",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          inputCarrierRefs: requiredStringArrayField({
            record: row,
            key: "inputCarrierRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          outputCarrierRefs: requiredStringArrayField({
            record: row,
            key: "outputCarrierRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          predecessorStageBindingRefs: requiredStringArrayField({
            record: row,
            key: "predecessorStageBindingRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          pluginContractRefs: requiredStringArrayField({
            record: row,
            key: "pluginContractRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          hookRefs: requiredStringArrayField({
            record: row,
            key: "hookRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          regimeDispositions: admitStageRegimeDispositionRows(
            checkOptionalArrayField({
              record: row,
              key: "regimeDispositions",
              subjectRef,
              issues
            }),
            subjectRef,
            surfaceRef,
            issues
          ),
          mayWriteLedgers: requiredBooleanField({
            record: row,
            key: "mayWriteLedgers",
            expected: false,
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          mayEmitRuntimeEvents: requiredBooleanField({
            record: row,
            key: "mayEmitRuntimeEvents",
            expected: false,
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          maySelectTraversal: requiredBooleanField({
            record: row,
            key: "maySelectTraversal",
            expected: false,
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          mayCloseTraversal: requiredBooleanField({
            record: row,
            key: "mayCloseTraversal",
            expected: false,
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          mayOwnIterationLoop: requiredBooleanField({
            record: row,
            key: "mayOwnIterationLoop",
            expected: false,
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          })
        })
      ];
    })
  );
}

function admitPluginResultInterfaceRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramPluginResultInterfaceRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `pluginResultInterfaces[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "plugin_result_interface",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/plugin-result-interface-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          resultInterfaceRef: requiredStringField({
            record: row,
            key: "resultInterfaceRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "plugin_result_interface",
            issues
          }),
          stageBindingRef: requiredStringField({
            record: row,
            key: "stageBindingRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "plugin_result_interface",
            issues
          }),
          compositionRef: requiredStringField({
            record: row,
            key: "compositionRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "plugin_result_interface",
            issues
          }),
          compositionDigest: requiredStringField({
            record: row,
            key: "compositionDigest",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "plugin_result_interface",
            issues
          }),
          stageRole: requiredComputeStageRoleField({
            record: row,
            key: "stageRole",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "plugin_result_interface",
            issues
          }),
          computeMeans: requiredRegimeField({
            record: row,
            key: "computeMeans",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "plugin_result_interface",
            issues
          }),
          resultEnvelopeContractRef: requiredStringField({
            record: row,
            key: "resultEnvelopeContractRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "plugin_result_interface",
            issues
          }),
          resultCarrierKind: requiredStringField({
            record: row,
            key: "resultCarrierKind",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "plugin_result_interface",
            issues
          }),
          outputCarrierRefs: requiredStringArrayField({
            record: row,
            key: "outputCarrierRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "plugin_result_interface",
            issues
          }),
          producedCarrierRefs: requiredStringArrayField({
            record: row,
            key: "producedCarrierRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "plugin_result_interface",
            issues
          }),
          requiredIdentityFieldRefs: requiredStringArrayField({
            record: row,
            key: "requiredIdentityFieldRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "plugin_result_interface",
            issues
          }),
          selectorAuthorityRefs: requiredStringArrayField({
            record: row,
            key: "selectorAuthorityRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "plugin_result_interface",
            issues
          }),
          evidenceRefs: requiredStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "plugin_result_interface",
            issues
          }),
          mayWriteLedgers: requiredBooleanField({
            record: row,
            key: "mayWriteLedgers",
            expected: false,
            label: surfaceRef,
            subjectRef,
            surfaceKind: "plugin_result_interface",
            issues
          }),
          mayEmitRuntimeEvents: requiredBooleanField({
            record: row,
            key: "mayEmitRuntimeEvents",
            expected: false,
            label: surfaceRef,
            subjectRef,
            surfaceKind: "plugin_result_interface",
            issues
          }),
          maySelectTraversal: requiredBooleanField({
            record: row,
            key: "maySelectTraversal",
            expected: false,
            label: surfaceRef,
            subjectRef,
            surfaceKind: "plugin_result_interface",
            issues
          }),
          mayCloseTraversal: requiredBooleanField({
            record: row,
            key: "mayCloseTraversal",
            expected: false,
            label: surfaceRef,
            subjectRef,
            surfaceKind: "plugin_result_interface",
            issues
          }),
          mayOwnIterationLoop: requiredBooleanField({
            record: row,
            key: "mayOwnIterationLoop",
            expected: false,
            label: surfaceRef,
            subjectRef,
            surfaceKind: "plugin_result_interface",
            issues
          })
        })
      ];
    })
  );
}

function admitHookBoundaryRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramHookBoundaryRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `hookBoundaries[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "hook_boundary",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/hook-boundary-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          hookRef: requiredStringField({
            record: row,
            key: "hookRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "hook_boundary",
            issues
          }),
          hookKey: requiredStringField({
            record: row,
            key: "hookKey",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "hook_boundary",
            issues
          }),
          hostKind: requiredHostSurfaceKindField({
            record: row,
            key: "hostKind",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "hook_boundary",
            issues
          }),
          hostRef: requiredStringField({
            record: row,
            key: "hostRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "hook_boundary",
            issues
          }),
          declarationSourceKind: requiredHookDeclarationSourceKindField({
            record: row,
            key: "declarationSourceKind",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "hook_boundary",
            issues
          }),
          declarationRef: requiredStringField({
            record: row,
            key: "declarationRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "hook_boundary",
            issues
          }),
          precedenceRank: requiredNonNegativeIntegerField({
            record: row,
            key: "precedenceRank",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "hook_boundary",
            issues
          }),
          concernRefs: requiredStringArrayField({
            record: row,
            key: "concernRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "hook_boundary",
            issues
          }),
          pluginContractRefs: requiredStringArrayField({
            record: row,
            key: "pluginContractRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "hook_boundary",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "hook_boundary",
            issues
          })
        })
      ];
    })
  );
}

function admitSelectionBoundaryRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramSelectionBoundaryRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `selectionBoundaries[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "selection_boundary",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/selection-boundary-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          boundaryRef: requiredStringField({
            record: row,
            key: "boundaryRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "selection_boundary",
            issues
          }),
          boundaryKind: requiredSelectionBoundaryKindField({
            record: row,
            key: "boundaryKind",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "selection_boundary",
            issues
          }),
          hostRef: requiredStringField({
            record: row,
            key: "hostRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "selection_boundary",
            issues
          }),
          inputContractRefs: requiredStringArrayField({
            record: row,
            key: "inputContractRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "selection_boundary",
            issues
          }),
          outputContractRefs: requiredStringArrayField({
            record: row,
            key: "outputContractRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "selection_boundary",
            issues
          }),
          candidateRefs: requiredStringArrayField({
            record: row,
            key: "candidateRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "selection_boundary",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "selection_boundary",
            issues
          })
        })
      ];
    })
  );
}

function admitJobBindingRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramJobBindingRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `jobBindings[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "job_binding",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/job-binding-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          jobRef: requiredStringField({
            record: row,
            key: "jobRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "job_binding",
            issues
          }),
          contractTargetRefs: requiredStringArrayField({
            record: row,
            key: "contractTargetRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "job_binding",
            issues
          }),
          roleRefs: requiredStringArrayField({
            record: row,
            key: "roleRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "job_binding",
            issues
          }),
          policyHookRefs: requiredStringArrayField({
            record: row,
            key: "policyHookRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "job_binding",
            issues
          }),
          publicCallableGraphFunctionRefs: requiredStringArrayField({
            record: row,
            key: "publicCallableGraphFunctionRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "job_binding",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "job_binding",
            issues
          })
        })
      ];
    })
  );
}

function admitRoleBindingRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramRoleBindingRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `roleBindings[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "role_binding",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/role-binding-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          roleRef: requiredStringField({
            record: row,
            key: "roleRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "role_binding",
            issues
          }),
          capabilityRefs: requiredStringArrayField({
            record: row,
            key: "capabilityRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "role_binding",
            issues
          }),
          policyHookRefs: requiredStringArrayField({
            record: row,
            key: "policyHookRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "role_binding",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "role_binding",
            issues
          })
        })
      ];
    })
  );
}

function admitExternalToolGateRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramExternalToolGateRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `externalToolGates[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "external_tool_gate",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/external-tool-gate-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          toolGateRef: requiredStringField({
            record: row,
            key: "toolGateRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "external_tool_gate",
            issues
          }),
          toolRef: requiredStringField({
            record: row,
            key: "toolRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "external_tool_gate",
            issues
          }),
          boundaryRef: requiredStringField({
            record: row,
            key: "boundaryRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "external_tool_gate",
            issues
          }),
          transportRef: requiredStringField({
            record: row,
            key: "transportRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "external_tool_gate",
            issues
          }),
          payloadContractRef: requiredStringField({
            record: row,
            key: "payloadContractRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "external_tool_gate",
            issues
          }),
          admissionRef: requiredStringField({
            record: row,
            key: "admissionRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "external_tool_gate",
            issues
          }),
          notLanguageTruthEvidenceRefs: requiredStringArrayField({
            record: row,
            key: "notLanguageTruthEvidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "external_tool_gate",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "external_tool_gate",
            issues
          })
        })
      ];
    })
  );
}

function admitRuntimeBindingRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramRuntimeBindingRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `runtimeBindings[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "runtime_binding",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/runtime-binding-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          bindingRef: requiredStringField({
            record: row,
            key: "bindingRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_binding",
            issues
          }),
          runtimeBindingKind: requiredRuntimeBindingKindField({
            record: row,
            key: "runtimeBindingKind",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_binding",
            issues
          }),
          moduleRef: requiredStringField({
            record: row,
            key: "moduleRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_binding",
            issues
          }),
          publicStartRef: requiredStringField({
            record: row,
            key: "publicStartRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_binding",
            issues
          }),
          commandRef: requiredStringField({
            record: row,
            key: "commandRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_binding",
            issues
          }),
          pluginContractRefs: requiredStringArrayField({
            record: row,
            key: "pluginContractRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_binding",
            issues
          }),
          stageBindingRefs: requiredStringArrayField({
            record: row,
            key: "stageBindingRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_binding",
            issues
          }),
          consumesPluginsThroughAbg: requiredBooleanField({
            record: row,
            key: "consumesPluginsThroughAbg",
            expected: true,
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_binding",
            issues
          }),
          forbidsProductLocalIteration: requiredBooleanField({
            record: row,
            key: "forbidsProductLocalIteration",
            expected: true,
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_binding",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_binding",
            issues
          })
        })
      ];
    })
  );
}

function admitDeclarationSourceRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramDeclarationSourceRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `declarationSourceRows[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "declaration_source",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/declaration-source-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      const sourceKind = String(row["sourceKind"] ?? "");
      if (
        !GTL_PROGRAM_DECLARATION_SOURCE_KIND_VALUES.some(
          (kind): boolean => kind === sourceKind
        )
      ) {
        issues.push(
          issue({
            surfaceKind: "declaration_source",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/declaration-source-kind-field",
            message: `${surfaceRef}.sourceKind must be one of ${GTL_PROGRAM_DECLARATION_SOURCE_KIND_VALUES.join(", ")}`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          sourceRef: requiredStringField({
            record: row,
            key: "sourceRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "declaration_source",
            issues
          }),
          sourceKind,
          canonicalDigest: String(row["canonicalDigest"] ?? ""),
          authorRef: String(row["authorRef"] ?? ""),
          authorityRef: String(row["authorityRef"] ?? ""),
          evidenceRefs: Object.freeze(
            evidenceRefStrings(row["evidenceRefs"])
          )
        })
      ];
    })
  );
}

function admitGoldenInstanceBindingRows(
  input: readonly unknown[],
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramGoldenInstanceBindingRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `goldenInstanceBindings[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "golden_instance",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/golden-instance-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      const toRefs = (value: unknown): readonly string[] =>
        Object.freeze(
          Array.isArray(value) ? value.map((entry) => String(entry)) : []
        );
      const admitted = Object.freeze({
        contractRef: requiredStringField({
          record: row,
          key: "contractRef",
          label: surfaceRef,
          subjectRef: surfaceRef,
          surfaceKind: "golden_instance",
          issues
        }),
        exampleInstanceRefs: toRefs(row["exampleInstanceRefs"]),
        counterexampleInstanceRefs: toRefs(row["counterexampleInstanceRefs"]),
        instanceSetDigest: String(row["instanceSetDigest"] ?? "")
      });
      if (
        (admitted.exampleInstanceRefs.length > 0 ||
          admitted.counterexampleInstanceRefs.length > 0) &&
        !goldenInstanceBindingHasDigest(admitted)
      ) {
        issues.push(
          issue({
            surfaceKind: "golden_instance",
            surfaceRef: admitted.contractRef || surfaceRef,
            ruleRef:
              "abg://gtl-program/contract/golden-instance-digest-required",
            message:
              "golden instance bindings are admitted data and require a content digest"
          })
        );
      }
      return [admitted];
    })
  );
}

function isStringArrayWithNonEmptyEntries(
  value: unknown
): value is readonly string[] {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) => typeof entry === "string" && entry.trim().length > 0
    )
  );
}

function admitConstitutionalSurfaceRows(
  input: readonly unknown[],
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramConstitutionalSurfaceRow[] {
  const allowedKeys = new Set([
    "surfaceRef",
    "digest",
    "versionDisposition",
    "declaredVersion",
    "versionBindingRef",
    "citedTicketRefs"
  ]);
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `constitutionalSurfaceRows[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "constitutional_surface",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/constitutional-surface-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      const hasOnlyKnownKeys = Object.keys(row).every((key) =>
        allowedKeys.has(key)
      );
      const admittedSurfaceRef = row["surfaceRef"];
      const digest = row["digest"];
      const citedTicketRefs = row["citedTicketRefs"];
      const disposition = row["versionDisposition"];
      const commonShapeIsValid =
        hasOnlyKnownKeys &&
        typeof admittedSurfaceRef === "string" &&
        admittedSurfaceRef.trim().length > 0 &&
        typeof digest === "string" &&
        isStringArrayWithNonEmptyEntries(citedTicketRefs);
      const versionShapeIsValid =
        (disposition === "unversioned" &&
          row["declaredVersion"] === null &&
          row["versionBindingRef"] === null) ||
        (disposition === "versioned" &&
          typeof row["declaredVersion"] === "string" &&
          row["declaredVersion"].trim().length > 0 &&
          typeof row["versionBindingRef"] === "string" &&
          row["versionBindingRef"].trim().length > 0);
      if (!commonShapeIsValid || !versionShapeIsValid) {
        issues.push(
          issue({
            surfaceKind: "constitutional_surface",
            surfaceRef:
              typeof admittedSurfaceRef === "string"
                ? admittedSurfaceRef
                : surfaceRef,
            ruleRef: "abg://gtl-program/input/constitutional-surface-row",
            message: `${surfaceRef} must be a closed versioned or unversioned constitutional surface row`
          })
        );
        return [];
      }
      let admitted: GtlProgramConstitutionalSurfaceRow;
      if (disposition === "unversioned") {
        admitted = Object.freeze({
          surfaceRef: admittedSurfaceRef,
          digest,
          versionDisposition: "unversioned",
          declaredVersion: null,
          versionBindingRef: null,
          citedTicketRefs: Object.freeze([...citedTicketRefs])
        });
      } else {
        const declaredVersion = row["declaredVersion"];
        const versionBindingRef = row["versionBindingRef"];
        if (
          typeof declaredVersion !== "string" ||
          typeof versionBindingRef !== "string"
        ) {
          return [];
        }
        admitted = Object.freeze({
          surfaceRef: admittedSurfaceRef,
          digest,
          versionDisposition: "versioned",
          declaredVersion,
          versionBindingRef,
          citedTicketRefs: Object.freeze([...citedTicketRefs])
        });
      }
      if (admitted.digest.trim().length === 0) {
        issues.push(
          issue({
            surfaceKind: "constitutional_surface",
            surfaceRef: admitted.surfaceRef,
            ruleRef: "abg://gtl-program/constitution/surface-digest-missing",
            message:
              "constitutional surfaces are witnessed data and require a content digest"
          })
        );
      }
      return [admitted];
    })
  );
}

const CONSTITUTIONAL_VERSION_SUBJECT_PREFIX: Readonly<
  Record<ConstitutionalVersionSubject["kind"], string>
> = Object.freeze({
  source_project: "source-project://",
  published_rc_cut: "published-rc-cut://",
  release_cut: "release-cut://",
  product: "product://",
  installed_product: "installed-product://"
});

function isConstitutionalVersionSubjectKind(
  value: unknown
): value is ConstitutionalVersionSubject["kind"] {
  return (
    typeof value === "string" &&
    CONSTITUTIONAL_VERSION_SUBJECT_KIND_VALUES.some(
      (knownKind) => knownKind === value
    )
  );
}

function versionBasisIssue(input: {
  readonly surfaceRef: string;
  readonly reason: ConstitutionalVersionBasisReason;
  readonly detail: string;
}): GtlProgramConformanceIssue {
  const editClass = VERSION_BASIS_REPAIR_EDIT_CLASS[input.reason];
  return issue({
    surfaceKind: "constitutional_surface",
    surfaceRef: input.surfaceRef,
    ruleRef: "abg://gtl-program/constitution/version-basis-unresolved",
    message: `version basis unresolved (${input.reason}): ${input.detail}`,
    admissibleRepairs: Object.freeze([
      Object.freeze({
        kind: "gtl_program_admissible_repair" as const,
        editClass,
        repairSurfaceRef: input.surfaceRef,
        changeClassRef: null
      })
    ])
  });
}

function admitConstitutionalVersionSubject(input: {
  readonly candidate: unknown;
  readonly surfaceRef: string;
  readonly issues: GtlProgramConformanceIssue[];
}): ConstitutionalVersionSubject | null {
  const candidate = input.candidate;
  if (
    !isRecord(candidate) ||
    Object.keys(candidate).length !== 2 ||
    !("kind" in candidate) ||
    !("subjectRef" in candidate)
  ) {
    input.issues.push(
      versionBasisIssue({
        surfaceRef: input.surfaceRef,
        reason: "subject_kind_ref_incoherent",
        detail: "subject must contain exactly kind and subjectRef"
      })
    );
    return null;
  }
  const kind = candidate["kind"];
  const subjectRef = candidate["subjectRef"];
  if (
    !isConstitutionalVersionSubjectKind(kind) ||
    typeof subjectRef !== "string" ||
    !subjectRef.startsWith(CONSTITUTIONAL_VERSION_SUBJECT_PREFIX[kind]) ||
    subjectRef.length ===
      CONSTITUTIONAL_VERSION_SUBJECT_PREFIX[kind].length
  ) {
    input.issues.push(
      versionBasisIssue({
        surfaceRef: input.surfaceRef,
        reason: "subject_kind_ref_incoherent",
        detail: `subject kind ${String(kind)} does not match ref ${String(subjectRef)}`
      })
    );
    return null;
  }
  switch (kind) {
    case "source_project": {
      const admittedRef: SourceProjectRef = `source-project://${subjectRef.slice(
        CONSTITUTIONAL_VERSION_SUBJECT_PREFIX.source_project.length
      )}`;
      return Object.freeze({
        kind,
        subjectRef: admittedRef
      });
    }
    case "published_rc_cut": {
      const admittedRef: PublishedRcCutRef = `published-rc-cut://${subjectRef.slice(
        CONSTITUTIONAL_VERSION_SUBJECT_PREFIX.published_rc_cut.length
      )}`;
      return Object.freeze({
        kind,
        subjectRef: admittedRef
      });
    }
    case "release_cut": {
      const admittedRef: ReleaseCutRef = `release-cut://${subjectRef.slice(
        CONSTITUTIONAL_VERSION_SUBJECT_PREFIX.release_cut.length
      )}`;
      return Object.freeze({ kind, subjectRef: admittedRef });
    }
    case "product": {
      const admittedRef: ProductRef = `product://${subjectRef.slice(
        CONSTITUTIONAL_VERSION_SUBJECT_PREFIX.product.length
      )}`;
      return Object.freeze({ kind, subjectRef: admittedRef });
    }
    case "installed_product": {
      const admittedRef: InstalledProductRef = `installed-product://${subjectRef.slice(
        CONSTITUTIONAL_VERSION_SUBJECT_PREFIX.installed_product.length
      )}`;
      return Object.freeze({
        kind,
        subjectRef: admittedRef
      });
    }
    default:
      return null;
  }
}

function admitConstitutionalSurfaceVersionBindings(input: {
  readonly candidate: unknown;
  readonly issues: GtlProgramConformanceIssue[];
}): readonly GtlProgramConstitutionalSurfaceVersionBinding[] {
  if (!Array.isArray(input.candidate)) {
    input.issues.push(
      issue({
        surfaceKind: "constitutional_surface",
        surfaceRef: "constitutionalLiveFacts.surfaceVersionBindings",
        ruleRef: "abg://gtl-program/input/constitutional-surface-row",
        message: "constitutionalLiveFacts.surfaceVersionBindings must be an array"
      })
    );
    return Object.freeze([]);
  }
  const allowedKeys = new Set([
    "bindingRef",
    "surfaceRef",
    "subject",
    "authorityRef"
  ]);
  return Object.freeze(
    input.candidate.flatMap((candidate, index) => {
      const rowRef = `constitutionalLiveFacts.surfaceVersionBindings[${index}]`;
      if (
        !isRecord(candidate) ||
        !Object.keys(candidate).every((key) => allowedKeys.has(key)) ||
        typeof candidate["bindingRef"] !== "string" ||
        candidate["bindingRef"].trim().length === 0 ||
        typeof candidate["surfaceRef"] !== "string" ||
        candidate["surfaceRef"].trim().length === 0 ||
        typeof candidate["authorityRef"] !== "string" ||
        candidate["authorityRef"].trim().length === 0
      ) {
        input.issues.push(
          issue({
            surfaceKind: "constitutional_surface",
            surfaceRef: rowRef,
            ruleRef: "abg://gtl-program/input/constitutional-surface-row",
            message: `${rowRef} must be a closed binding row with non-empty refs`
          })
        );
        return [];
      }
      const subject = admitConstitutionalVersionSubject({
        candidate: candidate["subject"],
        surfaceRef: rowRef,
        issues: input.issues
      });
      if (subject === null) {
        return [];
      }
      return [
        Object.freeze({
          bindingRef: candidate["bindingRef"],
          surfaceRef: candidate["surfaceRef"],
          subject,
          authorityRef: candidate["authorityRef"]
        })
      ];
    })
  );
}

function admitConstitutionalVersionFacts(input: {
  readonly candidate: unknown;
  readonly issues: GtlProgramConformanceIssue[];
}): readonly GtlProgramConstitutionalVersionFact[] {
  if (!Array.isArray(input.candidate)) {
    input.issues.push(
      issue({
        surfaceKind: "constitutional_surface",
        surfaceRef: "constitutionalLiveFacts.versionFacts",
        ruleRef: "abg://gtl-program/input/constitutional-surface-row",
        message: "constitutionalLiveFacts.versionFacts must be an array"
      })
    );
    return Object.freeze([]);
  }
  const allowedKeys = new Set(["subject", "version", "authorityRef"]);
  return Object.freeze(
    input.candidate.flatMap((candidate, index) => {
      const rowRef = `constitutionalLiveFacts.versionFacts[${index}]`;
      if (
        !isRecord(candidate) ||
        !Object.keys(candidate).every((key) => allowedKeys.has(key)) ||
        typeof candidate["version"] !== "string" ||
        candidate["version"].trim().length === 0 ||
        typeof candidate["authorityRef"] !== "string" ||
        candidate["authorityRef"].trim().length === 0
      ) {
        input.issues.push(
          issue({
            surfaceKind: "constitutional_surface",
            surfaceRef: rowRef,
            ruleRef: "abg://gtl-program/input/constitutional-surface-row",
            message: `${rowRef} must be a closed version-fact row with non-empty values`
          })
        );
        return [];
      }
      const subject = admitConstitutionalVersionSubject({
        candidate: candidate["subject"],
        surfaceRef: rowRef,
        issues: input.issues
      });
      if (subject === null) {
        return [];
      }
      return [
        Object.freeze({
          subject,
          version: candidate["version"],
          authorityRef: candidate["authorityRef"]
        })
      ];
    })
  );
}

function isConstitutionalSeamKeySetArray(
  value: unknown
): value is readonly {
  readonly seamRef: string;
  readonly keys: readonly string[];
}[] {
  return (
    Array.isArray(value) &&
    value.every(
      (seam) =>
        isRecord(seam) &&
        Object.keys(seam).length === 2 &&
        "seamRef" in seam &&
        "keys" in seam &&
        typeof seam["seamRef"] === "string" &&
        seam["seamRef"].trim().length > 0 &&
        isStringArrayWithNonEmptyEntries(seam["keys"])
    )
  );
}

function admitConstitutionalLiveFacts(
  input: unknown,
  issues: GtlProgramConformanceIssue[]
): GtlProgramConstitutionalLiveFacts | null {
  if (input === undefined || input === null) {
    return null;
  }
  if (!isRecord(input)) {
    issues.push(
      issue({
        surfaceKind: "constitutional_surface",
        surfaceRef: "constitutionalLiveFacts",
        ruleRef: "abg://gtl-program/input/constitutional-surface-row",
        message: "constitutionalLiveFacts must be an object"
      })
    );
    return null;
  }
  const allowedKeys = new Set([
    "surfaceVersionBindings",
    "versionFacts",
    "activeTicketRefs",
    "passthroughKeys",
    "seamKeySets"
  ]);
  const activeTicketRefs = input["activeTicketRefs"];
  const passthroughKeys = input["passthroughKeys"];
  const seamKeySets = input["seamKeySets"];
  if (
    !Object.keys(input).every((key) => allowedKeys.has(key)) ||
    Object.keys(input).length !== allowedKeys.size
  ) {
    issues.push(
      issue({
        surfaceKind: "constitutional_surface",
        surfaceRef: "constitutionalLiveFacts",
        ruleRef: "abg://gtl-program/input/constitutional-surface-row",
        message:
          "constitutionalLiveFacts must be the closed binding, fact, ticket, passthrough, and seam carrier"
      })
    );
  }
  const admittedActiveTicketRefs = isStringArrayWithNonEmptyEntries(activeTicketRefs)
    ? activeTicketRefs
    : [];
  if (!isStringArrayWithNonEmptyEntries(activeTicketRefs)) {
    issues.push(
      issue({
        surfaceKind: "constitutional_surface",
        surfaceRef: "constitutionalLiveFacts.activeTicketRefs",
        ruleRef: "abg://gtl-program/input/constitutional-surface-row",
        message: "constitutionalLiveFacts.activeTicketRefs must be a string array"
      })
    );
  }
  const admittedPassthroughKeys = isStringArrayWithNonEmptyEntries(passthroughKeys)
    ? passthroughKeys
    : [];
  if (!isStringArrayWithNonEmptyEntries(passthroughKeys)) {
    issues.push(
      issue({
        surfaceKind: "constitutional_surface",
        surfaceRef: "constitutionalLiveFacts.passthroughKeys",
        ruleRef: "abg://gtl-program/input/constitutional-surface-row",
        message: "constitutionalLiveFacts.passthroughKeys must be a string array"
      })
    );
  }
  const admittedSeamKeySets = isConstitutionalSeamKeySetArray(seamKeySets)
    ? seamKeySets
    : [];
  if (!isConstitutionalSeamKeySetArray(seamKeySets)) {
    issues.push(
      issue({
        surfaceKind: "constitutional_surface",
        surfaceRef: "constitutionalLiveFacts.seamKeySets",
        ruleRef: "abg://gtl-program/input/constitutional-surface-row",
        message: "constitutionalLiveFacts.seamKeySets must be closed seam rows"
      })
    );
  }
  return Object.freeze({
    surfaceVersionBindings: admitConstitutionalSurfaceVersionBindings({
      candidate: input["surfaceVersionBindings"],
      issues
    }),
    versionFacts: admitConstitutionalVersionFacts({
      candidate: input["versionFacts"],
      issues
    }),
    activeTicketRefs: Object.freeze([...admittedActiveTicketRefs]),
    passthroughKeys: Object.freeze([...admittedPassthroughKeys]),
    seamKeySets: Object.freeze(
      admittedSeamKeySets.map(
        (seam) =>
          Object.freeze({
            seamRef: seam.seamRef,
            keys: Object.freeze([...seam.keys])
          })
      )
    )
  });
}

// The drift JUDGE (T-193): rows are the declared model; live facts are the
// telemetry; drift is delta with a typed diagnostic and repair affordance.
function checkConstitutionalDrift(input: {
  readonly rows: readonly GtlProgramConstitutionalSurfaceRow[];
  readonly liveFacts: GtlProgramConstitutionalLiveFacts | null;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const surfaceVersionBindings = input.liveFacts?.surfaceVersionBindings ?? [];
  const versionFacts = input.liveFacts?.versionFacts ?? [];
  for (const row of input.rows) {
    if (row.versionDisposition === "versioned") {
      const bindings = surfaceVersionBindings.filter(
        (binding) =>
          binding.bindingRef === row.versionBindingRef &&
          binding.surfaceRef === row.surfaceRef
      );
      if (bindings.length === 0) {
        input.issues.push(
          versionBasisIssue({
            surfaceRef: row.surfaceRef,
            reason: "surface_binding_missing",
            detail: `no exact binding ${row.versionBindingRef} names this surface`
          })
        );
      } else if (bindings.length > 1) {
        input.issues.push(
          versionBasisIssue({
            surfaceRef: row.surfaceRef,
            reason: "surface_binding_ambiguous",
            detail: `${bindings.length} exact bindings ${row.versionBindingRef} name this surface`
          })
        );
      } else {
        const binding = bindings[0];
        if (binding !== undefined) {
          const facts = versionFacts.filter(
            (fact) =>
              fact.subject.kind === binding.subject.kind &&
              fact.subject.subjectRef === binding.subject.subjectRef
          );
          if (facts.length === 0) {
            input.issues.push(
              versionBasisIssue({
                surfaceRef: row.surfaceRef,
                reason: "version_fact_missing",
                detail: `no version fact resolves ${binding.subject.kind} ${binding.subject.subjectRef}`
              })
            );
          } else if (facts.length > 1) {
            input.issues.push(
              versionBasisIssue({
                surfaceRef: row.surfaceRef,
                reason: "version_fact_ambiguous",
                detail: `${facts.length} version facts resolve ${binding.subject.kind} ${binding.subject.subjectRef}`
              })
            );
          } else if (facts[0]?.version !== row.declaredVersion) {
            input.issues.push(
              issue({
                surfaceKind: "constitutional_surface",
                surfaceRef: row.surfaceRef,
                ruleRef: "abg://gtl-program/constitution/version-line-drift",
                message: `surface declares version ${row.declaredVersion} but exact ${binding.subject.kind} ${binding.subject.subjectRef} is ${facts[0]?.version}`
              })
            );
          }
        }
      }
    }
    for (const cited of row.citedTicketRefs) {
      if (input.liveFacts?.activeTicketRefs.includes(cited) === true) {
        input.issues.push(
          issue({
            surfaceKind: "constitutional_surface",
            surfaceRef: row.surfaceRef,
            ruleRef:
              "abg://gtl-program/constitution/release-claim-cites-active-ticket",
            message: `release-bearing surface cites ACTIVE ticket ${cited}; release claims cite closed tickets only`
          })
        );
      }
    }
  }
  for (const seam of input.liveFacts?.seamKeySets ?? []) {
    const expected = [...(input.liveFacts?.passthroughKeys ?? [])]
      .sort()
      .join(",");
    const actual = [...seam.keys].sort().join(",");
    if (expected !== actual) {
      input.issues.push(
        issue({
          surfaceKind: "constitutional_surface",
          surfaceRef: seam.seamRef,
          ruleRef: "abg://gtl-program/constitution/seam-parity-drift",
          message: `seam key set [${actual}] does not equal the passthrough authority [${expected}]`
        })
      );
    }
  }
}

function admitUnderdeterminedDeclarationRows(
  input: readonly unknown[],
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramUnderdeterminedDeclarationRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `underdeterminedDeclarations[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "underdetermined_scope",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/underdetermined-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      const ownerRoute = String(row["ownerRoute"] ?? "");
      if (
        !GTL_PROGRAM_UNDETERMINED_OWNER_ROUTE_VALUES.some(
          (route): boolean => route === ownerRoute
        )
      ) {
        issues.push(
          issue({
            surfaceKind: "underdetermined_scope",
            surfaceRef,
            ruleRef:
              "abg://gtl-program/input/underdetermined-owner-route-field",
            message: `${surfaceRef}.ownerRoute must be one of ${GTL_PROGRAM_UNDETERMINED_OWNER_ROUTE_VALUES.join(", ")}`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          scopeRef: requiredStringField({
            record: row,
            key: "scopeRef",
            label: surfaceRef,
            subjectRef: surfaceRef,
            surfaceKind: "underdetermined_scope",
            issues
          }),
          ownerRoute,
          latitudeNote: String(row["latitudeNote"] ?? "")
        })
      ];
    })
  );
}

function admitInstalledContextRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramInstalledContextRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `installedContextSurfaces[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "installed_context",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/installed-context-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          contextRef: requiredStringField({
            record: row,
            key: "contextRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "installed_context",
            issues
          }),
          abiPackageVersion: requiredStringField({
            record: row,
            key: "abiPackageVersion",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "installed_context",
            issues
          }),
          selectedProductVersion: requiredStringField({
            record: row,
            key: "selectedProductVersion",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "installed_context",
            issues
          }),
          contextText: requiredStringField({
            record: row,
            key: "contextText",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "installed_context",
            issues
          }),
          toolchainBindingRef: requiredStringField({
            record: row,
            key: "toolchainBindingRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "installed_context",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "installed_context",
            issues
          })
        })
      ];
    })
  );
}

function admitRuntimeReentryRouteRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramRuntimeReentryRouteRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `runtimeReentryRoutes[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "runtime_reentry_route",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/runtime-reentry-route-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      if (Object.hasOwn(row, "relativeCursorOffset")) {
        issues.push(
          issue({
            surfaceKind: "runtime_reentry_route",
            surfaceRef,
            ruleRef: "abg://gtl-program/runtime-reentry/relative-offset-not-authority",
            message: `${surfaceRef}.relativeCursorOffset is read-model shorthand and cannot be admitted as re-entry authority`
          })
        );
      }
      const selectedActionKind = requiredStringField({
        record: row,
        key: "selectedActionKind",
        label: surfaceRef,
        subjectRef,
        surfaceKind: "runtime_reentry_route",
        issues
      });
      if (selectedActionKind !== "reenter_graph_span") {
        issues.push(
          issue({
            surfaceKind: "runtime_reentry_route",
            surfaceRef,
            ruleRef: "abg://gtl-program/runtime-reentry/selected-action-kind",
            message: `${surfaceRef}.selectedActionKind must be reenter_graph_span`
          })
        );
      }
      return [
        Object.freeze({
          routeRef: requiredStringField({
            record: row,
            key: "routeRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_reentry_route",
            issues
          }),
          repairSurfaceDisposition: requiredRepairSurfaceDispositionField({
            record: row,
            key: "repairSurfaceDisposition",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_reentry_route",
            issues
          }),
          selectedActionKind: "reenter_graph_span" as const,
          graphReentryPoint: requiredGraphReentryPointField({
            record: row,
            key: "graphReentryPoint",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_reentry_route",
            issues
          }),
          repairGraphFunctionRef: requiredStringField({
            record: row,
            key: "repairGraphFunctionRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_reentry_route",
            issues
          }),
          repairGraphVectorRef: requiredStringField({
            record: row,
            key: "repairGraphVectorRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_reentry_route",
            issues
          }),
          repairGraphFunctionId: requiredStringField({
            record: row,
            key: "repairGraphFunctionId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_reentry_route",
            issues
          }),
          repairGraphId: requiredStringField({
            record: row,
            key: "repairGraphId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_reentry_route",
            issues
          }),
          repairGraphVectorId: requiredStringField({
            record: row,
            key: "repairGraphVectorId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_reentry_route",
            issues
          }),
          reentryTargetVectorIndex: requiredNonNegativeIntegerField({
            record: row,
            key: "reentryTargetVectorIndex",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_reentry_route",
            issues
          }),
          repairAssetRef: requiredStringField({
            record: row,
            key: "repairAssetRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_reentry_route",
            issues
          }),
          targetOutcomeRef: requiredStringField({
            record: row,
            key: "targetOutcomeRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_reentry_route",
            issues
          }),
          observationBindingRef: requiredStringField({
            record: row,
            key: "observationBindingRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_reentry_route",
            issues
          }),
          lawfulBasisRefs: requiredStringArrayField({
            record: row,
            key: "lawfulBasisRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_reentry_route",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_reentry_route",
            issues
          })
        })
      ];
    })
  );
}

function admitObligationDeltaFamilies(input: {
  readonly values: readonly string[];
  readonly label: string;
  readonly surfaceRef: string;
  readonly issues: GtlProgramConformanceIssue[];
}): readonly GtlProgramObligationDeltaFamily[] {
  return Object.freeze(
    input.values.flatMap((value) => {
      if (isGtlProgramObligationDeltaFamily(value)) {
        return [value];
      }
      input.issues.push(
        issue({
          surfaceKind: "traversal_unit",
          surfaceRef: input.surfaceRef,
          ruleRef: "abg://gtl-program/traversal-unit/obligation-delta-family",
          message: `${input.label}.allowedObligationDeltaFamilies contains unsupported disposition ${JSON.stringify(value)}`
        })
      );
      return [];
    })
  );
}

function admitTraversalBindConservationRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramTraversalBindConservationRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `traversalBindConservation[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "traversal_unit",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/traversal-bind-conservation-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      const allowedObligationDeltaFamilies =
        admitObligationDeltaFamilies({
          values: requiredStringArrayField({
            record: row,
            key: "allowedObligationDeltaFamilies",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "traversal_unit",
            issues
          }),
          label: surfaceRef,
          surfaceRef,
          issues
        });
      return [
        Object.freeze({
          conservationRef: requiredStringField({
            record: row,
            key: "conservationRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "traversal_unit",
            issues
          }),
          graphFunctionRef: requiredStringField({
            record: row,
            key: "graphFunctionRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "traversal_unit",
            issues
          }),
          graphRef: requiredStringField({
            record: row,
            key: "graphRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "traversal_unit",
            issues
          }),
          graphVectorRef: requiredStringField({
            record: row,
            key: "graphVectorRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "traversal_unit",
            issues
          }),
          graphFunctionId: requiredStringField({
            record: row,
            key: "graphFunctionId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "traversal_unit",
            issues
          }),
          graphId: requiredStringField({
            record: row,
            key: "graphId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "traversal_unit",
            issues
          }),
          graphVectorId: requiredStringField({
            record: row,
            key: "graphVectorId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "traversal_unit",
            issues
          }),
          intentLineageRefs: requiredStringArrayField({
            record: row,
            key: "intentLineageRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "traversal_unit",
            issues
          }),
          targetCarrierBindingRefs: requiredStringArrayField({
            record: row,
            key: "targetCarrierBindingRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "traversal_unit",
            issues
          }),
          materializationBindingRefs: requiredStringArrayField({
            record: row,
            key: "materializationBindingRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "traversal_unit",
            issues
          }),
          carriedObligationRefs: requiredStringArrayField({
            record: row,
            key: "carriedObligationRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "traversal_unit",
            issues
          }),
          residualPressureRefs: requiredStringArrayField({
            record: row,
            key: "residualPressureRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "traversal_unit",
            issues
          }),
          stagedAuthorityRefs: requiredStringArrayField({
            record: row,
            key: "stagedAuthorityRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "traversal_unit",
            issues
          }),
          admissionStrengthRefs: requiredStringArrayField({
            record: row,
            key: "admissionStrengthRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "traversal_unit",
            issues
          }),
          downstreamTerminalPressureRefs: requiredStringArrayField({
            record: row,
            key: "downstreamTerminalPressureRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "traversal_unit",
            issues
          }),
          allowedObligationDeltaFamilies,
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "traversal_unit",
            issues
          })
        })
      ];
    })
  );
}

const REQUIREMENTS_ALGEBRA_AUTHORITY_SMUGGLING_KEYS: ReadonlySet<string> = new Set(
  REQUIREMENT_EVENT_FORBIDDEN_RUNTIME_FIELDS
);

function rejectUnknownKeys(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly allowedKeys: ReadonlySet<string>;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly surfaceRef: string;
  readonly ruleRef: string;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  for (const key of Object.keys(input.record)) {
    if (!input.allowedKeys.has(key)) {
      input.issues.push(
        issue({
          surfaceKind: input.surfaceKind,
          surfaceRef: input.surfaceRef,
          ruleRef: input.ruleRef,
          message: `${input.surfaceRef}.${key} is not admitted by the closed GTL requirements-algebra declaration surface`
        })
      );
    }
  }
}

function rejectRequirementsAuthoritySmuggling(input: {
  readonly value: unknown;
  readonly surfaceRef: string;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const visit = (value: unknown, path: string): void => {
    if (Array.isArray(value)) {
      value.forEach((entry, index) => visit(entry, `${path}[${index}]`));
      return;
    }
    if (!isRecord(value)) {
      return;
    }
    for (const [key, child] of Object.entries(value)) {
      const childPath = `${path}.${key}`;
      if (REQUIREMENTS_ALGEBRA_AUTHORITY_SMUGGLING_KEYS.has(key)) {
        input.issues.push(
          issue({
            surfaceKind: "requirement_declaration",
            surfaceRef: input.surfaceRef,
            ruleRef:
              "abg://gtl-program/requirements-algebra/no-runtime-authority-fields",
            message: `${childPath} attempts to carry ABG runtime, closure, ledger-write, traversal-selection, or continuation authority`
          })
        );
      }
      visit(child, childPath);
    }
  };
  visit(input.value, input.surfaceRef);
}

function requiredUnknownArrayField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): readonly unknown[] {
  if (!Object.hasOwn(input.record, input.key)) {
    input.issues.push(
      issue({
        surfaceKind: input.surfaceKind,
        surfaceRef: input.subjectRef,
        ruleRef: "abg://gtl-program/input/array-field",
        message: `${input.label}.${input.key} is required and must be an array`
      })
    );
    return Object.freeze([]);
  }
  const values = unknownArray(input.record[input.key]);
  if (values === null) {
    input.issues.push(
      issue({
        surfaceKind: input.surfaceKind,
        surfaceRef: input.subjectRef,
        ruleRef: "abg://gtl-program/input/array-field",
        message: `${input.label}.${input.key} must be an array`
      })
    );
    return Object.freeze([]);
  }
  return values;
}

function exactKindField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly expected: string;
  readonly label: string;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  if (input.record[input.key] !== input.expected) {
    input.issues.push(
      issue({
        surfaceKind: "requirement_declaration",
        surfaceRef: input.label,
        ruleRef: "abg://gtl-program/requirements-algebra/kind",
        message: `${input.label}.${input.key} must be ${input.expected}`
      })
    );
  }
}

const GTL_REQUIREMENT_TERM_KIND_VALUES: ReadonlySet<
  GtlRequirementDeclaration["termKind"]
> = new Set(["atom", "composition"]);
const GTL_REQUIREMENT_RELATION_KIND_VALUES: ReadonlySet<
  GtlRequirementRelationDeclaration["relationKind"]
> = new Set(REQUIREMENT_RELATION_KIND_VALUES);
const GTL_AUTHORITY_CONTEXT_ORIGIN_STAGE_VALUES: ReadonlySet<
  GtlAuthorityContextFragmentDeclaration["originStage"]
> = new Set(REQUIREMENT_STAGE_VALUES);
const GTL_REQUIREMENTS_CONTEXT_PROMOTION_POLICY_REFS: ReadonlySet<string> =
  new Set([
    "promotion-policy://abg/constraint-only",
    "promotion-policy://abg/fp-required",
    "promotion-policy://t162/constraint-only"
  ]);
const GTL_REQUIREMENTS_RELATION_KINDS_ALLOWING_SELF_REF: ReadonlySet<
  GtlRequirementRelationDeclaration["relationKind"]
> = new Set(["test", "assurance", "evidence"]);
const GTL_REQUIREMENTS_DIRECTED_ACYCLIC_RELATION_KINDS: ReadonlySet<
  GtlRequirementRelationDeclaration["relationKind"]
> = new Set(["refinement", "dependency", "operationalization"]);
const GTL_REQUIREMENTS_CONFLICT_CONTRADICTORY_RELATION_KINDS: ReadonlySet<
  GtlRequirementRelationDeclaration["relationKind"]
> = new Set([
  "refinement",
  "dependency",
  "assignment",
  "operationalization",
  "test",
  "assurance",
  "evidence",
  "contribution",
  "restoration",
  "supersession"
]);

function requiredEnumField<T extends string>(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly values: ReadonlySet<T>;
  readonly issues: GtlProgramConformanceIssue[];
}): T {
  const value = input.record[input.key];
  if (typeof value === "string") {
    for (const candidate of input.values) {
      if (value === candidate) {
        return candidate;
      }
    }
  }
  input.issues.push(
    issue({
      surfaceKind: "requirement_declaration",
      surfaceRef: input.label,
      ruleRef: "abg://gtl-program/requirements-algebra/enum-field",
      message: `${input.label}.${input.key} must be one of ${[
        ...input.values
      ].join(", ")}`
    })
  );
  return [...input.values][0]!;
}

function admitGtlRequirementDeclarationRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[],
  label: string
): readonly GtlRequirementDeclaration[] {
  const allowedKeys = new Set([
    "kind",
    "requirementId",
    "termKind",
    "stableId",
    "sourceRef",
    "sourceDigest",
    "relationRefs",
    "spanRefs",
    "contextRefs",
    "evidencePolicyRefs"
  ]);
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `${label}.requirements[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "requirement_declaration",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/requirement-declaration-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      rejectUnknownKeys({
        record: row,
        allowedKeys,
        surfaceKind: "requirement_declaration",
        surfaceRef,
        ruleRef: "abg://gtl-program/requirements-algebra/open-payload",
        issues
      });
      rejectRequirementsAuthoritySmuggling({ value: row, surfaceRef, issues });
      exactKindField({
        record: row,
        key: "kind",
        expected: "gtl_requirement_declaration",
        label: surfaceRef,
        issues
      });
      return [
        Object.freeze({
          kind: "gtl_requirement_declaration" as const,
          requirementId: requiredStringField({
            record: row,
            key: "requirementId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          termKind: requiredEnumField({
            record: row,
            key: "termKind",
            label: surfaceRef,
            values: GTL_REQUIREMENT_TERM_KIND_VALUES,
            issues
          }),
          stableId: requiredStringField({
            record: row,
            key: "stableId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          sourceRef: requiredStringField({
            record: row,
            key: "sourceRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          sourceDigest: requiredStringField({
            record: row,
            key: "sourceDigest",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          relationRefs: requiredStringArrayField({
            record: row,
            key: "relationRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          spanRefs: requiredStringArrayField({
            record: row,
            key: "spanRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          contextRefs: requiredStringArrayField({
            record: row,
            key: "contextRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          evidencePolicyRefs: requiredStringArrayField({
            record: row,
            key: "evidencePolicyRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          })
        })
      ];
    })
  );
}

function admitGtlRequirementRelationDeclarationRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[],
  label: string
): readonly GtlRequirementRelationDeclaration[] {
  const allowedKeys = new Set([
    "kind",
    "relationId",
    "relationKind",
    "fromRequirementId",
    "toRequirementId"
  ]);
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `${label}.relations[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "requirement_declaration",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/requirement-relation-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      rejectUnknownKeys({
        record: row,
        allowedKeys,
        surfaceKind: "requirement_declaration",
        surfaceRef,
        ruleRef: "abg://gtl-program/requirements-algebra/open-payload",
        issues
      });
      rejectRequirementsAuthoritySmuggling({ value: row, surfaceRef, issues });
      exactKindField({
        record: row,
        key: "kind",
        expected: "gtl_requirement_relation_declaration",
        label: surfaceRef,
        issues
      });
      return [
        Object.freeze({
          kind: "gtl_requirement_relation_declaration" as const,
          relationId: requiredStringField({
            record: row,
            key: "relationId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          relationKind: requiredEnumField({
            record: row,
            key: "relationKind",
            label: surfaceRef,
            values: GTL_REQUIREMENT_RELATION_KIND_VALUES,
            issues
          }),
          fromRequirementId: requiredStringField({
            record: row,
            key: "fromRequirementId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          toRequirementId: requiredStringField({
            record: row,
            key: "toRequirementId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          })
        })
      ];
    })
  );
}

function admitGtlTraversalSpanDeclarationRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[],
  label: string
): readonly GtlTraversalSpanDeclaration[] {
  const allowedKeys = new Set([
    "kind",
    "spanId",
    "graphFunctionRef",
    "graphVectorRefs",
    "vectorIndexes",
    "sourceNodeRef",
    "targetNodeRef",
    "frameRefs",
    "zoomRefs",
    "foldbackRefs",
    "aliasRefs"
  ]);
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `${label}.spans[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "requirement_declaration",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/requirement-span-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      rejectUnknownKeys({
        record: row,
        allowedKeys,
        surfaceKind: "requirement_declaration",
        surfaceRef,
        ruleRef: "abg://gtl-program/requirements-algebra/open-payload",
        issues
      });
      rejectRequirementsAuthoritySmuggling({ value: row, surfaceRef, issues });
      exactKindField({
        record: row,
        key: "kind",
        expected: "gtl_traversal_span_declaration",
        label: surfaceRef,
        issues
      });
      return [
        Object.freeze({
          kind: "gtl_traversal_span_declaration" as const,
          spanId: requiredStringField({
            record: row,
            key: "spanId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          graphFunctionRef: requiredStringField({
            record: row,
            key: "graphFunctionRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          graphVectorRefs: requiredStringArrayField({
            record: row,
            key: "graphVectorRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          vectorIndexes: requiredNonNegativeIntegerArrayField({
            record: row,
            key: "vectorIndexes",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          sourceNodeRef: requiredStringField({
            record: row,
            key: "sourceNodeRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          targetNodeRef: requiredStringField({
            record: row,
            key: "targetNodeRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          frameRefs: optionalStringArrayField({
            record: row,
            key: "frameRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          zoomRefs: optionalStringArrayField({
            record: row,
            key: "zoomRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          foldbackRefs: optionalStringArrayField({
            record: row,
            key: "foldbackRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          aliasRefs: optionalStringArrayField({
            record: row,
            key: "aliasRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          })
        })
      ];
    })
  );
}

function admitGtlAuthorityContextFragmentRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[],
  label: string
): readonly GtlAuthorityContextFragmentDeclaration[] {
  const allowedKeys = new Set([
    "kind",
    "fragmentRef",
    "originStage",
    "constraintScope",
    "digest",
    "promotionPolicyRef",
    "appliesToRefs"
  ]);
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `${label}.contextFragments[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "requirement_declaration",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/requirement-context-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      rejectUnknownKeys({
        record: row,
        allowedKeys,
        surfaceKind: "requirement_declaration",
        surfaceRef,
        ruleRef: "abg://gtl-program/requirements-algebra/open-payload",
        issues
      });
      rejectRequirementsAuthoritySmuggling({ value: row, surfaceRef, issues });
      exactKindField({
        record: row,
        key: "kind",
        expected: "gtl_authority_context_fragment_declaration",
        label: surfaceRef,
        issues
      });
      return [
        Object.freeze({
          kind: "gtl_authority_context_fragment_declaration" as const,
          fragmentRef: requiredStringField({
            record: row,
            key: "fragmentRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          originStage: requiredEnumField({
            record: row,
            key: "originStage",
            label: surfaceRef,
            values: GTL_AUTHORITY_CONTEXT_ORIGIN_STAGE_VALUES,
            issues
          }),
          constraintScope: requiredStringField({
            record: row,
            key: "constraintScope",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          digest: requiredStringField({
            record: row,
            key: "digest",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          promotionPolicyRef: requiredStringField({
            record: row,
            key: "promotionPolicyRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          appliesToRefs: requiredStringArrayField({
            record: row,
            key: "appliesToRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          })
        })
      ];
    })
  );
}

function admitGtlDestinationTopologyRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[],
  label: string
): readonly GtlDestinationTopologyDeclaration[] {
  const allowedKeys = new Set([
    "kind",
    "topologyRef",
    "frameworkRef",
    "constraintRefs",
    "appliesToRefs"
  ]);
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `${label}.destinationTopologies[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "requirement_declaration",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/requirement-topology-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      rejectUnknownKeys({
        record: row,
        allowedKeys,
        surfaceKind: "requirement_declaration",
        surfaceRef,
        ruleRef: "abg://gtl-program/requirements-algebra/open-payload",
        issues
      });
      rejectRequirementsAuthoritySmuggling({ value: row, surfaceRef, issues });
      exactKindField({
        record: row,
        key: "kind",
        expected: "gtl_destination_topology_declaration",
        label: surfaceRef,
        issues
      });
      return [
        Object.freeze({
          kind: "gtl_destination_topology_declaration" as const,
          topologyRef: requiredStringField({
            record: row,
            key: "topologyRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          frameworkRef: requiredStringField({
            record: row,
            key: "frameworkRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          constraintRefs: requiredStringArrayField({
            record: row,
            key: "constraintRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          appliesToRefs: requiredStringArrayField({
            record: row,
            key: "appliesToRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          })
        })
      ];
    })
  );
}

function admitGtlRequirementTestRelationRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[],
  label: string
): readonly GtlRequirementTestRelationDeclaration[] {
  const allowedKeys = new Set([
    "kind",
    "relationRef",
    "requirementId",
    "assetProjectionRef",
    "testSourceProjectionRef",
    "testExecutionProjectionRef",
    "interpretationProjectionRef",
    "componentTestRootRefs",
    "evidencePolicyRef"
  ]);
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `${label}.testRelations[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "requirement_declaration",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/requirement-test-relation-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      rejectUnknownKeys({
        record: row,
        allowedKeys,
        surfaceKind: "requirement_declaration",
        surfaceRef,
        ruleRef: "abg://gtl-program/requirements-algebra/open-payload",
        issues
      });
      rejectRequirementsAuthoritySmuggling({ value: row, surfaceRef, issues });
      exactKindField({
        record: row,
        key: "kind",
        expected: "gtl_requirement_test_relation_declaration",
        label: surfaceRef,
        issues
      });
      return [
        Object.freeze({
          kind: "gtl_requirement_test_relation_declaration" as const,
          relationRef: requiredStringField({
            record: row,
            key: "relationRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          requirementId: requiredStringField({
            record: row,
            key: "requirementId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          assetProjectionRef: requiredStringField({
            record: row,
            key: "assetProjectionRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          testSourceProjectionRef: requiredStringField({
            record: row,
            key: "testSourceProjectionRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          testExecutionProjectionRef: requiredStringField({
            record: row,
            key: "testExecutionProjectionRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          interpretationProjectionRef: requiredStringField({
            record: row,
            key: "interpretationProjectionRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          componentTestRootRefs: requiredStringArrayField({
            record: row,
            key: "componentTestRootRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          }),
          evidencePolicyRef: requiredStringField({
            record: row,
            key: "evidencePolicyRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "requirement_declaration",
            issues
          })
        })
      ];
    })
  );
}

function admitRequirementsAlgebraDeclarationBundles(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlRequirementsAlgebraDeclarationBundle[] {
  const allowedKeys = new Set([
    "kind",
    "declarationKey",
    "requirements",
    "relations",
    "spans",
    "contextFragments",
    "destinationTopologies",
    "testRelations"
  ]);
  return Object.freeze(
    input.flatMap((bundle, index) => {
      const surfaceRef = `requirementsAlgebraDeclarations[${index}]`;
      if (!isRecord(bundle)) {
        issues.push(
          issue({
            surfaceKind: "requirement_declaration",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/requirements-algebra-bundle",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      rejectUnknownKeys({
        record: bundle,
        allowedKeys,
        surfaceKind: "requirement_declaration",
        surfaceRef,
        ruleRef: "abg://gtl-program/requirements-algebra/open-payload",
        issues
      });
      rejectRequirementsAuthoritySmuggling({
        value: bundle,
        surfaceRef,
        issues
      });
      exactKindField({
        record: bundle,
        key: "kind",
        expected: "gtl_requirements_algebra_declaration_bundle",
        label: surfaceRef,
        issues
      });
      const declarationKey = requiredStringField({
        record: bundle,
        key: "declarationKey",
        label: surfaceRef,
        subjectRef,
        surfaceKind: "requirement_declaration",
        issues
      });
      if (declarationKey !== GTL_REQUIREMENTS_ALGEBRA_DECLARATION_KEY) {
        issues.push(
          issue({
            surfaceKind: "requirement_declaration",
            surfaceRef,
            ruleRef: "abg://gtl-program/requirements-algebra/declaration-key",
            message: `${surfaceRef}.declarationKey must be ${GTL_REQUIREMENTS_ALGEBRA_DECLARATION_KEY}`
          })
        );
      }
      return [
        Object.freeze({
          kind: "gtl_requirements_algebra_declaration_bundle" as const,
          declarationKey: GTL_REQUIREMENTS_ALGEBRA_DECLARATION_KEY,
          requirements: admitGtlRequirementDeclarationRows(
            requiredUnknownArrayField({
              record: bundle,
              key: "requirements",
              label: surfaceRef,
              subjectRef,
              surfaceKind: "requirement_declaration",
              issues
            }),
            subjectRef,
            issues,
            surfaceRef
          ),
          relations: admitGtlRequirementRelationDeclarationRows(
            requiredUnknownArrayField({
              record: bundle,
              key: "relations",
              label: surfaceRef,
              subjectRef,
              surfaceKind: "requirement_declaration",
              issues
            }),
            subjectRef,
            issues,
            surfaceRef
          ),
          spans: admitGtlTraversalSpanDeclarationRows(
            requiredUnknownArrayField({
              record: bundle,
              key: "spans",
              label: surfaceRef,
              subjectRef,
              surfaceKind: "requirement_declaration",
              issues
            }),
            subjectRef,
            issues,
            surfaceRef
          ),
          contextFragments: admitGtlAuthorityContextFragmentRows(
            requiredUnknownArrayField({
              record: bundle,
              key: "contextFragments",
              label: surfaceRef,
              subjectRef,
              surfaceKind: "requirement_declaration",
              issues
            }),
            subjectRef,
            issues,
            surfaceRef
          ),
          destinationTopologies: admitGtlDestinationTopologyRows(
            requiredUnknownArrayField({
              record: bundle,
              key: "destinationTopologies",
              label: surfaceRef,
              subjectRef,
              surfaceKind: "requirement_declaration",
              issues
            }),
            subjectRef,
            issues,
            surfaceRef
          ),
          testRelations: admitGtlRequirementTestRelationRows(
            requiredUnknownArrayField({
              record: bundle,
              key: "testRelations",
              label: surfaceRef,
              subjectRef,
              surfaceKind: "requirement_declaration",
              issues
            }),
            subjectRef,
            issues,
            surfaceRef
          )
        })
      ];
    })
  );
}

export function admitGtlProgramConformanceInput(
  rawInput: unknown
): GtlProgramConformanceInputAdmission {
  const issues: GtlProgramConformanceIssue[] = [];
  if (!isRecord(rawInput)) {
    const input = Object.freeze({
      subjectRef: "unknown",
      abiPackageVersion: "",
      expectedCoverage: admitExpectedCoverage(undefined, "unknown", issues),
      featureCoverageManifest: emptyFeatureCoverageManifest("missing"),
      catalogGraphFunctionRefs: Object.freeze([]),
      graphFunctions: Object.freeze([]),
      modules: Object.freeze([]),
      targetCarrierContracts: Object.freeze([]),
      edgeClosureContracts: Object.freeze([]),
      overlays: Object.freeze([]),
      publicStartTargets: Object.freeze([]),
      promptAssets: Object.freeze([]),
      pluginContracts: Object.freeze([]),
      sourceIdentitySurfaces: Object.freeze([]),
      sourceAuthorityPolicies: Object.freeze([]),
      semanticReviewGates: Object.freeze([]),
      pluginResultInterfaces: Object.freeze([]),
      sameObjectProofs: Object.freeze([]),
      operatorDeclarations: Object.freeze([]),
      evaluatorDeclarations: Object.freeze([]),
      ruleDeclarations: Object.freeze([]),
      computeCompositions: Object.freeze([]),
      computeStageBindings: Object.freeze([]),
      hookBoundaries: Object.freeze([]),
      selectionBoundaries: Object.freeze([]),
      jobBindings: Object.freeze([]),
      roleBindings: Object.freeze([]),
      externalToolGates: Object.freeze([]),
      runtimeBindings: Object.freeze([]),
      runtimeReentryRoutes: Object.freeze([]),
      traversalBindConservation: Object.freeze([]),
      requirementsAlgebraDeclarations: Object.freeze([])
    });
    issues.push(
      issue({
        surfaceKind: "program_inventory",
        surfaceRef: "unknown",
        ruleRef: "abg://gtl-program/input/object",
        message: "GTL program conformance input must be an object"
      })
    );
    return Object.freeze({
      kind: "gtl_program_conformance_input_admission" as const,
      input,
      issues: Object.freeze([...issues])
    });
  }

  const subjectRef = requiredStringField({
    record: rawInput,
    key: "subjectRef",
    label: "GtlProgramConformanceInput",
    subjectRef: "unknown",
    surfaceKind: "program_inventory",
    issues
  }) || "unknown";
  const graphFunctionInputs = checkOptionalArrayField({
    record: rawInput,
    key: "graphFunctions",
    subjectRef,
    issues
  });
  const moduleInputs = checkOptionalArrayField({
    record: rawInput,
    key: "modules",
    subjectRef,
    issues
  });
  const input = Object.freeze({
    subjectRef,
    abiPackageVersion: requiredStringField({
      record: rawInput,
      key: "abiPackageVersion",
      label: "GtlProgramConformanceInput",
      subjectRef,
      surfaceKind: "program_inventory",
      issues
    }),
    expectedCoverage: admitExpectedCoverage(
      rawInput["expectedCoverage"],
      subjectRef,
      issues
    ),
    featureCoverageManifest: admitFeatureCoverageManifest(
      rawInput["featureCoverageManifest"],
      subjectRef,
      issues
    ),
    catalogGraphFunctionRefs: optionalStringArrayField({
      record: rawInput,
      key: "catalogGraphFunctionRefs",
      label: "GtlProgramConformanceInput",
      subjectRef,
      surfaceKind: "program_inventory",
      issues
    }),
    graphFunctions: Object.freeze(
      graphFunctionInputs.flatMap((entry, index) => {
        const admitted = plausibleGraphFunction(
          entry,
          subjectRef,
          issues,
          `graphFunctions[${index}]`
        );
        return admitted === null ? [] : [admitted];
      })
    ),
    modules: Object.freeze(
      moduleInputs.flatMap((entry, index) => {
        const admitted = plausibleModule(
          entry,
          subjectRef,
          issues,
          `modules[${index}]`
        );
        return admitted === null ? [] : [admitted];
      })
    ),
    targetCarrierContracts: admitTargetCarrierRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "targetCarrierContracts",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    edgeClosureContracts: admitEdgeClosureRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "edgeClosureContracts",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    overlays: admitOverlayRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "overlays",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    publicStartTargets: admitPublicStartRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "publicStartTargets",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    promptAssets: admitPromptAssetRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "promptAssets",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    pluginContracts: checkOptionalArrayField({
      record: rawInput,
      key: "pluginContracts",
      subjectRef,
      issues
    }),
    pluginResultInterfaces: admitPluginResultInterfaceRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "pluginResultInterfaces",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    sourceIdentitySurfaces: admitSourceIdentityRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "sourceIdentitySurfaces",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    sourceAuthorityPolicies: admitSourceAuthorityPolicyRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "sourceAuthorityPolicies",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    semanticReviewGates: admitSemanticReviewGateRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "semanticReviewGates",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    sameObjectProofs: admitSameObjectRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "sameObjectProofs",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    operatorDeclarations: admitOperatorDeclarationRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "operatorDeclarations",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    evaluatorDeclarations: admitEvaluatorDeclarationRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "evaluatorDeclarations",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    ruleDeclarations: admitRuleDeclarationRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "ruleDeclarations",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    computeCompositions: admitComputeCompositionRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "computeCompositions",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    computeStageBindings: admitComputeStageBindingRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "computeStageBindings",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    hookBoundaries: admitHookBoundaryRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "hookBoundaries",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    selectionBoundaries: admitSelectionBoundaryRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "selectionBoundaries",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    jobBindings: admitJobBindingRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "jobBindings",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    roleBindings: admitRoleBindingRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "roleBindings",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    externalToolGates: admitExternalToolGateRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "externalToolGates",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    runtimeBindings: admitRuntimeBindingRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "runtimeBindings",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    installedContextSurfaces: admitInstalledContextRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "installedContextSurfaces",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    declarationSourceRows: admitDeclarationSourceRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "declarationSourceRows",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    goldenInstanceBindings: admitGoldenInstanceBindingRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "goldenInstanceBindings",
        subjectRef,
        issues
      }),
      issues
    ),
    underdeterminedDeclarations: admitUnderdeterminedDeclarationRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "underdeterminedDeclarations",
        subjectRef,
        issues
      }),
      issues
    ),
    constitutionalSurfaceRows: admitConstitutionalSurfaceRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "constitutionalSurfaceRows",
        subjectRef,
        issues
      }),
      issues
    ),
    constitutionalLiveFacts: admitConstitutionalLiveFacts(
      rawInput["constitutionalLiveFacts"],
      issues
    ),
    runtimeReentryRoutes: admitRuntimeReentryRouteRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "runtimeReentryRoutes",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    traversalBindConservation: admitTraversalBindConservationRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "traversalBindConservation",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    requirementsAlgebraDeclarations: admitRequirementsAlgebraDeclarationBundles(
      checkOptionalArrayField({
        record: rawInput,
        key: "requirementsAlgebraDeclarations",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    )
  });
  return Object.freeze({
    kind: "gtl_program_conformance_input_admission" as const,
    input,
    issues: Object.freeze([...issues])
  });
}

function sameOrderedContract(
  left: readonly Node[],
  right: readonly Node[]
): boolean {
  return stableJson(interfaceContract(left)) === stableJson(interfaceContract(right));
}

function nodeContractSet(nodes: readonly Node[]): Set<string> {
  return new Set(nodes.map(nodeContractKey));
}

function contractNames(nodes: readonly Node[]): readonly string[] {
  return Object.freeze(nodes.map((node) => node.name));
}

function pushGraphInterfaceIssue(input: {
  readonly graphFunction: GraphFunction;
  readonly ruleRef: string;
  readonly message: string;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  input.issues.push(
    issue({
      surfaceKind: "graph_function",
      surfaceRef: input.graphFunction.name,
      ruleRef: input.ruleRef,
      message: input.message
    })
  );
}

function checkGraphFunctionInterface(input: {
  readonly graphFunction: GraphFunction;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const { graphFunction, issues } = input;
  if (!sameOrderedContract(graphFunction.inputs, graphFunction.environment.requires)) {
    pushGraphInterfaceIssue({
      graphFunction,
      issues,
      ruleRef: "abg://gtl-program/graph-function/inputs-equal-environment-requires",
      message: `GraphFunction inputs ${JSON.stringify(contractNames(graphFunction.inputs))} do not equal environment.requires ${JSON.stringify(contractNames(graphFunction.environment.requires))}`
    });
  }

  const providedContracts = nodeContractSet(graphFunction.environment.provides);
  for (const output of graphFunction.outputs) {
    if (!providedContracts.has(nodeContractKey(output))) {
      pushGraphInterfaceIssue({
        graphFunction,
        issues,
        ruleRef: "abg://gtl-program/graph-function/outputs-provided",
        message: `GraphFunction output ${JSON.stringify(output.name)} is absent from environment.provides`
      });
    }
  }
}

function pushGraphIssue(input: {
  readonly graphFunction: GraphFunction;
  readonly graph: Graph;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly surfaceRef: string;
  readonly ruleRef: string;
  readonly message: string;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.surfaceRef,
      ruleRef: input.ruleRef,
      message: `${input.graphFunction.name}/${input.graph.name}: ${input.message}`
    })
  );
}

function graphVectorIdentityKey(input: {
  readonly graphFunctionId: string;
  readonly graphId: string;
  readonly graphVectorId: string;
}): string {
  return stableJson({
    graphFunctionId: input.graphFunctionId,
    graphId: input.graphId,
    graphVectorId: input.graphVectorId
  });
}

function graphVectorIdentityRef(input: {
  readonly graphFunctionRef?: string;
  readonly graphRef?: string;
  readonly vectorRef?: string;
  readonly graphFunctionId: string;
  readonly graphId: string;
  readonly graphVectorId: string;
}): string {
  const display = [
    input.graphFunctionRef ?? input.graphFunctionId,
    input.graphRef ?? input.graphId,
    input.vectorRef ?? input.graphVectorId
  ].join("/");
  return `${display}#${input.graphFunctionId}:${input.graphId}:${input.graphVectorId}`;
}

function fieldRefsMissing(
  fieldRefs: readonly string[],
  expected: readonly string[]
): readonly string[] {
  const fieldRefSet = new Set(fieldRefs);
  return Object.freeze(expected.filter((fieldRef) => !fieldRefSet.has(fieldRef)));
}

function checkTargetCarrierContractLaw(input: {
  readonly row: GtlProgramTargetCarrierRow;
  readonly vector: GraphVectorProjection;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const { row, vector } = input;
  const push = (ruleRef: string, message: string): void => {
    input.issues.push(
      issue({
        surfaceKind: "target_carrier_contract",
        surfaceRef: row.edgeRef,
        ruleRef,
        message
      })
    );
  };
  if (!row.targetCarrierContractRef.startsWith("gtl://target-carrier-contract/")) {
    push(
      "abg://gtl-program/target-carrier/gtl-ref",
      "target carrier row must publish a gtl://target-carrier-contract/ ref"
    );
  }
  if (!row.targetCarrierTemplateRef.startsWith("gtl://target-carrier-template/")) {
    push(
      "abg://gtl-program/target-carrier/template-ref",
      "target carrier row must publish a gtl://target-carrier-template/ ref"
    );
  }
  if (!row.outputCarrierFamilyRef.startsWith("gtl://target-carrier-family/")) {
    push(
      "abg://gtl-program/target-carrier/family-ref",
      "target carrier row must publish a gtl://target-carrier-family/ ref"
    );
  }
  if (!row.envelopeContractRef.startsWith("gtl://target-carrier-envelope/")) {
    push(
      "abg://gtl-program/target-carrier/envelope-ref",
      "target carrier row must publish a gtl://target-carrier-envelope/ ref"
    );
  }
  if (
    !row.outputSurfaceRef.startsWith("asset-type://") ||
    !row.outputSurfaceRef.endsWith(`/${row.targetAssetType}`)
  ) {
    push(
      "abg://gtl-program/target-carrier/output-surface",
      `outputSurfaceRef ${JSON.stringify(row.outputSurfaceRef)} does not match target asset ${JSON.stringify(row.targetAssetType)}`
    );
  }
  const missingRequiredFields = fieldRefsMissing(row.requiredFieldRefs, [
    "kind",
    "targetAssetType",
    "edgeRef",
    "contractRef",
    "contractDigest",
    row.nestedPayloadPath
  ]);
  if (missingRequiredFields.length > 0) {
    push(
      "abg://gtl-program/target-carrier/required-fields",
      `target carrier requiredFieldRefs missing ${missingRequiredFields.join(", ")}`
    );
  }
  const missingProtocolFields = fieldRefsMissing(row.fixedProtocolFieldRefs, [
    "kind",
    "targetAssetType",
    "edgeRef",
    "contractRef",
    "contractDigest"
  ]);
  if (missingProtocolFields.length > 0) {
    push(
      "abg://gtl-program/target-carrier/fixed-protocol-fields",
      `target carrier fixedProtocolFieldRefs missing ${missingProtocolFields.join(", ")}`
    );
  }
  const fixedProtocolSet = new Set(row.fixedProtocolFieldRefs);
  const workerProtocolFields = row.workerFillableFieldRefs.filter((fieldRef) =>
    fixedProtocolSet.has(fieldRef)
  );
  if (workerProtocolFields.length > 0) {
    push(
      "abg://gtl-program/target-carrier/worker-protocol-authority",
      `workerFillableFieldRefs must not include fixed protocol fields ${workerProtocolFields.join(", ")}`
    );
  }
  const literalDomainSet = new Set(row.literalDomainRefs);
  const missingLiteralDomains = [
    `kind:${row.outputCarrierKind}`,
    `targetAssetType:${row.targetAssetType}`,
    `edgeRef:${row.edgeRef}`,
    `contractRef:${row.targetCarrierContractRef}`
  ].filter((literalRef) => !literalDomainSet.has(literalRef));
  if (missingLiteralDomains.length > 0) {
    push(
      "abg://gtl-program/target-carrier/literal-domain",
      `target carrier literalDomainRefs missing ${missingLiteralDomains.join(", ")}`
    );
  }
  if (row.schemaRef !== vector.targetSchemaRef) {
    push(
      "abg://gtl-program/target-carrier/schema-ref",
      `target carrier schemaRef ${JSON.stringify(row.schemaRef)} does not match vector target schema ${JSON.stringify(vector.targetSchemaRef)}`
    );
  }
  const requiredRefPrefixes = [
    ["admissionRef", row.admissionRef, "admission://"],
    ["payloadLedgerBindingRef", row.payloadLedgerBindingRef, "payload-ledger://"],
    ["edgeAssuranceBindingRef", row.edgeAssuranceBindingRef, "edge-assurance://"],
    ["handoffProjectionRef", row.handoffProjectionRef, "handoff-projection://"],
    ["constructionTemplateRef", row.constructionTemplateRef, "construction-template://"],
    ["replayDigestPolicyRef", row.replayDigestPolicyRef, "replay-digest://"],
    ["materializationPolicyRef", row.materializationPolicyRef, "materialization://"],
    ["closurePreconditionRef", row.closurePreconditionRef, "closure-precondition://"]
  ] as const;
  for (const [fieldName, value, prefix] of requiredRefPrefixes) {
    if (!value.startsWith(prefix)) {
      push(
        `abg://gtl-program/target-carrier/${fieldName}`,
        `target carrier ${fieldName} must declare a ${prefix} ref`
      );
    }
  }
}

function checkGraphProgramClosure(input: {
  readonly graphFunction: GraphFunction;
  readonly graph: Graph;
  readonly vectorIdentityKeys: Set<string>;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const { graphFunction, graph, vectorIdentityKeys, issues } = input;
  const declaredContracts = nodeContractSet(graph.nodes);
  const referencedContracts = new Set<string>();

  for (const graphInput of graph.inputs) {
    const graphInputContract = nodeContractKey(graphInput);
    referencedContracts.add(graphInputContract);
    if (!declaredContracts.has(graphInputContract)) {
      pushGraphIssue({
        graphFunction,
        graph,
        issues,
        surfaceKind: "graph",
        surfaceRef: graph.name,
        ruleRef: "abg://gtl-program/graph/input-node-declared",
        message: `graph input ${JSON.stringify(graphInput.name)} is absent from graph.nodes`
      });
    }
  }

  for (const graphOutput of graph.outputs) {
    const graphOutputContract = nodeContractKey(graphOutput);
    referencedContracts.add(graphOutputContract);
    if (!declaredContracts.has(graphOutputContract)) {
      pushGraphIssue({
        graphFunction,
        graph,
        issues,
        surfaceKind: "graph",
        surfaceRef: graph.name,
        ruleRef: "abg://gtl-program/graph/output-node-declared",
        message: `graph output ${JSON.stringify(graphOutput.name)} is absent from graph.nodes`
      });
    }
  }

  for (const vector of graph.vectors) {
    const vectorIdentity = {
      graphFunctionId: graphFunction.id,
      graphId: graph.id,
      graphVectorId: vector.id
    };
    const vectorIdentityKey = graphVectorIdentityKey(vectorIdentity);
    if (vectorIdentityKeys.has(vectorIdentityKey)) {
      pushGraphIssue({
        graphFunction,
        graph,
        issues,
        surfaceKind: "graph_vector",
        surfaceRef: graphVectorIdentityRef({
          graphFunctionRef: graphFunction.name,
          graphRef: graph.name,
          vectorRef: vector.name,
          ...vectorIdentity
        }),
        ruleRef: "abg://gtl-program/graph-vector/unique-ref",
        message: `GraphVector identity ${JSON.stringify(vectorIdentity)} is declared more than once`
      });
    }
    vectorIdentityKeys.add(vectorIdentityKey);

    for (const source of vector.source) {
      const sourceContract = nodeContractKey(source);
      referencedContracts.add(sourceContract);
      if (!declaredContracts.has(sourceContract)) {
        pushGraphIssue({
          graphFunction,
          graph,
          issues,
          surfaceKind: "graph_vector",
          surfaceRef: vector.name,
          ruleRef: "abg://gtl-program/graph-vector/source-node-declared",
          message: `vector source ${JSON.stringify(source.name)} is absent from graph.nodes`
        });
      }
    }

    const targetContract = nodeContractKey(vector.target);
    referencedContracts.add(targetContract);
    if (!declaredContracts.has(targetContract)) {
      pushGraphIssue({
        graphFunction,
        graph,
        issues,
        surfaceKind: "graph_vector",
        surfaceRef: vector.name,
        ruleRef: "abg://gtl-program/graph-vector/target-node-declared",
        message: `vector target ${JSON.stringify(vector.target.name)} is absent from graph.nodes`
      });
    }
  }

  const availableContracts = nodeContractSet(graph.inputs);
  const remainingVectors = new Set<GraphVector>(graph.vectors);
  let progressed = true;
  while (progressed) {
    progressed = false;
    for (const vector of [...remainingVectors]) {
      const sourceContracts = interfaceContract(vector.source);
      if (sourceContracts.every((contract) => availableContracts.has(contract))) {
        availableContracts.add(nodeContractKey(vector.target));
        remainingVectors.delete(vector);
        progressed = true;
      }
    }
  }

  for (const vector of remainingVectors) {
    const missingSources = vector.source
      .filter((source) => !availableContracts.has(nodeContractKey(source)))
      .map((source) => source.name);
    pushGraphIssue({
      graphFunction,
      graph,
      issues,
      surfaceKind: "graph_vector",
      surfaceRef: vector.name,
      ruleRef: "abg://gtl-program/graph-vector/source-derivable",
      message: `vector sources are not derivable from graph inputs or prior vector outputs: ${JSON.stringify(missingSources)}`
    });
  }

  for (const graphOutput of graph.outputs) {
    if (!availableContracts.has(nodeContractKey(graphOutput))) {
      pushGraphIssue({
        graphFunction,
        graph,
        issues,
        surfaceKind: "graph",
        surfaceRef: graph.name,
        ruleRef: "abg://gtl-program/graph/output-derivable",
        message: `graph output ${JSON.stringify(graphOutput.name)} is not derivable from graph inputs`
      });
    }
  }

  for (const node of graph.nodes) {
    if (!referencedContracts.has(nodeContractKey(node))) {
      pushGraphIssue({
        graphFunction,
        graph,
        issues,
        surfaceKind: "graph",
        surfaceRef: graph.name,
        ruleRef: "abg://gtl-program/graph/node-reachable-or-bound",
        message: `declared node ${JSON.stringify(node.name)} is not an input, output, vector source, or vector target`
      });
    }
  }
}

function collectPublishedGraphFunctions(
  input: GtlProgramConformanceInput,
  issues: GtlProgramConformanceIssue[]
): readonly GraphFunction[] {
  const graphFunctions = [...(input.graphFunctions ?? [])];
  for (const module of input.modules ?? []) {
    graphFunctions.push(...module.graphFunctions);
  }

  const byName = new Map<string, GraphFunction>();
  for (const graphFunction of graphFunctions) {
    if (byName.has(graphFunction.name)) {
      issues.push(
        issue({
          surfaceKind: "graph_function",
          surfaceRef: graphFunction.name,
          ruleRef: "abg://gtl-program/graph-function/unique-publication",
          message: `GraphFunction ${JSON.stringify(graphFunction.name)} is published more than once`
        })
      );
      continue;
    }
    byName.set(graphFunction.name, graphFunction);
  }
  return Object.freeze([...byName.values()]);
}

function nodeTypeGraphFunctionRefs(
  graphFunctions: readonly GraphFunction[]
): ReadonlySet<string> {
  return new Set(
    graphFunctions.flatMap((graphFunction) =>
      graphFunction.tags.includes(GTL_NODE_TYPE_GRAPH_FUNCTION_TAG)
        ? [graphFunction.name, graphFunction.id]
        : []
    )
  );
}

function checkCatalogPublication(input: {
  readonly catalogGraphFunctionRefs: readonly string[];
  readonly publishedGraphFunctionRefs: ReadonlySet<string>;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const catalogRefs = new Set(input.catalogGraphFunctionRefs);
  for (const ref of catalogRefs) {
    if (!input.publishedGraphFunctionRefs.has(ref)) {
      input.issues.push(
        issue({
          surfaceKind: "graph_function",
          surfaceRef: ref,
          ruleRef: "abg://gtl-program/graph-function/catalog-published",
          message: `catalog GraphFunction ${JSON.stringify(ref)} is not published`
        })
      );
    }
  }
  for (const ref of input.publishedGraphFunctionRefs) {
    if (!catalogRefs.has(ref)) {
      input.issues.push(
        issue({
          surfaceKind: "module",
          surfaceRef: ref,
          ruleRef: "abg://gtl-program/module/no-untracked-graph-function",
          message: `published GraphFunction ${JSON.stringify(ref)} is absent from the supplied catalog`
        })
      );
    }
  }
}

function materializeGraphVectors(
  graphFunctions: readonly GraphFunction[],
  issues: GtlProgramConformanceIssue[]
): readonly GraphVectorProjection[] {
  const vectors: GraphVectorProjection[] = [];
  const vectorIdentityKeys = new Set<string>();
  for (const graphFunction of graphFunctions) {
    checkHostDeclarationLaw({
      host: "graph_function",
      surfaceKind: "graph_function",
      surfaceRef: `${graphFunction.name}#declarations`,
      attrs: graphFunction.declarations,
      issues
    });
    checkGraphFunctionApplicationDeclarations({
      graphFunction,
      graphFunctions,
      issues
    });
    checkHofRelationDeclarations({ graphFunction, graphFunctions, issues });
    checkGraphFunctionInterface({ graphFunction, issues });
    const rawCandidates = collectRawCProgramCandidates(
      graphFunction.declarations
    );
    let graph: Graph;
    try {
      graph = materializeGraphFunction(graphFunction);
    } catch (error: unknown) {
      checkCAlgebraDeclarations({
        graphFunction,
        graphFunctions,
        rawCandidates,
        selectedCandidateModes: new Map(),
        issues
      });
      checkCompiledExecutionDeclarations({ graphFunction, issues });
      issues.push(
        issue({
          surfaceKind: "graph_function",
          surfaceRef: graphFunction.name,
          ruleRef: "abg://gtl-program/graph-function/materializable-template",
          message: errorMessage(error)
        })
      );
      continue;
    }

    const selectionCompilations: GraphVectorCProgramCompilation[] = [];
    graph.vectors.forEach((vector) => {
      const declarationViolations = checkHostDeclarationLaw({
        host: "graph_vector",
        surfaceKind: "graph_vector",
        surfaceRef: `${graphFunction.name}/${graph.name}/${vector.name}#declarations`,
        attrs: vector.declarations,
        issues
      });
      if (
        declarationViolations.some(
          (violation) => violation.key === HOG_PROGRAM_SELECTION_KEY
        )
      ) {
        return;
      }
      selectionCompilations.push(
        compileGraphVectorCProgramSelection({
          graphFunction,
          graphVector: vector
        })
      );
    });

    for (const compilation of selectionCompilations) {
      for (const row of compilation.diagnostics) {
        if (row.classification === "invalid_program") {
          pushGraphVectorCProgramDiagnostic({
            graphFunction,
            row,
            issues
          });
        }
      }
    }

    const selectedCandidateModes = new Map<string, "compile" | "skip">();
    for (const compilation of selectionCompilations) {
      const mode =
        compilation.binding !== null ||
        compilation.selectedProgramDiagnostics.length > 0
          ? "compile"
          : "skip";
      for (const candidate of compilation.selectedCandidates) {
        const identity = rawCProgramCandidateIdentity(candidate);
        if (selectedCandidateModes.get(identity) !== "compile") {
          selectedCandidateModes.set(identity, mode);
        }
      }
    }
    const invalidCandidateIdentities = checkCAlgebraDeclarations({
      graphFunction,
      graphFunctions,
      rawCandidates,
      selectedCandidateModes,
      issues
    });
    for (const compilation of selectionCompilations) {
      for (const row of compilation.diagnostics) {
        if (row.classification === "semantic_not_realized") {
          if (
            compilation.selectedCandidates.some((candidate) =>
              invalidCandidateIdentities.has(
                rawCProgramCandidateIdentity(candidate)
              )
            )
          ) {
            continue;
          }
          pushGraphVectorCProgramDiagnostic({
            graphFunction,
            row,
            issues
          });
        }
      }
    }
    checkCompiledExecutionDeclarations({ graphFunction, issues });
    checkGraphProgramClosure({
      graphFunction,
      graph,
      vectorIdentityKeys,
      issues
    });
    graph.vectors.forEach((vector, vectorIndex) => {
        vectors.push(
          Object.freeze({
            graphFunctionId: graphFunction.id,
            graphFunctionRef: graphFunction.name,
            graphId: graph.id,
            graphRef: graph.name,
            graphVectorId: vector.id,
            vectorIndex,
            vectorRef: vector.name,
            sourceAssetTypes: Object.freeze(vector.source.map((source) => source.name)),
            sourceNodeContracts: interfaceContract(vector.source),
            targetAssetType: vector.target.name,
            targetSchemaRef: vector.target.schema.ref,
            targetNodeContract: nodeContractKey(vector.target),
            operatorCount: vector.operators.length,
            evaluatorCount: vector.evaluators.length,
            hasRule: vector.rule !== null,
            allowsSubwork: vector.allowsSubwork,
            declarationKeyRefs: Object.freeze(
              vector.declarations.entries.map((entry) => entry.key)
            )
          })
        );
    });
  }
  return Object.freeze(vectors);
}

function checkAllowedConsequenceTraversalDeclarations(input: {
  readonly graphFunctions: readonly GraphFunction[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  for (const graphFunction of input.graphFunctions) {
    let graph: Graph;
    try {
      graph = materializeGraphFunction(graphFunction);
    } catch {
      continue;
    }
    graph.vectors.forEach((vector, vectorIndex) => {
      try {
        deriveAllowedConsequenceTraversalCatalogFromGtl({
          graphFunction,
          graphVector: vector,
          vectorIndex,
          edgeRef: vector.name
        });
      } catch (error: unknown) {
        input.issues.push(
          issue({
            surfaceKind: "graph_vector",
            surfaceRef: vector.name,
            ruleRef:
              "abg://gtl-program/allowed-consequence-traversal/declaration",
            message: errorMessage(error),
            evidenceRefs: [
              graphFunction.name,
              graphFunction.id,
              vector.id
            ]
          })
        );
      }
    });
  }
}

function traversalUnitRef(vector: GraphVectorProjection): string {
  return `abg://gtl-program/traversal-unit/${stableSha256Digest({
    graphFunctionId: vector.graphFunctionId,
    graphId: vector.graphId,
    graphVectorId: vector.graphVectorId
  })}`;
}

function graphVectorRowsByIdentity<
  T extends {
    readonly graphFunctionId: string;
    readonly graphId: string;
    readonly graphVectorId: string;
  }
>(rows: readonly T[]): ReadonlyMap<string, readonly T[]> {
  const byIdentity = new Map<string, T[]>();
  for (const row of rows) {
    const key = graphVectorIdentityKey(row);
    byIdentity.set(key, [...(byIdentity.get(key) ?? []), row]);
  }
  return new Map(
    [...byIdentity.entries()].map(([key, value]) => [
      key,
      Object.freeze(value)
    ])
  );
}

function compositionHostsTraversalUnit(input: {
  readonly composition: GtlProgramComputeCompositionRow;
  readonly vector: GraphVectorProjection;
}): boolean {
  const { composition, vector } = input;
  if (composition.hostKind === "graph_vector") {
    return (
      composition.hostRef === vector.vectorRef ||
      composition.hostRef === vector.graphVectorId ||
      composition.hostRef === graphVectorIdentityRef(vector)
    );
  }
  if (composition.hostKind === "graph_function") {
    return (
      composition.hostRef === vector.graphFunctionRef ||
      composition.hostRef === vector.graphFunctionId
    );
  }
  return false;
}

function consequenceCatalogsByVectorIdentity(
  graphFunctions: readonly GraphFunction[]
): ReadonlyMap<string, AllowedConsequenceTraversalCatalog> {
  const catalogs = new Map<string, AllowedConsequenceTraversalCatalog>();
  for (const graphFunction of graphFunctions) {
    let graph: Graph;
    try {
      graph = materializeGraphFunction(graphFunction);
    } catch {
      continue;
    }
    graph.vectors.forEach((vector, vectorIndex) => {
      try {
        catalogs.set(
          graphVectorIdentityKey({
            graphFunctionId: graphFunction.id,
            graphId: graph.id,
            graphVectorId: vector.id
          }),
          deriveAllowedConsequenceTraversalCatalogFromGtl({
            graphFunction,
            graphVector: vector,
            vectorIndex,
            edgeRef: vector.name
          })
        );
      } catch {
        // Declaration errors are reported by checkAllowedConsequenceTraversalDeclarations.
      }
    });
  }
  return catalogs;
}

function allRequirementDeclarations(
  bundles: readonly GtlRequirementsAlgebraDeclarationBundle[]
): readonly GtlRequirementDeclaration[] {
  return Object.freeze(bundles.flatMap((bundle) => bundle.requirements));
}

function allRequirementRelationDeclarations(
  bundles: readonly GtlRequirementsAlgebraDeclarationBundle[]
): readonly GtlRequirementRelationDeclaration[] {
  return Object.freeze(bundles.flatMap((bundle) => bundle.relations));
}

function allTraversalSpanDeclarations(
  bundles: readonly GtlRequirementsAlgebraDeclarationBundle[]
): readonly GtlTraversalSpanDeclaration[] {
  return Object.freeze(bundles.flatMap((bundle) => bundle.spans));
}

function allAuthorityContextFragmentDeclarations(
  bundles: readonly GtlRequirementsAlgebraDeclarationBundle[]
): readonly GtlAuthorityContextFragmentDeclaration[] {
  return Object.freeze(bundles.flatMap((bundle) => bundle.contextFragments));
}

function allDestinationTopologyDeclarations(
  bundles: readonly GtlRequirementsAlgebraDeclarationBundle[]
): readonly GtlDestinationTopologyDeclaration[] {
  return Object.freeze(bundles.flatMap((bundle) => bundle.destinationTopologies));
}

function allRequirementTestRelationDeclarations(
  bundles: readonly GtlRequirementsAlgebraDeclarationBundle[]
): readonly GtlRequirementTestRelationDeclaration[] {
  return Object.freeze(bundles.flatMap((bundle) => bundle.testRelations));
}

function spanMatchesVector(
  span: GtlTraversalSpanDeclaration,
  vector: GraphVectorProjection
): boolean {
  return spanMatchesVectorIdentity(span, vector) || spanCoversVectorIndexRange(span, vector);
}

function spanMatchesVectorIdentity(
  span: GtlTraversalSpanDeclaration,
  vector: GraphVectorProjection
): boolean {
  const graphFunctionMatches =
    span.graphFunctionRef === vector.graphFunctionRef ||
    span.graphFunctionRef === vector.graphFunctionId;
  if (!graphFunctionMatches) {
    return false;
  }
  return (
    span.graphVectorRefs.includes(vector.vectorRef) ||
    span.graphVectorRefs.includes(vector.graphVectorId) ||
    span.graphVectorRefs.includes(graphVectorIdentityRef(vector)) ||
    span.vectorIndexes.includes(vector.vectorIndex)
  );
}

function spanVectorIndexRange(
  span: GtlTraversalSpanDeclaration
): { readonly min: number; readonly max: number } | null {
  if (span.vectorIndexes.length < 2) {
    return null;
  }
  return Object.freeze({
    min: Math.min(...span.vectorIndexes),
    max: Math.max(...span.vectorIndexes)
  });
}

function spanCoversVectorIndexRange(
  span: GtlTraversalSpanDeclaration,
  vector: GraphVectorProjection
): boolean {
  const graphFunctionMatches =
    span.graphFunctionRef === vector.graphFunctionRef ||
    span.graphFunctionRef === vector.graphFunctionId;
  const range = spanVectorIndexRange(span);
  return (
    graphFunctionMatches &&
    range !== null &&
    vector.vectorIndex >= range.min &&
    vector.vectorIndex <= range.max
  );
}

function vectorSourceMatchesSpan(
  span: GtlTraversalSpanDeclaration,
  vector: GraphVectorProjection
): boolean {
  return (
    vector.sourceAssetTypes.includes(span.sourceNodeRef) ||
    vector.sourceNodeContracts.includes(span.sourceNodeRef)
  );
}

function vectorTargetMatchesSpan(
  span: GtlTraversalSpanDeclaration,
  vector: GraphVectorProjection
): boolean {
  return (
    span.targetNodeRef === vector.targetAssetType ||
    span.targetNodeRef === vector.targetNodeContract
  );
}

function requirementAppliesToSpan(
  requirement: GtlRequirementDeclaration,
  span: GtlTraversalSpanDeclaration
): boolean {
  return requirement.spanRefs.includes(span.spanId);
}

function constructRequirementsAlgebraProjection(input: {
  readonly subjectRef: string;
  readonly declarations: readonly GtlRequirementsAlgebraDeclarationBundle[];
  readonly vectors: readonly GraphVectorProjection[];
}): GtlProgramRequirementsAlgebraProjection {
  const requirements = allRequirementDeclarations(input.declarations);
  const relations = allRequirementRelationDeclarations(input.declarations);
  const spans = allTraversalSpanDeclarations(input.declarations);
  const contextFragments =
    allAuthorityContextFragmentDeclarations(input.declarations);
  const destinationTopologies =
    allDestinationTopologyDeclarations(input.declarations);
  const testRelations = allRequirementTestRelationDeclarations(
    input.declarations
  );
  const contextFragmentsByRef = new Map(
    contextFragments.map((fragment) => [fragment.fragmentRef, fragment])
  );
  const destinationTopologiesByApplyRef = new Map<
    string,
    GtlDestinationTopologyDeclaration[]
  >();
  for (const topology of destinationTopologies) {
    for (const appliesToRef of topology.appliesToRefs) {
      destinationTopologiesByApplyRef.set(appliesToRef, [
        ...(destinationTopologiesByApplyRef.get(appliesToRef) ?? []),
        topology
      ]);
    }
  }
  const testRelationsByRequirementId = new Map<
    string,
    GtlRequirementTestRelationDeclaration[]
  >();
  for (const testRelation of testRelations) {
    testRelationsByRequirementId.set(testRelation.requirementId, [
      ...(testRelationsByRequirementId.get(testRelation.requirementId) ?? []),
      testRelation
    ]);
  }
  const edgeRows = Object.freeze(
    input.vectors.map((vector) => {
      const vectorSpans = spans.filter((span) => spanMatchesVector(span, vector));
      const vectorRequirements = requirements.filter((requirement) =>
        vectorSpans.some((span) => requirementAppliesToSpan(requirement, span))
      );
      const requirementIds = uniqueSorted(
        vectorRequirements.map((requirement) => requirement.requirementId)
      );
      const spanRefs = uniqueSorted(vectorSpans.map((span) => span.spanId));
      const fragmentRefs = uniqueSorted(
        vectorRequirements.flatMap((requirement) =>
          requirement.contextRefs.filter((ref) => contextFragmentsByRef.has(ref))
        )
      );
      const topologyRefs = uniqueSorted(
        [
          vector.graphFunctionRef,
          vector.graphFunctionId,
          vector.vectorRef,
          vector.graphVectorId,
          ...requirementIds,
          ...spanRefs
        ].flatMap((ref) =>
          (destinationTopologiesByApplyRef.get(ref) ?? []).map(
            (topology) => topology.topologyRef
          )
        )
      );
      const activeTestRelations = requirementIds.flatMap(
        (requirementId) => testRelationsByRequirementId.get(requirementId) ?? []
      );
      return Object.freeze({
        kind: "gtl_program_requirements_algebra_edge_projection_row" as const,
        unitRef: traversalUnitRef(vector),
        graphFunctionRef: vector.graphFunctionRef,
        graphFunctionId: vector.graphFunctionId,
        graphVectorRef: vector.vectorRef,
        graphVectorId: vector.graphVectorId,
        vectorIndex: vector.vectorIndex,
        requirementIds,
        spanRefs,
        contextFragmentRefs: fragmentRefs,
        destinationTopologyRefs: topologyRefs,
        testRelationRefs: uniqueSorted(
          activeTestRelations.map((relation) => relation.relationRef)
        ),
        evidencePolicyRefs: uniqueSorted([
          ...vectorRequirements.flatMap((requirement) =>
            requirement.evidencePolicyRefs
          ),
          ...activeTestRelations.map((relation) => relation.evidencePolicyRef)
        ])
      });
    })
  );
  return Object.freeze({
    kind: "gtl_program_requirements_algebra_projection" as const,
    subjectRef: input.subjectRef,
    declarationBundleCount: input.declarations.length,
    requirementIds: uniqueSorted(
      requirements.map((requirement) => requirement.requirementId)
    ),
    relationRefs: uniqueSorted(relations.map((relation) => relation.relationId)),
    spanRefs: uniqueSorted(spans.map((span) => span.spanId)),
    contextFragmentRefs: uniqueSorted(
      contextFragments.map((fragment) => fragment.fragmentRef)
    ),
    destinationTopologyRefs: uniqueSorted(
      destinationTopologies.map((topology) => topology.topologyRef)
    ),
    testRelationRefs: uniqueSorted(
      testRelations.map((relation) => relation.relationRef)
    ),
    edgeRows
  });
}

function refResolvesToRequirementSurface(input: {
  readonly ref: string;
  readonly requirementIds: ReadonlySet<string>;
  readonly spanIds: ReadonlySet<string>;
  readonly contextRefs: ReadonlySet<string>;
  readonly topologyRefs?: ReadonlySet<string> | undefined;
  readonly evidencePolicyRefs?: ReadonlySet<string> | undefined;
  readonly graphFunctionRefs: ReadonlySet<string>;
  readonly graphVectorRefs: ReadonlySet<string>;
}): boolean {
  return (
    input.requirementIds.has(input.ref) ||
    input.spanIds.has(input.ref) ||
    input.contextRefs.has(input.ref) ||
    input.topologyRefs?.has(input.ref) === true ||
    input.evidencePolicyRefs?.has(input.ref) === true ||
    input.graphFunctionRefs.has(input.ref) ||
    input.graphVectorRefs.has(input.ref)
  );
}

function relationPairKey(leftRequirementId: string, rightRequirementId: string): string {
  return [leftRequirementId, rightRequirementId].sort().join("||");
}

function hasRequirementRelationPath(input: {
  readonly adjacency: ReadonlyMap<string, readonly string[]>;
  readonly start: string;
  readonly target: string;
  readonly visited?: ReadonlySet<string> | undefined;
}): boolean {
  if (input.start === input.target) {
    return true;
  }
  const visited = new Set(input.visited ?? []);
  if (visited.has(input.start)) {
    return false;
  }
  visited.add(input.start);
  for (const next of input.adjacency.get(input.start) ?? []) {
    if (
      hasRequirementRelationPath({
        adjacency: input.adjacency,
        start: next,
        target: input.target,
        visited
      })
    ) {
      return true;
    }
  }
  return false;
}

function checkRequirementRelationGraph(input: {
  readonly relations: readonly GtlRequirementRelationDeclaration[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const directedAdjacency = new Map<string, string[]>();
  const relationKindsByPair = new Map<
    string,
    Set<GtlRequirementRelationDeclaration["relationKind"]>
  >();
  for (const relation of input.relations) {
    if (
      relation.fromRequirementId === relation.toRequirementId &&
      !GTL_REQUIREMENTS_RELATION_KINDS_ALLOWING_SELF_REF.has(relation.relationKind)
    ) {
      pushRowIssue({
        surfaceKind: "requirement_declaration",
        surfaceRef: relation.relationId,
        ruleRef: "abg://gtl-program/requirements-algebra/relation-self-reference",
        message: `${relation.relationKind} relation ${JSON.stringify(relation.relationId)} self-references ${JSON.stringify(relation.fromRequirementId)}`,
        issues: input.issues
      });
    }
    if (GTL_REQUIREMENTS_DIRECTED_ACYCLIC_RELATION_KINDS.has(relation.relationKind)) {
      directedAdjacency.set(relation.fromRequirementId, [
        ...(directedAdjacency.get(relation.fromRequirementId) ?? []),
        relation.toRequirementId
      ]);
    }
    const pairKey = relationPairKey(relation.fromRequirementId, relation.toRequirementId);
    relationKindsByPair.set(pairKey, relationKindsByPair.get(pairKey) ?? new Set());
    relationKindsByPair.get(pairKey)?.add(relation.relationKind);
  }

  const reportedCycles = new Set<string>();
  for (const relation of input.relations) {
    if (!GTL_REQUIREMENTS_DIRECTED_ACYCLIC_RELATION_KINDS.has(relation.relationKind)) {
      continue;
    }
    if (
      hasRequirementRelationPath({
        adjacency: directedAdjacency,
        start: relation.toRequirementId,
        target: relation.fromRequirementId
      })
    ) {
      const cycleKey = relationPairKey(relation.fromRequirementId, relation.toRequirementId);
      if (!reportedCycles.has(cycleKey)) {
        pushRowIssue({
          surfaceKind: "requirement_declaration",
          surfaceRef: relation.relationId,
          ruleRef: "abg://gtl-program/requirements-algebra/relation-cycle",
          message: `${relation.relationKind} relation ${JSON.stringify(relation.relationId)} participates in a directed cycle`,
          issues: input.issues
        });
        reportedCycles.add(cycleKey);
      }
    }
  }

  for (const [pairKey, relationKinds] of relationKindsByPair) {
    if (!relationKinds.has("conflict")) {
      continue;
    }
    for (const relationKind of relationKinds) {
      if (GTL_REQUIREMENTS_CONFLICT_CONTRADICTORY_RELATION_KINDS.has(relationKind)) {
        pushRowIssue({
          surfaceKind: "requirement_declaration",
          surfaceRef: pairKey,
          ruleRef: "abg://gtl-program/requirements-algebra/relation-contradiction",
          message: `requirement pair ${JSON.stringify(pairKey)} carries both conflict and ${relationKind} relation kinds`,
          issues: input.issues
        });
        break;
      }
    }
  }
}

function checkRequirementProjectionRef(input: {
  readonly surfaceRef: string;
  readonly fieldName: string;
  readonly value: string;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  if (!input.value.startsWith("projection://")) {
    pushRowIssue({
      surfaceKind: "requirement_declaration",
      surfaceRef: input.surfaceRef,
      ruleRef: "abg://gtl-program/requirements-algebra/test-projection-ref-grammar",
      message: `${input.fieldName} must be a projection:// ref`,
      issues: input.issues
    });
  }
}

function checkRequirementsAlgebraDeclarations(input: {
  readonly declarations: readonly GtlRequirementsAlgebraDeclarationBundle[];
  readonly vectors: readonly GraphVectorProjection[];
  readonly graphFunctionRefs: ReadonlySet<string>;
  readonly graphVectorRefs: ReadonlySet<string>;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const requirements = allRequirementDeclarations(input.declarations);
  const relations = allRequirementRelationDeclarations(input.declarations);
  const spans = allTraversalSpanDeclarations(input.declarations);
  const contextFragments =
    allAuthorityContextFragmentDeclarations(input.declarations);
  const destinationTopologies =
    allDestinationTopologyDeclarations(input.declarations);
  const testRelations = allRequirementTestRelationDeclarations(
    input.declarations
  );
  const requirementIds = new Set(
    requirements.map((requirement) => requirement.requirementId)
  );
  const relationIds = new Set(relations.map((relation) => relation.relationId));
  const spanIds = new Set(spans.map((span) => span.spanId));
  const contextRefs = new Set(
    contextFragments.map((fragment) => fragment.fragmentRef)
  );
  const topologyRefs = new Set(
    destinationTopologies.map((topology) => topology.topologyRef)
  );
  const evidencePolicyRefs = new Set(
    requirements.flatMap((requirement) => requirement.evidencePolicyRefs)
  );
  const requirementById = new Map(
    requirements.map((requirement) => [requirement.requirementId, requirement])
  );
  const graphVectorRefs = new Set([
    ...input.graphVectorRefs,
    ...input.vectors.map((vector) => vector.graphVectorId),
    ...input.vectors.map((vector) => graphVectorIdentityRef(vector))
  ]);
  const vectorsByGraphFunctionRef = new Map<string, GraphVectorProjection[]>();
  for (const vector of input.vectors) {
    for (const graphFunctionRef of new Set([
      vector.graphFunctionRef,
      vector.graphFunctionId
    ])) {
      vectorsByGraphFunctionRef.set(graphFunctionRef, [
        ...(vectorsByGraphFunctionRef.get(graphFunctionRef) ?? []),
        vector
      ]);
    }
  }

  checkUniqueRows({
    rows: requirements.map((row) => ({ ref: row.requirementId })),
    surfaceKind: "requirement_declaration",
    ruleRef: "abg://gtl-program/requirements-algebra/unique-requirement-id",
    label: "requirement declaration",
    issues: input.issues
  });
  checkUniqueRows({
    rows: requirements.map((row) => ({ ref: row.stableId })),
    surfaceKind: "requirement_declaration",
    ruleRef: "abg://gtl-program/requirements-algebra/unique-stable-id",
    label: "requirement stable id",
    issues: input.issues
  });
  checkUniqueRows({
    rows: relations.map((row) => ({ ref: row.relationId })),
    surfaceKind: "requirement_declaration",
    ruleRef: "abg://gtl-program/requirements-algebra/unique-relation-id",
    label: "requirement relation",
    issues: input.issues
  });
  checkUniqueRows({
    rows: spans.map((row) => ({ ref: row.spanId })),
    surfaceKind: "requirement_declaration",
    ruleRef: "abg://gtl-program/requirements-algebra/unique-span-id",
    label: "requirement traversal span",
    issues: input.issues
  });
  checkUniqueRows({
    rows: contextFragments.map((row) => ({ ref: row.fragmentRef })),
    surfaceKind: "requirement_declaration",
    ruleRef: "abg://gtl-program/requirements-algebra/unique-context-fragment-ref",
    label: "requirement context fragment",
    issues: input.issues
  });
  checkUniqueRows({
    rows: destinationTopologies.map((row) => ({ ref: row.topologyRef })),
    surfaceKind: "requirement_declaration",
    ruleRef: "abg://gtl-program/requirements-algebra/unique-destination-topology-ref",
    label: "requirement destination topology",
    issues: input.issues
  });
  checkUniqueRows({
    rows: testRelations.map((row) => ({ ref: row.relationRef })),
    surfaceKind: "requirement_declaration",
    ruleRef: "abg://gtl-program/requirements-algebra/unique-test-relation-ref",
    label: "requirement test relation",
    issues: input.issues
  });

  for (const requirement of requirements) {
    checkDigestField({
      surfaceKind: "requirement_declaration",
      surfaceRef: requirement.requirementId,
      ruleRef: "abg://gtl-program/requirements-algebra/source-digest",
      fieldName: "sourceDigest",
      value: requirement.sourceDigest,
      issues: input.issues
    });
    for (const relationRef of requirement.relationRefs) {
      if (!relationIds.has(relationRef)) {
        pushRowIssue({
          surfaceKind: "requirement_declaration",
          surfaceRef: requirement.requirementId,
          ruleRef: "abg://gtl-program/requirements-algebra/relation-ref-resolves",
          message: `relationRef ${JSON.stringify(relationRef)} does not resolve to a supplied requirement relation declaration`,
          issues: input.issues
        });
      }
    }
    for (const spanRef of requirement.spanRefs) {
      if (!spanIds.has(spanRef)) {
        pushRowIssue({
          surfaceKind: "requirement_declaration",
          surfaceRef: requirement.requirementId,
          ruleRef: "abg://gtl-program/requirements-algebra/span-ref-resolves",
          message: `spanRef ${JSON.stringify(spanRef)} does not resolve to a supplied traversal span declaration`,
          issues: input.issues
        });
      }
    }
    for (const contextRef of requirement.contextRefs) {
      if (!contextRefs.has(contextRef)) {
        pushRowIssue({
          surfaceKind: "requirement_declaration",
          surfaceRef: requirement.requirementId,
          ruleRef: "abg://gtl-program/requirements-algebra/context-ref-resolves",
          message: `contextRef ${JSON.stringify(contextRef)} does not resolve to a supplied authority context fragment`,
          issues: input.issues
        });
      }
    }
    checkNonEmptyArray({
      surfaceKind: "requirement_declaration",
      surfaceRef: requirement.requirementId,
      ruleRef: "abg://gtl-program/requirements-algebra/evidence-policy-coverage",
      fieldName: "evidencePolicyRefs",
      values: requirement.evidencePolicyRefs,
      issues: input.issues
    });
  }

  for (const relation of relations) {
    for (const [fieldName, requirementId] of [
      ["fromRequirementId", relation.fromRequirementId],
      ["toRequirementId", relation.toRequirementId]
    ] as const) {
      if (!requirementIds.has(requirementId)) {
        pushRowIssue({
          surfaceKind: "requirement_declaration",
          surfaceRef: relation.relationId,
          ruleRef:
            "abg://gtl-program/requirements-algebra/relation-requirement-ref-resolves",
          message: `${fieldName} ${JSON.stringify(requirementId)} does not resolve to a supplied requirement declaration`,
          issues: input.issues
        });
      }
    }
  }
  checkRequirementRelationGraph({
    relations,
    issues: input.issues
  });

  for (const span of spans) {
    const vectorsForGraphFunction =
      vectorsByGraphFunctionRef.get(span.graphFunctionRef) ?? [];
    if (!input.graphFunctionRefs.has(span.graphFunctionRef)) {
      pushRowIssue({
        surfaceKind: "requirement_declaration",
        surfaceRef: span.spanId,
        ruleRef: "abg://gtl-program/requirements-algebra/graph-function-ref-resolves",
        message: `graphFunctionRef ${JSON.stringify(span.graphFunctionRef)} does not resolve to a published GraphFunction`,
        issues: input.issues
      });
    }
    if (span.graphVectorRefs.length === 0 && span.vectorIndexes.length === 0) {
      pushRowIssue({
        surfaceKind: "requirement_declaration",
        surfaceRef: span.spanId,
        ruleRef: "abg://gtl-program/requirements-algebra/span-vector-identity-required",
        message: "traversal span requires graphVectorRefs or vectorIndexes",
        issues: input.issues
      });
    }
    for (const graphVectorRef of span.graphVectorRefs) {
      if (!graphVectorRefs.has(graphVectorRef)) {
        pushRowIssue({
          surfaceKind: "requirement_declaration",
          surfaceRef: span.spanId,
          ruleRef: "abg://gtl-program/requirements-algebra/graph-vector-ref-resolves",
          message: `graphVectorRef ${JSON.stringify(graphVectorRef)} does not resolve to a supplied GraphVector`,
          issues: input.issues
        });
      }
    }
    for (const vectorIndex of span.vectorIndexes) {
      if (vectorsForGraphFunction[vectorIndex] === undefined) {
        pushRowIssue({
          surfaceKind: "requirement_declaration",
          surfaceRef: span.spanId,
          ruleRef: "abg://gtl-program/requirements-algebra/vector-index-resolves",
          message: `vectorIndexes contains ${vectorIndex}, but graphFunctionRef ${JSON.stringify(span.graphFunctionRef)} does not have that vector index`,
          issues: input.issues
        });
      }
    }
    const matchingVectors = input.vectors.filter((vector) =>
      spanMatchesVector(span, vector)
    );
    if (matchingVectors.length === 0) {
      pushRowIssue({
        surfaceKind: "requirement_declaration",
        surfaceRef: span.spanId,
        ruleRef: "abg://gtl-program/requirements-algebra/span-matches-vector",
        message: "traversal span does not match any supplied graph vector identity",
        issues: input.issues
      });
    }
    const rangeVectors = matchingVectors.filter((vector) =>
      spanCoversVectorIndexRange(span, vector)
    );
    if (rangeVectors.length > 0) {
      if (!rangeVectors.some((vector) => vectorSourceMatchesSpan(span, vector))) {
        pushRowIssue({
          surfaceKind: "requirement_declaration",
          surfaceRef: span.spanId,
          ruleRef: "abg://gtl-program/requirements-algebra/span-range-source-node-ref",
          message: `sourceNodeRef ${JSON.stringify(span.sourceNodeRef)} does not match any source asset or contract in the declared vector index range`,
          issues: input.issues
        });
      }
      if (!rangeVectors.some((vector) => vectorTargetMatchesSpan(span, vector))) {
        pushRowIssue({
          surfaceKind: "requirement_declaration",
          surfaceRef: span.spanId,
          ruleRef: "abg://gtl-program/requirements-algebra/span-range-target-node-ref",
          message: `targetNodeRef ${JSON.stringify(span.targetNodeRef)} does not match any target asset or contract in the declared vector index range`,
          issues: input.issues
        });
      }
    }
    for (const vector of matchingVectors) {
      if (rangeVectors.includes(vector)) {
        continue;
      }
      if (!vectorSourceMatchesSpan(span, vector)) {
        pushRowIssue({
          surfaceKind: "requirement_declaration",
          surfaceRef: span.spanId,
          ruleRef: "abg://gtl-program/requirements-algebra/span-source-node-ref",
          message: `sourceNodeRef ${JSON.stringify(span.sourceNodeRef)} does not match source assets or contracts for graph vector ${JSON.stringify(vector.vectorRef)}`,
          issues: input.issues
        });
      }
      if (!vectorTargetMatchesSpan(span, vector)) {
        pushRowIssue({
          surfaceKind: "requirement_declaration",
          surfaceRef: span.spanId,
          ruleRef: "abg://gtl-program/requirements-algebra/span-target-node-ref",
          message: `targetNodeRef ${JSON.stringify(span.targetNodeRef)} does not match target asset or contract for graph vector ${JSON.stringify(vector.vectorRef)}`,
          issues: input.issues
        });
      }
    }
  }

  for (const fragment of contextFragments) {
    checkDigestField({
      surfaceKind: "requirement_declaration",
      surfaceRef: fragment.fragmentRef,
      ruleRef: "abg://gtl-program/requirements-algebra/context-fragment-digest",
      fieldName: "digest",
      value: fragment.digest,
      issues: input.issues
    });
    checkNonEmptyArray({
      surfaceKind: "requirement_declaration",
      surfaceRef: fragment.fragmentRef,
      ruleRef: "abg://gtl-program/requirements-algebra/context-applies-to",
      fieldName: "appliesToRefs",
      values: fragment.appliesToRefs,
      issues: input.issues
    });
    if (!GTL_REQUIREMENTS_CONTEXT_PROMOTION_POLICY_REFS.has(fragment.promotionPolicyRef)) {
      pushRowIssue({
        surfaceKind: "requirement_declaration",
        surfaceRef: fragment.fragmentRef,
        ruleRef: "abg://gtl-program/requirements-algebra/context-promotion-policy-admitted",
        message: `promotionPolicyRef ${JSON.stringify(fragment.promotionPolicyRef)} is not an admitted requirements-algebra promotion policy`,
        issues: input.issues
      });
    }
    for (const appliesToRef of fragment.appliesToRefs) {
      if (
        !refResolvesToRequirementSurface({
          ref: appliesToRef,
          requirementIds,
          spanIds,
          contextRefs,
          topologyRefs,
          evidencePolicyRefs,
          graphFunctionRefs: input.graphFunctionRefs,
          graphVectorRefs
        })
      ) {
        pushRowIssue({
          surfaceKind: "requirement_declaration",
          surfaceRef: fragment.fragmentRef,
          ruleRef: "abg://gtl-program/requirements-algebra/context-applies-to-resolves",
          message: `appliesToRef ${JSON.stringify(appliesToRef)} does not resolve to a supplied requirement, span, context, topology, GraphFunction, GraphVector, or evidence policy`,
          issues: input.issues
        });
      }
    }
  }

  for (const topology of destinationTopologies) {
    checkNonEmptyArray({
      surfaceKind: "requirement_declaration",
      surfaceRef: topology.topologyRef,
      ruleRef: "abg://gtl-program/requirements-algebra/topology-constraints",
      fieldName: "constraintRefs",
      values: topology.constraintRefs,
      issues: input.issues
    });
    for (const constraintRef of topology.constraintRefs) {
      if (
        !refResolvesToRequirementSurface({
          ref: constraintRef,
          requirementIds,
          spanIds,
          contextRefs,
          topologyRefs,
          evidencePolicyRefs,
          graphFunctionRefs: input.graphFunctionRefs,
          graphVectorRefs
        })
      ) {
        pushRowIssue({
          surfaceKind: "requirement_declaration",
          surfaceRef: topology.topologyRef,
          ruleRef: "abg://gtl-program/requirements-algebra/topology-constraint-ref-resolves",
          message: `constraintRef ${JSON.stringify(constraintRef)} does not resolve to a supplied requirement, span, context, topology, GraphFunction, GraphVector, or evidence policy`,
          issues: input.issues
        });
      }
    }
    checkNonEmptyArray({
      surfaceKind: "requirement_declaration",
      surfaceRef: topology.topologyRef,
      ruleRef: "abg://gtl-program/requirements-algebra/topology-applies-to",
      fieldName: "appliesToRefs",
      values: topology.appliesToRefs,
      issues: input.issues
    });
    for (const appliesToRef of topology.appliesToRefs) {
      if (
        !refResolvesToRequirementSurface({
          ref: appliesToRef,
          requirementIds,
          spanIds,
          contextRefs,
          topologyRefs,
          evidencePolicyRefs,
          graphFunctionRefs: input.graphFunctionRefs,
          graphVectorRefs
        })
      ) {
        pushRowIssue({
          surfaceKind: "requirement_declaration",
          surfaceRef: topology.topologyRef,
          ruleRef: "abg://gtl-program/requirements-algebra/topology-applies-to-resolves",
          message: `appliesToRef ${JSON.stringify(appliesToRef)} does not resolve to a supplied requirement, span, context, GraphFunction, or GraphVector`,
          issues: input.issues
        });
      }
    }
  }

  for (const testRelation of testRelations) {
    if (!requirementIds.has(testRelation.requirementId)) {
      pushRowIssue({
        surfaceKind: "requirement_declaration",
        surfaceRef: testRelation.relationRef,
        ruleRef: "abg://gtl-program/requirements-algebra/test-requirement-ref-resolves",
        message: `requirementId ${JSON.stringify(testRelation.requirementId)} does not resolve to a supplied requirement declaration`,
        issues: input.issues
      });
    }
    const requirement = requirementById.get(testRelation.requirementId);
    if (
      requirement !== undefined &&
      !requirement.evidencePolicyRefs.includes(testRelation.evidencePolicyRef)
    ) {
      pushRowIssue({
        surfaceKind: "requirement_declaration",
        surfaceRef: testRelation.relationRef,
        ruleRef: "abg://gtl-program/requirements-algebra/test-evidence-policy-ref-resolves",
        message: `evidencePolicyRef ${JSON.stringify(testRelation.evidencePolicyRef)} does not resolve to the owning requirement evidence policies`,
        issues: input.issues
      });
    }
    for (const [fieldName, value] of [
      ["assetProjectionRef", testRelation.assetProjectionRef],
      ["testSourceProjectionRef", testRelation.testSourceProjectionRef],
      ["testExecutionProjectionRef", testRelation.testExecutionProjectionRef],
      ["interpretationProjectionRef", testRelation.interpretationProjectionRef]
    ] as const) {
      checkRequirementProjectionRef({
        surfaceRef: testRelation.relationRef,
        fieldName,
        value,
        issues: input.issues
      });
    }
    checkNonEmptyArray({
      surfaceKind: "requirement_declaration",
      surfaceRef: testRelation.relationRef,
      ruleRef: "abg://gtl-program/requirements-algebra/test-root-coverage",
      fieldName: "componentTestRootRefs",
      values: testRelation.componentTestRootRefs,
      issues: input.issues
    });
  }
}

function constructTraversalUnitProjection(input: {
  readonly subjectRef: string;
  readonly graphFunctions: readonly GraphFunction[];
  readonly vectors: readonly GraphVectorProjection[];
  readonly targetCarrierContracts: readonly GtlProgramTargetCarrierRow[];
  readonly edgeClosureContracts: readonly GtlProgramEdgeClosureRow[];
  readonly computeCompositions: readonly GtlProgramComputeCompositionRow[];
  readonly computeStageBindings: readonly GtlProgramComputeStageBindingRow[];
  readonly pluginResultInterfaces: readonly GtlProgramPluginResultInterfaceRow[];
  readonly traversalBindConservation:
    readonly GtlProgramTraversalBindConservationRow[];
  readonly requirementsAlgebraProjection: GtlProgramRequirementsAlgebraProjection;
  readonly overlays: readonly GtlProgramOverlayRow[];
  readonly publicStartTargets: readonly GtlProgramPublicStartRow[];
}): GtlProgramTraversalUnitProjection {
  const targetCarrierByIdentity = graphVectorRowsByIdentity(
    input.targetCarrierContracts
  );
  const edgeClosureByIdentity = graphVectorRowsByIdentity(
    input.edgeClosureContracts
  );
  const conservationByIdentity = graphVectorRowsByIdentity(
    input.traversalBindConservation
  );
  const catalogsByIdentity = consequenceCatalogsByVectorIdentity(
    input.graphFunctions
  );
  const units = Object.freeze(
    input.vectors.map((vector) => {
      const vectorKey = graphVectorIdentityKey(vector);
      const targetCarriers = targetCarrierByIdentity.get(vectorKey) ?? [];
      const edgeClosures = edgeClosureByIdentity.get(vectorKey) ?? [];
      const conservationRows = conservationByIdentity.get(vectorKey) ?? [];
      const targetCarrierContractRefs = Object.freeze(
        targetCarriers.map((row) => row.targetCarrierContractRef)
      );
      const materializationPolicyRefs = uniqueSorted(
        targetCarriers.map((row) => row.materializationPolicyRef)
      );
      const edgeClosureRefs = Object.freeze(
        edgeClosures.map((row) => row.edgeRef)
      );
      const compositions = input.computeCompositions.filter((composition) =>
        compositionHostsTraversalUnit({ composition, vector })
      );
      const compositionRefs = uniqueSorted(
        compositions.map((composition) => composition.compositionRef)
      );
      const compositionRefSet = new Set(compositionRefs);
      const stageBindings = input.computeStageBindings.filter((stageBinding) =>
        compositionRefSet.has(stageBinding.compositionRef)
      );
      const stageBindingRefs = uniqueSorted(
        stageBindings.map((stageBinding) => stageBinding.stageBindingRef)
      );
      const stageBindingRefSet = new Set(stageBindingRefs);
      const pluginResultInterfaces = input.pluginResultInterfaces.filter((row) =>
        stageBindingRefSet.has(row.stageBindingRef)
      );
      const pluginResultInterfaceRefs = uniqueSorted(
        pluginResultInterfaces.map((row) => row.resultInterfaceRef)
      );
      const consequencePluginResultInterfaceRefs = uniqueSorted(
        pluginResultInterfaces
          .filter((row) => row.stageRole === "consequence")
          .map((row) => row.resultInterfaceRef)
      );
      const catalog = catalogsByIdentity.get(vectorKey) ?? null;
      const requirementRows =
        input.requirementsAlgebraProjection.edgeRows.filter(
          (row) => row.unitRef === traversalUnitRef(vector)
        );
      return Object.freeze({
        kind: "gtl_program_traversal_unit_projection_row" as const,
        unitRef: traversalUnitRef(vector),
        graphFunctionRef: vector.graphFunctionRef,
        graphFunctionId: vector.graphFunctionId,
        graphRef: vector.graphRef,
        graphId: vector.graphId,
        graphVectorRef: vector.vectorRef,
        graphVectorId: vector.graphVectorId,
        sourceAssetTypes: vector.sourceAssetTypes,
        targetAssetType: vector.targetAssetType,
        targetCarrierContractRef:
          targetCarriers.length === 1
            ? targetCarriers[0]!.targetCarrierContractRef
            : null,
        targetCarrierContractRefs,
        materializationPolicyRefs,
        edgeClosureRef:
          edgeClosures.length === 1 ? edgeClosures[0]!.edgeRef : null,
        edgeClosureRefs,
        computeCompositionRefs: compositionRefs,
        computeStageBindingRefs: stageBindingRefs,
        pluginResultInterfaceRefs,
        consequencePluginResultInterfaceRefs,
        conservationBasisRef:
          conservationRows.length === 1
            ? conservationRows[0]!.conservationRef
            : null,
        conservationBasisRefs: uniqueSorted(
          conservationRows.map((row) => row.conservationRef)
        ),
        intentLineageRefs: uniqueSorted(
          conservationRows.flatMap((row) => row.intentLineageRefs)
        ),
        targetCarrierBindingRefs: uniqueSorted(
          conservationRows.flatMap((row) => row.targetCarrierBindingRefs)
        ),
        materializationBindingRefs: uniqueSorted(
          conservationRows.flatMap((row) => row.materializationBindingRefs)
        ),
        carriedObligationRefs: uniqueSorted(
          conservationRows.flatMap((row) => row.carriedObligationRefs)
        ),
        residualPressureRefs: uniqueSorted(
          conservationRows.flatMap((row) => row.residualPressureRefs)
        ),
        stagedAuthorityRefs: uniqueSorted(
          conservationRows.flatMap((row) => row.stagedAuthorityRefs)
        ),
        admissionStrengthRefs: uniqueSorted(
          conservationRows.flatMap((row) => row.admissionStrengthRefs)
        ),
        downstreamTerminalPressureRefs: uniqueSorted(
          conservationRows.flatMap((row) => row.downstreamTerminalPressureRefs)
        ),
        requirementRefs: uniqueSorted(
          requirementRows.flatMap((row) => row.requirementIds)
        ),
        requirementSpanRefs: uniqueSorted(
          requirementRows.flatMap((row) => row.spanRefs)
        ),
        requirementTestRelationRefs: uniqueSorted(
          requirementRows.flatMap((row) => row.testRelationRefs)
        ),
        requirementEvidencePolicyRefs: uniqueSorted(
          requirementRows.flatMap((row) => row.evidencePolicyRefs)
        ),
        allowedObligationDeltaFamilies: Object.freeze(
          [
            ...new Set(
              conservationRows.flatMap((row) =>
                row.allowedObligationDeltaFamilies
              )
            )
          ].sort()
        ),
        allowedConsequenceTraversalCatalogRef: catalog?.catalogRef ?? null,
        allowedConsequenceTraversalFamilies: Object.freeze(
          [
            ...new Set(
              (catalog?.rows ?? []).map((row) => row.traversalFamily)
            )
          ].sort()
        ),
        allowedConsequenceTraversalRowRefs: uniqueSorted(
          (catalog?.rows ?? []).map((row) => row.rowRef)
        )
      });
    })
  );
  const unitRefsByGraphFunction = new Map<string, string[]>();
  for (const unit of units) {
    for (const graphFunctionRef of [
      unit.graphFunctionRef,
      unit.graphFunctionId
    ]) {
      unitRefsByGraphFunction.set(graphFunctionRef, [
        ...(unitRefsByGraphFunction.get(graphFunctionRef) ?? []),
        unit.unitRef
      ]);
    }
  }
  const overlayByRef = new Map(
    input.overlays.map((overlay) => [overlay.overlayRef, overlay])
  );
  const candidateEntryUnitRefs = (target: GtlProgramPublicStartRow) => {
    const graphFunctionUnitRefs = unitRefsByGraphFunction.get(
      target.graphFunctionRef
    ) ?? [];
    if (target.overlayRefs.length === 0) {
      return uniqueSorted(graphFunctionUnitRefs);
    }
    const overlayGraphVectorRefs = new Set<string>();
    for (const overlayRef of target.overlayRefs) {
      const overlay = overlayByRef.get(overlayRef);
      if (overlay === undefined) {
        continue;
      }
      for (const graphVectorRef of overlay.graphVectorRefs) {
        overlayGraphVectorRefs.add(graphVectorRef);
      }
    }
    if (overlayGraphVectorRefs.size === 0) {
      return uniqueSorted(graphFunctionUnitRefs);
    }
    return uniqueSorted(
      units
        .filter((unit) =>
          (unit.graphFunctionRef === target.graphFunctionRef ||
            unit.graphFunctionId === target.graphFunctionRef) &&
          (overlayGraphVectorRefs.has(unit.graphVectorRef) ||
            overlayGraphVectorRefs.has(unit.graphVectorId))
        )
        .map((unit) => unit.unitRef)
    );
  };
  const entryUnits = Object.freeze(
    input.publicStartTargets.map((target) =>
      Object.freeze({
        kind: "gtl_program_traversal_entry_unit_projection_row" as const,
        publicStartRef: target.name,
        graphFunctionRef: target.graphFunctionRef,
        overlayRefs: target.overlayRefs,
        entryUnitRefs: candidateEntryUnitRefs(target)
      })
    )
  );
  return Object.freeze({
    kind: "gtl_program_traversal_unit_projection" as const,
    subjectRef: input.subjectRef,
    units,
    entryUnits
  });
}

const REQUIRED_OBLIGATION_DELTA_FAMILIES:
  readonly GtlProgramObligationDeltaFamily[] =
    GTL_PROGRAM_OBLIGATION_DELTA_FAMILY_VALUES;

function missingRefs(input: {
  readonly actual: readonly string[];
  readonly required: readonly string[];
}): readonly string[] {
  const actualSet = new Set(input.actual);
  return Object.freeze(
    input.required.filter((ref) => !actualSet.has(ref))
  );
}

function checkTraversalUnitProjection(input: {
  readonly projection: GtlProgramTraversalUnitProjection;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  for (const unit of input.projection.units) {
    if (unit.targetCarrierContractRefs.length === 0) {
      pushRowIssue({
        surfaceKind: "traversal_unit",
        surfaceRef: unit.unitRef,
        ruleRef: "abg://gtl-program/traversal-unit/target-carrier-required",
        message: `TraversalUnit ${JSON.stringify(unit.unitRef)} is not closeable without target-carrier truth for graph vector ${JSON.stringify(unit.graphVectorRef)}`,
        evidenceRefs: [
          unit.graphFunctionRef,
          unit.graphVectorRef
        ],
        issues: input.issues
      });
    } else if (unit.targetCarrierContractRefs.length > 1) {
      pushRowIssue({
        surfaceKind: "traversal_unit",
        surfaceRef: unit.unitRef,
        ruleRef: "abg://gtl-program/traversal-unit/target-carrier-ambiguous",
        message: `TraversalUnit ${JSON.stringify(unit.unitRef)} has ${unit.targetCarrierContractRefs.length} target-carrier candidates for graph vector ${JSON.stringify(unit.graphVectorRef)}`,
        evidenceRefs: [
          unit.graphFunctionRef,
          unit.graphVectorRef,
          ...unit.targetCarrierContractRefs
        ],
        issues: input.issues
      });
    }
    if (unit.edgeClosureRefs.length === 0) {
      pushRowIssue({
        surfaceKind: "traversal_unit",
        surfaceRef: unit.unitRef,
        ruleRef: "abg://gtl-program/traversal-unit/edge-closure-required",
        message: `TraversalUnit ${JSON.stringify(unit.unitRef)} is not closeable without edge-closure truth for graph vector ${JSON.stringify(unit.graphVectorRef)}`,
        evidenceRefs: [
          unit.graphFunctionRef,
          unit.graphVectorRef
        ],
        issues: input.issues
      });
    } else if (unit.edgeClosureRefs.length > 1) {
      pushRowIssue({
        surfaceKind: "traversal_unit",
        surfaceRef: unit.unitRef,
        ruleRef: "abg://gtl-program/traversal-unit/edge-closure-ambiguous",
        message: `TraversalUnit ${JSON.stringify(unit.unitRef)} has ${unit.edgeClosureRefs.length} edge-closure candidates for graph vector ${JSON.stringify(unit.graphVectorRef)}`,
        evidenceRefs: [
          unit.graphFunctionRef,
          unit.graphVectorRef,
          ...unit.edgeClosureRefs
        ],
        issues: input.issues
      });
    }
    if (unit.computeCompositionRefs.length === 0) {
      pushRowIssue({
        surfaceKind: "traversal_unit",
        surfaceRef: unit.unitRef,
        ruleRef: "abg://gtl-program/traversal-unit/compute-composition-required",
        message: `TraversalUnit ${JSON.stringify(unit.unitRef)} is not closeable without a selected compute composition`,
        evidenceRefs: [
          unit.graphFunctionRef,
          unit.graphVectorRef
        ],
        issues: input.issues
      });
    }
    if (unit.computeStageBindingRefs.length === 0) {
      pushRowIssue({
        surfaceKind: "traversal_unit",
        surfaceRef: unit.unitRef,
        ruleRef: "abg://gtl-program/traversal-unit/stage-binding-required",
        message: `TraversalUnit ${JSON.stringify(unit.unitRef)} is not closeable without selected compute stage bindings`,
        evidenceRefs: [
          unit.graphFunctionRef,
          unit.graphVectorRef,
          ...unit.computeCompositionRefs
        ],
        issues: input.issues
      });
    }
    if (unit.pluginResultInterfaceRefs.length === 0) {
      pushRowIssue({
        surfaceKind: "traversal_unit",
        surfaceRef: unit.unitRef,
        ruleRef: "abg://gtl-program/traversal-unit/plugin-result-interface-required",
        message: `TraversalUnit ${JSON.stringify(unit.unitRef)} is not closeable without plugin result-interface truth`,
        evidenceRefs: [
          unit.graphFunctionRef,
          unit.graphVectorRef,
          ...unit.computeStageBindingRefs
        ],
        issues: input.issues
      });
    }
    if (unit.consequencePluginResultInterfaceRefs.length === 0) {
      pushRowIssue({
        surfaceKind: "traversal_unit",
        surfaceRef: unit.unitRef,
        ruleRef: "abg://gtl-program/traversal-unit/consequence-result-interface-required",
        message: `TraversalUnit ${JSON.stringify(unit.unitRef)} is not a bind boundary unless consequence.C output is declared as plugin result-interface truth`,
        evidenceRefs: [
          unit.graphFunctionRef,
          unit.graphVectorRef,
          ...unit.pluginResultInterfaceRefs
        ],
        issues: input.issues
      });
    }
    if (unit.conservationBasisRefs.length === 0) {
      pushRowIssue({
        surfaceKind: "traversal_unit",
        surfaceRef: unit.unitRef,
        ruleRef: "abg://gtl-program/traversal-unit/bind-conservation-required",
        message: `TraversalUnit ${JSON.stringify(unit.unitRef)} cannot bind without declared intent-lineage and obligation conservation basis`,
        evidenceRefs: [
          unit.graphFunctionRef,
          unit.graphVectorRef
        ],
        issues: input.issues
      });
    } else if (unit.conservationBasisRefs.length > 1) {
      pushRowIssue({
        surfaceKind: "traversal_unit",
        surfaceRef: unit.unitRef,
        ruleRef: "abg://gtl-program/traversal-unit/bind-conservation-ambiguous",
        message: `TraversalUnit ${JSON.stringify(unit.unitRef)} has ${unit.conservationBasisRefs.length} conservation-basis candidates`,
        evidenceRefs: [
          unit.graphFunctionRef,
          unit.graphVectorRef,
          ...unit.conservationBasisRefs
        ],
        issues: input.issues
      });
    }
    const requiredConservationFields = [
      [
        "intent-lineage",
        unit.intentLineageRefs,
        "intent-lineage refs"
      ],
      [
        "target-carrier-binding",
        unit.targetCarrierBindingRefs,
        "target-carrier binding refs"
      ],
      [
        "materialization-binding",
        unit.materializationBindingRefs,
        "materialization binding refs"
      ],
      [
        "carried-obligation",
        unit.carriedObligationRefs,
        "carried obligation refs"
      ],
      [
        "residual-pressure",
        unit.residualPressureRefs,
        "residual pressure refs"
      ],
      [
        "staged-authority",
        unit.stagedAuthorityRefs,
        "staged authority refs"
      ],
      [
        "admission-strength",
        unit.admissionStrengthRefs,
        "admission strength refs"
      ],
      [
        "downstream-terminal-pressure",
        unit.downstreamTerminalPressureRefs,
        "downstream terminal pressure refs"
      ]
    ] as const;
    for (const [fieldKey, refs, label] of requiredConservationFields) {
      if (refs.length === 0) {
        pushRowIssue({
          surfaceKind: "traversal_unit",
          surfaceRef: unit.unitRef,
          ruleRef:
            `abg://gtl-program/traversal-unit/bind-conservation-${fieldKey}`,
          message: `TraversalUnit ${JSON.stringify(unit.unitRef)} conservation basis is missing ${label}`,
          evidenceRefs: [
            unit.graphFunctionRef,
            unit.graphVectorRef,
            ...unit.conservationBasisRefs
          ],
          issues: input.issues
        });
      }
    }
    const missingTargetCarrierBindings = missingRefs({
      actual: unit.targetCarrierBindingRefs,
      required: unit.targetCarrierContractRefs
    });
    if (missingTargetCarrierBindings.length > 0) {
      pushRowIssue({
        surfaceKind: "traversal_unit",
        surfaceRef: unit.unitRef,
        ruleRef:
          "abg://gtl-program/traversal-unit/bind-conservation-target-carrier-coverage",
        message: `TraversalUnit ${JSON.stringify(unit.unitRef)} conservation basis does not cover target-carrier refs ${missingTargetCarrierBindings.join(", ")}`,
        evidenceRefs: [
          unit.graphFunctionRef,
          unit.graphVectorRef,
          ...missingTargetCarrierBindings
        ],
        issues: input.issues
      });
    }
    const missingMaterializationBindings = missingRefs({
      actual: unit.materializationBindingRefs,
      required: unit.materializationPolicyRefs
    });
    if (missingMaterializationBindings.length > 0) {
      pushRowIssue({
        surfaceKind: "traversal_unit",
        surfaceRef: unit.unitRef,
        ruleRef:
          "abg://gtl-program/traversal-unit/bind-conservation-materialization-coverage",
        message: `TraversalUnit ${JSON.stringify(unit.unitRef)} conservation basis does not cover materialization refs ${missingMaterializationBindings.join(", ")}`,
        evidenceRefs: [
          unit.graphFunctionRef,
          unit.graphVectorRef,
          ...missingMaterializationBindings
        ],
        issues: input.issues
      });
    }
    const missingStageAuthorityRefs = missingRefs({
      actual: unit.stagedAuthorityRefs,
      required: unit.computeStageBindingRefs
    });
    if (missingStageAuthorityRefs.length > 0) {
      pushRowIssue({
        surfaceKind: "traversal_unit",
        surfaceRef: unit.unitRef,
        ruleRef:
          "abg://gtl-program/traversal-unit/bind-conservation-stage-coverage",
        message: `TraversalUnit ${JSON.stringify(unit.unitRef)} conservation basis does not cover compute stage refs ${missingStageAuthorityRefs.join(", ")}`,
        evidenceRefs: [
          unit.graphFunctionRef,
          unit.graphVectorRef,
          ...missingStageAuthorityRefs
        ],
        issues: input.issues
      });
    }
    if (
      unit.materializationPolicyRefs.length > 0 &&
      unit.computeStageBindingRefs.length > 0 &&
      unit.admissionStrengthRefs.length > 0 &&
      !unit.admissionStrengthRefs.includes(
        GTL_PROGRAM_BIND_ADMISSION_STRENGTH_COMPATIBILITY_REF
      )
    ) {
      pushRowIssue({
        surfaceKind: "traversal_unit",
        surfaceRef: unit.unitRef,
        ruleRef:
          "abg://gtl-program/traversal-unit/bind-conservation-admission-strength",
        message:
          `TraversalUnit ${JSON.stringify(unit.unitRef)} cannot expose staged authority and materialization binding through divergent admission predicates; conservation basis must include ${GTL_PROGRAM_BIND_ADMISSION_STRENGTH_COMPATIBILITY_REF}`,
        evidenceRefs: [
          unit.graphFunctionRef,
          unit.graphVectorRef,
          ...unit.conservationBasisRefs,
          ...unit.materializationPolicyRefs,
          ...unit.computeStageBindingRefs
        ],
        issues: input.issues
      });
    }
    const missingObligationDeltaFamilies = missingRefs({
      actual: unit.allowedObligationDeltaFamilies,
      required: REQUIRED_OBLIGATION_DELTA_FAMILIES
    });
    if (missingObligationDeltaFamilies.length > 0) {
      pushRowIssue({
        surfaceKind: "traversal_unit",
        surfaceRef: unit.unitRef,
        ruleRef:
          "abg://gtl-program/traversal-unit/obligation-delta-disposition-coverage",
        message: `TraversalUnit ${JSON.stringify(unit.unitRef)} conservation basis lacks obligation-delta dispositions ${missingObligationDeltaFamilies.join(", ")}`,
        evidenceRefs: [
          unit.graphFunctionRef,
          unit.graphVectorRef,
          ...unit.conservationBasisRefs
        ],
        issues: input.issues
      });
    }
  }
  for (const entry of input.projection.entryUnits) {
    if (entry.entryUnitRefs.length === 0) {
      pushRowIssue({
        surfaceKind: "traversal_unit",
        surfaceRef: entry.publicStartRef,
        ruleRef: "abg://gtl-program/traversal-unit/public-start-entry",
        message: `public start ${JSON.stringify(entry.publicStartRef)} does not resolve to any TraversalUnit for GraphFunction ${JSON.stringify(entry.graphFunctionRef)}`,
        evidenceRefs: [
          entry.graphFunctionRef,
          ...entry.overlayRefs
        ],
        issues: input.issues
      });
    }
  }
}

function checkVectorRows(input: {
  readonly vectors: readonly GraphVectorProjection[];
  readonly targetCarrierContracts: readonly GtlProgramTargetCarrierRow[];
  readonly edgeClosureContracts: readonly GtlProgramEdgeClosureRow[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const vectorByIdentity = new Map(
    input.vectors.map((vector) => [graphVectorIdentityKey(vector), vector])
  );
  const targetCarrierByIdentity = new Map<string, GtlProgramTargetCarrierRow[]>();
  for (const row of input.targetCarrierContracts) {
    const key = graphVectorIdentityKey(row);
    targetCarrierByIdentity.set(key, [
      ...(targetCarrierByIdentity.get(key) ?? []),
      row
    ]);
  }
  const edgeClosureByIdentity = new Map<string, GtlProgramEdgeClosureRow[]>();
  for (const row of input.edgeClosureContracts) {
    const key = graphVectorIdentityKey(row);
    edgeClosureByIdentity.set(key, [
      ...(edgeClosureByIdentity.get(key) ?? []),
      row
    ]);
  }

  for (const vector of input.vectors) {
    const vectorKey = graphVectorIdentityKey(vector);
    const vectorIdentity = graphVectorIdentityRef(vector);
    const targetCarriers = targetCarrierByIdentity.get(vectorKey) ?? [];
    if (targetCarriers.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "target_carrier_contract",
          surfaceRef: vectorIdentity,
          ruleRef: "abg://gtl-program/graph-vector/target-carrier-required",
          message: `GraphVector ${JSON.stringify(vectorIdentity)} has no target carrier contract row`
        })
      );
    } else if (targetCarriers.length > 1) {
      input.issues.push(
        issue({
          surfaceKind: "target_carrier_contract",
          surfaceRef: vectorIdentity,
          ruleRef: "abg://gtl-program/target-carrier/unique-vector-row",
          message: `GraphVector ${JSON.stringify(vectorIdentity)} has ${targetCarriers.length} target carrier rows`
        })
      );
    } else {
      const targetCarrier = targetCarriers[0]!;
      if (targetCarrier.graphVectorRef !== vector.vectorRef) {
        input.issues.push(
          issue({
            surfaceKind: "target_carrier_contract",
            surfaceRef: targetCarrier.edgeRef,
            ruleRef: "abg://gtl-program/target-carrier/vector-ref-match",
            message: `target carrier graphVectorRef ${JSON.stringify(targetCarrier.graphVectorRef)} does not match vector ${JSON.stringify(vector.vectorRef)}`
          })
        );
      }
      if (targetCarrier.targetAssetType !== vector.targetAssetType) {
        input.issues.push(
          issue({
            surfaceKind: "target_carrier_contract",
            surfaceRef: targetCarrier.edgeRef,
            ruleRef: "abg://gtl-program/target-carrier/target-asset-match",
            message: `target carrier target ${JSON.stringify(targetCarrier.targetAssetType)} does not match vector target ${JSON.stringify(vector.targetAssetType)}`
          })
        );
      }
      checkTargetCarrierContractLaw({
        row: targetCarrier,
        vector,
        issues: input.issues
      });
    }

    const edgeClosures = edgeClosureByIdentity.get(vectorKey) ?? [];
    if (edgeClosures.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "edge_closure_contract",
          surfaceRef: vectorIdentity,
          ruleRef: "abg://gtl-program/graph-vector/edge-closure-required",
          message: `GraphVector ${JSON.stringify(vectorIdentity)} has no edge closure contract row`
        })
      );
    } else if (edgeClosures.length > 1) {
      input.issues.push(
        issue({
          surfaceKind: "edge_closure_contract",
          surfaceRef: vectorIdentity,
          ruleRef: "abg://gtl-program/edge-closure/unique-vector-row",
          message: `GraphVector ${JSON.stringify(vectorIdentity)} has ${edgeClosures.length} edge closure rows`
        })
      );
    } else {
      const edgeClosure = edgeClosures[0]!;
      if (edgeClosure.targetAssetType !== vector.targetAssetType) {
      input.issues.push(
        issue({
          surfaceKind: "edge_closure_contract",
          surfaceRef: edgeClosure.edgeRef,
          ruleRef: "abg://gtl-program/edge-closure/target-asset-match",
          message: `edge closure target ${JSON.stringify(edgeClosure.targetAssetType)} does not match vector target ${JSON.stringify(vector.targetAssetType)}`
        })
      );
      }
    }
  }

  for (const row of input.targetCarrierContracts) {
    if (!vectorByIdentity.has(graphVectorIdentityKey(row))) {
      input.issues.push(
        issue({
          surfaceKind: "target_carrier_contract",
          surfaceRef: graphVectorIdentityRef({
            graphFunctionRef: row.edgeRef,
            graphRef: row.edgeRef,
            vectorRef: row.graphVectorRef,
            ...row
          }),
          ruleRef: "abg://gtl-program/target-carrier/no-orphan-row",
          message: `target carrier row ${JSON.stringify(row.edgeRef)} has no published graph vector identity`
        })
      );
    }
  }

  for (const row of input.edgeClosureContracts) {
    if (!vectorByIdentity.has(graphVectorIdentityKey(row))) {
      input.issues.push(
        issue({
          surfaceKind: "edge_closure_contract",
          surfaceRef: graphVectorIdentityRef({
            graphFunctionRef: row.edgeRef,
            graphRef: row.edgeRef,
            vectorRef: row.edgeRef,
            ...row
          }),
          ruleRef: "abg://gtl-program/edge-closure/no-orphan-row",
          message: `edge closure row ${JSON.stringify(row.edgeRef)} has no published graph vector identity`
        })
      );
    }
  }
}

function traversalBindConservationIdentityRef(
  row: GtlProgramTraversalBindConservationRow
): string {
  return graphVectorIdentityRef({
    graphFunctionRef: row.graphFunctionRef,
    graphRef: row.graphRef,
    vectorRef: row.graphVectorRef,
    graphFunctionId: row.graphFunctionId,
    graphId: row.graphId,
    graphVectorId: row.graphVectorId
  });
}

function checkTraversalBindConservationRows(input: {
  readonly vectors: readonly GraphVectorProjection[];
  readonly traversalBindConservation:
    readonly GtlProgramTraversalBindConservationRow[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const vectorByIdentity = new Map(
    input.vectors.map((vector) => [graphVectorIdentityKey(vector), vector])
  );
  const seenConservationRefs = new Map<
    string,
    GtlProgramTraversalBindConservationRow
  >();
  for (const row of input.traversalBindConservation) {
    const prior = seenConservationRefs.get(row.conservationRef);
    if (prior !== undefined) {
      input.issues.push(
        issue({
          surfaceKind: "traversal_unit",
          surfaceRef: row.conservationRef,
          ruleRef:
            "abg://gtl-program/traversal-bind-conservation/unique-conservation-ref",
          message: `traversal bind conservation row ${JSON.stringify(row.conservationRef)} is declared more than once`,
          evidenceRefs: [
            traversalBindConservationIdentityRef(prior),
            traversalBindConservationIdentityRef(row)
          ]
        })
      );
    } else {
      seenConservationRefs.set(row.conservationRef, row);
    }

    const vector = vectorByIdentity.get(graphVectorIdentityKey(row));
    if (vector === undefined) {
      input.issues.push(
        issue({
          surfaceKind: "traversal_unit",
          surfaceRef: row.conservationRef,
          ruleRef:
            "abg://gtl-program/traversal-bind-conservation/no-orphan-row",
          message: `traversal bind conservation row ${JSON.stringify(row.conservationRef)} has no published graph vector identity ${JSON.stringify(traversalBindConservationIdentityRef(row))}`,
          evidenceRefs: [
            row.graphFunctionRef,
            row.graphRef,
            row.graphVectorRef,
            row.graphFunctionId,
            row.graphId,
            row.graphVectorId
          ]
        })
      );
      continue;
    }

    if (row.graphFunctionRef !== vector.graphFunctionRef) {
      input.issues.push(
        issue({
          surfaceKind: "traversal_unit",
          surfaceRef: row.conservationRef,
          ruleRef:
            "abg://gtl-program/traversal-bind-conservation/graph-function-ref-match",
          message: `traversal bind conservation graphFunctionRef ${JSON.stringify(row.graphFunctionRef)} does not match published graph function ${JSON.stringify(vector.graphFunctionRef)}`,
          evidenceRefs: [row.graphFunctionId, vector.graphFunctionRef]
        })
      );
    }
    if (row.graphRef !== vector.graphRef) {
      input.issues.push(
        issue({
          surfaceKind: "traversal_unit",
          surfaceRef: row.conservationRef,
          ruleRef:
            "abg://gtl-program/traversal-bind-conservation/graph-ref-match",
          message: `traversal bind conservation graphRef ${JSON.stringify(row.graphRef)} does not match published graph ${JSON.stringify(vector.graphRef)}`,
          evidenceRefs: [row.graphId, vector.graphRef]
        })
      );
    }
    if (row.graphVectorRef !== vector.vectorRef) {
      input.issues.push(
        issue({
          surfaceKind: "traversal_unit",
          surfaceRef: row.conservationRef,
          ruleRef:
            "abg://gtl-program/traversal-bind-conservation/graph-vector-ref-match",
          message: `traversal bind conservation graphVectorRef ${JSON.stringify(row.graphVectorRef)} does not match published graph vector ${JSON.stringify(vector.vectorRef)}`,
          evidenceRefs: [row.graphVectorId, vector.vectorRef]
        })
      );
    }
  }
}

function checkOverlays(input: {
  readonly overlays: readonly GtlProgramOverlayRow[];
  readonly publicStartTargets: readonly GtlProgramPublicStartRow[];
  readonly graphFunctionRefs: ReadonlySet<string>;
  readonly graphFunctionEquivalentRefs: ReadonlyMap<string, ReadonlySet<string>>;
  readonly nodeTypeGraphFunctionRefs: ReadonlySet<string>;
  readonly graphVectorRefs: ReadonlySet<string>;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const overlayByRef = new Map(
    input.overlays.map((overlay) => [overlay.overlayRef, overlay])
  );
  const refsMatch = (left: string, right: string) =>
    left === right ||
    (input.graphFunctionEquivalentRefs.get(left)?.has(right) ?? false);
  const overlayRefsGraphFunction = (
    overlay: GtlProgramOverlayRow,
    graphFunctionRef: string
  ) =>
    overlay.graphFunctionRefs.some((overlayGraphFunctionRef) =>
      refsMatch(overlayGraphFunctionRef, graphFunctionRef)
    );
  const overlayTargetsGraphFunction = (
    overlay: GtlProgramOverlayRow,
    graphFunctionRef: string
  ) =>
    overlay.publicStartTargets.length === 0 ||
    overlay.publicStartTargets.some((publicStartTarget) =>
      refsMatch(publicStartTarget, graphFunctionRef)
    );
  for (const overlay of input.overlays) {
    for (const graphFunctionRef of overlay.graphFunctionRefs) {
      if (!input.graphFunctionRefs.has(graphFunctionRef)) {
        input.issues.push(
          issue({
            surfaceKind: "overlay",
            surfaceRef: overlay.overlayRef,
            ruleRef: "abg://gtl-program/overlay/graph-function-resolves",
            message: `overlay names unpublished GraphFunction ${JSON.stringify(graphFunctionRef)}`
          })
        );
      }
    }
    for (const graphVectorRef of overlay.graphVectorRefs) {
      if (!input.graphVectorRefs.has(graphVectorRef)) {
        input.issues.push(
          issue({
            surfaceKind: "overlay",
            surfaceRef: overlay.overlayRef,
            ruleRef: "abg://gtl-program/overlay/graph-vector-resolves",
            message: `overlay names unpublished GraphVector ${JSON.stringify(graphVectorRef)}`
          })
        );
      }
    }
    for (const target of overlay.publicStartTargets) {
      if (!input.graphFunctionRefs.has(target)) {
        input.issues.push(
          issue({
            surfaceKind: "overlay",
            surfaceRef: overlay.overlayRef,
            ruleRef: "abg://gtl-program/overlay/public-start-target-resolves",
            message: `overlay public start target ${JSON.stringify(target)} is not published`
          })
        );
      }
    }
    if (!input.graphFunctionRefs.has(overlay.defaultStartTarget)) {
      input.issues.push(
        issue({
          surfaceKind: "overlay",
          surfaceRef: overlay.overlayRef,
          ruleRef: "abg://gtl-program/overlay/default-start-target-resolves",
          message: `overlay default start target ${JSON.stringify(overlay.defaultStartTarget)} is not published`
        })
      );
    }
  }

  for (const target of input.publicStartTargets) {
    if (target.overlayRefs.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "public_start",
          surfaceRef: target.name,
          ruleRef: "abg://gtl-program/public-start/overlay-required",
          message: `public start ${JSON.stringify(target.name)} must enter through a GTL overlay or program composition; direct graph-function starts are not traversal parity`
        })
      );
    }
    if (!input.graphFunctionRefs.has(target.graphFunctionRef)) {
      input.issues.push(
        issue({
          surfaceKind: "public_start",
          surfaceRef: target.name,
          ruleRef: "abg://gtl-program/public-start/graph-function-resolves",
          message: `public start target names unpublished GraphFunction ${JSON.stringify(target.graphFunctionRef)}`
        })
      );
    }
    if (input.nodeTypeGraphFunctionRefs.has(target.graphFunctionRef)) {
      input.issues.push(
        issue({
          surfaceKind: "public_start",
          surfaceRef: target.name,
          ruleRef: "abg://gtl-program/public-start/node-type-not-callable",
          message: `public start target shall not bind node-type GraphFunction ${JSON.stringify(target.graphFunctionRef)} as callable work`
        })
      );
    }
    for (const overlayRef of target.overlayRefs) {
      const overlay = overlayByRef.get(overlayRef);
      if (overlay === undefined) {
        input.issues.push(
          issue({
            surfaceKind: "public_start",
            surfaceRef: target.name,
            ruleRef: "abg://gtl-program/public-start/overlay-resolves",
            message: `public start target names unpublished overlay ${JSON.stringify(overlayRef)}`
          })
        );
        continue;
      }
      if (
        !overlayRefsGraphFunction(overlay, target.graphFunctionRef) ||
        !overlayTargetsGraphFunction(overlay, target.graphFunctionRef)
      ) {
        input.issues.push(
          issue({
            surfaceKind: "public_start",
            surfaceRef: target.name,
            ruleRef:
              "abg://gtl-program/public-start/overlay-graph-function-compatible",
            message: `public start ${JSON.stringify(target.name)} attaches overlay ${JSON.stringify(overlayRef)} that does not admit GraphFunction ${JSON.stringify(target.graphFunctionRef)}`
          })
        );
      }
    }
    for (const overlayRef of target.defaultForOverlayRefs) {
      const overlay = overlayByRef.get(overlayRef);
      if (overlay === undefined) {
        input.issues.push(
          issue({
            surfaceKind: "public_start",
            surfaceRef: target.name,
            ruleRef: "abg://gtl-program/public-start/default-overlay-resolves",
            message: `public start target defaultFor names unpublished overlay ${JSON.stringify(overlayRef)}`
          })
        );
        continue;
      }
      if (!refsMatch(overlay.defaultStartTarget, target.graphFunctionRef)) {
        input.issues.push(
          issue({
            surfaceKind: "public_start",
            surfaceRef: target.name,
            ruleRef:
              "abg://gtl-program/public-start/default-overlay-start-compatible",
            message: `public start ${JSON.stringify(target.name)} claims default authority for overlay ${JSON.stringify(overlayRef)} whose default start is ${JSON.stringify(overlay.defaultStartTarget)}`
          })
        );
      }
    }
  }
}

function checkPromptAssets(input: {
  readonly promptAssets: readonly GtlProgramPromptAssetRow[];
  readonly abiPackageVersion: string;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  for (const row of input.promptAssets) {
    let admitted: AssetSurface;
    try {
      admitted = admitAssetSurface(row.assetSurface);
    } catch (error: unknown) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/asset-surface-admission",
          message: errorMessage(error),
          evidenceRefs: row.evidenceRefs
        })
      );
      continue;
    }

    if (admitted.rendererRefs.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/renderer-ref",
          message: "prompt assets require at least one renderer ref",
          evidenceRefs: row.evidenceRefs
        })
      );
    }
    if (admitted.renderedViewDigestPolicyRef === null) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/rendered-view-digest-policy",
          message: "prompt assets require renderedViewDigestPolicyRef",
          evidenceRefs: row.evidenceRefs
        })
      );
    }
    if (admitted.constructorRefs.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/constructor-ref",
          message: "prompt assets require at least one constructor ref",
          evidenceRefs: row.evidenceRefs
        })
      );
    }
    if (admitted.proofObligationRefs.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/proof-obligation",
          message: "prompt assets require at least one proof obligation ref",
          evidenceRefs: row.evidenceRefs
        })
      );
    }
    if (admitted.outputContractRefs.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/output-contract",
          message: "prompt assets require at least one output contract ref",
          evidenceRefs: row.evidenceRefs
        })
      );
    }
    if (admitted.authoritySlots.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/authority-slot",
          message: "prompt assets require at least one authority slot",
          evidenceRefs: row.evidenceRefs
        })
      );
    }
    if (row.gtlNode === undefined) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/gtl-node",
          message: "prompt assets require the GTL node that carries the admitted AssetSurface",
          evidenceRefs: row.evidenceRefs
        })
      );
    }

    if (
      (admitted.sectionKindRefs.length > 0 || admitted.clauseKindRefs.length > 0) &&
      admitted.rendererRefs.length === 0
    ) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/rendered-structure-has-renderer",
          message: "section or clause kind refs require a renderer ref",
          evidenceRefs: row.evidenceRefs
        })
      );
    }

    if (row.gtlNode !== undefined && stableJson(row.gtlNode.assetSurface) !== stableJson(admitted)) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/node-preserves-asset-surface",
          message: "prompt GTL node assetSurface does not match admitted prompt AssetSurface",
          evidenceRefs: row.evidenceRefs
        })
      );
    }

    if (row.renderedViewDigest === undefined || row.renderedViewDigest === null) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/rendered-view-digest",
          message: "prompt assets require a rendered prompt view digest",
          evidenceRefs: row.evidenceRefs
        })
      );
    } else if (!row.renderedViewDigest.startsWith("sha256:")) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/rendered-view-digest",
          message: "rendered prompt view digest must be a sha256: digest",
          evidenceRefs: row.evidenceRefs
        })
      );
    }

    if (row.evidenceRefs === undefined || row.evidenceRefs.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/evidence-ref",
          message: "prompt assets require evidence refs that bind the supplied row",
          evidenceRefs: row.evidenceRefs
        })
      );
    }

    for (const foldRef of row.currentAbgFoldRefs ?? []) {
      const packageMatch = foldRef.match(
        /@abiogenesis\/typescript-tenant@([^#\s]+)/u
      );
      if (packageMatch !== null && packageMatch[1] !== input.abiPackageVersion) {
        input.issues.push(
          issue({
            surfaceKind: "prompt_asset",
            surfaceRef: row.surfaceRef,
            ruleRef: "abg://gtl-program/prompt-asset/current-abg-fold-ref",
            message: `prompt fold ref ${JSON.stringify(foldRef)} does not use @abiogenesis/typescript-tenant@${input.abiPackageVersion}`,
            evidenceRefs: row.evidenceRefs
          })
        );
      }
    }
  }
}

function checkPluginContracts(input: {
  readonly pluginContracts: readonly unknown[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const refs = new Set<string>();
  for (const contractInput of input.pluginContracts) {
    let contract: EnginePluginContract;
    let surfaceRef = "unknown";
    if (
      typeof contractInput === "object" &&
      contractInput !== null &&
      "ref" in contractInput &&
      typeof contractInput.ref === "string"
    ) {
      surfaceRef = contractInput.ref;
    }
    try {
      contract = admitEnginePluginContract(contractInput);
    } catch (error: unknown) {
      input.issues.push(
        issue({
          surfaceKind: "plugin_contract",
          surfaceRef,
          ruleRef: "abg://gtl-program/plugin-contract/admission",
          message: errorMessage(error)
        })
      );
      continue;
    }
    if (refs.has(contract.ref)) {
      input.issues.push(
        issue({
          surfaceKind: "plugin_contract",
          surfaceRef: contract.ref,
          ruleRef: "abg://gtl-program/plugin-contract/unique-ref",
          message: `plugin contract ${JSON.stringify(contract.ref)} is declared more than once`
        })
      );
    }
    refs.add(contract.ref);
    if (
      contract.maySelectNextVector ||
      contract.mayEmitRuntimeEvents ||
      contract.mayCloseTraversal ||
      contract.mayOwnIterationLoop
    ) {
      input.issues.push(
        issue({
          surfaceKind: "plugin_contract",
          surfaceRef: contract.ref,
          ruleRef: "abg://gtl-program/plugin-contract/no-engine-authority",
          message: "plugin contracts must not own traversal, event, closure, or iteration authority"
        })
      );
    }
  }
}

function normalizedVersion(value: string): string {
  return value.replaceAll("_", ".").replaceAll("-", ".");
}

function pushStaleSourceIdentityIssue(input: {
  readonly surfaceRef: string;
  readonly lineNumber: number;
  readonly ruleRef: string;
  readonly message: string;
  readonly evidenceRefs: readonly string[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  input.issues.push(
    issue({
      surfaceKind: "source_identity",
      surfaceRef: `${input.surfaceRef}:${input.lineNumber}`,
      ruleRef: input.ruleRef,
      message: input.message,
      evidenceRefs: input.evidenceRefs
    })
  );
}

function scanStaleIdentityLine(input: {
  readonly line: string;
  readonly surfaceRef: string;
  readonly lineNumber: number;
  readonly abiPackageVersion: string;
  readonly evidenceRefs: readonly string[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const currentMajorMinor = input.abiPackageVersion.match(/^\d+\.\d+/u)?.[0] ?? "";
  const versionedAbgRefPattern =
    /\bABG[-_]?(\d+(?:[._]\d+){1,2})(?:[-_]?RC\d+)?\b/giu;
  for (const match of input.line.matchAll(versionedAbgRefPattern)) {
    const token = match[0];
    const version = normalizedVersion(match[1] ?? "");
    if (!version.startsWith(currentMajorMinor)) {
      pushStaleSourceIdentityIssue({
        ...input,
        ruleRef: "abg://gtl-program/source-identity/current-abg-version",
        message: `stale ABG identity ${JSON.stringify(token)} does not match ${input.abiPackageVersion}`
      });
    }
  }

  const spacedAbgRefPattern =
    /\bABG\s+(\d+(?:[._]\d+){1,2})(?:\s+RC\d+)?\b/giu;
  for (const match of input.line.matchAll(spacedAbgRefPattern)) {
    const token = match[0];
    const version = normalizedVersion(match[1] ?? "");
    if (!version.startsWith(currentMajorMinor)) {
      pushStaleSourceIdentityIssue({
        ...input,
        ruleRef: "abg://gtl-program/source-identity/current-abg-version",
        message: `stale ABG identity ${JSON.stringify(token)} does not match ${input.abiPackageVersion}`
      });
    }
  }

  const compactAbgRefPattern = /\bABG(\d)(\d)\b/giu;
  for (const match of input.line.matchAll(compactAbgRefPattern)) {
    const token = match[0];
    const version = `${match[1]}.${match[2]}`;
    if (version !== currentMajorMinor) {
      pushStaleSourceIdentityIssue({
        ...input,
        ruleRef: "abg://gtl-program/source-identity/current-compact-abg-version",
        message: `stale compact ABG identity ${JSON.stringify(token)} does not match ${input.abiPackageVersion}`
      });
    }
  }

  const uriAbgRefPatterns = Object.freeze([
    /\bruntime:\/\/abg\/(\d+(?:[._-]\d+){1,2})(?:\/[^\s'"`)<\]]*)?/giu,
    /\babg:\/\/(\d+(?:[._-]\d+){1,2})(?:\/[^\s'"`)<\]]*)?/giu,
    /\bruntime:\/\/abg-(\d+[-_]\d+(?:[-_]\d+)?)(?:[A-Za-z0-9._~-]*)?/giu
  ]);
  for (const pattern of uriAbgRefPatterns) {
    for (const match of input.line.matchAll(pattern)) {
      const token = match[0];
      const version = normalizedVersion(match[1] ?? "");
      if (!version.startsWith(currentMajorMinor)) {
        pushStaleSourceIdentityIssue({
          ...input,
          ruleRef: "abg://gtl-program/source-identity/current-abg-version",
          message: `stale ABG identity ${JSON.stringify(token)} does not match ${input.abiPackageVersion}`
        });
      }
    }
  }

  const abiogenesisPackageRefPattern =
    /@abiogenesis\/[A-Za-z0-9._-]+@(\d+\.\d+\.\d+(?:-[0-9A-Za-z][0-9A-Za-z.-]*)?)/gu;
  for (const match of input.line.matchAll(abiogenesisPackageRefPattern)) {
    const token = match[0];
    const version = match[1] ?? "";
    if (version !== input.abiPackageVersion) {
      pushStaleSourceIdentityIssue({
        ...input,
        ruleRef: "abg://gtl-program/source-identity/current-abi-package-version",
        message: `stale ABI package identity ${JSON.stringify(token)} does not match ${input.abiPackageVersion}`
      });
    }
  }

  const staleStagePatterns = Object.freeze([
    /\bRC3\b/u,
    /\brc3StageTruth\b/u,
    /\bRC3 Stage Truth\b/u,
    /\bRC3 selected composition drift\b/u,
    /\babg-3\.9-rc3\b/iu,
    /\b3\.9\.0-rc\.13\b/u,
    /\brc13\b/iu
  ]);
  for (const pattern of staleStagePatterns) {
    if (pattern.test(input.line)) {
      pushStaleSourceIdentityIssue({
        ...input,
        ruleRef: "abg://gtl-program/source-identity/stale-stage-label",
        message: `stale ABG migration or stage label matched ${pattern}`
      });
    }
  }
}

function checkSourceIdentities(input: {
  readonly sourceIdentitySurfaces: readonly GtlProgramSourceIdentityRow[];
  readonly abiPackageVersion: string;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  for (const surface of input.sourceIdentitySurfaces) {
    scanStaleIdentityLine({
      line: surface.surfaceRef,
      surfaceRef: surface.surfaceRef,
      lineNumber: 0,
      abiPackageVersion: input.abiPackageVersion,
      evidenceRefs: freezeStrings(surface.evidenceRefs),
      issues: input.issues
    });
    const lines = surface.text.split(/\r?\n/u);
    lines.forEach((line, index) => {
      scanStaleIdentityLine({
        line,
        surfaceRef: surface.surfaceRef,
        lineNumber: index + 1,
        abiPackageVersion: input.abiPackageVersion,
        evidenceRefs: freezeStrings(surface.evidenceRefs),
        issues: input.issues
      });
    });
  }
}

function sourceAuthorityPolicyApplies(input: {
  readonly policy: GtlProgramSourceAuthorityPolicyRow;
  readonly surface: GtlProgramSourceIdentityRow;
}): boolean {
  if (
    input.policy.sourceSurfaceRefs.length === 0 &&
    input.policy.sourceSurfaceRefPrefixes.length === 0
  ) {
    return true;
  }
  if (input.policy.sourceSurfaceRefs.includes(input.surface.surfaceRef)) {
    return true;
  }
  return input.policy.sourceSurfaceRefPrefixes.some((prefix) =>
    input.surface.surfaceRef.startsWith(prefix)
  );
}

function sourceAuthorityTokensMatch(input: {
  readonly text: string;
  readonly tokens: readonly string[];
  readonly mode: GtlProgramSourceAuthorityTokenMatchMode;
}): boolean {
  if (input.tokens.length === 0) {
    return false;
  }
  return input.mode === "all"
    ? input.tokens.every((token) => input.text.includes(token))
    : input.tokens.some((token) => input.text.includes(token));
}

function sourceAuthorityPolicyMitigated(input: {
  readonly text: string;
  readonly policy: GtlProgramSourceAuthorityPolicyRow;
}): boolean {
  return (
    input.policy.requiredMitigationTokens.length > 0 &&
    input.policy.requiredMitigationTokens.every((token) =>
      input.text.includes(token)
    )
  );
}

function checkSourceAuthorityPolicies(input: {
  readonly sourceIdentitySurfaces: readonly GtlProgramSourceIdentityRow[];
  readonly sourceAuthorityPolicies:
    readonly GtlProgramSourceAuthorityPolicyRow[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const sourceRefs = new Set(
    input.sourceIdentitySurfaces.map((surface) => surface.surfaceRef)
  );
  const policyRefs = new Set<string>();
  for (const policy of input.sourceAuthorityPolicies) {
    if (policyRefs.has(policy.policyRef)) {
      input.issues.push(
        issue({
          surfaceKind: "source_authority_policy",
          surfaceRef: policy.policyRef,
          ruleRef: "abg://gtl-program/source-authority-policy/unique-ref",
          message: `source authority policy ${JSON.stringify(policy.policyRef)} is declared more than once`,
          evidenceRefs: freezeStrings(policy.evidenceRefs)
        })
      );
    }
    policyRefs.add(policy.policyRef);
    if (policy.forbiddenTokens.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "source_authority_policy",
          surfaceRef: policy.policyRef,
          ruleRef: "abg://gtl-program/source-authority-policy/forbidden-token-required",
          message: `source authority policy ${JSON.stringify(policy.policyRef)} must declare at least one forbidden token`,
          evidenceRefs: freezeStrings(policy.evidenceRefs)
        })
      );
    }
    for (const surfaceRef of policy.sourceSurfaceRefs) {
      if (!sourceRefs.has(surfaceRef)) {
        input.issues.push(
          issue({
            surfaceKind: "source_authority_policy",
            surfaceRef: policy.policyRef,
            ruleRef: "abg://gtl-program/source-authority-policy/source-surface-ref-resolves",
            message: `source authority policy ${JSON.stringify(policy.policyRef)} targets unknown source surface ${JSON.stringify(surfaceRef)}`,
            evidenceRefs: freezeStrings(policy.evidenceRefs)
          })
        );
      }
    }
    for (const prefix of policy.sourceSurfaceRefPrefixes) {
      if (
        !input.sourceIdentitySurfaces.some((surface) =>
          surface.surfaceRef.startsWith(prefix)
        )
      ) {
        input.issues.push(
          issue({
            surfaceKind: "source_authority_policy",
            surfaceRef: policy.policyRef,
            ruleRef: "abg://gtl-program/source-authority-policy/source-surface-prefix-resolves",
            message: `source authority policy ${JSON.stringify(policy.policyRef)} targets unknown source surface prefix ${JSON.stringify(prefix)}`,
            evidenceRefs: freezeStrings(policy.evidenceRefs)
          })
        );
      }
    }
    for (const surface of input.sourceIdentitySurfaces) {
      if (!sourceAuthorityPolicyApplies({ policy, surface })) {
        continue;
      }
      if (
        !sourceAuthorityTokensMatch({
          text: surface.text,
          tokens: policy.forbiddenTokens,
          mode: policy.forbiddenMatch
        }) ||
        sourceAuthorityPolicyMitigated({ text: surface.text, policy })
      ) {
        continue;
      }
      input.issues.push(
        issue({
          surfaceKind: "source_authority_policy",
          surfaceRef: surface.surfaceRef,
          ruleRef: policy.policyRef,
          message: policy.message,
          evidenceRefs: uniqueSorted([
            surface.surfaceRef,
            ...freezeStrings(surface.evidenceRefs),
            ...freezeStrings(policy.evidenceRefs)
          ])
        })
      );
    }
  }
}

function checkSemanticReviewGates(input: {
  readonly subjectRef: string;
  readonly semanticReviewGates: readonly GtlProgramSemanticReviewGateRow[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const refs = new Set<string>();
  for (const gate of input.semanticReviewGates) {
    if (refs.has(gate.gateRef)) {
      input.issues.push(
        issue({
          surfaceKind: "semantic_review_gate",
          surfaceRef: gate.gateRef,
          ruleRef: "abg://gtl-program/semantic-review-gate/unique-ref",
          message: `semantic review gate ${JSON.stringify(gate.gateRef)} is declared more than once`,
          evidenceRefs: gate.evidenceRefs
        })
      );
    }
    refs.add(gate.gateRef);
    if (gate.subjectRef !== input.subjectRef) {
      input.issues.push(
        issue({
          surfaceKind: "semantic_review_gate",
          surfaceRef: gate.gateRef,
          ruleRef: "abg://gtl-program/semantic-review-gate/subject-ref",
          message: `semantic review gate subjectRef ${JSON.stringify(gate.subjectRef)} does not match program subjectRef ${JSON.stringify(input.subjectRef)}`,
          evidenceRefs: gate.evidenceRefs
        })
      );
    }
    if (!gate.deterministicReportDigest.startsWith("sha256:")) {
      input.issues.push(
        issue({
          surfaceKind: "semantic_review_gate",
          surfaceRef: gate.gateRef,
          ruleRef: "abg://gtl-program/semantic-review-gate/deterministic-report-digest",
          message: "semantic review gate deterministicReportDigest must be a sha256: digest",
          evidenceRefs: gate.evidenceRefs
        })
      );
    }
    if (!gate.sourcePackageDigest.startsWith("sha256:")) {
      input.issues.push(
        issue({
          surfaceKind: "semantic_review_gate",
          surfaceRef: gate.gateRef,
          ruleRef: "abg://gtl-program/semantic-review-gate/source-package-digest",
          message: "semantic review gate sourcePackageDigest must be a sha256: digest",
          evidenceRefs: gate.evidenceRefs
        })
      );
    }
    if (
      gate.reviewResultKind !== ABG_SEMANTIC_COMPILER_FP_REVIEW_RESULT_KIND ||
      gate.reviewVersion !== ABG_SEMANTIC_COMPILER_FP_REVIEW_RESULT_VERSION
    ) {
      input.issues.push(
        issue({
          surfaceKind: "semantic_review_gate",
          surfaceRef: gate.gateRef,
          ruleRef: "abg://gtl-program/semantic-review-gate/admitted-result-kind",
          message: "semantic review gate must carry an admitted T-162 semantic compiler F_P review result",
          evidenceRefs: gate.evidenceRefs
        })
      );
    }
    if (
      gate.workerControlContractRef !==
        ABG_SEMANTIC_COMPILER_FP_REVIEW_WORKER_CONTROL_CONTRACT_REF ||
      gate.requiredArtifactDeltaKind !==
        ABG_SEMANTIC_COMPILER_FP_REVIEW_REQUIRED_ARTIFACT_DELTA_KIND ||
      gate.authorityPacketRef.length === 0 ||
      gate.objectiveRef.length === 0 ||
      gate.targetArtifactRef.length === 0 ||
      gate.toolBoundaryRefs.length === 0 ||
      gate.stopConditionRef.length === 0
    ) {
      input.issues.push(
        issue({
          surfaceKind: "semantic_review_gate",
          surfaceRef: gate.gateRef,
          ruleRef: "abg://gtl-program/semantic-review-gate/t162-worker-control",
          message: "semantic review gate must carry the T-162 constrained F_P.worker control contract",
          evidenceRefs: gate.evidenceRefs
        })
      );
    }
    if (
      gate.fdPackageGrammarRef !==
        ABG_SEMANTIC_COMPILER_FP_REVIEW_PACKAGE_GRAMMAR_REF ||
      gate.fdResultGrammarRef !==
        ABG_SEMANTIC_COMPILER_FP_REVIEW_RESULT_GRAMMAR_REF ||
      gate.fdProgressTelemetryGrammarRef !==
        ABG_SEMANTIC_COMPILER_FP_REVIEW_PROGRESS_TELEMETRY_GRAMMAR_REF ||
      gate.fdProgressMetricRef !==
        ABG_SEMANTIC_COMPILER_FP_REVIEW_PROGRESS_METRIC_REF ||
      gate.fdAdmissionFsmRef !==
        ABG_SEMANTIC_COMPILER_FP_REVIEW_ADMISSION_FSM_REF ||
      gate.fdOutputStateEnumRef !==
        ABG_SEMANTIC_COMPILER_FP_REVIEW_OUTPUT_STATE_ENUM_REF ||
      gate.fdDerivationRuleRef !==
        ABG_SEMANTIC_COMPILER_FP_REVIEW_DERIVATION_RULE_REF ||
      gate.fdForbiddenInterpretation !==
        ABG_SEMANTIC_COMPILER_FP_REVIEW_FD_FORBIDDEN_INTERPRETATION
    ) {
      input.issues.push(
        issue({
          surfaceKind: "semantic_review_gate",
          surfaceRef: gate.gateRef,
          ruleRef: "abg://gtl-program/semantic-review-gate/t162-fd-finite-surface",
          message: "semantic review gate must carry declared F_D grammar, metric, FSM, output enum, derivation, and forbidden interpretation",
          evidenceRefs: gate.evidenceRefs
        })
      );
    }
    if (
      gate.producerGraphFunctionRef !==
        ABG_SEMANTIC_COMPILER_FP_REVIEW_GRAPH_FUNCTION_REF ||
      gate.producerGraphFunctionDigest !==
        abgSemanticCompilerFpReviewGraphFunctionDigest() ||
      gate.producerRuntimeKind !==
        ABG_SEMANTIC_COMPILER_FP_REVIEW_RUNTIME_KIND ||
      gate.producerRuntimeRef !==
        ABG_SEMANTIC_COMPILER_FP_REVIEW_RUNTIME_REF ||
      gate.admissionRef !== ABG_SEMANTIC_COMPILER_FP_REVIEW_ADMISSION_REF
    ) {
      input.issues.push(
        issue({
          surfaceKind: "semantic_review_gate",
          surfaceRef: gate.gateRef,
          ruleRef: "abg://gtl-program/semantic-review-gate/abg-producer-provenance",
          message: "semantic review gate must be produced and admitted by the ABG semantic compiler F_P review graph function",
          evidenceRefs: gate.evidenceRefs
        })
      );
    }
    if (gate.status !== "passed") {
      input.issues.push(
        issue({
          surfaceKind: "semantic_review_gate",
          surfaceRef: gate.gateRef,
          ruleRef: "abg://gtl-program/semantic-review-gate/status-passed",
          message: `semantic review gate status must be passed, got ${JSON.stringify(gate.status)}`,
          evidenceRefs: gate.evidenceRefs
        })
      );
    }
    if (gate.findingCount !== 0) {
      input.issues.push(
        issue({
          surfaceKind: "semantic_review_gate",
          surfaceRef: gate.gateRef,
          ruleRef: "abg://gtl-program/semantic-review-gate/no-open-findings",
          message: `semantic review gate carries ${gate.findingCount} open finding(s)`,
          evidenceRefs: gate.evidenceRefs
        })
      );
    }
  }
}

function pushRowIssue(input: {
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly surfaceRef: string;
  readonly ruleRef: string;
  readonly message: string;
  readonly evidenceRefs?: readonly string[] | undefined;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.surfaceRef,
      ruleRef: input.ruleRef,
      message: input.message,
      evidenceRefs: input.evidenceRefs
    })
  );
}

function checkUniqueRows(
  input: {
    readonly rows: readonly { readonly ref: string }[];
    readonly surfaceKind: GtlProgramConformanceSurfaceKind;
    readonly ruleRef: string;
    readonly label: string;
    readonly issues: GtlProgramConformanceIssue[];
  }
): void {
  const seen = new Set<string>();
  for (const row of input.rows) {
    if (seen.has(row.ref)) {
      pushRowIssue({
        surfaceKind: input.surfaceKind,
        surfaceRef: row.ref,
        ruleRef: input.ruleRef,
        message: `${input.label} ${JSON.stringify(row.ref)} is declared more than once`,
        issues: input.issues
      });
    }
    seen.add(row.ref);
  }
}

function checkDigestField(input: {
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly surfaceRef: string;
  readonly ruleRef: string;
  readonly fieldName: string;
  readonly value: string;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  if (!input.value.startsWith("sha256:")) {
    pushRowIssue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.surfaceRef,
      ruleRef: input.ruleRef,
      message: `${input.fieldName} must be a sha256: digest`,
      issues: input.issues
    });
  }
}

function checkNonEmptyArray(input: {
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly surfaceRef: string;
  readonly ruleRef: string;
  readonly fieldName: string;
  readonly values: readonly string[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  if (input.values.length === 0) {
    pushRowIssue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.surfaceRef,
      ruleRef: input.ruleRef,
      message: `${input.fieldName} must contain at least one ref`,
      issues: input.issues
    });
  }
}

function moduleArrayEntryCount(
  modules: readonly Module[],
  key:
    | "candidateFamilies"
    | "evaluators"
    | "jobs"
    | "operators"
    | "refinementBoundaries"
    | "roles"
    | "rules"
): number {
  return modules.reduce((count, module) => {
    switch (key) {
      case "candidateFamilies":
        return count + module.candidateFamilies.length;
      case "evaluators":
        return count + module.evaluators.length;
      case "jobs":
        return count + module.jobs.length;
      case "operators":
        return count + module.operators.length;
      case "refinementBoundaries":
        return count + module.refinementBoundaries.length;
      case "roles":
        return count + module.roles.length;
      case "rules":
        return count + module.rules.length;
    }
  }, 0);
}

function modulePolicyHookCount(modules: readonly Module[]): number {
  return modules.reduce((count, module) => count + module.policyHooks.entries.length, 0);
}

function moduleJobPolicyHookCount(modules: readonly Module[]): number {
  return modules.reduce(
    (count, module) =>
      count +
      module.jobs.reduce(
        (jobCount, job) => jobCount + job.policyHooks.entries.length,
        0
      ),
    0
  );
}

function moduleRolePolicyHookCount(modules: readonly Module[]): number {
  return modules.reduce(
    (count, module) =>
      count +
      module.roles.reduce(
        (roleCount, role) => roleCount + role.policyHooks.entries.length,
        0
      ),
    0
  );
}

function moduleHasPolicyHookKey(
  modules: readonly Module[],
  key: string
): boolean {
  return modules.some((module) =>
    module.policyHooks.entries.some((entry) => entry.key === key) ||
    module.jobs.some((job) =>
      job.policyHooks.entries.some((entry) => entry.key === key)
    ) ||
    module.roles.some((role) =>
      role.policyHooks.entries.some((entry) => entry.key === key)
    )
  );
}

function hostRefs(input: {
  readonly graphFunctions: readonly GraphFunction[];
  readonly modules: readonly Module[];
  readonly vectors: readonly GraphVectorProjection[];
}): ReadonlySet<string> {
  const refs = new Set<string>(["visible_defaults"]);
  for (const graphFunction of input.graphFunctions) {
    refs.add(graphFunction.name);
    refs.add(graphFunction.id);
  }
  for (const vector of input.vectors) {
    refs.add(vector.vectorRef);
    refs.add(vector.graphVectorId);
    refs.add(graphVectorIdentityRef(vector));
  }
  for (const module of input.modules) {
    refs.add(module.name);
    for (const job of module.jobs) {
      refs.add(job.name);
      refs.add(job.id);
    }
    for (const role of module.roles) {
      refs.add(role.name);
      refs.add(role.id);
    }
    for (const operator of module.operators) {
      refs.add(operator.name);
    }
    for (const evaluator of module.evaluators) {
      refs.add(evaluator.name);
    }
    for (const rule of module.rules) {
      refs.add(rule.name);
    }
    for (const refinementBoundary of module.refinementBoundaries) {
      refs.add(refinementBoundary.name);
      refs.add(refinementBoundary.id);
    }
    for (const candidateFamily of module.candidateFamilies) {
      refs.add(candidateFamily.name);
      refs.add(candidateFamily.id);
    }
  }
  return refs;
}

function pluginContractRefs(pluginContracts: readonly unknown[]): ReadonlySet<string> {
  const refs = new Set<string>();
  for (const contract of pluginContracts) {
    if (
      typeof contract === "object" &&
      contract !== null &&
      "ref" in contract &&
      typeof contract.ref === "string"
    ) {
      refs.add(contract.ref);
    }
  }
  return refs;
}

function checkHostRef(input: {
  readonly hostRef: string;
  readonly hostKind: GtlProgramHostSurfaceKind;
  readonly knownHostRefs: ReadonlySet<string>;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly surfaceRef: string;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  if (
    input.hostKind !== "visible_defaults" &&
    input.hostKind !== "external_tool" &&
    !input.knownHostRefs.has(input.hostRef)
  ) {
    pushRowIssue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.surfaceRef,
      ruleRef: "abg://gtl-program/declaration/host-ref-resolves",
      message: `hostRef ${JSON.stringify(input.hostRef)} does not resolve to supplied GTL program inventory`,
      issues: input.issues
    });
  }
}

function checkDeclarationRows(input: {
  readonly operatorDeclarations: readonly GtlProgramOperatorDeclarationRow[];
  readonly evaluatorDeclarations: readonly GtlProgramEvaluatorDeclarationRow[];
  readonly ruleDeclarations: readonly GtlProgramRuleDeclarationRow[];
  readonly knownHostRefs: ReadonlySet<string>;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  checkUniqueRows({
    rows: input.operatorDeclarations.map((row) => ({ ref: row.operatorRef })),
    surfaceKind: "operator_declaration",
    ruleRef: "abg://gtl-program/operator-declaration/unique-ref",
    label: "operator declaration",
    issues: input.issues
  });
  for (const row of input.operatorDeclarations) {
    checkHostRef({
      hostRef: row.hostRef,
      hostKind: row.hostKind,
      knownHostRefs: input.knownHostRefs,
      surfaceKind: "operator_declaration",
      surfaceRef: row.operatorRef,
      issues: input.issues
    });
    checkNonEmptyArray({
      surfaceKind: "operator_declaration",
      surfaceRef: row.operatorRef,
      ruleRef: "abg://gtl-program/operator-declaration/tag-refs",
      fieldName: "tagRefs",
      values: row.tagRefs,
      issues: input.issues
    });
  }

  checkUniqueRows({
    rows: input.evaluatorDeclarations.map((row) => ({ ref: row.evaluatorRef })),
    surfaceKind: "evaluator_declaration",
    ruleRef: "abg://gtl-program/evaluator-declaration/unique-ref",
    label: "evaluator declaration",
    issues: input.issues
  });
  for (const row of input.evaluatorDeclarations) {
    checkHostRef({
      hostRef: row.hostRef,
      hostKind: row.hostKind,
      knownHostRefs: input.knownHostRefs,
      surfaceKind: "evaluator_declaration",
      surfaceRef: row.evaluatorRef,
      issues: input.issues
    });
    checkNonEmptyArray({
      surfaceKind: "evaluator_declaration",
      surfaceRef: row.evaluatorRef,
      ruleRef: "abg://gtl-program/evaluator-declaration/tag-refs",
      fieldName: "tagRefs",
      values: row.tagRefs,
      issues: input.issues
    });
  }

  checkUniqueRows({
    rows: input.ruleDeclarations.map((row) => ({ ref: row.ruleRef })),
    surfaceKind: "rule_declaration",
    ruleRef: "abg://gtl-program/rule-declaration/unique-ref",
    label: "rule declaration",
    issues: input.issues
  });
  for (const row of input.ruleDeclarations) {
    checkHostRef({
      hostRef: row.hostRef,
      hostKind: row.hostKind,
      knownHostRefs: input.knownHostRefs,
      surfaceKind: "rule_declaration",
      surfaceRef: row.ruleRef,
      issues: input.issues
    });
    checkDigestField({
      surfaceKind: "rule_declaration",
      surfaceRef: row.ruleRef,
      ruleRef: "abg://gtl-program/rule-declaration/config-digest",
      fieldName: "configDigest",
      value: row.configDigest,
      issues: input.issues
    });
    checkNonEmptyArray({
      surfaceKind: "rule_declaration",
      surfaceRef: row.ruleRef,
      ruleRef: "abg://gtl-program/rule-declaration/tag-refs",
      fieldName: "tagRefs",
      values: row.tagRefs,
      issues: input.issues
    });
  }
}

function checkComputeCompositionRows(input: {
  readonly computeCompositions: readonly GtlProgramComputeCompositionRow[];
  readonly knownHostRefs: ReadonlySet<string>;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  checkUniqueRows({
    rows: input.computeCompositions.map((row) => ({ ref: row.compositionRef })),
    surfaceKind: "compute_composition",
    ruleRef: "abg://gtl-program/compute-composition/unique-ref",
    label: "compute composition",
    issues: input.issues
  });
  for (const row of input.computeCompositions) {
    checkHostRef({
      hostRef: row.hostRef,
      hostKind: row.hostKind,
      knownHostRefs: input.knownHostRefs,
      surfaceKind: "compute_composition",
      surfaceRef: row.compositionRef,
      issues: input.issues
    });
    checkDigestField({
      surfaceKind: "compute_composition",
      surfaceRef: row.compositionRef,
      ruleRef: "abg://gtl-program/compute-composition/digest",
      fieldName: "compositionDigest",
      value: row.compositionDigest,
      issues: input.issues
    });
    checkNonEmptyArray({
      surfaceKind: "compute_composition",
      surfaceRef: row.compositionRef,
      ruleRef: "abg://gtl-program/compute-composition/regime-bindings",
      fieldName: "regimeBindingRefs",
      values: row.regimeBindingRefs,
      issues: input.issues
    });
    for (const requiredNotation of ["fn<", "transform.C", "evaluate.C", "consequence.C"]) {
      if (!row.notationRefs.some((ref) => ref.includes(requiredNotation))) {
        pushRowIssue({
          surfaceKind: "compute_composition",
          surfaceRef: row.compositionRef,
          ruleRef: "abg://gtl-program/compute-composition/notation-ref",
          message: `notationRefs must include ${requiredNotation}`,
          issues: input.issues
        });
      }
    }
    for (const requiredStage of ["transform", "evaluate", "consequence"]) {
      if (!row.stageBindingRefs.some((ref) => ref.includes(requiredStage))) {
        pushRowIssue({
          surfaceKind: "compute_composition",
          surfaceRef: row.compositionRef,
          ruleRef: "abg://gtl-program/compute-composition/stage-binding",
          message: `stageBindingRefs must include ${requiredStage}.C`,
          issues: input.issues
        });
      }
    }
  }
}

function stageBindingRefs(
  computeStageBindings: readonly GtlProgramComputeStageBindingRow[]
): ReadonlySet<string> {
  return new Set(
    computeStageBindings.map((row) => row.stageBindingRef)
  );
}

function checkStageRegimeDispositions(input: {
  readonly row: GtlProgramComputeStageBindingRow;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const byRegime = new Map<Regime, GtlProgramStageRegimeDispositionRow[]>();
  for (const disposition of input.row.regimeDispositions) {
    byRegime.set(disposition.regime, [
      ...(byRegime.get(disposition.regime) ?? []),
      disposition
    ]);
  }
  for (const regime of ["F_D", "F_P", "F_H"] as const) {
    const rows = byRegime.get(regime) ?? [];
    if (rows.length === 0) {
      pushRowIssue({
        surfaceKind: "compute_stage_binding",
        surfaceRef: input.row.stageBindingRef,
        ruleRef: "abg://gtl-program/compute-stage/regime-disposition-required",
        message: `stage ${input.row.stageBindingRef} must declare ${regime} participation, not_used, or external_callout disposition`,
        issues: input.issues
      });
      continue;
    }
    if (rows.length > 1) {
      pushRowIssue({
        surfaceKind: "compute_stage_binding",
        surfaceRef: input.row.stageBindingRef,
        ruleRef: "abg://gtl-program/compute-stage/regime-disposition-unique",
        message: `stage ${input.row.stageBindingRef} has ${rows.length} ${regime} dispositions`,
        issues: input.issues
      });
    }
    const row = rows[0]!;
    if (
      row.disposition === "participates" &&
      row.selectedRegimeBindingRefs.length === 0
    ) {
      pushRowIssue({
        surfaceKind: "compute_stage_binding",
        surfaceRef: input.row.stageBindingRef,
        ruleRef: "abg://gtl-program/compute-stage/participating-regime-binding",
        message: `${regime} participates in ${input.row.stageBindingRef} without selectedRegimeBindingRefs`,
        issues: input.issues
      });
    }
    if (
      (row.disposition === "not_used" ||
        row.disposition === "external_callout") &&
      row.reasonRefs.length === 0
    ) {
      pushRowIssue({
        surfaceKind: "compute_stage_binding",
        surfaceRef: input.row.stageBindingRef,
        ruleRef: "abg://gtl-program/compute-stage/nonparticipation-reason",
        message: `${regime} ${row.disposition} in ${input.row.stageBindingRef} without reasonRefs`,
        issues: input.issues
      });
    }
  }
}

function checkComputeStageBindingRows(input: {
  readonly computeCompositions: readonly GtlProgramComputeCompositionRow[];
  readonly computeStageBindings: readonly GtlProgramComputeStageBindingRow[];
  readonly pluginContractRefs: ReadonlySet<string>;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  checkUniqueRows({
    rows: input.computeStageBindings.map((row) => ({
      ref: row.stageBindingRef
    })),
    surfaceKind: "compute_stage_binding",
    ruleRef: "abg://gtl-program/compute-stage/unique-ref",
    label: "compute stage binding",
    issues: input.issues
  });

  const compositionsByRef = new Map<string, GtlProgramComputeCompositionRow>();
  for (const row of input.computeCompositions) {
    compositionsByRef.set(row.compositionRef, row);
  }
  const stagesByRef = stageBindingRefs(input.computeStageBindings);
  for (const composition of input.computeCompositions) {
    for (const stageBindingRef of composition.stageBindingRefs) {
      if (!stagesByRef.has(stageBindingRef)) {
        pushRowIssue({
          surfaceKind: "compute_composition",
          surfaceRef: composition.compositionRef,
          ruleRef: "abg://gtl-program/compute-composition/stage-binding-resolves",
          message: `stageBindingRef ${JSON.stringify(stageBindingRef)} does not resolve to a supplied computeStageBindings row`,
          issues: input.issues
        });
      }
    }
    for (const requiredStage of ["transform", "evaluate", "consequence"] as const) {
      const hasStage = input.computeStageBindings.some(
        (row) =>
          row.compositionRef === composition.compositionRef &&
          row.stageRole === requiredStage
      );
      if (!hasStage) {
        pushRowIssue({
          surfaceKind: "compute_composition",
          surfaceRef: composition.compositionRef,
          ruleRef: "abg://gtl-program/compute-composition/required-stage-row",
          message: `${composition.compositionRef} must supply a ${requiredStage}.C computeStageBindings row`,
          issues: input.issues
        });
      }
    }
  }

  for (const row of input.computeStageBindings) {
    const composition = compositionsByRef.get(row.compositionRef);
    if (composition === undefined) {
      pushRowIssue({
        surfaceKind: "compute_stage_binding",
        surfaceRef: row.stageBindingRef,
        ruleRef: "abg://gtl-program/compute-stage/composition-resolves",
        message: `compositionRef ${JSON.stringify(row.compositionRef)} does not resolve to a supplied computeCompositions row`,
        issues: input.issues
      });
    } else {
      if (composition.compositionDigest !== row.compositionDigest) {
        pushRowIssue({
          surfaceKind: "compute_stage_binding",
          surfaceRef: row.stageBindingRef,
          ruleRef: "abg://gtl-program/compute-stage/composition-digest",
          message: `compositionDigest for ${row.stageBindingRef} must match ${composition.compositionRef}`,
          issues: input.issues
        });
      }
      if (!composition.stageBindingRefs.includes(row.stageBindingRef)) {
        pushRowIssue({
          surfaceKind: "compute_stage_binding",
          surfaceRef: row.stageBindingRef,
          ruleRef: "abg://gtl-program/compute-stage/composition-stage-membership",
          message: `${row.stageBindingRef} is not listed by ${composition.compositionRef}.stageBindingRefs`,
          issues: input.issues
        });
      }
    }
    if (
      row.stageRole !== "human_callout" &&
      !row.stageNotationRef.includes(`${row.stageRole}.C`)
    ) {
      pushRowIssue({
        surfaceKind: "compute_stage_binding",
        surfaceRef: row.stageBindingRef,
        ruleRef: "abg://gtl-program/compute-stage/notation-ref",
        message: `stageNotationRef for ${row.stageBindingRef} must include ${row.stageRole}.C`,
        issues: input.issues
      });
    }
    checkNonEmptyArray({
      surfaceKind: "compute_stage_binding",
      surfaceRef: row.stageBindingRef,
      ruleRef: "abg://gtl-program/compute-stage/input-carriers",
      fieldName: "inputCarrierRefs",
      values: row.inputCarrierRefs,
      issues: input.issues
    });
    checkNonEmptyArray({
      surfaceKind: "compute_stage_binding",
      surfaceRef: row.stageBindingRef,
      ruleRef: "abg://gtl-program/compute-stage/output-carriers",
      fieldName: "outputCarrierRefs",
      values: row.outputCarrierRefs,
      issues: input.issues
    });
    for (const predecessorRef of row.predecessorStageBindingRefs) {
      if (!stagesByRef.has(predecessorRef)) {
        pushRowIssue({
          surfaceKind: "compute_stage_binding",
          surfaceRef: row.stageBindingRef,
          ruleRef: "abg://gtl-program/compute-stage/predecessor-resolves",
          message: `predecessorStageBindingRef ${JSON.stringify(predecessorRef)} does not resolve to a supplied computeStageBindings row`,
          issues: input.issues
        });
      }
    }
    for (const pluginRef of row.pluginContractRefs) {
      if (!input.pluginContractRefs.has(pluginRef)) {
        pushRowIssue({
          surfaceKind: "compute_stage_binding",
          surfaceRef: row.stageBindingRef,
          ruleRef: "abg://gtl-program/compute-stage/plugin-contract-resolves",
          message: `pluginContractRef ${JSON.stringify(pluginRef)} does not resolve to a supplied plugin contract`,
          issues: input.issues
        });
      }
    }
    checkStageRegimeDispositions({ row, issues: input.issues });
  }
}

const REQUIRED_PLUGIN_RESULT_IDENTITY_FIELD_REFS = Object.freeze([
  "compositionRef",
  "compositionDigest",
  "compositionSelectionRef",
  "stageRole",
  "computeMeans",
  "outputCarrierRefs",
  "evidenceRefs"
]);

function selectorAuthorityLooksLikeLocalFileRef(ref: string): boolean {
  return ref.startsWith("file://") || ref.includes("fp_evaluate_result.json");
}

function checkPluginResultInterfaceRows(input: {
  readonly pluginResultInterfaces: readonly GtlProgramPluginResultInterfaceRow[];
  readonly computeStageBindings: readonly GtlProgramComputeStageBindingRow[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  checkUniqueRows({
    rows: input.pluginResultInterfaces.map((row) => ({
      ref: row.resultInterfaceRef
    })),
    surfaceKind: "plugin_result_interface",
    ruleRef: "abg://gtl-program/plugin-result-interface/unique-ref",
    label: "plugin result interface",
    issues: input.issues
  });

  const stagesByRef = new Map<string, GtlProgramComputeStageBindingRow>();
  for (const row of input.computeStageBindings) {
    stagesByRef.set(row.stageBindingRef, row);
  }
  const resultInterfacesByStage = new Map<string, number>();
  for (const row of input.pluginResultInterfaces) {
    resultInterfacesByStage.set(
      row.stageBindingRef,
      (resultInterfacesByStage.get(row.stageBindingRef) ?? 0) + 1
    );
  }
  for (const stage of input.computeStageBindings) {
    if ((resultInterfacesByStage.get(stage.stageBindingRef) ?? 0) === 0) {
      pushRowIssue({
        surfaceKind: "compute_stage_binding",
        surfaceRef: stage.stageBindingRef,
        ruleRef: "abg://gtl-program/plugin-result-interface/stage-binding-required",
        message: `${stage.stageBindingRef} must declare an admitted plugin result interface row`,
        issues: input.issues
      });
    }
  }

  const rowsByRuntimeSelector = new Map<
    string,
    readonly GtlProgramPluginResultInterfaceRow[]
  >();
  for (const row of input.pluginResultInterfaces) {
    const selectorKey = JSON.stringify({
      compositionRef: row.compositionRef,
      compositionDigest: row.compositionDigest,
      stageRole: row.stageRole,
      computeMeans: row.computeMeans
    });
    rowsByRuntimeSelector.set(
      selectorKey,
      Object.freeze([...(rowsByRuntimeSelector.get(selectorKey) ?? []), row])
    );
  }
  for (const rows of rowsByRuntimeSelector.values()) {
    for (const [index, row] of rows.entries()) {
      for (const sibling of rows.slice(index + 1)) {
        const overlappingOutputCarrierRefs = row.outputCarrierRefs.filter(
          (ref) => sibling.outputCarrierRefs.includes(ref)
        );
        if (overlappingOutputCarrierRefs.length > 0) {
          pushRowIssue({
            surfaceKind: "plugin_result_interface",
            surfaceRef: row.resultInterfaceRef,
            ruleRef:
              "abg://gtl-program/plugin-result-interface/unique-runtime-selector",
            message: `${row.resultInterfaceRef} and ${sibling.resultInterfaceRef} overlap runtime selector output carriers ${overlappingOutputCarrierRefs.join(", ")}`,
            issues: input.issues
          });
        }
        const overlappingProducedCarrierRefs = row.producedCarrierRefs.filter(
          (ref) => sibling.producedCarrierRefs.includes(ref)
        );
        if (overlappingProducedCarrierRefs.length > 0) {
          pushRowIssue({
            surfaceKind: "plugin_result_interface",
            surfaceRef: row.resultInterfaceRef,
            ruleRef:
              "abg://gtl-program/plugin-result-interface/unique-produced-carriers",
            message: `${row.resultInterfaceRef} and ${sibling.resultInterfaceRef} overlap produced carrier refs ${overlappingProducedCarrierRefs.join(", ")}`,
            issues: input.issues
          });
        }
      }
    }
  }

  for (const row of input.pluginResultInterfaces) {
    const stage = stagesByRef.get(row.stageBindingRef);
    if (stage === undefined) {
      pushRowIssue({
        surfaceKind: "plugin_result_interface",
        surfaceRef: row.resultInterfaceRef,
        ruleRef: "abg://gtl-program/plugin-result-interface/stage-binding-resolves",
        message: `stageBindingRef ${JSON.stringify(row.stageBindingRef)} does not resolve to a supplied computeStageBindings row`,
        issues: input.issues
      });
    } else {
      if (row.compositionRef !== stage.compositionRef) {
        pushRowIssue({
          surfaceKind: "plugin_result_interface",
          surfaceRef: row.resultInterfaceRef,
          ruleRef: "abg://gtl-program/plugin-result-interface/composition-ref",
          message: `compositionRef for ${row.resultInterfaceRef} must match ${stage.stageBindingRef}`,
          issues: input.issues
        });
      }
      if (row.compositionDigest !== stage.compositionDigest) {
        pushRowIssue({
          surfaceKind: "plugin_result_interface",
          surfaceRef: row.resultInterfaceRef,
          ruleRef: "abg://gtl-program/plugin-result-interface/composition-digest",
          message: `compositionDigest for ${row.resultInterfaceRef} must match ${stage.stageBindingRef}`,
          issues: input.issues
        });
      }
      if (row.stageRole !== stage.stageRole) {
        pushRowIssue({
          surfaceKind: "plugin_result_interface",
          surfaceRef: row.resultInterfaceRef,
          ruleRef: "abg://gtl-program/plugin-result-interface/stage-role",
          message: `stageRole for ${row.resultInterfaceRef} must match ${stage.stageBindingRef}`,
          issues: input.issues
        });
      }
      if (row.computeMeans !== stage.computeMeans) {
        pushRowIssue({
          surfaceKind: "plugin_result_interface",
          surfaceRef: row.resultInterfaceRef,
          ruleRef: "abg://gtl-program/plugin-result-interface/compute-means",
          message: `computeMeans for ${row.resultInterfaceRef} must match ${stage.stageBindingRef}`,
          issues: input.issues
        });
      }
      for (const outputCarrierRef of stage.outputCarrierRefs) {
        if (!row.outputCarrierRefs.includes(outputCarrierRef)) {
          pushRowIssue({
            surfaceKind: "plugin_result_interface",
            surfaceRef: row.resultInterfaceRef,
            ruleRef: "abg://gtl-program/plugin-result-interface/output-carrier-covers-stage",
            message: `outputCarrierRefs for ${row.resultInterfaceRef} must include stage output ${JSON.stringify(outputCarrierRef)}`,
            issues: input.issues
          });
        }
      }
      for (const outputCarrierRef of row.outputCarrierRefs) {
        if (!stage.outputCarrierRefs.includes(outputCarrierRef)) {
          pushRowIssue({
            surfaceKind: "plugin_result_interface",
            surfaceRef: row.resultInterfaceRef,
            ruleRef: "abg://gtl-program/plugin-result-interface/output-carrier-stage-member",
            message: `outputCarrierRef ${JSON.stringify(outputCarrierRef)} is not produced by ${stage.stageBindingRef}`,
            issues: input.issues
          });
        }
      }
    }

    checkNonEmptyArray({
      surfaceKind: "plugin_result_interface",
      surfaceRef: row.resultInterfaceRef,
      ruleRef: "abg://gtl-program/plugin-result-interface/output-carriers",
      fieldName: "outputCarrierRefs",
      values: row.outputCarrierRefs,
      issues: input.issues
    });
    checkNonEmptyArray({
      surfaceKind: "plugin_result_interface",
      surfaceRef: row.resultInterfaceRef,
      ruleRef: "abg://gtl-program/plugin-result-interface/produced-carriers",
      fieldName: "producedCarrierRefs",
      values: row.producedCarrierRefs,
      issues: input.issues
    });
    checkNonEmptyArray({
      surfaceKind: "plugin_result_interface",
      surfaceRef: row.resultInterfaceRef,
      ruleRef: "abg://gtl-program/plugin-result-interface/selector-authority",
      fieldName: "selectorAuthorityRefs",
      values: row.selectorAuthorityRefs,
      issues: input.issues
    });
    if (!row.outputCarrierRefs.includes(row.resultCarrierKind)) {
      pushRowIssue({
        surfaceKind: "plugin_result_interface",
        surfaceRef: row.resultInterfaceRef,
        ruleRef: "abg://gtl-program/plugin-result-interface/result-carrier-kind",
        message: `resultCarrierKind ${JSON.stringify(row.resultCarrierKind)} must be one of outputCarrierRefs`,
        issues: input.issues
      });
    }
    const identityFields = new Set(row.requiredIdentityFieldRefs);
    for (const requiredRef of REQUIRED_PLUGIN_RESULT_IDENTITY_FIELD_REFS) {
      if (!identityFields.has(requiredRef)) {
        pushRowIssue({
          surfaceKind: "plugin_result_interface",
          surfaceRef: row.resultInterfaceRef,
          ruleRef: "abg://gtl-program/plugin-result-interface/required-identity-field",
          message: `requiredIdentityFieldRefs must include ${requiredRef}`,
          issues: input.issues
        });
      }
    }
    for (const selectorAuthorityRef of row.selectorAuthorityRefs) {
      if (selectorAuthorityLooksLikeLocalFileRef(selectorAuthorityRef)) {
        pushRowIssue({
          surfaceKind: "plugin_result_interface",
          surfaceRef: row.resultInterfaceRef,
          ruleRef: "abg://gtl-program/plugin-result-interface/no-local-file-selector",
          message: `selectorAuthorityRef ${JSON.stringify(selectorAuthorityRef)} must cite GTL/ABG result-interface authority, not a local result file`,
          issues: input.issues
        });
      }
    }
  }
}

function checkHookBoundaryRows(input: {
  readonly hookBoundaries: readonly GtlProgramHookBoundaryRow[];
  readonly knownHostRefs: ReadonlySet<string>;
  readonly pluginContractRefs: ReadonlySet<string>;
  readonly stageBoundPluginRefs: ReadonlySet<string>;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  checkUniqueRows({
    rows: input.hookBoundaries.map((row) => ({
      ref: `${row.hostRef}:${row.hookKey}:${row.hookRef}`
    })),
    surfaceKind: "hook_boundary",
    ruleRef: "abg://gtl-program/hook-boundary/unique-host-hook",
    label: "hook boundary",
    issues: input.issues
  });
  for (const row of input.hookBoundaries) {
    checkHostRef({
      hostRef: row.hostRef,
      hostKind: row.hostKind,
      knownHostRefs: input.knownHostRefs,
      surfaceKind: "hook_boundary",
      surfaceRef: row.hookRef,
      issues: input.issues
    });
    checkNonEmptyArray({
      surfaceKind: "hook_boundary",
      surfaceRef: row.hookRef,
      ruleRef: "abg://gtl-program/hook-boundary/concern-refs",
      fieldName: "concernRefs",
      values: row.concernRefs,
      issues: input.issues
    });
    for (const pluginRef of row.pluginContractRefs) {
      if (!input.pluginContractRefs.has(pluginRef)) {
        pushRowIssue({
          surfaceKind: "hook_boundary",
          surfaceRef: row.hookRef,
          ruleRef: "abg://gtl-program/hook-boundary/plugin-contract-resolves",
          message: `pluginContractRef ${JSON.stringify(pluginRef)} does not resolve to a supplied plugin contract`,
          issues: input.issues
        });
      }
      if (!input.stageBoundPluginRefs.has(pluginRef)) {
        pushRowIssue({
          surfaceKind: "hook_boundary",
          surfaceRef: row.hookRef,
          ruleRef: "abg://gtl-program/hook-boundary/plugin-stage-binding-resolves",
          message: `pluginContractRef ${JSON.stringify(pluginRef)} is not bound by a supplied computeStageBindings row`,
          issues: input.issues
        });
      }
    }
  }
}

function pluginRefsBoundByStages(
  rows: readonly GtlProgramComputeStageBindingRow[]
): ReadonlySet<string> {
  const refs = new Set<string>();
  for (const row of rows) {
    for (const pluginRef of row.pluginContractRefs) {
      refs.add(pluginRef);
    }
  }
  return refs;
}

function pluginRefsBoundByRuntime(
  rows: readonly GtlProgramRuntimeBindingRow[]
): ReadonlySet<string> {
  const refs = new Set<string>();
  for (const row of rows) {
    for (const pluginRef of row.pluginContractRefs) {
      refs.add(pluginRef);
    }
  }
  return refs;
}

const PRODUCT_LOCAL_TRAVERSAL_ROUTER_TOKENS = new Set([
  "odd-sdlc",
  "odd-sdlc-ts",
  "odd_sdlc",
  "sdlc",
  "--graph-overlay",
  "graph-overlay",
  "replay-next-action",
  "startoutcomeforobservedreplay"
]);

function stripCommandTokenQuotes(token: string): string {
  if (
    (token.startsWith('"') && token.endsWith('"')) ||
    (token.startsWith("'") && token.endsWith("'"))
  ) {
    return token.slice(1, -1);
  }
  return token;
}

function commandRefTokens(commandRef: string): readonly string[] {
  return Object.freeze(
    (commandRef.trim().toLowerCase().match(/"[^"]*"|'[^']*'|\S+/gu) ?? [])
      .map((token) => stripCommandTokenQuotes(token))
  );
}

function commandExecutableStem(token: string): string {
  const executable = token.split(/[\\/]/u).pop() ?? token;
  return executable.replace(/\.(?:cjs|mjs|js|ts|sh|bash|zsh|cmd|exe)$/u, "");
}

function commandTokenReferencesOverlayTarget(token: string): boolean {
  return (
    token.startsWith("overlay:") ||
    token.includes("=overlay:") ||
    token.startsWith("--graph-overlay=")
  );
}

function commandRefLooksLikeProductLocalTraversalSubstitute(
  commandRef: string
): boolean {
  const tokens = commandRefTokens(commandRef);
  const executable = commandExecutableStem(tokens[0] ?? "");
  if (PRODUCT_LOCAL_TRAVERSAL_ROUTER_TOKENS.has(executable)) {
    return true;
  }
  return tokens.some(
    (token) =>
      PRODUCT_LOCAL_TRAVERSAL_ROUTER_TOKENS.has(token) ||
      commandTokenReferencesOverlayTarget(token)
  );
}

function commandRefUsesCanonicalAbgStart(commandRef: string): boolean {
  const tokens = commandRefTokens(commandRef);
  const executable = commandExecutableStem(tokens[0] ?? "");
  return (
    (executable === "abiogenesis-ts" || executable === "genesis-ts") &&
    tokens[1] === "start"
  );
}

function checkRuntimeBindingRows(input: {
  readonly runtimeBindings: readonly GtlProgramRuntimeBindingRow[];
  readonly publicStartTargets: readonly GtlProgramPublicStartRow[];
  readonly modules: readonly Module[];
  readonly pluginContractRefs: ReadonlySet<string>;
  readonly computeStageBindingRefs: ReadonlySet<string>;
  readonly pluginRefsBoundByStages: ReadonlySet<string>;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  checkUniqueRows({
    rows: input.runtimeBindings.map((row) => ({ ref: row.bindingRef })),
    surfaceKind: "runtime_binding",
    ruleRef: "abg://gtl-program/runtime-binding/unique-ref",
    label: "runtime binding",
    issues: input.issues
  });

  const moduleRefs = new Set(input.modules.flatMap((module) => [module.name]));
  const publicStartRefs = new Set(
    input.publicStartTargets.flatMap((row) => [row.name, row.graphFunctionRef])
  );
  for (const row of input.runtimeBindings) {
    if (!moduleRefs.has(row.moduleRef)) {
      pushRowIssue({
        surfaceKind: "runtime_binding",
        surfaceRef: row.bindingRef,
        ruleRef: "abg://gtl-program/runtime-binding/module-ref-resolves",
        message: `moduleRef ${JSON.stringify(row.moduleRef)} does not resolve to a supplied module`,
        issues: input.issues
      });
    }
    if (!publicStartRefs.has(row.publicStartRef)) {
      pushRowIssue({
        surfaceKind: "runtime_binding",
        surfaceRef: row.bindingRef,
        ruleRef: "abg://gtl-program/runtime-binding/public-start-ref-resolves",
        message: `publicStartRef ${JSON.stringify(row.publicStartRef)} does not resolve to a supplied public start target`,
        issues: input.issues
      });
    }
    for (const pluginRef of row.pluginContractRefs) {
      if (!input.pluginContractRefs.has(pluginRef)) {
        pushRowIssue({
          surfaceKind: "runtime_binding",
          surfaceRef: row.bindingRef,
          ruleRef: "abg://gtl-program/runtime-binding/plugin-contract-resolves",
          message: `pluginContractRef ${JSON.stringify(pluginRef)} does not resolve to a supplied plugin contract`,
          issues: input.issues
        });
      }
      if (!input.pluginRefsBoundByStages.has(pluginRef)) {
        pushRowIssue({
          surfaceKind: "runtime_binding",
          surfaceRef: row.bindingRef,
          ruleRef: "abg://gtl-program/runtime-binding/plugin-stage-binding-resolves",
          message: `pluginContractRef ${JSON.stringify(pluginRef)} is not bound to a supplied compute stage`,
          issues: input.issues
        });
      }
    }
    for (const stageBindingRef of row.stageBindingRefs) {
      if (!input.computeStageBindingRefs.has(stageBindingRef)) {
        pushRowIssue({
          surfaceKind: "runtime_binding",
          surfaceRef: row.bindingRef,
          ruleRef: "abg://gtl-program/runtime-binding/stage-binding-resolves",
          message: `stageBindingRef ${JSON.stringify(stageBindingRef)} does not resolve to a supplied compute stage`,
          issues: input.issues
        });
      }
    }
    if (commandRefLooksLikeProductLocalTraversalSubstitute(row.commandRef)) {
      pushRowIssue({
        surfaceKind: "runtime_binding",
        surfaceRef: row.bindingRef,
        ruleRef: "abg://gtl-program/runtime-binding/no-product-local-command-router",
        message: `commandRef ${JSON.stringify(row.commandRef)} looks like product-local traversal, overlay, or replay routing; public command control must stay on ABG runtime bindings`,
        evidenceRefs: row.evidenceRefs,
        issues: input.issues
      });
    }
    if (!commandRefUsesCanonicalAbgStart(row.commandRef)) {
      pushRowIssue({
        surfaceKind: "runtime_binding",
        surfaceRef: row.bindingRef,
        ruleRef: "abg://gtl-program/runtime-binding/canonical-abg-start",
        message: `commandRef ${JSON.stringify(row.commandRef)} must enter through the canonical ABG start command; product-local shells and context bootstraps are not traversal runtime`,
        evidenceRefs: row.evidenceRefs,
        issues: input.issues
      });
    }
  }

  const runtimeBoundPluginRefs = pluginRefsBoundByRuntime(input.runtimeBindings);
  for (const pluginRef of input.pluginContractRefs) {
    if (!input.pluginRefsBoundByStages.has(pluginRef)) {
      pushRowIssue({
        surfaceKind: "plugin_contract",
        surfaceRef: pluginRef,
        ruleRef: "abg://gtl-program/plugin-contract/stage-binding-required",
        message: `plugin contract ${JSON.stringify(pluginRef)} is not bound by any computeStageBindings row`,
        issues: input.issues
      });
    }
    if (!runtimeBoundPluginRefs.has(pluginRef)) {
      pushRowIssue({
        surfaceKind: "plugin_contract",
        surfaceRef: pluginRef,
        ruleRef: "abg://gtl-program/plugin-contract/runtime-binding-required",
        message: `plugin contract ${JSON.stringify(pluginRef)} is not consumed by any ABG runtime binding row`,
        issues: input.issues
      });
    }
  }
}

// Implements: REQ-L-GTL3-LAWS-022
function checkDeclarationSourceRows(input: {
  readonly declarationSourceRows: readonly GtlProgramDeclarationSourceRow[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  for (const row of input.declarationSourceRows) {
    if (row.sourceKind === "module_export" && row.canonicalDigest.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "declaration_source",
          surfaceRef: row.sourceRef,
          ruleRef: "abg://gtl-program/declaration/module-export-round-trip",
          message:
            "module-export declaration ingress is lawful only with a stable canonical round-trip digest witness"
        })
      );
    }
  }
}

function checkInstalledContextRows(input: {
  readonly abiPackageVersion: string;
  readonly installedContextSurfaces: readonly GtlProgramInstalledContextRow[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const requiredTextFragments = Object.freeze([
    "GraphFunction is a reusable workflow library function",
    "graph overlay or GTL program composition is the program surface",
    "workspace is the mutable program instance surface",
    "ABG traversal owns startup",
    "graph-function library -> graph overlay/program -> workspace binding -> ABG traversal -> replay interpretation"
  ] as const);
  const forbiddenTextFragments = Object.freeze([
    "GraphFunction is the reusable workflow program abstraction",
    "graph functions are the program surface",
    "primary published program form",
    "primary reusable program carrier"
  ] as const);

  for (const row of input.installedContextSurfaces) {
    const declaredVersion = row.contextText.match(/^Version:\s*(\S+)\s*$/mu)?.[1];
    if (declaredVersion === undefined) {
      pushRowIssue({
        surfaceKind: "installed_context",
        surfaceRef: row.contextRef,
        ruleRef: "abg://gtl-program/installed-context/version-line",
        message: "installed context text must contain a Version: line",
        evidenceRefs: row.evidenceRefs,
        issues: input.issues
      });
    } else if (declaredVersion !== row.abiPackageVersion) {
      pushRowIssue({
        surfaceKind: "installed_context",
        surfaceRef: row.contextRef,
        ruleRef: "abg://gtl-program/installed-context/version-line",
        message: `installed context Version line ${JSON.stringify(declaredVersion)} does not match row abiPackageVersion ${JSON.stringify(row.abiPackageVersion)}`,
        evidenceRefs: row.evidenceRefs,
        issues: input.issues
      });
    }
    if (row.abiPackageVersion !== input.abiPackageVersion) {
      pushRowIssue({
        surfaceKind: "installed_context",
        surfaceRef: row.contextRef,
        ruleRef: "abg://gtl-program/installed-context/abi-version",
        message: `installed context version ${JSON.stringify(row.abiPackageVersion)} does not match typecheck ABI package version ${JSON.stringify(input.abiPackageVersion)}`,
        evidenceRefs: row.evidenceRefs,
        issues: input.issues
      });
    }
    if (row.selectedProductVersion !== input.abiPackageVersion) {
      pushRowIssue({
        surfaceKind: "installed_context",
        surfaceRef: row.contextRef,
        ruleRef: "abg://gtl-program/installed-context/selected-product-version",
        message: `selected product version ${JSON.stringify(row.selectedProductVersion)} does not match typecheck ABI package version ${JSON.stringify(input.abiPackageVersion)}`,
        evidenceRefs: row.evidenceRefs,
        issues: input.issues
      });
    }
    if (!row.toolchainBindingRef.includes("toolchain-binding")) {
      pushRowIssue({
        surfaceKind: "installed_context",
        surfaceRef: row.contextRef,
        ruleRef: "abg://gtl-program/installed-context/toolchain-binding",
        message: "installed context must reference target workspace toolchain binding truth",
        evidenceRefs: row.evidenceRefs,
        issues: input.issues
      });
    }
    for (const fragment of requiredTextFragments) {
      if (!row.contextText.includes(fragment)) {
        pushRowIssue({
          surfaceKind: "installed_context",
          surfaceRef: row.contextRef,
          ruleRef: "abg://gtl-program/installed-context/required-abstraction",
          message: `installed context is missing required abstraction text ${JSON.stringify(fragment)}`,
          evidenceRefs: row.evidenceRefs,
          issues: input.issues
        });
      }
    }
    for (const fragment of forbiddenTextFragments) {
      if (row.contextText.includes(fragment)) {
        pushRowIssue({
          surfaceKind: "installed_context",
          surfaceRef: row.contextRef,
          ruleRef: "abg://gtl-program/installed-context/stale-abstraction",
          message: `installed context still carries stale abstraction text ${JSON.stringify(fragment)}`,
          evidenceRefs: row.evidenceRefs,
          issues: input.issues
        });
      }
    }
  }
}

function checkRuntimeReentryRouteRows(input: {
  readonly runtimeReentryRoutes: readonly GtlProgramRuntimeReentryRouteRow[];
  readonly vectors: readonly GraphVectorProjection[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  checkUniqueRows({
    rows: input.runtimeReentryRoutes.map((row) => ({ ref: row.routeRef })),
    surfaceKind: "runtime_reentry_route",
    ruleRef: "abg://gtl-program/runtime-reentry/unique-ref",
    label: "runtime re-entry route",
    issues: input.issues
  });

  for (const row of input.runtimeReentryRoutes) {
    if (row.repairSurfaceDisposition !== "upstream_reentry") {
      pushRowIssue({
        surfaceKind: "runtime_reentry_route",
        surfaceRef: row.routeRef,
        ruleRef: "abg://gtl-program/runtime-reentry/upstream-disposition",
        message: "runtime re-entry routes must be classified as upstream_reentry",
        evidenceRefs: row.evidenceRefs,
        issues: input.issues
      });
    }
    checkNonEmptyArray({
      surfaceKind: "runtime_reentry_route",
      surfaceRef: row.routeRef,
      ruleRef: "abg://gtl-program/runtime-reentry/lawful-basis",
      fieldName: "lawfulBasisRefs",
      values: row.lawfulBasisRefs,
      issues: input.issues
    });
    for (const requiredRef of [
      "REQ-R-ABG3-ITERATION-009",
      "REQ-R-ABG3-FPC-004B"
    ]) {
      if (!row.lawfulBasisRefs.includes(requiredRef)) {
        pushRowIssue({
          surfaceKind: "runtime_reentry_route",
          surfaceRef: row.routeRef,
          ruleRef: "abg://gtl-program/runtime-reentry/lawful-basis",
          message: `runtime re-entry route must cite ${requiredRef}`,
          evidenceRefs: row.evidenceRefs,
          issues: input.issues
        });
      }
    }

    const graphVectors = input.vectors.filter(
      (vector) =>
        vector.graphFunctionId === row.repairGraphFunctionId &&
        vector.graphId === row.repairGraphId
    );
    const targetVector = graphVectors[row.reentryTargetVectorIndex] ?? null;
    if (targetVector === null) {
      pushRowIssue({
        surfaceKind: "runtime_reentry_route",
        surfaceRef: row.routeRef,
        ruleRef: "abg://gtl-program/runtime-reentry/target-vector-index-resolves",
        message: `reentryTargetVectorIndex ${row.reentryTargetVectorIndex} does not resolve in graph function ${JSON.stringify(row.repairGraphFunctionRef)}`,
        evidenceRefs: row.evidenceRefs,
        issues: input.issues
      });
      continue;
    }

    if (
      targetVector.graphFunctionRef !== row.repairGraphFunctionRef ||
      targetVector.vectorRef !== row.repairGraphVectorRef ||
      targetVector.graphFunctionId !== row.repairGraphFunctionId ||
      targetVector.graphId !== row.repairGraphId ||
      targetVector.graphVectorId !== row.repairGraphVectorId
    ) {
      pushRowIssue({
        surfaceKind: "runtime_reentry_route",
        surfaceRef: row.routeRef,
        ruleRef: "abg://gtl-program/runtime-reentry/absolute-target-identity",
        message: `runtime re-entry route ${JSON.stringify(row.routeRef)} must resolve to the absolute target graph/vector identity at reentryTargetVectorIndex`,
        evidenceRefs: row.evidenceRefs,
        issues: input.issues
      });
    }
  }
}

function checkSelectionBoundaryRows(input: {
  readonly selectionBoundaries: readonly GtlProgramSelectionBoundaryRow[];
  readonly knownHostRefs: ReadonlySet<string>;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  checkUniqueRows({
    rows: input.selectionBoundaries.map((row) => ({ ref: row.boundaryRef })),
    surfaceKind: "selection_boundary",
    ruleRef: "abg://gtl-program/selection-boundary/unique-ref",
    label: "selection boundary",
    issues: input.issues
  });
  for (const row of input.selectionBoundaries) {
    if (!input.knownHostRefs.has(row.hostRef)) {
      pushRowIssue({
        surfaceKind: "selection_boundary",
        surfaceRef: row.boundaryRef,
        ruleRef: "abg://gtl-program/selection-boundary/host-ref-resolves",
        message: `hostRef ${JSON.stringify(row.hostRef)} does not resolve to supplied GTL inventory`,
        issues: input.issues
      });
    }
    checkNonEmptyArray({
      surfaceKind: "selection_boundary",
      surfaceRef: row.boundaryRef,
      ruleRef: "abg://gtl-program/selection-boundary/input-contracts",
      fieldName: "inputContractRefs",
      values: row.inputContractRefs,
      issues: input.issues
    });
    checkNonEmptyArray({
      surfaceKind: "selection_boundary",
      surfaceRef: row.boundaryRef,
      ruleRef: "abg://gtl-program/selection-boundary/output-contracts",
      fieldName: "outputContractRefs",
      values: row.outputContractRefs,
      issues: input.issues
    });
    if (
      (row.boundaryKind === "candidate_family" ||
        row.boundaryKind === "synthesis") &&
      row.candidateRefs.length === 0
    ) {
      pushRowIssue({
        surfaceKind: "selection_boundary",
        surfaceRef: row.boundaryRef,
        ruleRef: "abg://gtl-program/selection-boundary/candidate-refs",
        message: `${row.boundaryKind} rows require candidateRefs`,
        issues: input.issues
      });
    }
  }
}

function checkWorkBindingRows(input: {
  readonly jobBindings: readonly GtlProgramJobBindingRow[];
  readonly roleBindings: readonly GtlProgramRoleBindingRow[];
  readonly graphFunctionRefs: ReadonlySet<string>;
  readonly nodeTypeGraphFunctionRefs: ReadonlySet<string>;
  readonly modules: readonly Module[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const knownRoles = new Set<string>();
  const knownJobs = new Set<string>();
  for (const module of input.modules) {
    for (const role of module.roles) {
      knownRoles.add(role.name);
      knownRoles.add(role.id);
    }
    for (const job of module.jobs) {
      knownJobs.add(job.name);
      knownJobs.add(job.id);
    }
  }

  checkUniqueRows({
    rows: input.jobBindings.map((row) => ({ ref: row.jobRef })),
    surfaceKind: "job_binding",
    ruleRef: "abg://gtl-program/job-binding/unique-ref",
    label: "job binding",
    issues: input.issues
  });
  for (const row of input.jobBindings) {
    if (!knownJobs.has(row.jobRef)) {
      pushRowIssue({
        surfaceKind: "job_binding",
        surfaceRef: row.jobRef,
        ruleRef: "abg://gtl-program/job-binding/job-ref-resolves",
        message: `jobRef ${JSON.stringify(row.jobRef)} does not resolve to a supplied GTL Job`,
        issues: input.issues
      });
    }
    for (const graphFunctionRef of [
      ...row.contractTargetRefs,
      ...row.publicCallableGraphFunctionRefs
    ]) {
      if (!input.graphFunctionRefs.has(graphFunctionRef)) {
        pushRowIssue({
          surfaceKind: "job_binding",
          surfaceRef: row.jobRef,
          ruleRef: "abg://gtl-program/job-binding/graph-function-resolves",
          message: `graph function ref ${JSON.stringify(graphFunctionRef)} does not resolve to a published GraphFunction`,
          issues: input.issues
        });
      }
      if (input.nodeTypeGraphFunctionRefs.has(graphFunctionRef)) {
        pushRowIssue({
          surfaceKind: "job_binding",
          surfaceRef: row.jobRef,
          ruleRef: "abg://gtl-program/job-binding/node-type-not-callable",
          message: `job binding shall not expose node-type GraphFunction ${JSON.stringify(graphFunctionRef)} as callable work`,
          issues: input.issues
        });
      }
    }
    for (const roleRef of row.roleRefs) {
      if (!knownRoles.has(roleRef)) {
        pushRowIssue({
          surfaceKind: "job_binding",
          surfaceRef: row.jobRef,
          ruleRef: "abg://gtl-program/job-binding/role-ref-resolves",
          message: `roleRef ${JSON.stringify(roleRef)} does not resolve to a supplied GTL Role`,
          issues: input.issues
        });
      }
    }
  }

  checkUniqueRows({
    rows: input.roleBindings.map((row) => ({ ref: row.roleRef })),
    surfaceKind: "role_binding",
    ruleRef: "abg://gtl-program/role-binding/unique-ref",
    label: "role binding",
    issues: input.issues
  });
  for (const row of input.roleBindings) {
    if (!knownRoles.has(row.roleRef)) {
      pushRowIssue({
        surfaceKind: "role_binding",
        surfaceRef: row.roleRef,
        ruleRef: "abg://gtl-program/role-binding/role-ref-resolves",
        message: `roleRef ${JSON.stringify(row.roleRef)} does not resolve to a supplied GTL Role`,
        issues: input.issues
      });
    }
    checkNonEmptyArray({
      surfaceKind: "role_binding",
      surfaceRef: row.roleRef,
      ruleRef: "abg://gtl-program/role-binding/capability-refs",
      fieldName: "capabilityRefs",
      values: row.capabilityRefs,
      issues: input.issues
    });
  }
}

function checkSameObjectRows(input: {
  readonly sameObjectProofs: readonly GtlProgramSameObjectRow[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  checkUniqueRows({
    rows: input.sameObjectProofs.map((row) => ({ ref: row.proofRef })),
    surfaceKind: "same_object",
    ruleRef: "abg://gtl-program/same-object/unique-proof-ref",
    label: "same_object proof",
    issues: input.issues
  });
  for (const row of input.sameObjectProofs) {
    checkDigestField({
      surfaceKind: "same_object",
      surfaceRef: row.proofRef,
      ruleRef: "abg://gtl-program/same-object/equality-digest",
      fieldName: "equalityDigest",
      value: row.equalityDigest,
      issues: input.issues
    });
    if (row.leftRef === row.rightRef) {
      pushRowIssue({
        surfaceKind: "same_object",
        surfaceRef: row.proofRef,
        ruleRef: "abg://gtl-program/same-object/nontrivial-proof",
        message: "leftRef and rightRef must be distinct refs bound by the equality digest",
        issues: input.issues
      });
    }
  }
}

function checkExternalToolGateRows(input: {
  readonly externalToolGates: readonly GtlProgramExternalToolGateRow[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  checkUniqueRows({
    rows: input.externalToolGates.map((row) => ({ ref: row.toolGateRef })),
    surfaceKind: "external_tool_gate",
    ruleRef: "abg://gtl-program/external-tool-gate/unique-ref",
    label: "external tool gate",
    issues: input.issues
  });
  for (const row of input.externalToolGates) {
    if (!row.transportRef.startsWith("transport://")) {
      pushRowIssue({
        surfaceKind: "external_tool_gate",
        surfaceRef: row.toolGateRef,
        ruleRef: "abg://gtl-program/external-tool-gate/transport-ref",
        message: "transportRef must be a transport:// ref",
        issues: input.issues
      });
    }
    if (!row.admissionRef.startsWith("admission://")) {
      pushRowIssue({
        surfaceKind: "external_tool_gate",
        surfaceRef: row.toolGateRef,
        ruleRef: "abg://gtl-program/external-tool-gate/admission-ref",
        message: "admissionRef must be an admission:// ref",
        issues: input.issues
      });
    }
    checkNonEmptyArray({
      surfaceKind: "external_tool_gate",
      surfaceRef: row.toolGateRef,
      ruleRef: "abg://gtl-program/external-tool-gate/not-language-truth",
      fieldName: "notLanguageTruthEvidenceRefs",
      values: row.notLanguageTruthEvidenceRefs,
      issues: input.issues
    });
  }
}

const EXACT_PACKAGE_VERSION_PATTERN =
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z][0-9A-Za-z.-]*)?$/u;

function checkAbiPackageVersion(input: {
  readonly subjectRef: string;
  readonly abiPackageVersion: string;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  if (!EXACT_PACKAGE_VERSION_PATTERN.test(input.abiPackageVersion)) {
    input.issues.push(
      issue({
        surfaceKind: "program_inventory",
        surfaceRef: input.subjectRef,
        ruleRef: "abg://gtl-program/version/exact-package-version",
        message: "abiPackageVersion must be an exact package version"
      })
    );
  }
}

type CoverageKey =
  keyof GtlProgramExpectedCoverage & keyof GtlProgramConformanceCoverage;

const COVERAGE_KEYS: readonly CoverageKey[] = Object.freeze([
  "catalogGraphFunctionCount",
  "publishedGraphFunctionCount",
  "graphVectorCount",
  "targetCarrierContractCount",
  "edgeClosureContractCount",
  "overlayCount",
  "publicStartTargetCount",
  "promptAssetCount",
  "pluginContractCount",
  "sourceIdentitySurfaceCount"
]);

function checkExpectedCoverage(input: {
  readonly subjectRef: string;
  readonly expectedCoverage: GtlProgramExpectedCoverage | undefined;
  readonly coverage: GtlProgramConformanceCoverage;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  if (input.expectedCoverage === undefined) {
    input.issues.push(
      issue({
        surfaceKind: "program_inventory",
        surfaceRef: input.subjectRef,
        ruleRef: "abg://gtl-program/coverage/expected-coverage-required",
        message: "GTL program typecheck requires explicit expectedCoverage"
      })
    );
    return;
  }

  let declaredExpectationCount = 0;
  for (const key of COVERAGE_KEYS) {
    const expected = input.expectedCoverage[key];
    if (expected === undefined) {
      continue;
    }
    declaredExpectationCount += 1;
    if (!Number.isInteger(expected) || expected < 0) {
      input.issues.push(
        issue({
          surfaceKind: "program_inventory",
          surfaceRef: input.subjectRef,
          ruleRef: "abg://gtl-program/coverage/expected-count-admitted",
          message: `expectedCoverage.${key} must be a non-negative integer`
        })
      );
      continue;
    }
    if (expected === 0 && key !== "overlayCount") {
      input.issues.push(
        issue({
          surfaceKind: "program_inventory",
          surfaceRef: input.subjectRef,
          ruleRef: "abg://gtl-program/coverage/expected-count-nonzero",
          message: `expectedCoverage.${key} must be greater than zero for a complete GTL program scope`
        })
      );
    }
    if (input.coverage[key] !== expected) {
      input.issues.push(
        issue({
          surfaceKind: "program_inventory",
          surfaceRef: input.subjectRef,
          ruleRef: "abg://gtl-program/coverage/expected-count",
          message: `expectedCoverage.${key} expected ${expected}, observed ${input.coverage[key]}`
        })
      );
    }
  }

  if (declaredExpectationCount === 0) {
    input.issues.push(
      issue({
        surfaceKind: "program_inventory",
        surfaceRef: input.subjectRef,
        ruleRef: "abg://gtl-program/coverage/expected-coverage-nonempty",
        message: "expectedCoverage must declare at least one surface count"
      })
    );
  }
}

const FEATURE_KINDS_WITH_DETERMINISTIC_OBSERVATION =
  new Set<GtlProgramT153FeatureKind>([
    "graph_structure_interface",
    "graph_algebra_edge",
    "graph_algebra_compose",
    "graph_algebra_substitute",
    "graph_algebra_recurse",
    "graph_algebra_fan_out",
    "graph_algebra_fan_in",
    "graph_algebra_gate",
    "graph_algebra_promote",
    "graph_algebra_identity",
    "graph_algebra_same_object",
    "operator_declarations",
    "evaluator_declarations",
    "rule_declarations",
    "f_star_compute_composition",
    "hook_boundaries",
    "target_carrier_contract_law",
    "edge_closure_contract_law",
    "prompt_typed_asset_law",
    "selection_refinement_synthesis_subwork",
    "module_publication",
    "public_start_binding",
    "job_binding",
    "role_binding",
    "external_tool_gates",
    "active_source_identity"
  ]);

function graphFunctionDeclarationHasKey(
  graphFunction: GraphFunction,
  key: string
): boolean {
  return graphFunction.declarations.entries.some((entry) => entry.key === key);
}

function graphFunctionTemplateRefStartsWith(
  graphFunction: GraphFunction,
  prefix: string
): boolean {
  return graphFunction.template.ref.startsWith(prefix);
}

function graphFunctionNameStartsWith(
  graphFunction: GraphFunction,
  prefix: string
): boolean {
  return graphFunction.name.startsWith(prefix);
}

function graphFunctionApplicationKind(
  graphFunction: GraphFunction
): GraphFunctionApplicationOperatorKind | null {
  try {
    return (
      graphFunctionApplicationDeclarationFromDeclarations(
        graphFunction.declarations
      )?.operatorKind ?? null
    );
  } catch {
    return null;
  }
}

function moduleGraphTagStartsWith(
  modules: readonly Module[],
  prefix: string
): boolean {
  return modules.some((module) =>
    module.graphs.some((graph) =>
      graph.tags.some((tag) => tag.startsWith(prefix))
    )
  );
}

function observedFeatureKinds(input: {
  readonly graphFunctions: readonly GraphFunction[];
  readonly modules: readonly Module[];
  readonly vectors: readonly GraphVectorProjection[];
  readonly targetCarrierContracts: readonly GtlProgramTargetCarrierRow[];
  readonly edgeClosureContracts: readonly GtlProgramEdgeClosureRow[];
  readonly promptAssets: readonly GtlProgramPromptAssetRow[];
  readonly sourceIdentitySurfaces: readonly GtlProgramSourceIdentityRow[];
  readonly sourceAuthorityPolicies:
    readonly GtlProgramSourceAuthorityPolicyRow[];
  readonly semanticReviewGates: readonly GtlProgramSemanticReviewGateRow[];
  readonly sameObjectProofs: readonly GtlProgramSameObjectRow[];
  readonly operatorDeclarations: readonly GtlProgramOperatorDeclarationRow[];
  readonly evaluatorDeclarations: readonly GtlProgramEvaluatorDeclarationRow[];
  readonly ruleDeclarations: readonly GtlProgramRuleDeclarationRow[];
  readonly computeCompositions: readonly GtlProgramComputeCompositionRow[];
  readonly computeStageBindings: readonly GtlProgramComputeStageBindingRow[];
  readonly hookBoundaries: readonly GtlProgramHookBoundaryRow[];
  readonly selectionBoundaries: readonly GtlProgramSelectionBoundaryRow[];
  readonly publicStartTargets: readonly GtlProgramPublicStartRow[];
  readonly jobBindings: readonly GtlProgramJobBindingRow[];
  readonly roleBindings: readonly GtlProgramRoleBindingRow[];
  readonly externalToolGates: readonly GtlProgramExternalToolGateRow[];
  readonly runtimeBindings: readonly GtlProgramRuntimeBindingRow[];
  readonly installedContextSurfaces:
    readonly GtlProgramInstalledContextRow[];
  readonly runtimeReentryRoutes: readonly GtlProgramRuntimeReentryRouteRow[];
}): ReadonlySet<GtlProgramT153FeatureKind> {
  const observed = new Set<GtlProgramT153FeatureKind>();
  if (input.graphFunctions.length > 0 && input.vectors.length > 0) {
    observed.add("graph_structure_interface");
    observed.add("graph_algebra_edge");
  }
  if (
    input.graphFunctions.some((graphFunction) =>
      graphFunctionTemplateRefStartsWith(graphFunction, "compose:")
    )
  ) {
    observed.add("graph_algebra_compose");
  }
  if (moduleGraphTagStartsWith(input.modules, "substituted:")) {
    observed.add("graph_algebra_substitute");
  }
  if (
    input.graphFunctions.some((graphFunction) =>
      graphFunctionApplicationKind(graphFunction) === "recurse"
    )
  ) {
    observed.add("graph_algebra_recurse");
  }
  if (
    input.graphFunctions.some((graphFunction) =>
      graphFunctionDeclaresHofApplication(graphFunction)
    )
  ) {
    observed.add("graph_algebra_fan_out");
  }
  if (
    input.graphFunctions.some((graphFunction) =>
      graphFunctionApplicationKind(graphFunction) === "fan_in"
    )
  ) {
    observed.add("graph_algebra_fan_in");
  }
  if (
    input.graphFunctions.some((graphFunction) =>
      graphFunctionApplicationKind(graphFunction) === "gate"
    )
  ) {
    observed.add("graph_algebra_gate");
  }
  if (
    input.graphFunctions.some((graphFunction) =>
      graphFunctionTemplateRefStartsWith(graphFunction, "promote:") ||
      graphFunctionNameStartsWith(graphFunction, "promote(")
    )
  ) {
    observed.add("graph_algebra_promote");
  }
  if (
    input.graphFunctions.some((graphFunction) =>
      graphFunctionNameStartsWith(graphFunction, "identity:")
    )
  ) {
    observed.add("graph_algebra_identity");
  }
  if (input.sameObjectProofs.length > 0) {
    observed.add("graph_algebra_same_object");
  }
  if (
    input.operatorDeclarations.length > 0 ||
    input.vectors.some((vector) => vector.operatorCount > 0) ||
    moduleArrayEntryCount(input.modules, "operators") > 0
  ) {
    observed.add("operator_declarations");
  }
  if (
    input.evaluatorDeclarations.length > 0 ||
    input.vectors.some((vector) => vector.evaluatorCount > 0) ||
    moduleArrayEntryCount(input.modules, "evaluators") > 0
  ) {
    observed.add("evaluator_declarations");
  }
  if (
    input.ruleDeclarations.length > 0 ||
    input.vectors.some((vector) => vector.hasRule) ||
    moduleArrayEntryCount(input.modules, "rules") > 0
  ) {
    observed.add("rule_declarations");
  }
  if (
    input.computeCompositions.length > 0 ||
    input.computeStageBindings.length > 0 ||
    input.vectors.some((vector) =>
      vector.declarationKeyRefs.includes("abg.fn_composition")
    ) ||
    input.graphFunctions.some((graphFunction) =>
      graphFunctionDeclarationHasKey(graphFunction, "abg.fn_composition")
    ) ||
    moduleHasPolicyHookKey(input.modules, "abg.fn_composition")
  ) {
    observed.add("f_star_compute_composition");
  }
  if (
    input.hookBoundaries.length > 0 ||
    input.vectors.some((vector) => vector.declarationKeyRefs.length > 0) ||
    input.graphFunctions.some(
      (graphFunction) => graphFunction.declarations.entries.length > 0
    ) ||
    modulePolicyHookCount(input.modules) > 0 ||
    moduleJobPolicyHookCount(input.modules) > 0 ||
    moduleRolePolicyHookCount(input.modules) > 0
  ) {
    observed.add("hook_boundaries");
  }
  if (input.targetCarrierContracts.length > 0) {
    observed.add("target_carrier_contract_law");
  }
  if (input.edgeClosureContracts.length > 0) {
    observed.add("edge_closure_contract_law");
  }
  if (input.promptAssets.length > 0) {
    observed.add("prompt_typed_asset_law");
  }
  if (
    input.selectionBoundaries.length > 0 ||
    input.vectors.some((vector) => vector.allowsSubwork) ||
    moduleArrayEntryCount(input.modules, "refinementBoundaries") > 0 ||
    moduleArrayEntryCount(input.modules, "candidateFamilies") > 0
  ) {
    observed.add("selection_refinement_synthesis_subwork");
  }
  if (input.modules.length > 0) {
    observed.add("module_publication");
  }
  if (input.publicStartTargets.length > 0) {
    observed.add("public_start_binding");
  }
  if (
    input.jobBindings.length > 0 ||
    moduleArrayEntryCount(input.modules, "jobs") > 0
  ) {
    observed.add("job_binding");
  }
  if (
    input.roleBindings.length > 0 ||
    moduleArrayEntryCount(input.modules, "roles") > 0
  ) {
    observed.add("role_binding");
  }
  if (input.externalToolGates.length > 0) {
    observed.add("external_tool_gates");
  }
  if (
    input.sourceIdentitySurfaces.length > 0 ||
    input.sourceAuthorityPolicies.length > 0 ||
    input.semanticReviewGates.length > 0
  ) {
    observed.add("active_source_identity");
  }
  return observed;
}

function inventoryBackedFeatureKinds(input: {
  readonly graphFunctions: readonly GraphFunction[];
  readonly modules: readonly Module[];
  readonly vectors: readonly GraphVectorProjection[];
  readonly targetCarrierContracts: readonly GtlProgramTargetCarrierRow[];
  readonly edgeClosureContracts: readonly GtlProgramEdgeClosureRow[];
  readonly promptAssets: readonly GtlProgramPromptAssetRow[];
  readonly sourceIdentitySurfaces: readonly GtlProgramSourceIdentityRow[];
  readonly sourceAuthorityPolicies:
    readonly GtlProgramSourceAuthorityPolicyRow[];
  readonly semanticReviewGates: readonly GtlProgramSemanticReviewGateRow[];
  readonly sameObjectProofs: readonly GtlProgramSameObjectRow[];
  readonly operatorDeclarations: readonly GtlProgramOperatorDeclarationRow[];
  readonly evaluatorDeclarations: readonly GtlProgramEvaluatorDeclarationRow[];
  readonly ruleDeclarations: readonly GtlProgramRuleDeclarationRow[];
  readonly computeCompositions: readonly GtlProgramComputeCompositionRow[];
  readonly computeStageBindings: readonly GtlProgramComputeStageBindingRow[];
  readonly hookBoundaries: readonly GtlProgramHookBoundaryRow[];
  readonly selectionBoundaries: readonly GtlProgramSelectionBoundaryRow[];
  readonly publicStartTargets: readonly GtlProgramPublicStartRow[];
  readonly jobBindings: readonly GtlProgramJobBindingRow[];
  readonly roleBindings: readonly GtlProgramRoleBindingRow[];
  readonly externalToolGates: readonly GtlProgramExternalToolGateRow[];
  readonly runtimeBindings: readonly GtlProgramRuntimeBindingRow[];
  readonly installedContextSurfaces:
    readonly GtlProgramInstalledContextRow[];
  readonly runtimeReentryRoutes: readonly GtlProgramRuntimeReentryRouteRow[];
}): ReadonlySet<GtlProgramT153FeatureKind> {
  const backed = new Set<GtlProgramT153FeatureKind>();
  if (input.graphFunctions.length > 0 && input.vectors.length > 0) {
    backed.add("graph_structure_interface");
    backed.add("graph_algebra_edge");
  }
  const algebraObserved = observedFeatureKinds(input);
  for (const featureKind of [
    "graph_algebra_compose",
    "graph_algebra_substitute",
    "graph_algebra_recurse",
    "graph_algebra_fan_out",
    "graph_algebra_fan_in",
    "graph_algebra_gate",
    "graph_algebra_promote",
    "graph_algebra_identity"
  ] as const) {
    if (algebraObserved.has(featureKind)) {
      backed.add(featureKind);
    }
  }
  if (input.sameObjectProofs.length > 0) {
    backed.add("graph_algebra_same_object");
  }
  if (input.operatorDeclarations.length > 0) {
    backed.add("operator_declarations");
  }
  if (input.evaluatorDeclarations.length > 0) {
    backed.add("evaluator_declarations");
  }
  if (input.ruleDeclarations.length > 0) {
    backed.add("rule_declarations");
  }
  if (
    input.computeCompositions.length > 0 &&
    input.computeStageBindings.length > 0
  ) {
    backed.add("f_star_compute_composition");
  }
  if (input.hookBoundaries.length > 0) {
    backed.add("hook_boundaries");
  }
  if (input.targetCarrierContracts.length > 0) {
    backed.add("target_carrier_contract_law");
  }
  if (input.edgeClosureContracts.length > 0) {
    backed.add("edge_closure_contract_law");
  }
  if (input.promptAssets.length > 0) {
    backed.add("prompt_typed_asset_law");
  }
  if (input.selectionBoundaries.length > 0) {
    backed.add("selection_refinement_synthesis_subwork");
  }
  if (input.modules.length > 0) {
    backed.add("module_publication");
  }
  if (input.publicStartTargets.length > 0 && input.runtimeBindings.length > 0) {
    backed.add("public_start_binding");
  }
  if (input.jobBindings.length > 0) {
    backed.add("job_binding");
  }
  if (input.roleBindings.length > 0) {
    backed.add("role_binding");
  }
  if (input.externalToolGates.length > 0) {
    backed.add("external_tool_gates");
  }
  if (
    input.sourceIdentitySurfaces.length > 0 ||
    input.sourceAuthorityPolicies.length > 0 ||
    input.semanticReviewGates.length > 0
  ) {
    backed.add("active_source_identity");
  }
  return backed;
}

function checkFeatureCoverage(input: {
  readonly subjectRef: string;
  readonly manifest: GtlProgramFeatureCoverageManifest;
  readonly observedFeatures: ReadonlySet<GtlProgramT153FeatureKind>;
  readonly inventoryBackedFeatures: ReadonlySet<GtlProgramT153FeatureKind>;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const byFeature = new Map<GtlProgramT153FeatureKind, GtlProgramFeatureCoverageRow[]>();
  for (const row of input.manifest.rows) {
    byFeature.set(row.featureKind, [
      ...(byFeature.get(row.featureKind) ?? []),
      row
    ]);
  }
  for (const featureKind of GTL_PROGRAM_T153_FEATURE_KINDS) {
    const rows = byFeature.get(featureKind) ?? [];
    if (rows.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "feature_coverage",
          surfaceRef: input.manifest.manifestRef,
          ruleRef: "abg://gtl-program/feature-coverage/t153-feature-required",
          message: `featureCoverageManifest must classify T-153 feature ${featureKind}`
        })
      );
      continue;
    }
    if (rows.length > 1) {
      input.issues.push(
        issue({
          surfaceKind: "feature_coverage",
          surfaceRef: input.manifest.manifestRef,
          ruleRef: "abg://gtl-program/feature-coverage/unique-feature-row",
          message: `featureCoverageManifest has ${rows.length} rows for ${featureKind}`
        })
      );
    }
    const row = rows[0]!;
    const requiredRefs = T153_FEATURE_DEFAULT_REQUIREMENT_REFS[featureKind];
    const suppliedRefs = new Set(row.requirementRefs);
    const missingRefs = requiredRefs.filter((ref) => !suppliedRefs.has(ref));
    if (missingRefs.length > 0) {
      input.issues.push(
        issue({
          surfaceKind: "feature_coverage",
          surfaceRef: featureKind,
          ruleRef: "abg://gtl-program/feature-coverage/requirement-trace",
          message: `${featureKind} missing requirement refs ${missingRefs.join(", ")}`
        })
      );
    }
    if (row.disposition === "present" && row.evidenceRefs.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "feature_coverage",
          surfaceRef: featureKind,
          ruleRef: "abg://gtl-program/feature-coverage/present-evidence",
          message: `${featureKind} marked present without evidenceRefs`
        })
      );
    }
    if (row.disposition === "not_used" && row.reasonRefs.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "feature_coverage",
          surfaceRef: featureKind,
          ruleRef: "abg://gtl-program/feature-coverage/not-used-reason",
          message: `${featureKind} marked not_used without reasonRefs`
        })
      );
    }
    if (
      row.disposition === "not_used" &&
      FEATURE_KINDS_WITH_DETERMINISTIC_OBSERVATION.has(featureKind) &&
      input.observedFeatures.has(featureKind)
    ) {
      input.issues.push(
        issue({
          surfaceKind: "feature_coverage",
          surfaceRef: featureKind,
          ruleRef: "abg://gtl-program/feature-coverage/not-used-contradiction",
          message: `${featureKind} marked not_used but matching inventory rows are present`
        })
      );
    }
    if (
      row.disposition === "present" &&
      FEATURE_KINDS_WITH_DETERMINISTIC_OBSERVATION.has(featureKind) &&
      !input.inventoryBackedFeatures.has(featureKind)
    ) {
      input.issues.push(
        issue({
          surfaceKind: "feature_coverage",
          surfaceRef: featureKind,
          ruleRef: "abg://gtl-program/feature-coverage/present-without-inventory",
          message: `${featureKind} marked present but no matching inventory rows were supplied`
        })
      );
    }
  }
}

function sourceIdentityDigestRows(
  rows: readonly GtlProgramSourceIdentityRow[]
): readonly {
  readonly surfaceRef: string;
  readonly textDigest: string;
  readonly evidenceRefs: readonly string[];
}[] {
  return Object.freeze(
    rows.map((row) =>
      Object.freeze({
        surfaceRef: row.surfaceRef,
        textDigest: stableSha256Digest(row.text),
        evidenceRefs: freezeStrings(row.evidenceRefs)
      })
    )
  );
}

function computeInventoryDigests(input: {
  readonly constitutionalSurfaceRows: readonly GtlProgramConstitutionalSurfaceRow[];
  readonly constitutionalLiveFacts: GtlProgramConstitutionalLiveFacts | null;
  readonly declarationSourceRows: readonly GtlProgramDeclarationSourceRow[];
  readonly goldenInstanceBindings: readonly GtlProgramGoldenInstanceBindingRow[];
  readonly underdeterminedDeclarations: readonly GtlProgramUnderdeterminedDeclarationRow[];
  readonly featureCoverageManifest: GtlProgramFeatureCoverageManifest;
  readonly catalogGraphFunctionRefs: readonly string[];
  readonly graphFunctions: readonly GraphFunction[];
  readonly modules: readonly Module[];
  readonly vectors: readonly GraphVectorProjection[];
  readonly targetCarrierContracts: readonly GtlProgramTargetCarrierRow[];
  readonly edgeClosureContracts: readonly GtlProgramEdgeClosureRow[];
  readonly overlays: readonly GtlProgramOverlayRow[];
  readonly publicStartTargets: readonly GtlProgramPublicStartRow[];
  readonly promptAssets: readonly GtlProgramPromptAssetRow[];
  readonly pluginContracts: readonly unknown[];
  readonly pluginResultInterfaces: readonly GtlProgramPluginResultInterfaceRow[];
  readonly sourceIdentitySurfaces: readonly GtlProgramSourceIdentityRow[];
  readonly sourceAuthorityPolicies:
    readonly GtlProgramSourceAuthorityPolicyRow[];
  readonly semanticReviewGates: readonly GtlProgramSemanticReviewGateRow[];
  readonly sameObjectProofs: readonly GtlProgramSameObjectRow[];
  readonly operatorDeclarations: readonly GtlProgramOperatorDeclarationRow[];
  readonly evaluatorDeclarations: readonly GtlProgramEvaluatorDeclarationRow[];
  readonly ruleDeclarations: readonly GtlProgramRuleDeclarationRow[];
  readonly computeCompositions: readonly GtlProgramComputeCompositionRow[];
  readonly computeStageBindings: readonly GtlProgramComputeStageBindingRow[];
  readonly hookBoundaries: readonly GtlProgramHookBoundaryRow[];
  readonly selectionBoundaries: readonly GtlProgramSelectionBoundaryRow[];
  readonly jobBindings: readonly GtlProgramJobBindingRow[];
  readonly roleBindings: readonly GtlProgramRoleBindingRow[];
  readonly externalToolGates: readonly GtlProgramExternalToolGateRow[];
  readonly runtimeBindings: readonly GtlProgramRuntimeBindingRow[];
  readonly installedContextSurfaces:
    readonly GtlProgramInstalledContextRow[];
  readonly runtimeReentryRoutes: readonly GtlProgramRuntimeReentryRouteRow[];
  readonly traversalBindConservation:
    readonly GtlProgramTraversalBindConservationRow[];
  readonly requirementsAlgebraDeclarations:
    readonly GtlRequirementsAlgebraDeclarationBundle[];
}): GtlProgramInventoryDigests {
  return Object.freeze({
    featureCoverageManifest: stableSha256Digest(input.featureCoverageManifest),
    constitutionalSurfaceRows: stableSha256Digest(input.constitutionalSurfaceRows),
    constitutionalLiveFacts: stableSha256Digest(input.constitutionalLiveFacts),
    declarationSourceRows: stableSha256Digest(input.declarationSourceRows),
    goldenInstanceBindings: stableSha256Digest(input.goldenInstanceBindings),
    underdeterminedDeclarations: stableSha256Digest(input.underdeterminedDeclarations),
    catalogGraphFunctionRefs: stableSha256Digest(input.catalogGraphFunctionRefs),
    graphFunctions: stableSha256Digest(input.graphFunctions),
    modules: stableSha256Digest(input.modules),
    materializedVectors: stableSha256Digest(input.vectors),
    targetCarrierContracts: stableSha256Digest(input.targetCarrierContracts),
    edgeClosureContracts: stableSha256Digest(input.edgeClosureContracts),
    overlays: stableSha256Digest(input.overlays),
    publicStartTargets: stableSha256Digest(input.publicStartTargets),
    promptAssets: stableSha256Digest(input.promptAssets),
    pluginContracts: stableSha256Digest(input.pluginContracts),
    pluginResultInterfaces: stableSha256Digest(input.pluginResultInterfaces),
    sourceIdentitySurfaces: stableSha256Digest(
      sourceIdentityDigestRows(input.sourceIdentitySurfaces)
    ),
    sourceAuthorityPolicies: stableSha256Digest(input.sourceAuthorityPolicies),
    semanticReviewGates: stableSha256Digest(input.semanticReviewGates),
    sameObjectProofs: stableSha256Digest(input.sameObjectProofs),
    operatorDeclarations: stableSha256Digest(input.operatorDeclarations),
    evaluatorDeclarations: stableSha256Digest(input.evaluatorDeclarations),
    ruleDeclarations: stableSha256Digest(input.ruleDeclarations),
    computeCompositions: stableSha256Digest(input.computeCompositions),
    computeStageBindings: stableSha256Digest(input.computeStageBindings),
    hookBoundaries: stableSha256Digest(input.hookBoundaries),
    selectionBoundaries: stableSha256Digest(input.selectionBoundaries),
    jobBindings: stableSha256Digest(input.jobBindings),
    roleBindings: stableSha256Digest(input.roleBindings),
    externalToolGates: stableSha256Digest(input.externalToolGates),
    runtimeBindings: stableSha256Digest(input.runtimeBindings),
    installedContextSurfaces: stableSha256Digest(input.installedContextSurfaces),
    runtimeReentryRoutes: stableSha256Digest(input.runtimeReentryRoutes),
    traversalBindConservation: stableSha256Digest(
      input.traversalBindConservation
    ),
    requirementsAlgebraDeclarations: stableSha256Digest(
      input.requirementsAlgebraDeclarations
    )
  });
}

export function typecheckGtlProgram(inputCandidate: unknown): GtlProgramConformanceReport {
  const admission = admitGtlProgramConformanceInput(inputCandidate);
  const input = admission.input;
  const issues: GtlProgramConformanceIssue[] = [...admission.issues];
  checkAbiPackageVersion({
    subjectRef: input.subjectRef,
    abiPackageVersion: input.abiPackageVersion,
    issues
  });
  const graphFunctions = collectPublishedGraphFunctions(input, issues);
  const publishedGraphFunctionRefs = new Set(
    graphFunctions.map((graphFunction) => graphFunction.name)
  );
  const publishedGraphFunctionLookupRefs = new Set(
    graphFunctions.flatMap((graphFunction) => [
      graphFunction.name,
      graphFunction.id
    ])
  );
  const publishedGraphFunctionEquivalentRefs = new Map<string, ReadonlySet<string>>();
  for (const graphFunction of graphFunctions) {
    const equivalentRefs = new Set([
      graphFunction.name,
      graphFunction.id
    ]);
    publishedGraphFunctionEquivalentRefs.set(
      graphFunction.name,
      equivalentRefs
    );
    publishedGraphFunctionEquivalentRefs.set(
      graphFunction.id,
      equivalentRefs
    );
  }
  const publishedNodeTypeGraphFunctionRefs =
    nodeTypeGraphFunctionRefs(graphFunctions);
  const catalogGraphFunctionRefs = uniqueSorted(input.catalogGraphFunctionRefs ?? []);
  const modules = Object.freeze([...(input.modules ?? [])]);

  if (catalogGraphFunctionRefs.length > 0) {
    checkCatalogPublication({
      catalogGraphFunctionRefs,
      publishedGraphFunctionRefs,
      issues
    });
  }

  const vectors = materializeGraphVectors(graphFunctions, issues);
  checkAllowedConsequenceTraversalDeclarations({
    graphFunctions,
    issues
  });
  const graphVectorRefs = new Set(vectors.map((vector) => vector.vectorRef));
  const targetCarrierContracts = Object.freeze([
    ...(input.targetCarrierContracts ?? [])
  ]);
  const edgeClosureContracts = Object.freeze([
    ...(input.edgeClosureContracts ?? [])
  ]);
  const overlays = Object.freeze([...(input.overlays ?? [])]);
  const publicStartTargets = Object.freeze([...(input.publicStartTargets ?? [])]);
  const promptAssets = Object.freeze([...(input.promptAssets ?? [])]);
  const pluginContracts = Object.freeze([...(input.pluginContracts ?? [])]);
  const pluginResultInterfaces = Object.freeze([
    ...(input.pluginResultInterfaces ?? [])
  ]);
  const sourceIdentitySurfaces = Object.freeze([
    ...(input.sourceIdentitySurfaces ?? [])
  ]);
  const sourceAuthorityPolicies = Object.freeze([
    ...(input.sourceAuthorityPolicies ?? [])
  ]);
  const semanticReviewGates = Object.freeze([
    ...(input.semanticReviewGates ?? [])
  ]);
  const sameObjectProofs = Object.freeze([...(input.sameObjectProofs ?? [])]);
  const operatorDeclarations = Object.freeze([
    ...(input.operatorDeclarations ?? [])
  ]);
  const evaluatorDeclarations = Object.freeze([
    ...(input.evaluatorDeclarations ?? [])
  ]);
  const ruleDeclarations = Object.freeze([...(input.ruleDeclarations ?? [])]);
  const computeCompositions = Object.freeze([
    ...(input.computeCompositions ?? [])
  ]);
  const computeStageBindings = Object.freeze([
    ...(input.computeStageBindings ?? [])
  ]);
  const hookBoundaries = Object.freeze([...(input.hookBoundaries ?? [])]);
  const selectionBoundaries = Object.freeze([
    ...(input.selectionBoundaries ?? [])
  ]);
  const jobBindings = Object.freeze([...(input.jobBindings ?? [])]);
  const roleBindings = Object.freeze([...(input.roleBindings ?? [])]);
  const externalToolGates = Object.freeze([
    ...(input.externalToolGates ?? [])
  ]);
  const runtimeBindings = Object.freeze([...(input.runtimeBindings ?? [])]);
  const installedContextSurfaces = Object.freeze([
    ...(input.installedContextSurfaces ?? [])
  ]);
  const declarationSourceRows = Object.freeze([
    ...(input.declarationSourceRows ?? [])
  ]);
  const runtimeReentryRoutes = Object.freeze([
    ...(input.runtimeReentryRoutes ?? [])
  ]);
  const traversalBindConservation = Object.freeze([
    ...(input.traversalBindConservation ?? [])
  ]);
  const requirementsAlgebraDeclarations = Object.freeze([
    ...(input.requirementsAlgebraDeclarations ?? [])
  ]);
  const featureCoverageManifest = input.featureCoverageManifest;
  const knownHostRefs = hostRefs({ graphFunctions, modules, vectors });
  const suppliedPluginContractRefs = pluginContractRefs(pluginContracts);
  const stageBoundPluginRefs = pluginRefsBoundByStages(computeStageBindings);
  const suppliedStageBindingRefs = stageBindingRefs(computeStageBindings);

  checkVectorRows({
    vectors,
    targetCarrierContracts,
    edgeClosureContracts,
    issues
  });
  checkTraversalBindConservationRows({
    vectors,
    traversalBindConservation,
    issues
  });
  checkRequirementsAlgebraDeclarations({
    declarations: requirementsAlgebraDeclarations,
    vectors,
    graphFunctionRefs: publishedGraphFunctionLookupRefs,
    graphVectorRefs,
    issues
  });
  checkOverlays({
    overlays,
    publicStartTargets,
    graphFunctionRefs: publishedGraphFunctionLookupRefs,
    graphFunctionEquivalentRefs: publishedGraphFunctionEquivalentRefs,
    nodeTypeGraphFunctionRefs: publishedNodeTypeGraphFunctionRefs,
    graphVectorRefs,
    issues
  });
  checkPromptAssets({
    promptAssets,
    abiPackageVersion: input.abiPackageVersion,
    issues
  });
  checkPluginContracts({
    pluginContracts,
    issues
  });
  checkSourceIdentities({
    sourceIdentitySurfaces,
    abiPackageVersion: input.abiPackageVersion,
    issues
  });
  checkSourceAuthorityPolicies({
    sourceIdentitySurfaces,
    sourceAuthorityPolicies,
    issues
  });
  checkSemanticReviewGates({
    subjectRef: input.subjectRef,
    semanticReviewGates,
    issues
  });
  checkSameObjectRows({
    sameObjectProofs,
    issues
  });
  checkDeclarationRows({
    operatorDeclarations,
    evaluatorDeclarations,
    ruleDeclarations,
    knownHostRefs,
    issues
  });
  checkComputeCompositionRows({
    computeCompositions,
    knownHostRefs,
    issues
  });
  checkComputeStageBindingRows({
    computeCompositions,
    computeStageBindings,
    pluginContractRefs: suppliedPluginContractRefs,
    issues
  });
  checkPluginResultInterfaceRows({
    pluginResultInterfaces,
    computeStageBindings,
    issues
  });
  checkHookBoundaryRows({
    hookBoundaries,
    knownHostRefs,
    pluginContractRefs: suppliedPluginContractRefs,
    stageBoundPluginRefs,
    issues
  });
  checkSelectionBoundaryRows({
    selectionBoundaries,
    knownHostRefs,
    issues
  });
  checkWorkBindingRows({
    jobBindings,
    roleBindings,
    graphFunctionRefs: publishedGraphFunctionRefs,
    nodeTypeGraphFunctionRefs: publishedNodeTypeGraphFunctionRefs,
    modules,
    issues
  });
  checkExternalToolGateRows({
    externalToolGates,
    issues
  });
  checkRuntimeBindingRows({
    runtimeBindings,
    publicStartTargets,
    modules,
    pluginContractRefs: suppliedPluginContractRefs,
    computeStageBindingRefs: suppliedStageBindingRefs,
    pluginRefsBoundByStages: stageBoundPluginRefs,
    issues
  });
  checkDeclarationSourceRows({
    declarationSourceRows,
    issues
  });
  checkInstalledContextRows({
    abiPackageVersion: input.abiPackageVersion,
    installedContextSurfaces,
    issues
  });
  checkRuntimeReentryRouteRows({
    runtimeReentryRoutes,
    vectors,
    issues
  });
  checkFeatureCoverage({
    subjectRef: input.subjectRef,
    manifest: featureCoverageManifest,
    observedFeatures: observedFeatureKinds({
      graphFunctions,
      modules,
      vectors,
      targetCarrierContracts,
      edgeClosureContracts,
      promptAssets,
      sourceIdentitySurfaces,
      sourceAuthorityPolicies,
      semanticReviewGates,
      sameObjectProofs,
      operatorDeclarations,
      evaluatorDeclarations,
      ruleDeclarations,
      computeCompositions,
      computeStageBindings,
      hookBoundaries,
      selectionBoundaries,
      publicStartTargets,
      jobBindings,
      roleBindings,
      externalToolGates,
      runtimeBindings,
      installedContextSurfaces,
      runtimeReentryRoutes
    }),
    inventoryBackedFeatures: inventoryBackedFeatureKinds({
      graphFunctions,
      modules,
      vectors,
      targetCarrierContracts,
      edgeClosureContracts,
      promptAssets,
      sourceIdentitySurfaces,
      sourceAuthorityPolicies,
      semanticReviewGates,
      sameObjectProofs,
      operatorDeclarations,
      evaluatorDeclarations,
      ruleDeclarations,
      computeCompositions,
      computeStageBindings,
      hookBoundaries,
      selectionBoundaries,
      publicStartTargets,
      jobBindings,
      roleBindings,
      externalToolGates,
      runtimeBindings,
      installedContextSurfaces,
      runtimeReentryRoutes
    }),
    issues
  });

  const coverage = Object.freeze({
    catalogGraphFunctionCount: catalogGraphFunctionRefs.length,
    publishedGraphFunctionCount: publishedGraphFunctionRefs.size,
    graphVectorCount: vectors.length,
    targetCarrierContractCount: targetCarrierContracts.length,
    edgeClosureContractCount: edgeClosureContracts.length,
    overlayCount: overlays.length,
    publicStartTargetCount: publicStartTargets.length,
    promptAssetCount: promptAssets.length,
    pluginContractCount: pluginContracts.length,
    sourceIdentitySurfaceCount: sourceIdentitySurfaces.length
  });
  checkExpectedCoverage({
    subjectRef: input.subjectRef,
    expectedCoverage: input.expectedCoverage,
    coverage,
    issues
  });
  checkConstitutionalDrift({
    rows: Object.freeze([...(input.constitutionalSurfaceRows ?? [])]),
    liveFacts: input.constitutionalLiveFacts ?? null,
    issues
  });
  const inventoryDigests = computeInventoryDigests({
    constitutionalSurfaceRows: Object.freeze([...(input.constitutionalSurfaceRows ?? [])]),
    constitutionalLiveFacts: input.constitutionalLiveFacts ?? null,
    declarationSourceRows,
    goldenInstanceBindings: Object.freeze([...(input.goldenInstanceBindings ?? [])]),
    underdeterminedDeclarations: Object.freeze([...(input.underdeterminedDeclarations ?? [])]),
    featureCoverageManifest,
    catalogGraphFunctionRefs,
    graphFunctions,
    modules,
    vectors,
    targetCarrierContracts,
    edgeClosureContracts,
    overlays,
    publicStartTargets,
    promptAssets,
    pluginContracts,
    pluginResultInterfaces,
    sourceIdentitySurfaces,
    sourceAuthorityPolicies,
    semanticReviewGates,
    sameObjectProofs,
    operatorDeclarations,
    evaluatorDeclarations,
    ruleDeclarations,
    computeCompositions,
    computeStageBindings,
    hookBoundaries,
    selectionBoundaries,
    jobBindings,
    roleBindings,
    externalToolGates,
    runtimeBindings,
    installedContextSurfaces,
    runtimeReentryRoutes,
    traversalBindConservation,
    requirementsAlgebraDeclarations
  });
  const inventoryDigest = stableSha256Digest(inventoryDigests);
  const pluginResultInterfaceCatalog =
    constructAdmittedPluginResultInterfaceCatalog({
      subjectRef: input.subjectRef,
      interfaces: pluginResultInterfaces
    });
  const requirementsAlgebraProjection =
    constructRequirementsAlgebraProjection({
      subjectRef: input.subjectRef,
      declarations: requirementsAlgebraDeclarations,
      vectors
    });
  const traversalUnitProjection = constructTraversalUnitProjection({
    subjectRef: input.subjectRef,
    graphFunctions,
    vectors,
    targetCarrierContracts,
    edgeClosureContracts,
    computeCompositions,
    computeStageBindings,
    pluginResultInterfaces,
    traversalBindConservation,
    requirementsAlgebraProjection,
    overlays,
    publicStartTargets
  });
  checkTraversalUnitProjection({
    projection: traversalUnitProjection,
    issues
  });
  const frozenIssues = Object.freeze([...issues]);
  const reportBasis = Object.freeze({
    subjectRef: input.subjectRef,
    abiPackageVersion: input.abiPackageVersion,
    expectedCoverage: input.expectedCoverage ?? null,
    coverage,
    inventoryDigest,
    inventoryDigests,
    pluginResultInterfaceCatalogDigest:
      pluginResultInterfaceCatalog.catalogDigest,
    requirementsAlgebraProjectionDigest:
      stableSha256Digest(requirementsAlgebraProjection),
    traversalUnitProjectionDigest:
      stableSha256Digest(traversalUnitProjection),
    issues: frozenIssues
  });
  return Object.freeze({
    kind: "gtl_program_conformance_report",
    reportRef: `abg://gtl-program-conformance-report/${stableSha256Digest(reportBasis)}`,
    subjectRef: input.subjectRef,
    abiPackageVersion: input.abiPackageVersion,
    inventoryDigest,
    inventoryDigests,
    pluginResultInterfaceCatalog,
    requirementsAlgebraProjection,
    traversalUnitProjection,
    passed: frozenIssues.length === 0,
    issueCount: frozenIssues.length,
    issues: frozenIssues,
    coverage,
    featureCoverageManifest
  });
}

export function formatGtlProgramConformanceIssues(
  issues: readonly GtlProgramConformanceIssue[]
): string {
  if (issues.length === 0) {
    return "none";
  }
  return issues
    .map(
      (entry) =>
        `${entry.severity} ${entry.ruleRef} ${entry.surfaceKind}:${entry.surfaceRef} - ${entry.message}`
    )
    .join("\n");
}
