// Implements: T-158

import { stableSha256Digest } from "../../../shared/runtime_identity.js";
import type { RuntimeRegime } from "./carriers.js";
import type { GtlProgramPluginResultInterfaceRow } from "./gtl_program_conformance.js";
import type { EngineComputeStageRole } from "./plugins.js";
import { freezeStringArray } from "./runtime_support.js";

export interface AdmittedPluginResultInterfaceContract {
  readonly kind: "admitted_plugin_result_interface_contract";
  readonly resultInterfaceRef: string;
  readonly resultInterfaceContractDigest: string;
  readonly selectionKeyDigest: string;
  readonly stageBindingRef: string;
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly stageRole: EngineComputeStageRole;
  readonly computeMeans: RuntimeRegime;
  readonly resultEnvelopeContractRef: string;
  readonly resultCarrierKind: string;
  readonly outputCarrierRefs: readonly string[];
  readonly producedCarrierRefs: readonly string[];
  readonly requiredIdentityFieldRefs: readonly string[];
  readonly selectorAuthorityRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface AdmittedPluginResultInterfaceCatalog {
  readonly kind: "admitted_plugin_result_interface_catalog";
  readonly catalogRef: string;
  readonly catalogDigest: string;
  readonly interfaces: readonly AdmittedPluginResultInterfaceContract[];
}

export function pluginResultInterfaceSelectionKeyDigest(input: {
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly stageRole: EngineComputeStageRole;
  readonly computeMeans: RuntimeRegime;
  readonly outputCarrierRefs: readonly string[];
}): string {
  return stableSha256Digest({
    compositionRef: input.compositionRef,
    compositionDigest: input.compositionDigest,
    stageRole: input.stageRole,
    computeMeans: input.computeMeans,
    outputCarrierRefs: freezeStringArray(input.outputCarrierRefs)
  });
}

export function constructAdmittedPluginResultInterfaceContract(
  row: GtlProgramPluginResultInterfaceRow
): AdmittedPluginResultInterfaceContract {
  const outputCarrierRefs = freezeStringArray(row.outputCarrierRefs);
  const producedCarrierRefs = freezeStringArray(row.producedCarrierRefs);
  const requiredIdentityFieldRefs = freezeStringArray(
    row.requiredIdentityFieldRefs
  );
  const selectorAuthorityRefs = freezeStringArray(row.selectorAuthorityRefs);
  const evidenceRefs = freezeStringArray(row.evidenceRefs);
  const selectionKeyDigest = pluginResultInterfaceSelectionKeyDigest({
    compositionRef: row.compositionRef,
    compositionDigest: row.compositionDigest,
    stageRole: row.stageRole,
    computeMeans: row.computeMeans,
    outputCarrierRefs
  });
  const digestBasis = Object.freeze({
    resultInterfaceRef: row.resultInterfaceRef,
    stageBindingRef: row.stageBindingRef,
    compositionRef: row.compositionRef,
    compositionDigest: row.compositionDigest,
    stageRole: row.stageRole,
    computeMeans: row.computeMeans,
    resultEnvelopeContractRef: row.resultEnvelopeContractRef,
    resultCarrierKind: row.resultCarrierKind,
    outputCarrierRefs,
    producedCarrierRefs,
    requiredIdentityFieldRefs,
    selectorAuthorityRefs,
    evidenceRefs,
    mayWriteLedgers: row.mayWriteLedgers,
    mayEmitRuntimeEvents: row.mayEmitRuntimeEvents,
    maySelectTraversal: row.maySelectTraversal,
    mayCloseTraversal: row.mayCloseTraversal,
    mayOwnIterationLoop: row.mayOwnIterationLoop
  });
  return Object.freeze({
    kind: "admitted_plugin_result_interface_contract" as const,
    resultInterfaceRef: row.resultInterfaceRef,
    resultInterfaceContractDigest: stableSha256Digest(digestBasis),
    selectionKeyDigest,
    stageBindingRef: row.stageBindingRef,
    compositionRef: row.compositionRef,
    compositionDigest: row.compositionDigest,
    stageRole: row.stageRole,
    computeMeans: row.computeMeans,
    resultEnvelopeContractRef: row.resultEnvelopeContractRef,
    resultCarrierKind: row.resultCarrierKind,
    outputCarrierRefs,
    producedCarrierRefs,
    requiredIdentityFieldRefs,
    selectorAuthorityRefs,
    evidenceRefs
  });
}

export function constructAdmittedPluginResultInterfaceCatalog(input: {
  readonly subjectRef: string;
  readonly interfaces: readonly GtlProgramPluginResultInterfaceRow[];
}): AdmittedPluginResultInterfaceCatalog {
  const interfaces = Object.freeze(
    input.interfaces.map(constructAdmittedPluginResultInterfaceContract)
  );
  const catalogDigest = stableSha256Digest(interfaces);
  return Object.freeze({
    kind: "admitted_plugin_result_interface_catalog" as const,
    catalogRef: `plugin-result-interface-catalog:${stableSha256Digest({
      subjectRef: input.subjectRef,
      catalogDigest
    })}`,
    catalogDigest,
    interfaces
  });
}
