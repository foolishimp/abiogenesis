import type { ModulePublication } from "../gtl/contracts.js";
import type {
  ProgramValidation,
  PublicationValidation,
} from "../validator/validation.js";
import type {
  AdmittedCatalog,
  CatalogApplication,
  CatalogView,
} from "./catalog.js";
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

export interface CatalogOperationState {
  readonly workspaceState: WorkspaceOperationState;
  readonly publication: Readonly<ModulePublication>;
  readonly publicationValidation: PublicationValidation;
  readonly programValidations: readonly ProgramValidation[];
  readonly catalog: AdmittedCatalog;
}

export interface CatalogViewOperationState {
  readonly catalogState: CatalogOperationState;
  readonly view: CatalogView;
}

export interface CatalogApplicationOperationState {
  readonly viewState: CatalogViewOperationState;
  readonly application: CatalogApplication;
}

/** Product-owned carrier registry for one explicit public-operation transcript. */
export class RootOperationState {
  readonly #seenInvocations = new Set<string>();
  readonly #verified = new Map<string, VerifiedOperationState>();
  readonly #resolutions = new Map<string, ResolveOperationState>();
  readonly #installs = new Map<string, InstallOperationState>();
  readonly #workspaces = new Map<string, WorkspaceOperationState>();
  readonly #catalogs = new Map<string, CatalogOperationState>();
  readonly #catalogViews = new Map<string, CatalogViewOperationState>();
  readonly #catalogApplications =
    new Map<string, CatalogApplicationOperationState>();

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

  rememberCatalog(invocationRef: string, value: CatalogOperationState): void {
    this.#catalogs.set(invocationRef, deepFreeze(value));
  }

  catalog(invocationRef: string): CatalogOperationState | null {
    return this.#catalogs.get(invocationRef) ?? null;
  }

  rememberCatalogView(invocationRef: string, value: CatalogViewOperationState): void {
    this.#catalogViews.set(invocationRef, deepFreeze(value));
  }

  catalogView(invocationRef: string): CatalogViewOperationState | null {
    return this.#catalogViews.get(invocationRef) ?? null;
  }

  rememberCatalogApplication(
    invocationRef: string,
    value: CatalogApplicationOperationState,
  ): void {
    this.#catalogApplications.set(invocationRef, deepFreeze(value));
  }

  catalogApplication(
    invocationRef: string,
  ): CatalogApplicationOperationState | null {
    return this.#catalogApplications.get(invocationRef) ?? null;
  }
}
