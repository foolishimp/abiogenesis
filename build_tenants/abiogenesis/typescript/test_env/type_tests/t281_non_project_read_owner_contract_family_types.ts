import type {
  NonProjectReadOwnerContractFamily
} from "../../code/src/app/m04/public_contracts/non_project_read_owner_contract_family.js";

type Equal<Left, Right> =
  (<T>() => T extends Left ? 1 : 2) extends
  (<T>() => T extends Right ? 1 : 2)
    ? true
    : false;
type Expect<Value extends true> = Value;

type ExpectedOperationId =
  | "abg.operation.workspace.create"
  | "abg.operation.workspace.open"
  | "abg.operation.product.verify"
  | "abg.operation.product.resolve"
  | "abg.operation.product.install"
  | "abg.operation.workspace.bind"
  | "abg.operation.catalog.admit"
  | "abg.operation.catalog.view"
  | "abg.operation.catalog.apply"
  | "abg.operation.run.invoke"
  | "abg.operation.run.continue"
  | "abg.operation.interaction.respond"
  | "abg.operation.result.assess"
  | "abg.operation.witness.admit"
  | "abg.operation.tuning.transition"
  | "abg.operation.conformance.evaluate"
  | "abg.operation.product.materialize"
  | "abg.operation.release.snapshot";

export type _ExactOperationFamily = Expect<
  Equal<keyof NonProjectReadOwnerContractFamily, ExpectedOperationId>
>;
export type _WorkspaceCreateVariants = Expect<
  Equal<
    keyof NonProjectReadOwnerContractFamily["abg.operation.workspace.create"],
    "clean" | "imported"
  >
>;
export type _CatalogApplyVariants = Expect<
  Equal<
    keyof NonProjectReadOwnerContractFamily["abg.operation.catalog.apply"],
    "node_type" | "overlay"
  >
>;
export type _InteractionVariants = Expect<
  Equal<
    keyof NonProjectReadOwnerContractFamily["abg.operation.interaction.respond"],
    "select" | "approve" | "reject" | "assess" | "answer_escalation"
  >
>;
export type _WitnessVariants = Expect<
  Equal<
    keyof NonProjectReadOwnerContractFamily["abg.operation.witness.admit"],
    | "reprice"
    | "attest"
    | "hygiene-stamp"
    | "intake"
    | "run-resumed"
    | "run-stopped"
  >
>;
export type _CleanDefinitionOperation = Expect<
  Equal<
    NonProjectReadOwnerContractFamily["abg.operation.workspace.create"]["clean"]["definitionKey"]["operationId"],
    "abg.operation.workspace.create"
  >
>;
export type _CleanDefinitionKind = Expect<
  Equal<
    NonProjectReadOwnerContractFamily["abg.operation.workspace.create"]["clean"]["definitionKey"]["memberKind"],
    "variant"
  >
>;
export type _CleanDefinitionVariant = Expect<
  Equal<
    NonProjectReadOwnerContractFamily["abg.operation.workspace.create"]["clean"]["definitionKey"]["variant"],
    "clean"
  >
>;
export type _CleanIsTerminal = Expect<
  Equal<
    NonProjectReadOwnerContractFamily["abg.operation.workspace.create"]["clean"]["nonterminal"]["kind"],
    "nonterminal_not_declared"
  >
>;
export type _InvokeDeclaresNonterminal = Expect<
  Equal<
    NonProjectReadOwnerContractFamily["abg.operation.run.invoke"]["invoke"]["nonterminal"]["kind"],
    "owner_contract_slot_resolved"
  >
>;
export type _InvokeRequestSlot = Expect<
  Equal<
    NonProjectReadOwnerContractFamily["abg.operation.run.invoke"]["invoke"]["request"]["coordinate"]["slot"],
    "request"
  >
>;
type CleanRequestSlot =
  NonProjectReadOwnerContractFamily["abg.operation.workspace.create"]["clean"]["request"];
export type _SubordinateSlotHasNoContractShapeBasis = Expect<
  Equal<
    Extract<
      keyof CleanRequestSlot,
      "contractShapeBasisRef" | "contractShapeBasisDigest"
    >,
    never
  >
>;
export type _SubordinateSlotRetainsOwnerAuthority = Expect<
  Equal<
    Extract<
      keyof CleanRequestSlot,
      "ownerAuthorityRef" | "ownerAuthorityDigest"
    >,
    "ownerAuthorityRef" | "ownerAuthorityDigest"
  >
>;

declare const family: NonProjectReadOwnerContractFamily;

// @ts-expect-error A result contract cannot occupy the same key's request slot.
const wrongSlot = family["abg.operation.workspace.create"].clean.result satisfies typeof family["abg.operation.workspace.create"]["clean"]["request"];
void wrongSlot;

// @ts-expect-error Another variant's structural definition key cannot substitute.
const wrongVariant = family["abg.operation.workspace.create"].imported.definitionKey satisfies typeof family["abg.operation.workspace.create"]["clean"]["definitionKey"];
void wrongVariant;
