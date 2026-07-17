import type {
  RuntimeProjectionProjectReadCase,
  RuntimeProjectionProjectReadResult
} from "../../code/src/abg/m03/contracts/runtime_projection_operation_contracts.js";
import {
  RUNTIME_PROJECTION_NATIVE_CONTRACT_SOURCES
} from "../../code/src/abg/m03/contracts/runtime_projection_operation_contracts.js";

type Equal<Left, Right> =
  (<T>() => T extends Left ? 1 : 2) extends
  (<T>() => T extends Right ? 1 : 2)
    ? true
    : false;
type Expect<Value extends true> = Value;

type ExpectedCases =
  | "run_status"
  | "graph_call_status"
  | "run_result"
  | "graph_call_result"
  | "run_evidence"
  | "graph_call_evidence"
  | "result_evidence"
  | "workspace_replay"
  | "run_replay"
  | "graph_call_replay"
  | "interaction_replay"
  | "continuation_replay"
  | "c_call_replay";

type _ExactCaseCensus = Expect<
  Equal<RuntimeProjectionProjectReadCase, ExpectedCases>
>;
type _RunStatusSubject = Expect<
  Equal<RuntimeProjectionProjectReadResult<"run_status">["subject"]["kind"], "Run">
>;
type _GraphCallStatusSubject = Expect<
  Equal<
    RuntimeProjectionProjectReadResult<"graph_call_status">["subject"]["kind"],
    "GraphCall"
  >
>;
type _RunResultKind = Expect<
  Equal<RuntimeProjectionProjectReadResult<"run_result">["kind"], "run_result_projection">
>;
type _GraphCallResultKind = Expect<
  Equal<
    RuntimeProjectionProjectReadResult<"graph_call_result">["kind"],
    "graph_call_result_projection"
  >
>;
type _ResultEvidenceSubject = Expect<
  Equal<
    RuntimeProjectionProjectReadResult<"result_evidence">["subject"]["kind"],
    "RuntimeResult"
  >
>;
type _InteractionReplaySubject = Expect<
  Equal<
    RuntimeProjectionProjectReadResult<"interaction_replay">["subject"]["kind"],
    "FhInteraction"
  >
>;
type _CCallReplaySubject = Expect<
  Equal<
    RuntimeProjectionProjectReadResult<"c_call_replay">["subject"]["kind"],
    "CProgramAtomReceipt"
  >
>;
type _LocatorProjectRead = Expect<
  Equal<
    typeof RUNTIME_PROJECTION_NATIVE_CONTRACT_SOURCES.project_read.run_replay.result
      .sourceLocator.memberPath[0],
    "project_read"
  >
>;
type _LocatorCase = Expect<
  Equal<
    typeof RUNTIME_PROJECTION_NATIVE_CONTRACT_SOURCES.project_read.run_replay.result
      .sourceLocator.memberPath[1],
    "run_replay"
  >
>;
type _LocatorSlot = Expect<
  Equal<
    typeof RUNTIME_PROJECTION_NATIVE_CONTRACT_SOURCES.project_read.run_replay.result
      .sourceLocator.memberPath[2],
    "result"
  >
>;
type _LocatorSchema = Expect<
  Equal<
    typeof RUNTIME_PROJECTION_NATIVE_CONTRACT_SOURCES.project_read.run_replay.result
      .sourceLocator.memberPath[3],
    "schema"
  >
>;

declare const runResult: RuntimeProjectionProjectReadResult<"run_result">;
export const runRows = runResult.results;
// @ts-expect-error Run result projections carry results[], never one result.
const runSingularResult = runResult.result;
void runSingularResult;

declare const graphCallResult: RuntimeProjectionProjectReadResult<"graph_call_result">;
export const graphCallRow = graphCallResult.result;
// @ts-expect-error GraphCall result projections carry one result, never results[].
const graphCallRows = graphCallResult.results;
void graphCallRows;

declare const runReplay: RuntimeProjectionProjectReadResult<"run_replay">;
// @ts-expect-error A typed replay subject cannot collapse to broad subordinate.
const broadSubordinate: "subordinate" = runReplay.subject.kind;
void broadSubordinate;

export type RuntimeProjectionProjectReadTypeProof =
  | _ExactCaseCensus
  | _RunStatusSubject
  | _GraphCallStatusSubject
  | _RunResultKind
  | _GraphCallResultKind
  | _ResultEvidenceSubject
  | _InteractionReplaySubject
  | _CCallReplaySubject
  | _LocatorProjectRead
  | _LocatorCase
  | _LocatorSlot
  | _LocatorSchema;
