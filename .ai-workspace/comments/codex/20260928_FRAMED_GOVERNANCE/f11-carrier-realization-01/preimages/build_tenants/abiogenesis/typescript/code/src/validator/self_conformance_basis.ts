import { readFileSync } from "node:fs";
import { join } from "node:path";
import { readRuntimeEventsAtDurablePrefix } from "../abg/event_store.js";
import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import { selectValidatedRuntimeEventPrefix } from "../abg/event_prefix.js";
import { rehydrateExecutionBasisAtPrefix, rehydrateAdmittedImplementationSetAtPrefix } from "../abg/execution_basis.js";
import { projectExactPrefixWorkspaceEnvironment } from "../abg/environment_admission.js";
import { projectOpenedCCallCarrierAtPrefix, projectCCallCarrierPhaseAtPrefix } from "../abg/c_call.js";
import { constructSelfConformanceModulePublication, SELF_CONFORMANCE_IDS as ids } from "../gtl/self_conformance.js";
import { materializeGraph } from "../gtl/materialize.js";
import { modulePublicationSemanticDigest } from "../product/publication.js";
import { sha256Canonical, sha256Bytes } from "../shared/digests.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import type { SelfConformanceOwner } from "./self_conformance_contracts.js";
import { SELF_CONFORMANCE_CATALOG_ASSET_PATH, SELF_CONFORMANCE_CATALOG_CONTRACT_ID } from "./self_conformance.js";
import { resolveQualificationSelfConformanceOwner } from "../abg/qualification_proof.js";

export type { QualificationNativeBasis as QualificationOwnerBasis } from "./qualification_contracts.js";
import type { QualificationNativeBasis as QualificationOwnerBasis } from "./qualification_contracts.js";
const hash = (value: unknown) => sha256Canonical(value as JsonValue);
/** Rehydrates actual native owner truth. A consistent caller data tuple is insufficient. */
export function resolveSelfConformanceOwner(basis: QualificationOwnerBasis, input: unknown, requireCurrent = false): SelfConformanceOwner | null {
  if (typeof input === "object" && input !== null && "qualification" in input) {
    return resolveQualificationSelfConformanceOwner(basis, input, requireCurrent);
  }
  try {
    const events = readRuntimeEventsAtDurablePrefix(basis.predecessorPrefix as DurablePrefixCoordinate, { requireCurrent });
    const prefix = selectValidatedRuntimeEventPrefix(events);
    const opened = events.find(e => e.kind === "c_call_opened" && e.aggregateId === basis.cCallRef);
    if (opened === undefined) return null;
    const execution = rehydrateExecutionBasisAtPrefix(prefix, opened.basisId);
    if (execution === null || execution.basisClass !== "root" || execution.programRef !== ids.programRef || execution.graphFunctionRef !== ids.graphFunctionRef || hash(input) !== execution.rawInputDigest) return null;
    const environment = projectExactPrefixWorkspaceEnvironment(basis.predecessorPrefix as DurablePrefixCoordinate, { ref: execution.workspaceBindingId, digest: execution.workspaceBindingDigest });
    if (environment.kind !== "exact_prefix_workspace_environment") return null;
    const set = rehydrateAdmittedImplementationSetAtPrefix(prefix, execution.implementationSetRef);
    if (set === null || set.implementationSetDigest !== execution.implementationSetDigest) return null;
    const rows = set.rows.filter(row => row.implementationRef === ids.implementationRef && row.implementationBindingRef === ids.implementationBindingRef && row.graphFunctionRef === ids.graphFunctionRef && row.computeRegime === "F_D" && row.inputContractRef === ids.inputContractRef && row.outputContractRef === ids.outputContractRef);
    if (rows.length !== 1) return null;
    const row = rows[0]!;
    const installs = environment.productInstalls.filter(install => install.productId === row.implementationOwnerProductId && install.packageName === row.packageName && install.packageVersion === row.packageVersion);
    if (installs.length !== 1) return null;
    const install = installs[0]!;
    const publication = constructSelfConformanceModulePublication({ productId: install.productId,
      artifactDigest: install.artifactDigest, productContentDigest: install.productContentDigest,
      productManifestDigest: install.manifestDigest, packageName: install.packageName, packageVersion: install.packageVersion });
    if (hash(publication) !== set.publicationDigest || modulePublicationSemanticDigest(publication) !== row.implementationPublicationDigest ||
      install.contributionManifest.publicationBindings.filter(p => p.moduleRef === publication.moduleRef && p.publicationDigest === modulePublicationSemanticDigest(publication)).length !== 1) return null;
    const functions = publication.graphFunctions.filter(g => g.name === ids.graphFunctionRef);
    const programs = publication.programs.filter(p => p.programRef === ids.programRef);
    if (functions.length !== 1 || programs.length !== 1) return null;
    const graphFunction = functions[0]!;
    if (hash(graphFunction) !== execution.graphFunctionDigest || hash(programs[0]) !== execution.programDigest) return null;
    const graph = materializeGraph(graphFunction, { invocationAdmissionRef: execution.invocationAdmissionRef,
      admittedInputRef: execution.rawInputAdmissionRef, admittedInputDigest: execution.rawInputDigest, admittedInput: execution.rawInputValue });
    const call = projectOpenedCCallCarrierAtPrefix(prefix, graph, basis.cCallRef);
    if (call === null || graph.materializationDigest !== execution.graphDigest || call.basisId !== execution.basisRef ||
      call.implementationRef !== ids.implementationRef || call.inputContractRef !== ids.inputContractRef || call.outputContractRef !== ids.outputContractRef ||
      projectCCallCarrierPhaseAtPrefix(prefix, call)?.phase !== "selected_no_evidence") return null;
    const manifest = JSON.parse(readFileSync(join(install.installedRoot, "product-toolchain-manifest.json"), "utf8"));
    if (hash(manifest) !== install.manifestDigest) return null;
    const assetRows = install.publicContracts.filter(row => row.contractId === SELF_CONFORMANCE_CATALOG_CONTRACT_ID);
    if (assetRows.length !== 1 || assetRows[0]!.assetLocator?.path !== SELF_CONFORMANCE_CATALOG_ASSET_PATH) return null;
    const bytes = readFileSync(join(install.installedRoot, SELF_CONFORMANCE_CATALOG_ASSET_PATH));
    if (sha256Bytes(bytes) !== assetRows[0]!.assetLocator!.contentDigest) return null;
    const catalog = JSON.parse(bytes.toString("utf8"));
    return deepFreeze({ installId: install.installId, installDigest: hash(install), artifactDigest: install.artifactDigest,
      productId: install.productId, productVersion: install.packageVersion, productContentDigest: install.productContentDigest,
      manifestDigest: install.manifestDigest, publicationDigest: hash(publication),
      workspaceBinding: { ref: execution.workspaceBindingId, digest: execution.workspaceBindingDigest },
      executionBasis: { ref: execution.basisRef, digest: execution.basisDigest },
      cCallDigest: call.cCallDigest, nativeBasis: basis,
      catalogDigest: sha256Bytes(bytes), catalogRef: catalog.catalogRef, catalogVersion: catalog.catalogVersion,
      catalogAssetPath: SELF_CONFORMANCE_CATALOG_ASSET_PATH });
  } catch { return null; }
}
