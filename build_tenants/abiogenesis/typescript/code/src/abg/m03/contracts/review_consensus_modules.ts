// Implements: T-217 Phase 3 P3.5 — the SUBSUMED review/consensus
// families (odd_sdlc T-167/T-166 subsumption ruling, 2026-07-09):
// design authority for the outer contract, carrier set, decision
// vocabulary, recursion/stop law, and proof obligations lives HERE,
// shipping as substrate-bundled DECLARED modules under reserved refs —
// the HOG_BOOTSTRAP_TRIPLE catalog-citizen precedent (HANDLERS-016:
// the default is a typed, labelled catalog entry, never an invisible
// fallback; declared entries cannot shadow the reserved refs — the
// registry's unlawful_system_shadow rejection enforces it).
//
// REVIEW (gtl://abg/review/*): one or more configured reviewer
// profiles assess ANY typed surface, produce structured findings,
// reduce findings into explicit rulings, and emit TICKET_METHOD-shaped
// decision rows / draft tickets / deferments / rejected findings for
// the HOST ticket workflow to admit — review output is never ticket
// status authority.
//
// CONSENSUS (gtl://abg/consensus/*): a submitter-owned subject fans out
// to reviewers, reviewer outputs reduce into decision alternatives, the
// submitter responds, and the round either CLOSES or RECURSES through
// another governed round — recursion terminates by declared round
// budget or convergence, never by silent fallback.
//
// Hosts (odd_sdlc ticket workflows, odd_glc review sessions) bind these
// published families; they do not reimplement them (three-layer law).
// The observer tier composes with them read-only: review findings are
// observer INPUT pressure, and the session allowlist (WITNESS-015) is
// how an operator narrows a session to exactly these functions.

import type { GtlLibraryEntryDeclaration } from "../../../gtl/m02/contracts/runtime_registry.js";
import { constructGtlLibraryEntryDeclaration } from "../../../gtl/m02/contracts/runtime_registry.js";

export const ABG_REVIEW_MODULE_NAMESPACE = "abg.review";
export const ABG_CONSENSUS_MODULE_NAMESPACE = "abg.consensus";
const ABG_MODULE_OWNER_REF = "owner://abg/substrate";
const ABG_MODULE_VERSION = "4.6.0-dev";

// the decision vocabularies are DATA — hosts consume them, prompts
// render them, and admission closes over them
export const REVIEW_RULING_KIND_VALUES = Object.freeze([
  "decision_row",
  "draft_ticket",
  "split_ticket",
  "deferment",
  "rejected_finding"
] as const);

export type ReviewRulingKind = (typeof REVIEW_RULING_KIND_VALUES)[number];

export const CONSENSUS_ROUND_OUTCOME_VALUES = Object.freeze([
  "closed_done",
  "recurse_next_round",
  "escalate_fh"
] as const);

export type ConsensusRoundOutcome =
  (typeof CONSENSUS_ROUND_OUTCOME_VALUES)[number];

export const ABG_REVIEW_MODULE_DECLARATIONS: readonly GtlLibraryEntryDeclaration[] =
  Object.freeze([
    constructGtlLibraryEntryDeclaration({
      declarationRef: "gtl-declaration://abg/review/multi-reviewer-assessment",
      entryRef: "gtl://abg/review/multi-reviewer-assessment",
      libraryScope: "system",
      entryKind: "graph_function",
      namespace: ABG_REVIEW_MODULE_NAMESPACE,
      ownerRef: ABG_MODULE_OWNER_REF,
      version: ABG_MODULE_VERSION,
      graphFunctionRef: "graph-function://abg/review/multi-reviewer-assessment",
      interfaceRef: "interface://abg/review/typed-surface-assessment",
      sourceContractRef: "contract://abg/review/source", // typed surface + reviewer panel binding
      targetContractRef: "contract://abg/review/findings", // structured findings w/ profile id, config digest, invocation ref, output digest, evidence refs
      contextRefs: ["context://abg/review/reviewer-profiles"],
      authorityRefs: ["authority://abg/review/panel-binding"],
      overlayRefs: [],
      provenanceRefs: ["provenance://odd_sdlc/T-167-subsumption"],
      readinessRefs: [],
      proofRefs: ["proof://abg/review/multi-reviewer-findings-differential"],
      policyRefs: ["policy://abg/review/reviewer-selection-declared-only"],
      declarationSourceRefs: ["gtl://module/abg/review"]
    }),
    constructGtlLibraryEntryDeclaration({
      declarationRef: "gtl-declaration://abg/review/findings-to-rulings",
      entryRef: "gtl://abg/review/findings-to-rulings",
      libraryScope: "system",
      entryKind: "graph_function",
      namespace: ABG_REVIEW_MODULE_NAMESPACE,
      ownerRef: ABG_MODULE_OWNER_REF,
      version: ABG_MODULE_VERSION,
      graphFunctionRef: "graph-function://abg/review/findings-to-rulings",
      interfaceRef: "interface://abg/review/ruling-reduction",
      sourceContractRef: "contract://abg/review/findings",
      targetContractRef: "contract://abg/review/rulings", // TICKET_METHOD-shaped rows: decision_row | draft_ticket | split_ticket | deferment | rejected_finding
      contextRefs: [],
      authorityRefs: ["authority://abg/review/ticket-method"],
      overlayRefs: [],
      provenanceRefs: ["provenance://odd_sdlc/T-167-subsumption"],
      readinessRefs: [],
      proofRefs: ["proof://abg/review/ruling-vocabulary-closed"],
      policyRefs: [
        "policy://abg/review/host-admits-rulings-review-never-owns-status"
      ],
      declarationSourceRefs: ["gtl://module/abg/review"]
    })
  ]);

export const ABG_CONSENSUS_MODULE_DECLARATIONS: readonly GtlLibraryEntryDeclaration[] =
  Object.freeze([
    constructGtlLibraryEntryDeclaration({
      declarationRef:
        "gtl-declaration://abg/consensus/submitter-reviewer-rounds",
      entryRef: "gtl://abg/consensus/submitter-reviewer-rounds",
      libraryScope: "system",
      entryKind: "graph_function",
      namespace: ABG_CONSENSUS_MODULE_NAMESPACE,
      ownerRef: ABG_MODULE_OWNER_REF,
      version: ABG_MODULE_VERSION,
      graphFunctionRef:
        "graph-function://abg/consensus/submitter-reviewer-rounds",
      interfaceRef: "interface://abg/consensus/governed-rounds",
      sourceContractRef: "contract://abg/consensus/subject", // submitter subject + panel + declared round policy
      targetContractRef: "contract://abg/consensus/round-outcome", // decision alternatives + closed_done | recurse_next_round | escalate_fh
      contextRefs: ["context://abg/consensus/round-policy"],
      authorityRefs: ["authority://abg/consensus/declared-round-budget"],
      overlayRefs: [],
      provenanceRefs: ["provenance://odd_sdlc/T-166-subsumption"],
      readinessRefs: [],
      proofRefs: [
        "proof://abg/consensus/close-or-recurse-terminates-differential"
      ],
      policyRefs: ["policy://abg/consensus/recursion-stops-by-declared-law"],
      declarationSourceRefs: ["gtl://module/abg/consensus"]
    })
  ]);

export const ABG_SUBSUMED_MODULE_DECLARATIONS: readonly GtlLibraryEntryDeclaration[] =
  Object.freeze([
    ...ABG_REVIEW_MODULE_DECLARATIONS,
    ...ABG_CONSENSUS_MODULE_DECLARATIONS
  ]);
