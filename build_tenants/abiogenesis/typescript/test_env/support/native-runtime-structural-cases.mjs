// Prospective finite declarations and oracle data. No execution, installation or admission.
export const STRUCTURAL_EXPECTATIONS = Object.freeze({
  atomicInput: { kind: 'hello_world_input', schemaVersion: '5.0.0', subject: 'Qualification' },
  flatInput: { kind: 'hello_world_input', schemaVersion: '5.0.0', subject: '  Qualification  ' },
  normalized: { kind: 'normalized_hello_input', schemaVersion: '5.0.0', subject: 'Qualification' },
  output: { kind: 'hello_world_output', schemaVersion: '5.0.0', message: 'Hello Qualification' },
});
const leaves = t => t.kind === 'c_of' ? [t] : t.kind === 'c_compose' ? t.terms.flatMap(leaves)
  : t.kind === 'c_retry' ? leaves(t.term) : t.kind === 'c_edge' ? [t.transform, t.evaluate, t.consequence] : [];
// Keep the published contracts/bindings/predicates; select only normalization
// followed by rendering instead of the donor's batch/retry/edge demonstration.
export function selectFlatHelloPublication(gtl, publication) {
  const id = gtl.COMPOSED_HELLO_IDS;
  const base = publication.graphFunctions.find(g => g.name === id.graphFunctionRef);
  const source = leaves(base.template.nodes[0].term);
  const of = (locus, index) => { const t = source.find(t => t.programLocusRef === locus);
    return gtl.C.of({ ...t, input: gtl.cCarrier(t.inputCarrierRef), output: gtl.cCarrier(t.outputCarrierRef), vectorIndex: index }); };
  const term = gtl.C.compose(of(id.normalizeLocusRef, 0), of(id.renderLocusRef, 1));
  return gtl.modulePublication({ ...publication, graphFunctions: publication.graphFunctions.map(g => g.name !== base.name ? g
    : { ...g, template: { ...g.template, nodes: [{ ...g.template.nodes[0], term }] } }) });
}

// The existing normalize, normalized evaluator and renderer supply one edge.
// Their roles/contracts and expected values remain consumer declaration data.
export function selectEdgeHelloPublication(gtl, publication) {
  const id = gtl.COMPOSED_HELLO_IDS, base = publication.graphFunctions.find(g => g.name === id.graphFunctionRef);
  const source = leaves(base.template.nodes[0].term);
  const of = (locus, index) => { const t = source.find(t => t.programLocusRef === locus);
    return gtl.C.of({ ...t, input: gtl.cCarrier(t.inputCarrierRef), output: gtl.cCarrier(t.outputCarrierRef), vectorIndex: index }); };
  const term = gtl.C.edge({ transform: of(id.normalizeLocusRef, 0), evaluate: of(id.edgeEvaluateLocusRef, 1), consequence: of(id.renderLocusRef, 2) });
  return gtl.modulePublication({ ...publication, graphFunctions: publication.graphFunctions.map(g => g.name !== base.name ? g
    : { ...g, template: { ...g.template, nodes: [{ ...g.template.nodes[0], term }] } }) });
}
