// Implements: REQ-F-ODDSDLC-016
// Implements: REQ-F-ODDSDLC-022
// Implements: REQ-F-ODDSDLC-032

import { parseNonEmptyString } from "../shared/validation.js";
import {
  FG_INGRESS_PROJECT,
  type IngressSourceSet,
  type IngressSourceStructureGrade,
  type ProjectIngressContract
} from "../graph/library.js";
import {
  type SdlcBootstrapLineageRecord,
  type SdlcImportedRequirementAuthority,
  type SdlcProjectConstraints,
  type SdlcRequirementTransformAuthority,
  type SdlcRequirementTransformAuthorityStatus,
  type SdlcSourceInput,
  type SdlcWorkspaceIngressReport
} from "./carriers.js";
import {
  SDLC_IMPORTED_SOURCE_MARKER_PREFIX,
  requirementAuthorityIdentityForMarker,
  uniqueSorted
} from "./source_input.js";

function importedSourceRelativePaths(
  sourceInputs: readonly SdlcSourceInput[]
): ReadonlySet<string> {
  const paths = new Set<string>();
  for (const sourceInput of sourceInputs) {
    for (const marker of sourceInput.authorityMarkers) {
      if (!marker.startsWith(SDLC_IMPORTED_SOURCE_MARKER_PREFIX)) {
        continue;
      }
      const encodedPath = marker.slice(SDLC_IMPORTED_SOURCE_MARKER_PREFIX.length);
      try {
        const relativePath = decodeURIComponent(encodedPath);
        if (relativePath.length > 0) {
          paths.add(relativePath);
        }
      } catch {
        continue;
      }
    }
  }
  return paths;
}

function importedRequirementAuthorities(
  input: {
    readonly projectConstraints: SdlcProjectConstraints;
    readonly sourceInputs: readonly SdlcSourceInput[];
  }
): readonly SdlcImportedRequirementAuthority[] {
  const authorities: SdlcImportedRequirementAuthority[] = [];
  const importedRelativePaths = importedSourceRelativePaths(input.sourceInputs);
  const seenAuthorityRefs = new Map<
    string,
    { readonly sourceUri: string; readonly authorityMarkerRef: string }
  >();
  for (const sourceInput of input.sourceInputs) {
    const contributesRequirementAuthority =
      sourceInput.detectedRole === "requirement_surface" ||
      importedRelativePaths.has(sourceInput.relativePath);
    if (!contributesRequirementAuthority) {
      continue;
    }
    for (const marker of sourceInput.authorityMarkers) {
      const identity = requirementAuthorityIdentityForMarker({
        marker,
        projectSlug: input.projectConstraints.projectSlug,
        sourceRelativePath: sourceInput.relativePath,
        sourceUri: sourceInput.uri,
        sourceDigest: sourceInput.digest
      });
      if (identity !== null) {
        const existing = seenAuthorityRefs.get(identity.requirementAuthorityRef);
        if (
          existing !== undefined &&
          (identity.authorityMarkerRef.startsWith("requirement-local://") ||
            existing.sourceUri !== sourceInput.uri)
        ) {
          throw new TypeError(
            `SdlcWorkspaceIngressReport.importedRequirementAuthorities: duplicate requirementAuthorityRef ${identity.requirementAuthorityRef} from ${existing.sourceUri} and ${sourceInput.uri}`
          );
        }
        if (existing !== undefined) {
          continue;
        }
        seenAuthorityRefs.set(identity.requirementAuthorityRef, {
          sourceUri: sourceInput.uri,
          authorityMarkerRef: identity.authorityMarkerRef
        });
        authorities.push(
          Object.freeze({
            kind: "sdlc_imported_requirement_authority",
            requirementId: identity.requirementDisplayId,
            requirementDisplayId: identity.requirementDisplayId,
            requirementAuthorityRef: identity.requirementAuthorityRef,
            authorityMarkerRef: identity.authorityMarkerRef,
            authorityDerivationRefs: identity.authorityDerivationRefs,
            sourceUri: sourceInput.uri,
            sourceDigest: sourceInput.digest
          })
        );
      }
    }
  }
  return Object.freeze(authorities);
}

function sourceInputForAuthority(input: {
  readonly sourceInputs: readonly SdlcSourceInput[];
  readonly authority: SdlcImportedRequirementAuthority;
}): SdlcSourceInput | null {
  return (
    input.sourceInputs.find((sourceInput) => sourceInput.uri === input.authority.sourceUri) ??
    null
  );
}

function requirementTransformRefsFromSource(
  sourceInput: SdlcSourceInput | null
): readonly string[] {
  if (sourceInput === null) {
    return Object.freeze([]);
  }
  return uniqueSorted(
    sourceInput.authorityMarkers.filter(
      (marker) =>
        marker.startsWith("transform-obligation://") ||
        marker.startsWith("requirement-transform://") ||
        marker.startsWith("requirement-lineage://")
    )
  );
}

function transformAuthorityStatus(
  sourceInput: SdlcSourceInput | null
): SdlcRequirementTransformAuthorityStatus {
  if (sourceInput === null || sourceInput.ambiguity.kind === "ambiguous") {
    return "ambiguous";
  }
  return "current";
}

function requirementTransformAuthorities(input: {
  readonly sourceInputs: readonly SdlcSourceInput[];
  readonly authorities: readonly SdlcImportedRequirementAuthority[];
}): readonly SdlcRequirementTransformAuthority[] {
  return Object.freeze(
    input.authorities.map((authority) => {
      const encodedAuthorityRef = encodeURIComponent(authority.requirementAuthorityRef);
      const sourceInput = sourceInputForAuthority({
        sourceInputs: input.sourceInputs,
        authority
      });
      const sourceInputUris = Object.freeze([authority.sourceUri]);
      const transformRef =
        `requirement-transform://odd-sdlc/ingress/${encodedAuthorityRef}/${encodeURIComponent(authority.sourceDigest)}`;
      return Object.freeze({
        kind: "sdlc_requirement_transform_authority" as const,
        requirementId: authority.requirementId,
        requirementDisplayId: authority.requirementDisplayId,
        requirementAuthorityRef: authority.requirementAuthorityRef,
        transformRef,
        predecessorTransformRefs: requirementTransformRefsFromSource(sourceInput),
        transformInputAuthorityRef:
          `source-authority://odd-sdlc/${encodedAuthorityRef}/${encodeURIComponent(authority.sourceDigest)}`,
        transformOutputAuthorityRef:
          `requirement-authority://odd-sdlc/${encodedAuthorityRef}/An`,
        sourceInputUris,
        evidenceRefs: uniqueSorted([
          authority.sourceUri,
          `source-digest://odd-sdlc/${encodeURIComponent(authority.sourceDigest)}`,
          transformRef,
          ...authority.authorityDerivationRefs
        ]),
        status: transformAuthorityStatus(sourceInput)
      });
    })
  );
}

function lineageFor(input: {
  readonly projectConstraints: SdlcProjectConstraints;
  readonly sourceInputs: readonly SdlcSourceInput[];
  readonly authorities: readonly SdlcImportedRequirementAuthority[];
}): readonly SdlcBootstrapLineageRecord[] {
  const projectSources = input.sourceInputs
    .filter((sourceInput) =>
      sourceInput.detectedRole === "intent_surface" ||
      sourceInput.detectedRole === "project_constraints" ||
      sourceInput.detectedRole === "project_readme"
    )
    .map((sourceInput) => sourceInput.uri);
  const records: SdlcBootstrapLineageRecord[] = [
    Object.freeze({
      kind: "sdlc_bootstrap_lineage_record",
      elementId: `project:${input.projectConstraints.projectSlug}`,
      elementKind: "project",
      sourceInputUris: uniqueSorted(projectSources)
    })
  ];
  for (const authority of input.authorities) {
    records.push(
      Object.freeze({
        kind: "sdlc_bootstrap_lineage_record",
        elementId: `requirement:${authority.requirementAuthorityRef}`,
        elementKind: "requirement_seed",
        sourceInputUris: Object.freeze([authority.sourceUri]),
        requirementId: authority.requirementId,
        requirementDisplayId: authority.requirementDisplayId,
        requirementAuthorityRef: authority.requirementAuthorityRef,
        authorityDerivationRefs: authority.authorityDerivationRefs
      })
    );
  }
  return Object.freeze(records);
}

function structureGrade(
  sourceInputs: readonly SdlcSourceInput[]
): IngressSourceStructureGrade {
  const roles = new Set(sourceInputs.map((sourceInput) => sourceInput.detectedRole));
  if (roles.size === 1 && roles.has("unstructured")) {
    return "unstructured";
  }
  if (
    roles.has("project_constraints") &&
    (roles.has("intent_surface") || roles.has("requirement_surface"))
  ) {
    return "structured";
  }
  return "loosely_structured";
}

function deriveIngressSourceSet(input: {
  readonly workspaceRootUri: string;
  readonly sourceInputs: readonly SdlcSourceInput[];
}): IngressSourceSet {
  return Object.freeze({
    kind: "ingress_source_set",
    workspaceRootUri: input.workspaceRootUri,
    structureGrade: structureGrade(input.sourceInputs),
    sources: Object.freeze(
      input.sourceInputs.map((sourceInput) =>
        Object.freeze({
          kind: "ingress_source_ledger_entry",
          sourceRef: sourceInput.uri,
          relativePath: sourceInput.relativePath,
          digestRef: sourceInput.digest,
          detectedRole: sourceInput.detectedRole,
          authorityMarkers: sourceInput.authorityMarkers
        })
      )
    )
  });
}

function deriveProjectIngressContract(
  projectConstraints: SdlcProjectConstraints
): ProjectIngressContract {
  return Object.freeze({
    kind: "project_ingress_contract",
    graphFunctionName: FG_INGRESS_PROJECT,
    projectTypeRef: "type://odd_sdlc/project",
    topologyPolicyRef: "policy://odd_sdlc/spec_method_project_topology",
    ambiguityPolicyRef: `policy://odd_sdlc/ambiguity/${projectConstraints.ambiguityRiskAppetite}`,
    importedAuthorityPolicyRef: "policy://odd_sdlc/imported_authority/lineage_required",
    selectedOutputRoot: projectConstraints.selectedOutputRoot,
    activeTenant: projectConstraints.activeTenant
  });
}

function ambiguityRegister(
  sourceInputs: readonly SdlcSourceInput[]
): readonly string[] {
  return uniqueSorted(
    sourceInputs.flatMap((sourceInput) =>
      sourceInput.ambiguity.reasons.map(
        (reason) => `${sourceInput.uri}:${reason}`
      )
    )
  );
}

function bootstrapGapSet(input: {
  readonly ambiguityRegister: readonly string[];
  readonly authorities: readonly SdlcImportedRequirementAuthority[];
}): readonly string[] {
  const gaps: string[] = [];
  if (input.ambiguityRegister.length > 0) {
    gaps.push("bootstrap_ambiguity_present");
  }
  if (input.authorities.length === 0) {
    gaps.push("no_imported_requirement_authority");
  }
  return uniqueSorted(gaps);
}

export function deriveSdlcWorkspaceIngressReport(input: {
  readonly workspaceRootUri: string;
  readonly projectConstraints: SdlcProjectConstraints;
  readonly sourceInputs: readonly SdlcSourceInput[];
}): SdlcWorkspaceIngressReport {
  const workspaceRootUri = parseNonEmptyString(
    input.workspaceRootUri,
    "SdlcWorkspaceIngressReport.workspaceRootUri"
  );
  const authorities = importedRequirementAuthorities({
    projectConstraints: input.projectConstraints,
    sourceInputs: input.sourceInputs
  });
  const ingressSourceSet = deriveIngressSourceSet({
    workspaceRootUri,
    sourceInputs: input.sourceInputs
  });
  const ambiguity = ambiguityRegister(input.sourceInputs);
  const transformAuthorities = requirementTransformAuthorities({
    sourceInputs: input.sourceInputs,
    authorities
  });
  return Object.freeze({
    kind: "sdlc_workspace_ingress_report",
    governingGraphFunction: FG_INGRESS_PROJECT,
    workspaceRootUri,
    projectConstraints: input.projectConstraints,
    ingressSourceSet,
    projectIngressContract: deriveProjectIngressContract(input.projectConstraints),
    sourceInputs: Object.freeze([...input.sourceInputs]),
    importedRequirementAuthorities: authorities,
    requirementTransformAuthorities: transformAuthorities,
    lineage: lineageFor({
      projectConstraints: input.projectConstraints,
      sourceInputs: input.sourceInputs,
      authorities
    }),
    ambiguityRegister: ambiguity,
    bootstrapGapSet: bootstrapGapSet({
      ambiguityRegister: ambiguity,
      authorities
    })
  });
}
