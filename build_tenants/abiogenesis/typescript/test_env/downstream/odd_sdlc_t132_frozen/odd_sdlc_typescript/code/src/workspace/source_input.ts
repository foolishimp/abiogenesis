// Implements: REQ-F-ODDSDLC-007
// Implements: REQ-F-ODDSDLC-012
// Implements: REQ-F-ODDSDLC-022

import {
  parseClosedRecord,
  parseEnumValue,
  parseKind,
  parseNonEmptyString,
  parseStringList
} from "../shared/validation.js";
import { uniqueSorted } from "../shared/collections.js";
import { sha256Digest } from "../shared/digest.js";
import {
  SDLC_AMBIGUITY_KIND_VALUES,
  SDLC_SOURCE_INPUT_ROLE_VALUES,
  type SdlcIngressAmbiguity,
  type SdlcSourceInput,
  type SdlcSourceInputRole,
  type SdlcSourceInputSnapshot
} from "./carriers.js";

export { uniqueSorted } from "../shared/collections.js";
export { sha256Digest } from "../shared/digest.js";

export function fnv1aDigest(content: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < content.length; index += 1) {
    hash ^= content.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function detectRole(relativePath: string): SdlcSourceInputRole {
  if (relativePath === "specification/INTENT.md") {
    return "intent_surface";
  }
  if (
    relativePath === "specification/REQUIREMENTS.md" ||
    relativePath.startsWith("specification/requirements/")
  ) {
    return "requirement_surface";
  }
  if (relativePath.endsWith("project_constraints.yml")) {
    return "project_constraints";
  }
  if (relativePath === "README.md") {
    return "project_readme";
  }
  if (relativePath.startsWith("specification/appendices/")) {
    return "appendix_surface";
  }
  return "unstructured";
}

export const SDLC_LOCAL_REQUIREMENT_MARKER_PREFIX =
  "requirement-local://odd-sdlc/" as const;
export const SDLC_IMPORTED_SOURCE_MARKER_PREFIX =
  "source-import://odd-sdlc/" as const;

const IMPORTED_SOURCES_RELATIVE_PATH =
  "specification/requirements/00-imported-sources.md" as const;

export interface SdlcRequirementAuthorityIdentity {
  readonly requirementDisplayId: string;
  readonly requirementAuthorityRef: string;
  readonly authorityMarkerRef: string;
  readonly authorityDerivationRefs: readonly string[];
}

export function normalizeSdlcAuthoritySegment(
  rawValue: string,
  fallbackPrefix: string
): string {
  const slug = rawValue
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/gu, "_")
    .replace(/^_+|_+$/gu, "")
    .replace(/_+/gu, "_");
  const fallback = fallbackPrefix.length === 0 ? "segment" : fallbackPrefix;
  const value = slug.length === 0 ? fallback : slug;
  return /^[a-z]/u.test(value) ? value : `${fallback}_${value}`;
}

export function normalizeSdlcRequirementDisplayId(rawId: string): string {
  const normalized = rawId.trim().toUpperCase();
  const requirementMatch = /^R-(\d+)$/u.exec(normalized);
  if (requirementMatch !== null && requirementMatch[1] !== undefined) {
    return `R-${requirementMatch[1].padStart(3, "0")}`;
  }
  const parts = normalized.split("-");
  if (parts[0] === "REQ" || parts[0] === "RF") {
    const head = parts[0] === "RF" ? "REQ" : parts[0];
    const tail = parts.slice(1).map((part) =>
      /^\d+$/u.test(part) && part.length < 3 ? part.padStart(3, "0") : part
    );
    return [head, ...tail].join("-");
  }
  return normalized;
}

const PLACEHOLDER_REQUIREMENT_ID_SEGMENT_EXPRESSION =
  /^(?:N{2,}|X{2,}|Y{2,}|Z{2,}|TBD|TODO|PLACEHOLDER)$/u;

export function isPlaceholderRequirementMarker(marker: string): boolean {
  let requirementId = marker;
  if (marker.startsWith(SDLC_LOCAL_REQUIREMENT_MARKER_PREFIX)) {
    const encodedRequirementId = marker
      .slice(SDLC_LOCAL_REQUIREMENT_MARKER_PREFIX.length)
      .split("/")[0];
    if (encodedRequirementId === undefined || encodedRequirementId.length === 0) {
      return false;
    }
    try {
      requirementId = decodeURIComponent(encodedRequirementId);
    } catch {
      return false;
    }
  }
  const normalized = normalizeSdlcRequirementDisplayId(requirementId);
  const parts = normalized.split("-");
  return parts
    .slice(1)
    .some((part) => PLACEHOLDER_REQUIREMENT_ID_SEGMENT_EXPRESSION.test(part));
}

export function localRequirementSlug(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[`*_()[\]{}]/gu, "")
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "")
    .slice(0, 72);
  return slug.length === 0 ? "requirement" : slug;
}

export function localRequirementMarker(input: {
  readonly requirementId: string;
  readonly title: string;
}): string {
  return [
    SDLC_LOCAL_REQUIREMENT_MARKER_PREFIX.slice(0, -1),
    encodeURIComponent(normalizeSdlcRequirementDisplayId(input.requirementId)),
    encodeURIComponent(localRequirementSlug(input.title))
  ].join("/");
}

function sourceDigestRef(sourceDigest: string): string {
  return `source-digest://odd-sdlc/${encodeURIComponent(sourceDigest)}`;
}

function sourceStageKey(relativePath: string): string {
  const withoutKnownPrefix = relativePath
    .replace(/^specification\/requirements\//u, "")
    .replace(/^specification\//u, "");
  const withoutExtension = withoutKnownPrefix.replace(/\.[^/.]+$/u, "");
  return normalizeSdlcAuthoritySegment(
    withoutExtension
      .split("/")
      .map((part) => normalizeSdlcAuthoritySegment(part, "stage"))
      .join("_"),
    "stage"
  );
}

function requirementKey(requirementDisplayId: string): string {
  return normalizeSdlcAuthoritySegment(requirementDisplayId, "requirement");
}

function structuralRequirementAuthorityRef(input: {
  readonly projectSlug: string;
  readonly sourceRelativePath: string;
  readonly requirementDisplayId: string;
}): string {
  return [
    normalizeSdlcAuthoritySegment(input.projectSlug, "project"),
    sourceStageKey(input.sourceRelativePath),
    requirementKey(input.requirementDisplayId)
  ].join(".");
}

function authorityScopeRef(requirementAuthorityRef: string): string {
  return `requirement-authority-scope://odd-sdlc/${encodeURIComponent(requirementAuthorityRef)}`;
}

export function requirementAuthorityIdentityForMarker(input: {
  readonly marker: string;
  readonly projectSlug: string;
  readonly sourceRelativePath: string;
  readonly sourceUri: string;
  readonly sourceDigest: string;
}): SdlcRequirementAuthorityIdentity | null {
  if (isPlaceholderRequirementMarker(input.marker)) {
    return null;
  }
  if (input.marker.startsWith(SDLC_LOCAL_REQUIREMENT_MARKER_PREFIX)) {
    const [encodedRequirementId, encodedHeadingSlug] = input.marker
      .slice(SDLC_LOCAL_REQUIREMENT_MARKER_PREFIX.length)
      .split("/");
    if (
      encodedRequirementId === undefined ||
      encodedRequirementId.length === 0 ||
      encodedHeadingSlug === undefined ||
      encodedHeadingSlug.length === 0
    ) {
      return null;
    }
    try {
      const requirementDisplayId = normalizeSdlcRequirementDisplayId(
        decodeURIComponent(encodedRequirementId)
      );
      const headingSlug = decodeURIComponent(encodedHeadingSlug);
      const authorityMarkerRef = input.marker;
      const requirementAuthorityRef = structuralRequirementAuthorityRef({
        projectSlug: input.projectSlug,
        sourceRelativePath: input.sourceRelativePath,
        requirementDisplayId
      });
      return Object.freeze({
        requirementDisplayId,
        requirementAuthorityRef,
        authorityMarkerRef,
        authorityDerivationRefs: uniqueSorted([
          authorityScopeRef(requirementAuthorityRef),
          input.sourceUri,
          sourceDigestRef(input.sourceDigest),
          authorityMarkerRef,
          `heading-slug://odd-sdlc/${encodeURIComponent(headingSlug)}`
        ])
      });
    } catch {
      return null;
    }
  }
  if (input.marker.startsWith("REQ-") || input.marker.startsWith("RF-")) {
    const requirementDisplayId = normalizeSdlcRequirementDisplayId(input.marker);
    const authorityMarkerRef =
      `requirement-marker://odd-sdlc/${encodeURIComponent(input.marker)}`;
    const requirementAuthorityRef = structuralRequirementAuthorityRef({
      projectSlug: input.projectSlug,
      sourceRelativePath: input.sourceRelativePath,
      requirementDisplayId
    });
    return Object.freeze({
      requirementDisplayId,
      requirementAuthorityRef,
      authorityMarkerRef,
      authorityDerivationRefs: uniqueSorted([
        authorityScopeRef(requirementAuthorityRef),
        input.sourceUri,
        sourceDigestRef(input.sourceDigest),
        authorityMarkerRef
      ])
    });
  }
  return null;
}

function detectLocalRequirementMarkers(content: string): readonly string[] {
  const explicitRequirementHeading =
    /^\s{0,3}(?:#{1,6}\s+|[-*]\s+)?(R-\d{1,4})(?:\s*[:.-]\s*|\s+)([^\n]+?)\s*$/gimu;
  const canonicalRequirementMarker =
    /\b(?:RF-[A-Z0-9]+(?:-[A-Z0-9]+)*|REQ-[A-Z0-9]+(?:-[A-Z0-9]+)*)\b(?!-)/gu;
  const explicitMarkers = [...content.matchAll(explicitRequirementHeading)].map(
    (match) =>
      localRequirementMarker({
        requirementId: match[1] ?? "R-000",
        title: match[2] ?? "requirement"
      })
  );
  if (explicitMarkers.length > 0 || canonicalRequirementMarker.test(content)) {
    return uniqueSorted(explicitMarkers);
  }
  const numberedRequirementHeading =
    /^\s{0,3}#{1,6}\s+(\d{1,3})[.)]\s+([^\n]+?)\s*$/gmu;
  return uniqueSorted(
    [...content.matchAll(numberedRequirementHeading)].map((match) =>
      localRequirementMarker({
        requirementId: `R-${match[1] ?? "000"}`,
        title: match[2] ?? "requirement"
      })
    )
  );
}

function normalizeImportedSourceRelativePath(rawRef: string): string | null {
  const trimmed = rawRef.trim();
  const workspacePath = trimmed.startsWith("workspace://")
    ? trimmed.slice("workspace://".length).trim().replace(/^\/+/u, "")
    : trimmed;
  if (
    workspacePath.length === 0 ||
    workspacePath.startsWith("file://") ||
    workspacePath.startsWith("http://") ||
    workspacePath.startsWith("https://") ||
    workspacePath.startsWith("/") ||
    workspacePath.includes("\0") ||
    workspacePath.split("/").includes("..")
  ) {
    return null;
  }
  return workspacePath;
}

function importedSourceMarkers(
  content: string,
  relativePath: string
): readonly string[] {
  if (relativePath !== IMPORTED_SOURCES_RELATIVE_PATH) {
    return Object.freeze([]);
  }
  return uniqueSorted(
    content.split("\n").flatMap((line) => {
      const bulletMatch = /^-\s+`?([^`]+?)`?\s*$/u.exec(line.trim());
      const importedRelativePath = bulletMatch?.[1] === undefined
        ? null
        : normalizeImportedSourceRelativePath(bulletMatch[1]);
      return importedRelativePath === null
        ? []
        : [`${SDLC_IMPORTED_SOURCE_MARKER_PREFIX}${encodeURIComponent(importedRelativePath)}`];
    })
  );
}

function detectAuthorityMarkers(
  content: string,
  role: SdlcSourceInputRole,
  relativePath: string
): readonly string[] {
  const markerExpression = /\b(?:INT-\d{3}|RF-[A-Z0-9]+(?:-[A-Z0-9]+)*|REQ-[A-Z0-9]+(?:-[A-Z0-9]+)*)\b(?!-)/g;
  const transformRefExpression =
    /\b(?:transform-obligation|requirement-transform|requirement-lineage):\/\/[^\s\])}>,]+/g;
  const projectExpression = /^\*\*Project\*\*:\s*(.+?)\s*$/gm;
  const markers = [...content.matchAll(markerExpression)]
    .map((match) => match[0])
    .filter((marker) => !isPlaceholderRequirementMarker(marker));
  const transformRefs = [...content.matchAll(transformRefExpression)].map(
    (match) => match[0]
  );
  const projectMarkers = [...content.matchAll(projectExpression)].map(
    (match) => `Project:${match[1] ?? ""}`
  );
  const localRequirementMarkers =
    role === "requirement_surface" ? detectLocalRequirementMarkers(content) : [];
  return uniqueSorted([
    ...markers,
    ...localRequirementMarkers,
    ...transformRefs,
    ...projectMarkers,
    ...importedSourceMarkers(content, relativePath)
  ]);
}

function ambiguityFor(input: {
  readonly role: SdlcSourceInputRole;
  readonly authorityMarkers: readonly string[];
}): SdlcIngressAmbiguity {
  const reasons: string[] = [];
  if (input.authorityMarkers.length === 0) {
    reasons.push("no_authority_marker_detected");
  }
  if (input.role === "unstructured") {
    reasons.push("unstructured_role");
  }
  return Object.freeze({
    kind: reasons.length === 0 ? "none" : "ambiguous",
    reasons: Object.freeze(reasons)
  });
}

export function deriveSdlcSourceInput(
  snapshot: SdlcSourceInputSnapshot
): SdlcSourceInput {
  const role = detectRole(snapshot.relativePath);
  const authorityMarkers = detectAuthorityMarkers(
    snapshot.content,
    role,
    snapshot.relativePath
  );
  return Object.freeze({
    kind: "sdlc_source_input",
    uri: snapshot.uri,
    relativePath: snapshot.relativePath,
    digest: sha256Digest(snapshot.content),
    detectedRole: role,
    authorityMarkers,
    ambiguity: ambiguityFor({ role, authorityMarkers })
  });
}

export function admitSdlcSourceInput(
  input: unknown,
  label = "SdlcSourceInput"
): SdlcSourceInput {
  const record = parseClosedRecord(input, label, [
    "kind",
    "uri",
    "relativePath",
    "digest",
    "detectedRole",
    "authorityMarkers",
    "ambiguity"
  ]);
  const ambiguityRecord = parseClosedRecord(record["ambiguity"], `${label}.ambiguity`, [
    "kind",
    "reasons"
  ]);
  parseKind(record["kind"], "sdlc_source_input", `${label}.kind`);
  return Object.freeze({
    kind: "sdlc_source_input",
    uri: parseNonEmptyString(record["uri"], `${label}.uri`),
    relativePath: parseNonEmptyString(record["relativePath"], `${label}.relativePath`),
    digest: parseNonEmptyString(record["digest"], `${label}.digest`),
    detectedRole: parseEnumValue(
      record["detectedRole"],
      `${label}.detectedRole`,
      SDLC_SOURCE_INPUT_ROLE_VALUES
    ),
    authorityMarkers: parseStringList(
      record["authorityMarkers"],
      `${label}.authorityMarkers`
    ),
    ambiguity: Object.freeze({
      kind: parseEnumValue(
        ambiguityRecord["kind"],
        `${label}.ambiguity.kind`,
        SDLC_AMBIGUITY_KIND_VALUES
      ),
      reasons: parseStringList(
        ambiguityRecord["reasons"],
        `${label}.ambiguity.reasons`
      )
    })
  });
}
