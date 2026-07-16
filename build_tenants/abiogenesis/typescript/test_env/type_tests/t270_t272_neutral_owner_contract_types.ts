import * as v from "valibot";

import {
  INTERACTION_RESPOND_NATIVE_CONTRACT_SOURCES,
  RUN_CONTINUE_NATIVE_CONTRACT_SOURCES,
  RUN_INVOKE_NATIVE_CONTRACT_SOURCES
} from "../../code/src/abg/m03/contracts/one_surface_operation_contracts.js";
import { refSchema } from "../../code/src/shared/validation/native_contract_primitives.js";

type Equal<Left, Right> =
  (<T>() => T extends Left ? 1 : 2) extends
  (<T>() => T extends Right ? 1 : 2)
    ? true
    : false;
type Expect<Condition extends true> = Condition;
type Ref = v.InferOutput<typeof refSchema>;

type StartRequest = v.InferOutput<
  typeof RUN_INVOKE_NATIVE_CONTRACT_SOURCES.start.request.schema
>;
type NonConvergedStart = Exclude<StartRequest, { until: "converged" }>;
type ConvergedStart = Extract<StartRequest, { until: "converged" }>;

type _NonConvergedUntil = Expect<
  Equal<NonConvergedStart["until"], "first_traversal" | "blocked">
>;
type _NonConvergedFh = Expect<
  Equal<NonConvergedStart["fhMode"], "direct">
>;
type _NonConvergedRoot = Expect<
  Equal<NonConvergedStart["rootMode"], "supervised">
>;
type _ConvergedFh = Expect<
  Equal<ConvergedStart["fhMode"], "direct" | "human-proxy">
>;
type _ConvergedRoot = Expect<
  Equal<ConvergedStart["rootMode"], "direct" | "supervised">
>;

declare const nonConvergedStart: NonConvergedStart;
// @ts-expect-error A non-converged start cannot acquire human-proxy authority.
const invalidNonConvergedFh: "human-proxy" = nonConvergedStart.fhMode;
void invalidNonConvergedFh;

type InvokeResult = v.InferOutput<
  typeof RUN_INVOKE_NATIVE_CONTRACT_SOURCES.invoke.result.schema
>;
type InvokeCompleted = Extract<InvokeResult, { disposition: "completed" }>;
type InvokeBlocked = Extract<InvokeResult, { disposition: "blocked" }>;
type InvokeFailed = Extract<InvokeResult, { disposition: "runtime_failed" }>;
type _InvokeHasNoPreStartStop = Expect<
  Equal<Extract<InvokeResult, { phase: "pre_invocation_stop" }>, never>
>;
type _InvokeCompletedRefs = Expect<
  Equal<
    [
      InvokeCompleted["resultRef"],
      InvokeCompleted["stopRef"],
      InvokeCompleted["failureRef"]
    ],
    [Ref, null, null]
  >
>;
type _InvokeBlockedRefs = Expect<
  Equal<
    [
      InvokeBlocked["resultRef"],
      InvokeBlocked["stopRef"],
      InvokeBlocked["failureRef"]
    ],
    [null, Ref, null]
  >
>;
type _InvokeFailedRefs = Expect<
  Equal<
    [
      InvokeFailed["resultRef"],
      InvokeFailed["stopRef"],
      InvokeFailed["failureRef"]
    ],
    [null, null, Ref]
  >
>;

type CurrentIntentResult = v.InferOutput<
  typeof RUN_CONTINUE_NATIVE_CONTRACT_SOURCES.current_intent.result.schema
>;
type CurrentIntentFailed = Extract<
  CurrentIntentResult,
  { disposition: "runtime_failed" }
>;
type _CurrentIntentFailureRefs = Expect<
  Equal<
    [
      CurrentIntentFailed["successorReceiptRef"],
      CurrentIntentFailed["stopRef"],
      CurrentIntentFailed["failureRef"]
    ],
    [null, null, Ref]
  >
>;

type SelectedActionRequest = v.InferOutput<
  typeof RUN_CONTINUE_NATIVE_CONTRACT_SOURCES.selected_action.request.schema
>;
type _SelectedActionStaysProjectionOwned = Expect<
  Equal<
    Extract<
      keyof SelectedActionRequest,
      "selectedActionRef" | "selectedActionDigest"
    >,
    never
  >
>;

type SelectResponse = v.InferOutput<
  typeof INTERACTION_RESPOND_NATIVE_CONTRACT_SOURCES.select.request.schema
>;
type ApproveResponse = v.InferOutput<
  typeof INTERACTION_RESPOND_NATIVE_CONTRACT_SOURCES.approve.request.schema
>;
type _SelectChoice = Expect<Equal<SelectResponse["choiceRef"], Ref>>;
type _ApproveChoice = Expect<Equal<ApproveResponse["choiceRef"], Ref | null>>;

declare const selectWithoutValue: Omit<SelectResponse, "value">;
// @ts-expect-error Every select response requires an admitted canonical value.
const invalidSelectWithoutValue: SelectResponse = selectWithoutValue;
void invalidSelectWithoutValue;

declare const approveWithoutValue: Omit<ApproveResponse, "value">;
// @ts-expect-error Every non-select response also requires an admitted value.
const invalidApproveWithoutValue: ApproveResponse = approveWithoutValue;
void invalidApproveWithoutValue;

type _PrivateSourceRoot = Expect<
  Equal<
    typeof RUN_INVOKE_NATIVE_CONTRACT_SOURCES.invoke.request.sourceLocator.sourceRoot,
    "semantic_build"
  >
>;

export type NeutralOwnerContractTypeProof =
  | _NonConvergedUntil
  | _NonConvergedFh
  | _NonConvergedRoot
  | _ConvergedFh
  | _ConvergedRoot
  | _InvokeHasNoPreStartStop
  | _InvokeCompletedRefs
  | _InvokeBlockedRefs
  | _InvokeFailedRefs
  | _CurrentIntentFailureRefs
  | _SelectedActionStaysProjectionOwned
  | _SelectChoice
  | _ApproveChoice
  | _PrivateSourceRoot;
