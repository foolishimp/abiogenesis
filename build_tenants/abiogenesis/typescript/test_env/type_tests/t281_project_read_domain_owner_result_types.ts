import type * as v from "valibot";

import { CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES } from "../../code/src/abg/m03/contracts/catalog_operation_contracts.js";
import { GAPS_PROJECT_READ_NATIVE_CONTRACT_SOURCES } from "../../code/src/app/m04/gaps/operation_contracts.js";
import { PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES } from "../../code/src/app/m04/product_intake/operation_contracts.js";
import { RESULT_ASSESSMENT_NATIVE_CONTRACT_SOURCES } from "../../code/src/app/m04/result_assessment/operation_contracts.js";
import { WORKSPACE_NATIVE_CONTRACT_SOURCES } from "../../code/src/app/m04/workspace/operation_contracts.js";
import { RELEASE_OPERATION_NATIVE_CONTRACT_SOURCES } from "../../code/src/qualification/m05/exact_candidate_release_operation_contracts.js";

type Equal<Left, Right> =
  (<T>() => T extends Left ? 1 : 2) extends
  (<T>() => T extends Right ? 1 : 2)
    ? true
    : false;
type Expect<Value extends true> = Value;

const assessmentSource =
  RESULT_ASSESSMENT_NATIVE_CONTRACT_SOURCES.project_read.assessment_evidence
    .result;
const workspaceGapSource =
  GAPS_PROJECT_READ_NATIVE_CONTRACT_SOURCES.project_read.workspace_gaps.result;

type AssessmentEvidence = v.InferOutput<typeof assessmentSource.schema>;
type WorkspaceGaps = v.InferOutput<typeof workspaceGapSource.schema>;

export type _AssessmentSubject = Expect<
  Equal<AssessmentEvidence["subject"]["kind"], "ResultAssessment">
>;
export type _WorkspaceGapSubject = Expect<
  Equal<WorkspaceGaps["subject"]["kind"], "WorkspaceBinding">
>;
export type _AssessmentCaseKey = Expect<
  Equal<
    typeof assessmentSource.authority.subject.caseKey,
    "assessment_evidence"
  >
>;
export type _WorkspaceGapLocator = Expect<
  Equal<
    typeof workspaceGapSource.sourceLocator.memberPath,
    readonly [
      "project_read",
      "workspace_gaps",
      "result",
      "schema"
    ]
  >
>;

declare const assessmentEvidence: AssessmentEvidence;
declare const workspaceGaps: WorkspaceGaps;

export const assessmentSubjectRef: string = assessmentEvidence.subject.ref;
export const workspaceGapRef: string = workspaceGaps.rows[0]!.gap.ref;

// @ts-expect-error Assessment evidence cannot masquerade as install evidence.
const installSubject: "InstalledProduct" = assessmentEvidence.subject.kind;
void installSubject;

// @ts-expect-error A workspace Gap projection cannot claim a Run subject.
const runSubject: "Run" = workspaceGaps.subject.kind;
void runSubject;

// Compile all eight owner paths so missing or renamed sources fail here.
void CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES.project_read.catalog_list.result;
void CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES.project_read.catalog_describe.result;
void WORKSPACE_NATIVE_CONTRACT_SOURCES.project_read.workspace_status.result;
void PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES.project_read.install_evidence.result;
void RELEASE_OPERATION_NATIVE_CONTRACT_SOURCES.project_read.release_evidence.result;
void GAPS_PROJECT_READ_NATIVE_CONTRACT_SOURCES.project_read.run_gaps.result;
