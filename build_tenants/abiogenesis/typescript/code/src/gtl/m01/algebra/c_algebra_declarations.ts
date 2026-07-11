// Implements: REQ-L-GTL3-C-ALGEBRA-011/-013.

import type { SerializedJsonValue } from "../contracts/carriers.js";
import {
  constructTypedGtlExecutionDeclarationEntry,
  graphFunctionDeclarations,
  type GraphFunctionDeclarations,
  type TypedGtlExecutionDeclarationEntry
} from "../contracts/declaration_law.js";
import {
  isAdmittedCProgramDeclaration,
  serializeCProgramCanonical,
  type AdmittedCProgramDeclarationNode
} from "./c_algebra.js";

function taggedJsonValue(value: unknown): SerializedJsonValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (Array.isArray(value)) {
    const values: readonly unknown[] = value;
    return Object.freeze({
      kind: "array" as const,
      items: Object.freeze(values.map(taggedJsonValue))
    });
  }
  if (typeof value !== "object") {
    throw new TypeError("C declaration attachment accepts canonical data only");
  }
  return Object.freeze({
    kind: "object" as const,
    entries: Object.freeze(
      Object.entries(value).map(([key, entry]) =>
        Object.freeze({ key, value: taggedJsonValue(entry) })
      )
    )
  });
}

function canonicalProgramData(program: AdmittedCProgramDeclarationNode): unknown {
  if (!isAdmittedCProgramDeclaration(program)) {
    throw new TypeError(
      "C declaration attachment requires a constructor-admitted program"
    );
  }
  const parsed: unknown = JSON.parse(serializeCProgramCanonical(program));
  return parsed;
}

export function cProgramDeclarationEntry(
  program: AdmittedCProgramDeclarationNode
): TypedGtlExecutionDeclarationEntry<
  "abg.hog_program",
  {
    readonly kind: "json_blob";
    readonly value: SerializedJsonValue;
  }
> {
  return constructTypedGtlExecutionDeclarationEntry({
    key: "abg.hog_program",
    value: Object.freeze({
      kind: "json_blob",
      value: taggedJsonValue(canonicalProgramData(program))
    })
  });
}

export function cProgramGraphFunctionDeclarations(
  program: AdmittedCProgramDeclarationNode
): GraphFunctionDeclarations {
  return graphFunctionDeclarations([cProgramDeclarationEntry(program)]);
}

export function cProgramCatalogDeclarationEntry(
  programs: readonly AdmittedCProgramDeclarationNode[]
): TypedGtlExecutionDeclarationEntry<
  "abg.hog_program_catalog",
  {
    readonly kind: "json_blob";
    readonly value: SerializedJsonValue;
  }
> {
  if (programs.length === 0) {
    throw new TypeError("C program catalog must be non-empty");
  }
  return constructTypedGtlExecutionDeclarationEntry({
    key: "abg.hog_program_catalog",
    value: Object.freeze({
      kind: "json_blob",
      value: taggedJsonValue(programs.map(canonicalProgramData))
    })
  });
}
