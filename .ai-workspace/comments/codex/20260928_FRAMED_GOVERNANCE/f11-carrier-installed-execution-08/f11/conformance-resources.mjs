// Pure external Public caller input construction. No invocation, facts or authority.
// Owning contract: frozen C03 validator/conformance_definition_bindings.ts:72-79,329-335.
export function declaredInventoryConformanceResources({
  publication, program, conformanceLaw, declaredInventory, catalog, catalogView,
}) {
  return {
    kind: 'conformance_evaluation_resource_assertion',
    schemaVersion: '5.0.0',
    packet: {
      kind: 'conformance_evaluate_packet',
      schemaVersion: '5.0.0',
      memberKey: 'gtl_program',
      publication,
      program,
    },
    conformanceLaw,
    declaredInventory,
    declarationCatalog: { catalog, catalogView },
  };
}
