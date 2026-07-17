import * as v from "valibot";

import {
  RUNTIME_AUTHORING_OPERATION_NATIVE_CONTRACT_SOURCES
} from "../../code/src/abg/m03/contracts/runtime_authoring_operation_contracts.js";
import {
  OBSERVER_PROJECT_READ_NATIVE_CONTRACT_SOURCES
} from "../../code/src/abg/m03/contracts/observer_operation_contracts.js";
import {
  ONE_SURFACE_NATIVE_CONTRACT_SOURCES
} from "../../code/src/abg/m03/contracts/one_surface_operation_contracts.js";
import {
  TUNER_PROJECT_READ_NATIVE_CONTRACT_SOURCES
} from "../../code/src/abg/m03/contracts/tuner_operation_contracts.js";

const witnessSource =
  RUNTIME_AUTHORING_OPERATION_NATIVE_CONTRACT_SOURCES.project_read
    .witness_evidence.result;
export const witnessCaseKey: "witness_evidence" =
  witnessSource.authority.subject.caseKey;
export const witnessLocatorCase: "witness_evidence" =
  witnessSource.sourceLocator.memberPath[1];
export const witnessLocatorSlot: "result" =
  witnessSource.sourceLocator.memberPath[2];
export const witnessLocatorSchema: "schema" =
  witnessSource.sourceLocator.memberPath[3];

type WitnessEvidence = v.InferOutput<typeof witnessSource.schema>;
type WitnessEvidenceRow = WitnessEvidence["rows"][number];
declare const witnessRow: WitnessEvidenceRow;
export const witnessedSubject: "WitnessedAct" = witnessRow.subject.kind;
if (witnessRow.material.kind === "artifact") {
  const artifactRef: string = witnessRow.material.artifact.ref;
  void artifactRef;
}
// @ts-expect-error Evidence provenance is immutable after admission.
witnessRow.provenanceRefs.push("provenance:forged");

const lawfulSource =
  ONE_SURFACE_NATIVE_CONTRACT_SOURCES.project_read.run_lawful_actions.result;
export const lawfulCaseKey: "run_lawful_actions" =
  lawfulSource.authority.subject.caseKey;
type LawfulActions = v.InferOutput<typeof lawfulSource.schema>;
type LawfulAction = LawfulActions["rows"][number];
declare const lawfulAction: LawfulAction;
export const lawfulEligibility: "eligible" | "blocked" =
  lawfulAction.eligibility;
if (lawfulAction.target.kind === "pending_interaction") {
  const interactionRef: string = lawfulAction.target.interaction.ref;
  void interactionRef;
}
if (lawfulAction.requiredInput.kind === "contract_bound") {
  const contractRef: string = lawfulAction.requiredInput.inputContract.ref;
  void contractRef;
}
// @ts-expect-error A project action kind is a closed native union.
const inventedAction: LawfulAction["actionKind"] = "run_shell_script";
void inventedAction;
// @ts-expect-error Blocker identity is immutable after admission.
lawfulAction.blockerRefs.push("blocker:forged");

const observerReportSource =
  OBSERVER_PROJECT_READ_NATIVE_CONTRACT_SOURCES.project_read.observer_report
    .result;
const observerDraftSource =
  OBSERVER_PROJECT_READ_NATIVE_CONTRACT_SOURCES.project_read.observer_drafts
    .result;
export const observerReportCase: "observer_report" =
  observerReportSource.authority.subject.caseKey;
export const observerDraftCase: "observer_drafts" =
  observerDraftSource.authority.subject.caseKey;
type ObserverDraftProjection = v.InferOutput<typeof observerDraftSource.schema>;
type ObserverDraft = ObserverDraftProjection["drafts"][number];
declare const observerDraft: ObserverDraft;
export const observerActionKind:
  | "ticket_draft"
  | "reprice_proposal"
  | "fh_input" = observerDraft.actionKind;
// @ts-expect-error Observer draft kinds are closed to the replay-derived family.
const constructiveObserverDraft: ObserverDraft["actionKind"] =
  "invoke_graph_function";
void constructiveObserverDraft;

const tuningSource =
  TUNER_PROJECT_READ_NATIVE_CONTRACT_SOURCES.project_read.tuning_report.result;
export const tuningCaseKey: "tuning_report" =
  tuningSource.authority.subject.caseKey;
type TuningReport = v.InferOutput<typeof tuningSource.schema>;
type TuningDraft = TuningReport["draftStates"][number];
declare const tuningDraft: TuningDraft;
if (tuningDraft.state === "ratified") {
  const decidedBy: string | null = tuningDraft.decidedBy;
  void decidedBy;
}
export const tuningState: "draft" | "ratified" | "rejected" =
  tuningDraft.state;
// @ts-expect-error Tuning state cannot be invented by a caller.
const inventedState: TuningDraft["state"] = "applied";
void inventedState;
