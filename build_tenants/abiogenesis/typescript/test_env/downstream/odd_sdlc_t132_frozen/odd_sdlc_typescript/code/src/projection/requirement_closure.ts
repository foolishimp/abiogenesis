// Implements: REQ-F-ODDSDLC-029
// Implements: REQ-F-ODDSDLC-030
// Implements: REQ-F-ODDSDLC-031

import {
  parseClosedRecord,
  parseEnumValue,
  parseKind,
  parseNonEmptyString,
  parseStringList
} from "../shared/validation.js";
import { uniqueSorted } from "../shared/collections.js";
import type { SdlcWorkReport } from "../hooks/index.js";
import type { SdlcWorkspaceIngressReport } from "../workspace/index.js";

export const SDLC_REQUIREMENT_PROOF_KIND_VALUES = Object.freeze([
  "trace_tag",
  "design_carry",
  "planned_test",
  "behavioral_test",
  "runtime_result"
] as const);

export type SdlcRequirementProofKind =
  (typeof SDLC_REQUIREMENT_PROOF_KIND_VALUES)[number];

export const SDLC_REQUIREMENT_PROOF_AUTHORITY_VALUES = Object.freeze([
  "implements",
  "validates",
  "carries"
] as const);

export type SdlcRequirementProofAuthority =
  (typeof SDLC_REQUIREMENT_PROOF_AUTHORITY_VALUES)[number];

export interface SdlcRequirementProofClaim {
  readonly kind: "sdlc_requirement_proof_claim";
  readonly requirementId: string;
  readonly requirementAuthorityRef: string;
  readonly assetId: string;
  readonly proofKind: SdlcRequirementProofKind;
  readonly authorityVerb: SdlcRequirementProofAuthority;
  readonly evidenceRefs: readonly string[];
}

export interface SdlcLineageProof {
  readonly kind: "sdlc_lineage_proof";
  readonly requirementId: string;
  readonly requirementDisplayId: string;
  readonly requirementAuthorityRef: string;
  readonly proofKind: SdlcRequirementProofKind;
  readonly authorityVerb: SdlcRequirementProofAuthority;
  readonly evidenceRefs: readonly string[];
}

export interface SdlcLineageProofClaimDiagnostic {
  readonly kind: "sdlc_lineage_proof_claim_diagnostic";
  readonly code: "unresolved_requirement_authority_ref";
  readonly requirementId: string;
  readonly requirementAuthorityRef: string;
  readonly assetId: string;
  readonly proofKind: SdlcRequirementProofKind;
  readonly authorityVerb: SdlcRequirementProofAuthority;
  readonly evidenceRefs: readonly string[];
}

export interface SdlcLineageEntry {
  readonly kind: "sdlc_lineage_entry";
  readonly elementId: string;
  readonly elementKind: "generated_asset";
  readonly sourceInputUris: readonly string[];
  readonly requirementIds: readonly string[];
  readonly requirementAuthorityRefs: readonly string[];
  readonly producedByGraphFunction: string;
  readonly selectedBy: "abg_selected_edge";
  readonly targetAssetType: string;
  readonly outputDigest: string;
  readonly generatedAssetContractSatisfied: boolean;
  readonly evidenceRefs: readonly string[];
  readonly proofKinds: readonly SdlcRequirementProofKind[];
  readonly authorityVerbs: readonly SdlcRequirementProofAuthority[];
  readonly proofs: readonly SdlcLineageProof[];
  readonly proofClaimDiagnostics: readonly SdlcLineageProofClaimDiagnostic[];
}

export interface SdlcLineageLedger {
  readonly kind: "sdlc_lineage_ledger";
  readonly entries: readonly SdlcLineageEntry[];
  readonly emittedRuntimeEventKinds: readonly [];
}

export type SdlcRequirementFulfillmentStatus =
  | "fulfilled"
  | "partial"
  | "planned"
  | "missing";

export type SdlcRequirementCarryStatus = "fulfilled" | "carried_forward";

export type SdlcRequirementTraceabilityStatus =
  | "absent"
  | "trace_only"
  | "behavioral_evidence";

export interface SdlcRequirementClosureEntry {
  readonly kind: "sdlc_requirement_closure_entry";
  readonly requirementId: string;
  readonly requirementDisplayId?: string;
  readonly requirementAuthorityRef: string;
  readonly authorityDerivationRefs?: readonly string[];
  readonly sourceInputUris: readonly string[];
  readonly assetIds: readonly string[];
  readonly producedByGraphFunctions: readonly string[];
  readonly proofKinds: readonly SdlcRequirementProofKind[];
  readonly authorityVerbs: readonly SdlcRequirementProofAuthority[];
  readonly evidenceRefs: readonly string[];
  readonly traceabilityStatus: SdlcRequirementTraceabilityStatus;
  readonly fulfillmentStatus: SdlcRequirementFulfillmentStatus;
  readonly carryStatus: SdlcRequirementCarryStatus;
  readonly openReasons: readonly string[];
}

export interface SdlcRequirementClosureRegister {
  readonly kind: "sdlc_requirement_closure_register";
  readonly entries: readonly SdlcRequirementClosureEntry[];
  readonly fulfilledRequirementIds: readonly string[];
  readonly carriedForwardRequirementIds: readonly string[];
  readonly unresolvedRequirementIds: readonly string[];
  readonly fulfilledRequirementAuthorityRefs?: readonly string[];
  readonly carriedForwardRequirementAuthorityRefs?: readonly string[];
  readonly unresolvedRequirementAuthorityRefs?: readonly string[];
  readonly emittedRuntimeEventKinds: readonly [];
}

export type SdlcRepairFrontierLane = "requirements" | "design" | "code" | "test";

export interface SdlcRepairFrontierEntry {
  readonly kind: "sdlc_repair_frontier_entry";
  readonly lane: SdlcRepairFrontierLane;
  readonly requirementIds: readonly string[];
  readonly requirementAuthorityRefs?: readonly string[];
  readonly action: string;
}

export interface SdlcRepairFrontier {
  readonly kind: "sdlc_repair_frontier";
  readonly unmetRequirementIds: readonly string[];
  readonly preservationRequirementIds: readonly string[];
  readonly unmetRequirementAuthorityRefs?: readonly string[];
  readonly preservationRequirementAuthorityRefs?: readonly string[];
  readonly lanes: readonly SdlcRepairFrontierEntry[];
  readonly lawfulEditFrontier: string;
  readonly lawfulProofFrontier: string;
  readonly emittedRuntimeEventKinds: readonly [];
}

const EMPTY_RUNTIME_EVENT_KINDS: readonly [] = Object.freeze([]);

export function admitSdlcRequirementProofClaim(
  input: unknown,
  label = "SdlcRequirementProofClaim"
): SdlcRequirementProofClaim {
  const record = parseClosedRecord(input, label, [
    "kind",
    "requirementId",
    "requirementAuthorityRef",
    "assetId",
    "proofKind",
    "authorityVerb",
    "evidenceRefs"
  ]);
  parseKind(record["kind"], "sdlc_requirement_proof_claim", `${label}.kind`);
  const requirementAuthorityRef = parseNonEmptyString(
    record["requirementAuthorityRef"],
    `${label}.requirementAuthorityRef`
  );
  return Object.freeze({
    kind: "sdlc_requirement_proof_claim",
    requirementId: parseNonEmptyString(record["requirementId"], `${label}.requirementId`),
    requirementAuthorityRef,
    assetId: parseNonEmptyString(record["assetId"], `${label}.assetId`),
    proofKind: parseEnumValue(
      record["proofKind"],
      `${label}.proofKind`,
      SDLC_REQUIREMENT_PROOF_KIND_VALUES
    ),
    authorityVerb: parseEnumValue(
      record["authorityVerb"],
      `${label}.authorityVerb`,
      SDLC_REQUIREMENT_PROOF_AUTHORITY_VALUES
    ),
    evidenceRefs: parseStringList(record["evidenceRefs"], `${label}.evidenceRefs`)
  });
}

function authorityRefForIngressAuthority(input: {
  readonly requirementId: string;
  readonly requirementAuthorityRef: string;
}): string {
  return input.requirementAuthorityRef;
}

function displayIdForIngressAuthority(input: {
  readonly requirementId: string;
  readonly requirementDisplayId?: string;
}): string {
  return input.requirementDisplayId ?? input.requirementId;
}

function derivationRefsForIngressAuthority(input: {
  readonly sourceUri: string;
  readonly sourceDigest: string;
  readonly authorityMarkerRef?: string;
  readonly authorityDerivationRefs?: readonly string[];
}): readonly string[] {
  if (input.authorityDerivationRefs !== undefined) {
    return input.authorityDerivationRefs;
  }
  return uniqueSorted([
    input.sourceUri,
    `source-digest://odd-sdlc/${encodeURIComponent(input.sourceDigest)}`,
    ...(input.authorityMarkerRef === undefined ? [] : [input.authorityMarkerRef])
  ]);
}

type ImportedRequirementAuthority =
  SdlcWorkspaceIngressReport["importedRequirementAuthorities"][number];

function authorityForClaim(input: {
  readonly ingressReport: SdlcWorkspaceIngressReport;
  readonly claim: SdlcRequirementProofClaim;
}): ImportedRequirementAuthority | null {
  return (
    input.ingressReport.importedRequirementAuthorities.find(
      (authority) =>
        authorityRefForIngressAuthority(authority) ===
        input.claim.requirementAuthorityRef
    ) ?? null
  );
}

function proofForClaim(input: {
  readonly claim: SdlcRequirementProofClaim;
  readonly ingressReport: SdlcWorkspaceIngressReport;
}): SdlcLineageProof | null {
  const authority = authorityForClaim(input);
  if (authority === null) {
    return null;
  }
  return Object.freeze({
    kind: "sdlc_lineage_proof",
    requirementId: displayIdForIngressAuthority(authority),
    requirementDisplayId: displayIdForIngressAuthority(authority),
    requirementAuthorityRef: authorityRefForIngressAuthority(authority),
    proofKind: input.claim.proofKind,
    authorityVerb: input.claim.authorityVerb,
    evidenceRefs: Object.freeze([...input.claim.evidenceRefs])
  });
}

function diagnosticForUnmatchedClaim(
  claim: SdlcRequirementProofClaim
): SdlcLineageProofClaimDiagnostic {
  return Object.freeze({
    kind: "sdlc_lineage_proof_claim_diagnostic",
    code: "unresolved_requirement_authority_ref",
    requirementId: claim.requirementId,
    requirementAuthorityRef: claim.requirementAuthorityRef,
    assetId: claim.assetId,
    proofKind: claim.proofKind,
    authorityVerb: claim.authorityVerb,
    evidenceRefs: Object.freeze([...claim.evidenceRefs])
  });
}

function sourceUrisForRequirement(input: {
  readonly ingressReport: SdlcWorkspaceIngressReport;
  readonly requirementAuthorityRef: string;
}): readonly string[] {
  return uniqueSorted(
    input.ingressReport.importedRequirementAuthorities
      .filter(
        (authority) =>
          authorityRefForIngressAuthority(authority) === input.requirementAuthorityRef
      )
      .map((authority) => authority.sourceUri)
  );
}

export function deriveSdlcLineageLedger(input: {
  readonly ingressReport: SdlcWorkspaceIngressReport;
  readonly workReports: readonly SdlcWorkReport[];
  readonly proofClaims: readonly SdlcRequirementProofClaim[];
}): SdlcLineageLedger {
  return Object.freeze({
    kind: "sdlc_lineage_ledger",
    entries: Object.freeze(
      input.workReports.map((report) => {
        const claims = input.proofClaims.filter(
          (claim) => claim.assetId === report.outputIdentity.assetId
        );
        const proofs = Object.freeze(
          claims
            .map((claim) =>
              proofForClaim({ claim, ingressReport: input.ingressReport })
            )
            .filter((proof): proof is SdlcLineageProof => proof !== null)
        );
        const proofClaimDiagnostics = Object.freeze(
          claims
            .filter(
              (claim) =>
                proofForClaim({ claim, ingressReport: input.ingressReport }) ===
                null
            )
            .map(diagnosticForUnmatchedClaim)
        );
        const requirementIds = uniqueSorted(claims.map((claim) => claim.requirementId));
        const requirementAuthorityRefs = uniqueSorted(
          proofs.map((proof) => proof.requirementAuthorityRef)
        );
        return Object.freeze({
          kind: "sdlc_lineage_entry",
          elementId: report.outputIdentity.assetId,
          elementKind: "generated_asset",
          sourceInputUris: uniqueSorted(
            requirementAuthorityRefs.flatMap((requirementAuthorityRef) =>
              sourceUrisForRequirement({
                ingressReport: input.ingressReport,
                requirementAuthorityRef
              })
            )
          ),
          requirementIds,
          requirementAuthorityRefs,
          producedByGraphFunction: report.generatedAssetAuthority.graphFunctionName,
          selectedBy: report.generatedAssetAuthority.selectedBy,
          targetAssetType: report.generatedAssetAuthority.targetAssetType,
          outputDigest: report.outputIdentity.digest,
          generatedAssetContractSatisfied: report.generatedAssetContract.satisfied,
          evidenceRefs: uniqueSorted([
            ...report.evidenceRefs.map((evidence) => evidence.ref),
            ...claims.flatMap((claim) => claim.evidenceRefs)
          ]),
          proofKinds: uniqueSorted(claims.map((claim) => claim.proofKind)),
          authorityVerbs: uniqueSorted(claims.map((claim) => claim.authorityVerb)),
          proofs,
          proofClaimDiagnostics
        });
      })
    ),
    emittedRuntimeEventKinds: EMPTY_RUNTIME_EVENT_KINDS
  });
}

function liveRequirementAuthorities(
  ingressReport: SdlcWorkspaceIngressReport
): readonly ImportedRequirementAuthority[] {
  const byAuthorityRef = new Map<string, ImportedRequirementAuthority>();
  for (const authority of ingressReport.importedRequirementAuthorities) {
    byAuthorityRef.set(authorityRefForIngressAuthority(authority), authority);
  }
  return Object.freeze(
    [...byAuthorityRef.values()].sort((left, right) =>
      authorityRefForIngressAuthority(left).localeCompare(
        authorityRefForIngressAuthority(right)
      )
    )
  );
}

function isBehavioralProofKind(proofKind: SdlcRequirementProofKind): boolean {
  return proofKind === "behavioral_test" || proofKind === "runtime_result";
}

function entryHasSatisfiedBehavioralProof(input: {
  readonly entry: SdlcLineageEntry;
  readonly requirementAuthorityRef: string;
}): boolean {
  return (
    input.entry.generatedAssetContractSatisfied &&
    input.entry.proofs.some(
      (proof) =>
        proof.requirementAuthorityRef === input.requirementAuthorityRef &&
        isBehavioralProofKind(proof.proofKind)
    )
  );
}

function closureForRequirement(input: {
  readonly authority: ImportedRequirementAuthority;
  readonly ingressReport: SdlcWorkspaceIngressReport;
  readonly lineageLedger: SdlcLineageLedger;
}): SdlcRequirementClosureEntry {
  const requirementDisplayId = displayIdForIngressAuthority(input.authority);
  const requirementAuthorityRef = authorityRefForIngressAuthority(input.authority);
  const entries = input.lineageLedger.entries.filter((entry) =>
    entry.requirementAuthorityRefs.includes(requirementAuthorityRef)
  );
  const proofs = entries.flatMap((entry) =>
    entry.proofs.filter(
      (proof) => proof.requirementAuthorityRef === requirementAuthorityRef
    )
  );
  const proofKinds = uniqueSorted(proofs.map((proof) => proof.proofKind));
  const authorityVerbs = uniqueSorted(proofs.map((proof) => proof.authorityVerb));
  const evidenceRefs = uniqueSorted([
    ...entries.flatMap((entry) => entry.evidenceRefs),
    ...proofs.flatMap((proof) => proof.evidenceRefs)
  ]);
  const hasBehavioralEvidence =
    proofKinds.includes("behavioral_test") || proofKinds.includes("runtime_result");
  const hasTraceTag = proofKinds.includes("trace_tag");
  const hasPlannedEvidence =
    proofKinds.includes("planned_test") || proofKinds.includes("design_carry");
  const hasSatisfiedGeneratedAsset = entries.some(
    (entry) => entry.generatedAssetContractSatisfied
  );
  const hasSatisfiedBehavioralEntry = entries.some((entry) =>
    entryHasSatisfiedBehavioralProof({
      entry,
      requirementAuthorityRef
    })
  );
  const openReasons: string[] = [];
  let fulfillmentStatus: SdlcRequirementFulfillmentStatus = "missing";
  let traceabilityStatus: SdlcRequirementTraceabilityStatus = "absent";

  if (entries.length === 0) {
    openReasons.push("no_generated_asset_lineage");
  } else if (hasSatisfiedBehavioralEntry) {
    fulfillmentStatus = "fulfilled";
    traceabilityStatus = "behavioral_evidence";
  } else if (hasBehavioralEvidence) {
    fulfillmentStatus = "partial";
    traceabilityStatus = hasTraceTag ? "trace_only" : "absent";
    openReasons.push("behavioral_evidence_not_bound_to_satisfied_generated_asset");
  } else if (hasTraceTag) {
    fulfillmentStatus = "partial";
    traceabilityStatus = "trace_only";
    openReasons.push("behavioral_evidence_missing");
  } else if (hasPlannedEvidence) {
    fulfillmentStatus = "planned";
    openReasons.push("behavioral_evidence_missing");
  } else {
    fulfillmentStatus = "partial";
    openReasons.push("proof_claim_missing");
  }

  if (entries.length > 0 && !hasSatisfiedGeneratedAsset) {
    openReasons.push("generated_asset_contract_unsatisfied");
  }

  const carryStatus: SdlcRequirementCarryStatus =
    fulfillmentStatus === "fulfilled" ? "fulfilled" : "carried_forward";

  return Object.freeze({
    kind: "sdlc_requirement_closure_entry",
    requirementId: requirementDisplayId,
    requirementDisplayId,
    requirementAuthorityRef,
    authorityDerivationRefs: derivationRefsForIngressAuthority(input.authority),
    sourceInputUris: sourceUrisForRequirement({
      ingressReport: input.ingressReport,
      requirementAuthorityRef
    }),
    assetIds: uniqueSorted(entries.map((entry) => entry.elementId)),
    producedByGraphFunctions: uniqueSorted(
      entries.map((entry) => entry.producedByGraphFunction)
    ),
    proofKinds,
    authorityVerbs,
    evidenceRefs,
    traceabilityStatus,
    fulfillmentStatus,
    carryStatus,
    openReasons: uniqueSorted(openReasons)
  });
}

function unmatchedClaimClosureEntries(input: {
  readonly liveAuthorityRefs: readonly string[];
  readonly lineageLedger: SdlcLineageLedger;
}): readonly SdlcRequirementClosureEntry[] {
  const liveAuthorityRefs = new Set(input.liveAuthorityRefs);
  const byAuthorityRef = new Map<
    string,
    {
      readonly requirementIds: Set<string>;
      readonly assetIds: Set<string>;
      readonly producedByGraphFunctions: Set<string>;
      readonly proofKinds: Set<SdlcRequirementProofKind>;
      readonly authorityVerbs: Set<SdlcRequirementProofAuthority>;
      readonly evidenceRefs: Set<string>;
    }
  >();
  for (const entry of input.lineageLedger.entries) {
    for (const diagnostic of entry.proofClaimDiagnostics) {
      if (liveAuthorityRefs.has(diagnostic.requirementAuthorityRef)) {
        continue;
      }
      const existing = byAuthorityRef.get(diagnostic.requirementAuthorityRef) ?? {
        requirementIds: new Set<string>(),
        assetIds: new Set<string>(),
        producedByGraphFunctions: new Set<string>(),
        proofKinds: new Set<SdlcRequirementProofKind>(),
        authorityVerbs: new Set<SdlcRequirementProofAuthority>(),
        evidenceRefs: new Set<string>()
      };
      existing.requirementIds.add(diagnostic.requirementId);
      existing.assetIds.add(entry.elementId);
      existing.producedByGraphFunctions.add(entry.producedByGraphFunction);
      existing.proofKinds.add(diagnostic.proofKind);
      existing.authorityVerbs.add(diagnostic.authorityVerb);
      for (const evidenceRef of diagnostic.evidenceRefs) {
        existing.evidenceRefs.add(evidenceRef);
      }
      byAuthorityRef.set(diagnostic.requirementAuthorityRef, existing);
    }
  }
  return Object.freeze(
    [...byAuthorityRef.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([requirementAuthorityRef, diagnostic]) => {
        const requirementIds = uniqueSorted([...diagnostic.requirementIds]);
        const requirementDisplayId =
          requirementIds[0] ?? requirementAuthorityRef;
        return Object.freeze({
          kind: "sdlc_requirement_closure_entry" as const,
          requirementId: requirementDisplayId,
          requirementDisplayId,
          requirementAuthorityRef,
          authorityDerivationRefs: Object.freeze([]),
          sourceInputUris: Object.freeze([]),
          assetIds: uniqueSorted([...diagnostic.assetIds]),
          producedByGraphFunctions: uniqueSorted([
            ...diagnostic.producedByGraphFunctions
          ]),
          proofKinds: uniqueSorted([...diagnostic.proofKinds]),
          authorityVerbs: uniqueSorted([...diagnostic.authorityVerbs]),
          evidenceRefs: uniqueSorted([...diagnostic.evidenceRefs]),
          traceabilityStatus: "absent" as const,
          fulfillmentStatus: "missing" as const,
          carryStatus: "carried_forward" as const,
          openReasons: Object.freeze([
            "proof_claim_requirement_authority_unresolved"
          ])
        });
      })
  );
}

export function projectSdlcRequirementClosureRegister(input: {
  readonly ingressReport: SdlcWorkspaceIngressReport;
  readonly lineageLedger: SdlcLineageLedger;
}): SdlcRequirementClosureRegister {
  const liveAuthorities = liveRequirementAuthorities(input.ingressReport);
  const liveAuthorityRefs = liveAuthorities.map(authorityRefForIngressAuthority);
  const entries = Object.freeze([
    ...liveAuthorities.map((authority) =>
      closureForRequirement({
        authority,
        ingressReport: input.ingressReport,
        lineageLedger: input.lineageLedger
      })
    ),
    ...unmatchedClaimClosureEntries({
      liveAuthorityRefs,
      lineageLedger: input.lineageLedger
    })
  ]);
  return Object.freeze({
    kind: "sdlc_requirement_closure_register",
    entries,
    fulfilledRequirementIds: uniqueSorted(
      entries
        .filter((entry) => entry.fulfillmentStatus === "fulfilled")
        .map((entry) => entry.requirementId)
    ),
    carriedForwardRequirementIds: uniqueSorted(
      entries
        .filter((entry) => entry.carryStatus === "carried_forward")
        .map((entry) => entry.requirementId)
    ),
    unresolvedRequirementIds: uniqueSorted(
      entries
        .filter((entry) => entry.fulfillmentStatus !== "fulfilled")
        .map((entry) => entry.requirementId)
    ),
    fulfilledRequirementAuthorityRefs: uniqueSorted(
      entries
        .filter((entry) => entry.fulfillmentStatus === "fulfilled")
        .map((entry) => entry.requirementAuthorityRef)
    ),
    carriedForwardRequirementAuthorityRefs: uniqueSorted(
      entries
        .filter((entry) => entry.carryStatus === "carried_forward")
        .map((entry) => entry.requirementAuthorityRef)
    ),
    unresolvedRequirementAuthorityRefs: uniqueSorted(
      entries
        .filter((entry) => entry.fulfillmentStatus !== "fulfilled")
        .map((entry) => entry.requirementAuthorityRef)
    ),
    emittedRuntimeEventKinds: EMPTY_RUNTIME_EVENT_KINDS
  });
}

function repairLane(input: {
  readonly lane: SdlcRepairFrontierLane;
  readonly requirementIds: readonly string[];
  readonly requirementAuthorityRefs?: readonly string[];
  readonly action: string;
}): SdlcRepairFrontierEntry {
  return Object.freeze({
    kind: "sdlc_repair_frontier_entry",
    lane: input.lane,
    requirementIds: Object.freeze([...input.requirementIds]),
    ...(input.requirementAuthorityRefs === undefined
      ? {}
      : {
          requirementAuthorityRefs: Object.freeze([
            ...input.requirementAuthorityRefs
          ])
        }),
    action: input.action
  });
}

export function projectSdlcRepairFrontier(input: {
  readonly closureRegister: SdlcRequirementClosureRegister;
}): SdlcRepairFrontier {
  const unmetRequirementIds = input.closureRegister.unresolvedRequirementIds;
  const preservationRequirementIds = input.closureRegister.fulfilledRequirementIds;
  const unmetRequirementAuthorityRefs =
    input.closureRegister.unresolvedRequirementAuthorityRefs ?? unmetRequirementIds;
  const preservationRequirementAuthorityRefs =
    input.closureRegister.fulfilledRequirementAuthorityRefs ??
    preservationRequirementIds;
  return Object.freeze({
    kind: "sdlc_repair_frontier",
    unmetRequirementIds,
    preservationRequirementIds,
    unmetRequirementAuthorityRefs,
    preservationRequirementAuthorityRefs,
    lanes: Object.freeze([
      repairLane({
        lane: "requirements",
        requirementIds: unmetRequirementIds,
        requirementAuthorityRefs: unmetRequirementAuthorityRefs,
        action: "carry unresolved requirement truth forward without erasing authority"
      }),
      repairLane({
        lane: "design",
        requirementIds: unmetRequirementIds,
        requirementAuthorityRefs: unmetRequirementAuthorityRefs,
        action: "bind each unmet requirement to an explicit design/module carrier"
      }),
      repairLane({
        lane: "code",
        requirementIds: unmetRequirementIds,
        requirementAuthorityRefs: unmetRequirementAuthorityRefs,
        action: "realize generated or adopted assets under graph-function authority"
      }),
      repairLane({
        lane: "test",
        requirementIds: unmetRequirementIds,
        requirementAuthorityRefs: unmetRequirementAuthorityRefs,
        action: "add behavioral or runtime proof; trace tags alone are insufficient"
      })
    ]),
    lawfulEditFrontier: "edit only unmet requirement carriers, generated assets, or design links named by the frontier",
    lawfulProofFrontier: "prove fulfillment with behavioral_test or runtime_result evidence over a satisfied generated asset contract",
    emittedRuntimeEventKinds: EMPTY_RUNTIME_EVENT_KINDS
  });
}
