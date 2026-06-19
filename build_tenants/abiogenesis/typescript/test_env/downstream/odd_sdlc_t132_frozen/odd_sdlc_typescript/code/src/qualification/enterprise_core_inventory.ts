// Implements: REQ-F-ODDSDLC-040
// Implements: REQ-F-ODDSDLC-043
// Investigates: B-068

export const ENTERPRISE_CORE_COMPONENTS = Object.freeze([
  "ProbeParser",
  "ProbePlanner",
  "ProbeRunner",
  "ProbeSynthesizer",
  "ProbeRunLedger",
  "ProbeArtifactLedger",
  "ProbeAssuranceCheck",
  "ProbeAccountingCheck",
  "ProbeReversePlanner",
  "ProbeInvariantCheck",
  "ProbeCompositionCore"
] as const);

export type EnterpriseCoreComponent =
  (typeof ENTERPRISE_CORE_COMPONENTS)[number];

export interface EnterpriseCoreCapabilityInventoryEntry {
  readonly capabilityId: string;
  readonly requirementRefs: readonly string[];
  readonly sourceComponent: EnterpriseCoreComponent;
  readonly behavioralTestTarget: EnterpriseCoreComponent;
  readonly evidenceContract: string;
}

export const ENTERPRISE_CORE_CAPABILITY_INVENTORY = Object.freeze([
  {
    capabilityId: "b068_parse_probe",
    requirementRefs: Object.freeze(["REQ-TYP"]),
    sourceComponent: "ProbeParser",
    behavioralTestTarget: "ProbeParser",
    evidenceContract: "validated type unification and rejection behavior"
  },
  {
    capabilityId: "b068_plan_probe",
    requirementRefs: Object.freeze(["REQ-LDM", "REQ-TRV"]),
    sourceComponent: "ProbePlanner",
    behavioralTestTarget: "ProbePlanner",
    evidenceContract: "probe graph path with cardinality and policy checks"
  },
  {
    capabilityId: "b068_run_probe",
    requirementRefs: Object.freeze(["REQ-TRV", "REQ-INT"]),
    sourceComponent: "ProbeRunner",
    behavioralTestTarget: "ProbeRunner",
    evidenceContract: "probe runtime traversal"
  },
  {
    capabilityId: "b068_synthesize_probe",
    requirementRefs: Object.freeze(["REQ-INT"]),
    sourceComponent: "ProbeSynthesizer",
    behavioralTestTarget: "ProbeSynthesizer",
    evidenceContract: "synthesis of missing or identity probe links"
  },
  {
    capabilityId: "b068_run_ledger_probe",
    requirementRefs: Object.freeze(["REQ-TRV", "REQ-LIN"]),
    sourceComponent: "ProbeRunLedger",
    behavioralTestTarget: "ProbeRunLedger",
    evidenceContract: "immutable run identity and manifest lifecycle"
  },
  {
    capabilityId: "b068_artifact_ledger_probe",
    requirementRefs: Object.freeze(["REQ-LIN"]),
    sourceComponent: "ProbeArtifactLedger",
    behavioralTestTarget: "ProbeArtifactLedger",
    evidenceContract: "artifact version pinning for replay and lineage"
  },
  {
    capabilityId: "b068_assurance_probe",
    requirementRefs: Object.freeze(["REQ-ASSURANCE"]),
    sourceComponent: "ProbeAssuranceCheck",
    behavioralTestTarget: "ProbeAssuranceCheck",
    evidenceContract: "structural assurance gate over generated mappings"
  },
  {
    capabilityId: "b068_accounting_probe",
    requirementRefs: Object.freeze(["REQ-ACC"]),
    sourceComponent: "ProbeAccountingCheck",
    behavioralTestTarget: "ProbeAccountingCheck",
    evidenceContract: "balanced ledger verification before run completion"
  },
  {
    capabilityId: "b068_reverse_plan_probe",
    requirementRefs: Object.freeze(["REQ-ADJ"]),
    sourceComponent: "ProbeReversePlanner",
    behavioralTestTarget: "ProbeReversePlanner",
    evidenceContract: "reverse-plan compilation and validation"
  },
  {
    capabilityId: "b068_invariant_probe",
    requirementRefs: Object.freeze(["REQ-FID"]),
    sourceComponent: "ProbeInvariantCheck",
    behavioralTestTarget: "ProbeInvariantCheck",
    evidenceContract: "probe invariant verification"
  },
  {
    capabilityId: "b068_composition_probe",
    requirementRefs: Object.freeze(["REQ-ENG"]),
    sourceComponent: "ProbeCompositionCore",
    behavioralTestTarget: "ProbeCompositionCore",
    evidenceContract: "engine-level composition across compiler and executor"
  }
] satisfies readonly EnterpriseCoreCapabilityInventoryEntry[]);

export type EnterpriseCoreEvidenceState = "missing" | "present" | "governed";
export type EnterpriseCoreInventoryEvaluationStatus = "accepted" | "blocked";

export interface EnterpriseCoreInventoryState {
  readonly sourceComponents: readonly EnterpriseCoreComponent[];
  readonly testComponents: readonly EnterpriseCoreComponent[];
  readonly buildEvidence: EnterpriseCoreEvidenceState;
  readonly testEvidence: EnterpriseCoreEvidenceState;
  readonly evidenceRefs: readonly string[];
}

export interface EnterpriseCoreInventoryEvaluation {
  readonly kind: "enterprise_core_inventory_evaluation";
  readonly status: EnterpriseCoreInventoryEvaluationStatus;
  readonly requiredComponents: readonly EnterpriseCoreComponent[];
  readonly requiredCapabilityIds: readonly string[];
  readonly missingSourceComponents: readonly EnterpriseCoreComponent[];
  readonly missingTestComponents: readonly EnterpriseCoreComponent[];
  readonly blockingReasons: readonly string[];
}

function componentSet(
  components: readonly EnterpriseCoreComponent[]
): ReadonlySet<EnterpriseCoreComponent> {
  return new Set(components);
}

function missingComponents(input: {
  readonly required: readonly EnterpriseCoreComponent[];
  readonly observed: readonly EnterpriseCoreComponent[];
}): readonly EnterpriseCoreComponent[] {
  const observedSet = componentSet(input.observed);
  return Object.freeze(
    input.required.filter((component) => !observedSet.has(component))
  );
}

export function evaluateEnterpriseCoreInventory(input: {
  readonly state: EnterpriseCoreInventoryState;
  readonly requiredComponents?: readonly EnterpriseCoreComponent[];
  readonly capabilityInventory?: readonly EnterpriseCoreCapabilityInventoryEntry[];
}): EnterpriseCoreInventoryEvaluation {
  const capabilityInventory =
    input.capabilityInventory ?? ENTERPRISE_CORE_CAPABILITY_INVENTORY;
  const requiredComponents = input.requiredComponents ??
    capabilityInventory.map((entry) => entry.sourceComponent);
  const requiredTestComponents = capabilityInventory.map(
    (entry) => entry.behavioralTestTarget
  );
  const missingSourceComponents = missingComponents({
    required: requiredComponents,
    observed: input.state.sourceComponents
  });
  const missingTestComponents = missingComponents({
    required: requiredTestComponents,
    observed: input.state.testComponents
  });
  const hasBuildEvidenceRef = input.state.evidenceRefs.some((ref) =>
    ref.startsWith("build://")
  );
  const hasTestEvidenceRef = input.state.evidenceRefs.some(
    (ref) => ref.startsWith("junit://") || ref.startsWith("test-report://")
  );
  const blockingReasons = [
    ...missingSourceComponents.map(
      (component) => `missing_source_component:${component}`
    ),
    ...missingTestComponents.map(
      (component) => `missing_behavioral_test:${component}`
    ),
    ...(input.state.buildEvidence === "missing"
      ? ["missing_governed_build_evidence"]
      : []),
    ...(input.state.buildEvidence === "present"
      ? ["ungoverned_build_evidence"]
      : []),
    ...(input.state.buildEvidence === "governed" && !hasBuildEvidenceRef
      ? ["governed_build_report_ref_missing"]
      : []),
    ...(input.state.testEvidence === "missing"
      ? ["missing_governed_test_evidence"]
      : []),
    ...(input.state.testEvidence === "present"
      ? ["ungoverned_test_evidence"]
      : []),
    ...(input.state.testEvidence === "governed" && !hasTestEvidenceRef
      ? ["governed_test_report_ref_missing"]
      : [])
  ];

  return Object.freeze({
    kind: "enterprise_core_inventory_evaluation",
    status: blockingReasons.length === 0 ? "accepted" : "blocked",
    requiredComponents: Object.freeze([...requiredComponents]),
    requiredCapabilityIds: Object.freeze(
      capabilityInventory.map((entry) => entry.capabilityId)
    ),
    missingSourceComponents,
    missingTestComponents,
    blockingReasons: Object.freeze(blockingReasons)
  });
}
