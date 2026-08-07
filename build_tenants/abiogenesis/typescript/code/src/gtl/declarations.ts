import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import { admitModule } from "./admission.js";
import { requireRef } from "../shared/references.js";
import { COMPUTE_REGIME_VALUES } from "./c_algebra.js";
import type {
  CatalogContribution,
  ClosureContract,
  ContractDeclaration,
  EvaluatorDeclaration,
  ImplementationBinding,
  ModulePublication,
  ProductSemanticsBinding,
  RuleDeclaration,
} from "./contracts.js";

const CONTRACT_KINDS = [
  "closure",
  "evidence",
  "failure",
  "input",
  "judgment",
  "output",
  "refusal",
  "transition",
] as const;

function freezeStrings(
  values: readonly string[],
  label: string,
): readonly string[] {
  if (values.some((value) => value.trim().length === 0)) {
    throw new TypeError(`${label} cannot contain an empty reference`);
  }
  return Object.freeze([...values]);
}

function cloneJsonObject(
  value: Readonly<Record<string, JsonValue>>,
): Readonly<Record<string, JsonValue>> {
  if (value === null || Array.isArray(value) || typeof value !== "object") {
    throw new TypeError("Rule.config must be one JSON object");
  }
  return JSON.parse(canonicalJson(value)) as Readonly<Record<string, JsonValue>>;
}

export function evaluatorDeclaration(
  input: Readonly<EvaluatorDeclaration>,
): EvaluatorDeclaration {
  requireRef(input.name, "Evaluator.name");
  requireRef(input.binding, "Evaluator.binding");
  if (!COMPUTE_REGIME_VALUES.includes(input.regime)) {
    throw new TypeError("Evaluator.regime must be F_D, F_P, or F_H");
  }
  return deepFreeze({
    name: input.name,
    regime: input.regime,
    description: input.description,
    binding: input.binding,
    consumedFieldRefs: freezeStrings(
      input.consumedFieldRefs,
      "Evaluator.consumedFieldRefs",
    ),
    tags: freezeStrings(input.tags, "Evaluator.tags"),
  });
}

export function ruleDeclaration(
  input: Readonly<RuleDeclaration>,
): RuleDeclaration {
  requireRef(input.name, "Rule.name");
  requireRef(input.kind, "Rule.kind");
  return deepFreeze({
    name: input.name,
    kind: input.kind,
    config: cloneJsonObject(input.config),
    tags: freezeStrings(input.tags, "Rule.tags"),
  });
}

export function contractDeclaration(
  input: Readonly<ContractDeclaration>,
): ContractDeclaration {
  requireRef(input.contractRef, "Contract.contractRef");
  requireRef(input.valueKind, "Contract.valueKind");
  if (
    input.contractVersion !== "5.0.0" ||
    !CONTRACT_KINDS.includes(input.contractKind)
  ) {
    throw new TypeError("Contract requires the declared 5.0.0 kind");
  }
  return deepFreeze({ ...input });
}

export function implementationBinding(
  input: Readonly<ImplementationBinding>,
): ImplementationBinding {
  for (const [label, value] of Object.entries(input)) {
    if (label !== "kind" && label !== "computeRegime") {
      requireRef(value, `ImplementationBinding.${label}`);
    }
  }
  if (
    input.kind !== "implementation_binding" ||
    (input.computeRegime !== "F_D" && input.computeRegime !== "F_P")
  ) {
    throw new TypeError("ImplementationBinding requires one F_D or F_P leaf");
  }
  return deepFreeze({ ...input });
}

export function productSemanticsBinding(
  input: Readonly<ProductSemanticsBinding>,
): ProductSemanticsBinding {
  for (const [label, value] of Object.entries(input)) {
    if (label !== "kind") {
      requireRef(value, `ProductSemanticsBinding.${label}`);
    }
  }
  if (input.kind !== "product_semantics_binding") {
    throw new TypeError("ProductSemanticsBinding.kind is invalid");
  }
  return deepFreeze({ ...input });
}

export function closureContract(
  input: Readonly<ClosureContract>,
): ClosureContract {
  for (const [label, value] of Object.entries(input)) {
    if (
      label !== "eventKindRefs" &&
      label !== "kind" &&
      label !== "terminalKind" &&
      label !== "closureScope"
    ) {
      requireRef(value, `ClosureContract.${label}`);
    }
  }
  const expectedEvents = input.closureScope === "run"
    ? ["terminal_reached", "frame_closed", "graph_call_closed", "run_closed"]
    : ["terminal_reached", "frame_closed", "graph_call_closed"];
  if (
    input.kind !== "closure_contract" ||
    input.terminalKind !== "completed" ||
    input.eventKindRefs.join("\0") !== expectedEvents.join("\0")
  ) {
    throw new TypeError(
      "ClosureContract scope requires its exact terminal event sequence",
    );
  }
  return deepFreeze({
    ...input,
    eventKindRefs: [...input.eventKindRefs],
  }) as ClosureContract;
}

export function catalogContribution(
  input: Readonly<CatalogContribution>,
): CatalogContribution {
  requireRef(input.handle, "CatalogContribution.handle");
  requireRef(
    input.declarationOrContractRef,
    "CatalogContribution.declarationOrContractRef",
  );
  requireRef(input.owningProductId, "CatalogContribution.owningProductId");
  if (
    input.kind !== "graph_function" &&
    input.kind !== "node_type" &&
    input.kind !== "overlay"
  ) {
    throw new TypeError("CatalogContribution.kind is invalid");
  }
  return deepFreeze({
    ...input,
    programMembershipRefs: freezeStrings(
      input.programMembershipRefs,
      "CatalogContribution.programMembershipRefs",
    ),
    readinessPrerequisiteRefs: freezeStrings(
      input.readinessPrerequisiteRefs,
      "CatalogContribution.readinessPrerequisiteRefs",
    ),
    compatibilityRefs: freezeStrings(
      input.compatibilityRefs,
      "CatalogContribution.compatibilityRefs",
    ),
    provenanceRefs: freezeStrings(
      input.provenanceRefs,
      "CatalogContribution.provenanceRefs",
    ),
  });
}

export function modulePublication(
  input: Readonly<ModulePublication>,
): Readonly<ModulePublication> {
  requireRef(input.moduleRef, "ModulePublication.moduleRef");
  requireRef(input.owningProductId, "ModulePublication.owningProductId");
  requireRef(input.descriptorRef, "ModulePublication.descriptorRef");
  requireRef(
    input.contributionManifestRef,
    "ModulePublication.contributionManifestRef",
  );
  if (
    input.kind !== "module_publication" ||
    input.moduleVersion !== "5.0.0"
  ) {
    throw new TypeError("ModulePublication requires the 5.0.0 carrier");
  }
  return admitModule({
    ...input,
    productSemanticsBinding: productSemanticsBinding(
      input.productSemanticsBinding,
    ),
    contracts: input.contracts.map(contractDeclaration),
    evaluators: input.evaluators.map(evaluatorDeclaration),
    rules: input.rules.map(ruleDeclaration),
    implementationBindings:
      input.implementationBindings.map(implementationBinding),
    closureContracts: input.closureContracts.map(closureContract),
    programs: [...input.programs],
    graphFunctions: [...input.graphFunctions],
    contributions: input.contributions.map(catalogContribution),
  });
}

export const GTL_DECLARATION_CONSTRUCTORS = deepFreeze({
  catalogContribution,
  closureContract,
  contractDeclaration,
  implementationBinding,
  modulePublication,
  productSemanticsBinding,
});
