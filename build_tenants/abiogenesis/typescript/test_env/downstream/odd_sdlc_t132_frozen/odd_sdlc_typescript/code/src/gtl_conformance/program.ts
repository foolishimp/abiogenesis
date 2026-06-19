// Implements: REQ-F-ODDSDLC-040
// Implements: REQ-F-ODDSDLC-088
// Validates: T-197

import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync
} from "node:fs";
import path, { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  GTL_PROGRAM_BIND_ADMISSION_STRENGTH_COMPATIBILITY_REF,
  GTL_PROGRAM_OBLIGATION_DELTA_FAMILY_VALUES,
  GTL_PROGRAM_T153_FEATURE_KINDS,
  GTL_PROGRAM_T153_FEATURE_OWNER_CLASSIFICATIONS,
  admitGtlProgramConformanceInput,
  formatGtlProgramConformanceIssues,
  materializeGraphFunction,
  resolveAbgFnCompositionSelection,
  typecheckGtlProgram
} from "@abiogenesis/typescript-tenant";
import type {
  Graph,
  GraphFunction,
  GraphVector,
  GtlProgramConformanceInput,
  GtlProgramConformanceInputAdmission,
  GtlProgramConformanceReport,
  GtlProgramComputeCompositionRow,
  GtlProgramComputeStageBindingRow,
  GtlProgramFeatureCoverageManifest,
  GtlProgramObligationDeltaFamily,
  GtlProgramPluginResultInterfaceRow,
  GtlProgramRuntimeBindingRow,
  GtlProgramT153FeatureKind,
  GtlProgramTargetCarrierRow,
  GtlProgramTraversalBindConservationRow,
  EnginePluginContract,
  Module,
  Regime
} from "@abiogenesis/typescript-tenant";
import {
  constructSdlcGraphFunctionCatalog,
  constructSdlcGtlModule,
  constructSdlcTargetCarrierRegistry,
  constructSdlcTraversalOverlayCatalog,
  publicSdlcOverlayStartTargets,
  SDLC_EDGE_GAIN_CLOSURE_CONTRACTS
} from "../graph/index.js";
import { ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT } from "../runtime/index.js";
import {
  constructSdlcEvaluationGridContract,
  constructSdlcPromptInvocationProjection,
  sdlcPromptSectionFromLines
} from "../operator/prompt_assets.js";
import {
  consequenceProjectionPluginContract,
  designDepthFpEvaluatorRuleContract,
  fpDispatchPluginContract,
  fpEvaluatorPluginContract,
  reviewGradeEdgeFulfillmentRuleContract,
  ticketWorkflowFdRuleContract
} from "../operator/plugins/plugin_contracts.js";
const PACKAGE_ROOT_FROM_BUILD = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../../.."
);

export const SDLC_GTL_PROGRAM_CONFORMANCE_SUBJECT_REF =
  "workspace://odd-sdlc/typescript/current" as const;

export const SDLC_GTL_PROGRAM_CONFORMANCE_FEATURE_COVERAGE_REF =
  "feature-coverage://odd-sdlc/typescript/current" as const;

export const SDLC_GTL_PROGRAM_CONFORMANCE_ACTIVE_SCAN_ROOTS = Object.freeze([
  "specification",
  "build_tenants/typescript/code/src",
  "build_tenants/typescript/design",
  "build_tenants/typescript/test_env/tests",
  "build_tenants/typescript/test_env/live"
] as const);

export const SDLC_GTL_PROGRAM_CONFORMANCE_ACTIVE_SCAN_EXTENSIONS =
  Object.freeze([".ts", ".mjs", ".md", ".json"] as const);

export const SDLC_GTL_PROGRAM_CONFORMANCE_EXCLUDED_SCAN_SURFACES =
  Object.freeze([
    "build_tenants/typescript/test_env/tests/test_t194_gtl_program_conformance.test.mjs",
    "build_tenants/typescript/test_env/tests/test_t197_product_gtl_gate.test.mjs"
  ] as const);

const STALE_ABG_IDENTITY_PATTERN_SOURCE = [
  "(?:",
  "abg[-_:/ ]?3\\.",
  "|ABG[-_:/ ]?3\\.",
  "|ABIogenesis[^\\n`]*3\\.",
  "|@abiogenesis[^\\n`]*(?:@|\\/)3\\.",
  "|runtime:\\/\\/abg\\/3\\.",
  "|abg:\\/\\/3\\.",
  "|3\\.7\\.1-r" + "c\\.1",
  "|3\\.8\\.0-r" + "c\\.3",
  "|3\\.9-r" + "c3",
  "|3\\.9\\.0-r" + "c\\.13",
  "|r" + "c13",
  "|r" + "c\\.13",
  ")"
].join("");

export const STALE_ABG_IDENTITY_PATTERN = new RegExp(
  STALE_ABG_IDENTITY_PATTERN_SOURCE,
  "u"
);

const T153_REQUIREMENT_REFS = Object.freeze([
  "REQ-L-GTL3-ASSET-SURFACE",
  "REQ-L-GTL3-COMPOSE",
  "REQ-L-GTL3-COMPUTE-NOTATION",
  "REQ-L-GTL3-CONTRACT-LAW-API",
  "REQ-L-GTL3-EVALUATOR",
  "REQ-L-GTL3-GRAPH",
  "REQ-L-GTL3-GRAPHFUNCTION",
  "REQ-L-GTL3-GRAPHVECTOR",
  "REQ-L-GTL3-HOF",
  "REQ-L-GTL3-HOOKS",
  "REQ-L-GTL3-IDENTITY",
  "REQ-L-GTL3-JOB",
  "REQ-L-GTL3-LAWS",
  "REQ-L-GTL3-MODULE",
  "REQ-L-GTL3-OPERATOR",
  "REQ-L-GTL3-RECURSE",
  "REQ-L-GTL3-ROLE",
  "REQ-L-GTL3-RULE",
  "REQ-L-GTL3-SELECTION-BOUNDARY",
  "REQ-L-GTL3-SUBSTITUTE",
  "REQ-L-GTL3-SUBWORK",
  "REQ-L-GTL3-SYNTHESIS",
  "REQ-R-ABG3-ASSURANCE",
  "REQ-R-ABG3-FN-COMPOSITION",
  "REQ-R-ABG3-INTERPRET",
  "REQ-R-ABG3-RUN",
  "REQ-R-ABG3-TRANSPORT"
] as const);

interface HookConfigEntryLike {
  readonly key: string;
  readonly value?: {
    readonly kind?: string;
    readonly value?: unknown;
  };
}

interface HookRefLike {
  readonly ref: string;
  readonly config?: {
    readonly entries?: readonly HookConfigEntryLike[];
  };
}

interface MaterializedGraphVectorRow {
  readonly graphFunction: GraphFunction;
  readonly graph: Graph;
  readonly vector: GraphVector;
}

export interface SdlcGtlProgramConformanceInputOptions {
  readonly packageRoot?: string | undefined;
  readonly repoRoot?: string | undefined;
  readonly subjectRef?: string | undefined;
  readonly featureCoverageManifestRef?: string | undefined;
  readonly activeScanRoots?: readonly string[] | undefined;
  readonly excludedScanSurfaces?: readonly string[] | undefined;
}

function packageRootFromOptions(
  input: Pick<SdlcGtlProgramConformanceInputOptions, "packageRoot"> = {}
): string {
  return resolve(input.packageRoot ?? PACKAGE_ROOT_FROM_BUILD);
}

function repoRootFromOptions(input: SdlcGtlProgramConformanceInputOptions): string {
  return resolve(input.repoRoot ?? resolve(packageRootFromOptions(input), "../.."));
}

function currentAbgFoldRef(): string {
  const currentAbgVersion =
    ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.packageVersion;
  return (
    `package:@abiogenesis/typescript-tenant@${currentAbgVersion}` +
    "#abg/m03/iteration_state_action/deriveIterationOutcomeFromRows"
  );
}

function repoRelative(input: {
  readonly repoRoot: string;
  readonly filePath: string;
}): string {
  return path.relative(input.repoRoot, input.filePath).split(path.sep).join("/");
}

function walkActiveFiles(input: {
  readonly repoRoot: string;
  readonly rootRelativePath: string;
  readonly excludedScanSurfaces: ReadonlySet<string>;
}): readonly string[] {
  const root = path.join(input.repoRoot, input.rootRelativePath);
  if (!existsSync(root)) {
    return Object.freeze([]);
  }
  const files: string[] = [];
  const stack = [root];
  const activeExtensions = new Set<string>(
    SDLC_GTL_PROGRAM_CONFORMANCE_ACTIVE_SCAN_EXTENSIONS
  );
  while (stack.length > 0) {
    const current = stack.pop();
    if (current === undefined) {
      continue;
    }
    const stat = statSync(current);
    if (stat.isDirectory()) {
      for (const entry of readdirSync(current)) {
        if (entry === "build" || entry === "node_modules") {
          continue;
        }
        stack.push(path.join(current, entry));
      }
      continue;
    }
    if (!stat.isFile()) {
      continue;
    }
    const relative = repoRelative({
      repoRoot: input.repoRoot,
      filePath: current
    });
    if (input.excludedScanSurfaces.has(relative)) {
      continue;
    }
    if (activeExtensions.has(path.extname(current))) {
      files.push(current);
    }
  }
  return Object.freeze(files.sort());
}

export function activeSdlcSourceIdentitySurfaces(
  input: SdlcGtlProgramConformanceInputOptions = {}
) {
  const repoRoot = repoRootFromOptions(input);
  const packageRoot = packageRootFromOptions(input);
  const excludedScanSurfaces = new Set<string>([
    ...SDLC_GTL_PROGRAM_CONFORMANCE_EXCLUDED_SCAN_SURFACES,
    ...(input.excludedScanSurfaces ?? [])
  ]);
  const rows = [];
  for (const root of input.activeScanRoots ??
    SDLC_GTL_PROGRAM_CONFORMANCE_ACTIVE_SCAN_ROOTS) {
    for (const filePath of walkActiveFiles({
      repoRoot,
      rootRelativePath: root,
      excludedScanSurfaces
    })) {
      const relative = repoRelative({ repoRoot, filePath });
      rows.push(
        Object.freeze({
          surfaceRef: relative,
          text: readFileSync(filePath, "utf8"),
          evidenceRefs: Object.freeze([`workspace://${relative}`])
        })
      );
    }
  }
  if (rows.length === 0) {
    const packageJsonPath = path.join(packageRoot, "package.json");
    const packageJsonText = existsSync(packageJsonPath)
      ? readFileSync(packageJsonPath, "utf8")
      : "{}";
    rows.push(
      Object.freeze({
        surfaceRef: "package://@odd-sdlc/typescript-tenant/current",
        text: [
          "# Packaged SDLC Source Identity",
          "",
          `subjectRef: ${SDLC_GTL_PROGRAM_CONFORMANCE_SUBJECT_REF}`,
          `abiPackageVersion: ${ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.packageVersion}`,
          "",
          "```json",
          packageJsonText,
          "```"
        ].join("\n"),
        evidenceRefs: Object.freeze([
          "package://@odd-sdlc/typescript-tenant",
          "workspace://build_tenants/typescript/package.json"
        ])
      })
    );
  }
  return Object.freeze(rows);
}

function promptSection(title: string) {
  return sdlcPromptSectionFromLines({
    role: "purpose",
    title,
    textLines: [
      "Construct or evaluate the declared SDLC carrier through the typed prompt asset boundary."
    ],
    intent: "Prove prompt construction is a GTL AssetSurface/Node view.",
    expectedOutcome:
      "The prompt projection preserves typed constructor, authority, proof, and digest refs.",
    failureModeAddressed:
      "Prompt prose or MCP-shaped schema becomes the source of contract truth.",
    appliesWhen:
      "The SDLC program inventory is typechecked for GTL program conformance.",
    provenanceRefs: ["ticket://odd-sdlc/T-197"],
    authorityBasisRefs: ["requirement://odd-sdlc/REQ-F-ODDSDLC-088"]
  });
}

function evaluationGridContractForConformance() {
  return constructSdlcEvaluationGridContract({
    logicalGridRef: "evaluation-grid://odd-sdlc/program-conformance/current",
    physicalExecution: "fused_prompt",
    transformUnits: [
      {
        kind: "sdlc_transform_unit_ref",
        unitRef: "transform-unit://odd-sdlc/program-conformance/current/one",
        segmentKey: "single",
        sourceAssetRefs: ["workspace://source"],
        targetAssetRefs: ["workspace://target"],
        obligationRefs: ["requirement://odd-sdlc/REQ-F-ODDSDLC-088"]
      }
    ],
    evaluationDimensions: [
      {
        kind: "sdlc_evaluation_dimension_ref",
        dimensionRef:
          "evaluation-dimension://odd-sdlc/program-conformance/current/cell-quality",
        scope: "cell",
        expectedFindingRef:
          "evaluation-finding://odd-sdlc/program-conformance/current/cell-quality"
      }
    ],
    disambiguationCarriers: [
      {
        kind: "sdlc_disambiguation_carrier_ref",
        carrierRef:
          "carrier://odd-sdlc/program-conformance/current/cell-quality",
        scopeRef: "evaluation-scope://odd-sdlc/program-conformance/current/single",
        authoritySnapshotRefs: ["authority://odd-sdlc/product"],
        priorFindingRefs: [],
        lineageRefs: ["lineage://odd-sdlc/program-conformance/current"]
      }
    ],
    expectedFindingRefs: [
      "evaluation-finding://odd-sdlc/program-conformance/current/cell-quality"
    ],
    abgOutcomeFoldRef: currentAbgFoldRef(),
    provenanceRefs: ["ticket://odd-sdlc/T-197"]
  });
}

function promptProjectionRows() {
  const transformProjection = constructSdlcPromptInvocationProjection({
    promptFamily: "transform",
    stage: "transform.C",
    recipient: "transformer",
    targetAssetType: "sdlc_transform_candidate",
    constructorRef: "constructor://odd-sdlc/program-conformance/transform-prompt",
    authorityPacketRefs: ["authority://odd-sdlc/product"],
    obligationRefs: ["requirement://odd-sdlc/REQ-F-ODDSDLC-088"],
    toolEffectPolicyRefs: ["tool-policy://odd-sdlc/program-conformance/read-write-output-only"],
    outputCarrierRefs: ["carrier://odd-sdlc/transform-candidate"],
    proofObligationRefs: ["proof://odd-sdlc/program-conformance/transform-prompt"],
    evaluationGridContract: null,
    promptSections: [promptSection("SDLC Transform Prompt Boundary")]
  });

  const evaluationProjection = constructSdlcPromptInvocationProjection({
    promptFamily: "evaluate_review_grade",
    stage: "evaluate.C",
    recipient: "evaluator",
    targetAssetType: "sdlc_review_grade_assessment",
    constructorRef: "constructor://odd-sdlc/program-conformance/evaluate-prompt",
    authorityPacketRefs: ["authority://odd-sdlc/product"],
    obligationRefs: ["requirement://odd-sdlc/REQ-F-ODDSDLC-088"],
    toolEffectPolicyRefs: ["tool-policy://odd-sdlc/program-conformance/read-only"],
    outputCarrierRefs: ["carrier://odd-sdlc/review-grade-assessment"],
    proofObligationRefs: ["proof://odd-sdlc/program-conformance/evaluate-prompt"],
    evaluationGridContract: evaluationGridContractForConformance(),
    promptSections: [promptSection("SDLC Evaluate Prompt Boundary")]
  });

  const designDepthProjection = constructSdlcPromptInvocationProjection({
    promptFamily: "evaluate_design_depth",
    stage: "evaluate.C",
    recipient: "evaluator_subworkstream",
    targetAssetType: "implementation_design_surface",
    constructorRef:
      "constructor://odd-sdlc/program-conformance/design-depth-prompt",
    authorityPacketRefs: ["authority://odd-sdlc/product"],
    obligationRefs: ["requirement://odd-sdlc/REQ-F-ODDSDLC-088"],
    toolEffectPolicyRefs: [
      "tool-policy://odd-sdlc/program-conformance/design-depth-output-only"
    ],
    outputCarrierRefs: [
      "carrier://odd-sdlc/design-depth-register",
      "carrier://odd-sdlc/implementation-design-surface"
    ],
    proofObligationRefs: [
      "proof://odd-sdlc/program-conformance/design-depth-prompt"
    ],
    evaluationGridContract: evaluationGridContractForConformance(),
    promptSections: [promptSection("SDLC Design-Depth Prompt Boundary")]
  });

  return Object.freeze([transformProjection, designDepthProjection, evaluationProjection]
    .map((projection) => Object.freeze({
      surfaceRef:
        `prompt://odd-sdlc/${projection.invocationAsset.promptFamily}` +
        `/${projection.invocationAsset.stage}`,
      assetSurface: projection.invocationAsset.gtlNode.assetSurface,
      gtlNode: projection.invocationAsset.gtlNode,
      renderedViewDigest: projection.invocationAsset.renderedPromptDigest,
      currentAbgFoldRefs:
        projection.invocationAsset.evaluationGridContract === null
          ? Object.freeze([])
          : Object.freeze([
              projection.invocationAsset.evaluationGridContract.abgOutcomeFoldRef
            ]),
      evidenceRefs: Object.freeze([
        "workspace://build_tenants/typescript/code/src/operator/prompt_assets.ts",
        "workspace://build_tenants/typescript/code/src/operator/plugins/evaluate/prompts.ts"
      ])
    })));
}

function materializedGraphVectorRows(module: Module): readonly MaterializedGraphVectorRow[] {
  return Object.freeze(
    module.graphFunctions.flatMap((graphFunction) => {
      const graph = materializeGraphFunction(graphFunction);
      return graph.vectors.map((vector) => Object.freeze({
        graphFunction,
        graph,
        vector
      }));
    })
  );
}

function stringForRef(value: string): string {
  return value.replace(/[^A-Za-z0-9_.:-]+/gu, "-");
}

function digestForRef(ref: string): string {
  return `sha256:${stringForRef(ref)}`;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isHookRefLike(value: unknown): value is HookRefLike {
  return isRecord(value) && typeof value["ref"] === "string";
}

function hookRefEntries(
  entries: readonly HookConfigEntryLike[],
  key: string | null = null
): readonly {
  readonly key: string;
  readonly hookRef: HookRefLike;
}[] {
  return Object.freeze(entries
    .filter((entry) => key === null || entry.key === key)
    .filter((entry) => entry.value?.kind === "hook_ref")
    .map((entry) => {
      const hookRef = entry.value?.value;
      return isHookRefLike(hookRef)
        ? Object.freeze({ key: entry.key, hookRef })
        : null;
    })
    .filter((entry): entry is { readonly key: string; readonly hookRef: HookRefLike } =>
      entry !== null
    ));
}

function uniqueRows<T>(
  rows: readonly T[],
  keyForRow: (row: T) => string
): readonly T[] {
  const seen = new Set<string>();
  const unique: T[] = [];
  for (const row of rows) {
    const key = keyForRow(row);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(row);
  }
  return Object.freeze(unique);
}

function graphVectorRowIdentityKey(input: {
  readonly graphFunctionId: string;
  readonly graphId: string;
  readonly graphVectorId: string;
}): string {
  return `${input.graphFunctionId}:${input.graphId}:${input.graphVectorId}`;
}

function operatorDeclarationRows(vectorRows: readonly MaterializedGraphVectorRow[]) {
  return Object.freeze(
    vectorRows.flatMap((row) =>
      row.vector.operators.map((operator, index) => Object.freeze({
        operatorRef:
          `operator://odd-sdlc/${row.graphFunction.name}` +
          `/${row.vector.name}/${index}/${operator.name}`,
        name: operator.name,
        regime: operator.regime,
        binding: operator.binding,
        hostKind: "graph_vector" as const,
        hostRef: row.vector.id,
        tagRefs: operator.tags,
        evidenceRefs: Object.freeze([
          "workspace://build_tenants/typescript/code/src/graph/module.ts"
        ])
      }))
    )
  );
}

function evaluatorDeclarationRows(vectorRows: readonly MaterializedGraphVectorRow[]) {
  return Object.freeze(
    vectorRows.flatMap((row) =>
      row.vector.evaluators.map((evaluator, index) => Object.freeze({
        evaluatorRef:
          `evaluator://odd-sdlc/${row.graphFunction.name}` +
          `/${row.vector.name}/${index}/${evaluator.name}`,
        name: evaluator.name,
        regime: evaluator.regime,
        description: evaluator.description,
        binding: evaluator.binding,
        consumedFieldRefs: evaluator.consumedFieldRefs,
        hostKind: "graph_vector" as const,
        hostRef: row.vector.id,
        tagRefs: evaluator.tags,
        evidenceRefs: Object.freeze([
          "workspace://build_tenants/typescript/code/src/graph/module.ts"
        ])
      }))
    )
  );
}

function ruleDeclarationRows(vectorRows: readonly MaterializedGraphVectorRow[]) {
  return Object.freeze(
    vectorRows.flatMap((row) => {
      if (row.vector.rule === null) {
        return [];
      }
      return [Object.freeze({
        ruleRef:
          `rule://odd-sdlc/${row.graphFunction.name}` +
          `/${row.vector.name}/${row.vector.rule.name}`,
        name: row.vector.rule.name,
        ruleKind: row.vector.rule.kind,
        configDigest: digestForRef(
          `rule:${row.graphFunction.name}:${row.vector.name}:${row.vector.rule.name}`
        ),
        hostKind: "graph_vector" as const,
        hostRef: row.vector.id,
        tagRefs: row.vector.rule.tags,
        evidenceRefs: Object.freeze([
          "workspace://build_tenants/typescript/code/src/graph/module.ts"
        ])
      })];
    })
  );
}

function computeCompositionRows(vectorRows: readonly MaterializedGraphVectorRow[]) {
  return uniqueRows(
    vectorRows.flatMap((row) =>
      hookRefEntries(row.vector.declarations.entries, "abg.fn_composition")
        .map(() => {
          const compositionSelection = resolveAbgFnCompositionSelection({
            vector: row.vector,
            graphFunction: row.graphFunction
          });
          const compositionRef = compositionSelection.contract.contractRef;
          const closureContractRef =
            compositionSelection.contract.closureContractRef;
          const regimeBindingRefs = Object.freeze([
            ...row.vector.operators.map((operator) => operator.binding),
            ...row.vector.evaluators.map((evaluator) => evaluator.binding)
          ]);
          return Object.freeze({
            compositionRef,
            compositionDigest: compositionSelection.contract.contractDigest,
            hostKind: "graph_vector" as const,
            hostRef: row.vector.id,
            declarationSourceKind: "graph_vector_declaration" as const,
            declarationSourceRef: compositionSelection.contract.hookRef,
            notationRefs: Object.freeze([
              "fn<SourceAsset,TargetAsset>.C",
              "transform.C",
              "evaluate.C",
              "consequence.C"
            ]),
            regimeBindingRefs,
            stageBindingRefs: Object.freeze([
              `stage-binding://odd-sdlc/${stringForRef(compositionRef)}/transform.C`,
              `stage-binding://odd-sdlc/${stringForRef(compositionRef)}/evaluate.C`,
              `stage-binding://odd-sdlc/${stringForRef(compositionRef)}/evaluate.F_D`,
              `stage-binding://odd-sdlc/${stringForRef(compositionRef)}/consequence.C`
            ]),
            closureContractRef,
            evidenceRefs: Object.freeze([
              "workspace://build_tenants/typescript/code/src/graph/module.ts"
            ])
          });
        })
    ),
    (row) => `${row.hostRef}:${row.compositionRef}`
  );
}

function regimeBindingRefsFor(
  composition: GtlProgramComputeCompositionRow,
  regime: Regime
): readonly string[] {
  const matchingRefs = composition.regimeBindingRefs.filter((ref) => {
    switch (regime) {
      case "F_D":
        return ref.startsWith("fd://");
      case "F_P":
        return ref.startsWith("fp://") || ref.startsWith("agent://");
      case "F_H":
        return ref.startsWith("human://");
    }
  });
  return Object.freeze(
    matchingRefs.length === 0
      ? [`${composition.compositionRef}#${regime}`]
      : matchingRefs
  );
}

function regimeDispositionRows(input: {
  readonly composition: GtlProgramComputeCompositionRow;
  readonly stageBindingRef: string;
  readonly participatingRegime: Regime;
}) {
  return Object.freeze(
    (["F_D", "F_P", "F_H"] as const).map((regime) => {
      if (regime === input.participatingRegime) {
        return Object.freeze({
          regime,
          disposition: "participates" as const,
          selectedRegimeBindingRefs: regimeBindingRefsFor(input.composition, regime),
          reasonRefs: Object.freeze([]),
          evidenceRefs: Object.freeze([
            input.composition.compositionRef,
            input.stageBindingRef
          ])
        });
      }
      return Object.freeze({
        regime,
        disposition: "not_used" as const,
        selectedRegimeBindingRefs: Object.freeze([]),
        reasonRefs: Object.freeze([
          `reason://odd-sdlc/typescript/${stringForRef(input.stageBindingRef)}/${regime}/not-used`
        ]),
        evidenceRefs: Object.freeze([])
      });
    })
  );
}

function pluginRefsForStage(
  pluginContracts: readonly EnginePluginContract[],
  stageRole: "transform" | "evaluate" | "consequence",
  computeMeans: Regime
): readonly string[] {
  return Object.freeze(
    pluginContracts
      .filter((contract) =>
        contract.computeStageRole === stageRole &&
        contract.computeMeans === computeMeans
      )
      .map((contract) => contract.ref)
      .sort()
  );
}

function pluginOutputCarriersForStage(
  pluginContracts: readonly EnginePluginContract[],
  stageRole: "transform" | "evaluate" | "consequence",
  computeMeans: Regime
): readonly string[] {
  return Object.freeze(
    pluginContracts
      .filter((contract) =>
        contract.computeStageRole === stageRole &&
        contract.computeMeans === computeMeans
      )
      .map((contract) => contract.outputCarrier)
      .sort()
  );
}

function computeStageBindingRows(input: {
  readonly computeCompositions: readonly GtlProgramComputeCompositionRow[];
  readonly pluginContracts: readonly EnginePluginContract[];
}): readonly GtlProgramComputeStageBindingRow[] {
  return Object.freeze(
    input.computeCompositions.flatMap((composition) => {
      const transformStageRef = composition.stageBindingRefs[0];
      const evaluateStageRef = composition.stageBindingRefs[1];
      const fdEvaluateStageRef = composition.stageBindingRefs[2];
      const consequenceStageRef = composition.stageBindingRefs[3];
      if (
        transformStageRef === undefined ||
        evaluateStageRef === undefined ||
        fdEvaluateStageRef === undefined ||
        consequenceStageRef === undefined
      ) {
        throw new TypeError(
          `${composition.compositionRef} must publish transform/evaluate/evaluate.F_D/consequence stage refs`
        );
      }
      return [
        Object.freeze({
          stageBindingRef: transformStageRef,
          compositionRef: composition.compositionRef,
          compositionDigest: composition.compositionDigest,
          stageRole: "transform" as const,
          stageNotationRef: `transform.C:${composition.compositionRef}`,
          stagePurpose: "candidate_construction" as const,
          computeMeans: "F_P" as const,
          inputCarrierRefs: Object.freeze(["EnginePluginInput"]),
          outputCarrierRefs: pluginOutputCarriersForStage(
            input.pluginContracts,
            "transform",
            "F_P"
          ),
          predecessorStageBindingRefs: Object.freeze([]),
          pluginContractRefs: pluginRefsForStage(
            input.pluginContracts,
            "transform",
            "F_P"
          ),
          hookRefs: Object.freeze([composition.declarationSourceRef]),
          regimeDispositions: regimeDispositionRows({
            composition,
            stageBindingRef: transformStageRef,
            participatingRegime: "F_P"
          }),
          mayWriteLedgers: false as const,
          mayEmitRuntimeEvents: false as const,
          maySelectTraversal: false as const,
          mayCloseTraversal: false as const,
          mayOwnIterationLoop: false as const,
          evidenceRefs: Object.freeze([
            "workspace://build_tenants/typescript/code/src/operator/plugins/plugin_set.ts"
          ])
        }),
        Object.freeze({
          stageBindingRef: evaluateStageRef,
          compositionRef: composition.compositionRef,
          compositionDigest: composition.compositionDigest,
          stageRole: "evaluate" as const,
          stageNotationRef: `evaluate.C:${composition.compositionRef}`,
          stagePurpose: "candidate_evaluation" as const,
          computeMeans: "F_P" as const,
          inputCarrierRefs: Object.freeze(["EnginePluginInput"]),
          outputCarrierRefs: pluginOutputCarriersForStage(
            input.pluginContracts,
            "evaluate",
            "F_P"
          ),
          predecessorStageBindingRefs: Object.freeze([transformStageRef]),
          pluginContractRefs: pluginRefsForStage(
            input.pluginContracts,
            "evaluate",
            "F_P"
          ),
          hookRefs: Object.freeze([composition.declarationSourceRef]),
          regimeDispositions: regimeDispositionRows({
            composition,
            stageBindingRef: evaluateStageRef,
            participatingRegime: "F_P"
          }),
          mayWriteLedgers: false as const,
          mayEmitRuntimeEvents: false as const,
          maySelectTraversal: false as const,
          mayCloseTraversal: false as const,
          mayOwnIterationLoop: false as const,
          evidenceRefs: Object.freeze([
            "workspace://build_tenants/typescript/code/src/operator/plugins/plugin_set.ts"
          ])
        }),
        Object.freeze({
          stageBindingRef: fdEvaluateStageRef,
          compositionRef: composition.compositionRef,
          compositionDigest: composition.compositionDigest,
          stageRole: "evaluate" as const,
          stageNotationRef: `evaluate.C:${composition.compositionRef}:F_D`,
          stagePurpose: "candidate_evaluation" as const,
          computeMeans: "F_D" as const,
          inputCarrierRefs: Object.freeze(["EnginePluginInput"]),
          outputCarrierRefs: pluginOutputCarriersForStage(
            input.pluginContracts,
            "evaluate",
            "F_D"
          ),
          predecessorStageBindingRefs: Object.freeze([transformStageRef]),
          pluginContractRefs: pluginRefsForStage(
            input.pluginContracts,
            "evaluate",
            "F_D"
          ),
          hookRefs: Object.freeze([composition.declarationSourceRef]),
          regimeDispositions: regimeDispositionRows({
            composition,
            stageBindingRef: fdEvaluateStageRef,
            participatingRegime: "F_D"
          }),
          mayWriteLedgers: false as const,
          mayEmitRuntimeEvents: false as const,
          maySelectTraversal: false as const,
          mayCloseTraversal: false as const,
          mayOwnIterationLoop: false as const,
          evidenceRefs: Object.freeze([
            "workspace://build_tenants/typescript/code/src/operator/plugins/plugin_set.ts"
          ])
        }),
        Object.freeze({
          stageBindingRef: consequenceStageRef,
          compositionRef: composition.compositionRef,
          compositionDigest: composition.compositionDigest,
          stageRole: "consequence" as const,
          stageNotationRef: `consequence.C:${composition.compositionRef}`,
          stagePurpose: "consequence_projection" as const,
          computeMeans: "F_D" as const,
          inputCarrierRefs: Object.freeze(["EnginePluginInput"]),
          outputCarrierRefs: pluginOutputCarriersForStage(
            input.pluginContracts,
            "consequence",
            "F_D"
          ),
          predecessorStageBindingRefs: Object.freeze([
            transformStageRef,
            evaluateStageRef,
            fdEvaluateStageRef
          ]),
          pluginContractRefs: pluginRefsForStage(
            input.pluginContracts,
            "consequence",
            "F_D"
          ),
          hookRefs: Object.freeze([composition.declarationSourceRef]),
          regimeDispositions: regimeDispositionRows({
            composition,
            stageBindingRef: consequenceStageRef,
            participatingRegime: "F_D"
          }),
          mayWriteLedgers: false as const,
          mayEmitRuntimeEvents: false as const,
          maySelectTraversal: false as const,
          mayCloseTraversal: false as const,
          mayOwnIterationLoop: false as const,
          evidenceRefs: Object.freeze([
            "workspace://build_tenants/typescript/code/src/operator/plugins/plugin_set.ts"
          ])
        })
      ];
    })
  );
}

const PLUGIN_RESULT_INTERFACE_IDENTITY_FIELD_REFS = Object.freeze([
  "compositionRef",
  "compositionDigest",
  "compositionSelectionRef",
  "stageRole",
  "computeMeans",
  "outputCarrierRefs",
  "evidenceRefs"
]);

function pluginResultInterfaceRows(
  computeStageBindings: readonly GtlProgramComputeStageBindingRow[]
): readonly GtlProgramPluginResultInterfaceRow[] {
  return Object.freeze(
    computeStageBindings.map((row) => {
      const stageKey = stringForRef(row.stageBindingRef);
      const resultCarrierKind = row.outputCarrierRefs[0];
      if (resultCarrierKind === undefined) {
        throw new TypeError(
          `missing plugin result output carrier for ${row.stageBindingRef}`
        );
      }
      return Object.freeze({
        resultInterfaceRef:
          `result-interface://odd-sdlc/typescript/${stageKey}`,
        stageBindingRef: row.stageBindingRef,
        compositionRef: row.compositionRef,
        compositionDigest: row.compositionDigest,
        stageRole: row.stageRole,
        computeMeans: row.computeMeans,
        resultEnvelopeContractRef:
          `result-envelope://odd-sdlc/typescript/${stageKey}`,
        resultCarrierKind,
        outputCarrierRefs: row.outputCarrierRefs,
        producedCarrierRefs: Object.freeze(
          row.outputCarrierRefs.map(
            (carrierRef) =>
              `carrier://odd-sdlc/typescript/${stageKey}/${stringForRef(carrierRef)}`
          )
        ),
        requiredIdentityFieldRefs: PLUGIN_RESULT_INTERFACE_IDENTITY_FIELD_REFS,
        selectorAuthorityRefs: Object.freeze([
          `gtl://plugin-result-interface/odd-sdlc/typescript/${stageKey}`
        ]),
        evidenceRefs: Object.freeze([
          row.stageBindingRef,
          "workspace://build_tenants/typescript/code/src/gtl_conformance/program.ts"
        ]),
        mayWriteLedgers: false as const,
        mayEmitRuntimeEvents: false as const,
        maySelectTraversal: false as const,
        mayCloseTraversal: false as const,
        mayOwnIterationLoop: false as const
      });
    })
  );
}

const ODD_SDLC_OBLIGATION_DELTA_FAMILIES:
  readonly GtlProgramObligationDeltaFamily[] =
    GTL_PROGRAM_OBLIGATION_DELTA_FAMILY_VALUES;

function traversalBindConservationRows(input: {
  readonly vectorRows: readonly MaterializedGraphVectorRow[];
  readonly targetCarrierContracts: readonly GtlProgramTargetCarrierRow[];
  readonly computeCompositions: readonly GtlProgramComputeCompositionRow[];
  readonly computeStageBindings: readonly GtlProgramComputeStageBindingRow[];
}): readonly GtlProgramTraversalBindConservationRow[] {
  const targetCarrierByIdentity = new Map<string, GtlProgramTargetCarrierRow>();
  for (const targetCarrier of input.targetCarrierContracts) {
    const key = graphVectorRowIdentityKey(targetCarrier);
    if (targetCarrierByIdentity.has(key)) {
      throw new TypeError(
        `${targetCarrier.graphFunctionId}/${targetCarrier.graphVectorId}: duplicate target-carrier row for traversal bind conservation`
      );
    }
    targetCarrierByIdentity.set(key, targetCarrier);
  }
  const stageBindingRefsByVectorId = new Map<string, readonly string[]>();
  for (const composition of input.computeCompositions) {
    const stageBindingRefs = input.computeStageBindings
      .filter((row) => row.compositionRef === composition.compositionRef)
      .map((row) => row.stageBindingRef)
      .sort();
    stageBindingRefsByVectorId.set(composition.hostRef, Object.freeze(stageBindingRefs));
  }
  return Object.freeze(
    input.vectorRows.map((row) => {
      const targetCarrier = targetCarrierByIdentity.get(
        graphVectorRowIdentityKey({
          graphFunctionId: row.graphFunction.id,
          graphId: row.graph.id,
          graphVectorId: row.vector.id
        })
      );
      if (targetCarrier === undefined) {
        throw new TypeError(
          `${row.graphFunction.name}/${row.vector.name}: missing target-carrier row for traversal bind conservation`
        );
      }
      const refBase =
        `odd-sdlc/${stringForRef(row.graphFunction.name)}` +
        `/${stringForRef(row.vector.name)}`;
      return Object.freeze({
        conservationRef:
          `bind-conservation://odd-sdlc/typescript/${refBase}`,
        graphFunctionRef: row.graphFunction.name,
        graphRef: row.graph.name,
        graphVectorRef: row.vector.name,
        graphFunctionId: row.graphFunction.id,
        graphId: row.graph.id,
        graphVectorId: row.vector.id,
        intentLineageRefs: Object.freeze([
          `intent-lineage://odd-sdlc/typescript/${refBase}/input`,
          `lineage://odd-sdlc/typescript/${refBase}/authority`
        ]),
        targetCarrierBindingRefs: Object.freeze([
          targetCarrier.targetCarrierContractRef
        ]),
        materializationBindingRefs: Object.freeze([
          targetCarrier.materializationPolicyRef
        ]),
        carriedObligationRefs: Object.freeze([
          `obligation://odd-sdlc/typescript/${refBase}/target-contract`
        ]),
        residualPressureRefs: Object.freeze([
          `pressure://odd-sdlc/typescript/${refBase}/open-obligation`
        ]),
        stagedAuthorityRefs:
          stageBindingRefsByVectorId.get(row.vector.id) ?? Object.freeze([]),
        admissionStrengthRefs: Object.freeze([
          GTL_PROGRAM_BIND_ADMISSION_STRENGTH_COMPATIBILITY_REF
        ]),
        downstreamTerminalPressureRefs: Object.freeze([
          `terminal-pressure://odd-sdlc/typescript/${refBase}/terminal`
        ]),
        allowedObligationDeltaFamilies: ODD_SDLC_OBLIGATION_DELTA_FAMILIES,
        evidenceRefs: Object.freeze([
          "workspace://build_tenants/typescript/code/src/gtl_conformance/program.ts",
          "REQ-L-GTL3-CONTRACT-LAW-API-017",
          "REQ-R-ABG3-FN-COMP-023"
        ])
      });
    })
  );
}

function runtimeBindingRows(input: {
  readonly module: Module;
  readonly pluginContracts: readonly EnginePluginContract[];
  readonly computeStageBindings: readonly GtlProgramComputeStageBindingRow[];
}): readonly GtlProgramRuntimeBindingRow[] {
  return Object.freeze([
    Object.freeze({
      bindingRef: "runtime-binding://odd-sdlc/typescript/abg-cli/start",
      runtimeBindingKind: "abg_cli_runtime_binding" as const,
      moduleRef: input.module.name,
      publicStartRef: "bootstrap_release_self_test",
      commandRef:
        "genesis-ts start --workspace . --target graph_function:bootstrap_release_self_test --until converged",
      pluginContractRefs: Object.freeze(
        input.pluginContracts.map((contract) => contract.ref).sort()
      ),
      stageBindingRefs: Object.freeze(
        input.computeStageBindings.map((row) => row.stageBindingRef).sort()
      ),
      consumesPluginsThroughAbg: true as const,
      forbidsProductLocalIteration: true as const,
      evidenceRefs: Object.freeze([
        "workspace://build_tenants/typescript/code/src/install/installer.ts",
        "workspace://build_tenants/typescript/code/src/install/instruction_files.ts"
      ])
    })
  ]);
}

function hookBoundaryRows(vectorRows: readonly MaterializedGraphVectorRow[]) {
  return uniqueRows(
    vectorRows.flatMap((row) =>
      hookRefEntries(row.vector.declarations.entries).map(({ key, hookRef }, index) =>
        Object.freeze({
          hookRef: hookRef.ref,
          hookKey: key,
          hostKind: "graph_vector" as const,
          hostRef: row.vector.id,
          declarationSourceKind: "graph_vector_declaration" as const,
          declarationRef: `${row.vector.id}:declarations:${index}:${key}`,
          precedenceRank: index,
          concernRefs: Object.freeze([key]),
          pluginContractRefs: Object.freeze([]),
          evidenceRefs: Object.freeze([
            "workspace://build_tenants/typescript/code/src/graph/module.ts"
          ])
        })
      )
    ),
    (row) => `${row.hostRef}:${row.hookKey}:${row.hookRef}`
  );
}

function jobBindingRows(module: Module) {
  const graphFunctionNameById = new Map(
    module.graphFunctions.map((graphFunction) => [
      graphFunction.id,
      graphFunction.name
    ])
  );
  return Object.freeze(
    module.jobs.map((job) => {
      const contractTargetRefs = Object.freeze(
        job.contracts
          .map((contract) => graphFunctionNameById.get(contract.targetId) ?? null)
          .filter((targetRef): targetRef is string => targetRef !== null)
      );
      return Object.freeze({
        jobRef: job.name,
        contractTargetRefs,
        roleRefs: Object.freeze(job.roles.map((role) => role.name)),
        policyHookRefs: Object.freeze(
          job.policyHooks.entries.map((entry) => entry.key)
        ),
        publicCallableGraphFunctionRefs: contractTargetRefs,
        evidenceRefs: Object.freeze([
          "workspace://build_tenants/typescript/code/src/graph/module.ts"
        ])
      });
    })
  );
}

function roleBindingRows(module: Module) {
  return Object.freeze(
    module.roles.map((role) => Object.freeze({
      roleRef: role.name,
      capabilityRefs: Object.freeze([
        `capability://odd-sdlc/role/${role.name}`
      ]),
      policyHookRefs: Object.freeze(
        role.policyHooks.entries.map((entry) => entry.key)
      ),
      evidenceRefs: Object.freeze([
        "workspace://build_tenants/typescript/code/src/graph/module.ts"
      ])
    }))
  );
}

function featureCoverageManifest(input: {
  readonly presentFeatureKinds: ReadonlySet<GtlProgramT153FeatureKind>;
  readonly manifestRef: string;
}): GtlProgramFeatureCoverageManifest {
  return Object.freeze({
    kind: "gtl_program_feature_coverage_manifest" as const,
    manifestRef: input.manifestRef,
    t153RequirementRef: "REQ-L-GTL3-CONTRACT-LAW-API" as const,
    rows: Object.freeze(
      GTL_PROGRAM_T153_FEATURE_KINDS.map((featureKind) => {
        const disposition = input.presentFeatureKinds.has(featureKind)
          ? "present"
          : "not_used";
        return Object.freeze({
          featureKind,
          disposition,
          ownerClassification:
            GTL_PROGRAM_T153_FEATURE_OWNER_CLASSIFICATIONS[featureKind],
          requirementRefs: T153_REQUIREMENT_REFS,
          evidenceRefs: disposition === "present"
            ? Object.freeze([
                `${SDLC_GTL_PROGRAM_CONFORMANCE_SUBJECT_REF}/${featureKind}`
              ])
            : Object.freeze([]),
          reasonRefs: disposition === "not_used"
            ? Object.freeze([
                `reason://odd-sdlc/typescript/current/not-used/${featureKind}`
              ])
            : Object.freeze([])
        });
      })
    )
  });
}

function graphFunctionTemplateRefStartsWith(
  graphFunction: GraphFunction,
  prefix: string
): boolean {
  return graphFunction.template.ref.startsWith(prefix);
}

function graphFunctionNameStartsWith(
  graphFunction: GraphFunction,
  prefix: string
): boolean {
  return graphFunction.name.startsWith(prefix);
}

function graphFunctionDeclarationHasKey(
  graphFunction: GraphFunction,
  key: string
): boolean {
  return graphFunction.declarations.entries.some((entry) => entry.key === key);
}

function presentT153FeatureKinds(input: {
  readonly module: Module;
  readonly sameObjectProofs: readonly unknown[];
  readonly operatorDeclarations: readonly unknown[];
  readonly evaluatorDeclarations: readonly unknown[];
  readonly ruleDeclarations: readonly unknown[];
  readonly computeCompositions: readonly unknown[];
  readonly computeStageBindings: readonly unknown[];
  readonly hookBoundaries: readonly unknown[];
  readonly selectionBoundaries: readonly unknown[];
  readonly jobBindings: readonly unknown[];
  readonly roleBindings: readonly unknown[];
  readonly externalToolGates: readonly unknown[];
  readonly publicStartTargets: readonly unknown[];
  readonly runtimeBindings: readonly unknown[];
}): ReadonlySet<GtlProgramT153FeatureKind> {
  const present = new Set<GtlProgramT153FeatureKind>([
    "graph_structure_interface",
    "graph_algebra_edge",
    "target_carrier_contract_law",
    "edge_closure_contract_law",
    "prompt_typed_asset_law",
    "module_publication",
    "active_source_identity"
  ]);
  const graphFunctions = input.module.graphFunctions;
  if (input.operatorDeclarations.length > 0) {
    present.add("operator_declarations");
  }
  if (input.evaluatorDeclarations.length > 0) {
    present.add("evaluator_declarations");
  }
  if (input.ruleDeclarations.length > 0) {
    present.add("rule_declarations");
  }
  if (
    input.computeCompositions.length > 0 &&
    input.computeStageBindings.length > 0
  ) {
    present.add("f_star_compute_composition");
  }
  if (input.publicStartTargets.length > 0 && input.runtimeBindings.length > 0) {
    present.add("public_start_binding");
  }
  if (input.hookBoundaries.length > 0) {
    present.add("hook_boundaries");
  }
  if (input.selectionBoundaries.length > 0) {
    present.add("selection_refinement_synthesis_subwork");
  }
  if (input.jobBindings.length > 0) {
    present.add("job_binding");
  }
  if (input.roleBindings.length > 0) {
    present.add("role_binding");
  }
  if (input.externalToolGates.length > 0) {
    present.add("external_tool_gates");
  }
  if (input.sameObjectProofs.length > 0) {
    present.add("graph_algebra_same_object");
  }
  if (graphFunctions.some((graphFunction) =>
    graphFunctionTemplateRefStartsWith(graphFunction, "compose:")
  )) {
    present.add("graph_algebra_compose");
  }
  if (input.module.graphs.some((graph) =>
    graph.tags.some((tag) => tag.startsWith("substituted:"))
  )) {
    present.add("graph_algebra_substitute");
  }
  if (graphFunctions.some((graphFunction) =>
    graphFunctionDeclarationHasKey(graphFunction, "recursion") ||
    graphFunctionNameStartsWith(graphFunction, "recurse(")
  )) {
    present.add("graph_algebra_recurse");
  }
  if (graphFunctions.some((graphFunction) =>
    graphFunctionNameStartsWith(graphFunction, "fan_out(")
  )) {
    present.add("graph_algebra_fan_out");
  }
  if (graphFunctions.some((graphFunction) =>
    graphFunctionNameStartsWith(graphFunction, "fan_in(")
  )) {
    present.add("graph_algebra_fan_in");
  }
  if (graphFunctions.some((graphFunction) =>
    graphFunctionDeclarationHasKey(graphFunction, "gate") ||
    graphFunctionNameStartsWith(graphFunction, "gate(")
  )) {
    present.add("graph_algebra_gate");
  }
  if (graphFunctions.some((graphFunction) =>
    graphFunctionTemplateRefStartsWith(graphFunction, "promote:") ||
    graphFunctionNameStartsWith(graphFunction, "promote(")
  )) {
    present.add("graph_algebra_promote");
  }
  if (graphFunctions.some((graphFunction) =>
    graphFunctionNameStartsWith(graphFunction, "identity:")
  )) {
    present.add("graph_algebra_identity");
  }
  return present;
}

function requireProductionTargetCarrierRow(
  registry: ReturnType<typeof constructSdlcTargetCarrierRegistry>,
  row: MaterializedGraphVectorRow
) {
  const targetCarrierRow = registry.rowByEdgeRef[row.vector.name] ?? null;
  if (targetCarrierRow === null) {
    throw new TypeError(
      `missing production target-carrier row for ${row.vector.name}`
    );
  }
  if (targetCarrierRow.targetAssetType !== row.vector.target.name) {
    throw new TypeError(`target-carrier target mismatch for ${row.vector.name}`);
  }
  return targetCarrierRow;
}

function requireProductionEdgeClosureContract(
  contractByEdgeRef: ReadonlyMap<string, (typeof SDLC_EDGE_GAIN_CLOSURE_CONTRACTS)[number]>,
  row: MaterializedGraphVectorRow
) {
  const contract = contractByEdgeRef.get(row.vector.name) ?? null;
  if (contract === null) {
    throw new TypeError(
      `missing production edge gain/closure contract for ${row.vector.name}`
    );
  }
  if (contract.targetAssetType !== row.vector.target.name) {
    throw new TypeError(`edge gain/closure target mismatch for ${row.vector.name}`);
  }
  return contract;
}

export function constructCurrentSdlcGtlProgramConformanceInput(
  input: SdlcGtlProgramConformanceInputOptions = {}
): GtlProgramConformanceInput {
  const catalog = constructSdlcGraphFunctionCatalog();
  const module = constructSdlcGtlModule();
  const catalogGraphFunctionRefs = Object.freeze([
    ...new Set([
      ...catalog.libraryFunctions.map((entry) => entry.name),
      ...catalog.functions.map((entry) => entry.backingGraphFunction),
      ...catalog.executives.map((entry) => entry.backingGraphFunction)
    ])
  ].sort());
  const vectorRows = materializedGraphVectorRows(module);
  const graphVectorCount = vectorRows.length;
  const overlayCatalog = constructSdlcTraversalOverlayCatalog({
    module,
    graphCatalog: catalog
  });
  const targetCarrierRegistry = constructSdlcTargetCarrierRegistry({ module });
  if (targetCarrierRegistry.diagnostics.length > 0) {
    throw new TypeError(
      `production target-carrier registry diagnostics: ${targetCarrierRegistry.diagnostics.join(", ")}`
    );
  }
  const productionVectorRefs = new Set(vectorRows.map((row) => row.vector.name));
  if (productionVectorRefs.size !== targetCarrierRegistry.rows.length) {
    throw new TypeError(
      "production target-carrier registry must cover every unique graph vector ref"
    );
  }
  const contractByEdgeRef = new Map(
    SDLC_EDGE_GAIN_CLOSURE_CONTRACTS.map((contract) => [
      contract.edgeRef,
      contract
    ])
  );
  if (productionVectorRefs.size !== contractByEdgeRef.size) {
    throw new TypeError(
      "production edge gain/closure contracts must cover every unique graph vector ref"
    );
  }
  const startTargets = publicSdlcOverlayStartTargets({
    module,
    catalog: overlayCatalog,
    projectConformanceStatus: null
  });
  const targetCarrierContracts = Object.freeze(
    vectorRows.map((row) => {
      const targetCarrierRow =
        requireProductionTargetCarrierRow(targetCarrierRegistry, row);
      return Object.freeze({
        edgeRef: row.vector.name,
        graphVectorRef: row.vector.name,
        graphFunctionId: row.graphFunction.id,
        graphId: row.graph.id,
        graphVectorId: row.vector.id,
        targetAssetType: row.vector.target.name,
        targetCarrierContractRef: targetCarrierRow.targetCarrierContractRef,
        targetCarrierContractDigest: targetCarrierRow.targetCarrierContractDigest,
        targetCarrierTemplateRef: targetCarrierRow.targetCarrierTemplateRef,
        outputSurfaceRef: targetCarrierRow.outputSurfaceRef,
        outputCarrierFamilyRef: targetCarrierRow.outputCarrierFamilyRef,
        outputCarrierKind: targetCarrierRow.outputCarrierKind,
        envelopeContractRef: targetCarrierRow.binding.envelopeContractRef,
        nestedPayloadPath: targetCarrierRow.nestedPayloadPath,
        requiredFieldRefs: targetCarrierRow.requiredFieldRefs,
        optionalFieldRefs: targetCarrierRow.optionalFieldRefs,
        fixedProtocolFieldRefs: targetCarrierRow.fixedProtocolFieldRefs,
        workerFillableFieldRefs: targetCarrierRow.workerFillableFieldRefs,
        literalDomainRefs: targetCarrierRow.literalDomainRefs,
        enumDomainRefs: targetCarrierRow.enumDomainRefs,
        schemaRef: targetCarrierRow.schemaRef,
        admissionRef: targetCarrierRow.admissionRef,
        payloadLedgerBindingRef: targetCarrierRow.payloadLedgerBindingRef,
        edgeAssuranceBindingRef: targetCarrierRow.edgeAssuranceBindingRef,
        handoffProjectionRef: targetCarrierRow.handoffProjectionRef,
        constructionTemplateRef: targetCarrierRow.constructionTemplateRef,
        replayDigestPolicyRef: targetCarrierRow.replayDigestPolicyRef,
        materializationPolicyRef: targetCarrierRow.materializationPolicyRef,
        closurePreconditionRef: targetCarrierRow.closurePreconditionRef
      });
    })
  );
  const edgeClosureContracts = Object.freeze(
    vectorRows.map((row) => {
      const contract = requireProductionEdgeClosureContract(contractByEdgeRef, row);
      return Object.freeze({
        edgeRef: contract.edgeRef,
        graphFunctionId: row.graphFunction.id,
        graphId: row.graph.id,
        graphVectorId: row.vector.id,
        targetAssetType: contract.targetAssetType
      });
    })
  );
  const overlays = Object.freeze(
    overlayCatalog.overlays.map((overlay) => Object.freeze({
      overlayRef: overlay.overlayRef,
      graphFunctionRefs: overlay.graphFunctionRefs,
      graphVectorRefs: overlay.graphVectorRefs,
      publicStartTargets: overlay.publicStartTargets,
      defaultStartTarget: overlay.defaultStartTarget
    }))
  );
  const publicStartTargetRows = Object.freeze(
    startTargets.map((target) => Object.freeze({
      name: target.name,
      graphFunctionRef: target.graphFunctionRef,
      overlayRefs: target.overlayRefs,
      defaultForOverlayRefs: target.defaultForOverlayRefs
    }))
  );
  const promptAssets = promptProjectionRows();
  const pluginContracts = Object.freeze([
    fpDispatchPluginContract(),
    fpEvaluatorPluginContract(),
    designDepthFpEvaluatorRuleContract(),
    reviewGradeEdgeFulfillmentRuleContract(),
    ticketWorkflowFdRuleContract(),
    consequenceProjectionPluginContract()
  ]);
  const sourceIdentitySurfaces = activeSdlcSourceIdentitySurfaces(input);
  const sameObjectProofs = Object.freeze([]);
  const operatorDeclarations = operatorDeclarationRows(vectorRows);
  const evaluatorDeclarations = evaluatorDeclarationRows(vectorRows);
  const ruleDeclarations = ruleDeclarationRows(vectorRows);
  const computeCompositions = computeCompositionRows(vectorRows);
  const computeStageBindings = computeStageBindingRows({
    computeCompositions,
    pluginContracts
  });
  const pluginResultInterfaces =
    pluginResultInterfaceRows(computeStageBindings);
  const traversalBindConservation = traversalBindConservationRows({
    vectorRows,
    targetCarrierContracts,
    computeCompositions,
    computeStageBindings
  });
  const hookBoundaries = hookBoundaryRows(vectorRows);
  const selectionBoundaries = Object.freeze([]);
  const jobBindings = jobBindingRows(module);
  const roleBindings = roleBindingRows(module);
  const externalToolGates = Object.freeze([]);
  const runtimeBindings = runtimeBindingRows({
    module,
    pluginContracts,
    computeStageBindings
  });
  const presentFeatureKinds = presentT153FeatureKinds({
    module,
    sameObjectProofs,
    operatorDeclarations,
    evaluatorDeclarations,
    ruleDeclarations,
    computeCompositions,
    computeStageBindings,
    hookBoundaries,
    selectionBoundaries,
    jobBindings,
    roleBindings,
    externalToolGates,
    publicStartTargets: publicStartTargetRows,
    runtimeBindings
  });

  return Object.freeze({
    subjectRef: input.subjectRef ?? SDLC_GTL_PROGRAM_CONFORMANCE_SUBJECT_REF,
    abiPackageVersion: ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.packageVersion,
    expectedCoverage: Object.freeze({
      catalogGraphFunctionCount: catalogGraphFunctionRefs.length,
      publishedGraphFunctionCount: module.graphFunctions.length,
      graphVectorCount,
      targetCarrierContractCount: targetCarrierContracts.length,
      edgeClosureContractCount: edgeClosureContracts.length,
      overlayCount: overlays.length,
      publicStartTargetCount: publicStartTargetRows.length,
      promptAssetCount: promptAssets.length,
      pluginContractCount: pluginContracts.length,
      sourceIdentitySurfaceCount: sourceIdentitySurfaces.length
    }),
    featureCoverageManifest: featureCoverageManifest({
      presentFeatureKinds,
      manifestRef:
        input.featureCoverageManifestRef ??
        SDLC_GTL_PROGRAM_CONFORMANCE_FEATURE_COVERAGE_REF
    }),
    catalogGraphFunctionRefs,
    modules: Object.freeze([module]),
    targetCarrierContracts,
    edgeClosureContracts,
    overlays,
    publicStartTargets: publicStartTargetRows,
    promptAssets,
    pluginContracts,
    pluginResultInterfaces,
    traversalBindConservation,
    sourceIdentitySurfaces,
    sameObjectProofs,
    operatorDeclarations,
    evaluatorDeclarations,
    ruleDeclarations,
    computeCompositions,
    computeStageBindings,
    hookBoundaries,
    selectionBoundaries,
    jobBindings,
    roleBindings,
    externalToolGates,
    runtimeBindings
  });
}

export function admitCurrentSdlcGtlProgramConformanceInput(
  input: SdlcGtlProgramConformanceInputOptions = {}
): GtlProgramConformanceInputAdmission {
  return admitGtlProgramConformanceInput(
    constructCurrentSdlcGtlProgramConformanceInput(input)
  );
}

export function typecheckSdlcGtlProgramConformanceInput(
  input: unknown
): GtlProgramConformanceReport {
  const admission = admitGtlProgramConformanceInput(input);
  return typecheckGtlProgram(
    admission.issues.length === 0 ? admission.input : input
  );
}

export function typecheckCurrentSdlcGtlProgram(
  input: SdlcGtlProgramConformanceInputOptions = {}
): GtlProgramConformanceReport {
  const admission = admitCurrentSdlcGtlProgramConformanceInput(input);
  return typecheckGtlProgram(
    admission.issues.length === 0
      ? admission.input
      : constructCurrentSdlcGtlProgramConformanceInput(input)
  );
}

export function assertSdlcGtlProgramConformanceReportPassed(
  report: GtlProgramConformanceReport
): GtlProgramConformanceReport {
  if (!report.passed || report.issueCount > 0) {
    throw new TypeError(
      `SDLC GTL program conformance failed:\n${formatGtlProgramConformanceIssues(report.issues)}`
    );
  }
  return report;
}

export function assertCurrentSdlcGtlProgramConformance(
  input: SdlcGtlProgramConformanceInputOptions = {}
): GtlProgramConformanceReport {
  return assertSdlcGtlProgramConformanceReportPassed(
    typecheckCurrentSdlcGtlProgram(input)
  );
}
