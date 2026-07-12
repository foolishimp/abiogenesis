// Implements: REQ-L-GTL3-ATTRS-003
// Implements: REQ-L-GTL3-GRAPHFUNCTION-009
// Implements: REQ-L-GTL3-GRAPHVECTOR-005

import type {
  SerializedAttrEntry,
  SerializedAttrs,
  SerializedAttrValue
} from "./carriers.js";
import {
  canonicalizeHofApplicationDeclarationValue,
  HOF_APPLICATION_DECLARATION_KEY
} from "./hof_application.js";

export const GTL_DECLARATION_HOST_VALUES = Object.freeze([
  "graph_function",
  "graph_vector"
] as const);

export type GtlDeclarationHost =
  (typeof GTL_DECLARATION_HOST_VALUES)[number];

export type GtlDeclarationValueKind = SerializedAttrValue["kind"];

export interface GtlRegisteredDeclarationLaw {
  readonly key: string;
  readonly hosts: readonly GtlDeclarationHost[];
  readonly valueKinds: readonly GtlDeclarationValueKind[];
  readonly duplicatePolicy: "forbidden";
}

export const GTL_REGISTERED_DECLARATION_LAWS = Object.freeze([
  {
    key: "abg.consequence.allowed_traversal_families",
    hosts: ["graph_function", "graph_vector"],
    valueKinds: ["string_list"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "abg.consequence.allowed_traversals",
    hosts: ["graph_function", "graph_vector"],
    valueKinds: ["json_blob"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "abg.default_traversal_strategy",
    hosts: ["graph_function"],
    valueKinds: ["hook_ref"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "abg.edge_assurance_contract",
    hosts: ["graph_function", "graph_vector"],
    valueKinds: ["hook_ref"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "abg.fn_composition",
    hosts: ["graph_function", "graph_vector"],
    valueKinds: ["hook_ref"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "abg.fp_consciousness",
    hosts: ["graph_function", "graph_vector"],
    valueKinds: ["hook_ref"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "abg.hog_handler_bindings",
    hosts: ["graph_function"],
    valueKinds: ["json_blob"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "abg.hog_handler_configs",
    hosts: ["graph_function"],
    valueKinds: ["json_blob"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "abg.hog_program",
    hosts: ["graph_function"],
    valueKinds: ["json_blob"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "abg.hog_program_catalog",
    hosts: ["graph_function"],
    valueKinds: ["json_blob"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "abg.hog_program_ladder",
    hosts: ["graph_function"],
    valueKinds: ["json_blob"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "abg.hog_program_ref",
    hosts: ["graph_function", "graph_vector"],
    valueKinds: ["scalar"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "abg.plugin_selection",
    hosts: ["graph_function"],
    valueKinds: ["json_blob"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "abg.plugin_traversal_observer.consequence",
    hosts: ["graph_function", "graph_vector"],
    valueKinds: ["hook_ref"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "abg.plugin_traversal_observer.evaluate",
    hosts: ["graph_function", "graph_vector"],
    valueKinds: ["hook_ref"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "abg.plugin_traversal_observer.transform",
    hosts: ["graph_function", "graph_vector"],
    valueKinds: ["hook_ref"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "abg.runtime_regime",
    hosts: ["graph_vector"],
    valueKinds: ["scalar"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "abg.temporal_constraint",
    hosts: ["graph_vector"],
    valueKinds: ["hook_ref"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "abg.traversal_strategy",
    hosts: ["graph_vector"],
    valueKinds: ["hook_ref"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "gtl.hof_application",
    hosts: ["graph_function"],
    valueKinds: ["json_blob"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "gtl.target_carrier_contract",
    hosts: ["graph_vector"],
    valueKinds: ["hook_ref"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "gtl.zoom.candidate_family_ref",
    hosts: ["graph_vector"],
    valueKinds: ["scalar", "string_list"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "gtl.zoom.published_traversal_target_ref",
    hosts: ["graph_vector"],
    valueKinds: ["scalar", "string_list"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "gtl.zoom.refinement_boundary_ref",
    hosts: ["graph_vector"],
    valueKinds: ["scalar", "string_list"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "runtime_registry_candidate_refs",
    hosts: ["graph_vector"],
    valueKinds: ["string_list"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "runtime_registry_interface_ref",
    hosts: ["graph_vector"],
    valueKinds: ["scalar"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "runtime_registry_source_contract_ref",
    hosts: ["graph_vector"],
    valueKinds: ["scalar"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "runtime_registry_target_contract_ref",
    hosts: ["graph_vector"],
    valueKinds: ["scalar"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "runtime_registry_context_refs",
    hosts: ["graph_vector"],
    valueKinds: ["string_list"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "runtime_registry_authority_refs",
    hosts: ["graph_vector"],
    valueKinds: ["string_list"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "runtime_registry_overlay_refs",
    hosts: ["graph_vector"],
    valueKinds: ["string_list"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "runtime_registry_namespace_refs",
    hosts: ["graph_vector"],
    valueKinds: ["string_list"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "runtime_registry_accepted_versions",
    hosts: ["graph_vector"],
    valueKinds: ["string_list"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "runtime_registry_provenance_refs",
    hosts: ["graph_vector"],
    valueKinds: ["string_list"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "runtime_registry_readiness_refs",
    hosts: ["graph_vector"],
    valueKinds: ["string_list"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "runtime_registry_proof_refs",
    hosts: ["graph_vector"],
    valueKinds: ["string_list"],
    duplicatePolicy: "forbidden"
  },
  {
    key: "runtime_registry_policy_refs",
    hosts: ["graph_vector"],
    valueKinds: ["string_list"],
    duplicatePolicy: "forbidden"
  }
] as const satisfies readonly GtlRegisteredDeclarationLaw[]);

export const GTL_EXECUTION_DECLARATION_INTERPRETATION_OWNER =
  "abg.m03.execution_declaration_compiler" as const;

export interface GtlExecutionDeclarationLaw {
  readonly key:
    | "abg.hog_handler_bindings"
    | "abg.hog_handler_configs"
    | "abg.hog_program"
    | "abg.hog_program_catalog"
    | "abg.hog_program_ladder"
    | "abg.hog_program_ref"
    | "abg.plugin_selection";
  readonly precedenceRule:
    | "single_program_exclusive_with_catalog_mode"
    | "catalog_requires_exactly_one_selector"
    | "fixed_selector_exclusive_with_ladder"
    | "graph_function_fixed_exclusive_with_ladder_and_graph_vector_fixed_local_exact_else_graph_function_plan"
    | "ladder_selector_exclusive_with_fixed_selector"
    | "selected_program_attachment"
    | "declared_seam_conflicts_with_caller_authority";
  readonly compositionRule:
    | "no_cross_entry_composition"
    | "selects_one_catalog_member"
    | "attaches_without_program_shape_authority"
    | "merge_distinct_seams_only";
  readonly interpretationOwner:
    typeof GTL_EXECUTION_DECLARATION_INTERPRETATION_OWNER;
}

export type GtlExecutionDeclarationKey =
  GtlExecutionDeclarationLaw["key"];

const GTL_EXECUTION_DECLARATION_ENTRY: unique symbol = Symbol(
  "gtl.execution_declaration.entry"
);

export interface TypedGtlExecutionDeclarationEntry<
  Key extends GtlExecutionDeclarationKey,
  Value extends SerializedAttrValue
> extends SerializedAttrEntry {
  readonly key: Key;
  readonly value: Value;
  readonly [GTL_EXECUTION_DECLARATION_ENTRY]: true;
}

// Internal constructor used by published key-specific builders. It is not
// re-exported from the package contract barrel.
export function constructTypedGtlExecutionDeclarationEntry<
  const Key extends GtlExecutionDeclarationKey,
  const Value extends SerializedAttrValue
>(input: {
  readonly key: Key;
  readonly value: Value;
}): TypedGtlExecutionDeclarationEntry<Key, Value> {
  const law = GTL_REGISTERED_DECLARATION_LAWS.find(
    (candidate) => candidate.key === input.key
  );
  if (
    law === undefined ||
    !law.valueKinds.some((kind): boolean => kind === input.value.kind)
  ) {
    throw new TypeError(
      `${input.key} does not admit value kind ${input.value.kind}`
    );
  }
  const entry: TypedGtlExecutionDeclarationEntry<Key, Value> = {
    key: input.key,
    value: input.value,
    [GTL_EXECUTION_DECLARATION_ENTRY]: true
  };
  Object.defineProperty(entry, GTL_EXECUTION_DECLARATION_ENTRY, {
    enumerable: false
  });
  return Object.freeze(entry);
}

export const GTL_EXECUTION_DECLARATION_LAWS = Object.freeze([
  {
    key: "abg.hog_program",
    precedenceRule: "single_program_exclusive_with_catalog_mode",
    compositionRule: "no_cross_entry_composition",
    interpretationOwner: GTL_EXECUTION_DECLARATION_INTERPRETATION_OWNER
  },
  {
    key: "abg.hog_program_catalog",
    precedenceRule: "catalog_requires_exactly_one_selector",
    compositionRule: "no_cross_entry_composition",
    interpretationOwner: GTL_EXECUTION_DECLARATION_INTERPRETATION_OWNER
  },
  {
    key: "abg.hog_program_ref",
    precedenceRule:
      "graph_function_fixed_exclusive_with_ladder_and_graph_vector_fixed_local_exact_else_graph_function_plan",
    compositionRule: "selects_one_catalog_member",
    interpretationOwner: GTL_EXECUTION_DECLARATION_INTERPRETATION_OWNER
  },
  {
    key: "abg.hog_program_ladder",
    precedenceRule: "ladder_selector_exclusive_with_fixed_selector",
    compositionRule: "selects_one_catalog_member",
    interpretationOwner: GTL_EXECUTION_DECLARATION_INTERPRETATION_OWNER
  },
  {
    key: "abg.hog_handler_bindings",
    precedenceRule: "selected_program_attachment",
    compositionRule: "attaches_without_program_shape_authority",
    interpretationOwner: GTL_EXECUTION_DECLARATION_INTERPRETATION_OWNER
  },
  {
    key: "abg.hog_handler_configs",
    precedenceRule: "selected_program_attachment",
    compositionRule: "attaches_without_program_shape_authority",
    interpretationOwner: GTL_EXECUTION_DECLARATION_INTERPRETATION_OWNER
  },
  {
    key: "abg.plugin_selection",
    precedenceRule: "declared_seam_conflicts_with_caller_authority",
    compositionRule: "merge_distinct_seams_only",
    interpretationOwner: GTL_EXECUTION_DECLARATION_INTERPRETATION_OWNER
  }
] as const satisfies readonly GtlExecutionDeclarationLaw[]);

export function registeredGtlExecutionDeclarationLaw(
  key: string
): GtlExecutionDeclarationLaw | null {
  return (
    GTL_EXECUTION_DECLARATION_LAWS.find((law) => law.key === key) ?? null
  );
}

export type GtlRegisteredDeclarationKey =
  (typeof GTL_REGISTERED_DECLARATION_LAWS)[number]["key"];

type RegisteredDeclarationLaw =
  (typeof GTL_REGISTERED_DECLARATION_LAWS)[number];

export type GtlRegisteredDeclarationKeyForHostAndKind<
  Host extends GtlDeclarationHost,
  Kind extends GtlDeclarationValueKind
> = RegisteredDeclarationLaw extends infer Law
  ? Law extends RegisteredDeclarationLaw
    ? Host extends Law["hosts"][number]
      ? Kind extends Law["valueKinds"][number]
        ? Law["key"]
        : never
      : never
    : never
  : never;

type RegisteredEntryForLaw<
  Host extends GtlDeclarationHost,
  Law extends RegisteredDeclarationLaw
> = Host extends Law["hosts"][number]
  ? Law["key"] extends GtlExecutionDeclarationKey
    ? TypedGtlExecutionDeclarationEntry<
        Law["key"],
        Extract<
          SerializedAttrValue,
          { readonly kind: Law["valueKinds"][number] }
        >
      >
    : {
        readonly key: Law["key"];
        readonly value: Extract<
          SerializedAttrValue,
          { readonly kind: Law["valueKinds"][number] }
        >;
      }
  : never;

export type RegisteredGtlDeclarationEntry<
  Host extends GtlDeclarationHost
> = RegisteredDeclarationLaw extends infer Law
  ? Law extends RegisteredDeclarationLaw
    ? RegisteredEntryForLaw<Host, Law>
    : never
  : never;

type ReservedDeclarationKey = `abg.${string}` | `gtl.${string}`;

type ValidDeclarationEntry<
  Host extends GtlDeclarationHost,
  Entry extends SerializedAttrEntry
> = Entry["key"] extends GtlRegisteredDeclarationKey
  ? Entry extends RegisteredGtlDeclarationEntry<Host>
    ? Entry
    : never
  : Entry["key"] extends ReservedDeclarationKey
    ? never
    : Entry;

type ValidDeclarationEntries<
  Host extends GtlDeclarationHost,
  Entries extends readonly SerializedAttrEntry[]
> = {
  readonly [Index in keyof Entries]: Entries[Index] extends SerializedAttrEntry
    ? ValidDeclarationEntry<Host, Entries[Index]>
    : never;
};

type DuplicateDeclarationKey<
  Entries extends readonly SerializedAttrEntry[],
  Seen extends string = never
> = Entries extends readonly [
  infer First extends SerializedAttrEntry,
  ...infer Rest extends readonly SerializedAttrEntry[]
]
  ? First["key"] extends Seen
    ? First["key"]
    : DuplicateDeclarationKey<Rest, Seen | First["key"]>
  : never;

type NoDuplicateDeclarationKeys<
  Entries extends readonly SerializedAttrEntry[]
> = DuplicateDeclarationKey<Entries> extends never ? unknown : never;

const GTL_DECLARATION_HOST = Symbol("gtl.declaration.host");

export interface HostedGtlDeclarations<Host extends GtlDeclarationHost>
  extends SerializedAttrs {
  /** @hidden */
  readonly [GTL_DECLARATION_HOST]: Host;
}

export type GraphFunctionDeclarations =
  HostedGtlDeclarations<"graph_function">;

export type GraphVectorDeclarations = HostedGtlDeclarations<"graph_vector">;

export const GTL_DECLARATION_LAW_VIOLATION_KIND_VALUES = Object.freeze([
  "duplicate_key",
  "unregistered_reserved_key",
  "host_mismatch",
  "value_kind_mismatch",
  "value_constraint_mismatch"
] as const);

export type GtlDeclarationLawViolationKind =
  (typeof GTL_DECLARATION_LAW_VIOLATION_KIND_VALUES)[number];

export interface GtlDeclarationLawViolation {
  readonly kind: GtlDeclarationLawViolationKind;
  readonly host: GtlDeclarationHost;
  readonly key: string;
  readonly actualValueKind: GtlDeclarationValueKind;
  readonly expectedValueKinds: readonly GtlDeclarationValueKind[];
  readonly message: string;
}

function isReservedDeclarationKey(key: string): boolean {
  return key.startsWith("abg.") || key.startsWith("gtl.");
}

export function registeredGtlDeclarationLaw(
  key: string
): GtlRegisteredDeclarationLaw | null {
  return (
    GTL_REGISTERED_DECLARATION_LAWS.find((law) => law.key === key) ?? null
  );
}

export function gtlDeclarationValueForKey<
  Host extends GtlDeclarationHost,
  Kind extends GtlDeclarationValueKind
>(
  attrs: HostedGtlDeclarations<Host>,
  key: GtlRegisteredDeclarationKeyForHostAndKind<Host, Kind>,
  kind: Kind
): SerializedAttrValue | null {
  const entry = attrs.entries.find((candidate) => candidate.key === key);
  if (entry === undefined) {
    return null;
  }
  if (entry.value.kind !== kind) {
    throw new TypeError(
      `declaration ${JSON.stringify(key)} must use ${kind}, received ${entry.value.kind}`
    );
  }
  return entry.value;
}

export function inspectGtlHostDeclarations(input: {
  readonly host: GtlDeclarationHost;
  readonly attrs: SerializedAttrs;
}): readonly GtlDeclarationLawViolation[] {
  const violations: GtlDeclarationLawViolation[] = [];
  const keyCounts = new Map<string, number>();
  for (const entry of input.attrs.entries) {
    keyCounts.set(entry.key, (keyCounts.get(entry.key) ?? 0) + 1);
    const law = registeredGtlDeclarationLaw(entry.key);
    if (law === null) {
      if (isReservedDeclarationKey(entry.key)) {
        violations.push(
          Object.freeze({
            kind: "unregistered_reserved_key",
            host: input.host,
            key: entry.key,
            actualValueKind: entry.value.kind,
            expectedValueKinds: Object.freeze([]),
            message: `${input.host} declaration ${JSON.stringify(entry.key)} uses the reserved abg./gtl. namespace without a registered declaration law`
          })
        );
      }
      continue;
    }
    if (!law.hosts.some((host) => host === input.host)) {
      violations.push(
        Object.freeze({
          kind: "host_mismatch",
          host: input.host,
          key: entry.key,
          actualValueKind: entry.value.kind,
          expectedValueKinds: law.valueKinds,
          message: `${JSON.stringify(entry.key)} is not registered for ${input.host}; admitted hosts: ${law.hosts.join(", ")}`
        })
      );
    }
    if (!law.valueKinds.some((valueKind) => valueKind === entry.value.kind)) {
      violations.push(
        Object.freeze({
          kind: "value_kind_mismatch",
          host: input.host,
          key: entry.key,
          actualValueKind: entry.value.kind,
          expectedValueKinds: law.valueKinds,
          message: `${input.host} declaration ${JSON.stringify(entry.key)} must use ${law.valueKinds.join(" or ")}, received ${entry.value.kind}`
        })
      );
    }
    if (
      input.host === "graph_vector" &&
      entry.key === "abg.hog_program_ref" &&
      entry.value.kind === "scalar" &&
      (typeof entry.value.value !== "string" || entry.value.value.length === 0)
    ) {
      violations.push(
        Object.freeze({
          kind: "value_constraint_mismatch",
          host: input.host,
          key: entry.key,
          actualValueKind: entry.value.kind,
          expectedValueKinds: law.valueKinds,
          message:
            "gtl-c-vector-program-empty-ref: graph_vector abg.hog_program_ref must be a non-empty string"
        })
      );
    }
  }
  for (const [key, count] of keyCounts) {
    if (count <= 1) {
      continue;
    }
    const first = input.attrs.entries.find((entry) => entry.key === key);
    if (first === undefined) {
      continue;
    }
    violations.push(
      Object.freeze({
        kind: "duplicate_key",
        host: input.host,
        key,
        actualValueKind: first.value.kind,
        expectedValueKinds:
          registeredGtlDeclarationLaw(key)?.valueKinds ?? Object.freeze([]),
        message: `${input.host} declaration ${JSON.stringify(key)} is declared ${String(count)} times; duplicate declaration authority fails closed`
      })
    );
  }
  return Object.freeze(violations);
}

function constructHostedDeclarations<Host extends GtlDeclarationHost>(
  host: Host,
  entries: readonly SerializedAttrEntry[]
): HostedGtlDeclarations<Host> {
  const normalizedEntries = entries.map((entry) => {
    if (
      host !== "graph_function" ||
      entry.key !== HOF_APPLICATION_DECLARATION_KEY ||
      entry.value.kind !== "json_blob"
    ) {
      return entry;
    }
    return Object.freeze({
      key: entry.key,
      value: Object.freeze({
        kind: "json_blob" as const,
        value: canonicalizeHofApplicationDeclarationValue(
          entry.value.value,
          `graph_function.${HOF_APPLICATION_DECLARATION_KEY}`
        )
      })
    });
  });
  const attrs = Object.freeze({
    entries: Object.freeze(normalizedEntries)
  });
  const violations = inspectGtlHostDeclarations({ host, attrs });
  if (violations.length > 0) {
    throw new TypeError(
      violations.map((violation) => violation.message).join("; ")
    );
  }
  const hosted = {
    entries: attrs.entries,
    [GTL_DECLARATION_HOST]: host
  };
  Object.defineProperty(hosted, GTL_DECLARATION_HOST, { enumerable: false });
  return Object.freeze(hosted);
}

export function graphFunctionDeclarations<
  const Entries extends readonly SerializedAttrEntry[]
>(
  entries: Entries &
    ValidDeclarationEntries<"graph_function", Entries> &
    NoDuplicateDeclarationKeys<Entries>
): GraphFunctionDeclarations {
  return constructHostedDeclarations("graph_function", entries);
}

export function graphVectorDeclarations<
  const Entries extends readonly SerializedAttrEntry[]
>(
  entries: Entries &
    ValidDeclarationEntries<"graph_vector", Entries> &
    NoDuplicateDeclarationKeys<Entries>
): GraphVectorDeclarations {
  return constructHostedDeclarations("graph_vector", entries);
}

export function admitGraphFunctionDeclarations(
  attrs: SerializedAttrs
): GraphFunctionDeclarations {
  return constructHostedDeclarations("graph_function", attrs.entries);
}

export function admitGraphVectorDeclarations(
  attrs: SerializedAttrs
): GraphVectorDeclarations {
  return constructHostedDeclarations("graph_vector", attrs.entries);
}

const EMPTY_GRAPH_FUNCTION_DECLARATIONS = graphFunctionDeclarations([]);
const EMPTY_GRAPH_VECTOR_DECLARATIONS = graphVectorDeclarations([]);

export function emptyGraphFunctionDeclarations(): GraphFunctionDeclarations {
  return EMPTY_GRAPH_FUNCTION_DECLARATIONS;
}

export function emptyGraphVectorDeclarations(): GraphVectorDeclarations {
  return EMPTY_GRAPH_VECTOR_DECLARATIONS;
}
