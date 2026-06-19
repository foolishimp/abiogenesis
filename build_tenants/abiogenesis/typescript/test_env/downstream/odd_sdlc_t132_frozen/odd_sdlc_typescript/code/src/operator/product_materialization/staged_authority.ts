import type {
  SdlcDesignDepthRegister,
  SdlcTestDesignRegister,
  SdlcWorkerHandoffManifest,
  SdlcDecompositionSummary,
  SdlcDependencyTraversalSelection,
  SdlcModuleDependencyMap,
  SdlcTestDependencyMap
} from "../carriers.js";import {
  admitImplementationDesignRegisterForManifest,
  admitImplementationDesignRegisterForRuntimeEvaluation
} from "../plugins/evaluate/design_depth_register.js";import {
  admitTestDesignRegisterFromArtifact
} from "../test_design_register.js";import {
  admitSdlcDependencyTraversalSelectedMethodCarrier,
  deriveSdlcTestDependencyMapFromImplementationDependencyMap,
  deriveSdlcUatTestDependencyMapFromTestDependencyMap,
  deriveSdlcStagedImplementationTopologyAuthority,
  deriveSdlcStagedTestTopologyAuthority,
  selectSdlcDependencyMapTraversal
} from "../decomposition_admission.js";import {
  existsSync
} from "node:fs";import {
  join
} from "node:path";import {
  requireOperatorRunArtifactRowForArtifactRef
} from "../../contracts/operator_run_artifact_catalog.js";import {
  tenantLocalSdlcSurfaceRelativePath
} from "./surface_paths.js";

export interface SdlcStagedConstructionAuditCarrier {
  readonly artifactRef: string;
  readonly relativePath: string;
  readonly payload:
    | SdlcDecompositionSummary
    | SdlcModuleDependencyMap
    | SdlcTestDependencyMap
    | SdlcDependencyTraversalSelection;
}

function manifestCapabilityValue(
  manifest: SdlcWorkerHandoffManifest,
  name: string
): string | null {
  return (
    manifest.conformedProject.capabilityContracts?.find(
      (contract) => contract.name === name
    )?.value ?? null
  );
}

function truthyCapabilityValue(value: string | null): boolean {
  const normalized = value?.trim().toLowerCase() ?? "";
  return (
    normalized === "1" ||
    normalized === "true" ||
    normalized === "yes" ||
    normalized === "on"
  );
}

function manifestRequiresTrivialDegenerateProduct(
  manifest: SdlcWorkerHandoffManifest
): boolean {
  return truthyCapabilityValue(manifestCapabilityValue(manifest, "trivial_product"));
}

function stagedAuditCarrier(
  artifactRef: string,
  payload: SdlcStagedConstructionAuditCarrier["payload"]
): SdlcStagedConstructionAuditCarrier {
  const artifact = requireOperatorRunArtifactRowForArtifactRef(artifactRef);
  return Object.freeze({
    artifactRef: artifact.artifactRef,
    relativePath: artifact.relativePath,
    payload
  });
}

function stagedParallelTraversalSelectedMethodCarrier(
  evidenceRefs: readonly string[]
) {
  return admitSdlcDependencyTraversalSelectedMethodCarrier({
    selectedMethod: "parallel",
    evidenceRefs: Object.freeze([
      "selection-policy://odd-sdlc/staged-topology/parallel",
      ...evidenceRefs
    ])
  });
}

function pushUatTestDependencyCarriers(input: {
  readonly carriers: SdlcStagedConstructionAuditCarrier[];
  readonly testDependencyMap: SdlcTestDependencyMap;
  readonly evidenceRefs: readonly string[];
}): void {
  const uatTestDependencyMap =
    deriveSdlcUatTestDependencyMapFromTestDependencyMap({
      testDependencyMap: input.testDependencyMap
    });
  if (uatTestDependencyMap === null) {
    return;
  }
  input.carriers.push(
    stagedAuditCarrier(
      "operator-run-artifact://uat-test-dependency-map",
      uatTestDependencyMap
    ),
    stagedAuditCarrier(
      "operator-run-artifact://uat-test-dependency-traversal-selection",
      selectSdlcDependencyMapTraversal({
        selectionRef: "selection://odd-sdlc/uat-test/staged-topology",
        dependencyMap: uatTestDependencyMap,
        selectedMethodCarrier: stagedParallelTraversalSelectedMethodCarrier(
          Object.freeze([
            ...input.evidenceRefs,
            "surface://uat-test-dependency-map"
          ])
        ),
        policy: "parallel_when_partitioned",
        basisRefs: Object.freeze([
          ...input.evidenceRefs,
          "surface://uat-test-dependency-map"
        ])
      })
    )
  );
}

export function deriveSdlcStagedConstructionAuditCarriers(
  manifest: SdlcWorkerHandoffManifest,
  fpEvaluatorAdmissionEvidenceRefs: readonly string[] = Object.freeze([])
): readonly SdlcStagedConstructionAuditCarrier[] {
  const carriers: SdlcStagedConstructionAuditCarrier[] = [];
  const requireTrivialDegenerateProduct =
    manifestRequiresTrivialDegenerateProduct(manifest);
  let implementationDependencyMap: SdlcModuleDependencyMap | null = null;
  const implementationRegister = readAdmittedImplementationDesign(
    manifest,
    fpEvaluatorAdmissionEvidenceRefs
  );
  if (implementationRegister !== null) {
    const authority = deriveSdlcStagedImplementationTopologyAuthority({
      register: implementationRegister,
      requireTrivialDegenerateProduct
    });
    implementationDependencyMap = authority.dependencyMap;
    carriers.push(
      stagedAuditCarrier(
        "operator-run-artifact://implementation-decomposition-summary",
        authority.summary
      ),
      stagedAuditCarrier(
        "operator-run-artifact://module-dependency-map",
        authority.dependencyMap
      ),
      stagedAuditCarrier(
        "operator-run-artifact://module-dependency-traversal-selection",
        selectSdlcDependencyMapTraversal({
          selectionRef: "selection://odd-sdlc/component-code/staged-topology",
          dependencyMap: authority.dependencyMap,
          selectedMethodCarrier: stagedParallelTraversalSelectedMethodCarrier(
            Object.freeze([
              "surface://implementation-decomposition-summary",
              "surface://module-dependency-map"
            ])
          ),
          policy: "parallel_when_partitioned",
          basisRefs: Object.freeze([
            "surface://implementation-decomposition-summary",
            "surface://module-dependency-map"
          ])
        })
      )
    );
  }

  const testRegister = readAdmittedTestDesign(manifest);
  if (testRegister !== null) {
    const authority = deriveSdlcStagedTestTopologyAuthority({
      register: testRegister,
      requireTrivialDegenerateProduct
    });
    carriers.push(
      stagedAuditCarrier(
        "operator-run-artifact://test-decomposition-summary",
        authority.summary
      ),
      stagedAuditCarrier(
        "operator-run-artifact://test-dependency-map",
        authority.dependencyMap
      ),
      stagedAuditCarrier(
        "operator-run-artifact://test-dependency-traversal-selection",
        selectSdlcDependencyMapTraversal({
          selectionRef: "selection://odd-sdlc/component-test/staged-topology",
          dependencyMap: authority.dependencyMap,
          selectedMethodCarrier: stagedParallelTraversalSelectedMethodCarrier(
            Object.freeze([
              "surface://test-decomposition-summary",
              "surface://test-dependency-map"
            ])
          ),
          policy: "parallel_when_partitioned",
          basisRefs: Object.freeze([
            "surface://test-decomposition-summary",
            "surface://test-dependency-map"
          ])
        })
      )
    );
    pushUatTestDependencyCarriers({
      carriers,
      testDependencyMap: authority.dependencyMap,
      evidenceRefs: Object.freeze([
        "surface://test-decomposition-summary",
        "surface://test-dependency-map"
      ])
    });
  } else if (implementationDependencyMap !== null) {
    const derivedTestDependencyMap =
      deriveSdlcTestDependencyMapFromImplementationDependencyMap({
        moduleDependencyMap: implementationDependencyMap
      });
    if (derivedTestDependencyMap !== null) {
      carriers.push(
        stagedAuditCarrier(
          "operator-run-artifact://test-dependency-map",
          derivedTestDependencyMap
        ),
        stagedAuditCarrier(
          "operator-run-artifact://test-dependency-traversal-selection",
          selectSdlcDependencyMapTraversal({
            selectionRef:
              "selection://odd-sdlc/component-test/implementation-derived-topology",
            dependencyMap: derivedTestDependencyMap,
            selectedMethodCarrier: stagedParallelTraversalSelectedMethodCarrier(
              Object.freeze([
                implementationDependencyMap.mapRef,
                "surface://module-dependency-map",
                "surface://test-dependency-map"
              ])
            ),
            policy: "parallel_when_partitioned",
            basisRefs: Object.freeze([
              implementationDependencyMap.mapRef,
              "surface://module-dependency-map",
              "surface://test-dependency-map"
            ])
          })
        )
      );
      pushUatTestDependencyCarriers({
        carriers,
        testDependencyMap: derivedTestDependencyMap,
        evidenceRefs: Object.freeze([
          implementationDependencyMap.mapRef,
          "surface://module-dependency-map",
          "surface://test-dependency-map"
        ])
      });
    }
  }

  return Object.freeze(carriers);
}

function componentDepthSurfaceFile(
  manifest: SdlcWorkerHandoffManifest,
  targetAssetType: string
): string | null {
  const relativePath = tenantLocalSdlcSurfaceRelativePath(targetAssetType);
  if (relativePath === null) {
    return null;
  }
  return join(manifest.productMaterialization.tenantRoot, relativePath);
}

function readAdmittedImplementationDesign(
  manifest: SdlcWorkerHandoffManifest,
  fpEvaluatorAdmissionEvidenceRefs: readonly string[] = Object.freeze([])
): SdlcDesignDepthRegister | null {
  const admission =
    fpEvaluatorAdmissionEvidenceRefs.length > 0
      ? admitImplementationDesignRegisterForRuntimeEvaluation({
          manifest,
          fpEvaluatorAdmissionEvidenceRefs
        })
      : admitImplementationDesignRegisterForManifest({
          manifest
        });
  return admission.status === "admitted" ? admission.register : null;
}

function readAdmittedTestDesign(
  manifest: SdlcWorkerHandoffManifest
): SdlcTestDesignRegister | null {
  const outputFile = componentDepthSurfaceFile(manifest, "test_design_surface");
  if (outputFile === null || !existsSync(outputFile)) {
    return null;
  }
  const admission = admitTestDesignRegisterFromArtifact({
    targetAssetType: "test_design_surface",
    outputFile
  });
  return admission.status === "admitted" ? admission.register : null;
}
