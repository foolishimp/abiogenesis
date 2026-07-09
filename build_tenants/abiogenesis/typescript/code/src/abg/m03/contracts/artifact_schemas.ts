// Implements: T-217 Phase 1 S6 (absorbing T-213) — typed artifact
// schemas: every worker-authored FILE artifact gets ONE declared schema
// serving three duties — rendered into the worker prompt (the worker
// SEES the type it is held to), enforced at admission with typed
// corrective rejections (payload_rejected carries schemaRef + issues
// back through the retry loop), and the sole shape authority (no
// prose-only shape law at the worker boundary). Kills the dominant
// T-032 campaign bug class: concept-named, shape-unnamed contracts
// (6 of 12 ledgered defects).
//
// The dialect is deliberately CLOSED and small — the same field-rule
// vocabulary event admission already speaks, plus one array-of-rows
// member. Closed keys everywhere (the T-031 envelope-key lesson):
// unknown keys are defects, not extensions — on the WORKER PAYLOAD and
// on the DECLARATION itself (S6 codex P1).
//
// SCOPE (S6 codex P2, stated exactly): enforcement binds at the
// attached-result ingress — today's one worker file-payload ingress —
// generic over every DECLARED artifactKey; domain extractions consult
// the schema-rejection set before their row law (both existing domain
// sections are wired). Any FUTURE worker file-payload ingress must join
// this gate; "every worker-authored FILE artifact" is the standing law,
// this ingress is its current realization.
//
// REJECTION CARRIAGE (S6 codex P2, explicitly lossy at the event layer):
// payload_rejected carries schemaRef plus a MACHINE-PARSEABLE reason —
// comma-joined `issueKind:path` pairs — not a structured issue array
// (the 4.5-line carrier shape is unchanged; a structured issues field
// rides the Phase 2 EVENTS-family reprice with C-1). Consumers may rely
// on the pair grammar; the pin holds it.

import { detachRowSnapshot } from "./admission_hygiene.js";

export const ARTIFACT_FIELD_RULE_VALUES = Object.freeze([
  "non_empty_string",
  "nullable_string",
  "boolean",
  "non_negative_integer",
  "string_array"
] as const);

export type ArtifactFieldRule = (typeof ARTIFACT_FIELD_RULE_VALUES)[number];

export interface ArtifactSchemaRowSpec {
  readonly key: string;
  readonly fields: Readonly<Record<string, ArtifactFieldRule>>;
}

export interface ArtifactSchema {
  readonly schemaRef: string;
  readonly artifactKey: string;
  readonly fields: Readonly<Record<string, ArtifactFieldRule>>;
  readonly rows: ArtifactSchemaRowSpec | null;
}

export type ArtifactSchemaAdmissionIssueKind =
  | "schema_ref_invalid"
  | "artifact_key_invalid"
  | "artifact_key_duplicate"
  | "field_rule_unknown"
  | "rows_spec_invalid"
  | "unknown_key";

export interface ArtifactSchemaAdmissionIssue {
  readonly kind: "artifact_schema_admission_issue";
  readonly issueKind: ArtifactSchemaAdmissionIssueKind;
  readonly at: string;
}

export interface ArtifactSchemasAdmission {
  readonly accepted: boolean;
  readonly schemas: readonly ArtifactSchema[];
  readonly issues: readonly ArtifactSchemaAdmissionIssue[];
}

function isRuleRecord(
  value: unknown
): value is Readonly<Record<string, string>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Admission of the DECLARED schemas themselves (compile-time duty).
export function admitArtifactSchemas(
  input: readonly unknown[]
): ArtifactSchemasAdmission {
  const issues: ArtifactSchemaAdmissionIssue[] = [];
  const schemas: ArtifactSchema[] = [];
  const seenKeys = new Set<string>();
  const issue = (
    issueKind: ArtifactSchemaAdmissionIssueKind,
    at: string
  ): void => {
    issues.push(
      Object.freeze({ kind: "artifact_schema_admission_issue", issueKind, at })
    );
  };
  for (const [index, rawInput] of input.entries()) {
    const at = `artifactSchemas[${index}]`;
    const raw = detachRowSnapshot(rawInput);
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
      issue("schema_ref_invalid", at);
      continue;
    }
    const record = raw as Record<string, unknown>;
    // S6 codex P1: the declaration obeys its own law — closed keys on the
    // schema object itself. An open declaration payload (e.g. a typo'd
    // "rowz") previously admitted an EMPTY schema that then accepted {}:
    // the sole shape authority silently weakened at its own ingress.
    let declarationKeysValid = true;
    for (const key of Object.keys(record)) {
      if (!["schemaRef", "artifactKey", "fields", "rows"].includes(key)) {
        issue("unknown_key", `${at}.${key}`);
        declarationKeysValid = false;
      }
    }
    if (!declarationKeysValid) {
      continue;
    }
    const schemaRef = record["schemaRef"];
    const artifactKey = record["artifactKey"];
    if (typeof schemaRef !== "string" || schemaRef.length === 0) {
      issue("schema_ref_invalid", at);
      continue;
    }
    if (typeof artifactKey !== "string" || artifactKey.length === 0) {
      issue("artifact_key_invalid", at);
      continue;
    }
    if (seenKeys.has(artifactKey)) {
      issue("artifact_key_duplicate", `${at}.${artifactKey}`);
      continue;
    }
    const rawFields = record["fields"] ?? {};
    if (!isRuleRecord(rawFields)) {
      issue("field_rule_unknown", `${at}.fields`);
      continue;
    }
    let fieldsValid = true;
    for (const [field, rule] of Object.entries(rawFields)) {
      if (!(ARTIFACT_FIELD_RULE_VALUES as readonly string[]).includes(rule)) {
        issue("field_rule_unknown", `${at}.fields.${field}`);
        fieldsValid = false;
      }
    }
    let rows: ArtifactSchemaRowSpec | null = null;
    const rawRows = record["rows"] ?? null;
    if (rawRows !== null) {
      if (
        typeof rawRows !== "object" ||
        Array.isArray(rawRows) ||
        typeof (rawRows as Record<string, unknown>)["key"] !== "string" ||
        ((rawRows as Record<string, unknown>)["key"] as string).length === 0 ||
        !isRuleRecord((rawRows as Record<string, unknown>)["fields"])
      ) {
        issue("rows_spec_invalid", `${at}.rows`);
        continue;
      }
      let rowsKeysValid = true;
      for (const key of Object.keys(rawRows as Record<string, unknown>)) {
        if (!["key", "fields"].includes(key)) {
          issue("unknown_key", `${at}.rows.${key}`);
          rowsKeysValid = false;
        }
      }
      if (!rowsKeysValid) {
        continue;
      }
      const rowFields = (rawRows as Record<string, unknown>)[
        "fields"
      ] as Record<string, string>;
      for (const [field, rule] of Object.entries(rowFields)) {
        if (!(ARTIFACT_FIELD_RULE_VALUES as readonly string[]).includes(rule)) {
          issue("field_rule_unknown", `${at}.rows.fields.${field}`);
          fieldsValid = false;
        }
      }
      rows = Object.freeze({
        key: (rawRows as Record<string, unknown>)["key"] as string,
        fields: Object.freeze({ ...rowFields }) as Readonly<
          Record<string, ArtifactFieldRule>
        >
      });
    }
    if (!fieldsValid) {
      continue;
    }
    seenKeys.add(artifactKey);
    schemas.push(
      Object.freeze({
        schemaRef,
        artifactKey,
        fields: Object.freeze({ ...rawFields }) as Readonly<
          Record<string, ArtifactFieldRule>
        >,
        rows
      })
    );
  }
  return Object.freeze({
    accepted: issues.length === 0,
    schemas: Object.freeze(schemas),
    issues: Object.freeze(issues)
  });
}

export type ArtifactAgainstSchemaIssueKind =
  | "not_object"
  | "unknown_key"
  | "missing_field"
  | "field_invalid"
  | "rows_not_array"
  | "row_not_object"
  | "row_unknown_key"
  | "row_missing_field"
  | "row_field_invalid";

export interface ArtifactAgainstSchemaIssue {
  readonly kind: "artifact_against_schema_issue";
  readonly issueKind: ArtifactAgainstSchemaIssueKind;
  readonly path: string;
}

export interface ArtifactAgainstSchemaAdmission {
  readonly accepted: boolean;
  readonly schemaRef: string;
  readonly issues: readonly ArtifactAgainstSchemaIssue[];
}

function fieldSatisfies(rule: ArtifactFieldRule, value: unknown): boolean {
  switch (rule) {
    case "non_empty_string":
      return typeof value === "string" && value.length > 0;
    case "nullable_string":
      return value === null || typeof value === "string";
    case "boolean":
      return typeof value === "boolean";
    case "non_negative_integer":
      return Number.isInteger(value) && (value as number) >= 0;
    case "string_array":
      return (
        Array.isArray(value) &&
        value.every((entry) => typeof entry === "string")
      );
    default: {
      const exhaustive: never = rule;
      throw new TypeError(`unknown artifact field rule ${String(exhaustive)}`);
    }
  }
}

// Enforcement duty: the declared schema is the SOLE shape authority for
// the worker's artifact section — closed keys, typed field rules,
// row-level law for the array member. Hostile-object safe (D5: detach
// once, validate the snapshot).
export function admitArtifactAgainstSchema(
  value: unknown,
  schema: ArtifactSchema
): ArtifactAgainstSchemaAdmission {
  const issues: ArtifactAgainstSchemaIssue[] = [];
  const issue = (
    issueKind: ArtifactAgainstSchemaIssueKind,
    path: string
  ): void => {
    issues.push(
      Object.freeze({ kind: "artifact_against_schema_issue", issueKind, path })
    );
  };
  const detached = detachRowSnapshot(value);
  if (typeof detached !== "object" || detached === null || Array.isArray(detached)) {
    issue("not_object", schema.artifactKey);
  } else {
    const record = detached as Record<string, unknown>;
    const allowedKeys = new Set(Object.keys(schema.fields));
    if (schema.rows !== null) {
      allowedKeys.add(schema.rows.key);
    }
    for (const key of Object.keys(record)) {
      if (!allowedKeys.has(key)) {
        issue("unknown_key", `${schema.artifactKey}.${key}`);
      }
    }
    for (const [field, rule] of Object.entries(schema.fields)) {
      if (!(field in record)) {
        issue("missing_field", `${schema.artifactKey}.${field}`);
        continue;
      }
      if (!fieldSatisfies(rule, record[field])) {
        issue("field_invalid", `${schema.artifactKey}.${field}`);
      }
    }
    if (schema.rows !== null) {
      const rowsValue = record[schema.rows.key];
      if (!Array.isArray(rowsValue)) {
        issue("rows_not_array", `${schema.artifactKey}.${schema.rows.key}`);
      } else {
        const rowFields = Object.entries(schema.rows.fields);
        const rowAllowed = new Set(Object.keys(schema.rows.fields));
        rowsValue.forEach((row, index) => {
          const rowPath = `${schema.artifactKey}.${schema.rows?.key}[${index}]`;
          if (typeof row !== "object" || row === null || Array.isArray(row)) {
            issue("row_not_object", rowPath);
            return;
          }
          const rowRecord = row as Record<string, unknown>;
          for (const key of Object.keys(rowRecord)) {
            if (!rowAllowed.has(key)) {
              issue("row_unknown_key", `${rowPath}.${key}`);
            }
          }
          for (const [field, rule] of rowFields) {
            if (!(field in rowRecord)) {
              issue("row_missing_field", `${rowPath}.${field}`);
              continue;
            }
            if (!fieldSatisfies(rule, rowRecord[field])) {
              issue("row_field_invalid", `${rowPath}.${field}`);
            }
          }
        });
      }
    }
  }
  return Object.freeze({
    accepted: issues.length === 0,
    schemaRef: schema.schemaRef,
    issues: Object.freeze(issues)
  });
}

// Render duty: the worker sees EXACTLY the type it is held to.
export function renderArtifactSchemasText(
  schemas: readonly ArtifactSchema[]
): string | null {
  if (schemas.length === 0) {
    return null;
  }
  return schemas
    .map((schema) => {
      const fieldLines = Object.entries(schema.fields).map(
        ([field, rule]) => `  ${field}: ${rule}`
      );
      const rowLines =
        schema.rows === null
          ? []
          : [
              `  ${schema.rows.key}: array of rows, each EXACTLY {`,
              ...Object.entries(schema.rows.fields).map(
                ([field, rule]) => `    ${field}: ${rule}`
              ),
              "  }"
            ];
      return [
        `${schema.artifactKey} (schema ${schema.schemaRef}) — return EXACTLY this shape, closed keys, no extras:`,
        "{",
        ...fieldLines,
        ...rowLines,
        "}"
      ].join("\n");
    })
    .join("\n\n");
}
