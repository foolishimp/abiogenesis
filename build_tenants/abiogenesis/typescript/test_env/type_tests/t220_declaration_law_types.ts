// Validates: REQ-L-GTL3-ATTRS-003
// Validates: REQ-L-GTL3-GRAPHFUNCTION-009
// Validates: REQ-L-GTL3-GRAPHVECTOR-005

import {
  graphFunctionDeclarations,
  graphVectorDeclarations,
  type GraphFunctionDeclarations
} from "../../code/src/gtl/m01/contracts/declaration_law.js";
import {
  pluginSelectionDeclarationEntry
} from "../../code/src/gtl/m01/contracts/execution_declaration_builders.js";

const EMPTY_JSON_OBJECT = {
  kind: "object",
  entries: []
} as const;

export const graphFunctionReservedDeclarations = graphFunctionDeclarations([
  pluginSelectionDeclarationEntry({
    fpDispatch: "plugin://typed/fp-dispatch"
  }),
  {
    key: "product.release_label",
    value: { kind: "scalar", value: "candidate" }
  }
]);

export const graphVectorReservedDeclarations = graphVectorDeclarations([
  {
    key: "abg.runtime_regime",
    value: { kind: "scalar", value: "F_P" }
  },
  {
    key: "gtl.zoom.refinement_boundary_ref",
    value: { kind: "string_list", value: ["refinement://t220"] }
  }
]);

export const graphFunctionRejectsVectorOnlyKey = graphFunctionDeclarations(
  [
    // @ts-expect-error abg.runtime_regime is registered only on GraphVector.
    {
      key: "abg.runtime_regime",
      value: { kind: "scalar", value: "F_P" }
    }
  ]
);

export const graphVectorRejectsFunctionOnlyKey = graphVectorDeclarations(
  [
    // @ts-expect-error abg.plugin_selection is registered only on GraphFunction.
    {
      key: "abg.plugin_selection",
      value: { kind: "json_blob", value: EMPTY_JSON_OBJECT }
    }
  ]
);

export const graphFunctionRejectsWrongValueKind = graphFunctionDeclarations(
  [
    // @ts-expect-error abg.plugin_selection requires a json_blob value.
    {
      key: "abg.plugin_selection",
      value: { kind: "scalar", value: "plugin://invalid" }
    }
  ]
);

export const graphFunctionRejectsUnknownReservedKey =
  graphFunctionDeclarations(
    [
      // @ts-expect-error unregistered abg./gtl. keys cannot author new law.
      {
        key: "abg.unregistered_authority",
        value: { kind: "scalar", value: true }
      }
    ]
  );

export const graphFunctionRejectsDuplicateKeys = graphFunctionDeclarations(
  // @ts-expect-error duplicate declaration authorities fail closed.
  [
    { key: "product.label", value: { kind: "scalar", value: "one" } },
    { key: "product.label", value: { kind: "scalar", value: "two" } }
  ]
);

// @ts-expect-error Host-indexed declaration carriers are not interchangeable.
export const vectorDeclarationsAreNotFunctionDeclarations: GraphFunctionDeclarations =
  graphVectorReservedDeclarations;
