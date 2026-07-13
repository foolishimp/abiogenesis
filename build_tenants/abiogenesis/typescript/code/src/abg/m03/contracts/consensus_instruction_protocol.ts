// Implements: T-256 product declaration data for REQ-P-CONSENSUS-004..012.
// The generic compiler remains in declared_execution_context.ts.

import {
  constructNode,
  emptySerializedAttrs
} from "../../../gtl/m01/contracts/constructors.js";
import {
  constructNodeTypeGraphFunction
} from "../../../gtl/m01/algebra/core.js";
import type { Node, Rule } from "../../../gtl/m01/contracts/carriers.js";
import { constructModule } from "../../../gtl/m02/contracts/constructors.js";
import type { Module } from "../../../gtl/m02/contracts/carriers.js";
import { constructGtlLibraryEntryDeclaration } from "../../../gtl/m02/contracts/runtime_registry.js";
import type { GtlLibraryEntryDeclaration } from "../../../gtl/m02/contracts/runtime_registry.js";
import { sha256DigestForText } from "../../../shared/runtime_identity.js";
import { ABG_CONSENSUS_GTL_BODY } from "./consensus_gtl_body.js";
import {
  constructExecutionContextProjectionRule,
  constructInstructionProtocolRule,
  type ExecutionContextFieldRowDeclaration
} from "./declared_execution_context.js";

export const CONSENSUS_INSTRUCTION_DECLARATION_MODULE_REF =
  "gtl://module/abg/consensus/instruction-protocol" as const;
export const CONSENSUS_INSTRUCTION_DECLARATION_ENTRY_REF =
  "gtl://abg/consensus/instruction-protocol-declarations" as const;

const F_P_FIELD_ROWS: readonly Omit<
  ExecutionContextFieldRowDeclaration,
  "fieldPath"
>[] = Object.freeze([
  Object.freeze({
    slot: "role_or_worker_selection_ref",
    valueKind: "ref",
    required: true
  }),
  Object.freeze({
    slot: "configuration_digest",
    valueKind: "digest",
    required: true
  }),
  Object.freeze({
    slot: "instruction_protocol_ref",
    valueKind: "ref",
    required: true
  }),
  Object.freeze({
    slot: "result_contract_ref",
    valueKind: "ref",
    required: true
  }),
  Object.freeze({
    slot: "capability_requirement_refs",
    valueKind: "ref_list",
    required: true
  })
]);

const F_H_FIELD_ROWS: readonly Omit<
  ExecutionContextFieldRowDeclaration,
  "fieldPath"
>[] = Object.freeze([
  Object.freeze({
    slot: "interaction_subject_ref",
    valueKind: "ref",
    required: true
  }),
  Object.freeze({
    slot: "instruction_protocol_ref",
    valueKind: "ref",
    required: true
  }),
  Object.freeze({
    slot: "result_contract_ref",
    valueKind: "ref",
    required: true
  }),
  Object.freeze({
    slot: "capability_requirement_refs",
    valueKind: "ref_list",
    required: true
  })
]);

function instructionAssetNode(name: string, slug: string): Node {
  return constructNode({
    id: `node://abg/consensus/instruction/${slug}`,
    name,
    schema: {
      kind: "symbolic",
      ref: `schema://abg/consensus/instruction/${slug}`
    },
    typeRef: `type://abg/consensus/instruction/${slug}`,
    markov: [`boundary://abg/consensus/instruction/${slug}`],
    assetSurface: {
      kind: `abg_consensus_${slug.replaceAll("-", "_")}_instruction`,
      requiredContexts: ["context://abg/consensus/round"],
      standardsRefs: [
        "REQ-P-CONSENSUS",
        "REQ-R-ABG3-INSTRUCTION-ASSEMBLY"
      ],
      outputContractRefs: [
        `contract://abg/consensus/instruction/${slug}`
      ],
      constructorRefs: [
        `constructor://abg/consensus/instruction/${slug}`
      ],
      constructorInputAssetKinds: ["consensus_context"],
      rendererRefs: ["renderer://abg/instruction/prompt-manifest"],
      renderedViewDigestPolicyRef:
        "policy://abg/instruction/rendered-view-digest",
      sectionKindRefs: ["section-kind://abg/instruction/context"],
      clauseKindRefs: ["clause-kind://abg/instruction/constraint"],
      authoritySlots: [
        {
          authorityKindRef: "authority://abg/consensus/declaration",
          disposition: "bounded_fallback",
          fallbackPreconditionRefs: [
            "precondition://abg/consensus/declaration-admitted"
          ]
        }
      ],
      proofObligationRefs: [
        `proof://abg/consensus/instruction/${slug}`
      ]
    },
    tags: ["abg:consensus", "gtl:instruction-asset", "t256"]
  });
}

function fieldRows(
  regime: "F_P" | "F_H"
): readonly ExecutionContextFieldRowDeclaration[] {
  return Object.freeze(
    (regime === "F_P" ? F_P_FIELD_ROWS : F_H_FIELD_ROWS).map((row) =>
      Object.freeze({
        ...row,
        fieldPath: `fields.${row.slot}`
      })
    )
  );
}

function projectionRule(input: {
  readonly slug: string;
  readonly sourceNodeRef: string;
  readonly regime: "F_P" | "F_H";
}): Rule {
  return constructExecutionContextProjectionRule({
    projectionRef: `execution-context-projection://abg/consensus/${input.slug}`,
    version: "1.0.0",
    sourceNodeRef: input.sourceNodeRef,
    fieldRows: fieldRows(input.regime),
    policyRefs: ["policy://abg/consensus/execution-context"]
  });
}

function protocolRule(input: {
  readonly slug: string;
  readonly node: Node;
  readonly stageRoles: readonly string[];
  readonly content: string;
}): Rule {
  const sectionRef = `instruction-section://abg/consensus/${input.slug}`;
  return constructInstructionProtocolRule({
    instructionProtocolRef: `instruction-protocol://abg/consensus/${input.slug}`,
    version: "1.0.0",
    instructionAssetNodeRef: input.node.id,
    allowedStageRoles: input.stageRoles,
    sections: [
      {
        sectionRef,
        sectionKindRef: "section-kind://abg/instruction/context",
        content: input.content,
        contentDigest: sha256DigestForText(input.content),
        required: true,
        policyRefs: ["policy://abg/consensus/instruction/full-content"]
      }
    ],
    relevancePolicies: [
      {
        policyRef: `relevance://abg/consensus/${input.slug}/current-stage`,
        mode: "selected_vector_source_closure"
      }
    ],
    compressionPolicy: {
      policyRef: "policy://abg/consensus/instruction/compression",
      mode: "full_admitted_content"
    },
    proportionalityPolicyRef:
      "policy://abg/consensus/instruction/proportionality",
    runtimeBindingSlotClasses: ["source_node"],
    policyRefs: ["policy://abg/consensus/instruction"]
  });
}

function constructConsensusInstructionDeclarationModule(): Module {
  const nodes = Object.freeze({
    reviewer: instructionAssetNode("ConsensusReviewerInstruction", "reviewer"),
    reducer: instructionAssetNode("ConsensusReducerInstruction", "reducer"),
    submitter: instructionAssetNode("ConsensusSubmitterInstruction", "submitter"),
    human: instructionAssetNode("ConsensusHumanInstruction", "human")
  });
  const graphFunctions = Object.freeze(
    Object.values(nodes).map((nodeValue) =>
      constructNodeTypeGraphFunction(nodeValue)
    )
  );
  const sourceNodes = ABG_CONSENSUS_GTL_BODY.nodes;
  const rules = Object.freeze([
    projectionRule({
      slug: "reviewer-assignment",
      sourceNodeRef: sourceNodes.reviewerAssignment.id,
      regime: "F_P"
    }),
    projectionRule({
      slug: "semantic-reducer-binding",
      sourceNodeRef: sourceNodes.semanticReducerBinding.id,
      regime: "F_P"
    }),
    projectionRule({
      slug: "submitter-turn-binding",
      sourceNodeRef: sourceNodes.submitterTurnBinding.id,
      regime: "F_P"
    }),
    projectionRule({
      slug: "fh-interaction-binding",
      sourceNodeRef: sourceNodes.fhInteractionBinding.id,
      regime: "F_H"
    }),
    protocolRule({
      slug: "reviewer",
      node: nodes.reviewer,
      stageRoles: ["invoke_attributed_reviewer"],
      content:
        "Assess the admitted Consensus subject under the selected reviewer profile and return the declared review-findings contract."
    }),
    protocolRule({
      slug: "reducer",
      node: nodes.reducer,
      stageRoles: ["reduce_round", "reassess_round"],
      content:
        "Evaluate admitted attributed findings and round evidence under the declared reduction policy; preserve disagreement and typed residuals."
    }),
    protocolRule({
      slug: "submitter",
      node: nodes.submitter,
      stageRoles: ["submitter_response"],
      content:
        "Respond to the admitted initial semantic assessment under the declared submitter contract without changing ticket or closure authority."
    }),
    protocolRule({
      slug: "human",
      node: nodes.human,
      stageRoles: ["hold_initial_for_fh", "hold_post_for_fh"],
      content:
        "Present the admitted unresolved Consensus interaction to human authority and preserve the declared subject, evidence, and result contracts."
    })
  ]);
  return constructModule({
    name: "abg.consensus.instruction-protocol",
    graphs: [],
    graphFunctions,
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [],
    roles: [],
    operators: [],
    evaluators: [],
    rules,
    imports: [],
    policyHooks: emptySerializedAttrs(),
    metadata: emptySerializedAttrs()
  });
}

export const ABG_CONSENSUS_INSTRUCTION_DECLARATION_MODULE =
  constructConsensusInstructionDeclarationModule();

const companionIdentityGraphFunction =
  ABG_CONSENSUS_INSTRUCTION_DECLARATION_MODULE.graphFunctions[0];
if (companionIdentityGraphFunction === undefined) {
  throw new TypeError("Consensus instruction declaration Module is empty");
}

export const ABG_CONSENSUS_INSTRUCTION_DECLARATION: GtlLibraryEntryDeclaration =
  constructGtlLibraryEntryDeclaration({
    declarationRef:
      "gtl-declaration://abg/consensus/instruction-protocol-declarations",
    entryRef: CONSENSUS_INSTRUCTION_DECLARATION_ENTRY_REF,
    libraryScope: "system",
    entryKind: "node_type",
    namespace: "abg.consensus",
    ownerRef: "owner://abg/substrate",
    version: "5.0.0-dev.0",
    graphFunctionRef: companionIdentityGraphFunction.name,
    interfaceRef: "interface://abg/consensus/instruction-protocol-declarations",
    sourceContractRef: companionIdentityGraphFunction.inputs[0]?.schema.ref ??
      "schema://abg/consensus/instruction/reviewer",
    targetContractRef: companionIdentityGraphFunction.outputs[0]?.schema.ref ??
      "schema://abg/consensus/instruction/reviewer",
    contextRefs: ["context://abg/consensus/round"],
    authorityRefs: ["authority://abg/consensus/declaration"],
    overlayRefs: [],
    provenanceRefs: ["ticket://abiogenesis/T-256"],
    readinessRefs: ["readiness://abg/consensus/instruction-declarations"],
    proofRefs: ["proof://abg/consensus/instruction-protocol-declarations"],
    policyRefs: ["policy://abg/consensus/instruction"],
    declarationSourceRefs: [CONSENSUS_INSTRUCTION_DECLARATION_MODULE_REF]
  });
