// Implements: T-223 DS-1 public SDK implementation
// Implements: REQ-P-PUBLIC-CONTRACTS

import { catalogResolve } from "../product_intake/resolve.js";
import { catalogVerify } from "../product_intake/verify.js";
import { installProduct } from "../product_intake/install.js";
import { catalogBind } from "../toolchain_binding/bind.js";
import {
  workspaceCreate,
  workspaceOpen
} from "../workspace/operations.js";
import type {
  AdapterIdentity,
  AbiogenesisPublicSdk,
  AnyPublicOperationInvocationEnvelope,
  Ds1PublicOperationContractMap,
  ProductIntakeContext,
  PublicContractCatalog,
  PublicOperationId,
  PublicOperationInvocationEnvelope,
  WorkspaceBindingContext,
  WorkspacePathContext
} from "./carriers.js";
import {
  admitDs1OperationRequest,
  admitPublicOperationInvocationEnvelope
} from "./operation_admission.js";
import { resolvePublicOperationContract } from "./carrier_admission.js";
import {
  catalogAdmit,
  catalogAllow,
  catalogDescribe,
  catalogInvoke,
  catalogList,
  readReplay,
  readResult
} from "./runtime_operations.js";

export interface PublicOperationInvocationConstructionCommon {
  readonly publicContractCatalog: PublicContractCatalog;
  readonly invocationId: string;
  readonly requestId: string;
  readonly actorRef: string | null;
  readonly adapter: AdapterIdentity;
  readonly provenanceRefs?: readonly string[];
  readonly correlationId?: string;
}

export type PublicOperationInvocationConstruction<
  K extends PublicOperationId
> = K extends PublicOperationId
  ? PublicOperationInvocationConstructionCommon & {
      readonly operationId: K;
      readonly request: Ds1PublicOperationContractMap[K]["request"];
    }
  : never;

export type AnyPublicOperationInvocationConstruction =
  PublicOperationInvocationConstruction<PublicOperationId>;

export function constructPublicOperationInvocation<
  K extends PublicOperationId
>(
  input: PublicOperationInvocationConstruction<K>
): PublicOperationInvocationEnvelope<K>;
export function constructPublicOperationInvocation(
  input: AnyPublicOperationInvocationConstruction
): AnyPublicOperationInvocationEnvelope;
export function constructPublicOperationInvocation(
  input: AnyPublicOperationInvocationConstruction
): AnyPublicOperationInvocationEnvelope {
  const resolvedOperation = resolvePublicOperationContract(
    input.publicContractCatalog,
    input.operationId
  );
  const operation = resolvedOperation.row.operationContract;
  if (operation === null) {
    throw new TypeError(
      `public contract row has no operation metadata for ${input.operationId}`
    );
  }
  const request = admitDs1OperationRequest(
    input.operationId,
    input.request,
    `${input.operationId}.request`
  );
  const envelopeInput: unknown = Object.freeze({
      schemaVersion: 1,
      invocationSchemaId: operation.invocationSchemaId,
      invocationSchemaVersion: operation.invocationSchemaVersion,
      invocationSchemaDigest: operation.invocationSchemaDigest,
      invocationId: input.invocationId,
      operationId: input.operationId,
      operationContractVersion: operation.operationVersion,
      operationContractDigest: operation.operationDigest,
      requestId: input.requestId,
      requestSchemaId: operation.requestSchemaId,
      requestSchemaVersion: operation.requestSchemaVersion,
      requestSchemaDigest: operation.requestSchemaDigest,
      resultSchemaId: operation.resultSchemaId,
      resultSchemaVersion: operation.resultSchemaVersion,
      resultSchemaDigest: operation.resultSchemaDigest,
      refusalSchemaId: operation.refusalSchemaId,
      refusalSchemaVersion: operation.refusalSchemaVersion,
      refusalSchemaDigest: operation.refusalSchemaDigest,
      request,
      actorRef: input.actorRef,
      provenanceRefs: Object.freeze([...(input.provenanceRefs ?? [])]),
      adapter: input.adapter,
      correlationId: input.correlationId ?? input.invocationId
    });
  const admitted = admitPublicOperationInvocationEnvelope(
    envelopeInput,
    resolvedOperation
  );
  if (admitted.operationId !== input.operationId) {
    throw new TypeError(
      `constructed invocation changed operation identity from ${input.operationId}`
    );
  }
  return admitted;
}

function admitEnvelope(
  input: PublicOperationInvocationEnvelope<"abg.operation.workspace.create">,
  context: WorkspacePathContext,
  operationId: "abg.operation.workspace.create"
): PublicOperationInvocationEnvelope<"abg.operation.workspace.create">;
function admitEnvelope(
  input: PublicOperationInvocationEnvelope<"abg.operation.workspace.open">,
  context: WorkspacePathContext,
  operationId: "abg.operation.workspace.open"
): PublicOperationInvocationEnvelope<"abg.operation.workspace.open">;
function admitEnvelope(
  input: PublicOperationInvocationEnvelope<"abg.operation.catalog.resolve">,
  context: ProductIntakeContext,
  operationId: "abg.operation.catalog.resolve"
): PublicOperationInvocationEnvelope<"abg.operation.catalog.resolve">;
function admitEnvelope(
  input: PublicOperationInvocationEnvelope<"abg.operation.catalog.verify">,
  context: ProductIntakeContext,
  operationId: "abg.operation.catalog.verify"
): PublicOperationInvocationEnvelope<"abg.operation.catalog.verify">;
function admitEnvelope(
  input: PublicOperationInvocationEnvelope<"abg.operation.install.install">,
  context: ProductIntakeContext,
  operationId: "abg.operation.install.install"
): PublicOperationInvocationEnvelope<"abg.operation.install.install">;
function admitEnvelope(
  input: PublicOperationInvocationEnvelope<"abg.operation.catalog.bind">,
  context: WorkspaceBindingContext,
  operationId: "abg.operation.catalog.bind"
): PublicOperationInvocationEnvelope<"abg.operation.catalog.bind">;
function admitEnvelope(
  input: unknown,
  context:
    | WorkspacePathContext
    | ProductIntakeContext
    | WorkspaceBindingContext,
  operationId: PublicOperationId
): AnyPublicOperationInvocationEnvelope {
  const envelope = admitPublicOperationInvocationEnvelope(
    input,
    resolvePublicOperationContract(context.publicContractCatalog, operationId)
  );
  if (envelope.operationId !== operationId) {
    throw new TypeError(`AbiogenesisPublicSdk expected ${operationId}`);
  }
  return envelope;
}

export function createAbiogenesisPublicSdk(): AbiogenesisPublicSdk {
  const sdk: AbiogenesisPublicSdk = {
    async workspaceCreate(context, invocationInput) {
      const invocation = admitEnvelope(
        invocationInput,
        context,
        "abg.operation.workspace.create"
      );
      if (invocation.actorRef === null) {
        throw new TypeError("workspace.create requires actor attribution");
      }
      return await workspaceCreate(invocation.request, context, {
        actorRef: invocation.actorRef,
        provenanceRefs: invocation.provenanceRefs
      });
    },
    async workspaceOpen(context, invocationInput) {
      const invocation = admitEnvelope(
        invocationInput,
        context,
        "abg.operation.workspace.open"
      );
      return await workspaceOpen(invocation.request, context);
    },
    async catalogResolve(context, invocationInput) {
      const invocation = admitEnvelope(
        invocationInput,
        context,
        "abg.operation.catalog.resolve"
      );
      return catalogResolve(invocation.request, context);
    },
    async catalogVerify(context, invocationInput) {
      const invocation = admitEnvelope(
        invocationInput,
        context,
        "abg.operation.catalog.verify"
      );
      return await catalogVerify(invocation.request, context);
    },
    async installProduct(context, invocationInput) {
      const invocation = admitEnvelope(
        invocationInput,
        context,
        "abg.operation.install.install"
      );
      if (invocation.actorRef === null) {
        throw new TypeError("install.install requires actor attribution");
      }
      return await installProduct(invocation.request, context, {
        actorRef: invocation.actorRef,
        provenanceRefs: invocation.provenanceRefs
      });
    },
    async catalogBind(context, invocationInput) {
      const invocation = admitEnvelope(
        invocationInput,
        context,
        "abg.operation.catalog.bind"
      );
      if (invocation.actorRef === null) {
        throw new TypeError("catalog.bind requires actor attribution");
      }
      return await catalogBind(invocation.request, context, {
        actorRef: invocation.actorRef,
        provenanceRefs: invocation.provenanceRefs
      });
    },
    catalogAdmit,
    catalogList,
    catalogDescribe,
    catalogAllow,
    catalogInvoke,
    readResult,
    readReplay
  };
  return Object.freeze(sdk);
}

export const abiogenesisPublicSdk = createAbiogenesisPublicSdk();
