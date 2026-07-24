import { createHash } from "node:crypto";

type JsonValue =
  | boolean
  | null
  | number
  | string
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

interface ArtifactBasis {
  readonly productId: string;
  readonly artifactDigest: `sha256:${string}`;
  readonly productContentDigest: `sha256:${string}`;
  readonly productManifestDigest: `sha256:${string}`;
  readonly packageName: string;
  readonly packageVersion: string;
}

const PACKAGE_NAME = "@abiogenesis-fixtures/developer-mini-product";
const PACKAGE_VERSION = "5.0.0";

export const DEVELOPER_MINI_IDS = Object.freeze({
  moduleRef: "module://developer.example/greeting@5",
  programRef: "program://developer.example/greeting@5",
  graphFunctionRef: "graph-function://developer.example/greeting/render@5",
  graphRef: "graph://developer.example/greeting/render@5",
  nodeRef: "node://developer.example/greeting/render@5",
  inputContractRef: "contract://developer.example/greeting/input@5",
  outputContractRef: "contract://developer.example/greeting/output@5",
  evidenceContractRef: "contract://developer.example/greeting/evidence@5",
  failureContractRef: "contract://developer.example/greeting/failure@5",
  refusalContractRef: "contract://developer.example/greeting/refusal@5",
  judgmentContractRef: "contract://developer.example/greeting/judgment@5",
  transitionContractRef: "contract://developer.example/greeting/transition@5",
  closureContractRef: "contract://developer.example/greeting/closure@5",
  judgmentPredicateRef: "predicate://developer.example/greeting/satisfied@5",
  implementationBindingRef:
    "implementation-binding://developer.example/greeting/render-fd@5",
  implementationRef: "implementation://developer.example/greeting/render-fd@5",
  semanticsBindingRef: "product-semantics://developer.example/greeting@5",
});

function canonicalJson(value: JsonValue): string {
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  return `{${Object.entries(value)
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
    .join(",")}}`;
}

function sha256Canonical(value: JsonValue): `sha256:${string}` {
  return `sha256:${createHash("sha256").update(canonicalJson(value)).digest("hex")}`;
}

function deepFreeze<T>(value: T): Readonly<T> {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) {
    return value;
  }
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Readonly<Record<string, unknown>>,
  keys: readonly string[],
): boolean {
  return Object.keys(value).sort().join("\0") === [...keys].sort().join("\0");
}

function isGreetingInput(value: unknown): value is Readonly<{
  kind: "developer_greeting_input";
  schemaVersion: "5.0.0";
  name: string;
}> {
  return isRecord(value) &&
    hasExactKeys(value, ["kind", "name", "schemaVersion"]) &&
    value.kind === "developer_greeting_input" &&
    value.schemaVersion === "5.0.0" &&
    typeof value.name === "string" &&
    value.name.trim().length > 0;
}

function isGreetingOutput(value: unknown): value is Readonly<{
  kind: "developer_greeting_output";
  schemaVersion: "5.0.0";
  message: string;
}> {
  return isRecord(value) &&
    hasExactKeys(value, ["kind", "message", "schemaVersion"]) &&
    value.kind === "developer_greeting_output" &&
    value.schemaVersion === "5.0.0" &&
    typeof value.message === "string" &&
    value.message.length > 0;
}

const descriptorBody = {
  implementationRef: DEVELOPER_MINI_IDS.implementationRef,
  packageName: PACKAGE_NAME,
  packageVersion: PACKAGE_VERSION,
  modulePath: "build/index.js",
  namedSymbol: "realizeDeveloperGreeting",
  computeRegime: "F_D",
  inputContractRef: DEVELOPER_MINI_IDS.inputContractRef,
  outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
  failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
  refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
} as const;

export const DEVELOPER_GREETING_IMPLEMENTATION_DESCRIPTOR = deepFreeze({
  kind: "packaged_leaf_implementation_descriptor" as const,
  schemaVersion: "5.0.0" as const,
  descriptorDigest: sha256Canonical(descriptorBody),
  ...descriptorBody,
});

export function realizeDeveloperGreeting(input: unknown): Readonly<object> {
  if (!isGreetingInput(input)) {
    throw new TypeError("developer greeting requires its exact input contract");
  }
  const resultCandidate = deepFreeze({
    kind: "developer_greeting_output" as const,
    schemaVersion: "5.0.0" as const,
    message: `Welcome ${input.name}.`,
  });
  return deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "success" as const,
    evidenceCandidates: [{
      kind: "deterministic_evidence_candidate" as const,
      schemaVersion: "5.0.0" as const,
      implementationRef: DEVELOPER_MINI_IDS.implementationRef,
      inputDigest: sha256Canonical(input),
      outputDigest: sha256Canonical(resultCandidate),
    }],
    resultCandidate,
  });
}

export const DEVELOPER_MINI_PRODUCT_SEMANTICS = Object.freeze({
  kind: "product_semantics_provider" as const,
  schemaVersion: "5.0.0" as const,
  bindingRef: DEVELOPER_MINI_IDS.semanticsBindingRef,
  packageName: PACKAGE_NAME,
  packageVersion: PACKAGE_VERSION,
  admitInput(contractRef: string, value: unknown) {
    if (contractRef !== DEVELOPER_MINI_IDS.inputContractRef || !isGreetingInput(value)) {
      return null;
    }
    return deepFreeze({
      kind: value.kind,
      schemaVersion: value.schemaVersion,
      name: value.name.trim(),
    });
  },
  validateContractValue(valueKind: string, value: unknown) {
    return valueKind === "developer_greeting_output" && isGreetingOutput(value);
  },
  resolveJudgmentRelation(predicateRef: string) {
    if (predicateRef !== DEVELOPER_MINI_IDS.judgmentPredicateRef) return null;
    return Object.freeze({
      predicateRef,
      advanceReasonRef: "reason://developer.example/greeting/satisfied@5",
      rejectionReasonRef: "reason://developer.example/greeting/rejected@5",
      evaluate: (input: unknown, output: unknown) =>
        isGreetingInput(input) &&
        isGreetingOutput(output) &&
        output.message === `Welcome ${input.name}.`,
    });
  },
});

export function constructDeveloperMiniPublication(
  artifact: ArtifactBasis,
): Readonly<Record<string, JsonValue>> {
  if (
    artifact.packageName !== PACKAGE_NAME ||
    artifact.packageVersion !== PACKAGE_VERSION
  ) {
    throw new TypeError("developer mini publication requires its own exact package basis");
  }
  const contracts = [
    ["input", DEVELOPER_MINI_IDS.inputContractRef, "developer_greeting_input"],
    ["output", DEVELOPER_MINI_IDS.outputContractRef, "developer_greeting_output"],
    ["evidence", DEVELOPER_MINI_IDS.evidenceContractRef, "deterministic_evidence_candidate"],
    ["failure", DEVELOPER_MINI_IDS.failureContractRef, "developer_greeting_failure"],
    ["refusal", DEVELOPER_MINI_IDS.refusalContractRef, "developer_greeting_refusal"],
    ["judgment", DEVELOPER_MINI_IDS.judgmentContractRef, "developer_greeting_judgment"],
    ["transition", DEVELOPER_MINI_IDS.transitionContractRef, "developer_greeting_transition"],
    ["closure", DEVELOPER_MINI_IDS.closureContractRef, "developer_greeting_closure"],
  ].map(([contractKind, contractRef, valueKind]) => ({
    contractRef: contractRef!,
    contractVersion: "5.0.0",
    contractKind: contractKind!,
    valueKind: valueKind!,
  }));
  const graphFunction = {
    kind: "graph_function",
    name: DEVELOPER_MINI_IDS.graphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [DEVELOPER_MINI_IDS.inputContractRef],
      provides: [DEVELOPER_MINI_IDS.outputContractRef],
      carries: [
        DEVELOPER_MINI_IDS.inputContractRef,
        DEVELOPER_MINI_IDS.outputContractRef,
      ],
    },
    inputs: [DEVELOPER_MINI_IDS.inputContractRef],
    outputs: [DEVELOPER_MINI_IDS.outputContractRef],
    template: {
      kind: "inline_graph",
      graphRef: DEVELOPER_MINI_IDS.graphRef,
      startNodeRef: DEVELOPER_MINI_IDS.nodeRef,
      terminalNodeRefs: [DEVELOPER_MINI_IDS.nodeRef],
      nodes: [{
        nodeRef: DEVELOPER_MINI_IDS.nodeRef,
        nodeKind: "c_locus",
        term: {
          kind: "c_of",
          inputCarrierRef: DEVELOPER_MINI_IDS.inputContractRef,
          outputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
          programLocusRef: DEVELOPER_MINI_IDS.nodeRef,
          stageRole: "result",
          fibre: "F_D",
          armId: "arm://developer.example/greeting/render-fd@5",
          compositionRef: null,
          vectorIndex: 0,
          judgmentPredicateRef: DEVELOPER_MINI_IDS.judgmentPredicateRef,
          resultBearing: true,
          requirement: {
            kind: "executable_leaf_requirement",
            implementationBindingRef:
              DEVELOPER_MINI_IDS.implementationBindingRef,
            inputContractRef: DEVELOPER_MINI_IDS.inputContractRef,
            outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
            evidenceContractRef: DEVELOPER_MINI_IDS.evidenceContractRef,
            failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
            refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
            judgmentContractRef: DEVELOPER_MINI_IDS.judgmentContractRef,
          },
        },
      }],
      edges: [],
      applications: [],
    },
    effects: ["effect://developer.example/greeting/render@5"],
    declarations: {
      "abg.compute_regime": "F_D",
      "abg.closure_contract": DEVELOPER_MINI_IDS.closureContractRef,
      "abg.evidence_contract": DEVELOPER_MINI_IDS.evidenceContractRef,
      "abg.judgment_contract": DEVELOPER_MINI_IDS.judgmentContractRef,
      "abg.judgment_predicate": DEVELOPER_MINI_IDS.judgmentPredicateRef,
      "abg.transition_contract": DEVELOPER_MINI_IDS.transitionContractRef,
    },
    tags: ["developer-authored", "external-product", "all-fd"],
  };
  const program = {
    kind: "gtl_program",
    programRef: DEVELOPER_MINI_IDS.programRef,
    version: "5.0.0",
    moduleRef: DEVELOPER_MINI_IDS.moduleRef,
    starts: [{
      startRef: "start://developer.example/greeting@5",
      graphFunctionRef: DEVELOPER_MINI_IDS.graphFunctionRef,
    }],
    callableMembership: [DEVELOPER_MINI_IDS.graphFunctionRef],
    closureContractRef: DEVELOPER_MINI_IDS.closureContractRef,
    policies: {
      "abg.compute_regime": "F_D",
      "abg.root_mode": "direct",
    },
  };
  const contribution = {
    handle: DEVELOPER_MINI_IDS.graphFunctionRef,
    kind: "graph_function",
    declarationOrContractRef: DEVELOPER_MINI_IDS.graphFunctionRef,
    owningProductId: artifact.productId,
    programMembershipRefs: [DEVELOPER_MINI_IDS.programRef],
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    provenanceRefs: [
      artifact.artifactDigest,
      artifact.productManifestDigest,
    ],
  };
  return deepFreeze({
    kind: "module_publication",
    moduleRef: DEVELOPER_MINI_IDS.moduleRef,
    moduleVersion: "5.0.0",
    owningProductId: artifact.productId,
    artifactDigest: artifact.artifactDigest,
    productContentDigest: artifact.productContentDigest,
    productManifestDigest: artifact.productManifestDigest,
    descriptorRef: "descriptor://developer.example/greeting@5",
    contributionManifestRef:
      "contribution-manifest://developer.example/greeting@5",
    productSemanticsBinding: {
      kind: "product_semantics_binding",
      bindingRef: DEVELOPER_MINI_IDS.semanticsBindingRef,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      modulePath: "build/index.js",
      namedSymbol: "DEVELOPER_MINI_PRODUCT_SEMANTICS",
    },
    contracts,
    evaluators: [],
    rules: [],
    implementationBindings: [{
      kind: "implementation_binding",
      bindingRef: DEVELOPER_MINI_IDS.implementationBindingRef,
      implementationRef: DEVELOPER_MINI_IDS.implementationRef,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      modulePath: "build/index.js",
      namedSymbol: "realizeDeveloperGreeting",
      computeRegime: "F_D",
      inputContractRef: DEVELOPER_MINI_IDS.inputContractRef,
      outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
      failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
    }],
    closureContracts: [{
      kind: "closure_contract",
      closureContractRef: DEVELOPER_MINI_IDS.closureContractRef,
      predicateRef: "predicate://developer.example/greeting/terminal@5",
      evidenceContractRef: DEVELOPER_MINI_IDS.evidenceContractRef,
      resultContractRef: DEVELOPER_MINI_IDS.outputContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
      refusalValueKind: "developer_greeting_refusal",
      judgmentContractRef: DEVELOPER_MINI_IDS.judgmentContractRef,
      rejectionContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
      transitionContractRef: DEVELOPER_MINI_IDS.transitionContractRef,
      replayProjectionRef: "projection://developer.example/greeting/replay@5",
      terminalKind: "completed",
      closureScope: "run",
      eventKindRefs: [
        "terminal_reached",
        "frame_closed",
        "graph_call_closed",
        "run_closed",
      ],
    }],
    programs: [program],
    graphFunctions: [graphFunction],
    contributions: [contribution],
  }) as Readonly<Record<string, JsonValue>>;
}
