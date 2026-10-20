import { isRecord } from "../shared/admission_predicates.js";
import { constructCatalogProgramValidationInput, constructProgramValidationInputFromResolvedClosure } from "../product/catalog_operations.js";
import type { ReadyGraphFunctionCatalog, GraphFunctionCatalogView } from "../product/catalog.js";
import type { ResolvedProgramDeclarationClosure } from "../product/declaration_closure.js";
import type {
  ClosureContract,
  ContractDeclaration,
  GraphFunction,
  GtlProgram,
  ImplementationBinding,
  ModulePublication,
} from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { admitIJsonValue } from "../shared/i_json.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  rawAdmitValue,
  type RawAdmissionRefusal,
  type RawAdmittedValue,
} from "./raw_admission.js";
import {
  validateProgram,
  type ProgramValidation,
  type ProgramValidationInput,
  type StaticValidationRefusal,
} from "./validation.js";

export interface ConformanceDeclarationBasis {
  readonly catalog: ReadyGraphFunctionCatalog;
  readonly catalogView: GraphFunctionCatalogView;
  readonly declarationClosure: ResolvedProgramDeclarationClosure;
}

export interface ConformanceEvaluatePacket {
  readonly kind: "conformance_evaluate_packet";
  readonly schemaVersion: "5.0.0";
  readonly memberKey: "gtl_program";
  readonly publication: ModulePublication;
  readonly program: GtlProgram;
}

export interface GtlProgramConformanceResult {
  readonly kind: "gtl_program_conformance_result";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "passed";
  readonly programRef: string;
  readonly programDigest: Sha256Digest;
  readonly evidenceRef: string;
  readonly evidenceDigest: Sha256Digest;
  readonly validation: ProgramValidation;
  readonly diagnostics: readonly [];
  readonly violatedContractRefs: readonly [];
  readonly repairAffordances: readonly [];
}

export interface GtlProgramConformanceRefusal {
  readonly kind: "gtl_program_conformance_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "failed";
  readonly programRef: string | null;
  readonly programDigest: Sha256Digest | null;
  readonly code: "invalid_packet" | "raw_admission_refused" | "validation_failed";
  readonly diagnosticRef: string;
  readonly diagnostics: readonly Readonly<{
    readonly code: string;
    readonly path: string;
    readonly message: string;
  }>[];
  readonly violatedContractRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly repairAffordances: readonly [];
}

export type GtlProgramConformanceOperationResult =
  | GtlProgramConformanceResult
  | GtlProgramConformanceRefusal;

function hasExactDataFields(value: object, fields: readonly string[]): boolean {
  const keys = Reflect.ownKeys(value);
  if (keys.some((key) => typeof key !== "string")) return false;
  const actual = (keys as string[]).sort();
  const expected = [...fields].sort();
  if (
    actual.length !== expected.length ||
    actual.some((field, index) => field !== expected[index])
  ) return false;
  return actual.every((field) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, field);
    return descriptor !== undefined &&
      Object.hasOwn(descriptor, "value") &&
      !Object.hasOwn(descriptor, "get") &&
      !Object.hasOwn(descriptor, "set") &&
      descriptor.enumerable === true;
  });
}

function refusal(
  code: GtlProgramConformanceRefusal["code"],
  programRef: string | null,
  programDigest: Sha256Digest | null,
  diagnostics: GtlProgramConformanceRefusal["diagnostics"],
  violatedContractRefs: readonly string[] = [],
  evidenceRefs: readonly string[] = [],
): GtlProgramConformanceRefusal {
  return deepFreeze({
    kind: "gtl_program_conformance_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "failed" as const,
    programRef,
    programDigest,
    code,
    diagnosticRef: `diagnostic://abiogenesis/conformance/${code}@5`,
    diagnostics,
    violatedContractRefs: Object.freeze([...violatedContractRefs]),
    evidenceRefs: Object.freeze([...evidenceRefs]),
    repairAffordances: Object.freeze([]),
  });
}

function rawInput(
  publication: ModulePublication,
  program: GtlProgram,
): ProgramValidationInput | RawAdmissionRefusal {
  const publicationAdmission = rawAdmitValue<ModulePublication>(
    publication,
    "module_publication",
    "contract://abiogenesis/gtl/module-publication@5",
  );
  if (publicationAdmission.kind !== "raw_admitted_value") {
    return publicationAdmission;
  }
  const programAdmission = rawAdmitValue<GtlProgram>(
    program,
    "gtl_program",
    "contract://abiogenesis/gtl/program@5",
  );
  if (programAdmission.kind !== "raw_admitted_value") return programAdmission;

  const graphFunctions = publication.graphFunctions
    .filter((value) => program.callableMembership.includes(value.name))
    .map((value) => rawAdmitValue<GraphFunction>(
      value,
      "graph_function",
      "contract://abiogenesis/gtl/graph-function@5",
    ));
  const contracts = publication.contracts.map((value) =>
    rawAdmitValue<ContractDeclaration>(
      value,
      "contract_declaration",
      "contract://abiogenesis/gtl/contract-declaration@5",
    ));
  const implementationBindings = publication.implementationBindings.map(
    (value) => rawAdmitValue<ImplementationBinding>(
      value,
      "implementation_binding",
      "contract://abiogenesis/gtl/implementation-binding@5",
    ),
  );
  const closureContracts = publication.closureContracts.map((value) =>
    rawAdmitValue<ClosureContract>(
      value,
      "closure_contract",
      "contract://abiogenesis/gtl/closure-contract@5",
    ));
  const rawRefusal = [
    ...graphFunctions,
    ...contracts,
    ...implementationBindings,
    ...closureContracts,
  ].find((value): value is RawAdmissionRefusal =>
    value.kind === "raw_admission_refusal");
  if (rawRefusal !== undefined) return rawRefusal;
  return {
    declarationBasisDigest: publicationAdmission.subjectDigest,
    programPublication: publicationAdmission,
    program: programAdmission,
    graphFunctions: graphFunctions as readonly RawAdmittedValue<GraphFunction>[],
    contracts: contracts as readonly RawAdmittedValue<ContractDeclaration>[],
    evaluators: publication.evaluators,
    rules: publication.rules,
    implementationBindings:
      implementationBindings as readonly RawAdmittedValue<ImplementationBinding>[],
    closureContracts:
      closureContracts as readonly RawAdmittedValue<ClosureContract>[],
  };
}

function isRawAdmissionRefusal(
  value: ProgramValidationInput | RawAdmissionRefusal,
): value is RawAdmissionRefusal {
  return "kind" in value && value.kind === "raw_admission_refusal";
}

export function evaluateGtlProgramConformance(
  supplied: ConformanceEvaluatePacket,
  declarationBasis?: ConformanceDeclarationBasis,
): GtlProgramConformanceOperationResult {
  return evaluateWithValidationInput(supplied, declarationBasis,
    (packet) => declarationBasis === undefined
      ? rawInput(packet.publication, packet.program)
      : constructCatalogProgramValidationInput(declarationBasis.catalog, declarationBasis.catalogView,
        declarationBasis.declarationClosure, packet.program));
}

/** Internal continuation after this conformance owner resolves the exact
 * declaration closure. This is not exposed on the raw ConformancePort. */
export function evaluateGtlProgramConformanceFromResolvedClosure(
  supplied: ConformanceEvaluatePacket,
  declarationClosure: ResolvedProgramDeclarationClosure,
): GtlProgramConformanceOperationResult {
  return evaluateWithValidationInput(supplied, { declarationClosure },
    (packet) => constructProgramValidationInputFromResolvedClosure(declarationClosure, packet.program));
}

function evaluateWithValidationInput(
  supplied: ConformanceEvaluatePacket,
  declarationBasis: Pick<ConformanceDeclarationBasis, "declarationClosure"> | undefined,
  inputForPacket: (packet: ConformanceEvaluatePacket) => ProgramValidationInput | RawAdmissionRefusal,
): GtlProgramConformanceOperationResult {
  let admitted: JsonValue;
  try {
    admitted = admitIJsonValue(supplied, "GTL Program conformance packet");
  } catch {
    return refusal("invalid_packet", null, null, [{
      code: "invalid_packet",
      path: "$",
      message: "GTL Program conformance requires one exact I-JSON packet",
    }]);
  }
  if (
    !isRecord(admitted) ||
    !hasExactDataFields(admitted, [
      "kind",
      "memberKey",
      "program",
      "publication",
      "schemaVersion",
    ]) ||
    admitted.kind !== "conformance_evaluate_packet" ||
    admitted.schemaVersion !== "5.0.0" ||
    admitted.memberKey !== "gtl_program" ||
    !isRecord(admitted.program) ||
    !isRecord(admitted.publication)
  ) {
    return refusal("invalid_packet", null, null, [{
      code: "invalid_packet",
      path: "$",
      message: "GTL Program conformance packet differs from its exact owner contract",
    }]);
  }
  const packet = admitted as unknown as ConformanceEvaluatePacket;
  const programRef = typeof packet.program.programRef === "string"
    ? packet.program.programRef
    : null;
  const programDigest = sha256Canonical(packet.program as unknown as JsonValue);
  if (declarationBasis !== undefined &&
      sha256Canonical(declarationBasis.declarationClosure.programPublication as unknown as JsonValue) !==
        sha256Canonical(packet.publication as unknown as JsonValue)) {
    return refusal("invalid_packet", programRef, programDigest, [{
      code: "invalid_packet", path: "$.publication", message: "conformance closure differs from the original Program publication",
    }]);
  }
  const input = inputForPacket(packet);
  if (isRawAdmissionRefusal(input)) {
    return refusal(
      "raw_admission_refused",
      programRef,
      programDigest,
      [{ code: input.code, path: "$", message: input.message }],
    );
  }
  const validation = validateProgram(input);
  if (validation.kind !== "program_validation") {
    const failed = validation as StaticValidationRefusal;
    return refusal(
      "validation_failed",
      programRef,
      programDigest,
      failed.diagnostics,
      [...new Set([
        ...input.contracts.map((row) => row.value.contractRef),
        ...input.closureContracts.map((row) => row.value.closureContractRef),
      ])].sort(),
      [input.program.admissionRef, input.programPublication.admissionRef],
    );
  }
  const evidenceBody = {
    programRef: validation.programRef,
    programDigest: validation.programDigest,
    validationRef: validation.validationRef,
    sourceDigest: validation.sourceDigest,
    publicationDigest: validation.publicationDigest,
  };
  const evidenceDigest = sha256Canonical(evidenceBody);
  return deepFreeze({
    kind: "gtl_program_conformance_result" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "passed" as const,
    programRef: validation.programRef,
    programDigest: validation.programDigest,
    evidenceRef:
      `evidence://abiogenesis/conformance/${evidenceDigest.slice("sha256:".length)}`,
    evidenceDigest,
    validation,
    diagnostics: Object.freeze([]),
    violatedContractRefs: Object.freeze([]),
    repairAffordances: Object.freeze([]),
  });
}

export const ConformancePort = Object.freeze({
  evaluateGtlProgram: evaluateGtlProgramConformance,
});

export const CONFORMANCE_CONTRACTS = Object.freeze({
  gtl_program: ConformancePort.evaluateGtlProgram,
});
