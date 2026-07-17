import { GAPS_PROJECT_READ_RELATION_SOURCES } from "../../code/src/app/m04/gaps/operation_contracts.js";
import { PRODUCT_INTAKE_PROJECT_READ_RELATION_SOURCES } from "../../code/src/app/m04/product_intake/operation_contracts.js";
import { RESULT_ASSESSMENT_PROJECT_READ_RELATION_SOURCES } from "../../code/src/app/m04/result_assessment/operation_contracts.js";
import { WORKSPACE_PROJECT_READ_RELATION_SOURCES } from "../../code/src/app/m04/workspace/operation_contracts.js";
import { RELEASE_OPERATION_PROJECT_READ_RELATION_SOURCES } from "../../code/src/qualification/m05/exact_candidate_release_operation_contracts.js";

type Equal<Left, Right> =
  (<T>() => T extends Left ? 1 : 2) extends
  (<T>() => T extends Right ? 1 : 2)
    ? true
    : false;
type Expect<Value extends true> = Value;
type RelationInput<Source extends { readonly relation: (...args: never[]) => unknown }> =
  Parameters<Source["relation"]>[0];

const workspace = WORKSPACE_PROJECT_READ_RELATION_SOURCES.workspace_status;
const assessment =
  RESULT_ASSESSMENT_PROJECT_READ_RELATION_SOURCES.assessment_evidence;
const install = PRODUCT_INTAKE_PROJECT_READ_RELATION_SOURCES.install_evidence;
const workspaceGaps = GAPS_PROJECT_READ_RELATION_SOURCES.workspace_gaps;
const runGaps = GAPS_PROJECT_READ_RELATION_SOURCES.run_gaps;
const release = RELEASE_OPERATION_PROJECT_READ_RELATION_SOURCES.release_evidence;

export type _WorkspaceCase = Expect<
  Equal<typeof workspace.definitionKey.caseKey, "workspace_status">
>;
export type _AssessmentCase = Expect<
  Equal<typeof assessment.definitionKey.caseKey, "assessment_evidence">
>;
export type _InstallCase = Expect<
  Equal<typeof install.definitionKey.caseKey, "install_evidence">
>;
export type _WorkspaceGapsCase = Expect<
  Equal<typeof workspaceGaps.definitionKey.caseKey, "workspace_gaps">
>;
export type _RunGapsCase = Expect<
  Equal<typeof runGaps.definitionKey.caseKey, "run_gaps">
>;
export type _ReleaseCase = Expect<
  Equal<typeof release.definitionKey.caseKey, "release_evidence">
>;

export type _WorkspaceLocator = Expect<
  Equal<
    typeof workspace.sourceLocator.memberPath,
    readonly ["workspace_status", "relation"]
  >
>;
export type _InstallExport = Expect<
  Equal<
    typeof install.sourceLocator.exportName,
    "PRODUCT_INTAKE_PROJECT_READ_RELATION_SOURCES"
  >
>;
export type _ReleaseLocator = Expect<
  Equal<
    typeof release.sourceLocator.memberPath,
    readonly ["release_evidence", "relation"]
  >
>;
export type _RunGapsLocator = Expect<
  Equal<
    typeof runGaps.sourceLocator.memberPath,
    readonly ["run_gaps", "relation"]
  >
>;

type WorkspaceInput = RelationInput<typeof workspace>;
type AssessmentInput = RelationInput<typeof assessment>;
type InstallInput = RelationInput<typeof install>;
type WorkspaceGapsInput = RelationInput<typeof workspaceGaps>;
type RunGapsInput = RelationInput<typeof runGaps>;
type ReleaseInput = RelationInput<typeof release>;

export type _WorkspaceSource = Expect<
  Equal<WorkspaceInput["admittedRequest"]["source"]["kind"], "WorkspaceBinding">
>;
export type _AssessmentSource = Expect<
  Equal<AssessmentInput["admittedRequest"]["source"]["kind"], "ResultAssessment">
>;
export type _InstallSource = Expect<
  Equal<InstallInput["admittedRequest"]["source"]["kind"], "InstalledProduct">
>;
export type _InstallSelector = Expect<
  Equal<keyof InstallInput["admittedRequest"]["selector"], "installManifest">
>;
export type _WorkspaceGapsSelector = Expect<
  Equal<keyof WorkspaceGapsInput["admittedRequest"]["selector"], "gapBasis">
>;
export type _RunGapsSource = Expect<
  Equal<RunGapsInput["admittedRequest"]["source"]["kind"], "Run">
>;
export type _RunGapsSelector = Expect<
  Equal<keyof RunGapsInput["admittedRequest"]["selector"], never>
>;
export type _ReleaseSelector = Expect<
  Equal<
    keyof ReleaseInput["admittedRequest"]["selector"],
    "releaseSnapshotManifest"
  >
>;

declare const installInput: InstallInput;
declare const runGapsInput: RunGapsInput;
declare const releaseInput: ReleaseInput;

export const installSubjectRef: string =
  installInput.candidateProjection.subject.ref;
export const releaseBasisRef: string =
  releaseInput.candidateProjection.rows[0]!.basis.ref;

// @ts-expect-error An install relation cannot consume a release source kind.
const wrongInstallSource: "ReleaseCut" =
  installInput.admittedRequest.source.kind;
void wrongInstallSource;

// @ts-expect-error A release selector cannot expose an install manifest.
const wrongReleaseSelector = releaseInput.admittedRequest.selector.installManifest;
void wrongReleaseSelector;

// @ts-expect-error A run-gaps request retains the strict empty selector.
const inventedRunGapBasis = runGapsInput.admittedRequest.selector.gapBasis;
void inventedRunGapBasis;

// @ts-expect-error Relation definition keys remain immutable.
workspace.definitionKey.caseKey = "assessment_evidence";
