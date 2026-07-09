// T-217 witness-suite shared fixtures (self-review C-8: the declaration
// and startup-config builders had drifted into per-file copies with two
// signatures). ONE signature: refs derive from (namespace, subject), so
// each caller keeps its existing ref universe and digests byte-stable.
import {
  constructGtlLibraryEntryDeclaration,
  constructProductRegistryStartupConfig
} from "../../../build/semantic/code/src/index.js";

export function t217Declaration({
  namespace,
  subject = "witness-subject",
  contentMarker,
  graphFunctionRef = `graph-function://${namespace}/${subject}`
}) {
  return constructGtlLibraryEntryDeclaration({
    declarationRef: `gtl-declaration://${namespace}/${subject}`,
    entryRef: `registry-entry://${namespace}/${subject}`,
    libraryScope: "product",
    entryKind: "graph_function",
    namespace: namespace.replaceAll("/", "."),
    ownerRef: "owner://abg/t217",
    version: "4.6.0-dev",
    graphFunctionRef,
    interfaceRef: `interface://${namespace}/${subject}`,
    sourceContractRef: `contract://${namespace}/source`,
    targetContractRef: `contract://${namespace}/target`,
    contextRefs: [`context://${namespace}`],
    authorityRefs: [`authority://${namespace}/abg-runtime`],
    overlayRefs: [`overlay://${namespace}/${subject}`],
    provenanceRefs: [`provenance://${namespace}`],
    readinessRefs: [`readiness://${namespace}`],
    proofRefs: [`proof://${namespace}/${contentMarker}`],
    policyRefs: [`policy://${namespace}`],
    declarationSourceRefs: [`gtl://module/${namespace}`]
  });
}

export function t217StartupConfig({ namespace, subject = "witness-subject" }) {
  return constructProductRegistryStartupConfig({
    configRef: `product-registry-startup://${namespace}`,
    productNamespace: namespace.replaceAll("/", "."),
    ownerRef: "owner://abg/t217",
    version: "4.6.0-dev",
    enabledLibraryRefs: [
      `registry-entry://${namespace}/${subject}`,
      `gtl-declaration://${namespace}/${subject}`,
      `gtl://module/${namespace}`
    ],
    overlayRefs: [`overlay://${namespace}/${subject}`],
    pluginRefs: [`plugin://${namespace}/fp-worker`],
    readinessRefs: [`readiness://${namespace}`],
    proofRefs: [`proof://${namespace}`],
    policyRefs: [`policy://${namespace}`],
    configSourceRefs: [`config://${namespace}`]
  });
}
