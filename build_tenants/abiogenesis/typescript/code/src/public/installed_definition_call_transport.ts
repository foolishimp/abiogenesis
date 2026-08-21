import * as abg from "../abg/index.js";
import * as product from "../product/index.js";
import {
  runExactDefinition,
  type DefinitionCall,
  type DefinitionHostReceipt,
  type ExactDefinitionCallable,
} from "../shared/effect_definition.js";
import {
  OWNER_CONTRACT_SOURCES,
} from "../shared/owner_contract_source_set.js";
import type {
  OwnerContractSourceDeclaration,
} from "../shared/public_function_contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import * as validator from "../validator/index.js";

export type InstalledDefinitionCallAcquisition =
  | Readonly<{
    readonly kind: "new";
    readonly eventLogPath: string;
  }>
  | Readonly<{
    readonly kind: "reopen";
    readonly closeHandoff: JsonValue;
  }>;

export interface InstalledDefinitionCallTransportRefusal {
  readonly kind: "installed_definition_call_transport_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "invalid_definition_call"
    | "unknown_definition"
    | "installed_binding_unavailable"
    | "acquisition_mismatch";
  readonly message: string;
}

export interface InstalledDefinitionCallTransportResult {
  readonly kind: "installed_definition_call_transport_result";
  readonly schemaVersion: "5.0.0";
  readonly acquisitionKind: "new" | "reopen";
  readonly receipt: DefinitionHostReceipt;
}

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
  const resources = value.resources;
  if (
    !isRecord(invocation) ||
    !hasOwnDataProperty(invocation, "kind") ||
    !hasOwnDataProperty(invocation, "definitionKey") ||
    !isRecord(resources) ||
    !hasOwnDataProperty(resources, "eventResource")
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

function sameStructure(left: unknown, right: unknown): boolean {
  try {
    return product.canonicalJson(left as JsonValue) ===
      product.canonicalJson(right as JsonValue);
  } catch {
    return false;
  }
}

function acquisitionMatches(
  acquisition: InstalledDefinitionCallAcquisition,
  call: AnyDefinitionCall,
): boolean {
  const resources = call.resources;
  if (!isRecord(resources)) {
    return false;
  }
  const eventResource = resources.eventResource;
  if (!isRecord(eventResource)) return false;
  return acquisition.kind === "new"
    ? eventResource.kind === "new_abg_event_resource" &&
      eventResource.eventLogPath === acquisition.eventLogPath
    : eventResource.kind === "reopen_abg_event_resource" &&
      sameStructure(eventResource.closeHandoff, acquisition.closeHandoff);
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
  acquisition: InstalledDefinitionCallAcquisition,
  candidate: unknown,
): Promise<InstalledDefinitionCallTransportOutcome> {
  let snapshot: unknown;
  try {
    snapshot = structuredClone(candidate);
  } catch {
    return refusal(
      "invalid_definition_call",
      "transport input is not one canonical DefinitionCall",
    );
  }
  if (!isInstalledDefinitionCallCandidate(snapshot)) {
    return refusal(
      "invalid_definition_call",
      "transport input is not one canonical DefinitionCall",
    );
  }
  if (!acquisitionMatches(acquisition, snapshot)) {
    return refusal(
      "acquisition_mismatch",
      "top-level acquisition differs from the DefinitionCall event resource",
    );
  }
  const callable = selectedCallable(snapshot);
  if (typeof callable !== "function") return callable;
  const receipt = await runExactDefinition(snapshot, callable(snapshot));
  return Object.freeze({
    kind: "installed_definition_call_transport_result" as const,
    schemaVersion: "5.0.0" as const,
    acquisitionKind: acquisition.kind,
    receipt,
  });
}
