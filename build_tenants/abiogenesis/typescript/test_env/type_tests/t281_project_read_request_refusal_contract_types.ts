import * as v from "valibot";

import {
  PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES,
  type ProjectReadCase,
  type ProjectReadRefusal,
  type ProjectReadRequest
} from "../../code/src/app/m04/public_contracts/project_read_operation_contracts.js";

type Equal<Left, Right> =
  (<T>() => T extends Left ? 1 : 2) extends
  (<T>() => T extends Right ? 1 : 2)
    ? true
    : false;
type Expect<Value extends true> = Value;

type ExpectedProjectReadCase =
  | "catalog_list"
  | "catalog_describe"
  | "workspace_status"
  | "run_status"
  | "graph_call_status"
  | "run_result"
  | "graph_call_result"
  | "run_evidence"
  | "graph_call_evidence"
  | "result_evidence"
  | "assessment_evidence"
  | "witness_evidence"
  | "install_evidence"
  | "release_evidence"
  | "workspace_replay"
  | "run_replay"
  | "graph_call_replay"
  | "interaction_replay"
  | "continuation_replay"
  | "c_call_replay"
  | "workspace_gaps"
  | "run_gaps"
  | "run_lawful_actions"
  | "observer_report"
  | "observer_drafts"
  | "tuning_report"
  | "ticket_consensus";

type _ExactCaseCensus = Expect<Equal<ProjectReadCase, ExpectedProjectReadCase>>;
type _CatalogSource = Expect<
  Equal<ProjectReadRequest<"catalog_list">["source"]["kind"], "Catalog">
>;
type _RunSource = Expect<
  Equal<ProjectReadRequest<"run_status">["source"]["kind"], "Run">
>;
type _ConsensusSource = Expect<
  Equal<
    ProjectReadRequest<"ticket_consensus">["source"]["kind"],
    "ConsensusResult"
  >
>;
type _DescribeCase = Expect<
  Equal<ProjectReadRequest<"catalog_describe">["caseKey"], "catalog_describe">
>;
type _ReplayCursor = Expect<
  Equal<ProjectReadRequest<"run_replay">["selector"]["fromOrdinal"], number>
>;
type _ReplayLimit = Expect<
  Equal<ProjectReadRequest<"run_replay">["selector"]["limit"], number>
>;
type _RequestSlot = Expect<
  Equal<
    typeof PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.run_status.request
      .authority.subject.slot,
    "request"
  >
>;
type _RefusalSlot = Expect<
  Equal<
    typeof PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.run_status.refusal
      .authority.subject.slot,
    "refusal"
  >
>;
type _DefinitionMemberKind = Expect<
  Equal<
    typeof PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.run_status.request
      .authority.subject.memberKind,
    "project_read_case"
  >
>;
type _DefinitionCase = Expect<
  Equal<
    typeof PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.run_status.request
      .authority.subject.caseKey,
    "run_status"
  >
>;
type _LocatorCase = Expect<
  Equal<
    typeof PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.run_status.request
      .sourceLocator.memberPath[0],
    "run_status"
  >
>;
type _LocatorSlot = Expect<
  Equal<
    typeof PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.run_status.request
      .sourceLocator.memberPath[1],
    "request"
  >
>;
type _LocatorSchema = Expect<
  Equal<
    typeof PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.run_status.request
      .sourceLocator.memberPath[2],
    "schema"
  >
>;

declare const describeRequest: ProjectReadRequest<"catalog_describe">;
export const canonicalHandle: string = describeRequest.selector.canonicalHandle;

declare const runStatusRequest: ProjectReadRequest<"run_status">;
// @ts-expect-error Empty selectors cannot acquire replay coordinates.
const invalidStatusCursor = runStatusRequest.selector.fromOrdinal;
void invalidStatusCursor;

const replaySelectorAsStatus: ProjectReadRequest<"run_status">["selector"] = {
  // @ts-expect-error Empty-selector output cannot be constructed with fields.
  fromOrdinal: 0,
  limit: 1
};
void replaySelectorAsStatus;

// @ts-expect-error Empty-selector output is a nominal admitted object.
const primitiveStatusSelector: ProjectReadRequest<"run_status">["selector"] =
  42;
void primitiveStatusSelector;

declare const runReplayRequest: ProjectReadRequest<"run_replay">;
// @ts-expect-error Replay has fromOrdinal and limit, never a range object.
const invalidReplayRange = runReplayRequest.selector.range;
void invalidReplayRange;

type DescribeRefusal = ProjectReadRefusal<"catalog_describe">;
type RunReplayRefusal = ProjectReadRefusal<"run_replay">;
type RunStatusRefusal = ProjectReadRefusal<"run_status">;
declare const describeRefusal: DescribeRefusal;
declare const replayRefusal: RunReplayRefusal;
declare const statusRefusal: RunStatusRefusal;
export const describeCode: DescribeRefusal["code"] = describeRefusal.code;
export const replayCode: RunReplayRefusal["code"] = replayRefusal.code;
export const statusCode: RunStatusRefusal["code"] = statusRefusal.code;

// @ts-expect-error Non-replay refusals cannot report cursor errors.
const statusCursorError: RunStatusRefusal["code"] = "cursor_invalid";
void statusCursorError;

// @ts-expect-error Only catalog_describe can report unknown_handle.
const listHandleError: ProjectReadRefusal<"catalog_list">["code"] =
  "unknown_handle";
void listHandleError;

type DirectRunRequest = v.InferOutput<
  typeof PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.run_status.request.schema
>;
type _ExportedRequestParity = Expect<
  Equal<DirectRunRequest, ProjectReadRequest<"run_status">>
>;

export type ProjectReadWrapperTypeProof =
  | _ExactCaseCensus
  | _CatalogSource
  | _RunSource
  | _ConsensusSource
  | _DescribeCase
  | _ReplayCursor
  | _ReplayLimit
  | _RequestSlot
  | _RefusalSlot
  | _DefinitionMemberKind
  | _DefinitionCase
  | _LocatorCase
  | _LocatorSlot
  | _LocatorSchema
  | _ExportedRequestParity;
