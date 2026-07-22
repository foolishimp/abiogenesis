import type { ModulePublication } from "../gtl/contracts.js";
import type {
  ProgramValidation,
  PublicationValidation,
} from "../validator/validation.js";
import type { AdmittedCatalog, CatalogView } from "./catalog.js";
import type { VerifiedProductArtifact } from "./contracts.js";
import type {
  ProductInstall,
  ProductSet,
  ResolvedProductLock,
  WorkspaceBinding,
} from "./environment.js";
import type { ProductInstallCandidate } from "./contracts.js";

export interface VerifiedOperationState {
  readonly verified: VerifiedProductArtifact;
}

export interface InstallOperationState {
  readonly candidate: ProductInstallCandidate;
  readonly install: ProductInstall;
}

export interface WorkspaceOperationState {
  readonly lock: ResolvedProductLock;
  readonly productSet: ProductSet;
  readonly binding: WorkspaceBinding;
}

export interface CatalogOperationState {
  readonly publication: Readonly<ModulePublication>;
  readonly publicationValidation: PublicationValidation;
  readonly programValidations: readonly ProgramValidation[];
  readonly catalog: AdmittedCatalog;
}

export interface CatalogViewOperationState {
  readonly catalogState: CatalogOperationState;
  readonly view: CatalogView;
}

/** Product-owned carrier registry for one explicit public-operation transcript. */
export class RootOperationState {
  readonly #seenInvocations = new Set<string>();
  readonly #verified = new Map<string, VerifiedOperationState>();
  readonly #installs = new Map<string, InstallOperationState>();
  readonly #workspaces = new Map<string, WorkspaceOperationState>();
  readonly #catalogs = new Map<string, CatalogOperationState>();
  readonly #catalogViews = new Map<string, CatalogViewOperationState>();

  claimInvocation(invocationRef: string): boolean {
    if (this.#seenInvocations.has(invocationRef)) return false;
    this.#seenInvocations.add(invocationRef);
    return true;
  }

  rememberVerified(invocationRef: string, value: VerifiedOperationState): void {
    this.#verified.set(invocationRef, value);
  }

  verified(invocationRef: string): VerifiedOperationState | null {
    return this.#verified.get(invocationRef) ?? null;
  }

  rememberInstall(invocationRef: string, value: InstallOperationState): void {
    this.#installs.set(invocationRef, value);
  }

  install(invocationRef: string): InstallOperationState | null {
    return this.#installs.get(invocationRef) ?? null;
  }

  rememberWorkspace(invocationRef: string, value: WorkspaceOperationState): void {
    this.#workspaces.set(invocationRef, value);
  }

  workspace(invocationRef: string): WorkspaceOperationState | null {
    return this.#workspaces.get(invocationRef) ?? null;
  }

  rememberCatalog(invocationRef: string, value: CatalogOperationState): void {
    this.#catalogs.set(invocationRef, value);
  }

  catalog(invocationRef: string): CatalogOperationState | null {
    return this.#catalogs.get(invocationRef) ?? null;
  }

  rememberCatalogView(invocationRef: string, value: CatalogViewOperationState): void {
    this.#catalogViews.set(invocationRef, value);
  }

  catalogView(invocationRef: string): CatalogViewOperationState | null {
    return this.#catalogViews.get(invocationRef) ?? null;
  }
}
