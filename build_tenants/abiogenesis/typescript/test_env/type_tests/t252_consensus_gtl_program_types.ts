// Native type-law proof for the Consensus GTL free construction.

import type {
  ConsensusClosedResult,
  InitialSemanticAssessment,
  PostSubmitterSemanticAssessment,
  ReviewerAssignment,
  RoundClosedDisposition,
  RoundRecurseDisposition
} from "../../code/src/abg/m03/contracts/consensus_gtl_program.js";

type Assert<Condition extends true> = Condition;
type Extends<Left, Right> = Left extends Right ? true : false;
type Not<Condition extends boolean> = Condition extends true ? false : true;
type HasKey<Value, Key extends PropertyKey> = Key extends keyof Value
  ? true
  : false;

export type InitialCannotRecurse = Assert<
  Not<Extends<"recurse_next_round", InitialSemanticAssessment["disposition"]>>
>;
export type PostSubmitterCanRecurse = Assert<
  Extends<
    "recurse_next_round",
    PostSubmitterSemanticAssessment["disposition"]
  >
>;
export type RecurseRequiresFoldback = Assert<
  HasKey<RoundRecurseDisposition, "foldbackMaterial">
>;
export type ClosedForbidsFoldback = Assert<
  Not<HasKey<RoundClosedDisposition, "foldbackMaterial">>
>;
export type ClosedResultForbidsFhInteraction = Assert<
  Not<HasKey<ConsensusClosedResult, "fhInteractionRef">>
>;
export type ReviewerForbidsWorker = Assert<
  Not<HasKey<ReviewerAssignment, "workerId">>
>;
export type ReviewerForbidsBackend = Assert<
  Not<HasKey<ReviewerAssignment, "backendId">>
>;
export type ReviewerForbidsTransport = Assert<
  Not<HasKey<ReviewerAssignment, "transportRef">>
>;

declare const initial: InitialSemanticAssessment;
declare const recurseWithoutFoldback: Omit<
  RoundRecurseDisposition,
  "foldbackMaterial"
>;
declare const reviewer: ReviewerAssignment;

export const invalidInitialDisposition: InitialSemanticAssessment = {
  ...initial,
  // @ts-expect-error Initial assessment cannot authorize semantic recursion.
  disposition: "recurse_next_round"
};

// @ts-expect-error Recurse disposition must carry exact foldback material.
export const invalidRecurseDisposition: RoundRecurseDisposition =
  recurseWithoutFoldback;

export const invalidReviewerAssignment: ReviewerAssignment = {
  ...reviewer,
  // @ts-expect-error Concrete worker identity remains ABG runtime truth.
  workerId: "worker://ambient"
};
