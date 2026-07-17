// T-267 internal reduction over one already typechecked whole-program report.
// The public standalone admission remains defensive and re-typechecks before
// entering this reducer; family compilation enters it only after one shared
// typecheck of the complete submitted structure.

import { stableSha256Digest } from "../../../shared/runtime_identity.js";
import type { GtlProgramConformanceIssue } from "./gtl_program_conformance.js";
import type {
  AdmittedTraversalStageResultAuthority,
  CompiledTraversalExecutionContracts,
  TraversalContractSourceBasis,
  TraversalExecutionAdmissionOutcome
} from "./traversal_execution_contract.js";
import type { GtlProgramConformanceReport } from "./gtl_program_conformance.js";

const T267_RULE_PREFIXES = Object.freeze([
  "abg://gtl-program/traversal-unit/",
  "abg://gtl-program/traversal-bind-conservation/",
  "abg://gtl-program/compute-composition/",
  "abg://gtl-program/compute-stage/",
  "abg://gtl-program/plugin-result-interface/"
]);

function t267Issue(issue: GtlProgramConformanceIssue): boolean {
  return T267_RULE_PREFIXES.some((prefix) => issue.ruleRef.startsWith(prefix));
}

function sameStringMembers(
  actual: readonly string[],
  expected: readonly string[]
): boolean {
  return actual.length === expected.length &&
    expected.every((ref) => actual.includes(ref));
}

function invalid(input: {
  readonly actualRelation: string;
  readonly evidenceRefs: readonly string[];
}): TraversalExecutionAdmissionOutcome {
  return Object.freeze({
    kind: "traversal_execution_admission_outcome" as const,
    status: "invalid" as const,
    runtimeAddressable: false as const,
    effectsPermitted: false as const,
    diagnostic: Object.freeze({
      kind: "traversal_execution_contract_diagnostic" as const,
      diagnosticId: "traversal-static-unit-nonconformant" as const,
      actualRelation: input.actualRelation,
      evidenceRefs: Object.freeze([...input.evidenceRefs])
    })
  });
}

function admissionBasis<Status extends
  | "static_contracts_admitted_program_blocked"
  | "static_contracts_admitted_capability_blocked"
  | "runtime_addressable_not_closed"
>(input: {
  readonly status: Status;
  readonly source: TraversalContractSourceBasis;
  readonly resultAuthorities:
    readonly AdmittedTraversalStageResultAuthority[];
  readonly bundle: CompiledTraversalExecutionContracts;
  readonly report: GtlProgramConformanceReport;
}) {
  return Object.freeze({
    kind: "traversal_execution_admission_outcome" as const,
    status: input.status,
    sourceKind: input.source.sourceKind,
    sourceRef: input.source.sourceRef,
    sourceDigest: input.source.sourceDigest,
    currentAuthorityRef: input.source.currentAuthorityRef,
    currentAuthorityDigest: input.source.currentAuthorityDigest,
    startupBlockDigest: input.source.startupBlockDigest,
    graphFunctionRef: input.source.graphFunctionRef,
    graphFunctionId: input.source.graphFunctionId,
    graphFunctionDigest: input.source.graphFunctionDigest,
    capabilityDisposition: input.source.capabilityDisposition,
    currentResultAuthorities: Object.freeze(
      input.resultAuthorities.map((authority) => Object.freeze({
        sourceKind: authority.sourceKind,
        stageOrdinal: authority.stageOrdinal,
        programLocusRef: authority.programLocusRef,
        declaredStageTermDigest: authority.declaredStageTermDigest,
        domainStageRole: authority.domainStageRole,
        currentSourceAuthorityRef: authority.currentSourceAuthorityRef,
        currentSourceAuthorityDigest: authority.currentSourceAuthorityDigest
      }))
    ),
    bundleDigest: input.bundle.bundleDigest,
    reportRef: input.report.reportRef
  });
}

/** @internal */
export function admitTraversalExecutionAgainstCheckedReport(input: {
  readonly source: TraversalContractSourceBasis;
  readonly resultAuthorities:
    readonly AdmittedTraversalStageResultAuthority[];
  readonly bundle: CompiledTraversalExecutionContracts;
  readonly report: GtlProgramConformanceReport;
}): TraversalExecutionAdmissionOutcome {
  const candidateUnits = input.report.traversalUnitProjection.units.filter(
    (unit) =>
      unit.graphFunctionId === input.source.graphFunctionId &&
      unit.graphId === input.source.graphId &&
      unit.graphVectorId === input.source.graphVectorId
  );
  const unitMatches = candidateUnits.filter(
    (unit) =>
      unit.targetCarrierContractRef ===
        input.source.targetCarrierProjection.targetCarrierContractRef &&
      unit.edgeClosureRef === input.source.edgeClosureBinding.edgeRef &&
      sameStringMembers(unit.computeCompositionRefs, [
        input.bundle.computeComposition.compositionRef
      ]) &&
      unit.conservationBasisRef ===
        input.bundle.traversalBindConservation.conservationRef &&
      sameStringMembers(
        unit.computeStageBindingRefs,
        input.bundle.computeStageBindings.map((row) => row.stageBindingRef)
      ) &&
      sameStringMembers(
        unit.pluginResultInterfaceRefs,
        input.bundle.pluginResultInterfaces.map((row) => row.resultInterfaceRef)
      ) &&
      sameStringMembers(
        unit.consequencePluginResultInterfaceRefs,
        input.bundle.pluginResultInterfaces
          .filter((row) => row.stageRole === "consequence")
          .map((row) => row.resultInterfaceRef)
      ) &&
      sameStringMembers(
        unit.resultBearingPluginResultInterfaceRefs,
        input.bundle.pluginResultInterfaces
          .filter((row) => row.resultBearing === true)
          .map((row) => row.resultInterfaceRef)
      ) &&
      sameStringMembers(unit.programPlanRefs, [
        input.source.completeProgramPlan.planRef
      ]) &&
      sameStringMembers(unit.programPlanDigests, [
        input.source.completeProgramPlan.planDigest
      ]) &&
      sameStringMembers(
        unit.authoredProgramNodeRefs,
        input.source.authoredProgramNodeRefs
      ) &&
      sameStringMembers(
        unit.invokingProgramLocusRefs,
        input.source.invokingProgramLocusRefs
      ) &&
      sameStringMembers(
        unit.resultBearingProgramLocusRefs,
        input.source.resultBearingProgramLocusRefs
      ) &&
      sameStringMembers(
        unit.applicationConservationRefs,
        input.source.applicationConservationRefs
      )
  );
  const t267Issues = input.report.issues.filter(t267Issue);
  if (unitMatches.length !== 1 || t267Issues.length > 0) {
    const candidateComparisons = candidateUnits.map((unit) => ({
      unitRef: unit.unitRef,
      targetCarrier: unit.targetCarrierContractRef ===
        input.source.targetCarrierProjection.targetCarrierContractRef,
      edgeClosure: unit.edgeClosureRef === input.source.edgeClosureBinding.edgeRef,
      composition: sameStringMembers(unit.computeCompositionRefs, [
        input.bundle.computeComposition.compositionRef
      ]),
      conservation: unit.conservationBasisRef ===
        input.bundle.traversalBindConservation.conservationRef,
      stages: sameStringMembers(
        unit.computeStageBindingRefs,
        input.bundle.computeStageBindings.map((row) => row.stageBindingRef)
      ),
      interfaces: sameStringMembers(
        unit.pluginResultInterfaceRefs,
        input.bundle.pluginResultInterfaces.map((row) => row.resultInterfaceRef)
      ),
      plan: sameStringMembers(unit.programPlanRefs, [
        input.source.completeProgramPlan.planRef
      ]),
      authoredNodes: sameStringMembers(
        unit.authoredProgramNodeRefs,
        input.source.authoredProgramNodeRefs
      ),
      invokingLoci: sameStringMembers(
        unit.invokingProgramLocusRefs,
        input.source.invokingProgramLocusRefs
      ),
      resultFrontier: sameStringMembers(
        unit.resultBearingProgramLocusRefs,
        input.source.resultBearingProgramLocusRefs
      ),
      application: sameStringMembers(
        unit.applicationConservationRefs,
        input.source.applicationConservationRefs
      )
    }));
    return invalid({
      actualRelation:
        "exact TraversalUnit projection retains T-267 conformance issues: " +
        JSON.stringify(candidateComparisons),
      evidenceRefs: Object.freeze([
        input.source.sourceDigest,
        input.bundle.bundleDigest,
        input.report.reportRef,
        ...candidateUnits.flatMap((unit) => [
          unit.unitRef,
          ...unit.programPlanRefs,
          ...unit.programPlanDigests,
          ...unit.applicationConservationRefs
        ]),
        ...t267Issues.map((issue) => issue.ruleRef)
      ])
    });
  }

  if (!input.report.passed || input.report.issueCount !== 0) {
    const basis = admissionBasis({
      status: "static_contracts_admitted_program_blocked",
      ...input
    });
    const admissionDigest = stableSha256Digest(basis);
    return Object.freeze({
      ...basis,
      admissionRef:
        `abg://traversal-execution-admission/${admissionDigest.slice("sha256:".length)}`,
      admissionDigest,
      runtimeAddressable: false,
      effectsPermitted: false,
      runtimeClosed: false,
      resultAdmitted: false,
      obligationsDischarged: false,
      blockingIssueRefs: Object.freeze(
        input.report.issues.map((issue) => issue.ruleRef)
      )
    });
  }

  if (input.source.capabilityDisposition === "unresolved") {
    const basis = admissionBasis({
      status: "static_contracts_admitted_capability_blocked",
      ...input
    });
    const admissionDigest = stableSha256Digest(basis);
    return Object.freeze({
      ...basis,
      admissionRef:
        `abg://traversal-execution-admission/${admissionDigest.slice("sha256:".length)}`,
      admissionDigest,
      runtimeAddressable: false,
      effectsPermitted: false,
      runtimeClosed: false,
      resultAdmitted: false,
      obligationsDischarged: false,
      blockingIssueRefs: Object.freeze([])
    });
  }

  const basis = admissionBasis({
    status: "runtime_addressable_not_closed",
    ...input
  });
  const admissionDigest = stableSha256Digest(basis);
  return Object.freeze({
    ...basis,
    admissionRef:
      `abg://traversal-execution-admission/${admissionDigest.slice("sha256:".length)}`,
    admissionDigest,
    runtimeAddressable: true,
    effectsPermitted: false,
    runtimeClosed: false,
    resultAdmitted: false,
    obligationsDischarged: false,
    capabilityDisposition: input.source.capabilityDisposition
  });
}
