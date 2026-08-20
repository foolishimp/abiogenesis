import * as Effect from "effect/Effect";

import {
  projectAdmittedProductInstallByAdmissionEventRef,
  projectAdmittedWorkspaceBindingByInvocationRef,
  type ExactPrefixArtifactTruthProjection,
} from "../abg/index.js";
import { canonicalizeAuthoredGtlCarrier } from "../gtl/canonicalization.js";
import type {
  ClosureContract,
  ContractDeclaration,
  GtlProgram,
  ModulePublication,
} from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { isSha256Digest, sha256Canonical } from "../shared/digests.js";
import {
  definitionFault,
  exactDefinitionCallMatches,
  hasExactKeys,
  isDefinitionFault,
  isRecord,
  reference,
  sameCoordinate,
  sameJson,
  validatedOwnerOutput,
} from "../shared/definition_binding_mechanics.js";
import {
  admitDefinitionExecutionFault,
  type DefinitionReturn,
  type ExactDefinitionCallable,
  type PreDefinitionExecutionFault,
} from "../shared/effect_definition.js";
import { deepFreeze } from "../shared/immutable.js";
import type { OwnerSemanticOutput } from
  "../shared/public_function_contracts.js";
import type { ReferenceDigest } from "../shared/public_invocation.js";
import {
  isWorkspaceAuthorityBasis,
  productInstallCoordinate,
} from "../product/environment.js";
import {
  ConformancePort,
  type ConformanceEvaluatePacket,
  type GtlProgramConformanceOperationResult,
} from "./conformance_operation.js";
import { CONFORMANCE_OPERATION_CONTRACTS } from
  "./conformance_operation_contracts.js";
import {
  rawAdmitValue,
  type RawAdmittedValue,
  type RawSubjectKind,
} from "./raw_admission.js";

type ConformanceContract =
  typeof CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program;

const GTL_PROGRAM_CONFORMANCE_LAW_REF =
  "law://abiogenesis/validator/gtl-program@5";
const GTL_PROGRAM_CONFORMANCE_LAW = reference(
  GTL_PROGRAM_CONFORMANCE_LAW_REF,
  sha256Canonical({ ref: GTL_PROGRAM_CONFORMANCE_LAW_REF }),
);

export interface ConformanceEvaluationResourceAssertion {
  readonly kind: "conformance_evaluation_resource_assertion";
  readonly schemaVersion: "5.0.0";
  readonly packet: ConformanceEvaluatePacket;
  readonly conformanceLaw: ReferenceDigest<"GtlConformanceLaw">;
  readonly artifactTruth: ExactPrefixArtifactTruthProjection;
  readonly declaredInventory: readonly ModulePublication[];
}

function validConformanceResources(
  value: unknown,
): value is ConformanceEvaluationResourceAssertion {
  return isRecord(value) &&
    hasExactKeys(value, [
      "artifactTruth",
      "conformanceLaw",
      "declaredInventory",
      "kind",
      "packet",
      "schemaVersion",
    ]) &&
    value.kind === "conformance_evaluation_resource_assertion" &&
    value.schemaVersion === "5.0.0" &&
    isRecord(value.packet) &&
    isRecord(value.conformanceLaw) &&
    Array.isArray(value.declaredInventory) &&
    value.declaredInventory.length > 0 &&
    sameJson(value, value);
}

function fault(
  definitionKey: ConformanceContract["definitionKey"],
  code: string,
  message: string,
): PreDefinitionExecutionFault<ConformanceContract["definitionKey"]> {
  return definitionFault(
    definitionKey,
    "resource_admission",
    code,
    message,
  );
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

function lawMismatchRefusal(): OwnerSemanticOutput<ConformanceContract> {
  return validatedOwnerOutput(
    CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program,
    {
      outcomeKind: "refusal",
      value: {
        code: "law_mismatch",
        issuePaths: ["/conformanceLaw"],
        evidenceRefs: [],
      },
    } as OwnerSemanticOutput<ConformanceContract>,
    "Validator conformance",
  );
}

function exactCoordinateSet(
  actual: unknown,
  expected: readonly ReferenceDigest[],
): boolean {
  return Array.isArray(actual) && actual.length === expected.length &&
    actual.every((coordinate, index) =>
      isRecord(coordinate) &&
      sameCoordinate(
        coordinate as unknown as ReferenceDigest,
        expected[index]!,
      )
    );
}

function compareCoordinates(
  left: ReferenceDigest,
  right: ReferenceDigest,
): number {
  return left.ref < right.ref
    ? -1
    : left.ref > right.ref
    ? 1
    : left.digest < right.digest
    ? -1
    : left.digest > right.digest ? 1 : 0;
}

function canonicalCoordinateSet(
  value: unknown,
): readonly ReferenceDigest[] | null {
  if (
    !Array.isArray(value) ||
    value.some((coordinate) =>
      !isRecord(coordinate) ||
      !hasExactKeys(coordinate, ["digest", "ref"]) ||
      typeof coordinate.ref !== "string" ||
      !isSha256Digest(coordinate.digest)
    )
  ) return null;
  return ([...value] as ReferenceDigest[]).sort(compareCoordinates);
}

function exactRawAdmission<S>(
  value: S,
  subjectKind: RawSubjectKind,
  contractRef: string,
): RawAdmittedValue<S> {
  const admitted = rawAdmitValue<S>(value, subjectKind, contractRef);
  if (admitted.kind !== "raw_admitted_value") {
    throw new TypeError(
      "Validator resource differs from its raw admission contract",
    );
  }
  return admitted;
}

function rawAdmissionCoordinate(
  admitted: RawAdmittedValue<unknown>,
): ReferenceDigest<"RawAdmission"> {
  const prefix = "raw-admission://abiogenesis/";
  const suffix = admitted.admissionRef.startsWith(prefix)
    ? admitted.admissionRef.slice(prefix.length)
    : "";
  const digest = `sha256:${suffix}`;
  if (!isSha256Digest(digest)) {
    throw new TypeError(
      "Validator emitted a malformed raw-admission coordinate",
    );
  }
  return reference(admitted.admissionRef, digest);
}

function conformanceAuthorityMatches(
  call: Parameters<
    ExactDefinitionCallable<
      ConformanceContract,
      ConformanceEvaluationResourceAssertion,
      ConformanceEvaluationResourceAssertion
    >
  >[0],
  artifactTruth: ExactPrefixArtifactTruthProjection,
): boolean {
  const slots = call.invocation.invocationAuthority.slots;
  if (
    !isRecord(slots.workspace_binding) ||
    !isRecord(slots.dependency_lock) ||
    !Array.isArray(slots.product_set) ||
    !isRecord(slots.actor) ||
    !isRecord(slots.actor.actor)
  ) return false;
  const bindingRow = artifactTruth.rows.find((row) =>
    row.operationId === "abg.operation.workspace.bind" &&
    row.artifactRef === slots.workspace_binding!.ref &&
    row.artifactDigest === slots.workspace_binding!.digest
  );
  if (
    bindingRow === undefined ||
    !isWorkspaceAuthorityBasis(bindingRow.workspaceAuthorityBasis) ||
    slots.actor.actor.ref !==
      bindingRow.workspaceAuthorityBasis.authorizedActorRef
  ) return false;
  const installs = bindingRow.causationEventRefs.map((eventRef) =>
    projectAdmittedProductInstallByAdmissionEventRef(artifactTruth, eventRef)
  );
  if (installs.length === 0 || installs.some((install) => install === null)) {
    return false;
  }
  const lock = installs[0]!.resolvedLock;
  if (
    installs.some((install) => !sameJson(install!.resolvedLock, lock)) ||
    !sameCoordinate(slots.dependency_lock, {
      ref: lock.lockId,
      digest: lock.lockDigest,
    }) ||
    !exactCoordinateSet(
      slots.product_set,
      installs.map((install) => productInstallCoordinate(install!.install)),
    )
  ) return false;
  const binding = projectAdmittedWorkspaceBindingByInvocationRef(
    artifactTruth,
    bindingRow.invocationRef,
    lock,
  );
  return binding !== null &&
    binding.binding.bindingId === slots.workspace_binding.ref &&
    binding.binding.bindingDigest === slots.workspace_binding.digest;
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
    if (!validConformanceResources(resources)) {
      throw fault(
        call.invocation.definitionKey,
        "invalid_resource_assertion",
        "GTL Program conformance requires one exact typed publication and Program packet",
      );
    }
    const request = call.invocation.request;
    const packet = resources.packet;
    if (!exactDefinitionCallMatches(
      call,
      CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program,
    )) {
      throw fault(
        call.invocation.definitionKey,
        "call_identity_mismatch",
        "conformance call differs from its fixed definition, contracts, request digest, or authority topology",
      );
    }
    const program = reference(
      packet.program.programRef,
      sha256Canonical(packet.program as unknown as JsonValue),
    );
    const publication = reference(
      packet.publication.moduleRef,
      sha256Canonical(packet.publication as unknown as JsonValue),
    );
    const inventory = resources.declaredInventory.map((entry) => {
      const canonical = canonicalizeAuthoredGtlCarrier(
        entry,
        "module_publication",
      );
      if (!sameJson(canonical, entry)) {
        throw fault(
          call.invocation.definitionKey,
          "invalid_resource_assertion",
          "declared inventory contains a noncanonical Module publication",
        );
      }
      return reference(
        entry.moduleRef,
        sha256Canonical(entry as unknown as JsonValue),
      );
    }).sort(compareCoordinates);
    const requestedInventory = request.inventoryBasis.kind ===
        "declared_inventory"
      ? canonicalCoordinateSet(request.inventoryBasis.inventory)
      : null;
    const inventoryMatches = request.inventoryBasis.kind === "program_only" ||
      (inventory.length === new Set(inventory.map(({ ref }) => ref)).size &&
        requestedInventory !== null &&
        exactCoordinateSet(requestedInventory, inventory) &&
        inventory.some((coordinate) => sameCoordinate(coordinate, publication)));
    if (
      packet.kind !== "conformance_evaluate_packet" ||
      packet.schemaVersion !== "5.0.0" ||
      packet.memberKey !== "gtl_program" ||
      !sameCoordinate(request.program, program) ||
      !sameCoordinate(request.conformanceLaw, resources.conformanceLaw) ||
      !inventoryMatches ||
      !conformanceAuthorityMatches(call, resources.artifactTruth)
    ) {
      throw fault(
        call.invocation.definitionKey,
        "resource_relation_mismatch",
        "conformance packet differs from the public Program, law, or inventory coordinates",
      );
    }
    if (!sameCoordinate(request.conformanceLaw, GTL_PROGRAM_CONFORMANCE_LAW)) {
      return deepFreeze({
        ownerOutput: lawMismatchRefusal(),
        resources,
      });
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
    const publicationAdmission = exactRawAdmission<ModulePublication>(
      packet.publication,
      "module_publication",
      "contract://abiogenesis/gtl/module-publication@5",
    );
    const programAdmission = exactRawAdmission<GtlProgram>(
      packet.program,
      "gtl_program",
      "contract://abiogenesis/gtl/program@5",
    );
    const authorityAdmissions = [
      ...packet.publication.contracts.map((value) =>
        exactRawAdmission<ContractDeclaration>(
          value,
          "contract_declaration",
          "contract://abiogenesis/gtl/contract-declaration@5",
        )
      ),
      ...packet.publication.closureContracts.map((value) =>
        exactRawAdmission<ClosureContract>(
          value,
          "closure_contract",
          "contract://abiogenesis/gtl/closure-contract@5",
        )
      ),
    ];
    const violatedAuthorities = native.disposition === "failed"
      ? native.violatedContractRefs.map((ref) => {
        const matches = authorityAdmissions.filter((admitted) =>
          (admitted.subjectKind === "contract_declaration" &&
            (admitted.value as ContractDeclaration).contractRef === ref) ||
          (admitted.subjectKind === "closure_contract" &&
            (admitted.value as ClosureContract).closureContractRef === ref)
        );
        if (matches.length !== 1) {
          throw new TypeError(
            "Validator emitted an unbound violated authority reference",
          );
        }
        return reference(ref, matches[0]!.subjectDigest);
      })
      : [];
    const rawEvidence = [
      rawAdmissionCoordinate(programAdmission),
      rawAdmissionCoordinate(publicationAdmission),
    ];
    const failedEvidence = native.disposition === "failed"
      ? native.evidenceRefs.map((ref) => {
        const matches = rawEvidence.filter((coordinate) =>
          coordinate.ref === ref
        );
        if (matches.length !== 1) {
          throw new TypeError(
            "Validator emitted an unbound raw-admission evidence reference",
          );
        }
        return matches[0]!;
      })
      : [];
    const inventoryCoordinate = request.inventoryBasis.kind ===
        "declared_inventory"
      ? (() => {
        const digest = sha256Canonical(inventory as unknown as JsonValue);
        return reference(
          `gtl-inventory://abiogenesis/${digest.slice("sha256:".length)}`,
          digest,
        );
      })()
      : null;
    const ownerOutput = validatedOwnerOutput(
      CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program,
      {
        outcomeKind: "result",
        value: {
          program,
          inventory: inventoryCoordinate,
          assessment,
          disposition: native.disposition,
          diagnostics: native.diagnostics,
          violatedAuthorities,
          evidence: native.disposition === "passed"
            ? [assessment]
            : [assessment, ...failedEvidence],
          repairAffordances: [],
        },
      } as OwnerSemanticOutput<ConformanceContract>,
      "Validator conformance",
    );
    return deepFreeze({ ownerOutput, resources });
  },
  catch: (cause) => {
    const admittedFault = admitDefinitionExecutionFault(
      cause,
      call.invocation.definitionKey,
      (candidate) =>
        validConformanceResources(candidate) &&
          sameJson(candidate, call.resources)
          ? { resourceReceipt: candidate }
          : null,
    );
    if (admittedFault !== null) return admittedFault;
    if (isDefinitionFault(cause)) {
      throw new TypeError(
        "Validator conformance owner emitted a malformed execution fault",
      );
    }
    return fault(
      call.invocation.definitionKey,
      "owner_execution_failure",
      String(cause),
    );
  },
});

export const CONFORMANCE_DEFINITION_BINDINGS = Object.freeze({
  evaluate: Object.freeze({ gtl_program }),
});
