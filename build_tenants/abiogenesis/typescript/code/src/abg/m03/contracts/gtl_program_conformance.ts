// Implements: REQ-R-ABG3-INTERPRET
// Implements: REQ-R-ABG3-PAYLOAD
// Supports: REQ-L-GTL3-ASSET-SURFACE

import type {
  AssetSurface,
  Graph,
  GraphFunction,
  GraphVector,
  Node
} from "../../../gtl/m01/contracts/carriers.js";
import {
  interfaceContract,
  nodeContractKey,
  materializeGraphFunction
} from "../../../gtl/m01/contracts/carriers.js";
import {
  admitAssetSurface
} from "../../../gtl/m01/admission/carriers.js";
import type {
  Module
} from "../../../gtl/m02/contracts/carriers.js";
import type {
  EnginePluginContract
} from "./plugins.js";
import {
  admitEnginePluginContract
} from "./plugins.js";
import {
  stableJson,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";

export type GtlProgramConformanceSurfaceKind =
  | "graph_function"
  | "graph"
  | "module"
  | "graph_vector"
  | "program_inventory"
  | "target_carrier_contract"
  | "edge_closure_contract"
  | "overlay"
  | "public_start"
  | "prompt_asset"
  | "plugin_contract"
  | "source_identity";

export interface GtlProgramConformanceIssue {
  readonly kind: "gtl_program_conformance_issue";
  readonly severity: "error";
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly surfaceRef: string;
  readonly ruleRef: string;
  readonly message: string;
  readonly evidenceRefs: readonly string[];
}

export interface GtlProgramTargetCarrierRow {
  readonly edgeRef: string;
  readonly graphVectorRef: string;
  readonly graphFunctionId: string;
  readonly graphId: string;
  readonly graphVectorId: string;
  readonly targetAssetType: string;
  readonly targetCarrierContractRef: string;
}

export interface GtlProgramEdgeClosureRow {
  readonly edgeRef: string;
  readonly graphFunctionId: string;
  readonly graphId: string;
  readonly graphVectorId: string;
  readonly targetAssetType: string;
}

export interface GtlProgramOverlayRow {
  readonly overlayRef: string;
  readonly graphFunctionRefs: readonly string[];
  readonly graphVectorRefs: readonly string[];
  readonly publicStartTargets: readonly string[];
  readonly defaultStartTarget: string;
}

export interface GtlProgramPublicStartRow {
  readonly name: string;
  readonly graphFunctionRef: string;
  readonly overlayRefs: readonly string[];
  readonly defaultForOverlayRefs: readonly string[];
}

export interface GtlProgramPromptAssetRow {
  readonly surfaceRef: string;
  readonly assetSurface: AssetSurface;
  readonly gtlNode?: Node | undefined;
  readonly renderedViewDigest?: string | null | undefined;
  readonly currentAbgFoldRefs?: readonly string[] | undefined;
  readonly evidenceRefs?: readonly string[] | undefined;
}

export interface GtlProgramSourceIdentityRow {
  readonly surfaceRef: string;
  readonly text: string;
  readonly evidenceRefs?: readonly string[] | undefined;
}

export interface GtlProgramExpectedCoverage {
  readonly catalogGraphFunctionCount: number;
  readonly publishedGraphFunctionCount: number;
  readonly graphVectorCount: number;
  readonly targetCarrierContractCount: number;
  readonly edgeClosureContractCount: number;
  readonly overlayCount: number;
  readonly publicStartTargetCount: number;
  readonly promptAssetCount: number;
  readonly pluginContractCount: number;
  readonly sourceIdentitySurfaceCount: number;
}

export interface GtlProgramConformanceInput {
  readonly subjectRef: string;
  readonly abiPackageVersion: string;
  readonly expectedCoverage: GtlProgramExpectedCoverage;
  readonly catalogGraphFunctionRefs?: readonly string[] | undefined;
  readonly graphFunctions?: readonly GraphFunction[] | undefined;
  readonly modules?: readonly Module[] | undefined;
  readonly targetCarrierContracts?:
    | readonly GtlProgramTargetCarrierRow[]
    | undefined;
  readonly edgeClosureContracts?:
    | readonly GtlProgramEdgeClosureRow[]
    | undefined;
  readonly overlays?: readonly GtlProgramOverlayRow[] | undefined;
  readonly publicStartTargets?: readonly GtlProgramPublicStartRow[] | undefined;
  readonly promptAssets?: readonly GtlProgramPromptAssetRow[] | undefined;
  readonly pluginContracts?: readonly unknown[] | undefined;
  readonly sourceIdentitySurfaces?:
    | readonly GtlProgramSourceIdentityRow[]
    | undefined;
}

export interface GtlProgramConformanceCoverage {
  readonly catalogGraphFunctionCount: number;
  readonly publishedGraphFunctionCount: number;
  readonly graphVectorCount: number;
  readonly targetCarrierContractCount: number;
  readonly edgeClosureContractCount: number;
  readonly overlayCount: number;
  readonly publicStartTargetCount: number;
  readonly promptAssetCount: number;
  readonly pluginContractCount: number;
  readonly sourceIdentitySurfaceCount: number;
}

export interface GtlProgramInventoryDigests {
  readonly catalogGraphFunctionRefs: string;
  readonly graphFunctions: string;
  readonly modules: string;
  readonly materializedVectors: string;
  readonly targetCarrierContracts: string;
  readonly edgeClosureContracts: string;
  readonly overlays: string;
  readonly publicStartTargets: string;
  readonly promptAssets: string;
  readonly pluginContracts: string;
  readonly sourceIdentitySurfaces: string;
}

export interface GtlProgramConformanceReport {
  readonly kind: "gtl_program_conformance_report";
  readonly reportRef: string;
  readonly subjectRef: string;
  readonly abiPackageVersion: string;
  readonly inventoryDigest: string;
  readonly inventoryDigests: GtlProgramInventoryDigests;
  readonly passed: boolean;
  readonly issueCount: number;
  readonly issues: readonly GtlProgramConformanceIssue[];
  readonly coverage: GtlProgramConformanceCoverage;
}

export interface GtlProgramConformanceInputAdmission {
  readonly kind: "gtl_program_conformance_input_admission";
  readonly input: GtlProgramConformanceInput;
  readonly issues: readonly GtlProgramConformanceIssue[];
}

interface GraphVectorProjection {
  readonly graphFunctionId: string;
  readonly graphFunctionRef: string;
  readonly graphId: string;
  readonly graphRef: string;
  readonly graphVectorId: string;
  readonly vectorRef: string;
  readonly sourceAssetTypes: readonly string[];
  readonly sourceNodeContracts: readonly string[];
  readonly targetAssetType: string;
  readonly targetNodeContract: string;
}

function freezeStrings(values: readonly string[] | undefined): readonly string[] {
  return Object.freeze([...(values ?? [])]);
}

function issue(input: {
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly surfaceRef: string;
  readonly ruleRef: string;
  readonly message: string;
  readonly evidenceRefs?: readonly string[] | undefined;
}): GtlProgramConformanceIssue {
  return Object.freeze({
    kind: "gtl_program_conformance_issue",
    severity: "error",
    surfaceKind: input.surfaceKind,
    surfaceRef: input.surfaceRef,
    ruleRef: input.ruleRef,
    message: input.message,
    evidenceRefs: freezeStrings(input.evidenceRefs)
  });
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "validation failed";
}

function uniqueSorted(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)].sort());
}

function isRecord(input: unknown): input is Readonly<Record<string, unknown>> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function unknownArray(input: unknown): readonly unknown[] | null {
  if (!Array.isArray(input)) {
    return null;
  }
  const values: unknown[] = [];
  for (const value of input) {
    values.push(value);
  }
  return Object.freeze(values);
}

function optionalUnknownArray(
  record: Readonly<Record<string, unknown>>,
  key: string
): readonly unknown[] | null | undefined {
  if (!Object.hasOwn(record, key)) {
    return undefined;
  }
  return unknownArray(record[key]);
}

function stringArrayFromUnknown(input: unknown): readonly string[] | null {
  if (!Array.isArray(input)) {
    return null;
  }
  const values: string[] = [];
  for (const value of input) {
    if (typeof value !== "string") {
      return null;
    }
    values.push(value);
  }
  return Object.freeze(values);
}

function optionalStringArrayField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): readonly string[] {
  if (!Object.hasOwn(input.record, input.key)) {
    return Object.freeze([]);
  }
  const values = stringArrayFromUnknown(input.record[input.key]);
  if (values === null) {
    input.issues.push(
      issue({
        surfaceKind: input.surfaceKind,
        surfaceRef: input.subjectRef,
        ruleRef: "abg://gtl-program/input/string-array",
        message: `${input.label}.${input.key} must be an array of strings`
      })
    );
    return Object.freeze([]);
  }
  return values;
}

function requiredStringField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): string {
  const value = input.record[input.key];
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/input/string-field",
      message: `${input.label}.${input.key} must be a non-empty string`
    })
  );
  return "";
}

function checkOptionalArrayField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly subjectRef: string;
  readonly issues: GtlProgramConformanceIssue[];
}): readonly unknown[] {
  const value = optionalUnknownArray(input.record, input.key);
  if (value === undefined) {
    return Object.freeze([]);
  }
  if (value === null) {
    input.issues.push(
      issue({
        surfaceKind: "program_inventory",
        surfaceRef: input.subjectRef,
        ruleRef: "abg://gtl-program/input/array-field",
        message: `${input.key} must be an array when supplied`
      })
    );
    return Object.freeze([]);
  }
  return value;
}

function isGraphFunctionLike(input: unknown): input is GraphFunction {
  return (
    isRecord(input) &&
    typeof input["name"] === "string" &&
    Array.isArray(input["inputs"]) &&
    Array.isArray(input["outputs"]) &&
    isRecord(input["environment"]) &&
    isRecord(input["template"])
  );
}

function plausibleGraphFunction(
  input: unknown,
  subjectRef: string,
  issues: GtlProgramConformanceIssue[],
  label: string
): GraphFunction | null {
  if (!isGraphFunctionLike(input)) {
    issues.push(
      issue({
        surfaceKind: "graph_function",
        surfaceRef: subjectRef,
        ruleRef: "abg://gtl-program/input/graph-function",
        message: `${label} must be a GraphFunction-like object with a name`
      })
    );
    return null;
  }
  return input;
}

function isModuleLike(input: unknown): input is Module {
  return (
    isRecord(input) &&
    typeof input["name"] === "string" &&
    Array.isArray(input["graphFunctions"])
  );
}

function plausibleModule(
  input: unknown,
  subjectRef: string,
  issues: GtlProgramConformanceIssue[],
  label: string
): Module | null {
  if (!isModuleLike(input)) {
    issues.push(
      issue({
        surfaceKind: "module",
        surfaceRef: subjectRef,
        ruleRef: "abg://gtl-program/input/module",
        message: `${label} must be a Module-like object with graphFunctions`
      })
    );
    return null;
  }
  return input;
}

function isAssetSurfaceLike(input: unknown): input is AssetSurface {
  return isRecord(input) && typeof input["kind"] === "string";
}

function isNodeLike(input: unknown): input is Node {
  return (
    isRecord(input) &&
    typeof input["name"] === "string" &&
    isRecord(input["schema"]) &&
    Array.isArray(input["markov"])
  );
}

function admitExpectedCoverage(
  input: unknown,
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): GtlProgramExpectedCoverage {
  const admitted: Record<CoverageKey, number> = {
    catalogGraphFunctionCount: 0,
    publishedGraphFunctionCount: 0,
    graphVectorCount: 0,
    targetCarrierContractCount: 0,
    edgeClosureContractCount: 0,
    overlayCount: 0,
    publicStartTargetCount: 0,
    promptAssetCount: 0,
    pluginContractCount: 0,
    sourceIdentitySurfaceCount: 0
  };
  if (!isRecord(input)) {
    issues.push(
      issue({
        surfaceKind: "program_inventory",
        surfaceRef: subjectRef,
        ruleRef: "abg://gtl-program/coverage/expected-coverage-required",
        message: "GTL program typecheck requires expectedCoverage with every coverage key"
      })
    );
    return Object.freeze(admitted);
  }
  for (const key of COVERAGE_KEYS) {
    if (!Object.hasOwn(input, key)) {
      issues.push(
        issue({
          surfaceKind: "program_inventory",
          surfaceRef: subjectRef,
          ruleRef: "abg://gtl-program/coverage/expected-count-required",
          message: `expectedCoverage.${key} is required`
        })
      );
      continue;
    }
    const value = input[key];
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
      issues.push(
        issue({
          surfaceKind: "program_inventory",
          surfaceRef: subjectRef,
          ruleRef: "abg://gtl-program/coverage/expected-count-admitted",
          message: `expectedCoverage.${key} must be a non-negative integer`
        })
      );
      continue;
    }
    admitted[key] = value;
  }
  return Object.freeze(admitted);
}

function admitTargetCarrierRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramTargetCarrierRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `targetCarrierContracts[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "target_carrier_contract",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/target-carrier-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          edgeRef: requiredStringField({
            record: row,
            key: "edgeRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          graphVectorRef: requiredStringField({
            record: row,
            key: "graphVectorRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          graphFunctionId: requiredStringField({
            record: row,
            key: "graphFunctionId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          graphId: requiredStringField({
            record: row,
            key: "graphId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          graphVectorId: requiredStringField({
            record: row,
            key: "graphVectorId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          targetAssetType: requiredStringField({
            record: row,
            key: "targetAssetType",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          targetCarrierContractRef: requiredStringField({
            record: row,
            key: "targetCarrierContractRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          })
        })
      ];
    })
  );
}

function admitEdgeClosureRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramEdgeClosureRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `edgeClosureContracts[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "edge_closure_contract",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/edge-closure-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          edgeRef: requiredStringField({
            record: row,
            key: "edgeRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "edge_closure_contract",
            issues
          }),
          graphFunctionId: requiredStringField({
            record: row,
            key: "graphFunctionId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "edge_closure_contract",
            issues
          }),
          graphId: requiredStringField({
            record: row,
            key: "graphId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "edge_closure_contract",
            issues
          }),
          graphVectorId: requiredStringField({
            record: row,
            key: "graphVectorId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "edge_closure_contract",
            issues
          }),
          targetAssetType: requiredStringField({
            record: row,
            key: "targetAssetType",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "edge_closure_contract",
            issues
          })
        })
      ];
    })
  );
}

function admitOverlayRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramOverlayRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `overlays[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "overlay",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/overlay-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          overlayRef: requiredStringField({
            record: row,
            key: "overlayRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "overlay",
            issues
          }),
          graphFunctionRefs: optionalStringArrayField({
            record: row,
            key: "graphFunctionRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "overlay",
            issues
          }),
          graphVectorRefs: optionalStringArrayField({
            record: row,
            key: "graphVectorRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "overlay",
            issues
          }),
          publicStartTargets: optionalStringArrayField({
            record: row,
            key: "publicStartTargets",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "overlay",
            issues
          }),
          defaultStartTarget: requiredStringField({
            record: row,
            key: "defaultStartTarget",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "overlay",
            issues
          })
        })
      ];
    })
  );
}

function admitPublicStartRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramPublicStartRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `publicStartTargets[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "public_start",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/public-start-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          name: requiredStringField({
            record: row,
            key: "name",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "public_start",
            issues
          }),
          graphFunctionRef: requiredStringField({
            record: row,
            key: "graphFunctionRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "public_start",
            issues
          }),
          overlayRefs: optionalStringArrayField({
            record: row,
            key: "overlayRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "public_start",
            issues
          }),
          defaultForOverlayRefs: optionalStringArrayField({
            record: row,
            key: "defaultForOverlayRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "public_start",
            issues
          })
        })
      ];
    })
  );
}

function admitPromptAssetRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramPromptAssetRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `promptAssets[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "prompt_asset",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/prompt-asset-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      const gtlNode = row["gtlNode"];
      if (gtlNode !== undefined && !isNodeLike(gtlNode)) {
        issues.push(
          issue({
            surfaceKind: "prompt_asset",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/prompt-asset-node",
            message: `${surfaceRef}.gtlNode must be a GTL Node object when supplied`
          })
        );
      }
      const assetSurface = row["assetSurface"];
      if (!isAssetSurfaceLike(assetSurface)) {
        issues.push(
          issue({
            surfaceKind: "prompt_asset",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/prompt-asset-surface",
            message: `${surfaceRef}.assetSurface must be an AssetSurface object`
          })
        );
        return [];
      }
      const renderedViewDigest = row["renderedViewDigest"];
      if (
        renderedViewDigest !== undefined &&
        renderedViewDigest !== null &&
        typeof renderedViewDigest !== "string"
      ) {
        issues.push(
          issue({
            surfaceKind: "prompt_asset",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/prompt-asset-digest",
            message: `${surfaceRef}.renderedViewDigest must be null or a string`
          })
        );
      }
      return [
        Object.freeze({
          surfaceRef: requiredStringField({
            record: row,
            key: "surfaceRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "prompt_asset",
            issues
          }),
          assetSurface,
          ...(isNodeLike(gtlNode) ? { gtlNode } : {}),
          ...(renderedViewDigest === null || typeof renderedViewDigest === "string"
            ? { renderedViewDigest }
            : {}),
          currentAbgFoldRefs: optionalStringArrayField({
            record: row,
            key: "currentAbgFoldRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "prompt_asset",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "prompt_asset",
            issues
          })
        })
      ];
    })
  );
}

function admitSourceIdentityRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramSourceIdentityRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `sourceIdentitySurfaces[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "source_identity",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/source-identity-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          surfaceRef: requiredStringField({
            record: row,
            key: "surfaceRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "source_identity",
            issues
          }),
          text: requiredStringField({
            record: row,
            key: "text",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "source_identity",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "source_identity",
            issues
          })
        })
      ];
    })
  );
}

export function admitGtlProgramConformanceInput(
  rawInput: unknown
): GtlProgramConformanceInputAdmission {
  const issues: GtlProgramConformanceIssue[] = [];
  if (!isRecord(rawInput)) {
    const input = Object.freeze({
      subjectRef: "unknown",
      abiPackageVersion: "",
      expectedCoverage: admitExpectedCoverage(undefined, "unknown", issues),
      catalogGraphFunctionRefs: Object.freeze([]),
      graphFunctions: Object.freeze([]),
      modules: Object.freeze([]),
      targetCarrierContracts: Object.freeze([]),
      edgeClosureContracts: Object.freeze([]),
      overlays: Object.freeze([]),
      publicStartTargets: Object.freeze([]),
      promptAssets: Object.freeze([]),
      pluginContracts: Object.freeze([]),
      sourceIdentitySurfaces: Object.freeze([])
    });
    issues.push(
      issue({
        surfaceKind: "program_inventory",
        surfaceRef: "unknown",
        ruleRef: "abg://gtl-program/input/object",
        message: "GTL program conformance input must be an object"
      })
    );
    return Object.freeze({
      kind: "gtl_program_conformance_input_admission" as const,
      input,
      issues: Object.freeze([...issues])
    });
  }

  const subjectRef = requiredStringField({
    record: rawInput,
    key: "subjectRef",
    label: "GtlProgramConformanceInput",
    subjectRef: "unknown",
    surfaceKind: "program_inventory",
    issues
  }) || "unknown";
  const graphFunctionInputs = checkOptionalArrayField({
    record: rawInput,
    key: "graphFunctions",
    subjectRef,
    issues
  });
  const moduleInputs = checkOptionalArrayField({
    record: rawInput,
    key: "modules",
    subjectRef,
    issues
  });
  const input = Object.freeze({
    subjectRef,
    abiPackageVersion: requiredStringField({
      record: rawInput,
      key: "abiPackageVersion",
      label: "GtlProgramConformanceInput",
      subjectRef,
      surfaceKind: "program_inventory",
      issues
    }),
    expectedCoverage: admitExpectedCoverage(
      rawInput["expectedCoverage"],
      subjectRef,
      issues
    ),
    catalogGraphFunctionRefs: optionalStringArrayField({
      record: rawInput,
      key: "catalogGraphFunctionRefs",
      label: "GtlProgramConformanceInput",
      subjectRef,
      surfaceKind: "program_inventory",
      issues
    }),
    graphFunctions: Object.freeze(
      graphFunctionInputs.flatMap((entry, index) => {
        const admitted = plausibleGraphFunction(
          entry,
          subjectRef,
          issues,
          `graphFunctions[${index}]`
        );
        return admitted === null ? [] : [admitted];
      })
    ),
    modules: Object.freeze(
      moduleInputs.flatMap((entry, index) => {
        const admitted = plausibleModule(
          entry,
          subjectRef,
          issues,
          `modules[${index}]`
        );
        return admitted === null ? [] : [admitted];
      })
    ),
    targetCarrierContracts: admitTargetCarrierRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "targetCarrierContracts",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    edgeClosureContracts: admitEdgeClosureRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "edgeClosureContracts",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    overlays: admitOverlayRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "overlays",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    publicStartTargets: admitPublicStartRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "publicStartTargets",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    promptAssets: admitPromptAssetRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "promptAssets",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    pluginContracts: checkOptionalArrayField({
      record: rawInput,
      key: "pluginContracts",
      subjectRef,
      issues
    }),
    sourceIdentitySurfaces: admitSourceIdentityRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "sourceIdentitySurfaces",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    )
  });
  return Object.freeze({
    kind: "gtl_program_conformance_input_admission" as const,
    input,
    issues: Object.freeze([...issues])
  });
}

function sameOrderedContract(
  left: readonly Node[],
  right: readonly Node[]
): boolean {
  return stableJson(interfaceContract(left)) === stableJson(interfaceContract(right));
}

function nodeContractSet(nodes: readonly Node[]): Set<string> {
  return new Set(nodes.map(nodeContractKey));
}

function contractNames(nodes: readonly Node[]): readonly string[] {
  return Object.freeze(nodes.map((node) => node.name));
}

function pushGraphInterfaceIssue(input: {
  readonly graphFunction: GraphFunction;
  readonly ruleRef: string;
  readonly message: string;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  input.issues.push(
    issue({
      surfaceKind: "graph_function",
      surfaceRef: input.graphFunction.name,
      ruleRef: input.ruleRef,
      message: input.message
    })
  );
}

function checkGraphFunctionInterface(input: {
  readonly graphFunction: GraphFunction;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const { graphFunction, issues } = input;
  if (!sameOrderedContract(graphFunction.inputs, graphFunction.environment.requires)) {
    pushGraphInterfaceIssue({
      graphFunction,
      issues,
      ruleRef: "abg://gtl-program/graph-function/inputs-equal-environment-requires",
      message: `GraphFunction inputs ${JSON.stringify(contractNames(graphFunction.inputs))} do not equal environment.requires ${JSON.stringify(contractNames(graphFunction.environment.requires))}`
    });
  }

  const providedContracts = nodeContractSet(graphFunction.environment.provides);
  for (const output of graphFunction.outputs) {
    if (!providedContracts.has(nodeContractKey(output))) {
      pushGraphInterfaceIssue({
        graphFunction,
        issues,
        ruleRef: "abg://gtl-program/graph-function/outputs-provided",
        message: `GraphFunction output ${JSON.stringify(output.name)} is absent from environment.provides`
      });
    }
  }
}

function pushGraphIssue(input: {
  readonly graphFunction: GraphFunction;
  readonly graph: Graph;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly surfaceRef: string;
  readonly ruleRef: string;
  readonly message: string;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.surfaceRef,
      ruleRef: input.ruleRef,
      message: `${input.graphFunction.name}/${input.graph.name}: ${input.message}`
    })
  );
}

function graphVectorIdentityKey(input: {
  readonly graphFunctionId: string;
  readonly graphId: string;
  readonly graphVectorId: string;
}): string {
  return stableJson({
    graphFunctionId: input.graphFunctionId,
    graphId: input.graphId,
    graphVectorId: input.graphVectorId
  });
}

function graphVectorIdentityRef(input: {
  readonly graphFunctionRef?: string;
  readonly graphRef?: string;
  readonly vectorRef?: string;
  readonly graphFunctionId: string;
  readonly graphId: string;
  readonly graphVectorId: string;
}): string {
  const display = [
    input.graphFunctionRef ?? input.graphFunctionId,
    input.graphRef ?? input.graphId,
    input.vectorRef ?? input.graphVectorId
  ].join("/");
  return `${display}#${input.graphFunctionId}:${input.graphId}:${input.graphVectorId}`;
}

function checkGraphProgramClosure(input: {
  readonly graphFunction: GraphFunction;
  readonly graph: Graph;
  readonly vectorIdentityKeys: Set<string>;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const { graphFunction, graph, vectorIdentityKeys, issues } = input;
  const declaredContracts = nodeContractSet(graph.nodes);
  const referencedContracts = new Set<string>();

  for (const graphInput of graph.inputs) {
    const graphInputContract = nodeContractKey(graphInput);
    referencedContracts.add(graphInputContract);
    if (!declaredContracts.has(graphInputContract)) {
      pushGraphIssue({
        graphFunction,
        graph,
        issues,
        surfaceKind: "graph",
        surfaceRef: graph.name,
        ruleRef: "abg://gtl-program/graph/input-node-declared",
        message: `graph input ${JSON.stringify(graphInput.name)} is absent from graph.nodes`
      });
    }
  }

  for (const graphOutput of graph.outputs) {
    const graphOutputContract = nodeContractKey(graphOutput);
    referencedContracts.add(graphOutputContract);
    if (!declaredContracts.has(graphOutputContract)) {
      pushGraphIssue({
        graphFunction,
        graph,
        issues,
        surfaceKind: "graph",
        surfaceRef: graph.name,
        ruleRef: "abg://gtl-program/graph/output-node-declared",
        message: `graph output ${JSON.stringify(graphOutput.name)} is absent from graph.nodes`
      });
    }
  }

  for (const vector of graph.vectors) {
    const vectorIdentity = {
      graphFunctionId: graphFunction.id,
      graphId: graph.id,
      graphVectorId: vector.id
    };
    const vectorIdentityKey = graphVectorIdentityKey(vectorIdentity);
    if (vectorIdentityKeys.has(vectorIdentityKey)) {
      pushGraphIssue({
        graphFunction,
        graph,
        issues,
        surfaceKind: "graph_vector",
        surfaceRef: graphVectorIdentityRef({
          graphFunctionRef: graphFunction.name,
          graphRef: graph.name,
          vectorRef: vector.name,
          ...vectorIdentity
        }),
        ruleRef: "abg://gtl-program/graph-vector/unique-ref",
        message: `GraphVector identity ${JSON.stringify(vectorIdentity)} is declared more than once`
      });
    }
    vectorIdentityKeys.add(vectorIdentityKey);

    for (const source of vector.source) {
      const sourceContract = nodeContractKey(source);
      referencedContracts.add(sourceContract);
      if (!declaredContracts.has(sourceContract)) {
        pushGraphIssue({
          graphFunction,
          graph,
          issues,
          surfaceKind: "graph_vector",
          surfaceRef: vector.name,
          ruleRef: "abg://gtl-program/graph-vector/source-node-declared",
          message: `vector source ${JSON.stringify(source.name)} is absent from graph.nodes`
        });
      }
    }

    const targetContract = nodeContractKey(vector.target);
    referencedContracts.add(targetContract);
    if (!declaredContracts.has(targetContract)) {
      pushGraphIssue({
        graphFunction,
        graph,
        issues,
        surfaceKind: "graph_vector",
        surfaceRef: vector.name,
        ruleRef: "abg://gtl-program/graph-vector/target-node-declared",
        message: `vector target ${JSON.stringify(vector.target.name)} is absent from graph.nodes`
      });
    }
  }

  const availableContracts = nodeContractSet(graph.inputs);
  const remainingVectors = new Set<GraphVector>(graph.vectors);
  let progressed = true;
  while (progressed) {
    progressed = false;
    for (const vector of [...remainingVectors]) {
      const sourceContracts = interfaceContract(vector.source);
      if (sourceContracts.every((contract) => availableContracts.has(contract))) {
        availableContracts.add(nodeContractKey(vector.target));
        remainingVectors.delete(vector);
        progressed = true;
      }
    }
  }

  for (const vector of remainingVectors) {
    const missingSources = vector.source
      .filter((source) => !availableContracts.has(nodeContractKey(source)))
      .map((source) => source.name);
    pushGraphIssue({
      graphFunction,
      graph,
      issues,
      surfaceKind: "graph_vector",
      surfaceRef: vector.name,
      ruleRef: "abg://gtl-program/graph-vector/source-derivable",
      message: `vector sources are not derivable from graph inputs or prior vector outputs: ${JSON.stringify(missingSources)}`
    });
  }

  for (const graphOutput of graph.outputs) {
    if (!availableContracts.has(nodeContractKey(graphOutput))) {
      pushGraphIssue({
        graphFunction,
        graph,
        issues,
        surfaceKind: "graph",
        surfaceRef: graph.name,
        ruleRef: "abg://gtl-program/graph/output-derivable",
        message: `graph output ${JSON.stringify(graphOutput.name)} is not derivable from graph inputs`
      });
    }
  }

  for (const node of graph.nodes) {
    if (!referencedContracts.has(nodeContractKey(node))) {
      pushGraphIssue({
        graphFunction,
        graph,
        issues,
        surfaceKind: "graph",
        surfaceRef: graph.name,
        ruleRef: "abg://gtl-program/graph/node-reachable-or-bound",
        message: `declared node ${JSON.stringify(node.name)} is not an input, output, vector source, or vector target`
      });
    }
  }
}

function collectPublishedGraphFunctions(
  input: GtlProgramConformanceInput,
  issues: GtlProgramConformanceIssue[]
): readonly GraphFunction[] {
  const graphFunctions = [...(input.graphFunctions ?? [])];
  for (const module of input.modules ?? []) {
    graphFunctions.push(...module.graphFunctions);
  }

  const byName = new Map<string, GraphFunction>();
  for (const graphFunction of graphFunctions) {
    if (byName.has(graphFunction.name)) {
      issues.push(
        issue({
          surfaceKind: "graph_function",
          surfaceRef: graphFunction.name,
          ruleRef: "abg://gtl-program/graph-function/unique-publication",
          message: `GraphFunction ${JSON.stringify(graphFunction.name)} is published more than once`
        })
      );
      continue;
    }
    byName.set(graphFunction.name, graphFunction);
  }
  return Object.freeze([...byName.values()]);
}

function checkCatalogPublication(input: {
  readonly catalogGraphFunctionRefs: readonly string[];
  readonly publishedGraphFunctionRefs: ReadonlySet<string>;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const catalogRefs = new Set(input.catalogGraphFunctionRefs);
  for (const ref of catalogRefs) {
    if (!input.publishedGraphFunctionRefs.has(ref)) {
      input.issues.push(
        issue({
          surfaceKind: "graph_function",
          surfaceRef: ref,
          ruleRef: "abg://gtl-program/graph-function/catalog-published",
          message: `catalog GraphFunction ${JSON.stringify(ref)} is not published`
        })
      );
    }
  }
  for (const ref of input.publishedGraphFunctionRefs) {
    if (!catalogRefs.has(ref)) {
      input.issues.push(
        issue({
          surfaceKind: "module",
          surfaceRef: ref,
          ruleRef: "abg://gtl-program/module/no-untracked-graph-function",
          message: `published GraphFunction ${JSON.stringify(ref)} is absent from the supplied catalog`
        })
      );
    }
  }
}

function materializeGraphVectors(
  graphFunctions: readonly GraphFunction[],
  issues: GtlProgramConformanceIssue[]
): readonly GraphVectorProjection[] {
  const vectors: GraphVectorProjection[] = [];
  const vectorIdentityKeys = new Set<string>();
  for (const graphFunction of graphFunctions) {
    checkGraphFunctionInterface({ graphFunction, issues });
    try {
      const graph = materializeGraphFunction(graphFunction);
      checkGraphProgramClosure({
        graphFunction,
        graph,
        vectorIdentityKeys,
        issues
      });
      for (const vector of graph.vectors) {
        vectors.push(
          Object.freeze({
            graphFunctionId: graphFunction.id,
            graphFunctionRef: graphFunction.name,
            graphId: graph.id,
            graphRef: graph.name,
            graphVectorId: vector.id,
            vectorRef: vector.name,
            sourceAssetTypes: Object.freeze(vector.source.map((source) => source.name)),
            sourceNodeContracts: interfaceContract(vector.source),
            targetAssetType: vector.target.name,
            targetNodeContract: nodeContractKey(vector.target)
          })
        );
      }
    } catch (error: unknown) {
      issues.push(
        issue({
          surfaceKind: "graph_function",
          surfaceRef: graphFunction.name,
          ruleRef: "abg://gtl-program/graph-function/materializable-template",
          message: errorMessage(error)
        })
      );
    }
  }
  return Object.freeze(vectors);
}

function checkVectorRows(input: {
  readonly vectors: readonly GraphVectorProjection[];
  readonly targetCarrierContracts: readonly GtlProgramTargetCarrierRow[];
  readonly edgeClosureContracts: readonly GtlProgramEdgeClosureRow[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const vectorByIdentity = new Map(
    input.vectors.map((vector) => [graphVectorIdentityKey(vector), vector])
  );
  const targetCarrierByIdentity = new Map<string, GtlProgramTargetCarrierRow[]>();
  for (const row of input.targetCarrierContracts) {
    const key = graphVectorIdentityKey(row);
    targetCarrierByIdentity.set(key, [
      ...(targetCarrierByIdentity.get(key) ?? []),
      row
    ]);
  }
  const edgeClosureByIdentity = new Map<string, GtlProgramEdgeClosureRow[]>();
  for (const row of input.edgeClosureContracts) {
    const key = graphVectorIdentityKey(row);
    edgeClosureByIdentity.set(key, [
      ...(edgeClosureByIdentity.get(key) ?? []),
      row
    ]);
  }

  for (const vector of input.vectors) {
    const vectorKey = graphVectorIdentityKey(vector);
    const vectorIdentity = graphVectorIdentityRef(vector);
    const targetCarriers = targetCarrierByIdentity.get(vectorKey) ?? [];
    if (targetCarriers.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "target_carrier_contract",
          surfaceRef: vectorIdentity,
          ruleRef: "abg://gtl-program/graph-vector/target-carrier-required",
          message: `GraphVector ${JSON.stringify(vectorIdentity)} has no target carrier contract row`
        })
      );
    } else if (targetCarriers.length > 1) {
      input.issues.push(
        issue({
          surfaceKind: "target_carrier_contract",
          surfaceRef: vectorIdentity,
          ruleRef: "abg://gtl-program/target-carrier/unique-vector-row",
          message: `GraphVector ${JSON.stringify(vectorIdentity)} has ${targetCarriers.length} target carrier rows`
        })
      );
    } else {
      const targetCarrier = targetCarriers[0]!;
      if (targetCarrier.graphVectorRef !== vector.vectorRef) {
        input.issues.push(
          issue({
            surfaceKind: "target_carrier_contract",
            surfaceRef: targetCarrier.edgeRef,
            ruleRef: "abg://gtl-program/target-carrier/vector-ref-match",
            message: `target carrier graphVectorRef ${JSON.stringify(targetCarrier.graphVectorRef)} does not match vector ${JSON.stringify(vector.vectorRef)}`
          })
        );
      }
      if (targetCarrier.targetAssetType !== vector.targetAssetType) {
        input.issues.push(
          issue({
            surfaceKind: "target_carrier_contract",
            surfaceRef: targetCarrier.edgeRef,
            ruleRef: "abg://gtl-program/target-carrier/target-asset-match",
            message: `target carrier target ${JSON.stringify(targetCarrier.targetAssetType)} does not match vector target ${JSON.stringify(vector.targetAssetType)}`
          })
        );
      }
      if (!targetCarrier.targetCarrierContractRef.startsWith("gtl://target-carrier-contract/")) {
        input.issues.push(
          issue({
            surfaceKind: "target_carrier_contract",
            surfaceRef: targetCarrier.edgeRef,
            ruleRef: "abg://gtl-program/target-carrier/gtl-ref",
            message: "target carrier row must publish a gtl://target-carrier-contract/ ref"
          })
        );
      }
    }

    const edgeClosures = edgeClosureByIdentity.get(vectorKey) ?? [];
    if (edgeClosures.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "edge_closure_contract",
          surfaceRef: vectorIdentity,
          ruleRef: "abg://gtl-program/graph-vector/edge-closure-required",
          message: `GraphVector ${JSON.stringify(vectorIdentity)} has no edge closure contract row`
        })
      );
    } else if (edgeClosures.length > 1) {
      input.issues.push(
        issue({
          surfaceKind: "edge_closure_contract",
          surfaceRef: vectorIdentity,
          ruleRef: "abg://gtl-program/edge-closure/unique-vector-row",
          message: `GraphVector ${JSON.stringify(vectorIdentity)} has ${edgeClosures.length} edge closure rows`
        })
      );
    } else {
      const edgeClosure = edgeClosures[0]!;
      if (edgeClosure.targetAssetType !== vector.targetAssetType) {
      input.issues.push(
        issue({
          surfaceKind: "edge_closure_contract",
          surfaceRef: edgeClosure.edgeRef,
          ruleRef: "abg://gtl-program/edge-closure/target-asset-match",
          message: `edge closure target ${JSON.stringify(edgeClosure.targetAssetType)} does not match vector target ${JSON.stringify(vector.targetAssetType)}`
        })
      );
      }
    }
  }

  for (const row of input.targetCarrierContracts) {
    if (!vectorByIdentity.has(graphVectorIdentityKey(row))) {
      input.issues.push(
        issue({
          surfaceKind: "target_carrier_contract",
          surfaceRef: graphVectorIdentityRef({
            graphFunctionRef: row.edgeRef,
            graphRef: row.edgeRef,
            vectorRef: row.graphVectorRef,
            ...row
          }),
          ruleRef: "abg://gtl-program/target-carrier/no-orphan-row",
          message: `target carrier row ${JSON.stringify(row.edgeRef)} has no published graph vector identity`
        })
      );
    }
  }

  for (const row of input.edgeClosureContracts) {
    if (!vectorByIdentity.has(graphVectorIdentityKey(row))) {
      input.issues.push(
        issue({
          surfaceKind: "edge_closure_contract",
          surfaceRef: graphVectorIdentityRef({
            graphFunctionRef: row.edgeRef,
            graphRef: row.edgeRef,
            vectorRef: row.edgeRef,
            ...row
          }),
          ruleRef: "abg://gtl-program/edge-closure/no-orphan-row",
          message: `edge closure row ${JSON.stringify(row.edgeRef)} has no published graph vector identity`
        })
      );
    }
  }
}

function checkOverlays(input: {
  readonly overlays: readonly GtlProgramOverlayRow[];
  readonly publicStartTargets: readonly GtlProgramPublicStartRow[];
  readonly graphFunctionRefs: ReadonlySet<string>;
  readonly graphVectorRefs: ReadonlySet<string>;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const overlayRefs = new Set(input.overlays.map((overlay) => overlay.overlayRef));
  for (const overlay of input.overlays) {
    for (const graphFunctionRef of overlay.graphFunctionRefs) {
      if (!input.graphFunctionRefs.has(graphFunctionRef)) {
        input.issues.push(
          issue({
            surfaceKind: "overlay",
            surfaceRef: overlay.overlayRef,
            ruleRef: "abg://gtl-program/overlay/graph-function-resolves",
            message: `overlay names unpublished GraphFunction ${JSON.stringify(graphFunctionRef)}`
          })
        );
      }
    }
    for (const graphVectorRef of overlay.graphVectorRefs) {
      if (!input.graphVectorRefs.has(graphVectorRef)) {
        input.issues.push(
          issue({
            surfaceKind: "overlay",
            surfaceRef: overlay.overlayRef,
            ruleRef: "abg://gtl-program/overlay/graph-vector-resolves",
            message: `overlay names unpublished GraphVector ${JSON.stringify(graphVectorRef)}`
          })
        );
      }
    }
    for (const target of overlay.publicStartTargets) {
      if (!input.graphFunctionRefs.has(target)) {
        input.issues.push(
          issue({
            surfaceKind: "overlay",
            surfaceRef: overlay.overlayRef,
            ruleRef: "abg://gtl-program/overlay/public-start-target-resolves",
            message: `overlay public start target ${JSON.stringify(target)} is not published`
          })
        );
      }
    }
    if (!input.graphFunctionRefs.has(overlay.defaultStartTarget)) {
      input.issues.push(
        issue({
          surfaceKind: "overlay",
          surfaceRef: overlay.overlayRef,
          ruleRef: "abg://gtl-program/overlay/default-start-target-resolves",
          message: `overlay default start target ${JSON.stringify(overlay.defaultStartTarget)} is not published`
        })
      );
    }
  }

  for (const target of input.publicStartTargets) {
    if (!input.graphFunctionRefs.has(target.graphFunctionRef)) {
      input.issues.push(
        issue({
          surfaceKind: "public_start",
          surfaceRef: target.name,
          ruleRef: "abg://gtl-program/public-start/graph-function-resolves",
          message: `public start target names unpublished GraphFunction ${JSON.stringify(target.graphFunctionRef)}`
        })
      );
    }
    for (const overlayRef of target.overlayRefs) {
      if (!overlayRefs.has(overlayRef)) {
        input.issues.push(
          issue({
            surfaceKind: "public_start",
            surfaceRef: target.name,
            ruleRef: "abg://gtl-program/public-start/overlay-resolves",
            message: `public start target names unpublished overlay ${JSON.stringify(overlayRef)}`
          })
        );
      }
    }
    for (const overlayRef of target.defaultForOverlayRefs) {
      if (!overlayRefs.has(overlayRef)) {
        input.issues.push(
          issue({
            surfaceKind: "public_start",
            surfaceRef: target.name,
            ruleRef: "abg://gtl-program/public-start/default-overlay-resolves",
            message: `public start target defaultFor names unpublished overlay ${JSON.stringify(overlayRef)}`
          })
        );
      }
    }
  }
}

function checkPromptAssets(input: {
  readonly promptAssets: readonly GtlProgramPromptAssetRow[];
  readonly abiPackageVersion: string;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  for (const row of input.promptAssets) {
    let admitted: AssetSurface;
    try {
      admitted = admitAssetSurface(row.assetSurface);
    } catch (error: unknown) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/asset-surface-admission",
          message: errorMessage(error),
          evidenceRefs: row.evidenceRefs
        })
      );
      continue;
    }

    if (admitted.rendererRefs.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/renderer-ref",
          message: "prompt assets require at least one renderer ref",
          evidenceRefs: row.evidenceRefs
        })
      );
    }
    if (admitted.renderedViewDigestPolicyRef === null) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/rendered-view-digest-policy",
          message: "prompt assets require renderedViewDigestPolicyRef",
          evidenceRefs: row.evidenceRefs
        })
      );
    }
    if (admitted.constructorRefs.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/constructor-ref",
          message: "prompt assets require at least one constructor ref",
          evidenceRefs: row.evidenceRefs
        })
      );
    }
    if (admitted.proofObligationRefs.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/proof-obligation",
          message: "prompt assets require at least one proof obligation ref",
          evidenceRefs: row.evidenceRefs
        })
      );
    }
    if (admitted.outputContractRefs.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/output-contract",
          message: "prompt assets require at least one output contract ref",
          evidenceRefs: row.evidenceRefs
        })
      );
    }
    if (admitted.authoritySlots.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/authority-slot",
          message: "prompt assets require at least one authority slot",
          evidenceRefs: row.evidenceRefs
        })
      );
    }
    if (row.gtlNode === undefined) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/gtl-node",
          message: "prompt assets require the GTL node that carries the admitted AssetSurface",
          evidenceRefs: row.evidenceRefs
        })
      );
    }

    if (
      (admitted.sectionKindRefs.length > 0 || admitted.clauseKindRefs.length > 0) &&
      admitted.rendererRefs.length === 0
    ) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/rendered-structure-has-renderer",
          message: "section or clause kind refs require a renderer ref",
          evidenceRefs: row.evidenceRefs
        })
      );
    }

    if (row.gtlNode !== undefined && stableJson(row.gtlNode.assetSurface) !== stableJson(admitted)) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/node-preserves-asset-surface",
          message: "prompt GTL node assetSurface does not match admitted prompt AssetSurface",
          evidenceRefs: row.evidenceRefs
        })
      );
    }

    if (row.renderedViewDigest === undefined || row.renderedViewDigest === null) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/rendered-view-digest",
          message: "prompt assets require a rendered prompt view digest",
          evidenceRefs: row.evidenceRefs
        })
      );
    } else if (!row.renderedViewDigest.startsWith("sha256:")) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/rendered-view-digest",
          message: "rendered prompt view digest must be a sha256: digest",
          evidenceRefs: row.evidenceRefs
        })
      );
    }

    if (row.evidenceRefs === undefined || row.evidenceRefs.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/evidence-ref",
          message: "prompt assets require evidence refs that bind the supplied row",
          evidenceRefs: row.evidenceRefs
        })
      );
    }

    for (const foldRef of row.currentAbgFoldRefs ?? []) {
      const packageMatch = foldRef.match(
        /@abiogenesis\/typescript-tenant@([^#\s]+)/u
      );
      if (packageMatch !== null && packageMatch[1] !== input.abiPackageVersion) {
        input.issues.push(
          issue({
            surfaceKind: "prompt_asset",
            surfaceRef: row.surfaceRef,
            ruleRef: "abg://gtl-program/prompt-asset/current-abg-fold-ref",
            message: `prompt fold ref ${JSON.stringify(foldRef)} does not use @abiogenesis/typescript-tenant@${input.abiPackageVersion}`,
            evidenceRefs: row.evidenceRefs
          })
        );
      }
    }
  }
}

function checkPluginContracts(input: {
  readonly pluginContracts: readonly unknown[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const refs = new Set<string>();
  for (const contractInput of input.pluginContracts) {
    let contract: EnginePluginContract;
    let surfaceRef = "unknown";
    if (
      typeof contractInput === "object" &&
      contractInput !== null &&
      "ref" in contractInput &&
      typeof contractInput.ref === "string"
    ) {
      surfaceRef = contractInput.ref;
    }
    try {
      contract = admitEnginePluginContract(contractInput);
    } catch (error: unknown) {
      input.issues.push(
        issue({
          surfaceKind: "plugin_contract",
          surfaceRef,
          ruleRef: "abg://gtl-program/plugin-contract/admission",
          message: errorMessage(error)
        })
      );
      continue;
    }
    if (refs.has(contract.ref)) {
      input.issues.push(
        issue({
          surfaceKind: "plugin_contract",
          surfaceRef: contract.ref,
          ruleRef: "abg://gtl-program/plugin-contract/unique-ref",
          message: `plugin contract ${JSON.stringify(contract.ref)} is declared more than once`
        })
      );
    }
    refs.add(contract.ref);
    if (
      contract.maySelectNextVector ||
      contract.mayEmitRuntimeEvents ||
      contract.mayCloseTraversal ||
      contract.mayOwnIterationLoop
    ) {
      input.issues.push(
        issue({
          surfaceKind: "plugin_contract",
          surfaceRef: contract.ref,
          ruleRef: "abg://gtl-program/plugin-contract/no-engine-authority",
          message: "plugin contracts must not own traversal, event, closure, or iteration authority"
        })
      );
    }
  }
}

function normalizedVersion(value: string): string {
  return value.replaceAll("_", ".");
}

function scanStaleIdentityLine(input: {
  readonly line: string;
  readonly surfaceRef: string;
  readonly lineNumber: number;
  readonly abiPackageVersion: string;
  readonly evidenceRefs: readonly string[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const currentMajorMinor = input.abiPackageVersion.match(/^\d+\.\d+/u)?.[0] ?? "";
  const versionedAbgRefPattern =
    /\bABG[-_]?(\d+(?:[._]\d+){1,2})(?:[-_]?RC\d+)?\b/giu;
  for (const match of input.line.matchAll(versionedAbgRefPattern)) {
    const token = match[0];
    const version = normalizedVersion(match[1] ?? "");
    if (!version.startsWith(currentMajorMinor)) {
      input.issues.push(
        issue({
          surfaceKind: "source_identity",
          surfaceRef: `${input.surfaceRef}:${input.lineNumber}`,
          ruleRef: "abg://gtl-program/source-identity/current-abg-version",
          message: `stale ABG identity ${JSON.stringify(token)} does not match ${input.abiPackageVersion}`,
          evidenceRefs: input.evidenceRefs
        })
      );
    }
  }

  const spacedAbgRefPattern =
    /\bABG\s+(\d+(?:[._]\d+){1,2})(?:\s+RC\d+)?\b/giu;
  for (const match of input.line.matchAll(spacedAbgRefPattern)) {
    const token = match[0];
    const version = normalizedVersion(match[1] ?? "");
    if (!version.startsWith(currentMajorMinor)) {
      input.issues.push(
        issue({
          surfaceKind: "source_identity",
          surfaceRef: `${input.surfaceRef}:${input.lineNumber}`,
          ruleRef: "abg://gtl-program/source-identity/current-abg-version",
          message: `stale ABG identity ${JSON.stringify(token)} does not match ${input.abiPackageVersion}`,
          evidenceRefs: input.evidenceRefs
        })
      );
    }
  }

  const compactAbgRefPattern = /\bABG(\d)(\d)\b/giu;
  for (const match of input.line.matchAll(compactAbgRefPattern)) {
    const token = match[0];
    const version = `${match[1]}.${match[2]}`;
    if (version !== currentMajorMinor) {
      input.issues.push(
        issue({
          surfaceKind: "source_identity",
          surfaceRef: `${input.surfaceRef}:${input.lineNumber}`,
          ruleRef: "abg://gtl-program/source-identity/current-compact-abg-version",
          message: `stale compact ABG identity ${JSON.stringify(token)} does not match ${input.abiPackageVersion}`,
          evidenceRefs: input.evidenceRefs
        })
      );
    }
  }

  const staleStagePatterns = Object.freeze([
    /\bRC3\b/u,
    /\brc3StageTruth\b/u,
    /\bRC3 Stage Truth\b/u,
    /\bRC3 selected composition drift\b/u,
    /\babg-3\.9-rc3\b/iu,
    /\b3\.9\.0-rc\.13\b/u,
    /\brc13\b/iu
  ]);
  for (const pattern of staleStagePatterns) {
    if (pattern.test(input.line)) {
      input.issues.push(
        issue({
          surfaceKind: "source_identity",
          surfaceRef: `${input.surfaceRef}:${input.lineNumber}`,
          ruleRef: "abg://gtl-program/source-identity/stale-stage-label",
          message: `stale ABG migration or stage label matched ${pattern}`,
          evidenceRefs: input.evidenceRefs
        })
      );
    }
  }
}

function checkSourceIdentities(input: {
  readonly sourceIdentitySurfaces: readonly GtlProgramSourceIdentityRow[];
  readonly abiPackageVersion: string;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  for (const surface of input.sourceIdentitySurfaces) {
    scanStaleIdentityLine({
      line: surface.surfaceRef,
      surfaceRef: surface.surfaceRef,
      lineNumber: 0,
      abiPackageVersion: input.abiPackageVersion,
      evidenceRefs: freezeStrings(surface.evidenceRefs),
      issues: input.issues
    });
    const lines = surface.text.split(/\r?\n/u);
    lines.forEach((line, index) => {
      scanStaleIdentityLine({
        line,
        surfaceRef: surface.surfaceRef,
        lineNumber: index + 1,
        abiPackageVersion: input.abiPackageVersion,
        evidenceRefs: freezeStrings(surface.evidenceRefs),
        issues: input.issues
      });
    });
  }
}

const EXACT_PACKAGE_VERSION_PATTERN =
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z][0-9A-Za-z.-]*)?$/u;

function checkAbiPackageVersion(input: {
  readonly subjectRef: string;
  readonly abiPackageVersion: string;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  if (!EXACT_PACKAGE_VERSION_PATTERN.test(input.abiPackageVersion)) {
    input.issues.push(
      issue({
        surfaceKind: "program_inventory",
        surfaceRef: input.subjectRef,
        ruleRef: "abg://gtl-program/version/exact-package-version",
        message: "abiPackageVersion must be an exact package version"
      })
    );
  }
}

type CoverageKey =
  keyof GtlProgramExpectedCoverage & keyof GtlProgramConformanceCoverage;

const COVERAGE_KEYS: readonly CoverageKey[] = Object.freeze([
  "catalogGraphFunctionCount",
  "publishedGraphFunctionCount",
  "graphVectorCount",
  "targetCarrierContractCount",
  "edgeClosureContractCount",
  "overlayCount",
  "publicStartTargetCount",
  "promptAssetCount",
  "pluginContractCount",
  "sourceIdentitySurfaceCount"
]);

function checkExpectedCoverage(input: {
  readonly subjectRef: string;
  readonly expectedCoverage: GtlProgramExpectedCoverage | undefined;
  readonly coverage: GtlProgramConformanceCoverage;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  if (input.expectedCoverage === undefined) {
    input.issues.push(
      issue({
        surfaceKind: "program_inventory",
        surfaceRef: input.subjectRef,
        ruleRef: "abg://gtl-program/coverage/expected-coverage-required",
        message: "GTL program typecheck requires explicit expectedCoverage"
      })
    );
    return;
  }

  let declaredExpectationCount = 0;
  for (const key of COVERAGE_KEYS) {
    const expected = input.expectedCoverage[key];
    if (expected === undefined) {
      continue;
    }
    declaredExpectationCount += 1;
    if (!Number.isInteger(expected) || expected < 0) {
      input.issues.push(
        issue({
          surfaceKind: "program_inventory",
          surfaceRef: input.subjectRef,
          ruleRef: "abg://gtl-program/coverage/expected-count-admitted",
          message: `expectedCoverage.${key} must be a non-negative integer`
        })
      );
      continue;
    }
    if (expected === 0) {
      input.issues.push(
        issue({
          surfaceKind: "program_inventory",
          surfaceRef: input.subjectRef,
          ruleRef: "abg://gtl-program/coverage/expected-count-nonzero",
          message: `expectedCoverage.${key} must be greater than zero for a complete GTL program scope`
        })
      );
    }
    if (input.coverage[key] !== expected) {
      input.issues.push(
        issue({
          surfaceKind: "program_inventory",
          surfaceRef: input.subjectRef,
          ruleRef: "abg://gtl-program/coverage/expected-count",
          message: `expectedCoverage.${key} expected ${expected}, observed ${input.coverage[key]}`
        })
      );
    }
  }

  if (declaredExpectationCount === 0) {
    input.issues.push(
      issue({
        surfaceKind: "program_inventory",
        surfaceRef: input.subjectRef,
        ruleRef: "abg://gtl-program/coverage/expected-coverage-nonempty",
        message: "expectedCoverage must declare at least one surface count"
      })
    );
  }
}

function sourceIdentityDigestRows(
  rows: readonly GtlProgramSourceIdentityRow[]
): readonly {
  readonly surfaceRef: string;
  readonly textDigest: string;
  readonly evidenceRefs: readonly string[];
}[] {
  return Object.freeze(
    rows.map((row) =>
      Object.freeze({
        surfaceRef: row.surfaceRef,
        textDigest: stableSha256Digest(row.text),
        evidenceRefs: freezeStrings(row.evidenceRefs)
      })
    )
  );
}

function computeInventoryDigests(input: {
  readonly catalogGraphFunctionRefs: readonly string[];
  readonly graphFunctions: readonly GraphFunction[];
  readonly modules: readonly Module[];
  readonly vectors: readonly GraphVectorProjection[];
  readonly targetCarrierContracts: readonly GtlProgramTargetCarrierRow[];
  readonly edgeClosureContracts: readonly GtlProgramEdgeClosureRow[];
  readonly overlays: readonly GtlProgramOverlayRow[];
  readonly publicStartTargets: readonly GtlProgramPublicStartRow[];
  readonly promptAssets: readonly GtlProgramPromptAssetRow[];
  readonly pluginContracts: readonly unknown[];
  readonly sourceIdentitySurfaces: readonly GtlProgramSourceIdentityRow[];
}): GtlProgramInventoryDigests {
  return Object.freeze({
    catalogGraphFunctionRefs: stableSha256Digest(input.catalogGraphFunctionRefs),
    graphFunctions: stableSha256Digest(input.graphFunctions),
    modules: stableSha256Digest(input.modules),
    materializedVectors: stableSha256Digest(input.vectors),
    targetCarrierContracts: stableSha256Digest(input.targetCarrierContracts),
    edgeClosureContracts: stableSha256Digest(input.edgeClosureContracts),
    overlays: stableSha256Digest(input.overlays),
    publicStartTargets: stableSha256Digest(input.publicStartTargets),
    promptAssets: stableSha256Digest(input.promptAssets),
    pluginContracts: stableSha256Digest(input.pluginContracts),
    sourceIdentitySurfaces: stableSha256Digest(
      sourceIdentityDigestRows(input.sourceIdentitySurfaces)
    )
  });
}

export function typecheckGtlProgram(inputCandidate: unknown): GtlProgramConformanceReport {
  const admission = admitGtlProgramConformanceInput(inputCandidate);
  const input = admission.input;
  const issues: GtlProgramConformanceIssue[] = [...admission.issues];
  checkAbiPackageVersion({
    subjectRef: input.subjectRef,
    abiPackageVersion: input.abiPackageVersion,
    issues
  });
  const graphFunctions = collectPublishedGraphFunctions(input, issues);
  const publishedGraphFunctionRefs = new Set(
    graphFunctions.map((graphFunction) => graphFunction.name)
  );
  const catalogGraphFunctionRefs = uniqueSorted(input.catalogGraphFunctionRefs ?? []);
  const modules = Object.freeze([...(input.modules ?? [])]);

  if (catalogGraphFunctionRefs.length > 0) {
    checkCatalogPublication({
      catalogGraphFunctionRefs,
      publishedGraphFunctionRefs,
      issues
    });
  }

  const vectors = materializeGraphVectors(graphFunctions, issues);
  const graphVectorRefs = new Set(vectors.map((vector) => vector.vectorRef));
  const targetCarrierContracts = Object.freeze([
    ...(input.targetCarrierContracts ?? [])
  ]);
  const edgeClosureContracts = Object.freeze([
    ...(input.edgeClosureContracts ?? [])
  ]);
  const overlays = Object.freeze([...(input.overlays ?? [])]);
  const publicStartTargets = Object.freeze([...(input.publicStartTargets ?? [])]);
  const promptAssets = Object.freeze([...(input.promptAssets ?? [])]);
  const pluginContracts = Object.freeze([...(input.pluginContracts ?? [])]);
  const sourceIdentitySurfaces = Object.freeze([
    ...(input.sourceIdentitySurfaces ?? [])
  ]);

  checkVectorRows({
    vectors,
    targetCarrierContracts,
    edgeClosureContracts,
    issues
  });
  checkOverlays({
    overlays,
    publicStartTargets,
    graphFunctionRefs: publishedGraphFunctionRefs,
    graphVectorRefs,
    issues
  });
  checkPromptAssets({
    promptAssets,
    abiPackageVersion: input.abiPackageVersion,
    issues
  });
  checkPluginContracts({
    pluginContracts,
    issues
  });
  checkSourceIdentities({
    sourceIdentitySurfaces,
    abiPackageVersion: input.abiPackageVersion,
    issues
  });

  const coverage = Object.freeze({
    catalogGraphFunctionCount: catalogGraphFunctionRefs.length,
    publishedGraphFunctionCount: publishedGraphFunctionRefs.size,
    graphVectorCount: vectors.length,
    targetCarrierContractCount: targetCarrierContracts.length,
    edgeClosureContractCount: edgeClosureContracts.length,
    overlayCount: overlays.length,
    publicStartTargetCount: publicStartTargets.length,
    promptAssetCount: promptAssets.length,
    pluginContractCount: pluginContracts.length,
    sourceIdentitySurfaceCount: sourceIdentitySurfaces.length
  });
  checkExpectedCoverage({
    subjectRef: input.subjectRef,
    expectedCoverage: input.expectedCoverage,
    coverage,
    issues
  });
  const inventoryDigests = computeInventoryDigests({
    catalogGraphFunctionRefs,
    graphFunctions,
    modules,
    vectors,
    targetCarrierContracts,
    edgeClosureContracts,
    overlays,
    publicStartTargets,
    promptAssets,
    pluginContracts,
    sourceIdentitySurfaces
  });
  const inventoryDigest = stableSha256Digest(inventoryDigests);
  const frozenIssues = Object.freeze([...issues]);
  const reportBasis = Object.freeze({
    subjectRef: input.subjectRef,
    abiPackageVersion: input.abiPackageVersion,
    expectedCoverage: input.expectedCoverage ?? null,
    coverage,
    inventoryDigest,
    inventoryDigests,
    issues: frozenIssues
  });
  return Object.freeze({
    kind: "gtl_program_conformance_report",
    reportRef: `abg://gtl-program-conformance-report/${stableSha256Digest(reportBasis)}`,
    subjectRef: input.subjectRef,
    abiPackageVersion: input.abiPackageVersion,
    inventoryDigest,
    inventoryDigests,
    passed: frozenIssues.length === 0,
    issueCount: frozenIssues.length,
    issues: frozenIssues,
    coverage
  });
}

export function formatGtlProgramConformanceIssues(
  issues: readonly GtlProgramConformanceIssue[]
): string {
  if (issues.length === 0) {
    return "none";
  }
  return issues
    .map(
      (entry) =>
        `${entry.severity} ${entry.ruleRef} ${entry.surfaceKind}:${entry.surfaceRef} - ${entry.message}`
    )
    .join("\n");
}
