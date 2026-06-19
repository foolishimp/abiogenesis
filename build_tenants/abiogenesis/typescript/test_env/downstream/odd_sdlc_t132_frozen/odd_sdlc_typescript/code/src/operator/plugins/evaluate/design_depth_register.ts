// Implements: T-183

import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type {
  SdlcDesignDepthRegisterAdmission,
  SdlcWorkerHandoffManifest
} from "../../carriers.js";
import {
  admitDesignDepthRegisterFromArtifact
} from "../../design_depth_register.js";
import {
  admitSdlcEvaluateContentRegisterArtifactForSelectedIdentity
} from "./content_register.js";
import { uniqueLocaleSorted as uniqueSorted } from "../../../shared/collections.js";
import {
  assertCurrentSdlcGtlProgramConformance
} from "../../../gtl_conformance/program.js";

export const DESIGN_DEPTH_FP_EVALUATOR_RULE_REF =
  "evaluation-rule://odd-sdlc/design-depth-register/fp" as const;

export const DESIGN_DEPTH_FP_EVALUATOR_RULE_OUTCOME_FILE =
  "design_depth_fp_evaluator_rule_outcome.json" as const;

function objectRecord(input: unknown): Record<string, unknown> | null {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return null;
  }
  return Object.fromEntries(Object.entries(input));
}

function parseOpenRecord(input: unknown, label: string): Record<string, unknown> {
  const record = objectRecord(input);
  if (record === null) {
    throw new TypeError(`${label}: expected JSON object`);
  }
  return record;
}

function stringListFromUnknown(value: unknown): readonly string[] {
  return Array.isArray(value)
    ? Object.freeze(
        value.filter((item): item is string => typeof item === "string")
      )
    : Object.freeze([]);
}

function nonEmptyStringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function nullableStringValue(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  return nonEmptyStringValue(value);
}

function decodedRefVariants(input: string): readonly string[] {
  const variants = [input];
  let current = input;
  for (let index = 0; index < 4; index += 1) {
    try {
      const decoded = decodeURIComponent(current);
      if (decoded === current) {
        break;
      }
      variants.push(decoded);
      current = decoded;
    } catch {
      break;
    }
  }
  return Object.freeze([...new Set(variants)]);
}

function refToExistingFilePath(ref: string): string | null {
  if (!ref.startsWith("file://")) {
    return null;
  }
  try {
    const filePath = fileURLToPath(ref);
    return existsSync(filePath) && statSync(filePath).isFile() ? filePath : null;
  } catch {
    return null;
  }
}

function operatorRunArchiveRootsFromRef(input: string): readonly string[] {
  const roots: string[] = [];
  for (const variant of decodedRefVariants(input)) {
    for (const match of variant.matchAll(
      /file:\/\/\/.*?\/operator-runs\/[0-9]{8}T[0-9]{9}Z(?:_pid[0-9]+)?/gu
    )) {
      const url = match[0];
      try {
        roots.push(fileURLToPath(url));
      } catch {
        continue;
      }
    }
  }
  return uniqueSorted(roots);
}

export function designDepthFpEvaluatorRegisterPath(
  manifest: SdlcWorkerHandoffManifest
): string {
  return join(manifest.archiveRoot, "design_depth_fp_evaluator_register.json");
}

function designDepthFpEvaluatorRegisterPathForArchiveRoot(
  archiveRoot: string
): string {
  return join(archiveRoot, "design_depth_fp_evaluator_register.json");
}

function designDepthFpEvaluatorContentRegisterPathForArchiveRoot(
  archiveRoot: string
): string {
  return join(archiveRoot, "design_depth_fp_evaluator_content_register.json");
}

function contentRegisterRefForRegisterPath(registerPath: string): string {
  return pathToFileURL(
    designDepthFpEvaluatorContentRegisterPathForArchiveRoot(dirname(registerPath))
  ).href;
}

function contentRegisterExistsForRegisterPath(registerPath: string): boolean {
  const contentRegisterPath = designDepthFpEvaluatorContentRegisterPathForArchiveRoot(
    dirname(registerPath)
  );
  return existsSync(contentRegisterPath) && statSync(contentRegisterPath).isFile();
}

function runtimeEventsPathForRegisterPath(registerPath: string): string {
  return join(dirname(registerPath), "runtime_events.json");
}

function runtimeEventRecordsForRegisterPath(
  registerPath: string
): readonly Record<string, unknown>[] {
  const runtimeEventsPath = runtimeEventsPathForRegisterPath(registerPath);
  if (!existsSync(runtimeEventsPath) || !statSync(runtimeEventsPath).isFile()) {
    return Object.freeze([]);
  }
  const raw: unknown = JSON.parse(readFileSync(runtimeEventsPath, "utf8"));
  if (Array.isArray(raw)) {
    return Object.freeze(raw.flatMap((event) => {
      const record = objectRecord(event);
      return record === null ? [] : [record];
    }));
  }
  const archive = objectRecord(raw);
  if (archive === null) {
    return Object.freeze([]);
  }
  const events = archive["events"];
  if (!Array.isArray(events)) {
    return Object.freeze([]);
  }
  return Object.freeze(events.flatMap((event) => {
    const record = objectRecord(event);
    return record === null ? [] : [record];
  }));
}

function designDepthPluginResultInterfaceContract(input: {
  readonly compositionRef: string;
  readonly compositionDigest: string;
}): {
  readonly resultInterfaceRef: string;
  readonly resultEnvelopeContractRef: string;
  readonly resultInterfaceContractDigest: string;
} | null {
  const report = assertCurrentSdlcGtlProgramConformance();
  return report.pluginResultInterfaceCatalog.interfaces.find(
    (contract) =>
      contract.compositionRef === input.compositionRef &&
      contract.compositionDigest === input.compositionDigest &&
      contract.stageRole === "evaluate" &&
      contract.computeMeans === "F_P" &&
      contract.outputCarrierRefs.includes("SdlcDesignDepthRegister")
  ) ?? null;
}

function admittedPluginResultEnvelopeEvidenceRefsForRegisterPath(input: {
  readonly registerPath: string;
  readonly compositionRef: string;
  readonly compositionDigest: string;
}): readonly string[] {
  const runtimeEventsPath = runtimeEventsPathForRegisterPath(input.registerPath);
  const runtimeEventsRef = pathToFileURL(runtimeEventsPath).href;
  const contentRegisterRef = contentRegisterRefForRegisterPath(input.registerPath);
  const registerRef = pathToFileURL(input.registerPath).href;
  const events = runtimeEventRecordsForRegisterPath(input.registerPath);
  const expectedInterface = designDepthPluginResultInterfaceContract({
    compositionRef: input.compositionRef,
    compositionDigest: input.compositionDigest
  });
  if (expectedInterface === null) {
    return Object.freeze([]);
  }
  const envelopePayloads = events.filter(
    (event) =>
      event["kind"] === "payload_observed" &&
      event["payloadClass"] === "admitted_plugin_result_envelope" &&
      typeof event["payloadRef"] === "string" &&
      event["authorityRef"] === expectedInterface.resultInterfaceRef &&
      event["contractRef"] === expectedInterface.resultEnvelopeContractRef
  );
  for (const envelope of envelopePayloads) {
    const payloadRef = envelope["payloadRef"];
    if (typeof payloadRef !== "string") {
      continue;
    }
    const validated = events.some(
      (event) =>
        event["kind"] === "payload_validated" &&
        event["payloadRef"] === payloadRef &&
        event["contractRef"] === expectedInterface.resultEnvelopeContractRef &&
        event["contractDigest"] ===
          expectedInterface.resultInterfaceContractDigest
    );
    if (!validated) {
      continue;
    }
    const envelopeEvidenceRefs = uniqueSorted(
      events
        .filter(
          (event) =>
            event["kind"] === "evidence_admitted" &&
            event["payloadRef"] === payloadRef
        )
        .map((event) => event["evidenceRef"])
        .filter((ref): ref is string => typeof ref === "string")
    );
    if (
      !envelopeEvidenceRefs.includes(contentRegisterRef) ||
      !envelopeEvidenceRefs.includes(registerRef)
    ) {
      continue;
    }
    return uniqueSorted([
      runtimeEventsRef,
      payloadRef,
      contentRegisterRef,
      registerRef,
      ...envelopeEvidenceRefs
    ]);
  }
  return Object.freeze([]);
}

function admitContentRegisterForRegisterPath(input: {
  readonly registerPath: string;
  readonly selectedCompositionRef: string;
  readonly selectedCompositionDigest: string;
  readonly selectedCompositionSelectionRef: string;
  readonly selectedRegimeBindingRef: string | null;
}): readonly string[] {
  const contentRegisterPath = designDepthFpEvaluatorContentRegisterPathForArchiveRoot(
    dirname(input.registerPath)
  );
  const admission = admitSdlcEvaluateContentRegisterArtifactForSelectedIdentity({
    registerPath: contentRegisterPath,
    selectedIdentity: Object.freeze({
      selectedCompositionRef: input.selectedCompositionRef,
      selectedCompositionDigest: input.selectedCompositionDigest,
      selectedCompositionSelectionRef: input.selectedCompositionSelectionRef,
      selectedRegimeBindingRef: input.selectedRegimeBindingRef
    }),
    ruleRef: DESIGN_DEPTH_FP_EVALUATOR_RULE_REF,
    authorityFunction: "synthesize_model",
    computeMeans: "F_P"
  });
  return admission.status === "admitted"
    ? admission.evidenceRefs
    : Object.freeze([]);
}

export function shouldDeferImplementationDesignRegisterToFpEvaluator(
  manifest: SdlcWorkerHandoffManifest
): boolean {
  return (
    manifest.targetAssetType === "implementation_design_surface" &&
    !existsSync(designDepthFpEvaluatorRegisterPath(manifest))
  );
}

function implementationDesignSourceAssetRefs(
  manifest: SdlcWorkerHandoffManifest
): readonly string[] {
  return uniqueSorted(
    manifest.traversalObligationContext.obligations
      .filter(
        (obligation) =>
          obligation.obligationKind === "source_asset" &&
          obligation.obligationId === "source_asset:implementation_design_surface"
      )
      .flatMap((obligation) => [
        ...obligation.evidenceRefs,
        ...obligation.payload.sourceRefs
      ])
  );
}

function predecessorDesignRegisterArchiveRoots(
  manifest: SdlcWorkerHandoffManifest
): readonly string[] {
  return uniqueSorted(
    [
      ...manifest.traversalObligationContext.priorEdgeRefs,
      ...implementationDesignSourceAssetRefs(manifest)
    ].flatMap((ref) => operatorRunArchiveRootsFromRef(ref))
  );
}

function predecessorDesignRegisterArchiveMatchesCurrent(input: {
  readonly archiveRoot: string;
  readonly manifest: SdlcWorkerHandoffManifest;
}): boolean {
  const manifestPath = join(input.archiveRoot, "handoff_manifest.json");
  if (!existsSync(manifestPath) || !statSync(manifestPath).isFile()) {
    return false;
  }
  try {
    const record = parseOpenRecord(
      JSON.parse(readFileSync(manifestPath, "utf8")),
      "DesignDepthFpEvaluatorPredecessorHandoffManifest"
    );
    const productMaterialization = parseOpenRecord(
      record["productMaterialization"],
      "DesignDepthFpEvaluatorPredecessorHandoffManifest.productMaterialization"
    );
    return (
      record["targetAssetType"] === "implementation_design_surface" &&
      typeof record["workspaceRoot"] === "string" &&
      resolve(record["workspaceRoot"]) === resolve(input.manifest.workspaceRoot) &&
      typeof productMaterialization["tenantRoot"] === "string" &&
      resolve(productMaterialization["tenantRoot"]) ===
        resolve(input.manifest.productMaterialization.tenantRoot)
    );
  } catch {
    return false;
  }
}

export function predecessorDesignDepthFpEvaluatorRegisterPaths(
  manifest: SdlcWorkerHandoffManifest
): readonly string[] {
  if (!manifest.inputAssetTypes.includes("implementation_design_surface")) {
    return Object.freeze([]);
  }
  return uniqueSorted(
    predecessorDesignRegisterArchiveRoots(manifest)
      .filter((archiveRoot) =>
        predecessorDesignRegisterArchiveMatchesCurrent({ archiveRoot, manifest })
      )
      .map(designDepthFpEvaluatorRegisterPathForArchiveRoot)
      .filter((filePath) => existsSync(filePath) && statSync(filePath).isFile())
  );
}

function selectedFpEvaluateResultEvidenceRefs(input: {
  readonly registerPath: string;
}): readonly string[] {
  const registerRef = pathToFileURL(input.registerPath).href;
  const contentRegisterRef = contentRegisterRefForRegisterPath(input.registerPath);
  const ruleOutcomeRef = pathToFileURL(
    join(dirname(input.registerPath), DESIGN_DEPTH_FP_EVALUATOR_RULE_OUTCOME_FILE)
  ).href;
  if (!contentRegisterExistsForRegisterPath(input.registerPath)) {
    return Object.freeze([]);
  }
  try {
    const ruleOutcomeRecord = parseOpenRecord(
      JSON.parse(
        readFileSync(
          join(
            dirname(input.registerPath),
            DESIGN_DEPTH_FP_EVALUATOR_RULE_OUTCOME_FILE
          ),
          "utf8"
        )
      ),
      "DesignDepthFpEvaluatorRuleOutcome"
    );
    const compositionRef = nonEmptyStringValue(
      ruleOutcomeRecord["selectedCompositionRef"]
    );
    const compositionDigest = nonEmptyStringValue(
      ruleOutcomeRecord["selectedCompositionDigest"]
    );
    const compositionSelectionRef = nonEmptyStringValue(
      ruleOutcomeRecord["selectedCompositionSelectionRef"]
    );
    const selectedRegimeBindingRef = nullableStringValue(
      ruleOutcomeRecord["selectedRegimeBindingRef"]
    );
    if (
      compositionRef === null ||
      compositionDigest === null ||
      compositionSelectionRef === null
    ) {
      return Object.freeze([]);
    }
    const evaluationRuleOutcomeEvidenceRefs =
      persistedEvaluationRuleOutcomeEvidenceRefs({
        registerPath: input.registerPath
      });
    if (evaluationRuleOutcomeEvidenceRefs.length === 0) {
      return Object.freeze([]);
    }
    const contentRegisterEvidenceRefs = evaluationRuleOutcomeEvidenceRefs.filter(
      (ref) => ref === contentRegisterRef || ref === registerRef
    );
    const admittedContentRegisterEvidenceRefs = admitContentRegisterForRegisterPath({
      registerPath: input.registerPath,
      selectedCompositionRef: compositionRef,
      selectedCompositionDigest: compositionDigest,
      selectedCompositionSelectionRef: compositionSelectionRef,
      selectedRegimeBindingRef
    });
    if (admittedContentRegisterEvidenceRefs.length === 0) {
      return Object.freeze([]);
    }
    const admittedEnvelopeEvidenceRefs =
      admittedPluginResultEnvelopeEvidenceRefsForRegisterPath({
        registerPath: input.registerPath,
        compositionRef,
        compositionDigest
      });
    return uniqueSorted([
      contentRegisterRef,
      registerRef,
      ruleOutcomeRef,
      ...admittedEnvelopeEvidenceRefs,
      ...evaluationRuleOutcomeEvidenceRefs,
      ...admittedContentRegisterEvidenceRefs,
      ...contentRegisterEvidenceRefs
    ]);
  } catch {
    return Object.freeze([]);
  }
}

function evaluationRuleOutcomeEvidenceRefsForFile(input: {
  readonly registerPath: string;
  readonly filePath: string;
}): readonly string[] {
  const registerRef = pathToFileURL(input.registerPath).href;
  const contentRegisterRef = contentRegisterRefForRegisterPath(input.registerPath);
  if (!contentRegisterExistsForRegisterPath(input.registerPath)) {
    return Object.freeze([]);
  }
  try {
    const record = parseOpenRecord(
      JSON.parse(readFileSync(input.filePath, "utf8")),
      "DesignDepthFpEvaluatorRuleOutcome"
    );
    if (
      record["kind"] !== "evaluation_rule_outcome" ||
      record["status"] !== "accepted" ||
      record["ruleRef"] !== DESIGN_DEPTH_FP_EVALUATOR_RULE_REF ||
      record["ruleRole"] !== "semantic_judgment" ||
      record["computeMeans"] !== "F_P"
    ) {
      return Object.freeze([]);
    }
    const producedRegisterRefs = stringListFromUnknown(record["producedRegisterRefs"]);
    if (
      !producedRegisterRefs.includes(registerRef) ||
      !producedRegisterRefs.includes(contentRegisterRef)
    ) {
      return Object.freeze([]);
    }
    const selectedCompositionRef = nonEmptyStringValue(
      record["selectedCompositionRef"]
    );
    const selectedCompositionDigest = nonEmptyStringValue(
      record["selectedCompositionDigest"]
    );
    const selectedCompositionSelectionRef = nonEmptyStringValue(
      record["selectedCompositionSelectionRef"]
    );
    const selectedRegimeBindingRef = nullableStringValue(
      record["selectedRegimeBindingRef"]
    );
    if (
      selectedCompositionRef === null ||
      selectedCompositionDigest === null ||
      selectedCompositionSelectionRef === null
    ) {
      return Object.freeze([]);
    }
    const contentRegisterEvidenceRefs = admitContentRegisterForRegisterPath({
      registerPath: input.registerPath,
      selectedCompositionRef,
      selectedCompositionDigest,
      selectedCompositionSelectionRef,
      selectedRegimeBindingRef
    });
    if (contentRegisterEvidenceRefs.length === 0) {
      return Object.freeze([]);
    }
    return uniqueSorted([
      pathToFileURL(input.filePath).href,
      contentRegisterRef,
      registerRef,
      ...contentRegisterEvidenceRefs,
      ...producedRegisterRefs,
      ...stringListFromUnknown(record["evidenceRefs"]),
      ...stringListFromUnknown(record["findingRefs"])
    ]);
  } catch {
    return Object.freeze([]);
  }
}

function persistedEvaluationRuleOutcomeEvidenceRefs(input: {
  readonly registerPath: string;
}): readonly string[] {
  const filePath = join(
    dirname(input.registerPath),
    DESIGN_DEPTH_FP_EVALUATOR_RULE_OUTCOME_FILE
  );
  return existsSync(filePath) && statSync(filePath).isFile()
    ? evaluationRuleOutcomeEvidenceRefsForFile({
        registerPath: input.registerPath,
        filePath
      })
    : Object.freeze([]);
}

function runtimeEvaluationRuleOutcomeEvidenceRefs(input: {
  readonly registerPath: string;
  readonly explicitEvidenceRefs?: readonly string[] | undefined;
}): readonly string[] {
  for (const ref of uniqueSorted(input.explicitEvidenceRefs ?? [])) {
    const filePath = refToExistingFilePath(ref);
    if (
      filePath === null ||
      filePath !==
        join(dirname(input.registerPath), DESIGN_DEPTH_FP_EVALUATOR_RULE_OUTCOME_FILE)
    ) {
      continue;
    }
    const evidenceRefs = evaluationRuleOutcomeEvidenceRefsForFile({
      registerPath: input.registerPath,
      filePath
    });
    if (evidenceRefs.length > 0) {
      return evidenceRefs;
    }
  }
  return Object.freeze([]);
}

export function admittedDesignDepthFpEvaluatorRegisterEvidenceRefs(
  manifest: SdlcWorkerHandoffManifest,
  fpEvaluatorAdmissionEvidenceRefs: readonly string[] = Object.freeze([])
): readonly string[] {
  const admission =
    fpEvaluatorAdmissionEvidenceRefs.length > 0
      ? admitImplementationDesignRegisterForRuntimeEvaluation({
          manifest,
          fpEvaluatorAdmissionEvidenceRefs
        })
      : admitImplementationDesignRegisterForManifest({
          manifest
        });
  return admission.status === "admitted"
    ? admission.evidenceRefs
    : Object.freeze([]);
}

function implementationDesignRegisterPathsForManifest(
  manifest: SdlcWorkerHandoffManifest
): readonly string[] {
  const currentEvaluatorRegisterPath = designDepthFpEvaluatorRegisterPath(manifest);
  return manifest.targetAssetType === "implementation_design_surface" &&
    existsSync(currentEvaluatorRegisterPath)
    ? Object.freeze([currentEvaluatorRegisterPath])
    : predecessorDesignDepthFpEvaluatorRegisterPaths(manifest);
}

function admitSingleImplementationDesignRegisterPath(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly evaluatorRegisterPath: string;
  readonly fpEvaluatorAdmissionEvidenceRefs?: readonly string[] | undefined;
}): SdlcDesignDepthRegisterAdmission {
  const admission = admitDesignDepthRegisterFromArtifact({
    targetAssetType: "implementation_design_surface",
    outputFile: input.evaluatorRegisterPath,
    archiveRoot: input.manifest.archiveRoot,
    requireSourceFileTargets: true
  });
  return admission.status === "admitted"
    ? Object.freeze({
        ...admission,
        evidenceRefs: uniqueSorted([
          ...admission.evidenceRefs,
          ...(input.fpEvaluatorAdmissionEvidenceRefs ?? [])
        ])
      })
    : admission;
}

export function admitDesignDepthFpEvaluatorRegisterArtifact(input: {
  readonly registerPath: string;
  readonly archiveRoot?: string | null | undefined;
}): SdlcDesignDepthRegisterAdmission {
  const admission = admitDesignDepthRegisterFromArtifact({
    targetAssetType: "implementation_design_surface",
    outputFile: input.registerPath,
    archiveRoot: input.archiveRoot ?? null,
    requireSourceFileTargets: true
  });
  if (admission.status !== "admitted") {
    return admission;
  }
  const fpEvaluatorAdmissionEvidenceRefs = selectedFpEvaluateResultEvidenceRefs({
    registerPath: input.registerPath
  });
  if (fpEvaluatorAdmissionEvidenceRefs.length === 0) {
    return Object.freeze({
      kind: "sdlc_design_depth_register_admission" as const,
      status: "rejected" as const,
      targetAssetType: "implementation_design_surface",
      register: null,
      blockingReasons: Object.freeze([
        "design_depth_fp_evaluator_register_unadmitted"
      ]),
      evidenceRefs: Object.freeze([pathToFileURL(input.registerPath).href])
    });
  }
  return Object.freeze({
    ...admission,
    evidenceRefs: uniqueSorted([
      ...admission.evidenceRefs,
      ...fpEvaluatorAdmissionEvidenceRefs
    ])
  });
}

export function admitImplementationDesignRegisterCandidateForManifest(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
}): SdlcDesignDepthRegisterAdmission {
  const currentEvaluatorRegisterPath = designDepthFpEvaluatorRegisterPath(
    input.manifest
  );
  return admitSingleImplementationDesignRegisterPath({
    manifest: input.manifest,
    evaluatorRegisterPath: currentEvaluatorRegisterPath
  });
}

export function admitImplementationDesignRegisterForRuntimeEvaluation(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly fpEvaluatorAdmissionEvidenceRefs?: readonly string[] | undefined;
}): SdlcDesignDepthRegisterAdmission {
  const currentEvaluatorRegisterPath = designDepthFpEvaluatorRegisterPath(
    input.manifest
  );
  const evaluatorRegisterPaths = implementationDesignRegisterPathsForManifest(
    input.manifest
  );
  if (evaluatorRegisterPaths.length > 1) {
    return Object.freeze({
      kind: "sdlc_design_depth_register_admission" as const,
      status: "rejected" as const,
      targetAssetType: "implementation_design_surface",
      register: null,
      blockingReasons: Object.freeze([
        "design_depth_fp_evaluator_register_ambiguous"
      ]),
      evidenceRefs: Object.freeze(
        evaluatorRegisterPaths.map((filePath) => pathToFileURL(filePath).href)
      )
    });
  }
  const evaluatorRegisterPath = evaluatorRegisterPaths[0] ?? null;
  if (evaluatorRegisterPath !== null) {
    const structuralAdmission = admitSingleImplementationDesignRegisterPath({
      manifest: input.manifest,
      evaluatorRegisterPath
    });
    if (structuralAdmission.status !== "admitted") {
      return structuralAdmission;
    }
    const fpEvaluatorAdmissionEvidenceRefs =
      runtimeEvaluationRuleOutcomeEvidenceRefs({
        registerPath: evaluatorRegisterPath,
        explicitEvidenceRefs: input.fpEvaluatorAdmissionEvidenceRefs
      });
    if (fpEvaluatorAdmissionEvidenceRefs.length === 0) {
      return Object.freeze({
        kind: "sdlc_design_depth_register_admission" as const,
        status: "rejected" as const,
        targetAssetType: "implementation_design_surface",
        register: null,
        blockingReasons: Object.freeze([
          "design_depth_fp_evaluator_register_unadmitted"
        ]),
        evidenceRefs: Object.freeze([pathToFileURL(evaluatorRegisterPath).href])
      });
    }
    return Object.freeze({
      ...structuralAdmission,
      evidenceRefs: uniqueSorted([
        ...structuralAdmission.evidenceRefs,
        ...fpEvaluatorAdmissionEvidenceRefs
      ])
    });
  }
  return Object.freeze({
    kind: "sdlc_design_depth_register_admission" as const,
    status: "rejected" as const,
    targetAssetType: "implementation_design_surface",
    register: null,
    blockingReasons: Object.freeze([
      "design_depth_fp_evaluator_register_missing"
    ]),
    evidenceRefs: Object.freeze([
      pathToFileURL(currentEvaluatorRegisterPath).href
    ])
  });
}

export function admitImplementationDesignRegisterForManifest(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
}): SdlcDesignDepthRegisterAdmission {
  const currentEvaluatorRegisterPath = designDepthFpEvaluatorRegisterPath(
    input.manifest
  );
  const evaluatorRegisterPaths = implementationDesignRegisterPathsForManifest(
    input.manifest
  );
  if (evaluatorRegisterPaths.length > 1) {
    return Object.freeze({
      kind: "sdlc_design_depth_register_admission" as const,
      status: "rejected" as const,
      targetAssetType: "implementation_design_surface",
      register: null,
      blockingReasons: Object.freeze([
        "design_depth_fp_evaluator_register_ambiguous"
      ]),
      evidenceRefs: Object.freeze(
        evaluatorRegisterPaths.map((filePath) => pathToFileURL(filePath).href)
      )
    });
  }
  const evaluatorRegisterPath = evaluatorRegisterPaths[0] ?? null;
  if (evaluatorRegisterPath !== null) {
    const structuralAdmission = admitSingleImplementationDesignRegisterPath({
      manifest: input.manifest,
      evaluatorRegisterPath
    });
    if (structuralAdmission.status !== "admitted") {
      return structuralAdmission;
    }
    const fpEvaluatorAdmissionEvidenceRefs = selectedFpEvaluateResultEvidenceRefs({
      registerPath: evaluatorRegisterPath
    });
    if (fpEvaluatorAdmissionEvidenceRefs.length === 0) {
      return Object.freeze({
        kind: "sdlc_design_depth_register_admission" as const,
        status: "rejected" as const,
        targetAssetType: "implementation_design_surface",
        register: null,
        blockingReasons: Object.freeze([
          "design_depth_fp_evaluator_register_unadmitted"
        ]),
        evidenceRefs: Object.freeze([pathToFileURL(evaluatorRegisterPath).href])
      });
    }
    return Object.freeze({
      ...structuralAdmission,
      evidenceRefs: uniqueSorted([
        ...structuralAdmission.evidenceRefs,
        ...fpEvaluatorAdmissionEvidenceRefs
      ])
    });
  }
  return Object.freeze({
    kind: "sdlc_design_depth_register_admission" as const,
    status: "rejected" as const,
    targetAssetType: "implementation_design_surface",
    register: null,
    blockingReasons: Object.freeze([
      "design_depth_fp_evaluator_register_missing"
    ]),
    evidenceRefs: Object.freeze([
      pathToFileURL(currentEvaluatorRegisterPath).href
    ])
  });
}
