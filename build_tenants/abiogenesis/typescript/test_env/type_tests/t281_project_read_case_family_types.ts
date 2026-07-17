import type * as v from "valibot";

import {
  PROJECT_READ_CASE_FAMILY,
  resolveProjectReadCaseRow,
  type ProjectReadProjection,
  type ProjectReadResult
} from "../../code/src/app/m04/public_contracts/project_read_case_family.js";
import type {
  PublicOutcomeResultBinding,
  RequestRelatedPublicOutcomeResultBinding,
  SchemaOnlyPublicOutcomeResultBinding
} from "../../code/src/app/m04/public_contracts/native_contract_phase_a.js";
import type {
  ProjectReadRequest
} from "../../code/src/app/m04/public_contracts/project_read_operation_contracts.js";
import type {
  ResolvedOwnerProjectionRelation
} from "../../code/src/shared/validation/canonical_native_schema_projector.js";

type Equal<Left, Right> =
  (<T>() => T extends Left ? 1 : 2) extends
  (<T>() => T extends Right ? 1 : 2)
    ? true
    : false;
type Expect<Value extends true> = Value;

type RunKey = typeof PROJECT_READ_CASE_FAMILY.run_status.definitionKey;
type RunRequest = ProjectReadRequest<"run_status">;
type RunProjection = ProjectReadProjection<"run_status">;
type RunResult = ProjectReadResult<"run_status">;

declare const runRelation: ResolvedOwnerProjectionRelation<
  RunKey,
  RunRequest,
  RunProjection
>;

const projectReadBinding: PublicOutcomeResultBinding<
  RunKey,
  RunRequest,
  RunProjection
> = {
  kind: "request_related_projection",
  relation: runRelation
};

const projectReadWithoutRelation: PublicOutcomeResultBinding<
  RunKey,
  RunRequest,
  RunProjection
> = {
  // @ts-expect-error project.read cannot omit its request/projection relation.
  kind: "schema_only"
};

type WorkspaceCreateKey = {
  readonly operationId: "abg.operation.workspace.create";
  readonly memberKind: "variant";
  readonly variant: "clean";
};

const ordinaryBinding: PublicOutcomeResultBinding<
  WorkspaceCreateKey,
  unknown,
  unknown
> = { kind: "schema_only" };

const ordinaryBindingWithRelation: PublicOutcomeResultBinding<
  WorkspaceCreateKey,
  unknown,
  unknown
> = {
  // @ts-expect-error ordinary operations cannot smuggle a project.read relation.
  kind: "request_related_projection",
  relation: runRelation
};

declare const rawProjection: RunProjection;
// @ts-expect-error a raw owner projection is not the public wrapper result.
const rawProjectionAsResult: RunResult = rawProjection;

declare const wrappedResult: RunResult;
const projectionFromWrapper: RunProjection = wrappedResult.projection;

// @ts-expect-error result slots remain nominally scoped to their case.
const crossCaseResultSlot: typeof PROJECT_READ_CASE_FAMILY.run_status.result =
  PROJECT_READ_CASE_FAMILY.graph_call_status.result;

const resolvedPromise = resolveProjectReadCaseRow(
  PROJECT_READ_CASE_FAMILY.run_status
);
type ResolvedRunRow = Awaited<typeof resolvedPromise>;
type RunProjectionSchema =
  typeof PROJECT_READ_CASE_FAMILY.run_status.result.projection.source.schema;

void projectReadBinding;
void projectReadWithoutRelation;
void ordinaryBinding;
void ordinaryBindingWithRelation;
void rawProjectionAsResult;
void projectionFromWrapper;
void crossCaseResultSlot;

export type T281ProjectReadCaseFamilyTypeProof =
  | Expect<Equal<
      keyof typeof PROJECT_READ_CASE_FAMILY,
      keyof typeof import("../../code/src/app/m04/public_contracts/project_read_operation_contracts.js").PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES
    >>
  | Expect<Equal<RunResult["kind"], "project_read_result">>
  | Expect<Equal<RunResult["caseKey"], "run_status">>
  | Expect<RunProjectionSchema extends v.GenericSchema ? true : false>
  | Expect<Equal<
      ResolvedRunRow["result"]["kind"],
      "project_read_wrapped_result_contract"
    >>
  | Expect<Equal<
      ResolvedRunRow["result"]["projectionRelation"]["kind"],
      "resolved_owner_projection_relation"
    >>
  | Expect<Equal<
      typeof PROJECT_READ_CASE_FAMILY.ticket_consensus.nonterminal.kind,
      "nonterminal_not_declared"
    >>
  | Expect<Equal<
      typeof PROJECT_READ_CASE_FAMILY.ticket_consensus.result.coordinate.definitionKey.caseKey,
      "ticket_consensus"
    >>
  | Expect<Equal<
      PublicOutcomeResultBinding<RunKey, RunRequest, RunProjection>,
      RequestRelatedPublicOutcomeResultBinding<
        RunKey,
        RunRequest,
        RunProjection
      >
    >>
  | Expect<Equal<
      PublicOutcomeResultBinding<WorkspaceCreateKey, unknown, unknown>,
      SchemaOnlyPublicOutcomeResultBinding
    >>;
