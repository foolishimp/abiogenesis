import * as abg from "../abg/index.js";
import * as product from "../product/index.js";
import * as Effect from "effect/Effect";
import {
  runExactDefinition,
  type DefinitionCall,
  type DefinitionHostReceipt,
  type ExactDefinitionCallable,
} from "../shared/effect_definition.js";
import { exactDefinitionCallMatches } from
  "../shared/definition_binding_mechanics.js";
import {
  OWNER_CONTRACT_SOURCES,
} from "../shared/owner_contract_source_set.js";
import type {
  OwnerContractSourceDeclaration,
} from "../shared/public_function_contracts.js";
import * as validator from "../validator/index.js";
import {
  projectPublicOutcome,
  type IndexedPublicOutcome,
} from "./indexed_outcome.js";

export interface InstalledDefinitionCallTransportRefusal {
  readonly kind: "installed_definition_call_transport_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "invalid_definition_call"
    | "unknown_definition"
    | "installed_binding_unavailable";
  readonly message: string;
}

export type InstalledDefinitionCallTransportResult<
  TPacket extends OwnerContractSourceDeclaration = OwnerContractSourceDeclaration,
  TResourceReceipt = unknown,
> =
  | Readonly<{
    readonly kind: "installed_definition_call_transport_result";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "owner_completed";
    readonly invocation: DefinitionCall<TPacket, unknown>["invocation"];
    readonly receipt: DefinitionHostReceipt<TPacket, TResourceReceipt> &
      Readonly<{
        readonly ownerOutput: NonNullable<
          DefinitionHostReceipt<TPacket, TResourceReceipt>["ownerOutput"]
        >;
        readonly resources: TResourceReceipt;
        readonly failure: null;
      }>;
    readonly outcome: IndexedPublicOutcome<TPacket["definitionKey"]>;
  }>
  | Readonly<{
    readonly kind: "installed_definition_call_transport_result";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "host_failed";
    readonly invocation: DefinitionCall<TPacket, unknown>["invocation"];
    readonly receipt: DefinitionHostReceipt<TPacket, TResourceReceipt> &
      Readonly<{
        readonly ownerOutput: null;
        readonly resources: null;
        readonly failure: NonNullable<
          DefinitionHostReceipt<TPacket, TResourceReceipt>["failure"]
        >;
      }>;
    readonly outcome: null;
  }>;

export type InstalledDefinitionCallTransportOutcome =
  | InstalledDefinitionCallTransportResult
  | InstalledDefinitionCallTransportRefusal;

type InstalledModulePath = "./product" | "./abg" | "./validator";
type InstalledModule = Readonly<Record<string, unknown>>;
type AnyDefinitionCall = DefinitionCall<OwnerContractSourceDeclaration, unknown>;
type AnyDefinitionCallable = ExactDefinitionCallable<
  OwnerContractSourceDeclaration,
  unknown,
  unknown
>;

const INSTALLED_OWNER_MODULES: Readonly<
  Record<InstalledModulePath, InstalledModule>
> = Object.freeze({
  "./product": product as InstalledModule,
  "./abg": abg as InstalledModule,
  "./validator": validator as InstalledModule,
});

function isRecord(
  value: unknown,
): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Readonly<Record<string, unknown>>,
  expected: readonly string[],
): boolean {
  const actual = Object.keys(value).sort();
  const sortedExpected = [...expected].sort();
  return actual.length === sortedExpected.length &&
    actual.every((key, index) => key === sortedExpected[index]);
}

function hasOwnDataProperty(
  value: Readonly<Record<string, unknown>>,
  property: string,
): boolean {
  const descriptor = Object.getOwnPropertyDescriptor(value, property);
  return descriptor !== undefined && Object.hasOwn(descriptor, "value");
}

export function isInstalledDefinitionCallCandidate(
  value: unknown,
): value is AnyDefinitionCall {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ["invocation", "resources"]) ||
    !hasOwnDataProperty(value, "invocation") ||
    !hasOwnDataProperty(value, "resources")
  ) {
    return false;
  }
  const invocation = value.invocation;
  if (
    !isRecord(invocation) ||
    !hasOwnDataProperty(invocation, "kind") ||
    !hasOwnDataProperty(invocation, "definitionKey")
  ) {
    return false;
  }
  const definitionKey = invocation.definitionKey;
  return isRecord(definitionKey) &&
    hasOwnDataProperty(definitionKey, "operationId") &&
    hasOwnDataProperty(definitionKey, "memberKey") &&
    invocation.kind === "public_invocation" &&
    typeof definitionKey.operationId === "string" &&
    typeof definitionKey.memberKey === "string";
}

function refusal(
  code: InstalledDefinitionCallTransportRefusal["code"],
  message: string,
): InstalledDefinitionCallTransportRefusal {
  return Object.freeze({
    kind: "installed_definition_call_transport_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    code,
    message,
  });
}

function selectedCallable(
  call: AnyDefinitionCall,
): AnyDefinitionCallable | InstalledDefinitionCallTransportRefusal {
  const matches = OWNER_CONTRACT_SOURCES.filter(({ packet }) =>
    packet.definitionKey.operationId ===
      call.invocation.definitionKey.operationId &&
    packet.definitionKey.memberKey === call.invocation.definitionKey.memberKey
  );
  if (matches.length !== 1) {
    return refusal(
      matches.length === 0 ? "unknown_definition" : "invalid_definition_call",
      "DefinitionCall must select one exact installed owner contract source",
    );
  }
  if (!exactDefinitionCallMatches(call, matches[0]!.declaration)) {
    return refusal(
      "invalid_definition_call",
      "DefinitionCall does not match its exact installed definition",
    );
  }
  const locator = matches[0]!.packet.executionBindingSpecification.callable;
  if (!Object.hasOwn(INSTALLED_OWNER_MODULES, locator.packageExportPath)) {
    return refusal(
      "installed_binding_unavailable",
      "manifest-bound installed definition module is unavailable",
    );
  }
  const installedModule = INSTALLED_OWNER_MODULES[
    locator.packageExportPath as InstalledModulePath
  ];
  if (!Object.hasOwn(installedModule, locator.namedExport)) {
    return refusal(
      "installed_binding_unavailable",
      "manifest-bound installed definition export is unavailable",
    );
  }
  let selected: unknown = installedModule[locator.namedExport];
  for (const member of locator.memberPath) {
    if (!isRecord(selected) || !Object.hasOwn(selected, member)) {
      return refusal(
        "installed_binding_unavailable",
        "manifest-bound installed definition member is unavailable",
      );
    }
    selected = selected[member];
  }
  return typeof selected === "function"
    ? selected as AnyDefinitionCallable
    : refusal(
      "installed_binding_unavailable",
      "manifest-bound installed definition callable is unavailable",
    );
}

export async function runInstalledDefinitionCallTransport(
  candidate: unknown,
): Promise<InstalledDefinitionCallTransportOutcome> {
  let detachedCandidate: unknown;
  try {
    detachedCandidate = structuredClone(candidate);
  } catch {
    return refusal(
      "invalid_definition_call",
      "transport input is not one canonical DefinitionCall",
    );
  }
  if (!isInstalledDefinitionCallCandidate(detachedCandidate)) {
    return refusal(
      "invalid_definition_call",
      "transport input is not one canonical DefinitionCall",
    );
  }
  const callable = selectedCallable(detachedCandidate);
  if (typeof callable !== "function") return callable;
  const receipt = await runExactDefinition(
    detachedCandidate,
    Effect.suspend(() => callable(detachedCandidate)),
  );
  if (receipt.ownerOutput === null) {
    return Object.freeze({
      kind: "installed_definition_call_transport_result" as const,
      schemaVersion: "5.0.0" as const,
      disposition: "host_failed" as const,
      invocation: detachedCandidate.invocation,
      receipt,
      outcome: null,
    }) as InstalledDefinitionCallTransportResult;
  }
  return Object.freeze({
    kind: "installed_definition_call_transport_result" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "owner_completed" as const,
    invocation: detachedCandidate.invocation,
    receipt,
    outcome: projectPublicOutcome(
      detachedCandidate.invocation,
      receipt.ownerOutput,
    ),
  }) as InstalledDefinitionCallTransportResult;
}
