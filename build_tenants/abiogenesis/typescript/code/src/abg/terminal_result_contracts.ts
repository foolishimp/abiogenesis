import * as v from "valibot";
import type { ReadyGraphFunctionCatalog, GraphFunctionCatalogView } from "../product/catalog.js";
import { jsonValueSchema, nonblankSchema, refDigestSchema } from "../shared/public_function_contracts.js";

/** This is an output carrier, not an admission or an independent result ledger. */
export const ABG_TYPED_TERMINAL_RESULT_SCHEMA = v.strictObject({
  kind: v.literal("abg_typed_terminal_result"),
  schemaVersion: v.literal("5.0.0"),
  result: refDigestSchema,
  contract: refDigestSchema,
  valueKind: nonblankSchema,
  valueDigest: refDigestSchema.entries.digest,
  value: jsonValueSchema,
  producer: v.strictObject({
    runRef: nonblankSchema,
    graphCallRef: nonblankSchema,
    invocationAdmissionRef: nonblankSchema,
    program: refDigestSchema,
    graphFunction: refDigestSchema,
    executionBasis: refDigestSchema,
    cCallRef: nonblankSchema,
    resultAdmissionEventRef: nonblankSchema,
    judgmentRef: nonblankSchema,
    judgmentAdmissionEventRef: nonblankSchema,
    terminalRoute: refDigestSchema,
  }),
  projectionBasis: refDigestSchema,
});

export type AbgTypedTerminalResult = v.InferOutput<typeof ABG_TYPED_TERMINAL_RESULT_SCHEMA>;

export function isAbgTypedTerminalResult(value: unknown): value is AbgTypedTerminalResult {
  return v.safeParse(ABG_TYPED_TERMINAL_RESULT_SCHEMA, value).success;
}

/** Untrusted, immutable declaration evidence. Only the native projector can
 * join these bytes to the historical WorkspaceBinding, Catalog and Run. */
export interface AbgHistoricalDeclarationProof {
  readonly kind: "abg_historical_declaration_proof";
  readonly schemaVersion: "5.0.0";
  readonly catalog: ReadyGraphFunctionCatalog;
  readonly catalogView: GraphFunctionCatalogView;
}

export const ABG_HISTORICAL_DECLARATION_PROOF_SCHEMA = v.strictObject({
  kind: v.literal("abg_historical_declaration_proof"),
  schemaVersion: v.literal("5.0.0"),
  catalog: jsonValueSchema,
  catalogView: jsonValueSchema,
}) as unknown as v.GenericSchema<AbgHistoricalDeclarationProof, AbgHistoricalDeclarationProof>;

export function isAbgHistoricalDeclarationProof(value: unknown): value is AbgHistoricalDeclarationProof {
  return v.safeParse(ABG_HISTORICAL_DECLARATION_PROOF_SCHEMA, value).success;
}
