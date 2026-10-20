import * as abg from "../abg/index.js";
import { type DefinitionCall, type DefinitionHostReceipt } from "../shared/effect_definition.js";
import type { OwnerContractSourceDeclaration } from "../shared/public_function_contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
export type InstalledDefinitionCallAcquisition = Readonly<{
    readonly kind: "eventless";
}> | Readonly<{
    readonly kind: "new";
    readonly eventLogPath: string;
}> | Readonly<{
    readonly kind: "reopen";
    readonly closeHandoff: JsonValue;
}>;
export interface InstalledDefinitionCallTransportRefusal {
    readonly kind: "installed_definition_call_transport_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: "invalid_definition_call" | "unknown_definition" | "installed_binding_unavailable" | "acquisition_mismatch";
    readonly message: string;
}
export interface InstalledDefinitionCallTransportResult {
    readonly kind: "installed_definition_call_transport_result";
    readonly schemaVersion: "5.0.0";
    readonly acquisitionKind: "eventless" | "new" | "reopen" | "acquired";
    readonly receipt: DefinitionHostReceipt;
}
export type InstalledDefinitionCallTransportOutcome = InstalledDefinitionCallTransportResult | InstalledDefinitionCallTransportRefusal;
type AnyDefinitionCall = DefinitionCall<OwnerContractSourceDeclaration, unknown>;
export declare function isInstalledDefinitionCallCandidate(value: unknown): value is AnyDefinitionCall;
export declare function runInstalledDefinitionCallTransport(acquisition: InstalledDefinitionCallAcquisition, candidate: unknown): Promise<InstalledDefinitionCallTransportOutcome>;
/** Thin native carrier: semantic data is detached, while the exact owner-issued
 * physical selection survives. The same installed callable admits and executes it. */
export declare function runInstalledDefinitionCallWithResource(resource: abg.AcquiredAbgEventResourceSelection, candidate: unknown): Promise<InstalledDefinitionCallTransportOutcome>;
export {};
