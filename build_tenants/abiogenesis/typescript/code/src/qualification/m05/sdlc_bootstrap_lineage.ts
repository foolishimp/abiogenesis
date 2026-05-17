import type { ExecutionBasis } from "../../abg/m03/contracts/index.js";
import type { TraversalStructureProbe } from "../../abg/m03/contracts/traversal_structure_probe.js";
import {
  constructEnvRef,
  constructGraph,
  constructGraphFunction,
  constructGraphVector,
  constructNode,
  constructTemplateRef,
  emptySerializedAttrs
} from "../../gtl/m01/contracts/index.js";
import type {
  Evaluator,
  GraphFunction,
  Node,
  Operator
} from "../../gtl/m01/contracts/index.js";
import type {
  SdlcAmbiguityEntry,
  SdlcAssetLineageEntry,
  SdlcBootstrapInputRef,
  SdlcBootstrapInputSet,
  SdlcDerivationConfidence,
  SdlcElementLineageEntry,
  SdlcProject,
  SdlcProjectElement,
  SdlcProjectElementType,
  SdlcRuntimeProvenanceRef
} from "./sdlc_bootstrap_lineage_carriers.js";
import {
  constructSdlcAmbiguityEntry,
  constructSdlcAssetLineageEntry,
  constructSdlcDerivationLedger,
  constructSdlcElementLineageEntry,
  constructSdlcProject,
  constructSdlcProjectElement,
  constructSdlcRuntimeProvenanceRef
} from "./sdlc_bootstrap_lineage_constructors.js";

const PROJECT_ASSET_ID = "project";

function freezeStrings(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

function uniqueSorted(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)].sort());
}

function bootstrapInputSetNode(): Node {
  return constructNode({
    id: "node:sdlc/bootstrap-input-set",
    name: "BootstrapInputSet",
    schema: {
      kind: "symbolic",
      ref: "schema://sdlc/BootstrapInputSet"
    },
    markov: [],
    assetSurface: {
      kind: "sdlc_bootstrap_input_set",
      requiredContexts: [],
      standardsRefs: ["specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md"],
      outputContractRefs: ["contract://sdlc/bootstrap-input-set"]
    },
    tags: ["sdlc", "bootstrap", "ingress"]
  });
}

function projectNode(): Node {
  return constructNode({
    id: "node:sdlc/project",
    name: "Project",
    schema: {
      kind: "symbolic",
      ref: "schema://sdlc/Project"
    },
    markov: [],
    assetSurface: {
      kind: "sdlc_project",
      requiredContexts: [],
      standardsRefs: ["specification/PRODUCT.md"],
      outputContractRefs: ["contract://sdlc/project"]
    },
    tags: ["sdlc", "project", "typed-target"]
  });
}

function bootstrapOperators(): readonly Operator[] {
  return Object.freeze([
    Object.freeze({
      name: "bootstrap_project_fd_inventory",
      regime: "F_D",
      binding: "operator://sdlc/bootstrap-project/fd-inventory",
      tags: ["bootstrap", "inventory", "checkpoint"]
    }),
    Object.freeze({
      name: "bootstrap_project_fp_normalize",
      regime: "F_P",
      binding: "operator://sdlc/bootstrap-project/fp-normalize",
      tags: ["bootstrap", "normalize", "infer-project"]
    })
  ]);
}

function bootstrapEvaluators(): readonly Evaluator[] {
  return Object.freeze([
    Object.freeze({
      name: "project_output_contract",
      regime: "F_D",
      description:
        "Validates that bootstrap output is a typed Project with embedded lineage.",
      binding: "evaluator://sdlc/bootstrap-project/project-output-contract",
      consumedFieldRefs: ["project.kind", "project.lineage"],
      tags: ["bootstrap", "project", "lineage"]
    }),
    Object.freeze({
      name: "derived_element_lineage_contract",
      regime: "F_D",
      description:
        "Validates that derived project elements carry source-input lineage.",
      binding: "evaluator://sdlc/bootstrap-project/derived-element-lineage",
      consumedFieldRefs: ["derived_elements.lineage"],
      tags: ["bootstrap", "element-lineage"]
    })
  ]);
}

export function constructSdlcBootstrapProjectGraphFunction(): GraphFunction {
  const source = bootstrapInputSetNode();
  const target = projectNode();
  const vector = constructGraphVector({
    id: "graph_vector:sdlc/bootstrap-input-set-to-project",
    name: "BootstrapInputSet->Project",
    source: [source],
    target,
    operators: bootstrapOperators(),
    evaluators: bootstrapEvaluators(),
    contexts: [],
    rule: null,
    allowsSubwork: true,
    declarations: emptySerializedAttrs(),
    tags: ["sdlc", "bootstrap", "lineage"]
  });
  const graph = constructGraph({
    id: "graph:sdlc/bootstrap-project",
    name: "GF_BOOTSTRAP_PROJECT_workflow",
    inputs: [source],
    outputs: [target],
    nodes: [source, target],
    vectors: [vector],
    contexts: [],
    rules: [],
    effects: ["operator://sdlc/bootstrap-project/fd-inventory"],
    tags: ["sdlc", "bootstrap", "lineage"]
  });

  return constructGraphFunction({
    id: "graph_function:sdlc/GF_BOOTSTRAP_PROJECT",
    name: "GF_BOOTSTRAP_PROJECT",
    environment: constructEnvRef({
      requires: [source],
      provides: [target],
      carries: [source, target]
    }),
    inputs: [source],
    outputs: [target],
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: "inline:sdlc/GF_BOOTSTRAP_PROJECT",
      graph,
      version: null
    }),
    effects: ["operator://sdlc/bootstrap-project/fd-inventory"],
    declarations: emptySerializedAttrs(),
    tags: ["sdlc", "bootstrap", "lineage"]
  });
}

export function sdlcRuntimeProvenanceFromTraversal(input: {
  readonly basis: ExecutionBasis;
  readonly probe: TraversalStructureProbe;
}): SdlcRuntimeProvenanceRef {
  if (input.probe.graphFunctionId !== input.basis.graphFunction.id) {
    throw new TypeError("SDLC runtime provenance requires matching graph function");
  }
  if (input.probe.currentVectorIndex === null) {
    throw new TypeError("SDLC runtime provenance requires an active vector");
  }
  const vector = input.basis.graph.vectors[input.probe.currentVectorIndex];
  if (vector === undefined) {
    throw new TypeError("SDLC runtime provenance vector index is out of range");
  }

  return constructSdlcRuntimeProvenanceRef({
    runId: input.basis.runId,
    graphFunctionId: input.basis.graphFunction.id,
    graphFunctionName: input.basis.graphFunction.name,
    vectorId: vector.id,
    vectorName: vector.name,
    transitionKind: input.probe.transitionKind,
    eventKinds: uniqueSorted([
      ...input.probe.iterationEventKinds,
      ...input.probe.transitionEventKinds
    ])
  });
}

function markerValue(marker: string, prefix: string): string | null {
  if (!marker.startsWith(prefix)) {
    return null;
  }
  const value = marker.slice(prefix.length).trim();
  return value.length === 0 ? null : value;
}

function projectName(inputSet: SdlcBootstrapInputSet): string {
  for (const input of inputSet.inputs) {
    for (const marker of input.authorityMarkers) {
      const value = markerValue(marker, "project:");
      if (value !== null) {
        return value;
      }
    }
  }
  return "unknown_project";
}

function slug(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized.length === 0 ? "unknown-project" : normalized;
}

function confidenceForInput(input: SdlcBootstrapInputRef): SdlcDerivationConfidence {
  if (input.kind === "structured") {
    return "high";
  }
  if (input.kind === "loosely_structured") {
    return "medium";
  }
  return "low";
}

function elementTypeForMarker(marker: string): SdlcProjectElementType | null {
  if (markerValue(marker, "project:") !== null) {
    return "project_identity";
  }
  if (markerValue(marker, "intent:") !== null) {
    return "intent_candidate";
  }
  if (markerValue(marker, "requirement:") !== null) {
    return "requirement_candidate";
  }
  return null;
}

function markerText(marker: string, elementType: SdlcProjectElementType): string {
  switch (elementType) {
    case "project_identity":
      return markerValue(marker, "project:") ?? marker;
    case "intent_candidate":
      return markerValue(marker, "intent:") ?? marker;
    case "requirement_candidate":
      return markerValue(marker, "requirement:") ?? marker;
    default: {
      const exhaustive: never = elementType;
      throw new TypeError(`Unsupported SDLC project element type ${JSON.stringify(exhaustive)}`);
    }
  }
}

function assetIdForElementType(elementType: SdlcProjectElementType): string {
  switch (elementType) {
    case "project_identity":
      return PROJECT_ASSET_ID;
    case "intent_candidate":
      return "intent_surface";
    case "requirement_candidate":
      return "requirement_surface";
    default: {
      const exhaustive: never = elementType;
      throw new TypeError(`Unsupported SDLC project element type ${JSON.stringify(exhaustive)}`);
    }
  }
}

function derivedElements(inputSet: SdlcBootstrapInputSet): readonly SdlcProjectElement[] {
  const elements: SdlcProjectElement[] = [];
  let index = 0;

  for (const input of inputSet.inputs) {
    for (const marker of input.authorityMarkers) {
      const elementType = elementTypeForMarker(marker);
      if (elementType === null) {
        continue;
      }
      const text = markerText(marker, elementType);
      elements.push(
        constructSdlcProjectElement({
          id: `project-element:${input.id}:${index}`,
          elementType,
          assetId: assetIdForElementType(elementType),
          text,
          sourceInputIds: [input.id],
          confidence: confidenceForInput(input),
          authorityRefs: [marker]
        })
      );
      index += 1;
    }
  }

  return Object.freeze(elements);
}

function assetLineage(
  inputSet: SdlcBootstrapInputSet,
  runtimeProvenance: SdlcRuntimeProvenanceRef
): readonly SdlcAssetLineageEntry[] {
  return Object.freeze(
    inputSet.inputs.map((input) =>
      constructSdlcAssetLineageEntry({
        id: `asset-lineage:${input.id}:${PROJECT_ASSET_ID}`,
        sourceInputIds: [input.id],
        targetAssetId: PROJECT_ASSET_ID,
        derivationKind: "bootstrap_conformance",
        runtimeProvenance
      })
    )
  );
}

function elementLineage(
  elements: readonly SdlcProjectElement[],
  runtimeProvenance: SdlcRuntimeProvenanceRef
): readonly SdlcElementLineageEntry[] {
  return Object.freeze(
    elements.map((element) =>
      constructSdlcElementLineageEntry({
        id: `element-lineage:${element.id}`,
        sourceInputIds: element.sourceInputIds,
        sourceElementIds: [],
        targetElementId: element.id,
        derivationKind: "authority_marker_projection",
        claim: `${element.elementType} derived from admitted bootstrap input`,
        evidenceRefs: [
          ...element.sourceInputIds.map((id) => `input:${id}`),
          ...element.authorityRefs.map((ref) => `marker:${ref}`)
        ],
        confidence: element.confidence,
        runtimeProvenance
      })
    )
  );
}

function ambiguityEntries(
  inputSet: SdlcBootstrapInputSet,
  runtimeProvenance: SdlcRuntimeProvenanceRef
): readonly SdlcAmbiguityEntry[] {
  return Object.freeze(
    inputSet.inputs
      .filter((input) => input.authorityMarkers.length === 0)
      .map((input) =>
        constructSdlcAmbiguityEntry({
          id: `ambiguity:${input.id}:missing-authority-marker`,
          sourceInputIds: [input.id],
          reason:
            "bootstrap input was admitted but did not carry a project, intent, or requirement authority marker",
          status: "open",
          runtimeProvenance
        })
      )
  );
}

export function deriveSdlcBootstrapProject(
  inputSet: SdlcBootstrapInputSet,
  runtimeProvenance: SdlcRuntimeProvenanceRef
): SdlcProject {
  const elements = derivedElements(inputSet);
  const name = projectName(inputSet);
  const ledger = constructSdlcDerivationLedger({
    id: `derivation-ledger:${inputSet.id}`,
    assetLineage: assetLineage(inputSet, runtimeProvenance),
    elementLineage: elementLineage(elements, runtimeProvenance)
  });

  return constructSdlcProject({
    kind: "sdlc_project",
    id: `project:${slug(name)}`,
    inputSetId: inputSet.id,
    name,
    authoritySurfaceIds: uniqueSorted(elements.map((element) => element.assetId)),
    elements,
    ambiguityEntries: ambiguityEntries(inputSet, runtimeProvenance),
    derivationLedger: ledger
  });
}

export function sourceInputIdsForProjectElement(
  project: SdlcProject,
  elementId: string
): readonly string[] {
  return freezeStrings(
    project.derivationLedger.elementLineage.flatMap((entry) =>
      entry.targetElementId === elementId ? entry.sourceInputIds : []
    )
  );
}

export function lineageEntriesForSourceInput(
  project: SdlcProject,
  inputId: string
): readonly SdlcElementLineageEntry[] {
  return Object.freeze(
    project.derivationLedger.elementLineage.filter((entry) =>
      entry.sourceInputIds.includes(inputId)
    )
  );
}
