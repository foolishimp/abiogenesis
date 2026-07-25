import type { AbgEventStore } from "../abg/event_store.js";
import type { AdmittedImplementationSet } from "../abg/execution_basis.js";
import type { ModulePublication } from "../gtl/contracts.js";
import type {
  LeafContractSemanticsPort,
  LeafInvocationPort,
} from "../implementation/contracts.js";
import type { ProductInstall } from "../product/environment.js";
import { constructAdmittedLeafInvocationPort } from "./leaf_invocation_port.js";

export interface InstalledLeafInvocationAuthority {
  readonly store: AbgEventStore;
  readonly install: ProductInstall;
  readonly publication: Readonly<ModulePublication>;
  readonly semantics: LeafContractSemanticsPort;
}

export async function bindInstalledLeafInvocationPort(
  authority: InstalledLeafInvocationAuthority & {
    readonly implementationSet: AdmittedImplementationSet;
  },
): Promise<LeafInvocationPort> {
  return constructAdmittedLeafInvocationPort(authority);
}
