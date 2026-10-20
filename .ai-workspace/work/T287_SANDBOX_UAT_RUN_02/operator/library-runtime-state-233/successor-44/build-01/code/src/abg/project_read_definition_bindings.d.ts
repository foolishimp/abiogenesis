import { type JsonValue } from "../shared/canonical_json.js";
import { type ExactDefinitionCallable } from "../shared/effect_definition.js";
import { type OwnerSemanticOutput } from "../shared/public_function_contracts.js";
import { type AbgEventResourceAssertion, type AbgEventResourceReceipt } from "./definition_event_resource.js";
import { ABG_PROJECT_READ_CONTRACTS } from "./project_read_operation_contracts.js";
import { type AbgHistoricalDeclarationProof } from "./terminal_result_contracts.js";
import { type AbgProjectReadMemberKey, type AbgProjectReadResult } from "./project_read_ports.js";
type ReopenAbgEventResourceAssertion = Extract<AbgEventResourceAssertion, {
    readonly kind: "reopen_abg_event_resource";
}>;
type ReopenAbgEventResourceReceipt = AbgEventResourceReceipt & Readonly<{
    readonly acquisitionKind: "reopen";
}>;
export interface AbgProjectReadResourceAssertion {
    readonly kind: "abg_project_read_resource_assertion";
    readonly schemaVersion: "5.0.0";
    readonly eventResource: ReopenAbgEventResourceAssertion;
    readonly declarationProof?: AbgHistoricalDeclarationProof;
}
export interface AbgProjectReadResourceReceipt {
    readonly kind: "abg_project_read_resource_receipt";
    readonly schemaVersion: "5.0.0";
    readonly eventResource: ReopenAbgEventResourceReceipt;
}
type AnyReadPacket = (typeof ABG_PROJECT_READ_CONTRACTS)[keyof typeof ABG_PROJECT_READ_CONTRACTS];
type AnyReadCallable = ExactDefinitionCallable<AnyReadPacket, AbgProjectReadResourceAssertion, AbgProjectReadResourceReceipt>;
export declare function projectAbgReadOutput(packet: AnyReadPacket, request: Readonly<Record<string, JsonValue>>, memberKey: AbgProjectReadMemberKey, native: AbgProjectReadResult): OwnerSemanticOutput<AnyReadPacket>;
export declare const ABG_PROJECT_READ_DEFINITION_BINDINGS: Readonly<{
    run_status: ExactDefinitionCallable<AnyReadPacket, AbgProjectReadResourceAssertion, AbgProjectReadResourceReceipt>;
    run_result: ExactDefinitionCallable<AnyReadPacket, AbgProjectReadResourceAssertion, AbgProjectReadResourceReceipt>;
    run_replay: ExactDefinitionCallable<AnyReadPacket, AbgProjectReadResourceAssertion, AbgProjectReadResourceReceipt>;
    run_gaps: ExactDefinitionCallable<AnyReadPacket, AbgProjectReadResourceAssertion, AbgProjectReadResourceReceipt>;
    graph_call_result: ExactDefinitionCallable<AnyReadPacket, AbgProjectReadResourceAssertion, AbgProjectReadResourceReceipt>;
    graph_call_replay: ExactDefinitionCallable<AnyReadPacket, AbgProjectReadResourceAssertion, AbgProjectReadResourceReceipt>;
    assessment_evidence?: AnyReadCallable;
    graph_call_status?: AnyReadCallable;
    run_evidence?: AnyReadCallable;
    graph_call_evidence?: AnyReadCallable;
    result_evidence?: AnyReadCallable;
    workspace_replay?: AnyReadCallable;
    interaction_replay?: AnyReadCallable;
    continuation_replay?: AnyReadCallable;
    c_call_replay?: AnyReadCallable;
    run_lawful_actions?: AnyReadCallable;
    witness_evidence?: AnyReadCallable;
    workspace_gaps?: AnyReadCallable;
}>;
export {};
