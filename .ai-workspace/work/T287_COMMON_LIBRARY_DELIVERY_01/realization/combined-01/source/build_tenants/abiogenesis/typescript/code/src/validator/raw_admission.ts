import { isRecord } from "../shared/admission_predicates.js";
import * as v from "valibot";
import { graphTemplateDiagnostics } from "../gtl/graph_construction.js";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { C_TERM_KIND_VALUES, assertCProgramLocalRelations } from "../gtl/c_algebra.js";
import { canonicalizeAuthoredGtlCarrier } from "../gtl/canonicalization.js";
import { admitIJsonValue } from "../shared/i_json.js";
import * as structure from "../gtl/serialization_contracts.js";
import { isSemanticLifecycleDeclaration } from "../gtl/semantic_stage.js";
import { isSemanticJobLifecycleDeclaration } from "../gtl/semantic_job.js";
import { isRunEnvironmentDeclaration, isStdoRunEnvironmentDeclaration } from "../gtl/stdo_run_environment.js";
import { isRequirementHandoffDeclaration } from "../gtl/requirement_handoff.js";
import type { CProgramNode } from "../gtl/c_algebra.js";
import type { GraphFunction, ModulePublication } from "../gtl/contracts.js";

export const RAW_SUBJECT_KIND_VALUES = [
  "module_publication",
  "catalog_contribution",
  "gtl_program",
  "graph_function",
  "gtl_graph",
  "c_program_term",
  "contract_declaration",
  "implementation_binding",
  "closure_contract",
  "invocation_input",
  "public_operation_request",
  "conformance_evaluate_packet",
] as const;

export type RawSubjectKind = (typeof RAW_SUBJECT_KIND_VALUES)[number];

export interface RawAdmittedValue<S> {
  readonly kind: "raw_admitted_value";
  readonly schemaVersion: "5.0.0";
  readonly admissionRef: string;
  readonly subjectKind: RawSubjectKind;
  readonly contractRef: string;
  readonly subjectDigest: Sha256Digest;
  readonly value: Readonly<S>;
}

export interface RawAdmissionRefusal {
  readonly kind: "raw_admission_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code: "invalid_contract" | "invalid_kind" | "non_canonical_value";
  readonly message: string;
}

export type RawAdmissionResult<S> = RawAdmittedValue<S> | RawAdmissionRefusal;

function hasExpectedKind(
  value: Readonly<Record<string, unknown>>,
  expectedKind: RawSubjectKind,
): boolean {
  switch (expectedKind) {
    case "catalog_contribution":
      return (
        value.kind === "graph_function" ||
        value.kind === "node_type" ||
        value.kind === "overlay"
      );
    case "contract_declaration":
      return (
        typeof value.contractRef === "string" &&
        (value.contractKind === "input" ||
          value.contractKind === "output" ||
          value.contractKind === "evidence" ||
          value.contractKind === "failure" ||
          value.contractKind === "refusal" ||
          value.contractKind === "judgment" ||
          value.contractKind === "transition" ||
          value.contractKind === "closure")
      );
    case "c_program_term":
      return C_TERM_KIND_VALUES.some((kind) => kind === value.kind);
    case "invocation_input":
      return typeof value.kind === "string" && value.kind.length !== 0;
    case "public_operation_request":
      return value.kind === "public_invocation";
    default:
      return value.kind === expectedKind;
  }
}

const admittedValues = new WeakSet<object>();

const structuralSchemas = Object.freeze({
  module_publication: structure.MODULE_PUBLICATION_SCHEMA,
  catalog_contribution: structure.CATALOG_CONTRIBUTION_SCHEMA,
  gtl_program: structure.GTL_PROGRAM_SCHEMA,
  graph_function: structure.GRAPH_FUNCTION_SCHEMA,
  c_program_term: structure.C_PROGRAM_SYNTAX_SCHEMA,
  contract_declaration: structure.CONTRACT_DECLARATION_SCHEMA,
  implementation_binding: structure.IMPLEMENTATION_BINDING_SCHEMA,
  closure_contract: structure.CLOSURE_CONTRACT_SCHEMA,
  conformance_evaluate_packet: structure.GTL_PROGRAM_CONFORMANCE_INPUT_SCHEMA,
});

function issuePath(issue: v.BaseIssue<unknown>): string {
  const nested = issue.issues?.find((candidate) => candidate.path !== undefined);
  if (nested !== undefined) return issuePath(nested);
  return "$" + (issue.path ?? []).map(({ key }) =>
    "/" + String(key).replaceAll("~", "~0").replaceAll("/", "~1")
  ).join("");
}

function assertGraphLocalRelations(graph: GraphFunction, path: string): void {
  graph.template.nodes.forEach((node, index) => assertCProgramLocalRelations(node.term, `${path}/template/nodes/${index}/term`));
  const issue = graphTemplateDiagnostics(graph.template, `${path}/template`)[0];
  if (issue !== undefined) throw new TypeError(`${issue.path}: ${issue.message}`);
}

function assertModuleLocalRelations(publication: ModulePublication, path: string): void {
  publication.graphFunctions.forEach((graph, index) => assertGraphLocalRelations(graph, `${path}/graphFunctions/${index}`));
  const check = (condition: boolean, suffix: string): void => {
    if (!condition) throw new TypeError(`${path}${suffix}: declaration differs from its existing local constructor contract`);
  };
  if (publication.semanticLifecycle !== undefined) check(isSemanticLifecycleDeclaration(publication.semanticLifecycle), "/semanticLifecycle");
  if (publication.semanticJobLifecycle !== undefined) check(isSemanticJobLifecycleDeclaration(publication.semanticJobLifecycle), "/semanticJobLifecycle");
  publication.runEnvironments?.forEach((environment, index) => check(isRunEnvironmentDeclaration(environment), `/runEnvironments/${index}`));
  publication.stdoRunEnvironments?.forEach((environment, index) => check(isStdoRunEnvironmentDeclaration(environment), `/stdoRunEnvironments/${index}`));
  publication.requirementHandoffs?.forEach((handoff, index) => check(isRequirementHandoffDeclaration(handoff), `/requirementHandoffs/${index}`));
}

function assertStructuralValue(value: JsonValue, expectedKind: RawSubjectKind): void {
  if (!Object.hasOwn(structuralSchemas, expectedKind)) return;
  const schema = structuralSchemas[expectedKind as keyof typeof structuralSchemas];
  const parsed = v.safeParse(schema, value);
  if (!parsed.success) {
    const issue = parsed.issues[0]!;
    throw new TypeError(`${issuePath(issue)}: ${issue.message}`);
  }
  // Casts below select the already checked schema variant; they confer no
  // admission. Every field and recursive child has passed its canonical owner.
  switch (expectedKind) {
    case "c_program_term":
      assertCProgramLocalRelations(value as unknown as CProgramNode);
      break;
    case "graph_function":
      assertGraphLocalRelations(value as unknown as GraphFunction, "$");
      break;
    case "module_publication":
      assertModuleLocalRelations(value as unknown as ModulePublication, "$");
      break;
    case "conformance_evaluate_packet":
      assertModuleLocalRelations((value as unknown as structure.ContractValue<typeof structure.GTL_PROGRAM_CONFORMANCE_INPUT_SCHEMA>).publication, "$/publication");
      break;
  }
}

export function isRawAdmittedValue(value: object): boolean {
  return admittedValues.has(value);
}

export function rawAdmitValue<S>(
  value: unknown,
  expectedKind: RawSubjectKind,
  contractRef: string,
): RawAdmissionResult<S> {
  if (contractRef.length === 0) {
    return {
      kind: "raw_admission_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "invalid_contract",
      message: "raw admission requires one exact non-empty contract reference",
    };
  }
  if (!isRecord(value) || !hasExpectedKind(value, expectedKind)) {
    return {
      kind: "raw_admission_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "invalid_kind",
      message: `raw value does not satisfy expected kind ${expectedKind}`,
    };
  }
  try {
    const json = Object.hasOwn(structuralSchemas, expectedKind)
      ? admitIJsonValue(value, "$")
      : value as JsonValue;
    try {
      assertStructuralValue(json, expectedKind);
    } catch (error) {
      return {
        kind: "raw_admission_refusal", schemaVersion: "5.0.0", disposition: "refused", code: "invalid_kind",
        message: error instanceof Error ? error.message : "$: structural admission failed",
      };
    }
    const admittedJson: JsonValue = (() => {
      switch (expectedKind) {
        case "module_publication":
        case "catalog_contribution":
        case "gtl_program":
        case "graph_function":
          return canonicalizeAuthoredGtlCarrier(
            json,
            expectedKind,
          );
        default:
          return JSON.parse(canonicalJson(json)) as JsonValue;
      }
    })();
    assertStructuralValue(admittedJson, expectedKind);
    const admittedValue = deepFreeze(admittedJson as S);
    const subjectDigest = sha256Canonical(admittedValue as unknown as JsonValue);
    const admissionDigest = sha256Canonical({
      contractRef,
      expectedKind,
      subjectDigest,
    });
    const admitted = deepFreeze({
      kind: "raw_admitted_value",
      schemaVersion: "5.0.0",
      admissionRef: `raw-admission://abiogenesis/${admissionDigest.slice("sha256:".length)}`,
      subjectKind: expectedKind,
      contractRef,
      subjectDigest,
      value: admittedValue,
    }) as RawAdmittedValue<S>;
    admittedValues.add(admitted);
    return admitted;
  } catch (error) {
    return {
      kind: "raw_admission_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "non_canonical_value",
      message: error instanceof Error ? error.message : "$: raw value is not representable as canonical JSON",
    };
  }
}
