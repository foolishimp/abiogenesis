import {
  admitChildExecutionBasis,
  openChildCall,
  type AbgEventStore,
  type AdmittedImplementationSet,
  type AdmittedInteractionSet,
} from "../abg/index.js";
import {
  materializeGraph,
  type GtlProgram,
  type ModulePublication,
} from "../gtl/index.js";
import {
  constructChildTraversalPreparationPort,
  type ChildTraversalPreparationPort,
  type ChildTraversalPreparationRefusal,
} from "../hog/child_traversal.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  validateGraph,
  type ProgramValidation,
} from "../validator/index.js";

export interface ChildTraversalPortBinding {
  readonly store: AbgEventStore;
  readonly publication: Readonly<ModulePublication>;
  readonly program: Readonly<GtlProgram>;
  readonly programValidation: ProgramValidation;
  readonly rootImplementationSet: AdmittedImplementationSet;
  readonly rootInteractionSet: AdmittedInteractionSet;
}

function refusal(
  stage: ChildTraversalPreparationRefusal["stage"],
  diagnosticRef: string,
  message: string,
): ChildTraversalPreparationRefusal {
  return {
    kind: "child_traversal_preparation_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    stage,
    diagnosticRef,
    message,
  };
}

export function bindChildTraversalPreparationPort(
  binding: ChildTraversalPortBinding,
): ChildTraversalPreparationPort {
  return constructChildTraversalPreparationPort(async (request) => {
    if (
      request.parentExecutionBasis.programRef !== binding.program.programRef ||
      request.parentExecutionBasis.programValidationRef !==
        binding.programValidation.validationRef ||
      request.parentTraversalScope.executionBasisRef !==
        request.parentExecutionBasis.basisRef ||
      !binding.program.callableMembership.includes(request.childGraphFunctionRef)
    ) {
      return refusal(
        "membership",
        "diagnostic://abiogenesis/child-traversal/program-membership-mismatch@5",
        "child traversal request differs from the bound admitted Program root",
      );
    }
    const graphFunction = binding.publication.graphFunctions.find(
      (candidate) => candidate.name === request.childGraphFunctionRef,
    );
    if (graphFunction === undefined) {
      return refusal(
        "membership",
        "diagnostic://abiogenesis/child-traversal/graph-function-absent@5",
        "declared child GraphFunction is absent from the bound publication",
      );
    }
    const closureContractRef =
      graphFunction.declarations["abg.child_closure_contract"];
    const closureContract = binding.publication.closureContracts.find(
      (candidate) => candidate.closureContractRef === closureContractRef,
    );
    if (closureContract === undefined) {
      return refusal(
        "membership",
        "diagnostic://abiogenesis/child-traversal/closure-contract-absent@5",
        "declared child closure contract is absent from the bound publication",
      );
    }
    const graph = materializeGraph(graphFunction, {
      invocationAdmissionRef: request.parentExecutionBasis.invocationAdmissionRef,
      admittedInputRef: request.inputRef,
      admittedInputDigest: request.inputDigest,
    });
    const graphValidation = validateGraph(
      graph,
      binding.programValidation,
      graphFunction,
      {
        invocationAdmissionRef: request.parentExecutionBasis.invocationAdmissionRef,
        admittedInputRef: request.inputRef,
        admittedInputDigest: request.inputDigest,
      },
    );
    if (graphValidation.kind !== "graph_validation") {
      return refusal(
        "graph_validation",
        `diagnostic://abiogenesis/child-traversal/${graphValidation.diagnostics[0]?.code ?? "invalid-graph"}@5`,
        "child Graph failed exact non-lowering validation",
      );
    }
    const parentFibreEvent = binding.store.readAll().find(
      (event) => event.kind === "c_call_fibre_selected" &&
        event.aggregateId === request.parentCCallRef,
    );
    if (parentFibreEvent === undefined) {
      return refusal(
        "basis_admission",
        "diagnostic://abiogenesis/child-traversal/parent-call-absent@5",
        "child basis admission requires the opened transparent parent CCall",
      );
    }
    const childBasis = admitChildExecutionBasis(
      binding.store,
      {
        parentExecutionBasis: request.parentExecutionBasis,
        parentTraversalScope: request.parentTraversalScope,
        program: binding.program,
        programValidation: binding.programValidation,
        graphFunction,
        graph,
        graphValidation,
        rootImplementationSet: binding.rootImplementationSet,
        rootInteractionSet: binding.rootInteractionSet,
        closureContract,
        admittedInputRef: request.inputRef,
        admittedInputDigest: request.inputDigest,
      },
      {
        eventTime: request.eventTime,
        correlationId: `${request.correlationId}/basis`,
        causationEventRefs: [parentFibreEvent.eventId],
      },
    );
    if (childBasis.kind !== "child_execution_basis_admission") {
      return refusal(
        "basis_admission",
        `diagnostic://abiogenesis/child-traversal/${childBasis.code}@5`,
        childBasis.message,
      );
    }
    const opened = openChildCall(
      binding.store,
      request.parentTraversalScope,
      childBasis.executionBasis,
      {
        eventTime: request.eventTime,
        correlationId: `${request.correlationId}/open`,
        causationEventRefs: [parentFibreEvent.eventId],
      },
    );
    if (opened.kind !== "open_child_call_admission") {
      return refusal(
        "scope_open",
        `diagnostic://abiogenesis/child-traversal/${opened.code}@5`,
        opened.message,
      );
    }
    return deepFreeze({
      kind: "prepared_child_traversal" as const,
      schemaVersion: "5.0.0" as const,
      disposition: "prepared" as const,
      program: binding.program,
      programValidation: binding.programValidation,
      graphFunction,
      graph,
      graphValidation,
      executionBasis: childBasis.executionBasis,
      openedTraversalScope: opened.scope,
      implementationSet: binding.rootImplementationSet,
      interactionSet: binding.rootInteractionSet,
      closureContract,
      inputRef: request.inputRef,
      inputDigest: request.inputDigest,
      input: request.input,
    });
  });
}
