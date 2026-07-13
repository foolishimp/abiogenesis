export const SERIALIZED_JSON_ARRAY_FIELDS = Object.freeze(["kind", "items"] as const);
export const SERIALIZED_JSON_OBJECT_FIELDS = Object.freeze(["kind", "entries"] as const);
export const SERIALIZED_JSON_OBJECT_ENTRY_FIELDS = Object.freeze(["key", "value"] as const);
export const HOOK_REF_FIELDS = Object.freeze(["ref", "config"] as const);
export const SERIALIZED_ATTR_VALUE_FIELDS = Object.freeze(["kind", "value"] as const);
export const SERIALIZED_ATTR_ENTRY_FIELDS = Object.freeze(["key", "value"] as const);
export const SERIALIZED_ATTRS_FIELDS = Object.freeze(["entries"] as const);
export const CONTEXT_FIELDS = Object.freeze(["name", "locator", "digest"] as const);
export const SCHEMA_REF_FIELDS = Object.freeze(["kind", "ref"] as const);
export const ASSET_SURFACE_FIELDS = Object.freeze([
  "kind",
  "requiredContexts",
  "standardsRefs",
  "outputContractRefs",
  "constructorRefs",
  "constructorInputAssetKinds",
  "rendererRefs",
  "renderedViewDigestPolicyRef",
  "sectionKindRefs",
  "clauseKindRefs",
  "authoritySlots",
  "proofObligationRefs"
] as const);
export const ASSET_SURFACE_AUTHORITY_SLOT_FIELDS = Object.freeze([
  "authorityKindRef",
  "disposition",
  "fallbackPreconditionRefs"
] as const);
export const NODE_FIELDS = Object.freeze([
  "name",
  "schema",
  "typeRef",
  "markov",
  "assetSurface",
  "tags",
  "id"
] as const);
export const OPERATOR_FIELDS = Object.freeze(["name", "regime", "binding", "tags"] as const);
export const EVALUATOR_FIELDS = Object.freeze([
  "name",
  "regime",
  "description",
  "binding",
  "consumedFieldRefs",
  "tags"
] as const);
export const RULE_FIELDS = Object.freeze(["name", "kind", "config", "tags"] as const);
export const GRAPH_VECTOR_FIELDS = Object.freeze([
  "name",
  "source",
  "target",
  "operators",
  "evaluators",
  "contexts",
  "rule",
  "allowsSubwork",
  "declarations",
  "tags",
  "id"
] as const);
export const GRAPH_FIELDS = Object.freeze([
  "name",
  "inputs",
  "outputs",
  "nodes",
  "vectors",
  "contexts",
  "rules",
  "effects",
  "tags",
  "id"
] as const);
export const ENV_REF_FIELDS = Object.freeze(["requires", "provides", "carries"] as const);
export const INLINE_TEMPLATE_REF_FIELDS = Object.freeze([
  "kind",
  "ref",
  "graph",
  "version"
] as const);
export const SYMBOLIC_TEMPLATE_REF_FIELDS = Object.freeze([
  "kind",
  "ref",
  "graph",
  "version"
] as const);
export const GRAPH_FUNCTION_FIELDS = Object.freeze([
  "name",
  "environment",
  "inputs",
  "outputs",
  "template",
  "effects",
  "declarations",
  "tags",
  "id"
] as const);
