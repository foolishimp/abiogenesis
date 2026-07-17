import * as v from "valibot";

import {
  absolutePosixPathSchema,
  admitNative,
  admitPublicOutcome,
  constructInvocationAuthority,
  constructPublicInvocation,
  constructPublicOutcome,
  definitionKeySchema,
  definitionKeySchemaFor,
  invocationAuthoritySchema,
  refSchema,
  sha256DigestSchema,
  type DefinitionKey,
  type NativeType,
  type PublicContractCatalogCoordinate,
  type PublicContractCoordinate
} from "../../code/src/app/m04/public_contracts/native_contract_phase_a.js";

type Equal<Left, Right> =
  (<T>() => T extends Left ? 1 : 2) extends
  (<T>() => T extends Right ? 1 : 2)
    ? true
    : false;
type Expect<Value extends true> = Value;

const DIGEST =
  "sha256:1111111111111111111111111111111111111111111111111111111111111111";
const ADMITTED_DIGEST = admitNative(sha256DigestSchema, DIGEST);
const admittedRef = (value: string) => admitNative(refSchema, value);

declare const contractCatalog: PublicContractCatalogCoordinate;
declare const requestContract: PublicContractCoordinate;
declare const resultContract: PublicContractCoordinate;
declare const refusalContract: PublicContractCoordinate;

const workspaceCreateCleanRequestSchema = v.strictObject({
  targetRoot: absolutePosixPathSchema,
  createPolicy: v.literal("clean")
});
const workspaceCreateCleanResultSchema = v.strictObject({
  workspaceRef: refSchema
});
const workspaceCreateCleanRefusalSchema = v.strictObject({
  code: v.literal("workspace_refused")
});

type WorkspaceCreateCleanRequest = NativeType<
  typeof workspaceCreateCleanRequestSchema
>;

export const exactRequest: WorkspaceCreateCleanRequest = admitNative(
  workspaceCreateCleanRequestSchema,
  { targetRoot: "/tmp/t281-type-proof", createPolicy: "clean" }
);

const wrongVariant: WorkspaceCreateCleanRequest = {
  targetRoot: admitNative(absolutePosixPathSchema, "/tmp/t281-type-proof"),
  // @ts-expect-error The imported variant cannot substitute for clean.
  createPolicy: "imported"
};
void wrongVariant;

// @ts-expect-error A plain string cannot mint the branded Ref output type.
const forgedRef: NativeType<typeof refSchema> = "ref:forged";
void forgedRef;

const structuralDefinitionKeyWitnessFamily = {
  "abg.operation.workspace.create": {
    clean: {
      operationId: "abg.operation.workspace.create",
      memberKind: "variant",
      variant: "clean"
    }
  },
  "abg.operation.project.read": {
    ticket_consensus: {
      operationId: "abg.operation.project.read",
      memberKind: "project_read_case",
      caseKey: "ticket_consensus"
    }
  }
} as const;

type StructuralDefinitionKeyWitness = {
  [OperationId in keyof typeof structuralDefinitionKeyWitnessFamily]:
    (typeof structuralDefinitionKeyWitnessFamily)[OperationId][
      keyof (typeof structuralDefinitionKeyWitnessFamily)[OperationId]
    ]
}[keyof typeof structuralDefinitionKeyWitnessFamily];

const workspaceDefinitionKey =
  structuralDefinitionKeyWitnessFamily["abg.operation.workspace.create"].clean;
const workspaceDefinitionKeySchema = definitionKeySchemaFor(
  workspaceDefinitionKey
);
const forbiddenSlots = {
  actor: "forbidden",
  workspace: "forbidden",
  productSet: "forbidden",
  dependencyLock: "forbidden",
  catalogScope: "forbidden",
  executionProgram: "forbidden",
  invocationPolicy: "forbidden",
  transportSteering: "forbidden"
} as const;
const workspaceAuthorityExpectation = {
  definitionKey: workspaceDefinitionKey,
  definitionDigest: DIGEST,
  contractCatalog,
  requiredGrantCapabilityIds: [],
  slotStates: forbiddenSlots
} as const;
export const workspaceAuthority = constructInvocationAuthority({
  definitionKeySchema: workspaceDefinitionKeySchema,
  expected: workspaceAuthorityExpectation,
  basis: {
    authorityBasisRef: "authority-basis:type-workspace",
    authorityBasisDigest: DIGEST,
    definitionKey: workspaceDefinitionKey,
    definitionDigest: DIGEST,
    contractCatalog,
    capabilityGrants: [],
    actor: { state: "forbidden" },
    workspace: { state: "forbidden" },
    productSet: { state: "forbidden" },
    dependencyLock: { state: "forbidden" },
    catalogScope: { state: "forbidden" },
    executionProgram: { state: "forbidden" },
    invocationPolicy: { state: "forbidden" },
    transportSteering: { state: "forbidden" }
  }
});
const workspaceInvocationExpectation = {
  definitionKey: workspaceDefinitionKey,
  definitionDigest: DIGEST,
  contractCatalog,
  requestContract,
  resultContract,
  refusalContract,
  nonTerminalContract: null,
  authority: workspaceAuthorityExpectation
} as const;
export const workspaceInvocation = constructPublicInvocation({
  definitionKeySchema: workspaceDefinitionKeySchema,
  requestSchema: workspaceCreateCleanRequestSchema,
  expected: workspaceInvocationExpectation,
  basis: {
    kind: "public_invocation",
    invocationRef: admittedRef("invocation:type-workspace"),
    definitionKey: workspaceDefinitionKey,
    definitionDigest: ADMITTED_DIGEST,
    contractCatalog,
    authority: workspaceAuthority,
    requestContract,
    requestRef: admittedRef("request:type-workspace"),
    requestDigest: ADMITTED_DIGEST,
    request: exactRequest,
    expectedResultContract: resultContract,
    expectedRefusalContract: refusalContract,
    expectedNonTerminalContract: null,
    correlationRef: admittedRef("correlation:type-workspace"),
    provenanceRefs: []
  }
});
const workspaceOutcomeCandidate = constructPublicOutcome({
  definitionKeySchema: workspaceDefinitionKeySchema,
  outcomeKind: "result",
  outcomeRef: "outcome:type-workspace",
  invocationRef: workspaceInvocation.invocationRef,
  invocationDigest: workspaceInvocation.invocationDigest,
  definitionKey: workspaceDefinitionKey,
  definitionDigest: DIGEST,
  payloadRef: "payload:type-workspace",
  payloadContract: resultContract,
  value: { workspaceRef: "workspace:type-proof" },
  evidenceRefs: [],
  correlationRef: workspaceInvocation.correlationRef,
  provenanceRefs: []
});
export const workspaceOutcome = admitPublicOutcome({
  definitionKeySchema: workspaceDefinitionKeySchema,
  resultSchema: workspaceCreateCleanResultSchema,
  refusalSchema: workspaceCreateCleanRefusalSchema,
  nonTerminalSchema: null,
  invocation: workspaceInvocation,
  contracts: {
    result: resultContract,
    refusal: refusalContract,
    nonTerminal: null
  },
  raw: workspaceOutcomeCandidate
});

const projectReadDefinitionKey =
  structuralDefinitionKeyWitnessFamily["abg.operation.project.read"]
    .ticket_consensus;
const projectReadDefinitionKeySchema = definitionKeySchemaFor(
  projectReadDefinitionKey
);
const projectReadRequestSchema = v.strictObject({
  caseKey: v.literal("ticket_consensus")
});
const projectReadResultSchema = v.strictObject({
  projectionRef: refSchema
});
const projectReadRefusalSchema = v.strictObject({
  code: v.literal("projection_refused")
});
const projectReadAuthorityExpectation = {
  definitionKey: projectReadDefinitionKey,
  definitionDigest: DIGEST,
  contractCatalog,
  requiredGrantCapabilityIds: [],
  slotStates: forbiddenSlots
} as const;
export const projectReadAuthority = constructInvocationAuthority({
  definitionKeySchema: projectReadDefinitionKeySchema,
  expected: projectReadAuthorityExpectation,
  basis: {
    authorityBasisRef: "authority-basis:type-project-read",
    authorityBasisDigest: DIGEST,
    definitionKey: projectReadDefinitionKey,
    definitionDigest: DIGEST,
    contractCatalog,
    capabilityGrants: [],
    actor: { state: "forbidden" },
    workspace: { state: "forbidden" },
    productSet: { state: "forbidden" },
    dependencyLock: { state: "forbidden" },
    catalogScope: { state: "forbidden" },
    executionProgram: { state: "forbidden" },
    invocationPolicy: { state: "forbidden" },
    transportSteering: { state: "forbidden" }
  }
});
const projectReadInvocationExpectation = {
  definitionKey: projectReadDefinitionKey,
  definitionDigest: DIGEST,
  contractCatalog,
  requestContract,
  resultContract,
  refusalContract,
  nonTerminalContract: null,
  authority: projectReadAuthorityExpectation
} as const;
export const projectReadInvocation = constructPublicInvocation({
  definitionKeySchema: projectReadDefinitionKeySchema,
  requestSchema: projectReadRequestSchema,
  expected: projectReadInvocationExpectation,
  basis: {
    kind: "public_invocation",
    invocationRef: admittedRef("invocation:type-project-read"),
    definitionKey: projectReadDefinitionKey,
    definitionDigest: ADMITTED_DIGEST,
    contractCatalog,
    authority: projectReadAuthority,
    requestContract,
    requestRef: admittedRef("request:type-project-read"),
    requestDigest: ADMITTED_DIGEST,
    request: { caseKey: "ticket_consensus" },
    expectedResultContract: resultContract,
    expectedRefusalContract: refusalContract,
    expectedNonTerminalContract: null,
    correlationRef: admittedRef("correlation:type-project-read"),
    provenanceRefs: []
  }
});
const projectReadOutcomeCandidate = constructPublicOutcome({
  definitionKeySchema: projectReadDefinitionKeySchema,
  outcomeKind: "result",
  outcomeRef: "outcome:type-project-read",
  invocationRef: projectReadInvocation.invocationRef,
  invocationDigest: projectReadInvocation.invocationDigest,
  definitionKey: projectReadDefinitionKey,
  definitionDigest: DIGEST,
  payloadRef: "payload:type-project-read",
  payloadContract: resultContract,
  value: { projectionRef: "projection:type-proof" },
  evidenceRefs: [],
  correlationRef: projectReadInvocation.correlationRef,
  provenanceRefs: []
});
export const projectReadOutcome = admitPublicOutcome({
  definitionKeySchema: projectReadDefinitionKeySchema,
  resultSchema: projectReadResultSchema,
  refusalSchema: projectReadRefusalSchema,
  nonTerminalSchema: null,
  invocation: projectReadInvocation,
  contracts: {
    result: resultContract,
    refusal: refusalContract,
    nonTerminal: null
  },
  raw: projectReadOutcomeCandidate
});

const wrongExactOutcome = constructPublicOutcome<
  typeof workspaceDefinitionKeySchema
>({
  definitionKeySchema: workspaceDefinitionKeySchema,
  outcomeKind: "result",
  outcomeRef: "outcome:type-wrong-exact-key",
  invocationRef: projectReadInvocation.invocationRef,
  invocationDigest: projectReadInvocation.invocationDigest,
  // @ts-expect-error A project.read value cannot use the workspace exact schema.
  definitionKey: projectReadDefinitionKey,
  definitionDigest: DIGEST,
  payloadRef: "payload:type-wrong-exact-key",
  payloadContract: resultContract,
  value: { projectionRef: "projection:type-wrong-exact-key" },
  evidenceRefs: [],
  correlationRef: projectReadInvocation.correlationRef,
  provenanceRefs: []
});
void wrongExactOutcome;

// @ts-expect-error The private string-key fixture was hard-broken.
definitionKeySchemaFor("abg.operation.workspace.create(clean)");

// @ts-expect-error Packet APIs require an exact branded key schema.
invocationAuthoritySchema(definitionKeySchema);

// @ts-expect-error Invocation authority carries only the structural definition key.
const removedOperationKey = workspaceAuthority.operationKey;
void removedOperationKey;

type WorkspaceAdmittedOutcome = Extract<
  typeof workspaceOutcome,
  { readonly kind: "public_outcome" }
>;
type ProjectReadAdmittedOutcome = Extract<
  typeof projectReadOutcome,
  { readonly kind: "public_outcome" }
>;
type WorkspaceAdmissionFailure = Extract<
  typeof workspaceOutcome,
  { readonly kind: "outcome_admission_failure" }
>;
type ProjectReadAdmissionFailure = Extract<
  typeof projectReadOutcome,
  { readonly kind: "outcome_admission_failure" }
>;

export type PhaseAStructuralDefinitionKeyProof =
  | Expect<StructuralDefinitionKeyWitness extends DefinitionKey ? true : false>
  | Expect<
      Equal<
        typeof workspaceAuthority.definitionKey,
        typeof workspaceDefinitionKey
      >
    >
  | Expect<
      Equal<
        typeof workspaceInvocation.definitionKey,
        typeof workspaceDefinitionKey
      >
    >
  | Expect<
      Equal<
        WorkspaceAdmittedOutcome["definitionKey"],
        typeof workspaceDefinitionKey
      >
    >
  | Expect<
      Equal<
        typeof projectReadAuthority.definitionKey,
        typeof projectReadDefinitionKey
      >
    >
  | Expect<
      Equal<
        typeof projectReadInvocation.definitionKey,
        typeof projectReadDefinitionKey
      >
    >
  | Expect<
      Equal<
        ProjectReadAdmittedOutcome["definitionKey"],
        typeof projectReadDefinitionKey
      >
    >
  | Expect<
      Equal<
        WorkspaceAdmissionFailure["definitionKey"],
        typeof workspaceDefinitionKey
      >
    >
  | Expect<
      Equal<
        ProjectReadAdmissionFailure["definitionKey"],
        typeof projectReadDefinitionKey
      >
    >;
