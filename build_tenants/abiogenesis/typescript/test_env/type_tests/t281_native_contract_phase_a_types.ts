import * as v from "valibot";

import {
  absolutePosixPathSchema,
  admitNative,
  invocationAuthoritySchema,
  refSchema,
  type NativeType
} from "../../code/src/app/m04/public_contracts/native_contract_phase_a.js";

const workspaceCreateCleanRequestSchema = v.strictObject({
  targetRoot: absolutePosixPathSchema,
  createPolicy: v.literal("clean")
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

const operationKey = "abg.operation.workspace.create(clean)" as const;
const authoritySchema = invocationAuthoritySchema(v.literal(operationKey));
type Authority = NativeType<typeof authoritySchema>;

declare const authority: Authority;
export const conservedKey: typeof operationKey = authority.definitionKey;

// @ts-expect-error A different operation key cannot consume this authority packet.
const crossOperationKey: "abg.operation.workspace.open(open)" =
  authority.operationKey;
void crossOperationKey;
