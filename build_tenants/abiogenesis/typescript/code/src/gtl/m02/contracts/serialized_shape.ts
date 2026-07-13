export const CONTRACT_REF_FIELDS = Object.freeze(["kind", "targetId"] as const);
export const ROLE_FIELDS = Object.freeze(["name", "tags", "policyHooks", "id"] as const);
export const JOB_FIELDS = Object.freeze([
  "name",
  "contracts",
  "roles",
  "tags",
  "policyHooks",
  "id"
] as const);
export const REFINEMENT_BOUNDARY_FIELDS = Object.freeze([
  "name",
  "inputs",
  "outputs",
  "hints",
  "tags",
  "id"
] as const);
export const CANDIDATE_FAMILY_FIELDS = Object.freeze([
  "name",
  "inputs",
  "outputs",
  "candidates",
  "policyHints",
  "tags",
  "id"
] as const);
export const MODULE_IMPORT_FIELDS = Object.freeze(["source", "names", "version"] as const);
export const MODULE_FIELDS = Object.freeze([
  "name",
  "graphs",
  "graphFunctions",
  "refinementBoundaries",
  "candidateFamilies",
  "jobs",
  "roles",
  "operators",
  "evaluators",
  "rules",
  "imports",
  "policyHooks",
  "metadata"
] as const);
