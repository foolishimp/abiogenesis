import type { AbgEventStore } from "../abg/event_store.js";
import type { AdmittedImplementationSet } from "../abg/execution_basis.js";
import type { ModulePublication } from "../gtl/contracts.js";
import type {
  LeafInvocationPort,
} from "../implementation/contracts.js";
import type { InstalledLeafSemanticsProjection } from "../product/semantics.js";
import {
  constructAdmittedLeafInvocationPort,
  type LeafInvocationInstall,
} from "./leaf_invocation_port.js";

export interface InstalledLeafInvocationAuthority {
  readonly store: AbgEventStore;
  readonly install: LeafInvocationInstall;
  readonly publication: Readonly<ModulePublication>;
  readonly semanticsProjection: InstalledLeafSemanticsProjection;
}

export async function bindInstalledLeafInvocationPort(
  authority: InstalledLeafInvocationAuthority & {
    readonly implementationSet: AdmittedImplementationSet;
  },
): Promise<LeafInvocationPort> {
  return constructAdmittedLeafInvocationPort(authority);
}
