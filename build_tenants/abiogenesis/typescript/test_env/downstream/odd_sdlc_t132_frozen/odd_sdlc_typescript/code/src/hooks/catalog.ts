// Implements: REQ-F-ODDSDLC-013
// Implements: REQ-F-ODDSDLC-014
// Implements: REQ-F-ODDSDLC-015

import {
  FG_CONFORM_PROJECT_AUTHORITY,
  FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
  SDLC_FUNCTION_CATALOG,
  SDLC_REUSABLE_GRAPH_FUNCTION_CATALOG
} from "../graph/index.js";
import type { SdlcHookContract, SdlcHookEdgeClass } from "./carriers.js";
import { hookTargetPolicyForTarget } from "./policy.js";

function evaluatorPrefixForClass(edgeClass: SdlcHookEdgeClass): string {
  return edgeClass.replaceAll("_", "-");
}

function constructHookContract(input: {
  readonly edgeName: string;
  readonly inputs: readonly string[];
  readonly outputs: readonly string[];
}): SdlcHookContract {
  const targetAssetType = input.outputs[0];
  if (targetAssetType === undefined) {
    throw new TypeError(`${input.edgeName}: expected at least one target output`);
  }
  const edgeClass = hookTargetPolicyForTarget(targetAssetType).edgeClass;
  const evaluatorPrefix = evaluatorPrefixForClass(edgeClass);
  const ticketWorkflowTransformProfile =
    targetAssetType === "ticket_work_item_route_surface"
      ? Object.freeze({
          kind: "sdlc_hook_transform_profile" as const,
          preflightFd: Object.freeze([
            "ticket-workflow-authority-projection-fd",
            "ticket-execution-contract-admitted-fd",
            "ticket-review-ruling-table-fd"
          ]),
          constructiveFp:
            "fp://odd-sdlc/ticket-workflow/route-ticket-work-item",
          capabilityFd: Object.freeze([
            "ticket-workflow-output-contract-fd"
          ]),
          postflightFd: Object.freeze([
            "ticket-work-item-route-surface-fd",
            "ticket-continuation-pressure-preserved-fd"
          ]),
          fhGate: null
        })
      : null;
  return Object.freeze({
    kind: "sdlc_hook_contract",
    edgeName: input.edgeName,
    edgeClass,
    sourceAssetTypes: Object.freeze([...input.inputs]),
    targetAssetType,
    transformProfile: ticketWorkflowTransformProfile ?? Object.freeze({
      kind: "sdlc_hook_transform_profile",
      preflightFd: Object.freeze([
        "core-binding-identity-provenance-fd",
        `${evaluatorPrefix}-dependency-surfaces-present`
      ]),
      constructiveFp: "fp://odd-sdlc/generic-software-domain-constructor",
      capabilityFd: Object.freeze([]),
      postflightFd: Object.freeze([
        "core-work-report-shape-fd",
        "generated-asset-contract-fd",
        `${evaluatorPrefix}-postflight-consistency`
      ]),
      fhGate: null
    }),
    workReportContract: Object.freeze({
      kind: "sdlc_work_report_contract",
      requiredFields: Object.freeze([
        "targetBinding",
        "operationType",
        "evidenceRefs",
        "inputIdentities",
        "outputIdentity",
        "generatedAssetAuthority",
        "generatedAssetContract",
        "ambiguityCandidates"
      ]),
      requireGraphFunctionAuthority: true,
      requireTargetBinding: true,
      requireEvidenceRefs: true,
      requireInputOutputIdentity: true,
      requireGeneratedAssetAttestation: true,
      preserveAmbiguityCandidates: true
    }),
    closurePolicy: Object.freeze({
      kind: "sdlc_hook_closure_policy",
      postflightFdRequired: true,
      generatedAssetContractMustPass: true,
      traceTagsAloneSufficient: false,
      nextTraversalSelectionAuthority: "abg_runtime",
      maySelectNextTraversal: false,
      unresolvedOutcomeAuthority: "abg_retry_repair",
      continuationEvidenceRequired: true
    })
  });
}

export function constructSdlcHookContractCatalog(): readonly SdlcHookContract[] {
  const reusableDispatchFunctions = SDLC_REUSABLE_GRAPH_FUNCTION_CATALOG.filter(
    (entry) =>
      entry.name === FG_CONFORM_PROJECT_AUTHORITY ||
      entry.name === FG_MATERIALIZE_DECLARED_PRODUCT_ASSET
  );
  return Object.freeze(
    [...SDLC_FUNCTION_CATALOG, ...reusableDispatchFunctions].map((entry) =>
      constructHookContract({
        edgeName: entry.name,
        inputs: entry.inputs,
        outputs: entry.outputs
      })
    )
  );
}

export function hookContractByEdgeName(edgeName: string): SdlcHookContract {
  const matched = constructSdlcHookContractCatalog().find(
    (contract) => contract.edgeName === edgeName
  );
  if (matched === undefined) {
    throw new TypeError(`SdlcHookContractCatalog: unknown edge ${edgeName}`);
  }
  return matched;
}
