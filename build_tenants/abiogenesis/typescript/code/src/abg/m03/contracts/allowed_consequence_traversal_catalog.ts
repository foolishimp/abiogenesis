// Implements: T-156
// Implements: REQ-R-ABG3-FP-CONSCIOUSNESS
// Implements: REQ-R-ABG3-FN-COMPOSITION

import type {
  GraphFunction,
  GraphVector,
  SerializedAttrs,
  SerializedAttrValue
} from "../../../gtl/m01/contracts/carriers.js";
import { serializedJsonValueToPlain } from "../../../gtl/m01/contracts/constructors.js";
import {
  CONSTRUCTION_ACTION_KIND_VALUES
} from "./construction_action_kinds.js";
import { assertNonEmptyString } from "./runtime_support.js";
import {
  assertAllowedString,
  assertPlainRecord,
  freezeNonEmptyStrings,
  nullableString,
  uniqueNonEmptyStrings
} from "./construction_validation.js";
import {
  stableJson,
  stableSha256HexDigest
} from "../../../shared/runtime_identity.js";

export const ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_FAMILIES_DECLARATION_KEY =
  "abg.consequence.allowed_traversal_families" as const;

export const ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_ROWS_DECLARATION_KEY =
  "abg.consequence.allowed_traversals" as const;

export const ALLOWED_CONSEQUENCE_TRAVERSAL_FAMILY_VALUES = Object.freeze([
  "same_edge_retry",
  "depth_traversal",
  "graph_span_reentry",
  "public_start_reentry",
  "ticket_traversal",
  "fh_input_required",
  "escalation_or_reprice",
  "gap_stop",
  "non_admit"
] as const);

export type AllowedConsequenceTraversalFamily =
  (typeof ALLOWED_CONSEQUENCE_TRAVERSAL_FAMILY_VALUES)[number];

export const ALLOWED_CONSEQUENCE_TRAVERSAL_ACTION_KIND_VALUES = Object.freeze([
  ...CONSTRUCTION_ACTION_KIND_VALUES,
  "non_admit"
] as const);

export type AllowedConsequenceTraversalActionKind =
  (typeof ALLOWED_CONSEQUENCE_TRAVERSAL_ACTION_KIND_VALUES)[number];

export interface AllowedConsequenceTraversalRow {
  readonly kind: "allowed_consequence_traversal_row";
  readonly rowRef: string;
  readonly traversalFamily: AllowedConsequenceTraversalFamily;
  readonly edgeRef: string;
  readonly graphFunctionRef: string;
  readonly graphVectorRef: string;
  readonly allowedActionKinds: readonly AllowedConsequenceTraversalActionKind[];
  readonly allowedGraphFunctionRefs: readonly string[];
  readonly allowedTraversalTargetRefs: readonly string[];
  readonly requiredAuthorityRefs: readonly string[];
  readonly proportionalityBasisRefs: readonly string[];
  readonly declarationSourceRefs: readonly string[];
}

export interface AllowedConsequenceTraversalCatalog {
  readonly kind: "allowed_consequence_traversal_catalog";
  readonly catalogRef: string;
  readonly graphFunctionRef: string;
  readonly graphVectorRef: string;
  readonly vectorIndex: number;
  readonly edgeRef: string;
  readonly rows: readonly AllowedConsequenceTraversalRow[];
}

export interface ConsequenceTraversalActionCatalogSelection {
  readonly actionRef: string;
  readonly actionKind: AllowedConsequenceTraversalActionKind;
  readonly selectedTraversalFamily?: AllowedConsequenceTraversalFamily | null;
  readonly selectedGraphFunctionRef?: string | null;
  readonly selectedRefinementBoundaryRef?: string | null;
  readonly selectedCandidateFamilyRef?: string | null;
  readonly selectedTraversalTargetRef?: string | null;
  readonly graphVectorRef?: string | null;
  readonly requiredAuthorityRefs?: readonly string[];
  readonly proportionalityBasisRefs?: readonly string[];
}

export interface AllowedConsequenceTraversalAdmission {
  readonly kind: "allowed_consequence_traversal_admission";
  readonly admissionRef: string;
  readonly catalogRef: string;
  readonly selectedRowRef: string;
  readonly actionRef: string;
  readonly traversalFamily: AllowedConsequenceTraversalFamily;
  readonly actionKind: AllowedConsequenceTraversalActionKind;
  readonly authorityRefs: readonly string[];
  readonly proportionalityBasisRefs: readonly string[];
}

function assertAllowedConsequenceTraversalActionKind(
  value: string,
  label: string
): AllowedConsequenceTraversalActionKind {
  return assertAllowedString(
    value,
    ALLOWED_CONSEQUENCE_TRAVERSAL_ACTION_KIND_VALUES,
    label
  );
}

function optionalStringArray(values: readonly string[] | undefined): readonly string[] {
  return values === undefined ? Object.freeze([]) : values;
}

function defaultActionKindsForFamily(
  family: AllowedConsequenceTraversalFamily
): readonly AllowedConsequenceTraversalActionKind[] {
  switch (family) {
    case "same_edge_retry":
      return Object.freeze(["repair_same_edge"]);
    case "depth_traversal":
      return Object.freeze(["reenter_graph_span"]);
    case "graph_span_reentry":
      return Object.freeze(["reenter_graph_span"]);
    case "public_start_reentry":
      return Object.freeze(["invoke_graph_function", "continue_graph_call"]);
    case "ticket_traversal":
      return Object.freeze(["invoke_graph_function", "create_ticket"]);
    case "fh_input_required":
      return Object.freeze(["open_fh_gate"]);
    case "escalation_or_reprice":
      return Object.freeze(["propose_reprice"]);
    case "gap_stop":
      return Object.freeze(["block_episode"]);
    case "non_admit":
      return Object.freeze(["non_admit"]);
  }
}

export function constructAllowedConsequenceTraversalRow(input: {
  readonly rowRef: string;
  readonly traversalFamily: AllowedConsequenceTraversalFamily;
  readonly edgeRef: string;
  readonly graphFunctionRef: string;
  readonly graphVectorRef: string;
  readonly allowedActionKinds?: readonly AllowedConsequenceTraversalActionKind[];
  readonly allowedGraphFunctionRefs?: readonly string[];
  readonly allowedTraversalTargetRefs?: readonly string[];
  readonly requiredAuthorityRefs?: readonly string[];
  readonly proportionalityBasisRefs?: readonly string[];
  readonly declarationSourceRefs?: readonly string[];
}): AllowedConsequenceTraversalRow {
  assertNonEmptyString(input.rowRef, "AllowedConsequenceTraversalRow.rowRef");
  const traversalFamily = assertAllowedString(
    input.traversalFamily,
    ALLOWED_CONSEQUENCE_TRAVERSAL_FAMILY_VALUES,
    "AllowedConsequenceTraversalRow.traversalFamily"
  );
  assertNonEmptyString(input.edgeRef, "AllowedConsequenceTraversalRow.edgeRef");
  assertNonEmptyString(
    input.graphFunctionRef,
    "AllowedConsequenceTraversalRow.graphFunctionRef"
  );
  assertNonEmptyString(
    input.graphVectorRef,
    "AllowedConsequenceTraversalRow.graphVectorRef"
  );
  const allowedActionKinds = uniqueNonEmptyStrings(
    optionalStringArray(input.allowedActionKinds).length === 0
      ? defaultActionKindsForFamily(traversalFamily)
      : optionalStringArray(input.allowedActionKinds),
    "AllowedConsequenceTraversalRow.allowedActionKinds"
  ).map((value) =>
    assertAllowedConsequenceTraversalActionKind(
      value,
      "AllowedConsequenceTraversalRow.allowedActionKinds"
    )
  );
  return Object.freeze({
    kind: "allowed_consequence_traversal_row",
    rowRef: input.rowRef,
    traversalFamily,
    edgeRef: input.edgeRef,
    graphFunctionRef: input.graphFunctionRef,
    graphVectorRef: input.graphVectorRef,
    allowedActionKinds: Object.freeze(allowedActionKinds),
    allowedGraphFunctionRefs: freezeNonEmptyStrings(
      input.allowedGraphFunctionRefs ?? [],
      "AllowedConsequenceTraversalRow.allowedGraphFunctionRefs"
    ),
    allowedTraversalTargetRefs: freezeNonEmptyStrings(
      input.allowedTraversalTargetRefs ?? [],
      "AllowedConsequenceTraversalRow.allowedTraversalTargetRefs"
    ),
    requiredAuthorityRefs: freezeNonEmptyStrings(
      input.requiredAuthorityRefs ?? [],
      "AllowedConsequenceTraversalRow.requiredAuthorityRefs"
    ),
    proportionalityBasisRefs: freezeNonEmptyStrings(
      input.proportionalityBasisRefs ?? [],
      "AllowedConsequenceTraversalRow.proportionalityBasisRefs"
    ),
    declarationSourceRefs: freezeNonEmptyStrings(
      input.declarationSourceRefs ?? [],
      "AllowedConsequenceTraversalRow.declarationSourceRefs"
    )
  });
}

export function constructAllowedConsequenceTraversalCatalog(input: {
  readonly catalogRef: string;
  readonly graphFunctionRef: string;
  readonly graphVectorRef: string;
  readonly vectorIndex: number;
  readonly edgeRef: string;
  readonly rows?: readonly AllowedConsequenceTraversalRow[];
}): AllowedConsequenceTraversalCatalog {
  assertNonEmptyString(input.catalogRef, "AllowedConsequenceTraversalCatalog.catalogRef");
  assertNonEmptyString(
    input.graphFunctionRef,
    "AllowedConsequenceTraversalCatalog.graphFunctionRef"
  );
  assertNonEmptyString(
    input.graphVectorRef,
    "AllowedConsequenceTraversalCatalog.graphVectorRef"
  );
  if (!Number.isSafeInteger(input.vectorIndex) || input.vectorIndex < 0) {
    throw new TypeError(
      "AllowedConsequenceTraversalCatalog.vectorIndex must be a non-negative safe integer"
    );
  }
  assertNonEmptyString(input.edgeRef, "AllowedConsequenceTraversalCatalog.edgeRef");
  const rowRefs = new Set<string>();
  for (const row of input.rows ?? []) {
    if (row.graphFunctionRef !== input.graphFunctionRef) {
      throw new TypeError(
        "AllowedConsequenceTraversalCatalog row graphFunctionRef mismatch"
      );
    }
    if (row.graphVectorRef !== input.graphVectorRef) {
      throw new TypeError(
        "AllowedConsequenceTraversalCatalog row graphVectorRef mismatch"
      );
    }
    if (row.edgeRef !== input.edgeRef) {
      throw new TypeError("AllowedConsequenceTraversalCatalog row edgeRef mismatch");
    }
    if (rowRefs.has(row.rowRef)) {
      throw new TypeError(
        `AllowedConsequenceTraversalCatalog duplicate rowRef ${JSON.stringify(row.rowRef)}`
      );
    }
    rowRefs.add(row.rowRef);
  }
  return Object.freeze({
    kind: "allowed_consequence_traversal_catalog",
    catalogRef: input.catalogRef,
    graphFunctionRef: input.graphFunctionRef,
    graphVectorRef: input.graphVectorRef,
    vectorIndex: input.vectorIndex,
    edgeRef: input.edgeRef,
    rows: Object.freeze([...(input.rows ?? [])])
  });
}


function attrValuesForKey(
  attrs: SerializedAttrs,
  key: string
): readonly SerializedAttrValue[] {
  return Object.freeze(
    attrs.entries
      .filter((entry) => entry.key === key)
      .map((entry) => entry.value)
  );
}

function declarationSourceRef(input: {
  readonly sourceKind: "graph_vector" | "graph_function";
  readonly sourceRef: string;
  readonly key: string;
}): string {
  return [
    "gtl-declaration",
    input.sourceKind,
    encodeURIComponent(input.sourceRef),
    input.key
  ].join(":");
}

function rowRefForDeclaredFamily(input: {
  readonly sourceRef: string;
  readonly sourceKind: "graph_vector" | "graph_function";
  readonly family: AllowedConsequenceTraversalFamily;
  readonly graphVectorRef: string;
}): string {
  return [
    "allowed-consequence-traversal",
    input.sourceKind,
    encodeURIComponent(input.sourceRef),
    encodeURIComponent(input.graphVectorRef),
    input.family
  ].join(":");
}

function rowsFromFamilyDeclaration(input: {
  readonly attrs: SerializedAttrs;
  readonly sourceKind: "graph_vector" | "graph_function";
  readonly sourceRef: string;
  readonly graphFunctionRef: string;
  readonly graphVectorRef: string;
  readonly edgeRef: string;
}): readonly AllowedConsequenceTraversalRow[] {
  return attrValuesForKey(
    input.attrs,
    ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_FAMILIES_DECLARATION_KEY
  ).flatMap((value) => {
    if (value.kind !== "string_list") {
      throw new TypeError(
        `${ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_FAMILIES_DECLARATION_KEY} must be a string_list declaration`
      );
    }
    return value.value.map((family) => {
      const traversalFamily = assertAllowedString(
        family,
        ALLOWED_CONSEQUENCE_TRAVERSAL_FAMILY_VALUES,
        `${ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_FAMILIES_DECLARATION_KEY}[]`
      );
      return constructAllowedConsequenceTraversalRow({
        rowRef: rowRefForDeclaredFamily({
          sourceRef: input.sourceRef,
          sourceKind: input.sourceKind,
          family: traversalFamily,
          graphVectorRef: input.graphVectorRef
        }),
        traversalFamily,
        edgeRef: input.edgeRef,
        graphFunctionRef: input.graphFunctionRef,
        graphVectorRef: input.graphVectorRef,
        declarationSourceRefs: [
          declarationSourceRef({
            sourceKind: input.sourceKind,
            sourceRef: input.sourceRef,
            key: ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_FAMILIES_DECLARATION_KEY
          })
        ]
      });
    });
  });
}

function optionalStringArrayFromPlain(
  record: Readonly<Record<string, unknown>>,
  key: string
): readonly string[] {
  const value = record[key];
  if (value === undefined) {
    return Object.freeze([]);
  }
  if (!Array.isArray(value)) {
    throw new TypeError(`${key} must be an array of strings`);
  }
  return freezeNonEmptyStrings(
    value.map((entry, index) => {
      if (typeof entry !== "string" || entry.length === 0) {
        throw new TypeError(`${key}[${index}] must be a non-empty string`);
      }
      return entry;
    }),
    key
  );
}

function rowsFromRowDeclaration(input: {
  readonly attrs: SerializedAttrs;
  readonly sourceKind: "graph_vector" | "graph_function";
  readonly sourceRef: string;
  readonly graphFunctionRef: string;
  readonly graphVectorRef: string;
  readonly edgeRef: string;
}): readonly AllowedConsequenceTraversalRow[] {
  return attrValuesForKey(
    input.attrs,
    ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_ROWS_DECLARATION_KEY
  ).flatMap((value) => {
    if (value.kind !== "json_blob") {
      throw new TypeError(
        `${ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_ROWS_DECLARATION_KEY} must be a json_blob declaration`
      );
    }
    const plain = serializedJsonValueToPlain(value.value);
    if (!Array.isArray(plain)) {
      throw new TypeError(
        `${ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_ROWS_DECLARATION_KEY} must decode to an array`
      );
    }
    return plain.map((entry, index) => {
      const row = assertPlainRecord(
        entry,
        `${ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_ROWS_DECLARATION_KEY}[${index}]`
      );
      const family = row["traversalFamily"];
      if (typeof family !== "string" || family.length === 0) {
        throw new TypeError(
          `${ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_ROWS_DECLARATION_KEY}[${index}].traversalFamily must be a non-empty string`
        );
      }
      const traversalFamily = assertAllowedString(
        family,
        ALLOWED_CONSEQUENCE_TRAVERSAL_FAMILY_VALUES,
        `${ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_ROWS_DECLARATION_KEY}[${index}].traversalFamily`
      );
      return constructAllowedConsequenceTraversalRow({
        rowRef:
          typeof row["rowRef"] === "string" && row["rowRef"].length > 0
            ? row["rowRef"]
            : `${rowRefForDeclaredFamily({
                sourceRef: input.sourceRef,
                sourceKind: input.sourceKind,
                family: traversalFamily,
                graphVectorRef: input.graphVectorRef
              })}:${index}`,
        traversalFamily,
        edgeRef: input.edgeRef,
        graphFunctionRef: input.graphFunctionRef,
        graphVectorRef: input.graphVectorRef,
        allowedActionKinds: optionalStringArrayFromPlain(
          row,
          "allowedActionKinds"
        ).map((kind) =>
          assertAllowedConsequenceTraversalActionKind(
            kind,
            `${ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_ROWS_DECLARATION_KEY}[${index}].allowedActionKinds`
          )
        ),
        allowedGraphFunctionRefs: optionalStringArrayFromPlain(
          row,
          "allowedGraphFunctionRefs"
        ),
        allowedTraversalTargetRefs: optionalStringArrayFromPlain(
          row,
          "allowedTraversalTargetRefs"
        ),
        requiredAuthorityRefs: optionalStringArrayFromPlain(
          row,
          "requiredAuthorityRefs"
        ),
        proportionalityBasisRefs: optionalStringArrayFromPlain(
          row,
          "proportionalityBasisRefs"
        ),
        declarationSourceRefs: [
          declarationSourceRef({
            sourceKind: input.sourceKind,
            sourceRef: input.sourceRef,
            key: ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_ROWS_DECLARATION_KEY
          })
        ]
      });
    });
  });
}

function rowsFromDeclarations(input: {
  readonly attrs: SerializedAttrs;
  readonly sourceKind: "graph_vector" | "graph_function";
  readonly sourceRef: string;
  readonly graphFunctionRef: string;
  readonly graphVectorRef: string;
  readonly edgeRef: string;
}): readonly AllowedConsequenceTraversalRow[] {
  return Object.freeze([
    ...rowsFromFamilyDeclaration(input),
    ...rowsFromRowDeclaration(input)
  ]);
}

export function deriveAllowedConsequenceTraversalCatalogFromGtl(input: {
  readonly graphFunction: GraphFunction;
  readonly graphVector: GraphVector;
  readonly vectorIndex: number;
  readonly edgeRef?: string | null;
}): AllowedConsequenceTraversalCatalog {
  const edgeRef = input.edgeRef ?? input.graphVector.name;
  const rows = [
    ...rowsFromDeclarations({
      attrs: input.graphFunction.declarations,
      sourceKind: "graph_function",
      sourceRef: input.graphFunction.id,
      graphFunctionRef: input.graphFunction.id,
      graphVectorRef: input.graphVector.id,
      edgeRef
    }),
    ...rowsFromDeclarations({
      attrs: input.graphVector.declarations,
      sourceKind: "graph_vector",
      sourceRef: input.graphVector.id,
      graphFunctionRef: input.graphFunction.id,
      graphVectorRef: input.graphVector.id,
      edgeRef
    })
  ];
  const catalogDigest = stableSha256HexDigest(
    stableJson({
      graphFunctionRef: input.graphFunction.id,
      graphVectorRef: input.graphVector.id,
      vectorIndex: input.vectorIndex,
      edgeRef,
      rowRefs: rows.map((row) => row.rowRef)
    })
  );
  return constructAllowedConsequenceTraversalCatalog({
    catalogRef: `allowed-consequence-traversal-catalog:${catalogDigest}`,
    graphFunctionRef: input.graphFunction.id,
    graphVectorRef: input.graphVector.id,
    vectorIndex: input.vectorIndex,
    edgeRef,
    rows
  });
}

function inferredFamilyForAction(
  action: ConsequenceTraversalActionCatalogSelection
): AllowedConsequenceTraversalFamily {
  if (action.selectedTraversalFamily !== undefined && action.selectedTraversalFamily !== null) {
    return assertAllowedString(
      action.selectedTraversalFamily,
      ALLOWED_CONSEQUENCE_TRAVERSAL_FAMILY_VALUES,
      "ConsequenceTraversalAction.selectedTraversalFamily"
    );
  }
  switch (action.actionKind) {
    case "repair_same_edge":
      return "same_edge_retry";
    case "reenter_graph_span":
      return action.selectedRefinementBoundaryRef !== undefined &&
        action.selectedRefinementBoundaryRef !== null
        ? "depth_traversal"
        : action.selectedCandidateFamilyRef !== undefined &&
            action.selectedCandidateFamilyRef !== null
          ? "depth_traversal"
          : "graph_span_reentry";
    case "invoke_graph_function":
    case "continue_graph_call":
      return "public_start_reentry";
    case "open_fh_gate":
      return "fh_input_required";
    case "create_ticket":
      return "ticket_traversal";
    case "propose_reprice":
      return "escalation_or_reprice";
    case "block_episode":
      return "gap_stop";
    case "non_admit":
      return "non_admit";
    case "invoke_prior_vector":
    case "invoke_later_vector":
      return "graph_span_reentry";
    case "yield_progress":
    case "close_episode":
      return "gap_stop";
  }
}

function actionGraphFunctionMatches(
  row: AllowedConsequenceTraversalRow,
  action: ConsequenceTraversalActionCatalogSelection
): boolean {
  if (row.allowedGraphFunctionRefs.length === 0) {
    return true;
  }
  return (
    action.selectedGraphFunctionRef !== undefined &&
    action.selectedGraphFunctionRef !== null &&
    row.allowedGraphFunctionRefs.includes(action.selectedGraphFunctionRef)
  );
}

function actionTraversalTargetMatches(
  row: AllowedConsequenceTraversalRow,
  action: ConsequenceTraversalActionCatalogSelection
): boolean {
  if (row.allowedTraversalTargetRefs.length === 0) {
    return true;
  }
  return (
    action.selectedTraversalTargetRef !== undefined &&
    action.selectedTraversalTargetRef !== null &&
    row.allowedTraversalTargetRefs.includes(action.selectedTraversalTargetRef)
  );
}

function actionCarriesRequiredAuthority(
  row: AllowedConsequenceTraversalRow,
  action: ConsequenceTraversalActionCatalogSelection
): boolean {
  const carried = new Set(action.requiredAuthorityRefs ?? []);
  return row.requiredAuthorityRefs.every((ref) => carried.has(ref));
}

function ticketTraversalRouteIsProductRoute(
  action: ConsequenceTraversalActionCatalogSelection
): boolean {
  const target = nullableString(
    action.selectedTraversalTargetRef ?? null,
    "ConsequenceTraversalAction.selectedTraversalTargetRef"
  );
  if (target === null) {
    return false;
  }
  return (
    target.startsWith("asset:") ||
    target.startsWith("public-start:") ||
    target.startsWith("graph-function:") ||
    target.startsWith("published-traversal-target:") ||
    target.startsWith("ticket-route:")
  );
}

function assertFamilySpecificShape(input: {
  readonly family: AllowedConsequenceTraversalFamily;
  readonly action: ConsequenceTraversalActionCatalogSelection;
}): void {
  const { family, action } = input;
  if (family === "depth_traversal") {
    if (action.graphVectorRef === undefined || action.graphVectorRef === null) {
      throw new TypeError("depth_traversal requires graphVectorRef");
    }
    if (
      (action.selectedRefinementBoundaryRef === undefined ||
        action.selectedRefinementBoundaryRef === null) &&
      (action.selectedCandidateFamilyRef === undefined ||
        action.selectedCandidateFamilyRef === null) &&
      (action.selectedTraversalTargetRef === undefined ||
        action.selectedTraversalTargetRef === null)
    ) {
      throw new TypeError(
        "depth_traversal requires refinement boundary, candidate family, or published traversal target authority"
      );
    }
  }
  if (family === "ticket_traversal" && !ticketTraversalRouteIsProductRoute(action)) {
    throw new TypeError(
      "ticket_traversal must route through a product-declared graph function, public-start asset handle, or published traversal target"
    );
  }
}

export function admitConsequenceTraversalActionAgainstAllowedCatalog(input: {
  readonly catalog: AllowedConsequenceTraversalCatalog;
  readonly action: ConsequenceTraversalActionCatalogSelection;
}): AllowedConsequenceTraversalAdmission {
  const family = inferredFamilyForAction(input.action);
  assertFamilySpecificShape({ family, action: input.action });
  const row = input.catalog.rows.find(
    (candidate) =>
      candidate.traversalFamily === family &&
      candidate.allowedActionKinds.includes(input.action.actionKind) &&
      actionGraphFunctionMatches(candidate, input.action) &&
      actionTraversalTargetMatches(candidate, input.action) &&
      actionCarriesRequiredAuthority(candidate, input.action)
  );
  if (row === undefined) {
    throw new TypeError(
      `ConsequenceTraversalAction ${input.action.actionRef} selected ${family}/${input.action.actionKind} but no matching allowed consequence traversal catalog row was admitted`
    );
  }
  const authorityRefs = uniqueNonEmptyStrings(
    [
      ...row.declarationSourceRefs,
      ...row.requiredAuthorityRefs,
      ...(input.action.requiredAuthorityRefs ?? [])
    ],
    "AllowedConsequenceTraversalAdmission.authorityRefs"
  );
  const proportionalityBasisRefs = uniqueNonEmptyStrings(
    [
      ...row.proportionalityBasisRefs,
      ...(input.action.proportionalityBasisRefs ?? [])
    ],
    "AllowedConsequenceTraversalAdmission.proportionalityBasisRefs"
  );
  const admissionDigest = stableSha256HexDigest(
    stableJson({
      catalogRef: input.catalog.catalogRef,
      rowRef: row.rowRef,
      actionRef: input.action.actionRef,
      family,
      actionKind: input.action.actionKind,
      authorityRefs,
      proportionalityBasisRefs
    })
  );
  return Object.freeze({
    kind: "allowed_consequence_traversal_admission",
    admissionRef: `allowed-consequence-traversal-admission:${admissionDigest}`,
    catalogRef: input.catalog.catalogRef,
    selectedRowRef: row.rowRef,
    actionRef: input.action.actionRef,
    traversalFamily: family,
    actionKind: input.action.actionKind,
    authorityRefs,
    proportionalityBasisRefs
  });
}
