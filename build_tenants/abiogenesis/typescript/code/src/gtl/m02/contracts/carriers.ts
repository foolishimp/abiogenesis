// Implements: REQ-L-GTL3-HOOKS
// Implements: REQ-L-GTL3-JOB
// Implements: REQ-L-GTL3-ROLE
// Implements: REQ-L-GTL3-MODULE
// Implements: REQ-L-GTL3-SELECTION-BOUNDARY
// Implements: REQ-L-GTL3-IDENTITY

import type {
  Evaluator,
  Graph,
  GraphFunction,
  Node,
  Operator,
  Rule,
  SerializedAttrs
} from "../../m01/contracts/carriers.js";

export interface ContractRef {
  readonly kind: "graph_function";
  readonly targetId: string;
}

export interface Role {
  readonly name: string;
  readonly tags: readonly string[];
  readonly policyHooks: SerializedAttrs;
  readonly id: string;
}

export interface Job {
  readonly name: string;
  readonly contracts: readonly ContractRef[];
  readonly roles: readonly Role[];
  readonly tags: readonly string[];
  readonly policyHooks: SerializedAttrs;
  readonly id: string;
}

export interface RefinementBoundary {
  readonly name: string;
  readonly inputs: readonly Node[];
  readonly outputs: readonly Node[];
  readonly hints: SerializedAttrs;
  readonly tags: readonly string[];
  readonly id: string;
}

export interface CandidateFamily {
  readonly name: string;
  readonly inputs: readonly Node[];
  readonly outputs: readonly Node[];
  readonly candidates: readonly GraphFunction[];
  readonly policyHints: SerializedAttrs;
  readonly tags: readonly string[];
  readonly id: string;
}

export interface ModuleImport {
  readonly source: string;
  readonly names: readonly string[];
  readonly version: string;
}

export interface Module {
  readonly name: string;
  readonly graphs: readonly Graph[];
  readonly graphFunctions: readonly GraphFunction[];
  readonly refinementBoundaries: readonly RefinementBoundary[];
  readonly candidateFamilies: readonly CandidateFamily[];
  readonly jobs: readonly Job[];
  readonly roles: readonly Role[];
  readonly operators: readonly Operator[];
  readonly evaluators: readonly Evaluator[];
  readonly rules: readonly Rule[];
  readonly imports: readonly ModuleImport[];
  readonly policyHooks: SerializedAttrs;
  readonly metadata: SerializedAttrs;
}
