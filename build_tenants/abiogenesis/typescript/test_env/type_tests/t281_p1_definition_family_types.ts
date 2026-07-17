import {
  buildPrivatePublicOperationDefinitionFamily,
  type PrivatePublicOperationDefinitionFamily,
  type PublicOperationIdentity
} from "../../code/src/app/m04/public_contracts/public_operation_definition_family.js";
import type {
  ProjectReadCaseFamily
} from "../../code/src/app/m04/public_contracts/project_read_case_family.js";

type Equal<Left, Right> =
  (<T>() => T extends Left ? 1 : 2) extends
  (<T>() => T extends Right ? 1 : 2)
    ? true
    : false;
type Expect<Value extends true> = Value;

declare const family: PrivatePublicOperationDefinitionFamily;
const clean = family["abg.operation.workspace.create"].clean;
const open = family["abg.operation.workspace.open"].open;
const consensus = family["abg.operation.project.read"].ticket_consensus;

// @ts-expect-error operation/member definitions remain nominally correlated.
const crossOperation: typeof clean = open;
// @ts-expect-error request and result slots cannot be permuted.
const crossSlot: typeof clean.requestContract = clean.resultContract;
// @ts-expect-error ordinary definitions cannot acquire a projection relation.
const ordinaryRelation = clean.resultContract.projectionRelation;
const projectRelation = consensus.resultContract.projectionRelation;

declare const buildResult: Awaited<
  ReturnType<typeof buildPrivatePublicOperationDefinitionFamily>
>;
if (buildResult.kind === "definition_family_gap") {
  // @ts-expect-error a gap cannot expose a partial family.
  buildResult.family;
  // @ts-expect-error a gap cannot expose a family digest.
  buildResult.familyDigest;
} else {
  const admittedFamily: PrivatePublicOperationDefinitionFamily =
    buildResult.family;
  void admittedFamily;
}

void crossOperation;
void crossSlot;
void ordinaryRelation;
void projectRelation;

export type T281P1DefinitionFamilyTypeProof =
  | Expect<Equal<keyof PrivatePublicOperationDefinitionFamily,
      PublicOperationIdentity>>
  | Expect<Equal<string extends keyof PrivatePublicOperationDefinitionFamily
      ? true : false, false>>
  | Expect<Equal<
      keyof PrivatePublicOperationDefinitionFamily["abg.operation.project.read"],
      keyof ProjectReadCaseFamily
    >>
  | Expect<Equal<
      PrivatePublicOperationDefinitionFamily["abg.operation.workspace.create"]["clean"]["definitionKey"]["variant"],
      "clean"
    >>
  | Expect<Equal<
      PrivatePublicOperationDefinitionFamily["abg.operation.workspace.create"]["clean"]["cliCoordinate"],
      "workspace create --policy <policy>">>
  | Expect<Equal<
      PrivatePublicOperationDefinitionFamily["abg.operation.workspace.create"]["clean"]["adapterExitMap"]["acceptedNonTerminal"],
      null
    >>
  | Expect<Equal<
      typeof family["abg.operation.run.invoke"]["start"]["defaults"]["length"],
      2
    >>
  | Expect<Equal<
      PrivatePublicOperationDefinitionFamily["abg.operation.project.read"]["ticket_consensus"]["resultContract"]["projectionRelation"]["kind"],
      "resolved_owner_projection_relation"
    >>;
