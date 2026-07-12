// Validates: T-250 native version-subject and surface discriminants.
import type {
  ConstitutionalVersionSubject,
  GtlProgramConstitutionalLiveFacts,
  GtlProgramConstitutionalSurfaceRow,
  ProductRef,
  SourceProjectRef
} from "../../code/src/abg/m03/index.js";

declare const sourceProjectRef: SourceProjectRef;
declare const productRef: ProductRef;

// @ts-expect-error Product refs require the product:// prefix.
export const sourceLiteralAsProduct: ProductRef =
  "source-project://abiogenesis/typescript/main";

// @ts-expect-error Source-project refs require the source-project:// prefix.
export const productLiteralAsSource: SourceProjectRef =
  "product://abiogenesis/typescript/5.0.0";

export const sourceSubject: ConstitutionalVersionSubject = {
  kind: "source_project",
  subjectRef: sourceProjectRef
};

export const productSubject: ConstitutionalVersionSubject = {
  kind: "product",
  subjectRef: productRef
};

// @ts-expect-error Subject refs cannot cross version-subject kinds.
export const mismatchedSubject: ConstitutionalVersionSubject = {
  kind: "product",
  subjectRef: sourceProjectRef
};

export const versionedSurface: GtlProgramConstitutionalSurfaceRow = {
  surfaceRef: "workspace://package.json#version",
  digest: "sha256:test",
  versionDisposition: "versioned",
  declaredVersion: "5.0.0-dev.0",
  versionBindingRef: "binding://source-package",
  citedTicketRefs: []
};

export const unversionedSurface: GtlProgramConstitutionalSurfaceRow = {
  surfaceRef: "workspace://GOALS.md",
  digest: "sha256:test",
  versionDisposition: "unversioned",
  declaredVersion: null,
  versionBindingRef: null,
  citedTicketRefs: []
};

// @ts-expect-error Versioned rows require a concrete version.
export const invalidVersionedSurface: GtlProgramConstitutionalSurfaceRow = {
  surfaceRef: "workspace://invalid",
  digest: "sha256:test",
  versionDisposition: "versioned",
  declaredVersion: null,
  versionBindingRef: "binding://invalid",
  citedTicketRefs: []
};

export const exactLiveFacts: GtlProgramConstitutionalLiveFacts = {
  surfaceVersionBindings: [],
  versionFacts: [],
  activeTicketRefs: [],
  passthroughKeys: [],
  seamKeySets: []
};

export const legacyLiveFacts: GtlProgramConstitutionalLiveFacts = {
  // @ts-expect-error The single-package comparator was removed.
  packageVersion: "5.0.0-dev.0",
  surfaceVersionBindings: [],
  versionFacts: [],
  activeTicketRefs: [],
  passthroughKeys: [],
  seamKeySets: []
};
