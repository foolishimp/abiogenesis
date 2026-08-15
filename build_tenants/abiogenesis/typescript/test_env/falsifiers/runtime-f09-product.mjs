import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

import { prepareDeveloperMiniProduct } from "../support/developer-mini-product.mjs";

const execFileAsync = promisify(execFile);
const PLACEHOLDER_DIGEST = `sha256:${"0".repeat(64)}`;

const authoredRetryDeclaration = String.raw`

export const AX_F09_RETRY_IDS = Object.freeze({
  programRef: "program://developer.example/greeting/retry-restart@5",
  startRef: "start://developer.example/greeting/retry-restart@5",
  graphFunctionRef: "graph-function://developer.example/greeting/retry-restart@5",
  graphRef: "graph://developer.example/greeting/retry-restart@5",
  nodeRef: "node://developer.example/greeting/retry-restart@5",
  compositionRef:
    "composition://developer.example/greeting/retry-restart@5",
  transformLocusRef:
    "locus://developer.example/greeting/retry-restart/transform@5",
  transformJudgmentPredicateRef:
    "judgment-predicate://developer.example/greeting/retry-transform@5",
  locusRef: "locus://developer.example/greeting/retry-restart@5",
  childGraphFunctionRef:
    "graph-function://developer.example/greeting/retry-restart/hold@5",
  childGraphRef:
    "graph://developer.example/greeting/retry-restart/hold@5",
  childNodeRef:
    "node://developer.example/greeting/retry-restart/hold@5",
  childCompositionRef:
    "composition://developer.example/greeting/retry-restart/hold@5",
  childLocusRef:
    "locus://developer.example/greeting/retry-restart/hold@5",
  inputContractRef: "contract://developer.example/greeting/retry-input@5",
  transformImplementationBindingRef:
    "implementation-binding://developer.example/greeting/retry-transform-fd@5",
  transformImplementationRef:
    "implementation://developer.example/greeting/retry-transform-fd@5",
  implementationBindingRef: "implementation-binding://developer.example/greeting/retry-fp@5",
  implementationRef: "implementation://developer.example/greeting/retry-fp@5",
  semanticsBindingRef: "product-semantics://developer.example/greeting/retry@5",
  closureContractRef:
    "contract://developer.example/greeting/retry-closure@5",
  childClosureContractRef:
    "contract://developer.example/greeting/retry-child-closure@5",
});

export function realizeAxF09Transform(input) {
  if (!isGreetingOutput(input)) {
    throw new TypeError(
      "AX-F09 transform requires its exact graph-entry greeting input",
    );
  }
  const resultCandidate = deepFreeze({
    ...input,
    message: input.message + "::retry-locus",
  });
  return deepFreeze({
    kind: "leaf_realization_candidate",
    schemaVersion: "5.0.0",
    disposition: "success",
    evidenceCandidates: [{
      kind: "deterministic_evidence_candidate",
      schemaVersion: "5.0.0",
      implementationRef: AX_F09_RETRY_IDS.transformImplementationRef,
      inputDigest: sha256Canonical(input),
      outputDigest: sha256Canonical(resultCandidate),
    }],
    resultCandidate,
  });
}

export function realizeAxF09ProbabilisticPass(input, occurrence) {
  if (!isGreetingOutput(input)) {
    throw new TypeError(
      "AX-F09 probabilistic pass requires its exact greeting input",
    );
  }
  const workerRequest = deepFreeze({
    actorRef: DEVELOPER_MINI_IDS.workerActorRef,
    workerBindingRef: DEVELOPER_MINI_IDS.workerBindingRef,
    implementationRef: AX_F09_RETRY_IDS.implementationRef,
    inputDigest: sha256Canonical(input),
    materializationPlanRef: DEVELOPER_MINI_IDS.materializationPlanRef,
    rendererRef: DEVELOPER_MINI_IDS.rendererRef,
    instructionContractRef: DEVELOPER_MINI_IDS.outputContractRef,
    resultContractRef: DEVELOPER_MINI_IDS.outputContractRef,
    transportLane: "closed_prompt_proof",
    prompt: [
      "Return the declared developer greeting output unchanged.",
      JSON.stringify(input),
    ].join("\n"),
    responseJsonSchema: {
      type: "object",
      additionalProperties: false,
      required: ["kind", "schemaVersion", "message"],
      properties: {
        kind: { const: "developer_greeting_output" },
        schemaVersion: { const: "5.0.0" },
        message: { const: input.message },
      },
    },
  });
  return deepFreeze({
    kind: "prepared_probabilistic_leaf_invocation",
    schemaVersion: "5.0.0",
    workerRequest,
    complete(actorProcessExchange) {
      const transport = actorProcessExchange.observation;
      const resultCandidate = parseGreetingCandidate(transport.finalOutput);
      const success =
        transport.disposition === "success" &&
        isGreetingOutput(resultCandidate) &&
        resultCandidate.message === input.message;
      const abaContractFailure =
        process.env.ABG_AX_F09_MODE === "aba" && !success;
      const selectedCandidate = abaContractFailure
        ? {
            kind: "developer_greeting_failure",
            schemaVersion: "5.0.0",
            diagnosticRef:
              "diagnostic://developer.example/greeting/aba/" +
              sha256Canonical(transport.finalOutput),
          }
        : resultCandidate;
      return deepFreeze({
        kind: "leaf_realization_candidate",
        schemaVersion: "5.0.0",
        disposition: success || abaContractFailure ? "success" : "failure",
        evidenceCandidates: [],
        resultCandidate: success || abaContractFailure
          ? selectedCandidate
          : {
              kind: "developer_greeting_failure",
              schemaVersion: "5.0.0",
              ...(transport.failureClass === null
                ? {}
                : { failureClass: transport.failureClass }),
              diagnosticRef:
                transport.failureClass === null
                  ? "diagnostic://developer.example/greeting/worker-output-refused@5"
                  : "diagnostic://developer.example/greeting/" +
                    transport.failureClass + "@5",
            },
      });
    },
  });
}

const AX_F09_IMPLEMENTATION_DESCRIPTOR_BODY = {
  implementationRef: AX_F09_RETRY_IDS.implementationRef,
  packageName: "@abiogenesis-fixtures/developer-mini-product",
  packageVersion: "5.0.0",
  modulePath: "build/index.js",
  namedSymbol: "realizeAxF09ProbabilisticPass",
  computeRegime: "F_P",
  inputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
  outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
  failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
  refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
};

const AX_F09_TRANSFORM_IMPLEMENTATION_DESCRIPTOR_BODY = {
  implementationRef: AX_F09_RETRY_IDS.transformImplementationRef,
  packageName: "@abiogenesis-fixtures/developer-mini-product",
  packageVersion: "5.0.0",
  modulePath: "build/index.js",
  namedSymbol: "realizeAxF09Transform",
  computeRegime: "F_D",
  inputContractRef: AX_F09_RETRY_IDS.inputContractRef,
  outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
  failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
  refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
};

export const AX_F09_TRANSFORM_IMPLEMENTATION_DESCRIPTOR = deepFreeze({
  kind: "packaged_leaf_implementation_descriptor",
  schemaVersion: "5.0.0",
  descriptorDigest: sha256Canonical(
    AX_F09_TRANSFORM_IMPLEMENTATION_DESCRIPTOR_BODY,
  ),
  ...AX_F09_TRANSFORM_IMPLEMENTATION_DESCRIPTOR_BODY,
});

export const AX_F09_IMPLEMENTATION_DESCRIPTOR = deepFreeze({
  kind: "packaged_leaf_implementation_descriptor",
  schemaVersion: "5.0.0",
  descriptorDigest: sha256Canonical(AX_F09_IMPLEMENTATION_DESCRIPTOR_BODY),
  ...AX_F09_IMPLEMENTATION_DESCRIPTOR_BODY,
});

export const AX_F09_PRODUCT_SEMANTICS = Object.freeze({
  ...DEVELOPER_MINI_PRODUCT_SEMANTICS,
  bindingRef: AX_F09_RETRY_IDS.semanticsBindingRef,
  admitInput(contractRef, value) {
    if (
      contractRef === AX_F09_RETRY_IDS.inputContractRef &&
      isGreetingOutput(value)
    ) {
      return deepFreeze({ ...value });
    }
    return DEVELOPER_MINI_PRODUCT_SEMANTICS.admitInput(contractRef, value);
  },
  resolveJudgmentRelation(predicateRef) {
    if (predicateRef === AX_F09_RETRY_IDS.transformJudgmentPredicateRef) {
      return Object.freeze({
        predicateRef,
        advanceReasonRef:
          "reason://developer.example/greeting/retry-transform-valid@5",
        rejectionReasonRef:
          "reason://developer.example/greeting/retry-transform-invalid@5",
        evaluate: (input, output) =>
          isGreetingOutput(input) &&
          isGreetingOutput(output) &&
          output.message === input.message + "::retry-locus",
      });
    }
    return DEVELOPER_MINI_PRODUCT_SEMANTICS.resolveJudgmentRelation(
      predicateRef,
    );
  },
});

function constructAxF09Declarations() {
  const placeholder = "sha256:" + "0".repeat(64);
  const base = constructDeveloperMiniPublication({
    productId: "product://developer.example/greeting@5.0.0",
    artifactDigest: placeholder,
    productContentDigest: placeholder,
    productManifestDigest: placeholder,
    packageName: "@abiogenesis-fixtures/developer-mini-product",
    packageVersion: "5.0.0",
  });
  const mixed = base.graphFunctions.find(
    (candidate) => candidate.name === DEVELOPER_MINI_IDS.mixedGraphFunctionRef,
  );
  const probabilistic = mixed?.template?.nodes?.[0]?.term?.terms?.find(
    (candidate) => candidate.kind === "c_of" && candidate.fibre === "F_P",
  );
  const transform = mixed?.template?.nodes?.[0]?.term?.terms?.find(
    (candidate) => candidate.kind === "c_of" && candidate.fibre === "F_D",
  );
  const interaction = mixed?.template?.nodes?.[0]?.term?.terms?.find(
    (candidate) => candidate.kind === "c_of" && candidate.fibre === "F_H",
  );
  const deterministicPass = mixed?.template?.nodes?.[0]?.term?.terms?.find(
    (candidate) =>
      candidate.kind === "c_of" &&
      candidate.fibre === "F_D" &&
      candidate.inputCarrierRef === DEVELOPER_MINI_IDS.outputContractRef &&
      candidate.outputCarrierRef === DEVELOPER_MINI_IDS.outputContractRef,
  );
  if (
    mixed === undefined ||
    probabilistic === undefined ||
    transform === undefined ||
    interaction === undefined ||
    deterministicPass === undefined
  ) {
    throw new TypeError(
      "AX-F09 Product requires authored transform, probabilistic, and hold leaves",
    );
  }
  const graphFunction = deepFreeze({
    kind: "graph_function",
    name: AX_F09_RETRY_IDS.graphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [AX_F09_RETRY_IDS.inputContractRef],
      provides: [DEVELOPER_MINI_IDS.outputContractRef],
      carries: [
        AX_F09_RETRY_IDS.inputContractRef,
        DEVELOPER_MINI_IDS.outputContractRef,
      ],
    },
    inputs: [AX_F09_RETRY_IDS.inputContractRef],
    outputs: [DEVELOPER_MINI_IDS.outputContractRef],
    template: {
      kind: "inline_graph",
      graphRef: AX_F09_RETRY_IDS.graphRef,
      startNodeRef: AX_F09_RETRY_IDS.nodeRef,
      terminalNodeRefs: [AX_F09_RETRY_IDS.nodeRef],
      nodes: [{
        nodeRef: AX_F09_RETRY_IDS.nodeRef,
        nodeKind: "c_locus",
        term: {
          kind: "c_compose",
          inputCarrierRef: AX_F09_RETRY_IDS.inputContractRef,
          outputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
          terms: [{
            ...structuredClone(transform),
            inputCarrierRef: AX_F09_RETRY_IDS.inputContractRef,
            outputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
            programLocusRef: AX_F09_RETRY_IDS.transformLocusRef,
            judgmentPredicateRef:
              AX_F09_RETRY_IDS.transformJudgmentPredicateRef,
            compositionRef: AX_F09_RETRY_IDS.compositionRef,
            vectorIndex: 0,
            resultBearing: false,
            requirement: {
              ...structuredClone(transform.requirement),
              implementationBindingRef:
                AX_F09_RETRY_IDS.transformImplementationBindingRef,
              inputContractRef: AX_F09_RETRY_IDS.inputContractRef,
              outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
            },
          }, {
            kind: "c_retry",
            inputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
            outputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
            budget: 3,
            term: {
              ...structuredClone(probabilistic),
              inputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
              programLocusRef: AX_F09_RETRY_IDS.locusRef,
              compositionRef: AX_F09_RETRY_IDS.compositionRef,
              vectorIndex: 1,
              resultBearing: false,
              requirement: {
                ...structuredClone(probabilistic.requirement),
                implementationBindingRef:
                  AX_F09_RETRY_IDS.implementationBindingRef,
                inputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
              },
            },
          }, {
            kind: "c_workflow",
            inputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
            outputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
            graphFunctionRef: AX_F09_RETRY_IDS.childGraphFunctionRef,
          }],
        },
      }],
      edges: [],
      applications: [],
    },
    effects: [...mixed.effects],
    declarations: {
      ...structuredClone(mixed.declarations),
      "abg.closure_contract": AX_F09_RETRY_IDS.closureContractRef,
    },
    tags: ["developer", "falsifier", "retry", "restart", "fp"],
  });
  const childGraphFunction = deepFreeze({
    kind: "graph_function",
    name: AX_F09_RETRY_IDS.childGraphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [DEVELOPER_MINI_IDS.outputContractRef],
      provides: [DEVELOPER_MINI_IDS.outputContractRef],
      carries: [DEVELOPER_MINI_IDS.outputContractRef],
    },
    inputs: [DEVELOPER_MINI_IDS.outputContractRef],
    outputs: [DEVELOPER_MINI_IDS.outputContractRef],
    template: {
      kind: "inline_graph",
      graphRef: AX_F09_RETRY_IDS.childGraphRef,
      startNodeRef: AX_F09_RETRY_IDS.childNodeRef,
      terminalNodeRefs: [AX_F09_RETRY_IDS.childNodeRef],
      nodes: [{
        nodeRef: AX_F09_RETRY_IDS.childNodeRef,
        nodeKind: "c_locus",
        term: {
          kind: "c_compose",
          inputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
          outputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
          terms: [{
            ...structuredClone(deterministicPass),
            compositionRef: AX_F09_RETRY_IDS.childCompositionRef,
            vectorIndex: 0,
            resultBearing: false,
          }, {
            ...structuredClone(interaction),
            inputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
            outputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
            programLocusRef: AX_F09_RETRY_IDS.childLocusRef,
            compositionRef: AX_F09_RETRY_IDS.childCompositionRef,
            vectorIndex: 1,
            resultBearing: true,
            requirement: structuredClone(interaction.requirement),
          }],
        },
      }],
      edges: [],
      applications: [],
    },
    effects: ["effect://developer.example/greeting/retry-child-hold@5"],
    declarations: {
      ...structuredClone(mixed.declarations),
      "abg.compute_regime": "F_H",
      "abg.closure_contract": AX_F09_RETRY_IDS.childClosureContractRef,
      "abg.child_closure_contract":
        AX_F09_RETRY_IDS.childClosureContractRef,
    },
    tags: ["developer", "falsifier", "retry", "downstream-hold", "fh"],
  });
  const program = deepFreeze({
    kind: "gtl_program",
    programRef: AX_F09_RETRY_IDS.programRef,
    version: "5.0.0",
    moduleRef: DEVELOPER_MINI_IDS.moduleRef,
    starts: [{
      startRef: AX_F09_RETRY_IDS.startRef,
      graphFunctionRef: AX_F09_RETRY_IDS.graphFunctionRef,
    }],
    callableMembership: [
      AX_F09_RETRY_IDS.graphFunctionRef,
      AX_F09_RETRY_IDS.childGraphFunctionRef,
    ],
    closureContractRef: AX_F09_RETRY_IDS.closureContractRef,
    policies: {
      "abg.root_mode": "direct",
      "abg.compute_regime": "F_P",
      "abg.instruction_plan": DEVELOPER_MINI_IDS.materializationPlanRef,
    },
  });
  return { childGraphFunction, graphFunction, program };
}

const AX_F09_DECLARATIONS = constructAxF09Declarations();
export const AX_F09_GRAPH_FUNCTION = AX_F09_DECLARATIONS.graphFunction;
export const AX_F09_CHILD_GRAPH_FUNCTION =
  AX_F09_DECLARATIONS.childGraphFunction;
export const AX_F09_PROGRAM = AX_F09_DECLARATIONS.program;

export function constructAxF09Publication(artifact) {
  const base = constructDeveloperMiniPublication(artifact);
  const baseClosureContract = base.closureContracts.find(
    (candidate) =>
      candidate.closureContractRef === DEVELOPER_MINI_IDS.closureContractRef,
  );
  if (baseClosureContract === undefined) {
    throw new TypeError("AX-F09 requires the installed base closure contract");
  }
  return deepFreeze({
    ...base,
    productSemanticsBinding: {
      ...base.productSemanticsBinding,
      bindingRef: AX_F09_RETRY_IDS.semanticsBindingRef,
      namedSymbol: "AX_F09_PRODUCT_SEMANTICS",
    },
    contracts: [...base.contracts, {
      contractRef: AX_F09_RETRY_IDS.inputContractRef,
      contractVersion: "5.0.0",
      contractKind: "input",
      valueKind: "developer_greeting_output",
    }, {
      contractRef: AX_F09_RETRY_IDS.childClosureContractRef,
      contractVersion: "5.0.0",
      contractKind: "closure",
      valueKind: "developer_retry_child_closure",
    }],
    implementationBindings: [...base.implementationBindings, {
      kind: "implementation_binding",
      bindingRef: AX_F09_RETRY_IDS.transformImplementationBindingRef,
      implementationRef: AX_F09_RETRY_IDS.transformImplementationRef,
      packageName: artifact.packageName,
      packageVersion: artifact.packageVersion,
      modulePath: "build/index.js",
      namedSymbol: "realizeAxF09Transform",
      computeRegime: "F_D",
      inputContractRef: AX_F09_RETRY_IDS.inputContractRef,
      outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
      failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
    }, {
      kind: "implementation_binding",
      bindingRef: AX_F09_RETRY_IDS.implementationBindingRef,
      implementationRef: AX_F09_RETRY_IDS.implementationRef,
      packageName: artifact.packageName,
      packageVersion: artifact.packageVersion,
      modulePath: "build/index.js",
      namedSymbol: "realizeAxF09ProbabilisticPass",
      computeRegime: "F_P",
      inputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
      outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
      failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
    }],
    closureContracts: [...base.closureContracts, {
      ...baseClosureContract,
      closureContractRef: AX_F09_RETRY_IDS.closureContractRef,
      evidenceContractRef:
        DEVELOPER_MINI_IDS.probabilisticEvidenceContractRef,
    }, {
      ...baseClosureContract,
      closureContractRef: AX_F09_RETRY_IDS.childClosureContractRef,
      resultContractRef: DEVELOPER_MINI_IDS.outputContractRef,
      closureScope: "graph_call",
      eventKindRefs: [
        "terminal_reached",
        "frame_closed",
        "graph_call_closed",
      ],
    }],
    graphFunctions: [
      ...base.graphFunctions,
      AX_F09_GRAPH_FUNCTION,
      AX_F09_CHILD_GRAPH_FUNCTION,
    ],
    programs: [...base.programs, AX_F09_PROGRAM],
    contributions: [...base.contributions, {
      handle: AX_F09_RETRY_IDS.graphFunctionRef,
      kind: "graph_function",
      declarationOrContractRef: AX_F09_RETRY_IDS.graphFunctionRef,
      owningProductId: artifact.productId,
      programMembershipRefs: [AX_F09_RETRY_IDS.programRef],
      readinessPrerequisiteRefs: [AX_F09_RETRY_IDS.programRef],
      compatibilityRefs: ["compatibility://abiogenesis/major/5"],
      provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest],
    }, {
      handle: AX_F09_RETRY_IDS.childGraphFunctionRef,
      kind: "graph_function",
      declarationOrContractRef: AX_F09_RETRY_IDS.childGraphFunctionRef,
      owningProductId: artifact.productId,
      programMembershipRefs: [AX_F09_RETRY_IDS.programRef],
      readinessPrerequisiteRefs: [AX_F09_RETRY_IDS.programRef],
      compatibilityRefs: ["compatibility://abiogenesis/major/5"],
      provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest],
    }],
  });
}
`;

const authoredRetryDeclarationTypes = `
export declare const AX_F09_RETRY_IDS: Readonly<{
  programRef: string;
  startRef: string;
  graphFunctionRef: string;
  graphRef: string;
  nodeRef: string;
  locusRef: string;
  inputContractRef: string;
  implementationBindingRef: string;
  implementationRef: string;
  semanticsBindingRef: string;
}>;
export declare const AX_F09_IMPLEMENTATION_DESCRIPTOR: Readonly<Record<string, unknown>>;
export declare const AX_F09_TRANSFORM_IMPLEMENTATION_DESCRIPTOR: Readonly<Record<string, unknown>>;
export declare function realizeAxF09Transform(
  input: unknown,
): Readonly<Record<string, unknown>>;
export declare function realizeAxF09ProbabilisticPass(
  input: unknown,
  occurrence: Readonly<Record<string, unknown>>,
): Readonly<Record<string, unknown>>;
export declare const AX_F09_PRODUCT_SEMANTICS: Readonly<Record<string, unknown>>;
export declare const AX_F09_GRAPH_FUNCTION: Readonly<Record<string, unknown>>;
export declare const AX_F09_CHILD_GRAPH_FUNCTION: Readonly<Record<string, unknown>>;
export declare const AX_F09_PROGRAM: Readonly<Record<string, unknown>>;
export declare function constructAxF09Publication(
  artifact: Readonly<Record<string, string>>,
): Readonly<Record<string, unknown>>;
`;

export async function prepareAxF09RetryProduct(
  packageRoot,
  scratch,
  { retryBudget = 3 } = {},
) {
  const mini = await prepareDeveloperMiniProduct(packageRoot, scratch);
  const indexPath = join(mini.sourceRoot, "build/index.js");
  const declarationPath = join(mini.sourceRoot, "build/index.d.ts");
  await Promise.all([
    writeFile(
      indexPath,
      `${await readFile(indexPath, "utf8")}${authoredRetryDeclaration.replace(
        "budget: 3,",
        `budget: ${retryBudget},`,
      )}`,
      "utf8",
    ),
    writeFile(
      declarationPath,
      `${await readFile(declarationPath, "utf8")}${authoredRetryDeclarationTypes}`,
      "utf8",
    ),
  ]);

  const product = await import(
    `${pathToFileURL(join(packageRoot, "build/code/src/product/index.js")).href}?ax-f09-product=${Date.now()}`
  );
  const authored = await import(
    `${pathToFileURL(indexPath).href}?ax-f09-authored=${Date.now()}`
  );
  const packageJson = JSON.parse(
    await readFile(join(mini.sourceRoot, "package.json"), "utf8"),
  );
  const priorManifest = JSON.parse(
    await readFile(
      join(mini.sourceRoot, "product-toolchain-manifest.json"),
      "utf8",
    ),
  );
  const payloadInventory = await Promise.all(
    priorManifest.productRelativeLocators.map(async (path) => ({
      path,
      sha256: await product.sha256File(join(mini.sourceRoot, path)),
    })),
  );
  const productContentDigest = product.payloadInventoryDigest(payloadInventory);
  const draftPublication = authored.constructAxF09Publication({
    productId: priorManifest.productId,
    artifactDigest: PLACEHOLDER_DIGEST,
    productContentDigest,
    productManifestDigest: PLACEHOLDER_DIGEST,
    packageName: packageJson.name,
    packageVersion: packageJson.version,
  });
  const contributionManifest = {
    ...priorManifest.contributionManifest,
    productContentDigest,
    publicationBindings: [{
      moduleRef: draftPublication.moduleRef,
      publicationDigest:
        product.modulePublicationSemanticDigest(draftPublication),
    }],
    rows: draftPublication.contributions.map((contribution) => ({
      moduleRef: draftPublication.moduleRef,
      handle: contribution.handle,
      kind: contribution.kind,
      declarationOrContractRef: contribution.declarationOrContractRef,
      owningProductId: contribution.owningProductId,
      programMembershipRefs: [...contribution.programMembershipRefs],
      compatibilityRefs: [...contribution.compatibilityRefs],
      provenanceRef: priorManifest.provenanceRef,
      readinessPrerequisiteRefs: [
        ...contribution.readinessPrerequisiteRefs,
      ],
    })),
  };
  const manifest = {
    ...priorManifest,
    productContentDigest,
    contributionManifestDigest:
      product.sha256Canonical(contributionManifest),
    contributionManifest,
  };
  await writeFile(
    join(mini.sourceRoot, "product-toolchain-manifest.json"),
    `${product.canonicalJson(manifest)}\n`,
    "utf8",
  );
  const manifestDigest = product.sha256Canonical(manifest);
  const artifacts = join(scratch, "ax-f09-authored-artifacts");
  await mkdir(artifacts, { recursive: true });
  const { stdout } = await execFileAsync(
    "npm",
    ["pack", "--ignore-scripts", "--json", "--pack-destination", artifacts],
    { cwd: mini.sourceRoot, maxBuffer: 20 * 1024 * 1024 },
  );
  const [packResult] = JSON.parse(stdout);
  const artifactPath = join(artifacts, packResult.filename);
  const artifactDigest = await product.sha256File(artifactPath);
  const basis = {
    artifactDigest,
    manifestDigest,
    productContentDigest,
    productId: manifest.productId,
    packageName: packageJson.name,
    packageVersion: packageJson.version,
  };
  return {
    artifactPath,
    artifactRef: basename(artifactPath),
    basis,
    publication: authored.constructAxF09Publication({
      productId: basis.productId,
      artifactDigest,
      productContentDigest,
      productManifestDigest: manifestDigest,
      packageName: basis.packageName,
      packageVersion: basis.packageVersion,
    }),
  };
}
