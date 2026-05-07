import {
  interfaceContract,
  type Evaluator,
  type Graph,
  type GraphFunction,
  type Node,
  type Operator,
  type Rule,
  type SerializedAttrs
} from "../../m01/contracts/carriers.js";
import { serializeSerializedAttrs } from "../../m01/serialization/carriers.js";
import {
  type CandidateFamily,
  type ContractRef,
  type Job,
  type Module,
  type ModuleImport,
  type RefinementBoundary,
  type Role
} from "./carriers.js";

export interface ContractRefInit {
  readonly kind: "graph_function";
  readonly targetId: string;
}

export interface RoleInit {
  readonly name: string;
  readonly tags: readonly string[];
  readonly policyHooks: SerializedAttrs;
  readonly id?: string | undefined;
}

export interface JobInit {
  readonly name: string;
  readonly contracts: readonly ContractRef[];
  readonly roles: readonly Role[];
  readonly tags: readonly string[];
  readonly policyHooks: SerializedAttrs;
  readonly id?: string | undefined;
}

export interface RefinementBoundaryInit {
  readonly name: string;
  readonly inputs: readonly Node[];
  readonly outputs: readonly Node[];
  readonly hints: SerializedAttrs;
  readonly tags: readonly string[];
  readonly id?: string | undefined;
}

export interface CandidateFamilyInit {
  readonly name: string;
  readonly inputs: readonly Node[];
  readonly outputs: readonly Node[];
  readonly candidates: readonly GraphFunction[];
  readonly policyHints: SerializedAttrs;
  readonly tags: readonly string[];
  readonly id?: string | undefined;
}

export interface ModuleImportInit {
  readonly source: string;
  readonly names: readonly string[];
  readonly version: string;
}

export interface ModuleInit {
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

function deriveIdentity(prefix: string, payload: unknown): string {
  return `${prefix}:${JSON.stringify(payload)}`;
}

function freezeStrings(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

function freezeContractRefs(values: readonly ContractRef[]): readonly ContractRef[] {
  return Object.freeze([...values]);
}

function freezeRoles(values: readonly Role[]): readonly Role[] {
  return Object.freeze([...values]);
}

function freezeNodes(values: readonly Node[]): readonly Node[] {
  return Object.freeze([...values]);
}

function freezeGraphFunctions(
  values: readonly GraphFunction[]
): readonly GraphFunction[] {
  return Object.freeze([...values]);
}

function freezeModuleImports(
  values: readonly ModuleImport[]
): readonly ModuleImport[] {
  return Object.freeze([...values]);
}

function canonicalContractRef(contract: ContractRef): unknown {
  return {
    kind: contract.kind,
    targetId: contract.targetId
  };
}

function canonicalRole(role: Role): unknown {
  return {
    name: role.name,
    tags: [...role.tags],
    policyHooks: serializeSerializedAttrs(role.policyHooks),
    id: role.id
  };
}

interface MaybeIdentified {
  readonly id?: string | undefined;
}

interface Named {
  readonly name: string;
}

function requireUniqueIds(
  name: string,
  values: readonly MaybeIdentified[]
): void {
  const seen = new Set<string>();
  for (const value of values) {
    const valueId = value.id;
    if (typeof valueId !== "string" || valueId.length === 0) {
      continue;
    }
    if (seen.has(valueId)) {
      throw new TypeError(
        `Module ${JSON.stringify(name)} publishes duplicate declaration id ${JSON.stringify(valueId)}`
      );
    }
    seen.add(valueId);
  }
}

function requireUniqueNames(
  name: string,
  label: string,
  values: readonly Named[]
): void {
  const seen = new Set<string>();
  for (const value of values) {
    const valueName = value.name;
    if (typeof valueName !== "string" || valueName.length === 0) {
      continue;
    }
    if (seen.has(valueName)) {
      throw new TypeError(
        `Module ${JSON.stringify(name)} publishes duplicate ${label} name ${JSON.stringify(valueName)}`
      );
    }
    seen.add(valueName);
  }
}

export function constructContractRef(input: ContractRefInit): ContractRef {
  if (input.kind !== "graph_function") {
    throw new TypeError(
      `ContractRef.kind must be "graph_function" for GTL 3 semantic work, got ${JSON.stringify(input.kind)}`
    );
  }
  if (input.targetId.length === 0) {
    throw new TypeError("ContractRef.targetId must be non-empty");
  }
  return Object.freeze({
    kind: "graph_function",
    targetId: input.targetId
  });
}

export function constructRole(input: RoleInit): Role {
  return Object.freeze({
    name: input.name,
    tags: freezeStrings(input.tags),
    policyHooks: serializeSerializedAttrs(input.policyHooks),
    id:
      input.id ??
      deriveIdentity("role", {
        name: input.name,
        tags: [...input.tags],
        policyHooks: serializeSerializedAttrs(input.policyHooks)
      })
  });
}

export function constructJob(input: JobInit): Job {
  const contracts = freezeContractRefs(input.contracts);
  const roles = freezeRoles(input.roles);
  const policyHooks = serializeSerializedAttrs(input.policyHooks);

  const seenContracts = new Set<string>();
  for (const contract of contracts) {
    const signature = `${contract.kind}:${contract.targetId}`;
    if (seenContracts.has(signature)) {
      throw new TypeError(
        `Job(${JSON.stringify(input.name)}) declares duplicate contract ref ${signature}`
      );
    }
    seenContracts.add(signature);
  }

  const seenRoleNames = new Set<string>();
  const seenRoleIds = new Set<string>();
  for (const role of roles) {
    if (seenRoleNames.has(role.name) || seenRoleIds.has(role.id)) {
      throw new TypeError(
        `Job(${JSON.stringify(input.name)}) declares duplicate role requirement ${JSON.stringify(role.name)}`
      );
    }
    seenRoleNames.add(role.name);
    seenRoleIds.add(role.id);
  }

  return Object.freeze({
    name: input.name,
    contracts,
    roles,
    tags: freezeStrings(input.tags),
    policyHooks,
    id:
      input.id ??
      deriveIdentity("job", {
        name: input.name,
        contracts: contracts.map(canonicalContractRef),
        roles: roles.map(canonicalRole),
        tags: [...input.tags],
        policyHooks
      })
  });
}

export function constructRefinementBoundary(
  input: RefinementBoundaryInit
): RefinementBoundary {
  return Object.freeze({
    name: input.name,
    inputs: freezeNodes(input.inputs),
    outputs: freezeNodes(input.outputs),
    hints: serializeSerializedAttrs(input.hints),
    tags: freezeStrings(input.tags),
    id:
      input.id ??
      deriveIdentity("refinement_boundary", {
        name: input.name,
        inputs: interfaceContract(input.inputs),
        outputs: interfaceContract(input.outputs),
        hints: serializeSerializedAttrs(input.hints),
        tags: [...input.tags]
      })
  });
}

export function constructCandidateFamily(
  input: CandidateFamilyInit
): CandidateFamily {
  if (input.candidates.length === 0) {
    throw new TypeError(
      `CandidateFamily(${JSON.stringify(input.name)}): empty candidates`
    );
  }

  const familyIn = JSON.stringify(interfaceContract(input.inputs));
  const familyOut = JSON.stringify(interfaceContract(input.outputs));

  for (const candidate of input.candidates) {
    const candidateIn = JSON.stringify(interfaceContract(candidate.inputs));
    const candidateOut = JSON.stringify(interfaceContract(candidate.outputs));
    if (candidateIn !== familyIn || candidateOut !== familyOut) {
      throw new TypeError(
        `CandidateFamily(${JSON.stringify(input.name)}): candidate ${JSON.stringify(candidate.name)} contract does not match family contract`
      );
    }
  }

  return Object.freeze({
    name: input.name,
    inputs: freezeNodes(input.inputs),
    outputs: freezeNodes(input.outputs),
    candidates: freezeGraphFunctions(input.candidates),
    policyHints: serializeSerializedAttrs(input.policyHints),
    tags: freezeStrings(input.tags),
    id:
      input.id ??
      deriveIdentity("candidate_family", {
        name: input.name,
        inputs: interfaceContract(input.inputs),
        outputs: interfaceContract(input.outputs),
        candidates: input.candidates.map((candidate) => ({
          id: candidate.id,
          name: candidate.name
        })),
        policyHints: serializeSerializedAttrs(input.policyHints),
        tags: [...input.tags]
      })
  });
}

export function constructModuleImport(input: ModuleImportInit): ModuleImport {
  if (input.source.length === 0) {
    throw new TypeError("ModuleImport.source must be non-empty");
  }
  return Object.freeze({
    source: input.source,
    names: freezeStrings(input.names),
    version: input.version
  });
}

export function constructModule(input: ModuleInit): Module {
  const graphFunctions = freezeGraphFunctions(input.graphFunctions);
  const candidateFamilies = Object.freeze([...input.candidateFamilies]);
  const jobs = Object.freeze([...input.jobs]);
  const roles = freezeRoles(input.roles);
  const policyHooks = serializeSerializedAttrs(input.policyHooks);

  const publishedGraphFunctionIds = new Set(graphFunctions.map((graphFunction) => graphFunction.id));

  requireUniqueIds(input.name, input.graphs);
  requireUniqueIds(input.name, graphFunctions);
  requireUniqueIds(input.name, input.refinementBoundaries);
  requireUniqueIds(input.name, candidateFamilies);
  requireUniqueIds(input.name, jobs);
  requireUniqueIds(input.name, roles);

  requireUniqueNames(input.name, "graph_function", graphFunctions);
  requireUniqueNames(input.name, "job", jobs);
  requireUniqueNames(input.name, "role", roles);
  requireUniqueNames(input.name, "refinement_boundary", input.refinementBoundaries);
  requireUniqueNames(input.name, "candidate_family", candidateFamilies);

  for (const job of jobs) {
    if (job.contracts.length === 0) {
      throw new TypeError(
        `Module ${JSON.stringify(input.name)} publishes semantic job ${JSON.stringify(job.name)} without any graph_function contract`
      );
    }
    for (const contract of job.contracts) {
      if (!publishedGraphFunctionIds.has(contract.targetId)) {
        throw new TypeError(
          `Module ${JSON.stringify(input.name)} job ${JSON.stringify(job.name)} targets unpublished graph function id ${JSON.stringify(contract.targetId)}`
        );
      }
    }
  }

  for (const family of candidateFamilies) {
    for (const candidate of family.candidates) {
      if (!publishedGraphFunctionIds.has(candidate.id)) {
        throw new TypeError(
          `Module ${JSON.stringify(input.name)} candidate family ${JSON.stringify(family.name)} includes unpublished graph function ${JSON.stringify(candidate.name)}`
        );
      }
    }
  }

  return Object.freeze({
    name: input.name,
    graphs: Object.freeze([...input.graphs]),
    graphFunctions,
    refinementBoundaries: Object.freeze([...input.refinementBoundaries]),
    candidateFamilies,
    jobs,
    roles,
    operators: Object.freeze([...input.operators]),
    evaluators: Object.freeze([...input.evaluators]),
    rules: Object.freeze([...input.rules]),
    imports: freezeModuleImports(input.imports),
    policyHooks,
    metadata: serializeSerializedAttrs(input.metadata)
  });
}
