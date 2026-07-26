import type { JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";

export interface ConsensusReviewerCandidate {
  readonly kind: "consensus_reviewer_candidate";
  readonly schemaVersion: "5.0.0";
  readonly recommendation: "accept" | "revise";
  readonly findings: readonly {
    readonly findingContractRef: string;
    readonly findingPayloadRef: string;
  }[];
  readonly residualRefs: readonly string[];
}

export interface ConsensusSubmitterResponseCandidate {
  readonly kind: "consensus_submitter_response_candidate";
  readonly schemaVersion: "5.0.0";
  readonly disposition:
    | "acknowledge"
    | "address_findings"
    | "dispute_findings";
  readonly responseText: string;
  readonly addressedFindingRefs: readonly string[];
  readonly residualFindingRefs: readonly string[];
}

const consensusReviewerResponseSchema = deepFreeze({
  type: "object",
  additionalProperties: false,
  required: [
    "kind",
    "schemaVersion",
    "recommendation",
    "findings",
    "residualRefs",
  ],
  properties: {
    kind: { const: "consensus_reviewer_candidate" },
    schemaVersion: { const: "5.0.0" },
    recommendation: { enum: ["accept", "revise"] },
    findings: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["findingContractRef", "findingPayloadRef"],
        properties: {
          findingContractRef: { type: "string", minLength: 1 },
          findingPayloadRef: { type: "string", minLength: 1 },
        },
      },
    },
    residualRefs: {
      type: "array",
      items: { type: "string", minLength: 1 },
      uniqueItems: true,
    },
  },
  allOf: [
    {
      if: {
        properties: {
          recommendation: { const: "accept" },
        },
        required: ["recommendation"],
      },
      then: {
        properties: {
          findings: { maxItems: 0 },
        },
      },
    },
    {
      if: {
        properties: {
          recommendation: { const: "revise" },
        },
        required: ["recommendation"],
      },
      then: {
        properties: {
          findings: { minItems: 1 },
        },
      },
    },
  ],
} as const satisfies JsonValue);

const consensusSubmitterResponseSchema = deepFreeze({
  type: "object",
  additionalProperties: false,
  required: [
    "kind",
    "schemaVersion",
    "disposition",
    "responseText",
    "addressedFindingRefs",
    "residualFindingRefs",
  ],
  properties: {
    kind: { const: "consensus_submitter_response_candidate" },
    schemaVersion: { const: "5.0.0" },
    disposition: {
      enum: ["acknowledge", "address_findings", "dispute_findings"],
    },
    responseText: { type: "string", minLength: 1 },
    addressedFindingRefs: {
      type: "array",
      items: { type: "string", minLength: 1 },
      uniqueItems: true,
    },
    residualFindingRefs: {
      type: "array",
      items: { type: "string", minLength: 1 },
      uniqueItems: true,
    },
  },
  allOf: [
    {
      if: {
        properties: {
          disposition: { const: "acknowledge" },
        },
        required: ["disposition"],
      },
      then: {
        properties: {
          addressedFindingRefs: { maxItems: 0 },
          residualFindingRefs: { maxItems: 0 },
        },
      },
    },
    {
      if: {
        properties: {
          disposition: { const: "address_findings" },
        },
        required: ["disposition"],
      },
      then: {
        properties: {
          addressedFindingRefs: { minItems: 1 },
          residualFindingRefs: { maxItems: 0 },
        },
      },
    },
    {
      if: {
        properties: {
          disposition: { const: "dispute_findings" },
        },
        required: ["disposition"],
      },
      then: {
        properties: {
          residualFindingRefs: { minItems: 1 },
        },
      },
    },
  ],
} as const satisfies JsonValue);

const consensusSubmitterResponseRecordSchema = deepFreeze({
  type: "object",
  additionalProperties: false,
  required: [
    "invocationRef",
    "responseRef",
    "outputDigest",
    "findingsVectorDigest",
    "roundRef",
    "roundOrdinal",
    "submittingActorRef",
    "profileRef",
    "disposition",
    "responseText",
    "addressedFindingRefs",
    "residualFindingRefs",
    "evidenceRefs",
  ],
  properties: {
    invocationRef: { $ref: "#/$defs/Ref" },
    responseRef: { $ref: "#/$defs/Ref" },
    outputDigest: { $ref: "#/$defs/Digest" },
    findingsVectorDigest: { $ref: "#/$defs/Digest" },
    roundRef: { $ref: "#/$defs/Ref" },
    roundOrdinal: { type: "integer", minimum: 1 },
    submittingActorRef: { $ref: "#/$defs/Ref" },
    profileRef: { $ref: "#/$defs/Ref" },
    disposition: {
      enum: ["acknowledge", "address_findings", "dispute_findings"],
    },
    responseText: { type: "string", minLength: 1 },
    addressedFindingRefs: { $ref: "#/$defs/RefArray" },
    residualFindingRefs: { $ref: "#/$defs/RefArray" },
    evidenceRefs: { $ref: "#/$defs/RefArray" },
  },
} as const satisfies JsonValue);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Readonly<Record<string, unknown>>,
  keys: readonly string[],
): boolean {
  return Object.keys(value).sort().join("\0") === [...keys].sort().join("\0");
}

export function isConsensusReviewerCandidate(
  value: unknown,
): value is ConsensusReviewerCandidate {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, consensusReviewerResponseSchema.required) ||
    value.kind !== "consensus_reviewer_candidate" ||
    value.schemaVersion !== "5.0.0" ||
    (value.recommendation !== "accept" && value.recommendation !== "revise") ||
    !Array.isArray(value.findings) ||
    !Array.isArray(value.residualRefs) ||
    !value.residualRefs.every(
      (ref) => typeof ref === "string" && ref.length > 0,
    ) ||
    new Set(value.residualRefs).size !== value.residualRefs.length ||
    !value.findings.every((finding) =>
      isRecord(finding) &&
      hasExactKeys(finding, ["findingContractRef", "findingPayloadRef"]) &&
      typeof finding.findingContractRef === "string" &&
      finding.findingContractRef.length > 0 &&
      typeof finding.findingPayloadRef === "string" &&
      finding.findingPayloadRef.length > 0
    )
  ) {
    return false;
  }
  return value.recommendation === "accept"
    ? value.findings.length === 0
    : value.findings.length > 0;
}

export function isConsensusSubmitterResponseCandidate(
  value: unknown,
): value is ConsensusSubmitterResponseCandidate {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, consensusSubmitterResponseSchema.required) ||
    value.kind !== "consensus_submitter_response_candidate" ||
    value.schemaVersion !== "5.0.0" ||
    ![
      "acknowledge",
      "address_findings",
      "dispute_findings",
    ].includes(String(value.disposition)) ||
    typeof value.responseText !== "string" ||
    value.responseText.length === 0 ||
    !Array.isArray(value.addressedFindingRefs) ||
    !value.addressedFindingRefs.every(
      (ref) => typeof ref === "string" && ref.length > 0,
    ) ||
    new Set(value.addressedFindingRefs).size !==
      value.addressedFindingRefs.length ||
    !Array.isArray(value.residualFindingRefs) ||
    !value.residualFindingRefs.every(
      (ref) => typeof ref === "string" && ref.length > 0,
    ) ||
    new Set(value.residualFindingRefs).size !==
      value.residualFindingRefs.length
  ) {
    return false;
  }
  if (value.disposition === "acknowledge") {
    return value.addressedFindingRefs.length === 0 &&
      value.residualFindingRefs.length === 0;
  }
  if (value.disposition === "address_findings") {
    return value.addressedFindingRefs.length > 0 &&
      value.residualFindingRefs.length === 0;
  }
  return value.residualFindingRefs.length > 0;
}

export const CONSENSUS_PUBLIC_SCHEMA = deepFreeze({
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "abg.schema.consensus@5",
  "title": "ABIogenesis Consensus Public Contracts",
  "description": "Canonical serialized field and value domains for the ABIogenesis 5 Consensus Product. Digest and cross-carrier equality invariants remain Product-owned admission laws.",
  "$defs": {
    "Ref": {
      "type": "string",
      "minLength": 1
    },
    "Digest": {
      "type": "string",
      "pattern": "^sha256:[0-9a-f]{64}$"
    },
    "RefArray": {
      "type": "array",
      "uniqueItems": true,
      "items": {
        "$ref": "#/$defs/Ref"
      },
    },
    "ReviewRulingKind": {
      "enum": [
        "decision_row",
        "draft_ticket",
        "split_ticket",
        "deferment",
        "rejected_finding"
      ],
    },
    "ConsensusRoundOutcomeValue": {
      "enum": [
        "closed_done",
        "recurse_next_round",
        "escalate_fh"
      ],
    },
    "ConsensusClassification": {
      "enum": [
        "unanimous_agreement",
        "partial_agreement_with_dissent",
        "unresolved_disagreement",
        "contract_failure"
      ],
    },
    "ConsensusReviewerCandidate": consensusReviewerResponseSchema,
    "ConsensusSubmitterResponseCandidate": consensusSubmitterResponseSchema,
    "ConsensusSubmitterResponseRecord":
      consensusSubmitterResponseRecordSchema,
    "ConsensusSubject": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "kind",
        "schemaVersion",
        "subjectContractRef",
        "subjectRef",
        "subjectDigest",
        "submittingActorRef",
        "panelRef",
        "roundPolicyRef",
        "workspaceRef",
        "ticketRef",
        "ticketDigest"
      ],
      "properties": {
        "kind": {
          "const": "consensus_subject"
        },
        "schemaVersion": {
          "const": "5.0.0"
        },
        "subjectContractRef": {
          "$ref": "#/$defs/Ref"
        },
        "subjectRef": {
          "$ref": "#/$defs/Ref"
        },
        "subjectDigest": {
          "$ref": "#/$defs/Digest"
        },
        "submittingActorRef": {
          "$ref": "#/$defs/Ref"
        },
        "panelRef": {
          "$ref": "#/$defs/Ref"
        },
        "roundPolicyRef": {
          "$ref": "#/$defs/Ref"
        },
        "workspaceRef": {
          "$ref": "#/$defs/Ref"
        },
        "ticketRef": {
          "oneOf": [
            {
              "$ref": "#/$defs/Ref"
            },
            {
              "type": "null"
            },
          ],
        },
        "ticketDigest": {
          "oneOf": [
            {
              "$ref": "#/$defs/Digest"
            },
            {
              "type": "null"
            },
          ],
        },
      },
      "allOf": [
        {
          "if": {
            "properties": {
              "ticketRef": {
                "type": "null"
              },
            },
          },
          "then": {
            "properties": {
              "ticketDigest": {
                "type": "null"
              },
            },
          },
          "else": {
            "properties": {
              "ticketDigest": {
                "$ref": "#/$defs/Digest"
              },
            },
          },
        },
      ],
    },
    "ConsensusSubjectMaterialization": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "kind",
        "schemaVersion",
        "materializationRef",
        "subjectContractRef",
        "subjectRef",
        "contentDigest",
        "mediaType",
        "content"
      ],
      "properties": {
        "kind": {
          "const": "consensus_subject_materialization"
        },
        "schemaVersion": {
          "const": "5.0.0"
        },
        "materializationRef": {
          "$ref": "#/$defs/Ref"
        },
        "subjectContractRef": {
          "$ref": "#/$defs/Ref"
        },
        "subjectRef": {
          "$ref": "#/$defs/Ref"
        },
        "contentDigest": {
          "$ref": "#/$defs/Digest"
        },
        "mediaType": {
          "const": "text/markdown; charset=utf-8"
        },
        "content": {
          "type": "string",
          "minLength": 1
        },
      },
    },
    "ConsensusReviewerInstruction": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "kind",
        "schemaVersion",
        "instructionContractRef",
        "roleContractRef",
        "instructionDigest",
        "instructionText",
        "responseSchema"
      ],
      "properties": {
        "kind": {
          "const": "consensus_reviewer_instruction"
        },
        "schemaVersion": {
          "const": "5.0.0"
        },
        "instructionContractRef": {
          "$ref": "#/$defs/Ref"
        },
        "roleContractRef": {
          "$ref": "#/$defs/Ref"
        },
        "instructionDigest": {
          "$ref": "#/$defs/Digest"
        },
        "instructionText": {
          "type": "string",
          "minLength": 1
        },
        "responseSchema": {
          "const": consensusReviewerResponseSchema
        },
      },
    },
    "ConsensusReviewerProfile": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "kind",
        "schemaVersion",
        "profileRef",
        "roleContractRef",
        "configurationDigest",
        "instructionContractRef",
        "instructionDigest",
        "resultContractRef",
        "capabilityRefs",
        "actorRef",
        "workerBindingRef"
      ],
      "properties": {
        "kind": {
          "const": "consensus_reviewer_profile"
        },
        "schemaVersion": {
          "const": "5.0.0"
        },
        "profileRef": {
          "$ref": "#/$defs/Ref"
        },
        "roleContractRef": {
          "$ref": "#/$defs/Ref"
        },
        "configurationDigest": {
          "$ref": "#/$defs/Digest"
        },
        "instructionContractRef": {
          "$ref": "#/$defs/Ref"
        },
        "instructionDigest": {
          "$ref": "#/$defs/Digest"
        },
        "resultContractRef": {
          "const": "contract://abg/schema/review-findings@5"
        },
        "capabilityRefs": {
          "$ref": "#/$defs/RefArray"
        },
        "actorRef": {
          "$ref": "#/$defs/Ref"
        },
        "workerBindingRef": {
          "$ref": "#/$defs/Ref"
        },
      },
    },
    "ConsensusSubmitterInstruction": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "kind",
        "schemaVersion",
        "instructionContractRef",
        "roleContractRef",
        "instructionDigest",
        "instructionText",
        "responseSchema"
      ],
      "properties": {
        "kind": {
          "const": "consensus_submitter_instruction"
        },
        "schemaVersion": {
          "const": "5.0.0"
        },
        "instructionContractRef": {
          "$ref": "#/$defs/Ref"
        },
        "roleContractRef": {
          "$ref": "#/$defs/Ref"
        },
        "instructionDigest": {
          "$ref": "#/$defs/Digest"
        },
        "instructionText": {
          "type": "string",
          "minLength": 1
        },
        "responseSchema": {
          "const": consensusSubmitterResponseSchema
        },
      },
    },
    "ConsensusSubmitterProfile": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "kind",
        "schemaVersion",
        "profileRef",
        "roleContractRef",
        "configurationDigest",
        "instructionContractRef",
        "instructionDigest",
        "resultContractRef",
        "capabilityRefs",
        "actorRef",
        "workerBindingRef"
      ],
      "properties": {
        "kind": {
          "const": "consensus_submitter_profile"
        },
        "schemaVersion": {
          "const": "5.0.0"
        },
        "profileRef": {
          "$ref": "#/$defs/Ref"
        },
        "roleContractRef": {
          "$ref": "#/$defs/Ref"
        },
        "configurationDigest": {
          "$ref": "#/$defs/Digest"
        },
        "instructionContractRef": {
          "$ref": "#/$defs/Ref"
        },
        "instructionDigest": {
          "$ref": "#/$defs/Digest"
        },
        "resultContractRef": {
          "const": "contract://abg/consensus/submitter-response@5"
        },
        "capabilityRefs": {
          "$ref": "#/$defs/RefArray"
        },
        "actorRef": {
          "$ref": "#/$defs/Ref"
        },
        "workerBindingRef": {
          "$ref": "#/$defs/Ref"
        },
      },
    },
    "ConsensusPanel": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "kind",
        "schemaVersion",
        "panelRef",
        "panelDigest",
        "profiles"
      ],
      "properties": {
        "kind": {
          "const": "consensus_panel"
        },
        "schemaVersion": {
          "const": "5.0.0"
        },
        "panelRef": {
          "$ref": "#/$defs/Ref"
        },
        "panelDigest": {
          "$ref": "#/$defs/Digest"
        },
        "profiles": {
          "type": "array",
          "minItems": 1,
          "uniqueItems": true,
          "items": {
            "$ref": "#/$defs/ConsensusReviewerProfile"
          },
        },
      },
    },
    "ConsensusRoundPolicy": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "kind",
        "schemaVersion",
        "policyRef",
        "policyDigest",
        "roundBudget",
        "convergenceRuleRef",
        "disagreementRuleRef",
        "escalationRuleRef",
        "foldbackContractRef"
      ],
      "properties": {
        "kind": {
          "const": "consensus_round_policy"
        },
        "schemaVersion": {
          "const": "5.0.0"
        },
        "policyRef": {
          "$ref": "#/$defs/Ref"
        },
        "policyDigest": {
          "$ref": "#/$defs/Digest"
        },
        "roundBudget": {
          "type": "integer",
          "minimum": 1,
          "maximum": 4
        },
        "convergenceRuleRef": {
          "const": "rule://abg/consensus/exact-agreement@5"
        },
        "disagreementRuleRef": {
          "const": "rule://abg/consensus/material-dispute@5"
        },
        "escalationRuleRef": {
          "const": "rule://abg/consensus/unresolved-to-fh@5"
        },
        "foldbackContractRef": {
          "const": "contract://abg/consensus/round-foldback@5"
        },
      },
    },
    "ReviewFinding": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "findingRef",
        "findingContractRef",
        "findingPayloadRef",
        "evidenceRefs"
      ],
      "properties": {
        "findingRef": {
          "$ref": "#/$defs/Ref"
        },
        "findingContractRef": {
          "$ref": "#/$defs/Ref"
        },
        "findingPayloadRef": {
          "$ref": "#/$defs/Ref"
        },
        "evidenceRefs": {
          "$ref": "#/$defs/RefArray"
        },
      },
    },
    "ReviewRuling": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "rulingRef",
        "rulingKind",
        "findingRefs",
        "rationaleRef",
        "payloadRef"
      ],
      "properties": {
        "rulingRef": {
          "$ref": "#/$defs/Ref"
        },
        "rulingKind": {
          "$ref": "#/$defs/ReviewRulingKind"
        },
        "findingRefs": {
          "$ref": "#/$defs/RefArray"
        },
        "rationaleRef": {
          "$ref": "#/$defs/Ref"
        },
        "payloadRef": {
          "$ref": "#/$defs/Ref"
        },
      },
    },
    "ReviewRulings": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/ReviewRuling"
      },
    },
    "ConsensusReviewerTask": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "kind",
        "schemaVersion",
        "invocationRef",
        "roundRef",
        "roundOrdinal",
        "subject",
        "subjectMaterialization",
        "panel",
        "policy",
        "profile",
        "instruction",
        "submitterProfile",
        "submitterInstruction",
        "priorRoundRefs",
        "priorFindingSetRefs",
        "priorRulings",
        "priorDissentProfileRefs",
        "priorSubmitterResponses",
        "priorEvidenceRefs",
        "transportLane"
      ],
      "properties": {
        "kind": {
          "const": "consensus_reviewer_task"
        },
        "schemaVersion": {
          "const": "5.0.0"
        },
        "invocationRef": {
          "$ref": "#/$defs/Ref"
        },
        "roundRef": {
          "$ref": "#/$defs/Ref"
        },
        "roundOrdinal": {
          "type": "integer",
          "minimum": 1
        },
        "subject": {
          "$ref": "#/$defs/ConsensusSubject"
        },
        "subjectMaterialization": {
          "$ref": "#/$defs/ConsensusSubjectMaterialization"
        },
        "panel": {
          "$ref": "#/$defs/ConsensusPanel"
        },
        "policy": {
          "$ref": "#/$defs/ConsensusRoundPolicy"
        },
        "profile": {
          "$ref": "#/$defs/ConsensusReviewerProfile"
        },
        "instruction": {
          "$ref": "#/$defs/ConsensusReviewerInstruction"
        },
        "submitterProfile": {
          "$ref": "#/$defs/ConsensusSubmitterProfile"
        },
        "submitterInstruction": {
          "$ref": "#/$defs/ConsensusSubmitterInstruction"
        },
        "priorRoundRefs": {
          "$ref": "#/$defs/RefArray"
        },
        "priorFindingSetRefs": {
          "$ref": "#/$defs/RefArray"
        },
        "priorRulings": {
          "$ref": "#/$defs/ReviewRulings"
        },
        "priorDissentProfileRefs": {
          "$ref": "#/$defs/RefArray"
        },
        "priorSubmitterResponses": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/ConsensusSubmitterResponseRecord"
          },
        },
        "priorEvidenceRefs": {
          "$ref": "#/$defs/RefArray"
        },
        "transportLane": {
          "enum": [
            "closed_prompt_proof",
            "worker_executes"
          ],
        },
      },
    },
    "ReviewFindings": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "kind",
        "schemaVersion",
        "profileRef",
        "configurationDigest",
        "invocationRef",
        "roundRef",
        "roundOrdinal",
        "recommendation",
        "outputDigest",
        "evidenceRefs",
        "findings",
        "residualRefs",
        "refusalRef",
        "task"
      ],
      "properties": {
        "kind": {
          "const": "review_findings"
        },
        "schemaVersion": {
          "const": "5.0.0"
        },
        "profileRef": {
          "$ref": "#/$defs/Ref"
        },
        "configurationDigest": {
          "$ref": "#/$defs/Digest"
        },
        "invocationRef": {
          "$ref": "#/$defs/Ref"
        },
        "roundRef": {
          "$ref": "#/$defs/Ref"
        },
        "roundOrdinal": {
          "type": "integer",
          "minimum": 1
        },
        "recommendation": {
          "enum": [
            "accept",
            "revise"
          ],
        },
        "outputDigest": {
          "$ref": "#/$defs/Digest"
        },
        "evidenceRefs": {
          "$ref": "#/$defs/RefArray"
        },
        "findings": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/ReviewFinding"
          },
        },
        "residualRefs": {
          "$ref": "#/$defs/RefArray"
        },
        "refusalRef": {
          "oneOf": [
            {
              "$ref": "#/$defs/Ref"
            },
            {
              "type": "null"
            },
          ],
        },
        "task": {
          "$ref": "#/$defs/ConsensusReviewerTask"
        },
      },
      "oneOf": [
        {
          "properties": {
            "refusalRef": {
              "type": "null"
            },
          },
          "allOf": [
            {
              "if": {
                "properties": {
                  "recommendation": {
                    "const": "accept"
                  },
                },
              },
              "then": {
                "properties": {
                  "findings": {
                    "maxItems": 0
                  },
                },
              },
              "else": {
                "properties": {
                  "findings": {
                    "minItems": 1
                  },
                },
              },
            },
          ],
        },
        {
          "properties": {
            "refusalRef": {
              "$ref": "#/$defs/Ref"
            },
            "recommendation": {
              "const": "revise"
            },
            "findings": {
              "maxItems": 0
            },
            "residualRefs": {
              "type": "array",
              "minItems": 1,
              "uniqueItems": true,
              "items": {
                "$ref": "#/$defs/Ref"
              },
            },
          },
        },
      ],
    },
    "ConsensusFindingsVector": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "kind",
        "schemaVersion",
        "applicationRef",
        "members"
      ],
      "properties": {
        "kind": {
          "const": "gtl_fan_out_vector"
        },
        "schemaVersion": {
          "const": "5.0.0"
        },
        "applicationRef": {
          "$ref": "#/$defs/Ref"
        },
        "members": {
          "type": "array",
          "minItems": 1,
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": [
              "ordinal",
              "inputMemberRef",
              "outputMemberRef",
              "value"
            ],
            "properties": {
              "ordinal": {
                "type": "integer",
                "minimum": 0
              },
              "inputMemberRef": {
                "$ref": "#/$defs/Ref"
              },
              "outputMemberRef": {
                "$ref": "#/$defs/Ref"
              },
              "value": {
                "$ref": "#/$defs/ReviewFindings"
              },
            },
          },
        },
      },
    },
    "ConsensusSubmitterTask": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "kind",
        "schemaVersion",
        "invocationRef",
        "roundRef",
        "roundOrdinal",
        "subject",
        "subjectMaterialization",
        "panel",
        "policy",
        "profile",
        "instruction",
        "findingsVector",
        "priorRoundRefs",
        "priorSubmitterResponseRefs",
        "priorEvidenceRefs",
        "transportLane"
      ],
      "properties": {
        "kind": {
          "const": "consensus_submitter_task"
        },
        "schemaVersion": {
          "const": "5.0.0"
        },
        "invocationRef": {
          "$ref": "#/$defs/Ref"
        },
        "roundRef": {
          "$ref": "#/$defs/Ref"
        },
        "roundOrdinal": {
          "type": "integer",
          "minimum": 1
        },
        "subject": {
          "$ref": "#/$defs/ConsensusSubject"
        },
        "subjectMaterialization": {
          "$ref": "#/$defs/ConsensusSubjectMaterialization"
        },
        "panel": {
          "$ref": "#/$defs/ConsensusPanel"
        },
        "policy": {
          "$ref": "#/$defs/ConsensusRoundPolicy"
        },
        "profile": {
          "$ref": "#/$defs/ConsensusSubmitterProfile"
        },
        "instruction": {
          "$ref": "#/$defs/ConsensusSubmitterInstruction"
        },
        "findingsVector": {
          "$ref": "#/$defs/ConsensusFindingsVector"
        },
        "priorRoundRefs": {
          "$ref": "#/$defs/RefArray"
        },
        "priorSubmitterResponseRefs": {
          "$ref": "#/$defs/RefArray"
        },
        "priorEvidenceRefs": {
          "$ref": "#/$defs/RefArray"
        },
        "transportLane": {
          "enum": [
            "closed_prompt_proof",
            "worker_executes"
          ],
        },
      },
    },
    "ConsensusSubmitterResponse": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "kind",
        "schemaVersion",
        ...consensusSubmitterResponseRecordSchema.required,
        "configurationDigest",
        "task"
      ],
      "properties": {
        "kind": {
          "const": "consensus_submitter_response"
        },
        "schemaVersion": {
          "const": "5.0.0"
        },
        ...consensusSubmitterResponseRecordSchema.properties,
        "configurationDigest": {
          "$ref": "#/$defs/Digest"
        },
        "task": {
          "$ref": "#/$defs/ConsensusSubmitterTask"
        },
      },
    },
    "ConsensusRoundOutcome": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "kind",
        "schemaVersion",
        "roundRef",
        "outcome",
        "findingSetRefs",
        "rulingRefs",
        "evidenceRefs"
      ],
      "properties": {
        "kind": {
          "const": "consensus_round_outcome"
        },
        "schemaVersion": {
          "const": "5.0.0"
        },
        "roundRef": {
          "$ref": "#/$defs/Ref"
        },
        "outcome": {
          "$ref": "#/$defs/ConsensusRoundOutcomeValue"
        },
        "findingSetRefs": {
          "$ref": "#/$defs/RefArray"
        },
        "rulingRefs": {
          "$ref": "#/$defs/RefArray"
        },
        "evidenceRefs": {
          "$ref": "#/$defs/RefArray"
        },
      },
    },
    "ConsensusResult": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "kind",
        "schemaVersion",
        "subjectRef",
        "subjectDigest",
        "panelRef",
        "policyRef",
        "roundRefs",
        "findingSetRefs",
        "submitterResponseRefs",
        "rulings",
        "classification",
        "dissentProfileRefs",
        "terminalOutcome",
        "evidenceRefs",
        "lineageRefs",
        "resultRef",
        "contractFailureRef",
        "replayRef"
      ],
      "properties": {
        "kind": {
          "const": "consensus_result"
        },
        "schemaVersion": {
          "const": "5.0.0"
        },
        "subjectRef": {
          "$ref": "#/$defs/Ref"
        },
        "subjectDigest": {
          "$ref": "#/$defs/Digest"
        },
        "panelRef": {
          "$ref": "#/$defs/Ref"
        },
        "policyRef": {
          "$ref": "#/$defs/Ref"
        },
        "roundRefs": {
          "type": "array",
          "minItems": 1,
          "uniqueItems": true,
          "items": {
            "$ref": "#/$defs/Ref"
          },
        },
        "findingSetRefs": {
          "$ref": "#/$defs/RefArray"
        },
        "submitterResponseRefs": {
          "$ref": "#/$defs/RefArray"
        },
        "rulings": {
          "$ref": "#/$defs/ReviewRulings"
        },
        "classification": {
          "$ref": "#/$defs/ConsensusClassification"
        },
        "dissentProfileRefs": {
          "$ref": "#/$defs/RefArray"
        },
        "terminalOutcome": {
          "$ref": "#/$defs/ConsensusRoundOutcome"
        },
        "evidenceRefs": {
          "$ref": "#/$defs/RefArray"
        },
        "lineageRefs": {
          "type": "array",
          "minItems": 1,
          "uniqueItems": true,
          "items": {
            "$ref": "#/$defs/Ref"
          },
        },
        "resultRef": {
          "$ref": "#/$defs/Ref"
        },
        "contractFailureRef": {
          "oneOf": [
            {
              "$ref": "#/$defs/Ref"
            },
            {
              "type": "null"
            },
          ],
        },
        "replayRef": {
          "$ref": "#/$defs/Ref"
        },
      },
      "allOf": [
        {
          "if": {
            "properties": {
              "classification": {
                "const": "contract_failure"
              },
            },
          },
          "then": {
            "properties": {
              "contractFailureRef": {
                "$ref": "#/$defs/Ref"
              },
            },
          },
          "else": {
            "properties": {
              "contractFailureRef": {
                "type": "null"
              },
            },
          },
        },
      ],
    },
    "TicketConsensusProjection": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "kind",
        "schemaVersion",
        "projectionRef",
        "projectionDigest",
        "ticketRef",
        "ticketDigest",
        "subjectRef",
        "subjectDigest",
        "panelRef",
        "policyRef",
        "roundRefs",
        "findingSetRefs",
        "submitterResponseRefs",
        "rulings",
        "classification",
        "dissentProfileRefs",
        "terminalOutcome",
        "evidenceRefs",
        "lineageRefs",
        "resultRef",
        "replayRef"
      ],
      "properties": {
        "kind": {
          "const": "ticket_consensus_projection"
        },
        "schemaVersion": {
          "const": "5.0.0"
        },
        "projectionRef": {
          "$ref": "#/$defs/Ref"
        },
        "projectionDigest": {
          "$ref": "#/$defs/Digest"
        },
        "ticketRef": {
          "$ref": "#/$defs/Ref"
        },
        "ticketDigest": {
          "$ref": "#/$defs/Digest"
        },
        "subjectRef": {
          "$ref": "#/$defs/Ref"
        },
        "subjectDigest": {
          "$ref": "#/$defs/Digest"
        },
        "panelRef": {
          "$ref": "#/$defs/Ref"
        },
        "policyRef": {
          "$ref": "#/$defs/Ref"
        },
        "roundRefs": {
          "type": "array",
          "minItems": 1,
          "uniqueItems": true,
          "items": {
            "$ref": "#/$defs/Ref"
          },
        },
        "findingSetRefs": {
          "$ref": "#/$defs/RefArray"
        },
        "submitterResponseRefs": {
          "$ref": "#/$defs/RefArray"
        },
        "rulings": {
          "$ref": "#/$defs/ReviewRulings"
        },
        "classification": {
          "$ref": "#/$defs/ConsensusClassification"
        },
        "dissentProfileRefs": {
          "$ref": "#/$defs/RefArray"
        },
        "terminalOutcome": {
          "$ref": "#/$defs/ConsensusRoundOutcome"
        },
        "evidenceRefs": {
          "$ref": "#/$defs/RefArray"
        },
        "lineageRefs": {
          "type": "array",
          "minItems": 1,
          "uniqueItems": true,
          "items": {
            "$ref": "#/$defs/Ref"
          },
        },
        "resultRef": {
          "$ref": "#/$defs/Ref"
        },
        "replayRef": {
          "$ref": "#/$defs/Ref"
        },
      },
    },
  },
  "x-abiogenesis-invariants": [
    "All digests are recomputed from their Product-declared canonical bodies.",
    "Panel profile identities and all reference arrays governed as sets are duplicate-free.",
    "Subject, panel, policy, task, finding, result, ticket, workspace, and replay identities agree across their containing carriers.",
    "Reviewer and submitter instructions plus subject materialization match the exact digests and identities selected by the invocation.",
    "Each round binds one exact attributed submitter response to its complete admitted findings vector before reduction or recursion.",
    "Consensus classification is contract_failure exactly when contractFailureRef is non-null."
  ],
} as const satisfies JsonValue);

export const REVIEW_RULING_KIND_VALUES =
  CONSENSUS_PUBLIC_SCHEMA.$defs.ReviewRulingKind.enum;
export const CONSENSUS_ROUND_OUTCOME_VALUES =
  CONSENSUS_PUBLIC_SCHEMA.$defs.ConsensusRoundOutcomeValue.enum;
export const CONSENSUS_CLASSIFICATION_VALUES =
  CONSENSUS_PUBLIC_SCHEMA.$defs.ConsensusClassification.enum;
export const CONSENSUS_REVIEWER_RESPONSE_SCHEMA =
  consensusReviewerResponseSchema;
export const CONSENSUS_SUBMITTER_RESPONSE_SCHEMA =
  consensusSubmitterResponseSchema;

export const CONSENSUS_SCHEMA_REQUIRED_KEYS = deepFreeze({
  ConsensusSubject: CONSENSUS_PUBLIC_SCHEMA.$defs.ConsensusSubject.required,
  ConsensusSubjectMaterialization:
    CONSENSUS_PUBLIC_SCHEMA.$defs.ConsensusSubjectMaterialization.required,
  ConsensusReviewerInstruction:
    CONSENSUS_PUBLIC_SCHEMA.$defs.ConsensusReviewerInstruction.required,
  ConsensusReviewerProfile:
    CONSENSUS_PUBLIC_SCHEMA.$defs.ConsensusReviewerProfile.required,
  ConsensusSubmitterInstruction:
    CONSENSUS_PUBLIC_SCHEMA.$defs.ConsensusSubmitterInstruction.required,
  ConsensusSubmitterProfile:
    CONSENSUS_PUBLIC_SCHEMA.$defs.ConsensusSubmitterProfile.required,
  ConsensusPanel: CONSENSUS_PUBLIC_SCHEMA.$defs.ConsensusPanel.required,
  ConsensusRoundPolicy:
    CONSENSUS_PUBLIC_SCHEMA.$defs.ConsensusRoundPolicy.required,
  ConsensusReviewerTask:
    CONSENSUS_PUBLIC_SCHEMA.$defs.ConsensusReviewerTask.required,
  ConsensusFindingsVector:
    CONSENSUS_PUBLIC_SCHEMA.$defs.ConsensusFindingsVector.required,
  ConsensusSubmitterTask:
    CONSENSUS_PUBLIC_SCHEMA.$defs.ConsensusSubmitterTask.required,
  ConsensusSubmitterResponseRecord:
    CONSENSUS_PUBLIC_SCHEMA.$defs.ConsensusSubmitterResponseRecord.required,
  ConsensusSubmitterResponse:
    CONSENSUS_PUBLIC_SCHEMA.$defs.ConsensusSubmitterResponse.required,
  ReviewFinding: CONSENSUS_PUBLIC_SCHEMA.$defs.ReviewFinding.required,
  ReviewFindings: CONSENSUS_PUBLIC_SCHEMA.$defs.ReviewFindings.required,
  ReviewRuling: CONSENSUS_PUBLIC_SCHEMA.$defs.ReviewRuling.required,
  ConsensusRoundOutcome:
    CONSENSUS_PUBLIC_SCHEMA.$defs.ConsensusRoundOutcome.required,
  ConsensusResultCandidate:
    CONSENSUS_PUBLIC_SCHEMA.$defs.ConsensusResult.required.filter(
      (key) => key !== "replayRef",
    ),
  ConsensusResult: CONSENSUS_PUBLIC_SCHEMA.$defs.ConsensusResult.required,
  TicketConsensusProjection:
    CONSENSUS_PUBLIC_SCHEMA.$defs.TicketConsensusProjection.required,
});
