import type { ValidatedRuntimeEventPrefix } from "../abg/event_prefix.js";
import type { ExactPrefixArtifactTruthProjection } from "../abg/artifact_truth.js";
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
  readonly prefix: ValidatedRuntimeEventPrefix;
  readonly artifactTruth: ExactPrefixArtifactTruthProjection;
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
