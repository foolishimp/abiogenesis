import type { VerifiedProductArtifact } from "./contracts.js";
import type {
  ProductInstall,
  ProductSet,
  ResolvedProductLock,
  WorkspaceBinding,
} from "./environment.js";
import type { ProductInstallCandidate } from "./contracts.js";
import { deepFreeze } from "../shared/immutable.js";

export interface VerifiedOperationState {
  readonly verified: VerifiedProductArtifact;
}

export interface ResolveOperationState {
  readonly verifiedInvocationRefs: readonly string[];
  readonly lock: ResolvedProductLock;
}

export interface InstallOperationState {
  readonly candidate: ProductInstallCandidate;
  readonly install: ProductInstall;
  readonly lock: ResolvedProductLock;
}

export interface WorkspaceOperationState {
  readonly lock: ResolvedProductLock;
  readonly productSet: ProductSet;
  readonly binding: WorkspaceBinding;
}

/** Product-owned carrier registry for one explicit public-operation transcript. */
export class RootOperationState {
  readonly #seenInvocations = new Set<string>();
  readonly #verified = new Map<string, VerifiedOperationState>();
  readonly #resolutions = new Map<string, ResolveOperationState>();
  readonly #installs = new Map<string, InstallOperationState>();
  readonly #workspaces = new Map<string, WorkspaceOperationState>();

  claimInvocation(invocationRef: string): boolean {
    if (this.#seenInvocations.has(invocationRef)) return false;
    this.#seenInvocations.add(invocationRef);
    return true;
  }

  rememberVerified(invocationRef: string, value: VerifiedOperationState): void {
    this.#verified.set(invocationRef, deepFreeze(value));
  }

  verified(invocationRef: string): VerifiedOperationState | null {
    return this.#verified.get(invocationRef) ?? null;
  }

  rememberResolution(invocationRef: string, value: ResolveOperationState): void {
    this.#resolutions.set(invocationRef, deepFreeze(value));
  }

  resolution(invocationRef: string): ResolveOperationState | null {
    return this.#resolutions.get(invocationRef) ?? null;
  }

  rememberInstall(invocationRef: string, value: InstallOperationState): void {
    this.#installs.set(invocationRef, deepFreeze(value));
  }

  install(invocationRef: string): InstallOperationState | null {
    return this.#installs.get(invocationRef) ?? null;
  }

  rememberWorkspace(invocationRef: string, value: WorkspaceOperationState): void {
    this.#workspaces.set(invocationRef, deepFreeze(value));
  }

  workspace(invocationRef: string): WorkspaceOperationState | null {
    return this.#workspaces.get(invocationRef) ?? null;
  }

}
