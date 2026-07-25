import type { AbgEventStore } from "../abg/event_store.js";
import type { AdmittedImplementationSet } from "../abg/execution_basis.js";
import type { ModulePublication } from "../gtl/contracts.js";
import {
  constructAdmittedLeafInvocationPort,
  loadInstalledProductSemantics,
} from "../implementation/invocation_port.js";
import type {
  LeafInvocationPort,
  ProductSemanticsProvider,
} from "../implementation/contracts.js";
import type { ProductInstall } from "../product/environment.js";
import type { JsonValue } from "../shared/canonical_json.js";

export interface InstalledProductSemanticsAuthority {
  readonly store: AbgEventStore;
  readonly install: ProductInstall;
  readonly publication: Readonly<ModulePublication>;
}

export async function admitInstalledProductInput(
  authority: InstalledProductSemanticsAuthority,
  contractRef: string,
  value: unknown,
): Promise<Readonly<Record<string, JsonValue>> | null> {
  const semantics = await loadInstalledProductSemantics(authority);
  return semantics.admitInput(contractRef, value);
}

export async function evaluateInstalledInteractionResponse(
  authority: InstalledProductSemanticsAuthority,
  basis: Parameters<ProductSemanticsProvider["evaluateInteractionResponse"]>[0],
  responseCandidate: unknown,
): Promise<Readonly<Record<string, JsonValue>> | null> {
  const semantics = await loadInstalledProductSemantics(authority);
  return semantics.evaluateInteractionResponse(basis, responseCandidate);
}

export async function bindInstalledLeafInvocationPort(
  authority: InstalledProductSemanticsAuthority & {
    readonly implementationSet: AdmittedImplementationSet;
  },
): Promise<LeafInvocationPort> {
  return constructAdmittedLeafInvocationPort(authority);
}
