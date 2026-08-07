import type { JsonValue } from "../shared/canonical_json.js";
import { canonicalJson } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type {
  CatalogContribution,
  ClosureContract,
  ContractDeclaration,
  GraphFunction,
  GtlProgram,
  ImplementationBinding,
  ModulePublication,
} from "../gtl/contracts.js";
import { admitModule } from "../gtl/admission.js";
import { admitIJsonText, admitIJsonValue } from "../gtl/canonical_ingest.js";
import {
  rawAdmitValue,
  type RawAdmittedValue,
} from "./raw_admission.js";
import {
  validateProgram,
  validatePublication,
  type StaticDiagnostic,
  type StaticDiagnosticCode,
} from "./validation.js";

// Stable 5.0 subset retained from the published GTL diagnostic namespace.
// This roster describes the direct Program/GraphFunction/Module/C gate only;
// it deliberately contains no compiler, registry, or feature-inventory law.
export const GTL_PROGRAM_DIAGNOSTIC_ID_VALUES = Object.freeze([
  "abg://gtl-program/input/object",
  "abg://gtl-program/input/module",
  "abg://gtl-program/input/graph-function",
  "abg://gtl-program/input/string-field",
  "abg://gtl-program/declaration/duplicate-key",
  "abg://gtl-program/execution-declaration/invalid",
  "abg://gtl-program/graph-function/inputs-equal-environment-requires",
  "abg://gtl-program/graph-function/materializable-template",
  "abg://gtl-program/graph-function/outputs-provided",
  "abg://gtl-program/graph-function/unique-publication",
  "abg://gtl-program/graph-function-application/invalid-program",
  "abg://gtl-program/graph/input-node-declared",
  "abg://gtl-program/graph/node-reachable-or-bound",
  "abg://gtl-program/graph/output-derivable",
  "abg://gtl-program/c-algebra/invalid-program",
  "abg://gtl-program/c-algebra/unresolved-graph-function",
  "abg://gtl-program/module/no-untracked-graph-function",
] as const);

export type GtlProgramDiagnosticId =
  (typeof GTL_PROGRAM_DIAGNOSTIC_ID_VALUES)[number];

const GTL_PROGRAM_DIAGNOSTIC_IDS: ReadonlySet<string> = new Set(
  GTL_PROGRAM_DIAGNOSTIC_ID_VALUES,
);

export function isGtlProgramDiagnosticId(
  value: unknown,
): value is GtlProgramDiagnosticId {
  return typeof value === "string" && GTL_PROGRAM_DIAGNOSTIC_IDS.has(value);
}

export function assertGtlProgramDiagnosticId(
  value: unknown,
): asserts value is GtlProgramDiagnosticId {
  if (!isGtlProgramDiagnosticId(value)) {
    throw new TypeError("unknown GTL Program diagnostic identity");
  }
}

export const GTL_PROGRAM_REPAIR_EDIT_CLASS_VALUES = Object.freeze([
  "add_missing_declaration",
  "correct_reference",
  "correct_field_shape",
  "remove_duplicate_declaration",
  "align_digest_or_version",
  "realize_declared_semantics",
  "constitutional_reprice",
] as const);

export type GtlProgramRepairEditClass =
  (typeof GTL_PROGRAM_REPAIR_EDIT_CLASS_VALUES)[number];

export interface GtlProgramAdmissibleRepair {
  readonly kind: "gtl_program_admissible_repair";
  readonly editClass: GtlProgramRepairEditClass;
  readonly repairSurfaceRef: string;
  readonly changeClassRef: string | null;
}

export const GTL_PROGRAM_DEFAULT_ADMISSIBLE_REPAIRS: Readonly<
  Partial<Record<GtlProgramDiagnosticId, GtlProgramRepairEditClass>>
> = Object.freeze({
  "abg://gtl-program/input/object": "correct_field_shape",
  "abg://gtl-program/input/module": "correct_field_shape",
  "abg://gtl-program/input/graph-function": "correct_field_shape",
  "abg://gtl-program/input/string-field": "correct_field_shape",
  "abg://gtl-program/declaration/duplicate-key":
    "remove_duplicate_declaration",
  "abg://gtl-program/execution-declaration/invalid":
    "add_missing_declaration",
  "abg://gtl-program/graph-function/inputs-equal-environment-requires":
    "correct_reference",
  "abg://gtl-program/graph-function/materializable-template":
    "realize_declared_semantics",
  "abg://gtl-program/graph-function/outputs-provided": "correct_reference",
  "abg://gtl-program/graph-function/unique-publication":
    "remove_duplicate_declaration",
  "abg://gtl-program/graph-function-application/invalid-program":
    "correct_field_shape",
  "abg://gtl-program/graph/input-node-declared": "correct_reference",
  "abg://gtl-program/graph/node-reachable-or-bound":
    "realize_declared_semantics",
  "abg://gtl-program/graph/output-derivable": "correct_reference",
  "abg://gtl-program/c-algebra/invalid-program": "correct_field_shape",
  "abg://gtl-program/c-algebra/unresolved-graph-function":
    "correct_reference",
  "abg://gtl-program/module/no-untracked-graph-function":
    "add_missing_declaration",
});

export interface GtlProgramConformanceIssue {
  readonly kind: "gtl_program_conformance_issue";
  readonly severity: "error";
  readonly diagnosticId: GtlProgramDiagnosticId;
  readonly surfaceRef: string;
  readonly path: string;
  readonly axiomRef: string;
  readonly requirementRef: string;
  readonly evidenceRefs: readonly string[];
  readonly message: string;
  readonly admissibleRepairs: readonly GtlProgramAdmissibleRepair[];
}

export interface GtlProgramConformanceInput {
  readonly kind: "gtl_program_conformance_input";
  readonly schemaVersion: "5.0.0";
  readonly subjectRef: string;
  readonly programRef: string;
  readonly module: Readonly<ModulePublication>;
}

export type GtlProgramConformanceInputAdmission =
  | Readonly<{
    readonly kind: "gtl_program_conformance_input_admission";
    readonly schemaVersion: "5.0.0";
    readonly accepted: true;
    readonly admissionRef: string;
    readonly inputDigest: Sha256Digest;
    readonly input: Readonly<GtlProgramConformanceInput>;
    readonly issues: readonly [];
  }>
  | Readonly<{
    readonly kind: "gtl_program_conformance_input_admission";
    readonly schemaVersion: "5.0.0";
    readonly accepted: false;
    readonly admissionRef: null;
    readonly inputDigest: null;
    readonly input: null;
    readonly issues: readonly GtlProgramConformanceIssue[];
  }>;

export interface GtlProgramConformanceReport {
  readonly kind: "gtl_program_conformance_report";
  readonly schemaVersion: "5.0.0";
  readonly reportRef: string;
  readonly subjectRef: string;
  readonly programRef: string | null;
  readonly inputDigest: Sha256Digest | null;
  readonly programDigest: Sha256Digest | null;
  readonly programValidationRef: string | null;
  readonly passed: boolean;
  readonly issueCount: number;
  readonly issues: readonly GtlProgramConformanceIssue[];
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

const GTL_PROGRAM_CONFORMANCE_AXIOM_REF =
  "build_tenants/abiogenesis/typescript/design/M01_M03_TYPED_C_ALGEBRA_BEHAVIOR_DESIGN.md#axiom-evaluation";

const GTL_PROGRAM_DIAGNOSTIC_REQUIREMENT_REFS: Readonly<
  Record<GtlProgramDiagnosticId, string>
> = Object.freeze({
  "abg://gtl-program/input/object":
    "specification/requirements/gtl/REQ-L-GTL3-C-ALGEBRA.md#REQ-L-GTL3-C-ALGEBRA-013",
  "abg://gtl-program/input/module":
    "specification/requirements/gtl/REQ-L-GTL3-MODULE.md#REQ-L-GTL3-MODULE-001",
  "abg://gtl-program/input/graph-function":
    "specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md#REQ-L-GTL3-GRAPHFUNCTION-001",
  "abg://gtl-program/input/string-field":
    "specification/requirements/gtl/REQ-L-GTL3-C-ALGEBRA.md#REQ-L-GTL3-C-ALGEBRA-013",
  "abg://gtl-program/declaration/duplicate-key":
    "specification/requirements/gtl/REQ-L-GTL3-C-ALGEBRA.md#REQ-L-GTL3-C-ALGEBRA-011",
  "abg://gtl-program/execution-declaration/invalid":
    "specification/requirements/gtl/REQ-L-GTL3-C-ALGEBRA.md#REQ-L-GTL3-C-ALGEBRA-010",
  "abg://gtl-program/graph-function/inputs-equal-environment-requires":
    "specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md#REQ-L-GTL3-GRAPHFUNCTION-017",
  "abg://gtl-program/graph-function/materializable-template":
    "specification/requirements/gtl/REQ-L-GTL3-INTERFACE.md#REQ-L-GTL3-INTERFACE-006",
  "abg://gtl-program/graph-function/outputs-provided":
    "specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md#REQ-L-GTL3-GRAPHFUNCTION-018",
  "abg://gtl-program/graph-function/unique-publication":
    "specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md#REQ-L-GTL3-GRAPHFUNCTION-010",
  "abg://gtl-program/graph-function-application/invalid-program":
    "specification/requirements/gtl/REQ-L-GTL3-C-ALGEBRA.md#REQ-L-GTL3-C-ALGEBRA-011",
  "abg://gtl-program/graph/input-node-declared":
    "specification/requirements/gtl/REQ-L-GTL3-GRAPH.md#REQ-L-GTL3-GRAPH-001",
  "abg://gtl-program/graph/node-reachable-or-bound":
    "specification/requirements/gtl/REQ-L-GTL3-GRAPH.md#REQ-L-GTL3-GRAPH-002",
  "abg://gtl-program/graph/output-derivable":
    "specification/requirements/gtl/REQ-L-GTL3-C-ALGEBRA.md#REQ-L-GTL3-C-ALGEBRA-009",
  "abg://gtl-program/c-algebra/invalid-program":
    "specification/requirements/gtl/REQ-L-GTL3-C-ALGEBRA.md#REQ-L-GTL3-C-ALGEBRA-014",
  "abg://gtl-program/c-algebra/unresolved-graph-function":
    "specification/requirements/gtl/REQ-L-GTL3-C-ALGEBRA.md#REQ-L-GTL3-C-ALGEBRA-014",
  "abg://gtl-program/module/no-untracked-graph-function":
    "specification/requirements/gtl/REQ-L-GTL3-MODULE.md#REQ-L-GTL3-MODULE-003",
});

function issue(
  diagnosticId: GtlProgramDiagnosticId,
  surfaceRef: string,
  path: string,
  message: string,
): GtlProgramConformanceIssue {
  assertGtlProgramDiagnosticId(diagnosticId);
  const defaultRepair = GTL_PROGRAM_DEFAULT_ADMISSIBLE_REPAIRS[diagnosticId];
  return {
    kind: "gtl_program_conformance_issue",
    severity: "error",
    diagnosticId,
    surfaceRef,
    path,
    axiomRef: GTL_PROGRAM_CONFORMANCE_AXIOM_REF,
    requirementRef: GTL_PROGRAM_DIAGNOSTIC_REQUIREMENT_REFS[diagnosticId],
    evidenceRefs: [surfaceRef],
    message,
    admissibleRepairs: defaultRepair === undefined
      ? []
      : [{
        kind: "gtl_program_admissible_repair",
        editClass: defaultRepair,
        repairSurfaceRef: path,
        changeClassRef: null,
      }],
  };
}

const STATIC_DIAGNOSTIC_IDS: Readonly<
  Record<StaticDiagnosticCode, GtlProgramDiagnosticId>
> = Object.freeze({
  duplicate_identity: "abg://gtl-program/declaration/duplicate-key",
  carrier_mismatch: "abg://gtl-program/graph-function/outputs-provided",
  environment_input_mismatch:
    "abg://gtl-program/graph-function/inputs-equal-environment-requires",
  environment_output_mismatch:
    "abg://gtl-program/graph-function/outputs-provided",
  identity_mismatch: "abg://gtl-program/graph-function/unique-publication",
  invalid_application:
    "abg://gtl-program/graph-function-application/invalid-program",
  invalid_constructor: "abg://gtl-program/c-algebra/invalid-program",
  invalid_contribution:
    "abg://gtl-program/module/no-untracked-graph-function",
  invalid_fibre: "abg://gtl-program/c-algebra/invalid-program",
  invalid_leaf_requirement: "abg://gtl-program/c-algebra/invalid-program",
  invalid_reference:
    "abg://gtl-program/c-algebra/unresolved-graph-function",
  invalid_result_cardinality: "abg://gtl-program/graph/output-derivable",
  missing_binding: "abg://gtl-program/execution-declaration/invalid",
  missing_contract:
    "abg://gtl-program/graph-function/inputs-equal-environment-requires",
  missing_membership:
    "abg://gtl-program/module/no-untracked-graph-function",
  raw_subject_mismatch: "abg://gtl-program/input/object",
  topology_mismatch: "abg://gtl-program/graph/node-reachable-or-bound",
  outer_interface_mismatch:
    "abg://gtl-program/graph-function/materializable-template",
  workflow_interface_mismatch: "abg://gtl-program/c-algebra/invalid-program",
});

function exactTopLevelRecord(value: unknown): Readonly<Record<string, unknown>> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError("GTL conformance input must be an object");
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError("GTL conformance input must be a plain object");
  }
  const descriptors = Object.getOwnPropertyDescriptors(value);
  const expected = ["kind", "module", "programRef", "schemaVersion", "subjectRef"];
  const keys: string[] = [];
  for (const key of Reflect.ownKeys(descriptors)) {
    if (typeof key !== "string") {
      throw new TypeError("GTL conformance input cannot contain symbol properties");
    }
    const descriptor = descriptors[key]!;
    if (!("value" in descriptor) || descriptor.enumerable !== true) {
      throw new TypeError(`GTL conformance input.${key} must be an enumerable data property`);
    }
    keys.push(key);
  }
  keys.sort(compareText);
  if (keys.join("\0") !== expected.join("\0")) {
    throw new TypeError("GTL conformance input has missing or undeclared fields");
  }
  return value as Readonly<Record<string, unknown>>;
}

function nonemptyString(value: unknown, label: string): string {
  const admitted = admitIJsonValue(value);
  if (typeof admitted !== "string" || admitted.trim().length === 0) {
    throw new TypeError(`${label} must be a non-empty Unicode scalar string`);
  }
  return admitted;
}

function sortedIssues(
  values: readonly GtlProgramConformanceIssue[],
): readonly GtlProgramConformanceIssue[] {
  return [...values].sort((left, right) =>
    compareText(
      canonicalJson(left as unknown as JsonValue),
      canonicalJson(right as unknown as JsonValue),
    )
  );
}

export function admitGtlProgramConformanceInput(
  inputCandidate: unknown,
): GtlProgramConformanceInputAdmission {
  try {
    const parsed = typeof inputCandidate === "string"
      ? admitIJsonText(inputCandidate)
      : admitIJsonValue(inputCandidate);
    const row = exactTopLevelRecord(parsed);
    if (
      row.kind !== "gtl_program_conformance_input" ||
      row.schemaVersion !== "5.0.0"
    ) {
      throw new TypeError("GTL conformance input kind or schemaVersion is invalid");
    }
    const input: GtlProgramConformanceInput = {
      kind: "gtl_program_conformance_input",
      schemaVersion: "5.0.0",
      subjectRef: nonemptyString(row.subjectRef, "subjectRef"),
      programRef: nonemptyString(row.programRef, "programRef"),
      module: admitModule(row.module),
    };
    const inputDigest = sha256Canonical(input as unknown as JsonValue);
    return deepFreeze({
      kind: "gtl_program_conformance_input_admission",
      schemaVersion: "5.0.0",
      accepted: true,
      admissionRef:
        `gtl-program-conformance-admission://abiogenesis/${inputDigest.slice("sha256:".length)}`,
      inputDigest,
      input,
      issues: [],
    });
  } catch (error) {
    return deepFreeze({
      kind: "gtl_program_conformance_input_admission",
      schemaVersion: "5.0.0",
      accepted: false,
      admissionRef: null,
      inputDigest: null,
      input: null,
      issues: [issue(
        "abg://gtl-program/input/object",
        "gtl-program-conformance-input://invalid",
        "$",
        error instanceof Error ? error.message : String(error),
      )],
    });
  }
}

function mapStaticDiagnostics(
  diagnostics: readonly StaticDiagnostic[],
  surfaceRef: string,
): readonly GtlProgramConformanceIssue[] {
  return diagnostics.map((diagnostic) => issue(
    STATIC_DIAGNOSTIC_IDS[diagnostic.code],
    surfaceRef,
    diagnostic.path,
    diagnostic.message,
  ));
}

function admitRaw<S>(
  value: unknown,
  kind: Parameters<typeof rawAdmitValue>[1],
): RawAdmittedValue<S> | null {
  const admission = rawAdmitValue<S>(
    value,
    kind,
    `contract://abiogenesis/gtl/${kind}@5`,
  );
  return admission.kind === "raw_admitted_value" ? admission : null;
}

function invalidReport(
  subjectRef: string,
  programRef: string | null,
  inputDigest: Sha256Digest | null,
  issues: readonly GtlProgramConformanceIssue[],
): GtlProgramConformanceReport {
  const orderedIssues = sortedIssues(issues);
  const body = {
    subjectRef,
    programRef,
    inputDigest,
    issues: orderedIssues,
  };
  const digest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "gtl_program_conformance_report",
    schemaVersion: "5.0.0",
    reportRef:
      `gtl-program-conformance-report://abiogenesis/${digest.slice("sha256:".length)}`,
    subjectRef,
    programRef,
    inputDigest,
    programDigest: null,
    programValidationRef: null,
    passed: false,
    issueCount: orderedIssues.length,
    issues: orderedIssues,
  });
}

export function typecheckGtlProgram(
  inputCandidate: unknown,
): GtlProgramConformanceReport {
  const admission = admitGtlProgramConformanceInput(inputCandidate);
  if (!admission.accepted) {
    return invalidReport(
      "gtl-program-conformance-input://invalid",
      null,
      null,
      admission.issues,
    );
  }

  const { input, inputDigest } = admission;
  const module = input.module;
  const rawPublication = admitRaw<ModulePublication>(
    module,
    "module_publication",
  );
  const rawContributions = module.contributions.map((contribution) =>
    admitRaw<CatalogContribution>(contribution, "catalog_contribution")
  );
  if (
    rawPublication === null ||
    rawContributions.some((value) => value === null)
  ) {
    return invalidReport(input.subjectRef, input.programRef, inputDigest, [issue(
      "abg://gtl-program/input/module",
      module.moduleRef,
      "$.module",
      "the admitted Module or one of its contribution carriers cannot be admitted",
    )]);
  }
  const publicationValidation = validatePublication(
    rawPublication,
    rawContributions as readonly RawAdmittedValue<CatalogContribution>[],
  );
  if (publicationValidation.kind !== "publication_validation") {
    return invalidReport(
      input.subjectRef,
      input.programRef,
      inputDigest,
      mapStaticDiagnostics(publicationValidation.diagnostics, module.moduleRef),
    );
  }

  const programs = module.programs.filter(
    (program) => program.programRef === input.programRef,
  );
  if (programs.length !== 1) {
    const diagnosticId = programs.length === 0
      ? "abg://gtl-program/module/no-untracked-graph-function" as const
      : "abg://gtl-program/declaration/duplicate-key" as const;
    return invalidReport(input.subjectRef, input.programRef, inputDigest, [issue(
      diagnosticId,
      input.programRef,
      "$.programRef",
      programs.length === 0
        ? "programRef does not resolve in the admitted Module"
        : "programRef resolves to more than one Program declaration",
    )]);
  }
  const program = programs[0]!;

  const rawProgram = admitRaw<GtlProgram>(program, "gtl_program");
  const rawGraphFunctions = module.graphFunctions
    .filter((graphFunction) => program.callableMembership.includes(graphFunction.id))
    .map((graphFunction) => admitRaw<GraphFunction>(graphFunction, "graph_function"));
  const rawContracts = module.contracts.map((contract) =>
    admitRaw<ContractDeclaration>(contract, "contract_declaration")
  );
  const rawBindings = module.implementationBindings.map((binding) =>
    admitRaw<ImplementationBinding>(binding, "implementation_binding")
  );
  const rawClosures = module.closureContracts.map((contract) =>
    admitRaw<ClosureContract>(contract, "closure_contract")
  );
  if (
    rawProgram === null ||
    rawGraphFunctions.some((value) => value === null) ||
    rawContracts.some((value) => value === null) ||
    rawBindings.some((value) => value === null) ||
    rawClosures.some((value) => value === null)
  ) {
    return invalidReport(input.subjectRef, input.programRef, inputDigest, [issue(
      "abg://gtl-program/input/module",
      module.moduleRef,
      "$.module",
      "the admitted Module contains a child carrier that cannot be admitted",
    )]);
  }

  const programValidation = validateProgram({
    publication: rawPublication,
    program: rawProgram,
    graphFunctions:
      rawGraphFunctions as readonly RawAdmittedValue<GraphFunction>[],
    contracts: rawContracts as readonly RawAdmittedValue<ContractDeclaration>[],
    implementationBindings:
      rawBindings as readonly RawAdmittedValue<ImplementationBinding>[],
    closureContracts:
      rawClosures as readonly RawAdmittedValue<ClosureContract>[],
  });
  const issues = sortedIssues([
    ...mapStaticDiagnostics(publicationValidation.diagnostics, module.moduleRef),
    ...mapStaticDiagnostics(programValidation.diagnostics, program.programRef),
  ]);
  if (issues.length !== 0 || programValidation.kind !== "program_validation") {
    return invalidReport(input.subjectRef, input.programRef, inputDigest, issues);
  }

  const body = {
    subjectRef: input.subjectRef,
    programRef: input.programRef,
    inputDigest,
    programDigest: programValidation.programDigest,
    programValidationRef: programValidation.validationRef,
    issues,
  };
  const reportDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "gtl_program_conformance_report",
    schemaVersion: "5.0.0",
    reportRef:
      `gtl-program-conformance-report://abiogenesis/${reportDigest.slice("sha256:".length)}`,
    subjectRef: input.subjectRef,
    programRef: input.programRef,
    inputDigest,
    programDigest: programValidation.programDigest,
    programValidationRef: programValidation.validationRef,
    passed: true,
    issueCount: 0,
    issues: [],
  });
}
