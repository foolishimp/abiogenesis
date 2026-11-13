// T287 HC1 owner-derived native call typing and the HC2 shipped constructor
// types. Compiler proof only: canonical package declarations, no source or
// private import, no cast that erases the relation. Each negative is one
// statement on the line after its marker; the marker names the diagnostic
// codes that make the case a real refusal.
import {
  constructInstalledPendingCall,
  constructInstalledPublicDefinitionCall,
  constructInstalledRunReadCall,
  constructInstalledStartCall,
  runInstalledDefinitionCallTransport,
  type InstalledDefinitionCallAcquisition,
  type InstalledDefinitionCallTransportOutcome,
  type InstalledDefinitionCallTransportOutcomeOf,
  type InstalledDefinitionCallTransportRefusal,
  type InstalledPublicDefinitionCall,
  type InstalledPublicDefinitionCallEnvironment,
  type InstalledPublicDefinitionCallSelection,
  type OwnerCallableDefinitionMember,
  type OwnerDefinitionCompositeKey,
  type OwnerDefinitionMember,
  type OwnerDefinitionRequestOf,
  type OwnerUnavailableDefinitionMember,
} from "@abiogenesis/typescript-tenant/public";
import type {
  ExactDirectRunInvocationRequest,
  ExactStartRunInvocationRequest,
  ProductRunInvocationSelectionIntent,
  RunContinuationSelectionIntent,
} from "@abiogenesis/typescript-tenant/product";
import type { AbgRunReadMemberKey } from "@abiogenesis/typescript-tenant/abg";

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2) ? true : false;
type Mutual<A, B> = [A] extends [B] ? [B] extends [A] ? true : false : false;
type IsAny<T> = 0 extends 1 & T ? true : false;
type IsOpen<T> = IsAny<T> extends true ? true : unknown extends T ? true : false;
type Assert<T extends true> = T;
type Distinct<T extends readonly unknown[], Seen = never> = T extends
  readonly [infer H, ...infer R] ? [H] extends [Seen] ? false : Distinct<R, Seen | H>
  : true;

// Finite oracle: the declared packet members and the members without an
// installed callable binding.
const DECLARED = [
  "abg.operation.catalog.admit#admit",
  "abg.operation.catalog.apply#node_type",
  "abg.operation.catalog.apply#overlay",
  "abg.operation.catalog.view#allowlist",
  "abg.operation.conformance.evaluate#gtl_program",
  "abg.operation.interaction.respond#answer_escalation",
  "abg.operation.interaction.respond#approve",
  "abg.operation.interaction.respond#assess",
  "abg.operation.interaction.respond#reject",
  "abg.operation.interaction.respond#select",
  "abg.operation.product.install#install",
  "abg.operation.product.materialize#configuration",
  "abg.operation.product.materialize#context_bootstrap",
  "abg.operation.product.resolve#resolve",
  "abg.operation.product.verify#verify",
  "abg.operation.project.read#assessment_evidence",
  "abg.operation.project.read#c_call_replay",
  "abg.operation.project.read#catalog_describe",
  "abg.operation.project.read#catalog_list",
  "abg.operation.project.read#continuation_replay",
  "abg.operation.project.read#graph_call_evidence",
  "abg.operation.project.read#graph_call_replay",
  "abg.operation.project.read#graph_call_result",
  "abg.operation.project.read#graph_call_status",
  "abg.operation.project.read#install_evidence",
  "abg.operation.project.read#interaction_replay",
  "abg.operation.project.read#release_evidence",
  "abg.operation.project.read#result_evidence",
  "abg.operation.project.read#run_evidence",
  "abg.operation.project.read#run_gaps",
  "abg.operation.project.read#run_lawful_actions",
  "abg.operation.project.read#run_replay",
  "abg.operation.project.read#run_result",
  "abg.operation.project.read#run_status",
  "abg.operation.project.read#ticket_consensus",
  "abg.operation.project.read#witness_evidence",
  "abg.operation.project.read#workspace_gaps",
  "abg.operation.project.read#workspace_replay",
  "abg.operation.project.read#workspace_status",
  "abg.operation.release.snapshot#published_rc",
  "abg.operation.release.snapshot#tapped_release",
  "abg.operation.result.assess#assess",
  "abg.operation.run.continue#current_intent",
  "abg.operation.run.continue#selected_action",
  "abg.operation.run.invoke#invoke",
  "abg.operation.run.invoke#start",
  "abg.operation.witness.admit#attest",
  "abg.operation.witness.admit#hygiene-stamp",
  "abg.operation.witness.admit#intake",
  "abg.operation.witness.admit#reprice",
  "abg.operation.witness.admit#run-resumed",
  "abg.operation.witness.admit#run-stopped",
  "abg.operation.workspace.bind#bind",
  "abg.operation.workspace.create#clean",
  "abg.operation.workspace.create#imported",
  "abg.operation.workspace.open#open",
] as const;
const UNAVAILABLE = [
  "abg.operation.interaction.respond#answer_escalation",
  "abg.operation.interaction.respond#approve",
  "abg.operation.interaction.respond#assess",
  "abg.operation.interaction.respond#reject",
  "abg.operation.interaction.respond#select",
  "abg.operation.project.read#run_gaps",
  "abg.operation.project.read#run_lawful_actions",
  "abg.operation.project.read#ticket_consensus",
  "abg.operation.project.read#workspace_gaps",
  "abg.operation.run.continue#selected_action",
  "abg.operation.witness.admit#attest",
  "abg.operation.witness.admit#hygiene-stamp",
  "abg.operation.witness.admit#intake",
  "abg.operation.witness.admit#run-resumed",
] as const;
type Declared = (typeof DECLARED)[number];
type Unavailable = (typeof UNAVAILABLE)[number];
type CallableKey = OwnerDefinitionCompositeKey<OwnerCallableDefinitionMember>;

export type FamilyProof = [
  Assert<Equal<(typeof DECLARED)["length"], 56>>,
  Assert<Distinct<typeof DECLARED>>,
  Assert<Equal<(typeof UNAVAILABLE)["length"], 14>>,
  Assert<Distinct<typeof UNAVAILABLE>>,
  Assert<Equal<Exclude<Unavailable, Declared>, never>>,
  Assert<Equal<OwnerDefinitionCompositeKey, Declared>>,
  Assert<Equal<OwnerDefinitionCompositeKey<OwnerUnavailableDefinitionMember>, Unavailable>>,
  // 56 - 14 = 42 callable members.
  Assert<Equal<CallableKey, Exclude<Declared, Unavailable>>>,
  Assert<Equal<OwnerUnavailableDefinitionMember["binding"], { readonly kind: "installed_binding_unavailable" }>>,
];

type MemberOf<K extends string> = OwnerDefinitionMember extends infer M
  ? M extends OwnerDefinitionMember ? OwnerDefinitionCompositeKey<M> extends K ? M : never
  : never
  : never;
type CallableMemberOf<K extends CallableKey> = Extract<MemberOf<K>, OwnerCallableDefinitionMember>;
type SelectionOf<K extends CallableKey> = InstalledPublicDefinitionCallSelection<CallableMemberOf<K>>;
type CallOf<K extends CallableKey> = SelectionOf<K> extends
  infer S extends InstalledPublicDefinitionCallSelection ? InstalledPublicDefinitionCall<S> : never;
type ReceiptOf<K extends CallableKey> = Extract<
  InstalledDefinitionCallTransportOutcomeOf<CallOf<K>>,
  { readonly kind: "installed_definition_call_transport_result" }
>["receipt"];

// Every callable member couples its owner request, its actual callable
// resource assertion and its exact owner/resource receipt. Each distributed
// request variant is an owner request; coverage of split members is below.
type PairHolds<M extends OwnerCallableDefinitionMember> = [
  Mutual<
    InstalledDefinitionCallTransportOutcomeOf<
      InstalledPublicDefinitionCall<InstalledPublicDefinitionCallSelection<M>>
    >,
    InstalledDefinitionCallTransportOutcome<M["packet"], M["binding"]["resourceReceipt"]>
  >,
  Equal<InstalledPublicDefinitionCallSelection<M>["resources"], M["binding"]["resources"]>,
  [InstalledPublicDefinitionCallSelection<M>["request"]] extends [OwnerDefinitionRequestOf<M>] ? true : false,
  IsOpen<M["binding"]["resources"]> extends false ? true : false,
  IsOpen<M["binding"]["resourceReceipt"]> extends false ? true : false,
  IsOpen<OwnerDefinitionRequestOf<M>> extends false ? true : false,
] extends [true, true, true, true, true, true] ? true : false;
export type PairProof = Assert<Equal<{ readonly [K in CallableKey]: PairHolds<CallableMemberOf<K>> }[CallableKey], true>>;

type StartMember = CallableMemberOf<"abg.operation.run.invoke#start">;
type RunStatusMember = CallableMemberOf<"abg.operation.project.read#run_status">;
type DirectMember = CallableMemberOf<"abg.operation.run.invoke#invoke">;
export type RunAliasProof = [
  Assert<Mutual<ExactStartRunInvocationRequest, OwnerDefinitionRequestOf<StartMember>>>,
  Assert<Mutual<ExactDirectRunInvocationRequest, OwnerDefinitionRequestOf<DirectMember>>>,
];

type StartSelection = SelectionOf<"abg.operation.run.invoke#start">;
type StartGraph = Extract<StartSelection, { readonly request: { readonly target: { readonly kind: "graph_function" } } }>;
type StartNext = Extract<StartSelection, { readonly request: { readonly target: { readonly kind: "next" } } }>;
type VerifySelection = SelectionOf<"abg.operation.product.verify#verify">;
type VerifyInstalled = Extract<VerifySelection, { readonly request: { readonly targetKind: "installed_artifact" } }>;
type VerifyPacked = Exclude<VerifySelection, VerifyInstalled>;
type CurrentSelection = SelectionOf<"abg.operation.run.continue#current_intent">;
type PendingExecution = Extract<CurrentSelection, { readonly request: { readonly pendingCursor: unknown } }>;
type RunStopped = SelectionOf<"abg.operation.witness.admit#run-stopped">;
type Reprice = SelectionOf<"abg.operation.witness.admit#reprice">;
type RunReplay = SelectionOf<"abg.operation.project.read#run_replay">;
type CCallReplay = SelectionOf<"abg.operation.project.read#c_call_replay">;
type RunStatus = SelectionOf<"abg.operation.project.read#run_status">;
type ProductCatalogList = SelectionOf<"abg.operation.project.read#catalog_list">;

type VerifyMember = CallableMemberOf<"abg.operation.product.verify#verify">;
// Target-conditional slots follow the distributed request variant, and the
// distributed variants cover each split owner request.
export type SlotProof = [
  Assert<Equal<StartSelection["request"]["target"]["kind"], OwnerDefinitionRequestOf<StartMember>["target"]["kind"]>>,
  Assert<Equal<VerifySelection["request"]["targetKind"], OwnerDefinitionRequestOf<VerifyMember>["targetKind"]>>,
  // current_intent admits the pending-execution request only.
  Assert<Equal<CurrentSelection, PendingExecution>>,
  Assert<Equal<[Extract<CurrentSelection, { readonly request: { readonly currentIntent: unknown } }>] extends [never] ? true : false, true>>,
  Assert<IsOpen<StartGraph> extends false ? true : false>,
  Assert<Equal<StartNext["slots"]["graph_function"], null>>,
  Assert<Equal<StartGraph["slots"]["graph_function"] extends null ? true : false, false>>,
  Assert<Equal<VerifyPacked["slots"]["dependency_lock"], null>>,
  Assert<Equal<VerifyInstalled["slots"]["dependency_lock"] extends null ? true : false, false>>,
  Assert<Equal<Reprice["slots"]["execution_basis"], null>>,
  Assert<Equal<RunStopped["slots"]["execution_basis"] extends null ? true : false, false>>,
];

type ResultValue<K extends CallableKey> = Extract<NonNullable<ReceiptOf<K>["ownerOutput"]>, { readonly outcomeKind: "result" }>["value"];
// Owner outputs keep each member's own variant.
export type OutputProof = [
  Assert<Equal<NonNullable<ReceiptOf<"abg.operation.run.invoke#start">["ownerOutput"]>["outcomeKind"], "result" | "refusal" | "nonterminal">>,
  Assert<Equal<NonNullable<ReceiptOf<"abg.operation.project.read#run_status">["ownerOutput"]>["outcomeKind"], "result" | "refusal">>,
  Assert<Equal<ResultValue<"abg.operation.project.read#run_status">["projection"]["kind"], "run_status_projection">>,
  Assert<Equal<ResultValue<"abg.operation.project.read#graph_call_replay">["projection"]["kind"], "graph_call_replay_projection">>,
  Assert<Equal<ResultValue<"abg.operation.run.continue#current_intent">["admittedIntent"], null>>,
  Assert<Equal<ResultValue<"abg.operation.run.continue#current_intent">["continuationKind"], "pending_execution">>,
  Assert<Equal<ReceiptOf<"abg.operation.run.invoke#start">["exitCode"], 0 | 1 | 3 | 70>>,
  Assert<Equal<ReceiptOf<"abg.operation.run.invoke#start">["resources"], StartMember["binding"]["resourceReceipt"] | null>>,
];

// Unavailable members are only refused; raw input keeps the raw outcome and
// every existing transport refusal code.
type UnavailableCandidate = { readonly invocation: { readonly definitionKey: { readonly operationId: "abg.operation.witness.admit"; readonly memberKey: "attest" } }; readonly resources: {} };
type SelectedActionCandidate = { readonly invocation: { readonly definitionKey: { readonly operationId: "abg.operation.run.continue"; readonly memberKey: "selected_action" } }; readonly resources: {} };
export type RefusalProof = [
  Assert<Equal<InstalledDefinitionCallTransportOutcomeOf<UnavailableCandidate>, InstalledDefinitionCallTransportRefusal>>,
  Assert<Equal<InstalledDefinitionCallTransportOutcomeOf<SelectedActionCandidate>, InstalledDefinitionCallTransportRefusal>>,
  Assert<Equal<InstalledDefinitionCallTransportOutcomeOf<unknown>, InstalledDefinitionCallTransportOutcome>>,
  Assert<Equal<InstalledDefinitionCallTransportRefusal["code"],
    "invalid_definition_call" | "unknown_definition" | "installed_binding_unavailable" | "acquisition_mismatch">>,
];

declare const environment: InstalledPublicDefinitionCallEnvironment;
declare const acquisition: InstalledDefinitionCallAcquisition;
declare const raw: unknown;
declare const startGraph: StartGraph;
declare const startNext: StartNext;
declare const direct: SelectionOf<"abg.operation.run.invoke#invoke">;
declare const verifyInstalled: VerifyInstalled;
declare const verifyPacked: VerifyPacked;
declare const pendingExecution: PendingExecution;
declare const runStopped: RunStopped;
declare const reprice: Reprice;
declare const runReplay: RunReplay;
declare const cCallReplay: CCallReplay;
declare const runStatus: RunStatus;
declare const productCatalogList: ProductCatalogList;

export const startCall = constructInstalledPublicDefinitionCall({ ...environment, operationId: "abg.operation.run.invoke", memberKey: "start", request: startGraph.request, slots: startGraph.slots, resources: startGraph.resources });
export const nextCall = constructInstalledPublicDefinitionCall({ ...environment, operationId: "abg.operation.run.invoke", memberKey: "start", request: startNext.request, slots: startNext.slots, resources: startNext.resources });
export const directCall = constructInstalledPublicDefinitionCall({ ...environment, ...direct });
export const verifyCalls = [
  constructInstalledPublicDefinitionCall({ ...environment, ...verifyInstalled }),
  constructInstalledPublicDefinitionCall({ ...environment, ...verifyPacked }),
] as const;
export const continueCalls = [
  constructInstalledPublicDefinitionCall({ ...environment, ...pendingExecution }),
] as const;
export const runStoppedCall = constructInstalledPublicDefinitionCall({ ...environment, ...runStopped });
export const runStatusCall = constructInstalledPublicDefinitionCall({ ...environment, ...runStatus });

export type ConstructionProof = [
  Assert<Equal<typeof startCall.invocation.definitionKey["memberKey"], "start">>,
  Assert<Equal<typeof startCall.resources, StartMember["binding"]["resources"]>>,
  Assert<Equal<typeof startCall.invocation.request["target"]["kind"], "graph_function">>,
];

export async function typedTransport(): Promise<void> {
  const outcome = await runInstalledDefinitionCallTransport(acquisition, startCall);
  if (outcome.kind === "installed_definition_call_transport_refusal") {
    const code: InstalledDefinitionCallTransportRefusal["code"] = outcome.code;
    void code;
    return;
  }
  const receipt = outcome.receipt;
  const key: StartMember["packet"]["definitionKey"] = receipt.definitionKey;
  const resourceReceipt: StartMember["binding"]["resourceReceipt"] | null = receipt.resources;
  void key; void resourceReceipt;
  // Host fault: no owner output; the failure keeps the typed fault or defect.
  if (receipt.ownerOutput === null) {
    const failureKind: "typed_execution_fault" | "defect_or_interruption" | undefined = receipt.failure?.failureKind;
    void failureKind;
    return;
  }
  // Runtime nonterminal stays distinct from result and refusal.
  if (receipt.ownerOutput.outcomeKind === "nonterminal") return;
  const read = await runInstalledDefinitionCallTransport(acquisition, runStatusCall);
  if (read.kind === "installed_definition_call_transport_result") {
    // @ts-expect-error HC1-NEG terminal-read-has-no-nonterminal 2367
    if (read.receipt.ownerOutput?.outcomeKind === "nonterminal") return;
  }
  const rawOutcome: InstalledDefinitionCallTransportOutcome = await runInstalledDefinitionCallTransport(acquisition, raw);
  void rawOutcome;
  // A union of valid alternatives keeps each alternative's own owner outcome.
  const unionOutcome = await runInstalledDefinitionCallTransport(acquisition, validUnion);
  if (unionOutcome.kind === "installed_definition_call_transport_result") {
    const unionKey: StartMember["packet"]["definitionKey"] | RunStatusMember["packet"]["definitionKey"] = unionOutcome.receipt.definitionKey;
    void unionKey;
  }
  for (const call of [...verifyCalls, ...continueCalls, nextCall, directCall, runStoppedCall]) {
    await runInstalledDefinitionCallTransport(acquisition, call);
  }
}

declare const pendingWithoutCursor: Omit<PendingExecution["request"], "pendingCursor">;
declare const forgedStart: Omit<typeof startCall, "resources"> & { readonly resources: RunStatus["resources"] };
declare const forgedRequestStart: Omit<typeof startCall, "invocation"> & { readonly invocation: Omit<typeof startCall.invocation, "request"> & { readonly request: typeof runStatusCall.invocation.request } };
// Each alternative is checked against its own member: valid unions transport;
// one crossed alternative refuses the whole union.
declare const validUnion: typeof startCall | typeof runStatusCall;
declare const mixedResourceUnion: typeof startCall | typeof forgedStart;
declare const mixedRequestUnion: typeof runStatusCall | typeof forgedRequestStart;

export function negatives(): void {
  // @ts-expect-error HC1-NEG wrong-key 2322 2345 2769
  constructInstalledPublicDefinitionCall({ ...environment, operationId: "abg.operation.run.invoke", memberKey: "resume", request: startGraph.request, slots: startGraph.slots, resources: startGraph.resources });
  // @ts-expect-error HC1-NEG wrong-member 2322 2345 2769
  constructInstalledPublicDefinitionCall({ ...environment, operationId: "abg.operation.run.invoke", memberKey: "invoke", request: startGraph.request, slots: startGraph.slots, resources: startGraph.resources });
  // @ts-expect-error HC1-NEG wrong-request 2322 2345 2769
  constructInstalledPublicDefinitionCall({ ...environment, operationId: "abg.operation.run.invoke", memberKey: "start", request: direct.request, slots: startGraph.slots, resources: startGraph.resources });
  // @ts-expect-error HC1-NEG wrong-resources 2322 2345 2769
  constructInstalledPublicDefinitionCall({ ...environment, operationId: "abg.operation.run.invoke", memberKey: "start", request: startGraph.request, slots: startGraph.slots, resources: runStatus.resources });
  // @ts-expect-error HC1-NEG start-graph-function-requires-graph-slot 2322 2345 2769
  constructInstalledPublicDefinitionCall({ ...environment, operationId: "abg.operation.run.invoke", memberKey: "start", request: startGraph.request, slots: startNext.slots, resources: startGraph.resources });
  // @ts-expect-error HC1-NEG verify-installed-requires-dependency-lock 2322 2345 2769
  constructInstalledPublicDefinitionCall({ ...environment, ...verifyInstalled, slots: verifyPacked.slots });
  // @ts-expect-error HC1-NEG run-stopped-requires-execution-basis 2322 2345 2769
  constructInstalledPublicDefinitionCall({ ...environment, ...runStopped, slots: reprice.slots });
  // @ts-expect-error HC1-NEG c-call-replay-selector-requires-c-call 2322 2345 2769
  constructInstalledPublicDefinitionCall({ ...environment, ...cCallReplay, request: { ...cCallReplay.request, selector: runReplay.request.selector } });
  // @ts-expect-error HC1-NEG crossed-read-selector 2322 2345 2769
  constructInstalledPublicDefinitionCall({ ...environment, ...runStatus, request: { ...runStatus.request, selector: runReplay.request.selector } });
  // @ts-expect-error HC1-NEG crossed-read-resources 2322 2345 2769
  constructInstalledPublicDefinitionCall({ ...environment, ...runStatus, resources: productCatalogList.resources });
  // @ts-expect-error HC1-NEG selected-action-member-has-no-callable-call 2322 2345 2769
  constructInstalledPublicDefinitionCall({ ...environment, ...pendingExecution, memberKey: "selected_action" });
  // @ts-expect-error HC1-NEG current-intent-refuses-construction-intent-body 2322 2345 2353 2769
  constructInstalledPublicDefinitionCall({ ...environment, ...pendingExecution, request: { ...pendingWithoutCursor, currentIntent: pendingExecution.request.pendingCursor } });
  // @ts-expect-error HC1-NEG pending-variant-requires-its-cursor 2322 2345 2769
  constructInstalledPublicDefinitionCall({ ...environment, ...pendingExecution, request: pendingWithoutCursor });
  // @ts-expect-error HC1-NEG unavailable-member-has-no-callable-resources 2322 2345 2769
  constructInstalledPublicDefinitionCall({ ...environment, ...reprice, memberKey: "attest", request: { ...reprice.request, act: "attest", subjectKind: "evidence_claim" } });
  // @ts-expect-error HC1-NEG transport-refuses-forged-typed-resources 2345
  void runInstalledDefinitionCallTransport(acquisition, forgedStart);
  // @ts-expect-error HC1-NEG transport-refuses-mixed-union-crossed-resources 2345
  void runInstalledDefinitionCallTransport(acquisition, mixedResourceUnion);
  // @ts-expect-error HC1-NEG transport-refuses-mixed-union-crossed-request 2345
  void runInstalledDefinitionCallTransport(acquisition, mixedRequestUnion);
}

// HC2 shipped constructors. Each returns the operation- and variant-correlated
// alternative its selection names; the typed transport accepts that output,
// narrows its key and keeps the member's own owner receipt.
type AssetIntent = Readonly<{ memberKey: "start"; target: Readonly<{ kind: "asset"; handle: string }>; rootMode: "direct"; fhMode: "direct" }>;
type GraphIntent = Readonly<{ memberKey: "start"; target: Readonly<{ kind: "graph_function"; handle: string }>; rootMode: "direct"; fhMode: "direct" }>;
type NextIntent = Readonly<{ memberKey: "start"; target: Readonly<{ kind: "next" }>; rootMode: "direct"; fhMode: "direct" }>;
type DeclaredIntent = Readonly<{ memberKey: "start"; target: Readonly<{ kind: "declared_start"; startRef: string }>; rootMode: "supervised"; fhMode: "human-proxy" }>;
type DirectIntent = Readonly<{ memberKey: "invoke"; catalogHandle: string }>;
type ShippedStartCall<S extends ProductRunInvocationSelectionIntent> =
  Extract<Awaited<ReturnType<typeof constructInstalledStartCall<S>>>, { readonly kind: "installed_start_call" }>["call"];
type ShippedPendingCall =
  Extract<Awaited<ReturnType<typeof constructInstalledPendingCall>>, { readonly kind: "installed_pending_call" }>["call"];
type ShippedReadCall<K extends AbgRunReadMemberKey> =
  Extract<ReturnType<typeof constructInstalledRunReadCall<K>>, { readonly kind: "installed_run_read_call" }>["call"];
type ShippedOutcomeHolds<C, K extends CallableKey> = Mutual<
  InstalledDefinitionCallTransportOutcomeOf<C>,
  InstalledDefinitionCallTransportOutcome<CallableMemberOf<K>["packet"], CallableMemberOf<K>["binding"]["resourceReceipt"]>
>;
type SlotOf<C, S extends "graph_function"> = C extends { readonly invocation: { readonly invocationAuthority: { readonly slots: infer T extends Readonly<Record<S, unknown>> } } } ? T[S] : never;
type TargetKindOf<C> = C extends { readonly invocation: { readonly request: { readonly target: { readonly kind: infer T } } } } ? T : never;
type ReadMember = CallableMemberOf<"abg.operation.project.read#run_status">;

export type ShippedConstructorProof = [
  Assert<Equal<ShippedStartCall<AssetIntent>["invocation"]["definitionKey"]["operationId"], "abg.operation.run.invoke">>,
  Assert<Equal<ShippedStartCall<AssetIntent>["invocation"]["definitionKey"]["memberKey"], "start">>,
  Assert<Equal<TargetKindOf<ShippedStartCall<AssetIntent>>, "asset">>,
  Assert<Equal<TargetKindOf<ShippedStartCall<GraphIntent>>, "graph_function">>,
  Assert<Equal<TargetKindOf<ShippedStartCall<NextIntent>>, "next">>,
  Assert<Equal<TargetKindOf<ShippedStartCall<DeclaredIntent>>, "declared_start">>,
  Assert<Equal<SlotOf<ShippedStartCall<AssetIntent>, "graph_function">, null>>,
  Assert<Equal<SlotOf<ShippedStartCall<NextIntent>, "graph_function">, null>>,
  Assert<Equal<SlotOf<ShippedStartCall<GraphIntent>, "graph_function"> extends null ? true : false, false>>,
  Assert<Equal<SlotOf<ShippedStartCall<DirectIntent>, "graph_function"> extends null ? true : false, false>>,
  Assert<Equal<ShippedStartCall<DirectIntent>["invocation"]["definitionKey"]["memberKey"], "invoke">>,
  Assert<Equal<ShippedStartCall<ProductRunInvocationSelectionIntent>["invocation"]["definitionKey"]["memberKey"], "start" | "invoke">>,
  Assert<Equal<ShippedStartCall<AssetIntent>["resources"], StartMember["binding"]["resources"]>>,
  Assert<ShippedOutcomeHolds<ShippedStartCall<AssetIntent>, "abg.operation.run.invoke#start">>,
  Assert<ShippedOutcomeHolds<ShippedStartCall<DeclaredIntent>, "abg.operation.run.invoke#start">>,
  Assert<ShippedOutcomeHolds<ShippedStartCall<DirectIntent>, "abg.operation.run.invoke#invoke">>,
  // The pending constructor takes the pending-execution selection only and
  // builds a current_intent call with a pending cursor.
  Assert<Equal<RunContinuationSelectionIntent["kind"], "pending_execution">>,
  Assert<Equal<ShippedPendingCall["invocation"]["definitionKey"]["memberKey"], "current_intent">>,
  Assert<Equal<ShippedPendingCall["invocation"]["request"] extends { readonly pendingCursor: unknown } ? true : false, true>>,
  Assert<ShippedOutcomeHolds<ShippedPendingCall, "abg.operation.run.continue#current_intent">>,
  Assert<Equal<{ readonly [K in AbgRunReadMemberKey]: ShippedOutcomeHolds<ShippedReadCall<K>, `abg.operation.project.read#${K}`> }[AbgRunReadMemberKey], true>>,
  Assert<Equal<ShippedReadCall<"graph_call_replay">["invocation"]["definitionKey"]["memberKey"], "graph_call_replay">>,
  Assert<Equal<ShippedReadCall<"run_status">["resources"], ReadMember["binding"]["resources"]>>,
];

declare const assetStartInput: Parameters<typeof constructInstalledStartCall<AssetIntent>>[0];
declare const graphStartInput: Parameters<typeof constructInstalledStartCall<GraphIntent>>[0];
declare const directInput: Parameters<typeof constructInstalledStartCall<DirectIntent>>[0];
declare const anyStartInput: Parameters<typeof constructInstalledStartCall<ProductRunInvocationSelectionIntent>>[0];
declare const pendingInput: Parameters<typeof constructInstalledPendingCall>[0];
declare const replayInput: Parameters<typeof constructInstalledRunReadCall<"graph_call_replay">>[0];

export async function shippedTransport(): Promise<void> {
  const asset = await constructInstalledStartCall(assetStartInput);
  if (asset.kind === "installed_start_call") {
    const operationId: "abg.operation.run.invoke" = asset.call.invocation.definitionKey.operationId;
    void operationId;
    const outcome = await runInstalledDefinitionCallTransport(acquisition, asset.call);
    if (outcome.kind === "installed_definition_call_transport_result") {
      const key: StartMember["packet"]["definitionKey"] = outcome.receipt.definitionKey;
      void key;
    }
  }
  const graph = await constructInstalledStartCall(graphStartInput);
  if (graph.kind === "installed_start_call") await runInstalledDefinitionCallTransport(acquisition, graph.call);
  const direct = await constructInstalledStartCall(directInput);
  if (direct.kind === "installed_start_call") {
    const outcome = await runInstalledDefinitionCallTransport(acquisition, direct.call);
    if (outcome.kind === "installed_definition_call_transport_result") {
      const key: DirectMember["packet"]["definitionKey"] = outcome.receipt.definitionKey;
      void key;
    }
  }
  // An unselected intent yields the union of start and invoke alternatives;
  // each alternative is checked against its own member.
  const any = await constructInstalledStartCall(anyStartInput);
  if (any.kind === "installed_start_call") await runInstalledDefinitionCallTransport(acquisition, any.call);
  const pending = await constructInstalledPendingCall(pendingInput);
  if (pending.kind === "installed_pending_call") {
    const operationId: "abg.operation.run.continue" = pending.call.invocation.definitionKey.operationId;
    void operationId;
    await runInstalledDefinitionCallTransport(acquisition, pending.call);
  }
  const replay = constructInstalledRunReadCall(replayInput);
  if (replay.kind === "installed_run_read_call") {
    const outcome = await runInstalledDefinitionCallTransport(acquisition, replay.call);
    if (outcome.kind === "installed_definition_call_transport_result" && outcome.receipt.ownerOutput?.outcomeKind === "result") {
      const kind: "graph_call_replay_projection" = outcome.receipt.ownerOutput.value.projection.kind;
      void kind;
    }
  }
}

declare const shippedAsset: ShippedStartCall<AssetIntent>;
declare const shippedNext: ShippedStartCall<NextIntent>;
declare const shippedPending: ShippedPendingCall;
declare const shippedStatus: ShippedReadCall<"run_status">;
declare const shippedStartWithReadResources: Omit<ShippedStartCall<AssetIntent>, "resources"> & { readonly resources: ShippedReadCall<"run_status">["resources"] };
declare const shippedCrossedUnion: ShippedStartCall<AssetIntent> | typeof shippedStartWithReadResources;
declare const pendingSelection: RunContinuationSelectionIntent;

export function shippedNegatives(): void {
  // @ts-expect-error HC1-NEG hc2-asset-start-is-not-graph-function-start 2322 2719
  const assetAsGraph: ShippedStartCall<GraphIntent> = shippedAsset;
  // @ts-expect-error HC1-NEG hc2-next-start-is-not-direct-invoke 2322
  const nextAsDirect: ShippedStartCall<DirectIntent> = shippedNext;
  // @ts-expect-error HC1-NEG hc2-start-operation-is-not-continue 2322
  const startOperation: "abg.operation.run.continue" = shippedAsset.invocation.definitionKey.operationId;
  // @ts-expect-error HC1-NEG hc2-pending-call-is-not-selected-action 2322
  const pendingAsSelected: "selected_action" = shippedPending.invocation.definitionKey.memberKey;
  // @ts-expect-error HC1-NEG hc2-pending-constructor-refuses-selected-action-selection 2322 2345
  void constructInstalledPendingCall({ ...pendingInput, selection: { ...pendingSelection, kind: "selected_action" } });
  // @ts-expect-error HC1-NEG hc2-pending-constructor-refuses-construction-intent-selection 2322 2345
  void constructInstalledPendingCall({ ...pendingInput, selection: { ...pendingSelection, kind: "current_intent" } });
  // @ts-expect-error HC1-NEG hc2-run-status-read-is-not-run-result 2322
  const statusAsResult: ShippedReadCall<"run_result"> = shippedStatus;
  // @ts-expect-error HC1-NEG hc2-read-is-not-start 2322
  const readAsStart: ShippedStartCall<NextIntent> = shippedStatus;
  // @ts-expect-error HC1-NEG hc2-start-constructor-refuses-continuation-selection 2322 2345 2769
  void constructInstalledStartCall({ ...assetStartInput, selection: pendingSelection });
  // @ts-expect-error HC1-NEG hc2-read-constructor-refuses-non-run-read-member 2322 2345 2769
  void constructInstalledRunReadCall({ ...replayInput, memberKey: "run_lawful_actions" });
  // @ts-expect-error HC1-NEG hc2-transport-refuses-shipped-start-with-read-resources 2345
  void runInstalledDefinitionCallTransport(acquisition, shippedStartWithReadResources);
  // @ts-expect-error HC1-NEG hc2-transport-refuses-shipped-union-with-crossed-alternative 2345
  void runInstalledDefinitionCallTransport(acquisition, shippedCrossedUnion);
  void [assetAsGraph, nextAsDirect, startOperation, pendingAsSelected, statusAsResult, readAsStart];
}
