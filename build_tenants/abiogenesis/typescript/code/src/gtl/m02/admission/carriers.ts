// Implements: REQ-L-GTL3-HOOKS
// Implements: REQ-L-GTL3-JOB
// Implements: REQ-L-GTL3-ROLE
// Implements: REQ-L-GTL3-MODULE
// Implements: REQ-L-GTL3-SELECTION-BOUNDARY

import {
  admitEvaluator,
  admitGraph,
  admitGraphFunction,
  admitNode,
  admitOperator,
  admitRule,
  admitSerializedAttrs
} from "../../m01/admission/carriers.js";
import {
  constructCandidateFamily,
  constructContractRef,
  constructJob,
  constructModule,
  constructModuleImport,
  constructRefinementBoundary,
  constructRole
} from "../contracts/constructors.js";
import {
  type CandidateFamily,
  type ContractRef,
  type Job,
  type Module,
  type ModuleImport,
  type RefinementBoundary,
  type Role
} from "../contracts/carriers.js";
import {
  CANDIDATE_FAMILY_FIELDS,
  CONTRACT_REF_FIELDS,
  JOB_FIELDS,
  MODULE_FIELDS,
  MODULE_IMPORT_FIELDS,
  REFINEMENT_BOUNDARY_FIELDS,
  ROLE_FIELDS
} from "../contracts/serialized_shape.js";
import {
  assertKnownFields,
  parseNonEmptyString,
  parseOptionalField,
  parsePlainObject,
  parseString,
  parseStringArray,
  parseUnknownArray
} from "../../../shared/validation/primitives.js";
import {
  admitIJsonText,
  admitIJsonValue
} from "../../../shared/runtime_identity.js";

function parseOptionalId(input: unknown, label: string): string | undefined {
  if (input === undefined) {
    return undefined;
  }
  return parseNonEmptyString(input, `${label}.id`);
}

const EMPTY_SERIALIZED_ATTRS = Object.freeze({
  entries: Object.freeze([])
});

function admitOptionalSerializedAttrs(input: unknown, label: string) {
  return admitSerializedAttrs(input ?? EMPTY_SERIALIZED_ATTRS, label);
}

export function admitContractRef(
  input: unknown,
  label = "ContractRef"
): ContractRef {
  const contractObject = parsePlainObject(input, label);
  assertKnownFields(contractObject, CONTRACT_REF_FIELDS, label);
  const kind = parseString(contractObject["kind"], `${label}.kind`);
  if (kind !== "graph_function") {
    throw new TypeError(
      `${label}.kind: expected "graph_function", got ${JSON.stringify(kind)}`
    );
  }
  return constructContractRef({
    kind,
    targetId: parseNonEmptyString(contractObject["targetId"], `${label}.targetId`)
  });
}

export function admitRole(input: unknown, label = "Role"): Role {
  const roleObject = parsePlainObject(input, label);
  assertKnownFields(roleObject, ROLE_FIELDS, label);
  return constructRole({
    name: parseNonEmptyString(roleObject["name"], `${label}.name`),
    tags: parseStringArray(roleObject["tags"], `${label}.tags`),
    policyHooks: admitSerializedAttrs(roleObject["policyHooks"], `${label}.policyHooks`),
    id: parseOptionalId(parseOptionalField(roleObject, "id"), label)
  });
}

export function admitJob(input: unknown, label = "Job"): Job {
  const jobObject = parsePlainObject(input, label);
  assertKnownFields(jobObject, JOB_FIELDS, label);
  const contractsInput = parseUnknownArray(jobObject["contracts"], `${label}.contracts`);
  const rolesInput = parseUnknownArray(jobObject["roles"], `${label}.roles`);

  return constructJob({
    name: parseNonEmptyString(jobObject["name"], `${label}.name`),
    contracts: Object.freeze(
      contractsInput.map((contractInput, index) =>
        admitContractRef(contractInput, `${label}.contracts[${index}]`)
      )
    ),
    roles: Object.freeze(
      rolesInput.map((roleInput, index) =>
        admitRole(roleInput, `${label}.roles[${index}]`)
      )
    ),
    tags: parseStringArray(jobObject["tags"], `${label}.tags`),
    policyHooks: admitOptionalSerializedAttrs(
      parseOptionalField(jobObject, "policyHooks"),
      `${label}.policyHooks`
    ),
    id: parseOptionalId(parseOptionalField(jobObject, "id"), label)
  });
}

export function admitRefinementBoundary(
  input: unknown,
  label = "RefinementBoundary"
): RefinementBoundary {
  const boundaryObject = parsePlainObject(input, label);
  assertKnownFields(boundaryObject, REFINEMENT_BOUNDARY_FIELDS, label);
  const inputsInput = parseUnknownArray(boundaryObject["inputs"], `${label}.inputs`);
  const outputsInput = parseUnknownArray(boundaryObject["outputs"], `${label}.outputs`);

  return constructRefinementBoundary({
    name: parseNonEmptyString(boundaryObject["name"], `${label}.name`),
    inputs: Object.freeze(
      inputsInput.map((nodeInput, index) =>
        admitNode(nodeInput, `${label}.inputs[${index}]`)
      )
    ),
    outputs: Object.freeze(
      outputsInput.map((nodeInput, index) =>
        admitNode(nodeInput, `${label}.outputs[${index}]`)
      )
    ),
    hints: admitSerializedAttrs(boundaryObject["hints"], `${label}.hints`),
    tags: parseStringArray(boundaryObject["tags"], `${label}.tags`),
    id: parseOptionalId(parseOptionalField(boundaryObject, "id"), label)
  });
}

export function admitCandidateFamily(
  input: unknown,
  label = "CandidateFamily"
): CandidateFamily {
  const familyObject = parsePlainObject(input, label);
  assertKnownFields(familyObject, CANDIDATE_FAMILY_FIELDS, label);
  const inputsInput = parseUnknownArray(familyObject["inputs"], `${label}.inputs`);
  const outputsInput = parseUnknownArray(familyObject["outputs"], `${label}.outputs`);
  const candidatesInput = parseUnknownArray(
    familyObject["candidates"],
    `${label}.candidates`
  );

  return constructCandidateFamily({
    name: parseNonEmptyString(familyObject["name"], `${label}.name`),
    inputs: Object.freeze(
      inputsInput.map((nodeInput, index) =>
        admitNode(nodeInput, `${label}.inputs[${index}]`)
      )
    ),
    outputs: Object.freeze(
      outputsInput.map((nodeInput, index) =>
        admitNode(nodeInput, `${label}.outputs[${index}]`)
      )
    ),
    candidates: Object.freeze(
      candidatesInput.map((candidateInput, index) =>
        admitGraphFunction(candidateInput, `${label}.candidates[${index}]`)
      )
    ),
    policyHints: admitSerializedAttrs(
      familyObject["policyHints"],
      `${label}.policyHints`
    ),
    tags: parseStringArray(familyObject["tags"], `${label}.tags`),
    id: parseOptionalId(parseOptionalField(familyObject, "id"), label)
  });
}

export function admitModuleImport(
  input: unknown,
  label = "ModuleImport"
): ModuleImport {
  const importObject = parsePlainObject(input, label);
  assertKnownFields(importObject, MODULE_IMPORT_FIELDS, label);
  return constructModuleImport({
    source: parseNonEmptyString(importObject["source"], `${label}.source`),
    names: parseStringArray(importObject["names"], `${label}.names`),
    version: parseString(importObject["version"], `${label}.version`)
  });
}

export function admitModule(input: unknown, label = "Module"): Module {
  const moduleObject = parsePlainObject(admitIJsonValue(input, label), label);
  assertKnownFields(moduleObject, MODULE_FIELDS, label);
  const graphsInput = parseUnknownArray(moduleObject["graphs"], `${label}.graphs`);
  const graphFunctionsInput = parseUnknownArray(
    moduleObject["graphFunctions"],
    `${label}.graphFunctions`
  );
  const refinementBoundariesInput = parseUnknownArray(
    moduleObject["refinementBoundaries"],
    `${label}.refinementBoundaries`
  );
  const candidateFamiliesInput = parseUnknownArray(
    moduleObject["candidateFamilies"],
    `${label}.candidateFamilies`
  );
  const jobsInput = parseUnknownArray(moduleObject["jobs"], `${label}.jobs`);
  const rolesInput = parseUnknownArray(moduleObject["roles"], `${label}.roles`);
  const operatorsInput = parseUnknownArray(
    moduleObject["operators"],
    `${label}.operators`
  );
  const evaluatorsInput = parseUnknownArray(
    moduleObject["evaluators"],
    `${label}.evaluators`
  );
  const rulesInput = parseUnknownArray(moduleObject["rules"], `${label}.rules`);
  const importsInput = parseUnknownArray(moduleObject["imports"], `${label}.imports`);

  return constructModule({
    name: parseNonEmptyString(moduleObject["name"], `${label}.name`),
    graphs: Object.freeze(
      graphsInput.map((graphInput, index) =>
        admitGraph(graphInput, `${label}.graphs[${index}]`)
      )
    ),
    graphFunctions: Object.freeze(
      graphFunctionsInput.map((graphFunctionInput, index) =>
        admitGraphFunction(
          graphFunctionInput,
          `${label}.graphFunctions[${index}]`
        )
      )
    ),
    refinementBoundaries: Object.freeze(
      refinementBoundariesInput.map((boundaryInput, index) =>
        admitRefinementBoundary(
          boundaryInput,
          `${label}.refinementBoundaries[${index}]`
        )
      )
    ),
    candidateFamilies: Object.freeze(
      candidateFamiliesInput.map((familyInput, index) =>
        admitCandidateFamily(familyInput, `${label}.candidateFamilies[${index}]`)
      )
    ),
    jobs: Object.freeze(
      jobsInput.map((jobInput, index) =>
        admitJob(jobInput, `${label}.jobs[${index}]`)
      )
    ),
    roles: Object.freeze(
      rolesInput.map((roleInput, index) =>
        admitRole(roleInput, `${label}.roles[${index}]`)
      )
    ),
    operators: Object.freeze(
      operatorsInput.map((operatorInput, index) =>
        admitOperator(operatorInput, `${label}.operators[${index}]`)
      )
    ),
    evaluators: Object.freeze(
      evaluatorsInput.map((evaluatorInput, index) =>
        admitEvaluator(evaluatorInput, `${label}.evaluators[${index}]`)
      )
    ),
    rules: Object.freeze(
      rulesInput.map((ruleInput, index) =>
        admitRule(ruleInput, `${label}.rules[${index}]`)
      )
    ),
    imports: Object.freeze(
      importsInput.map((importInput, index) =>
        admitModuleImport(importInput, `${label}.imports[${index}]`)
      )
    ),
    policyHooks: admitOptionalSerializedAttrs(
      parseOptionalField(moduleObject, "policyHooks"),
      `${label}.policyHooks`
    ),
    metadata: admitSerializedAttrs(moduleObject["metadata"], `${label}.metadata`)
  });
}

export function admitSerializedModuleText(
  input: string,
  label = "SerializedModuleText"
): Module {
  return admitModule(admitIJsonText(input, label), label);
}
