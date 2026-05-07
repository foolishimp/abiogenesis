import {
  serializeEvaluator,
  serializeGraph,
  serializeGraphFunction,
  serializeNode,
  serializeOperator,
  serializeRule,
  serializeSerializedAttrs
} from "../../m01/serialization/carriers.js";
import {
  type CandidateFamily,
  type ContractRef,
  type Job,
  type Module,
  type ModuleImport,
  type RefinementBoundary,
  type Role
} from "../contracts/carriers.js";

export function serializeContractRef(contract: ContractRef): ContractRef {
  return Object.freeze({
    kind: "graph_function",
    targetId: contract.targetId
  });
}

export function serializeRole(role: Role): Role {
  return Object.freeze({
    name: role.name,
    tags: Object.freeze([...role.tags]),
    policyHooks: serializeSerializedAttrs(role.policyHooks),
    id: role.id
  });
}

export function serializeJob(job: Job): Job {
  return Object.freeze({
    name: job.name,
    contracts: Object.freeze(job.contracts.map(serializeContractRef)),
    roles: Object.freeze(job.roles.map(serializeRole)),
    tags: Object.freeze([...job.tags]),
    policyHooks: serializeSerializedAttrs(job.policyHooks),
    id: job.id
  });
}

export function serializeRefinementBoundary(
  boundary: RefinementBoundary
): RefinementBoundary {
  return Object.freeze({
    name: boundary.name,
    inputs: Object.freeze(boundary.inputs.map(serializeNode)),
    outputs: Object.freeze(boundary.outputs.map(serializeNode)),
    hints: serializeSerializedAttrs(boundary.hints),
    tags: Object.freeze([...boundary.tags]),
    id: boundary.id
  });
}

export function serializeCandidateFamily(
  family: CandidateFamily
): CandidateFamily {
  return Object.freeze({
    name: family.name,
    inputs: Object.freeze(family.inputs.map(serializeNode)),
    outputs: Object.freeze(family.outputs.map(serializeNode)),
    candidates: Object.freeze(family.candidates.map(serializeGraphFunction)),
    policyHints: serializeSerializedAttrs(family.policyHints),
    tags: Object.freeze([...family.tags]),
    id: family.id
  });
}

export function serializeModuleImport(moduleImport: ModuleImport): ModuleImport {
  return Object.freeze({
    source: moduleImport.source,
    names: Object.freeze([...moduleImport.names]),
    version: moduleImport.version
  });
}

export function serializeModule(moduleValue: Module): Module {
  return Object.freeze({
    name: moduleValue.name,
    graphs: Object.freeze(moduleValue.graphs.map(serializeGraph)),
    graphFunctions: Object.freeze(
      moduleValue.graphFunctions.map(serializeGraphFunction)
    ),
    refinementBoundaries: Object.freeze(
      moduleValue.refinementBoundaries.map(serializeRefinementBoundary)
    ),
    candidateFamilies: Object.freeze(
      moduleValue.candidateFamilies.map(serializeCandidateFamily)
    ),
    jobs: Object.freeze(moduleValue.jobs.map(serializeJob)),
    roles: Object.freeze(moduleValue.roles.map(serializeRole)),
    operators: Object.freeze(moduleValue.operators.map(serializeOperator)),
    evaluators: Object.freeze(moduleValue.evaluators.map(serializeEvaluator)),
    rules: Object.freeze(moduleValue.rules.map(serializeRule)),
    imports: Object.freeze(moduleValue.imports.map(serializeModuleImport)),
    policyHooks: serializeSerializedAttrs(moduleValue.policyHooks),
    metadata: serializeSerializedAttrs(moduleValue.metadata)
  });
}
