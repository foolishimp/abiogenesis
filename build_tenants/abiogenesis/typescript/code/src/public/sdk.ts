import * as Effect from "effect/Effect";

import { runExactDefinition } from "../shared/effect_definition.js";
import type { PublicDefinitionKeyLike } from
  "../shared/public_invocation.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  loadVerifiedInstalledDefinitionBinding,
  type InstalledDefinitionBindingLoadBasis,
  type InstalledDefinitionBindingLoadRefusal,
  type InstalledDefinitionCallFor,
  type InstalledDefinitionHostReceiptFor,
  type InstalledDefinitionKey,
} from "../product/installed_module.js";

function isRecord(
  value: unknown,
): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sameDefinitionKey(
  candidate: unknown,
  expected: PublicDefinitionKeyLike,
): boolean {
  if (!isRecord(candidate)) return false;
  const invocation = candidate.invocation;
  if (!isRecord(invocation)) return false;
  const definitionKey = invocation.definitionKey;
  return isRecord(definitionKey) &&
    definitionKey.operationId === expected.operationId &&
    definitionKey.memberKey === expected.memberKey;
}

function mismatchedCallRefusal<K extends InstalledDefinitionKey>(
  definitionKey: K,
): InstalledDefinitionBindingLoadRefusal<K> {
  return deepFreeze({
    kind: "installed_definition_binding_load_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    definitionKey,
    code: "callable_contract_mismatch" as const,
    message: "definition call does not carry the selected installed definition key",
  });
}

/**
 * The installed SDK's sole definition host operation. It selects exactly one
 * digest-bound callable and crosses the package Effect membrane exactly once.
 */
export async function invokeInstalledDefinition<
  const K extends InstalledDefinitionKey,
>(
  bindingBasis: InstalledDefinitionBindingLoadBasis<K>,
  call: InstalledDefinitionCallFor<K>,
): Promise<
  | InstalledDefinitionBindingLoadRefusal<K>
  | InstalledDefinitionHostReceiptFor<K>
> {
  if (!sameDefinitionKey(call, bindingBasis.definitionKey)) {
    return mismatchedCallRefusal(bindingBasis.definitionKey);
  }
  const selected = await loadVerifiedInstalledDefinitionBinding(bindingBasis);
  if (selected.kind === "installed_definition_binding_load_refusal") {
    return selected;
  }
  return await runExactDefinition(
    call,
    Effect.suspend(() => selected.invoke(call)),
  );
}
