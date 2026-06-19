// Implements: REQ-F-ODDSDLC-069
// Implements: REQ-F-ODDSDLC-070
// Implements: REQ-F-ODDSDLC-071
// Implements: REQ-F-ODDSDLC-072
// Implements: REQ-F-ODDSDLC-073
// Investigates: T-169

import { createHash } from "node:crypto";
import {
  TARGET_CARRIER_CONTRACT_DECLARATION_KEY,
  materializeGraphFunction,
  validateTargetCarrierCandidate,
  type GraphVector,
  type Module,
  type Node,
  type SerializedAttrEntry,
  type SerializedAttrs,
  type SerializedAttrValue,
  type TargetCarrierCandidateAdmission,
  type TargetCarrierCandidateRejectionClass,
  type TargetCarrierContractBinding
} from "@abiogenesis/typescript-tenant";
import {
  SDLC_EDGE_GAIN_CLOSURE_CONTRACTS,
  type SdlcEdgeGainClosureContract
} from "./edge_gain_closure_contracts.js";

export type SdlcTargetCarrierDiagnosticCode =
  | "missing_target_carrier_contract"
  | "target_carrier_vector_mismatch"
  | "target_carrier_schema_mismatch"
  | "target_carrier_edge_target_mismatch"
  | "target_carrier_declaration_invalid"
  | "unregistered_target_carrier_contract";

export interface SdlcTargetCarrierDiagnostic {
  readonly kind: "sdlc_target_carrier_diagnostic";
  readonly code: SdlcTargetCarrierDiagnosticCode;
  readonly edgeRef: string;
  readonly detail: string;
}

export interface SdlcTargetCarrierContractRow {
  readonly kind: "sdlc_target_carrier_contract_row";
  readonly graphVectorRef: string;
  readonly edgeRef: string;
  readonly targetAssetType: string;
  readonly constructionDepthRole:
    | "none"
    | "staged_authority_producer"
    | "staged_materialization_consumer";
  readonly producedStagedAuthorityRefs: readonly string[];
  readonly requiredStagedAuthorityRefs: readonly string[];
  readonly targetNodeRef: string;
  readonly targetSchemaRef: string;
  readonly targetCarrierContractRef: string;
  readonly targetCarrierContractDigest: string;
  readonly targetCarrierTemplateRef: string;
  readonly outputSurfaceRef: string;
  readonly outputCarrierFamilyRef: string;
  readonly outputCarrierKind: string;
  readonly nestedPayloadPath: string;
  readonly requiredFieldRefs: readonly string[];
  readonly optionalFieldRefs: readonly string[];
  readonly fixedProtocolFieldRefs: readonly string[];
  readonly workerFillableFieldRefs: readonly string[];
  readonly literalDomainRefs: readonly string[];
  readonly enumDomainRefs: readonly string[];
  readonly schemaRef: string;
  readonly admissionRef: string;
  readonly payloadLedgerBindingRef: string;
  readonly edgeAssuranceBindingRef: string;
  readonly handoffProjectionRef: string;
  readonly constructionTemplateRef: string;
  readonly replayDigestPolicyRef: string;
  readonly materializationPolicyRef: string;
  readonly closurePreconditionRef: string;
  readonly testCaseGenerationRef: string;
  readonly binding: TargetCarrierContractBinding;
}

export interface SdlcTargetCarrierReadModel {
  readonly kind: "sdlc_target_carrier_read_model";
  readonly readOnly: true;
  readonly choosesNextTraversal: false;
  readonly rows: readonly SdlcTargetCarrierContractRow[];
  readonly diagnostics: readonly SdlcTargetCarrierDiagnostic[];
  readonly missingContractRefs: readonly string[];
  readonly unregisteredContractRefs: readonly string[];
}

export interface SdlcTargetCarrierRegistry {
  readonly kind: "sdlc_target_carrier_registry";
  readonly readModel: SdlcTargetCarrierReadModel;
  readonly rows: readonly SdlcTargetCarrierContractRow[];
  readonly diagnostics: readonly SdlcTargetCarrierDiagnostic[];
  readonly rowByEdgeRef: Readonly<Record<string, SdlcTargetCarrierContractRow>>;
}

export interface SdlcTargetCarrierCandidateAdmitted {
  readonly kind: "sdlc_target_carrier_candidate_admission";
  readonly status: "admitted";
  readonly payloadRef: string;
  readonly edgeRef: string;
  readonly graphVectorRef: string;
  readonly targetAssetType: string;
  readonly contractRef: string;
  readonly contractDigest: string;
  readonly validationRef: string;
}

export interface SdlcTargetCarrierCandidateRejected {
  readonly kind: "sdlc_target_carrier_candidate_admission";
  readonly status: "rejected";
  readonly payloadRef: string;
  readonly edgeRef: string;
  readonly graphVectorRef: string;
  readonly targetAssetType: string;
  readonly contractRef: string;
  readonly contractDigest: string;
  readonly rejectionClass: TargetCarrierCandidateRejectionClass;
  readonly reason: string;
}

export interface SdlcTargetCarrierCandidateMissing {
  readonly kind: "sdlc_target_carrier_candidate_admission";
  readonly status: "missing";
  readonly payloadRef: string | null;
  readonly edgeRef: string;
  readonly graphVectorRef: string;
  readonly targetAssetType: string;
  readonly contractRef: string;
  readonly contractDigest: string;
  readonly reason: string;
}

export type SdlcTargetCarrierCandidateAdmission =
  | SdlcTargetCarrierCandidateAdmitted
  | SdlcTargetCarrierCandidateRejected
  | SdlcTargetCarrierCandidateMissing;

function stableJson(input: unknown): string {
  if (input === null || typeof input !== "object") {
    return JSON.stringify(input);
  }
  if (Array.isArray(input)) {
    return `[${input.map((entry) => stableJson(entry)).join(",")}]`;
  }
  return `{${Object.entries(input)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${JSON.stringify(key)}:${stableJson(value)}`)
    .join(",")}}`;
}

function digestForValue(input: unknown): string {
  return `sha256:${createHash("sha256").update(stableJson(input)).digest("hex")}`;
}

function scalarValue(value: string): SerializedAttrValue {
  return Object.freeze({
    kind: "scalar",
    value
  });
}

function stringListValue(value: readonly string[]): SerializedAttrValue {
  return Object.freeze({
    kind: "string_list",
    value: Object.freeze([...value])
  });
}

function attr(
  key: string,
  value: SerializedAttrValue
): SerializedAttrEntry {
  return Object.freeze({ key, value });
}

function attrs(entries: readonly SerializedAttrEntry[]): SerializedAttrs {
  return Object.freeze({
    entries: Object.freeze([...entries])
  });
}

function hookRefValue(
  ref: string,
  configEntries: readonly SerializedAttrEntry[]
): SerializedAttrValue {
  return Object.freeze({
    kind: "hook_ref",
    value: Object.freeze({
      ref,
      config: attrs(configEntries)
    })
  });
}

function encodedRefPart(value: string): string {
  return encodeURIComponent(value).replaceAll("%2F", "/");
}

export function sdlcTargetCarrierContractRef(input: {
  readonly edgeRef: string;
  readonly targetAssetType: string;
}): string {
  return [
    "gtl://target-carrier-contract/odd-sdlc",
    encodedRefPart(input.edgeRef),
    encodedRefPart(input.targetAssetType)
  ].join("/");
}

export function sdlcTargetCarrierOutputKind(targetAssetType: string): string {
  return `sdlc_${targetAssetType}_target_carrier`;
}

function payloadRequiredFieldRefsForTarget(
  targetAssetType: string
): readonly string[] {
  if (targetAssetType === "implementation_design_surface") {
    return Object.freeze([
      "payload.stackProfileRows",
      "payload.implementationModuleRows",
      "payload.aggregateDomainModelRows",
      "payload.componentTopologyRows",
      "payload.sunnyDaySequenceRows",
      "payload.componentRealizationRows",
      "payload.fileTargetRows"
    ]);
  }
  if (targetAssetType === "test_design_surface") {
    return Object.freeze([
      "payload.designConsumptionRows",
      "payload.uatTestcaseRows",
      "payload.testcaseAuthorityRows",
      "payload.testStackProfileRows",
      "payload.testModuleRows",
      "payload.testComponentTopologyRows",
      "payload.testDataBindings",
      "payload.expectedResultBindings",
      "payload.uatIntegrationBindings",
      "payload.testExecutionScheduleRows"
    ]);
  }
  if (targetAssetType === "test_execution_surface") {
    return Object.freeze(["payload.testExecutionPreparationRows"]);
  }
  return Object.freeze([]);
}

function constructionDepthRoleForEdge(edgeRef: string): SdlcTargetCarrierContractRow["constructionDepthRole"] {
  switch (edgeRef) {
    case "derive_lite_design_adr_surface":
    case "derive_implementation_design_surface":
    case "derive_test_design_surface":
    case "derive_lite_test_design_surface":
      return "staged_authority_producer";
    case "derive_lite_component_code_surface":
    case "derive_component_code_surface":
    case "derive_component_test_surface":
    case "derive_uat_test_source_surface":
    case "derive_lite_component_test_surface":
    case "derive_lite_uat_test_source_surface":
      return "staged_materialization_consumer";
    default:
      return "none";
  }
}

function producedStagedAuthorityRefsForEdge(edgeRef: string): readonly string[] {
  switch (edgeRef) {
    case "derive_lite_design_adr_surface":
    case "derive_implementation_design_surface":
      return Object.freeze([
        "surface://implementation-decomposition-summary",
        "surface://module-dependency-map"
      ]);
    case "derive_test_design_surface":
    case "derive_lite_test_design_surface":
      return Object.freeze([
        "surface://test-stack-profile",
        "surface://test-decomposition-summary",
        "surface://test-dependency-map"
      ]);
    default:
      return Object.freeze([]);
  }
}

function requiredStagedAuthorityRefsForEdge(edgeRef: string): readonly string[] {
  switch (edgeRef) {
    case "derive_lite_component_code_surface":
      return Object.freeze([
        "surface://tenant-stack-authority",
        "surface://implementation-decomposition-summary",
        "surface://module-dependency-map"
      ]);
    case "derive_component_code_surface":
      return Object.freeze([
        "surface://tenant-stack-authority",
        "surface://testcase-authority",
        "surface://implementation-decomposition-summary",
        "surface://module-dependency-map"
      ]);
    case "derive_component_test_surface":
      return Object.freeze([
        "surface://tenant-stack-authority",
        "surface://testcase-authority",
        "surface://implementation-decomposition-summary",
        "surface://module-dependency-map",
        "surface://test-stack-profile",
        "surface://test-decomposition-summary",
        "surface://test-dependency-map"
      ]);
    case "derive_lite_component_test_surface":
      return Object.freeze([
        "surface://tenant-stack-authority",
        "surface://implementation-decomposition-summary",
        "surface://module-dependency-map",
        "surface://test-stack-profile",
        "surface://test-decomposition-summary",
        "surface://test-dependency-map"
      ]);
    case "derive_uat_test_source_surface":
      return Object.freeze([
        "surface://tenant-stack-authority",
        "surface://testcase-authority",
        "surface://test-stack-profile",
        "surface://test-decomposition-summary",
        "surface://test-dependency-map"
      ]);
    case "derive_lite_uat_test_source_surface":
      return Object.freeze([
        "surface://tenant-stack-authority",
        "surface://test-stack-profile",
        "surface://test-decomposition-summary",
        "surface://test-dependency-map"
      ]);
    default:
      return Object.freeze([]);
  }
}

function workerFillableFieldRefsForTarget(
  targetAssetType: string
): readonly string[] {
  return Object.freeze([
    "payload",
    ...payloadRequiredFieldRefsForTarget(targetAssetType),
    "summary",
    "evidenceRefs"
  ]);
}

function bindingConfigEntries(input: {
  readonly edgeRef: string;
  readonly targetAssetType: string;
  readonly target: Node;
}): readonly SerializedAttrEntry[] {
  const contractRef = sdlcTargetCarrierContractRef(input);
  const outputCarrierKind = sdlcTargetCarrierOutputKind(input.targetAssetType);
  return Object.freeze([
    attr("contract_ref", scalarValue(contractRef)),
    attr("template_ref", scalarValue(`gtl://target-carrier-template/odd-sdlc/${input.targetAssetType}`)),
    attr("target_node_ref", scalarValue(input.target.id)),
    attr("output_surface_ref", scalarValue(`asset-type://odd-sdlc/${input.targetAssetType}`)),
    attr("output_carrier_family_ref", scalarValue("gtl://target-carrier-family/odd-sdlc/sdlc-output")),
    attr("output_carrier_kind", scalarValue(outputCarrierKind)),
    attr("envelope_contract_ref", scalarValue("gtl://target-carrier-envelope/odd-sdlc/sdlc-output-v1")),
    attr("nested_payload_path", scalarValue("payload")),
    attr("required_field_refs", stringListValue([
      "kind",
      "targetAssetType",
      "edgeRef",
      "contractRef",
      "contractDigest",
      "payload",
      ...payloadRequiredFieldRefsForTarget(input.targetAssetType)
    ])),
    attr("optional_field_refs", stringListValue([
      "summary",
      "evidenceRefs",
      "diagnosticRefs"
    ])),
    attr("fixed_protocol_field_refs", stringListValue([
      "kind",
      "targetAssetType",
      "edgeRef",
      "contractRef",
      "contractDigest"
    ])),
    attr(
      "worker_fillable_field_refs",
      stringListValue(workerFillableFieldRefsForTarget(input.targetAssetType))
    ),
    attr("literal_domain_refs", stringListValue([
      `kind:${outputCarrierKind}`,
      `targetAssetType:${input.targetAssetType}`,
      `edgeRef:${input.edgeRef}`,
      `contractRef:${contractRef}`
    ])),
    attr("enum_domain_refs", stringListValue([])),
    attr("schema_ref", scalarValue(input.target.schema.ref)),
    attr("admission_ref", scalarValue(`admission://odd-sdlc/target-carrier/${input.edgeRef}`)),
    attr("payload_ledger_binding_ref", scalarValue(`payload-ledger://odd-sdlc/target-carrier/${input.edgeRef}`)),
    attr("edge_assurance_binding_ref", scalarValue(`edge-assurance://odd-sdlc/${input.edgeRef}/target-carrier`)),
    attr("handoff_projection_ref", scalarValue(`handoff-projection://odd-sdlc/target-carrier/${input.edgeRef}`)),
    attr("construction_template_ref", scalarValue(`construction-template://odd-sdlc/target-carrier/${input.targetAssetType}`)),
    attr("replay_digest_policy_ref", scalarValue(`replay-digest://odd-sdlc/target-carrier/${input.edgeRef}`)),
    attr("materialization_policy_ref", scalarValue(`materialization://odd-sdlc/target-carrier/${input.targetAssetType}`)),
    attr("closure_precondition_ref", scalarValue(`closure-precondition://odd-sdlc/target-carrier-admitted/${input.edgeRef}`)),
    attr("test_case_generation_ref", scalarValue(`test-case-generation://odd-sdlc/target-carrier/${input.targetAssetType}`))
  ]);
}

export function sdlcTargetCarrierDeclarationForTarget(input: {
  readonly edgeRef: string;
  readonly targetAssetType: string;
  readonly target: Node;
}): SerializedAttrEntry {
  return Object.freeze({
    key: TARGET_CARRIER_CONTRACT_DECLARATION_KEY,
    value: hookRefValue(
      `gtl://target-carrier-hook/odd-sdlc/${input.edgeRef}/${input.targetAssetType}`,
      bindingConfigEntries(input)
    )
  });
}

function scalarConfigValue(
  config: SerializedAttrs,
  key: string
): string {
  const entry = config.entries.find((candidate) => candidate.key === key);
  if (entry?.value.kind !== "scalar" || typeof entry.value.value !== "string") {
    throw new TypeError(`${key}: expected scalar string target carrier config`);
  }
  return entry.value.value;
}

function listConfigValue(
  config: SerializedAttrs,
  key: string
): readonly string[] {
  const entry = config.entries.find((candidate) => candidate.key === key);
  if (
    entry?.value.kind !== "string_list" ||
    !Array.isArray(entry.value.value)
  ) {
    throw new TypeError(`${key}: expected string list target carrier config`);
  }
  return Object.freeze(
    entry.value.value.map((value, index) => {
      if (typeof value !== "string" || value.length === 0) {
        throw new TypeError(
          `${key}[${index}]: expected non-empty string target carrier config`
        );
      }
      return value;
    })
  );
}

function bindingForDeclaration(input: {
  readonly edgeRef: string;
  readonly vector: GraphVector;
  readonly targetAssetType: string;
}): TargetCarrierContractBinding {
  const declarations = input.vector.declarations.entries.filter(
    (entry) => entry.key === TARGET_CARRIER_CONTRACT_DECLARATION_KEY
  );
  if (declarations.length === 0) {
    throw new TypeError(`${input.edgeRef}: missing target carrier declaration`);
  }
  if (declarations.length > 1) {
    throw new TypeError(`${input.edgeRef}: duplicate target carrier declarations`);
  }
  const declaration = declarations[0];
  if (declaration === undefined) {
    throw new TypeError(`${input.edgeRef}: missing target carrier declaration`);
  }
  if (declaration.value.kind !== "hook_ref") {
    throw new TypeError(`${input.edgeRef}: target carrier declaration is not hook_ref`);
  }
  const hookRef = declaration.value.value;
  const config = hookRef.config;
  const binding = Object.freeze({
    kind: "target_carrier_contract_binding" as const,
    source: "graph_vector_declarations" as const,
    sourceRef: input.vector.id,
    attrKey: TARGET_CARRIER_CONTRACT_DECLARATION_KEY,
    hookRef: hookRef.ref,
    contractRef: scalarConfigValue(config, "contract_ref"),
    templateRef: scalarConfigValue(config, "template_ref"),
    targetNodeRef: scalarConfigValue(config, "target_node_ref"),
    outputSurfaceRef: scalarConfigValue(config, "output_surface_ref"),
    outputCarrierFamilyRef: scalarConfigValue(config, "output_carrier_family_ref"),
    outputCarrierKind: scalarConfigValue(config, "output_carrier_kind"),
    envelopeContractRef: scalarConfigValue(config, "envelope_contract_ref"),
    nestedPayloadPath: scalarConfigValue(config, "nested_payload_path"),
    requiredFieldRefs: listConfigValue(config, "required_field_refs"),
    optionalFieldRefs: listConfigValue(config, "optional_field_refs"),
    fixedProtocolFieldRefs: listConfigValue(config, "fixed_protocol_field_refs"),
    workerFillableFieldRefs: listConfigValue(config, "worker_fillable_field_refs"),
    literalDomainRefs: listConfigValue(config, "literal_domain_refs"),
    enumDomainRefs: listConfigValue(config, "enum_domain_refs"),
    schemaRef: scalarConfigValue(config, "schema_ref"),
    admissionRef: scalarConfigValue(config, "admission_ref"),
    payloadLedgerBindingRef: scalarConfigValue(config, "payload_ledger_binding_ref"),
    edgeAssuranceBindingRef: scalarConfigValue(config, "edge_assurance_binding_ref"),
    handoffProjectionRef: scalarConfigValue(config, "handoff_projection_ref"),
    constructionTemplateRef: scalarConfigValue(config, "construction_template_ref"),
    replayDigestPolicyRef: scalarConfigValue(config, "replay_digest_policy_ref"),
    materializationPolicyRef: scalarConfigValue(config, "materialization_policy_ref"),
    closurePreconditionRef: scalarConfigValue(config, "closure_precondition_ref"),
    testCaseGenerationRef: scalarConfigValue(config, "test_case_generation_ref"),
    configDigest: digestForValue(config)
  } satisfies TargetCarrierContractBinding);
  assertBindingMatchesVector({
    binding,
    vector: input.vector,
    edgeRef: input.edgeRef
  });
  return binding;
}

function targetCarrierDiagnostic(input: {
  readonly code: SdlcTargetCarrierDiagnosticCode;
  readonly edgeRef: string;
  readonly detail: string;
}): SdlcTargetCarrierDiagnostic {
  return Object.freeze({
    kind: "sdlc_target_carrier_diagnostic" as const,
    code: input.code,
    edgeRef: input.edgeRef,
    detail: input.detail
  });
}

export function assertBindingMatchesVector(input: {
  readonly binding: Pick<TargetCarrierContractBinding, "contractRef" | "targetNodeRef" | "schemaRef">;
  readonly vector: GraphVector;
  readonly edgeRef: string;
}): void {
  if (input.binding.targetNodeRef !== input.vector.target.id) {
    throw new TypeError(
      `${input.edgeRef}: target carrier ${input.binding.contractRef} target node does not match graph vector target`
    );
  }
  if (input.binding.schemaRef !== input.vector.target.schema.ref) {
    throw new TypeError(
      `${input.edgeRef}: target carrier ${input.binding.contractRef} schema does not match graph vector target schema`
    );
  }
}

export function constructSdlcTargetCarrierContractRow(input: {
  readonly contract: SdlcEdgeGainClosureContract;
  readonly vector: GraphVector;
}): SdlcTargetCarrierContractRow {
  if (input.contract.targetAssetType !== input.vector.target.name) {
    throw new TypeError(
      `${input.contract.edgeRef}: edge target ${input.contract.targetAssetType} does not match vector target ${input.vector.target.name}`
    );
  }
  const binding = bindingForDeclaration({
    edgeRef: input.contract.edgeRef,
    vector: input.vector,
    targetAssetType: input.contract.targetAssetType
  });
  return Object.freeze({
    kind: "sdlc_target_carrier_contract_row" as const,
    graphVectorRef: input.vector.name,
    edgeRef: input.contract.edgeRef,
    targetAssetType: input.contract.targetAssetType,
    constructionDepthRole: constructionDepthRoleForEdge(input.contract.edgeRef),
    producedStagedAuthorityRefs: producedStagedAuthorityRefsForEdge(
      input.contract.edgeRef
    ),
    requiredStagedAuthorityRefs: requiredStagedAuthorityRefsForEdge(
      input.contract.edgeRef
    ),
    targetNodeRef: binding.targetNodeRef,
    targetSchemaRef: binding.schemaRef,
    targetCarrierContractRef: binding.contractRef,
    targetCarrierContractDigest: binding.configDigest,
    targetCarrierTemplateRef: binding.templateRef,
    outputSurfaceRef: binding.outputSurfaceRef,
    outputCarrierFamilyRef: binding.outputCarrierFamilyRef,
    outputCarrierKind: binding.outputCarrierKind,
    nestedPayloadPath: binding.nestedPayloadPath,
    requiredFieldRefs: binding.requiredFieldRefs,
    optionalFieldRefs: binding.optionalFieldRefs,
    fixedProtocolFieldRefs: binding.fixedProtocolFieldRefs,
    workerFillableFieldRefs: binding.workerFillableFieldRefs,
    literalDomainRefs: binding.literalDomainRefs,
    enumDomainRefs: binding.enumDomainRefs,
    schemaRef: binding.schemaRef,
    admissionRef: binding.admissionRef,
    payloadLedgerBindingRef: binding.payloadLedgerBindingRef,
    edgeAssuranceBindingRef: binding.edgeAssuranceBindingRef,
    handoffProjectionRef: binding.handoffProjectionRef,
    constructionTemplateRef: binding.constructionTemplateRef,
    replayDigestPolicyRef: binding.replayDigestPolicyRef,
    materializationPolicyRef: binding.materializationPolicyRef,
    closurePreconditionRef: binding.closurePreconditionRef,
    testCaseGenerationRef: binding.testCaseGenerationRef,
    binding
  });
}

function materializedVectorsByName(moduleVectors: readonly GraphVector[]): ReadonlyMap<string, GraphVector> {
  return new Map(moduleVectors.map((vector) => [vector.name, vector]));
}

function publishedGraphVectorsForModule(module: Module): readonly GraphVector[] {
  return Object.freeze(
    module.graphFunctions.flatMap((graphFunction) =>
      materializeGraphFunction(graphFunction).vectors
    )
  );
}

export function constructSdlcTargetCarrierRows(input: {
  readonly vectors: readonly GraphVector[];
  readonly contracts: readonly SdlcEdgeGainClosureContract[];
}): readonly SdlcTargetCarrierContractRow[] {
  const byVector = materializedVectorsByName(input.vectors);
  return Object.freeze(
    input.contracts
      .map((contract) => {
        const vector = byVector.get(contract.edgeRef);
        return vector === undefined
          ? null
          : constructSdlcTargetCarrierContractRow({ contract, vector });
      })
      .filter((row): row is SdlcTargetCarrierContractRow => row !== null)
  );
}

export function projectSdlcTargetCarrierReadModel(input: {
  readonly publishedGraphVectorRefs: readonly string[];
  readonly vectors: readonly GraphVector[];
  readonly contracts: readonly SdlcEdgeGainClosureContract[];
}): SdlcTargetCarrierReadModel {
  const publishedRefSet = new Set(input.publishedGraphVectorRefs);
  const byVector = materializedVectorsByName(input.vectors);
  const rowAccumulator: SdlcTargetCarrierContractRow[] = [];
  const constructionDiagnostics: SdlcTargetCarrierDiagnostic[] = [];
  for (const contract of input.contracts) {
    const vector = byVector.get(contract.edgeRef);
    if (vector === undefined) {
      continue;
    }
    try {
      rowAccumulator.push(constructSdlcTargetCarrierContractRow({ contract, vector }));
    } catch (error) {
      constructionDiagnostics.push(
        targetCarrierDiagnostic({
          code: "target_carrier_declaration_invalid",
          edgeRef: contract.edgeRef,
          detail: error instanceof Error ? error.message : String(error)
        })
      );
    }
  }
  const rows = Object.freeze(rowAccumulator);
  const rowEdgeRefs = new Set(rows.map((row) => row.edgeRef));
  const contractByEdge = new Map(
    input.contracts.map((contract) => [contract.edgeRef, contract])
  );
  const missingContractRefs = input.publishedGraphVectorRefs.filter((edgeRef) => {
    const contract = contractByEdge.get(edgeRef);
    return (
      contract !== undefined &&
      contract.closureClassification === "close_capable" &&
      !rowEdgeRefs.has(edgeRef)
    );
  });
  const unregisteredContractRefs = input.contracts
    .map((contract) => contract.edgeRef)
    .filter((edgeRef) => !publishedRefSet.has(edgeRef));
  const diagnostics = Object.freeze([
    ...constructionDiagnostics,
    ...missingContractRefs.map((edgeRef) =>
      targetCarrierDiagnostic({
        code: "missing_target_carrier_contract",
        edgeRef,
        detail: `${edgeRef}: close-capable vector has no target carrier contract row`
      })
    ),
    ...unregisteredContractRefs.map((edgeRef) =>
      targetCarrierDiagnostic({
        code: "unregistered_target_carrier_contract",
        edgeRef,
        detail: `${edgeRef}: target carrier contract row has no published graph vector`
      })
    )
  ]);
  return Object.freeze({
    kind: "sdlc_target_carrier_read_model" as const,
    readOnly: true as const,
    choosesNextTraversal: false as const,
    rows,
    diagnostics,
    missingContractRefs: Object.freeze(missingContractRefs),
    unregisteredContractRefs: Object.freeze(unregisteredContractRefs)
  });
}

export function constructSdlcTargetCarrierRegistry(input: {
  readonly module: Module;
  readonly contracts?: readonly SdlcEdgeGainClosureContract[];
  readonly publishedGraphVectorRefs?: readonly string[];
}): SdlcTargetCarrierRegistry {
  const vectors = publishedGraphVectorsForModule(input.module);
  const readModel = projectSdlcTargetCarrierReadModel({
    publishedGraphVectorRefs:
      input.publishedGraphVectorRefs ?? vectors.map((vector) => vector.name),
    vectors,
    contracts: input.contracts ?? SDLC_EDGE_GAIN_CLOSURE_CONTRACTS
  });
  return Object.freeze({
    kind: "sdlc_target_carrier_registry" as const,
    readModel,
    rows: readModel.rows,
    diagnostics: readModel.diagnostics,
    rowByEdgeRef: Object.freeze(
      Object.fromEntries(readModel.rows.map((row) => [row.edgeRef, row]))
    )
  });
}

export function requireSdlcTargetCarrierRow(input: {
  readonly registry: SdlcTargetCarrierRegistry;
  readonly edgeRef: string;
}): SdlcTargetCarrierContractRow {
  const row = input.registry.rowByEdgeRef[input.edgeRef];
  if (row === undefined) {
    throw new TypeError(`${input.edgeRef}: missing SDLC target carrier contract row`);
  }
  return row;
}

export function sdlcTargetCarrierCandidate(input: {
  readonly row: SdlcTargetCarrierContractRow;
  readonly payload: unknown;
  readonly summary?: string | undefined;
  readonly evidenceRefs?: readonly string[] | undefined;
}): Readonly<Record<string, unknown>> {
  return Object.freeze({
    kind: input.row.outputCarrierKind,
    targetAssetType: input.row.targetAssetType,
    edgeRef: input.row.edgeRef,
    contractRef: input.row.targetCarrierContractRef,
    contractDigest: input.row.targetCarrierContractDigest,
    payload: input.payload,
    ...(input.summary === undefined ? {} : { summary: input.summary }),
    ...(input.evidenceRefs === undefined
      ? {}
      : { evidenceRefs: Object.freeze([...input.evidenceRefs]) })
  });
}

function expectedFixedFieldValues(
  row: SdlcTargetCarrierContractRow
): Readonly<Record<string, unknown>> {
  return Object.freeze({
    kind: row.outputCarrierKind,
    targetAssetType: row.targetAssetType,
    edgeRef: row.edgeRef,
    contractRef: row.targetCarrierContractRef,
    contractDigest: row.targetCarrierContractDigest
  });
}

function fromAbiAdmission(input: {
  readonly row: SdlcTargetCarrierContractRow;
  readonly admission: TargetCarrierCandidateAdmission;
}): SdlcTargetCarrierCandidateAdmission {
  const base = {
    kind: "sdlc_target_carrier_candidate_admission" as const,
    payloadRef: input.admission.payloadRef,
    edgeRef: input.row.edgeRef,
    graphVectorRef: input.row.graphVectorRef,
    targetAssetType: input.row.targetAssetType,
    contractRef: input.admission.contractRef,
    contractDigest: input.admission.contractDigest
  };
  if (input.admission.status === "admitted") {
    return Object.freeze({
      ...base,
      status: "admitted" as const,
      validationRef: input.admission.validationRef
    });
  }
  return Object.freeze({
    ...base,
    status: "rejected" as const,
    rejectionClass: input.admission.rejectionClass,
    reason: input.admission.reason
  });
}

export function admitSdlcTargetCarrierCandidate(input: {
  readonly row: SdlcTargetCarrierContractRow;
  readonly payloadRef: string;
  readonly candidate: unknown;
}): SdlcTargetCarrierCandidateAdmission {
  return fromAbiAdmission({
    row: input.row,
    admission: validateTargetCarrierCandidate({
      binding: input.row.binding,
      payloadRef: input.payloadRef,
      candidate: input.candidate,
      expectedFixedFieldValues: expectedFixedFieldValues(input.row)
    })
  });
}

export function missingSdlcTargetCarrierAdmission(input: {
  readonly row: SdlcTargetCarrierContractRow;
  readonly payloadRef?: string | null;
  readonly reason: string;
}): SdlcTargetCarrierCandidateMissing {
  return Object.freeze({
    kind: "sdlc_target_carrier_candidate_admission" as const,
    status: "missing" as const,
    payloadRef: input.payloadRef ?? null,
    edgeRef: input.row.edgeRef,
    graphVectorRef: input.row.graphVectorRef,
    targetAssetType: input.row.targetAssetType,
    contractRef: input.row.targetCarrierContractRef,
    contractDigest: input.row.targetCarrierContractDigest,
    reason: input.reason
  });
}
