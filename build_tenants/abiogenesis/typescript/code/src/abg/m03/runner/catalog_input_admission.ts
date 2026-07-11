// Implements: T-223 DS-1 catalog GraphFunction input admission
// Implements: REQ-P-CATALOG-011

import { Ajv, type ErrorObject } from "ajv";
import { Ajv2020 } from "ajv/dist/2020.js";

import {
  admitIJsonValue,
  type IJsonValue
} from "../../../shared/runtime_identity.js";

export interface CatalogInputSchemaIssue {
  readonly kind: "catalog_input_schema_issue";
  readonly instancePath: string;
  readonly schemaPath: string;
  readonly keyword: string;
  readonly message: string;
}

export interface CatalogInputSchemaAdmission {
  readonly kind: "catalog_input_schema_admission";
  readonly accepted: boolean;
  readonly issues: readonly CatalogInputSchemaIssue[];
}

function schemaRecord(
  schema: IJsonValue
): Readonly<Record<string, unknown>> | null {
  return typeof schema === "object" && schema !== null && !Array.isArray(schema)
    ? Object.fromEntries(Object.entries(schema))
    : null;
}

function issueFromError(error: ErrorObject): CatalogInputSchemaIssue {
  return Object.freeze({
    kind: "catalog_input_schema_issue",
    instancePath: error.instancePath,
    schemaPath: error.schemaPath,
    keyword: error.keyword,
    message: error.message ?? "input does not satisfy the published schema"
  });
}

function schemaFailure(message: string): CatalogInputSchemaAdmission {
  return Object.freeze({
    kind: "catalog_input_schema_admission",
    accepted: false,
    issues: Object.freeze([
      Object.freeze({
        kind: "catalog_input_schema_issue",
        instancePath: "",
        schemaPath: "",
        keyword: "schema",
        message
      })
    ])
  });
}

export function admitCatalogGraphFunctionInput(input: {
  readonly schema: IJsonValue;
  readonly value: IJsonValue;
}): CatalogInputSchemaAdmission {
  let admittedSchema: IJsonValue;
  let admittedValue: IJsonValue;
  try {
    admittedSchema = admitIJsonValue(input.schema);
    admittedValue = admitIJsonValue(input.value);
  } catch (error: unknown) {
    return schemaFailure(
      error instanceof Error ? error.message : "catalog input is not valid I-JSON"
    );
  }
  const schema = schemaRecord(admittedSchema);
  if (schema === null) {
    return schemaFailure("published input schema must be a JSON object");
  }
  try {
    const dialect = schema["$schema"];
    const ajv = dialect === "https://json-schema.org/draft/2020-12/schema"
      ? new Ajv2020({ allErrors: true, strict: true })
      : new Ajv({ allErrors: true, strict: true });
    const validate = ajv.compile(schema);
    const accepted = validate(admittedValue);
    return Object.freeze({
      kind: "catalog_input_schema_admission",
      accepted,
      issues: Object.freeze((validate.errors ?? []).map(issueFromError))
    });
  } catch (error: unknown) {
    return schemaFailure(
      error instanceof Error ? error.message : "published input schema is invalid"
    );
  }
}
