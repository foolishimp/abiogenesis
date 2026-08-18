import * as Effect from "effect/Effect";

import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import {
  definitionFault,
  hasExactKeys,
  isDefinitionFault,
  isRecord,
  reference,
  sameCoordinate,
  sameJson,
  validatedOwnerOutput,
} from "../shared/definition_binding_mechanics.js";
import type {
  DefinitionExecutionFault,
  DefinitionReturn,
  ExactDefinitionCallable,
} from "../shared/effect_definition.js";
import { deepFreeze } from "../shared/immutable.js";
import type { OwnerSemanticOutput } from
  "../shared/public_function_contracts.js";
import type { ReferenceDigest } from "../shared/public_invocation.js";
import {
  ConformancePort,
  type ConformanceEvaluatePacket,
  type GtlProgramConformanceOperationResult,
} from "./conformance_operation.js";
import { CONFORMANCE_OPERATION_CONTRACTS } from
  "./conformance_operation_contracts.js";

type ConformanceContract =
  typeof CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program;

export interface ConformanceEvaluationResourceAssertion {
  readonly kind: "conformance_evaluation_resource_assertion";
  readonly schemaVersion: "5.0.0";
  readonly packet: ConformanceEvaluatePacket;
  readonly conformanceLaw: ReferenceDigest<"GtlConformanceLaw">;
}

function fault(
  definitionKey: ConformanceContract["definitionKey"],
  code: string,
  message: string,
): DefinitionExecutionFault<ConformanceContract["definitionKey"]> {
  return definitionFault(
    definitionKey,
    "resource_admission",
    code,
    message,
  );
}

function opaqueCoordinate(ref: string): ReferenceDigest {
  return reference(ref, sha256Canonical({ ref }));
}

function nativeRefusal(
  output: Extract<
    GtlProgramConformanceOperationResult,
    { readonly disposition: "failed" }
  >,
): OwnerSemanticOutput<ConformanceContract> {
  return validatedOwnerOutput(
    CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program,
    {
      outcomeKind: "refusal",
      value: {
        code: output.code === "validation_failed"
          ? "assessment_blocked"
          : "invalid_program",
        issuePaths: ["/program"],
        evidenceRefs: output.evidenceRefs,
      },
    } as OwnerSemanticOutput<ConformanceContract>,
    "Validator conformance",
  );
}

const gtl_program: ExactDefinitionCallable<
  ConformanceContract,
  ConformanceEvaluationResourceAssertion,
  ConformanceEvaluationResourceAssertion
> = (call) => Effect.try({
  try: (): DefinitionReturn<
    ConformanceContract,
    ConformanceEvaluationResourceAssertion
  > => {
    const resources = call.resources;
    if (
      !isRecord(resources) ||
      !hasExactKeys(resources, [
        "conformanceLaw",
        "kind",
        "packet",
        "schemaVersion",
      ]) ||
      resources.kind !== "conformance_evaluation_resource_assertion" ||
      resources.schemaVersion !== "5.0.0" ||
      !isRecord(resources.packet) ||
      !isRecord(resources.conformanceLaw) ||
      !sameJson(resources, resources)
    ) {
      throw fault(
        call.invocation.definitionKey,
        "invalid_resource_assertion",
        "GTL Program conformance requires one exact typed publication and Program packet",
      );
    }
    const request = call.invocation.request;
    const packet = resources.packet;
    const program = reference(
      packet.program.programRef,
      sha256Canonical(packet.program as unknown as JsonValue),
    );
    const publication = reference(
      packet.publication.moduleRef,
      sha256Canonical(packet.publication as unknown as JsonValue),
    );
    const inventoryMatches = request.inventoryBasis.kind === "program_only" ||
      sameJson(request.inventoryBasis.inventory, [publication]);
    if (
      packet.kind !== "conformance_evaluate_packet" ||
      packet.schemaVersion !== "5.0.0" ||
      packet.memberKey !== "gtl_program" ||
      !sameCoordinate(request.program, program) ||
      !sameCoordinate(request.conformanceLaw, resources.conformanceLaw) ||
      !inventoryMatches
    ) {
      throw fault(
        call.invocation.definitionKey,
        "resource_relation_mismatch",
        "conformance packet differs from the public Program, law, or inventory coordinates",
      );
    }
    const native = ConformancePort.evaluateGtlProgram(packet);
    if (native.disposition === "failed" && native.code !== "validation_failed") {
      return deepFreeze({
        ownerOutput: nativeRefusal(native),
        resources,
      });
    }
    const assessment = native.disposition === "passed"
      ? reference(native.evidenceRef, native.evidenceDigest)
      : reference(
        native.diagnosticRef,
        sha256Canonical(native as unknown as JsonValue),
      );
    const ownerOutput = validatedOwnerOutput(
      CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program,
      {
        outcomeKind: "result",
        value: {
          program,
          inventory: request.inventoryBasis.kind === "declared_inventory"
            ? publication
            : null,
          assessment,
          disposition: native.disposition,
          diagnostics: native.diagnostics,
          violatedAuthorities: native.disposition === "failed"
            ? native.violatedContractRefs.map(opaqueCoordinate)
            : [],
          evidence: native.disposition === "passed"
            ? [assessment]
            : [assessment, ...native.evidenceRefs.map(opaqueCoordinate)],
          repairAffordances: [],
        },
      } as OwnerSemanticOutput<ConformanceContract>,
      "Validator conformance",
    );
    return deepFreeze({ ownerOutput, resources });
  },
  catch: (cause) => isDefinitionFault(cause)
    ? cause as DefinitionExecutionFault<ConformanceContract["definitionKey"]>
    : fault(
      call.invocation.definitionKey,
      "owner_execution_failure",
      String(cause),
    ),
});

export const CONFORMANCE_DEFINITION_BINDINGS = Object.freeze({
  evaluate: Object.freeze({ gtl_program }),
});
