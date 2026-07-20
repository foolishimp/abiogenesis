// One internal runtime authority for resolving the already selected public
// catalog entry. Domain runtimes add their own exact GraphFunction joins.

import type {
  AdmittedRuntimeCatalogBasis,
  CatalogExecutionBinding,
  RegistrySessionGraphFunctionEntry,
  RegistrySessionView
} from "../contracts/runtime_catalog.js";
import {
  deriveRegistrySessionView
} from "../contracts/runtime_catalog.js";
import {
  stableJsonEquals,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";

export function resolveSelectedCatalogExecutionBinding(input: {
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly selectedCatalogEntryRef: string;
  readonly label: string;
}): CatalogExecutionBinding {
  const { catalogBasis: basis } = input;
  if (
    basis.kind !== "admitted_runtime_catalog_basis" ||
    basis.workspaceId !== basis.projection.workspaceId ||
    basis.bindingId !== basis.projection.bindingId ||
    basis.catalogId !== basis.projection.catalogId ||
    basis.runtimeCatalogProjectionRef !== basis.projection.projectionRef ||
    basis.runtimeRegistryProjectionRef !==
      basis.projection.runtimeRegistryProjection.projectionRef
  ) {
    throw new TypeError(`${input.label} runtime catalog basis is incoherent`);
  }
  const matches = basis.executionBindings.filter(
    (candidate) => candidate.entryRef === input.selectedCatalogEntryRef
  );
  const selected = matches[0];
  if (matches.length !== 1 || selected === undefined) {
    throw new TypeError(
      `${input.label} selected catalog entry must resolve one execution binding; got ${String(matches.length)}`
    );
  }
  if (
    selected.workspaceId !== basis.workspaceId ||
    selected.bindingId !== basis.bindingId ||
    selected.catalogId !== basis.catalogId ||
    selected.moduleDigest !== stableSha256Digest(selected.module) ||
    selected.graphFunctionDigest !== stableSha256Digest(selected.graphFunction)
  ) {
    throw new TypeError(
      `${input.label} selected catalog binding is not exact within the admitted basis`
    );
  }
  const moduleGraphFunctions = selected.module.graphFunctions.filter(
    (candidate) => candidate.id === selected.graphFunctionId
  );
  if (
    selected.graphFunction.id !== selected.graphFunctionId ||
    moduleGraphFunctions.length !== 1 ||
    stableSha256Digest(moduleGraphFunctions[0]) !== selected.graphFunctionDigest
  ) {
    throw new TypeError(
      `${input.label} selected GraphFunction is not exact within its Module`
    );
  }
  return selected;
}

export function resolveSelectedCatalogExecutionFromSessionView(input: {
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly sessionView: RegistrySessionView;
  readonly selectedGraphFunctionRef: string;
  readonly label: string;
}): CatalogExecutionBinding {
  const derived = deriveRegistrySessionView({
    basis: input.catalogBasis,
    allowedEntryRefs: input.sessionView.allowedEntryRefs
  });
  if (
    !derived.accepted ||
    derived.view === null ||
    !stableJsonEquals(derived.view, input.sessionView)
  ) {
    throw new TypeError(
      `${input.label} session view is not the exact narrowing of the admitted catalog basis`
    );
  }
  const matches = derived.view.entries.filter(
    (candidate): candidate is RegistrySessionGraphFunctionEntry =>
      candidate.entryKind === "graph_function" &&
      candidate.callable &&
      candidate.ready &&
      candidate.graphFunctionRef === input.selectedGraphFunctionRef
  );
  const entry = matches[0];
  if (matches.length !== 1 || entry === undefined) {
    throw new TypeError(
      `${input.label} selected GraphFunction must identify one ready callable session entry; got ${String(matches.length)}`
    );
  }
  const selected = resolveSelectedCatalogExecutionBinding({
    catalogBasis: input.catalogBasis,
    selectedCatalogEntryRef: entry.entryRef,
    label: input.label
  });
  if (
    selected.entryRef !== entry.entryRef ||
    selected.declarationRef !== entry.declarationRef ||
    selected.namespace !== entry.namespace ||
    selected.ownerRef !== entry.ownerRef ||
    selected.version !== entry.version ||
    selected.graphFunctionHandle !== entry.graphFunctionRef ||
    selected.graphFunction.id !== selected.graphFunctionId ||
    selected.graphFunctionDigest !== stableSha256Digest(selected.graphFunction)
  ) {
    throw new TypeError(
      `${input.label} selected session entry and execution binding are not exact`
    );
  }
  return selected;
}
