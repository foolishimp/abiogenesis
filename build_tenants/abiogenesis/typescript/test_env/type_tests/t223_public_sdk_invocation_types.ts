// Validates: REQ-P-PUBLIC-CONTRACTS
// Validates: T-223 native operation/request type matching

import {
  constructPublicOperationInvocation,
  type PublicContractCatalog,
  type PublicOperationInvocationEnvelope
} from "../../code/src/app/m04/public_sdk/index.js";

declare const publicContractCatalog: PublicContractCatalog;

export const workspaceOpenInvocation = constructPublicOperationInvocation({
  operationId: "abg.operation.workspace.open",
  request: {
    targetRoot: "/tmp/t223-native-types",
    expectedWorkspaceSchemaVersion: 1
  },
  publicContractCatalog,
  invocationId: "invocation://t223/native-types",
  requestId: "request://t223/native-types",
  actorRef: null,
  adapter: {
    kind: "native_sdk",
    ref: "sdk://t223/native-types"
  }
});

export const exactWorkspaceOpenInvocation:
  PublicOperationInvocationEnvelope<"abg.operation.workspace.open"> =
    workspaceOpenInvocation;

export const mismatchedOperationRequest = constructPublicOperationInvocation({
  operationId: "abg.operation.workspace.open",
  request: {
    // @ts-expect-error workspace.open cannot carry a catalog.allow request.
    workspaceId: "workspace://t223/native-types",
    catalogId: "catalog://t223/native-types",
    handles: []
  },
  publicContractCatalog,
  invocationId: "invocation://t223/mismatched-types",
  requestId: "request://t223/mismatched-types",
  actorRef: null,
  adapter: {
    kind: "native_sdk",
    ref: "sdk://t223/native-types"
  }
});
