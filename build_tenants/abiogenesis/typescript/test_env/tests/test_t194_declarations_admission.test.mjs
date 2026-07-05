import test from "node:test";
import assert from "node:assert/strict";
import { admitSerializedAttrs } from "../../build/semantic/code/src/gtl/m01/admission/carriers.js";

test("T-194 F6: SerializedAttrs admission fails closed on unknown sibling keys", () => {
  // the exact silent-ignore that cost a live-run cycle: a plain key spread
  // next to entries must throw, not vanish
  assert.throws(
    () =>
      admitSerializedAttrs({
        entries: [],
        runtime_registry_candidate_refs: ["registry-entry://x"]
      }),
    /unknown SerializedAttrs key/u
  );
  // lawful typed carrier still admits
  const admitted = admitSerializedAttrs({
    entries: [
      { key: "runtime_registry_candidate_refs", value: { kind: "string_list", value: ["registry-entry://x"] } }
    ]
  });
  assert.equal(admitted.entries.length, 1);
});

// ── F5: registry ambiguity law (contracts pick law, no runner pre-pick) ──
import {
  admitGtlLibraryEntryDeclaration,
  constructRegistryLookupRequest,
  lookupRuntimeGraphFunctionRegistry,
  projectRuntimeGraphFunctionRegistry,
  selectGraphFunctionFromRegistry
} from "../../build/semantic/code/src/abg/m03/contracts/runtime_graph_function_registry.js";
import { constructGtlLibraryEntryDeclaration } from "../../build/semantic/code/src/gtl/m02/contracts/runtime_registry.js";


function f5Entry(slug, overrides = {}) {
  return constructGtlLibraryEntryDeclaration({
    declarationRef: `gtl-declaration://t194/${slug}`,
    entryRef: `registry-entry://t194/${slug}`,
    libraryScope: "product",
    entryKind: "graph_function",
    namespace: "t194",
    ownerRef: "owner://t194",
    version: "1.0.0",
    graphFunctionRef: "graph-function://t194/toy",
    interfaceRef: "interface://t194/toy",
    sourceContractRef: "contract://t194/source",
    targetContractRef: "contract://t194/target",
    contextRefs: ["context://t194/toy"],
    authorityRefs: ["authority://t194/runtime"],
    overlayRefs: ["overlay://t194/default"],
    provenanceRefs: ["provenance://t194/product"],
    readinessRefs: ["readiness://t194/ready"],
    proofRefs: ["proof://t194/product"],
    policyRefs: ["policy://t194/default"],
    declarationSourceRefs: ["gtl://module/t194/toy"],
    ...overrides
  });
}

function f5Projection() {
  const first = admitGtlLibraryEntryDeclaration({
    declaration: f5Entry("lawful"),
    correlationId: "correlation://t194/lawful"
  });
  const second = admitGtlLibraryEntryDeclaration({
    declaration: f5Entry("decoy", {
      declarationRef: "gtl-declaration://t194/decoy",
      entryRef: "registry-entry://t194/decoy"
    }),
    projection: projectRuntimeGraphFunctionRegistry([first]),
    correlationId: "correlation://t194/decoy"
  });
  return projectRuntimeGraphFunctionRegistry([first, second]);
}

function f5Select(candidateIdentityRefs) {
  const projection = f5Projection();
  const request = constructRegistryLookupRequest({
    lookupRef: "registry-lookup://t194/toy",
    entryKinds: ["graph_function"],
    contextRefs: [],
    authorityRefs: [],
    overlayRefs: [],
    namespaceRefs: [],
    acceptedVersions: [],
    provenanceRefs: [],
    readinessRefs: [],
    proofRefs: [],
    policyRefs: [],
    ...(candidateIdentityRefs === undefined ? {} : { candidateIdentityRefs })
  });
  const lookupResult = lookupRuntimeGraphFunctionRegistry({ projection, request });
  return selectGraphFunctionFromRegistry({
    lookupResult,
    projection,
    selectionRef: "graph-function-selection://t194/toy",
    runtimeBasisRef: "runtime-basis://t194/toy",
    rationaleRef: "rationale://t194/toy",
    correlationId: "correlation://t194/select"
  });
}

test("T-194 F5: unauthorized same-interface ambiguity fails closed (no silent pick)", () => {
  const rejected = f5Select(undefined);
  assert.equal(rejected.kind, "graph_function_selection_rejected");
  assert.equal(rejected.rejectionReason, "no_selected_candidate");
});

test("T-194 F5: a declared candidate constraint lawfully resolves the ambiguity", () => {
  const selected = f5Select(["registry-entry://t194/lawful"]);
  assert.equal(selected.kind, "graph_function_selected");
  assert.equal(selected.selectedEntryRef, "registry-entry://t194/lawful");
});
