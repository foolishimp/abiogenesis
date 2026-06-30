// Validates: T-180 live closure gate

import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  contractForKnownAgent,
  runAgentTransport
} from "../../build/semantic/code/src/shared/abg_library/index.js";
import {
  compose,
  composeNodeTypes,
  composeWithTypeWiring,
  constructNode,
  constructNodeTypeGraphFunction,
  edge,
  graphFunctionForVector,
  satisfiesNodeType
} from "../../build/semantic/code/src/gtl/m01/index.js";
import { executorProfileFields } from "./support/executor_profile.mjs";

const LIVE_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.resolve(LIVE_DIR, "..");
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "t180_gtl_node_types_live"
);

const TYPE_REFS = Object.freeze({
  reviewDocument: "node-type://odd_glc/ReviewDocument",
  reviewEvidence: "node-type://odd_glc/ReviewEvidenceDocument",
  serviceModule: "node-type://odd_glc/TypescriptServiceModule",
  genericBlob: "node-type://odd_glc/GenericBlob",
  auditedReview: "node-type://odd_glc/AuditedReviewDocument"
});

function liveEnabled() {
  return process.env["ABG_TS_T180_NODE_TYPES_LIVE"] === "1" ||
    process.env["CODEX_LIVE_FP"] === "1";
}

function liveAgentKey() {
  return process.env["ABG_TS_LIVE_AGENT"] ?? "claude";
}

function transportTimeoutMs() {
  const parsed = Number.parseInt(
    process.env["ABG_TS_LIVE_TIMEOUT_MS"] ?? "180000",
    10
  );
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 180000;
}

function timestampId() {
  return new Date().toISOString().replace(/[-:.]/gu, "").replace("Z", "Z") +
    `_pid${process.pid}`;
}

function extractJsonObject(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/iu);
  const candidate = fenced?.[1] ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error(`T-180 live worker did not return JSON: ${text}`);
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

function stableList(values) {
  return Object.freeze([...new Set(values)].sort());
}

function assetSurface(input) {
  return Object.freeze({
    kind: input.kind,
    requiredContexts: stableList(input.requiredContexts ?? []),
    standardsRefs: stableList(input.standardsRefs ?? []),
    outputContractRefs: stableList(input.outputContractRefs ?? []),
    constructorRefs: stableList(input.constructorRefs ?? []),
    constructorInputAssetKinds: stableList(input.constructorInputAssetKinds ?? []),
    rendererRefs: stableList(input.rendererRefs ?? []),
    renderedViewDigestPolicyRef: input.renderedViewDigestPolicyRef ?? null,
    sectionKindRefs: stableList(input.sectionKindRefs ?? []),
    clauseKindRefs: stableList(input.clauseKindRefs ?? []),
    authoritySlots: Object.freeze(input.authoritySlots ?? []),
    proofObligationRefs: stableList(input.proofObligationRefs ?? [])
  });
}

function nodeForType(ref, name) {
  switch (ref) {
    case TYPE_REFS.reviewDocument:
      return constructNode({
        name,
        schema: { kind: "symbolic", ref: "schema://odd_glc/review-artifact" },
        typeRef: ref,
        markov: ["review:ready"],
        assetSurface: assetSurface({
          kind: "review_document",
          requiredContexts: ["context://odd_glc/review"],
          standardsRefs: ["specification/requirements/gtl/REQ-L-GTL3-NODE.md"],
          outputContractRefs: ["contract://odd_glc/review-document"],
          proofObligationRefs: ["proof://odd_glc/review-document"]
        }),
        tags: ["t180", "live", "review-document"]
      });
    case TYPE_REFS.reviewEvidence:
      return constructNode({
        name,
        schema: { kind: "symbolic", ref: "schema://odd_glc/review-artifact" },
        typeRef: ref,
        markov: ["review:evidence-bound"],
        assetSurface: assetSurface({
          kind: "review_document",
          requiredContexts: ["context://odd_glc/evidence"],
          standardsRefs: ["specification/requirements/gtl/REQ-L-GTL3-ASSET-SURFACE.md"],
          outputContractRefs: ["contract://odd_glc/review-document"],
          proofObligationRefs: ["proof://odd_glc/review-evidence"]
        }),
        tags: ["t180", "live", "review-evidence"]
      });
    case TYPE_REFS.auditedReview:
      return constructNode({
        name,
        schema: { kind: "symbolic", ref: "schema://odd_glc/review-artifact" },
        typeRef: ref,
        markov: ["review:ready", "review:evidence-bound"],
        assetSurface: assetSurface({
          kind: "review_document",
          requiredContexts: [
            "context://odd_glc/review",
            "context://odd_glc/evidence"
          ],
          standardsRefs: [
            "specification/requirements/gtl/REQ-L-GTL3-NODE.md",
            "specification/requirements/gtl/REQ-L-GTL3-ASSET-SURFACE.md"
          ],
          outputContractRefs: ["contract://odd_glc/review-document"],
          proofObligationRefs: [
            "proof://odd_glc/review-document",
            "proof://odd_glc/review-evidence"
          ]
        }),
        tags: ["t180", "live", "audited-review-document"]
      });
    case TYPE_REFS.serviceModule:
      return constructNode({
        name,
        schema: { kind: "symbolic", ref: "schema://odd_glc/typescript-service-module" },
        typeRef: ref,
        markov: ["service:buildable"],
        assetSurface: assetSurface({
          kind: "typescript_service_module",
          requiredContexts: ["context://odd_glc/service"],
          standardsRefs: ["specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md"],
          outputContractRefs: ["contract://odd_glc/typescript-service-module"],
          proofObligationRefs: ["proof://odd_glc/service-module"]
        }),
        tags: ["t180", "live", "service-module"]
      });
    case TYPE_REFS.genericBlob:
      return constructNode({
        name,
        schema: { kind: "symbolic", ref: "schema://odd_glc/generic-blob" },
        typeRef: ref,
        markov: [],
        assetSurface: assetSurface({
          kind: "generic_blob",
          outputContractRefs: ["contract://odd_glc/generic-blob"]
        }),
        tags: ["t180", "live", "generic-blob"]
      });
    default:
      throw new Error(`unknown T-180 type ref ${ref}`);
  }
}

function graphFunctionFromEdge(source, target, name) {
  const graph = edge([source], target, { name });
  const [vector] = graph.vectors;
  assert.notEqual(vector, undefined);
  return graphFunctionForVector(vector, { name: `graph-function://t180/live/${name}` });
}

function endpointNode(typeRef, name) {
  const node = nodeForType(typeRef, name);
  return constructNode({
    name,
    schema: node.schema,
    typeRef: node.typeRef,
    markov: node.markov,
    assetSurface: node.assetSurface,
    tags: node.tags
  });
}

function livePrompt() {
  return [
    "Return only one JSON object. Do not include markdown or commentary.",
    "You are the live F_P reviewer for ABI T-180 reusable GTL node types.",
    "Classify this downstream odd_glc-style reuse scenario without claiming runtime authority.",
    "",
    "Goal:",
    "- Select the source type for a review artifact.",
    "- Select the target type for a generated TypeScript service module.",
    "- Select a weak type that must be rejected as a replacement for the review artifact.",
    "- Select the composed review type that preserves review-document and evidence obligations.",
    "- Provide explicit differently-named typed-port wiring for a transform.",
    "- Confirm node-type graph functions must be non-callable.",
    "",
    "Candidates:",
    JSON.stringify([
      {
        typeRef: TYPE_REFS.reviewDocument,
        description: "review artifact carrying review readiness obligations"
      },
      {
        typeRef: TYPE_REFS.reviewEvidence,
        description: "review artifact carrying evidence-binding obligations"
      },
      {
        typeRef: TYPE_REFS.serviceModule,
        description: "TypeScript service module artifact with buildable-service obligations"
      },
      {
        typeRef: TYPE_REFS.genericBlob,
        description: "weak generic blob with no review obligations"
      },
      {
        typeRef: TYPE_REFS.auditedReview,
        description: "composed review type combining review-document and evidence obligations"
      }
    ], null, 2),
    "",
    "Output contract:",
    "{",
    '  "sourceTypeRef": string,',
    '  "targetTypeRef": string,',
    '  "evidenceTypeRef": string,',
    '  "rejectedWeakTypeRef": string,',
    '  "composedTypeRef": string,',
    '  "wiring": { "providedNodeName": string, "requiredNodeName": string, "typeRef": string },',
    '  "nodeTypeFunctionsAreCallable": boolean,',
    '  "reason": string',
    "}"
  ].join("\n");
}

function assertAssessment(assessment) {
  assert.equal(
    new Set([TYPE_REFS.reviewDocument, TYPE_REFS.auditedReview]).has(
      assessment.sourceTypeRef
    ),
    true
  );
  assert.equal(assessment.targetTypeRef, TYPE_REFS.serviceModule);
  assert.equal(assessment.evidenceTypeRef, TYPE_REFS.reviewEvidence);
  assert.equal(assessment.rejectedWeakTypeRef, TYPE_REFS.genericBlob);
  assert.equal(assessment.composedTypeRef, TYPE_REFS.auditedReview);
  assert.equal(typeof assessment.wiring, "object");
  assert.equal(typeof assessment.wiring.providedNodeName, "string");
  assert.equal(assessment.wiring.providedNodeName.length > 0, true);
  assert.equal(typeof assessment.wiring.requiredNodeName, "string");
  assert.equal(assessment.wiring.requiredNodeName.length > 0, true);
  assert.notEqual(
    assessment.wiring.providedNodeName,
    assessment.wiring.requiredNodeName
  );
  assert.equal(assessment.wiring.typeRef, TYPE_REFS.reviewDocument);
  assert.equal(assessment.nodeTypeFunctionsAreCallable, false);
  assert.equal(typeof assessment.reason, "string");
  assert.equal(assessment.reason.length > 0, true);
}

test("T-180 live proof uses an LLM-selected downstream reuse shape through GTL node-type APIs", async (t) => {
  if (!liveEnabled()) {
    t.skip("set ABG_TS_T180_NODE_TYPES_LIVE=1 or CODEX_LIVE_FP=1 to run T-180 live proof");
    return;
  }

  const agentKey = liveAgentKey();
  const runRoot = path.join(TEST_RUNS_ROOT, timestampId());
  await mkdir(runRoot, { recursive: true });

  const startedAt = Date.now();
  const transport = await runAgentTransport({
    contract: contractForKnownAgent(agentKey),
    prompt: livePrompt(),
    cwd: runRoot,
    archiveRoot: runRoot,
    label: "t180-gtl-node-types-live-fp",
    timeoutMs: transportTimeoutMs(),
    ...executorProfileFields(),
    outputPath: path.join(runRoot, "t180-live-output.txt"),
    promptPath: path.join(runRoot, "t180-live-prompt.txt"),
    stdoutPath: path.join(runRoot, "t180-live-stdout.log"),
    stderrPath: path.join(runRoot, "t180-live-stderr.log")
  });
  const durationMs = Date.now() - startedAt;
  assert.equal(transport.status, 0, transport.stderr);
  assert.equal(transport.text.trim().length > 0, true);
  const assessment = extractJsonObject(transport.text);
  assertAssessment(assessment);

  const reviewType = constructNodeTypeGraphFunction(
    nodeForType(TYPE_REFS.reviewDocument, "ReviewDocument")
  );
  const evidenceType = constructNodeTypeGraphFunction(
    nodeForType(assessment.evidenceTypeRef, "ReviewEvidenceDocument")
  );
  const serviceType = constructNodeTypeGraphFunction(
    nodeForType(assessment.targetTypeRef, "TypescriptServiceModule")
  );
  const typeGraphFunctions = [reviewType, evidenceType, serviceType];

  const composed = composeNodeTypes({
    typeRef: assessment.composedTypeRef,
    constituentTypeRefs: [TYPE_REFS.reviewDocument, assessment.evidenceTypeRef],
    graphFunctions: typeGraphFunctions,
    name: "AuditedReviewDocument",
    tags: ["t180", "live"]
  });
  assert.equal(composed.satisfied, true);
  assert.notEqual(composed.graphFunction, null);
  const allTypeGraphFunctions = [...typeGraphFunctions, composed.graphFunction];

  const weakNode = nodeForType(assessment.rejectedWeakTypeRef, "GenericBlob");
  const weakSatisfaction = satisfiesNodeType({
    node: weakNode,
    typeRef: assessment.wiring.typeRef,
    graphFunctions: allTypeGraphFunctions
  });
  assert.equal(weakSatisfaction.satisfied, false);

  const sourceNode = endpointNode(
    assessment.sourceTypeRef,
    assessment.wiring.providedNodeName
  );
  const requiredNode = endpointNode(
    assessment.wiring.typeRef,
    assessment.wiring.requiredNodeName
  );
  const serviceNode = endpointNode(assessment.targetTypeRef, "serviceModuleOut");
  const producer = graphFunctionFromEdge(
    endpointNode(assessment.sourceTypeRef, "reviewRequirementIn"),
    sourceNode,
    "review-producer"
  );
  const consumer = graphFunctionFromEdge(
    requiredNode,
    serviceNode,
    "service-builder"
  );
  assert.throws(() => compose(producer, consumer));
  const composedGraphFunction = composeWithTypeWiring(producer, consumer, {
    wiring: [assessment.wiring],
    nodeTypeGraphFunctions: allTypeGraphFunctions
  });
  assert.equal(
    composedGraphFunction.environment.carries.some(
      (node) => node.name === "serviceModuleOut"
    ),
    true
  );

  const artifact = Object.freeze({
    kind: "t180_gtl_node_types_live_readiness_artifact",
    agentKey,
    command: transport.command,
    executorProfile: transport.executorProfile,
    status: transport.status,
    durationMs,
    apiDurationMs: null,
    cost: null,
    structuredEventCount: transport.structuredEventCount,
    apiRetryCount: transport.apiRetryCount,
    traceResultPath: transport.traceResultPath,
    outputPath: transport.outputPath,
    assessment,
    proof: Object.freeze({
      composedTypeRef: assessment.composedTypeRef,
      weakRejectionReason: weakSatisfaction.rejectionReason,
      typedCompositionGraphFunctionRef: composedGraphFunction.id
    })
  });
  await writeFile(
    path.join(runRoot, "t180-live-readiness-artifact.json"),
    `${JSON.stringify(artifact, null, 2)}\n`,
    "utf8"
  );
});
