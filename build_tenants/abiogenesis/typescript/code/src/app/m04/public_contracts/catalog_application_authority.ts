// AF-10 structural application authority. This module derives identity only;
// it does not admit an executable program or invoke runtime work.

import {
  assertAdmittedRuntimeCatalogBasis,
  deriveRegistrySessionView,
  type AdmittedRuntimeCatalogBasis,
  type CatalogExecutionBinding,
  type OpaqueCatalogAssetProjection,
  type RegistrySessionView
} from "../../../abg/m03/contracts/runtime_catalog.js";
import type {
  CatalogApplicationCoordinate
} from "../../../abg/m03/contracts/catalog_operation_contracts.js";
import type {
  OneSurfaceAppliedProgramCompositionBasis
} from "../../../abg/m03/contracts/one_surface_program_compiler.js";
import {
  stableJsonEquals,
  stableSha256Digest,
  type IJsonValue
} from "../../../shared/runtime_identity.js";

type Sha256Digest = `sha256:${string}`;

const SHA256_PATTERN = /^sha256:[0-9a-f]{64}$/u;
const APPLICATION_REF_PREFIX =
  "declaration-application://abg/catalog/overlay/";

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export interface CatalogOverlayDeclaration {
  readonly kind: "catalog_overlay_declaration";
  readonly schemaVersion: 1;
  readonly overlayRef: string;
  readonly graphFunctionRefs: readonly string[];
  readonly policyRefs: readonly string[];
  readonly provenanceRefs: readonly string[];
}

export interface CatalogProgramCoordinate {
  readonly ref: string;
  readonly digest: Sha256Digest;
}

export interface CatalogBaseProgramAuthority extends CatalogProgramCoordinate {
  readonly memberEntryRefs: readonly string[];
}

export interface CatalogOverlayApplicationAuthority {
  readonly kind: "catalog_overlay_declaration_application";
  readonly schemaVersion: 1;
  readonly applicationKind: "overlay";
  readonly applicationRef: string;
  readonly catalogRow: Readonly<{
    readonly ref: string;
    readonly digest: Sha256Digest;
  }>;
  readonly catalogView: Readonly<{
    readonly ref: string;
    readonly digest: Sha256Digest;
  }>;
  readonly declaration: Readonly<{
    readonly ref: string;
    readonly digest: Sha256Digest;
  }>;
  readonly applicationBasis: CatalogProgramCoordinate;
  readonly applicationTarget: CatalogProgramCoordinate;
  readonly baseProgram: CatalogBaseProgramAuthority;
  readonly programBasis: OneSurfaceAppliedProgramCompositionBasis;
  readonly target: CatalogProgramCoordinate;
  readonly overlayAsset: Readonly<{
    readonly schemaId: string;
    readonly schemaVersion: string;
    readonly schemaDigest: Sha256Digest;
    readonly assetDigest: Sha256Digest;
  }>;
  readonly sourceEvidenceRefs: readonly string[];
  readonly provenanceRefs: readonly string[];
}

function ownRecord(input: unknown, label: string): Record<string, unknown> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new TypeError(`${label} must be an object`);
  }
  return input as Record<string, unknown>;
}

function assertExactKeys(
  input: Record<string, unknown>,
  expected: readonly string[],
  label: string
): void {
  const actual = Object.keys(input).sort();
  const required = [...expected].sort();
  if (!stableJsonEquals(actual, required)) {
    throw new TypeError(`${label} must contain exactly ${required.join(",")}`);
  }
}

function text(input: unknown, label: string): string {
  if (typeof input !== "string" || input.length === 0) {
    throw new TypeError(`${label} must be non-empty`);
  }
  return input;
}

function digest(input: unknown, label: string): Sha256Digest {
  const value = text(input, label);
  if (!SHA256_PATTERN.test(value)) {
    throw new TypeError(`${label} must be a sha256 digest`);
  }
  return value as Sha256Digest;
}

function uniqueTexts(input: unknown, label: string): readonly string[] {
  if (!Array.isArray(input)) {
    throw new TypeError(`${label} must be an array`);
  }
  const values = input.map((value, index) =>
    text(value, `${label}[${index}]`)
  );
  if (new Set(values).size !== values.length) {
    throw new TypeError(`${label} must contain unique values`);
  }
  return Object.freeze(values);
}

export function admitCatalogOverlayDeclaration(
  raw: unknown
): CatalogOverlayDeclaration {
  const input = ownRecord(raw, "CatalogOverlayDeclaration");
  assertExactKeys(input, [
    "kind",
    "schemaVersion",
    "overlayRef",
    "graphFunctionRefs",
    "policyRefs",
    "provenanceRefs"
  ], "CatalogOverlayDeclaration");
  if (
    input["kind"] !== "catalog_overlay_declaration" ||
    input["schemaVersion"] !== 1
  ) {
    throw new TypeError(
      "CatalogOverlayDeclaration kind/schemaVersion is unsupported"
    );
  }
  const graphFunctionRefs = uniqueTexts(
    input["graphFunctionRefs"],
    "CatalogOverlayDeclaration.graphFunctionRefs"
  );
  if (graphFunctionRefs.length === 0) {
    throw new TypeError(
      "CatalogOverlayDeclaration.graphFunctionRefs must be non-empty"
    );
  }
  return Object.freeze({
    kind: "catalog_overlay_declaration" as const,
    schemaVersion: 1 as const,
    overlayRef: text(
      input["overlayRef"],
      "CatalogOverlayDeclaration.overlayRef"
    ),
    graphFunctionRefs,
    policyRefs: uniqueTexts(
      input["policyRefs"],
      "CatalogOverlayDeclaration.policyRefs"
    ),
    provenanceRefs: uniqueTexts(
      input["provenanceRefs"],
      "CatalogOverlayDeclaration.provenanceRefs"
    )
  });
}

function exactOverlayRow(input: {
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly catalogRowRef: string;
}): OpaqueCatalogAssetProjection {
  const matches = input.catalogBasis.projection.opaqueAssetEntries.filter(
    (entry) =>
      entry.entryRef === input.catalogRowRef && entry.assetKind === "overlay"
  );
  const row = matches[0];
  if (matches.length !== 1 || row === undefined) {
    throw new TypeError(
      "catalog.apply requires one exact admitted opaque overlay row"
    );
  }
  return row;
}

function exactTargetBindings(input: {
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly overlay: CatalogOverlayDeclaration;
}): readonly CatalogExecutionBinding[] {
  return Object.freeze(input.overlay.graphFunctionRefs.map((graphFunctionRef) => {
    const matches = input.catalogBasis.executionBindings.filter((binding) =>
      binding.graphFunctionId === graphFunctionRef
    );
    const binding = matches[0];
    if (matches.length !== 1 || binding === undefined) {
      throw new TypeError(
        `catalog.apply overlay target ${graphFunctionRef} is not one admitted GraphFunction`
      );
    }
    return binding;
  }));
}

function exactBaseProgramBindings(input: {
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly baseProgram: CatalogBaseProgramAuthority;
}): readonly CatalogExecutionBinding[] {
  const memberEntryRefs = uniqueTexts(
    input.baseProgram.memberEntryRefs,
    "catalog.apply baseProgram.memberEntryRefs"
  );
  if (memberEntryRefs.length === 0) {
    throw new TypeError(
      "catalog.apply base program must declare at least one callable member"
    );
  }
  return Object.freeze(memberEntryRefs.map((entryRef) => {
    const matches = input.catalogBasis.executionBindings.filter((binding) =>
      binding.entryRef === entryRef
    );
    const binding = matches[0];
    if (matches.length !== 1 || binding === undefined) {
      throw new TypeError(
        `catalog.apply base program member ${entryRef} is not one admitted GraphFunction`
      );
    }
    return binding;
  }));
}

function distinctBindings(
  bindings: readonly CatalogExecutionBinding[]
): readonly CatalogExecutionBinding[] {
  const byEntryRef = new Map<string, CatalogExecutionBinding>();
  for (const binding of bindings) {
    const prior = byEntryRef.get(binding.entryRef);
    if (prior !== undefined && !stableJsonEquals(
      {
        moduleRef: prior.moduleRef,
        moduleDigest: prior.moduleDigest,
        graphFunctionId: prior.graphFunctionId,
        graphFunctionDigest: prior.graphFunctionDigest
      },
      {
        moduleRef: binding.moduleRef,
        moduleDigest: binding.moduleDigest,
        graphFunctionId: binding.graphFunctionId,
        graphFunctionDigest: binding.graphFunctionDigest
      }
    )) {
      throw new TypeError(
        `catalog.apply member ${binding.entryRef} has divergent bindings`
      );
    }
    byEntryRef.set(binding.entryRef, binding);
  }
  return Object.freeze([...byEntryRef.values()]);
}

function exactApplicationView(input: {
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly overlayRow: OpaqueCatalogAssetProjection;
  readonly targetBindings: readonly CatalogExecutionBinding[];
}): RegistrySessionView {
  const derived = deriveRegistrySessionView({
    basis: input.catalogBasis,
    allowedEntryRefs: Object.freeze([
      input.overlayRow.entryRef,
      ...input.targetBindings.map((binding) => binding.entryRef)
    ])
  });
  if (!derived.accepted || derived.view === null) {
    throw new TypeError(
      "catalog.apply overlay row and target GraphFunctions do not form one admitted view"
    );
  }
  return derived.view;
}

export interface DeriveCatalogOverlayApplicationInput {
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly catalogRowRef: string;
  readonly overlayAsset: unknown;
  readonly baseProgram: CatalogBaseProgramAuthority;
}

export function deriveCatalogOverlayApplicationAuthority(
  input: DeriveCatalogOverlayApplicationInput
): CatalogOverlayApplicationAuthority {
  assertAdmittedRuntimeCatalogBasis(input.catalogBasis);
  const row = exactOverlayRow(input);
  const overlay = admitCatalogOverlayDeclaration(input.overlayAsset);
  const overlayDigest = stableSha256Digest(overlay);
  if (
    row.declarationRef !== overlay.overlayRef ||
    row.declarationDigest !== overlayDigest ||
    row.assetDigest !== overlayDigest
  ) {
    throw new TypeError(
      "catalog.apply overlay asset differs from its admitted catalog row"
    );
  }
  const bindings = exactTargetBindings({
    catalogBasis: input.catalogBasis,
    overlay
  });
  if (bindings.length !== 1) {
    throw new TypeError(
      "catalog.apply sunny overlay requires exactly one target GraphFunction"
    );
  }
  const baseBindings = exactBaseProgramBindings({
    catalogBasis: input.catalogBasis,
    baseProgram: input.baseProgram
  });
  const programBindings = distinctBindings([...baseBindings, ...bindings]);
  const view = exactApplicationView({
    catalogBasis: input.catalogBasis,
    overlayRow: row,
    targetBindings: programBindings
  });
  const baseProgram = Object.freeze({
    ref: text(input.baseProgram.ref, "catalog.apply base program ref"),
    digest: digest(
      input.baseProgram.digest,
      "catalog.apply base program digest"
    ),
    memberEntryRefs: Object.freeze(
      baseBindings.map((binding) => binding.entryRef).sort()
    )
  });
  const rowDigest = stableSha256Digest(row);
  const viewDigest = stableSha256Digest(view);
  const applicationBasis = Object.freeze({
    ref: input.catalogBasis.basisRef,
    digest: stableSha256Digest(input.catalogBasis)
  });
  const programMembers = Object.freeze(programBindings.map((binding) =>
    Object.freeze({
      entryRef: binding.entryRef,
      graphFunctionRef: binding.graphFunctionId,
      graphFunctionDigest: digest(
        binding.graphFunctionDigest,
        `catalog.apply GraphFunction ${binding.graphFunctionId}`
      ),
      moduleRef: binding.moduleRef,
      moduleDigest: digest(
        binding.moduleDigest,
        `catalog.apply module ${binding.moduleRef}`
      )
    })
  ).sort((left, right) => compareText(left.entryRef, right.entryRef)));
  const programBasis: OneSurfaceAppliedProgramCompositionBasis = Object.freeze({
    kind: "one_surface_applied_gtl_program_composition_basis" as const,
    baseProgram: Object.freeze({
      ref: baseProgram.ref,
      digest: baseProgram.digest
    }),
    catalogBasis: applicationBasis,
    catalogRow: Object.freeze({
      ref: row.entryRef,
      digest: rowDigest
    }),
    catalogView: Object.freeze({
      ref: view.sessionViewRef,
      digest: viewDigest
    }),
    declaration: Object.freeze({
      ref: row.declarationRef,
      digest: overlayDigest
    }),
    programMembers
  });
  const targetDigest = stableSha256Digest(programBasis);
  const target = Object.freeze({
    ref: `gtl-program://abg/catalog-application/${targetDigest.slice("sha256:".length)}`,
    digest: targetDigest
  });
  const selectedBinding = bindings[0];
  if (selectedBinding === undefined) {
    throw new TypeError("catalog.apply target GraphFunction is absent");
  }
  const applicationTarget = Object.freeze({
    ref: selectedBinding.graphFunctionId,
    digest: digest(
      selectedBinding.graphFunctionDigest,
      "catalog.apply target GraphFunction digest"
    )
  });
  const applicationIdentity = Object.freeze({
    kind: "catalog_overlay_declaration_application_identity" as const,
    catalogRow: programBasis.catalogRow,
    catalogView: programBasis.catalogView,
    declaration: programBasis.declaration,
    applicationBasis,
    applicationTarget,
    baseProgram,
    target
  });
  const applicationDigest = stableSha256Digest(applicationIdentity);
  return Object.freeze({
    kind: "catalog_overlay_declaration_application" as const,
    schemaVersion: 1 as const,
    applicationKind: "overlay" as const,
    applicationRef:
      `${APPLICATION_REF_PREFIX}${applicationDigest.slice("sha256:".length)}`,
    catalogRow: programBasis.catalogRow,
    catalogView: programBasis.catalogView,
    declaration: Object.freeze({
      ref: row.declarationRef,
      digest: overlayDigest
    }),
    applicationBasis,
    applicationTarget,
    baseProgram,
    programBasis,
    target,
    overlayAsset: Object.freeze({
      schemaId: row.schemaId,
      schemaVersion: row.schemaVersion,
      schemaDigest: digest(row.schemaDigest, "catalog.apply overlay schema"),
      assetDigest: overlayDigest
    }),
    sourceEvidenceRefs: Object.freeze([...row.sourceEventRefs]),
    provenanceRefs: Object.freeze([
      ...new Set([...row.provenanceRefs, ...overlay.provenanceRefs])
    ].sort())
  });
}

export function catalogOverlayApplicationArtifactRelativePath(
  applicationRef: string
): string {
  if (!applicationRef.startsWith(APPLICATION_REF_PREFIX)) {
    throw new TypeError("catalog.apply application ref is not canonical");
  }
  const suffix = applicationRef.slice(APPLICATION_REF_PREFIX.length);
  if (!/^[0-9a-f]{64}$/u.test(suffix)) {
    throw new TypeError("catalog.apply application ref digest is malformed");
  }
  return `catalog-applications/${suffix}.json`;
}

export function catalogOverlayApplicationArtifactValue(
  authority: CatalogOverlayApplicationAuthority
): IJsonValue {
  return authority as unknown as IJsonValue;
}

export function catalogOverlayApplicationCoordinate(
  authority: CatalogOverlayApplicationAuthority
): CatalogApplicationCoordinate {
  return Object.freeze({
    catalogRowRef: authority.catalogRow.ref,
    catalogRowDigest: authority.catalogRow.digest,
    catalogViewRef: authority.catalogView.ref,
    catalogViewDigest: authority.catalogView.digest,
    declarationRef: authority.declaration.ref,
    declarationDigest: authority.declaration.digest,
    targetRef: authority.applicationTarget.ref,
    targetDigest: authority.applicationTarget.digest,
    applicationBasisRef: authority.applicationBasis.ref,
    applicationBasisDigest: authority.applicationBasis.digest
  });
}

export function readmitCatalogOverlayApplicationAuthority(input: {
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly baseProgram: CatalogBaseProgramAuthority;
  readonly rawArtifact: unknown;
  readonly overlayAsset: unknown;
}): CatalogOverlayApplicationAuthority {
  const catalogRowRef = catalogOverlayApplicationArtifactCatalogRowRef(
    input.rawArtifact
  );
  const derived = deriveCatalogOverlayApplicationAuthority({
    catalogBasis: input.catalogBasis,
    catalogRowRef,
    overlayAsset: input.overlayAsset,
    baseProgram: input.baseProgram
  });
  if (!stableJsonEquals(input.rawArtifact, derived)) {
    throw new TypeError(
      "catalog.apply artifact differs from its rederived admitted authority"
    );
  }
  return derived;
}

export function catalogOverlayApplicationArtifactCatalogRowRef(
  rawArtifact: unknown
): string {
  const artifact = ownRecord(
    rawArtifact,
    "CatalogOverlayApplicationArtifact"
  );
  const catalogRow = ownRecord(
    artifact["catalogRow"],
    "CatalogOverlayApplicationArtifact.catalogRow"
  );
  return text(
    catalogRow["ref"],
    "CatalogOverlayApplicationArtifact.catalogRow.ref"
  );
}
