import { createHash } from "node:crypto";

import type {
  JsonValue,
  PackagedLeafImplementationDescriptor,
  ProductSemanticsProvider,
  Sha256Digest,
} from "@abiogenesis/typescript-tenant/product";
import type {
  ContractDeclaration,
  GraphFunction,
  GtlProgram,
  ModulePublication,
  RootModuleArtifactBasis,
} from "@abiogenesis/typescript-tenant/gtl";

const PACKAGE_NAME = "@abiogenesis-fixtures/flavored-catalog-product";
const PACKAGE_VERSION = "5.0.0";
const PRODUCT_ID = "product://flavor.example/text@5.0.0";
const CATALOG_VALUE_ATTESTATION_REF =
  "contributor-attestation://flavor.example/text/catalog-values@5";

export const FLAVORED_CATALOG_IDS = Object.freeze({
  moduleRef: "module://flavor.example/text@5",
  programRef: "program://flavor.example/text/render@5",
  startRef: "start://flavor.example/text/render@5",
  graphFunctionRef: "graph-function://flavor.example/text/render@5",
  graphRef: "graph://flavor.example/text/render@5",
  nodeRef: "node://flavor.example/text/render@5",
  inputContractRef: "contract://flavor.example/text/input@5",
  outputContractRef: "contract://flavor.example/text/output@5",
  evidenceContractRef: "contract://flavor.example/text/evidence@5",
  failureContractRef: "contract://flavor.example/text/failure@5",
  refusalContractRef: "contract://flavor.example/text/refusal@5",
  judgmentContractRef: "contract://flavor.example/text/judgment@5",
  transitionContractRef: "contract://flavor.example/text/transition@5",
  closureContractRef: "contract://flavor.example/text/closure@5",
  judgmentPredicateRef: "predicate://flavor.example/text/rendered@5",
  implementationBindingRef:
    "implementation-binding://flavor.example/text/render-fd@5",
  implementationRef: "implementation://flavor.example/text/render-fd@5",
  semanticsBindingRef: "product-semantics://flavor.example/text@5",
  nodeTypeHandle: "node-type://flavor.example/title@5",
  nodeTypeRef: "node-type://flavor.example/title@5",
  overlayHandle: "overlay://flavor.example/emphasis@5",
  overlayRef: "overlay://flavor.example/emphasis@5",
  styleRef: "style://flavor.example/emphasis@5",
  contributorAttestationRef: CATALOG_VALUE_ATTESTATION_REF,
});

function canonicalJson(value: JsonValue): string {
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string"
  ) {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  return `{${Object.entries(value)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
    .join(",")}}`;
}

function sha256Canonical(value: JsonValue): Sha256Digest {
  return `sha256:${
    createHash("sha256").update(canonicalJson(value)).digest("hex")
  }`;
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
  return Object.keys(value).sort().join("\0") ===
    [...keys].sort().join("\0");
}

export const FLAVORED_NODE_TYPE = deepFreeze({
  kind: "flavored_node_type" as const,
  schemaVersion: "5.0.0" as const,
  nodeTypeRef: FLAVORED_CATALOG_IDS.nodeTypeRef,
});

export const FLAVORED_PROGRAM_OVERLAY = deepFreeze({
  kind: "flavored_overlay" as const,
  schemaVersion: "5.0.0" as const,
  overlayRef: FLAVORED_CATALOG_IDS.overlayRef,
  programRef: FLAVORED_CATALOG_IDS.programRef,
  graphFunctionRef: FLAVORED_CATALOG_IDS.graphFunctionRef,
  nodeTypeRef: FLAVORED_CATALOG_IDS.nodeTypeRef,
  styleRef: FLAVORED_CATALOG_IDS.styleRef,
});

function isFlavoredNodeType(value: unknown): boolean {
  return isRecord(value) &&
    hasExactKeys(value, ["kind", "nodeTypeRef", "schemaVersion"]) &&
    value.kind === FLAVORED_NODE_TYPE.kind &&
    value.schemaVersion === FLAVORED_NODE_TYPE.schemaVersion &&
    value.nodeTypeRef === FLAVORED_NODE_TYPE.nodeTypeRef;
}

function isFlavoredProgramOverlay(value: unknown): boolean {
  return isRecord(value) &&
    hasExactKeys(value, [
      "graphFunctionRef",
      "kind",
      "nodeTypeRef",
      "overlayRef",
      "programRef",
      "schemaVersion",
      "styleRef",
    ]) &&
    value.kind === FLAVORED_PROGRAM_OVERLAY.kind &&
    value.schemaVersion === FLAVORED_PROGRAM_OVERLAY.schemaVersion &&
    value.overlayRef === FLAVORED_PROGRAM_OVERLAY.overlayRef &&
    value.programRef === FLAVORED_PROGRAM_OVERLAY.programRef &&
    value.graphFunctionRef === FLAVORED_PROGRAM_OVERLAY.graphFunctionRef &&
    value.nodeTypeRef === FLAVORED_PROGRAM_OVERLAY.nodeTypeRef &&
    value.styleRef === FLAVORED_PROGRAM_OVERLAY.styleRef;
}

function isFlavoredInput(value: unknown): value is Readonly<{
  kind: "flavored_text_input";
  schemaVersion: "5.0.0";
  text: string;
  tone: "bright" | "plain";
}> {
  return isRecord(value) &&
    hasExactKeys(value, ["kind", "schemaVersion", "text", "tone"]) &&
    value.kind === "flavored_text_input" &&
    value.schemaVersion === "5.0.0" &&
    typeof value.text === "string" &&
    value.text.trim().length > 0 &&
    (value.tone === "bright" || value.tone === "plain");
}

function isFlavoredOutput(value: unknown): value is Readonly<{
  kind: "flavored_text_output";
  schemaVersion: "5.0.0";
  rendered: string;
  styleRef: string;
}> {
  return isRecord(value) &&
    hasExactKeys(value, [
      "kind",
      "rendered",
      "schemaVersion",
      "styleRef",
    ]) &&
    value.kind === "flavored_text_output" &&
    value.schemaVersion === "5.0.0" &&
    typeof value.rendered === "string" &&
    value.rendered.length > 0 &&
    value.styleRef === FLAVORED_CATALOG_IDS.styleRef;
}

const descriptorBody = {
  implementationRef: FLAVORED_CATALOG_IDS.implementationRef,
  packageName: PACKAGE_NAME,
  packageVersion: PACKAGE_VERSION,
  modulePath: "build/index.js",
  namedSymbol: "realizeFlavoredText",
  computeRegime: "F_D",
  inputContractRef: FLAVORED_CATALOG_IDS.inputContractRef,
  outputContractRef: FLAVORED_CATALOG_IDS.outputContractRef,
  failureContractRef: FLAVORED_CATALOG_IDS.failureContractRef,
  refusalContractRef: FLAVORED_CATALOG_IDS.refusalContractRef,
} as const;

export const FLAVORED_TEXT_IMPLEMENTATION_DESCRIPTOR:
  Readonly<PackagedLeafImplementationDescriptor> = deepFreeze({
  kind: "packaged_leaf_implementation_descriptor" as const,
  schemaVersion: "5.0.0" as const,
  descriptorDigest: sha256Canonical(descriptorBody),
  ...descriptorBody,
});

export function realizeFlavoredText(input: unknown): Readonly<object> {
  if (!isFlavoredInput(input)) {
    throw new TypeError("flavored text requires its exact input contract");
  }
  const normalized = input.text.trim();
  const resultCandidate = deepFreeze({
    kind: "flavored_text_output" as const,
    schemaVersion: "5.0.0" as const,
    rendered:
      input.tone === "bright"
        ? `${normalized.toLocaleUpperCase("en-US")}!`
        : normalized,
    styleRef: FLAVORED_CATALOG_IDS.styleRef,
  });
  return deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "success" as const,
    evidenceCandidates: [{
      kind: "deterministic_evidence_candidate" as const,
      schemaVersion: "5.0.0" as const,
      implementationRef: FLAVORED_CATALOG_IDS.implementationRef,
      inputDigest: sha256Canonical(input),
      outputDigest: sha256Canonical(resultCandidate),
    }],
    resultCandidate,
  });
}

export const FLAVORED_CATALOG_PRODUCT_SEMANTICS:
  ProductSemanticsProvider = Object.freeze({
  kind: "product_semantics_provider" as const,
  schemaVersion: "5.0.0" as const,
  bindingRef: FLAVORED_CATALOG_IDS.semanticsBindingRef,
  packageName: PACKAGE_NAME,
  packageVersion: PACKAGE_VERSION,
  admitInput(contractRef: string, value: unknown) {
    if (
      contractRef === FLAVORED_CATALOG_IDS.inputContractRef &&
      isFlavoredInput(value)
    ) {
      return deepFreeze({
        kind: value.kind,
        schemaVersion: value.schemaVersion,
        text: value.text.trim(),
        tone: value.tone,
      });
    }
    if (
      contractRef === FLAVORED_CATALOG_IDS.outputContractRef &&
      isFlavoredOutput(value)
    ) {
      return deepFreeze({ ...value });
    }
    if (
      contractRef === FLAVORED_CATALOG_IDS.nodeTypeRef &&
      isFlavoredNodeType(value)
    ) {
      return FLAVORED_NODE_TYPE;
    }
    if (
      contractRef === FLAVORED_CATALOG_IDS.overlayRef &&
      isFlavoredProgramOverlay(value)
    ) {
      return FLAVORED_PROGRAM_OVERLAY;
    }
    return null;
  },
  evaluateInteractionResponse() {
    return null;
  },
  validateContractValue(
    valueKind: string,
    value: unknown,
  ): value is Readonly<Record<string, JsonValue>> {
    if (valueKind === "flavored_text_input") return isFlavoredInput(value);
    if (valueKind === "flavored_text_output") return isFlavoredOutput(value);
    if (valueKind === "flavored_node_type") return isFlavoredNodeType(value);
    if (valueKind === "flavored_overlay") {
      return isFlavoredProgramOverlay(value);
    }
    return isRecord(value) &&
      (
        valueKind === "flavored_text_failure" ||
        valueKind === "flavored_text_refusal"
      );
  },
  resolveCatalogApplicationValue(
    basis: Readonly<{
      contractRef: string;
      value: Readonly<Record<string, JsonValue>>;
    }>,
  ) {
    if (
      basis.contractRef === FLAVORED_CATALOG_IDS.nodeTypeRef &&
      isFlavoredNodeType(basis.value)
    ) {
      return Object.freeze({
        valueRef: FLAVORED_CATALOG_IDS.nodeTypeRef,
        programMembershipRefs: [],
        productContributorAttestation: {
          contributorRef: PRODUCT_ID,
          attestationRef:
            FLAVORED_CATALOG_IDS.contributorAttestationRef,
        },
      });
    }
    if (
      basis.contractRef === FLAVORED_CATALOG_IDS.overlayRef &&
      isFlavoredProgramOverlay(basis.value)
    ) {
      return Object.freeze({
        valueRef: FLAVORED_CATALOG_IDS.overlayRef,
        programMembershipRefs: [FLAVORED_CATALOG_IDS.programRef],
        productContributorAttestation: {
          contributorRef: PRODUCT_ID,
          attestationRef:
            FLAVORED_CATALOG_IDS.contributorAttestationRef,
        },
      });
    }
    return null;
  },
  resolveJudgmentRelation(predicateRef: string) {
    if (predicateRef !== FLAVORED_CATALOG_IDS.judgmentPredicateRef) {
      return null;
    }
    return Object.freeze({
      predicateRef,
      advanceReasonRef: "reason://flavor.example/text/rendered@5",
      rejectionReasonRef: "reason://flavor.example/text/not-rendered@5",
      evaluate: (input: unknown, output: unknown) =>
        isFlavoredInput(input) &&
        isFlavoredOutput(output) &&
        output.rendered === (
          input.tone === "bright"
            ? `${input.text.trim().toLocaleUpperCase("en-US")}!`
            : input.text.trim()
        ),
    });
  },
});

export function constructFlavoredCatalogPublication(
  artifact: RootModuleArtifactBasis,
): Readonly<ModulePublication> {
  if (
    artifact.packageName !== PACKAGE_NAME ||
    artifact.packageVersion !== PACKAGE_VERSION
  ) {
    throw new TypeError(
      "flavored catalog publication requires its own exact package basis",
    );
  }
  const ids = FLAVORED_CATALOG_IDS;
  const contractRows: readonly (
    readonly [
      ContractDeclaration["contractKind"],
      string,
      string,
    ]
  )[] = [
    ["input", ids.inputContractRef, "flavored_text_input"],
    ["output", ids.outputContractRef, "flavored_text_output"],
    ["evidence", ids.evidenceContractRef, "deterministic_evidence_candidate"],
    ["failure", ids.failureContractRef, "flavored_text_failure"],
    ["refusal", ids.refusalContractRef, "flavored_text_refusal"],
    ["judgment", ids.judgmentContractRef, "flavored_text_judgment"],
    ["transition", ids.transitionContractRef, "flavored_text_transition"],
    ["closure", ids.closureContractRef, "flavored_text_closure"],
    ["input", ids.nodeTypeRef, "flavored_node_type"],
    ["input", ids.overlayRef, "flavored_overlay"],
  ];
  const contracts: readonly ContractDeclaration[] = contractRows.map((
    [contractKind, contractRef, valueKind],
  ) => ({
    contractRef: contractRef!,
    contractVersion: "5.0.0",
    contractKind: contractKind!,
    valueKind: valueKind!,
  }));
  const graphFunction: GraphFunction = {
    kind: "graph_function",
    name: ids.graphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [ids.inputContractRef],
      provides: [ids.outputContractRef],
      carries: [ids.inputContractRef, ids.outputContractRef],
    },
    inputs: [ids.inputContractRef],
    outputs: [ids.outputContractRef],
    template: {
      kind: "inline_graph",
      graphRef: ids.graphRef,
      startNodeRef: ids.nodeRef,
      terminalNodeRefs: [ids.nodeRef],
      nodes: [{
        nodeRef: ids.nodeRef,
        nodeKind: "c_locus",
        term: {
          kind: "c_of",
          inputCarrierRef: ids.inputContractRef,
          outputCarrierRef: ids.outputContractRef,
          programLocusRef: ids.nodeRef,
          stageRole: "render",
          fibre: "F_D",
          armId: "arm://flavor.example/text/render-fd@5",
          compositionRef: null,
          vectorIndex: 0,
          judgmentPredicateRef: ids.judgmentPredicateRef,
          resultBearing: true,
          requirement: {
            kind: "executable_leaf_requirement",
            implementationBindingRef: ids.implementationBindingRef,
            inputContractRef: ids.inputContractRef,
            outputContractRef: ids.outputContractRef,
            evidenceContractRef: ids.evidenceContractRef,
            failureContractRef: ids.failureContractRef,
            refusalContractRef: ids.refusalContractRef,
            judgmentContractRef: ids.judgmentContractRef,
          },
        },
      }],
      edges: [],
      applications: [],
    },
    effects: ["effect://flavor.example/text/render@5"],
    declarations: {
      "abg.compute_regime": "F_D",
      "abg.closure_contract": ids.closureContractRef,
      "abg.evidence_contract": ids.evidenceContractRef,
      "abg.judgment_contract": ids.judgmentContractRef,
      "abg.judgment_predicate": ids.judgmentPredicateRef,
      "abg.transition_contract": ids.transitionContractRef,
    },
    tags: ["external-product", "flavored-catalog", "all-fd"],
  };
  const program: GtlProgram = {
    kind: "gtl_program",
    programRef: ids.programRef,
    version: "5.0.0",
    moduleRef: ids.moduleRef,
    starts: [{
      startRef: ids.startRef,
      graphFunctionRef: ids.graphFunctionRef,
    }],
    callableMembership: [ids.graphFunctionRef],
    closureContractRef: ids.closureContractRef,
    policies: {
      "abg.compute_regime": "F_D",
      "abg.default_start_ref": ids.startRef,
      "abg.root_mode": "direct",
    },
  };
  const contributionBasis = {
    owningProductId: artifact.productId,
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    provenanceRefs: [
      artifact.artifactDigest,
      artifact.productManifestDigest,
    ],
  };
  const publication: ModulePublication = {
    kind: "module_publication",
    moduleRef: ids.moduleRef,
    moduleVersion: "5.0.0",
    owningProductId: artifact.productId,
    artifactDigest: artifact.artifactDigest,
    productContentDigest: artifact.productContentDigest,
    productManifestDigest: artifact.productManifestDigest,
    descriptorRef: "descriptor://flavor.example/text@5",
    contributionManifestRef:
      "contribution-manifest://flavor.example/text@5",
    productSemanticsBinding: {
      kind: "product_semantics_binding",
      bindingRef: ids.semanticsBindingRef,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      modulePath: "build/index.js",
      namedSymbol: "FLAVORED_CATALOG_PRODUCT_SEMANTICS",
    },
    contracts,
    evaluators: [],
    rules: [],
    implementationBindings: [{
      kind: "implementation_binding",
      bindingRef: ids.implementationBindingRef,
      implementationRef: ids.implementationRef,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      modulePath: "build/index.js",
      namedSymbol: "realizeFlavoredText",
      computeRegime: "F_D",
      inputContractRef: ids.inputContractRef,
      outputContractRef: ids.outputContractRef,
      failureContractRef: ids.failureContractRef,
      refusalContractRef: ids.refusalContractRef,
    }],
    closureContracts: [{
      kind: "closure_contract",
      closureContractRef: ids.closureContractRef,
      predicateRef: "predicate://flavor.example/text/terminal@5",
      evidenceContractRef: ids.evidenceContractRef,
      resultContractRef: ids.outputContractRef,
      refusalContractRef: ids.refusalContractRef,
      refusalValueKind: "flavored_text_refusal",
      judgmentContractRef: ids.judgmentContractRef,
      rejectionContractRef: ids.refusalContractRef,
      transitionContractRef: ids.transitionContractRef,
      replayProjectionRef: "projection://flavor.example/text/replay@5",
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
    contributions: [{
      handle: ids.graphFunctionRef,
      kind: "graph_function",
      declarationOrContractRef: ids.graphFunctionRef,
      programMembershipRefs: [ids.programRef],
      ...contributionBasis,
    }, {
      handle: ids.nodeTypeHandle,
      kind: "node_type",
      declarationOrContractRef: ids.nodeTypeRef,
      programMembershipRefs: [],
      ...contributionBasis,
    }, {
      handle: ids.overlayHandle,
      kind: "overlay",
      declarationOrContractRef: ids.overlayRef,
      programMembershipRefs: [ids.programRef],
      ...contributionBasis,
    }],
  };
  return deepFreeze(publication);
}
